'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { PreferencesForm } from '@/components/preferences/preferences-form'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { UserPreferences } from '@/types/preferences'

export default function ConfiguracoesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar autenticação
    fetch('/api/user/preferences')
      .then((res) => {
        if (res.status === 401) {
          router.push('/login')
        }
        setLoading(false)
      })
      .catch(() => {
        router.push('/login')
      })
  }, [router])

  async function handleSave(preferences: Partial<UserPreferences>) {
    const response = await fetch('/api/user/preferences', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Erro ao salvar preferências')
    }

    // Recarregar página do calendário se estiver em cache
    router.refresh()
    
    return response.json()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <AppLayout 
      title="Configurações" 
      subtitle="Personalize suas preferências e aparência"
      maxWidth="sm"
    >
      <div className="space-y-6">
        {/* Seção de Aparência */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="material-icons text-blue-600 dark:text-blue-400">palette</span>
              Aparência
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Personalize o tema da interface
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Seção de Preferências do Calendário */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="material-icons text-blue-600 dark:text-blue-400">event</span>
              Preferências do Calendário
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Configure horários e visualizações
            </p>
          </div>
          <PreferencesForm onSave={handleSave} />
        </div>
      </div>
    </AppLayout>
  )
}

