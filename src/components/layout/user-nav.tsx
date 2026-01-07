'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'

export function UserNav() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold text-slate-900">
              SimplesBook
            </Link>
            
            <div className="flex gap-4">
              <Link href="/dashboard">
                <Button
                  variant={isActive('/dashboard') ? 'default' : 'ghost'}
                  size="sm"
                >
                  Home
                </Button>
              </Link>
              
              <Link href="/clientes">
                <Button
                  variant={isActive('/clientes') ? 'default' : 'ghost'}
                  size="sm"
                >
                  Clientes
                </Button>
              </Link>
              
              <Link href="/servicos">
                <Button
                  variant={isActive('/servicos') ? 'default' : 'ghost'}
                  size="sm"
                >
                  Serviços
                </Button>
              </Link>
              
              <Link href="/agendamentos">
                <Button
                  variant={isActive('/agendamentos') ? 'default' : 'ghost'}
                  size="sm"
                >
                  Agendamentos
                </Button>
              </Link>
              
              <Link href="/calendario">
                <Button
                  variant={isActive('/calendario') ? 'default' : 'ghost'}
                  size="sm"
                >
                  Calendário
                </Button>
              </Link>
              
              <Link href="/relatorios">
                <Button
                  variant={isActive('/relatorios') ? 'default' : 'ghost'}
                  size="sm"
                >
                  Relatórios
                </Button>
              </Link>
              
              <Link href="/notifications">
                <Button
                  variant={isActive('/notifications') ? 'default' : 'ghost'}
                  size="sm"
                >
                  Notificações
                </Button>
              </Link>
              
              <Link href="/perfil">
                <Button
                  variant={isActive('/perfil') ? 'default' : 'ghost'}
                  size="sm"
                >
                  Perfil
                </Button>
              </Link>
              
              <Link href="/configuracoes">
                <Button
                  variant={isActive('/configuracoes') ? 'default' : 'ghost'}
                  size="sm"
                >
                  Configurações
                </Button>
              </Link>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </div>
    </nav>
  )
}

