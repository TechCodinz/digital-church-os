-- Digital Church OS: tenant-scoped operational persistence
-- Reuses the existing church_profiles identity introduced in Phase 4.

CREATE TABLE IF NOT EXISTS church_profile_members (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  church_id TEXT NOT NULL REFERENCES church_profiles(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'VIEWER',
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  invited_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(church_id, user_id),
  CONSTRAINT church_profile_members_role_check CHECK (role IN ('OWNER', 'ADMIN', 'PASTOR', 'STAFF', 'VIEWER')),
  CONSTRAINT church_profile_members_status_check CHECK (status IN ('INVITED', 'ACTIVE', 'SUSPENDED', 'REMOVED'))
);

CREATE INDEX IF NOT EXISTS church_profile_members_user_idx
  ON church_profile_members(user_id, status);
CREATE INDEX IF NOT EXISTS church_profile_members_church_idx
  ON church_profile_members(church_id, status);

-- Backfill every existing church owner as an explicit OWNER member.
INSERT INTO church_profile_members (church_id, user_id, role, status)
SELECT cp.id, cp.owner_id, 'OWNER', 'ACTIVE'
FROM church_profiles cp
ON CONFLICT (church_id, user_id) DO NOTHING;

-- Invitations never grant access by themselves. The raw token is shown/sent
-- once; only a SHA-256 hash is persisted. Acceptance requires an authenticated
-- account whose normalized email matches the invitation.
CREATE TABLE IF NOT EXISTS church_profile_invitations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  church_id TEXT NOT NULL REFERENCES church_profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'VIEWER',
  token_hash TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'PENDING',
  invited_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  accepted_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT church_profile_invitations_role_check CHECK (role IN ('ADMIN', 'PASTOR', 'STAFF', 'VIEWER')),
  CONSTRAINT church_profile_invitations_status_check CHECK (status IN ('PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED'))
);

CREATE INDEX IF NOT EXISTS church_profile_invitations_church_idx
  ON church_profile_invitations(church_id, status, expires_at);
CREATE INDEX IF NOT EXISTS church_profile_invitations_email_idx
  ON church_profile_invitations(lower(email), status, expires_at);

CREATE TABLE IF NOT EXISTS church_operational_records (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  church_id TEXT NOT NULL REFERENCES church_profiles(id) ON DELETE CASCADE,
  module TEXT NOT NULL,
  record_key TEXT NOT NULL,
  title TEXT,
  classification TEXT NOT NULL DEFAULT 'INTERNAL',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INT NOT NULL DEFAULT 1,
  created_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  updated_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(church_id, module, record_key),
  CONSTRAINT church_operational_records_classification_check CHECK (classification IN ('INTERNAL', 'SENSITIVE_OPERATIONAL'))
);

CREATE INDEX IF NOT EXISTS church_operational_records_lookup_idx
  ON church_operational_records(church_id, module, archived_at, updated_at DESC);

CREATE TABLE IF NOT EXISTS church_operational_record_history (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  record_id TEXT NOT NULL REFERENCES church_operational_records(id) ON DELETE CASCADE,
  church_id TEXT NOT NULL REFERENCES church_profiles(id) ON DELETE CASCADE,
  module TEXT NOT NULL,
  record_key TEXT NOT NULL,
  action TEXT NOT NULL,
  version INT NOT NULL,
  changed_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT church_operational_record_history_action_check CHECK (action IN ('CREATE', 'UPDATE', 'ARCHIVE', 'RESTORE'))
);

CREATE INDEX IF NOT EXISTS church_operational_record_history_record_idx
  ON church_operational_record_history(record_id, created_at DESC);
CREATE INDEX IF NOT EXISTS church_operational_record_history_church_idx
  ON church_operational_record_history(church_id, module, created_at DESC);

COMMENT ON TABLE church_profile_invitations IS
  'Invitation tokens are stored as hashes and do not grant tenant access until accepted by the matching authenticated email.';
COMMENT ON TABLE church_operational_records IS
  'Tenant-scoped church operations data. Do not store counseling notes, abuse reports, medical records, credentials, or other restricted case data here.';
COMMENT ON COLUMN church_operational_records.classification IS
  'INTERNAL or SENSITIVE_OPERATIONAL only. Restricted pastoral/clinical/safeguarding case content requires a purpose-built store.';
