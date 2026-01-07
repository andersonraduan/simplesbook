'use client'

import { useState, useMemo } from 'react'
import { AgendamentoComRelacoes } from '@/types/agendamento'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CalendarioView } from '@prisma/client'

type ViewMode = 'day' | '3days' | 'week' | 'month'

interface CalendarViewProps {
  agendamentos: AgendamentoComRelacoes[]
  onSlotClick: (date: Date) => void
  onAgendamentoClick: (agendamento: AgendamentoComRelacoes) => void
  initialViewMode?: ViewMode
  horarioInicio?: string
  horarioFim?: string
  intervaloSlot?: number
}

export function CalendarView({
  agendamentos,
  onSlotClick,
  onAgendamentoClick,
  initialViewMode = 'week',
  horarioInicio = '08:00',
  horarioFim = '20:00',
  intervaloSlot = 30,
}: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode)
  const [currentDate, setCurrentDate] = useState(new Date())

  // Converter ViewMode para CalendarioView do Prisma
  const convertViewModeToCalendarioView = (mode: ViewMode): CalendarioView => {
    switch (mode) {
      case 'day':
        return CalendarioView.DIA
      case '3days':
        return CalendarioView.TRES_DIAS
      case 'week':
        return CalendarioView.SEMANA
      case 'month':
        return CalendarioView.MES
      default:
        return CalendarioView.SEMANA
    }
  }

  // Salvar preferência ao mudar visualização
  const handleViewModeChange = async (mode: ViewMode) => {
    setViewMode(mode)
    
    // Salvar preferência no backend
    try {
      await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          calendarioView: convertViewModeToCalendarioView(mode)
        }),
      })
    } catch (error) {
      console.error('Erro ao salvar preferência de visualização:', error)
    }
  }

  const navigatePrev = () => {
    const newDate = new Date(currentDate)
    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() - 1)
        break
      case '3days':
        newDate.setDate(newDate.getDate() - 3)
        break
      case 'week':
        newDate.setDate(newDate.getDate() - 7)
        break
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1)
        break
    }
    setCurrentDate(newDate)
  }

  const navigateNext = () => {
    const newDate = new Date(currentDate)
    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() + 1)
        break
      case '3days':
        newDate.setDate(newDate.getDate() + 3)
        break
      case 'week':
        newDate.setDate(newDate.getDate() + 7)
        break
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1)
        break
    }
    setCurrentDate(newDate)
  }

  const navigateToday = () => {
    setCurrentDate(new Date())
  }

  const getDateRange = (): Date[] => {
    const dates: Date[] = []
    const start = new Date(currentDate)

    if (viewMode === 'day') {
      dates.push(start)
    } else if (viewMode === '3days') {
      for (let i = 0; i < 3; i++) {
        const date = new Date(start)
        date.setDate(date.getDate() + i)
        dates.push(date)
      }
    } else if (viewMode === 'week') {
      // Começar na segunda-feira
      const dayOfWeek = start.getDay()
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      start.setDate(start.getDate() + diff)

      for (let i = 0; i < 7; i++) {
        const date = new Date(start)
        date.setDate(date.getDate() + i)
        dates.push(date)
      }
    } else if (viewMode === 'month') {
      const year = start.getFullYear()
      const month = start.getMonth()
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)

      // Começar na segunda anterior ao primeiro dia
      const startDay = new Date(firstDay)
      const dayOfWeek = startDay.getDay()
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      startDay.setDate(startDay.getDate() + diff)

      // Adicionar dias até completar semanas
      let currentDay = new Date(startDay)
      while (currentDay <= lastDay || dates.length % 7 !== 0) {
        dates.push(new Date(currentDay))
        currentDay.setDate(currentDay.getDate() + 1)
      }
    }

    return dates
  }

  const formatDateHeader = () => {
    const monthNames = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ]

    if (viewMode === 'month') {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
    }

    const dates = getDateRange()
    if (dates.length === 1) {
      return `${dates[0].getDate()} de ${monthNames[dates[0].getMonth()]} ${dates[0].getFullYear()}`
    }

    const first = dates[0]
    const last = dates[dates.length - 1]

    if (first.getMonth() === last.getMonth()) {
      return `${first.getDate()}-${last.getDate()} de ${monthNames[first.getMonth()]} ${first.getFullYear()}`
    } else {
      return `${first.getDate()} ${monthNames[first.getMonth()]} - ${last.getDate()} ${monthNames[last.getMonth()]} ${first.getFullYear()}`
    }
  }

  return (
    <div className="space-y-4">
      {/* Controles de navegação */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={navigatePrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={navigateToday}>
              Hoje
            </Button>
            <Button variant="outline" size="sm" onClick={navigateNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold ml-4">{formatDateHeader()}</h2>
          </div>

          <div className="flex gap-2">
            <Button
              variant={viewMode === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleViewModeChange('day')}
            >
              Dia
            </Button>
            <Button
              variant={viewMode === '3days' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleViewModeChange('3days')}
            >
              3 Dias
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleViewModeChange('week')}
            >
              Semana
            </Button>
            <Button
              variant={viewMode === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleViewModeChange('month')}
            >
              Mês
            </Button>
          </div>
        </div>
      </Card>

      {/* Visualização do calendário */}
      {viewMode === 'month' ? (
        <MonthView
          dates={getDateRange()}
          agendamentos={agendamentos}
          onDayClick={onSlotClick}
          onAgendamentoClick={onAgendamentoClick}
        />
      ) : (
        <WeekDayView
          dates={getDateRange()}
          agendamentos={agendamentos}
          onSlotClick={onSlotClick}
          onAgendamentoClick={onAgendamentoClick}
          horarioInicio={horarioInicio}
          horarioFim={horarioFim}
          intervaloSlot={intervaloSlot}
        />
      )}
    </div>
  )
}

interface MonthViewProps {
  dates: Date[]
  agendamentos: AgendamentoComRelacoes[]
  onDayClick: (date: Date) => void
  onAgendamentoClick: (agendamento: AgendamentoComRelacoes) => void
}

function MonthView({ dates, agendamentos, onDayClick, onAgendamentoClick }: MonthViewProps) {
  const dayNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
  const weeks: Date[][] = []

  for (let i = 0; i < dates.length; i += 7) {
    weeks.push(dates.slice(i, i + 7))
  }

  const getAgendamentosForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return agendamentos.filter((ag) => {
      const agDate = new Date(ag.dataHoraInicio).toISOString().split('T')[0]
      return agDate === dateStr
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  return (
    <Card className="p-4">
      <div className="grid grid-cols-7 gap-2">
        {/* Cabeçalho dos dias */}
        {dayNames.map((day) => (
          <div key={day} className="text-center font-semibold text-sm py-2">
            {day}
          </div>
        ))}

        {/* Dias do mês */}
        {weeks.map((week, weekIdx) =>
          week.map((date, dayIdx) => {
            const dayAgendamentos = getAgendamentosForDay(date)
            return (
              <div
                key={`${weekIdx}-${dayIdx}`}
                className={`min-h-24 border rounded p-2 cursor-pointer hover:bg-gray-50 ${
                  isToday(date) ? 'bg-blue-50 border-blue-300' : ''
                }`}
                onClick={() => onDayClick(date)}
              >
                <div className="text-sm font-medium mb-1">{date.getDate()}</div>
                <div className="space-y-1">
                  {dayAgendamentos.slice(0, 3).map((ag) => (
                    <div
                      key={ag.id}
                      className="text-xs bg-blue-100 text-blue-800 p-1 rounded truncate"
                      onClick={(e) => {
                        e.stopPropagation()
                        onAgendamentoClick(ag)
                      }}
                    >
                      {new Date(ag.dataHoraInicio).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      {ag.cliente.nome}
                    </div>
                  ))}
                  {dayAgendamentos.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{dayAgendamentos.length - 3} mais
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </Card>
  )
}

interface WeekDayViewProps {
  dates: Date[]
  agendamentos: AgendamentoComRelacoes[]
  onSlotClick: (date: Date) => void
  onAgendamentoClick: (agendamento: AgendamentoComRelacoes) => void
  horarioInicio: string
  horarioFim: string
  intervaloSlot: number
}

function WeekDayView({
  dates,
  agendamentos,
  onSlotClick,
  onAgendamentoClick,
  horarioInicio,
  horarioFim,
  intervaloSlot,
}: WeekDayViewProps) {
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  // Gerar time slots baseado nas preferências
  const generateTimeSlots = () => {
    const [horaInicio, minInicio] = horarioInicio.split(':').map(Number)
    const [horaFim, minFim] = horarioFim.split(':').map(Number)
    
    const startMinutes = horaInicio * 60 + minInicio
    const endMinutes = horaFim * 60 + minFim
    
    const slots: { hour: number; minute: number }[] = []
    
    for (let min = startMinutes; min < endMinutes; min += intervaloSlot) {
      const hour = Math.floor(min / 60)
      const minute = min % 60
      slots.push({ hour, minute })
    }
    
    return slots
  }

  const timeSlots = useMemo(() => generateTimeSlots(), [horarioInicio, horarioFim, intervaloSlot])

  const getAgendamentosForSlot = (date: Date, hour: number, minute: number) => {
    const slotStart = new Date(date)
    slotStart.setHours(hour, minute, 0, 0)
    const slotEnd = new Date(slotStart)
    slotEnd.setMinutes(slotEnd.getMinutes() + intervaloSlot)

    // Retorna apenas agendamentos que COMEÇAM neste slot
    return agendamentos.filter((ag) => {
      const agStart = new Date(ag.dataHoraInicio)

      return (
        agStart >= slotStart && agStart < slotEnd
      )
    })
  }

  // Calcula quantos slots o agendamento ocupa baseado no intervalo configurado
  const getAgendamentoHeight = (ag: AgendamentoComRelacoes) => {
    const start = new Date(ag.dataHoraInicio)
    const end = new Date(ag.dataHoraFim)
    const durationMs = end.getTime() - start.getTime()
    const durationMinutes = durationMs / (1000 * 60)
    const slots = Math.ceil(durationMinutes / intervaloSlot)
    return slots
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  return (
    <Card className="overflow-x-auto">
      <div className="min-w-max">
        {/* Cabeçalho com datas */}
        <div className="flex border-b sticky top-0 bg-white z-10">
          <div className="w-20 flex-shrink-0 p-2 border-r"></div>
          {dates.map((date, idx) => (
            <div
              key={idx}
              className={`flex-1 min-w-32 p-2 text-center border-r ${
                isToday(date) ? 'bg-blue-50' : ''
              }`}
            >
              <div className="text-xs text-gray-500">
                {dayNames[date.getDay()]}
              </div>
              <div className="text-lg font-semibold">{date.getDate()}</div>
            </div>
          ))}
        </div>

        {/* Grade de horários */}
        <div className="relative">
          {timeSlots.map((slot, slotIdx) => {
            const timeLabel = `${slot.hour.toString().padStart(2, '0')}:${slot.minute.toString().padStart(2, '0')}`
            const isHourStart = slot.minute === 0
            
            return (
              <div key={`${slot.hour}-${slot.minute}`} className="flex border-b">
                <div className="w-20 flex-shrink-0 p-2 border-r text-xs text-gray-500 text-right">
                  {isHourStart ? timeLabel : ''}
                </div>
                {dates.map((date, dateIdx) => {
                  const slotAgendamentos = getAgendamentosForSlot(date, slot.hour, slot.minute)
                  const slotDate = new Date(date)
                  slotDate.setHours(slot.hour, slot.minute, 0, 0)

                  return (
                    <div
                      key={dateIdx}
                      className={`flex-1 min-w-32 p-1 border-r min-h-12 cursor-pointer hover:bg-gray-50 relative overflow-visible ${
                        isToday(date) ? 'bg-blue-50/30' : ''
                      }`}
                      onClick={() => {
                        // Sempre permite criar novo agendamento (mesmo com agendamentos existentes)
                        onSlotClick(slotDate)
                      }}
                      title={slotAgendamentos.length > 0 ? "Clique no espaço livre para criar outro agendamento" : "Clique para criar agendamento"}
                    >
                      {slotAgendamentos.map((ag, index) => {
                        const heightSlots = getAgendamentoHeight(ag)
                        const heightPx = heightSlots * 48 - 8 // 48px por slot, -8px para espaçamento
                        
                        // Se houver múltiplos agendamentos, empilhar lado a lado
                        const totalAgendamentos = slotAgendamentos.length
                        const widthPercent = totalAgendamentos > 1 ? 48 : 80 // 80% se um, 48% cada se múltiplos
                        const leftOffset = totalAgendamentos > 1 ? index * 50 : 0
                        
                        return (
                          <div
                            key={ag.id}
                            className="bg-blue-500 text-white text-xs p-2 rounded cursor-pointer hover:bg-blue-600 overflow-hidden shadow-sm absolute z-10"
                            style={{ 
                              height: `${heightPx}px`,
                              width: `${widthPercent}%`,
                              left: `${leftOffset}%`,
                              top: '2px'
                            }}
                            onClick={(e) => {
                              e.stopPropagation()
                              onAgendamentoClick(ag)
                            }}
                          >
                            <div className="font-semibold truncate">
                              {ag.cliente.nome}
                            </div>
                            <div className="text-xs opacity-90 mt-0.5">
                              {new Date(ag.dataHoraInicio).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                              {' - '}
                              {new Date(ag.dataHoraFim).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                            <div className="text-xs opacity-80 mt-0.5">
                              {ag.duracaoTotal}min
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}

