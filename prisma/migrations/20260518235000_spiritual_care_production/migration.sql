CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS sermon_notes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  sermon_id TEXT REFERENCES "Sermon"(id) ON DELETE SET NULL,
  conference_id TEXT REFERENCES "Conference"(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  notes TEXT NOT NULL,
  scripture_refs TEXT[] DEFAULT ARRAY[]::TEXT[],
  action_steps TEXT[] DEFAULT ARRAY[]::TEXT[],
  private BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sermon_notes_user_idx ON sermon_notes(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS discipleship_milestones (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  achieved_at TIMESTAMPTZ,
  verified_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  visibility TEXT NOT NULL DEFAULT 'PRIVATE',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS discipleship_milestones_user_idx ON discipleship_milestones(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS spiritual_journey_snapshots (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  growth_score INT NOT NULL DEFAULT 0,
  prayer_count INT NOT NULL DEFAULT 0,
  journal_count INT NOT NULL DEFAULT 0,
  sermon_note_count INT NOT NULL DEFAULT 0,
  giving_count INT NOT NULL DEFAULT 0,
  care_count INT NOT NULL DEFAULT 0,
  family_count INT NOT NULL DEFAULT 0,
  encouraging_summary TEXT,
  next_steps TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start)
);

CREATE TABLE IF NOT EXISTS trusted_contacts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT,
  email TEXT,
  phone TEXT,
  country TEXT,
  preferred BOOLEAN NOT NULL DEFAULT FALSE,
  can_notify_in_urgent_care BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS trusted_contacts_user_idx ON trusted_contacts(user_id);

CREATE TABLE IF NOT EXISTS care_escalations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'member',
  urgency TEXT NOT NULL DEFAULT 'MEDIUM',
  status TEXT NOT NULL DEFAULT 'OPEN',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  country TEXT,
  emergency_disclaimer TEXT,
  notify_pastor BOOLEAN NOT NULL DEFAULT TRUE,
  notify_trusted_contact BOOLEAN NOT NULL DEFAULT FALSE,
  stay_with_person BOOLEAN NOT NULL DEFAULT FALSE,
  assigned_to TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS care_escalations_user_idx ON care_escalations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS care_escalations_status_idx ON care_escalations(status, urgency, created_at DESC);

CREATE TABLE IF NOT EXISTS care_followups (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  escalation_id TEXT NOT NULL REFERENCES care_escalations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  assigned_to TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'PASTORAL_CHECK_IN',
  scheduled_for TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS care_followups_due_idx ON care_followups(status, scheduled_for);

CREATE TABLE IF NOT EXISTS care_safety_plans (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  warning_signs TEXT[] DEFAULT ARRAY[]::TEXT[],
  calming_steps TEXT[] DEFAULT ARRAY[]::TEXT[],
  trusted_people TEXT[] DEFAULT ARRAY[]::TEXT[],
  emergency_numbers JSONB DEFAULT '{}'::jsonb,
  safety_items_secured BOOLEAN NOT NULL DEFAULT FALSE,
  stay_with_person BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
