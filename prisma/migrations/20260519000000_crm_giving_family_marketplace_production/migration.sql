CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS campuses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  country TEXT,
  timezone TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS households (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  primary_contact_id TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  address TEXT,
  city TEXT,
  country TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS household_members (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  household_id TEXT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES "User"(id) ON DELETE CASCADE,
  child_id TEXT REFERENCES "ChildProfile"(id) ON DELETE CASCADE,
  relationship TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ministry_departments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT,
  leader_id TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  campus_id TEXT REFERENCES campuses(id) ON DELETE SET NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS small_groups (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT,
  leader_id TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  meeting_day TEXT,
  meeting_time TEXT,
  location TEXT,
  campus_id TEXT REFERENCES campuses(id) ON DELETE SET NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS small_group_members (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  small_group_id TEXT NOT NULL REFERENCES small_groups(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'MEMBER',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(small_group_id, user_id)
);

CREATE TABLE IF NOT EXISTS volunteer_roles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  department_id TEXT REFERENCES ministry_departments(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  required_training TEXT[] DEFAULT ARRAY[]::TEXT[],
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS volunteer_assignments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  volunteer_role_id TEXT NOT NULL REFERENCES volunteer_roles(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  live_service_id TEXT REFERENCES live_services(id) ON DELETE SET NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'SCHEDULED',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS volunteer_assignments_due_idx ON volunteer_assignments(status, scheduled_for);

CREATE TABLE IF NOT EXISTS visitor_followups (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  source TEXT NOT NULL DEFAULT 'service',
  assigned_to TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  notes TEXT,
  next_followup_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS church_announcements (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  channels TEXT[] DEFAULT ARRAY['email']::TEXT[],
  audience TEXT NOT NULL DEFAULT 'ALL',
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_provider_configs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  provider TEXT NOT NULL UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  public_key TEXT,
  secret_ref TEXT,
  supported_currencies TEXT[] DEFAULT ARRAY[]::TEXT[],
  config JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recurring_giving_plans (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  purpose TEXT NOT NULL DEFAULT 'COMMUNITY_AID',
  interval TEXT NOT NULL DEFAULT 'MONTHLY',
  provider TEXT NOT NULL DEFAULT 'stripe',
  provider_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  next_charge_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS giving_receipts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  offering_id TEXT REFERENCES "Offering"(id) ON DELETE SET NULL,
  user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  receipt_number TEXT NOT NULL UNIQUE,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  pdf_url TEXT,
  emailed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS giving_statements (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  year INT NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  pdf_url TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, year, currency)
);

CREATE TABLE IF NOT EXISTS fund_allocations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  source_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  approved_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public_impact_reports (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  period TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  giving_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  aid_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  people_helped INT NOT NULL DEFAULT 0,
  stories JSONB DEFAULT '[]'::jsonb,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fraud_risk_reviews (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  risk_score INT NOT NULL DEFAULT 0,
  reasons TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT NOT NULL DEFAULT 'PENDING',
  reviewed_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS children_lessons (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  age_min INT NOT NULL DEFAULT 3,
  age_max INT NOT NULL DEFAULT 12,
  scripture_refs TEXT[] DEFAULT ARRAY[]::TEXT[],
  lesson JSONB NOT NULL,
  created_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS child_prayer_journal_entries (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  child_id TEXT NOT NULL REFERENCES "ChildProfile"(id) ON DELETE CASCADE,
  parent_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS memory_verse_progress (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  child_id TEXT NOT NULL REFERENCES "ChildProfile"(id) ON DELETE CASCADE,
  verse_ref TEXT NOT NULL,
  verse_text TEXT,
  status TEXT NOT NULL DEFAULT 'LEARNING',
  attempts INT NOT NULL DEFAULT 0,
  mastered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(child_id, verse_ref)
);

CREATE TABLE IF NOT EXISTS parent_ai_teacher_approvals (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  child_id TEXT NOT NULL REFERENCES "ChildProfile"(id) ON DELETE CASCADE,
  parent_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  approved BOOLEAN NOT NULL DEFAULT FALSE,
  allowed_topics TEXT[] DEFAULT ARRAY[]::TEXT[],
  blocked_topics TEXT[] DEFAULT ARRAY[]::TEXT[],
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(child_id, parent_id)
);

CREATE TABLE IF NOT EXISTS sunday_school_attendance (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  child_id TEXT NOT NULL REFERENCES "ChildProfile"(id) ON DELETE CASCADE,
  live_service_id TEXT REFERENCES live_services(id) ON DELETE SET NULL,
  checked_in_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  checked_out_at TIMESTAMPTZ,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS child_devotional_assignments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  child_id TEXT NOT NULL REFERENCES "ChildProfile"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  due_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  assigned_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS family_worship_plans (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  household_id TEXT REFERENCES households(id) ON DELETE CASCADE,
  created_by TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  plan JSONB NOT NULL,
  starts_on DATE,
  ends_on DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS marketplace_products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  creator_id TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'DRAFT',
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  commission_rate NUMERIC(4,2) NOT NULL DEFAULT 0.20,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS marketplace_purchases (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id TEXT NOT NULL REFERENCES marketplace_products(id) ON DELETE CASCADE,
  buyer_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  provider TEXT,
  transaction_id TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS church_sites (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  owner_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  custom_domain TEXT UNIQUE,
  theme JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS church_site_pages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  site_id TEXT NOT NULL REFERENCES church_sites(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'CUSTOM',
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(site_id, slug)
);

CREATE TABLE IF NOT EXISTS translation_jobs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  requested_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  source_language TEXT NOT NULL,
  target_language TEXT NOT NULL,
  content_type TEXT NOT NULL,
  content_id TEXT,
  input_text TEXT,
  output_text TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
  human_review_required BOOLEAN NOT NULL DEFAULT TRUE,
  reviewed_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS voice_prayer_notes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  audio_url TEXT,
  transcript TEXT,
  language TEXT,
  visibility TEXT NOT NULL DEFAULT 'PRIVATE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audio_sermons (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  sermon_id TEXT REFERENCES "Sermon"(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  duration_seconds INT,
  language TEXT DEFAULT 'English',
  downloadable BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS offline_sync_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'QUEUED',
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS offline_sync_user_device_idx ON offline_sync_items(user_id, device_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS push_notification_subscriptions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  keys JSONB NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
