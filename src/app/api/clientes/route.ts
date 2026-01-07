import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { formatPhoneNumber } from '@/lib/twilio'

// GET - Listar todos os clientes do usuário logado
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const clientes = await prisma.cliente.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(clientes)
  } catch (error) {
    console.error('Erro ao listar clientes:', error)
    return NextResponse.json(
      { error: 'Erro ao listar clientes' },
      { status: 500 }
    )
  }
}

// POST - Criar novo cliente
export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { nome, email, telemovel, dataNascimento } = body

    // Validações básicas
    if (!nome || !email || !telemovel || !dataNascimento) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar e formatar telefone
    const telemovelFormatado = formatPhoneNumber(telemovel)
    
    // Validação básica: deve ter pelo menos 10 dígitos
    const digitsOnly = telemovelFormatado.replace(/\D/g, '')
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      return NextResponse.json(
        { error: 'Número de telefone inválido. Use formato: +351912345678 ou 912345678' },
        { status: 400 }
      )
    }

    const cliente = await prisma.cliente.create({
      data: {
        nome,
        email,
        telemovel: telemovelFormatado,
        dataNascimento: new Date(dataNascimento),
        userId: session.user.id,
      },
    })

    return NextResponse.json(cliente, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar cliente:', error)
    return NextResponse.json(
      { error: 'Erro ao criar cliente' },
      { status: 500 }
    )
  }
}

