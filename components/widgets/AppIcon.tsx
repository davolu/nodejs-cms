import {
  siYoutube, siSpotify, siSoundcloud, siInstagram, siX, siTiktok,
  siGithub, siCaldotcom, siTypeform, siDiscord, siBuymeacoffee, siWhatsapp,
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
