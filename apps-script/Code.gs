// Apps Script für die Supervisions-Webseite.
// Diese Version nutzt bewusst openByUrl(), weil openById() bei einigen kopierten IDs Probleme machen kann.
// Falls du eine andere Tabelle verwendest, ersetze nur diese vollständige Google-Sheets-URL.
const SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1egAveeEIyXdI9nC4yQfZCtUUWqn8-byODELn4mvuzYQ/edit?pli=1&gid=0#gid=0';
const SHEET_NAME = 'Ergebnisse';
const FEEDBACK_SHEET_NAME = 'Manometer Feedback';
const DEVICE_REGISTRY_SHEET_NAME = 'Manometer Geräte';
const DEVICE_REGISTRY_HEADERS = ['Geräte-ID', 'Zeitpunkt', 'Gruppen-ID', 'Gruppenname', 'Rolle', 'Zugewiesener Name'];
const MANOMETER_ADMIN_PASSWORD = 'Mark123';

const SPRINT_HIGHSCORE_SHEET_NAME = 'Supervisionssprint Highscores';
const SPRINT_HIGHSCORE_HEADERS = ['Zeitpunkt','Gruppen-ID','Geräte-ID','Name','Highscore','Gelöste Probleme','Rohdaten JSON'];

const GROUP_SESSION_SHEET_NAME = 'Gruppen Sessions';
const GROUP_SESSION_HEADERS = ['Zeitpunkt', 'Gruppen-ID', 'Gruppenname', 'Status', 'Primärgerät-ID', 'Gruppengröße', 'Aktualisiert'];
const GROUP_MEMBER_SHEET_NAME = 'Gruppen Mitglieder';
const GROUP_MEMBER_HEADERS = ['Zeitpunkt', 'Gruppen-ID', 'Geräte-ID', 'Name', 'Gerätetyp', 'Rolle', 'Primärgerät', 'Aktualisiert'];


const GROUP_REGISTRY_SHEET_NAME = 'Gruppen Registry';
const GROUP_REGISTRY_HEADERS = ['Zeitpunkt', 'Gruppen-ID', 'Gruppenname', 'Gruppengröße', 'Teilnehmende JSON', 'Zuweisungen JSON', 'Aktualisiert'];


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
  'Positive Rückmeldung zur Schulleitung',
  'Positive Rückmeldung zu Lehrkraft A',
  'Positive Rückmeldung zu Lehrkraft B',
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

const COL_GROUP_ID = 30;
const COL_RAW_JSON = 31;
const COL_PRESENTATION_JSON = 32;
const COL_PRESENTATION_VERSION = 33;
const COL_PRESENTATION_UPDATED = 34;


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


const FEEDBACK_PARTICIPATION_SHEET_NAME = 'Manometer Teilnahmen';
const FEEDBACK_PARTICIPATION_HEADERS = ['Zeitpunkt','Teilnahme-ID','Geräte-ID','Gruppen-ID','Status','Feedback-Zeile','Aktualisiert'];

const FEEDBACK_HEADERS = [
  'Zeitpunkt',
  'Geräte-ID',
  'Gruppen-ID',
  'Gruppenname',
  'Verständnis: Was ist Supervision?',
  'Verständnis: Ablauf von Supervision',
  'Vorteile von Supervision',
  'Zukünftige Nutzung / kollegiale Fallberatung',
  'Supervision in Schule wichtig',
  'Präsentation nachvollziehbar',
  'Web-App technisch verständlich',
  'Web-App inhaltlich verständlich',
  'Simulation: besseres Supervisionsverständnis',
  'Verbesserungen pro Frage JSON',
  'Allgemeines Lob / Kritik / Anregungen',
  'Allgemeines Lob',
  'Allgemeine Kritik',
  'Allgemeine Anregungen',
  'Zufallspräsentation steigerte Motivation?',
  '10 gewählt wegen Pflichtkritik?',
  'ChatGPT / LLM verwendet?',
  'LLM Details',
  'Rohdaten JSON'
];

const MANOMETER_QUESTIONS = [
  { key: 'supervisionUnderstanding', category: 'Verständnis von Supervision', label: 'Ich habe ein Verständnis dafür entwickelt, was Supervision ist.' },
  { key: 'supervisionProcess', category: 'Verständnis von Supervision', label: 'Ich habe eine Vorstellung davon entwickelt, wie eine Supervision verläuft.' },
  { key: 'supervisionBenefits', category: 'Verständnis von Supervision', label: 'Ich kenne die Vorteile einer Supervision.' },
  { key: 'futureSupervisionUse', category: 'Transfer und Relevanz', label: 'Ich kann mir vorstellen, in Zukunft auf Supervision, insbesondere im Rahmen kollegialer Fallberatung, zurückzugreifen.' },
  { key: 'schoolSupervisionImportance', category: 'Transfer und Relevanz', label: 'Ich halte Supervision in der Schule für wichtig.' },
  { key: 'presentationUnderstandable', category: 'Technische und didaktische Umsetzung', label: 'Die Präsentation war nachvollziehbar.' },
  { key: 'webAppTechnicalUnderstandable', category: 'Technische und didaktische Umsetzung', label: 'Die Web-App war technisch verständlich.' },
  { key: 'webAppContentUnderstandable', category: 'Technische und didaktische Umsetzung', label: 'Die Web-App war inhaltlich verständlich.' },
  { key: 'simulationUnderstanding', category: 'Technische und didaktische Umsetzung', label: 'Die Simulation hat zu einem besseren Verständnis von Supervision beigetragen.' }
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
    if (action === 'resetmanometerdeviceids' || action === 'reset_manometer_device_ids' || action === 'resetfeedbackdevices') return resetManometerDeviceIdsPost_(body);
    if (action === 'deletemanometerfeedbackall' || action === 'delete_manometer_feedback_all' || action === 'clear_manometer_feedback' || action === 'manometerfeedbackdeleteall') return deleteManometerFeedbackAllPost_(body);
    if (action === 'manometeradminstatus' || action === 'manometer_admin_status') return manometerAdminStatusPost_(body);
    if (action === 'manometerfeedbackstatus' || action === 'manometer_feedback_status' || action === 'checkfeedback') return manometerFeedbackStatusPost_(body);
    if (action === 'savesprinthighscore' || action === 'save_sprint_highscore' || action === 'supervisionssprinthighscore') return saveSprintHighscorePost_(body);
    if (action === 'deletesprinthighscoresall' || action === 'delete_sprint_highscores_all' || action === 'clear_sprint_highscores') return deleteSprintHighscoresAllPost_(body);
    if (action === 'groupprogress' || action === 'group_progress') return groupProgressPost_(body);
    if (action === 'savegrouppresentation' || action === 'save_group_presentation' || action === 'updategrouppresentation') return saveGroupPresentationPost_(body);
    if (action === 'checkgroupexists' || action === 'check_group_exists') return checkGroupExistsPost_(body);
    if (action === 'registergroup' || action === 'register_group') return registerGroupPost_(body);
    if (action === 'registerdevicegroup' || action === 'register_device_group') return registerDeviceGroupPost_(body);
    if (action === 'resolvedevicegroup' || action === 'resolve_device_group') return resolveDeviceGroupPost_(body);
    if (action === 'listgroups' || action === 'list_groups') return listGroupsPost_(body);
    if (action === 'deletemainresultsall' || action === 'delete_main_results_all' || action === 'clear_results' || action === 'deleteallresults') return deleteMainResultsAllPost_(body);
    if (action === 'deletegroupsall' || action === 'delete_groups_all' || action === 'clear_groups') return deleteGroupsAllPost_(body);
    if (action === 'deletegroup' || action === 'delete_group') return deleteGroupPost_(body);
    if (action === 'creategroupsession' || action === 'create_group_session') return createGroupSessionPost_(body);
    if (action === 'joingroupsession' || action === 'join_group_session') return joinGroupSessionPost_(body);
    if (action === 'listgroupmembers' || action === 'list_group_members') return listGroupMembersPost_(body);
    if (action === 'assignrolestomembers' || action === 'assign_roles_to_members') return assignRolesToMembersPost_(body);
    if (action === 'resolveassignedrolefordevice' || action === 'resolve_assigned_role_for_device') return resolveAssignedRoleForDevicePost_(body);
    if (action === 'removegroupmember' || action === 'remove_group_member') return removeGroupMemberPost_(body);
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
    if (action === 'resetmanometerdeviceids' || action === 'reset_manometer_device_ids' || action === 'resetfeedbackdevices') return resetManometerDeviceIdsGet_(e);
    if (action === 'deletemanometerfeedbackall' || action === 'delete_manometer_feedback_all' || action === 'clear_manometer_feedback' || action === 'manometerfeedbackdeleteall') return deleteManometerFeedbackAllGet_(e);
    if (action === 'manometeradminstatus' || action === 'manometer_admin_status') return manometerAdminStatusGet_(e);
    if (action === 'manometerfeedbackstatus' || action === 'manometer_feedback_status' || action === 'checkfeedback') return manometerFeedbackStatusGet_(e);
    if (action === 'savesprinthighscore' || action === 'save_sprint_highscore' || action === 'supervisionssprinthighscore') return saveSprintHighscoreGet_(e);
    if (action === 'deletesprinthighscoresall' || action === 'delete_sprint_highscores_all' || action === 'clear_sprint_highscores') return deleteSprintHighscoresAllGet_(e);
    if (action === 'groupprogress' || action === 'group_progress') return groupProgressGet_(e);
    if (action === 'savegrouppresentation' || action === 'save_group_presentation' || action === 'updategrouppresentation') return jsonp_(e, { ok:false, type:'saveGroupPresentation', feature:'manometer-highscore-best-speed-v95', error:'Diese Aktion benötigt POST, damit die Präsentationsdaten vollständig gespeichert werden.' });
    if (action === 'checkgroupexists' || action === 'check_group_exists') return checkGroupExistsGet_(e);
    if (action === 'registergroup' || action === 'register_group') return registerGroupGet_(e);
    if (action === 'registerdevicegroup' || action === 'register_device_group') return registerDeviceGroupGet_(e);
    if (action === 'resolvedevicegroup' || action === 'resolve_device_group') return resolveDeviceGroupGet_(e);
    if (action === 'listgroups' || action === 'list_groups') return listGroupsGet_(e);
    if (action === 'deletemainresultsall' || action === 'delete_main_results_all' || action === 'clear_results' || action === 'deleteallresults') return deleteMainResultsAllGet_(e);
    if (action === 'deletegroupsall' || action === 'delete_groups_all' || action === 'clear_groups') return deleteGroupsAllGet_(e);
    if (action === 'deletegroup' || action === 'delete_group') return deleteGroupGet_(e);
    if (action === 'creategroupsession' || action === 'create_group_session') return createGroupSessionGet_(e);
    if (action === 'joingroupsession' || action === 'join_group_session') return joinGroupSessionGet_(e);
    if (action === 'listgroupmembers' || action === 'list_group_members') return listGroupMembersGet_(e);
    if (action === 'assignrolestomembers' || action === 'assign_roles_to_members') return assignRolesToMembersGet_(e);
    if (action === 'resolveassignedrolefordevice' || action === 'resolve_assigned_role_for_device') return resolveAssignedRoleForDeviceGet_(e);
    if (action === 'removegroupmember' || action === 'remove_group_member') return removeGroupMemberGet_(e);
    if (action === 'ping') {
      let spreadsheetName = '';
      try { spreadsheetName = getSpreadsheet_().getName(); } catch (err) { spreadsheetName = 'FEHLER: ' + err.message; }
      return jsonp_(e, { ok: true, message: 'Apps Script läuft.', sheetName: SHEET_NAME, manometer: true, feature: 'manometer-highscore-best-speed-v95', spreadsheetName: spreadsheetName, deviceRegistrySheet: DEVICE_REGISTRY_SHEET_NAME });
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
    p4kritik: textValue_(p4.kritik), p4posSL: textValue_(p4.positivSL || p4.perspektiveSL || p4.posSL), p4posA: textValue_(p4.positivA || p4.perspektiveA || p4.posA), p4posB: textValue_(p4.positivB || p4.perspektiveB || p4.posB), p4absprachen: textValue_(p4.absprachen),
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
    pick_([path_(data, 'p4.positivSL'), path_(data, 'p4.perspektiveSL'), path_(data, 'p4.posSL')]),
    pick_([path_(data, 'p4.positivA'), path_(data, 'p4.perspektiveA'), path_(data, 'p4.posA')]),
    pick_([path_(data, 'p4.positivB'), path_(data, 'p4.perspektiveB'), path_(data, 'p4.posB')]),
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
  const rawCandidateLegacy = row[28]; // alte Struktur: Rohdaten JSON in Spalte 29
  const rawCandidateWrongLegacy = row[COL_GROUP_ID - 1];
  const presentationCandidate = row[COL_PRESENTATION_JSON - 1];
  const presentationCandidateLegacy = row[29]; // alte Struktur: Präsentation JSON in Spalte 30
  try { raw = JSON.parse(rawCandidateNew || rawCandidateLegacy || rawCandidateWrongLegacy || '{}'); } catch (err) { raw = {}; }
  try { presentation = JSON.parse(presentationCandidate || presentationCandidateLegacy || '{}'); } catch (err) { presentation = {}; }
  if (!isObject_(presentation) || Object.keys(presentation).length === 0) presentation = extractPresentationConfig_(raw);
  const groupId = pick_([row[COL_GROUP_ID - 1], row[27], raw.groupId, raw.g, raw.groupToken, raw.token]);
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
    p4: { kritik: row[20] || '', positivSL: row[21] || '', positivA: row[22] || '', positivB: row[23] || '', perspektiveSL: row[21] || '', perspektiveA: row[22] || '', perspektiveB: row[23] || '', absprachen: row[24] || '' },
    p5: { zustimmung: row[25] || '' },
    p6: { unterstuetzung: row[26] || '', umsetzung: row[27] || '', praxistauglichkeit: row[28] || '' },
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



function getDeviceRegistrySheet_() {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(DEVICE_REGISTRY_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(DEVICE_REGISTRY_SHEET_NAME);
  ensureDeviceRegistryHeader_(sheet);
  return sheet;
}

function ensureDeviceRegistryHeader_(sheet) {
  sheet.getRange(1, 1, 1, DEVICE_REGISTRY_HEADERS.length).setValues([DEVICE_REGISTRY_HEADERS]);
  sheet.setFrozenRows(1);
}

function findDeviceRegistryRow_(deviceId) {
  const sheet = getDeviceRegistrySheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;
  const needle = String(deviceId || '').trim();
  if (!needle) return 0;
  const values = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0] || '').trim() === needle) return i + 2;
  }
  return 0;
}

