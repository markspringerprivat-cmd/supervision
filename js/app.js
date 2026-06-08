
// Fallback: Damit die Google-Sheet-Anbindung auch funktioniert, wenn js/config.js
// versehentlich nicht mit hochgeladen oder vom Browser noch gecacht wurde.
const DEFAULT_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx4K6qaDC0b3fSBMnBbk0M0GT9q2gbojBf6xve-D_4XD6t6u2uQwZDYBNbfevh_0xS0/exec";

function getAppsScriptUrl() {
  const fromConfig = window.SUPERVISION_CONFIG && window.SUPERVISION_CONFIG.APPS_SCRIPT_URL;
  return (fromConfig || DEFAULT_APPS_SCRIPT_URL || "").trim();
}

const ROLES = {
  supervisor: "Supervisor*in",
  schulleitung: "Schulleitung",
  "lehrkraft-a": "Lehrkraft A",
  "lehrkraft-b": "Lehrkraft B",
  protokoll: "Protokoll"
};

const ROLE_FILES = {
  supervisor: "rolle-supervisor.html",
  schulleitung: "rolle-schulleitung.html",
  "lehrkraft-a": "rolle-lehrkraft-a.html",
  "lehrkraft-b": "rolle-lehrkraft-b.html",
  protokoll: "rolle-protokoll.html"
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
    caseFocus: "Der Fall betrifft eine ESE-Klasse, in der unterschiedliche pädagogische Vorgehensweisen im Teamteaching zu Unsicherheit führen. Im Zentrum steht die Zusammenarbeit zwischen Erfahrung, neuer Methodik und gemeinsamer Verantwortung."
  },
  schulleitung: {
    title: "Rollenkarte: Schulleitung",
    intro: "Du hast die Supervision angeregt, weil der Konflikt im Teamteaching nicht mehr allein zwischen den beiden Lehrkräften geklärt werden konnte. Dir geht es um Schutz, Verlässlichkeit und professionelle Zusammenarbeit.",
    bullets: [
      "Du beobachtest, dass Absprachen im Teamteaching fehlen oder unterschiedlich verstanden werden.",
      "Du machst dir Sorgen, dass die Klasse unter den ungeklärten Erwachsenenabsprachen leidet und dadurch weniger Stabilität erlebt.",
      "Du willst nicht einseitig Partei ergreifen, brauchst aber eine tragfähige Vereinbarung.",
      "Du kannst Ressourcen bereitstellen: Gesprächszeit, Absprachen im Kollegium, Unterstützung bei Förder- und Deeskalationsplanung."
    ],
    caseFocus: "Deine Leitfrage: Wie kann die Schule einen verlässlichen Rahmen schaffen, ohne eine der Lehrkräfte bloßzustellen?"
  },
  "lehrkraft-a": {
    title: "Rollenkarte: Lehrkraft A – erfahrene Teamteaching-Lehrkraft",
    intro: "Du arbeitest seit Jahren im Teamteaching und kennst die Klasse sowie einzelne herausfordernde Dynamiken schon länger. Du hast ein festes Vorgehen entwickelt, das aus deiner Sicht Stabilität gibt: klare Ansage, kurze Auszeit, Wiedereinstieg.",
    bullets: [
      "Du erlebst Lehrkraft B als Person, die deine Erfahrung nicht ausreichend respektiert.",
      "Als Lehrkraft B vor der Klasse eingreift, fühlst du dich untergraben.",
      "Du befürchtest, dass bei zu viel Verhandlung klare Grenzen verloren gehen.",
      "Du möchtest, dass klare Regeln gelten und du im Unterricht handlungsfähig bleibst."
    ],
    caseFocus: "Deine Spannung: Du willst Schüler*innen unterstützen, aber du willst auch Verlässlichkeit, Autorität und Ruhe für die Klasse sichern."
  },
  "lehrkraft-b": {
    title: "Rollenkarte: Lehrkraft B – neue Teamteaching-Lehrkraft",
    intro: "Du bist neu im Teamteaching und möchtest stärker beziehungs- und ressourcenorientiert arbeiten. Du fragst dich, ob das bisherige Vorgehen die wiederkehrenden Eskalationen eher stabilisiert als löst.",
    bullets: [
      "Du willst Schüler*innen nicht vorschnell aus Situationen ausschließen.",
      "Du möchtest neue Methoden ausprobieren: Wahlmöglichkeiten, Deeskalationsplan, frühere Wahrnehmung von Auslösern.",
      "Du fühlst dich von Lehrkraft A wenig ernst genommen, weil auf Erfahrung verwiesen wird.",
      "Du willst Veränderung, aber nicht dauerhaft gegen die Kollegin/den Kollegen arbeiten."
    ],
    caseFocus: "Deine Spannung: Du willst pädagogisch anders ansetzen, musst aber lernen, Veränderungen im Team abzusprechen und nicht spontan vor der Klasse einzuführen."
  }
};

const CASE_TEXT = `In einer Klasse mit Förderbedarf im Bereich emotionale und soziale Entwicklung kommt es regelmäßig zu Unruhe, Verweigerung und impulsiven Reaktionen einzelner Schüler*innen. Besonders in offenen Arbeitsphasen wird deutlich, dass die Klasse klare, verlässliche Absprachen braucht.

In der Klasse arbeiten zwei Lehrkräfte im Teamteaching:

Lehrkraft A ist seit mehreren Jahren an der Schule und arbeitet nach einem festen, strukturierenden Vorgehen: klare Ansage, Sitzplatzwechsel, kurze Auszeit, danach Wiedereinstieg. Aus dieser Perspektive geben Konsequenz und Vorhersehbarkeit der Klasse Halt.

Lehrkraft B ist neu im Team und möchte stärker beziehungs- und ressourcenorientiert arbeiten. Sie schlägt vor, Auslöser früher wahrzunehmen, mehr Wahlmöglichkeiten zu geben und gemeinsam präventive Strategien zu entwickeln.

In einer Unterrichtsstunde eskaliert die Situation. Während Lehrkraft A auf eine klare Konsequenz setzen möchte, greift Lehrkraft B mit einem alternativen Vorschlag ein. Dadurch entsteht vor der Klasse der Eindruck, dass die Lehrkräfte nicht gemeinsam handeln.

Lehrkraft A fühlt sich dadurch vor der Klasse untergraben. Lehrkraft B fühlt sich nicht ernst genommen und erlebt das bisherige Vorgehen als zu starr.

Die Situation wird der Schulleitung gemeldet. Die Schulleitung schaltet eine Supervisor*in ein, weil der Konflikt inzwischen die Zusammenarbeit im Teamteaching belastet. Für die Klasse entsteht dadurch zu wenig Stabilität: Regeln, Abläufe und Interventionen wirken uneinheitlich.`;

const SUPERVISION_QUESTION = "Wie kann das Team ein gemeinsames, verlässliches Vorgehen für die Klasse entwickeln, ohne dass der Konflikt zwischen den Lehrkräften weiter eskaliert?";

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
  const groupIdEls = document.querySelectorAll("[data-group-id]");
  if (groupIdEls.length) {
    const gid = getGroupId();
    groupIdEls.forEach(el => { el.textContent = gid; });
    const footer = document.querySelector("footer");
    if (footer) {
      footer.classList.add("group-id-footer");
      document.body.classList.add("has-group-id-footer");
    }
  }
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
    {id:"beobachtung", label:"Fasse deine Beobachtung kurz zusammen.", hint:"Was hast du im Teamteaching und im Umgang mit der Klasse wahrgenommen?"},
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
          <li>Lege Gesprächsregeln fest: ausreden lassen, Ich-Aussagen, konkrete Beobachtungen, keine vorschnellen Diagnosen über einzelne Schüler*innen.</li>
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
        <p class="notice"><strong>Beispiel:</strong> „Wir entwickeln eine verbindliche Absprache zum Umgang mit herausfordernden Situationen und klären, wie Lehrkraft A und B im Teamteaching vor der Klasse geschlossen handeln.“</p>
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

/* FINAL OVERRIDE: Schriftgröße, freie Elementpositionierung, getrennte Mustersteuerung */
(function(){
  function lsGet(key, fallback) {
    try {
      if (typeof loadObj === 'function') return loadObj(key, fallback);
      const raw = localStorage.getItem('sv_' + key) || localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) { return fallback; }
  }
  function lsSave(key, value) {
    try {
      if (typeof saveObj === 'function') saveObj(key, value);
      else localStorage.setItem('sv_' + key, JSON.stringify(value));
    } catch (_) {}
  }

  function getPresentationLayoutFinal() {
    const obj = lsGet('presentation_layout', {});
    return obj && typeof obj === 'object' ? obj : {};
  }
  function savePresentationLayoutFinal(obj) {
    lsSave('presentation_layout', obj && typeof obj === 'object' ? obj : {});
  }
  window.getPresentationLayoutFinal = getPresentationLayoutFinal;
  window.savePresentationLayoutFinal = savePresentationLayoutFinal;

  const OLD_GET_SETTINGS_5 = typeof getPresentationSettingsFinal === 'function' ? getPresentationSettingsFinal : null;
  getPresentationSettingsFinal = function(){
    const prior = OLD_GET_SETTINGS_5 ? OLD_GET_SETTINGS_5() : {};
    const legacyPattern = prior.pattern || 'none';
    const legacyTarget = prior.patternTarget || 'slide';
    return Object.assign({
      heading: '#1e3a5f',
      text: '#0f172a',
      background: '#0f172a',
      slide: '#ffffff',
      backgroundImage: '',
      slidePattern: legacyTarget === 'slide' ? legacyPattern : 'none',
      backgroundPattern: legacyTarget === 'background' ? legacyPattern : 'none',
      slidePatternColor: prior.patternColor || '#e5e7eb',
      backgroundPatternColor: prior.patternColor || '#1f2937'
    }, prior || {});
  };

  const OLD_APPLY_THEME_5 = typeof applyPresentationThemeToNodeFinal === 'function' ? applyPresentationThemeToNodeFinal : null;
  applyPresentationThemeToNodeFinal = function(host, settings){
    const s = Object.assign({}, getPresentationSettingsFinal(), settings || {});
    if (OLD_APPLY_THEME_5) OLD_APPLY_THEME_5(host, s);
    if (!host) return;
    host.style.setProperty('--presentation-heading-color', s.heading || '#1e3a5f');
    host.style.setProperty('--presentation-text-color', s.text || '#0f172a');
    host.style.setProperty('--presentation-background-color', s.background || '#0f172a');
    host.style.setProperty('--presentation-slide-color', s.slide || '#ffffff');
    host.style.setProperty('--presentation-background-image', s.backgroundImage ? `url("${s.backgroundImage}")` : 'none');
    if (host.classList && host.classList.contains('presentation-slide')) {
      host.dataset.presentationPattern = s.slidePattern || 'none';
      host.style.setProperty('--presentation-pattern-color', s.slidePatternColor || '#e5e7eb');
    } else if (host.classList && (host.classList.contains('presentation-prep-stage') || host.classList.contains('presentation-body')) || host === document.body) {
      host.dataset.presentationPattern = s.backgroundPattern || 'none';
      host.style.setProperty('--presentation-pattern-color', s.backgroundPatternColor || '#1f2937');
      if (host.style) host.style.background = s.background || '#0f172a';
    }
    if (host.classList && (host.classList.contains('presentation-prep-stage') || host.classList.contains('presentation-body'))) {
      host.classList.toggle('has-presentation-bg-image', !!s.backgroundImage);
    }
  };

  function getCurrentSlideInner() {
    const modal = document.getElementById('presentationPrepModal');
    return modal ? modal.querySelector('#summaryPresentationSlide .presentation-slide-inner') : null;
  }

  function applyFontSizeToSelectionFinal(size) {
    size = Math.max(8, Math.min(96, Number(size) || 18));
    const modal = document.getElementById('presentationPrepModal');
    const sel = window.getSelection && window.getSelection();
    if (sel && sel.rangeCount && !sel.isCollapsed && modal && modal.contains(sel.anchorNode)) {
      const range = sel.getRangeAt(0);
      const span = document.createElement('span');
      span.style.fontSize = size + 'px';
      try {
        range.surroundContents(span);
      } catch (_) {
        const frag = range.extractContents();
        span.appendChild(frag);
        range.insertNode(span);
      }
      sel.removeAllRanges();
      const nr = document.createRange();
      nr.selectNodeContents(span);
      sel.addRange(nr);
      return;
    }
    const active = document.activeElement;
    if (active && modal && modal.contains(active) && active.isContentEditable) {
      active.style.fontSize = size + 'px';
    }
  }
  window.applyFontSizeToSelectionFinal = applyFontSizeToSelectionFinal;

  function addOrMoveToolbarControls(modal) {
    if (!modal) return;
    const toolbar = modal.querySelector('.presentation-prep-toolbar');
    if (!toolbar) return;

    toolbar.querySelectorAll('#themeHueRange, input[type="range"]#themeHueRange').forEach(el => el.remove());

    let saveBtn = toolbar.querySelector('#savePresentationEditsBtn');
    if (!saveBtn) {
      saveBtn = document.createElement('button');
      saveBtn.type = 'button';
      saveBtn.id = 'savePresentationEditsBtn';
      saveBtn.className = 'secondary save-presentation-button-final';
      saveBtn.textContent = 'Speichern';
      saveBtn.addEventListener('click', () => {
        if (typeof window.saveCurrentPresentationEditsFinal === 'function') window.saveCurrentPresentationEditsFinal();
        persistPresentationLayoutFromDomFinal();
        renderSummaryPresentationSlideFinal(false);
        saveBtn.textContent = 'Gespeichert';
        setTimeout(() => { saveBtn.textContent = 'Speichern'; }, 1100);
      });
    }
    toolbar.prepend(saveBtn);

    const closeBtn = toolbar.querySelector('#closePresentationPrep');
    if (closeBtn) toolbar.appendChild(closeBtn);

    if (!toolbar.querySelector('#presentationFontSizeInput')) {
      const wrap = document.createElement('label');
      wrap.className = 'font-size-control';
      wrap.innerHTML = `Schriftgröße <input id="presentationFontSizeInput" class="font-size-input" type="number" min="8" max="96" step="1" value="18"> <button type="button" id="applyFontSizeBtn" class="secondary">Anwenden</button>`;
      const addText = toolbar.querySelector('#addPresentationText');
      (addText || saveBtn).insertAdjacentElement('afterend', wrap);
      wrap.querySelector('#applyFontSizeBtn').addEventListener('click', () => {
        applyFontSizeToSelectionFinal(wrap.querySelector('#presentationFontSizeInput').value);
        if (typeof window.saveCurrentPresentationEditsFinal === 'function') window.saveCurrentPresentationEditsFinal();
      });
    }

    let themeSelect = toolbar.querySelector('#themeTargetSelect');
    let color = toolbar.querySelector('#themeColorPicker');
    if (themeSelect && color) {
      themeSelect.addEventListener('change', () => {
        const s = getPresentationSettingsFinal();
        color.value = s[themeSelect.value] || '#1e3a5f';
      });
      color.addEventListener('input', () => {
        savePresentationSettingsFinal({ [themeSelect.value]: color.value });
        renderSummaryPresentationSlideFinal(false);
      });
    }

    toolbar.querySelectorAll('#presentationPatternSelect, #presentationPatternTargetSelect, #presentationPatternColorPicker').forEach(el => el.remove());
    toolbar.querySelectorAll('.pattern-split-control').forEach(el => el.remove());
    const patternWrap = document.createElement('label');
    patternWrap.className = 'pattern-split-control';
    patternWrap.innerHTML = `Muster
      <select id="presentationPatternTargetSelect">
        <option value="slide">Folie</option>
        <option value="background">Hintergrund</option>
      </select>
      <select id="presentationPatternSelect">
        <option value="none">Kein Muster</option>
        <option value="dots">Punkte</option>
        <option value="grid">Raster</option>
        <option value="diagonal">Diagonal</option>
        <option value="waves">Dezente Wellen</option>
      </select>
      <input id="presentationPatternColorPicker" type="color" value="#e5e7eb" aria-label="Musterfarbe wählen">`;
    if (color) color.insertAdjacentElement('afterend', patternWrap);
    else toolbar.appendChild(patternWrap);

    const pt = patternWrap.querySelector('#presentationPatternTargetSelect');
    const ps = patternWrap.querySelector('#presentationPatternSelect');
    const pc = patternWrap.querySelector('#presentationPatternColorPicker');
    const refreshPatternFields = () => {
      const s = getPresentationSettingsFinal();
      if (pt.value === 'background') {
        ps.value = s.backgroundPattern || 'none';
        pc.value = s.backgroundPatternColor || '#1f2937';
      } else {
        ps.value = s.slidePattern || 'none';
        pc.value = s.slidePatternColor || '#e5e7eb';
      }
    };
    pt.addEventListener('change', refreshPatternFields);
    ps.addEventListener('change', () => {
      if (pt.value === 'background') savePresentationSettingsFinal({ backgroundPattern: ps.value });
      else savePresentationSettingsFinal({ slidePattern: ps.value });
      renderSummaryPresentationSlideFinal(false);
    });
    pc.addEventListener('input', () => {
      if (pt.value === 'background') savePresentationSettingsFinal({ backgroundPatternColor: pc.value });
      else savePresentationSettingsFinal({ slidePatternColor: pc.value });
      renderSummaryPresentationSlideFinal(false);
    });
    refreshPatternFields();
  }

  function elementKey(el, slideIndex) {
    if (el.dataset.layoutKey) return el.dataset.layoutKey;
    let type = 'element';
    if (el.matches('h1')) type = 'title';
    else if (el.matches('h2')) type = 'heading2';
    else if (el.matches('.presentation-subtitle')) type = 'subtitle';
    else if (el.matches('.presentation-kicker')) type = 'kicker';
    else if (el.matches('.presentation-note')) type = 'note';
    else if (el.matches('.presentation-table-wrap')) type = 'table';
    else if (el.matches('.thanks-slide')) type = 'thanks';
    const siblings = Array.from(el.parentElement ? el.parentElement.querySelectorAll('h1,h2,.presentation-subtitle,.presentation-kicker,.presentation-note,.presentation-table-wrap,.thanks-slide') : []);
    const idx = siblings.filter(x => x.matches(type === 'table' ? '.presentation-table-wrap' : type === 'title' ? 'h1' : type === 'heading2' ? 'h2' : '.' + (type === 'thanks' ? 'thanks-slide' : 'presentation-' + type))).indexOf(el);
    el.dataset.layoutKey = `s${slideIndex}_${type}_${Math.max(0, idx)}`;
    return el.dataset.layoutKey;
  }

  function applySavedLayoutToElement(el, key, parent) {
    const layout = getPresentationLayoutFinal()[key];
    if (!layout || !parent) return;
    el.style.position = 'absolute';
    el.style.left = (Number(layout.x) || 0) + '%';
    el.style.top = (Number(layout.y) || 0) + '%';
    if (layout.w) el.style.width = Math.max(6, Number(layout.w)) + '%';
    if (layout.h) el.style.minHeight = Math.max(3, Number(layout.h)) + '%';
    el.style.zIndex = String(layout.z || 5);
  }

  function absoluteFromCurrentPosition(el, parent) {
    if (!el || !parent || el.style.position === 'absolute') return;
    const pr = parent.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const x = Math.max(0, ((r.left - pr.left) / pr.width) * 100);
    const y = Math.max(0, ((r.top - pr.top) / pr.height) * 100);
    const w = Math.max(8, (r.width / pr.width) * 100);
    const h = Math.max(3, (r.height / pr.height) * 100);
    el.style.position = 'absolute';
    el.style.left = x + '%';
    el.style.top = y + '%';
    el.style.width = w + '%';
    el.style.minHeight = h + '%';
    el.style.zIndex = '8';
  }

  function persistElementLayout(el, parent) {
    if (!el || !parent || !el.dataset.layoutKey) return;
    const layout = getPresentationLayoutFinal();
    layout[el.dataset.layoutKey] = {
      x: parseFloat(el.style.left) || 0,
      y: parseFloat(el.style.top) || 0,
      w: Math.max(6, (el.offsetWidth / parent.clientWidth) * 100),
      h: Math.max(3, (el.offsetHeight / parent.clientHeight) * 100),
      z: parseInt(el.style.zIndex || '8', 10)
    };
    savePresentationLayoutFinal(layout);
  }

  function addElementHandles(el, parent) {
    if (!el || !parent || el.dataset.freeHandles === 'true') return;
    el.dataset.freeHandles = 'true';
    el.classList.add('free-edit-element');
    const drag = document.createElement('span');
    drag.className = 'element-drag-handle';
    drag.textContent = '↕';
    drag.title = 'Element verschieben';
    const resize = document.createElement('span');
    resize.className = 'element-resize-handle';
    resize.title = 'Elementgröße ändern';
    el.appendChild(drag);
    el.appendChild(resize);

    let mode = null, sx = 0, sy = 0, sl = 0, st = 0, sw = 0, sh = 0;
    const start = (e, nextMode) => {
      if (!summaryPresentationEditModeFinal) return;
      e.preventDefault(); e.stopPropagation();
      absoluteFromCurrentPosition(el, parent);
      mode = nextMode; sx = e.clientX; sy = e.clientY;
      sl = parseFloat(el.style.left) || 0; st = parseFloat(el.style.top) || 0;
      sw = (el.offsetWidth / parent.clientWidth) * 100;
      sh = (el.offsetHeight / parent.clientHeight) * 100;
      el.setPointerCapture && el.setPointerCapture(e.pointerId);
    };
    drag.addEventListener('pointerdown', e => start(e, 'move'));
    resize.addEventListener('pointerdown', e => start(e, 'resize'));
    el.addEventListener('pointermove', e => {
      if (!mode) return;
      const dx = ((e.clientX - sx) / parent.clientWidth) * 100;
      const dy = ((e.clientY - sy) / parent.clientHeight) * 100;
      if (mode === 'move') {
        el.style.left = Math.max(0, Math.min(94, sl + dx)) + '%';
        el.style.top = Math.max(0, Math.min(94, st + dy)) + '%';
      } else {
        el.style.width = Math.max(8, Math.min(100 - sl, sw + dx)) + '%';
        el.style.minHeight = Math.max(3, sh + dy) + '%';
      }
    });
    el.addEventListener('pointerup', () => {
      if (!mode) return;
      mode = null;
      persistElementLayout(el, parent);
    });
    el.addEventListener('pointercancel', () => { mode = null; });
  }

  function enhanceFreeElementsFinal(slideHost, editable) {
    const parent = slideHost && slideHost.querySelector('.presentation-slide-inner');
    if (!parent) return;
    const slideIndex = Number(typeof summaryPresentationIndexFinal !== 'undefined' ? summaryPresentationIndexFinal : (typeof presentationIndexFinal !== 'undefined' ? presentationIndexFinal : 0));
    const elements = Array.from(parent.querySelectorAll(':scope > h1, :scope > h2, :scope > .presentation-subtitle, :scope > .presentation-kicker, :scope > .presentation-note, :scope > .presentation-table-wrap, :scope > .thanks-slide'));
    elements.forEach(el => {
      const key = elementKey(el, slideIndex);
      applySavedLayoutToElement(el, key, parent);
      if (editable) addElementHandles(el, parent);
    });
  }
  window.enhanceFreeElementsFinal = enhanceFreeElementsFinal;

  function persistPresentationLayoutFromDomFinal() {
    const inner = getCurrentSlideInner();
    if (!inner) return;
    inner.querySelectorAll('[data-layout-key]').forEach(el => persistElementLayout(el, inner));
  }
  window.persistPresentationLayoutFromDomFinal = persistPresentationLayoutFromDomFinal;

  const OLD_ENSURE_5 = typeof ensurePresentationPrepModalFinal === 'function' ? ensurePresentationPrepModalFinal : null;
  if (OLD_ENSURE_5) {
    ensurePresentationPrepModalFinal = function(){
      const modal = OLD_ENSURE_5();
      addOrMoveToolbarControls(modal);
      return modal;
    };
  }

  const OLD_RENDER_SUMMARY_5 = typeof renderSummaryPresentationSlideFinal === 'function' ? renderSummaryPresentationSlideFinal : null;
  if (OLD_RENDER_SUMMARY_5) {
    renderSummaryPresentationSlideFinal = function(updateControls = true){
      if (typeof window.saveCurrentPresentationEditsFinal === 'function' && updateControls !== false) {
        try { window.saveCurrentPresentationEditsFinal(); } catch (_) {}
      }
      OLD_RENDER_SUMMARY_5(updateControls);
      const modal = document.getElementById('presentationPrepModal');
      const slideHost = modal && modal.querySelector('#summaryPresentationSlide');
      if (!modal || !slideHost) return;
      addOrMoveToolbarControls(modal);
      const settings = getPresentationSettingsFinal();
      applyPresentationThemeToNodeFinal(modal.querySelector('.presentation-prep-stage'), settings);
      applyPresentationThemeToNodeFinal(slideHost, settings);
      enhanceFreeElementsFinal(slideHost, summaryPresentationEditModeFinal);
    };
  }

  const OLD_SAVE_EDITS_5 = window.saveCurrentPresentationEditsFinal;
  window.saveCurrentPresentationEditsFinal = function(){
    if (typeof OLD_SAVE_EDITS_5 === 'function') OLD_SAVE_EDITS_5();
    persistPresentationLayoutFromDomFinal();
  };

  const OLD_ADD_TEXT_5 = typeof addPresentationTextBoxFinal === 'function' ? addPresentationTextBoxFinal : null;
  if (OLD_ADD_TEXT_5) {
    addPresentationTextBoxFinal = function(){
      OLD_ADD_TEXT_5();
      setTimeout(() => {
        const modal = document.getElementById('presentationPrepModal');
        const slideHost = modal && modal.querySelector('#summaryPresentationSlide');
        if (slideHost) enhanceFreeElementsFinal(slideHost, summaryPresentationEditModeFinal);
      }, 0);
    };
  }

  const OLD_BUILD_PAYLOAD_5 = typeof buildPayload === 'function' ? buildPayload : null;
  if (OLD_BUILD_PAYLOAD_5) {
    buildPayload = function(){
      if (typeof window.saveCurrentPresentationEditsFinal === 'function') window.saveCurrentPresentationEditsFinal();
      const data = OLD_BUILD_PAYLOAD_5();
      data.presentationSettings = getPresentationSettingsFinal();
      data.presentationExtras = typeof getPresentationExtrasFinal === 'function' ? getPresentationExtrasFinal() : [];
      data.presentationTextOverrides = typeof getPresentationTextOverridesFinal === 'function' ? getPresentationTextOverridesFinal() : lsGet('presentation_text_overrides', {});
      data.presentationLayout = getPresentationLayoutFinal();
      return data;
    };
  }

  const OLD_MERGE_5 = typeof mergePresentationRawDataFinal === 'function' ? mergePresentationRawDataFinal : null;
  if (OLD_MERGE_5) {
    mergePresentationRawDataFinal = function(row){
      const data = OLD_MERGE_5(row);
      const raw = (row && row.data && row.data.raw) || data.raw || {};
      data.presentationLayout = raw.presentationLayout || data.presentationLayout || {};
      data.presentationSettings = raw.presentationSettings || data.presentationSettings || getPresentationSettingsFinal();
      return data;
    };
  }

  const OLD_RENDER_PRESENTATION_5 = typeof renderPresentationSlideFinal === 'function' ? renderPresentationSlideFinal : null;
  if (OLD_RENDER_PRESENTATION_5) {
    renderPresentationSlideFinal = function(){
      OLD_RENDER_PRESENTATION_5();
      const slide = document.getElementById('presentationSlide');
      if (!slide) return;
      const settings = (typeof presentationThemeFinalRuntime !== 'undefined' && presentationThemeFinalRuntime) ? presentationThemeFinalRuntime : getPresentationSettingsFinal();
      applyPresentationThemeToNodeFinal(document.body, settings);
      applyPresentationThemeToNodeFinal(slide, settings);
      const data = (typeof presentationSlidesFinal !== 'undefined' && presentationSlidesFinal[presentationIndexFinal]) ? null : null;
      // Falls Layout aus Google-Rohdaten geladen wurde, liegt es in presentationThemeFinalRuntime nicht; buildPresentationSlides injiziert es über merge. Lokal anwenden, wenn vorhanden.
      const rawLayout = (typeof window.__currentPresentationLayout === 'object') ? window.__currentPresentationLayout : getPresentationLayoutFinal();
      if (rawLayout && Object.keys(rawLayout).length) {
        const oldGet = window.getPresentationLayoutFinal;
        window.getPresentationLayoutFinal = () => rawLayout;
        enhanceFreeElementsFinal(slide, false);
        window.getPresentationLayoutFinal = oldGet || getPresentationLayoutFinal;
      } else {
        enhanceFreeElementsFinal(slide, false);
      }
    };
  }

  // Präsentationslayout aus Ergebnisrohdaten merken, wenn eine Ergebnispräsentation gebaut wird.
  const OLD_BUILD_SLIDES_5 = typeof buildPresentationSlides === 'function' ? buildPresentationSlides : null;
  if (OLD_BUILD_SLIDES_5) {
    buildPresentationSlides = function(row){
      const data = (typeof mergePresentationRawDataFinal === 'function') ? mergePresentationRawDataFinal(row) : ((row && row.data) || {});
      window.__currentPresentationLayout = data.presentationLayout || ((data.raw && data.raw.presentationLayout) || {});
      return OLD_BUILD_SLIDES_5(row);
    };
  }
})();

/* FINAL PATCH: Layout-Anwendung in Ergebnispräsentation mit korrektem Folienindex */
(function(){
  function runtimeElementKey(el, slideIndex) {
    if (el.dataset && el.dataset.layoutKey) return el.dataset.layoutKey;
    let type = 'element';
    if (el.matches('h1')) type = 'title';
    else if (el.matches('h2')) type = 'heading2';
    else if (el.matches('.presentation-subtitle')) type = 'subtitle';
    else if (el.matches('.presentation-kicker')) type = 'kicker';
    else if (el.matches('.presentation-note')) type = 'note';
    else if (el.matches('.presentation-table-wrap')) type = 'table';
    else if (el.matches('.thanks-slide')) type = 'thanks';
    const selector = type === 'title' ? 'h1' : type === 'heading2' ? 'h2' : type === 'table' ? '.presentation-table-wrap' : type === 'thanks' ? '.thanks-slide' : '.presentation-' + type;
    const same = Array.from(el.parentElement ? el.parentElement.querySelectorAll(selector) : []);
    const idx = Math.max(0, same.indexOf(el));
    const key = `s${slideIndex}_${type}_${idx}`;
    if (el.dataset) el.dataset.layoutKey = key;
    return key;
  }
  function applyLayoutMapToSlide(slideHost, slideIndex, layout) {
    const parent = slideHost && slideHost.querySelector('.presentation-slide-inner');
    if (!parent || !layout) return;
    const elements = Array.from(parent.querySelectorAll(':scope > h1, :scope > h2, :scope > .presentation-subtitle, :scope > .presentation-kicker, :scope > .presentation-note, :scope > .presentation-table-wrap, :scope > .thanks-slide'));
    elements.forEach(el => {
      const key = runtimeElementKey(el, slideIndex);
      const item = layout[key];
      if (!item) return;
      el.style.position = 'absolute';
      el.style.left = (Number(item.x) || 0) + '%';
      el.style.top = (Number(item.y) || 0) + '%';
      if (item.w) el.style.width = Math.max(6, Number(item.w)) + '%';
      if (item.h) el.style.minHeight = Math.max(3, Number(item.h)) + '%';
      el.style.zIndex = String(item.z || 8);
    });
  }
  const PREV_RENDER = typeof renderPresentationSlideFinal === 'function' ? renderPresentationSlideFinal : null;
  if (PREV_RENDER) {
    renderPresentationSlideFinal = function(){
      PREV_RENDER();
      const slide = document.getElementById('presentationSlide');
      const idx = Number(typeof presentationIndexFinal !== 'undefined' ? presentationIndexFinal : 0) || 0;
      const layout = window.__currentPresentationLayout || {};
      applyLayoutMapToSlide(slide, idx, layout);
    };
  }
})();

