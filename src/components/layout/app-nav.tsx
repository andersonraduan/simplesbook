'use client'

import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useAppName } from '@/components/app-name-provider'

interface AppNavProps {
  onMenuToggle: () => void
}

export function AppNav({ onMenuToggle }: AppNavProps) {
  const { data: session } = useSession()
  const { appName } = useAppName()

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <nav className="bg-white dark:bg-slate-800 shadow-sm fixed top-0 left-0 right-0 z-50 border-b border-gray-200 dark:border-gray-700">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuToggle}
              type="button"
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Abrir menu</span>
              <span className="material-icons">menu</span>
            </button>
            <Link href="/dashboard" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {appName}
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/configuracoes"
              className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
              title="Configurações"
            >
              <span className="material-icons text-xl">settings</span>
            </Link>
            {session?.user && (
              <Link 
                href="/perfil"
                className="flex items-center ml-2 border-l border-gray-200 dark:border-gray-700 pl-3 hover:opacity-80 transition-opacity cursor-pointer"
                title="Ir para o perfil"
              >
                <div className="hidden sm:flex flex-col items-end mr-3">
                  <span className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
                    {session.user.name || 'Usuário'}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {session.user.email}
                  </span>
                </div>
                <div className="h-9 w-9 rounded-full ring-2 ring-white dark:ring-gray-800 bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                  {session.user.name?.charAt(0).toUpperCase() ||
                    session.user.email?.charAt(0).toUpperCase()}
                </div>
              </Link>
            )}
            <button
              onClick={handleLogout}
              type="button"
              className="hidden sm:block ml-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all shadow-sm"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