function registerDeviceId_(data) {
  data = (data && typeof data === 'object') ? data : {};
  const deviceId = textValue_(data.deviceId || data.device || data.browserId);
  if (!deviceId) return 0;
  const existing = findDeviceRegistryRow_(deviceId);
  if (existing >= 2) return existing;
  const groupId = textValue_(data.groupId || data.g || data.groupToken || data.token);
  const sheet = getDeviceRegistrySheet_();
  sheet.appendRow([
    deviceId,
    new Date(),
    groupId,
    textValue_(data.groupName),
    textValue_(data.role || ''),
    textValue_(data.assignedName || '')
  ]);
  return sheet.getLastRow();
}

function clearDeviceRegistry_() {
  const sheet = getDeviceRegistrySheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;
  const rows = lastRow - 1;
  sheet.deleteRows(2, rows);
  ensureDeviceRegistryHeader_(sheet);
  return rows;
}

function clearLegacyFeedbackDeviceIds_() {
  const sheet = getFeedbackSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;
  const range = sheet.getRange(2, 2, lastRow - 1, 1);
  const values = range.getValues();
  let cleared = 0;
  const blank = values.map(function(row) {
    if (String(row[0] || '').trim()) cleared++;
    return [''];
  });
  range.setValues(blank);
  return cleared;
}


