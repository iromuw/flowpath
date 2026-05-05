import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<'/api/applications/[id]'>
) {
  const { id } = await ctx.params
  try {
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
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
  const { id } = await ctx.params
  try {
    const body = await request.json()
    const { current_status, status_note, ...rest } = body

    const existing = await prisma.application.findUnique({ where: { id } })
    if (!existing) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    const statusChanged = current_status && current_status !== existing.current_status

    const application = await prisma.application.update({
      where: { id },
      data: {
        ...rest,
        ...(current_status && { current_status }),
        ...(rest.submitted_date && { submitted_date: new Date(rest.submitted_date) }),
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
  const { id } = await ctx.params
  try {
    await prisma.application.delete({ where: { id } })
    return new Response(null, { status: 204 })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Failed to delete application' }, { status: 500 })
  }
}
