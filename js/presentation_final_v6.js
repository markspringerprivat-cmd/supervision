/* Finaler V6-Präsentationsrenderer
   Verwendet exakt dieselbe Datenstruktur wie der Bearbeitungsmodus:
   presentationV6 = { settings, values, text, layout, textboxes, stickers }
   Alle Koordinaten bleiben Prozentwerte auf einer 16:9-Folie. */
(function(){
  'use strict';

  const THEME_DEFAULT = {
    heading:'#1e3a5f', text:'#0f172a', background:'#071323', slide:'#ffffff',
    slidePattern:'none', backgroundPattern:'none',
    slidePatternColor:'#dbe4ef', backgroundPatternColor:'#12372d', tableStyle:'classic'
  };
  const SLIDE_COUNT = 6;
  let state = null;
  let slideIndex = 0;

  const $ = id => document.getElementById(id);
  const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const textVal = v => {
    if(v === null || v === undefined) return '';
    if(typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return String(v);
    if(isObj(v)) return textVal(v.text ?? v.value ?? v.html ?? v.content ?? '');
    return String(v);
  };
  const valueText = v => { const t = textVal(v).trim(); return t ? t : '—'; };
  const num = (v, fb) => { const n = Number(v); return Number.isFinite(n) ? n : fb; };
  const clamp = (v,min,max) => Math.max(min, Math.min(max, v));
  const clone = o => { try { return JSON.parse(JSON.stringify(o || {})); } catch(_) { return {}; } };
  const path = (o,p) => { try { return String(p).split('.').reduce((a,k)=>a && a[k] != null ? a[k] : '', o); } catch(_) { return ''; } };

  function readJson(v){
    if(isObj(v)) return clone(v);
    if(typeof v !== 'string' || !v.trim()) return {};
    try { return JSON.parse(v); } catch(_) { return {}; }
  }
  function appsUrl(){
    const c = window.SUPERVISION_CONFIG || window.SV_CONFIG || {};
    return c.APPS_SCRIPT_URL || c.appsScriptUrl || window.APPS_SCRIPT_URL || '';
  }
  function jsonp(url, params){ return new Promise((resolve,reject)=>{
    const cb = 'svPresFinalCb_' + Date.now() + '_' + Math.floor(Math.random()*1e9);
    const qs = new URLSearchParams(params || {}); qs.set('callback', cb); qs.set('_', Date.now());
    const s = document.createElement('script'); let done = false;
    const timer = setTimeout(()=>finish(new Error('Apps-Script-Verbindung fehlgeschlagen.')), 18000);
    function cleanup(){ clearTimeout(timer); try{ delete window[cb]; }catch(_){ window[cb] = undefined; } if(s.parentNode) s.parentNode.removeChild(s); }
    function finish(err, data){ if(done) return; done = true; cleanup(); err ? reject(err) : resolve(data); }
    window[cb] = data => finish(null, data);
    s.onerror = () => finish(new Error('JSONP-Verbindung fehlgeschlagen.'));
    s.src = url + (url.includes('?') ? '&' : '?') + qs.toString();
    document.body.appendChild(s);
  }); }
  async function loadRows(){
    const url = appsUrl();
    if(!url) throw new Error('Keine Apps-Script-URL gefunden.');
    const q = new URLSearchParams(location.search);
    const params = { action:'list' };
    const gid = q.get('g') || q.get('groupId') || q.get('token');
    if(gid) params.groupId = gid;
    const res = await jsonp(url, params);
    if(!res || res.ok === false) throw new Error((res && res.error) || 'Apps Script hat keine gültigen Daten geliefert.');
    return Array.isArray(res.entries) ? res.entries : [];
  }
  function selectRow(rows){
    const q = new URLSearchParams(location.search);
    const row = q.get('row') || q.get('id');
    const gid = q.get('g') || q.get('groupId') || q.get('token');
    if(row){
      const r = rows.find(x => String(x.rowNumber || x.id || '') === String(row));
      if(r) return r;
    }
    if(gid){
      const filtered = rows.filter(x => String(x.groupId || path(x,'data.groupId') || '') === gid);
      if(filtered.length) return filtered[filtered.length - 1];
    }
    return rows[rows.length - 1] || null;
  }

  function defaultValues(data,row){
    const a = data.assignments || {};
    const p2 = data.p2 || {}, p3 = data.p3 || {}, p4 = data.p4 || {}, p5 = data.p5 || {}, p6 = data.p6 || {};
    return {
      groupName: data.groupName || row.groupName || [a.supervisor,a.schulleitung,a['lehrkraft-a']||a.lehrkraftA,a['lehrkraft-b']||a.lehrkraftB].filter(Boolean).join(', ') || 'Gruppe',
      timestamp: data.timestamp || row.timestamp || new Date().toISOString(),
      supervisor: a.supervisor || data.supervisor || '',
      schulleitung: a.schulleitung || data.schulleitung || '',
      lehrkraftA: a['lehrkraft-a'] || a.lehrkraftA || data.lehrkraftA || '',
      lehrkraftB: a['lehrkraft-b'] || a.lehrkraftB || data.lehrkraftB || '',
      p2slProblems: p2.slProbleme || '', p2slFeelings: p2.slGefuehle || '', p2slWishes: p2.slWuensche || '',
      p2aProblems: p2.aProbleme || '', p2aFeelings: p2.aGefuehle || '', p2aWishes: p2.aWuensche || '',
      p2bProblems: p2.bProbleme || '', p2bFeelings: p2.bGefuehle || '', p2bWishes: p2.bWuensche || '',
      p3zielSL: p3.zielSL || '', p3zielA: p3.zielA || '', p3zielB: p3.zielB || '', p3gemeinsam: p3.gemeinsamkeiten || '', p3ziel: p3.gemeinsamesZiel || '',
      p4kritik: p4.kritik || '', p4absprachen: p4.absprachen || '',
      p5zustimmung: p5.zustimmung || '', p6prax: p6.praxistauglichkeit || '', p6support: p6.unterstuetzung || '', p6steps: p6.umsetzung || ''
    };
  }
  function makeState(values){ return {version:6, settings:clone(THEME_DEFAULT), values:values || {}, text:{}, layout:{}, textboxes:[], stickers:[]}; }
  function normalizeState(data,row){
    const raw = data.raw || {};
    const presJson = readJson(data.presentationJson || raw.presentationJson || data.presentation_json || raw.presentation_json);
    let src = null;
    [presJson, data.presentationV6, raw.presentationV6, data.presentationConfig, raw.presentationConfig].some(x => { if(isObj(x) && Object.keys(x).length){ src = x; return true; } return false; });
    const base = makeState(defaultValues(data,row));
    if(!src) src = {};
    const out = makeState(base.values);
    out.version = src.version || 6;
    out.settings = Object.assign({}, THEME_DEFAULT, src.settings || src.presentationSettings || data.presentationSettings || raw.presentationSettings || {});
    delete out.settings.backgroundImage;
    out.values = Object.assign({}, base.values, src.values || data.presentationValues || raw.presentationValues || {});
    Object.keys(out.values).forEach(k => { out.values[k] = textVal(out.values[k]); });
    out.text = Object.assign({}, src.text || src.textOverrides || data.presentationTextOverrides || raw.presentationTextOverrides || {});
    Object.keys(out.text).forEach(k => { out.text[k] = textVal(out.text[k]); });
    out.layout = Object.assign({}, src.layout || data.presentationLayout || raw.presentationLayout || {});
    out.textboxes = Array.isArray(src.textboxes) ? src.textboxes : (Array.isArray(src.extras) ? src.extras : (Array.isArray(data.presentationExtras) ? data.presentationExtras : []));
    out.stickers = Array.isArray(src.stickers) ? src.stickers : (Array.isArray(data.presentationStickers) ? data.presentationStickers : []);
    out.textboxes = out.textboxes.filter(isObj).map((x,i)=>({
      id: textVal(x.id || ('textbox_'+i)), slide: clamp(num(x.slide ?? x.slideIndex,0),0,SLIDE_COUNT-1), text: textVal(x.text ?? x.html ?? x.content),
      x:num(x.x ?? x.left,12), y:num(x.y ?? x.top,74), w:num(x.w ?? x.width,25), h:num(x.h ?? x.height,10), rot:num(x.rot ?? x.rotation,0), z:num(x.z ?? x.zIndex,80+i),
      fontSize:num(x.fontSize,18), color:textVal(x.color || '')
    }));
    out.stickers = out.stickers.filter(isObj).map((x,i)=>({
      id: textVal(x.id || ('sticker_'+i)), slide: clamp(num(x.slide ?? x.slideIndex,0),0,SLIDE_COUNT-1), src: textVal(x.src || x.path || x.url),
      x:num(x.x ?? x.left,60), y:num(x.y ?? x.top,48), w:num(x.w ?? x.width,24), h:num(x.h ?? x.height,22), rot:num(x.rot ?? x.rotation,0), z:num(x.z ?? x.zIndex,90+i)
    })).filter(x => x.src && !/^data:image/i.test(x.src));
    return out;
  }

  function formatTs(v){
    const s = textVal(v);
    if(!s) return new Date().toLocaleString('de-DE');
    if(/\d{1,2}:\d{2}/.test(s) && /\d{1,2}\.\d{1,2}\.\d{4}/.test(s)) return s;
    try { return new Date(s).toLocaleString('de-DE'); } catch(_) { return s; }
  }
  function elementKey(id){ return id + '__text'; }
  function defaultLayout(type, slide){
    if(type === 'title') return {x:7,y:7,w:86,h:12,rot:0,z:20,fontSize:40,color:null};
    if(type === 'kicker') return {x:7,y:22,w:50,h:5,rot:0,z:20,fontSize:13,color:null};
    if(type === 'groupName') return {x:7,y:29,w:82,h:8,rot:0,z:20,fontSize:30,color:null};
    if(type === 'subtitle') return {x:7,y:21,w:82,h:8,rot:0,z:20,fontSize:15,color:null};
    if(type === 'table') return Number(slide) === 0 ? {x:7,y:43,w:86,h:34,rot:0,z:20,fontSize:15,color:null} : {x:7,y:34,w:86,h:42,rot:0,z:20,fontSize:15,color:null};
    if(type === 'note') return {x:7,y:84,w:72,h:6,rot:0,z:20,fontSize:13,color:null};
    if(type === 'thanks') return {x:12,y:38,w:76,h:18,rot:0,z:20,fontSize:46,color:null};
    if(type === 'textbox') return {x:12,y:74,w:25,h:10,rot:0,z:80,fontSize:18,color:null};
    if(type === 'sticker') return {x:60,y:48,w:24,h:22,rot:0,z:90};
    return {x:7,y:10,w:80,h:10,rot:0,z:20,fontSize:18,color:null};
  }
  function slideDefs(values){
    return [
      {id:'group', elements:[
        {id:'s0_title', type:'title', html:'Gruppenvorstellung'},
        {id:'s0_kicker', type:'kicker', html:formatTs(values.timestamp)},
        {id:'s0_groupName', type:'groupName', html:valueText(values.groupName), field:'groupName'},
        {id:'s0_table', type:'table', table:{headers:['Rolle','Name'], rows:[['Supervisor*in','supervisor'],['Schulleitung','schulleitung'],['Lehrkraft A','lehrkraftA'],['Lehrkraft B','lehrkraftB']]}},
        {id:'s0_note', type:'note', html:'Simulation einer Gruppensupervision zum Teamteaching im Kontext ESE.'}
      ]},
      {id:'problem', elements:[
        {id:'s1_title', type:'title', html:'Problembeschreibung'},
        {id:'s1_subtitle', type:'subtitle', html:'Diese Folie bündelt die individuellen Sichtweisen der Beteiligten: Beobachtungen bzw. Probleme, Gefühle und Wünsche.'},
        {id:'s1_table', type:'table', table:{headers:['Rolle','Probleme / Beobachtung','Gefühle','Wünsche'], rows:[['Schulleitung','p2slProblems','p2slFeelings','p2slWishes'],['Lehrkraft A','p2aProblems','p2aFeelings','p2aWishes'],['Lehrkraft B','p2bProblems','p2bFeelings','p2bWishes']]}}
      ]},
      {id:'goals', elements:[
        {id:'s2_title', type:'title', html:'Zielformulierung'},
        {id:'s2_subtitle', type:'subtitle', html:'Hier werden die Einzelziele der Beteiligten, erkennbare Gemeinsamkeiten und die gemeinsame Zielvereinbarung zusammengeführt.'},
        {id:'s2_table', type:'table', table:{headers:['Bereich','Eintrag'], rows:[['Ziel Schulleitung','p3zielSL'],['Ziel Lehrkraft A','p3zielA'],['Ziel Lehrkraft B','p3zielB'],['Gefundene Gemeinsamkeiten','p3gemeinsam'],['Gemeinsame Zielvereinbarung','p3ziel']]}}
      ]},
      {id:'deep', elements:[
        {id:'s3_title', type:'title', html:'Vertiefte Problembearbeitung'},
        {id:'s3_subtitle', type:'subtitle', html:'Hier wird festgehalten, wie hilfreiche Kritik formuliert werden kann und welche Absprachen für die weitere Zusammenarbeit getroffen wurden.'},
        {id:'s3_table', type:'table', table:{headers:['Aspekt','Ergebnis'], rows:[['Hilfreiche Kritik','p4kritik'],['Absprachen zum weiteren Vorgehen','p4absprachen']]}}
      ]},
      {id:'implementation', elements:[
        {id:'s4_title', type:'title', html:'Umsetzung'},
        {id:'s4_subtitle', type:'subtitle', html:'Diese Folie zeigt Zustimmung, Praxistauglichkeit und erste konkrete Schritte zur Umsetzung der Vereinbarung.'},
        {id:'s4_table', type:'table', table:{headers:['Aspekt','Ergebnis'], rows:[['Zustimmung zur Vereinbarung','p5zustimmung'],['Einschätzung der Praxistauglichkeit durch die Schulleitung','p6prax'],['Unterstützungsmöglichkeiten durch die Schulleitung','p6support'],['Erste konkrete Umsetzungsschritte','p6steps']]}}
      ]},
      {id:'thanks', elements:[{id:'s5_thanks', type:'thanks', html:'Vielen Dank fürs Zuhören!'}]}
    ];
  }
  function svgPattern(svg){
    return `url("data:image/svg+xml,${encodeURIComponent(svg).replace(/'/g,'%27').replace(/\"/g,'%22')}")`;
  }
  function patternCss(kind,color){
    const c = color || '#dbe4ef';
    if(!kind || kind === 'none') return 'none';
    if(kind === 'dots') return svgPattern(`<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'><circle cx='7' cy='7' r='1.7' fill='${c}' fill-opacity='.85'/><circle cx='21' cy='21' r='1.7' fill='${c}' fill-opacity='.65'/></svg>`);
    if(kind === 'grid') return svgPattern(`<svg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'><path d='M0 .5H36M.5 0V36' stroke='${c}' stroke-width='1.15' stroke-opacity='.72' fill='none'/></svg>`);
    if(kind === 'diagonal') return svgPattern(`<svg xmlns='http://www.w3.org/2000/svg' width='34' height='34' viewBox='0 0 34 34'><path d='M-10 44 L44 -10 M-10 10 L10 -10 M24 44 L44 24' stroke='${c}' stroke-width='2.1' stroke-opacity='.72' stroke-linecap='round' fill='none'/></svg>`);
    if(kind === 'waves') return svgPattern(`<svg xmlns='http://www.w3.org/2000/svg' width='64' height='32' viewBox='0 0 64 32'><path d='M-2 22 C8 8 22 8 32 22 S56 36 66 22' stroke='${c}' stroke-width='2.1' stroke-opacity='.76' fill='none' stroke-linecap='round'/><path d='M-2 6 C8 -8 22 -8 32 6 S56 20 66 6' stroke='${c}' stroke-width='2.1' stroke-opacity='.52' fill='none' stroke-linecap='round'/></svg>`);
    return 'none';
  }
  function patternSize(kind){ if(kind==='dots') return '28px 28px'; if(kind==='grid') return '36px 36px'; if(kind==='diagonal') return '34px 34px'; if(kind==='waves') return '64px 32px'; return 'auto'; }
  function layoutFor(id,type){ return Object.assign({}, defaultLayout(type, slideIndex), isObj(state.layout[id]) ? state.layout[id] : {}); }
  function styleFor(l){
    return `left:${num(l.x,0)}%;top:${num(l.y,0)}%;width:${num(l.w ?? l.width,20)}%;height:${num(l.h ?? l.height,10)}%;transform:rotate(${num(l.rot ?? l.rotation,0)}deg);z-index:${num(l.z ?? l.zIndex,20)};font-size:${num(l.fontSize,18)}px;${l.color ? `color:${esc(l.color)};` : ''}`;
  }
  function renderTable(def, values){
    const headers = def.headers.map(h => `<th>${esc(h)}</th>`).join('');
    const rows = def.rows.map(row => `<tr>${row.map((cell,i)=> i===0 ? `<td>${esc(cell)}</td>` : `<td>${esc(valueText(values[cell]))}</td>`).join('')}</tr>`).join('');
    const tableStyle = (state && state.settings && state.settings.tableStyle) || 'classic';
    return `<table class="v6-table v6-table-${esc(tableStyle)}"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
  }
  function renderElement(e){
    const l = layoutFor(e.id, e.type);
    const color = l.color || (e.type === 'title' ? state.settings.heading : state.settings.text);
    const l2 = Object.assign({}, l, {color});
    let content = '';
    if(e.type === 'table') content = renderTable(e.table, state.values);
    else if(e.type === 'thanks') content = `<div class="v6-editable-text">${esc(state.text[elementKey(e.id)] ?? e.html)}</div>`;
    else {
      const t = state.text[elementKey(e.id)] !== undefined ? state.text[elementKey(e.id)] : (e.field ? valueText(state.values[e.field]) : e.html);
      content = `<div class="v6-editable-text">${esc(t)}</div>`;
    }
    return `<div class="v6-el v6-base v6-type-${esc(e.type)}" data-v6-id="${esc(e.id)}" style="${styleFor(l2)}">${content}</div>`;
  }
  function renderTextbox(tb){ return `<div class="v6-el v6-textbox" style="${styleFor(Object.assign({}, defaultLayout('textbox',slideIndex), tb))}"><div class="v6-editable-text">${esc(tb.text || '')}</div></div>`; }
  function renderSticker(st){ return `<div class="v6-el v6-sticker" style="${styleFor(Object.assign({}, defaultLayout('sticker',slideIndex), st))}"><img src="${esc(st.src)}" alt=""></div>`; }
  function applyTheme(){
    const s = Object.assign({}, THEME_DEFAULT, state.settings || {});
    document.body.style.backgroundColor = s.background;
    document.body.style.backgroundImage = patternCss(s.backgroundPattern, s.backgroundPatternColor);
    document.body.style.backgroundSize = patternSize(s.backgroundPattern);
    const deck = $('deck');
    deck.style.backgroundColor = s.slide;
    deck.style.backgroundImage = patternCss(s.slidePattern, s.slidePatternColor);
    deck.style.backgroundSize = patternSize(s.slidePattern);
    deck.style.color = s.text;
    deck.style.setProperty('--v6-heading-color', s.heading);
    deck.style.setProperty('--v6-text-color', s.text);
  }
  function fit(){
    const deck = $('deck');
    const toolbarH = 52, navH = 56;
    const landscapePhone = innerWidth < 900 && innerWidth > innerHeight;
    const beamer = innerWidth >= 1000;
    const side = landscapePhone ? 150 : (beamer ? 110 : 150);
    const top = landscapePhone ? 52 : toolbarH + (beamer ? 34 : 52);
    const bottom = landscapePhone ? 28 : navH + (beamer ? 34 : 52);
    const scale = Math.min((innerWidth - side) / 1600, (innerHeight - top - bottom) / 900);
    deck.style.transform = `translate(-50%,-50%) scale(${Math.max(.1, scale)})`;
  }
  function render(){
    if(!state) return;
    applyTheme(); fit();
    const defs = slideDefs(state.values);
    const def = defs[slideIndex] || defs[0];
    const html = def.elements.map(renderElement).join('')
      + state.textboxes.filter(x => Number(x.slide) === slideIndex).map(renderTextbox).join('')
      + state.stickers.filter(x => Number(x.slide) === slideIndex).map(renderSticker).join('');
    $('slideLayer').innerHTML = html;
    $('count').textContent = `${slideIndex + 1} / ${SLIDE_COUNT}`;
    $('prevBtn').disabled = slideIndex <= 0;
    $('nextBtn').disabled = slideIndex >= SLIDE_COUNT - 1;
  }
  function move(d){ slideIndex = clamp(slideIndex + d, 0, SLIDE_COUNT - 1); render(); }
  async function init(){
    const status = $('status');
    try{
      status.textContent = 'Präsentation wird geladen …';
      const rows = await loadRows();
      const row = selectRow(rows);
      if(!row) throw new Error('Kein Gruppenergebnis gefunden.');
      const data = Object.assign({}, row.data || {});
      data.raw = Object.assign({}, data.raw || row.raw || {});
      state = normalizeState(data,row);
      slideIndex = clamp(num(new URLSearchParams(location.search).get('slide'),0),0,SLIDE_COUNT-1);
      render();
      requestAnimationFrame(() => {
        status.hidden = true;
        document.body.classList.add('presentation-ready');
      });
    }catch(e){
      status.hidden = false; status.className = 'status warn'; status.textContent = e && e.message ? e.message : 'Präsentation konnte nicht geladen werden.';
    }
    $('exitBtn').onclick = () => { location.href = 'ergebnisse.html'; };
    $('fullBtn').onclick = () => { const r = document.documentElement; if(!document.fullscreenElement && r.requestFullscreen) r.requestFullscreen().catch(()=>{}); else if(document.exitFullscreen) document.exitFullscreen().catch(()=>{}); };
    $('prevBtn').onclick = () => move(-1); $('nextBtn').onclick = () => move(1);
    addEventListener('resize', fit);
    document.addEventListener('keydown', e => { if(e.key === 'ArrowRight' || e.key === ' '){ e.preventDefault(); move(1); } if(e.key === 'ArrowLeft'){ e.preventDefault(); move(-1); } if(e.key === 'Escape'){ location.href='ergebnisse.html'; } });
  }
  document.addEventListener('DOMContentLoaded', init);
})();
