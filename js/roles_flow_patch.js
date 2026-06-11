
/* v119: zentrale, einzige Supervisor-4er/5er-Erkennung */
window.__svSupervisorHasProtocolCleanV119 = window.__svSupervisorHasProtocolCleanV119 || function(){
  try{
    const p = new URLSearchParams(location.search);
    if(p.get('supervisorMode') === 'moderation' || p.get('members') === '5' || p.get('size') === '5' || p.get('groupSize') === '5') return true;
    if(p.get('supervisorMode') === 'full' || p.get('members') === '4' || p.get('size') === '4' || p.get('groupSize') === '4') return false;
    const gid = p.get('g') || p.get('groupId') || localStorage.getItem('sv_current_group') || localStorage.getItem('sv_group_id') || '';
    const members = JSON.parse(localStorage.getItem('sv_cached_group_members_'+gid) || localStorage.getItem('sv_cached_group_members_active') || '[]') || [];
    if(Array.isArray(members) && (members.length >= 5 || members.some(m => m && m.role === 'protokoll'))) return true;
    const merged = {};
    try{ Object.assign(merged, JSON.parse(localStorage.getItem('sv_role_names_v58') || '{}') || {}); }catch(_){}
    try{ Object.assign(merged, JSON.parse(localStorage.getItem('sv_'+gid+'_assignments') || '{}') || {}); }catch(_){}
    try{ Object.assign(merged, JSON.parse(localStorage.getItem('sv_'+gid+'_group_assignments') || '{}') || {}); }catch(_){}
    try{ const a = (typeof loadObj === 'function') ? loadObj('assignments', {}) : {}; Object.assign(merged, a || {}); }catch(_){}
    return !!merged.protokoll;
  }catch(_){ return false; }
};
window.__svSupervisorModeCleanV119 = function(){ return window.__svSupervisorHasProtocolCleanV119() ? 'moderation' : 'full'; };



window.__svSupervisorHasProtocolV108 = window.__svSupervisorHasProtocolV108 || function(){
  try{
    const mode=window.__svSupervisorModeV108();
    if(mode==='moderation') return true;
    if(mode==='full') return false;
    const p=new URLSearchParams(location.search);
    const gid=p.get('g')||p.get('groupId')||localStorage.getItem('sv_current_group')||localStorage.getItem('sv_group_id')||'';
    const a=(typeof loadObj==='function')?loadObj('assignments',{}):{};
    if(a&&a.protokoll) return true;
    const m=JSON.parse(localStorage.getItem('sv_cached_group_members_'+gid)||localStorage.getItem('sv_cached_group_members_active')||'[]')||[];
    return Array.isArray(m)&&m.some(x=>x&&x.role==='protokoll');
  }catch(_){return false;}
};

/* Rollen-/Ablauf-Patch v12: saubere Namensliste, Rollenkarten, rollenabhängige Ablaufseiten. */
(function(){
  const ROLE_LABELS = {
    supervisor: 'Supervisor*in',
    schulleitung: 'Schulleitung',
    'lehrkraft-a': 'Lehrkraft A',
    'lehrkraft-b': 'Lehrkraft B',
    protokoll: 'Protokoll'
  };
  const ROLE_FILES_PATCH = {
    supervisor: 'rolle-supervisor.html',
    schulleitung: 'rolle-schulleitung.html',
    'lehrkraft-a': 'rolle-lehrkraft-a.html',
    'lehrkraft-b': 'rolle-lehrkraft-b.html'
  };
  const CASE_TEXT_PATCH = `In einer Klasse mit Förderbedarf im Bereich emotionale und soziale Entwicklung kommt es regelmäßig zu Unruhe, Verweigerung und impulsiven Reaktionen einzelner Schüler*innen. Besonders in offenen Arbeitsphasen wird deutlich, dass die Klasse klare, verlässliche Absprachen braucht.

In der Klasse arbeiten zwei Lehrkräfte im Teamteaching. Lehrkraft A arbeitet seit mehreren Jahren mit einem festen, strukturierenden Vorgehen. Lehrkraft B ist neu im Team und möchte stärker beziehungs- und ressourcenorientiert arbeiten.

In einer Unterrichtsstunde entsteht vor der Klasse der Eindruck, dass beide Lehrkräfte nicht gemeinsam handeln. Lehrkraft A fühlt sich untergraben, Lehrkraft B fühlt sich nicht ernst genommen. Die Schulleitung nimmt wahr, dass der Konflikt die Unterrichtsstabilität belastet und schaltet eine Supervisor*in ein.`;
  const SUPERVISION_QUESTION_PATCH = 'Wie kann das Team ein gemeinsames, verlässliches Vorgehen für die Klasse entwickeln, ohne dass der Konflikt zwischen den Lehrkräften weiter eskaliert?';
  const ROLECARD_PATCH = {
    supervisor: {
      title: 'Rollenkarte: Supervisor*in',
      intro: 'Du leitest die Gruppensupervision. Du bist nicht Schiedsrichter*in, sondern strukturierst den Prozess und sicherst, dass alle Perspektiven gehört werden.',
      bullets: ['Klare Gesprächsstruktur herstellen.', 'Ich-Aussagen und konkrete Beobachtungen einfordern.', 'Schuldzuweisungen unterbrechen.', 'Ziele, Zwischenergebnisse und Absprachen sichern.'],
      caseFocus: 'Dein Fokus liegt auf Prozessklarheit, Gesprächssicherheit und einer gemeinsamen Arbeitsgrundlage.'
    },
    schulleitung: {
      title: 'Rollenkarte: Schulleitung',
      intro: 'Du hast die Supervision angeregt, weil der Konflikt im Teamteaching die Klasse und die Zusammenarbeit belastet.',
      bullets: ['Du beschreibst den Anlass aus Leitungssicht.', 'Du benennst Beobachtungen, Gefühle und Wünsche.', 'Du achtest auf einen verlässlichen Rahmen für die Klasse.', 'Du prüfst, welche Unterstützung die Schule leisten kann.'],
      caseFocus: 'Dein Fokus liegt auf Stabilität, professioneller Zusammenarbeit und umsetzbaren Vereinbarungen.'
    },
    'lehrkraft-a': {
      title: 'Rollenkarte: Lehrkraft A – erfahrene Teamteaching-Lehrkraft',
      intro: 'Du arbeitest schon länger im Teamteaching und setzt auf klare, strukturierende Interventionen.',
      bullets: ['Du erlebst dein Vorgehen als bewährt und stabilisierend.', 'Du fühlst dich irritiert, wenn vor der Klasse anders eingegriffen wird.', 'Du möchtest handlungsfähig bleiben.', 'Du brauchst verlässliche Absprachen im Team.'],
      caseFocus: 'Dein Fokus liegt auf Klarheit, Verlässlichkeit und pädagogischer Handlungsfähigkeit.'
    },
    'lehrkraft-b': {
      title: 'Rollenkarte: Lehrkraft B – neue Teamteaching-Lehrkraft',
      intro: 'Du bist neu im Team und möchtest stärker beziehungs- und ressourcenorientiert arbeiten.',
      bullets: ['Du möchtest alternative Methoden erproben.', 'Du willst Eskalationen früher vorbeugen.', 'Du fühlst dich mit neuen Ideen nicht immer ernst genommen.', 'Du brauchst Absprachen, wie Veränderung im Team gelingen kann.'],
      caseFocus: 'Dein Fokus liegt auf Weiterentwicklung, Beziehungsgestaltung und abgestimmtem Handeln im Team.'
    }
  };
  const FLOW_TEXTS = {
    supervisor: [
      ['Rolle und Rahmen klären', 'Du eröffnest das Gespräch, erklärst den Zweck der Supervision und achtest auf Freiwilligkeit, Vertraulichkeit und respektvolle Sprache.'],
      ['Erstkontakt moderieren', 'Du prüfst, ob alle Beteiligten bereit sind, zuzuhören, ihre Perspektive einzubringen und an einer gemeinsamen Klärung mitzuarbeiten.'],
      ['Problembeschreibung sammeln', 'Du gibst zunächst der Schulleitung das Wort und lässt anschließend die Lehrkräfte ergänzen. Wichtig: Beobachtungen, Gefühle und Wünsche getrennt erfassen.'],
      ['Ziele herausarbeiten', 'Du fragst nach individuellen Zielen und bündelst anschließend Gemeinsamkeiten zu einer gemeinsamen Zielvereinbarung.'],
      ['Vertiefte Bearbeitung anleiten', 'Du leitest das Gespräch über hilfreiche Kritik, Anerkennung und mögliche Absprachen für das Teamteaching.'],
      ['Ergebnisse sichern', 'Du fasst Probleme, Wünsche, Zielvereinbarung, Absprachen und Praxistauglichkeit zusammen und bereitest die Übermittlung vor.']
    ],
    schulleitung: [
      ['Anlass sortieren', 'Überlege, warum du die Supervision eingeschaltet hast: Was hast du beobachtet und warum reicht eine direkte Klärung nicht mehr aus?'],
      ['Eigene Perspektive vorbereiten', 'Formuliere deine Beobachtung sachlich. Trenne Beobachtung, Gefühl und Wunsch klar voneinander.'],
      ['Im Gespräch den Rahmen halten', 'Du bist Teil des Gesprächs, aber auch Leitungsperson. Achte darauf, nicht vorschnell Partei zu ergreifen.'],
      ['Ziel aus Leitungssicht formulieren', 'Überlege, was die Schule braucht: mehr Verlässlichkeit, klare Absprachen, Schutz der Klasse, Entlastung des Teams.'],
      ['Umsetzung prüfen', 'Du überlegst, welche Unterstützung realistisch ist: Gesprächszeit, Hospitation, gemeinsame Planung oder verbindliche Absprachen.'],
      ['Praxistauglichkeit einschätzen', 'Am Ende prüfst du, ob die Vereinbarung im Schulalltag tragfähig ist und wie du die Umsetzung begleiten kannst.']
    ],
    lehrkraft: [
      ['Eigene Rolle klären', 'Überlege, aus welcher Perspektive du in das Gespräch gehst: Was ist dir wichtig und wo fühlst du dich missverstanden?'],
      ['Beobachtung statt Vorwurf', 'Bereite vor, was du konkret beobachtet hast. Vermeide Bewertungen über die andere Person.'],
      ['Gefühle und Wünsche formulieren', 'Benenne, was die Situation bei dir auslöst und was du dir für das Teamteaching wünschst.'],
      ['Ziel formulieren', 'Überlege, woran du merken würdest, dass die Zusammenarbeit wieder besser funktioniert.'],
      ['Kritik hilfreich äußern', 'Achte darauf, Kritik als Wunsch oder konkreten Verbesserungsvorschlag zu formulieren.'],
      ['Absprachen mittragen', 'Am Ende prüfst du, welchen konkreten Beitrag du selbst leisten kannst, damit eine gemeinsame Lösung umgesetzt wird.']
    ],
    general: [
      ['Orientierung', 'Lies den Ablauf einmal vollständig. Danach bereitest du deine Rolle vor.'],
      ['Perspektive', 'Formuliere Beobachtungen, Gefühle und Wünsche möglichst konkret.'],
      ['Supervision', 'Die Gruppe arbeitet Schritt für Schritt an Problembeschreibung, Ziel, Vertiefung und Umsetzung.']
    ]
  };
  function esc(v){
    if (typeof escapeHtml === 'function') return escapeHtml(v);
    return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }
  function localSlug(s){
    return (s || '').toString().trim().toLowerCase()
      .replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss')
      .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  }
  function readNameList(){
    const stored = (typeof loadText === 'function') ? loadText('namesInput') : '';
    return stored.split(/\n|,/).map(s=>s.trim()).filter(Boolean);
  }
  function saveNameList(names){
    if (typeof saveText === 'function') saveText('namesInput', names.join('\n'));
    const textarea=document.getElementById('namesInput');
    if(textarea) textarea.value=names.join('\n');
  }
  function shuffleLocal(arr){
    return arr.map(v => [Math.random(), v]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
  }
  function buildRoleUrl(file){
    try { return new URL((typeof linkWithState === 'function' ? linkWithState(file) : file), window.location.href).toString(); }
    catch(e){ return file; }
  }
  function renderNameList(names){
    const list=document.getElementById('namesList');
    if(!list) return;
    list.innerHTML='';
    if(!names.length){
      const li=document.createElement('li');
      li.className='empty-name-list';
      li.innerHTML='<span class="name-index">–</span><span>Noch keine Namen eingetragen.</span><span></span>';
      list.appendChild(li);
      return;
    }
    names.forEach((name,index)=>{
      const li=document.createElement('li');
      li.innerHTML=`<span class="name-index">${index+1}</span><span>${esc(name)}</span><button type="button" class="remove-name-btn" aria-label="${esc(name)} entfernen">×</button>`;
      li.querySelector('button').addEventListener('click',()=>{
        names.splice(index,1); saveNameList(names); renderNameList(names);
        const status=document.getElementById('assignStatus');
        if(status){ status.className='notice'; status.textContent='Name wurde entfernt. Bitte die Rollen neu zuweisen.'; }
      });
      list.appendChild(li);
    });
  }
  window.initRoleAssignment = function(){
    if (typeof initCommon === 'function') initCommon();
    const input=document.getElementById('newNameInput');
    const addBtn=document.getElementById('addNameBtn');
    const assignBtn=document.getElementById('assignBtn');
    const assignedBox=document.getElementById('assignedBox');
    const cardsBox=document.getElementById('roleCards');
    const status=document.getElementById('assignStatus');
    let names=readNameList();
    renderNameList(names);
    function setStatus(text, cls='small'){
      if(status){ status.className=cls; status.textContent=text; }
    }
    function addName(){
      const value=(input && input.value || '').trim();
      if(!value){ setStatus('Bitte zuerst einen Namen eintragen.','warning'); return; }
      names.push(value); saveNameList(names); renderNameList(names); if(input) input.value=''; setStatus('Name wurde hinzugefügt.','success'); input && input.focus();
    }
    if(addBtn) addBtn.addEventListener('click', addName);
    if(input) input.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); addName(); }});
    function renderAssignments(assignments){
      if(assignedBox){
        assignedBox.innerHTML='';
        ['supervisor','schulleitung','lehrkraft-a','lehrkraft-b','protokoll'].forEach(role=>{
          if(!assignments[role]) return;
          const li=document.createElement('li');
          li.innerHTML=`<span class="role-pill">${ROLE_LABELS[role]}</span><strong>${esc(assignments[role])}</strong>`;
          assignedBox.appendChild(li);
        });
      }
      if(cardsBox){
        cardsBox.innerHTML='';
        ['supervisor','schulleitung','lehrkraft-a','lehrkraft-b'].forEach(role=>{
          const file=ROLE_FILES_PATCH[role];
          const href=`${file}?${typeof currentQueryString==='function'?currentQueryString():''}`;
          const url=buildRoleUrl(file);
          const card=document.createElement('div');
          card.className='card compact role-qr-card';
          card.innerHTML=`
            <div class="role-card-head"><span class="role-pill">${ROLE_LABELS[role]}</span><span class="assigned-name">${esc(assignments[role] || 'nicht zugewiesen')}</span></div>
            <p class="small role-card-help">Kachel öffnen oder QR-Code mit dem Handy scannen.</p>
            <div class="role-card-action"><a class="button" href="${href}">Rollenkarte öffnen</a></div>
            <div class="role-card-qr"><img class="qr" alt="QR-Code für ${ROLE_LABELS[role]}" src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}"></div>`;
          cardsBox.appendChild(card);
        });
        cardsBox.style.display='grid';
      }
    }
    if(assignBtn) assignBtn.addEventListener('click',()=>{
      names=readNameList();
      if(names.length < 4){ setStatus('Bitte mindestens 4 Namen eintragen.','warning'); return; }
      const groupSlug = names.map(localSlug).filter(Boolean).join('-').slice(0,80) || ('gruppe-' + Date.now().toString(36));
      localStorage.setItem('sv_current_group', groupSlug);
      const randomized=shuffleLocal(names);
      const assignments={ supervisor: randomized[0], schulleitung: randomized[1], 'lehrkraft-a': randomized[2], 'lehrkraft-b': randomized[3] };
      if(randomized[4]) assignments.protokoll=randomized[4];
      if(typeof saveObj==='function') saveObj('assignments', assignments);
      setStatus('Rollen wurden zufällig zugeteilt. Die Kacheln und QR-Codes sind jetzt verfügbar.','success');
      renderAssignments(assignments);
    });
    const existing=(typeof loadObj==='function') ? loadObj('assignments', null) : null;
    if(existing && Object.keys(existing).length) renderAssignments(existing);
  };
  try { initRoleAssignment = window.initRoleAssignment; } catch(e) {}

  window.initRoleCard = function(){
    if (typeof initCommon === 'function') initCommon();
    const role = (typeof getPageRole === 'function' ? getPageRole() : document.body.dataset.role);
    const data = ROLECARD_PATCH[role];
    const target=document.getElementById('roleCard');
    if(!data || !target) return;
    const assigned = (typeof roleName === 'function') ? roleName(role) : '';
    target.innerHTML=`
      <div class="card highlight">
        <p class="role-pill role-name-pill" data-role-label="${esc(role)}">${esc((assigned ? (assigned + " (" + (ROLE_LABELS[role] || role) + ")") : (ROLE_LABELS[role] || role)))}</p>
        <h2>${esc(data.title)}</h2>
        <p><strong>Diese Rollenkarte gehört:</strong> <span data-assigned-name-for="${esc(role)}">${esc(assigned || "nicht gesetzt")}</span></p>
        <p>${esc(data.intro)}</p>
        <h3>Deine Aufgabe</h3>
        <ul class="tight">${data.bullets.map(b=>`<li>${esc(b)}</li>`).join('')}</ul>
        <h3>Fokus im Fall</h3>
        <p>${esc(data.caseFocus)}</p>
      </div>
      <div class="card">
        <h2>Fallgrundlage</h2>
        <div class="readonly-box">${esc(CASE_TEXT_PATCH)}</div>
        <h3>Supervisionsfrage</h3>
        <div class="notice">${esc(SUPERVISION_QUESTION_PATCH)}</div>
      </div>`;
    const next=document.getElementById('nextPrep');
    if(next){
      let flowFile='ablauf-supervisor.html';
      if(role==='schulleitung') flowFile='ablauf-schulleitung.html';
      if(role==='lehrkraft-a' || role==='lehrkraft-b') flowFile='ablauf-lehrkraft.html';
      const query = typeof currentQueryString==='function' ? currentQueryString() : '';
      next.textContent='Weiter: Ablauf ansehen';
      next.href=`${flowFile}?role=${encodeURIComponent(role)}${query?'&'+query:''}`;
    }
  };
  try { initRoleCard = window.initRoleCard; } catch(e) {}

  window.initFlow = function(){
    if (typeof initCommon === 'function') initCommon();
    const params=new URLSearchParams(location.search);
    let role=params.get('role') || document.body.dataset.role || '';
    const profile=document.body.dataset.flowProfile || (role==='schulleitung'?'schulleitung':(role==='supervisor'?'supervisor':((role==='lehrkraft-a'||role==='lehrkraft-b')?'lehrkraft':'general')));
    if(profile==='supervisor') role='supervisor';
    if(profile==='schulleitung') role='schulleitung';
    if(profile==='lehrkraft' && !role) role='lehrkraft-a';
    const steps=FLOW_TEXTS[profile] || FLOW_TEXTS.general;
    const flowMode=document.body.dataset.supervisorMode||'';
    const box=document.getElementById('flowSteps');
    const next=document.getElementById('flowNext');
    if(next){
      const targetRole = (role==='lehrkraft' || !role) ? 'lehrkraft-a' : role;
      next.href=(typeof linkWithState==='function') ? linkWithState(`gedanken-${targetRole}.html`) : `gedanken-${targetRole}.html`;
      next.classList.add('disabled');
      next.setAttribute('aria-disabled','true');
    }
    if(!box) return;
    const storageKey=(typeof key==='function') ? key('flow_visible_' + (role||profile) + (flowMode?('_'+flowMode):'')) : 'flow_visible_' + (role||profile) + (flowMode?('_'+flowMode):'');
    let visible=Number(localStorage.getItem(storageKey) || '1');
    visible=Math.max(1, Math.min(steps.length, visible));
    function setNextState(){
      if(!next) return;
      const complete=visible >= steps.length;
      next.classList.toggle('disabled', !complete);
      next.setAttribute('aria-disabled', complete ? 'false' : 'true');
      next.textContent = complete ? 'Weiter: Mach dir Gedanken' : 'Weiter wird nach allen Kacheln aktiviert';
      if(!complete){
        next.addEventListener('click', blockNext, { once: true });
      }
    }
    function blockNext(event){ if(visible < steps.length){ event.preventDefault(); } }
    function render(){
      box.innerHTML='';
      steps.slice(0, visible).forEach((step, idx)=>{
        const isLastVisible=idx===visible-1;
        const read=idx < visible-1 || visible>=steps.length;
        const card=document.createElement('article');
        card.className='card flow-step is-visible' + (read ? ' is-read' : '');
        card.innerHTML=`<div class="flow-step-head"><span class="step-badge">${idx+1}</span><h3>${esc(step[0])}</h3></div><p>${esc(step[1])}</p>${(!read && isLastVisible)?'<button type="button" class="secondary flow-read-btn">Gelesen</button>':''}`;
        const btn=card.querySelector('.flow-read-btn');
        if(btn) btn.addEventListener('click',()=>{ visible=Math.min(steps.length, visible+1); localStorage.setItem(storageKey, String(visible)); render(); });
        box.appendChild(card);
      });
      setNextState();
    }
    render();
  };
  try { initFlow = window.initFlow; } catch(e) {}
})();


/* ------------------------------------------------------------
   PATCH: device-aware role assignment + role color classes
   ------------------------------------------------------------ */
(function(){
  const ROLE_LABELS_PATCH2 = {
    supervisor: 'Supervisor*in',
    schulleitung: 'Schulleitung',
    'lehrkraft-a': 'Lehrkraft A',
    'lehrkraft-b': 'Lehrkraft B',
    protokoll: 'Protokoll'
  };
  const ROLE_FILES_PATCH2 = {
    supervisor: 'rolle-supervisor.html',
    schulleitung: 'rolle-schulleitung.html',
    'lehrkraft-a': 'rolle-lehrkraft-a.html',
    'lehrkraft-b': 'rolle-lehrkraft-b.html'
  };
  const PARTICIPANTS_KEY = 'participants_v2';
  function esc(v){
    if (typeof escapeHtml === 'function') return escapeHtml(v);
    return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }
  function localSlug(s){
    return (s || '').toString().trim().toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  }
  function makeId(){ return 'p_' + Date.now().toString(36) + '_' + Math.floor(Math.random()*100000).toString(36); }
  function loadParticipants(){
    let list = [];
    try { list = (typeof loadObj === 'function') ? loadObj(PARTICIPANTS_KEY, []) : []; } catch(_) { list = []; }
    if (Array.isArray(list) && list.length) return list.filter(p => p && p.name).map(p => ({ id: p.id || makeId(), name: String(p.name).trim(), device: p.device || 'smartphone' }));
    const raw = (typeof loadText === 'function') ? loadText('namesInput') : '';
    return raw.split(/\n|,/).map(s => s.trim()).filter(Boolean).map(name => ({ id: makeId(), name, device: 'smartphone' }));
  }
  function saveParticipants(list){
    if (typeof saveObj === 'function') saveObj(PARTICIPANTS_KEY, list);
    if (typeof saveText === 'function') saveText('namesInput', list.map(p => p.name).join('\n'));
    const textarea = document.getElementById('namesInput');
    if (textarea) textarea.value = list.map(p => p.name).join('\n');
  }
  function shuffle(arr){ return arr.map(v => [Math.random(), v]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]); }
  function setStatus(text, cls){ const s = document.getElementById('assignStatus'); if(s){ s.className = cls || 'small'; s.textContent = text; } }
  function roleClass(role){ return 'role-' + String(role || '').replace(/[^a-z0-9-]/g,''); }
  function buildRoleUrl(file){
    try { return new URL((typeof linkWithState === 'function' ? linkWithState(file) : file), window.location.href).toString(); }
    catch(e){ return file; }
  }
  function renderNameList(list){
    const ul = document.getElementById('namesList');
    if(!ul) return;
    ul.classList.add('device-name-list');
    ul.innerHTML = '';
    if(!list.length){
      const li = document.createElement('li');
      li.className = 'empty-name-list';
      li.innerHTML = '<span class="name-index">–</span><span>Noch keine Namen eingetragen.</span>';
      ul.appendChild(li);
      return;
    }
    list.forEach((p, index) => {
      const li = document.createElement('li');
      li.className = 'device-' + (p.device || 'smartphone');
      li.innerHTML = `<span class="name-index">${index+1}</span><span class="participant-name">${esc(p.name)}</span>
        <select aria-label="Gerät von ${esc(p.name)}">
          <option value="smartphone"${p.device==='smartphone'?' selected':''}>Smartphone</option>
          <option value="ipad"${p.device==='ipad'?' selected':''}>iPad</option>
          <option value="laptop"${p.device==='laptop'?' selected':''}>Laptop</option>
        </select>
        <button type="button" class="remove-name-btn" aria-label="${esc(p.name)} entfernen">×</button>`;
      const select = li.querySelector('select');
      select.addEventListener('change', () => {
        p.device = select.value;
        saveParticipants(list);
        renderNameList(list);
        setStatus('Geräteangabe wurde aktualisiert. Bitte Rollen bei Bedarf neu zuweisen.', 'notice');
      });
      li.querySelector('button').addEventListener('click', () => {
        list.splice(index,1);
        saveParticipants(list);
        renderNameList(list);
        setStatus('Name wurde entfernt. Bitte die Rollen neu zuweisen.', 'notice');
      });
      ul.appendChild(li);
    });
  }
  function renderAssignments(assignments){
    const assignedBox = document.getElementById('assignedBox');
    const cardsBox = document.getElementById('roleCards');
    if(assignedBox){
      assignedBox.innerHTML = '';
      ['supervisor','schulleitung','lehrkraft-a','lehrkraft-b','protokoll'].forEach(role => {
        if(!assignments[role]) return;
        const li = document.createElement('li');
        li.className = roleClass(role);
        li.innerHTML = `<span class="role-pill ${roleClass(role)}">${ROLE_LABELS_PATCH2[role]}</span><strong>${esc(assignments[role])}</strong>`;
        assignedBox.appendChild(li);
      });
    }
    if(cardsBox){
      cardsBox.innerHTML = '';
      ['supervisor','schulleitung','lehrkraft-a','lehrkraft-b'].forEach(role => {
        const file = ROLE_FILES_PATCH2[role];
        const href = `${file}?${typeof currentQueryString === 'function' ? currentQueryString() : ''}`;
        const url = buildRoleUrl(file);
        const card = document.createElement('div');
        card.className = `card compact role-qr-card ${roleClass(role)}`;
        card.innerHTML = `<div class="role-card-head"><span class="role-pill ${roleClass(role)}">${ROLE_LABELS_PATCH2[role]}</span><span class="assigned-name">${esc(assignments[role] || 'nicht zugewiesen')}</span></div>
          <p class="small role-card-help">Kachel öffnen oder QR-Code mit dem Handy scannen.</p>
          <div class="role-card-action"><a class="button" href="${href}">Rollenkarte öffnen</a></div>
          <div class="role-card-qr"><img class="qr" alt="QR-Code für ${ROLE_LABELS_PATCH2[role]}" src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}"></div>`;
        cardsBox.appendChild(card);
      });
      cardsBox.style.display = 'grid';
    }
  }
  function assignRoles(list){
    const names = list.map(p => p.name).filter(Boolean);
    const laptops = shuffle(list.filter(p => p.device === 'laptop'));
    let supervisorParticipant = laptops[0] || shuffle(list)[0];
    const rest = shuffle(list.filter(p => p.id !== supervisorParticipant.id));
    const assignments = {
      supervisor: supervisorParticipant.name,
      schulleitung: rest[0] && rest[0].name,
      'lehrkraft-a': rest[1] && rest[1].name,
      'lehrkraft-b': rest[2] && rest[2].name
    };
    if(rest[3]) assignments.protokoll = rest[3].name;
    return assignments;
  }
  window.initRoleAssignment = function(){
    if (typeof initCommon === 'function') initCommon();
    const input = document.getElementById('newNameInput');
    const addBtn = document.getElementById('addNameBtn');
    const assignBtn = document.getElementById('assignBtn');
    let participants = loadParticipants();
    saveParticipants(participants);
    renderNameList(participants);
    function addName(){
      const value = (input && input.value || '').trim();
      if(!value){ setStatus('Bitte zuerst einen Namen eintragen.', 'warning'); return; }
      participants.push({ id: makeId(), name: value, device: 'smartphone' });
      saveParticipants(participants);
      renderNameList(participants);
      if(input) { input.value = ''; input.focus(); }
      setStatus('Name wurde hinzugefügt. Wähle rechts daneben bei Bedarf das Gerät aus.', 'success');
    }
    if(addBtn) addBtn.onclick = addName;
    if(input) input.onkeydown = e => { if(e.key === 'Enter'){ e.preventDefault(); addName(); } };
    if(assignBtn) assignBtn.onclick = () => {
      participants = loadParticipants();
      if(participants.length < 4){ setStatus('Bitte mindestens 4 Namen eintragen.', 'warning'); return; }
      const groupSlug = participants.map(p => localSlug(p.name)).filter(Boolean).join('-').slice(0,80) || ('gruppe-' + Date.now().toString(36));
      localStorage.setItem('sv_current_group', groupSlug);
      saveParticipants(participants);
      const assignments = assignRoles(participants);
      if(typeof saveObj === 'function') saveObj('assignments', assignments);
      const laptopNames = participants.filter(p => p.device === 'laptop').map(p => p.name);
      const extra = laptopNames.length ? ' Supervisor*in wurde aus den Personen mit Laptop ausgewählt.' : ' Es wurde kein Laptop angegeben; Supervisor*in wurde zufällig bestimmt.';
      setStatus('Rollen wurden zugeteilt.' + extra, 'success');
      renderAssignments(assignments);
    };
    const existing = (typeof loadObj === 'function') ? loadObj('assignments', null) : null;
    if(existing && Object.keys(existing).length) renderAssignments(existing);
  };
  try { initRoleAssignment = window.initRoleAssignment; } catch(_) {}
  document.addEventListener('DOMContentLoaded', () => {
    const role = document.body.dataset.role;
    if(role){ document.body.classList.add('role-theme-' + role); if(role.indexOf('lehrkraft')===0) document.body.classList.add('role-theme-lehrkraft'); }
  });
})();


