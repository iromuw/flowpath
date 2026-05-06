'use client'

import { useState } from 'react'

interface Props {
  onClose: () => void
  onCreated: () => void
}

const inputCls =
  'w-full border border-[rgba(26,101,90,0.15)] rounded-lg px-3 py-2 text-sm text-[#1A2520] bg-[#E6F4F1] placeholder:text-[#8AADA8] focus:outline-none focus:ring-2 focus:ring-[#0FA878]/30'

export function SaveJobModal({ onClose, onCreated }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const data = Object.fromEntries(new FormData(e.currentTarget))

    try {
      const res = await fetch('/api/saved-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        onCreated()
        onClose()
      } else {
        const json = await res.json()
        setError(json.error ?? 'Something went wrong.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(26,101,90,0.15)]">
          <h2 className="text-base font-semibold text-[#1A2520]">Save a job</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#E6F4F1] text-[#4A8C7E] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {error && (
            <p className="text-sm text-[#C0392B] bg-[#F5E8E8] border border-[rgba(192,57,43,0.2)] rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#4A8C7E] mb-1">Job Title *</label>
              <input name="job_title" required className={inputCls} placeholder="e.g. Software Engineer" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#4A8C7E] mb-1">Company *</label>
              <input name="company" required className={inputCls} placeholder="e.g. Atlassian" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#4A8C7E] mb-1">Location</label>
              <input name="location" className={inputCls} placeholder="e.g. Sydney, NSW" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#4A8C7E] mb-1">Salary Range</label>
              <input name="salary_range" className={inputCls} placeholder="e.g. $100k–$120k" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#4A8C7E] mb-1">Platform *</label>
              <select name="platform" required className={inputCls}>
                <option value="SEEK">Seek</option>
                <option value="INDEED">Indeed</option>
                <option value="LINKEDIN">LinkedIn</option>
                <option value="COMPANY">Company Website</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#4A8C7E] mb-1">Job Type *</label>
              <select name="job_type" required className={inputCls}>
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="CASUAL">Casual</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#4A8C7E] mb-1">Work Mode *</label>
              <select name="work_mode" required className={inputCls}>
                <option value="HYBRID">Hybrid</option>
                <option value="ONSITE">On-site</option>
                <option value="REMOTE">Remote</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#4A8C7E] mb-1">Job URL</label>
              <input name="job_url" type="url" className={inputCls} placeholder="https://..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#4A8C7E] mb-1">Company URL</label>
              <input name="company_url" type="url" className={inputCls} placeholder="https://..." />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#4A8C7E] mb-1">
              Notes / why interested
            </label>
            <textarea
              name="notes"
              rows={3}
              className={inputCls}
              placeholder="e.g. Love the product, strong brand, good culture..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-[rgba(26,101,90,0.15)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#1A6B5A] bg-transparent border border-[#1A6B5A] rounded-lg hover:bg-[#E6F4F1] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-[#0FA878] rounded-lg transition-colors hover:bg-[#0D9068] disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
