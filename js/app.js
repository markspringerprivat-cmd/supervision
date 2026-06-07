
// Fallback: Damit die Google-Sheet-Anbindung auch funktioniert, wenn js/config.js
// versehentlich nicht mit hochgeladen oder vom Browser noch gecacht wurde.
const DEFAULT_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxCznTmGdJvYBpa7WUzAyR6BEv55pZ9I9vLrRxQKyHv5H6-i3tZKzyYV5X6jKM4plcg/exec";

function getAppsScriptUrl() {
  const fromConfig = window.SUPERVISION_CONFIG && window.SUPERVISION_CONFIG.APPS_SCRIPT_URL;
  return (fromConfig || DEFAULT_APPS_SCRIPT_URL || "").trim();
}

const ROLES = {
  supervisor: "Supervisor*in",
  schulleitung: "Schulleitung",
  "lehrkraft-a": "Lehrkraft A",
  "lehrkraft-b": "Lehrkraft B",
  protokoll: "Protokoll / Beobachtung"
};

const ROLE_FILES = {
  supervisor: "rolle-supervisor.html",
  schulleitung: "rolle-schulleitung.html",
  "lehrkraft-a": "rolle-lehrkraft-a.html",
  "lehrkraft-b": "rolle-lehrkraft-b.html"
};

const PHASES = {
  1: "Erstkontakt",
  2: "Problembeschreibung",
  3: "Zielformulierung",
  4: "Vertiefte Problembearbeitung",
  5: "Ergebnissicherung",
  6: "Reflexionstauglichkeit"
};

const ROLECARD = {
  supervisor: {
    title: "Rollenkarte: Supervisor*in",
    intro: "Du leitest die Gruppensupervision. Du bist nicht Schiedsrichter*in und gibst keine schnellen Lösungen vor. Deine Aufgabe ist, den Prozess zu strukturieren, Rollen zu klären und die Beteiligten zu einer gemeinsamen Arbeitsgrundlage zu führen.",
    bullets: [
      "Achte auf einen klaren Ablauf: erst verstehen, dann Ziele, dann Handlungsmöglichkeiten.",
      "Halte die Beteiligten bei Ich-Aussagen, konkreten Beobachtungen und respektvoller Sprache.",
      "Stoppe Schuldzuweisungen und vorschnelle Diagnosen über den Schüler.",
      "Sichere Zwischenergebnisse schriftlich auf deinen Moderationskarten."
    ],
    caseFocus: "Der Fall betrifft nicht nur Jamal als Schüler mit ESE-Förderbedarf. Im Zentrum steht auch ein Konflikt im Teamteaching zwischen Erfahrung, neuer Methodik und gemeinsamer Verantwortung."
  },
  schulleitung: {
    title: "Rollenkarte: Schulleitung",
    intro: "Du hast die Supervision angeregt, weil der Konflikt im Teamteaching nicht mehr allein zwischen den beiden Lehrkräften geklärt werden konnte. Dir geht es um Schutz, Verlässlichkeit und professionelle Zusammenarbeit.",
    bullets: [
      "Du beobachtest, dass Absprachen im Teamteaching fehlen oder unterschiedlich verstanden werden.",
      "Du machst dir Sorgen, dass Jamal und die Klasse unter den ungeklärten Erwachsenenabsprachen leiden.",
      "Du willst nicht einseitig Partei ergreifen, brauchst aber eine tragfähige Vereinbarung.",
      "Du kannst Ressourcen bereitstellen: Gesprächszeit, Absprachen im Kollegium, Unterstützung bei Förder- und Deeskalationsplanung."
    ],
    caseFocus: "Deine Leitfrage: Wie kann die Schule einen verlässlichen Rahmen schaffen, ohne eine der Lehrkräfte bloßzustellen?"
  },
  "lehrkraft-a": {
    title: "Rollenkarte: Lehrkraft A – erfahrene Teamteaching-Lehrkraft",
    intro: "Du arbeitest seit Jahren im Teamteaching und kennst Jamal schon länger. Du hast ein festes Vorgehen entwickelt, das aus deiner Sicht Stabilität gibt: klare Ansage, kurze Auszeit, Wiedereinstieg.",
    bullets: [
      "Du erlebst Lehrkraft B als Person, die deine Erfahrung nicht ausreichend respektiert.",
      "Als Lehrkraft B vor der Klasse eingreift, fühlst du dich untergraben.",
      "Du befürchtest, dass Jamal bei zu viel Verhandlung die Grenzen austestet.",
      "Du möchtest, dass klare Regeln gelten und du im Unterricht handlungsfähig bleibst."
    ],
    caseFocus: "Deine Spannung: Du willst Jamal unterstützen, aber du willst auch Verlässlichkeit, Autorität und Ruhe für die Klasse sichern."
  },
  "lehrkraft-b": {
    title: "Rollenkarte: Lehrkraft B – neue Teamteaching-Lehrkraft",
    intro: "Du bist neu im Teamteaching und möchtest stärker beziehungs- und ressourcenorientiert arbeiten. Du fragst dich, ob das bisherige Vorgehen Jamals Eskalationen eher stabilisiert als löst.",
    bullets: [
      "Du willst Jamal nicht vorschnell aus Situationen ausschließen.",
      "Du möchtest neue Methoden ausprobieren: Wahlmöglichkeiten, Deeskalationsplan, frühere Wahrnehmung von Auslösern.",
      "Du fühlst dich von Lehrkraft A wenig ernst genommen, weil auf Erfahrung verwiesen wird.",
      "Du willst Veränderung, aber nicht dauerhaft gegen die Kollegin/den Kollegen arbeiten."
    ],
    caseFocus: "Deine Spannung: Du willst pädagogisch anders ansetzen, musst aber lernen, Veränderungen im Team abzusprechen und nicht spontan vor der Klasse einzuführen."
  }
};

const CASE_TEXT = `Jamal ist 11 Jahre alt und besucht eine 5. Klasse im Gemeinsamen Lernen. Bei ihm liegt ein Förderbedarf im Bereich emotionale und soziale Entwicklung vor. Er reagiert schnell impulsiv, verweigert Aufgaben und provoziert Mitschüler*innen, besonders in offenen Arbeitsphasen.

In der Klasse arbeiten zwei Lehrkräfte im Teamteaching:

Lehrkraft A ist seit mehreren Jahren an der Schule, kennt Jamal schon länger und arbeitet nach einem festen Schema: klare Ansage, Sitzplatzwechsel, kurze Auszeit vor der Tür, danach Wiedereinstieg. Lehrkraft A sagt: „Bei Jamal hilft nur Konsequenz. Wenn wir da anfangen zu diskutieren, tanzt er uns auf der Nase herum.“

Lehrkraft B ist neu im Team und möchte stärker beziehungs- und ressourcenorientiert arbeiten. Sie schlägt vor, Jamal mehr Wahlmöglichkeiten zu geben, Eskalationsauslöser vorher zu erkennen und mit ihm einen individuellen Deeskalationsplan zu erarbeiten. Lehrkraft B sagt: „Ich glaube, wir verstärken sein Verhalten, wenn wir immer gleich mit Ausschluss reagieren.“

In einer Unterrichtsstunde eskaliert die Situation. Jamal verweigert eine Gruppenarbeit, ruft „Ich mach den Mist nicht“, wirft sein Arbeitsblatt weg und lacht, als andere Schüler*innen reagieren. Lehrkraft A will ihn sofort vor die Tür schicken. Lehrkraft B greift ein und sagt vor der Klasse: „Warte, vielleicht braucht er gerade eine andere Möglichkeit.“

Lehrkraft A fühlt sich dadurch vor der Klasse untergraben. Nach der Stunde sagt sie: „Du kannst mir nicht mitten im Unterricht in den Rücken fallen. Ich mache das hier seit Jahren.“

Lehrkraft B fühlt sich nicht ernst genommen und sagt: „Nur weil du es seit Jahren so machst, heißt das nicht, dass es für Jamal gut ist.“

Die Situation wird der Schulleitung gemeldet. Die Schulleitung schaltet eine Supervisor*in ein, weil der Konflikt inzwischen die Zusammenarbeit im Teamteaching belastet und Jamal immer stärker zum Auslöser eines Erwachsenenkonflikts wird.`;

const SUPERVISION_QUESTION = "Wie kann das Team einen gemeinsamen professionellen Umgang mit Jamal entwickeln, ohne dass der Konflikt zwischen den Lehrkräften weiter eskaliert?";

