import { buildMonthBuckets } from '@/lib/date-buckets'

/**
 * Dados fictícios para navegar pelo dashboard quando o Prisma não consegue
 * alcançar o banco (Supabase ainda não configurado). Só entra em jogo para
 * as sessões criadas pelo fallback demo em lib/auth.ts (ids "demo-*").
 * Assim que o banco estiver conectado, os logins passam a ser reais e este
 * caminho deixa de ser usado — nada aqui é lido a partir do Prisma.
 */
export function isDemoUser(userId: string) {
  return userId.startsWith('demo-')
}

export const DEMO_LESSON_ID = 'demo-lesson-1'

export const DEMO_DASHBOARD_STATS = {
  enrolledCount: 2,
  completedCount: 3,
  totalTimeWatched: 5420, // segundos
  continueLesson: { lessonId: DEMO_LESSON_ID, title: 'Making small talk' },
}

export const DEMO_COURSE_CATALOG = {
  enrolled: [
    {
      id: 'demo-enrollment-1',
      courseTitle: 'English for Everyday Life',
      level: 'Beginner',
      percentage: 42,
      firstLessonId: DEMO_LESSON_ID,
    },
    {
      id: 'demo-enrollment-2',
      courseTitle: 'Pronunciation Lab',
      level: 'Intermediate',
      percentage: 15,
      firstLessonId: 'demo-lesson-3',
    },
  ],
  available: [
    {
      id: 'demo-course-3',
      title: 'Business English Essentials',
      level: 'Advanced',
      description: 'Vocabulário e situações práticas para o ambiente de trabalho.',
      price: 149,
      currency: 'EUR',
    },
  ],
}

export const DEMO_PROGRESS = [
  {
    courseId: 'demo-course-1',
    courseTitle: 'English for Everyday Life',
    modules: [
      {
        id: 'demo-module-1',
        title: 'Módulo 1 — Primeiros passos',
        lessons: [
          { id: 'demo-lesson-0', title: 'Introductions & greetings', order: 1, isCompleted: true, totalTimeWatched: 640 },
          { id: DEMO_LESSON_ID, title: 'Making small talk', order: 2, isCompleted: false, totalTimeWatched: 210 },
          { id: 'demo-lesson-2', title: 'At the airport', order: 3, isCompleted: false, totalTimeWatched: 0 },
        ],
      },
    ],
  },
]

export const DEMO_ADMIN_STATS = {
  totalStudents: 248,
  activeEnrollments: 312,
  publishedCourses: 4,
  totalRevenueCents: 1842000, // 18.420 €
}

export const DEMO_USERS_LIST = [
  { id: 'demo-user-1', name: 'Mariana Costa', email: 'mariana@example.pt', role: 'STUDENT' as const, isBlocked: false, createdAt: new Date('2026-06-12') },
  { id: 'demo-user-2', name: 'André Pereira', email: 'andre@example.pt', role: 'STUDENT' as const, isBlocked: false, createdAt: new Date('2026-07-03') },
  { id: 'demo-user-3', name: 'Camila Souza', email: 'camila@example.pt', role: 'STUDENT' as const, isBlocked: true, createdAt: new Date('2026-05-20') },
  { id: 'demo-admin', name: 'Admin Demo', email: 'admin@nextlevel.pt', role: 'ADMIN' as const, isBlocked: false, createdAt: new Date('2026-01-10') },
  { id: 'demo-tenant-admin', name: 'Sub-admin Demo', email: 'subadmin@nextlevel.pt', role: 'TENANT_ADMIN' as const, isBlocked: false, createdAt: new Date('2026-02-01') },
]

