interface CompanyEntry {
  company: string
  count: number
}

interface TopCompaniesProps {
  data: CompanyEntry[]
}

export function TopCompanies({ data }: TopCompaniesProps) {
  const max = data.reduce((m, e) => Math.max(m, e.count), 0)

  return (
    <div className="bg-white rounded-xl border border-[rgba(26,101,90,0.15)] p-4 hover:border-[rgba(26,101,90,0.30)] transition-colors">
      <div className="mb-4">
        <span className="text-sm font-medium text-[#1A2520]">Top companies</span>
        <p className="text-xs text-[#4A8C7E] mt-0.5">Most applied-to companies</p>
      </div>
      {data.length === 0 ? (
        <p className="text-sm text-[#4A8C7E]">No data yet.</p>
      ) : (
        <ol className="space-y-2.5">
          {data.map((entry, i) => (
            <li key={entry.company} className="flex items-center gap-3">
              <span className="text-[11px] font-medium text-[#8AADA8] w-4 flex-shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-[#1A2520] truncate">{entry.company}</span>
                  <span className="text-xs text-[#4A8C7E] ml-2 flex-shrink-0">{entry.count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#E6F4F1] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#0FA878] transition-all duration-500"
                    style={{ width: max > 0 ? `${(entry.count / max) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
