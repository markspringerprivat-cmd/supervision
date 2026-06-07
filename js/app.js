
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
  document.querySelectorAll("textarea[data-save], input[data-save]").forEach(el => {
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
        <h2>Stichpunkte Problembeschreibung</h2>
        ${noteArea("Schulleitung: Gefühle", "sup_p2_sl_gefuehle")}
        ${noteArea("Schulleitung: Wünsche", "sup_p2_sl_wuensche")}
        ${noteArea("Lehrkraft A: Gefühle", "sup_p2_a_gefuehle")}
        ${noteArea("Lehrkraft A: Wünsche", "sup_p2_a_wuensche")}
        ${noteArea("Lehrkraft B: Gefühle", "sup_p2_b_gefuehle")}
        ${noteArea("Lehrkraft B: Wünsche", "sup_p2_b_wuensche")}
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
  return `
    <div class="summary-block"><strong>Probleme / Gefühle / Wünsche:</strong><br>${escapeHtml(shortLine([data.p2.slGefuehle, data.p2.slWuensche, data.p2.aGefuehle, data.p2.aWuensche, data.p2.bGefuehle, data.p2.bWuensche]))}</div>
    <div class="summary-block"><strong>Gemeinsames Ziel:</strong><br>${escapeHtml(data.p3.gemeinsamesZiel || "Noch nicht notiert.")}</div>
    <div class="summary-block"><strong>Brainstorming / Absprachen:</strong><br>${escapeHtml(shortLine([data.p4.kritik, data.p4.anerkennung, data.p4.absprachen]))}</div>
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
      slGefuehle: loadText("sup_p2_sl_gefuehle"), slWuensche: loadText("sup_p2_sl_wuensche"),
      aGefuehle: loadText("sup_p2_a_gefuehle"), aWuensche: loadText("sup_p2_a_wuensche"),
      bGefuehle: loadText("sup_p2_b_gefuehle"), bWuensche: loadText("sup_p2_b_wuensche")
    },
    p3: {
      zielSL: loadText("sup_p3_ziel_sl"), zielA: loadText("sup_p3_ziel_a"), zielB: loadText("sup_p3_ziel_b"),
      gemeinsamkeiten: loadText("sup_p3_gemeinsamkeiten"), gemeinsamesZiel: loadText("sup_p3_gemeinsames_ziel")
    },
    p4: { kritik: loadText("sup_p4_kritik"), anerkennung: loadText("sup_p4_anerkennung"), absprachen: loadText("sup_p4_absprachen") },
    p5: { zustimmung: loadText("sup_p5_zustimmung") },
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
  const exportBtn = document.getElementById("downloadJson");
  if (exportBtn) exportBtn.addEventListener("click", downloadJson);
}

function renderSummary(data) {
  const target = document.getElementById("summaryContent");
  if (!target) return;
  target.innerHTML = `
    <section class="card">
      <h2>Rollenverteilung</h2>
      <ul class="tight">${Object.entries(data.assignments).map(([r,n]) => `<li><strong>${ROLES[r] || r}:</strong> ${escapeHtml(n)}</li>`).join("")}</ul>
    </section>
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
function labelize(s) { return s.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase()); }

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
    status.textContent = "Keine Apps-Script-URL gefunden. Prüfe js/config.js oder DEFAULT_APPS_SCRIPT_URL in js/app.js. Exportiere alternativ die JSON-Datei.";
    return;
  }
  const payload = buildPayload();
  try {
    await fetch(url, { method: "POST", mode: "no-cors", body: JSON.stringify(payload), headers: { "Content-Type": "text/plain;charset=utf-8" } });
    status.className = "success";
    status.textContent = "Die Daten wurden an Google Apps Script gesendet. Wegen Browser-Sicherheitsregeln kann die Antwort nicht geprüft werden.";
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

function initResults() {
  initCommon();
  const status = document.getElementById("resultsStatus");
  const url = getAppsScriptUrl();
  if (!url) {
    status.className = "warning";
    status.textContent = "Keine Apps-Script-URL gefunden. Prüfe js/config.js oder DEFAULT_APPS_SCRIPT_URL in js/app.js.";
    return;
  }

  status.className = "notice";
  status.textContent = "Ergebnisse werden geladen …";
  fetchResultsWithFallback(url)
    .then(rows => {
      status.textContent = "";
      renderResults(rows || []);
    })
    .catch(err => {
      status.className = "warning";
      status.textContent = err.message + " Prüfe die Web-App-URL, die Bereitstellung und den Zugriff 'Jeder'.";
    });
}

function renderResults(rows) {
  const target = document.getElementById("resultsContent");
  if (!target) return;
  if (!rows.length) {
    target.innerHTML = `<div class="notice">Noch keine Ergebnisse vorhanden.</div>`;
    return;
  }
  target.innerHTML = rows.slice().reverse().map((row) => {
    const data = row.data || {};
    return `<section class="card">
      <h2>${escapeHtml(row.groupName || data.groupName || "Gruppe")}</h2>
      <p class="small">${escapeHtml(row.timestamp || data.timestampLocal || "")}</p>
      <details>
        <summary>Ergebnis anzeigen</summary>
        ${summarySection("Phase 2: Problembeschreibung", data.p2 || {})}
        ${summarySection("Phase 3: Zielformulierung", data.p3 || {})}
        ${summarySection("Phase 4: Vertiefte Problembearbeitung", data.p4 || {})}
        ${summarySection("Phase 5/6: Umsetzung", Object.assign({}, data.p5 || {}, data.p6 || {}))}
        <section class="card"><h2>Rollen / Gruppe</h2><pre>${escapeHtml(JSON.stringify({ groupName: data.groupName, assignments: data.assignments }, null, 2))}</pre></section>
      </details>
    </section>`;
  }).join("");
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

window.addEventListener("DOMContentLoaded", () => {
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