/* ------------------------------------------------------------
   PATCH v13: Beobachtung/Protokoll bei 5 Personen
   ------------------------------------------------------------ */
(function(){
  const LABELS = {
    supervisor:'Supervisor*in',
    schulleitung:'Schulleitung',
    'lehrkraft-a':'Lehrkraft A',
    'lehrkraft-b':'Lehrkraft B',
    protokoll:'Protokoll'
  };
  const FILES = {
    supervisor:'rolle-supervisor.html',
    schulleitung:'rolle-schulleitung.html',
    'lehrkraft-a':'rolle-lehrkraft-a.html',
    'lehrkraft-b':'rolle-lehrkraft-b.html',
    protokoll:'rolle-protokoll.html'
  };
  const PARTICIPANTS_KEY = 'participants_v2';
  function esc(v){
    if (typeof escapeHtml === 'function') return escapeHtml(v);
    return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }
  function makeId(){ return 'p_' + Date.now().toString(36) + '_' + Math.floor(Math.random()*100000).toString(36); }
  function localSlug(s){ return (s || '').toString().trim().toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,''); }
  function roleClass(role){ return 'role-' + String(role || '').replace(/[^a-z0-9-]/g,''); }
  function shuffle(arr){ return arr.map(v => [Math.random(), v]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]); }
  function hasObserver(){ try { const a = loadObj('assignments', {}); return !!(a && a.protokoll); } catch(_) { return false; } }
  function setStatus(text, cls){ const s=document.getElementById('assignStatus'); if(s){ s.className=cls||'small'; s.textContent=text; } }
  function loadParticipants(){
    let list=[];
    try { list = (typeof loadObj === 'function') ? loadObj(PARTICIPANTS_KEY, []) : []; } catch(_) { list=[]; }
    if(Array.isArray(list) && list.length) return list.filter(p=>p && p.name).map(p=>({id:p.id||makeId(), name:String(p.name).trim(), device:p.device||'smartphone'}));
    const raw = (typeof loadText === 'function') ? loadText('namesInput') : '';
    return raw.split(/\n|,/).map(s=>s.trim()).filter(Boolean).map(name=>({id:makeId(), name, device:'smartphone'}));
  }
  function saveParticipants(list){
    if(typeof saveObj === 'function') saveObj(PARTICIPANTS_KEY, list);
    if(typeof saveText === 'function') saveText('namesInput', list.map(p=>p.name).join('\n'));
    const textarea=document.getElementById('namesInput');
    if(textarea) textarea.value=list.map(p=>p.name).join('\n');
  }
  function buildRoleUrl(file){
    try { return new URL((typeof linkWithState === 'function' ? linkWithState(file) : file), window.location.href).toString(); }
    catch(e){ return file; }
  }
  function renderNameList(list){
    const ul=document.getElementById('namesList');
    if(!ul) return;
    ul.classList.add('device-name-list');
    ul.innerHTML='';
    if(!list.length){
      const li=document.createElement('li');
      li.className='empty-name-list';
      li.innerHTML='<span class="name-index">–</span><span>Noch keine Namen eingetragen.</span>';
      ul.appendChild(li);
      return;
    }
    list.forEach((p,index)=>{
      const li=document.createElement('li');
      li.className='device-neutral';
      li.innerHTML=`<span class="name-index">${index+1}</span><span class="participant-name">${esc(p.name)}</span>
        <select aria-label="Gerät von ${esc(p.name)}">
          <option value="smartphone"${p.device==='smartphone'?' selected':''}>Smartphone</option>
          <option value="ipad"${p.device==='ipad'?' selected':''}>iPad</option>
          <option value="laptop"${p.device==='laptop'?' selected':''}>Laptop</option>
        </select>
        <button type="button" class="remove-name-btn" aria-label="${esc(p.name)} entfernen">×</button>`;
      const select=li.querySelector('select');
      select.addEventListener('change',()=>{
        p.device=select.value;
        saveParticipants(list);
        renderNameList(list);
        setStatus('Geräteangabe wurde aktualisiert. Bitte Rollen bei Bedarf neu zuweisen.','notice');
      });
      li.querySelector('button').addEventListener('click',()=>{
        list.splice(index,1);
        saveParticipants(list);
        renderNameList(list);
        setStatus('Name wurde entfernt. Bitte die Rollen neu zuweisen.','notice');
      });
      ul.appendChild(li);
    });
  }
  function assignRoles(list){
    const laptops=shuffle(list.filter(p=>p.device==='laptop'));
    const supervisor=laptops[0] || shuffle(list)[0];
    const rest=shuffle(list.filter(p=>p.id!==supervisor.id));
    const assignments={
      supervisor: supervisor && supervisor.name,
      schulleitung: rest[0] && rest[0].name,
      'lehrkraft-a': rest[1] && rest[1].name,
      'lehrkraft-b': rest[2] && rest[2].name
    };
    if(rest[3]) assignments.protokoll=rest[3].name;
    return assignments;
  }
  function renderAssignments(assignments){
    const assignedBox=document.getElementById('assignedBox');
    const cardsBox=document.getElementById('roleCards');
    const roles=['supervisor','schulleitung','lehrkraft-a','lehrkraft-b'];
    if(assignments && assignments.protokoll) roles.push('protokoll');
    if(assignedBox){
      assignedBox.innerHTML='';
      roles.forEach(role=>{
        if(!assignments[role]) return;
        const li=document.createElement('li');
        li.className=roleClass(role);
        li.innerHTML=`<span class="role-pill ${roleClass(role)}">${LABELS[role]}</span><strong>${esc(assignments[role])}</strong>`;
        assignedBox.appendChild(li);
      });
    }
    if(cardsBox){
      cardsBox.innerHTML='';
      roles.forEach(role=>{
        const file=FILES[role];
        const href=`${file}?${typeof currentQueryString==='function'?currentQueryString():''}`;
        const url=buildRoleUrl(file);
        const card=document.createElement('div');
        card.className=`card compact role-qr-card ${roleClass(role)}`;
        card.innerHTML=`<div class="role-card-head"><span class="role-pill ${roleClass(role)}">${LABELS[role]}</span><span class="assigned-name">${esc(assignments[role] || 'nicht zugewiesen')}</span></div>
          <p class="small role-card-help">Kachel öffnen oder QR-Code mit dem Handy scannen.</p>
          <div class="role-card-action"><a class="button" href="${href}">Rollenkarte öffnen</a></div>
          <div class="role-card-qr"><img class="qr" alt="QR-Code für ${LABELS[role]}" src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}"></div>`;
        cardsBox.appendChild(card);
      });
      cardsBox.style.display='grid';
    }
  }
  window.initRoleAssignment = function(){
    if(typeof initCommon === 'function') initCommon();
    const input=document.getElementById('newNameInput');
    const addBtn=document.getElementById('addNameBtn');
    const assignBtn=document.getElementById('assignBtn');
    let participants=loadParticipants();
    saveParticipants(participants);
    renderNameList(participants);
    function addName(){
      const value=(input && input.value || '').trim();
      if(!value){ setStatus('Bitte zuerst einen Namen eintragen.','warning'); return; }
      participants.push({id:makeId(), name:value, device:'smartphone'});
      saveParticipants(participants);
      renderNameList(participants);
      if(input){ input.value=''; input.focus(); }
      setStatus('Name wurde hinzugefügt. Wähle rechts daneben bei Bedarf das Gerät aus.','success');
    }
    if(addBtn) addBtn.onclick=addName;
    if(input) input.onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); addName(); } };
    if(assignBtn) assignBtn.onclick=()=>{
      participants=loadParticipants();
      if(participants.length < 4){ setStatus('Bitte mindestens 4 Namen eintragen.','warning'); return; }
      const groupSlug=participants.map(p=>localSlug(p.name)).filter(Boolean).join('-').slice(0,80) || ('gruppe-' + Date.now().toString(36));
      localStorage.setItem('sv_current_group', groupSlug);
      saveParticipants(participants);
      const assignments=assignRoles(participants);
      if(typeof saveObj === 'function') saveObj('assignments', assignments);
      const laptopNames=participants.filter(p=>p.device==='laptop').map(p=>p.name);
      const obs=assignments.protokoll ? ' Bei 5 Personen übernimmt Protokoll die Ergebnissicherung.' : '';
      const extra=laptopNames.length ? ' Supervisor*in wurde aus den Personen mit Laptop ausgewählt.' : ' Es wurde kein Laptop angegeben; Supervisor*in wurde zufällig bestimmt.';
      setStatus('Rollen wurden zugeteilt.' + extra + obs, 'success');
      renderAssignments(assignments);
    };
    const existing=(typeof loadObj === 'function') ? loadObj('assignments', null) : null;
    if(existing && Object.keys(existing).length) renderAssignments(existing);
  };
  try { initRoleAssignment = window.initRoleAssignment; } catch(_) {}

  const ROLECARD_OBSERVER={
    title:'Rollenkarte: Protokoll',
    intro:'Du unterstützt die Supervisor*in, indem du die Ergebnisse sachlich festhältst. Du moderierst nicht, sondern beobachtest, strukturierst und dokumentierst die Aussagen in den vorgesehenen Feldern.',
    bullets:['Höre genau zu und notiere getrennt: Beobachtungen/Probleme, Gefühle, Wünsche und Ziele.', 'Formuliere knapp, neutral und ohne Bewertung.', 'Frage bei Unklarheiten kurz nach, ob du die Aussage richtig verstanden hast.', 'Am Ende sicherst du die Ergebnisse und teilst den Gruppenlink.'],
    caseFocus:'Dein Fokus liegt auf sauberer Dokumentation. Deine Notizen werden später für Tabelle, Gruppenergebnis und Präsentation verwendet.'
  };
  const oldPrepFields = (typeof prepFields === 'function') ? prepFields : null;
  window.prepFields = function(role){
    if(role === 'protokoll') return [
      {id:'auftrag', label:'Worauf achtest du beim Protokollieren?', hint:'Neutralität, kurze Formulierungen, keine Bewertungen.'},
      {id:'struktur', label:'Welche Kategorien musst du besonders sauber trennen?', hint:'Problem/Beobachtung, Gefühle, Wünsche, Ziele, Absprachen, Praxistauglichkeit.'},
      {id:'nachfragen', label:'Wann würdest du kurz nachfragen?', hint:'Wenn eine Aussage unklar ist oder nicht eindeutig einer Kategorie zugeordnet werden kann.'}
    ];
    return oldPrepFields ? oldPrepFields(role) : [];
  };
  try { prepFields = window.prepFields; } catch(_) {}

  window.initRoleCard = function(){
    if(typeof initCommon === 'function') initCommon();
    const role=(typeof getPageRole === 'function' ? getPageRole() : document.body.dataset.role);
    const baseCards = {
      supervisor: {
        title:'Rollenkarte: Supervisor*in',
        intro: hasObserver() ? 'Du leitest die Gruppensupervision. In dieser Fünferkonstellation dokumentiert Protokoll die Ergebnisse. Du konzentrierst dich deshalb auf Gesprächsführung, Struktur und Moderation.' : 'Du leitest die Gruppensupervision. Du bist nicht Schiedsrichter*in, sondern strukturierst den Prozess und sicherst, dass alle Perspektiven gehört werden.',
        bullets: hasObserver() ? ['Gespräch strukturieren und Gesprächsregeln sichern.', 'Beteiligte nacheinander zu Wort kommen lassen.', 'Protokoll gezielt Zeit zum Mitschreiben geben.', 'Zwischenergebnisse laut zusammenfassen, damit sie korrekt notiert werden können.'] : ['Klare Gesprächsstruktur herstellen.', 'Ich-Aussagen und konkrete Beobachtungen einfordern.', 'Schuldzuweisungen unterbrechen.', 'Ziele, Zwischenergebnisse und Absprachen sichern.'],
        caseFocus:'Dein Fokus liegt auf Prozessklarheit, Gesprächssicherheit und einer gemeinsamen Arbeitsgrundlage.'
      },
      schulleitung: {
        title:'Rollenkarte: Schulleitung', intro:'Du hast die Supervision angeregt, weil der Konflikt im Teamteaching die Klasse und die Zusammenarbeit belastet.',
        bullets:['Du beschreibst den Anlass aus Leitungssicht.', 'Du benennst Beobachtungen, Gefühle und Wünsche.', 'Du achtest auf einen verlässlichen Rahmen für die Klasse.', 'Du prüfst, welche Unterstützung die Schule leisten kann.'], caseFocus:'Dein Fokus liegt auf Stabilität, professioneller Zusammenarbeit und umsetzbaren Vereinbarungen.'
      },
      'lehrkraft-a': {
        title:'Rollenkarte: Lehrkraft A – erfahrene Teamteaching-Lehrkraft', intro:'Du arbeitest schon länger im Teamteaching und setzt auf klare, strukturierende Interventionen.',
        bullets:['Du erlebst dein Vorgehen als bewährt und stabilisierend.', 'Du fühlst dich irritiert, wenn vor der Klasse anders eingegriffen wird.', 'Du möchtest handlungsfähig bleiben.', 'Du brauchst verlässliche Absprachen im Team.'], caseFocus:'Dein Fokus liegt auf Klarheit, Verlässlichkeit und pädagogischer Handlungsfähigkeit.'
      },
      'lehrkraft-b': {
        title:'Rollenkarte: Lehrkraft B – neue Teamteaching-Lehrkraft', intro:'Du bist neu im Team und möchtest stärker beziehungs- und ressourcenorientiert arbeiten.',
        bullets:['Du möchtest alternative Methoden erproben.', 'Du willst Eskalationen früher vorbeugen.', 'Du fühlst dich mit neuen Ideen nicht immer ernst genommen.', 'Du brauchst Absprachen, wie Veränderung im Team gelingen kann.'], caseFocus:'Dein Fokus liegt auf Weiterentwicklung, Beziehungsgestaltung und abgestimmtem Handeln im Team.'
      },
      protokoll: ROLECARD_OBSERVER
    };
    const data=baseCards[role];
    const target=document.getElementById('roleCard');
    if(!data || !target) return;
    const assigned=(typeof roleName === 'function') ? roleName(role) : '';
    const caseText=(typeof CASE_TEXT !== 'undefined' ? CASE_TEXT : 'Der Fall betrifft eine ESE-Klasse, in der uneinheitliches Teamteaching zu Verunsicherung und fehlender Stabilität führt.');
    const question=(typeof SUPERVISION_QUESTION !== 'undefined' ? SUPERVISION_QUESTION : 'Wie kann das Team ein gemeinsames, verlässliches Vorgehen entwickeln?');
    target.innerHTML=`<div class="card highlight"><p class="role-pill ${roleClass(role)}">${LABELS[role] || role}</p><h2>${esc(data.title)}</h2><p><strong>Zugewiesene Person:</strong> ${esc(assigned || 'nicht gesetzt')}</p><p>${esc(data.intro)}</p><h3>Deine Aufgabe</h3><ul class="tight">${data.bullets.map(b=>`<li>${esc(b)}</li>`).join('')}</ul><h3>Fokus im Fall</h3><p>${esc(data.caseFocus)}</p></div><div class="card"><h2>Fallgrundlage</h2><div class="readonly-box">${esc(caseText)}</div><h3>Supervisionsfrage</h3><div class="notice">${esc(question)}</div></div>`;
    const next=document.getElementById('nextPrep');
    if(next){
      let flowFile='ablauf-supervisor.html';
      if(role==='schulleitung') flowFile='ablauf-schulleitung.html';
      if(role==='lehrkraft-a' || role==='lehrkraft-b') flowFile='ablauf-lehrkraft.html';
      if(role==='protokoll') flowFile='ablauf-protokoll.html';
      const query=typeof currentQueryString==='function' ? currentQueryString() : '';
      next.textContent='Weiter: Ablauf ansehen';
      next.href=`${flowFile}?role=${encodeURIComponent(role)}${query?'&'+query:''}`;
    }
  };
  try { initRoleCard = window.initRoleCard; } catch(_) {}

  const FLOW = {
    supervisor4:[
      ['Rolle und Rahmen klären','Du eröffnest das Gespräch, erklärst den Zweck der Supervision und achtest auf Freiwilligkeit, Vertraulichkeit und respektvolle Sprache.'],
      ['Erstkontakt moderieren','Du prüfst, ob alle Beteiligten bereit sind, zuzuhören, ihre Perspektive einzubringen und an einer gemeinsamen Klärung mitzuarbeiten.'],
      ['Problembeschreibung sammeln','Du gibst der Schulleitung und den Lehrkräften strukturiert das Wort und hältst die Kernaussagen fest.'],
      ['Ziele herausarbeiten','Du fragst nach individuellen Zielen und bündelst Gemeinsamkeiten zu einer gemeinsamen Zielvereinbarung.'],
      ['Vertiefte Bearbeitung anleiten','Du leitest das Gespräch über hilfreiche Kritik, Anerkennung und Absprachen für das Teamteaching.'],
      ['Ergebnisse sichern','Du fasst Probleme, Wünsche, Zielvereinbarung, Absprachen und Praxistauglichkeit zusammen und übermittelst die Ergebnisse.']
    ],
    supervisor5:[
      ['Rolle und Rahmen klären','Du moderierst. Protokoll dokumentiert. Klärt kurz, dass du Gesprächsführung und das Protokoll die Ergebnissicherung übernimmt.'],
      ['Erstkontakt moderieren','Du prüfst Gesprächsbereitschaft und erklärst, dass Ergebnisse durch Protokoll festgehalten werden.'],
      ['Problembeschreibung leiten','Du gibst den Beteiligten nacheinander das Wort und fasst laut zusammen, damit das Protokoll sauber mitschreiben kann.'],
      ['Ziele herausarbeiten','Du sammelst die Ziele mündlich und formulierst gemeinsam mit der Gruppe eine Zielvereinbarung.'],
      ['Vertiefte Bearbeitung anleiten','Du führst durch Kritik-Brainstorming und Runde nachvollziehbarer Perspektiven; das Protokoll hält Kriterien und Absprachen fest.'],
      ['Übergabe sichern','Du prüfst Zustimmung und Praxistauglichkeit. Das Protokoll geht anschließend zur Zusammenfassung und sendet die Ergebnisse ab.']
    ],
    protokoll:[
      ['Auftrag klären','Du dokumentierst, moderierst aber nicht. Deine Aufgabe ist, Ergebnisse neutral und strukturiert festzuhalten.'],
      ['Kategorien beachten','Trenne konsequent: Problem/Beobachtung, Gefühle, Wünsche, Ziele, Absprachen und Praxistauglichkeit.'],
      ['Während des Gesprächs mitschreiben','Notiere knapp. Wenn etwas unklar ist, bitte die Supervisor*in kurz um eine Wiederholung oder Zusammenfassung.'],
      ['Zielvereinbarung sichern','Achte besonders darauf, dass Gemeinsamkeiten und gemeinsames Ziel eindeutig formuliert sind.'],
      ['Absprachen festhalten','Dokumentiere hilfreiche Kritik, konkrete Absprachen und Zustimmung.'],
      ['Ergebnisse absenden','Du öffnest am Ende die Zusammenfassung, prüfst die Einträge und sendest die Ergebnisse für die Gruppe ab.']
    ],
    schulleitung:[
      ['Anlass sortieren','Überlege, warum du die Supervision eingeschaltet hast: Was hast du beobachtet und warum reicht eine direkte Klärung nicht mehr aus?'],
      ['Eigene Perspektive vorbereiten','Formuliere deine Beobachtung sachlich. Trenne Beobachtung, Gefühl und Wunsch klar voneinander.'],
      ['Im Gespräch den Rahmen halten','Du bist Teil des Gesprächs, aber auch Leitungsperson. Achte darauf, nicht vorschnell Partei zu ergreifen.'],
      ['Ziel aus Leitungssicht formulieren','Überlege, was die Schule braucht: mehr Verlässlichkeit, klare Absprachen, Schutz der Klasse, Entlastung des Teams.'],
      ['Umsetzung prüfen','Du überlegst, welche Unterstützung realistisch ist: Gesprächszeit, Hospitation, gemeinsame Planung oder verbindliche Absprachen.'],
      ['Praxistauglichkeit einschätzen','Am Ende prüfst du, ob die Vereinbarung im Schulalltag tragfähig ist und wie du die Umsetzung begleiten kannst.']
    ],
    lehrkraft:[
      ['Eigene Rolle klären','Überlege, aus welcher Perspektive du in das Gespräch gehst: Was ist dir wichtig und wo fühlst du dich missverstanden?'],
      ['Beobachtung statt Vorwurf','Bereite vor, was du konkret beobachtet hast. Vermeide Bewertungen über die andere Person.'],
      ['Gefühle und Wünsche formulieren','Benenne, was die Situation bei dir auslöst und was du für bessere Zusammenarbeit brauchst.'],
      ['Ziel formulieren','Überlege, was nach der Supervision konkret anders laufen sollte.'],
      ['Kritik hilfreich äußern','Achte darauf, Kritik situativ und nicht persönlich zu formulieren.'],
      ['Zustimmung prüfen','Prüfe am Ende, ob du die gemeinsame Vereinbarung mittragen kannst.']
    ]
  };
  window.initFlow = function(){
    if(typeof initCommon === 'function') initCommon();
    const params=new URLSearchParams(location.search);
    let role=params.get('role') || document.body.dataset.role || '';
    const profile=document.body.dataset.flowProfile || (role==='protokoll'?'protokoll':role==='schulleitung'?'schulleitung':role==='supervisor'?'supervisor':((role==='lehrkraft-a'||role==='lehrkraft-b')?'lehrkraft':'general'));
    let steps=FLOW.lehrkraft;
    if(profile==='supervisor') steps=hasObserver()?FLOW.supervisor5:FLOW.supervisor4;
    if(profile==='protokoll') steps=FLOW.protokoll;
    if(profile==='schulleitung') steps=FLOW.schulleitung;
    if(profile==='lehrkraft') steps=FLOW.lehrkraft;
    const box=document.getElementById('flowSteps');
    const next=document.getElementById('flowNext');
    if(next){
      let targetRole=role || profile;
      if(profile==='lehrkraft' && !targetRole) targetRole='lehrkraft-a';
      next.href=(typeof linkWithState==='function') ? linkWithState(`gedanken-${targetRole}.html`) : `gedanken-${targetRole}.html`;
      next.classList.add('disabled');
      next.setAttribute('aria-disabled','true');
    }
    if(!box) return;
    const storageKey=(typeof key==='function') ? key('flow_visible_' + (role||profile)) : 'flow_visible_' + (role||profile);
    let visible=Number(localStorage.getItem(storageKey) || '1');
    visible=Math.max(1, Math.min(steps.length, visible));
    function blockNext(event){ if(visible < steps.length) event.preventDefault(); }
    function setNextState(){
      if(!next) return;
      const complete=visible >= steps.length;
      next.classList.toggle('disabled', !complete);
      next.setAttribute('aria-disabled', complete?'false':'true');
      next.textContent=complete?'Weiter: Mach dir Gedanken':'Weiter wird nach allen Kacheln aktiviert';
      next.onclick=complete?null:blockNext;
    }
    function render(){
      box.innerHTML='';
      steps.slice(0, visible).forEach((step, idx)=>{
        const read=idx < visible-1 || visible>=steps.length;
        const isLastVisible=idx===visible-1;
        const card=document.createElement('article');
        card.className='card flow-step is-visible' + (read?' is-read':'');
        card.innerHTML=`<div class="flow-step-head"><span class="step-badge">${idx+1}</span><h3>${esc(step[0])}</h3></div><p>${esc(step[1])}</p>${(!read && isLastVisible)?'<button type="button" class="secondary flow-read-btn">Gelesen</button>':''}`;
        const btn=card.querySelector('.flow-read-btn');
        if(btn) btn.onclick=()=>{ visible=Math.min(steps.length, visible+1); localStorage.setItem(storageKey,String(visible)); render(); };
        box.appendChild(card);
      });
      setNextState();
    }
    render();
  };
  try { initFlow = window.initFlow; } catch(_) {}

  function note(label, saveKey){ return `<label>${esc(label)}</label><textarea data-save="${esc(saveKey)}"></textarea>`; }
  function moderationOnlyPhase(phase){
    const map={
      1:['Erstkontakt','Begrüße die Gruppe, kläre Anlass und Gesprächsregeln. Frage nach Bereitschaft zur Klärung und nach der Bereitschaft, andere Perspektiven anzuhören.', ['Gesprächsrahmen herstellen','Keine Schuldfrage eröffnen','Protokoll als dokumentierende Rolle benennen']],
      2:['Problembeschreibung','Leite die Problembeschreibung. Gib zuerst der Schulleitung, danach Lehrkraft A und Lehrkraft B das Wort. Fasse jede Perspektive laut zusammen.', ['Beobachtung, Gefühle und Wünsche trennen','Nach jeder Perspektive kurz sichern','Protokoll Zeit zum Mitschreiben geben']],
      3:['Zielformulierung','Bitte alle Beteiligten um individuelle Ziele und leite zu einer gemeinsamen Zielvereinbarung über.', ['Ziele konkret und positiv formulieren','Gemeinsamkeiten markieren','Gemeinsame Zielvereinbarung laut abschließen']],
      4:['Vertiefte Problembearbeitung','Moderieren das Brainstorming zu hilfreicher Kritik und leite die Runde nachvollziehbarer Perspektiven an.', ['Kritik als Ich-Botschaft','Situation statt Person','Anerkennung kurz und konkret halten']],
      5:['Ergebnissicherung','Fasse die wichtigsten Ergebnisse zusammen und prüfe Zustimmung.', ['Probleme und Wünsche bündeln','Zielvereinbarung vorlesen','Zustimmung klar abfragen']],
      6:['Reflexionstauglichkeit','Prüfe mit der Schulleitung die Praxistauglichkeit und die Unterstützungsmöglichkeiten.', ['Umsetzbarkeit prüfen','Unterstützung konkretisieren','Ersten Schritt festlegen']]
    };
    const m=map[phase] || map[1];
    return `<section class="card highlight moderation-only-card equal-fill-card"><h2>Moderationskarte: ${esc(m[0])}</h2><p>${esc(m[1])}</p><div class="handoff-note"><strong>Hinweis:</strong> Protokoll hält die Ergebnisse in der eigenen Phasenseite fest. Du konzentrierst dich auf Moderation und Gesprächsführung.</div><h3>Gesprächsführung</h3><ul class="tight">${m[2].map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section>`;
  }
  function protokollPhase(phase){
    if(phase===1) return `<section class="card highlight protokoll-note-card"><p class="role-pill role-protokoll">Protokoll</p><h2>Phase 1: Erstkontakt dokumentieren</h2><p>Halte nur knapp fest, welche Gesprächsregeln und Bereitschaften vereinbart wurden.</p>${note('Rahmen / Gesprächsregeln / Bereitschaft','sup_p1_rahmen')}</section>`;
    if(phase===2) return `<section class="card highlight protokoll-note-card"><p class="role-pill role-protokoll">Protokoll</p><h2>Phase 2: Problembeschreibung dokumentieren</h2><p class="small">Trenne Aussagen nach Rolle und Kategorie. Schreibe neutral und stichpunktartig.</p><div class="role-note-block"><h3>Schulleitung</h3>${note('Problem / Beobachtung','sup_p2_sl_probleme')}${note('Gefühle','sup_p2_sl_gefuehle')}${note('Wünsche','sup_p2_sl_wuensche')}</div><div class="role-note-block"><h3>Lehrkraft A</h3>${note('Problem / Perspektive','sup_p2_a_probleme')}${note('Gefühle','sup_p2_a_gefuehle')}${note('Wünsche','sup_p2_a_wuensche')}</div><div class="role-note-block"><h3>Lehrkraft B</h3>${note('Problem / Perspektive','sup_p2_b_probleme')}${note('Gefühle','sup_p2_b_gefuehle')}${note('Wünsche','sup_p2_b_wuensche')}</div></section>`;
    if(phase===3) return `<section class="card highlight protokoll-note-card"><p class="role-pill role-protokoll">Protokoll</p><h2>Phase 3: Ziele dokumentieren</h2>${note('Ziel Schulleitung','sup_p3_ziel_sl')}${note('Ziel Lehrkraft A','sup_p3_ziel_a')}${note('Ziel Lehrkraft B','sup_p3_ziel_b')}${note('Gemeinsamkeiten','sup_p3_gemeinsamkeiten')}${note('Gemeinsame Zielformulierung','sup_p3_gemeinsames_ziel')}</section>`;
    if(phase===4) return `<section class="card highlight protokoll-note-card"><p class="role-pill role-protokoll">Protokoll</p><h2>Phase 4: Vertiefte Problembearbeitung dokumentieren</h2>${note('Kriterien für hilfreiche Kritik','sup_p4_kritik')}<div class="perspective-table-entry"><p class="small">Notiere getrennt zu jeder Person einen positiven oder nachvollziehbaren Punkt, der von den anderen genannt wurde.</p><div class="three-col">${note('Positive Rückmeldung zur Schulleitung','sup_p4_pos_sl')}${note('Positive Rückmeldung zu Lehrkraft A','sup_p4_pos_a')}${note('Positive Rückmeldung zu Lehrkraft B','sup_p4_pos_b')}</div></div>${note('Mögliche neue Absprachen','sup_p4_absprachen')}</section>`;
    if(phase===5) return `<section class="card highlight protokoll-note-card"><p class="role-pill role-protokoll">Protokoll</p><h2>Phase 5: Ergebnisse und Zustimmung sichern</h2><div class="summary-block"><strong>Zwischenergebnisse</strong><br>${typeof miniSummaryHtml==='function'?miniSummaryHtml():''}</div><label>Zustimmung erfolgt?</label><select class="standard-required" data-save="sup_p5_zustimmung_status"><option value="">Bitte auswählen</option><option value="Alle stimmen zu">Alle stimmen zu</option><option value="Teilweise Zustimmung / offene Punkte">Teilweise Zustimmung / offene Punkte</option><option value="Keine Zustimmung">Keine Zustimmung</option></select>${note('Rückmeldungen / Zustimmung / offene Punkte','sup_p5_zustimmung')}</section>`;
    if(phase===6) return `<section class="card highlight protokoll-note-card"><p class="role-pill role-protokoll">Protokoll</p><h2>Phase 6: Praxistauglichkeit dokumentieren</h2>${note('Einschätzung der Praxistauglichkeit','sup_p6_praxistauglichkeit')}${note('Unterstützung durch Schulleitung','sup_p6_unterstuetzung')}${note('Erste konkrete Umsetzungsschritte','sup_p6_umsetzung')}</section>`;
    return '';
  }
  window.initPhase = function(){
    if(typeof initCommon === 'function') initCommon();
    const role = (typeof getPageRole === 'function') ? getPageRole() : document.body.dataset.role;
    const phase = (typeof getPhase === 'function') ? getPhase() : Number(document.body.dataset.phase || '0');
    if(typeof renderPhaseBar === 'function') renderPhaseBar(phase);
    const title=document.getElementById('phaseTitle');
    if(title) title.textContent = `Phase ${phase}: ${typeof PHASES !== 'undefined' && PHASES[phase] ? PHASES[phase] : ''}`;
    const content=document.getElementById('phaseContent');
    if(!content) return;
    if(role==='protokoll') content.innerHTML=protokollPhase(phase);
    else if(role==='supervisor' && hasObserver()) content.innerHTML=moderationOnlyPhase(phase);
    else if(role==='supervisor' && typeof supervisorPhase === 'function') content.innerHTML=supervisorPhase(phase);
    else if(typeof participantPhase === 'function') content.innerHTML=participantPhase(role, phase);
    if(typeof setupSaving === 'function') setupSaving();
    const next=document.getElementById('nextPhase');
    if(next){
      if(phase < 6){
        {
        let targetFile = `phase${phase+1}-${role}.html`;
        let url = (typeof linkWithState === 'function') ? linkWithState(targetFile) : targetFile;
        if(role === 'supervisor'){
          const mode = (typeof window.__svSupervisorHasProtocolV108 === 'function' && window.__svSupervisorHasProtocolV108()) ? 'moderation' : 'full';
          url += (url.indexOf('?')>=0?'&':'?') + 'supervisorMode=' + encodeURIComponent(mode) + '&members=' + (mode==='moderation'?'5':'4');
        }
        next.href = url;
      }
        next.textContent = `Bereit für Phase ${phase+1}`;
      } else {
        let target='abschluss.html';
        if(role==='protokoll') target='zusammenfassung-protokoll.html';
        else if(role==='supervisor' && !hasObserver()) target='zusammenfassung.html';
        {
        let url = (typeof linkWithState === 'function') ? linkWithState(target) : target;
        if(role === 'supervisor'){
          const mode = (typeof window.__svSupervisorHasProtocolV108 === 'function' && window.__svSupervisorHasProtocolV108()) ? 'moderation' : 'full';
          url += (url.indexOf('?')>=0?'&':'?') + 'supervisorMode=' + encodeURIComponent(mode) + '&members=' + (mode==='moderation'?'5':'4');
        }
        next.href = url;
      }
        next.textContent = (target.indexOf('zusammenfassung')>=0) ? 'Ergebnisse zusammenfassen' : 'Abschluss';
      }
    }
  };
  try { initPhase = window.initPhase; } catch(_) {}
  document.addEventListener('DOMContentLoaded',()=>{
    const role=document.body.dataset.role;
    if(role){ document.body.classList.add('role-theme-' + role); if(role.indexOf('lehrkraft')===0) document.body.classList.add('role-theme-lehrkraft'); }
  });
})();

