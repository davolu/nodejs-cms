import type { Block } from '@/lib/blocks'

// Renders the ordered content blocks exactly as visitors see them on the live site.
export default function BlockRenderer({ blocks }: { blocks: Block[] }) {
  if (!blocks?.length) {
    return <p className="text-slate-400">This page has no content yet.</p>
  }
  return (
    <div className="space-y-6">
      {blocks.map((b) => (
        <BlockView key={b.id} block={b} />
      ))}
    </div>
  )
}

function BlockView({ block: b }: { block: Block }) {
  switch (b.type) {
    case 'hero':
      return (
        <section className="rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 px-6 py-14 text-center text-white sm:px-10">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{b.heading}</h1>
          {b.subheading && <p className="mx-auto mt-3 max-w-2xl text-brand-100">{b.subheading}</p>}
        </section>
      )
    case 'heading':
      return <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{b.text}</h2>
    case 'paragraph':
      return <p className="text-[17px] leading-relaxed text-slate-700">{b.text}</p>
    case 'image':
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={b.url} alt={b.alt || ''} className="w-full rounded-xl object-cover" />
      )
    case 'button':
      return (
        <div>
          <a href={b.href || '#'} className="btn-primary inline-flex">
            {b.label || 'Button'}
          </a>
        </div>
      )
    case 'quote':
      return (
        <blockquote className="border-l-4 border-brand-500 pl-4">
          <p className="text-xl italic text-slate-800">“{b.text}”</p>
          {b.cite && <cite className="mt-1 block text-sm not-italic text-slate-500">— {b.cite}</cite>}
        </blockquote>
      )
    default:
      return null
  }
}
