'use client'

import { NotificationTemplate } from '@/types/notification'
import { tipoNotificacaoLabels } from '@/types/notification'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Pencil, Trash2, MessageSquare, Smartphone } from 'lucide-react'

interface TemplateListProps {
  templates: NotificationTemplate[]
  onEdit: (template: NotificationTemplate) => void
  onDelete: (id: string) => void
}

export function TemplateList({ templates, onEdit, onDelete }: TemplateListProps) {
  const formatIntervalo = (minutos: number | null): string => {
    if (minutos === null || minutos === 0) return 'Imediato'
    
    if (minutos < 60) return `${minutos} min antes`
    
    const horas = Math.floor(minutos / 60)
    const mins = minutos % 60
    
    if (mins === 0) {
      if (horas === 24) return '1 dia antes'
      if (horas === 48) return '2 dias antes'
      if (horas % 24 === 0) return `${horas / 24} dias antes`
      return `${horas}h antes`
    }
    
    return `${horas}h${mins}min antes`
  }

  if (templates.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-12 text-center">
        <span className="material-icons text-6xl text-gray-400 dark:text-gray-600 mb-4">
          notifications_none
        </span>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Nenhum template cadastrado
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Crie seu primeiro template para começar a enviar notificações.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {templates.map((template) => (
        <div 
          key={template.id} 
          className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {template.nome}
                </h3>
                <Badge 
                  variant={template.ativo ? "default" : "secondary"}
                  className={template.ativo ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {template.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="material-icons text-gray-400 text-sm">category</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    <strong className="text-gray-900 dark:text-white">Tipo:</strong> {tipoNotificacaoLabels[template.tipo]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-icons text-gray-400 text-sm">schedule</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    <strong className="text-gray-900 dark:text-white">Intervalo:</strong> {formatIntervalo(template.intervaloMinutos)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-icons text-gray-400 text-sm">
                    {template.ativo ? 'check_circle' : 'cancel'}
                  </span>
                  <span className={template.ativo ? "text-green-600 dark:text-green-400 font-medium" : "text-gray-500 dark:text-gray-400"}>
                    {template.ativo ? "✓ Enviando notificações" : "✗ Não está enviando"}
                  </span>
                </div>
                
                <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  {template.habilitarSMS && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Smartphone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">SMS</span>
                    </div>
                  )}
                  {template.habilitarWhatsApp && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">WhatsApp</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(template)}
                className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(template.id)}
                className="hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

