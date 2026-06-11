/* Canonical presentation renderer
   Ein gemeinsames Schema für Speichern und Anzeigen:
   - 1600x900 Designfläche
   - Elemente werden als IDs + x/y/w/h/rot/z/fontSize/color gespeichert
   - Sticker/Textboxen werden als Referenz + Parameter gespeichert, keine Base64-Bilder
*/
(function(){
  'use strict';
  const CANVAS_W = 1600, CANVAS_H = 900;
  const DEFAULT_SETTINGS = {
    heading:'#1e3a5f', text:'#0f172a', background:'#071323', slide:'#ffffff',
    slidePattern:'none', backgroundPattern:'none', slidePatternColor:'#dbeafe', backgroundPatternColor:'#1f2937'
  };
  const state = { rows:[], row:null, data:{}, cfg:null, slides:[], index:0 };
  const $ = id => document.getElementById(id);
  const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
  const isArr = Array.isArray;
  const clone = v => { try{return JSON.parse(JSON.stringify(v||{}));}catch(_){return {};}};
  const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const str = v => String(v ?? '').trim();
  const first = (...xs) => { for(const x of xs){ if(x!==undefined && x!==null && str(x)!=='') return x; } return ''; };
  const val = v => first(v,'—');
  function path(o,p){ try{return String(p).split('.').reduce((a,k)=>a&&a[k]!=null?a[k]:'',o)||'';}catch(_){return '';}}
  function readJson(v){ if(isObj(v)) return clone(v); if(typeof v !== 'string' || !v.trim()) return {}; try{return JSON.parse(v);}catch(_){return {};}}
  function deepMerge(a,b){ const out=clone(a); if(!isObj(b)) return out; Object.keys(b).forEach(k=>{ out[k]=isObj(out[k])&&isObj(b[k])?deepMerge(out[k],b[k]):clone(b[k]); }); return out; }
  function obj(...xs){ for(const x of xs){ if(isObj(x)) return x; } return {}; }
  function arr(...xs){ for(const x of xs){ if(isArr(x)) return x; } return []; }
  function pickObjMerge(...xs){ return Object.assign({}, ...xs.filter(isObj)); }
  function appsUrl(){ const c=window.SUPERVISION_CONFIG||window.SV_CONFIG||{}; return c.APPS_SCRIPT_URL||c.appsScriptUrl||window.APPS_SCRIPT_URL||''; }

  function jsonp(url, params){ return new Promise((resolve,reject)=>{
    const cb='presCb_'+Date.now()+'_'+Math.floor(Math.random()*1e9); const qs=new URLSearchParams(params||{}); qs.set('callback',cb); qs.set('_',Date.now());
    const s=document.createElement('script'); let done=false; const t=setTimeout(()=>finish(new Error('Apps-Script-Verbindung fehlgeschlagen.')),18000);
    function cleanup(){clearTimeout(t); try{delete window[cb];}catch(_){window[cb]=undefined;} if(s.parentNode) s.parentNode.removeChild(s);}
    function finish(e,d){ if(done)return; done=true; cleanup(); e?reject(e):resolve(d);}
    window[cb]=d=>finish(null,d); s.onerror=()=>finish(new Error('JSONP-Verbindung fehlgeschlagen.'));
    s.src=url+(url.includes('?')?'&':'?')+qs.toString(); document.body.appendChild(s);
  }); }
  async function loadRows(){ const url=appsUrl(); if(!url) throw new Error('Keine Apps-Script-URL in js/config.js gefunden.'); const q=new URLSearchParams(location.search); const groupId=q.get('g')||q.get('groupId')||q.get('token')||''; const res=await jsonp(url,{action:'list',groupId}); if(!res||res.ok===false) throw new Error((res&&res.error)||'Keine gültige Antwort aus Apps Script.'); return isArr(res.entries)?res.entries:[]; }
  function selectRow(rows){ const q=new URLSearchParams(location.search); const row=q.get('row')||q.get('id'); const idx=q.get('i'); const gid=q.get('g')||q.get('groupId')||q.get('token')||''; if(row){ const r=rows.find(x=>String(x.rowNumber||x.id||'')===String(row)); if(r)return r;} if(idx!==null&&rows[Number(idx)])return rows[Number(idx)]; if(gid){ const same=rows.filter(x=>String(x.groupId||path(x,'data.groupId')||'').trim()===gid.trim()); if(same.length)return same[same.length-1]; } return rows[rows.length-1]||null; }
  function rowData(row){ const d=clone(row&&row.data||{}); const raw=clone(d.raw||row.raw||{}); const merged=deepMerge(raw,d); merged.raw=raw; return merged; }

  function stripUnsupported(v){
    if(v==null) return v;
    if(typeof v==='string'){ if(/^data:image\//i.test(v)||(/base64,/i.test(v)&&v.length>5000)) return ''; return v.length>100000?v.slice(0,100000):v; }
    if(isArr(v)) return v.slice(0,500).map(stripUnsupported).filter(x=>x!==undefined);
    if(isObj(v)){ const o={}; Object.keys(v).forEach(k=>{ if(/backgroundImage|bgImage|imageData|dataUrl|base64|snapshot|history|undo|localStorage/i.test(k))return; o[k]=stripUnsupported(v[k]);}); return o; }
    return v;
  }
  function normSettings(s){ s=Object.assign({},DEFAULT_SETTINGS,s||{}); delete s.backgroundImage; return s; }
  function num(v,fb){ const n=Number(v); return Number.isFinite(n)?n:fb; }
  function clamp(n,a,b){ return Math.max(a,Math.min(b,n)); }
  function pctLayout(l, d){ l=Object.assign({},d,l||{}); return { x:clamp(num(l.x,d.x),-50,150), y:clamp(num(l.y,d.y),-50,150), w:clamp(num(l.w??l.width,d.w),1,180), h:clamp(num(l.h??l.height,d.h),1,180), rot:clamp(num(l.rot??l.rotation,0),-360,360), z:Math.round(clamp(num(l.z??l.zIndex,d.z||20),0,999)), fontSize:clamp(num(l.fontSize,d.fontSize||18),6,160), color:l.color||'' }; }
  function defaultLayout(type){
    if(type==='title')return{x:7,y:7,w:86,h:12,z:20,fontSize:56};
    if(type==='kicker')return{x:7,y:22,w:52,h:5,z:20,fontSize:13};
    if(type==='heading2')return{x:7,y:29,w:86,h:9,z:20,fontSize:46};
    if(type==='subtitle')return{x:7,y:22,w:86,h:10,z:20,fontSize:24};
    if(type==='table')return{x:7,y:43,w:86,h:34,z:20,fontSize:20};
    if(type==='note')return{x:7,y:82,w:86,h:6,z:20,fontSize:17};
    if(type==='thanks')return{x:8,y:30,w:84,h:34,z:20,fontSize:72};
    return{x:7,y:20,w:86,h:10,z:20,fontSize:20};
  }
  function dedupeText(v){const seen=new Set();return String(v==null?'':v).split(/\n+/).map(x=>x.trim()).filter(Boolean).filter(x=>{const k=x.toLowerCase(); if(seen.has(k))return false; seen.add(k); return true;}).join('\n');}
  function table(headers, rows){ return '<div class="table-wrap"><table><thead><tr>'+headers.map(h=>'<th>'+esc(h)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(c=>'<td>'+esc(val(c)).replace(/\n/g,'<br>')+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>'; }
  function time(v){ if(!v)return''; const s=String(v); if(/^\d{1,2}:\d{2}:\d{2}\s+\d{2}\.\d{2}\.\d{4}$/.test(s))return s; try{const d=new Date(v); if(isNaN(d))return s; return d.toLocaleString('de-DE',{hour:'2-digit',minute:'2-digit',second:'2-digit',day:'2-digit',month:'2-digit',year:'numeric'}).replace(',','');}catch(_){return s;} }
  function baseSlides(data, values){
    let a=data.assignments||{}; try{a=Object.assign({}, JSON.parse(localStorage.getItem('sv_role_names_v58')||'{}'), a||{});}catch(_){} const p2=data.p2||{}, p3=data.p3||{}, p4=data.p4||{}, p5=data.p5||{}, p6=data.p6||{};
    const groupName=first(values.groupName,data.groupName,state.row&&state.row.groupName,'Gruppe');
    const ts=time(first(values.timestamp,data.timestamp,data.timestampLocal,state.row&&state.row.timestamp,new Date().toISOString()));
    const sup=first(values.supervisor,a.supervisor), sl=first(values.schulleitung,a.schulleitung), la=first(values.lehrkraftA,a['lehrkraft-a'],a.lehrkraftA), lb=first(values.lehrkraftB,a['lehrkraft-b'],a.lehrkraftB), pr=first(values.protokoll,a.protokoll);
    return [
      {id:'s0',elements:[
        {id:'s0_title',type:'title',text:'Gruppenvorstellung'}, {id:'s0_kicker',type:'kicker',text:ts}, {id:'s0_groupName',type:'heading2',text:groupName},
        {id:'s0_table',type:'table',html:table(['Rolle','Name'],[['Supervisor*in',sup],['Schulleitung',sl],['Lehrkraft A',la],['Lehrkraft B',lb]].concat(pr?[['Protokoll',pr]]:[]))},
        {id:'s0_note',type:'note',text:'Simulation einer Gruppensupervision zum Teamteaching im Kontext ESE.'}
      ]},
      {id:'s1',elements:[
        {id:'s1_title',type:'title',text:'Problembeschreibung'}, {id:'s1_subtitle',type:'subtitle',text:'Die unterschiedlichen Perspektiven im Teamteaching-Konflikt werden sichtbar: Beobachtungen, Gefühle und Wünsche der Beteiligten.'},
        {id:'s1_table',type:'table',html:table(['Rolle','Probleme / Beobachtung','Gefühle','Wünsche'],[
          ['Schulleitung',first(values.p2slProblems,p2.slProbleme),first(values.p2slFeelings,p2.slGefuehle),first(values.p2slWishes,p2.slWuensche)],
          ['Lehrkraft A',first(values.p2aProblems,p2.aProbleme),first(values.p2aFeelings,p2.aGefuehle),first(values.p2aWishes,p2.aWuensche)],
          ['Lehrkraft B',first(values.p2bProblems,p2.bProbleme),first(values.p2bFeelings,p2.bGefuehle),first(values.p2bWishes,p2.bWuensche)]
        ])}
      ]},
      {id:'s2',elements:[
        {id:'s2_title',type:'title',text:'Zielformulierung'}, {id:'s2_subtitle',type:'subtitle',text:'Hier werden Einzelziele, Gemeinsamkeiten und die gemeinsame Zielvereinbarung zusammengeführt.'},
        {id:'s2_table',type:'table',html:table(['Bereich','Eintrag'],[['Ziel Schulleitung',first(values.p3zielSL,p3.zielSL)],['Ziel Lehrkraft A',first(values.p3zielA,p3.zielA)],['Ziel Lehrkraft B',first(values.p3zielB,p3.zielB)],['Gemeinsamkeiten',first(values.p3gemeinsam,p3.gemeinsamkeiten)],['Gemeinsame Zielvereinbarung',first(values.p3ziel,p3.gemeinsamesZiel)]])}
      ]},
      {id:'s3',elements:[
        {id:'s3_title',type:'title',text:'Vertiefte Problembearbeitung'}, {id:'s3_subtitle',type:'subtitle',text:'Diese Folie hält hilfreiche Kritik und Absprachen für die weitere Zusammenarbeit fest.'},
        {id:'s3_table',type:'table',html:table(['Aspekt','Ergebnis'],[['Hilfreiche Kritik',first(values.p4kritik,p4.kritik)],['Positive Rückmeldung zur Schulleitung',first(values.p4posSL,(p4.positivSL||p4.perspektiveSL))],['Positive Rückmeldung zu Lehrkraft A',first(values.p4posA,(p4.positivA||p4.perspektiveA))],['Positive Rückmeldung zu Lehrkraft B',first(values.p4posB,(p4.positivB||p4.perspektiveB))],['Absprachen zum weiteren Vorgehen',first(values.p4absprachen,p4.absprachen)]])}
      ]},
      {id:'s4',elements:[
        {id:'s4_title',type:'title',text:'Umsetzung'}, {id:'s4_subtitle',type:'subtitle',text:'Die Vereinbarung wird auf Zustimmung, Praxistauglichkeit und konkrete nächste Schritte hin gesichert.'},
        {id:'s4_table',type:'table',html:table(['Aspekt','Ergebnis'],[['Zustimmung zur Vereinbarung',dedupeText(first(values.p5zustimmung,p5.zustimmung))],['Einschätzung der Praxistauglichkeit',first(values.p6prax,p6.praxistauglichkeit)],['Unterstützung durch Schulleitung',first(values.p6support,p6.unterstuetzung)],['Erste konkrete Umsetzungsschritte',first(values.p6steps,p6.umsetzung)]])}
      ]},
      {id:'s5',elements:[{id:'s5_thanks',type:'thanks',html:'<h2>Vielen Dank fürs Zuhören!</h2><p>Raum für Rückfragen und gemeinsame Reflexion.</p>'}]}
    ];
  }
  function normalizeSticker(x,i){ if(!isObj(x))return null; const src=String(x.src||x.path||x.url||''); if(!src||/^data:image\//i.test(src))return null; const l=pctLayout(x,{x:60,y:14,w:22,h:22,z:110+i,fontSize:18}); return {id:x.id||('st_'+i),slide:num(x.slide??x.slideIndex,0),src,x:l.x,y:l.y,w:l.w,h:l.h,rot:l.rot,z:l.z}; }
  function normalizeExtra(x,i){ if(!isObj(x))return null; if(x.src||x.path||x.url)return normalizeSticker(x,i); const l=pctLayout(x,{x:10,y:70,w:25,h:8,z:100+i,fontSize:18}); return {id:x.id||('tx_'+i),slide:num(x.slide??x.slideIndex,0),type:'text',text:String(x.text||x.html||x.content||''),x:l.x,y:l.y,w:l.w,h:l.h,rot:l.rot,z:l.z,fontSize:l.fontSize,color:x.color||''}; }
  function normalizeConfig(data){
    const raw=data.raw||{};
    const presJson=readJson(data.presentationJson||raw.presentationJson||data.presentation_json||raw.presentation_json);
    const candidates=[presJson,data.presentationConfig,raw.presentationConfig,data.presentationV6,raw.presentationV6,data.presentationSync,raw.presentationSync].filter(isObj);
    let c={}; candidates.forEach(x=>{c=deepMerge(c,x);});
    const settings=normSettings(pickObjMerge(c.settings,c.presentationSettings,data.presentationSettings,raw.presentationSettings));
    const values=pickObjMerge(c.values,c.presentationValues,data.presentationValues,raw.presentationValues);
    const text=pickObjMerge(c.text,c.textOverrides,c.presentationTextOverrides,data.presentationTextOverrides,raw.presentationTextOverrides);
    const layout=pickObjMerge(c.stableLayout,c.layout,c.presentationLayout,data.presentationStableLayout,data.presentationLayout,raw.presentationStableLayout,raw.presentationLayout);
    const extras=arr(c.textboxes,c.extras,c.presentationExtras,data.presentationExtras,raw.presentationExtras).map(normalizeExtra).filter(Boolean).filter(x=>x.type==='text');
    const stickers=[...arr(c.stickers,c.presentationStickers,data.presentationStickers,raw.presentationStickers).map(normalizeSticker).filter(Boolean), ...arr(c.textboxes,c.extras,c.presentationExtras,data.presentationExtras,raw.presentationExtras).map(normalizeExtra).filter(Boolean).filter(x=>x.src)];
    const slides=baseSlides(data,values);
    slides.forEach(sl=>{
      sl.elements=sl.elements.map(e=>{
        const l=pctLayout(layout[e.id], defaultLayout(e.type));
        const over=text[e.id+'__text'];
        const out=Object.assign({},e,l);
        if(over!==undefined && e.type!=='table' && e.type!=='thanks') out.text=String(over);
        return out;
      });
      const idx=Number(sl.id.replace('s',''))||0;
      sl.textboxes=extras.filter(x=>Number(x.slide)===idx);
      sl.stickers=stickers.filter(x=>Number(x.slide)===idx);
    });
    return stripUnsupported({version:c.version||8,settings,values,text,layout,slides});
  }
  function pattern(kind,color){ const c=color||'#dbeafe'; switch(String(kind||'none')){case'dots':return{img:`radial-gradient(${c} 2px, transparent 2.1px)`,size:'28px 28px'};case'grid':return{img:`linear-gradient(${c} 1px, transparent 1px), linear-gradient(90deg, ${c} 1px, transparent 1px)`,size:'32px 32px'};case'diagonal':return{img:`repeating-linear-gradient(135deg, transparent 0 16px, ${c} 16px 18px)`,size:'32px 32px'};case'waves':return{img:`radial-gradient(ellipse at top, transparent 0 55%, ${c} 56% 61%, transparent 62%), radial-gradient(ellipse at bottom, transparent 0 55%, ${c} 56% 61%, transparent 62%)`,size:'58px 32px'};default:return{img:'none',size:'24px 24px'};} }
  function applyTheme(){ const s=normSettings(state.cfg&&state.cfg.settings); const bp=pattern(s.backgroundPattern,s.backgroundPatternColor); document.body.style.backgroundColor=s.background; document.body.style.backgroundImage=bp.img; document.body.style.backgroundSize=bp.size; const deck=$('deck'); const sp=pattern(s.slidePattern,s.slidePatternColor); deck.style.backgroundColor=s.slide; deck.style.backgroundImage=sp.img; deck.style.backgroundSize=sp.size; deck.style.color=s.text; }
  function fit(){ const deck=$('deck'); const landscape=innerWidth>innerHeight; const top=landscape&&innerWidth<900?42:52; const bottom=landscape&&innerWidth<900?18:56; const side=landscape&&innerWidth<900?140:72; const availW=Math.max(220,innerWidth-side); const availH=Math.max(160,innerHeight-top-bottom-24); const scale=Math.min(availW/CANVAS_W,availH/CANVAS_H); deck.style.transform=`translate(-50%,-50%) scale(${scale})`; }
  function renderElement(layer,e,settings){ const el=document.createElement('div'); el.className='el '+e.type; el.dataset.id=e.id; el.style.left=e.x+'%'; el.style.top=e.y+'%'; el.style.width=e.w+'%'; el.style.height=e.h+'%'; el.style.zIndex=String(e.z); el.style.transform=`rotate(${e.rot||0}deg)`; el.style.fontSize=(e.fontSize||20)+'px'; el.style.color=e.color||(e.type==='title'?settings.heading:settings.text); if(e.type==='table'||e.type==='thanks') el.innerHTML=e.html||''; else el.textContent=e.text||''; if(e.type==='table'){ el.querySelectorAll('table,th,td').forEach(n=>{n.style.color=e.color||settings.text;}); } layer.appendChild(el); }
  function renderExtras(layer,slide,settings){ (slide.textboxes||[]).forEach(x=>{ const el=document.createElement('div'); el.className='el textbox'; el.textContent=x.text||''; el.style.left=x.x+'%'; el.style.top=x.y+'%'; el.style.width=x.w+'%'; el.style.height=x.h+'%'; el.style.zIndex=String(x.z); el.style.transform=`rotate(${x.rot||0}deg)`; el.style.fontSize=(x.fontSize||18)+'px'; el.style.color=x.color||settings.text; el.style.whiteSpace='pre-wrap'; layer.appendChild(el); }); (slide.stickers||[]).forEach(x=>{ const img=document.createElement('img'); img.className='sticker'; img.src=x.src; img.alt=''; img.style.left=x.x+'%'; img.style.top=x.y+'%'; img.style.width=x.w+'%'; img.style.height=x.h+'%'; img.style.zIndex=String(x.z); img.style.transform=`rotate(${x.rot||0}deg)`; layer.appendChild(img); }); }
  function render(){ applyTheme(); fit(); const layer=$('slideLayer'); layer.innerHTML=''; const slide=state.cfg.slides[state.index]; const settings=normSettings(state.cfg.settings); slide.elements.forEach(e=>renderElement(layer,e,settings)); renderExtras(layer,slide,settings); $('count').textContent=(state.index+1)+' / '+state.cfg.slides.length; $('prevBtn').disabled=state.index<=0; $('nextBtn').disabled=state.index>=state.cfg.slides.length-1; }
  function move(d){ const ni=clamp(state.index+d,0,state.cfg.slides.length-1); if(ni===state.index)return; state.index=ni; render(); }
  async function init(){ const status=$('status'); try{ state.rows=await loadRows(); state.row=selectRow(state.rows); if(!state.row) throw new Error('Kein Gruppenergebnis gefunden.'); state.data=rowData(state.row); state.cfg=normalizeConfig(state.data); if(!state.cfg.slides||!state.cfg.slides.length) throw new Error('Keine Präsentationsdaten gefunden.'); status.hidden=true; render(); }catch(e){ status.hidden=false; status.className='status warn'; status.textContent=e&&e.message?e.message:'Präsentation konnte nicht geladen werden.'; }
    $('exitBtn').onclick=()=>{location.href='ergebnisse.html'}; $('fullBtn').onclick=()=>{const r=document.documentElement;if(!document.fullscreenElement&&r.requestFullscreen)r.requestFullscreen().catch(()=>{});else if(document.exitFullscreen)document.exitFullscreen().catch(()=>{});}; $('prevBtn').onclick=()=>move(-1); $('nextBtn').onclick=()=>move(1); addEventListener('resize',fit); document.addEventListener('keydown',e=>{ if(e.key==='ArrowRight'||e.key===' '){e.preventDefault();move(1)} if(e.key==='ArrowLeft'){e.preventDefault();move(-1)} if(e.key==='Escape'){location.href='ergebnisse.html'} }); }
  document.addEventListener('DOMContentLoaded',init);
})();
