import Link from 'next/link'

export default function PreviewBanner({ backHref }: { backHref: string }) {
  return (
    <div className="mb-6 flex items-center justify-between rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800">
      <span>Preview mode — this is a draft and isn’t visible to the public yet.</span>
      <Link href={backHref} className="font-medium underline">Back to editor</Link>
    </div>
  )
}
