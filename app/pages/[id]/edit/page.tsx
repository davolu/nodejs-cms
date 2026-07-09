import { notFound } from 'next/navigation'
import PageForm from '@/components/PageForm'
import { pagesRepo } from '@/lib/store'

export const dynamic = 'force-dynamic'

export default async function EditPage({ params }: { params: { id: string } }) {
  const page = await pagesRepo.get(params.id)
  if (!page) notFound()
  return <PageForm initial={page} />
}
