import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const savedJobs = await prisma.savedJob.findMany({
      where: { user_id: session.user.id },
      include: { platform: true },
      orderBy: { created_at: 'desc' },
    })
    return Response.json(savedJobs)
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Failed to fetch saved jobs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { job_title, company, location, platform_id, job_url, company_url, salary_range, job_type, work_mode, notes } =
      body

    const savedJob = await prisma.savedJob.create({
      data: {
        user_id: session.user.id,
        job_title,
        company,
        location,
        platform_id: platform_id || null,
        job_url,
        company_url,
        salary_range,
        job_type,
        work_mode,
        notes,
      },
      include: { platform: true },
    })

    return Response.json(savedJob, { status: 201 })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Failed to save job' }, { status: 500 })
  }
}
