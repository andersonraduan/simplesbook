#!/usr/bin/env tsx

/**
 * Script para resetar usuários em PRODUÇÃO
 * Executa: npx tsx reset-users.ts
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Resetando usuários em PRODUÇÃO...\n')

  try {
    // Admin
    const adminPassword = await bcrypt.hash('admin123', 10)
    const admin = await prisma.user.upsert({
      where: { email: 'admin@simplesbook.com' },
      update: {
        password: adminPassword,
        name: 'Administrador',
        role: 'ADMIN',
      },
      create: {
        email: 'admin@simplesbook.com',
        password: adminPassword,
        name: 'Administrador',
        role: 'ADMIN',
      },
    })
    console.log(`✅ Admin resetado: ${admin.email}`)
    console.log(`   Senha: admin123`)

    // User
    const userPassword = await bcrypt.hash('user123', 10)
    const user = await prisma.user.upsert({
      where: { email: 'user@simplesbook.com' },
      update: {
        password: userPassword,
        name: 'Usuário Teste',
        role: 'USER',
      },
      create: {
        email: 'user@simplesbook.com',
        password: userPassword,
        name: 'Usuário Teste',
        role: 'USER',
      },
    })
    console.log(`✅ User resetado: ${user.email}`)
    console.log(`   Senha: user123`)

    console.log('\n✅ Usuários resetados com sucesso!')
    console.log('\n🔐 Credenciais:')
    console.log('   Admin: admin@simplesbook.com / admin123')
    console.log('   User:  user@simplesbook.com / user123')

  } catch (error) {
    console.error('❌ Erro ao resetar usuários:', error)
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
