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
  const r = 78
  const cx = 130
  const cy = 130
  const strokeW = 22
  const C = 2 * Math.PI * r

  const outerEdge = r + strokeW / 2   // ring outer edge
  const lineEnd = outerEdge + 20      // end of leader line
  const labelR = lineEnd + 10         // number position

  let acc = 0
  const items = segments
    .filter((s) => s.value > 0)
    .map((seg) => {
      const len = (seg.value / total) * C
      const dashoffset = C / 4 - acc
      const angle = -Math.PI / 2 + (acc + len / 2) / r
      const cosA = Math.cos(angle)
      const sinA = Math.sin(angle)
      acc += len
      return {
        ...seg,
        len,
        dashoffset,
        // line start: just outside ring
        x1: cx + (outerEdge + 2) * cosA,
        y1: cy + (outerEdge + 2) * sinA,
        // line end
        x2: cx + lineEnd * cosA,
        y2: cy + lineEnd * sinA,
        // label
        lx: cx + labelR * cosA,
        ly: cy + labelR * sinA,
      }
    })

  return (
    <svg viewBox="0 0 260 260" width="196" height="196" className="flex-shrink-0">
      {/* Track ring */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F0F5F4" strokeWidth={strokeW} />

      {total > 0 &&
        items.map((seg, i) => (
          <g key={i}>
            {/* Segment arc */}
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeW}
              strokeDasharray={`${seg.len} ${C - seg.len}`}
              strokeDashoffset={seg.dashoffset}
              strokeLinecap="butt"
            />
            {/* Leader line */}
            <line
              x1={seg.x1} y1={seg.y1}
              x2={seg.x2} y2={seg.y2}
              stroke={seg.color}
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.7"
            />
            {/* Number */}
            <text
              x={seg.lx}
              y={seg.ly}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="13"
              fontWeight="700"
              fill={seg.color}
            >
              {seg.value}
            </text>
          </g>
        ))}

      {/* Center: total */}
      <text x={cx} y={cy - 10} textAnchor="middle" fontSize="32" fontWeight="600" fill="#1A2520">
        {total}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="11" fill="#8AADA8">
        applications
      </text>
    </svg>
  )
}
