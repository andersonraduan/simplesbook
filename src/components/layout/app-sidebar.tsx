'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface AppSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const isActive = (path: string) => pathname === path

  const navLinks = [
    { href: '/dashboard', label: 'Home', icon: 'home' },
    { href: '/clientes', label: 'Clientes', icon: 'people' },
    { href: '/servicos', label: 'Serviços', icon: 'spa' },
    { href: '/agendamentos', label: 'Agendamentos', icon: 'event_note' },
    { href: '/calendario', label: 'Calendário', icon: 'calendar_month' },
    { href: '/relatorios', label: 'Relatórios', icon: 'assessment' },
    { href: '/notifications', label: 'Notificações', icon: 'notifications' },
  ]

  const adminLinks = [
    { href: '/admin/usuarios', label: 'Gerenciar Usuários', icon: 'manage_accounts' },
    { href: '/admin/settings', label: 'Configurações', icon: 'settings' },
  ]

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-gray-700 z-40 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <nav className="h-full overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(link.href)
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="material-icons text-xl">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Links de Administração */}
          {session?.user?.role === 'ADMIN' && (
            <>
              <div className="px-3 mt-6 mb-2">
                <div className="flex items-center gap-2 px-4 py-2">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Administração
                  </span>
                </div>
              </div>
              <ul className="space-y-1 px-3">
                {adminLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive(link.href)
                          ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="material-icons text-xl">{link.icon}</span>
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </nav>
      </aside>
    </>
  )
}

