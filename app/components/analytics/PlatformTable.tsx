import { PlatformPerformance } from '@/lib/types'

interface PlatformTableProps {
  data: PlatformPerformance[]
}

export function PlatformTable({ data }: PlatformTableProps) {
  return (
    <div className="bg-white rounded-xl border border-[rgba(26,101,90,0.15)] overflow-hidden hover:border-[rgba(26,101,90,0.30)] transition-colors">
      <div className="px-4 py-3 border-b border-[rgba(26,101,90,0.15)]">
        <span className="text-sm font-medium text-[#1A2520]">Platform performance</span>
      </div>
      {data.length === 0 ? (
        <p className="px-4 py-8 text-sm text-[#4A8C7E] text-center">No data yet.</p>
      ) : (
        <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] table-fixed border-collapse">
          <colgroup>
            <col style={{ width: '28%' }} />
            <col style={{ width: '18%' }} />
            <col style={{ width: '18%' }} />
            <col style={{ width: '18%' }} />
            <col style={{ width: '18%' }} />
          </colgroup>
          <thead className="bg-[#E6F4F1]">
            <tr>
              {['Platform', 'Applied', 'Interviews', 'Offers', 'Response rate'].map((h) => (
                <th
                  key={h}
                  className="text-left text-[11px] font-medium text-[#4A8C7E] px-4 py-2.5 border-b border-[rgba(26,101,90,0.15)]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={row.platform}
                className="border-b border-[rgba(26,101,90,0.15)] last:border-b-0 hover:bg-[#E6F4F1] transition-colors"
              >
                <td className="px-4 py-3 text-sm font-medium text-[#1A2520]">{row.label}</td>
                <td className="px-4 py-3 text-sm text-[#4A8C7E]">{row.total}</td>
                <td className="px-4 py-3 text-sm text-[#4A8C7E]">{row.interviews}</td>
                <td className="px-4 py-3 text-sm text-[#4A8C7E]">{row.offers}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-medium ${
                      row.responseRate >= 50
                        ? 'text-[#0FA878]'
                        : row.responseRate >= 20
                        ? 'text-[#D4A017]'
                        : 'text-[#8AADA8]'
                    }`}
                  >
                    {row.responseRate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  )
}
