// Apps Script für die Supervisions-Webseite.
// Diese Version nutzt bewusst openByUrl(), weil openById() bei einigen kopierten IDs Probleme machen kann.
// Falls du eine andere Tabelle verwendest, ersetze nur diese vollständige Google-Sheets-URL.
const SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1egAveElyXdI9nC4yQfZCtUUwqn8-byODELn4mvuzY/edit?gid=0#gid=0';
const SHEET_NAME = 'Ergebnisse';

const HEADERS = [
  'Zeitpunkt',
  'Gruppenname',
  'Supervisor*in',
  'Schulleitung',
  'Lehrkraft A',
  'Lehrkraft B',
  'Schulleitung - Probleme / Beobachtung',
  'Schulleitung - Gefühle',
  'Schulleitung - Wünsche',
  'Lehrkraft A - Probleme / Perspektive',
  'Lehrkraft A - Gefühle',
  'Lehrkraft A - Wünsche',
  'Lehrkraft B - Probleme / Perspektive',
  'Lehrkraft B - Gefühle',
  'Lehrkraft B - Wünsche',
  'Ziel Schulleitung',
  'Ziel Lehrkraft A',
  'Ziel Lehrkraft B',
  'Gemeinsamkeiten',
  'Gemeinsame Zielvereinbarung',
  'Brainstorming / hilfreiche Kritik',
  'Anerkennungsrunde / Perspektiven',
  'Absprachen zum weiteren Vorgehen',
  'Zustimmung / Rückmeldung',
  'Praxistauglichkeit - Unterstützung durch Schulleitung',
  'Praxistauglichkeit - erste konkrete Umsetzungsschritte',
  'Praxistauglichkeit - Einschätzung durch Schulleitung',
  'Gruppen-ID',
  'Rohdaten JSON'
];

const COL_GROUP_ID = 28;
const COL_RAW_JSON = 29;

function getSheet_() {
  if (!SPREADSHEET_URL || SPREADSHEET_URL.indexOf('docs.google.com/spreadsheets') === -1) {
    throw new Error('SPREADSHEET_URL ist nicht korrekt eingetragen. Bitte die vollständige Google-Sheet-URL einfügen.');
  }
  const ss = SpreadsheetApp.openByUrl(SPREADSHEET_URL);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  ensureHeader_(sheet);
  return sheet;
}

function ensureHeader_(sheet) {
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet.setFrozenRows(1);
}

function doPost(e) {
  try {
    let body = {};
    try {
      body = JSON.parse(e.postData.contents || '{}');
    } catch (err) {
      return jsonOutput_({ ok: false, error: 'Ungültiges JSON: ' + err.message });
    }
    const action = String(body.action || '').toLowerCase();
    if (action === 'deleteall' || action === 'delete_all' || action === 'clear') return deleteAll_();
    if (action === 'deleterow' || action === 'delete' || action === 'delete_row') return deleteRowPost_(body);
    return saveEntry_(body);
  } catch (err) {
    return jsonOutput_({ ok: false, error: err.message, stack: err.stack || '' });
  }
}

function doGet(e) {
  try {
    const action = String((e.parameter && e.parameter.action) || 'list').toLowerCase();
    if (action === 'list') return listEntries_(e);
    if (action === 'deleteall' || action === 'delete_all' || action === 'clear') return deleteAllGet_(e);
    if (action === 'delete' || action === 'deleterow' || action === 'delete_row') return deleteRowGet_(e);
    if (action === 'ping') return jsonp_(e, { ok: true, message: 'Apps Script läuft.', sheetName: SHEET_NAME });
    if (action === 'test') {
      const sheet = getSheet_();
      return jsonp_(e, {
        ok: true,
        message: 'Verbindung zur Tabelle erfolgreich.',
        sheetName: sheet.getName(),
        rows: sheet.getLastRow(),
        columns: sheet.getLastColumn()
      });
    }
    return jsonp_(e, { ok: true, message: 'Apps Script läuft.', hint: 'Nutze ?action=list oder ?action=list&groupId=...' });
  } catch (err) {
    return jsonp_(e, { ok: false, error: err.message, stack: err.stack || '' });
  }
}

