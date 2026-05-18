import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function getOwnedPlatform(id: string, userId: string) {
  const platform = await prisma.jobPlatform.findUnique({ where: { id } })
  if (!platform || platform.user_id !== userId) return null
  return platform
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const platform = await getOwnedPlatform(id, session.user.id)
  if (!platform) return Response.json({ error: 'Not found' }, { status: 404 })

  try {
    const { is_active } = await request.json()
    const updated = await prisma.jobPlatform.update({
      where: { id },
      data: { is_active },
    })
    return Response.json(updated)
  } catch {
    return Response.json({ error: 'Failed to update platform' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const platform = await getOwnedPlatform(id, session.user.id)
  if (!platform) return Response.json({ error: 'Not found' }, { status: 404 })

  try {
    await prisma.jobPlatform.delete({ where: { id } })
    return new Response(null, { status: 204 })
  } catch {
    return Response.json({ error: 'Failed to delete platform' }, { status: 500 })
  }
}
