// Schema is inlined (not read from disk) so it is always bundled into the
// serverless function on Vercel. Reading db/schema.sql at runtime fails there
// because non-imported files aren't traced into the deployment.
export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS pages (
  id           TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  blocks       JSONB NOT NULL DEFAULT '[]'::jsonb,
  theme        TEXT NOT NULL DEFAULT 'indigo',
  template     TEXT NOT NULL DEFAULT 'default',
  meta_title   TEXT NOT NULL DEFAULT '',
  meta_desc    TEXT NOT NULL DEFAULT '',
  status       TEXT NOT NULL DEFAULT 'draft',
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Upgrade older installs that pre-date the block-based builder.
ALTER TABLE pages ADD COLUMN IF NOT EXISTS blocks JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS theme TEXT NOT NULL DEFAULT 'indigo';

CREATE TABLE IF NOT EXISTS posts (
  id             TEXT PRIMARY KEY,
  title          TEXT NOT NULL,
  slug           TEXT NOT NULL UNIQUE,
  excerpt        TEXT NOT NULL DEFAULT '',
  body           TEXT NOT NULL DEFAULT '',
  featured_image TEXT NOT NULL DEFAULT '',
  meta_title     TEXT NOT NULL DEFAULT '',
  meta_desc      TEXT NOT NULL DEFAULT '',
  status         TEXT NOT NULL DEFAULT 'draft',
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS media (
  id          TEXT PRIMARY KEY,
  filename    TEXT NOT NULL,
  url         TEXT NOT NULL,
  alt         TEXT NOT NULL DEFAULT '',
  mime_type   TEXT NOT NULL DEFAULT 'image/jpeg',
  size_kb     INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL DEFAULT '',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
`
