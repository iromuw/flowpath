import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const campaigns = await prisma.campaign.findMany({
      where: { user_id: session.user.id, is_archived: false },
      orderBy: { started_at: 'desc' },
    })
    return Response.json(campaigns)
  } catch {
    return Response.json({ error: 'Failed to fetch campaigns' }, { status: 500 })
  }
}