function getFeedbackParticipationSheet_() {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(FEEDBACK_PARTICIPATION_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(FEEDBACK_PARTICIPATION_SHEET_NAME);
  ensureFeedbackParticipationHeader_(sheet);
  return sheet;
}

function ensureFeedbackParticipationHeader_(sheet) {
  sheet.getRange(1, 1, 1, FEEDBACK_PARTICIPATION_HEADERS.length).setValues([FEEDBACK_PARTICIPATION_HEADERS]);
  sheet.setFrozenRows(1);
}

function feedbackParticipationId_(deviceId, groupId) {
  const gid = textValue_(groupId);
  const did = textValue_(deviceId);
  return 'fb_' + (gid || 'nogroup') + '_' + (did || 'nodevice');
}

function findFeedbackParticipationRow_(participationId) {
  const sheet = getFeedbackParticipationSheet_();
  const last = sheet.getLastRow();
  if (last < 2) return 0;
  const needle = textValue_(participationId);
  const values = sheet.getRange(2, 2, last - 1, 1).getValues();
  for (let i = 0; i < values.length; i++) {
    if (textValue_(values[i][0]) === needle) return i + 2;
  }
  return 0;
}

function upsertFeedbackParticipation_(deviceId, groupId, status, feedbackRow) {
  const sheet = getFeedbackParticipationSheet_();
  const now = new Date();
  const pid = feedbackParticipationId_(deviceId, groupId);
  const row = findFeedbackParticipationRow_(pid);
  const values = [now, pid, textValue_(deviceId), textValue_(groupId), textValue_(status || 'offen'), feedbackRow || '', now];
  if (row >= 2) sheet.getRange(row, 1, 1, FEEDBACK_PARTICIPATION_HEADERS.length).setValues([values]);
  else sheet.appendRow(values);
  return { participationId: pid, rowNumber: row >= 2 ? row : sheet.getLastRow() };
}

function participationAlreadySubmitted_(deviceId, groupId) {
  const pid = feedbackParticipationId_(deviceId, groupId);
  const row = findFeedbackParticipationRow_(pid);
  if (row >= 2) {
    const values = getFeedbackParticipationSheet_().getRange(row, 1, 1, FEEDBACK_PARTICIPATION_HEADERS.length).getValues()[0];
    if (String(values[4] || '').toLowerCase() === 'abgegeben') return { found: true, rowNumber: row, participationId: pid, feedbackRow: values[5] || '' };
  }
  return { found: false, rowNumber: row, participationId: pid };
}



function getSprintHighscoreSheet_() {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(SPRINT_HIGHSCORE_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SPRINT_HIGHSCORE_SHEET_NAME);
  ensureSprintHighscoreHeader_(sheet);
  return sheet;
}

function ensureSprintHighscoreHeader_(sheet) {
  sheet.getRange(1, 1, 1, SPRINT_HIGHSCORE_HEADERS.length).setValues([SPRINT_HIGHSCORE_HEADERS]);
  sheet.setFrozenRows(1);
}

function sprintNameForDevice_(groupId, deviceId) {
  const gid = textValue_(groupId);
  const did = textValue_(deviceId);
  if (gid && did) {
    try {
      const members = membersForGroup_(gid);
      for (let i = 0; i < members.length; i++) {
        if (textValue_(members[i].deviceId) === did && textValue_(members[i].name)) return textValue_(members[i].name);
      }
    } catch (err) {}
    try {
      const registry = groupRegistryEntryForGroup_(gid);
      if (registry && registry.assignments) {
        const deviceEntries = getDeviceRegistryEntriesForGroup_(gid);
        for (let j = 0; j < deviceEntries.length; j++) {
          if (textValue_(deviceEntries[j].deviceId) === did && textValue_(deviceEntries[j].assignedName)) return textValue_(deviceEntries[j].assignedName);
        }
      }
    } catch (err2) {}
  }
  return '';
}

function saveSprintHighscoreGet_(e) {
  return jsonp_(e, saveSprintHighscore_((e && e.parameter) || {}));
}
function saveSprintHighscorePost_(body) {
  return jsonOutput_(saveSprintHighscore_(body || {}));
}
function saveSprintHighscore_(p) {
  const groupId = textValue_(p.groupId || p.g || p.groupToken || p.token);
  const deviceId = textValue_(p.deviceId || p.device || p.browserId);
  const score = Math.max(0, Math.round(Number(p.score || p.highscore || 0) || 0));
  const solved = Math.max(0, Math.round(Number(p.solved || p.problemsSolved || 0) || 0));
  if (!groupId) return { ok:false, type:'saveSprintHighscore', feature:'manometer-highscore-best-speed-v95', error:'Keine Gruppen-ID übermittelt.' };
  if (!deviceId) return { ok:false, type:'saveSprintHighscore', feature:'manometer-highscore-best-speed-v95', error:'Keine Geräte-ID übermittelt.' };
  if (!score && !solved) return { ok:false, type:'saveSprintHighscore', feature:'manometer-highscore-best-speed-v95', error:'Kein Score übermittelt.' };

  const name = textValue_(p.name || p.playerName) || sprintNameForDevice_(groupId, deviceId) || 'Unbekanntes Gerät';
  const raw = {
    groupId: groupId,
    deviceId: deviceId,
    name: name,
    score: score,
    solved: solved,
    userAgent: textValue_(p.userAgent || ''),
    clientTime: textValue_(p.clientTime || '')
  };

  const sheet = getSprintHighscoreSheet_();
  const last = sheet.getLastRow();
  let existingRow = 0;
  let existingScore = -1;
  let existingSolved = 0;

  if (last >= 2) {
    const values = sheet.getRange(2, 1, last - 1, SPRINT_HIGHSCORE_HEADERS.length).getValues();
    for (let i = 0; i < values.length; i++) {
      const row = values[i];
      if (textValue_(row[1]) === groupId && textValue_(row[2]) === deviceId) {
        const rowScore = Math.max(0, Math.round(Number(row[4] || 0) || 0));
        const rowSolved = Math.max(0, Math.round(Number(row[5] || 0) || 0));
        if (!existingRow || rowScore > existingScore || (rowScore === existingScore && rowSolved > existingSolved)) {
          existingRow = i + 2;
          existingScore = rowScore;
          existingSolved = rowSolved;
        }
      }
    }
  }

  if (existingRow && score <= existingScore) {
    return {
      ok:true,
      type:'saveSprintHighscore',
      feature:'manometer-highscore-best-speed-v95',
      saved:false,
      improved:false,
      groupId:groupId,
      deviceId:deviceId,
      name:name,
      submittedScore:score,
      submittedSolved:solved,
      existingScore:existingScore,
      bestScore:existingScore,
      rowNumber:existingRow,
      message:'Der bestehende Highscore ist höher oder gleich hoch und bleibt gespeichert.'
    };
  }

  if (existingRow) {
    sheet.getRange(existingRow, 1, 1, SPRINT_HIGHSCORE_HEADERS.length).setValues([[
      new Date(), groupId, deviceId, name, score, solved, safeJson_(raw)
    ]]);
    SpreadsheetApp.flush();
    return {
      ok:true,
      type:'saveSprintHighscore',
      feature:'manometer-highscore-best-speed-v95',
      saved:true,
      improved:true,
      groupId:groupId,
      deviceId:deviceId,
      name:name,
      score:score,
      solved:solved,
      previousScore:existingScore,
      bestScore:score,
      rowNumber:existingRow
    };
  }

  sheet.appendRow([new Date(), groupId, deviceId, name, score, solved, safeJson_(raw)]);
  SpreadsheetApp.flush();
  return {
    ok:true,
    type:'saveSprintHighscore',
    feature:'manometer-highscore-best-speed-v95',
    saved:true,
    improved:true,
    groupId:groupId,
    deviceId:deviceId,
    name:name,
    score:score,
    solved:solved,
    previousScore:null,
    bestScore:score,
    rowNumber:sheet.getLastRow()
  };
}

function listSprintHighscores_(groupId) {
  const sheet = getSprintHighscoreSheet_();
  const values = sheet.getDataRange().getValues();
  const filter = textValue_(groupId);
  const bestByDevice = {};
  for (let r = 1; r < values.length; r++) {
    const row = values[r];
    if (isEmptyRow_(row)) continue;
    const gid = textValue_(row[1]);
    if (filter && gid !== filter) continue;
    const did = textValue_(row[2]);
    const score = Math.max(0, Math.round(Number(row[4] || 0) || 0));
    const solved = Math.max(0, Math.round(Number(row[5] || 0) || 0));
    const key = did || ('row_' + r);
    const name = textValue_(row[3]) || sprintNameForDevice_(gid, did) || 'Unbekanntes Gerät';
    const entry = { timestamp: formatDate_(row[0]), groupId: gid, deviceId: did, name: name, score: score, solved: solved };
    if (!bestByDevice[key] || score > bestByDevice[key].score || (score === bestByDevice[key].score && solved > bestByDevice[key].solved)) bestByDevice[key] = entry;
  }
  return Object.keys(bestByDevice).map(function(k){ return bestByDevice[k]; }).sort(function(a,b){ return (b.score - a.score) || (b.solved - a.solved); });
}

function deleteSprintHighscoresAllGet_(e) {
  const p = (e && e.parameter) || {};
  return jsonp_(e, deleteSprintHighscoresAll_(p.adminPassword || p.password || p.admin || p.key));
}
function deleteSprintHighscoresAllPost_(body) {
  return jsonOutput_(deleteSprintHighscoresAll_(body && (body.adminPassword || body.password || body.admin || body.key)));
}
function deleteSprintHighscoresAll_(password) {
  if (String(password || '') !== String(MANOMETER_ADMIN_PASSWORD || '')) {
    return { ok:false, type:'deleteSprintHighscoresAll', feature:'manometer-highscore-best-speed-v95', error:'Admin-Passwort fehlt oder ist falsch.' };
  }
  const sheet = getSprintHighscoreSheet_();
  const last = sheet.getLastRow();
  const deleted = Math.max(0, last - 1);
  if (deleted > 0) sheet.deleteRows(2, deleted);
  ensureSprintHighscoreHeader_(sheet);
  SpreadsheetApp.flush();
  return { ok:true, type:'deleteSprintHighscoresAll', feature:'manometer-highscore-best-speed-v95', deletedRows:deleted, message:'Alle Supervisionssprint-Highscores wurden gelöscht.' };
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

function recreateSheetWithHeaders_(sheetName, headers) {
  const ss = getSpreadsheet_();
  const existing = ss.getSheetByName(sheetName);
  let index = 0;
  if (existing) {
    index = existing.getIndex();
    ss.deleteSheet(existing);
    SpreadsheetApp.flush();
  }
  const sheet = ss.insertSheet(sheetName, Math.max(0, index - 1));
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
  SpreadsheetApp.flush();
  return sheet;
}

function recreateFeedbackSheet_() {
  return recreateSheetWithHeaders_(FEEDBACK_SHEET_NAME, FEEDBACK_HEADERS);
}

function recreateFeedbackParticipationSheet_() {
  return recreateSheetWithHeaders_(FEEDBACK_PARTICIPATION_SHEET_NAME, FEEDBACK_PARTICIPATION_HEADERS);
}

function recreateDeviceRegistrySheet_() {
  return recreateSheetWithHeaders_(DEVICE_REGISTRY_SHEET_NAME, DEVICE_REGISTRY_HEADERS);
}


function manometerFeedbackStatusGet_(e) {
  return jsonp_(e, manometerFeedbackStatus_((e && e.parameter) || {}));
}

function manometerFeedbackStatusPost_(body) {
  return jsonOutput_(manometerFeedbackStatus_(body || {}));
}

function manometerFeedbackStatus_(p) {
  const sheet = getFeedbackSheet_();
  const deviceId = textValue_(p.deviceId || p.device || p.browserId);
  const groupId = textValue_(p.groupId || p.g || p.groupToken || p.token);

  if (!groupId) {
    return { ok:true, type:'manometerFeedbackStatus', feature:'manometer-highscore-best-speed-v95', checked:false, alreadyVoted:false, needsGroupId:true };
  }
  if (!deviceId) {
    return { ok:true, type:'manometerFeedbackStatus', feature:'manometer-highscore-best-speed-v95', checked:false, alreadyVoted:false, groupId:groupId };
  }

  const submitted = participationAlreadySubmitted_(deviceId, groupId);
  const row = findFeedbackRowByDeviceIdAndGroup_(sheet, deviceId, groupId);
  if (row >= 2 && !submitted.found) upsertFeedbackParticipation_(deviceId, groupId, 'abgegeben', row);

  const already = submitted.found || row >= 2;
  return {
    ok:true,
    type:'manometerFeedbackStatus',
    feature:'manometer-highscore-best-speed-v95',
    checked:true,
    alreadyVoted: already,
    duplicate: already,
    rowNumber: row >= 2 ? row : (submitted.feedbackRow || 0),
    participationId: submitted.participationId || feedbackParticipationId_(deviceId, groupId),
    groupId: groupId
  };
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
    generalPraise: p.generalPraise || p.praise || '',
    generalCriticism: p.generalCriticism || p.criticism || '',
    generalSuggestions: p.generalSuggestions || p.suggestions || '',
    presentationMotivation: p.presentationMotivation || p.randomPresentationMotivation || '',
    avoidCriticism: p.avoidCriticism || '',
    llmUsed: p.llmUsed || '',
    llmDetails: p.llmDetails || '',
    createdAt: p.createdAt || new Date().toISOString()
  };
  const result = saveFeedbackData_(data);
  return jsonp_(e, result);
}


function listFeedbackValues_(value) {
  if (Array.isArray(value)) {
    return value.map(function(v) { return textValue_(v); }).filter(function(v) { return v; });
  }
  if (value && typeof value === 'object') {
    return Object.keys(value).map(function(k) { return textValue_(value[k]); }).filter(function(v) { return v; });
  }
  const txt = textValue_(value);
  if (!txt) return [];
  try {
    const parsed = JSON.parse(txt);
    if (Array.isArray(parsed)) return parsed.map(function(v) { return textValue_(v); }).filter(function(v) { return v; });
  } catch (err) {}
  return [txt];
}

function listFeedbackJson_(value) {
  return safeJson_(listFeedbackValues_(value));
}


function saveFeedbackData_(data) {
  const sheet = getFeedbackSheet_();
  data = (data && typeof data === 'object') ? data : {};
  const deviceId = textValue_(data.deviceId || data.device || data.browserId);
  if (!deviceId) return { ok: false, type: 'manometerFeedbackSave', feature: 'manometer-highscore-best-speed-v95', error: 'Keine Geräte-ID übermittelt.' };
  const groupId = textValue_(data.groupId || data.g || data.groupToken || data.token);
  if (!groupId) return { ok: false, type: 'manometerFeedbackSave', feature: 'manometer-highscore-best-speed-v95', error: 'Keine Gruppen-ID übermittelt. Bitte den Feedback-QR-Code aus dem Gruppenfortschritt erneut scannen.' };

  const submitted = participationAlreadySubmitted_(deviceId, groupId);
  if (submitted.found) {
    return { ok: false, duplicate: true, type: 'manometerFeedbackSave', feature: 'manometer-highscore-best-speed-v95', error: 'Von diesem Gerät wurde für diese Feedbackrunde bereits Feedback abgegeben.', rowNumber: submitted.feedbackRow || submitted.rowNumber, participationId: submitted.participationId, source: 'participationSheet' };
  }

  const duplicateRow = findFeedbackRowByDeviceIdAndGroup_(sheet, deviceId, groupId);
  if (duplicateRow >= 2) {
    upsertFeedbackParticipation_(deviceId, groupId, 'abgegeben', duplicateRow);
    return { ok: false, duplicate: true, type: 'manometerFeedbackSave', feature: 'manometer-highscore-best-speed-v95', error: 'Von diesem Gerät wurde für diese Feedbackrunde bereits Feedback abgegeben.', rowNumber: duplicateRow, source: 'feedbackSheet' };
  }
  const scores = isObject_(data.scores) ? data.scores : data;
  const improvements = isObject_(data.improvements) ? data.improvements : {};
  const row = [
    new Date(),
    deviceId,
    groupId,
    textValue_(data.groupName),
    numberFeedback_(scores.supervisionUnderstanding),
    numberFeedback_(scores.supervisionProcess),
    numberFeedback_(scores.supervisionBenefits),
    numberFeedback_(scores.futureSupervisionUse),
    numberFeedback_(scores.schoolSupervisionImportance),
    numberFeedback_(scores.presentationUnderstandable),
    numberFeedback_(scores.webAppTechnicalUnderstandable),
    numberFeedback_(scores.webAppContentUnderstandable),
    numberFeedback_(scores.simulationUnderstanding),
    safeJson_(improvements),
    textValue_(data.generalFeedback || data.general || data.feedbackText),
    listFeedbackJson_(data.generalPraise || data.praise),
    listFeedbackJson_(data.generalCriticism || data.criticism),
    listFeedbackJson_(data.generalSuggestions || data.suggestions),
    textValue_(data.presentationMotivation || data.randomPresentationMotivation),
    textValue_(data.avoidCriticism),
    textValue_(data.llmUsed),
    textValue_(data.llmDetails),
    safeJson_(data)
  ];
  sheet.appendRow(row);
  const savedRow = sheet.getLastRow();
  upsertFeedbackParticipation_(deviceId, groupId, 'abgegeben', savedRow);
  registerDeviceId_(Object.assign({}, data, { groupId: groupId, deviceId: deviceId }));
  SpreadsheetApp.flush();
  return { ok: true, type: 'manometerFeedbackSave', feature: 'manometer-highscore-best-speed-v95', message: 'Manometer-Feedback gespeichert.', rowNumber: savedRow, groupId: groupId };
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


function findFeedbackRowByDeviceIdAndGroup_(sheet, deviceId, groupId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;
  const needleDevice = textValue_(deviceId);
  const needleGroup = textValue_(groupId);
  const values = sheet.getRange(2, 1, lastRow - 1, Math.max(3, sheet.getLastColumn())).getValues();
  for (let i = 0; i < values.length; i++) {
    const rowDevice = textValue_(values[i][1]);
    const rowGroup = textValue_(values[i][2]);
    if (rowDevice === needleDevice && (!needleGroup || rowGroup === needleGroup)) return i + 2;
  }
  return 0;
}




function resetManometerDeviceIdsPost_(body) {
  const password = String((body && (body.adminPassword || body.password || body.admin || body.key)) || '');
  return jsonOutput_(resetManometerDeviceIds_(password));
}

function resetManometerDeviceIdsGet_(e) {
  const p = (e && e.parameter) || {};
  const password = String(p.adminPassword || p.password || p.admin || p.key || '');
  return jsonp_(e, resetManometerDeviceIds_(password));
}

function resetManometerDeviceIds_(password) {
  if (String(password || '') !== String(MANOMETER_ADMIN_PASSWORD || '')) {
    return { ok: false, type: 'resetManometerDeviceIds', feature: 'manometer-highscore-best-speed-v95', error: 'Admin-Passwort fehlt oder ist falsch.' };
  }

  const beforeRegistryRows = getDeviceRegistryRowCount_();
  recreateDeviceRegistrySheet_();
  const clearedLegacyIds = clearLegacyFeedbackDeviceIds_();

  SpreadsheetApp.flush();

  return {
    ok: true,
    type: 'resetManometerDeviceIds',
    feature: 'manometer-highscore-best-speed-v95',
    mode: 'recreatedDeviceRegistry',
    message: 'Manometer-Geräte-IDs wurden freigegeben.',
    clearedRows: beforeRegistryRows,
    clearedRegistryRows: beforeRegistryRows,
    registryRowsAfter: getDeviceRegistryRowCount_(),
    clearedLegacyIds: clearedLegacyIds
  };
}


function deleteManometerFeedbackAllGet_(e) {
  const p = (e && e.parameter) || {};
  const password = String(p.adminPassword || p.password || p.admin || p.key || '');
  return jsonp_(e, deleteManometerFeedbackAll_(password));
}

function deleteManometerFeedbackAllPost_(body) {
  const password = String((body && (body.adminPassword || body.password || body.admin || body.key)) || '');
  return jsonOutput_(deleteManometerFeedbackAll_(password));
}

function deleteManometerFeedbackAll_(password) {
  if (String(password || '') !== String(MANOMETER_ADMIN_PASSWORD || '')) {
    return { ok: false, type: 'deleteManometerFeedbackAll', feature: 'manometer-highscore-best-speed-v95', error: 'Admin-Passwort fehlt oder ist falsch.' };
  }

  const beforeFeedbackRows = getFeedbackRowCount_();
  const beforeRegistryRows = getDeviceRegistryRowCount_();

  const feedbackSheet = recreateFeedbackSheet_();
  const registrySheet = recreateDeviceRegistrySheet_();

  SpreadsheetApp.flush();

  const afterFeedbackRows = Math.max(0, feedbackSheet.getLastRow() - 1);
  const afterRegistryRows = Math.max(0, registrySheet.getLastRow() - 1);

  return {
    ok: true,
    type: 'deleteManometerFeedbackAll',
    feature: 'manometer-highscore-best-speed-v95',
    mode: 'recreatedSheets',
    message: 'Manometer-Feedbackblatt und Geräte-Registry wurden neu erstellt.',
    deletedRows: beforeFeedbackRows,
    clearedRegistryRows: beforeRegistryRows,
    feedbackRowsBefore: beforeFeedbackRows,
    feedbackRowsAfter: afterFeedbackRows,
    registryRowsBefore: beforeRegistryRows,
    registryRowsAfter: afterRegistryRows,
    feedbackSheetName: FEEDBACK_SHEET_NAME,
    deviceRegistrySheetName: DEVICE_REGISTRY_SHEET_NAME
  };
}

function getFeedbackRowCount_() {
  const sheet = getFeedbackSheet_();
  return Math.max(0, sheet.getLastRow() - 1);
}

function getDeviceRegistryRowCount_() {
  const sheet = getDeviceRegistrySheet_();
  return Math.max(0, sheet.getLastRow() - 1);
}

function manometerAdminStatusGet_(e) {
  return jsonp_(e, manometerAdminStatus_());
}

function manometerAdminStatusPost_(body) {
  return jsonOutput_(manometerAdminStatus_());
}

function manometerAdminStatus_() {
  return {
    ok: true,
    type: 'manometerAdminStatus',
    feature: 'manometer-highscore-best-speed-v95',
    feedbackSheetName: FEEDBACK_SHEET_NAME,
    deviceRegistrySheetName: DEVICE_REGISTRY_SHEET_NAME,
    feedbackRows: getFeedbackRowCount_(),
    deviceRegistryRows: getDeviceRegistryRowCount_()
  };
}



function getGroupRegistrySheet_() {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(GROUP_REGISTRY_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(GROUP_REGISTRY_SHEET_NAME);
  ensureGroupRegistryHeader_(sheet);
  return sheet;
}

function ensureGroupRegistryHeader_(sheet) {
  sheet.getRange(1, 1, 1, GROUP_REGISTRY_HEADERS.length).setValues([GROUP_REGISTRY_HEADERS]);
  sheet.setFrozenRows(1);
}

function findGroupRegistryRow_(groupId) {
  const sheet = getGroupRegistrySheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;
  const needle = textValue_(groupId);
  if (!needle) return 0;
  const values = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
  for (let i = 0; i < values.length; i++) {
    if (textValue_(values[i][0]) === needle) return i + 2;
  }
  return 0;
}

function registerGroupGet_(e) {
  const p = (e && e.parameter) || {};
  return jsonp_(e, registerGroup_(p));
}

function registerGroupPost_(body) {
  return jsonOutput_(registerGroup_(body || {}));
}

function registerGroup_(params) {
  const groupId = textValue_(params.groupId || params.g || params.groupToken || params.token);
  if (!groupId) return { ok: false, type: 'registerGroup', feature: 'manometer-highscore-best-speed-v95', error: 'Keine Gruppen-ID übermittelt.' };
  const sheet = getGroupRegistrySheet_();
  const now = new Date();
  const groupName = textValue_(params.groupName || groupId);
  const groupSize = Number(params.groupSize || params.size || 0) || 0;
  const participants = textValue_(params.participants || params.participantsJson || '');
  const assignments = textValue_(params.assignments || params.assignmentsJson || '');
  const row = [now, groupId, groupName, groupSize, participants, assignments, now];
  const existing = findGroupRegistryRow_(groupId);
  if (existing >= 2) {
    sheet.getRange(existing, 1, 1, GROUP_REGISTRY_HEADERS.length).setValues([row]);
    SpreadsheetApp.flush();
    return { ok: true, type: 'registerGroup', feature: 'manometer-highscore-best-speed-v95', mode: 'updated', groupId: groupId, rowNumber: existing };
  }
  sheet.appendRow(row);
  SpreadsheetApp.flush();
  return { ok: true, type: 'registerGroup', feature: 'manometer-highscore-best-speed-v95', mode: 'created', groupId: groupId, rowNumber: sheet.getLastRow() };
}

function registerDeviceGroupGet_(e) {
  const p = (e && e.parameter) || {};
  return jsonp_(e, registerDeviceGroup_(p));
}

function registerDeviceGroupPost_(body) {
  return jsonOutput_(registerDeviceGroup_(body || {}));
}

function registerDeviceGroup_(params) {
  const deviceId = textValue_(params.deviceId || params.device || params.browserId);
  const groupId = textValue_(params.groupId || params.g || params.groupToken || params.token);
  if (!deviceId) return { ok: false, type: 'registerDeviceGroup', feature: 'manometer-highscore-best-speed-v95', error: 'Keine Geräte-ID übermittelt.' };
  if (!groupId) return { ok: false, type: 'registerDeviceGroup', feature: 'manometer-highscore-best-speed-v95', error: 'Keine Gruppen-ID übermittelt.' };

  const sheet = getDeviceRegistrySheet_();
  const existing = findDeviceRegistryRow_(deviceId);
  const row = [
    deviceId,
    new Date(),
    groupId,
    textValue_(params.groupName || groupId),
    textValue_(params.role || ''),
    textValue_(params.assignedName || '')
  ];

  ensureDeviceRegistryHeader_(sheet);
  if (existing >= 2) {
    sheet.getRange(existing, 1, 1, Math.max(DEVICE_REGISTRY_HEADERS.length, row.length)).setValues([row]);
    SpreadsheetApp.flush();
    return { ok: true, type: 'registerDeviceGroup', feature: 'manometer-highscore-best-speed-v95', mode: 'updated', deviceId: deviceId, groupId: groupId, rowNumber: existing };
  }
  sheet.appendRow(row);
  SpreadsheetApp.flush();
  return { ok: true, type: 'registerDeviceGroup', feature: 'manometer-highscore-best-speed-v95', mode: 'created', deviceId: deviceId, groupId: groupId, rowNumber: sheet.getLastRow() };
}

function resolveDeviceGroupGet_(e) {
  const p = (e && e.parameter) || {};
  return jsonp_(e, resolveDeviceGroup_(p));
}

function resolveDeviceGroupPost_(body) {
  return jsonOutput_(resolveDeviceGroup_(body || {}));
}

function resolveDeviceGroup_(params) {
  const deviceId = textValue_(params.deviceId || params.device || params.browserId);
  if (!deviceId) return { ok: false, type: 'resolveDeviceGroup', feature: 'manometer-highscore-best-speed-v95', error: 'Keine Geräte-ID übermittelt.' };
  const sheet = getDeviceRegistrySheet_();
  const row = findDeviceRegistryRow_(deviceId);
  if (row < 2) return { ok: true, type: 'resolveDeviceGroup', feature: 'manometer-highscore-best-speed-v95', found: false };
  const values = sheet.getRange(row, 1, 1, Math.max(sheet.getLastColumn(), DEVICE_REGISTRY_HEADERS.length)).getValues()[0];
  return {
    ok: true,
    type: 'resolveDeviceGroup',
    feature: 'manometer-highscore-best-speed-v95',
    found: true,
    deviceId: values[0] || '',
    timestamp: formatDate_(values[1]),
    groupId: values[2] || '',
    groupName: values[3] || '',
    role: values[4] || '',
    assignedName: values[5] || ''
  };
}



function groupRegistryEntryForGroup_(groupId) {
  const sheet = getGroupRegistrySheet_();
  const row = findGroupRegistryRow_(groupId);
  if (row < 2) return null;
  const values = sheet.getRange(row, 1, 1, Math.max(sheet.getLastColumn(), GROUP_REGISTRY_HEADERS.length)).getValues()[0];
  let participants = [];
  let assignments = {};
  try { participants = JSON.parse(values[4] || '[]'); } catch (err) { participants = []; }
  try { assignments = JSON.parse(values[5] || '{}'); } catch (err) { assignments = {}; }
  return {
    timestamp: formatDate_(values[0]),
    groupId: values[1] || '',
    groupName: values[2] || '',
    groupSize: Number(values[3] || 0) || 0,
    participants: Array.isArray(participants) ? participants : [],
    assignments: assignments && typeof assignments === 'object' ? assignments : {},
    updated: formatDate_(values[6])
  };
}

function resolveGroupIdFromDevice_(deviceId) {
  const id = textValue_(deviceId);
  if (!id) return '';
  const resolved = resolveDeviceGroup_({ deviceId: id });
  return resolved && resolved.found ? textValue_(resolved.groupId) : '';
}





function deleteGroupsAllGet_(e) {
  const p = (e && e.parameter) || {};
  const password = String(p.adminPassword || p.password || p.admin || p.key || '');
  return jsonp_(e, deleteGroupsAll_(password));
}

function deleteGroupsAllPost_(body) {
  const password = String((body && (body.adminPassword || body.password || body.admin || body.key)) || '');
  return jsonOutput_(deleteGroupsAll_(password));
}

function deleteGroupsAll_(password) {
  if (String(password || '') !== String(MANOMETER_ADMIN_PASSWORD || '')) {
    return { ok: false, type: 'deleteGroupsAll', feature: 'manometer-highscore-best-speed-v95', error: 'Admin-Passwort fehlt oder ist falsch.' };
  }
  const groupSheet = getGroupRegistrySheet_();
  const deviceSheet = getDeviceRegistrySheet_();
  const sessionSheet = getGroupSessionSheet_();
  const memberSheet = getGroupMemberSheet_();
  const beforeGroups = Math.max(0, groupSheet.getLastRow() - 1);
  const beforeDevices = Math.max(0, deviceSheet.getLastRow() - 1);
  const beforeSessions = Math.max(0, sessionSheet.getLastRow() - 1);
  const beforeMembers = Math.max(0, memberSheet.getLastRow() - 1);

  if (beforeGroups > 0) groupSheet.deleteRows(2, beforeGroups);
  if (beforeDevices > 0) deviceSheet.deleteRows(2, beforeDevices);
  if (beforeSessions > 0) sessionSheet.deleteRows(2, beforeSessions);
  if (beforeMembers > 0) memberSheet.deleteRows(2, beforeMembers);

  ensureGroupRegistryHeader_(groupSheet);
  ensureDeviceRegistryHeader_(deviceSheet);
  ensureGroupSessionHeader_(sessionSheet);
  ensureGroupMemberHeader_(memberSheet);
  SpreadsheetApp.flush();

  return {
    ok: true,
    type: 'deleteGroupsAll',
    feature: 'manometer-highscore-best-speed-v95',
    message: 'Alle Gruppen, Gruppensitzungen und Gerätezuordnungen wurden gelöscht.',
    deletedGroups: beforeGroups,
    deletedDevices: beforeDevices,
    deletedSessions: beforeSessions,
    deletedMembers: beforeMembers,
    groupsAfter: Math.max(0, groupSheet.getLastRow() - 1),
    devicesAfter: Math.max(0, deviceSheet.getLastRow() - 1)
  };
}

function deleteGroupGet_(e) {
  const p = (e && e.parameter) || {};
  const password = String(p.adminPassword || p.password || p.admin || p.key || '');
  return jsonp_(e, deleteGroup_(password, p.groupId || p.g || p.groupToken || p.token));
}

function deleteGroupPost_(body) {
  const password = String((body && (body.adminPassword || body.password || body.admin || body.key)) || '');
  return jsonOutput_(deleteGroup_(password, body && (body.groupId || body.g || body.groupToken || body.token)));
}

function deleteRowsByGroupId_(sheet, groupColIndex, groupId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;
  const needle = textValue_(groupId);
  let deleted = 0;
  for (let r = lastRow; r >= 2; r--) {
    const value = textValue_(sheet.getRange(r, groupColIndex).getValue());
    if (value === needle) {
      sheet.deleteRow(r);
      deleted++;
    }
  }
  return deleted;
}

function deleteGroup_(password, groupId) {
  if (String(password || '') !== String(MANOMETER_ADMIN_PASSWORD || '')) {
    return { ok: false, type: 'deleteGroup', feature: 'manometer-highscore-best-speed-v95', error: 'Admin-Passwort fehlt oder ist falsch.' };
  }
  const gid = textValue_(groupId);
  if (!gid) return { ok: false, type: 'deleteGroup', feature: 'manometer-highscore-best-speed-v95', error: 'Keine Gruppen-ID übermittelt.' };

  const groupSheet = getGroupRegistrySheet_();
  const deviceSheet = getDeviceRegistrySheet_();
  const feedbackSheet = getFeedbackSheet_();
  const sessionSheet = getGroupSessionSheet_();
  const memberSheet = getGroupMemberSheet_();

  const deletedGroups = deleteRowsByGroupId_(groupSheet, 2, gid);
  const deletedDevices = deleteRowsByGroupId_(deviceSheet, 3, gid);
  const deletedFeedback = deleteRowsByGroupId_(feedbackSheet, 3, gid);
  const deletedSessions = deleteRowsByGroupId_(sessionSheet, 2, gid);
  const deletedMembers = deleteRowsByGroupId_(memberSheet, 2, gid);

  ensureGroupRegistryHeader_(groupSheet);
  ensureDeviceRegistryHeader_(deviceSheet);
  ensureFeedbackHeader_(feedbackSheet);
  ensureGroupSessionHeader_(sessionSheet);
  ensureGroupMemberHeader_(memberSheet);
  SpreadsheetApp.flush();

  return {
    ok: true,
    type: 'deleteGroup',
    feature: 'manometer-highscore-best-speed-v95',
    groupId: gid,
    deletedGroups: deletedGroups,
    deletedDevices: deletedDevices,
    deletedFeedback: deletedFeedback,
    deletedSessions: deletedSessions,
    deletedMembers: deletedMembers
  };
}


function deleteMainResultsAllGet_(e) {
  const p = (e && e.parameter) || {};
  const password = String(p.adminPassword || p.password || p.admin || p.key || '');
  return jsonp_(e, deleteMainResultsAll_(password));
}

function deleteMainResultsAllPost_(body) {
  const password = String((body && (body.adminPassword || body.password || body.admin || body.key)) || '');
  return jsonOutput_(deleteMainResultsAll_(password));
}

function deleteMainResultsAll_(password) {
  if (String(password || '') !== String(MANOMETER_ADMIN_PASSWORD || '')) {
    return { ok: false, type: 'deleteMainResultsAll', feature: 'manometer-highscore-best-speed-v95', error: 'Admin-Passwort fehlt oder ist falsch.' };
  }

  const sheet = getSheet_();
  const lastRow = sheet.getLastRow();
  const lastCol = Math.max(sheet.getLastColumn(), HEADERS.length);
  const deletedRows = Math.max(0, lastRow - 1);

  if (deletedRows > 0) {
    sheet.deleteRows(2, deletedRows);
  }

  // Kopfzeile sicher wiederherstellen.
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet.setFrozenRows(1);
  SpreadsheetApp.flush();

  return {
    ok: true,
    type: 'deleteMainResultsAll',
    feature: 'manometer-highscore-best-speed-v95',
    message: 'Alle normalen Ergebnis-Einträge wurden gelöscht.',
    deletedRows: deletedRows,
    resultsRowsAfter: Math.max(0, sheet.getLastRow() - 1),
    sheetName: SHEET_NAME
  };
}



function getGroupSessionSheet_() {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(GROUP_SESSION_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(GROUP_SESSION_SHEET_NAME);
  ensureGroupSessionHeader_(sheet);
  return sheet;
}

function ensureGroupSessionHeader_(sheet) {
  sheet.getRange(1, 1, 1, GROUP_SESSION_HEADERS.length).setValues([GROUP_SESSION_HEADERS]);
  sheet.setFrozenRows(1);
}

function getGroupMemberSheet_() {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(GROUP_MEMBER_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(GROUP_MEMBER_SHEET_NAME);
  ensureGroupMemberHeader_(sheet);
  return sheet;
}

function ensureGroupMemberHeader_(sheet) {
  sheet.getRange(1, 1, 1, GROUP_MEMBER_HEADERS.length).setValues([GROUP_MEMBER_HEADERS]);
  sheet.setFrozenRows(1);
}

function makeTempGroupId_() {
  return 'gruppe-' + Utilities.getUuid().slice(0, 8);
}

function sessionGroupNameFromMembers_(members) {
  return members.map(function(m){ return textValue_(m.name); }).filter(function(v){ return v; }).join('-').toLowerCase().replace(/[^a-z0-9äöüß]+/gi, '-').replace(/^-|-$/g, '').slice(0, 90);
}

function findGroupSessionRow_(groupId) {
  const sheet = getGroupSessionSheet_();
  const last = sheet.getLastRow();
  if (last < 2) return 0;
  const needle = textValue_(groupId);
  const values = sheet.getRange(2, 2, last - 1, 1).getValues();
  for (let i = 0; i < values.length; i++) if (textValue_(values[i][0]) === needle) return i + 2;
  return 0;
}

function findGroupMemberRow_(groupId, deviceId) {
  const sheet = getGroupMemberSheet_();
  const last = sheet.getLastRow();
  if (last < 2) return 0;
  const gid = textValue_(groupId);
  const did = textValue_(deviceId);
  const values = sheet.getRange(2, 2, last - 1, 2).getValues();
  for (let i = 0; i < values.length; i++) {
    if (textValue_(values[i][0]) === gid && textValue_(values[i][1]) === did) return i + 2;
  }
  return 0;
}

function membersForGroup_(groupId) {
  const sheet = getGroupMemberSheet_();
  const values = sheet.getDataRange().getValues();
  const gid = textValue_(groupId);
  const out = [];
  for (let r = 1; r < values.length; r++) {
    const row = values[r];
    if (isEmptyRow_(row)) continue;
    if (textValue_(row[1]) !== gid) continue;
    out.push({
      rowNumber: r + 1,
      timestamp: formatDate_(row[0]),
      groupId: row[1] || '',
      deviceId: row[2] || '',
      name: row[3] || '',
      deviceType: row[4] || '',
      role: row[5] || '',
      isPrimary: String(row[6]).toLowerCase() === 'true',
      updated: formatDate_(row[7])
    });
  }
  return out;
}

function upsertGroupMember_(groupId, deviceId, name, deviceType, role, isPrimary) {
  const sheet = getGroupMemberSheet_();
  const rowNo = findGroupMemberRow_(groupId, deviceId);
  const now = new Date();
  const existing = rowNo >= 2 ? sheet.getRange(rowNo, 1, 1, GROUP_MEMBER_HEADERS.length).getValues()[0] : null;
  const row = [
    existing ? existing[0] : now,
    groupId,
    deviceId,
    textValue_(name),
    textValue_(deviceType || 'Unbekannt'),
    textValue_(role || (existing ? existing[5] : '')),
    !!isPrimary || (existing ? String(existing[6]).toLowerCase() === 'true' : false),
    now
  ];
  if (rowNo >= 2) sheet.getRange(rowNo, 1, 1, GROUP_MEMBER_HEADERS.length).setValues([row]);
  else sheet.appendRow(row);
  SpreadsheetApp.flush();
  return rowNo >= 2 ? rowNo : sheet.getLastRow();
}

function upsertGroupSession_(groupId, groupName, status, primaryDeviceId, groupSize) {
  const sheet = getGroupSessionSheet_();
  const rowNo = findGroupSessionRow_(groupId);
  const now = new Date();
  const existing = rowNo >= 2 ? sheet.getRange(rowNo, 1, 1, GROUP_SESSION_HEADERS.length).getValues()[0] : null;
  const row = [
    existing ? existing[0] : now,
    groupId,
    textValue_(groupName || groupId),
    textValue_(status || (existing ? existing[3] : 'offen')),
    textValue_(primaryDeviceId || (existing ? existing[4] : '')),
    Number(groupSize || (existing ? existing[5] : 0)) || 0,
    now
  ];
  if (rowNo >= 2) sheet.getRange(rowNo, 1, 1, GROUP_SESSION_HEADERS.length).setValues([row]);
  else sheet.appendRow(row);
  SpreadsheetApp.flush();
  return rowNo >= 2 ? rowNo : sheet.getLastRow();
}

function createGroupSessionGet_(e) {
  return jsonp_(e, createGroupSession_((e && e.parameter) || {}));
}
function createGroupSessionPost_(body) {
  return jsonOutput_(createGroupSession_(body || {}));
}
function createGroupSession_(p) {
  const deviceId = textValue_(p.deviceId || p.device || p.browserId);
  const name = textValue_(p.name || p.memberName);
  const deviceType = textValue_(p.deviceType || 'Unbekannt');
  if (!deviceId) return { ok:false, type:'createGroupSession', feature:'manometer-highscore-best-speed-v95', error:'Keine Geräte-ID übermittelt.' };
  if (!name) return { ok:false, type:'createGroupSession', feature:'manometer-highscore-best-speed-v95', error:'Kein Name übermittelt.' };
  const groupId = textValue_(p.groupId || p.g) || makeTempGroupId_();
  upsertGroupSession_(groupId, groupId, 'offen', deviceId, 1);
  upsertGroupMember_(groupId, deviceId, name, deviceType, '', true);
  registerDeviceGroup_({ deviceId: deviceId, groupId: groupId, groupName: groupId, role: '', assignedName: name });
  const members = membersForGroup_(groupId);
  return { ok:true, type:'createGroupSession', feature:'manometer-highscore-best-speed-v95', groupId:groupId, groupName:groupId, members:members };
}

function joinGroupSessionGet_(e) {
  return jsonp_(e, joinGroupSession_((e && e.parameter) || {}));
}
function joinGroupSessionPost_(body) {
  return jsonOutput_(joinGroupSession_(body || {}));
}
function joinGroupSession_(p) {
  const groupId = textValue_(p.groupId || p.g);
  const deviceId = textValue_(p.deviceId || p.device || p.browserId);
  const name = textValue_(p.name || p.memberName);
  const deviceType = textValue_(p.deviceType || 'Unbekannt');
  if (!groupId) return { ok:false, type:'joinGroupSession', feature:'manometer-highscore-best-speed-v95', error:'Keine Gruppen-ID übermittelt.' };
  if (!deviceId) return { ok:false, type:'joinGroupSession', feature:'manometer-highscore-best-speed-v95', error:'Keine Geräte-ID übermittelt.' };
  if (!name) return { ok:false, type:'joinGroupSession', feature:'manometer-highscore-best-speed-v95', error:'Kein Name übermittelt.' };
  if (findGroupSessionRow_(groupId) < 2) upsertGroupSession_(groupId, groupId, 'offen', '', 0);
  const existingMemberRow = findGroupMemberRow_(groupId, deviceId);
  const existingMembers = membersForGroup_(groupId);
  if (existingMemberRow < 2 && existingMembers.length >= 5) {
    return { ok:false, type:'joinGroupSession', feature:'manometer-highscore-best-speed-v95', error:'Diese Gruppe ist bereits voll. Maximal 5 Mitglieder sind möglich.' };
  }
  upsertGroupMember_(groupId, deviceId, name, deviceType, '', false);
  clearRolesAndDeviceAssignmentsForGroup_(groupId);
  const members = membersForGroup_(groupId);
  const groupName = sessionGroupNameFromMembers_(members) || groupId;
  upsertGroupSession_(groupId, groupName, 'offen', '', members.length);
  fastUpsertGroupRegistry_(groupId, groupName, members, {});
  registerDeviceGroup_({ deviceId: deviceId, groupId: groupId, groupName: groupName, role: '', assignedName: name });
  return { ok:true, type:'joinGroupSession', feature:'manometer-highscore-best-speed-v95', groupId:groupId, groupName:groupName, members:members, rolesCleared:true };
}

function listGroupMembersGet_(e) {
  return jsonp_(e, listGroupMembers_((e && e.parameter) || {}));
}
function listGroupMembersPost_(body) {
  return jsonOutput_(listGroupMembers_(body || {}));
}
function listGroupMembers_(p) {
  const groupId = textValue_(p.groupId || p.g);
  if (!groupId) return { ok:false, type:'listGroupMembers', feature:'manometer-highscore-best-speed-v95', error:'Keine Gruppen-ID übermittelt.' };
  const members = membersForGroup_(groupId);
  const groupName = sessionGroupNameFromMembers_(members) || groupId;
  return { ok:true, type:'listGroupMembers', feature:'manometer-highscore-best-speed-v95', groupId:groupId, groupName:groupName, members:members };
}


function batchUpdateMembersRoles_(groupId, rolesByDeviceId) {
  const sheet = getGroupMemberSheet_();
  const last = sheet.getLastRow();
  if (last < 2) return 0;
  const range = sheet.getRange(2, 1, last - 1, GROUP_MEMBER_HEADERS.length);
  const values = range.getValues();
  let changed = 0;
  const now = new Date();
  for (let i = 0; i < values.length; i++) {
    if (textValue_(values[i][1]) !== textValue_(groupId)) continue;
    const deviceId = textValue_(values[i][2]);
    if (Object.prototype.hasOwnProperty.call(rolesByDeviceId, deviceId)) {
      values[i][5] = rolesByDeviceId[deviceId] || '';
      values[i][7] = now;
      changed++;
    }
  }
  if (changed) range.setValues(values);
  return changed;
}

function batchUpsertDeviceRegistryForMembers_(groupId, groupName, members) {
  const sheet = getDeviceRegistrySheet_();
  ensureDeviceRegistryHeader_(sheet);
  const last = sheet.getLastRow();
  const existingValues = last >= 2 ? sheet.getRange(2, 1, last - 1, DEVICE_REGISTRY_HEADERS.length).getValues() : [];
  const rowByDevice = {};
  for (let i = 0; i < existingValues.length; i++) {
    rowByDevice[textValue_(existingValues[i][0])] = i;
  }
  const now = new Date();
  const append = [];
  members.forEach(function(m) {
    const deviceId = textValue_(m.deviceId);
    if (!deviceId) return;
    const row = [
      deviceId,
      now,
      textValue_(groupId),
      textValue_(groupName || groupId),
      textValue_(m.role || ''),
      textValue_(m.name || '')
    ];
    if (Object.prototype.hasOwnProperty.call(rowByDevice, deviceId)) {
      existingValues[rowByDevice[deviceId]] = row;
    } else {
      append.push(row);
    }
  });
  if (existingValues.length) sheet.getRange(2, 1, existingValues.length, DEVICE_REGISTRY_HEADERS.length).setValues(existingValues);
  if (append.length) sheet.getRange(sheet.getLastRow() + 1, 1, append.length, DEVICE_REGISTRY_HEADERS.length).setValues(append);
  return { updated: members.length - append.length, created: append.length };
}

function fastUpsertGroupSession_(groupId, groupName, status, groupSize) {
  const sheet = getGroupSessionSheet_();
  const rowNo = findGroupSessionRow_(groupId);
  const now = new Date();
  if (rowNo >= 2) {
    const values = sheet.getRange(rowNo, 1, 1, GROUP_SESSION_HEADERS.length).getValues()[0];
    values[2] = textValue_(groupName || groupId);
    values[3] = textValue_(status || values[3] || 'offen');
    values[5] = Number(groupSize || values[5] || 0) || 0;
    values[6] = now;
    sheet.getRange(rowNo, 1, 1, GROUP_SESSION_HEADERS.length).setValues([values]);
    return rowNo;
  }
  sheet.appendRow([now, groupId, textValue_(groupName || groupId), textValue_(status || 'offen'), '', Number(groupSize || 0) || 0, now]);
  return sheet.getLastRow();
}

function fastUpsertGroupRegistry_(groupId, groupName, members, assignments) {
  const sheet = getGroupRegistrySheet_();
  const rowNo = findGroupRegistryRow_(groupId);
  const now = new Date();
  const participants = JSON.stringify(members.map(function(m) { return { name: m.name, deviceType: m.deviceType }; }));
  const assignmentsJson = JSON.stringify(assignments || {});
  const row = [now, groupId, textValue_(groupName || groupId), members.length, participants, assignmentsJson, now];
  if (rowNo >= 2) {
    sheet.getRange(rowNo, 1, 1, GROUP_REGISTRY_HEADERS.length).setValues([row]);
    return rowNo;
  }
  sheet.appendRow(row);
  return sheet.getLastRow();
}




function clearRolesAndDeviceAssignmentsForGroup_(groupId) {
  const gid = textValue_(groupId);
  const clearedMembers = clearRolesForGroup_(gid);

  const deviceSheet = getDeviceRegistrySheet_();
  const last = deviceSheet.getLastRow();
  let clearedDevices = 0;
  if (last >= 2) {
    const range = deviceSheet.getRange(2, 1, last - 1, DEVICE_REGISTRY_HEADERS.length);
    const values = range.getValues();
    for (let i = 0; i < values.length; i++) {
      if (textValue_(values[i][2]) === gid) {
        values[i][4] = '';
        values[i][5] = '';
        clearedDevices++;
      }
    }
    if (clearedDevices) range.setValues(values);
  }
  return { clearedMembers: clearedMembers, clearedDevices: clearedDevices };
}

function deleteDeviceEverywhere_(deviceId, groupId) {
  const did = textValue_(deviceId);
  const gid = textValue_(groupId);
  if (!did) return { deviceRegistry: 0, feedback: 0 };

  let deviceRegistry = 0;
  try {
    const sheet = getDeviceRegistrySheet_();
    const last = sheet.getLastRow();
    for (let r = last; r >= 2; r--) {
      const rowDevice = textValue_(sheet.getRange(r, 1).getValue());
      const rowGroup = textValue_(sheet.getRange(r, 3).getValue());
      if (rowDevice === did && (!gid || rowGroup === gid)) {
        sheet.deleteRow(r);
        deviceRegistry++;
      }
    }
  } catch (err) {}

  let feedback = 0;
  try {
    const sheet = getFeedbackSheet_();
    const last = sheet.getLastRow();
    if (last >= 2) {
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(function(h){ return textValue_(h).toLowerCase(); });
      const deviceCol = Math.max(headers.indexOf('geräte-id'), headers.indexOf('geraete-id'), headers.indexOf('deviceid'), headers.indexOf('device id')) + 1;
      const groupCol = Math.max(headers.indexOf('gruppen-id'), headers.indexOf('gruppe'), headers.indexOf('groupid'), headers.indexOf('group id')) + 1;
      if (deviceCol > 0) {
        for (let r = last; r >= 2; r--) {
          const rowDevice = textValue_(sheet.getRange(r, deviceCol).getValue());
          const rowGroup = groupCol > 0 ? textValue_(sheet.getRange(r, groupCol).getValue()) : '';
          if (rowDevice === did && (!gid || !groupCol || rowGroup === gid)) {
            sheet.deleteRow(r);
            feedback++;
          }
        }
      }
    }
  } catch (err) {}

  return { deviceRegistry: deviceRegistry, feedback: feedback };
}

function clearRolesForGroup_(groupId) {
  const sheet = getGroupMemberSheet_();
  const last = sheet.getLastRow();
  if (last < 2) return 0;
  const range = sheet.getRange(2, 1, last - 1, GROUP_MEMBER_HEADERS.length);
  const values = range.getValues();
  let changed = 0;
  const gid = textValue_(groupId);
  const now = new Date();
  for (let i = 0; i < values.length; i++) {
    if (textValue_(values[i][1]) !== gid) continue;
    if (values[i][5]) changed++;
    values[i][5] = '';
    values[i][7] = now;
  }
  if (changed || values.some(function(row){ return textValue_(row[1]) === gid; })) range.setValues(values);
  return changed;
}

function removeGroupMemberGet_(e) {
  return jsonp_(e, removeGroupMember_((e && e.parameter) || {}));
}

function removeGroupMemberPost_(body) {
  return jsonOutput_(removeGroupMember_(body || {}));
}

function removeGroupMember_(p) {
  const groupId = textValue_(p.groupId || p.g);
  const deviceIdToRemove = textValue_(p.deviceIdToRemove || p.deviceId || p.removeDeviceId);
  const removeRowNumber = Number(p.removeRowNumber || p.rowNumber || 0) || 0;
  const requesterDeviceId = textValue_(p.requesterDeviceId || p.requester || p.adminDeviceId);
  if (!groupId) return { ok:false, type:'removeGroupMember', feature:'manometer-highscore-best-speed-v95', error:'Keine Gruppen-ID übermittelt.' };
  if (!deviceIdToRemove && removeRowNumber < 2) return { ok:false, type:'removeGroupMember', feature:'manometer-highscore-best-speed-v95', error:'Kein Mitglied zum Entfernen übermittelt.' };

  const requesterRow = requesterDeviceId ? findGroupMemberRow_(groupId, requesterDeviceId) : 0;
  if (requesterRow < 2) return { ok:false, type:'removeGroupMember', feature:'manometer-highscore-best-speed-v95', error:'Nur der Gruppenanführer kann Mitglieder entfernen.' };
  const requester = getGroupMemberSheet_().getRange(requesterRow, 1, 1, GROUP_MEMBER_HEADERS.length).getValues()[0];
  if (String(requester[6]).toLowerCase() !== 'true') {
    return { ok:false, type:'removeGroupMember', feature:'manometer-highscore-best-speed-v95', error:'Nur der Gruppenanführer kann Mitglieder entfernen.' };
  }

  let removeRow = deviceIdToRemove ? findGroupMemberRow_(groupId, deviceIdToRemove) : 0;
  if (removeRow < 2 && removeRowNumber >= 2) {
    const candidate = getGroupMemberSheet_().getRange(removeRowNumber, 1, 1, GROUP_MEMBER_HEADERS.length).getValues()[0];
    if (textValue_(candidate[1]) === groupId) removeRow = removeRowNumber;
  }
  if (removeRow < 2) return { ok:false, type:'removeGroupMember', feature:'manometer-highscore-best-speed-v95', error:'Dieses Mitglied wurde nicht gefunden.' };
  const row = getGroupMemberSheet_().getRange(removeRow, 1, 1, GROUP_MEMBER_HEADERS.length).getValues()[0];
  const actualDeviceIdToRemove = textValue_(row[2]) || deviceIdToRemove;
  if (String(row[6]).toLowerCase() === 'true') return { ok:false, type:'removeGroupMember', feature:'manometer-highscore-best-speed-v95', error:'Der Gruppenanführer kann nicht aus der Gruppe entfernt werden.' };

  getGroupMemberSheet_().deleteRow(removeRow);
  if (actualDeviceIdToRemove) deleteRowsByGroupIdAndDevice_(getDeviceRegistrySheet_(), 3, groupId, 1, actualDeviceIdToRemove);
  clearRolesAndDeviceAssignmentsForGroup_(groupId);
  const members = membersForGroup_(groupId);
  const groupName = sessionGroupNameFromMembers_(members) || groupId;
  fastUpsertGroupSession_(groupId, groupName, 'offen', members.length);
  fastUpsertGroupRegistry_(groupId, groupName, members, {});
  batchUpsertDeviceRegistryForMembers_(groupId, groupName, members);
  SpreadsheetApp.flush();
  return { ok:true, type:'removeGroupMember', feature:'manometer-highscore-best-speed-v95', groupId:groupId, removedDeviceId:actualDeviceIdToRemove, deletedDeviceData:deletedDeviceData, members:members };
}

function deleteRowsByGroupIdAndDevice_(sheet, groupColIndex, groupId, deviceColIndex, deviceId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;
  let deleted = 0;
  const gid = textValue_(groupId);
  const did = textValue_(deviceId);
  for (let r = lastRow; r >= 2; r--) {
    if (textValue_(sheet.getRange(r, groupColIndex).getValue()) === gid && textValue_(sheet.getRange(r, deviceColIndex).getValue()) === did) {
      sheet.deleteRow(r);
      deleted++;
    }
  }
  return deleted;
}

function assignRolesToMembersGet_(e) {
  return jsonp_(e, assignRolesToMembers_((e && e.parameter) || {}));
}
function assignRolesToMembersPost_(body) {
  return jsonOutput_(assignRolesToMembers_(body || {}));
}
function assignRolesToMembers_(p) {
  const lock = LockService.getScriptLock();
  try {
    lock.tryLock(5000);
  } catch (err) {}

  try {
    const groupId = textValue_(p.groupId || p.g);
    if (!groupId) return { ok:false, type:'assignRolesToMembers', feature:'manometer-highscore-best-speed-v95', error:'Keine Gruppen-ID übermittelt.' };

    let members = membersForGroup_(groupId);
    if (members.length < 4) return { ok:false, type:'assignRolesToMembers', feature:'manometer-highscore-best-speed-v95', error:'Mindestens 4 Gruppenmitglieder erforderlich.' };
    if (members.length > 5) return { ok:false, type:'assignRolesToMembers', feature:'manometer-highscore-best-speed-v95', error:'Maximal 5 Gruppenmitglieder sind möglich.' };

    const primaryMember = members.find(function(m){ return m.primary === true || String(m.primary).toLowerCase() === 'true' || String(m.primary).toLowerCase() === 'ja' || String(m.primary) === '1'; }) || members[0];

    if (members.some(function(m){ return textValue_(m.role); })) {
      const assignmentsExisting = {};
      members.forEach(function(m){ if (textValue_(m.role)) assignmentsExisting[textValue_(m.role)] = m.name; });
      const groupNameExisting = sessionGroupNameFromMembers_(members) || groupId;
      return {
        ok:true,
        type:'assignRolesToMembers',
        feature:'manometer-highscore-best-speed-v95',
        groupId:groupId,
        groupName:groupNameExisting,
        assignments:assignmentsExisting,
        members:members,
        alreadyAssigned:true
      };
    }

    members = members.slice();

    const fixedRole = members.length >= 5 ? 'protokoll' : 'supervisor';
    const remainingRoles = members.length >= 5
      ? ['supervisor','schulleitung','lehrkraft-a','lehrkraft-b']
      : ['schulleitung','lehrkraft-a','lehrkraft-b'];

    const primaryDeviceId = textValue_(primaryMember && primaryMember.deviceId);
    const primaryIndex = members.findIndex(function(m){ return textValue_(m.deviceId) === primaryDeviceId; });
    const leader = primaryIndex >= 0 ? members.splice(primaryIndex, 1)[0] : members.shift();

    for (let i = members.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = members[i]; members[i] = members[j]; members[j] = tmp;
    }

    const orderedMembers = [leader].concat(members);
    const orderedRoles = [fixedRole].concat(remainingRoles);

    const assignments = {};
    const rolesByDeviceId = {};
    for (let i = 0; i < orderedMembers.length; i++) {
      const role = orderedRoles[i] || '';
      orderedMembers[i].role = role;
      if (role) assignments[role] = orderedMembers[i].name;
      rolesByDeviceId[textValue_(orderedMembers[i].deviceId)] = role;
    }
    members = orderedMembers;

    const groupName = sessionGroupNameFromMembers_(members) || groupId;

    batchUpdateMembersRoles_(groupId, rolesByDeviceId);
    fastUpsertGroupSession_(groupId, groupName, 'rollen_verteilt', members.length);
    fastUpsertGroupRegistry_(groupId, groupName, members, assignments);
    batchUpsertDeviceRegistryForMembers_(groupId, groupName, members);

    SpreadsheetApp.flush();

    return {
      ok:true,
      type:'assignRolesToMembers',
      feature:'manometer-highscore-best-speed-v95',
      groupId:groupId,
      groupName:groupName,
      assignments:assignments,
      members:members,
      optimized:true
    };
  } catch (err) {
    return {
      ok:false,
      type:'assignRolesToMembers',
      feature:'manometer-highscore-best-speed-v95',
      error: String(err && err.message ? err.message : err)
    };
  } finally {
    try { lock.releaseLock(); } catch (err) {}
  }
}

function resolveAssignedRoleForDeviceGet_(e) {
  return jsonp_(e, resolveAssignedRoleForDevice_((e && e.parameter) || {}));
}
function resolveAssignedRoleForDevicePost_(body) {
  return jsonOutput_(resolveAssignedRoleForDevice_(body || {}));
}
function resolveAssignedRoleForDevice_(p) {
  const groupId = textValue_(p.groupId || p.g);
  const deviceId = textValue_(p.deviceId || p.device || p.browserId);
  if (!groupId || !deviceId) return { ok:false, type:'resolveAssignedRoleForDevice', feature:'manometer-highscore-best-speed-v95', error:'Gruppen-ID oder Geräte-ID fehlt.' };
  const rowNo = findGroupMemberRow_(groupId, deviceId);
  if (rowNo < 2) return { ok:true, type:'resolveAssignedRoleForDevice', feature:'manometer-highscore-best-speed-v95', found:false };
  const row = getGroupMemberSheet_().getRange(rowNo, 1, 1, GROUP_MEMBER_HEADERS.length).getValues()[0];
  return { ok:true, type:'resolveAssignedRoleForDevice', feature:'manometer-highscore-best-speed-v95', found:true, groupId:row[1]||'', deviceId:row[2]||'', name:row[3]||'', deviceType:row[4]||'', role:row[5]||'', isPrimary:String(row[6]).toLowerCase()==='true' };
}


function listGroupsGet_(e) {
  const p = (e && e.parameter) || {};
  return jsonp_(e, listGroups_(p));
}

function listGroupsPost_(body) {
  return jsonOutput_(listGroups_(body || {}));
}

function listGroups_(params) {
  const sheet = getGroupRegistrySheet_();
  const values = sheet.getDataRange().getValues();
  const groups = [];
  for (let r = 1; r < values.length; r++) {
    const row = values[r];
    if (isEmptyRow_(row)) continue;
    const groupId = textValue_(row[1]);
    if (!groupId) continue;

    let participants = [];
    let assignments = {};
    try { participants = JSON.parse(row[4] || '[]'); } catch (err) { participants = []; }
    try { assignments = JSON.parse(row[5] || '{}'); } catch (err) { assignments = {}; }

    const names = Array.isArray(participants)
      ? participants.map(function(p){ return textValue_(p && (p.name || p)); }).filter(function(v){ return v; })
      : [];
    const fallbackNames = Object.keys(assignments || {}).map(function(role){ return textValue_(assignments[role]); }).filter(function(v){ return v; });

    const feedbackEntries = getFeedbackEntriesForGroup_(groupId);
    const resultEntries = getResultEntriesForGroup_(groupId);
    const latestResult = resultEntries.length ? resultEntries[resultEntries.length - 1] : null;
    const latestRow = latestResult ? (latestResult.rowNumber || latestResult.id || '') : '';
    const hasPresentation = !!(latestResult && latestResult.data && latestResult.data.presentationV6 && Object.keys(latestResult.data.presentationV6).length);

    const available = ['Gruppenzuweisung'];
    if (resultEntries.length) available.push('Ergebnis');
    if (hasPresentation) available.push('Präsentation');
    if (feedbackEntries.length) available.push('Feedback');

    let progressLabel = 'Gruppenzuweisung abgeschlossen';
    if (resultEntries.length) progressLabel = 'Gruppenergebnis abgegeben';
    if (hasPresentation) progressLabel = 'Präsentation bereitgestellt';
    if (feedbackEntries.length) progressLabel = 'Feedback läuft';

    groups.push({
      rowNumber: r + 1,
      timestamp: formatDate_(row[0]),
      groupId: groupId,
      groupName: textValue_(row[2] || groupId),
      groupSize: Number(row[3] || 0) || (names.length || fallbackNames.length || 5),
      names: names.length ? names : fallbackNames,
      feedbackCount: feedbackEntries.length,
      resultCount: resultEntries.length,
      hasResult: resultEntries.length > 0,
      hasPresentation: hasPresentation,
      latestResultRow: latestRow,
      progressLabel: progressLabel,
      available: available,
      availableText: available.join(', '),
      updated: formatDate_(row[6])
    });
  }
  groups.sort(function(a, b){ return String(a.groupName || a.groupId).localeCompare(String(b.groupName || b.groupId)); });
  return { ok: true, type: 'listGroups', feature: 'manometer-highscore-best-speed-v95', groups: groups, total: groups.length };
}



function checkGroupExistsGet_(e) {
  return jsonp_(e, checkGroupExists_((e && e.parameter) || {}));
}

function checkGroupExistsPost_(body) {
  return jsonOutput_(checkGroupExists_(body || {}));
}

function checkGroupExists_(p) {
  const groupId = textValue_(p.groupId || p.g);
  const deviceId = textValue_(p.deviceId || p.device || p.browserId);
  if (!groupId && !deviceId) {
    return { ok: true, type: 'checkGroupExists', feature: 'manometer-highscore-best-speed-v95', checked: false, exists: true };
  }

  let resolvedGroupId = groupId;
  if (!resolvedGroupId && deviceId) {
    try {
      const deviceResolved = resolveDeviceGroup_({ deviceId: deviceId });
      if (deviceResolved && deviceResolved.ok && deviceResolved.found && deviceResolved.groupId) {
        resolvedGroupId = textValue_(deviceResolved.groupId);
      }
    } catch (err) {}
  }

  if (!resolvedGroupId) {
    return { ok: true, type: 'checkGroupExists', feature: 'manometer-highscore-best-speed-v95', checked: true, exists: false, groupId: '', reason: 'Keine gültige Gruppen-ID gefunden.' };
  }

  const gid = textValue_(resolvedGroupId);
  let inSessions = false;
  let inMembers = false;
  let inRegistry = false;

  try { inSessions = findGroupSessionRow_(gid) >= 2; } catch (err) {}
  try { inRegistry = findGroupRegistryRow_(gid) >= 2; } catch (err) {}
  try { inMembers = membersForGroup_(gid).length > 0; } catch (err) {}

  const exists = !!(inSessions || inMembers || inRegistry);
  return {
    ok: true,
    type: 'checkGroupExists',
    feature: 'manometer-highscore-best-speed-v95',
    checked: true,
    exists: exists,
    groupId: gid,
    inSessions: inSessions,
    inMembers: inMembers,
    inRegistry: inRegistry
  };
}


function groupProgressGet_(e) {
  const p = (e && e.parameter) || {};
  return jsonp_(e, groupProgress_(p));
}


function findLatestResultRowByGroupId_(groupId) {
  const sheet = getSheet_();
  const last = sheet.getLastRow();
  const gid = textValue_(groupId);
  if (!gid || last < 2) return 0;
  const values = sheet.getRange(2, COL_GROUP_ID, last - 1, 1).getValues();
  for (let i = values.length - 1; i >= 0; i--) {
    if (textValue_(values[i][0]) === gid) return i + 2;
  }
  return 0;
}

function saveGroupPresentationPost_(body) {
  return jsonOutput_(saveGroupPresentation_(body || {}));
}

function saveGroupPresentation_(body) {
  const sheet = getSheet_();
  const groupId = textValue_(body.groupId || body.g || body.groupToken || body.token);
  if (!groupId) return { ok:false, type:'saveGroupPresentation', feature:'manometer-highscore-best-speed-v95', error:'Keine Gruppen-ID übermittelt.' };

  let rowNo = Number(body.rowNumber || body.row || body.id || 0) || 0;
  if (rowNo < 2 || textValue_(sheet.getRange(rowNo, COL_GROUP_ID).getValue()) !== groupId) {
    rowNo = findLatestResultRowByGroupId_(groupId);
  }
  if (rowNo < 2) return { ok:false, type:'saveGroupPresentation', feature:'manometer-highscore-best-speed-v95', error:'Kein Gruppenergebnis für diese Gruppen-ID gefunden.' };

  const currentRow = sheet.getRange(rowNo, 1, 1, Math.max(sheet.getLastColumn(), HEADERS.length)).getValues()[0];
  const currentEntry = rowToEntry_(currentRow, rowNo);
  const currentData = currentEntry && currentEntry.data ? currentEntry.data : {};
  const incoming = isObject_(body.presentationV6) ? body.presentationV6 : (isObject_(body.presentationConfig) ? body.presentationConfig : {});
  const normalized = stripLargePresentationData_(normalizePresentationState_(incoming, currentData));
  normalized.version = normalized.version || 6;
  normalized.groupId = groupId;
  normalized.savedAt = textValue_(body.savedAt) || new Date().toISOString();
  normalized.editorSaveId = textValue_(body.editorSaveId || (incoming && incoming.editorSaveId)) || Utilities.getUuid();

  let raw = {};
  try { raw = JSON.parse(sheet.getRange(rowNo, COL_RAW_JSON).getValue() || '{}'); } catch (err) { raw = {}; }
  if (!isObject_(raw)) raw = {};
  raw.presentationV6 = normalized;
  raw.presentationConfig = normalized;
  raw.presentationSettings = normalized.settings || {};
  raw.presentationLayout = normalized.layout || {};
  raw.presentationStableLayout = normalized.stableLayout || normalized.layout || {};
  raw.presentationExtras = Array.isArray(normalized.textboxes) ? normalized.textboxes : [];
  raw.presentationStickers = Array.isArray(normalized.stickers) ? normalized.stickers : [];
  raw.presentationTextOverrides = normalized.text || normalized.textOverrides || {};
  raw.presentationValues = normalized.values || {};
  raw.groupId = groupId;

  sheet.getRange(rowNo, COL_PRESENTATION_JSON).setValue(safeJson_(normalized));
  sheet.getRange(rowNo, COL_PRESENTATION_VERSION).setValue(String(normalized.version || 6));
  sheet.getRange(rowNo, COL_PRESENTATION_UPDATED).setValue(new Date());
  sheet.getRange(rowNo, COL_RAW_JSON).setValue(safeJson_(raw));
  SpreadsheetApp.flush();

  return { ok:true, type:'saveGroupPresentation', feature:'manometer-highscore-best-speed-v95', message:'Gruppenpräsentation gespeichert.', groupId:groupId, rowNumber:rowNo, editorSaveId:normalized.editorSaveId };
}


function groupProgressPost_(body) {
  return jsonOutput_(groupProgress_(body || {}));
}

function groupProgress_(params) {
  let groupId = textValue_(params.groupId || params.g || params.groupToken || params.token);
  const deviceId = textValue_(params.deviceId || params.device || params.browserId);
  let resolvedByDevice = false;

  if (!groupId && deviceId) {
    groupId = resolveGroupIdFromDevice_(deviceId);
    resolvedByDevice = !!groupId;
  }

  const groupRegistry = groupId ? groupRegistryEntryForGroup_(groupId) : null;
  const registryGroupSize = groupRegistry && groupRegistry.groupSize ? groupRegistry.groupSize : 0;
  const requestedSize = Number(params.groupSize || params.size || registryGroupSize || 5);
  const groupSize = Math.max(4, Math.min(12, isNaN(requestedSize) ? 5 : requestedSize));

  const resultEntries = groupId ? getResultEntriesForGroup_(groupId) : [];
  const latestResult = resultEntries.length ? resultEntries[resultEntries.length - 1] : null;
  const feedbackEntries = groupId ? getFeedbackEntriesForGroup_(groupId) : [];
  const registryEntries = groupId ? getDeviceRegistryEntriesForGroup_(groupId) : [];
  const groupMembers = groupId ? membersForGroup_(groupId) : [];
  const memberByDevice = {};
  groupMembers.forEach(function(m){ if (m && m.deviceId) memberByDevice[textValue_(m.deviceId)] = m; });
  const hasPresentation = !!(latestResult && latestResult.data && latestResult.data.presentationV6 && Object.keys(latestResult.data.presentationV6).length);

  const participantNames = groupRegistry && groupRegistry.participants
    ? groupRegistry.participants.map(function(p){ return textValue_(p && (p.name || p)); }).filter(function(v){ return v; })
    : [];
  const assignedNames = groupRegistry && groupRegistry.assignments
    ? Object.keys(groupRegistry.assignments).map(function(role){ return textValue_(groupRegistry.assignments[role]); }).filter(function(v){ return v; })
    : [];
  const names = participantNames.length ? participantNames : assignedNames;

  return {
    ok: true,
    type: 'groupProgress',
    feature: 'manometer-highscore-best-speed-v95',
    resolvedByDevice: resolvedByDevice,
    deviceId: deviceId,
    groupId: groupId,
    groupName: (groupRegistry && groupRegistry.groupName) || (latestResult && (latestResult.groupName || (latestResult.data && latestResult.data.groupName))) || (feedbackEntries[0] && feedbackEntries[0].groupName) || groupId || '',
    groupSize: groupSize,
    groupRegistry: groupRegistry,
    groupMembers: groupMembers.map(function(m){ return { name: m.name || '', deviceId: m.deviceId || '', role: m.role || '', deviceType: m.deviceType || '', isPrimary: !!m.isPrimary }; }),
    names: groupMembers.length ? groupMembers.map(function(m){ return m.name || ''; }).filter(function(v){return v;}) : names,
    hasResult: !!latestResult,
    resultCount: resultEntries.length,
    latestResult: latestResult,
    hasPresentation: hasPresentation,
    feedbackCount: feedbackEntries.length,
    feedbackSlotsDone: Math.min(groupSize, feedbackEntries.length),
    feedbackEntries: feedbackEntries.map(function(e, i){ const m = memberByDevice[textValue_(e.deviceId)] || {}; return { slot: i + 1, timestamp: e.timestamp || '', groupId: e.groupId || '', deviceId: e.deviceId || '', name: m.name || e.assignedName || '', role: m.role || e.role || '' }; }),
    registeredDeviceCount: registryEntries.length,
    registeredDevices: registryEntries.map(function(e, i){ return { slot: i + 1, timestamp: e.timestamp || '', groupId: e.groupId || '', role: e.role || '', assignedName: e.assignedName || '' }; })
  };
}

function getResultEntriesForGroup_(groupId) {
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  const entries = [];
  const filter = textValue_(groupId);
  for (let r = 1; r < values.length; r++) {
    const row = values[r];
    if (isEmptyRow_(row)) continue;
    const entry = rowToEntry_(row, r + 1);
    if (filter && textValue_(entry.groupId) !== filter) continue;
    entries.push(entry);
  }
  return entries;
}

function getFeedbackEntriesForGroup_(groupId) {
  const sheet = getFeedbackSheet_();
  const values = sheet.getDataRange().getValues();
  const entries = [];
  const filter = textValue_(groupId);
  for (let r = 1; r < values.length; r++) {
    const row = values[r];
    if (isEmptyRow_(row)) continue;
    const entry = feedbackRowToEntry_(row, r + 1);
    if (filter && textValue_(entry.groupId) !== filter) continue;
    entries.push(entry);
  }
  return entries;
}

function getDeviceRegistryEntriesForGroup_(groupId) {
  const sheet = getDeviceRegistrySheet_();
  const values = sheet.getDataRange().getValues();
  const entries = [];
  const filter = textValue_(groupId);
  for (let r = 1; r < values.length; r++) {
    const row = values[r];
    if (isEmptyRow_(row)) continue;
    const entry = {
      deviceId: row[0] || '',
      timestamp: formatDate_(row[1]),
      groupId: row[2] || '',
      groupName: row[3] || '',
      role: row[4] || '',
      assignedName: row[5] || ''
    };
    if (filter && textValue_(entry.groupId) !== filter) continue;
    entries.push(entry);
  }
  return entries;
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
    feature: 'manometer-highscore-best-speed-v95',
    anonymous: true,
    groupIndependent: true,
    entries: entries,
    summary: summarizeFeedback_(entries),
    questions: MANOMETER_QUESTIONS,
    totalRows: entries.length,
    availableGroupIds: availableGroupIds.slice(0, 50),
    sprintHighscores: listSprintHighscores_('')
  });
}

function feedbackRowToEntry_(row, rowNumber) {
  let improvements = {};
  let raw = {};
  try { improvements = JSON.parse(row[13] || '{}'); } catch (err) { improvements = {}; }

  const hasSplitGeneralFields = row.length >= 22;
  const rawIndex = row.length >= 23 ? 22 : (hasSplitGeneralFields ? 21 : 18);

  try { raw = JSON.parse(row[rawIndex] || '{}'); } catch (err) { raw = {}; }

  function parsedListFromCell_(cell, fallback) {
    const base = (cell !== undefined && cell !== null && String(cell).trim() !== '') ? cell : fallback;
    return listFeedbackValues_(base);
  }

  const generalFeedback = row[14] || '';
  const generalPraise = hasSplitGeneralFields ? parsedListFromCell_(row[15], raw.generalPraise || raw.praise) : parsedListFromCell_(raw.generalPraise || raw.praise, '');
  const generalCriticism = hasSplitGeneralFields ? parsedListFromCell_(row[16], raw.generalCriticism || raw.criticism) : parsedListFromCell_(raw.generalCriticism || raw.criticism, '');
  const generalSuggestions = hasSplitGeneralFields ? parsedListFromCell_(row[17], raw.generalSuggestions || raw.suggestions) : parsedListFromCell_(raw.generalSuggestions || raw.suggestions, '');

  return {
    id: rowNumber,
    rowNumber: rowNumber,
    timestamp: formatDate_(row[0]),
    groupId: row[2] || '',
    groupName: row[3] || '',
    scores: {
      supervisionUnderstanding: numberFeedback_(row[4]),
      supervisionProcess: numberFeedback_(row[5]),
      supervisionBenefits: numberFeedback_(row[6]),
      futureSupervisionUse: numberFeedback_(row[7]),
      schoolSupervisionImportance: numberFeedback_(row[8]),
      presentationUnderstandable: numberFeedback_(row[9]),
      webAppTechnicalUnderstandable: numberFeedback_(row[10]),
      webAppContentUnderstandable: numberFeedback_(row[11]),
      simulationUnderstanding: numberFeedback_(row[12])
    },
    improvements: improvements,
    generalFeedback: generalFeedback,
    generalPraise: generalPraise,
    generalCriticism: generalCriticism,
    generalSuggestions: generalSuggestions,
    presentationMotivation: row.length >= 23 ? (row[18] || '') : (raw.presentationMotivation || raw.randomPresentationMotivation || ''),
    avoidCriticism: row.length >= 23 ? (row[19] || '') : (hasSplitGeneralFields ? (row[18] || '') : (row[15] || '')),
    llmUsed: row.length >= 23 ? (row[20] || '') : (hasSplitGeneralFields ? (row[19] || '') : (row[16] || '')),
    llmDetails: row.length >= 23 ? (row[21] || '') : (hasSplitGeneralFields ? (row[20] || '') : (row[17] || '')),
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
