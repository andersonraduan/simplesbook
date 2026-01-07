import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// Tratamento de erros de conexão
prisma.$connect().catch((error) => {
  console.error('Erro ao conectar com o banco de dados:', error)
  if (process.env.NODE_ENV === 'production') {
    // Em produção, não encerrar o processo, apenas logar o erro
    console.error('A aplicação continuará rodando, mas operações de banco podem falhar.')
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

