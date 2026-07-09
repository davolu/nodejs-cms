// Content model for the page builder + renderer.
// Blocks carry style "variants" so the same type can render many ways, and each
// page carries a color THEME — together they make pages genuinely different.

export type BlockType =
  | 'hero' | 'heading' | 'paragraph' | 'image' | 'button' | 'quote'
  | 'features' | 'stats' | 'cta'

export interface FeatureItem { title: string; text: string }
export interface StatItem { value: string; label: string }

export interface Block {
  id: string
  type: BlockType
  // text-bearing
  text?: string
  heading?: string
  subheading?: string
  // media
  url?: string
  alt?: string
  // action
  label?: string
  href?: string
  // quote
  cite?: string
  // style
  variant?: string
  align?: 'left' | 'center'
  bg?: 'none' | 'tint' | 'dark'
  // composite
  features?: FeatureItem[]
  stats?: StatItem[]
}

/* ── Color themes (per page) ── */
export interface Theme { from: string; to: string; solid: string; tint: string }
export const THEMES = {
  indigo:  { from: '#4f46e5', to: '#d946ef', solid: '#4f46e5', tint: '#eef2ff' },
  violet:  { from: '#7c3aed', to: '#ec4899', solid: '#7c3aed', tint: '#f5f3ff' },
  emerald: { from: '#059669', to: '#34d399', solid: '#059669', tint: '#ecfdf5' },
  teal:    { from: '#0d9488', to: '#2dd4bf', solid: '#0d9488', tint: '#f0fdfa' },
  sky:     { from: '#0284c7', to: '#38bdf8', solid: '#0284c7', tint: '#f0f9ff' },
  rose:    { from: '#e11d48', to: '#fb7185', solid: '#e11d48', tint: '#fff1f2' },
  amber:   { from: '#d97706', to: '#f59e0b', solid: '#b45309', tint: '#fffbeb' },
  slate:   { from: '#334155', to: '#64748b', solid: '#0f172a', tint: '#f1f5f9' },
} as const
export type ThemeName = keyof typeof THEMES
export const THEME_NAMES = Object.keys(THEMES) as ThemeName[]

export function themeVars(name?: string): Record<string, string> {
  const t = (name && (THEMES as any)[name]) || THEMES.indigo
  return { '--from': t.from, '--to': t.to, '--solid': t.solid, '--tint': t.tint }
}

/* ── Variant catalogs (for the editor + AI validation) ── */
export const VARIANTS: Partial<Record<BlockType, string[]>> = {
  hero: ['gradient', 'image', 'light', 'split', 'minimal'],
  image: ['rounded', 'full', 'framed'],
  button: ['gradient', 'solid', 'outline'],
  quote: ['card', 'plain'],
  cta: ['brand', 'dark'],
}
export function variantsFor(type: BlockType): string[] {
  return VARIANTS[type] || []
}

export const BLOCK_LABELS: Record<BlockType, string> = {
  hero: 'Hero',
  heading: 'Heading',
  paragraph: 'Paragraph',
  image: 'Image',
  button: 'Button',
  quote: 'Quote',
  features: 'Features',
  stats: 'Stats',
  cta: 'Call to action',
}

export function blockId(): string {
  return 'blk_' + Math.random().toString(36).slice(2, 9)
}

export function makeBlock(type: BlockType): Block {
  const id = blockId()
  switch (type) {
    case 'hero':
      return { id, type, variant: 'gradient', align: 'center', heading: 'Your headline goes here', subheading: 'A short supporting sentence that sets the scene.', url: 'https://picsum.photos/seed/' + id + '/1200/800', label: 'Get started', href: '#' }
    case 'heading':
      return { id, type, align: 'left', text: 'Section heading' }
    case 'paragraph':
      return { id, type, align: 'left', text: 'Write your content here. This paragraph renders exactly as visitors will see it on the live page.' }
    case 'image':
      return { id, type, variant: 'rounded', url: 'https://picsum.photos/seed/' + id + '/1200/600', alt: 'Descriptive alt text' }
    case 'button':
      return { id, type, variant: 'gradient', align: 'left', label: 'Learn more', href: '#' }
    case 'quote':
      return { id, type, variant: 'card', text: 'A memorable quote that adds credibility.', cite: 'Jane Doe, Acme' }
    case 'features':
      return {
        id, type, bg: 'none', heading: 'What you get',
        features: [
          { title: 'Fast', text: 'Everything is optimised for speed out of the box.' },
          { title: 'Flexible', text: 'Adapt it to whatever your team needs.' },
          { title: 'Reliable', text: 'Built to be dependable at any scale.' },
        ],
      }
    case 'stats':
      return {
        id, type, bg: 'tint',
        stats: [
          { value: '10k+', label: 'Happy users' },
          { value: '99.9%', label: 'Uptime' },
          { value: '24/7', label: 'Support' },
        ],
      }
    case 'cta':
      return { id, type, variant: 'brand', heading: 'Ready to get started?', label: 'Get started', href: '#' }
    default:
      return { id, type: 'paragraph', text: '' }
  }
}
