'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Cliente {
  id: string
  nome: string
  email: string
  telemovel: string
  dataNascimento: string
  createdAt: string
}

interface ClienteListProps {
  clientes: Cliente[]
  onClienteUpdated: () => void
  onEdit: (cliente: Cliente) => void
}

export function ClienteList({ clientes, onClienteUpdated, onEdit }: ClienteListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este cliente?')) {
      return
    }

    setDeletingId(id)

    try {
      const response = await fetch(`/api/clientes/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erro ao remover cliente')
      }

      onClienteUpdated()
    } catch (error) {
      alert('Erro ao remover cliente')
    } finally {
      setDeletingId(null)
    }
  }

  const formatarData = (dataString: string) => {
    const data = new Date(dataString)
    return data.toLocaleDateString('pt-BR')
  }

  if (clientes.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">
            Nenhum cliente cadastrado ainda.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {clientes.map((cliente) => (
        <Card key={cliente.id}>
          <CardHeader>
            <CardTitle className="text-lg">{cliente.nome}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Email:</span>
                <span className="text-sm">{cliente.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Telemóvel:</span>
                <span className="text-sm">{cliente.telemovel}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">
                  Data de Nascimento:
                </span>
                <span className="text-sm">
                  {formatarData(cliente.dataNascimento)}
                </span>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(cliente)}
                >
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(cliente.id)}
                  disabled={deletingId === cliente.id}
                >
                  {deletingId === cliente.id ? 'Removendo...' : 'Remover'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

