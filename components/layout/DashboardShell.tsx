'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  Award,
  BarChart3,
  BookOpen,
  Contact,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  ShieldPlus,
  Settings,
  ShoppingBag,
  Users,
  X,
} from 'lucide-react'
import { Logo } from '@/components/layout/Logo'
import { NotificationBell, type NotificationItem } from '@/components/layout/NotificationBell'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { PageTransition } from '@/components/layout/PageTransition'

type NavItem = {
  label: string
  href: string
  icon: React.ReactNode
  superAdminOnly?: boolean
}

const STUDENT_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/student', icon: <LayoutDashboard size={20} /> },
  { label: 'Meus cursos', href: '/student/courses', icon: <BookOpen size={20} /> },
  { label: 'Progresso', href: '/student/progress', icon: <BarChart3 size={20} /> },
  { label: 'Certificados', href: '/student/certificates', icon: <Award size={20} /> },
  { label: 'Comunidade', href: '/student/community', icon: <Users size={20} /> },
]

/**
 * Um único painel para ADMIN/DIRECTOR/INSTRUCTOR/TENANT_ADMIN — não há mais
 * uma dashboard "Director" separada. Director tem exatamente a autoridade de
 * Admin (ver lib/constants/roles.ts), por isso não faz sentido ter rotas ou
 * menus diferentes para os dois.
 */
const ADMIN_NAV: NavItem[] = [
  { label: 'Visão geral', href: '/admin', icon: <LayoutDashboard size={20} /> },
  { label: 'Alunos', href: '/admin/students', icon: <Users size={20} /> },
  { label: 'Sub-admins', href: '/admin/sub-admins', icon: <ShieldPlus size={20} />, superAdminOnly: true },
  { label: 'Cursos', href: '/admin/courses', icon: <BookOpen size={20} /> },
  { label: 'CRM', href: '/admin/crm', icon: <Contact size={20} /> },
  { label: 'Vendas', href: '/admin/sales', icon: <ShoppingBag size={20} /> },
  { label: 'Conteúdo', href: '/admin/content/landing-page', icon: <FileText size={20} /> },
]

/** Rota de cada item de ADMIN_NAV -> módulo que um TENANT_ADMIN precisa ter para o ver. 'Visão geral' fica sempre visível. */
const NAV_MODULE_BY_HREF: Record<string, string> = {
  '/admin/students': 'students',
  '/admin/courses': 'courses',
  '/admin/crm': 'crm',
  '/admin/sales': 'sales',
  '/admin/content/landing-page': 'content',
}

interface DashboardShellProps {
  role: 'student' | 'admin'
  userName: string
  userPlan?: string
  /** Sessão demo (sem banco conectado) — mostra aviso para não confundir com dados reais. */
  isDemo?: boolean
  /** Só relevante quando role === 'admin' e a conta é TENANT_ADMIN — filtra a nav pelos módulos permitidos. */
  permissions?: string[]
  /** ADMIN/DIRECTOR (autoridade total) vs TENANT_ADMIN/INSTRUCTOR (acesso restrito) — controla itens como "Sub-admins". */
  isSuperAdmin?: boolean
  notifications?: NotificationItem[]
  children: React.ReactNode
}

export function DashboardShell({
  role,
  userName,
  userPlan,
  isDemo,
  permissions,
  isSuperAdmin = false,
  notifications = [],
  children,
}: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const baseNavItems = role === 'admin' ? ADMIN_NAV : STUDENT_NAV
  const navItems = baseNavItems.filter((item) => {
    if (item.superAdminOnly && !isSuperAdmin) return false
    const requiredModule = NAV_MODULE_BY_HREF[item.href]
    if (requiredModule && permissions && !permissions.includes(requiredModule)) return false
    return true
  })
  const homeHref = `/${role}`
  const initials = userName
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  function isActive(href: string) {
    return href === homeHref ? pathname === href : pathname.startsWith(href)
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* Sidebar — visível a partir de lg, escondida em mobile (substituída pela bottom nav) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:flex lg:flex-col">
        <Logo />
        <nav className="mt-10 flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                isActive(item.href)
                  ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-100 pt-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-violet-100 text-xs font-bold text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{userName}</p>
              {userPlan && <p className="text-xs text-slate-400">{userPlan}</p>}
            </div>
            <ThemeToggle />
            <button
              type="button"
              aria-label="Sair"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      {/* Drawer mobile — menu completo + ações secundárias */}
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[80vw] border-r border-slate-200 bg-white p-5 transition-transform dark:border-slate-800 dark:bg-slate-900 lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between">
          <Logo />
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setMobileMenuOpen(false)}
            className="grid h-11 w-11 place-items-center text-slate-500 dark:text-slate-400"
          >
            <X size={22} />
          </button>
        </div>
        <nav className="mt-8 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${
                isActive(item.href)
                  ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
          <Link
            href={`/${role}/settings`}
            onClick={() => setMobileMenuOpen(false)}
            className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-500 dark:text-slate-400"
          >
            <Settings size={20} />
            Configurações
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-500 dark:text-slate-400"
          >
            <LogOut size={20} />
            Sair
          </button>
        </nav>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Tema</span>
          <ThemeToggle />
        </div>
      </aside>

      <div className="min-w-0 flex-1 lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 lg:h-20 lg:px-8">
          <button
            type="button"
            aria-label="Abrir menu"
            onClick={() => setMobileMenuOpen(true)}
            className="grid h-11 w-11 place-items-center text-slate-600 dark:text-slate-300 lg:hidden"
          >
            <Menu size={22} />
          </button>
          <div className="hidden items-center gap-2 text-sm text-slate-400 lg:flex">
            <span className="text-slate-900 dark:text-white">{role === 'admin' ? 'Admin' : 'Dashboard'}</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle className="hidden lg:grid" />
            <NotificationBell notifications={notifications} />
            <button
              type="button"
              aria-label="Mais opções"
              onClick={() => setMobileMenuOpen(true)}
              className="grid h-11 w-11 place-items-center text-slate-400 lg:hidden"
            >
              <MoreHorizontal size={19} />
            </button>
          </div>
        </header>

        {isDemo && (
          <div className="bg-amber-50 px-5 py-2 text-center text-xs font-medium text-amber-800 dark:bg-amber-500/10 dark:text-amber-300 lg:px-8">
            Modo demo — sem conexão com o banco de dados. Os dados mostrados aqui são fictícios.
          </div>
        )}

        <main className="p-5 pb-24 lg:p-8 lg:pb-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>

      {/* Bottom navigation — só em mobile, itens principais a um toque de distância do polegar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${
              isActive(item.href) ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400'
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
