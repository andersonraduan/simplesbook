import { auth } from '@/auth'
import { sendSMS, sendWhatsApp, getNotificationStatus } from '@/lib/twilio'
import { NextResponse } from 'next/server'

/**
 * Endpoint para testar envio de notificações
 */
export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { canal, destinatario, mensagem } = body

    // Validações
    if (!canal || !destinatario || !mensagem) {
      return NextResponse.json(
        { error: 'Canal, destinatário e mensagem são obrigatórios' },
        { status: 400 }
      )
    }

    if (canal !== 'SMS' && canal !== 'WHATSAPP') {
      return NextResponse.json(
        { error: 'Canal deve ser SMS ou WHATSAPP' },
        { status: 400 }
      )
    }

    // Verificar configuração
    const status = getNotificationStatus()
    if (!status.configured) {
      return NextResponse.json(
        { error: 'Twilio não está configurado. Verifique as variáveis de ambiente.' },
        { status: 500 }
      )
    }

    if (canal === 'SMS' && !status.smsEnabled) {
      return NextResponse.json(
        { error: 'Notificações SMS estão desabilitadas' },
        { status: 400 }
      )
    }

    if (canal === 'WHATSAPP' && !status.whatsappEnabled) {
      return NextResponse.json(
        { error: 'Notificações WhatsApp estão desabilitadas' },
        { status: 400 }
      )
    }

    // Enviar mensagem de teste
    let result: { success: boolean; sid?: string; error?: string }

    if (canal === 'SMS') {
      result = await sendSMS(destinatario, mensagem)
    } else {
      result = await sendWhatsApp(destinatario, mensagem)
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Mensagem enviada com sucesso',
        sid: result.sid,
        canal,
        destinatario
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          canal,
          destinatario
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Erro ao enviar mensagem de teste:', error)
    return NextResponse.json(
      { error: 'Erro ao enviar mensagem de teste' },
      { status: 500 }
    )
  }
}

// GET - Verificar status da configuração
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const status = getNotificationStatus()

    return NextResponse.json(status)
  } catch (error) {
    console.error('Erro ao verificar status:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar status' },
      { status: 500 }
    )
  }
}

