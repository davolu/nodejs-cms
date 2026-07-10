'use client'
import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

// NN/g: Back-to-Top floating button — appears after scrolling, returns to top.
export default function BackToTop() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const on = () => setShow(window.scrollY > 600)
    on(); window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  if (!show) return null
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top"
      className="fixed bottom-6 right-6 z-50 grid h-11 w-11 place-items-center rounded-full text-white shadow-lg transition hover:-translate-y-0.5"
      style={{ backgroundImage: 'linear-gradient(120deg, var(--brand-from), var(--brand-to))' }}>
      <ArrowUp className="h-5 w-5" />
    </button>
  )
}
