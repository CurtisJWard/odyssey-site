---
name: apps-script-ops
description: Maintain the Google Apps Script backend that powers buildodyssey.com's /estimate tool, today's-on-call-agent widget, and live lot inventory API. Use this when Curtis asks to "update the rotation calendar logic", "fix the lot inventory sync", "redeploy the Apps Script", "add a new endpoint", "change which agents are in the rotation", or any similar request involving the backend script at ~/Odyssey-Code/upgrades-and-options/. Covers the dev workflow (clasp push/pull), the web app deployment cycle, the key functions, how the script talks to Google Sheets and Calendar, and the secret-handling gotchas.
---

# Apps Script Ops

The Apps Script project powers three things on buildodyssey.com:

1. **`/estimate` Upgrades & Options tool** — the gated calculator buyers + Realtors use to build their estimate. The Apps Script renders the HTML, handles login, reads sheet data, generates PDFs.
2. **`/api/todays-agent`** — returns who's on-call today (read from a rotation calendar) + showroom open/closed status. Powers the live widget on the homepage + `/estimate`.
3. **`/api/lot-inventory`** — returns the master lot inventory as clean JSON for the website to consume.

Code lives at `~/Odyssey-Code/upgrades-and-options/`. Managed locally via `clasp` (Google's CLI for Apps Script).

## Identity / locations

| Thing | Value |
|---|---|
| Script ID | `1qALJkhqZBEpiqY7MWCuh2iMh12m-S3OPqHTwwbcperplctMH9cZhkO0S` |
| Local repo | `~/Odyssey-Code/upgrades-and-options/` |
| Apps Script editor URL | https://script.google.com/d/1qALJkhqZBEpiqY7MWCuh2iMh12m-S3OPqHTwwbcperplctMH9cZhkO0S/edit |
| Deployed web app URL | https://script.google.com/macros/s/AKfycbyCBOgU6SyWUAgerb-_2iT9gOJmwgdR4-vRmahXMTIjgfchH7tzCJ1ufNLkVkovjwYnYQ/exec (deployed as `curtis@buildodyssey.com` on 2026-05-31 — see "Deploy identity" below) |
| Rotation calendar ID | `c_b9e33b242c27c5ae55d17297fe51a9c7f221be06cfb2d0db718a85732cbf7d42@group.calendar.google.com` |
| Lot Inventory sheet ID | `1ES3JjgZaqj_uEci3DdExDF-eC8eumDz0wrvb8avEB9g` |
| Job Progress sheet ID | `1tWrK9tvOyNCl5WcPUXNzYmHKU_1VEpD8A5yKiGk54Z8` |

## Dev workflow

### Pulling latest from the cloud

```bash
cd ~/Odyssey-Code/upgrades-and-options
npx -y @google/clasp pull
```

Use this when someone has edited the script directly in the Apps Script editor and you want to sync those changes locally before editing.

### Pushing local changes to the cloud

```bash
cd ~/Odyssey-Code/upgrades-and-options
npx -y @google/clasp push --force
```

The `--force` flag bypasses interactive prompts. Safe — `clasp push` won't delete anything that isn't tracked.

**This only updates the source files in the project.** It does NOT update the live `/exec` URL — for that, see "Deploying" below.

### Deploying (publishing a new version to the /exec URL)

After `clasp push`, the new code is in the cloud but the live deployment still serves the OLD version. To publish:

**Before clicking Deploy — check the account chip in the top-right of the Apps Script editor.** If it shows anything other than `curtis@buildodyssey.com`, switch accounts BEFORE deploying. See "Deploy identity (critical — burned us once)" below for why this matters.

1. Open the Apps Script editor (URL above)
2. **Verify the account chip in the top-right shows `Curtis Ward / curtis@buildodyssey.com`** — switch if not
3. Click **Deploy → Manage deployments**
4. Click the pencil icon next to the active deployment
5. Change **Version** to **New version**
6. ⚠️ **CRITICAL — verify access settings before clicking Deploy:**
   - **Execute as:** `Me (curtis@buildodyssey.com)`
   - **Who has access:** `Anyone` (the truly-public option — NOT "Anyone with Google account")
   - These dropdowns can silently flip back when you create a new version, especially with Workspace policy interference. We've been burned twice. Verify every time.
7. Click **Deploy**

The `/exec` URL stays the same. Old versions are archived (you can roll back from the same menu).

**Post-deploy smoke tests — ALWAYS run both:**

```bash
# 1. Today's-agent endpoint health (deploy identity / calendar access)
curl -s https://buildodyssey.com/api/todays-agent
```

If it returns `{"available":true,"firstName":"...","email":"..."}` — deploy is healthy.
If it returns `{"available":false,"reason":"calendar not accessible"}` — the deploy went out under the wrong identity. See "Deploy identity" below.

```bash
# 2. Configurator public-access check (Who has access flipped?)
cd ~/Odyssey-Code/upgrades-and-options && ./smoke-test-deploy.sh
```

Returns `✅ HEALTHY` if the configurator URL is publicly accessible to logged-out buyers, or `❌ FAILED` with concrete fix steps if "Who has access" flipped back to "Anyone with Google account" or "Only myself" during the deploy. The script lives in the Apps Script repo and the URL inside it is the one referenced by `~/Code/odyssey-site/src/pages/estimate/index.astro`.

**When is a redeploy required?**
- The `doGet` function changed (handles URL params, returns HTML or JSON)
- An endpoint behavior changed (e.g., `?api=todays-agent`)
- The HTML templates (`Index.html`, etc.) changed
- A secret/property changed (PropertiesService)

**When is a redeploy NOT required?**
- Functions only invoked from the Apps Script editor (like `syncJobsToLotInventory`) — they always run the latest code on the project. Redeployment is only about the WEB APP endpoint.

## The key functions

(Documented in detail at the top of `Code.js`.)

| Function | Purpose | When to run |
|---|---|---|
| `doGet(e)` | Entry point for the web app. Routes `?api=` requests to JSON, default to HTML render. | Auto, on every web app hit. |
| `getTodaysAgent_()` | Reads the rotation calendar, returns the on-call agent. | Auto, when `/api/todays-agent` is hit. |
| `getInventoryForWebsite_()` | Reads the master Lot Inventory sheet, returns clean JSON. | Auto, when `/api/lot-inventory` is hit. |
| `syncJobsToLotInventory()` | Pulls Job Progress → updates statuses + appends new rows. | Auto every Monday 6am (via trigger). Or manually after big job-progress changes. |
| `updateGraniteCreekDiv3Addresses()` | One-time backfill of GC Div 3 addresses from the recorded plat. | Manual, once. |
| `buildMasterLotInventory()` | Creates the master Lot Inventory sheet from scratch. | Manual, only when migrating to a new sheet. |
| `installWeeklyTrigger()` | Sets up the Monday 6am auto-sync trigger. | Run once after any deployment that changes triggers. |
| `applyStatusValidation()` | Adds a Status dropdown to the Lot Inventory sheet. | Manual, after building a fresh sheet. |
| `debugLotInventory()` | Dumps the sheet structure + sample rows for troubleshooting. | Manual, when something looks off. |
| `testLotInventoryApi()` | Logs the `/api/lot-inventory` payload locally. | Manual, when verifying the API. |

## How to invoke a function manually

From the Apps Script editor:

1. Open the editor (URL above)
2. In the function dropdown (top toolbar), select the function
3. Click **Run**
4. Check **View → Logs** for output

Functions ending in `_` are private (can't be called from the editor dropdown — they're helpers).

## Rotation calendar

Events on the calendar drive who's on call. Event titles must follow the convention:

| Title pattern | What it means |
|---|---|
| `Kaysha Work Model` | Kaysha is in the showroom, open during the event hours |
| `Susan On Call` | Susan handles phone/forms but the showroom is closed |
| `Gary Off-site` | Gary covers remotely (showroom closed) |
| `Kaysha Covering` | Same as On Call |
| `Anything else` | Ignored by the matcher |

Keyword matching (case-insensitive):
- `"work model"` → showroom open
- `"on call"`, `"closed"`, `"covering"`, `"off-site"`, `"off site"` → showroom closed

To add a new rep:
1. Add their entry to `TODAYS_AGENT_DIRECTORY_` in `Code.js` (firstName, name, phone, email, photo)
2. `clasp push` + redeploy
3. They can now appear in calendar events with their first name in the title

**Don't put personal cell numbers in `TODAYS_AGENT_DIRECTORY_`.** All `phone` values should be the office routing number `(208) 450-5500`. If we ever do SMS notifications (Twilio), personal cells go in PropertiesService, not in code.

## Secret handling

The script uses `PropertiesService.getScriptProperties()` for any value that shouldn't be in source code. Common keys:
- (None currently — no secrets needed for the read-only public endpoints)

If we add Twilio or another paid API later, the auth keys MUST go in PropertiesService, never in `Code.js`.

## The Lot Inventory sheet

The Apps Script reads from sheet ID `1ES3JjgZaqj_uEci3DdExDF-eC8eumDz0wrvb8avEB9g`. The sheet has one tab called `Lots` with this schema:

| Column | Type |
|---|---|
| Subdivision | text |
| Division | number |
| Block | number |
| Lot | number |
| Lot Info | text (auto: `L<lot> B<block> D<division>`) |
| Address | text |
| City | text |
| Acres | number |
| Price | number |
| Status | enum (`Available`, `Spec in Progress`, `Reserved`, `Under Contract`, `Sold`) |
| We Own | enum (`Yes`, `No`) |
| Notes | text |
| Last Updated | date |

The Apps Script's `getInventoryForWebsite_()` reads these columns and returns clean JSON to the website. If the schema changes, update that function too.

## The Job Progress sheet (read-only from script's perspective)

Sheet ID `1tWrK9tvOyNCl5WcPUXNzYmHKU_1VEpD8A5yKiGk54Z8`. Buildertrend exports + Curtis's manual updates flow into this sheet. The Apps Script reads it to:

- Drive the weekly status sync (`syncJobsToLotInventory`)
- Pull spec home data (tentative completion = dig date + 7 months)

The script never writes back to Job Progress.

## Common failure modes

### "Calendar not accessible"

The most common cause is NOT a calendar share issue — it's a **deploy identity** issue. See "Deploy identity (critical — burned us once)" below for the full story.

Quick triage:

1. Run `debugTodaysAgent()` from the Apps Script editor (signed in as `curtis@buildodyssey.com`). If THAT works, the calendar is fine; the live web app is just running under a different identity. Redeploy as Curtis to fix.
2. If `debugTodaysAgent()` ALSO returns "calendar not accessible," then Curtis genuinely lost calendar access. Open the rotation calendar's Settings and sharing → confirm `curtis@buildodyssey.com` is on the share list with "See all event details" or higher.

The Sales Agent Calendar share list (as of 2026-05-31):
- Curtis Ward (curtis@buildodyssey.com) — See all event details ✅
- Derek (derek@buildodyssey.com) — Make changes and manage sharing
- Kaysha Landon (kaysha@buildodyssey.com) — Owner
- Gary, Natasha, Rick, Shantell — See all event details
- kaysha.therealtyshop@gmail.com, susan.therealtyshop@gmail.com — See all event details (personal Gmail mirrors)

**Dominik is NOT currently on this list.** If Dominik ever deploys the Apps Script, add `dominik@buildodyssey.com` to the share list first — otherwise the moment he deploys, the calendar becomes unreachable and lead routing falls back to fan-out.

### "Missing required columns in master sheet"

The Lot Inventory sheet has been renamed, moved, or had its columns reorganized. Run `debugLotInventory()` to see what columns exist. Re-add missing ones or update the constant `LOT_INVENTORY_SHEET_ID_` to point at the right sheet.

### Web app returns old data

You pushed code with `clasp push` but didn't redeploy. The `/exec` URL serves the deployed version, not the latest. See "Deploying" above.

### Quota / rate limit errors

Apps Script has daily quotas (URL fetches, calendar reads, etc.). For a low-traffic site like buildodyssey.com, you'll never hit them — but if you do, throttle the website's fetch frequency or add caching at the Cloudflare Pages Function layer.

## Deploy identity (critical — burned us once)

The Apps Script web app is deployed with `executeAs: USER_DEPLOYING` — meaning the script runs under the identity of whoever **last clicked Deploy**. That identity needs `curtis@buildodyssey.com` because:

- The rotation calendar is shared with `curtis@buildodyssey.com` (not `curtisjward@gmail.com`)
- The lot inventory + job progress sheets are shared with `curtis@buildodyssey.com`
- If the script deploys under any other identity, `getCalendarById()` returns `null` → `/api/todays-agent` returns `{"available":false,"reason":"calendar not accessible"}` → form leads fan out to all 3 reps instead of routing to the on-duty rep

**The trap (this is what bit us on 2026-05-31):**

When Curtis clicks the Apps Script editor URL from a browser session that's signed into multiple Google accounts, it opens under whichever account is "first" — for him, that defaults to `curtisjward@gmail.com` (personal Gmail). If you click Deploy without first switching to the `curtis@buildodyssey.com` account, the deployment goes out under personal Gmail.

Symptom: emails route to ALL three reps instead of just the on-duty rep. Silent failure — nothing tells you it broke until you notice the routing pattern (which can take days).

**The fix:**

1. **Always check the account chip in the top-right corner before clicking Deploy.** If it shows anything but Curtis Ward / curtis@buildodyssey.com — STOP. Click the chip, switch accounts, reload the editor, then deploy.
2. **Editing an existing deployment preserves the original `executeAs` identity.** Even if you're signed in as the right account when you click "Edit → New version → Deploy," the deployment still runs as whoever first created it. To fix a deployment that's stuck under the wrong identity, you need to create a NEW deployment (Deploy → New deployment), then update the URL the website points at in `wrangler.toml` (`TODAYS_AGENT_URL`), `functions/api/lot-inventory.ts` (`DEFAULT_APPS_SCRIPT_URL`), and `scripts/sync-lots-from-master-sheet.mjs` (`API_URL`).
3. **Smoke test after every deploy:** `curl -s https://buildodyssey.com/api/todays-agent` should return `{"available":true,...}` (or `{"available":false,"reason":"no matching event today"}` on a legit empty day). If it returns `"calendar not accessible"`, the deploy went out under the wrong identity.

The safety net on the website side: `contact.ts` now adds a `⚠️ ROTATION CAL BROKEN` prefix to email subjects when the Apps Script returns "calendar not accessible." So if this happens again, the next form submission immediately surfaces the problem in the team's inbox.

## Architecture context

The website talks to Apps Script via Cloudflare Pages Functions (proxies). Direct browser → Apps Script fetches would fail CORS, so we route through `/api/todays-agent` (Pages Function) → Apps Script `?api=todays-agent`. The Pages Function caches responses at the edge.

The Apps Script web app is deployed as "Execute as: Me (curtis@buildodyssey.com), Who has access: Anyone". The "Anyone" access is required for unauthenticated reads from the website. The specific Me = `curtis@buildodyssey.com` (NOT `curtisjward@gmail.com`) — see "Deploy identity (critical — burned us once)" above.

---

## Related skill (cross-link)

There's a complementary skill at `Odyssey Team Folder/Claude Notes/.claude/skills/maintain-upgrades-options-app/SKILL.md` (Google Drive). That skill covers the same Apps Script project from the **configurator / sales-team perspective** — Sheet conventions for the tier groups, the user-role system (Owner / Agent Admin / Customer-Client), the lot picker UX, the `(Please Select One)` and `(Plan Specific)` markers, the one-time data-migration functions, and the function-dropdown `doGet` gotcha.

**Differences:**
- `apps-script-ops` (this skill): marketing-site/dev focused. Clasp workflow, deployment cycle, API endpoints, sheet/calendar IDs.
- `maintain-upgrades-options-app`: configurator/sales-team focused. Sheet conventions, tier groups, user roles, lot picker UX, one-time migrations.

Load both when the request spans both surfaces (e.g., "add a new API endpoint that exposes the configurator's tier data," or "the lot picker on the configurator should match what shows on /available-lots/").

## Lot data — single source of truth (added 2026-05-26)

As of 2026-05-26, the configurator's `getLots()` function now reads from the master Lot Inventory Sheet (`1ES3JjgZ...`) via `getInventoryForWebsite_()` — same source the marketing site `/available-lots/` page uses. The configurator's old bound-Sheet `Available Lots` tab is deprecated (kept as a legacy fallback in `getLotsFromBoundSheetLegacy_()`).

This means: edit the master Sheet → both surfaces update.
- Configurator: instantly on next page load (Apps Script reads live)
- Marketing site: within ~1 hour (hourly GitHub Actions cron) or instantly on push to main

City column drives permit/water/sewer/gas defaults on the configurator: Ammon, Idaho Falls, Shelley, Rigby recognized.

---

## Updating this skill

When you change the Apps Script's deployment process, add a new endpoint, rotate a sheet ID, or change the rotation calendar conventions, update this file.
