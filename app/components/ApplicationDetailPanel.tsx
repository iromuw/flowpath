'use client'

import { useState, useEffect } from 'react'
import {
  Application,
  ApplicationStatus,
  Platform,
  JobType,
  WorkMode,
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

const inputCls =
  'w-full border border-[rgba(26,101,90,0.15)] rounded-lg px-3 py-1.5 text-sm bg-[#E6F4F1] text-[#1A2520] placeholder:text-[#8AADA8] focus:outline-none focus:ring-2 focus:ring-[#0FA878]/30 focus:border-transparent'

interface EditData {
  job_title: string
  company: string
  location: string
  submitted_date: string
  platform: Platform
  job_type: JobType
  work_mode: WorkMode
  job_url: string
  company_url: string
  salary_range: string
  notes: string
}

export function ApplicationDetailPanel({ applicationId, onClose, onStatusUpdated }: Props) {
  const [app, setApp] = useState<Application | null>(null)
  const [loading, setLoading] = useState(false)
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('SUBMITTED')
  const [updating, setUpdating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<EditData | null>(null)
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState('')

  useEffect(() => {
    if (!applicationId) {
      setApp(null)
      setIsEditing(false)
      return
    }
    setLoading(true)
    setIsEditing(false)
    fetch(`/api/applications/${applicationId}`)
      .then((r) => r.json())
      .then((data) => {
        setApp(data)
        setNewStatus(data.current_status)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [applicationId])

  function startEditing() {
    if (!app) return
    setEditData({
      job_title: app.job_title,
      company: app.company,
      location: app.location,
      submitted_date: app.submitted_date.split('T')[0],
      platform: app.platform,
      job_type: app.job_type,
      work_mode: app.work_mode,
      job_url: app.job_url ?? '',
      company_url: app.company_url ?? '',
      salary_range: app.salary_range ?? '',
      notes: app.notes ?? '',
    })
    setEditError('')
    setIsEditing(true)
  }

  function cancelEditing() {
    setIsEditing(false)
    setEditData(null)
    setEditError('')
  }

  async function handleSave() {
    if (!app || !editData) return
    setSaving(true)
    setEditError('')
    try {
      const res = await fetch(`/api/applications/${app.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editData,
          job_url: editData.job_url || null,
          company_url: editData.company_url || null,
          salary_range: editData.salary_range || null,
          notes: editData.notes || null,
        }),
      })
      if (res.ok) {
        const updated = await res.json()
        setApp(updated)
        setIsEditing(false)
        setEditData(null)
        onStatusUpdated()
      } else {
        const json = await res.json()
        setEditError(json.error ?? 'Save failed.')
      }
    } catch {
      setEditError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

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
          onClick={isEditing ? undefined : onClose}
        />
      )}

      <div
        className={`fixed right-0 top-0 bottom-0 z-50 w-[480px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-[rgba(26,101,90,0.15)]">
          <div className="flex-1 min-w-0 pr-4">
            {app ? (
              <>
                <h2 className="font-semibold text-[#1A2520] truncate">{app.job_title}</h2>
                <p className="text-sm text-[#4A8C7E] mt-0.5">
                  {app.company} · {app.location}
                </p>
              </>
            ) : (
              <div className="h-5 w-40 bg-[#E6F4F1] rounded animate-pulse" />
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {app && !isEditing && (
              <button
                onClick={startEditing}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#4A8C7E] border border-[rgba(26,101,90,0.2)] rounded-lg hover:bg-[#E6F4F1] transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M8.5 1.5a1.414 1.414 0 012 2L4 10H2v-2L8.5 1.5z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Edit
              </button>
            )}
            {!isEditing && (
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#E6F4F1] text-[#4A8C7E] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[rgba(26,101,90,0.15)] border-t-[#4A8C7E] rounded-full animate-spin" />
          </div>
        )}

        {!loading && app && !isEditing && (
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              <StatusBadge status={app.current_status} />

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

              {(app.job_url || app.company_url) && (
                <div className="flex gap-2 flex-wrap">
                  {app.job_url && (
                    <a
                      href={app.job_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-3 py-1.5 rounded-full border border-[rgba(26,101,90,0.15)] text-[#4A8C7E] hover:bg-[#E6F4F1] transition-colors"
                    >
                      View job posting ↗
                    </a>
                  )}
                  {app.company_url && (
                    <a
                      href={app.company_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-3 py-1.5 rounded-full border border-[rgba(26,101,90,0.15)] text-[#4A8C7E] hover:bg-[#E6F4F1] transition-colors"
                    >
                      Company website ↗
                    </a>
                  )}
                </div>
              )}

              {app.notes && (
                <div>
                  <p className="text-[10px] font-semibold text-[#4A8C7E] uppercase tracking-wider mb-2">
                    Notes
                  </p>
                  <p className="text-sm text-[#1A2520] whitespace-pre-wrap leading-relaxed">
                    {app.notes}
                  </p>
                </div>
              )}

              <div>
                <p className="text-[10px] font-semibold text-[#4A8C7E] uppercase tracking-wider mb-3">
                  Timeline
                </p>
                <ol className="relative border-l border-[rgba(26,101,90,0.15)] space-y-4 ml-2">
                  {app.status_history.map((entry, i) => (
                    <li key={entry.id} className="ml-5">
                      <span
                        className={`absolute -left-2.5 flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-white text-[10px] font-semibold ${
                          i === app.status_history.length - 1
                            ? 'bg-[#0FA878] text-white'
                            : 'bg-[#E6F4F1] text-[#4A8C7E]'
                        }`}
                      >
                        {i + 1}
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge status={entry.status} />
                        <time className="text-xs text-[#4A8C7E]">
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
                        <p className="mt-1 text-xs text-[#4A8C7E] italic">{entry.note}</p>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Edit form */}
        {!loading && app && isEditing && editData && (
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-4">
              {editError && (
                <p className="text-sm text-[#C0392B] bg-[#F5E8E8] border border-[rgba(192,57,43,0.2)] rounded-lg px-3 py-2">
                  {editError}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-[#4A8C7E] uppercase tracking-wider mb-1">Job Title</label>
                  <input
                    value={editData.job_title}
                    onChange={(e) => setEditData({ ...editData, job_title: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#4A8C7E] uppercase tracking-wider mb-1">Company</label>
                  <input
                    value={editData.company}
                    onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-[#4A8C7E] uppercase tracking-wider mb-1">Location</label>
                  <input
                    value={editData.location}
                    onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#4A8C7E] uppercase tracking-wider mb-1">Date Applied</label>
                  <input
                    type="date"
                    value={editData.submitted_date}
                    onChange={(e) => setEditData({ ...editData, submitted_date: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-[#4A8C7E] uppercase tracking-wider mb-1">Platform</label>
                  <select
                    value={editData.platform}
                    onChange={(e) => setEditData({ ...editData, platform: e.target.value as Platform })}
                    className={inputCls}
                  >
                    <option value="SEEK">Seek</option>
                    <option value="INDEED">Indeed</option>
                    <option value="LINKEDIN">LinkedIn</option>
                    <option value="COMPANY">Company Website</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#4A8C7E] uppercase tracking-wider mb-1">Job Type</label>
                  <select
                    value={editData.job_type}
                    onChange={(e) => setEditData({ ...editData, job_type: e.target.value as JobType })}
                    className={inputCls}
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="CASUAL">Casual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#4A8C7E] uppercase tracking-wider mb-1">Work Mode</label>
                  <select
                    value={editData.work_mode}
                    onChange={(e) => setEditData({ ...editData, work_mode: e.target.value as WorkMode })}
                    className={inputCls}
                  >
                    <option value="HYBRID">Hybrid</option>
                    <option value="ONSITE">On-site</option>
                    <option value="REMOTE">Remote</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-[#4A8C7E] uppercase tracking-wider mb-1">Job URL</label>
                  <input
                    type="url"
                    value={editData.job_url}
                    onChange={(e) => setEditData({ ...editData, job_url: e.target.value })}
                    placeholder="https://..."
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#4A8C7E] uppercase tracking-wider mb-1">Company URL</label>
                  <input
                    type="url"
                    value={editData.company_url}
                    onChange={(e) => setEditData({ ...editData, company_url: e.target.value })}
                    placeholder="https://..."
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#4A8C7E] uppercase tracking-wider mb-1">Salary Range</label>
                <input
                  value={editData.salary_range}
                  onChange={(e) => setEditData({ ...editData, salary_range: e.target.value })}
                  placeholder="e.g. $100k–$120k"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#4A8C7E] uppercase tracking-wider mb-1">Notes</label>
                <textarea
                  rows={4}
                  value={editData.notes}
                  onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                  placeholder="Any notes about this role..."
                  className={inputCls}
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer: status update (view mode) */}
        {!loading && app && !isEditing && (
          <div className="px-6 py-4 border-t border-[rgba(26,101,90,0.15)] space-y-2">
            <label className="block text-xs font-medium text-[#4A8C7E]">Update status</label>
            <div className="flex gap-2">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
                className="flex-1 border border-[rgba(26,101,90,0.15)] rounded-lg px-3 py-2 text-sm text-[#1A2520] bg-[#E6F4F1] focus:outline-none focus:ring-2 focus:ring-[#0FA878]/30"
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
                className="px-4 py-2 text-sm font-medium text-white bg-[#0FA878] rounded-lg hover:bg-[#0D9068] transition-colors disabled:opacity-40"
              >
                {updating ? '...' : 'Save'}
              </button>
            </div>
          </div>
        )}

        {/* Footer: edit actions */}
        {!loading && app && isEditing && (
          <div className="px-6 py-4 border-t border-[rgba(26,101,90,0.15)] flex gap-2 justify-end">
            <button
              onClick={cancelEditing}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-[#1A6B5A] border border-[#1A6B5A] rounded-lg hover:bg-[#E6F4F1] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-[#0FA878] rounded-lg hover:bg-[#0D9068] transition-colors disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        )}
      </div>
    </>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold text-[#4A8C7E] uppercase tracking-wider mb-0.5">
        {label}
      </dt>
      <dd className="text-sm text-[#1A2520]">{value}</dd>
    </div>
  )
}