/* ------------------------------------------------------------
   FINAL TEXT + PROTOKOLL PATCH: klare Gesprächsführung, Protokoll-Rolle,
   Laptop-Logik bei 4/5 Personen und Rollenphasen mit vorbereiteten Notizen.
   ------------------------------------------------------------ */
(function(){
  const LABELS_FINAL = {
    supervisor:'Supervisor*in',
    schulleitung:'Schulleitung',
    'lehrkraft-a':'Lehrkraft A',
    'lehrkraft-b':'Lehrkraft B',
    protokoll:'Protokoll'
  };
  const FILES_FINAL = {
    supervisor:'rolle-supervisor.html',
    schulleitung:'rolle-schulleitung.html',
    'lehrkraft-a':'rolle-lehrkraft-a.html',
    'lehrkraft-b':'rolle-lehrkraft-b.html',
    protokoll:'rolle-protokoll.html'
  };
  const PARTICIPANTS_KEY_FINAL = 'participants_v2';
  const PHASE_NAMES_FINAL = {
    1:'Erstkontakt', 2:'Problembeschreibung', 3:'Zielformulierung', 4:'Vertiefte Problembearbeitung', 5:'Ergebnissicherung', 6:'Reflexionstauglichkeit'
  };

  try { if (typeof ROLES !== 'undefined') ROLES.protokoll = 'Protokoll'; } catch(_) {}

  function esc(v){
    if (typeof escapeHtml === 'function') return escapeHtml(v);
    return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }
  function makeId(){ return 'p_' + Date.now().toString(36) + '_' + Math.floor(Math.random()*100000).toString(36); }
  function localSlug(s){ return (s || '').toString().trim().toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,''); }
  function shuffle(arr){ return arr.map(v => [Math.random(), v]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]); }
  function roleClass(role){ return 'role-' + String(role || '').replace(/[^a-z0-9-]/g,''); }
  function setStatus(text, cls){ const s=document.getElementById('assignStatus'); if(s){ s.className=cls||'small'; s.textContent=text; } }
  function getAssignments(){ try { return (typeof loadObj === 'function') ? loadObj('assignments', {}) : {}; } catch(_) { return {}; } }
  function hasProtokoll(){ const a=getAssignments(); return !!(a && a.protokoll); }
  function saveParticipants(list){
    if(typeof saveObj === 'function') saveObj(PARTICIPANTS_KEY_FINAL, list);
    if(typeof saveText === 'function') saveText('namesInput', list.map(p=>p.name).join('\n'));
    const textarea=document.getElementById('namesInput');
    if(textarea) textarea.value=list.map(p=>p.name).join('\n');
  }
  function loadParticipants(){
    let list=[];
    try { list = (typeof loadObj === 'function') ? loadObj(PARTICIPANTS_KEY_FINAL, []) : []; } catch(_) { list=[]; }
    if(Array.isArray(list) && list.length) return list.filter(p=>p && p.name).map(p=>({id:p.id||makeId(), name:String(p.name).trim(), device:p.device||'smartphone'}));
    const raw = (typeof loadText === 'function') ? loadText('namesInput') : '';
    return raw.split(/\n|,/).map(s=>s.trim()).filter(Boolean).map(name=>({id:makeId(), name, device:'smartphone'}));
  }
  function buildRoleUrl(file){
    try { return new URL((typeof linkWithState === 'function' ? linkWithState(file) : file), window.location.href).toString(); }
    catch(e){ return file; }
  }
  function renderNameListFinal(list){
    const ul=document.getElementById('namesList');
    if(!ul) return;
    ul.classList.add('device-name-list');
    ul.innerHTML='';
    if(!list.length){
      const li=document.createElement('li');
      li.className='empty-name-list device-neutral';
      li.innerHTML='<span class="name-index">–</span><span>Noch keine Namen eingetragen.</span>';
      ul.appendChild(li);
      return;
    }
    list.forEach((p,index)=>{
      const li=document.createElement('li');
      li.className='device-neutral';
      li.innerHTML=`<span class="name-index">${index+1}</span><span class="participant-name">${esc(p.name)}</span>
        <select aria-label="Gerät von ${esc(p.name)}">
          <option value="smartphone"${p.device==='smartphone'?' selected':''}>Smartphone</option>
          <option value="ipad"${p.device==='ipad'?' selected':''}>iPad</option>
          <option value="laptop"${p.device==='laptop'?' selected':''}>Laptop</option>
        </select>
        <button type="button" class="remove-name-btn" aria-label="${esc(p.name)} entfernen">×</button>`;
      const select=li.querySelector('select');
      select.addEventListener('change',()=>{
        p.device=select.value;
        saveParticipants(list);
        renderNameListFinal(list);
        setStatus('Geräteangabe wurde aktualisiert. Bitte Rollen bei Bedarf neu zuweisen.','notice');
      });
      li.querySelector('button').addEventListener('click',()=>{
        list.splice(index,1);
        saveParticipants(list);
        renderNameListFinal(list);
        setStatus('Name wurde entfernt. Bitte die Rollen neu zuweisen.','notice');
      });
      ul.appendChild(li);
    });
  }
  function assignRolesFinal(list){
    const clean = list.filter(p=>p && p.name);
    if(clean.length >= 5){
      const laptops = shuffle(clean.filter(p=>p.device === 'laptop'));
      const protokoll = laptops[0] || shuffle(clean)[0];
      const rest = shuffle(clean.filter(p=>p.id !== protokoll.id));
      return {
        supervisor: rest[0] && rest[0].name,
        schulleitung: rest[1] && rest[1].name,
        'lehrkraft-a': rest[2] && rest[2].name,
        'lehrkraft-b': rest[3] && rest[3].name,
        protokoll: protokoll && protokoll.name
      };
    }
    const laptops = shuffle(clean.filter(p=>p.device === 'laptop'));
    const supervisor = laptops[0] || shuffle(clean)[0];
    const rest = shuffle(clean.filter(p=>p.id !== supervisor.id));
    return {
      supervisor: supervisor && supervisor.name,
      schulleitung: rest[0] && rest[0].name,
      'lehrkraft-a': rest[1] && rest[1].name,
      'lehrkraft-b': rest[2] && rest[2].name
    };
  }
  function renderAssignmentsFinal(assignments){
    const assignedBox=document.getElementById('assignedBox');
    const cardsBox=document.getElementById('roleCards');
    const roles=['supervisor','schulleitung','lehrkraft-a','lehrkraft-b'];
    if(assignments && assignments.protokoll) roles.push('protokoll');
    if(assignedBox){
      assignedBox.innerHTML='';
      roles.forEach(role=>{
        if(!assignments[role]) return;
        const li=document.createElement('li');
        li.className=roleClass(role);
        li.innerHTML=`<span class="role-pill ${roleClass(role)}">${LABELS_FINAL[role]}</span><strong>${esc(assignments[role])}</strong>`;
        assignedBox.appendChild(li);
      });
    }
    if(cardsBox){
      cardsBox.innerHTML='';
      roles.forEach(role=>{
        const file=FILES_FINAL[role];
        const href=`${file}?${typeof currentQueryString==='function'?currentQueryString():''}`;
        const url=buildRoleUrl(file);
        const card=document.createElement('div');
        card.className=`card compact role-qr-card ${roleClass(role)}`;
        card.innerHTML=`<div class="role-card-head"><span class="role-pill ${roleClass(role)}">${LABELS_FINAL[role]}</span><span class="assigned-name">${esc(assignments[role] || 'nicht zugewiesen')}</span></div>
          <p class="small role-card-help">Kachel öffnen oder QR-Code mit dem Handy scannen.</p>
          <div class="role-card-action"><a class="button" href="${href}">Rollenkarte öffnen</a></div>
          <div class="role-card-qr"><img class="qr" alt="QR-Code für ${LABELS_FINAL[role]}" src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}"></div>`;
        cardsBox.appendChild(card);
      });
      cardsBox.style.display='grid';
    }
  }
  window.initRoleAssignment = function(){
    if(typeof initCommon === 'function') initCommon();
    const input=document.getElementById('newNameInput');
    const addBtn=document.getElementById('addNameBtn');
    const assignBtn=document.getElementById('assignBtn');
    let participants=loadParticipants();
    saveParticipants(participants);
    renderNameListFinal(participants);
    function addName(){
      const value=(input && input.value || '').trim();
      if(!value){ setStatus('Bitte zuerst einen Namen eintragen.','warning'); return; }
      participants.push({id:makeId(), name:value, device:'smartphone'});
      saveParticipants(participants);
      renderNameListFinal(participants);
      if(input){ input.value=''; input.focus(); }
      setStatus('Name wurde hinzugefügt. Wähle rechts daneben das passende Gerät aus.','success');
    }
    if(addBtn) addBtn.onclick=addName;
    if(input) input.onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); addName(); } };
    if(assignBtn) assignBtn.onclick=()=>{
      participants=loadParticipants();
      if(participants.length < 4){ setStatus('Bitte mindestens 4 Namen eintragen.','warning'); return; }
      const groupSlug=participants.map(p=>localSlug(p.name)).filter(Boolean).join('-').slice(0,80) || ('gruppe-' + Date.now().toString(36));
      localStorage.setItem('sv_current_group', groupSlug);
      saveParticipants(participants);
      const assignments=assignRolesFinal(participants);
      if(typeof saveObj === 'function') saveObj('assignments', assignments);
      const hasLaptop=participants.some(p=>p.device==='laptop');
      let extra='';
      if(participants.length >= 5){
        extra = hasLaptop ? ' Bei 5 Personen wurde die Protokoll-Rolle aus den Personen mit Laptop ausgewählt.' : ' Es wurde kein Laptop angegeben; die Protokoll-Rolle wurde zufällig bestimmt.';
      } else {
        extra = hasLaptop ? ' Bei 4 Personen wurde Supervisor*in aus den Personen mit Laptop ausgewählt.' : ' Es wurde kein Laptop angegeben; Supervisor*in wurde zufällig bestimmt.';
      }
      setStatus('Rollen wurden zugeteilt.' + extra, 'success');
      renderAssignmentsFinal(assignments);
    };
    const existing=(typeof loadObj === 'function') ? loadObj('assignments', null) : null;
    if(existing && Object.keys(existing).length) renderAssignmentsFinal(existing);
  };
  try { initRoleAssignment = window.initRoleAssignment; } catch(_) {}

  const BASE_ROLECARDS_FINAL = {
    supervisor: {
      title:'Rollenkarte: Supervisor*in',
      intro:'Du leitest das Gespräch. Deine Aufgabe ist nicht, eine schnelle Lösung vorzugeben. Du strukturierst die Supervision so, dass alle Beteiligten zu Wort kommen und am Ende eine tragfähige Vereinbarung entsteht.',
      bullets:['Eröffne das Gespräch ruhig und klar.', 'Achte auf Ich-Aussagen, konkrete Beobachtungen und respektvolle Sprache.', 'Führe die Fragen entlang der Kategorien: Beobachtung/Problem, Gefühle, Wünsche, Ziele, Absprachen und Praxistauglichkeit.', 'Bei 5 Personen dokumentiert die Rolle Protokoll. Deine Moderationskarten sind so aufgebaut, dass diese Person die Felder gut füllen kann.'],
      caseFocus:'Du hältst den Prozess zusammen und sorgst dafür, dass der Konflikt im Teamteaching nicht weiter eskaliert.'
    },
    schulleitung: {
      title:'Rollenkarte: Schulleitung',
      intro:'Du hast die Supervision angeregt, weil die Uneinigkeit im Teamteaching die Klasse belastet und nicht mehr ausreichend direkt geklärt werden konnte.',
      bullets:['Beschreibe, was du beobachtet hast.', 'Benenne, was die Situation bei dir auslöst.', 'Formuliere, was du dir vom Teamteaching wünschst.', 'Prüfe am Ende, welche Unterstützung du als Schulleitung anbieten kannst.'],
      caseFocus:'Dein Fokus liegt auf Stabilität für die Klasse, professioneller Zusammenarbeit und einer umsetzbaren Vereinbarung.'
    },
    'lehrkraft-a': {
      title:'Rollenkarte: Lehrkraft A – erfahrene Teamteaching-Lehrkraft',
      intro:'Du arbeitest schon länger im Teamteaching und setzt auf klare, strukturierende Interventionen. Aus deiner Sicht gibt dieses Vorgehen der Klasse Sicherheit.',
      bullets:['Du fühlst dich irritiert, wenn vor der Klasse anders gehandelt wird.', 'Du möchtest, dass Absprachen verlässlich gelten.', 'Du befürchtest, dass zu viel spontanes Ausprobieren die Klasse verunsichert.', 'Du brauchst Klarheit darüber, wie ihr als Team geschlossen auftretet.'],
      caseFocus:'Dein Fokus liegt auf Verlässlichkeit, Klarheit und pädagogischer Handlungsfähigkeit.'
    },
    'lehrkraft-b': {
      title:'Rollenkarte: Lehrkraft B – neue Teamteaching-Lehrkraft',
      intro:'Du bist neu im Team und möchtest stärker beziehungs- und ressourcenorientiert arbeiten. Du möchtest neue Wege erproben, ohne dauerhaft gegen die Kollegin oder den Kollegen zu arbeiten.',
      bullets:['Du möchtest Eskalationen früher vorbeugen.', 'Du fühlst dich mit neuen Ideen nicht immer ernst genommen.', 'Du möchtest Veränderung, brauchst dafür aber gemeinsame Absprachen.', 'Du willst klären, wie neue Methoden im Team eingeführt werden können.'],
      caseFocus:'Dein Fokus liegt auf Weiterentwicklung, Beziehungsgestaltung und abgestimmtem Handeln.'
    },
    protokoll: {
      title:'Rollenkarte: Protokoll',
      intro:'Du dokumentierst die Ergebnisse. Du moderierst nicht. Du hörst genau zu und hältst die Aussagen so fest, dass die Gruppe am Ende damit weiterarbeiten kann.',
      bullets:['Trenne die Kategorien sauber: Problem/Beobachtung, Gefühle, Wünsche, Ziele, Absprachen und Praxistauglichkeit.', 'Schreibe neutral und kurz. Keine Bewertungen.', 'Wenn etwas unklar ist, bitte um eine kurze Wiederholung oder Zusammenfassung.', 'Am Ende prüfst du die Zusammenfassung, sendest die Ergebnisse ab und kannst den Gruppenlink teilen.'],
      caseFocus:'Dein Fokus liegt auf klarer, neutraler und vollständiger Ergebnissicherung.'
    }
  };
  window.initRoleCard = function(){
    if(typeof initCommon === 'function') initCommon();
    const role=(typeof getPageRole === 'function' ? getPageRole() : document.body.dataset.role);
    const data=BASE_ROLECARDS_FINAL[role];
    const target=document.getElementById('roleCard');
    if(!data || !target) return;
    const assigned=(typeof roleName === 'function') ? roleName(role) : '';
    const caseText=(typeof CASE_TEXT !== 'undefined' ? CASE_TEXT : 'In einer ESE-Klasse belasten uneinheitliche Vorgehensweisen im Teamteaching die Stabilität der Lerngruppe.');
    const question=(typeof SUPERVISION_QUESTION !== 'undefined' ? SUPERVISION_QUESTION : 'Wie kann das Team ein gemeinsames, verlässliches Vorgehen entwickeln?');
    target.innerHTML=`<div class="card highlight"><p class="role-pill ${roleClass(role)}">${LABELS_FINAL[role] || role}</p><h2>${esc(data.title)}</h2><p><strong>Zugewiesene Person:</strong> ${esc(assigned || 'nicht gesetzt')}</p><p>${esc(data.intro)}</p><h3>Deine Aufgabe</h3><ul class="tight">${data.bullets.map(b=>`<li>${esc(b)}</li>`).join('')}</ul><h3>Fokus im Fall</h3><p>${esc(data.caseFocus)}</p></div><div class="card"><h2>Fallgrundlage</h2><div class="readonly-box">${esc(caseText)}</div><h3>Supervisionsfrage</h3><div class="notice">${esc(question)}</div></div>`;
    const next=document.getElementById('nextPrep');
    if(next){
      let flowFile='ablauf-supervisor.html';
      if(role==='schulleitung') flowFile='ablauf-schulleitung.html';
      if(role==='lehrkraft-a' || role==='lehrkraft-b') flowFile='ablauf-lehrkraft.html';
      if(role==='protokoll') flowFile='ablauf-protokoll.html';
      const query=typeof currentQueryString==='function' ? currentQueryString() : '';
      next.textContent='Weiter: Ablauf ansehen';
      next.href=`${flowFile}?role=${encodeURIComponent(role)}${query?'&'+query:''}`;
    }
  };
  try { initRoleCard = window.initRoleCard; } catch(_) {}

  const oldSetupSavingFinal = (typeof setupSaving === 'function') ? setupSaving : null;
  window.prepFields = function(role){
    if(role === 'supervisor') return [
      {id:'ziel', label:'Welches Ziel verfolgst du mit dieser Supervision?', hint:'Formuliere kurz, was das Gespräch leisten soll. Beispiel: Die Beteiligten sollen ein gemeinsames, verlässliches Vorgehen im Teamteaching vereinbaren.'}
    ];
    if(role === 'protokoll') return [
      {id:'auftrag', label:'Worauf achtest du beim Protokollieren?', hint:'Schreibe neutral, kurz und getrennt nach Kategorien.'},
      {id:'kategorien', label:'Welche Kategorien musst du sauber trennen?', hint:'Problem/Beobachtung, Gefühle, Wünsche, Ziele, Absprachen, Zustimmung und Praxistauglichkeit.'},
      {id:'nachfragen', label:'Wann fragst du kurz nach?', hint:'Wenn eine Aussage unklar ist oder nicht eindeutig zugeordnet werden kann.'}
    ];
    if(role === 'schulleitung') return [
      {id:'beobachtung', label:'Fasse deine Beobachtung kurz zusammen.', hint:'Was hast du im Teamteaching wahrgenommen? Was wirkt für die Klasse uneinheitlich oder belastend?'},
      {id:'gefuehle', label:'Welche Gefühle hast du in der Situation?', hint:'Zum Beispiel Sorge, Ärger, Druck, Unsicherheit oder Verantwortungsgefühl.'},
      {id:'wuensche', label:'Welche Wünsche hast du an das Teamteaching?', hint:'Was sollen die Lehrkräfte klären oder verändern?'},
      {id:'loesung', label:'Erste Gedanken zu einer möglichen Unterstützung', hint:'Welche Rahmenbedingungen könntest du als Schulleitung anbieten?'}
    ];
    if(role === 'lehrkraft-a' || role === 'lehrkraft-b') return [
      {id:'perspektive', label:'Fasse deine Perspektive kurz zusammen.', hint:'Was ist aus deiner Rolle das zentrale Problem?'},
      {id:'gefuehle', label:'Welche Gefühle hast du in der Situation?', hint:'Was löst der Konflikt bei dir aus?'},
      {id:'wuensche', label:'Welche Wünsche hast du an die anderen Beteiligten?', hint:'Was brauchst du für bessere Zusammenarbeit im Teamteaching?'},
      {id:'ziele', label:'Gedanken zu konkreten Zielformulierungen', hint:'Was sollte nach der Supervision klarer oder anders sein?'}
    ];
    return [];
  };
  try { prepFields = window.prepFields; } catch(_) {}

  const FLOW_FINAL = {
    supervisor4:[
      ['Gespräch eröffnen','Du begrüßt die Gruppe, benennst den Anlass neutral und klärst Gesprächsregeln.'],
      ['Perspektiven sammeln','Du fragst nacheinander nach Beobachtungen, Gefühlen und Wünschen. Deine Fragen führen direkt zu den Feldern, die du festhalten musst.'],
      ['Ziele klären','Du fragst nach individuellen Zielen und leitest daraus eine gemeinsame Zielformulierung ab.'],
      ['Problem vertiefen','Du leitest das Gespräch zu hilfreicher Kritik, Anerkennung und konkreten Absprachen.'],
      ['Ergebnisse sichern','Du fasst Probleme, Wünsche, Zielvereinbarung und Absprachen zusammen und fragst nach Zustimmung.'],
      ['Praxistauglichkeit prüfen','Du klärst mit der Schulleitung, ob die Vereinbarung im Alltag umsetzbar ist und welche Unterstützung folgt.']
    ],
    supervisor5:[
      ['Gespräch eröffnen','Du moderierst das Gespräch ruhig und klar. Deine Moderationskarten sind so aufgebaut, dass das Protokoll die notwendigen Felder gut ausfüllen kann.'],
      ['Perspektiven sammeln','Du fragst nacheinander nach Beobachtungen, Gefühlen und Wünschen. Sprich langsam genug, damit die Ergebnisse festgehalten werden können.'],
      ['Ziele klären','Du fragst nach individuellen Zielen und bündelst Gemeinsamkeiten zu einer gemeinsamen Zielformulierung.'],
      ['Problem vertiefen','Du leitest das Gespräch über hilfreiche Kritik, Anerkennung und konkrete Absprachen.'],
      ['Zustimmung prüfen','Du liest zentrale Ergebnisse vor und fragst, ob die Vereinbarung mitgetragen wird.'],
      ['Praxistauglichkeit prüfen','Du klärst mit der Schulleitung, welche Unterstützung und ersten Umsetzungsschritte realistisch sind.']
    ],
    protokoll:[
      ['Auftrag klären','Du dokumentierst. Du moderierst nicht und bewertest keine Aussage.'],
      ['Kategorien beachten','Trenne Beobachtung/Problem, Gefühle, Wünsche, Ziele, Absprachen und Praxistauglichkeit.'],
      ['Kurz und neutral schreiben','Formuliere stichpunktartig. Wenn etwas unklar ist, bitte um Wiederholung.'],
      ['Ziele sauber sichern','Achte darauf, dass Einzelziele, Gemeinsamkeiten und gemeinsame Zielvereinbarung klar notiert sind.'],
      ['Absprachen und Zustimmung sichern','Halte fest, was vereinbart wird und ob Zustimmung erfolgt.'],
      ['Ergebnisse absenden','Am Ende prüfst du die Zusammenfassung, sendest sie ab und kannst den Gruppenlink teilen.']
    ],
    schulleitung:[
      ['Anlass klären','Überlege, warum du die Supervision angeregt hast und was du beobachtet hast.'],
      ['Perspektive vorbereiten','Trenne Beobachtung, Gefühl und Wunsch. So kannst du im Gespräch klar und sachlich sprechen.'],
      ['Ziel formulieren','Überlege, welche Stabilität die Klasse und welche Zusammenarbeit das Team braucht.'],
      ['Unterstützung prüfen','Überlege, welche organisatorische Unterstützung du anbieten kannst.'],
      ['Zustimmung prüfen','Prüfe, ob du die gemeinsame Vereinbarung mittragen und unterstützen kannst.']
    ],
    lehrkraft:[
      ['Eigene Perspektive klären','Überlege, was für dich das zentrale Problem im Teamteaching ist.'],
      ['Beobachtung statt Vorwurf','Bereite konkrete Situationen vor und vermeide Bewertungen über die andere Person.'],
      ['Gefühle und Wünsche formulieren','Benenne, was die Situation bei dir auslöst und was du brauchst.'],
      ['Ziel formulieren','Überlege, was nach der Supervision konkret anders laufen sollte.'],
      ['Vereinbarung prüfen','Prüfe am Ende, ob du die gemeinsame Absprache mittragen kannst.']
    ]
  };
  window.initFlow = function(){
    if(typeof initCommon === 'function') initCommon();
    const params=new URLSearchParams(location.search);
    let role=params.get('role') || document.body.dataset.role || '';
    const profile=document.body.dataset.flowProfile || (role==='protokoll'?'protokoll':role==='schulleitung'?'schulleitung':role==='supervisor'?'supervisor':((role==='lehrkraft-a'||role==='lehrkraft-b')?'lehrkraft':'general'));
    let steps=FLOW_FINAL.lehrkraft;
    if(profile==='supervisor') steps=hasProtokoll()?FLOW_FINAL.supervisor5:FLOW_FINAL.supervisor4;
    if(profile==='protokoll') steps=FLOW_FINAL.protokoll;
    if(profile==='schulleitung') steps=FLOW_FINAL.schulleitung;
    if(profile==='lehrkraft') steps=FLOW_FINAL.lehrkraft;
    const box=document.getElementById('flowSteps');
    const next=document.getElementById('flowNext');
    if(next){
      let targetRole=role || profile;
      if(profile==='lehrkraft' && !targetRole) targetRole='lehrkraft-a';
      next.href=(typeof linkWithState==='function') ? linkWithState(`gedanken-${targetRole}.html`) : `gedanken-${targetRole}.html`;
      next.classList.add('disabled');
      next.setAttribute('aria-disabled','true');
    }
    if(!box) return;
    const storageKey=(typeof key==='function') ? key('flow_visible_' + (role||profile) + '_final') : 'flow_visible_' + (role||profile) + '_final';
    let visible=Number(localStorage.getItem(storageKey) || '1');
    visible=Math.max(1, Math.min(steps.length, visible));
    function blockNext(event){ if(visible < steps.length) event.preventDefault(); }
    function setNextState(){
      if(!next) return;
      const complete=visible >= steps.length;
      next.classList.toggle('disabled', !complete);
      next.setAttribute('aria-disabled', complete?'false':'true');
      next.textContent=complete?'Weiter: Mach dir Gedanken':'Weiter wird nach allen Kacheln aktiviert';
      next.onclick=complete?null:blockNext;
    }
    function render(){
      box.innerHTML='';
      steps.slice(0, visible).forEach((step, idx)=>{
        const read=idx < visible-1 || visible>=steps.length;
        const isLastVisible=idx===visible-1;
        const card=document.createElement('article');
        card.className='card flow-step is-visible' + (read?' is-read':'');
        card.innerHTML=`<div class="flow-step-head"><span class="step-badge">${idx+1}</span><h3>${esc(step[0])}</h3></div><p>${esc(step[1])}</p>${(!read && isLastVisible)?'<button type="button" class="secondary flow-read-btn">Gelesen</button>':''}`;
        const btn=card.querySelector('.flow-read-btn');
        if(btn) btn.onclick=()=>{ visible=Math.min(steps.length, visible+1); localStorage.setItem(storageKey,String(visible)); render(); };
        box.appendChild(card);
      });
      setNextState();
    }
    render();
  };
  try { initFlow = window.initFlow; } catch(_) {}

  function requiredNote(label, saveKey, hint){
    return `<div class="required-field-wrap"><div class="required-label">Pflichtfeld!</div><label>${esc(label)}</label>${hint?`<p class="small">${esc(hint)}</p>`:''}<textarea data-save="${esc(saveKey)}"></textarea></div>`;
  }
  function readText(k){ try { return (typeof loadText === 'function') ? loadText(k) : ''; } catch(_) { return ''; } }
  function prepItems(role){
    const fields = window.prepFields ? window.prepFields(role) : [];
    return fields.map(f => ({label:f.label, value: readText(`prep_${role}_${f.id}`)}));
  }
  function prepCard(role, title){
    const items = prepItems(role);
    if(!items.length) return '';
    return `<section class="card"><h2>${esc(title || 'Deine vorbereiteten Notizen')}</h2>${items.map(item=>`<h3>${esc(item.label)}</h3><div class="readonly-box">${esc(item.value || 'Noch keine Notiz gespeichert.')}</div>`).join('')}</section>`;
  }
  function scriptBlock(lines){ return `<div class="script-card"><h3>Mögliche Formulierungen</h3><ul class="tight">${lines.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`; }
  function moderatorCard(phase){
    const cards = {
      1:{ title:'Erstkontakt', aim:'Einen sicheren Gesprächsrahmen herstellen.', lines:[
        '„Willkommen. Ich freue mich, dass Sie alle da sind und sich Zeit für die Klärung nehmen.“',
        '„Die Schulleitung hat mich hinzugezogen, weil es im Teamteaching zu Uneinigkeiten gekommen ist, die inzwischen die Zusammenarbeit und die Stabilität der Klasse belasten.“',
        '„Heute geht es nicht um Schuld, sondern darum, die unterschiedlichen Perspektiven zu verstehen und zu einer gemeinsamen Arbeitsgrundlage zu kommen.“',
        '„Sind Sie bereit, einander zuzuhören und an einer gemeinsamen Klärung mitzuwirken?“',
        '„Wir arbeiten mit Ich-Aussagen, konkreten Beobachtungen und respektvoller Sprache.“'
      ]},
      2:{ title:'Problembeschreibung', aim:'Beobachtungen, Gefühle und Wünsche getrennt sammeln.', lines:[
        '„Ich würde zunächst gerne von der Schulleitung hören: Was haben Sie beobachtet?“',
        '„Welche Gefühle oder Sorgen löst die Situation bei Ihnen aus?“',
        '„Welche Wünsche haben Sie an das Teamteaching?“',
        '„Lehrkraft A, wie stellt sich die Situation aus Ihrer Perspektive dar? Was ist für Sie das zentrale Problem?“',
        '„Welche Gefühle sind damit verbunden, und was wünschen Sie sich konkret?“',
        '„Lehrkraft B, ich stelle Ihnen dieselben Fragen: Perspektive, Gefühle und Wünsche.“',
        '„Ich fasse kurz zusammen, was ich gehört habe. Bitte korrigieren Sie mich, wenn etwas nicht stimmt.“'
      ]},
      3:{ title:'Zielformulierung', aim:'Aus den Einzelzielen eine gemeinsame Zielvereinbarung entwickeln.', lines:[
        '„Ich möchte jetzt von jeder Person ein Ziel hören: Was soll nach dieser Supervision klarer oder anders sein?“',
        '„Bitte formulieren Sie das Ziel möglichst konkret und positiv.“',
        '„Welche Gemeinsamkeiten hören wir in diesen Zielen?“',
        '„Welche gemeinsame Zielformulierung könnten alle mittragen?“',
        '„Ich halte fest: Unser gemeinsames Ziel lautet … Stimmen Sie dem so zu?“'
      ]},
      4:{ title:'Vertiefte Problembearbeitung', aim:'Hilfreiche Kritik und konkrete Absprachen entwickeln.', lines:[
        '„Wir schauen jetzt darauf, wie Kritik im Teamteaching hilfreich geäußert werden kann.“',
        '„Was macht Kritik so, dass sie nicht als Angriff ankommt?“',
        '„Welche Regeln helfen: unter vier Augen, konkret, zeitnah, Ich-Botschaft, Bezug auf die Situation?“',
        '„Nennen Sie nun bitte an einer anderen Perspektive einen Punkt, den Sie nachvollziehen oder hilfreich finden.“',
        '„Welche konkrete Absprache hilft dem Team ab morgen?“'
      ]},
      5:{ title:'Ergebnissicherung', aim:'Ergebnisse bündeln und Zustimmung prüfen.', lines:[
        '„Ich fasse die zentralen Punkte zusammen: Probleme, Gefühle, Wünsche, Ziele und Absprachen.“',
        '„Die gemeinsame Zielvereinbarung lautet …“',
        '„Gibt es Korrekturen oder Ergänzungen?“',
        '„Können alle diese Vereinbarung mittragen?“',
        '„Sind alle bereit, an der Umsetzung mitzuwirken?“'
      ]},
      6:{ title:'Reflexionstauglichkeit', aim:'Umsetzbarkeit und Unterstützung durch die Schulleitung prüfen.', lines:[
        '„Ich möchte zum Schluss mit der Schulleitung prüfen, ob die Vereinbarung im Schulalltag realistisch umsetzbar ist.“',
        '„Welche Unterstützung können Sie anbieten?“',
        '„Was ist der erste konkrete Schritt nach der Supervision?“',
        '„Woran merken wir, dass sich die Situation verbessert?“'
      ]}
    };
    const c=cards[phase] || cards[1];
    const note = hasProtokoll() ? '<div class="handoff-note"><strong>Hinweis:</strong> Die Fragen sind an den Feldern orientiert, die das Protokoll dokumentiert. Sprich langsam und fasse Zwischenergebnisse kurz zusammen.</div>' : '';
    return `<section class="card highlight moderation-only-card equal-fill-card"><h2>Moderationskarte: ${esc(c.title)}</h2><p><strong>Ziel:</strong> ${esc(c.aim)}</p>${scriptBlock(c.lines)}${note}</section>`;
  }
  function protocolFields(phase){
    if(phase===1) return `<section class="card protocol-overview-card equal-fill-card"><h2>Dokumentation</h2>${requiredNote('Rahmen / Gesprächsregeln / Bereitschaft','sup_p1_rahmen','Was wurde als Gesprächsrahmen vereinbart?')}</section>`;
    if(phase===2) return `<section class="card protocol-overview-card equal-fill-card"><h2>Dokumentation: Problembeschreibung</h2><p class="small">Trenne Aussagen nach Rolle und Kategorie. Schreibe neutral und stichpunktartig.</p><div class="role-note-block"><h3>Schulleitung</h3>${requiredNote('Problem / Beobachtung','sup_p2_sl_probleme')}${requiredNote('Gefühle','sup_p2_sl_gefuehle')}${requiredNote('Wünsche','sup_p2_sl_wuensche')}</div><div class="role-note-block"><h3>Lehrkraft A</h3>${requiredNote('Problem / Perspektive','sup_p2_a_probleme')}${requiredNote('Gefühle','sup_p2_a_gefuehle')}${requiredNote('Wünsche','sup_p2_a_wuensche')}</div><div class="role-note-block"><h3>Lehrkraft B</h3>${requiredNote('Problem / Perspektive','sup_p2_b_probleme')}${requiredNote('Gefühle','sup_p2_b_gefuehle')}${requiredNote('Wünsche','sup_p2_b_wuensche')}</div></section>`;
    if(phase===3) return `<section class="card protocol-overview-card equal-fill-card"><h2>Dokumentation: Ziele</h2>${requiredNote('Ziel Schulleitung','sup_p3_ziel_sl')}${requiredNote('Ziel Lehrkraft A','sup_p3_ziel_a')}${requiredNote('Ziel Lehrkraft B','sup_p3_ziel_b')}${requiredNote('Gemeinsamkeiten','sup_p3_gemeinsamkeiten')}${requiredNote('Gemeinsame Zielformulierung','sup_p3_gemeinsames_ziel')}</section>`;
    if(phase===4) return `<section class="card protocol-overview-card equal-fill-card"><h2>Dokumentation: Vertiefte Bearbeitung</h2>${requiredNote('Kriterien für hilfreiche Kritik','sup_p4_kritik')}<div class="perspective-table-entry"><p class="small">Notiere getrennt zu jeder Person einen positiven oder nachvollziehbaren Punkt, der von den anderen genannt wurde.</p><div class="three-col">${requiredNote('Positive Rückmeldung zur Schulleitung','sup_p4_pos_sl')}${requiredNote('Positive Rückmeldung zu Lehrkraft A','sup_p4_pos_a')}${requiredNote('Positive Rückmeldung zu Lehrkraft B','sup_p4_pos_b')}</div></div>${requiredNote('Absprachen zum weiteren Vorgehen','sup_p4_absprachen')}</section>`;
    if(phase===5) return `<section class="card protocol-overview-card equal-fill-card"><h2>Dokumentation: Ergebnissicherung</h2><div class="summary-block"><strong>Zwischenergebnisse</strong><br>${typeof miniSummaryHtml==='function'?miniSummaryHtml():''}</div><label>Zustimmung erfolgt?</label><select class="standard-required" data-save="sup_p5_zustimmung_status"><option value="">Bitte auswählen</option><option value="Alle stimmen zu">Alle stimmen zu</option><option value="Teilweise Zustimmung / offene Punkte">Teilweise Zustimmung / offene Punkte</option><option value="Keine Zustimmung">Keine Zustimmung</option></select>${requiredNote('Rückmeldungen / Zustimmung / offene Punkte','sup_p5_zustimmung')}</section>`;
    if(phase===6) return `<section class="card protocol-overview-card equal-fill-card"><h2>Dokumentation: Praxistauglichkeit</h2>${requiredNote('Einschätzung der Praxistauglichkeit','sup_p6_praxistauglichkeit')}${requiredNote('Unterstützung durch Schulleitung','sup_p6_unterstuetzung')}${requiredNote('Erste konkrete Umsetzungsschritte','sup_p6_umsetzung')}</section>`;
    return '';
  }
  function supervisorFullPhase(phase){
    return `<div class="two-col">${moderatorCard(phase)}${protocolFields(phase)}</div>`;
  }
  function protokollOnlyPhase(phase){
    return `<div class="two-col"><section class="card highlight protokoll-note-card"><p class="role-pill role-protokoll">Protokoll</p><h2>Deine Aufgabe in Phase ${phase}</h2><p>Höre genau zu und fülle die Dokumentationsfelder. Du moderierst nicht. Frage nur kurz nach, wenn eine Aussage unklar ist.</p></section>${protocolFields(phase)}</div>`;
  }
  function participantPhaseFinal(role, phase){
    const roleLabel=LABELS_FINAL[role] || role;
    if(phase===1) return `<section class="card highlight"><p class="role-pill ${roleClass(role)}">${esc(roleLabel)}</p><h2>Gesprächsstart</h2><p>Höre der Supervisor*in zu. Achte auf Gesprächsregeln und darauf, ob du bereit bist, deine Perspektive einzubringen und die anderen Perspektiven zunächst anzuhören.</p></section>${prepCard(role,'Deine vorbereiteten Gedanken')}`;
    if(phase===2) return `<section class="card highlight"><p class="role-pill ${roleClass(role)}">${esc(roleLabel)}</p><h2>Problembeschreibung</h2><p>Wenn du das Wort bekommst, sprich entlang deiner vorbereiteten Notizen: Beobachtung oder Perspektive, Gefühle und Wünsche. Bleibe konkret und vermeide Vorwürfe.</p></section>${prepCard(role,'Notizen für deine Wortmeldung')}`;
    if(phase===3) return `<section class="card highlight"><p class="role-pill ${roleClass(role)}">${esc(roleLabel)}</p><h2>Zielformulierung</h2><p>Nutze deine Zielgedanken aus der Überlegungsphase. Im Gespräch formulierst du nicht neu für dich allein, sondern arbeitest mit der Gruppe an einer gemeinsamen Zielvereinbarung.</p><p class="notice">Orientiere dich an deinen vorbereiteten Zielgedanken und Wünschen.</p></section>${prepCard(role,'Vorbereitete Ziele und Wünsche')}`;
    if(phase===4) return `<section class="card highlight"><p class="role-pill ${roleClass(role)}">${esc(roleLabel)}</p><h2>Vertiefte Problembearbeitung</h2><p>Beteilige dich am Gespräch über hilfreiche Kritik. Formuliere Kritik situativ, konkret und nicht persönlich. Nenne in der Runde nachvollziehbarer Perspektiven mindestens einen Punkt, den du an einer anderen Perspektive nachvollziehen kannst.</p></section>${prepCard(role,'Wünsche und Ziele als Orientierung')}`;
    if(phase===5) return `<section class="card highlight"><p class="role-pill ${roleClass(role)}">${esc(roleLabel)}</p><h2>Ergebnissicherung</h2><p>Höre die Zusammenfassung. Prüfe, ob deine Perspektive, Gefühle, Wünsche und Ziele korrekt aufgenommen wurden. Sage klar, ob du die Vereinbarung mittragen kannst.</p></section>${prepCard(role,'Deine Notizen zum Abgleichen')}`;
    if(phase===6 && role==='schulleitung') return `<section class="card highlight"><p class="role-pill role-schulleitung">Schulleitung</p><h2>Praxistauglichkeit prüfen</h2><p>Prüfe mit der Supervisor*in, ob die Vereinbarung im Schulalltag realistisch ist. Benenne, welche Unterstützung du anbieten kannst und was der erste konkrete Schritt ist.</p></section>${prepCard(role,'Vorbereitete Unterstützungsideen')}`;
    if(phase===6) return `<section class="card highlight"><p class="role-pill ${roleClass(role)}">${esc(roleLabel)}</p><h2>Abschluss</h2><p>Die Praxistauglichkeit wird vor allem mit der Schulleitung geprüft. Nutze die Zeit, um zu überlegen, was du aus dem Gespräch mitnimmst und welchen ersten Schritt du selbst gehen kannst.</p></section>${prepCard(role,'Deine wichtigsten Punkte')}`;
    return '';
  }
  window.initPhase = function(){
    if(typeof initCommon === 'function') initCommon();
    const role = (typeof getPageRole === 'function') ? getPageRole() : document.body.dataset.role;
    const phase = (typeof getPhase === 'function') ? getPhase() : Number(document.body.dataset.phase || '0');
    if(typeof renderPhaseBar === 'function') renderPhaseBar(phase);
    const title=document.getElementById('phaseTitle');
    if(title) title.textContent = `Phase ${phase}: ${PHASE_NAMES_FINAL[phase] || ''}`;
    const content=document.getElementById('phaseContent');
    if(!content) return;
    if(role==='protokoll') content.innerHTML=protokollOnlyPhase(phase);
    else if(role==='supervisor' && hasProtokoll()) content.innerHTML=moderatorCard(phase);
    else if(role==='supervisor') content.innerHTML=supervisorFullPhase(phase);
    else content.innerHTML=participantPhaseFinal(role, phase);
    if(oldSetupSavingFinal) oldSetupSavingFinal();
    const next=document.getElementById('nextPhase');
    if(next){
      if(phase < 6){
        {
        let targetFile = `phase${phase+1}-${role}.html`;
        let url = (typeof linkWithState === 'function') ? linkWithState(targetFile) : targetFile;
        if(role === 'supervisor'){
          const mode = (typeof window.__svSupervisorHasProtocolV108 === 'function' && window.__svSupervisorHasProtocolV108()) ? 'moderation' : 'full';
          url += (url.indexOf('?')>=0?'&':'?') + 'supervisorMode=' + encodeURIComponent(mode) + '&members=' + (mode==='moderation'?'5':'4');
        }
        next.href = url;
      }
        next.textContent = `Bereit für Phase ${phase+1}`;
      } else {
        let target='abschluss.html';
        if(role==='protokoll') target='zusammenfassung-protokoll.html';
        else if(role==='supervisor' && !hasProtokoll()) target='zusammenfassung.html';
        {
        let url = (typeof linkWithState === 'function') ? linkWithState(target) : target;
        if(role === 'supervisor'){
          const mode = (typeof window.__svSupervisorHasProtocolV108 === 'function' && window.__svSupervisorHasProtocolV108()) ? 'moderation' : 'full';
          url += (url.indexOf('?')>=0?'&':'?') + 'supervisorMode=' + encodeURIComponent(mode) + '&members=' + (mode==='moderation'?'5':'4');
        }
        next.href = url;
      }
        next.textContent = (target.indexOf('zusammenfassung')>=0) ? 'Ergebnisse zusammenfassen' : 'Abschluss';
      }
    }
  };
  try { initPhase = window.initPhase; } catch(_) {}

  document.addEventListener('DOMContentLoaded',()=>{
    const role=document.body.dataset.role;
    if(role){ document.body.classList.add('role-theme-' + role); if(role.indexOf('lehrkraft')===0) document.body.classList.add('role-theme-lehrkraft'); }
  });
})();

