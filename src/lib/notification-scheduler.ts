import { prisma } from './prisma'
import { 
  processTemplate, 
  calculateScheduledTime, 
  type AgendamentoData 
} from './notification-templates'
import { TipoNotificacao, CanalNotificacao, StatusNotificacao } from '@prisma/client'

/**
 * Cria notificações agendadas baseadas nos templates ativos do usuário
 */
export async function createScheduledNotifications(
  agendamentoId: string,
  userId: string,
  tipo: TipoNotificacao
) {
  try {
    // Buscar templates ativos do usuário para este tipo
    const templates = await prisma.notificationTemplate.findMany({
      where: {
        userId,
        tipo,
        ativo: true,
        OR: [
          { habilitarSMS: true },
          { habilitarWhatsApp: true }
        ]
      }
    })

    if (templates.length === 0) {
      console.log(`Nenhum template ativo encontrado para tipo ${tipo}`)
      return
    }

    // Buscar dados do agendamento
    const agendamento = await prisma.agendamento.findUnique({
      where: { id: agendamentoId },
      include: {
        cliente: true,
        servicos: {
          include: {
            servico: true
          }
        },
        user: {
          select: {
            name: true
          }
        }
      }
    })

    if (!agendamento) {
      console.error(`Agendamento ${agendamentoId} não encontrado`)
      return
    }

    // Preparar dados para o template
    const agendamentoData: AgendamentoData = {
      cliente: {
        nome: agendamento.cliente.nome,
        telefone: agendamento.cliente.telemovel
      },
      dataHoraInicio: agendamento.dataHoraInicio,
      dataHoraFim: agendamento.dataHoraFim,
      valorTotal: agendamento.valorTotal.toString(),
      duracaoTotal: agendamento.duracaoTotal,
      observacoes: agendamento.observacoes,
      servicos: agendamento.servicos.map(as => ({
        titulo: as.servico.titulo,
        valor: as.valor.toString(),
        timeExecution: as.timeExecution
      })),
      estabelecimento: {
        nome: agendamento.user.name || 'Nosso estabelecimento'
      }
    }

    // Criar notificações agendadas para cada template
    const notificationsToCreate = []

    for (const template of templates) {
      const dataHoraAgendada = calculateScheduledTime(
        agendamento.dataHoraInicio,
        template.intervaloMinutos
      )

      // SMS
      if (template.habilitarSMS && template.mensagemSMS) {
        const mensagem = processTemplate(template.mensagemSMS, agendamentoData)
        
        notificationsToCreate.push({
          agendamentoId,
          templateId: template.id,
          canal: CanalNotificacao.SMS,
          destinatario: agendamento.cliente.telemovel,
          mensagem,
          dataHoraAgendada,
          status: StatusNotificacao.PENDENTE
        })
      }

      // WhatsApp
      if (template.habilitarWhatsApp && template.mensagemWhatsApp) {
        const mensagem = processTemplate(template.mensagemWhatsApp, agendamentoData)
        
        notificationsToCreate.push({
          agendamentoId,
          templateId: template.id,
          canal: CanalNotificacao.WHATSAPP,
          destinatario: agendamento.cliente.telemovel,
          mensagem,
          dataHoraAgendada,
          status: StatusNotificacao.PENDENTE
        })
      }
    }

    // Criar todas as notificações de uma vez
    if (notificationsToCreate.length > 0) {
      await prisma.notificationScheduled.createMany({
        data: notificationsToCreate
      })

      console.log(`${notificationsToCreate.length} notificações agendadas criadas para agendamento ${agendamentoId}`)
    }
  } catch (error) {
    console.error('Erro ao criar notificações agendadas:', error)
    // Não lançar erro para não quebrar o fluxo principal
  }
}

/**
 * Cancela notificações pendentes de um agendamento
 */
export async function cancelScheduledNotifications(agendamentoId: string) {
  try {
    const result = await prisma.notificationScheduled.updateMany({
      where: {
        agendamentoId,
        status: StatusNotificacao.PENDENTE
      },
      data: {
        status: StatusNotificacao.CANCELADA
      }
    })

    console.log(`${result.count} notificações canceladas para agendamento ${agendamentoId}`)
  } catch (error) {
    console.error('Erro ao cancelar notificações:', error)
  }
}

/**
 * Envia notificação imediata (para mudanças de status)
 * Cria uma notificação agendada para "agora"
 */
export async function sendImmediateNotification(
  agendamentoId: string,
  userId: string,
  tipo: TipoNotificacao
) {
  // Usa a mesma lógica, mas com intervalo null (imediato)
  await createScheduledNotifications(agendamentoId, userId, tipo)
}

