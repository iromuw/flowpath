'use client'

import { useState, useEffect } from 'react'
import { Application, PLATFORM_LABELS, WORK_MODE_LABELS } from '@/lib/types'
import { StatusBadge } from './StatusBadge'

export type DashboardFilter = 'ALL' | 'INTERVIEWS' | 'NO_REPLY' | 'OFFER'

const FILTERS: { key: DashboardFilter; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'INTERVIEWS', label: 'Interviews' },
  { key: 'NO_REPLY', label: 'No reply' },
  { key: 'OFFER', label: 'Offers' },
]

const DASHBOARD_SIZE = 10
const PAGE_SIZE_OPTIONS = [10, 20, 30, 50]

interface ApplicationTableProps {
  applications: Application[]
  filter: DashboardFilter
  onFilterChange: (f: DashboardFilter) => void
  onRowClick: (id: string) => void
  showAll?: boolean
  title?: string
  currentPage?: number
  onPageChange?: (page: number) => void
  currentPageSize?: number
  onPageSizeChange?: (size: number) => void
}

export function ApplicationTable({
  applications,
  filter,
  onFilterChange,
  onRowClick,
  showAll = false,
  title = 'Recent applications',
  currentPage: controlledPage,
  onPageChange,
  currentPageSize: controlledPageSize,
  onPageSizeChange,
}: ApplicationTableProps) {
  const isControlled = showAll && controlledPage !== undefined && onPageChange !== undefined

  const [localPage, setLocalPage] = useState(1)
  const [localPageSize, setLocalPageSize] = useState(10)

  const currentPage = isControlled ? controlledPage : localPage
  const pageSize = isControlled && controlledPageSize !== undefined ? controlledPageSize : localPageSize

  function handlePageChange(page: number) {
    if (isControlled) onPageChange!(page)
    else setLocalPage(page)
  }

  function handlePageSizeChange(size: number) {
    if (isControlled && onPageSizeChange) onPageSizeChange(size)
    else { setLocalPageSize(size); setLocalPage(1) }
  }

  useEffect(() => {
    if (!isControlled) setLocalPage(1)
  }, [filter, localPageSize, isControlled])

  let visible: Application[]
  let hasMore = false
  let totalPages = 1

  if (!showAll) {
    visible = applications.slice(0, DASHBOARD_SIZE)
    hasMore = applications.length > DASHBOARD_SIZE
  } else {
    totalPages = Math.max(1, Math.ceil(applications.length / pageSize))
    const start = (currentPage - 1) * pageSize
    visible = applications.slice(start, start + pageSize)
  }

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
    .reduce<(number | '...')[]>((acc, p, i, arr) => {
      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...')
      acc.push(p)
      return acc
    }, [])

  return (
    <div className="bg-white rounded-xl border border-[rgba(26,101,90,0.15)] overflow-hidden hover:border-[rgba(26,101,90,0.30)] transition-colors">
      {/* Header with filter pills */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(26,101,90,0.15)]">
        <span className="text-sm font-medium text-[#1A2520]">{title}</span>
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => onFilterChange(f.key)}
              className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                filter === f.key
                  ? 'text-white bg-[#0FA878] border-transparent'
                  : 'border-[rgba(26,101,90,0.15)] text-[#4A8C7E] bg-transparent hover:bg-[#E6F4F1]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="px-4 py-12 text-center text-sm text-[#4A8C7E]">
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
          <thead className="bg-[#E6F4F1]">
            <tr>
              {['Job title', 'Company', 'Platform', 'Status', 'Applied', 'Mode'].map((h) => (
                <th
                  key={h}
                  className="text-left text-[11px] font-medium text-[#4A8C7E] px-4 py-2.5 border-b border-[rgba(26,101,90,0.15)]"
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
                className="cursor-pointer hover:bg-[#E6F4F1] transition-colors border-b border-[rgba(26,101,90,0.15)] last:border-b-0"
              >
                <td className="px-4 py-3 text-sm font-medium text-[#1A2520] overflow-hidden text-ellipsis whitespace-nowrap">
                  {app.job_title}
                </td>
                <td className="px-4 py-3 text-sm text-[#4A8C7E] overflow-hidden text-ellipsis whitespace-nowrap">
                  {app.company}
                </td>
                <td className="px-4 py-3">
                  <span className="text-[11px] text-[#4A8C7E]">
                    {PLATFORM_LABELS[app.platform]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={app.current_status} />
                </td>
                <td className="px-4 py-3 text-sm text-[#4A8C7E]">
                  {new Date(app.submitted_date).toLocaleDateString('en-AU', {
                    timeZone: 'Australia/Sydney',
                    day: 'numeric',
                    month: 'short',
                  })}
                </td>
                <td className="px-4 py-3 text-sm text-[#4A8C7E]">
                  {WORK_MODE_LABELS[app.work_mode]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Dashboard "View all" footer */}
      {!showAll && hasMore && (
        <div className="px-4 py-2.5 border-t border-[rgba(26,101,90,0.15)] flex justify-end">
          <a
            href="/applications"
            className="text-xs text-[#4A8C7E] hover:text-[#1A2520] transition-colors"
          >
            View all →
          </a>
        </div>
      )}

      {/* Pagination footer */}
      {showAll && applications.length > 0 && (
        <div className="px-4 py-3 border-t border-[rgba(26,101,90,0.15)] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#4A8C7E]">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="border border-[rgba(26,101,90,0.15)] rounded px-1.5 py-0.5 text-xs text-[#1A2520] bg-white focus:outline-none focus:border-[#0FA878] cursor-pointer"
            >
              {PAGE_SIZE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <span>per page</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#4A8C7E]">
              {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, applications.length)} of {applications.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 text-xs rounded border border-[rgba(26,101,90,0.15)] text-[#4A8C7E] hover:bg-[#E6F4F1] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ←
              </button>
              {pageNumbers.map((p, i) =>
                p === '...' ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-xs text-[#4A8C7E]">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p as number)}
                    className={`min-w-[28px] px-1.5 py-1 text-xs rounded border transition-colors ${
                      currentPage === p
                        ? 'bg-[#0FA878] text-white border-transparent'
                        : 'border-[rgba(26,101,90,0.15)] text-[#4A8C7E] hover:bg-[#E6F4F1]'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-2 py-1 text-xs rounded border border-[rgba(26,101,90,0.15)] text-[#4A8C7E] hover:bg-[#E6F4F1] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
