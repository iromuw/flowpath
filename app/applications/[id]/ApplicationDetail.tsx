'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Application,
  ApplicationStatus,
  Platform,
  JobType,
  WorkMode,
  STATUS_LABELS,
  STATUS_COLORS,
  PLATFORM_LABELS,
  JOB_TYPE_LABELS,
  WORK_MODE_LABELS,
  ALL_STATUSES,
} from '@/lib/types'
import { StatusBadge } from '@/app/components/StatusBadge'
import { ConfirmDeleteModal } from '@/app/components/ConfirmDeleteModal'

const inputCls =
  'w-full border border-[rgba(26,101,90,0.15)] rounded-lg px-3 py-2 text-sm bg-[#E6F4F1] text-[#1A2520] placeholder:text-[#8AADA8] focus:outline-none focus:ring-2 focus:ring-[#0FA878]/30 focus:border-transparent'

interface EditForm {
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

export function ApplicationDetail({ id }: { id: string }) {
  const [app, setApp] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('SUBMITTED')
  const [statusNote, setStatusNote] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState<EditForm | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch(`/api/applications/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setApp(data)
        setNewStatus(data.current_status)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  function enterEdit() {
    if (!app) return
    setEditForm({
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
    setEditing(true)
  }

  function field<K extends keyof EditForm>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setEditForm((f) => f ? { ...f, [key]: e.target.value } : f)
  }

  async function handleSaveEdit() {
    if (!editForm) return
    setSaving(true)
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          job_url: editForm.job_url || null,
          company_url: editForm.company_url || null,
          salary_range: editForm.salary_range || null,
          notes: editForm.notes || null,
        }),
      })
      if (res.ok) {
        const updated = await res.json()
        setApp(updated)
        setEditing(false)
        setEditForm(null)
      }
    } catch {
      // leave editing open on network error
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusUpdate() {
    if (!app || newStatus === app.current_status) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_status: newStatus, status_note: statusNote }),
      })
      if (res.ok) {
        const updated = await res.json()
        setApp(updated)
        setStatusNote('')
      }
    } catch {
      // network error — leave state as-is
    } finally {
      setUpdating(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/applications/${id}`, { method: 'DELETE' })
      if (res.ok) router.push('/applications')
    } catch {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F2EE] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[rgba(26,101,90,0.15)] border-t-[#0FA878] rounded-full animate-spin" />
      </div>
    )
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-[#F5F2EE] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#4A8C7E] mb-4">Application not found.</p>
          <Link href="/applications" className="text-[#0FA878] hover:underline">
            Back to applications
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F2EE]">
      <header className="bg-white border-b border-[rgba(26,101,90,0.15)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm text-[#4A8C7E] hover:text-[#1A2520] mb-4 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Applications
          </button>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1A2520]">{app.job_title}</h1>
              <p className="text-[#4A8C7E] mt-0.5">
                {app.company} · {app.location}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <StatusBadge status={app.current_status} />
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-2 text-[#8AADA8] hover:text-[#C0392B] hover:bg-[#F5E8E8] rounded-lg transition-colors"
                title="Delete application"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Application details */}
          <section className="bg-white rounded-xl border border-[rgba(26,101,90,0.15)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#1A2520]">Details</h2>
              {!editing ? (
                <button
                  onClick={enterEdit}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#4A8C7E] border border-[rgba(26,101,90,0.15)] rounded-lg hover:bg-[#E6F4F1] transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditing(false); setEditForm(null) }}
                    className="px-3 py-1.5 text-xs font-medium text-[#4A8C7E] border border-[rgba(26,101,90,0.15)] rounded-lg hover:bg-[#E6F4F1] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={saving}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-[#0FA878] rounded-lg hover:bg-[#0D9068] transition-colors disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            {editing && editForm ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#4A8C7E] mb-1.5">Job Title</label>
                    <input value={editForm.job_title} onChange={field('job_title')} required className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#4A8C7E] mb-1.5">Company</label>
                    <input value={editForm.company} onChange={field('company')} required className={inputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#4A8C7E] mb-1.5">Location</label>
                    <input value={editForm.location} onChange={field('location')} required className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#4A8C7E] mb-1.5">Date Applied</label>
                    <input type="date" value={editForm.submitted_date} onChange={field('submitted_date')} required className={inputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#4A8C7E] mb-1.5">Platform</label>
                    <select value={editForm.platform} onChange={field('platform')} className={inputCls}>
                      <option value="SEEK">Seek</option>
                      <option value="INDEED">Indeed</option>
                      <option value="LINKEDIN">LinkedIn</option>
                      <option value="COMPANY">Company Website</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#4A8C7E] mb-1.5">Job Type</label>
                    <select value={editForm.job_type} onChange={field('job_type')} className={inputCls}>
                      <option value="FULL_TIME">Full Time</option>
                      <option value="PART_TIME">Part Time</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="CASUAL">Casual</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#4A8C7E] mb-1.5">Work Mode</label>
                    <select value={editForm.work_mode} onChange={field('work_mode')} className={inputCls}>
                      <option value="HYBRID">Hybrid</option>
                      <option value="ONSITE">On-site</option>
                      <option value="REMOTE">Remote</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#4A8C7E] mb-1.5">Job URL</label>
                    <input type="url" value={editForm.job_url} onChange={field('job_url')} className={inputCls} placeholder="https://..." />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#4A8C7E] mb-1.5">Company URL</label>
                    <input type="url" value={editForm.company_url} onChange={field('company_url')} className={inputCls} placeholder="https://..." />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4A8C7E] mb-1.5">Salary Range</label>
                  <input value={editForm.salary_range} onChange={field('salary_range')} className={inputCls} placeholder="e.g. $100k–$120k" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4A8C7E] mb-1.5">Notes</label>
                  <textarea value={editForm.notes} onChange={field('notes')} rows={3} className={inputCls} placeholder="Any notes about this role..." />
                </div>
              </div>
            ) : (
              <>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                  <Detail label="Platform" value={PLATFORM_LABELS[app.platform]} />
                  <Detail label="Job Type" value={JOB_TYPE_LABELS[app.job_type]} />
                  <Detail label="Work Mode" value={WORK_MODE_LABELS[app.work_mode]} />
                  <Detail
                    label="Applied On"
                    value={new Date(app.submitted_date).toLocaleDateString('en-AU', {
                      timeZone: 'Australia/Sydney',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  />
                  {app.salary_range && <Detail label="Salary" value={app.salary_range} />}
                  {app.job_url && (
                    <Detail
                      label="Job URL"
                      value={
                        <a href={app.job_url} target="_blank" rel="noopener noreferrer" className="text-[#0FA878] hover:underline truncate block max-w-xs">
                          View posting ↗
                        </a>
                      }
                    />
                  )}
                  {app.company_url && (
                    <Detail
                      label="Company URL"
                      value={
                        <a href={app.company_url} target="_blank" rel="noopener noreferrer" className="text-[#0FA878] hover:underline truncate block max-w-xs">
                          Visit company ↗
                        </a>
                      }
                    />
                  )}
                </dl>
                {app.notes && (
                  <div className="mt-4 pt-4 border-t border-[rgba(26,101,90,0.15)]">
                    <p className="text-xs font-medium text-[#4A8C7E] uppercase tracking-wide mb-1">Notes</p>
                    <p className="text-sm text-[#1A2520] whitespace-pre-wrap">{app.notes}</p>
                  </div>
                )}
              </>
            )}
          </section>

          {/* Status history timeline */}
          <section className="bg-white rounded-xl border border-[rgba(26,101,90,0.15)] p-6">
            <h2 className="font-semibold text-[#1A2520] mb-6">Status History</h2>
            <ol className="relative border-l border-[rgba(26,101,90,0.15)] space-y-6 ml-2">
              {app.status_history.map((entry, i) => (
                <li key={entry.id} className="ml-6">
                  <span
                    className={`absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white text-xs ${
                      i === app.status_history.length - 1
                        ? 'bg-[#0FA878] text-white'
                        : 'bg-[#E6F4F1] text-[#4A8C7E]'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[entry.status]}`}>
                      {STATUS_LABELS[entry.status]}
                    </span>
                    <time className="ml-2 text-xs text-[#4A8C7E]">
                      {new Date(entry.changed_at).toLocaleString('en-AU', {
                        timeZone: 'Australia/Sydney',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                    {entry.note && (
                      <p className="mt-1 text-sm text-[#4A8C7E] italic">{entry.note}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Update status sidebar / sticky mobile bar */}
        <aside className="sticky bottom-0 z-30 bg-white border-t border-[rgba(26,101,90,0.15)] px-4 py-3 md:static md:z-auto md:bg-transparent md:border-0 md:p-0">
          <section className="md:bg-white md:rounded-xl md:border md:border-[rgba(26,101,90,0.15)] md:p-6">
            <h2 className="hidden md:block font-semibold text-[#1A2520] mb-4">Update Status</h2>
            <div className="flex gap-2 items-center md:block md:space-y-3">
              <div className="flex-1">
                <label className="hidden md:block text-xs font-medium text-[#4A8C7E] mb-1.5">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
                  className="w-full border border-[rgba(26,101,90,0.15)] rounded-lg px-3 py-2 text-sm text-[#1A2520] bg-[#E6F4F1] focus:outline-none focus:ring-2 focus:ring-[#0FA878]/30"
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="hidden md:block">
                <label className="block text-xs font-medium text-[#4A8C7E] mb-1.5">Note (optional)</label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  rows={3}
                  className="w-full border border-[rgba(26,101,90,0.15)] rounded-lg px-3 py-2 text-sm text-[#1A2520] bg-[#E6F4F1] placeholder:text-[#8AADA8] focus:outline-none focus:ring-2 focus:ring-[#0FA878]/30 resize-none"
                  placeholder="e.g. HR said they'd follow up next week"
                />
              </div>
              <button
                onClick={handleStatusUpdate}
                disabled={updating || newStatus === app.current_status}
                className="flex-shrink-0 px-4 py-2 text-sm font-medium text-white bg-[#0FA878] rounded-lg hover:bg-[#0D9068] transition-colors disabled:opacity-50 disabled:cursor-not-allowed md:w-full md:px-0"
              >
                {updating ? 'Updating...' : 'Update'}
              </button>
            </div>
          </section>
        </aside>
      </main>

      {confirmDelete && (
        <ConfirmDeleteModal
          title={app.job_title}
          subtitle={app.company}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
          loading={deleting}
        />
      )}
    </div>
  )
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-[#4A8C7E] uppercase tracking-wide">{label}</dt>
      <dd className="mt-0.5 text-[#1A2520]">{value}</dd>
    </div>
  )
}
