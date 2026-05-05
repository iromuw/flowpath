import { ApplicationDetail } from './ApplicationDetail'

export default async function ApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ApplicationDetail id={id} />
}
