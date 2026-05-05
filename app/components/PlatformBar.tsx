interface PlatformBarProps {
  label: string
  count: number
  max: number
  color: string
}

export function PlatformBar({ label, count, max, color }: PlatformBarProps) {
  const pct = max > 0 ? (count / max) * 100 : 0

  return (
    <div>
      <div className="flex justify-between text-xs text-[#6e6e6a] mb-1">
        <span>{label}</span>
        <span>{count}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden bg-[#f0eeeb]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  )
}
