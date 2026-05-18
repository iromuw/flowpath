export async function POST() {
  return Response.json({ error: 'Registration is currently closed' }, { status: 403 })
}
