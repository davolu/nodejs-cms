import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Block } from '@/lib/blocks'
import Reveal from '@/components/site/Reveal'

// Renders ordered content blocks as a polished marketing page.
// Heroes and images run full-bleed; text sits in a comfortable reading column.
export default function BlockRenderer({ blocks }: { blocks: Block[] }) {
  if (!blocks?.length) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center text-slate-400">
        This page has no content yet.
      </div>
    )
  }
  return (
    <div className="pb-24">
      {blocks.map((b, i) => (
        <BlockView key={b.id} block={b} index={i} />
      ))}
    </div>
  )
}

const wrap = 'mx-auto w-full max-w-3xl px-6'

function BlockView({ block: b, index }: { block: Block; index: number }) {
  switch (b.type) {
    case 'hero':
      return (
        <section className="relative isolate overflow-hidden bg-ink-950 py-28 sm:py-36">
          {/* animated gradient blobs */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -left-24 top-0 h-96 w-96 rounded-full bg-brand-600/40 blur-3xl animate-blob" />
            <div className="absolute right-0 top-10 h-96 w-96 rounded-full bg-accent-500/30 blur-3xl animate-blob [animation-delay:-4s]" />
            <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-violet-600/30 blur-3xl animate-blob [animation-delay:-8s]" />
            <div className="absolute inset-0 grid-dots opacity-40" />
          </div>
          <div className="mx-auto max-w-4xl px-6 text-center">
            <p className="animate-fade-up text-sm font-semibold uppercase tracking-[0.2em] text-brand-300 opacity-0 [animation-delay:100ms]">
              Welcome
            </p>
            <h1 className="site-heading mt-4 animate-fade-up text-4xl font-bold leading-[1.05] text-white opacity-0 [animation-delay:200ms] sm:text-6xl">
              {b.heading}
            </h1>
            {b.subheading && (
              <p className="mx-auto mt-6 max-w-2xl animate-fade-up text-lg leading-relaxed text-slate-300 opacity-0 [animation-delay:350ms]">
                {b.subheading}
              </p>
            )}
          </div>
        </section>
      )

    case 'heading':
      return (
        <Reveal className={`${wrap} pt-16`}>
          <div className="flex items-center gap-3">
            <span className="h-6 w-1 rounded-full bg-gradient-to-b from-brand-500 to-accent-500" />
            <h2 className="site-heading text-3xl font-bold text-slate-900 sm:text-4xl">{b.text}</h2>
          </div>
        </Reveal>
      )

    case 'paragraph':
      return (
        <Reveal className={`${wrap} pt-6`}>
          <p className="text-lg leading-8 text-slate-600">{b.text}</p>
        </Reveal>
      )

    case 'image':
      return (
        <Reveal className="mx-auto w-full max-w-5xl px-6 pt-12">
          <figure className="group overflow-hidden rounded-3xl shadow-2xl shadow-slate-900/10 ring-1 ring-slate-900/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={b.url}
              alt={b.alt || ''}
              className="aspect-[16/9] w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
            />
          </figure>
          {b.alt && <figcaption className="mt-3 text-center text-sm text-slate-400">{b.alt}</figcaption>}
        </Reveal>
      )

    case 'button':
      return (
        <Reveal className={`${wrap} pt-10`}>
          <Link href={b.href || '#'} className="cta">
            {b.label || 'Learn more'}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      )

    case 'quote':
      return (
        <Reveal className={`${wrap} pt-14`}>
          <figure className="relative rounded-3xl bg-gradient-to-br from-slate-50 to-brand-50/50 p-8 sm:p-10">
            <span aria-hidden className="site-heading pointer-events-none absolute left-5 top-2 select-none text-7xl text-brand-200">“</span>
            <blockquote className="relative">
              <p className="site-heading text-2xl font-medium leading-snug text-slate-900 sm:text-3xl">{b.text}</p>
              {b.cite && <figcaption className="mt-4 text-sm font-medium text-brand-600">— {b.cite}</figcaption>}
            </blockquote>
          </figure>
        </Reveal>
      )

    default:
      return null
  }
}
