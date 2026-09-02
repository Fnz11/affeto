import { factories } from '@strapi/strapi';
export default factories.createCoreController('api::address.address', ({ strapi }) => ({
  async find(ctx: any) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('Authentication required');
    }
    const data = await strapi.entityService.findMany('api::address.address' as any, {
      filters: { user: user.id },
      sort: { isDefault: 'desc', createdAt: 'desc' },
    });
    return { data };
  },
  async create(ctx: any) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('Authentication required');
    }
    const body = ctx.request.body?.data || ctx.request.body;
    if (body.isDefault) {
      const existing: any = await strapi.entityService.findMany('api::address.address' as any, {
        filters: { user: user.id, isDefault: true },
      });
      for (const addr of existing) {
        await strapi.entityService.update('api::address.address' as any, addr.id, {
          data: { isDefault: false } as any,
        });
      }
    }
    const entry = await strapi.entityService.create('api::address.address' as any, {
      data: { ...body, user: user.id } as any,
    });
    return { data: entry };
  }
}));
