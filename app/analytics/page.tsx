'use client'

import { useState, useEffect } from 'react'
import { AnalyticsStats } from '@/lib/types'
import { PageShell } from '@/app/components/PageShell'
import { SummaryRow } from '@/app/components/analytics/SummaryRow'
import { WeeklyChart } from '@/app/components/analytics/WeeklyChart'
import { StatusBarChart } from '@/app/components/analytics/StatusBarChart'
import { PlatformTable } from '@/app/components/analytics/PlatformTable'
import { TopCompanies } from '@/app/components/analytics/TopCompanies'

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <PageShell>
      {/* Topbar */}
      <div className="bg-white border-b border-[rgba(26,101,90,0.15)] px-6 py-3.5 flex-shrink-0">
        <span className="text-base font-medium text-[#1A2520]">Analytics</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-7 h-7 border-2 border-[rgba(26,101,90,0.15)] border-t-[#4A8C7E] rounded-full animate-spin" />
          </div>
        ) : !stats ? (
          <div className="flex items-center justify-center py-24 text-sm text-[#4A8C7E]">
            Failed to load analytics.
          </div>
        ) : (
          <>
            {/* Summary row */}
            <SummaryRow
              responseRate={stats.responseRate}
              interviewConversionRate={stats.interviewConversionRate}
              avgDaysToResponse={stats.avgDaysToResponse}
              offerRate={stats.offerRate}
            />

            {/* Charts row */}
            <div className="grid grid-cols-2 gap-4">
              <WeeklyChart data={stats.weeklyApplications} />
              <StatusBarChart byStatus={stats.byStatus} />
            </div>

            {/* Bottom row */}
            <div className="grid grid-cols-2 gap-4">
              <PlatformTable data={stats.platformPerformance} />
              <TopCompanies data={stats.topCompanies} />
            </div>
          </>
        )}
      </div>
    </PageShell>
  )
}
