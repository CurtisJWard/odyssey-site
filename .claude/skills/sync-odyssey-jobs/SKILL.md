---
name: sync-odyssey-jobs
description: Sync the Odyssey Homes website's spec home and pipeline lot inventory from the master Job Progress Google Sheet. Use this whenever Curtis updates the Job Progress sheet (weekly), when he asks to "refresh the inventory" or "pull the latest from the sheet," or to set up the weekly schedule that keeps the website in sync automatically.
---

# Sync Odyssey Jobs

Pulls the master **Odyssey Homes Job Progress** Google Sheet, categorizes each row by business rules, and updates the website data files. Curtis edits one sheet — every page that shows lot/home availability stays in sync.

## What it does

1. Fetches the sheet at the public CSV URL (no auth — sheet is shared "Anyone with link → Viewer")
2. Parses every row
3. Categorizes per the rules below
4. Writes two auto-generated data files
5. Optionally builds and deploys

## Categorization rules

| Sheet row state | Website placement |
|---|---|
| `Homeowner = "Spec"` AND `Dig` date is **within 90 days** (or in the past) | **Quick Move-Ins** page (with price if listed in Address column; "Coming Soon" if not) |
| `Homeowner = "Spec"` AND `Dig` date is **>90 days in the future** | **Available Lots** page (lot committed but plan flexible) |
| `Homeowner` is any other name (e.g. "Burns", "Smith", "26 Parade") | **Removed entirely** (sold) |
| `Address` starts with "Future " (Future Spec / Future Pre-Sold Slot) | **Skipped** (internal planning slot) |
| `Subdivision` is not Granite Creek / Hawks Landing / Sand Creek Estates | **Skipped** (foreign community — see "Adding communities" below) |
| Plan name not in `src/data/plans.ts` | **Skipped + logged** so we notice |

**Price extraction**: trailing `$XXX,XXX` in the Address cell is read as the asking price for that spec.

## How to run

### One-off (after editing the sheet)

```bash
cd /Users/buildguardian/Code/odyssey-site
node scripts/sync-odyssey-jobs.mjs           # update data files only
node scripts/sync-odyssey-jobs.mjs --deploy  # update + build + deploy
```

The script prints a summary:

```
━━━ Sync summary ━━━
Today: 2026-05-26 · Threshold: 2026-08-24 (90 days)
  Quick Move-Ins (≤90d): 12
  Pipeline Lots (>90d):  12
  Skipped:
    Placeholder rows:      22
    Sold (homeowner set):  12
    Foreign subdivisions:  3 (The Parks, Moser Estates)
```

### As a Claude command

When Curtis says any of:
- "Refresh the spec inventory"
- "Pull the latest from the sheet"
- "Update the website from the job progress sheet"

…run this skill. Steps:

1. `cd /Users/buildguardian/Code/odyssey-site`
2. Run `node scripts/sync-odyssey-jobs.mjs --deploy`
3. Report the summary (number of specs / pipeline lots / skipped) and the deploy URL
4. Surface anything in the "Skipped — foreign subdivisions" or "Skipped — unknown plans" list so Curtis can decide if a community page or new plan needs to be added.

### Scheduled (weekly auto-sync)

Set up via Claude Code's `/schedule` command to run every Monday morning:

```
/schedule every monday at 7am run /sync-odyssey-jobs
```

The cloud schedule will execute the sync, deploy, and report results in your terminal next time you open it.

## Files this skill touches

**Generated (overwritten every run — never edit by hand):**
- `src/data/_generatedSpecs.ts` — specs that satisfy the ≤90-day rule
- `src/data/_generatedPipelineLots.ts` — specs that satisfy the >90-day rule

**Not touched (Curtis maintains manually):**
- `src/data/lots.ts` — `manualLots` array (raw lots from developer pricing PDFs)
- `src/data/specHomes.ts` — re-export layer + helpers
- `src/data/communities.ts` — community pages
- `src/data/plans.ts` — floor plan catalog

## Adding a new community

If Curtis starts building in a new subdivision (e.g., "Mountain View"), do **two** things:

1. Add the community to `src/data/communities.ts` (slug, name, description, etc.)
2. Add the mapping to `scripts/sync-odyssey-jobs.mjs`:
   ```js
   const COMMUNITY_SLUGS = {
     'Granite Creek':      'granite-creek',
     'Hawks Landing':      'hawks-landing',
     'Sandcreek Estates':  'sand-creek-estates',
     'Mountain View':      'mountain-view',  // ← new
   };
   ```

Then re-run the sync and specs in that subdivision will start appearing.

## Adding a new floor plan

If Curtis adds a new plan to the sheet (e.g., "Westgate"), do **two** things:

1. Add the plan to `src/data/plans.ts`
2. Add the slug mapping to `scripts/sync-odyssey-jobs.mjs`:
   ```js
   const PLAN_SLUGS = {
     // ...
     'Westgate': 'westgate',
   };
   ```

## Source of truth

- **Sheet**: `1tWrK9tvOyNCl5WcPUXNzYmHKU_1VEpD8A5yKiGk54Z8` (Odyssey Team Folder / Job Progress)
- **Sharing**: must be "Anyone with the link → Viewer" for the public CSV export to work
- **Last design discussion**: Curtis ↔ Claude 2026-05-26

## Troubleshooting

**"Sheet fetch failed: HTTP 401" or returns an HTML login page**
→ Sheet sharing got changed back to "Restricted." Open the sheet, click Share, set General access back to "Anyone with the link → Viewer."

**A spec that should appear isn't showing up**
→ Check the sync summary's "Skipped" section. Most common causes:
- Sheet has a typo in the plan name (e.g., "Whitepine" instead of "White Pine")
- Subdivision name has a typo (e.g., "Sand Creek Estates" vs "Sandcreek Estates" — both mapped, but new variants need to be added)
- Address doesn't have a proper street (sheet has "TBD" or "Future Spec")

**Want to verify what would be synced without overwriting files**
→ Currently the script always writes — there's no `--dry-run` flag yet. If you want one, add the flag to the script.

## Updating this skill

If you add new categorization rules, change the threshold, or expand the column parsing — update both the script (`scripts/sync-odyssey-jobs.mjs`) **and this SKILL.md** so the next person (or Claude) knows the current shape.
