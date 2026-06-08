/* Standalone-Präsentationsrenderer
   Ziel: finale Präsentation immer direkt aus Google-Sheet/Rohdaten-JSON laden
   und gespeicherte Design-/Layoutparameter anwenden. Keine Abhängigkeit von app.js. */
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
  function esc(v){ return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }
  function val(v){ const s = String(v ?? '').trim(); return s ? s : '—'; }
  function isObj(v){ return !!v && typeof v === 'object' && !Array.isArray(v); }
  function pickObj(){ for (let i=0;i<arguments.length;i++){ if (isObj(arguments[i])) return arguments[i]; } return {}; }
  function pickArr(){ for (let i=0;i<arguments.length;i++){ if (Array.isArray(arguments[i])) return arguments[i]; } return []; }
  function first(){ for (let i=0;i<arguments.length;i++){ const v = arguments[i]; if (v !== undefined && v !== null && String(v).trim() !== '') return v; } return ''; }
  function deepClone(v){ try { return JSON.parse(JSON.stringify(v || {})); } catch(_) { return {}; } }
  function path(obj, p){
    if (!obj || !p) return '';
    return p.split('.').reduce((a,k) => (a && a[k] !== undefined && a[k] !== null) ? a[k] : '', obj);
  }

  function formatTimestamp(v){
    if (!v) return '';
    const raw = String(v);
    if (/^\d{1,2}:\d{2}:\d{2}\s+\d{2}\.\d{2}\.\d{4}$/.test(raw)) return raw;
    try {
      const d = new Date(v);
      if (isNaN(d.getTime())) return raw;
      return d.toLocaleString('de-DE', {hour:'2-digit', minute:'2-digit', second:'2-digit', day:'2-digit', month:'2-digit', year:'numeric'}).replace(',', '');
    } catch(_) { return raw; }
  }

  function getAppsScriptUrl(){
    const cfg = window.SUPERVISION_CONFIG || window.SV_CONFIG || {};
    return cfg.APPS_SCRIPT_URL || cfg.appsScriptUrl || window.APPS_SCRIPT_URL || '';
  }

  function jsonp(url, params){
    return new Promise((resolve, reject) => {
      const cb = 'svPresentationCb_' + Date.now() + '_' + Math.floor(Math.random()*1000000);
      const script = document.createElement('script');
      const qs = new URLSearchParams(params || {});
      qs.set('callback', cb);
      qs.set('_', Date.now());
      let done = false;
      const timer = setTimeout(() => finish(new Error('Verbindung zum Apps Script fehlgeschlagen.')), 15000);
      function cleanup(){ clearTimeout(timer); try{ delete window[cb]; }catch(_){ window[cb] = undefined; } if (script.parentNode) script.parentNode.removeChild(script); }
      function finish(err, data){ if (done) return; done = true; cleanup(); err ? reject(err) : resolve(data); }
      window[cb] = res => finish(null, res);
      script.onerror = () => finish(new Error('JSONP-Verbindung fehlgeschlagen.'));
      script.src = url + (url.includes('?') ? '&' : '?') + qs.toString();
      document.body.appendChild(script);
    });
  }

  async function loadRows(){
    const url = getAppsScriptUrl();
    if (!url) throw new Error('Keine Apps-Script-URL in js/config.js eingetragen.');
    const params = new URLSearchParams(location.search);
    const g = params.get('g') || params.get('groupId') || params.get('token') || '';
    const res = await jsonp(url, { action:'list', groupId:g });
    if (!res || res.ok === false) throw new Error((res && res.error) || 'Apps Script hat keine gültige Antwort geliefert.');
    return Array.isArray(res.entries) ? res.entries : [];
  }

  function selectRow(rows){
    const params = new URLSearchParams(location.search);
    const rowParam = params.get('row');
    const idxParam = params.get('i');
    const g = params.get('g') || params.get('groupId') || params.get('token') || '';
    if (rowParam !== null) {
      const r = rows.find(x => String(x.rowNumber || x.id || '') === String(rowParam));
      if (r) return r;
    }
    if (idxParam !== null && rows[Number(idxParam)]) return rows[Number(idxParam)];
    if (g) {
      const filtered = rows.filter(x => String(x.groupId || path(x,'data.groupId') || '').trim() === String(g).trim());
      if (filtered.length) return filtered[filtered.length - 1];
    }
    return rows[rows.length - 1] || null;
  }

  function mergeRowData(row){
    const d = deepClone(row && row.data || {});
    const raw = deepClone(d.raw || {});
    const out = Object.assign({}, raw, d);
    ['assignments','p1','p2','p3','p4','p5','p6'].forEach(k => out[k] = Object.assign({}, raw[k] || {}, d[k] || {}));
    out.raw = raw;
    return out;
  }

  function stripUnsupported(v){
    if (v == null) return v;
    if (typeof v === 'string') {
      if (/^data:image\//i.test(v)) return '';
      return v.length > 80000 ? v.slice(0,80000) : v;
    }
    if (Array.isArray(v)) return v.slice(0,300).map(stripUnsupported).filter(x => x !== undefined);
    if (typeof v === 'object') {
      const o = {};
      Object.keys(v).forEach(k => {
        if (/backgroundImage|bgImage|imageData|dataUrl|base64|snapshot|history|undo|localStorage/i.test(k)) return;
        o[k] = stripUnsupported(v[k]);
      });
      return o;
    }
    return v;
  }

  function normalizeCfg(data){
    const raw = data.raw || {};
    let c = null;
    const candidates = [
      data.presentationConfig, raw.presentationConfig,
      data.presentationV6, raw.presentationV6,
      data.presentationSync, raw.presentationSync
    ];
    for (const cand of candidates) { if (isObj(cand)) { c = cand; break; } }
    if (!c) c = {};
    const settings = Object.assign({}, DEFAULT_SETTINGS,
      pickObj(c.settings, c.presentationSettings, data.presentationSettings, raw.presentationSettings)
    );
    delete settings.backgroundImage;
    const text = Object.assign({},
      pickObj(c.text, c.textOverrides, c.presentationTextOverrides),
      pickObj(data.presentationTextOverrides, raw.presentationTextOverrides)
    );
    const layout = Object.assign({},
      pickObj(c.layout, c.presentationLayout),
      pickObj(data.presentationLayout, raw.presentationLayout)
    );
    const stableLayout = Object.assign({},
      pickObj(c.stableLayout, c.presentationStableLayout),
      pickObj(data.presentationStableLayout, raw.presentationStableLayout)
    );
    const extras = pickArr(c.extras, c.presentationExtras, c.textboxes, data.presentationExtras, raw.presentationExtras);
    const stickers = pickArr(c.stickers, c.presentationStickers, data.presentationStickers, raw.presentationStickers);
    const values = Object.assign({}, pickObj(c.values, c.presentationValues, data.presentationValues, raw.presentationValues));
    return stripUnsupported({ version: c.version || 1, settings, text, textOverrides:text, layout, stableLayout, extras, stickers, values });
  }

  function pattern(kind, color){
    const c = color || '#e5e7eb';
    switch(kind){
      case 'dots': return { image:`radial-gradient(${c} 1.4px, transparent 1.4px)`, size:'18px 18px' };
      case 'grid': return { image:`linear-gradient(${c} 1px, transparent 1px), linear-gradient(90deg, ${c} 1px, transparent 1px)`, size:'28px 28px' };
      case 'diagonal': return { image:`repeating-linear-gradient(135deg, transparent 0 12px, ${c} 12px 14px)`, size:'24px 24px' };
      case 'waves': return { image:`radial-gradient(ellipse at top, ${c} 0 16%, transparent 17%), radial-gradient(ellipse at bottom, ${c} 0 14%, transparent 15%)`, size:'70px 34px' };
      default: return { image:'none', size:'24px 24px' };
    }
  }

  function applyTheme(){
    const s = Object.assign({}, DEFAULT_SETTINGS, state.cfg && state.cfg.settings || {});
    const bp = pattern(s.backgroundPattern, s.backgroundPatternColor);
    document.body.style.backgroundColor = s.background;
    document.body.style.backgroundImage = bp.image;
    document.body.style.backgroundSize = bp.size;
    document.body.style.color = s.text;
    document.documentElement.style.setProperty('--ps-heading', s.heading);
    document.documentElement.style.setProperty('--ps-text', s.text);
    document.documentElement.style.setProperty('--ps-slide', s.slide);
    document.documentElement.style.setProperty('--ps-bg', s.background);
  }

  function table(headers, rows){
    return '<div class="ps-table-wrap"><table class="ps-table"><thead><tr>' + headers.map(h => '<th>'+esc(h)+'</th>').join('') + '</tr></thead><tbody>' + rows.map(r => '<tr>' + r.map(c => '<td>'+esc(val(c)).replace(/\n/g,'<br>')+'</td>').join('') + '</tr>').join('') + '</tbody></table></div>';
  }

  function buildSlides(){
    const d = state.data, raw = d.raw || {}, v = state.cfg.values || {};
    const a = d.assignments || {};
    const p2 = d.p2 || {}, p3 = d.p3 || {}, p4 = d.p4 || {}, p5 = d.p5 || {}, p6 = d.p6 || {};
    const groupName = first(v.groupName, d.groupName, state.row && state.row.groupName, 'Gruppe');
    const timestamp = formatTimestamp(first(v.timestamp, d.timestamp, d.timestampLocal, state.row && state.row.timestamp, new Date().toISOString()));
    const supervisor = first(v.supervisor, a.supervisor);
    const sl = first(v.schulleitung, a.schulleitung);
    const la = first(v.lehrkraftA, a['lehrkraft-a'], a.lehrkraftA);
    const lb = first(v.lehrkraftB, a['lehrkraft-b'], a.lehrkraftB);
    return [
      {
        id:'s0', title:'Gruppenvorstellung',
        parts:[
          { id:'s0_title', type:'title', html:'Gruppenvorstellung' },
          { id:'s0_kicker', type:'kicker', html:timestamp },
          { id:'s0_groupName', type:'heading2', html:groupName },
          { id:'s0_table', type:'table', html:table(['Rolle','Name'], [['Supervisor*in', supervisor], ['Schulleitung', sl], ['Lehrkraft A', la], ['Lehrkraft B', lb]]) },
          { id:'s0_note', type:'note', html:'Simulation einer Gruppensupervision zum Teamteaching im Kontext ESE.' }
        ]
      },
      {
        id:'s1', title:'Problembeschreibung',
        parts:[
          { id:'s1_title', type:'title', html:'Problembeschreibung' },
          { id:'s1_subtitle', type:'subtitle', html:'Diese Folie bündelt die individuellen Sichtweisen der Beteiligten: Beobachtungen bzw. Probleme, Gefühle und Wünsche.' },
          { id:'s1_table', type:'table', html:table(['Rolle','Probleme / Beobachtung','Gefühle','Wünsche'], [
            ['Schulleitung', first(v.p2slProblems, p2.slProbleme, p2.slProblem), first(v.p2slFeelings, p2.slGefuehle), first(v.p2slWishes, p2.slWuensche)],
            ['Lehrkraft A', first(v.p2aProblems, p2.aProbleme, p2.aPerspektive), first(v.p2aFeelings, p2.aGefuehle), first(v.p2aWishes, p2.aWuensche)],
            ['Lehrkraft B', first(v.p2bProblems, p2.bProbleme, p2.bPerspektive), first(v.p2bFeelings, p2.bGefuehle), first(v.p2bWishes, p2.bWuensche)]
          ]) }
        ]
      },
      {
        id:'s2', title:'Zielformulierung',
        parts:[
          { id:'s2_title', type:'title', html:'Zielformulierung' },
          { id:'s2_subtitle', type:'subtitle', html:'Hier werden Einzelziele, Gemeinsamkeiten und die gemeinsame Zielvereinbarung zusammengeführt.' },
          { id:'s2_table', type:'table', html:table(['Bereich','Eintrag'], [
            ['Ziel Schulleitung', first(v.p3zielSL, p3.zielSL)],
            ['Ziel Lehrkraft A', first(v.p3zielA, p3.zielA)],
            ['Ziel Lehrkraft B', first(v.p3zielB, p3.zielB)],
            ['Gemeinsamkeiten', first(v.p3gemeinsam, p3.gemeinsamkeiten)],
            ['Gemeinsame Zielvereinbarung', first(v.p3ziel, p3.gemeinsamesZiel, p3.gemeinsameZielformulierung)]
          ]) }
        ]
      },
      {
        id:'s3', title:'Vertiefte Problembearbeitung',
        parts:[
          { id:'s3_title', type:'title', html:'Vertiefte Problembearbeitung' },
          { id:'s3_subtitle', type:'subtitle', html:'Diese Folie hält hilfreiche Kritik und Absprachen für die weitere Zusammenarbeit fest.' },
          { id:'s3_table', type:'table', html:table(['Aspekt','Ergebnis'], [
            ['Hilfreiche Kritik', first(v.p4kritik, p4.kritik)],
            ['Absprachen zum weiteren Vorgehen', first(v.p4absprachen, p4.absprachen, p4.weiteresVorgehen)]
          ]) }
        ]
      },
      {
        id:'s4', title:'Umsetzung',
        parts:[
          { id:'s4_title', type:'title', html:'Umsetzung' },
          { id:'s4_subtitle', type:'subtitle', html:'Diese Folie zeigt Zustimmung, Praxistauglichkeit und konkrete Schritte zur Umsetzung.' },
          { id:'s4_table', type:'table', html:table(['Aspekt','Ergebnis'], [
            ['Zustimmung zur Vereinbarung', first(v.p5zustimmung, p5.zustimmung)],
            ['Einschätzung der Praxistauglichkeit', first(v.p6prax, p6.praxistauglichkeit, p6.einschaetzung)],
            ['Unterstützung durch Schulleitung', first(v.p6support, p6.unterstuetzung)],
            ['Erste konkrete Umsetzungsschritte', first(v.p6steps, p6.umsetzung, p6.konkreteUmsetzungsschritte)]
          ]) }
        ]
      },
      {
        id:'s5', title:'',
        parts:[ { id:'s5_thanks', type:'thanks', html:'<h2>Vielen Dank fürs Zuhören!</h2><p>Raum für Rückfragen und gemeinsame Reflexion.</p>' } ]
      }
    ];
  }

  function defaultLayout(id, type){
    const slide = Number((id.match(/^s(\d+)/)||[])[1] || 0);
    if (type === 'title') return {x:7,y:7,w:86,h:12,z:20,fontSize:48,color:null};
    if (type === 'kicker') return {x:7,y:22,w:50,h:5,z:20,fontSize:13,color:null};
    if (type === 'heading2') return {x:7,y:29,w:86,h:9,z:20,fontSize:40,color:null};
    if (type === 'subtitle') return {x:7,y:22,w:86,h:10,z:20,fontSize:20,color:null};
    if (type === 'table') return {x:7,y:41,w:86,h:36,z:20,fontSize:18,color:null};
    if (type === 'note') return {x:7,y:82,w:86,h:6,z:20,fontSize:16,color:null};
    if (type === 'thanks') return {x:10,y:34,w:80,h:28,z:20,fontSize:46,color:null};
    return {x:7,y:20,w:86,h:10,z:20,fontSize:18,color:null};
  }

  function applyElementStyle(el, id, type){
    const s = state.cfg.settings || DEFAULT_SETTINGS;
    const mergedLayout = Object.assign({}, state.cfg.stableLayout || {}, state.cfg.layout || {});
    const l = Object.assign({}, defaultLayout(id, type), pickObj(mergedLayout[id]));
    el.style.position = 'absolute';
    el.style.left = Number(l.x) + '%';
    el.style.top = Number(l.y) + '%';
    el.style.width = Number(l.w) + '%';
    if (l.h !== undefined) el.style.minHeight = Number(l.h) + '%';
    el.style.zIndex = String(l.z || 20);
    el.style.transformOrigin = 'center center';
    el.style.transform = 'rotate(' + Number(l.rot || 0) + 'deg)';
    el.style.fontSize = Number(l.fontSize || 18) + 'px';
    const color = l.color || (type === 'title' ? s.heading : s.text);
    if (color) {
      el.style.color = color;
      if (type === 'table') el.querySelectorAll('table,th,td,tr,thead,tbody').forEach(n => { n.style.color = color; });
    }
  }

  function renderSlide(){
    applyTheme();
    const slide = $('presentationSlide');
    const counter = $('presentationCounter');
    if (!slide) return;
    const sp = pattern(state.cfg.settings.slidePattern, state.cfg.settings.slidePatternColor);
    const item = state.slides[state.index];
    slide.style.backgroundColor = state.cfg.settings.slide;
    slide.style.backgroundImage = sp.image;
    slide.style.backgroundSize = sp.size;
    slide.innerHTML = '<div class="ps-inner"></div>';
    const inner = slide.querySelector('.ps-inner');
    item.parts.forEach(part => {
      const el = document.createElement('div');
      el.className = 'ps-el ps-' + part.type;
      el.dataset.syncId = part.id;
      const override = state.cfg.text && state.cfg.text[part.id + '__text'];
      if (part.type === 'table' || part.type === 'thanks') el.innerHTML = part.html;
      else el.textContent = override !== undefined ? String(override) : String(part.html || '');
      inner.appendChild(el);
      applyElementStyle(el, part.id, part.type);
    });
    renderExtras(inner);
    renderStickers(inner);
    if (counter) counter.textContent = (state.index + 1) + ' / ' + state.slides.length;
    const prev = $('presentationPrevBtn'), next = $('presentationNextBtn');
    if (prev) prev.disabled = state.index <= 0;
    if (next) next.disabled = state.index >= state.slides.length - 1;
  }

  function renderExtras(inner){
    const extras = state.cfg.extras || [];
    extras.filter(x => Number(x.slide || 0) === state.index).forEach((x,n) => {
      const el = document.createElement('div');
      el.className = 'ps-extra';
      el.textContent = String(x.text || '');
      el.style.left = Number(x.x || 10) + '%';
      el.style.top = Number(x.y || 70) + '%';
      el.style.width = Number(x.w || 25) + '%';
      el.style.minHeight = Number(x.h || 8) + '%';
      el.style.zIndex = String(x.z || 100+n);
      el.style.transform = 'rotate(' + Number(x.rot || 0) + 'deg)';
      el.style.fontSize = Number(x.fontSize || 18) + 'px';
      el.style.color = x.color || state.cfg.settings.text;
      inner.appendChild(el);
    });
  }
  function renderStickers(inner){
    const stickers = state.cfg.stickers || [];
    stickers.filter(x => Number(x.slide || 0) === state.index).forEach((x,n) => {
      if (!x.src || /^data:image\//i.test(String(x.src))) return;
      const img = document.createElement('img');
      img.className = 'ps-sticker';
      img.src = String(x.src);
      img.alt = '';
      img.style.left = Number(x.x || 40) + '%';
      img.style.top = Number(x.y || 20) + '%';
      img.style.width = Number(x.w || 18) + '%';
      img.style.height = Number(x.h || 18) + '%';
      img.style.zIndex = String(x.z || 110+n);
      img.style.transform = 'rotate(' + Number(x.rot || 0) + 'deg)';
      inner.appendChild(img);
    });
  }

  function move(delta){
    const next = Math.max(0, Math.min(state.slides.length - 1, state.index + delta));
    if (next === state.index) return;
    state.index = next;
    renderSlide();
  }

  async function init(){
    const status = $('presentationStatus');
    try {
      if (status) status.textContent = 'Präsentation wird geladen …';
      state.rows = await loadRows();
      state.row = selectRow(state.rows);
      if (!state.row) throw new Error('Kein Gruppenergebnis gefunden.');
      state.data = mergeRowData(state.row);
      state.cfg = normalizeCfg(state.data);
      state.slides = buildSlides();
      if (status) status.hidden = true;
      renderSlide();
    } catch (e) {
      if (status) { status.hidden = false; status.className = 'presentation-status warning'; status.textContent = e && e.message ? e.message : 'Präsentation konnte nicht geladen werden.'; }
    }

    const exit = $('presentationExitBtn');
    const full = $('presentationFullscreenBtn');
    const prev = $('presentationPrevBtn');
    const next = $('presentationNextBtn');
    if (exit) exit.onclick = () => { location.href = 'ergebnisse.html'; };
    if (full) full.onclick = () => {
      const root = document.documentElement;
      if (!document.fullscreenElement && root.requestFullscreen) root.requestFullscreen().catch(()=>{});
      else if (document.exitFullscreen) document.exitFullscreen().catch(()=>{});
    };
    if (prev) prev.onclick = () => move(-1);
    if (next) next.onclick = () => move(1);
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); move(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); }
      if (e.key === 'Escape') { location.href = 'ergebnisse.html'; }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
