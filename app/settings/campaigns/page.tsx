import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { CampaignsBoardClient } from './CampaignsBoardClient'
import type { Campaign } from '@/lib/types'

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const raw = await prisma.campaign.findMany({
    where: { user_id: session.user.id },
    orderBy: { started_at: 'desc' },
  })

  const campaigns: Campaign[] = raw.map((c) => ({
    id: c.id,
    name: c.name,
    started_at: c.started_at.toISOString(),
    ended_at: c.ended_at?.toISOString() ?? null,
    is_active: c.is_active,
    is_archived: c.is_archived,
    user_id: c.user_id,
    created_at: c.created_at.toISOString(),
    updated_at: c.updated_at.toISOString(),
  }))

  const params = await searchParams
  return (
    <CampaignsBoardClient
      initialCampaigns={campaigns}
      openNewModal={params.new === '1'}
    />
  )
}
