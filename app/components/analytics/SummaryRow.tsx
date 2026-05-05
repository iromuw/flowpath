interface SummaryMetric {
  label: string
  value: string
  sub: string
}

interface SummaryCardProps {
  metric: SummaryMetric
}

function SummaryCard({ metric }: SummaryCardProps) {
  return (
    <div className="bg-white rounded-xl border border-[#e8e6e1] px-4 py-4">
      <div className="text-xs text-[#6e6e6a] mb-2">{metric.label}</div>
      <div className="text-3xl font-bold text-[#1c1c1a] leading-none">{metric.value}</div>
      <div className="text-xs text-[#6e6e6a] mt-2">{metric.sub}</div>
    </div>
  )
}

interface SummaryRowProps {
  responseRate: number
  interviewConversionRate: number
  avgDaysToResponse: number
  offerRate: number
}

export function SummaryRow({
  responseRate,
  interviewConversionRate,
  avgDaysToResponse,
  offerRate,
}: SummaryRowProps) {
  const metrics: SummaryMetric[] = [
    {
      label: 'Response rate',
      value: `${responseRate}%`,
      sub: 'Applications that got a reply',
    },
    {
      label: 'Interview conversion',
      value: `${interviewConversionRate}%`,
      sub: 'Reached interview stage',
    },
    {
      label: 'Avg. days to response',
      value: avgDaysToResponse === 0 ? '—' : `${avgDaysToResponse}d`,
      sub: 'From submission to first reply',
    },
    {
      label: 'Offer rate',
      value: `${offerRate}%`,
      sub: 'Applications resulting in offer',
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-3">
      {metrics.map((m) => (
        <SummaryCard key={m.label} metric={m} />
      ))}
    </div>
  )
}
