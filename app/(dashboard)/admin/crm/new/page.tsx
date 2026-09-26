import { prisma } from '@/lib/prisma'
import { STAFF_ROLES } from '@/lib/constants/roles'
import { safeQuery } from '@/lib/db-safe'
import { NewLeadForm } from '@/components/admin/NewLeadForm'

export default async function NewLeadPage() {
  const staff = await safeQuery(
    () => prisma.user.findMany({ where: { role: { in: STAFF_ROLES } }, select: { id: true, name: true, email: true } }),
    [],
    'lista de responsáveis',
  )
  const staffOptions = staff.map((s) => ({ id: s.id, name: s.name ?? s.email }))

  return <NewLeadForm staffOptions={staffOptions} />
}
