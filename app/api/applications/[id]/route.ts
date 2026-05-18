import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<'/api/applications/[id]'>
) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  try {
    const application = await prisma.application.findUnique({
      where: { id, user_id: session.user.id },
      include: {
        platform: true,
        status_history: { orderBy: { changed_at: 'asc' } },
      },
    })
    if (!application) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }
    return Response.json(application)
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Failed to fetch application' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<'/api/applications/[id]'>
) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  try {
    const body = await request.json()
    const { current_status, status_note, platform_id, submitted_date, ...rest } = body

    const existing = await prisma.application.findUnique({
      where: { id, user_id: session.user.id },
    })
    if (!existing) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    const statusChanged = current_status && current_status !== existing.current_status

    const application = await prisma.application.update({
      where: { id },
      data: {
        ...rest,
        ...(platform_id !== undefined && { platform_id: platform_id || null }),
        ...(current_status && { current_status }),
        ...(submitted_date && { submitted_date: new Date(submitted_date) }),
        ...(statusChanged && {
          status_history: {
            create: {
              status: current_status,
              note: status_note,
            },
          },
        }),
      },
      include: {
        platform: true,
        status_history: { orderBy: { changed_at: 'asc' } },
      },
    })

    return Response.json(application)
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Failed to update application' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<'/api/applications/[id]'>
) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  try {
    const existing = await prisma.application.findUnique({
      where: { id, user_id: session.user.id },
    })
    if (!existing) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    await prisma.application.delete({ where: { id } })
    return new Response(null, { status: 204 })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Failed to delete application' }, { status: 500 })
  }
}
