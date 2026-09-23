import { prisma } from '@/lib/prisma'
import { buildMonthBuckets, monthKey, startOfMonthsAgo } from '@/lib/date-buckets'

/**
 * Queries de estatísticas usadas por /admin (visão geral) e /admin/sales —
 * um único lugar evita as duas páginas divergirem silenciosamente.
 */
export async function loadPlatformStats() {
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

export async function loadEnrollmentGrowth() {
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

export async function loadRevenueByMonth() {
  const buckets = buildMonthBuckets(6)
  const since = startOfMonthsAgo(6)

  const paidInRange = await prisma.transaction.findMany({
    where: { status: 'PAID', createdAt: { gte: since } },
    select: { amount: true, createdAt: true },
  })

  const revenueByMonth = buckets.map((bucket) => ({
    month: bucket.label,
    revenue: paidInRange.filter((t) => monthKey(t.createdAt) === bucket.key).reduce((sum, t) => sum + Number(t.amount), 0),
  }))

  return {
    revenueByMonth,
    totalRevenue: paidInRange.reduce((sum, t) => sum + Number(t.amount), 0),
    paidCount: paidInRange.length,
  }
}
