import { TipoNotificacao, CanalNotificacao, StatusNotificacao } from '@prisma/client'

export interface NotificationTemplate {
  id: string
  userId: string
  tipo: TipoNotificacao
  nome: string
  intervaloMinutos: number | null
  mensagemSMS: string | null
  mensagemWhatsApp: string | null
  habilitarSMS: boolean
  habilitarWhatsApp: boolean
  ativo: boolean
  createdAt: string
  updatedAt: string
}

export interface NotificationScheduled {
  id: string
  agendamentoId: string
  templateId: string
  canal: CanalNotificacao
  destinatario: string
  mensagem: string
  dataHoraAgendada: string
  status: StatusNotificacao
  tentativas: number
  ultimaTentativa: string | null
  erroMensagem: string | null
  createdAt: string
  updatedAt: string
}

export interface NotificationLog {
  id: string
  agendamentoId: string
  tipo: TipoNotificacao
  canal: CanalNotificacao
  destinatario: string
  mensagem: string
  status: StatusNotificacao
  twilioSid: string | null
  erroMensagem: string | null
  createdAt: string
}

export const tipoNotificacaoLabels: Record<TipoNotificacao, string> = {
  CONFIRMACAO: 'Confirmação',
  LEMBRETE: 'Lembrete',
  DIA_DO_AGENDAMENTO: 'Dia do Agendamento',
  CANCELAMENTO: 'Cancelamento',
  MUDANCA_STATUS: 'Mudança de Status'
}

export const canalNotificacaoLabels: Record<CanalNotificacao, string> = {
  SMS: 'SMS',
  WHATSAPP: 'WhatsApp'
}

export const statusNotificacaoLabels: Record<StatusNotificacao, string> = {
  PENDENTE: 'Pendente',
  ENVIADA: 'Enviada',
  FALHA: 'Falha',
  CANCELADA: 'Cancelada'
}

