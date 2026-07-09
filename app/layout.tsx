import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'ContentHub CMS',
  description: 'A simple CMS for managing website pages and blog posts.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 md:pl-64">
            <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
          </div>
        </div>
      </body>
    </html>
  )
}
