import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { validateTemplate } from '@/lib/notification-templates'
import { NextResponse } from 'next/server'
import { TipoNotificacao } from '@prisma/client'

// GET - Listar templates do usuário
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const templates = await prisma.notificationTemplate.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: [
        { tipo: 'asc' },
        { intervaloMinutos: 'desc' }
      ]
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Erro ao buscar templates:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar templates' },
      { status: 500 }
    )
  }
}

// POST - Criar novo template
export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const {
      tipo,
      nome,
      intervaloMinutos,
      mensagemSMS,
      mensagemWhatsApp,
      habilitarSMS,
      habilitarWhatsApp,
      ativo
    } = body

    // Validações
    if (!tipo || !nome) {
      return NextResponse.json(
        { error: 'Tipo e nome são obrigatórios' },
        { status: 400 }
      )
    }

    if (!Object.values(TipoNotificacao).includes(tipo)) {
      return NextResponse.json(
        { error: 'Tipo de notificação inválido' },
        { status: 400 }
      )
    }

    if (!habilitarSMS && !habilitarWhatsApp) {
      return NextResponse.json(
        { error: 'Habilite pelo menos um canal (SMS ou WhatsApp)' },
        { status: 400 }
      )
    }

    if (habilitarSMS && !mensagemSMS) {
      return NextResponse.json(
        { error: 'Mensagem SMS é obrigatória quando SMS está habilitado' },
        { status: 400 }
      )
    }

    if (habilitarWhatsApp && !mensagemWhatsApp) {
      return NextResponse.json(
        { error: 'Mensagem WhatsApp é obrigatória quando WhatsApp está habilitado' },
        { status: 400 }
      )
    }

    // Validar templates
    if (mensagemSMS) {
      const validation = validateTemplate(mensagemSMS)
      if (!validation.valid) {
        return NextResponse.json(
          { error: `Erro na mensagem SMS: ${validation.errors.join(', ')}` },
          { status: 400 }
        )
      }
    }

    if (mensagemWhatsApp) {
      const validation = validateTemplate(mensagemWhatsApp)
      if (!validation.valid) {
        return NextResponse.json(
          { error: `Erro na mensagem WhatsApp: ${validation.errors.join(', ')}` },
          { status: 400 }
        )
      }
    }

    const template = await prisma.notificationTemplate.create({
      data: {
        userId: session.user.id,
        tipo,
        nome,
        intervaloMinutos: intervaloMinutos !== undefined ? intervaloMinutos : null,
        mensagemSMS: mensagemSMS || null,
        mensagemWhatsApp: mensagemWhatsApp || null,
        habilitarSMS: habilitarSMS || false,
        habilitarWhatsApp: habilitarWhatsApp || false,
        ativo: ativo !== undefined ? ativo : true
      }
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar template:', error)
    return NextResponse.json(
      { error: 'Erro ao criar template' },
      { status: 500 }
    )
  }
}

