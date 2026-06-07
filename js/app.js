
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

function initCommon() {
  hydrateFromQuery();
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
const RESULTS_ADMIN_PASSWORD = "Mark123";
let resultsAdminActive = false;

function initResults() {
  initCommon();
  const status = document.getElementById("resultsStatus");
  const url = getAppsScriptUrl();
  const adminBtn = document.getElementById("adminLoginBtn");
  const deleteBtn = document.getElementById("deleteAllBtn");
  const prevBtn = document.getElementById("prevGroupBtn");
  const nextBtn = document.getElementById("nextGroupBtn");
  const randomBtn = document.getElementById("randomGroupBtn");
  const resetRoundsBtn = document.getElementById("resetRoundsBtn");

  resultsAdminActive = sessionStorage.getItem("sv_results_admin") === "1";
  applyResultsAdminState();

  if (adminBtn) {
    adminBtn.addEventListener("click", () => {
      if (resultsAdminActive) {
        if (confirm("Administrationsmodus beenden?")) {
          sessionStorage.removeItem("sv_results_admin");
          resultsAdminActive = false;
          applyResultsAdminState();
          renderResults(resultRowsCache);
        }
        return;
      }
      const password = prompt("Administrator-Passwort eingeben:");
      if (password === null) return;
      if (password === RESULTS_ADMIN_PASSWORD) {
        sessionStorage.setItem("sv_results_admin", "1");
        resultsAdminActive = true;
        applyResultsAdminState();
        renderResults(resultRowsCache);
        if (status) {
          status.className = "success";
          status.textContent = "Administrationsmodus aktiviert.";
        }
      } else {
        if (status) {
          status.className = "warning";
          status.textContent = "Falsches Passwort.";
        }
      }
    });
  }

  if (deleteBtn) deleteBtn.addEventListener("click", deleteAllResults);
  const resultsContent = document.getElementById("resultsContent");
  if (resultsContent) {
    resultsContent.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-delete-result]");
      if (btn) {
        event.preventDefault();
        if (!resultsAdminActive) return;
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
  if (resetRoundsBtn) resetRoundsBtn.addEventListener("click", () => {
    if (confirm("Alle bisherigen Roulette-Runden zurücksetzen? Die Google-Sheet-Ergebnisse bleiben erhalten.")) {
      resetRouletteRounds(false);
    }
  });
  renderRoundBadges();
  window.addEventListener("resize", () => {
    if (resultRowsCache.length && resultsAdminActive) renderCarouselAt(currentVirtualPosition, false);
  });

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

function applyResultsAdminState() {
  document.body.classList.toggle("is-admin-results", !!resultsAdminActive);
  document.body.classList.toggle("public-results", !resultsAdminActive);
  document.querySelectorAll(".admin-only").forEach(el => {
    el.hidden = !resultsAdminActive;
  });
  const adminBtn = document.getElementById("adminLoginBtn");
  if (adminBtn) {
    adminBtn.textContent = resultsAdminActive ? "Administration aktiv" : "Administrator";
    adminBtn.classList.toggle("success-btn", !!resultsAdminActive);
  }
}

function renderResults(rows) {
  const target = document.getElementById("resultsContent");
  const controls = document.getElementById("resultsControls");
  if (!target) return;
  if (!rows.length) {
    if (controls) controls.hidden = true;
    target.className = "result-track public-list";
    target.innerHTML = `<div class="notice empty-results">Noch keine Ergebnisse vorhanden.</div>`;
    currentResultIndex = 0;
    currentVirtualIndex = 0;
    currentVirtualPosition = 0;
    updateCarouselCounter();
    syncRandomSelectionState();
    return;
  }

  if (!resultsAdminActive) {
    if (controls) controls.hidden = true;
    target.className = "result-track public-list";
    target.style.transform = "none";
    target.innerHTML = rows.map((row, index) => resultCardHtml(row, index, index)).join("");
    target.querySelectorAll(".result-card").forEach(card => {
      card.classList.add("is-active", "public-result-card");
      card.classList.remove("is-side");
      card.setAttribute("aria-current", "true");
      card.style.opacity = "1";
      card.style.filter = "none";
      card.style.transform = "none";
      card.style.zIndex = "auto";
    });
    updateCarouselCounter();
    return;
  }

  if (controls) controls.hidden = false;
  target.className = "result-track";
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
  if (!resultsAdminActive) return;
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
  if (!resultsAdminActive) return;
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
  if (!resultsAdminActive) return;
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



// ------------------------------------------------------------
// Lokale Reset-Funktionen
// ------------------------------------------------------------
function localStorageKeysStartingWith(prefix) {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(prefix)) keys.push(k);
  }
  return keys;
}


const DEFAULT_GROUP_PARTICIPANTS = [
  "Sophie Sack",
  "Melina Kristin Stetten",
  "Marie Ueffing",
  "Jonas Radermacher",
  "Lea Marie Rahmer",
  "Bao Linh Truong",
  "Lena Bolz",
  "Alessa Fabienne Etzbach",
  "Sina Marie Schmidt",
  "Eileen Dörner",
  "Luca Sophie Mund",
  "Lisa-Marie Schmidt",
  "Leonie Grignard",
  "Luise Harms",
  "Maja Mester",
  "Jonas Beuke",
  "Clara Pesch",
  "Lisabeth Zirwes"
];
const GROUP_ASSIGNMENT_NAMES_KEY = "sv_group_assignment_names";
const GROUP_ASSIGNMENT_GROUPS_KEY = "sv_group_assignment_groups";

function getGroupAssignmentNames() {
  try {
    const stored = JSON.parse(localStorage.getItem(GROUP_ASSIGNMENT_NAMES_KEY) || "null");
    if (Array.isArray(stored)) return stored;
  } catch (e) {}
  return DEFAULT_GROUP_PARTICIPANTS.slice();
}

function saveGroupAssignmentNames(names) {
  localStorage.setItem(GROUP_ASSIGNMENT_NAMES_KEY, JSON.stringify(names));
}

function saveGroupAssignmentGroups(groups) {
  localStorage.setItem(GROUP_ASSIGNMENT_GROUPS_KEY, JSON.stringify(groups));
}

function getGroupAssignmentGroups() {
  try {
    const stored = JSON.parse(localStorage.getItem(GROUP_ASSIGNMENT_GROUPS_KEY) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch (e) { return []; }
}

function buildMinimumFourGroups(names) {
  const clean = names.map(n => String(n || "").trim()).filter(Boolean);
  const shuffled = shuffle(clean);
  const n = shuffled.length;
  if (n < 4) return [];

  const groupCount = Math.max(1, Math.floor(n / 4));
  const groups = Array.from({ length: groupCount }, () => []);
  shuffled.forEach((name, index) => {
    groups[index % groupCount].push(name);
  });

  // Bei sehr kleinen Sonderfällen bleibt eine einzelne Gruppe mit 4+ Personen bestehen.
  // Bei normalen Gruppengrößen entstehen dadurch Größen wie 4/4/5/5 statt eine 3er-Restgruppe.
  return groups;
}

function initGroupAssignment() {
  initCommon();
  const list = document.getElementById("participantList");
  const input = document.getElementById("participantName");
  const addBtn = document.getElementById("addParticipantBtn");
  const buildBtn = document.getElementById("buildGroupsBtn");
  const resetBtn = document.getElementById("resetParticipantsBtn");
  const clearBtn = document.getElementById("clearParticipantsBtn");
  const output = document.getElementById("groupsOutput");
  const count = document.getElementById("participantCount");
  const status = document.getElementById("groupAssignStatus");
  let names = getGroupAssignmentNames();

  function setStatus(text, cls = "notice") {
    if (!status) return;
    status.className = cls;
    status.textContent = text;
  }

  function renderNames() {
    if (!list) return;
    list.innerHTML = "";
    names.forEach((name, index) => {
      const li = document.createElement("li");
      li.innerHTML = `<span class="name-index">${index + 1}</span><span class="name-text">${escapeHtml(name)}</span><button type="button" class="icon-remove" aria-label="${escapeHtml(name)} löschen">×</button>`;
      li.querySelector("button").addEventListener("click", () => {
        names.splice(index, 1);
        saveGroupAssignmentNames(names);
        saveGroupAssignmentGroups([]);
        renderNames();
        renderGroups([]);
        setStatus("Name wurde gelöscht. Die Gruppen müssen neu gebildet werden.", "notice");
      });
      list.appendChild(li);
    });
    if (count) count.textContent = String(names.length);
  }

  function renderGroups(groups = getGroupAssignmentGroups()) {
    if (!output) return;
    output.innerHTML = "";
    if (!groups.length) {
      output.className = "group-output empty-state";
      output.textContent = "Noch keine Gruppen gebildet.";
      return;
    }
    output.className = "group-output";
    groups.forEach((group, index) => {
      const card = document.createElement("div");
      card.className = "assignment-group-card";
      const items = group.map(name => `<li>${escapeHtml(name)}</li>`).join("");
      card.innerHTML = `<h3>Gruppe ${index + 1}<span class="group-size-pill">${group.length} Personen</span></h3><ol>${items}</ol>`;
      output.appendChild(card);
    });
  }

  function addName() {
    const value = (input && input.value || "").trim();
    if (!value) {
      setStatus("Bitte zuerst einen Namen eintragen.", "warning");
      return;
    }
    names.push(value);
    saveGroupAssignmentNames(names);
    if (input) input.value = "";
    renderNames();
    setStatus("Name wurde hinzugefügt. Du kannst die Gruppen neu bilden.", "success");
  }

  if (addBtn) addBtn.addEventListener("click", addName);
  if (input) input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      addName();
    }
  });

  if (buildBtn) buildBtn.addEventListener("click", () => {
    if (names.length < 4) {
      setStatus("Für die Gruppenzuweisung werden mindestens 4 Personen benötigt.", "warning");
      saveGroupAssignmentGroups([]);
      renderGroups([]);
      return;
    }
    const groups = buildMinimumFourGroups(names);
    saveGroupAssignmentGroups(groups);
    renderGroups(groups);
    const sizes = groups.map(g => g.length).join(" / ");
    setStatus(`Gruppen wurden zufällig gebildet. Gruppengrößen: ${sizes}.`, "success");
  });

  if (resetBtn) resetBtn.addEventListener("click", () => {
    if (!confirm("Ursprungsliste neu laden? Eigene Änderungen an der Teilnehmendenliste gehen verloren.")) return;
    names = DEFAULT_GROUP_PARTICIPANTS.slice();
    saveGroupAssignmentNames(names);
    saveGroupAssignmentGroups([]);
    renderNames();
    renderGroups([]);
    setStatus("Ursprungsliste wurde geladen.", "success");
  });

  if (clearBtn) clearBtn.addEventListener("click", () => {
    if (!confirm("Gesamte Teilnehmendenliste leeren?")) return;
    names = [];
    saveGroupAssignmentNames(names);
    saveGroupAssignmentGroups([]);
    renderNames();
    renderGroups([]);
    setStatus("Teilnehmendenliste wurde geleert.", "notice");
  });

  renderNames();
  renderGroups();
}

function clearAllLocalSupervisionData(options = {}) {
  const keepGoogleSheet = true; // Google-Sheet-Daten liegen extern und werden hier nie gelöscht.
  localStorageKeysStartingWith("sv_").forEach(k => localStorage.removeItem(k));
  if (!options.silent) {
    alert("Alle lokal gespeicherten Arbeitsdaten wurden gelöscht. Die Google-Sheet-Ergebnisse bleiben erhalten.");
  }
}

function clearCurrentPageInputs() {
  const mode = document.body.dataset.mode || "";
  let changed = false;

  document.querySelectorAll("textarea[data-save], input[data-save], select[data-save]").forEach(el => {
    const suffix = el.dataset.save;
    if (suffix) {
      localStorage.removeItem(key(suffix));
      changed = true;
    }
    if (el.tagName === "SELECT") el.selectedIndex = 0;
    else el.value = "";
  });

  if (mode === "roles") {
    localStorage.removeItem(key("namesInput"));
    localStorage.removeItem(key("assignments"));
    changed = true;
    const namesInput = document.getElementById("namesInput");
    const assignedBox = document.getElementById("assignedBox");
    const roleCards = document.getElementById("roleCards");
    const status = document.getElementById("assignStatus");
    if (namesInput) namesInput.value = "";
    if (assignedBox) assignedBox.innerHTML = "";
    if (roleCards) { roleCards.innerHTML = ""; roleCards.style.display = "none"; }
    if (status) { status.className = "notice"; status.textContent = "Die aktuelle Rollenverteilung wurde geleert."; }
  }

  if (mode === "summary") {
    localStorage.removeItem(key("summary_group_name"));
    changed = true;
    const input = document.getElementById("groupNameInput");
    if (input) input.value = "";
    if (typeof renderSummary === "function") renderSummary();
  }

  if (mode === "results") {
    resetRouletteRounds(false);
    changed = true;
  }

  if (mode === "groupassignment") {
    localStorage.removeItem(GROUP_ASSIGNMENT_NAMES_KEY);
    localStorage.removeItem(GROUP_ASSIGNMENT_GROUPS_KEY);
    changed = true;
    if (typeof initGroupAssignment === "function") {
      window.location.reload();
      return;
    }
  }

  if (changed) {
    const msg = document.getElementById("pageResetStatus");
    if (msg) msg.textContent = "Aktuelle Seite wurde lokal geleert.";
    else alert("Die lokalen Eingaben der aktuellen Seite wurden geleert.");
  } else {
    alert("Auf dieser Seite wurden keine lokalen Eingabefelder gefunden.");
  }
}

function installLocalResetControls() {
  const header = document.querySelector("header");
  if (!header || document.querySelector(".local-reset-bar")) return;

  const bar = document.createElement("div");
  bar.className = "local-reset-bar";
  bar.innerHTML = `
    <div class="wrap local-reset-inner">
      <span class="local-reset-label">Lokale Arbeitsdaten</span>
      <button type="button" class="secondary small-reset" id="clearPageBtn">Aktuelle Seite leeren</button>
      <button type="button" class="secondary small-reset" id="clearAllLocalBtn">Alles lokal zurücksetzen</button>
      <span id="pageResetStatus" class="local-reset-status" aria-live="polite"></span>
    </div>`;
  header.insertAdjacentElement("afterend", bar);

  const clearPageBtn = document.getElementById("clearPageBtn");
  const clearAllBtn = document.getElementById("clearAllLocalBtn");

  if (clearPageBtn) {
    clearPageBtn.addEventListener("click", () => {
      if (confirm("Lokale Eingaben auf der aktuellen Seite leeren?")) clearCurrentPageInputs();
    });
  }

  if (clearAllBtn) {
    clearAllBtn.addEventListener("click", () => {
      if (!confirm("Alle lokal gespeicherten Arbeitsdaten dieser Website löschen? Google-Sheet-Ergebnisse bleiben erhalten.")) return;
      clearAllLocalSupervisionData({ silent: true });
      window.location.href = "index.html";
    });
  }
}

function resetRouletteRounds(showAlert = true) {
  localStorage.removeItem(SELECTED_RANDOM_KEY);
  localStorage.removeItem(ROUND_HISTORY_KEY);
  renderRoundBadges();
  updateRandomAvailability();
  const status = document.getElementById("resultsStatus");
  if (status) {
    status.className = "success";
    status.textContent = "Runden wurden zurückgesetzt. Alle Gruppen sind wieder für die Zufallsauswahl verfügbar.";
  }
  if (showAlert) {
    // Kein alert auf der Ergebnisseite nötig; Status reicht.
  }
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
  installLocalResetControls();
  if (mode === "landing") initLanding();
  if (mode === "roles") initRoleAssignment();
  if (mode === "groupassignment") initGroupAssignment();
  if (mode === "rolecard") initRoleCard();
  if (mode === "prep") initPrep();
  if (mode === "phase") initPhase();
  if (mode === "summary") initSummary();
  if (mode === "results") initResults();
  if (mode === "google-test") initGoogleTest();
});

