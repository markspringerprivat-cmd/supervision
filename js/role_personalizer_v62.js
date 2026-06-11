
(function(){
  'use strict';
  const ROLE_LABELS={
    supervisor:'Supervisor*in',
    schulleitung:'Schulleitung',
    'lehrkraft-a':'Lehrkraft A',
    'lehrkraft-b':'Lehrkraft B',
    protokoll:'Protokoll'
  };
  const ROLE_COLORS={
    supervisor:'#2f6fb0',
    schulleitung:'#2f9e44',
    'lehrkraft-a':'#d62828',
    'lehrkraft-b':'#d62828',
    protokoll:'#d99000'
  };
  const ROLE_ORDER=['supervisor','schulleitung','lehrkraft-a','lehrkraft-b','protokoll'];
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function groupId(){
    try{
      const p=new URLSearchParams(location.search);
      return p.get('g')||p.get('groupId')||localStorage.getItem('sv_current_group')||localStorage.getItem('sv_group_id')||'';
    }catch(_){return localStorage.getItem('sv_current_group')||'';}
  }
  function appUrl(){try{if(typeof getAppsScriptUrl==='function')return getAppsScriptUrl()}catch(_){}return (window.SUPERVISION_CONFIG&&window.SUPERVISION_CONFIG.APPS_SCRIPT_URL)||''}
  function jsonp(params){
    const url=appUrl();
    return new Promise((resolve,reject)=>{
      if(!url){reject(new Error('Keine Apps-Script-URL gefunden.'));return;}
      const cb='roleNameCb_'+Date.now()+'_'+Math.floor(Math.random()*1e9);
      const qs=new URLSearchParams(params||{});
      qs.set('callback',cb); qs.set('_',Date.now());
      const s=document.createElement('script'); let done=false;
      window[cb]=data=>{done=true;cleanup();resolve(data)};
      function cleanup(){try{delete window[cb]}catch(_){} if(s.parentNode)s.parentNode.removeChild(s)}
      s.onerror=()=>{if(!done){cleanup();reject(new Error('Server nicht erreichbar.'))}};
      s.src=url+(url.includes('?')?'&':'?')+qs.toString();
      document.body.appendChild(s);
      setTimeout(()=>{if(!done){cleanup();reject(new Error('Zeitüberschreitung.'))}},10000);
    });
  }
  function fromLocal(){
    let a={};
    try{a=JSON.parse(localStorage.getItem('sv_role_names_v58')||'{}')||{};}catch(_){}
    try{
      const assignments=JSON.parse(localStorage.getItem('sv_default_assignments')||localStorage.getItem('sv_'+groupId()+'_assignments')||'{}')||{};
      Object.keys(assignments).forEach(k=>{if(!a[k])a[k]=assignments[k];});
    }catch(_){}
    return a;
  }
  function store(map){
    try{localStorage.setItem('sv_role_names_v58',JSON.stringify(map||{}));}catch(_){}
    window.SV_ROLE_NAMES=map||{};
  }
  async function loadRoleNames(){
    const gid=groupId();
    let map=fromLocal();
    if(gid){
      try{
        const res=await jsonp({action:'listGroupMembers',groupId:gid});
        if(res&&res.ok&&Array.isArray(res.members)){
          res.members.forEach(m=>{if(m&&m.role&&m.name)map[m.role]=m.name;});
        }
      }catch(_){}
    }
    store(map);
    return map;
  }
  function displayFor(role,map,short){
    const name=map&&map[role];
    if(name) return short ? name : (name+' ('+(ROLE_LABELS[role]||role)+')');
    return ROLE_LABELS[role]||role;
  }
  function roleSpan(role, text){
    const color=ROLE_COLORS[role]||'#24456b';
    return `<span class="role-text role-text-${role}" style="color:${color};font-weight:800">${esc(text)}</span>`;
  }
  function replaceInTextNode(node,map,seen){
    const text=node.nodeValue;
    if(!text || !Object.keys(ROLE_LABELS).some(r=>text.includes(ROLE_LABELS[r]))) return;
    const parent=node.parentNode;
    if(!parent || ['SCRIPT','STYLE','TEXTAREA','INPUT','SELECT','OPTION'].includes(parent.nodeName)) return;
    let html=esc(text);
    ROLE_ORDER.forEach(role=>{
      const label=ROLE_LABELS[role];
      const re=new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g');
      html=html.replace(re,()=>{
        const replacement=displayFor(role,map,seen[role]);
        seen[role]=true;
        return roleSpan(role,replacement);
      });
    });
    const span=document.createElement('span');
    span.innerHTML=html;
    parent.replaceChild(span,node);
  }
  function personalizeStaticText(map){
    const seen={};
    const root=document.querySelector('main')||document.body; if(!root)return; const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{
      acceptNode(n){
        if(!n.nodeValue || !/Supervisor|Schulleitung|Lehrkraft A|Lehrkraft B|Protokoll/.test(n.nodeValue)) return NodeFilter.FILTER_REJECT;
        const p=n.parentNode;
        if(!p || p.closest && p.closest('.no-role-personalize,.qr,.role-card-qr')) return NodeFilter.FILTER_REJECT;
        if(['SCRIPT','STYLE','TEXTAREA','INPUT','SELECT','OPTION'].includes(p.nodeName)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(n=>replaceInTextNode(n,map,seen));
  }
  function personalizeRoleCard(map){
    const role=document.body&&document.body.dataset&&document.body.dataset.role;
    if(!role) return;
    const assigned=map[role]||'';
    document.querySelectorAll('[data-assigned-name-for="'+role+'"]').forEach(el=>{ el.innerHTML = assigned ? esc(assigned) : '<span class="sv-spinner tiny"></span> wird geladen / nicht gesetzt'; });
    const pill=document.querySelector('.role-name-pill');
    if(pill) pill.innerHTML=roleSpan(role,ROLE_LABELS[role]||role);
    document.querySelectorAll('#roleCard h2').forEach(h=>{
      h.innerHTML = 'Rollenkarte: ' + roleSpan(role, ROLE_LABELS[role] || role);
    });
  }
  function patchPresentationValues(map){
    try{
      const gid=groupId()||'default';
      const key='sv_'+gid+'_presentation_v7_state';
      const st=JSON.parse(localStorage.getItem(key)||'null');
      if(st&&st.values){
        if(map.supervisor) st.values.supervisor=map.supervisor;
        if(map.schulleitung) st.values.schulleitung=map.schulleitung;
        if(map['lehrkraft-a']) st.values.lehrkraftA=map['lehrkraft-a'];
        if(map['lehrkraft-b']) st.values.lehrkraftB=map['lehrkraft-b'];
        if(map.protokoll) st.values.protokoll=map.protokoll;
        localStorage.setItem(key,JSON.stringify(st));
      }
    }catch(_){}
  }
  function apply(map){
    if(!document.body)return;
    personalizeRoleCard(map);
    personalizeStaticText(map);
    patchPresentationValues(map);
  }
  document.addEventListener('DOMContentLoaded',()=>{
    loadRoleNames().then(apply).catch(()=>apply(fromLocal()));
    const mo=new MutationObserver(()=>{
      const map=window.SV_ROLE_NAMES||fromLocal();
      personalizeRoleCard(map);
    });
    try{mo.observe(document.body,{childList:true,subtree:true});}catch(_){}
  });
})();
