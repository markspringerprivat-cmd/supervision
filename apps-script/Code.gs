// Apps Script für die Supervisions-Webseite.
// Diese Version nutzt bewusst openByUrl(), weil openById() bei einigen kopierten IDs Probleme machen kann.
// Falls du eine andere Tabelle verwendest, ersetze nur diese vollständige Google-Sheets-URL.
const SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1egAveeEIyXdI9nC4yQfZCtUUWqn8-byODELn4mvuzYQ/edit?pli=1&gid=0#gid=0';
const SHEET_NAME = 'Ergebnisse';
const FEEDBACK_SHEET_NAME = 'Manometer Feedback';

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
  'Rohdaten JSON',
  'Präsentation JSON',
  'Präsentation Version',
  'Präsentation aktualisiert'
];

const COL_GROUP_ID = 28;
const COL_RAW_JSON = 29;
const COL_PRESENTATION_JSON = 30;
const COL_PRESENTATION_VERSION = 31;
const COL_PRESENTATION_UPDATED = 32;


function getSpreadsheet_() {
  // Robustere Tabellen-Erkennung:
  // 1. Wenn dieses Apps Script an das Google Sheet gebunden ist, nutze direkt diese aktive Tabelle.
  // 2. Falls es ein Standalone-Script ist, nutze SPREADSHEET_URL.
  // Dadurch scheitert Manometer nicht mehr an einer alten/falschen kopierten Tabellen-ID.
  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (err) {}

  if (!SPREADSHEET_URL || SPREADSHEET_URL.indexOf('docs.google.com/spreadsheets') === -1) {
    throw new Error('SPREADSHEET_URL ist nicht korrekt eingetragen. Bitte die vollständige Google-Sheet-URL einfügen oder das Script direkt über Erweiterungen > Apps Script aus dem Ziel-Sheet öffnen.');
  }
  try {
    return SpreadsheetApp.openByUrl(SPREADSHEET_URL);
  } catch (err) {
    throw new Error('Die hinterlegte SPREADSHEET_URL konnte nicht geöffnet werden: ' + err.message + ' | Lösung: Code.gs über Erweiterungen > Apps Script direkt aus der Ziel-Tabelle öffnen oder SPREADSHEET_URL durch die echte URL deiner Ergebnis-Tabelle ersetzen.');
  }
}


const FEEDBACK_HEADERS = [
  'Zeitpunkt',
  'Geräte-ID',
  'Gruppen-ID',
  'Gruppenname',
  'Plenum / Gewissenhaftigkeit',
  'Fallberatungsarten',
  'Phasenverständnis',
  'Rollenperspektiven',
  'Technische Umsetzung',
  'Bedienbarkeit',
  'Präsentationsgestaltung',
  'Präsentationsnutzen',
  'Bearbeitungsmöglichkeiten',
  'Verbesserungen pro Frage JSON',
  'Allgemeines Lob / Kritik / Anregungen',
  '10 gewählt wegen Pflichtkritik?',
  'ChatGPT / LLM verwendet?',
  'LLM Details',
  'Rohdaten JSON'
];

const MANOMETER_QUESTIONS = [
  { key: 'presentationPressure', category: 'Startfrage', label: 'Die Aussicht auf eine zufällige Präsentation im Plenum hat dazu geführt, dass die Aufgaben gewissenhafter bearbeitet wurden.' },
  { key: 'caseConsultation', category: 'Inhaltliches Verständnis', label: 'Ich kenne verschiedene Arten der Fallberatung.' },
  { key: 'phaseUnderstanding', category: 'Inhaltliches Verständnis', label: 'Ich verstehe die Phasen einer strukturierten Gruppensupervision.' },
  { key: 'rolePerspective', category: 'Inhaltliches Verständnis', label: 'Ich kann die Perspektiven der verschiedenen Rollen besser einordnen.' },
  { key: 'technicalClarity', category: 'Technische Umsetzung und Bedienbarkeit', label: 'Die technische Umsetzung der Anwendung war verständlich.' },
  { key: 'usability', category: 'Technische Umsetzung und Bedienbarkeit', label: 'Die Anwendung war gut bedienbar.' },
  { key: 'presentationDesign', category: 'Allgemeine Gestaltung der Präsentation', label: 'Die Gestaltung der Präsentation war übersichtlich und ansprechend.' },
  { key: 'presentationUsefulness', category: 'Allgemeine Gestaltung der Präsentation', label: 'Die erstellte Präsentation eignet sich gut, um Ergebnisse im Plenum vorzustellen.' },
  { key: 'creativeOptions', category: 'Allgemeine Gestaltung der Präsentation', label: 'Die Bearbeitungsmöglichkeiten der Präsentation waren hilfreich.' }
];