/* ============================================================
   ROBUSTE KORREKTUREN: Admin-Login Ergebnisse + Gruppenzuweisung
   Diese Funktionen überschreiben ältere Definitionen im Prototyp.
   ============================================================ */

function applyResultsAdminState() {
  document.body.classList.toggle("is-admin-results", !!resultsAdminActive);
  document.body.classList.toggle("public-results", !resultsAdminActive);

  document.querySelectorAll(".admin-only").forEach(el => {
    if (resultsAdminActive) {
      el.hidden = false;
      el.style.display = "";
    } else {
      el.hidden = true;
      el.style.display = "none";
    }
  });

  document.querySelectorAll(".result-delete").forEach(el => {
    el.style.display = resultsAdminActive ? "" : "none";
  });

  const adminBtn = document.getElementById("adminLoginBtn");
  if (adminBtn) {
    adminBtn.disabled = false;
    adminBtn.style.pointerEvents = "auto";
    adminBtn.textContent = resultsAdminActive ? "Administration aktiv" : "Administrator";
    adminBtn.classList.toggle("success-btn", !!resultsAdminActive);
  }
}

function initResults() {
  initCommon();
  const status = document.getElementById("resultsStatus");
  const url = getAppsScriptUrl();
  const adminBtn = document.getElementById("adminLoginBtn");
  const deleteBtn = document.getElementById("deleteAllBtn");
  const prevBtn = document.getElementById("prevGroupBtn");
  const nextBtn = document.getElementById("nextGroupBtn");
  const randomBtn = document.getElementById("randomGroupBtn");
  const resetRoundsBtn = document.getElementById("resetRoundsBtn");
  const resultsContent = document.getElementById("resultsContent");

  // Admin-Modus wird bewusst NICHT dauerhaft gespeichert.
  // Beim Öffnen der Seite sind Zufallsauswahl, Navigation und Löschen immer ausgeblendet.
  sessionStorage.removeItem("sv_results_admin");
  resultsAdminActive = false;
  applyResultsAdminState();

  if (adminBtn) {
    adminBtn.onclick = () => {
      if (resultsAdminActive) {
        resultsAdminActive = false;
        sessionStorage.removeItem("sv_results_admin");
        applyResultsAdminState();
        renderResults(resultRowsCache);
        if (status) {
          status.className = "notice";
          status.textContent = "Administrationsmodus beendet.";
        }
        return;
      }

      const password = prompt("Administrator-Passwort eingeben:");
      if (password === null) return;

      if (password === "Mark123") {
        resultsAdminActive = true;
        applyResultsAdminState();
        renderResults(resultRowsCache);
        if (status) {
          status.className = "success";
          status.textContent = "Administrationsmodus aktiviert.";
        }
      } else {
        resultsAdminActive = false;
        applyResultsAdminState();
        if (status) {
          status.className = "warning";
          status.textContent = "Falsches Passwort.";
        }
      }
    };
  }

  if (deleteBtn) deleteBtn.onclick = deleteAllResults;
  if (prevBtn) prevBtn.onclick = () => moveResult(-1);
  if (nextBtn) nextBtn.onclick = () => moveResult(1);
  if (randomBtn) randomBtn.onclick = spinRandomGroup;
  if (resetRoundsBtn) {
    resetRoundsBtn.onclick = () => {
      if (confirm("Alle bisherigen Roulette-Runden zurücksetzen? Die Google-Sheet-Ergebnisse bleiben erhalten.")) {
        resetRouletteRounds(false);
      }
    };
  }

  if (resultsContent) {
    resultsContent.onclick = (event) => {
      const btn = event.target.closest("[data-delete-result]");
      if (!btn) return;
      event.preventDefault();
      if (!resultsAdminActive) return;
      deleteSingleResult(Number(btn.dataset.deleteResult));
    };
    resultsContent.addEventListener("toggle", () => {
      window.setTimeout(() => updateActiveResult(false), 40);
    }, true);
  }

  renderRoundBadges();
  window.addEventListener("resize", () => {
    if (resultRowsCache.length && resultsAdminActive) renderCarouselAt(currentVirtualPosition, false);
  });

  if (!url) {
    if (status) {
      status.className = "warning";
      status.textContent = "Keine Apps-Script-URL gefunden. Ergebnisse können nicht geladen werden.";
    }
    return;
  }

  if (status) {
    status.className = "notice";
    status.textContent = "Ergebnisse werden geladen …";
  }

  fetchResultsWithFallback(url)
    .then(rows => {
      resultRowsCache = rows || [];
      currentResultIndex = Math.max(0, resultRowsCache.length - 1);
      currentVirtualIndex = currentResultIndex;
      currentVirtualPosition = currentVirtualIndex;
      if (status) status.textContent = "";
      renderResults(resultRowsCache);
    })
    .catch(err => {
      if (status) {
        status.className = "warning";
        status.textContent = err.message + " Prüfe die Web-App-Bereitstellung und den Zugriff 'Jeder'.";
      }
    });
}

function getGroupAssignmentNames() {
  try {
    const stored = JSON.parse(localStorage.getItem(GROUP_ASSIGNMENT_NAMES_KEY) || "null");
    // Wenn durch eine alte Version eine leere Liste gespeichert wurde, wird die Ursprungsliste wiederhergestellt.
    if (Array.isArray(stored) && stored.length >= 4) return stored;
  } catch (e) {}
  localStorage.setItem(GROUP_ASSIGNMENT_NAMES_KEY, JSON.stringify(DEFAULT_GROUP_PARTICIPANTS));
  return DEFAULT_GROUP_PARTICIPANTS.slice();
}

function initGroupAssignment() {
  initCommon();
  const list = document.getElementById("participantList");
  const input = document.getElementById("participantName");
  const addBtn = document.getElementById("addParticipantBtn");
  const buildBtn = document.getElementById("buildGroupsBtn");
  const resetBtn = document.getElementById("resetParticipantsBtn");
  const clearBtn = document.getElementById("clearParticipantsBtn");
  const output = document.getElementById("groupsOutput");
  const count = document.getElementById("participantCount");
  const status = document.getElementById("groupAssignStatus");
  let names = getGroupAssignmentNames();

  function setStatus(text, cls = "notice") {
    if (!status) return;
    status.className = cls;
    status.textContent = text;
  }

  function persistNames() {
    saveGroupAssignmentNames(names);
  }

  function renderNames() {
    if (!list) return;
    list.innerHTML = "";
    names.forEach((name, index) => {
      const li = document.createElement("li");
      li.innerHTML = `<span class="name-index">${index + 1}</span><span class="name-text">${escapeHtml(name)}</span><button type="button" class="icon-remove" aria-label="${escapeHtml(name)} löschen">×</button>`;
      const removeBtn = li.querySelector("button");
      removeBtn.onclick = () => {
        names.splice(index, 1);
        persistNames();
        saveGroupAssignmentGroups([]);
        renderNames();
        renderGroups([]);
        setStatus("Name wurde gelöscht. Die Gruppen müssen neu gebildet werden.", "notice");
      };
      list.appendChild(li);
    });
    if (count) count.textContent = String(names.length);
  }

  function renderGroups(groups = getGroupAssignmentGroups()) {
    if (!output) return;
    output.innerHTML = "";
    if (!groups.length) {
      output.className = "group-output empty-state";
      output.textContent = "Noch keine Gruppen gebildet.";
      return;
    }
    output.className = "group-output";
    groups.forEach((group, index) => {
      const card = document.createElement("div");
      card.className = "assignment-group-card";
      const items = group.map(name => `<li>${escapeHtml(name)}</li>`).join("");
      card.innerHTML = `<h3>Gruppe ${index + 1}<span class="group-size-pill">${group.length} Personen</span></h3><ol>${items}</ol>`;
      output.appendChild(card);
    });
  }

  function addName() {
    const value = (input && input.value || "").trim();
    if (!value) {
      setStatus("Bitte zuerst einen Namen eintragen.", "warning");
      return;
    }
    names.push(value);
    persistNames();
    saveGroupAssignmentGroups([]);
    if (input) input.value = "";
    renderNames();
    renderGroups([]);
    setStatus("Name wurde hinzugefügt. Du kannst die Gruppen neu bilden.", "success");
  }

  if (addBtn) addBtn.onclick = addName;
  if (input) input.onkeydown = e => {
    if (e.key === "Enter") {
      e.preventDefault();
      addName();
    }
  };

  if (buildBtn) buildBtn.onclick = () => {
    if (names.length < 4) {
      setStatus("Für die Gruppenzuweisung werden mindestens 4 Personen benötigt.", "warning");
      saveGroupAssignmentGroups([]);
      renderGroups([]);
      return;
    }
    const groups = buildMinimumFourGroups(names);
    saveGroupAssignmentGroups(groups);
    renderGroups(groups);
    const sizes = groups.map(g => g.length).join(" / ");
    setStatus(`Gruppen wurden zufällig gebildet. Gruppengrößen: ${sizes}.`, "success");
  };

  if (resetBtn) resetBtn.onclick = () => {
    if (!confirm("Ursprungsliste neu laden? Eigene Änderungen an der Teilnehmendenliste gehen verloren.")) return;
    names = DEFAULT_GROUP_PARTICIPANTS.slice();
    persistNames();
    saveGroupAssignmentGroups([]);
    renderNames();
    renderGroups([]);
    setStatus("Ursprungsliste wurde geladen.", "success");
  };

  if (clearBtn) clearBtn.onclick = () => {
    if (!confirm("Gesamte Teilnehmendenliste leeren?")) return;
    names = [];
    localStorage.setItem(GROUP_ASSIGNMENT_NAMES_KEY, JSON.stringify(names));
    saveGroupAssignmentGroups([]);
    renderNames();
    renderGroups([]);
    setStatus("Teilnehmendenliste wurde geleert. Mit 'Ursprungsliste laden' kannst du die vorbereiteten Namen wiederherstellen.", "notice");
  };

  renderNames();
  renderGroups();
}

/* ============================================================
   FINAL OVERRIDE: globaler Adminmodus, geschützte Gruppenzuweisung,
   Ergebnis-Carousel auch ohne Admin
   ============================================================ */
const GLOBAL_ADMIN_KEY_FINAL = "sv_global_admin_active";
const GLOBAL_ADMIN_PASSWORD_FINAL = "Mark123";

function isGlobalAdminActive() {
  return sessionStorage.getItem(GLOBAL_ADMIN_KEY_FINAL) === "1";
}

function setGlobalAdminActive(value) {
  if (value) sessionStorage.setItem(GLOBAL_ADMIN_KEY_FINAL, "1");
  else sessionStorage.removeItem(GLOBAL_ADMIN_KEY_FINAL);
  resultsAdminActive = isGlobalAdminActive();
  updateGlobalAdminUi();
  if (document.body.dataset.mode === "results") {
    applyResultsAdminState();
    if (Array.isArray(resultRowsCache)) renderResults(resultRowsCache);
  }
  if (document.body.dataset.mode === "groupassignment") {
    updateGroupAssignmentAccess();
  }
}

function handleGlobalAdminClick() {
  if (isGlobalAdminActive()) {
    if (confirm("Administrationsmodus beenden?")) {
      setGlobalAdminActive(false);
    }
    return;
  }
  const password = prompt("Administrator-Passwort eingeben:");
  if (password === null) return;
  if (password === GLOBAL_ADMIN_PASSWORD_FINAL) {
    setGlobalAdminActive(true);
  } else {
    alert("Falsches Passwort.");
    setGlobalAdminActive(false);
  }
}

function installGlobalAdminControlsFinal() {
  // Vorhandene Administrator-Buttons auf Start-/Ergebnis-/Adminseiten an globale Logik anbinden.
  let buttons = Array.from(document.querySelectorAll("#globalAdminBtn, #adminLoginBtn, [data-admin-login]"));

  // Auf Seiten ohne eigenen Adminbutton oben im Header ergänzen.
  if (!buttons.length) {
    const headerWrap = document.querySelector("header .wrap");
    if (headerWrap) {
      headerWrap.classList.add("topbar");
      let actions = headerWrap.querySelector(".header-actions");
      if (!actions) {
        actions = document.createElement("div");
        actions.className = "header-actions";
        headerWrap.appendChild(actions);
      }
      const btn = document.createElement("button");
      btn.id = "globalAdminBtn";
      btn.className = "secondary";
      btn.type = "button";
      btn.setAttribute("data-admin-login", "true");
      btn.textContent = "Administrator";
      actions.prepend(btn);
      buttons = [btn];
    }
  }

  buttons.forEach(btn => {
    btn.disabled = false;
    btn.style.pointerEvents = "auto";
    btn.onclick = handleGlobalAdminClick;
  });

  updateGlobalAdminUi();
}

function updateGlobalAdminUi() {
  const active = isGlobalAdminActive();
  document.body.classList.toggle("is-global-admin", active);

  document.querySelectorAll("#globalAdminBtn, #adminLoginBtn, [data-admin-login]").forEach(btn => {
    btn.disabled = false;
    btn.style.pointerEvents = "auto";
    btn.textContent = active ? "Administration aktiv" : "Administrator";
    btn.classList.toggle("success-btn", active);
    btn.classList.toggle("secondary", !active);
  });

  let chip = document.getElementById("globalAdminStatusChip");
  const resetInner = document.querySelector(".local-reset-inner");
  const headerActions = document.querySelector("header .header-actions");
  const host = resetInner || headerActions;
  if (host) {
    if (!chip) {
      chip = document.createElement("span");
      chip.id = "globalAdminStatusChip";
      chip.className = "admin-session-chip is-off";
      chip.setAttribute("aria-live", "polite");
      host.prepend(chip);
    }
    chip.textContent = active ? "Adminmodus aktiv" : "Adminmodus aus";
    chip.classList.toggle("is-off", !active);
  }

  updateAdminProtectedLinks();
}

