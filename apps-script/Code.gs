/*
Google Apps Script für den Supervisions-Prototyp

Diese Version ist für dein Google Sheet vorbereitet.
Sie speichert pro Gruppe eine Zeile mit:
Zeitpunkt | Gruppenname | Daten

Einrichtung:
1. Google Sheet erstellen und Tabellenblatt unten "Ergebnisse" nennen.
2. Auf script.google.com ein neues Projekt öffnen.
3. Diesen kompletten Code in Code.gs einfügen.
4. ADMIN_PASSWORD unten selbst ersetzen.
5. Bereitstellen > Neue Bereitstellung > Web-App.
6. Ausführen als: Ich. Zugriff: Jeder mit dem Link.
7. Web-App-URL in js/config.js eintragen.

const SPREADSHEET_ID = '1egAveElyXdI9nC4yQfZCtUUwqn8-byODELn4mvuzY';
const SHEET_NAME = 'Ergebnisse';
const ADMIN_PASSWORD = 'HIER_DEIN_PASSWORT_EINTRAGEN';

function getSheet_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  // Falls das Blatt leer ist, werden passende Überschriften angelegt.
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Zeitpunkt', 'Gruppenname', 'Daten']);
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

  if (data.action === 'deleteAll') {
    return deleteAll_(data);
  }

  const sheet = getSheet_();
  const groupName = data.groupName || data.groupId || 'Unbenannte Gruppe';

  sheet.appendRow([
    new Date(),
    groupName,
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
    return deleteRow_(e);
  }

  return jsonp_(e, { ok: true, message: 'Apps Script läuft.' });
}

function list_(e) {
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  const entries = [];

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    // Leere Zeilen überspringen.
    if (!row[0] && !row[1] && !row[2]) continue;

    let parsedData = {};
    try {
      parsedData = JSON.parse(row[2] || '{}');
    } catch (err) {
      parsedData = { raw: row[2] || '' };
    }

    entries.push({
      id: i + 1,
      rowNumber: i + 1,
      timestamp: formatDate_(row[0]),
      groupName: row[1] || '',
      data: parsedData
    });
  }

  return jsonp_(e, { ok: true, entries: entries });
}

function deleteRow_(e) {
  const password = e.parameter.password || '';
  const rowNumber = Number(e.parameter.rowNumber || e.parameter.id || 0);

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

function deleteAll_(body) {
  if (body.password !== ADMIN_PASSWORD) {
    return jsonOutput_({ ok: false, error: 'Falsches Passwort.' });
  }

  const sheet = getSheet_();
  if (sheet.getLastRow() > 1) {
    sheet.deleteRows(2, sheet.getLastRow() - 1);
  }

  return jsonOutput_({ ok: true, message: 'Alle Ergebnisse wurden gelöscht.' });
}

function formatDate_(value) {
  if (!value) return '';
  try {
    return Utilities.formatDate(new Date(value), Session.getScriptTimeZone(), 'dd.MM.yyyy HH:mm');
  } catch (err) {
    return String(value);
  }
}

function jsonOutput_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function jsonp_(e, obj) {
  const callback = e.parameter.callback;
  const json = JSON.stringify(obj);

  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return jsonOutput_(obj);
}