function getSheet_() {
  const ss = getSpreadsheet_();
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
    if (action === 'manometerfeedback' || action === 'manometer_feedback' || action === 'feedback') return saveFeedback_(body);
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
    if (action === 'manometerfeedbacklist' || action === 'manometer_feedback_list' || action === 'feedback_list') return listFeedback_(e);
    if (action === 'manometerfeedbacksave' || action === 'manometer_feedback_save' || action === 'savefeedback') return saveFeedbackGet_(e);
    if (action === 'ping') {
      let spreadsheetName = '';
      try { spreadsheetName = getSpreadsheet_().getName(); } catch (err) { spreadsheetName = 'FEHLER: ' + err.message; }
      return jsonp_(e, { ok: true, message: 'Apps Script läuft.', sheetName: SHEET_NAME, manometer: true, feature: 'manometer-v6-cards', spreadsheetName: spreadsheetName });
    }
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



function normalizePresentationState_(cfg, data) {
  cfg = isObject_(cfg) ? cfg : {};
  const assignments = isObject_(data.assignments) ? data.assignments : {};
  const p2 = isObject_(data.p2) ? data.p2 : {};
  const p3 = isObject_(data.p3) ? data.p3 : {};
  const p4 = isObject_(data.p4) ? data.p4 : {};
  const p5 = isObject_(data.p5) ? data.p5 : {};
  const p6 = isObject_(data.p6) ? data.p6 : {};
  const values = Object.assign({
    groupName: textValue_(data.groupName),
    timestamp: textValue_(data.timestamp),
    supervisor: textValue_(assignments.supervisor),
    schulleitung: textValue_(assignments.schulleitung),
    lehrkraftA: textValue_(assignments['lehrkraft-a'] || assignments.lehrkraftA),
    lehrkraftB: textValue_(assignments['lehrkraft-b'] || assignments.lehrkraftB),
    p2slProblems: textValue_(p2.slProbleme), p2slFeelings: textValue_(p2.slGefuehle), p2slWishes: textValue_(p2.slWuensche),
    p2aProblems: textValue_(p2.aProbleme), p2aFeelings: textValue_(p2.aGefuehle), p2aWishes: textValue_(p2.aWuensche),
    p2bProblems: textValue_(p2.bProbleme), p2bFeelings: textValue_(p2.bGefuehle), p2bWishes: textValue_(p2.bWuensche),
    p3zielSL: textValue_(p3.zielSL), p3zielA: textValue_(p3.zielA), p3zielB: textValue_(p3.zielB), p3gemeinsam: textValue_(p3.gemeinsamkeiten), p3ziel: textValue_(p3.gemeinsamesZiel),
    p4kritik: textValue_(p4.kritik), p4absprachen: textValue_(p4.absprachen),
    p5zustimmung: textValue_(p5.zustimmung), p6prax: textValue_(p6.praxistauglichkeit), p6support: textValue_(p6.unterstuetzung), p6steps: textValue_(p6.umsetzung)
  }, isObject_(cfg.values) ? cfg.values : {});
  Object.keys(values).forEach(function(k){ values[k] = textValue_(values[k]); });
  cfg.values = values;
  if (!isObject_(cfg.settings)) cfg.settings = {};
  delete cfg.settings.backgroundImage;
  if (!isObject_(cfg.text)) cfg.text = isObject_(cfg.textOverrides) ? cfg.textOverrides : {};
  if (!isObject_(cfg.layout)) cfg.layout = {};
  if (!Array.isArray(cfg.textboxes)) cfg.textboxes = Array.isArray(cfg.extras) ? cfg.extras : [];
  if (!Array.isArray(cfg.stickers)) cfg.stickers = [];
  return cfg;
}

function extractPresentationConfig_(data) {
  const cfg = {};
  const v6 = isObject_(data.presentationV6) ? data.presentationV6 : {};
  const pc = isObject_(data.presentationConfig) ? data.presentationConfig : {};

  const settings = Object.assign({},
    isObject_(pc.settings) ? pc.settings : {},
    isObject_(v6.settings) ? v6.settings : {},
    isObject_(data.presentationSettings) ? data.presentationSettings : {}
  );
  delete settings.backgroundImage;

  const values = Object.assign({},
    isObject_(pc.values) ? pc.values : {},
    isObject_(v6.values) ? v6.values : {},
    isObject_(data.presentationValues) ? data.presentationValues : {}
  );

  const text = Object.assign({},
    isObject_(pc.text) ? pc.text : {},
    isObject_(pc.textOverrides) ? pc.textOverrides : {},
    isObject_(v6.text) ? v6.text : {},
    isObject_(v6.textOverrides) ? v6.textOverrides : {},
    isObject_(data.presentationTextOverrides) ? data.presentationTextOverrides : {}
  );

  const layout = Object.assign({},
    isObject_(pc.layout) ? pc.layout : {},
    isObject_(v6.layout) ? v6.layout : {},
    isObject_(data.presentationLayout) ? data.presentationLayout : {}
  );

  const stableLayout = Object.assign({},
    isObject_(pc.stableLayout) ? pc.stableLayout : {},
    isObject_(v6.stableLayout) ? v6.stableLayout : {},
    isObject_(data.presentationStableLayout) ? data.presentationStableLayout : {}
  );

  const textboxes = firstArray_(pc.textboxes, pc.extras, v6.textboxes, v6.extras, data.presentationExtras);
  const stickers = firstArray_(pc.stickers, v6.stickers, data.presentationStickers);

  return stripLargePresentationData_(normalizePresentationState_({
    version: 7,
    savedAt: new Date().toISOString(),
    settings: settings,
    values: values,
    text: text,
    textOverrides: text,
    layout: layout,
    stableLayout: stableLayout,
    textboxes: textboxes,
    extras: textboxes,
    stickers: stickers
  }, data));
}

function isObject_(v) {
  return v && typeof v === 'object' && !Array.isArray(v);
}

function firstArray_() {
  for (let i = 0; i < arguments.length; i++) {
    if (Array.isArray(arguments[i])) return arguments[i];
  }
  return [];
}

function stripLargePresentationData_(value) {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') {
    if (/^data:image\//i.test(value)) return '';
    if (/base64,/i.test(value) && value.length > 5000) return '';
    return value.length > 100000 ? value.substring(0, 100000) : value;
  }
  if (Array.isArray(value)) {
    return value.slice(0, 500).map(stripLargePresentationData_);
  }
  if (typeof value === 'object') {
    const out = {};
    Object.keys(value).forEach(function (key) {
      if (/backgroundImage|bgImage|imageData|dataUrl|base64|snapshot|history|undo|localStorage/i.test(key)) return;
      out[key] = stripLargePresentationData_(value[key]);
    });
    return out;
  }
  return value;
}

function safeJson_(value) {
  try {
    return JSON.stringify(value || {});
  } catch (err) {
    return '{}';
  }
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
  const presentationConfig = extractPresentationConfig_(data);
  data.presentationConfig = presentationConfig;
  data.presentationV6 = presentationConfig;

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
    safeJson_(data),
    safeJson_(presentationConfig),
    String(presentationConfig.version || 7),
    new Date()
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
  let presentation = {};
  const rawCandidateNew = row[COL_RAW_JSON - 1];
  const rawCandidateOld = row[COL_GROUP_ID - 1];
  const presentationCandidate = row[COL_PRESENTATION_JSON - 1];
  try { raw = JSON.parse(rawCandidateNew || rawCandidateOld || '{}'); } catch (err) { raw = {}; }
  try { presentation = JSON.parse(presentationCandidate || '{}'); } catch (err) { presentation = {}; }
  if (!isObject_(presentation) || Object.keys(presentation).length === 0) presentation = extractPresentationConfig_(raw);
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
    raw: raw,
    presentationJson: presentation,
    presentationConfig: presentation,
    presentationSettings: presentation.settings || raw.presentationSettings || (raw.presentationConfig && raw.presentationConfig.settings) || null,
    presentationExtras: presentation.extras || presentation.textboxes || raw.presentationExtras || (raw.presentationConfig && raw.presentationConfig.extras) || [],
    presentationStickers: presentation.stickers || raw.presentationStickers || (raw.presentationConfig && raw.presentationConfig.stickers) || [],
    presentationStableLayout: presentation.stableLayout || raw.presentationStableLayout || (raw.presentationConfig && raw.presentationConfig.stableLayout) || {},
    presentationLayout: presentation.layout || raw.presentationLayout || (raw.presentationConfig && raw.presentationConfig.layout) || {},
    presentationTextOverrides: presentation.textOverrides || presentation.text || raw.presentationTextOverrides || (raw.presentationConfig && raw.presentationConfig.textOverrides) || {},
    presentationV6: presentation,
    presentationValues: presentation.values || raw.presentationValues || (raw.presentationV6 && raw.presentationV6.values) || {}
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


function getFeedbackSheet_() {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(FEEDBACK_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(FEEDBACK_SHEET_NAME);
  ensureFeedbackHeader_(sheet);
  return sheet;
}

function ensureFeedbackHeader_(sheet) {
  sheet.getRange(1, 1, 1, FEEDBACK_HEADERS.length).setValues([FEEDBACK_HEADERS]);
  sheet.setFrozenRows(1);
}

function saveFeedback_(body) {
  const data = (body && body.feedback && typeof body.feedback === 'object') ? body.feedback : ((body && body.data && typeof body.data === 'object') ? body.data : (body || {}));
  return jsonOutput_(saveFeedbackData_(data));
}

function saveFeedbackGet_(e) {
  const p = (e && e.parameter) || {};
  let scores = {};
  let improvements = {};
  try { scores = p.scores ? JSON.parse(p.scores) : {}; } catch (err) { scores = {}; }
  try { improvements = p.improvements ? JSON.parse(p.improvements) : {}; } catch (err) { improvements = {}; }
  const data = {
    deviceId: p.deviceId || p.device || p.browserId || '',
    groupId: p.groupId || p.g || p.groupToken || p.token || '',
    groupName: p.groupName || '',
    scores: scores,
    improvements: improvements,
    generalFeedback: p.generalFeedback || p.general || p.feedbackText || '',
    avoidCriticism: p.avoidCriticism || '',
    llmUsed: p.llmUsed || '',
    llmDetails: p.llmDetails || '',
    createdAt: p.createdAt || new Date().toISOString()
  };
  const result = saveFeedbackData_(data);
  return jsonp_(e, result);
}

function saveFeedbackData_(data) {
  const sheet = getFeedbackSheet_();
  data = (data && typeof data === 'object') ? data : {};
  const deviceId = textValue_(data.deviceId || data.device || data.browserId);
  if (!deviceId) return { ok: false, type: 'manometerFeedbackSave', feature: 'manometer-v6-cards', error: 'Keine Geräte-ID übermittelt.' };
  const duplicateRow = findFeedbackRowByDeviceId_(sheet, deviceId);
  if (duplicateRow >= 2) {
    return { ok: false, duplicate: true, type: 'manometerFeedbackSave', feature: 'manometer-v6-cards', error: 'Von diesem Gerät wurde bereits Feedback abgegeben.', rowNumber: duplicateRow };
  }
  const scores = isObject_(data.scores) ? data.scores : data;
  const improvements = isObject_(data.improvements) ? data.improvements : {};
  const row = [
    new Date(),
    deviceId,
    textValue_(data.groupId || data.g || data.groupToken || data.token),
    textValue_(data.groupName),
    numberFeedback_(scores.presentationPressure),
    numberFeedback_(scores.caseConsultation),
    numberFeedback_(scores.phaseUnderstanding),
    numberFeedback_(scores.rolePerspective),
    numberFeedback_(scores.technicalClarity),
    numberFeedback_(scores.usability),
    numberFeedback_(scores.presentationDesign),
    numberFeedback_(scores.presentationUsefulness),
    numberFeedback_(scores.creativeOptions),
    safeJson_(improvements),
    textValue_(data.generalFeedback || data.general || data.feedbackText),
    textValue_(data.avoidCriticism),
    textValue_(data.llmUsed),
    textValue_(data.llmDetails),
    safeJson_(data)
  ];
  sheet.appendRow(row);
  SpreadsheetApp.flush();
  return { ok: true, type: 'manometerFeedbackSave', feature: 'manometer-v6-cards', message: 'Manometer-Feedback gespeichert.', rowNumber: sheet.getLastRow() };
}

function findFeedbackRowByDeviceId_(sheet, deviceId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;
  const values = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
  const needle = String(deviceId || '').trim();
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0] || '').trim() === needle) return i + 2;
  }
  return 0;
}

