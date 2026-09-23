import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Conta real do Director (Ralde Sicato / tenant superior). Senha gerada
// aleatoriamente — troque assim que entrar, pelo fluxo "Esqueci a senha".
const DIRECTOR_EMAIL = process.env.CONTACT_EMAIL ?? 'englishcommunitynextlevel@gmail.com'
const DIRECTOR_PASSWORD = 'Ucnw8HTMZVWROk44'

// Contas de teste (não são reais — usar só para validar RBAC/roles em dev).
const TEST_PASSWORD = 'Teste@123'

async function main() {
  const directorPassword = await bcrypt.hash(DIRECTOR_PASSWORD, 10)
  const testPassword = await bcrypt.hash(TEST_PASSWORD, 10)

  await prisma.user.upsert({
    where: { email: DIRECTOR_EMAIL },
    update: { role: 'DIRECTOR' },
    create: { name: 'Ralde Sicato', email: DIRECTOR_EMAIL, password: directorPassword, role: 'DIRECTOR' },
  })

  const student = await prisma.user.upsert({
    where: { email: 'aluno.teste@nextlevel.pt' },
    update: {},
    create: { name: 'Aluno Teste', email: 'aluno.teste@nextlevel.pt', password: testPassword, role: 'STUDENT' },
  })

  await prisma.user.upsert({
    where: { email: 'instrutor.teste@nextlevel.pt' },
    update: {},
    create: { name: 'Instrutor Teste', email: 'instrutor.teste@nextlevel.pt', password: testPassword, role: 'INSTRUCTOR' },
  })

  await prisma.user.upsert({
    where: { email: 'admin.teste@nextlevel.pt' },
    update: {},
    create: { name: 'Admin Teste', email: 'admin.teste@nextlevel.pt', password: testPassword, role: 'ADMIN' },
  })

  const course = await prisma.course.upsert({
    where: { id: 'demo-course' },
    update: {},
    create: {
      id: 'demo-course',
      title: 'English for Everyday Life',
      slug: 'english-for-everyday-life',
      description: 'Método imersivo para o dia a dia.',
      price: 49,
      level: 'Beginner',
      isPublished: true,
      modules: {
        create: [
          {
            title: 'Módulo 1 — Primeiros passos',
            order: 1,
            lessons: {
              create: [
                {
                  title: 'At the coffee shop',
                  // Substitua pelo ID de um vídeo real "não listado" no YouTube.
                  youtubeVideoId: 'PLACEHOLDER_VIDEO_ID',
                  duration: 300,
                  order: 1,
                },
              ],
            },
          },
        ],
      },
    },
  })

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: student.id, courseId: course.id } },
    update: {},
    create: { userId: student.id, courseId: course.id },
  })

  console.log('Seed concluído.')
  console.log('')
  console.log(`  Director (real):  ${DIRECTOR_EMAIL} / ${DIRECTOR_PASSWORD}`)
  console.log('  Aluno (teste):     aluno.teste@nextlevel.pt / Teste@123')
  console.log('  Instrutor (teste): instrutor.teste@nextlevel.pt / Teste@123')
  console.log('  Admin (teste):     admin.teste@nextlevel.pt / Teste@123')
  console.log('')
  console.log('  Troque a senha do Director assim que entrar (fluxo "Esqueci a senha").')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
