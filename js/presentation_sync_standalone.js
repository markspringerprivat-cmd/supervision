/*
  Standalone-Präsentationsrenderer v2
  - lädt Gruppendaten direkt aus Apps Script
  - nutzt ausschließlich strukturierte, übertragbare Präsentationsdaten
  - rekonstruiert Layout, Farben, Muster, Texte, Textboxen und Sticker aus Google Sheet
*/
(function(){
  'use strict';

  const DEFAULT_SETTINGS = {
    heading: '#1e3a5f',
    text: '#0f172a',
    background: '#071323',
    slide: '#ffffff',
    slidePattern: 'none',
    backgroundPattern: 'none',
    slidePatternColor: '#dbeafe',
    backgroundPatternColor: '#1f2937'
  };

  const state = { rows: [], row: null, data: {}, cfg: null, slides: [], index: 0 };

  function $(id){ return document.getElementById(id); }
  function isObj(v){ return !!v && typeof v === 'object' && !Array.isArray(v); }
  function isArr(v){ return Array.isArray(v); }
  function clone(v){ try { return JSON.parse(JSON.stringify(v || {})); } catch(_) { return {}; } }
  function esc(v){ return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }
  function cleanText(v){ return String(v ?? '').trim(); }
  function val(v){ const s = cleanText(v); return s ? s : '—'; }
  function first(){ for (let i=0;i<arguments.length;i++){ const v=arguments[i]; if (v!==undefined && v!==null && cleanText(v)!=='') return v; } return ''; }
  function path(obj, p){
    if (!obj || !p) return '';
    return String(p).split('.').reduce((a,k)=> (a && a[k] !== undefined && a[k] !== null) ? a[k] : '', obj);
  }
  function readJson(v){ if (isObj(v)) return clone(v); if (!v || typeof v !== 'string') return {}; try { return JSON.parse(v); } catch(_) { return {}; } }
  function merge(){ const out={}; for (const o of arguments){ if (!isObj(o)) continue; Object.keys(o).forEach(k => { if (o[k] !== undefined && o[k] !== null && o[k] !== '') out[k]=o[k]; }); } return out; }
  function mergeDeep(a,b){
    const out = clone(a);
    if (!isObj(b)) return out;
    Object.keys(b).forEach(k => {
      if (isObj(out[k]) && isObj(b[k])) out[k] = mergeDeep(out[k], b[k]);
      else out[k] = clone(b[k]);
    });
    return out;
  }

  function getAppsScriptUrl(){
    const cfg = window.SUPERVISION_CONFIG || window.SV_CONFIG || {};
    return cfg.APPS_SCRIPT_URL || cfg.appsScriptUrl || window.APPS_SCRIPT_URL || '';
  }

  function jsonp(url, params){
    return new Promise((resolve, reject)=>{
      const cb = 'svPresCb_' + Date.now() + '_' + Math.floor(Math.random()*1e9);
      const qs = new URLSearchParams(params || {});
      qs.set('callback', cb); qs.set('_', Date.now());
      const script = document.createElement('script');
      let done = false;
      const timer = setTimeout(()=>finish(new Error('Verbindung zum Apps Script fehlgeschlagen.')), 18000);
      function cleanup(){ clearTimeout(timer); try{ delete window[cb]; }catch(_){ window[cb]=undefined; } if (script.parentNode) script.parentNode.removeChild(script); }
      function finish(err, data){ if (done) return; done=true; cleanup(); err ? reject(err) : resolve(data); }
      window[cb] = data => finish(null, data);
      script.onerror = () => finish(new Error('JSONP-Verbindung fehlgeschlagen.'));
      script.src = url + (url.includes('?') ? '&' : '?') + qs.toString();
      document.body.appendChild(script);
    });
  }

  async function loadRows(){
    const url = getAppsScriptUrl();
    if (!url) throw new Error('Keine Apps-Script-URL in js/config.js eingetragen.');
    const q = new URLSearchParams(location.search);
    const groupId = q.get('g') || q.get('groupId') || q.get('token') || '';
    const res = await jsonp(url, { action:'list', groupId });
    if (!res || res.ok === false) throw new Error((res && res.error) || 'Apps Script hat keine gültige Antwort geliefert.');
    return isArr(res.entries) ? res.entries : [];
  }

  function selectRow(rows){
    const q = new URLSearchParams(location.search);
    const rowId = q.get('row') || q.get('id');
    const idx = q.get('i');
    const groupId = q.get('g') || q.get('groupId') || q.get('token') || '';
    if (rowId) {
      const byRow = rows.find(r => String(r.rowNumber || r.id || '') === String(rowId));
      if (byRow) return byRow;
    }
    if (idx !== null && rows[Number(idx)]) return rows[Number(idx)];
    if (groupId) {
      const same = rows.filter(r => String(r.groupId || path(r,'data.groupId') || '').trim() === String(groupId).trim());
      if (same.length) return same[same.length-1];
    }
    return rows[rows.length-1] || null;
  }

  function stripUnsupported(v){
    if (v == null) return v;
    if (typeof v === 'string') {
      if (/^data:image\//i.test(v)) return '';
      if (/base64,/i.test(v) && v.length > 5000) return '';
      return v.length > 100000 ? v.slice(0,100000) : v;
    }
    if (isArr(v)) return v.slice(0,500).map(stripUnsupported).filter(x => x !== undefined);
    if (isObj(v)) {
      const o = {};
      Object.keys(v).forEach(k => {
        if (/backgroundImage|bgImage|imageData|dataUrl|base64|snapshot|history|undo|localStorage/i.test(k)) return;
        o[k] = stripUnsupported(v[k]);
      });
      return o;
    }
    return v;
  }

  function mergeRowData(row){
    const d = clone(row && row.data || {});
    const raw = clone(d.raw || row.raw || {});
    const out = mergeDeep(raw, d);
    out.raw = raw;
    return out;
  }

  function asArray(){ for (const v of arguments){ if (isArr(v)) return v; } return []; }
  function asObj(){ for (const v of arguments){ if (isObj(v)) return v; } return {}; }

  function normalizeConfig(data){
    const raw = data.raw || {};
    const directPresentationJson = readJson(data.presentationJson || raw.presentationJson || data.presentation_json || raw.presentation_json);
    const candidates = [
      data.presentationConfig,
      raw.presentationConfig,
      data.presentationV6,
      raw.presentationV6,
      directPresentationJson,
      data.presentationSync,
      raw.presentationSync
    ].filter(isObj);

    let cfg = { version: 7, settings:{}, values:{}, text:{}, textOverrides:{}, layout:{}, stableLayout:{}, textboxes:[], extras:[], stickers:[] };
    candidates.forEach(c => { cfg = mergeDeep(cfg, c); });

    const settings = merge(
      DEFAULT_SETTINGS,
      asObj(cfg.settings, cfg.presentationSettings),
      asObj(data.presentationSettings, raw.presentationSettings)
    );
    delete settings.backgroundImage;

    const text = merge(
      asObj(cfg.text, cfg.textOverrides, cfg.presentationTextOverrides),
      asObj(data.presentationTextOverrides, raw.presentationTextOverrides)
    );

    const layout = merge(
      asObj(cfg.layout, cfg.presentationLayout),
      asObj(data.presentationLayout, raw.presentationLayout)
    );

    const stableLayout = merge(
      asObj(cfg.stableLayout, cfg.presentationStableLayout),
      asObj(data.presentationStableLayout, raw.presentationStableLayout)
    );

    const values = merge(
      asObj(cfg.values, cfg.presentationValues),
      asObj(data.presentationValues, raw.presentationValues)
    );

    const extras = asArray(cfg.textboxes, cfg.extras, cfg.presentationExtras, data.presentationExtras, raw.presentationExtras);
    const stickers = asArray(cfg.stickers, cfg.presentationStickers, data.presentationStickers, raw.presentationStickers);

    return stripUnsupported({
      version: cfg.version || 7,
      settings,
      values,
      text,
      textOverrides: text,
      layout,
      stableLayout,
      extras,
      textboxes: extras,
      stickers
    });
  }

  function formatTimestamp(v){
    if (!v) return '';
    const s = String(v);
    if (/^\d{1,2}:\d{2}:\d{2}\s+\d{2}\.\d{2}\.\d{4}$/.test(s)) return s;
    try {
      const d = new Date(v);
      if (isNaN(d.getTime())) return s;
      return d.toLocaleString('de-DE', {hour:'2-digit', minute:'2-digit', second:'2-digit', day:'2-digit', month:'2-digit', year:'numeric'}).replace(',', '');
    } catch(_) { return s; }
  }

  function pattern(kind, color){
    const c = color || '#dbeafe';
    switch(String(kind || 'none')){
      case 'dots': return { image:`radial-gradient(${c} 1.5px, transparent 1.6px)`, size:'20px 20px' };
      case 'grid': return { image:`linear-gradient(${c} 1px, transparent 1px), linear-gradient(90deg, ${c} 1px, transparent 1px)`, size:'30px 30px' };
      case 'diagonal': return { image:`repeating-linear-gradient(135deg, transparent 0 13px, ${c} 13px 15px)`, size:'28px 28px' };
      case 'waves': return { image:`radial-gradient(ellipse at top, transparent 0 55%, ${c} 56% 61%, transparent 62%), radial-gradient(ellipse at bottom, transparent 0 55%, ${c} 56% 61%, transparent 62%)`, size:'52px 28px' };
      default: return { image:'none', size:'24px 24px' };
    }
  }

  function applyTheme(){
    const s = merge(DEFAULT_SETTINGS, state.cfg && state.cfg.settings || {});
    const bgp = pattern(s.backgroundPattern, s.backgroundPatternColor);
    document.body.style.backgroundColor = s.background;
    document.body.style.backgroundImage = bgp.image;
    document.body.style.backgroundSize = bgp.size;
    document.documentElement.style.setProperty('--ps-heading', s.heading);
    document.documentElement.style.setProperty('--ps-text', s.text);
    document.documentElement.style.setProperty('--ps-slide', s.slide);
    document.documentElement.style.setProperty('--ps-bg', s.background);
  }

  function dedupeText(v){const seen=new Set();return String(v==null?'':v).split(/\n+/).map(x=>x.trim()).filter(Boolean).filter(x=>{const k=x.toLowerCase(); if(seen.has(k))return false; seen.add(k); return true;}).join('\n');}
  function table(headers, rows){
    return '<div class="ps-table-wrap"><table class="ps-table"><thead><tr>' + headers.map(h=>'<th>'+esc(h)+'</th>').join('') + '</tr></thead><tbody>' + rows.map(r=>'<tr>'+r.map(c=>'<td>'+esc(val(c)).replace(/\n/g,'<br>')+'</td>').join('')+'</tr>').join('') + '</tbody></table></div>';
  }

  function buildSlides(){
    const d = state.data, v = state.cfg.values || {}; let a = d.assignments || {}; try{a=Object.assign({}, JSON.parse(localStorage.getItem('sv_role_names_v58')||'{}'), a||{});}catch(_){}
    const p2=d.p2||{}, p3=d.p3||{}, p4=d.p4||{}, p5=d.p5||{}, p6=d.p6||{};
    const groupName = first(v.groupName, d.groupName, state.row && state.row.groupName, 'Gruppe');
    const timestamp = formatTimestamp(first(v.timestamp, d.timestamp, d.timestampLocal, state.row && state.row.timestamp, new Date().toISOString()));
    const supervisor = first(v.supervisor, a.supervisor);
    const sl = first(v.schulleitung, a.schulleitung);
    const la = first(v.lehrkraftA, a['lehrkraft-a'], a.lehrkraftA);
    const lb = first(v.lehrkraftB, a['lehrkraft-b'], a.lehrkraftB);
    const pr = first(v.protokoll, a.protokoll);
    return [
      {id:'s0', parts:[
        {id:'s0_title', type:'title', html:'Gruppenvorstellung'},
        {id:'s0_kicker', type:'kicker', html:timestamp},
        {id:'s0_groupName', type:'heading2', html:groupName},
        {id:'s0_table', type:'table', html:table(['Rolle','Name'], [['Supervisor*in',supervisor],['Schulleitung',sl],['Lehrkraft A',la],['Lehrkraft B',lb],['Protokoll',pr]])},
        {id:'s0_note', type:'note', html:'Simulation einer Gruppensupervision zum Teamteaching im Kontext ESE.'}
      ]},
      {id:'s1', parts:[
        {id:'s1_title', type:'title', html:'Problembeschreibung'},
        {id:'s1_subtitle', type:'subtitle', html:'Diese Folie bündelt die individuellen Sichtweisen der Beteiligten: Beobachtungen bzw. Probleme, Gefühle und Wünsche.'},
        {id:'s1_table', type:'table', html:table(['Rolle','Probleme / Beobachtung','Gefühle','Wünsche'], [
          ['Schulleitung', first(v.p2slProblems,p2.slProbleme,p2.slProblem), first(v.p2slFeelings,p2.slGefuehle), first(v.p2slWishes,p2.slWuensche)],
          ['Lehrkraft A', first(v.p2aProblems,p2.aProbleme,p2.aPerspektive), first(v.p2aFeelings,p2.aGefuehle), first(v.p2aWishes,p2.aWuensche)],
          ['Lehrkraft B', first(v.p2bProblems,p2.bProbleme,p2.bPerspektive), first(v.p2bFeelings,p2.bGefuehle), first(v.p2bWishes,p2.bWuensche)]
        ])}
      ]},
      {id:'s2', parts:[
        {id:'s2_title', type:'title', html:'Zielformulierung'},
        {id:'s2_subtitle', type:'subtitle', html:'Hier werden Einzelziele, Gemeinsamkeiten und die gemeinsame Zielvereinbarung zusammengeführt.'},
        {id:'s2_table', type:'table', html:table(['Bereich','Eintrag'], [
          ['Ziel Schulleitung', first(v.p3zielSL,p3.zielSL)], ['Ziel Lehrkraft A', first(v.p3zielA,p3.zielA)], ['Ziel Lehrkraft B', first(v.p3zielB,p3.zielB)], ['Gemeinsamkeiten', first(v.p3gemeinsam,p3.gemeinsamkeiten)], ['Gemeinsame Zielvereinbarung', first(v.p3ziel,p3.gemeinsamesZiel,p3.gemeinsameZielformulierung)]
        ])}
      ]},
      {id:'s3', parts:[
        {id:'s3_title', type:'title', html:'Vertiefte Problembearbeitung'},
        {id:'s3_subtitle', type:'subtitle', html:'Diese Folie hält hilfreiche Kritik und Absprachen für die weitere Zusammenarbeit fest.'},
        {id:'s3_table', type:'table', html:table(['Aspekt','Ergebnis'], [['Hilfreiche Kritik', first(v.p4kritik,p4.kritik)], ['Absprachen zum weiteren Vorgehen', first(v.p4absprachen,p4.absprachen,p4.weiteresVorgehen)]])}
      ]},
      {id:'s4', parts:[
        {id:'s4_title', type:'title', html:'Umsetzung'},
        {id:'s4_subtitle', type:'subtitle', html:'Diese Folie zeigt Zustimmung, Praxistauglichkeit und konkrete Schritte zur Umsetzung.'},
        {id:'s4_table', type:'table', html:table(['Aspekt','Ergebnis'], [
          ['Zustimmung zur Vereinbarung', dedupeText(first(v.p5zustimmung,p5.zustimmung))], ['Einschätzung der Praxistauglichkeit', first(v.p6prax,p6.praxistauglichkeit,p6.einschaetzung)], ['Unterstützung durch Schulleitung', first(v.p6support,p6.unterstuetzung)], ['Erste konkrete Umsetzungsschritte', first(v.p6steps,p6.umsetzung,p6.konkreteUmsetzungsschritte)]
        ])}
      ]},
      {id:'s5', parts:[ {id:'s5_thanks', type:'thanks', html:'<h2>Vielen Dank fürs Zuhören!</h2><p>Raum für Rückfragen und gemeinsame Reflexion.</p>'} ]}
    ];
  }

  function defaultLayout(id, type){
    if (type === 'title') return {x:7,y:7,w:86,h:12,z:20,fontSize:48,rot:0};
    if (type === 'kicker') return {x:7,y:22,w:52,h:5,z:20,fontSize:13,rot:0};
    if (type === 'heading2') return {x:7,y:29,w:86,h:9,z:20,fontSize:38,rot:0};
    if (type === 'subtitle') return {x:7,y:22,w:86,h:10,z:20,fontSize:20,rot:0};
    if (type === 'table') return {x:7,y:43,w:86,h:34,z:20,fontSize:18,rot:0};
    if (type === 'note') return {x:7,y:82,w:86,h:6,z:20,fontSize:16,rot:0};
    if (type === 'thanks') return {x:8,y:30,w:84,h:34,z:20,fontSize:54,rot:0};
    return {x:7,y:20,w:86,h:10,z:20,fontSize:18,rot:0};
  }
  function number(v, fallback){ const n = Number(v); return isFinite(n) ? n : fallback; }
  function clamp(n,min,max){ return Math.min(max, Math.max(min, n)); }
  function normalizeLayout(l, id, type){
    const d = defaultLayout(id, type);
    const out = merge(d, isObj(l) ? l : {});
    out.x = clamp(number(out.x, d.x), -50, 150);
    out.y = clamp(number(out.y, d.y), -50, 150);
    out.w = clamp(number(out.w, d.w), 1, 180);
    out.h = clamp(number(out.h, d.h), 1, 180);
    out.z = Math.round(clamp(number(out.z, d.z), 0, 999));
    out.rot = clamp(number(out.rot, d.rot || 0), -360, 360);
    out.fontSize = clamp(number(out.fontSize, d.fontSize), 6, 120);
    return out;
  }

  function getLayout(id, type){
    const l1 = state.cfg.stableLayout || {};
    const l2 = state.cfg.layout || {};
    return normalizeLayout(merge(l1[id], l2[id]), id, type);
  }

  function applyElementStyle(el, part){
    const s = merge(DEFAULT_SETTINGS, state.cfg.settings || {});
    const l = getLayout(part.id, part.type);
    el.style.position = 'absolute';
    el.style.left = l.x + '%'; el.style.top = l.y + '%';
    el.style.width = l.w + '%'; el.style.height = l.h + '%';
    el.style.zIndex = String(l.z);
    el.style.transformOrigin = 'center center';
    el.style.transform = 'rotate(' + l.rot + 'deg)';
    el.style.fontSize = l.fontSize + 'px';
    el.style.color = l.color || (part.type === 'title' ? s.heading : s.text);
    if (part.type === 'table') {
      el.querySelectorAll('table,th,td,tr,thead,tbody').forEach(n => { n.style.color = l.color || s.text; });
    }
  }

  function renderSlide(){
    applyTheme();
    const slide = $('presentationSlide');
    const counter = $('presentationCounter');
    if (!slide) return;
    const s = merge(DEFAULT_SETTINGS, state.cfg.settings || {});
    const sp = pattern(s.slidePattern, s.slidePatternColor);
    slide.style.backgroundColor = s.slide;
    slide.style.backgroundImage = sp.image;
    slide.style.backgroundSize = sp.size;
    slide.innerHTML = '<div class="ps-inner"></div>';
    const inner = slide.querySelector('.ps-inner');
    const item = state.slides[state.index];
    item.parts.forEach(part => {
      const el = document.createElement('div');
      el.className = 'ps-el ps-' + part.type;
      el.dataset.syncId = part.id;
      const override = state.cfg.text && state.cfg.text[part.id + '__text'];
      if (part.type === 'table' || part.type === 'thanks') el.innerHTML = part.html;
      else el.textContent = override !== undefined ? String(override) : String(part.html || '');
      inner.appendChild(el);
      applyElementStyle(el, part);
    });
    renderExtras(inner);
    renderStickers(inner);
    if (counter) counter.textContent = (state.index+1) + ' / ' + state.slides.length;
    const prev=$('presentationPrevBtn'), next=$('presentationNextBtn');
    if (prev) prev.disabled = state.index <= 0;
    if (next) next.disabled = state.index >= state.slides.length - 1;
  }

  function renderExtras(inner){
    (state.cfg.extras || state.cfg.textboxes || []).filter(x => Number(x.slide || 0) === state.index).forEach((x,n)=>{
      const el=document.createElement('div');
      el.className='ps-extra';
      el.textContent=String(x.text || x.html || '');
      const l=normalizeLayout(x, 'extra'+n, 'extra');
      el.style.left=l.x+'%'; el.style.top=l.y+'%'; el.style.width=l.w+'%'; el.style.height=l.h+'%';
      el.style.zIndex=String(l.z || 100+n); el.style.transform='rotate('+l.rot+'deg)';
      el.style.fontSize=l.fontSize+'px'; el.style.color=x.color || (state.cfg.settings && state.cfg.settings.text) || DEFAULT_SETTINGS.text;
      inner.appendChild(el);
    });
  }

  function renderStickers(inner){
    (state.cfg.stickers || []).filter(x => Number(x.slide || 0) === state.index).forEach((x,n)=>{
      const src = String(x.src || '');
      if (!src || /^data:image\//i.test(src)) return;
      const img=document.createElement('img');
      img.className='ps-sticker'; img.src=src; img.alt='';
      const l=normalizeLayout(x, 'sticker'+n, 'sticker');
      img.style.left=l.x+'%'; img.style.top=l.y+'%'; img.style.width=l.w+'%'; img.style.height=l.h+'%';
      img.style.zIndex=String(l.z || 110+n); img.style.transform='rotate('+l.rot+'deg)';
      inner.appendChild(img);
    });
  }

  function move(delta){
    const next = clamp(state.index + delta, 0, state.slides.length - 1);
    if (next === state.index) return;
    state.index = next; renderSlide();
  }

  async function init(){
    const status = $('presentationStatus');
    try {
      if (status) { status.hidden=false; status.textContent='Präsentation wird geladen …'; }
      state.rows = await loadRows();
      state.row = selectRow(state.rows);
      if (!state.row) throw new Error('Kein Gruppenergebnis gefunden.');
      state.data = mergeRowData(state.row);
      state.cfg = normalizeConfig(state.data);
      state.slides = buildSlides();
      if (status) status.hidden = true;
      renderSlide();
    } catch(e) {
      if (status) { status.hidden=false; status.className='presentation-status warning'; status.textContent = e && e.message ? e.message : 'Präsentation konnte nicht geladen werden.'; }
    }
    const exit=$('presentationExitBtn'), full=$('presentationFullscreenBtn'), prev=$('presentationPrevBtn'), next=$('presentationNextBtn');
    if (exit) exit.onclick = () => { location.href='ergebnisse.html'; };
    if (full) full.onclick = () => { const root=document.documentElement; if(!document.fullscreenElement && root.requestFullscreen) root.requestFullscreen().catch(()=>{}); else if(document.exitFullscreen) document.exitFullscreen().catch(()=>{}); };
    if (prev) prev.onclick = () => move(-1);
    if (next) next.onclick = () => move(1);
    document.addEventListener('keydown', e => { if(e.key==='ArrowRight'||e.key===' '){e.preventDefault();move(1);} if(e.key==='ArrowLeft'){e.preventDefault();move(-1);} if(e.key==='Escape'){location.href='ergebnisse.html';} });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
