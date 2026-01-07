'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AgendamentoForm } from '@/components/agendamentos/agendamento-form'
import { AgendamentoList } from '@/components/agendamentos/agendamento-list'
import { Button } from '@/components/ui/button'
import { AppLayout } from '@/components/layout/app-layout'
import { AgendamentoComRelacoes } from '@/types/agendamento'

function AgendamentosContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [agendamentos, setAgendamentos] = useState<AgendamentoComRelacoes[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAgendamento, setEditingAgendamento] =
    useState<AgendamentoComRelacoes | null>(null)

  const loadAgendamentos = async () => {
    try {
      const response = await fetch('/api/agendamentos')
      if (!response.ok) {
        throw new Error('Erro ao carregar agendamentos')
      }
      const data = await response.json()
      setAgendamentos(data)
      return data
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error)
      return []
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAgendamentos()
  }, [])

  // Verificar se há parâmetro edit na URL
  useEffect(() => {
    const editId = searchParams.get('edit')
    if (editId && agendamentos.length > 0) {
      const agendamentoParaEditar = agendamentos.find((ag) => ag.id === editId)
      if (agendamentoParaEditar) {
        setEditingAgendamento(agendamentoParaEditar)
        setShowForm(true)
        // Limpar parâmetro da URL
        router.replace('/agendamentos', { scroll: false })
      }
    }
  }, [searchParams, agendamentos, router])

  const handleSuccess = () => {
    setShowForm(false)
    setEditingAgendamento(null)
    loadAgendamentos()
  }

  const handleEdit = (agendamento: AgendamentoComRelacoes) => {
    setEditingAgendamento(agendamento)
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingAgendamento(null)
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
    <AppLayout title="Meus Agendamentos" subtitle="Visualize e gerencie sua agenda">
      <div className={`grid grid-cols-1 ${editingAgendamento ? 'lg:grid-cols-1' : 'lg:grid-cols-2'} gap-8`}>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
          {showForm ? (
            <AgendamentoForm
              onSuccess={handleSuccess}
              agendamentoInicial={editingAgendamento || undefined}
              onCancel={handleCancel}
            />
          ) : (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Novo Agendamento
              </h2>
              <Button onClick={() => setShowForm(true)} className="w-full">
                <span className="material-icons text-sm mr-2">add</span>
                Adicionar Novo Agendamento
              </Button>
            </div>
          )}
        </div>

        {!editingAgendamento && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Lista de Agendamentos
            </h2>
            <AgendamentoList
              agendamentos={agendamentos}
              onAgendamentoUpdated={loadAgendamentos}
              onEdit={handleEdit}
            />
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default function AgendamentosPage() {
  return (
    <Suspense fallback={
      <AppLayout title="Agendamentos">
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500">Carregando...</div>
        </div>
      </AppLayout>
    }>
      <AgendamentosContent />
    </Suspense>
  )
}

