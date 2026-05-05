'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Application,
  ApplicationStatus,
  STATUS_LABELS,
  STATUS_COLORS,
  PLATFORM_LABELS,
  JOB_TYPE_LABELS,
  WORK_MODE_LABELS,
  ALL_STATUSES,
} from '@/lib/types'
import { StatusBadge } from '@/app/components/StatusBadge'

export function ApplicationDetail({ id }: { id: string }) {
  const [app, setApp] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('SUBMITTED')
  const [statusNote, setStatusNote] = useState('')
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
    if (!confirm('Delete this application?')) return
    try {
      const res = await fetch(`/api/applications/${id}`, { method: 'DELETE' })
      if (res.ok) router.push('/')
    } catch {
      // network error — stay on page
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Application not found.</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Back to dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{app.job_title}</h1>
              <p className="text-gray-500 mt-0.5">
                {app.company} · {app.location}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={app.current_status} />
              <button
                onClick={handleDelete}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete application"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Application details */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Details</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <Detail label="Platform" value={PLATFORM_LABELS[app.platform]} />
              <Detail label="Job Type" value={JOB_TYPE_LABELS[app.job_type]} />
              <Detail label="Work Mode" value={WORK_MODE_LABELS[app.work_mode]} />
              <Detail
                label="Applied On"
                value={new Date(app.submitted_date).toLocaleDateString('en-AU', {
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
                    <a href={app.job_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate block max-w-xs">
                      View posting ↗
                    </a>
                  }
                />
              )}
              {app.company_url && (
                <Detail
                  label="Company URL"
                  value={
                    <a href={app.company_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate block max-w-xs">
                      Visit company ↗
                    </a>
                  }
                />
              )}
            </dl>
            {app.notes && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Notes</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{app.notes}</p>
              </div>
            )}
          </section>

          {/* Status history timeline */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-6">Status History</h2>
            <ol className="relative border-l border-gray-200 space-y-6 ml-2">
              {app.status_history.map((entry, i) => (
                <li key={entry.id} className="ml-6">
                  <span className={`absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white text-xs ${i === app.status_history.length - 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {i + 1}
                  </span>
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[entry.status]}`}>
                      {STATUS_LABELS[entry.status]}
                    </span>
                    <time className="ml-2 text-xs text-gray-500">
                      {new Date(entry.changed_at).toLocaleString('en-AU', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                    {entry.note && (
                      <p className="mt-1 text-sm text-gray-600 italic">{entry.note}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Update status sidebar */}
        <aside className="space-y-4">
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Update Status</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Note (optional)</label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="e.g. HR said they'd follow up next week"
                />
              </div>
              <button
                onClick={handleStatusUpdate}
                disabled={updating || newStatus === app.current_status}
                className="w-full py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </section>
        </aside>
      </main>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className="mt-0.5 text-gray-900">{value}</dd>
    </div>
  )
}
