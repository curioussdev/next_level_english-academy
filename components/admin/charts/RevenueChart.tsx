'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCurrency } from '@/lib/format'

export interface RevenuePoint {
  month: string
  revenue: number
}

/**
 * Recharts desenha em SVG com cores passadas como prop — não lê variáveis
 * CSS. Por isso os tons têm de ser escolhidos explicitamente por tema, em
 * vez de depender das classes `dark:` do resto da app.
 */
export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDark = mounted && resolvedTheme === 'dark'

  const gridColor = isDark ? '#1e293b' : '#f1f5f9'
  const tickColor = isDark ? '#94a3b8' : '#64748b'
  const cursorColor = isDark ? '#334155' : '#f5f3ff'
  const tooltipBg = isDark ? '#0f172a' : '#ffffff'
  const tooltipBorder = isDark ? '#1e293b' : '#e2e8f0'
  const tooltipText = isDark ? '#f8fafc' : '#0f172a'

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={gridColor} />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: tickColor }} />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: tickColor }}
          width={56}
          tickFormatter={(value: number) => formatCurrency(value)}
        />
        <Tooltip
          cursor={{ fill: cursorColor }}
          formatter={(value) => [formatCurrency(Number(value)), 'Receita']}
          contentStyle={{ borderRadius: 12, border: `1px solid ${tooltipBorder}`, background: tooltipBg, color: tooltipText, fontSize: 13 }}
        />
        <Bar dataKey="revenue" fill="#7c3aed" radius={[4, 4, 0, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  )
}
