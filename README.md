# ContentHub CMS

A lightweight custom CMS for creating and managing website **pages** and **blog posts**, with media handling, SEO fields, and publishing status — built with **Next.js (React) + Node.js API routes + PostgreSQL**.

Single deployable app: React on the front end, Node.js on the back end (Next.js App Router API routes), one command to deploy on Vercel.

## Features

- **Dashboard** — counts for pages, posts, media, drafts, plus recent activity
- **Pages** — list, create, edit, delete; title, slug, content, template, SEO fields, draft/published status
- **Posts** — same as pages plus excerpt and featured image; card grid listing
- **Media library** — image grid with upload, copy-URL, and delete
- **Settings** — editable site-wide key/value settings, persisted
- **SEO fields** — meta title + meta description on every page and post
- **Auto slugs** — generated from the title, editable to override

## Tech stack

| Layer     | Choice                                   |
|-----------|-------------------------------------------|
| Front end | React 18 via Next.js 14 (App Router)      |
| Back end  | Node.js — Next.js Route Handlers (`/app/api`) |
| Database  | PostgreSQL (`pg`)                         |
| Styling   | Tailwind CSS                              |
| Icons     | lucide-react                             |

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

The app runs **with no database** out of the box — it falls back to in-memory seed
data so every screen is clickable immediately (demo mode). Nothing crashes if
`DATABASE_URL` is unset.

## Connect PostgreSQL

Set `DATABASE_URL` (see `.env.example`). On first request the app creates the
schema (`db/schema.sql`) and seeds starter content automatically. To apply the
schema manually:

```bash
DATABASE_URL=postgres://user:pass@host:5432/db npm run db:setup
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import it in Vercel — it detects Next.js, no config needed.
3. (Optional) Add a Vercel Postgres / Neon integration; `DATABASE_URL` is set
   automatically and content persists. Without it, the deploy still works in demo mode.

## Project structure

```
app/
  page.tsx              Dashboard
  pages/                Pages list + new + [id]/edit
  posts/                Posts list + new + [id]/edit
  media/                Media library
  settings/             Settings
  api/                  Node.js route handlers (pages, posts, media, settings)
components/             Sidebar, forms, shared UI
lib/
  db.ts                 pg pool, schema init + seeding
  store.ts              repository layer (PostgreSQL, in-memory fallback)
  seed.ts               types + seed/demo data
db/schema.sql           PostgreSQL schema
```