function saveEntry_(body) {
  const sheet = getSheet_();
  const data = normalizeSubmittedData_(body);
  const row = buildRow_(data);
  const groupId = String(row[COL_GROUP_ID - 1] || '').trim();
  const existingRow = groupId ? findRowByGroupId_(sheet, groupId) : 0;
  if (existingRow >= 2) {
    sheet.getRange(existingRow, 1, 1, HEADERS.length).setValues([row]);
    return jsonOutput_({ ok: true, mode: 'updated', message: 'Ergebnis aktualisiert.', groupName: row[1], groupId: groupId, rowNumber: existingRow });
  }
  sheet.appendRow(row);
  return jsonOutput_({ ok: true, mode: 'created', message: 'Ergebnis gespeichert.', groupName: row[1], groupId: groupId, rowNumber: sheet.getLastRow() });
}

function normalizeSubmittedData_(body) {
  if (body && body.data && typeof body.data === 'object') return body.data;
  return body || {};
}

function buildRow_(data) {
  const assignments = data.assignments || {};
  const supervisorName = pick_([assignments.supervisor, data.supervisor]);
  const schulleitungName = pick_([assignments.schulleitung, data.schulleitung]);
  const lehrkraftAName = pick_([assignments['lehrkraft-a'], assignments.lehrkraftA, data.lehrkraftA]);
  const lehrkraftBName = pick_([assignments['lehrkraft-b'], assignments.lehrkraftB, data.lehrkraftB]);
  const fallbackGroupId = slug_([supervisorName, schulleitungName, lehrkraftAName, lehrkraftBName].filter(Boolean).join('-'));
  const groupId = pick_([data.groupId, data.g, data.groupToken, data.token, fallbackGroupId]);
  const groupName = pick_([
    data.groupName,
    [supervisorName, schulleitungName, lehrkraftAName, lehrkraftBName].filter(Boolean).join(', '),
    groupId,
    'Unbenannte Gruppe'
  ]);

  return [
    new Date(),
    groupName,
    supervisorName,
    schulleitungName,
    lehrkraftAName,
    lehrkraftBName,
    pick_([path_(data, 'p2.slProbleme'), path_(data, 'p2.slProblem'), path_(data, 'p2.slBeobachtung'), path_(data, 'prep.schulleitung.beobachtung')]),
    pick_([path_(data, 'p2.slGefuehle'), path_(data, 'p2.schulleitungGefuehle'), path_(data, 'prep.schulleitung.gefuehle')]),
    pick_([path_(data, 'p2.slWuensche'), path_(data, 'p2.schulleitungWuensche'), path_(data, 'prep.schulleitung.wuensche')]),
    pick_([path_(data, 'p2.aProbleme'), path_(data, 'p2.aProblem'), path_(data, 'p2.aPerspektive'), path_(data, 'prep.lehrkraft-a.perspektive')]),
    pick_([path_(data, 'p2.aGefuehle'), path_(data, 'p2.lehrkraftAGefuehle'), path_(data, 'prep.lehrkraft-a.gefuehle')]),
    pick_([path_(data, 'p2.aWuensche'), path_(data, 'p2.lehrkraftAWuensche'), path_(data, 'prep.lehrkraft-a.wuensche')]),
    pick_([path_(data, 'p2.bProbleme'), path_(data, 'p2.bProblem'), path_(data, 'p2.bPerspektive'), path_(data, 'prep.lehrkraft-b.perspektive')]),
    pick_([path_(data, 'p2.bGefuehle'), path_(data, 'p2.lehrkraftBGefuehle'), path_(data, 'prep.lehrkraft-b.gefuehle')]),
    pick_([path_(data, 'p2.bWuensche'), path_(data, 'p2.lehrkraftBWuensche'), path_(data, 'prep.lehrkraft-b.wuensche')]),
    pick_([path_(data, 'p3.zielSL')]),
    pick_([path_(data, 'p3.zielA')]),
    pick_([path_(data, 'p3.zielB')]),
    pick_([path_(data, 'p3.gemeinsamkeiten')]),
    pick_([path_(data, 'p3.gemeinsamesZiel'), path_(data, 'p3.gemeinsameZielformulierung'), path_(data, 'zielvereinbarung')]),
    pick_([path_(data, 'p4.kritik')]),
    pick_([path_(data, 'p4.anerkennung')]),
    pick_([path_(data, 'p4.absprachen'), path_(data, 'p4.weiteresVorgehen')]),
    pick_([path_(data, 'p5.zustimmung'), path_(data, 'zustimmung')]),
    pick_([path_(data, 'p6.unterstuetzung'), path_(data, 'p6.unterstützung')]),
    pick_([path_(data, 'p6.umsetzung'), path_(data, 'p6.konkreteUmsetzungsschritte')]),
    pick_([path_(data, 'p6.praxistauglichkeit'), path_(data, 'p6.einschaetzung'), path_(data, 'p6.einschätzung')]),
    groupId,
    JSON.stringify(data)
  ];
}

