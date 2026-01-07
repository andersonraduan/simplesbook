'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Cliente {
  id: string
  nome: string
}

interface FiltrosRelatorioProps {
  onFiltrosChange: (filtros: FiltrosData) => void
}

export interface FiltrosData {
  dataInicial: string
  dataFinal: string
  status: string
  clienteId: string
}

export function FiltrosRelatorio({ onFiltrosChange }: FiltrosRelatorioProps) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)

  // Obter primeiro e último dia do mês corrente
  const getMesCorrente = () => {
    const hoje = new Date()
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
    
    return {
      dataInicial: primeiroDia.toISOString().split('T')[0],
      dataFinal: ultimoDia.toISOString().split('T')[0],
    }
  }

  const mesCorrente = getMesCorrente()

  const [filtros, setFiltros] = useState<FiltrosData>({
    dataInicial: mesCorrente.dataInicial,
    dataFinal: mesCorrente.dataFinal,
    status: 'TODOS',
    clienteId: '',
  })

  useEffect(() => {
    carregarClientes()
    // Aplicar filtros padrão ao montar
    onFiltrosChange(filtros)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const carregarClientes = async () => {
    try {
      const response = await fetch('/api/clientes')
      if (response.ok) {
        const data = await response.json()
        setClientes(data)
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAplicarFiltros = () => {
    onFiltrosChange(filtros)
  }

  const handleLimparFiltros = () => {
    const filtrosLimpos = {
      dataInicial: mesCorrente.dataInicial,
      dataFinal: mesCorrente.dataFinal,
      status: 'TODOS',
      clienteId: '',
    }
    setFiltros(filtrosLimpos)
    onFiltrosChange(filtrosLimpos)
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Data Inicial */}
        <div>
          <Label htmlFor="dataInicial">Data Inicial</Label>
          <Input
            id="dataInicial"
            type="date"
            value={filtros.dataInicial}
            onChange={(e) =>
              setFiltros({ ...filtros, dataInicial: e.target.value })
            }
            className="mt-1"
          />
        </div>

        {/* Data Final */}
        <div>
          <Label htmlFor="dataFinal">Data Final</Label>
          <Input
            id="dataFinal"
            type="date"
            value={filtros.dataFinal}
            onChange={(e) =>
              setFiltros({ ...filtros, dataFinal: e.target.value })
            }
            className="mt-1"
          />
        </div>

        {/* Status */}
        <div>
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={filtros.status}
            onChange={(e) =>
              setFiltros({ ...filtros, status: e.target.value })
            }
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          >
            <option value="TODOS">Todos</option>
            <option value="PENDENTE">Pendente</option>
            <option value="CONFIRMADO">Confirmado</option>
            <option value="CONCLUIDO">Concluído</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>

        {/* Cliente */}
        <div>
          <Label htmlFor="cliente">Cliente</Label>
          <select
            id="cliente"
            value={filtros.clienteId}
            onChange={(e) =>
              setFiltros({ ...filtros, clienteId: e.target.value })
            }
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="">Todos os clientes</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Botões */}
      <div className="flex gap-3 mt-6">
        <Button onClick={handleAplicarFiltros} className="flex-1">
          Aplicar Filtros
        </Button>
        <Button
          onClick={handleLimparFiltros}
          variant="outline"
          className="flex-1"
        >
          Limpar
        </Button>
      </div>
    </div>
  )
}

