export interface DonutSegment {
  label: string
  value: number
  color: string
}

interface DonutChartProps {
  segments: DonutSegment[]
  total: number
}

export function DonutChart({ segments, total }: DonutChartProps) {
  const r = 42
  const cx = 55
  const cy = 55
  const C = 2 * Math.PI * r

  let accumulated = 0

  return (
    <svg width="110" height="110" viewBox="0 0 110 110" className="flex-shrink-0">
      {/* Track ring */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0eeeb" strokeWidth="14" />

      {total > 0 &&
        segments.map((seg, i) => {
          if (seg.value === 0) return null
          const len = (seg.value / total) * C
          const dashoffset = C / 4 - accumulated
          accumulated += len
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth="14"
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={dashoffset}
              strokeLinecap="round"
            />
          )
        })}

      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        fontSize="20"
        fontWeight="500"
        fill="#1c1c1a"
      >
        {total}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="10" fill="#6e6e6a">
        applications
      </text>
    </svg>
  )
}
