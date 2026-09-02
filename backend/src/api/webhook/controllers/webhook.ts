import Stripe from 'stripe';

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

    try {
      if (webhookSecret && sig) {
        event = stripe.webhooks.constructEvent(ctx.request.body[Symbol.for('unparsedBody')] || JSON.stringify(ctx.request.body), sig, webhookSecret);
      } else {
        event = ctx.request.body as Stripe.Event;
      }
    } catch (err: any) {
      strapi.log.error(`Stripe webhook signature verification failed: ${err.message}`);
      return ctx.badRequest(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderNumber = session.metadata?.orderNumber;
      const orderId = session.metadata?.orderId;
      const cartId = session.metadata?.cartId;

      let order: any = null;
      if (orderNumber) {
        const found: any = await strapi.entityService.findMany('api::order.order' as any, {
          filters: { orderNumber },
          populate: ['items'],
        });
        order = found?.[0];
      } else if (orderId) {
        order = await strapi.entityService.findOne('api::order.order' as any, orderId, {
          populate: ['items'],
        });
      }

      if (order && order.status !== 'paid') {
        const knex = strapi.db.connection;
        await knex.transaction(async (trx: any) => {
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

        if (cartId) {
          await strapi.entityService.update('api::cart.cart' as any, cartId, {
            data: { items: [] } as any,
          });
        }

        strapi.log.info(`[STRIPE WEBHOOK] Order ${order.orderNumber} successfully marked as PAID and inventory decremented.`);
      }
    }

    return { received: true };
  },
};