function normalizeGroupKey_(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

function listFeedback_(e) {
  const sheet = getFeedbackSheet_();
  const values = sheet.getDataRange().getValues();
  const entries = [];
  const availableGroupIds = [];
  for (let r = 1; r < values.length; r++) {
    const row = values[r];
    if (isEmptyRow_(row)) continue;
    const entry = feedbackRowToEntry_(row, r + 1);
    entries.push(entry);
    const rawGroupId = String(entry.groupId || '').trim();
    if (rawGroupId && availableGroupIds.indexOf(rawGroupId) === -1) availableGroupIds.push(rawGroupId);
  }
  return jsonp_(e, {
    ok: true,
    type: 'manometerFeedbackList',
    feature: 'manometer-v6-cards',
    anonymous: true,
    groupIndependent: true,
    entries: entries,
    summary: summarizeFeedback_(entries),
    questions: MANOMETER_QUESTIONS,
    totalRows: entries.length,
    availableGroupIds: availableGroupIds.slice(0, 50)
  });
}

function feedbackRowToEntry_(row, rowNumber) {
  let improvements = {};
  let raw = {};
  try { improvements = JSON.parse(row[13] || '{}'); } catch (err) { improvements = {}; }
  try { raw = JSON.parse(row[18] || '{}'); } catch (err) { raw = {}; }
  return {
    id: rowNumber,
    rowNumber: rowNumber,
    timestamp: formatDate_(row[0]),
    groupId: row[2] || '',
    groupName: row[3] || '',
    scores: {
      presentationPressure: numberFeedback_(row[4]),
      caseConsultation: numberFeedback_(row[5]),
      phaseUnderstanding: numberFeedback_(row[6]),
      rolePerspective: numberFeedback_(row[7]),
      technicalClarity: numberFeedback_(row[8]),
      usability: numberFeedback_(row[9]),
      presentationDesign: numberFeedback_(row[10]),
      presentationUsefulness: numberFeedback_(row[11]),
      creativeOptions: numberFeedback_(row[12])
    },
    improvements: improvements,
    generalFeedback: row[14] || '',
    avoidCriticism: row[15] || '',
    llmUsed: row[16] || '',
    llmDetails: row[17] || '',
    raw: raw
  };
}

function summarizeFeedback_(entries) {
  const summary = {};
  MANOMETER_QUESTIONS.forEach(function(q){
    const values = entries.map(function(e){ return numberFeedback_(e.scores && e.scores[q.key]); }).filter(function(n){ return n !== '' && !isNaN(n); });
    const avg = values.length ? values.reduce(function(a,b){return a+b;}, 0) / values.length : null;
    const sorted = values.slice().sort(function(a,b){ return a-b; });
    const mid = Math.floor(sorted.length / 2);
    const med = sorted.length ? (sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2) : null;
    const counts = {};
    for (let i = 1; i <= 10; i++) counts[i] = 0;
    values.forEach(function(v){ if (counts[v] !== undefined) counts[v]++; });
    const improvements = entries.map(function(e){ return e.improvements && e.improvements[q.key]; }).filter(function(t){ return textValue_(t); });
    summary[q.key] = { label: q.label, category: q.category, count: values.length, average: avg, median: med, values: values, counts: counts, improvements: improvements };
  });
  return summary;
}

function numberFeedback_(value) {
  const n = Number(value);
  if (isNaN(n)) return '';
  return Math.max(1, Math.min(10, Math.round(n)));
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

function textValue_(value) {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.map(textValue_).filter(Boolean).join(', ');
  if (typeof value === 'object') {
    if (value.text !== undefined) return textValue_(value.text);
    if (value.value !== undefined) return textValue_(value.value);
    if (value.html !== undefined) return textValue_(value.html);
    if (value.content !== undefined) return textValue_(value.content);
    return '';
  }
  return String(value).trim();
}

function pick_(values) {
  for (let i = 0; i < values.length; i++) {
    const text = textValue_(values[i]);
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
