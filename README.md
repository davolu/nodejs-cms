# ContentHub CMS

An open-source, self-hostable **CMS + visual site builder** built with **Next.js 14 (React) + Node.js API routes + PostgreSQL**. It ships with a login-protected admin, an Elementor-style drag-and-drop page builder, dynamic features (forms, members, e-commerce, memberships), an App Store of embeddable apps, and a full **connector platform** (OAuth2 + API-key + user-defined connectors) with actions and automations.

One deployable app — React front end, Node back end, one Vercel deploy. Works with a PostgreSQL database, or runs in an in-memory demo mode with zero configuration.

**Live demo:** https://nodejs-cms.vercel.app · **Admin:** `admin@acme.com` / `admin123`


<p align="center">
  <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdavolu%2Fnodejs-cms&env=DATABASE_URL,AUTH_SECRET"><img src="https://vercel.com/button" alt="Deploy with Vercel"/></a>
  &nbsp;<a href="https://nodejs-cms.vercel.app"><strong>Live demo</strong></a>
  &nbsp;·&nbsp;<a href="./landing/index.html"><strong>Landing page</strong></a>
</p>

---

## Highlights

- **Visual page builder** — 40+ content and layout widgets, drag-to-canvas, inline editing, 8 themes with per-block variants.
- **Dynamic sites** — contact/newsletter forms, gated member content, products + cart + Stripe checkout, paid subscriptions, custom collections/content types.
- **App Store** — installable embed apps (YouTube, Spotify, Instagram, GitHub, WhatsApp…) with real, colored brand logos.
- **Connector platform** — 33+ built-in OAuth2 / API-key connectors (Gmail, Drive, Slack, HubSpot, Stripe, Mailchimp…), **plus unlimited user-defined generic OAuth2 & REST connectors** — each with named actions, a live test panel, and JSON import/export.
- **Actions & automations** — forward form submissions to your connected apps (email, Slack, Sheets, HubSpot, Mailchimp, webhooks) with best-effort, per-app routing.
- **Connected data widgets** — render live Google Sheets tables, Drive files, and Calendar events on your pages (owner token stays server-side).
- **AI** — generate whole pages from a prompt (and it can place integration widgets for connected apps), plus an inline writing assistant.
- **SEO & analytics ready** — sitemap, robots, RSS, Open Graph/Twitter cards, JSON-LD, and script injection for any analytics/chat tool.
- **Deploy-friendly** — every integration is env-driven; the UI prompts users to add the exact Vercel env vars only when they connect something.

---

## Feature tour

### Content & CMS
- Login-protected admin with a dashboard (counts + recent activity).
- **Pages** with SEO fields, templates, draft/published status, and per-page access levels (public / members / subscribers).
- **Posts / blog** with excerpts, featured images, and an AI writing assistant (draft, improve, shorten, expand, rewrite, SEO, titles, alt text).
- **Media library** — multi-upload and add-from-URL. Pluggable storage: Vercel Blob → Cloudinary → local disk → inline data-URL (auto-detected).
- **Navigation** — build the header menu, CTA, and footer.
- **Global/reusable blocks** — define once, reuse across pages; edits propagate everywhere.
- **Collections** — custom content types with a field builder and dynamic entry forms; render them with the Collection widget.

### Visual page builder
- Toggle between a form editor and a full-screen **visual editor**: a searchable widget panel, drag-to-canvas, and inline editing.
- 40+ widgets across Basic, Sections, Layout, Content, Media, Marketing, Shop, Forms, Members, Interactive, Embed, Social, **Connected**, and **Apps**.
- 8 themes with per-block variants so pages for different prompts/brands look genuinely different.

### Dynamic features
- **Forms** — Contact and Newsletter widgets with a honeypot, an admin submissions inbox, and optional email notifications.
- **Members** — signup/login widget (scrypt + HMAC), gated pages, and a members gate.
- **E-commerce** — products, a cart drawer (localStorage), server-validated **Stripe Checkout** (with a demo fallback), and an orders admin.
- **Memberships** — paid **Stripe subscriptions**, a Pricing Plans widget, a `subscribers` access tier with a paywall, and an account page.

### App Store (embeds)
- Installable embed apps: YouTube, Spotify, SoundCloud, Instagram, X, TikTok, GitHub, Cal.com, Typeform, Discord, Buy Me a Coffee, WhatsApp.
- Grouped and searchable; installed apps appear under **Apps** in the editor. Real brand logos via Simple Icons.

### Connector platform (the dynamic-site engine)
- **33+ built-in connectors** across Email, Storage, Productivity, CRM, Payments, Messaging, Developer, Social, Media, Analytics, Search, Database, AI, Support, and Scheduling.
  - **OAuth2** (Gmail, Google Drive/Calendar/Sheets/Docs, GitHub, Slack, Dropbox, Notion, Airtable, HubSpot, LinkedIn, Asana, Zoom, GitLab, Figma, Spotify, Reddit, Twitch, Salesforce, Zoho, Intercom, Calendly) — generic flow with signed state, PKCE, refresh, and per-provider auth quirks.
  - **API-key** (Mailchimp, Stripe, SendGrid, Resend, Twilio, OpenAI, Algolia, Supabase, PostHog, Cloudinary) — "connected" when their env vars are present.
- **User-defined connectors** — add any provider from the UI:
  - **Generic OAuth2** — configure authorize/token URLs, scopes, client id/secret, PKCE, token-auth style, and user-info URL.
  - **Generic REST** — base URL + auth header/value.
