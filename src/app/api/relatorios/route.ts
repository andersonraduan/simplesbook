import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { StatusAgendamento } from '@prisma/client'

interface FiltrosRelatorio {
  dataInicial?: string
  dataFinal?: string
  status?: StatusAgendamento
  clienteId?: string
}

interface MetricasRelatorio {
  totalAgendamentos: number
  valorTotal: string
  porStatus: {
    status: StatusAgendamento
    quantidade: number
    percentual: number
  }[]
  taxaConclusao: number
}

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    
    // Obter filtros da query string
    const dataInicialParam = searchParams.get('dataInicial')
    const dataFinalParam = searchParams.get('dataFinal')
    const statusParam = searchParams.get('status')
    const clienteIdParam = searchParams.get('clienteId')

    // Se não houver datas, usar o mês corrente
    let dataInicial: Date
    let dataFinal: Date

    if (dataInicialParam && dataFinalParam) {
      dataInicial = new Date(dataInicialParam)
      dataFinal = new Date(dataFinalParam)
      // Ajustar dataFinal para incluir todo o dia
      dataFinal.setHours(23, 59, 59, 999)
    } else {
      // Usar primeiro e último dia do mês corrente
      const hoje = new Date()
      dataInicial = new Date(hoje.getFullYear(), hoje.getMonth(), 1, 0, 0, 0, 0)
      dataFinal = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59, 999)
    }

    // Construir filtros para a query
    const whereClause: any = {
      userId: session.user.id,
      dataHoraInicio: {
        gte: dataInicial,
        lte: dataFinal,
      },
    }

    if (statusParam && statusParam !== 'TODOS') {
      whereClause.status = statusParam as StatusAgendamento
    }

    if (clienteIdParam) {
      whereClause.clienteId = clienteIdParam
    }

    // Buscar agendamentos com relações
    const agendamentos = await prisma.agendamento.findMany({
      where: whereClause,
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

    // Calcular métricas
    const totalAgendamentos = agendamentos.length
    
    // Calcular valor total
    const valorTotal = agendamentos.reduce((acc, ag) => {
      return acc + Number(ag.valorTotal)
    }, 0)

    // Agrupamento por status
    const statusCount = agendamentos.reduce((acc, ag) => {
      acc[ag.status] = (acc[ag.status] || 0) + 1
      return acc
    }, {} as Record<StatusAgendamento, number>)

    const porStatus = Object.entries(statusCount).map(([status, quantidade]) => ({
      status: status as StatusAgendamento,
      quantidade,
      percentual: totalAgendamentos > 0 ? (quantidade / totalAgendamentos) * 100 : 0,
    }))

    // Taxa de conclusão
    const concluidos = statusCount['CONCLUIDO'] || 0
    const taxaConclusao = totalAgendamentos > 0 ? (concluidos / totalAgendamentos) * 100 : 0

    const metricas: MetricasRelatorio = {
      totalAgendamentos,
      valorTotal: valorTotal.toFixed(2),
      porStatus,
      taxaConclusao,
    }

    // Formatar agendamentos para resposta
    const agendamentosFormatados = agendamentos.map((agendamento) => ({
      ...agendamento,
      valorTotal: agendamento.valorTotal.toString(),
      servicos: agendamento.servicos.map((as) => ({
        ...as,
        valor: as.valor.toString(),
      })),
    }))

    return NextResponse.json({
      agendamentos: agendamentosFormatados,
      metricas,
      filtros: {
        dataInicial: dataInicial.toISOString(),
        dataFinal: dataFinal.toISOString(),
        status: statusParam || 'TODOS',
        clienteId: clienteIdParam || null,
      },
    })
  } catch (error) {
    console.error('Erro ao gerar relatório:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar relatório' },
      { status: 500 }
    )
  }
}

