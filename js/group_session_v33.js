/* Group session rebuild v37 reopen assigned roles */
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
  const DEVICE_KEY = 'supervision_device_id_v33';
  let currentGroupId = '';
  let memberPollTimer = null;
  let latestMembers = [];

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
    const creator=document.getElementById('creatorCard');
    const join=document.getElementById('joinCard');
    const assign=document.getElementById('assignCard');
    [
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


  function groupOverviewUrl(groupId){
    const u=new URL('gruppe-fortschritt.html', location.href);
    u.searchParams.set('g', groupId);
    return u.href;
  }
  function showAlreadyJoined(groupId, member){
    const main=document.querySelector('main');
    if(!main)return;
    const name=member&&member.name?member.name:'dieses Gerät';
    const role=member&&member.role?`<p>Deine Rolle: <strong>${esc(ROLE_LABELS[member.role]||member.role)}</strong></p>`:'<p>Die Rollen wurden noch nicht verteilt.</p>';
    main.innerHTML=`<section class="join-shell"><div class="join-card">
      <h1>Du bist bereits beigetreten</h1>
      <p>Dieses Gerät ist bereits für <strong>${esc(name)}</strong> in dieser Gruppe registriert.</p>
      ${role}
      <a class="button" href="${esc(groupOverviewUrl(groupId))}">Zur Gruppenübersicht</a>
    </div></section>`;
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
    const u=new URL('gruppe-beitreten.html', location.href);
    u.searchParams.set('groupId',groupId);
    return u.href;
  }
  function roleUrl(role,groupId){
    const u=new URL(ROLE_FILES[role], location.href);
    u.searchParams.set('groupId',groupId);
    return u.href;
  }
  function qrSrc(url,size=220){
    return 'https://api.qrserver.com/v1/create-qr-code/?size='+size+'x'+size+'&data='+encodeURIComponent(url);
  }
  function groupNameFromMembers(members){
    return (members||[]).map(m=>String(m.name||'').trim()).filter(Boolean).map(n=>n.toLowerCase().replace(/[^a-z0-9äöüß]+/gi,'-').replace(/^-|-$/g,'')).join('-').slice(0,90) || '';
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
    document.getElementById('joinQr').src=qrSrc(url,220);
    document.getElementById('joinLinkText').textContent=url;
    transientStatus('sessionStatus','Gruppe wurde erstellt. Weiter zur Mitgliederaufnahme …','ok',()=>showStep('join'));
    await refreshMembers();
    startPolling();
  }
  function renderMembers(members){
    latestMembers=members||[];
    const box=document.getElementById('membersList');
    if(!box)return;
    box.innerHTML = latestMembers.length ? latestMembers.map((m,i)=>`
      <div class="member-item">
        <div class="member-line"><strong>${esc(m.name||('Mitglied '+(i+1)))}</strong><span>${esc(m.deviceType||'Gerät')}</span><span>${esc(m.role ? ROLE_LABELS[m.role]||m.role : 'noch keine Rolle')}</span></div>
        <span>${m.isPrimary?'Primärgerät':'Mitglied'}</span>
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
  async function assignRoles(){
    if(!currentGroupId) currentGroupId=groupIdFromUrl();
    if(!currentGroupId){status('assignSessionStatus','Keine Gruppe gefunden.','warning');return;}
    if(rolesAlreadyAssigned(latestMembers)){showAssignedOverview(latestMembers);return;}
    if((latestMembers||[]).length<4){status('assignSessionStatus','Bitte mindestens 4 Gruppenmitglieder registrieren.','warning');return;}
    status('assignSessionStatus','Rollen werden verteilt …');
    const res=await jsonp({action:'assignRolesToMembers',groupId:currentGroupId});
    if(!res||res.ok===false)throw new Error(res&&res.error||'Rollen konnten nicht verteilt werden.');
    renderMembers(res.members||[]);
    renderRoleTiles(res.assignments||{},res.members||[]);
    localStorage.setItem('sv_current_group', currentGroupId);
    showAssignedOverview(res.members||[]);
  }
  function renderRoleTiles(assignments,members){
    const box=document.getElementById('roleTiles');
    if(!box)return;
    const byRole={};
    (members||[]).forEach(m=>{if(m.role)byRole[m.role]=m;});
    box.innerHTML = ROLES.map(role=>{
      const m=byRole[role]||{};
      const url=roleUrl(role,currentGroupId);
      return `<div class="role-tile">
        <strong>${esc(ROLE_LABELS[role])}</strong>
        <span class="name">${esc(m.name||'nicht zugewiesen')}</span>
        <a class="button" href="${esc(url)}">Rollenkarte öffnen</a>
        <img src="${qrSrc(url,170)}" alt="QR-Code ${esc(ROLE_LABELS[role])}">
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
    status('joinStatus','Beitritt wird gespeichert …');
    const res=await jsonp({action:'joinGroupSession',groupId,deviceId:deviceId(),name,deviceType});
    if(!res||res.ok===false)throw new Error(res&&res.error||'Beitritt fehlgeschlagen.');
    localStorage.setItem('sv_current_group',groupId);
    showAlreadyJoined(groupId,{name:name,deviceType:deviceType,role:(res.member&&res.member.role)||''});
  }

  async function guardRoleCard(){
    const role=(document.body&&document.body.dataset&&document.body.dataset.role)||'';
    if(!role)return;
    const gid=groupIdFromUrl();
    const main=document.querySelector('main');
    const original=main ? main.innerHTML : '';
    if(main) main.style.visibility='hidden';
    try{
      const res=await jsonp({action:'resolveAssignedRoleForDevice',groupId:gid,deviceId:deviceId()});
      if(!res||res.ok===false||!res.found){
        if(main){main.style.visibility='visible';main.innerHTML=`<section class="card"><h2>Gerät nicht zugeordnet</h2><p>Dieses Gerät ist dieser Gruppe noch nicht zugeordnet. Bitte tritt zuerst über den Gruppen-QR-Code bei.</p><a class="button secondary" href="rollen.html">Zur Rollenverteilung</a></section>`;}
        return;
      }
      if(res.role!==role){
        if(main){main.style.visibility='visible';main.innerHTML=`<section class="card"><h2>Falsche Rollenkarte</h2><p>Du bist <strong>${esc(ROLE_LABELS[res.role]||res.role)}</strong>. Bitte scanne den QR-Code für deine zugeteilte Rolle.</p><a class="button" href="${esc(roleUrl(res.role,gid))}">Richtige Rollenkarte öffnen</a><p class="small">Wenn du erneut scannen möchtest, öffne die Kamera-App deines Geräts und scanne den passenden QR-Code.</p></section>`;}
        return;
      }
      if(main){main.style.visibility='visible';main.innerHTML=original;}
    }catch(err){
      if(main){main.style.visibility='visible';main.innerHTML=`<section class="card warning"><h2>Prüfung nicht möglich</h2><p>${esc(err.message)}</p></section>`;}
    }
  }


  const SIM_NAMES = ['Mara','Jonas','Lea','Emil','Nora','Ben','Lina','Tom','Sofia','Finn','Amira','Luis'];
  const SIM_DEVICES = ['Laptop','Tablet','Smartphone'];
  async function simulateMember(){
    if(!currentGroupId) currentGroupId=groupIdFromUrl();
    if(!currentGroupId){status('sessionStatus','Bitte zuerst eine Gruppe erstellen.','warning');return;}
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
    showStep('creator');
    document.getElementById('createGroupSessionBtn')?.addEventListener('click',()=>createGroup().catch(e=>status('sessionStatus',e.message,'warning')));
    document.getElementById('refreshMembersBtn')?.addEventListener('click',()=>refreshMembers().catch(e=>status('sessionStatus',e.message,'warning')));
    document.getElementById('groupCompleteBtn')?.addEventListener('click',()=>showStep('assign'));
    document.getElementById('assignRolesSessionBtn')?.addEventListener('click',()=>assignRoles().catch(e=>status('assignSessionStatus',e.message,'warning')));
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
          showStep('join');
        }
      }catch(_){showStep('join');}
      startPolling();
    }
  }
  async function initJoinSession(){
    const select=document.getElementById('joinDevice');
    if(select)select.value=detectDeviceType();
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
