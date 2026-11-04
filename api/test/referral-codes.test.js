import test from "node:test";
import assert from "node:assert/strict";
import { normalizeReferralCode, parseReferralCodeActiveState } from "../src/referral-codes.js";

test("normalizes referral codes to uppercase", () => {
  assert.equal(normalizeReferralCode("  anjo  "), "ANJO");
});

test("accepts only safe referral code characters and lengths", () => {
  assert.equal(normalizeReferralCode("doe_calmae-2027"), "DOE_CALMAE-2027");
  assert.throws(() => normalizeReferralCode("bad code"), /1-32 letters/);
  assert.throws(() => normalizeReferralCode("a".repeat(33)), /1-32 letters/);
  assert.throws(() => normalizeReferralCode(""), /1-32 letters/);
});

test("parses explicit active and inactive states", () => {
  assert.equal(parseReferralCodeActiveState("active"), true);
  assert.equal(parseReferralCodeActiveState("inactive"), false);
  assert.throws(() => parseReferralCodeActiveState("yes"), /active|inactive/);
});
