import type { Block } from './blocks'

export type Status = 'draft' | 'published'

export interface Page {
  id: string
  title: string
  slug: string
  blocks: Block[]
  theme: string
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
  id: string; filename: string; url: string; alt: string; mimeType: string; sizeKb: number; createdAt: string
}
export interface Setting { key: string; value: string; updatedAt: string }

export interface Submission {
  id: string
  form: string
  data: Record<string, string>
  page: string
  createdAt: string
}

const iso = (d: string) => new Date(d).toISOString()

export const seedPages: Page[] = [
  {
    id: 'pg_home',
    title: 'Home',
    slug: 'home',
    theme: 'indigo',
    blocks: [
      { id: 'b1', type: 'hero', variant: 'gradient', align: 'center', heading: 'Ship content, not tickets', subheading: 'Acme gives your team a fast, friendly way to publish pages and posts.', label: 'Get started', href: '#start' },
      { id: 'b2', type: 'features', bg: 'none', heading: 'Why teams choose Acme', features: [
        { title: 'Fast', text: 'Publish changes in seconds — no engineering queue.' },
        { title: 'Flexible', text: 'Drag blocks to build any page you can imagine.' },
        { title: 'On-brand', text: 'Pick a theme and every page stays consistent.' },
      ] },
      { id: 'b3', type: 'stats', bg: 'tint', stats: [
        { value: '10k+', label: 'Pages published' },
        { value: '4.9/5', label: 'Customer rating' },
        { value: '99.9%', label: 'Uptime' },
      ] },
      { id: 'b4', type: 'cta', variant: 'brand', heading: 'Start building your site today', label: 'Create a page', href: '#' },
    ],
    template: 'landing',
    metaTitle: 'Acme — Ship content, not tickets',
    metaDescription: 'Acme builds tools that help teams publish faster.',
    status: 'published',
    updatedAt: iso('2026-01-14'),
    createdAt: iso('2025-11-02'),
  },
  {
    id: 'pg_about',
    title: 'About Us',
    slug: 'about',
    theme: 'emerald',
    blocks: [
      { id: 'b1', type: 'hero', variant: 'split', align: 'left', heading: 'We make publishing effortless', subheading: 'Founded in 2019 to make content management fast and pleasant.', url: 'https://picsum.photos/seed/aboutteam/1000/900', label: 'Meet the team', href: '#team' },
      { id: 'b2', type: 'paragraph', align: 'left', text: 'We started with a simple idea: content management should feel great, not like a chore. Today thousands of teams use Acme to run their sites.' },
      { id: 'b3', type: 'quote', variant: 'plain', text: 'The best CMS is the one your team actually enjoys using.', cite: 'Founder, Acme' },
    ],
    template: 'default',
    metaTitle: 'About Us — Acme',
    metaDescription: 'The story and team behind Acme.',
    status: 'published',
    updatedAt: iso('2026-01-08'),
    createdAt: iso('2025-11-05'),
  },
  {
    id: 'pg_pricing',
    title: 'Pricing',
    slug: 'pricing',
    theme: 'amber',
    blocks: [
      { id: 'b1', type: 'hero', variant: 'minimal', align: 'left', heading: 'Simple, honest pricing', subheading: 'Pick a plan that grows with you.' },
      { id: 'b2', type: 'paragraph', align: 'left', text: 'This page is a draft — publish it to make it live.' },
    ],
    template: 'default',
    metaTitle: 'Pricing — Acme',
    metaDescription: 'Plans and pricing.',
    status: 'draft',
    updatedAt: iso('2026-01-19'),
    createdAt: iso('2026-01-19'),
  },
  {
    id: 'pg_contact',
    title: 'Contact',
    slug: 'contact',
    theme: 'sky',
    blocks: [
      { id: 'b1', type: 'hero', variant: 'light', align: 'center', heading: 'Get in touch', subheading: 'We usually reply within one business day.' },
      { id: 'b2', type: 'cta', variant: 'dark', heading: 'Prefer email?', label: 'Email us', href: 'mailto:hello@acme.example.com' },
    ],
    template: 'contact',
    metaTitle: 'Contact — Acme',
    metaDescription: 'Reach the Acme team.',
    status: 'published',
    updatedAt: iso('2025-12-21'),
    createdAt: iso('2025-11-10'),
  },
]

export const seedPosts: Post[] = [
  { id: 'ps_launch', title: 'Introducing ContentHub', slug: 'introducing-contenthub', excerpt: 'Today we are launching a lighter, faster way to manage your website content.', body: 'ContentHub focuses on the essentials: pages, posts, media, and SEO. Everything you publish shows up on your live site instantly.\n\nNo more waiting on engineering for a copy change.', featuredImage: 'https://picsum.photos/seed/launch/1200/600', metaTitle: 'Introducing ContentHub', metaDescription: 'A lighter, faster CMS.', status: 'published', updatedAt: iso('2026-01-12'), createdAt: iso('2026-01-12') },
  { id: 'ps_seo', title: '5 SEO Fields That Actually Matter', slug: 'seo-fields-that-matter', excerpt: 'Meta titles, descriptions, slugs — here is where to spend your effort.', body: 'On-page SEO does not need to be complicated. Get the title, description, and slug right and you are most of the way there.', featuredImage: 'https://picsum.photos/seed/seo/1200/600', metaTitle: '5 SEO Fields That Actually Matter', metaDescription: 'Practical on-page SEO.', status: 'published', updatedAt: iso('2026-01-05'), createdAt: iso('2026-01-05') },
  { id: 'ps_draft', title: 'Roadmap for Q2', slug: 'roadmap-q2', excerpt: 'A look at what is coming next quarter.', body: 'Draft body — not published yet.', featuredImage: 'https://picsum.photos/seed/roadmap/1200/600', metaTitle: 'Roadmap for Q2', metaDescription: 'What is next.', status: 'draft', updatedAt: iso('2026-01-20'), createdAt: iso('2026-01-18') },
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
  { key: 'home_page_id', value: 'pg_home', updatedAt: iso('2026-01-01') },
]

// Demo submissions (shown only in in-memory mode; a real DB starts empty).
export const seedSubmissions: Submission[] = [
  { id: 'sub_1', form: 'Contact', data: { Name: 'Dana Cruz', Email: 'dana@example.com', Message: 'Loved the demo — can we talk pricing?' }, page: '/contact', createdAt: iso('2026-01-18') },
  { id: 'sub_2', form: 'Newsletter', data: { Email: 'reader@example.com' }, page: '/', createdAt: iso('2026-01-17') },
]
