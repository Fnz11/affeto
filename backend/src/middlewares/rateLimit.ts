import type { Core } from '@strapi/strapi';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const requests = new Map<string, RateLimitRecord>();

export default (config: any, { strapi }: { strapi: Core.Strapi }) => {
  return async (ctx: any, next: () => Promise<void>) => {
    // Only apply rate limiting to sensitive routes: /api/cart and /api/checkout
    const path = ctx.request.path;
    const isSensitive = path.startsWith('/api/cart') || path.startsWith('/api/checkout');

    if (!isSensitive) {
      return next();
    }

    const ip = ctx.request.ip || ctx.ip || ctx.headers['x-forwarded-for'] || 'unknown';
    const now = Date.now();
    const windowMs = config?.windowMs || 60 * 1000; // 1 minute
    const maxRequests = config?.max || 100; // 100 requests per minute per IP

    let record = requests.get(ip);
    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      requests.set(ip, record);
    } else {
      record.count += 1;
    }

    // Cleanup periodically if map gets large
    if (requests.size > 10000) {
      for (const [key, val] of requests.entries()) {
        if (now > val.resetTime) {
          requests.delete(key);
        }
      }
    }

    if (record.count > maxRequests) {
      ctx.status = 429;
      ctx.body = {
        error: {
          status: 429,
          name: 'TooManyRequests',
          message: 'Too many requests on commerce endpoints. Please slow down and try again.',
        },
      };
      return;
    }

    return next();
  };
};
