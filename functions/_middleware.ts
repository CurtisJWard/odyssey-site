// Pre-launch SEO lockdown — hostname-aware noindex header.
//
// Adds X-Robots-Tag: noindex,nofollow to every response UNLESS the request
// is hitting the eventual production hostnames (buildodyssey.com /
// www.buildodyssey.com). This is the safety net for the static lockdown
// (public/robots.txt + meta tag in Layout.astro) — even if those don't get
// removed at DNS cutover, the apex domain itself stays crawlable because
// the middleware never adds the header for it.
//
// AFTER DNS CUTOVER, you can optionally delete this middleware too, but
// leaving it in place is harmless (it just adds belt-and-suspenders for the
// preview subdomain).

const INDEXABLE_HOSTS = new Set([
  'buildodyssey.com',
  'www.buildodyssey.com',
]);

export const onRequest: PagesFunction = async (context) => {
  const response = await context.next();
  const hostname = new URL(context.request.url).hostname.toLowerCase();
  if (!INDEXABLE_HOSTS.has(hostname)) {
    const headers = new Headers(response.headers);
    headers.set('X-Robots-Tag', 'noindex,nofollow');
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }
  return response;
};
