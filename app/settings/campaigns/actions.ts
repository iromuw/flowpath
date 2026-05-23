'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { Campaign } from '@/lib/types'

function serialize(c: {
  id: string
  name: string
  started_at: Date
  ended_at: Date | null
  is_active: boolean
  is_archived: boolean
  user_id: string
  created_at: Date
  updated_at: Date
}): Campaign {
  return {
    id: c.id,
    name: c.name,
    started_at: c.started_at.toISOString(),
    ended_at: c.ended_at?.toISOString() ?? null,
    is_active: c.is_active,
    is_archived: c.is_archived,
    user_id: c.user_id,
    created_at: c.created_at.toISOString(),
    updated_at: c.updated_at.toISOString(),
  }
}

export async function createCampaignAction(
  name: string,
): Promise<{ data?: Campaign; error?: string }> {
  const session = await getServerSession(authOptions)
  if (!session) return { error: 'Unauthorized' }

  try {
    const campaign = await prisma.campaign.create({
      data: {
        name: name.trim(),
        started_at: new Date(),
        is_active: false,
        is_archived: false,
        user_id: session.user.id,
      },
    })
    revalidatePath('/settings/campaigns')
    return { data: serialize(campaign) }
  } catch {
    return { error: 'Failed to create campaign' }
  }
}

export async function renameCampaignAction(
  id: string,
  name: string,
): Promise<{ error?: string }> {
  const session = await getServerSession(authOptions)
  if (!session) return { error: 'Unauthorized' }

  const trimmed = name.trim()
  if (!trimmed) return { error: 'Name is required' }

  try {
    await prisma.campaign.updateMany({
      where: { id, user_id: session.user.id },
      data: { name: trimmed },
    })
    revalidatePath('/settings/campaigns')
    return {}
  } catch {
    return { error: 'Failed to rename campaign' }
  }
}

export async function archiveCampaignAction(id: string): Promise<{ error?: string }> {
  const session = await getServerSession(authOptions)
  if (!session) return { error: 'Unauthorized' }

  try {
    const existing = await prisma.campaign.findFirst({
      where: { id, user_id: session.user.id },
      select: { is_active: true },
    })
    if (!existing) return { error: 'Not found' }

    await prisma.campaign.updateMany({
      where: { id, user_id: session.user.id },
      data: {
        is_archived: true,
        is_active: false,
        ...(existing.is_active ? { ended_at: new Date() } : {}),
      },
    })
    revalidatePath('/settings/campaigns')
    return {}
  } catch {
    return { error: 'Failed to archive campaign' }
  }
}

export async function restoreCampaignAction(id: string): Promise<{ error?: string }> {
  const session = await getServerSession(authOptions)
  if (!session) return { error: 'Unauthorized' }

  try {
    await prisma.campaign.updateMany({
      where: { id, user_id: session.user.id },
      data: { is_archived: false },
    })
    revalidatePath('/settings/campaigns')
    return {}
  } catch {
    return { error: 'Failed to restore campaign' }
  }
}

export async function setActiveCampaignAction(id: string): Promise<{ error?: string }> {
  const session = await getServerSession(authOptions)
  if (!session) return { error: 'Unauthorized' }

  try {
    await prisma.$transaction([
      prisma.campaign.updateMany({
        where: { user_id: session.user.id, is_active: true },
        data: { is_active: false, ended_at: new Date() },
      }),
      prisma.campaign.updateMany({
        where: { id, user_id: session.user.id },
        data: { is_active: true, ended_at: null },
      }),
    ])
    revalidatePath('/settings/campaigns')
    return {}
  } catch {
    return { error: 'Failed to activate campaign' }
  }
}

export async function deactivateCampaignAction(id: string): Promise<{ error?: string }> {
  const session = await getServerSession(authOptions)
  if (!session) return { error: 'Unauthorized' }

  try {
    await prisma.campaign.updateMany({
      where: { id, user_id: session.user.id },
      data: { is_active: false, ended_at: new Date() },
    })
    revalidatePath('/settings/campaigns')
    return {}
  } catch {
    return { error: 'Failed to deactivate campaign' }
  }
}
