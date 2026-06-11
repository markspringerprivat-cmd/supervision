/* v85 eigenständiger Gruppen-Präsentationseditor */
(function(){
  'use strict';

  const STATE_KEY_BASE='presentation_v7_state';
  const BASELINE_KEY_BASE='presentation_v7_baseline';
  let loadedRow=null;
  let loadedGroupId='';

  function appUrl(){
    try{ if(typeof getAppsScriptUrl==='function') return getAppsScriptUrl(); }catch(_){}
    return (window.SUPERVISION_CONFIG&&window.SUPERVISION_CONFIG.APPS_SCRIPT_URL)||'';
  }
  function params(){return new URLSearchParams(location.search);}
  function gid(){
    const p=params();
    return p.get('g')||p.get('groupId')||localStorage.getItem('sv_current_group')||localStorage.getItem('sv_group_id')||'';
  }
  function rowId(){return params().get('row')||'';}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function status(msg,cls){
    const el=document.getElementById('groupPresentationEditStatus');
    if(!el)return;
    el.className='status '+(cls||'');
    el.innerHTML=esc(msg);
  }
  function storageKey(groupId,base){return 'sv_'+String(groupId||'default')+'_'+base;}
  function forceGroupContext(groupId){
    loadedGroupId=groupId||loadedGroupId||gid();
    try{
      localStorage.setItem('sv_current_group',loadedGroupId);
      localStorage.setItem('sv_group_id',loadedGroupId);
      window.getGroupId=function(){return loadedGroupId;};
    }catch(_){}
  }
  function setObj(key,val){try{localStorage.setItem(key,JSON.stringify(val));}catch(_){}}
  function getObj(key,fb){try{const v=localStorage.getItem(key);return v?JSON.parse(v):fb;}catch(_){return fb;}}
  function remove(key){try{localStorage.removeItem(key);}catch(_){}}
  function clone(o){return JSON.parse(JSON.stringify(o||{}));}
  function isObj(v){return v&&typeof v==='object'&&!Array.isArray(v);}
  function jsonp(query){
    const url=appUrl();
    return new Promise((resolve,reject)=>{
      if(!url){reject(new Error('Keine Apps-Script-URL gefunden.'));return;}
      const cb='groupPresentationEditorV85_'+Date.now()+'_'+Math.floor(Math.random()*1e9);
      const sp=new URLSearchParams(query||{});
      sp.set('callback',cb);sp.set('_',Date.now());
      const s=document.createElement('script');let done=false;
      window[cb]=data=>{done=true;cleanup();resolve(data);};
      function cleanup(){try{delete window[cb];}catch(_){} if(s.parentNode)s.parentNode.removeChild(s);}
      s.onerror=()=>{if(!done){cleanup();reject(new Error('Apps Script konnte nicht erreicht werden.'));}};
      s.src=url+(url.indexOf('?')>=0?'&':'?')+sp.toString();
      document.body.appendChild(s);
      setTimeout(()=>{if(!done){cleanup();reject(new Error('Zeitüberschreitung beim Laden der Gruppenpräsentation.'));}},18000);
    });
  }
  function postNoCors(payload){
    return fetch(appUrl(),{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)});
  }
  function normalizeRow(row){
    const d=(row&&row.data)||{};
    const raw=d.raw||row.raw||{};
    const merged=Object.assign({}, raw, d);
    ['assignments','p2','p3','p4','p5','p6'].forEach(k=>merged[k]=Object.assign({},raw[k]||{},d[k]||{}));
    return merged;
  }
  function presentationFromRow(row){
    const d=normalizeRow(row);
    const candidates=[
      d.presentationV6,
      d.raw&&d.raw.presentationV6,
      d.presentationJson,
      d.presentationConfig,
      d.presentationV5
    ];
    for(const c of candidates){
      if(isObj(c) && (c.settings||c.values||c.layout||c.text||c.textboxes||c.stickers)) return clone(c);
    }
    const values=Object.assign({}, d.presentationValues||{}, {
      groupName:d.groupName||row.groupName||d.groupId||'Gruppe',
      timestamp:d.timestamp||row.timestamp||new Date().toISOString()
    });
    if(d.assignments){
      values.supervisor=d.assignments.supervisor||values.supervisor||'';
      values.schulleitung=d.assignments.schulleitung||values.schulleitung||'';
      values.lehrkraftA=d.assignments['lehrkraft-a']||d.assignments.lehrkraftA||values.lehrkraftA||'';
      values.lehrkraftB=d.assignments['lehrkraft-b']||d.assignments.lehrkraftB||values.lehrkraftB||'';
      values.protokoll=d.assignments.protokoll||values.protokoll||'';
    }
    return {
      version:6,
      settings:Object.assign({},d.presentationSettings||{}),
      values:values,
      text:Object.assign({},d.presentationTextOverrides||{}),
      layout:Object.assign({},d.presentationLayout||d.presentationStableLayout||{}),
      textboxes:Array.isArray(d.presentationExtras)?d.presentationExtras:[],
      stickers:Array.isArray(d.presentationStickers)?d.presentationStickers:[]
    };
  }
  async function loadExactGroupRow(){
    const groupId=gid();
    const row=rowId();
    if(!groupId && !row) throw new Error('Keine Gruppen-ID gefunden.');
    const data=await jsonp({action:'groupProgress',groupId:groupId,groupSize:5});
    if(!data||data.ok===false) throw new Error((data&&data.error)||'Gruppenfortschritt konnte nicht geladen werden.');
    let found=data.latestResult||null;
    if(row && found && String(found.rowNumber||found.id||'')!==String(row)){
      const list=await jsonp({action:'list',groupId:groupId});
      const entries=Array.isArray(list.entries)?list.entries:[];
      found=entries.find(e=>String(e.rowNumber||e.id||'')===String(row))||found;
    }
    if(!found) throw new Error('Für diese Gruppe wurde noch kein gespeicherter Präsentationsdatensatz gefunden.');
    loadedGroupId=groupId||data.groupId||found.groupId||'';
    return found;
  }
  function installStateForEditor(row){
    const groupId=loadedGroupId||gid()||row.groupId||'';
    const state=presentationFromRow(row);
    state.groupId=groupId;
    state.settings=Object.assign({slidePattern:'none',backgroundPattern:'none',tableStyle:'soft'},state.settings||{});
    state.savedAt=state.savedAt||new Date().toISOString();
    forceGroupContext(groupId);

    // Wichtig: Der Gruppeneditor lädt ausschließlich den Gruppenserver-Stand.
    // Alte lokale Entwürfe derselben Gruppe werden überschrieben, damit kein falscher Stand erscheint.
    setObj(storageKey(groupId,STATE_KEY_BASE),state);
    setObj(storageKey(groupId,BASELINE_KEY_BASE),state);
    setObj(storageKey(groupId,'presentation_handoff_v8'),state);
    setObj('sv_presentation_handoff_v8',state);
    if(typeof saveObj==='function'){
      saveObj('presentation_settings',state.settings||{});
      saveObj('presentation_layout_stable_v2',state.layout||{});
      saveObj('presentation_text_overrides',state.text||{});
      saveObj('presentation_extras',Array.isArray(state.textboxes)?state.textboxes:[]);
      saveObj('presentation_stickers_v1',Array.isArray(state.stickers)?state.stickers:[]);
    }
    return state;
  }
  function currentState(){
    const groupId=loadedGroupId||gid();
    return getObj(storageKey(groupId,STATE_KEY_BASE),null);
  }
  function payloadForSave(row,state){
    const groupId=loadedGroupId||gid()||row.groupId||'';
    const saveId='save_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8);
    state=clone(state||{});
    state.groupId=groupId;
    state.editorSaveId=saveId;
    state.savedAt=new Date().toISOString();
    state.settings=Object.assign({slidePattern:'none',backgroundPattern:'none',tableStyle:'soft'},state.settings||{});
    setObj(storageKey(groupId,STATE_KEY_BASE),state);
    return {
      action:'saveGroupPresentation',
      groupId:groupId,
      rowNumber:row.rowNumber||row.id||rowId()||'',
      editorSaveId:saveId,
      savedAt:state.savedAt,
      presentationV6:state
    };
  }
  async function saveToSheet(){
    status('Aktuelle Gruppenpräsentation wird gespeichert …');
    const state=currentState();
    if(!state) throw new Error('Kein Präsentationsstand im Gruppeneditor gefunden.');
    const payload=payloadForSave(loadedRow,state);
    await postNoCors(payload);
    await new Promise(resolve=>setTimeout(resolve,1100));
    try{
      const check=await jsonp({action:'groupProgress',groupId:payload.groupId,groupSize:5});
      const saved=check&&check.latestResult&&check.latestResult.data&&check.latestResult.data.presentationV6;
      if(saved && saved.editorSaveId && saved.editorSaveId!==payload.editorSaveId){
        status('Speichern wurde gesendet, aber die Serverprüfung zeigt noch einen älteren Stand. Bitte kurz warten und erneut öffnen.','warning');
        return;
      }
    }catch(_){}
    status('Gespeichert. Die finale Gruppenpräsentation wurde aktualisiert.','ok');
    setTimeout(()=>{location.href='gruppe-fortschritt.html?g='+encodeURIComponent(payload.groupId);},750);
  }
  function returnWithoutSaving(){
    const groupId=loadedGroupId||gid();
    location.href='gruppe-fortschritt.html'+(groupId?'?g='+encodeURIComponent(groupId):'');
  }
  function enhanceToolbar(){
    const modal=document.getElementById('presentationPrepModalV6');
    if(!modal)return false;
    const saveBtn=modal.querySelector('#v6Save');
    if(!saveBtn)return false;
    saveBtn.textContent='Für Gruppe speichern';
    saveBtn.classList.add('success-btn');
    if(!modal.querySelector('#v6DiscardGroupEdit')){
      const discard=document.createElement('button');
      discard.type='button';
      discard.id='v6DiscardGroupEdit';
      discard.className='warning-btn';
      discard.textContent='Verwerfen';
      saveBtn.insertAdjacentElement('afterend',discard);
      discard.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();returnWithoutSaving();},true);
    }
    if(!saveBtn.dataset.groupEditorV85){
      saveBtn.dataset.groupEditorV85='1';
      saveBtn.addEventListener('click',ev=>{
        ev.preventDefault();ev.stopPropagation();
        setTimeout(()=>saveToSheet().catch(err=>status(err.message||String(err),'warning')),180);
      },true);
    }
    const closeBtn=modal.querySelector('#v6Close');
    if(closeBtn && !closeBtn.dataset.groupEditorV85){
      closeBtn.dataset.groupEditorV85='1';
      closeBtn.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();returnWithoutSaving();},true);
    }
    return true;
  }
  function openEditor(){
    if(typeof window.openPresentationPrepModalFinal!=='function'){
      status('Editor konnte nicht geladen werden. Bitte Seite neu laden.','warning');
      return;
    }
    window.openPresentationPrepModalFinal(true);
    const start=Date.now();
    const timer=setInterval(()=>{
      if(enhanceToolbar()||Date.now()-start>5000) clearInterval(timer);
    },80);
  }
  async function boot(){
    const groupId=gid();
    if(groupId) document.getElementById('backToProgressBtn').href='gruppe-fortschritt.html?g='+encodeURIComponent(groupId);
    try{
      status('Aktuelle Gruppenpräsentation wird vom Server geladen …');
      loadedRow=await loadExactGroupRow();
      forceGroupContext(loadedGroupId||gid()||loadedRow.groupId||'');
      installStateForEditor(loadedRow);
      status('Aktuelle Gruppenpräsentation geladen. Editor wird geöffnet …','ok');
      setTimeout(openEditor,100);
    }catch(err){status(err.message||String(err),'warning');}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
