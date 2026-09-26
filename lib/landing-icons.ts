import { Award, BarChart3, BookOpen, Clock, Headphones, ShieldCheck, Sparkles, Trophy, Users, Video } from 'lucide-react'

/**
 * Lista branca fixa de ícones que os cartões da landing page podem usar.
 * O admin escolhe por chave (`<select>`), nunca por nome livre — evita
 * qualquer resolução dinâmica de componente a partir de input do utilizador.
 */
export const LANDING_ICONS = {
  video: Video,
  chart: BarChart3,
  headphones: Headphones,
  users: Users,
  sparkles: Sparkles,
  shield: ShieldCheck,
  trophy: Trophy,
  book: BookOpen,
  award: Award,
  clock: Clock,
} as const

export type LandingIconKey = keyof typeof LANDING_ICONS

export const ICON_KEYS = Object.keys(LANDING_ICONS) as LandingIconKey[]
