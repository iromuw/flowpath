'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { Campaign } from '@/lib/types'

interface CampaignContextValue {
  campaigns: Campaign[]
  activeCampaign: Campaign | null
  setActiveCampaign: (campaign: Campaign) => void
  refreshCampaigns: () => Promise<void>
  isLoading: boolean
}

const CampaignContext = createContext<CampaignContextValue | null>(null)

export function CampaignProvider({ children }: { children: React.ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [activeCampaign, setActiveCampaignState] = useState<Campaign | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  async function fetchCampaigns() {
    try {
      const r = await fetch('/api/campaigns')
      const data: Campaign[] = r.ok ? await r.json() : []
      setCampaigns(data)
      const active = data.find((c) => c.is_active) ?? data[0] ?? null
      setActiveCampaignState(active)
    } catch {
      // leave existing state intact
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaigns()
  }, [])

  return (
    <CampaignContext.Provider
      value={{
        campaigns,
        activeCampaign,
        setActiveCampaign: setActiveCampaignState,
        refreshCampaigns: fetchCampaigns,
        isLoading,
      }}
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
