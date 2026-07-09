-- ContentHub CMS — PostgreSQL schema
-- Run automatically by lib/db.ts on first query, or manually with `npm run db:setup`.

CREATE TABLE IF NOT EXISTS pages (
  id           TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  body         TEXT NOT NULL DEFAULT '',
  template     TEXT NOT NULL DEFAULT 'default',
  meta_title   TEXT NOT NULL DEFAULT '',
  meta_desc    TEXT NOT NULL DEFAULT '',
  status       TEXT NOT NULL DEFAULT 'draft',   -- draft | published
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS posts (
  id             TEXT PRIMARY KEY,
  title          TEXT NOT NULL,
  slug           TEXT NOT NULL UNIQUE,
  excerpt        TEXT NOT NULL DEFAULT '',
  body           TEXT NOT NULL DEFAULT '',
  featured_image TEXT NOT NULL DEFAULT '',
  meta_title     TEXT NOT NULL DEFAULT '',
  meta_desc      TEXT NOT NULL DEFAULT '',
  status         TEXT NOT NULL DEFAULT 'draft',  -- draft | published
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
