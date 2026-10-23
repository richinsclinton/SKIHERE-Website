/**
 * Utah Public Ski: form backend for the "SKI HERE Records" sheet.
 * Paste into the sheet's Extensions > Apps Script, replacing everything, then
 * Deploy > Manage deployments > pencil (edit) > Version: New version > Deploy.
 * Editing the existing deployment keeps the same /exec URL the site uses.
 *
 * GET  /exec                                            -> { ok, count }
 * POST /exec {type:"pledge",name,email,zip,consent:true} -> Signups tab (one row per email)
 * POST /exec {type:"contact",topic,name,email,message}  -> Contact tab
 */
var SIGNUPS = 'Signups', CONTACT = 'Contact';
var NOTIFY_EMAIL = 'richins.clinton@gmail.com'; // gets an email if something fails

function doGet() {
  return json({ ok: true, count: signupCount() });
}

function doPost(e) {
  var d = {};
  try { d = JSON.parse(e.postData.contents); } catch (err) { return json({ ok: false, error: 'bad json' }); }
  if (d.website) return json({ ok: true, count: signupCount() }); // honeypot: bots fill this hidden field

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000); // queue simultaneous submissions instead of colliding
    var ss = SpreadsheetApp.getActiveSpreadsheet(), now = new Date().toISOString();

    if (d.type === 'contact') {
      var c = ss.getSheetByName(CONTACT);
      if (!c.getRange('E1').getValue()) c.getRange('E1').setValue('Topic');
      c.appendRow([now, clean(d.name), clean(d.email), clean(d.message, 5000), clean(d.topic)]);
      return json({ ok: true });
    }

    if (d.consent !== true) return json({ ok: false, error: 'consent' });
    var email = clean(d.email).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ ok: false, error: 'email' });

    var s = ss.getSheetByName(SIGNUPS), last = s.getLastRow();
    if (last > 1) {
      var emails = s.getRange(2, 3, last - 1, 1).getValues();
      for (var i = 0; i < emails.length; i++) {
        if (String(emails[i][0]).trim().toLowerCase() === email) {
          // Already signed: thank them, but don't add a row.
          return json({ ok: true, duplicate: true, count: signupCount() });
        }
      }
    }
    s.appendRow([now, clean(d.name), email, clean(d.zip)]);
    return json({ ok: true, count: signupCount() });
  } catch (err) {
    try { MailApp.sendEmail(NOTIFY_EMAIL, 'Utah Public Ski form error', String(err) + '\n\n' + (e.postData ? e.postData.contents : '')); } catch (ignore) {}
    return json({ ok: false, error: 'server_error' });
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