export const DEMO_LEADS = [
  {
    id: 'demo-lead-1',
    name: 'Sofia Fernandes',
    email: 'sofia.fernandes@example.pt',
    phone: '+351 912 345 678',
    source: 'Instagram',
    status: 'NEW' as const,
    priority: 'HIGH',
    notes: 'Pediu informação sobre o plano Pro.',
    tags: [] as string[],
  },
  {
    id: 'demo-lead-2',
    name: 'Ricardo Nunes',
    email: 'ricardo.nunes@example.pt',
    phone: '+351 913 456 789',
    source: 'Google',
    status: 'CONTACTED' as const,
    priority: 'MEDIUM',
    notes: null,
    tags: [] as string[],
  },
  {
    id: 'demo-lead-3',
    name: 'Beatriz Lima',
    email: 'beatriz.lima@example.pt',
    phone: null,
    source: 'Referral',
    status: 'INTERESTED' as const,
    priority: 'HIGH',
    notes: 'Indicada pela Mariana Costa.',
    tags: [] as string[],
  },
  {
    id: 'demo-lead-4',
    name: 'Tiago Rocha',
    email: 'tiago.rocha@example.pt',
    phone: '+351 915 678 901',
    source: 'Facebook',
    status: 'FOLLOW_UP' as const,
    priority: 'LOW',
    notes: 'Vai decidir depois do fim do mês.',
    tags: [] as string[],
  },
  {
    id: 'demo-lead-5',
    name: 'Inês Cardoso',
    email: 'ines.cardoso@example.pt',
    phone: '+351 916 789 012',
    source: 'Instagram',
    status: 'ENROLLED' as const,
    priority: 'MEDIUM',
    notes: 'Matriculada no English for Everyday Life.',
    tags: [] as string[],
  },
  {
    id: 'demo-lead-6',
    name: 'Paulo Martins',
    email: 'paulo.martins@example.pt',
    phone: null,
    source: 'Google',
    status: 'LOST' as const,
    priority: 'LOW',
    notes: 'Optou por outro método.',
    tags: [] as string[],
  },
]

export const DEMO_SALES = (() => {
  const buckets = buildMonthBuckets(6)
  const revenueValues = [1240, 1580, 1420, 1960, 2310, 2680]
  const revenueByMonth = buckets.map((bucket, i) => ({ month: bucket.label, revenue: revenueValues[i] }))
  const totalRevenue = revenueValues.reduce((sum, v) => sum + v, 0)

  const transactions = [
    { id: 'demo-tx-1', customerLabel: 'Sofia Fernandes', type: 'SUBSCRIPTION', createdAt: new Date(), amount: 89, status: 'PAID' as const },
    { id: 'demo-tx-2', customerLabel: 'Ricardo Nunes', type: 'ONE_TIME', createdAt: new Date(Date.now() - 86400000), amount: 49, status: 'PAID' as const },
    { id: 'demo-tx-3', customerLabel: 'Beatriz Lima', type: 'SUBSCRIPTION', createdAt: new Date(Date.now() - 2 * 86400000), amount: 149, status: 'PENDING' as const },
  ]

  const paidCount = transactions.filter((t) => t.status === 'PAID').length

  return { revenueByMonth, totalRevenue, paidCount, transactions }
})()

export const DEMO_ENROLLMENT_GROWTH = (() => {
  const buckets = buildMonthBuckets(6)
  const values = [18, 24, 21, 32, 38, 45]
  return buckets.map((bucket, i) => ({ month: bucket.label, count: values[i] }))
})()

export const DEMO_NOTIFICATIONS = [
  { id: 'demo-notif-1', title: 'Nova aula disponível', message: '"At the airport" já está disponível em English for Everyday Life.', isRead: false, createdAt: new Date(Date.now() - 2 * 3600000) },
  { id: 'demo-notif-2', title: 'Bem-vindo à Next Level!', message: 'A sua conta foi criada com sucesso.', isRead: true, createdAt: new Date(Date.now() - 48 * 3600000) },
]

export const DEMO_ACTIVITY_LOG = [
  { id: 'demo-log-1', userName: 'Aluno Demo', action: 'LOGIN', createdAt: new Date(Date.now() - 5 * 60000) },
  { id: 'demo-log-2', userName: 'Sofia Fernandes', action: 'PURCHASE', createdAt: new Date(Date.now() - 45 * 60000) },
  { id: 'demo-log-3', userName: 'Admin Demo', action: 'COURSE_CREATED', createdAt: new Date(Date.now() - 3 * 3600000) },
  { id: 'demo-log-4', userName: 'Admin Demo', action: 'USER_BLOCKED', createdAt: new Date(Date.now() - 26 * 3600000) },
]

