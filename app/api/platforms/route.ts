import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const platforms = await prisma.jobPlatform.findMany({
      where: { user_id: session.user.id },
      orderBy: { created_at: 'asc' },
    })
    return Response.json(platforms)
  } catch {
    return Response.json({ error: 'Failed to fetch platforms' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { name } = await request.json()
    if (!name?.trim()) {
      return Response.json({ error: 'Platform name is required' }, { status: 400 })
    }

    const platform = await prisma.jobPlatform.create({
      data: {
        name: name.trim(),
        user_id: session.user.id,
      },
    })
    return Response.json(platform, { status: 201 })
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    ) {
      return Response.json({ error: 'Platform name already exists' }, { status: 409 })
    }
    return Response.json({ error: 'Failed to create platform' }, { status: 500 })
  }
}
