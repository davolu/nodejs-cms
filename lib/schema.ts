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
  access       TEXT NOT NULL DEFAULT 'public',
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
ALTER TABLE pages ADD COLUMN IF NOT EXISTS access TEXT NOT NULL DEFAULT 'public';

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

CREATE TABLE IF NOT EXISTS submissions (
  id          TEXT PRIMARY KEY,
  form        TEXT NOT NULL DEFAULT '',
  data        JSONB NOT NULL DEFAULT '{}'::jsonb,
  page        TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_submissions_created ON submissions(created_at DESC);


CREATE TABLE IF NOT EXISTS products (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  price       INTEGER NOT NULL DEFAULT 0,
  currency    TEXT NOT NULL DEFAULT 'usd',
  image       TEXT NOT NULL DEFAULT '',
  active       BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS orders (
  id             TEXT PRIMARY KEY,
  email          TEXT NOT NULL DEFAULT '',
  items          JSONB NOT NULL DEFAULT '[]'::jsonb,
  total          INTEGER NOT NULL DEFAULT 0,
  currency       TEXT NOT NULL DEFAULT 'usd',
  status         TEXT NOT NULL DEFAULT 'pending',
  stripe_session TEXT NOT NULL DEFAULT '',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);


CREATE TABLE IF NOT EXISTS global_blocks (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  blocks     JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


CREATE TABLE IF NOT EXISTS collections (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  fields     JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS entries (
  id            TEXT PRIMARY KEY,
  collection_id TEXT NOT NULL,
  title         TEXT NOT NULL DEFAULT '',
  slug          TEXT NOT NULL DEFAULT '',
  data          JSONB NOT NULL DEFAULT '{}'::jsonb,
  status        TEXT NOT NULL DEFAULT 'published',
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_entries_collection ON entries(collection_id);

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
`