/* ------------------------------------------------------------
   FINAL MODERATION PATCH v2: Gesprächsführung mit Antwortpausen,
   Phase-2-Dokumentation in drei Spalten, Protokoll-Zusammenfassung.
   ------------------------------------------------------------ */
(function(){
  const LABELS = {
    supervisor: 'Supervisor*in',
    schulleitung: 'Schulleitung',
    'lehrkraft-a': 'Lehrkraft A',
    'lehrkraft-b': 'Lehrkraft B',
    protokoll: 'Protokoll'
  };
  const PHASE_NAMES = {
    1: 'Erstkontakt',
    2: 'Problembeschreibung',
    3: 'Zielformulierung',
    4: 'Vertiefte Problembearbeitung',
    5: 'Ergebnissicherung',
    6: 'Reflexionstauglichkeit'
  };
  function esc(v){
    if (typeof escapeHtml === 'function') return escapeHtml(v);
    return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }
  function roleClass(role){ return 'role-' + String(role || '').replace(/[^a-z0-9-]/g,''); }
  function getAssignments(){ try { return (typeof loadObj === 'function') ? loadObj('assignments', {}) : {}; } catch(_) { return {}; } }
  function hasProtocol(){ return !!window.__svSupervisorHasProtocolCleanV119(); }
  function loadSafe(k){ try { return (typeof loadText === 'function') ? loadText(k) : ''; } catch(_) { return ''; } }
  function reqNote(label, saveKey, hint){
    return `<div class="required-field-box"><div class="required-label">Pflichtfeld!</div><label>${esc(label)}</label>${hint?`<p class="small">${esc(hint)}</p>`:''}<textarea data-save="${esc(saveKey)}"></textarea></div>`;
  }
  function waitBox(text){ return `<span class="answer-wait compact-wait">Antwort abwarten</span>`; }
  function scriptBlock(items){
    return `<div class="moderation-script">${items.map(item => {
      if (typeof item === 'string') return `<div class="script-step"><p>${esc(item)}</p></div>`;
      return `<div class="script-step"><p>${esc(item.text)}</p>${item.wait ? waitBox(item.wait) : ''}</div>`;
    }).join('')}</div>`;
  }
  function protocolCheckLine(){
    return hasProtocol()
      ? '„Protokollführung: Ist bis hierhin alles so notiert, dass wir zur nächsten Phase gehen können?“'
      : '„Ich prüfe kurz meine Notizen. Ist aus Ihrer Sicht noch etwas Wesentliches offen, bevor wir zur nächsten Phase gehen?“';
  }
  function miniSummary(){ return (typeof miniSummaryHtml === 'function') ? miniSummaryHtml() : ''; }

  function moderatorCard(phase){
    const cards = {
      1: {
        title: 'Erstkontakt',
        aim: 'Gespräch eröffnen, Bereitschaft klären und einen verbindlichen Gesprächsrahmen vereinbaren.',
        lines: [
          { text: '„Willkommen. Ich freue mich, dass Sie alle da sind. Wir nutzen diese Supervision, um den Konflikt im Teamteaching geordnet zu klären.“' },
          { text: '„Die Schulleitung hat mich hinzugezogen, weil die Uneinigkeit im Teamteaching die Zusammenarbeit belastet und die Klasse dadurch zu wenig Stabilität erlebt.“' },
          { text: '„Mir ist wichtig: Es geht nicht um Schuldzuweisung. Es geht darum, Beobachtungen, Gefühle, Wünsche und Ziele so zu sortieren, dass eine gemeinsame Vereinbarung möglich wird.“' },
          { text: '„Sind alle bereit, an dieser Klärung mitzuwirken und die Perspektiven der anderen zunächst anzuhören?“', wait: 'Antworten der Beteiligten abwarten.' },
          { text: '„Ich möchte jetzt mit Ihnen einen Gesprächsrahmen vereinbaren. Was brauchen Sie, damit dieses Gespräch respektvoll und hilfreich verlaufen kann?“', wait: 'Beispiele sammeln lassen: ausreden lassen, Ich-Aussagen, konkrete Beobachtungen, keine persönlichen Angriffe, keine vorschnellen Bewertungen.' },
          { text: '„Ich halte fest: Wir sprechen respektvoll, lassen einander ausreden, bleiben bei konkreten Beobachtungen und prüfen am Ende gemeinsam die Vereinbarung.“' },
          { text: protocolCheckLine(), wait: 'Kurze Bestätigung abwarten.' }
        ]
      },
      2: {
        title: 'Problembeschreibung',
        aim: 'Die Situation aus drei Perspektiven verstehen: Beobachtung oder Problem, Gefühle und Wünsche.',
        lines: [
          { text: '„Ich würde jetzt zunächst die Schulleitung bitten: Welche Beobachtung haben Sie zur Situation im Teamteaching gemacht?“', wait: 'Schulleitung sprechen lassen. Danach kurz zusammenfassen.' },
          { text: '„Welche Gefühle löst diese Situation bei Ihnen aus?“', wait: 'Antwort abwarten.' },
          { text: '„Welche Wünsche haben Sie an das Teamteaching und an die Zusammenarbeit der Lehrkräfte?“', wait: 'Antwort abwarten.' },
          { text: '„Lehrkraft A, wie erleben Sie die Situation? Was ist aus Ihrer Sicht das zentrale Problem?“', wait: 'Lehrkraft A sprechen lassen. Danach Gefühle und Wünsche erfragen.' },
          { text: '„Welche Gefühle sind damit verbunden, und was wünschen Sie sich konkret?“', wait: 'Antworten abwarten.' },
          { text: '„Lehrkraft B, wie erleben Sie die Situation? Was ist aus Ihrer Sicht das zentrale Problem?“', wait: 'Lehrkraft B sprechen lassen. Danach Gefühle und Wünsche erfragen.' },
          { text: '„Welche Gefühle sind damit verbunden, und was wünschen Sie sich konkret?“', wait: 'Antworten abwarten.' },
          { text: '„Gibt es noch eine sachliche Ergänzung zur Problembeschreibung, ohne die andere Perspektive zu bewerten?“', wait: 'Kurze Ergänzungen zulassen.' },
          { text: protocolCheckLine(), wait: 'Bestätigung der Protokollführung beziehungsweise Notizen abwarten.' }
        ]
      },
      3: {
        title: 'Zielformulierung',
        aim: 'Einzelziele sichtbar machen und daraus eine gemeinsame Zielvereinbarung entwickeln.',
        lines: [
          { text: '„Wir gehen jetzt von der Problembeschreibung zur Zielformulierung. Bitte formulieren Sie möglichst konkret, was nach dieser Klärung anders sein soll.“' },
          { text: '„Schulleitung: Welches Ziel verfolgen Sie mit Blick auf Stabilität für die Klasse und die Zusammenarbeit im Team?“', wait: 'Ziel der Schulleitung abwarten und kurz bündeln.' },
          { text: '„Lehrkraft A: Welches Ziel wäre aus Ihrer Perspektive wichtig, damit Sie im Teamteaching handlungsfähig bleiben?“', wait: 'Ziel von Lehrkraft A abwarten.' },
          { text: '„Lehrkraft B: Welches Ziel wäre aus Ihrer Perspektive wichtig, damit Veränderung und Zusammenarbeit möglich werden?“', wait: 'Ziel von Lehrkraft B abwarten.' },
          { text: '„Welche Gemeinsamkeiten sehen Sie in diesen Zielen?“', wait: 'Gemeinsamkeiten durch die Gruppe benennen lassen.' },
          { text: '„Lassen Sie uns daraus eine gemeinsame Zielvereinbarung formulieren. Sie sollte kurz, konkret und für alle tragbar sein.“', wait: 'Gemeinsame Formulierung entwickeln lassen.' },
          { text: '„Ich lese die Formulierung einmal vor. Passt sie für alle als Arbeitsgrundlage?“', wait: 'Korrekturen abwarten.' },
          { text: protocolCheckLine(), wait: 'Bestätigung abwarten.' }
        ]
      },
      4: {
        title: 'Vertiefte Problembearbeitung',
        aim: 'Hilfreiche Kritik, Anerkennung und konkrete Absprachen entwickeln.',
        lines: [
          { text: '„Wir schauen jetzt darauf, wie Kritik im Teamteaching künftig hilfreicher geäußert werden kann.“' },
          { text: '„Wie würden Sie sich in Zukunft wünschen, dass Kritik angesprochen wird?“', wait: 'Ideen sammeln lassen. Protokoll notiert Kriterien.' },
          { text: '„Welche Regeln wären dafür hilfreich: unter vier Augen, konkret, zeitnah, Ich-Botschaft, Bezug auf eine Situation statt auf die Person?“', wait: 'Ergänzungen abwarten.' },
          { text: '„Ich leite jetzt eine kurze Übung zur Stärkung der Teamfähigkeit an. Jede Paarung sagt sich gegenseitig, was sie an der Perspektive des Gegenübers nachvollziehbar oder hilfreich findet.“' },
          { text: '„Zuerst: Schulleitung und Lehrkraft A. Was finden Sie an der Perspektive der jeweils anderen Person nachvollziehbar?“', wait: 'Kurzen Austausch abwarten.' },
          { text: '„Jetzt: Lehrkraft A und Lehrkraft B. Was können Sie an der Perspektive der anderen Person anerkennen?“', wait: 'Kurzen Austausch abwarten.' },
          { text: '„Jetzt: Schulleitung und Lehrkraft B. Was ist an der jeweiligen Perspektive nachvollziehbar oder hilfreich?“', wait: 'Kurzen Austausch abwarten.' },
          { text: '„Zum Schluss dieser Phase: Was soll sich ab morgen konkret ändern? Welche Absprache hilft dem Team im nächsten Unterricht?“', wait: 'Konkrete Absprachen formulieren lassen.' },
          { text: protocolCheckLine(), wait: 'Bestätigung abwarten.' }
        ]
      },
      5: {
        title: 'Ergebnissicherung',
        aim: 'Zentrale Punkte zusammenfassen, Zielvereinbarung prüfen und Zustimmung sichern.',
        lines: hasProtocol() ? [
          { text: '„Wir sichern jetzt die Ergebnisse. Protokollführung, bitte fassen Sie noch einmal die geäußerten Probleme, Gefühle, Wünsche, Ziele und Absprachen zusammen.“', wait: 'Zusammenfassung der Protokollführung abwarten.' },
          { text: '„Bitte lesen Sie anschließend die gemeinsame Zielvereinbarung vor.“', wait: 'Zielvereinbarung vorlesen lassen.' },
          { text: '„Gibt es konkrete Korrekturen oder Ergänzungen?“', wait: 'Korrekturen abwarten und durch Protokoll ergänzen lassen.' },
          { text: '„Können alle diese Vereinbarung mittragen?“', wait: 'Zustimmung jeder beteiligten Person abwarten.' },
          { text: '„Gibt es offene Rückmeldungen oder offene Punkte, die noch ergänzt werden sollen?“', wait: 'Offene Punkte abwarten.' },
          { text: '„Protokollführung: Bitte setzen Sie die Zustimmung entsprechend und ergänzen Sie offene Rückmeldungen.“', wait: 'Eintrag abwarten.' }
        ] : [
          { text: '„Ich fasse die zentralen Punkte zusammen: Probleme, Gefühle, Wünsche, Ziele und Absprachen.“', wait: 'Kurz prüfen, ob alle folgen können.' },
          { text: '„Die gemeinsame Zielvereinbarung lautet …“', wait: 'Zielvereinbarung vorlesen.' },
          { text: '„Gibt es konkrete Korrekturen oder Ergänzungen?“', wait: 'Korrekturen eintragen.' },
          { text: '„Können alle diese Vereinbarung mittragen?“', wait: 'Zustimmung jeder Person abwarten und setzen.' },
          { text: '„Gibt es offene Rückmeldungen oder offene Punkte, die noch ergänzt werden sollen?“', wait: 'Antworten notieren.' }
        ]
      },
      6: {
        title: 'Reflexionstauglichkeit',
        aim: 'Mit der Schulleitung prüfen, ob die Vereinbarung im Schulalltag tragfähig ist.',
        lines: [
          { text: '„Das Folgende richtet sich jetzt vor allem an die Schulleitung.“' },
          { text: '„Wie schätzen Sie ein, dass die heute besprochenen Punkte und Ziele im Schulalltag wirklich umgesetzt werden können?“', wait: 'Einschätzung der Schulleitung abwarten.' },
          { text: '„Welche Unterstützungsmöglichkeiten sehen Sie bei sich selbst oder durch die Schule?“', wait: 'Unterstützungsmöglichkeiten abwarten.' },
          { text: '„Was werden Sie konkret unternehmen, um ein harmonischeres Miteinander im Teamteaching zu fördern?“', wait: 'Erste Umsetzungsschritte abwarten.' },
          { text: protocolCheckLine(), wait: 'Bestätigung abwarten.' }
        ]
      }
    };
    const c = cards[phase] || cards[1];
    const note = hasProtocol() ? '' : '<div class="handoff-note compact-note"><strong>Hinweis:</strong> Du moderierst und dokumentierst.</div>';
    return `<section class="card highlight moderation-only-card equal-fill-card"><h2>Moderationskarte: ${esc(c.title)}</h2><p><strong>Ziel:</strong> ${esc(c.aim)}</p>${scriptBlock(c.lines)}${note}</section>`;
  }

  function protocolFields(phase){
    if(phase === 1) return `<section class="card protocol-overview-card equal-fill-card"><h2>Dokumentation: Gesprächsrahmen</h2><p class="small">Notiere, welche Gesprächsregeln vereinbart wurden und ob die Beteiligten zur Klärung bereit sind.</p>${reqNote('Gesprächsrahmen / Regeln / Bereitschaft','sup_p1_rahmen','Zum Beispiel: ausreden lassen, Ich-Aussagen, respektvoll bleiben, konkrete Beobachtungen nennen.')}</section>`;
    if(phase === 2) return `<section class="card protocol-overview-card phase2-protocol-section"><div class="phase2-title-row"><h2>Phase 2: Problembeschreibung</h2><div class="phase-task-card"><h3>Deine Aufgabe in Phase 2</h3><p>Trenne die Aussagen nach Rolle und Kategorie. Halte nur fest, was gesagt wurde: Problem oder Beobachtung, Gefühle und Wünsche.</p></div></div><div class="phase2-doc-grid"><div class="role-note-block"><h3>Schulleitung</h3>${reqNote('Problem / Beobachtung','sup_p2_sl_probleme')}${reqNote('Gefühle','sup_p2_sl_gefuehle')}${reqNote('Wünsche','sup_p2_sl_wuensche')}</div><div class="role-note-block"><h3>Lehrkraft A</h3>${reqNote('Problem / Perspektive','sup_p2_a_probleme')}${reqNote('Gefühle','sup_p2_a_gefuehle')}${reqNote('Wünsche','sup_p2_a_wuensche')}</div><div class="role-note-block"><h3>Lehrkraft B</h3>${reqNote('Problem / Perspektive','sup_p2_b_probleme')}${reqNote('Gefühle','sup_p2_b_gefuehle')}${reqNote('Wünsche','sup_p2_b_wuensche')}</div></div></section>`;
    if(phase === 3) return `<section class="card protocol-overview-card equal-fill-card"><h2>Dokumentation: Ziele</h2><p class="small">Notiere erst die Einzelziele und danach die Gemeinsamkeiten und die gemeinsame Zielvereinbarung.</p>${reqNote('Ziel Schulleitung','sup_p3_ziel_sl')}${reqNote('Ziel Lehrkraft A','sup_p3_ziel_a')}${reqNote('Ziel Lehrkraft B','sup_p3_ziel_b')}${reqNote('Gemeinsamkeiten','sup_p3_gemeinsamkeiten')}${reqNote('Gemeinsame Zielformulierung','sup_p3_gemeinsames_ziel')}</section>`;
    if(phase === 4) return `<section class="card protocol-overview-card equal-fill-card"><h2>Dokumentation: Vertiefte Problembearbeitung</h2><p class="small">Halte fest, wie Kritik künftig hilfreich geäußert werden soll und welche konkreten Absprachen entstehen.</p>${reqNote('Kriterien für hilfreiche Kritik','sup_p4_kritik')}<div class="perspective-table-entry"><div class="three-col">${reqNote('Positive Rückmeldung zur Schulleitung','sup_p4_pos_sl')}${reqNote('Positive Rückmeldung zu Lehrkraft A','sup_p4_pos_a')}${reqNote('Positive Rückmeldung zu Lehrkraft B','sup_p4_pos_b')}</div></div>${reqNote('Absprachen zum weiteren Vorgehen','sup_p4_absprachen')}</section>`;
    if(phase === 5) return `<section class="card protocol-overview-card equal-fill-card"><h2>Dokumentation: Ergebnissicherung</h2><p class="small">Fasse die Ergebnisse für die Gruppe zusammen. Trage Zustimmung und offene Punkte ein.</p><div class="summary-block"><strong>Zwischenergebnisse</strong><br>${miniSummary()}</div><label>Zustimmung erfolgt?</label><select class="standard-required" data-save="sup_p5_zustimmung_status"><option value="">Bitte auswählen</option><option value="Alle stimmen zu">Alle stimmen zu</option><option value="Teilweise Zustimmung / offene Punkte">Teilweise Zustimmung / offene Punkte</option><option value="Keine Zustimmung">Keine Zustimmung</option></select>${reqNote('Rückmeldungen / Zustimmung / offene Punkte','sup_p5_zustimmung')}</section>`;
    if(phase === 6) return `<section class="card protocol-overview-card equal-fill-card"><h2>Dokumentation: Praxistauglichkeit</h2><p class="small">Dokumentiere die Einschätzung der Schulleitung und die nächsten konkreten Schritte.</p>${reqNote('Einschätzung der Praxistauglichkeit','sup_p6_praxistauglichkeit')}${reqNote('Unterstützung durch Schulleitung','sup_p6_unterstuetzung')}${reqNote('Erste konkrete Umsetzungsschritte','sup_p6_umsetzung')}</section>`;
    return '';
  }
  function supervisorFullPhase(phase){ return `<div class="two-col equal-phase-layout compact-phase-layout supervisor-protocol-grid">${moderatorCard(phase)}${protocolFields(phase)}</div>`; }
  function protocolOnlyPhase(phase){ return `<div class="two-col equal-phase-layout compact-phase-layout protocol-task-grid"><section class="card highlight protokoll-note-card equal-fill-card"><p class="role-pill role-protokoll">Protokoll</p><h2>Deine Aufgabe in Phase ${phase}</h2><p>Höre genau zu und fülle die Dokumentationsfelder. Du moderierst nicht. Bitte bei unklaren Aussagen kurz um Wiederholung oder eine Zusammenfassung.</p><div class="protokoll-spacer" aria-hidden="true"></div></section>${protocolFields(phase)}</div>`; }
  function prepItems(role){
    const map = {
      schulleitung: [
        ['Beobachtung', 'prep_schulleitung_beobachtung'],
        ['Gefühle', 'prep_schulleitung_gefuehle'],
        ['Wünsche', 'prep_schulleitung_wuensche'],
        ['Ziel der Supervision', 'prep_schulleitung_ziel']
      ],
      'lehrkraft-a': [
        ['Perspektive', 'prep_lehrkraft-a_perspektive'],
        ['Gefühle', 'prep_lehrkraft-a_gefuehle'],
        ['Wünsche', 'prep_lehrkraft-a_wuensche'],
        ['Zielgedanken', 'prep_lehrkraft-a_ziele']
      ],
      'lehrkraft-b': [
        ['Perspektive', 'prep_lehrkraft-b_perspektive'],
        ['Gefühle', 'prep_lehrkraft-b_gefuehle'],
        ['Wünsche', 'prep_lehrkraft-b_wuensche'],
        ['Zielgedanken', 'prep_lehrkraft-b_ziele']
      ]
    };
    return (map[role] || []).map(([label,k]) => ({label, value: loadSafe(k)}));
  }
  function prepCard(role, title){
    const items = prepItems(role);
    if(!items.length) return '';
    return `<section class="card prep-reference-card"><h2>${esc(title || 'Deine vorbereiteten Notizen')}</h2>${items.map(i => `<h3>${esc(i.label)}</h3><div class="readonly-box">${esc(i.value || 'Noch keine Notiz gespeichert.')}</div>`).join('')}</section>`;
  }
  function participantPhase(role, phase){
    const label = LABELS[role] || role;
    if(phase===1) return `<section class="card highlight"><p class="role-pill ${roleClass(role)}">${esc(label)}</p><h2>Gesprächsstart</h2><p>Höre der Supervisor*in zu. Achte auf den vereinbarten Gesprächsrahmen und darauf, ob du bereit bist, deine Perspektive einzubringen.</p></section>${prepCard(role,'Deine vorbereiteten Gedanken')}`;
    if(phase===2) return `<section class="card highlight"><p class="role-pill ${roleClass(role)}">${esc(label)}</p><h2>Problembeschreibung</h2><p>Wenn du das Wort bekommst, nutze deine vorbereiteten Notizen: Perspektive oder Beobachtung, Gefühle und Wünsche. Sprich konkret und ohne Vorwurf.</p></section>${prepCard(role,'Notizen für deine Wortmeldung')}`;
    if(phase===3) return `<section class="card highlight"><p class="role-pill ${roleClass(role)}">${esc(label)}</p><h2>Zielformulierung</h2><p>Nutze deine vorbereiteten Zielgedanken aus der Überlegungsphase. Im Gespräch arbeitest du mit der Gruppe an einer gemeinsamen Zielvereinbarung.</p><p class="notice">Du musst hier keine neue individuelle Zielformulierung mehr eintragen.</p></section>${prepCard(role,'Vorbereitete Ziele und Wünsche')}`;
    if(phase===4) return `<section class="card highlight"><p class="role-pill ${roleClass(role)}">${esc(label)}</p><h2>Vertiefte Problembearbeitung</h2><p>Beteilige dich am Gespräch über hilfreiche Kritik. In der kurzen Übung sagst du, was du an der Perspektive einer anderen Person nachvollziehen kannst.</p></section>${prepCard(role,'Wünsche und Ziele als Orientierung')}`;
    if(phase===5) return `<section class="card highlight"><p class="role-pill ${roleClass(role)}">${esc(label)}</p><h2>Ergebnissicherung</h2><p>Höre die Zusammenfassung. Prüfe, ob deine Perspektive, Gefühle, Wünsche und Ziele korrekt aufgenommen wurden. Sage klar, ob du die Vereinbarung mittragen kannst.</p></section>${prepCard(role,'Deine Notizen zum Abgleichen')}`;
    if(phase===6 && role==='schulleitung') return `<section class="card highlight"><p class="role-pill role-schulleitung">Schulleitung</p><h2>Praxistauglichkeit prüfen</h2><p>Prüfe mit der Supervisor*in, ob die Vereinbarung im Schulalltag realistisch ist. Benenne Unterstützungsmöglichkeiten und erste konkrete Umsetzungsschritte.</p></section>${prepCard(role,'Vorbereitete Unterstützungsideen')}`;
    if(phase===6) return `<section class="card highlight"><p class="role-pill ${roleClass(role)}">${esc(label)}</p><h2>Abschluss</h2><p>Die Praxistauglichkeit wird vor allem mit der Schulleitung geprüft. Überlege, welchen ersten Schritt du selbst nach der Supervision gehen kannst.</p></section>${prepCard(role,'Deine wichtigsten Punkte')}`;
    return '';
  }

  const FLOW_STEPS = {
    supervisor4: [
      ['Gespräch eröffnen', 'Du begrüßt die Gruppe, benennst den Anlass neutral und vereinbarst einen Gesprächsrahmen.'],
      ['Probleme und Wünsche erfassen', 'Du fragst nacheinander nach Beobachtungen oder Problemen, Gefühlen und Wünschen und hältst diese Punkte fest.'],
      ['Ziele klären', 'Du fragst nach Einzelzielen und leitest eine gemeinsame Zielvereinbarung an.'],
      ['Kritik und Absprachen bearbeiten', 'Du leitest die kurze Übung zur Anerkennung von Perspektiven und sammelst konkrete Absprachen.'],
      ['Ergebnisse sichern', 'Du fasst Ergebnisse zusammen, prüfst Zustimmung und offene Punkte.'],
      ['Praxistauglichkeit prüfen', 'Du klärst mit der Schulleitung Unterstützung und erste Umsetzungsschritte.']
    ],
    supervisor5: [
      ['Gespräch eröffnen', 'Du begrüßt die Gruppe, benennst den Anlass neutral und vereinbarst einen Gesprächsrahmen.'],
      ['Moderationskarten nutzen', 'Deine Karten sind entlang der Informationen aufgebaut, die für die Dokumentation gebraucht werden. Greife die vorgeschlagenen Fragen im Gespräch auf.'],
      ['Antworten bewusst abwarten', 'Stelle Fragen nacheinander und gib genug Zeit, damit Antworten entstehen und dokumentiert werden können.'],
      ['Ziele und Absprachen leiten', 'Du fragst nach Einzelzielen, Gemeinsamkeiten, hilfreicher Kritik und konkreten Absprachen.'],
      ['Protokollierte Ergebnisse sichern', 'Du lässt die zentralen Punkte zusammenfassen und prüfst Korrekturen, Ergänzungen und Zustimmung.'],
      ['Praxistauglichkeit prüfen', 'Du richtest die letzten Fragen an die Schulleitung: Umsetzbarkeit, Unterstützung und erste Schritte.']
    ],
    protokoll: [
      ['Auftrag klären', 'Du dokumentierst neutral. Du moderierst nicht und bewertest keine Aussage.'],
      ['Kategorien beachten', 'Trenne Problem/Beobachtung, Gefühle, Wünsche, Ziele, Absprachen, Zustimmung und Praxistauglichkeit.'],
      ['Kurz und genau schreiben', 'Formuliere stichpunktartig. Bitte bei Unklarheiten um Wiederholung.'],
      ['Zielvereinbarung sichern', 'Achte darauf, dass Einzelziele, Gemeinsamkeiten und gemeinsames Ziel klar notiert sind.'],
      ['Zusammenfassung unterstützen', 'In der Ergebnissicherung liest du zentrale Punkte und die gemeinsame Zielvereinbarung vor.'],
      ['Ergebnisse absenden', 'Am Ende prüfst du die Zusammenfassung, sendest sie ab und kannst den Gruppenlink teilen.']
    ],
    schulleitung: [
      ['Anlass klären', 'Überlege, warum du die Supervision angeregt hast und was du beobachtet hast.'],
      ['Perspektive vorbereiten', 'Trenne Beobachtung, Gefühl und Wunsch. So kannst du im Gespräch klar sprechen.'],
      ['Ziel formulieren', 'Überlege, welche Stabilität die Klasse und welche Zusammenarbeit das Team braucht.'],
      ['Unterstützung prüfen', 'Überlege, welche organisatorische Unterstützung du anbieten kannst.'],
      ['Zustimmung prüfen', 'Prüfe, ob du die gemeinsame Vereinbarung mittragen und unterstützen kannst.']
    ],
    lehrkraft: [
      ['Eigene Perspektive klären', 'Überlege, was für dich das zentrale Problem im Teamteaching ist.'],
      ['Beobachtung statt Vorwurf', 'Bereite konkrete Situationen vor und vermeide Bewertungen über die andere Person.'],
      ['Gefühle und Wünsche formulieren', 'Benenne, was die Situation bei dir auslöst und was du brauchst.'],
      ['Ziel formulieren', 'Überlege, was nach der Supervision konkret anders laufen sollte.'],
      ['Vereinbarung prüfen', 'Prüfe am Ende, ob du die gemeinsame Absprache mittragen kannst.']
    ]
  };
  window.initFlow = function(){
    if(typeof initCommon === 'function') initCommon();
    const params = new URLSearchParams(location.search);
    let role = params.get('role') || document.body.dataset.role || '';
    let profile = document.body.dataset.flowProfile || (role === 'protokoll' ? 'protokoll' : role === 'schulleitung' ? 'schulleitung' : role === 'supervisor' ? 'supervisor' : (role === 'lehrkraft-a' || role === 'lehrkraft-b') ? 'lehrkraft' : 'lehrkraft');
    let steps = FLOW_STEPS.lehrkraft;
    if(profile === 'supervisor') steps = hasProtocol() ? FLOW_STEPS.supervisor5 : FLOW_STEPS.supervisor4;
    if(profile === 'protokoll') steps = FLOW_STEPS.protokoll;
    if(profile === 'schulleitung') steps = FLOW_STEPS.schulleitung;
    if(profile === 'lehrkraft') steps = FLOW_STEPS.lehrkraft;
    const box = document.getElementById('flowSteps');
    const next = document.getElementById('flowNext');
    if(next){
      let targetRole = role || profile;
      if(profile === 'lehrkraft' && (!targetRole || targetRole === 'lehrkraft')) targetRole = 'lehrkraft-a';
      let targetFile = `gedanken-${targetRole}.html`;
      if(profile === 'supervisor' && (hasProtocolV83() || /ablauf-supervisor-moderation\.html$/i.test(location.pathname))) targetFile = 'phase1-supervisor.html';
      next.href = (typeof linkWithState === 'function') ? linkWithState(targetFile) : targetFile;
      next.classList.add('disabled'); next.setAttribute('aria-disabled','true');
    }
    if(!box) return;
    const storageKey = (typeof key === 'function') ? key('flow_visible_moderation_v2_' + (role || profile)) : 'flow_visible_moderation_v2_' + (role || profile);
    let visible = Number(localStorage.getItem(storageKey) || '1');
    visible = Math.max(1, Math.min(steps.length, visible));
    function block(e){ if(visible < steps.length){ e.preventDefault(); } }
    function updateNext(){
      if(!next) return;
      const complete = visible >= steps.length;
      next.classList.toggle('disabled', !complete);
      next.setAttribute('aria-disabled', complete ? 'false' : 'true');
      next.textContent = complete ? 'Weiter: Mach dir Gedanken' : 'Weiter wird nach allen Kacheln aktiviert';
      next.onclick = complete ? null : block;
    }
    function render(){
      box.innerHTML = '';
      steps.slice(0, visible).forEach((step, idx) => {
        const read = idx < visible - 1 || visible >= steps.length;
        const card = document.createElement('article');
        card.className = 'card flow-step is-visible' + (read ? ' is-read' : '');
        card.innerHTML = `<div class="flow-step-head"><span class="step-badge">${idx+1}</span><h3>${esc(step[0])}</h3></div><p>${esc(step[1])}</p>${(!read && idx === visible-1) ? '<button type="button" class="secondary flow-read-btn">Gelesen</button>' : ''}`;
        const btn = card.querySelector('.flow-read-btn');
        if(btn) btn.addEventListener('click', () => { visible = Math.min(steps.length, visible + 1); localStorage.setItem(storageKey, String(visible)); render(); });
        box.appendChild(card);
      });
      updateNext();
    }
    render();
  };
  try { initFlow = window.initFlow; } catch(_) {}

  window.initPhase = function(){
    if(typeof initCommon === 'function') initCommon();
    const role = (typeof getPageRole === 'function') ? getPageRole() : document.body.dataset.role;
    const phase = (typeof getPhase === 'function') ? getPhase() : Number(document.body.dataset.phase || '0');
    if(typeof renderPhaseBar === 'function') renderPhaseBar(phase);
    const title = document.getElementById('phaseTitle');
    if(title) title.textContent = `Phase ${phase}: ${PHASE_NAMES[phase] || ''}`;
    const content = document.getElementById('phaseContent');
    if(!content) return;
    if(role === 'protokoll') content.innerHTML = protocolOnlyPhase(phase);
    else if(role === 'supervisor' && hasProtocol()) content.innerHTML = moderatorCard(phase);
    else if(role === 'supervisor') content.innerHTML = supervisorFullPhase(phase);
    else content.innerHTML = participantPhase(role, phase);
    if(typeof setupSaving === 'function') setupSaving();
    const next = document.getElementById('nextPhase');
    if(next){
      if(phase < 6){
        {
        let targetFile = `phase${phase+1}-${role}.html`;
        let url = (typeof linkWithState === 'function') ? linkWithState(targetFile) : targetFile;
        if(role === 'supervisor'){
          const mode = (typeof window.__svSupervisorHasProtocolV108 === 'function' && window.__svSupervisorHasProtocolV108()) ? 'moderation' : 'full';
          url += (url.indexOf('?')>=0?'&':'?') + 'supervisorMode=' + encodeURIComponent(mode) + '&members=' + (mode==='moderation'?'5':'4');
        }
        next.href = url;
      }
        next.textContent = `Bereit für Phase ${phase+1}`;
      } else {
        let target = 'abschluss.html';
        if(role === 'protokoll') target = 'zusammenfassung-protokoll.html';
        else if(role === 'supervisor' && !hasProtocol()) target = 'zusammenfassung.html';
        {
        let url = (typeof linkWithState === 'function') ? linkWithState(target) : target;
        if(role === 'supervisor'){
          const mode = (typeof window.__svSupervisorHasProtocolV108 === 'function' && window.__svSupervisorHasProtocolV108()) ? 'moderation' : 'full';
          url += (url.indexOf('?')>=0?'&':'?') + 'supervisorMode=' + encodeURIComponent(mode) + '&members=' + (mode==='moderation'?'5':'4');
        }
        next.href = url;
      }
        next.textContent = target.indexOf('zusammenfassung') >= 0 ? 'Ergebnisse zusammenfassen' : 'Abschluss';
      }
    }
  };
  try { initPhase = window.initPhase; } catch(_) {}
})();

