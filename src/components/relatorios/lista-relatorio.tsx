'use client'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { AgendamentoComRelacoes, StatusAgendamento } from '@/types/agendamento'

interface ListaRelatorioProps {
  agendamentos: AgendamentoComRelacoes[]
}

const statusLabels: Record<StatusAgendamento, string> = {
  PENDENTE: 'Pendente',
  CONFIRMADO: 'Confirmado',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
}

const statusColors: Record<
  StatusAgendamento,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  PENDENTE: 'secondary',
  CONFIRMADO: 'default',
  CONCLUIDO: 'outline',
  CANCELADO: 'destructive',
}

export function ListaRelatorio({ agendamentos }: ListaRelatorioProps) {
  const formatarData = (dataString: string) => {
    const data = new Date(dataString)
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatarHora = (dataString: string) => {
    const data = new Date(dataString)
    return data.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatarValor = (valor: string) => {
    const numero = parseFloat(valor)
    return numero.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  if (agendamentos.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">Nenhum agendamento encontrado</p>
          <p className="text-sm mt-2">
            Tente ajustar os filtros para visualizar outros resultados
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {agendamentos.map((agendamento) => (
        <Card key={agendamento.id} className="p-6 hover:shadow-md transition-shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Data e Horário */}
            <div>
              <span className="text-xs font-medium text-gray-500 uppercase">
                Data e Horário
              </span>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                {formatarData(agendamento.dataHoraInicio)}
              </p>
              <p className="text-sm text-gray-600">
                {formatarHora(agendamento.dataHoraInicio)} -{' '}
                {formatarHora(agendamento.dataHoraFim)}
              </p>
            </div>

            {/* Cliente */}
            <div>
              <span className="text-xs font-medium text-gray-500 uppercase">
                Cliente
              </span>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                {agendamento.cliente.nome}
              </p>
              <p className="text-sm text-gray-600">
                {agendamento.cliente.telemovel}
              </p>
            </div>

            {/* Status */}
            <div>
              <span className="text-xs font-medium text-gray-500 uppercase">
                Status
              </span>
              <div className="mt-1">
                <Badge variant={statusColors[agendamento.status]}>
                  {statusLabels[agendamento.status]}
                </Badge>
              </div>
            </div>

            {/* Valor */}
            <div>
              <span className="text-xs font-medium text-gray-500 uppercase">
                Valor Total
              </span>
              <p className="text-sm font-bold text-green-600 mt-1">
                R$ {formatarValor(agendamento.valorTotal)}
              </p>
              <p className="text-xs text-gray-500">
                {agendamento.duracaoTotal} min
              </p>
            </div>
          </div>

          {/* Serviços */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <span className="text-xs font-medium text-gray-500 uppercase">
              Serviços
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              {agendamento.servicos.map((as) => (
                <div
                  key={as.id}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full"
                >
                  <span className="text-sm text-gray-700">
                    {as.servico?.titulo || 'Serviço'}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({as.timeExecution} min)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Observações */}
          {agendamento.observacoes && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <span className="text-xs font-medium text-gray-500 uppercase">
                Observações
              </span>
              <p className="text-sm text-gray-700 mt-1">
                {agendamento.observacoes}
              </p>
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}

