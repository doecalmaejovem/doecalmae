const REFERRAL_CODE_PATTERN = /^[A-Z0-9][A-Z0-9_-]{0,31}$/;
const REFERRAL_STORAGE_KEY = "calmae-referral-attribution";
const REFERRAL_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function normalizeReferralCode(value) {
  if (typeof value !== "string") return null;
  const code = value.trim().toUpperCase();
  return REFERRAL_CODE_PATTERN.test(code) ? code : null;
}

export function readReferralAttribution(storage, now = Date.now()) {
  const raw = storage.getItem(REFERRAL_STORAGE_KEY);
  if (!raw) return null;

  try {
    const saved = JSON.parse(raw);
    const code = normalizeReferralCode(saved.code);
    if (!code || !Number.isFinite(saved.expiresAt) || saved.expiresAt <= now) {
      storage.removeItem(REFERRAL_STORAGE_KEY);
      return null;
    }
    return code;
  } catch {
    storage.removeItem(REFERRAL_STORAGE_KEY);
    return null;
  }
}

export function saveReferralAttribution(storage, value, now = Date.now()) {
  const code = normalizeReferralCode(value);
  if (!code) throw new Error("Cannot save an invalid referral code.");
  storage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify({
    code,
    expiresAt: now + REFERRAL_TTL_MS,
  }));
  return code;
}

export function urlWithoutReferralParameter(value) {
  const url = new URL(value);
  url.searchParams.delete("ref");
  return url.href;
}

export function referralCodeFromUrl(value) {
  return normalizeReferralCode(new URL(value).searchParams.get("ref"));
}
