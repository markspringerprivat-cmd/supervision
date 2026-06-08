/* Rollen-/Ablauf-Patch v12: saubere Namensliste, Rollenkarten, rollenabhängige Ablaufseiten. */
(function(){
  const ROLE_LABELS = {
    supervisor: 'Supervisor*in',
    schulleitung: 'Schulleitung',
    'lehrkraft-a': 'Lehrkraft A',
    'lehrkraft-b': 'Lehrkraft B',
    protokoll: 'Protokoll / Beobachtung'
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
        <p class="role-pill">${ROLE_LABELS[role] || role}</p>
        <h2>${esc(data.title)}</h2>
        <p><strong>Zugewiesene Person:</strong> ${esc(assigned || 'nicht gesetzt')}</p>
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
    const box=document.getElementById('flowSteps');
    const next=document.getElementById('flowNext');
    if(next){
      const targetRole = (role==='lehrkraft' || !role) ? 'lehrkraft-a' : role;
      next.href=(typeof linkWithState==='function') ? linkWithState(`gedanken-${targetRole}.html`) : `gedanken-${targetRole}.html`;
      next.classList.add('disabled');
      next.setAttribute('aria-disabled','true');
    }
    if(!box) return;
    const storageKey=(typeof key==='function') ? key('flow_visible_' + (role||profile)) : 'flow_visible_' + (role||profile);
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
    protokoll: 'Protokoll / Beobachtung'
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
