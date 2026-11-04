import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import { donationSchema } from "./validation.js";

const statusForEvent = {
  PAYMENT_CONFIRMED: "PAID",
  PAYMENT_RECEIVED: "PAID",
  PAYMENT_CREATED: "PENDING",
  PAYMENT_OVERDUE: "OVERDUE",
  PAYMENT_DELETED: "CANCELLED",
  PAYMENT_REFUNDED: "REFUNDED",
  PAYMENT_PARTIALLY_REFUNDED: "PARTIALLY_REFUNDED",
  PAYMENT_CHARGEBACK_REQUESTED: "UNDER_REVIEW",
  PAYMENT_RECEIVED_IN_CASH_UNDONE: "REFUNDED",
};

const asyncHandler = (handler) => (request, response, next) => {
  Promise.resolve(handler(request, response, next)).catch(next);
};

function tokensMatch(received, expected) {
  if (!received || !expected) return false;
  const receivedDigest = createHmac("sha256", "calmae-webhook").update(received).digest();
  const expectedDigest = createHmac("sha256", "calmae-webhook").update(expected).digest();
  return timingSafeEqual(receivedDigest, expectedDigest);
}

function secureStringMatches(received, expected) {
  if (typeof received !== "string" || typeof expected !== "string" || !expected) return false;
  const receivedDigest = createHmac("sha256", "calmae-dashboard").update(received).digest();
  const expectedDigest = createHmac("sha256", "calmae-dashboard").update(expected).digest();
  return timingSafeEqual(receivedDigest, expectedDigest);
}

function dashboardAuthorized(header, password) {
  if (!password || typeof header !== "string") return false;
  const match = /^Basic ([A-Za-z0-9+/]+={0,2})$/i.exec(header);
  if (!match) return false;

  let credentials;
  try {
    credentials = Buffer.from(match[1], "base64").toString("utf8");
  } catch {
    return false;
  }
  const separator = credentials.indexOf(":");
  return separator > 0
    && credentials.slice(0, separator) === "admin"
    && secureStringMatches(credentials.slice(separator + 1), password);
}

const paymentStatusRank = {
  PENDING: 0,
  OVERDUE: 1,
  CANCELLED: 1,
  PAID: 2,
  UNDER_REVIEW: 3,
  PARTIALLY_REFUNDED: 4,
  REFUNDED: 5,
};

function refundedAmountFor(event, payment) {
  if (event === "PAYMENT_REFUNDED" || event === "PAYMENT_RECEIVED_IN_CASH_UNDONE") {
    const amount = Number(payment.value);
    return Number.isFinite(amount) && amount > 0 ? amount : null;
  }
  if (event !== "PAYMENT_PARTIALLY_REFUNDED") return null;

  if (payment.refundedValue != null && Number.isFinite(Number(payment.refundedValue))) {
    return Number(payment.refundedValue);
  }
  if (Array.isArray(payment.refunds)) {
    const amounts = payment.refunds.map((refund) => Number(refund.value));
    if (amounts.every(Number.isFinite)) {
      return amounts.reduce((total, amount) => total + amount, 0);
    }
  }
  return null;
}

