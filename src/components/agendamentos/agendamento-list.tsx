'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AgendamentoComRelacoes, StatusAgendamento } from '@/types/agendamento'
import { formatarDataHora, formatarDuracao } from '@/lib/date-utils'

interface AgendamentoListProps {
  agendamentos: AgendamentoComRelacoes[]
  onAgendamentoUpdated: () => void
  onEdit: (agendamento: AgendamentoComRelacoes) => void
}

const statusBadgeColors = {
  [StatusAgendamento.PENDENTE]: 'bg-yellow-100 text-yellow-800',
  [StatusAgendamento.CONFIRMADO]: 'bg-blue-100 text-blue-800',
  [StatusAgendamento.CONCLUIDO]: 'bg-green-100 text-green-800',
  [StatusAgendamento.CANCELADO]: 'bg-red-100 text-red-800',
}

const statusLabels = {
  [StatusAgendamento.PENDENTE]: 'Pendente',
  [StatusAgendamento.CONFIRMADO]: 'Confirmado',
  [StatusAgendamento.CONCLUIDO]: 'Concluído',
  [StatusAgendamento.CANCELADO]: 'Cancelado',
}

export function AgendamentoList({
  agendamentos,
  onAgendamentoUpdated,
  onEdit,
}: AgendamentoListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este agendamento?')) {
      return
    }

    setDeletingId(id)

    try {
      const response = await fetch(`/api/agendamentos/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erro ao remover agendamento')
      }

      onAgendamentoUpdated()
    } catch (error) {
      alert('Erro ao remover agendamento')
    } finally {
      setDeletingId(null)
    }
  }

  const handleCancelar = async (agendamento: AgendamentoComRelacoes) => {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) {
      return
    }

    setCancellingId(agendamento.id)

    try {
      const response = await fetch(`/api/agendamentos/${agendamento.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clienteId: agendamento.clienteId,
          servicosIds: agendamento.servicos.map((s) => s.servicoId),
          dataHoraInicio: agendamento.dataHoraInicio,
          dataHoraFim: agendamento.dataHoraFim,
          valorTotal: agendamento.valorTotal,
          duracaoTotal: agendamento.duracaoTotal,
          status: StatusAgendamento.CANCELADO,
          observacoes: agendamento.observacoes,
          confirmarConflito: true,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao cancelar agendamento')
      }

      onAgendamentoUpdated()
    } catch (error) {
      alert('Erro ao cancelar agendamento')
    } finally {
      setCancellingId(null)
    }
  }

  if (agendamentos.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">
            Nenhum agendamento cadastrado ainda.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {agendamentos.map((agendamento) => (
        <Card key={agendamento.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">
                  {agendamento.cliente.nome}
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  {agendamento.cliente.email}
                </p>
              </div>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  statusBadgeColors[agendamento.status]
                }`}
              >
                {statusLabels[agendamento.status]}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-600">
                  Data/Hora:
                </span>
                <p className="text-sm mt-1">
                  {formatarDataHora(agendamento.dataHoraInicio)} até{' '}
                  {formatarDataHora(agendamento.dataHoraFim)}
                </p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-600">
                  Duração:
                </span>
                <p className="text-sm mt-1">
                  {formatarDuracao(agendamento.duracaoTotal)}
                </p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-600">
                  Serviços:
                </span>
                <ul className="text-sm mt-1 space-y-1">
                  {agendamento.servicos.map((as) => (
                    <li key={as.id} className="flex items-center gap-2">
                      <span>•</span>
                      <span>{as.servico?.titulo}</span>
                      <span className="text-gray-500">
                        (€{as.valor} - {formatarDuracao(as.timeExecution)})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-600">
                  Valor Total:
                </span>
                <p className="text-sm mt-1 font-semibold">
                  €{parseFloat(agendamento.valorTotal).toFixed(2)}
                </p>
              </div>

              {agendamento.observacoes && (
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Observações:
                  </span>
                  <p className="text-sm mt-1 text-gray-700">
                    {agendamento.observacoes}
                  </p>
                </div>
              )}

              <div className="flex gap-2 mt-4 pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(agendamento)}
                  disabled={
                    deletingId === agendamento.id ||
                    cancellingId === agendamento.id
                  }
                >
                  Editar
                </Button>
                {agendamento.status !== StatusAgendamento.CANCELADO && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancelar(agendamento)}
                    disabled={
                      deletingId === agendamento.id ||
                      cancellingId === agendamento.id
                    }
                  >
                    {cancellingId === agendamento.id
                      ? 'Cancelando...'
                      : 'Cancelar'}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(agendamento.id)}
                  disabled={
                    deletingId === agendamento.id ||
                    cancellingId === agendamento.id
                  }
                >
                  {deletingId === agendamento.id ? 'Removendo...' : 'Remover'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

