import { Block, BlockType, blockId, variantsFor } from './blocks'
import { makeWidgetProps, WIDGET_MAP } from './widgets'

// Human-readable block schema shared by the page and site generators.
export const BLOCK_SCHEMA_DOC = `Block types and their fields:
- hero: { "type":"hero", "variant": "gradient"|"image"|"light"|"split"|"minimal"|"centered"|"dark"|"glass"|"mesh"|"screenshot"|"stats"|"newsletter"|"bordered"|"left"|"bigtype"|"angled"|"spotlight"|"waves", "align":"left"|"center", "heading":string, "subheading":string, "label":string(optional button), "href":string, "url":string(only for image/split/screenshot; use https://picsum.photos/seed/<word>/1400/800), "features":[{"title":"10k+","text":"Users"}](only for the "stats" variant, 3 items) }
- heading: { "type":"heading", "align":"left"|"center", "text":string }
- paragraph: { "type":"paragraph", "align":"left"|"center", "text":string }
- image: { "type":"image", "variant":"rounded"|"full"|"framed", "url":"https://picsum.photos/seed/<word>/1200/600", "alt":string }
- button: { "type":"button", "variant":"gradient"|"solid"|"outline", "label":string, "href":string }
- quote: { "type":"quote", "variant":"card"|"plain", "text":string, "cite":string }
- features: { "type":"features", "bg":"none"|"tint", "heading":string, "features":[{"title":string,"text":string}, ...3-4] }
- stats: { "type":"stats", "bg":"none"|"tint", "stats":[{"value":string,"label":string}, ...3] }
- cta: { "type":"cta", "variant":"brand"|"dark", "heading":string, "label":string, "href":string }`

const CORE: BlockType[] = ['hero', 'heading', 'paragraph', 'image', 'button', 'quote', 'features', 'stats', 'cta']

// Widgets a page generator may place, with a short description shown to the model.
export const PAGE_WIDGETS: Record<string, string> = {
  contactform: 'a contact form (submissions can trigger automations)',
  newsletter: 'an email signup form',
  plans: 'a pricing/subscription plans section',
  sheets_table: 'a live table from a connected Google Sheet — needs "spreadsheetId" and "range"',
  drive_files: 'a live list of Google Drive files',
  calendar_events: 'a list of upcoming Google Calendar events',
}
// Extra widgets the SITE builder may also place.
export const SITE_WIDGETS: Record<string, string> = {
  ...PAGE_WIDGETS,
  content_split: 'a content section with an image beside text — set "heading", "text", "image", "imageSide"',
  bento: 'a bento grid of feature cards — set "items":[{title,text}]',
  timeline: 'a vertical timeline — set "items":[{date,title,text}]',
  comparison: 'a comparison table (you vs others) — set "colA","colB","items":[{label,a,b}] using ✓/✕',
  testimonials: 'customer quotes — set "items":[{text,name,role}]',
  team: 'a team grid — set "items":[{name,role,image}]',
  steps: 'a how-it-works steps section — set "items":[{title,text}]',
  logos: 'a logo cloud — set "images":[{url}]',
  faq: 'a FAQ accordion — set "items":[{q,a}]',
  collection: 'displays entries from a collection — set "collection" to the collection slug',
  collection_form: 'a form that lets logged-in members submit an entry — set "collection" to the slug',
  products: 'a product grid for the shop',
  authform: 'a login / signup box for members',
  social_login: 'sign in with Google / GitHub buttons',
  mailchimp_signup: 'a Mailchimp newsletter signup',
  stripe_buy: 'a Stripe buy button — set "label" and "amount"',
  google_reviews: 'your Google reviews — set "placeId"',
}
// Which connector each widget needs (undefined = always available).
export const WIDGET_REQUIRES: Record<string, string | undefined> = {
  sheets_table: 'google-sheets', drive_files: 'google-drive', calendar_events: 'google-calendar',
  mailchimp_signup: 'mailchimp', stripe_buy: 'stripe', google_reviews: 'google-places',
}

function clampVariant(type: BlockType, v: any): string | undefined {
  const opts = variantsFor(type)
  if (opts.length === 0) return undefined
  return opts.includes(v) ? v : opts[0]
}
const clampAlign = (a: any) => (a === 'center' ? 'center' : 'left')
const clampBg = (g: any) => (g === 'tint' ? 'tint' : 'none')
export const S = (v: any, d = '') => (typeof v === 'string' ? v : d)

interface NormalizeOpts { allow?: Record<string, string>; collectionMap?: Record<string, string> }

export function normalizeBlocks(raw: any, opts: NormalizeOpts = {}): Block[] {
  const allow = opts.allow || PAGE_WIDGETS
  const collectionMap = opts.collectionMap || {}
  if (!Array.isArray(raw)) return []
  const out: Block[] = []
  for (const b of raw) {
    const type = b?.type as BlockType
    if (!CORE.includes(type) && !allow[type as string]) continue
    const id = blockId()
    switch (type) {
      case 'hero':
        out.push({ id, type, variant: clampVariant(type, b.variant), align: clampAlign(b.align), heading: S(b.heading, 'Headline'), subheading: S(b.subheading), label: S(b.label), href: S(b.href, '#'), url: S(b.url, `https://picsum.photos/seed/${id}/1200/800`) }); break
      case 'heading':
        out.push({ id, type, align: clampAlign(b.align), text: S(b.text, 'Heading') }); break
      case 'paragraph':
        out.push({ id, type, align: clampAlign(b.align), text: S(b.text) }); break
      case 'image':
        out.push({ id, type, variant: clampVariant(type, b.variant), url: S(b.url, `https://picsum.photos/seed/${id}/1200/600`), alt: S(b.alt) }); break
      case 'button':
        out.push({ id, type, variant: clampVariant(type, b.variant), align: clampAlign(b.align), label: S(b.label, 'Learn more'), href: S(b.href, '#') }); break
      case 'quote':
        out.push({ id, type, variant: clampVariant(type, b.variant), text: S(b.text), cite: S(b.cite) }); break
      case 'features': {
        const items = Array.isArray(b.features) ? b.features.slice(0, 6).map((f: any) => ({ title: S(f?.title, 'Feature'), text: S(f?.text) })) : []
        out.push({ id, type, bg: clampBg(b.bg), heading: S(b.heading), features: items.length ? items : [{ title: 'Feature', text: '' }] }); break
      }
      case 'stats': {
        const items = Array.isArray(b.stats) ? b.stats.slice(0, 4).map((s: any) => ({ value: S(s?.value, '0'), label: S(s?.label, 'Label') })) : []
        out.push({ id, type, bg: clampBg(b.bg), stats: items.length ? items : [{ value: '0', label: 'Label' }] }); break
      }
      case 'cta':
        out.push({ id, type, variant: clampVariant(type, b.variant), heading: S(b.heading, 'Ready to start?'), label: S(b.label, 'Get started'), href: S(b.href, '#') }); break
      default: {
        if (allow[type as string] && WIDGET_MAP[type as string]) {
          const props: Record<string, any> = makeWidgetProps(type as string)
          if (b && typeof b === 'object') {
            for (const [k, v] of Object.entries(b)) {
              if (k === 'type' || k === 'collection') continue
              if (typeof v === 'string' || typeof v === 'number') props[k] = v
            }
          }
          // Resolve a collection slug reference to its id.
          if ((type === 'collection' || type === 'collection_form') && b.collection) {
            props.collectionId = collectionMap[b.collection] || props.collectionId || ''
          }
          out.push({ id, type, props } as Block)
        }
      }
    }
  }
  return out
}
