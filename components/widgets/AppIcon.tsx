import {
  siYoutube, siSpotify, siSoundcloud, siInstagram, siX, siTiktok,
  siGithub, siCaldotcom, siTypeform, siDiscord, siBuymeacoffee, siWhatsapp,
  siGmail, siGoogledrive, siGooglecalendar, siGooglesheets, siDropbox, siNotion, siAirtable, siHubspot,
} from 'simple-icons'

interface Brand { path: string; hex: string; title: string }

// Maps each app widget type to its official brand mark (colored).
const BRAND: Record<string, Brand> = {
  app_youtube: siYoutube,
  app_spotify: siSpotify,
  app_soundcloud: siSoundcloud,
  app_instagram: siInstagram,
  app_twitter: siX,
  app_tiktok: siTiktok,
  app_github: siGithub,
  app_calcom: siCaldotcom,
  app_typeform: siTypeform,
  app_discord: siDiscord,
  app_bmc: siBuymeacoffee,
  app_whatsapp: siWhatsapp,
}

// Returns a lucide-compatible icon component that renders the real, colored logo.
export function appIconComponent(type: string) {
  const brand = BRAND[type]
  if (!brand) return null
  const Icon = ({ className }: { className?: string }) => (
    <svg role="img" aria-label={brand.title} viewBox="0 0 24 24" className={className} fill={`#${brand.hex}`} xmlns="http://www.w3.org/2000/svg">
      <path d={brand.path} />
    </svg>
  )
  Icon.displayName = `AppIcon(${type})`
  return Icon
}

// Connector logos, keyed by their simple-icons slug (see lib/connectors.ts brand).
const SLUG: Record<string, Brand> = {
  gmail: siGmail, googledrive: siGoogledrive, googlecalendar: siGooglecalendar, googlesheets: siGooglesheets,
  github: siGithub, dropbox: siDropbox, notion: siNotion, airtable: siAirtable, hubspot: siHubspot,
}
export function BrandLogo({ slug, className }: { slug: string; className?: string }) {
  const brand = SLUG[slug]
  if (!brand) {
    // Fallback for brands not in the icon set (e.g. Slack): a neutral lettered chip.
    const letter = (slug[0] || '?').toUpperCase()
    return (
      <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="5" fill="#64748b" />
        <text x="12" y="17" textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff" fontFamily="system-ui, sans-serif">{letter}</text>
      </svg>
    )
  }
  return (
    <svg role="img" aria-label={brand.title} viewBox="0 0 24 24" className={className} fill={`#${brand.hex}`} xmlns="http://www.w3.org/2000/svg">
      <path d={brand.path} />
    </svg>
  )
}

// A lucide-compatible icon component bound to a brand slug (for connected data widgets).
export function brandIconComponent(slug: string) {
  const Icon = ({ className }: { className?: string }) => <BrandLogo slug={slug} className={className} />
  Icon.displayName = `BrandIcon(${slug})`
  return Icon
}
