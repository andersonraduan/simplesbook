import { CalendarioView } from '@prisma/client'

export interface UserPreferences {
  id: string
  userId: string
  calendarioView: CalendarioView
  horarioInicioAtendimento: string
  horarioFimAtendimento: string
  intervaloSlot: number
  createdAt: Date
  updatedAt: Date
}

export const calendarioViewLabels: Record<CalendarioView, string> = {
  DIA: 'Dia',
  TRES_DIAS: '3 Dias',
  SEMANA: 'Semana',
  MES: 'Mês'
}

export const intervaloSlotOptions = [
  { value: 15, label: '15 minutos' },
  { value: 30, label: '30 minutos' },
  { value: 60, label: '60 minutos' }
]

