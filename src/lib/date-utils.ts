/**
 * Adiciona minutos a uma data
 */
export function adicionarMinutos(data: Date, minutos: number): Date {
  const novaData = new Date(data)
  novaData.setMinutes(novaData.getMinutes() + minutos)
  return novaData
}

/**
 * Verifica se dois períodos de tempo se sobrepõem
 */
export function horariosSeConflitam(
  inicio1: Date,
  fim1: Date,
  inicio2: Date,
  fim2: Date
): boolean {
  // Conflito se: inicio1 < fim2 E inicio2 < fim1
  return inicio1 < fim2 && inicio2 < fim1
}

/**
 * Formata data/hora para exibição em pt-BR
 */
export function formatarDataHora(dataString: string | Date): string {
  const data = typeof dataString === 'string' ? new Date(dataString) : dataString
  return data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Formata apenas a data em pt-BR
 */
export function formatarData(dataString: string | Date): string {
  const data = typeof dataString === 'string' ? new Date(dataString) : dataString
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Formata apenas o horário
 */
export function formatarHorario(dataString: string | Date): string {
  const data = typeof dataString === 'string' ? new Date(dataString) : dataString
  return data.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Converte duração em minutos para formato legível (ex: "1h 30min")
 */
export function formatarDuracao(minutos: number): string {
  const horas = Math.floor(minutos / 60)
  const mins = minutos % 60

  if (horas === 0) {
    return `${mins}min`
  }

  if (mins === 0) {
    return `${horas}h`
  }

  return `${horas}h ${mins}min`
}

/**
 * Converte string de datetime-local input para Date
 */
export function converterDateTimeLocal(datetimeLocal: string): Date {
  return new Date(datetimeLocal)
}

/**
 * Converte Date para formato datetime-local input (YYYY-MM-DDTHH:mm)
 */
export function converterParaDateTimeLocal(data: Date | string): string {
  const d = typeof data === 'string' ? new Date(data) : data
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

/**
 * Calcula a diferença em minutos entre duas datas
 */
export function calcularDiferencaMinutos(inicio: Date, fim: Date): number {
  return Math.floor((fim.getTime() - inicio.getTime()) / (1000 * 60))
}

/**
 * Valida se a data/hora de início é anterior à de fim
 */
export function validarPeriodo(inicio: Date, fim: Date): boolean {
  return inicio < fim
}

