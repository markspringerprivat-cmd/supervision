(function(){
  'use strict';

  const ROLE_LABELS = {
    supervisor: 'Supervisor*in',
    schulleitung: 'Schulleitung',
    'lehrkraft-a': 'Lehrkraft A',
    'lehrkraft-b': 'Lehrkraft B',
    protokoll: 'Protokoll'
  };
  const ROLE_COLORS = {
    supervisor: '#2f6fb0',
    schulleitung: '#2f9e44',
    'lehrkraft-a': '#d62828',
    'lehrkraft-b': '#d62828',
    protokoll: '#d99000'
  };
  const FLOW_FILES = {
    supervisor: 'ablauf-supervisor.html',
    schulleitung: 'ablauf-schulleitung.html',
    'lehrkraft-a': 'ablauf-lehrkraft.html',
    'lehrkraft-b': 'ablauf-lehrkraft.html',
    protokoll: 'ablauf-protokoll.html'
  };
  const ROLE_DATA = {
    supervisor: {
      title: 'Rollenkarte: Supervisor*in',
      intro: 'Du leitest das Gespräch. Deine Aufgabe ist nicht, eine Lösung vorzugeben, sondern die Supervision so zu strukturieren, dass alle Beteiligten zu einer tragfähigen Vereinbarung kommen.',
      bullets: [
        'Du klärst Rahmen, Gesprächsregeln und Ziel der Supervision.',
        'Du gibst den Beteiligten nacheinander das Wort und sicherst, dass alle Perspektiven hörbar werden.',
        'Du fasst zentrale Punkte zusammen und arbeitest mit der Gruppe auf eine gemeinsame Vereinbarung hin.',
        'Du achtest auf respektvolle Sprache, Struktur und Praxistauglichkeit.'
      ],
      focus: 'Dein Fokus liegt auf Gesprächsführung, Strukturierung, Klärung und Ergebnissicherung.'
    },
    schulleitung: {
      title: 'Rollenkarte: Schulleitung',
      intro: 'Du bringst die Perspektive der Schulleitung ein und achtest darauf, dass pädagogische, organisatorische und schulische Rahmenbedingungen sichtbar werden.',
      bullets: [
        'Du beschreibst deine Beobachtungen sachlich und konkret.',
        'Du benennst, welche Auswirkungen die Situation auf Unterricht, Team und Klasse hat.',
        'Du formulierst Wünsche an Zusammenarbeit, Verlässlichkeit und gemeinsame Absprachen.',
        'Du prüfst am Ende, ob die Vereinbarungen im Schulalltag umsetzbar sind.'
      ],
      focus: 'Dein Fokus liegt auf Stabilität, organisatorischer Umsetzbarkeit und verbindlichen Absprachen.'
    },
    'lehrkraft-a': {
      title: 'Rollenkarte: Lehrkraft A',
      intro: 'Du vertrittst eine der beiden Lehrkraftperspektiven. Beschreibe deine Wahrnehmung, Gefühle und Wünsche möglichst konkret.',
      bullets: [
        'Du schilderst, wie du die Situation im Teamteaching erlebst.',
        'Du beschreibst, welche Gefühle und Belastungen bei dir entstehen.',
        'Du formulierst, was du dir von der anderen Lehrkraft und der Schulleitung wünschst.',
        'Du arbeitest an einer gemeinsamen, realistischen Vereinbarung mit.'
      ],
      focus: 'Dein Fokus liegt auf deiner eigenen Perspektive, deiner Belastung und deinen Wünschen für eine bessere Zusammenarbeit.'
    },
    'lehrkraft-b': {
      title: 'Rollenkarte: Lehrkraft B',
      intro: 'Du vertrittst die zweite Lehrkraftperspektive. Beschreibe deine Wahrnehmung, Gefühle und Wünsche möglichst konkret.',
      bullets: [
        'Du schilderst deine Sicht auf die Zusammenarbeit und die Unterrichtssituation.',
        'Du machst deutlich, welche pädagogischen oder persönlichen Anliegen dir wichtig sind.',
        'Du formulierst, was du brauchst, damit Zusammenarbeit verlässlicher gelingt.',
        'Du bringst dich in die gemeinsame Zielformulierung und Vereinbarung ein.'
      ],
      focus: 'Dein Fokus liegt auf deiner Rolle im Team, deinen pädagogischen Anliegen und abgestimmtem Handeln.'
    },
    protokoll: {
      title: 'Rollenkarte: Protokoll',
      intro: 'Du dokumentierst die Ergebnisse. Deine Aufgabe ist es, die Beiträge neutral und strukturiert festzuhalten.',
      bullets: [
        'Du notierst Probleme, Gefühle, Wünsche und Ziele getrennt voneinander.',
        'Du hältst nachvollziehbare Perspektiven und konkrete Absprachen fest.',
        'Du achtest besonders auf die gemeinsame Zielvereinbarung.',
        'Du bereitest die Ergebnisübermittlung und Präsentation vor.'
      ],
      focus: 'Dein Fokus liegt auf neutraler Dokumentation, klaren Ergebnissen und der späteren Ergebnisübermittlung.'
    }
  };

  const CASE_TEXT = 'Der Fall betrifft eine ESE-Klasse, in der uneinheitliches Teamteaching zu Verunsicherung und fehlender Stabilität führt.';
  const SUPERVISION_QUESTION = 'Wie kann das Team ein gemeinsames, verlässliches Vorgehen entwickeln?';

  function esc(value){
    return String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function params(){
    try { return new URLSearchParams(location.search); } catch(_) { return new URLSearchParams(); }
  }
  function groupId(){
    const p = params();
    const gid = p.get('groupId') || p.get('g') || localStorage.getItem('sv_current_group') || localStorage.getItem('sv_group_id') || '';
    if (gid) {
      try {
        localStorage.setItem('sv_current_group', gid);
        localStorage.setItem('sv_group_id', gid);
      } catch(_) {}
    }
    return gid;
  }
  function role(){
    const bodyRole = document.body && document.body.dataset ? document.body.dataset.role : '';
    return bodyRole || params().get('role') || 'supervisor';
  }
  function appUrl(){
    return (window.SUPERVISION_CONFIG && window.SUPERVISION_CONFIG.APPS_SCRIPT_URL) || '';
  }
  function jsonp(payload, timeout){
    const url = appUrl();
    return new Promise((resolve, reject) => {
      if (!url) { reject(new Error('Keine Apps-Script-URL konfiguriert.')); return; }
      const cb = 'roleCardCb_' + Date.now() + '_' + Math.floor(Math.random()*1e9);
      const q = new URLSearchParams(payload || {});
      q.set('callback', cb);
      q.set('_', Date.now());
      const s = document.createElement('script');
      let done = false;
      window[cb] = data => { done = true; cleanup(); resolve(data); };
      function cleanup(){ try{ delete window[cb]; }catch(_){} if(s.parentNode) s.parentNode.removeChild(s); }
      s.onerror = () => { if(!done){ cleanup(); reject(new Error('Server nicht erreichbar.')); } };
      s.src = url + (url.includes('?') ? '&' : '?') + q.toString();
      document.body.appendChild(s);
      setTimeout(() => { if(!done){ cleanup(); reject(new Error('Zeitüberschreitung.')); } }, timeout || 9000);
    });
  }
  function storedNames(){
    try { return JSON.parse(localStorage.getItem('sv_role_names_v58') || '{}') || {}; } catch(_) { return {}; }
  }
  function saveNames(map){
    try { localStorage.setItem('sv_role_names_v58', JSON.stringify(map || {})); } catch(_) {}
  }
  function querySuffix(){
    const gid = groupId();
    return gid ? ('groupId=' + encodeURIComponent(gid)) : '';
  }
  function color(roleKey){
    return ROLE_COLORS[roleKey] || '#24456b';
  }
  function renderBase(){
    const roleKey = role();
    const label = ROLE_LABELS[roleKey] || roleKey;
    const data = ROLE_DATA[roleKey] || ROLE_DATA.supervisor;
    const target = document.getElementById('roleCard');
    if (!target) return;

    const known = storedNames();
    const assignedName = known[roleKey] || '';

    document.title = data.title;
    const headerTitle = document.querySelector('header h1');
    if (headerTitle) headerTitle.textContent = data.title;

    target.innerHTML = `
      <div class="card highlight role-card-main">
        <p class="role-pill" style="color:${color(roleKey)}">${esc(label)}</p>
        <h2>${esc(data.title)}</h2>
        <p><strong>Zugewiesene Person:</strong> <span id="assignedPersonName" data-assigned-name-for="${esc(roleKey)}">${assignedName ? esc(assignedName) : '<span class="sv-spinner tiny"></span> wird geladen / nicht gesetzt'}</span></p>
        <p>${esc(data.intro)}</p>
        <h3>Deine Aufgabe</h3>
        <ul class="tight">${data.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
        <h3>Fokus im Fall</h3>
        <p>${esc(data.focus)}</p>
      </div>
      <div class="card role-card-case">
        <h2>Fallgrundlage</h2>
        <div class="readonly-box">${esc(CASE_TEXT)}</div>
        <h3>Supervisionsfrage</h3>
        <div class="notice">${esc(SUPERVISION_QUESTION)}</div>
      </div>`;

    const next = document.getElementById('nextPrep');
    if (next) {
      const file = FLOW_FILES[roleKey] || 'ablauf-supervisor.html';
      const suffix = querySuffix();
      next.href = file + '?role=' + encodeURIComponent(roleKey) + (suffix ? '&' + suffix : '');
      next.classList.remove('is-busy');
    }

    const back = document.getElementById('backToRolesOverview');
    if (back) {
      const suffix = querySuffix();
      back.href = 'rollen.html' + (suffix ? '?' + suffix : '');
      back.classList.remove('is-busy');
    }

    const footerGid = document.querySelector('[data-group-id]');
    if (footerGid) footerGid.textContent = groupId() || '—';
  }
  async function loadAssignedName(){
    const gid = groupId();
    if (!gid) return;
    const roleKey = role();
    try {
      const res = await jsonp({ action:'listGroupMembers', groupId: gid }, 9000);
      if (!res || res.ok === false || !Array.isArray(res.members)) return;
      const map = storedNames();
      res.members.forEach(m => { if (m && m.role && m.name) map[m.role] = m.name; });
      saveNames(map);
      const el = document.getElementById('assignedPersonName');
      if (el) el.textContent = map[roleKey] || 'nicht gesetzt';
    } catch (err) {
      const el = document.getElementById('assignedPersonName');
      if (el && /wird geladen/.test(el.textContent || '')) el.textContent = 'nicht gesetzt';
    }
  }
  function boot(){
    renderBase();
    loadAssignedName();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();