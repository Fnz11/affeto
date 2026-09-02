export default {
  register(/*{ strapi }*/) {},

  async bootstrap({ strapi }: { strapi: any }) {
    try {
      // Configure Users & Permissions for Public & Authenticated roles
      const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'public' },
      });

      const authenticatedRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'authenticated' },
      });

      if (publicRole) {
        const publicPermissions = [
          'api::category.category.find',
          'api::category.category.findOne',
          'api::product.product.find',
          'api::product.product.findOne',
          'api::variant.variant.find',
          'api::variant.variant.findOne',
          'api::price.price.find',
          'api::price.price.findOne',
          'api::inventory.inventory.find',
          'api::inventory.inventory.findOne',
          'api::cart.cart.getCart',
          'api::cart.cart.addItem',
          'api::cart.cart.updateItem',
          'api::cart.cart.removeItem',
          'api::cart.cart.mergeCart',
          'api::cart.cart.clearCart',
          'api::checkout.checkout.createCheckoutSession',
          'api::checkout.checkout.confirmMockOrder',
          'api::webhook.webhook.handleStripe',
          'api::order.order.findByOrderNumber',
          'api::discount-code.discount-code.validate',
        ];

        for (const perm of publicPermissions) {
          const [api, controller, action] = perm.split('.');
          const existing = await strapi.db.query('plugin::users-permissions.permission').findOne({
            where: {
              role: publicRole.id,
              action: `${api}.${controller}.${action}`,
            },
          });
          if (!existing) {
            await strapi.db.query('plugin::users-permissions.permission').create({
              data: {
                role: publicRole.id,
                action: `${api}.${controller}.${action}`,
              },
            });
          }
        }
      }

      if (authenticatedRole) {
        const authPermissions = [
          'api::order.order.findMyOrders',
          'api::address.address.find',
          'api::address.address.findOne',
          'api::address.address.create',
          'api::address.address.update',
          'api::address.address.delete',
          'api::wishlist.wishlist.getWishlist',
          'api::wishlist.wishlist.toggleWishlist',
        ];

        for (const perm of authPermissions) {
          const [api, controller, action] = perm.split('.');
          const existing = await strapi.db.query('plugin::users-permissions.permission').findOne({
            where: {
              role: authenticatedRole.id,
              action: `${api}.${controller}.${action}`,
            },
          });
          if (!existing) {
            await strapi.db.query('plugin::users-permissions.permission').create({
              data: {
                role: authenticatedRole.id,
                action: `${api}.${controller}.${action}`,
              },
            });
          }
        }
      }

      // Check if products exist, if not seed initial catalog
      const productCount = await strapi.db.query('api::product.product').count();
      if (productCount === 0) {
        strapi.log.info('Catalog is empty. Running database seed...');
        const { seedData } = await import('./seed');
        await seedData(strapi);
      }
    } catch (err: any) {
      strapi.log.error('Bootstrap error:', err);
    }
  },
};
