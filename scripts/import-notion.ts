import * as fs from 'fs'
import * as path from 'path'
import Papa from 'papaparse'
import { prisma } from '../lib/prisma'
import type { ApplicationStatus, Platform } from '../lib/types'

function mapStatus(raw: string): ApplicationStatus {
  switch (raw.trim()) {
    case 'Application Submitted':    return 'SUBMITTED'
    case 'Application been viewed':  return 'APPLICATION_VIEWED'
    case 'Not Moving Forward':       return 'UNSUCCESSFUL'
    case 'No reply over a month':    return 'NO_REPLY'
    default:                         return 'SUBMITTED'
  }
}

function mapPlatform(raw: string): Platform {
  switch (raw.trim()) {
    case 'LinkedIn':          return 'LINKEDIN'
    case 'Indeed':            return 'INDEED'
    case 'Seek':              return 'SEEK'
    default:                  return 'COMPANY'
  }
}

// Parses DD/MM/YYYY (Notion's default date export format)
function parseDate(raw: string): Date {
  const parts = raw.trim().split('/')
  if (parts.length !== 3) throw new Error(`Unexpected date format: "${raw}"`)
  const [day, month, year] = parts.map(Number)
  const date = new Date(year, month - 1, day)
  if (isNaN(date.getTime())) throw new Error(`Invalid date: "${raw}"`)
  return date
}

async function main() {
  const csvPath = path.resolve(__dirname, '..', 'notion-import.csv')

  if (!fs.existsSync(csvPath)) {
    console.error(`CSV not found at: ${csvPath}`)
    process.exit(1)
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8')

  const { data: rows, errors } = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: true,
  })

  if (errors.length > 0) {
    console.warn(`CSV parse warnings: ${errors.map((e) => e.message).join(', ')}`)
  }

  console.log(`Found ${rows.length} rows to process.\n`)

  let succeeded = 0
  let failed = 0

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const jobTitle = row['Job Title']?.trim()
    const company = row['Company Name']?.trim()

    console.log(`Importing row ${i + 1}/${rows.length}: ${jobTitle ?? '(empty)'} @ ${company ?? '(empty)'}`)

    if (!jobTitle || !company) {
      console.warn('  Skipping: missing job_title or company')
      failed++
      continue
    }

    try {
      const submittedDate = parseDate(row['Applied'] ?? '')
      const status = mapStatus(row['Status'] ?? '')
      const platform = mapPlatform(row['Job Resource'] ?? '')
      const notes = row['備註']?.trim() || null

      await prisma.application.create({
        data: {
          job_title: jobTitle,
          company,
          location: '',
          submitted_date: submittedDate,
          current_status: status,
          platform,
          notes,
          job_type: 'FULL_TIME',
          work_mode: 'ONSITE',
          status_history: {
            create: {
              status,
              changed_at: submittedDate,
            },
          },
        },
      })

      succeeded++
    } catch (err) {
      console.error(`  Error: ${err instanceof Error ? err.message.split('\n')[0] : String(err)}`)
      failed++
    }
  }

  console.log(`\nDone. ${succeeded} succeeded, ${failed} failed.`)
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
