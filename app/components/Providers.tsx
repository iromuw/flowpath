'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'sonner'
import { CampaignProvider } from '@/app/contexts/CampaignContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CampaignProvider>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1A2520',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.10)',
              fontSize: '13px',
            },
          }}
        />
      </CampaignProvider>
    </SessionProvider>
  )
}
