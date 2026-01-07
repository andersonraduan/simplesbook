import { StatusAgendamento } from '@prisma/client'

export { StatusAgendamento }

export interface AgendamentoServico {
  id: string
  agendamentoId: string
  servicoId: string
  valor: string
  timeExecution: number
  createdAt: string
  servico?: {
    id: string
    titulo: string
    descricao: string
  }
}

export interface Agendamento {
  id: string
  clienteId: string
  userId: string
  dataHoraInicio: string
  dataHoraFim: string
  valorTotal: string
  duracaoTotal: number
  status: StatusAgendamento
  observacoes?: string | null
  createdAt: string
  updatedAt: string
}

export interface AgendamentoComRelacoes extends Agendamento {
  cliente: {
    id: string
    nome: string
    email: string
    telemovel: string
  }
  servicos: AgendamentoServico[]
}

export interface AgendamentoFormData {
  clienteId: string
  servicosIds: string[]
  dataHoraInicio: string
  dataHoraFim: string
  valorTotal: string
  duracaoTotal: number
  status: StatusAgendamento
  observacoes?: string
  confirmarConflito?: boolean
}

export interface ConflictCheckResponse {
  hasConflict: boolean
  conflitos: Array<{
    id: string
    dataHoraInicio: string
    dataHoraFim: string
    cliente: {
      nome: string
    }
  }>
}

