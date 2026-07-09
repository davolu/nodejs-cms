import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { postsRepo } from '@/lib/store'
import { isAuthed } from '@/lib/auth'
import { fmtDate } from '@/components/ui'
import PreviewBanner from '@/components/PreviewBanner'
import Reveal from '@/components/site/Reveal'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await postsRepo.getBySlug(params.slug)
  if (!post) return { title: 'Not found' }
  return { title: post.metaTitle || post.title, description: post.metaDescription }
}

export default async function BlogPost({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { preview?: string }
}) {
  const post = await postsRepo.getBySlug(params.slug)
  if (!post) notFound()

  const isPreview = searchParams?.preview === '1' && isAuthed()
  if (post.status !== 'published' && !isPreview) notFound()

  const paragraphs = post.body.split('\n').filter((line) => line.trim().length > 0)

  return (
    <article className="pb-24">
      <div className="mx-auto max-w-3xl px-6 pt-10">
        {isPreview && <PreviewBanner backHref={`/admin/posts/${post.id}/edit`} />}
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> All posts
        </Link>
        <p className="mt-8 text-sm font-semibold uppercase tracking-widest text-brand-600">{fmtDate(post.updatedAt)}</p>
        <h1 className="site-heading mt-3 text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl">{post.title}</h1>
        {post.excerpt && <p className="mt-4 text-xl leading-relaxed text-slate-500">{post.excerpt}</p>}
      </div>

      {post.featuredImage && (
        <Reveal className="mx-auto mt-10 max-w-5xl px-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.featuredImage} alt={post.title} className="aspect-[16/9] w-full rounded-3xl object-cover shadow-2xl shadow-slate-900/10 ring-1 ring-slate-900/5" />
        </Reveal>
      )}

      <div className="mx-auto mt-12 max-w-2xl space-y-6 px-6">
        {paragraphs.map((para, i) => (
          <Reveal key={i} delay={i * 40}>
            <p className={`leading-8 text-slate-700 ${i === 0 ? 'text-xl first-letter:float-left first-letter:mr-2 first-letter:text-6xl first-letter:font-bold first-letter:text-brand-600 first-letter:leading-[0.85] first-letter:font-display' : 'text-lg'}`}>
              {para}
            </p>
          </Reveal>
        ))}
      </div>
    </article>
  )
}
