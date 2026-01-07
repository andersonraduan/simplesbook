import twilio from 'twilio'

// Configuração do cliente Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const phoneNumber = process.env.TWILIO_PHONE_NUMBER
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER

// Flags de controle
const smsEnabled = process.env.ENABLE_SMS_NOTIFICATIONS === 'true'
const whatsappEnabled = process.env.ENABLE_WHATSAPP_NOTIFICATIONS === 'true'

// Cliente Twilio
let twilioClient: ReturnType<typeof twilio> | null = null

function getTwilioClient() {
  if (!twilioClient && accountSid && authToken) {
    twilioClient = twilio(accountSid, authToken)
  }
  return twilioClient
}

/**
 * Formata número de telefone para padrão internacional
 * Assume formato português se não tiver código de país
 */
export function formatPhoneNumber(phone: string): string {
  // Remove caracteres não numéricos
  const cleaned = phone.replace(/\D/g, '')
  
  // Se já começa com +, retorna como está
  if (phone.startsWith('+')) {
    return phone
  }
  
  // Se tem 12 dígitos e começa com 351 (Portugal)
  if (cleaned.length === 12 && cleaned.startsWith('351')) {
    return `+${cleaned}`
  }
  
  // Se tem 9 dígitos (celular PT sem código país)
  if (cleaned.length === 9) {
    return `+351${cleaned}`
  }
  
  // Retorna com + se não tiver
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`
}

/**
 * Envia SMS via Twilio
 */
export async function sendSMS(to: string, message: string): Promise<{
  success: boolean
  sid?: string
  error?: string
}> {
  try {
    if (!smsEnabled) {
      return {
        success: false,
        error: 'SMS notifications are disabled'
      }
    }

    const client = getTwilioClient()
    if (!client) {
      return {
        success: false,
        error: 'Twilio client not configured'
      }
    }

    if (!phoneNumber) {
      return {
        success: false,
        error: 'Twilio phone number not configured'
      }
    }

    const formattedTo = formatPhoneNumber(to)
    
    const result = await client.messages.create({
      body: message,
      from: phoneNumber,
      to: formattedTo
    })

    return {
      success: true,
      sid: result.sid
    }
  } catch (error) {
    console.error('Error sending SMS:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Envia mensagem WhatsApp via Twilio
 */
export async function sendWhatsApp(to: string, message: string): Promise<{
  success: boolean
  sid?: string
  error?: string
}> {
  try {
    if (!whatsappEnabled) {
      return {
        success: false,
        error: 'WhatsApp notifications are disabled'
      }
    }

    const client = getTwilioClient()
    if (!client) {
      return {
        success: false,
        error: 'Twilio client not configured'
      }
    }

    if (!whatsappNumber) {
      return {
        success: false,
        error: 'Twilio WhatsApp number not configured'
      }
    }

    const formattedTo = formatPhoneNumber(to)
    
    const result = await client.messages.create({
      body: message,
      from: whatsappNumber,
      to: `whatsapp:${formattedTo}`
    })

    return {
      success: true,
      sid: result.sid
    }
  } catch (error) {
    console.error('Error sending WhatsApp:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Verifica se as credenciais Twilio estão configuradas
 */
export function isTwilioConfigured(): boolean {
  return !!(accountSid && authToken && phoneNumber && whatsappNumber)
}

/**
 * Retorna status das configurações de notificação
 */
export function getNotificationStatus() {
  return {
    configured: isTwilioConfigured(),
    smsEnabled,
    whatsappEnabled
  }
}

