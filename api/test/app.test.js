import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";

async function withServer(app, run) {
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  try {
    const { port } = server.address();
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
}

test("creates a pending checkout and stores referral attribution without donor personal data", async () => {
  const databaseCalls = [];
  const pool = {
    async query(sql, values) {
      databaseCalls.push({ sql, values });
      if (sql.includes("SELECT 1 FROM referral_codes")) return { rowCount: 1 };
      if (sql.includes("INSERT INTO donations")) return { rowCount: 1, rows: [{ id: "donation-id" }] };
      return { rowCount: 1, rows: [{ id: "donation-id" }] };
    },
    async connect() {
      throw new Error("Webhook connection not expected in this test");
    },
  };
  const asaas = {
    nextDueDate: () => "2026-10-22",
    isValidCheckoutUrl: (url) => url === "https://sandbox.asaas.com/i/test",
    async createCustomer(donor) {
      assert.equal(donor.email, "doador@example.org");
      return { id: "customer-id" };
    },
    async createPayment() {
      return { id: "payment-id", invoiceUrl: "https://sandbox.asaas.com/i/test" };
    },
  };
  const app = createApp({
    pool,
    asaas,
    frontendOrigin: "https://calmae.example.org",
    webhookToken: "test-webhook-token",
  });

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/donations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requestId: "0ea3e0ec-f35d-4fad-8c02-19ab7dd81442",
        amount: 50,
        frequency: "once",
        paymentMethod: "PIX",
        name: "Pessoa Doadora",
        email: "doador@example.org",
        cpfCnpj: "12345678901",
        phone: "11912345678",
        referralCode: "ANJO",
      }),
    });

    assert.equal(response.status, 201);
    assert.deepEqual(await response.json(), { checkoutUrl: "https://sandbox.asaas.com/i/test" });
    assert.equal(databaseCalls.length, 4);
    assert.equal(databaseCalls[0].values.includes("doador@example.org"), false);
    assert.equal(databaseCalls[0].values.includes("Pessoa Doadora"), false);
    assert.equal(databaseCalls.find(({ sql }) => sql.includes("INSERT INTO donations")).values[5], "ANJO");
    assert.equal(databaseCalls.find(({ sql }) => sql.includes("INSERT INTO donation_payments")).values[0], "payment-id");
  });
});

