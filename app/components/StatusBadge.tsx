import { ApplicationStatus, STATUS_BADGE_STYLE, STATUS_LABELS } from '@/lib/types'

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span
      className={`inline-flex items-center text-[11px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${STATUS_BADGE_STYLE[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
