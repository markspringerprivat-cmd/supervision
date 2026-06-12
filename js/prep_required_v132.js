/* v132: Gedankenphase braucht Eintrag vor Gesprächsstart */
(function(){
  'use strict';
  const MSG = 'Bitte notiere zuerst mindestens einen Gedanken. Erst danach kann das Gespräch gestartet werden.';

  function isPrepPage(){
    return document.body && document.body.dataset && document.body.dataset.mode === 'prep';
  }

  function fields(){
    const box = document.getElementById('prepBox') || document;
    return Array.from(box.querySelectorAll('textarea,input[type="text"],input:not([type]),[contenteditable="true"]'))
      .filter(el => !el.disabled && !el.readOnly && !el.closest('[hidden]'));
  }

  function hasEntry(){
    return fields().some(el => String(el.value !== undefined ? el.value : el.textContent || '').trim().length > 0);
  }

  function statusEl(){
    let el = document.getElementById('prepRequiredStatus');
    if(!el){
      el = document.createElement('p');
      el.id = 'prepRequiredStatus';
      el.className = 'status warning prep-required-status';
      const nav = document.querySelector('.nav-row');
      if(nav && nav.parentNode) nav.parentNode.insertBefore(el, nav);
      else document.body.appendChild(el);
    }
    return el;
  }

  function setButtonState(){
    if(!isPrepPage()) return;
    const btn = document.getElementById('startPhase1');
    if(!btn) return;
    const ok = hasEntry();
    btn.classList.toggle('disabled', !ok);
    btn.classList.toggle('is-disabled', !ok);
    btn.setAttribute('aria-disabled', ok ? 'false' : 'true');
    btn.dataset.prepReady = ok ? '1' : '0';
    btn.style.pointerEvents = 'auto';
    const st = statusEl();
    st.textContent = ok ? 'Gedanke eingetragen. Das Gespräch kann gestartet werden.' : MSG;
    st.className = 'status ' + (ok ? 'ok' : 'warning') + ' prep-required-status';
  }

  function blockIfEmpty(ev){
    if(!isPrepPage()) return false;
    const btn = ev.target && ev.target.closest && ev.target.closest('#startPhase1');
    if(!btn) return false;
    if(hasEntry()) return false;
    ev.preventDefault();
    ev.stopPropagation();
    ev.stopImmediatePropagation();
    setButtonState();
    const st = statusEl();
    try{ st.scrollIntoView({behavior:'smooth', block:'center'}); }catch(_){}
    const first = fields()[0];
    if(first) setTimeout(()=>{ try{ first.focus({preventScroll:true}); }catch(_){} }, 160);
    return true;
  }

  function install(){
    if(!isPrepPage()) return;
    document.addEventListener('click', blockIfEmpty, true);
    document.addEventListener('input', setButtonState, true);
    document.addEventListener('change', setButtonState, true);
    setTimeout(setButtonState, 0);
    setTimeout(setButtonState, 120);
    setTimeout(setButtonState, 500);
  }

  window.prepHasRequiredThoughtV132 = hasEntry;
  window.prepUpdateStartButtonV132 = setButtonState;

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
  else install();
})();
