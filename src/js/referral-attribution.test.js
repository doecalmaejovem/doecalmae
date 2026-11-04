import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeReferralCode,
  readReferralAttribution,
  referralCodeFromUrl,
  saveReferralAttribution,
  urlWithoutReferralParameter,
} from "./referral-attribution.js";

function createStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}

test("normalizes referral codes and reads a case-insensitive link parameter", () => {
  assert.equal(normalizeReferralCode("  anjo "), "ANJO");
  assert.equal(referralCodeFromUrl("https://example.org/?ref=anjo#apoio"), "ANJO");
  assert.equal(referralCodeFromUrl("https://example.org/?ref=bad%20code"), null);
});

test("stores the most recently accepted code for 30 days", () => {
  const storage = createStorage();
  const now = 1_800_000_000_000;
  assert.equal(saveReferralAttribution(storage, "ANJO", now), "ANJO");
  assert.equal(readReferralAttribution(storage, now + 29 * 24 * 60 * 60 * 1000), "ANJO");
  assert.equal(saveReferralAttribution(storage, "MARIA", now + 1), "MARIA");
  assert.equal(readReferralAttribution(storage, now + 1), "MARIA");
  assert.equal(readReferralAttribution(storage, now + 31 * 24 * 60 * 60 * 1000), null);
});

test("removes invalid or expired stored referral values", () => {
  const storage = createStorage({
    "calmae-referral-attribution": JSON.stringify({ code: "INVÁLIDO", expiresAt: 2_000_000 }),
  });
  assert.equal(readReferralAttribution(storage, 1_000), null);
  assert.equal(storage.getItem("calmae-referral-attribution"), null);
});

test("strips only referral query parameter from browser URL", () => {
  assert.equal(
    urlWithoutReferralParameter("https://example.org/?ref=ANJO&utm_source=share#apoio"),
    "https://example.org/?utm_source=share#apoio",
  );
});