function findRowByGroupId_(sheet, groupId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;
  const values = sheet.getRange(2, 1, lastRow - 1, Math.max(sheet.getLastColumn(), HEADERS.length)).getValues();
  for (let i = 0; i < values.length; i++) {
    const entry = rowToEntry_(values[i], i + 2);
    if (String(entry.groupId || '').trim() === String(groupId).trim()) return i + 2;
  }
  return 0;
}

function listEntries_(e) {
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  const groupFilter = String(e.parameter.groupId || e.parameter.g || e.parameter.token || '').trim();
  const entries = [];
  for (let r = 1; r < values.length; r++) {
    const row = values[r];
    if (isEmptyRow_(row)) continue;
    const entry = rowToEntry_(row, r + 1);
    if (groupFilter && String(entry.groupId || '').trim() !== groupFilter) continue;
    entries.push(entry);
  }
  return jsonp_(e, { ok: true, entries: entries, groupId: groupFilter });
}

function rowToEntry_(row, rowNumber) {
  let raw = {};
  const rawCandidateNew = row[COL_RAW_JSON - 1];
  const rawCandidateOld = row[COL_GROUP_ID - 1];
  try { raw = JSON.parse(rawCandidateNew || rawCandidateOld || '{}'); } catch (err) { raw = {}; }
  const groupId = pick_([row[COL_GROUP_ID - 1], raw.groupId, raw.g, raw.groupToken, raw.token]);
  const reconstructed = {
    groupId: groupId,
    groupName: row[1] || raw.groupName || '',
    timestamp: formatDate_(row[0]),
    assignments: {
      supervisor: row[2] || path_(raw, 'assignments.supervisor') || '',
      schulleitung: row[3] || path_(raw, 'assignments.schulleitung') || '',
      'lehrkraft-a': row[4] || path_(raw, 'assignments.lehrkraft-a') || '',
      'lehrkraft-b': row[5] || path_(raw, 'assignments.lehrkraft-b') || ''
    },
    p2: {
      slProbleme: row[6] || '', slGefuehle: row[7] || '', slWuensche: row[8] || '',
      aProbleme: row[9] || '', aGefuehle: row[10] || '', aWuensche: row[11] || '',
      bProbleme: row[12] || '', bGefuehle: row[13] || '', bWuensche: row[14] || ''
    },
    p3: {
      zielSL: row[15] || '', zielA: row[16] || '', zielB: row[17] || '',
      gemeinsamkeiten: row[18] || '', gemeinsamesZiel: row[19] || ''
    },
    p4: { kritik: row[20] || '', anerkennung: row[21] || '', absprachen: row[22] || '' },
    p5: { zustimmung: row[23] || '' },
    p6: { unterstuetzung: row[24] || '', umsetzung: row[25] || '', praxistauglichkeit: row[26] || '' },
    raw: raw
  };
  return {
    id: rowNumber,
    rowNumber: rowNumber,
    timestamp: formatDate_(row[0]),
    groupName: row[1] || raw.groupName || '',
    groupId: groupId,
    data: reconstructed
  };
}

