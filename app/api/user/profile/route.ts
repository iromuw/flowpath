import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { name, email } = await request.json()

    if (email && email !== session.user.email) {
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) {
        return Response.json({ error: 'Email already in use' }, { status: 409 })
      }
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
      },
      select: { id: true, name: true, email: true },
    })

    return Response.json(user)
  } catch {
    return Response.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
