'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Lock } from 'lucide-react'

interface PasswordFormProps {
  onSave: (data: { 
    currentPassword: string
    newPassword: string
    confirmPassword: string 
  }) => Promise<void>
}

export function PasswordForm({ onSave }: PasswordFormProps) {
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validações
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('Todos os campos são obrigatórios')
      return
    }

    if (formData.newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres')
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('A nova senha e a confirmação não coincidem')
      return
    }

    try {
      setSaving(true)
      await onSave(formData)
      setSuccess('Senha alterada com sucesso!')
      
      // Limpar formulário após sucesso
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })

      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSuccess(null)
      }, 3000)
    } catch (err: any) {
      console.error('Erro ao alterar senha:', err)
      setError(err.message || 'Erro ao alterar senha')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-slate-600" />
            <CardTitle>Alterar Senha</CardTitle>
          </div>
          <CardDescription>
            Atualize sua senha de acesso ao sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Senha atual</Label>
            <Input
              id="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={(e) =>
                setFormData({ ...formData, currentPassword: e.target.value })
              }
              placeholder="Digite sua senha atual"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova senha</Label>
            <Input
              id="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={(e) =>
                setFormData({ ...formData, newPassword: e.target.value })
              }
              placeholder="Digite sua nova senha"
              required
            />
            <p className="text-xs text-slate-500">
              Mínimo de 6 caracteres
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              placeholder="Confirme sua nova senha"
              required
            />
          </div>
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
            Alterando senha...
          </>
        ) : (
          'Alterar Senha'
        )}
      </Button>
    </form>
  )
}

