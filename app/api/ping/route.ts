import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const count = await prisma.application.count()
    return Response.json({ ok: true, time: new Date().toISOString(), count })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return Response.json({ ok: false, error: message }, { status: 500 })
  }
}
