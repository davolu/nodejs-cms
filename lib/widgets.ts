// Extensible widget registry. Each entry is config-only: a render "kind", default
// props, and a field schema that drives the settings editor. This lets the widget
// library grow large without hand-coding a renderer + editor per widget.
// The 9 original blocks (hero/heading/paragraph/image/button/quote/features/stats/cta)
// stay bespoke; everything here is rendered by WidgetRenderer and edited generically.

export type FieldType = 'text' | 'textarea' | 'url' | 'select' | 'number' | 'items' | 'globalblock' | 'collection' | 'toggle'
export interface Field {
  key: string
  label: string
  type: FieldType
  options?: string[]
  itemFields?: Field[]
  placeholder?: string
}
export interface WidgetDef {
  type: string
  label: string
  category: string
  icon: string      // lucide icon name (mapped in the panel)
  kind: string      // render kind
  defaults: Record<string, any>
  fields: Field[]
  app?: boolean     // true = installable third-party "app" (shown in the App Store)
  appDescription?: string
  requiresConnector?: string  // renders live data from a connected app (shown in "Connected")
}

const txt = (key: string, label: string, placeholder = ''): Field => ({ key, label, type: 'text', placeholder })
const area = (key: string, label: string, placeholder = ''): Field => ({ key, label, type: 'textarea', placeholder })
const url = (key: string, label: string): Field => ({ key, label, type: 'url', placeholder: 'https://…' })

