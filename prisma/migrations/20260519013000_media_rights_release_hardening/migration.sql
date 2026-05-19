CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Media Rights, Takedown, and Licensed Provider Release Hardening
ALTER TABLE worship_media_items
  ADD COLUMN IF NOT EXISTS rights_status TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
  ADD COLUMN IF NOT EXISTS distribution_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS rights_owner_name TEXT,
  ADD COLUMN IF NOT EXISTS rights_owner_contact TEXT,
  ADD COLUMN IF NOT EXISTS license_document_url TEXT,
  ADD COLUMN IF NOT EXISTS provider_key TEXT,
  ADD COLUMN IF NOT EXISTS provider_item_id TEXT,
  ADD COLUMN IF NOT EXISTS takedown_status TEXT NOT NULL DEFAULT 'CLEAR',
  ADD COLUMN IF NOT EXISTS public_distribution_notes TEXT;

CREATE INDEX IF NOT EXISTS worship_media_rights_idx ON worship_media_items(rights_status, distribution_allowed, takedown_status, status);

CREATE TABLE IF NOT EXISTS media_terms_versions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  version TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  effective_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS media_terms_acceptances (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  terms_version_id TEXT NOT NULL REFERENCES media_terms_versions(id) ON DELETE CASCADE,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_hash TEXT,
  user_agent_hash TEXT,
  UNIQUE(user_id, terms_version_id)
);

CREATE TABLE IF NOT EXISTS media_takedown_requests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  media_item_id TEXT REFERENCES worship_media_items(id) ON DELETE SET NULL,
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  requester_role TEXT NOT NULL DEFAULT 'RIGHTS_OWNER',
  claim_type TEXT NOT NULL DEFAULT 'COPYRIGHT',
  claim_details TEXT NOT NULL,
  proof_url TEXT,
  status TEXT NOT NULL DEFAULT 'RECEIVED',
  reviewed_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS media_takedown_status_idx ON media_takedown_requests(status, created_at DESC);

CREATE TABLE IF NOT EXISTS media_provider_configs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  provider_key TEXT NOT NULL UNIQUE,
  provider_name TEXT NOT NULL,
  provider_type TEXT NOT NULL DEFAULT 'LICENSED_CATALOG',
  api_base_url TEXT,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  requires_api_key BOOLEAN NOT NULL DEFAULT TRUE,
  secret_ref TEXT,
  license_summary TEXT,
  allowed_usage TEXT[] DEFAULT ARRAY[]::TEXT[],
  territory_rules JSONB DEFAULT '{}'::jsonb,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS media_provider_catalog_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  provider_key TEXT NOT NULL,
  provider_item_id TEXT NOT NULL,
  title TEXT NOT NULL,
  artist TEXT,
  media_type TEXT NOT NULL DEFAULT 'AUDIO',
  source_url TEXT,
  preview_url TEXT,
  thumbnail_url TEXT,
  duration_seconds INT,
  license_scope TEXT NOT NULL DEFAULT 'STREAM_ONLY',
  allowed_usage TEXT[] DEFAULT ARRAY[]::TEXT[],
  territories TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(provider_key, provider_item_id)
);
CREATE INDEX IF NOT EXISTS media_provider_catalog_idx ON media_provider_catalog_items(provider_key, active, media_type);

CREATE TABLE IF NOT EXISTS media_license_audit_events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  media_item_id TEXT REFERENCES worship_media_items(id) ON DELETE SET NULL,
  actor_id TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS media_license_audit_media_idx ON media_license_audit_events(media_item_id, created_at DESC);

CREATE TABLE IF NOT EXISTS media_distribution_clearances (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  media_item_id TEXT NOT NULL REFERENCES worship_media_items(id) ON DELETE CASCADE,
  cleared_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  clearance_type TEXT NOT NULL DEFAULT 'PUBLIC_STREAMING',
  status TEXT NOT NULL DEFAULT 'APPROVED',
  allowed_usage TEXT[] DEFAULT ARRAY[]::TEXT[],
  expires_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS media_distribution_clearances_media_idx ON media_distribution_clearances(media_item_id, status, expires_at);

INSERT INTO media_terms_versions (version, title, body, active)
VALUES (
  '2026-05-release-1',
  'Digital Church OS Media Upload and Worship Distribution Terms',
  'By uploading or linking worship music, praise songs, videos, instrumentals, ambience, choir clips, or any media, you confirm that you own the content, have permission to use and distribute it, or are using a licensed/public-domain/approved external source. You must not upload copyrighted songs, videos, lyrics, beats, performances, or recordings without permission. Digital Church OS may hide, restrict, remove, or disable media at any time after review, provider rules, or rights-holder claims. Public and church-wide distribution requires review and clearance. Repeated violations may limit account access.',
  true
)
ON CONFLICT (version) DO UPDATE SET title = EXCLUDED.title, body = EXCLUDED.body, active = true;

INSERT INTO media_provider_configs (provider_key, provider_name, provider_type, enabled, requires_api_key, license_summary, allowed_usage)
VALUES
('manual-license', 'Manual Licensed Media Registry', 'MANUAL_REVIEW', true, false, 'Admin-reviewed songs/videos with uploaded license proof or rights-owner approval.', ARRAY['PRIVATE_USE','CHURCH_STREAM','PUBLIC_STREAM']),
('external-link', 'External Link Only', 'EXTERNAL_LINK', true, false, 'Stores links to content hosted by third-party services. Playback and distribution remain subject to source platform terms.', ARRAY['LINK_OUT','EMBED_IF_ALLOWED']),
('future-licensed-catalog', 'Future Licensed Worship Catalog Provider', 'LICENSED_CATALOG', false, true, 'Placeholder adapter for future licensed worship/song catalog integration.', ARRAY['STREAM_ONLY'])
ON CONFLICT (provider_key) DO UPDATE SET
  provider_name = EXCLUDED.provider_name,
  provider_type = EXCLUDED.provider_type,
  enabled = EXCLUDED.enabled,
  requires_api_key = EXCLUDED.requires_api_key,
  license_summary = EXCLUDED.license_summary,
  allowed_usage = EXCLUDED.allowed_usage,
  updated_at = now();
