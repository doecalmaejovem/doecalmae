import "dotenv/config";
import pg from "pg";
import { normalizeReferralCode, parseReferralCodeActiveState } from "./referral-codes.js";

async function main() {
  const [rawCode, rawState, ...extraArguments] = process.argv.slice(2);
  if (!rawCode || !rawState || extraArguments.length) {
    throw new Error("Usage: npm run referral-code -- <CODE> <active|inactive>");
  }

  const code = normalizeReferralCode(rawCode);
  const isActive = parseReferralCodeActiveState(rawState);
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required. Set it in api/.env or the shell environment.");
  }

  const pool = new pg.Pool({ connectionString: databaseUrl });
  try {
    const result = await pool.query(
      `INSERT INTO referral_codes (code, is_active)
       VALUES ($1, $2)
       ON CONFLICT (code) DO UPDATE
       SET is_active = EXCLUDED.is_active, updated_at = NOW()
       RETURNING code, is_active`,
      [code, isActive],
    );
    const record = result.rows[0];
    console.log(`Referral code ${record.code} is ${record.is_active ? "active" : "inactive"}.`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(`Could not update referral code: ${error.message}`);
  process.exitCode = 1;
});
