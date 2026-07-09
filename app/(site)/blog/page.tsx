import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { postsRepo } from '@/lib/store'
import { fmtDate } from '@/components/ui'
import Reveal from '@/components/site/Reveal'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Blog' }

export default async function BlogIndex() {
  const posts = (await postsRepo.list()).filter((p) => p.status === 'published')
  const [featured, ...rest] = posts

  return (
    <div>
      <section className="border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white py-16">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Writing</p>
          <h1 className="site-heading mt-3 text-5xl font-bold tracking-tight text-slate-900">The Blog</h1>
          <p className="mt-3 max-w-xl text-lg text-slate-500">Latest articles, updates, and ideas.</p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-14">
        {posts.length === 0 ? (
          <p className="text-slate-400">No posts published yet.</p>
        ) : (
          <>
            {featured && (
              <Reveal>
                <Link href={`/blog/${featured.slug}`} className="group grid gap-6 overflow-hidden rounded-3xl border border-slate-200 transition-all hover:shadow-2xl hover:shadow-slate-900/10 md:grid-cols-2">
                  <div className="overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={featured.featuredImage} alt={featured.title} className="h-full min-h-[260px] w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" />
                  </div>
                  <div className="flex flex-col justify-center p-8">
                    <span className="text-xs font-semibold uppercase tracking-widest text-brand-600">Featured</span>
                    <h2 className="site-heading mt-3 text-3xl font-bold text-slate-900 group-hover:text-brand-700">{featured.title}</h2>
                    <p className="mt-3 text-slate-500">{featured.excerpt}</p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-600">
                      Read article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            )}

            {rest.length > 0 && (
              <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((p, i) => (
                  <Reveal key={p.id} delay={i * 80}>
                    <Link href={`/blog/${p.slug}`} className="group block overflow-hidden rounded-2xl border border-slate-200 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10">
                      <div className="overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.featuredImage} alt={p.title} className="h-48 w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      </div>
                      <div className="p-5">
                        <span className="text-xs text-slate-400">{fmtDate(p.updatedAt)}</span>
                        <h3 className="site-heading mt-1 text-lg font-bold text-slate-900 group-hover:text-brand-700">{p.title}</h3>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{p.excerpt}</p>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
