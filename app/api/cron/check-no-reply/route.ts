import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApplicationStatus } from '@/lib/types'

const NO_REPLY_STATUSES: ApplicationStatus[] = ['SUBMITTED']

const UNSUCCESSFUL_STATUSES: ApplicationStatus[] = [
  'APPLICATION_VIEWED',
  'PRE_SCREENING',
  'FIRST_ROUND',
  'SECOND_ROUND',
  'FINAL_ROUND',
]

const NO_REPLY_THRESHOLD_DAYS = 30

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - NO_REPLY_THRESHOLD_DAYS)

    const staleWhere = { status_history: { none: { changed_at: { gte: cutoff } } } }

    const [noReplyStale, unsuccessfulStale] = await Promise.all([
      prisma.application.findMany({
        where: { current_status: { in: NO_REPLY_STATUSES }, ...staleWhere },
        select: { id: true },
      }),
      prisma.application.findMany({
        where: { current_status: { in: UNSUCCESSFUL_STATUSES }, ...staleWhere },
        select: { id: true },
      }),
    ])

    const noReplyIds = noReplyStale.map((a) => a.id)
    const unsuccessfulIds = unsuccessfulStale.map((a) => a.id)

    if (noReplyIds.length === 0 && unsuccessfulIds.length === 0) {
      return Response.json({ updated: 0 })
    }

    const note = `Auto-marked: no response for ${NO_REPLY_THRESHOLD_DAYS}+ days`

    await prisma.$transaction([
      ...(noReplyIds.length > 0
        ? [
            prisma.statusHistory.createMany({
              data: noReplyIds.map((id) => ({ application_id: id, status: 'NO_REPLY' as ApplicationStatus, note })),
            }),
            prisma.application.updateMany({
              where: { id: { in: noReplyIds } },
              data: { current_status: 'NO_REPLY' },
            }),
          ]
        : []),
      ...(unsuccessfulIds.length > 0
        ? [
            prisma.statusHistory.createMany({
              data: unsuccessfulIds.map((id) => ({ application_id: id, status: 'UNSUCCESSFUL' as ApplicationStatus, note })),
            }),
            prisma.application.updateMany({
              where: { id: { in: unsuccessfulIds } },
              data: { current_status: 'UNSUCCESSFUL' },
            }),
          ]
        : []),
    ])

    console.log(`[check-no-reply] Marked ${noReplyIds.length} as NO_REPLY, ${unsuccessfulIds.length} as UNSUCCESSFUL`)

    return Response.json({ updated: noReplyIds.length + unsuccessfulIds.length, noReplyIds, unsuccessfulIds })
  } catch (error) {
    console.error('[check-no-reply]', error)
    return Response.json({ error: 'Failed to update applications' }, { status: 500 })
  }
}
