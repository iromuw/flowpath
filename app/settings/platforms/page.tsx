'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2 } from 'lucide-react'

interface JobPlatform {
  id: string
  name: string
  is_active: boolean
  created_at: string
}

export default function PlatformsPage() {
  const [platforms, setPlatforms] = useState<JobPlatform[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchPlatforms = useCallback(async () => {
    try {
      const res = await fetch('/api/platforms')
      if (res.ok) setPlatforms(await res.json())
    } catch {
      // leave existing state intact
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPlatforms()
  }, [fetchPlatforms])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = newName.trim()
    if (!trimmed) return

    setAdding(true)
    setAddError(null)

    try {
      const res = await fetch('/api/platforms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      })

      if (!res.ok) {
        const data = await res.json()
        setAddError(data.error ?? 'Failed to add platform')
        return
      }

      const created: JobPlatform = await res.json()
      setPlatforms((prev) => [...prev, created])
      setNewName('')
    } catch {
      setAddError('Network error, please try again')
    } finally {
      setAdding(false)
    }
  }

  async function handleToggle(platform: JobPlatform) {
    setTogglingId(platform.id)
    try {
      const res = await fetch(`/api/platforms/${platform.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !platform.is_active }),
      })
      if (res.ok) {
        const updated: JobPlatform = await res.json()
        setPlatforms((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      }
    } catch {
      // silently fail; state unchanged
    } finally {
      setTogglingId(null)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/platforms/${id}`, { method: 'DELETE' })
      if (res.ok || res.status === 204) {
        setPlatforms((prev) => prev.filter((p) => p.id !== id))
      }
    } catch {
      // silently fail
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Add platform */}
      <div className="bg-white rounded-xl border border-[rgba(26,101,90,0.15)] p-6">
        <h2 className="text-sm font-semibold text-[#1A2520] mb-4">Add platform</h2>
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value)
              setAddError(null)
            }}
            placeholder="e.g. LinkedIn, Indeed"
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-[rgba(26,101,90,0.20)] bg-white text-[#1A2520] placeholder-[#8AADA8] focus:outline-none focus:border-[#0FA878] transition-colors"
          />
          <button
            type="submit"
            disabled={adding || !newName.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-[#0FA878] rounded-lg hover:bg-[#0D9068] transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
          >
            {adding ? (
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Plus size={14} />
            )}
            Add
          </button>
        </form>
        {addError && (
          <p className="mt-2 text-xs text-[#C0392B] bg-[#F5E8E8] px-3 py-2 rounded-lg">
            {addError}
          </p>
        )}
      </div>

      {/* Platform list */}
      <div className="bg-white rounded-xl border border-[rgba(26,101,90,0.15)]">
        <div className="px-6 py-4 border-b border-[rgba(26,101,90,0.10)]">
          <h2 className="text-sm font-semibold text-[#1A2520]">
            My platforms
            {!loading && (
              <span className="ml-2 text-xs font-normal text-[#4A8C7E]">
                {platforms.length}
              </span>
            )}
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-[rgba(26,101,90,0.15)] border-t-[#4A8C7E] rounded-full animate-spin" />
          </div>
        ) : platforms.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-[#8AADA8]">
            No platforms added yet
          </div>
        ) : (
          <ul className="divide-y divide-[rgba(26,101,90,0.08)]">
            {platforms.map((platform) => (
              <li key={platform.id} className="flex items-center gap-3 px-6 py-3.5">
                {/* Toggle switch */}
                <button
                  onClick={() => handleToggle(platform)}
                  disabled={togglingId === platform.id}
                  title={platform.is_active ? 'Disable' : 'Enable'}
                  className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 focus:outline-none disabled:opacity-60 cursor-pointer ${
                    platform.is_active ? 'bg-[#0FA878]' : 'bg-[#D1D5DB]'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      platform.is_active ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>

                <span
                  className={`flex-1 text-sm ${
                    platform.is_active ? 'text-[#1A2520]' : 'text-[#8AADA8]'
                  }`}
                >
                  {platform.name}
                </span>

                {!platform.is_active && (
                  <span className="text-[10px] text-[#8AADA8] bg-[#F1F3F4] px-2 py-0.5 rounded">
                    Disabled
                  </span>
                )}

                {/* Delete */}
                <button
                  onClick={() => handleDelete(platform.id)}
                  disabled={deletingId === platform.id}
                  title="Delete"
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-[#8AADA8] hover:text-[#C0392B] hover:bg-[#F5E8E8] transition-colors disabled:opacity-40 cursor-pointer"
                >
                  {deletingId === platform.id ? (
                    <span className="w-3 h-3 border-2 border-[#8AADA8]/40 border-t-[#8AADA8] rounded-full animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
