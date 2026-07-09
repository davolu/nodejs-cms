# ContentHub CMS

A real, usable custom CMS built with **Next.js (React) + Node.js API routes + PostgreSQL**. It has a login, an admin behind it, a drag-and-drop page builder, live preview, and a public front-end that renders the pages you actually create.

One deployable app: React front end, Node.js back end (Next.js App Router API routes), one Vercel deploy.

## What it does

- **Login** → protected admin. Session cookie + middleware guarding every `/admin` route.
- **Dashboard** — counts for pages, posts, media, drafts, plus recent activity.
- **Pages** with a **drag-and-drop page builder** — add/reorder/edit content blocks (hero, heading, paragraph, image, button, quote); title, slug, template, SEO fields, draft/published.
- **Posts** — excerpt, featured image, body, SEO, publish status.
- **Media library** — upload, copy-URL, delete.
- **Settings** — editable site-wide values, persisted.
- **Live preview** — the "Preview" button opens the real front-end rendering of your draft (authed-only).
- **Public front-end** — published pages render at `/{slug}`, the blog at `/blog` and `/blog/{slug}`, with nav generated from your published pages. This is the site your visitors see — not a placeholder.

## Demo login

```
Email:    admin@acme.com
Password: admin123
```

(Swap `checkCredentials` in `lib/auth.ts` for a real users table + hashed passwords for production.)

## Tech stack

| Layer     | Choice                                        |
|-----------|-----------------------------------------------|
| Front end | React 18 via Next.js 14 (App Router)          |
| Back end  | Node.js — Next.js Route Handlers (`/app/api`) |
| Database  | PostgreSQL (`pg`)                             |
| Builder   | @dnd-kit drag-and-drop                        |
| Styling   | Tailwind CSS                                  |

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000  → public site
                   # http://localhost:3000/login → admin
```

Runs **with no database** out of the box — falls back to in-memory seed data so
everything is clickable immediately. Nothing crashes if `DATABASE_URL` is unset.

## Connect PostgreSQL (Neon, Vercel Postgres, Supabase…)

Set `DATABASE_URL` (see `.env.example`). On first request the app creates the
schema (`db/schema.sql`) and seeds starter content automatically. Manual apply:

```bash
DATABASE_URL=postgres://user:pass@host/db npm run db:setup
```

## Deploy to Vercel

1. Push to GitHub.
2. Import in Vercel — Next.js is auto-detected, no config needed.
3. Optional: add a Postgres integration so `DATABASE_URL` is set and content persists.
   Without it, the deploy still works in demo mode.

## Structure

```
app/
  (site)/               Public front-end
    page.tsx            Home (renders the 'home' page)
    [slug]/page.tsx     Any published page by slug (+ ?preview=1)
    blog/               Blog index + [slug] post
  admin/                Authenticated CMS (dashboard, pages, posts, media, settings)
  login/                Login screen
  api/                  Node.js route handlers (content + auth)
components/
  BlockEditor.tsx       Drag-and-drop page builder
  BlockRenderer.tsx     Renders blocks on the public site
  PageForm / PostForm   Editors with Save / Preview
lib/
  auth.ts               Session + credential check
  db.ts                 pg pool, schema init + seeding
  store.ts              Repository (PostgreSQL + in-memory fallback)
  blocks.ts, seed.ts    Block model, types, seed data
middleware.ts           Protects /admin
db/schema.sql           PostgreSQL schema
```
