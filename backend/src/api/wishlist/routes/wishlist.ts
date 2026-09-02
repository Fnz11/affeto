export default {
  routes: [
    {
      method: 'GET',
      path: '/wishlist',
      handler: 'wishlist.getWishlist',
      config: {
        auth: {},
      },
    },
    {
      method: 'POST',
      path: '/wishlist/toggle',
      handler: 'wishlist.toggleWishlist',
      config: {
        auth: {},
      },
    },
  ],
};
