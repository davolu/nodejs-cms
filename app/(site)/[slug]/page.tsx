import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { pagesRepo } from '@/lib/store'
import { isAuthed } from '@/lib/auth'
import BlockRenderer from '@/components/BlockRenderer'
import PreviewBanner from '@/components/PreviewBanner'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const page = await pagesRepo.getBySlug(params.slug)
  if (!page) return { title: 'Not found' }
  return { title: page.metaTitle || page.title, description: page.metaDescription }
}

export default async function PublicPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { preview?: string }
}) {
  const page = await pagesRepo.getBySlug(params.slug)
  if (!page) notFound()

  const isPreview = searchParams?.preview === '1' && isAuthed()
  if (page.status !== 'published' && !isPreview) notFound()

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {isPreview && <PreviewBanner backHref={`/admin/pages/${page.id}/edit`} />}
      {page.slug !== 'home' && (
        <h1 className="mb-6 text-3xl font-bold tracking-tight text-slate-900">{page.title}</h1>
      )}
      <BlockRenderer blocks={page.blocks} />
    </article>
  )
}
