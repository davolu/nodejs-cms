'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard, FileText, Newspaper, Image as ImageIcon,
  Settings, Layers, Menu, X,
} from 'lucide-react'

const nav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/pages', label: 'Pages', icon: FileText },
  { href: '/posts', label: 'Posts', icon: Newspaper },
  { href: '/media', label: 'Media', icon: ImageIcon },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  const NavList = (
    <nav className="space-y-1">
      {nav.map(({ href, label, icon: Icon, exact }) => {
        const active = isActive(href, exact)
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Icon className="h-[18px] w-[18px]" />
            {label}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
            <Layers className="h-4 w-4" />
          </span>
          <span className="font-semibold text-slate-900">ContentHub</span>
        </div>
        <button className="btn-ghost" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-ink-950 px-4 py-5 md:flex">
        <div className="mb-6 flex items-center gap-2.5 px-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-white">
            <Layers className="h-5 w-5" />
          </span>
          <div>
            <div className="font-semibold text-white leading-tight">ContentHub</div>
            <div className="text-xs text-slate-400">CMS Admin</div>
          </div>
        </div>
        {NavList}
        <div className="mt-auto rounded-lg bg-white/5 px-3 py-3 text-xs text-slate-400">
          Signed in as <span className="text-slate-200">admin@acme.com</span>
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-ink-950 px-4 py-5">
            <div className="mb-6 flex items-center justify-between px-2">
              <span className="font-semibold text-white">ContentHub</span>
              <button className="text-slate-300" onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            {NavList}
          </aside>
        </div>
      )}
    </>
  )
}
