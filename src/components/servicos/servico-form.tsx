'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ServicoFormProps {
  onSuccess: () => void
  servicoInicial?: {
    id: string
    titulo: string
    descricao: string
    valor: string
    timeExecution: number
  }
  onCancel?: () => void
}

export function ServicoForm({ onSuccess, servicoInicial, onCancel }: ServicoFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    titulo: servicoInicial?.titulo || '',
    descricao: servicoInicial?.descricao || '',
    valor: servicoInicial?.valor || '',
    timeExecution: servicoInicial?.timeExecution?.toString() || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = servicoInicial
        ? `/api/servicos/${servicoInicial.id}`
        : '/api/servicos'
      
      const method = servicoInicial ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          valor: parseFloat(formData.valor),
          timeExecution: parseInt(formData.timeExecution),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao salvar serviço')
      }

      setFormData({
        titulo: '',
        descricao: '',
        valor: '',
        timeExecution: '',
      })
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar serviço')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {servicoInicial ? 'Editar Serviço' : 'Novo Serviço'}
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
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              name="titulo"
              type="text"
              value={formData.titulo}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              required
              disabled={loading}
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor">Valor (€)</Label>
            <Input
              id="valor"
              name="valor"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.valor}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeExecution">Tempo de Execução (minutos)</Label>
            <Input
              id="timeExecution"
              name="timeExecution"
              type="number"
              min="1"
              value={formData.timeExecution}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="30"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading
                ? 'Salvando...'
                : servicoInicial
                ? 'Atualizar'
                : 'Criar Serviço'}
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

