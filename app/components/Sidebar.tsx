'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const NAV_ITEMS = [
  {
    href: '/',
    title: 'Dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1" fill="currentColor" />
        <rect x="9" y="1" width="6" height="6" rx="1" fill="currentColor" opacity="0.4" />
        <rect x="1" y="9" width="6" height="6" rx="1" fill="currentColor" opacity="0.4" />
        <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" opacity="0.4" />
      </svg>
    ),
    exact: true,
  },
  {
    href: '/applications',
    title: 'All Applications',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M2 4h12M2 8h8M2 12h10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    exact: false,
  },
  {
    href: '/analytics',
    title: 'Analytics',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M2 13V8M6 13V5M10 13V9M14 13V3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    exact: false,
  },
  {
    href: '/calendar',
    title: 'Calendar',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1.5" y="3" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M5 1.5V4M11 1.5V4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path d="M1.5 7h13" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    exact: false,
  },
  {
    href: '/saved',
    title: 'Saved Jobs',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M4 2h8a1 1 0 0 1 1 1v11l-5-3-5 3V3a1 1 0 0 1 1-1z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
    exact: false,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex md:w-14 lg:w-56 flex-shrink-0 flex-col items-center py-4 gap-2 bg-[#0D2B24] border-r border-[rgba(26,101,90,0.30)]">
      {/* Logo */}
      <div className="w-9 h-9 lg:w-full flex items-center justify-center lg:justify-start lg:px-3 mb-2 flex-shrink-0">
        <Image src="/logo.svg" alt="Flowpath" width={36} height={36} style={{ height: '36px', width: 'auto' }} />
        <span className="hidden lg:block ml-2 text-white font-semibold text-sm">Flowpath</span>
      </div>

      {NAV_ITEMS.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href)
        return (
          <NavIcon key={item.href} href={item.href} active={active} title={item.title}>
            {item.icon}
          </NavIcon>
        )
      })}

      <div className="flex-1" />

      {/* Sign out */}
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        title="Sign out"
        className="w-9 h-9 lg:w-full lg:h-auto lg:px-3 lg:py-2 rounded-lg flex items-center justify-center lg:justify-start gap-2 text-white/50 hover:bg-[#132E27] hover:text-white/80 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
          <path
            d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M10 11l3-3-3-3M13 8H6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="hidden lg:block text-sm">Sign out</span>
      </button>

      {/* User avatar */}
      <div className="w-8 h-8 rounded-full bg-[#132E27] flex items-center justify-center flex-shrink-0">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="6" r="3" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
          <path
            d="M2 13.5c0-3.038 2.686-5.5 6-5.5s6 2.462 6 5.5"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  )
}

interface NavIconProps {
  href: string
  active: boolean
  title: string
  children: React.ReactNode
}

function NavIcon({ href, active, title, children }: NavIconProps) {
  return (
    <Link
      href={href}
      title={title}
      className={`w-9 h-9 lg:w-full lg:h-auto lg:px-3 lg:py-2 rounded-lg flex items-center justify-center lg:justify-start gap-2 transition-colors relative ${
        active
          ? 'bg-[#132E27] text-white before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-0.5 before:bg-[#0FA878] before:rounded-r'
          : 'text-white/70 hover:bg-[#132E27] hover:text-white'
      }`}
    >
      <span className="flex-shrink-0">{children}</span>
      <span className="hidden lg:block text-sm font-medium">{title}</span>
    </Link>
  )
}
