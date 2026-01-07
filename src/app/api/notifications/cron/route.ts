import { prisma } from '@/lib/prisma'
import { sendSMS, sendWhatsApp } from '@/lib/twilio'
import { NextResponse } from 'next/server'
import { CanalNotificacao, StatusNotificacao } from '@prisma/client'

/**
 * Job de disparo automático de notificações
 * Deve ser chamado periodicamente (ex: a cada 10 minutos via cron)
 */
export async function GET(request: Request) {
  try {
    // Validação básica de segurança (opcional)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const now = new Date()
    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
      errors: [] as string[]
    }

    // Buscar notificações pendentes que devem ser enviadas
    const pendingNotifications = await prisma.notificationScheduled.findMany({
      where: {
        status: StatusNotificacao.PENDENTE,
        dataHoraAgendada: {
          lte: now // Data/hora agendada <= agora
        }
      },
      include: {
        agendamento: {
          include: {
            cliente: true,
            servicos: {
              include: {
                servico: true
              }
            }
          }
        },
        template: true
      },
      take: 50 // Processar no máximo 50 por vez
    })

    console.log(`[CRON] Encontradas ${pendingNotifications.length} notificações para processar`)

    // Processar cada notificação
    for (const notification of pendingNotifications) {
      results.processed++

      try {
        // Verificar se agendamento ainda está ativo
        if (notification.agendamento.status === 'CANCELADO') {
          // Cancelar notificação
          await prisma.notificationScheduled.update({
            where: { id: notification.id },
            data: { 
              status: StatusNotificacao.CANCELADA,
              updatedAt: new Date()
            }
          })
          console.log(`[CRON] Notificação ${notification.id} cancelada (agendamento cancelado)`)
          continue
        }

        // Enviar notificação
        let sendResult: { success: boolean; sid?: string; error?: string }

        if (notification.canal === CanalNotificacao.SMS) {
          sendResult = await sendSMS(notification.destinatario, notification.mensagem)
        } else {
          sendResult = await sendWhatsApp(notification.destinatario, notification.mensagem)
        }

        if (sendResult.success) {
          // Atualizar status para ENVIADA
          await prisma.notificationScheduled.update({
            where: { id: notification.id },
            data: {
              status: StatusNotificacao.ENVIADA,
              ultimaTentativa: now,
              updatedAt: now
            }
          })

          // Registrar no log
          await prisma.notificationLog.create({
            data: {
              agendamentoId: notification.agendamentoId,
              tipo: notification.template.tipo,
              canal: notification.canal,
              destinatario: notification.destinatario,
              mensagem: notification.mensagem,
              status: StatusNotificacao.ENVIADA,
              twilioSid: sendResult.sid
            }
          })

          results.sent++
          console.log(`[CRON] Notificação ${notification.id} enviada com sucesso`)
        } else {
          // Incrementar tentativas
          const tentativas = notification.tentativas + 1
          const maxTentativas = 3

          if (tentativas >= maxTentativas) {
            // Marcar como FALHA após 3 tentativas
            await prisma.notificationScheduled.update({
              where: { id: notification.id },
              data: {
                status: StatusNotificacao.FALHA,
                tentativas,
                ultimaTentativa: now,
                erroMensagem: sendResult.error,
                updatedAt: now
              }
            })

            // Registrar no log
            await prisma.notificationLog.create({
              data: {
                agendamentoId: notification.agendamentoId,
                tipo: notification.template.tipo,
                canal: notification.canal,
                destinatario: notification.destinatario,
                mensagem: notification.mensagem,
                status: StatusNotificacao.FALHA,
                erroMensagem: sendResult.error
              }
            })

            results.failed++
            results.errors.push(`Notificação ${notification.id}: ${sendResult.error}`)
            console.error(`[CRON] Notificação ${notification.id} falhou após ${tentativas} tentativas: ${sendResult.error}`)
          } else {
            // Atualizar tentativas e reagendar para próxima execução
            await prisma.notificationScheduled.update({
              where: { id: notification.id },
              data: {
                tentativas,
                ultimaTentativa: now,
                erroMensagem: sendResult.error,
                updatedAt: now
              }
            })

            console.log(`[CRON] Notificação ${notification.id} falhou (tentativa ${tentativas}/${maxTentativas}): ${sendResult.error}`)
          }
        }
      } catch (error) {
        console.error(`[CRON] Erro ao processar notificação ${notification.id}:`, error)
        results.errors.push(`Notificação ${notification.id}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
        
        // Incrementar tentativas mesmo em caso de erro
        await prisma.notificationScheduled.update({
          where: { id: notification.id },
          data: {
            tentativas: notification.tentativas + 1,
            ultimaTentativa: now,
            erroMensagem: error instanceof Error ? error.message : 'Erro desconhecido',
            updatedAt: now
          }
        }).catch(err => console.error('Erro ao atualizar notificação:', err))
      }
    }

    // Limpar logs antigos (mais de 90 dias)
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
    
    const deletedLogs = await prisma.notificationLog.deleteMany({
      where: {
        createdAt: {
          lt: ninetyDaysAgo
        }
      }
    })

    console.log(`[CRON] ${deletedLogs.count} logs antigos removidos`)

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      results: {
        ...results,
        logsDeleted: deletedLogs.count
      }
    })
  } catch (error) {
    console.error('[CRON] Erro no job de notificações:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      },
      { status: 500 }
    )
  }
}

// Permitir POST também (para testes manuais)
export async function POST(request: Request) {
  return GET(request)
}

