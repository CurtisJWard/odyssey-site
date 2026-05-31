// Lot inventory live data proxy.
//
// Fetches the master Google Sheet via the Apps Script web app and returns
// clean JSON to the website. Caches at the Cloudflare edge for 5 minutes
// so Apps Script quota usage stays minimal even under load.
//
// The website's /available-lots/, /available-lots/[slug]/, and
// /quick-move-ins/ pages fetch this endpoint client-side on page load to
// replace static fallback data with the live sheet state.
//
// Apps Script endpoint URL is stored in env var so it can be rotated
// without code changes. Falls back to a hardcoded default for local dev.

interface Env {
  LOT_INVENTORY_URL?: string;
}

const DEFAULT_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbyCBOgU6SyWUAgerb-_2iT9gOJmwgdR4-vRmahXMTIjgfchH7tzCJ1ufNLkVkovjwYnYQ/exec?api=lot-inventory';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = context.env.LOT_INVENTORY_URL || DEFAULT_APPS_SCRIPT_URL;

  try {
    const upstream = await fetch(url, {
      // Cloudflare-level caching: 5 minutes at the edge
      cf: { cacheTtl: 300, cacheEverything: true },
    } as RequestInit);

    if (!upstream.ok) {
      return jsonResponse(
        { error: `Upstream returned ${upstream.status}`, syncedAt: new Date().toISOString(), lots: [] },
        upstream.status === 401 || upstream.status === 403 ? 502 : 502
      );
    }

    const data = await upstream.json();
    // Pass through, but ensure cache headers + CORS
    return jsonResponse(data, 200);
  } catch (err) {
    console.error('Lot inventory proxy error:', err);
    return jsonResponse(
      { error: 'Upstream fetch failed', syncedAt: new Date().toISOString(), lots: [] },
      502
    );
  }
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      // Allow client-side fetch from any subdomain on the site
      'Access-Control-Allow-Origin': '*',
      // Cache at the edge for 5 min, browsers for 1 min
      'Cache-Control': 'public, max-age=60, s-maxage=300',
    },
  });
}
