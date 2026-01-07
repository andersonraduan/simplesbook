import { TipoNotificacao } from '@prisma/client'

// Tipos para dados do agendamento
export interface AgendamentoData {
  cliente: {
    nome: string
    telefone: string
  }
  dataHoraInicio: Date
  dataHoraFim: Date
  valorTotal: string | number
  duracaoTotal: number
  observacoes?: string | null
  servicos: Array<{
    titulo: string
    valor: string | number
    timeExecution: number
  }>
  estabelecimento?: {
    nome?: string
    telefone?: string
    endereco?: string
  }
}

// Variáveis disponíveis nos templates
export interface TemplateVariables {
  cliente_nome: string
  cliente_telefone: string
  data: string
  hora: string
  servicos: string
  valor_total: string
  duracao_total: string
  estabelecimento_nome: string
  observacoes: string
}

/**
 * Formata data para exibição
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

/**
 * Formata hora para exibição
 */
function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

/**
 * Formata duração em minutos para texto legível
 */
function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minutos`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) {
    return `${hours} ${hours === 1 ? 'hora' : 'horas'}`
  }
  return `${hours}h${mins}min`
}

/**
 * Formata valor monetário
 */
function formatCurrency(value: string | number): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR'
  }).format(numValue)
}

/**
 * Extrai variáveis do agendamento para substituição no template
 */
export function extractTemplateVariables(data: AgendamentoData): TemplateVariables {
  const servicosList = data.servicos
    .map(s => `${s.titulo} (${formatCurrency(s.valor)})`)
    .join(', ')

  return {
    cliente_nome: data.cliente.nome,
    cliente_telefone: data.cliente.telefone,
    data: formatDate(data.dataHoraInicio),
    hora: formatTime(data.dataHoraInicio),
    servicos: servicosList,
    valor_total: formatCurrency(data.valorTotal),
    duracao_total: formatDuration(data.duracaoTotal),
    estabelecimento_nome: data.estabelecimento?.nome || 'Nosso estabelecimento',
    observacoes: data.observacoes || ''
  }
}

/**
 * Substitui variáveis no template
 * Exemplo: "Olá {cliente_nome}, seu agendamento é dia {data}" 
 */
export function replaceTemplateVariables(
  template: string,
  variables: TemplateVariables
): string {
  let result = template

  // Substitui cada variável
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{${key}\\}`, 'g')
    result = result.replace(regex, value)
  })

  return result
}

/**
 * Processa template completo: extrai variáveis e substitui
 */
export function processTemplate(
  template: string,
  agendamentoData: AgendamentoData
): string {
  const variables = extractTemplateVariables(agendamentoData)
  return replaceTemplateVariables(template, variables)
}

/**
 * Valida se um template tem sintaxe válida
 */
