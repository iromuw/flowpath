interface PlatformBarProps {
  label: string
  count: number
  max: number
  colorClass: string
}

export function PlatformBar({ label, count, max, colorClass }: PlatformBarProps) {
  const pct = max > 0 ? (count / max) * 100 : 0

  return (
    <div>
      <div className="flex justify-between text-xs text-[#4A8C7E] mb-1.5">
        <span>{label}</span>
        <span className="font-medium text-[#1A2520]">{count}</span>
      </div>
      <div className="h-3 rounded-full overflow-hidden bg-[#E6F4F1]">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