/* ------------------------------------------------------------
   LAYOUT + PROTOKOLL-SIGNALE PATCH v3
   - Breite Phasenlayouts
   - Dezente Antwort-/Protokollmarker
   - Phase 2 nebeneinander: Moderation + Dokumentation
   ------------------------------------------------------------ */
(function(){
  const LABELS = {
    supervisor: 'Supervisor*in',
    schulleitung: 'Schulleitung',
    'lehrkraft-a': 'Lehrkraft A',
    'lehrkraft-b': 'Lehrkraft B',
    protokoll: 'Protokoll'
  };
  const PHASE_NAMES = {
    1: 'Erstkontakt',
    2: 'Problembeschreibung',
    3: 'Zielformulierung',
    4: 'Vertiefte Problembearbeitung',
    5: 'Ergebnissicherung',
    6: 'Reflexionstauglichkeit'
  };

  function esc(v){
    if (typeof escapeHtml === 'function') return escapeHtml(v);
    return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }
  function roleClass(role){ return 'role-' + String(role || '').replace(/[^a-z0-9-]/g,''); }
  function getAssignments(){ try { return (typeof loadObj === 'function') ? loadObj('assignments', {}) : {}; } catch(_) { return {}; } }
  function hasProtocol(){ return !!window.__svSupervisorHasProtocolCleanV119(); }
  function loadSafe(k){ try { return (typeof loadText === 'function') ? loadText(k) : ''; } catch(_) { return ''; } }
  function miniSummary(){ return (typeof miniSummaryHtml === 'function') ? miniSummaryHtml() : ''; }

  function marker(wait, protocol){
    const tags = [];
    if (protocol) tags.push('<span class="signal-badge signal-protocol" title="Diese Antwort protokollieren">Protokoll</span>');
    if (wait) tags.push('<span class="signal-badge signal-wait" title="Antwort abwarten">Antwort</span>');
    return tags.length ? `<span class="script-tags">${tags.join('')}</span>` : '';
  }
  function scriptBlock(items){
    return `<div class="moderation-script moderation-script-v3">${items.map(item => {
      if (typeof item === 'string') item = { text: item };
      return `<div class="script-step-v3"><p>${esc(item.text)}</p>${marker(item.wait, item.protocol)}</div>`;
    }).join('')}</div>`;
  }
  function protocolCheckLine(){
    return hasProtocol()
      ? '„Protokollführung: Ist bis hierhin alles so notiert, dass wir zur nächsten Phase gehen können?“'
      : '„Ich prüfe kurz meine Notizen. Ist aus Ihrer Sicht noch etwas Wesentliches offen, bevor wir zur nächsten Phase gehen?“';
  }
  function reqNote(label, saveKey, hint){
    return `<div class="required-field-box"><div class="required-label">Pflichtfeld!</div><label>${esc(label)}</label>${hint?`<p class="small">${esc(hint)}</p>`:''}<textarea data-save="${esc(saveKey)}"></textarea></div>`;
  }

  function moderatorCard(phase){
    const cards = {
      1: {
        title: 'Erstkontakt',
        aim: 'Gespräch eröffnen, Bereitschaft klären und einen verbindlichen Gesprächsrahmen vereinbaren.',
        lines: [
          { text: '„Willkommen. Ich freue mich, dass Sie alle da sind. Wir nutzen diese Supervision, um den Konflikt im Teamteaching geordnet zu klären.“' },
          { text: '„Die Schulleitung hat mich hinzugezogen, weil die Uneinigkeit im Teamteaching die Zusammenarbeit belastet und die Klasse dadurch zu wenig Stabilität erlebt.“' },
          { text: '„Mir ist wichtig: Es geht nicht um Schuldzuweisung. Es geht darum, Beobachtungen, Gefühle, Wünsche und Ziele so zu sortieren, dass eine gemeinsame Vereinbarung möglich wird.“' },
          { text: '„Sind alle bereit, an dieser Klärung mitzuwirken und die Perspektiven der anderen zunächst anzuhören?“', wait: true },
          { text: '„Ich möchte jetzt mit Ihnen einen Gesprächsrahmen vereinbaren. Was brauchen Sie, damit dieses Gespräch respektvoll und hilfreich verlaufen kann?“', wait: true, protocol: true },
          { text: '„Beispiele können sein: ausreden lassen, Ich-Aussagen, konkrete Beobachtungen, keine persönlichen Angriffe und keine vorschnellen Bewertungen.“', protocol: true },
          { text: protocolCheckLine(), wait: true, protocol: true }
        ]
      },
      2: {
        title: 'Problembeschreibung',
        aim: 'Die Situation aus drei Perspektiven verstehen: Beobachtung oder Problem, Gefühle und Wünsche.',
        lines: [
          { text: '„Ich würde zunächst die Schulleitung bitten: Welche Beobachtung haben Sie zur Situation im Teamteaching gemacht?“', wait: true, protocol: true },
          { text: '„Welche Gefühle oder Sorgen löst diese Situation bei Ihnen aus?“', wait: true, protocol: true },
          { text: '„Welche Wünsche haben Sie an das Teamteaching und an die Zusammenarbeit der Lehrkräfte?“', wait: true, protocol: true },
          { text: '„Lehrkraft A, wie erleben Sie die Situation? Was ist aus Ihrer Sicht das zentrale Problem?“', wait: true, protocol: true },
          { text: '„Welche Gefühle sind damit verbunden, und was wünschen Sie sich konkret?“', wait: true, protocol: true },
          { text: '„Lehrkraft B, wie erleben Sie die Situation? Was ist aus Ihrer Sicht das zentrale Problem?“', wait: true, protocol: true },
          { text: '„Welche Gefühle sind damit verbunden, und was wünschen Sie sich konkret?“', wait: true, protocol: true },
          { text: '„Gibt es noch eine sachliche Ergänzung zur Problembeschreibung, ohne die andere Perspektive zu bewerten?“', wait: true },
          { text: protocolCheckLine(), wait: true, protocol: true }
        ]
      },
      3: {
        title: 'Zielformulierung',
        aim: 'Einzelziele sichtbar machen und daraus eine gemeinsame Zielvereinbarung entwickeln.',
        lines: [
          { text: '„Wir gehen jetzt von der Problembeschreibung zur Zielformulierung. Bitte formulieren Sie möglichst konkret, was nach dieser Klärung anders sein soll.“' },
          { text: '„Schulleitung: Welches Ziel verfolgen Sie mit Blick auf Stabilität für die Klasse und die Zusammenarbeit im Team?“', wait: true, protocol: true },
          { text: '„Lehrkraft A: Welches Ziel wäre aus Ihrer Perspektive wichtig, damit Sie im Teamteaching handlungsfähig bleiben?“', wait: true, protocol: true },
          { text: '„Lehrkraft B: Welches Ziel wäre aus Ihrer Perspektive wichtig, damit Veränderung und Zusammenarbeit möglich werden?“', wait: true, protocol: true },
          { text: '„Welche Gemeinsamkeiten sehen Sie in diesen Zielen?“', wait: true, protocol: true },
          { text: '„Lassen Sie uns daraus eine gemeinsame Zielvereinbarung formulieren. Sie sollte kurz, konkret und für alle tragbar sein.“', wait: true, protocol: true },
          { text: '„Ich lese die Formulierung einmal vor. Passt sie für alle als Arbeitsgrundlage?“', wait: true, protocol: true },
          { text: protocolCheckLine(), wait: true, protocol: true }
        ]
      },
      4: {
        title: 'Vertiefte Problembearbeitung',
        aim: 'Hilfreiche Kritik, Anerkennung und konkrete Absprachen entwickeln.',
        lines: [
          { text: '„Wir schauen jetzt darauf, wie Kritik im Teamteaching künftig hilfreicher geäußert werden kann.“' },
          { text: '„Wie würden Sie sich in Zukunft wünschen, dass Kritik angesprochen wird?“', wait: true, protocol: true },
          { text: '„Welche Regeln wären dafür hilfreich: unter vier Augen, konkret, zeitnah, Ich-Botschaft, Bezug auf eine Situation statt auf die Person?“', wait: true, protocol: true },
          { text: '„Ich leite jetzt eine kurze Übung zur Stärkung der Teamfähigkeit an. Jede Paarung sagt sich gegenseitig, was sie an der Perspektive des Gegenübers nachvollziehbar oder hilfreich findet.“' },
          { text: '„Zuerst: Schulleitung und Lehrkraft A. Was finden Sie an der Perspektive der jeweils anderen Person nachvollziehbar?“', wait: true, protocol: true },
          { text: '„Jetzt: Lehrkraft A und Lehrkraft B. Was können Sie an der Perspektive der anderen Person anerkennen?“', wait: true, protocol: true },
          { text: '„Jetzt: Schulleitung und Lehrkraft B. Was ist an der jeweiligen Perspektive nachvollziehbar oder hilfreich?“', wait: true, protocol: true },
          { text: '„Zum Schluss dieser Phase: Was soll sich ab morgen konkret ändern? Welche Absprache hilft dem Team im nächsten Unterricht?“', wait: true, protocol: true },
          { text: protocolCheckLine(), wait: true, protocol: true }
        ]
      },
      5: {
        title: 'Ergebnissicherung',
        aim: 'Zentrale Punkte zusammenfassen, Zielvereinbarung prüfen und Zustimmung sichern.',
        lines: hasProtocol() ? [
          { text: '„Wir sichern jetzt die Ergebnisse. Protokollführung, bitte fassen Sie noch einmal die geäußerten Probleme, Gefühle, Wünsche, Ziele und Absprachen zusammen.“', wait: true, protocol: true },
          { text: '„Bitte lesen Sie anschließend die gemeinsame Zielvereinbarung vor.“', wait: true, protocol: true },
          { text: '„Gibt es konkrete Korrekturen oder Ergänzungen?“', wait: true, protocol: true },
          { text: '„Können alle diese Vereinbarung mittragen?“', wait: true, protocol: true },
          { text: '„Gibt es offene Rückmeldungen oder offene Punkte, die noch ergänzt werden sollen?“', wait: true, protocol: true },
          { text: '„Protokollführung: Bitte setzen Sie die Zustimmung entsprechend und ergänzen Sie offene Rückmeldungen.“', wait: true, protocol: true }
        ] : [
          { text: '„Ich fasse die zentralen Punkte zusammen: Probleme, Gefühle, Wünsche, Ziele und Absprachen.“', wait: true, protocol: true },
          { text: '„Die gemeinsame Zielvereinbarung lautet …“', wait: true, protocol: true },
          { text: '„Gibt es konkrete Korrekturen oder Ergänzungen?“', wait: true, protocol: true },
          { text: '„Können alle diese Vereinbarung mittragen?“', wait: true, protocol: true },
          { text: '„Gibt es offene Rückmeldungen oder offene Punkte, die noch ergänzt werden sollen?“', wait: true, protocol: true }
        ]
      },
      6: {
        title: 'Reflexionstauglichkeit',
        aim: 'Mit der Schulleitung prüfen, ob die Vereinbarung im Schulalltag tragfähig ist.',
        lines: [
          { text: '„Das Folgende richtet sich jetzt vor allem an die Schulleitung.“' },
          { text: '„Wie schätzen Sie ein, dass die heute besprochenen Punkte und Ziele im Schulalltag wirklich umgesetzt werden können?“', wait: true, protocol: true },
          { text: '„Welche Unterstützungsmöglichkeiten sehen Sie bei sich selbst oder durch die Schule?“', wait: true, protocol: true },
          { text: '„Was werden Sie konkret unternehmen, um ein harmonischeres Miteinander im Teamteaching zu fördern?“', wait: true, protocol: true },
          { text: protocolCheckLine(), wait: true, protocol: true }
        ]
      }
    };
    const c = cards[phase] || cards[1];
    const note = hasProtocol()
      ? '<div class="handoff-note"><strong>Hinweis:</strong> Rote Markierungen zeigen, welche Antworten für das Protokoll wichtig sind. Gelbe Markierungen zeigen, wann bewusst auf eine Antwort gewartet werden soll.</div>'
      : '<div class="handoff-note"><strong>Hinweis:</strong> Rote Markierungen zeigen, was du dokumentieren musst. Gelbe Markierungen zeigen, wann du bewusst auf eine Antwort wartest.</div>';
    return `<section class="card highlight moderation-only-card equal-fill-card"><h2>Moderationskarte: ${esc(c.title)}</h2><p><strong>Ziel:</strong> ${esc(c.aim)}</p>${scriptBlock(c.lines)}${note}</section>`;
  }

  function protocolFields(phase){
    if(phase === 1) return `<section class="card protocol-overview-card equal-fill-card"><h2>Dokumentation: Gesprächsrahmen</h2><p class="small">Notiere, welche Gesprächsregeln vereinbart wurden und ob die Beteiligten zur Klärung bereit sind.</p>${reqNote('Gesprächsrahmen / Regeln / Bereitschaft','sup_p1_rahmen','Zum Beispiel: ausreden lassen, Ich-Aussagen, respektvoll bleiben, konkrete Beobachtungen nennen.')}</section>`;
    if(phase === 2) return `<section class="card protocol-overview-card phase2-protocol-section"><div class="phase2-doc-head"><h2>Phase 2: Problembeschreibung</h2><div class="phase-task-card"><h3>Deine Aufgabe in Phase 2</h3><p>Trenne die Aussagen nach Rolle und Kategorie. Halte nur fest, was gesagt wurde: Problem oder Beobachtung, Gefühle und Wünsche.</p></div></div><div class="phase2-doc-grid"><div class="role-note-block"><h3>Schulleitung</h3>${reqNote('Problem / Beobachtung','sup_p2_sl_probleme')}${reqNote('Gefühle','sup_p2_sl_gefuehle')}${reqNote('Wünsche','sup_p2_sl_wuensche')}</div><div class="role-note-block"><h3>Lehrkraft A</h3>${reqNote('Problem / Perspektive','sup_p2_a_probleme')}${reqNote('Gefühle','sup_p2_a_gefuehle')}${reqNote('Wünsche','sup_p2_a_wuensche')}</div><div class="role-note-block"><h3>Lehrkraft B</h3>${reqNote('Problem / Perspektive','sup_p2_b_probleme')}${reqNote('Gefühle','sup_p2_b_gefuehle')}${reqNote('Wünsche','sup_p2_b_wuensche')}</div></div></section>`;
    if(phase === 3) return `<section class="card protocol-overview-card equal-fill-card"><h2>Dokumentation: Ziele</h2><p class="small">Notiere erst die Einzelziele und danach die Gemeinsamkeiten und die gemeinsame Zielvereinbarung.</p>${reqNote('Ziel Schulleitung','sup_p3_ziel_sl')}${reqNote('Ziel Lehrkraft A','sup_p3_ziel_a')}${reqNote('Ziel Lehrkraft B','sup_p3_ziel_b')}${reqNote('Gemeinsamkeiten','sup_p3_gemeinsamkeiten')}${reqNote('Gemeinsame Zielformulierung','sup_p3_gemeinsames_ziel')}</section>`;
    if(phase === 4) return `<section class="card protocol-overview-card equal-fill-card"><h2>Dokumentation: Vertiefte Problembearbeitung</h2><p class="small">Halte fest, wie Kritik künftig hilfreich geäußert werden soll und welche konkreten Absprachen entstehen.</p>${reqNote('Kriterien für hilfreiche Kritik','sup_p4_kritik')}<div class="perspective-table-entry"><div class="three-col">${reqNote('Positive Rückmeldung zur Schulleitung','sup_p4_pos_sl')}${reqNote('Positive Rückmeldung zu Lehrkraft A','sup_p4_pos_a')}${reqNote('Positive Rückmeldung zu Lehrkraft B','sup_p4_pos_b')}</div></div>${reqNote('Absprachen zum weiteren Vorgehen','sup_p4_absprachen')}</section>`;
    if(phase === 5) return `<section class="card protocol-overview-card equal-fill-card"><h2>Dokumentation: Ergebnissicherung</h2><p class="small">Fasse die Ergebnisse für die Gruppe zusammen. Trage Zustimmung und offene Punkte ein.</p><div class="summary-block"><strong>Zwischenergebnisse</strong><br>${miniSummary()}</div><label>Zustimmung erfolgt?</label><select class="standard-required" data-save="sup_p5_zustimmung_status"><option value="">Bitte auswählen</option><option value="Alle stimmen zu">Alle stimmen zu</option><option value="Teilweise Zustimmung / offene Punkte">Teilweise Zustimmung / offene Punkte</option><option value="Keine Zustimmung">Keine Zustimmung</option></select>${reqNote('Rückmeldungen / Zustimmung / offene Punkte','sup_p5_zustimmung')}</section>`;
    if(phase === 6) return `<section class="card protocol-overview-card equal-fill-card"><h2>Dokumentation: Praxistauglichkeit</h2><p class="small">Dokumentiere die Einschätzung der Schulleitung und die nächsten konkreten Schritte.</p>${reqNote('Einschätzung der Praxistauglichkeit','sup_p6_praxistauglichkeit')}${reqNote('Unterstützung durch Schulleitung','sup_p6_unterstuetzung')}${reqNote('Erste konkrete Umsetzungsschritte','sup_p6_umsetzung')}</section>`;
    return '';
  }

  function supervisorFullPhase(phase){
    if(phase === 2) return `<div class="phase2-workbench">${moderatorCard(phase)}${protocolFields(phase)}</div>`;
    return `<div class="phase-layout-wide">${moderatorCard(phase)}${protocolFields(phase)}</div>`;
  }
  function protocolOnlyPhase(phase){
    if(phase === 2) return `<div class="phase2-workbench"><section class="card highlight protokoll-note-card"><p class="role-pill role-protokoll">Protokoll</p><h2>Deine Aufgabe in Phase 2</h2><p>Höre genau zu und fülle die Dokumentationsfelder. Orientiere dich an den roten Protokollmarkierungen der Moderationsfragen.</p></section>${protocolFields(phase)}</div>`;
    return `<div class="phase-layout-wide"><section class="card highlight protokoll-note-card"><p class="role-pill role-protokoll">Protokoll</p><h2>Deine Aufgabe in Phase ${phase}</h2><p>Höre genau zu und fülle die Dokumentationsfelder. Du moderierst nicht. Bitte bei unklaren Aussagen kurz um Wiederholung oder eine Zusammenfassung.</p></section>${protocolFields(phase)}</div>`;
  }
  function prepItems(role){
    const map = {
      schulleitung: [
        ['Beobachtung', 'prep_schulleitung_beobachtung'],
        ['Gefühle', 'prep_schulleitung_gefuehle'],
        ['Wünsche', 'prep_schulleitung_wuensche'],
        ['Ziel der Supervision', 'prep_schulleitung_ziel']
      ],
      'lehrkraft-a': [
        ['Perspektive', 'prep_lehrkraft-a_perspektive'],
        ['Gefühle', 'prep_lehrkraft-a_gefuehle'],
        ['Wünsche', 'prep_lehrkraft-a_wuensche'],
        ['Zielgedanken', 'prep_lehrkraft-a_ziele']
      ],
      'lehrkraft-b': [
        ['Perspektive', 'prep_lehrkraft-b_perspektive'],
        ['Gefühle', 'prep_lehrkraft-b_gefuehle'],
        ['Wünsche', 'prep_lehrkraft-b_wuensche'],
        ['Zielgedanken', 'prep_lehrkraft-b_ziele']
      ]
    };
    return (map[role] || []).map(([label,k]) => ({label, value: loadSafe(k)}));
  }
  function prepCard(role, title){
    const items = prepItems(role);
    if(!items.length) return '';
    return `<section class="card prep-reference-card"><h2>${esc(title || 'Deine vorbereiteten Notizen')}</h2>${items.map(i => `<h3>${esc(i.label)}</h3><div class="readonly-box">${esc(i.value || 'Noch keine Notiz gespeichert.')}</div>`).join('')}</section>`;
  }
  function participantPhase(role, phase){
    const label = LABELS[role] || role;
    if(phase===1) return `<section class="card highlight"><p class="role-pill ${roleClass(role)}">${esc(label)}</p><h2>Gesprächsstart</h2><p>Höre der Supervisor*in zu. Achte auf den vereinbarten Gesprächsrahmen und darauf, ob du bereit bist, deine Perspektive einzubringen.</p></section>${prepCard(role,'Deine vorbereiteten Gedanken')}`;
    if(phase===2) return `<section class="card highlight"><p class="role-pill ${roleClass(role)}">${esc(label)}</p><h2>Problembeschreibung</h2><p>Wenn du das Wort bekommst, nutze deine vorbereiteten Notizen: Perspektive oder Beobachtung, Gefühle und Wünsche. Sprich konkret und ohne Vorwurf.</p></section>${prepCard(role,'Notizen für deine Wortmeldung')}`;
    if(phase===3) return `<section class="card highlight"><p class="role-pill ${roleClass(role)}">${esc(label)}</p><h2>Zielformulierung</h2><p>Nutze deine vorbereiteten Zielgedanken aus der Überlegungsphase. Im Gespräch arbeitest du mit der Gruppe an einer gemeinsamen Zielvereinbarung.</p><p class="notice">Du musst hier keine neue individuelle Zielformulierung mehr eintragen.</p></section>${prepCard(role,'Vorbereitete Ziele und Wünsche')}`;
    if(phase===4) return `<section class="card highlight"><p class="role-pill ${roleClass(role)}">${esc(label)}</p><h2>Vertiefte Problembearbeitung</h2><p>Beteilige dich am Gespräch über hilfreiche Kritik. In der kurzen Übung sagst du, was du an der Perspektive einer anderen Person nachvollziehen kannst.</p></section>${prepCard(role,'Wünsche und Ziele als Orientierung')}`;
    if(phase===5) return `<section class="card highlight"><p class="role-pill ${roleClass(role)}">${esc(label)}</p><h2>Ergebnissicherung</h2><p>Höre die Zusammenfassung. Prüfe, ob deine Perspektive, Gefühle, Wünsche und Ziele korrekt aufgenommen wurden. Sage klar, ob du die Vereinbarung mittragen kannst.</p></section>${prepCard(role,'Deine Notizen zum Abgleichen')}`;
    if(phase===6 && role==='schulleitung') return `<section class="card highlight"><p class="role-pill role-schulleitung">Schulleitung</p><h2>Praxistauglichkeit prüfen</h2><p>Prüfe mit der Supervisor*in, ob die Vereinbarung im Schulalltag realistisch ist. Benenne Unterstützungsmöglichkeiten und erste konkrete Umsetzungsschritte.</p></section>${prepCard(role,'Vorbereitete Unterstützungsideen')}`;
    if(phase===6) return `<section class="card highlight"><p class="role-pill ${roleClass(role)}">${esc(label)}</p><h2>Abschluss</h2><p>Die Praxistauglichkeit wird vor allem mit der Schulleitung geprüft. Überlege, welchen ersten Schritt du selbst nach der Supervision gehen kannst.</p></section>${prepCard(role,'Deine wichtigsten Punkte')}`;
    return '';
  }

  window.initPhase = function(){
    if(typeof initCommon === 'function') initCommon();
    const role = (typeof getPageRole === 'function') ? getPageRole() : document.body.dataset.role;
    const phase = (typeof getPhase === 'function') ? getPhase() : Number(document.body.dataset.phase || '0');
    if(typeof renderPhaseBar === 'function') renderPhaseBar(phase);
    const title = document.getElementById('phaseTitle');
    if(title) title.textContent = `Phase ${phase}: ${PHASE_NAMES[phase] || ''}`;
    const content = document.getElementById('phaseContent');
    if(!content) return;
    if(role === 'protokoll') content.innerHTML = protocolOnlyPhase(phase);
    else if(role === 'supervisor' && hasProtocol()) content.innerHTML = moderatorCard(phase);
    else if(role === 'supervisor') content.innerHTML = supervisorFullPhase(phase);
    else content.innerHTML = participantPhase(role, phase);
    if(typeof setupSaving === 'function') setupSaving();
    const next = document.getElementById('nextPhase');
    if(next){
      if(phase < 6){
        {
        let targetFile = `phase${phase+1}-${role}.html`;
        let url = (typeof linkWithState === 'function') ? linkWithState(targetFile) : targetFile;
        if(role === 'supervisor'){
          const mode = (typeof window.__svSupervisorHasProtocolV108 === 'function' && window.__svSupervisorHasProtocolV108()) ? 'moderation' : 'full';
          url += (url.indexOf('?')>=0?'&':'?') + 'supervisorMode=' + encodeURIComponent(mode) + '&members=' + (mode==='moderation'?'5':'4');
        }
        next.href = url;
      }
        next.textContent = `Bereit für Phase ${phase+1}`;
      } else {
        let target = 'abschluss.html';
        if(role === 'protokoll') target = 'zusammenfassung-protokoll.html';
        else if(role === 'supervisor' && !hasProtocol()) target = 'zusammenfassung.html';
        {
        let url = (typeof linkWithState === 'function') ? linkWithState(target) : target;
        if(role === 'supervisor'){
          const mode = (typeof window.__svSupervisorHasProtocolV108 === 'function' && window.__svSupervisorHasProtocolV108()) ? 'moderation' : 'full';
          url += (url.indexOf('?')>=0?'&':'?') + 'supervisorMode=' + encodeURIComponent(mode) + '&members=' + (mode==='moderation'?'5':'4');
        }
        next.href = url;
      }
        next.textContent = target.indexOf('zusammenfassung') >= 0 ? 'Ergebnisse zusammenfassen' : 'Abschluss';
      }
    }
  };
  try { initPhase = window.initPhase; } catch(_) {}
})();


