---
name: deploy-odyssey-site
description: Build and deploy the Odyssey Homes website (buildodyssey.com) to Cloudflare Pages. Use this whenever Curtis (or a future maintainer) makes changes to /src/, /public/, or /functions/ and wants those changes live on preview.buildodyssey.com or the apex domain. Covers both the build command, the wrangler deploy command, troubleshooting the most common failure modes, and rolling back if a deploy breaks production.
---

# Deploy Odyssey Site

Build the Astro site to static HTML, then push the build output to Cloudflare Pages. Two commands. Five minutes end-to-end.

## When to use

- Curtis says "deploy the site", "push that live", "publish", or "update prod"
- After editing any file in `src/`, `public/`, `functions/`, `astro.config.mjs`, or `tailwind.config.mjs`
- After updating a data file (`src/data/plans.ts`, `communities.ts`, `lots.ts`, `specHomes.ts`)
- After updating any plat map PDF, image, or other asset in `public/`

**NOT for:** Apps Script changes (those use `clasp push` separately — see the `apps-script-ops` skill).

## The two commands

From the repo root (`/Users/buildguardian/Code/odyssey-site/`):

```bash
npm run build
```

If that succeeds, then:

```bash
CLOUDFLARE_API_TOKEN=$(cat ~/.cloudflare-token) \
CLOUDFLARE_ACCOUNT_ID=14177184a4d40bc57187721d6ff16a21 \
npx wrangler pages deploy dist --project-name=odyssey-site --branch=main --commit-dirty=true
```

The deploy command prints a preview URL (e.g., `https://abc12345.odyssey-site-305.pages.dev`) when it finishes. That URL is unique to that deployment.

**Live URLs after a successful deploy:**
- `preview.buildodyssey.com` — Curtis-facing review URL (stable, always points to latest deploy)
- `buildodyssey.com` — apex (post-cutover; currently still on the old Umbraco site)
- `https://<deployment-hash>.odyssey-site-305.pages.dev` — direct deployment URL (each deploy gets a fresh one)

## Why two separate commands

`npm run build` runs Astro's build, producing static HTML, optimized images, and a Pages Functions bundle in `dist/`. It's local-only — nothing goes online.

`wrangler pages deploy` uploads `dist/` to Cloudflare's edge. Wrangler diffs against the previous deploy and only uploads changed files, so subsequent deploys are fast.

Keeping them separate lets you build, inspect `dist/` locally if you want, and only deploy when you're sure.

## Common failure modes

### Build fails with a TypeScript error

Usually means a data file is malformed. Look at the error path. Common culprits:
- `src/data/plans.ts` — a plan object missing a required field (`name`, `slug`, `sqFt`)
- `src/data/communities.ts` — a community missing `slug` or `name`
- `src/data/lots.ts` — a lot referencing a `communitySlug` that doesn't exist in communities.ts

Fix the file, re-run `npm run build`.

### Build fails with a Vite/Tailwind error

Almost always means a CSS class typo. Look for the file the error points at. Tailwind v4 errors helpfully name the offending class.

### Deploy fails: "Project not found"

The project name is `odyssey-site`, not `odyssey-site-305`. The `-305` is part of the auto-generated `*.pages.dev` URL, not the project name. Double-check the `--project-name=` flag.

### Deploy fails: "Authentication error"

The Cloudflare API token at `~/.cloudflare-token` has expired or been rotated. Curtis can issue a fresh token at https://dash.cloudflare.com/profile/api-tokens. Token needs `Cloudflare Pages: Edit` permission on the account.

### Deploy succeeds but the page still shows old content

Cloudflare's edge cache holds pages for a few minutes. Either:
- Wait 1-2 minutes
- Hard refresh (Cmd+Shift+R in browser)
- Add `?v=2` to the URL to bust the cache

If still stale after 5 minutes, check the deployment URL directly (`https://<hash>.odyssey-site-305.pages.dev`) — that bypasses the custom domain cache.

## Rolling back

Cloudflare Pages keeps every prior deployment. To roll back to a previous version without re-deploying old code:

1. Go to https://dash.cloudflare.com/14177184a4d40bc57187721d6ff16a21/pages/view/odyssey-site/deployments
2. Find a previous successful deployment
3. Click the menu → "Rollback to this deployment"

That's instant. The custom domains (`preview.buildodyssey.com`, eventually `buildodyssey.com`) immediately serve the rolled-back version.

## What gets deployed

`dist/` contains:
- All static HTML (one file per route)
- Optimized images (WebP variants)
- CSS bundle
- JS bundle (small — most pages ship zero JS)
- `functions/` bundle for Pages Functions (the `/api/*` endpoints)
- `_redirects` file (if present)

Anything not in `dist/` doesn't go live. Source files (`src/`, `public/`, `functions/`) are NOT directly served — only the built output.

## After a successful deploy — quick sanity check

Hit these in the browser:
- `https://preview.buildodyssey.com/` (homepage loads)
- `https://preview.buildodyssey.com/estimate/` (the most-changed page)
- `https://preview.buildodyssey.com/available-lots/` (data-driven, catches data file issues)

If any 404s, look at the Astro build output — it lists every generated page. If a page you expected isn't there, the route or data file is broken.

## Cost / account

Cloudflare Pages free tier:
- Unlimited bandwidth
- 500 builds/month (we're nowhere near)
- Unlimited requests
- 100k Workers/Pages Functions requests per day

Zero monthly cost for hosting. The only website-related recurring spend is **Resend Pro ($20/mo)** for transactional email.

---

## Updating this skill

When the deploy process changes (new env var, different command, account migration), update this file. Anyone inheriting the site will rely on it.
