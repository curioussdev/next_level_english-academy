import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('password123', 10)

  const student = await prisma.user.upsert({
    where: { email: 'aluno@nextlevel.pt' },
    update: {},
    create: { name: 'Aluno Demo', email: 'aluno@nextlevel.pt', password, role: 'STUDENT' },
  })

  await prisma.user.upsert({
    where: { email: 'admin@nextlevel.pt' },
    update: {},
    create: { name: 'Admin Demo', email: 'admin@nextlevel.pt', password, role: 'ADMIN' },
  })

  await prisma.user.upsert({
    where: { email: 'ralde@nextlevel.pt' },
    update: {},
    create: { name: 'Ralde Sicato', email: 'ralde@nextlevel.pt', password, role: 'DIRECTOR' },
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

  console.log('Seed concluído. Contas de teste (senha: password123):')
  console.log('  Aluno:    aluno@nextlevel.pt')
  console.log('  Admin:    admin@nextlevel.pt')
  console.log('  Director: ralde@nextlevel.pt')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
