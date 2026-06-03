/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface EmailNotification {
  to: string;
  subject: string;
  body: string;
}

export async function sendEmailNotification(notification: EmailNotification): Promise<boolean> {
  try {
    // Em produção, isso seria integrado com um serviço de email real
    // como SendGrid, Mailgun, ou um endpoint API próprio
    console.log('Email notification:', notification);
    
    // Simulação de envio de email
    // Em produção, substituir com chamada real à API de email
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notification),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    return true;
  } catch (error) {
    console.error('Error sending email notification:', error);
    return false;
  }
}

export function createQuoteNotificationEmail(
  clientName: string,
  productName: string,
  quoteValue: number,
  businessName: string
): EmailNotification {
  return {
    to: businessName,
    subject: `Novo orçamento solicitado - ${clientName}`,
    body: `
      <h2>Novo orçamento recebido</h2>
      <p><strong>Cliente:</strong> ${clientName}</p>
      <p><strong>Produto:</strong> ${productName}</p>
      <p><strong>Valor estimado:</strong> R$ ${quoteValue.toFixed(2)}</p>
      <p>Entre em contato com o cliente para detalhes.</p>
    `,
  };
}

export function createOrderNotificationEmail(
  clientName: string,
  productName: string,
  quantity: number,
  businessName: string
): EmailNotification {
  return {
    to: businessName,
    subject: `Novo pedido confirmado - ${clientName}`,
    body: `
      <h2>Novo pedido confirmado</h2>
      <p><strong>Cliente:</strong> ${clientName}</p>
      <p><strong>Produto:</strong> ${productName}</p>
      <p><strong>Quantidade:</strong> ${quantity}</p>
      <p>Inicie a produção do pedido.</p>
    `,
  };
}
