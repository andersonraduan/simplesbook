'use client'

import { useState, useEffect } from 'react'
import { NotificationTemplate } from '@/types/notification'
import { TemplateList } from '@/components/notifications/template-list'
import { TemplateForm } from '@/components/notifications/template-form'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus, Bell, AlertCircle } from 'lucide-react'
import { AppLayout } from '@/components/layout/app-layout'

export default function NotificationsPage() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null)
  const [twilioStatus, setTwilioStatus] = useState<{
    configured: boolean
    smsEnabled: boolean
    whatsappEnabled: boolean
  } | null>(null)

  useEffect(() => {
    loadTemplates()
    checkTwilioStatus()
  }, [])

  const checkTwilioStatus = async () => {
    try {
      const response = await fetch('/api/notifications/test')
      if (response.ok) {
        const data = await response.json()
        setTwilioStatus(data)
      }
    } catch (error) {
      console.error('Erro ao verificar status Twilio:', error)
    }
  }

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/notifications/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error('Erro ao carregar templates:', error)
      alert('Erro ao carregar templates')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (data: Partial<NotificationTemplate>) => {
    try {
      const url = editingTemplate
        ? `/api/notifications/templates/${editingTemplate.id}`
        : '/api/notifications/templates'
      
      const method = editingTemplate ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao salvar template')
      }

      await loadTemplates()
      setShowForm(false)
      setEditingTemplate(null)
      alert('Template salvo com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar template:', error)
      alert(error instanceof Error ? error.message : 'Erro ao salvar template')
      throw error
    }
  }

  const handleEdit = (template: NotificationTemplate) => {
    setEditingTemplate(template)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este template?')) {
      return
    }

    try {
      const response = await fetch(`/api/notifications/templates/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao excluir template')
      }

      await loadTemplates()
      alert('Template excluído com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir template:', error)
      alert(error instanceof Error ? error.message : 'Erro ao excluir template')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingTemplate(null)
  }

  if (loading) {
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
    <AppLayout 
      title="Notificações" 
      subtitle="Gerencie templates de notificações SMS e WhatsApp"
      maxWidth="md"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-end">
          {!showForm && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Template
            </Button>
          )}
        </div>

        {twilioStatus && !twilioStatus.configured && (
          <Card className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">Twilio não configurado</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                  Configure as variáveis de ambiente do Twilio para habilitar o envio de notificações.
                </p>
              </div>
            </div>
          </Card>
        )}

        {twilioStatus && twilioStatus.configured && (
          <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-start gap-2">
              <Bell className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-300">Twilio configurado</h3>
                <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                  SMS: {twilioStatus.smsEnabled ? '✓ Habilitado' : '✗ Desabilitado'} | 
                  WhatsApp: {twilioStatus.whatsappEnabled ? '✓ Habilitado' : '✗ Desabilitado'}
                </p>
              </div>
            </div>
          </Card>
        )}

        {showForm ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
            <TemplateForm
              template={editingTemplate}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        ) : (
          <TemplateList
            templates={templates}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>
    </AppLayout>
  )
}

