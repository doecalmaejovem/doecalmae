import test from "node:test";
import assert from "node:assert/strict";
import { createAsaasClient, nextDueDate } from "../src/asaas.js";

test("restricts the Asaas API to its official HTTPS hosts", () => {
  assert.throws(
    () => createAsaasClient({ apiKey: "key", baseUrl: "https://attacker.example" }),
    /official Asaas API/,
  );
});

test("validates checkout URLs for the configured Asaas environment", () => {
  const sandbox = createAsaasClient({
    apiKey: "sandbox-key",
    baseUrl: "https://api-sandbox.asaas.com",
  });
  const production = createAsaasClient({
    apiKey: "live-key",
    baseUrl: "https://api.asaas.com",
  });

  assert.equal(sandbox.isValidCheckoutUrl("https://sandbox.asaas.com/i/test"), true);
  assert.equal(sandbox.isValidCheckoutUrl("https://www.asaas.com/i/test"), false);
  assert.equal(production.isValidCheckoutUrl("https://www.asaas.com/i/test"), true);
  assert.equal(production.isValidCheckoutUrl("https://sandbox.asaas.com/i/test"), false);
  assert.equal(sandbox.isValidCheckoutUrl("https://sandbox.asaas.com.attacker.example/i/test"), false);
  assert.equal(sandbox.isValidCheckoutUrl("http://sandbox.asaas.com/i/test"), false);
});

test("creates a customer and single charge using server-side credentials", async () => {
  const calls = [];
  const client = createAsaasClient({
    apiKey: "sandbox-key",
    baseUrl: "https://api-sandbox.asaas.com",
    fetchImpl: async (url, options) => {
      calls.push({ url: String(url), options });
      const body = String(url).endsWith("/pixQrCode")
        ? { encodedImage: "aGVsbG8=", payload: "pix-copy-paste", expirationDate: "2026-10-23T23:59:59Z" }
        : { id: "cus_test", invoiceUrl: "https://www.asaas.com/i/test" };
      return new Response(JSON.stringify(body), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    },
  });

  await client.createCustomer({
    name: "Pessoa Doadora",
    email: "doador@example.org",
    cpfCnpj: "12345678901",
    phone: "11912345678",
    frequency: "once",
  });
  await client.createPayment({
    customerId: "cus_test",
    amount: 50,
    billingType: "PIX",
    externalReference: "donation-id",
    dueDate: "2026-10-22",
  });
  const pixQrCode = await client.getPixQrCode("payment/test");

  assert.equal(calls.length, 3);
  assert.equal(calls[0].options.headers.access_token, "sandbox-key");
  assert.equal(calls[0].url, "https://api-sandbox.asaas.com/v3/customers");
  assert.equal(JSON.parse(calls[0].options.body).notificationDisabled, true);
  assert.equal(calls[1].url, "https://api-sandbox.asaas.com/v3/payments");
  assert.equal(JSON.parse(calls[1].options.body).billingType, "PIX");
  assert.equal(calls[2].url, "https://api-sandbox.asaas.com/v3/payments/payment%2Ftest/pixQrCode");
  assert.equal(calls[2].options.method, "GET");
  assert.deepEqual(pixQrCode, {
    encodedImage: "aGVsbG8=",
    payload: "pix-copy-paste",
    expirationDate: "2026-10-23T23:59:59Z",
  });
});

test("calculates the next due date in UTC", () => {
  assert.equal(nextDueDate(new Date("2026-10-21T12:00:00.000Z")), "2026-10-22");
});
