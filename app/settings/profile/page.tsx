'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name ?? '')
      setEmail(session.user.email ?? '')
    }
  }, [session])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to save')
        return
      }

      await updateSession({ name: name.trim(), email: email.trim() })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError('Network error, please try again')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-lg">
      <div className="bg-white rounded-xl border border-[rgba(26,101,90,0.15)] p-6">
        <h2 className="text-sm font-semibold text-[#1A2520] mb-5">基本資訊</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#4A8C7E] mb-1.5">姓名</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-3 py-2 text-sm rounded-lg border border-[rgba(26,101,90,0.20)] bg-white text-[#1A2520] placeholder-[#8AADA8] focus:outline-none focus:border-[#0FA878] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#4A8C7E] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-3 py-2 text-sm rounded-lg border border-[rgba(26,101,90,0.20)] bg-white text-[#1A2520] placeholder-[#8AADA8] focus:outline-none focus:border-[#0FA878] transition-colors"
            />
          </div>

          {error && (
            <p className="text-xs text-[#C0392B] bg-[#F5E8E8] px-3 py-2 rounded-lg">{error}</p>
          )}
          {success && (
            <p className="text-xs text-[#0A7A56] bg-[#E6F4F1] px-3 py-2 rounded-lg">已儲存</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 text-sm font-medium text-white bg-[#0FA878] rounded-lg hover:bg-[#0D9068] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving && (
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            儲存
          </button>
        </form>
      </div>
    </div>
  )
}
