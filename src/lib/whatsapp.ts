// lib/whatsapp.ts - Meta WhatsApp Business API integration
export interface WhatsAppMessage {
  to: string;
  message: string;
  orderTracking?: string;
}

export interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendWhatsAppMessage(payload: WhatsAppMessage): Promise<WhatsAppResponse> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    console.error('WhatsApp credentials missing');
    return { success: false, error: 'WhatsApp not configured' };
  }

  // Format phone number (remove leading 0, add +212 for Morocco)
  let phone = payload.to.replace(/\s/g, '').replace(/^0/, '212');
  if (!phone.startsWith('+')) phone = '+' + phone;
  // Remove + for API
  phone = phone.replace('+', '');

  const body = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: phone,
    type: 'text',
    text: {
      preview_url: false,
      body: payload.message,
    },
  };

  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('WhatsApp API error:', data);
      return { success: false, error: data?.error?.message || 'WhatsApp API error' };
    }

    return {
      success: true,
      messageId: data?.messages?.[0]?.id,
    };
  } catch (error) {
    console.error('WhatsApp fetch error:', error);
    return { success: false, error: 'Network error' };
  }
}

export function verifyWhatsAppWebhook(
  mode: string,
  token: string,
  challenge: string
): string | null {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  if (mode === 'subscribe' && token === verifyToken) {
    return challenge;
  }
  return null;
}
