'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await signIn('credentials', {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('Invalid email or password')
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
        <h1 className="text-xl font-semibold text-[#1A2520] text-center mb-1">Sign in to Flowpath</h1>
        <p className="text-sm text-[#4A8C7E] text-center mb-7">Track your job applications</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-[#1A2520] mb-1.5">Email</label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="demo@flowpath.app"
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-[rgba(26,101,90,0.15)] bg-[#E6F4F1] text-[#1A2520] placeholder:text-[#8AADA8] focus:outline-none focus:ring-2 focus:ring-[#0FA878]/30 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1A2520] mb-1.5">Password</label>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="demo1234"
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-[rgba(26,101,90,0.15)] bg-[#E6F4F1] text-[#1A2520] placeholder:text-[#8AADA8] focus:outline-none focus:ring-2 focus:ring-[#0FA878]/30 focus:border-transparent"
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
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

      </div>
    </div>
  )
}
