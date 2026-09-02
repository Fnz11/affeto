export default {
  routes: [
    {
      method: 'POST',
      path: '/webhooks/stripe',
      handler: 'webhook.handleStripe',
      config: {
        auth: false,
      },
    },
  ],
};
