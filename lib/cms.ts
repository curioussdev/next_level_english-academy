import { prisma } from '@/lib/prisma'
import type { LandingIconKey } from '@/lib/landing-icons'

export const DEFAULT_HERO = {
  eyebrow: 'Inglês que acontece na vida real',
  title: 'Eleve o seu inglês ao próximo nível.',
  subtitle:
    'Método imersivo e prático baseado em situações do cotidiano. Aprenda a se comunicar com confiança, onde quer que esteja.',
  statText: '+2.000 alunos já estão evoluindo',
}

export const DEFAULT_TESTIMONIALS = [
  { id: 'default-1', authorName: 'Mariana Costa', content: 'Em 3 meses já consegui fazer entrevistas em inglês sem travar. O método é muito diferente!', rating: 5 },
  { id: 'default-2', authorName: 'André Pereira', content: 'As aulas são diretas ao ponto e cabem na minha rotina. Finalmente sinto que estou avançando.', rating: 5 },
  { id: 'default-3', authorName: 'João Lima', content: 'A comunidade me deu a confiança que faltava para conversar no trabalho.', rating: 5 },
]

export type FeatureItem = { icon: LandingIconKey; title: string; text: string }

export const DEFAULT_FEATURES: {
  eyebrow: string
  headingMain: string
  headingHighlight: string
  paragraph: string
  calloutTitle: string
  calloutText: string
  items: FeatureItem[]
} = {
  eyebrow: 'Por que Next Level?',
  headingMain: 'Inglês para usar,',
  headingHighlight: 'não só estudar.',
  paragraph: 'Você aprende com contexto, repetição e prática. O inglês deixa de ser uma matéria e passa a fazer parte da sua rotina.',
  calloutTitle: 'Método testado e aprovado',
  calloutText: 'Conteúdo criado para resultados reais.',
  items: [
    { icon: 'video', title: 'Aulas práticas', text: 'Vídeos curtos e objetivos para você aprender fazendo.' },
    { icon: 'chart', title: 'Seu progresso', text: 'Acompanhe sua evolução e mantenha a motivação.' },
    { icon: 'headphones', title: 'No seu ritmo', text: 'Estude de onde estiver, pelo celular ou computador.' },
    { icon: 'users', title: 'Comunidade', text: 'Pratique com pessoas que estão no mesmo caminho.' },
  ],
}

export type StepItem = { title: string; text: string }

export const DEFAULT_STEPS: { eyebrow: string; heading: string; items: StepItem[] } = {
  eyebrow: 'Como funciona',
  heading: 'Seu próximo nível em 4 passos',
  items: [
    { title: 'Escolha seu plano', text: 'Comece com o plano que faz sentido para você.' },
    { title: 'Acesse as aulas', text: 'Tenha tudo organizado em uma única plataforma.' },
    { title: 'Aprenda no seu ritmo', text: 'Estude quando e onde quiser, sem pressão.' },
    { title: 'Pratique de verdade', text: 'Use o inglês em situações reais do dia a dia.' },
  ],
}

export const DEFAULT_PRICING_INTRO = {
  eyebrow: 'Planos simples',
  heading: 'Invista no seu futuro.',
  subtitle: 'Comece hoje. Cancele quando quiser. Sem letras miúdas.',
}

export const DEFAULT_TESTIMONIALS_HEADER = {
  eyebrow: 'Quem já evoluiu',
  heading: 'A próxima história pode ser a sua.',
  ratingText: '4.9/5 pelos alunos',
}

export const DEFAULT_FOOTER = {
  copyrightText: '© 2024 Next Level. Aprenda. Pratique. Evolua.',
}

/**
 * A landing page é pública (visitantes anônimos, sem sessão) — por isso não
 * há um "modo demo" aqui como no dashboard. Se o banco estiver indisponível
 * ou a linha ainda não existir, caímos silenciosamente para o conteúdo
 * padrão em vez de derrubar a página.
 */
export async function getHeroContent() {
  try {
    const content = await prisma.cMSContent.findFirst({
      where: { page: 'landing', contentType: 'HERO', isActive: true },
    })
    if (!content) return DEFAULT_HERO
    const body = (content.body as Partial<Pick<typeof DEFAULT_HERO, 'eyebrow' | 'statText'>>) ?? {}
    return {
      eyebrow: body.eyebrow ?? DEFAULT_HERO.eyebrow,
      title: content.title ?? DEFAULT_HERO.title,
      subtitle: content.subtitle ?? DEFAULT_HERO.subtitle,
      statText: body.statText ?? DEFAULT_HERO.statText,
    }
  } catch {
    return DEFAULT_HERO
  }
}

