import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { StatusAgendamento } from '@prisma/client'
import { AgendamentoComRelacoes } from '@/types/agendamento'

interface MetricasRelatorio {
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
  metricas: MetricasRelatorio
  filtros: {
    dataInicial: string
    dataFinal: string
    status: string
    clienteId: string | null
  }
  appName?: string
}

const statusLabels: Record<StatusAgendamento, string> = {
  PENDENTE: 'Pendente',
  CONFIRMADO: 'Confirmado',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
}

export function gerarRelatorioPDF(dados: DadosRelatorio) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  let yPosition = 20

  // Cabeçalho
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(dados.appName || 'SimplesBook', pageWidth / 2, yPosition, { align: 'center' })
  
  yPosition += 8
  doc.setFontSize(14)
  doc.text('Relatório de Agendamentos', pageWidth / 2, yPosition, { align: 'center' })
  
  yPosition += 10
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  
  // Período do relatório
  const dataInicial = new Date(dados.filtros.dataInicial)
  const dataFinal = new Date(dados.filtros.dataFinal)
  const periodoTexto = `Período: ${formatarData(dataInicial)} a ${formatarData(dataFinal)}`
  doc.text(periodoTexto, pageWidth / 2, yPosition, { align: 'center' })
  
  yPosition += 15

  // Seção de Métricas
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Métricas Consolidadas', 14, yPosition)
  
  yPosition += 8
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  
  // Métricas em grid
  const metricas = [
    `Total de Agendamentos: ${dados.metricas.totalAgendamentos}`,
    `Valor Total: R$ ${formatarValor(dados.metricas.valorTotal)}`,
    `Taxa de Conclusão: ${dados.metricas.taxaConclusao.toFixed(1)}%`,
  ]
  
  metricas.forEach((metrica) => {
    doc.text(metrica, 14, yPosition)
    yPosition += 6
  })
  
  yPosition += 5
  
  // Distribuição por Status
  doc.setFont('helvetica', 'bold')
  doc.text('Distribuição por Status:', 14, yPosition)
  yPosition += 6
  doc.setFont('helvetica', 'normal')
  
  dados.metricas.porStatus.forEach((item) => {
    const texto = `  ${statusLabels[item.status]}: ${item.quantidade} (${item.percentual.toFixed(1)}%)`
    doc.text(texto, 14, yPosition)
    yPosition += 6
  })
  
  yPosition += 10

  // Tabela de Agendamentos
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Agendamentos Detalhados', 14, yPosition)
  
  yPosition += 5

  // Preparar dados para a tabela
  const dadosTabela = dados.agendamentos.map((ag) => {
    const data = new Date(ag.dataHoraInicio)
    const dataFormatada = formatarData(data)
    const horaInicio = formatarHora(new Date(ag.dataHoraInicio))
    const horaFim = formatarHora(new Date(ag.dataHoraFim))
    const servicos = ag.servicos.map((s) => s.servico?.titulo || '').join(', ')
    
    return [
      dataFormatada,
      `${horaInicio} - ${horaFim}`,
      ag.cliente.nome,
      servicos,
      statusLabels[ag.status],
      `R$ ${formatarValor(ag.valorTotal)}`,
    ]
  })

  autoTable(doc, {
    startY: yPosition,
    head: [['Data', 'Horário', 'Cliente', 'Serviços', 'Status', 'Valor']],
    body: dadosTabela,
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [71, 85, 105], // slate-600
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // slate-50
    },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 28 },
      2: { cellWidth: 35 },
      3: { cellWidth: 45 },
      4: { cellWidth: 25 },
      5: { cellWidth: 25 },
    },
  })

  // Rodapé
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    const dataGeracao = new Date()
    const textoRodape = `Gerado em: ${formatarDataHora(dataGeracao)} - Página ${i} de ${pageCount}`
    doc.text(textoRodape, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, {
      align: 'center',
    })
  }

  // Salvar PDF
  const dataAtual = new Date()
  const nomeArquivo = `relatorio-agendamentos-${dataAtual.getFullYear()}${String(
    dataAtual.getMonth() + 1
  ).padStart(2, '0')}${String(dataAtual.getDate()).padStart(2, '0')}.pdf`
  
  doc.save(nomeArquivo)
}

function formatarData(data: Date): string {
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatarHora(data: Date): string {
  return data.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatarDataHora(data: Date): string {
  return `${formatarData(data)} ${formatarHora(data)}`
}

function formatarValor(valor: string | number): string {
  const numero = typeof valor === 'string' ? parseFloat(valor) : valor
  return numero.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