function deleteAllGet_(e) {
  const sheet = getSheet_();
  if (sheet.getLastRow() > 1) sheet.deleteRows(2, sheet.getLastRow() - 1);
  ensureHeader_(sheet);
  return jsonp_(e, { ok: true, message: 'Alle Ergebnisse wurden gelöscht.' });
}

function deleteRowGet_(e) {
  const rowNumber = Number(e.parameter.rowNumber || e.parameter.id || 0);
  if (!rowNumber || rowNumber < 2) return jsonp_(e, { ok: false, error: 'Ungültige Zeile.' });
  const sheet = getSheet_();
  if (rowNumber > sheet.getLastRow()) return jsonp_(e, { ok: false, error: 'Zeile existiert nicht mehr.' });
  sheet.deleteRow(rowNumber);
  return jsonp_(e, { ok: true, message: 'Eintrag gelöscht.' });
}

function deleteRowPost_(body) {
  const rowNumber = Number(body.rowNumber || body.id || 0);
  if (!rowNumber || rowNumber < 2) return jsonOutput_({ ok: false, error: 'Ungültige Zeile.' });
  const sheet = getSheet_();
  if (rowNumber > sheet.getLastRow()) return jsonOutput_({ ok: false, error: 'Zeile existiert nicht mehr.' });
  sheet.deleteRow(rowNumber);
  return jsonOutput_({ ok: true, message: 'Eintrag gelöscht.' });
}

function deleteAll_() {
  const sheet = getSheet_();
  if (sheet.getLastRow() > 1) sheet.deleteRows(2, sheet.getLastRow() - 1);
  ensureHeader_(sheet);
  return jsonOutput_({ ok: true, message: 'Alle Ergebnisse wurden gelöscht.' });
}

function resetSheet() {
  const sheet = getSheet_();
  sheet.clear();
  ensureHeader_(sheet);
}

function testConnection() {
  const sheet = getSheet_();
  Logger.log('Verbindung erfolgreich.');
  Logger.log('Tabellenblatt: ' + sheet.getName());
  Logger.log('Zeilen: ' + sheet.getLastRow());
  Logger.log('Spalten: ' + sheet.getLastColumn());
}

function isEmptyRow_(row) {
  return row.every(function (cell) { return cell === '' || cell === null; });
}

function path_(obj, path) {
  if (!obj || !path) return '';
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length; i++) {
    if (current === null || current === undefined) return '';
    current = current[parts[i]];
  }
  return current === null || current === undefined ? '' : current;
}

function pick_(values) {
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (value === null || value === undefined) continue;
    if (Array.isArray(value)) {
      const joined = value.filter(Boolean).join(', ');
      if (joined) return joined;
      continue;
    }
    const text = String(value).trim();
    if (text) return text;
  }
  return '';
}

function formatDate_(value) {
  if (!value) return '';
  try {
    return Utilities.formatDate(new Date(value), Session.getScriptTimeZone(), 'HH:mm:ss dd.MM.yyyy');
  } catch (err) {
    return String(value);
  }
}

function slug_(s) {
  return String(s || 'gruppe')
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'gruppe';
}

function jsonOutput_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function jsonp_(e, obj) {
  const callback = e && e.parameter ? e.parameter.callback : '';
  const json = JSON.stringify(obj);
  if (callback) {
    return ContentService.createTextOutput(callback + '(' + json + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return jsonOutput_(obj);
}
