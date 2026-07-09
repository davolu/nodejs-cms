'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { useCart } from '@/components/shop/CartProvider'

export default function SuccessPage({ searchParams }: { searchParams: { session_id?: string; demo?: string } }) {
  const cart = useCart()
  const [state, setState] = useState<'checking' | 'done'>('checking')

  useEffect(() => {
    async function run() {
      if (searchParams.session_id) {
        await fetch('/api/checkout/confirm', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: searchParams.session_id }),
        }).catch(() => {})
      }
      cart.clear()
      setState('done')
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="mx-auto grid min-h-[60vh] max-w-lg place-items-center px-6 text-center">
      <div>
        {state === 'checking' ? (
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-slate-300" />
        ) : (
          <>
            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-500">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <h1 className="site-heading text-3xl font-bold text-slate-900">Thank you for your order!</h1>
            <p className="mt-3 text-slate-500">
              {searchParams.demo ? 'This was a demo checkout — no payment was taken.' : 'Your payment was successful and your order is confirmed.'}
            </p>
            <Link href="/" className="mt-8 inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white">Back to home</Link>
          </>
        )}
      </div>
    </div>
  )
}
