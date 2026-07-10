import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import type { Block } from '@/lib/blocks'
import { themeVars, blockStyleVars, blockFontsHref } from '@/lib/blocks'
import { isWidget } from '@/lib/widgets'
import WidgetRenderer from '@/components/widgets/WidgetRenderer'
import Reveal from '@/components/site/Reveal'

// Renders ordered content blocks into a polished, theme-aware marketing page.
export default function BlockRenderer({ blocks, theme }: { blocks: Block[]; theme?: string }) {
  if (!blocks?.length) {
    return <div className="mx-auto max-w-3xl px-6 py-20 text-center text-slate-400">This page has no content yet.</div>
  }
  const fontsHref = blockFontsHref(blocks)
  return (
    <div className="pb-24" style={themeVars(theme) as React.CSSProperties}>
      {fontsHref && <link rel="stylesheet" href={fontsHref} />}
      {blocks.map((b) => (
        b.style && Object.keys(b.style).length
          ? <div key={b.id} style={blockStyleVars(b.style) as React.CSSProperties}><BlockView block={b} /></div>
          : <BlockView key={b.id} block={b} />
      ))}
    </div>
  )
}

const wrap = 'mx-auto w-full max-w-3xl px-6'
const gradient = { backgroundImage: 'linear-gradient(120deg, var(--from), var(--to))' }
const solid = { backgroundColor: 'var(--solid)' }
const tint = { backgroundColor: 'var(--tint)' }

function Btn({ label, href, variant = 'gradient' }: { label?: string; href?: string; variant?: string }) {
  if (!label) return null
  const base = 'group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-transform duration-300 hover:-translate-y-0.5'
  if (variant === 'outline') {
    return (
      <Link href={href || '#'} className={`${base} border-2`} style={{ borderColor: 'var(--solid)', color: 'var(--solid)' }}>
        {label} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    )
  }
  const style = variant === 'solid' ? solid : gradient
  return (
    <Link href={href || '#'} className={`${base} text-white shadow-lg`} style={style}>
      {label} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
    </Link>
  )
}

