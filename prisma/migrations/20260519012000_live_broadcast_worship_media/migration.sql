CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Live Broadcast / Gathering Layer
CREATE TABLE IF NOT EXISTS live_broadcast_rooms (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  host_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  gathering_type TEXT NOT NULL DEFAULT 'DEVOTION',
  visibility TEXT NOT NULL DEFAULT 'PRIVATE',
  status TEXT NOT NULL DEFAULT 'SCHEDULED',
  starts_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  stream_provider TEXT NOT NULL DEFAULT 'internal',
  stream_url TEXT,
  playback_url TEXT,
  thumbnail_url TEXT,
  allow_comments BOOLEAN NOT NULL DEFAULT TRUE,
  allow_reactions BOOLEAN NOT NULL DEFAULT TRUE,
  allow_guest_join BOOLEAN NOT NULL DEFAULT FALSE,
  follow_up_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  reward_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS live_broadcast_rooms_status_idx ON live_broadcast_rooms(status, visibility, created_at DESC);
CREATE INDEX IF NOT EXISTS live_broadcast_rooms_host_idx ON live_broadcast_rooms(host_id, created_at DESC);

CREATE TABLE IF NOT EXISTS live_broadcast_participants (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  room_id TEXT NOT NULL REFERENCES live_broadcast_rooms(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  guest_name TEXT,
  guest_email TEXT,
  role TEXT NOT NULL DEFAULT 'VIEWER',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  left_at TIMESTAMPTZ,
  watch_seconds INT NOT NULL DEFAULT 0,
  reward_points_awarded INT NOT NULL DEFAULT 0,
  UNIQUE(room_id, user_id)
);
CREATE INDEX IF NOT EXISTS live_broadcast_participants_room_idx ON live_broadcast_participants(room_id, joined_at DESC);

CREATE TABLE IF NOT EXISTS live_broadcast_comments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  room_id TEXT NOT NULL REFERENCES live_broadcast_rooms(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  parent_id TEXT REFERENCES live_broadcast_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'PUBLIC',
  status TEXT NOT NULL DEFAULT 'VISIBLE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS live_broadcast_comments_room_idx ON live_broadcast_comments(room_id, created_at DESC);

CREATE TABLE IF NOT EXISTS live_broadcast_reactions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  room_id TEXT NOT NULL REFERENCES live_broadcast_rooms(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL DEFAULT 'LIKE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id, reaction_type)
);

CREATE TABLE IF NOT EXISTS live_broadcast_followups (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  room_id TEXT NOT NULL REFERENCES live_broadcast_rooms(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  guest_email TEXT,
  follow_up_type TEXT NOT NULL DEFAULT 'PRAYER',
  message TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  assigned_to TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS live_broadcast_followups_status_idx ON live_broadcast_followups(status, created_at DESC);

-- Worship / Praise / Atmosphere Media Layer
CREATE TABLE IF NOT EXISTS worship_media_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  uploaded_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  artist TEXT,
  media_type TEXT NOT NULL DEFAULT 'AUDIO',
  category TEXT NOT NULL DEFAULT 'WORSHIP',
  source_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INT,
  language TEXT DEFAULT 'English',
  scripture_refs TEXT[] DEFAULT ARRAY[]::TEXT[],
  mood_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  license_type TEXT NOT NULL DEFAULT 'USER_UPLOADED',
  visibility TEXT NOT NULL DEFAULT 'PRIVATE',
  status TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
  reward_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS worship_media_items_catalog_idx ON worship_media_items(status, visibility, category, created_at DESC);

CREATE TABLE IF NOT EXISTS worship_playlists (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  created_by TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  playlist_type TEXT NOT NULL DEFAULT 'PRAYER_ATMOSPHERE',
  visibility TEXT NOT NULL DEFAULT 'PRIVATE',
  reward_sequence_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS worship_playlist_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  playlist_id TEXT NOT NULL REFERENCES worship_playlists(id) ON DELETE CASCADE,
  media_item_id TEXT NOT NULL REFERENCES worship_media_items(id) ON DELETE CASCADE,
  item_order INT NOT NULL DEFAULT 1,
  transition_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(playlist_id, item_order)
);

CREATE TABLE IF NOT EXISTS worship_playback_sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  media_item_id TEXT REFERENCES worship_media_items(id) ON DELETE SET NULL,
  playlist_id TEXT REFERENCES worship_playlists(id) ON DELETE SET NULL,
  room_id TEXT REFERENCES live_broadcast_rooms(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  listened_seconds INT NOT NULL DEFAULT 0,
  watched_seconds INT NOT NULL DEFAULT 0,
  completion_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  reward_points_awarded INT NOT NULL DEFAULT 0,
  context TEXT NOT NULL DEFAULT 'PERSONAL',
  metadata JSONB DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS worship_playback_user_idx ON worship_playback_sessions(user_id, started_at DESC);

CREATE TABLE IF NOT EXISTS worship_sequence_rewards (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  playlist_id TEXT REFERENCES worship_playlists(id) ON DELETE SET NULL,
  room_id TEXT REFERENCES live_broadcast_rooms(id) ON DELETE SET NULL,
  sequence_type TEXT NOT NULL DEFAULT 'LISTENING_SEQUENCE',
  required_items INT NOT NULL DEFAULT 3,
  completed_items INT NOT NULL DEFAULT 0,
  points_awarded INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'IN_PROGRESS',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed starter atmosphere playlist categories as media placeholders
INSERT INTO sanctuary_activities (title, description, activity_type, points, reward_eligible, active, metadata)
VALUES
('Join a Live Devotion', 'Attend or host a live devotional gathering and participate respectfully.', 'LIVE_DEVOTION', 20, true, true, '{"source":"live_broadcast"}'::jsonb),
('Complete a Worship Listening Sequence', 'Listen through an approved worship or prayer atmosphere playlist.', 'WORSHIP_LISTENING', 25, true, true, '{"source":"worship_media"}'::jsonb),
('Encourage a Broadcast Host', 'Leave a meaningful comment, prayer, or encouragement on a public gathering.', 'BROADCAST_ENCOURAGEMENT', 10, true, true, '{"source":"live_broadcast"}'::jsonb)
ON CONFLICT DO NOTHING;
