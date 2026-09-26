import Link from 'next/link'
import { ArrowRight, MessageCircle, Play, ShieldCheck, Sparkles, Trophy } from 'lucide-react'
import { Logo } from '@/components/layout/Logo'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { PricingCard } from '@/components/landing/PricingCard'
import { PLANS } from '@/lib/plans'
import {
  getHeroContent,
  getTestimonials,
  getFeaturesContent,
  getStepsContent,
  getPricingIntro,
  getTestimonialsHeader,
  getFooterContent,
} from '@/lib/cms'
import { LANDING_ICONS } from '@/lib/landing-icons'

function WhatsApp() {
  return (
    <button
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-xl shadow-green-500/30 transition hover:scale-105"
    >
      <MessageCircle size={25} fill="currentColor" />
    </button>
  )
}

function TopNav() {
  return (
    <header className="absolute left-0 right-0 top-0 z-20">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#metodo" className="transition hover:text-foreground">
            O método
          </a>
          <a href="#planos" className="transition hover:text-foreground">
            Planos
          </a>
          <a href="#depoimentos" className="transition hover:text-foreground">
            Depoimentos
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login" className="hidden rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground sm:block">
            Entrar
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:opacity-90"
          >
            Começar agora
          </Link>
        </div>
      </div>
    </header>
  )
}

