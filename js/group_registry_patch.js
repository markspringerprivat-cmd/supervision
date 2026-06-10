/* Group registry / device assignment patch v20 */
(function(){
  const DEVICE_KEY = 'supervision_device_id_v20';

  function getDeviceIdV20(){
    try{
      let id = localStorage.getItem(DEVICE_KEY) || localStorage.getItem('manometer_device_id_v2');
      if(id) return id;
      id = 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,12);
      localStorage.setItem(DEVICE_KEY, id);
      localStorage.setItem('manometer_device_id_v2', id);
      return id;
    }catch(_){
      return 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,12);
    }
  }

  function appsUrlV20(){
    try{ if(typeof getAppsScriptUrl === 'function') return getAppsScriptUrl() || ''; }catch(_){}
    return (window.SUPERVISION_CONFIG && window.SUPERVISION_CONFIG.APPS_SCRIPT_URL) || '';
  }

  function groupIdV20(){
    try{ if(typeof getGroupId === 'function') return getGroupId() || ''; }catch(_){}
    const p = new URLSearchParams(location.search);
    return p.get('g') || p.get('groupId') || localStorage.getItem('sv_current_group') || '';
  }

  function assignmentsV20(){
    try{ if(typeof loadObj === 'function') return loadObj('assignments', {}) || {}; }catch(_){}
    try{return JSON.parse(localStorage.getItem('assignments') || '{}') || {};}catch(_){return {};}
  }

  function jsonpV20(url, params){
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
      setTimeout(function(){ if(!done){ cleanup(); reject(new Error('Zeitüberschreitung.')); } }, 10000);
    });
  }

  async function registerGroupV20(participants, assignments){
    const url = appsUrlV20();
    const groupId = groupIdV20();
    if(!url || !groupId) return null;
    const groupName = groupId;
    return jsonpV20(url, {
      action: 'registerGroup',
      groupId: groupId,
      groupName: groupName,
      groupSize: Array.isArray(participants) ? participants.length : 0,
      participants: JSON.stringify(participants || []),
      assignments: JSON.stringify(assignments || {})
    });
  }

  async function registerDeviceGroupV20(role){
    const url = appsUrlV20();
    const groupId = groupIdV20();
    if(!url || !groupId) return null;
    const assignments = assignmentsV20();
    let assignedName = '';
    try{ assignedName = assignments && role ? (assignments[role] || '') : ''; }catch(_){}
    return jsonpV20(url, {
      action: 'registerDeviceGroup',
      deviceId: getDeviceIdV20(),
      groupId: groupId,
      groupName: groupId,
      role: role || '',
      assignedName: assignedName || ''
    });
  }

  function roleFromBody(){
    const r = document.body && document.body.dataset && document.body.dataset.role;
    if(r) return r;
    const path = location.pathname.split('/').pop() || '';
    const m = path.match(/^rolle-(.+?)\.html$/);
    return m ? m[1] : '';
  }

  document.addEventListener('DOMContentLoaded', function(){
    const assignBtn = document.getElementById('assignBtn');
    if(assignBtn && document.body && document.body.dataset.mode === 'roles'){
      assignBtn.addEventListener('click', function(){
        setTimeout(function(){
          try{
            const participants = (typeof loadObj === 'function') ? loadObj('participants_v2', []) : [];
            const assignments = assignmentsV20();
            if(assignments && Object.keys(assignments).length){
              registerGroupV20(participants, assignments).then(function(res){
                const status = document.getElementById('assignStatus');
                if(status && res && res.ok){
                  status.textContent = status.textContent + ' Gruppe wurde serverseitig registriert.';
                }
              }).catch(function(err){
                const status = document.getElementById('assignStatus');
                if(status) status.textContent = status.textContent + ' Hinweis: Gruppe konnte noch nicht serverseitig registriert werden.';
              });
            }
          }catch(_){}
        }, 120);
      }, true);
    }

    const role = roleFromBody();
    if(role){
      registerDeviceGroupV20(role).then(function(res){
        try{
          if(res && res.ok) localStorage.setItem('sv_device_group_registered_' + groupIdV20(), '1');
        }catch(_){}
      }).catch(function(){});
    }
  });

  window.registerGroupV20 = registerGroupV20;
  window.registerDeviceGroupV20 = registerDeviceGroupV20;
})();
