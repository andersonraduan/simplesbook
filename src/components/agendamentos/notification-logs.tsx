'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatarDataHora } from '@/lib/date-utils'
import { 
  TipoNotificacao, 
  CanalNotificacao, 
  StatusNotificacao 
} from '@prisma/client'

interface NotificationLog {
  id: string
  tipo: TipoNotificacao
  canal: CanalNotificacao
  destinatario: string
  mensagem: string
  status: StatusNotificacao
  twilioSid: string | null
  erroMensagem: string | null
  createdAt: string
}

interface NotificationLogsProps {
  agendamentoId: string
}

export function NotificationLogs({ agendamentoId }: NotificationLogsProps) {
  const [logs, setLogs] = useState<NotificationLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/agendamentos/${agendamentoId}/logs`)
        
        if (!response.ok) {
          throw new Error('Erro ao carregar logs')
        }

        const data = await response.json()
        setLogs(data)
      } catch (err) {
        console.error('Erro ao carregar logs:', err)
        setError(err instanceof Error ? err.message : 'Erro ao carregar logs')
      } finally {
        setLoading(false)
      }
    }

    if (agendamentoId) {
      fetchLogs()
    }
  }, [agendamentoId])

  const getStatusColor = (status: StatusNotificacao) => {
    switch (status) {
      case StatusNotificacao.ENVIADA:
        return 'bg-green-100 text-green-800'
      case StatusNotificacao.FALHA:
        return 'bg-red-100 text-red-800'
      case StatusNotificacao.PENDENTE:
        return 'bg-yellow-100 text-yellow-800'
      case StatusNotificacao.CANCELADA:
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTipoLabel = (tipo: TipoNotificacao) => {
    switch (tipo) {
      case TipoNotificacao.CONFIRMACAO:
        return 'Confirmação'
      case TipoNotificacao.LEMBRETE:
        return 'Lembrete'
      case TipoNotificacao.DIA_DO_AGENDAMENTO:
        return 'Dia do Agendamento'
      case TipoNotificacao.CANCELAMENTO:
        return 'Cancelamento'
      case TipoNotificacao.MUDANCA_STATUS:
        return 'Mudança de Status'
      default:
        return tipo
    }
  }

  const getCanalIcon = (canal: CanalNotificacao) => {
    switch (canal) {
      case CanalNotificacao.SMS:
        return '📱'
      case CanalNotificacao.WHATSAPP:
        return '💬'
      default:
        return '📧'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Notificações</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-4">
            Carregando logs...
          </p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Notificações</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600 text-center py-4">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Notificações</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-4">
            Nenhuma notificação enviada ainda
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Notificações</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {logs.map((log) => (
            <div
              key={log.id}
              className="border rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getCanalIcon(log.canal)}</span>
                  <span className="text-sm font-medium">
                    {getTipoLabel(log.tipo)}
                  </span>
                  <Badge className={getStatusColor(log.status)}>
                    {log.status}
                  </Badge>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {formatarDataHora(log.createdAt)}
                </span>
              </div>

              <div className="space-y-1 text-sm">
                <p className="text-gray-600">
                  <span className="font-medium">Canal:</span> {log.canal}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Destinatário:</span>{' '}
                  {log.destinatario}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Mensagem:</span>
                </p>
                <p className="text-xs bg-white p-2 rounded border italic">
                  {log.mensagem}
                </p>

                {log.twilioSid && (
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">ID Twilio:</span>{' '}
                    {log.twilioSid}
                  </p>
                )}

                {log.erroMensagem && (
                  <p className="text-xs text-red-600 mt-1">
                    <span className="font-medium">Erro:</span>{' '}
                    {log.erroMensagem}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

