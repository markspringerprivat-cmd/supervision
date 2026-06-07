const SPREADSHEET_ID = '1egAveElyXdI9nC4yQfZCtUUwqn8-byODELn4mvuzY';
const SHEET_NAME = 'Ergebnisse';
const ADMIN_PASSWORD = 'HIER_DEIN_PASSWORT_EINTRAGEN';

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
  'Rohdaten JSON'
];

function getSheet_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
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
  let body = {};
  try {
    body = JSON.parse(e.postData.contents || '{}');
  } catch (err) {
    return jsonOutput_({ ok: false, error: 'Ungültiges JSON: ' + err.message });
  }

  if (body.action === 'deleteAll') return deleteAll_(body);
  if (body.action === 'deleteRow') return deleteRowPost_(body);

  return saveEntry_(body);
}

function saveEntry_(body) {
  const sheet = getSheet_();
  const data = normalizeSubmittedData_(body);
  const row = buildRow_(data);
  sheet.appendRow(row);
  return jsonOutput_({ ok: true, message: 'Ergebnis gespeichert.', groupName: row[1] });
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
  const groupName = pick_([
    data.groupName,
    [supervisorName, schulleitungName, lehrkraftAName, lehrkraftBName].filter(Boolean).join(', '),
    data.groupId,
    'Unbenannte Gruppe'
  ]);

  return [
    new Date(),
    groupName,
    supervisorName,
    schulleitungName,
    lehrkraftAName,
    lehrkraftBName,
    pick_([path_(data, 'p2.slProbleme'), path_(data, 'p2.slBeobachtung'), path_(data, 'prep.schulleitung.beobachtung')]),
    pick_([path_(data, 'p2.slGefuehle'), path_(data, 'prep.schulleitung.gefuehle')]),
    pick_([path_(data, 'p2.slWuensche'), path_(data, 'prep.schulleitung.wuensche')]),
    pick_([path_(data, 'p2.aProbleme'), path_(data, 'p2.aPerspektive'), path_(data, 'prep.lehrkraft-a.perspektive')]),
    pick_([path_(data, 'p2.aGefuehle'), path_(data, 'prep.lehrkraft-a.gefuehle')]),
    pick_([path_(data, 'p2.aWuensche'), path_(data, 'prep.lehrkraft-a.wuensche')]),
    pick_([path_(data, 'p2.bProbleme'), path_(data, 'p2.bPerspektive'), path_(data, 'prep.lehrkraft-b.perspektive')]),
    pick_([path_(data, 'p2.bGefuehle'), path_(data, 'prep.lehrkraft-b.gefuehle')]),
    pick_([path_(data, 'p2.bWuensche'), path_(data, 'prep.lehrkraft-b.wuensche')]),
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
    JSON.stringify(data)
  ];
}

function doGet(e) {
  const action = String(e.parameter.action || 'list').toLowerCase();
  if (action === 'list') return listEntries_(e);
  if (action === 'deleteall') return deleteAllGet_(e);
  if (action === 'delete') return deleteRowGet_(e);
  if (action === 'ping') return jsonp_(e, { ok: true, message: 'Apps Script läuft.' });
  return jsonp_(e, { ok: true, message: 'Apps Script läuft.', hint: 'Nutze ?action=list zum Auslesen.' });
}

function listEntries_(e) {
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  const entries = [];
  for (let r = 1; r < values.length; r++) {
    const row = values[r];
    if (isEmptyRow_(row)) continue;
    entries.push(rowToEntry_(row, r + 1));
  }
  return jsonp_(e, { ok: true, entries: entries });
}

function rowToEntry_(row, rowNumber) {
  let raw = {};
  try { raw = JSON.parse(row[27] || '{}'); } catch (err) { raw = {}; }
  const reconstructed = {
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
  return { id: rowNumber, rowNumber: rowNumber, timestamp: formatDate_(row[0]), groupName: row[1] || '', data: reconstructed };
}


function deleteAllGet_(e) {
  const password = e.parameter.password || '';
  if (password !== ADMIN_PASSWORD) return jsonp_(e, { ok: false, error: 'Falsches Passwort.' });
  const sheet = getSheet_();
  if (sheet.getLastRow() > 1) sheet.deleteRows(2, sheet.getLastRow() - 1);
  ensureHeader_(sheet);
  return jsonp_(e, { ok: true, message: 'Alle Ergebnisse wurden gelöscht.' });
}

function deleteRowGet_(e) {
  const password = e.parameter.password || '';
  const rowNumber = Number(e.parameter.rowNumber || e.parameter.id || 0);
  if (password !== ADMIN_PASSWORD) return jsonp_(e, { ok: false, error: 'Falsches Passwort.' });
  if (!rowNumber || rowNumber < 2) return jsonp_(e, { ok: false, error: 'Ungültige Zeile.' });
  const sheet = getSheet_();
  sheet.deleteRow(rowNumber);
  return jsonp_(e, { ok: true, message: 'Eintrag gelöscht.' });
}

function deleteRowPost_(body) {
  const password = body.password || '';
  const rowNumber = Number(body.rowNumber || body.id || 0);
  if (password !== ADMIN_PASSWORD) return jsonOutput_({ ok: false, error: 'Falsches Passwort.' });
  if (!rowNumber || rowNumber < 2) return jsonOutput_({ ok: false, error: 'Ungültige Zeile.' });
  const sheet = getSheet_();
  sheet.deleteRow(rowNumber);
  return jsonOutput_({ ok: true, message: 'Eintrag gelöscht.' });
}

function deleteAll_(body) {
  if (body.password !== ADMIN_PASSWORD) return jsonOutput_({ ok: false, error: 'Falsches Passwort.' });
  const sheet = getSheet_();
  if (sheet.getLastRow() > 1) sheet.deleteRows(2, sheet.getLastRow() - 1);
  ensureHeader_(sheet);
  return jsonOutput_({ ok: true, message: 'Alle Ergebnisse wurden gelöscht.' });
}

function resetSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  sheet.clear();
  ensureHeader_(sheet);
}

function testConnection() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  Logger.log(ss.getName());
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

function jsonOutput_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function jsonp_(e, obj) {
  const callback = e.parameter.callback;
  const json = JSON.stringify(obj);
  if (callback) {
    return ContentService.createTextOutput(callback + '(' + json + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return jsonOutput_(obj);
}
