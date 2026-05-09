interface StatCardProps {
  label: string
  value: number
  sub?: React.ReactNode
  accent?: string
}

export function StatCard({ label, value, sub, accent }: StatCardProps) {
  return (
    <div
      className="bg-white rounded-xl border border-[rgba(26,101,90,0.15)] px-4 py-4 hover:border-[rgba(26,101,90,0.30)] transition-colors overflow-hidden relative"
      style={accent ? { borderTopColor: accent, borderTopWidth: 3 } : undefined}
    >
      <div className="text-xs text-[#4A8C7E] mb-2">{label}</div>
      <div
        className="text-3xl font-bold leading-none"
        style={{ color: accent ?? '#1A2520' }}
      >
        {value}
      </div>
      {sub && (
        <div className="text-xs text-[#4A8C7E] mt-2 flex items-center gap-1">{sub}</div>
      )}
    </div>
  )
}
