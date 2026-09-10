export default {
  async afterCreate(event: any) {
    await triggerFrontendRebuild('product.create', event.result);
  },

  async afterUpdate(event: any) {
    await triggerFrontendRebuild('product.update', event.result);
  },

  async afterDelete(event: any) {
    await triggerFrontendRebuild('product.delete', event.result);
  },
};

async function triggerFrontendRebuild(event: string, record: any) {
  const frontendUrl = process.env.FRONTEND_INTERNAL_URL || process.env.FRONTEND_URL || 'http://localhost:4321';
  const token = process.env.REVALIDATE_SECRET || 'affeto-revalidate-secret-token';

  try {
    const res = await fetch(`${frontendUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-revalidate-token': token,
      },
      body: JSON.stringify({
        event,
        model: 'product',
        slug: record?.slug,
        timestamp: Date.now(),
      }),
    });
    if (res.ok) {
      strapi.log.info(`[REVALIDATE] Successfully signaled frontend revalidation for ${event}`);
    } else {
      strapi.log.warn(`[REVALIDATE] Frontend revalidation returned status ${res.status}`);
    }
  } catch (err: any) {
    strapi.log.warn(`[REVALIDATE] Could not notify frontend of content change: ${err.message}`);
  }
}
