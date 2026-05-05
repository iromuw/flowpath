import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const savedJobs = await prisma.savedJob.findMany({
      orderBy: { created_at: 'desc' },
    })
    return Response.json(savedJobs)
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Failed to fetch saved jobs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { job_title, company, location, platform, job_url, company_url, salary_range, job_type, work_mode, notes } =
      body

    const savedJob = await prisma.savedJob.create({
      data: { job_title, company, location, platform, job_url, company_url, salary_range, job_type, work_mode, notes },
    })

    return Response.json(savedJob, { status: 201 })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Failed to save job' }, { status: 500 })
  }
}
