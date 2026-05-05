'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { ApplicationStatus, STATUS_LABELS } from '@/lib/types'

const STATUS_BAR_COLORS: Record<ApplicationStatus, string> = {
  SUBMITTED: '#378ADD',
  APPLICATION_VIEWED: '#EF9F27',
  FIRST_ROUND: '#1D9E75',
  SECOND_ROUND: '#0A5C47',
  FINAL_ROUND: '#085040',
  OFFER: '#639922',
  NO_REPLY: '#888780',
  WITHDRAWN: '#C0392B',
}

interface StatusBarChartProps {
  byStatus: Record<ApplicationStatus, number>
}

export function StatusBarChart({ byStatus }: StatusBarChartProps) {
  const data = (Object.entries(byStatus) as [ApplicationStatus, number][])
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([status, count]) => ({
      status,
      name: STATUS_LABELS[status],
      count,
      color: STATUS_BAR_COLORS[status],
    }))

  return (
    <div className="bg-white rounded-xl border border-[#e8e6e1] p-4">
      <div className="mb-4">
        <span className="text-sm font-medium text-[#1c1c1a]">Status breakdown</span>
        <p className="text-xs text-[#6e6e6a] mt-0.5">Applications per status</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 0, right: 24, left: 8, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0eeeb" horizontal={false} />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fontSize: 11, fill: '#6e6e6a' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={84}
            tick={{ fontSize: 11, fill: '#6e6e6a' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: '#fff',
              border: '1px solid #e8e6e1',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            labelStyle={{ color: '#1c1c1a', fontWeight: 500 }}
            cursor={{ fill: '#f7f6f3' }}
          />
          <Bar dataKey="count" name="Applications" radius={[0, 4, 4, 0]}>
            {data.map((entry) => (
              <Cell key={entry.status} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
