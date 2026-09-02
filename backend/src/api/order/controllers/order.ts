export default {
  async findMyOrders(ctx: any) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('Authentication required');
    }

    const orders = await strapi.entityService.findMany('api::order.order', {
      filters: { user: user.id },
      sort: { createdAt: 'desc' },
      populate: ['items', 'shippingAddress'],
    });

    return { data: orders };
  },

  async findByOrderNumber(ctx: any) {
    const { orderNumber } = ctx.params;
    const user = ctx.state.user;
    const { email } = ctx.query;

    const orders = await strapi.entityService.findMany('api::order.order', {
      filters: { orderNumber },
      populate: ['items', 'shippingAddress', 'user'],
    });

    if (!orders || orders.length === 0) {
      return ctx.notFound('Order not found');
    }

    const order = orders[0];

    // Security check: if order belongs to a user, caller must either be that user or provide matching email
    if (order.user && user && order.user.id !== user.id) {
      return ctx.unauthorized('Access denied to this order');
    }

    if (!user && email && order.customerEmail.toLowerCase() !== (email as string).toLowerCase()) {
      return ctx.unauthorized('Invalid email verification for this order');
    }

    return { data: order };
  },
};