test("rejects an invalid request before contacting the database", async () => {
  const pool = {
    async query() {
      throw new Error("Database should not be used for invalid input");
    },
  };
  const app = createApp({
    pool,
    asaas: {},
    frontendOrigin: "https://calmae.example.org",
    webhookToken: "test-webhook-token",
  });

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/donations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: -10 }),
    });
    assert.equal(response.status, 400);

    const lowBoleto = await fetch(`${baseUrl}/api/donations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requestId: "2ea3e0ec-f35d-4fad-8c02-19ab7dd81442",
        amount: 0.01,
        frequency: "once",
        paymentMethod: "BOLETO",
        name: "Pessoa Doadora",
        email: "doador@example.org",
        cpfCnpj: "12345678901",
        phone: "11912345678",
      }),
    });
    assert.equal(lowBoleto.status, 400);
    assert.match((await lowBoleto.json()).error, /mínimo.*R\$ 5,00/);
  });
});

test("reuses a definitively rejected request with corrected values without duplicating a charge", async () => {
  let donation;
  const asaasAmounts = [];
  const pool = {
    async query(sql, values) {
      if (sql.includes("INSERT INTO donations")) {
        if (donation) return { rowCount: 0, rows: [] };
        donation = {
          id: values[0],
          request_id: values[1],
          amount: values[2],
          frequency: values[3],
          billing_type: values[4],
          referral_code: values[5],
          status: "CREATING",
          asaas_payment_id: null,
          asaas_subscription_id: null,
          checkout_url: null,
        };
        return { rowCount: 1, rows: [{ id: donation.id }] };
      }
      if (sql.includes("SELECT id, amount")) return { rowCount: 1, rows: [donation] };
      if (sql.includes("SET amount = $1")) {
        if (donation.status !== "RETRYABLE" || donation.asaas_payment_id || donation.asaas_subscription_id) {
          return { rowCount: 0, rows: [] };
        }
        [donation.amount, donation.frequency, donation.billing_type, donation.referral_code] = values;
        donation.status = "CREATING";
        return { rowCount: 1, rows: [{ id: donation.id }] };
      }
      if (sql.includes("SET asaas_customer_id")) {
        donation.asaas_payment_id = values[1];
        donation.checkout_url = values[3];
        donation.status = "PENDING";
        return { rowCount: 1, rows: [] };
      }
      if (sql.includes("INSERT INTO donation_payments")) return { rowCount: 1, rows: [] };
      if (sql.includes("SET status = 'RETRYABLE'")) {
        donation.status = "RETRYABLE";
        return { rowCount: 1, rows: [] };
      }
      return { rowCount: 1, rows: [] };
    },
  };
  const asaas = {
    nextDueDate: () => "2026-11-05",
    isValidCheckoutUrl: (url) => url === "https://www.asaas.com/i/test",
    async createCustomer() {
      return { id: "customer-id" };
    },
    async createPayment({ amount }) {
      asaasAmounts.push(amount);
      if (amount === 5) {
        const error = new Error("Boleto indisponível para esse valor.");
        error.status = 400;
        throw error;
      }
      return { id: "payment-id", value: amount, invoiceUrl: "https://www.asaas.com/i/test" };
    },
  };
  const app = createApp({
    pool,
    asaas,
    frontendOrigin: "https://calmae.example.org",
    webhookToken: "test-webhook-token",
  });
  const payload = {
    requestId: "4ea3e0ec-f35d-4fad-8c02-19ab7dd81442",
    amount: 5,
    frequency: "once",
    paymentMethod: "BOLETO",
    name: "Pessoa Doadora",
    email: "doador@example.org",
    cpfCnpj: "12345678901",
    phone: "11912345678",
  };

  await withServer(app, async (baseUrl) => {
    const rejected = await fetch(`${baseUrl}/api/donations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    assert.equal(rejected.status, 400);
    assert.equal(donation.status, "RETRYABLE");

    const retried = await fetch(`${baseUrl}/api/donations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, amount: 10 }),
    });
    assert.equal(retried.status, 201);
    assert.deepEqual(asaasAmounts, [5, 10]);
    assert.equal(donation.amount, 10);
    assert.equal(donation.status, "PENDING");
  });
});

test("does not retry a request when the provider result is ambiguous", async () => {
  let donation;
  let paymentAttempts = 0;
  const pool = {
    async query(sql, values) {
      if (sql.includes("INSERT INTO donations")) {
        if (donation) return { rowCount: 0, rows: [] };
        donation = {
          id: values[0],
          amount: values[2],
          frequency: values[3],
          billing_type: values[4],
          referral_code: values[5],
          status: "CREATING",
          asaas_payment_id: null,
          asaas_subscription_id: null,
          checkout_url: null,
        };
        return { rowCount: 1, rows: [{ id: donation.id }] };
      }
      if (sql.includes("SELECT id, amount")) return { rowCount: 1, rows: [donation] };
      return { rowCount: 0, rows: [] };
    },
  };
  const asaas = {
    nextDueDate: () => "2026-11-05",
    async createCustomer() {
      return { id: "customer-id" };
    },
    async createPayment() {
      paymentAttempts += 1;
      const error = new Error("Provider timed out.");
      error.status = 502;
      throw error;
    },
  };
  const app = createApp({
    pool,
    asaas,
    frontendOrigin: "https://calmae.example.org",
    webhookToken: "test-webhook-token",
  });
  const payload = {
    requestId: "5ea3e0ec-f35d-4fad-8c02-19ab7dd81442",
    amount: 10,
    frequency: "once",
    paymentMethod: "PIX",
    name: "Pessoa Doadora",
    email: "doador@example.org",
    cpfCnpj: "12345678901",
    phone: "11912345678",
  };

  await withServer(app, async (baseUrl) => {
    const first = await fetch(`${baseUrl}/api/donations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    assert.equal(first.status, 502);
    assert.equal(donation.status, "CREATING");

    const retry = await fetch(`${baseUrl}/api/donations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, amount: 20 }),
    });
    assert.equal(retry.status, 409);
    assert.match((await retry.json()).error, /Confira no Asaas/);
    assert.equal(paymentAttempts, 1);
  });
});

test("validates only active referral codes without exposing the code list", async () => {
  const pool = {
    async query(_sql, values) {
      assert.deepEqual(values, ["ANJO"]);
      return { rowCount: 1 };
    },
  };
  const app = createApp({
    pool,
    asaas: {},
    frontendOrigin: "https://calmae.example.org",
    webhookToken: "test-webhook-token",
  });

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/referral-codes/anjo/validate`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { valid: true });
  });
});

