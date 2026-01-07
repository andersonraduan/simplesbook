'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { ProfileForm } from '@/components/perfil/profile-form'
import { PasswordForm } from '@/components/perfil/password-form'

export default function PerfilPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar autenticação
    fetch('/api/user/profile')
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

  async function handleSaveProfile(data: { name: string; email: string }) {
    const response = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Erro ao salvar perfil')
    }

    return response.json()
  }

  async function handleSavePassword(data: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }) {
    const response = await fetch('/api/user/password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Erro ao alterar senha')
    }

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
      title="Meu Perfil" 
      subtitle="Gerencie suas informações pessoais e segurança da conta"
      maxWidth="sm"
    >
      <div className="space-y-8">
        {/* Formulário de Perfil */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
          <ProfileForm onSave={handleSaveProfile} />
        </div>

        {/* Formulário de Senha */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
          <PasswordForm onSave={handleSavePassword} />
        </div>
      </div>
    </AppLayout>
  )
}

