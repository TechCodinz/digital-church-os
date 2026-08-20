-- Phase 11: Conference tenant scope
--
-- Conference is the tenant root for tickets, registrations, sponsorship
-- requests, certificates and other conference-linked records. Existing
-- conferences are intentionally left unscoped. We do not silently assign
-- historical data to a church.

ALTER TABLE "Conference"
  ADD COLUMN IF NOT EXISTS church_profile_id TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Conference_church_profile_id_fkey'
  ) THEN
    ALTER TABLE "Conference"
      ADD CONSTRAINT "Conference_church_profile_id_fkey"
      FOREIGN KEY (church_profile_id)
      REFERENCES church_profiles(id)
      ON DELETE SET NULL
      ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "Conference_church_profile_id_status_startDate_idx"
  ON "Conference" (church_profile_id, status, "startDate");

-- Child tables inherit tenant ownership through conference_id. Index the
-- relationship so every tenant-authorized lookup can join through Conference
-- efficiently without duplicating church_id and risking tenant drift. These
-- child tables are Phase 4 raw-SQL tables and are intentionally not modeled as
-- duplicate Prisma tenant entities.
CREATE INDEX IF NOT EXISTS conference_tickets_conference_id_idx
  ON conference_tickets(conference_id);
CREATE INDEX IF NOT EXISTS conference_registrations_conference_created_idx
  ON conference_registrations(conference_id, created_at DESC);
CREATE INDEX IF NOT EXISTS conference_sponsorship_conference_created_idx
  ON conference_sponsorship_requests(conference_id, created_at DESC);
CREATE INDEX IF NOT EXISTS conference_certificates_conference_id_idx
  ON conference_certificates(conference_id);
