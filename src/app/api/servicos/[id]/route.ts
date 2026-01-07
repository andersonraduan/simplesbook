import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

// GET - Buscar serviço específico
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

    const servico = await prisma.servico.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!servico) {
      return NextResponse.json(
        { error: 'Serviço não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...servico,
      valor: servico.valor.toString(),
    })
  } catch (error) {
    console.error('Erro ao buscar serviço:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar serviço' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar serviço
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
    const { titulo, descricao, valor, timeExecution } = body

    // Validar valor positivo
    if (valor !== undefined && Number(valor) <= 0) {
      return NextResponse.json(
        { error: 'O valor deve ser maior que zero' },
        { status: 400 }
      )
    }

    // Validar tempo de execução positivo
    if (timeExecution !== undefined && Number(timeExecution) <= 0) {
      return NextResponse.json(
        { error: 'O tempo de execução deve ser maior que zero' },
        { status: 400 }
      )
    }

    // Verificar se o serviço pertence ao usuário
    const servicoExistente = await prisma.servico.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!servicoExistente) {
      return NextResponse.json(
        { error: 'Serviço não encontrado' },
        { status: 404 }
      )
    }

    const servico = await prisma.servico.update({
      where: { id },
      data: {
        titulo,
        descricao,
        valor: new Decimal(valor),
        timeExecution: Number(timeExecution),
      },
    })

    return NextResponse.json({
      ...servico,
      valor: servico.valor.toString(),
    })
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar serviço' },
      { status: 500 }
    )
  }
}

// DELETE - Remover serviço
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

    // Verificar se o serviço pertence ao usuário
    const servicoExistente = await prisma.servico.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!servicoExistente) {
      return NextResponse.json(
        { error: 'Serviço não encontrado' },
        { status: 404 }
      )
    }

    await prisma.servico.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Serviço removido com sucesso' })
  } catch (error) {
    console.error('Erro ao remover serviço:', error)
    return NextResponse.json(
      { error: 'Erro ao remover serviço' },
      { status: 500 }
    )
  }
}

