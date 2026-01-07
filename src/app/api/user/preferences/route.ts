import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { CalendarioView } from '@prisma/client'

// GET - Buscar preferências do usuário
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar ou criar preferências
    let preferences = await prisma.userPreferences.findUnique({
      where: {
        userId: session.user.id
      }
    })

    // Se não existir, criar com valores padrão
    if (!preferences) {
      preferences = await prisma.userPreferences.create({
        data: {
          userId: session.user.id,
          calendarioView: CalendarioView.SEMANA,
          horarioInicioAtendimento: '08:00',
          horarioFimAtendimento: '20:00',
          intervaloSlot: 30
        }
      })
    }

    return NextResponse.json(preferences)
  } catch (error) {
    console.error('Erro ao buscar preferências:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar preferências' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar preferências do usuário
export async function PUT(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const {
      calendarioView,
      horarioInicioAtendimento,
      horarioFimAtendimento,
      intervaloSlot
    } = body

    // Validações
    if (calendarioView && !Object.values(CalendarioView).includes(calendarioView)) {
      return NextResponse.json(
        { error: 'Tipo de visualização inválido' },
        { status: 400 }
      )
    }

    // Validar horários
    if (horarioInicioAtendimento && horarioFimAtendimento) {
      const [horaInicio, minInicio] = horarioInicioAtendimento.split(':').map(Number)
      const [horaFim, minFim] = horarioFimAtendimento.split(':').map(Number)
      
      const totalMinInicio = horaInicio * 60 + minInicio
      const totalMinFim = horaFim * 60 + minFim
      
      if (totalMinFim <= totalMinInicio) {
        return NextResponse.json(
          { error: 'Horário de fim deve ser maior que horário de início' },
          { status: 400 }
        )
      }
    }

    // Validar intervalo de slot
    if (intervaloSlot && ![15, 30, 60].includes(intervaloSlot)) {
      return NextResponse.json(
        { error: 'Intervalo de slot deve ser 15, 30 ou 60 minutos' },
        { status: 400 }
      )
    }

    // Atualizar ou criar preferências
    const preferences = await prisma.userPreferences.upsert({
      where: {
        userId: session.user.id
      },
      update: {
        ...(calendarioView && { calendarioView }),
        ...(horarioInicioAtendimento && { horarioInicioAtendimento }),
        ...(horarioFimAtendimento && { horarioFimAtendimento }),
        ...(intervaloSlot !== undefined && { intervaloSlot })
      },
      create: {
        userId: session.user.id,
        calendarioView: calendarioView || CalendarioView.SEMANA,
        horarioInicioAtendimento: horarioInicioAtendimento || '08:00',
        horarioFimAtendimento: horarioFimAtendimento || '20:00',
        intervaloSlot: intervaloSlot || 30
      }
    })

    return NextResponse.json(preferences)
  } catch (error) {
    console.error('Erro ao atualizar preferências:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar preferências' },
      { status: 500 }
    )
  }
}

