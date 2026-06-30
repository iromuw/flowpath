'use client'

import { useState } from 'react'
import { usePlatforms } from '@/app/hooks/usePlatforms'
import { useCampaign } from '@/app/contexts/CampaignContext'
import { Modal } from './Modal'

interface Props {
  onClose: () => void
  onCreated: () => void
}

const inputCls =
  'w-full border border-[rgba(26,101,90,0.15)] rounded-lg px-3 py-2 text-sm bg-[#E6F4F1] text-[#1A2520] placeholder:text-[#8AADA8] focus:outline-none focus:ring-2 focus:ring-[#0FA878]/30 focus:border-transparent'

export function AddApplicationModal({ onClose, onCreated }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { active: platforms, loading: platformsLoading } = usePlatforms()
  const { activeCampaign } = useCampaign()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const data: Record<string, string> = Object.fromEntries(
      new FormData(form) as Iterable<[string, string]>,
    )
    if (activeCampaign?.id) data.campaign_id = activeCampaign.id

    try {
      const res = await fetch('/api/applications', {
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
    <Modal
      title="New Application"
      onClose={onClose}
      maxWidth="max-w-2xl"
      scrollable
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-[#4A8C7E] hover:text-[#1A2520] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-application-form"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-[#0FA878] rounded-lg hover:bg-[#0D9068] transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
          >
            {loading && (
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            {loading ? 'Saving…' : 'Add Application'}
          </button>
        </>
      }
    >
      <form id="add-application-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-sm text-[#C0392B] bg-[#F5E8E8] border border-[rgba(192,57,43,0.2)] rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1A2520] mb-1">Job Title *</label>
            <input name="job_title" required className={inputCls} placeholder="e.g. Software Engineer" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A2520] mb-1">Company *</label>
            <input name="company" required className={inputCls} placeholder="e.g. Atlassian" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1A2520] mb-1">Location *</label>
            <input name="location" required className={inputCls} placeholder="e.g. Sydney, NSW" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A2520] mb-1">Date Applied *</label>
            <input
              name="submitted_date"
              type="date"
              required
              defaultValue={new Date().toISOString().split('T')[0]}
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1A2520] mb-1">Platform</label>
            <select name="platform_id" className={inputCls} disabled={platformsLoading}>
              <option value="">— none —</option>
              {platforms.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A2520] mb-1">Job Type *</label>
            <select name="job_type" required className={inputCls}>
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="CASUAL">Casual</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A2520] mb-1">Work Mode *</label>
            <select name="work_mode" required className={inputCls}>
              <option value="HYBRID">Hybrid</option>
              <option value="ONSITE">On-site</option>
              <option value="REMOTE">Remote</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1A2520] mb-1">Job URL</label>
            <input name="job_url" type="url" className={inputCls} placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A2520] mb-1">Company URL</label>
            <input name="company_url" type="url" className={inputCls} placeholder="https://..." />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A2520] mb-1">Salary Range</label>
          <input name="salary_range" className={inputCls} placeholder="e.g. $100k–$120k" />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A2520] mb-1">Notes</label>
          <textarea name="notes" rows={3} className={inputCls} placeholder="Any notes about this role..." />
        </div>
      </form>
    </Modal>
  )
}
