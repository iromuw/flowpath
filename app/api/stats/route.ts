import { prisma } from '@/lib/prisma'
import { ApplicationStatus } from '@/app/generated/prisma/client'

export async function GET() {
  try {
    const [total, byStatus, byPlatform] = await Promise.all([
      prisma.application.count(),
      prisma.application.groupBy({
        by: ['current_status'],
        _count: { id: true },
      }),
      prisma.application.groupBy({
        by: ['platform'],
        _count: { id: true },
      }),
    ])

    const statusCounts = Object.fromEntries(
      Object.values(ApplicationStatus).map((s) => [s, 0])
    ) as Record<ApplicationStatus, number>

    for (const row of byStatus) {
      statusCounts[row.current_status] = row._count.id
    }

    const platformCounts: Record<string, number> = {}
    for (const row of byPlatform) {
      platformCounts[row.platform] = row._count.id
    }

    return Response.json({ total, byStatus: statusCounts, byPlatform: platformCounts })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
