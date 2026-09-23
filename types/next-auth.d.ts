import type { DefaultSession } from 'next-auth'
import type { AppRole } from '@/lib/constants/roles'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: AppRole
      permissions: string[]
    } & DefaultSession['user']
  }

  interface User {
    role: AppRole
    permissions?: string[]
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: AppRole
    permissions: string[]
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string
    role: AppRole
    permissions: string[]
  }
}
