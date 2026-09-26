'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { setUserRole } from '@/lib/actions/admin/users'
import type { AppRole } from '@/lib/constants/roles'

const ROLE_OPTIONS: AppRole[] = ['STUDENT', 'INSTRUCTOR', 'TENANT_ADMIN', 'ADMIN', 'DIRECTOR']

export function RoleSelect({ userId, currentRole }: { userId: string; currentRole: AppRole }) {
  const [isPending, startTransition] = useTransition()

  function handleChange(role: AppRole) {
    startTransition(async () => {
      try {
        await setUserRole(userId, role)
        toast.success(`Role atualizada para ${role}.`)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Não foi possível atualizar.')
      }
    })
  }

  return (
    <select
      defaultValue={currentRole}
      disabled={isPending}
      onChange={(e) => handleChange(e.target.value as AppRole)}
      className="mt-1 h-9 rounded-lg border border-border bg-card px-2 text-sm text-foreground outline-none focus:border-primary disabled:opacity-60"
    >
      {ROLE_OPTIONS.map((role) => (
        <option key={role} value={role}>
          {role}
        </option>
      ))}
    </select>
  )
}
