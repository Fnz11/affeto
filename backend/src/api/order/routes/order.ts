export default {
  routes: [
    {
      method: 'GET',
      path: '/orders',
      handler: 'order.findMyOrders',
      config: {
        auth: {},
      },
    },
    {
      method: 'GET',
      path: '/orders/:orderNumber',
      handler: 'order.findByOrderNumber',
      config: {
        auth: false,
      },
    },
  ],
};
