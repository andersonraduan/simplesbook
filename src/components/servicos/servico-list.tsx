'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Servico {
  id: string
  titulo: string
  descricao: string
  valor: string
  timeExecution: number
  createdAt: string
}

interface ServicoListProps {
  servicos: Servico[]
  onServicoUpdated: () => void
  onEdit: (servico: Servico) => void
}

export function ServicoList({ servicos, onServicoUpdated, onEdit }: ServicoListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este serviço?')) {
      return
    }

    setDeletingId(id)

    try {
      const response = await fetch(`/api/servicos/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erro ao remover serviço')
      }

      onServicoUpdated()
    } catch (error) {
      alert('Erro ao remover serviço')
    } finally {
      setDeletingId(null)
    }
  }

  const formatarValor = (valorString: string) => {
    const valor = parseFloat(valorString)
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
    }).format(valor)
  }

  const formatarTempo = (minutos: number) => {
    if (minutos < 60) {
      return `${minutos} min`
    }
    const horas = Math.floor(minutos / 60)
    const minutosRestantes = minutos % 60
    if (minutosRestantes === 0) {
      return `${horas}h`
    }
    return `${horas}h ${minutosRestantes}min`
  }

  if (servicos.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">
            Nenhum serviço cadastrado ainda.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {servicos.map((servico) => (
        <Card key={servico.id}>
          <CardHeader>
            <CardTitle className="text-lg">{servico.titulo}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600 mb-1">Descrição:</p>
                <p className="text-sm whitespace-pre-wrap">{servico.descricao}</p>
              </div>
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Valor:</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatarValor(servico.valor)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Duração:</span>
                  <span className="text-sm font-semibold text-blue-600">
                    {formatarTempo(servico.timeExecution)}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(servico)}
                >
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(servico.id)}
                  disabled={deletingId === servico.id}
                >
                  {deletingId === servico.id ? 'Removendo...' : 'Remover'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