test("requires the dashboard password and returns only aggregate report rows", async () => {
  const reportRows = [{
    code: "ANJO",
    is_active: true,
    donations_count: 2,
    paid_payments_count: 2,
    paid_amount: "150.00",
    pending_payments_count: 0,
    pending_amount: "0.00",
    overdue_payments_count: 0,
    overdue_amount: "0.00",
    refunded_payments_count: 0,
    refunded_amount: "0.00",
    unknown_partial_refunds_count: 0,
    net_amount: "150.00",
    under_review_payments_count: 0,
  }];
  const pool = {
    async query(sql) {
      assert.match(sql, /donation_payments/);
      return { rows: reportRows };
    },
  };
  assert.throws(() => createApp({
    pool,
    asaas: {},
    frontendOrigin: "https://calmae.example.org",
    webhookToken: "test-webhook-token",
    dashboardPassword: "too-short",
  }), /at least 16 characters/);
  const app = createApp({
    pool,
    asaas: {},
    frontendOrigin: "https://calmae.example.org",
    webhookToken: "test-webhook-token",
    dashboardPassword: "dashboard-test-password",
  });

  await withServer(app, async (baseUrl) => {
    const unauthorized = await fetch(`${baseUrl}/api/admin/referral-report`);
    assert.equal(unauthorized.status, 401);
    assert.equal(unauthorized.headers.get("cache-control"), "no-store");

    const wrongPassword = await fetch(`${baseUrl}/api/admin/referral-report`, {
      headers: {
        Authorization: `Basic ${Buffer.from("admin:incorrect-password").toString("base64")}`,
      },
    });
    assert.equal(wrongPassword.status, 401);

    const response = await fetch(`${baseUrl}/api/admin/referral-report`, {
      headers: {
        Authorization: `Basic ${Buffer.from("admin:dashboard-test-password").toString("base64")}`,
      },
    });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.deepEqual(await response.json(), { rows: reportRows });
  });
});

test("creates a monthly subscription and returns its first hosted invoice", async () => {
  const calls = [];
  const pool = {
    async query(sql, values) {
      calls.push({ sql, values });
      return { rowCount: 1, rows: [{ id: "donation-id" }] };
    },
  };
  const asaas = {
    nextDueDate: () => "2026-10-22",
    isValidCheckoutUrl: (url) => url === "https://sandbox.asaas.com/i/monthly",
    async createCustomer(donor) {
      assert.equal(donor.frequency, "monthly");
      return { id: "customer-id" };
    },
    async createSubscription(options) {
      calls.push({ subscription: options });
      return { id: "subscription-id" };
    },
    async getSubscriptionPayments(id) {
      calls.push({ paymentsFor: id });
      return { data: [{ id: "first-payment", invoiceUrl: "https://sandbox.asaas.com/i/monthly" }] };
    },
    async deleteSubscription() {
      assert.fail("A valid monthly invoice should not be cancelled");
    },
  };
  const app = createApp({
    pool,
    asaas,
    frontendOrigin: "https://calmae.example.org",
    webhookToken: "test-webhook-token",
  });

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/donations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requestId: "3ea3e0ec-f35d-4fad-8c02-19ab7dd81442",
        amount: 100,
        frequency: "monthly",
        paymentMethod: "PIX",
        name: "Pessoa Doadora",
        email: "doador@example.org",
        cpfCnpj: "12345678901",
        phone: "11912345678",
      }),
    });

    assert.equal(response.status, 201);
    assert.deepEqual(await response.json(), { checkoutUrl: "https://sandbox.asaas.com/i/monthly" });
    assert.equal(calls.find((call) => call.subscription)?.subscription.billingType, "PIX");
    assert.equal(calls.find((call) => call.paymentsFor)?.paymentsFor, "subscription-id");
  });
});

test("requires the Asaas webhook token", async () => {
  const app = createApp({
    pool: {},
    asaas: {},
    frontendOrigin: "https://calmae.example.org",
    webhookToken: "test-webhook-token",
  });

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/webhooks/asaas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "event-id", event: "PAYMENT_RECEIVED", payment: { id: "payment-id" } }),
    });
    assert.equal(response.status, 401);
  });
});

test("records authenticated payment webhooks and applies the confirmed status", async () => {
  const queries = [];
  const pool = {
    async connect() {
      return {
        async query(sql, values) {
          queries.push({ sql, values });
          if (sql.includes("INSERT INTO asaas_webhook_events")) return { rowCount: 1 };
          if (sql.includes("SELECT id, amount")) {
            return { rowCount: 1, rows: [{ id: "donation-id", amount: "50.00" }] };
          }
          if (sql.includes("SELECT status, was_paid")) return { rowCount: 0, rows: [] };
          return { rowCount: 1 };
        },
        release() {},
      };
    },
  };
  const app = createApp({
    pool,
    asaas: {},
    frontendOrigin: "https://calmae.example.org",
    webhookToken: "test-webhook-token",
  });

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/webhooks/asaas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "asaas-access-token": "test-webhook-token",
      },
      body: JSON.stringify({
        id: "evt_test",
        event: "PAYMENT_CONFIRMED",
        payment: { id: "payment-id", subscription: "subscription-id" },
      }),
    });

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { received: true });
    const paymentInsert = queries.find(({ sql }) => sql.includes("INSERT INTO donation_payments"));
    assert.equal(paymentInsert.values[0], "payment-id");
    assert.equal(paymentInsert.values[3], "PAID");
    assert.equal(paymentInsert.values[4], true);
  });
});
