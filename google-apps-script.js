// Google Apps Script — SKI HERE Newsletter Signup
// Paste this entire file into script.google.com, then deploy as a web app.
// See NEWSLETTER_SETUP.md for full instructions.

var SHEET_NAME = 'Signups'; // Change if you want a different tab name

function doPost(e) {
  var corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    var data = JSON.parse(e.postData.contents);
    var name  = (data.name  || '').toString().trim();
    var email = (data.email || '').toString().trim();

    if (!name || !email) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: 'Name and email are required.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);

    // Create the sheet and header row if it does not exist yet
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(['Timestamp', 'Name', 'Email']);
      sheet.setFrozenRows(1);
    }

    var timestamp = new Date().toISOString();
    sheet.appendRow([timestamp, name, email]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Required to handle the browser pre-flight OPTIONS request that fetch() sends
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: false, error: 'GET not supported. POST only.' }))
    .setMimeType(ContentService.MimeType.JSON);
}