function updateAdminProtectedLinks() {
  const active = isGlobalAdminActive();
  document.querySelectorAll("[data-admin-required]").forEach(el => {
    el.classList.toggle("is-locked", !active);
    el.setAttribute("aria-disabled", active ? "false" : "true");
    el.title = active ? "" : "Nur im Administrationsmodus verfügbar";
    el.onclick = (event) => {
      if (isGlobalAdminActive()) return true;
      event.preventDefault();
      alert("Die Gruppenzuweisung ist nur im Administrationsmodus verfügbar. Bitte oben auf Administrator klicken und das Passwort eingeben.");
      return false;
    };
  });
}

function applyResultsAdminState() {
  resultsAdminActive = isGlobalAdminActive();
  document.body.classList.toggle("is-admin-results", !!resultsAdminActive);
  document.body.classList.toggle("public-results", !resultsAdminActive);

  document.querySelectorAll(".admin-only").forEach(el => {
    if (resultsAdminActive) {
      el.hidden = false;
      el.style.display = "";
      el.style.visibility = "visible";
    } else {
      el.hidden = true;
      el.style.display = "none";
      el.style.visibility = "hidden";
    }
  });

  document.querySelectorAll(".result-delete").forEach(el => {
    el.style.display = resultsAdminActive ? "inline-flex" : "none";
    el.style.visibility = resultsAdminActive ? "visible" : "hidden";
  });

  const controls = document.getElementById("resultsControls");
  if (controls) {
    controls.hidden = false;
    controls.style.display = "flex";
    controls.style.visibility = "visible";
  }

  const randomArea = document.querySelector(".random-area");
  if (randomArea) {
    randomArea.style.display = resultsAdminActive ? "inline-flex" : "none";
    randomArea.style.visibility = resultsAdminActive ? "visible" : "hidden";
  }

  const deleteAll = document.getElementById("deleteAllBtn");
  if (deleteAll) {
    deleteAll.style.display = resultsAdminActive ? "inline-flex" : "none";
    deleteAll.style.visibility = resultsAdminActive ? "visible" : "hidden";
  }

  updateGlobalAdminUi();
}

function initResults() {
  initCommon();
  installGlobalAdminControlsFinal();

  const status = document.getElementById("resultsStatus");
  const url = getAppsScriptUrl();
  const deleteBtn = document.getElementById("deleteAllBtn");
  const prevBtn = document.getElementById("prevGroupBtn");
  const nextBtn = document.getElementById("nextGroupBtn");
  const randomBtn = document.getElementById("randomGroupBtn");
  const resetRoundsBtn = document.getElementById("resetRoundsBtn");
  const resultsContent = document.getElementById("resultsContent");

  resultsAdminActive = isGlobalAdminActive();
  applyResultsAdminState();

  if (deleteBtn) deleteBtn.onclick = deleteAllResults;
  if (prevBtn) prevBtn.onclick = () => moveResult(-1);
  if (nextBtn) nextBtn.onclick = () => moveResult(1);
  if (randomBtn) randomBtn.onclick = spinRandomGroup;
  if (resetRoundsBtn) {
    resetRoundsBtn.onclick = () => {
      if (confirm("Alle bisherigen Roulette-Runden zurücksetzen? Die Google-Sheet-Ergebnisse bleiben erhalten.")) {
        resetRouletteRounds(false);
      }
    };
  }

  if (resultsContent) {
    resultsContent.onclick = (event) => {
      const btn = event.target.closest("[data-delete-result]");
      if (!btn) return;
      event.preventDefault();
      if (!isGlobalAdminActive()) return;
      deleteSingleResult(Number(btn.dataset.deleteResult));
    };
    resultsContent.addEventListener("toggle", () => {
      window.setTimeout(() => updateActiveResult(false), 40);
    }, true);
  }

  renderRoundBadges();
  window.addEventListener("resize", () => {
    if (resultRowsCache.length) renderCarouselAt(currentVirtualPosition, false);
  });

  if (!url) {
    if (status) {
      status.className = "warning";
      status.textContent = "Keine Apps-Script-URL gefunden. Ergebnisse können nicht geladen werden.";
    }
    return;
  }

  if (status) {
    status.className = "notice";
    status.textContent = "Ergebnisse werden geladen …";
  }

  fetchResultsWithFallback(url)
    .then(rows => {
      resultRowsCache = rows || [];
      currentResultIndex = Math.max(0, resultRowsCache.length - 1);
      currentVirtualIndex = currentResultIndex;
      currentVirtualPosition = currentVirtualIndex;
      if (status) status.textContent = "";
      renderResults(resultRowsCache);
    })
    .catch(err => {
      if (status) {
        status.className = "warning";
        status.textContent = err.message + " Prüfe die Web-App-Bereitstellung und den Zugriff 'Jeder'.";
      }
    });
}

function renderResults(rows) {
  const target = document.getElementById("resultsContent");
  const controls = document.getElementById("resultsControls");
  if (!target) return;
  resultRowsCache = rows || [];

  applyResultsAdminState();

  if (!resultRowsCache.length) {
    if (controls) {
      controls.hidden = false;
      controls.style.display = "flex";
    }
    target.className = "result-track";
    target.innerHTML = `<div class="notice empty-results">Noch keine Ergebnisse vorhanden.</div>`;
    currentResultIndex = 0;
    currentVirtualIndex = 0;
    currentVirtualPosition = 0;
    updateCarouselCounter();
    syncRandomSelectionState();
    return;
  }

  if (controls) {
    controls.hidden = false;
    controls.style.display = "flex";
    controls.style.visibility = "visible";
  }

  target.className = "result-track slot-track";
  if (!Number.isFinite(currentVirtualPosition)) currentVirtualPosition = resultRowsCache.length - 1;
  currentVirtualIndex = Math.round(currentVirtualPosition);
  currentResultIndex = mod(currentVirtualIndex, resultRowsCache.length);
  buildSlotTrack(currentVirtualIndex - 4, currentVirtualIndex + 4);
  positionSlotTrack(currentVirtualPosition, false);
  syncRandomSelectionState();
  applyResultsAdminState();
}

function updateGroupAssignmentAccess() {
  const active = isGlobalAdminActive();
  const protectedEls = document.querySelectorAll(".group-assignment-protected");
  let access = document.getElementById("groupAssignmentAccessNotice");
  if (!active) {
    protectedEls.forEach(el => el.style.display = "none");
    const main = document.querySelector("main.groupassignment-main") || document.querySelector("main");
    if (main && !access) {
      access = document.createElement("section");
      access.id = "groupAssignmentAccessNotice";
      access.className = "card warning admin-access-panel";
      access.innerHTML = `<h2>Administrationsmodus erforderlich</h2><p>Die Gruppenzuweisung ist nur für die Seminarleitung vorgesehen.</p><button type="button" class="secondary" data-admin-login>Administrator aktivieren</button> <a class="button secondary" href="index.html">Zur Startseite</a>`;
      main.prepend(access);
      const btn = access.querySelector("[data-admin-login]");
      if (btn) btn.onclick = handleGlobalAdminClick;
    }
  } else {
    protectedEls.forEach(el => el.style.display = "");
    if (access) access.remove();
  }
  updateGlobalAdminUi();
}

function initGroupAssignment() {
  initCommon();
  installGlobalAdminControlsFinal();
  updateGroupAssignmentAccess();
  if (!isGlobalAdminActive()) return;

  const list = document.getElementById("participantList");
  const input = document.getElementById("participantName");
  const addBtn = document.getElementById("addParticipantBtn");
  const buildBtn = document.getElementById("buildGroupsBtn");
  const resetBtn = document.getElementById("resetParticipantsBtn");
  const clearBtn = document.getElementById("clearParticipantsBtn");
  const output = document.getElementById("groupsOutput");
  const count = document.getElementById("participantCount");
  const status = document.getElementById("groupAssignStatus");
  let names = getGroupAssignmentNames();

  function setStatus(text, cls = "notice") {
    if (!status) return;
    status.className = cls;
    status.textContent = text;
  }
  function persistNames() { saveGroupAssignmentNames(names); }
  function renderNames() {
    if (!list) return;
    list.innerHTML = "";
    names.forEach((name, index) => {
      const li = document.createElement("li");
      li.innerHTML = `<span class="name-index">${index + 1}</span><span class="name-text">${escapeHtml(name)}</span><button type="button" class="icon-remove" aria-label="${escapeHtml(name)} löschen">×</button>`;
      const removeBtn = li.querySelector("button");
      removeBtn.onclick = () => {
        names.splice(index, 1);
        persistNames();
        saveGroupAssignmentGroups([]);
        renderNames();
        renderGroups([]);
        setStatus("Name wurde gelöscht. Die Gruppen müssen neu gebildet werden.", "notice");
      };
      list.appendChild(li);
    });
    if (count) count.textContent = String(names.length);
  }
  function renderGroups(groups = getGroupAssignmentGroups()) {
    if (!output) return;
    output.innerHTML = "";
    if (!groups.length) {
      output.className = "group-output empty-state";
      output.textContent = "Noch keine Gruppen gebildet.";
      return;
    }
    output.className = "group-output";
    groups.forEach((group, index) => {
      const card = document.createElement("div");
      card.className = "assignment-group-card";
      const items = group.map(name => `<li>${escapeHtml(name)}</li>`).join("");
      card.innerHTML = `<h3>Gruppe ${index + 1}<span class="group-size-pill">${group.length} Personen</span></h3><ol>${items}</ol>`;
      output.appendChild(card);
    });
  }
  function addName() {
    const value = (input && input.value || "").trim();
    if (!value) { setStatus("Bitte zuerst einen Namen eintragen.", "warning"); return; }
    names.push(value);
    persistNames();
    saveGroupAssignmentGroups([]);
    if (input) input.value = "";
    renderNames();
    renderGroups([]);
    setStatus("Name wurde hinzugefügt. Du kannst die Gruppen neu bilden.", "success");
  }

  if (addBtn) addBtn.onclick = addName;
  if (input) input.onkeydown = e => {
    if (e.key === "Enter") { e.preventDefault(); addName(); }
  };
  if (buildBtn) buildBtn.onclick = () => {
    if (names.length < 4) {
      setStatus("Für die Gruppenzuweisung werden mindestens 4 Personen benötigt.", "warning");
      saveGroupAssignmentGroups([]);
      renderGroups([]);
      return;
    }
    const groups = buildMinimumFourGroups(names);
    saveGroupAssignmentGroups(groups);
    renderGroups(groups);
    const sizes = groups.map(g => g.length).join(" / ");
    setStatus(`Gruppen wurden zufällig gebildet. Gruppengrößen: ${sizes}.`, "success");
  };
  if (resetBtn) resetBtn.onclick = () => {
    if (!confirm("Ursprungsliste neu laden? Eigene Änderungen an der Teilnehmendenliste gehen verloren.")) return;
    names = DEFAULT_GROUP_PARTICIPANTS.slice();
    persistNames();
    saveGroupAssignmentGroups([]);
    renderNames();
    renderGroups([]);
    setStatus("Ursprungsliste wurde geladen.", "success");
  };
  if (clearBtn) clearBtn.onclick = () => {
    if (!confirm("Gesamte Teilnehmendenliste leeren?")) return;
    names = [];
    persistNames();
    saveGroupAssignmentGroups([]);
    renderNames();
    renderGroups([]);
    setStatus("Teilnehmendenliste wurde geleert. Mit 'Ursprungsliste laden' kannst du die vorbereiteten Namen wiederherstellen.", "notice");
  };

  renderNames();
  renderGroups();
}

// Nach der ursprünglichen Initialisierung noch einmal globale Admin-UI synchronisieren.
window.addEventListener("DOMContentLoaded", () => {
  installGlobalAdminControlsFinal();
  updateGlobalAdminUi();
  if (document.body.dataset.mode === "groupassignment") updateGroupAssignmentAccess();
  if (document.body.dataset.mode === "results") applyResultsAdminState();
});


/* ============================================================
   FINAL REQUEST OVERRIDE: global admin bar, password modal,
   result presentation mode
   ============================================================ */
const GLOBAL_ADMIN_PASSWORD_VISIBLE_FINAL = "Mark123";

