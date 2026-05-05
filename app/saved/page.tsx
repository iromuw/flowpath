'use client'

import { useState, useEffect, useCallback } from 'react'
import { SavedJob } from '@/lib/types'
import { PageShell } from '@/app/components/PageShell'
import { SaveJobModal } from './SaveJobModal'

function SavedJobCard({ job }: { job: SavedJob }) {
  return (
    <div className="bg-white rounded-xl border border-[#e8e6e1] p-4 hover:border-[#c8c6c0] transition-colors">
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="text-sm font-medium text-[#1c1c1a] leading-snug">{job.job_title}</h3>
      </div>
      <p className="text-xs text-[#6e6e6a]">
        {job.company}
        {job.location ? ` · ${job.location}` : ''}
      </p>
      {job.salary_range && (
        <p className="text-xs text-[#6e6e6a] mt-1">{job.salary_range}</p>
      )}
      {job.notes && (
        <p className="text-xs text-[#6e6e6a] mt-2 line-clamp-2">{job.notes}</p>
      )}
      <p className="text-[10px] text-[#b0aea8] mt-3">
        Saved {new Date(job.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
      </p>
    </div>
  )
}

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/saved-jobs')
      const data = await res.json()
      setSavedJobs(data)
    } catch {
      // leave state intact on error
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  return (
    <PageShell>
      {/* Topbar */}
      <div className="bg-white border-b border-[#e8e6e1] px-6 py-3.5 flex items-center justify-between flex-shrink-0">
        <span className="text-base font-medium text-[#1c1c1a]">Saved Jobs</span>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#1a1a2e] rounded-lg transition-opacity hover:opacity-90"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v10M2 7h10" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Save job
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-7 h-7 border-2 border-[#e8e6e1] border-t-[#6e6e6a] rounded-full animate-spin" />
          </div>
        ) : savedJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#f0eeeb] flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path
                  d="M5 3h12a1 1 0 0 1 1 1v15l-7-4-7 4V4a1 1 0 0 1 1-1z"
                  stroke="#6e6e6a"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-[#1c1c1a]">No saved jobs yet</p>
              <p className="text-xs text-[#6e6e6a] mt-1">
                You&apos;ll be able to save jobs here before applying.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="mt-1 px-4 py-2 text-sm font-medium text-white bg-[#1a1a2e] rounded-lg transition-opacity hover:opacity-90"
            >
              + Save job
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {savedJobs.map((job) => (
              <SavedJobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <SaveJobModal onClose={() => setShowModal(false)} onCreated={fetchJobs} />
      )}
    </PageShell>
  )
}
