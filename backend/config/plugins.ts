export default ({ env }: { env: any }) => ({
  'users-permissions': {
    config: {
      jwtSecret: env('JWT_SECRET', 'userspermissionsjwtsecret1234567890'),
    },
  },
});
