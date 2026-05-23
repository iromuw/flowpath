import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '..', '.env') })
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') })

import { prisma } from '../lib/prisma'

async function main() {
  console.log('Seeding campaigns for existing users…\n')

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      applications: {
        select: { id: true, submitted_date: true },
        orderBy: { submitted_date: 'asc' },
        take: 1,
      },
    },
  })

  let created = 0
  let skipped = 0

  for (const user of users) {
    const existing = await prisma.campaign.findFirst({ where: { user_id: user.id } })
    if (existing) {
      console.log(`  – ${user.email}: already has a campaign, skipping`)
      skipped++
      continue
    }

    const earliestApp = user.applications[0]
    const startedAt = earliestApp?.submitted_date ?? new Date()

    const campaign = await prisma.campaign.create({
      data: {
        name: 'My first job search',
        started_at: startedAt,
        is_active: true,
        is_archived: false,
        user_id: user.id,
      },
    })

    await prisma.application.updateMany({
      where: { user_id: user.id, campaign_id: null },
      data: { campaign_id: campaign.id },
    })

    const linked = await prisma.application.count({ where: { campaign_id: campaign.id } })
    console.log(`  ✓ ${user.email}: campaign created (startedAt: ${startedAt.toISOString().slice(0, 10)}), ${linked} applications linked`)
    created++
  }

  console.log(`\nDone. ${created} campaigns created, ${skipped} users skipped.`)
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