export async function getFeaturesContent() {
  try {
    const content = await prisma.cMSContent.findFirst({
      where: { page: 'landing', contentType: 'FEATURES', isActive: true },
    })
    if (!content?.body) return DEFAULT_FEATURES
    const body = content.body as Partial<typeof DEFAULT_FEATURES>
    return {
      eyebrow: body.eyebrow ?? DEFAULT_FEATURES.eyebrow,
      headingMain: body.headingMain ?? DEFAULT_FEATURES.headingMain,
      headingHighlight: body.headingHighlight ?? DEFAULT_FEATURES.headingHighlight,
      paragraph: body.paragraph ?? DEFAULT_FEATURES.paragraph,
      calloutTitle: body.calloutTitle ?? DEFAULT_FEATURES.calloutTitle,
      calloutText: body.calloutText ?? DEFAULT_FEATURES.calloutText,
      items: body.items && body.items.length === 4 ? body.items : DEFAULT_FEATURES.items,
    }
  } catch {
    return DEFAULT_FEATURES
  }
}

export async function getStepsContent() {
  try {
    const content = await prisma.cMSContent.findFirst({
      where: { page: 'landing', contentType: 'STEPS', isActive: true },
    })
    if (!content?.body) return DEFAULT_STEPS
    const body = content.body as Partial<typeof DEFAULT_STEPS>
    return {
      eyebrow: body.eyebrow ?? DEFAULT_STEPS.eyebrow,
      heading: body.heading ?? DEFAULT_STEPS.heading,
      items: body.items && body.items.length === 4 ? body.items : DEFAULT_STEPS.items,
    }
  } catch {
    return DEFAULT_STEPS
  }
}

export async function getPricingIntro() {
  try {
    const content = await prisma.cMSContent.findFirst({
      where: { page: 'landing', contentType: 'PRICING', isActive: true },
    })
    if (!content) return DEFAULT_PRICING_INTRO
    const body = (content.body as Partial<Pick<typeof DEFAULT_PRICING_INTRO, 'eyebrow'>>) ?? {}
    return {
      eyebrow: body.eyebrow ?? DEFAULT_PRICING_INTRO.eyebrow,
      heading: content.title ?? DEFAULT_PRICING_INTRO.heading,
      subtitle: content.subtitle ?? DEFAULT_PRICING_INTRO.subtitle,
    }
  } catch {
    return DEFAULT_PRICING_INTRO
  }
}

export async function getTestimonialsHeader() {
  try {
    const content = await prisma.cMSContent.findFirst({
      where: { page: 'landing', contentType: 'TESTIMONIALS', isActive: true },
    })
    if (!content) return DEFAULT_TESTIMONIALS_HEADER
    const body = (content.body as Partial<Pick<typeof DEFAULT_TESTIMONIALS_HEADER, 'eyebrow' | 'ratingText'>>) ?? {}
    return {
      eyebrow: body.eyebrow ?? DEFAULT_TESTIMONIALS_HEADER.eyebrow,
      heading: content.title ?? DEFAULT_TESTIMONIALS_HEADER.heading,
      ratingText: body.ratingText ?? DEFAULT_TESTIMONIALS_HEADER.ratingText,
    }
  } catch {
    return DEFAULT_TESTIMONIALS_HEADER
  }
}

export async function getFooterContent() {
  try {
    const content = await prisma.cMSContent.findFirst({
      where: { page: 'landing', contentType: 'FOOTER', isActive: true },
    })
    if (!content?.title) return DEFAULT_FOOTER
    return { copyrightText: content.title }
  } catch {
    return DEFAULT_FOOTER
  }
}

export async function getTestimonials() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 3,
    })
    if (testimonials.length === 0) return DEFAULT_TESTIMONIALS
    return testimonials.map((t) => ({ id: t.id, authorName: t.authorName, content: t.content, rating: t.rating }))
  } catch {
    return DEFAULT_TESTIMONIALS
  }
}
