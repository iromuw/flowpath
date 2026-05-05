'use client'

import { useState, useEffect, useCallback } from 'react'
import { Application, Stats, PLATFORM_LABELS } from '@/lib/types'
import { Sidebar } from './Sidebar'
import { StatCard } from './StatCard'
import { DonutChart, DonutSegment } from './DonutChart'
import { PlatformBar } from './PlatformBar'
import { ApplicationTable, DashboardFilter } from './ApplicationTable'
import { AddApplicationModal } from './AddApplicationModal'
import { ApplicationDetailPanel } from './ApplicationDetailPanel'

const PLATFORM_COLORS: Record<string, string> = {
  SEEK: '#378ADD',
  LINKEDIN: '#1D9E75',
  INDEED: '#EF9F27',
  COMPANY: '#888780',
}

const PLATFORM_TAILWIND: Record<string, string> = {
  SEEK: 'bg-[#378ADD]',
  LINKEDIN: 'bg-[#1D9E75]',
  INDEED: 'bg-[#EF9F27]',
  COMPANY: 'bg-[#888780]',
}

function getGreeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

export function Dashboard() {
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [filter, setFilter] = useState<DashboardFilter>('ALL')
  const [showModal, setShowModal] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [appsRes, statsRes] = await Promise.all([
        fetch('/api/applications'),
        fetch('/api/stats'),
      ])
      const [apps, statsData] = await Promise.all([appsRes.json(), statsRes.json()])
      setApplications(apps)
      setStats(statsData)
    } catch {
      // leave existing state intact on network failure
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const interviewCount = stats
    ? (stats.byStatus.FIRST_ROUND ?? 0) +
      (stats.byStatus.SECOND_ROUND ?? 0) +
      (stats.byStatus.FINAL_ROUND ?? 0)
    : 0

  const noReplyOver30 = applications.filter((a) => {
    if (a.current_status !== 'NO_REPLY') return false
    return (Date.now() - new Date(a.submitted_date).getTime()) / 86_400_000 > 30
  }).length

  const donutSegments: DonutSegment[] = stats
    ? [
        { label: 'Submitted', value: stats.byStatus.SUBMITTED ?? 0, color: '#378ADD' },
        { label: 'Interviews', value: interviewCount, color: '#1D9E75' },
        { label: 'App. viewed', value: stats.byStatus.APPLICATION_VIEWED ?? 0, color: '#EF9F27' },
        { label: 'No reply', value: stats.byStatus.NO_REPLY ?? 0, color: '#888780' },
        { label: 'Offer', value: stats.byStatus.OFFER ?? 0, color: '#639922' },
      ]
    : []

  const platformEntries = stats
    ? Object.entries(stats.byPlatform)
        .filter(([, n]) => n > 0)
        .sort(([, a], [, b]) => b - a)
        .map(([platform, count]) => ({
          label: PLATFORM_LABELS[platform as keyof typeof PLATFORM_LABELS] ?? platform,
          count,
          colorClass: PLATFORM_TAILWIND[platform] ?? 'bg-[#888780]',
          color: PLATFORM_COLORS[platform] ?? '#888780',
        }))
    : []

  const maxPlatform = platformEntries.reduce((m, e) => Math.max(m, e.count), 0)

  const filteredApps = applications.filter((a) => {
    if (filter === 'ALL') return true
    if (filter === 'INTERVIEWS')
      return ['FIRST_ROUND', 'SECOND_ROUND', 'FINAL_ROUND'].includes(a.current_status)
    if (filter === 'NO_REPLY') return a.current_status === 'NO_REPLY'
    if (filter === 'OFFER') return a.current_status === 'OFFER'
    return true
  })

  return (
    <div className="flex h-screen overflow-hidden bg-[#f0eeeb]">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="bg-white border-b border-[#e8e6e1] px-6 py-3.5 flex items-center justify-between flex-shrink-0">
          <span className="text-base font-medium text-[#1c1c1a]">{getGreeting()} 👋</span>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#1a1a2e] rounded-lg transition-opacity hover:opacity-90"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Log application
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-7 h-7 border-2 border-[#e8e6e1] border-t-[#6e6e6a] rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Stat cards */}
              <div className="grid grid-cols-4 gap-3">
                <StatCard
                  label="Total applications"
                  value={stats?.total ?? 0}
                  sub={
                    <>
                      <span className="text-[#1D9E75] font-medium">
                        +{applications.filter((a) => {
                          const days = (Date.now() - new Date(a.created_at).getTime()) / 86_400_000
                          return days <= 7
                        }).length}
                      </span>{' '}
                      this week
                    </>
                  }
                />
                <StatCard
                  label="In interviews"
                  value={interviewCount}
                  sub={
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] inline-block" />
                      Active
                    </>
                  }
                />
                <StatCard
                  label="Offers"
                  value={stats?.byStatus.OFFER ?? 0}
                  sub={
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#639922] inline-block" />
                      Congratulations
                    </>
                  }
                />
                <StatCard
                  label="No reply"
                  value={stats?.byStatus.NO_REPLY ?? 0}
                  sub={
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#888780] inline-block" />
                      Over 30 days: {noReplyOver30}
                    </>
                  }
                />
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Donut chart card */}
                <div className="bg-white rounded-xl border border-[#e8e6e1] p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-[#1c1c1a]">Application status</span>
                    <span className="text-xs text-[#6e6e6a]">{stats?.total ?? 0} total</span>
                  </div>
                  <div className="flex flex-col items-center gap-4">
                    <DonutChart segments={donutSegments} total={stats?.total ?? 0} />
                    <div className="flex flex-col gap-2 w-full">
                      {donutSegments
                        .filter((s) => s.value > 0)
                        .map((seg) => (
                          <div
                            key={seg.label}
                            className="flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-1.5 text-[#6e6e6a]">
                              <span
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ background: seg.color }}
                              />
                              {seg.label}
                            </div>
                            <span className="font-medium text-[#1c1c1a]">{seg.value}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Platform card */}
                <div className="bg-white rounded-xl border border-[#e8e6e1] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-[#1c1c1a]">By platform</span>
                    <span className="text-xs text-[#6e6e6a]">
                      {platformEntries.length} platform{platformEntries.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {platformEntries.length === 0 ? (
                    <p className="text-sm text-[#6e6e6a]">No data yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {platformEntries.map((e) => (
                        <PlatformBar
                          key={e.label}
                          label={e.label}
                          count={e.count}
                          max={maxPlatform}
                          colorClass={e.colorClass}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Applications table */}
              <ApplicationTable
                applications={filteredApps}
                filter={filter}
                onFilterChange={setFilter}
                onRowClick={setSelectedId}
              />
            </>
          )}
        </div>
      </div>

      {/* Add application modal */}
      {showModal && (
        <AddApplicationModal onClose={() => setShowModal(false)} onCreated={fetchData} />
      )}

      {/* Detail panel (slide-in) */}
      <ApplicationDetailPanel
        applicationId={selectedId}
        onClose={() => setSelectedId(null)}
        onStatusUpdated={fetchData}
      />
    </div>
  )
}
