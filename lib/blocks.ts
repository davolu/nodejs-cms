// Content model for the page builder + renderer.
// Blocks carry style "variants" so the same type can render many ways, and each
// page carries a color THEME — together they make pages genuinely different.

export type CoreBlockType =
  | 'hero' | 'heading' | 'paragraph' | 'image' | 'button' | 'quote'
  | 'features' | 'stats' | 'cta'
// Block type is a core type OR any registered widget type (kept loose for extensibility).
export type BlockType = CoreBlockType | (string & {})

export interface FeatureItem { title: string; text: string }
export interface StatItem { value: string; label: string }

// Per-block visual overrides (set via the block's Customize panel).
export interface BlockStyle { bg?: string; text?: string; accent?: string; font?: string }

export const BLOCK_FONTS = ['Space Grotesk', 'Poppins', 'Sora', 'Outfit', 'Manrope', 'Montserrat', 'Playfair Display', 'Fraunces', 'DM Serif Display', 'Inter', 'DM Sans', 'Work Sans', 'System']
const BLOCK_SERIF = new Set(['Playfair Display', 'Fraunces', 'DM Serif Display'])
export function fontStack(font?: string): string {
  if (!font || font === 'System') return 'system-ui, -apple-system, sans-serif'
  return `'${font}', ${BLOCK_SERIF.has(font) ? 'Georgia, serif' : 'system-ui, sans-serif'}`
}
export function blockFontsHref(blocks: { style?: BlockStyle }[]): string {
  const fams = Array.from(new Set(blocks.map((b) => b.style?.font).filter((f): f is string => !!f && f !== 'System')))
  if (!fams.length) return ''
  return `https://fonts.googleapis.com/css2?${fams.map((f) => `family=${encodeURIComponent(f)}:wght@400;500;600;700`).join('&')}&display=swap`
}

// CSS variables/props for a block's style overrides. Reuses the same vars the brand/theme use.
export function blockStyleVars(style?: BlockStyle): Record<string, string> {
  const v: Record<string, string> = {}
  if (!style) return v
  if (style.accent) { v['--from'] = style.accent; v['--to'] = style.accent; v['--solid'] = style.accent; v['--tint'] = style.accent + '22' }
  if (style.font) { const s = fontStack(style.font); v['--font-sans'] = s; v['--font-display'] = s }
  if (style.text) v['color'] = style.text
  if (style.bg) v['background'] = style.bg
  return v
}

export interface Block {
  id: string
  type: BlockType
  style?: BlockStyle
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
  // registry widgets store their config here
  props?: Record<string, any>
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
export const THEME_NAMES = [...Object.keys(THEMES), 'brand'] as ThemeName[]

export function themeVars(name?: string): Record<string, string> {
  // The 'brand' theme pulls from the global brand tokens (see lib/brand.ts).
  if (name === 'brand') return { '--from': 'var(--brand-from)', '--to': 'var(--brand-to)', '--solid': 'var(--brand-solid)', '--tint': 'var(--brand-tint)' }
  const t = (name && (THEMES as any)[name]) || THEMES.indigo
  return { '--from': t.from, '--to': t.to, '--solid': t.solid, '--tint': t.tint }
}

/* ── Variant catalogs (for the editor + AI validation) ── */
export const VARIANTS: Partial<Record<BlockType, string[]>> = {
  hero: ['gradient', 'image', 'light', 'split', 'minimal', 'centered', 'dark', 'glass', 'mesh', 'screenshot', 'stats', 'newsletter', 'bordered', 'left', 'bigtype', 'angled', 'spotlight', 'waves'],
  image: ['rounded', 'full', 'framed'],
  button: ['gradient', 'solid', 'outline'],
  quote: ['card', 'plain'],
  cta: ['brand', 'dark', 'card', 'split', 'minimal', 'bordered'],
  features: ['grid', 'cards', 'alt', 'iconleft', 'bordered', 'numbered'],
  stats: ['plain', 'cards', 'bordered', 'gradient'],
}
export function variantsFor(type: BlockType): string[] {
  return VARIANTS[type] || []
}

import { isWidget, makeWidgetProps, widgetDef } from './widgets'

export const BLOCK_LABELS: Record<CoreBlockType, string> = {
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

// Label for any block type — core or registered widget.
export function labelFor(type: string): string {
  return (BLOCK_LABELS as any)[type] || widgetDef(type)?.label || type
}

export function blockId(): string {
  return 'blk_' + Math.random().toString(36).slice(2, 9)
}

export function makeBlock(type: BlockType): Block {
  const id = blockId()
  if (isWidget(type)) return { id, type, props: makeWidgetProps(type) }
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
