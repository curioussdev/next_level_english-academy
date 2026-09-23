import Link from 'next/link'
import { BookOpen, Clock3, Play, Sparkles, Trophy } from 'lucide-react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDuration } from '@/lib/format'

export default async function StudentPage() {
  const session = await auth()
  const userId = session!.user.id
  const firstName = session?.user?.name?.split(' ')[0] ?? 'aluno'

  const [enrolledCount, completedCount, timeWatchedAgg, lastProgress] = await Promise.all([
    prisma.enrollment.count({ where: { userId, status: 'ACTIVE' } }),
    prisma.lessonProgress.count({ where: { userId, isCompleted: true } }),
    prisma.lessonProgress.aggregate({ where: { userId }, _sum: { totalTimeWatched: true } }),
    prisma.lessonProgress.findFirst({
      where: { userId, isCompleted: false },
      orderBy: { updatedAt: 'desc' },
      include: { lesson: { include: { module: { include: { course: true } } } } },
    }),
  ])

  const totalTimeWatched = timeWatchedAgg._sum.totalTimeWatched ?? 0

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-slate-400">Bem-vindo de volta</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Olá, {firstName}!</h1>
          <p className="mt-2 text-slate-500">Pronto para dar mais um passo hoje?</p>
        </div>
        {lastProgress ? (
          <Link
            href={`/student/lesson/${lastProgress.lessonId}`}
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 hover:bg-violet-700"
          >
            <Play size={16} fill="currentColor" /> Continuar: {lastProgress.lesson.title}
          </Link>
        ) : (
          <Link
            href="/student/courses"
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 hover:bg-violet-700"
          >
            Explorar cursos
          </Link>
        )}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat
          icon={<BookOpen />}
          label="Cursos matriculados"
          value={String(enrolledCount)}
          detail={enrolledCount === 0 ? 'Explore o catálogo' : 'Ativos'}
          color="violet"
        />
        <Stat
          icon={<Clock3 />}
          label="Tempo de estudo"
          value={formatDuration(totalTimeWatched)}
          detail="Total acumulado"
          color="orange"
        />
        <Stat
          icon={<Trophy />}
          label="Aulas concluídas"
          value={String(completedCount)}
          detail={completedCount === 0 ? 'Nenhuma ainda' : 'No total'}
          color="teal"
        />
      </div>

      {enrolledCount === 0 && (
        <div className="mt-10 rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-100">
          <Sparkles className="mx-auto text-violet-400" size={28} />
          <h2 className="mt-4 text-lg font-bold">Ainda sem cursos matriculados</h2>
          <p className="mt-2 text-sm text-slate-500">Assim que se inscrever num curso, o seu progresso aparece aqui.</p>
        </div>
      )}
    </div>
  )
}

function Stat({
  icon,
  label,
  value,
  detail,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  detail: string
  color: 'orange' | 'violet' | 'teal'
}) {
  const toneClass =
    color === 'orange' ? 'bg-orange-100 text-orange-600' : color === 'teal' ? 'bg-teal-100 text-teal-600' : 'bg-violet-100 text-violet-600'

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <span className={`grid h-9 w-9 place-items-center rounded-xl ${toneClass}`}>{icon}</span>
      <p className="mt-5 text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{detail}</p>
    </div>
  )
}