/* ------------------------------------------------------------
   v83 Rollen-/Phasenlogik: 4er/5er Supervisor, Notizsichtbarkeit, Rollenname zuerst
   ------------------------------------------------------------ */
(function(){
  const LABELS_V83 = {
    supervisor:'Supervisor*in',
    schulleitung:'Schulleitung',
    'lehrkraft-a':'Lehrkraft A',
    'lehrkraft-b':'Lehrkraft B',
    protokoll:'Protokoll'
  };
  function escV83(v){
    if(typeof escapeHtml==='function') return escapeHtml(v);
    return String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }
  function roleClassV83(role){return 'role-' + String(role||'').replace(/[^a-z0-9-]/g,'');}
  function loadV83(k){try{return (typeof loadText==='function')?loadText(k):'';}catch(_){return '';}}
  function namesMapV83(){try{return JSON.parse(localStorage.getItem('sv_role_names_v58')||'{}')||{};}catch(_){return {};}}
  function assignmentsV83(){try{return (typeof loadObj==='function')?loadObj('assignments',{}):{};}catch(_){return {};}}
  function hasProtocolV83(){const a=assignmentsV83();const n=namesMapV83();return !!((a&&a.protokoll)||(n&&n.protokoll));}
  function rolePersonV83(role){const a=assignmentsV83(); const n=namesMapV83(); return a && a[role] ? String(a[role]) : (n&&n[role]?String(n[role]):'');}
  function roleDisplayV83(role){const label=LABELS_V83[role]||role; const name=rolePersonV83(role); return name ? `${label} (${name})` : label;}
  function reqV83(label,key,hint){return `<div class="required-field-box"><div class="required-label">Pflichtfeld!</div><label>${escV83(label)}</label>${hint?`<p class="small">${escV83(hint)}</p>`:''}<textarea data-save="${escV83(key)}"></textarea></div>`;}
  function readonlyV83(label,value){return `<div class="note-ref"><h3>${escV83(label)}</h3><div class="readonly-box">${escV83(value||'Noch keine Notiz gespeichert.')}</div></div>`;}
  function miniV83(){return (typeof miniSummaryHtml==='function')?miniSummaryHtml():'';}
  function prepMapV83(role){
    const base = {
      schulleitung:[
        ['Beobachtung', 'prep_schulleitung_beobachtung'],
        ['Gefühle', 'prep_schulleitung_gefuehle'],
        ['Wünsche', 'prep_schulleitung_wuensche'],
        ['Ziel der Supervision', 'prep_schulleitung_ziel']
      ],
      'lehrkraft-a':[
        ['Beobachtung / Perspektive', 'prep_lehrkraft-a_perspektive'],
        ['Gefühle', 'prep_lehrkraft-a_gefuehle'],
        ['Wünsche', 'prep_lehrkraft-a_wuensche'],
        ['Lösungsideen / Zielgedanken', 'prep_lehrkraft-a_ziele']
      ],
      'lehrkraft-b':[
        ['Beobachtung / Perspektive', 'prep_lehrkraft-b_perspektive'],
        ['Gefühle', 'prep_lehrkraft-b_gefuehle'],
        ['Wünsche', 'prep_lehrkraft-b_wuensche'],
        ['Lösungsideen / Zielgedanken', 'prep_lehrkraft-b_ziele']
      ]
    };
    return base[role]||[];
  }
  function prepCardV83(role, phase){
    const items=prepMapV83(role);
    if(!items.length) return '';
    let filtered=[];
    let title='Deine Notizen';
    if(phase===2){ filtered=items.slice(0,3); title='Notizen für Beobachtung, Gefühle und Wünsche'; }
    else if(phase===3){ filtered=items.slice(3); title=(role==='schulleitung'?'Gedanken zum Ziel der Supervision':'Deine Zielgedanken'); }
    else if(phase===4){ return ''; }
    else if(phase===5){ filtered=items; title='Alle Notizen zum Abgleichen'; }
    else if(phase===6){ filtered=(role==='schulleitung'?items.slice(3):items.slice(3)); title='Ziel als Orientierung'; }
    else { return ''; }
    return `<section class="card prep-reference-card"><h2>${escV83(title)}</h2>${filtered.map(([label,k])=>readonlyV83(label,loadV83(k))).join('')}</section>`;
  }
  function participantPhaseV83(role,phase){
    const label=roleDisplayV83(role);
    const pill=`<p class="role-pill ${roleClassV83(role)}">${escV83(label)}</p>`;
    if(phase===1) return `<section class="card highlight">${pill}<h2>Gesprächsstart</h2><p>Höre der Supervisor*in zu. Achte auf Gesprächsrahmen, Regeln und darauf, ob du bereit bist, deine Perspektive später einzubringen.</p></section>`;
    if(phase===2) return `<section class="card highlight">${pill}<h2>Problembeschreibung</h2><p>Wenn du das Wort bekommst, sprich zu Beobachtung oder Problem, Gefühlen und Wünschen. Bleibe konkret und vermeide Vorwürfe.</p></section>${prepCardV83(role,2)}`;
    if(phase===3) return `<section class="card highlight">${pill}<h2>Zielformulierung</h2><p>Nutze deine vorbereiteten Zielgedanken. Arbeite mit der Gruppe an einer gemeinsamen Zielvereinbarung.</p><p class="notice">Du musst hier keine neue individuelle Zielformulierung eintragen.</p></section>${prepCardV83(role,3)}`;
    if(phase===4) return `<section class="card highlight">${pill}<h2>Vertiefte Problembearbeitung</h2><p>Beteilige dich am Gespräch über hilfreiche Kritik und konkrete Absprachen. Für deine Rolle werden in dieser Phase keine vorbereiteten Notizen angezeigt.</p></section>`;
    if(phase===5) return `<section class="card highlight">${pill}<h2>Ergebnissicherung</h2><p>Prüfe, ob Beobachtungen, Gefühle, Wünsche und Ziele korrekt aufgenommen wurden. Sage klar, ob du die Vereinbarung mittragen kannst.</p></section>${prepCardV83(role,5)}`;
    if(phase===6 && role==='schulleitung') return `<section class="card highlight">${pill}<h2>Praxistauglichkeit prüfen</h2><p>Prüfe, ob die Vereinbarung im Schulalltag realistisch ist. Benenne Unterstützungsmöglichkeiten und erste konkrete Umsetzungsschritte.</p></section>${prepCardV83(role,6)}`;
    if(phase===6) return `<section class="card highlight">${pill}<h2>Abschluss</h2><p>Die Praxistauglichkeit wird vor allem mit der Schulleitung geprüft. Höre zu und überlege, welchen ersten Schritt du selbst nach der Supervision gehen kannst.</p></section>${prepCardV83(role,6)}`;
    return '';
  }
  function reqNoteV83(label, saveKey, hint){ return reqV83(label,saveKey,hint); }
  function protocolFieldsV83(phase){
    const sl=roleDisplayV83('schulleitung'), a=roleDisplayV83('lehrkraft-a'), b=roleDisplayV83('lehrkraft-b');
    if(phase===1) return `<section class="card protocol-overview-card equal-fill-card"><h2>Dokumentation: Gesprächsrahmen</h2><p class="small">Notiere Gesprächsregeln und Bereitschaft der Beteiligten.</p>${reqNoteV83('Gesprächsrahmen / Regeln / Bereitschaft','sup_p1_rahmen','Zum Beispiel: ausreden lassen, Ich-Aussagen, respektvoll bleiben, konkrete Beobachtungen nennen.')}</section>`;
    if(phase===2) return `<section class="card protocol-overview-card phase2-protocol-section equal-fill-card"><div class="phase2-title-row"><h2>Phase 2: Problembeschreibung</h2><div class="phase-task-card"><h3>Deine Aufgabe in Phase 2</h3><p>Trenne Aussagen nach Rolle und Kategorie: Beobachtung oder Problem, Gefühle und Wünsche.</p></div></div><div class="phase2-doc-grid"><div class="role-note-block"><h3>${escV83(sl)}</h3>${reqNoteV83('Problem / Beobachtung','sup_p2_sl_probleme')}${reqNoteV83('Gefühle','sup_p2_sl_gefuehle')}${reqNoteV83('Wünsche','sup_p2_sl_wuensche')}</div><div class="role-note-block"><h3>${escV83(a)}</h3>${reqNoteV83('Problem / Perspektive','sup_p2_a_probleme')}${reqNoteV83('Gefühle','sup_p2_a_gefuehle')}${reqNoteV83('Wünsche','sup_p2_a_wuensche')}</div><div class="role-note-block"><h3>${escV83(b)}</h3>${reqNoteV83('Problem / Perspektive','sup_p2_b_probleme')}${reqNoteV83('Gefühle','sup_p2_b_gefuehle')}${reqNoteV83('Wünsche','sup_p2_b_wuensche')}</div></div></section>`;
    if(phase===3) return `<section class="card protocol-overview-card equal-fill-card"><h2>Dokumentation: Ziele</h2><p class="small">Notiere Einzelziele, Gemeinsamkeiten und die gemeinsame Zielvereinbarung.</p>${reqNoteV83('Ziel Schulleitung','sup_p3_ziel_sl')}${reqNoteV83('Ziel Lehrkraft A','sup_p3_ziel_a')}${reqNoteV83('Ziel Lehrkraft B','sup_p3_ziel_b')}${reqNoteV83('Gemeinsamkeiten','sup_p3_gemeinsamkeiten')}${reqNoteV83('Gemeinsame Zielformulierung','sup_p3_gemeinsames_ziel')}</section>`;
    if(phase===4) return `<section class="card protocol-overview-card equal-fill-card"><h2>Dokumentation: Vertiefte Problembearbeitung</h2><p class="small">Halte hilfreiche Kritik, positive Rückmeldungen und Absprachen fest.</p>${reqNoteV83('Kriterien für hilfreiche Kritik','sup_p4_kritik')}<div class="three-col">${reqNoteV83('Positive Rückmeldung zur Schulleitung','sup_p4_pos_sl')}${reqNoteV83('Positive Rückmeldung zu Lehrkraft A','sup_p4_pos_a')}${reqNoteV83('Positive Rückmeldung zu Lehrkraft B','sup_p4_pos_b')}</div>${reqNoteV83('Absprachen zum weiteren Vorgehen','sup_p4_absprachen')}</section>`;
    if(phase===5) return `<section class="card protocol-overview-card equal-fill-card"><h2>Dokumentation: Ergebnissicherung</h2><p class="small">Fasse Ergebnisse, Zustimmung und offene Punkte zusammen.</p><div class="summary-block"><strong>Zwischenergebnisse</strong><br>${miniV83()}</div><label>Zustimmung erfolgt?</label><select class="standard-required" data-save="sup_p5_zustimmung_status"><option value="">Bitte auswählen</option><option value="Alle stimmen zu">Alle stimmen zu</option><option value="Teilweise Zustimmung / offene Punkte">Teilweise Zustimmung / offene Punkte</option><option value="Keine Zustimmung">Keine Zustimmung</option></select>${reqNoteV83('Rückmeldungen / Zustimmung / offene Punkte','sup_p5_zustimmung')}</section>`;
    if(phase===6) return `<section class="card protocol-overview-card equal-fill-card"><h2>Dokumentation: Praxistauglichkeit</h2>${reqNoteV83('Einschätzung der Praxistauglichkeit','sup_p6_praxistauglichkeit')}${reqNoteV83('Unterstützung durch Schulleitung','sup_p6_unterstuetzung')}${reqNoteV83('Erste konkrete Umsetzungsschritte','sup_p6_umsetzung')}</section>`;
    return '';
  }
  function fallbackModeratorV83(phase){
    if(typeof moderatorCard==='function'){
      try{return moderatorCard(phase).replace(/<section class="card highlight moderation-only-card"/,'<section class="card highlight moderation-only-card equal-fill-card"');}catch(_){}
    }
    return `<section class="card highlight moderation-only-card equal-fill-card"><h2>Moderationskarte Phase ${phase}</h2><p>Leite die Phase anhand der vorbereiteten Fragen.</p></section>`;
  }
  function supervisorFullV83(phase){
    if(phase===2) return `<div class="phase-layout-stacked equal-phase-layout">${fallbackModeratorV83(phase)}${protocolFieldsV83(phase)}</div>`;
    return `<div class="two-col equal-phase-layout">${fallbackModeratorV83(phase)}${protocolFieldsV83(phase)}</div>`;
  }
  function protocolOnlyV83(phase){
    return `<div class="phase-layout-stacked equal-phase-layout"><section class="card highlight protokoll-note-card equal-fill-card"><p class="role-pill role-protokoll">${escV83(roleDisplayV83('protokoll'))}</p><h2>Deine Aufgabe in Phase ${phase}</h2><p>Höre genau zu und fülle die Dokumentationsfelder. Du moderierst nicht. Bitte bei unklaren Aussagen kurz um Wiederholung oder Zusammenfassung.</p></section>${protocolFieldsV83(phase)}</div>`;
  }

  const oldInitPhaseV83 = window.initPhase;
  window.initPhase=function(){
    if(typeof initCommon==='function') initCommon();
    const role=(typeof getPageRole==='function')?getPageRole():document.body.dataset.role;
    const phase=(typeof getPhase==='function')?getPhase():Number(document.body.dataset.phase||'0');
    if(typeof renderPhaseBar==='function') renderPhaseBar(phase);
    const title=document.getElementById('phaseTitle');
    if(title) title.textContent=`Phase ${phase}: ${({1:'Erstkontakt',2:'Problembeschreibung',3:'Zielformulierung',4:'Vertiefte Problembearbeitung',5:'Ergebnissicherung',6:'Reflexionstauglichkeit'}[phase]||'')}`;
    const content=document.getElementById('phaseContent');
    if(!content) return;
    if(role==='protokoll') content.innerHTML=protocolOnlyV83(phase);
    else if(role==='supervisor' && hasProtocolV83()) content.innerHTML=fallbackModeratorV83(phase);
    else if(role==='supervisor') content.innerHTML=supervisorFullV83(phase);
    else content.innerHTML=participantPhaseV83(role,phase);
    if(typeof setupSaving==='function') setupSaving();
    const next=document.getElementById('nextPhase');
    if(next){
      if(phase<6){ next.href=(typeof linkWithState==='function')?linkWithState(`phase${phase+1}-${role}.html`):`phase${phase+1}-${role}.html`; next.textContent=`Bereit für Phase ${phase+1}`; }
      else {
        let target='abschluss.html';
        if(role==='protokoll') target='zusammenfassung-protokoll.html';
        else if(role==='supervisor' && !hasProtocolV83()) target='zusammenfassung.html';
        next.href=(typeof linkWithState==='function')?linkWithState(target):target;
        next.textContent=target.indexOf('zusammenfassung')>=0?'Ergebnisse zusammenfassen':'Abschluss';
      }
    }
  };
  try{initPhase=window.initPhase;}catch(_){}

  const oldInitRoleCardV83 = window.initRoleCard;
  window.initRoleCard=function(){
    if(typeof oldInitRoleCardV83==='function') oldInitRoleCardV83();
    const role=(typeof getPageRole==='function')?getPageRole():document.body.dataset.role;
    const target=document.getElementById('roleCard');
    if(!target) return;
    target.querySelectorAll('.role-name-pill').forEach(el=>{
      const r=el.getAttribute('data-role-label')||role;
      el.textContent=roleDisplayV83(r);
    });
    target.querySelectorAll('[data-assigned-name-for]').forEach(el=>{
      const r=el.getAttribute('data-assigned-name-for');
      const name=rolePersonV83(r);
      if(name) el.textContent=name;
    });
    const next=document.getElementById('nextPrep');
    if(next && role==='supervisor'){
      const query=typeof currentQueryString==='function'?currentQueryString():'';
      const file=hasProtocolV83()?'ablauf-supervisor-moderation.html':'ablauf-supervisor.html';
      next.href=`${file}?role=${encodeURIComponent(role)}${query?'&'+query:''}`;
    }
  };
  try{initRoleCard=window.initRoleCard;}catch(_){}
})();






