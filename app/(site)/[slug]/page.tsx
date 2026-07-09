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

  const leadsWithHero = page.blocks[0]?.type === 'hero'

  return (
    <>
      {isPreview && (
        <div className="mx-auto max-w-3xl px-6 pt-6">
          <PreviewBanner backHref={`/admin/pages/${page.id}/edit`} />
        </div>
      )}
      {!leadsWithHero && (
        <section className="border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white py-16">
          <div className="mx-auto max-w-3xl px-6">
            <h1 className="site-heading text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">{page.title}</h1>
          </div>
        </section>
      )}
      <BlockRenderer blocks={page.blocks} theme={page.theme} />
    </>
  )
}
