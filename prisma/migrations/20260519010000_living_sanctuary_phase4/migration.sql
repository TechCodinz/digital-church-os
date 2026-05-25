CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Bible Translation + Scripture Intelligence
CREATE TABLE IF NOT EXISTS bible_translation_providers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL UNIQUE,
  base_url TEXT,
  license_notes TEXT,
  requires_api_key BOOLEAN NOT NULL DEFAULT TRUE,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bible_versions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  provider_id TEXT REFERENCES bible_translation_providers(id) ON DELETE SET NULL,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'English',
  public_domain BOOLEAN NOT NULL DEFAULT FALSE,
  offline_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  license_notes TEXT,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scripture_passages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  version_code TEXT NOT NULL,
  book TEXT NOT NULL,
  chapter INT NOT NULL,
  verse_start INT NOT NULL,
  verse_end INT,
  reference TEXT NOT NULL,
  text TEXT NOT NULL,
  topics TEXT[] DEFAULT ARRAY[]::TEXT[],
  emotions TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(version_code, reference)
);
CREATE INDEX IF NOT EXISTS scripture_passages_search_idx ON scripture_passages USING gin(to_tsvector('english', text));

CREATE TABLE IF NOT EXISTS verse_collections (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  visibility TEXT NOT NULL DEFAULT 'PRIVATE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS verse_collection_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  collection_id TEXT NOT NULL REFERENCES verse_collections(id) ON DELETE CASCADE,
  scripture_passage_id TEXT REFERENCES scripture_passages(id) ON DELETE SET NULL,
  reference TEXT NOT NULL,
  version_code TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Live Presentation + Sanctuary Screen Mode
CREATE TABLE IF NOT EXISTS sermon_presentation_decks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  sermon_pack_id TEXT REFERENCES sermon_content_packs(id) ON DELETE SET NULL,
  live_service_id TEXT REFERENCES live_services(id) ON DELETE SET NULL,
  created_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  theme TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  aspect_ratio TEXT NOT NULL DEFAULT '16:9',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS presentation_slides (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  deck_id TEXT NOT NULL REFERENCES sermon_presentation_decks(id) ON DELETE CASCADE,
  slide_order INT NOT NULL,
  slide_type TEXT NOT NULL,
  title TEXT,
  body TEXT,
  scripture_ref TEXT,
  translation_code TEXT,
  media_url TEXT,
  lower_third JSONB DEFAULT '{}'::jsonb,
  style JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(deck_id, slide_order)
);

CREATE TABLE IF NOT EXISTS live_presentation_sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  live_service_id TEXT NOT NULL REFERENCES live_services(id) ON DELETE CASCADE,
  deck_id TEXT REFERENCES sermon_presentation_decks(id) ON DELETE SET NULL,
  controller_id TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  current_slide_id TEXT REFERENCES presentation_slides(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'READY',
  screen_mode TEXT NOT NULL DEFAULT 'SANCTUARY',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS live_presentation_events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  session_id TEXT NOT NULL REFERENCES live_presentation_sessions(id) ON DELETE CASCADE,
  actor_id TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sanctuary Activities + Rewards/Gift Economy
CREATE TABLE IF NOT EXISTS sanctuary_activities (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  points INT NOT NULL DEFAULT 0,
  reward_eligible BOOLEAN NOT NULL DEFAULT TRUE,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sanctuary_activity_completions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  activity_id TEXT NOT NULL REFERENCES sanctuary_activities(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  proof_text TEXT,
  proof_url TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
  points_awarded INT NOT NULL DEFAULT 0,
  reviewed_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(activity_id, user_id)
);

CREATE TABLE IF NOT EXISTS kingdom_wallets (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL UNIQUE REFERENCES "User"(id) ON DELETE CASCADE,
  points_balance INT NOT NULL DEFAULT 0,
  gift_credit_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kingdom_wallet_ledger (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  wallet_id TEXT NOT NULL REFERENCES kingdom_wallets(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_id TEXT,
  points_delta INT NOT NULL DEFAULT 0,
  gift_credit_delta NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gift_pools (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  description TEXT,
  pool_type TEXT NOT NULL DEFAULT 'GENERAL',
  amount_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  amount_available NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  sponsor_id TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  conference_id TEXT REFERENCES "Conference"(id) ON DELETE SET NULL,
  live_service_id TEXT REFERENCES live_services(id) ON DELETE SET NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gift_awards (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  gift_pool_id TEXT REFERENCES gift_pools(id) ON DELETE SET NULL,
  recipient_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  awarded_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  award_type TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'PENDING',
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  fulfilled_at TIMESTAMPTZ
);

-- Church Worker Productivity + Stipend System
CREATE TABLE IF NOT EXISTS worker_task_templates (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  department_id TEXT REFERENCES ministry_departments(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  default_points INT NOT NULL DEFAULT 0,
  stipend_eligible BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS worker_tasks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  template_id TEXT REFERENCES worker_task_templates(id) ON DELETE SET NULL,
  assigned_to TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  assigned_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  department_id TEXT REFERENCES ministry_departments(id) ON DELETE SET NULL,
  live_service_id TEXT REFERENCES live_services(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  due_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'ASSIGNED',
  proof_text TEXT,
  proof_url TEXT,
  points_awarded INT NOT NULL DEFAULT 0,
  stipend_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  reviewed_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS worker_tasks_assigned_idx ON worker_tasks(assigned_to, status, due_at);

CREATE TABLE IF NOT EXISTS worker_stipend_batches (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  period TEXT NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'DRAFT',
  created_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  approved_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS worker_stipend_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  batch_id TEXT NOT NULL REFERENCES worker_stipend_batches(id) ON DELETE CASCADE,
  worker_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  task_id TEXT REFERENCES worker_tasks(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Conference Gift/Sponsorship Engine
CREATE TABLE IF NOT EXISTS conference_tickets (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  conference_id TEXT NOT NULL REFERENCES "Conference"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  capacity INT,
  sold_count INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conference_registrations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  conference_id TEXT NOT NULL REFERENCES "Conference"(id) ON DELETE CASCADE,
  ticket_id TEXT REFERENCES conference_tickets(id) ON DELETE SET NULL,
  user_id TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  name TEXT,
  email TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'REGISTERED',
  checked_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conference_sponsorship_requests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  conference_id TEXT NOT NULL REFERENCES "Conference"(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL,
  amount_requested NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  reviewed_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conference_certificates (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  conference_id TEXT NOT NULL REFERENCES "Conference"(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  registration_id TEXT REFERENCES conference_registrations(id) ON DELETE SET NULL,
  certificate_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  pdf_url TEXT,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Church-to-Church Network
CREATE TABLE IF NOT EXISTS church_profiles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  owner_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  denomination TEXT,
  country TEXT,
  city TEXT,
  description TEXT,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  visibility TEXT NOT NULL DEFAULT 'PUBLIC',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS church_connections (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  requester_church_id TEXT NOT NULL REFERENCES church_profiles(id) ON DELETE CASCADE,
  receiver_church_id TEXT NOT NULL REFERENCES church_profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'PENDING',
  connection_type TEXT NOT NULL DEFAULT 'PARTNER',
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(requester_church_id, receiver_church_id)
);

CREATE TABLE IF NOT EXISTS shared_ministry_resources (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  church_id TEXT REFERENCES church_profiles(id) ON DELETE SET NULL,
  shared_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  visibility TEXT NOT NULL DEFAULT 'NETWORK',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Testimony + Impact Engine
CREATE TABLE IF NOT EXISTS testimonies (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT,
  anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
  approved_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS impact_summaries (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  period TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  generated_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Children/Youth Game Layer
CREATE TABLE IF NOT EXISTS bible_quiz_games (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  age_group TEXT NOT NULL DEFAULT 'YOUTH',
  topic TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  points INT NOT NULL DEFAULT 0,
  created_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bible_quiz_attempts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  game_id TEXT NOT NULL REFERENCES bible_quiz_games(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  child_id TEXT REFERENCES "ChildProfile"(id) ON DELETE SET NULL,
  score INT NOT NULL DEFAULT 0,
  max_score INT NOT NULL DEFAULT 0,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  points_awarded INT NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI Sanctuary Host + Command Center
CREATE TABLE IF NOT EXISTS sanctuary_host_messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT REFERENCES "User"(id) ON DELETE CASCADE,
  context_type TEXT NOT NULL,
  context_id TEXT,
  message TEXT NOT NULL,
  action_label TEXT,
  action_href TEXT,
  status TEXT NOT NULL DEFAULT 'UNREAD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS command_center_reports (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  report_type TEXT NOT NULL DEFAULT 'WEEKLY',
  period TEXT NOT NULL,
  health_score INT NOT NULL DEFAULT 0,
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  priorities TEXT[] DEFAULT ARRAY[]::TEXT[],
  opportunities TEXT[] DEFAULT ARRAY[]::TEXT[],
  risks TEXT[] DEFAULT ARRAY[]::TEXT[],
  generated_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Default translation providers/versions
INSERT INTO bible_translation_providers (name, base_url, license_notes, requires_api_key, enabled)
VALUES
('Public Domain Local', NULL, 'Local/public-domain passages only. Use licensed providers for modern copyrighted translations.', false, true),
('API.Bible', 'https://api.scripture.api.bible', 'Requires provider account and translation/license permissions.', true, false),
('YouVersion Platform', 'https://developers.youversion.com', 'Requires approved developer access and Bible publisher/license permissions.', true, false)
ON CONFLICT (name) DO NOTHING;

INSERT INTO bible_versions (code, name, language, public_domain, offline_allowed, license_notes, enabled)
VALUES
('KJV', 'King James Version', 'English', true, true, 'Public domain in many jurisdictions; verify local rules.', true),
('WEB', 'World English Bible', 'English', true, true, 'Public domain modern English translation.', true)
ON CONFLICT (code) DO NOTHING;

-- Starter sanctuary activities
INSERT INTO sanctuary_activities (title, description, activity_type, points, reward_eligible, active)
VALUES
('Daily Prayer Reflection', 'Write a short prayer or reflection for today.', 'PRAYER', 10, true, true),
('Sermon Reflection', 'Write what you learned from the latest sermon and one action step.', 'SERMON_REFLECTION', 20, true, true),
('Memory Verse Practice', 'Practice and mark progress on one memory verse.', 'SCRIPTURE_MEMORY', 15, true, true),
('Serve Someone Today', 'Complete one act of service or kindness and reflect on it.', 'SERVICE', 25, true, true),
('Invite a Friend', 'Invite someone to a service, conference, or prayer room.', 'OUTREACH', 20, true, true)
ON CONFLICT DO NOTHING;
