/*
Google Apps Script für den Supervisions-Prototyp

Diese Version ist für ein eigenständiges Apps-Script-Projekt vorbereitet.
Sie greift über SPREADSHEET_ID direkt auf dein Google Sheet zu.

Einrichtung:
1. Google Sheet erstellen und Tabellenblatt unten "Ergebnisse" nennen.
2. Auf script.google.com ein neues Projekt öffnen.
3. Diesen kompletten Code in Code.gs einfügen.
4. ADMIN_PASSWORD unten selbst ersetzen.
5. Bereitstellen > Neue Bereitstellung > Web-App.
6. Ausführen als: Ich. Zugriff: Jeder mit dem Link.
7. Web-App-URL in js/config.js eintragen.
*/

const SPREADSHEET_ID = '1egAveElyXdI9nC4yQfZCtUUwqn8-byODELn4mvuzY';
const SHEET_NAME = 'Ergebnisse';
const ADMIN_PASSWORD = 'HIER_DEIN_PASSWORT_EINTRAGEN'; // nur im Apps Script ändern, nicht in HTML/JS speichern

function getSheet_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Zeitstempel', 'Gruppenname', 'Gruppen-ID', 'Rollen', 'DatenJSON']);
  }

  return sheet;
}

function doPost(e) {
  let data = {};

  try {
    data = JSON.parse(e.postData.contents || '{}');
  } catch (err) {
    return jsonOutput_({ ok: false, error: 'Ungültiges JSON' });
  }

  const sheet = getSheet_();
  const roles = data.assignments ? JSON.stringify(data.assignments) : '';

  sheet.appendRow([
    new Date(),
    data.groupName || '',
    data.groupId || '',
    roles,
    JSON.stringify(data)
  ]);

  return jsonOutput_({ ok: true, message: 'Ergebnis gespeichert.' });
}

function doGet(e) {
  const action = (e.parameter.action || 'list').toLowerCase();

  if (action === 'list') {
    return list_(e);
  }

  if (action === 'delete') {
    return delete_(e);
  }

  return jsonp_(e, { ok: false, error: 'Unbekannte Aktion' });
}

function list_(e) {
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  const rows = [];

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    let parsed = {};

    try {
      parsed = JSON.parse(row[4] || '{}');
    } catch (err) {
      parsed = { raw: row[4] || '' };
    }

    rows.push({
      rowNumber: i + 1,
      timestamp: row[0] ? Utilities.formatDate(new Date(row[0]), Session.getScriptTimeZone(), 'dd.MM.yyyy HH:mm') : '',
      groupName: row[1] || '',
      groupId: row[2] || '',
      roles: row[3] || '',
      data: parsed
    });
  }

  return jsonp_(e, rows);
}

function delete_(e) {
  const password = e.parameter.password || '';
  const rowNumber = Number(e.parameter.rowNumber || 0);

  if (password !== ADMIN_PASSWORD) {
    return jsonp_(e, { ok: false, error: 'Falsches Passwort.' });
  }

  if (!rowNumber || rowNumber < 2) {
    return jsonp_(e, { ok: false, error: 'Ungültige Zeile.' });
  }

  const sheet = getSheet_();
  sheet.deleteRow(rowNumber);

  return jsonp_(e, { ok: true, message: 'Eintrag gelöscht.' });
}

function jsonOutput_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function jsonp_(e, data) {
  const callback = e.parameter.callback;
  const json = JSON.stringify(data);

  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return jsonOutput_(data);
}
