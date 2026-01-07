'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserPreferences, calendarioViewLabels, intervaloSlotOptions } from '@/types/preferences'
import { CalendarioView } from '@prisma/client'
import { Loader2 } from 'lucide-react'

interface PreferencesFormProps {
  onSave: (preferences: Partial<UserPreferences>) => Promise<void>
}

interface FormData {
  calendarioView: CalendarioView
  horarioInicioAtendimento: string
  horarioFimAtendimento: string
  intervaloSlot: number
}

export function PreferencesForm({ onSave }: PreferencesFormProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    calendarioView: CalendarioView.SEMANA,
    horarioInicioAtendimento: '08:00',
    horarioFimAtendimento: '20:00',
    intervaloSlot: 30
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPreferences()
  }, [])

  async function loadPreferences() {
    try {
      setLoading(true)
      const response = await fetch('/api/user/preferences')
      if (!response.ok) throw new Error('Erro ao carregar preferências')
      
      const data = await response.json()
      setFormData({
        calendarioView: data.calendarioView,
        horarioInicioAtendimento: data.horarioInicioAtendimento,
        horarioFimAtendimento: data.horarioFimAtendimento,
        intervaloSlot: data.intervaloSlot
      })
    } catch (err) {
      console.error('Erro ao carregar preferências:', err)
      setError('Erro ao carregar preferências')
    } finally {
      setLoading(false)
    }
  }

  function validateTime(time: string): boolean {
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    return regex.test(time)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Validações
    if (!validateTime(formData.horarioInicioAtendimento)) {
      setError('Horário de início inválido (formato: HH:MM)')
      return
    }

    if (!validateTime(formData.horarioFimAtendimento)) {
      setError('Horário de fim inválido (formato: HH:MM)')
      return
    }

    const [horaInicio, minInicio] = formData.horarioInicioAtendimento.split(':').map(Number)
    const [horaFim, minFim] = formData.horarioFimAtendimento.split(':').map(Number)
    const totalMinInicio = horaInicio * 60 + minInicio
    const totalMinFim = horaFim * 60 + minFim

    if (totalMinFim <= totalMinInicio) {
      setError('Horário de fim deve ser maior que horário de início')
      return
    }

    try {
      setSaving(true)
      await onSave(formData)
    } catch (err: any) {
      console.error('Erro ao salvar preferências:', err)
      setError(err.message || 'Erro ao salvar preferências')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Visualização do Calendário */}
      <Card>
        <CardHeader>
          <CardTitle>Visualização do Calendário</CardTitle>
          <CardDescription>
            Escolha como deseja visualizar o calendário por padrão
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={formData.calendarioView}
            onValueChange={(value) => {
              const calendarioView = value as CalendarioView
              setFormData({ ...formData, calendarioView })
            }}
          >
            {Object.entries(calendarioViewLabels).map(([value, label]) => (
              <div key={value} className="flex items-center space-x-2">
                <RadioGroupItem value={value} id={value} />
                <Label htmlFor={value} className="cursor-pointer">
                  {label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Horário de Atendimento */}
      <Card>
        <CardHeader>
          <CardTitle>Horário de Atendimento</CardTitle>
          <CardDescription>
            Configure o horário de início e fim do seu expediente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="horarioInicio">Horário de Início</Label>
              <Input
                id="horarioInicio"
                type="time"
                value={formData.horarioInicioAtendimento}
                onChange={(e) =>
                  setFormData({ ...formData, horarioInicioAtendimento: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="horarioFim">Horário de Fim</Label>
              <Input
                id="horarioFim"
                type="time"
                value={formData.horarioFimAtendimento}
                onChange={(e) =>
                  setFormData({ ...formData, horarioFimAtendimento: e.target.value })
                }
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Intervalo de Slots */}
      <Card>
        <CardHeader>
          <CardTitle>Intervalo de Horários</CardTitle>
          <CardDescription>
            Defina o intervalo entre os horários no calendário
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={formData.intervaloSlot.toString()}
            onValueChange={(value) =>
              setFormData({ ...formData, intervaloSlot: parseInt(value) })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {intervaloSlotOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Mensagem de Erro */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Botão Salvar */}
      <Button type="submit" disabled={saving} className="w-full">
        {saving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          'Salvar Preferências'
        )}
      </Button>
    </form>
  )
}

