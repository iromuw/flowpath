'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { Campaign } from '@/lib/types'

interface CampaignContextValue {
  campaigns: Campaign[]
  activeCampaign: Campaign | null
  setActiveCampaign: (campaign: Campaign) => void
  isLoading: boolean
}

const CampaignContext = createContext<CampaignContextValue | null>(null)

export function CampaignProvider({ children }: { children: React.ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [activeCampaign, setActiveCampaignState] = useState<Campaign | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/campaigns')
      .then((r) => {
        if (!r.ok) return []
        return r.json()
      })
      .then((data: Campaign[]) => {
        setCampaigns(data)
        const active = data.find((c) => c.is_active) ?? data[0] ?? null
        setActiveCampaignState(active)
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <CampaignContext.Provider
      value={{ campaigns, activeCampaign, setActiveCampaign: setActiveCampaignState, isLoading }}
    >
      {children}
    </CampaignContext.Provider>
  )
}

export function useCampaign() {
  const ctx = useContext(CampaignContext)
  if (!ctx) throw new Error('useCampaign must be used within CampaignProvider')
  return ctx
}
