/**
 * Humusolver lead inbox: Google Apps Script web app.
 *
 * Receives leads from the website's /api/quote/ endpoint, appends them to the
 * "Leads" sheet, and emails a notification. Setup steps: scripts/apps-script/README.md
 *
 * Script property required (Project Settings → Script properties):
 *   SHARED_SECRET  must match APPS_SCRIPT_SECRET in Railway
 */

const SHEET_NAME = 'Leads';
const COLUMNS = [
  ['submittedAt', 'Submitted'],
  ['type', 'Type'],
  ['name', 'Name'],
  ['phone', 'Phone'],
  ['email', 'Email'],
  ['farm', 'Farm / business'],
  ['state', 'State'],
  ['zip', 'ZIP'],
  ['operation', 'Operation'],
  ['acres', 'Acres'],
  ['product', 'Product'],
  ['packageSize', 'Package'],
  ['quantity', 'Qty'],
  ['delivery', 'Delivery'],
  ['neededBy', 'Needed by'],
  ['contactPref', 'Contact by'],
  ['estimate', 'Estimator result'],
  ['message', 'Message'],
  ['sourcePage', 'Page'],
];

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const secret = PropertiesService.getScriptProperties().getProperty('SHARED_SECRET');
    if (!secret || body.secret !== secret) return json({ ok: false, error: 'unauthorized' });

    const lead = body.lead || {};
    const sheet = getSheet();
    // Prefix with ' so Sheets never treats submitted text as a formula.
    const safe = (v) => {
      const s = String(v == null ? '' : v);
      return /^[=+\-@]/.test(s) ? "'" + s : s;
    };
    sheet.appendRow(COLUMNS.map(([key]) => (key === 'submittedAt' ? new Date(lead.submittedAt || Date.now()) : safe(lead[key]))));

    if (body.notifyTo) sendNotification(body.notifyTo, lead);
    return json({ ok: true });
  } catch (err) {
    console.error(err);
    return json({ ok: false, error: String(err) });
  }
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(COLUMNS.map(([, label]) => label));
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold').setBackground('#e3ebdc');
  }
  return sheet;
}

function sendNotification(to, lead) {
  const isQuote = lead.type !== 'question';
  const subject = isQuote
    ? `New quote request: ${lead.name}${lead.acres ? ' · ' + lead.acres + ' ac' : ''}${lead.product ? ' · ' + lead.product : ''}`
    : `New question from ${lead.name}`;
  const lines = COLUMNS.filter(([k]) => k !== 'submittedAt' && lead[k]).map(([k, label]) => `${label}: ${lead[k]}`);
  const body = `${isQuote ? 'New quote request' : 'New question'} from humusolver.com\n\n${lines.join('\n')}\n\nAll leads: ${SpreadsheetApp.getActiveSpreadsheet().getUrl()}`;
  const options = { name: 'Humusolver Website' };
  if (lead.email) options.replyTo = lead.email;
  MailApp.sendEmail(to, subject, body, options);
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Run once from the editor to create the sheet and trigger the permission prompt. */
function setup() {
  getSheet();
  MailApp.getRemainingDailyQuota();
}
