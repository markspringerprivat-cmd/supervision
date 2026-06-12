/* v119: Gespräch-starten-Button alleinige stabile Implementierung */
(function(){
  'use strict';

  const MESSAGE = 'Starte das Gespräch bitte erst, wenn alle Teilnehmer*innen mit ihren Gedanken fertig sind. Wenn alle bereit sind, startet ihr gemeinsam mit Phase 1.';

  function roleFromPage(){
    const bodyRole = document.body && document.body.dataset ? document.body.dataset.role : '';
    if(bodyRole) return bodyRole;
    const file = (location.pathname.split('/').pop() || '').toLowerCase();
    const m = file.match(/^gedanken-(.+)\.html$/);
    return m ? m[1] : 'supervisor';
  }

  function targetUrl(){
    const role = roleFromPage();
    const params = new URLSearchParams(location.search);
    const out = new URLSearchParams();

    // Keep all relevant session parameters.
    ['g','groupId','groupToken','token','supervisorMode','members','size','groupSize','mode'].forEach(function(k){
      const v = params.get(k);
      if(v) out.set(k, v);
    });

    // Normalize group id.
    if(!out.get('g') && out.get('groupId')) out.set('g', out.get('groupId'));
    if(!out.get('g')){
      try{
        const local = localStorage.getItem('sv_current_group') || localStorage.getItem('sv_group_id') || '';
        if(local) out.set('g', local);
      }catch(_){}
    }

    const qs = out.toString();
    return 'phase1-' + role + '.html' + (qs ? '?' + qs : '');
  }

  function closeExisting(){
    document.querySelectorAll('.start-phase-modal-v117').forEach(function(el){ el.remove(); });
  }

  function openDialog(){
    closeExisting();

    const modal = document.createElement('div');
    modal.className = 'start-phase-modal-v117';
    modal.innerHTML =
      '<div class="start-phase-backdrop-v117"></div>' +
      '<div class="start-phase-card-v117" role="dialog" aria-modal="true" aria-labelledby="startPhaseTitleV117">' +
        '<h2 id="startPhaseTitleV117">Gespräch starten</h2>' +
        '<p>' + MESSAGE + '</p>' +
        '<div class="start-phase-actions-v117">' +
          '<button type="button" class="secondary" data-action="cancel">Abbrechen</button>' +
          '<button type="button" class="primary" data-action="start">Gespräch starten</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);

    modal.addEventListener('click', function(ev){
      const action = ev.target && ev.target.getAttribute && ev.target.getAttribute('data-action');
      if(action === 'cancel'){
        ev.preventDefault();
        closeExisting();
        return;
      }
      if(action === 'start'){
        ev.preventDefault();
        location.href = targetUrl();
      }
    });

    const primary = modal.querySelector('[data-action="start"]');
    if(primary) primary.focus();
  }

  function install(){
    const old = document.getElementById('startPhase1');
    if(!old || old.dataset.v117Rebuilt === '1') return;

    const btn = old.cloneNode(true);
    btn.dataset.v117Rebuilt = '1';
    btn.id = 'startPhase1';
    btn.type = 'button';
    btn.removeAttribute('href');
    btn.removeAttribute('aria-disabled');
    btn.classList.remove('disabled','is-busy');
    btn.style.pointerEvents = 'auto';

    old.replaceWith(btn);

    btn.addEventListener('click', function(ev){
      ev.preventDefault();
      ev.stopPropagation();
      ev.stopImmediatePropagation();
      if(document.body && document.body.dataset && document.body.dataset.mode === 'prep'){
        if(typeof window.prepHasRequiredThoughtV132 === 'function' && !window.prepHasRequiredThoughtV132()){
          if(typeof window.prepUpdateStartButtonV132 === 'function') window.prepUpdateStartButtonV132();
          return;
        }
      }
      openDialog();
    }, true);
  }

  function installRepeated(){
    install();
    setTimeout(install, 80);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', installRepeated);
  }else{
    installRepeated();
  }
})();