export function validateTemplate(template: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  // Verifica se há chaves não fechadas
  const openBraces = (template.match(/\{/g) || []).length
  const closeBraces = (template.match(/\}/g) || []).length
  
  if (openBraces !== closeBraces) {
    errors.push('Template tem chaves não fechadas')
  }

  // Extrai variáveis usadas no template
  const variablePattern = /\{([^}]+)\}/g
  const matches = template.matchAll(variablePattern)
  const validVariables = [
    'cliente_nome',
    'cliente_telefone',
    'data',
    'hora',
    'servicos',
    'valor_total',
    'duracao_total',
    'estabelecimento_nome',
    'observacoes'
  ]

  for (const match of matches) {
    const variable = match[1]
    if (!validVariables.includes(variable)) {
      errors.push(`Variável desconhecida: {${variable}}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Retorna lista de variáveis disponíveis com descrição
 */
export function getAvailableVariables(): Array<{
  variable: string
  description: string
}> {
  return [
    { variable: '{cliente_nome}', description: 'Nome do cliente' },
    { variable: '{cliente_telefone}', description: 'Telefone do cliente' },
    { variable: '{data}', description: 'Data do agendamento (dd/mm/aaaa)' },
    { variable: '{hora}', description: 'Hora do agendamento (hh:mm)' },
    { variable: '{servicos}', description: 'Lista de serviços agendados' },
    { variable: '{valor_total}', description: 'Valor total do agendamento' },
    { variable: '{duracao_total}', description: 'Duração total do agendamento' },
    { variable: '{estabelecimento_nome}', description: 'Nome do estabelecimento' },
    { variable: '{observacoes}', description: 'Observações do agendamento' }
  ]
}

/**
 * Templates padrão para cada tipo de notificação
 */
export const defaultTemplates: Record<
  TipoNotificacao,
  { nome: string; sms: string; whatsapp: string; intervaloMinutos: number | null }
> = {
  CONFIRMACAO: {
    nome: 'Confirmação de Agendamento',
    sms: 'Olá {cliente_nome}! Seu agendamento foi confirmado para {data} às {hora}. Serviços: {servicos}. Total: {valor_total}.',
    whatsapp: '✅ *Agendamento Confirmado*\n\nOlá {cliente_nome}!\n\nSeu agendamento foi confirmado:\n📅 Data: {data}\n🕐 Hora: {hora}\n💼 Serviços: {servicos}\n💰 Total: {valor_total}\n\nAté breve!',
    intervaloMinutos: null // Disparo imediato
  },
  LEMBRETE: {
    nome: 'Lembrete 24h Antes',
    sms: 'Lembrete: Você tem agendamento amanhã ({data}) às {hora}. Serviços: {servicos}. Nos vemos em breve!',
    whatsapp: '⏰ *Lembrete de Agendamento*\n\nOlá {cliente_nome}!\n\nLembrando que você tem agendamento:\n📅 {data} às {hora}\n💼 {servicos}\n⏱️ Duração: {duracao_total}\n\nNos vemos em breve!',
    intervaloMinutos: 24 * 60 // 24 horas antes
  },
  DIA_DO_AGENDAMENTO: {
    nome: 'Lembrete Dia do Agendamento',
    sms: 'Hoje é o dia! Seu agendamento é às {hora}. Serviços: {servicos}. Te esperamos!',
    whatsapp: '📍 *Hoje é o Dia!*\n\nOlá {cliente_nome}!\n\nSeu agendamento é hoje:\n🕐 Horário: {hora}\n💼 Serviços: {servicos}\n⏱️ Duração: {duracao_total}\n\nTe esperamos!',
    intervaloMinutos: 60 // 1 hora antes
  },
  CANCELAMENTO: {
    nome: 'Cancelamento de Agendamento',
    sms: 'Seu agendamento de {data} às {hora} foi cancelado. Qualquer dúvida, entre em contato.',
    whatsapp: '❌ *Agendamento Cancelado*\n\nOlá {cliente_nome}!\n\nSeu agendamento foi cancelado:\n📅 Data: {data}\n🕐 Hora: {hora}\n💼 Serviços: {servicos}\n\nQualquer dúvida, entre em contato conosco.',
    intervaloMinutos: null // Disparo imediato
  },
  MUDANCA_STATUS: {
    nome: 'Mudança de Status',
    sms: 'Atualização: O status do seu agendamento de {data} às {hora} foi alterado.',
    whatsapp: '🔄 *Atualização de Agendamento*\n\nOlá {cliente_nome}!\n\nO status do seu agendamento foi atualizado:\n📅 Data: {data}\n🕐 Hora: {hora}\n💼 Serviços: {servicos}',
    intervaloMinutos: null // Disparo imediato
  }
}

/**
 * Calcula data/hora de envio baseado no intervalo
 */
export function calculateScheduledTime(
  agendamentoDate: Date,
  intervaloMinutos: number | null
): Date {
  if (intervaloMinutos === null || intervaloMinutos === 0) {
    // Disparo imediato
    return new Date()
  }

  // Subtrai o intervalo da data do agendamento
  const scheduledTime = new Date(agendamentoDate)
  scheduledTime.setMinutes(scheduledTime.getMinutes() - intervaloMinutos)

  // Se a data calculada já passou, agenda para agora
  if (scheduledTime < new Date()) {
    return new Date()
  }

  return scheduledTime
}

/**
 * Converte minutos para descrição legível
 */
export function intervaloToText(minutos: number | null): string {
  if (minutos === null || minutos === 0) {
    return 'Imediato'
  }

  if (minutos < 60) {
    return `${minutos} minutos antes`
  }

  const horas = Math.floor(minutos / 60)
  const mins = minutos % 60

  if (mins === 0) {
    if (horas === 24) return '1 dia antes'
    if (horas === 48) return '2 dias antes'
    if (horas % 24 === 0) return `${horas / 24} dias antes`
    return `${horas} ${horas === 1 ? 'hora' : 'horas'} antes`
  }

  return `${horas}h${mins}min antes`
}

