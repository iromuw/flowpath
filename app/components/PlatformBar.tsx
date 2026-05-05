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
      <div className="flex justify-between text-xs text-[#6e6e6a] mb-1.5">
        <span>{label}</span>
        <span className="font-medium text-[#1c1c1a]">{count}</span>
      </div>
      <div className="h-3 rounded-full overflow-hidden bg-[#f0eeeb]">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
