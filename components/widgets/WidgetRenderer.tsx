'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  ArrowRight, Check, Info, CircleCheck, TriangleAlert, CircleAlert, Sparkle, ChevronDown, ChevronLeft, ChevronRight,
  Twitter, Facebook, Instagram, Linkedin, Youtube, Github,
} from 'lucide-react'
import type { Block } from '@/lib/blocks'
import Reveal from '@/components/site/Reveal'
import { widgetDef } from '@/lib/widgets'

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
      return (
        <Reveal className="mx-auto max-w-3xl px-6 py-14">
          <div className="rounded-3xl p-8 text-center" style={tint}>
            <h2 className="site-heading text-2xl font-bold text-slate-900 sm:text-3xl">{p.heading}</h2>
            <p className="mt-2 text-slate-600">{p.text}</p>
            <div className="mx-auto mt-6 flex max-w-md gap-2">
              <input placeholder="you@example.com" className="w-full rounded-full border border-slate-300 px-4 py-2.5 text-sm focus:outline-none" />
              <button className="shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold text-white" style={grad}>{p.label || 'Subscribe'}</button>
            </div>
          </div>
        </Reveal>
      )
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