/* ------------------------------------------------------------
   FINAL MODERATION PATCH v2 RESTORED v105: Gesprächsführung mit Antwortpausen,
   Phase-2-Dokumentation in drei Spalten, Protokoll-Zusammenfassung.
   ------------------------------------------------------------ */
(function(){
  const LABELS = {
    supervisor: 'Supervisor*in',
    schulleitung: 'Schulleitung',
    'lehrkraft-a': 'Lehrkraft A',
    'lehrkraft-b': 'Lehrkraft B',
    protokoll: 'Protokoll'
  };
  const PHASE_NAMES = {
    1: 'Erstkontakt',
    2: 'Problembeschreibung',
    3: 'Zielformulierung',
    4: 'Vertiefte Problembearbeitung',
    5: 'Ergebnissicherung',
    6: 'Reflexionstauglichkeit'
  };
  function esc(v){
    if (typeof escapeHtml === 'function') return escapeHtml(v);
    return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }
  function roleClass(role){ return 'role-' + String(role || '').replace(/[^a-z0-9-]/g,''); }
  function getAssignments(){ try { return (typeof loadObj === 'function') ? loadObj('assignments', {}) : {}; } catch(_) { return {}; } }
  function groupIdV105(){
    try{
      const p=new URLSearchParams(location.search);
      return p.get('g') || p.get('groupId') || localStorage.getItem('sv_current_group') || localStorage.getItem('sv_group_id') || '';
    }catch(_){ return localStorage.getItem('sv_current_group') || localStorage.getItem('sv_group_id') || ''; }
  }
  function cachedMembersV105(){
    try{
      const gid=groupIdV105();
      return JSON.parse(localStorage.getItem('sv_cached_group_members_'+gid) || localStorage.getItem('sv_cached_group_members_active') || '[]') || [];
    }catch(_){ return []; }
  }
  function hasProtocol(){ return !!window.__svSupervisorHasProtocolCleanV119(); }
  function loadSafe(k){ try { return (typeof loadText === 'function') ? loadText(k) : ''; } catch(_) { return ''; } }
  function reqNote(label, saveKey, hint){
    return `<div class="required-field-box"><div class="required-label">Pflichtfeld!</div><label>${esc(label)}</label>${hint?`<p class="small">${esc(hint)}</p>`:''}<textarea data-save="${esc(saveKey)}"></textarea></div>`;
  }
  function waitBox(text){ return `<span class="answer-wait compact-wait">Antwort abwarten</span>`; }
  function scriptBlock(items){
    return `<div class="moderation-script">${items.map(item => {
      if (typeof item === 'string') return `<div class="script-step"><p>${esc(item)}</p></div>`;
      return `<div class="script-step"><p>${esc(item.text)}</p>${item.wait ? waitBox(item.wait) : ''}</div>`;
    }).join('')}</div>`;
  }
  function protocolCheckLine(){
    return hasProtocol()
      ? '„Protokollführung: Ist bis hierhin alles so notiert, dass wir zur nächsten Phase gehen können?“'
      : '„Ich prüfe kurz meine Notizen. Ist aus Ihrer Sicht noch etwas Wesentliches offen, bevor wir zur nächsten Phase gehen?“';
  }
  function miniSummary(){ return (typeof miniSummaryHtml === 'function') ? miniSummaryHtml() : ''; }

  function moderatorCard(phase){
    const cards = {
      1: {
        title: 'Erstkontakt',
        aim: 'Gespräch eröffnen, Bereitschaft klären und einen verbindlichen Gesprächsrahmen vereinbaren.',
        lines: [
          { text: '„Willkommen. Ich freue mich, dass Sie alle da sind. Wir nutzen diese Supervision, um den Konflikt im Teamteaching geordnet zu klären.“' },
          { text: '„Die Schulleitung hat mich hinzugezogen, weil die Uneinigkeit im Teamteaching die Zusammenarbeit belastet und die Klasse dadurch zu wenig Stabilität erlebt.“' },
          { text: '„Mir ist wichtig: Es geht nicht um Schuldzuweisung. Es geht darum, Beobachtungen, Gefühle, Wünsche und Ziele so zu sortieren, dass eine gemeinsame Vereinbarung möglich wird.“' },
          { text: '„Sind alle bereit, an dieser Klärung mitzuwirken und die Perspektiven der anderen zunächst anzuhören?“', wait: 'Antworten der Beteiligten abwarten.' },
          { text: '„Ich möchte jetzt mit Ihnen einen Gesprächsrahmen vereinbaren. Was brauchen Sie, damit dieses Gespräch respektvoll und hilfreich verlaufen kann?“', wait: 'Beispiele sammeln lassen: ausreden lassen, Ich-Aussagen, konkrete Beobachtungen, keine persönlichen Angriffe, keine vorschnellen Bewertungen.' },
          { text: '„Ich halte fest: Wir sprechen respektvoll, lassen einander ausreden, bleiben bei konkreten Beobachtungen und prüfen am Ende gemeinsam die Vereinbarung.“' },
          { text: protocolCheckLine(), wait: 'Kurze Bestätigung abwarten.' }
        ]
      },
      2: {
        title: 'Problembeschreibung',
        aim: 'Die Situation aus drei Perspektiven verstehen: Beobachtung oder Problem, Gefühle und Wünsche.',
        lines: [
          { text: '„Ich würde jetzt zunächst die Schulleitung bitten: Welche Beobachtung haben Sie zur Situation im Teamteaching gemacht?“', wait: 'Schulleitung sprechen lassen. Danach kurz zusammenfassen.' },
          { text: '„Welche Gefühle löst diese Situation bei Ihnen aus?“', wait: 'Antwort abwarten.' },
          { text: '„Welche Wünsche haben Sie an das Teamteaching und an die Zusammenarbeit der Lehrkräfte?“', wait: 'Antwort abwarten.' },
          { text: '„Lehrkraft A, wie erleben Sie die Situation? Was ist aus Ihrer Sicht das zentrale Problem?“', wait: 'Lehrkraft A sprechen lassen. Danach Gefühle und Wünsche erfragen.' },
          { text: '„Welche Gefühle sind damit verbunden, und was wünschen Sie sich konkret?“', wait: 'Antworten abwarten.' },
          { text: '„Lehrkraft B, wie erleben Sie die Situation? Was ist aus Ihrer Sicht das zentrale Problem?“', wait: 'Lehrkraft B sprechen lassen. Danach Gefühle und Wünsche erfragen.' },
          { text: '„Welche Gefühle sind damit verbunden, und was wünschen Sie sich konkret?“', wait: 'Antworten abwarten.' },
          { text: '„Gibt es noch eine sachliche Ergänzung zur Problembeschreibung, ohne die andere Perspektive zu bewerten?“', wait: 'Kurze Ergänzungen zulassen.' },
          { text: protocolCheckLine(), wait: 'Bestätigung der Protokollführung beziehungsweise Notizen abwarten.' }
        ]
      },
      3: {
        title: 'Zielformulierung',
        aim: 'Einzelziele sichtbar machen und daraus eine gemeinsame Zielvereinbarung entwickeln.',
        lines: [
          { text: '„Wir gehen jetzt von der Problembeschreibung zur Zielformulierung. Bitte formulieren Sie möglichst konkret, was nach dieser Klärung anders sein soll.“' },
          { text: '„Schulleitung: Welches Ziel verfolgen Sie mit Blick auf Stabilität für die Klasse und die Zusammenarbeit im Team?“', wait: 'Ziel der Schulleitung abwarten und kurz bündeln.' },
          { text: '„Lehrkraft A: Welches Ziel wäre aus Ihrer Perspektive wichtig, damit Sie im Teamteaching handlungsfähig bleiben?“', wait: 'Ziel von Lehrkraft A abwarten.' },
          { text: '„Lehrkraft B: Welches Ziel wäre aus Ihrer Perspektive wichtig, damit Veränderung und Zusammenarbeit möglich werden?“', wait: 'Ziel von Lehrkraft B abwarten.' },
          { text: '„Welche Gemeinsamkeiten sehen Sie in diesen Zielen?“', wait: 'Gemeinsamkeiten durch die Gruppe benennen lassen.' },
          { text: '„Lassen Sie uns daraus eine gemeinsame Zielvereinbarung formulieren. Sie sollte kurz, konkret und für alle tragbar sein.“', wait: 'Gemeinsame Formulierung entwickeln lassen.' },
          { text: '„Ich lese die Formulierung einmal vor. Passt sie für alle als Arbeitsgrundlage?“', wait: 'Korrekturen abwarten.' },
          { text: protocolCheckLine(), wait: 'Bestätigung abwarten.' }
        ]
      },
      4: {
        title: 'Vertiefte Problembearbeitung',
        aim: 'Hilfreiche Kritik, Anerkennung und konkrete Absprachen entwickeln.',
        lines: [
          { text: '„Wir schauen jetzt darauf, wie Kritik im Teamteaching künftig hilfreicher geäußert werden kann.“' },
          { text: '„Wie würden Sie sich in Zukunft wünschen, dass Kritik angesprochen wird?“', wait: 'Ideen sammeln lassen. Protokoll notiert Kriterien.' },
          { text: '„Welche Regeln wären dafür hilfreich: unter vier Augen, konkret, zeitnah, Ich-Botschaft, Bezug auf eine Situation statt auf die Person?“', wait: 'Ergänzungen abwarten.' },
          { text: '„Ich leite jetzt eine kurze Übung zur Stärkung der Teamfähigkeit an. Jede Paarung sagt sich gegenseitig, was sie an der Perspektive des Gegenübers nachvollziehbar oder hilfreich findet.“' },
          { text: '„Zuerst: Schulleitung und Lehrkraft A. Was finden Sie an der Perspektive der jeweils anderen Person nachvollziehbar?“', wait: 'Kurzen Austausch abwarten.' },
          { text: '„Jetzt: Lehrkraft A und Lehrkraft B. Was können Sie an der Perspektive der anderen Person anerkennen?“', wait: 'Kurzen Austausch abwarten.' },
          { text: '„Jetzt: Schulleitung und Lehrkraft B. Was ist an der jeweiligen Perspektive nachvollziehbar oder hilfreich?“', wait: 'Kurzen Austausch abwarten.' },
          { text: '„Zum Schluss dieser Phase: Was soll sich ab morgen konkret ändern? Welche Absprache hilft dem Team im nächsten Unterricht?“', wait: 'Konkrete Absprachen formulieren lassen.' },
          { text: protocolCheckLine(), wait: 'Bestätigung abwarten.' }
        ]
      },
      5: {
        title: 'Ergebnissicherung',
        aim: 'Zentrale Punkte zusammenfassen, Zielvereinbarung prüfen und Zustimmung sichern.',
        lines: hasProtocol() ? [
          { text: '„Wir sichern jetzt die Ergebnisse. Protokollführung, bitte fassen Sie noch einmal die geäußerten Probleme, Gefühle, Wünsche, Ziele und Absprachen zusammen.“', wait: 'Zusammenfassung der Protokollführung abwarten.' },
          { text: '„Bitte lesen Sie anschließend die gemeinsame Zielvereinbarung vor.“', wait: 'Zielvereinbarung vorlesen lassen.' },
          { text: '„Gibt es konkrete Korrekturen oder Ergänzungen?“', wait: 'Korrekturen abwarten und durch Protokoll ergänzen lassen.' },
          { text: '„Können alle diese Vereinbarung mittragen?“', wait: 'Zustimmung jeder beteiligten Person abwarten.' },
          { text: '„Gibt es offene Rückmeldungen oder offene Punkte, die noch ergänzt werden sollen?“', wait: 'Offene Punkte abwarten.' },
          { text: '„Protokollführung: Bitte setzen Sie die Zustimmung entsprechend und ergänzen Sie offene Rückmeldungen.“', wait: 'Eintrag abwarten.' }
        ] : [
          { text: '„Ich fasse die zentralen Punkte zusammen: Probleme, Gefühle, Wünsche, Ziele und Absprachen.“', wait: 'Kurz prüfen, ob alle folgen können.' },
          { text: '„Die gemeinsame Zielvereinbarung lautet …“', wait: 'Zielvereinbarung vorlesen.' },
          { text: '„Gibt es konkrete Korrekturen oder Ergänzungen?“', wait: 'Korrekturen eintragen.' },
          { text: '„Können alle diese Vereinbarung mittragen?“', wait: 'Zustimmung jeder Person abwarten und setzen.' },
          { text: '„Gibt es offene Rückmeldungen oder offene Punkte, die noch ergänzt werden sollen?“', wait: 'Antworten notieren.' }
        ]
      },
      6: {
        title: 'Reflexionstauglichkeit',
        aim: 'Mit der Schulleitung prüfen, ob die Vereinbarung im Schulalltag tragfähig ist.',
        lines: [
          { text: '„Das Folgende richtet sich jetzt vor allem an die Schulleitung.“' },
          { text: '„Wie schätzen Sie ein, dass die heute besprochenen Punkte und Ziele im Schulalltag wirklich umgesetzt werden können?“', wait: 'Einschätzung der Schulleitung abwarten.' },
          { text: '„Welche Unterstützungsmöglichkeiten sehen Sie bei sich selbst oder durch die Schule?“', wait: 'Unterstützungsmöglichkeiten abwarten.' },
          { text: '„Was werden Sie konkret unternehmen, um ein harmonischeres Miteinander im Teamteaching zu fördern?“', wait: 'Erste Umsetzungsschritte abwarten.' },
          { text: protocolCheckLine(), wait: 'Bestätigung abwarten.' }
        ]
      }
    };
    const c = cards[phase] || cards[1];
    const note = hasProtocol() ? '' : '<div class="handoff-note compact-note"><strong>Hinweis:</strong> Du moderierst und dokumentierst.</div>';
    return `<section class="card highlight moderation-only-card equal-fill-card"><h2>Moderationskarte: ${esc(c.title)}</h2><p><strong>Ziel:</strong> ${esc(c.aim)}</p>${scriptBlock(c.lines)}${note}</section>`;
  }

  function protocolFields(phase){
    if(phase === 1) return `<section class="card protocol-overview-card equal-fill-card"><h2>Dokumentation: Gesprächsrahmen</h2><p class="small">Notiere, welche Gesprächsregeln vereinbart wurden und ob die Beteiligten zur Klärung bereit sind.</p>${reqNote('Gesprächsrahmen / Regeln / Bereitschaft','sup_p1_rahmen','Zum Beispiel: ausreden lassen, Ich-Aussagen, respektvoll bleiben, konkrete Beobachtungen nennen.')}</section>`;
    if(phase === 2) return `<section class="card protocol-overview-card phase2-protocol-section"><div class="phase2-title-row"><h2>Phase 2: Problembeschreibung</h2><div class="phase-task-card"><h3>Deine Aufgabe in Phase 2</h3><p>Trenne die Aussagen nach Rolle und Kategorie. Halte nur fest, was gesagt wurde: Problem oder Beobachtung, Gefühle und Wünsche.</p></div></div><div class="phase2-doc-grid"><div class="role-note-block"><h3>Schulleitung</h3>${reqNote('Problem / Beobachtung','sup_p2_sl_probleme')}${reqNote('Gefühle','sup_p2_sl_gefuehle')}${reqNote('Wünsche','sup_p2_sl_wuensche')}</div><div class="role-note-block"><h3>Lehrkraft A</h3>${reqNote('Problem / Perspektive','sup_p2_a_probleme')}${reqNote('Gefühle','sup_p2_a_gefuehle')}${reqNote('Wünsche','sup_p2_a_wuensche')}</div><div class="role-note-block"><h3>Lehrkraft B</h3>${reqNote('Problem / Perspektive','sup_p2_b_probleme')}${reqNote('Gefühle','sup_p2_b_gefuehle')}${reqNote('Wünsche','sup_p2_b_wuensche')}</div></div></section>`;
    if(phase === 3) return `<section class="card protocol-overview-card equal-fill-card"><h2>Dokumentation: Ziele</h2><p class="small">Notiere erst die Einzelziele und danach die Gemeinsamkeiten und die gemeinsame Zielvereinbarung.</p>${reqNote('Ziel Schulleitung','sup_p3_ziel_sl')}${reqNote('Ziel Lehrkraft A','sup_p3_ziel_a')}${reqNote('Ziel Lehrkraft B','sup_p3_ziel_b')}${reqNote('Gemeinsamkeiten','sup_p3_gemeinsamkeiten')}${reqNote('Gemeinsame Zielformulierung','sup_p3_gemeinsames_ziel')}</section>`;
    if(phase === 4) return `<section class="card protocol-overview-card equal-fill-card"><h2>Dokumentation: Vertiefte Problembearbeitung</h2><p class="small">Halte fest, wie Kritik künftig hilfreich geäußert werden soll und welche konkreten Absprachen entstehen.</p>${reqNote('Kriterien für hilfreiche Kritik','sup_p4_kritik')}<div class="perspective-table-entry"><div class="three-col">${reqNote('Positive Rückmeldung zur Schulleitung','sup_p4_pos_sl')}${reqNote('Positive Rückmeldung zu Lehrkraft A','sup_p4_pos_a')}${reqNote('Positive Rückmeldung zu Lehrkraft B','sup_p4_pos_b')}</div></div>${reqNote('Absprachen zum weiteren Vorgehen','sup_p4_absprachen')}</section>`;
    if(phase === 5) return `<section class="card protocol-overview-card equal-fill-card"><h2>Dokumentation: Ergebnissicherung</h2><p class="small">Fasse die Ergebnisse für die Gruppe zusammen. Trage Zustimmung und offene Punkte ein.</p><div class="summary-block"><strong>Zwischenergebnisse</strong><br>${miniSummary()}</div><label>Zustimmung erfolgt?</label><select class="standard-required" data-save="sup_p5_zustimmung_status"><option value="">Bitte auswählen</option><option value="Alle stimmen zu">Alle stimmen zu</option><option value="Teilweise Zustimmung / offene Punkte">Teilweise Zustimmung / offene Punkte</option><option value="Keine Zustimmung">Keine Zustimmung</option></select>${reqNote('Rückmeldungen / Zustimmung / offene Punkte','sup_p5_zustimmung')}</section>`;
    if(phase === 6) return `<section class="card protocol-overview-card equal-fill-card"><h2>Dokumentation: Praxistauglichkeit</h2><p class="small">Dokumentiere die Einschätzung der Schulleitung und die nächsten konkreten Schritte.</p>${reqNote('Einschätzung der Praxistauglichkeit','sup_p6_praxistauglichkeit')}${reqNote('Unterstützung durch Schulleitung','sup_p6_unterstuetzung')}${reqNote('Erste konkrete Umsetzungsschritte','sup_p6_umsetzung')}</section>`;
    return '';
  }
  function supervisorFullPhase(phase){ return `<div class="two-col equal-phase-layout compact-phase-layout supervisor-protocol-grid">${moderatorCard(phase)}${protocolFields(phase)}</div>`; }
  function protocolOnlyPhase(phase){ return `<div class="two-col equal-phase-layout compact-phase-layout protocol-task-grid"><section class="card highlight protokoll-note-card equal-fill-card"><p class="role-pill role-protokoll">Protokoll</p><h2>Deine Aufgabe in Phase ${phase}</h2><p>Höre genau zu und fülle die Dokumentationsfelder. Du moderierst nicht. Bitte bei unklaren Aussagen kurz um Wiederholung oder eine Zusammenfassung.</p><div class="protokoll-spacer" aria-hidden="true"></div></section>${protocolFields(phase)}</div>`; }
  function prepItems(role){
    const map = {
      schulleitung: [
        ['Beobachtung', 'prep_schulleitung_beobachtung'],
        ['Gefühle', 'prep_schulleitung_gefuehle'],
        ['Wünsche', 'prep_schulleitung_wuensche'],
        ['Lösungsideen / Unterstützung', 'prep_schulleitung_loesung']
      ],
      'lehrkraft-a': [
        ['Perspektive', 'prep_lehrkraft-a_perspektive'],
        ['Gefühle', 'prep_lehrkraft-a_gefuehle'],
        ['Wünsche', 'prep_lehrkraft-a_wuensche'],
        ['Zielgedanken', 'prep_lehrkraft-a_ziele']
      ],
      'lehrkraft-b': [
        ['Perspektive', 'prep_lehrkraft-b_perspektive'],
        ['Gefühle', 'prep_lehrkraft-b_gefuehle'],
        ['Wünsche', 'prep_lehrkraft-b_wuensche'],
        ['Zielgedanken', 'prep_lehrkraft-b_ziele']
      ]
    };
    return (map[role] || []).map(([label,k]) => ({label, value: loadSafe(k)}));
  }
  function prepCard(role, title){
    const items = prepItems(role);
    if(!items.length) return '';
    return `<section class="card prep-reference-card"><h2>${esc(title || 'Deine vorbereiteten Notizen')}</h2>${items.map(i => `<h3>${esc(i.label)}</h3><div class="readonly-box">${esc(i.value || 'Noch keine Notiz gespeichert.')}</div>`).join('')}</section>`;
  }
  function participantPhase(role, phase){
    const label = LABELS[role] || role;
    if(phase===1) return `<section class="card highlight"><p class="role-pill ${roleClass(role)}">${esc(label)}</p><h2>Gesprächsstart</h2><p>Höre der Supervisor*in zu. Achte auf den vereinbarten Gesprächsrahmen und darauf, ob du bereit bist, deine Perspektive einzubringen.</p></section>${prepCard(role,'Deine vorbereiteten Gedanken')}`;
    if(phase===2) return `<section class="card highlight"><p class="role-pill ${roleClass(role)}">${esc(label)}</p><h2>Problembeschreibung</h2><p>Wenn du das Wort bekommst, nutze deine vorbereiteten Notizen: Perspektive oder Beobachtung, Gefühle und Wünsche. Sprich konkret und ohne Vorwurf.</p></section>${prepCard(role,'Notizen für deine Wortmeldung')}`;
    if(phase===3) return `<section class="card highlight"><p class="role-pill ${roleClass(role)}">${esc(label)}</p><h2>Zielformulierung</h2><p>Nutze deine vorbereiteten Zielgedanken aus der Überlegungsphase. Im Gespräch arbeitest du mit der Gruppe an einer gemeinsamen Zielvereinbarung.</p><p class="notice">Du musst hier keine neue individuelle Zielformulierung mehr eintragen.</p></section>${prepCard(role,'Vorbereitete Ziele und Wünsche')}`;
    if(phase===4) return `<section class="card highlight"><p class="role-pill ${roleClass(role)}">${esc(label)}</p><h2>Vertiefte Problembearbeitung</h2><p>Beteilige dich am Gespräch über hilfreiche Kritik. In der kurzen Übung sagst du, was du an der Perspektive einer anderen Person nachvollziehen kannst.</p></section>${prepCard(role,'Wünsche und Ziele als Orientierung')}`;
    if(phase===5) return `<section class="card highlight"><p class="role-pill ${roleClass(role)}">${esc(label)}</p><h2>Ergebnissicherung</h2><p>Höre die Zusammenfassung. Prüfe, ob deine Perspektive, Gefühle, Wünsche und Ziele korrekt aufgenommen wurden. Sage klar, ob du die Vereinbarung mittragen kannst.</p></section>${prepCard(role,'Deine Notizen zum Abgleichen')}`;
    if(phase===6 && role==='schulleitung') return `<section class="card highlight"><p class="role-pill role-schulleitung">Schulleitung</p><h2>Praxistauglichkeit prüfen</h2><p>Prüfe mit der Supervisor*in, ob die Vereinbarung im Schulalltag realistisch ist. Benenne Unterstützungsmöglichkeiten und erste konkrete Umsetzungsschritte.</p></section>${prepCard(role,'Vorbereitete Unterstützungsideen')}`;
    if(phase===6) return `<section class="card highlight"><p class="role-pill ${roleClass(role)}">${esc(label)}</p><h2>Abschluss</h2><p>Die Praxistauglichkeit wird vor allem mit der Schulleitung geprüft. Überlege, welchen ersten Schritt du selbst nach der Supervision gehen kannst.</p></section>${prepCard(role,'Deine wichtigsten Punkte')}`;
    return '';
  }

  const FLOW_STEPS = {
    supervisor4: [
      ['Gespräch eröffnen', 'Du begrüßt die Gruppe, benennst den Anlass neutral und vereinbarst einen Gesprächsrahmen.'],
      ['Probleme und Wünsche erfassen', 'Du fragst nacheinander nach Beobachtungen oder Problemen, Gefühlen und Wünschen und hältst diese Punkte fest.'],
      ['Ziele klären', 'Du fragst nach Einzelzielen und leitest eine gemeinsame Zielvereinbarung an.'],
      ['Kritik und Absprachen bearbeiten', 'Du leitest die kurze Übung zur Anerkennung von Perspektiven und sammelst konkrete Absprachen.'],
      ['Ergebnisse sichern', 'Du fasst Ergebnisse zusammen, prüfst Zustimmung und offene Punkte.'],
      ['Praxistauglichkeit prüfen', 'Du klärst mit der Schulleitung Unterstützung und erste Umsetzungsschritte.']
    ],
    supervisor5: [
      ['Gespräch eröffnen', 'Du begrüßt die Gruppe, benennst den Anlass neutral und vereinbarst einen Gesprächsrahmen.'],
      ['Moderationskarten nutzen', 'Deine Karten sind entlang der Informationen aufgebaut, die für die Dokumentation gebraucht werden. Greife die vorgeschlagenen Fragen im Gespräch auf.'],
      ['Antworten bewusst abwarten', 'Stelle Fragen nacheinander und gib genug Zeit, damit Antworten entstehen und dokumentiert werden können.'],
      ['Ziele und Absprachen leiten', 'Du fragst nach Einzelzielen, Gemeinsamkeiten, hilfreicher Kritik und konkreten Absprachen.'],
      ['Protokollierte Ergebnisse sichern', 'Du lässt die zentralen Punkte zusammenfassen und prüfst Korrekturen, Ergänzungen und Zustimmung.'],
      ['Praxistauglichkeit prüfen', 'Du richtest die letzten Fragen an die Schulleitung: Umsetzbarkeit, Unterstützung und erste Schritte.']
    ],
    protokoll: [
      ['Auftrag klären', 'Du dokumentierst neutral. Du moderierst nicht und bewertest keine Aussage.'],
      ['Kategorien beachten', 'Trenne Problem/Beobachtung, Gefühle, Wünsche, Ziele, Absprachen, Zustimmung und Praxistauglichkeit.'],
      ['Kurz und genau schreiben', 'Formuliere stichpunktartig. Bitte bei Unklarheiten um Wiederholung.'],
      ['Zielvereinbarung sichern', 'Achte darauf, dass Einzelziele, Gemeinsamkeiten und gemeinsames Ziel klar notiert sind.'],
      ['Zusammenfassung unterstützen', 'In der Ergebnissicherung liest du zentrale Punkte und die gemeinsame Zielvereinbarung vor.'],
      ['Ergebnisse absenden', 'Am Ende prüfst du die Zusammenfassung, sendest sie ab und kannst den Gruppenlink teilen.']
    ],
    schulleitung: [
      ['Anlass klären', 'Überlege, warum du die Supervision angeregt hast und was du beobachtet hast.'],
      ['Perspektive vorbereiten', 'Trenne Beobachtung, Gefühl und Wunsch. So kannst du im Gespräch klar sprechen.'],
      ['Ziel formulieren', 'Überlege, welche Stabilität die Klasse und welche Zusammenarbeit das Team braucht.'],
      ['Unterstützung prüfen', 'Überlege, welche organisatorische Unterstützung du anbieten kannst.'],
      ['Zustimmung prüfen', 'Prüfe, ob du die gemeinsame Vereinbarung mittragen und unterstützen kannst.']
    ],
    lehrkraft: [
      ['Eigene Perspektive klären', 'Überlege, was für dich das zentrale Problem im Teamteaching ist.'],
      ['Beobachtung statt Vorwurf', 'Bereite konkrete Situationen vor und vermeide Bewertungen über die andere Person.'],
      ['Gefühle und Wünsche formulieren', 'Benenne, was die Situation bei dir auslöst und was du brauchst.'],
      ['Ziel formulieren', 'Überlege, was nach der Supervision konkret anders laufen sollte.'],
      ['Vereinbarung prüfen', 'Prüfe am Ende, ob du die gemeinsame Absprache mittragen kannst.']
    ]
  };
  window.initFlow = function(){
    if(typeof initCommon === 'function') initCommon();
    const params = new URLSearchParams(location.search);
    let role = params.get('role') || document.body.dataset.role || '';
    let profile = document.body.dataset.flowProfile || (role === 'protokoll' ? 'protokoll' : role === 'schulleitung' ? 'schulleitung' : role === 'supervisor' ? 'supervisor' : (role === 'lehrkraft-a' || role === 'lehrkraft-b') ? 'lehrkraft' : 'lehrkraft');
    let steps = FLOW_STEPS.lehrkraft;
    if(profile === 'supervisor') steps = hasProtocol() ? FLOW_STEPS.supervisor5 : FLOW_STEPS.supervisor4;
    if(profile === 'protokoll') steps = FLOW_STEPS.protokoll;
    if(profile === 'schulleitung') steps = FLOW_STEPS.schulleitung;
    if(profile === 'lehrkraft') steps = FLOW_STEPS.lehrkraft;
    const box = document.getElementById('flowSteps');
    const next = document.getElementById('flowNext');
    if(next){
      let targetRole = role || profile;
      if(profile === 'lehrkraft' && (!targetRole || targetRole === 'lehrkraft')) targetRole = 'lehrkraft-a';
      next.href = (typeof linkWithState === 'function') ? linkWithState(`gedanken-${targetRole}.html`) : `gedanken-${targetRole}.html`;
      next.classList.add('disabled'); next.setAttribute('aria-disabled','true');
    }
    if(!box) return;
    const storageKey = (typeof key === 'function') ? key('flow_visible_moderation_v2_' + (role || profile)) : 'flow_visible_moderation_v2_' + (role || profile);
    let visible = Number(localStorage.getItem(storageKey) || '1');
    visible = Math.max(1, Math.min(steps.length, visible));
    function block(e){ if(visible < steps.length){ e.preventDefault(); } }
    function updateNext(){
      if(!next) return;
      const complete = visible >= steps.length;
      next.classList.toggle('disabled', !complete);
      next.setAttribute('aria-disabled', complete ? 'false' : 'true');
      next.textContent = complete ? 'Weiter: Mach dir Gedanken' : 'Weiter wird nach allen Kacheln aktiviert';
      next.onclick = complete ? null : block;
    }
    function render(){
      box.innerHTML = '';
      steps.slice(0, visible).forEach((step, idx) => {
        const read = idx < visible - 1 || visible >= steps.length;
        const card = document.createElement('article');
        card.className = 'card flow-step is-visible' + (read ? ' is-read' : '');
        card.innerHTML = `<div class="flow-step-head"><span class="step-badge">${idx+1}</span><h3>${esc(step[0])}</h3></div><p>${esc(step[1])}</p>${(!read && idx === visible-1) ? '<button type="button" class="secondary flow-read-btn">Gelesen</button>' : ''}`;
        const btn = card.querySelector('.flow-read-btn');
        if(btn) btn.addEventListener('click', () => { visible = Math.min(steps.length, visible + 1); localStorage.setItem(storageKey, String(visible)); render(); });
        box.appendChild(card);
      });
      updateNext();
    }
    render();
  };
  try { initFlow = window.initFlow; } catch(_) {}

  window.initPhase = function(){
    if(typeof initCommon === 'function') initCommon();
    const role = (typeof getPageRole === 'function') ? getPageRole() : document.body.dataset.role;
    const phase = (typeof getPhase === 'function') ? getPhase() : Number(document.body.dataset.phase || '0');
    if(typeof renderPhaseBar === 'function') renderPhaseBar(phase);
    const title = document.getElementById('phaseTitle');
    if(title) title.textContent = `Phase ${phase}: ${PHASE_NAMES[phase] || ''}`;
    const content = document.getElementById('phaseContent');
    if(!content) return;
    if(role === 'protokoll') content.innerHTML = protocolOnlyPhase(phase);
    else if(role === 'supervisor' && hasProtocol()) content.innerHTML = moderatorCard(phase);
    else if(role === 'supervisor') content.innerHTML = supervisorFullPhase(phase);
    else content.innerHTML = participantPhase(role, phase);
    if(typeof setupSaving === 'function') setupSaving();
    const next = document.getElementById('nextPhase');
    if(next){
      if(phase < 6){
        {
        let targetFile = `phase${phase+1}-${role}.html`;
        let url = (typeof linkWithState === 'function') ? linkWithState(targetFile) : targetFile;
        if(role === 'supervisor'){
          const mode = (typeof window.__svSupervisorHasProtocolV108 === 'function' && window.__svSupervisorHasProtocolV108()) ? 'moderation' : 'full';
          url += (url.indexOf('?')>=0?'&':'?') + 'supervisorMode=' + encodeURIComponent(mode) + '&members=' + (mode==='moderation'?'5':'4');
        }
        next.href = url;
      }
        next.textContent = `Bereit für Phase ${phase+1}`;
      } else {
        let target = 'abschluss.html';
        if(role === 'protokoll') target = 'zusammenfassung-protokoll.html';
        else if(role === 'supervisor' && !hasProtocol()) target = 'zusammenfassung.html';
        {
        let url = (typeof linkWithState === 'function') ? linkWithState(target) : target;
        if(role === 'supervisor'){
          const mode = (typeof window.__svSupervisorHasProtocolV108 === 'function' && window.__svSupervisorHasProtocolV108()) ? 'moderation' : 'full';
          url += (url.indexOf('?')>=0?'&':'?') + 'supervisorMode=' + encodeURIComponent(mode) + '&members=' + (mode==='moderation'?'5':'4');
        }
        next.href = url;
      }
        next.textContent = target.indexOf('zusammenfassung') >= 0 ? 'Ergebnisse zusammenfassen' : 'Abschluss';
      }
    }
  };
  try { initPhase = window.initPhase; } catch(_) {}
})();







