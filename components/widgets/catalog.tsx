import {
  LayoutTemplate, Grid3x3, BarChart3, Megaphone, Quote, Heading, Type, Image as ImageIcon, MousePointerClick,
  Minus, MoveVertical, Columns2, List, ListChecks, TriangleAlert, Sparkle, Images, Play, Building2,
  MessageSquareQuote, Tags, Users, ListOrdered, BarChart2, Mail, CircleHelp, Share2,
  PanelsTopLeft, GalleryHorizontal, Timer, Contrast, Code, FileCode, MapPin, CalendarClock, MessageSquare, UserRound, ShoppingBag, Blocks, Database, CreditCard,
} from 'lucide-react'
import { WIDGETS } from '@/lib/widgets'

const NAME_ICON: Record<string, any> = {
  LayoutTemplate, Grid3x3, BarChart3, Megaphone, Quote, Heading, Type, ImageIcon, MousePointerClick,
  Minus, MoveVertical, Columns2, List, ListChecks, TriangleAlert, Sparkle, Images, Play, Building2,
  MessageSquareQuote, Tags, Users, ListOrdered, BarChart2, Mail, CircleHelp, Share2,
  PanelsTopLeft, GalleryHorizontal, Timer, Contrast, Code, FileCode, MapPin, CalendarClock, MessageSquare, UserRound, ShoppingBag, Blocks, Database, CreditCard,
}

export interface CatalogItem { type: string; label: string; category: string; icon: any }

const CORE: CatalogItem[] = [
  { type: 'heading', label: 'Heading', category: 'Basic', icon: Heading },
  { type: 'paragraph', label: 'Paragraph', category: 'Basic', icon: Type },
  { type: 'image', label: 'Image', category: 'Basic', icon: ImageIcon },
  { type: 'button', label: 'Button', category: 'Basic', icon: MousePointerClick },
  { type: 'hero', label: 'Hero', category: 'Sections', icon: LayoutTemplate },
  { type: 'features', label: 'Features', category: 'Sections', icon: Grid3x3 },
  { type: 'stats', label: 'Stats', category: 'Sections', icon: BarChart3 },
  { type: 'cta', label: 'Call to action', category: 'Sections', icon: Megaphone },
  { type: 'quote', label: 'Quote', category: 'Sections', icon: Quote },
]

const WIDGET_ITEMS: CatalogItem[] = WIDGETS.map((w) => ({ type: w.type, label: w.label, category: w.category, icon: NAME_ICON[w.icon] || Sparkle }))

export const CATALOG: CatalogItem[] = [...CORE, ...WIDGET_ITEMS]
export const CATEGORY_ORDER = ['Basic', 'Sections', 'Layout', 'Content', 'Media', 'Marketing', 'Shop', 'Forms', 'Members', 'Interactive', 'Embed', 'Social']

export function catalogByCategory(query = ''): { label: string; items: CatalogItem[] }[] {
  const q = query.trim().toLowerCase()
  return CATEGORY_ORDER.map((label) => ({
    label,
    items: CATALOG.filter((c) => c.category === label && (!q || c.label.toLowerCase().includes(q))),
  })).filter((g) => g.items.length > 0)
}

export const iconMap: Record<string, any> = Object.fromEntries(CATALOG.map((c) => [c.type, c.icon]))
export const CATALOG_COUNT = CATALOG.length
