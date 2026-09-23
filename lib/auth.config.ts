import type { NextAuthConfig } from 'next-auth'
import type { AppRole } from '@/lib/constants/roles'

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
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as AppRole
      }
      return session
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const role = auth?.user?.role

      const isDirectorRoute = nextUrl.pathname.startsWith('/director')
      const isAdminRoute = nextUrl.pathname.startsWith('/admin')
      const isStudentRoute = nextUrl.pathname.startsWith('/student')

      if (!isLoggedIn && (isAdminRoute || isStudentRoute || isDirectorRoute)) {
        return false
      }

      if (isDirectorRoute && role !== 'DIRECTOR') {
        return Response.redirect(new URL('/student', nextUrl))
      }

      if (isAdminRoute && role !== 'ADMIN' && role !== 'INSTRUCTOR' && role !== 'DIRECTOR') {
        return Response.redirect(new URL('/student', nextUrl))
      }

      return true
    },
  },
} satisfies NextAuthConfig
