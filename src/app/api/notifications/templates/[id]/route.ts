import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { validateTemplate } from '@/lib/notification-templates'
import { NextResponse } from 'next/server'
import { TipoNotificacao } from '@prisma/client'

// GET - Buscar template específico
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params

    const template = await prisma.notificationTemplate.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Template não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error('Erro ao buscar template:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar template' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar template
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params

    // Verificar se template existe e pertence ao usuário
    const existingTemplate = await prisma.notificationTemplate.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template não encontrado' },
        { status: 404 }
      )
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
    if (tipo && !Object.values(TipoNotificacao).includes(tipo)) {
      return NextResponse.json(
        { error: 'Tipo de notificação inválido' },
        { status: 400 }
      )
    }

    const finalHabilitarSMS = habilitarSMS !== undefined ? habilitarSMS : existingTemplate.habilitarSMS
    const finalHabilitarWhatsApp = habilitarWhatsApp !== undefined ? habilitarWhatsApp : existingTemplate.habilitarWhatsApp

    if (!finalHabilitarSMS && !finalHabilitarWhatsApp) {
      return NextResponse.json(
        { error: 'Habilite pelo menos um canal (SMS ou WhatsApp)' },
        { status: 400 }
      )
    }

    const finalMensagemSMS = mensagemSMS !== undefined ? mensagemSMS : existingTemplate.mensagemSMS
    const finalMensagemWhatsApp = mensagemWhatsApp !== undefined ? mensagemWhatsApp : existingTemplate.mensagemWhatsApp

    if (finalHabilitarSMS && !finalMensagemSMS) {
      return NextResponse.json(
        { error: 'Mensagem SMS é obrigatória quando SMS está habilitado' },
        { status: 400 }
      )
    }

    if (finalHabilitarWhatsApp && !finalMensagemWhatsApp) {
      return NextResponse.json(
        { error: 'Mensagem WhatsApp é obrigatória quando WhatsApp está habilitado' },
        { status: 400 }
      )
    }

    // Validar templates se fornecidos
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

    const template = await prisma.notificationTemplate.update({
      where: {
        id
      },
      data: {
        ...(tipo && { tipo }),
        ...(nome && { nome }),
        ...(intervaloMinutos !== undefined && { intervaloMinutos }),
        ...(mensagemSMS !== undefined && { mensagemSMS }),
        ...(mensagemWhatsApp !== undefined && { mensagemWhatsApp }),
        ...(habilitarSMS !== undefined && { habilitarSMS }),
        ...(habilitarWhatsApp !== undefined && { habilitarWhatsApp }),
        ...(ativo !== undefined && { ativo })
      }
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error('Erro ao atualizar template:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar template' },
      { status: 500 }
    )
  }
}

// DELETE - Remover template
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params

    // Verificar se template existe e pertence ao usuário
    const existingTemplate = await prisma.notificationTemplate.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se há notificações agendadas pendentes usando este template
    const pendingNotifications = await prisma.notificationScheduled.count({
      where: {
        templateId: id,
        status: 'PENDENTE'
      }
    })

    if (pendingNotifications > 0) {
      return NextResponse.json(
        { 
          error: `Não é possível excluir. Existem ${pendingNotifications} notificações pendentes usando este template.`,
          suggestion: 'Desative o template ao invés de excluí-lo.'
        },
        { status: 400 }
      )
    }

    await prisma.notificationTemplate.delete({
      where: {
        id
      }
    })

    return NextResponse.json({ message: 'Template excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir template:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir template' },
      { status: 500 }
    )
  }
}

