import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ContentHub CMS',
  description: 'A simple CMS for managing website pages and blog posts.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  )
}
