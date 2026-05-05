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
    <div className="bg-white rounded-xl border border-[#e8e6e1] p-4">
      <div className="mb-4">
        <span className="text-sm font-medium text-[#1c1c1a]">Applications over time</span>
        <p className="text-xs text-[#6e6e6a] mt-0.5">Weekly applications submitted (last 12 weeks)</p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0eeeb" />
          <XAxis
            dataKey="weekLabel"
            tick={{ fontSize: 11, fill: '#6e6e6a' }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            allowDecimals={false}
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
            itemStyle={{ color: '#1D9E75' }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#1D9E75"
            strokeWidth={2}
            dot={{ fill: '#1D9E75', r: 3 }}
            activeDot={{ r: 5 }}
            name="Applications"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
