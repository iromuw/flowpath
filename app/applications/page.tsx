'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Application } from '@/lib/types'
import { PageShell } from '@/app/components/PageShell'
import { ApplicationTable, DashboardFilter } from '@/app/components/ApplicationTable'
import { AddApplicationModal } from '@/app/components/AddApplicationModal'

export default function ApplicationsPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [filter, setFilter] = useState<DashboardFilter>('ALL')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const fetchApps = useCallback(async () => {
    try {
      const res = await fetch('/api/applications')
      const data = await res.json()
      setApplications(data)
    } catch {
      // leave state intact on error
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchApps()
  }, [fetchApps])

  const filteredApps = applications.filter((a) => {
    if (filter === 'ALL') return true
    if (filter === 'INTERVIEWS')
      return ['FIRST_ROUND', 'SECOND_ROUND', 'FINAL_ROUND'].includes(a.current_status)
    if (filter === 'NO_REPLY') return a.current_status === 'NO_REPLY'
    if (filter === 'OFFER') return a.current_status === 'OFFER'
    return true
  })

  return (
    <PageShell>
      {/* Topbar */}
      <div className="bg-white border-b border-[rgba(26,101,90,0.15)] px-6 py-3.5 flex items-center justify-between flex-shrink-0">
        <span className="text-base font-medium text-[#1A2520]">All Applications</span>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#0FA878] rounded-lg transition-colors hover:bg-[#0D9068]"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v10M2 7h10" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Log application
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-7 h-7 border-2 border-[rgba(26,101,90,0.15)] border-t-[#4A8C7E] rounded-full animate-spin" />
          </div>
        ) : (
          <ApplicationTable
            applications={filteredApps}
            filter={filter}
            onFilterChange={setFilter}
            onRowClick={(id) => router.push(`/applications/${id}`)}
            showAll
            title="Applications"
          />
        )}
      </div>

      {showModal && (
        <AddApplicationModal onClose={() => setShowModal(false)} onCreated={fetchApps} />
      )}
    </PageShell>
  )
}
