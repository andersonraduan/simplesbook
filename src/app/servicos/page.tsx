'use client'

import { useEffect, useState } from 'react'
import { ServicoForm } from '@/components/servicos/servico-form'
import { ServicoList } from '@/components/servicos/servico-list'
import { Button } from '@/components/ui/button'
import { AppLayout } from '@/components/layout/app-layout'

interface Servico {
  id: string
  titulo: string
  descricao: string
  valor: string
  timeExecution: number
  createdAt: string
}

export default function ServicosPage() {
  const [servicos, setServicos] = useState<Servico[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingServico, setEditingServico] = useState<Servico | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const loadServicos = async () => {
    try {
      const response = await fetch('/api/servicos')
      if (!response.ok) {
        throw new Error('Erro ao carregar serviços')
      }
      const data = await response.json()
      setServicos(data)
    } catch (error) {
      console.error('Erro ao carregar serviços:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadServicos()
  }, [])

  const handleSuccess = () => {
    setShowForm(false)
    setEditingServico(null)
    loadServicos()
  }

  const handleEdit = (servico: Servico) => {
    setEditingServico(servico)
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingServico(null)
  }

  const filteredServicos = servicos.filter((servico) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      servico.titulo.toLowerCase().includes(searchLower) ||
      servico.descricao.toLowerCase().includes(searchLower)
    )
  })

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
    <AppLayout title="Meus Serviços" subtitle="Gerencie seu catálogo de serviços">
      {showForm ? (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
            <ServicoForm
              onSuccess={handleSuccess}
              servicoInicial={editingServico || undefined}
              onCancel={handleCancel}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Adicionar Serviço
              </h2>
              <Button onClick={() => setShowForm(true)} className="w-full">
                <span className="material-icons text-sm mr-2">add</span>
                Adicionar Novo Serviço
              </Button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Lista de Serviços
            </h2>
            <div className="mb-4">
              <div className="relative">
                <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Buscar por título ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <ServicoList
              servicos={filteredServicos}
              onServicoUpdated={loadServicos}
              onEdit={handleEdit}
            />
          </div>
        </div>
      )}
    </AppLayout>
  )
}

