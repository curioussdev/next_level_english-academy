import { Star } from 'lucide-react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TestimonialActions } from '@/components/admin/TestimonialActions'
import { NewTestimonialForm } from '@/components/admin/NewTestimonialForm'
import { DEMO_TESTIMONIALS, isDemoUser } from '@/lib/demo'
import { safeQuery } from '@/lib/db-safe'

export default async function AdminTestimonialsPage() {
  const session = await auth()
  const userId = session!.user.id

  const testimonials = isDemoUser(userId)
    ? DEMO_TESTIMONIALS
    : await safeQuery(
        () =>
          prisma.testimonial.findMany({
            orderBy: { createdAt: 'desc' },
            select: { id: true, authorName: true, content: true, rating: true, isActive: true },
          }),
        [],
        'lista de depoimentos',
      )

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight">Depoimentos</h1>
      <p className="mt-2 text-muted-foreground">Aparecem na landing page, do mais recente para o mais antigo.</p>

      <div className="mt-6">
        <NewTestimonialForm />
      </div>

      <div className="mt-6 space-y-3">
        {testimonials.map((t) => (
          <div key={t.id} className="flex items-start justify-between gap-4 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground">{t.authorName}</p>
                <span className="flex items-center gap-0.5 text-warning">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={12} fill="currentColor" />
                  ))}
                </span>
                {!t.isActive && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">OCULTO</span>}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{t.content}</p>
            </div>
            <TestimonialActions id={t.id} isActive={t.isActive} />
          </div>
        ))}
        {testimonials.length === 0 && <p className="text-sm text-muted-foreground">Ainda sem depoimentos.</p>}
      </div>
    </div>
  )
}