export const WIDGETS: WidgetDef[] = [
  // ── Layout ──
  { type: 'divider', label: 'Divider', category: 'Layout', icon: 'Minus', kind: 'divider',
    defaults: { style: 'line' }, fields: [{ key: 'style', label: 'Style', type: 'select', options: ['line', 'dashed', 'gradient', 'dots'] }] },
  { type: 'spacer', label: 'Spacer', category: 'Layout', icon: 'MoveVertical', kind: 'spacer',
    defaults: { size: 'md' }, fields: [{ key: 'size', label: 'Height', type: 'select', options: ['sm', 'md', 'lg', 'xl'] }] },
  { type: 'columns', label: 'Two Columns', category: 'Layout', icon: 'Columns2', kind: 'columns',
    defaults: { heading: '', colA: 'Left column text.', colB: 'Right column text.' },
    fields: [txt('heading', 'Heading (optional)'), area('colA', 'Left column'), area('colB', 'Right column')] },
  { type: 'plans', label: 'Pricing Plans', category: 'Members', icon: 'CreditCard', kind: 'plans',
    defaults: { heading: 'Choose your plan' }, fields: [txt('heading', 'Heading')] },
  { type: 'globalblock', label: 'Global Block', category: 'Layout', icon: 'Blocks', kind: 'global',
    defaults: { blockId: '' },
    fields: [{ key: 'blockId', label: 'Reusable block', type: 'globalblock' }] },

  // ── Content ──
  { type: 'list', label: 'List', category: 'Content', icon: 'List', kind: 'list',
    defaults: { variant: 'bullet', heading: '', items: [{ text: 'First point' }, { text: 'Second point' }, { text: 'Third point' }] },
    fields: [{ key: 'variant', label: 'Style', type: 'select', options: ['bullet', 'number'] }, txt('heading', 'Heading (optional)'),
      { key: 'items', label: 'Items', type: 'items', itemFields: [txt('text', 'Text')] }] },
  { type: 'checklist', label: 'Checklist', category: 'Content', icon: 'ListChecks', kind: 'list',
    defaults: { variant: 'check', heading: '', items: [{ text: 'Included feature' }, { text: 'Another feature' }] },
    fields: [txt('heading', 'Heading (optional)'), { key: 'items', label: 'Items', type: 'items', itemFields: [txt('text', 'Text')] }] },
  { type: 'alert', label: 'Alert', category: 'Content', icon: 'TriangleAlert', kind: 'alert',
    defaults: { variant: 'info', title: 'Heads up', text: 'This is an informational message.' },
    fields: [{ key: 'variant', label: 'Type', type: 'select', options: ['info', 'success', 'warning', 'error'] }, txt('title', 'Title'), area('text', 'Message')] },
  { type: 'iconbox', label: 'Icon Box', category: 'Content', icon: 'Sparkle', kind: 'iconbox',
    defaults: { title: 'Feature title', text: 'A short description of this feature.', align: 'center' },
    fields: [txt('title', 'Title'), area('text', 'Text'), { key: 'align', label: 'Align', type: 'select', options: ['left', 'center'] }] },
  { type: 'callout', label: 'Callout', category: 'Content', icon: 'Quote', kind: 'callout',
    defaults: { text: 'A short, punchy callout statement.' }, fields: [area('text', 'Text')] },
  { type: 'collection', label: 'Collection', category: 'Content', icon: 'Database', kind: 'collection',
    defaults: { heading: '', collectionId: '', columns: '3' },
    fields: [txt('heading', 'Heading (optional)'), { key: 'collectionId', label: 'Collection', type: 'collection' }, { key: 'columns', label: 'Columns', type: 'select', options: ['2', '3', '4'] }] },
  { type: 'collection_form', label: 'Collection Form', category: 'Forms', icon: 'FilePlus', kind: 'collection_form',
    defaults: { heading: 'Submit', collectionId: '', button: 'Submit', success: 'Thanks — submitted!' },
    fields: [txt('heading', 'Heading (optional)'), { key: 'collectionId', label: 'Collection', type: 'collection' }, txt('button', 'Button label'), txt('success', 'Success message')] },
  { type: 'content_split', label: 'Content + Image', category: 'Content', icon: 'Columns', kind: 'content_split',
    defaults: { heading: 'Built for teams', text: 'Explain a key benefit here with a sentence or two of supporting copy.', image: '', imageSide: 'right', label: '', href: '' },
    fields: [txt('heading', 'Heading'), area('text', 'Text'), url('image', 'Image URL'), { key: 'imageSide', label: 'Image side', type: 'select', options: ['right', 'left'] }, txt('label', 'Button (optional)'), url('href', 'Button link')] },
  { type: 'bento', label: 'Bento Grid', category: 'Layout', icon: 'LayoutGrid', kind: 'bento',
    defaults: { heading: '', items: [{ title: 'Fast', text: 'Blazing performance out of the box.' }, { title: 'Secure', text: 'Best-practice security by default.' }, { title: 'Flexible', text: 'Adapt it to any workflow.' }, { title: 'Loved', text: 'Trusted by teams everywhere.' }] },
    fields: [txt('heading', 'Heading (optional)'), { key: 'items', label: 'Cards', type: 'items', itemFields: [txt('title', 'Title'), area('text', 'Text')] }] },
  { type: 'timeline', label: 'Timeline', category: 'Content', icon: 'GitCommitHorizontal', kind: 'timeline',
    defaults: { heading: 'Our journey', items: [{ date: '2021', title: 'Founded', text: 'The idea took shape.' }, { date: '2023', title: 'Launched', text: 'Shipped to the first customers.' }, { date: '2025', title: 'Scaled', text: 'Grew to teams worldwide.' }] },
    fields: [txt('heading', 'Heading (optional)'), { key: 'items', label: 'Events', type: 'items', itemFields: [txt('date', 'Date/Label'), txt('title', 'Title'), area('text', 'Text')] }] },
  { type: 'table', label: 'Table', category: 'Content', icon: 'Table', kind: 'table',
    defaults: { heading: '', csv: 'Plan, Price, Seats\nStarter, $9, 1\nTeam, $29, 5\nBusiness, $99, Unlimited' },
    fields: [txt('heading', 'Heading (optional)'), area('csv', 'Rows (CSV — first row is the header)')] },
  { type: 'comparison', label: 'Comparison', category: 'Marketing', icon: 'Columns', kind: 'comparison',
    defaults: { heading: 'Why choose us', colA: 'Us', colB: 'Others', items: [{ label: 'Own your data', a: '✓', b: '✕' }, { label: 'One-click deploy', a: '✓', b: '✕' }, { label: 'No lock-in', a: '✓', b: '✕' }] },
    fields: [txt('heading', 'Heading (optional)'), txt('colA', 'Column A label'), txt('colB', 'Column B label'), { key: 'items', label: 'Rows', type: 'items', itemFields: [txt('label', 'Feature'), txt('a', 'Column A'), txt('b', 'Column B')] }] },
  { type: 'breadcrumb', label: 'Breadcrumb', category: 'Layout', icon: 'ChevronRight', kind: 'breadcrumb',
    defaults: { items: [{ label: 'Home', href: '/' }, { label: 'Docs', href: '/docs' }, { label: 'Getting started', href: '' }] },
    fields: [{ key: 'items', label: 'Trail', type: 'items', itemFields: [txt('label', 'Label'), url('href', 'Link (optional)')] }] },
  { type: 'badges', label: 'Badges / Tags', category: 'Layout', icon: 'Tags', kind: 'badges',
    defaults: { heading: '', items: [{ text: 'New' }, { text: 'Popular' }, { text: 'Beta' }] },
    fields: [txt('heading', 'Heading (optional)'), { key: 'items', label: 'Badges', type: 'items', itemFields: [txt('text', 'Label')] }] },
  { type: 'accordion', label: 'Accordion', category: 'Content', icon: 'ChevronDown', kind: 'accordion',
    defaults: { heading: '', items: [{ title: 'Section one', text: 'Hidden content that expands in place.' }, { title: 'Section two', text: 'Great for compressing long content.' }] },
    fields: [txt('heading', 'Heading (optional)'), { key: 'items', label: 'Sections', type: 'items', itemFields: [txt('title', 'Title'), area('text', 'Content')] }] },
  { type: 'popup', label: 'Popup / Modal', category: 'Marketing', icon: 'SquareArrowOutUpRight', kind: 'popup',
    defaults: { heading: 'Join our newsletter', text: 'Get the latest updates in your inbox.', label: 'Subscribe', href: '#', delay: '2', trigger: 'load' },
    fields: [txt('heading', 'Heading'), area('text', 'Text'), txt('label', 'Button label'), url('href', 'Button link'), { key: 'trigger', label: 'Show on', type: 'select', options: ['load', 'button'] }, { key: 'delay', label: 'Delay (seconds, for load)', type: 'number' }] },

  // ── Media ──
  { type: 'gallery', label: 'Gallery', category: 'Media', icon: 'Images', kind: 'gallery',
    defaults: { images: [{ url: 'https://picsum.photos/seed/g1/600/600' }, { url: 'https://picsum.photos/seed/g2/600/600' }, { url: 'https://picsum.photos/seed/g3/600/600' }] },
    fields: [{ key: 'images', label: 'Images', type: 'items', itemFields: [url('url', 'Image URL')] }] },
  { type: 'video', label: 'Video', category: 'Media', icon: 'Play', kind: 'video',
    defaults: { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }, fields: [url('url', 'Video URL (YouTube/Vimeo/MP4)')] },
  { type: 'logos', label: 'Logo Strip', category: 'Media', icon: 'Building2', kind: 'logos',
    defaults: { heading: 'Trusted by', images: [{ url: 'https://picsum.photos/seed/l1/200/80' }, { url: 'https://picsum.photos/seed/l2/200/80' }, { url: 'https://picsum.photos/seed/l3/200/80' }, { url: 'https://picsum.photos/seed/l4/200/80' }] },
    fields: [txt('heading', 'Heading (optional)'), { key: 'images', label: 'Logos', type: 'items', itemFields: [url('url', 'Logo URL')] }] },

  // ── Marketing ──
  { type: 'testimonials', label: 'Testimonials', category: 'Marketing', icon: 'MessageSquareQuote', kind: 'testimonials',
    defaults: { heading: 'What people say', items: [
      { text: 'This completely changed how our team works.', name: 'Alex Rivera', role: 'CEO, Northwind' },
      { text: 'Simple, fast, and a joy to use every day.', name: 'Sam Okoye', role: 'Head of Growth' },
    ] },
    fields: [txt('heading', 'Heading'), { key: 'items', label: 'Testimonials', type: 'items', itemFields: [area('text', 'Quote'), txt('name', 'Name'), txt('role', 'Role')] }] },
  { type: 'pricing', label: 'Pricing', category: 'Marketing', icon: 'Tags', kind: 'pricing',
    defaults: { heading: 'Pricing', items: [
      { name: 'Starter', price: '$0', text: 'For getting started', label: 'Choose', href: '#' },
      { name: 'Pro', price: '$29', text: 'For growing teams', label: 'Choose', href: '#' },
      { name: 'Business', price: '$99', text: 'For scale', label: 'Choose', href: '#' },
    ] },
    fields: [txt('heading', 'Heading'), { key: 'items', label: 'Plans', type: 'items', itemFields: [txt('name', 'Plan name'), txt('price', 'Price'), txt('text', 'Description'), txt('label', 'Button'), url('href', 'Button link')] }] },
  { type: 'team', label: 'Team', category: 'Marketing', icon: 'Users', kind: 'team',
    defaults: { heading: 'Our team', items: [
      { name: 'Jordan Lee', role: 'Founder', image: 'https://picsum.photos/seed/t1/300/300' },
      { name: 'Priya Nair', role: 'Engineering', image: 'https://picsum.photos/seed/t2/300/300' },
      { name: 'Marco Silva', role: 'Design', image: 'https://picsum.photos/seed/t3/300/300' },
    ] },
    fields: [txt('heading', 'Heading'), { key: 'items', label: 'Members', type: 'items', itemFields: [txt('name', 'Name'), txt('role', 'Role'), url('image', 'Photo URL')] }] },
  { type: 'steps', label: 'Steps', category: 'Marketing', icon: 'ListOrdered', kind: 'steps',
    defaults: { heading: 'How it works', items: [
      { title: 'Sign up', text: 'Create your free account in seconds.' },
      { title: 'Build', text: 'Drag blocks to compose your page.' },
      { title: 'Publish', text: 'Go live with one click.' },
    ] },
    fields: [txt('heading', 'Heading'), { key: 'items', label: 'Steps', type: 'items', itemFields: [txt('title', 'Title'), area('text', 'Text')] }] },
  { type: 'progress', label: 'Progress', category: 'Marketing', icon: 'BarChart2', kind: 'progress',
    defaults: { heading: 'Our skills', items: [{ label: 'Design', value: 90 }, { label: 'Development', value: 80 }, { label: 'Marketing', value: 70 }] },
    fields: [txt('heading', 'Heading'), { key: 'items', label: 'Bars', type: 'items', itemFields: [txt('label', 'Label'), { key: 'value', label: 'Percent', type: 'number' }] }] },
  { type: 'banner', label: 'Banner', category: 'Marketing', icon: 'Megaphone', kind: 'banner',
    defaults: { text: 'Limited-time offer — 20% off this week.', label: 'Claim offer', href: '#' },
    fields: [txt('text', 'Text'), txt('label', 'Button'), url('href', 'Button link')] },

  { type: 'newsletter', label: 'Newsletter', category: 'Forms', icon: 'Mail', kind: 'newsletter',
    defaults: { heading: 'Join our newsletter', text: 'Get updates in your inbox. No spam.', label: 'Subscribe', success: 'Thanks for subscribing!' },
    fields: [txt('heading', 'Heading'), area('text', 'Text'), txt('label', 'Button label'), txt('success', 'Success message')] },
  { type: 'contactform', label: 'Contact Form', category: 'Forms', icon: 'MessageSquare', kind: 'form',
    defaults: {
      heading: 'Get in touch', formName: 'Contact', label: 'Send message', success: "Thanks! We'll be in touch shortly.",
      fields: [{ label: 'Name', type: 'text' }, { label: 'Email', type: 'email' }, { label: 'Message', type: 'textarea' }],
    },
    fields: [
      txt('heading', 'Heading'), txt('formName', 'Form name (shown in admin)'), txt('label', 'Button label'), txt('success', 'Success message'),
      { key: 'fields', label: 'Form fields', type: 'items', itemFields: [txt('label', 'Field label'), { key: 'type', label: 'Type', type: 'select', options: ['text', 'email', 'tel', 'number', 'textarea', 'date', 'select', 'radio', 'checkbox'] }, txt('choices', 'Choices for select/radio (comma-separated)')] },
    ] },

  // ── Interactive ──
  { type: 'faq', label: 'FAQ', category: 'Interactive', icon: 'CircleHelp', kind: 'faq',
    defaults: { heading: 'Frequently asked questions', items: [
      { q: 'How does billing work?', a: 'You are billed monthly and can cancel anytime.' },
      { q: 'Is there a free plan?', a: 'Yes — the Starter plan is free forever.' },
    ] },
    fields: [txt('heading', 'Heading'), { key: 'items', label: 'Questions', type: 'items', itemFields: [txt('q', 'Question'), area('a', 'Answer')] }] },
  { type: 'tabs', label: 'Tabs', category: 'Interactive', icon: 'PanelsTopLeft', kind: 'tabs',
    defaults: { items: [
      { label: 'Overview', content: 'Overview content goes here.' },
      { label: 'Details', content: 'Details content goes here.' },
      { label: 'Pricing', content: 'Pricing content goes here.' },
    ] },
    fields: [{ key: 'items', label: 'Tabs', type: 'items', itemFields: [txt('label', 'Tab label'), area('content', 'Tab content')] }] },
  { type: 'carousel', label: 'Carousel', category: 'Interactive', icon: 'GalleryHorizontal', kind: 'carousel',
    defaults: { images: [{ url: 'https://picsum.photos/seed/c1/1200/600' }, { url: 'https://picsum.photos/seed/c2/1200/600' }, { url: 'https://picsum.photos/seed/c3/1200/600' }] },
    fields: [{ key: 'images', label: 'Slides', type: 'items', itemFields: [url('url', 'Image URL')] }] },
  { type: 'countdown', label: 'Countdown', category: 'Interactive', icon: 'Timer', kind: 'countdown',
    defaults: { title: 'Launching soon', date: '2026-12-31 23:59' },
    fields: [txt('title', 'Title'), txt('date', 'Target date', 'YYYY-MM-DD HH:MM')] },
  { type: 'beforeafter', label: 'Before / After', category: 'Interactive', icon: 'Contrast', kind: 'beforeafter',
    defaults: { before: 'https://picsum.photos/seed/before/1000/600?grayscale', after: 'https://picsum.photos/seed/before/1000/600' },
    fields: [url('before', 'Before image'), url('after', 'After image')] },

  // ── Embed ──
  { type: 'embed', label: 'Embed', category: 'Embed', icon: 'Code', kind: 'embed',
    defaults: { url: '', ratio: '16:9' },
    fields: [url('url', 'Embed URL (any iframe-able page)'), { key: 'ratio', label: 'Aspect ratio', type: 'select', options: ['16:9', '4:3', '1:1', '21:9'] }] },
  { type: 'html', label: 'HTML', category: 'Embed', icon: 'FileCode', kind: 'html',
    defaults: { code: '<div style="padding:24px;text-align:center">Your custom HTML here</div>' },
    fields: [{ key: 'code', label: 'HTML (rendered as-is — you own the code)', type: 'textarea' }] },
  { type: 'maps', label: 'Google Maps', category: 'Embed', icon: 'MapPin', kind: 'maps',
    defaults: { query: 'Lagos, Nigeria', ratio: '16:9' },
    fields: [txt('query', 'Address or place'), { key: 'ratio', label: 'Aspect ratio', type: 'select', options: ['16:9', '4:3', '1:1'] }] },
  { type: 'calendly', label: 'Calendly', category: 'Embed', icon: 'CalendarClock', kind: 'calendly',
    defaults: { url: 'https://calendly.com/your-name/30min' },
    fields: [url('url', 'Calendly link')] },

  // ── Shop ──
  { type: 'products', label: 'Product Grid', category: 'Shop', icon: 'ShoppingBag', kind: 'products',
    defaults: { heading: 'Shop', columns: '3' },
    fields: [txt('heading', 'Heading'), { key: 'columns', label: 'Columns', type: 'select', options: ['2', '3', '4'] }] },

  // ── Members ──
  { type: 'authform', label: 'Login / Signup', category: 'Members', icon: 'UserRound', kind: 'auth',
    defaults: { heading: 'Members area' }, fields: [txt('heading', 'Heading')] },
  { type: 'social_login', label: 'Social Login', category: 'Members', icon: 'LogIn', kind: 'social_login',
    defaults: { heading: 'Sign in', google: true, github: true, redirect: '/account' },
    fields: [txt('heading', 'Heading (optional)'),
      { key: 'google', label: 'Sign in with Google', type: 'toggle' },
      { key: 'github', label: 'Sign in with GitHub', type: 'toggle' },
      txt('redirect', 'Redirect after login', '/account')] },

  // ── Social ──
  { type: 'social', label: 'Social Icons', category: 'Social', icon: 'Share2', kind: 'social',
    defaults: { items: [{ platform: 'twitter', href: '#' }, { platform: 'facebook', href: '#' }, { platform: 'instagram', href: '#' }, { platform: 'linkedin', href: '#' }] },
    fields: [{ key: 'items', label: 'Links', type: 'items', itemFields: [{ key: 'platform', label: 'Platform', type: 'select', options: ['twitter', 'facebook', 'instagram', 'linkedin', 'youtube', 'github'] }, url('href', 'Link')] }] },

  // ── Connected (live data from a connected app) ──
  { type: 'sheets_table', label: 'Sheet Table', category: 'Connected', icon: 'Table', kind: 'sheets_table', requiresConnector: 'google-sheets',
    defaults: { heading: '', spreadsheetId: '', range: 'A1:E20' },
    fields: [txt('heading', 'Heading (optional)'), txt('spreadsheetId', 'Spreadsheet ID', 'from the sheet URL'), txt('range', 'Range', 'Sheet1!A1:E20')] },
  { type: 'drive_files', label: 'Drive Files', category: 'Connected', icon: 'FolderOpen', kind: 'drive_files', requiresConnector: 'google-drive',
    defaults: { heading: 'Files', limit: '10' },
    fields: [txt('heading', 'Heading'), { key: 'limit', label: 'Max files', type: 'select', options: ['5', '10', '20', '50'] }] },
  { type: 'calendar_events', label: 'Calendar Events', category: 'Connected', icon: 'CalendarClock', kind: 'calendar_events', requiresConnector: 'google-calendar',
    defaults: { heading: 'Upcoming events', limit: '5' },
    fields: [txt('heading', 'Heading'), { key: 'limit', label: 'Max events', type: 'select', options: ['3', '5', '10'] }] },
  { type: 'mailchimp_signup', label: 'Mailchimp Signup', category: 'Connected', icon: 'Mail', kind: 'mailchimp_signup', requiresConnector: 'mailchimp',
    defaults: { heading: 'Join our newsletter', listId: '', button: 'Subscribe', success: "You're in — thanks for subscribing!" },
    fields: [txt('heading', 'Heading'), txt('listId', 'Audience (List) ID'), txt('button', 'Button label'), txt('success', 'Success message')] },
  { type: 'stripe_buy', label: 'Stripe Buy Button', category: 'Connected', icon: 'CreditCard', kind: 'stripe_buy', requiresConnector: 'stripe',
    defaults: { label: 'Support us', amount: '10', currency: 'usd', button: 'Buy now' },
    fields: [txt('label', 'Item name'), { key: 'amount', label: 'Amount', type: 'number' }, txt('currency', 'Currency (e.g. usd)'), txt('button', 'Button label')] },
  { type: 'google_reviews', label: 'Google Reviews', category: 'Connected', icon: 'Star', kind: 'google_reviews', requiresConnector: 'google-places',
    defaults: { heading: 'What customers say', placeId: '', limit: '5' },
    fields: [txt('heading', 'Heading'), txt('placeId', 'Google Place ID'), { key: 'limit', label: 'Max reviews', type: 'select', options: ['3', '5'] }] },

  // ── Apps (installable third-party integrations) ──
  { type: 'app_youtube', label: 'YouTube', category: 'Apps', icon: 'Youtube', kind: 'app_youtube', app: true,
    appDescription: 'Embed a YouTube video or playlist.',
    defaults: { url: '', heading: '' }, fields: [txt('heading', 'Heading (optional)'), url('url', 'Video / playlist URL')] },
  { type: 'app_spotify', label: 'Spotify', category: 'Apps', icon: 'Music', kind: 'app_spotify', app: true,
    appDescription: 'Embed a Spotify track, album, or playlist.',
    defaults: { url: '' }, fields: [url('url', 'Spotify URL')] },
  { type: 'app_soundcloud', label: 'SoundCloud', category: 'Apps', icon: 'Music2', kind: 'app_soundcloud', app: true,
    appDescription: 'Embed a SoundCloud track or playlist.',
    defaults: { url: '' }, fields: [url('url', 'SoundCloud track URL')] },
  { type: 'app_instagram', label: 'Instagram', category: 'Apps', icon: 'Instagram', kind: 'app_instagram', app: true,
    appDescription: 'Embed an Instagram post or reel.',
    defaults: { url: '' }, fields: [url('url', 'Post / reel URL')] },
  { type: 'app_twitter', label: 'X (Twitter)', category: 'Apps', icon: 'Twitter', kind: 'app_twitter', app: true,
    appDescription: 'Embed a tweet / X post.',
    defaults: { url: '' }, fields: [url('url', 'Tweet / post URL')] },
  { type: 'app_tiktok', label: 'TikTok', category: 'Apps', icon: 'Video', kind: 'app_tiktok', app: true,
    appDescription: 'Embed a TikTok video.',
    defaults: { url: '' }, fields: [url('url', 'TikTok video URL')] },
  { type: 'app_github', label: 'GitHub Repo', category: 'Apps', icon: 'Github', kind: 'app_github', app: true,
    appDescription: 'Show a GitHub repository card (stars, language, description).',
    defaults: { repo: '' }, fields: [txt('repo', 'Repository', 'owner/name')] },
  { type: 'app_calcom', label: 'Cal.com', category: 'Apps', icon: 'CalendarClock', kind: 'app_calcom', app: true,
    appDescription: 'Embed a Cal.com scheduling page.',
    defaults: { link: '', heading: 'Book a time' }, fields: [txt('heading', 'Heading (optional)'), txt('link', 'Cal.com link', 'username/30min')] },
  { type: 'app_typeform', label: 'Typeform', category: 'Apps', icon: 'FileCode', kind: 'app_typeform', app: true,
    appDescription: 'Embed a Typeform form or survey.',
    defaults: { id: '' }, fields: [txt('id', 'Form ID or URL')] },
  { type: 'app_discord', label: 'Discord', category: 'Apps', icon: 'MessageSquare', kind: 'app_discord', app: true,
    appDescription: 'Embed a Discord server widget (enable Server Widget in Discord).',
    defaults: { serverId: '' }, fields: [txt('serverId', 'Server ID')] },
  { type: 'app_bmc', label: 'Buy Me a Coffee', category: 'Apps', icon: 'Coffee', kind: 'app_bmc', app: true,
    appDescription: 'A Buy Me a Coffee support button.',
    defaults: { username: '', label: 'Buy me a coffee' }, fields: [txt('username', 'Username'), txt('label', 'Button label')] },
  { type: 'app_whatsapp', label: 'WhatsApp Chat', category: 'Apps', icon: 'MessageCircle', kind: 'app_whatsapp', app: true,
    appDescription: 'A floating WhatsApp click-to-chat button.',
    defaults: { phone: '', message: 'Hi! I have a question.' }, fields: [txt('phone', 'Phone (with country code)', '15551234567'), txt('message', 'Prefilled message')] },
]

export const WIDGET_MAP: Record<string, WidgetDef> = Object.fromEntries(WIDGETS.map((w) => [w.type, w]))
export const APPS: WidgetDef[] = WIDGETS.filter((w) => w.app)
export function isApp(type: string): boolean { return !!WIDGET_MAP[type]?.app }
export function isWidget(type: string): boolean { return type in WIDGET_MAP }
export function widgetDef(type: string): WidgetDef | undefined { return WIDGET_MAP[type] }
export function makeWidgetProps(type: string): Record<string, any> {
  const d = WIDGET_MAP[type]
  return d ? JSON.parse(JSON.stringify(d.defaults)) : {}
}
