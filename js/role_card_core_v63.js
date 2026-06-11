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

  const CASE = {
    title: 'Fallbeispiel: Teamteaching in einer ESE-Klasse',
    context: [
      'In einer Klasse mit Schüler*innen mit dem Förderschwerpunkt emotionale und soziale Entwicklung nimmt die pädagogische Instabilität spürbar zu. Im Unterricht entstehen häufiger Unruhe, impulsive Reaktionen, Grenzüberschreitungen und Phasen, in denen einzelne Schüler*innen kaum noch in die gemeinsame Arbeit zurückfinden.',
      'Die Lerngruppe braucht verlässliche Abläufe, klare Zuständigkeiten und ein Team, das nach außen einheitlich handelt. Genau diese Verlässlichkeit gerät im Teamteaching zunehmend unter Druck.',
      'Eine erfahrene Klassenlehrkraft hält an festen Strukturen, eingeübten Routinen und klaren Regeln fest. Sie sieht darin eine notwendige Orientierung für die Schüler*innen und befürchtet, dass zu viele Veränderungen die Klasse zusätzlich verunsichern.',
      'Eine neue Lehrkraft, die frisch aus dem Studium kommt, bringt viele innovative Ideen, hohe Motivation und einen starken Wunsch nach individueller Förderung mit. Sie möchte neue Methoden ausprobieren, greift engagiert in Unterrichtssituationen ein und entscheidet in kritischen Momenten teilweise anders als die Klassenlehrkraft.'
    ],
    conflict: [
      'Dadurch entsteht im Teamteaching ein Konflikt: Die Klassenlehrkraft erlebt die neue Kollegin als zu spontan und als Eingriff in bewährte Absprachen. Die neue Lehrkraft erlebt die Klassenlehrkraft dagegen als zu festgelegt und wenig offen für pädagogische Weiterentwicklung.',
      'Die Schüler*innen nehmen die Uneinigkeit wahr. Regeln werden unterschiedlich ausgelegt, Interventionen wirken widersprüchlich, und die Klasse reagiert mit mehr Unruhe und Unsicherheit.',
      'Beide Lehrkräfte wenden sich schließlich an die Schulleitung und beschweren sich über das Verhalten der jeweils anderen Person. Die Schulleitung versucht zunächst, den Konflikt intern zu klären, merkt aber, dass die Fronten verhärtet sind und dass ein strukturiertes Gespräch mit externer Gesprächsführung nötig wird.'
    ],
    question: 'Deshalb wird eine Supervision einberufen. Ziel ist es, die unterschiedlichen Perspektiven zu klären, die Auswirkungen auf die Klasse sichtbar zu machen und ein gemeinsames, verlässliches Vorgehen für das Teamteaching zu entwickeln.'
  };

  const ROLE_DATA = {
    supervisor: {
      title: 'Rollenkarte: Supervisor*in',
      intro: 'Du leitest das Gespräch. Deine Aufgabe ist nicht, eine Lösung vorzugeben, sondern den Prozess so zu strukturieren, dass alle Beteiligten ihre Perspektiven klären und am Ende eine tragfähige Vereinbarung entsteht.',
      perspective: 'Du stehst außerhalb des Konflikts. Du achtest auf Gesprächsführung, Reihenfolge, Fairness, Verständlichkeit und Ergebnissicherung.',
      bullets: [
        'Eröffne das Gespräch mit einem klaren Rahmen und benenne Ziel, Ablauf und Gesprächsregeln.',
        'Sorge dafür, dass Schulleitung, Lehrkraft A und Lehrkraft B jeweils vollständig zu Wort kommen.',
        'Trenne Beobachtungen, Gefühle, Wünsche und Ziele voneinander.',
        'Fasse regelmäßig zusammen, ohne zu bewerten oder Partei zu ergreifen.',
        'Achte darauf, dass Kritik konkret, situationsbezogen und nicht abwertend formuliert wird.',
        'Führe die Gruppe am Ende zu einer realistischen, gemeinsamen Vereinbarung.'
      ],
      focus: 'Dein Fokus liegt auf Struktur, Verständigung, Deeskalation und einer umsetzbaren Ergebnissicherung.'
    },
    schulleitung: {
      title: 'Rollenkarte: Schulleitung',
      intro: 'Du bringst die Perspektive der Schulleitung ein. Du bist nicht nur Beobachter*in, sondern trägst Verantwortung für pädagogische Qualität, Teamstruktur und Verlässlichkeit im schulischen Alltag.',
      perspective: 'Du nimmst wahr, dass die Situation nicht nur zwischen zwei Personen bleibt, sondern Auswirkungen auf Unterrichtsqualität, Teamkultur und die Stabilität der Klasse hat.',
      bullets: [
        'Beschreibe sachlich, was du im Unterricht oder in Rückmeldungen wahrgenommen hast.',
        'Benenne, warum die Situation aus Leitungsperspektive geklärt werden muss.',
        'Formuliere Erwartungen an verbindliche Zusammenarbeit, Rollenklärung und Kommunikation.',
        'Achte darauf, dass Lösungen im Schulalltag realistisch und überprüfbar sind.',
        'Zeige, wo du unterstützen kannst, ohne die Verantwortung vollständig zu übernehmen.',
        'Prüfe am Ende, ob die getroffene Vereinbarung organisatorisch tragfähig ist.'
      ],
      focus: 'Dein Fokus liegt auf Stabilität, Verlässlichkeit, pädagogischer Qualität und umsetzbaren Rahmenbedingungen.'
    },
    'lehrkraft-a': {
      title: 'Rollenkarte: Lehrkraft A',
      intro: 'Du vertrittst die Perspektive von Lehrkraft A. Du erlebst die Situation als belastend, weil du das Gefühl hast, in schwierigen Momenten häufig allein für Ordnung und Konsequenz sorgen zu müssen.',
      perspective: 'Dir ist wichtig, dass Schüler*innen mit ESE-Förderbedarf klare Orientierung bekommen. Wenn Absprachen nicht eingehalten werden, fühlst du dich in deiner Rolle unsicher und teilweise im Stich gelassen.',
      bullets: [
        'Beschreibe konkret, welche Situationen für dich schwierig sind.',
        'Benenne, welche Gefühle bei dir entstehen, zum Beispiel Druck, Überforderung oder Ärger.',
        'Formuliere, was du von Lehrkraft B und der Schulleitung brauchst.',
        'Achte darauf, bei deiner eigenen Wahrnehmung zu bleiben und keine Schuldzuweisungen zu formulieren.',
        'Überlege, wo du selbst zu mehr Klarheit und Kooperation beitragen kannst.',
        'Arbeite an einer Vereinbarung mit, die klare Zuständigkeiten und abgestimmtes Handeln ermöglicht.'
      ],
      focus: 'Dein Fokus liegt auf Verlässlichkeit, Klarheit, abgestimmtem Handeln und Entlastung im Teamteaching.'
    },
    'lehrkraft-b': {
      title: 'Rollenkarte: Lehrkraft B',
      intro: 'Du vertrittst die Perspektive von Lehrkraft B. Du nimmst die Situation anders wahr und hast Sorge, dass zu viel Strenge die Beziehung zu einzelnen Schüler*innen belastet.',
      perspective: 'Dir ist wichtig, dass pädagogische Interventionen nicht nur konsequent, sondern auch beziehungsorientiert und individuell passend sind. Gleichzeitig merkst du, dass fehlende Abstimmung im Team zu Unsicherheit führt.',
      bullets: [
        'Beschreibe, wie du die Situation im gemeinsamen Unterricht wahrnimmst.',
        'Benenne, welche pädagogischen Anliegen dir wichtig sind.',
        'Formuliere, was du dir von Lehrkraft A und der Schulleitung wünschst.',
        'Achte darauf, deine Haltung nachvollziehbar zu erklären, ohne die Perspektive der anderen abzuwerten.',
        'Überlege, wo du selbst verbindlicher kommunizieren oder klarer handeln kannst.',
        'Arbeite an einer Vereinbarung mit, die Beziehungsgestaltung und Verlässlichkeit verbindet.'
      ],
      focus: 'Dein Fokus liegt auf Beziehungsgestaltung, individueller Förderung, Verständigung und gemeinsamer pädagogischer Linie.'
    },
    protokoll: {
      title: 'Rollenkarte: Protokoll',
      intro: 'Du dokumentierst die Supervision. Deine Aufgabe ist es, die Beiträge neutral, klar und strukturiert festzuhalten, damit daraus später eine verständliche Ergebnispräsentation entstehen kann.',
      perspective: 'Du bist nicht für die Lösung verantwortlich, aber du sicherst, dass zentrale Aussagen, Ziele, positive Rückmeldungen und Vereinbarungen nicht verloren gehen.',
      bullets: [
        'Notiere Beobachtungen, Gefühle, Wünsche und Ziele getrennt voneinander.',
        'Halte die gemeinsame Zielvereinbarung möglichst präzise fest.',
        'Dokumentiere in Phase 4 die positiven Rückmeldungen getrennt zur Schulleitung, zu Lehrkraft A und zu Lehrkraft B.',
        'Sichere Zustimmung, offene Punkte und konkrete nächste Schritte.',
        'Achte auf neutrale Sprache und vermeide wertende Formulierungen.',
        'Bereite am Ende die Ergebnisübermittlung und Präsentation vor.'
      ],
      focus: 'Dein Fokus liegt auf Klarheit, Vollständigkeit, neutraler Dokumentation und einer präsentablen Ergebnissicherung.'
    }
  };

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
  function supervisorModeSuffixV108(file){
    if(role() !== 'supervisor') return '';
    if(file === 'ablauf-supervisor-moderation.html') return '&supervisorMode=moderation&members=5';
    if(file === 'ablauf-supervisor.html') return '&supervisorMode=full&members=4';
    return '';
  }
  function rememberSupervisorModeV108(file){
    try{
      if(role() !== 'supervisor') return;
      const gid = groupId() || 'default';
      const mode = file === 'ablauf-supervisor-moderation.html' ? 'moderation' : 'full';
      localStorage.setItem('sv_supervisor_mode_' + gid, mode);
      localStorage.setItem('sv_supervisor_mode_active', mode);
    }catch(_){}
  }
  function hasProtocolCachedV105(){
    try{
      const p=new URLSearchParams(location.search);
      const gid=p.get('g')||p.get('groupId')||localStorage.getItem('sv_current_group')||localStorage.getItem('sv_group_id')||'';
      const members=JSON.parse(localStorage.getItem('sv_cached_group_members_'+gid)||localStorage.getItem('sv_cached_group_members_active')||'[]')||[];
      if(Array.isArray(members)&&members.some(m=>m&&m.role==='protokoll')) return true;
      if(p.get('members')==='5'||p.get('size')==='5'||p.get('groupSize')==='5') return true;
    }catch(_){}
    return false;
  }


  function groupMembersContextV111(){
    try{
      const gid=groupId() || localStorage.getItem('sv_current_group') || localStorage.getItem('sv_group_id') || '';
      return JSON.parse(localStorage.getItem('sv_cached_group_members_'+gid)||localStorage.getItem('sv_cached_group_members_active')||'[]')||[];
    }catch(_){ return []; }
  }
  function assignmentsContextV111(){
    const out={};
    try{ Object.assign(out, JSON.parse(localStorage.getItem('sv_role_names_v58')||'{}')||{}); }catch(_){}
    try{
      const gid=groupId() || localStorage.getItem('sv_current_group') || '';
      Object.assign(out, JSON.parse(localStorage.getItem('sv_'+gid+'_assignments')||'{}')||{});
      Object.assign(out, JSON.parse(localStorage.getItem('sv_'+gid+'_group_assignments')||'{}')||{});
    }catch(_){}
    try{
      const members=groupMembersContextV111();
      members.forEach(m=>{ if(m&&m.role) out[m.role]=m.name||m.deviceId||true; });
    }catch(_){}
    return out;
  }
  function supervisorHasProtocolV111(){
    try{
      const p=new URLSearchParams(location.search);
      if(p.get('supervisorMode')==='moderation'||p.get('members')==='5'||p.get('size')==='5'||p.get('groupSize')==='5') return true;
      if(p.get('supervisorMode')==='full'||p.get('members')==='4'||p.get('size')==='4'||p.get('groupSize')==='4') return false;
    }catch(_){}
    const members=groupMembersContextV111();
    if(Array.isArray(members) && (members.length>=5 || members.some(m=>m&&m.role==='protokoll'))) return true;
    const map=assignmentsContextV111();
    return !!(map && map.protokoll);
  }
  function supervisorFileV111(){
    return supervisorHasProtocolV111() ? 'ablauf-supervisor-moderation.html' : 'ablauf-supervisor.html';
  }
  function supervisorModeParamsV111(){
    const has=supervisorHasProtocolV111();
    return '&supervisorMode='+(has?'moderation':'full')+'&members='+(has?'5':'4');
  }
  function rememberSupervisorModeV111(){
    try{
      const gid=groupId()||'default';
      const has=supervisorHasProtocolV111();
      localStorage.setItem('sv_supervisor_mode_'+gid, has?'moderation':'full');
      localStorage.setItem('sv_supervisor_mode_active', has?'moderation':'full');
    }catch(_){}
  }


  function groupMembersCleanV119(){
    try{
      const gid = groupId() || localStorage.getItem('sv_current_group') || localStorage.getItem('sv_group_id') || '';
      return JSON.parse(localStorage.getItem('sv_cached_group_members_'+gid) || localStorage.getItem('sv_cached_group_members_active') || '[]') || [];
    }catch(_){ return []; }
  }
  function assignmentsCleanV119(){
    const out = {};
    try{ Object.assign(out, JSON.parse(localStorage.getItem('sv_role_names_v58') || '{}') || {}); }catch(_){}
    try{
      const gid = groupId() || localStorage.getItem('sv_current_group') || '';
      Object.assign(out, JSON.parse(localStorage.getItem('sv_'+gid+'_assignments') || '{}') || {});
      Object.assign(out, JSON.parse(localStorage.getItem('sv_'+gid+'_group_assignments') || '{}') || {});
    }catch(_){}
    groupMembersCleanV119().forEach(m => { if(m && m.role) out[m.role] = m.name || m.deviceId || true; });
    return out;
  }
  function supervisorHasProtocolCleanV119(){
    try{
      const p = new URLSearchParams(location.search);
      if(p.get('supervisorMode') === 'moderation' || p.get('members') === '5' || p.get('size') === '5' || p.get('groupSize') === '5') return true;
      if(p.get('supervisorMode') === 'full' || p.get('members') === '4' || p.get('size') === '4' || p.get('groupSize') === '4') return false;
    }catch(_){}
    const members = groupMembersCleanV119();
    if(Array.isArray(members) && (members.length >= 5 || members.some(m => m && m.role === 'protokoll'))) return true;
    const map = assignmentsCleanV119();
    return !!(map && map.protokoll);
  }
  function supervisorFileCleanV119(){ return supervisorHasProtocolCleanV119() ? 'ablauf-supervisor-moderation.html' : 'ablauf-supervisor.html'; }
  function supervisorModeParamsCleanV119(){
    const has = supervisorHasProtocolCleanV119();
    return '&supervisorMode=' + (has ? 'moderation' : 'full') + '&members=' + (has ? '5' : '4');
  }
  function rememberSupervisorModeCleanV119(){
    try{
      const gid = groupId() || 'default';
      const mode = supervisorHasProtocolCleanV119() ? 'moderation' : 'full';
      localStorage.setItem('sv_supervisor_mode_' + gid, mode);
      localStorage.setItem('sv_supervisor_mode_active', mode);
    }catch(_){}
  }

  function color(roleKey){
    return ROLE_COLORS[roleKey] || '#24456b';
  }
  function list(items){
    return '<ul class="tight">' + items.map(item => '<li>' + esc(item) + '</li>').join('') + '</ul>';
  }
  function paragraphs(items){
    return items.map(item => '<p>' + esc(item) + '</p>').join('');
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
        <p>${esc(data.intro)}</p>
        <h3>Rollenperspektive</h3>
        <p>${esc(data.perspective)}</p>
        <h3>Deine Aufgaben</h3>
        ${list(data.bullets)}
        <h3>Fokus im Gespräch</h3>
        <p>${esc(data.focus)}</p>
      </div>
      <div class="card role-card-case">
        <h2>${esc(CASE.title)}</h2>
        <h3>Ausgangslage</h3>
        ${paragraphs(CASE.context)}
        <h3>Konfliktlinien</h3>
        ${list(CASE.conflict)}
        <h3>Supervisionsfrage</h3>
        <div class="notice">${esc(CASE.question)}</div>
      </div>`;

    const next = document.getElementById('nextPrep');
    if (next) {
      const file = supervisorFileCleanV119();
      const suffix = querySuffix();
      rememberSupervisorModeV108(file); if(roleKey==='supervisor') rememberSupervisorModeV111(); if(roleKey === 'supervisor') rememberSupervisorModeCleanV119(); next.href = file + '?role=' + encodeURIComponent(roleKey) + (suffix ? '&' + suffix : '') + (roleKey === 'supervisor' ? supervisorModeParamsCleanV119() : '');
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