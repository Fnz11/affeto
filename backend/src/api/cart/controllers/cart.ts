export default {
  async getCart(ctx: any) {
    const user = ctx.state.user;
    const sessionId = ctx.request.headers['x-session-id'] || ctx.query.sessionId;

    if (!user && !sessionId) {
      return ctx.badRequest('Session ID or authentication required');
    }

    const where: any = {};
    if (user) {
      where.user = user.id;
    } else {
      where.sessionId = sessionId;
    }

    let cart: any = await strapi.db.query('api::cart.cart').findOne({
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

    if (!cart) {
      const created = await strapi.entityService.create('api::cart.cart' as any, {
        data: {
          sessionId: user ? null : sessionId,
          user: user ? user.id : null,
          currency: (ctx.request.headers['x-currency'] as string) || 'USD',
          items: [],
          lastActiveAt: new Date(),
        } as any,
      });
      cart = { ...created, items: [] };
    }

    const items = cart.items || [];
    const currency = cart.currency || (ctx.request.headers['x-currency'] as string) || 'USD';
    const subtotal = items.reduce((acc: number, item: any) => acc + (item.unitPrice || 0) * (item.quantity || 1), 0);
    const totalItems = items.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0);

    return {
      data: {
        ...cart,
        subtotal,
        totalItems,
        currency,
      },
    };
  },

  async addItem(ctx: any) {
    const user = ctx.state.user;
    const sessionId = ctx.request.headers['x-session-id'] || ctx.request.body.sessionId;
    const { variantId, quantity = 1, currency = 'USD' } = ctx.request.body;

    if (!variantId) {
      return ctx.badRequest('variantId is required');
    }
    if (!user && !sessionId) {
      return ctx.badRequest('Session ID or authentication required');
    }

    const variant: any = await strapi.db.query('api::variant.variant').findOne({
      where: { id: variantId },
      populate: ['product', 'inventory', 'prices'],
    });

    if (!variant) {
      return ctx.notFound('Variant not found');
    }

    const stockAvailable = variant.inventory?.quantity ?? 0;
    if (stockAvailable < quantity) {
      return ctx.badRequest(`Insufficient stock. Only ${stockAvailable} available.`);
    }

    const priceRecord = variant.prices?.find((p: any) => p.currency === currency) || variant.prices?.[0];
    const unitPrice = priceRecord ? priceRecord.amount : (variant.priceOverride || 0);

    const where: any = user ? { user: user.id } : { sessionId };
    let cart: any = await strapi.db.query('api::cart.cart').findOne({
      where,
      populate: {
        items: {
          populate: ['variant'],
        },
      },
    });

    if (!cart) {
      cart = await strapi.entityService.create('api::cart.cart' as any, {
        data: {
          sessionId: user ? null : sessionId,
          user: user ? user.id : null,
          currency,
          items: [],
          lastActiveAt: new Date(),
        } as any,
      });
      cart.items = [];
    }

    const existingItems = cart.items || [];
    const existingIndex = existingItems.findIndex((item: any) => (item.variant?.id || item.variant) === Number(variantId));

    let updatedItems = [...existingItems];
    const imageUrl = variant.image || (variant.product?.images?.[0]?.url || variant.product?.images?.[0] || '');

    if (existingIndex > -1) {
      const newQty = existingItems[existingIndex].quantity + quantity;
      if (newQty > stockAvailable) {
        return ctx.badRequest(`Cannot add ${quantity} more. Stock limit of ${stockAvailable} reached.`);
      }
      updatedItems[existingIndex] = {
        ...existingItems[existingIndex],
        quantity: newQty,
        unitPrice,
        currency,
      };
    } else {
      updatedItems.push({
        variant: variant.id,
        quantity,
        unitPrice,
        currency,
        productName: variant.product?.name || 'Product',
        variantTitle: variant.title,
        sku: variant.sku,
        imageUrl: typeof imageUrl === 'string' ? imageUrl : (imageUrl?.url || ''),
      });
    }

    await strapi.entityService.update('api::cart.cart' as any, cart.id, {
      data: {
        items: updatedItems.map((it: any) => ({
          variant: it.variant?.id || it.variant,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          currency: it.currency || currency,
          productName: it.productName,
          variantTitle: it.variantTitle,
          sku: it.sku,
          imageUrl: it.imageUrl,
        })),
        lastActiveAt: new Date(),
        currency,
      } as any,
    });

    return this.getCart(ctx);
  },

  async updateItem(ctx: any) {
    const user = ctx.state.user;
    const sessionId = ctx.request.headers['x-session-id'] || ctx.request.body.sessionId;
    const { itemId } = ctx.params;
    const { quantity } = ctx.request.body;

    if (!user && !sessionId) {
      return ctx.badRequest('Session ID or authentication required');
    }

    const where: any = user ? { user: user.id } : { sessionId };
    const cart: any = await strapi.db.query('api::cart.cart').findOne({
      where,
      populate: {
        items: {
          populate: {
            variant: {
              populate: ['inventory'],
            },
          },
        },
      },
    });

    if (!cart) {
      return ctx.notFound('Cart not found');
    }

    let items = cart.items || [];
    const itemIndex = items.findIndex((it: any) => String(it.id) === String(itemId));

    if (itemIndex === -1) {
      return ctx.notFound('Item not found in cart');
    }

    if (quantity <= 0) {
      items.splice(itemIndex, 1);
    } else {
      const targetItem = items[itemIndex];
      const stock = targetItem.variant?.inventory?.quantity ?? 999;
      if (quantity > stock) {
        return ctx.badRequest(`Requested quantity exceeds available stock (${stock}).`);
      }
      items[itemIndex].quantity = quantity;
    }

    await strapi.entityService.update('api::cart.cart' as any, cart.id, {
      data: {
        items: items.map((it: any) => ({
          variant: it.variant?.id || it.variant,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          currency: it.currency,
          productName: it.productName,
          variantTitle: it.variantTitle,
          sku: it.sku,
          imageUrl: it.imageUrl,
        })),
        lastActiveAt: new Date(),
      } as any,
    });

    return this.getCart(ctx);
  },

  async removeItem(ctx: any) {
    const user = ctx.state.user;
    const sessionId = ctx.request.headers['x-session-id'] || ctx.query.sessionId;
    const { itemId } = ctx.params;

    if (!user && !sessionId) {
      return ctx.badRequest('Session ID or authentication required');
    }

    const where: any = user ? { user: user.id } : { sessionId };
    const cart: any = await strapi.db.query('api::cart.cart').findOne({
      where,
      populate: ['items'],
    });

    if (!cart) {
      return ctx.notFound('Cart not found');
    }

    const items = (cart.items || []).filter((it: any) => String(it.id) !== String(itemId));

    await strapi.entityService.update('api::cart.cart' as any, cart.id, {
      data: {
        items: items.map((it: any) => ({
          variant: it.variant?.id || it.variant,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          currency: it.currency,
          productName: it.productName,
          variantTitle: it.variantTitle,
          sku: it.sku,
          imageUrl: it.imageUrl,
        })),
        lastActiveAt: new Date(),
      } as any,
    });

    return this.getCart(ctx);
  },

  async mergeCart(ctx: any) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('Authentication required to merge cart');
    }

    const { guestSessionId } = ctx.request.body;
    if (!guestSessionId) {
      return ctx.badRequest('guestSessionId is required');
    }

    const guestCart: any = await strapi.db.query('api::cart.cart').findOne({
      where: { sessionId: guestSessionId },
      populate: {
        items: {
          populate: ['variant'],
        },
      },
    });

    if (!guestCart || !guestCart.items || guestCart.items.length === 0) {
      return this.getCart(ctx);
    }

    let userCart: any = await strapi.db.query('api::cart.cart').findOne({
      where: { user: user.id },
      populate: {
        items: {
          populate: ['variant'],
        },
      },
    });

    if (!userCart) {
      await strapi.entityService.update('api::cart.cart' as any, guestCart.id, {
        data: {
          user: user.id,
          sessionId: null,
          lastActiveAt: new Date(),
        } as any,
      });
      return this.getCart(ctx);
    }

    const combinedItems = [...(userCart.items || [])];

    for (const gItem of guestCart.items) {
      const gVariantId = gItem.variant?.id || gItem.variant;
      const existing = combinedItems.find((uItem) => (uItem.variant?.id || uItem.variant) === gVariantId);
      if (existing) {
        existing.quantity += gItem.quantity;
      } else {
        combinedItems.push(gItem);
      }
    }

    await strapi.entityService.update('api::cart.cart' as any, userCart.id, {
      data: {
        items: combinedItems.map((it: any) => ({
          variant: it.variant?.id || it.variant,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          currency: it.currency || userCart.currency,
          productName: it.productName,
          variantTitle: it.variantTitle,
          sku: it.sku,
          imageUrl: it.imageUrl,
        })),
        lastActiveAt: new Date(),
      } as any,
    });

    await strapi.entityService.delete('api::cart.cart' as any, guestCart.id);

    return this.getCart(ctx);
  },

  async clearCart(ctx: any) {
    const user = ctx.state.user;
    const sessionId = ctx.request.headers['x-session-id'] || ctx.query.sessionId;

    const where: any = user ? { user: user.id } : { sessionId };
    const cart: any = await strapi.db.query('api::cart.cart').findOne({ where });

    if (cart) {
      await strapi.entityService.update('api::cart.cart' as any, cart.id, {
        data: {
          items: [],
          lastActiveAt: new Date(),
        } as any,
      });
    }

    return { success: true };
  },
};