/* FINAL PATCH: stabiler Bearbeitungsmodus, Sticker, Auswahl/Löschen/Drehen */
(function(){
  const STICKER_FILES = [
    'team4.png','team2.png','team3.png','brainstorm.png','team2reading.png','team3working.png','notices.png','worktogether.png','worktogether3.png'
  ];
  const STICKER_PATH = 'assets/stickers/';
  const LAYOUT_KEY = 'presentation_layout_stable_v2';
  const STICKER_KEY = 'presentation_stickers_v1';
  let selectedEditElement = null;

  function getStoredObj(key, fallback){
    try {
      if (typeof loadObj === 'function') return loadObj(key, fallback);
      const raw = localStorage.getItem('sv_' + key) || localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch(_) { return fallback; }
  }
  function saveStoredObj(key, value){
    try {
      if (typeof saveObj === 'function') saveObj(key, value);
      else localStorage.setItem('sv_' + key, JSON.stringify(value));
    } catch(_) {}
  }
  function getStableLayout(){
    const obj = getStoredObj(LAYOUT_KEY, {});
    return obj && typeof obj === 'object' ? obj : {};
  }
  function saveStableLayout(obj){ saveStoredObj(LAYOUT_KEY, obj && typeof obj === 'object' ? obj : {}); }
  function getStickers(){
    const arr = getStoredObj(STICKER_KEY, []);
    return Array.isArray(arr) ? arr : [];
  }
  function saveStickers(arr){ saveStoredObj(STICKER_KEY, Array.isArray(arr) ? arr : []); }
  window.getPresentationStickersFinal = getStickers;
  window.savePresentationStickersFinal = saveStickers;

  function esc(s){ return (typeof escapeHtml === 'function') ? escapeHtml(s) : String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

  function coreElements(inner){
    if (!inner) return [];
    return Array.from(inner.querySelectorAll(':scope > h1, :scope > h2, :scope > .presentation-subtitle, :scope > .presentation-kicker, :scope > .presentation-note, :scope > .presentation-table-wrap, :scope > .thanks-slide'));
  }
  function stableKeyForCore(el, slideIndex){
    let type = 'element';
    if (el.matches('h1')) type = 'title';
    else if (el.matches('h2')) type = 'heading2';
    else if (el.matches('.presentation-subtitle')) type = 'subtitle';
    else if (el.matches('.presentation-kicker')) type = 'kicker';
    else if (el.matches('.presentation-note')) type = 'note';
    else if (el.matches('.presentation-table-wrap')) type = 'table';
    else if (el.matches('.thanks-slide')) type = 'thanks';
    const selector = type === 'title' ? 'h1' : type === 'heading2' ? 'h2' : type === 'table' ? '.presentation-table-wrap' : type === 'thanks' ? '.thanks-slide' : '.presentation-' + type;
    const same = Array.from(el.parentElement ? el.parentElement.querySelectorAll(selector) : []);
    return `s${slideIndex}_${type}_${Math.max(0, same.indexOf(el))}`;
  }
  function clearPositionStyles(el){
    ['position','left','top','width','height','minHeight','zIndex','transform'].forEach(p => el.style.removeProperty(p));
    el.style.removeProperty('display');
  }
  function applyLayoutToElement(el, layout, parent){
    if (!el || !layout) return;
    if (layout.hidden) { el.style.display = 'none'; return; }
    el.style.position = 'absolute';
    el.style.left = `${Number(layout.x) || 0}%`;
    el.style.top = `${Number(layout.y) || 0}%`;
    if (layout.w) el.style.width = `${Math.max(6, Number(layout.w))}%`;
    if (layout.h) el.style.minHeight = `${Math.max(3, Number(layout.h))}%`;
    el.style.zIndex = String(layout.z || 20);
    el.style.transform = `rotate(${Number(layout.rot) || 0}deg)`;
  }
  function makeAbsoluteFromCurrent(el, parent){
    if (!el || !parent) return;
    if (el.style.position === 'absolute') return;
    const pr = parent.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const x = ((r.left - pr.left) / Math.max(1, pr.width)) * 100;
    const y = ((r.top - pr.top) / Math.max(1, pr.height)) * 100;
    const w = (r.width / Math.max(1, pr.width)) * 100;
    const h = (r.height / Math.max(1, pr.height)) * 100;
    el.style.position = 'absolute';
    el.style.left = `${Math.max(0, Math.min(96, x))}%`;
    el.style.top = `${Math.max(0, Math.min(96, y))}%`;
    el.style.width = `${Math.max(6, Math.min(100, w))}%`;
    el.style.minHeight = `${Math.max(3, h)}%`;
    el.style.zIndex = '30';
  }
  function storeCoreLayout(el, parent){
    const key = el.dataset.stableLayoutKey;
    if (!key || !parent) return;
    const map = getStableLayout();
    map[key] = Object.assign({}, map[key] || {}, {
      x: parseFloat(el.style.left) || 0,
      y: parseFloat(el.style.top) || 0,
      w: Math.max(6, (el.offsetWidth / Math.max(1, parent.clientWidth)) * 100),
      h: Math.max(3, (el.offsetHeight / Math.max(1, parent.clientHeight)) * 100),
      z: parseInt(el.style.zIndex || '30', 10),
      rot: Number((map[key] && map[key].rot) || 0)
    });
    saveStableLayout(map);
  }
  function selectElement(el){
    if (selectedEditElement && selectedEditElement.classList) selectedEditElement.classList.remove('is-selected-edit-element');
    selectedEditElement = el || null;
    if (selectedEditElement && selectedEditElement.classList) selectedEditElement.classList.add('is-selected-edit-element');
  }

  function removeOldHandles(el){
    el.querySelectorAll('.element-drag-handle,.element-resize-handle,.presentation-stable-handle').forEach(h => h.remove());
  }
  function addStableHandles(el, parent, kind){
    if (!el || !parent || el.dataset.stableHandles === 'true') return;
    el.dataset.stableHandles = 'true';
    const drag = document.createElement('span');
    drag.className = 'presentation-stable-handle presentation-stable-drag';
    drag.textContent = '↕';
    drag.title = 'Verschieben';
    const resize = document.createElement('span');
    resize.className = 'presentation-stable-handle presentation-stable-resize';
    resize.title = 'Größe ändern';
    el.appendChild(drag); el.appendChild(resize);

    let mode = null, sx = 0, sy = 0, sl = 0, st = 0, sw = 0, sh = 0;
    function start(e, m){
      if (!summaryPresentationEditModeFinal) return;
      e.preventDefault(); e.stopPropagation();
      makeAbsoluteFromCurrent(el, parent);
      selectElement(el);
      mode = m; sx = e.clientX; sy = e.clientY;
      sl = parseFloat(el.style.left) || 0; st = parseFloat(el.style.top) || 0;
      sw = Math.max(6, (el.offsetWidth / Math.max(1, parent.clientWidth)) * 100);
      sh = Math.max(3, (el.offsetHeight / Math.max(1, parent.clientHeight)) * 100);
      try { el.setPointerCapture(e.pointerId); } catch(_) {}
    }
    function move(e){
      if (!mode) return;
      e.preventDefault(); e.stopPropagation();
      const dx = ((e.clientX - sx) / Math.max(1, parent.clientWidth)) * 100;
      const dy = ((e.clientY - sy) / Math.max(1, parent.clientHeight)) * 100;
      if (mode === 'move') {
        el.style.left = `${Math.max(0, Math.min(96, sl + dx))}%`;
        el.style.top = `${Math.max(0, Math.min(96, st + dy))}%`;
      } else {
        el.style.width = `${Math.max(6, Math.min(100 - sl, sw + dx))}%`;
        el.style.minHeight = `${Math.max(3, sh + dy)}%`;
        if (kind === 'sticker') el.style.height = `${Math.max(6, sh + dy)}%`;
      }
    }
    function end(){
      if (!mode) return;
      mode = null;
      persistElement(el, parent, kind);
    }
    drag.addEventListener('pointerdown', e => start(e, 'move'));
    resize.addEventListener('pointerdown', e => start(e, 'resize'));
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('click', e => { if (summaryPresentationEditModeFinal) { e.stopPropagation(); selectElement(el); } });
  }
  function persistElement(el, parent, kind){
    if (kind === 'sticker') {
      const idx = Number(el.dataset.stickerGlobalIndex);
      const arr = getStickers();
      if (Number.isFinite(idx) && arr[idx]) {
        arr[idx].x = parseFloat(el.style.left) || arr[idx].x || 8;
        arr[idx].y = parseFloat(el.style.top) || arr[idx].y || 8;
        arr[idx].w = Math.max(6, (el.offsetWidth / Math.max(1, parent.clientWidth)) * 100);
        arr[idx].h = Math.max(6, (el.offsetHeight / Math.max(1, parent.clientHeight)) * 100);
        arr[idx].rot = Number(arr[idx].rot || 0);
        saveStickers(arr);
      }
      return;
    }
    if (kind === 'extra') {
      const idx = Number(el.dataset.extraGlobalIndex);
      const arr = typeof getPresentationExtrasFinal === 'function' ? getPresentationExtrasFinal() : [];
      if (Number.isFinite(idx) && arr[idx]) {
        arr[idx].text = el.innerText.trim();
        arr[idx].x = parseFloat(el.style.left) || arr[idx].x || 10;
        arr[idx].y = parseFloat(el.style.top) || arr[idx].y || 72;
        arr[idx].w = Math.max(6, (el.offsetWidth / Math.max(1, parent.clientWidth)) * 100);
        arr[idx].h = Math.max(3, (el.offsetHeight / Math.max(1, parent.clientHeight)) * 100);
        arr[idx].rot = Number(arr[idx].rot || 0);
        if (typeof savePresentationExtrasFinal === 'function') savePresentationExtrasFinal(arr);
      }
      return;
    }
    storeCoreLayout(el, parent);
  }

  function addStickerLayer(inner, slideIndex, editable){
    if (!inner) return;
    inner.querySelectorAll('.presentation-stickers-layer').forEach(x => x.remove());
    const items = getStickers().map((x, i) => Object.assign({}, x, { _globalIndex: i })).filter(x => Number(x.slide) === Number(slideIndex));
    if (!items.length) return;
    const layer = document.createElement('div');
    layer.className = 'presentation-stickers-layer';
    items.forEach(st => {
      const box = document.createElement('div');
      box.className = 'prep-sticker';
      box.dataset.stickerGlobalIndex = String(st._globalIndex);
      box.style.left = `${Number(st.x) || 60}%`;
      box.style.top = `${Number(st.y) || 12}%`;
      box.style.width = `${Number(st.w) || 20}%`;
      box.style.height = `${Number(st.h) || 20}%`;
      box.style.transform = `rotate(${Number(st.rot) || 0}deg)`;
      box.style.zIndex = String(st.z || 46);
      box.innerHTML = `<img src="${esc(st.src)}" alt="Sticker">`;
      layer.appendChild(box);
    });
    inner.appendChild(layer);
    if (editable) {
      layer.querySelectorAll('.prep-sticker').forEach(el => addStableHandles(el, inner, 'sticker'));
    }
  }

  function stabilizeAfterRender(){
    const modal = document.getElementById('presentationPrepModal');
    const slideHost = modal && modal.querySelector('#summaryPresentationSlide');
    const inner = slideHost && slideHost.querySelector('.presentation-slide-inner');
    if (!modal || !slideHost || !inner) return;
    const idx = Number(summaryPresentationIndexFinal) || 0;
    const editing = !!summaryPresentationEditModeFinal;
    slideHost.classList.toggle('is-editing-presentation', editing);

    const stableMap = getStableLayout();
    coreElements(inner).forEach(el => {
      removeOldHandles(el);
      el.dataset.stableHandles = '';
      const key = stableKeyForCore(el, idx);
      el.dataset.stableLayoutKey = key;
      el.classList.add('stable-edit-element');
      const saved = stableMap[key];
      if (saved) applyLayoutToElement(el, saved, inner);
      else clearPositionStyles(el); // verhindert alte Top-Left-Layouts beim Aktivieren des Bearbeitungsmodus
      if (editing) addStableHandles(el, inner, 'core');
      if (editing && (el.matches('h1,h2,.presentation-subtitle,.presentation-kicker,.presentation-note,.thanks-slide'))) {
        el.contentEditable = 'true';
      }
    });
    inner.querySelectorAll('.prep-extra-text').forEach(el => {
      removeOldHandles(el);
      el.dataset.stableHandles = '';
      el.style.transform = `rotate(${Number((typeof getPresentationExtrasFinal === 'function' ? (getPresentationExtrasFinal()[Number(el.dataset.extraGlobalIndex)] || {}).rot : 0) || 0)}deg)`;
      if (editing) addStableHandles(el, inner, 'extra');
    });
    addStickerLayer(inner, idx, editing);
    if (!editing) selectElement(null);
  }

  function openStickerPicker(){
    let picker = document.getElementById('presentationStickerPicker');
    if (!picker) {
      picker = document.createElement('div');
      picker.id = 'presentationStickerPicker';
      picker.className = 'presentation-sticker-picker';
      picker.hidden = true;
      picker.innerHTML = `<div class="presentation-sticker-dialog">
        <div class="presentation-sticker-dialog-head"><h2>Sticker hinzufügen</h2><button type="button" id="closeStickerPicker" class="secondary">Schließen</button></div>
        <div class="presentation-sticker-grid">${STICKER_FILES.map(f => `<button type="button" class="presentation-sticker-option" data-sticker-file="${esc(f)}"><img src="${STICKER_PATH + esc(f)}" alt="${esc(f)}"></button>`).join('')}</div>
      </div>`;
      document.body.appendChild(picker);
      picker.addEventListener('click', e => { if (e.target === picker) picker.hidden = true; });
      picker.querySelector('#closeStickerPicker').addEventListener('click', () => { picker.hidden = true; });
      picker.querySelectorAll('[data-sticker-file]').forEach(btn => btn.addEventListener('click', () => {
        const file = btn.dataset.stickerFile;
        const arr = getStickers();
        arr.push({ slide: Number(summaryPresentationIndexFinal) || 0, src: STICKER_PATH + file, x: 62, y: 14, w: 22, h: 22, rot: 0, z: 46 });
        saveStickers(arr);
        summaryPresentationEditModeFinal = true;
        picker.hidden = true;
        renderSummaryPresentationSlideFinal(false);
      }));
    }
    picker.hidden = false;
  }

  function ensureFinalToolbar(){
    const modal = document.getElementById('presentationPrepModal');
    const toolbar = modal && modal.querySelector('.presentation-prep-toolbar');
    if (!toolbar) return;
    let stickerBtn = toolbar.querySelector('#addPresentationStickerBtn');
    if (!stickerBtn) {
      stickerBtn = document.createElement('button');
      stickerBtn.type = 'button';
      stickerBtn.id = 'addPresentationStickerBtn';
      stickerBtn.className = 'secondary presentation-sticker-btn';
      stickerBtn.textContent = 'Sticker hinzufügen';
      const addText = toolbar.querySelector('#addPresentationText') || toolbar.firstElementChild;
      addText.insertAdjacentElement('afterend', stickerBtn);
      stickerBtn.addEventListener('click', openStickerPicker);
    }
    let deleteBtn = toolbar.querySelector('#deleteSelectedPresentationElementBtn');
    if (!deleteBtn) {
      deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.id = 'deleteSelectedPresentationElementBtn';
      deleteBtn.className = 'secondary presentation-delete-btn';
      deleteBtn.textContent = '✕ Löschen';
      stickerBtn.insertAdjacentElement('afterend', deleteBtn);
      deleteBtn.addEventListener('click', () => deleteSelectedElement());
    }
    let rotateBtn = toolbar.querySelector('#rotateSelectedPresentationElementBtn');
    if (!rotateBtn) {
      rotateBtn = document.createElement('button');
      rotateBtn.type = 'button';
      rotateBtn.id = 'rotateSelectedPresentationElementBtn';
      rotateBtn.className = 'secondary presentation-rotate-btn';
      rotateBtn.textContent = '⟳ Drehen';
      deleteBtn.insertAdjacentElement('afterend', rotateBtn);
      rotateBtn.addEventListener('click', () => rotateSelectedElement());
    }
    const save = toolbar.querySelector('#savePresentationEditsBtn') || toolbar.querySelector('#savePresentationPrepBtn');
    if (save) toolbar.prepend(save);
    const close = toolbar.querySelector('#closePresentationPrep');
    if (close) toolbar.appendChild(close);
  }

  function deleteSelectedElement(){
    if (!selectedEditElement) { alert('Bitte zuerst ein Element auf der Folie auswählen.'); return; }
    const el = selectedEditElement;
    const inner = el.closest('.presentation-slide-inner');
    if (el.classList.contains('prep-sticker')) {
      const idx = Number(el.dataset.stickerGlobalIndex);
      const arr = getStickers();
      if (Number.isFinite(idx)) { arr.splice(idx, 1); saveStickers(arr); }
    } else if (el.classList.contains('prep-extra-text')) {
      const idx = Number(el.dataset.extraGlobalIndex);
      const arr = typeof getPresentationExtrasFinal === 'function' ? getPresentationExtrasFinal() : [];
      if (Number.isFinite(idx)) { arr.splice(idx, 1); if (typeof savePresentationExtrasFinal === 'function') savePresentationExtrasFinal(arr); }
    } else if (el.dataset.stableLayoutKey) {
      const map = getStableLayout();
      map[el.dataset.stableLayoutKey] = Object.assign({}, map[el.dataset.stableLayoutKey] || {}, { hidden: true });
      saveStableLayout(map);
    }
    selectElement(null);
    renderSummaryPresentationSlideFinal(false);
  }

  function rotateSelectedElement(){
    if (!selectedEditElement) { alert('Bitte zuerst ein Element auf der Folie auswählen.'); return; }
    const el = selectedEditElement;
    if (el.classList.contains('prep-sticker')) {
      const idx = Number(el.dataset.stickerGlobalIndex);
      const arr = getStickers();
      if (Number.isFinite(idx) && arr[idx]) {
        arr[idx].rot = (Number(arr[idx].rot) || 0) + 15;
        saveStickers(arr);
      }
    } else if (el.classList.contains('prep-extra-text')) {
      const idx = Number(el.dataset.extraGlobalIndex);
      const arr = typeof getPresentationExtrasFinal === 'function' ? getPresentationExtrasFinal() : [];
      if (Number.isFinite(idx) && arr[idx]) {
        arr[idx].rot = (Number(arr[idx].rot) || 0) + 15;
        if (typeof savePresentationExtrasFinal === 'function') savePresentationExtrasFinal(arr);
      }
    } else if (el.dataset.stableLayoutKey) {
      const map = getStableLayout();
      const cur = map[el.dataset.stableLayoutKey] || {};
      map[el.dataset.stableLayoutKey] = Object.assign({}, cur, { rot: (Number(cur.rot) || 0) + 15 });
      saveStableLayout(map);
    }
    renderSummaryPresentationSlideFinal(false);
  }

  function appendStaticStickersToResult(slideHost, slideIndex, stickers){
    const inner = slideHost && slideHost.querySelector('.presentation-slide-inner');
    if (!inner) return;
    inner.querySelectorAll('.presentation-stickers-layer').forEach(x => x.remove());
    const items = (Array.isArray(stickers) ? stickers : []).filter(x => Number(x.slide) === Number(slideIndex));
    if (!items.length) return;
    const layer = document.createElement('div');
    layer.className = 'presentation-stickers-layer';
    items.forEach(st => {
      const box = document.createElement('div');
      box.className = 'prep-sticker result-sticker';
      box.style.left = `${Number(st.x) || 60}%`;
      box.style.top = `${Number(st.y) || 12}%`;
      box.style.width = `${Number(st.w) || 20}%`;
      box.style.height = `${Number(st.h) || 20}%`;
      box.style.transform = `rotate(${Number(st.rot) || 0}deg)`;
      box.style.zIndex = String(st.z || 46);
      box.innerHTML = `<img src="${esc(st.src)}" alt="Sticker">`;
      layer.appendChild(box);
    });
    inner.appendChild(layer);
  }

  function applyStableLayoutToResult(slideHost, slideIndex, layout){
    const inner = slideHost && slideHost.querySelector('.presentation-slide-inner');
    if (!inner || !layout) return;
    coreElements(inner).forEach(el => {
      const key = stableKeyForCore(el, slideIndex);
      const item = layout[key];
      if (!item) return;
      applyLayoutToElement(el, item, inner);
    });
  }

  const PREV_ENSURE_STABLE = typeof ensurePresentationPrepModalFinal === 'function' ? ensurePresentationPrepModalFinal : null;
  if (PREV_ENSURE_STABLE) {
    ensurePresentationPrepModalFinal = function(){
      const modal = PREV_ENSURE_STABLE();
      ensureFinalToolbar();
      return modal;
    };
  }

  const PREV_RENDER_STABLE = typeof renderSummaryPresentationSlideFinal === 'function' ? renderSummaryPresentationSlideFinal : null;
  if (PREV_RENDER_STABLE) {
    renderSummaryPresentationSlideFinal = function(updateControls = true){
      PREV_RENDER_STABLE(updateControls);
      ensureFinalToolbar();
      stabilizeAfterRender();
    };
  }

  const PREV_SAVE_STABLE = window.saveCurrentPresentationEditsFinal;
  window.saveCurrentPresentationEditsFinal = function(){
    if (typeof PREV_SAVE_STABLE === 'function') PREV_SAVE_STABLE();
    const modal = document.getElementById('presentationPrepModal');
    const inner = modal && modal.querySelector('#summaryPresentationSlide .presentation-slide-inner');
    if (inner) {
      inner.querySelectorAll('.stable-edit-element[data-stable-layout-key]').forEach(el => {
        if (el.style.position === 'absolute') storeCoreLayout(el, inner);
      });
    }
  };

  const PREV_BUILD_PAYLOAD_STABLE = typeof buildPayload === 'function' ? buildPayload : null;
  if (PREV_BUILD_PAYLOAD_STABLE) {
    buildPayload = function(){
      if (window.saveCurrentPresentationEditsFinal) window.saveCurrentPresentationEditsFinal();
      const data = PREV_BUILD_PAYLOAD_STABLE();
      data.presentationStickers = getStickers();
      data.presentationStableLayout = getStableLayout();
      return data;
    };
  }

  const PREV_BUILD_SLIDES_STABLE = typeof buildPresentationSlides === 'function' ? buildPresentationSlides : null;
  if (PREV_BUILD_SLIDES_STABLE) {
    buildPresentationSlides = function(row){
      const data = (typeof mergePresentationRawDataFinal === 'function') ? mergePresentationRawDataFinal(row) : ((row && row.data) || {});
      const raw = (data && data.raw) || (row && row.data && row.data.raw) || {};
      window.__resultPresentationStickersStable = data.presentationStickers || raw.presentationStickers || [];
      window.__resultPresentationStableLayout = data.presentationStableLayout || raw.presentationStableLayout || {};
      return PREV_BUILD_SLIDES_STABLE(row);
    };
  }

  const PREV_RENDER_PRESENTATION_STABLE = typeof renderPresentationSlideFinal === 'function' ? renderPresentationSlideFinal : null;
  if (PREV_RENDER_PRESENTATION_STABLE) {
    renderPresentationSlideFinal = function(){
      PREV_RENDER_PRESENTATION_STABLE();
      const slide = document.getElementById('presentationSlide');
      const idx = Number(typeof presentationIndexFinal !== 'undefined' ? presentationIndexFinal : 0) || 0;
      applyStableLayoutToResult(slide, idx, window.__resultPresentationStableLayout || {});
      appendStaticStickersToResult(slide, idx, window.__resultPresentationStickersStable || []);
    };
  }

  // Alte lokale Layoutdaten werden bewusst nicht übernommen, damit beim Aktivieren des Bearbeitungsmodus nichts an den linken oberen Rand springt.
})();

/* FINAL PATCH: Präsentationsbearbeitung zurücksetzen */
(function(){
  const PRESENTATION_RESET_KEYS = [
    'presentation_settings',
    'presentation_extras',
    'presentation_text_overrides',
    'presentation_layout',
    'presentation_layout_stable_v2',
    'presentation_stickers_v1'
  ];

  function removeScopedPresentationKey(name) {
    try {
      if (typeof key === 'function') localStorage.removeItem(key(name));
      localStorage.removeItem('sv_' + name);
      localStorage.removeItem(name);
    } catch (_) {}
  }

  function resetPresentationToDefaultsFinal() {
    const ok = confirm('Präsentation wirklich auf Standardeinstellungen zurücksetzen?\n\nFarben, Muster, Hintergrundbild, Sticker, zusätzliche Textfelder, Verschiebungen, Drehungen und geänderte Überschriften/Beschreibungen werden zurückgesetzt. Die inhaltlichen Supervisionsdaten bleiben erhalten.');
    if (!ok) return;

    PRESENTATION_RESET_KEYS.forEach(removeScopedPresentationKey);

    // Kompatibilität mit älteren Zwischenständen, falls einzelne Werte ohne Gruppenschlüssel gespeichert wurden.
    try {
      Object.keys(localStorage).forEach(k => {
        if (/presentation_(settings|extras|text_overrides|layout|layout_stable_v2|stickers_v1)$/i.test(k)) {
          if (!k.includes('_sup_') && !k.includes('_phase')) localStorage.removeItem(k);
        }
      });
    } catch (_) {}

    try { window.__currentPresentationLayout = {}; } catch (_) {}
    try { window.__resultPresentationStableLayout = {}; } catch (_) {}
    try { window.__resultPresentationStickersStable = []; } catch (_) {}

    if (typeof summaryPresentationEditModeFinal !== 'undefined') summaryPresentationEditModeFinal = true;
    if (typeof renderSummaryPresentationSlideFinal === 'function') renderSummaryPresentationSlideFinal(false);

    const modal = document.getElementById('presentationPrepModal');
    const btn = modal && modal.querySelector('#resetPresentationDefaultsBtn');
    if (btn) {
      const old = btn.textContent;
      btn.textContent = 'Zurückgesetzt';
      setTimeout(() => { btn.textContent = old; }, 1200);
    }
  }

  function ensurePresentationResetButtonFinal() {
    const modal = document.getElementById('presentationPrepModal');
    const toolbar = modal && modal.querySelector('.presentation-prep-toolbar');
    if (!toolbar) return;

    let btn = toolbar.querySelector('#resetPresentationDefaultsBtn');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'resetPresentationDefaultsBtn';
      btn.className = 'secondary presentation-reset-defaults-btn';
      btn.textContent = 'Zurücksetzen';
      btn.title = 'Präsentation auf Standardeinstellungen zurücksetzen';
      btn.addEventListener('click', resetPresentationToDefaultsFinal);
      const close = toolbar.querySelector('#closePresentationPrep');
      if (close) close.insertAdjacentElement('beforebegin', btn);
      else toolbar.appendChild(btn);
    }

    const editing = (typeof summaryPresentationEditModeFinal !== 'undefined') ? !!summaryPresentationEditModeFinal : false;
    btn.hidden = !editing;
    btn.style.display = editing ? 'inline-flex' : 'none';

    const close = toolbar.querySelector('#closePresentationPrep');
    if (close) toolbar.appendChild(close);
  }

  const PREV_ENSURE_RESET_PRESENTATION = typeof ensurePresentationPrepModalFinal === 'function' ? ensurePresentationPrepModalFinal : null;
  if (PREV_ENSURE_RESET_PRESENTATION) {
    ensurePresentationPrepModalFinal = function(){
      const modal = PREV_ENSURE_RESET_PRESENTATION();
      ensurePresentationResetButtonFinal();
      return modal;
    };
  }

  const PREV_RENDER_RESET_PRESENTATION = typeof renderSummaryPresentationSlideFinal === 'function' ? renderSummaryPresentationSlideFinal : null;
  if (PREV_RENDER_RESET_PRESENTATION) {
    renderSummaryPresentationSlideFinal = function(updateControls = true){
      PREV_RENDER_RESET_PRESENTATION(updateControls);
      ensurePresentationResetButtonFinal();
    };
  }
})();

/* FINAL EDITOR REBUILD 2: Transaktionaler Präsentationseditor mit stabiler Toolbar */
(function(){
  const SETTINGS_KEY = 'presentation_settings';
  const EXTRAS_KEY = 'presentation_extras';
  const STICKERS_KEY = 'presentation_stickers_v1';
  const LAYOUT_KEY = 'presentation_layout_stable_v2';
  const TEXT_OVERRIDES_KEY = 'presentation_text_overrides';
  const SAVE_KEYS = [
    'sup_p2_sl_probleme','sup_p2_sl_gefuehle','sup_p2_sl_wuensche',
    'sup_p2_a_probleme','sup_p2_a_gefuehle','sup_p2_a_wuensche',
    'sup_p2_b_probleme','sup_p2_b_gefuehle','sup_p2_b_wuensche',
    'sup_p3_ziel_sl','sup_p3_ziel_a','sup_p3_ziel_b','sup_p3_gemeinsamkeiten','sup_p3_gemeinsames_ziel',
    'sup_p4_kritik','sup_p4_absprachen','sup_p5_zustimmung','sup_p6_praxistauglichkeit','sup_p6_unterstuetzung','sup_p6_umsetzung',
    'summary_group_name'
  ];
  const THEME_DEFAULT = {
    heading: '#1e3a5f',
    text: '#0f172a',
    background: '#0f172a',
    slide: '#ffffff',
    slidePattern: 'none',
    slidePatternColor: '#e5e7eb',
    backgroundPattern: 'none',
    backgroundPatternColor: '#1f2937',
    backgroundImage: ''
  };
  const STICKER_FILES = ['team4.png','team2.png','team3.png','brainstorm.png','team2reading.png','team3working.png','notices.png','worktogether.png','worktogether3.png'];
  const STICKER_PATH = 'assets/stickers/';

  let draft = null;
  let baseSnapshot = null;
  let isDirty = false;
  let editMode = false;
  let slideIndex = 0;
  let selectedElement = null;
  let dragState = null;

  function clone(v){ return JSON.parse(JSON.stringify(v || {})); }
  function esc(s){ return (typeof escapeHtml === 'function') ? escapeHtml(s) : String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
  function loadScopedObj(name, fallback){ try { return (typeof loadObj === 'function') ? loadObj(name, fallback) : JSON.parse(localStorage.getItem(name) || 'null') || fallback; } catch(_) { return fallback; } }
  function saveScopedObj(name, obj){ try { if (typeof saveObj === 'function') saveObj(name, obj); else localStorage.setItem(name, JSON.stringify(obj)); } catch(_){} }
  function loadScopedText(name){ try { return (typeof loadText === 'function') ? loadText(name) : (localStorage.getItem(name) || ''); } catch(_) { return ''; } }
  function saveScopedText(name, value){ try { if (typeof saveText === 'function') saveText(name, value || ''); else localStorage.setItem(name, value || ''); } catch(_){} }
  function snapshotFromStorage(){
    const values = {};
    SAVE_KEYS.forEach(k => values[k] = loadScopedText(k));
    return {
      settings: Object.assign({}, THEME_DEFAULT, loadScopedObj(SETTINGS_KEY, {})),
      extras: loadScopedObj(EXTRAS_KEY, []),
      stickers: loadScopedObj(STICKERS_KEY, []),
      layout: loadScopedObj(LAYOUT_KEY, {}),
      textOverrides: loadScopedObj(TEXT_OVERRIDES_KEY, {}),
      values
    };
  }
  function markDirty(){ isDirty = true; updateDirtyBadge(); }
  function updateDirtyBadge(){
    const modal = document.getElementById('presentationPrepModal');
    if (!modal) return;
    const save = modal.querySelector('#savePresentationPrepBtn');
    if (save) save.textContent = isDirty ? 'Speichern *' : 'Speichern';
  }
  function commitDraft(){
    if (!draft) return;
    saveScopedObj(SETTINGS_KEY, draft.settings || {});
    saveScopedObj(EXTRAS_KEY, Array.isArray(draft.extras) ? draft.extras : []);
    saveScopedObj(STICKERS_KEY, Array.isArray(draft.stickers) ? draft.stickers : []);
    saveScopedObj(LAYOUT_KEY, draft.layout || {});
    saveScopedObj(TEXT_OVERRIDES_KEY, draft.textOverrides || {});
    Object.entries(draft.values || {}).forEach(([k,v]) => saveScopedText(k, v || ''));
    baseSnapshot = clone(draft);
    isDirty = false;
    updateDirtyBadge();
    if (typeof renderSummary === 'function' && typeof collectSupervisorData === 'function') renderSummary(collectSupervisorData());
  }

  // Öffentliche Getter geben immer gespeicherte Daten zurück; während des Bearbeitens wird erst mit Speichern geschrieben.
  window.getPresentationSettingsFinal = function(){ return Object.assign({}, THEME_DEFAULT, loadScopedObj(SETTINGS_KEY, {})); };
  window.savePresentationSettingsFinal = function(settings){ saveScopedObj(SETTINGS_KEY, Object.assign({}, window.getPresentationSettingsFinal(), settings || {})); };
  window.getPresentationExtrasFinal = function(){ const x = loadScopedObj(EXTRAS_KEY, []); return Array.isArray(x) ? x : []; };
  window.savePresentationExtrasFinal = function(x){ saveScopedObj(EXTRAS_KEY, Array.isArray(x) ? x : []); };
  window.getPresentationStickersFinal = function(){ const x = loadScopedObj(STICKERS_KEY, []); return Array.isArray(x) ? x : []; };
  window.savePresentationStickersFinal = function(x){ saveScopedObj(STICKERS_KEY, Array.isArray(x) ? x : []); };
  window.getPresentationTextOverridesFinal = function(){ const x = loadScopedObj(TEXT_OVERRIDES_KEY, {}); return x && typeof x === 'object' ? x : {}; };

  function patternCss(kind, color){
    const c = color || '#e5e7eb';
    if (kind === 'dots') return {img:`radial-gradient(${c} 1.3px, transparent 1.3px)`, size:'18px 18px'};
    if (kind === 'grid') return {img:`linear-gradient(${c} 1px, transparent 1px), linear-gradient(90deg, ${c} 1px, transparent 1px)`, size:'28px 28px'};
    if (kind === 'diagonal') return {img:`repeating-linear-gradient(135deg, transparent 0 12px, ${c} 12px 14px)`, size:'24px 24px'};
    if (kind === 'waves') return {img:`radial-gradient(ellipse at top, ${c} 0 16%, transparent 17%), radial-gradient(ellipse at bottom, ${c} 0 14%, transparent 15%)`, size:'70px 34px'};
    return {img:'none', size:'24px 24px'};
  }
  window.applyPresentationThemeToNodeFinal = function(host, settings){
    const s = Object.assign({}, THEME_DEFAULT, settings || {});
    if (!host) return;
    host.style.setProperty('--presentation-heading-color', s.heading);
    host.style.setProperty('--presentation-text-color', s.text);
    host.style.setProperty('--presentation-background-color', s.background);
    host.style.setProperty('--presentation-slide-color', s.slide);
    host.style.setProperty('--presentation-background-image', s.backgroundImage ? `url("${s.backgroundImage}")` : 'none');
    const sp = patternCss(s.slidePattern || 'none', s.slidePatternColor || '#e5e7eb');
    const bp = patternCss(s.backgroundPattern || 'none', s.backgroundPatternColor || '#1f2937');
    host.style.setProperty('--slide-pattern-image', sp.img);
    host.style.setProperty('--slide-pattern-size', sp.size);
    host.style.setProperty('--background-pattern-image', bp.img);
    host.style.setProperty('--background-pattern-size', bp.size);
    if (host.classList.contains('presentation-body') || host.classList.contains('presentation-prep-stage')) {
      host.style.backgroundColor = s.background;
      if (s.backgroundImage) host.classList.add('has-presentation-bg-image'); else host.classList.remove('has-presentation-bg-image');
    }
    if (host.classList.contains('presentation-slide')) host.style.backgroundColor = s.slide;
  };

  function ensurePresentationPrepModalFinalRebuilt(){
    let old = document.getElementById('presentationPrepModal');
    if (old && old.classList.contains('rebuilt-editor')) return old;
    if (old) old.remove();
    const modal = document.createElement('div');
    modal.id = 'presentationPrepModal';
    modal.className = 'presentation-prep-modal rebuilt-editor';
    modal.hidden = true;
    modal.innerHTML = `
      <div class="presentation-prep-backdrop"></div>
      <div class="presentation-prep-window" role="dialog" aria-modal="true" aria-label="Präsentation vorbereiten">
        <div class="presentation-prep-toolbar">
          <button type="button" id="savePresentationPrepBtn" class="save-presentation-button-final">Speichern</button>
          <button type="button" id="summaryPrevSlide" class="soft-action">←</button>
          <span id="summaryPresentationCounter" class="small">1 / 6</span>
          <button type="button" id="summaryNextSlide" class="soft-action">→</button>
          <button type="button" id="togglePresentationEdit" class="soft-action">Bearbeitungsmodus</button>
          <button type="button" id="addPresentationText" class="soft-action">Text hinzufügen</button>
          <button type="button" id="addPresentationStickerBtn" class="soft-action">Sticker hinzufügen</button>
          <label>Farbe <select id="themeTargetSelect"><option value="heading">Überschrift</option><option value="text">Text</option><option value="background">Hintergrund</option><option value="slide">Folie</option></select></label>
          <input id="themeColorPicker" type="color" value="#1e3a5f" aria-label="Farbe wählen">
          <label>Muster <select id="patternTargetSelect"><option value="slide">Folie</option><option value="background">Hintergrund</option></select></label>
          <select id="patternSelect"><option value="none">Kein Muster</option><option value="dots">Punkte</option><option value="grid">Raster</option><option value="diagonal">Diagonal</option><option value="waves">Dezente Wellen</option></select>
          <input id="patternColorPicker" type="color" value="#e5e7eb" aria-label="Musterfarbe wählen">
          <input id="presentationBgImageInput" type="file" accept="image/*" hidden>
          <button type="button" id="presentationBgImageBtn" class="soft-action">Hintergrundbild</button>
          <button type="button" id="removePresentationBgImage" class="soft-action">Bild entfernen</button>
          <button type="button" id="resetPresentationDefaultsBtn" class="soft-action">Zurücksetzen</button>
          <button type="button" id="closePresentationPrep" class="soft-action">Schließen</button>
        </div>
        <div id="presentationContextToolbar" class="context-toolbar">
          <button type="button" id="deleteSelectedPresentationElement" class="danger-action">Auswahl löschen</button>
          <button type="button" id="rotateSelectedPresentationElement" class="soft-action" title="Gedrückt halten und Maus nach links/rechts bewegen">↻ Drehen</button>
          <label>Schriftgröße <input id="selectedFontSizeInput" type="number" min="8" max="96" step="1" value="22"> px</label>
          <button type="button" id="applySelectedFontSize" class="soft-action">Anwenden</button>
          <label>Textfarbe <input id="selectedTextColorInput" type="color" value="#0f172a"></label>
        </div>
        <div class="presentation-prep-stage presentation-body">
          <section id="summaryPresentationSlide" class="presentation-slide presentation-slide-mini"></section>
        </div>
        <p class="small presentation-prep-hint">Änderungen werden erst übernommen, wenn auf Speichern gedrückt wird. Beim Schließen kann gespeichert oder verworfen werden.</p>
      </div>`;
    document.body.appendChild(modal);
    bindModalControls(modal);
    return modal;
  }

  function bindModalControls(modal){
    modal.querySelector('#savePresentationPrepBtn').addEventListener('click', () => { commitDraft(); flashButton('#savePresentationPrepBtn','Gespeichert'); });
    modal.querySelector('#closePresentationPrep').addEventListener('click', closePresentationPrepModalFinalRebuilt);
    modal.querySelector('#summaryPrevSlide').addEventListener('click', () => moveSummaryPresentationFinalRebuilt(-1));
    modal.querySelector('#summaryNextSlide').addEventListener('click', () => moveSummaryPresentationFinalRebuilt(1));
    modal.querySelector('#togglePresentationEdit').addEventListener('click', () => { editMode = !editMode; renderSummaryPresentationSlideFinalRebuilt(); });
    modal.querySelector('#addPresentationText').addEventListener('click', addTextBox);
    modal.querySelector('#addPresentationStickerBtn').addEventListener('click', openStickerPicker);
    modal.querySelector('#resetPresentationDefaultsBtn').addEventListener('click', () => {
      if (!baseSnapshot) return;
      draft = clone(baseSnapshot);
      isDirty = false;
      selectedElement = null;
      renderSummaryPresentationSlideFinalRebuilt();
    });
    const target = modal.querySelector('#themeTargetSelect');
    const color = modal.querySelector('#themeColorPicker');
    target.addEventListener('change', () => { color.value = draft.settings[target.value] || THEME_DEFAULT[target.value] || '#000000'; });
    color.addEventListener('input', () => { draft.settings[target.value] = color.value; markDirty(); renderSummaryPresentationSlideFinalRebuilt(false); });
    const pTarget = modal.querySelector('#patternTargetSelect');
    const pSelect = modal.querySelector('#patternSelect');
    const pColor = modal.querySelector('#patternColorPicker');
    function syncPatternControls(){
      const t = pTarget.value;
      pSelect.value = t === 'background' ? (draft.settings.backgroundPattern || 'none') : (draft.settings.slidePattern || 'none');
      pColor.value = t === 'background' ? (draft.settings.backgroundPatternColor || '#1f2937') : (draft.settings.slidePatternColor || '#e5e7eb');
    }
    pTarget.addEventListener('change', syncPatternControls);
    pSelect.addEventListener('change', () => { const t=pTarget.value; if (t==='background') draft.settings.backgroundPattern=pSelect.value; else draft.settings.slidePattern=pSelect.value; markDirty(); renderSummaryPresentationSlideFinalRebuilt(false); });
    pColor.addEventListener('input', () => { const t=pTarget.value; if (t==='background') draft.settings.backgroundPatternColor=pColor.value; else draft.settings.slidePatternColor=pColor.value; markDirty(); renderSummaryPresentationSlideFinalRebuilt(false); });
    modal.querySelector('#presentationBgImageBtn').addEventListener('click', () => modal.querySelector('#presentationBgImageInput').click());
    modal.querySelector('#presentationBgImageInput').addEventListener('change', e => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => { draft.settings.backgroundImage = String(reader.result || ''); markDirty(); renderSummaryPresentationSlideFinalRebuilt(false); };
      reader.readAsDataURL(file);
      e.target.value = '';
    });
    modal.querySelector('#removePresentationBgImage').addEventListener('click', () => { draft.settings.backgroundImage=''; markDirty(); renderSummaryPresentationSlideFinalRebuilt(false); });
    modal.querySelector('#deleteSelectedPresentationElement').addEventListener('click', deleteSelectedElement);
    modal.querySelector('#applySelectedFontSize').addEventListener('click', () => applyStyleToSelectionOrElement('fontSize', `${Number(modal.querySelector('#selectedFontSizeInput').value)||22}px`));
    modal.querySelector('#selectedTextColorInput').addEventListener('input', e => applyStyleToSelectionOrElement('color', e.target.value));
    const rotateBtn = modal.querySelector('#rotateSelectedPresentationElement');
    rotateBtn.addEventListener('pointerdown', startToolbarRotate);
  }

  function flashButton(selector, text){
    const btn = document.querySelector(selector); if (!btn) return;
    const old = btn.textContent; btn.textContent = text; btn.classList.add('mode-active');
    setTimeout(() => { btn.textContent = old; btn.classList.remove('mode-active'); }, 900);
  }

  function openPresentationPrepModalFinalRebuilt(){
    const modal = ensurePresentationPrepModalFinalRebuilt();
    baseSnapshot = snapshotFromStorage();
    draft = clone(baseSnapshot);
    isDirty = false;
    editMode = false;
    slideIndex = 0;
    selectedElement = null;
    modal.hidden = false;
    renderSummaryPresentationSlideFinalRebuilt();
  }

  function closePresentationPrepModalFinalRebuilt(){
    const modal = document.getElementById('presentationPrepModal');
    if (!modal) return;
    if (isDirty) {
      if (confirm('Änderungen speichern, bevor die Präsentationsbearbeitung geschlossen wird?')) {
        commitDraft();
      } else {
        if (!confirm('Ohne zu speichern schließen? Nicht gespeicherte Änderungen gehen verloren.')) return;
        draft = clone(baseSnapshot);
        isDirty = false;
      }
    }
    modal.hidden = true;
    selectedElement = null;
    if (typeof renderSummary === 'function' && typeof collectSupervisorData === 'function') renderSummary(collectSupervisorData());
  }

  function moveSummaryPresentationFinalRebuilt(delta){
    persistVisibleDraftEdits();
    const slides = buildDraftSlides();
    slideIndex = Math.max(0, Math.min(slides.length - 1, slideIndex + delta));
    selectedElement = null;
    renderSummaryPresentationSlideFinalRebuilt();
  }

  function getOverride(idx, type, fallback){
    const key = `s${idx}_${type}`;
    const v = draft && draft.textOverrides ? draft.textOverrides[key] : '';
    return v !== undefined && v !== null && String(v).trim() !== '' ? String(v) : fallback;
  }

  function buildDraftSlides(){
    const row = (typeof localPresentationRowFinal === 'function') ? localPresentationRowFinal() : { data: (typeof buildPayload === 'function' ? buildPayload() : {}) };
    const slides = (typeof buildEditablePresentationSlidesFinal === 'function') ? buildEditablePresentationSlidesFinal(row) : [];
    return slides.map((s, i) => {
      const title = getOverride(i, 'title', s.title || '');
      let html = s.html || '';
      const subtitleFallbacks = [
        '',
        'Diese Folie bündelt die individuellen Sichtweisen der Beteiligten: Beobachtungen bzw. Probleme, Gefühle und Wünsche.',
        'Hier werden die Einzelziele der Beteiligten, erkennbare Gemeinsamkeiten und die gemeinsame Zielvereinbarung zusammengeführt.',
        'Hier wird festgehalten, wie hilfreiche Kritik formuliert werden kann und welche Absprachen für die weitere Zusammenarbeit getroffen wurden.',
        'Diese Folie zeigt Zustimmung, Praxistauglichkeit und erste konkrete Schritte zur Umsetzung der Vereinbarung.',
        ''
      ];
      if (i > 0 && i < 5) {
        const sub = getOverride(i, 'subtitle', subtitleFallbacks[i]);
        html = html.replace(/<p class="presentation-subtitle">[\s\S]*?<\/p>/, `<p class="presentation-subtitle">${esc(sub)}</p>`);
      }
      return { title, html };
    });
  }

  function renderSummaryPresentationSlideFinalRebuilt(updateControls = true){
    const modal = ensurePresentationPrepModalFinalRebuilt();
    if (!draft) { baseSnapshot = snapshotFromStorage(); draft = clone(baseSnapshot); }
    const slides = buildDraftSlides();
    const slideHost = modal.querySelector('#summaryPresentationSlide');
    if (!slides.length || !slideHost) return;
    slideIndex = Math.max(0, Math.min(slides.length - 1, slideIndex));
    const item = slides[slideIndex];
    const titleHtml = item.title ? `<h1 data-title-index="${slideIndex}">${esc(item.title)}</h1>` : '';
    slideHost.innerHTML = `<div class="presentation-slide-inner${item.title ? '' : ' no-title-slide'}">${titleHtml}${item.html}${renderExtrasLayer()}${renderStickersLayer()}</div>`;
    slideHost.closest('.presentation-prep-modal').classList.toggle('is-editing-active', editMode);
    applyPresentationThemeToNodeFinal(modal.querySelector('.presentation-prep-stage'), draft.settings);
    applyPresentationThemeToNodeFinal(slideHost, draft.settings);
    setupSlideInteractivity(slideHost);
    updateControlsUI(modal, updateControls);
  }

  function updateControlsUI(modal, updateControls){
    modal.querySelector('#summaryPresentationCounter').textContent = `${slideIndex + 1} / ${buildDraftSlides().length}`;
    const edit = modal.querySelector('#togglePresentationEdit');
    edit.textContent = editMode ? 'Bearbeitung aktiv' : 'Bearbeitungsmodus';
    edit.classList.toggle('mode-active', editMode);
    modal.querySelector('#themeColorPicker').value = draft.settings[modal.querySelector('#themeTargetSelect').value] || '#000000';
    const pt = modal.querySelector('#patternTargetSelect').value;
    modal.querySelector('#patternSelect').value = pt === 'background' ? (draft.settings.backgroundPattern || 'none') : (draft.settings.slidePattern || 'none');
    modal.querySelector('#patternColorPicker').value = pt === 'background' ? (draft.settings.backgroundPatternColor || '#1f2937') : (draft.settings.slidePatternColor || '#e5e7eb');
    updateContextToolbar();
    updateDirtyBadge();
  }

  function renderExtrasLayer(){
    const extras = (draft.extras || []).map((x,i) => Object.assign({}, x, {_i:i})).filter(x => Number(x.slide) === slideIndex);
    return `<div class="presentation-extras-layer">${extras.map(x => `<div class="prep-extra-text" data-extra-index="${x._i}" data-edit-id="extra_${x._i}" style="left:${Number(x.x)||10}%;top:${Number(x.y)||70}%;width:${Number(x.w)||22}%;min-height:${Number(x.h)||7}%;transform:rotate(${Number(x.rot)||0}deg);font-size:${Number(x.fontSize)||18}px;color:${x.color||''};">${esc(x.text||'')}</div>`).join('')}</div>`;
  }
  function renderStickersLayer(){
    const stickers = (draft.stickers || []).map((x,i) => Object.assign({}, x, {_i:i})).filter(x => Number(x.slide) === slideIndex);
    return `<div class="presentation-stickers-layer">${stickers.map(x => `<div class="prep-sticker" data-sticker-index="${x._i}" data-edit-id="sticker_${x._i}" style="left:${Number(x.x)||58}%;top:${Number(x.y)||52}%;width:${Number(x.w)||24}%;height:${Number(x.h)||22}%;transform:rotate(${Number(x.rot)||0}deg);"><img src="${esc(x.src||'')}" alt="Sticker"></div>`).join('')}</div>`;
  }

  function setupSlideInteractivity(host){
    const inner = host.querySelector('.presentation-slide-inner');
    if (!inner) return;
    const core = Array.from(inner.children).filter(el => !el.classList.contains('presentation-extras-layer') && !el.classList.contains('presentation-stickers-layer'));
    core.forEach((el, i) => {
      if (el.tagName === 'SCRIPT') return;
      const id = coreIdFor(el, i);
      prepareEditableElement(el, id, inner, 'core');
    });
    inner.querySelectorAll('.prep-extra-text').forEach(el => prepareEditableElement(el, el.dataset.editId, inner, 'extra'));
    inner.querySelectorAll('.prep-sticker').forEach(el => prepareEditableElement(el, el.dataset.editId, inner, 'sticker'));
    inner.querySelectorAll('[data-edit-save]').forEach(cell => {
      const k = cell.dataset.editSave;
      if (draft.values && Object.prototype.hasOwnProperty.call(draft.values, k)) cell.innerText = draft.values[k] || '—';
      cell.contentEditable = editMode ? 'true' : 'false';
      cell.classList.toggle('is-editable-cell', editMode);
      cell.addEventListener('input', () => { draft.values[k] = cell.innerText.trim() === '—' ? '' : cell.innerText.trim(); markDirty(); });
      cell.addEventListener('click', () => { if (editMode) selectEditableElement(cell.closest('.editable-slide-element') || cell); });
    });
    const h1 = inner.querySelector('h1[data-title-index]');
    if (h1) {
      h1.contentEditable = editMode ? 'true' : 'false';
      h1.addEventListener('input', () => { draft.textOverrides[`s${slideIndex}_title`] = h1.innerText.trim(); markDirty(); });
    }
    const subtitle = inner.querySelector('.presentation-subtitle');
    if (subtitle) {
      subtitle.contentEditable = editMode ? 'true' : 'false';
      subtitle.addEventListener('input', () => { draft.textOverrides[`s${slideIndex}_subtitle`] = subtitle.innerText.trim(); markDirty(); });
    }
    host.addEventListener('click', e => { if (!editMode) return; if (e.target === host || e.target === inner) selectEditableElement(null); });
  }

  function coreIdFor(el, index){
    if (el.matches('h1')) return `s${slideIndex}_title`;
    if (el.matches('h2')) return `s${slideIndex}_heading2_${index}`;
    if (el.matches('.presentation-subtitle')) return `s${slideIndex}_subtitle`;
    if (el.matches('.presentation-kicker')) return `s${slideIndex}_kicker`;
    if (el.matches('.presentation-note')) return `s${slideIndex}_note`;
    if (el.matches('.presentation-table-wrap')) return `s${slideIndex}_table_${index}`;
    if (el.matches('.thanks-slide')) return `s${slideIndex}_thanks`;
    return `s${slideIndex}_el_${index}`;
  }

  function prepareEditableElement(el, id, parent, type){
    el.classList.add('editable-slide-element');
    el.dataset.editId = id;
    el.dataset.editType = type;
    const layout = draft.layout && draft.layout[id];
    if (layout) applyLayout(el, layout);
    addElementHandles(el, parent);
    el.addEventListener('click', e => { if (!editMode) return; selectEditableElement(el); e.stopPropagation(); });
  }
  function applyLayout(el, l){
    el.style.position = 'absolute';
    el.style.left = `${Number(l.x)||0}%`;
    el.style.top = `${Number(l.y)||0}%`;
    if (l.w) el.style.width = `${Number(l.w)}%`;
    if (l.h) el.style.minHeight = `${Number(l.h)}%`;
    if (l.fontSize) el.style.fontSize = `${Number(l.fontSize)}px`;
    if (l.color) el.style.color = l.color;
    el.style.transform = `rotate(${Number(l.rot)||0}deg)`;
    el.style.zIndex = String(l.z || 40);
  }
  function ensureAbsolute(el, parent){
    if (!el || !parent || el.style.position === 'absolute') return;
    const pr = parent.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const x = ((r.left - pr.left) / Math.max(1, pr.width))*100;
    const y = ((r.top - pr.top) / Math.max(1, pr.height))*100;
    const w = (r.width / Math.max(1, pr.width))*100;
    const h = (r.height / Math.max(1, pr.height))*100;
    const l = draft.layout[el.dataset.editId] || {};
    Object.assign(l, {x:Math.max(0,x), y:Math.max(0,y), w:Math.max(6,w), h:Math.max(3,h), rot:Number(l.rot)||0, z:50});
    draft.layout[el.dataset.editId] = l;
    applyLayout(el, l);
  }
  function saveLayoutFromElement(el, parent){
    if (!el || !parent || !el.dataset.editId) return;
    const l = draft.layout[el.dataset.editId] || {};
    Object.assign(l, {
      x: parseFloat(el.style.left)||0,
      y: parseFloat(el.style.top)||0,
      w: Math.max(5, (el.offsetWidth / Math.max(1,parent.clientWidth))*100),
      h: Math.max(3, (el.offsetHeight / Math.max(1,parent.clientHeight))*100),
      rot: getRotation(el),
      z: parseInt(el.style.zIndex||'50',10)
    });
    draft.layout[el.dataset.editId] = l;
    if (el.classList.contains('prep-extra-text')) {
      const i = Number(el.dataset.extraIndex); if (draft.extras[i]) Object.assign(draft.extras[i], l, {text:el.innerText.trim()});
    }
    if (el.classList.contains('prep-sticker')) {
      const i = Number(el.dataset.stickerIndex); if (draft.stickers[i]) Object.assign(draft.stickers[i], l);
    }
    markDirty();
  }
  function getRotation(el){
    const id = el.dataset.editId;
    return Number((draft.layout[id] && draft.layout[id].rot) || 0);
  }

  function addElementHandles(el, parent){
    if (el.querySelector(':scope > .element-drag-handle')) return;
    const drag = document.createElement('span'); drag.className = 'element-drag-handle'; drag.title = 'Verschieben';
    const resize = document.createElement('span'); resize.className = 'element-resize-handle'; resize.title = 'Größe ändern';
    const rotate = document.createElement('span'); rotate.className = 'element-rotate-handle'; rotate.textContent = '↻'; rotate.title = 'Drehen';
    el.appendChild(drag); el.appendChild(resize); el.appendChild(rotate);
    drag.addEventListener('pointerdown', e => startDrag(e, el, parent));
    resize.addEventListener('pointerdown', e => startResize(e, el, parent));
    rotate.addEventListener('pointerdown', e => startRotate(e, el, parent));
  }
  function startDrag(e, el, parent){
    if (!editMode) return; e.preventDefault(); e.stopPropagation(); selectEditableElement(el); ensureAbsolute(el,parent);
    const l = draft.layout[el.dataset.editId];
    dragState = {mode:'drag', el, parent, sx:e.clientX, sy:e.clientY, x:l.x, y:l.y};
    window.addEventListener('pointermove', onPointerMove); window.addEventListener('pointerup', onPointerUp, {once:true});
  }
  function startResize(e, el, parent){
    if (!editMode) return; e.preventDefault(); e.stopPropagation(); selectEditableElement(el); ensureAbsolute(el,parent);
    const l = draft.layout[el.dataset.editId];
    dragState = {mode:'resize', el, parent, sx:e.clientX, sy:e.clientY, w:l.w||20, h:l.h||10};
    window.addEventListener('pointermove', onPointerMove); window.addEventListener('pointerup', onPointerUp, {once:true});
  }
  function startRotate(e, el, parent){
    if (!editMode) return; e.preventDefault(); e.stopPropagation(); selectEditableElement(el); ensureAbsolute(el,parent);
    const l = draft.layout[el.dataset.editId] || {};
    dragState = {mode:'rotate', el, parent, sx:e.clientX, sy:e.clientY, rot:Number(l.rot)||0};
    window.addEventListener('pointermove', onPointerMove); window.addEventListener('pointerup', onPointerUp, {once:true});
  }
  function startToolbarRotate(e){
    if (!selectedElement || !editMode) return; e.preventDefault();
    const inner = selectedElement.closest('.presentation-slide-inner'); if (!inner) return;
    ensureAbsolute(selectedElement, inner);
    const l = draft.layout[selectedElement.dataset.editId] || {};
    dragState = {mode:'rotate', el:selectedElement, parent:inner, sx:e.clientX, sy:e.clientY, rot:Number(l.rot)||0};
    window.addEventListener('pointermove', onPointerMove); window.addEventListener('pointerup', onPointerUp, {once:true});
  }
  function onPointerMove(e){
    if (!dragState) return;
    const {mode, el, parent, sx, sy} = dragState;
    const pr = parent.getBoundingClientRect();
    const dx = ((e.clientX - sx) / Math.max(1, pr.width))*100;
    const dy = ((e.clientY - sy) / Math.max(1, pr.height))*100;
    const l = draft.layout[el.dataset.editId] || {};
    if (mode === 'drag') { l.x = Math.max(-20, Math.min(120, dragState.x + dx)); l.y = Math.max(-20, Math.min(120, dragState.y + dy)); }
    if (mode === 'resize') { l.w = Math.max(5, Math.min(120, dragState.w + dx)); l.h = Math.max(3, Math.min(100, dragState.h + dy)); }
    if (mode === 'rotate') { l.rot = dragState.rot + (e.clientX - sx) * .55; }
    draft.layout[el.dataset.editId] = l; applyLayout(el,l); updateContextToolbar(); markDirty();
  }
  function onPointerUp(){ if (dragState) saveLayoutFromElement(dragState.el, dragState.parent); dragState=null; window.removeEventListener('pointermove', onPointerMove); }

  function selectEditableElement(el){
    const modal = document.getElementById('presentationPrepModal');
    if (selectedElement && selectedElement.classList) selectedElement.classList.remove('selected');
    selectedElement = el || null;
    if (selectedElement && selectedElement.classList) selectedElement.classList.add('selected');
    updateContextToolbar();
  }
  function updateContextToolbar(){
    const modal = document.getElementById('presentationPrepModal'); if (!modal) return;
    const bar = modal.querySelector('#presentationContextToolbar');
    if (!bar) return;
    bar.classList.toggle('has-selection', !!(editMode && selectedElement));
    if (!selectedElement) return;
    const fs = modal.querySelector('#selectedFontSizeInput');
    const tc = modal.querySelector('#selectedTextColorInput');
    const l = draft.layout[selectedElement.dataset.editId] || {};
    if (fs) fs.value = Math.round(Number(l.fontSize) || parseFloat(getComputedStyle(selectedElement).fontSize) || 22);
    if (tc) tc.value = rgbToHex(l.color || getComputedStyle(selectedElement).color || '#0f172a');
  }
  function rgbToHex(c){
    if (!c) return '#0f172a'; if (c.startsWith('#')) return c;
    const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/); if (!m) return '#0f172a';
    return '#' + [m[1],m[2],m[3]].map(n => Math.max(0,Math.min(255,Number(n))).toString(16).padStart(2,'0')).join('');
  }
  function applyStyleToSelectionOrElement(prop, value){
    if (!selectedElement || !editMode) return;
    const sel = window.getSelection && window.getSelection();
    if (sel && sel.rangeCount && !sel.isCollapsed && selectedElement.contains(sel.anchorNode) && selectedElement.contains(sel.focusNode)) {
      const range = sel.getRangeAt(0);
      const span = document.createElement('span'); span.style[prop] = value;
      try { range.surroundContents(span); }
      catch(_) { const frag = range.extractContents(); span.appendChild(frag); range.insertNode(span); }
      sel.removeAllRanges();
    } else {
      selectedElement.style[prop] = value;
      const id = selectedElement.dataset.editId;
      if (id) { draft.layout[id] = Object.assign({}, draft.layout[id] || {}, { [prop]: prop === 'fontSize' ? parseFloat(value) : value }); }
    }
    markDirty();
  }
  function deleteSelectedElement(){
    if (!selectedElement) return;
    const id = selectedElement.dataset.editId || '';
    if (id.startsWith('extra_')) { const i=Number(selectedElement.dataset.extraIndex); if (Number.isFinite(i)) draft.extras.splice(i,1); }
    else if (id.startsWith('sticker_')) { const i=Number(selectedElement.dataset.stickerIndex); if (Number.isFinite(i)) draft.stickers.splice(i,1); }
    else { draft.layout[id] = Object.assign({}, draft.layout[id] || {}, {hidden:true}); }
    selectedElement = null; markDirty(); renderSummaryPresentationSlideFinalRebuilt();
  }
  function addTextBox(){
    if (!editMode) { editMode = true; }
    draft.extras.push({slide:slideIndex,text:'Neuer Text',x:12,y:68,w:24,h:8,rot:0,fontSize:18,color:draft.settings.text});
    markDirty(); renderSummaryPresentationSlideFinalRebuilt();
  }
  function openStickerPicker(){
    let picker = document.getElementById('presentationStickerPickerRebuilt');
    if (!picker) {
      picker = document.createElement('div'); picker.id='presentationStickerPickerRebuilt'; picker.className='presentation-sticker-picker'; picker.hidden=true;
      picker.innerHTML = `<div class="presentation-sticker-dialog"><div class="presentation-sticker-dialog-head"><h2>Sticker hinzufügen</h2><button type="button" id="closeStickerPickerRebuilt" class="secondary">Schließen</button></div><div class="presentation-sticker-grid">${STICKER_FILES.map(f => `<button type="button" class="presentation-sticker-option" data-sticker="${esc(f)}"><img src="${STICKER_PATH+esc(f)}" alt="${esc(f)}"></button>`).join('')}</div></div>`;
      document.body.appendChild(picker);
      picker.querySelector('#closeStickerPickerRebuilt').addEventListener('click', () => { picker.hidden=true; });
      picker.querySelectorAll('[data-sticker]').forEach(btn => btn.addEventListener('click', () => {
        const f = btn.dataset.sticker;
        draft.stickers.push({slide:slideIndex, src:STICKER_PATH+f, x:58, y:48, w:24, h:22, rot:0});
        picker.hidden=true; markDirty(); renderSummaryPresentationSlideFinalRebuilt();
      }));
    }
    picker.hidden=false;
  }
  function persistVisibleDraftEdits(){
    const modal = document.getElementById('presentationPrepModal'); if (!modal || !draft) return;
    modal.querySelectorAll('[data-edit-save]').forEach(cell => { const k=cell.dataset.editSave; if(k) draft.values[k]=cell.innerText.trim()==='—'?'':cell.innerText.trim(); });
    modal.querySelectorAll('.prep-extra-text').forEach(el => { const i=Number(el.dataset.extraIndex); if (draft.extras[i]) draft.extras[i].text=el.innerText.trim(); });
    const h1 = modal.querySelector('[data-title-index]'); if (h1) draft.textOverrides[`s${slideIndex}_title`] = h1.innerText.trim();
    const sub = modal.querySelector('.presentation-subtitle'); if (sub) draft.textOverrides[`s${slideIndex}_subtitle`] = sub.innerText.trim();
  }

  // Exportiere neue Implementierung global.
  window.ensurePresentationPrepModalFinal = ensurePresentationPrepModalFinalRebuilt;
  window.openPresentationPrepModalFinal = openPresentationPrepModalFinalRebuilt;
  window.closePresentationPrepModalFinal = closePresentationPrepModalFinalRebuilt;
  window.moveSummaryPresentationFinal = moveSummaryPresentationFinalRebuilt;
  window.renderSummaryPresentationSlideFinal = renderSummaryPresentationSlideFinalRebuilt;
  window.saveCurrentPresentationEditsFinal = function(){ if (draft) { persistVisibleDraftEdits(); commitDraft(); } };

  // Buttons, die bereits durch ältere Initialisierung gebunden wurden, auf die neue Implementierung umlenken.
  document.addEventListener('click', function(e){
    const btn = e.target && e.target.closest && e.target.closest('#openPresentationPrepBtn');
    if (btn) { e.preventDefault(); e.stopImmediatePropagation(); openPresentationPrepModalFinalRebuilt(); }
  }, true);

  const OLD_BUILD_PAYLOAD_REBUILT = typeof buildPayload === 'function' ? buildPayload : null;
  buildPayload = function(){
    if (draft && isDirty) { /* bewusst nicht automatisch speichern */ }
    const data = OLD_BUILD_PAYLOAD_REBUILT ? OLD_BUILD_PAYLOAD_REBUILT() : (typeof collectSupervisorData === 'function' ? collectSupervisorData() : {});
    data.presentationSettings = window.getPresentationSettingsFinal();
    data.presentationExtras = window.getPresentationExtrasFinal();
    data.presentationTextOverrides = window.getPresentationTextOverridesFinal();
    data.presentationLayout = loadScopedObj(LAYOUT_KEY, {});
    data.presentationStickers = window.getPresentationStickersFinal();
    return data;
  };
})();

