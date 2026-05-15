'use client'

import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'

interface PageShellProps {
  children: React.ReactNode
}

export function PageShell({ children }: PageShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F2EE]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden pb-16 md:pb-0">{children}</div>
      <BottomNav />
    </div>
  )
}
