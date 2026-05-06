'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { WeeklyCount } from '@/lib/types'

function formatWeek(week: string): string {
  const parts = week.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[parseInt(parts[1]) - 1]} ${parseInt(parts[2])}`
}

interface WeeklyChartProps {
  data: WeeklyCount[]
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  const chartData = data.map((d) => ({ ...d, weekLabel: formatWeek(d.week) }))

  return (
    <div className="bg-white rounded-xl border border-[rgba(26,101,90,0.15)] p-4 hover:border-[rgba(26,101,90,0.30)] transition-colors">
      <div className="mb-4">
        <span className="text-sm font-medium text-[#1A2520]">Applications over time</span>
        <p className="text-xs text-[#4A8C7E] mt-0.5">Weekly applications submitted (last 12 weeks)</p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,101,90,0.15)" />
          <XAxis
            dataKey="weekLabel"
            tick={{ fontSize: 11, fill: '#4A8C7E' }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            allowDecimals={false}
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
            itemStyle={{ color: '#0FA878' }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#0FA878"
            strokeWidth={2}
            dot={{ fill: '#0FA878', r: 3 }}
            activeDot={{ r: 5 }}
            name="Applications"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
