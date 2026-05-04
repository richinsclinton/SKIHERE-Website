// Google Apps Script — SKI HERE Newsletter Signup
// Paste this entire file into script.google.com, then deploy as a web app.
// Deploy settings: Execute as = Me, Who has access = Anyone

var SPREADSHEET_ID = '1WQxWu1aMZcjJ6GqNHnmFCvgHFj5Vjfi7BwtKgdSA1GY';
var SHEET_NAME = 'SKI HERE Records';

function doPost(e) {
  try {
    var name  = (e.parameter.name  || '').toString().trim();
    var email = (e.parameter.email || '').toString().trim();

    if (!name || !email) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: 'Name and email are required.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(['Timestamp', 'Name', 'Email']);
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([new Date().toISOString(), name, email]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: false, error: 'GET not supported.' }))
    .setMimeType(ContentService.MimeType.JSON);
}
