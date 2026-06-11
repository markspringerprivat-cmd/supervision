

/* removed old startPhase popup observer in v118 */
/* v107 helper: Supervisor*in mit Protokollrolle wird nicht gegen Protokoll-Pflichtfelder geprüft */
window.__svSupervisorHasProtocolV107 = window.__svSupervisorHasProtocolV107 || function(){
  try{
    const p=new URLSearchParams(location.search);
    if(p.get('members')==='5'||p.get('size')==='5'||p.get('groupSize')==='5'||p.get('mode')==='moderation'||p.get('supervisorMode')==='moderation') return true;
    const a=(typeof loadObj==='function')?loadObj('assignments',{}):{};
    if(a&&a.protokoll) return true;
    const gid=p.get('g')||p.get('groupId')||localStorage.getItem('sv_current_group')||localStorage.getItem('sv_group_id')||'';
    const m=JSON.parse(localStorage.getItem('sv_cached_group_members_'+gid)||localStorage.getItem('sv_cached_group_members_active')||'[]')||[];
    return Array.isArray(m)&&m.some(x=>x&&x.role==='protokoll');
  }catch(_){return false;}
};
window.__svSupervisorHasProtocolV105 = window.__svSupervisorHasProtocolV105 || window.__svSupervisorHasProtocolV107;

