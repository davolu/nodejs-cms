import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { postsRepo } from '@/lib/store'
import { isAuthed } from '@/lib/auth'
import { fmtDate } from '@/components/ui'
import PreviewBanner from '@/components/PreviewBanner'

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
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {isPreview && <PreviewBanner backHref={`/admin/posts/${post.id}/edit`} />}
      <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" /> All posts
      </Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{post.title}</h1>
      <p className="mt-2 text-sm text-slate-400">{fmtDate(post.updatedAt)}</p>
      {post.featuredImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.featuredImage} alt={post.title} className="mt-6 w-full rounded-xl object-cover" />
      )}
      <div className="mt-6 space-y-4">
        {paragraphs.map((para, i) => (
          <p key={i} className="text-[17px] leading-relaxed text-slate-700">{para}</p>
        ))}
      </div>
    </article>
  )
}
