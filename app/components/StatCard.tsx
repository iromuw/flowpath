interface StatCardProps {
  label: string
  value: number
  sub?: React.ReactNode
}

export function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-[rgba(26,101,90,0.15)] px-4 py-4 hover:border-[rgba(26,101,90,0.30)] transition-colors">
      <div className="text-xs text-[#4A8C7E] mb-2">{label}</div>
      <div className="text-3xl font-bold text-[#1A2520] leading-none">{value}</div>
      {sub && (
        <div className="text-xs text-[#4A8C7E] mt-2 flex items-center gap-1">{sub}</div>
      )}
    </div>
  )
}
