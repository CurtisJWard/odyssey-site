---
name: update-floor-plan
description: Add, edit, or remove a floor plan on the Odyssey Homes website. Use this when Curtis asks to "add the Cedar plan", "update Aria's pricing", "swap in the new Charleston rendering", "drop the Willow plan", or any similar request involving the semi-custom floor plans. Covers the data file schema, image asset locations, the standard features structure, garage options, and what happens when a plan is referenced by an active spec home or lot.
---

# Update Floor Plan

Everything about the semi-custom floor plans lives in `src/data/plans.ts`. One file. Add a new plan = add an entry to the array. Edit a plan = edit the entry. Remove a plan = remove the entry (but check for references first).

The per-plan pages at `/semi-custom-home-floor-plans/<slug>/` are auto-generated from this file via `[slug].astro`. No need to create new page files when adding a plan.

## Data file: `src/data/plans.ts`

### Plan object schema

```typescript
{
  slug: 'aria',                          // URL slug, lowercase, hyphenated
  name: 'Aria',                          // Display name
  status: 'live',                        // 'live' | 'coming-soon'
  sqFt: { main: 1842, basement: 0, garage: 720 },  // Square footage breakdown
  bedrooms: 3,
  bathrooms: 2.5,
  garage: '3-car',                       // STANDARD garage size
  garageOption: '2-car alternative available — saves on cost',  // Optional alt
  startingPrice: 425000,                 // Starting price for the base configuration
  exterior: 'craftsman',                 // Visual style — used for filtering/grouping
  rendering: '/media/renderings/aria-craftsman-exterior.jpg',
  floorPlan: '/media/floor-plans/aria-main-floor.jpg',
  description: 'A single-level...',      // 1-2 sentence card description
  longDescription: 'Aria is...',         // Multi-paragraph copy for the detail page
  highlights: [                          // 3-6 bullets for the detail page
    { title: '...', body: '...' },
    ...
  ],
}
```

### Status field

- `'live'` — plan is published, shows up in the index and has a working detail page
- `'coming-soon'` — plan is in the index but the detail page shows a "Coming Soon" placeholder. Use this when Curtis wants to tease a plan before the renderings/floor plan images are ready.

### Standard features

Every plan inherits from the `STANDARD_FEATURES` constant at the top of `plans.ts` (15 items: open floor plan, walk-in pantry, energy-efficient HVAC, etc.). Plans don't list these individually — they're rendered automatically on every plan page.

If Curtis wants to update the standard features list, edit the `STANDARD_FEATURES` array — change propagates to every plan.

### Garage convention

**3-car garage is the standard** for most plans. The `garage` field should say `'3-car'`. If Curtis offers a 2-car alternative (downgrade for cost savings), set `garageOption` to something like `'2-car alternative available — saves on cost'`.

Do NOT phrase the 3-car as an "upgrade" — that's the wrong direction (it's the default).

## Image assets

| Asset | Location | Aspect | Typical filename |
|---|---|---|---|
| Exterior rendering | `public/media/renderings/` | 16:9 or 3:2 | `aria-craftsman-exterior.jpg` |
| Floor plan diagram | `public/media/floor-plans/` | Native (often 4:3 or 3:2) | `aria-main-floor.jpg` |

Reference paths in `plans.ts` are absolute from the public root (`/media/...`), not relative.

When the drafter sends a new rendering, save it to `public/media/renderings/` with a slug-prefixed filename (`<plan-slug>-<exterior-style>-exterior.jpg`).

## Common operations

### Add a new plan

1. Confirm with Curtis: name, slug, sqFt breakdown, bedrooms, bathrooms, garage, starting price, exterior style, description, highlights
2. Get the rendering + floor plan files; save to `public/media/renderings/` and `public/media/floor-plans/`
3. Add a new object to the `plans` array in `src/data/plans.ts` matching the schema above
4. If renderings aren't ready yet, set `status: 'coming-soon'` and use a placeholder image (or leave the rendering field with a TBD path)
5. Run `npm run build` to verify the page generates
6. Deploy via the `deploy-odyssey-site` skill

### Edit an existing plan

Find the plan in the array, edit the field, build, deploy. That's it.

Common edits:
- `startingPrice` — when pricing updates
- `rendering` — when the drafter sends a new exterior
- `description` / `longDescription` / `highlights` — when marketing copy refines
- `status` — promote a plan from `'coming-soon'` to `'live'` once renderings land

### Remove a plan

**Before removing, check for references:**

```bash
grep -r "<plan-slug>" /Users/buildguardian/Code/odyssey-site/src/
```

If the plan is referenced by an active spec home (`src/data/specHomes.ts` or `_generatedSpecs.ts`) or a lot's `fitsPlanSlugs` array (`lots.ts`), you'll see those references. Resolve them first:

- Spec home referencing a removed plan → either update the spec to a different plan, or remove the spec
- Lot's `fitsPlanSlugs` referencing a removed plan → remove that slug from the array

THEN remove the plan entry from `plans.ts`. Build + deploy.

## Naming + slugging conventions

- Slugs are lowercase, hyphenated, single-word-preferred (`aria`, `charleston`, `oak-haven`).
- Slugs should match the plan family name, not a variant (e.g., `aria` not `aria-craftsman` even if you have a craftsman rendering).
- Once a plan is live, **don't change its slug** — that breaks bookmarks, breaks SEO, breaks links on social media. If you must rename, set up a redirect in `public/_redirects`.

## Pricing convention

`startingPrice` is the BASE price for the standard plan with:
- 3-car garage (standard)
- No basement finishes
- Standard exterior style
- All standard features included

It does NOT include:
- Lot cost
- Upgrades (cabinets, flooring, electrical tiers, etc.)
- Basement finishing
- Custom modifications

The Cost Summary tool (in the Apps Script) handles all the add-ons; the website just shows the starting figure.

---

## Updating this skill

When the schema in `plans.ts` changes (new required field, new convention), or when the standard features list shifts, update this file. New developers will land here first when asked to touch a plan.