function BlockView({ block: b }: { block: Block }) {
  const alignItems = b.align === 'center' ? 'items-center text-center' : 'items-start text-left'
  const alignSelf = b.align === 'center' ? 'mx-auto' : ''

  switch (b.type) {
    case 'hero': {
      const v = b.variant || 'gradient'
      if (v === 'image') {
        return (
          <section className="relative isolate overflow-hidden py-36 text-center text-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={b.url} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
            <div className="absolute inset-0 -z-10 bg-slate-950/60" />
            <div className="mx-auto max-w-3xl px-6">
              <h1 className="site-heading animate-fade-up text-4xl font-bold leading-[1.05] sm:text-6xl">{b.heading}</h1>
              {b.subheading && <p className="mx-auto mt-5 max-w-2xl animate-fade-up text-lg text-slate-100 [animation-delay:200ms]">{b.subheading}</p>}
              {b.label && <div className="mt-8 animate-fade-up [animation-delay:350ms]"><Btn label={b.label} href={b.href} variant="solid" /></div>}
            </div>
          </section>
        )
      }
      if (v === 'light') {
        return (
          <section className="relative overflow-hidden py-28 text-center" style={tint}>
            <div className="mx-auto max-w-3xl px-6">
              <span className="site-heading text-sm font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--solid)' }}>Welcome</span>
              <h1 className="site-heading mt-4 animate-fade-up text-4xl font-bold leading-tight text-slate-900 sm:text-6xl">{b.heading}</h1>
              {b.subheading && <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">{b.subheading}</p>}
              {b.label && <div className="mt-8"><Btn label={b.label} href={b.href} variant="gradient" /></div>}
            </div>
          </section>
        )
      }
      if (v === 'split') {
        return (
          <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 md:grid-cols-2">
            <div>
              <h1 className="site-heading animate-fade-up text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">{b.heading}</h1>
              {b.subheading && <p className="mt-5 max-w-lg text-lg text-slate-600">{b.subheading}</p>}
              {b.label && <div className="mt-8"><Btn label={b.label} href={b.href} variant="gradient" /></div>}
            </div>
            {b.url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={b.url} alt="" className="aspect-[4/3] w-full rounded-3xl object-cover shadow-2xl shadow-slate-900/10" />
            )}
          </section>
        )
      }
      if (v === 'minimal') {
        return (
          <section className="mx-auto max-w-4xl px-6 py-28">
            <h1 className="site-heading animate-fade-up text-5xl font-bold leading-[1.02] tracking-tight text-slate-900 sm:text-7xl">{b.heading}</h1>
            <div className="mt-6 h-1.5 w-24 rounded-full" style={gradient} />
            {b.subheading && <p className="mt-6 max-w-2xl text-xl text-slate-500">{b.subheading}</p>}
            {b.label && <div className="mt-8"><Btn label={b.label} href={b.href} variant="outline" /></div>}
          </section>
        )
      }
      if (v === 'centered') {
        return (
          <section className="relative overflow-hidden py-28 text-center" style={tint}>
            <div className="mx-auto max-w-3xl px-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">✦ {b.subheading ? 'New' : 'Welcome'} <span className="text-slate-300">|</span> <span style={{ color: 'var(--solid)' }}>Learn more</span></span>
              <h1 className="site-heading mt-6 text-5xl font-bold leading-[1.05] tracking-tight text-slate-900 sm:text-6xl">{b.heading}</h1>
              {b.subheading && <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">{b.subheading}</p>}
              <div className="mt-8 flex items-center justify-center gap-3">{b.label && <Btn label={b.label} href={b.href} variant="gradient" />}<Link href="#" className="rounded-full border-2 border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-white">Learn more</Link></div>
            </div>
          </section>
        )
      }
      if (v === 'dark') {
        return (
          <section className="bg-ink-950 py-32 text-center text-white">
            <div className="mx-auto max-w-3xl px-6">
              <h1 className="site-heading text-4xl font-bold leading-[1.05] sm:text-6xl">{b.heading}</h1>
              {b.subheading && <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">{b.subheading}</p>}
              {b.label && <div className="mt-8"><Btn label={b.label} href={b.href} variant="gradient" /></div>}
            </div>
          </section>
        )
      }
      if (v === 'glass') {
        return (
          <section className="relative isolate overflow-hidden py-32" style={gradient}>
            <div className="mx-auto max-w-3xl px-6">
              <div className="rounded-3xl border border-white/20 bg-white/10 p-10 text-center text-white shadow-2xl backdrop-blur-xl">
                <h1 className="site-heading text-4xl font-bold leading-tight sm:text-5xl">{b.heading}</h1>
                {b.subheading && <p className="mx-auto mt-5 max-w-2xl text-lg text-white/85">{b.subheading}</p>}
                {b.label && <div className="mt-8"><Link href={b.href || '#'} className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg">{b.label} <ArrowRight className="h-4 w-4" /></Link></div>}
              </div>
            </div>
          </section>
        )
      }
      if (v === 'mesh') {
        return (
          <section className="relative isolate overflow-hidden py-32 text-center">
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-70">
              <div className="absolute -left-20 -top-20 h-[28rem] w-[28rem] rounded-full blur-3xl" style={{ backgroundColor: 'var(--from)', opacity: 0.25 }} />
              <div className="absolute -right-10 top-10 h-[26rem] w-[26rem] rounded-full blur-3xl" style={{ backgroundColor: 'var(--to)', opacity: 0.2 }} />
              <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full blur-3xl" style={{ backgroundColor: 'var(--solid)', opacity: 0.15 }} />
            </div>
            <div className="mx-auto max-w-3xl px-6">
              <h1 className="site-heading text-5xl font-bold leading-[1.05] tracking-tight text-slate-900 sm:text-6xl">{b.heading}</h1>
              {b.subheading && <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">{b.subheading}</p>}
              {b.label && <div className="mt-8"><Btn label={b.label} href={b.href} variant="gradient" /></div>}
            </div>
          </section>
        )
      }
      if (v === 'screenshot') {
        return (
          <section className="overflow-hidden pt-24 text-center" style={tint}>
            <div className="mx-auto max-w-3xl px-6">
              <h1 className="site-heading text-4xl font-bold leading-tight text-slate-900 sm:text-6xl">{b.heading}</h1>
              {b.subheading && <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">{b.subheading}</p>}
              {b.label && <div className="mt-8"><Btn label={b.label} href={b.href} variant="gradient" /></div>}
            </div>
            <div className="mx-auto mt-14 max-w-5xl px-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.url || `https://picsum.photos/seed/${b.id}/1400/800`} alt="" className="w-full rounded-t-2xl border-x border-t border-slate-200 shadow-2xl shadow-slate-900/20" />
            </div>
          </section>
        )
      }
      if (v === 'stats') {
        const items = (b.features || []).slice(0, 3)
        return (
          <section className="py-28 text-center">
            <div className="mx-auto max-w-3xl px-6">
              <h1 className="site-heading text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">{b.heading}</h1>
              {b.subheading && <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">{b.subheading}</p>}
              {b.label && <div className="mt-8"><Btn label={b.label} href={b.href} variant="gradient" /></div>}
            </div>
            {items.length > 0 && (
              <div className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-8 px-6 sm:grid-cols-3">
                {items.map((f, i) => (<div key={i}><div className="bg-clip-text text-4xl font-bold text-transparent" style={gradient}>{f.title}</div><div className="mt-1 text-sm text-slate-500">{f.text}</div></div>))}
              </div>
            )}
          </section>
        )
      }
      if (v === 'newsletter') {
        return (
          <section className="py-28 text-center" style={tint}>
            <div className="mx-auto max-w-2xl px-6">
              <h1 className="site-heading text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">{b.heading}</h1>
              {b.subheading && <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">{b.subheading}</p>}
              <div className="mx-auto mt-8 flex max-w-md gap-2">
                <input type="email" placeholder="you@example.com" className="flex-1 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm" />
                <Link href={b.href || '#'} className="rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg" style={gradient}>{b.label || 'Subscribe'}</Link>
              </div>
            </div>
          </section>
        )
      }
      if (v === 'bordered') {
        return (
          <section className="px-6 py-20">
            <div className="mx-auto max-w-4xl rounded-3xl border-2 border-slate-900 p-12 text-center sm:p-16">
              <h1 className="site-heading text-4xl font-bold leading-tight text-slate-900 sm:text-6xl">{b.heading}</h1>
              {b.subheading && <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">{b.subheading}</p>}
              {b.label && <div className="mt-8"><Btn label={b.label} href={b.href} variant="solid" /></div>}
            </div>
          </section>
        )
      }
      if (v === 'left') {
        return (
          <section className="px-6 py-28">
            <div className="mx-auto max-w-5xl">
              <h1 className="site-heading max-w-3xl text-5xl font-bold leading-[1.02] tracking-tight text-slate-900 sm:text-7xl">{b.heading}</h1>
              {b.subheading && <p className="mt-6 max-w-xl text-xl text-slate-500">{b.subheading}</p>}
              {b.label && <div className="mt-8"><Btn label={b.label} href={b.href} variant="gradient" /></div>}
            </div>
          </section>
        )
      }
      if (v === 'bigtype') {
        return (
          <section className="px-6 py-28 text-center">
            <div className="mx-auto max-w-5xl">
              <h1 className="site-heading text-6xl font-extrabold leading-[0.95] tracking-tighter sm:text-8xl">
                <span className="bg-clip-text text-transparent" style={gradient}>{b.heading}</span>
              </h1>
              {b.subheading && <p className="mx-auto mt-8 max-w-2xl text-xl text-slate-500">{b.subheading}</p>}
              {b.label && <div className="mt-10"><Btn label={b.label} href={b.href} variant="gradient" /></div>}
            </div>
          </section>
        )
      }
      if (v === 'angled') {
        return (
          <section className="relative overflow-hidden py-32 text-center text-white [clip-path:polygon(0_0,100%_0,100%_92%,0_100%)]" style={gradient}>
            <div className="mx-auto max-w-3xl px-6">
              <h1 className="site-heading text-4xl font-bold leading-tight sm:text-6xl">{b.heading}</h1>
              {b.subheading && <p className="mx-auto mt-5 max-w-2xl text-lg text-white/85">{b.subheading}</p>}
              {b.label && <div className="mt-8"><Link href={b.href || '#'} className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg">{b.label} <ArrowRight className="h-4 w-4" /></Link></div>}
            </div>
          </section>
        )
      }
      if (v === 'spotlight') {
        return (
          <section className="relative isolate overflow-hidden bg-ink-950 py-36 text-center text-white">
            <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full blur-3xl" style={{ backgroundImage: 'radial-gradient(circle, var(--from), transparent 60%)', opacity: 0.4 }} />
            <div className="mx-auto max-w-3xl px-6">
              <h1 className="site-heading text-4xl font-bold leading-[1.05] sm:text-6xl">{b.heading}</h1>
              {b.subheading && <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">{b.subheading}</p>}
              {b.label && <div className="mt-8"><Btn label={b.label} href={b.href} variant="gradient" /></div>}
            </div>
          </section>
        )
      }
      if (v === 'waves') {
        return (
          <section className="relative overflow-hidden pb-24 pt-32 text-center text-white" style={gradient}>
            <div className="mx-auto max-w-3xl px-6">
              <h1 className="site-heading text-4xl font-bold leading-tight sm:text-6xl">{b.heading}</h1>
              {b.subheading && <p className="mx-auto mt-5 max-w-2xl text-lg text-white/85">{b.subheading}</p>}
              {b.label && <div className="mt-8"><Link href={b.href || '#'} className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg">{b.label} <ArrowRight className="h-4 w-4" /></Link></div>}
            </div>
            <svg className="absolute inset-x-0 bottom-0 w-full" viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ height: 60 }}><path fill="var(--brand-bg, #fff)" d="M0,64L60,58.7C120,53,240,43,360,48C480,53,600,75,720,80C840,85,960,75,1080,64C1200,53,1320,43,1380,37.3L1440,32L1440,120L0,120Z" /></svg>
          </section>
        )
      }
      // gradient (default)
      return (
        <section className="relative isolate overflow-hidden bg-ink-950 py-32 text-center">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -left-24 top-0 h-96 w-96 rounded-full opacity-50 blur-3xl animate-blob" style={{ backgroundColor: 'var(--from)' }} />
            <div className="absolute right-0 top-10 h-96 w-96 rounded-full opacity-40 blur-3xl animate-blob [animation-delay:-4s]" style={{ backgroundColor: 'var(--to)' }} />
            <div className="absolute inset-0 grid-dots opacity-40" />
          </div>
          <div className="mx-auto max-w-4xl px-6">
            <h1 className="site-heading animate-fade-up text-4xl font-bold leading-[1.05] text-white sm:text-6xl">{b.heading}</h1>
            {b.subheading && <p className="mx-auto mt-6 max-w-2xl animate-fade-up text-lg text-slate-300 [animation-delay:200ms]">{b.subheading}</p>}
            {b.label && <div className="mt-8 animate-fade-up [animation-delay:350ms]"><Btn label={b.label} href={b.href} variant="gradient" /></div>}
          </div>
        </section>
      )
    }

    case 'heading':
      return (
        <Reveal className={`${wrap} pt-16`}>
          <div className={`flex items-center gap-3 ${b.align === 'center' ? 'justify-center text-center' : ''}`}>
            <span className="h-6 w-1 shrink-0 rounded-full" style={gradient} />
            <h2 className="site-heading text-3xl font-bold text-slate-900 sm:text-4xl">{b.text}</h2>
          </div>
        </Reveal>
      )

    case 'paragraph':
      return (
        <Reveal className={`${wrap} pt-6`}>
          <p className={`text-lg leading-8 text-slate-600 ${b.align === 'center' ? 'text-center' : ''}`}>{b.text}</p>
        </Reveal>
      )

    case 'image': {
      const v = b.variant || 'rounded'
      if (v === 'full') {
        return (
          <Reveal className="pt-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={b.url} alt={b.alt || ''} className="h-[60vh] w-full object-cover" />
          </Reveal>
        )
      }
      if (v === 'framed') {
        return (
          <Reveal className="mx-auto w-full max-w-5xl px-6 pt-12">
            <div className="rounded-3xl p-3" style={tint}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.url} alt={b.alt || ''} className="aspect-[16/9] w-full rounded-2xl object-cover" />
            </div>
          </Reveal>
        )
      }
      return (
        <Reveal className="mx-auto w-full max-w-5xl px-6 pt-12">
          <figure className="group overflow-hidden rounded-3xl shadow-2xl shadow-slate-900/10 ring-1 ring-slate-900/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={b.url} alt={b.alt || ''} className="aspect-[16/9] w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105" />
          </figure>
        </Reveal>
      )
    }

    case 'button':
      return (
        <Reveal className={`${wrap} pt-10 ${b.align === 'center' ? 'text-center' : ''}`}>
          <Btn label={b.label} href={b.href} variant={b.variant} />
        </Reveal>
      )

    case 'quote': {
      if (b.variant === 'plain') {
        return (
          <Reveal className={`${wrap} pt-14`}>
            <blockquote className="border-l-4 pl-6" style={{ borderColor: 'var(--solid)' }}>
              <p className="site-heading text-2xl font-medium leading-snug text-slate-900 sm:text-3xl">“{b.text}”</p>
              {b.cite && <cite className="mt-3 block text-sm font-medium not-italic" style={{ color: 'var(--solid)' }}>— {b.cite}</cite>}
            </blockquote>
          </Reveal>
        )
      }
      return (
        <Reveal className={`${wrap} pt-14`}>
          <figure className="relative rounded-3xl p-8 sm:p-10" style={tint}>
            <span aria-hidden className="site-heading pointer-events-none absolute left-5 top-2 select-none text-7xl" style={{ color: 'var(--solid)', opacity: 0.25 }}>“</span>
            <blockquote className="relative">
              <p className="site-heading text-2xl font-medium leading-snug text-slate-900 sm:text-3xl">{b.text}</p>
              {b.cite && <figcaption className="mt-4 text-sm font-medium" style={{ color: 'var(--solid)' }}>— {b.cite}</figcaption>}
            </blockquote>
          </figure>
        </Reveal>
      )
    }

    case 'features':
      return (
        <section className={b.bg === 'tint' ? 'mt-16 py-16' : 'pt-16'} style={b.bg === 'tint' ? tint : undefined}>
          <div className="mx-auto max-w-5xl px-6">
            {b.heading && (
              <Reveal><h2 className="site-heading mb-10 text-center text-3xl font-bold text-slate-900 sm:text-4xl">{b.heading}</h2></Reveal>
            )}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(b.features || []).map((f, i) => (
                <Reveal key={i} delay={i * 80}>
                  <div className="h-full rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                    <span className="grid h-10 w-10 place-items-center rounded-xl text-white" style={gradient}><Check className="h-5 w-5" /></span>
                    <h3 className="site-heading mt-4 text-lg font-bold text-slate-900">{f.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{f.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )

    case 'stats':
      return (
        <section className={b.bg === 'tint' ? 'mt-16 py-14' : 'pt-16'} style={b.bg === 'tint' ? tint : undefined}>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 px-6 sm:grid-cols-3">
            {(b.stats || []).map((s, i) => (
              <Reveal key={i} delay={i * 80} className="text-center">
                <div className="site-heading text-4xl font-bold sm:text-5xl" style={{ color: 'var(--solid)' }}>{s.value}</div>
                <div className="mt-1 text-sm font-medium text-slate-500">{s.label}</div>
              </Reveal>
            ))}
          </div>
        </section>
      )

    case 'cta':
      return (
        <section className="mx-auto mt-16 max-w-5xl px-6">
          <Reveal>
            <div
              className="relative overflow-hidden rounded-3xl px-8 py-14 text-center sm:px-12"
              style={b.variant === 'dark' ? { backgroundColor: '#0b1120' } : gradient}
            >
              <h2 className="site-heading text-3xl font-bold text-white sm:text-4xl">{b.heading}</h2>
              {b.label && (
                <div className="mt-7">
                  <Link href={b.href || '#'} className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition-transform hover:-translate-y-0.5">
                    {b.label} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              )}
            </div>
          </Reveal>
        </section>
      )

    default:
      if (isWidget(b.type)) return <WidgetRenderer block={b} />
      return null
  }
}
