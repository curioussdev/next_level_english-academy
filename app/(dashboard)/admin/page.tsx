import Link from 'next/link'
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  Contact,
  FileText,
  MessageSquareQuote,
  ShieldPlus,
  ShoppingBag,
  Users,
  XCircle,
  Zap,
} from 'lucide-react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { loadPlatformStats, loadEnrollmentGrowth, loadRevenueByMonth } from '@/lib/admin-stats'
import { RevenueChart } from '@/components/admin/charts/RevenueChart'
import { EnrollmentChart } from '@/components/admin/charts/EnrollmentChart'
import { DEMO_ACTIVITY_LOG, DEMO_ADMIN_STATS, DEMO_ENROLLMENT_GROWTH, DEMO_SALES, isDemoUser } from '@/lib/demo'
import { formatCurrency, formatDateTime } from '@/lib/format'
import { SUPERADMIN_ROLES, hasModuleAccess, type TenantModule } from '@/lib/constants/roles'

const ACTION_LABELS: Record<string, string> = {
  LOGIN: 'Entrou na plataforma',
  PURCHASE: 'Fez uma compra',
  COURSE_CREATED: 'Criou um curso',
  USER_BLOCKED: 'Bloqueou um utilizador',
  USER_UNBLOCKED: 'Desbloqueou um utilizador',
  USER_CREATED: 'Criou uma conta',
  PERMISSIONS_UPDATED: 'Atualizou permissões de um sub-admin',
}

const QUICK_ACTIONS: { label: string; description: string; href: string; icon: React.ReactNode; module?: TenantModule; superAdminOnly?: boolean }[] = [
  { label: 'Alunos', description: 'Gerir contas, cargos e bloqueios', href: '/admin/students', icon: <Users size={18} />, module: 'students' },
  { label: 'Sub-admins', description: 'Criar e gerir administradores delegados', href: '/admin/sub-admins', icon: <ShieldPlus size={18} />, superAdminOnly: true },
  { label: 'Cursos', description: 'Criar, editar e publicar cursos', href: '/admin/courses', icon: <BookOpen size={18} />, module: 'courses' },
  { label: 'CRM', description: 'Acompanhar leads e conversões', href: '/admin/crm', icon: <Contact size={18} />, module: 'crm' },
  { label: 'Vendas', description: 'Transações e receita detalhada', href: '/admin/sales', icon: <ShoppingBag size={18} />, module: 'sales' },
  { label: 'Landing page', description: 'Editar título e subtítulo do site', href: '/admin/content/landing-page', icon: <FileText size={18} />, module: 'content' },
  { label: 'Depoimentos', description: 'Gerir os depoimentos publicados', href: '/admin/content/testimonials', icon: <MessageSquareQuote size={18} />, module: 'content' },
]

export default async function AdminPage() {
  const session = await auth()
  const user = session!.user
  const firstName = user.name?.split(' ')[0] ?? 'Admin'
  const isDemo = isDemoUser(user.id)
  const isSuperAdmin = SUPERADMIN_ROLES.includes(user.role)

  const health = getSystemHealth()
  const [stats, enrollmentGrowth, revenue, activity, dbOk] = isDemo
    ? [DEMO_ADMIN_STATS, DEMO_ENROLLMENT_GROWTH, DEMO_SALES, DEMO_ACTIVITY_LOG, true]
    : await Promise.all([
        loadPlatformStats(),
        loadEnrollmentGrowth(),
        loadRevenueByMonth(),
        isSuperAdmin ? loadActivity() : Promise.resolve([]),
        isSuperAdmin ? checkDatabase() : Promise.resolve(true),
      ])

  const quickActions = QUICK_ACTIONS.filter((action) => {
    if (action.superAdminOnly) return isSuperAdmin
    if (action.module) return hasModuleAccess(user, action.module)
    return true
  })

  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-sm text-slate-400">Visão geral</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">Bom dia, {firstName}.</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">Aqui está o que está a acontecer na Next Level.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<Users size={18} />} label="Total de alunos" value={String(stats.totalStudents)} />
        <Stat icon={<Zap size={18} />} label="Matrículas ativas" value={String(stats.activeEnrollments)} />
        <Stat icon={<BookOpen size={18} />} label="Cursos publicados" value={String(stats.publishedCourses)} />
        <Stat icon={<BarChart3 size={18} />} label="Receita total" value={formatCurrency(stats.totalRevenueCents / 100)} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
          <h2 className="font-bold">Receita mensal</h2>
          <p className="text-sm text-slate-400">Últimos 6 meses</p>
          <div className="mt-4">
            <RevenueChart data={revenue.revenueByMonth} />
          </div>
        </div>
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
          <h2 className="font-bold">Novas matrículas</h2>
          <p className="text-sm text-slate-400">Últimos 6 meses</p>
          <div className="mt-4">
            <EnrollmentChart data={enrollmentGrowth} />
          </div>
        </div>
      </div>

      <h2 className="mt-8 text-lg font-bold">Controlo rápido</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex items-center gap-4 rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800 transition hover:ring-violet-200 dark:hover:ring-violet-800"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400">
              {action.icon}
            </span>
            <div>
              <p className="font-semibold">{action.label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {isSuperAdmin && (
        <>
          <h2 className="mt-8 text-lg font-bold">Saúde do sistema</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <HealthItem label="Base de dados" ok={dbOk} okText="Conectada" badText="Sem conexão (modo demo ativo)" />
            <HealthItem label="Stripe" ok={health.stripe} okText="Configurado" badText="Chaves em falta" />
            <HealthItem label="Google OAuth" ok={health.google} okText="Configurado" badText="Chaves em falta" />
            <HealthItem label="Email (Resend)" ok={health.resend} okText="Configurado" badText="Ainda não configurado" />
            <HealthItem label="Push (VAPID)" ok={health.push} okText="Configurado" badText="Ainda não configurado" />
          </div>

          <h2 className="mt-8 text-lg font-bold">Atividade recente</h2>
          <div className="mt-3 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
            {activity.length === 0 && <p className="p-5 text-sm text-slate-400">Ainda sem atividade registada.</p>}
            {activity.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between border-b border-slate-50 px-5 py-3 text-sm last:border-0 dark:border-slate-800">
                <div>
                  <span className="font-semibold">{entry.userName}</span>{' '}
                  <span className="text-slate-500 dark:text-slate-400">{ACTION_LABELS[entry.action] ?? entry.action}</span>
                </div>
                <span className="text-xs text-slate-400">{formatDateTime(entry.createdAt)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function getSystemHealth() {
  return {
    stripe: Boolean(process.env.STRIPE_SECRET_KEY),
    google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    resend: Boolean(process.env.RESEND_API_KEY),
    push: Boolean(process.env.VAPID_PUBLIC_KEY),
  }
}

async function checkDatabase() {
  try {
    await prisma.user.count()
    return true
  } catch {
    return false
  }
}

async function loadActivity() {
  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: { user: { select: { name: true, email: true } } },
  })

  return logs.map((log) => ({
    id: log.id,
    userName: log.user.name ?? log.user.email,
    action: log.action,
    createdAt: log.createdAt,
  }))
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400">{icon}</span>
      <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  )
}

function HealthItem({ label, ok, okText, badText }: { label: string; ok: boolean; okText: string; badText: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
      {ok ? <CheckCircle2 size={20} className="shrink-0 text-teal-500" /> : <XCircle size={20} className="shrink-0 text-amber-500" />}
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{ok ? okText : badText}</p>
      </div>
    </div>
  )
}
