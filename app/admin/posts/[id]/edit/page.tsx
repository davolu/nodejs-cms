import { notFound } from 'next/navigation'
import PostForm from '@/components/PostForm'
import { postsRepo } from '@/lib/store'

export const dynamic = 'force-dynamic'

export default async function EditPost({ params }: { params: { id: string } }) {
  const post = await postsRepo.get(params.id)
  if (!post) notFound()
  return <PostForm initial={post} />
}