/* Bind rebuilt editor functions to global identifiers as well */
try {
  ensurePresentationPrepModalFinal = window.ensurePresentationPrepModalFinal;
  openPresentationPrepModalFinal = window.openPresentationPrepModalFinal;
  closePresentationPrepModalFinal = window.closePresentationPrepModalFinal;
  moveSummaryPresentationFinal = window.moveSummaryPresentationFinal;
  renderSummaryPresentationSlideFinal = window.renderSummaryPresentationSlideFinal;
} catch (_) {}

/* EDITOR V4: Undo, stabile Auswahl, Sticker-Resize/Move/Rotate, robuster Hintergrundbild-Import */
(function(){
  const SETTINGS_KEY = 'presentation_settings';
  const EXTRAS_KEY = 'presentation_extras';
  const STICKERS_KEY = 'presentation_stickers_v1';
  const LAYOUT_KEY = 'presentation_layout_stable_v2';
  const TEXT_KEY = 'presentation_text_overrides';
  const DEFAULT_KEY = 'presentation_default_snapshot_v4';
  const STICKER_PATH = 'assets/stickers/';
  const STICKER_FILES = ['team4.png','team2.png','team3.png','brainstorm.png','team2reading.png','team3working.png','notices.png','worktogether.png','worktogether3.png'];
  const SUPER_KEYS = [
    'sup_p2_sl_probleme','sup_p2_sl_gefuehle','sup_p2_sl_wuensche',
    'sup_p2_a_probleme','sup_p2_a_gefuehle','sup_p2_a_wuensche',
    'sup_p2_b_probleme','sup_p2_b_gefuehle','sup_p2_b_wuensche',
    'sup_p3_ziel_sl','sup_p3_ziel_a','sup_p3_ziel_b','sup_p3_gemeinsamkeiten','sup_p3_gemeinsames_ziel',
    'sup_p4_kritik','sup_p4_absprachen','sup_p5_zustimmung','sup_p6_praxistauglichkeit','sup_p6_unterstuetzung','sup_p6_umsetzung','summary_group_name'
  ];
  const THEME_DEFAULT = {heading:'#1e3a5f', text:'#0f172a', background:'#0f172a', slide:'#ffffff', slidePattern:'none', slidePatternColor:'#e5e7eb', backgroundPattern:'none', backgroundPatternColor:'#1f2937', backgroundImage:''};

  let draft = null;
  let savedAtOpen = null;
  let undoStack = [];
  let dirty = false;
  let editMode = false;
  let slideIndex = 0;
  let selectedId = null;
  let dragState = null;
  let suppressTextUndo = false;

  const clone = obj => JSON.parse(JSON.stringify(obj || {}));
  const esc = s => (typeof escapeHtml === 'function') ? escapeHtml(s) : String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function lObj(k, fb){ try { return (typeof loadObj === 'function') ? loadObj(k, fb) : (JSON.parse(localStorage.getItem(k) || 'null') || fb); } catch(_) { return fb; } }
  function sObj(k, v){ try { if (typeof saveObj === 'function') saveObj(k, v); else localStorage.setItem(k, JSON.stringify(v)); } catch(_){} }
  function lTxt(k){ try { return (typeof loadText === 'function') ? loadText(k) : (localStorage.getItem(k) || ''); } catch(_) { return ''; } }
  function sTxt(k, v){ try { if (typeof saveText === 'function') saveText(k, v || ''); else localStorage.setItem(k, v || ''); } catch(_){} }
  function snapshotStorage(){
    const values = {}; SUPER_KEYS.forEach(k => values[k] = lTxt(k));
    return {settings:Object.assign({}, THEME_DEFAULT, lObj(SETTINGS_KEY, {})), extras:arr(lObj(EXTRAS_KEY, [])), stickers:arr(lObj(STICKERS_KEY, [])), layout:lObj(LAYOUT_KEY, {}), text:lObj(TEXT_KEY, {}), values};
  }
  function saveSnapshotToStorage(snap){
    if (!snap) return;
    sObj(SETTINGS_KEY, Object.assign({}, THEME_DEFAULT, snap.settings || {}));
    sObj(EXTRAS_KEY, arr(snap.extras));
    sObj(STICKERS_KEY, arr(snap.stickers));
    sObj(LAYOUT_KEY, snap.layout || {});
    sObj(TEXT_KEY, snap.text || {});
    Object.entries(snap.values || {}).forEach(([k,v]) => sTxt(k, v || ''));
  }
  function arr(x){ return Array.isArray(x) ? x : []; }
  function markDirty(){ dirty = true; updateToolbarState(); }
  function pushUndo(){
    if (!draft) return;
    undoStack.push(clone(draft));
    if (undoStack.length > 3) undoStack.shift();
    updateToolbarState();
  }
  function undo(){
    if (!undoStack.length || !draft) return;
    draft = undoStack.pop();
    dirty = true;
    selectedId = null;
    renderSlide();
  }
  function commit(){
    if (!draft) return;
    persistDOMText();
    saveSnapshotToStorage(draft);
    savedAtOpen = clone(draft);
    dirty = false;
    undoStack = [];
    updateToolbarState();
    try { if (typeof renderSummary === 'function' && typeof collectSupervisorData === 'function') renderSummary(collectSupervisorData()); } catch(_){}
  }
  function ensureDefaultSnapshot(){
    const existing = lObj(DEFAULT_KEY, null);
    if (existing && typeof existing === 'object') return existing;
    const snap = snapshotStorage();
    sObj(DEFAULT_KEY, snap);
    return snap;
  }

  window.getPresentationSettingsFinal = () => Object.assign({}, THEME_DEFAULT, lObj(SETTINGS_KEY, {}));
  window.getPresentationExtrasFinal = () => arr(lObj(EXTRAS_KEY, []));
  window.getPresentationStickersFinal = () => arr(lObj(STICKERS_KEY, []));
  window.getPresentationTextOverridesFinal = () => lObj(TEXT_KEY, {});
  window.savePresentationSettingsFinal = settings => sObj(SETTINGS_KEY, Object.assign({}, window.getPresentationSettingsFinal(), settings || {}));
  window.savePresentationExtrasFinal = x => sObj(EXTRAS_KEY, arr(x));
  window.savePresentationStickersFinal = x => sObj(STICKERS_KEY, arr(x));

  function patternCss(kind, color){
    const c = color || '#e5e7eb';
    if (kind === 'dots') return {img:`radial-gradient(${c} 1.4px, transparent 1.4px)`, size:'18px 18px'};
    if (kind === 'grid') return {img:`linear-gradient(${c} 1px, transparent 1px), linear-gradient(90deg, ${c} 1px, transparent 1px)`, size:'28px 28px'};
    if (kind === 'diagonal') return {img:`repeating-linear-gradient(135deg, transparent 0 12px, ${c} 12px 14px)`, size:'24px 24px'};
    if (kind === 'waves') return {img:`radial-gradient(ellipse at top, ${c} 0 16%, transparent 17%), radial-gradient(ellipse at bottom, ${c} 0 14%, transparent 15%)`, size:'70px 34px'};
    return {img:'none', size:'24px 24px'};
  }
  window.applyPresentationThemeToNodeFinal = function(host, settings){
    if (!host) return;
    const s = Object.assign({}, THEME_DEFAULT, settings || {});
    host.style.setProperty('--presentation-heading-color', s.heading);
    host.style.setProperty('--presentation-text-color', s.text);
    host.style.setProperty('--presentation-background-color', s.background);
    host.style.setProperty('--presentation-slide-color', s.slide);
    host.style.setProperty('--presentation-background-image', s.backgroundImage ? `url("${s.backgroundImage}")` : 'none');
    const sp = patternCss(s.slidePattern, s.slidePatternColor);
    const bp = patternCss(s.backgroundPattern, s.backgroundPatternColor);
    host.style.setProperty('--slide-pattern-image', sp.img); host.style.setProperty('--slide-pattern-size', sp.size);
    host.style.setProperty('--background-pattern-image', bp.img); host.style.setProperty('--background-pattern-size', bp.size);
    if (host.classList && (host.classList.contains('presentation-prep-stage') || host.classList.contains('presentation-body') || host.classList.contains('v4-stage'))) {
      host.style.backgroundColor = s.background;
      if (s.backgroundImage) host.classList.add('has-presentation-bg-image'); else host.classList.remove('has-presentation-bg-image');
    }
    if (host.classList && host.classList.contains('presentation-slide')) host.style.backgroundColor = s.slide;
  };

  function ensureModal(){
    let old = document.getElementById('presentationPrepModalV4');
    if (old) return old;
    const modal = document.createElement('div');
    modal.id = 'presentationPrepModalV4';
    modal.hidden = true;
    modal.innerHTML = `
      <div class="v4-toolbar">
        <button type="button" id="v4Save" class="primary v4-edit-only" hidden>Speichern</button>
        <button type="button" id="v4Prev">←</button><span id="v4Counter" class="v4-status">1 / 6</span><button type="button" id="v4Next">→</button>
        <button type="button" id="v4EditToggle">Bearbeitungsmodus</button>
        <button type="button" id="v4Undo" class="v4-edit-only" hidden>↶ Rückgängig</button>
        <button type="button" id="v4AddText" class="v4-edit-only" hidden>Text hinzufügen</button>
        <button type="button" id="v4AddSticker" class="v4-edit-only" hidden>Sticker hinzufügen</button>
        <label class="v4-edit-only" hidden>Design <select id="v4ThemeTarget"><option value="heading">Überschrift</option><option value="text">Text</option><option value="background">Hintergrund</option><option value="slide">Folie</option></select></label>
        <input class="v4-edit-only" hidden id="v4ThemeColor" type="color" value="#1e3a5f" aria-label="Farbe wählen">
        <label class="v4-edit-only" hidden>Muster <select id="v4PatternTarget"><option value="slide">Folie</option><option value="background">Hintergrund</option></select></label>
        <select class="v4-edit-only" hidden id="v4Pattern"><option value="none">Kein Muster</option><option value="dots">Punkte</option><option value="grid">Raster</option><option value="diagonal">Diagonal</option><option value="waves">Dezente Wellen</option></select>
        <input class="v4-edit-only" hidden id="v4PatternColor" type="color" value="#e5e7eb" aria-label="Musterfarbe">
        <input id="v4BgInput" type="file" accept="image/*" hidden>
        <button type="button" id="v4BgButton" class="v4-edit-only" hidden>Hintergrundbild</button>
        <button type="button" id="v4BgRemove" class="v4-edit-only" hidden>Bild entfernen</button>
        <button type="button" id="v4Reset" class="v4-edit-only" hidden>Zurücksetzen</button>
        <span class="v4-spacer"></span>
        <button type="button" id="v4Close" class="close-right">Schließen</button>
      </div>
      <div id="v4Context" class="v4-contextbar" hidden>
        <button type="button" id="v4Delete" class="danger">Auswahl löschen</button>
        <button type="button" id="v4Rotate">↻ Drehen</button>
        <label>Schriftgröße <input id="v4FontSize" type="number" min="8" max="120" step="1" value="22"> px</label>
        <button type="button" id="v4ApplyFont">Anwenden</button>
        <label>Textfarbe <input id="v4TextColor" type="color" value="#0f172a"></label>
      </div>
      <div class="v4-stage presentation-prep-stage presentation-body"><section id="summaryPresentationSlideV4" class="presentation-slide presentation-slide-mini"></section></div>`;
    document.body.appendChild(modal);
    bindModal(modal);
    return modal;
  }
  function bindModal(modal){
    modal.querySelector('#v4Save').addEventListener('click', () => { commit(); flash('v4Save','Gespeichert'); });
    modal.querySelector('#v4Close').addEventListener('click', closeModal);
    modal.querySelector('#v4Prev').addEventListener('click', () => moveSlide(-1));
    modal.querySelector('#v4Next').addEventListener('click', () => moveSlide(1));
    modal.querySelector('#v4EditToggle').addEventListener('click', () => { editMode = !editMode; selectedId = null; renderSlide(); });
    modal.querySelector('#v4Undo').addEventListener('click', undo);
    modal.querySelector('#v4AddText').addEventListener('click', () => { if(!editMode) return; pushUndo(); draft.extras.push({slide:slideIndex,text:'Neuer Text',x:12,y:68,w:24,h:8,rot:0,fontSize:18,color:draft.settings.text}); markDirty(); renderSlide('extra_'+(draft.extras.length-1)); });
    modal.querySelector('#v4AddSticker').addEventListener('click', openStickerPicker);
    modal.querySelector('#v4Reset').addEventListener('click', () => { if(!confirm('Präsentation auf den ursprünglichen Standardstand zurücksetzen?')) return; pushUndo(); draft = clone(ensureDefaultSnapshot()); dirty = true; selectedId = null; renderSlide(); });
    const target = modal.querySelector('#v4ThemeTarget'); const color = modal.querySelector('#v4ThemeColor');
    target.addEventListener('change', () => { color.value = draft.settings[target.value] || THEME_DEFAULT[target.value] || '#000000'; });
    color.addEventListener('input', e => { pushUndoOnce('theme'); draft.settings[target.value] = e.target.value; markDirty(); renderSlide(selectedId, true); });
    const pt = modal.querySelector('#v4PatternTarget'), ps = modal.querySelector('#v4Pattern'), pc = modal.querySelector('#v4PatternColor');
    function syncPattern(){ const t=pt.value; ps.value=t==='background'?(draft.settings.backgroundPattern||'none'):(draft.settings.slidePattern||'none'); pc.value=t==='background'?(draft.settings.backgroundPatternColor||'#1f2937'):(draft.settings.slidePatternColor||'#e5e7eb'); }
    pt.addEventListener('change', syncPattern);
    ps.addEventListener('change', () => { pushUndoOnce('pattern'); if(pt.value==='background') draft.settings.backgroundPattern=ps.value; else draft.settings.slidePattern=ps.value; markDirty(); renderSlide(selectedId, true); });
    pc.addEventListener('input', e => { pushUndoOnce('patternColor'); if(pt.value==='background') draft.settings.backgroundPatternColor=e.target.value; else draft.settings.slidePatternColor=e.target.value; markDirty(); renderSlide(selectedId, true); });
    modal.querySelector('#v4BgButton').addEventListener('click', () => modal.querySelector('#v4BgInput').click());
    modal.querySelector('#v4BgInput').addEventListener('change', e => { const file=e.target.files&&e.target.files[0]; if(!file) return; pushUndo(); const reader=new FileReader(); reader.onload = () => { draft.settings.backgroundImage=String(reader.result||''); markDirty(); renderSlide(selectedId, true); }; reader.onerror = () => alert('Das Hintergrundbild konnte nicht gelesen werden.'); reader.readAsDataURL(file); e.target.value=''; });
    modal.querySelector('#v4BgRemove').addEventListener('click', () => { pushUndo(); draft.settings.backgroundImage=''; markDirty(); renderSlide(selectedId, true); });
    modal.querySelector('#v4Delete').addEventListener('click', deleteSelected);
    modal.querySelector('#v4ApplyFont').addEventListener('click', () => applyStyle('fontSize', (Number(modal.querySelector('#v4FontSize').value)||22)+'px'));
    modal.querySelector('#v4TextColor').addEventListener('input', e => applyStyle('color', e.target.value));
    modal.querySelector('#v4Rotate').addEventListener('pointerdown', e => startToolbarRotate(e));
    modal.querySelector('.v4-toolbar').addEventListener('pointerdown', e => e.stopPropagation());
    modal.querySelector('#v4Context').addEventListener('pointerdown', e => e.stopPropagation());
  }
  let lastUndoToken='';
  function pushUndoOnce(token){ if (lastUndoToken !== token) { pushUndo(); lastUndoToken = token; setTimeout(()=>{ if(lastUndoToken===token) lastUndoToken=''; }, 450); } }
  function flash(id, text){ const b=document.getElementById(id); if(!b) return; const old=b.textContent; b.textContent=text; setTimeout(()=>b.textContent=old,900); }
  function openModal(){
    const modal = ensureModal();
    ensureDefaultSnapshot();
    savedAtOpen = snapshotStorage();
    draft = clone(savedAtOpen);
    undoStack = [];
    dirty = false; editMode = false; slideIndex = 0; selectedId = null; dragState = null;
    modal.hidden = false;
    renderSlide();
  }
  function closeModal(){
    if (dirty) {
      const save = confirm('Änderungen speichern, bevor die Präsentationsbearbeitung geschlossen wird?');
      if (save) commit();
      else if (!confirm('Ohne zu speichern schließen? Nicht gespeicherte Änderungen gehen verloren.')) return;
      else { draft = clone(savedAtOpen); dirty = false; }
    }
    const modal = document.getElementById('presentationPrepModalV4'); if (modal) modal.hidden = true;
    selectedId = null;
    try { if (typeof renderSummary === 'function' && typeof collectSupervisorData === 'function') renderSummary(collectSupervisorData()); } catch(_){}
  }
  function moveSlide(delta){ persistDOMText(); slideIndex = Math.max(0, Math.min(buildSlides().length-1, slideIndex+delta)); selectedId = null; renderSlide(); }

  function rowForSlides(){ return (typeof localPresentationRowFinal === 'function') ? localPresentationRowFinal() : {data:{}}; }
  function buildSlides(){
    let slides = [];
    try { slides = (typeof buildEditablePresentationSlidesFinal === 'function') ? buildEditablePresentationSlidesFinal(rowForSlides()) : []; } catch(_) {}
    if (!slides.length) slides = [{title:'Gruppenvorstellung', html:'<p>Keine Daten vorhanden.</p>'}];
    return slides.map((s,i)=>{
      const title = ((draft && draft.text && draft.text[`s${i}_title`]) || s.title || '');
      let html = s.html || '';
      const sub = draft && draft.text ? draft.text[`s${i}_subtitle`] : '';
      if (sub) html = html.replace(/<p class="presentation-subtitle">[\s\S]*?<\/p>/, `<p class="presentation-subtitle">${esc(sub)}</p>`);
      return {title, html};
    });
  }
  function renderSlide(keepSelectedId, noPersist){
    if (!noPersist) persistDOMText();
    const modal = ensureModal();
    const host = modal.querySelector('#summaryPresentationSlideV4');
    const slides = buildSlides();
    slideIndex = Math.max(0, Math.min(slides.length-1, slideIndex));
    const item = slides[slideIndex];
    const title = item.title ? `<h1 data-v4-role="title">${esc(item.title)}</h1>` : '';
    host.innerHTML = `<div class="presentation-slide-inner${item.title ? '' : ' no-title-slide'}">${title}${item.html}${renderExtras()}${renderStickers()}</div>`;
    host.classList.toggle('is-editing', editMode);
    modal.classList.toggle('is-editing', editMode);
    applyPresentationThemeToNodeFinal(modal.querySelector('.v4-stage'), draft.settings);
    applyPresentationThemeToNodeFinal(host, draft.settings);
    setupInteractivity(host);
    selectedId = keepSelectedId || selectedId;
    if (selectedId) selectById(selectedId);
    updateToolbarState();
  }
  function renderExtras(){
    return `<div class="presentation-extras-layer">${arr(draft.extras).map((x,i)=>Object.assign({},x,{_i:i})).filter(x=>Number(x.slide)===slideIndex).map(x=>`<div class="prep-extra-text" data-edit-id="extra_${x._i}" data-extra-index="${x._i}" style="left:${num(x.x,10)}%;top:${num(x.y,70)}%;width:${num(x.w,22)}%;min-height:${num(x.h,7)}%;transform:rotate(${num(x.rot,0)}deg);font-size:${num(x.fontSize,18)}px;color:${x.color||''};">${esc(x.text||'')}</div>`).join('')}</div>`;
  }
  function renderStickers(){
    return `<div class="presentation-stickers-layer">${arr(draft.stickers).map((x,i)=>Object.assign({},x,{_i:i})).filter(x=>Number(x.slide)===slideIndex).map(x=>`<div class="prep-sticker" data-edit-id="sticker_${x._i}" data-sticker-index="${x._i}" style="left:${num(x.x,58)}%;top:${num(x.y,48)}%;width:${num(x.w,24)}%;height:${num(x.h,22)}%;transform:rotate(${num(x.rot,0)}deg);"><img src="${esc(x.src||'')}" alt="Sticker"></div>`).join('')}</div>`;
  }
  function num(v, fb){ v=Number(v); return Number.isFinite(v)?v:fb; }
  function setupInteractivity(host){
    const inner = host.querySelector('.presentation-slide-inner'); if(!inner) return;
    const core = Array.from(inner.children).filter(el => !el.classList.contains('presentation-extras-layer') && !el.classList.contains('presentation-stickers-layer'));
    core.forEach((el,i)=>prepare(el, coreId(el,i), 'core'));
    inner.querySelectorAll('.prep-extra-text').forEach(el=>prepare(el, el.dataset.editId, 'extra'));
    inner.querySelectorAll('.prep-sticker').forEach(el=>prepare(el, el.dataset.editId, 'sticker'));
    inner.querySelectorAll('[data-edit-save]').forEach(cell=>{
      const k=cell.dataset.editSave;
      if (k && draft.values && Object.prototype.hasOwnProperty.call(draft.values,k)) cell.innerText = draft.values[k] || '—';
      cell.contentEditable = editMode ? 'true':'false';
      cell.addEventListener('focus',()=>{ if(editMode && !cell.dataset.undoFocus){ pushUndo(); cell.dataset.undoFocus='1'; }});
      cell.addEventListener('blur',()=>{ delete cell.dataset.undoFocus; });
      cell.addEventListener('input',()=>{ if(k){ draft.values[k]=cell.innerText.trim()==='—'?'':cell.innerText.trim(); markDirty(); }});
    });
    const title = inner.querySelector('h1[data-v4-role="title"]');
    if (title) { title.contentEditable = editMode?'true':'false'; title.addEventListener('focus',()=>{ if(editMode && !title.dataset.undoFocus){ pushUndo(); title.dataset.undoFocus='1'; }}); title.addEventListener('input',()=>{ draft.text[`s${slideIndex}_title`]=title.innerText.trim(); markDirty(); }); }
    const subtitle = inner.querySelector('.presentation-subtitle');
    if (subtitle) { subtitle.contentEditable = editMode?'true':'false'; subtitle.addEventListener('focus',()=>{ if(editMode && !subtitle.dataset.undoFocus){ pushUndo(); subtitle.dataset.undoFocus='1'; }}); subtitle.addEventListener('input',()=>{ draft.text[`s${slideIndex}_subtitle`]=subtitle.innerText.trim(); markDirty(); }); }
    inner.addEventListener('pointerdown', e => { if(!editMode) return; if(e.target === inner) { selectedId = null; selectById(null); } });
  }
  function coreId(el,i){ if(el.matches('h1')) return `core_${slideIndex}_title`; if(el.matches('h2')) return `core_${slideIndex}_h2_${i}`; if(el.matches('.presentation-subtitle')) return `core_${slideIndex}_subtitle`; if(el.matches('.presentation-table-wrap')) return `core_${slideIndex}_table_${i}`; if(el.matches('.presentation-kicker')) return `core_${slideIndex}_kicker_${i}`; if(el.matches('.presentation-note')) return `core_${slideIndex}_note_${i}`; if(el.matches('.thanks-slide')) return `core_${slideIndex}_thanks`; return `core_${slideIndex}_el_${i}`; }
  function prepare(el,id,type){
    el.classList.add('v4-editable'); el.dataset.editId=id; el.dataset.editType=type;
    const layout = draft.layout && draft.layout[id]; if(layout) applyLayout(el, layout);
    if (editMode) addHandles(el);
    el.addEventListener('pointerdown', e => { if(!editMode) return; selectById(id); if(type==='sticker' && !e.target.classList.contains('v4-handle')) { startTransform(e, el, parent, 'move'); return; } e.stopPropagation(); });
  }
  function addHandles(el){
    if (el.querySelector(':scope > .v4-handle')) return;
    const drag = document.createElement('span'); drag.className='v4-handle v4-drag'; drag.title='Verschieben';
    const resize = document.createElement('span'); resize.className='v4-handle v4-resize'; resize.title='Größe ändern';
    const rotate = document.createElement('span'); rotate.className='v4-handle v4-rotate'; rotate.textContent='↻'; rotate.title='Drehen';
    el.appendChild(drag); el.appendChild(resize); el.appendChild(rotate);
    const inner = el.closest('.presentation-slide-inner');
    drag.addEventListener('pointerdown', e=>startTransform(e, el, inner, 'move'));
    resize.addEventListener('pointerdown', e=>startTransform(e, el, inner, 'resize'));
    rotate.addEventListener('pointerdown', e=>startTransform(e, el, inner, 'rotate'));
  }
  function selectById(id){
    const modal = document.getElementById('presentationPrepModalV4');
    if (!modal) return;
    modal.querySelectorAll('.v4-selected').forEach(x=>x.classList.remove('v4-selected'));
    selectedId = id;
    const el = id ? modal.querySelector(`[data-edit-id="${CSS.escape(id)}"]`) : null;
    if (el) el.classList.add('v4-selected');
    updateToolbarState();
  }
  function ensureAbs(el,parent){
    if(!el || !parent) return;
    if(el.style.position === 'absolute') return;
    const pr=parent.getBoundingClientRect(), r=el.getBoundingClientRect();
    const l = Object.assign({}, draft.layout[el.dataset.editId] || {}, {x:((r.left-pr.left)/pr.width)*100, y:((r.top-pr.top)/pr.height)*100, w:(r.width/pr.width)*100, h:(r.height/pr.height)*100, rot:num((draft.layout[el.dataset.editId]||{}).rot,0), z:60});
    draft.layout[el.dataset.editId]=l; applyLayout(el,l);
  }
  function applyLayout(el,l){
    if(!l) return;
    el.style.position='absolute'; el.style.left=num(l.x,0)+'%'; el.style.top=num(l.y,0)+'%'; if(l.w) el.style.width=num(l.w,20)+'%'; if(l.h){ if(el.classList.contains('prep-sticker')) el.style.height=num(l.h,20)+'%'; else el.style.minHeight=num(l.h,6)+'%'; }
    if(l.fontSize) el.style.fontSize=num(l.fontSize,18)+'px'; if(l.color) el.style.color=l.color; el.style.transform=`rotate(${num(l.rot,0)}deg)`; el.style.zIndex=String(num(l.z,60));
  }
  function startTransform(e,el,parent,mode){
    if(!editMode || !el || !parent) return;
    e.preventDefault(); e.stopPropagation(); pushUndo(); selectById(el.dataset.editId); ensureAbs(el,parent);
    const l = draft.layout[el.dataset.editId] || {};
    dragState = {mode, el, parent, sx:e.clientX, sy:e.clientY, x:num(l.x,0), y:num(l.y,0), w:num(l.w,(el.offsetWidth/parent.clientWidth)*100), h:num(l.h,(el.offsetHeight/parent.clientHeight)*100), rot:num(l.rot,0)};
    window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp, {once:true});
  }
  function startToolbarRotate(e){ const el = selectedId && document.querySelector(`#presentationPrepModalV4 [data-edit-id="${CSS.escape(selectedId)}"]`); if(!el) return; const inner=el.closest('.presentation-slide-inner'); startTransform(e,el,inner,'rotate'); }
  function onMove(e){
    if(!dragState) return;
    const {mode,el,parent,sx,sy}=dragState; const pr=parent.getBoundingClientRect();
    const dx=((e.clientX-sx)/pr.width)*100, dy=((e.clientY-sy)/pr.height)*100;
    const l = draft.layout[el.dataset.editId] || {};
    if(mode==='move'){ l.x=Math.max(-20,Math.min(120,dragState.x+dx)); l.y=Math.max(-20,Math.min(120,dragState.y+dy)); }
    if(mode==='resize'){ l.w=Math.max(5,Math.min(120,dragState.w+dx)); l.h=Math.max(3,Math.min(110,dragState.h+dy)); }
    if(mode==='rotate'){ l.rot=dragState.rot+(e.clientX-sx)*.55; }
    draft.layout[el.dataset.editId]=l; applyLayout(el,l); syncItemFromLayout(el); markDirty();
  }
  function onUp(){ window.removeEventListener('pointermove', onMove); dragState=null; }
  function syncItemFromLayout(el){
    if(!el || !draft) return; const id=el.dataset.editId; const l=draft.layout[id]||{};
    if(id && id.startsWith('extra_')){ const i=Number(el.dataset.extraIndex); if(draft.extras[i]) Object.assign(draft.extras[i], l); }
    if(id && id.startsWith('sticker_')){ const i=Number(el.dataset.stickerIndex); if(draft.stickers[i]) Object.assign(draft.stickers[i], l); }
  }
  function persistDOMText(){
    const modal=document.getElementById('presentationPrepModalV4'); if(!modal || !draft) return;
    modal.querySelectorAll('[data-edit-save]').forEach(cell=>{ const k=cell.dataset.editSave; if(k) draft.values[k]=cell.innerText.trim()==='—'?'':cell.innerText.trim(); });
    modal.querySelectorAll('.prep-extra-text').forEach(el=>{ const i=Number(el.dataset.extraIndex); if(draft.extras[i]) draft.extras[i].text=el.innerText.trim(); });
    const title=modal.querySelector('h1[data-v4-role="title"]'); if(title) draft.text[`s${slideIndex}_title`]=title.innerText.trim();
    const sub=modal.querySelector('.presentation-subtitle'); if(sub) draft.text[`s${slideIndex}_subtitle`]=sub.innerText.trim();
  }
  function applyStyle(prop,value){
    if(!editMode || !selectedId) return;
    const el=document.querySelector(`#presentationPrepModalV4 [data-edit-id="${CSS.escape(selectedId)}"]`); if(!el) return;
    pushUndo();
    const sel=window.getSelection&&window.getSelection();
    if(sel && sel.rangeCount && !sel.isCollapsed && el.contains(sel.anchorNode) && el.contains(sel.focusNode)){
      const range=sel.getRangeAt(0); const span=document.createElement('span'); span.style[prop]=value;
      try{ range.surroundContents(span); }catch(_){ const frag=range.extractContents(); span.appendChild(frag); range.insertNode(span); }
      sel.removeAllRanges();
    } else {
      el.style[prop]=value;
      const l=draft.layout[selectedId]||{}; l[prop]=prop==='fontSize'?parseFloat(value):value; draft.layout[selectedId]=l; syncItemFromLayout(el);
    }
    markDirty(); updateToolbarState();
  }
  function deleteSelected(){
    if(!editMode || !selectedId || !draft) return;
    if(!isDeletable(selectedId)) return;
    pushUndo();
    if(selectedId.startsWith('extra_')){ const i=Number(selectedId.split('_')[1]); if(Number.isFinite(i)) draft.extras.splice(i,1); }
    else if(selectedId.startsWith('sticker_')){ const i=Number(selectedId.split('_')[1]); if(Number.isFinite(i)) draft.stickers.splice(i,1); }
    selectedId=null; markDirty(); renderSlide();
  }
  function isDeletable(id){ return /^extra_\d+$/.test(id||'') || /^sticker_\d+$/.test(id||''); }
  function openStickerPicker(){
    if(!editMode) return;
    let p=document.getElementById('presentationStickerPickerV4');
    if(!p){
      p=document.createElement('div'); p.id='presentationStickerPickerV4'; p.hidden=true;
      p.innerHTML=`<div class="picker-box"><div class="picker-head"><h2>Sticker hinzufügen</h2><button type="button" id="v4ClosePicker">Schließen</button></div><div class="picker-grid">${STICKER_FILES.map(f=>`<button type="button" data-sticker="${esc(f)}"><img src="${STICKER_PATH+esc(f)}" alt="${esc(f)}"></button>`).join('')}</div></div>`;
      document.body.appendChild(p);
      p.addEventListener('click',e=>{ if(e.target===p) p.hidden=true; });
      p.querySelector('#v4ClosePicker').addEventListener('click',()=>p.hidden=true);
      p.querySelectorAll('[data-sticker]').forEach(btn=>btn.addEventListener('click',()=>{ pushUndo(); const f=btn.dataset.sticker; draft.stickers.push({slide:slideIndex,src:STICKER_PATH+f,x:58,y:48,w:24,h:22,rot:0}); p.hidden=true; markDirty(); renderSlide('sticker_'+(draft.stickers.length-1)); }));
    }
    p.hidden=false;
  }
  function updateToolbarState(){
    const modal=document.getElementById('presentationPrepModalV4'); if(!modal) return;
    modal.querySelectorAll('.v4-edit-only').forEach(el=>{ el.hidden=!editMode; el.disabled=!editMode; });
    modal.querySelector('#v4EditToggle').textContent=editMode?'Bearbeitung aktiv':'Bearbeitungsmodus';
    modal.querySelector('#v4EditToggle').classList.toggle('primary', editMode);
    modal.querySelector('#v4Counter').textContent=`${slideIndex+1} / ${buildSlides().length}${dirty?' · ungespeichert':''}`;
    const undo=modal.querySelector('#v4Undo'); if(undo) undo.disabled=!editMode || undoStack.length===0;
    const context=modal.querySelector('#v4Context');
    const hasSel=editMode && !!selectedId;
    context.hidden=!hasSel;
    if(hasSel){
      const el=modal.querySelector(`[data-edit-id="${CSS.escape(selectedId)}"]`); const l=(draft.layout&&draft.layout[selectedId])||{};
      modal.querySelector('#v4FontSize').value=Math.round(num(l.fontSize, el?parseFloat(getComputedStyle(el).fontSize):22));
      modal.querySelector('#v4TextColor').value=rgbToHex(l.color || (el?getComputedStyle(el).color:'#0f172a'));
      modal.querySelector('#v4Delete').disabled=!isDeletable(selectedId);
    }
    if(draft){
      const tt=modal.querySelector('#v4ThemeTarget'); modal.querySelector('#v4ThemeColor').value=draft.settings[tt.value]||THEME_DEFAULT[tt.value]||'#000000';
      const pt=modal.querySelector('#v4PatternTarget').value;
      modal.querySelector('#v4Pattern').value=pt==='background'?(draft.settings.backgroundPattern||'none'):(draft.settings.slidePattern||'none');
      modal.querySelector('#v4PatternColor').value=pt==='background'?(draft.settings.backgroundPatternColor||'#1f2937'):(draft.settings.slidePatternColor||'#e5e7eb');
    }
  }
  function rgbToHex(c){ if(!c) return '#0f172a'; if(c.startsWith('#')) return c; const m=c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/); if(!m) return '#0f172a'; return '#'+[m[1],m[2],m[3]].map(n=>(+n).toString(16).padStart(2,'0')).join(''); }

  const oldBuildPayload = typeof buildPayload === 'function' ? buildPayload : null;
  buildPayload = function(){
    const data = oldBuildPayload ? oldBuildPayload() : (typeof collectSupervisorData === 'function' ? collectSupervisorData() : {});
    data.presentationSettings = window.getPresentationSettingsFinal();
    data.presentationExtras = window.getPresentationExtrasFinal();
    data.presentationStickers = window.getPresentationStickersFinal();
    data.presentationTextOverrides = window.getPresentationTextOverridesFinal();
    data.presentationLayout = lObj(LAYOUT_KEY, {});
    return data;
  };

  document.addEventListener('DOMContentLoaded', () => {
    const old = document.getElementById('openPresentationPrepBtn');
    if (old) old.id = 'openPresentationPrepBtnV4';
    const btn = document.getElementById('openPresentationPrepBtnV4');
    if (btn) {
      const clean = btn.cloneNode(true);
      btn.replaceWith(clean);
      clean.addEventListener('click', e => { e.preventDefault(); openModal(); });
    }
  });
  document.addEventListener('click', e => {
    const btn=e.target&&e.target.closest&&e.target.closest('#openPresentationPrepBtnV4');
    if(btn){ e.preventDefault(); e.stopImmediatePropagation(); openModal(); }
  }, true);

  window.openPresentationPrepModalFinal = openModal;
  window.ensurePresentationPrepModalFinal = ensureModal;
  window.closePresentationPrepModalFinal = closeModal;
  window.renderSummaryPresentationSlideFinal = renderSlide;
})();

