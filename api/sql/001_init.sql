CREATE TABLE IF NOT EXISTS referral_codes (
  code TEXT PRIMARY KEY CHECK (code ~ '^[A-Z0-9][A-Z0-9_-]{0,31}$'),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO referral_codes (code, is_active)
VALUES ('ANJO', TRUE)
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY,
  request_id UUID NOT NULL UNIQUE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  frequency TEXT NOT NULL CHECK (frequency IN ('once', 'monthly')),
  billing_type TEXT NOT NULL CHECK (billing_type IN ('PIX', 'BOLETO', 'CREDIT_CARD')),
  referral_code TEXT REFERENCES referral_codes (code),
  status TEXT NOT NULL DEFAULT 'CREATING',
  asaas_customer_id TEXT,
  asaas_payment_id TEXT,
  asaas_subscription_id TEXT,
  checkout_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE donations
  ADD COLUMN IF NOT EXISTS referral_code TEXT REFERENCES referral_codes (code);

CREATE INDEX IF NOT EXISTS donations_payment_id_idx
  ON donations (asaas_payment_id);

CREATE INDEX IF NOT EXISTS donations_subscription_id_idx
  ON donations (asaas_subscription_id);

CREATE TABLE IF NOT EXISTS asaas_webhook_events (
  event_id TEXT PRIMARY KEY,
  event_name TEXT NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS donation_payments (
  asaas_payment_id TEXT PRIMARY KEY,
  donation_id UUID NOT NULL REFERENCES donations (id),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL CHECK (status IN (
    'PENDING', 'PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED',
    'PARTIALLY_REFUNDED', 'UNDER_REVIEW'
  )),
  was_paid BOOLEAN NOT NULL DEFAULT FALSE,
  refunded_amount NUMERIC(12, 2),
  due_date DATE,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS donation_payments_donation_id_idx
  ON donation_payments (donation_id);
