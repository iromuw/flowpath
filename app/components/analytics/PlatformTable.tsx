import { PlatformPerformance } from '@/lib/types'

interface PlatformTableProps {
  data: PlatformPerformance[]
}

export function PlatformTable({ data }: PlatformTableProps) {
  return (
    <div className="bg-white rounded-xl border border-[#e8e6e1] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#e8e6e1]">
        <span className="text-sm font-medium text-[#1c1c1a]">Platform performance</span>
      </div>
      {data.length === 0 ? (
        <p className="px-4 py-8 text-sm text-[#6e6e6a] text-center">No data yet.</p>
      ) : (
        <table className="w-full table-fixed border-collapse">
          <colgroup>
            <col style={{ width: '28%' }} />
            <col style={{ width: '18%' }} />
            <col style={{ width: '18%' }} />
            <col style={{ width: '18%' }} />
            <col style={{ width: '18%' }} />
          </colgroup>
          <thead className="bg-[#f7f6f3]">
            <tr>
              {['Platform', 'Applied', 'Interviews', 'Offers', 'Response rate'].map((h) => (
                <th
                  key={h}
                  className="text-left text-[11px] font-medium text-[#6e6e6a] px-4 py-2.5 border-b border-[#e8e6e1]"
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
                className="border-b border-[#e8e6e1] last:border-b-0 hover:bg-[#f7f6f3] transition-colors"
              >
                <td className="px-4 py-3 text-sm font-medium text-[#1c1c1a]">{row.label}</td>
                <td className="px-4 py-3 text-sm text-[#6e6e6a]">{row.total}</td>
                <td className="px-4 py-3 text-sm text-[#6e6e6a]">{row.interviews}</td>
                <td className="px-4 py-3 text-sm text-[#6e6e6a]">{row.offers}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-medium ${
                      row.responseRate >= 50
                        ? 'text-[#0F6E56]'
                        : row.responseRate >= 20
                        ? 'text-[#854F0B]'
                        : 'text-[#5F5E5A]'
                    }`}
                  >
                    {row.responseRate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
