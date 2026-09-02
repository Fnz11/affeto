export default {
  routes: [
    {
      method: 'POST',
      path: '/discount-codes/validate',
      handler: 'discount-code.validate',
      config: {
        auth: false,
      },
    },
  ],
};
