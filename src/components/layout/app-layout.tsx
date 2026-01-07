'use client'

import { ReactNode, useState } from 'react'
import { AppNav } from './app-nav'
import { AppSidebar } from './app-sidebar'
import { useAppName } from '@/components/app-name-provider'

interface AppLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full'
}

const maxWidthClasses = {
  sm: 'max-w-3xl',
  md: 'max-w-4xl',
  lg: 'max-w-5xl',
  xl: 'max-w-6xl',
  '2xl': 'max-w-7xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-[1600px]',
}

export function AppLayout({ children, title, subtitle, maxWidth = '7xl' }: AppLayoutProps) {
  const { appName } = useAppName()
  const currentYear = new Date().getFullYear()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900">
      <AppNav onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className={`flex-1 ${maxWidthClasses[maxWidth]} w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24 lg:ml-64 transition-all duration-300`}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg text-gray-600 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
        {children}
      </main>

      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-gray-700 mt-auto lg:ml-64 transition-all duration-300">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {currentYear} {appName}. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                Ajuda
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                Termos
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                Privacidade
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

