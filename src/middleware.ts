import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  try {
    const { pathname } = req.nextUrl
    
    // Usar getToken ao invés de auth() - compatível com Edge Runtime
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    // Rotas públicas
    if (pathname === '/login') {
      // Se já está autenticado, redireciona para dashboard apropriado
      if (token?.role) {
        const dashboardUrl = token.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'
        return NextResponse.redirect(new URL(dashboardUrl, req.url))
      }
      return NextResponse.next()
    }

    // Rotas protegidas - requer autenticação
    if (pathname.startsWith('/dashboard') || 
        pathname.startsWith('/admin') || 
        pathname.startsWith('/clientes') || 
        pathname.startsWith('/servicos') ||
        pathname.startsWith('/agendamentos') ||
        pathname.startsWith('/calendario') ||
        pathname.startsWith('/notifications') ||
        pathname.startsWith('/configuracoes')) {
      if (!token) {
        return NextResponse.redirect(new URL('/login', req.url))
      }

      // Rota admin - apenas ADMIN pode acessar
      if (pathname.startsWith('/admin') && token.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }

      return NextResponse.next()
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Erro no middleware:', error)
    // Em caso de erro, permitir que a requisição continue
    // (melhor do que quebrar toda a aplicação)
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

