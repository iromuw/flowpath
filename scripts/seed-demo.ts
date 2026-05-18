import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '..', '.env') })
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') })

import { hash } from 'bcryptjs'
import { prisma } from '../lib/prisma'
import type { ApplicationStatus, JobType, WorkMode } from '../lib/types'

const DEMO_EMAIL = 'demo@flowpath.app'
const DEMO_PASSWORD = 'demo1234'

// Platform names to seed for the demo user
const DEMO_PLATFORMS = ['Seek', 'Indeed', 'LinkedIn', 'Company Website']

const applications: Array<{
  job_title: string
  company: string
  location: string
  submitted_date: Date
  current_status: ApplicationStatus
  platformName: string
  job_type: JobType
  work_mode: WorkMode
  job_url?: string
  salary_range?: string
  notes?: string
}> = [
  {
    job_title: 'Senior Frontend Engineer',
    company: 'Atlassian',
    location: 'Sydney, NSW',
    submitted_date: new Date('2026-04-10'),
    current_status: 'FIRST_ROUND',
    platformName: 'LinkedIn',
    job_type: 'FULL_TIME',
    work_mode: 'HYBRID',
    salary_range: '$140,000 – $170,000',
    notes: 'Recruiter reached out. Interview with hiring manager scheduled.',
  },
  {
    job_title: 'Full Stack Developer',
    company: 'Canva',
    location: 'Sydney, NSW',
    submitted_date: new Date('2026-04-08'),
    current_status: 'SUBMITTED',
    platformName: 'Company Website',
    job_type: 'FULL_TIME',
    work_mode: 'HYBRID',
    salary_range: '$130,000 – $160,000',
  },
  {
    job_title: 'Software Engineer – Platform',
    company: 'Afterpay',
    location: 'Melbourne, VIC',
    submitted_date: new Date('2026-04-05'),
    current_status: 'SECOND_ROUND',
    platformName: 'Seek',
    job_type: 'FULL_TIME',
    work_mode: 'HYBRID',
    salary_range: '$125,000 – $150,000',
    notes: 'Take-home challenge submitted. Waiting on technical interview invite.',
  },
  {
    job_title: 'React Developer',
    company: 'REA Group',
    location: 'Melbourne, VIC',
    submitted_date: new Date('2026-03-28'),
    current_status: 'NO_REPLY',
    platformName: 'Seek',
    job_type: 'FULL_TIME',
    work_mode: 'HYBRID',
  },
  {
    job_title: 'Frontend Engineer',
    company: 'SafetyCulture',
    location: 'Sydney, NSW',
    submitted_date: new Date('2026-03-20'),
    current_status: 'UNSUCCESSFUL',
    platformName: 'LinkedIn',
    job_type: 'FULL_TIME',
    work_mode: 'ONSITE',
    notes: 'Reached final round but role was filled internally.',
  },
  {
    job_title: 'TypeScript Engineer',
    company: 'Buildkite',
    location: 'Remote',
    submitted_date: new Date('2026-04-12'),
    current_status: 'APPLICATION_VIEWED',
    platformName: 'Company Website',
    job_type: 'FULL_TIME',
    work_mode: 'REMOTE',
    salary_range: '$120,000 – $145,000',
  },
  {
    job_title: 'Software Engineer',
    company: 'Culture Amp',
    location: 'Melbourne, VIC',
    submitted_date: new Date('2026-04-01'),
    current_status: 'OFFER',
    platformName: 'LinkedIn',
    job_type: 'FULL_TIME',
    work_mode: 'HYBRID',
    salary_range: '$135,000 – $155,000',
    notes: 'Offer received. Negotiating package.',
  },
  {
    job_title: 'Mid-Level Frontend Developer',
    company: 'MYOB',
    location: 'Brisbane, QLD',
    submitted_date: new Date('2026-03-15'),
    current_status: 'NO_REPLY',
    platformName: 'Indeed',
    job_type: 'FULL_TIME',
    work_mode: 'HYBRID',
  },
  {
    job_title: 'UI Engineer',
    company: 'Xero',
    location: 'Auckland, NZ',
    submitted_date: new Date('2026-04-14'),
    current_status: 'SUBMITTED',
    platformName: 'Seek',
    job_type: 'FULL_TIME',
    work_mode: 'HYBRID',
    salary_range: 'NZD $115,000 – $135,000',
  },
  {
    job_title: 'Contract React Developer',
    company: 'Deloitte Digital',
    location: 'Sydney, NSW',
    submitted_date: new Date('2026-03-25'),
    current_status: 'WITHDRAWN',
    platformName: 'LinkedIn',
    job_type: 'CONTRACT',
    work_mode: 'ONSITE',
    notes: 'Withdrew after accepting other offer.',
  },
]

async function main() {
  console.log('Seeding demo account…\n')

  const passwordHash = await hash(DEMO_PASSWORD, 12)

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { password: passwordHash },
    create: {
      email: DEMO_EMAIL,
      password: passwordHash,
      name: 'Demo User',
    },
  })

  console.log(`✓ User: ${user.email} (id: ${user.id})`)

  // Ensure demo platforms exist
  for (const name of DEMO_PLATFORMS) {
    await prisma.jobPlatform.upsert({
      where: { user_id_name: { user_id: user.id, name } },
      update: {},
      create: { user_id: user.id, name },
    })
  }

  // Build name → id map
  const platformRecords = await prisma.jobPlatform.findMany({ where: { user_id: user.id } })
  const platformMap: Record<string, string> = {}
  for (const p of platformRecords) platformMap[p.name] = p.id

  console.log(`✓ Platforms: ${Object.keys(platformMap).join(', ')}`)

  // Remove existing demo applications before reseeding
  await prisma.application.deleteMany({ where: { user_id: user.id } })

  let succeeded = 0
  let failed = 0

  for (const app of applications) {
    try {
      await prisma.application.create({
        data: {
          user_id: user.id,
          job_title: app.job_title,
          company: app.company,
          location: app.location,
          submitted_date: app.submitted_date,
          current_status: app.current_status,
          platform_id: platformMap[app.platformName] ?? null,
          job_type: app.job_type,
          work_mode: app.work_mode,
          job_url: app.job_url ?? null,
          salary_range: app.salary_range ?? null,
          notes: app.notes ?? null,
          status_history: {
            create: {
              status: app.current_status,
              changed_at: app.submitted_date,
            },
          },
        },
      })
      console.log(`  ✓ ${app.job_title} @ ${app.company} [${app.current_status}]`)
      succeeded++
    } catch (err) {
      console.error(`  ✗ ${app.job_title} @ ${app.company}: ${err instanceof Error ? err.message.split('\n')[0] : String(err)}`)
      failed++
    }
  }

  console.log(`\nDone. ${succeeded} applications seeded, ${failed} failed.`)
  console.log(`\nLogin with: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`)

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
