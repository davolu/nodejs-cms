import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { pagesRepo, resolveHomePage, expandGlobals, usersRepo } from '@/lib/store'
import { getMemberId, roleAtLeast } from '@/lib/members'
import { getBrand } from '@/lib/brand'
import BlockRenderer from '@/components/BlockRenderer'
import MembersGate from '@/components/site/MembersGate'
import RoleGate from '@/components/site/RoleGate'
import Paywall from '@/components/site/Paywall'
import Reveal from '@/components/site/Reveal'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const home = await resolveHomePage()
  const brand = await getBrand()

  if (home && home.status === 'published') {
    const roleGated = home.access === 'managers' || home.access === 'admins'
    if (home.access === 'members' || home.access === 'subscribers' || roleGated) {
      const memberId = getMemberId()
      const member = memberId ? await usersRepo.findById(memberId) : null
      if (!member) return <MembersGate title={home.title} theme={home.theme} />
      if (home.access === 'subscribers' && !member.subscribed) return <Paywall title={home.title} theme={home.theme} />
      if (roleGated && !roleAtLeast(member.role, home.access === 'admins' ? 'admin' : 'manager')) return <RoleGate title={home.title} theme={home.theme} required={home.access === 'admins' ? 'admin' : 'manager'} />
    }
    const blocks = await expandGlobals(home.blocks)
    const theme = brand.applyAll === false ? home.theme : 'brand'
    return <BlockRenderer blocks={blocks} theme={theme} />
  }

  const pages = (await pagesRepo.list()).filter((p) => p.status === 'published' && p.id !== home?.id)
  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <h1 className="site-heading text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
        Welcome
      </h1>
      <p className="mt-3 text-lg text-slate-500">Pages published from the CMS appear here.</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {pages.map((p, i) => (
          <Reveal key={p.id} delay={i * 60}>
            <Link
              href={`/${p.slug}`}
              className="group flex items-center justify-between rounded-2xl border border-slate-200 p-5 transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-600/5"
            >
              <div>
                <div className="site-heading font-semibold text-slate-900">{p.title}</div>
                <div className="font-mono text-xs text-slate-400">/{p.slug}</div>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-brand-600" />
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  )
}
