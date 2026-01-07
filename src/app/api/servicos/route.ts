import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

// GET - Listar todos os serviços do usuário logado
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const servicos = await prisma.servico.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Converter Decimal para string para serialização JSON
    const servicosFormatados = servicos.map((servico) => ({
      ...servico,
      valor: servico.valor.toString(),
    }))

    return NextResponse.json(servicosFormatados)
  } catch (error) {
    console.error('Erro ao listar serviços:', error)
    return NextResponse.json(
      { error: 'Erro ao listar serviços' },
      { status: 500 }
    )
  }
}

// POST - Criar novo serviço
export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { titulo, descricao, valor, timeExecution } = body

    // Validações básicas
    if (!titulo || !descricao || valor === undefined || valor === null || timeExecution === undefined || timeExecution === null) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar valor positivo
    if (Number(valor) <= 0) {
      return NextResponse.json(
        { error: 'O valor deve ser maior que zero' },
        { status: 400 }
      )
    }

    // Validar tempo de execução positivo
    if (Number(timeExecution) <= 0) {
      return NextResponse.json(
        { error: 'O tempo de execução deve ser maior que zero' },
        { status: 400 }
      )
    }

    const servico = await prisma.servico.create({
      data: {
        titulo,
        descricao,
        valor: new Decimal(valor),
        timeExecution: Number(timeExecution),
        userId: session.user.id,
      },
    })

    return NextResponse.json(
      {
        ...servico,
        valor: servico.valor.toString(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar serviço:', error)
    return NextResponse.json(
      { error: 'Erro ao criar serviço' },
      { status: 500 }
    )
  }
}

