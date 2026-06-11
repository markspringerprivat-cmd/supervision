(function(){
  'use strict';

  const STATE_KEY_BASE = 'presentation_v7_state';

  function qs(){ return new URLSearchParams(location.search); }
  function gid(){
    const q=qs();
    return q.get('g') || q.get('groupId') || localStorage.getItem('sv_current_group') || '';
  }
  function rowId(){ return qs().get('row') || qs().get('id') || ''; }
  function appUrl(){
    try{ if(typeof getAppsScriptUrl==='function') return getAppsScriptUrl(); }catch(_){}
    return (window.SUPERVISION_CONFIG&&window.SUPERVISION_CONFIG.APPS_SCRIPT_URL)||'';
  }
  function storageKey(base){ return 'sv_' + (gid() || 'default') + '_' + base; }
  function esc(v){ return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function status(msg, cls){
    const el=document.getElementById('groupPresentationEditStatus');
    if(!el)return;
    el.className='status '+(cls||'');
    el.innerHTML=esc(msg);
  }
  function jsonp(params){
    const url=appUrl();
    return new Promise((resolve,reject)=>{
      if(!url){reject(new Error('Keine Apps-Script-URL gefunden.'));return;}
      const cb='groupPresentationEditCb_'+Date.now()+'_'+Math.floor(Math.random()*1e9);
      const sp=new URLSearchParams(params||{});
      sp.set('callback',cb); sp.set('_',Date.now());
      const s=document.createElement('script'); let done=false;
      window[cb]=data=>{done=true;cleanup();resolve(data);};
      function cleanup(){try{delete window[cb];}catch(_){} if(s.parentNode)s.parentNode.removeChild(s);}
      s.onerror=()=>{if(!done){cleanup();reject(new Error('Apps Script konnte nicht erreicht werden.'));}};
      s.src=url+(url.includes('?')?'&':'?')+sp.toString();
      document.body.appendChild(s);
      setTimeout(()=>{if(!done){cleanup();reject(new Error('Zeitüberschreitung.'));}},16000);
    });
  }
  async function loadGroupRow(){
    const groupId=gid();
    const row=rowId();
    if(!groupId && !row) throw new Error('Keine Gruppen-ID gefunden.');
    const res=await jsonp({action:'list',groupId:groupId});
    if(!res || res.ok===false) throw new Error((res&&res.error)||'Gruppendaten konnten nicht geladen werden.');
    const entries=Array.isArray(res.entries)?res.entries:[];
    let found=null;
    if(row) found=entries.find(e=>String(e.rowNumber||e.id||'')===String(row));
    if(!found && groupId) {
      const same=entries.filter(e=>String(e.groupId||e.data?.groupId||'')===String(groupId));
      found=same[same.length-1]||null;
    }
    if(!found) throw new Error('Für diese Gruppe wurde noch kein Ergebnis gefunden.');
    return found;
  }
  function rowData(row){
    const d=row.data || row.raw || {};
    const raw=d.raw || row.raw || {};
    return Object.assign({}, raw, d, { raw: raw });
  }
  function storePresentationStateFromRow(row){
    const d=rowData(row);
    const st=d.presentationV6 || d.raw?.presentationV6 || d.presentationV5 || null;
    if(st && typeof st === 'object'){
      try{ localStorage.setItem(storageKey(STATE_KEY_BASE), JSON.stringify(st)); }catch(_){}
    }
    try{ localStorage.setItem('sv_current_group', gid() || d.groupId || row.groupId || ''); }catch(_){}
  }
  function currentPresentationState(){
    try{
      const v=localStorage.getItem(storageKey(STATE_KEY_BASE));
      return v ? JSON.parse(v) : null;
    }catch(_){return null;}
  }
  function mergeUpdatedPayload(row, state){
    const d=rowData(row);
    const payload=JSON.parse(JSON.stringify(d));
    payload.groupId = gid() || payload.groupId || row.groupId || '';
    payload.groupName = (state && state.values && state.values.groupName) || payload.groupName || row.groupName || payload.groupId;
    payload.timestampLocal = new Date().toLocaleString('de-DE');
    payload.presentationV6 = state;
    payload.presentationSettings = state ? state.settings : payload.presentationSettings;
    payload.presentationLayout = state ? state.layout : payload.presentationLayout;
    payload.presentationExtras = state ? state.textboxes : payload.presentationExtras;
    payload.presentationStickers = state ? state.stickers : payload.presentationStickers;
    payload.presentationTextOverrides = state ? state.text : payload.presentationTextOverrides;
    payload.presentationValues = state ? state.values : payload.presentationValues;
    return payload;
  }
  async function saveToSheet(){
    try{
      status('Änderungen werden ins Google Sheet übertragen …');
      const row=window.__groupPresentationRow || await loadGroupRow();
      const st=currentPresentationState();
      if(!st) throw new Error('Keine gespeicherte Präsentationsänderung gefunden. Bitte zuerst im Editor auf „Speichern“ klicken.');
      const payload=mergeUpdatedPayload(row, st);
      await fetch(appUrl(), {method:'POST', mode:'no-cors', body:JSON.stringify(payload), headers:{'Content-Type':'text/plain;charset=utf-8'}});
      status('Präsentation wurde gespeichert und der bestehende Gruppeneintrag wurde aktualisiert.', 'ok');
      setTimeout(()=>{ location.href='gruppe-fortschritt.html?g='+encodeURIComponent(payload.groupId); }, 850);
    }catch(err){
      status(err.message || String(err), 'warning');
    }
  }
  async function boot(){
    const groupId=gid();
    if(groupId) document.getElementById('backToProgressBtn').href='gruppe-fortschritt.html?g='+encodeURIComponent(groupId);
    try{
      const row=await loadGroupRow();
      window.__groupPresentationRow=row;
      storePresentationStateFromRow(row);
      status('Präsentation geladen. Öffne den Editor, ändere die Folien und klicke dort auf „Speichern“. Danach hier „Änderungen ins Sheet speichern“ klicken.', 'ok');
    }catch(err){ status(err.message, 'warning'); }
    document.getElementById('openGroupEditorBtn').addEventListener('click',()=>{
      if(typeof window.openPresentationPrepModalFinal === 'function') window.openPresentationPrepModalFinal(true);
      else status('Editor konnte nicht geladen werden. Bitte Seite neu laden.', 'warning');
    });
    document.getElementById('saveGroupPresentationBtn').addEventListener('click',saveToSheet);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();