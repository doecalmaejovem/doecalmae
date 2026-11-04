const CODE_PATTERN = /^[A-Z0-9][A-Z0-9_-]{0,31}$/;

export function normalizeReferralCode(value) {
  if (typeof value !== "string") {
    throw new Error("Referral code must be a string.");
  }

  const code = value.trim().toUpperCase();
  if (!CODE_PATTERN.test(code)) {
    throw new Error("Code must contain 1-32 letters, numbers, hyphens, or underscores.");
  }

  return code;
}

export function parseReferralCodeActiveState(value) {
  if (value === "active") return true;
  if (value === "inactive") return false;
  throw new Error("State must be either 'active' or 'inactive'.");
}
