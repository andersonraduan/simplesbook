'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusAgendamento } from '@/types/agendamento'

interface MetricasRelatorio {
  totalAgendamentos: number
  valorTotal: string
  porStatus: {
    status: StatusAgendamento
    quantidade: number
    percentual: number
  }[]
  taxaConclusao: number
}

interface MetricasRelatorioProps {
  metricas: MetricasRelatorio
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

export function MetricasRelatorio({ metricas }: MetricasRelatorioProps) {
  const formatarValor = (valor: string) => {
    const numero = parseFloat(valor)
    return numero.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total de Agendamentos */}
      <Card className="p-6">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-500 mb-1">
            Total de Agendamentos
          </span>
          <span className="text-3xl font-bold text-gray-900">
            {metricas.totalAgendamentos}
          </span>
        </div>
      </Card>

      {/* Valor Total */}
      <Card className="p-6">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-500 mb-1">
            Valor Total
          </span>
          <span className="text-3xl font-bold text-green-600">
            R$ {formatarValor(metricas.valorTotal)}
          </span>
        </div>
      </Card>

      {/* Taxa de Conclusão */}
      <Card className="p-6">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-500 mb-1">
            Taxa de Conclusão
          </span>
          <span className="text-3xl font-bold text-blue-600">
            {metricas.taxaConclusao.toFixed(1)}%
          </span>
        </div>
      </Card>

      {/* Distribuição por Status */}
      <Card className="p-6">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-500 mb-3">
            Por Status
          </span>
          <div className="space-y-2">
            {metricas.porStatus.length > 0 ? (
              metricas.porStatus.map((item) => (
                <div
                  key={item.status}
                  className="flex items-center justify-between"
                >
                  <Badge variant={statusColors[item.status]} className="text-xs">
                    {statusLabels[item.status]}
                  </Badge>
                  <span className="text-sm font-semibold text-gray-700">
                    {item.quantidade} ({item.percentual.toFixed(0)}%)
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Nenhum dado disponível</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

