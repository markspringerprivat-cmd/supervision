/*
Google Apps Script für den Supervisions-Prototyp

Einrichtung:
1. Google Sheet erstellen.
2. Erweiterungen > Apps Script öffnen.
3. Diesen Code einfügen.
4. SHEET_NAME ggf. anpassen.
5. Bereitstellen > Neue Bereitstellung > Web-App.
6. Ausführen als: Ich. Zugriff: Jeder mit dem Link.
7. Web-App-URL in js/config.js eintragen.
*/

const SHEET_NAME = 'Ergebnisse';
const ADMIN_PASSWORD = 'BITTE_AENDERN'; // nur für optionale Löschfunktionen, nicht im HTML speichern

function setupSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Zeitstempel', 'Gruppenname', 'Gruppen-ID', 'Rollen', 'DatenJSON']);
  }
  return sheet;
}

function doPost(e) {
  const sheet = setupSheet_();
  let data = {};
  try {
    data = JSON.parse(e.postData.contents || '{}');
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'Ungültiges JSON' })).setMimeType(ContentService.MimeType.JSON);
  }
  const roles = data.assignments ? JSON.stringify(data.assignments) : '';
  sheet.appendRow([
    new Date(),
    data.groupName || '',
    data.groupId || '',
    roles,
    JSON.stringify(data)
  ]);
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const action = (e.parameter.action || 'list').toLowerCase();
  if (action === 'list') return list_(e);
  if (action === 'delete') return delete_(e);
  return jsonp_(e, { ok: false, error: 'Unbekannte Aktion' });
}

function list_(e) {
  const sheet = setupSheet_();
  const values = sheet.getDataRange().getValues();
  const rows = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    let parsed = {};
    try { parsed = JSON.parse(row[4] || '{}'); } catch (err) {}
    rows.push({
      rowNumber: i + 1,
      timestamp: row[0] ? Utilities.formatDate(new Date(row[0]), Session.getScriptTimeZone(), 'dd.MM.yyyy HH:mm') : '',
      groupName: row[1] || '',
      groupId: row[2] || '',
      data: parsed
    });
  }
  return jsonp_(e, rows);
}

function delete_(e) {
  const password = e.parameter.password || '';
  const rowNumber = Number(e.parameter.rowNumber || 0);
  if (password !== ADMIN_PASSWORD) return jsonp_(e, { ok: false, error: 'Falsches Passwort' });
  if (!rowNumber || rowNumber < 2) return jsonp_(e, { ok: false, error: 'Ungültige Zeile' });
  const sheet = setupSheet_();
  sheet.deleteRow(rowNumber);
  return jsonp_(e, { ok: true });
}

function jsonp_(e, data) {
  const callback = e.parameter.callback;
  const json = JSON.stringify(data);
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}
