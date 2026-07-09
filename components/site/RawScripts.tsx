'use client'

import { useEffect } from 'react'

// Injects owner-provided <script> markup (analytics, chat, verification) so it
// actually executes — dangerouslySetInnerHTML does NOT run injected scripts.
export default function RawScripts({ html, target }: { html?: string; target: 'head' | 'body' }) {
  useEffect(() => {
    if (!html) return
    const holder = document.createElement('div')
    holder.innerHTML = html
    const dest = target === 'head' ? document.head : document.body
    const added: Node[] = []
    Array.from(holder.childNodes).forEach((node) => {
      if (node.nodeName === 'SCRIPT') {
        const src = node as HTMLScriptElement
        const el = document.createElement('script')
        Array.from(src.attributes).forEach((a) => el.setAttribute(a.name, a.value))
        if (!src.src) el.textContent = src.textContent
        dest.appendChild(el); added.push(el)
      } else {
        const clone = node.cloneNode(true)
        dest.appendChild(clone); added.push(clone)
      }
    })
    return () => { added.forEach((n) => { try { n.parentNode?.removeChild(n) } catch {} }) }
  }, [html, target])
  return null
}
