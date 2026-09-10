import { Resend } from 'resend';

interface OrderConfirmationEmailParams {
  customerEmail: string;
  orderNumber: string;
  totalAmount: number;
  currency: string;
  items: Array<{
    productName: string;
    variantTitle?: string;
    quantity: number;
    unitPrice: number;
  }>;
  shippingAddress?: {
    name?: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

export async function sendOrderConfirmationEmail(params: OrderConfirmationEmailParams): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'orders@affeto.com';

  const itemsHtml = (params.items || [])
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.productName} (${item.variantTitle || 'Standard'})</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${(item.unitPrice / 100).toFixed(2)} ${params.currency}</td>
      </tr>`
    )
    .join('');

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
      <h1 style="font-size: 24px; font-weight: bold; border-bottom: 2px solid #111; padding-bottom: 10px;">Afetto.</h1>
      <p style="font-size: 16px;">Thank you for your order!</p>
      <p>We're getting your order <strong>#${params.orderNumber}</strong> ready to be shipped.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
        <thead>
          <tr style="background: #f8f8f8; text-align: left; font-size: 12px; text-transform: uppercase;">
            <th style="padding: 8px;">Item</th>
            <th style="padding: 8px; text-align: center;">Qty</th>
            <th style="padding: 8px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="text-align: right; margin-top: 16px; font-size: 16px;">
        <strong>Total: ${(params.totalAmount / 100).toFixed(2)} ${params.currency}</strong>
      </div>

      ${
        params.shippingAddress
          ? `<div style="margin-top: 24px; padding: 16px; background: #f8f8f8; border-radius: 4px; font-size: 13px;">
              <strong>Shipping to:</strong><br>
              ${params.shippingAddress.name || ''}<br>
              ${params.shippingAddress.street || ''}<br>
              ${params.shippingAddress.city || ''}, ${params.shippingAddress.state || ''} ${params.shippingAddress.postalCode || ''}<br>
              ${params.shippingAddress.country || ''}
            </div>`
          : ''
      }

      <footer style="margin-top: 40px; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 16px;">
        Afetto Wardrobe — Porto, Portugal.
      </footer>
    </div>
  `;

  if (!apiKey) {
    strapi.log.info(`[EMAIL SIMULATION] Order confirmation email prepared for ${params.customerEmail} (Order #${params.orderNumber}). To send real emails, set RESEND_API_KEY.`);
    return true;
  }

  try {
    const resend = new Resend(apiKey);
    const data = await resend.emails.send({
      from: fromEmail,
      to: params.customerEmail,
      subject: `Your Affeto Order Confirmation #${params.orderNumber}`,
      html: htmlContent,
    });
    strapi.log.info(`[EMAIL SENT] Order confirmation email dispatched via Resend to ${params.customerEmail} (ID: ${data?.data?.id})`);
    return true;
  } catch (err: any) {
    strapi.log.error(`[EMAIL ERROR] Failed to send order confirmation email via Resend: ${err.message}`);
    return false;
  }
}
