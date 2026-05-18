import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '..', '.env') })
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') })

import * as fs from 'fs'
import Papa from 'papaparse'
import { prisma } from '../lib/prisma'
import type { ApplicationStatus, JobType, WorkMode } from '../lib/types'

const TARGET_USER_EMAIL = process.env.TARGET_USER_EMAIL
if (!TARGET_USER_EMAIL) {
  console.error('ERROR: TARGET_USER_EMAIL env variable is required.')
  console.error('Usage: TARGET_USER_EMAIL=you@example.com npm run import:csv')
  process.exit(1)
}

const CSV_PATH = path.resolve(__dirname, '..', 'applications-export.csv')

async function main() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`CSV not found at: ${CSV_PATH}`)
    process.exit(1)
  }

  const user = await prisma.user.findUnique({ where: { email: TARGET_USER_EMAIL! } })
  if (!user) {
    console.error(`No user found with email: ${TARGET_USER_EMAIL}`)
    console.error('Run the seed script first or create the account manually.')
    process.exit(1)
  }

  console.log(`Importing into account: ${user.email} (id: ${user.id})\n`)

  // Build platform name → id map for this user
  const userPlatforms = await prisma.jobPlatform.findMany({ where: { user_id: user.id } })
  const platformMap: Record<string, string> = {}
  for (const p of userPlatforms) platformMap[p.name.toLowerCase()] = p.id

  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8')
  const { data: rows, errors } = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: true,
  })

  if (errors.length > 0) {
    console.warn(`CSV parse warnings: ${errors.map((e) => e.message).join(', ')}`)
  }

  console.log(`Found ${rows.length} rows.\n`)

  let succeeded = 0
  let failed = 0
  let skipped = 0

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const jobTitle = row['job_title']?.trim()
    const company = row['company']?.trim()

    console.log(`Row ${i + 1}/${rows.length}: ${jobTitle ?? '(empty)'} @ ${company ?? '(empty)'}`)

    if (!jobTitle || !company) {
      console.log('  Skipped: missing job_title or company')
      skipped++
      continue
    }

    try {
      const submittedDate = row['submitted_date']
        ? new Date(row['submitted_date'])
        : new Date()
      const status = (row['current_status'] as ApplicationStatus) || 'SUBMITTED'
      const platformName = row['platform']?.trim().toLowerCase()
      const platformId = platformName ? (platformMap[platformName] ?? null) : null
      const jobType = (row['job_type'] as JobType) || 'FULL_TIME'
      const workMode = (row['work_mode'] as WorkMode) || 'ONSITE'

      await prisma.application.create({
        data: {
          user_id: user.id,
          job_title: jobTitle,
          company,
          location: row['location']?.trim() || '',
          submitted_date: submittedDate,
          current_status: status,
          platform_id: platformId,
          job_type: jobType,
          work_mode: workMode,
          job_url: row['job_url']?.trim() || null,
          company_url: row['company_url']?.trim() || null,
          salary_range: row['salary_range']?.trim() || null,
          notes: row['notes']?.trim() || null,
          status_history: {
            create: {
              status,
              changed_at: submittedDate,
            },
          },
        },
      })
      console.log(`  ✓ Imported`)
      succeeded++
    } catch (err) {
      console.error(`  ✗ Error: ${err instanceof Error ? err.message.split('\n')[0] : String(err)}`)
      failed++
    }
  }

  console.log(`\nDone. ${succeeded} imported, ${skipped} skipped, ${failed} failed.`)
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
