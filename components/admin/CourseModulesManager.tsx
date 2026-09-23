'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { createLesson, createModule, deleteLesson, deleteModule } from '@/lib/actions/admin/courses'
import { formatDuration } from '@/lib/format'

interface Lesson {
  id: string
  title: string
  duration: number
  order: number
  isFree: boolean
}

interface CourseModule {
  id: string
  title: string
  order: number
  lessons: Lesson[]
}

export function CourseModulesManager({ courseId, modules }: { courseId: string; modules: CourseModule[] }) {
  return (
    <div className="space-y-4">
      {modules.map((courseModule) => (
        <ModuleCard key={courseModule.id} courseId={courseId} module={courseModule} />
      ))}
      <AddModuleForm courseId={courseId} nextOrder={modules.length + 1} />
    </div>
  )
}

function ModuleCard({ courseId, module: courseModule }: { courseId: string; module: CourseModule }) {
  const [isPending, startTransition] = useTransition()
  const [showAddLesson, setShowAddLesson] = useState(false)

  function handleDeleteModule() {
    if (!confirm(`Apagar o módulo "${courseModule.title}" e todas as suas aulas?`)) return
    startTransition(async () => {
      try {
        await deleteModule(courseId, courseModule.id)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Não foi possível apagar.')
      }
    })
  }

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">
          {courseModule.order}. {courseModule.title}
        </h3>
        <button
          type="button"
          onClick={handleDeleteModule}
          disabled={isPending}
          className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
          aria-label="Apagar módulo"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="mt-3 space-y-1">
        {courseModule.lessons.map((lesson) => (
          <LessonRow key={lesson.id} courseId={courseId} lesson={lesson} />
        ))}
        {courseModule.lessons.length === 0 && <p className="text-sm text-slate-400">Sem aulas ainda.</p>}
      </div>

      {showAddLesson ? (
        <AddLessonForm
          courseId={courseId}
          moduleId={courseModule.id}
          nextOrder={courseModule.lessons.length + 1}
          onDone={() => setShowAddLesson(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setShowAddLesson(true)}
          className="mt-3 flex min-h-9 items-center gap-1 text-sm font-semibold text-violet-600 hover:text-violet-800"
        >
          <Plus size={14} /> Adicionar aula
        </button>
      )}
    </div>
  )
}

function LessonRow({ courseId, lesson }: { courseId: string; lesson: Lesson }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm(`Apagar a aula "${lesson.title}"?`)) return
    startTransition(async () => {
      try {
        await deleteLesson(courseId, lesson.id)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Não foi possível apagar.')
      }
    })
  }

  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-slate-50">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-100 text-xs text-slate-500">
        {lesson.order}
      </span>
      <span className="flex-1 text-slate-700">{lesson.title}</span>
      {lesson.isFree && <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700">GRÁTIS</span>}
      <span className="text-xs text-slate-400">{formatDuration(lesson.duration)}</span>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
        aria-label="Apagar aula"
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}

function AddModuleForm({ courseId, nextOrder }: { courseId: string; nextOrder: number }) {
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await createModule(courseId, formData)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Não foi possível adicionar o módulo.')
      }
    })
  }

  return (
    <form action={handleSubmit} className="flex gap-2 rounded-3xl border border-dashed border-slate-200 p-4">
      <input type="hidden" name="order" value={nextOrder} />
      <input
        name="title"
        placeholder="Título do novo módulo"
        required
        className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
      />
      <button
        type="submit"
        disabled={isPending}
        className="flex min-h-11 items-center gap-1 rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
      >
        <Plus size={15} /> Módulo
      </button>
    </form>
  )
}

function AddLessonForm({
  courseId,
  moduleId,
  nextOrder,
  onDone,
}: {
  courseId: string
  moduleId: string
  nextOrder: number
  onDone: () => void
}) {
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await createLesson(courseId, moduleId, formData)
        onDone()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Não foi possível adicionar a aula.')
      }
    })
  }

  return (
    <form action={handleSubmit} className="mt-3 space-y-2 rounded-xl border border-dashed border-slate-200 p-3">
      <input type="hidden" name="order" value={nextOrder} />
      <input
        name="title"
        placeholder="Título da aula"
        required
        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-violet-500"
      />
      <div className="flex gap-2">
        <input
          name="youtubeVideoId"
          placeholder="ID do vídeo no YouTube"
          required
          className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-violet-500"
        />
        <input
          name="duration"
          type="number"
          min="0"
          placeholder="Duração (s)"
          required
          className="h-10 w-32 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-violet-500"
        />
      </div>
      <label className="flex items-center gap-2 text-xs text-slate-500">
        <input type="checkbox" name="isFree" className="h-4 w-4 rounded border-slate-300" />
        Aula grátis (amostra)
      </label>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex min-h-9 items-center rounded-lg bg-violet-600 px-3 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
        >
          {isPending ? '...' : 'Adicionar'}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="flex min-h-9 items-center rounded-lg px-3 text-xs font-semibold text-slate-500 hover:bg-slate-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