export default async function Page() {
  const [hero, testimonials, features, steps, pricingIntro, testimonialsHeader, footer] = await Promise.all([
    getHeroContent(),
    getTestimonials(),
    getFeaturesContent(),
    getStepsContent(),
    getPricingIntro(),
    getTestimonialsHeader(),
    getFooterContent(),
  ])

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 75% 20%, color-mix(in oklab, var(--brand-purple) 22%, transparent), transparent 40%), radial-gradient(circle at 15% 85%, color-mix(in oklab, var(--brand-blue) 16%, transparent), transparent 35%)',
          }}
        />
        <TopNav />
        <div className="relative mx-auto grid min-h-[720px] max-w-7xl items-center gap-14 px-5 pb-16 pt-32 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:pb-24">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <Sparkles size={14} /> {hero.eyebrow}
            </div>
            <h1 className="max-w-xl text-5xl font-bold leading-[1.02] tracking-[-.04em] sm:text-6xl lg:text-[72px]">{hero.title}</h1>
            <p className="mt-7 max-w-lg text-lg leading-8 text-muted-foreground">{hero.subtitle}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="group flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-semibold text-primary-foreground shadow-xl shadow-primary/25 transition hover:opacity-90"
              >
                Começar agora <ArrowRight size={18} className="transition group-hover:translate-x-1" />
              </Link>
              <a
                href="#planos"
                className="flex items-center justify-center rounded-full border border-border px-6 py-3.5 font-semibold text-foreground transition hover:bg-muted"
              >
                Ver planos
              </a>
            </div>
            <div className="mt-10 flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-background bg-orange-200 text-xs text-orange-900">JS</span>
                <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-background bg-blue-200 text-xs text-blue-900">MA</span>
                <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-background bg-teal-200 text-xs text-teal-900">RL</span>
              </div>
              <span>{hero.statText}</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[510px]">
            <div className="absolute -right-4 top-2 h-64 w-64 rounded-full bg-primary/25 blur-3xl" />
            <div className="relative overflow-hidden rounded-[32px] border border-border bg-card p-3 shadow-2xl">
              <div className="relative flex aspect-[4/3] items-end overflow-hidden rounded-[24px] bg-gradient-to-br from-violet-600 via-blue-600 to-slate-900 p-7 text-white">
                <div className="absolute -right-8 -top-12 h-48 w-48 rounded-full border-[26px] border-white/10" />
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="relative">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-violet-600">
                    <Play size={20} fill="currentColor" />
                  </div>
                  <p className="text-xs font-medium uppercase tracking-widest text-white/60">Aula em destaque</p>
                  <h3 className="mt-1 text-2xl font-semibold">At the coffee shop</h3>
                </div>
                <div className="absolute right-5 top-5 rounded-xl bg-white/15 px-3 py-2 text-xs backdrop-blur-md">
                  Aula 08 <span className="ml-2 text-teal-300">● Ao vivo</span>
                </div>
              </div>
              <div className="flex items-center justify-between px-3 pb-1 pt-4">
                <div>
                  <p className="text-xs text-muted-foreground">Seu progresso</p>
                  <p className="text-sm font-semibold text-card-foreground">English for Everyday Life</p>
                </div>
                <span className="text-sm font-bold text-primary">52%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[52%] rounded-full bg-gradient-to-r from-violet-500 to-blue-500" />
              </div>
            </div>
            <div className="absolute -left-10 bottom-10 hidden items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-xl sm:flex">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-400">
                <Trophy size={20} />
              </span>
              <div>
                <p className="text-xs text-muted-foreground">Conquista desbloqueada</p>
                <p className="text-sm font-semibold text-card-foreground">7 dias seguidos!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Método */}
      <section id="metodo" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <div className="grid gap-14 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.18em] text-primary">{features.eyebrow}</p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              {features.headingMain} <span className="text-primary">{features.headingHighlight}</span>
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-muted-foreground">{features.paragraph}</p>
            <div className="mt-8 flex items-center gap-4 border-t border-border pt-6">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck size={23} />
              </div>
              <div>
                <p className="font-semibold">{features.calloutTitle}</p>
                <p className="text-sm text-muted-foreground">{features.calloutText}</p>
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {features.items.map((item, i) => {
              const Icon = LANDING_ICONS[item.icon]
              return <Feature key={i} icon={<Icon />} title={item.title} text={item.text} />
            })}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="border-y border-border bg-muted/40 px-5 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-sm font-bold uppercase tracking-[.18em] text-primary">{steps.eyebrow}</p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight">{steps.heading}</h2>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-4">
            {steps.items.map((step, i) => (
              <div key={i} className="relative rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border">
                <span className="text-4xl font-bold text-primary/20">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-5 text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.18em] text-primary">{pricingIntro.eyebrow}</p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight">{pricingIntro.heading}</h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-muted-foreground">{pricingIntro.subtitle}</p>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>
      </section>

      {/* Depoimentos — sem truque de inversão: segue os mesmos tokens do resto
          da página, só com bg-muted para se destacar como banda de destaque.
          Mais previsível do que inverter cores conforme o tema. */}
      <section id="depoimentos" className="border-y border-border bg-muted/60 px-5 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[.18em] text-primary">{testimonialsHeader.eyebrow}</p>
              <h2 className="mt-3 text-4xl font-bold tracking-tight">{testimonialsHeader.heading}</h2>
            </div>
            <div className="flex text-amber-500 dark:text-amber-400">
              ★★★★★ <span className="ml-2 text-sm text-muted-foreground">{testimonialsHeader.ratingText}</span>
            </div>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.id} className="rounded-3xl border border-border bg-card p-6 text-card-foreground">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-violet-400 to-blue-400 text-sm font-bold text-white">
                    {initials(t.authorName)}
                  </span>
                  <div>
                    <p className="font-semibold">{t.authorName}</p>
                    <p className="text-xs text-muted-foreground">Aluno Next Level</p>
                  </div>
                </div>
                <p className="mt-6 leading-7 text-muted-foreground">“{t.content}”</p>
                <div className="mt-5 flex items-center gap-2 text-xs text-accent">
                  <ArrowRight size={14} /> Evoluiu do básico ao intermediário
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-background px-5 pb-10 pt-2 text-foreground">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 border-t border-border pt-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <Logo />
          <p>{footer.copyrightText}</p>
        </div>
      </footer>
      <WhatsApp />
    </div>
  )
}

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">{icon}</div>
      <h3 className="mt-5 font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  )
}
