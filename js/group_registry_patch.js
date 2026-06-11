/* Group registry / device assignment patch v21 robust */
(function(){
  const DEVICE_KEY = 'supervision_device_id_v21';
  let roleRegistrationDone = false;

  function getDeviceIdV21(){
    try{
      let id = localStorage.getItem(DEVICE_KEY) || localStorage.getItem('supervision_device_id_v20') || localStorage.getItem('manometer_device_id_v2');
      if(id){
        localStorage.setItem(DEVICE_KEY, id);
        localStorage.setItem('manometer_device_id_v2', id);
        return id;
      }
      id = 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,12);
      localStorage.setItem(DEVICE_KEY, id);
      localStorage.setItem('manometer_device_id_v2', id);
      return id;
    }catch(_){
      return 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,12);
    }
  }

  function appsUrlV21(){
    try{ if(typeof getAppsScriptUrl === 'function') return getAppsScriptUrl() || ''; }catch(_){}
    return (window.SUPERVISION_CONFIG && window.SUPERVISION_CONFIG.APPS_SCRIPT_URL) || '';
  }

  function groupIdV21(){
    try{ if(typeof getGroupId === 'function') return getGroupId() || ''; }catch(_){}
    const p = new URLSearchParams(location.search);
    return p.get('g') || p.get('groupId') || localStorage.getItem('sv_current_group') || '';
  }

  function assignmentsV21(){
    try{ if(typeof loadObj === 'function') return loadObj('assignments', {}) || {}; }catch(_){}
    try{
      const p = new URLSearchParams(location.search);
      const assign = p.get('assign');
      if(assign && typeof b64urlDecode === 'function') return b64urlDecode(assign) || {};
    }catch(_){}
    return {};
  }

  function participantsV21(){
    try{ if(typeof loadObj === 'function') return loadObj('participants_v2', []) || []; }catch(_){}
    return [];
  }

  function jsonpV21(url, params){
    return new Promise(function(resolve,reject){
      const cb = 'groupRegistryCb_' + Date.now() + '_' + Math.floor(Math.random()*1e9);
      const qs = new URLSearchParams(params || {});
      qs.set('callback', cb);
      qs.set('_', Date.now());
      const s = document.createElement('script');
      let done = false;
      window[cb] = function(data){ done = true; cleanup(); resolve(data); };
      function cleanup(){ try{ delete window[cb]; }catch(_){} if(s.parentNode) s.parentNode.removeChild(s); }
      s.onerror = function(){ if(!done){ cleanup(); reject(new Error('Apps Script konnte nicht erreicht werden.')); } };
      s.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + qs.toString();
      document.body.appendChild(s);
      setTimeout(function(){ if(!done){ cleanup(); reject(new Error('Zeitüberschreitung.')); } }, 12000);
    });
  }

  async function registerGroupV21(participants, assignments){
    const url = appsUrlV21();
    const groupId = groupIdV21();
    if(!url || !groupId) return null;
    const payload = {
      action: 'registerGroup',
      groupId: groupId,
      groupName: groupId,
      groupSize: Array.isArray(participants) ? participants.length : 0,
      participants: JSON.stringify(participants || []),
      assignments: JSON.stringify(assignments || {})
    };
    return jsonpV21(url, payload);
  }

  async function registerDeviceGroupV21(role){
    const url = appsUrlV21();
    const groupId = groupIdV21();
    if(!url || !groupId || !role) return null;
    const assignments = assignmentsV21();
    const assignedName = assignments && role ? (assignments[role] || '') : '';
    return jsonpV21(url, {
      action: 'registerDeviceGroup',
      deviceId: getDeviceIdV21(),
      groupId: groupId,
      groupName: groupId,
      role: role || '',
      assignedName: assignedName || ''
    });
  }

  function roleFromPageV21(){
    const bodyRole = document.body && document.body.dataset && document.body.dataset.role;
    if(bodyRole) return bodyRole;
    const path = location.pathname.split('/').pop() || '';
    const m = path.match(/^rolle-(.+?)\.html$/);
    return m ? m[1] : '';
  }

  function setRoleStatusV21(text, ok){
    let box = document.getElementById('deviceRegistryStatus');
    if(!box){
      box = document.createElement('p');
      box.id = 'deviceRegistryStatus';
      box.className = 'small';
      const main = document.querySelector('main') || document.body;
      main.appendChild(box);
    }
    box.textContent = text;
    box.style.color = ok ? '#16703a' : '#8a5200';
  }

  function runRoleRegistrationV21(){
    if(roleRegistrationDone) return;
    const role = roleFromPageV21();
    if(!role) return;
    roleRegistrationDone = true;
    registerDeviceGroupV21(role).then(function(res){
      if(res && res.ok){
        try{ localStorage.setItem('sv_device_group_registered_' + groupIdV21(), '1'); }catch(_){}
        setRoleStatusV21('Dieses Gerät wurde der Gruppe zugeordnet.', true);
      }else{
        setRoleStatusV21('Hinweis: Dieses Gerät konnte noch nicht serverseitig zugeordnet werden.', false);
      }
    }).catch(function(){
      setRoleStatusV21('Hinweis: Dieses Gerät konnte noch nicht serverseitig zugeordnet werden.', false);
    });
  }

  function hookAssignmentButtonV21(){
    const assignBtn = document.getElementById('assignBtn');
    if(!assignBtn || !(document.body && document.body.dataset && document.body.dataset.mode === 'roles')) return;
    assignBtn.addEventListener('click', function(){
      setTimeout(function(){
        try{
          const participants = participantsV21();
          const assignments = assignmentsV21();
          if(assignments && Object.keys(assignments).length){
            registerGroupV21(participants, assignments).then(function(res){
              const status = document.getElementById('assignStatus');
              if(status && res && res.ok && !/serverseitig registriert/.test(status.textContent || '')){
                status.textContent = status.textContent + ' Gruppe wurde serverseitig registriert.';
              }else if(status && (!res || !res.ok)){
                status.textContent = status.textContent + ' Hinweis: Serverregistrierung ist noch nicht bestätigt.';
              }
            }).catch(function(){
              const status = document.getElementById('assignStatus');
              if(status) status.textContent = status.textContent + ' Hinweis: Serverregistrierung ist noch nicht bestätigt.';
            });
          }
        }catch(_){}
      }, 250);
    }, false);
  }

  function bootV21(){
    hookAssignmentButtonV21();
    runRoleRegistrationV21();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', bootV21);
  }else{
    bootV21();
  }

  // Fallback: falls andere Skripte die Seite nachträglich hydratisieren.
  setTimeout(bootV21, 700);

  window.registerGroupV21 = registerGroupV21;
  window.registerDeviceGroupV21 = registerDeviceGroupV21;
})();
