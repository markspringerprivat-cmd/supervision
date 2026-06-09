/* Guided flow, phase status, required validation and presentation save dialog */
(function(){
  'use strict';
  const PHASE_LABELS = {
    1:'Erstkontakt',2:'Problembeschreibung',3:'Zielformulierung',4:'Vertiefung',5:'Ergebnissicherung',6:'Umsetzung'
  };
  const REQUIRED_BY_PHASE = {
    1:['sup_p1_rahmen'],
    2:['sup_p2_sl_probleme','sup_p2_sl_gefuehle','sup_p2_sl_wuensche','sup_p2_a_probleme','sup_p2_a_gefuehle','sup_p2_a_wuensche','sup_p2_b_probleme','sup_p2_b_gefuehle','sup_p2_b_wuensche'],
    3:['sup_p3_ziel_sl','sup_p3_ziel_a','sup_p3_ziel_b','sup_p3_gemeinsamkeiten','sup_p3_gemeinsames_ziel'],
    4:['sup_p4_kritik','sup_p4_absprachen'],
    5:['sup_p5_zustimmung_status','sup_p5_zustimmung'],
    6:['sup_p6_praxistauglichkeit','sup_p6_unterstuetzung','sup_p6_umsetzung']
  };
  function gid(){ try { if(typeof getGroupId==='function') return getGroupId(); }catch(_){} return new URLSearchParams(location.search).get('g') || localStorage.getItem('sv_current_group') || ''; }
  function key(k){ const g=gid(); return g ? `sv_${g}_${k}` : `sv_${k}`; }
  function ltxt(k){ try{ if(typeof loadText==='function') return loadText(k)||''; }catch(_){} return localStorage.getItem(key(k)) || localStorage.getItem('sv_'+k) || localStorage.getItem(k) || ''; }
  function linkWithG(url){ try{ if(typeof linkWithState==='function') return linkWithState(url); }catch(_){} const g=gid(); return g ? `${url}${url.includes('?')?'&':'?'}g=${encodeURIComponent(g)}` : url; }
  function esc(s){ return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }
  function roleFromPage(){ return document.body.dataset.role || ((location.pathname.match(/(?:phase\d-|gedanken-|rolle-)([^.]+)\.html/)||[])[1]) || 'supervisor'; }
  function phaseFromPage(){ return Number(document.body.dataset.phase || ((location.pathname.match(/phase(\d)-/)||[])[1]) || 0); }
  function isRecorderRole(){ const r=roleFromPage(); return r==='supervisor' || r==='protokoll'; }
  function phaseComplete(n){
    if(!isRecorderRole()) return true;
    const keys = REQUIRED_BY_PHASE[n] || [];
    return keys.length ? keys.every(k => String(ltxt(k)).trim().length>0) : true;
  }
  function niceDialog(opts){
    opts = Object.assign({title:'Hinweis', text:'', actions:[{label:'OK', value:true}]}, opts||{});
    return new Promise(resolve=>{
      const wrap=document.createElement('div');
      wrap.className='sv-flow-modal';
      wrap.innerHTML=`<div class="sv-flow-backdrop"></div><div class="sv-flow-card" role="dialog" aria-modal="true"><h2>${esc(opts.title)}</h2><p>${esc(opts.text)}</p><div class="sv-flow-actions">${opts.actions.map((a,i)=>`<button type="button" class="${a.className||''}" data-idx="${i}">${esc(a.label)}</button>`).join('')}</div></div>`;
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
    const main=document.querySelector('main'); if(!main || document.querySelector('.sv-phase-status-nav')) return;
    const nav=document.createElement('nav');
    nav.className='sv-phase-status-nav';
    nav.setAttribute('aria-label','Phasenübersicht');
    nav.innerHTML = Object.keys(PHASE_LABELS).map(num=>{
      const n=Number(num); const state=phaseComplete(n)?'done':'open';
      return `<a class="sv-phase-chip ${n===phase?'active':''} ${state}" href="${linkWithG(`phase${n}-${role}.html`)}" title="Phase ${n}: ${PHASE_LABELS[n]}"><span>${n}</span><small>${PHASE_LABELS[n]}</small></a>`;
    }).join('');
    const old=document.getElementById('phaseBar');
    if(old) old.replaceWith(nav); else main.prepend(nav);
  }
  function currentMissing(){
    const phase=phaseFromPage(); if(!isRecorderRole()) return [];
    const keys=REQUIRED_BY_PHASE[phase] || [];
    const missing = [];
    keys.forEach(k=>{
      const field=document.querySelector(`[data-save="${CSS.escape(k)}"]`);
      const val = field ? String(field.value||'').trim() : String(ltxt(k)).trim();
      if(!val) { missing.push(k); if(field){ field.classList.add('sv-required-missing'); const wrap=field.closest('.required-field,.required-field-box,.required-field-wrap,.role-note-block,section.card') || field; wrap.classList.add('sv-required-missing-wrap'); }}
    });
    return missing;
  }
  function clearMissing(el){
    if(!el) return; el.classList.remove('sv-required-missing');
    const wrap=el.closest('.required-field,.required-field-box,.required-field-wrap,.role-note-block,section.card');
    if(wrap) wrap.classList.remove('sv-required-missing-wrap');
  }
  function installRequiredGuard(){
    if(document.body.dataset.mode !== 'phase') return;
    document.addEventListener('input',e=>{ if(e.target.matches('[data-save]')) { clearMissing(e.target); setTimeout(installPhaseLegend,30); }}, true);
    const next=document.getElementById('nextPhase');
    if(!next || next.dataset.flowGuard==='1') return;
    next.dataset.flowGuard='1';
    next.addEventListener('click', async function(e){
      const missing=currentMissing();
      if(missing.length){
        e.preventDefault(); e.stopImmediatePropagation();
        await niceDialog({title:'Pflichtfelder fehlen', text:'Bitte fülle zuerst alle rot markierten Pflichtfelder dieser Phase aus. Erst danach kannst du zur nächsten Seite wechseln.', actions:[{label:'OK',value:true}]});
      }
    }, true);
  }
  function installPrepWaitPopup(){
    if(document.body.dataset.mode !== 'prep') return;
    const btn=document.getElementById('startPhase1'); if(!btn || btn.dataset.waitPopup==='1') return;
    btn.dataset.waitPopup='1';
    const href=btn.getAttribute('href') || linkWithG(`phase1-${roleFromPage()}.html`);
    btn.addEventListener('click', async function(e){
      e.preventDefault(); e.stopImmediatePropagation();
      const go = await niceDialog({title:'Bereit für das Gespräch?', text:'Warte, bis alle Gruppenmitglieder ihre Notizen abgeschlossen haben. Wenn alle bereit sind, beginnt im nächsten Schritt gemeinsam das Gespräch mit Phase 1.', actions:[{label:'Warten und weiter bearbeiten',value:false,className:'secondary'},{label:'Weiter zu Phase 1',value:true}]});
      if(go) location.href = href;
    }, true);
  }

  function installSummaryGuidance(){
    if(!/zusammenfassung(?:-protokoll)?\.html$/.test(location.pathname)) return;
    const main=document.querySelector('main'); if(!main || main.dataset.guidanceInstalled==='1') return;
    main.dataset.guidanceInstalled='1';
    main.innerHTML=`
      <section class="sv-guidance-stage" aria-live="polite">
        <article class="sv-guidance-card is-active" data-step="0">
          <h2>Ihr habt das Gespräch beendet.</h2>
          <p>Im nächsten Schritt wird aus euren Notizen eine Präsentation erstellt. Diese Präsentation kann später im Plenum genutzt werden, falls eure Gruppe zufällig ausgewählt wird.</p>
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
    if(!/uebermittlung\.html$/.test(location.pathname)) return;
    const main=document.querySelector('main'); if(!main || main.dataset.transmissionInstalled==='1') return;
    main.dataset.transmissionInstalled='1';
    main.innerHTML=`
      <section class="sv-guidance-stage sv-transmission-stage">
        <article class="sv-guidance-card is-active" data-tx="0">
          <h2>Ergebnis mit der Gruppe teilen</h2>
          <p>Scannt den QR-Code, damit eure Gruppe die eigenen Ergebnisse später als Notizen nutzen kann. Das hilft, falls eure Gruppe im Plenum präsentiert.</p>
          <div class="share-grid compact"><img id="groupShareQr" class="qr share-qr" alt="QR-Code zum Gruppenergebnis"><div><a id="groupShareLink" class="button secondary" href="#" target="_blank" rel="noopener">Gruppenergebnis öffnen</a><button id="copyGroupShareLink" class="secondary" type="button">Link kopieren</button></div></div>
          <div class="nav-row"><button type="button" class="secondary" data-tx-prev disabled>Zurück</button><button type="button" data-tx-next>Weiter</button></div>
        </article>
        <article class="sv-guidance-card" data-tx="1" hidden>
          <h2>Ergebnis übermitteln</h2>
          <p>Jetzt werden die wichtigsten Ergebnisse und die gespeicherte Präsentation an die zentrale Ergebnisübersicht gesendet. Im Anschluss an die Gruppenphase wird per Zufall eine Gruppe ausgewählt, die ihre Ergebnisse im Plenum vorstellt.</p>
          <label for="groupName">Gruppenname</label><input id="groupName" type="text">
          <div class="nav-row"><button type="button" class="secondary" data-tx-prev>Zurück</button><button id="submitResults" type="button">Ergebnis übermitteln</button></div>
          <p id="submitStatus" class="small"></p>
          <div id="afterSubmitStart" class="nav-row" hidden><a class="button secondary" href="index.html">Zurück zur Startseite</a></div>
        </article>
        <article class="sv-guidance-card" data-tx="2" hidden>
          <h2>Übersicht prüfen</h2>
          <p>Hier könnt ihr eure Ergebnisse außerhalb der Präsentation noch einmal kontrollieren.</p>
          <div id="summaryContent" class="summary-panel"></div>
          <div class="nav-row"><button type="button" class="secondary" data-tx-prev>Zurück</button><a class="button" href="index.html">Zurück zur Startseite</a></div>
        </article>
      </section>`;
    if(typeof renderSummary==='function' && typeof collectSupervisorData==='function') { try{ renderSummary(collectSupervisorData()); }catch(_){} }
    if(typeof initSummary==='function') { try{ const input=document.getElementById('groupName'); if(input){ const d=typeof collectSupervisorData==='function'?collectSupervisorData():{}; input.value=ltxt('summary_group_name') || d.groupName || gid(); input.addEventListener('input',()=>{try{ if(typeof saveText==='function') saveText('summary_group_name', input.value); }catch(_){}}); } }catch(_){} }
    function shareUrl(){ const u=new URL('gruppe-ergebnis.html', location.href); const g=gid(); if(g) u.searchParams.set('g',g); return u.toString(); }
    function refreshShare(){ const link=shareUrl(); const a=document.getElementById('groupShareLink'); const qr=document.getElementById('groupShareQr'); if(a)a.href=link; if(qr)qr.src='https://api.qrserver.com/v1/create-qr-code/?size=220x220&data='+encodeURIComponent(link); }
    refreshShare();
    let tx=0; const cards=Array.from(main.querySelectorAll('[data-tx]'));
    function show(n){ tx=Math.max(0,Math.min(cards.length-1,n)); cards.forEach((c,i)=>{c.hidden=i!==tx;c.classList.toggle('is-active',i===tx);}); }
    main.addEventListener('click', async e=>{
      if(e.target.closest('[data-tx-next]')) show(tx+1);
      if(e.target.closest('[data-tx-prev]')) show(tx-1);
      if(e.target.closest('#copyGroupShareLink')){ try{ await navigator.clipboard.writeText(shareUrl()); e.target.textContent='Kopiert'; setTimeout(()=>e.target.textContent='Link kopieren',1200);}catch(_){prompt('Link kopieren:', shareUrl());} }
      if(e.target.closest('#submitResults')){
        setTimeout(()=>{ const st=document.getElementById('submitStatus'); if(st && /gesendet|sichtbar|abgesendet|gespeichert/i.test(st.textContent||'')){ const as=document.getElementById('afterSubmitStart'); if(as) as.hidden=false; }}, 1200);
      }
    });
  }

  function installSaveChoice(){
    document.addEventListener('click', async function(e){
      const btn=e.target.closest('#v6Save'); if(!btn) return;
      // Das eigentliche Speichern aus editor_v6_patch läuft am Button zuerst. Diese Abfrage kommt direkt danach.
      setTimeout(async ()=>{
        const modal=document.getElementById('presentationPrepModalV6');
        if(!modal || modal.hidden) return;
        const choice=await niceDialog({title:'Präsentation gespeichert', text:'Wie möchtest du fortfahren?', actions:[{label:'Speichern und Beenden',value:'close',className:'secondary'},{label:'Speichern und weiter',value:'next'}]});
        if(choice==='next'){
          const url='uebermittlung.html' + (gid()?('?g='+encodeURIComponent(gid())):'');
          location.href=url;
        } else if(choice==='close') {
          modal.hidden=true; document.documentElement.classList.remove('v6-modal-open');
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
