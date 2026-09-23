import { prisma } from '@/lib/prisma'

export const DEFAULT_HERO = {
  title: 'Eleve o seu inglês ao próximo nível.',
  subtitle:
    'Método imersivo e prático baseado em situações do cotidiano. Aprenda a se comunicar com confiança, onde quer que esteja.',
}

export const DEFAULT_TESTIMONIALS = [
  { id: 'default-1', authorName: 'Mariana Costa', content: 'Em 3 meses já consegui fazer entrevistas em inglês sem travar. O método é muito diferente!', rating: 5 },
  { id: 'default-2', authorName: 'André Pereira', content: 'As aulas são diretas ao ponto e cabem na minha rotina. Finalmente sinto que estou avançando.', rating: 5 },
  { id: 'default-3', authorName: 'João Lima', content: 'A comunidade me deu a confiança que faltava para conversar no trabalho.', rating: 5 },
]

/**
 * A landing page é pública (visitantes anônimos, sem sessão) — por isso não
 * há um "modo demo" aqui como no dashboard. Se o banco estiver indisponível,
 * caímos silenciosamente para o conteúdo padrão em vez de derrubar a página.
 */
export async function getHeroContent() {
  try {
    const content = await prisma.cMSContent.findFirst({
      where: { page: 'landing', contentType: 'HERO', isActive: true },
    })
    if (!content) return DEFAULT_HERO
    return { title: content.title, subtitle: content.subtitle ?? DEFAULT_HERO.subtitle }
  } catch {
    return DEFAULT_HERO
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
