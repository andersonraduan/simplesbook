import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET: Buscar todas as configurações do sistema
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado. Apenas administradores.' }, { status: 403 })
    }

    // Buscar todas as configurações
    const settings = await prisma.systemSettings.findMany({
      orderBy: { key: 'asc' }
    })

    // Converter array para objeto para facilitar o uso no frontend
    const settingsObj = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, string>)

    return NextResponse.json(settingsObj)
  } catch (error) {
    console.error('Erro ao buscar configurações:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar configurações do sistema' },
      { status: 500 }
    )
  }
}

// PUT: Atualizar configurações do sistema
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado. Apenas administradores.' }, { status: 403 })
    }

    const body = await request.json()
    const { key, value } = body

    // Validações
    if (!key || typeof key !== 'string') {
      return NextResponse.json({ error: 'Chave inválida' }, { status: 400 })
    }

    if (!value || typeof value !== 'string') {
      return NextResponse.json({ error: 'Valor inválido' }, { status: 400 })
    }

    // Validações específicas por chave
    if (key === 'APP_NAME') {
      if (value.trim().length === 0) {
        return NextResponse.json({ error: 'O nome da aplicação não pode ser vazio' }, { status: 400 })
      }

      if (value.length > 50) {
        return NextResponse.json({ error: 'O nome da aplicação não pode ter mais de 50 caracteres' }, { status: 400 })
      }
    }

    // Atualizar ou criar a configuração
    const setting = await prisma.systemSettings.upsert({
      where: { key },
      update: { value: value.trim() },
      create: { key, value: value.trim() }
    })

    return NextResponse.json({
      success: true,
      setting: {
        key: setting.key,
        value: setting.value
      }
    })
  } catch (error) {
    console.error('Erro ao atualizar configuração:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar configuração do sistema' },
      { status: 500 }
    )
  }
}

