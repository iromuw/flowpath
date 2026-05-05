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
    <div className="bg-white rounded-xl border border-[#e8e6e1] p-4">
      <div className="mb-4">
        <span className="text-sm font-medium text-[#1c1c1a]">Top companies</span>
        <p className="text-xs text-[#6e6e6a] mt-0.5">Most applied-to companies</p>
      </div>
      {data.length === 0 ? (
        <p className="text-sm text-[#6e6e6a]">No data yet.</p>
      ) : (
        <ol className="space-y-2.5">
          {data.map((entry, i) => (
            <li key={entry.company} className="flex items-center gap-3">
              <span className="text-[11px] font-medium text-[#b0aea8] w-4 flex-shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-[#1c1c1a] truncate">{entry.company}</span>
                  <span className="text-xs text-[#6e6e6a] ml-2 flex-shrink-0">{entry.count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#f0eeeb] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#1a1a2e] transition-all duration-500"
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
