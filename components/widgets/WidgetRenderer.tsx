'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  ArrowRight, Check, Info, CircleCheck, TriangleAlert, CircleAlert, Sparkle, ChevronDown, ChevronLeft, ChevronRight,
  Twitter, Facebook, Instagram, Linkedin, Youtube, Github, UserRound, LogOut, Blocks, Loader2, MessageCircle,
} from 'lucide-react'
import type { Block } from '@/lib/blocks'
import Reveal from '@/components/site/Reveal'
import { widgetDef } from '@/lib/widgets'
import { useCart, formatMoney } from '@/components/shop/CartProvider'

const grad = { backgroundImage: 'linear-gradient(120deg, var(--from), var(--to))' }
const solid = { backgroundColor: 'var(--solid)' }
const tint = { backgroundColor: 'var(--tint)' }

// Renders any registry widget. Reads config from block.props. Theme CSS vars
// (--from/--to/--solid/--tint) are provided by the surrounding page wrapper.
export default function WidgetRenderer({ block }: { block: Block }) {
  const def = widgetDef(block.type)
  const p = block.props || {}
  const kind = def?.kind || block.type

  switch (kind) {
    case 'divider': {
      const s = p.style || 'line'
      if (s === 'gradient') return <div className="mx-auto max-w-3xl px-6 py-8"><div className="h-1 w-full rounded-full" style={grad} /></div>
      if (s === 'dots') return <div className="flex justify-center gap-2 py-8">{[0, 1, 2].map((i) => <span key={i} className="h-2 w-2 rounded-full" style={solid} />)}</div>
      return <div className="mx-auto max-w-3xl px-6 py-8"><hr className={`border-slate-200 ${s === 'dashed' ? 'border-dashed' : ''}`} /></div>
    }
    case 'spacer': {
      const h = { sm: 'h-6', md: 'h-12', lg: 'h-20', xl: 'h-32' }[p.size as string] || 'h-12'
      return <div className={h} />
    }
    case 'columns':
      return (
        <Reveal className="mx-auto max-w-4xl px-6 py-8">
          {p.heading && <h3 className="site-heading mb-4 text-2xl font-bold text-slate-900">{p.heading}</h3>}
          <div className="grid gap-8 sm:grid-cols-2">
            <p className="leading-8 text-slate-600">{p.colA}</p>
            <p className="leading-8 text-slate-600">{p.colB}</p>
          </div>
        </Reveal>
      )
    case 'list': {
      const items = (p.items || []) as { text: string }[]
      const numbered = p.variant === 'number'
      const check = p.variant === 'check'
      return (
        <Reveal className="mx-auto max-w-3xl px-6 py-8">
          {p.heading && <h3 className="site-heading mb-4 text-2xl font-bold text-slate-900">{p.heading}</h3>}
          <ul className="space-y-3">
            {items.map((it, i) => (
              <li key={i} className="flex items-start gap-3 text-lg text-slate-600">
                {check ? <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full text-white" style={solid}><Check className="h-3 w-3" /></span>
                  : numbered ? <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-sm font-bold text-white" style={grad}>{i + 1}</span>
                  : <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full" style={solid} />}
                <span>{it.text}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      )
    }
    case 'alert': {
      const map: any = {
        info: { icon: Info, bg: 'bg-sky-50', bd: 'border-sky-200', tx: 'text-sky-800', ic: 'text-sky-500' },
        success: { icon: CircleCheck, bg: 'bg-emerald-50', bd: 'border-emerald-200', tx: 'text-emerald-800', ic: 'text-emerald-500' },
        warning: { icon: TriangleAlert, bg: 'bg-amber-50', bd: 'border-amber-200', tx: 'text-amber-800', ic: 'text-amber-500' },
        error: { icon: CircleAlert, bg: 'bg-red-50', bd: 'border-red-200', tx: 'text-red-800', ic: 'text-red-500' },
      }
      const a = map[p.variant] || map.info
      const Icon = a.icon
      return (
        <Reveal className="mx-auto max-w-3xl px-6 py-4">
          <div className={`flex gap-3 rounded-xl border p-4 ${a.bg} ${a.bd}`}>
            <Icon className={`h-5 w-5 shrink-0 ${a.ic}`} />
            <div className={a.tx}>{p.title && <div className="font-semibold">{p.title}</div>}<div className="text-sm">{p.text}</div></div>
          </div>
        </Reveal>
      )
    }
    case 'iconbox':
      return (
        <Reveal className={`mx-auto max-w-3xl px-6 py-8 ${p.align === 'center' ? 'text-center' : ''}`}>
          <span className={`grid h-12 w-12 place-items-center rounded-2xl text-white ${p.align === 'center' ? 'mx-auto' : ''}`} style={grad}><Sparkle className="h-6 w-6" /></span>
          <h3 className="site-heading mt-4 text-xl font-bold text-slate-900">{p.title}</h3>
          <p className="mt-1.5 text-slate-600">{p.text}</p>
        </Reveal>
      )
    case 'callout':
      return (
        <Reveal className="mx-auto max-w-4xl px-6 py-10">
          <div className="rounded-3xl px-8 py-10 text-center" style={tint}>
            <p className="site-heading text-2xl font-medium leading-snug text-slate-900 sm:text-3xl">{p.text}</p>
          </div>
        </Reveal>
      )
    case 'gallery':
      return (
        <Reveal className="mx-auto max-w-5xl px-6 py-10">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {(p.images || []).map((im: any, i: number) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={im.url} alt="" className="aspect-square w-full rounded-xl object-cover" />
            ))}
          </div>
        </Reveal>
      )
    case 'video': {
      const embed = toEmbed(p.url)
      return (
        <Reveal className="mx-auto max-w-4xl px-6 py-10">
          <div className="aspect-video overflow-hidden rounded-2xl bg-slate-900 shadow-xl">
            {embed.type === 'iframe' ? <iframe src={embed.src} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              : embed.type === 'video' ? <video src={embed.src} controls className="h-full w-full" />
              : <div className="grid h-full place-items-center text-slate-400">Add a video URL</div>}
          </div>
        </Reveal>
      )
    }
    case 'logos':
      return (
        <Reveal className="mx-auto max-w-5xl px-6 py-12">
          {p.heading && <p className="mb-6 text-center text-sm font-semibold uppercase tracking-widest text-slate-400">{p.heading}</p>}
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
            {(p.images || []).map((im: any, i: number) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={im.url} alt="" className="h-8 opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0" />
            ))}
          </div>
        </Reveal>
      )
    case 'testimonials':
      return (
        <section className="px-6 py-14">
          <div className="mx-auto max-w-5xl">
            {p.heading && <Reveal><h2 className="site-heading mb-10 text-center text-3xl font-bold text-slate-900 sm:text-4xl">{p.heading}</h2></Reveal>}
            <div className="grid gap-6 md:grid-cols-2">
              {(p.items || []).map((t: any, i: number) => (
                <Reveal key={i} delay={i * 80}>
                  <figure className="h-full rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                    <blockquote className="text-lg text-slate-700">“{t.text}”</blockquote>
                    <figcaption className="mt-4 text-sm"><span className="font-semibold text-slate-900">{t.name}</span>{t.role && <span className="text-slate-400"> — {t.role}</span>}</figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )
    case 'pricing':
      return (
        <section className="px-6 py-14">
          <div className="mx-auto max-w-5xl">
            {p.heading && <Reveal><h2 className="site-heading mb-10 text-center text-3xl font-bold text-slate-900 sm:text-4xl">{p.heading}</h2></Reveal>}
            <div className="grid gap-6 sm:grid-cols-3">
              {(p.items || []).map((pl: any, i: number) => (
                <Reveal key={i} delay={i * 80}>
                  <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                    <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">{pl.name}</div>
                    <div className="site-heading my-2 text-4xl font-bold" style={{ color: 'var(--solid)' }}>{pl.price}</div>
                    <p className="text-sm text-slate-500">{pl.text}</p>
                    <Link href={pl.href || '#'} className="mt-6 rounded-full py-2.5 text-sm font-semibold text-white" style={grad}>{pl.label || 'Choose'}</Link>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )
    case 'team':
      return (
        <section className="px-6 py-14">
          <div className="mx-auto max-w-5xl">
            {p.heading && <Reveal><h2 className="site-heading mb-10 text-center text-3xl font-bold text-slate-900 sm:text-4xl">{p.heading}</h2></Reveal>}
            <div className="grid gap-6 sm:grid-cols-3">
              {(p.items || []).map((m: any, i: number) => (
                <Reveal key={i} delay={i * 80} className="text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.image} alt={m.name} className="mx-auto h-28 w-28 rounded-full object-cover" />
                  <div className="site-heading mt-4 font-bold text-slate-900">{m.name}</div>
                  <div className="text-sm text-slate-500">{m.role}</div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )
    case 'steps':
      return (
        <section className="px-6 py-14">
          <div className="mx-auto max-w-4xl">
            {p.heading && <Reveal><h2 className="site-heading mb-10 text-center text-3xl font-bold text-slate-900 sm:text-4xl">{p.heading}</h2></Reveal>}
            <ol className="space-y-6">
              {(p.items || []).map((s: any, i: number) => (
                <Reveal key={i} delay={i * 80}>
                  <li className="flex gap-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold text-white" style={grad}>{i + 1}</span>
                    <div><h3 className="site-heading text-lg font-bold text-slate-900">{s.title}</h3><p className="mt-1 text-slate-600">{s.text}</p></div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>
      )
    case 'progress':
      return (
        <Reveal className="mx-auto max-w-3xl px-6 py-12">
          {p.heading && <h2 className="site-heading mb-6 text-2xl font-bold text-slate-900">{p.heading}</h2>}
          <div className="space-y-4">
            {(p.items || []).map((it: any, i: number) => (
              <div key={i}>
                <div className="mb-1 flex justify-between text-sm text-slate-600"><span>{it.label}</span><span>{it.value}%</span></div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full" style={{ ...grad, width: `${Math.max(0, Math.min(100, Number(it.value) || 0))}%` }} /></div>
              </div>
            ))}
          </div>
        </Reveal>
      )
    case 'banner':
      return (
        <Reveal className="mx-auto max-w-5xl px-6 py-8">
          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl px-6 py-5 text-white sm:flex-row" style={grad}>
            <span className="text-lg font-medium">{p.text}</span>
            {p.label && <Link href={p.href || '#'} className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900">{p.label}</Link>}
          </div>
        </Reveal>
      )
    case 'newsletter':
      return <Newsletter p={p} />
    case 'form':
      return <FormWidget p={p} />
    case 'auth':
      return <AuthForm p={p} />
    case 'products':
      return <ProductGrid p={p} />
    case 'global':
      return <GlobalPlaceholder blockId={p.blockId} />
    case 'collection':
      return <CollectionList p={p} />
    case 'plans':
      return <PlansWidget p={p} />
    case 'app_youtube':
      return <AppShell heading={p.heading}><div className="aspect-video overflow-hidden rounded-2xl ring-1 ring-slate-900/5"><iframe src={ytEmbed(p.url)} className="h-full w-full" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div></AppShell>
    case 'app_spotify':
      return <AppShell><iframe src={spotifyEmbed(p.url)} className="w-full rounded-2xl" height={p.url && p.url.includes('/track/') ? 152 : 352} loading="lazy" allow="encrypted-media" /></AppShell>
    case 'app_soundcloud':
      return <AppShell><iframe src={soundcloudEmbed(p.url)} className="w-full rounded-xl" height={166} loading="lazy" allow="autoplay" /></AppShell>
    case 'app_instagram':
      return <ScriptEmbed html={`<blockquote class="instagram-media" data-instgrm-permalink="${p.url}" style="max-width:540px;margin:auto"></blockquote>`} src="https://www.instagram.com/embed.js" reprocess={() => (window as any).instgrm?.Embeds?.process()} />
    case 'app_twitter':
      return <ScriptEmbed html={`<blockquote class="twitter-tweet"><a href="${p.url}"></a></blockquote>`} src="https://platform.twitter.com/widgets.js" reprocess={() => (window as any).twttr?.widgets?.load()} />
    case 'app_tiktok':
      return <ScriptEmbed html={`<blockquote class="tiktok-embed" cite="${p.url}" style="max-width:605px;margin:auto"></blockquote>`} src="https://www.tiktok.com/embed.js" />
    case 'app_github':
      return <GitHubCard repo={p.repo} />
    case 'app_calcom':
      return <AppShell heading={p.heading}><iframe src={`https://cal.com/${(p.link || '').replace(/^https?:\/\/cal\.com\//, '')}`} className="h-[640px] w-full rounded-2xl ring-1 ring-slate-900/5" loading="lazy" /></AppShell>
    case 'app_typeform':
      return <AppShell><iframe src={typeformSrc(p.id)} className="h-[560px] w-full rounded-2xl ring-1 ring-slate-900/5" loading="lazy" /></AppShell>
    case 'app_discord':
      return <AppShell><iframe src={`https://discord.com/widget?id=${encodeURIComponent(p.serverId || '')}&theme=dark`} className="w-full rounded-2xl" height={400} allowTransparency loading="lazy" sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts" /></AppShell>
    case 'app_bmc':
      return <AppShell><div className="text-center"><a href={`https://www.buymeacoffee.com/${p.username || ''}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#FFDD00] px-6 py-3 text-sm font-bold text-slate-900 shadow-sm">☕ {p.label || 'Buy me a coffee'}</a></div></AppShell>
    case 'app_whatsapp':
      return <WhatsAppButton p={p} />
    case 'faq':
      return <Faq heading={p.heading} items={p.items || []} />
    case 'tabs':
      return <Tabs items={p.items || []} />
    case 'carousel':
      return <Carousel images={p.images || []} />
    case 'countdown':
      return <Countdown title={p.title} date={p.date} />
    case 'beforeafter':
      return <BeforeAfter before={p.before} after={p.after} />
    case 'embed': {
      if (!p.url) return <div className="mx-auto max-w-3xl px-6 py-6 text-center text-sm text-slate-400">Add an embed URL in settings.</div>
      return (
        <Reveal className="mx-auto max-w-4xl px-6 py-8">
          <div className={`${ratioClass(p.ratio)} overflow-hidden rounded-2xl bg-slate-100 shadow-sm ring-1 ring-slate-900/5`}>
            <iframe src={p.url} className="h-full w-full" loading="lazy" allowFullScreen />
          </div>
        </Reveal>
      )
    }
    case 'maps': {
      const src = `https://www.google.com/maps?q=${encodeURIComponent(p.query || '')}&output=embed`
      return (
        <Reveal className="mx-auto max-w-4xl px-6 py-8">
          <div className={`${ratioClass(p.ratio)} overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-900/5`}>
            <iframe src={src} className="h-full w-full" loading="lazy" />
          </div>
        </Reveal>
      )
    }
    case 'calendly':
      return (
        <Reveal className="mx-auto max-w-4xl px-6 py-8">
          <iframe src={p.url} className="h-[680px] w-full rounded-2xl ring-1 ring-slate-900/5" loading="lazy" />
        </Reveal>
      )
    case 'html':
      return (
        <div className="mx-auto max-w-4xl px-6 py-6">
          <div dangerouslySetInnerHTML={{ __html: p.code || '' }} />
        </div>
      )
    case 'social': {
      const icons: any = { twitter: Twitter, facebook: Facebook, instagram: Instagram, linkedin: Linkedin, youtube: Youtube, github: Github }
      return (
        <div className="flex justify-center gap-3 py-8">
          {(p.items || []).map((s: any, i: number) => {
            const Icon = icons[s.platform] || Twitter
            return <a key={i} href={s.href || '#'} className="grid h-10 w-10 place-items-center rounded-full text-white transition-transform hover:-translate-y-0.5" style={grad}><Icon className="h-5 w-5" /></a>
          })}
        </div>
      )
    }
    default:
      return <div className="mx-auto max-w-3xl px-6 py-6 text-center text-sm text-slate-400">Unknown widget: {block.type}</div>
  }
}

function pagePath() {
  return typeof window !== 'undefined' ? window.location.pathname : ''
}

function Newsletter({ p }: { p: any }) {
  const [email, setEmail] = useState('')
  const [gotcha, setGotcha] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    const res = await fetch('/api/forms/submit', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ form: 'Newsletter', data: { Email: email }, page: pagePath(), _gotcha: gotcha }),
    }).catch(() => null)
    setStatus(res && res.ok ? 'done' : 'error')
    if (res && res.ok) setEmail('')
  }
  return (
    <Reveal className="mx-auto max-w-3xl px-6 py-14">
      <div className="rounded-3xl p-8 text-center" style={tint}>
        <h2 className="site-heading text-2xl font-bold text-slate-900 sm:text-3xl">{p.heading}</h2>
        <p className="mt-2 text-slate-600">{p.text}</p>
        {status === 'done' ? (
          <p className="mt-6 font-medium" style={{ color: 'var(--solid)' }}>{p.success || 'Thanks for subscribing!'}</p>
        ) : (
          <form onSubmit={submit} className="mx-auto mt-6 flex max-w-md gap-2">
            <input type="text" tabIndex={-1} autoComplete="off" value={gotcha} onChange={(e) => setGotcha(e.target.value)} className="hidden" aria-hidden />
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-full border border-slate-300 px-4 py-2.5 text-sm focus:outline-none" />
            <button disabled={status === 'sending'} className="shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60" style={grad}>{status === 'sending' ? '…' : (p.label || 'Subscribe')}</button>
          </form>
        )}
        {status === 'error' && <p className="mt-2 text-sm text-red-600">Something went wrong. Please try again.</p>}
      </div>
    </Reveal>
  )
}

function FormWidget({ p }: { p: any }) {
  const fields: { label: string; type: string }[] = p.fields || []
  const [values, setValues] = useState<Record<string, string>>({})
  const [gotcha, setGotcha] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const set = (k: string, v: string) => setValues((s) => ({ ...s, [k]: v }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    const res = await fetch('/api/forms/submit', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ form: p.formName || p.heading || 'Form', data: values, page: pagePath(), _gotcha: gotcha }),
    }).catch(() => null)
    setStatus(res && res.ok ? 'done' : 'error')
  }

  return (
    <Reveal className="mx-auto max-w-xl px-6 py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        {p.heading && <h2 className="site-heading mb-6 text-2xl font-bold text-slate-900 sm:text-3xl">{p.heading}</h2>}
        {status === 'done' ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full text-white" style={grad}><Check className="h-6 w-6" /></div>
            <p className="font-medium text-slate-800">{p.success || 'Thanks! Your message was sent.'}</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <input type="text" tabIndex={-1} autoComplete="off" value={gotcha} onChange={(e) => setGotcha(e.target.value)} className="hidden" aria-hidden />
            {fields.map((f, i) => (
              <div key={i}>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">{f.label}</label>
                {f.type === 'textarea'
                  ? <textarea required value={values[f.label] || ''} onChange={(e) => set(f.label, e.target.value)} className="min-h-[110px] w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none" />
                  : <input type={f.type || 'text'} required value={values[f.label] || ''} onChange={(e) => set(f.label, e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none" />}
              </div>
            ))}
            {status === 'error' && <p className="text-sm text-red-600">Something went wrong. Please try again.</p>}
            <button disabled={status === 'sending'} className="w-full rounded-full py-3 text-sm font-semibold text-white disabled:opacity-60" style={grad}>
              {status === 'sending' ? 'Sending…' : (p.label || 'Submit')}
            </button>
          </form>
        )}
      </div>
    </Reveal>
  )
}

interface ShopProduct { id: string; name: string; description: string; price: number; currency: string; image: string }
interface ColField { key: string; label: string; type: string }
interface PlanItem { id: string; name: string; priceCents: number; interval: string; description?: string; features?: string[] }
function AppShell({ heading, children }: { heading?: string; children: React.ReactNode }) {
  return (
    <section className="px-6 py-8">
      <div className="mx-auto max-w-2xl">
        {heading && <h2 className="site-heading mb-5 text-center text-2xl font-bold text-slate-900">{heading}</h2>}
        {children}
      </div>
    </section>
  )
}

function ytEmbed(u = '') {
  const list = u.match(/[?&]list=([\w-]+)/)
  if (list) return `https://www.youtube.com/embed/videoseries?list=${list[1]}`
  const id = u.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/)
  return id ? `https://www.youtube.com/embed/${id[1]}` : u
}
function spotifyEmbed(u = '') {
  return u.replace('open.spotify.com/', 'open.spotify.com/embed/')
}
function soundcloudEmbed(u = '') {
  return `https://w.soundcloud.com/player/?url=${encodeURIComponent(u)}&color=%23ff5500&auto_play=false&show_comments=false`
}
function typeformSrc(idOrUrl = '') {
  if (idOrUrl.startsWith('http')) return idOrUrl
  return `https://form.typeform.com/to/${idOrUrl}`
}

function ScriptEmbed({ html, src, reprocess }: { html: string; src: string; reprocess?: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current) return
    ref.current.innerHTML = html
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) { reprocess?.(); return }
    const s = document.createElement('script'); s.src = src; s.async = true
    s.onload = () => reprocess?.()
    document.body.appendChild(s)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html, src])
  return <section className="px-6 py-8"><div className="mx-auto max-w-xl" ref={ref} /></section>
}

function GitHubCard({ repo }: { repo?: string }) {
  const [data, setData] = useState<any>(null)
  const [err, setErr] = useState(false)
  useEffect(() => {
    if (!repo) return
    fetch(`https://api.github.com/repos/${repo.replace(/^https?:\/\/github\.com\//, '').trim()}`)
      .then((r) => (r.ok ? r.json() : Promise.reject())).then(setData).catch(() => setErr(true))
  }, [repo])
  return (
    <AppShell>
      {!repo ? <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">Set a repository (owner/name).</div>
        : err ? <div className="rounded-2xl border border-slate-200 p-6 text-center text-sm text-slate-400">Couldn’t load {repo}.</div>
        : !data ? <div className="rounded-2xl border border-slate-200 p-6 text-center text-sm text-slate-400">Loading…</div>
        : (
          <a href={data.html_url} target="_blank" rel="noopener noreferrer" className="block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center gap-2 text-slate-900"><Github className="h-5 w-5" /><span className="site-heading font-bold">{data.full_name}</span></div>
            {data.description && <p className="mt-2 text-sm text-slate-500">{data.description}</p>}
            <div className="mt-3 flex gap-4 text-xs text-slate-500">
              <span>★ {data.stargazers_count?.toLocaleString?.() ?? data.stargazers_count}</span>
              <span>⑂ {data.forks_count}</span>
              {data.language && <span>{data.language}</span>}
            </div>
          </a>
        )}
    </AppShell>
  )
}

function WhatsAppButton({ p }: { p: any }) {
  const href = `https://wa.me/${(p.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(p.message || '')}`
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp"
      className="fixed bottom-6 left-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-2xl transition-transform hover:-translate-y-0.5">
      <MessageCircle className="h-7 w-7" />
    </a>
  )
}

function PlansWidget({ p }: { p: any }) {
  const [plans, setPlans] = useState<PlanItem[]>([])
  const [busy, setBusy] = useState('')
  const [msg, setMsg] = useState('')
  const money = (c: number) => `$${(c / 100).toFixed(c % 100 === 0 ? 0 : 2)}`
  useEffect(() => { fetch('/api/plans').then((r) => r.json()).then((d) => setPlans(Array.isArray(d) ? d : [])).catch(() => {}) }, [])

  async function subscribe(planId: string) {
    setBusy(planId); setMsg('')
    const res = await fetch('/api/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ planId }) })
    const d = await res.json().catch(() => ({}))
    if (res.ok && d.url) { window.location.href = d.url; return }
    if (res.status === 401) setMsg('Please sign in or create an account first, then subscribe.')
    else setMsg(d.error || 'Could not start checkout.')
    setBusy('')
  }

  if (plans.length === 0) return <section className="px-6 py-12"><p className="text-center text-sm text-slate-400">No plans configured yet. Add them under Memberships in the admin.</p></section>

  return (
    <section className="px-6 py-14">
      <div className="mx-auto max-w-5xl">
        {p.heading && <h2 className="site-heading mb-8 text-center text-3xl font-bold text-slate-900 sm:text-4xl">{p.heading}</h2>}
        {msg && <p className="mb-4 text-center text-sm" style={{ color: 'var(--solid)' }}>{msg}</p>}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((pl) => (
            <div key={pl.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="site-heading text-lg font-bold text-slate-900">{pl.name}</div>
              <div className="mt-1"><span className="site-heading text-3xl font-bold" style={{ color: 'var(--solid)' }}>{money(pl.priceCents)}</span><span className="text-sm text-slate-400">/{pl.interval}</span></div>
              {pl.description && <p className="mt-2 text-sm text-slate-500">{pl.description}</p>}
              {pl.features && (
                <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
                  {pl.features.map((f, i) => <li key={i} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--solid)' }} /> {f}</li>)}
                </ul>
              )}
              <button onClick={() => subscribe(pl.id)} disabled={!!busy} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold text-white disabled:opacity-60" style={grad}>
                {busy === pl.id ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Subscribe
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CollectionList({ p }: { p: any }) {
  const [fields, setFields] = useState<ColField[]>([])
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!p.collectionId) { setLoading(false); return }
    Promise.all([
      fetch(`/api/collections/${p.collectionId}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/entries?collection=${p.collectionId}`).then((r) => (r.ok ? r.json() : [])),
    ]).then(([col, ents]) => { setFields(col?.fields || []); setEntries(Array.isArray(ents) ? ents : []) })
      .catch(() => {}).finally(() => setLoading(false))
  }, [p.collectionId])

  const imageField = fields.find((f) => f.type === 'image')?.key
  const descField = fields.find((f) => f.type === 'textarea' || f.type === 'text')?.key
  const urlField = fields.find((f) => f.type === 'url')?.key
  const cols = { '2': 'sm:grid-cols-2', '3': 'sm:grid-cols-2 lg:grid-cols-3', '4': 'sm:grid-cols-2 lg:grid-cols-4' }[p.columns as string] || 'sm:grid-cols-2 lg:grid-cols-3'

  return (
    <section className="px-6 py-12">
      <div className="mx-auto max-w-6xl">
        {p.heading && <h2 className="site-heading mb-8 text-center text-3xl font-bold text-slate-900 sm:text-4xl">{p.heading}</h2>}
        {loading ? <div className="py-10 text-center text-sm text-slate-400">Loading…</div>
          : !p.collectionId ? <div className="py-10 text-center text-sm text-slate-400">Pick a collection in the widget settings.</div>
          : entries.length === 0 ? <div className="py-10 text-center text-sm text-slate-400">No entries yet.</div>
          : (
            <div className={`grid grid-cols-1 gap-6 ${cols}`}>
              {entries.map((e) => {
                const card = (
                  <div className="group h-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-md">
                    {imageField && e.data?.[imageField] && (
                      <div className="aspect-video overflow-hidden bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={e.data[imageField]} alt={e.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="site-heading font-bold text-slate-900">{e.title}</h3>
                      {descField && e.data?.[descField] && <p className="mt-1 line-clamp-3 text-sm text-slate-500">{e.data[descField]}</p>}
                    </div>
                  </div>
                )
                const href = urlField ? e.data?.[urlField] : ''
                return href ? <a key={e.id} href={href} className="block">{card}</a> : <div key={e.id}>{card}</div>
              })}
            </div>
          )}
      </div>
    </section>
  )
}

function GlobalPlaceholder({ blockId }: { blockId?: string }) {
  const [name, setName] = useState<string>('')
  useEffect(() => {
    if (!blockId) return
    fetch(`/api/blocks/${blockId}`).then((r) => (r.ok ? r.json() : null)).then((d) => d && setName(d.name)).catch(() => {})
  }, [blockId])
  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-slate-500">
        <span className="grid h-9 w-9 place-items-center rounded-lg text-white" style={grad}><Blocks className="h-5 w-5" /></span>
        <div>
          <div className="text-sm font-semibold text-slate-700">Global block{name ? `: ${name}` : ''}</div>
          <div className="text-xs">{blockId ? 'Renders here on the live page. Edit it under Blocks.' : 'Pick a reusable block in settings.'}</div>
        </div>
      </div>
    </div>
  )
}

function ProductGrid({ p }: { p: any }) {
  const cart = useCart()
  const [products, setProducts] = useState<ShopProduct[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetch('/api/products').then((r) => r.json()).then((d) => setProducts(Array.isArray(d) ? d : [])).catch(() => setProducts([])).finally(() => setLoading(false))
  }, [])
  const cols = { '2': 'sm:grid-cols-2', '3': 'sm:grid-cols-2 lg:grid-cols-3', '4': 'sm:grid-cols-2 lg:grid-cols-4' }[p.columns as string] || 'sm:grid-cols-2 lg:grid-cols-3'

  return (
    <section className="px-6 py-12">
      <div className="mx-auto max-w-6xl">
        {p.heading && <h2 className="site-heading mb-8 text-center text-3xl font-bold text-slate-900 sm:text-4xl">{p.heading}</h2>}
        {loading ? (
          <div className="py-10 text-center text-sm text-slate-400">Loading products…</div>
        ) : products.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-400">No products yet. Add some in the admin under Products.</div>
        ) : (
          <div className={`grid grid-cols-1 gap-6 ${cols}`}>
            {products.map((pr) => (
              <div key={pr.id} className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="aspect-square overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={pr.image} alt={pr.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-4">
                  <h3 className="site-heading font-bold text-slate-900">{pr.name}</h3>
                  {pr.description && <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">{pr.description}</p>}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="site-heading text-lg font-bold" style={{ color: 'var(--solid)' }}>{formatMoney(pr.price, pr.currency)}</span>
                    <button onClick={() => cart.add({ id: pr.id, name: pr.name, price: pr.price, image: pr.image })} className="rounded-full px-4 py-2 text-sm font-semibold text-white" style={grad}>Add to cart</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function AuthForm({ p }: { p: any }) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [me, setMe] = useState<any>(undefined) // undefined = loading
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k: string, v: string) => setForm((s) => ({ ...s, [k]: v }))

  useEffect(() => {
    fetch('/api/member/me').then((r) => r.json()).then((d) => setMe(d.user)).catch(() => setMe(null))
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setError('')
    const url = mode === 'login' ? '/api/member/login' : '/api/member/register'
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }).catch(() => null)
    const d = res ? await res.json().catch(() => ({})) : {}
    setBusy(false)
    if (res && res.ok) { if (typeof window !== 'undefined') window.location.reload() }
    else setError(d.error || 'Something went wrong.')
  }
  async function logout() { await fetch('/api/member/logout', { method: 'POST' }); if (typeof window !== 'undefined') window.location.reload() }

  return (
    <Reveal className="mx-auto max-w-sm px-6 py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        {p.heading && <h2 className="site-heading mb-6 text-center text-2xl font-bold text-slate-900">{p.heading}</h2>}
        {me === undefined ? (
          <div className="py-6 text-center text-sm text-slate-400">Loading…</div>
        ) : me ? (
          <div className="text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full text-white" style={grad}><UserRound className="h-6 w-6" /></div>
            <p className="font-medium text-slate-800">Signed in as {me.name || me.email}</p>
            <button onClick={logout} className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"><LogOut className="h-4 w-4" /> Log out</button>
          </div>
        ) : (
          <>
            <div className="mb-5 grid grid-cols-2 rounded-lg bg-slate-100 p-1 text-sm">
              <button onClick={() => setMode('login')} className={`rounded-md py-1.5 font-medium ${mode === 'login' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Log in</button>
              <button onClick={() => setMode('register')} className={`rounded-md py-1.5 font-medium ${mode === 'register' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Sign up</button>
            </div>
            <form onSubmit={submit} className="space-y-3">
              {mode === 'register' && <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Name" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none" />}
              <input type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="Email" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none" />
              <input type="password" required value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="Password" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none" />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button disabled={busy} className="w-full rounded-full py-2.5 text-sm font-semibold text-white disabled:opacity-60" style={grad}>{busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}</button>
            </form>
          </>
        )}
      </div>
    </Reveal>
  )
}

function ratioClass(r?: string): string {
  return { '16:9': 'aspect-video', '4:3': 'aspect-[4/3]', '1:1': 'aspect-square', '21:9': 'aspect-[21/9]' }[r || '16:9'] || 'aspect-video'
}

function Tabs({ items }: { items: { label: string; content: string }[] }) {
  const [active, setActive] = useState(0)
  if (!items.length) return null
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex flex-wrap gap-1 border-b border-slate-200">
        {items.map((t, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${active === i ? 'text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            style={active === i ? { borderColor: 'var(--solid)', color: 'var(--solid)' } : undefined}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="pt-5 leading-8 text-slate-600">{items[active]?.content}</div>
    </div>
  )
}

function Carousel({ images }: { images: { url: string }[] }) {
  const [i, setI] = useState(0)
  const n = images.length
  useEffect(() => {
    if (n <= 1) return
    const t = setInterval(() => setI((v) => (v + 1) % n), 5000)
    return () => clearInterval(t)
  }, [n])
  if (!n) return null
  const go = (d: number) => setI((v) => (v + d + n) % n)
  return (
    <Reveal className="mx-auto max-w-5xl px-6 py-10">
      <div className="group relative overflow-hidden rounded-3xl shadow-xl ring-1 ring-slate-900/5">
        <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${i * 100}%)` }}>
          {images.map((im, k) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={k} src={im.url} alt="" className="aspect-[16/9] w-full shrink-0 object-cover" />
          ))}
        </div>
        {n > 1 && (
          <>
            <button onClick={() => go(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-white/80 text-slate-700 opacity-0 transition group-hover:opacity-100 hover:bg-white" aria-label="Previous"><ChevronLeft className="h-5 w-5" /></button>
            <button onClick={() => go(1)} className="absolute right-3 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-white/80 text-slate-700 opacity-0 transition group-hover:opacity-100 hover:bg-white" aria-label="Next"><ChevronRight className="h-5 w-5" /></button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {images.map((_, k) => <button key={k} onClick={() => setI(k)} className={`h-2 rounded-full transition-all ${k === i ? 'w-6 bg-white' : 'w-2 bg-white/60'}`} aria-label={`Slide ${k + 1}`} />)}
            </div>
          </>
        )}
      </div>
    </Reveal>
  )
}

function Countdown({ title, date }: { title?: string; date?: string }) {
  const target = date ? new Date(date.replace(' ', 'T')).getTime() : 0
  const [now, setNow] = useState<number>(() => Date.now())
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t) }, [])
  const diff = Math.max(0, target - now)
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  const cell = (v: number, label: string) => (
    <div className="min-w-[72px] rounded-2xl px-4 py-3 text-center text-white" style={grad}>
      <div className="site-heading text-3xl font-bold tabular-nums sm:text-4xl">{String(v).padStart(2, '0')}</div>
      <div className="text-[11px] uppercase tracking-wider opacity-80">{label}</div>
    </div>
  )
  return (
    <Reveal className="mx-auto max-w-3xl px-6 py-12 text-center">
      {title && <h2 className="site-heading mb-6 text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h2>}
      <div className="flex justify-center gap-3">{cell(d, 'Days')}{cell(h, 'Hours')}{cell(m, 'Mins')}{cell(s, 'Secs')}</div>
    </Reveal>
  )
}

function BeforeAfter({ before, after }: { before?: string; after?: string }) {
  const [pos, setPos] = useState(50)
  return (
    <Reveal className="mx-auto max-w-4xl px-6 py-10">
      <div className="relative select-none overflow-hidden rounded-3xl shadow-xl ring-1 ring-slate-900/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={after} alt="" className="block aspect-[16/9] w-full object-cover" />
        <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={before} alt="" className="aspect-[16/9] h-full w-full max-w-none object-cover" style={{ width: `${10000 / pos}%` }} />
        </div>
        <div className="absolute inset-y-0" style={{ left: `${pos}%` }}>
          <div className="absolute inset-y-0 -ml-px w-0.5 bg-white" />
          <div className="absolute top-1/2 -ml-4 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full bg-white text-slate-600 shadow">
            <ChevronLeft className="h-3 w-3" /><ChevronRight className="h-3 w-3" />
          </div>
        </div>
        <input type="range" min={0} max={100} value={pos} onChange={(e) => setPos(Number(e.target.value))} className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0" aria-label="Compare" />
      </div>
    </Reveal>
  )
}

function Faq({ heading, items }: { heading?: string; items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section className="mx-auto max-w-3xl px-6 py-14">
      {heading && <h2 className="site-heading mb-6 text-center text-3xl font-bold text-slate-900 sm:text-4xl">{heading}</h2>}
      <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200">
        {items.map((it, i) => (
          <div key={i}>
            <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium text-slate-900">
              {it.q}
              <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${open === i ? 'rotate-180' : ''}`} />
            </button>
            {open === i && <div className="px-5 pb-4 text-slate-600">{it.a}</div>}
          </div>
        ))}
      </div>
    </section>
  )
}

function toEmbed(u: string): { type: 'iframe' | 'video' | 'none'; src: string } {
  if (!u) return { type: 'none', src: '' }
  const yt = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)
  if (yt) return { type: 'iframe', src: `https://www.youtube.com/embed/${yt[1]}` }
  const vm = u.match(/vimeo\.com\/(\d+)/)
  if (vm) return { type: 'iframe', src: `https://player.vimeo.com/video/${vm[1]}` }
  if (/\.(mp4|webm|ogg)$/i.test(u)) return { type: 'video', src: u }
  return { type: 'iframe', src: u }
}
