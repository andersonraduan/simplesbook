'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAppName } from '@/components/app-name-provider'

export function SettingsClient() {
  const router = useRouter()
  const { appName: currentAppName, refreshAppName } = useAppName()
  const currentYear = new Date().getFullYear()
  
  const [appName, setAppName] = useState(currentAppName)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  useEffect(() => {
    setAppName(currentAppName)
  }, [currentAppName])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      
      if (response.ok) {
        const settings = await response.json()
        if (settings.APP_NAME) {
          setAppName(settings.APP_NAME)
        }
      }
    } catch (error) {
      console.error('Erro ao buscar configurações:', error)
      setMessage({ type: 'error', text: 'Erro ao carregar configurações' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!appName.trim()) {
      setMessage({ type: 'error', text: 'O nome da aplicação não pode ser vazio' })
      return
    }

    if (appName.length > 50) {
      setMessage({ type: 'error', text: 'O nome da aplicação não pode ter mais de 50 caracteres' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: 'APP_NAME',
          value: appName.trim()
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Nome da aplicação atualizado com sucesso! Recarregando...' })
        
        // Aguardar 1 segundo para mostrar a mensagem e recarregar a página completamente
        setTimeout(() => {
          window.location.href = '/admin/dashboard'
        }, 1000)
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao salvar configurações' })
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      setMessage({ type: 'error', text: 'Erro ao salvar configurações' })
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600 dark:text-gray-400">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      {/* Mensagens de Feedback */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center">
            <span className={`material-icons text-xl mr-2 ${
              message.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {message.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <p className={`text-sm font-medium ${
              message.type === 'success' ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
            }`}>
              {message.text}
            </p>
          </div>
        </div>
      )}

      {/* Card de Configuração */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="material-icons text-indigo-600 dark:text-indigo-400 text-3xl">edit</span>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Nome da Aplicação</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Este nome aparece no header, footer, login e título do navegador</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label htmlFor="appName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome da Aplicação
            </label>
            <input
              type="text"
              id="appName"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              maxLength={50}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white text-lg"
              placeholder="SimplesBook"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {appName.length}/50 caracteres
            </p>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Preview:</p>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {appName}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                © {currentYear} {appName}. Todos os direitos reservados.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSaving || !appName.trim()}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {isSaving ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  Salvando...
                </span>
              ) : (
                'Salvar Alterações'
              )}
            </button>
            <Link
              href="/admin/dashboard"
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 font-medium transition-colors text-center"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

