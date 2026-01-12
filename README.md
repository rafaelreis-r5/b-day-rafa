<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1ulEzhDTG8j4xS5pNvTXIsTYTx-D9RIIs

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Google Sheets (RSVP + Ranking backend)

This app sends each guest as a separate row to a Google Sheet using Apps Script, and keeps the game ranking synced in another tab.

1. Create a Google Sheet with two tabs:
   - `Guests` (header row: Name, Host, Type, Timestamp)
   - `Ranking` (header row: Player, Score, UpdatedAt)
2. Open Extensions -> Apps Script and paste this code:

```javascript
const SHEET_NAME = 'Guests';
const RANKING_SHEET_NAME = 'Ranking';

function doPost(e) {
  const payload = JSON.parse(e.postData.contents || '{}');
  const type = payload.type || 'guests';

  if (type === 'ranking') {
    return upsertRanking(payload);
  }

  return saveGuests(payload);
}

function doGet(e) {
  const type = (e && e.parameter && e.parameter.type) ? e.parameter.type : 'guests';
  const callback = (e && e.parameter && e.parameter.callback) ? e.parameter.callback : '';

  if (type === 'ranking') {
    return outputJson(getRanking(), callback);
  }

  return outputJson(getGuests(), callback);
}

function outputJson(payload, callback) {
  const text = callback ? `${callback}(${JSON.stringify(payload)})` : JSON.stringify(payload);
  const output = ContentService.createTextOutput(text);
  return output.setMimeType(callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
}

function saveGuests(payload) {
  const guests = payload.guests || [];
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);

  if (!sheet || guests.length === 0) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const rows = guests.map(guest => ([
    guest.name || '',
    guest.host || '',
    guest.isHost ? 'host' : 'guest',
    guest.timestamp ? new Date(guest.timestamp).toISOString() : new Date().toISOString()
  ]));

  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getGuests() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  if (!sheet) {
    return { guests: [] };
  }

  const values = sheet.getDataRange().getValues();
  const guests = values.slice(1).map(row => ({
    name: row[0],
    host: row[1],
    isHost: row[2] === 'host',
    timestamp: row[3] ? new Date(row[3]).getTime() : Date.now()
  }));

  return { guests };
}

function upsertRanking(payload) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(RANKING_SHEET_NAME);
  const player = (payload.player || '').toString().trim();
  const score = Number(payload.score || 0);
  const timestamp = payload.timestamp ? new Date(payload.timestamp) : new Date();

  if (!sheet || !player) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const values = sheet.getDataRange().getValues();
  let targetRow = -1;

  for (var i = 1; i < values.length; i++) {
    if ((values[i][0] || '').toString().trim() === player) {
      targetRow = i + 1;
      break;
    }
  }

  if (targetRow === -1) {
    sheet.appendRow([player, score, timestamp.toISOString()]);
  } else {
    sheet.getRange(targetRow, 1, 1, 3).setValues([[player, score, timestamp.toISOString()]]);
  }

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getRanking() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(RANKING_SHEET_NAME);
  if (!sheet) {
    return { ranking: [] };
  }

  const values = sheet.getDataRange().getValues();
  const ranking = values.slice(1).map(row => ({
    player: row[0],
    score: Number(row[1] || 0),
    timestamp: row[2] ? new Date(row[2]).getTime() : Date.now()
  }));

  return { ranking };
}
```

3. Deploy as Web App (Execute as: Me, Who has access: Anyone).
4. Copy the Web App URL and replace `SHEETS_ENDPOINT` in `constants.ts`.

Note: The app uses JSONP for reads (ranking/guests) and text/plain POST for writes to avoid CORS restrictions on Apps Script.

Sheet columns:
- Guests tab:
  - Column A: Name
  - Column B: Host
  - Column C: `host` or `guest`
  - Column D: Timestamp (ISO string)
- Ranking tab:
  - Column A: Player
  - Column B: Score
  - Column C: UpdatedAt (ISO string)
