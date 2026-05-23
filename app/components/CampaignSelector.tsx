'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronUp, Check, Plus, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCampaign } from '@/app/contexts/CampaignContext'
import type { Campaign } from '@/lib/types'

function formatDateRange(campaign: Campaign): string {
  const start = new Date(campaign.started_at)
  const startMonth = start.toLocaleDateString('en-US', { month: 'short' })
  const startYear = start.getFullYear()

  if (campaign.ended_at) {
    const end = new Date(campaign.ended_at)
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' })
    const endYear = end.getFullYear()
    if (startYear === endYear) return `${startMonth} – ${endMonth} ${endYear}`
    return `${startMonth} ${startYear} – ${endMonth} ${endYear}`
  }

  return `Started ${startMonth} ${startYear}`
}

export function CampaignSelector() {
  const { campaigns, activeCampaign, setActiveCampaign } = useCampaign()
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  if (!activeCampaign) return null

  return (
    <div ref={ref} className="relative w-full flex-shrink-0 px-2">
      {/* Collapsed md view: just a status dot */}
      <div className="w-9 h-9 flex items-center justify-center lg:hidden mx-auto">
        <span className="w-2 h-2 rounded-full bg-[#0FA878]" />
      </div>

      {/* Expanded lg view: full selector button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="hidden lg:flex w-full items-center gap-2.5 px-3 py-2.5 rounded-lg bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.11)] border border-[rgba(255,255,255,0.12)] transition-colors text-left"
      >
        <span className="w-2 h-2 rounded-full bg-[#0FA878] flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider leading-none mb-0.5">
            Campaign
          </p>
          <p className="text-sm font-medium text-white truncate leading-tight">
            {activeCampaign.name}
          </p>
        </div>
        {open ? (
          <ChevronUp size={14} className="text-white/40 flex-shrink-0" />
        ) : (
          <ChevronDown size={14} className="text-white/40 flex-shrink-0" />
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="hidden lg:block absolute left-2 right-2 top-full mt-1.5 z-50 rounded-lg bg-[#1f3830] border border-[rgba(255,255,255,0.12)] shadow-2xl overflow-hidden">
          <div className="py-1">
            {campaigns.map((campaign) => {
              const isSelected = campaign.id === activeCampaign.id
              return (
                <button
                  key={campaign.id}
                  onClick={() => {
                    setActiveCampaign(campaign)
                    setOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[rgba(255,255,255,0.06)] transition-colors text-left"
                >
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      campaign.is_active ? 'bg-[#0FA878]' : 'bg-white/25'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white leading-tight">{campaign.name}</p>
                    <p className="text-xs text-white/40 leading-tight mt-0.5">
                      {formatDateRange(campaign)}
                    </p>
                  </div>
                  {isSelected && <Check size={14} className="text-[#0FA878] flex-shrink-0" />}
                </button>
              )
            })}
          </div>
          <div className="border-t border-[rgba(255,255,255,0.10)]">
            <button
              onClick={() => {
                console.log('New campaign — modal coming soon')
                setOpen(false)
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-white/50 hover:bg-[rgba(255,255,255,0.06)] hover:text-white/80 transition-colors"
            >
              <Plus size={14} className="flex-shrink-0" />
              <span className="text-sm">New campaign</span>
            </button>
            <button
              onClick={() => {
                router.push('/settings/campaigns')
                setOpen(false)
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-white/50 hover:bg-[rgba(255,255,255,0.06)] hover:text-white/80 transition-colors"
            >
              <Settings size={14} className="flex-shrink-0" />
              <span className="text-sm">Manage campaigns</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