export function createApp({ pool, asaas, frontendOrigin, webhookToken, dashboardPassword }) {
  if (dashboardPassword && Buffer.byteLength(dashboardPassword, "utf8") < 16) {
    throw new Error("DASHBOARD_PASSWORD must be at least 16 characters long.");
  }

  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(cors({
    origin: frontendOrigin,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "asaas-access-token", "Authorization"],
  }));
  app.use(express.json({ limit: "20kb" }));

  app.get("/api/health", asyncHandler(async (_request, response) => {
    try {
      await pool.query("SELECT 1");
      response.json({ status: "ok" });
    } catch {
      response.status(503).json({ status: "unavailable" });
    }
  }));

  app.get("/api/referral-codes/:code/validate", asyncHandler(async (request, response) => {
    const code = request.params.code.trim().toUpperCase();
    if (!/^[A-Z0-9][A-Z0-9_-]{0,31}$/.test(code)) {
      return response.json({ valid: false });
    }
    const result = await pool.query(
      "SELECT 1 FROM referral_codes WHERE code = $1 AND is_active = TRUE",
      [code],
    );
    return response.json({ valid: result.rowCount > 0 });
  }));

  app.get("/api/admin/referral-report", rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
  }), asyncHandler(async (request, response) => {
    response.set("Cache-Control", "no-store");
    if (!dashboardPassword) {
      return response.status(503).json({ error: "O painel ainda não está configurado." });
    }
    if (!dashboardAuthorized(request.get("authorization"), dashboardPassword)) {
      return response.status(401).json({ error: "Senha incorreta." });
    }

    const result = await pool.query(`
      WITH totals AS (
        SELECT
          d.referral_code,
          COUNT(DISTINCT d.id) FILTER (WHERE dp.asaas_payment_id IS NOT NULL)::int AS donations_count,
          COUNT(dp.asaas_payment_id) FILTER (WHERE dp.was_paid)::int AS paid_payments_count,
          COALESCE(SUM(dp.amount) FILTER (WHERE dp.was_paid), 0)::numeric(14, 2) AS paid_amount,
          COUNT(dp.asaas_payment_id) FILTER (WHERE dp.status = 'PENDING')::int AS pending_payments_count,
          COALESCE(SUM(dp.amount) FILTER (WHERE dp.status = 'PENDING'), 0)::numeric(14, 2) AS pending_amount,
          COUNT(dp.asaas_payment_id) FILTER (WHERE dp.status = 'OVERDUE')::int AS overdue_payments_count,
          COALESCE(SUM(dp.amount) FILTER (WHERE dp.status = 'OVERDUE'), 0)::numeric(14, 2) AS overdue_amount,
          COUNT(dp.asaas_payment_id) FILTER (WHERE dp.status IN ('REFUNDED', 'PARTIALLY_REFUNDED'))::int AS refunded_payments_count,
          COALESCE(SUM(dp.refunded_amount), 0)::numeric(14, 2) AS refunded_amount,
          COUNT(dp.asaas_payment_id) FILTER (
            WHERE dp.status = 'PARTIALLY_REFUNDED' AND dp.refunded_amount IS NULL
          )::int AS unknown_partial_refunds_count,
          (
            COALESCE(SUM(dp.amount) FILTER (WHERE dp.was_paid), 0)
            - COALESCE(SUM(dp.refunded_amount), 0)
          )::numeric(14, 2) AS net_amount,
          COUNT(dp.asaas_payment_id) FILTER (WHERE dp.status = 'UNDER_REVIEW')::int AS under_review_payments_count
        FROM donations d
        LEFT JOIN donation_payments dp ON dp.donation_id = d.id
        GROUP BY d.referral_code
      ),
      categories AS (
        SELECT code AS referral_code, code AS label, is_active FROM referral_codes
        UNION ALL
        SELECT NULL::text, 'Sem código', NULL::boolean
      )
      SELECT
        categories.label AS code,
        categories.is_active,
        COALESCE(totals.donations_count, 0)::int AS donations_count,
        COALESCE(totals.paid_payments_count, 0)::int AS paid_payments_count,
        COALESCE(totals.paid_amount, 0)::text AS paid_amount,
        COALESCE(totals.pending_payments_count, 0)::int AS pending_payments_count,
        COALESCE(totals.pending_amount, 0)::text AS pending_amount,
        COALESCE(totals.overdue_payments_count, 0)::int AS overdue_payments_count,
        COALESCE(totals.overdue_amount, 0)::text AS overdue_amount,
        COALESCE(totals.refunded_payments_count, 0)::int AS refunded_payments_count,
        COALESCE(totals.refunded_amount, 0)::text AS refunded_amount,
        COALESCE(totals.unknown_partial_refunds_count, 0)::int AS unknown_partial_refunds_count,
        COALESCE(totals.net_amount, 0)::text AS net_amount,
        COALESCE(totals.under_review_payments_count, 0)::int AS under_review_payments_count
      FROM categories
      LEFT JOIN totals ON totals.referral_code IS NOT DISTINCT FROM categories.referral_code
      ORDER BY categories.referral_code NULLS FIRST
    `);
    return response.json({ rows: result.rows });
  }));

  app.post("/api/donations", rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_request, response) => response.status(429).json({
      error: "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.",
    }),
  }));

  app.post("/api/donations", asyncHandler(async (request, response) => {
    const parsed = donationSchema.safeParse(request.body);
    if (!parsed.success) {
      return response.status(400).json({
        error: parsed.error.issues[0]?.message || "Confira os dados da doação.",
      });
    }

    const donor = parsed.data;
    if (donor.referralCode) {
      const referral = await pool.query(
        "SELECT 1 FROM referral_codes WHERE code = $1 AND is_active = TRUE",
        [donor.referralCode],
      );
      if (!referral.rowCount) {
        return response.status(400).json({ error: "O código de indicação não está ativo." });
      }
    }
    const newDonationId = randomUUID();
    const billingType = donor.paymentMethod;
    const inserted = await pool.query(
      `INSERT INTO donations (id, request_id, amount, frequency, billing_type, referral_code, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'CREATING')
       ON CONFLICT (request_id) DO NOTHING
       RETURNING id`,
      [newDonationId, donor.requestId, donor.amount, donor.frequency, billingType, donor.referralCode || null],
    );
    let donationId = inserted.rows[0]?.id;
    if (!inserted.rowCount) {
      const existing = await pool.query(
        `SELECT id, amount, frequency, billing_type, referral_code, checkout_url, status,
                asaas_payment_id, asaas_subscription_id
         FROM donations WHERE request_id = $1`,
        [donor.requestId],
      );
      const previous = existing.rows[0];
      if (
        previous
        && Number(previous.amount) === donor.amount
        && previous.frequency === donor.frequency
        && previous.billing_type === billingType
        && (previous.referral_code || null) === (donor.referralCode || null)
        && previous.checkout_url
      ) {
        return response.json({ checkoutUrl: previous.checkout_url });
      }
      if (previous?.status === "RETRYABLE"
        && !previous.asaas_payment_id
        && !previous.asaas_subscription_id
        && !previous.checkout_url) {
        const retry = await pool.query(
          `UPDATE donations
           SET amount = $1, frequency = $2, billing_type = $3, referral_code = $4,
               status = 'CREATING', updated_at = NOW()
           WHERE id = $5
             AND status = 'RETRYABLE'
             AND asaas_payment_id IS NULL
             AND asaas_subscription_id IS NULL
             AND checkout_url IS NULL
           RETURNING id`,
          [donor.amount, donor.frequency, billingType, donor.referralCode || null, previous.id],
        );
        if (retry.rowCount) {
          donationId = retry.rows[0].id;
        } else {
          return response.status(409).json({
            error: "A tentativa foi retomada em outra solicitação. Aguarde antes de tentar novamente.",
          });
        }
      } else {
        return response.status(409).json({
          error: "Não foi possível confirmar o resultado da tentativa anterior. Confira no Asaas se existe uma cobrança antes de iniciar outra, para evitar duplicidade.",
        });
      }
    }

    let subscriptionId;
    let externalPaymentOrSubscriptionCreated = false;
    try {
      const customer = await asaas.createCustomer(donor);
      let payment;
      if (donor.frequency === "monthly") {
        const subscription = await asaas.createSubscription({
          customerId: customer.id,
          amount: donor.amount,
          billingType,
          externalReference: donationId,
          nextDueDate: asaas.nextDueDate(),
        });
        subscriptionId = subscription.id;
        externalPaymentOrSubscriptionCreated = true;
        const payments = await asaas.getSubscriptionPayments(subscription.id);
        payment = payments.data?.[0];
      } else {
        payment = await asaas.createPayment({
          customerId: customer.id,
          amount: donor.amount,
          billingType,
          externalReference: donationId,
          dueDate: asaas.nextDueDate(),
        });
        externalPaymentOrSubscriptionCreated = Boolean(payment?.id);
      }

      const checkoutUrl = payment?.invoiceUrl;
      const checkout = checkoutUrl ? new URL(checkoutUrl) : null;
      if (!checkout || !asaas.isValidCheckoutUrl(checkoutUrl) || !payment.id) {
        if (subscriptionId) await asaas.deleteSubscription(subscriptionId);
        throw new Error("O Asaas não retornou uma fatura válida para pagamento.");
      }

      await pool.query(
        `UPDATE donations
         SET asaas_customer_id = $1, asaas_payment_id = $2,
             asaas_subscription_id = $3, checkout_url = $4,
             status = 'PENDING', updated_at = NOW()
         WHERE id = $5`,
        [customer.id, payment.id, subscriptionId || null, checkoutUrl, donationId],
      );
      const paymentAmount = Number.isFinite(Number(payment.value)) && Number(payment.value) > 0
        ? Number(payment.value)
        : donor.amount;
      await pool.query(
        `INSERT INTO donation_payments (asaas_payment_id, donation_id, amount, status, due_date)
         VALUES ($1, $2, $3, 'PENDING', $4)
         ON CONFLICT (asaas_payment_id) DO NOTHING`,
        [payment.id, donationId, paymentAmount, payment.dueDate || asaas.nextDueDate()],
      );

      return response.status(201).json({ checkoutUrl });
    } catch (error) {
      if (subscriptionId && error.message !== "O Asaas não retornou uma fatura válida para pagamento.") {
        try {
          await asaas.deleteSubscription(subscriptionId);
        } catch {
          console.error("Falha ao cancelar uma assinatura incompleta no Asaas.");
        }
      }
      const safelyRetryable = error.status === 400 && !externalPaymentOrSubscriptionCreated;
      if (safelyRetryable) {
        await pool.query(
          "UPDATE donations SET status = 'RETRYABLE', updated_at = NOW() WHERE id = $1",
          [donationId],
        );
      }
      console.error("Falha ao criar checkout de doação:", error.name || "Error");
      const status = Number.isInteger(error.status) ? error.status : 502;
      return response.status(status).json({
        error: safelyRetryable
          ? error.message
          : "Não foi possível confirmar se o Asaas criou a cobrança. Confira o painel do Asaas antes de tentar novamente para evitar duplicidade.",
      });
    }
  }));

  app.post("/api/webhooks/asaas", asyncHandler(async (request, response) => {
    if (!tokensMatch(request.get("asaas-access-token"), webhookToken)) {
      return response.status(401).json({ error: "Unauthorized" });
    }

    const { id: eventId, event, payment } = request.body || {};
    if (typeof eventId !== "string" || typeof event !== "string" || !payment?.id) {
      return response.status(400).json({ error: "Invalid webhook event" });
    }

    const status = statusForEvent[event];
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const inserted = await client.query(
        `INSERT INTO asaas_webhook_events (event_id, event_name)
         VALUES ($1, $2)
         ON CONFLICT (event_id) DO NOTHING`,
        [eventId, event],
      );
      if (inserted.rowCount && status) {
        const donationResult = await client.query(
          `SELECT id, amount
           FROM donations
           WHERE asaas_payment_id = $1
              OR ($2::text IS NOT NULL AND asaas_subscription_id = $2)
           ORDER BY (asaas_payment_id = $1) DESC
           LIMIT 1
           FOR UPDATE`,
          [payment.id, payment.subscription || null],
        );
        const donation = donationResult.rows[0];
        if (donation) {
          const amount = Number.isFinite(Number(payment.value)) && Number(payment.value) > 0
            ? Number(payment.value)
            : Number(donation.amount);
          const refundedAmount = refundedAmountFor(event, payment);
          const previousResult = await client.query(
            "SELECT status, was_paid, paid_at, refunded_amount FROM donation_payments WHERE asaas_payment_id = $1 FOR UPDATE",
            [payment.id],
          );
          const previous = previousResult.rows[0];
          const nextStatus = previous
            && paymentStatusRank[previous.status] > paymentStatusRank[status]
            ? previous.status
            : status;
          const paid = Boolean(previous?.was_paid) || status === "PAID";
          const paidAt = previous?.paid_at || (status === "PAID"
            ? payment.paymentDate || payment.confirmedDate || new Date().toISOString()
            : null);
          const refundValue = refundedAmount ?? previous?.refunded_amount ?? null;

          await client.query(
            `INSERT INTO donation_payments
               (asaas_payment_id, donation_id, amount, status, was_paid, refunded_amount, due_date, paid_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT (asaas_payment_id) DO UPDATE
             SET status = EXCLUDED.status,
                 was_paid = donation_payments.was_paid OR EXCLUDED.was_paid,
                 refunded_amount = EXCLUDED.refunded_amount,
                 due_date = COALESCE(EXCLUDED.due_date, donation_payments.due_date),
                 paid_at = COALESCE(donation_payments.paid_at, EXCLUDED.paid_at),
                 updated_at = NOW()`,
            [
              payment.id,
              donation.id,
              amount,
              nextStatus,
              paid,
              refundValue,
              payment.dueDate || null,
              paidAt,
            ],
          );
          await client.query(
            `UPDATE donations
             SET status = $1, updated_at = NOW()
             WHERE id = $2`,
            [nextStatus, donation.id],
          );
        }
      }
      await client.query("COMMIT");
      return response.status(200).json({ received: true });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Falha ao processar webhook do Asaas:", error.name || "Error");
      return response.status(500).json({ error: "Webhook processing failed" });
    } finally {
      client.release();
    }
  }));

  app.use((error, _request, response, _next) => {
    if (error instanceof SyntaxError && "body" in error) {
      return response.status(400).json({ error: "JSON inválido." });
    }
    console.error("Erro não tratado na API:", error.name || "Error");
    return response.status(500).json({ error: "Ocorreu um erro inesperado." });
  });

  return app;
}
