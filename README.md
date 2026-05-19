# odyssey-site

buildodyssey.com — Astro static site, hosted on Cloudflare Pages.

## Stack

- Astro 6 + Tailwind CSS 4
- Cloudflare Pages (static) + Pages Functions (contact form via Resend)
- DNS on Cloudflare (account `14177184a4d40bc57187721d6ff16a21`)

## Local dev

```bash
npm install
npm run dev          # http://localhost:4321
```

## Deploy

```bash
npm run deploy       # build + wrangler pages deploy dist
```

First deploy lands on `odyssey-site.pages.dev`. Preview subdomain is `preview.buildodyssey.com`. Apex `buildodyssey.com` cuts over after Curtis sign-off.

## Updating content

Most updates are data edits in `src/data/`:

- `plans.ts` — floor plans (specs, copy, images)
- `communities.ts` — communities (name, status, copy)
- `team.ts` — meet-the-team roster
- `interestRate.ts` — homepage rate display

For page-level copy edits, find the `.astro` file under `src/pages/`.

## Form handling

`functions/api/contact.ts` posts to Resend. Secrets in Cloudflare Pages dashboard:

- `RESEND_API_KEY` (secret)
- `FORM_RECIPIENTS` (env var, defaults to `office@buildodyssey.com`)
- `FORM_FROM` (env var, defaults to `noreply@buildodyssey.com`)