/* v119: zentrale Phasenweiterleitung und Pflichtfeldlogik für Supervisor */
(function(){
  function gid(){
    try{
      const p=new URLSearchParams(location.search);
      return p.get('g') || p.get('groupId') || localStorage.getItem('sv_current_group') || localStorage.getItem('sv_group_id') || '';
    }catch(_){return '';}
  }
  function link(file){
    const params = new URLSearchParams();
    const g = gid();
    if(g) params.set('g', g);
    const mode = window.__svSupervisorHasProtocolCleanV119() ? 'moderation' : 'full';
    params.set('supervisorMode', mode);
    params.set('members', mode === 'moderation' ? '5' : '4');
    return file + '?' + params.toString();
  }
  function remember(){
    try{
      const g = gid() || 'default';
      const mode = window.__svSupervisorHasProtocolCleanV119() ? 'moderation' : 'full';
      localStorage.setItem('sv_supervisor_mode_' + g, mode);
      localStorage.setItem('sv_supervisor_mode_active', mode);
    }catch(_){}
  }
  function apply(){
    const role = (document.body && document.body.dataset && document.body.dataset.role) || '';
    if(role !== 'supervisor') return;
    remember();
    const phase = Number((document.body && document.body.dataset && document.body.dataset.phase) || '0') || 0;
    const next = document.getElementById('nextPhase');
    if(next && phase){
      const target = phase < 6 ? ('phase' + (phase + 1) + '-supervisor.html') : (window.__svSupervisorHasProtocolCleanV119() ? 'abschluss.html' : 'zusammenfassung.html');
      next.href = link(target);
      next.classList.remove('disabled','is-busy');
      next.removeAttribute('aria-disabled');
      next.style.pointerEvents = 'auto';
      next.textContent = phase < 6 ? ('Bereit für Phase ' + (phase+1)) : (window.__svSupervisorHasProtocolCleanV119() ? 'Abschluss' : 'Ergebnisse zusammenfassen');
    }
  }
  document.addEventListener('click', function(ev){
    const next = ev.target && ev.target.closest && ev.target.closest('#nextPhase');
    if(!next) return;
    const role = (document.body && document.body.dataset && document.body.dataset.role) || '';
    if(role !== 'supervisor') return;
    const phase = Number((document.body && document.body.dataset && document.body.dataset.phase) || '0') || 0;
    if(!phase) return;
    ev.preventDefault();
    ev.stopPropagation();
    ev.stopImmediatePropagation();
    remember();
    const target = phase < 6 ? ('phase' + (phase + 1) + '-supervisor.html') : (window.__svSupervisorHasProtocolCleanV119() ? 'abschluss.html' : 'zusammenfassung.html');
    location.href = link(target);
  }, true);
  window.__svApplySupervisorCleanV119 = apply;
  window.addEventListener('DOMContentLoaded', function(){ apply(); setTimeout(apply,80); setTimeout(apply,300); });
})();
