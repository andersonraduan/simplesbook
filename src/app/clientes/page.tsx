'use client'

import { useEffect, useState } from 'react'
import { ClienteForm } from '@/components/clientes/cliente-form'
import { ClienteList } from '@/components/clientes/cliente-list'
import { Button } from '@/components/ui/button'
import { AppLayout } from '@/components/layout/app-layout'

interface Cliente {
  id: string
  nome: string
  email: string
  telemovel: string
  dataNascimento: string
  createdAt: string
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const loadClientes = async () => {
    try {
      const response = await fetch('/api/clientes')
      if (!response.ok) {
        throw new Error('Erro ao carregar clientes')
      }
      const data = await response.json()
      setClientes(data)
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClientes()
  }, [])

  const handleSuccess = () => {
    setShowForm(false)
    setEditingCliente(null)
    loadClientes()
  }

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente)
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingCliente(null)
  }

  const filteredClientes = clientes.filter((cliente) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      cliente.nome.toLowerCase().includes(searchLower) ||
      cliente.email.toLowerCase().includes(searchLower) ||
      cliente.telemovel.toLowerCase().includes(searchLower)
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
    <AppLayout title="Meus Clientes" subtitle="Gerencie sua base de clientes">
      {showForm ? (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
            <ClienteForm
              onSuccess={handleSuccess}
              clienteInicial={editingCliente || undefined}
              onCancel={handleCancel}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Adicionar Cliente
              </h2>
              <Button onClick={() => setShowForm(true)} className="w-full">
                <span className="material-icons text-sm mr-2">add</span>
                Adicionar Novo Cliente
              </Button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Lista de Clientes
            </h2>
            <div className="mb-4">
              <div className="relative">
                <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Buscar por nome, email ou telemóvel..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <ClienteList
              clientes={filteredClientes}
              onClienteUpdated={loadClientes}
              onEdit={handleEdit}
            />
          </div>
        </div>
      )}
    </AppLayout>
  )
}

