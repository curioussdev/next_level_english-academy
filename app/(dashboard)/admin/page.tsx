import Link from 'next/link'
import { BarChart3, BookOpen, MessageSquareQuote, Users, Zap } from 'lucide-react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/format'
import { buildMonthBuckets, monthKey, startOfMonthsAgo } from '@/lib/date-buckets'
import { EnrollmentChart } from '@/components/admin/charts/EnrollmentChart'
import { DEMO_ADMIN_STATS, DEMO_ENROLLMENT_GROWTH, isDemoUser } from '@/lib/demo'

export default async function AdminPage() {
  const session = await auth()
  const userId = session!.user.id
  const firstName = session?.user?.name?.split(' ')[0] ?? 'Admin'

  const isDemo = isDemoUser(userId)
  const stats = isDemo ? DEMO_ADMIN_STATS : await loadAdminStats()
  const enrollmentGrowth = isDemo ? DEMO_ENROLLMENT_GROWTH : await loadEnrollmentGrowth()

  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-sm text-slate-400">Visão geral</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">Bom dia, {firstName}.</h1>
      <p className="mt-2 text-slate-500">Aqui está o que está a acontecer na Next Level.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<Users />} label="Total de alunos" value={String(stats.totalStudents)} />
        <Stat icon={<Zap />} label="Matrículas ativas" value={String(stats.activeEnrollments)} />
        <Stat icon={<BookOpen />} label="Cursos publicados" value={String(stats.publishedCourses)} />
        <Stat icon={<BarChart3 />} label="Receita total" value={formatCurrency(stats.totalRevenueCents / 100)} />
      </div>

      <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <h2 className="font-bold">Novas matrículas</h2>
        <p className="text-sm text-slate-400">Últimos 6 meses</p>
        <div className="mt-4">
          <EnrollmentChart data={enrollmentGrowth} />
        </div>
      </div>

      <h2 className="mt-8 text-lg font-bold">Conteúdo</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/content/landing-page"
          className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:ring-violet-200"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600">
            <BarChart3 size={18} />
          </span>
          <div>
            <p className="font-semibold">Landing page</p>
            <p className="text-sm text-slate-400">Editar título e subtítulo do site</p>
          </div>
        </Link>
        <Link
          href="/admin/content/testimonials"
          className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:ring-violet-200"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-600">
            <MessageSquareQuote size={18} />
          </span>
          <div>
            <p className="font-semibold">Depoimentos</p>
            <p className="text-sm text-slate-400">Gerir os depoimentos publicados</p>
          </div>
        </Link>
      </div>
    </div>
  )
}

async function loadAdminStats() {
  const [totalStudents, activeEnrollments, publishedCourses, revenueAgg] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.enrollment.count({ where: { status: 'ACTIVE' } }),
    prisma.course.count({ where: { isPublished: true } }),
    prisma.transaction.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
  ])

  return {
    totalStudents,
    activeEnrollments,
    publishedCourses,
    totalRevenueCents: Math.round(Number(revenueAgg._sum.amount ?? 0) * 100),
  }
}

async function loadEnrollmentGrowth() {
  const buckets = buildMonthBuckets(6)
  const since = startOfMonthsAgo(6)

  const enrollments = await prisma.enrollment.findMany({
    where: { startDate: { gte: since } },
    select: { startDate: true },
  })

  return buckets.map((bucket) => ({
    month: bucket.label,
    count: enrollments.filter((e) => monthKey(e.startDate) === bucket.key).length,
  }))
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-50 text-violet-600">{icon}</span>
      <p className="mt-5 text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  )
}