/* Guided flow, locked phase status, required validation and presentation save dialog */
(function(){
  'use strict';
  const PHASE_LABELS = {
    1:'Erstkontakt',2:'Problembeschreibung',3:'Zielformulierung',4:'Vertiefung',5:'Ergebnissicherung',6:'Umsetzung'
  };
  const REQUIRED_BY_PHASE = {
    1:['sup_p1_rahmen'],
    2:['sup_p2_sl_probleme','sup_p2_sl_gefuehle','sup_p2_sl_wuensche','sup_p2_a_probleme','sup_p2_a_gefuehle','sup_p2_a_wuensche','sup_p2_b_probleme','sup_p2_b_gefuehle','sup_p2_b_wuensche'],
    3:['sup_p3_ziel_sl','sup_p3_ziel_a','sup_p3_ziel_b','sup_p3_gemeinsamkeiten','sup_p3_gemeinsames_ziel'],
    4:['sup_p4_kritik','sup_p4_pos_sl','sup_p4_pos_a','sup_p4_pos_b','sup_p4_absprachen'],
    5:['sup_p5_zustimmung_status','sup_p5_zustimmung'],
    6:['sup_p6_praxistauglichkeit','sup_p6_unterstuetzung','sup_p6_umsetzung']
  };
  function gid(){ try { if(typeof getGroupId==='function') return getGroupId(); }catch(_){} return new URLSearchParams(location.search).get('g') || localStorage.getItem('sv_current_group') || ''; }
  function key(k){ const g=gid(); return g ? `sv_${g}_${k}` : `sv_${k}`; }
  function ltxt(k){ try{ if(typeof loadText==='function') return loadText(k)||''; }catch(_){} return localStorage.getItem(key(k)) || localStorage.getItem('sv_'+k) || localStorage.getItem(k) || ''; }
  function linkWithG(url){ try{ if(typeof linkWithState==='function') return linkWithState(url); }catch(_){} const g=gid(); return g ? `${url}${url.includes('?')?'&':'?'}g=${encodeURIComponent(g)}` : url; }
  function esc(s){ return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }
  function cssEsc(s){ return (window.CSS && CSS.escape) ? CSS.escape(s) : String(s).replace(/[^a-zA-Z0-9_-]/g,'\\$&'); }
  function roleFromPage(){ return document.body.dataset.role || ((location.pathname.match(/(?:phase\d-|gedanken-|rolle-)([^.]+)\.html/)||[])[1]) || 'supervisor'; }
  function phaseFromPage(){ return Number(document.body.dataset.phase || ((location.pathname.match(/phase(\d)-/)||[])[1]) || 0); }
  function isRecorderRole(){ const r=roleFromPage(); return r==='supervisor' || r==='protokoll'; }
  function fieldForKey(k){ return document.querySelector(`[data-save="${cssEsc(k)}"]`); }
  function missingForPhase(n, highlight){
    const keys = REQUIRED_BY_PHASE[n] || [];
    const missing = [];
    keys.forEach(k=>{
      const field = Number(n) === phaseFromPage() ? fieldForKey(k) : null;
      const val = field ? String(field.value||'').trim() : String(ltxt(k)).trim();
      if(!val){
        missing.push(k);
        if(highlight && field){
          field.classList.add('sv-required-missing');
          const wrap=field.closest('.required-field,.required-field-box,.required-field-wrap,.role-note-block,section.card') || field;
          wrap.classList.add('sv-required-missing-wrap');
        }
      }
    });
    return missing;
  }
  function missingForRange(from, to, highlight){
    const miss = [];
    for(let n=from; n<=to; n++) missingForPhase(n, highlight).forEach(k=>miss.push({phase:n,key:k}));
    return miss;
  }
  function phaseComplete(n){ return missingForPhase(Number(n), false).length === 0; }
  function canOpenPhase(n){
    n = Number(n);
    if(!n || n <= 1) return true;
    for(let i=1; i<n; i++){ if(!phaseComplete(i)) return false; }
    return true;
  }
  function uniquePhases(missing){ return Array.from(new Set(missing.map(x=>x.phase))).sort((a,b)=>a-b); }
  function niceDialog(opts){
    opts = Object.assign({title:'Hinweis', text:'', actions:[{label:'OK', value:true}]}, opts||{});
    return new Promise(resolve=>{
      const wrap=document.createElement('div');
      wrap.className='sv-flow-modal';
      const dialogTitle = String(opts.title || '');
      const forcedText = /Gespräch starten/i.test(dialogTitle) ? 'Starte das Gespräch bitte erst, wenn alle Teilnehmer*innen mit ihren Gedanken fertig sind. Wenn alle bereit sind, startet ihr gemeinsam mit Phase 1.' : String(opts.text || '');
      wrap.innerHTML=`<div class="sv-flow-backdrop"></div><div class="sv-flow-card" role="dialog" aria-modal="true"><h2>${esc(opts.title)}</h2><p class="sv-dialog-text">${esc(forcedText)}</p><div class="sv-flow-actions">${opts.actions.map((a,i)=>`<button type="button" class="${a.className||''}" data-idx="${i}">${esc(a.label)}</button>`).join('')}</div></div>`;
      document.body.appendChild(wrap);
      wrap.addEventListener('click',e=>{
        const b=e.target.closest('button[data-idx]'); if(!b) return;
        const a=opts.actions[Number(b.dataset.idx)];
        wrap.remove(); resolve(a.value);
      });
    });
  }
  window.supervisionNiceDialog = window.supervisionNiceDialog || niceDialog;
  window.supervisionConfirm = window.supervisionConfirm || ((text,title)=>niceDialog({title:title||'Bestätigen',text:text||'',actions:[{label:'Abbrechen',value:false,className:'secondary'},{label:'OK',value:true}]}));

  function installPhaseLegend(){
    if(document.body.dataset.mode !== 'phase') return;
    const phase = phaseFromPage(); const role=roleFromPage();
    const main=document.querySelector('main'); if(!main) return;
    const nav=document.createElement('nav');
    nav.className='sv-phase-status-nav';
    nav.setAttribute('aria-label','Phasenübersicht');
    nav.innerHTML = Object.keys(PHASE_LABELS).map(num=>{
      const n=Number(num);
      const complete=phaseComplete(n);
      const locked=!canOpenPhase(n);
      const state=complete?'done':'open';
      const href=linkWithG(`phase${n}-${role}.html`);
      return `<a class="sv-phase-chip ${n===phase?'active':''} ${state} ${locked?'locked':''}" href="${href}" data-phase-target="${n}" ${locked?'aria-disabled="true" data-locked="1"':''} title="Phase ${n}: ${PHASE_LABELS[n]}"><span>${n}</span><small>${PHASE_LABELS[n]}</small></a>`;
    }).join('');
    const old=document.querySelector('.sv-phase-status-nav') || document.getElementById('phaseBar');
    if(old) old.replaceWith(nav); else main.prepend(nav);
  }
  function clearMissing(el){
    if(!el) return; el.classList.remove('sv-required-missing');
    const wrap=el.closest('.required-field,.required-field-box,.required-field-wrap,.role-note-block,section.card');
    if(wrap) wrap.classList.remove('sv-required-missing-wrap');
  }
  function installRequiredGuard(){
    if(document.body.dataset.mode !== 'phase') return;
    document.addEventListener('input',e=>{ if(e.target.matches('[data-save]')) { clearMissing(e.target); setTimeout(installPhaseLegend,90); }}, true);
    document.addEventListener('change',e=>{ if(e.target.matches('[data-save]')) { clearMissing(e.target); setTimeout(installPhaseLegend,90); }}, true);
    document.addEventListener('click', async function(e){
      const chip=e.target.closest('.sv-phase-chip[data-phase-target]');
      if(chip && chip.dataset.locked==='1'){
        e.preventDefault(); e.stopImmediatePropagation();
        const target=Number(chip.dataset.phaseTarget||'0');
        const missing=missingForRange(1, Math.max(1,target-1), true);
        const phases=uniquePhases(missing).map(n=>'Phase '+n).join(', ');
        await niceDialog({title:'Phase noch gesperrt', text:`Diese Phase ist erst verfügbar, wenn die vorherigen Pflichtfelder ausgefüllt sind. Offen: ${phases || 'vorherige Phase'}.`, actions:[{label:'OK',value:true}]});
        return;
      }
      const next=e.target.closest('#nextPhase');
      if(!next) return;
      const phase=phaseFromPage();
      const isSummaryButton = phase===6 && /zusammenfassen/i.test(next.textContent || '');
      if(document.body.dataset.role==='supervisor' && ((typeof window.__svSupervisorHasProtocolV111==='function' && window.__svSupervisorHasProtocolV111()) || (typeof window.__svSupervisorModeV109==='function' && window.__svSupervisorModeV109()==='moderation') || (typeof window.__svSupervisorHasProtocolV108==='function' && window.__svSupervisorHasProtocolV108()) || (typeof window.__svSupervisorHasProtocolV107==='function' && window.__svSupervisorHasProtocolV107()) || (typeof window.__svSupervisorHasProtocolV105==='function' && window.__svSupervisorHasProtocolV105()))) return;
      if(!isRecorderRole() && !isSummaryButton) return;
      const missing = missingForRange(1, phase, true);
      if(missing.length){
        e.preventDefault(); e.stopImmediatePropagation();
        const phases=uniquePhases(missing).map(n=>'Phase '+n).join(', ');
        await niceDialog({title:'Pflichtfelder fehlen', text:`Bitte fülle zuerst alle Pflichtfelder aus. Rot markierte Felder müssen ergänzt werden. Offen: ${phases}.`, actions:[{label:'OK',value:true}]});
      }
    }, true);
  }
  function installPrepWaitPopup(){ return; }

  function installSummaryGuidance(){
    if(!/zusammenfassung(?:-protokoll)?\.html$/.test(location.pathname)) return;
    const main=document.querySelector('main'); if(!main || main.dataset.guidanceInstalled==='1') return;
    main.dataset.guidanceInstalled='1';
    main.innerHTML=`
      <section class="sv-guidance-stage" aria-live="polite">
        <article class="sv-guidance-card is-active" data-step="0">
          <h2>Ihr habt das Gespräch beendet.</h2>
          <p>Im nächsten Schritt wird aus euren Notizen eine Präsentation erstellt. Diese Präsentation kann später im Plenum genutzt werden, falls eure Gruppe zufällig ausgewählt wird, ihre Ergebnisse vorzustellen.</p>
          <div class="nav-row"><button type="button" class="secondary" data-guide-back disabled>Zurück</button><button type="button" data-guide-next>Weiter</button></div>
        </article>
        <article class="sv-guidance-card" data-step="1" hidden>
          <h2>Präsentation vorbereiten</h2>
          <p>Ihr könnt die Präsentation jetzt prüfen und anpassen: Texte, Farben, Muster, Tabellen, Sticker und Anordnung. Speichert die Präsentation anschließend, damit sie später für die Ergebnisübersicht übernommen wird.</p>
          <div class="nav-row"><button type="button" class="secondary" data-guide-prev>Zurück</button><button type="button" id="guidedOpenPresentation">Hier geht es zur Präsentation</button></div>
        </article>
      </section>
      <section class="summary-accordion card" id="summaryOverviewSection" style="margin-top:18px">
        <button type="button" class="summary-toggle" data-toggle-target="summaryContent" aria-expanded="false">Übersicht</button>
        <div id="summaryContent" class="summary-panel" hidden></div>
      </section>`;
    if(typeof renderSummary==='function' && typeof collectSupervisorData==='function') { try{ renderSummary(collectSupervisorData()); }catch(_){} }
    let step=0;
    const cards=Array.from(main.querySelectorAll('.sv-guidance-card'));
    function show(n){ step=Math.max(0,Math.min(cards.length-1,n)); cards.forEach((c,i)=>{c.hidden=i!==step; c.classList.toggle('is-active',i===step);}); }
    main.addEventListener('click',e=>{
      if(e.target.closest('[data-guide-next]')) show(step+1);
      if(e.target.closest('[data-guide-prev]')) show(step-1);
      if(e.target.closest('#guidedOpenPresentation')){
        if(typeof window.openPresentationPrepModalFinal==='function') window.openPresentationPrepModalFinal(true);
        else if(typeof window.__openPresentationPrepSafe==='function') window.__openPresentationPrepSafe();
      }
    });
  }

  function installTransmissionFlow(){
    const isTransmissionPage = /uebermittlung\.html$/i.test(location.pathname)
      || /Ergebnis\s+übermitteln/i.test(document.title || '')
      || !!document.querySelector('body[data-mode="summary"] #submitResults');
    if(!isTransmissionPage) return;
    const main=document.querySelector('main'); if(!main || main.dataset.transmissionInstalled==='1') return;
    main.dataset.transmissionInstalled='1';
    main.innerHTML=`
      <section class="sv-guidance-stage sv-transmission-stage">
        <article class="sv-guidance-card is-active" data-tx="0">
          <h2>Ergebnis übermitteln</h2>
          <p>Sende jetzt das Gruppenergebnis mit der gespeicherten Präsentationsgestaltung ab. Danach startet die Manometer-Feedbackphase.</p>
          <label for="groupName">Gruppenname</label><input id="groupName" type="text">
          <div class="nav-row"><button id="submitResults" type="button">Ergebnis übermitteln</button></div>
          <p id="submitStatus" class="small"></p>
        </article>
        <article class="sv-guidance-card sv-manometer-card" data-tx="1" hidden>
          <h2>Manometer – Feedback</h2>
          <p><strong>Bitte alle scannen:</strong> Alle Gruppenmitglieder sollen den QR-Code mit dem eigenen Gerät scannen und individuelles Feedback abgeben.</p>
          <div class="share-grid compact" style="justify-items:center;text-align:center">
            <img id="manometerQr" class="qr share-qr" alt="QR-Code zum Manometer-Feedback">
            <div><a id="manometerFeedbackLink" class="button" href="manometer.html" aria-disabled="true">Feedback starten in 5</a></div>
          </div>
          <p id="manometerReadHint" class="small">Der Button wird gleich aktiviert. Nutzt die Zeit, damit jede Person aus der Gruppe den QR-Code scannen kann.</p>
        </article>
      </section>`;
    if(typeof renderSummary==='function' && typeof collectSupervisorData==='function') { try{ renderSummary(collectSupervisorData()); }catch(_){} }
    const input=document.getElementById('groupName');
    if(input){
      try{ const d=typeof collectSupervisorData==='function'?collectSupervisorData():{}; input.value=ltxt('summary_group_name') || d.groupName || gid(); }catch(_){ input.value=ltxt('summary_group_name') || gid(); }
      input.addEventListener('input',()=>{try{ if(typeof saveText==='function') saveText('summary_group_name', input.value); }catch(_){}});
    }
    function manometerUrl(page){ const u=new URL(page || 'manometer.html', location.href); const g=gid(); if(g) u.searchParams.set('g',g); return u.toString(); }
    function refreshLinks(){
      const mf=document.getElementById('manometerFeedbackLink');
      const mqr=document.getElementById('manometerQr');
      const feedback=manometerUrl('manometer.html');
      if(mf)mf.href=feedback;
      if(mqr)mqr.src='https://api.qrserver.com/v1/create-qr-code/?size=240x240&data='+encodeURIComponent(feedback);
    }
    refreshLinks();
    let tx=0; const cards=Array.from(main.querySelectorAll('[data-tx]'));
    function show(n){ tx=Math.max(0,Math.min(cards.length-1,n)); cards.forEach((c,i)=>{c.hidden=i!==tx;c.classList.toggle('is-active',i===tx);}); refreshLinks(); if(cards[tx] && cards[tx].classList.contains('sv-manometer-card')) startManometerCountdown(); }
    let manometerTimer=null;
    function startManometerCountdown(){ const btn=document.getElementById('manometerFeedbackLink'); const hint=document.getElementById('manometerReadHint'); if(!btn) return; if(manometerTimer) clearInterval(manometerTimer); let left=5; btn.classList.add('disabled'); btn.setAttribute('aria-disabled','true'); btn.style.pointerEvents='none'; btn.textContent='Feedback starten in '+left; if(hint) hint.textContent='Bitte wartet, bis alle den QR-Code gesehen haben. Start möglich in '+left+' Sekunden.'; manometerTimer=setInterval(()=>{ left--; if(left>0){ btn.textContent='Feedback starten in '+left; if(hint) hint.textContent='Bitte wartet, bis alle den QR-Code gesehen haben. Start möglich in '+left+' Sekunden.'; } else { clearInterval(manometerTimer); manometerTimer=null; btn.classList.remove('disabled'); btn.removeAttribute('aria-disabled'); btn.style.pointerEvents=''; btn.textContent='Feedback starten'; if(hint) hint.textContent='Jetzt kann das Manometer-Feedback geöffnet werden. Jede Person füllt das Formular einmal aus.'; } },1000); }
    async function runTransmitAndShowManometer(submit){
      if(!submit || submit.dataset.busy==='1') return;
      submit.dataset.busy='1';
      submit.dataset.oldText=submit.textContent;
      submit.textContent='Wird abgesendet …';
      submit.disabled=true;
      const st=document.getElementById('submitStatus');
      if(st){ st.className='notice'; st.textContent='Ergebnisse werden abgesendet …'; }
      try{
        if(typeof window.submitResults==='function') await window.submitResults();
        const failed = st && /warning|danger|error/i.test(st.className||'') && /keine|fehl|nicht|error|fehlgeschlagen/i.test(st.textContent||'');
        if(!failed){
          if(st){ st.className='notice'; st.textContent='Übermittlung abgeschlossen. Manometer startet …'; }
          await new Promise(resolve=>setTimeout(resolve,900));
          show(1);
        }
      }catch(err){
        if(st){ st.className='warning'; st.textContent='Senden fehlgeschlagen: '+(err && err.message ? err.message : err); }
      }finally{
        submit.disabled=false;
        submit.textContent=submit.dataset.oldText || 'Ergebnis übermitteln';
        delete submit.dataset.busy;
      }
    }
    document.addEventListener('click', function(e){
      const submit=e.target.closest && e.target.closest('#submitResults');
      if(!submit || !main.contains(submit)) return;
      e.preventDefault();
      e.stopPropagation();
      if(e.stopImmediatePropagation) e.stopImmediatePropagation();
      runTransmitAndShowManometer(submit);
    }, true);
  }

  function installSaveChoice(){
    document.addEventListener('click', async function(e){
      const btn=e.target.closest('#v6Save'); if(!btn) return;
      setTimeout(async ()=>{
        const modal=document.getElementById('presentationPrepModalV6');
        if(!modal || modal.hidden) return;
        const choice=await niceDialog({title:'Präsentation gespeichert', text:'Wie möchtest du fortfahren?', actions:[{label:'Weiter arbeiten',value:'work',className:'secondary'},{label:'Speichern und weiter',value:'next'}]});
        if(choice==='next'){
          const url='uebermittlung.html' + (gid()?('?g='+encodeURIComponent(gid())):'');
          location.href=url;
        }
      }, 40);
    }, false);
  }

  document.addEventListener('DOMContentLoaded', function(){
    installSummaryGuidance();
    installTransmissionFlow();
    installPhaseLegend();
    installRequiredGuard();
    installPrepWaitPopup();
    installSaveChoice();
  });
})();



/* removed old startPhase popup observer in v118 */

/* removed old startPhase popup observer in v118 */
