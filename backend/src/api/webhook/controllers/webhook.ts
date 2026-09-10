import Stripe from 'stripe';
import { sendOrderConfirmationEmail } from '../../../services/email';

export default {
  async handleStripe(ctx: any) {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeKey) {
      return ctx.badRequest('Stripe is not configured');
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2025-01-27.acacia' as any });
    const sig = ctx.request.headers['stripe-signature'];
    let event: Stripe.Event;

    if (!webhookSecret) {
      strapi.log.error('STRIPE_WEBHOOK_SECRET is not configured on backend.');
      return ctx.badRequest('Webhook secret configuration missing');
    }

    if (!sig) {
      strapi.log.error('Missing stripe-signature header.');
      return ctx.badRequest('stripe-signature header missing');
    }

    try {
      event = stripe.webhooks.constructEvent(
        ctx.request.body[Symbol.for('unparsedBody')] || JSON.stringify(ctx.request.body),
        sig,
        webhookSecret
      );
    } catch (err: any) {
      strapi.log.error(`Stripe webhook signature verification failed: ${err.message}`);
      return ctx.badRequest(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderNumber = session.metadata?.orderNumber;
      const orderId = session.metadata?.orderId;
      const cartId = session.metadata?.cartId;
      const discountCode = session.metadata?.discountCode;

      let order: any = null;
      if (orderNumber) {
        const found: any = await strapi.entityService.findMany('api::order.order' as any, {
          filters: { orderNumber },
          populate: ['items', 'shippingAddress', 'user'],
        });
        order = found?.[0];
      } else if (orderId) {
        order = await strapi.entityService.findOne('api::order.order' as any, orderId, {
          populate: ['items', 'shippingAddress', 'user'],
        });
      }

      if (order && order.status !== 'paid') {
        // Decrement inventory in transaction
        await strapi.db.transaction(async ({ trx }: any) => {
          for (const item of order.items || []) {
            if (item.variant) {
              const inv = await trx('inventories')
                .join('variants', 'variants.id', 'inventories.variant_id')
                .where('variants.id', item.variant.id || item.variant)
                .select('inventories.id', 'inventories.quantity')
                .first();

              if (inv) {
                const newQty = Math.max(0, inv.quantity - item.quantity);
                await trx('inventories').where('id', inv.id).update({ quantity: newQty });
              }
            }
          }

          await trx('orders').where('id', order.id).update({
            status: 'paid',
            stripe_payment_intent_id: (session.payment_intent as string) || session.id,
          });
        });

        // Increment discountCode currentUses if code was applied
        if (discountCode) {
          const discounts: any = await strapi.entityService.findMany('api::discount-code.discount-code' as any, {
            filters: { code: discountCode.trim().toUpperCase() },
          });
          if (discounts && discounts.length > 0) {
            const disc = discounts[0];
            await strapi.entityService.update('api::discount-code.discount-code' as any, disc.id, {
              data: {
                currentUses: (disc.currentUses || 0) + 1,
              } as any,
            });
            strapi.log.info(`[DISCOUNT] Incremented currentUses for discount code ${disc.code} to ${(disc.currentUses || 0) + 1}`);
          }
        }

        // Clear cart if provided
        if (cartId) {
          await strapi.entityService.update('api::cart.cart' as any, cartId, {
            data: { items: [] } as any,
          });
        }

        // Also clear user's cart if order has associated user
        if (order.user) {
          const userCart: any = await strapi.db.query('api::cart.cart').findOne({ where: { user: order.user.id } });
          if (userCart) {
            await strapi.entityService.update('api::cart.cart' as any, userCart.id, { data: { items: [] } as any });
          }
        }

        strapi.log.info(`[STRIPE WEBHOOK] Order ${order.orderNumber} successfully marked as PAID and inventory decremented.`);

        // Send order confirmation email
        try {
          await sendOrderConfirmationEmail({
            customerEmail: order.customerEmail,
            orderNumber: order.orderNumber,
            totalAmount: order.totalAmount,
            currency: order.currency,
            items: order.items || [],
            shippingAddress: order.shippingAddress,
          });
        } catch (emailErr: any) {
          strapi.log.error(`[EMAIL DISPATCH ERROR] Order ${order.orderNumber}: ${emailErr.message}`);
        }
      }
    }

    return { received: true };
  },
};
