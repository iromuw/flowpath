'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  {
    href: '/',
    label: 'Dashboard',
    exact: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1" fill="currentColor" />
        <rect x="9" y="1" width="6" height="6" rx="1" fill="currentColor" opacity="0.4" />
        <rect x="1" y="9" width="6" height="6" rx="1" fill="currentColor" opacity="0.4" />
        <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" opacity="0.4" />
      </svg>
    ),
  },
  {
    href: '/applications',
    label: 'Applications',
    exact: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
        <path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/analytics',
    label: 'Analytics',
    exact: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
        <path d="M2 13V8M6 13V5M10 13V9M14 13V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/saved',
    label: 'Saved',
    exact: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
        <path
          d="M4 2h8a1 1 0 0 1 1 1v11l-5-3-5 3V3a1 1 0 0 1 1-1z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-[rgba(26,101,90,0.15)] md:hidden">
      <div className="flex h-16">
        {TABS.map((tab) => {
          const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
                active ? 'text-[#0FA878]' : 'text-[#8AADA8]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
