export default {
  routes: [
    {
      method: 'GET',
      path: '/cart',
      handler: 'cart.getCart',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/cart/items',
      handler: 'cart.addItem',
      config: {
        auth: false,
      },
    },
    {
      method: 'PUT',
      path: '/cart/items/:itemId',
      handler: 'cart.updateItem',
      config: {
        auth: false,
      },
    },
    {
      method: 'DELETE',
      path: '/cart/items/:itemId',
      handler: 'cart.removeItem',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/cart/merge',
      handler: 'cart.mergeCart',
      config: {
        auth: false,
      },
    },
    {
      method: 'DELETE',
      path: '/cart',
      handler: 'cart.clearCart',
      config: {
        auth: false,
      },
    },
  ],
};
