/* Group session rebuild v56 join scanner + mobile polish */
(function(){
  const ROLES = ['supervisor','schulleitung','lehrkraft-a','lehrkraft-b','protokoll'];
  const ROLE_LABELS = {
    supervisor:'Supervisor*in',
    schulleitung:'Schulleitung',
    'lehrkraft-a':'Lehrkraft A',
    'lehrkraft-b':'Lehrkraft B',
    protokoll:'Protokoll'
  };
  const ROLE_FILES = {
    supervisor:'rolle-supervisor.html',
    schulleitung:'rolle-schulleitung.html',
    'lehrkraft-a':'rolle-lehrkraft-a.html',
    'lehrkraft-b':'rolle-lehrkraft-b.html',
    protokoll:'rolle-protokoll.html'
  };

  function activeRolesForCount(count){
    return Number(count||0) >= 5 ? ROLES.slice() : ['supervisor','schulleitung','lehrkraft-a','lehrkraft-b'];
  }

  const DEVICE_KEY = 'supervision_device_id_v33';
  let currentGroupId = '';
  let memberPollTimer = null;
  let latestMembers = [];
  let currentIsLeader = false;

  function qs(){return new URLSearchParams(location.search);}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function appUrl(){try{if(typeof getAppsScriptUrl==='function')return getAppsScriptUrl()}catch(_){}return(window.SUPERVISION_CONFIG&&window.SUPERVISION_CONFIG.APPS_SCRIPT_URL)||''}
  function deviceId(){
    try{
      let id=localStorage.getItem(DEVICE_KEY)||localStorage.getItem('supervision_device_id_v21')||localStorage.getItem('manometer_device_id_v2');
      if(!id){id='dev_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,12);}
      localStorage.setItem(DEVICE_KEY,id);
      localStorage.setItem('supervision_device_id_v21',id);
      localStorage.setItem('manometer_device_id_v2',id);
      return id;
    }catch(_){return 'dev_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,12);}
  }
  function detectDeviceType(){
    const ua=navigator.userAgent||'';
    const touch = navigator.maxTouchPoints||0;
    if(/iPad|Tablet|Android(?!.*Mobile)/i.test(ua) || (navigator.platform==='MacIntel' && touch>1)) return 'Tablet';
    if(/iPhone|Android.*Mobile|Mobile/i.test(ua)) return 'Smartphone';
    return 'Laptop';
  }
  function groupIdFromUrl(){return qs().get('groupId')||qs().get('g')||localStorage.getItem('sv_current_group')||'';}
  function jsonp(params){
    const url=appUrl();
    return new Promise((resolve,reject)=>{
      if(!url){reject(new Error('Keine Apps-Script-URL gefunden.'));return;}
      const cb='sessionCb_'+Date.now()+'_'+Math.floor(Math.random()*1e9);
      const sp=new URLSearchParams(params||{});
      sp.set('callback',cb); sp.set('_',Date.now());
      const s=document.createElement('script'); let done=false;
      window[cb]=data=>{done=true;cleanup();resolve(data);};
      function cleanup(){try{delete window[cb]}catch(_){} if(s.parentNode)s.parentNode.removeChild(s);}
      s.onerror=()=>{if(!done){cleanup();reject(new Error('Apps Script konnte nicht erreicht werden.'));}};
      s.src=url+(url.includes('?')?'&':'?')+sp.toString();
      document.body.appendChild(s);
      setTimeout(()=>{if(!done){cleanup();reject(new Error('Zeitüberschreitung. Der Server braucht länger als erwartet. Bitte nicht mehrfach klicken, sondern kurz warten und anschließend aktualisieren.'));}},30000);
    });
  }
  function status(id,msg,cls){
    const el=document.getElementById(id);
    if(!el)return;
    el.textContent=msg;
    el.className='status '+(cls||'');
  }

  function showStep(step){
    const loading=document.getElementById('loadingCard');
    const creator=document.getElementById('creatorCard');
    const join=document.getElementById('joinCard');
    const assign=document.getElementById('assignCard');
    [
      [loading, step==='loading'],
      [creator, step==='creator'],
      [join, step==='join'],
      [assign, step==='assign']
    ].forEach(([el,active])=>{
      if(!el)return;
      el.hidden=!active;
      el.classList.toggle('is-active',active);
      el.classList.toggle('is-hidden-step',!active);
    });
  }
  function transientStatus(id,msg,cls,next){
    status(id,msg,cls);
    setTimeout(()=>{ if(next) next(); },900);
  }
  function isAdminActive(){
    return document.body.classList.contains('is-global-admin') || sessionStorage.getItem('sv_global_admin_active_final') === '1';
  }

  function updateLeaderState(members){
    const me=deviceId();
    currentIsLeader=!!(members||[]).some(m=>m && m.deviceId===me && m.isPrimary);
    document.body.classList.toggle('is-leader',currentIsLeader);
  }
  function clearAssignedOverviewState(){
    const btn=document.getElementById('assignRolesSessionBtn');
    if(btn){btn.hidden=false;btn.disabled=false;}
    const box=document.getElementById('roleTiles');
    if(box) box.innerHTML='';
    status('assignSessionStatus','Mitgliederliste wurde geändert. Bitte Rollen neu verteilen.','warning');
  }




  function publicBaseUrlV110(){
    const cfg = (window.SUPERVISION_CONFIG && (window.SUPERVISION_CONFIG.PUBLIC_BASE_URL || window.SUPERVISION_CONFIG.GITHUB_PAGES_URL || window.SUPERVISION_CONFIG.BASE_URL)) || '';
    if(cfg) return String(cfg).replace(/\/+$/,'') + '/';
    if(location.protocol === 'http:' || location.protocol === 'https:'){
      return new URL('./', location.href).href;
    }
    return '';
  }
  function publicPageUrlV110(file, params){
    const base = publicBaseUrlV110();
    if(!base) return '';
    const u = new URL(file, base);
    Object.keys(params || {}).forEach(k => {
      if(params[k] !== undefined && params[k] !== null && String(params[k]) !== '') u.searchParams.set(k, params[k]);
    });
    return u.href;
  }

  function groupOverviewUrl(groupId){
    return publicPageUrlV110('gruppe-fortschritt.html', {g:groupId}) || '';
  }
  function showAlreadyJoined(groupId, member){
    renderPostJoinState(groupId, member, {already:true});
  }
  async function checkAlreadyJoinedOnJoinPage(){
    const groupId=groupIdFromUrl();
    if(!groupId)return false;
    try{
      const res=await jsonp({action:'resolveAssignedRoleForDevice',groupId,deviceId:deviceId()});
      if(res&&res.ok&&res.found){
        localStorage.setItem('sv_current_group',groupId);
        showAlreadyJoined(groupId,res);
        return true;
      }
    }catch(_){}
    return false;
  }
  function joinUrl(groupId){
    return publicPageUrlV110('gruppe-beitreten.html', {groupId:groupId}) || '';
  }
  function roleUrl(role,groupId){
    return publicPageUrlV110(ROLE_FILES[role], {groupId:groupId}) || '';
  }
  function qrSrc(url,size=220){
    return 'https://api.qrserver.com/v1/create-qr-code/?size='+size+'x'+size+'&data='+encodeURIComponent(url);
  }
  function groupNameFromMembers(members){
    return (members||[]).map(m=>String(m.name||'').trim()).filter(Boolean).map(n=>n.toLowerCase().replace(/[^a-z0-9äöüß]+/gi,'-').replace(/^-|-$/g,'')).join('-').slice(0,90) || '';
  }

  let roleScannerStream = null;
  let roleScannerTimer = null;
  let roleScannerCanvas = null;
  let roleScannerJsQrPromise = null;

  function normalizeScannedRoleTarget(text){
    const value=String(text||'').trim();
    if(!value) return '';
    let url='';
    try{
      if(/^https?:\/\//i.test(value)) url=new URL(value).toString();
      else if(/\.html(\?|$)/i.test(value)) url=new URL(value, location.href).toString();
      else return '';
      const u=new URL(url, location.href);
      const file=(u.pathname.split('/').pop()||'').toLowerCase();
      const allowed=['rolle-supervisor.html','rolle-schulleitung.html','rolle-lehrkraft-a.html','rolle-lehrkraft-b.html','rolle-protokoll.html'];
      if(!allowed.includes(file)) return '';
      return u.toString();
    }catch(_){ return ''; }
  }

  function closeRoleScanner(){
    const modal=document.getElementById('roleScannerModal');
    if(modal) modal.classList.remove('open');
    const video=document.getElementById('roleScanVideo');
    if(video) video.srcObject=null;
    if(roleScannerTimer){ clearInterval(roleScannerTimer); roleScannerTimer=null; }
    if(roleScannerStream){ roleScannerStream.getTracks().forEach(track=>track.stop()); roleScannerStream=null; }
  }

  function roleScannerStatus(msg, cls){
    const el=document.getElementById('roleScannerStatus');
    if(!el) return;
    el.textContent=msg;
    el.className='scanner-status'+(cls?(' '+cls):'');
  }

  function loadJsQrFallback(){
    if(window.jsQR) return Promise.resolve(window.jsQR);
    if(roleScannerJsQrPromise) return roleScannerJsQrPromise;
    roleScannerJsQrPromise = new Promise((resolve,reject)=>{
      const existing=document.querySelector('script[data-jsqr-role-scanner="1"]');
      if(existing){
        existing.addEventListener('load',()=>resolve(window.jsQR));
        existing.addEventListener('error',reject);
        return;
      }
      const s=document.createElement('script');
      s.src='https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';
      s.async=true;
      s.defer=true;
      s.dataset.jsqrRoleScanner='1';
      s.onload=()=>window.jsQR?resolve(window.jsQR):reject(new Error('jsQR nicht geladen'));
      s.onerror=()=>reject(new Error('jsQR konnte nicht geladen werden'));
      document.head.appendChild(s);
    });
    return roleScannerJsQrPromise;
  }

  function detectWithJsQr(video){
    if(!window.jsQR || !video || !video.videoWidth || !video.videoHeight) return '';
    if(!roleScannerCanvas) roleScannerCanvas=document.createElement('canvas');
    const canvas=roleScannerCanvas;
    const fullW=video.videoWidth;
    const fullH=video.videoHeight;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    function tryArea(sx,sy,sw,sh){
      canvas.width=sw;
      canvas.height=sh;
      ctx.drawImage(video,sx,sy,sw,sh,0,0,sw,sh);
      const img=ctx.getImageData(0,0,sw,sh);
      const code=window.jsQR(img.data,sw,sh,{inversionAttempts:'attemptBoth'});
      return code&&code.data?String(code.data).trim():'';
    }
    let raw=tryArea(0,0,fullW,fullH);
    if(raw) return raw;
    const size=Math.floor(Math.min(fullW,fullH)*0.82);
    const sx=Math.floor((fullW-size)/2), sy=Math.floor((fullH-size)/2);
    raw=tryArea(sx,sy,size,size);
    if(raw) return raw;
    const small=Math.floor(Math.min(fullW,fullH)*0.62);
    return tryArea(Math.floor((fullW-small)/2),Math.floor((fullH-small)/2),small,small);
  }

    async function openRoleScanner(){
    const modal=document.getElementById('roleScannerModal');
    const video=document.getElementById('roleScanVideo');
    if(!modal || !video) return;
    closeRoleScanner();
    modal.classList.add('open');
    roleScannerStatus('Kamera wird geöffnet …');
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
      roleScannerStatus('Dieser Browser erlaubt hier keinen eingebetteten Kamerazugriff. Bitte Link unten einfügen oder die normale Kamera-App zum QR-Code-Scannen verwenden.','warning');
      return;
    }
    try{
      roleScannerStream=await navigator.mediaDevices.getUserMedia({
        video:{
          facingMode:{ideal:'environment'},
          width:{ideal:1280},
          height:{ideal:1280}
        },
        audio:false
      });
      video.srcObject=roleScannerStream;
      video.setAttribute('playsinline','');
      video.muted=true;
      await video.play();

      let barcodeDetector=null;
      if(window.BarcodeDetector){
        try{ barcodeDetector=new BarcodeDetector({formats:['qr_code']}); }catch(_){ barcodeDetector=null; }
      }

      let jsQrReady=false;
      roleScannerStatus('Scanner wird vorbereitet …');
      try{ await loadJsQrFallback(); jsQrReady=!!window.jsQR; }
      catch(_){ jsQrReady=false; }

      if(barcodeDetector || jsQrReady) roleScannerStatus('QR-Code ruhig und möglichst groß in die Mitte halten …');
      else roleScannerStatus('Automatisches Erkennen ist in diesem Browser nicht verfügbar. Bitte Link unten einfügen.','warning');

      roleScannerTimer=setInterval(async()=>{
        try{
          if(!video.videoWidth) return;
          let raw='';
          if(barcodeDetector){
            const codes=await barcodeDetector.detect(video);
            if(codes && codes.length) raw=(codes[0].rawValue||'').trim();
          }
          if(!raw && window.jsQR){
            raw=detectWithJsQr(video);
          }
          if(!raw) return;
          const target=normalizeScannedRoleTarget(raw);
          if(!target){
            roleScannerStatus('QR erkannt, aber keine gültige Rollenkarten-Adresse.','warning');
            return;
          }
          closeRoleScanner();
          location.href=target;
        }catch(err){
          // Bei einzelnen Erkennungsfehlern weiter scannen.
        }
      },220);
    }catch(err){
      roleScannerStatus('Kamera konnte nicht geöffnet werden. Bitte Browser-Kamerazugriff erlauben oder Link unten einfügen.','warning');
    }
  }

  function renderPostJoinState(groupId, member, opts){
    const options=opts||{};
    const main=document.querySelector('main');
    if(!main) return;
    const name=member&&member.name?member.name:'dein Gerät';
    const title=options.already ? 'Du bist dieser Gruppe bereits beigetreten' : 'Du wurdest der Gruppe hinzugefügt';
    const intro=options.already
      ? 'Dieses Gerät ist bereits in dieser Gruppe registriert.'
      : 'Dein Gerät wurde erfolgreich dieser Gruppe zugeordnet.';
    main.innerHTML=`<section class="join-card"><h1>${esc(title)}</h1><p><strong>${esc(name)}</strong>: ${esc(intro)}</p><p>Warte jetzt, bis die Gruppenleitung die Rollen verteilt hat. Scanne danach im nächsten Schritt den QR-Code deiner zugeteilten Rollenkarte.</p><div class="join-actions"><button id="scanRoleCardBtn" type="button">QR-Code Rollenkarte scannen</button><a class="button-like ghost" href="${esc(groupOverviewUrl(groupId))}">Zur Gruppenübersicht</a></div><p id="joinStatus" class="status ok">Du kannst jetzt auf die Rollenverteilung deiner Gruppe warten.</p></section>`;
    document.getElementById('scanRoleCardBtn')?.addEventListener('click', openRoleScanner);
  }

  async function createGroup(){
    const name=document.getElementById('creatorName').value.trim();
    const deviceType=document.getElementById('creatorDevice').value;
    if(!name){status('sessionStatus','Bitte zuerst deinen Namen eintragen.','warning');return;}
    status('sessionStatus','Gruppe wird erstellt …');
    const res=await jsonp({action:'createGroupSession',deviceId:deviceId(),name,deviceType});
    if(!res||res.ok===false)throw new Error(res&&res.error||'Gruppe konnte nicht erstellt werden.');
    currentGroupId=res.groupId;
    localStorage.setItem('sv_current_group', currentGroupId);
    document.getElementById('sessionGroupId').textContent=currentGroupId;
    document.getElementById('joinCard').hidden=false;
    document.getElementById('assignCard').hidden=false;
    const url=joinUrl(currentGroupId);
    const qr=document.getElementById('joinQr');
    const linkText=document.getElementById('joinLinkText');
    if(url){
      qr.src=qrSrc(url,220);
      qr.style.display='';
      linkText.textContent=url;
    }else{
      qr.removeAttribute('src');
      qr.style.display='none';
      linkText.innerHTML='Kein öffentlicher Beitrittslink, weil diese Seite lokal per <code>file://</code> geöffnet wurde. Bitte die Website über GitHub Pages öffnen oder in <code>js/config.js</code> eine <code>PUBLIC_BASE_URL</code> setzen.';
    }
    transientStatus('sessionStatus','Gruppe wurde erstellt. Weiter zur Mitgliederaufnahme …','ok',()=>showStep('join'));
    await refreshMembers();
    startPolling();
  }

  function storeGroupRoleContextV111(groupId, members){
    try{
      const gid = groupId || currentGroupId || groupIdFromUrl() || '';
      if(!gid || !Array.isArray(members)) return;
      const assignmentNames = {};
      members.forEach(m=>{
        if(m && m.role){
          assignmentNames[m.role] = m.name || m.deviceId || true;
        }
      });
      localStorage.setItem('sv_cached_group_members_'+gid, JSON.stringify(members));
      localStorage.setItem('sv_cached_group_members_active', JSON.stringify(members));
      localStorage.setItem('sv_role_names_v58', JSON.stringify(assignmentNames));
      localStorage.setItem('sv_'+gid+'_assignments', JSON.stringify(assignmentNames));
      localStorage.setItem('sv_'+gid+'_group_assignments', JSON.stringify(assignmentNames));
      localStorage.setItem('sv_current_group', gid);
      const mode = (members.length >= 5 || !!assignmentNames.protokoll) ? 'moderation' : 'full';
      localStorage.setItem('sv_supervisor_mode_'+gid, mode);
      localStorage.setItem('sv_supervisor_mode_active', mode);
    }catch(_){}
  }


  function storeGroupRoleContextCleanV119(groupId, members){
    try{
      const gid = groupId || currentGroupId || groupIdFromUrl() || '';
      if(!gid || !Array.isArray(members)) return;
      const map = {};
      members.forEach(m => { if(m && m.role) map[m.role] = m.name || m.deviceId || true; });
      localStorage.setItem('sv_current_group', gid);
      localStorage.setItem('sv_cached_group_members_'+gid, JSON.stringify(members));
      localStorage.setItem('sv_cached_group_members_active', JSON.stringify(members));
      localStorage.setItem('sv_role_names_v58', JSON.stringify(map));
      localStorage.setItem('sv_'+gid+'_assignments', JSON.stringify(map));
      localStorage.setItem('sv_'+gid+'_group_assignments', JSON.stringify(map));
      try{
        const existing = (typeof loadObj === 'function') ? loadObj('assignments', {}) : {};
        const merged = Object.assign({}, existing || {}, map);
        if(typeof saveObj === 'function') saveObj('assignments', merged);
      }catch(_){}
      const mode = (members.length >= 5 || !!map.protokoll) ? 'moderation' : 'full';
      localStorage.setItem('sv_supervisor_mode_'+gid, mode);
      localStorage.setItem('sv_supervisor_mode_active', mode);
    }catch(_){}
  }

  function renderMembers(members){
    latestMembers=members||[];
    storeGroupRoleContextCleanV119(currentGroupId || groupIdFromUrl(), latestMembers);
    storeGroupRoleContextV111(currentGroupId || groupIdFromUrl(), latestMembers);
    updateLeaderState(latestMembers);
    const box=document.getElementById('membersList');
    if(!box)return;
    box.innerHTML = latestMembers.length ? latestMembers.map((m,i)=>`
      <div class="member-item" data-device-id="${esc(m.deviceId||'')}">
        <div class="member-line"><strong>${esc(m.name||('Mitglied '+(i+1)))}</strong><span>${esc(m.deviceType||'Gerät')}</span><span>${esc(m.role ? ROLE_LABELS[m.role]||m.role : 'noch keine Rolle')}</span></div>
        <div class="member-line"><span>${m.isPrimary?'Gruppenanführer':'Mitglied'}</span>${currentIsLeader && !m.isPrimary ? `<button type="button" class="member-remove leader-only" data-remove-device="${esc(m.deviceId||'')}" data-remove-row="${esc(m.rowNumber||'')}" title="Mitglied entfernen">×</button>` : ''}</div>
      </div>`).join('') : '<p>Noch keine Mitglieder registriert.</p>';
  }
  async function refreshMembers(){
    if(!currentGroupId) currentGroupId=groupIdFromUrl();
    if(!currentGroupId)return;
    const res=await jsonp({action:'listGroupMembers',groupId:currentGroupId});
    if(res&&res.ok){
      renderMembers(res.members||[]);
      latestMembers=res.members||[];
      const name = res.groupName || groupNameFromMembers(res.members||[]);
      if(name) status('sessionStatus','Gruppe aktiv: '+name+'. Mitglieder: '+(res.members||[]).length,'ok');
      if(rolesAlreadyAssigned(latestMembers) && document.getElementById('assignCard') && !document.getElementById('assignCard').hidden){
        showAssignedOverview(latestMembers);
      }
    }
  }
  function startPolling(){
    clearInterval(memberPollTimer);
    memberPollTimer=setInterval(()=>refreshMembers().catch(()=>{}),4000);
  }

  async function goToAssignAfterRefresh(){
    await refreshMembers();
    const assigned=rolesAlreadyAssigned(latestMembers);
    if(assigned){
      showAssignedOverview(latestMembers);
    }else{
      clearAssignedOverviewState();
      showStep('assign');
      status('assignSessionStatus','Mitgliederliste wurde aktualisiert. Bitte Rollen neu verteilen.','warning');
    }
  }

  async function assignRoles(){
    if(!currentGroupId) currentGroupId=groupIdFromUrl();
    if(!currentGroupId){status('assignSessionStatus','Keine Gruppe gefunden.','warning');return;}
    if(rolesAlreadyAssigned(latestMembers)){showAssignedOverview(latestMembers);return;}
    if((latestMembers||[]).length<4){status('assignSessionStatus','Bitte mindestens 4 Gruppenmitglieder registrieren.','warning');return;}
    if((latestMembers||[]).length>5){status('assignSessionStatus','Es dürfen maximal 5 Gruppenmitglieder teilnehmen. Bitte Gruppe prüfen.','warning');return;}
    status('assignSessionStatus','Rollen werden verteilt …');
    const res=await jsonp({action:'assignRolesToMembers',groupId:currentGroupId});
    if(!res||res.ok===false)throw new Error(res&&res.error||'Rollen konnten nicht verteilt werden.');
    renderMembers(res.members||[]);
    renderRoleTiles(res.assignments||{},res.members||[]);
    localStorage.setItem('sv_current_group', currentGroupId);
    showAssignedOverview(res.members||[]);
  }
  function renderRoleTiles(assignments,members){
    storeGroupRoleContextV111(currentGroupId || groupIdFromUrl(), members||latestMembers||[]);
    const box=document.getElementById('roleTiles');
    if(!box)return;
    const byRole={};
    (members||[]).forEach(m=>{if(m.role)byRole[m.role]=m;});
    const activeRoles=activeRolesForCount((members||[]).length);
    box.innerHTML = activeRoles.map(role=>{
      const m=byRole[role]||{};
      const url=roleUrl(role,currentGroupId);
      return `<div class="role-tile role-${esc(role)}">
        <strong>${esc(ROLE_LABELS[role])}</strong>
        <span class="name">${esc(m.name||'nicht zugewiesen')}</span>
        ${url ? `<a class="button" href="${esc(url)}">Rollenkarte öffnen</a><img src="${qrSrc(url,170)}" alt="QR-Code ${esc(ROLE_LABELS[role])}">` : `<p class="warning">Keine öffentliche URL. Bitte über GitHub Pages öffnen.</p>`}
      </div>`;
    }).join('');
  }

  function rolesAlreadyAssigned(members){
    return (members||[]).some(m=>m && m.role);
  }
  function showAssignedOverview(members){
    showStep('assign');
    renderMembers(members||latestMembers||[]);
    renderRoleTiles({}, members||latestMembers||[]);
    const btn=document.getElementById('assignRolesSessionBtn');
    if(btn){btn.hidden=true;btn.disabled=true;}
    status('assignSessionStatus','Rollen wurden bereits verteilt. Diese Übersicht zeigt die fertige Rollenverteilung mit QR-Codes.','ok');
  }

  async function joinGroup(){
    const name=document.getElementById('joinName').value.trim();
    const deviceType=document.getElementById('joinDevice').value;
    const groupId=groupIdFromUrl();
    if(!groupId){status('joinStatus','Kein Gruppenlink gefunden. Bitte den QR-Code erneut scannen.','warning');return;}
    if(!name){status('joinStatus','Bitte deinen Namen eintragen.','warning');return;}
    try{
      const current=await jsonp({action:'listGroupMembers',groupId});
      if(current&&current.ok&&(current.members||[]).length>=5){
        status('joinStatus','Diese Gruppe ist bereits voll. Maximal 5 Mitglieder sind möglich.','warning');
        return;
      }
    }catch(_){}
    status('joinStatus','Beitritt wird gespeichert …');
    const res=await jsonp({action:'joinGroupSession',groupId,deviceId:deviceId(),name,deviceType});
    if(!res||res.ok===false)throw new Error(res&&res.error||'Beitritt fehlgeschlagen.');
    localStorage.setItem('sv_current_group',groupId);
    renderPostJoinState(groupId,{name:name,deviceType:deviceType,role:(res.member&&res.member.role)||''});
  }

  async function guardRoleCard(){
    // v62 emergency: Rollenkarten dürfen niemals durch eine Serverprüfung leer/blockiert werden.
    // Die eigentliche Zugriffskontrolle bleibt über die Rollenübersicht/QR-Links bestehen.
    try{
      if(typeof window.initRoleCard === 'function') window.initRoleCard();
      else if(typeof initRoleCard === 'function') initRoleCard();
    }catch(err){
      const target=document.getElementById('roleCard');
      if(target && !target.innerHTML.trim()){
        target.innerHTML='<section class="card warning"><h2>Rollenkarte konnte nicht geladen werden</h2><p>Bitte gehe zurück zur Rollenübersicht und öffne die Karte erneut.</p></section>';
      }
    }
  }



  async function removeMember(deviceIdToRemove,rowNumberToRemove){
    if(!currentIsLeader){status('sessionStatus','Nur der Gruppenanführer kann Mitglieder entfernen.','warning');return;}
    if(!currentGroupId) currentGroupId=groupIdFromUrl();
    if(!currentGroupId || (!deviceIdToRemove && !rowNumberToRemove)){status('sessionStatus','Dieses Mitglied konnte nicht eindeutig erkannt werden. Bitte aktualisieren.','warning');return;}
    const rowEl=document.querySelector(`[data-remove-row="${window.CSS&&CSS.escape?CSS.escape(String(rowNumberToRemove||'')):String(rowNumberToRemove||'')}"]`)?.closest('.member-item') || document.querySelector(`[data-device-id="${window.CSS&&CSS.escape?CSS.escape(String(deviceIdToRemove||'')):String(deviceIdToRemove||'')}"]`);
    try{
      if(rowEl) rowEl.classList.add('is-removing');
      status('sessionStatus','Mitglied wird entfernt …');
      const res=await jsonp({action:'removeGroupMember',groupId:currentGroupId,deviceIdToRemove:deviceIdToRemove,removeRowNumber:rowNumberToRemove,requesterDeviceId:deviceId()});
      if(!res||res.ok===false)throw new Error(res&&res.error||'Mitglied konnte nicht entfernt werden.');
      if(rowEl) rowEl.remove();
      if(Array.isArray(res.members)){
        renderMembers(res.members);
      }else{
        await refreshMembers();
      }
      clearAssignedOverviewState();
      status('sessionStatus','Mitglied entfernt. Rollen müssen neu verteilt werden.','ok');
      showStep('join');
      setTimeout(()=>refreshMembers().catch(()=>{}),450);
    }catch(err){
      if(rowEl) rowEl.classList.remove('is-removing');
      status('sessionStatus',err.message,'warning');
    }
  }

  const SIM_NAMES = ['Mara','Jonas','Lea','Emil','Nora','Ben','Lina','Tom','Sofia','Finn','Amira','Luis'];
  const SIM_DEVICES = ['Laptop','Tablet','Smartphone'];
  async function simulateMember(){
    if(!currentGroupId) currentGroupId=groupIdFromUrl();
    if(!currentGroupId){status('sessionStatus','Bitte zuerst eine Gruppe erstellen.','warning');return;}
    if((latestMembers||[]).length>=5){status('sessionStatus','Die Gruppe ist bereits voll. Maximal 5 Mitglieder sind möglich.','warning');return;}
    const name = SIM_NAMES[Math.floor(Math.random()*SIM_NAMES.length)] + ' ' + Math.floor(10+Math.random()*90);
    const deviceType = SIM_DEVICES[Math.floor(Math.random()*SIM_DEVICES.length)];
    const fakeDeviceId = 'sim_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,9);
    try{
      status('sessionStatus','Simulationseintrag wird erstellt …');
      const res=await jsonp({action:'joinGroupSession',groupId:currentGroupId,deviceId:fakeDeviceId,name,deviceType});
      if(!res||res.ok===false)throw new Error(res&&res.error||'Simulation fehlgeschlagen.');
      status('sessionStatus','Simulationseintrag erstellt: '+name+' · '+deviceType,'ok');
      await refreshMembers();
    }catch(err){status('sessionStatus',err.message,'warning');}
  }

  async function initRolesSession(){
    const select=document.getElementById('creatorDevice');
    if(select)select.value=detectDeviceType();
    showStep('loading');
    document.getElementById('createGroupSessionBtn')?.addEventListener('click',()=>createGroup().catch(e=>status('sessionStatus',e.message,'warning')));
    document.getElementById('refreshMembersBtn')?.addEventListener('click',()=>refreshMembers().catch(e=>status('sessionStatus',e.message,'warning')));
    document.getElementById('groupCompleteBtn')?.addEventListener('click',()=>goToAssignAfterRefresh().catch(e=>status('sessionStatus',e.message,'warning')));
    document.getElementById('backToMembersBtn')?.addEventListener('click',()=>showStep('join'));
    document.getElementById('assignRolesSessionBtn')?.addEventListener('click',()=>assignRoles().catch(e=>status('assignSessionStatus',e.message,'warning')));
    document.getElementById('membersList')?.addEventListener('click',e=>{const btn=e.target.closest('[data-remove-device],[data-remove-row]');if(btn){e.preventDefault();removeMember(btn.getAttribute('data-remove-device'),btn.getAttribute('data-remove-row'));}});
    document.getElementById('simulateMemberBtn')?.addEventListener('click',()=>simulateMember());
    currentGroupId=groupIdFromUrl();
    if(!currentGroupId){
      try{
        const resolved=await jsonp({action:'resolveDeviceGroup',deviceId:deviceId()});
        if(resolved&&resolved.ok&&resolved.found&&resolved.groupId){
          currentGroupId=resolved.groupId;
          localStorage.setItem('sv_current_group', currentGroupId);
        }
      }catch(_){}
    }
    if(currentGroupId){
      document.getElementById('sessionGroupId').textContent=currentGroupId;
      const url=joinUrl(currentGroupId);
      document.getElementById('joinQr').src=qrSrc(url,220);
      document.getElementById('joinLinkText').textContent=url;
      try{
        const res=await jsonp({action:'listGroupMembers',groupId:currentGroupId});
        if(res&&res.ok){
          latestMembers=res.members||[];
          renderMembers(latestMembers);
          if(rolesAlreadyAssigned(latestMembers)) showAssignedOverview(latestMembers);
          else showStep('join');
        }else{
          showStep('creator');
        }
      }catch(_){showStep('creator');}
      startPolling();
    }else{
      setTimeout(()=>showStep('creator'),500);
    }
  }
  async function initJoinSession(){
    const select=document.getElementById('joinDevice');
    if(select)select.value=detectDeviceType();
    document.getElementById('closeRoleScannerBtn')?.addEventListener('click', closeRoleScanner);
    document.getElementById('roleScannerModal')?.addEventListener('click', (e)=>{ if(e.target && e.target.id==='roleScannerModal') closeRoleScanner(); });
    document.getElementById('openScannedRoleBtn')?.addEventListener('click', ()=>{ const value=document.getElementById('roleScanManual')?.value||''; const target=normalizeScannedRoleTarget(value); if(!target){ roleScannerStatus('Bitte einen gültigen Link zur Rollenkarte einfügen.','warning'); return; } closeRoleScanner(); location.href=target; });
    const already=await checkAlreadyJoinedOnJoinPage();
    if(already)return;
    document.getElementById('joinGroupBtn')?.addEventListener('click',()=>joinGroup().catch(e=>status('joinStatus',e.message,'warning')));
  }

  document.addEventListener('DOMContentLoaded',()=>{
    if(document.body.dataset.mode==='roles-session')initRolesSession();
    if(document.body.dataset.mode==='join-session')initJoinSession();
    if(document.body.dataset.mode==='rolecard')guardRoleCard();
  });
})();
