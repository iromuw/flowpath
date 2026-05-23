'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PageShell } from '@/app/components/PageShell'

const TABS = [
  { href: '/settings/profile', label: 'Profile' },
  { href: '/settings/platforms', label: 'Job Platforms' },
  { href: '/settings/campaigns', label: 'Campaigns' },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <PageShell>
      {/* Topbar */}
      <div className="bg-white border-b border-[rgba(26,101,90,0.15)] px-6 py-3.5 flex-shrink-0">
        <span className="text-base font-medium text-[#1A2520]">Settings</span>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-[rgba(26,101,90,0.15)] px-6 flex-shrink-0">
        <div className="flex gap-1">
          {TABS.map((tab) => {
            const active = pathname === tab.href
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  active
                    ? 'border-[#0FA878] text-[#0FA878]'
                    : 'border-transparent text-[#4A8C7E] hover:text-[#1A2520]'
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
          {/* Coming soon placeholder */}
          <span className="px-4 py-3 text-sm font-medium border-b-2 border-transparent text-[#8AADA8] cursor-not-allowed flex items-center gap-1.5">
            Token
            <span className="text-[10px] bg-[#E6F4F1] text-[#4A8C7E] px-1.5 py-0.5 rounded font-medium">
              soon
            </span>
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">{children}</div>
    </PageShell>
  )
}
