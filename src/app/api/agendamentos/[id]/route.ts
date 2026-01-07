import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'
import { horariosSeConflitam } from '@/lib/date-utils'
import { 
  cancelScheduledNotifications, 
  sendImmediateNotification,
  createScheduledNotifications 
} from '@/lib/notification-scheduler'
import { TipoNotificacao } from '@prisma/client'

// PUT - Atualizar agendamento
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
    const body = await request.json()
    const {
      clienteId,
      servicosIds,
      dataHoraInicio,
      dataHoraFim,
      valorTotal,
      duracaoTotal,
      status,
      observacoes,
      confirmarConflito,
    } = body

    // Validações básicas
    if (
      !clienteId ||
      !servicosIds ||
      !Array.isArray(servicosIds) ||
      servicosIds.length === 0 ||
      !dataHoraInicio ||
      !dataHoraFim ||
      valorTotal === undefined ||
      valorTotal === null ||
      duracaoTotal === undefined ||
      duracaoTotal === null ||
      !status
    ) {
      return NextResponse.json(
        { error: 'Todos os campos obrigatórios devem ser preenchidos' },
        { status: 400 }
      )
    }

    // Verificar se o agendamento existe e pertence ao usuário
    const agendamentoExistente = await prisma.agendamento.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!agendamentoExistente) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      )
    }

    // Validar datas
    const inicio = new Date(dataHoraInicio)
    const fim = new Date(dataHoraFim)

    if (inicio >= fim) {
      return NextResponse.json(
        { error: 'A data/hora de início deve ser anterior à de fim' },
        { status: 400 }
      )
    }

    if (Number(valorTotal) <= 0) {
      return NextResponse.json(
        { error: 'O valor total deve ser maior que zero' },
        { status: 400 }
      )
    }

    if (Number(duracaoTotal) <= 0) {
      return NextResponse.json(
        { error: 'A duração total deve ser maior que zero' },
        { status: 400 }
      )
    }

    // Verificar se o cliente pertence ao usuário
    const cliente = await prisma.cliente.findFirst({
      where: {
        id: clienteId,
        userId: session.user.id,
      },
    })

    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente não encontrado ou não pertence ao usuário' },
        { status: 404 }
      )
    }

    // Buscar serviços e validar
    const servicos = await prisma.servico.findMany({
      where: {
        id: { in: servicosIds },
        userId: session.user.id,
      },
    })

    if (servicos.length !== servicosIds.length) {
      return NextResponse.json(
        { error: 'Um ou mais serviços não foram encontrados ou não pertencem ao usuário' },
        { status: 404 }
      )
    }

    // Verificar conflitos de horário (excluindo o próprio agendamento)
    const agendamentosConflitantes = await prisma.agendamento.findMany({
      where: {
        userId: session.user.id,
        id: { not: id },
        status: { not: 'CANCELADO' },
      },
      include: {
        cliente: {
          select: {
            nome: true,
          },
        },
      },
    })

    const conflitos = agendamentosConflitantes.filter((ag) =>
      horariosSeConflitam(
        inicio,
        fim,
        new Date(ag.dataHoraInicio),
        new Date(ag.dataHoraFim)
      )
    )

    if (conflitos.length > 0 && !confirmarConflito) {
      return NextResponse.json(
        {
          error: 'Conflito de horário detectado',
          conflitos: conflitos.map((c) => ({
            id: c.id,
            dataHoraInicio: c.dataHoraInicio.toISOString(),
            dataHoraFim: c.dataHoraFim.toISOString(),
            cliente: c.cliente,
          })),
        },
        { status: 409 }
      )
    }

    // Verificar se houve mudança de status
    const statusMudou = agendamentoExistente.status !== status

    // Usar transaction para garantir atomicidade
    const agendamento = await prisma.$transaction(async (tx) => {
      // Deletar serviços antigos
      await tx.agendamentoServico.deleteMany({
        where: { agendamentoId: id },
      })

      // Atualizar agendamento e criar novos serviços
      return await tx.agendamento.update({
        where: { id },
        data: {
          clienteId,
          dataHoraInicio: inicio,
          dataHoraFim: fim,
          valorTotal: new Decimal(valorTotal),
          duracaoTotal: Number(duracaoTotal),
          status,
          observacoes: observacoes || null,
          servicos: {
            create: servicos.map((servico) => ({
              servicoId: servico.id,
              valor: servico.valor,
              timeExecution: servico.timeExecution,
            })),
          },
        },
        include: {
          cliente: {
            select: {
              id: true,
              nome: true,
              email: true,
              telemovel: true,
            },
          },
          servicos: {
            include: {
              servico: {
                select: {
                  id: true,
                  titulo: true,
                  descricao: true,
                },
              },
            },
          },
        },
      })
    })

    // Gerenciar notificações baseado nas mudanças
    if (status === 'CANCELADO' && agendamentoExistente.status !== 'CANCELADO') {
      // Cancelar notificações pendentes
      await cancelScheduledNotifications(id)
      
      // Enviar notificação de cancelamento
      await sendImmediateNotification(
        id,
        session.user.id,
        TipoNotificacao.CANCELAMENTO
      )
    } else if (statusMudou) {
      // Mudança de status (ex: PENDENTE -> CONFIRMADO)
      await sendImmediateNotification(
        id,
        session.user.id,
        TipoNotificacao.MUDANCA_STATUS
      )
    } else if (
      agendamentoExistente.dataHoraInicio.getTime() !== inicio.getTime()
    ) {
      // Data/hora mudou - recriar notificações
      await cancelScheduledNotifications(id)
      
      await createScheduledNotifications(
        id,
        session.user.id,
        TipoNotificacao.LEMBRETE
      )
      
      await createScheduledNotifications(
        id,
        session.user.id,
        TipoNotificacao.DIA_DO_AGENDAMENTO
      )
    }

    return NextResponse.json({
      ...agendamento,
      valorTotal: agendamento.valorTotal.toString(),
      servicos: agendamento.servicos.map((as) => ({
        ...as,
        valor: as.valor.toString(),
      })),
    })
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar agendamento' },
      { status: 500 }
    )
  }
}

// DELETE - Remover agendamento
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

    // Verificar se o agendamento existe e pertence ao usuário
    const agendamento = await prisma.agendamento.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!agendamento) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      )
    }

    // Cancelar notificações pendentes antes de deletar
    await cancelScheduledNotifications(id)

    // Deletar agendamento (cascade deleta AgendamentoServico)
    await prisma.agendamento.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Agendamento removido com sucesso' })
  } catch (error) {
    console.error('Erro ao remover agendamento:', error)
    return NextResponse.json(
      { error: 'Erro ao remover agendamento' },
      { status: 500 }
    )
  }
}

