import Link from 'next/link'
import { pagesRepo } from '@/lib/store'
import BlockRenderer from '@/components/BlockRenderer'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const home = await pagesRepo.getBySlug('home')

  if (home && home.status === 'published') {
    return (
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <BlockRenderer blocks={home.blocks} />
      </article>
    )
  }

  // Fallback: a simple index of published pages if no home page is set.
  const pages = (await pagesRepo.list()).filter((p) => p.status === 'published' && p.slug !== 'home')
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome</h1>
      <p className="mt-2 text-slate-500">Pages published from the CMS appear here.</p>
      <ul className="mt-6 divide-y divide-slate-100 rounded-xl border border-slate-200">
        {pages.map((p) => (
          <li key={p.id}>
            <Link href={`/${p.slug}`} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50">
              <span className="font-medium text-slate-800">{p.title}</span>
              <span className="font-mono text-xs text-slate-400">/{p.slug}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
