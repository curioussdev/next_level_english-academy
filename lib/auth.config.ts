import type { NextAuthConfig } from 'next-auth'
import type { AppRole } from '@/lib/constants/roles'
import { SUPERADMIN_ROLES, getModuleForPath, hasModuleAccess } from '@/lib/constants/roles'
import { prisma } from '@/lib/prisma'
import { isDemoUser } from '@/lib/demo'

/**
 * Config sem o Prisma Adapter nem o provider Credentials/bcrypt (esses só
 * fazem sentido no `lib/auth.ts` completo, usado pelas rotas/Server Actions).
 * Esta é usada pelo Proxy (proxy.ts). Nesta versão do Next.js (16+) o Proxy
 * corre em runtime Node.js por padrão — já não Edge — por isso chamar Prisma
 * diretamente aqui (ex.: no `authorized`, para reconfirmar `isBlocked`) é
 * seguro; confirmado em node_modules/next/dist/docs/.../proxy.md ("Proxy
 * defaults to using the Node.js runtime").
 */
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = (user as { role: AppRole }).role
        token.permissions = (user as { permissions?: string[] }).permissions ?? []
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as AppRole
        session.user.permissions = (token.permissions as string[] | undefined) ?? []
      }
      return session
    },
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const role = auth?.user?.role

      const isAdminRoute = nextUrl.pathname.startsWith('/admin')
      const isStudentRoute = nextUrl.pathname.startsWith('/student')

      if (!isLoggedIn && (isAdminRoute || isStudentRoute)) {
        return false
      }

      // A sessão é JWT: bloquear uma conta não invalida sessões já emitidas
      // (só expiram sozinhas, até 30 dias, ou com logout manual). Reconfirmar
      // aqui — antes de qualquer render — fecha essa janela por completo,
      // sem o problema de fuga de conteúdo que um redirect() disparado num
      // layout (depois do streaming já ter começado) teria.
      if (isLoggedIn && auth?.user && !isDemoUser(auth.user.id) && (isAdminRoute || isStudentRoute)) {
        const fresh = await prisma.user.findUnique({ where: { id: auth.user.id }, select: { isBlocked: true } }).catch(() => null)
        if (fresh?.isBlocked) {
          return Response.redirect(new URL('/login?blocked=true', nextUrl))
        }
      }

      if (
        isAdminRoute &&
        role !== 'ADMIN' &&
        role !== 'INSTRUCTOR' &&
        role !== 'DIRECTOR' &&
        role !== 'TENANT_ADMIN'
      ) {
        return Response.redirect(new URL('/student', nextUrl))
      }

      // ADMIN e DIRECTOR têm exatamente a mesma autoridade (não há painel
      // "Director" separado — ver lib/constants/roles.ts) mas só um dos dois
      // pode gerir sub-admins, não INSTRUCTOR nem TENANT_ADMIN.
      if (isAdminRoute && nextUrl.pathname.startsWith('/admin/sub-admins') && !(role && SUPERADMIN_ROLES.includes(role))) {
        return Response.redirect(new URL('/admin', nextUrl))
      }

      // Acesso por módulo /admin/* — TENANT_ADMIN só o que lhe foi atribuído,
      // INSTRUCTOR nunca tem módulo nenhum (hasModuleAccess devolve sempre
      // false para este papel, por desenho). Feito aqui (middleware), não num
      // layout aninhado: um redirect() disparado num layout profundo, depois
      // de a resposta já começar a fazer streaming (o que loading.tsx
      // provoca), degrada para um <meta refresh> em vez de um 307 real —
      // chegando a enviar o conteúdo da página ao browser antes de
      // redirecionar. No middleware isto nunca acontece, corre sempre antes
      // de qualquer render.
      if (isAdminRoute && (role === 'TENANT_ADMIN' || role === 'INSTRUCTOR') && auth?.user) {
        const requiredModule = getModuleForPath(nextUrl.pathname)
        if (requiredModule && !hasModuleAccess(auth.user, requiredModule)) {
          return Response.redirect(new URL('/admin', nextUrl))
        }
      }

      return true
    },
  },
} satisfies NextAuthConfig
