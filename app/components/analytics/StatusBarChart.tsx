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
  SUBMITTED: '#0A66C2',
  APPLICATION_VIEWED: '#D4A04A',
  PRE_SCREENING: '#9B6EE0',
  FIRST_ROUND: '#E0784A',
  SECOND_ROUND: '#E0784A',
  FINAL_ROUND: '#D4A04A',
  OFFER: '#0FA878',
  NO_REPLY: '#8AADA8',
  WITHDRAWN: '#D6006E',
  UNSUCCESSFUL: '#D6006E',
  JOB_CLOSED: '#7B8FA3',
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
    <div className="bg-white rounded-xl border border-[rgba(26,101,90,0.15)] p-4 hover:border-[rgba(26,101,90,0.30)] transition-colors">
      <div className="mb-4">
        <span className="text-sm font-medium text-[#1A2520]">Status breakdown</span>
        <p className="text-xs text-[#4A8C7E] mt-0.5">Applications per status</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 0, right: 24, left: 8, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,101,90,0.15)" horizontal={false} />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fontSize: 11, fill: '#4A8C7E' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={84}
            tick={{ fontSize: 11, fill: '#4A8C7E' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: '#fff',
              border: '1px solid rgba(26,101,90,0.15)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            labelStyle={{ color: '#1A2520', fontWeight: 500 }}
            cursor={{ fill: '#E6F4F1' }}
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
