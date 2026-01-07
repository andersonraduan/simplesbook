'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Combobox, ComboboxOption } from '@/components/ui/combobox'
import { StatusAgendamento, AgendamentoComRelacoes } from '@/types/agendamento'
import {
  converterParaDateTimeLocal,
  adicionarMinutos,
  formatarDataHora,
} from '@/lib/date-utils'
import { NotificationLogs } from './notification-logs'

interface AgendamentoFormProps {
  onSuccess: () => void
  agendamentoInicial?: AgendamentoComRelacoes
  initialDateTime?: {
    dataHoraInicio: string
    dataHoraFim: string
  }
  onCancel?: () => void
}

interface Cliente {
  id: string
  nome: string
}

interface Servico {
  id: string
  titulo: string
  valor: string
  timeExecution: number
}

export function AgendamentoForm({
  onSuccess,
  agendamentoInicial,
  initialDateTime,
  onCancel,
}: AgendamentoFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [servicos, setServicos] = useState<Servico[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [conflitWarning, setConflitWarning] = useState<string | null>(null)
  const [confirmarConflito, setConfirmarConflito] = useState(false)
  const [userChangedServicos, setUserChangedServicos] = useState(false)

  const [formData, setFormData] = useState({
    clienteId: agendamentoInicial?.clienteId || '',
    servicosIds: agendamentoInicial?.servicos.map((s) => s.servicoId) || [],
    dataHoraInicio: agendamentoInicial
      ? converterParaDateTimeLocal(agendamentoInicial.dataHoraInicio)
      : initialDateTime
      ? converterParaDateTimeLocal(initialDateTime.dataHoraInicio)
      : '',
    dataHoraFim: agendamentoInicial
      ? converterParaDateTimeLocal(agendamentoInicial.dataHoraFim)
      : initialDateTime
      ? converterParaDateTimeLocal(initialDateTime.dataHoraFim)
      : '',
    valorTotal: agendamentoInicial?.valorTotal || '0',
    duracaoTotal: agendamentoInicial?.duracaoTotal || 0,
    status: agendamentoInicial?.status || StatusAgendamento.PENDENTE,
    observacoes: agendamentoInicial?.observacoes || '',
  })

  // Atualizar formData quando agendamentoInicial mudar (modo de edição)
  useEffect(() => {
    if (agendamentoInicial) {
      const servicosIds = agendamentoInicial.servicos.map((s) => s.servicoId)
      setFormData({
        clienteId: agendamentoInicial.clienteId,
        servicosIds,
        dataHoraInicio: converterParaDateTimeLocal(agendamentoInicial.dataHoraInicio),
        dataHoraFim: converterParaDateTimeLocal(agendamentoInicial.dataHoraFim),
        valorTotal: agendamentoInicial.valorTotal,
        duracaoTotal: agendamentoInicial.duracaoTotal,
        status: agendamentoInicial.status,
        observacoes: agendamentoInicial.observacoes || '',
      })
    }
  }, [agendamentoInicial])

  // Carregar clientes e serviços
  useEffect(() => {
    const loadData = async () => {
      try {
        const [clientesRes, servicosRes] = await Promise.all([
          fetch('/api/clientes'),
          fetch('/api/servicos'),
        ])

        if (clientesRes.ok) {
          const clientesData = await clientesRes.json()
          setClientes(clientesData)
        }

        if (servicosRes.ok) {
          const servicosData = await servicosRes.json()
          setServicos(servicosData)
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err)
      } finally {
        setLoadingData(false)
      }
    }

    loadData()
  }, [])

  // Recalcular valores quando serviços mudam (apenas quando usuário altera)
  useEffect(() => {
    // Só recalcular se o usuário mudou os serviços ativamente
    if (!userChangedServicos) {
      return
    }

    const servicosSelecionados = servicos.filter((s) =>
      formData.servicosIds.includes(s.id)
    )

    const novoValorTotal = servicosSelecionados
      .reduce((acc, s) => acc + parseFloat(s.valor), 0)
      .toFixed(2)

    const novaDuracao = servicosSelecionados.reduce(
      (acc, s) => acc + s.timeExecution,
      0
    )

    setFormData((prev) => ({
      ...prev,
      valorTotal: novoValorTotal,
      duracaoTotal: novaDuracao,
    }))

    // Recalcular hora fim se hora início estiver preenchida
    if (formData.dataHoraInicio && novaDuracao > 0) {
      const inicio = new Date(formData.dataHoraInicio)
      const fim = adicionarMinutos(inicio, novaDuracao)
      setFormData((prev) => ({
        ...prev,
        dataHoraFim: converterParaDateTimeLocal(fim),
      }))
    }
  }, [formData.servicosIds, servicos, userChangedServicos])

  // Recalcular hora fim quando hora início ou duração mudam (apenas se usuário mudou)
  useEffect(() => {
    // Só recalcular se o usuário mudou serviços/duração ativamente
    if (!userChangedServicos) {
      return
    }

    if (formData.dataHoraInicio && formData.duracaoTotal > 0) {
      const inicio = new Date(formData.dataHoraInicio)
      const fim = adicionarMinutos(inicio, formData.duracaoTotal)
      setFormData((prev) => ({
        ...prev,
        dataHoraFim: converterParaDateTimeLocal(fim),
      }))
    }
  }, [formData.dataHoraInicio, formData.duracaoTotal, userChangedServicos])

  // Recalcular hora fim sempre que hora início mudar (independente de mudança de serviços)
  useEffect(() => {
    if (formData.dataHoraInicio && formData.duracaoTotal > 0) {
      const inicio = new Date(formData.dataHoraInicio)
      const fim = adicionarMinutos(inicio, formData.duracaoTotal)
      const fimFormatado = converterParaDateTimeLocal(fim)
      
      // Só atualizar se for diferente para evitar loop infinito
      if (formData.dataHoraFim !== fimFormatado) {
        setFormData((prev) => ({
          ...prev,
          dataHoraFim: fimFormatado,
        }))
      }
    }
  }, [formData.dataHoraInicio])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setConflitWarning(null)

    try {
      const url = agendamentoInicial
        ? `/api/agendamentos/${agendamentoInicial.id}`
        : '/api/agendamentos'

      const method = agendamentoInicial ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          confirmarConflito,
        }),
      })

      const data = await response.json()

      if (response.status === 409) {
        // Conflito detectado
        const conflitos = data.conflitos
          .map(
            (c: any) =>
              `${c.cliente.nome} - ${formatarDataHora(c.dataHoraInicio)}`
          )
          .join(', ')
        setConflitWarning(
          `Conflito com: ${conflitos}. Marque a opção abaixo para confirmar.`
        )
        setLoading(false)
        return
      }

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar agendamento')
      }

      setFormData({
        clienteId: '',
        servicosIds: [],
        dataHoraInicio: '',
        dataHoraFim: '',
        valorTotal: '0',
        duracaoTotal: 0,
        status: StatusAgendamento.PENDENTE,
        observacoes: '',
      })
      setConfirmarConflito(false)
      setConflitWarning(null)
      setUserChangedServicos(false) // Resetar flag
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar agendamento')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    // Limpar warning de conflito apenas se mudar horários
    if (conflitWarning && (name === 'dataHoraInicio' || name === 'dataHoraFim')) {
      setConflitWarning(null)
      setConfirmarConflito(false)
    }
  }

  const clientesOptions: ComboboxOption[] = clientes.map((c) => ({
    value: c.id,
    label: c.nome,
  }))

  const servicosOptions: ComboboxOption[] = servicos.map((s) => ({
    value: s.id,
    label: `${s.titulo} - €${s.valor}`,
  }))

  if (loadingData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">Carregando...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {agendamentoInicial ? 'Editar Agendamento' : 'Novo Agendamento'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          {conflitWarning && (
            <div className="p-3 text-sm text-yellow-600 bg-yellow-50 rounded-md">
              <p className="mb-2">{conflitWarning}</p>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmarConflito}
                  onChange={(e) => setConfirmarConflito(e.target.checked)}
                />
                <span>
                  Confirmar agendamento mesmo com conflito de horário
                </span>
              </label>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="clienteId">Cliente *</Label>
            <Combobox
              options={clientesOptions}
              value={formData.clienteId}
              onChange={(value) => {
                setFormData({ ...formData, clienteId: value as string })
                if (conflitWarning) {
                  setConflitWarning(null)
                  setConfirmarConflito(false)
                }
              }}
              placeholder="Buscar cliente..."
              disabled={loading}
              emptyMessage="Nenhum cliente encontrado"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="servicosIds">Serviços *</Label>
            <Combobox
              options={servicosOptions}
              value={formData.servicosIds}
              onChange={(value) => {
                setFormData({ ...formData, servicosIds: value as string[] })
                setUserChangedServicos(true) // Marcar que usuário mudou serviços
                if (conflitWarning) {
                  setConflitWarning(null)
                  setConfirmarConflito(false)
                }
              }}
              placeholder="Buscar serviços..."
              multiple
              disabled={loading}
              emptyMessage="Nenhum serviço encontrado"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valorTotal">Valor Total (€)</Label>
              <Input
                id="valorTotal"
                name="valorTotal"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.valorTotal}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duracaoTotal">Duração (minutos)</Label>
              <Input
                id="duracaoTotal"
                name="duracaoTotal"
                type="number"
                min="1"
                value={formData.duracaoTotal}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataHoraInicio">Data/Hora Início *</Label>
              <Input
                id="dataHoraInicio"
                name="dataHoraInicio"
                type="datetime-local"
                value={formData.dataHoraInicio}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataHoraFim">Data/Hora Fim</Label>
              <Input
                id="dataHoraFim"
                name="dataHoraFim"
                type="datetime-local"
                value={formData.dataHoraFim}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              disabled={loading}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value={StatusAgendamento.PENDENTE}>Pendente</option>
              <option value={StatusAgendamento.CONFIRMADO}>Confirmado</option>
              <option value={StatusAgendamento.CONCLUIDO}>Concluído</option>
              <option value={StatusAgendamento.CANCELADO}>Cancelado</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <textarea
              id="observacoes"
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              disabled={loading}
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading
                ? 'Salvando...'
                : agendamentoInicial
                ? 'Atualizar'
                : 'Criar Agendamento'}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>

      {/* Logs de Notificações - apenas no modo de edição */}
      {agendamentoInicial && (
        <CardContent className="pt-0">
          <NotificationLogs agendamentoId={agendamentoInicial.id} />
        </CardContent>
      )}
    </Card>
  )
}

