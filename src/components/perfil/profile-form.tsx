'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, User } from 'lucide-react'

interface ProfileData {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  updatedAt: string
}

interface ProfileFormProps {
  onSave: (data: { name: string; email: string }) => Promise<void>
}

export function ProfileForm({ onSave }: ProfileFormProps) {
  const { update } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      setLoading(true)
      const response = await fetch('/api/user/profile')
      
      if (!response.ok) {
        throw new Error('Erro ao carregar perfil')
      }
      
      const data = await response.json()
      setProfile(data)
      setFormData({
        name: data.name || '',
        email: data.email || ''
      })
    } catch (err) {
      console.error('Erro ao carregar perfil:', err)
      setError('Erro ao carregar perfil')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validações
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setError('Nome deve ter pelo menos 2 caracteres')
      return
    }

    if (!formData.email.trim() || !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Email inválido')
      return
    }

    try {
      setSaving(true)
      await onSave(formData)
      
      // Atualizar sessão do NextAuth
      await update({
        name: formData.name,
        email: formData.email
      })
      
      setSuccess('Perfil atualizado com sucesso!')
      
      // Recarregar perfil e atualizar UI
      setTimeout(async () => {
        setSuccess(null)
        await loadProfile()
        // Forçar reload da página para garantir que todos os componentes sejam atualizados
        window.location.reload()
      }, 1500)
    } catch (err: any) {
      console.error('Erro ao salvar perfil:', err)
      setError(err.message || 'Erro ao salvar perfil')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-slate-600" />
            <CardTitle>Dados Pessoais</CardTitle>
          </div>
          <CardDescription>
            Atualize suas informações pessoais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Seu nome completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="seu@email.com"
              required
            />
          </div>

          {profile && (
            <div className="rounded-md bg-slate-50 p-3 text-sm">
              <p className="text-slate-600">
                <span className="font-medium">Função:</span>{' '}
                {profile.role === 'ADMIN' ? 'Administrador' : 'Usuário'}
              </p>
              <p className="mt-1 text-slate-600">
                <span className="font-medium">Membro desde:</span>{' '}
                {new Date(profile.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mensagens */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4 text-sm text-green-800">
          {success}
        </div>
      )}

      {/* Botão Salvar */}
      <Button type="submit" disabled={saving} className="w-full">
        {saving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          'Salvar Alterações'
        )}
      </Button>
    </form>
  )
}

