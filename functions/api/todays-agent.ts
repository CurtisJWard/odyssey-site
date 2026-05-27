// Returns today's on-call New Construction Specialist for the /estimate page.
//
// Acts as a thin proxy to a Google Apps Script web app (`TODAYS_AGENT_URL`) so
// the calendar can stay private. Caches responses for 1 hour to keep Apps Script
// quota usage low.
//
// If the env var isn't set or the upstream fails, returns `{ available: false }`
// and the /estimate page silently keeps its fallback copy.
//
// Expected JSON shape from Apps Script endpoint:
//   { firstName: string, name: string, phone: string, phoneHref?: string, email?: string, photo?: string }

interface Env {
  TODAYS_AGENT_URL?: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = context.env.TODAYS_AGENT_URL;
  if (!url) {
    return jsonResponse({ available: false, reason: 'Endpoint not configured' });
  }

  // Edge cache, keyed per 5-minute bucket. Only SUCCESS responses are cached —
  // failures are retried on every request so a transient upstream issue doesn't
  // get pinned. 5-min granularity means calendar edits reflect on the live site
  // within 5 minutes max. Bumped cache version to bust any old stale entries.
  const now = new Date();
  const fiveMinBucket = Math.floor(now.getMinutes() / 5) * 5;
  const bucketStr = `${now.toISOString().slice(0, 13)}-${String(fiveMinBucket).padStart(2, '0')}`;
  const cacheKey = new Request(
    `https://internal.cache/todays-agent?v=4&d=${bucketStr}`,
    { method: 'GET' }
  );
  // @ts-ignore — caches.default exists in Cloudflare Workers runtime
  const cache = caches.default;
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  try {
    const upstream = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    if (!upstream.ok) {
      return jsonResponse({ available: false, reason: `Upstream ${upstream.status}` });
    }
    const data = await upstream.json() as Record<string, unknown>;
    // Pass through everything from upstream as-is. The endpoint already
    // returns `available: true|false` and the full agent payload on success.
    const response = jsonResponse(data);
    // Only cache real success (available: true). Failures stay un-cached.
    if (data && data.available === true) {
      await cache.put(cacheKey, response.clone());
    }
    return response;
  } catch (err) {
    console.error('todays-agent upstream error:', err);
    return jsonResponse({ available: false, reason: 'Upstream error' });
  }
};

function jsonResponse(body: object) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300', // 5 min browser cache
    },
  });
}
