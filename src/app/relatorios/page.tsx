'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { FiltrosRelatorio, FiltrosData } from '@/components/relatorios/filtros-relatorio'
import { MetricasRelatorio } from '@/components/relatorios/metricas-relatorio'
import { ListaRelatorio } from '@/components/relatorios/lista-relatorio'
import { Button } from '@/components/ui/button'
import { AgendamentoComRelacoes } from '@/types/agendamento'
import { gerarRelatorioPDF } from '@/lib/pdf-generator'
import { StatusAgendamento } from '@prisma/client'
import { useAppName } from '@/components/app-name-provider'

interface MetricasData {
  totalAgendamentos: number
  valorTotal: string
  porStatus: {
    status: StatusAgendamento
    quantidade: number
    percentual: number
  }[]
  taxaConclusao: number
}

interface DadosRelatorio {
  agendamentos: AgendamentoComRelacoes[]
  metricas: MetricasData
  filtros: {
    dataInicial: string
    dataFinal: string
    status: string
    clienteId: string | null
  }
}

export default function RelatoriosPage() {
  const [dados, setDados] = useState<DadosRelatorio | null>(null)
  const [loading, setLoading] = useState(false)
  const { appName } = useAppName()
  const [filtrosAtuais, setFiltrosAtuais] = useState<FiltrosData | null>(null)

  const carregarRelatorio = async (filtros: FiltrosData) => {
    setLoading(true)
    setFiltrosAtuais(filtros)

    try {
      // Construir query string
      const params = new URLSearchParams()
      
      if (filtros.dataInicial) {
        params.append('dataInicial', filtros.dataInicial)
      }
      
      if (filtros.dataFinal) {
        params.append('dataFinal', filtros.dataFinal)
      }
      
      if (filtros.status && filtros.status !== 'TODOS') {
        params.append('status', filtros.status)
      }
      
      if (filtros.clienteId) {
        params.append('clienteId', filtros.clienteId)
      }

      const response = await fetch(`/api/relatorios?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar relatório')
      }

      const data = await response.json()
      setDados(data)
    } catch (error) {
      console.error('Erro ao carregar relatório:', error)
      alert('Erro ao carregar relatório. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleExportarPDF = () => {
    if (!dados) {
      alert('Nenhum dado disponível para exportar')
      return
    }

    try {
      gerarRelatorioPDF({ ...dados, appName })
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      alert('Erro ao gerar PDF. Tente novamente.')
    }
  }

  return (
    <AppLayout title="Relatórios de Agendamentos" subtitle="Analise métricas e exporte relatórios">
      {/* Header com botão de exportar */}
      <div className="flex items-center justify-end mb-6">
        {dados && (
          <Button onClick={handleExportarPDF} variant="outline">
            <span className="material-icons text-sm mr-2">picture_as_pdf</span>
            Exportar PDF
          </Button>
        )}
      </div>

      {/* Filtros */}
      <div className="mb-6 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
        <FiltrosRelatorio onFiltrosChange={carregarRelatorio} />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Carregando relatório...</p>
          </div>
        </div>
      )}

      {/* Conteúdo do Relatório */}
      {!loading && dados && (
        <div className="space-y-6">
          {/* Métricas */}
          <MetricasRelatorio metricas={dados.metricas} />

          {/* Listagem */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Agendamentos Detalhados
            </h2>
            <ListaRelatorio agendamentos={dados.agendamentos} />
          </div>
        </div>
      )}

      {/* Estado Inicial */}
      {!loading && !dados && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-12 text-center">
          <div className="max-w-md mx-auto">
            <span className="material-icons text-6xl text-gray-400 dark:text-gray-600 mb-4">
              assessment
            </span>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              Configure os filtros acima
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Selecione o período, status e cliente para gerar seu relatório.
              Por padrão, o relatório exibe os dados do mês corrente.
            </p>
          </div>
        </div>
      )}
    </AppLayout>
  )
}