export const DEMO_TESTIMONIALS = [
  { id: 'demo-testimonial-1', authorName: 'Mariana Costa', content: 'Em 3 meses já consegui fazer entrevistas em inglês sem travar.', rating: 5, isActive: true },
  { id: 'demo-testimonial-2', authorName: 'André Pereira', content: 'As aulas são diretas ao ponto e cabem na minha rotina.', rating: 5, isActive: true },
  { id: 'demo-testimonial-3', authorName: 'João Lima', content: 'A comunidade me deu a confiança que faltava para conversar no trabalho.', rating: 4, isActive: false },
]

export const DEMO_ADMIN_COURSES = [
  { id: 'demo-course-1', title: 'English for Everyday Life', level: 'Beginner', price: 49, isPublished: true, enrollmentCount: 182, moduleCount: 3 },
  { id: 'demo-course-2', title: 'Pronunciation Lab', level: 'Intermediate', price: 89, isPublished: true, enrollmentCount: 96, moduleCount: 2 },
  { id: 'demo-course-3', title: 'Business English Essentials', level: 'Advanced', price: 149, isPublished: false, enrollmentCount: 0, moduleCount: 1 },
]

const DEMO_ADMIN_COURSE_MODULES: Record<string, { id: string; title: string; order: number; lessons: { id: string; title: string; duration: number; order: number; isFree: boolean }[] }[]> = {
  'demo-course-1': [
    {
      id: 'demo-module-1',
      title: 'Módulo 1 — Primeiros passos',
      order: 1,
      lessons: [
        { id: 'demo-lesson-0', title: 'Introductions & greetings', duration: 640, order: 1, isFree: true },
        { id: 'demo-lesson-1', title: 'Making small talk', duration: 480, order: 2, isFree: false },
      ],
    },
  ],
  'demo-course-2': [
    {
      id: 'demo-module-2',
      title: 'Módulo 1 — Sons do inglês',
      order: 1,
      lessons: [{ id: 'demo-lesson-3', title: 'Vowel sounds practice', duration: 540, order: 1, isFree: true }],
    },
  ],
  'demo-course-3': [
    { id: 'demo-module-3', title: 'Módulo 1 — Apresentações', order: 1, lessons: [] },
  ],
}

export function getDemoCourseDetail(courseId: string) {
  const course = DEMO_ADMIN_COURSES.find((c) => c.id === courseId)
  if (!course) return null
  return { ...course, description: null as string | null, category: null as string | null, modules: DEMO_ADMIN_COURSE_MODULES[courseId] ?? [] }
}

type DemoLessonDetail = {
  id: string
  title: string
  courseTitle: string
  moduleTitle: string
  youtubeVideoId: string
  content: string
  lastWatchedTimestamp: number
}

const DEMO_LESSON_DETAILS: Record<string, DemoLessonDetail> = {
  'demo-lesson-1': {
    id: 'demo-lesson-1',
    title: 'Making small talk',
    courseTitle: 'English for Everyday Life',
    moduleTitle: 'Módulo 1 — Primeiros passos',
    youtubeVideoId: 'PLACEHOLDER_VIDEO_ID',
    content: 'Modo demo — sem conexão com o banco. Este conteúdo é ilustrativo.',
    lastWatchedTimestamp: 0,
  },
  'demo-lesson-3': {
    id: 'demo-lesson-3',
    title: 'Vowel sounds practice',
    courseTitle: 'Pronunciation Lab',
    moduleTitle: 'Módulo 1 — Sons do inglês',
    youtubeVideoId: 'PLACEHOLDER_VIDEO_ID',
    content: 'Modo demo — sem conexão com o banco. Este conteúdo é ilustrativo.',
    lastWatchedTimestamp: 0,
  },
}

const DEFAULT_DEMO_LESSON = DEMO_LESSON_DETAILS[DEMO_LESSON_ID]

/** Qualquer id de aula demo resolve — o padrão cobre links que não mapeei explicitamente. */
export function getDemoLessonDetail(lessonId: string): DemoLessonDetail {
  return DEMO_LESSON_DETAILS[lessonId] ?? { ...DEFAULT_DEMO_LESSON, id: lessonId }
}