/* ============================================================
   FINAL PATCH: schöne Dialoge, Ablaufseite, Roulette-Feinschliff
   ============================================================ */
(function(){
  const FLOW_STEPS = [
    {title:'Rolle lesen', text:'Du hast deine Rollenkarte gelesen. Behalte diese Perspektive im Rollenspiel konsequent bei.'},
    {title:'Ablauf verstehen', text:'Die Supervision läuft in sechs Phasen: Erstkontakt, Problembeschreibung, Zielformulierung, vertiefte Problembearbeitung, Ergebnissicherung und Reflexionstauglichkeit.'},
    {title:'Eigene Perspektive vorbereiten', text:'Im nächsten Schritt notierst du kurz deine Sichtweise, Gefühle, Wünsche und mögliche Ziele. Diese Notizen helfen dir später im Gespräch.'},
    {title:'Gruppensupervision starten', text:'Die Supervisor*in führt durch die Phasen. Die anderen Rollen bringen ihre Perspektive ein und reagieren auf die Moderationsimpulse.'},
    {title:'Ergebnis sichern', text:'Am Ende werden Zielvereinbarung, Absprachen und Praxistauglichkeit festgehalten. Die Ergebnisse können danach zentral angezeigt und präsentiert werden.'}
  ];

  function ensureNiceModal(){
    let m=document.getElementById('niceDialogModal');
    if(m) return m;
    m=document.createElement('div');
    m.id='niceDialogModal';
    m.className='nice-modal';
    m.hidden=true;
    m.innerHTML=`<div class="nice-modal-backdrop" data-nice-cancel></div><div class="nice-modal-card" role="dialog" aria-modal="true"><h2 id="niceModalTitle"></h2><p id="niceModalMessage"></p><label id="niceModalLabel" for="niceModalInput" hidden></label><input id="niceModalInput" type="text" hidden><div class="nice-modal-actions" id="niceModalActions"></div></div>`;
    document.body.appendChild(m);
    return m;
  }
  function niceDialog(opts){
    opts=Object.assign({title:'Hinweis',message:'',confirmText:'OK',cancelText:null,input:false,password:false,danger:false}, opts||{});
    return new Promise(resolve=>{
      const m=ensureNiceModal();
      const card=m.querySelector('.nice-modal-card');
      const title=m.querySelector('#niceModalTitle');
      const msg=m.querySelector('#niceModalMessage');
      const label=m.querySelector('#niceModalLabel');
      const input=m.querySelector('#niceModalInput');
      const actions=m.querySelector('#niceModalActions');
      card.classList.toggle('danger', !!opts.danger);
      title.textContent=opts.title || 'Hinweis';
      msg.textContent=opts.message || '';
      actions.innerHTML='';
      input.hidden=!opts.input;
      label.hidden=!opts.input;
      input.value='';
      input.type=opts.password?'password':'text';
      if(opts.input) label.textContent=opts.label || opts.title || 'Eingabe';
      const close=(val)=>{m.hidden=true; document.removeEventListener('keydown', onKey); resolve(val);};
      if(opts.cancelText){
        const cancel=document.createElement('button');
        cancel.type='button'; cancel.className='secondary'; cancel.textContent=opts.cancelText;
        cancel.onclick=()=>close(opts.input?null:false);
        actions.appendChild(cancel);
      }
      const ok=document.createElement('button');
      ok.type='button'; ok.textContent=opts.confirmText || 'OK';
      if(opts.danger) ok.className='danger';
      ok.onclick=()=>close(opts.input ? input.value : true);
      actions.appendChild(ok);
      m.querySelector('[data-nice-cancel]').onclick=()=>close(opts.input?null:false);
      function onKey(e){ if(e.key==='Escape') close(opts.input?null:false); if(e.key==='Enter') close(opts.input ? input.value : true); }
      document.addEventListener('keydown', onKey);
      m.hidden=false;
      setTimeout(()=>{ if(opts.input) input.focus(); else ok.focus(); },20);
    });
  }
  window.supervisionNiceDialog = niceDialog;
  window.alert = function(message){ niceDialog({title:'Hinweis', message:String(message||''), confirmText:'OK'}); };

  window.supervisionConfirm = (message, title='Bitte bestätigen', danger=false) => niceDialog({title, message, confirmText:'Bestätigen', cancelText:'Abbrechen', danger});
  window.supervisionPrompt = (message, title='Eingabe', password=false) => niceDialog({title, message, input:true, password, confirmText:'Weiter', cancelText:'Abbrechen'});

  // Globale lokale Navigations-/Resetleiste mit schönen Dialogen.
  window.installLocalResetControls = function(){
    const header=document.querySelector('header');
    if(!header) return;
    let bar=document.querySelector('.local-reset-bar');
    if(!bar){ bar=document.createElement('div'); bar.className='local-reset-bar'; header.insertAdjacentElement('afterend', bar); }
    bar.innerHTML=`<div class="wrap local-reset-inner admin-reset-inner">
      <button type="button" class="secondary small-reset back-nav-button" id="localBackBtn">Zurück</button>
      <a class="button secondary small-reset start-nav-button" href="index.html">Zurück zum Start</a>
      <button type="button" class="admin-status-button" id="globalAdminStatusBtn" data-admin-status-button>Admin-Modus deaktiviert</button>
      <button type="button" class="secondary small-reset" id="clearPageBtn">Aktuelle Seite leeren</button>
      <button type="button" class="secondary small-reset" id="clearAllLocalBtn">Seite zurücksetzen</button>
      <span id="pageResetStatus" class="local-reset-status" aria-live="polite"></span>
    </div>`;
    const back=document.getElementById('localBackBtn');
    const statusBtn=document.getElementById('globalAdminStatusBtn');
    const clearPageBtn=document.getElementById('clearPageBtn');
    const clearAllBtn=document.getElementById('clearAllLocalBtn');
    if(back) back.onclick=()=>{ if(history.length>1) history.back(); else location.href='index.html'; };
    if(statusBtn) statusBtn.onclick=typeof handleGlobalAdminClick==='function'?handleGlobalAdminClick:undefined;
    if(clearPageBtn) clearPageBtn.onclick=async()=>{ if(await window.supervisionConfirm('Lokale Eingaben auf der aktuellen Seite leeren?', 'Aktuelle Seite leeren')) clearCurrentPageInputs(); };
    if(clearAllBtn) clearAllBtn.onclick=async()=>{ if(!(await window.supervisionConfirm('Alle lokal gespeicherten Arbeitsdaten dieser Website löschen? Google-Sheet-Ergebnisse bleiben erhalten.', 'Seite zurücksetzen', true))) return; clearAllLocalSupervisionData({silent:true}); location.href='index.html'; };
    if(typeof updateGlobalAdminUi==='function') updateGlobalAdminUi();
  };

  // Adminschutz ohne Browser-Popups.
  window.updateAdminProtectedLinks = function(){
    const active = (typeof isGlobalAdminActive==='function') ? isGlobalAdminActive() : false;
    document.querySelectorAll('[data-admin-required]').forEach(el=>{
      el.classList.toggle('is-locked', !active);
      el.setAttribute('aria-disabled', active?'false':'true');
      el.title = active ? '' : 'Nur im Administrationsmodus verfügbar';
      el.onclick = async (event)=>{
        if((typeof isGlobalAdminActive==='function') && isGlobalAdminActive()) return true;
        event.preventDefault();
        await niceDialog({title:'Administrationsmodus erforderlich', message:'Diese Funktion ist nur im Administrationsmodus verfügbar. Aktiviere den Admin-Modus oben in der Leiste.', confirmText:'OK'});
        return false;
      };
    });
  };

  // Rolle -> Ablaufseite statt direkt Gedanken.
  window.initRoleCard = function(){
    initCommon();
    const role=getPageRole();
    const data=ROLECARD[role];
    const target=document.getElementById('roleCard');
    if(!data || !target) return;
    target.innerHTML=`<div class="card highlight"><p class="role-pill">${ROLES[role]}</p><h2>${data.title}</h2><p><strong>Zugewiesene Person:</strong> ${escapeHtml(roleName(role)||'nicht gesetzt')}</p><p>${data.intro}</p><h3>Deine Aufgabe</h3><ul class="tight">${data.bullets.map(b=>`<li>${b}</li>`).join('')}</ul><h3>Fokus im Fall</h3><p>${data.caseFocus}</p></div><div class="card"><h2>Fallgrundlage</h2><div class="readonly-box">${escapeHtml(CASE_TEXT)}</div><h3>Supervisionsfrage</h3><div class="notice">${SUPERVISION_QUESTION}</div></div>`;
    const next=document.getElementById('nextPrep');
    if(next){ next.textContent='Weiter: Ablauf ansehen'; next.href=`ablauf.html?role=${encodeURIComponent(role)}&${currentQueryString()}`; }
  };

  window.initFlow = function(){
    initCommon();
    const params=new URLSearchParams(location.search);
    const role=params.get('role') || 'supervisor';
    const box=document.getElementById('flowSteps');
    const next=document.getElementById('flowNext');
    if(next) next.href=linkWithState(`gedanken-${role}.html`);
    if(!box) return;
    let visible=Number(localStorage.getItem(key('flow_visible_'+role)) || '1');
    visible=Math.max(1, Math.min(FLOW_STEPS.length, visible));
    function render(){
      box.innerHTML='';
      FLOW_STEPS.slice(0, visible).forEach((step, idx)=>{
        const last=idx===visible-1;
        const done=idx<visible-1 || visible===FLOW_STEPS.length;
        const card=document.createElement('article');
        card.className='card flow-step is-visible';
        card.innerHTML=`<div class="flow-step-head"><span class="step-badge">${idx+1}</span><h3>${escapeHtml(step.title)}</h3></div><p>${escapeHtml(step.text)}</p>${(!done && last)?'<button type="button" class="secondary flow-read-btn">Gelesen</button>':''}`;
        const btn=card.querySelector('.flow-read-btn');
        if(btn) btn.onclick=()=>{ visible=Math.min(FLOW_STEPS.length, visible+1); localStorage.setItem(key('flow_visible_'+role), String(visible)); render(); };
        box.appendChild(card);
      });
      if(next) next.hidden=visible<FLOW_STEPS.length;
    }
    render();
  };

  // Ergebnis-Admin-State: Zufallsleiste nur im Adminmodus; Pfeile immer sichtbar.
  window.applyResultsAdminState = function(){
    resultsAdminActive = (typeof isGlobalAdminActive==='function') ? isGlobalAdminActive() : !!resultsAdminActive;
    document.body.classList.toggle('is-admin-results', !!resultsAdminActive);
    document.body.classList.toggle('public-results', !resultsAdminActive);
    document.querySelectorAll('.admin-only').forEach(el=>{
      el.hidden=!resultsAdminActive;
      el.style.display=resultsAdminActive?'':'none';
      el.style.visibility=resultsAdminActive?'visible':'hidden';
    });
    document.querySelectorAll('.result-delete').forEach(el=>{ el.style.display=resultsAdminActive?'inline-flex':'none'; el.style.visibility=resultsAdminActive?'visible':'hidden'; });
    const controls=document.getElementById('resultsControls');
    if(controls){ controls.hidden=!resultsAdminActive; controls.style.display=resultsAdminActive?'flex':'none'; controls.style.visibility=resultsAdminActive?'visible':'hidden'; }
    const nav=document.querySelector('.carousel-nav-floating');
    if(nav){ nav.hidden=false; nav.style.display='flex'; nav.style.visibility='visible'; }
    const deleteAll=document.getElementById('deleteAllBtn');
    if(deleteAll){ deleteAll.textContent='Alle Gruppenergebnisse löschen'; deleteAll.style.display=resultsAdminActive?'inline-flex':'none'; deleteAll.style.visibility=resultsAdminActive?'visible':'hidden'; }
    if(typeof updateGlobalAdminUi==='function') updateGlobalAdminUi();
  };

  const oldUpdateSlotCardFocus = window.updateSlotCardFocus;
  window.updateSlotCardFocus = function(position){
    const track=document.getElementById('resultsContent');
    if(!track) return;
    const nearest=Math.round(position);
    track.querySelectorAll('.result-card').forEach(card=>{
      const virtual=Number(card.dataset.virtualIndex);
      const idx=Number(card.dataset.resultIndex);
      const distance=Math.abs(virtual-position);
      const active=virtual===nearest;
      const opacity=active?1:Math.max(0.58,0.86-Math.min(distance,3)*0.10);
      const z=active?50:Math.max(1,30-Math.round(distance*4));
      card.classList.toggle('is-active', active);
      card.classList.toggle('is-side', !active);
      card.setAttribute('aria-current', active?'true':'false');
      card.style.transform='translate3d(0,0,0) scale(1)';
      card.style.opacity=String(opacity);
      card.style.zIndex=String(z);
      card.style.filter='none';
      const row=resultRowsCache[idx];
      const key=(typeof resultKey==='function')?resultKey(row,idx):String(idx);
      card.classList.toggle('is-winner', active && window.__rouletteWinnerKey && key===window.__rouletteWinnerKey);
    });
  };

  // Langsameres Roulette mit echtem Stop auf Fokus-Kachel und grüner Hervorhebung.
  window.spinRandomGroup = function(){
    if(!resultsAdminActive || !resultRowsCache.length || randomSpinActive) return;
    const btn=document.getElementById('randomGroupBtn');
    const status=document.getElementById('resultsStatus');
    const available=getUnselectedResultIndexes();
    if(!available.length){ if(status){ status.className='warning'; status.textContent='Keine weiteren Einträge verfügbar.'; } updateRandomAvailability(); return; }
    if(carouselAnimationFrame) cancelAnimationFrame(carouselAnimationFrame);
    if(rouletteFrame) cancelAnimationFrame(rouletteFrame);
    window.__rouletteWinnerKey='';
    randomSpinActive=true;
    const n=resultRowsCache.length;
    const duration=6500+Math.floor(Math.random()*3501); // 6,5–10 Sekunden
    const startPosition=currentVirtualPosition;
    const targetIndex=available[Math.floor(Math.random()*available.length)];
    const loops=3+Math.floor(Math.random()*3); // bewusst moderater Start
    const base=Math.ceil(startPosition)+loops*n;
    const deltaToTarget=mod(targetIndex-mod(base,n),n);
    const targetPosition=base+deltaToTarget;
    buildSlotTrack(Math.floor(startPosition)-5, Math.ceil(targetPosition)+5);
    const start=performance.now();
    if(btn){ btn.disabled=true; btn.textContent='Zufallsauswahl läuft …'; }
    if(status){ status.className='notice'; status.textContent='Das Rad läuft …'; }
    function easeOutSoft(t){ return 1 - Math.pow(1-t, 2.35); }
    function frame(now){
      const t=Math.min(1,(now-start)/duration);
      const eased=easeOutSoft(t);
      const pos=startPosition+(targetPosition-startPosition)*eased;
      positionSlotTrack(pos,false);
      if(t<1){ rouletteFrame=requestAnimationFrame(frame); return; }
      rouletteFrame=null; randomSpinActive=false;
      currentVirtualPosition=Math.round(targetPosition);
      currentVirtualIndex=Math.round(targetPosition);
      currentResultIndex=mod(currentVirtualIndex,n);
      buildSlotTrack(currentVirtualIndex-4,currentVirtualIndex+4);
      const chosen=resultRowsCache[currentResultIndex];
      window.__rouletteWinnerKey=resultKey(chosen,currentResultIndex);
      positionSlotTrack(currentVirtualPosition,true);
      const chosenName=(chosen&&(chosen.groupName||(chosen.data&&chosen.data.groupName)))||'Gruppe';
      registerRandomSelection(currentResultIndex);
      if(status){ status.className='success'; status.textContent=chosenName; }
      updateRandomAvailability();
      startConfetti(6000);
      setTimeout(()=>{ window.__rouletteWinnerKey=''; updateSlotCardFocus(currentVirtualPosition); }, 9000);
    }
    rouletteFrame=requestAnimationFrame(frame);
  };

  // Schöne Löschdialoge.
  window.deleteSingleResult = async function(index){
    if(!resultsAdminActive) return;
    const row=resultRowsCache[index]; const url=getAppsScriptUrl(); const status=document.getElementById('resultsStatus');
    if(!row || !url){ if(status){status.className='warning';status.textContent='Dieser Eintrag kann aktuell nicht gelöscht werden.';} return; }
    const rowNumber=row.rowNumber||row.id;
    if(!rowNumber){ if(status){status.className='warning';status.textContent='Für diesen Eintrag wurde keine Tabellenzeile übermittelt.';} return; }
    const label=row.groupName||(row.data&&row.data.groupName)||'diesen Eintrag';
    const password=await window.supervisionPrompt(`Passwort zum Löschen von „${label}“ eingeben:`, 'Eintrag löschen', true);
    if(!password) return;
    if(!(await window.supervisionConfirm(`Eintrag „${label}“ wirklich löschen?`, 'Eintrag löschen', true))) return;
    if(status){status.className='notice';status.textContent='Eintrag wird gelöscht …';}
    callAppsScriptJsonp(url,{action:'delete',rowNumber,password}).then(response=>{
      if(!response||!response.ok) throw new Error((response&&response.error)||'Löschen fehlgeschlagen.');
      return fetchResultsWithFallback(url);
    }).then(rows=>{ resultRowsCache=rows||[]; if(currentResultIndex>=resultRowsCache.length) currentResultIndex=Math.max(0,resultRowsCache.length-1); renderResults(resultRowsCache); if(status){status.className='success';status.textContent='Eintrag wurde gelöscht.';} })
    .catch(()=>{ sendDeleteRowByHiddenFrame(url,rowNumber,password).then(()=>fetchResultsWithFallback(url)).then(rows=>{ const before=resultRowsCache.length; resultRowsCache=rows||[]; if(currentResultIndex>=resultRowsCache.length) currentResultIndex=Math.max(0,resultRowsCache.length-1); renderResults(resultRowsCache); if(status){ if(resultRowsCache.length<before){status.className='success';status.textContent='Eintrag wurde gelöscht.';} else {status.className='warning';status.textContent='Löschversuch abgeschlossen, der Eintrag ist aber noch vorhanden. Prüfe Passwort und Apps-Script-Version.';} } }).catch(()=>{ if(status){status.className='warning';status.textContent='Verbindung zum Apps Script fehlgeschlagen. Prüfe Apps-Script-Version und Zugriff.';} }); });
  };

  window.deleteAllResults = async function(){
    if(!resultsAdminActive) return;
    const url=getAppsScriptUrl(); const status=document.getElementById('resultsStatus');
    if(!url){ if(status){status.className='warning';status.textContent='Keine Apps-Script-URL gefunden. Löschen ist nicht möglich.';} return; }
    const password=await window.supervisionPrompt('Passwort zum Löschen aller Gruppenergebnisse eingeben:', 'Alle Gruppenergebnisse löschen', true);
    if(!password) return;
    if(!(await window.supervisionConfirm('Wirklich alle Ergebnisse aus dem Google Sheet löschen?', 'Alle Gruppenergebnisse löschen', true))) return;
    if(status){status.className='notice';status.textContent='Löschbefehl wird gesendet …';}
    callAppsScriptJsonp(url,{action:'deleteall',password}).then(response=>{ if(!response||!response.ok) throw new Error((response&&response.error)||'Löschen fehlgeschlagen.'); resultRowsCache=[]; currentResultIndex=0; renderResults([]); if(status){status.className='success';status.textContent='Alle Ergebnisse wurden gelöscht.';} })
    .catch(()=>{ sendDeleteByHiddenFrame(url,password).then(()=>fetchResultsWithFallback(url)).then(rows=>{ resultRowsCache=rows||[]; currentResultIndex=Math.max(0,resultRowsCache.length-1); renderResults(resultRowsCache); if(status){ if(!resultRowsCache.length){status.className='success';status.textContent='Alle Ergebnisse wurden gelöscht.';} else {status.className='warning';status.textContent='Löschversuch abgeschlossen, es sind aber noch Einträge vorhanden. Prüfe Passwort und Apps-Script-Version.';} } }).catch(()=>{ if(status){status.className='warning';status.textContent='Verbindung zum Apps Script fehlgeschlagen. Prüfe Apps-Script-Version und Zugriff.';} }); });
  };

  // Finales initResults mit separater Pfeilnavigation und schönen Dialogen.
  window.initResults = function(){
    initCommon(); installGlobalAdminControlsFinal();
    const status=document.getElementById('resultsStatus'); const url=getAppsScriptUrl();
    const deleteBtn=document.getElementById('deleteAllBtn'); const prevBtn=document.getElementById('prevGroupBtn'); const nextBtn=document.getElementById('nextGroupBtn'); const randomBtn=document.getElementById('randomGroupBtn'); const resetRoundsBtn=document.getElementById('resetRoundsBtn'); const resultsContent=document.getElementById('resultsContent');
    resultsAdminActive=(typeof isGlobalAdminActive==='function')?isGlobalAdminActive():false; applyResultsAdminState();
    if(deleteBtn) deleteBtn.onclick=deleteAllResults;
    if(prevBtn) prevBtn.onclick=()=>moveResult(-1);
    if(nextBtn) nextBtn.onclick=()=>moveResult(1);
    if(randomBtn) randomBtn.onclick=spinRandomGroup;
    if(resetRoundsBtn) resetRoundsBtn.onclick=async()=>{ if(await window.supervisionConfirm('Alle bisherigen Roulette-Runden zurücksetzen? Die Google-Sheet-Ergebnisse bleiben erhalten.','Runden zurücksetzen')) resetRouletteRounds(false); };
    if(resultsContent){ resultsContent.onclick=(event)=>{ const btn=event.target.closest('[data-delete-result]'); if(!btn) return; event.preventDefault(); if(!isGlobalAdminActive()) return; deleteSingleResult(Number(btn.dataset.deleteResult)); }; resultsContent.addEventListener('toggle',()=>setTimeout(()=>updateActiveResult(false),40),true); }
    renderRoundBadges(); window.addEventListener('resize',()=>{ if(resultRowsCache.length) renderCarouselAt(currentVirtualPosition,false); });
    if(!url){ if(status){status.className='warning';status.textContent='Keine Apps-Script-URL gefunden. Ergebnisse können nicht geladen werden.';} return; }
    if(status){status.className='notice';status.textContent='Ergebnisse werden geladen …';}
    fetchResultsWithFallback(url).then(rows=>{ resultRowsCache=rows||[]; currentResultIndex=Math.max(0,resultRowsCache.length-1); currentVirtualIndex=currentResultIndex; currentVirtualPosition=currentVirtualIndex; if(status) status.textContent=''; renderResults(resultRowsCache); applyResultsAdminState(); }).catch(err=>{ if(status){status.className='warning';status.textContent=err.message + " Prüfe die Web-App-Bereitstellung und den Zugriff 'Jeder'.";} });
  };

  // Gruppenzuweisung mit schönen Rückfragen.
  const oldInitGroupAssignment = window.initGroupAssignment;
  window.initGroupAssignment = function(){
    initCommon(); installGlobalAdminControlsFinal(); updateGroupAssignmentAccess(); if(!isGlobalAdminActive()) return;
    const list=document.getElementById('participantList'), input=document.getElementById('participantName'), addBtn=document.getElementById('addParticipantBtn'), buildBtn=document.getElementById('buildGroupsBtn'), resetBtn=document.getElementById('resetParticipantsBtn'), clearBtn=document.getElementById('clearParticipantsBtn'), output=document.getElementById('groupsOutput'), count=document.getElementById('participantCount'), status=document.getElementById('groupAssignStatus');
    let names=getGroupAssignmentNames();
    function setStatus(text,cls='notice'){ if(status){status.className=cls; status.textContent=text;} }
    function persistNames(){ saveGroupAssignmentNames(names); }
    function renderNames(){ if(!list) return; list.innerHTML=''; names.forEach((name,index)=>{ const li=document.createElement('li'); li.innerHTML=`<span class="name-index">${index+1}</span><span class="name-text">${escapeHtml(name)}</span><button type="button" class="icon-remove" aria-label="${escapeHtml(name)} löschen">×</button>`; li.querySelector('button').onclick=()=>{ names.splice(index,1); persistNames(); saveGroupAssignmentGroups([]); renderNames(); renderGroups([]); setStatus('Name wurde gelöscht. Die Gruppen müssen neu gebildet werden.','notice'); }; list.appendChild(li); }); if(count) count.textContent=String(names.length); }
    function renderGroups(groups=getGroupAssignmentGroups()){ if(!output) return; output.innerHTML=''; if(!groups.length){ output.className='group-output empty-state'; output.textContent='Noch keine Gruppen gebildet.'; return; } output.className='group-output'; groups.forEach((group,index)=>{ const card=document.createElement('div'); card.className='assignment-group-card'; card.innerHTML=`<h3>Gruppe ${index+1}<span class="group-size-pill">${group.length} Personen</span></h3><ol>${group.map(name=>`<li>${escapeHtml(name)}</li>`).join('')}</ol>`; output.appendChild(card); }); }
    function addName(){ const value=(input&&input.value||'').trim(); if(!value){ setStatus('Bitte zuerst einen Namen eintragen.','warning'); return; } names.push(value); persistNames(); saveGroupAssignmentGroups([]); if(input) input.value=''; renderNames(); renderGroups([]); setStatus('Name wurde hinzugefügt. Du kannst die Gruppen neu bilden.','success'); }
    if(addBtn) addBtn.onclick=addName;
    if(input) input.onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); addName(); } };
    if(buildBtn) buildBtn.onclick=()=>{ if(names.length<4){ setStatus('Für die Gruppenzuweisung werden mindestens 4 Personen benötigt.','warning'); saveGroupAssignmentGroups([]); renderGroups([]); return; } const groups=buildMinimumFourGroups(names); saveGroupAssignmentGroups(groups); renderGroups(groups); setStatus(`Gruppen wurden zufällig gebildet. Gruppengrößen: ${groups.map(g=>g.length).join(' / ')}.`, 'success'); };
    if(resetBtn) resetBtn.onclick=async()=>{ if(!(await window.supervisionConfirm('Ursprungsliste neu laden? Eigene Änderungen an der Teilnehmendenliste gehen verloren.','Ursprungsliste laden'))) return; names=DEFAULT_GROUP_PARTICIPANTS.slice(); persistNames(); saveGroupAssignmentGroups([]); renderNames(); renderGroups([]); setStatus('Ursprungsliste wurde geladen.','success'); };
    if(clearBtn) clearBtn.onclick=async()=>{ if(!(await window.supervisionConfirm('Gesamte Teilnehmendenliste leeren?','Teilnehmendenliste leeren',true))) return; names=[]; persistNames(); saveGroupAssignmentGroups([]); renderNames(); renderGroups([]); setStatus('Teilnehmendenliste wurde geleert. Mit Ursprungsliste laden kannst du die vorbereiteten Namen wiederherstellen.','notice'); };
    renderNames(); renderGroups();
  };

  document.addEventListener('DOMContentLoaded',()=>{
    if(document.body.dataset.mode==='flow') initFlow();
    // Damit die finale Ergebnisnavigation auch ohne Admin sichtbar bleibt.
    if(document.body.dataset.mode==='results') setTimeout(applyResultsAdminState, 50);
  });
})();

