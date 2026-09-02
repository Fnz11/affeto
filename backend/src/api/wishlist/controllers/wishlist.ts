export default {
  async getWishlist(ctx: any) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('Authentication required');
    }

    let wishlist: any = await strapi.db.query('api::wishlist.wishlist').findOne({
      where: { user: user.id },
      populate: {
        products: {
          populate: {
            variants: {
              populate: ['prices', 'inventory'],
            },
            category: true,
          },
        },
      },
    });

    if (!wishlist) {
      wishlist = await strapi.entityService.create('api::wishlist.wishlist' as any, {
        data: {
          user: user.id,
          products: [],
        } as any,
      });
      wishlist.products = [];
    }

    return { data: wishlist };
  },

  async toggleWishlist(ctx: any) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('Authentication required');
    }

    const { productId } = ctx.request.body;
    if (!productId) {
      return ctx.badRequest('productId is required');
    }

    let wishlist: any = await strapi.db.query('api::wishlist.wishlist').findOne({
      where: { user: user.id },
      populate: ['products'],
    });

    if (!wishlist) {
      wishlist = await strapi.entityService.create('api::wishlist.wishlist' as any, {
        data: {
          user: user.id,
          products: [productId],
        } as any,
      });
      return { inWishlist: true, wishlistId: wishlist.id };
    }

    const currentProductIds: number[] = (wishlist.products || []).map((p: any) => p.id);
    const numericProductId = Number(productId);
    const exists = currentProductIds.includes(numericProductId);

    let updatedProductIds: number[];
    if (exists) {
      updatedProductIds = currentProductIds.filter((id) => id !== numericProductId);
    } else {
      updatedProductIds = [...currentProductIds, numericProductId];
    }

    const updated = await strapi.entityService.update('api::wishlist.wishlist' as any, wishlist.id, {
      data: {
        products: updatedProductIds,
      } as any,
    });

    return {
      inWishlist: !exists,
      wishlist: updated,
    };
  },
};
