import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canManageUser } from '@/lib/constants/roles'
import { isDemoUser } from '@/lib/demo'
import { EditStudentForm } from '@/components/admin/EditStudentForm'

export default async function EditStudentPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  const session = await auth()

  if (isDemoUser(session!.user.id)) notFound()

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      bio: true,
      dateOfBirth: true,
      country: true,
      city: true,
      currentLevel: true,
      learningGoals: true,
      nif: true,
    },
  })

  if (!user) notFound()
  if (!canManageUser(session!.user.role, user.role)) notFound()

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`/admin/students/${user.id}`}
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900"
      >
        <ArrowLeft size={16} /> {user.name ?? user.email}
      </Link>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">Editar perfil</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">Todos os campos, incluindo o NIF — só o staff pode corrigi-lo.</p>

      <EditStudentForm
        userId={user.id}
        initial={{
          name: user.name ?? '',
          phone: user.phone ?? '',
          bio: user.bio ?? '',
          dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString().slice(0, 10) : '',
          country: user.country ?? '',
          city: user.city ?? '',
          currentLevel: user.currentLevel ?? '',
          learningGoals: user.learningGoals ?? '',
          nif: user.nif ?? '',
        }}
      />
    </div>
  )
}
