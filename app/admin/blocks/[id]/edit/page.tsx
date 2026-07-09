import { notFound } from 'next/navigation'
import { globalBlocksRepo } from '@/lib/store'
import GlobalBlockForm from '@/components/GlobalBlockForm'

export const dynamic = 'force-dynamic'

export default async function EditBlockPage({ params }: { params: { id: string } }) {
  const block = await globalBlocksRepo.get(params.id)
  if (!block) notFound()
  return <GlobalBlockForm initial={block} />
}
