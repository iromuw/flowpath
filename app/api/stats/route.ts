import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ApplicationStatus } from '@/app/generated/prisma/client'

function getWeekStart(date: Date): string {
  const d = new Date(date)
  const day = d.getUTCDay()
  const diffToMonday = day === 0 ? -6 : 1 - day
  d.setUTCDate(d.getUTCDate() + diffToMonday)
  d.setUTCHours(0, 0, 0, 0)
  return d.toISOString().split('T')[0]
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id
  const campaignId = request.nextUrl.searchParams.get('campaignId')
  const baseWhere = { user_id: userId, ...(campaignId ? { campaign_id: campaignId } : {}) }

  try {
    const now = new Date()
    const currentMonday = new Date(now)
    const day = currentMonday.getUTCDay()
    currentMonday.setUTCDate(currentMonday.getUTCDate() + (day === 0 ? -6 : 1 - day))
    currentMonday.setUTCHours(0, 0, 0, 0)

    const twelveWeeksAgo = new Date(currentMonday)
    twelveWeeksAgo.setUTCDate(twelveWeeksAgo.getUTCDate() - 11 * 7)

    const interviewStatuses = [
      ApplicationStatus.FIRST_ROUND,
      ApplicationStatus.SECOND_ROUND,
      ApplicationStatus.FINAL_ROUND,
      ApplicationStatus.OFFER,
    ]

    const [
      total,
      byStatus,
      byPlatformId,
      recentApps,
      appsForAvg,
      companyGroups,
      platformStatusGroups,
      everInterviewed,
      platformInterviewGroups,
      noReplyOver30,
      userPlatforms,
    ] = await Promise.all([
      prisma.application.count({ where: baseWhere }),
      prisma.application.groupBy({
        by: ['current_status'],
        _count: { id: true },
        where: baseWhere,
      }),
      prisma.application.groupBy({
        by: ['platform_id'],
        _count: { id: true },
        where: baseWhere,
      }),
      prisma.application.findMany({
        where: { ...baseWhere, submitted_date: { gte: twelveWeeksAgo } },
        select: { submitted_date: true },
      }),
      prisma.application.findMany({
        where: {
          ...baseWhere,
          status_history: { some: { status: { not: ApplicationStatus.SUBMITTED } } },
        },
        select: {
          submitted_date: true,
          status_history: {
            where: { status: { not: ApplicationStatus.SUBMITTED } },
            orderBy: { changed_at: 'asc' },
            take: 1,
            select: { changed_at: true },
          },
        },
      }),
      prisma.application.groupBy({
        by: ['company'],
        _count: { id: true },
        where: baseWhere,
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
      prisma.application.groupBy({
        by: ['platform_id', 'current_status'],
        _count: { id: true },
        where: baseWhere,
      }),
      prisma.application.count({
        where: {
          ...baseWhere,
          status_history: { some: { status: { in: interviewStatuses } } },
        },
      }),
      prisma.application.groupBy({
        by: ['platform_id'],
        _count: { id: true },
        where: {
          ...baseWhere,
          status_history: { some: { status: { in: interviewStatuses } } },
        },
      }),
      prisma.application.count({
        where: {
          ...baseWhere,
          current_status: ApplicationStatus.NO_REPLY,
          submitted_date: { lt: new Date(Date.now() - 30 * 86_400_000) },
        },
      }),
      prisma.jobPlatform.findMany({
        where: { user_id: userId },
        select: { id: true, name: true },
      }),
    ])

    // Build platform id -> name lookup
    const platformNameMap: Record<string, string> = {}
    for (const p of userPlatforms) platformNameMap[p.id] = p.name

    // Status counts
    const statusCounts = Object.fromEntries(
      Object.values(ApplicationStatus).map((s) => [s, 0])
    ) as Record<ApplicationStatus, number>
    for (const row of byStatus) statusCounts[row.current_status] = row._count.id

    // Platform counts keyed by platform name (skip nulls)
    const byPlatform: Record<string, number> = {}
    for (const row of byPlatformId) {
      if (!row.platform_id) continue
      const name = platformNameMap[row.platform_id]
      if (name) byPlatform[name] = row._count.id
    }

    // Weekly applications (12 weeks)
    const weekStarts: string[] = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(currentMonday)
      d.setUTCDate(d.getUTCDate() - i * 7)
      weekStarts.push(d.toISOString().split('T')[0])
    }
    const weekCounts: Record<string, number> = Object.fromEntries(weekStarts.map((w) => [w, 0]))
    for (const app of recentApps) {
      const key = getWeekStart(new Date(app.submitted_date))
      if (key in weekCounts) weekCounts[key]++
    }
    const weeklyApplications = weekStarts.map((week) => ({ week, count: weekCounts[week] }))

    // Avg days to first response
    let totalDays = 0
    let countWithResponse = 0
    for (const app of appsForAvg) {
      if (app.status_history.length > 0) {
        const days =
          (app.status_history[0].changed_at.getTime() - app.submitted_date.getTime()) / 86_400_000
        if (days >= 0) { totalDays += days; countWithResponse++ }
      }
    }
    const avgDaysToResponse = countWithResponse > 0 ? Math.round(totalDays / countWithResponse) : 0

    // Summary rates
    const noReplyCount = statusCounts[ApplicationStatus.NO_REPLY] ?? 0
    const submittedCount = statusCounts[ApplicationStatus.SUBMITTED] ?? 0
    const offerCount = statusCounts[ApplicationStatus.OFFER] ?? 0

    const responseRate =
      total > 0 ? Math.round(((total - noReplyCount - submittedCount) / total) * 100) : 0
    const interviewConversionRate = total > 0 ? Math.round((everInterviewed / total) * 100) : 0
    const offerRate = total > 0 ? Math.round((offerCount / total) * 100) : 0

    // Top companies
    const topCompanies = companyGroups.map((row) => ({ company: row.company, count: row._count.id }))

    // Platform performance
    const platformStatusMap: Record<string, Record<string, number>> = {}
    for (const row of platformStatusGroups) {
      const pid = row.platform_id ?? '__unknown__'
      if (!platformStatusMap[pid]) platformStatusMap[pid] = {}
      platformStatusMap[pid][row.current_status] = row._count.id
    }

    const platformInterviewCount: Record<string, number> = {}
    for (const row of platformInterviewGroups) {
      platformInterviewCount[row.platform_id ?? '__unknown__'] = row._count.id
    }

    const platformPerformance = Object.entries(platformStatusMap)
      .filter(([pid]) => pid !== '__unknown__')
      .map(([platform_id, statuses]) => {
        const platformTotal = Object.values(statuses).reduce((a, b) => a + b, 0)
        const interviews = platformInterviewCount[platform_id] ?? 0
        const offers = statuses[ApplicationStatus.OFFER] ?? 0
        const noReply = statuses[ApplicationStatus.NO_REPLY] ?? 0
        const submitted = statuses[ApplicationStatus.SUBMITTED] ?? 0
        const replied = platformTotal - noReply - submitted
        const platformResponseRate =
          platformTotal > 0 ? Math.round((replied / platformTotal) * 100) : 0
        return {
          platform_id,
          label: platformNameMap[platform_id] ?? 'Unknown',
          total: platformTotal,
          interviews,
          offers,
          responseRate: platformResponseRate,
        }
      })
      .sort((a, b) => b.total - a.total)

    return Response.json({
      total,
      byStatus: statusCounts,
      byPlatform,
      weeklyApplications,
      avgDaysToResponse,
      responseRate,
      interviewConversionRate,
      offerRate,
      noReplyOver30,
      platformPerformance,
      topCompanies,
    })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
