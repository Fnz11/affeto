export default {
  routes: [
    {
      method: 'POST',
      path: '/checkout/session',
      handler: 'checkout.createCheckoutSession',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/checkout/confirm-mock',
      handler: 'checkout.confirmMockOrder',
      config: {
        auth: false,
      },
    },
  ],
};
