import { factories } from '@strapi/strapi';
import type { Core } from '@strapi/strapi';

export default factories.createCoreController('api::address.address', ({ strapi }: { strapi: Core.Strapi }) => ({
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

  async findOne(ctx: any) {
    const user = ctx.state.user;
    const { id } = ctx.params;
    if (!user) {
      return ctx.unauthorized('Authentication required');
    }
    const address: any = await strapi.entityService.findOne('api::address.address' as any, id, {
      populate: ['user'],
    });
    if (!address || (address.user && address.user.id !== user.id)) {
      return ctx.notFound('Address not found');
    }
    return { data: address };
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
  },

  async update(ctx: any) {
    const user = ctx.state.user;
    const { id } = ctx.params;
    if (!user) {
      return ctx.unauthorized('Authentication required');
    }
    const existing: any = await strapi.entityService.findOne('api::address.address' as any, id, {
      populate: ['user'],
    });
    if (!existing || (existing.user && existing.user.id !== user.id)) {
      return ctx.notFound('Address not found');
    }
    const body = ctx.request.body?.data || ctx.request.body;
    if (body.isDefault) {
      const currentDefaults: any = await strapi.entityService.findMany('api::address.address' as any, {
        filters: { user: user.id, isDefault: true },
      });
      for (const addr of currentDefaults) {
        if (addr.id !== Number(id)) {
          await strapi.entityService.update('api::address.address' as any, addr.id, {
            data: { isDefault: false } as any,
          });
        }
      }
    }
    const updated = await strapi.entityService.update('api::address.address' as any, id, {
      data: { ...body, user: user.id } as any,
    });
    return { data: updated };
  },

  async delete(ctx: any) {
    const user = ctx.state.user;
    const { id } = ctx.params;
    if (!user) {
      return ctx.unauthorized('Authentication required');
    }
    const existing: any = await strapi.entityService.findOne('api::address.address' as any, id, {
      populate: ['user'],
    });
    if (!existing || (existing.user && existing.user.id !== user.id)) {
      return ctx.notFound('Address not found');
    }
    const deleted = await strapi.entityService.delete('api::address.address' as any, id);
    return { data: deleted };
  },
}));
