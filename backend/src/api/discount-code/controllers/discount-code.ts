export default {
  async validate(ctx: any) {
    const { code, subtotal = 0 } = ctx.request.body;
    if (!code) {
      return ctx.badRequest('Discount code required');
    }
    const codes = await strapi.entityService.findMany('api::discount-code.discount-code', {
      filters: {
        code: code.trim().toUpperCase(),
        isActive: true,
      },
    });
    if (!codes || codes.length === 0) {
      return ctx.badRequest('Invalid or expired discount code');
    }
    const discount = codes[0];
    if (discount.expiresAt && new Date(discount.expiresAt) < new Date()) {
      return ctx.badRequest('Discount code has expired');
    }
    if (discount.maxUses && discount.currentUses >= discount.maxUses) {
      return ctx.badRequest('Discount code usage limit reached');
    }
    if (subtotal < (discount.minOrderAmount || 0)) {
      return ctx.badRequest(`Minimum order of $${((discount.minOrderAmount || 0) / 100).toFixed(2)} required`);
    }

    let discountAmount = 0;
    if (discount.discountType === 'percent') {
      discountAmount = Math.round((subtotal * discount.value) / 100);
    } else {
      discountAmount = discount.value;
    }

    return {
      valid: true,
      code: discount.code,
      discountType: discount.discountType,
      value: discount.value,
      discountAmount: Math.min(discountAmount, subtotal),
    };
  },
};
