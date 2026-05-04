// Google Apps Script — SKI HERE Newsletter Signup + Contact Form
// Deploy settings: Execute as = Me, Who has access = Anyone

var SPREADSHEET_ID = '1WQxWu1aMZcjJ6GqNHnmFCvgHFj5Vjfi7BwtKgdSA1GY';

function doPost(e) {
  try {
    var type    = (e.parameter.type    || 'signup').toString().trim();
    var name    = (e.parameter.name    || '').toString().trim();
    var email   = (e.parameter.email   || '').toString().trim();
    var message = (e.parameter.message || '').toString().trim();

    if (!name || !email) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: 'Name and email are required.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    if (type === 'contact') {
      var contactSheet = ss.getSheetByName('Contact');
      if (!contactSheet) {
        contactSheet = ss.insertSheet('Contact');
        contactSheet.appendRow(['Timestamp', 'Name', 'Email', 'Message']);
        contactSheet.setFrozenRows(1);
      }
      contactSheet.appendRow([new Date().toISOString(), name, email, message]);
    } else {
      var signupSheet = ss.getSheetByName('Signups');
      if (!signupSheet) {
        signupSheet = ss.insertSheet('Signups');
        signupSheet.appendRow(['Timestamp', 'Name', 'Email']);
        signupSheet.setFrozenRows(1);
      }
      signupSheet.appendRow([new Date().toISOString(), name, email]);
    }

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

function testWrite() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('Signups');
  if (!sheet) {
    sheet = ss.insertSheet('Signups');
    sheet.appendRow(['Timestamp', 'Name', 'Email']);
    sheet.setFrozenRows(1);
  }
  sheet.appendRow([new Date().toISOString(), 'Test Name', 'test@test.com']);
  Logger.log('Done');
}
