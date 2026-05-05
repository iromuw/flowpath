import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const applications = await prisma.application.findMany({
      include: {
        status_history: {
          orderBy: { changed_at: 'desc' },
          take: 1,
        },
      },
      orderBy: { created_at: 'desc' },
    })
    return Response.json(applications)
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Failed to fetch applications' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      job_title,
      company,
      location,
      submitted_date,
      platform,
      job_url,
      company_url,
      salary_range,
      job_type,
      work_mode,
      notes,
    } = body

    const application = await prisma.application.create({
      data: {
        job_title,
        company,
        location,
        submitted_date: new Date(submitted_date),
        current_status: 'SUBMITTED',
        platform,
        job_url,
        company_url,
        salary_range,
        job_type,
        work_mode,
        notes,
        status_history: {
          create: {
            status: 'SUBMITTED',
          },
        },
      },
      include: { status_history: true },
    })

    return Response.json(application, { status: 201 })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Failed to create application' }, { status: 500 })
  }
}
