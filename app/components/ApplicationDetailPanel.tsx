'use client'

import { useState, useEffect } from 'react'
import {
  Application,
  ApplicationStatus,
  STATUS_LABELS,
  PLATFORM_LABELS,
  JOB_TYPE_LABELS,
  WORK_MODE_LABELS,
  ALL_STATUSES,
} from '@/lib/types'
import { StatusBadge } from './StatusBadge'

interface Props {
  applicationId: string | null
  onClose: () => void
  onStatusUpdated: () => void
}

export function ApplicationDetailPanel({ applicationId, onClose, onStatusUpdated }: Props) {
  const [app, setApp] = useState<Application | null>(null)
  const [loading, setLoading] = useState(false)
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('SUBMITTED')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (!applicationId) {
      setApp(null)
      return
    }
    setLoading(true)
    fetch(`/api/applications/${applicationId}`)
      .then((r) => r.json())
      .then((data) => {
        setApp(data)
        setNewStatus(data.current_status)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [applicationId])

  async function handleStatusUpdate() {
    if (!app || newStatus === app.current_status) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/applications/${app.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_status: newStatus }),
      })
      if (res.ok) {
        const updated = await res.json()
        setApp(updated)
        onStatusUpdated()
      }
    } catch {
      // network error — leave state as-is
    } finally {
      setUpdating(false)
    }
  }

  const isOpen = !!applicationId

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 transition-opacity"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed right-0 top-0 bottom-0 z-50 w-[460px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-[#e8e6e1]">
          <div className="flex-1 min-w-0 pr-4">
            {app ? (
              <>
                <h2 className="font-semibold text-[#1c1c1a] truncate">{app.job_title}</h2>
                <p className="text-sm text-[#6e6e6a] mt-0.5">
                  {app.company} · {app.location}
                </p>
              </>
            ) : (
              <div className="h-5 w-40 bg-gray-100 rounded animate-pulse" />
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#f0eeeb] text-[#6e6e6a] flex-shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#e8e6e1] border-t-[#6e6e6a] rounded-full animate-spin" />
          </div>
        )}

        {!loading && app && (
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Status badge */}
              <StatusBadge status={app.current_status} />

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3">
                <Detail label="Platform" value={PLATFORM_LABELS[app.platform]} />
                <Detail label="Job Type" value={JOB_TYPE_LABELS[app.job_type]} />
                <Detail label="Work Mode" value={WORK_MODE_LABELS[app.work_mode]} />
                <Detail
                  label="Applied"
                  value={new Date(app.submitted_date).toLocaleDateString('en-AU', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                />
                {app.salary_range && <Detail label="Salary" value={app.salary_range} />}
              </div>

              {/* Links */}
              {(app.job_url || app.company_url) && (
                <div className="flex gap-2 flex-wrap">
                  {app.job_url && (
                    <a
                      href={app.job_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-3 py-1.5 rounded-full border border-[#e8e6e1] text-[#6e6e6a] hover:bg-[#f7f6f3] transition-colors"
                    >
                      View job posting ↗
                    </a>
                  )}
                  {app.company_url && (
                    <a
                      href={app.company_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-3 py-1.5 rounded-full border border-[#e8e6e1] text-[#6e6e6a] hover:bg-[#f7f6f3] transition-colors"
                    >
                      Company website ↗
                    </a>
                  )}
                </div>
              )}

              {/* Notes */}
              {app.notes && (
                <div>
                  <p className="text-[10px] font-semibold text-[#6e6e6a] uppercase tracking-wider mb-2">
                    Notes
                  </p>
                  <p className="text-sm text-[#1c1c1a] whitespace-pre-wrap leading-relaxed">
                    {app.notes}
                  </p>
                </div>
              )}

              {/* Timeline */}
              <div>
                <p className="text-[10px] font-semibold text-[#6e6e6a] uppercase tracking-wider mb-3">
                  Timeline
                </p>
                <ol className="relative border-l border-[#e8e6e1] space-y-4 ml-2">
                  {app.status_history.map((entry, i) => (
                    <li key={entry.id} className="ml-5">
                      <span
                        className={`absolute -left-2.5 flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-white text-[10px] font-semibold ${
                          i === app.status_history.length - 1
                            ? 'bg-[#1a1a2e] text-white'
                            : 'bg-[#f0eeeb] text-[#6e6e6a]'
                        }`}
                      >
                        {i + 1}
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge status={entry.status} />
                        <time className="text-xs text-[#6e6e6a]">
                          {new Date(entry.changed_at).toLocaleString('en-AU', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </time>
                      </div>
                      {entry.note && (
                        <p className="mt-1 text-xs text-[#6e6e6a] italic">{entry.note}</p>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Footer: status update */}
        {!loading && app && (
          <div className="px-6 py-4 border-t border-[#e8e6e1] space-y-2">
            <label className="block text-xs font-medium text-[#6e6e6a]">Update status</label>
            <div className="flex gap-2">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
                className="flex-1 border border-[#e8e6e1] rounded-lg px-3 py-2 text-sm text-[#1c1c1a] bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
              >
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
              <button
                onClick={handleStatusUpdate}
                disabled={updating || newStatus === app.current_status}
                className="px-4 py-2 text-sm font-medium text-white bg-[#1a1a2e] rounded-lg transition-opacity disabled:opacity-40"
              >
                {updating ? '...' : 'Save'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold text-[#6e6e6a] uppercase tracking-wider mb-0.5">
        {label}
      </dt>
      <dd className="text-sm text-[#1c1c1a]">{value}</dd>
    </div>
  )
}
