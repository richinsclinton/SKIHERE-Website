/**
 * Utah Public Ski — form backend for the "SKI HERE Records" sheet.
 * Paste into the sheet's Extensions → Apps Script, then
 * Deploy → New deployment → Web app → Execute as: Me, Access: Anyone.
 * Put the /exec URL in assets/js/config.js (window.UPS_API).
 *
 * GET  /exec                         → { ok, count }
 * POST /exec {type:"pledge",name,email,zip}           → Signups tab
 * POST /exec {type:"contact",topic,name,email,message} → Contact tab
 */
var SIGNUPS = 'Signups', CONTACT = 'Contact';

function doGet() {
  return json({ ok: true, count: signupCount() });
}

function doPost(e) {
  var d = {};
  try { d = JSON.parse(e.postData.contents); } catch (err) { return json({ ok: false, error: 'bad json' }); }
  if (d.website) return json({ ok: true, count: signupCount() }); // honeypot
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet(), now = new Date().toISOString();
    if (d.type === 'contact') {
      var c = ss.getSheetByName(CONTACT);
      if (!c.getRange('E1').getValue()) c.getRange('E1').setValue('Topic');
      c.appendRow([now, clean(d.name), clean(d.email), clean(d.message, 5000), clean(d.topic)]);
      return json({ ok: true });
    }
    var email = clean(d.email).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ ok: false, error: 'email' });
    ss.getSheetByName(SIGNUPS).appendRow([now, clean(d.name), email, clean(d.zip)]);
    return json({ ok: true, count: signupCount() });
  } finally {
    lock.releaseLock();
  }
}

function signupCount() {
  return Math.max(0, SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SIGNUPS).getLastRow() - 1);
}

// Leading = + - @ would be run as a formula by Sheets; neutralize it.
function clean(v, max) {
  var s = String(v == null ? '' : v).trim().slice(0, max || 200);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
