'use client'

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export interface EnrollmentPoint {
  month: string
  count: number
}

export function EnrollmentChart({ data }: { data: EnrollmentPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} width={32} allowDecimals={false} />
        <Tooltip
          formatter={(value) => [Number(value), 'Novas matrículas']}
          contentStyle={{ borderRadius: 12, border: '1px solid #f1f5f9', fontSize: 13 }}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#0d9488"
          strokeWidth={2}
          dot={{ r: 4, fill: '#0d9488', stroke: '#fff', strokeWidth: 2 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
