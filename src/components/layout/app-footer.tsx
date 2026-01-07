'use client'

import { useAppName } from '@/components/app-name-provider'

export function AppFooter() {
  const { appName } = useAppName()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
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
  )
}

