'use client'

import { Application, PLATFORM_LABELS, WORK_MODE_LABELS } from '@/lib/types'
import { StatusBadge } from './StatusBadge'

export type DashboardFilter = 'ALL' | 'INTERVIEWS' | 'NO_REPLY' | 'OFFER'

const FILTERS: { key: DashboardFilter; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'INTERVIEWS', label: 'Interviews' },
  { key: 'NO_REPLY', label: 'No reply' },
  { key: 'OFFER', label: 'Offers' },
]

const PAGE_SIZE = 10

interface ApplicationTableProps {
  applications: Application[]
  filter: DashboardFilter
  onFilterChange: (f: DashboardFilter) => void
  onRowClick: (id: string) => void
  showAll?: boolean
  title?: string
}

export function ApplicationTable({
  applications,
  filter,
  onFilterChange,
  onRowClick,
  showAll = false,
  title = 'Recent applications',
}: ApplicationTableProps) {
  const visible = showAll ? applications : applications.slice(0, PAGE_SIZE)
  const hasMore = !showAll && applications.length > PAGE_SIZE

  return (
    <div className="bg-white rounded-xl border border-[#e8e6e1] overflow-hidden">
      {/* Header with filter pills */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#e8e6e1]">
        <span className="text-sm font-medium text-[#1c1c1a]">{title}</span>
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => onFilterChange(f.key)}
              className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                filter === f.key
                  ? 'text-white bg-[#1a1a2e] border-transparent'
                  : 'border-[#e8e6e1] text-[#6e6e6a] bg-transparent hover:bg-[#f7f6f3]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="px-4 py-12 text-center text-sm text-[#6e6e6a]">
          No applications found.
        </div>
      ) : (
        <table className="w-full table-fixed border-collapse">
          <colgroup>
            <col style={{ width: '26%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '18%' }} />
            <col style={{ width: '13%' }} />
            <col style={{ width: '9%' }} />
          </colgroup>
          <thead className="bg-[#f7f6f3]">
            <tr>
              {['Job title', 'Company', 'Platform', 'Status', 'Applied', 'Mode'].map((h) => (
                <th
                  key={h}
                  className="text-left text-[11px] font-medium text-[#6e6e6a] px-4 py-2.5 border-b border-[#e8e6e1]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((app) => (
              <tr
                key={app.id}
                onClick={() => onRowClick(app.id)}
                className="cursor-pointer hover:bg-[#f7f6f3] transition-colors border-b border-[#e8e6e1] last:border-b-0"
              >
                <td className="px-4 py-3 text-sm font-medium text-[#1c1c1a] overflow-hidden text-ellipsis whitespace-nowrap">
                  {app.job_title}
                </td>
                <td className="px-4 py-3 text-sm text-[#6e6e6a] overflow-hidden text-ellipsis whitespace-nowrap">
                  {app.company}
                </td>
                <td className="px-4 py-3">
                  <span className="text-[11px] text-[#6e6e6a]">
                    {PLATFORM_LABELS[app.platform]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={app.current_status} />
                </td>
                <td className="px-4 py-3 text-sm text-[#6e6e6a]">
                  {new Date(app.submitted_date).toLocaleDateString('en-AU', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </td>
                <td className="px-4 py-3 text-sm text-[#6e6e6a]">
                  {WORK_MODE_LABELS[app.work_mode]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {hasMore && (
        <div className="px-4 py-2.5 border-t border-[#e8e6e1] flex justify-end">
          <a
            href="/applications"
            className="text-xs text-[#6e6e6a] hover:text-[#1c1c1a] transition-colors"
          >
            View all →
          </a>
        </div>
      )}
    </div>
  )
}