/* ==========================================================
   Pflichtfelder + Präsentationshinweis nach Absenden: Patch v13
   ========================================================== */
(function(){
  const REQUIRED_SUPERVISOR_KEYS = new Set([
    'sup_p2_sl_probleme','sup_p2_sl_gefuehle','sup_p2_sl_wuensche',
    'sup_p2_a_probleme','sup_p2_a_gefuehle','sup_p2_a_wuensche',
    'sup_p2_b_probleme','sup_p2_b_gefuehle','sup_p2_b_wuensche',
    'sup_p3_ziel_sl','sup_p3_ziel_a','sup_p3_ziel_b','sup_p3_gemeinsamkeiten','sup_p3_gemeinsames_ziel',
    'sup_p4_kritik','sup_p4_absprachen',
    'sup_p5_zustimmung_status','sup_p5_zustimmung',
    'sup_p6_praxistauglichkeit','sup_p6_unterstuetzung','sup_p6_umsetzung'
  ]);
  window.SV_REQUIRED_SUPERVISOR_KEYS = REQUIRED_SUPERVISOR_KEYS;

  function requiredBadgeHtml(){
    return '<span class="required-badge" aria-label="Pflichtfeld">Pflichtfeld!</span>';
  }

  // noteArea wird beim Rendern der Supervisor-Phasen verwendet. Durch diese Überschreibung
  // erhalten alle später relevanten Felder eine klare Pflichtfeld-Markierung.
  try {
    const oldNoteArea = typeof noteArea === 'function' ? noteArea : null;
    noteArea = function(label, saveKey){
      const required = REQUIRED_SUPERVISOR_KEYS.has(saveKey);
      if (!required && oldNoteArea) return oldNoteArea(label, saveKey);
      return `<div class="required-field is-required" data-required-wrapper="${saveKey}">
        <div class="field-label-row"><label>${label}</label>${requiredBadgeHtml()}</div>
        <textarea data-save="${saveKey}" data-required-supervisor="1" required></textarea>
      </div>`;
    };
  } catch (_) {}

  function enhanceRequiredSelects(){
    document.querySelectorAll('select[data-save]').forEach(select => {
      const k = select.getAttribute('data-save');
      if (!REQUIRED_SUPERVISOR_KEYS.has(k) || select.dataset.requiredEnhanced === '1') return;
      select.dataset.requiredSupervisor = '1';
      select.required = true;
      const prevLabel = select.previousElementSibling;
      const wrap = document.createElement('div');
      wrap.className = 'required-select-wrap is-required';
      wrap.dataset.requiredWrapper = k;
      const row = document.createElement('div');
      row.className = 'field-label-row';
      if (prevLabel && prevLabel.tagName === 'LABEL') {
        prevLabel.remove();
        row.appendChild(prevLabel);
      } else {
        const label = document.createElement('label');
        label.textContent = 'Pflichtfeld';
        row.appendChild(label);
      }
      row.insertAdjacentHTML('beforeend', requiredBadgeHtml());
      select.parentNode.insertBefore(wrap, select);
      wrap.appendChild(row);
      wrap.appendChild(select);
      select.dataset.requiredEnhanced = '1';
    });
  }

  function showNiceRequiredMessage(message){
    if (typeof window.supervisionConfirm === 'function') {
      // Nur ein mittiger Hinweisdialog; kein Browser-Popup.
      return window.supervisionConfirm(message, 'Pflichtfelder prüfen').catch(() => null);
    }
    alert(message);
    return Promise.resolve();
  }

  function validateRequiredFieldsInPage(){
    const fields = Array.from(document.querySelectorAll('[data-required-supervisor]'));
    if (!fields.length) return true;
    let firstMissing = null;
    fields.forEach(field => {
      const missing = !String(field.value || '').trim();
      const wrap = field.closest('.required-field, .required-select-wrap');
      if (wrap) wrap.classList.toggle('is-missing', missing);
      field.setAttribute('aria-invalid', missing ? 'true' : 'false');
      if (missing && !firstMissing) firstMissing = field;
    });
    if (firstMissing) {
      firstMissing.scrollIntoView({behavior:'smooth', block:'center'});
      setTimeout(() => { try { firstMissing.focus({preventScroll:true}); } catch (_) {} }, 250);
      showNiceRequiredMessage('Bitte fülle zuerst alle markierten Pflichtfelder aus. Diese Angaben werden später in der Ergebnistabelle und in der Präsentation verwendet.');
      return false;
    }
    return true;
  }

  function installRequiredValidation(){
    if (document.body.dataset.role !== 'supervisor' || document.body.dataset.mode !== 'phase') return;
    enhanceRequiredSelects();
    document.addEventListener('input', event => {
      const field = event.target && event.target.closest && event.target.closest('[data-required-supervisor]');
      if (!field) return;
      const wrap = field.closest('.required-field, .required-select-wrap');
      if (wrap) wrap.classList.toggle('is-missing', !String(field.value || '').trim());
      field.setAttribute('aria-invalid', !String(field.value || '').trim() ? 'true' : 'false');
    });
    document.addEventListener('change', event => {
      const field = event.target && event.target.closest && event.target.closest('[data-required-supervisor]');
      if (!field) return;
      const wrap = field.closest('.required-field, .required-select-wrap');
      if (wrap) wrap.classList.toggle('is-missing', !String(field.value || '').trim());
    });
    const next = document.getElementById('nextPhase');
    if (next && !next.dataset.requiredGuardInstalled) {
      next.dataset.requiredGuardInstalled = '1';
      next.addEventListener('click', event => {
        if (!validateRequiredFieldsInPage()) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      }, true);
    }
  }

  function openSummaryPresentationPanelWithNudge(){
    const section = document.getElementById('summaryPresentationSection');
    const panel = document.getElementById('summaryPresentationPanel');
    const toggle = section && section.querySelector('[data-toggle-target="summaryPresentationPanel"]');
    if (!section || !panel) return;
    panel.hidden = false;
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
    section.classList.add('presentation-attention-active');
    if (!section.querySelector('.prep-attention-callout')) {
      const callout = document.createElement('div');
      callout.className = 'prep-attention-callout';
      callout.innerHTML = '<div class="callout-text">Zeit übrig?</div><div class="callout-arrow" aria-hidden="true">➜</div>';
      section.insertBefore(callout, section.firstChild);
    }
    try { section.scrollIntoView({behavior:'smooth', block:'center'}); } catch (_) {}
  }
  window.openSummaryPresentationPanelWithNudge = openSummaryPresentationPanelWithNudge;

  function installSummarySubmitNudge(){
    if (document.body.dataset.mode !== 'summary') return;
    const btn = document.getElementById('submitResults');
    if (!btn || btn.dataset.presentationNudgeInstalled === '1') return;
    btn.dataset.presentationNudgeInstalled = '1';
    btn.addEventListener('click', () => {
      // Der bestehende Absendeprozess bleibt unverändert; der Präsentationsbereich wird danach sichtbar gemacht.
      window.setTimeout(openSummaryPresentationPanelWithNudge, 750);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    window.setTimeout(() => {
      enhanceRequiredSelects();
      installRequiredValidation();
      installSummarySubmitNudge();
    }, 0);
  });
})();

/* GROUP SHARING + PASSWORDLESS DELETE PATCH */
(function(){
  function esc(s){
    if (typeof escapeHtml === 'function') return escapeHtml(s);
    return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }
  function groupIdNow(){
    try { return (typeof getGroupId === 'function') ? getGroupId() : (new URLSearchParams(location.search).get('g') || localStorage.getItem('sv_current_group') || ''); }
    catch(_) { return ''; }
  }
  function groupShareUrl(groupId){
    const base = new URL('gruppe-ergebnis.html', window.location.href);
    base.searchParams.set('g', groupId || groupIdNow());
    return base.toString();
  }
  function qrUrl(url){ return 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' + encodeURIComponent(url); }

  function fetchEntriesFiltered(url, groupId){
    if (!url) return Promise.reject(new Error('Keine Apps-Script-URL eingetragen.'));
    const query = groupId ? '&groupId=' + encodeURIComponent(groupId) : '';
    return new Promise((resolve, reject) => {
      const cb = 'svGroupCallback_' + Date.now() + '_' + Math.floor(Math.random()*100000);
      const script = document.createElement('script');
      let done = false;
      const timer = setTimeout(() => {
        if (done) return;
        done = true; cleanup(); reject(new Error('Verbindung zum Apps Script fehlgeschlagen.'));
      }, 10000);
      function cleanup(){ clearTimeout(timer); try{ delete window[cb]; }catch(_){ window[cb] = undefined; } if(script.parentNode) script.parentNode.removeChild(script); }
      window[cb] = function(response){
        if (done) return;
        done = true; cleanup();
        try { resolve((typeof normalizeResultResponse === 'function') ? normalizeResultResponse(response) : (response && response.entries) || []); }
        catch(e){ reject(e); }
      };
      script.onerror = function(){ if(done) return; done = true; cleanup(); reject(new Error('JSONP-Verbindung fehlgeschlagen.')); };
      script.src = url + '?action=list' + query + '&callback=' + encodeURIComponent(cb) + '&_=' + Date.now();
      document.body.appendChild(script);
    });
  }

  function simpleTable(headers, rows){
    return '<div class="shared-table-wrap"><table class="presentation-table shared-result-table"><thead><tr>' + headers.map(h => '<th>'+esc(h)+'</th>').join('') + '</tr></thead><tbody>' + rows.map(r => '<tr>' + r.map(c => '<td>'+esc(c || '—')+'</td>').join('') + '</tr>').join('') + '</tbody></table></div>';
  }
  function rowTimestamp(row){
    const d = (row && row.data) || {};
    return row.timestamp || d.timestamp || d.timestampLocal || '';
  }
  function renderSharedGroup(row){
    const data = (row && row.data) || {};
    const raw = data.raw || {};
    const merged = Object.assign({}, raw, data);
    ['assignments','p2','p3','p4','p5','p6'].forEach(k => merged[k] = Object.assign({}, raw[k] || {}, data[k] || {}));
    const a = merged.assignments || {};
    const p2 = merged.p2 || {}, p3 = merged.p3 || {}, p4 = merged.p4 || {}, p5 = merged.p5 || {}, p6 = merged.p6 || {};
    const title = row.groupName || merged.groupName || 'Gruppenergebnis';
    const rowNumber = row.rowNumber || row.id || '';
    return `
      <article class="card shared-result-card">
        <div class="shared-result-head">
          <div>
            <h2>${esc(title)}</h2>
            <p class="small">${esc(rowTimestamp(row))}</p>
          </div>
          ${rowNumber ? `<a class="button" href="presentation.html?row=${encodeURIComponent(rowNumber)}">Präsentation starten</a>` : ''}
        </div>
        <details open><summary>Gruppenbeteiligte</summary>${simpleTable(['Rolle','Name'], [
          ['Supervisor*in', a.supervisor || ''], ['Schulleitung', a.schulleitung || ''], ['Lehrkraft A', a['lehrkraft-a'] || a.lehrkraftA || ''], ['Lehrkraft B', a['lehrkraft-b'] || a.lehrkraftB || ''], ['Protokoll', a.protokoll || a.beobachter || '']
        ])}</details>
        <details><summary>Problembeschreibung</summary>${simpleTable(['Rolle','Probleme / Beobachtung','Gefühle','Wünsche'], [
          ['Schulleitung', p2.slProbleme || p2.slProblem || '', p2.slGefuehle || '', p2.slWuensche || ''],
          ['Lehrkraft A', p2.aProbleme || p2.aPerspektive || '', p2.aGefuehle || '', p2.aWuensche || ''],
          ['Lehrkraft B', p2.bProbleme || p2.bPerspektive || '', p2.bGefuehle || '', p2.bWuensche || '']
        ])}</details>
        <details><summary>Zielformulierung</summary>${simpleTable(['Bereich','Eintrag'], [
          ['Ziel Schulleitung', p3.zielSL || ''], ['Ziel Lehrkraft A', p3.zielA || ''], ['Ziel Lehrkraft B', p3.zielB || ''], ['Gemeinsamkeiten', p3.gemeinsamkeiten || ''], ['Gemeinsame Zielvereinbarung', p3.gemeinsamesZiel || p3.gemeinsameZielformulierung || '']
        ])}</details>
        <details><summary>Vertiefte Problembearbeitung</summary>${simpleTable(['Aspekt','Ergebnis'], [
          ['Hilfreiche Kritik', p4.kritik || ''], ['Absprachen zum weiteren Vorgehen', p4.absprachen || p4.weiteresVorgehen || '']
        ])}</details>
        <details><summary>Umsetzung</summary>${simpleTable(['Aspekt','Ergebnis'], [
          ['Zustimmung zur Vereinbarung', p5.zustimmung || ''], ['Einschätzung der Praxistauglichkeit', p6.praxistauglichkeit || p6.einschaetzung || ''], ['Unterstützung durch Schulleitung', p6.unterstuetzung || ''], ['Erste konkrete Umsetzungsschritte', p6.umsetzung || p6.konkreteUmsetzungsschritte || '']
        ])}</details>
      </article>`;
  }

  window.initGroupResultPage = function(){
    if (document.body.dataset.mode !== 'group-result') return;
    if (typeof initCommon === 'function') initCommon();
    const params = new URLSearchParams(location.search);
    const groupId = params.get('g') || groupIdNow();
    const status = document.getElementById('groupResultStatus');
    const content = document.getElementById('groupResultContent');
    const refresh = document.getElementById('refreshGroupResultBtn');
    const url = typeof getAppsScriptUrl === 'function' ? getAppsScriptUrl() : '';

    function loadingCard(){
      return `<section class="card shared-result-card group-result-loading"><h2>Gruppenergebnis wird geladen …</h2><p class="small">Gruppen-ID: <strong>${esc(groupId)}</strong></p></section>`;
    }
    function missingCard(){
      return `<section class="card shared-result-card group-result-missing">
        <h2>Noch kein Ergebnis gespeichert</h2>
        <p>Der Supervisor eurer Gruppe muss die Ergebnisse zuvor speichern. Danach kannst du hier aktualisieren.</p>
        <p class="small">Gruppen-ID: <strong>${esc(groupId)}</strong></p>
        <button type="button" id="groupResultInlineRefresh" class="primary">Aktualisieren</button>
      </section>`;
    }

    async function load(){
      if (status) { status.className = 'notice'; status.textContent = 'Gruppenergebnis wird geladen …'; }
      if (content) content.innerHTML = loadingCard();
      try {
        const rows = await fetchEntriesFiltered(url, groupId);
        if (!rows.length) {
          if (status) { status.className = 'warning'; status.textContent = 'Noch kein Gruppenergebnis gespeichert.'; }
          if (content) {
            content.innerHTML = missingCard();
            const inlineRefresh = document.getElementById('groupResultInlineRefresh');
            if (inlineRefresh) inlineRefresh.onclick = load;
          }
          return;
        }
        const row = rows[rows.length - 1];
        if (status) { status.className = 'success'; status.textContent = 'Gruppenergebnis gefunden.'; }
        if (content) content.innerHTML = renderSharedGroup(row);
      } catch(e) {
        const msg = e && e.message ? e.message : 'Das Gruppenergebnis konnte nicht geladen werden.';
        if (status) { status.className = 'warning'; status.textContent = msg; }
        if (content) {
          content.innerHTML = `<section class="card shared-result-card group-result-missing"><h2>Verbindung fehlgeschlagen</h2><p>${esc(msg)}</p><button type="button" id="groupResultInlineRefresh" class="primary">Erneut versuchen</button></section>`;
          const inlineRefresh = document.getElementById('groupResultInlineRefresh');
          if (inlineRefresh) inlineRefresh.onclick = load;
        }
      }
    }
    if (refresh) refresh.onclick = load;
    load();
  };

  function ensureShareBox(){
    if (document.body.dataset.mode !== 'summary') return null;
    const section = document.querySelector('section.card.highlight');
    if (!section) return null;
    let box = document.getElementById('groupShareBox');
    if (!box) {
      box = document.createElement('div');
      box.id = 'groupShareBox';
      box.className = 'group-share-box';
      box.hidden = true;
      box.innerHTML = `
        <h3>Ergebnis mit Gruppe teilen</h3>
        <p class="small">Dieser Link zeigt nur das Ergebnis dieser Gruppe an. Wenn noch nichts gespeichert wurde, erscheint dort ein Hinweis mit Aktualisieren-Button.</p>
        <div class="share-grid">
          <div>
            <a id="groupShareLink" class="button secondary" href="#" target="_blank" rel="noopener">Gruppenergebnis öffnen</a>
            <button id="copyGroupShareLink" class="secondary" type="button">Link kopieren</button>
          </div>
          <img id="groupShareQr" class="qr share-qr" alt="QR-Code zum Gruppenergebnis">
        </div>`;
      section.appendChild(box);
    }
    const groupId = groupIdNow();
    const link = groupShareUrl(groupId);
    const a = box.querySelector('#groupShareLink');
    const qr = box.querySelector('#groupShareQr');
    const copy = box.querySelector('#copyGroupShareLink');
    if (a) a.href = link;
    if (qr) qr.src = qrUrl(link);
    if (copy && copy.dataset.bound !== '1') {
      copy.dataset.bound = '1';
      copy.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(groupShareUrl(groupIdNow())); copy.textContent = 'Kopiert'; setTimeout(()=>copy.textContent='Link kopieren', 1200); }
        catch(_) { window.prompt('Link kopieren:', groupShareUrl(groupIdNow())); }
      });
    }
    return box;
  }

  const oldSubmit = typeof submitResults === 'function' ? submitResults : null;
  if (oldSubmit) {
    window.submitResults = submitResults = async function(){
      const result = await oldSubmit.apply(this, arguments);
      const box = ensureShareBox();
      if (box) box.hidden = false;
      return result;
    };
  }

  function noPasswordDeleteUrl(url, params){
    const qs = Object.keys(params).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k])).join('&');
    return url + '?' + qs + '&_=' + Date.now();
  }

  window.deleteSingleResult = async function(index){
    if (typeof isGlobalAdminActive === 'function' && !isGlobalAdminActive()) return;
    const row = (typeof resultRowsCache !== 'undefined' && resultRowsCache) ? resultRowsCache[index] : null;
    const url = typeof getAppsScriptUrl === 'function' ? getAppsScriptUrl() : '';
    const status = document.getElementById('resultsStatus');
    if (!row || !url) return;
    const rowNumber = row.rowNumber || row.id;
    const label = row.groupName || (row.data && row.data.groupName) || 'diesen Eintrag';
    const ok = window.supervisionConfirm ? await window.supervisionConfirm(`Eintrag „${label}“ wirklich löschen?`, 'Eintrag löschen', true) : confirm(`Eintrag „${label}“ wirklich löschen?`);
    if (!ok) return;
    try {
      await callAppsScriptJsonp(url, { action:'delete', rowNumber });
      const rows = await fetchResultsWithFallback(url);
      resultRowsCache = rows || [];
      if (typeof currentResultIndex !== 'undefined' && currentResultIndex >= resultRowsCache.length) currentResultIndex = Math.max(0, resultRowsCache.length - 1);
      if (typeof renderResults === 'function') renderResults(resultRowsCache);
      if (status) { status.className = 'success'; status.textContent = 'Eintrag wurde gelöscht.'; }
    } catch(e) {
      const iframe = document.createElement('iframe');
      iframe.style.display='none';
      iframe.src = noPasswordDeleteUrl(url, {action:'delete', rowNumber});
      document.body.appendChild(iframe);
      setTimeout(async()=>{
        try { const rows = await fetchResultsWithFallback(url); resultRowsCache = rows || []; if (typeof renderResults === 'function') renderResults(resultRowsCache); if(status){status.className='success';status.textContent='Löschbefehl wurde gesendet.';} } catch(_) {}
        iframe.remove();
      }, 1200);
    }
  };

  window.deleteAllResults = async function(){
    if (typeof isGlobalAdminActive === 'function' && !isGlobalAdminActive()) return;
    const url = typeof getAppsScriptUrl === 'function' ? getAppsScriptUrl() : '';
    const status = document.getElementById('resultsStatus');
    const ok = window.supervisionConfirm ? await window.supervisionConfirm('Wirklich alle Gruppenergebnisse aus dem Google Sheet löschen?', 'Alle Gruppenergebnisse löschen', true) : confirm('Wirklich alle Gruppenergebnisse löschen?');
    if (!ok || !url) return;
    try {
      await callAppsScriptJsonp(url, { action:'deleteall' });
      resultRowsCache = [];
      if (typeof renderResults === 'function') renderResults([]);
      if (status) { status.className = 'success'; status.textContent = 'Alle Ergebnisse wurden gelöscht.'; }
    } catch(e) {
      const iframe = document.createElement('iframe');
      iframe.style.display='none';
      iframe.src = noPasswordDeleteUrl(url, {action:'deleteall'});
      document.body.appendChild(iframe);
      setTimeout(async()=>{
        try { const rows = await fetchResultsWithFallback(url); resultRowsCache = rows || []; if (typeof renderResults === 'function') renderResults(resultRowsCache); if(status){status.className=resultRowsCache.length?'warning':'success';status.textContent=resultRowsCache.length?'Löschbefehl gesendet, aber es sind noch Einträge vorhanden.':'Alle Ergebnisse wurden gelöscht.';} } catch(_) {}
        iframe.remove();
      }, 1200);
    }
  };

  // Präsentation auch direkt per Gruppen-ID öffnen können.
  const oldInitPresentation = typeof initPresentationFinal === 'function' ? initPresentationFinal : null;
  if (oldInitPresentation) {
    window.initPresentationFinal = initPresentationFinal = function(){
      const params = new URLSearchParams(window.location.search);
      const groupParam = params.get('g') || params.get('groupId');
      if (!groupParam) return oldInitPresentation();
      const status = document.getElementById('presentationStatus');
      const url = typeof getAppsScriptUrl === 'function' ? getAppsScriptUrl() : '';
      const exit = document.getElementById('presentationExitBtn');
      const full = document.getElementById('presentationFullscreenBtn');
      const prev = document.getElementById('presentationPrevBtn');
      const next = document.getElementById('presentationNextBtn');
      if (exit) exit.onclick = () => window.location.href = 'gruppe-ergebnis.html?g=' + encodeURIComponent(groupParam);
      if (full) full.onclick = () => { const root=document.documentElement; if(!document.fullscreenElement && root.requestFullscreen) root.requestFullscreen(); else if(document.exitFullscreen) document.exitFullscreen(); };
      if (prev) prev.onclick = () => movePresentationFinal(-1);
      if (next) next.onclick = () => movePresentationFinal(1);
      document.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); movePresentationFinal(1); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); movePresentationFinal(-1); }
        if (e.key === 'Escape') { window.location.href = 'gruppe-ergebnis.html?g=' + encodeURIComponent(groupParam); }
      });
      if (!url) { if(status) status.textContent='Keine Apps-Script-URL gefunden.'; return; }
      fetchEntriesFiltered(url, groupParam).then(rows => {
        if (!rows.length) throw new Error('Der Supervisor eurer Gruppe muss die Ergebnisse zuvor speichern.');
        const row = rows[rows.length - 1];
        presentationSlidesFinal = buildPresentationSlides(row);
        presentationIndexFinal = 0;
        if (status) status.hidden = true;
        renderPresentationSlideFinal();
      }).catch(err => {
        if (status) { status.className='presentation-status warning'; status.textContent=err.message || 'Präsentation konnte nicht geladen werden.'; }
      });
    };
  }

  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      ensureShareBox();
      if (document.body.dataset.mode === 'group-result') window.initGroupResultPage();
    }, 0);
  });
})();
try { if (window.deleteAllResults) deleteAllResults = window.deleteAllResults; } catch (_) {}
try { if (window.deleteSingleResult) deleteSingleResult = window.deleteSingleResult; } catch (_) {}
(function(){
  function installManualShareButton(){
    if (document.body.dataset.mode !== 'summary') return;
    const row = document.querySelector('#submitResults') && document.querySelector('#submitResults').closest('.nav-row');
    if (!row || document.getElementById('showGroupShareBoxBtn')) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'showGroupShareBoxBtn';
    btn.className = 'secondary';
    btn.textContent = 'Ergebnis mit Gruppe teilen';
    btn.addEventListener('click', () => {
      const box = document.getElementById('groupShareBox') || (typeof ensureShareBox === 'function' ? ensureShareBox() : null);
      // ensureShareBox ist im Patch gekapselt; falls nicht direkt verfügbar, simuliert ein Klick auf Absenden nicht nötig.
      if (box) { box.hidden = false; box.scrollIntoView({behavior:'smooth', block:'center'}); }
      else {
        const groupId = (typeof getGroupId === 'function') ? getGroupId() : (new URLSearchParams(location.search).get('g') || '');
        const link = new URL('gruppe-ergebnis.html', location.href); link.searchParams.set('g', groupId);
        window.open(link.toString(), '_blank');
      }
    });
    row.appendChild(btn);
  }
  document.addEventListener('DOMContentLoaded', () => setTimeout(installManualShareButton, 30));
})();

