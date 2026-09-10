import Stripe from 'stripe';
import crypto from 'crypto';
import { sendOrderConfirmationEmail } from '../../../services/email';

export default {
  async createCheckoutSession(ctx: any) {
    const user = ctx.state.user;
    const sessionId = ctx.request.headers['x-session-id'] || ctx.request.body?.sessionId;
    const {
      customerEmail,
      shippingAddress,
      currency = 'USD',
      discountCode,
      notes,
    } = ctx.request.body || {};

    if (!customerEmail || typeof customerEmail !== 'string') {
      return ctx.badRequest('Valid customerEmail is required');
    }
    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.postalCode) {
      return ctx.badRequest('Valid shipping address required');
    }

    const where: any = user ? { user: user.id } : { sessionId };
    const cart: any = await strapi.db.query('api::cart.cart').findOne({
      where,
      populate: {
        items: {
          populate: {
            variant: {
              populate: ['product', 'inventory', 'prices'],
            },
          },
        },
      },
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      return ctx.badRequest('Your cart is empty');
    }

    let subtotal = 0;
    const orderItems: any[] = [];
    const stripeLineItems: any[] = [];

    for (const item of cart.items) {
      const variant: any = await strapi.db.query('api::variant.variant').findOne({
        where: { id: item.variant?.id || item.variant },
        populate: ['product', 'inventory', 'prices'],
      });

      if (!variant) {
        return ctx.badRequest(`Variant no longer exists for item ${item.productName}`);
      }

      const availableStock = variant.inventory?.quantity ?? 0;
      if (availableStock < item.quantity) {
        return ctx.badRequest(`Item "${variant.product?.name} (${variant.title})" has only ${availableStock} in stock.`);
      }

      const priceObj = variant.prices?.find((p: any) => p.currency === currency) || variant.prices?.[0];
      const verifiedUnitPrice = priceObj ? priceObj.amount : (variant.priceOverride || item.unitPrice || 0);
      const lineTotal = verifiedUnitPrice * item.quantity;
      subtotal += lineTotal;

      const imgUrl = variant.image || (variant.product?.images?.[0]?.url || variant.product?.images?.[0] || '');

      orderItems.push({
        variant: variant.id,
        productName: variant.product?.name || item.productName || 'Product',
        variantTitle: variant.title || item.variantTitle,
        sku: variant.sku || item.sku,
        quantity: item.quantity,
        unitPrice: verifiedUnitPrice,
        totalPrice: lineTotal,
        currency,
        imageUrl: typeof imgUrl === 'string' ? imgUrl : (imgUrl?.url || ''),
      });

      stripeLineItems.push({
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: `${variant.product?.name || 'Product'} - ${variant.title}`,
            metadata: {
              sku: variant.sku,
            },
          },
          unit_amount: verifiedUnitPrice,
        },
        quantity: item.quantity,
      });
    }

    let discountAmount = 0;
    let validatedCode: string | undefined;
    if (discountCode) {
      const discounts: any = await strapi.entityService.findMany('api::discount-code.discount-code' as any, {
        filters: { code: discountCode.trim().toUpperCase(), isActive: true },
      });
      if (discounts && discounts.length > 0) {
        const disc = discounts[0];
        if (!disc.expiresAt || new Date(disc.expiresAt) >= new Date()) {
          if (!disc.maxUses || (disc.currentUses || 0) < disc.maxUses) {
            if (subtotal >= (disc.minOrderAmount || 0)) {
              if (disc.discountType === 'percent') {
                discountAmount = Math.round((subtotal * disc.value) / 100);
              } else {
                discountAmount = disc.value;
              }
              discountAmount = Math.min(discountAmount, subtotal);
              validatedCode = disc.code;
            }
          }
        }
      }
    }

    const shippingAmount = subtotal >= 10000 ? 0 : (subtotal > 0 ? 1000 : 0);
    const totalAmount = Math.max(0, subtotal - discountAmount + shippingAmount);

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randHex = crypto.randomBytes(4).toString('hex').toUpperCase();
    const orderNumber = `AFF-${dateStr}-${randHex}`;

    const createdOrder: any = await strapi.entityService.create('api::order.order' as any, {
      data: {
        orderNumber,
        user: user ? user.id : null,
        customerEmail,
        items: orderItems,
        status: 'pending',
        currency,
        subtotal,
        shippingAmount,
        discountAmount,
        totalAmount,
        shippingAddress: {
          name: shippingAddress.name || `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim(),
          street: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state || '',
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country,
          phone: shippingAddress.phone || '',
        },
        notes: notes || '',
      } as any,
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4321';
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const isMockStripe = !stripeKey || stripeKey.includes('mock') || stripeKey === 'sk_test_mock_secret_key';

    if (isMockStripe) {
      return {
        mode: 'mock',
        checkoutUrl: `${frontendUrl}/checkout/success?orderNumber=${orderNumber}&mock=true`,
        orderNumber,
        totalAmount,
        currency,
        orderId: createdOrder.id,
      };
    }

    try {
      const stripe = new Stripe(stripeKey, { apiVersion: '2025-01-27.acacia' as any });
      const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: customerEmail,
        line_items: stripeLineItems,
        mode: 'payment',
        success_url: `${frontendUrl}/checkout/success?orderNumber=${orderNumber}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/checkout?cancelled=true`,
        metadata: {
          orderId: String(createdOrder.id),
          orderNumber,
          cartId: String(cart.id),
          discountCode: validatedCode || '',
        },
      });

      await strapi.entityService.update('api::order.order' as any, createdOrder.id, {
        data: {
          stripeSessionId: stripeSession.id,
        } as any,
      });

      return {
        mode: 'stripe',
        checkoutUrl: stripeSession.url,
        sessionId: stripeSession.id,
        orderNumber,
        totalAmount,
        currency,
      };
    } catch (err: any) {
      strapi.log.error('Stripe session creation error:', err);
      return ctx.internalServerError(`Payment session error: ${err.message}`);
    }
  },

  async confirmMockOrder(ctx: any) {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const isMockStripe = !stripeKey || stripeKey.includes('mock') || stripeKey === 'sk_test_mock_secret_key';
    if (!isMockStripe) {
      return ctx.forbidden('Mock order confirmation is disabled when live Stripe is active');
    }

    const { orderNumber } = ctx.request.body || {};
    if (!orderNumber) {
      return ctx.badRequest('orderNumber required');
    }

    const orders: any = await strapi.entityService.findMany('api::order.order' as any, {
      filters: { orderNumber },
      populate: ['items', 'shippingAddress', 'user'],
    });

    if (!orders || orders.length === 0) {
      return ctx.notFound('Order not found');
    }

    const order = orders[0];
    if (order.status === 'paid') {
      return { success: true, order, alreadyPaid: true };
    }

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
        stripe_payment_intent_id: `mock_pi_${Date.now()}`,
      });
    });

    // Clear user cart or guest cart
    if (order.user) {
      const userCart: any = await strapi.db.query('api::cart.cart').findOne({ where: { user: order.user.id } });
      if (userCart) {
        await strapi.entityService.update('api::cart.cart' as any, userCart.id, { data: { items: [] } as any });
      }
    }

    // Send confirmation email simulation
    try {
      await sendOrderConfirmationEmail({
        customerEmail: order.customerEmail,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        currency: order.currency,
        items: order.items || [],
        shippingAddress: order.shippingAddress,
      });
    } catch (e: any) {
      strapi.log.error(`Email simulation error: ${e.message}`);
    }

    return {
      success: true,
      message: 'Order confirmed and inventory decremented',
      orderNumber: order.orderNumber,
    };
  },
};
