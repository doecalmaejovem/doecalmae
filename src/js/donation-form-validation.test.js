import test from "node:test";
import assert from "node:assert/strict";
import { digitsOnly, validateDonationFields } from "./donation-form-validation.js";

const validDonation = {
  amount: 50,
  frequency: "once",
  paymentMethod: "PIX",
  name: "Pessoa Doadora",
  email: "doador@example.org",
  cpfCnpj: "52998224725",
  phone: "11912345678",
};

test("accepts valid CPF and phone values", () => {
  assert.deepEqual(validateDonationFields(validDonation), {});
});

test("accepts a valid CNPJ", () => {
  assert.deepEqual(validateDonationFields({ ...validDonation, cpfCnpj: "11222333000181" }), {});
});

test("removes punctuation from document and phone input before submission", () => {
  assert.equal(digitsOnly("(11) 91234-5678"), "11912345678");
  assert.equal(digitsOnly("529.982.247-25"), "52998224725");
});

test("rejects a phone number containing the country code", () => {
  const errors = validateDonationFields({ ...validDonation, phone: "5581991234567" });
  assert.match(errors.phone, /sem o código do país \(\+55\)/);
});

test("rejects invalid CPF/CNPJ checksums", () => {
  assert.ok(validateDonationFields({ ...validDonation, cpfCnpj: "12345678901" }).cpfCnpj);
  assert.ok(validateDonationFields({ ...validDonation, cpfCnpj: "11222333000180" }).cpfCnpj);
});

test("rejects unsupported amount and monthly card payments", () => {
  assert.ok(validateDonationFields({ ...validDonation, amount: 1_500_000.01 }).amount);
  assert.ok(validateDonationFields({
    ...validDonation,
    frequency: "monthly",
    paymentMethod: "CREDIT_CARD",
  }).paymentMethod);
});

test("requires a minimum of five reais for boleto donations", () => {
  const errors = validateDonationFields({
    ...validDonation,
    amount: 0.01,
    paymentMethod: "BOLETO",
  });
  assert.match(errors.amount, /mínimo.*R\$ 5,00/);
  assert.deepEqual(validateDonationFields({
    ...validDonation,
    amount: 5,
    paymentMethod: "BOLETO",
  }), {});
});