- **Named actions** — define method + path/body templates with `{{placeholders}}`; run them from the test panel or wire them into automations.
- **Actions layer** — Gmail send, Sheets append, Drive list/upload, Calendar list/create, Slack post/DM, HubSpot upsert, Airtable/Notion writes, Mailchimp subscribe, Stripe customer, SendGrid/Twilio/OpenAI, and a generic webhook.
- **Automations** — route each form submission to the apps you enable (Gmail, Slack, Sheets, HubSpot, Mailchimp, Webhook, or any custom named action). Best-effort; never blocks the submission.
- **Connected data widgets** — Sheets table, Drive files, Calendar events render live on public pages using the owner's token server-side.
- **Import / export** — share a connector as JSON (secrets stripped) and import it elsewhere.

### AI
- **Generate a page** from a prompt — themed layout, varied blocks, and (when relevant) integration widgets for your connected apps.
- **Writing assistant** inline in the post editor.

### SEO & analytics
- `sitemap.xml`, `robots.txt`, RSS feed, canonical + Open Graph + Twitter cards, JSON-LD (WebSite + Article), and head/body script injection from Settings.

---

## Deploy-friendly by design

Every integration is **environment-driven** and **degrades gracefully** — nothing is required to run. When a user tries to connect an app whose credentials aren't set, the Connectors admin shows the **exact env var names to add on Vercel** and the **redirect URI to register** — so people are prompted only when they actually need it. This makes the project a great one-click Vercel deploy where users add credentials over time as they turn features on.

---

## Demo logins

```
Admin:   admin@acme.com  / admin123
Member:  member@acme.com / member123
```

Swap the credential checks in `lib/auth.ts` / `lib/members.ts` for production.

---

## Tech stack

| Layer     | Choice                                          |
|-----------|-------------------------------------------------|
| Front end | React 18 via Next.js 14 (App Router)            |
| Back end  | Node.js — Next.js Route Handlers (`/app/api`)   |
| Database  | PostgreSQL (`pg`) — optional (in-memory demo)   |
| Builder   | @dnd-kit drag-and-drop                          |
| Styling   | Tailwind CSS, self-hosted fonts                 |
| Logos     | Simple Icons                                    |
| Payments  | Stripe Checkout + Subscriptions                 |
| AI        | Anthropic API                                   |

---

## Run locally

```bash
npm install
cp .env.example .env.local   # optional — app runs without it
npm run dev
```

Open http://localhost:3000 (front end) and http://localhost:3000/admin (admin).

Without a `DATABASE_URL`, the app runs in **in-memory demo mode** (a banner indicates this and changes won't persist across restarts). Add a database to persist.

## Connect PostgreSQL (Neon, Vercel Postgres, Supabase…)

Set `DATABASE_URL`. The schema is created and seeded automatically on first run.

## Deploy to Vercel

1. Push to GitHub and import the repo in Vercel.
2. Add `DATABASE_URL` (and any integration env vars you want) in **Project → Settings → Environment Variables**.
3. Deploy. Turn on integrations later from **Admin → Connectors** — it tells you exactly what to add.

---

## Environment variables

All optional — add only what you use. See `.env.example` for the full list.

- **Core:** `DATABASE_URL`, `AUTH_SECRET`
- **AI:** `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`
- **Email notify:** `RESEND_API_KEY`, `NOTIFY_EMAIL`, `FROM_EMAIL`
- **Payments:** `STRIPE_SECRET_KEY`
- **Uploads:** `BLOB_READ_WRITE_TOKEN` / Vercel Blob (OIDC), or `CLOUDINARY_*`, or local `UPLOAD_DIR`
- **Connectors (OAuth):** `GOOGLE_CLIENT_ID/SECRET`, `GITHUB_*`, `SLACK_*`, `DROPBOX_*`, `NOTION_*`, `AIRTABLE_*`, `HUBSPOT_*`, `LINKEDIN_*`, `ASANA_*`, `ZOOM_*`, `GITLAB_*`, `FIGMA_*`, `SPOTIFY_*`, `REDDIT_*`, `TWITCH_*`, `SALESFORCE_*`, `ZOHO_*`, `INTERCOM_*`, `CALENDLY_*`
- **Connectors (API key):** `MAILCHIMP_API_KEY`, `SENDGRID_API_KEY`, `TWILIO_*`, `OPENAI_API_KEY`, `ALGOLIA_*`, `SUPABASE_*`, `POSTHOG_API_KEY`

---

## Project structure

```
app/
  (site)/        Public front end (home, pages, blog, shop, account)
  admin/         Admin (dashboard, pages, posts, blocks, collections,
                 app store, connectors, automations, media, products,
                 orders, submissions, members, memberships, navigation, settings)
  api/           Route handlers (content, auth, ai, forms, checkout,
                 connect/[id] OAuth, connectors, actions, connected/*)
components/      Renderers, visual editor, widget system, site components
lib/             Data layer + domain logic
  connectors.ts        Built-in connector registry
  custom-connectors.ts User-defined connectors (settings-backed) + merge/resolve
  oauth.ts             Generic OAuth2 (state, PKCE, exchange, refresh)
  connect.ts           Token access + connected checks
  actions.ts           Provider actions + registry + custom-action runtime
  automations.ts       Form → connected-app routing
  widgets.ts / blocks.ts  Widget & block registries
  store.ts / db.ts / schema.ts  Repositories, pg pool, inlined schema
```

## Extending

- **Add a widget:** one entry in `lib/widgets.ts` (fields + defaults) and a render case in `components/widgets/WidgetRenderer.tsx`.
- **Add a connector:** one entry in `lib/connectors.ts` — or add it from the UI (Connectors → Add connector) with zero code.
- **Add an action:** one entry in the `ACTIONS` registry in `lib/actions.ts`.

## License

MIT.
