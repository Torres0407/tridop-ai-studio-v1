/// <reference types="@cloudflare/workers-types" />

import { handleTrafficCap } from './trafficCap';
import { handleCache } from './cache';

export interface Env {
  TRAFFIC_COUNTERS: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const domain = url.hostname;

    // In a real implementation, this would look up the siteId from the domain map
    const siteId = 'mock-site-id';

    // 1. Check traffic cap
    const isOverCap = await handleTrafficCap(siteId, env.TRAFFIC_COUNTERS);
    if (isOverCap) {
      return new Response('This site is experiencing high traffic.', { status: 429 });
    }

    // 2. Serve from cache or R2
    return handleCache(request, domain);
  }
};
