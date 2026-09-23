import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/format'
import { loadRevenueByMonth } from '@/lib/admin-stats'
import { RevenueChart } from '@/components/admin/charts/RevenueChart'
import { DEMO_SALES, isDemoUser } from '@/lib/demo'

export default async function AdminSalesPage() {
  const session = await auth()
  const userId = session!.user.id

  const { revenueByMonth, totalRevenue, paidCount, transactions } = isDemoUser(userId) ? DEMO_SALES : await loadSales()

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-3xl font-bold tracking-tight">Vendas</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">Receita confirmada e transações recentes.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_.8fr]">
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
          <div className="flex items-baseline justify-between">
            <h2 className="font-bold">Receita mensal</h2>
            <p className="text-xl font-bold">{formatCurrency(totalRevenue)}</p>
          </div>
          <p className="text-sm text-slate-400">Últimos 6 meses</p>
          <div className="mt-4">
            <RevenueChart data={revenueByMonth} />
          </div>
        </div>

        <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
          <h2 className="font-bold">Resumo</h2>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-xs text-slate-400">Receita total (6 meses)</p>
              <p className="mt-1 text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Transações pagas (6 meses)</p>
              <p className="mt-1 text-2xl font-bold">{paidCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-3xl bg-white dark:bg-slate-900 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-slate-100 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-5 py-3 font-semibold">Cliente</th>
              <th className="px-5 py-3 font-semibold">Tipo</th>
              <th className="px-5 py-3 font-semibold">Data</th>
              <th className="px-5 py-3 font-semibold">Valor</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="border-b border-slate-50 last:border-0">
                <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">{transaction.customerLabel}</td>
                <td className="px-5 py-4 text-slate-500 dark:text-slate-400">{transaction.type}</td>
                <td className="px-5 py-4 text-slate-500 dark:text-slate-400">{formatDate(transaction.createdAt)}</td>
                <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">{formatCurrency(transaction.amount)}</td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      transaction.status === 'PAID' ? 'bg-teal-50 dark:bg-teal-500/10 text-teal-700' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700'
                    }`}
                  >
                    {transaction.status}
                  </span>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                  Ainda sem transações.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

async function loadSales() {
  const [{ revenueByMonth, totalRevenue, paidCount }, recentTransactions] = await Promise.all([
    loadRevenueByMonth(),
    prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 15,
      include: { user: { select: { name: true, email: true } } },
    }),
  ])

  return {
    revenueByMonth,
    totalRevenue,
    paidCount,
    transactions: recentTransactions.map((t) => ({
      id: t.id,
      customerLabel: t.user.name ?? t.user.email,
      type: t.type,
      createdAt: t.createdAt,
      amount: Number(t.amount),
      status: t.status,
    })),
  }
}
