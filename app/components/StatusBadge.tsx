import { ApplicationStatus, STATUS_BADGE_STYLE, STATUS_LABELS } from '@/lib/types'

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const { bg, color } = STATUS_BADGE_STYLE[status]
  return (
    <span
      className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
      style={{ background: bg, color }}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