function slug(s) {
  return (s || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function b64urlEncode(obj) {
  const json = JSON.stringify(obj);
  return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(str) {
  try {
    str = (str || "").replace(/-/g, "+").replace(/_/g, "/");
    while (str.length % 4) str += "=";
    return JSON.parse(decodeURIComponent(escape(atob(str))));
  } catch (e) {
    return null;
  }
}

function qs() { return new URLSearchParams(window.location.search); }
function getGroupId() {
  const q = qs().get("g");
  if (q) return q;
  const stored = localStorage.getItem("sv_current_group");
  if (stored) return stored;
  const id = "gruppe-" + Date.now().toString(36);
  localStorage.setItem("sv_current_group", id);
  return id;
}

function key(suffix) { return `sv_${getGroupId()}_${suffix}`; }
function saveObj(k, obj) { localStorage.setItem(key(k), JSON.stringify(obj)); }
function loadObj(k, fallback = {}) {
  try { return JSON.parse(localStorage.getItem(key(k))) || fallback; } catch (e) { return fallback; }
}
function saveText(k, value) { localStorage.setItem(key(k), value || ""); }
function loadText(k) { return localStorage.getItem(key(k)) || ""; }

function hydrateFromQuery() {
  const group = qs().get("g");
  if (group) localStorage.setItem("sv_current_group", group);
  const assign = qs().get("assign");
  const decoded = b64urlDecode(assign);
  if (decoded) saveObj("assignments", decoded);
}

function currentQueryString() {
  const g = getGroupId();
  const assignments = loadObj("assignments", {});
  const params = new URLSearchParams();
  params.set("g", g);
  params.set("assign", b64urlEncode(assignments));
  return params.toString();
}

function linkWithState(file) {
  return `${file}?${currentQueryString()}`;
}

function enhanceLinks() {
  document.querySelectorAll("a[data-keep-state]").forEach(a => {
    const href = a.getAttribute("href");
    if (!href || href.startsWith("http") || href.startsWith("#")) return;
    a.setAttribute("href", linkWithState(href.split("?")[0]));
  });
}


function injectResetToolbar() {
  if (document.querySelector('.global-reset-toolbar')) return;
  const toolbar = document.createElement('div');
  toolbar.className = 'global-reset-toolbar';
  toolbar.innerHTML = `
    <button type="button" class="global-reset-btn secondary" id="clearCurrentPageBtn" title="Eingaben auf dieser Seite leeren">Aktuelle Seite leeren</button>
    <button type="button" class="global-reset-btn danger" id="resetAllPagesBtn" title="Alle lokal gespeicherten Eingaben zurücksetzen">Alles zurücksetzen</button>
  `;
  document.body.prepend(toolbar);
  document.body.classList.add('has-reset-toolbar');

  const currentBtn = toolbar.querySelector('#clearCurrentPageBtn');
  const allBtn = toolbar.querySelector('#resetAllPagesBtn');

  currentBtn.addEventListener('click', clearCurrentPageData);
  allBtn.addEventListener('click', resetAllLocalPageData);
}

function clearCurrentPageData() {
  const mode = document.body.dataset.mode || '';
  const ok = window.confirm('Möchtest du alle Eingaben auf der aktuellen Seite leeren?');
  if (!ok) return;

  document.querySelectorAll('textarea[data-save], input[data-save], select[data-save]').forEach(el => {
    const saveKey = el.dataset.save;
    if (saveKey) localStorage.removeItem(key(saveKey));
    if (el.tagName === 'SELECT') el.selectedIndex = 0;
    else el.value = '';
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });

  if (mode === 'roles') {
    localStorage.removeItem(key('namesInput'));
    localStorage.removeItem(key('assignments'));
    const namesInput = document.getElementById('namesInput');
    if (namesInput) namesInput.value = '';
    const assignedBox = document.getElementById('assignedBox');
    if (assignedBox) assignedBox.innerHTML = '';
    const roleCards = document.getElementById('roleCards');
    if (roleCards) roleCards.innerHTML = '';
    const status = document.getElementById('assignStatus');
    if (status) status.textContent = 'Diese Seite wurde geleert.';
  }

  if (mode === 'summary') {
    localStorage.removeItem(key('summary_group_name'));
    const groupName = document.getElementById('groupName');
    if (groupName) groupName.value = '';
    const status = document.getElementById('submitStatus');
    if (status) {
      status.className = 'notice';
      status.textContent = 'Die Eingaben dieser Seite wurden geleert.';
    }
  }
}

function resetAllLocalPageData() {
  const ok = window.confirm('Möchtest du wirklich alle lokal gespeicherten Eingaben dieser Website löschen? Das betrifft Rollenzuweisung, Notizen, Phasen, Zusammenfassung und Rundenmarkierungen in diesem Browser. Google-Sheet-Ergebnisse werden dadurch nicht gelöscht.');
  if (!ok) return;
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('sv_')) keysToRemove.push(k);
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
  window.location.href = 'index.html';
}

function initCommon() {
  hydrateFromQuery();
  injectResetToolbar();
  const groupIdEl = document.querySelector("[data-group-id]");
  if (groupIdEl) groupIdEl.textContent = getGroupId();
  enhanceLinks();
}

function initLanding() {
  initCommon();
}

function shuffle(arr) {
  return arr.map(v => [Math.random(), v]).sort((a,b) => a[0]-b[0]).map(x => x[1]);
}

function initRoleAssignment() {
  initCommon();
  const namesInput = document.getElementById("namesInput");
  const assignBtn = document.getElementById("assignBtn");
  const assignedBox = document.getElementById("assignedBox");
  const cardsBox = document.getElementById("roleCards");
  const status = document.getElementById("assignStatus");

  const storedNames = loadText("namesInput");
  if (storedNames) namesInput.value = storedNames;
  namesInput.addEventListener("input", () => saveText("namesInput", namesInput.value));

  function render(assignments) {
    assignedBox.innerHTML = "";
    const order = ["supervisor", "schulleitung", "lehrkraft-a", "lehrkraft-b", "protokoll"];
    order.forEach(role => {
      if (!assignments[role]) return;
      const li = document.createElement("li");
      li.innerHTML = `<span class="role-pill">${ROLES[role]}</span><br><strong>${escapeHtml(assignments[role])}</strong>`;
      assignedBox.appendChild(li);
    });

    cardsBox.innerHTML = "";
    ["supervisor", "schulleitung", "lehrkraft-a", "lehrkraft-b"].forEach(role => {
      const file = ROLE_FILES[role];
      const url = new URL(linkWithState(file), window.location.href).toString();
      const card = document.createElement("div");
      card.className = "card compact";
      card.innerHTML = `
        <div class="kachel-title">${ROLES[role]}</div>
        <p><strong>${escapeHtml(assignments[role] || "nicht zugewiesen")}</strong></p>
        <p class="small">Kachel öffnen oder QR-Code mit dem Handy scannen.</p>
        <div class="nav-row">
          <a class="button" href="${file}?${currentQueryString()}">Rollenkarte öffnen</a>
        </div>
        <p><img class="qr" alt="QR-Code für ${ROLES[role]}" src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}"></p>
        <p class="small"><a href="${file}?${currentQueryString()}">Direktlink</a></p>
      `;
      cardsBox.appendChild(card);
    });
    cardsBox.style.display = "grid";
  }

  assignBtn.addEventListener("click", () => {
    const names = namesInput.value.split(/\n|,/).map(s => s.trim()).filter(Boolean);
    if (names.length < 4) {
      status.className = "warning";
      status.textContent = "Bitte mindestens 4 Namen eintragen.";
      return;
    }
    const groupSlug = names.map(slug).filter(Boolean).join("-").slice(0, 80) || ("gruppe-" + Date.now().toString(36));
    localStorage.setItem("sv_current_group", groupSlug);
    const randomized = shuffle(names);
    const assignments = {
      supervisor: randomized[0],
      schulleitung: randomized[1],
      "lehrkraft-a": randomized[2],
      "lehrkraft-b": randomized[3]
    };
    if (randomized[4]) assignments.protokoll = randomized[4];
    saveObj("assignments", assignments);
    status.className = "success";
    status.textContent = "Rollen wurden zufällig zugeteilt. Die Kacheln und QR-Codes sind jetzt verfügbar.";
    render(assignments);
  });

  const existing = loadObj("assignments", null);
  if (existing && Object.keys(existing).length) render(existing);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getPageRole() { return document.body.dataset.role; }
function getPhase() { return Number(document.body.dataset.phase || "0"); }

function roleName(role) {
  const assignments = loadObj("assignments", {});
  return assignments[role] || "";
}

function initRoleCard() {
  initCommon();
  const role = getPageRole();
  const data = ROLECARD[role];
  const target = document.getElementById("roleCard");
  if (!data || !target) return;
  target.innerHTML = `
    <div class="card highlight">
      <p class="role-pill">${ROLES[role]}</p>
      <h2>${data.title}</h2>
      <p><strong>Zugewiesene Person:</strong> ${escapeHtml(roleName(role) || "nicht gesetzt")}</p>
      <p>${data.intro}</p>
      <h3>Deine Aufgabe</h3>
      <ul class="tight">${data.bullets.map(b => `<li>${b}</li>`).join("")}</ul>
      <h3>Fokus im Fall</h3>
      <p>${data.caseFocus}</p>
    </div>
    <div class="card">
      <h2>Fallgrundlage</h2>
      <div class="readonly-box">${escapeHtml(CASE_TEXT)}</div>
      <h3>Supervisionsfrage</h3>
      <div class="notice">${SUPERVISION_QUESTION}</div>
    </div>
  `;
  const next = document.getElementById("nextPrep");
  if (next) next.href = linkWithState(`gedanken-${role}.html`);
}

function initPrep() {
  initCommon();
  const role = getPageRole();
  const box = document.getElementById("prepBox");
  if (!box) return;
  const fields = prepFields(role);
  box.innerHTML = fields.map(f => `
    <label for="${f.id}">${f.label}</label>
    <p class="small">${f.hint || ""}</p>
    <textarea id="${f.id}" data-save="prep_${role}_${f.id}"></textarea>
  `).join("");
  setupSaving();
  const next = document.getElementById("startPhase1");
  if (next) next.href = linkWithState(`phase1-${role}.html`);
}

function prepFields(role) {
  if (role === "schulleitung") return [
    {id:"beobachtung", label:"Fasse deine Beobachtung kurz zusammen.", hint:"Was hast du im Teamteaching und im Umgang mit Jamal wahrgenommen?"},
    {id:"gefuehle", label:"Welche Gefühle hast du in der Situation?", hint:"Zum Beispiel Sorge, Ärger, Enttäuschung, Druck."},
    {id:"wuensche", label:"Welche Wünsche hast du an das Teamteaching?", hint:"Was sollen die Lehrkräfte klären oder verändern?"},
    {id:"loesung", label:"Erste Gedanken zu einem Lösungsvorschlag", hint:"Noch keine fertige Lösung. Nur erste Ideen."}
  ];
  if (role === "lehrkraft-a" || role === "lehrkraft-b") return [
    {id:"perspektive", label:"Fasse deine Perspektive kurz zusammen.", hint:"Was ist aus deiner Rolle das zentrale Problem?"},
    {id:"gefuehle", label:"Welche Gefühle hast du in der Situation?", hint:"Was löst der Konflikt bei dir aus?"},
    {id:"wuensche", label:"Welche Wünsche hast du an die anderen Beteiligten?", hint:"Was brauchst du für eine bessere Zusammenarbeit?"},
    {id:"ziele", label:"Gedanken zu konkreten Zielformulierungen", hint:"Was sollte am Ende der Supervision anders oder klarer sein?"}
  ];
  return [
    {id:"haltung", label:"Worauf willst du in deiner Moderation achten?", hint:"Zum Beispiel Allparteilichkeit, Struktur, keine Schuldzuweisungen."},
    {id:"fragen", label:"Welche Leitfragen möchtest du nutzen?", hint:"Notiere Fragen für Erstkontakt, Problembeschreibung und Zielklärung."},
    {id:"risiken", label:"Welche Gesprächsrisiken könnten auftreten?", hint:"Zum Beispiel Eskalation, Rechtfertigung, vorschnelle Lösung."}
  ];
}

function setupSaving() {
  document.querySelectorAll("textarea[data-save], input[data-save], select[data-save]").forEach(el => {
    const k = el.dataset.save;
    el.value = loadText(k);
    el.addEventListener("input", () => saveText(k, el.value));
  });
}

function initPhase() {
  initCommon();
  const role = getPageRole();
  const phase = getPhase();
  renderPhaseBar(phase);
  const title = document.getElementById("phaseTitle");
  if (title) title.textContent = `Phase ${phase}: ${PHASES[phase]}`;
  const content = document.getElementById("phaseContent");
  if (!content) return;
  if (role === "supervisor") content.innerHTML = supervisorPhase(phase);
  else content.innerHTML = participantPhase(role, phase);
  setupSaving();
  const next = document.getElementById("nextPhase");
  if (next) {
    if (phase < 6) next.href = linkWithState(`phase${phase+1}-${role}.html`);
    else next.href = role === "supervisor" ? linkWithState("zusammenfassung.html") : linkWithState("abschluss.html");
  }
}

function renderPhaseBar(active) {
  const bar = document.getElementById("phaseBar");
  if (!bar) return;
  bar.innerHTML = Object.entries(PHASES).map(([num, title]) => `<span class="${Number(num) === active ? "active" : ""}">${num}. ${title}</span>`).join("");
}

function supervisorPhase(phase) {
  const assignments = loadObj("assignments", {});
  if (phase === 1) return `
    <div class="two-col">
      <section class="card highlight">
        <h2>Moderationskarte</h2>
        <p><strong>Ziel:</strong> Einen sicheren Gesprächsrahmen herstellen und die Bereitschaft zur Konfliktbearbeitung klären.</p>
        <ol class="tight">
          <li>Begrüße die Beteiligten und benenne den Anlass neutral.</li>
          <li>Erkläre: Es geht nicht um Schuld, sondern um gemeinsame Klärung.</li>
          <li>Frage jede Person: „Sind Sie bereit, an einer Klärung mitzuwirken?“</li>
          <li>Frage: „Sind Sie bereit, die Perspektive der anderen zunächst anzuhören?“</li>
          <li>Lege Gesprächsregeln fest: ausreden lassen, Ich-Aussagen, konkrete Beobachtungen, keine Diagnosen über Jamal.</li>
        </ol>
      </section>
      <section class="card">
        <h2>Notizen Erstkontakt</h2>
        <label>Rahmen / Gesprächsregeln / Bereitschaft</label>
        <textarea data-save="sup_p1_rahmen" placeholder="z. B. Alle stimmen zu, eigene Perspektive einzubringen und die anderen anzuhören."></textarea>
      </section>
    </div>`;
  if (phase === 2) return `
    <div class="two-col">
      <section class="card highlight">
        <h2>Moderationskarte</h2>
        <p><strong>Ziel:</strong> Das Problem aus Sicht der Beteiligten beschreiben lassen, ohne sofort Lösungen zu suchen.</p>
        <ol class="tight">
          <li>Leite ein: „Die Schulleitung hat mich hinzugezogen, weil der Konflikt im Teamteaching nicht selbstständig geklärt werden konnte.“</li>
          <li>Gib zuerst der Schulleitung das Wort: Beobachtung, Gefühle, Wünsche.</li>
          <li>Gib Lehrkraft A und Lehrkraft B nacheinander das Wort.</li>
          <li>Bedanke dich nach jeder Perspektive und frage: „Habe ich das richtig verstanden?“</li>
          <li>Frage anschließend: „Möchte jemand etwas ergänzen, ohne zu bewerten?“</li>
        </ol>
      </section>
      <section class="card">
        <h2>Stichpunkte für die Tabelle</h2>
        <p class="small">Halte die Aussagen so fest, dass sie später sauber in der Ergebnistabelle erscheinen: Problem/Beobachtung, Gefühle und Wünsche jeweils getrennt nach Rolle.</p>
        <div class="role-note-block">
          <h3>Schulleitung</h3>
          ${noteArea("Problem / Beobachtung", "sup_p2_sl_probleme")}
          ${noteArea("Gefühle", "sup_p2_sl_gefuehle")}
          ${noteArea("Wünsche", "sup_p2_sl_wuensche")}
        </div>
        <div class="role-note-block">
          <h3>Lehrkraft A</h3>
          ${noteArea("Problem / Perspektive", "sup_p2_a_probleme")}
          ${noteArea("Gefühle", "sup_p2_a_gefuehle")}
          ${noteArea("Wünsche", "sup_p2_a_wuensche")}
        </div>
        <div class="role-note-block">
          <h3>Lehrkraft B</h3>
          ${noteArea("Problem / Perspektive", "sup_p2_b_probleme")}
          ${noteArea("Gefühle", "sup_p2_b_gefuehle")}
          ${noteArea("Wünsche", "sup_p2_b_wuensche")}
        </div>
      </section>
    </div>`;
  if (phase === 3) return `
    <div class="two-col">
      <section class="card highlight">
        <h2>Moderationskarte</h2>
        <p><strong>Ziel:</strong> Aus Einzelinteressen eine gemeinsame Arbeitsrichtung entwickeln.</p>
        <ol class="tight">
          <li>Bitte jede Person um eine individuelle Zielformulierung: „Was soll nach dieser Klärung anders sein?“</li>
          <li>Notiere Unterschiede und Gemeinsamkeiten.</li>
          <li>Frage: „Welches Ziel könnten alle mittragen?“</li>
          <li>Formuliere ein gemeinsames Ziel kurz, konkret und positiv.</li>
        </ol>
        <p class="notice"><strong>Beispiel:</strong> „Wir entwickeln eine verbindliche Absprache zum Umgang mit Jamals Eskalationen und klären, wie Lehrkraft A und B im Teamteaching vor der Klasse geschlossen handeln.“</p>
      </section>
      <section class="card">
        <h2>Ziele festhalten</h2>
        ${noteArea("Ziel Schulleitung", "sup_p3_ziel_sl")}
        ${noteArea("Ziel Lehrkraft A", "sup_p3_ziel_a")}
        ${noteArea("Ziel Lehrkraft B", "sup_p3_ziel_b")}
        ${noteArea("Gemeinsamkeiten", "sup_p3_gemeinsamkeiten")}
        ${noteArea("Gemeinsame Zielformulierung", "sup_p3_gemeinsames_ziel")}
      </section>
    </div>`;
  if (phase === 4) return `
    <div class="two-col">
      <section class="card highlight">
        <h2>Moderationskarte</h2>
        <p><strong>Ziel:</strong> Den Konflikt vertiefen, ohne ihn zu verschärfen. Schwerpunkt: Kritik äußern und Perspektiven anerkennen.</p>
        <ol class="tight">
          <li>Brainstorming: „Wie kann Kritik im Teamteaching so geäußert werden, dass sie nicht als persönlicher Angriff wirkt?“</li>
          <li>Sammle Kriterien für hilfreiche Kritik: konkret, zeitnah, unter vier Augen, Ich-Botschaft, Bezug auf Situation statt Person.</li>
          <li>Leite zur Anerkennungsrunde über: Jede Person nennt an der Perspektive einer anderen Person einen nachvollziehbaren oder hilfreichen Punkt.</li>
          <li>Kurze Paarungen im freien Gespräch: Schulleitung ↔ A, Schulleitung ↔ B, A ↔ B.</li>
        </ol>
      </section>
      <section class="card">
        <h2>Brainstorming festhalten</h2>
        ${noteArea("Kriterien für hilfreiche Kritik", "sup_p4_kritik")}
        ${noteArea("Anerkannte Stärken / Perspektiven", "sup_p4_anerkennung")}
        ${noteArea("Mögliche neue Absprachen", "sup_p4_absprachen")}
      </section>
    </div>`;
  if (phase === 5) return `
    <div class="two-col">
      <section class="card highlight">
        <h2>Moderationskarte</h2>
        <p><strong>Ziel:</strong> Die wichtigsten Ergebnisse sichtbar machen und Zustimmung prüfen.</p>
        <ol class="tight">
          <li>Fasse die Problembeschreibung zusammen: Welche Konfliktpunkte sind sichtbar geworden?</li>
          <li>Nenne die Wünsche der Beteiligten.</li>
          <li>Lies die gemeinsame Zielformulierung vor.</li>
          <li>Frage: „Können alle dieses Ziel mittragen?“</li>
          <li>Frage: „Sind alle bereit, gemeinsam an der Umsetzung zu arbeiten?“</li>
        </ol>
      </section>
      <section class="card">
        <h2>Automatische Zwischenergebnisse</h2>
        ${miniSummaryHtml()}
        <label>Zustimmung erfolgt?</label>
        <select data-save="sup_p5_zustimmung_status">
          <option value="">Bitte auswählen</option>
          <option value="Alle stimmen zu">Alle stimmen zu</option>
          <option value="Teilweise Zustimmung / offene Punkte">Teilweise Zustimmung / offene Punkte</option>
          <option value="Keine Zustimmung">Keine Zustimmung</option>
        </select>
        ${noteArea("Rückmeldungen / Zustimmung / offene Punkte", "sup_p5_zustimmung")}
      </section>
    </div>`;
  if (phase === 6) return `
    <div class="two-col">
      <section class="card highlight">
        <h2>Moderationskarte</h2>
        <p><strong>Ziel:</strong> Praxistauglichkeit der Zielformulierung mit der Schulleitung prüfen.</p>
        <ol class="tight">
          <li>Führe ein kurzes Einzelgespräch mit der Schulleitung.</li>
          <li>Prüfe: Ist die gemeinsame Zielformulierung im Schulalltag umsetzbar?</li>
          <li>Klärt: Welche Unterstützung kann die Schulleitung leisten?</li>
          <li>Klärt: Was ist der erste konkrete Schritt nach der Supervision?</li>
        </ol>
      </section>
      <section class="card">
        <h2>Praxistauglichkeit festhalten</h2>
        ${noteArea("Einschätzung der Praxistauglichkeit", "sup_p6_praxistauglichkeit")}
        ${noteArea("Unterstützung durch Schulleitung", "sup_p6_unterstuetzung")}
        ${noteArea("Erste konkrete Umsetzungsschritte", "sup_p6_umsetzung")}
      </section>
    </div>`;
  return "";
}

function noteArea(label, saveKey) {
  return `<label>${label}</label><textarea data-save="${saveKey}"></textarea>`;
}

function participantPhase(role, phase) {
  const roleLabel = ROLES[role];
  const prep = loadPrep(role);
  if (phase === 1) return simpleListen(roleLabel, "Höre dem/der Supervisor*in zu. Achte auf Gesprächsregeln, Bereitschaft zur Konfliktklärung und die Frage, ob du dich auf die Perspektiven der anderen einlassen kannst.");
  if (phase === 2) return `
    <section class="card highlight">
      <h2>Deine Aufgabe in Phase 2</h2>
      <p>Der/die Supervisor*in leitet die Problembeschreibung. Bringe deine Perspektive ein, wenn du das Wort bekommst. Bleibe bei Beobachtungen, Gefühlen und Wünschen.</p>
    </section>
    <section class="card">
      <h2>Deine vorbereiteten Gedanken</h2>
      ${prepHtml(prep)}
    </section>`;
  if (phase === 3) return `
    <section class="card highlight">
      <h2>Deine Aufgabe in Phase 3</h2>
      <p>Formuliere ein Ziel aus deiner Rolle. Es soll konkret, erreichbar und auf Zusammenarbeit bezogen sein.</p>
      <p class="notice">Satzanfang: „Mein Ziel wäre, dass …“</p>
      <label>Meine Zielformulierung</label>
      <textarea data-save="participant_${role}_phase3_ziel"></textarea>
    </section>`;
  if (phase === 4) return simpleListen(roleLabel, "Beteilige dich am Gespräch zur vertieften Problembearbeitung. Überlege: Wie kann Kritik geäußert werden, ohne das Gegenüber abzuwerten? Sage in der Anerkennungsrunde mindestens einen nachvollziehbaren Punkt an einer anderen Perspektive.");
  if (phase === 5) return simpleListen(roleLabel, "Höre die Zusammenfassung des/der Supervisor*in. Prüfe innerlich: Stimmen Problembeschreibung, Wünsche und Zielformulierung? Sage klar, ob du das gemeinsame Ziel mittragen kannst.");
  if (phase === 6) return simpleListen(roleLabel, role === "schulleitung" ? "Führe mit dem/der Supervisor*in das Gespräch zur Praxistauglichkeit. Kläre, wie du die Umsetzung organisatorisch unterstützen kannst." : "Die Reflexion zur Praxistauglichkeit findet vor allem zwischen Supervisor*in und Schulleitung statt. Warte auf den Abschluss oder nutze die Zeit, um deine persönliche Erkenntnis zu notieren.");
  return "";
}

function simpleListen(roleLabel, text) {
  return `<section class="card highlight"><p class="role-pill">${roleLabel}</p><h2>Gespräch mit Supervisor*in</h2><p>${text}</p></section>`;
}

function loadPrep(role) {
  const fields = prepFields(role);
  return fields.map(f => ({label: f.label, value: loadText(`prep_${role}_${f.id}`)}));
}

function prepHtml(items) {
  return items.map(item => `<h3>${escapeHtml(item.label)}</h3><div class="readonly-box">${escapeHtml(item.value || "Noch keine Notiz gespeichert.")}</div>`).join("");
}

function miniSummaryHtml() {
  const data = collectSupervisorData();
  const roleRows = [
    ["Schulleitung", data.p2.slProbleme, data.p2.slGefuehle, data.p2.slWuensche],
    ["Lehrkraft A", data.p2.aProbleme, data.p2.aGefuehle, data.p2.aWuensche],
    ["Lehrkraft B", data.p2.bProbleme, data.p2.bGefuehle, data.p2.bWuensche]
  ];
  return `
    <div class="table-wrap">
      <table class="summary-table">
        <thead><tr><th>Rolle</th><th>Problem / Perspektive</th><th>Gefühle</th><th>Wünsche</th></tr></thead>
        <tbody>${roleRows.map(r => `<tr><td><strong>${escapeHtml(r[0])}</strong></td><td>${escapeHtml(r[1] || "—")}</td><td>${escapeHtml(r[2] || "—")}</td><td>${escapeHtml(r[3] || "—")}</td></tr>`).join("")}</tbody>
      </table>
    </div>
    <div class="summary-block"><strong>Gemeinsame Zielvereinbarung:</strong><br>${escapeHtml(data.p3.gemeinsamesZiel || "Noch nicht notiert.")}</div>
    <div class="summary-block"><strong>Brainstorming / hilfreiche Kritik:</strong><br>${escapeHtml(data.p4.kritik || "Noch nicht notiert.")}</div>
    <div class="summary-block"><strong>Absprachen zum weiteren Vorgehen:</strong><br>${escapeHtml(data.p4.absprachen || "Noch nicht notiert.")}</div>
  `;
}

function shortLine(arr) { return arr.filter(Boolean).join("\n\n") || "Noch keine Notizen vorhanden."; }

function collectSupervisorData() {
  const assignments = loadObj("assignments", {});
  return {
    groupId: getGroupId(),
    groupName: Object.values(assignments).filter(Boolean).join(", "),
    assignments,
    timestamp: new Date().toISOString(),
    p1: { rahmen: loadText("sup_p1_rahmen") },
    p2: {
      slProbleme: loadText("sup_p2_sl_probleme"),
      slGefuehle: loadText("sup_p2_sl_gefuehle"),
      slWuensche: loadText("sup_p2_sl_wuensche"),
      aProbleme: loadText("sup_p2_a_probleme"),
      aGefuehle: loadText("sup_p2_a_gefuehle"),
      aWuensche: loadText("sup_p2_a_wuensche"),
      bProbleme: loadText("sup_p2_b_probleme"),
      bGefuehle: loadText("sup_p2_b_gefuehle"),
      bWuensche: loadText("sup_p2_b_wuensche")
    },
    p3: {
      zielSL: loadText("sup_p3_ziel_sl"), zielA: loadText("sup_p3_ziel_a"), zielB: loadText("sup_p3_ziel_b"),
      gemeinsamkeiten: loadText("sup_p3_gemeinsamkeiten"), gemeinsamesZiel: loadText("sup_p3_gemeinsames_ziel")
    },
    p4: { kritik: loadText("sup_p4_kritik"), anerkennung: loadText("sup_p4_anerkennung"), absprachen: loadText("sup_p4_absprachen") },
    p5: { zustimmung: [loadText("sup_p5_zustimmung_status"), loadText("sup_p5_zustimmung")].filter(Boolean).join("\n\n") },
    p6: { praxistauglichkeit: loadText("sup_p6_praxistauglichkeit"), unterstuetzung: loadText("sup_p6_unterstuetzung"), umsetzung: loadText("sup_p6_umsetzung") }
  };
}

function initSummary() {
  initCommon();
  const data = collectSupervisorData();
  const groupNameInput = document.getElementById("groupName");
  if (groupNameInput) {
    groupNameInput.value = loadText("summary_group_name") || data.groupName || data.groupId;
    groupNameInput.addEventListener("input", () => saveText("summary_group_name", groupNameInput.value));
  }
  renderSummary(data);
  const submitBtn = document.getElementById("submitResults");
  if (submitBtn) submitBtn.addEventListener("click", submitResults);
}

function renderSummary(data) {
  const target = document.getElementById("summaryContent");
  if (!target) return;
  target.innerHTML = `
    ${summarySection("Phase 1: Erstkontakt", data.p1)}
    ${summarySection("Phase 2: Problembeschreibung", data.p2)}
    ${summarySection("Phase 3: Zielformulierung", data.p3)}
    ${summarySection("Phase 4: Vertiefte Problembearbeitung", data.p4)}
    ${summarySection("Phase 5: Ergebnissicherung", data.p5)}
    ${summarySection("Phase 6: Reflexionstauglichkeit", data.p6)}
  `;
}

function summarySection(title, obj) {
  return `<section class="card"><h2>${title}</h2>${Object.entries(obj).map(([k,v]) => `<div class="summary-block"><strong>${labelize(k)}</strong><br>${escapeHtml(v || "—")}</div>`).join("")}</section>`;
}
function labelize(s) {
  const labels = {
    rahmen: "Rahmen / Gesprächsregeln / Bereitschaft",
    slProbleme: "Schulleitung - Probleme / Beobachtung",
    slGefuehle: "Schulleitung - Gefühle",
    slWuensche: "Schulleitung - Wünsche",
    aProbleme: "Lehrkraft A - Probleme / Perspektive",
    aGefuehle: "Lehrkraft A - Gefühle",
    aWuensche: "Lehrkraft A - Wünsche",
    bProbleme: "Lehrkraft B - Probleme / Perspektive",
    bGefuehle: "Lehrkraft B - Gefühle",
    bWuensche: "Lehrkraft B - Wünsche",
    zielSL: "Ziel Schulleitung",
    zielA: "Ziel Lehrkraft A",
    zielB: "Ziel Lehrkraft B",
    gemeinsamkeiten: "Gemeinsamkeiten",
    gemeinsamesZiel: "Gemeinsame Zielvereinbarung",
    kritik: "Brainstorming / hilfreiche Kritik",
    anerkennung: "Anerkennungsrunde / Perspektiven",
    absprachen: "Absprachen zum weiteren Vorgehen",
    zustimmung: "Zustimmung / Rückmeldung",
    praxistauglichkeit: "Einschätzung der Praxistauglichkeit",
    unterstuetzung: "Unterstützung durch Schulleitung",
    umsetzung: "Erste konkrete Umsetzungsschritte"
  };
  return labels[s] || s.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase());
}

function buildPayload() {
  const data = collectSupervisorData();
  const groupName = loadText("summary_group_name") || data.groupName || data.groupId;
  data.groupName = groupName;
  data.timestampLocal = new Date().toLocaleString("de-DE");
  return data;
}

async function submitResults() {
  const status = document.getElementById("submitStatus");
  const url = getAppsScriptUrl();
  if (!url) {
    status.className = "warning";
    status.textContent = "Keine Apps-Script-URL gefunden. Ergebnisse können nicht abgesendet werden.";
    return;
  }
  const payload = buildPayload();
  try {
    await fetch(url, { method: "POST", mode: "no-cors", body: JSON.stringify(payload), headers: { "Content-Type": "text/plain;charset=utf-8" } });
    status.className = "success";
    status.textContent = "Ergebnisse wurden abgesendet. Sie sind nun auf der Ergebnisseite sichtbar.";
  } catch (e) {
    status.className = "warning";
    status.textContent = "Senden fehlgeschlagen: " + e.message;
  }
}

function downloadJson() {
  const payload = buildPayload();
  const blob = new Blob([JSON.stringify(payload, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slug(payload.groupName || payload.groupId)}-supervision-ergebnis.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function normalizeResultResponse(response) {
  // Apps Script kann entweder direkt ein Array oder { ok:true, entries:[...] } liefern.
  if (Array.isArray(response)) return response;
  if (response && Array.isArray(response.entries)) return response.entries;
  if (response && Array.isArray(response.rows)) return response.rows;
  return [];
}

async function fetchResultsWithFallback(url) {
  // 1. Versuch: normales JSON per fetch. Funktioniert bei vielen Apps-Script-Web-Apps.
  try {
    const res = await fetch(`${url}?action=list&_=${Date.now()}`);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const json = await res.json();
    return normalizeResultResponse(json);
  } catch (fetchErr) {
    // 2. Versuch: JSONP. Dafür muss das Apps Script den callback-Parameter unterstützen.
    return new Promise((resolve, reject) => {
      const cbName = "svResultsCallback" + Date.now();
      const script = document.createElement("script");
      let done = false;
      const timer = setTimeout(() => {
        if (!done) {
          done = true;
          cleanup();
          reject(new Error("Ergebnisse konnten nicht geladen werden. Fetch und JSONP sind fehlgeschlagen."));
        }
      }, 8000);

      function cleanup() {
        clearTimeout(timer);
        try { delete window[cbName]; } catch (_) { window[cbName] = undefined; }
        if (script.parentNode) script.parentNode.removeChild(script);
      }

      window[cbName] = function(response) {
        if (done) return;
        done = true;
        const rows = normalizeResultResponse(response);
        cleanup();
        resolve(rows);
      };

      script.onerror = () => {
        if (done) return;
        done = true;
        cleanup();
        reject(new Error("JSONP-Verbindung fehlgeschlagen."));
      };

      script.src = `${url}?action=list&callback=${cbName}&_=${Date.now()}`;
      document.body.appendChild(script);
    });
  }
}


function formatResultTimestamp(value) {
  if (!value) return "";
  const raw = String(value).trim();
  const de = raw.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (de) {
    const [, d, m, y, hh, mm, ss] = de;
    return `${String(hh).padStart(2,"0")}:${mm}:${String(ss || "00").padStart(2,"0")} ${String(d).padStart(2,"0")}.${String(m).padStart(2,"0")}.${y}`;
  }
  const alt = raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s+(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (alt) {
    const [, hh, mm, ss, d, m, y] = alt;
    return `${String(hh).padStart(2,"0")}:${mm}:${String(ss || "00").padStart(2,"0")} ${String(d).padStart(2,"0")}.${String(m).padStart(2,"0")}.${y}`;
  }
  const date = new Date(raw);
  if (!Number.isNaN(date.getTime())) {
    const pad = n => String(n).padStart(2, "0");
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())} ${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
  }
  return raw;
}

function getRowTimestamp(row, data) {
  return row.timestamp || data.timestamp || data.timestampLocal || "";
}

function phaseDetails(title, obj) {
  return `<details class="phase-details"><summary>${escapeHtml(title)}</summary><div class="phase-content">${summaryInner(obj || {})}</div></details>`;
}

function summaryInner(obj) {
  const entries = Object.entries(obj || {});
  if (!entries.length) return `<div class="summary-block">Keine Einträge vorhanden.</div>`;
  return entries.map(([k, v]) => `<div class="summary-block"><strong>${labelize(k)}</strong><br>${escapeHtml(v || "—")}</div>`).join("");
}

let resultRowsCache = [];
let currentResultIndex = 0;
let currentVirtualIndex = 0;
let currentVirtualPosition = 0;
let rouletteFrame = null;
let randomSpinTimeout = null;
let randomSpinActive = false;
let carouselAnimationFrame = null;

function initResults() {
  initCommon();
  const status = document.getElementById("resultsStatus");
  const url = getAppsScriptUrl();
  const deleteBtn = document.getElementById("deleteAllBtn");
  const prevBtn = document.getElementById("prevGroupBtn");
  const nextBtn = document.getElementById("nextGroupBtn");
  const randomBtn = document.getElementById("randomGroupBtn");
  const resetRoundsBtn = document.getElementById("resetRoundsBtn");

  if (deleteBtn) deleteBtn.addEventListener("click", deleteAllResults);
  const resultsContent = document.getElementById("resultsContent");
  if (resultsContent) {
    resultsContent.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-delete-result]");
      if (btn) {
        event.preventDefault();
        deleteSingleResult(Number(btn.dataset.deleteResult));
      }
    });
    resultsContent.addEventListener("toggle", () => {
      window.setTimeout(() => updateActiveResult(false), 40);
    }, true);
  }
  if (prevBtn) prevBtn.addEventListener("click", () => moveResult(-1));
  if (nextBtn) nextBtn.addEventListener("click", () => moveResult(1));
  if (randomBtn) randomBtn.addEventListener("click", spinRandomGroup);
  if (resetRoundsBtn) resetRoundsBtn.addEventListener("click", resetRouletteRounds);
  renderRoundBadges();
  window.addEventListener("resize", () => { if (resultRowsCache.length) renderCarouselAt(currentVirtualPosition, false); });

  if (!url) {
    status.className = "warning";
    status.textContent = "Keine Apps-Script-URL gefunden. Ergebnisse können nicht geladen werden.";
    return;
  }

  status.className = "notice";
  status.textContent = "Ergebnisse werden geladen …";
  fetchResultsWithFallback(url)
    .then(rows => {
      status.textContent = "";
      resultRowsCache = rows || [];
      currentResultIndex = Math.max(0, resultRowsCache.length - 1);
      currentVirtualIndex = currentResultIndex;
      currentVirtualPosition = currentVirtualIndex;
      renderResults(resultRowsCache);
    })
    .catch(err => {
      status.className = "warning";
      status.textContent = err.message + " Prüfe die Web-App-Bereitstellung und den Zugriff 'Jeder'.";
    });
}

function renderResults(rows) {
  const target = document.getElementById("resultsContent");
  const controls = document.getElementById("resultsControls");
  if (!target) return;
  if (!rows.length) {
    if (controls) controls.hidden = true;
    target.innerHTML = `<div class="notice empty-results">Noch keine Ergebnisse vorhanden.</div>`;
    currentResultIndex = 0;
    currentVirtualIndex = 0;
    currentVirtualPosition = 0;
    updateCarouselCounter();
    syncRandomSelectionState();
    return;
  }
  if (controls) controls.hidden = false;
  if (!Number.isFinite(currentVirtualPosition)) currentVirtualPosition = rows.length - 1;
  currentVirtualIndex = Math.round(currentVirtualPosition);
  currentResultIndex = mod(currentVirtualIndex, rows.length);
  buildSlotTrack(currentVirtualIndex - 4, currentVirtualIndex + 4);
  positionSlotTrack(currentVirtualPosition, false);
  syncRandomSelectionState();
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

function resultCardHtml(row, index, virtualIndex = index) {
  const data = row.data || {};
  const timestamp = formatResultTimestamp(getRowTimestamp(row, data));
  const groupName = row.groupName || data.groupName || "Gruppe";
  return `<section class="card result-card slot-card" data-result-index="${index}" data-virtual-index="${virtualIndex}" aria-current="false">
    <button class="result-delete" type="button" data-delete-result="${index}" title="Diesen Eintrag löschen" aria-label="Diesen Eintrag löschen">×</button>
    <div class="result-card-head">
      <div>
        <h2>${escapeHtml(groupName)}</h2>
        <p class="small result-meta">${escapeHtml(timestamp)}</p>
      </div>
      <span class="result-number">${index + 1}</span>
    </div>
    ${phaseDetails("Phase 2: Problembeschreibung", data.p2 || {})}
    ${phaseDetails("Phase 3: Zielformulierung", data.p3 || {})}
    ${phaseDetails("Phase 4: Vertiefte Problembearbeitung", data.p4 || {})}
    ${phaseDetails("Phase 5 und 6: Umsetzung", Object.assign({}, data.p5 || {}, data.p6 || {}))}
  </section>`;
}

let slotFirstVirtual = 0;
let slotLastVirtual = 0;

function buildSlotTrack(firstVirtual, lastVirtual) {
  const track = document.getElementById("resultsContent");
  if (!track) return;
  const n = resultRowsCache.length;
  if (!n) return;
  slotFirstVirtual = Math.floor(firstVirtual);
  slotLastVirtual = Math.ceil(lastVirtual);
  const pieces = [];
  for (let virtual = slotFirstVirtual; virtual <= slotLastVirtual; virtual++) {
    const idx = mod(virtual, n);
    pieces.push(resultCardHtml(resultRowsCache[idx], idx, virtual));
  }
  track.innerHTML = pieces.join("");
  track.classList.add("slot-track");
}

function getSlotMetrics() {
  const carousel = document.getElementById("resultCarousel");
  const track = document.getElementById("resultsContent");
  const firstCard = track ? track.querySelector(".result-card") : null;
  if (!carousel || !track || !firstCard) return null;
  const style = window.getComputedStyle(track);
  const gap = parseFloat(style.columnGap || style.gap || "0") || 0;
  const cardWidth = firstCard.getBoundingClientRect().width;
  const step = cardWidth + gap;
  return { carousel, track, cardWidth, step };
}

function positionSlotTrack(position, smooth = false) {
  const metrics = getSlotMetrics();
  if (!metrics) return;
  const { carousel, track, step } = metrics;
  currentVirtualPosition = position;
  const focusVirtual = Math.round(position);
  currentVirtualIndex = focusVirtual;
  currentResultIndex = mod(focusVirtual, resultRowsCache.length);
  const local = position - slotFirstVirtual;
  const centerX = carousel.clientWidth / 2;
  const itemCenter = local * step + step / 2;
  const translate = centerX - itemCenter;
  track.style.transform = `translate3d(${translate}px, 0, 0)`;
  track.classList.toggle("is-spinning", !!randomSpinActive);
  track.classList.toggle("is-smooth", !!smooth && !randomSpinActive);
  updateSlotCardFocus(position);
  updateActiveResult(false);
}

function updateSlotCardFocus(position) {
  const track = document.getElementById("resultsContent");
  if (!track) return;
  const nearest = Math.round(position);
  const cards = track.querySelectorAll(".result-card");
  cards.forEach(card => {
    const virtual = Number(card.dataset.virtualIndex);
    const distance = Math.abs(virtual - position);
    const active = virtual === nearest;

    // Slot-Effekt: alle Kacheln bleiben gleich groß und weiß.
    // Nur die Fokus-Kachel wird stärker betont; seitliche Kacheln werden dezent transparent.
    const opacity = active ? 1 : Math.max(0.52, 0.82 - Math.min(distance, 3) * 0.12);
    const z = active ? 50 : Math.max(1, 30 - Math.round(distance * 4));

    card.classList.toggle("is-active", active);
    card.classList.toggle("is-side", !active);
    card.setAttribute("aria-current", active ? "true" : "false");
    card.style.transform = "translate3d(0,0,0) scale(1)";
    card.style.opacity = String(opacity);
    card.style.zIndex = String(z);
    card.style.filter = "none";
  });
}

function renderCarouselAt(position, smooth = false) {
  const focus = Math.round(position);
  if (focus - 4 < slotFirstVirtual || focus + 4 > slotLastVirtual) {
    buildSlotTrack(focus - 4, focus + 4);
  }
  positionSlotTrack(position, smooth);
}

function renderCarouselWindow(smooth = true) {
  renderCarouselAt(currentVirtualPosition, smooth);
}

function clampResultIndex() {
  if (!resultRowsCache.length) {
    currentResultIndex = 0;
    currentVirtualIndex = 0;
    currentVirtualPosition = 0;
    return;
  }
  currentResultIndex = mod(currentResultIndex, resultRowsCache.length);
  currentVirtualIndex = currentResultIndex;
  currentVirtualPosition = currentVirtualIndex;
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function easeOutQuart(t) {
  return 1 - Math.pow(1 - t, 4);
}

function animateCarouselTo(targetPosition, duration = 520, easing = easeOutCubic, onDone) {
  if (!resultRowsCache.length) return;
  if (carouselAnimationFrame) cancelAnimationFrame(carouselAnimationFrame);
  const startPosition = currentVirtualPosition;
  const minV = Math.floor(Math.min(startPosition, targetPosition)) - 5;
  const maxV = Math.ceil(Math.max(startPosition, targetPosition)) + 5;
  buildSlotTrack(minV, maxV);
  const start = performance.now();
  function frame(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = easing(t);
    const pos = startPosition + (targetPosition - startPosition) * eased;
    positionSlotTrack(pos, false);
    if (t < 1) {
      carouselAnimationFrame = requestAnimationFrame(frame);
      return;
    }
    carouselAnimationFrame = null;
    currentVirtualPosition = Math.round(targetPosition);
    currentVirtualIndex = Math.round(targetPosition);
    currentResultIndex = mod(currentVirtualIndex, resultRowsCache.length);
    buildSlotTrack(currentVirtualIndex - 4, currentVirtualIndex + 4);
    positionSlotTrack(currentVirtualPosition, true);
    if (typeof onDone === "function") onDone();
  }
  carouselAnimationFrame = requestAnimationFrame(frame);
}

function moveResult(delta) {
  if (!resultRowsCache.length || randomSpinActive) return;
  const target = Math.round(currentVirtualPosition) + delta;
  animateCarouselTo(target, 560, easeOutCubic);
}

function updateActiveResult(smooth = true) {
  const carousel = document.getElementById("resultCarousel");
  const activeCard = document.querySelector(".result-card.is-active");
  if (activeCard && carousel) {
    window.setTimeout(() => {
      const height = Math.max(activeCard.offsetHeight + 220, 560);
      carousel.style.minHeight = height + "px";
    }, smooth ? 60 : 0);
  }
  updateCarouselCounter();
}

function updateCarouselCounter() {
  const counter = document.getElementById("carouselCounter");
  if (!counter) return;
  const total = resultRowsCache.length;
  counter.textContent = total ? `${currentResultIndex + 1} / ${total}` : "0 / 0";
}


const SELECTED_RANDOM_KEY = "sv_results_selected_random_keys";
const ROUND_HISTORY_KEY = "sv_results_round_history";

function resultKey(row, index) {
  if (!row) return "idx:" + index;
  return String(row.rowNumber || row.id || row.groupName || ((row.data && row.data.groupName) || "gruppe")) + "::" + String(row.timestamp || (row.data && row.data.timestamp) || index);
}

function getCurrentResultKeys() {
  return resultRowsCache.map((row, index) => resultKey(row, index));
}

function readJsonArray(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

function writeJsonArray(key, value) {
  localStorage.setItem(key, JSON.stringify(Array.isArray(value) ? value : []));
}

function getSelectedRandomKeys() {
  return readJsonArray(SELECTED_RANDOM_KEY);
}

function setSelectedRandomKeys(keys) {
  writeJsonArray(SELECTED_RANDOM_KEY, Array.from(new Set(keys || [])));
}

function getRoundHistory() {
  return readJsonArray(ROUND_HISTORY_KEY);
}

function setRoundHistory(history) {
  writeJsonArray(ROUND_HISTORY_KEY, history || []);
}

function syncRandomSelectionState() {
  const current = new Set(getCurrentResultKeys());
  const selected = getSelectedRandomKeys().filter(key => current.has(key));
  setSelectedRandomKeys(selected);

  const history = getRoundHistory().filter(item => item && current.has(item.key));
  setRoundHistory(history);
  renderRoundBadges();
  updateRandomAvailability();
}

function getUnselectedResultIndexes() {
  const selected = new Set(getSelectedRandomKeys());
  const indexes = [];
  resultRowsCache.forEach((row, index) => {
    if (!selected.has(resultKey(row, index))) indexes.push(index);
  });
  return indexes;
}

function allResultsHaveBeenRandomlySelected() {
  return !!resultRowsCache.length && getUnselectedResultIndexes().length === 0;
}

function renderRoundBadges(activeRound = null) {
  const box = document.getElementById("roundBadges");
  if (!box) return;
  const history = getRoundHistory();
  box.innerHTML = "";
  history.forEach((item, idx) => {
    const badge = document.createElement("span");
    const roundNumber = idx + 1;
    badge.className = "round-badge" + (activeRound === roundNumber ? " is-current" : "");
    badge.textContent = "Runde " + roundNumber;
    if (item && item.groupName) badge.title = item.groupName;
    box.appendChild(badge);
  });
}

function registerRandomSelection(index) {
  const row = resultRowsCache[index];
  const key = resultKey(row, index);
  const groupName = row && (row.groupName || (row.data && row.data.groupName)) || "Gruppe";
  const selected = getSelectedRandomKeys();
  if (!selected.includes(key)) selected.push(key);
  setSelectedRandomKeys(selected);

  const history = getRoundHistory();
  history.push({ key, groupName, timestamp: new Date().toISOString() });
  setRoundHistory(history);
  renderRoundBadges(history.length);
  return history.length;
}


function resetRouletteRounds() {
  setSelectedRandomKeys([]);
  setRoundHistory([]);
  renderRoundBadges();
  updateRandomAvailability();
  const status = document.getElementById('resultsStatus');
  if (status) {
    status.className = 'notice';
    status.textContent = 'Runden wurden zurückgesetzt. Alle Gruppen können wieder gezogen werden.';
  }
}

function updateRandomAvailability() {
  const btn = document.getElementById("randomGroupBtn");
  if (!btn || randomSpinActive) return;
  if (!resultRowsCache.length) {
    btn.disabled = true;
    btn.textContent = "Zufallsauswahl starten";
    return;
  }
  if (allResultsHaveBeenRandomlySelected()) {
    btn.disabled = true;
    btn.textContent = "Keine weiteren Einträge verfügbar";
  } else {
    btn.disabled = false;
    btn.textContent = "Zufallsauswahl starten";
  }
}

function spinRandomGroup() {
  if (!resultRowsCache.length) return;
  const btn = document.getElementById("randomGroupBtn");
  const status = document.getElementById("resultsStatus");
  if (randomSpinActive) return;

  const available = getUnselectedResultIndexes();
  if (!available.length) {
    if (status) {
      status.className = "warning";
      status.textContent = "Keine weiteren Einträge verfügbar.";
    }
    updateRandomAvailability();
    return;
  }

  if (carouselAnimationFrame) cancelAnimationFrame(carouselAnimationFrame);
  if (rouletteFrame) cancelAnimationFrame(rouletteFrame);

  randomSpinActive = true;
  const n = resultRowsCache.length;
  const duration = 7000 + Math.floor(Math.random() * 5001); // 7–12 Sekunden
  const startPosition = currentVirtualPosition;
  const loops = Math.max(12, Math.ceil(duration / 650));

  // Nur Gruppen, die in dieser Runde noch nicht gezogen wurden, dürfen Ziel sein.
  const targetIndex = available[Math.floor(Math.random() * available.length)];
  const base = Math.ceil(startPosition) + loops * n;
  const deltaToTarget = mod(targetIndex - mod(base, n), n);
  const targetPosition = base + deltaToTarget;

  const minV = Math.floor(startPosition) - 6;
  const maxV = Math.ceil(targetPosition) + 6;
  buildSlotTrack(minV, maxV);
  const start = performance.now();

  if (btn) {
    btn.disabled = true;
    btn.textContent = "Zufallsauswahl läuft …";
  }
  if (status) {
    status.className = "notice";
    status.textContent = "Das Rad läuft …";
  }

  function frame(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = easeOutQuart(t);
    const pos = startPosition + (targetPosition - startPosition) * eased;
    positionSlotTrack(pos, false);

    if (t < 1) {
      rouletteFrame = requestAnimationFrame(frame);
      return;
    }

    rouletteFrame = null;
    randomSpinActive = false;
    currentVirtualPosition = Math.round(targetPosition);
    currentVirtualIndex = Math.round(targetPosition);
    currentResultIndex = mod(currentVirtualIndex, n);
    buildSlotTrack(currentVirtualIndex - 4, currentVirtualIndex + 4);
    positionSlotTrack(currentVirtualPosition, true);

    const chosen = resultRowsCache[currentResultIndex];
    const chosenName = chosen && (chosen.groupName || (chosen.data && chosen.data.groupName)) || "Gruppe";
    registerRandomSelection(currentResultIndex);

    if (status) {
      status.className = "success";
      status.textContent = chosenName;
    }
    updateRandomAvailability();
    startConfetti(6000);
  }

  rouletteFrame = requestAnimationFrame(frame);
}

function startConfetti(durationMs = 6000) {
  const colors = ["#ef4444", "#f97316", "#f59e0b", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#84cc16", "#14b8a6"];
  let layer = document.querySelector(".confetti-layer");
  if (layer) layer.remove();
  layer = document.createElement("div");
  layer.className = "confetti-layer";
  document.body.appendChild(layer);
  const count = 150;
  for (let i = 0; i < count; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = (Math.random() * 1.1) + "s";
    piece.style.animationDuration = (3.8 + Math.random() * 2.8) + "s";
    piece.style.setProperty("--drift", (Math.random() * 220 - 110) + "px");
    piece.style.setProperty("--rot", (Math.random() * 720 - 360) + "deg");
    piece.style.width = (7 + Math.random() * 8) + "px";
    piece.style.height = (9 + Math.random() * 12) + "px";
    layer.appendChild(piece);
  }
  window.setTimeout(() => {
    if (layer && layer.parentNode) layer.parentNode.removeChild(layer);
  }, durationMs + 1800);
}

function deleteSingleResult(index) {
  const row = resultRowsCache[index];
  const url = getAppsScriptUrl();
  const status = document.getElementById("resultsStatus");
  if (!row || !url) {
    if (status) {
      status.className = "warning";
      status.textContent = "Dieser Eintrag kann aktuell nicht gelöscht werden.";
    }
    return;
  }
  const rowNumber = row.rowNumber || row.id;
  if (!rowNumber) {
    if (status) {
      status.className = "warning";
      status.textContent = "Für diesen Eintrag wurde keine Tabellenzeile übermittelt.";
    }
    return;
  }
  const label = row.groupName || (row.data && row.data.groupName) || "diesen Eintrag";
  const password = prompt(`Passwort zum Löschen von „${label}“ eingeben:`);
  if (!password) return;
  if (!confirm(`Eintrag „${label}“ wirklich löschen?`)) return;
  if (status) {
    status.className = "notice";
    status.textContent = "Eintrag wird gelöscht …";
  }
  callAppsScriptJsonp(url, { action: "delete", rowNumber, password })
    .then(response => {
      if (!response || !response.ok) throw new Error((response && response.error) || "Löschen fehlgeschlagen.");
      if (status) {
        status.className = "success";
        status.textContent = "Eintrag wurde gelöscht.";
      }
      return fetchResultsWithFallback(url);
    })
    .then(rows => {
      resultRowsCache = rows || [];
      if (currentResultIndex >= resultRowsCache.length) currentResultIndex = Math.max(0, resultRowsCache.length - 1);
      renderResults(resultRowsCache);
    })
    .catch(() => {
      sendDeleteRowByHiddenFrame(url, rowNumber, password)
        .then(() => fetchResultsWithFallback(url))
        .then(rows => {
          const before = resultRowsCache.length;
          resultRowsCache = rows || [];
          if (currentResultIndex >= resultRowsCache.length) currentResultIndex = Math.max(0, resultRowsCache.length - 1);
          renderResults(resultRowsCache);
          if (status) {
            if (resultRowsCache.length < before) {
              status.className = "success";
              status.textContent = "Eintrag wurde gelöscht.";
            } else {
              status.className = "warning";
              status.textContent = "Löschversuch abgeschlossen, der Eintrag ist aber noch vorhanden. Prüfe Passwort und Apps-Script-Version.";
            }
          }
        })
        .catch(() => {
          if (status) {
            status.className = "warning";
            status.textContent = "Verbindung zum Apps Script fehlgeschlagen. Prüfe, ob der neue Code.gs bereitgestellt wurde und der Zugriff auf 'Jeder' steht.";
          }
        });
    });
}

function deleteAllResults() {
  const url = getAppsScriptUrl();
  const status = document.getElementById("resultsStatus");
  if (!url) {
    if (status) {
      status.className = "warning";
      status.textContent = "Keine Apps-Script-URL gefunden. Löschen ist nicht möglich.";
    }
    return;
  }
  const password = prompt("Passwort zum Löschen aller Ergebnisse eingeben:");
  if (!password) return;
  if (!confirm("Wirklich alle Ergebnisse aus dem Google Sheet löschen?")) return;

  if (status) {
    status.className = "notice";
    status.textContent = "Löschbefehl wird gesendet …";
  }

  callAppsScriptJsonp(url, { action: "deleteall", password })
    .then(response => {
      if (!response || !response.ok) throw new Error((response && response.error) || "Löschen fehlgeschlagen.");
      if (status) {
        status.className = "success";
        status.textContent = "Alle Ergebnisse wurden gelöscht.";
      }
      resultRowsCache = [];
      currentResultIndex = 0;
      renderResults([]);
    })
    .catch(() => {
      // Fallback ohne CORS/JSONP: lädt die Lösch-URL unsichtbar als iframe.
      // Danach wird erneut ausgelesen. Das hilft, wenn Apps Script zwar löscht,
      // aber die JSONP-Antwort vom Browser blockiert wird.
      sendDeleteByHiddenFrame(url, password)
        .then(() => fetchResultsWithFallback(url))
        .then(rows => {
          resultRowsCache = rows || [];
          currentResultIndex = Math.max(0, resultRowsCache.length - 1);
          renderResults(resultRowsCache);
          if (status) {
            if (!resultRowsCache.length) {
              status.className = "success";
              status.textContent = "Alle Ergebnisse wurden gelöscht.";
            } else {
              status.className = "warning";
              status.textContent = "Löschversuch abgeschlossen, es sind aber noch Einträge vorhanden. Prüfe Passwort und Apps-Script-Version.";
            }
          }
        })
        .catch(err => {
          if (status) {
            status.className = "warning";
            status.textContent = "Verbindung zum Apps Script fehlgeschlagen. Prüfe, ob der neue Code.gs bereitgestellt wurde und der Zugriff auf 'Jeder' steht.";
          }
        });
    });
}

function sendDeleteByHiddenFrame(url, password) {
  return new Promise(resolve => {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = `${url}?action=deleteall&password=${encodeURIComponent(password)}&_=${Date.now()}`;
    document.body.appendChild(iframe);
    setTimeout(() => {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      resolve();
    }, 2500);
  });
}

function sendDeleteRowByHiddenFrame(url, rowNumber, password) {
  return new Promise(resolve => {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = `${url}?action=delete&rowNumber=${encodeURIComponent(rowNumber)}&password=${encodeURIComponent(password)}&_=${Date.now()}`;
    document.body.appendChild(iframe);
    setTimeout(() => {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      resolve();
    }, 2500);
  });
}

function callAppsScriptJsonp(url, params) {
  return new Promise((resolve, reject) => {
    const cbName = "svActionCallback" + Date.now() + Math.floor(Math.random() * 100000);
    const script = document.createElement("script");
    const query = new URLSearchParams(Object.assign({}, params, { callback: cbName, _: Date.now() }));
    let done = false;
    const timer = setTimeout(() => {
      if (!done) {
        done = true;
        cleanup();
        reject(new Error("Aktion konnte nicht ausgeführt werden."));
      }
    }, 8000);
    function cleanup() {
      clearTimeout(timer);
      try { delete window[cbName]; } catch (_) { window[cbName] = undefined; }
      if (script.parentNode) script.parentNode.removeChild(script);
    }
    window[cbName] = function(response) {
      if (done) return;
      done = true;
      cleanup();
      resolve(response);
    };
    script.onerror = () => {
      if (done) return;
      done = true;
      cleanup();
      reject(new Error("Verbindung zum Apps Script fehlgeschlagen."));
    };
    script.src = `${url}?${query.toString()}`;
    document.body.appendChild(script);
  });
}

function initGoogleTest() {
  initCommon();
  const url = getAppsScriptUrl();
  const out = document.getElementById("configuredUrl");
  const status = document.getElementById("testStatus");
  const link = document.getElementById("openScriptLink");
  if (out) out.textContent = url || "Keine URL gefunden";
  if (link) link.href = url || "#";
  const btn = document.getElementById("testListBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    if (!url) {
      status.className = "warning";
      status.textContent = "Keine Apps-Script-URL gefunden.";
      return;
    }
    status.className = "notice";
    status.textContent = "Teste Verbindung ...";
    fetchResultsWithFallback(url)
      .then(rows => {
        status.className = "success";
        status.textContent = "Verbindung funktioniert. Empfangene Einträge: " + rows.length;
      })
      .catch(err => {
        status.className = "warning";
        status.textContent = "Verbindung fehlgeschlagen: " + err.message;
      });
  });
}


function applyDeviceClass() {
  const mobileLike = window.matchMedia && window.matchMedia("(max-width: 900px)").matches;
  document.body.classList.toggle("is-mobile", !!mobileLike);
  document.body.classList.toggle("is-desktop", !mobileLike);
}

window.addEventListener("DOMContentLoaded", () => {
  applyDeviceClass();
  window.addEventListener("resize", applyDeviceClass);
  const mode = document.body.dataset.mode;
  if (mode === "landing") initLanding();
  if (mode === "roles") initRoleAssignment();
  if (mode === "rolecard") initRoleCard();
  if (mode === "prep") initPrep();
  if (mode === "phase") initPhase();
  if (mode === "summary") initSummary();
  if (mode === "results") initResults();
  if (mode === "google-test") initGoogleTest();
});
