# `getTodaysAgent()` — Apps Script endpoint spec

Powers the "Today's specialist on call" widget on `/estimate`. Lives in your existing Apps Script project (the same one running the Upgrades & Options web app) or a sibling project — your call.

## Endpoint

- **Method**: GET
- **Auth**: none (public read-only)
- **Returns**: `application/json`

## Response shape (success)

```json
{
  "firstName": "Kaysha",
  "name": "Kaysha Landon",
  "phone": "(208) 555-1234",
  "phoneHref": "tel:+12085551234",
  "email": "kaysha@buildodyssey.com",
  "photo": "https://buildodyssey.com/media/j3sh2ujv/headshots-010724-5-1.jpg"
}
```

Only `firstName`, `name`, and `phone` are required. The Pages function will pass everything through; the page currently uses `name`, `phone`, `phoneHref`.

## Response shape (no agent today / failure)

Return either an empty object `{}` or:

```json
{ "available": false }
```

The page will fall back to "Our New Construction Team" + the main office number.

## Implementation sketch

```javascript
function doGet(e) {
  const CAL_ID = 'YOUR_CALENDAR_ID@group.calendar.google.com';
  const AGENT_DIRECTORY = {
    'Kaysha':   { name: 'Kaysha Landon',         phone: '(208) ___-____', phoneHref: 'tel:+1208_______', email: 'kaysha@buildodyssey.com', photo: 'https://buildodyssey.com/media/j3sh2ujv/headshots-010724-5-1.jpg' },
    'Susan':    { name: 'Susan Allred-Patterson',phone: '(208) ___-____', phoneHref: 'tel:+1208_______', email: 'susan@buildodyssey.com',  photo: 'https://buildodyssey.com/media/rywjeszz/headshots-010724-3-1.jpg' },
    'Gary':     { name: 'Gary Rasmussen',        phone: '(208) ___-____', phoneHref: 'tel:+1208_______', email: 'gary@buildodyssey.com',   photo: 'https://buildodyssey.com/media/lbrm5os2/gary-rasmussen-real-estate-agent-east-idaho.jpg' },
  };

  const cal = CalendarApp.getCalendarById(CAL_ID);
  const start = new Date(); start.setHours(0,0,0,0);
  const end   = new Date(); end.setHours(23,59,59,999);
  const events = cal.getEvents(start, end);

  // Pick the first event whose title starts with a known first name
  for (const ev of events) {
    const title = ev.getTitle().trim();
    for (const firstName in AGENT_DIRECTORY) {
      if (title.toLowerCase().startsWith(firstName.toLowerCase())) {
        const agent = AGENT_DIRECTORY[firstName];
        return ContentService
          .createTextOutput(JSON.stringify({ firstName, ...agent }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({ available: false }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## Deployment

1. Add the function above to your Apps Script project
2. **Deploy** → **New deployment** → **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
3. Copy the deployment URL — looks like `https://script.google.com/macros/s/AKfycb__/exec`
4. Drop it in our chat — I'll set it as the `TODAYS_AGENT_URL` env var on the Pages project. Page starts pulling from it within seconds, cached at the edge for 1 hour after first hit.

## What you control going forward

- Add/remove agents → edit `AGENT_DIRECTORY` in Apps Script
- Change the calendar → edit `CAL_ID`
- Change phone numbers / photos → edit the directory
- No website redeploy needed for any of these

## What I control

- The Pages function (`functions/api/todays-agent.ts`) and the page widget — re-deploy odyssey-site if you ever want to change the visual treatment
