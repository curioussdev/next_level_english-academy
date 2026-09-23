import type { NextAuthConfig } from 'next-auth'
import type { AppRole } from '@/lib/constants/roles'
import { SUPERADMIN_ROLES, getModuleForPath } from '@/lib/constants/roles'

/**
 * Config edge-safe (sem Prisma Adapter nem Credentials/bcrypt), usada pelo
 * middleware. O middleware corre no Edge Runtime, onde o Prisma Client com
 * engine nativa não funciona — por isso a config completa (lib/auth.ts) fica
 * separada e só é usada em rotas/Server Actions Node.js.
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
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const role = auth?.user?.role

      const isAdminRoute = nextUrl.pathname.startsWith('/admin')
      const isStudentRoute = nextUrl.pathname.startsWith('/student')

      if (!isLoggedIn && (isAdminRoute || isStudentRoute)) {
        return false
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

      // TENANT_ADMIN só acede aos módulos /admin/* que lhe foram atribuídos.
      // Feito aqui (middleware), não num layout aninhado: um redirect() disparado
      // num layout profundo, depois de a resposta já começar a fazer streaming
      // (o que loading.tsx provoca), degrada para um <meta refresh> em vez de um
      // 307 real — chegando a enviar o conteúdo da página ao browser antes de
      // redirecionar. No middleware isto nunca acontece, corre sempre antes de
      // qualquer render.
      if (isAdminRoute && role === 'TENANT_ADMIN') {
        const requiredModule = getModuleForPath(nextUrl.pathname)
        const permissions = auth?.user?.permissions ?? []
        if (requiredModule && !permissions.includes(requiredModule)) {
          return Response.redirect(new URL('/admin', nextUrl))
        }
      }

      return true
    },
  },
} satisfies NextAuthConfig