function ensureAdminPasswordModalFinal() {
  let modal = document.getElementById("adminPasswordModal");
  if (modal) return modal;
  modal = document.createElement("div");
  modal.id = "adminPasswordModal";
  modal.className = "admin-modal";
  modal.hidden = true;
  modal.innerHTML = `
    <div class="admin-modal-backdrop" data-admin-cancel></div>
    <div class="admin-modal-card" role="dialog" aria-modal="true" aria-labelledby="adminModalTitle">
      <h2 id="adminModalTitle">Administrationsmodus aktivieren</h2>
      <p>Bitte Passwort eingeben.</p>
      <label class="password-label" for="adminPasswordInput">Passwort</label>
      <div class="password-row">
        <input id="adminPasswordInput" type="password" autocomplete="current-password" spellcheck="false">
        <button id="toggleAdminPassword" type="button" class="secondary eye-button" aria-label="Passwort anzeigen">👁</button>
      </div>
      <p id="adminPasswordError" class="warning admin-modal-error" hidden>Falsches Passwort.</p>
      <div class="admin-modal-actions">
        <button id="cancelAdminPassword" type="button" class="secondary">Abbrechen</button>
        <button id="submitAdminPassword" type="button">Aktivieren</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  return modal;
}

function showAdminPasswordDialogFinal() {
  return new Promise(resolve => {
    const modal = ensureAdminPasswordModalFinal();
    const input = modal.querySelector("#adminPasswordInput");
    const toggle = modal.querySelector("#toggleAdminPassword");
    const submit = modal.querySelector("#submitAdminPassword");
    const cancel = modal.querySelector("#cancelAdminPassword");
    const error = modal.querySelector("#adminPasswordError");
    const backdrop = modal.querySelector("[data-admin-cancel]");

    function close(value) {
      modal.hidden = true;
      document.removeEventListener("keydown", onKey);
      resolve(value);
    }
    function trySubmit() {
      const ok = input.value === GLOBAL_ADMIN_PASSWORD_VISIBLE_FINAL;
      if (!ok) {
        error.hidden = false;
        input.select();
        return;
      }
      close(true);
    }
    function onKey(e) {
      if (e.key === "Escape") close(false);
      if (e.key === "Enter") trySubmit();
    }

    input.value = "";
    input.type = "password";
    error.hidden = true;
    modal.hidden = false;
    window.setTimeout(() => input.focus(), 30);

    toggle.onclick = () => {
      const visible = input.type === "text";
      input.type = visible ? "password" : "text";
      toggle.setAttribute("aria-label", visible ? "Passwort anzeigen" : "Passwort ausblenden");
      toggle.classList.toggle("is-visible", !visible);
      input.focus();
    };
    submit.onclick = trySubmit;
    cancel.onclick = () => close(false);
    backdrop.onclick = () => close(false);
    document.addEventListener("keydown", onKey);
  });
}

function handleGlobalAdminClick() {
  if (isGlobalAdminActive()) {
    setGlobalAdminActive(false);
    return;
  }
  showAdminPasswordDialogFinal().then(ok => {
    if (ok) setGlobalAdminActive(true);
    else updateGlobalAdminUi();
  });
}

function installLocalResetControls() {
  const header = document.querySelector("header");
  if (!header) return;
  let bar = document.querySelector(".local-reset-bar");
  if (!bar) {
    bar = document.createElement("div");
    bar.className = "local-reset-bar";
    header.insertAdjacentElement("afterend", bar);
  }
  bar.innerHTML = `
    <div class="wrap local-reset-inner admin-reset-inner">
      <button type="button" class="admin-status-button" id="globalAdminStatusBtn" data-admin-status-button>Admin-Modus deaktiviert</button>
      <button type="button" class="secondary small-reset" id="clearPageBtn">Aktuelle Seite leeren</button>
      <button type="button" class="secondary small-reset" id="clearAllLocalBtn">Seite zurücksetzen</button>
      <span id="pageResetStatus" class="local-reset-status" aria-live="polite"></span>
    </div>`;
  const statusBtn = document.getElementById("globalAdminStatusBtn");
  const clearPageBtn = document.getElementById("clearPageBtn");
  const clearAllBtn = document.getElementById("clearAllLocalBtn");
  if (statusBtn) statusBtn.onclick = handleGlobalAdminClick;
  if (clearPageBtn) clearPageBtn.onclick = () => {
    if (confirm("Lokale Eingaben auf der aktuellen Seite leeren?")) clearCurrentPageInputs();
  };
  if (clearAllBtn) clearAllBtn.onclick = () => {
    if (!confirm("Alle lokal gespeicherten Arbeitsdaten dieser Website löschen? Google-Sheet-Ergebnisse bleiben erhalten.")) return;
    clearAllLocalSupervisionData({ silent: true });
    window.location.href = "index.html";
  };
  updateGlobalAdminUi();
}

function installGlobalAdminControlsFinal() {
  installLocalResetControls();
  document.querySelectorAll("#globalAdminBtn, #adminLoginBtn, [data-admin-login]").forEach(btn => {
    if (btn.id === "globalAdminStatusBtn" || btn.dataset.adminStatusButton !== undefined) return;
    btn.style.display = "none";
    btn.setAttribute("aria-hidden", "true");
    btn.onclick = null;
  });
  const statusBtn = document.getElementById("globalAdminStatusBtn");
  if (statusBtn) statusBtn.onclick = handleGlobalAdminClick;
  updateGlobalAdminUi();
}

function updateGlobalAdminUi() {
  const active = isGlobalAdminActive();
  document.body.classList.toggle("is-global-admin", active);
  const statusBtn = document.getElementById("globalAdminStatusBtn");
  if (statusBtn) {
    statusBtn.disabled = false;
    statusBtn.style.pointerEvents = "auto";
    statusBtn.textContent = active ? "Admin-Modus aktiv" : "Admin-Modus deaktiviert";
    statusBtn.classList.toggle("is-active", active);
    statusBtn.classList.toggle("is-inactive", !active);
    statusBtn.title = active ? "Adminmodus deaktivieren" : "Adminmodus aktivieren";
  }
  document.querySelectorAll("#globalAdminBtn, #adminLoginBtn, [data-admin-login]").forEach(btn => {
    if (btn.id === "globalAdminStatusBtn" || btn.dataset.adminStatusButton !== undefined) return;
    btn.style.display = "none";
    btn.setAttribute("aria-hidden", "true");
  });
  updateAdminProtectedLinks();
}

function applyResultsAdminState() {
  resultsAdminActive = isGlobalAdminActive();
  document.body.classList.toggle("is-admin-results", !!resultsAdminActive);
  document.body.classList.toggle("public-results", !resultsAdminActive);
  document.querySelectorAll(".admin-only").forEach(el => {
    el.hidden = !resultsAdminActive;
    el.style.display = resultsAdminActive ? "" : "none";
    el.style.visibility = resultsAdminActive ? "visible" : "hidden";
  });
  document.querySelectorAll(".result-delete").forEach(el => {
    el.style.display = resultsAdminActive ? "inline-flex" : "none";
    el.style.visibility = resultsAdminActive ? "visible" : "hidden";
  });
  const controls = document.getElementById("resultsControls");
  if (controls) {
    controls.hidden = false;
    controls.style.display = "flex";
    controls.style.visibility = "visible";
  }
  const randomArea = document.querySelector(".random-area");
  if (randomArea) {
    randomArea.style.display = resultsAdminActive ? "inline-flex" : "none";
    randomArea.style.visibility = resultsAdminActive ? "visible" : "hidden";
  }
  const deleteAll = document.getElementById("deleteAllBtn");
  if (deleteAll) {
    deleteAll.textContent = "Alle Gruppenergebnisse löschen";
    deleteAll.style.display = resultsAdminActive ? "inline-flex" : "none";
    deleteAll.style.visibility = resultsAdminActive ? "visible" : "hidden";
  }
  updateGlobalAdminUi();
}

function resultCardHtml(row, index, virtualIndex = index) {
  const data = row.data || {};
  const timestamp = formatResultTimestamp(getRowTimestamp(row, data));
  const groupName = row.groupName || data.groupName || "Gruppe";
  const presentationId = encodeURIComponent(String(row.rowNumber || row.id || index));
  return `<section class="card result-card slot-card" data-result-index="${index}" data-virtual-index="${virtualIndex}" aria-current="false">
    <button class="result-delete" type="button" data-delete-result="${index}" title="Diesen Eintrag löschen" aria-label="Diesen Eintrag löschen">×</button>
    <div class="result-card-head">
      <div>
        <h2>${escapeHtml(groupName)}</h2>
        <p class="small result-meta">${escapeHtml(timestamp)}</p>
      </div>
      <div class="result-card-actions">
        <a class="button secondary presentation-start" href="presentation.html?row=${presentationId}">Präsentation starten</a>
        <span class="result-number">${index + 1}</span>
      </div>
    </div>
    ${phaseDetails("Phase 2: Problembeschreibung", data.p2 || {})}
    ${phaseDetails("Phase 3: Zielformulierung", data.p3 || {})}
    ${phaseDetails("Phase 4: Vertiefte Problembearbeitung", data.p4 || {})}
    ${phaseDetails("Phase 5 und 6: Umsetzung", Object.assign({}, data.p5 || {}, data.p6 || {}))}
  </section>`;
}

function presentValue(value) {
  const text = (value === null || value === undefined || String(value).trim() === "") ? "—" : String(value);
  return escapeHtml(text).replace(/\n/g, "<br>");
}

function presentPath(obj, path, fallback = "") {
  const val = path_(obj, path);
  return val || fallback || "";
}

function presentationTable(headers, rows) {
  return `<div class="presentation-table-wrap"><table class="presentation-table"><thead><tr>${headers.map(h => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${presentValue(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function buildPresentationSlides(row) {
  const data = row.data || {};
  const p2 = data.p2 || {};
  const p3 = data.p3 || {};
  const p4 = data.p4 || {};
  const p5 = data.p5 || {};
  const p6 = data.p6 || {};
  const assignments = data.assignments || {};
  const groupName = row.groupName || data.groupName || "Gruppe";
  const timestamp = formatResultTimestamp(getRowTimestamp(row, data));
  const roles = [
    ["Supervisor*in", assignments.supervisor || "—"],
    ["Schulleitung", assignments.schulleitung || "—"],
    ["Lehrkraft A", assignments["lehrkraft-a"] || assignments.lehrkraftA || "—"],
    ["Lehrkraft B", assignments["lehrkraft-b"] || assignments.lehrkraftB || "—"]
  ];
  return [
    { title: "Gruppenvorstellung", html: `<p class="presentation-kicker">${escapeHtml(timestamp)}</p><h2>${escapeHtml(groupName)}</h2>${presentationTable(["Rolle", "Name"], roles)}<p class="presentation-note">Simulation einer Gruppensupervision zum Teamteaching im Kontext ESE.</p>` },
    { title: "Problembeschreibung", html: `<p class="presentation-subtitle">Diese Folie bündelt die individuellen Sichtweisen der Beteiligten: Beobachtungen bzw. Probleme, Gefühle und Wünsche.</p>` + presentationTable(["Rolle", "Probleme / Beobachtung", "Gefühle", "Wünsche"], [
      ["Schulleitung", p2.slProbleme || p2.slProblem || "", p2.slGefuehle || "", p2.slWuensche || ""],
      ["Lehrkraft A", p2.aProbleme || p2.aPerspektive || "", p2.aGefuehle || "", p2.aWuensche || ""],
      ["Lehrkraft B", p2.bProbleme || p2.bPerspektive || "", p2.bGefuehle || "", p2.bWuensche || ""]
    ]) },
    { title: "Zielformulierung", html: `<p class="presentation-subtitle">Hier werden die Einzelziele der Beteiligten, erkennbare Gemeinsamkeiten und die gemeinsame Zielvereinbarung zusammengeführt.</p>` + presentationTable(["Bereich", "Eintrag"], [
      ["Ziel Schulleitung", p3.zielSL || ""],
      ["Ziel Lehrkraft A", p3.zielA || ""],
      ["Ziel Lehrkraft B", p3.zielB || ""],
      ["Gefundene Gemeinsamkeiten", p3.gemeinsamkeiten || ""],
      ["Gemeinsame Zielvereinbarung", p3.gemeinsamesZiel || p3.gemeinsameZielformulierung || ""]
    ]) },
    { title: "Vertiefte Problembearbeitung", html: `<p class="presentation-subtitle">Hier wird festgehalten, wie hilfreiche Kritik formuliert werden kann und welche Absprachen für die weitere Zusammenarbeit getroffen wurden.</p>` + presentationTable(["Aspekt", "Ergebnis"], [
      ["Hilfreiche Kritik", p4.kritik || ""],
      ["Absprachen zum weiteren Vorgehen", p4.absprachen || p4.weiteresVorgehen || ""]
    ]) },
    { title: "Umsetzung", html: `<p class="presentation-subtitle">Diese Folie zeigt Zustimmung, Praxistauglichkeit und erste konkrete Schritte zur Umsetzung der Vereinbarung.</p>` + presentationTable(["Aspekt", "Ergebnis"], [
      ["Zustimmung zur Vereinbarung", p5.zustimmung || ""],
      ["Einschätzung der Praxistauglichkeit durch die Schulleitung", p6.praxistauglichkeit || p6.einschaetzung || ""],
      ["Unterstützungsmöglichkeiten durch die Schulleitung", p6.unterstuetzung || ""],
      ["Erste konkrete Umsetzungsschritte", p6.umsetzung || p6.konkreteUmsetzungsschritte || ""]
    ]) },
    { title: "", html: `<div class="thanks-slide"><h2>Vielen Dank fürs Zuhören!</h2><p>Raum für Rückfragen und gemeinsame Reflexion.</p></div>` }
  ];
}

let presentationSlidesFinal = [];
let presentationIndexFinal = 0;
function renderPresentationSlideFinal() {
  const slide = document.getElementById("presentationSlide");
  const counter = document.getElementById("presentationCounter");
  if (!slide || !presentationSlidesFinal.length) return;
  const item = presentationSlidesFinal[presentationIndexFinal];
  const titleHtml = item.title ? `<h1>${escapeHtml(item.title)}</h1>` : "";
  slide.innerHTML = `<div class="presentation-slide-inner${item.title ? "" : " no-title-slide"}">${titleHtml}${item.html}</div>`;
  if (counter) counter.textContent = `${presentationIndexFinal + 1} / ${presentationSlidesFinal.length}`;
}
function movePresentationFinal(delta) {
  if (!presentationSlidesFinal.length) return;
  presentationIndexFinal = Math.max(0, Math.min(presentationSlidesFinal.length - 1, presentationIndexFinal + delta));
  renderPresentationSlideFinal();
}
function initPresentationFinal() {
  const status = document.getElementById("presentationStatus");
  const url = getAppsScriptUrl();
  const params = new URLSearchParams(window.location.search);
  const rowParam = params.get("row");
  const idxParam = params.get("i");
  const exit = document.getElementById("presentationExitBtn");
  const full = document.getElementById("presentationFullscreenBtn");
  const prev = document.getElementById("presentationPrevBtn");
  const next = document.getElementById("presentationNextBtn");
  if (exit) exit.onclick = () => window.location.href = "ergebnisse.html";
  if (full) full.onclick = () => {
    const root = document.documentElement;
    if (!document.fullscreenElement && root.requestFullscreen) root.requestFullscreen();
    else if (document.exitFullscreen) document.exitFullscreen();
  };
  if (prev) prev.onclick = () => movePresentationFinal(-1);
  if (next) next.onclick = () => movePresentationFinal(1);
  document.addEventListener("keydown", e => {
    if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); movePresentationFinal(1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); movePresentationFinal(-1); }
    if (e.key === "Escape") { window.location.href = "ergebnisse.html"; }
  });
  if (!url) {
    if (status) status.textContent = "Keine Apps-Script-URL gefunden.";
    return;
  }
  fetchResultsWithFallback(url).then(rows => {
    let row = null;
    if (rowParam !== null) row = (rows || []).find(r => String(r.rowNumber || r.id) === String(rowParam));
    if (!row && idxParam !== null) row = (rows || [])[Number(idxParam)];
    if (!row && rows && rows.length) row = rows[0];
    if (!row) throw new Error("Kein Gruppenergebnis gefunden.");
    presentationSlidesFinal = buildPresentationSlides(row);
    presentationIndexFinal = 0;
    if (status) status.hidden = true;
    renderPresentationSlideFinal();
  }).catch(err => {
    if (status) {
      status.className = "presentation-status warning";
      status.textContent = err.message || "Präsentation konnte nicht geladen werden.";
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  installLocalResetControls();
  installGlobalAdminControlsFinal();
  updateGlobalAdminUi();
  if (document.body.dataset.mode === "presentation") initPresentationFinal();
  if (document.body.dataset.mode === "results") {
    const deleteAll = document.getElementById("deleteAllBtn");
    if (deleteAll) deleteAll.textContent = "Alle Gruppenergebnisse löschen";
    applyResultsAdminState();
  }
});

/* ------------------------------------------------------------
   FINAL: Zusammenfassung mit Präsentationsvorbereitung,
   editierbarer Vorschau und Übergabe an Google-Sheet-Payload
   ------------------------------------------------------------ */
const SV_PRESENTATION_THEME_DEFAULT = {
  heading: '#1e3a5f',
  text: '#0f172a',
  background: '#0f172a',
  slide: '#ffffff'
};

function getPresentationSettingsFinal() {
  const saved = loadObj('presentation_settings', {});
  return Object.assign({}, SV_PRESENTATION_THEME_DEFAULT, saved || {});
}

function savePresentationSettingsFinal(settings) {
  saveObj('presentation_settings', Object.assign({}, getPresentationSettingsFinal(), settings || {}));
}

function getPresentationExtrasFinal() {
  const extras = loadObj('presentation_extras', []);
  return Array.isArray(extras) ? extras : [];
}

function savePresentationExtrasFinal(extras) {
  saveObj('presentation_extras', Array.isArray(extras) ? extras : []);
}

function applyPresentationThemeToNodeFinal(host, settings) {
  const s = Object.assign({}, SV_PRESENTATION_THEME_DEFAULT, settings || {});
  if (!host) return;
  host.style.setProperty('--presentation-heading-color', s.heading);
  host.style.setProperty('--presentation-text-color', s.text);
  host.style.setProperty('--presentation-background-color', s.background);
  host.style.setProperty('--presentation-slide-color', s.slide);
  if (host.classList && host.classList.contains('presentation-body')) {
    host.style.background = s.background;
  }
}

function buildPayload() {
  const data = collectSupervisorData();
  const groupName = loadText('summary_group_name') || data.groupName || data.groupId;
  data.groupName = groupName;
  data.timestampLocal = new Date().toLocaleString('de-DE');
  data.presentationSettings = getPresentationSettingsFinal();
  data.presentationExtras = getPresentationExtrasFinal();
  return data;
}

function initSummary() {
  initCommon();
  installGlobalAdminControlsFinal();
  const data = collectSupervisorData();
  const groupNameInput = document.getElementById('groupName');
  if (groupNameInput) {
    groupNameInput.value = loadText('summary_group_name') || data.groupName || data.groupId;
    groupNameInput.addEventListener('input', () => saveText('summary_group_name', groupNameInput.value));
  }
  initSummaryAccordionsFinal();
  renderSummary(data);
  const submitBtn = document.getElementById('submitResults');
  if (submitBtn) submitBtn.onclick = submitResults;
  const prepBtn = document.getElementById('openPresentationPrepBtn');
  if (prepBtn) prepBtn.onclick = openPresentationPrepModalFinal;
  updateGlobalAdminUi();
}

function initSummaryAccordionsFinal() {
  document.querySelectorAll('[data-toggle-target]').forEach(btn => {
    btn.onclick = () => {
      const panel = document.getElementById(btn.dataset.toggleTarget);
      if (!panel) return;
      const isHidden = panel.hidden;
      panel.hidden = !isHidden;
      btn.setAttribute('aria-expanded', String(isHidden));
    };
  });
}

function renderSummary(data) {
  const target = document.getElementById('summaryContent');
  if (!target) return;
  const phases = [
    ['Erstkontakt', data.p1],
    ['Problembeschreibung', data.p2],
    ['Zielformulierung', data.p3],
    ['Vertiefte Problembearbeitung', data.p4],
    ['Ergebnissicherung', data.p5],
    ['Reflexionstauglichkeit', data.p6]
  ];
  target.innerHTML = `<div class="summary-phase-list">${phases.map(([title, obj], i) => summaryPhaseDetailsFinal(i + 1, title, obj)).join('')}</div>`;
}

function summaryPhaseDetailsFinal(num, title, obj) {
  return `<details class="summary-phase-details"><summary>Phase ${num}: ${escapeHtml(title)}</summary><div class="summary-phase-content">${Object.entries(obj).map(([k,v]) => `<div class="summary-block"><strong>${labelize(k)}</strong><br>${escapeHtml(v || '—')}</div>`).join('')}</div></details>`;
}

function localPresentationRowFinal() {
  const payload = buildPayload();
  return {
    id: 'local',
    rowNumber: 'local',
    timestamp: payload.timestamp || new Date().toISOString(),
    groupName: payload.groupName || 'Gruppe',
    data: payload
  };
}

let summaryPresentationIndexFinal = 0;
let summaryPresentationEditModeFinal = false;

function ensurePresentationPrepModalFinal() {
  let modal = document.getElementById('presentationPrepModal');
  if (modal) return modal;
  modal = document.createElement('div');
  modal.id = 'presentationPrepModal';
  modal.className = 'presentation-prep-modal';
  modal.hidden = true;
  modal.innerHTML = `
    <div class="presentation-prep-backdrop" data-close-prep></div>
    <div class="presentation-prep-window" role="dialog" aria-modal="true" aria-label="Präsentation vorbereiten">
      <div class="presentation-prep-toolbar">
        <button type="button" id="closePresentationPrep" class="secondary">Schließen</button>
        <button type="button" id="summaryPrevSlide" class="secondary">←</button>
        <span id="summaryPresentationCounter" class="small">1 / 6</span>
        <button type="button" id="summaryNextSlide" class="secondary">→</button>
        <button type="button" id="togglePresentationEdit" class="secondary">Bearbeitungsmodus</button>
        <button type="button" id="addPresentationText" class="secondary">Text hinzufügen</button>
        <label class="theme-control-label" for="themeTargetSelect">Farbe</label>
        <select id="themeTargetSelect" class="theme-select">
          <option value="heading">Überschrift</option>
          <option value="text">Text</option>
          <option value="background">Hintergrund</option>
          <option value="slide">Folie</option>
        </select>
        <input id="themeColorPicker" type="color" value="#1e3a5f" aria-label="Farbe wählen">
        <input id="themeHueRange" type="range" min="0" max="360" value="210" aria-label="Farbton wählen">
      </div>
      <div class="presentation-prep-stage presentation-body">
        <section id="summaryPresentationSlide" class="presentation-slide presentation-slide-mini"></section>
      </div>
      <p class="small presentation-prep-hint">Im Bearbeitungsmodus können Tabelleninhalte direkt angeklickt und geändert werden. Die Änderungen werden lokal gespeichert und beim Absenden übernommen.</p>
    </div>`;
  document.body.appendChild(modal);

  modal.querySelector('[data-close-prep]').onclick = closePresentationPrepModalFinal;
  modal.querySelector('#closePresentationPrep').onclick = closePresentationPrepModalFinal;
  modal.querySelector('#summaryPrevSlide').onclick = () => moveSummaryPresentationFinal(-1);
  modal.querySelector('#summaryNextSlide').onclick = () => moveSummaryPresentationFinal(1);
  modal.querySelector('#togglePresentationEdit').onclick = () => {
    summaryPresentationEditModeFinal = !summaryPresentationEditModeFinal;
    renderSummaryPresentationSlideFinal();
  };
  modal.querySelector('#addPresentationText').onclick = () => addPresentationTextBoxFinal();
  const select = modal.querySelector('#themeTargetSelect');
  const color = modal.querySelector('#themeColorPicker');
  const hue = modal.querySelector('#themeHueRange');
  select.onchange = () => {
    const settings = getPresentationSettingsFinal();
    color.value = settings[select.value] || SV_PRESENTATION_THEME_DEFAULT[select.value];
  };
  color.oninput = () => {
    savePresentationSettingsFinal({ [select.value]: color.value });
    renderSummaryPresentationSlideFinal(false);
  };
  hue.oninput = () => {
    const next = hslToHexFinal(Number(hue.value), 62, select.value === 'background' ? 12 : 42);
    color.value = next;
    savePresentationSettingsFinal({ [select.value]: next });
    renderSummaryPresentationSlideFinal(false);
  };
  return modal;
}

function hslToHexFinal(h, s, l) {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = x => Math.round(255 * x).toString(16).padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

function openPresentationPrepModalFinal() {
  const modal = ensurePresentationPrepModalFinal();
  summaryPresentationIndexFinal = 0;
  modal.hidden = false;
  renderSummaryPresentationSlideFinal();
}

function closePresentationPrepModalFinal() {
  const modal = document.getElementById('presentationPrepModal');
  if (modal) modal.hidden = true;
  renderSummary(collectSupervisorData());
}

function moveSummaryPresentationFinal(delta) {
  const slides = buildEditablePresentationSlidesFinal(localPresentationRowFinal());
  summaryPresentationIndexFinal = Math.max(0, Math.min(slides.length - 1, summaryPresentationIndexFinal + delta));
  renderSummaryPresentationSlideFinal();
}

function renderSummaryPresentationSlideFinal(updateControls = true) {
  const modal = ensurePresentationPrepModalFinal();
  const row = localPresentationRowFinal();
  const slides = buildEditablePresentationSlidesFinal(row);
  const slideHost = modal.querySelector('#summaryPresentationSlide');
  if (!slideHost || !slides.length) return;
  summaryPresentationIndexFinal = Math.max(0, Math.min(slides.length - 1, summaryPresentationIndexFinal));
  const item = slides[summaryPresentationIndexFinal];
  const titleHtml = item.title ? `<h1>${escapeHtml(item.title)}</h1>` : '';
  slideHost.innerHTML = `<div class="presentation-slide-inner${item.title ? '' : ' no-title-slide'}">${titleHtml}${item.html}${renderPresentationExtrasForSlideFinal(summaryPresentationIndexFinal, true)}</div>`;
  slideHost.classList.toggle('is-editing-presentation', summaryPresentationEditModeFinal);
  applyPresentationThemeToNodeFinal(modal.querySelector('.presentation-prep-stage'), getPresentationSettingsFinal());
  applyPresentationThemeToNodeFinal(slideHost, getPresentationSettingsFinal());
  applyEditablePresentationStateFinal(slideHost);
  if (updateControls) {
    const counter = modal.querySelector('#summaryPresentationCounter');
    if (counter) counter.textContent = `${summaryPresentationIndexFinal + 1} / ${slides.length}`;
    const btn = modal.querySelector('#togglePresentationEdit');
    if (btn) {
      btn.textContent = summaryPresentationEditModeFinal ? 'Bearbeitung aktiv' : 'Bearbeitungsmodus';
      btn.classList.toggle('success-btn', summaryPresentationEditModeFinal);
    }
    const select = modal.querySelector('#themeTargetSelect');
    const color = modal.querySelector('#themeColorPicker');
    if (select && color) color.value = getPresentationSettingsFinal()[select.value] || '#1e3a5f';
  }
}

function editableCellFinal(value, saveKey) {
  return `<td data-edit-save="${escapeHtml(saveKey)}">${presentValue(value)}</td>`;
}

function editablePresentationTableFinal(headers, rows) {
  return `<div class="presentation-table-wrap"><table class="presentation-table"><thead><tr>${headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => Array.isArray(c) ? editableCellFinal(c[0], c[1]) : `<td>${presentValue(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

function buildEditablePresentationSlidesFinal(row) {
  const data = row.data || {};
  const p2 = data.p2 || {};
  const p3 = data.p3 || {};
  const p4 = data.p4 || {};
  const p5 = data.p5 || {};
  const p6 = data.p6 || {};
  const assignments = data.assignments || {};
  const groupName = data.groupName || row.groupName || 'Gruppe';
  const timestamp = formatResultTimestamp(data.timestamp || row.timestamp || new Date().toISOString());
  const roles = [
    ['Supervisor*in', assignments.supervisor || '—'],
    ['Schulleitung', assignments.schulleitung || '—'],
    ['Lehrkraft A', assignments['lehrkraft-a'] || assignments.lehrkraftA || '—'],
    ['Lehrkraft B', assignments['lehrkraft-b'] || assignments.lehrkraftB || '—']
  ];
  return [
    { title: 'Gruppenvorstellung', html: `<p class="presentation-kicker">${escapeHtml(timestamp)}</p><h2>${escapeHtml(groupName)}</h2>${editablePresentationTableFinal(['Rolle', 'Name'], roles)}<p class="presentation-note">Simulation einer Gruppensupervision zum Teamteaching im Kontext ESE.</p>` },
    { title: 'Problembeschreibung', html: `<p class="presentation-subtitle">Diese Folie bündelt die individuellen Sichtweisen der Beteiligten: Beobachtungen bzw. Probleme, Gefühle und Wünsche.</p>` + editablePresentationTableFinal(['Rolle', 'Probleme / Beobachtung', 'Gefühle', 'Wünsche'], [
      ['Schulleitung', [p2.slProbleme || '', 'sup_p2_sl_probleme'], [p2.slGefuehle || '', 'sup_p2_sl_gefuehle'], [p2.slWuensche || '', 'sup_p2_sl_wuensche']],
      ['Lehrkraft A', [p2.aProbleme || '', 'sup_p2_a_probleme'], [p2.aGefuehle || '', 'sup_p2_a_gefuehle'], [p2.aWuensche || '', 'sup_p2_a_wuensche']],
      ['Lehrkraft B', [p2.bProbleme || '', 'sup_p2_b_probleme'], [p2.bGefuehle || '', 'sup_p2_b_gefuehle'], [p2.bWuensche || '', 'sup_p2_b_wuensche']]
    ]) },
    { title: 'Zielformulierung', html: `<p class="presentation-subtitle">Hier werden die Einzelziele der Beteiligten, erkennbare Gemeinsamkeiten und die gemeinsame Zielvereinbarung zusammengeführt.</p>` + editablePresentationTableFinal(['Bereich', 'Eintrag'], [
      ['Ziel Schulleitung', [p3.zielSL || '', 'sup_p3_ziel_sl']],
      ['Ziel Lehrkraft A', [p3.zielA || '', 'sup_p3_ziel_a']],
      ['Ziel Lehrkraft B', [p3.zielB || '', 'sup_p3_ziel_b']],
      ['Gefundene Gemeinsamkeiten', [p3.gemeinsamkeiten || '', 'sup_p3_gemeinsamkeiten']],
      ['Gemeinsame Zielvereinbarung', [p3.gemeinsamesZiel || '', 'sup_p3_gemeinsames_ziel']]
    ]) },
    { title: 'Vertiefte Problembearbeitung', html: `<p class="presentation-subtitle">Hier wird festgehalten, wie hilfreiche Kritik formuliert werden kann und welche Absprachen für die weitere Zusammenarbeit getroffen wurden.</p>` + editablePresentationTableFinal(['Aspekt', 'Ergebnis'], [
      ['Hilfreiche Kritik', [p4.kritik || '', 'sup_p4_kritik']],
      ['Absprachen zum weiteren Vorgehen', [p4.absprachen || '', 'sup_p4_absprachen']]
    ]) },
    { title: 'Umsetzung', html: `<p class="presentation-subtitle">Diese Folie zeigt Zustimmung, Praxistauglichkeit und erste konkrete Schritte zur Umsetzung der Vereinbarung.</p>` + editablePresentationTableFinal(['Aspekt', 'Ergebnis'], [
      ['Zustimmung zur Vereinbarung', [p5.zustimmung || '', 'sup_p5_zustimmung']],
      ['Einschätzung der Praxistauglichkeit durch die Schulleitung', [p6.praxistauglichkeit || '', 'sup_p6_praxistauglichkeit']],
      ['Unterstützungsmöglichkeiten durch die Schulleitung', [p6.unterstuetzung || '', 'sup_p6_unterstuetzung']],
      ['Erste konkrete Umsetzungsschritte', [p6.umsetzung || '', 'sup_p6_umsetzung']]
    ]) },
    { title: '', html: `<div class="thanks-slide"><h2>Vielen Dank fürs Zuhören!</h2><p>Raum für Rückfragen und gemeinsame Reflexion.</p></div>` }
  ];
}

function applyEditablePresentationStateFinal(host) {
  const cells = host.querySelectorAll('[data-edit-save]');
  cells.forEach(cell => {
    cell.contentEditable = summaryPresentationEditModeFinal ? 'true' : 'false';
    cell.classList.toggle('is-editable-cell', summaryPresentationEditModeFinal);
    cell.addEventListener('blur', () => {
      if (!summaryPresentationEditModeFinal) return;
      const keyName = cell.dataset.editSave;
      if (!keyName) return;
      const text = cell.innerText.replace(/\u00a0/g, ' ').trim();
      saveText(keyName, text === '—' ? '' : text);
    });
  });
  host.querySelectorAll('.prep-extra-text').forEach(el => enableExtraTextDragFinal(el));
}

function addPresentationTextBoxFinal() {
  const extras = getPresentationExtrasFinal();
  extras.push({ slide: summaryPresentationIndexFinal, text: 'Zusätzlicher Hinweis', x: 10, y: 72 });
  savePresentationExtrasFinal(extras);
  summaryPresentationEditModeFinal = true;
  renderSummaryPresentationSlideFinal();
}

function renderPresentationExtrasForSlideFinal(slideIndex, editable) {
  const extras = getPresentationExtrasFinal().filter(x => Number(x.slide) === Number(slideIndex));
  if (!extras.length) return '';
  return `<div class="presentation-extras-layer">${extras.map((x, i) => `<div class="prep-extra-text" data-extra-index="${i}" contenteditable="${editable && summaryPresentationEditModeFinal ? 'true' : 'false'}" style="left:${Number(x.x)||10}%;top:${Number(x.y)||72}%">${escapeHtml(x.text || '')}</div>`).join('')}</div>`;
}

function enableExtraTextDragFinal(el) {
  el.addEventListener('blur', () => {
    const extras = getPresentationExtrasFinal().filter(x => Number(x.slide) === Number(summaryPresentationIndexFinal));
    const all = getPresentationExtrasFinal();
    const localIndex = Number(el.dataset.extraIndex);
    const slideExtras = all.map((x, idx) => ({...x, _idx: idx})).filter(x => Number(x.slide) === Number(summaryPresentationIndexFinal));
    const target = slideExtras[localIndex];
    if (target) {
      all[target._idx].text = el.innerText.trim();
      savePresentationExtrasFinal(all);
    }
  });
  let dragging = false, startX = 0, startY = 0, startLeft = 0, startTop = 0;
  el.addEventListener('pointerdown', e => {
    if (!summaryPresentationEditModeFinal || e.target !== el) return;
    dragging = true; startX = e.clientX; startY = e.clientY;
    startLeft = parseFloat(el.style.left) || 10; startTop = parseFloat(el.style.top) || 72;
    el.setPointerCapture(e.pointerId);
  });
  el.addEventListener('pointermove', e => {
    if (!dragging) return;
    const parent = el.closest('.presentation-slide-inner');
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const dx = (e.clientX - startX) / rect.width * 100;
    const dy = (e.clientY - startY) / rect.height * 100;
    el.style.left = Math.max(0, Math.min(86, startLeft + dx)) + '%';
    el.style.top = Math.max(0, Math.min(92, startTop + dy)) + '%';
  });
  el.addEventListener('pointerup', e => {
    if (!dragging) return;
    dragging = false;
    const all = getPresentationExtrasFinal();
    const localIndex = Number(el.dataset.extraIndex);
    const slideExtras = all.map((x, idx) => ({...x, _idx: idx})).filter(x => Number(x.slide) === Number(summaryPresentationIndexFinal));
    const target = slideExtras[localIndex];
    if (target) {
      all[target._idx].x = parseFloat(el.style.left) || 10;
      all[target._idx].y = parseFloat(el.style.top) || 72;
      all[target._idx].text = el.innerText.trim();
      savePresentationExtrasFinal(all);
    }
  });
}

const __svOldUpdateGlobalAdminUiAfterSummary = updateGlobalAdminUi;
updateGlobalAdminUi = function() {
  if (typeof __svOldUpdateGlobalAdminUiAfterSummary === 'function') __svOldUpdateGlobalAdminUiAfterSummary();
  if (document.body.dataset.mode !== 'results') {
    const active = isGlobalAdminActive();
    document.querySelectorAll('.admin-only').forEach(el => {
      el.hidden = !active;
      el.style.display = active ? '' : 'none';
      el.style.visibility = active ? 'visible' : 'hidden';
    });
  }
};

function mergePresentationRawDataFinal(row) {
  const data = row.data || {};
  const raw = data.raw || {};
  const merged = Object.assign({}, raw, data);
  ['assignments', 'p2', 'p3', 'p4', 'p5', 'p6'].forEach(k => {
    merged[k] = Object.assign({}, raw[k] || {}, data[k] || {});
  });
  merged.presentationSettings = raw.presentationSettings || data.presentationSettings || SV_PRESENTATION_THEME_DEFAULT;
  merged.presentationExtras = raw.presentationExtras || data.presentationExtras || [];
  return merged;
}

function buildPresentationSlides(row) {
  const data = mergePresentationRawDataFinal(row);
  const p2 = data.p2 || {};
  const p3 = data.p3 || {};
  const p4 = data.p4 || {};
  const p5 = data.p5 || {};
  const p6 = data.p6 || {};
  const assignments = data.assignments || {};
  const groupName = row.groupName || data.groupName || 'Gruppe';
  const timestamp = formatResultTimestamp(getRowTimestamp(row, data));
  const roles = [
    ['Supervisor*in', assignments.supervisor || '—'],
    ['Schulleitung', assignments.schulleitung || '—'],
    ['Lehrkraft A', assignments['lehrkraft-a'] || assignments.lehrkraftA || '—'],
    ['Lehrkraft B', assignments['lehrkraft-b'] || assignments.lehrkraftB || '—']
  ];
  const baseSlides = [
    { title: 'Gruppenvorstellung', html: `<p class="presentation-kicker">${escapeHtml(timestamp)}</p><h2>${escapeHtml(groupName)}</h2>${presentationTable(['Rolle', 'Name'], roles)}<p class="presentation-note">Simulation einer Gruppensupervision zum Teamteaching im Kontext ESE.</p>` },
    { title: 'Problembeschreibung', html: `<p class="presentation-subtitle">Diese Folie bündelt die individuellen Sichtweisen der Beteiligten: Beobachtungen bzw. Probleme, Gefühle und Wünsche.</p>` + presentationTable(['Rolle', 'Probleme / Beobachtung', 'Gefühle', 'Wünsche'], [
      ['Schulleitung', p2.slProbleme || p2.slProblem || '', p2.slGefuehle || '', p2.slWuensche || ''],
      ['Lehrkraft A', p2.aProbleme || p2.aPerspektive || '', p2.aGefuehle || '', p2.aWuensche || ''],
      ['Lehrkraft B', p2.bProbleme || p2.bPerspektive || '', p2.bGefuehle || '', p2.bWuensche || '']
    ]) },
    { title: 'Zielformulierung', html: `<p class="presentation-subtitle">Hier werden die Einzelziele der Beteiligten, erkennbare Gemeinsamkeiten und die gemeinsame Zielvereinbarung zusammengeführt.</p>` + presentationTable(['Bereich', 'Eintrag'], [
      ['Ziel Schulleitung', p3.zielSL || ''],
      ['Ziel Lehrkraft A', p3.zielA || ''],
      ['Ziel Lehrkraft B', p3.zielB || ''],
      ['Gefundene Gemeinsamkeiten', p3.gemeinsamkeiten || ''],
      ['Gemeinsame Zielvereinbarung', p3.gemeinsamesZiel || p3.gemeinsameZielformulierung || '']
    ]) },
    { title: 'Vertiefte Problembearbeitung', html: `<p class="presentation-subtitle">Hier wird festgehalten, wie hilfreiche Kritik formuliert werden kann und welche Absprachen für die weitere Zusammenarbeit getroffen wurden.</p>` + presentationTable(['Aspekt', 'Ergebnis'], [
      ['Hilfreiche Kritik', p4.kritik || ''],
      ['Absprachen zum weiteren Vorgehen', p4.absprachen || p4.weiteresVorgehen || '']
    ]) },
    { title: 'Umsetzung', html: `<p class="presentation-subtitle">Diese Folie zeigt Zustimmung, Praxistauglichkeit und erste konkrete Schritte zur Umsetzung der Vereinbarung.</p>` + presentationTable(['Aspekt', 'Ergebnis'], [
      ['Zustimmung zur Vereinbarung', p5.zustimmung || ''],
      ['Einschätzung der Praxistauglichkeit durch die Schulleitung', p6.praxistauglichkeit || p6.einschaetzung || ''],
      ['Unterstützungsmöglichkeiten durch die Schulleitung', p6.unterstuetzung || ''],
      ['Erste konkrete Umsetzungsschritte', p6.umsetzung || p6.konkreteUmsetzungsschritte || '']
    ]) },
    { title: '', html: `<div class="thanks-slide"><h2>Vielen Dank fürs Zuhören!</h2><p>Raum für Rückfragen und gemeinsame Reflexion.</p></div>` }
  ];
  const extras = Array.isArray(data.presentationExtras) ? data.presentationExtras : [];
  return baseSlides.map((slide, idx) => {
    const ex = extras.filter(x => Number(x.slide) === idx);
    if (!ex.length) return slide;
    return Object.assign({}, slide, { html: slide.html + `<div class="presentation-extras-layer">${ex.map(x => `<div class="prep-extra-text result-extra-text" style="left:${Number(x.x)||10}%;top:${Number(x.y)||72}%">${escapeHtml(x.text || '')}</div>`).join('')}</div>` });
  });
}

let presentationThemeFinalRuntime = SV_PRESENTATION_THEME_DEFAULT;
const __oldInitPresentationFinalForTheme = initPresentationFinal;
initPresentationFinal = function() {
  const status = document.getElementById('presentationStatus');
  const url = getAppsScriptUrl();
  const params = new URLSearchParams(window.location.search);
  const rowParam = params.get('row');
  const idxParam = params.get('i');
  const exit = document.getElementById('presentationExitBtn');
  const full = document.getElementById('presentationFullscreenBtn');
  const prev = document.getElementById('presentationPrevBtn');
  const next = document.getElementById('presentationNextBtn');
  if (exit) exit.onclick = () => window.location.href = 'ergebnisse.html';
  if (full) full.onclick = () => {
    const root = document.documentElement;
    if (!document.fullscreenElement && root.requestFullscreen) root.requestFullscreen();
    else if (document.exitFullscreen) document.exitFullscreen();
  };
  if (prev) prev.onclick = () => movePresentationFinal(-1);
  if (next) next.onclick = () => movePresentationFinal(1);
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); movePresentationFinal(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); movePresentationFinal(-1); }
    if (e.key === 'Escape') { window.location.href = 'ergebnisse.html'; }
  });
  if (!url) {
    if (status) status.textContent = 'Keine Apps-Script-URL gefunden.';
    return;
  }
  fetchResultsWithFallback(url).then(rows => {
    let row = null;
    if (rowParam !== null) row = (rows || []).find(r => String(r.rowNumber || r.id) === String(rowParam));
    if (!row && idxParam !== null) row = (rows || [])[Number(idxParam)];
    if (!row && rows && rows.length) row = rows[0];
    if (!row) throw new Error('Kein Gruppenergebnis gefunden.');
    const merged = mergePresentationRawDataFinal(row);
    presentationThemeFinalRuntime = merged.presentationSettings || SV_PRESENTATION_THEME_DEFAULT;
    applyPresentationThemeToNodeFinal(document.body, presentationThemeFinalRuntime);
    presentationSlidesFinal = buildPresentationSlides(row);
    presentationIndexFinal = 0;
    if (status) status.hidden = true;
    renderPresentationSlideFinal();
  }).catch(err => {
    if (status) {
      status.className = 'presentation-status warning';
      status.textContent = err.message || 'Präsentation konnte nicht geladen werden.';
    }
  });
};

const __oldRenderPresentationSlideFinalForTheme = renderPresentationSlideFinal;
renderPresentationSlideFinal = function() {
  const slide = document.getElementById('presentationSlide');
  const counter = document.getElementById('presentationCounter');
  if (!slide || !presentationSlidesFinal.length) return;
  applyPresentationThemeToNodeFinal(document.body, presentationThemeFinalRuntime || SV_PRESENTATION_THEME_DEFAULT);
  applyPresentationThemeToNodeFinal(slide, presentationThemeFinalRuntime || SV_PRESENTATION_THEME_DEFAULT);
  const item = presentationSlidesFinal[presentationIndexFinal];
  const titleHtml = item.title ? `<h1>${escapeHtml(item.title)}</h1>` : '';
  slide.innerHTML = `<div class="presentation-slide-inner${item.title ? '' : ' no-title-slide'}">${titleHtml}${item.html}</div>`;
  if (counter) counter.textContent = `${presentationIndexFinal + 1} / ${presentationSlidesFinal.length}`;
};

window.addEventListener('DOMContentLoaded', () => {
  if (document.body.dataset.mode === 'summary') {
    window.setTimeout(initSummary, 0);
  }
});

/* ------------------------------------------------------------
   UPDATE: Hintergrundbild + dezentes Muster für Präsentationen
   ------------------------------------------------------------ */
(function installPresentationBackgroundPatternUpdate(){
  const OLD_APPLY = typeof applyPresentationThemeToNodeFinal === 'function' ? applyPresentationThemeToNodeFinal : null;
  const OLD_ENSURE = typeof ensurePresentationPrepModalFinal === 'function' ? ensurePresentationPrepModalFinal : null;
  const OLD_RENDER_SUMMARY = typeof renderSummaryPresentationSlideFinal === 'function' ? renderSummaryPresentationSlideFinal : null;

  function cssUrlForDataUrl(value) {
    if (!value) return '';
    return 'url("' + String(value).replace(/"/g, '\\"') + '")';
  }

  function applyExtendedTheme(host, settings) {
    if (!host) return;
    const s = Object.assign({}, (typeof SV_PRESENTATION_THEME_DEFAULT !== 'undefined' ? SV_PRESENTATION_THEME_DEFAULT : {}), settings || {});
    if (s.backgroundImage) {
      host.style.setProperty('--presentation-background-image', cssUrlForDataUrl(s.backgroundImage));
      host.classList.add('has-presentation-bg-image');
    } else {
      host.style.removeProperty('--presentation-background-image');
      host.classList.remove('has-presentation-bg-image');
    }
    host.dataset.presentationPattern = s.pattern || 'none';
  }

  if (OLD_APPLY) {
    applyPresentationThemeToNodeFinal = function(host, settings) {
      OLD_APPLY(host, settings);
      applyExtendedTheme(host, settings);
    };
  }

  function refreshPresentationToolbarControls(modal) {
    if (!modal) return;
    const settings = typeof getPresentationSettingsFinal === 'function' ? getPresentationSettingsFinal() : {};
    const pattern = modal.querySelector('#presentationPatternSelect');
    if (pattern) pattern.value = settings.pattern || 'none';
  }

  function addPresentationExtendedControls(modal) {
    if (!modal || modal.dataset.extendedPresentationControls === 'true') return;
    const toolbar = modal.querySelector('.presentation-prep-toolbar');
    if (!toolbar) return;
    modal.dataset.extendedPresentationControls = 'true';

    const bgLabel = document.createElement('label');
    bgLabel.className = 'button secondary image-upload-label';
    bgLabel.htmlFor = 'presentationBgImageInput';
    bgLabel.textContent = 'Hintergrundbild';

    const bgInput = document.createElement('input');
    bgInput.id = 'presentationBgImageInput';
    bgInput.type = 'file';
    bgInput.accept = 'image/*';
    bgInput.hidden = true;

    const removeBg = document.createElement('button');
    removeBg.type = 'button';
    removeBg.id = 'removePresentationBgImage';
    removeBg.className = 'secondary';
    removeBg.textContent = 'Bild entfernen';

    const patternLabel = document.createElement('label');
    patternLabel.className = 'theme-control-label';
    patternLabel.htmlFor = 'presentationPatternSelect';
    patternLabel.textContent = 'Muster';

    const patternSelect = document.createElement('select');
    patternSelect.id = 'presentationPatternSelect';
    patternSelect.className = 'pattern-select';
    patternSelect.innerHTML = '<option value="none">Kein Muster</option><option value="dots">Punkte</option><option value="grid">Raster</option><option value="diagonal">Diagonal</option><option value="waves">Dezente Wellen</option>';

    const after = toolbar.querySelector('#themeHueRange');
    if (after && after.parentNode === toolbar) {
      after.insertAdjacentElement('afterend', patternSelect);
      after.insertAdjacentElement('afterend', patternLabel);
      after.insertAdjacentElement('afterend', removeBg);
      after.insertAdjacentElement('afterend', bgInput);
      after.insertAdjacentElement('afterend', bgLabel);
    } else {
      toolbar.append(bgLabel, bgInput, removeBg, patternLabel, patternSelect);
    }

    bgInput.addEventListener('change', () => {
      const file = bgInput.files && bgInput.files[0];
      if (!file) return;
      if (!file.type || !file.type.startsWith('image/')) {
        alert('Bitte eine Bilddatei auswählen.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof savePresentationSettingsFinal === 'function') {
          savePresentationSettingsFinal({ backgroundImage: reader.result });
        }
        if (typeof renderSummaryPresentationSlideFinal === 'function') renderSummaryPresentationSlideFinal(false);
      };
      reader.readAsDataURL(file);
    });

    removeBg.addEventListener('click', () => {
      if (typeof savePresentationSettingsFinal === 'function') {
        savePresentationSettingsFinal({ backgroundImage: '' });
      }
      bgInput.value = '';
      if (typeof renderSummaryPresentationSlideFinal === 'function') renderSummaryPresentationSlideFinal(false);
    });

    patternSelect.addEventListener('change', () => {
      if (typeof savePresentationSettingsFinal === 'function') {
        savePresentationSettingsFinal({ pattern: patternSelect.value });
      }
      if (typeof renderSummaryPresentationSlideFinal === 'function') renderSummaryPresentationSlideFinal(false);
    });
    refreshPresentationToolbarControls(modal);
  }

  if (OLD_ENSURE) {
    ensurePresentationPrepModalFinal = function() {
      const modal = OLD_ENSURE();
      addPresentationExtendedControls(modal);
      return modal;
    };
  }

  if (OLD_RENDER_SUMMARY) {
    renderSummaryPresentationSlideFinal = function(updateControls) {
      OLD_RENDER_SUMMARY(updateControls);
      const modal = document.getElementById('presentationPrepModal');
      if (!modal) return;
      const settings = typeof getPresentationSettingsFinal === 'function' ? getPresentationSettingsFinal() : {};
      const stage = modal.querySelector('.presentation-prep-stage');
      const slide = modal.querySelector('#summaryPresentationSlide');
      if (typeof applyPresentationThemeToNodeFinal === 'function') {
        applyPresentationThemeToNodeFinal(stage, settings);
        applyPresentationThemeToNodeFinal(slide, settings);
      }
      refreshPresentationToolbarControls(modal);
    };
  }
})();

/*
   FINAL OVERRIDE: Präsentationsbearbeitung verbessert
   - Tabellen ohne horizontales Scrollen, Inhalte umbrechen
   - Überschrift/Beschreibung direkt bearbeitbar
   - Textboxen verschiebbar und skalierbar
   - Speichern-Button
   - Farbregler entfernt, Muster/Farbe getrennt steuerbar
*/
(function(){
  const DEFAULT_SLIDE_TITLES = [
    'Gruppenvorstellung',
    'Problembeschreibung',
    'Zielformulierung',
    'Vertiefte Problembearbeitung',
    'Umsetzung',
    ''
  ];
  const DEFAULT_SLIDE_SUBTITLES = [
    '',
    'Diese Folie bündelt die individuellen Sichtweisen der Beteiligten: Beobachtungen bzw. Probleme, Gefühle und Wünsche.',
    'Hier werden die Einzelziele der Beteiligten, erkennbare Gemeinsamkeiten und die gemeinsame Zielvereinbarung zusammengeführt.',
    'Hier wird festgehalten, wie hilfreiche Kritik formuliert werden kann und welche Absprachen für die weitere Zusammenarbeit getroffen wurden.',
    'Diese Folie zeigt Zustimmung, Praxistauglichkeit und erste konkrete Schritte zur Umsetzung der Vereinbarung.',
    ''
  ];

  function textOverrides(){
    const obj = (typeof loadObj === 'function') ? loadObj('presentation_text_overrides', {}) : {};
    return obj && typeof obj === 'object' ? obj : {};
  }
  function saveTextOverrides(obj){
    if (typeof saveObj === 'function') saveObj('presentation_text_overrides', obj || {});
  }
  function getSlideText(idx, type, fallback){
    const o = textOverrides();
    const key = `s${idx}_${type}`;
    return (o[key] !== undefined && o[key] !== null && String(o[key]).trim() !== '') ? String(o[key]) : (fallback || '');
  }
  function setSlideText(idx, type, value){
    const o = textOverrides();
    o[`s${idx}_${type}`] = String(value || '').trim();
    saveTextOverrides(o);
  }
  window.getPresentationTextOverridesFinal = textOverrides;

  const OLD_GET_SETTINGS = typeof getPresentationSettingsFinal === 'function' ? getPresentationSettingsFinal : null;
  getPresentationSettingsFinal = function(){
    const base = OLD_GET_SETTINGS ? OLD_GET_SETTINGS() : {};
    return Object.assign({
      heading: '#1e3a5f',
      text: '#0f172a',
      background: '#0f172a',
      slide: '#ffffff',
      pattern: 'none',
      patternTarget: 'slide',
      patternColor: '#e5e7eb',
      backgroundImage: ''
    }, base || {});
  };

  const OLD_APPLY_THEME = typeof applyPresentationThemeToNodeFinal === 'function' ? applyPresentationThemeToNodeFinal : null;
  applyPresentationThemeToNodeFinal = function(host, settings){
    const s = Object.assign({}, getPresentationSettingsFinal(), settings || {});
    if (OLD_APPLY_THEME) OLD_APPLY_THEME(host, s);
    if (!host) return;
    host.style.setProperty('--presentation-heading-color', s.heading || '#1e3a5f');
    host.style.setProperty('--presentation-text-color', s.text || '#0f172a');
    host.style.setProperty('--presentation-background-color', s.background || '#0f172a');
    host.style.setProperty('--presentation-slide-color', s.slide || '#ffffff');
    host.style.setProperty('--presentation-pattern-color', s.patternColor || '#e5e7eb');
    host.style.setProperty('--presentation-background-image', s.backgroundImage ? `url("${s.backgroundImage}")` : 'none');

    const pattern = s.pattern || 'none';
    const target = s.patternTarget || 'slide';
    if (host.classList && host.classList.contains('presentation-slide')) {
      host.dataset.presentationPattern = target === 'slide' ? pattern : 'none';
      host.dataset.presentationPatternTarget = target;
    } else if (host.classList && (host.classList.contains('presentation-prep-stage') || host.classList.contains('presentation-body'))) {
      host.dataset.presentationPattern = target === 'background' ? pattern : 'none';
      host.dataset.presentationPatternTarget = target;
    }
    if (host.classList && host.classList.contains('presentation-prep-stage')) {
      host.classList.toggle('has-presentation-bg-image', !!s.backgroundImage);
    }
    if (host.classList && host.classList.contains('presentation-body')) {
      host.classList.toggle('has-presentation-bg-image', !!s.backgroundImage);
    }
  };

  function flushContentEditableEdits(){
    const modal = document.getElementById('presentationPrepModal');
    if (!modal) return;
    const slide = modal.querySelector('#summaryPresentationSlide');
    if (!slide) return;
    slide.querySelectorAll('[data-edit-save]').forEach(cell => {
      const k = cell.dataset.editSave;
      if (!k) return;
      const txt = cell.innerText.replace(/\u00a0/g, ' ').trim();
      if (typeof saveText === 'function') saveText(k, txt === '—' ? '' : txt);
    });
    const title = slide.querySelector('[data-edit-slide-title]');
    if (title) setSlideText(Number(title.dataset.editSlideTitle), 'title', title.innerText.trim());
    const subtitle = slide.querySelector('[data-edit-slide-subtitle]');
    if (subtitle) setSlideText(Number(subtitle.dataset.editSlideSubtitle), 'subtitle', subtitle.innerText.trim());
    persistAllExtraTextBoxesFromDom();
  }
  window.saveCurrentPresentationEditsFinal = flushContentEditableEdits;

  function persistAllExtraTextBoxesFromDom(){
    const all = typeof getPresentationExtrasFinal === 'function' ? getPresentationExtrasFinal() : [];
    const modal = document.getElementById('presentationPrepModal');
    if (!modal || !Array.isArray(all)) return;
    const parent = modal.querySelector('#summaryPresentationSlide .presentation-slide-inner');
    modal.querySelectorAll('.prep-extra-text').forEach(el => {
      const globalIndex = Number(el.dataset.extraGlobalIndex);
      if (!Number.isFinite(globalIndex) || !all[globalIndex]) return;
      all[globalIndex].text = el.innerText.trim();
      all[globalIndex].x = parseFloat(el.style.left) || all[globalIndex].x || 10;
      all[globalIndex].y = parseFloat(el.style.top) || all[globalIndex].y || 72;
      if (parent) {
        all[globalIndex].w = Math.max(8, (el.offsetWidth / parent.clientWidth) * 100);
        all[globalIndex].h = Math.max(4, (el.offsetHeight / parent.clientHeight) * 100);
      }
    });
    if (typeof savePresentationExtrasFinal === 'function') savePresentationExtrasFinal(all);
  }

  const OLD_EXTRAS = typeof renderPresentationExtrasForSlideFinal === 'function' ? renderPresentationExtrasForSlideFinal : null;
  renderPresentationExtrasForSlideFinal = function(slideIndex, editable){
    const all = typeof getPresentationExtrasFinal === 'function' ? getPresentationExtrasFinal() : [];
    const items = all.map((x, idx) => Object.assign({}, x, { _globalIndex: idx }))
      .filter(x => Number(x.slide) === Number(slideIndex));
    if (!items.length) return '';
    return `<div class="presentation-extras-layer">${items.map((x, i) => {
      const w = Number(x.w) || 24;
      const h = Number(x.h) || 9;
      return `<div class="prep-extra-text" data-extra-index="${i}" data-extra-global-index="${x._globalIndex}" contenteditable="${editable && summaryPresentationEditModeFinal ? 'true' : 'false'}" style="left:${Number(x.x)||10}%;top:${Number(x.y)||72}%;width:${w}%;min-height:${h}%">${escapeHtml(x.text || '')}</div>`;
    }).join('')}</div>`;
  };

  function isResizeZone(e, el){
    const r = el.getBoundingClientRect();
    return (r.right - e.clientX < 22) && (r.bottom - e.clientY < 22);
  }

  enableExtraTextDragFinal = function(el){
    if (!el || el.dataset.enhancedResizeDrag === 'true') return;
    el.dataset.enhancedResizeDrag = 'true';
    el.addEventListener('blur', persistAllExtraTextBoxesFromDom);
    el.addEventListener('input', () => { el.dataset.dirty = 'true'; });
    let dragging = false, startX = 0, startY = 0, startLeft = 0, startTop = 0;
    el.addEventListener('pointerdown', e => {
      if (!summaryPresentationEditModeFinal) return;
      if (isResizeZone(e, el)) return;
      dragging = true;
      startX = e.clientX; startY = e.clientY;
      startLeft = parseFloat(el.style.left) || 10;
      startTop = parseFloat(el.style.top) || 72;
      try { el.setPointerCapture(e.pointerId); } catch(_err) {}
    });
    el.addEventListener('pointermove', e => {
      if (!dragging) return;
      const parent = el.closest('.presentation-slide-inner');
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dx = (e.clientX - startX) / rect.width * 100;
      const dy = (e.clientY - startY) / rect.height * 100;
      el.style.left = Math.max(0, Math.min(92, startLeft + dx)) + '%';
      el.style.top = Math.max(0, Math.min(92, startTop + dy)) + '%';
    });
    el.addEventListener('pointerup', () => {
      if (!dragging) return;
      dragging = false;
      persistAllExtraTextBoxesFromDom();
    });
  };

  const OLD_ADD_BOX = typeof addPresentationTextBoxFinal === 'function' ? addPresentationTextBoxFinal : null;
  addPresentationTextBoxFinal = function(){
    const extras = getPresentationExtrasFinal();
    extras.push({ slide: summaryPresentationIndexFinal, text: 'Zusätzlicher Hinweis', x: 10, y: 72, w: 28, h: 10 });
    savePresentationExtrasFinal(extras);
    summaryPresentationEditModeFinal = true;
    renderSummaryPresentationSlideFinal();
  };

  const OLD_ENSURE_MODAL = typeof ensurePresentationPrepModalFinal === 'function' ? ensurePresentationPrepModalFinal : null;
  ensurePresentationPrepModalFinal = function(){
    const modal = OLD_ENSURE_MODAL ? OLD_ENSURE_MODAL() : null;
    if (!modal) return modal;
    const toolbar = modal.querySelector('.presentation-prep-toolbar');
    if (!toolbar) return modal;

    const hue = toolbar.querySelector('#themeHueRange');
    if (hue) hue.remove();

    // alte/duplizierte Mustersteuerungen entfernen
    toolbar.querySelectorAll('#presentationPatternSelect, #presentationPatternTargetSelect, #presentationPatternColorPicker, .pattern-control-label, .pattern-target-select, .pattern-color-picker').forEach(el => el.remove());
    toolbar.querySelectorAll('label[for="presentationPatternSelect"], label[for="presentationPatternTargetSelect"], label[for="presentationPatternColorPicker"]').forEach(el => el.remove());

    let saveBtn = toolbar.querySelector('#savePresentationPrepBtn');
    if (!saveBtn) {
      saveBtn = document.createElement('button');
      saveBtn.type = 'button';
      saveBtn.id = 'savePresentationPrepBtn';
      saveBtn.className = 'secondary save-presentation-button';
      saveBtn.textContent = 'Speichern';
      const after = toolbar.querySelector('#addPresentationText') || toolbar.lastElementChild;
      after.insertAdjacentElement('afterend', saveBtn);
      saveBtn.addEventListener('click', () => {
        flushContentEditableEdits();
        const old = saveBtn.textContent;
        saveBtn.textContent = 'Gespeichert';
        saveBtn.classList.add('success-btn');
        setTimeout(() => { saveBtn.textContent = old; saveBtn.classList.remove('success-btn'); }, 1200);
      });
    }

    const colorPicker = toolbar.querySelector('#themeColorPicker');
    if (colorPicker && !toolbar.querySelector('#presentationPatternTargetSelect')) {
      const patternLabel = document.createElement('label');
      patternLabel.className = 'theme-control-label pattern-control-label';
      patternLabel.htmlFor = 'presentationPatternSelect';
      patternLabel.textContent = 'Muster';

      const targetSelect = document.createElement('select');
      targetSelect.id = 'presentationPatternTargetSelect';
      targetSelect.className = 'theme-select pattern-target-select';
      targetSelect.innerHTML = '<option value="slide">Folie</option><option value="background">Hintergrund</option>';

      const patternSelect = document.createElement('select');
      patternSelect.id = 'presentationPatternSelect';
      patternSelect.className = 'pattern-select';
      patternSelect.innerHTML = '<option value="none">Kein Muster</option><option value="dots">Punkte</option><option value="grid">Raster</option><option value="diagonal">Diagonal</option><option value="waves">Dezente Wellen</option>';

      const patternColor = document.createElement('input');
      patternColor.id = 'presentationPatternColorPicker';
      patternColor.type = 'color';
      patternColor.className = 'pattern-color-picker';
      patternColor.value = getPresentationSettingsFinal().patternColor || '#e5e7eb';
      patternColor.title = 'Musterfarbe';

      colorPicker.insertAdjacentElement('afterend', patternLabel);
      patternLabel.insertAdjacentElement('afterend', targetSelect);
      targetSelect.insertAdjacentElement('afterend', patternSelect);
      patternSelect.insertAdjacentElement('afterend', patternColor);

      targetSelect.addEventListener('change', () => {
        savePresentationSettingsFinal({ patternTarget: targetSelect.value });
        renderSummaryPresentationSlideFinal(false);
      });
      patternSelect.addEventListener('change', () => {
        savePresentationSettingsFinal({ pattern: patternSelect.value });
        renderSummaryPresentationSlideFinal(false);
      });
      patternColor.addEventListener('input', () => {
        savePresentationSettingsFinal({ patternColor: patternColor.value });
        renderSummaryPresentationSlideFinal(false);
      });
    }

    const settings = getPresentationSettingsFinal();
    const ps = toolbar.querySelector('#presentationPatternSelect');
    const pt = toolbar.querySelector('#presentationPatternTargetSelect');
    const pc = toolbar.querySelector('#presentationPatternColorPicker');
    if (ps) ps.value = settings.pattern || 'none';
    if (pt) pt.value = settings.patternTarget || 'slide';
    if (pc) pc.value = settings.patternColor || '#e5e7eb';
    return modal;
  };

  const OLD_RENDER_SUMMARY_PREP = typeof renderSummaryPresentationSlideFinal === 'function' ? renderSummaryPresentationSlideFinal : null;
  renderSummaryPresentationSlideFinal = function(updateControls = true){
    if (OLD_RENDER_SUMMARY_PREP) OLD_RENDER_SUMMARY_PREP(updateControls);
    const modal = document.getElementById('presentationPrepModal');
    const slideHost = modal && modal.querySelector('#summaryPresentationSlide');
    if (!modal || !slideHost) return;
    const idx = Number(summaryPresentationIndexFinal) || 0;
    const inner = slideHost.querySelector('.presentation-slide-inner');
    if (!inner) return;

    const h1 = inner.querySelector('h1');
    if (h1) {
      h1.textContent = getSlideText(idx, 'title', DEFAULT_SLIDE_TITLES[idx] || h1.textContent);
      h1.dataset.editSlideTitle = String(idx);
      h1.contentEditable = summaryPresentationEditModeFinal ? 'true' : 'false';
      h1.classList.toggle('is-editable-title', summaryPresentationEditModeFinal);
      h1.addEventListener('blur', () => setSlideText(idx, 'title', h1.innerText.trim()));
    }
    const subtitle = inner.querySelector('.presentation-subtitle');
    if (subtitle) {
      subtitle.textContent = getSlideText(idx, 'subtitle', DEFAULT_SLIDE_SUBTITLES[idx] || subtitle.textContent);
      subtitle.dataset.editSlideSubtitle = String(idx);
      subtitle.contentEditable = summaryPresentationEditModeFinal ? 'true' : 'false';
      subtitle.classList.toggle('is-editable-title', summaryPresentationEditModeFinal);
      subtitle.addEventListener('blur', () => setSlideText(idx, 'subtitle', subtitle.innerText.trim()));
    }
    slideHost.querySelectorAll('[data-edit-save], [data-edit-slide-title], [data-edit-slide-subtitle]').forEach(el => {
      if (summaryPresentationEditModeFinal) el.setAttribute('spellcheck', 'true');
    });
    slideHost.querySelectorAll('.prep-extra-text').forEach(el => enableExtraTextDragFinal(el));

    const settings = getPresentationSettingsFinal();
    applyPresentationThemeToNodeFinal(modal.querySelector('.presentation-prep-stage'), settings);
    applyPresentationThemeToNodeFinal(slideHost, settings);
    const toolbar = modal.querySelector('.presentation-prep-toolbar');
    if (toolbar && updateControls) {
      const ps = toolbar.querySelector('#presentationPatternSelect');
      const pt = toolbar.querySelector('#presentationPatternTargetSelect');
      const pc = toolbar.querySelector('#presentationPatternColorPicker');
      if (ps) ps.value = settings.pattern || 'none';
      if (pt) pt.value = settings.patternTarget || 'slide';
      if (pc) pc.value = settings.patternColor || '#e5e7eb';
    }
  };

  const OLD_BUILD_PAYLOAD = typeof buildPayload === 'function' ? buildPayload : null;
  buildPayload = function(){
    flushContentEditableEdits();
    const data = OLD_BUILD_PAYLOAD ? OLD_BUILD_PAYLOAD() : collectSupervisorData();
    data.presentationSettings = getPresentationSettingsFinal();
    data.presentationExtras = getPresentationExtrasFinal();
    data.presentationTextOverrides = textOverrides();
    return data;
  };

  const OLD_MERGE = typeof mergePresentationRawDataFinal === 'function' ? mergePresentationRawDataFinal : null;
  mergePresentationRawDataFinal = function(row){
    const data = OLD_MERGE ? OLD_MERGE(row) : ((row && row.data) || {});
    const raw = (row && row.data && row.data.raw) || data.raw || {};
    data.presentationSettings = raw.presentationSettings || data.presentationSettings || getPresentationSettingsFinal();
    data.presentationExtras = raw.presentationExtras || data.presentationExtras || [];
    data.presentationTextOverrides = raw.presentationTextOverrides || data.presentationTextOverrides || {};
    return data;
  };

  function getResultText(data, idx, type, fallback){
    const o = (data && data.presentationTextOverrides) || {};
    const key = `s${idx}_${type}`;
    return (o[key] !== undefined && o[key] !== null && String(o[key]).trim() !== '') ? String(o[key]) : (fallback || '');
  }
  function subtitleHtml(data, idx, fallback){
    const txt = getResultText(data, idx, 'subtitle', fallback);
    return txt ? `<p class="presentation-subtitle">${escapeHtml(txt)}</p>` : '';
  }

  buildPresentationSlides = function(row){
    const data = mergePresentationRawDataFinal(row);
    const p2 = data.p2 || {}, p3 = data.p3 || {}, p4 = data.p4 || {}, p5 = data.p5 || {}, p6 = data.p6 || {};
    const assignments = data.assignments || {};
    const groupName = row.groupName || data.groupName || 'Gruppe';
    const timestamp = formatResultTimestamp(getRowTimestamp(row, data));
    const roles = [
      ['Supervisor*in', assignments.supervisor || '—'],
      ['Schulleitung', assignments.schulleitung || '—'],
      ['Lehrkraft A', assignments['lehrkraft-a'] || assignments.lehrkraftA || '—'],
      ['Lehrkraft B', assignments['lehrkraft-b'] || assignments.lehrkraftB || '—']
    ];
    const slides = [
      { title: getResultText(data, 0, 'title', 'Gruppenvorstellung'), html: `<p class="presentation-kicker">${escapeHtml(timestamp)}</p><h2>${escapeHtml(groupName)}</h2>${presentationTable(['Rolle', 'Name'], roles)}<p class="presentation-note">Simulation einer Gruppensupervision zum Teamteaching im Kontext ESE.</p>` },
      { title: getResultText(data, 1, 'title', 'Problembeschreibung'), html: subtitleHtml(data, 1, DEFAULT_SLIDE_SUBTITLES[1]) + presentationTable(['Rolle', 'Probleme / Beobachtung', 'Gefühle', 'Wünsche'], [
        ['Schulleitung', p2.slProbleme || p2.slProblem || '', p2.slGefuehle || '', p2.slWuensche || ''],
        ['Lehrkraft A', p2.aProbleme || p2.aPerspektive || '', p2.aGefuehle || '', p2.aWuensche || ''],
        ['Lehrkraft B', p2.bProbleme || p2.bPerspektive || '', p2.bGefuehle || '', p2.bWuensche || '']
      ]) },
      { title: getResultText(data, 2, 'title', 'Zielformulierung'), html: subtitleHtml(data, 2, DEFAULT_SLIDE_SUBTITLES[2]) + presentationTable(['Bereich', 'Eintrag'], [
        ['Ziel Schulleitung', p3.zielSL || ''], ['Ziel Lehrkraft A', p3.zielA || ''], ['Ziel Lehrkraft B', p3.zielB || ''], ['Gefundene Gemeinsamkeiten', p3.gemeinsamkeiten || ''], ['Gemeinsame Zielvereinbarung', p3.gemeinsamesZiel || p3.gemeinsameZielformulierung || '']
      ]) },
      { title: getResultText(data, 3, 'title', 'Vertiefte Problembearbeitung'), html: subtitleHtml(data, 3, DEFAULT_SLIDE_SUBTITLES[3]) + presentationTable(['Aspekt', 'Ergebnis'], [
        ['Hilfreiche Kritik', p4.kritik || ''], ['Absprachen zum weiteren Vorgehen', p4.absprachen || p4.weiteresVorgehen || '']
      ]) },
      { title: getResultText(data, 4, 'title', 'Umsetzung'), html: subtitleHtml(data, 4, DEFAULT_SLIDE_SUBTITLES[4]) + presentationTable(['Aspekt', 'Ergebnis'], [
        ['Zustimmung zur Vereinbarung', p5.zustimmung || ''], ['Einschätzung der Praxistauglichkeit durch die Schulleitung', p6.praxistauglichkeit || p6.einschaetzung || ''], ['Unterstützungsmöglichkeiten durch die Schulleitung', p6.unterstuetzung || ''], ['Erste konkrete Umsetzungsschritte', p6.umsetzung || p6.konkreteUmsetzungsschritte || '']
      ]) },
      { title: getResultText(data, 5, 'title', ''), html: `<div class="thanks-slide"><h2>Vielen Dank fürs Zuhören!</h2><p>Raum für Rückfragen und gemeinsame Reflexion.</p></div>` }
    ];
    const extras = Array.isArray(data.presentationExtras) ? data.presentationExtras : [];
    return slides.map((slide, idx) => {
      const ex = extras.filter(x => Number(x.slide) === idx);
      if (!ex.length) return slide;
      return Object.assign({}, slide, { html: slide.html + `<div class="presentation-extras-layer">${ex.map(x => `<div class="prep-extra-text result-extra-text" style="left:${Number(x.x)||10}%;top:${Number(x.y)||72}%;width:${Number(x.w)||24}%;min-height:${Number(x.h)||9}%">${escapeHtml(x.text || '')}</div>`).join('')}</div>` });
    });
  };

  const OLD_RENDER_PRESENTATION = typeof renderPresentationSlideFinal === 'function' ? renderPresentationSlideFinal : null;
  renderPresentationSlideFinal = function(){
    const slide = document.getElementById('presentationSlide');
    const counter = document.getElementById('presentationCounter');
    if (!slide || !presentationSlidesFinal.length) return;
    applyPresentationThemeToNodeFinal(document.body, presentationThemeFinalRuntime || getPresentationSettingsFinal());
    applyPresentationThemeToNodeFinal(slide, presentationThemeFinalRuntime || getPresentationSettingsFinal());
    const item = presentationSlidesFinal[presentationIndexFinal];
    const titleHtml = item.title ? `<h1>${escapeHtml(item.title)}</h1>` : '';
    slide.innerHTML = `<div class="presentation-slide-inner${item.title ? '' : ' no-title-slide'}">${titleHtml}${item.html}</div>`;
    if (counter) counter.textContent = `${presentationIndexFinal + 1} / ${presentationSlidesFinal.length}`;
  };
})();
