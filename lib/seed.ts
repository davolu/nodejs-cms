// Shared types + seed data.
// Seed data is used two ways:
//   1. As the fallback in-memory dataset when DATABASE_URL is not configured
//      (so the demo renders and is fully clickable with no database attached).
//   2. To populate a fresh Postgres database on first connection.

export type Status = 'draft' | 'published'

export interface Page {
  id: string
  title: string
  slug: string
  body: string
  template: string
  metaTitle: string
  metaDescription: string
  status: Status
  updatedAt: string
  createdAt: string
}

export interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  body: string
  featuredImage: string
  metaTitle: string
  metaDescription: string
  status: Status
  updatedAt: string
  createdAt: string
}

export interface MediaItem {
  id: string
  filename: string
  url: string
  alt: string
  mimeType: string
  sizeKb: number
  createdAt: string
}

export interface Setting {
  key: string
  value: string
  updatedAt: string
}

const iso = (d: string) => new Date(d).toISOString()

export const seedPages: Page[] = [
  {
    id: 'pg_home',
    title: 'Home',
    slug: 'home',
    body: 'Welcome to our site. This is the home page managed entirely through ContentHub.',
    template: 'landing',
    metaTitle: 'Home — Acme Inc.',
    metaDescription: 'Acme builds tools that help teams ship faster.',
    status: 'published',
    updatedAt: iso('2026-01-14'),
    createdAt: iso('2025-11-02'),
  },
  {
    id: 'pg_about',
    title: 'About Us',
    slug: 'about',
    body: 'We started in 2019 with a simple idea: content management should be fast and pleasant.',
    template: 'default',
    metaTitle: 'About Us — Acme Inc.',
    metaDescription: 'The story and team behind Acme.',
    status: 'published',
    updatedAt: iso('2026-01-08'),
    createdAt: iso('2025-11-05'),
  },
  {
    id: 'pg_pricing',
    title: 'Pricing',
    slug: 'pricing',
    body: 'Simple, transparent pricing for teams of every size.',
    template: 'default',
    metaTitle: 'Pricing — Acme Inc.',
    metaDescription: 'Plans and pricing.',
    status: 'draft',
    updatedAt: iso('2026-01-19'),
    createdAt: iso('2026-01-19'),
  },
  {
    id: 'pg_contact',
    title: 'Contact',
    slug: 'contact',
    body: 'Get in touch with the team. We usually reply within one business day.',
    template: 'contact',
    metaTitle: 'Contact — Acme Inc.',
    metaDescription: 'Reach the Acme team.',
    status: 'published',
    updatedAt: iso('2025-12-21'),
    createdAt: iso('2025-11-10'),
  },
]

export const seedPosts: Post[] = [
  {
    id: 'ps_launch',
    title: 'Introducing ContentHub',
    slug: 'introducing-contenthub',
    excerpt: 'Today we are launching a lighter, faster way to manage your website content.',
    body: 'Full post body goes here. ContentHub focuses on the essentials: pages, posts, media, and SEO.',
    featuredImage: 'https://picsum.photos/seed/launch/800/500',
    metaTitle: 'Introducing ContentHub',
    metaDescription: 'A lighter, faster CMS.',
    status: 'published',
    updatedAt: iso('2026-01-12'),
    createdAt: iso('2026-01-12'),
  },
  {
    id: 'ps_seo',
    title: '5 SEO Fields That Actually Matter',
    slug: 'seo-fields-that-matter',
    excerpt: 'Meta titles, descriptions, slugs — here is where to spend your effort.',
    body: 'Full post body goes here covering practical on-page SEO.',
    featuredImage: 'https://picsum.photos/seed/seo/800/500',
    metaTitle: '5 SEO Fields That Actually Matter',
    metaDescription: 'Practical on-page SEO.',
    status: 'published',
    updatedAt: iso('2026-01-05'),
    createdAt: iso('2026-01-05'),
  },
  {
    id: 'ps_draft',
    title: 'Roadmap for Q2',
    slug: 'roadmap-q2',
    excerpt: 'A look at what is coming next quarter.',
    body: 'Draft body — not published yet.',
    featuredImage: 'https://picsum.photos/seed/roadmap/800/500',
    metaTitle: 'Roadmap for Q2',
    metaDescription: 'What is next.',
    status: 'draft',
    updatedAt: iso('2026-01-20'),
    createdAt: iso('2026-01-18'),
  },
]

export const seedMedia: MediaItem[] = [
  { id: 'md_1', filename: 'hero-banner.jpg', url: 'https://picsum.photos/seed/hero/600/400', alt: 'Hero banner', mimeType: 'image/jpeg', sizeKb: 182, createdAt: iso('2026-01-10') },
  { id: 'md_2', filename: 'team-photo.jpg', url: 'https://picsum.photos/seed/team/600/400', alt: 'Team photo', mimeType: 'image/jpeg', sizeKb: 240, createdAt: iso('2026-01-09') },
  { id: 'md_3', filename: 'product-shot.jpg', url: 'https://picsum.photos/seed/product/600/400', alt: 'Product shot', mimeType: 'image/jpeg', sizeKb: 156, createdAt: iso('2026-01-07') },
  { id: 'md_4', filename: 'office.jpg', url: 'https://picsum.photos/seed/office/600/400', alt: 'Office', mimeType: 'image/jpeg', sizeKb: 201, createdAt: iso('2026-01-03') },
  { id: 'md_5', filename: 'logo-mark.png', url: 'https://picsum.photos/seed/logo/600/400', alt: 'Logo mark', mimeType: 'image/png', sizeKb: 44, createdAt: iso('2025-12-28') },
  { id: 'md_6', filename: 'blog-cover.jpg', url: 'https://picsum.photos/seed/cover/600/400', alt: 'Blog cover', mimeType: 'image/jpeg', sizeKb: 178, createdAt: iso('2025-12-20') },
]

export const seedSettings: Setting[] = [
  { key: 'site_title', value: 'Acme Inc.', updatedAt: iso('2026-01-01') },
  { key: 'site_description', value: 'Tools that help teams ship faster.', updatedAt: iso('2026-01-01') },
  { key: 'site_url', value: 'https://acme.example.com', updatedAt: iso('2026-01-01') },
  { key: 'posts_per_page', value: '10', updatedAt: iso('2026-01-01') },
]
