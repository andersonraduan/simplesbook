import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { formatPhoneNumber } from '@/lib/twilio'

// GET - Buscar cliente específico
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

    const cliente = await prisma.cliente.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(cliente)
  } catch (error) {
    console.error('Erro ao buscar cliente:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar cliente' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar cliente
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
    const { nome, email, telemovel, dataNascimento } = body

    // Verificar se o cliente pertence ao usuário
    const clienteExistente = await prisma.cliente.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!clienteExistente) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
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

    const cliente = await prisma.cliente.update({
      where: { id },
      data: {
        nome,
        email,
        telemovel: telemovelFormatado,
        dataNascimento: new Date(dataNascimento),
      },
    })

    return NextResponse.json(cliente)
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar cliente' },
      { status: 500 }
    )
  }
}

// DELETE - Remover cliente
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

    // Verificar se o cliente pertence ao usuário
    const clienteExistente = await prisma.cliente.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!clienteExistente) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    await prisma.cliente.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Cliente removido com sucesso' })
  } catch (error) {
    console.error('Erro ao remover cliente:', error)
    return NextResponse.json(
      { error: 'Erro ao remover cliente' },
      { status: 500 }
    )
  }
}

