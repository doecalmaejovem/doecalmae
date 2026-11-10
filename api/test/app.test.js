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

test("creates a pending checkout without persisting donor personal data", async () => {
  const databaseCalls = [];
  const pool = {
    async query(sql, values) {
      databaseCalls.push({ sql, values });
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
    async getPixQrCode(paymentId) {
      assert.equal(paymentId, "payment-id");
      return {
        encodedImage: "aGVsbG8=",
        payload: "pix-copy-paste",
        expirationDate: "2026-10-23T23:59:59Z",
      };
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
      }),
    });

    assert.equal(response.status, 201);
    assert.deepEqual(await response.json(), {
      checkoutUrl: "https://sandbox.asaas.com/i/test",
      pix: {
        encodedImage: "aGVsbG8=",
        payload: "pix-copy-paste",
        expirationDate: "2026-10-23T23:59:59Z",
      },
    });
    assert.equal(databaseCalls.length, 2);
    assert.equal(databaseCalls[0].values.includes("doador@example.org"), false);
    assert.equal(databaseCalls[0].values.includes("Pessoa Doadora"), false);
  });
});

test("recovers an existing Pix QR code without creating a second payment", async () => {
  const donation = {
    id: "donation-id",
    amount: 25,
    frequency: "once",
    billing_type: "PIX",
    checkout_url: "https://sandbox.asaas.com/i/test",
    status: "PENDING",
    asaas_payment_id: "payment-id",
    asaas_subscription_id: null,
  };
  let inserted = false;
  let paymentCreations = 0;
  let qrRequests = 0;
  const pool = {
    async query(sql) {
      if (sql.includes("INSERT INTO donations")) {
        if (inserted) return { rowCount: 0, rows: [] };
        inserted = true;
        return { rowCount: 1, rows: [{ id: donation.id }] };
      }
      if (sql.includes("SELECT id, amount")) return { rowCount: 1, rows: [donation] };
      return { rowCount: 1, rows: [] };
    },
  };
  const asaas = {
    nextDueDate: () => "2026-11-11",
    isValidCheckoutUrl: (url) => url === donation.checkout_url,
    async createCustomer() {
      return { id: "customer-id" };
    },
    async createPayment() {
      paymentCreations += 1;
      return { id: donation.asaas_payment_id, invoiceUrl: donation.checkout_url };
    },
    async getPixQrCode() {
      qrRequests += 1;
      if (qrRequests === 1) throw new Error("Temporary QR lookup failure");
      return { encodedImage: "aGVsbG8=", payload: "pix-copy-paste" };
    },
  };
  const app = createApp({
    pool,
    asaas,
    frontendOrigin: "https://calmae.example.org",
    webhookToken: "test-webhook-token",
  });
  const payload = {
    requestId: "1ea3e0ec-f35d-4fad-8c02-19ab7dd81442",
    amount: donation.amount,
    frequency: donation.frequency,
    paymentMethod: donation.billing_type,
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
    assert.match((await first.json()).error, /não crie outra cobrança/i);

    const recovered = await fetch(`${baseUrl}/api/donations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    assert.equal(recovered.status, 200);
    assert.deepEqual((await recovered.json()).pix, {
      encodedImage: "aGVsbG8=",
      payload: "pix-copy-paste",
    });
    assert.equal(paymentCreations, 1);
    assert.equal(qrRequests, 2);
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

test("retries a rejected request with corrected values without creating duplicate donations", async () => {
  let donation;
  const attemptedAmounts = [];
  const pool = {
    async query(sql, values) {
      if (sql.includes("INSERT INTO donations")) {
        if (donation) return { rowCount: 0, rows: [] };
        donation = {
          id: values[0],
          amount: values[2],
          frequency: values[3],
          billing_type: values[4],
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
        [donation.amount, donation.frequency, donation.billing_type] = values;
        donation.status = "CREATING";
        return { rowCount: 1, rows: [{ id: donation.id }] };
      }
      if (sql.includes("SET asaas_customer_id")) {
        donation.asaas_payment_id = values[1];
        donation.checkout_url = values[3];
        donation.status = "PENDING";
        return { rowCount: 1, rows: [] };
      }
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
      attemptedAmounts.push(amount);
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

    const retry = await fetch(`${baseUrl}/api/donations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, amount: 10 }),
    });
    assert.equal(retry.status, 201);
    assert.deepEqual(attemptedAmounts, [5, 10]);
    assert.equal(donation.amount, 10);
    assert.equal(donation.status, "PENDING");
  });
});

test("blocks a new attempt when the previous Asaas result is ambiguous", async () => {
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
    async getPixQrCode(id) {
      calls.push({ pixFor: id });
      return {
        encodedImage: "aGVsbG8=",
        payload: "monthly-pix-copy-paste",
        expirationDate: "2026-10-23T23:59:59Z",
      };
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
    assert.deepEqual(await response.json(), {
      checkoutUrl: "https://sandbox.asaas.com/i/monthly",
      pix: {
        encodedImage: "aGVsbG8=",
        payload: "monthly-pix-copy-paste",
        expirationDate: "2026-10-23T23:59:59Z",
      },
    });
    assert.equal(calls.find((call) => call.subscription)?.subscription.billingType, "PIX");
    assert.equal(calls.find((call) => call.paymentsFor)?.paymentsFor, "subscription-id");
    assert.equal(calls.find((call) => call.pixFor)?.pixFor, "first-payment");
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
    assert.equal(queries[2].values[0], "PAID");
    assert.equal(queries[2].values[1], "payment-id");
    assert.equal(queries[2].values[2], "subscription-id");
  });
});
