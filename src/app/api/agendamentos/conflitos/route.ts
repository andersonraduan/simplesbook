import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { horariosSeConflitam } from '@/lib/date-utils'

// GET - Verificar conflitos de horário
export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dataHoraInicio = searchParams.get('dataHoraInicio')
    const dataHoraFim = searchParams.get('dataHoraFim')
    const excluirId = searchParams.get('excluirId')

    if (!dataHoraInicio || !dataHoraFim) {
      return NextResponse.json(
        { error: 'dataHoraInicio e dataHoraFim são obrigatórios' },
        { status: 400 }
      )
    }

    const inicio = new Date(dataHoraInicio)
    const fim = new Date(dataHoraFim)

    if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
      return NextResponse.json(
        { error: 'Datas inválidas' },
        { status: 400 }
      )
    }

    // Buscar agendamentos do usuário (excluindo o próprio se estiver editando)
    const whereClause: any = {
      userId: session.user.id,
      status: { not: 'CANCELADO' },
    }

    if (excluirId) {
      whereClause.id = { not: excluirId }
    }

    const agendamentos = await prisma.agendamento.findMany({
      where: whereClause,
      include: {
        cliente: {
          select: {
            nome: true,
          },
        },
      },
    })

    // Filtrar conflitos
    const conflitos = agendamentos.filter((ag) =>
      horariosSeConflitam(
        inicio,
        fim,
        new Date(ag.dataHoraInicio),
        new Date(ag.dataHoraFim)
      )
    )

    return NextResponse.json({
      hasConflict: conflitos.length > 0,
      conflitos: conflitos.map((c) => ({
        id: c.id,
        dataHoraInicio: c.dataHoraInicio.toISOString(),
        dataHoraFim: c.dataHoraFim.toISOString(),
        cliente: c.cliente,
      })),
    })
  } catch (error) {
    console.error('Erro ao verificar conflitos:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar conflitos' },
      { status: 500 }
    )
  }
}

