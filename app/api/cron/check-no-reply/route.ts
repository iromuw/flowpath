import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApplicationStatus } from '@/lib/types'

const PENDING_STATUSES: ApplicationStatus[] = [
  'SUBMITTED',
  'APPLICATION_VIEWED',
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

    const stale = await prisma.application.findMany({
      where: {
        current_status: { in: PENDING_STATUSES },
        status_history: { none: { changed_at: { gte: cutoff } } },
      },
      select: { id: true },
    })

    if (stale.length === 0) {
      return Response.json({ updated: 0 })
    }

    const ids = stale.map((a) => a.id)

    await prisma.$transaction([
      prisma.statusHistory.createMany({
        data: ids.map((id) => ({
          application_id: id,
          status: 'NO_REPLY' as ApplicationStatus,
          note: `Auto-marked: no response for ${NO_REPLY_THRESHOLD_DAYS}+ days`,
        })),
      }),
      prisma.application.updateMany({
        where: { id: { in: ids } },
        data: { current_status: 'NO_REPLY' },
      }),
    ])

    console.log(`[check-no-reply] Updated ${ids.length} application(s) to NO_REPLY:`, ids)

    return Response.json({ updated: ids.length, ids })
  } catch (error) {
    console.error('[check-no-reply]', error)
    return Response.json({ error: 'Failed to update applications' }, { status: 500 })
  }
}
