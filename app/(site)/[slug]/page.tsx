import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { pagesRepo, expandGlobals } from '@/lib/store'
import { getSiteMeta } from '@/lib/site-meta'
import { isAuthed } from '@/lib/auth'
import { getMemberId } from '@/lib/members'
import BlockRenderer from '@/components/BlockRenderer'
import PreviewBanner from '@/components/PreviewBanner'
import MembersGate from '@/components/site/MembersGate'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const page = await pagesRepo.getBySlug(params.slug)
  if (!page) return { title: 'Not found' }
  const meta = await getSiteMeta()
  const title = page.metaTitle || page.title
  const description = page.metaDescription || meta.description
  const canonical = `/${page.slug}`
  const noindex = page.status !== 'published' || page.access === 'members'
  return {
    title, description,
    alternates: { canonical },
    robots: noindex ? { index: false, follow: false } : undefined,
    openGraph: { title, description, url: canonical, type: 'website', images: meta.ogImage ? [meta.ogImage] : [] },
    twitter: { card: 'summary_large_image', title, description },
  }
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

  const gated = page.access === 'members' && !getMemberId() && !isPreview
  const leadsWithHero = page.blocks[0]?.type === 'hero'
  const blocks = await expandGlobals(page.blocks)

  return (
    <>
      {isPreview && (
        <div className="mx-auto max-w-3xl px-6 pt-6">
          <PreviewBanner backHref={`/admin/pages/${page.id}/edit`} />
        </div>
      )}
      {gated ? (
        <MembersGate title={page.title} theme={page.theme} />
      ) : (
        <>
          {!leadsWithHero && (
            <section className="border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white py-16">
              <div className="mx-auto max-w-3xl px-6">
                <h1 className="site-heading text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">{page.title}</h1>
              </div>
            </section>
          )}
          <BlockRenderer blocks={blocks} theme={page.theme} />
        </>
      )}
    </>
  )
}
