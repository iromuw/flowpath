'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function RegisterPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirm = formData.get('confirm') as string

    if (password !== confirm) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Something went wrong')
      setLoading(false)
      return
    }

    // Auto sign-in after successful registration
    const result = await signIn('credentials', { email, password, redirect: false })

    if (result?.error) {
      setError('Account created but sign-in failed. Try logging in.')
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#F5F2EE] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-[rgba(26,101,90,0.15)] p-8 w-full max-w-sm shadow-sm">
        <div className="flex justify-center mb-6">
          <Image src="/logo.svg" alt="Flowpath" width={40} height={40} style={{ height: '40px', width: 'auto' }} />
        </div>
        <h1 className="text-xl font-semibold text-[#1A2520] text-center mb-1">Create an account</h1>
        <p className="text-sm text-[#4A8C7E] text-center mb-7">Start tracking your job applications</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-[#1A2520] mb-1.5">
              Name <span className="text-[#8AADA8] font-normal">(optional)</span>
            </label>
            <input
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Your name"
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-[rgba(26,101,90,0.20)] bg-white text-[#1A2520] placeholder:text-[#8AADA8] focus:outline-none focus:border-[#0FA878] focus:ring-1 focus:ring-[#0FA878]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1A2520] mb-1.5">Email</label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-[rgba(26,101,90,0.20)] bg-white text-[#1A2520] placeholder:text-[#8AADA8] focus:outline-none focus:border-[#0FA878] focus:ring-1 focus:ring-[#0FA878]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1A2520] mb-1.5">Password</label>
            <input
              name="password"
              type="password"
              required
              autoComplete="new-password"
              placeholder="At least 8 characters"
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-[rgba(26,101,90,0.20)] bg-white text-[#1A2520] placeholder:text-[#8AADA8] focus:outline-none focus:border-[#0FA878] focus:ring-1 focus:ring-[#0FA878]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1A2520] mb-1.5">Confirm password</label>
            <input
              name="confirm"
              type="password"
              required
              autoComplete="new-password"
              placeholder="••••••••"
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-[rgba(26,101,90,0.20)] bg-white text-[#1A2520] placeholder:text-[#8AADA8] focus:outline-none focus:border-[#0FA878] focus:ring-1 focus:ring-[#0FA878]"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 text-center -mt-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full py-2.5 text-sm font-medium text-white bg-[#0FA878] rounded-lg hover:bg-[#0D9068] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-xs text-[#8AADA8] text-center mt-5">
          Already have an account?{' '}
          <Link href="/login" className="text-[#0FA878] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
