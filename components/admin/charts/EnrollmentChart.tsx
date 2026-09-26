'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export interface EnrollmentPoint {
  month: string
  count: number
}

/** Ver nota em RevenueChart.tsx: cores por tema, não CSS vars (Recharts desenha em SVG). */
export function EnrollmentChart({ data }: { data: EnrollmentPoint[] }) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDark = mounted && resolvedTheme === 'dark'

  const gridColor = isDark ? '#1e293b' : '#f1f5f9'
  const tickColor = isDark ? '#94a3b8' : '#64748b'
  const tooltipBg = isDark ? '#0f172a' : '#ffffff'
  const tooltipBorder = isDark ? '#1e293b' : '#e2e8f0'
  const tooltipText = isDark ? '#f8fafc' : '#0f172a'
  const dotRingColor = isDark ? '#0f172a' : '#ffffff'

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={gridColor} />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: tickColor }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: tickColor }} width={32} allowDecimals={false} />
        <Tooltip
          formatter={(value) => [Number(value), 'Novas matrículas']}
          contentStyle={{ borderRadius: 12, border: `1px solid ${tooltipBorder}`, background: tooltipBg, color: tooltipText, fontSize: 13 }}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#0d9488"
          strokeWidth={2}
          dot={{ r: 4, fill: '#0d9488', stroke: dotRingColor, strokeWidth: 2 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
