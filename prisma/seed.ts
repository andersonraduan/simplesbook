import { PrismaClient, TipoNotificacao } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed do banco de dados...')

  // Criar usuário ADMIN
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@simplesbook.com' },
    update: {},
    create: {
      email: 'admin@simplesbook.com',
      password: adminPassword,
      name: 'Administrador',
      role: 'ADMIN',
    },
  })
  console.log(`✓ Admin criado: ${admin.email}`)

  // Criar usuário USER
  const userPassword = await bcrypt.hash('user123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'user@simplesbook.com' },
    update: {},
    create: {
      email: 'user@simplesbook.com',
      password: userPassword,
      name: 'Usuário Teste',
      role: 'USER',
    },
  })
  console.log(`✓ User criado: ${user.email}`)

  // Criar templates de notificação padrão para o usuário
  console.log('\nCriando templates de notificação padrão...')

  // Verificar se já existem templates para este usuário
  const existingTemplates = await prisma.notificationTemplate.count({
    where: { userId: user.id }
  })

  if (existingTemplates > 0) {
    console.log(`⚠ Usuário já possui ${existingTemplates} template(s). Pulando criação...`)
  } else {
    const templatesData = [
      {
        userId: user.id,
        tipo: TipoNotificacao.CONFIRMACAO,
        nome: 'Confirmação de Agendamento',
        intervaloMinutos: null,
        mensagemSMS: 'Olá {cliente_nome}! Seu agendamento foi confirmado para {data} às {hora}. Serviços: {servicos}. Total: {valor_total}.',
        mensagemWhatsApp: '✅ *Agendamento Confirmado*\n\nOlá {cliente_nome}!\n\nSeu agendamento foi confirmado:\n📅 Data: {data}\n🕐 Hora: {hora}\n💼 Serviços: {servicos}\n💰 Total: {valor_total}\n\nAté breve!',
        habilitarSMS: true,
        habilitarWhatsApp: true,
        ativo: true
      },
      {
        userId: user.id,
        tipo: TipoNotificacao.LEMBRETE,
        nome: 'Lembrete 24h Antes',
        intervaloMinutos: 1440, // 24 horas
        mensagemSMS: 'Lembrete: Você tem agendamento amanhã ({data}) às {hora}. Serviços: {servicos}. Nos vemos em breve!',
        mensagemWhatsApp: '⏰ *Lembrete de Agendamento*\n\nOlá {cliente_nome}!\n\nLembrando que você tem agendamento:\n📅 {data} às {hora}\n💼 {servicos}\n⏱️ Duração: {duracao_total}\n\nNos vemos em breve!',
        habilitarSMS: true,
        habilitarWhatsApp: true,
        ativo: true
      },
      {
        userId: user.id,
        tipo: TipoNotificacao.LEMBRETE,
        nome: 'Lembrete 1h Antes',
        intervaloMinutos: 60, // 1 hora
        mensagemSMS: 'Lembrete: Seu agendamento é daqui a 1 hora ({hora}). Serviços: {servicos}. Te esperamos!',
        mensagemWhatsApp: '⏰ *Lembrete - 1 hora*\n\nOlá {cliente_nome}!\n\nSeu agendamento é daqui a 1 hora:\n🕐 Horário: {hora}\n💼 {servicos}\n\nTe esperamos!',
        habilitarSMS: false,
        habilitarWhatsApp: true,
        ativo: true
      },
      {
        userId: user.id,
        tipo: TipoNotificacao.DIA_DO_AGENDAMENTO,
        nome: 'Lembrete Dia do Agendamento',
        intervaloMinutos: 60, // 1 hora antes
        mensagemSMS: 'Hoje é o dia! Seu agendamento é às {hora}. Serviços: {servicos}. Te esperamos!',
        mensagemWhatsApp: '📍 *Hoje é o Dia!*\n\nOlá {cliente_nome}!\n\nSeu agendamento é hoje:\n🕐 Horário: {hora}\n💼 Serviços: {servicos}\n⏱️ Duração: {duracao_total}\n\nTe esperamos!',
        habilitarSMS: true,
        habilitarWhatsApp: true,
        ativo: false // Desativado por padrão para não duplicar com o lembrete de 1h
      },
      {
        userId: user.id,
        tipo: TipoNotificacao.CANCELAMENTO,
        nome: 'Cancelamento de Agendamento',
        intervaloMinutos: null,
        mensagemSMS: 'Seu agendamento de {data} às {hora} foi cancelado. Qualquer dúvida, entre em contato.',
        mensagemWhatsApp: '❌ *Agendamento Cancelado*\n\nOlá {cliente_nome}!\n\nSeu agendamento foi cancelado:\n📅 Data: {data}\n🕐 Hora: {hora}\n💼 Serviços: {servicos}\n\nQualquer dúvida, entre em contato conosco.',
        habilitarSMS: true,
        habilitarWhatsApp: true,
        ativo: true
      },
      {
        userId: user.id,
        tipo: TipoNotificacao.MUDANCA_STATUS,
        nome: 'Mudança de Status',
        intervaloMinutos: null,
        mensagemSMS: 'Atualização: O status do seu agendamento de {data} às {hora} foi alterado.',
        mensagemWhatsApp: '🔄 *Atualização de Agendamento*\n\nOlá {cliente_nome}!\n\nO status do seu agendamento foi atualizado:\n📅 Data: {data}\n🕐 Hora: {hora}\n💼 Serviços: {servicos}',
        habilitarSMS: false,
        habilitarWhatsApp: true,
        ativo: false // Desativado por padrão
      }
    ]

    await prisma.notificationTemplate.createMany({
      data: templatesData,
      skipDuplicates: true
    })

    console.log(`✓ ${templatesData.length} templates de notificação criados`)
  }

  // Criar preferências padrão para o usuário
  console.log('\nCriando preferências padrão do usuário...')
  const userPreferences = await prisma.userPreferences.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      calendarioView: 'SEMANA',
      horarioInicioAtendimento: '08:00',
      horarioFimAtendimento: '20:00',
      intervaloSlot: 30
    }
  })
  console.log(`✓ Preferências criadas para usuário: ${user.email}`)

  // Criar configurações do sistema
  console.log('\nCriando configurações do sistema...')
  const appNameSetting = await prisma.systemSettings.upsert({
    where: { key: 'APP_NAME' },
    update: {},
    create: {
      key: 'APP_NAME',
      value: 'SimplesBook'
    }
  })
  console.log(`✓ Configuração criada: ${appNameSetting.key} = ${appNameSetting.value}`)

  console.log('\nSeed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('Erro durante seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

