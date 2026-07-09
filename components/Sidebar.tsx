'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard, FileText, Newspaper, Image as ImageIcon,
  Settings, Layers, Menu, X, ExternalLink, LogOut, Inbox,
} from 'lucide-react'

const nav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/pages', label: 'Pages', icon: FileText },
  { href: '/admin/posts', label: 'Posts', icon: Newspaper },
  { href: '/admin/media', label: 'Media', icon: ImageIcon },
  { href: '/admin/submissions', label: 'Submissions', icon: Inbox },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

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

  const Footer = (
    <div className="mt-auto space-y-1 pt-4">
      <a
        href="/"
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
      >
        <ExternalLink className="h-[18px] w-[18px]" /> View site
      </a>
      <button
        onClick={logout}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
      >
        <LogOut className="h-[18px] w-[18px]" /> Log out
      </button>
    </div>
  )

  return (
    <>
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
        {Footer}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-ink-950 px-4 py-5">
            <div className="mb-6 flex items-center justify-between px-2">
              <span className="font-semibold text-white">ContentHub</span>
              <button className="text-slate-300" onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            {NavList}
            {Footer}
          </aside>
        </div>
      )}
    </>
  )
}
