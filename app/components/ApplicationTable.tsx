'use client'

import { useState, useEffect } from 'react'
import { Application, WORK_MODE_LABELS } from '@/lib/types'
import { StatusBadge } from './StatusBadge'

export type DashboardFilter = 'ALL' | 'INTERVIEWS' | 'NO_REPLY' | 'OFFER' | 'UNSUCCESSFUL'
export type SortOrder = 'newest' | 'oldest'

const FILTERS: { key: DashboardFilter; label: string; dotColor: string }[] = [
  { key: 'ALL',          label: 'All',          dotColor: '#0FA878' },
  { key: 'INTERVIEWS',   label: 'Interviews',   dotColor: '#0D9068' },
  { key: 'NO_REPLY',     label: 'No reply',     dotColor: '#8AADA8' },
  { key: 'OFFER',        label: 'Offers',       dotColor: '#0FA878' },
  { key: 'UNSUCCESSFUL', label: 'Unsuccessful', dotColor: '#A8004F' },
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
  dateFrom?: string
  dateTo?: string
  onDateFromChange?: (v: string) => void
  onDateToChange?: (v: string) => void
  search?: string
  onSearchChange?: (v: string) => void
  sortOrder?: SortOrder
  onSortOrderChange?: (v: SortOrder) => void
  onClearAll?: () => void
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
  dateFrom = '',
  dateTo = '',
  onDateFromChange,
  onDateToChange,
  search = '',
  onSearchChange,
  sortOrder = 'newest',
  onSortOrderChange,
  onClearAll,
}: ApplicationTableProps) {
  const isControlled = showAll && controlledPage !== undefined && onPageChange !== undefined

  const [localPage, setLocalPage] = useState(1)
  const [localPageSize, setLocalPageSize] = useState(10)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)

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

  const hasActiveFilter = search || dateFrom || dateTo || filter !== 'ALL'
  const activeSheetFilterCount = [filter !== 'ALL', !!dateFrom, !!dateTo].filter(Boolean).length

  function clearAll() {
    onClearAll?.()
  }

  // Column visibility: Platform hidden on tablet for showAll (Applications page),
  // but visible on tablet for dashboard mode.
  const platformColClass = showAll ? 'hidden lg:table-cell' : 'hidden md:table-cell'

  const inputClass =
    'w-full px-3 py-2 text-sm border border-[rgba(26,101,90,0.15)] rounded-lg text-[#1A2520] bg-white focus:outline-none focus:border-[#0FA878] transition-colors'

  const filterPills = FILTERS.map((f) => (
    <button
      key={f.key}
      onClick={() => onFilterChange(f.key)}
      className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors whitespace-nowrap ${
        filter === f.key
          ? 'text-white bg-[#0FA878] border-transparent'
          : 'border-[rgba(26,101,90,0.15)] text-[#4A8C7E] bg-transparent hover:bg-[#E6F4F1]'
      }`}
    >
      {f.label}
    </button>
  ))

  return (
    <div className="bg-white rounded-xl border border-[rgba(26,101,90,0.15)] overflow-hidden hover:border-[rgba(26,101,90,0.30)] transition-colors">

      {/* Title row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 px-4 py-3 border-b border-[rgba(26,101,90,0.15)]">
        <span className="text-sm font-medium text-[#1A2520]">{title}</span>
        {!showAll && (
          <div className="flex gap-1.5 flex-wrap">{filterPills}</div>
        )}
      </div>

      {/* Unified filter bar — Applications page, desktop */}
      {showAll && (
        <>
          {/* Mobile: search + filter icon */}
          <div className="md:hidden px-4 py-2.5 border-b border-[rgba(26,101,90,0.15)] bg-[#FAFCFC] flex items-center gap-2">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8AADA8] pointer-events-none" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Search job title, company…"
                value={search}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="w-full pl-9 pr-3 py-[7px] text-sm border border-[rgba(26,101,90,0.15)] rounded-lg text-[#1A2520] placeholder-[#8AADA8] bg-white focus:outline-none focus:border-[#0FA878] transition-colors"
              />
            </div>
            <button
              onClick={() => setFilterSheetOpen(true)}
              className={`flex-shrink-0 p-2 rounded-lg border transition-colors relative ${
                activeSheetFilterCount > 0
                  ? 'border-[#0FA878] text-[#0FA878] bg-[#E6F4F1]'
                  : 'border-[rgba(26,101,90,0.15)] text-[#4A8C7E]'
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4h12M4.5 8h7M7 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {activeSheetFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#0FA878] text-white text-[9px] font-bold flex items-center justify-center">
                  {activeSheetFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Tablet+: full filter bar */}
          <div className="hidden md:block px-4 py-3 border-b border-[rgba(26,101,90,0.15)] bg-[#FAFCFC]">
            <div className="flex items-center gap-2.5 flex-wrap">

              {/* Keyword search */}
              <div className="relative flex-1 min-w-[200px]">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8AADA8] pointer-events-none" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by job title, company or location…"
                  value={search}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="w-full pl-9 pr-3 py-[7px] text-sm border border-[rgba(26,101,90,0.15)] rounded-lg text-[#1A2520] placeholder-[#8AADA8] bg-white focus:outline-none focus:border-[#0FA878] transition-colors"
                />
              </div>

              {/* Date range */}
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="relative">
                  <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8AADA8] pointer-events-none" width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <rect x="1" y="2.5" width="11" height="9.5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M1 5.5h11" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M4 1v3M9 1v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => onDateFromChange?.(e.target.value)}
                    className="pl-[30px] pr-2 py-[7px] text-xs border border-[rgba(26,101,90,0.15)] rounded-lg text-[#1A2520] bg-white focus:outline-none focus:border-[#0FA878] transition-colors cursor-pointer"
                  />
                </div>
                <span className="text-xs text-[#8AADA8]">—</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => onDateToChange?.(e.target.value)}
                  className="px-2 py-[7px] text-xs border border-[rgba(26,101,90,0.15)] rounded-lg text-[#1A2520] bg-white focus:outline-none focus:border-[#0FA878] transition-colors cursor-pointer"
                />
              </div>

              {/* Status filter */}
              <div className="relative shrink-0">
                <div
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full pointer-events-none"
                  style={{ backgroundColor: FILTERS.find((f) => f.key === filter)?.dotColor ?? '#0FA878' }}
                />
                <select
                  value={filter}
                  onChange={(e) => onFilterChange(e.target.value as DashboardFilter)}
                  className="pl-7 pr-6 py-[7px] text-xs border border-[rgba(26,101,90,0.15)] rounded-lg text-[#1A2520] bg-white focus:outline-none focus:border-[#0FA878] appearance-none cursor-pointer transition-colors"
                >
                  {FILTERS.map((f) => (
                    <option key={f.key} value={f.key}>{f.label}</option>
                  ))}
                </select>
                <svg className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#8AADA8]" width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* Sort order */}
              <div className="relative shrink-0">
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8AADA8] pointer-events-none" width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M2 3.5h9M3 6.5h7M4.5 9.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                <select
                  value={sortOrder}
                  onChange={(e) => onSortOrderChange?.(e.target.value as SortOrder)}
                  className="pl-7 pr-6 py-[7px] text-xs border border-[rgba(26,101,90,0.15)] rounded-lg text-[#1A2520] bg-white focus:outline-none focus:border-[#0FA878] appearance-none cursor-pointer transition-colors"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
                <svg className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#8AADA8]" width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* Clear all */}
              {hasActiveFilter && (
                <button
                  onClick={clearAll}
                  className="shrink-0 text-xs text-[#4A8C7E] hover:text-[#1A2520] transition-colors whitespace-nowrap"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Mobile filter bottom sheet */}
          {filterSheetOpen && (
            <div className="fixed inset-0 z-[60] md:hidden flex flex-col justify-end">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setFilterSheetOpen(false)}
              />
              <div className="relative bg-white rounded-t-2xl shadow-xl">
                <div className="p-5 pb-8 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#1A2520]">Filters</span>
                    <button
                      onClick={() => setFilterSheetOpen(false)}
                      className="w-7 h-7 flex items-center justify-center rounded-full text-[#8AADA8] hover:text-[#1A2520] transition-colors"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>

                  {/* Date range */}
                  <div>
                    <span className="text-xs font-medium text-[#4A8C7E] block mb-1.5">Date range</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => onDateFromChange?.(e.target.value)}
                        className={`flex-1 ${inputClass}`}
                      />
                      <span className="text-xs text-[#8AADA8] flex-shrink-0">—</span>
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => onDateToChange?.(e.target.value)}
                        className={`flex-1 ${inputClass}`}
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <span className="text-xs font-medium text-[#4A8C7E] block mb-1.5">Status</span>
                    <div className="relative">
                      <div
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full pointer-events-none"
                        style={{ backgroundColor: FILTERS.find((f) => f.key === filter)?.dotColor ?? '#0FA878' }}
                      />
                      <select
                        value={filter}
                        onChange={(e) => onFilterChange(e.target.value as DashboardFilter)}
                        className="w-full pl-7 pr-8 py-2 text-sm border border-[rgba(26,101,90,0.15)] rounded-lg text-[#1A2520] bg-white focus:outline-none focus:border-[#0FA878] appearance-none cursor-pointer transition-colors"
                      >
                        {FILTERS.map((f) => (
                          <option key={f.key} value={f.key}>{f.label}</option>
                        ))}
                      </select>
                      <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#8AADA8]" width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>

                  {/* Sort */}
                  <div>
                    <span className="text-xs font-medium text-[#4A8C7E] block mb-1.5">Sort by</span>
                    <div className="relative">
                      <select
                        value={sortOrder}
                        onChange={(e) => onSortOrderChange?.(e.target.value as SortOrder)}
                        className="w-full px-3 py-2 text-sm border border-[rgba(26,101,90,0.15)] rounded-lg text-[#1A2520] bg-white focus:outline-none focus:border-[#0FA878] appearance-none cursor-pointer transition-colors"
                      >
                        <option value="newest">Newest first</option>
                        <option value="oldest">Oldest first</option>
                      </select>
                      <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#8AADA8]" width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    {hasActiveFilter && (
                      <button
                        onClick={() => { clearAll(); setFilterSheetOpen(false) }}
                        className="flex-1 py-2.5 text-sm text-[#4A8C7E] border border-[rgba(26,101,90,0.15)] rounded-lg hover:bg-[#E6F4F1] transition-colors"
                      >
                        Clear all
                      </button>
                    )}
                    <button
                      onClick={() => setFilterSheetOpen(false)}
                      className="flex-1 py-2.5 text-sm font-medium text-white bg-[#0FA878] rounded-lg hover:bg-[#0D9068] transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {visible.length === 0 ? (
        <div className="px-4 py-12 text-center text-sm text-[#4A8C7E]">
          No applications found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse">
            <thead className="bg-[#E6F4F1]">
              <tr>
                <th className="text-left text-[11px] font-medium text-[#4A8C7E] px-4 py-2.5 border-b border-[rgba(26,101,90,0.15)]">
                  Job title
                </th>
                <th className="w-[28%] md:w-[22%] lg:w-[18%] text-left text-[11px] font-medium text-[#4A8C7E] px-4 py-2.5 border-b border-[rgba(26,101,90,0.15)]">
                  Company
                </th>
                <th className="hidden md:table-cell w-[16%] lg:w-[14%] text-left text-[11px] font-medium text-[#4A8C7E] px-4 py-2.5 border-b border-[rgba(26,101,90,0.15)]">
                  Location
                </th>
                <th className={`${platformColClass} w-[10%] text-left text-[11px] font-medium text-[#4A8C7E] px-4 py-2.5 border-b border-[rgba(26,101,90,0.15)]`}>
                  Platform
                </th>
                <th className="w-[10%] text-left text-[11px] font-medium text-[#4A8C7E] px-4 py-2.5 border-b border-[rgba(26,101,90,0.15)]">
                  Status
                </th>
                <th className="hidden md:table-cell w-[11%] lg:w-[10%] text-left text-[11px] font-medium text-[#4A8C7E] px-4 py-2.5 border-b border-[rgba(26,101,90,0.15)]">
                  Applied
                </th>
                <th className="hidden lg:table-cell w-[8%] text-left text-[11px] font-medium text-[#4A8C7E] px-4 py-2.5 border-b border-[rgba(26,101,90,0.15)]">
                  Mode
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((app) => (
                <tr
                  key={app.id}
                  onClick={() => onRowClick(app.id)}
                  className="cursor-pointer hover:bg-[#E6F4F1] transition-colors border-b border-[rgba(26,101,90,0.15)] last:border-b-0"
                >
                  <td className="px-4 py-3 text-sm font-medium text-[#1A2520]">
                    {app.job_title}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#4A8C7E]">
                    {app.company}
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-sm text-[#4A8C7E] overflow-hidden text-ellipsis whitespace-nowrap">
                    {app.location ?? '—'}
                  </td>
                  <td className={`${platformColClass} px-4 py-3`}>
                    <span className="text-sm text-[#4A8C7E]">
                      {app.platform?.name ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 overflow-hidden">
                    <StatusBadge status={app.current_status} />
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-sm text-[#4A8C7E] whitespace-nowrap">
                    {new Date(app.submitted_date).toLocaleDateString('en-AU', {
                      timeZone: 'Australia/Sydney',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="hidden lg:table-cell px-4 py-3 text-sm text-[#4A8C7E]">
                    {WORK_MODE_LABELS[app.work_mode]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
