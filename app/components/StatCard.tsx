interface StatCardProps {
  label: string
  value: number
  sub?: React.ReactNode
}

export function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-[#e8e6e1] px-4 py-3.5">
      <div className="text-xs text-[#6e6e6a] mb-1.5">{label}</div>
      <div className="text-[26px] font-medium text-[#1c1c1a] leading-none">{value}</div>
      {sub && (
        <div className="text-xs text-[#6e6e6a] mt-1.5 flex items-center gap-1">{sub}</div>
      )}
    </div>
  )
}
