-- Phase 11 stabilization: persistent platform settings.
-- Provider credentials remain environment-managed and must not be stored here.

CREATE TABLE IF NOT EXISTS site_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE site_config IS 'Non-secret product/site configuration. Provider credentials belong in deployment environment secrets.';
