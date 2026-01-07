'use client'

import { useState, useEffect } from 'react'
import { NotificationTemplate } from '@/types/notification'
import { tipoNotificacaoLabels } from '@/types/notification'
import { TipoNotificacao } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface TemplateFormProps {
  template?: NotificationTemplate | null
  onSave: (data: Partial<NotificationTemplate>) => Promise<void>
  onCancel: () => void
}

const variaveisDisponiveis = [
  { var: '{cliente_nome}', desc: 'Nome do cliente' },
  { var: '{cliente_telefone}', desc: 'Telefone do cliente' },
  { var: '{data}', desc: 'Data do agendamento' },
  { var: '{hora}', desc: 'Hora do agendamento' },
  { var: '{servicos}', desc: 'Lista de serviços' },
  { var: '{valor_total}', desc: 'Valor total' },
  { var: '{duracao_total}', desc: 'Duração total' },
  { var: '{estabelecimento_nome}', desc: 'Nome do estabelecimento' },
  { var: '{observacoes}', desc: 'Observações' }
]

export function TemplateForm({ template, onSave, onCancel }: TemplateFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    tipo: template?.tipo || TipoNotificacao.CONFIRMACAO,
    nome: template?.nome || '',
    intervaloMinutos: template?.intervaloMinutos?.toString() || '0',
    mensagemSMS: template?.mensagemSMS || '',
    mensagemWhatsApp: template?.mensagemWhatsApp || '',
    habilitarSMS: template?.habilitarSMS || false,
    habilitarWhatsApp: template?.habilitarWhatsApp || false,
    ativo: template?.ativo !== undefined ? template.ativo : true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSave({
        ...formData,
        intervaloMinutos: formData.intervaloMinutos === '' ? null : parseInt(formData.intervaloMinutos)
      })
    } finally {
      setLoading(false)
    }
  }

  const inserirVariavel = (variavel: string, campo: 'sms' | 'whatsapp') => {
    if (campo === 'sms') {
      setFormData(prev => ({
        ...prev,
        mensagemSMS: (prev.mensagemSMS || '') + variavel
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        mensagemWhatsApp: (prev.mensagemWhatsApp || '') + variavel
      }))
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="nome">Nome do Template</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
            placeholder="Ex: Lembrete 24h antes"
            required
          />
        </div>

        <div>
          <Label htmlFor="tipo">Tipo de Notificação</Label>
          <select
            id="tipo"
            value={formData.tipo}
            onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as TipoNotificacao }))}
            className="w-full border rounded-md p-2"
            required
          >
            {Object.entries(tipoNotificacaoLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="intervalo">Intervalo (minutos antes do agendamento)</Label>
          <Input
            id="intervalo"
            type="number"
            value={formData.intervaloMinutos}
            onChange={(e) => setFormData(prev => ({ ...prev, intervaloMinutos: e.target.value }))}
            placeholder="0 = imediato, 60 = 1 hora, 1440 = 1 dia"
            min="0"
          />
          <p className="text-sm text-muted-foreground mt-1">
            0 = Imediato | 60 = 1 hora | 1440 = 24 horas | 2880 = 48 horas
          </p>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold mb-3">Variáveis Disponíveis</h3>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {variaveisDisponiveis.map(({ var: v, desc }) => (
              <Badge key={v} variant="outline" className="justify-start text-xs">
                <code className="mr-2">{v}</code>
                <span className="text-muted-foreground">{desc}</span>
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="habilitarSMS"
              checked={formData.habilitarSMS}
              onChange={(e) => setFormData(prev => ({ ...prev, habilitarSMS: e.target.checked }))}
              className="rounded"
            />
            <Label htmlFor="habilitarSMS">Habilitar SMS</Label>
          </div>

          {formData.habilitarSMS && (
            <div>
              <Label htmlFor="mensagemSMS">Mensagem SMS</Label>
              <textarea
                id="mensagemSMS"
                value={formData.mensagemSMS || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, mensagemSMS: e.target.value }))}
                className="w-full border rounded-md p-2 min-h-[100px]"
                placeholder="Digite a mensagem SMS..."
                required={formData.habilitarSMS}
              />
              <div className="flex gap-2 mt-2 flex-wrap">
                {variaveisDisponiveis.slice(0, 5).map(({ var: v }) => (
                  <Button
                    key={v}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => inserirVariavel(v, 'sms')}
                  >
                    {v}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="habilitarWhatsApp"
              checked={formData.habilitarWhatsApp}
              onChange={(e) => setFormData(prev => ({ ...prev, habilitarWhatsApp: e.target.checked }))}
              className="rounded"
            />
            <Label htmlFor="habilitarWhatsApp">Habilitar WhatsApp</Label>
          </div>

          {formData.habilitarWhatsApp && (
            <div>
              <Label htmlFor="mensagemWhatsApp">Mensagem WhatsApp</Label>
              <textarea
                id="mensagemWhatsApp"
                value={formData.mensagemWhatsApp || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, mensagemWhatsApp: e.target.value }))}
                className="w-full border rounded-md p-2 min-h-[100px]"
                placeholder="Digite a mensagem WhatsApp..."
                required={formData.habilitarWhatsApp}
              />
              <div className="flex gap-2 mt-2 flex-wrap">
                {variaveisDisponiveis.slice(0, 5).map(({ var: v }) => (
                  <Button
                    key={v}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => inserirVariavel(v, 'whatsapp')}
                  >
                    {v}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="ativo"
            checked={formData.ativo}
            onChange={(e) => setFormData(prev => ({ ...prev, ativo: e.target.checked }))}
            className="rounded"
          />
          <Label htmlFor="ativo">Template ativo</Label>
        </div>

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : template ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

