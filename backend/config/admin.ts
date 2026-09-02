export default ({ env }: { env: any }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'adminjwtsecretdefault1234567890'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', 'apitokensaltdefault1234567890'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT', 'transfertokensaltdefault1234567890'),
    },
  },
  flags: {
    nps: false,
    promoteEE: false,
  },
});