/* ------------------------------------------------------------
   MOBILE PRESENTATION + COLLAPSIBLE TOP BAR PATCH
   ------------------------------------------------------------ */
(function(){
  const TOPBAR_COLLAPSED_KEY = 'sv_topbar_collapsed_v2';
  const TOPBAR_HINT_SEEN_KEY = 'sv_topbar_hint_seen_v2';

  function safeConfirm(message, title, danger){
    if (window.supervisionConfirm) return window.supervisionConfirm(message, title, danger);
    return Promise.resolve(confirm(message));
  }

  function setTopbarCollapsed(collapsed){
    const bar = document.querySelector('.local-reset-bar');
    if (!bar) return;
    bar.classList.toggle('is-collapsed', !!collapsed);
    localStorage.setItem(TOPBAR_COLLAPSED_KEY, collapsed ? '1' : '0');
    const toggle = bar.querySelector('#topbarCollapseToggle');
    if (toggle) {
      toggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      toggle.innerHTML = collapsed ? '<span>Ausklappen</span><span class="topbar-toggle-arrow">↓</span>' : '<span>Einklappen</span><span class="topbar-toggle-arrow">↑</span>';
      toggle.title = collapsed ? 'Leiste aufklappen' : 'Leiste einklappen';
      toggle.classList.remove('is-glowing');
    }
    localStorage.setItem(TOPBAR_HINT_SEEN_KEY, '1');
  }

  window.installLocalResetControls = function(){
    const header = document.querySelector('header');
    if (!header) return;
    let bar = document.querySelector('.local-reset-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'local-reset-bar topbar-collapsible-shell';
      header.insertAdjacentElement('afterend', bar);
    }

    const collapsed = localStorage.getItem(TOPBAR_COLLAPSED_KEY) === '1';
    const hintSeen = localStorage.getItem(TOPBAR_HINT_SEEN_KEY) === '1';
    bar.innerHTML = `
      <div class="wrap local-reset-inner admin-reset-inner topbar-collapsible-content">
        <button type="button" class="secondary small-reset back-nav-button" id="localBackBtn">Zurück</button>
        <a class="button secondary small-reset start-nav-button" href="index.html">Zurück zum Start</a>
        <button type="button" class="admin-status-button" id="globalAdminStatusBtn" data-admin-status-button>Admin-Modus deaktiviert</button>
        <button type="button" class="secondary small-reset" id="clearPageBtn">Aktuelle Seite leeren</button>
        <button type="button" class="secondary small-reset" id="clearAllLocalBtn">Seite zurücksetzen</button>
        <span id="pageResetStatus" class="local-reset-status" aria-live="polite"></span>
      </div>
      <button type="button" id="topbarCollapseToggle" class="topbar-collapse-toggle${hintSeen ? '' : ' is-glowing'}" aria-label="Bedienleiste ein- oder ausklappen" aria-expanded="${collapsed ? 'false' : 'true'}">${collapsed ? '<span>Ausklappen</span><span class="topbar-toggle-arrow">↓</span>' : '<span>Einklappen</span><span class="topbar-toggle-arrow">↑</span>'}</button>
    `;
    bar.classList.toggle('is-collapsed', collapsed);

    const back = document.getElementById('localBackBtn');
    const statusBtn = document.getElementById('globalAdminStatusBtn');
    const clearPageBtn = document.getElementById('clearPageBtn');
    const clearAllBtn = document.getElementById('clearAllLocalBtn');
    const toggle = document.getElementById('topbarCollapseToggle');

    if (back) back.onclick = () => { if (history.length > 1) history.back(); else location.href = 'index.html'; };
    if (statusBtn) statusBtn.onclick = typeof handleGlobalAdminClick === 'function' ? handleGlobalAdminClick : undefined;
    if (clearPageBtn) clearPageBtn.onclick = async () => { if (await safeConfirm('Lokale Eingaben auf der aktuellen Seite leeren?', 'Aktuelle Seite leeren')) clearCurrentPageInputs(); };
    if (clearAllBtn) clearAllBtn.onclick = async () => { if (!(await safeConfirm('Alle lokal gespeicherten Arbeitsdaten dieser Website löschen? Google-Sheet-Ergebnisse bleiben erhalten.', 'Seite zurücksetzen', true))) return; clearAllLocalSupervisionData({ silent: true }); location.href = 'index.html'; };
    if (toggle) toggle.onclick = () => setTopbarCollapsed(!bar.classList.contains('is-collapsed'));
    if (typeof updateGlobalAdminUi === 'function') updateGlobalAdminUi();
  };

  function isLikelyPhoneOrTablet(){
    return window.matchMedia('(max-width: 980px), (pointer: coarse)').matches;
  }

  function addOrientationHint(){
    if (document.body.dataset.mode !== 'presentation') return;
    if (!isLikelyPhoneOrTablet()) return;
    if (document.getElementById('presentationOrientationHint')) return;
    const hint = document.createElement('div');
    hint.id = 'presentationOrientationHint';
    hint.className = 'presentation-orientation-hint';
    hint.innerHTML = `
      <div class="presentation-orientation-card">
        <strong>Quermodus empfohlen</strong>
        <p>Für die Präsentation das Smartphone quer halten. Der Button versucht zusätzlich, Vollbild und Quermodus zu aktivieren.</p>
        <button type="button" id="presentationLandscapeStart">Quermodus starten</button>
      </div>
    `;
    document.body.appendChild(hint);
    const btn = document.getElementById('presentationLandscapeStart');
    if (btn) btn.addEventListener('click', async () => {
      await requestPresentationLandscape();
      updateOrientationHintVisibility();
    });
    updateOrientationHintVisibility();
  }

  function updateOrientationHintVisibility(){
    const hint = document.getElementById('presentationOrientationHint');
    if (!hint) return;
    const portrait = window.matchMedia('(orientation: portrait)').matches;
    const small = isLikelyPhoneOrTablet();
    hint.hidden = !(small && portrait);
  }

  async function requestPresentationLandscape(){
    try {
      const shell = document.querySelector('.presentation-shell') || document.documentElement;
      if (!document.fullscreenElement && shell.requestFullscreen) {
        await shell.requestFullscreen().catch(()=>{});
      }
      if (screen.orientation && screen.orientation.lock) {
        await screen.orientation.lock('landscape').catch(()=>{});
      }
    } catch (_) {}
  }

  function enhancePresentationMobile(){
    if (document.body.dataset.mode !== 'presentation') return;
    document.body.classList.add('presentation-mobile-ready');
    addOrientationHint();
    const full = document.getElementById('presentationFullscreenBtn');
    if (full && !full.dataset.mobileEnhanced) {
      full.dataset.mobileEnhanced = '1';
      const previous = full.onclick;
      full.onclick = async (event) => {
        if (isLikelyPhoneOrTablet()) {
          event && event.preventDefault && event.preventDefault();
          await requestPresentationLandscape();
          updateOrientationHintVisibility();
        } else if (typeof previous === 'function') {
          previous.call(full, event);
        } else {
          const root = document.documentElement;
          if (!document.fullscreenElement && root.requestFullscreen) root.requestFullscreen();
          else if (document.exitFullscreen) document.exitFullscreen();
        }
      };
    }
    window.addEventListener('orientationchange', () => setTimeout(updateOrientationHintVisibility, 250));
    window.addEventListener('resize', () => setTimeout(updateOrientationHintVisibility, 120));
    // Best effort: browsers may block this without a user gesture, but it works where allowed.
    setTimeout(() => { if (isLikelyPhoneOrTablet()) requestPresentationLandscape().then(updateOrientationHintVisibility); }, 600);
  }

  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      if (typeof window.installLocalResetControls === 'function') window.installLocalResetControls();
      enhancePresentationMobile();
    }, 50);
  });
})();

/* ------------------------------------------------------------
   MOBILE PRESENTATION LOADER + LANDSCAPE PATCH v2
   ------------------------------------------------------------ */
(function(){
  function isPresentationPage(){ return document.body && document.body.dataset && document.body.dataset.mode === 'presentation'; }
  function isMobileLike(){ return window.matchMedia('(max-width: 980px), (pointer: coarse)').matches; }
  function isPortrait(){ return window.matchMedia('(orientation: portrait)').matches; }

  function ensurePresentationLoadingOverlay(){
    if (!isPresentationPage()) return null;
    let overlay = document.getElementById('presentationLoadingOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'presentationLoadingOverlay';
      overlay.className = 'presentation-loading-overlay';
      overlay.innerHTML = '<div class="presentation-loading-card"><strong>Präsentation wird geladen</strong><p>Die Folien werden vorbereitet und an das Gerät angepasst.</p><div class="presentation-progress" aria-hidden="true"><span></span></div></div>';
      document.body.appendChild(overlay);
    }
    return overlay;
  }

  function hidePresentationLoadingOverlay(){
    const overlay = document.getElementById('presentationLoadingOverlay');
    if (!overlay) return;
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    setTimeout(() => overlay.remove(), 280);
  }

  function ensurePortraitOverlay(){
    if (!isPresentationPage() || !isMobileLike()) return null;
    let overlay = document.getElementById('presentationPortraitOverlayV2');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'presentationPortraitOverlayV2';
      overlay.className = 'presentation-portrait-overlay';
      overlay.innerHTML = '<div class="presentation-portrait-card"><div class="presentation-portrait-icon">↻</div><strong>Bitte das Smartphone quer halten</strong><p>Die Präsentation ist für das Querformat optimiert. Drehe dein Gerät, damit die Folien vollständig und lesbar angezeigt werden.</p><button type="button" id="presentationTryLandscapeBtn">Vollbild / Quermodus versuchen</button></div>';
      document.body.appendChild(overlay);
      const btn = document.getElementById('presentationTryLandscapeBtn');
      if (btn) btn.addEventListener('click', requestLandscapeMode);
    }
    return overlay;
  }

  function updatePortraitOverlay(){
    if (!isPresentationPage()) return;
    const overlay = ensurePortraitOverlay();
    if (!overlay) return;
    overlay.hidden = !(isMobileLike() && isPortrait());
  }

  async function requestLandscapeMode(){
    try {
      const root = document.documentElement;
      if (!document.fullscreenElement && root.requestFullscreen) {
        await root.requestFullscreen().catch(function(){});
      }
      if (screen.orientation && screen.orientation.lock) {
        await screen.orientation.lock('landscape').catch(function(){});
      }
    } catch (_) {}
    setTimeout(updatePortraitOverlay, 160);
  }

  function ensureSideNavigation(){
    if (!isPresentationPage()) return;
    if (!document.getElementById('presentationSidePrev')) {
      const prev = document.createElement('button');
      prev.id = 'presentationSidePrev';
      prev.type = 'button';
      prev.className = 'presentation-mobile-side-nav';
      prev.setAttribute('aria-label', 'Vorherige Folie');
      prev.textContent = '←';
      prev.addEventListener('click', function(e){ e.preventDefault(); if (typeof movePresentationFinal === 'function') movePresentationFinal(-1); });
      document.body.appendChild(prev);
    }
    if (!document.getElementById('presentationSideNext')) {
      const next = document.createElement('button');
      next.id = 'presentationSideNext';
      next.type = 'button';
      next.className = 'presentation-mobile-side-nav';
      next.setAttribute('aria-label', 'Nächste Folie');
      next.textContent = '→';
      next.addEventListener('click', function(e){ e.preventDefault(); if (typeof movePresentationFinal === 'function') movePresentationFinal(1); });
      document.body.appendChild(next);
    }
  }

  function markLoadedWhenSlideReady(){
    if (!isPresentationPage()) return;
    const started = Date.now();
    const finish = function(){
      const minDelay = Math.max(0, 650 - (Date.now() - started));
      setTimeout(function(){ hidePresentationLoadingOverlay(); updatePortraitOverlay(); }, minDelay);
    };
    const slide = document.getElementById('presentationSlide');
    if (slide && slide.querySelector('.presentation-slide-inner')) { finish(); return; }
    const observer = new MutationObserver(function(){
      const s = document.getElementById('presentationSlide');
      if (s && s.querySelector('.presentation-slide-inner')) {
        observer.disconnect();
        finish();
      }
    });
    if (slide) observer.observe(slide, { childList:true, subtree:true });
    setTimeout(function(){ observer.disconnect(); finish(); }, 3600);
  }

  function patchPresentationRenderForMobile(){
    if (!isPresentationPage()) return;
    if (window.__presentationMobileRenderPatchV2) return;
    window.__presentationMobileRenderPatchV2 = true;
    const original = window.renderPresentationSlideFinal;
    if (typeof original !== 'function') return;
    window.renderPresentationSlideFinal = renderPresentationSlideFinal = function(){
      original.apply(this, arguments);
      document.body.classList.add('presentation-mobile-v2');
      ensureSideNavigation();
      updatePortraitOverlay();
      const slide = document.getElementById('presentationSlide');
      if (slide) {
        slide.style.removeProperty('transform');
        slide.style.removeProperty('left');
        slide.style.removeProperty('top');
      }
    };
  }

  function initMobilePresentationV2(){
    if (!isPresentationPage()) return;
    document.body.classList.add('presentation-mobile-v2');
    ensurePresentationLoadingOverlay();
    ensurePortraitOverlay();
    ensureSideNavigation();
    patchPresentationRenderForMobile();
    const full = document.getElementById('presentationFullscreenBtn');
    if (full && !full.dataset.landscapeV2) {
      full.dataset.landscapeV2 = '1';
      full.addEventListener('click', function(){ setTimeout(requestLandscapeMode, 0); }, true);
    }
    window.addEventListener('resize', function(){ setTimeout(updatePortraitOverlay, 120); });
    window.addEventListener('orientationchange', function(){ setTimeout(updatePortraitOverlay, 260); });
    document.addEventListener('fullscreenchange', function(){ setTimeout(updatePortraitOverlay, 120); });
    markLoadedWhenSlideReady();
    setTimeout(function(){ if (isMobileLike()) requestLandscapeMode(); }, 850);
  }

  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(initMobilePresentationV2, 5);
    setTimeout(initMobilePresentationV2, 300);
  });
})();


/* ------------------------------------------------------------
   PATCH: group sharing without presentation button + ordered topbar
   ------------------------------------------------------------ */
