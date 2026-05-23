'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  List,
  BarChart2,
  Calendar,
  Bookmark,
  Settings,
  LogOut,
  User,
} from 'lucide-react'
import { CampaignSelector } from './CampaignSelector'

const NAV_ITEMS = [
  { href: '/', title: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/applications', title: 'All Applications', icon: List, exact: false },
  { href: '/analytics', title: 'Analytics', icon: BarChart2, exact: false },
  { href: '/calendar', title: 'Calendar', icon: Calendar, exact: false },
  { href: '/saved', title: 'Saved Jobs', icon: Bookmark, exact: false },
  { href: '/settings', title: 'Settings', icon: Settings, exact: false },
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

      <CampaignSelector />

      {NAV_ITEMS.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href)
        return (
          <NavItem key={item.href} href={item.href} active={active} title={item.title} Icon={item.icon} />
        )
      })}

      <div className="flex-1" />

      {/* Sign out */}
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        title="Sign out"
        className="w-9 h-9 lg:w-full lg:h-auto lg:px-3 lg:py-2 rounded-lg flex items-center justify-center lg:justify-start gap-2 text-white/50 hover:bg-[#132E27] hover:text-white/80 transition-colors"
      >
        <LogOut size={16} className="flex-shrink-0" />
        <span className="hidden lg:block text-sm">Sign out</span>
      </button>

      {/* User avatar */}
      <div className="w-8 h-8 rounded-full bg-[#132E27] flex items-center justify-center flex-shrink-0">
        <User size={16} color="rgba(255,255,255,0.7)" />
      </div>
    </div>
  )
}

interface NavItemProps {
  href: string
  active: boolean
  title: string
  Icon: React.ComponentType<{ size?: number; className?: string }>
}

function NavItem({ href, active, title, Icon }: NavItemProps) {
  return (
    <Link
      href={href}
      title={title}
      className={`w-9 h-9 lg:w-[calc(100%-1rem)] lg:h-auto lg:px-3 lg:py-2 rounded-lg flex items-center justify-center lg:justify-start gap-2 transition-colors relative ${
        active
          ? 'bg-[rgba(255,255,255,0.10)] text-white before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-0.5 before:bg-[#0FA878] before:rounded-r'
          : 'text-white/55 hover:bg-[rgba(255,255,255,0.06)] hover:text-white'
      }`}
    >
      <Icon size={16} className="flex-shrink-0" />
      <span className="hidden lg:block text-sm font-medium">{title}</span>
    </Link>
  )
}
