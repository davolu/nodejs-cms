import { notFound } from 'next/navigation'
import { collectionsRepo } from '@/lib/store'
import EntriesManager from '@/components/EntriesManager'

export const dynamic = 'force-dynamic'

export default async function CollectionEntriesPage({ params }: { params: { id: string } }) {
  const collection = await collectionsRepo.get(params.id)
  if (!collection) notFound()
  return <EntriesManager collection={JSON.parse(JSON.stringify(collection))} />
}