(function(){
  const TOPBAR_COLLAPSED_KEY_PATCH = 'sv_topbar_collapsed_v3_ordered';
  const TOPBAR_HINT_SEEN_KEY_PATCH = 'sv_topbar_hint_seen_v3_ordered';
  function escPatch(s){
    if (typeof escapeHtml === 'function') return escapeHtml(s);
    return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }
  function addRoleThemeClass(){
    const role = document.body && document.body.dataset ? (document.body.dataset.role || '') : '';
    if (!role) return;
    document.body.classList.add('role-theme-' + role);
    if (role.indexOf('lehrkraft') === 0) document.body.classList.add('role-theme-lehrkraft');
  }
  function safeConfirmPatch(message, title, danger){
    if (window.supervisionConfirm) return window.supervisionConfirm(message, title, danger);
    return Promise.resolve(confirm(message));
  }
  function setCollapseUi(bar, collapsed){
    if (!bar) return;
    bar.classList.toggle('is-collapsed', !!collapsed);
    localStorage.setItem(TOPBAR_COLLAPSED_KEY_PATCH, collapsed ? '1' : '0');
    const html = collapsed ? '<span>Ausklappen</span><span class="topbar-toggle-arrow">↓</span>' : '<span>Einklappen</span><span class="topbar-toggle-arrow">↑</span>';
    bar.querySelectorAll('[data-topbar-collapse-toggle]').forEach(btn => {
      btn.innerHTML = html;
      btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      btn.classList.remove('is-glowing');
    });
    localStorage.setItem(TOPBAR_HINT_SEEN_KEY_PATCH, '1');
  }
  window.installLocalResetControls = function(){
    const header = document.querySelector('header');
    if (!header) return;
    let bar = document.querySelector('.local-reset-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'local-reset-bar topbar-collapsible-shell';
      header.insertAdjacentElement('afterend', bar);
    }
    bar.className = 'local-reset-bar topbar-collapsible-shell';
    const collapsed = localStorage.getItem(TOPBAR_COLLAPSED_KEY_PATCH) === '1';
    const hintSeen = localStorage.getItem(TOPBAR_HINT_SEEN_KEY_PATCH) === '1';
    const toggleLabel = collapsed ? '<span>Ausklappen</span><span class="topbar-toggle-arrow">↓</span>' : '<span>Einklappen</span><span class="topbar-toggle-arrow">↑</span>';
    bar.innerHTML = `
      <div class="wrap local-reset-inner admin-reset-inner topbar-collapsible-content">
        <div class="topbar-nav-left">
          <a class="button secondary small-reset start-nav-button" href="index.html">Zurück zum Start</a>
          <button type="button" class="secondary small-reset back-nav-button" id="localBackBtn">Zurück</button>
          <span class="topbar-separator" aria-hidden="true"></span>
          <button type="button" class="secondary small-reset" id="clearPageBtn">Aktuelle Seite leeren</button>
          <button type="button" class="secondary small-reset" id="clearAllLocalBtn">Seite zurücksetzen</button>
        </div>
        <div class="topbar-nav-right">
          <button type="button" id="topbarCollapseInline" class="topbar-collapse-toggle inline-collapse-toggle${hintSeen ? '' : ' is-glowing'}" data-topbar-collapse-toggle aria-label="Bedienleiste ein- oder ausklappen" aria-expanded="${collapsed ? 'false' : 'true'}">${toggleLabel}</button>
          <button type="button" class="admin-status-button" id="globalAdminStatusBtn" data-admin-status-button>Admin-Modus deaktiviert</button>
        </div>
        <span id="pageResetStatus" class="local-reset-status" aria-live="polite"></span>
      </div>
      <button type="button" id="topbarCollapseToggle" class="topbar-collapse-toggle edge-collapse-toggle${hintSeen ? '' : ' is-glowing'}" data-topbar-collapse-toggle aria-label="Bedienleiste ein- oder ausklappen" aria-expanded="${collapsed ? 'false' : 'true'}">${toggleLabel}</button>`;
    bar.classList.toggle('is-collapsed', collapsed);
    const back = document.getElementById('localBackBtn');
    const statusBtn = document.getElementById('globalAdminStatusBtn');
    const clearPageBtn = document.getElementById('clearPageBtn');
    const clearAllBtn = document.getElementById('clearAllLocalBtn');
    if (back) back.onclick = () => { if (history.length > 1) history.back(); else location.href = 'index.html'; };
    if (statusBtn) statusBtn.onclick = typeof handleGlobalAdminClick === 'function' ? handleGlobalAdminClick : undefined;
    if (clearPageBtn) clearPageBtn.onclick = async () => { if (await safeConfirmPatch('Lokale Eingaben auf der aktuellen Seite leeren?', 'Aktuelle Seite leeren')) clearCurrentPageInputs(); };
    if (clearAllBtn) clearAllBtn.onclick = async () => { if (!(await safeConfirmPatch('Alle lokal gespeicherten Arbeitsdaten dieser Website löschen? Google-Sheet-Ergebnisse bleiben erhalten.', 'Seite zurücksetzen', true))) return; clearAllLocalSupervisionData({ silent: true }); location.href = 'index.html'; };
    bar.querySelectorAll('[data-topbar-collapse-toggle]').forEach(btn => {
      btn.onclick = () => setCollapseUi(bar, !bar.classList.contains('is-collapsed'));
    });
    if (typeof updateGlobalAdminUi === 'function') updateGlobalAdminUi();
  };
  try { installLocalResetControls = window.installLocalResetControls; } catch(_) {}

  function getGroupIdPatch(){
    try { return (typeof getGroupId === 'function') ? getGroupId() : (new URLSearchParams(location.search).get('g') || localStorage.getItem('sv_current_group') || ''); }
    catch(_) { return ''; }
  }
  function getAppsUrlPatch(){ return (typeof getAppsScriptUrl === 'function') ? getAppsScriptUrl() : (window.APP_SCRIPT_URL || window.APPS_SCRIPT_URL || ''); }
  function jsonpListPatch(url, groupId){
    return new Promise((resolve, reject) => {
      if (!url) { reject(new Error('Keine Apps-Script-URL eingetragen.')); return; }
      const cb = 'svGroupOnlyCb_' + Date.now() + '_' + Math.floor(Math.random()*100000);
      const script = document.createElement('script');
      let done = false;
      const timer = setTimeout(() => { if(done) return; done = true; cleanup(); reject(new Error('Verbindung zum Apps Script fehlgeschlagen.')); }, 11000);
      function cleanup(){ clearTimeout(timer); try{ delete window[cb]; }catch(_){ window[cb] = undefined; } if(script.parentNode) script.parentNode.removeChild(script); }
      window[cb] = function(response){ if(done) return; done = true; cleanup(); if(response && response.ok === false) reject(new Error(response.error || 'Apps Script meldet einen Fehler.')); else resolve((response && response.entries) || []); };
      script.onerror = function(){ if(done) return; done = true; cleanup(); reject(new Error('JSONP-Verbindung fehlgeschlagen.')); };
      const qs = '?action=list&groupId=' + encodeURIComponent(groupId || '') + '&callback=' + encodeURIComponent(cb) + '&_=' + Date.now();
      script.src = url + qs;
      document.body.appendChild(script);
    });
  }
  function simpleTablePatch(headers, rows){
    return '<div class="shared-table-wrap"><table class="presentation-table shared-result-table"><thead><tr>' + headers.map(h => '<th>'+escPatch(h)+'</th>').join('') + '</tr></thead><tbody>' + rows.map(r => '<tr>' + r.map(c => '<td>'+escPatch(c || '—')+'</td>').join('') + '</tr>').join('') + '</tbody></table></div>';
  }
  function renderSharedGroupNoPresentation(row){
    const data = (row && row.data) || {};
    const raw = data.raw || {};
    const merged = Object.assign({}, raw, data);
    ['assignments','p2','p3','p4','p5','p6'].forEach(k => merged[k] = Object.assign({}, raw[k] || {}, data[k] || {}));
    const a = merged.assignments || {};
    const p2 = merged.p2 || {}, p3 = merged.p3 || {}, p4 = merged.p4 || {}, p5 = merged.p5 || {}, p6 = merged.p6 || {};
    const title = row.groupName || merged.groupName || 'Gruppenergebnis';
    const ts = row.timestamp || data.timestamp || '';
    return `<article class="card shared-result-card">
      <div class="shared-result-head"><div><h2>${escPatch(title)}</h2><p class="small">${escPatch(ts)}</p></div></div>
      <details open><summary>Gruppenbeteiligte</summary>${simpleTablePatch(['Rolle','Name'], [
        ['Supervisor*in', a.supervisor || ''], ['Schulleitung', a.schulleitung || ''], ['Lehrkraft A', a['lehrkraft-a'] || a.lehrkraftA || ''], ['Lehrkraft B', a['lehrkraft-b'] || a.lehrkraftB || ''], ['Protokoll', a.protokoll || a.beobachter || '']
      ])}</details>
      <details><summary>Problembeschreibung</summary>${simpleTablePatch(['Rolle','Probleme / Beobachtung','Gefühle','Wünsche'], [
        ['Schulleitung', p2.slProbleme || p2.slProblem || '', p2.slGefuehle || '', p2.slWuensche || ''],
        ['Lehrkraft A', p2.aProbleme || p2.aPerspektive || '', p2.aGefuehle || '', p2.aWuensche || ''],
        ['Lehrkraft B', p2.bProbleme || p2.bPerspektive || '', p2.bGefuehle || '', p2.bWuensche || '']
      ])}</details>
      <details><summary>Zielformulierung</summary>${simpleTablePatch(['Bereich','Eintrag'], [
        ['Ziel Schulleitung', p3.zielSL || ''], ['Ziel Lehrkraft A', p3.zielA || ''], ['Ziel Lehrkraft B', p3.zielB || ''], ['Gemeinsamkeiten', p3.gemeinsamkeiten || ''], ['Gemeinsame Zielvereinbarung', p3.gemeinsamesZiel || p3.gemeinsameZielformulierung || '']
      ])}</details>
      <details><summary>Vertiefte Problembearbeitung</summary>${simpleTablePatch(['Aspekt','Ergebnis'], [
        ['Hilfreiche Kritik', p4.kritik || ''], ['Absprachen zum weiteren Vorgehen', p4.absprachen || p4.weiteresVorgehen || '']
      ])}</details>
      <details><summary>Umsetzung</summary>${simpleTablePatch(['Aspekt','Ergebnis'], [
        ['Zustimmung zur Vereinbarung', p5.zustimmung || ''], ['Einschätzung der Praxistauglichkeit', p6.praxistauglichkeit || p6.einschaetzung || ''], ['Unterstützung durch Schulleitung', p6.unterstuetzung || ''], ['Erste konkrete Umsetzungsschritte', p6.umsetzung || p6.konkreteUmsetzungsschritte || '']
      ])}</details>
    </article>`;
  }
  window.initGroupResultPage = function(){
    if (document.body.dataset.mode !== 'group-result') return;
    if (typeof initCommon === 'function') initCommon();
    const params = new URLSearchParams(location.search);
    const groupId = params.get('g') || getGroupIdPatch();
    const content = document.getElementById('groupResultContent');
    const status = document.getElementById('groupResultStatus');
    const refresh = document.getElementById('refreshGroupResultBtn');
    const url = getAppsUrlPatch();
    function loading(){ return `<section class="card shared-result-card group-result-loading"><h2>Gruppenergebnis wird geladen …</h2><p class="small">Gruppen-ID: <strong>${escPatch(groupId)}</strong></p></section>`; }
    function missing(){ return `<section class="card shared-result-card group-result-missing"><h2>Noch kein Ergebnis gespeichert</h2><p>Der Supervisor eurer Gruppe muss die Ergebnisse zuvor speichern. Danach kannst du hier aktualisieren.</p><p class="small">Gruppen-ID: <strong>${escPatch(groupId)}</strong></p><button type="button" id="groupResultInlineRefresh" class="primary">Aktualisieren</button></section>`; }
    async function load(){
      if(status) status.textContent = 'Gruppenergebnis wird geladen …';
      if(content) content.innerHTML = loading();
      try {
        const rows = await jsonpListPatch(url, groupId);
        if(!rows.length){ if(status) status.textContent = 'Noch kein Gruppenergebnis gespeichert.'; if(content){ content.innerHTML = missing(); const b=document.getElementById('groupResultInlineRefresh'); if(b) b.onclick = load; } return; }
        const row = rows[rows.length-1];
        if(status) status.textContent = 'Gruppenergebnis gefunden.';
        if(content) content.innerHTML = renderSharedGroupNoPresentation(row);
      } catch(e){
        const msg = e && e.message ? e.message : 'Das Gruppenergebnis konnte nicht geladen werden.';
        if(status) status.textContent = msg;
        if(content){ content.innerHTML = `<section class="card shared-result-card group-result-missing"><h2>Verbindung fehlgeschlagen</h2><p>${escPatch(msg)}</p><button type="button" id="groupResultInlineRefresh" class="primary">Erneut versuchen</button></section>`; const b=document.getElementById('groupResultInlineRefresh'); if(b) b.onclick = load; }
      }
    }
    if(refresh) refresh.onclick = load;
    load();
  };
  document.addEventListener('DOMContentLoaded', () => {
    addRoleThemeClass();
    if (document.body.dataset.mode === 'group-result') setTimeout(() => window.initGroupResultPage(), 1);
  });
})();



/* ==========================================================
   FINAL ARCHITECTURE PATCH: gruppenweite Präsentationssynchronisierung
   - sammelt alle Präsentations-/Editor-Einstellungen in presentationConfig
   - speichert diese mit dem Gruppenergebnis im Google Sheet
   - lädt sie bei Ergebnis-/Präsentationsseiten aus dem Rohdaten-JSON wieder
   - nutzt weiterhin lokale Daten als Fallback, wenn noch nichts geteilt wurde
   ========================================================== */
(function(){
  const SYNC_VERSION = '2026-06-group-presentation-sync-v1';
  const PRESENTATION_SYNC_KEYS = [
    'presentation_settings',
    'presentation_extras',
    'presentation_layout',
    'presentation_layout_stable_v2',
    'presentation_stickers_v1',
    'presentation_text_overrides',
    'presentation_default_snapshot',
    'presentation_theme',
    'presentation_patterns'
  ];

  function safeParse(value, fallback){
    try { return value ? JSON.parse(value) : fallback; } catch(_) { return fallback; }
  }

  function scopedKey(name){
    try { return (typeof key === 'function') ? key(name) : ('sv_' + (typeof getGroupId === 'function' ? getGroupId() : 'gruppe') + '_' + name); }
    catch(_) { return 'sv_' + name; }
  }

  function readScoped(name, fallback){
    try {
      if (typeof loadObj === 'function') return loadObj(name, fallback);
      return safeParse(localStorage.getItem(scopedKey(name)), fallback);
    } catch(_) { return fallback; }
  }

  function writeScoped(name, value){
    try {
      if (typeof saveObj === 'function') saveObj(name, value);
      else localStorage.setItem(scopedKey(name), JSON.stringify(value));
    } catch(_) {}
  }

  function removeScoped(name){
    try {
      if (typeof key === 'function') localStorage.removeItem(key(name));
      localStorage.removeItem('sv_' + name);
      localStorage.removeItem(name);
    } catch(_) {}
  }

  function collectScopedRaw(){
    const raw = {};
    try {
      const prefix = (typeof key === 'function') ? key('').replace(/_$/, '_') : '';
      Object.keys(localStorage).forEach(k => {
        const isScoped = prefix && k.indexOf(prefix) === 0;
        const isRelevant = /presentation|sticker|layout/i.test(k);
        if (!isRelevant || (!isScoped && !/^sv_/.test(k))) return;
        const shortName = isScoped ? k.slice(prefix.length) : k;
        const value = localStorage.getItem(k);
        raw[shortName] = safeParse(value, value);
      });
    } catch(_) {}
    return raw;
  }

  window.collectPresentationSyncConfig = function(){
    const settings = (typeof getPresentationSettingsFinal === 'function') ? getPresentationSettingsFinal() : readScoped('presentation_settings', {});
    const extras = (typeof getPresentationExtrasFinal === 'function') ? getPresentationExtrasFinal() : readScoped('presentation_extras', []);
    const stickers = readScoped('presentation_stickers_v1', []);
    const stableLayout = readScoped('presentation_layout_stable_v2', {});
    const layout = readScoped('presentation_layout', {});
    const textOverrides = readScoped('presentation_text_overrides', {});
    const defaultSnapshot = readScoped('presentation_default_snapshot', null);

    return {
      version: SYNC_VERSION,
      savedAt: new Date().toISOString(),
      groupId: (typeof getGroupId === 'function') ? getGroupId() : '',
      settings: settings || {},
      extras: Array.isArray(extras) ? extras : [],
      stickers: Array.isArray(stickers) ? stickers : [],
      stableLayout: stableLayout && typeof stableLayout === 'object' ? stableLayout : {},
      layout: layout && typeof layout === 'object' ? layout : {},
      textOverrides: textOverrides && typeof textOverrides === 'object' ? textOverrides : {},
      defaultSnapshot: defaultSnapshot || null,
      rawLocalPresentationState: collectScopedRaw()
    };
  };

  window.applyPresentationSyncConfig = function(config){
    if (!config || typeof config !== 'object') return;
    if (config.settings) writeScoped('presentation_settings', config.settings);
    if (Array.isArray(config.extras)) writeScoped('presentation_extras', config.extras);
    if (Array.isArray(config.stickers)) writeScoped('presentation_stickers_v1', config.stickers);
    if (config.stableLayout && typeof config.stableLayout === 'object') writeScoped('presentation_layout_stable_v2', config.stableLayout);
    if (config.layout && typeof config.layout === 'object') writeScoped('presentation_layout', config.layout);
    if (config.textOverrides && typeof config.textOverrides === 'object') writeScoped('presentation_text_overrides', config.textOverrides);
    if (config.defaultSnapshot) writeScoped('presentation_default_snapshot', config.defaultSnapshot);

    // Rückwärtskompatibilität: alte einzelne Felder ebenfalls wiederherstellen.
    if (config.settings && typeof savePresentationSettingsFinal === 'function') {
      try { savePresentationSettingsFinal(config.settings); } catch(_) {}
    }
    if (Array.isArray(config.extras) && typeof savePresentationExtrasFinal === 'function') {
      try { savePresentationExtrasFinal(config.extras); } catch(_) {}
    }
  };

  function extractPresentationSyncFromRow(row){
    const data = (row && row.data) || {};
    const raw = data.raw || {};
    const cfg = data.presentationConfig || raw.presentationConfig || null;
    if (cfg && typeof cfg === 'object') return cfg;

    // Rückwärtskompatibilität mit älteren Speicherversionen
    const legacy = {
      version: 'legacy-auto-merged',
      settings: raw.presentationSettings || data.presentationSettings || {},
      extras: raw.presentationExtras || data.presentationExtras || [],
      stickers: raw.presentationStickers || data.presentationStickers || [],
      stableLayout: raw.presentationStableLayout || data.presentationStableLayout || {},
      layout: raw.presentationLayout || data.presentationLayout || {},
      textOverrides: raw.presentationTextOverrides || data.presentationTextOverrides || {}
    };
    const hasLegacy = Object.keys(legacy.settings || {}).length || (legacy.extras || []).length || (legacy.stickers || []).length || Object.keys(legacy.stableLayout || {}).length;
    return hasLegacy ? legacy : null;
  }
  window.extractPresentationSyncFromRow = extractPresentationSyncFromRow;

  function buildPayloadWithPresentationSync(previousBuild){
    return function(){
      if (typeof window.saveCurrentPresentationEditsFinal === 'function') {
        try { window.saveCurrentPresentationEditsFinal(); } catch(_) {}
      }
      const data = previousBuild ? previousBuild.apply(this, arguments) : (typeof collectSupervisorData === 'function' ? collectSupervisorData() : {});
      const config = window.collectPresentationSyncConfig();
      data.presentationConfig = config;

      // Einzelne Felder bleiben für alte Ergebnis-/Präsentationsfunktionen erhalten.
      data.presentationSettings = config.settings;
      data.presentationExtras = config.extras;
      data.presentationStickers = config.stickers;
      data.presentationStableLayout = config.stableLayout;
      data.presentationLayout = config.layout;
      data.presentationTextOverrides = config.textOverrides;
      data.presentationSyncVersion = config.version;
      return data;
    };
  }

  if (typeof buildPayload === 'function') {
    const oldBuildPayload = buildPayload;
    buildPayload = window.buildPayload = buildPayloadWithPresentationSync(oldBuildPayload);
  }

  // submitResults zusätzlich robust machen: nach jedem Speichern wird presentationConfig gesendet.
  if (typeof submitResults === 'function') {
    const oldSubmitResults = submitResults;
    submitResults = window.submitResults = async function(){
      return oldSubmitResults.apply(this, arguments);
    };
  }

  // Merge-Funktion so erweitern, dass data.presentationConfig immer sichtbar wird.
  if (typeof mergePresentationRawDataFinal === 'function') {
    const oldMergePresentationRawDataFinal = mergePresentationRawDataFinal;
    mergePresentationRawDataFinal = window.mergePresentationRawDataFinal = function(row){
      const merged = oldMergePresentationRawDataFinal(row) || {};
      const cfg = extractPresentationSyncFromRow(row);
      if (cfg) {
        merged.presentationConfig = cfg;
        merged.presentationSettings = cfg.settings || merged.presentationSettings;
        merged.presentationExtras = cfg.extras || merged.presentationExtras;
        merged.presentationStickers = cfg.stickers || merged.presentationStickers;
        merged.presentationStableLayout = cfg.stableLayout || merged.presentationStableLayout;
        merged.presentationLayout = cfg.layout || merged.presentationLayout;
        merged.presentationTextOverrides = cfg.textOverrides || merged.presentationTextOverrides;
      }
      return merged;
    };
  }

  // Bevor eine Präsentation gebaut wird, den gruppenweiten Stand in den lokalen Renderer spiegeln.
  if (typeof buildPresentationSlides === 'function') {
    const oldBuildPresentationSlides = buildPresentationSlides;
    buildPresentationSlides = window.buildPresentationSlides = function(row){
      const cfg = extractPresentationSyncFromRow(row);
      if (cfg) window.applyPresentationSyncConfig(cfg);
      return oldBuildPresentationSlides.apply(this, arguments);
    };
  }

  // Init der finalen Präsentation erweitert: row, i oder g/groupId werden sauber unterstützt.
  if (typeof initPresentationFinal === 'function') {
    initPresentationFinal = window.initPresentationFinal = function(){
      const status = document.getElementById('presentationStatus');
      const url = typeof getAppsScriptUrl === 'function' ? getAppsScriptUrl() : '';
      const params = new URLSearchParams(window.location.search);
      const rowParam = params.get('row');
      const idxParam = params.get('i');
      const groupParam = params.get('g') || params.get('groupId') || params.get('token');

      const exit = document.getElementById('presentationExitBtn');
      const full = document.getElementById('presentationFullscreenBtn');
      const prev = document.getElementById('presentationPrevBtn');
      const next = document.getElementById('presentationNextBtn');

      if (exit) exit.onclick = () => {
        if (groupParam) window.location.href = 'gruppe-ergebnis.html?g=' + encodeURIComponent(groupParam);
        else window.location.href = 'ergebnisse.html';
      };
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
      });

      if (!url) {
        if (status) status.textContent = 'Keine Apps-Script-URL gefunden.';
        return;
      }

      const loadPromise = groupParam && typeof fetchEntriesFiltered === 'function'
        ? fetchEntriesFiltered(url, groupParam)
        : fetchResultsWithFallback(url);

      loadPromise.then(rows => {
        let row = null;
        if (rowParam !== null) row = (rows || []).find(r => String(r.rowNumber || r.id) === String(rowParam));
        if (!row && groupParam) row = (rows || []).find(r => String(r.groupId || (r.data && r.data.groupId) || '').trim() === String(groupParam).trim()) || (rows || [])[0];
        if (!row && idxParam !== null) row = (rows || [])[Number(idxParam)];
        if (!row && rows && rows.length) row = rows[0];
        if (!row) throw new Error('Kein Gruppenergebnis gefunden.');

        const cfg = extractPresentationSyncFromRow(row);
        if (cfg) window.applyPresentationSyncConfig(cfg);

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
  }

  // Gruppenergebnis: Präsentationslink mit Gruppen-ID ermöglichen, falls später wieder aktiviert.
  window.presentationUrlForGroupSync = function(row){
    const data = (row && row.data) || {};
    const groupId = row.groupId || data.groupId || (data.raw && data.raw.groupId) || '';
    if (groupId) return 'presentation.html?g=' + encodeURIComponent(groupId);
    const rowNumber = row && (row.rowNumber || row.id);
    return rowNumber ? 'presentation.html?row=' + encodeURIComponent(rowNumber) : 'presentation.html';
  };

  // Nach Speichern der Präsentationsvorbereitung optional sofort erneut absenden, falls möglich.
  if (typeof window.saveCurrentPresentationEditsFinal === 'function') {
    const oldSaveEdits = window.saveCurrentPresentationEditsFinal;
    window.saveCurrentPresentationEditsFinal = function(){
      const result = oldSaveEdits.apply(this, arguments);
      try {
        const lastPayload = (typeof buildPayload === 'function') ? buildPayload() : null;
        if (lastPayload) localStorage.setItem(scopedKey('last_presentation_payload_preview'), JSON.stringify(lastPayload));
      } catch(_) {}
      return result;
    };
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.classList.add('sv-sync-ready');
  });
})();


/* ==========================================================
   HOTFIX: stabile Ergebnisübermittlung + kompakte Gruppen-Sync-Daten
   Grund: Der vorherige Sync sammelte zusätzlich große lokale Rohdaten aus
   localStorage. Bei vielen Stickern/Bildern kann das den Browser/POST blockieren.
   ========================================================== */
(function(){
  const MAX_DATA_URL_LENGTH = 1800000; // ca. 1,8 MB pro Bild, schützt Apps Script und Browser

  function svSafeClone(value){
    try { return JSON.parse(JSON.stringify(value || null)); } catch(_) { return value || null; }
  }

  function svStripHugeFields(value){
    if (!value || typeof value !== 'object') return value;
    if (Array.isArray(value)) return value.map(svStripHugeFields);
    const out = {};
    Object.keys(value).forEach(k => {
      const v = value[k];
      if (typeof v === 'string' && v.indexOf('data:image') === 0 && v.length > MAX_DATA_URL_LENGTH) {
        out[k] = '';
        out[k + '_removedBecauseTooLarge'] = true;
        return;
      }
      out[k] = svStripHugeFields(v);
    });
    return out;
  }

  function svReadObj(name, fallback){
    try {
      if (typeof loadObj === 'function') return loadObj(name, fallback);
      const gid = (typeof getGroupId === 'function') ? getGroupId() : 'gruppe';
      const raw = localStorage.getItem('sv_' + gid + '_' + name) || localStorage.getItem(name);
      return raw ? JSON.parse(raw) : fallback;
    } catch(_) { return fallback; }
  }

  window.collectPresentationSyncConfig = function(){
    let settings = {};
    let extras = [];
    try { settings = (typeof getPresentationSettingsFinal === 'function') ? getPresentationSettingsFinal() : svReadObj('presentation_settings', {}); } catch(_) { settings = {}; }
    try { extras = (typeof getPresentationExtrasFinal === 'function') ? getPresentationExtrasFinal() : svReadObj('presentation_extras', []); } catch(_) { extras = []; }

    const cfg = {
      version: '2026-06-group-sync-stable-v2',
      savedAt: new Date().toISOString(),
      groupId: (typeof getGroupId === 'function') ? getGroupId() : '',
      settings: settings || {},
      extras: Array.isArray(extras) ? extras : [],
      stickers: svReadObj('presentation_stickers_v1', []),
      stableLayout: svReadObj('presentation_layout_stable_v2', {}),
      layout: svReadObj('presentation_layout', {}),
      textOverrides: svReadObj('presentation_text_overrides', {})
    };

    // Kein rawLocalPresentationState mehr: das war zu groß und konnte das Absenden blockieren.
    return svStripHugeFields(svSafeClone(cfg));
  };

  const previousBuildPayloadStable = (typeof buildPayload === 'function') ? buildPayload : null;
  buildPayload = window.buildPayload = function(){
    const data = previousBuildPayloadStable ? previousBuildPayloadStable.apply(this, arguments) : (typeof collectSupervisorData === 'function' ? collectSupervisorData() : {});
    const cfg = window.collectPresentationSyncConfig();
    data.presentationConfig = cfg;
    data.presentationSettings = cfg.settings;
    data.presentationExtras = cfg.extras;
    data.presentationStickers = cfg.stickers;
    data.presentationStableLayout = cfg.stableLayout;
    data.presentationLayout = cfg.layout;
    data.presentationTextOverrides = cfg.textOverrides;
    data.presentationSyncVersion = cfg.version;
    return svStripHugeFields(data);
  };

  async function svPostNoCorsWithTimeout(url, payload, ms){
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms || 15000);
    try {
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        signal: controller.signal
      });
      return true;
    } finally {
      clearTimeout(timer);
    }
  }

  window.submitResults = submitResults = async function(){
    const status = document.getElementById('submitStatus');
    const btn = document.getElementById('submitResults');
    const url = (typeof getAppsScriptUrl === 'function') ? getAppsScriptUrl() : '';

    function setStatus(cls, text){
      if (!status) return;
      status.className = cls || '';
      status.textContent = text || '';
    }

    if (!url) {
      setStatus('warning', 'Keine Apps-Script-URL gefunden. Ergebnisse können nicht abgesendet werden.');
      return;
    }

    let payload;
    try {
      if (typeof window.saveCurrentPresentationEditsFinal === 'function') {
        // Falls die Präsentationsbearbeitung gerade offen ist, sichtbare Änderungen sichern.
        try { window.saveCurrentPresentationEditsFinal(); } catch(_) {}
      }
      payload = buildPayload();
    } catch (err) {
      setStatus('warning', 'Die Ergebnisdaten konnten nicht vorbereitet werden: ' + (err && err.message ? err.message : err));
      return;
    }

    try {
      if (btn) { btn.disabled = true; btn.dataset.oldText = btn.textContent; btn.textContent = 'Wird abgesendet …'; }
      setStatus('notice', 'Ergebnisse werden abgesendet …');
      await svPostNoCorsWithTimeout(url, payload, 15000);
      setStatus('success', 'Ergebnisse wurden abgesendet. Sie sind nun auf der Ergebnisseite sichtbar.');
      if (typeof openSummaryPresentationPanelWithNudge === 'function') {
        setTimeout(openSummaryPresentationPanelWithNudge, 300);
      }
    } catch (err) {
      setStatus('warning', 'Senden fehlgeschlagen oder Zeitüberschreitung. Prüfe Apps Script und die bereitgestellte Web-App.');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = btn.dataset.oldText || 'Ergebnisse absenden'; }
    }
  };

  document.addEventListener('DOMContentLoaded', function(){
    const btn = document.getElementById('submitResults');
    if (btn) btn.onclick = window.submitResults;
  });
})();

/* ==========================================================
   FREEZE FIX FINAL: sichere, schlanke Ergebnisübermittlung
   ----------------------------------------------------------
   Problem: Ältere Patches hingen weiterhin als addEventListener am
   Absende-Button und sammelten zu große/rekursive Präsentationsdaten.
   Lösung: Button wird geklont, alte Listener werden entfernt, danach
   wird nur noch diese robuste Sendefunktion verwendet.
   ========================================================== */
