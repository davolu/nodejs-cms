import { settingsRepo } from './store'

// A complete brand style guide. These tokens drive the public site's look.
export interface Brand {
  primary: string      // main brand color (gradient start)
  accent: string       // secondary/accent (gradient end)
  bg: string           // page background
  surface: string      // cards / raised surfaces
  text: string         // body text
  heading: string      // heading text color
  headingFont: string  // display face
  bodyFont: string     // body face
  radius: number       // base corner radius (px)
  buttonStyle: 'rounded' | 'pill' | 'square'
}

export const DEFAULT_BRAND: Brand = {
  primary: '#4f46e5', accent: '#d946ef', bg: '#ffffff', surface: '#ffffff',
  text: '#334155', heading: '#0f172a', headingFont: 'Space Grotesk', bodyFont: 'Inter',
  radius: 16, buttonStyle: 'pill',
}

// Curated font pairings the studio offers. Value = Google Fonts family name.
export const HEADING_FONTS = ['Space Grotesk', 'Poppins', 'Sora', 'Outfit', 'Manrope', 'Montserrat', 'Playfair Display', 'Fraunces', 'DM Serif Display', 'Bricolage Grotesque', 'Instrument Serif', 'Inter']
export const BODY_FONTS = ['Inter', 'Manrope', 'DM Sans', 'Work Sans', 'Source Sans 3', 'Nunito Sans', 'Figtree', 'Roboto', 'System']

const SERIF = new Set(['Playfair Display', 'Fraunces', 'DM Serif Display', 'Instrument Serif'])
function stack(font: string): string {
  if (!font || font === 'System') return 'system-ui, -apple-system, sans-serif'
  return `'${font}', ${SERIF.has(font) ? 'Georgia, serif' : 'system-ui, sans-serif'}`
}

export async function getBrand(): Promise<Brand> {
  const v = await settingsRepo.get('brand')
  try { const p = JSON.parse(v || '{}'); return { ...DEFAULT_BRAND, ...(p && typeof p === 'object' ? p : {}) } } catch { return { ...DEFAULT_BRAND } }
}

// Google Fonts URL for the brand's chosen faces (skips system).
export function brandFontsHref(b: Brand): string {
  const fams = Array.from(new Set([b.headingFont, b.bodyFont])).filter((f) => f && f !== 'System')
  if (!fams.length) return ''
  const q = fams.map((f) => `family=${encodeURIComponent(f)}:wght@400;500;600;700`).join('&')
  return `https://fonts.googleapis.com/css2?${q}&display=swap`
}

const btnRadius = (b: Brand) => (b.buttonStyle === 'pill' ? '999px' : b.buttonStyle === 'square' ? '4px' : `${Math.min(b.radius, 14)}px`)

// Global CSS that maps brand tokens onto the variables the site already uses.
export function brandCss(b: Brand): string {
  return `:root{
  --brand-from:${b.primary};--brand-to:${b.accent};--brand-solid:${b.primary};--brand-tint:${b.primary}14;
  --brand-bg:${b.bg};--brand-surface:${b.surface};--brand-text:${b.text};--brand-heading:${b.heading};
  --brand-radius:${b.radius}px;--brand-btn-radius:${btnRadius(b)};
  --font-sans:${stack(b.bodyFont)};--font-display:${stack(b.headingFont)};
}
body{background:${b.bg};color:${b.text};font-family:var(--font-sans)}
.site-heading{font-family:var(--font-display);color:${b.heading}}
.brand-surface{background:${b.surface}}`
}
