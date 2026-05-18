CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS ai_ministry_roles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  scope TEXT NOT NULL,
  scripture_grounding TEXT[] DEFAULT ARRAY[]::TEXT[],
  confidence_threshold NUMERIC(4,2) NOT NULL DEFAULT 0.75,
  human_review_required BOOLEAN NOT NULL DEFAULT TRUE,
  escalation_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_human_review_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  role_key TEXT NOT NULL,
  interaction_id TEXT REFERENCES "AIInteraction"(id) ON DELETE SET NULL,
  confidence NUMERIC(4,2),
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  reviewed_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ai_human_review_status_idx ON ai_human_review_items(status, created_at DESC);

CREATE TABLE IF NOT EXISTS bible_study_guides (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  sermon_id TEXT REFERENCES "Sermon"(id) ON DELETE SET NULL,
  created_by TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  theme TEXT NOT NULL,
  scripture_refs TEXT[] DEFAULT ARRAY[]::TEXT[],
  discussion_questions TEXT[] DEFAULT ARRAY[]::TEXT[],
  leader_notes TEXT,
  participant_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sermon_slide_decks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  sermon_id TEXT REFERENCES "Sermon"(id) ON DELETE SET NULL,
  created_by TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slides JSONB NOT NULL DEFAULT '[]'::jsonb,
  export_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sermon_content_packs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  created_by TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  sermon_id TEXT REFERENCES "Sermon"(id) ON DELETE SET NULL,
  theme TEXT NOT NULL,
  scripture_refs TEXT[] DEFAULT ARRAY[]::TEXT[],
  pack JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sermon_content_packs_creator_idx ON sermon_content_packs(created_by, created_at DESC);

CREATE TABLE IF NOT EXISTS live_services (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  theme TEXT,
  conference_id TEXT REFERENCES "Conference"(id) ON DELETE SET NULL,
  sermon_id TEXT REFERENCES "Sermon"(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'SCHEDULED',
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  stream_url TEXT,
  replay_url TEXT,
  ai_summary TEXT,
  created_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS live_services_status_idx ON live_services(status, starts_at DESC);

CREATE TABLE IF NOT EXISTS live_service_attendance (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  live_service_id TEXT NOT NULL REFERENCES live_services(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  guest_name TEXT,
  guest_email TEXT,
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  left_at TIMESTAMPTZ,
  source TEXT DEFAULT 'web',
  UNIQUE(live_service_id, user_id)
);

CREATE TABLE IF NOT EXISTS live_sermon_notes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  live_service_id TEXT NOT NULL REFERENCES live_services(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  notes TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS live_service_prayer_requests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  live_service_id TEXT NOT NULL REFERENCES live_services(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'PRIVATE',
  follow_up_requested BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS live_offering_prompts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  live_service_id TEXT NOT NULL REFERENCES live_services(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  purpose TEXT NOT NULL DEFAULT 'COMMUNITY_AID',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS raise_hand_requests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  live_service_id TEXT NOT NULL REFERENCES live_services(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'PRAYER',
  message TEXT,
  status TEXT NOT NULL DEFAULT 'WAITING',
  assigned_to TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS breakout_prayer_rooms (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  live_service_id TEXT NOT NULL REFERENCES live_services(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  host_id TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  room_url TEXT,
  capacity INT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS salvation_responses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  live_service_id TEXT REFERENCES live_services(id) ON DELETE SET NULL,
  user_id TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  name TEXT,
  email TEXT,
  phone TEXT,
  decision_type TEXT NOT NULL DEFAULT 'SALVATION',
  follow_up_status TEXT NOT NULL DEFAULT 'PENDING',
  assigned_to TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO ai_ministry_roles (key, name, scope, scripture_grounding, confidence_threshold, human_review_required, escalation_enabled, config)
VALUES
('ai-pastor', 'AI Pastor', 'Spiritual encouragement, prayer support, and pastoral reflection.', ARRAY['Psalm 34:18','Matthew 11:28'], 0.80, TRUE, TRUE, '{"requiresDisclaimer":true}'::jsonb),
('prayer-warrior', 'AI Prayer Warrior', 'Prayer drafting, intercession prompts, and prayer follow-up support.', ARRAY['1 Thessalonians 5:17','James 5:16'], 0.75, TRUE, TRUE, '{"requiresHumanReviewForPublicPrayer":true}'::jsonb),
('counselor', 'AI Counselor', 'Care support and emotional triage with strict escalation rules.', ARRAY['Galatians 6:2','Proverbs 11:14'], 0.85, TRUE, TRUE, '{"careEscalationRequired":true}'::jsonb),
('sermon-assistant', 'AI Sermon Assistant', 'Sermon drafts, outlines, Bible study, and teaching packs.', ARRAY['2 Timothy 3:16','Nehemiah 8:8'], 0.78, TRUE, TRUE, '{"humanDoctrineReviewRequired":true}'::jsonb),
('worship-director', 'AI Worship Director', 'Worship lyrics, song suggestions, and service atmosphere.', ARRAY['Psalm 95:1','Colossians 3:16'], 0.76, TRUE, TRUE, '{"worshipLeaderReviewRequired":true}'::jsonb),
('children-teacher', 'AI Children Teacher', 'Age-aware children lessons with parent approval.', ARRAY['Proverbs 22:6','Matthew 19:14'], 0.82, TRUE, TRUE, '{"parentApprovalRequired":true}'::jsonb),
('youth-mentor', 'AI Youth Mentor', 'Youth discussion, mentorship prompts, and discipleship support.', ARRAY['1 Timothy 4:12'], 0.80, TRUE, TRUE, '{"mentorReviewRequired":true}'::jsonb),
('admin-assistant', 'AI Admin Assistant', 'Operations, CRM signals, volunteer gaps, and follow-up workflows.', ARRAY['1 Corinthians 14:40'], 0.75, TRUE, FALSE, '{"cannotMakeGovernanceDecisions":true}'::jsonb),
('outreach-director', 'AI Outreach Director', 'Visitor follow-up, outreach campaigns, and community engagement.', ARRAY['Matthew 28:19','Acts 1:8'], 0.76, TRUE, TRUE, '{"humanApprovalBeforePublishing":true}'::jsonb),
('transparency-analyst', 'AI Giving/Transparency Analyst', 'Giving trends, aid reporting, impact summaries, and risk flags.', ARRAY['2 Corinthians 8:21'], 0.82, TRUE, TRUE, '{"financeReviewRequired":true}'::jsonb)
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  scope = EXCLUDED.scope,
  scripture_grounding = EXCLUDED.scripture_grounding,
  confidence_threshold = EXCLUDED.confidence_threshold,
  human_review_required = EXCLUDED.human_review_required,
  escalation_enabled = EXCLUDED.escalation_enabled,
  config = EXCLUDED.config,
  updated_at = now();
