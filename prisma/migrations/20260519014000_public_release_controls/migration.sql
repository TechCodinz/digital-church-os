CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS content_reports (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  reporter_id TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  reporter_email TEXT,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'OPEN',
  priority TEXT NOT NULL DEFAULT 'NORMAL',
  reviewed_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS content_reports_status_idx ON content_reports(status, priority, created_at DESC);
CREATE INDEX IF NOT EXISTS content_reports_entity_idx ON content_reports(entity_type, entity_id);

CREATE TABLE IF NOT EXISTS review_actions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  actor_id TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  reason TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS review_actions_entity_idx ON review_actions(entity_type, entity_id, created_at DESC);

CREATE TABLE IF NOT EXISTS platform_feature_flags (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  flag_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  rollout_percent INT NOT NULL DEFAULT 0,
  config JSONB DEFAULT '{}'::jsonb,
  updated_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO platform_feature_flags (flag_key, title, description, enabled, rollout_percent, config)
VALUES
('public_live_broadcasts', 'Public Live Broadcasts', 'Allows public listing and joining of public broadcast rooms.', false, 0, '{"requiresReview":true}'::jsonb),
('public_worship_media', 'Public Worship Media Catalog', 'Allows approved and rights-cleared worship media to appear publicly.', false, 0, '{"requiresRightsClearance":true}'::jsonb),
('marketplace_public_sales', 'Public Marketplace Sales', 'Enables public marketplace purchases after payment provider readiness.', false, 0, '{"requiresPayments":true}'::jsonb),
('rewards_public_redemption', 'Public Rewards Redemption', 'Enables gift/reward redemption beyond internal testing.', false, 0, '{"requiresReview":true}'::jsonb)
ON CONFLICT (flag_key) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  config = EXCLUDED.config,
  updated_at = now();
