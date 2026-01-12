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

## Google Sheets (RSVP backend)

This app sends each guest as a separate row to a Google Sheet using Apps Script.

1. Create a Google Sheet with a tab named `Guests` and add a header row (Name, Host, Type, Timestamp).
2. Open Extensions -> Apps Script and paste this code:

```javascript
const SHEET_NAME = 'Guests';

function doPost(e) {
  const payload = JSON.parse(e.postData.contents || '{}');
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

function doGet() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({ guests: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const values = sheet.getDataRange().getValues();
  const guests = values.slice(1).map(row => ({
    name: row[0],
    host: row[1],
    isHost: row[2] === 'host',
    timestamp: row[3] ? new Date(row[3]).getTime() : Date.now()
  }));

  return ContentService.createTextOutput(JSON.stringify({ guests }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Deploy as Web App (Execute as: Me, Who has access: Anyone).
4. Copy the Web App URL and replace `SHEETS_ENDPOINT` in `constants.ts`.

Sheet columns:
- Column A: Guest name
- Column B: Host name (the person who filled the form)
- Column C: `host` or `guest`
- Column D: Timestamp (ISO string)
