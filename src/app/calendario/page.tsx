'use client'

import { useEffect, useState } from 'react'
import { CalendarView } from '@/components/calendario/calendar-view'
import { AgendamentoDialog } from '@/components/agendamentos/agendamento-dialog'
import { AgendamentoForm } from '@/components/agendamentos/agendamento-form'
import { AppLayout } from '@/components/layout/app-layout'
import { AgendamentoComRelacoes } from '@/types/agendamento'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from '@/components/ui/dialog'
import { converterParaDateTimeLocal } from '@/lib/date-utils'
import { UserPreferences } from '@/types/preferences'
import { CalendarioView as CalendarioViewEnum } from '@prisma/client'

type ViewMode = 'day' | '3days' | 'week' | 'month'

export default function CalendarioPage() {
  const [agendamentos, setAgendamentos] = useState<AgendamentoComRelacoes[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAgendamento, setSelectedAgendamento] =
    useState<AgendamentoComRelacoes | null>(null)
  const [showAgendamentoDialog, setShowAgendamentoDialog] = useState(false)
  const [showFormDialog, setShowFormDialog] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null)
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/user/preferences')
      if (!response.ok) {
        throw new Error('Erro ao carregar preferências')
      }
      const data = await response.json()
      setPreferences(data)
    } catch (error) {
      console.error('Erro ao carregar preferências:', error)
      // Usar valores padrão se falhar
      setPreferences({
        id: '',
        userId: '',
        calendarioView: CalendarioViewEnum.SEMANA,
        horarioInicioAtendimento: '08:00',
        horarioFimAtendimento: '20:00',
        intervaloSlot: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }
  }

  const loadAgendamentos = async () => {
    try {
      const response = await fetch('/api/agendamentos')
      if (!response.ok) {
        throw new Error('Erro ao carregar agendamentos')
      }
      const data = await response.json()
      setAgendamentos(data)
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPreferences()
    loadAgendamentos()
  }, [])

  const handleSlotClick = (date: Date) => {
    setSelectedSlot(date)
    setShowFormDialog(true)
  }

  const handleAgendamentoClick = (agendamento: AgendamentoComRelacoes) => {
    setSelectedAgendamento(agendamento)
    setShowAgendamentoDialog(true)
  }

  const handleFormSuccess = () => {
    setShowFormDialog(false)
    setSelectedSlot(null)
    loadAgendamentos()
  }

  const handleFormCancel = () => {
    setShowFormDialog(false)
    setSelectedSlot(null)
  }

  // Converter preferência de view para o formato do componente
  const getInitialViewMode = (): ViewMode => {
    if (!preferences) return 'week'
    
    switch (preferences.calendarioView) {
      case CalendarioViewEnum.DIA:
        return 'day'
      case CalendarioViewEnum.TRES_DIAS:
        return '3days'
      case CalendarioViewEnum.SEMANA:
        return 'week'
      case CalendarioViewEnum.MES:
        return 'month'
      default:
        return 'week'
    }
  }

  if (loading || !preferences) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <AppLayout title="Calendário" subtitle="Visualize sua agenda completa" maxWidth="full">
      <CalendarView
        agendamentos={agendamentos}
        onSlotClick={handleSlotClick}
        onAgendamentoClick={handleAgendamentoClick}
        initialViewMode={getInitialViewMode()}
        horarioInicio={preferences.horarioInicioAtendimento}
        horarioFim={preferences.horarioFimAtendimento}
        intervaloSlot={preferences.intervaloSlot}
      />

      {/* Dialog de visualização de agendamento */}
      <AgendamentoDialog
        agendamento={selectedAgendamento}
        open={showAgendamentoDialog}
        onOpenChange={setShowAgendamentoDialog}
      />

      {/* Dialog de formulário de agendamento */}
      <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo Agendamento</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <AgendamentoFormWithPrefilledTime
              selectedSlot={selectedSlot}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </DialogBody>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}

// Componente auxiliar para pré-preencher o horário no formulário
function AgendamentoFormWithPrefilledTime({
  selectedSlot,
  onSuccess,
  onCancel,
}: {
  selectedSlot: Date | null
  onSuccess: () => void
  onCancel: () => void
}) {
  return (
    <AgendamentoFormCalendar
      selectedSlot={selectedSlot}
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  )
}

// Wrapper do formulário para pré-preencher data/hora do slot selecionado
function AgendamentoFormCalendar({
  selectedSlot,
  onSuccess,
  onCancel,
}: {
  selectedSlot: Date | null
  onSuccess: () => void
  onCancel: () => void
}) {
  const [key, setKey] = useState(0)

  useEffect(() => {
    // Forçar re-render quando slot mudar
    setKey((prev) => prev + 1)
  }, [selectedSlot])

  // Criar um objeto com apenas data/hora pré-preenchida para novos agendamentos
  const initialData = selectedSlot
    ? {
        dataHoraInicio: selectedSlot.toISOString(),
        dataHoraFim: new Date(selectedSlot.getTime() + 30 * 60000).toISOString(),
      }
    : undefined

  return (
    <div key={key}>
      <AgendamentoForm
        onSuccess={onSuccess}
        agendamentoInicial={undefined}
        initialDateTime={initialData}
        onCancel={onCancel}
      />
    </div>
  )
}

