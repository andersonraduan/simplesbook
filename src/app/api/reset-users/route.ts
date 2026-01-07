import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

/**
 * API TEMPORÁRIA - RESETAR USUÁRIOS
 * DELETE DEPOIS DE USAR!
 * 
 * Acesse: https://calendario.clinicalasante.pt/api/reset-users?secret=RESETAR123
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const secret = searchParams.get('secret')

        // Proteção básica
        if (secret !== 'RESETAR123') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        console.log('🔄 Resetando usuários...')

        // Admin
        const adminPassword = await bcrypt.hash('admin123', 10)
        const admin = await prisma.user.upsert({
            where: { email: 'admin@simplesbook.com' },
            update: {
                password: adminPassword,
                name: 'Administrador',
                role: 'ADMIN',
            },
            create: {
                email: 'admin@simplesbook.com',
                password: adminPassword,
                name: 'Administrador',
                role: 'ADMIN',
            },
        })

        // User
        const userPassword = await bcrypt.hash('user123', 10)
        const user = await prisma.user.upsert({
            where: { email: 'user@simplesbook.com' },
            update: {
                password: userPassword,
                name: 'Usuário Teste',
                role: 'USER',
            },
            create: {
                email: 'user@simplesbook.com',
                password: userPassword,
                name: 'Usuário Teste',
                role: 'USER',
            },
        })

        return NextResponse.json({
            success: true,
            message: 'Usuários resetados com sucesso!',
            users: [
                { email: admin.email, role: admin.role, senha: 'admin123' },
                { email: user.email, role: user.role, senha: 'user123' }
            ]
        })

    } catch (error: any) {
        console.error('❌ Erro ao resetar usuários:', error)
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}
