'use client'

import { useState, useEffect, useCallback } from 'react'
import { Application, Stats } from '@/lib/types'
import { useCampaign } from '@/app/contexts/CampaignContext'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { StatCard } from './StatCard'
import { DonutChart, DonutSegment } from './DonutChart'
import { PlatformBar } from './PlatformBar'
import { ApplicationTable, DashboardFilter } from './ApplicationTable'
import { AddApplicationModal } from './AddApplicationModal'
import { ApplicationDetailPanel } from './ApplicationDetailPanel'

const PALETTE_COLORS = ['#0A66C2', '#D6006E', '#2557A7', '#0FA878', '#E0784A', '#7B3FAC', '#D4A017', '#5E8088']
const PALETTE_TAILWIND = [
  'bg-[#0A66C2]', 'bg-[#D6006E]', 'bg-[#2557A7]', 'bg-[#0FA878]',
  'bg-[#E0784A]', 'bg-[#7B3FAC]', 'bg-[#D4A017]', 'bg-[#5E8088]',
]

function getGreeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

export function Dashboard() {
  const { activeCampaign } = useCampaign()
  const campaignId = activeCampaign?.id

  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [filter, setFilter] = useState<DashboardFilter>('ALL')
  const [showModal, setShowModal] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchApplicationsAndStats = useCallback(async (): Promise<[unknown, Partial<Stats>]> => {
    const qs = campaignId ? `?campaignId=${campaignId}` : ''
    const [appsRes, statsRes] = await Promise.all([
      fetch(`/api/applications${qs}`),
      fetch(`/api/stats${qs}`),
    ])
    return Promise.all([appsRes.json(), statsRes.json()])
  }, [campaignId])

  const fetchData = useCallback(async () => {
    try {
      const [apps, statsData] = await fetchApplicationsAndStats()
      if (Array.isArray(apps)) setApplications(
        [...apps].sort((a, b) => new Date(b.submitted_date).getTime() - new Date(a.submitted_date).getTime())
      )
      if (statsData?.byStatus) setStats(statsData as Stats)
    } catch {
      // leave existing state intact on network failure
    } finally {
      setLoading(false)
    }
  }, [fetchApplicationsAndStats])

  useEffect(() => {
    let active = true
    setLoading(true)

    const loadInitialData = async () => {
      try {
        const [apps, statsData] = await fetchApplicationsAndStats()
        if (!active) return
        if (Array.isArray(apps)) setApplications(
        [...apps].sort((a, b) => new Date(b.submitted_date).getTime() - new Date(a.submitted_date).getTime())
      )
        if (statsData?.byStatus) setStats(statsData as Stats)
      } catch {
        // leave existing state intact on network failure
      } finally {
        if (active) setLoading(false)
      }
    }

    loadInitialData()

    return () => {
      active = false
    }
  }, [fetchApplicationsAndStats])

  const interviewCount = stats
    ? (stats.byStatus.FIRST_ROUND ?? 0) +
      (stats.byStatus.SECOND_ROUND ?? 0) +
      (stats.byStatus.FINAL_ROUND ?? 0)
    : 0

  const noReplyOver30 = stats?.noReplyOver30 ?? 0

  const donutSegments: DonutSegment[] = stats
    ? [
        { label: 'Submitted', value: stats.byStatus.SUBMITTED ?? 0, color: '#0A66C2' },
        { label: 'Interviews', value: interviewCount, color: '#E0784A' },
        { label: 'Viewed', value: stats.byStatus.APPLICATION_VIEWED ?? 0, color: '#D4A04A' },
        { label: 'No reply', value: stats.byStatus.NO_REPLY ?? 0, color: '#8AADA8' },
        { label: 'Offer', value: stats.byStatus.OFFER ?? 0, color: '#0FA878' },
        { label: 'Unsuccessful', value: stats.byStatus.UNSUCCESSFUL ?? 0, color: '#D6006E' },
        { label: 'Withdrawn', value: stats.byStatus.WITHDRAWN ?? 0, color: '#A8004F' },
        { label: 'Job closed', value: stats.byStatus.JOB_CLOSED ?? 0, color: '#6B7A8D' },
      ]
    : []

  const platformEntries = stats
    ? Object.entries(stats.byPlatform)
        .filter(([, n]) => n > 0)
        .sort(([, a], [, b]) => b - a)
        .map(([name, count], i) => ({
          label: name,
          count,
          colorClass: PALETTE_TAILWIND[i % PALETTE_TAILWIND.length],
          color: PALETTE_COLORS[i % PALETTE_COLORS.length],
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
    <div className="flex h-screen overflow-hidden bg-[#F5F2EE]">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden pb-16 md:pb-0">
        {/* Topbar */}
        <div className="bg-white border-b border-[rgba(26,101,90,0.15)] px-6 py-3.5 flex items-center justify-between flex-shrink-0">
          <span className="text-base font-medium text-[#1A2520]">{getGreeting()} 👋</span>
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

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-7 h-7 border-2 border-[rgba(26,101,90,0.15)] border-t-[#4A8C7E] rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Stat cards */}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                <StatCard
                  label="Total applications"
                  value={stats?.total ?? 0}
                  accent="#0A66C2"
                  sub={
                    <>
                      <span style={{ color: '#0A66C2' }} className="font-medium">
                        +{applications.filter((a) => {
                          const now = new Date()
                          const monday = new Date(now)
                          monday.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1))
                          monday.setHours(0, 0, 0, 0)
                          return new Date(a.created_at) >= monday
                        }).length}
                      </span>{' '}
                      this week
                    </>
                  }
                />
                <StatCard
                  label="In interviews"
                  value={interviewCount}
                  accent="#E0784A"
                  sub={
                    <>
                      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#E0784A' }} />
                      Active
                    </>
                  }
                />
                <StatCard
                  label="Offers"
                  value={stats?.byStatus.OFFER ?? 0}
                  accent="#0FA878"
                  sub={
                    <>
                      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#0FA878' }} />
                      Congratulations
                    </>
                  }
                />
                <StatCard
                  label="No reply"
                  value={stats?.byStatus.NO_REPLY ?? 0}
                  accent="#8AADA8"
                  sub={
                    <>
                      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#8AADA8' }} />
                      Over 30 days: {noReplyOver30}
                    </>
                  }
                />
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* Donut chart card */}
                <div className="bg-white rounded-xl border border-[rgba(26,101,90,0.15)] p-4 hover:border-[rgba(26,101,90,0.30)] transition-colors">
                  <div className="mb-3">
                    <span className="text-sm font-medium text-[#1A2520]">Application status</span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <DonutChart segments={donutSegments} total={stats?.total ?? 0} />
                    <div className="flex flex-col gap-3 flex-1 min-w-0">
                      {donutSegments
                        .filter((s) => s.value > 0)
                        .map((seg) => (
                          <div key={seg.label} className="flex items-center gap-2 text-xs text-[#4A8C7E]">
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ background: seg.color }}
                            />
                            {seg.label}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Platform card */}
                <div className="bg-white rounded-xl border border-[rgba(26,101,90,0.15)] p-4 hover:border-[rgba(26,101,90,0.30)] transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-[#1A2520]">By platform</span>
                    <span className="text-xs text-[#4A8C7E]">
                      {platformEntries.length} platform{platformEntries.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {platformEntries.length === 0 ? (
                    <p className="text-sm text-[#4A8C7E]">No data yet.</p>
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

      <BottomNav />
    </div>
  )
}