(function(){
  const MAX_STRING = 120000;      // schützt vor riesigen base64-/Bildstrings
  const MAX_JSON_TOTAL = 950000;  // bleibt deutlich unter Apps-Script-/Browser-Grenzen

  function safeParse(v, fallback){
    try { return v ? JSON.parse(v) : fallback; } catch(_) { return fallback; }
  }

  function groupKey(name){
    try {
      if (typeof key === 'function') return key(name);
      const gid = (typeof getGroupId === 'function') ? getGroupId() : 'gruppe';
      return 'sv_' + gid + '_' + name;
    } catch(_) {
      return 'sv_gruppe_' + name;
    }
  }

  function readLocalObj(name, fallback){
    try {
      const raw = localStorage.getItem(groupKey(name)) || localStorage.getItem('sv_' + name) || localStorage.getItem(name);
      return safeParse(raw, fallback);
    } catch(_) { return fallback; }
  }

  function trimHuge(value){
    if (value == null) return value;
    if (typeof value === 'string') {
      if (value.indexOf('data:image') === 0) {
        return value.length > MAX_STRING ? '' : value;
      }
      return value.length > MAX_STRING ? value.slice(0, MAX_STRING) + ' … [gekürzt]' : value;
    }
    if (Array.isArray(value)) return value.slice(0, 80).map(trimHuge);
    if (typeof value === 'object') {
      const out = {};
      Object.keys(value).slice(0, 120).forEach(k => {
        if (/raw|cache|history|undo|snapshot/i.test(k)) return;
        out[k] = trimHuge(value[k]);
      });
      return out;
    }
    return value;
  }

  function buildCompactPresentationConfig(){
    let settings = {};
    let extras = [];
    try { settings = typeof getPresentationSettingsFinal === 'function' ? getPresentationSettingsFinal() : readLocalObj('presentation_settings', {}); } catch(_) { settings = readLocalObj('presentation_settings', {}); }
    try { extras = typeof getPresentationExtrasFinal === 'function' ? getPresentationExtrasFinal() : readLocalObj('presentation_extras', []); } catch(_) { extras = readLocalObj('presentation_extras', []); }

    const cfg = {
      version: '2026-06-compact-sync-no-freeze-v3',
      savedAt: new Date().toISOString(),
      groupId: typeof getGroupId === 'function' ? getGroupId() : '',
      settings: settings || {},
      extras: Array.isArray(extras) ? extras : [],
      stickers: readLocalObj('presentation_stickers_v1', []),
      stableLayout: readLocalObj('presentation_layout_stable_v2', {}),
      layout: readLocalObj('presentation_layout', {}),
      textOverrides: readLocalObj('presentation_text_overrides', {})
    };
    return trimHuge(cfg);
  }

  function buildLightPayload(){
    let data = {};
    try {
      data = typeof collectSupervisorData === 'function' ? collectSupervisorData() : {};
    } catch(err) {
      data = { groupId: (typeof getGroupId === 'function' ? getGroupId() : 'gruppe') };
    }

    try {
      const assignments = (typeof loadObj === 'function') ? loadObj('assignments', {}) : {};
      const groupName = (typeof loadText === 'function' ? loadText('summary_group_name') : '') || data.groupName || Object.values(assignments || {}).filter(Boolean).join(', ') || data.groupId || 'Unbenannte Gruppe';
      data.groupName = groupName;
      data.assignments = data.assignments || assignments;
    } catch(_) {}

    data.timestampLocal = new Date().toLocaleString('de-DE');
    const cfg = buildCompactPresentationConfig();
    data.presentationConfig = cfg;
    data.presentationSettings = cfg.settings;
    data.presentationExtras = cfg.extras;
    data.presentationStickers = cfg.stickers;
    data.presentationStableLayout = cfg.stableLayout;
    data.presentationLayout = cfg.layout;
    data.presentationTextOverrides = cfg.textOverrides;
    data.presentationSyncVersion = cfg.version;

    data = trimHuge(data);

    // Falls trotz Kürzung zu groß: Präsentationsdaten stärker reduzieren.
    try {
      let json = JSON.stringify(data);
      if (json.length > MAX_JSON_TOTAL) {
        data.presentationConfig = {
          version: cfg.version,
          savedAt: cfg.savedAt,
          groupId: cfg.groupId,
          settings: trimHuge(cfg.settings || {}),
          textOverrides: trimHuge(cfg.textOverrides || {}),
          layout: trimHuge(cfg.layout || {}),
          stableLayout: trimHuge(cfg.stableLayout || {}),
          extras: [],
          stickers: []
        };
        data.presentationExtras = [];
        data.presentationStickers = [];
      }
    } catch(_) {}

    return data;
  }

  function postNoCors(url, payload, timeoutMs){
    return new Promise((resolve, reject) => {
      let done = false;
      const timer = setTimeout(() => {
        if (done) return;
        done = true;
        reject(new Error('Zeitüberschreitung beim Senden.'));
      }, timeoutMs || 14000);

      try {
        fetch(url, {
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify(payload),
          headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        }).then(() => {
          if (done) return;
          done = true;
          clearTimeout(timer);
          resolve(true);
        }).catch(err => {
          if (done) return;
          done = true;
          clearTimeout(timer);
          reject(err);
        });
      } catch(err) {
        if (done) return;
        done = true;
        clearTimeout(timer);
        reject(err);
      }
    });
  }

  async function safeSubmitResults(evt){
    if (evt) {
      evt.preventDefault();
      evt.stopPropagation();
      if (evt.stopImmediatePropagation) evt.stopImmediatePropagation();
    }

    const status = document.getElementById('submitStatus');
    const btn = document.getElementById('submitResults');
    const url = typeof getAppsScriptUrl === 'function' ? getAppsScriptUrl() : '';

    function setStatus(cls, text){
      if (!status) return;
      status.className = cls || '';
      status.textContent = text || '';
    }

    if (!url) {
      setStatus('warning', 'Keine Apps-Script-URL gefunden. Ergebnisse können nicht abgesendet werden.');
      return;
    }

    let payload;
    try {
      payload = buildLightPayload();
    } catch(err) {
      setStatus('warning', 'Die Ergebnisdaten konnten nicht vorbereitet werden: ' + (err && err.message ? err.message : err));
      return;
    }

    try {
      if (btn) {
        btn.disabled = true;
        btn.dataset.oldText = btn.dataset.oldText || btn.textContent;
        btn.textContent = 'Wird abgesendet …';
      }
      setStatus('notice', 'Ergebnisse werden abgesendet …');
      await postNoCors(url, payload, 14000);
      setStatus('success', 'Ergebnisse wurden abgesendet. Sie sind nun auf der Ergebnisseite sichtbar.');
      if (typeof openSummaryPresentationPanelWithNudge === 'function') {
        setTimeout(openSummaryPresentationPanelWithNudge, 250);
      }
    } catch(err) {
      setStatus('warning', 'Senden fehlgeschlagen oder Zeitüberschreitung. Prüfe Apps Script und die Web-App-Bereitstellung.');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = btn.dataset.oldText || 'Ergebnisse absenden';
      }
    }
  }

  window.submitResults = submitResults = safeSubmitResults;
  window.buildPayload = buildLightPayload;
  window.collectPresentationSyncConfig = buildCompactPresentationConfig;

  function replaceSubmitButton(){
    const oldBtn = document.getElementById('submitResults');
    if (!oldBtn || oldBtn.dataset.safeSubmitBound === '1') return;
    const newBtn = oldBtn.cloneNode(true);
    newBtn.dataset.safeSubmitBound = '1';
    newBtn.disabled = false;
    newBtn.textContent = oldBtn.dataset.oldText || oldBtn.textContent || 'Ergebnisse absenden';
    oldBtn.parentNode.replaceChild(newBtn, oldBtn);
    newBtn.addEventListener('click', safeSubmitResults, { capture: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', replaceSubmitButton);
  } else {
    replaceSubmitButton();
  }
  setTimeout(replaceSubmitButton, 300);
  setTimeout(replaceSubmitButton, 1200);
})();

/* ==========================================================
   FINAL TRANSFERABLE PRESENTATION SYNC
   ----------------------------------------------------------
   Ziel: Nur übertragbare Präsentationsparameter speichern.
   Entfernt Hintergrundbild-Upload/-Entfernen aus dem Editor und
   sendet ein kompaktes presentationConfig-JSON an Apps Script.
   ========================================================== */
(function(){
  const TRANSFER_SYNC_VERSION = '2026-06-transferable-presentation-v1';
  const MAX_TEXT = 3000;
  const MAX_OBJECT_KEYS = 160;
  const MAX_ARRAY_ITEMS = 180;

  function gid(){
    try { return (typeof getGroupId === 'function') ? getGroupId() : (new URLSearchParams(location.search).get('g') || localStorage.getItem('sv_current_group') || 'gruppe'); }
    catch(_) { return 'gruppe'; }
  }
  function scopedKey(name){
    try { if (typeof key === 'function') return key(name); } catch(_) {}
    return 'sv_' + gid() + '_' + name;
  }
  function parse(raw, fb){ try { return raw ? JSON.parse(raw) : fb; } catch(_) { return fb; } }
  function readObj(name, fb){
    try {
      const raw = localStorage.getItem(scopedKey(name)) || localStorage.getItem('sv_' + name) || localStorage.getItem(name);
      return parse(raw, fb);
    } catch(_) { return fb; }
  }
  function writeObj(name, value){
    try {
      const json = JSON.stringify(value == null ? {} : value);
      localStorage.setItem(scopedKey(name), json);
    } catch(_) {}
  }
  function isDataImage(s){ return typeof s === 'string' && /^data:image\//i.test(s); }
  function cleanString(s){
    if (s == null) return '';
    s = String(s);
    if (isDataImage(s)) return '';
    return s.length > MAX_TEXT ? s.slice(0, MAX_TEXT) + ' …' : s;
  }
  function cleanValue(v, depth){
    if (depth > 8) return null;
    if (v == null) return v;
    if (typeof v === 'string') return cleanString(v);
    if (typeof v === 'number' || typeof v === 'boolean') return v;
    if (Array.isArray(v)) return v.slice(0, MAX_ARRAY_ITEMS).map(x => cleanValue(x, depth + 1)).filter(x => x !== undefined);
    if (typeof v === 'object') {
      const out = {};
      Object.keys(v).slice(0, MAX_OBJECT_KEYS).forEach(k => {
        if (/backgroundImage|bgImage|imageData|dataUrl|base64|rawLocal|cache|history|undo|snapshot/i.test(k)) return;
        out[k] = cleanValue(v[k], depth + 1);
      });
      return out;
    }
    return null;
  }
  function cleanSettings(settings){
    settings = settings && typeof settings === 'object' ? settings : {};
    const allowed = [
      'heading','text','background','slide','slidePattern','slidePatternColor',
      'backgroundPattern','backgroundPatternColor','pageBackground','pagePattern',
      'pagePatternColor','accent','titleColor','bodyColor'
    ];
    const out = {};
    allowed.forEach(k => { if (settings[k] != null && settings[k] !== '') out[k] = cleanValue(settings[k], 0); });
    if (!out.slide) out.slide = '#ffffff';
    if (!out.background) out.background = '#0f172a';
    if (!out.slidePattern) out.slidePattern = 'none';
    if (!out.backgroundPattern) out.backgroundPattern = 'none';
    return out;
  }
  function cleanSticker(st){
    if (!st || typeof st !== 'object') return null;
    const src = cleanString(st.src || st.url || st.path || st.file || '');
    if (!src || isDataImage(src)) return null;
    return {
      id: cleanString(st.id || ('sticker_' + Math.random().toString(36).slice(2))),
      slideIndex: Number(st.slideIndex ?? st.slide ?? 0) || 0,
      src,
      x: Number(st.x ?? st.left ?? 40) || 0,
      y: Number(st.y ?? st.top ?? 40) || 0,
      width: Number(st.width ?? st.w ?? 140) || 140,
      height: Number(st.height ?? st.h ?? 120) || 120,
      rotation: Number(st.rotation ?? st.rotate ?? 0) || 0,
      z: Number(st.z ?? st.zIndex ?? 20) || 20
    };
  }
  function cleanExtra(ex){
    if (!ex || typeof ex !== 'object') return null;
    const type = cleanString(ex.type || 'text');
    if (type === 'sticker' || ex.src || ex.url || ex.path) return cleanSticker(ex);
    return {
      id: cleanString(ex.id || ('textbox_' + Math.random().toString(36).slice(2))),
      type: 'text',
      slideIndex: Number(ex.slideIndex ?? ex.slide ?? 0) || 0,
      text: cleanString(ex.text || ex.html || ex.content || ''),
      x: Number(ex.x ?? ex.left ?? 60) || 0,
      y: Number(ex.y ?? ex.top ?? 60) || 0,
      width: Number(ex.width ?? ex.w ?? 240) || 240,
      height: Number(ex.height ?? ex.h ?? 90) || 90,
      rotation: Number(ex.rotation ?? ex.rotate ?? 0) || 0,
      z: Number(ex.z ?? ex.zIndex ?? 25) || 25,
      color: cleanString(ex.color || ex.textColor || ''),
      fontSize: Number(ex.fontSize ?? 18) || 18
    };
  }
  function collectSettings(){
    let s = {};
    try { s = (typeof getPresentationSettingsFinal === 'function') ? getPresentationSettingsFinal() : readObj('presentation_settings', {}); }
    catch(_) { s = readObj('presentation_settings', {}); }
    return cleanSettings(s);
  }
  function collectExtras(){
    let extras = [];
    try { extras = (typeof getPresentationExtrasFinal === 'function') ? getPresentationExtrasFinal() : readObj('presentation_extras', []); }
    catch(_) { extras = readObj('presentation_extras', []); }
    return (Array.isArray(extras) ? extras : []).map(cleanExtra).filter(Boolean);
  }
  function collectStickers(){
    const stickers = readObj('presentation_stickers_v1', []);
    return (Array.isArray(stickers) ? stickers : []).map(cleanSticker).filter(Boolean);
  }
  function buildTransferablePresentationConfig(){
    return {
      version: TRANSFER_SYNC_VERSION,
      savedAt: new Date().toISOString(),
      groupId: gid(),
      settings: collectSettings(),
      extras: collectExtras(),
      stickers: collectStickers(),
      stableLayout: cleanValue(readObj('presentation_layout_stable_v2', {}), 0) || {},
      layout: cleanValue(readObj('presentation_layout', {}), 0) || {},
      textOverrides: cleanValue(readObj('presentation_text_overrides', {}), 0) || {}
    };
  }
  function stripUnsupportedPresentationConfig(cfg){
    cfg = cfg && typeof cfg === 'object' ? cfg : {};
    return {
      version: cleanString(cfg.version || TRANSFER_SYNC_VERSION),
      savedAt: cleanString(cfg.savedAt || ''),
      groupId: cleanString(cfg.groupId || gid()),
      settings: cleanSettings(cfg.settings || cfg.presentationSettings || {}),
      extras: (Array.isArray(cfg.extras) ? cfg.extras : []).map(cleanExtra).filter(Boolean),
      stickers: (Array.isArray(cfg.stickers) ? cfg.stickers : []).map(cleanSticker).filter(Boolean),
      stableLayout: cleanValue(cfg.stableLayout || {}, 0) || {},
      layout: cleanValue(cfg.layout || {}, 0) || {},
      textOverrides: cleanValue(cfg.textOverrides || {}, 0) || {}
    };
  }

  window.collectPresentationSyncConfig = buildTransferablePresentationConfig;

  window.applyPresentationSyncConfig = function(config){
    const cfg = stripUnsupportedPresentationConfig(config);
    writeObj('presentation_settings', cfg.settings);
    writeObj('presentation_extras', cfg.extras);
    writeObj('presentation_stickers_v1', cfg.stickers);
    writeObj('presentation_layout_stable_v2', cfg.stableLayout);
    writeObj('presentation_layout', cfg.layout);
    writeObj('presentation_text_overrides', cfg.textOverrides);
    try { if (typeof savePresentationSettingsFinal === 'function') savePresentationSettingsFinal(cfg.settings); } catch(_) {}
    try { if (typeof savePresentationExtrasFinal === 'function') savePresentationExtrasFinal(cfg.extras); } catch(_) {}
  };

  function buildSafePayload(){
    let data = {};
    try { data = (typeof collectSupervisorData === 'function') ? collectSupervisorData() : {}; }
    catch(_) { data = {}; }
    if (!data || typeof data !== 'object') data = {};
    data.groupId = data.groupId || gid();
    try {
      const assignments = (typeof loadObj === 'function') ? loadObj('assignments', {}) : readObj('assignments', {});
      data.assignments = data.assignments || assignments || {};
      data.groupName = (typeof loadText === 'function' ? loadText('summary_group_name') : '') || data.groupName || Object.values(data.assignments || {}).filter(Boolean).join(', ') || data.groupId || 'Unbenannte Gruppe';
    } catch(_) {
      data.groupName = data.groupName || data.groupId || 'Unbenannte Gruppe';
    }
    data.timestampLocal = new Date().toLocaleString('de-DE');
    const cfg = buildTransferablePresentationConfig();
    data.presentationConfig = cfg;
    data.presentationSettings = cfg.settings;
    data.presentationExtras = cfg.extras;
    data.presentationStickers = cfg.stickers;
    data.presentationStableLayout = cfg.stableLayout;
    data.presentationLayout = cfg.layout;
    data.presentationTextOverrides = cfg.textOverrides;
    data.presentationSyncVersion = cfg.version;
    return cleanValue(data, 0);
  }
  window.buildPayload = buildSafePayload;

  function postPayload(url, payload){
    return new Promise((resolve, reject) => {
      const json = JSON.stringify(payload);
      if (json.length > 950000) {
        reject(new Error('Die Präsentationsdaten sind zu groß. Bitte weniger Sticker/Textfelder verwenden.'));
        return;
      }
      let done = false;
      const timer = setTimeout(() => { if (!done) { done = true; reject(new Error('Zeitüberschreitung beim Senden.')); } }, 14000);
      fetch(url, { method:'POST', mode:'no-cors', body: json, headers:{'Content-Type':'text/plain;charset=utf-8'} })
        .then(() => { if (!done) { done = true; clearTimeout(timer); resolve(true); } })
        .catch(err => { if (!done) { done = true; clearTimeout(timer); reject(err); } });
    });
  }
  async function finalSafeSubmit(evt){
    if (evt) { evt.preventDefault(); evt.stopPropagation(); if (evt.stopImmediatePropagation) evt.stopImmediatePropagation(); }
    const status = document.getElementById('submitStatus');
    const btn = document.getElementById('submitResults');
    const url = (typeof getAppsScriptUrl === 'function') ? getAppsScriptUrl() : '';
    const setStatus = (cls, text) => { if (status) { status.className = cls || ''; status.textContent = text || ''; } };
    if (!url) { setStatus('warning', 'Keine Apps-Script-URL gefunden.'); return; }
    let payload;
    try { payload = buildSafePayload(); }
    catch(e) { setStatus('warning', 'Ergebnisdaten konnten nicht vorbereitet werden: ' + (e && e.message ? e.message : e)); return; }
    try {
      if (btn) { btn.disabled = true; btn.dataset.oldText = btn.dataset.oldText || btn.textContent; btn.textContent = 'Wird abgesendet …'; }
      setStatus('notice', 'Ergebnisse werden abgesendet …');
      await postPayload(url, payload);
      setStatus('success', 'Ergebnisse wurden abgesendet. Die Präsentationseinstellungen wurden mitgespeichert.');
      try { if (typeof openSummaryPresentationPanelWithNudge === 'function') setTimeout(openSummaryPresentationPanelWithNudge, 250); } catch(_) {}
      try {
        const box = document.getElementById('groupShareBox');
        if (box) box.hidden = false;
      } catch(_) {}
    } catch(e) {
      setStatus('warning', e && e.message ? e.message : 'Senden fehlgeschlagen.');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = btn.dataset.oldText || 'Ergebnisse absenden'; }
    }
  }
  window.submitResults = finalSafeSubmit;

  function rebindSubmit(){
    const btn = document.getElementById('submitResults');
    if (!btn || btn.dataset.transferSyncBound === '1') return;
    const clone = btn.cloneNode(true);
    clone.dataset.transferSyncBound = '1';
    clone.disabled = false;
    clone.addEventListener('click', finalSafeSubmit, true);
    btn.parentNode.replaceChild(clone, btn);
  }

  function removeUnsupportedImageControls(){
    const selectors = [
      '#presentationBgImageBtn','#removePresentationBgImage','#v4BgButton','#v4BgRemove',
      '[data-action="background-image"]','[data-action="remove-background-image"]'
    ];
    selectors.forEach(sel => document.querySelectorAll(sel).forEach(el => el.remove()));
    document.querySelectorAll('button, .button, label').forEach(el => {
      const t = (el.textContent || '').trim().toLowerCase();
      if (t === 'hintergrundbild' || t === 'bild entfernen' || t === 'hintergrundbild hochladen') el.remove();
    });
    document.querySelectorAll('input[type="file"]').forEach(el => {
      const id = String(el.id || '').toLowerCase();
      const name = String(el.name || '').toLowerCase();
      if (id.includes('bg') || id.includes('background') || name.includes('background')) el.remove();
    });
  }

  function patchConfigExtractionFromRows(){
    window.extractPresentationSyncFromRow = function(row){
      const data = (row && row.data) || {};
      const raw = data.raw || {};
      const cfg = data.presentationConfig || raw.presentationConfig || null;
      if (cfg && typeof cfg === 'object') return stripUnsupportedPresentationConfig(cfg);
      const legacy = {
        version: 'legacy-transferable',
        settings: raw.presentationSettings || data.presentationSettings || {},
        extras: raw.presentationExtras || data.presentationExtras || [],
        stickers: raw.presentationStickers || data.presentationStickers || [],
        stableLayout: raw.presentationStableLayout || data.presentationStableLayout || {},
        layout: raw.presentationLayout || data.presentationLayout || {},
        textOverrides: raw.presentationTextOverrides || data.presentationTextOverrides || {}
      };
      return stripUnsupportedPresentationConfig(legacy);
    };
  }

  patchConfigExtractionFromRows();
  document.addEventListener('DOMContentLoaded', function(){
    removeUnsupportedImageControls();
    rebindSubmit();
    setTimeout(removeUnsupportedImageControls, 500);
    setTimeout(rebindSubmit, 500);
    setTimeout(removeUnsupportedImageControls, 1500);
  });
})();

/* ==========================================================
   FINAL TRANSFERABLE PRESENTATION SYNC PATCH
   - entfernt nicht übertragbare Hintergrundbild-Funktionen dynamisch
   - speichert/lädt nur kompakte Parameter
   - wendet gespeicherte Gruppen-Präsentationsparameter beim Start
     aus der zentralen Ergebnisübersicht sichtbar auf die Folien an
   ========================================================== */
(function(){
  'use strict';
  const PATCH_ID = 'sv-transferable-presentation-final-2026-06-08';
  if (window.__SV_TRANSFERABLE_PRESENTATION_FINAL_PATCH__ === PATCH_ID) return;
  window.__SV_TRANSFERABLE_PRESENTATION_FINAL_PATCH__ = PATCH_ID;

  const DEFAULT_THEME = {
    heading: '#1e3a5f',
    text: '#0f172a',
    background: '#071323',
    slide: '#ffffff',
    slidePattern: 'none',
    backgroundPattern: 'none',
    slidePatternColor: '#dbeafe',
    backgroundPatternColor: '#1f2937'
  };

  function cloneSafe(obj){
    try { return JSON.parse(JSON.stringify(obj || {})); } catch(_) { return {}; }
  }

  function stripUnsupported(value){
    if (value == null) return value;
    if (typeof value === 'string') {
      if (/^data:image\//i.test(value)) return '';
      return value.length > 60000 ? value.slice(0, 60000) + ' … [gekürzt]' : value;
    }
    if (Array.isArray(value)) return value.slice(0, 200).map(stripUnsupported);
    if (typeof value === 'object') {
      const out = {};
      Object.keys(value).forEach(k => {
        if (/backgroundImage|bgImage|imageData|dataUrl|base64|rawLocal|cache|history|undo|snapshot/i.test(k)) return;
        out[k] = stripUnsupported(value[k]);
      });
      return out;
    }
    return value;
  }

  function normaliseConfig(input){
    const cfg = cloneSafe(input);
    const settings = Object.assign({}, DEFAULT_THEME, cfg.settings || cfg.presentationSettings || {});
    delete settings.backgroundImage;
    return stripUnsupported({
      version: cfg.version || 'transferable-final',
      savedAt: cfg.savedAt || new Date().toISOString(),
      groupId: cfg.groupId || '',
      settings,
      values: cfg.values || cfg.presentationValues || {},
      text: cfg.text || cfg.textOverrides || cfg.presentationTextOverrides || {},
      textOverrides: cfg.textOverrides || cfg.text || cfg.presentationTextOverrides || {},
      layout: cfg.layout || cfg.presentationLayout || {},
      stableLayout: cfg.stableLayout || cfg.presentationStableLayout || {},
      extras: Array.isArray(cfg.extras) ? cfg.extras : (Array.isArray(cfg.presentationExtras) ? cfg.presentationExtras : []),
      stickers: Array.isArray(cfg.stickers) ? cfg.stickers : (Array.isArray(cfg.presentationStickers) ? cfg.presentationStickers : [])
    });
  }

  function extractConfigFromRow(row){
    const data = (row && row.data) || {};
    const raw = data.raw || {};
    let cfg = data.presentationConfig || raw.presentationConfig || null;
    if (!cfg && raw.presentationV6 && typeof raw.presentationV6 === 'object') cfg = raw.presentationV6;
    if (!cfg && data.presentationV6 && typeof data.presentationV6 === 'object') cfg = data.presentationV6;
    if (!cfg) {
      cfg = {
        version: 'legacy-fields',
        settings: raw.presentationSettings || data.presentationSettings || {},
        text: raw.presentationTextOverrides || data.presentationTextOverrides || {},
        layout: raw.presentationLayout || data.presentationLayout || {},
        stableLayout: raw.presentationStableLayout || data.presentationStableLayout || {},
        extras: raw.presentationExtras || data.presentationExtras || [],
        stickers: raw.presentationStickers || data.presentationStickers || []
      };
    }
    cfg = normaliseConfig(cfg);
    const hasSomething = Object.keys(cfg.settings || {}).length || Object.keys(cfg.text || {}).length || Object.keys(cfg.layout || {}).length || (cfg.stickers || []).length || (cfg.extras || []).length;
    return hasSomething ? cfg : null;
  }

  window.extractPresentationSyncFromRow = extractConfigFromRow;

  function scopedKeyFinal(name){
    try {
      if (typeof scopedKey === 'function') return scopedKey(name);
      if (typeof key === 'function') return key(name);
      const gid = (typeof getGroupId === 'function') ? getGroupId() : 'gruppe';
      return 'sv_' + gid + '_' + name;
    } catch(_) { return 'sv_gruppe_' + name; }
  }

  function readObj(name, fallback){
    try {
      const raw = localStorage.getItem(scopedKeyFinal(name)) || localStorage.getItem('sv_' + name) || localStorage.getItem(name);
      return raw ? JSON.parse(raw) : fallback;
    } catch(_) { return fallback; }
  }

  function collectTransferableConfig(){
    let settings = {};
    try { settings = typeof getPresentationSettingsFinal === 'function' ? getPresentationSettingsFinal() : readObj('presentation_settings', {}); } catch(_) { settings = readObj('presentation_settings', {}); }
    delete settings.backgroundImage;
    const cfg = {
      version: 'transferable-final',
      savedAt: new Date().toISOString(),
      groupId: (typeof getGroupId === 'function') ? getGroupId() : '',
      settings,
      text: readObj('presentation_text_overrides', {}),
      textOverrides: readObj('presentation_text_overrides', {}),
      layout: readObj('presentation_layout', {}),
      stableLayout: readObj('presentation_layout_stable_v2', {}),
      extras: readObj('presentation_extras', []),
      stickers: readObj('presentation_stickers_v1', [])
    };
    return normaliseConfig(cfg);
  }
  window.collectPresentationSyncConfig = collectTransferableConfig;

  function removeUnsupportedImageControls(root){
    root = root || document;
    const killSelectors = [
      '#presentationBgImageBtn', '#removePresentationBgImage', '#presentationBgImageInput',
      '#v4BgButton', '#v4BgRemove', '#v4BgInput',
      '[data-action="background-image"]', '[data-action="remove-background-image"]'
    ];
    killSelectors.forEach(sel => root.querySelectorAll(sel).forEach(el => el.remove()));
    root.querySelectorAll('button,label,input,span,div').forEach(el => {
      const t = (el.textContent || '').trim().toLowerCase();
      const id = String(el.id || '').toLowerCase();
      const cls = String(el.className || '').toLowerCase();
      const isBgFile = el.matches && el.matches('input[type="file"]') && (id.includes('bg') || id.includes('background') || cls.includes('background'));
      if (isBgFile || t === 'hintergrundbild' || t === 'bild entfernen' || t === 'hintergrundbild hochladen') {
        el.remove();
      }
    });
  }

  function installControlCleaner(){
    removeUnsupportedImageControls(document);
    try {
      const mo = new MutationObserver(mutations => {
        for (const m of mutations) {
          m.addedNodes && m.addedNodes.forEach(node => {
            if (node && node.nodeType === 1) removeUnsupportedImageControls(node);
          });
        }
      });
      mo.observe(document.documentElement, { childList: true, subtree: true });
    } catch(_) {}
  }

  function patternCss(kind, color){
    const c = color || '#e5e7eb';
    if (kind === 'dots') return { image: `radial-gradient(${c} 1.4px, transparent 1.4px)`, size: '18px 18px' };
    if (kind === 'grid') return { image: `linear-gradient(${c} 1px, transparent 1px), linear-gradient(90deg, ${c} 1px, transparent 1px)`, size: '28px 28px' };
    if (kind === 'diagonal') return { image: `repeating-linear-gradient(135deg, transparent 0 12px, ${c} 12px 14px)`, size: '24px 24px' };
    if (kind === 'waves') return { image: `radial-gradient(ellipse at top, ${c} 0 16%, transparent 17%), radial-gradient(ellipse at bottom, ${c} 0 14%, transparent 15%)`, size: '70px 34px' };
    return { image: 'none', size: '24px 24px' };
  }

  function applyThemeToPresentation(settings){
    const s = Object.assign({}, DEFAULT_THEME, settings || {});
    delete s.backgroundImage;
    const body = document.body;
    const slide = document.getElementById('presentationSlide');
    const sp = patternCss(s.slidePattern, s.slidePatternColor);
    const bp = patternCss(s.backgroundPattern, s.backgroundPatternColor);
    if (body) {
      body.style.backgroundColor = s.background;
      body.style.backgroundImage = bp.image;
      body.style.backgroundSize = bp.size;
      body.style.color = s.text;
      body.style.setProperty('--presentation-heading-color', s.heading);
      body.style.setProperty('--presentation-text-color', s.text);
      body.style.setProperty('--presentation-background-color', s.background);
      body.style.setProperty('--presentation-slide-color', s.slide);
      body.style.setProperty('--slide-pattern-image', sp.image);
      body.style.setProperty('--slide-pattern-size', sp.size);
      body.style.setProperty('--background-pattern-image', bp.image);
      body.style.setProperty('--background-pattern-size', bp.size);
    }
    if (slide) {
      slide.style.backgroundColor = s.slide;
      slide.style.backgroundImage = sp.image;
      slide.style.backgroundSize = sp.size;
      slide.style.color = s.text;
    }
  }

  function slideElementMap(index, inner){
    if (!inner) return {};
    return {
      [`s${index}_title`]: inner.querySelector('h1'),
      [`s${index}_kicker`]: inner.querySelector('.presentation-kicker'),
      [`s${index}_groupName`]: index === 0 ? inner.querySelector('h2') : null,
      [`s${index}_subtitle`]: inner.querySelector('.presentation-subtitle'),
      [`s${index}_table`]: inner.querySelector('.presentation-table-wrap') || inner.querySelector('table'),
      [`s${index}_note`]: inner.querySelector('.presentation-note'),
      [`s${index}_thanks`]: inner.querySelector('.thanks-slide')
    };
  }

  function applyTextAndLayoutToElement(el, id, cfg){
    if (!el || !cfg) return;
    const text = cfg.text || cfg.textOverrides || {};
    const layout = Object.assign({}, cfg.stableLayout || {}, cfg.layout || {});
    if (Object.prototype.hasOwnProperty.call(text, id + '__text')) {
      const newText = String(text[id + '__text'] || '');
      if (el.tagName === 'TABLE' || el.querySelector('table')) {
        // Tabelleninhalte werden bewusst nicht durch einen Einzeltext ersetzt.
      } else {
        el.textContent = newText;
      }
    }
    const l = layout[id];
    if (!l || typeof l !== 'object') return;
    el.classList.add('synced-presentation-element');
    el.style.position = 'absolute';
    if (l.x !== undefined) el.style.left = Number(l.x) + '%';
    if (l.y !== undefined) el.style.top = Number(l.y) + '%';
    if (l.w !== undefined) el.style.width = Number(l.w) + '%';
    if (l.h !== undefined) el.style.minHeight = Number(l.h) + '%';
    el.style.boxSizing = 'border-box';
    el.style.zIndex = String(l.z !== undefined ? l.z : 20);
    el.style.transformOrigin = 'center center';
    el.style.transform = `rotate(${Number(l.rot || 0)}deg)`;
    if (l.fontSize !== undefined) el.style.fontSize = Number(l.fontSize) + 'px';
    if (l.color) {
      el.style.color = l.color;
      el.querySelectorAll('th,td,h1,h2,p,span,div').forEach(child => { child.style.color = l.color; });
    }
  }

  function renderSyncedExtras(inner, cfg, index){
    if (!inner || !cfg) return;
    inner.querySelectorAll('.sv-synced-extra,.sv-synced-sticker').forEach(el => el.remove());
    const extras = Array.isArray(cfg.extras) ? cfg.extras : [];
    extras.filter(x => Number(x.slide || 0) === index).forEach((x, n) => {
      const box = document.createElement('div');
      box.className = 'sv-synced-extra';
      box.textContent = String(x.text || '');
      box.style.position = 'absolute';
      box.style.left = Number(x.x || 10) + '%';
      box.style.top = Number(x.y || 70) + '%';
      box.style.width = Number(x.w || 25) + '%';
      box.style.minHeight = Number(x.h || 8) + '%';
      box.style.zIndex = String(x.z || 100 + n);
      box.style.transform = `rotate(${Number(x.rot || 0)}deg)`;
      box.style.fontSize = Number(x.fontSize || 18) + 'px';
      box.style.color = x.color || (cfg.settings && cfg.settings.text) || '#0f172a';
      box.style.whiteSpace = 'pre-wrap';
      inner.appendChild(box);
    });
    const stickers = Array.isArray(cfg.stickers) ? cfg.stickers : [];
    stickers.filter(x => Number(x.slide || 0) === index).forEach((x, n) => {
      if (!x.src || /^data:image\//i.test(String(x.src))) return;
      const img = document.createElement('img');
      img.className = 'sv-synced-sticker';
      img.alt = '';
      img.src = String(x.src);
      img.style.position = 'absolute';
      img.style.left = Number(x.x || 40) + '%';
      img.style.top = Number(x.y || 20) + '%';
      img.style.width = Number(x.w || 18) + '%';
      img.style.height = Number(x.h || 18) + '%';
      img.style.objectFit = 'contain';
      img.style.zIndex = String(x.z || 110 + n);
      img.style.transformOrigin = 'center center';
      img.style.transform = `rotate(${Number(x.rot || 0)}deg)`;
      img.style.pointerEvents = 'none';
      inner.appendChild(img);
    });
  }

  function applySyncedPresentationConfig(){
    const cfg = window.__svActivePresentationConfig || null;
    if (!cfg) return;
    applyThemeToPresentation(cfg.settings || {});
    const slide = document.getElementById('presentationSlide');
    const inner = slide && slide.querySelector('.presentation-slide-inner');
    if (!inner) return;
    inner.style.position = 'relative';
    inner.style.overflow = 'hidden';
    inner.style.width = '100%';
    inner.style.height = '100%';
    const idx = typeof presentationIndexFinal === 'number' ? presentationIndexFinal : 0;
    const map = slideElementMap(idx, inner);
    Object.keys(map).forEach(id => applyTextAndLayoutToElement(map[id], id, cfg));
    renderSyncedExtras(inner, cfg, idx);
  }

  // buildPresentationSlides: aktuelle Gruppen-Konfiguration merken.
  if (typeof buildPresentationSlides === 'function' && !buildPresentationSlides.__svTransferWrapped) {
    const oldBuild = buildPresentationSlides;
    const wrapped = function(row){
      const cfg = extractConfigFromRow(row);
      window.__svActivePresentationConfig = cfg;
      return oldBuild.apply(this, arguments);
    };
    wrapped.__svTransferWrapped = true;
    buildPresentationSlides = window.buildPresentationSlides = wrapped;
  }

  // renderPresentationSlideFinal: nach jedem Standardrender die gespeicherten Parameter anwenden.
  if (typeof renderPresentationSlideFinal === 'function' && !renderPresentationSlideFinal.__svTransferWrapped) {
    const oldRender = renderPresentationSlideFinal;
    const wrappedRender = function(){
      const result = oldRender.apply(this, arguments);
      try { applySyncedPresentationConfig(); } catch(err) { console.warn('Präsentationsparameter konnten nicht angewendet werden:', err); }
      return result;
    };
    wrappedRender.__svTransferWrapped = true;
    renderPresentationSlideFinal = window.renderPresentationSlideFinal = wrappedRender;
  }

  // Absenden: immer kompaktes, übertragbares Schema mitschicken.
  if (typeof buildPayload === 'function' && !buildPayload.__svTransferPayloadWrapped) {
    const oldPayload = buildPayload;
    const wrappedPayload = function(){
      const data = oldPayload.apply(this, arguments) || {};
      const cfg = collectTransferableConfig();
      data.presentationConfig = cfg;
      data.presentationSettings = cfg.settings;
      data.presentationExtras = cfg.extras;
      data.presentationStickers = cfg.stickers;
      data.presentationStableLayout = cfg.stableLayout;
      data.presentationLayout = cfg.layout;
      data.presentationTextOverrides = cfg.textOverrides;
      data.presentationSyncVersion = cfg.version;
      return stripUnsupported(data);
    };
    wrappedPayload.__svTransferPayloadWrapped = true;
    buildPayload = window.buildPayload = wrappedPayload;
  }

  document.addEventListener('DOMContentLoaded', function(){
    installControlCleaner();
    setTimeout(removeUnsupportedImageControls, 250);
    setTimeout(removeUnsupportedImageControls, 1000);
  });
})();
