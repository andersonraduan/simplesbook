'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ClienteFormProps {
  onSuccess: () => void
  clienteInicial?: {
    id: string
    nome: string
    email: string
    telemovel: string
    dataNascimento: string
  }
  onCancel?: () => void
}

export function ClienteForm({ onSuccess, clienteInicial, onCancel }: ClienteFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    nome: clienteInicial?.nome || '',
    email: clienteInicial?.email || '',
    telemovel: clienteInicial?.telemovel || '',
    dataNascimento: clienteInicial?.dataNascimento?.split('T')[0] || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = clienteInicial
        ? `/api/clientes/${clienteInicial.id}`
        : '/api/clientes'
      
      const method = clienteInicial ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao salvar cliente')
      }

      setFormData({
        nome: '',
        email: '',
        telemovel: '',
        dataNascimento: '',
      })
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar cliente')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {clienteInicial ? 'Editar Cliente' : 'Novo Cliente'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              name="nome"
              type="text"
              value={formData.nome}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telemovel">Telemóvel / WhatsApp</Label>
            <Input
              id="telemovel"
              name="telemovel"
              type="tel"
              value={formData.telemovel}
              onChange={handleChange}
              placeholder="+351912345678 ou 912345678"
              required
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              💡 Formato: +351 (código país) + número. Ex: +351912345678
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataNascimento">Data de Nascimento</Label>
            <Input
              id="dataNascimento"
              name="dataNascimento"
              type="date"
              value={formData.dataNascimento}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading
                ? 'Salvando...'
                : clienteInicial
                ? 'Atualizar'
                : 'Criar Cliente'}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

