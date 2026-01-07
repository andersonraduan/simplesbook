'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Verificar tema salvo ou preferência do sistema
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    
    if (savedTheme) {
      setTheme(savedTheme)
      applyTheme(savedTheme)
    } else {
      // Se não houver tema salvo, usar light como padrão
      setTheme('light')
      applyTheme('light')
    }
  }, [])

  const applyTheme = (newTheme: 'light' | 'dark') => {
    const root = document.documentElement
    
    if (newTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    
    localStorage.setItem('theme', newTheme)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    applyTheme(newTheme)
  }

  // Evitar hidratação mismatch
  if (!mounted) {
    return (
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          <div>
            <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
            <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="h-6 w-11 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <span className="material-icons text-white text-xl">
            {theme === 'dark' ? 'dark_mode' : 'light_mode'}
          </span>
        </div>
        <div>
          <Label className="text-base font-semibold text-gray-900 dark:text-white cursor-pointer">
            Modo {theme === 'dark' ? 'Escuro' : 'Claro'}
          </Label>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {theme === 'dark' 
              ? 'Interface com cores escuras para melhor conforto visual'
              : 'Interface com cores claras e vibrantes'
            }
          </p>
        </div>
      </div>

      {/* Toggle Switch */}
      <button
        type="button"
        role="switch"
        aria-checked={theme === 'dark'}
        onClick={toggleTheme}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'}
        `}
      >
        <span className="sr-only">Alternar modo escuro</span>
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  )
}

