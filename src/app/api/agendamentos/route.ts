import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'
import { horariosSeConflitam } from '@/lib/date-utils'
import { createScheduledNotifications } from '@/lib/notification-scheduler'
import { TipoNotificacao } from '@prisma/client'

// GET - Listar todos os agendamentos do usuário logado
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const agendamentos = await prisma.agendamento.findMany({
      where: {
        userId: session.user.id,
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
      orderBy: {
        dataHoraInicio: 'desc',
      },
    })

    // Converter Decimal para string para serialização JSON
    const agendamentosFormatados = agendamentos.map((agendamento) => ({
      ...agendamento,
      valorTotal: agendamento.valorTotal.toString(),
      servicos: agendamento.servicos.map((as) => ({
        ...as,
        valor: as.valor.toString(),
      })),
    }))

    return NextResponse.json(agendamentosFormatados)
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error)
    return NextResponse.json(
      { error: 'Erro ao listar agendamentos' },
      { status: 500 }
    )
  }
}

// POST - Criar novo agendamento
export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

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

    // Verificar conflitos de horário
    const agendamentosConflitantes = await prisma.agendamento.findMany({
      where: {
        userId: session.user.id,
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

    // Criar agendamento
    const agendamento = await prisma.agendamento.create({
      data: {
        clienteId,
        userId: session.user.id,
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

    // Criar notificações agendadas
    // Confirmação (imediata)
    await createScheduledNotifications(
      agendamento.id,
      session.user.id,
      TipoNotificacao.CONFIRMACAO
    )

    // Lembretes (baseados nos templates)
    await createScheduledNotifications(
      agendamento.id,
      session.user.id,
      TipoNotificacao.LEMBRETE
    )

    // Dia do agendamento
    await createScheduledNotifications(
      agendamento.id,
      session.user.id,
      TipoNotificacao.DIA_DO_AGENDAMENTO
    )

    return NextResponse.json(
      {
        ...agendamento,
        valorTotal: agendamento.valorTotal.toString(),
        servicos: agendamento.servicos.map((as) => ({
          ...as,
          valor: as.valor.toString(),
        })),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar agendamento:', error)
    return NextResponse.json(
      { error: 'Erro ao criar agendamento' },
      { status: 500 }
    )
  }
}

