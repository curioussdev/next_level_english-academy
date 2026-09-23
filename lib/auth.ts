import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { authConfig } from '@/lib/auth.config'
import { logActivity } from '@/lib/activity'
import type { AppRole } from '@/lib/constants/roles'

/**
 * Contas demo (mesmos emails/senha do prisma/seed.ts) usadas como fallback
 * quando o Prisma falha por não conseguir alcançar o banco — permite
 * navegar pelo dashboard antes do Supabase estar configurado.
 *
 * Duas travas independentes, de propósito: NODE_ENV!=='production' sozinho
 * não é confiável (setups self-hosted/Docker podem esquecer de o definir).
 * Exigir também DEMO_MODE==='true' explícito significa que um ambiente real
 * mal configurado ainda fica fechado por omissão — e as credenciais demo
 * ficam visíveis na própria página de login, então isto tem de falhar
 * fechado por padrão, não aberto.
 */
const DEMO_LOGIN_ENABLED = process.env.NODE_ENV !== 'production' && process.env.DEMO_MODE === 'true'
const DEMO_PASSWORD = 'password123'
const DEMO_USERS: Record<string, { id: string; name: string; email: string; role: AppRole }> = {
  'aluno@nextlevel.pt': { id: 'demo-student', name: 'Aluno Demo', email: 'aluno@nextlevel.pt', role: 'STUDENT' },
  'admin@nextlevel.pt': { id: 'demo-admin', name: 'Admin Demo', email: 'admin@nextlevel.pt', role: 'ADMIN' },
  'ralde@nextlevel.pt': { id: 'demo-director', name: 'Ralde Sicato', email: 'ralde@nextlevel.pt', role: 'DIRECTOR' },
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Palavra-passe', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined
        const password = credentials?.password as string | undefined
        if (!email || !password) return null

        try {
          const user = await prisma.user.findUnique({ where: { email } })
          if (!user?.password) return null

          const isValid = await bcrypt.compare(password, user.password)
          if (!isValid) return null

          if (user.isBlocked) return null

          return { id: user.id, email: user.email, name: user.name, role: user.role }
        } catch (err) {
          if (DEMO_LOGIN_ENABLED) {
            const demoUser = DEMO_USERS[email]
            if (demoUser && password === DEMO_PASSWORD) {
              console.warn(`[auth] Banco indisponível — sessão demo para ${email}.`)
              return demoUser
            }
          }
          throw err
        }
      },
    }),
  ],
  events: {
    async signIn({ user }) {
      if (!user.id) return
      await Promise.all([
        prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }).catch(() => {}),
        logActivity(user.id, 'LOGIN'),
      ])
    },
  },
})
