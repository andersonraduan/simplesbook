'use client'

import { AgendamentoComRelacoes, StatusAgendamento } from '@/types/agendamento'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatarDataHora } from '@/lib/date-utils'
import { useRouter } from 'next/navigation'
import { NotificationLogs } from './notification-logs'

interface AgendamentoDialogProps {
  agendamento: AgendamentoComRelacoes | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AgendamentoDialog({
  agendamento,
  open,
  onOpenChange,
}: AgendamentoDialogProps) {
  const router = useRouter()

  if (!agendamento) return null

  const handleEdit = () => {
    onOpenChange(false)
    router.push(`/agendamentos?edit=${agendamento.id}`)
  }

  const getStatusColor = (status: StatusAgendamento) => {
    switch (status) {
      case StatusAgendamento.PENDENTE:
        return 'bg-yellow-100 text-yellow-800'
      case StatusAgendamento.CONFIRMADO:
        return 'bg-blue-100 text-blue-800'
      case StatusAgendamento.CONCLUIDO:
        return 'bg-green-100 text-green-800'
      case StatusAgendamento.CANCELADO:
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalhes do Agendamento</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-4">
            {/* Cliente */}
            <div>
              <label className="text-sm font-medium text-gray-700">Cliente</label>
              <p className="text-base mt-1">{agendamento.cliente.nome}</p>
              <p className="text-sm text-gray-500">{agendamento.cliente.email}</p>
              <p className="text-sm text-gray-500">{agendamento.cliente.telemovel}</p>
            </div>

            {/* Data e Hora */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Início</label>
                <p className="text-base mt-1">
                  {formatarDataHora(agendamento.dataHoraInicio)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Fim</label>
                <p className="text-base mt-1">
                  {formatarDataHora(agendamento.dataHoraFim)}
                </p>
              </div>
            </div>

            {/* Serviços */}
            <div>
              <label className="text-sm font-medium text-gray-700">Serviços</label>
              <ul className="mt-2 space-y-1">
                {agendamento.servicos.map((s) => (
                  <li key={s.id} className="text-sm">
                    • {s.servico?.titulo} - €{s.valor} ({s.timeExecution} min)
                  </li>
                ))}
              </ul>
            </div>

            {/* Valores e Duração */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Valor Total</label>
                <p className="text-base mt-1 font-semibold">€{agendamento.valorTotal}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Duração Total</label>
                <p className="text-base mt-1">{agendamento.duracaoTotal} minutos</p>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <div className="mt-1">
                <Badge className={getStatusColor(agendamento.status)}>
                  {agendamento.status}
                </Badge>
              </div>
            </div>

            {/* Observações */}
            {agendamento.observacoes && (
              <div>
                <label className="text-sm font-medium text-gray-700">Observações</label>
                <p className="text-base mt-1 text-gray-600">{agendamento.observacoes}</p>
              </div>
            )}

            {/* Logs de Notificações */}
            <div className="mt-6">
              <NotificationLogs agendamentoId={agendamento.id} />
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button onClick={handleEdit}>Editar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

