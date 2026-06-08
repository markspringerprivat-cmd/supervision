/* Supervision presentation editor V6 - stability patch */
(function(){
  'use strict';

  const ADMIN_PASSWORD = 'Mark123';
  const STATE_KEY_BASE = 'presentation_v7_state';
  const BASELINE_KEY_BASE = 'presentation_v7_baseline';
  const LEGACY_STATE_KEY = 'sv_presentation_v5_state';
  const STICKER_PATH = 'assets/stickers/';
  const STICKER_CATEGORIES = {
    Teamwork: ['team1.png','team2.png','team3.png','team4.png','team5.png','team6.png','team7.png','team8.png'],
    Dekor: ['Dekor1.png','Dekor2.png','Dekor3.png','Dekor4.png','Dekor5.png','Dekor6.png','Dekor7.png','Dekor8.png','Dekor9.png','Dekor10.png']
  };
  const STICKERS = [].concat(STICKER_CATEGORIES.Teamwork, STICKER_CATEGORIES.Dekor);
  const THEME_DEFAULT = {
    heading:'#1e3a5f', text:'#0f172a', background:'#071323', slide:'#ffffff',
    slidePattern:'none', backgroundPattern:'none',
    slidePatternColor:'#dbe4ef', backgroundPatternColor:'#12372d', backgroundImage:''
  };
  const SLIDE_COUNT = 6;
  const BASE_IDS = new Set(['title','subtitle','kicker','groupName','table','note','thanks']);
  let modal = null;
  let draft = null;
  let savedAtOpen = null;
  let dirty = false;
  let editMode = false;
  let slideIndex = 0;
  let selectedId = null;
  let undoStack = [];
  let drag = null;
  let picker = null;
  let activePanel = null;

  function getGroup(){
    try { return (typeof getGroupId === 'function' ? getGroupId() : (localStorage.getItem('sv_current_group') || 'default')); }
    catch(e){ return localStorage.getItem('sv_current_group') || 'default'; }
  }
  function storageKey(base){ return 'sv_' + getGroup() + '_' + base; }
  function getLS(key, fb){ try{ const v = localStorage.getItem(key); return v ? JSON.parse(v) : fb; }catch(e){ return fb; } }
  function setLS(key, val){ localStorage.setItem(key, JSON.stringify(val)); }
  function removeLS(key){ try{ localStorage.removeItem(key); }catch(e){} }
  function clone(obj){ return JSON.parse(JSON.stringify(obj || {})); }
  function uid(prefix){ return prefix + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,8); }
  function esc(s){ return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }
  function valueText(v){ const t = String(v ?? '').trim(); return t ? t : '—'; }
  function num(v, fb){ const n = Number(v); return Number.isFinite(n) ? n : fb; }
  function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }
  function cssEscape(v){ return (window.CSS && CSS.escape) ? CSS.escape(v) : String(v).replace(/[^a-zA-Z0-9_-]/g, '\\$&'); }
  function getData(){ try { return typeof collectSupervisorData === 'function' ? collectSupervisorData() : {}; } catch(e){ return {}; } }
  function loadTextSafe(k){ try { return typeof loadText === 'function' ? loadText(k) : (localStorage.getItem(k)||''); } catch(e){ return ''; } }
  function saveTextSafe(k, v){ try { if (typeof saveText === 'function') saveText(k, v); else localStorage.setItem(k, v || ''); } catch(e){} }
  function formatTs(v){ try { return typeof formatResultTimestamp === 'function' ? formatResultTimestamp(v) : new Date(v || Date.now()).toLocaleString('de-DE'); } catch(e){ return new Date().toLocaleString('de-DE'); } }

  const FIELD_MAP = {
    supervisor: 'role_supervisor', schulleitung: 'role_schulleitung', lehrkraftA: 'role_lehrkraft_a', lehrkraftB: 'role_lehrkraft_b',
    p2slProblems: 'sup_p2_sl_probleme', p2slFeelings: 'sup_p2_sl_gefuehle', p2slWishes: 'sup_p2_sl_wuensche',
    p2aProblems: 'sup_p2_a_probleme', p2aFeelings: 'sup_p2_a_gefuehle', p2aWishes: 'sup_p2_a_wuensche',
    p2bProblems: 'sup_p2_b_probleme', p2bFeelings: 'sup_p2_b_gefuehle', p2bWishes: 'sup_p2_b_wuensche',
    p3zielSL: 'sup_p3_ziel_sl', p3zielA: 'sup_p3_ziel_a', p3zielB: 'sup_p3_ziel_b', p3gemeinsam: 'sup_p3_gemeinsamkeiten', p3ziel: 'sup_p3_gemeinsames_ziel',
    p4kritik: 'sup_p4_kritik', p4absprachen: 'sup_p4_absprachen',
    p5zustimmung: 'sup_p5_zustimmung', p6prax: 'sup_p6_praxistauglichkeit', p6support: 'sup_p6_unterstuetzung', p6steps: 'sup_p6_umsetzung'
  };

  function initialValues(){
    const d = getData();
    const a = d.assignments || {};
    return {
      groupName: d.groupName || [a.supervisor,a.schulleitung,a['lehrkraft-a']||a.lehrkraftA,a['lehrkraft-b']||a.lehrkraftB].filter(Boolean).join(', ') || 'Gruppe',
      timestamp: d.timestamp || new Date().toISOString(),
      supervisor: a.supervisor || '', schulleitung: a.schulleitung || '', lehrkraftA: a['lehrkraft-a'] || a.lehrkraftA || '', lehrkraftB: a['lehrkraft-b'] || a.lehrkraftB || '',
      p2slProblems: d.p2?.slProbleme || loadTextSafe(FIELD_MAP.p2slProblems), p2slFeelings: d.p2?.slGefuehle || loadTextSafe(FIELD_MAP.p2slFeelings), p2slWishes: d.p2?.slWuensche || loadTextSafe(FIELD_MAP.p2slWishes),
      p2aProblems: d.p2?.aProbleme || loadTextSafe(FIELD_MAP.p2aProblems), p2aFeelings: d.p2?.aGefuehle || loadTextSafe(FIELD_MAP.p2aFeelings), p2aWishes: d.p2?.aWuensche || loadTextSafe(FIELD_MAP.p2aWishes),
      p2bProblems: d.p2?.bProbleme || loadTextSafe(FIELD_MAP.p2bProblems), p2bFeelings: d.p2?.bGefuehle || loadTextSafe(FIELD_MAP.p2bFeelings), p2bWishes: d.p2?.bWuensche || loadTextSafe(FIELD_MAP.p2bWishes),
      p3zielSL: d.p3?.zielSL || loadTextSafe(FIELD_MAP.p3zielSL), p3zielA: d.p3?.zielA || loadTextSafe(FIELD_MAP.p3zielA), p3zielB: d.p3?.zielB || loadTextSafe(FIELD_MAP.p3zielB), p3gemeinsam: d.p3?.gemeinsamkeiten || loadTextSafe(FIELD_MAP.p3gemeinsam), p3ziel: d.p3?.gemeinsamesZiel || loadTextSafe(FIELD_MAP.p3ziel),
      p4kritik: d.p4?.kritik || loadTextSafe(FIELD_MAP.p4kritik), p4absprachen: d.p4?.absprachen || loadTextSafe(FIELD_MAP.p4absprachen),
      p5zustimmung: d.p5?.zustimmung || loadTextSafe(FIELD_MAP.p5zustimmung), p6prax: d.p6?.praxistauglichkeit || loadTextSafe(FIELD_MAP.p6prax), p6support: d.p6?.unterstuetzung || loadTextSafe(FIELD_MAP.p6support), p6steps: d.p6?.umsetzung || loadTextSafe(FIELD_MAP.p6steps)
    };
  }

  function makeState(values){
    return { version:6, settings: clone(THEME_DEFAULT), values: values || initialValues(), text:{}, layout:{}, textboxes:[], stickers:[] };
  }
  function getBaseline(){
    const k = storageKey(BASELINE_KEY_BASE);
    let baseline = getLS(k, null);
    if (!baseline) {
      baseline = makeState(initialValues());
      setLS(k, baseline);
    }
    return mergeState(baseline);
  }
  function getSaved(){
    const saved = getLS(storageKey(STATE_KEY_BASE), null);
    if (saved) return mergeState(saved);
    const legacy = getLS(storageKey(LEGACY_STATE_KEY), null);
    if (legacy && legacy.settings) return mergeState(legacyToV6(legacy));
    return getBaseline();
  }
  function mergeState(s){
    const base = makeState(initialValues());
    s = s || {};
    return Object.assign(base, s, {
      settings: Object.assign({}, THEME_DEFAULT, s.settings || {}),
      values: Object.assign({}, base.values, s.values || {}),
      text: Object.assign({}, s.text || {}),
      layout: Object.assign({}, s.layout || {}),
      textboxes: Array.isArray(s.textboxes) ? s.textboxes : [],
      stickers: Array.isArray(s.stickers) ? s.stickers : []
    });
  }
  function legacyToV6(s){
    return {version:6, settings:s.settings || {}, values:s.values || {}, text:s.text || {}, layout:s.layout || {}, textboxes:s.textboxes || s.presentationExtras || [], stickers:s.stickers || s.presentationStickers || []};
  }
  function saveState(){ setLS(storageKey(STATE_KEY_BASE), draft); }
  function resetToBaseline(){ draft = clone(getBaseline()); selectedId = null; undoStack = []; dirty = true; renderAll(); }

  function defaultLayout(type, slide){
    // Die Startlayouts sind bewusst großzügig gesetzt, damit Überschrift,
    // Gruppenname und Tabellen nicht ineinanderlaufen. Alle Werte sind Prozent
    // der Folie und bleiben dadurch auf unterschiedlichen Bildschirmgrößen stabil.
    if(type === 'title') return {x:7,y:7,w:86,h:12,rot:0,z:20,fontSize:40,color:null};
    if(type === 'kicker') return {x:7,y:22,w:50,h:5,rot:0,z:20,fontSize:13,color:null};
    if(type === 'groupName') return {x:7,y:29,w:82,h:8,rot:0,z:20,fontSize:30,color:null};
    if(type === 'subtitle') return {x:7,y:21,w:82,h:8,rot:0,z:20,fontSize:15,color:null};
    if(type === 'table') {
      if(Number(slide) === 0) return {x:7,y:43,w:86,h:34,rot:0,z:20,fontSize:15,color:null};
      return {x:7,y:34,w:86,h:42,rot:0,z:20,fontSize:15,color:null};
    }
    if(type === 'note') return {x:7,y:84,w:72,h:6,rot:0,z:20,fontSize:13,color:null};
    if(type === 'thanks') return {x:12,y:38,w:76,h:18,rot:0,z:20,fontSize:46,color:null};
    if(type === 'textbox') return {x:12,y:74,w:25,h:10,rot:0,z:80,fontSize:18,color:null};
    if(type === 'sticker') return {x:60,y:48,w:24,h:22,rot:0,z:90};
    return {x:7,y:10,w:80,h:10,rot:0,z:20,fontSize:18,color:null};
  }
  function slideDefs(values){
    values = values || initialValues();
    return [
      {
        id:'group', title:'Gruppenvorstellung',
        elements:[
          {id:'s0_title', type:'title', html:'Gruppenvorstellung', field:null},
          {id:'s0_kicker', type:'kicker', html:formatTs(values.timestamp), field:null},
          {id:'s0_groupName', type:'groupName', html:valueText(values.groupName), field:'groupName'},
          {id:'s0_table', type:'table', table:{headers:['Rolle','Name'], rows:[['Supervisor*in','supervisor'],['Schulleitung','schulleitung'],['Lehrkraft A','lehrkraftA'],['Lehrkraft B','lehrkraftB']] }},
          {id:'s0_note', type:'note', html:'Simulation einer Gruppensupervision zum Teamteaching im Kontext ESE.', field:null}
        ]
      },
      { id:'problem', title:'Problembeschreibung', elements:[
          {id:'s1_title', type:'title', html:'Problembeschreibung'},
          {id:'s1_subtitle', type:'subtitle', html:'Diese Folie bündelt die individuellen Sichtweisen der Beteiligten: Beobachtungen bzw. Probleme, Gefühle und Wünsche.'},
          {id:'s1_table', type:'table', table:{headers:['Rolle','Probleme / Beobachtung','Gefühle','Wünsche'], rows:[['Schulleitung','p2slProblems','p2slFeelings','p2slWishes'],['Lehrkraft A','p2aProblems','p2aFeelings','p2aWishes'],['Lehrkraft B','p2bProblems','p2bFeelings','p2bWishes']]}}
      ]},
      { id:'goals', title:'Zielformulierung', elements:[
          {id:'s2_title', type:'title', html:'Zielformulierung'},
          {id:'s2_subtitle', type:'subtitle', html:'Hier werden die Einzelziele der Beteiligten, erkennbare Gemeinsamkeiten und die gemeinsame Zielvereinbarung zusammengeführt.'},
          {id:'s2_table', type:'table', table:{headers:['Bereich','Eintrag'], rows:[['Ziel Schulleitung','p3zielSL'],['Ziel Lehrkraft A','p3zielA'],['Ziel Lehrkraft B','p3zielB'],['Gefundene Gemeinsamkeiten','p3gemeinsam'],['Gemeinsame Zielvereinbarung','p3ziel']]}}
      ]},
      { id:'deep', title:'Vertiefte Problembearbeitung', elements:[
          {id:'s3_title', type:'title', html:'Vertiefte Problembearbeitung'},
          {id:'s3_subtitle', type:'subtitle', html:'Hier wird festgehalten, wie hilfreiche Kritik formuliert werden kann und welche Absprachen für die weitere Zusammenarbeit getroffen wurden.'},
          {id:'s3_table', type:'table', table:{headers:['Aspekt','Ergebnis'], rows:[['Hilfreiche Kritik','p4kritik'],['Absprachen zum weiteren Vorgehen','p4absprachen']]}}
      ]},
      { id:'implementation', title:'Umsetzung', elements:[
          {id:'s4_title', type:'title', html:'Umsetzung'},
          {id:'s4_subtitle', type:'subtitle', html:'Diese Folie zeigt Zustimmung, Praxistauglichkeit und erste konkrete Schritte zur Umsetzung der Vereinbarung.'},
          {id:'s4_table', type:'table', table:{headers:['Aspekt','Ergebnis'], rows:[['Zustimmung zur Vereinbarung','p5zustimmung'],['Einschätzung der Praxistauglichkeit durch die Schulleitung','p6prax'],['Unterstützungsmöglichkeiten durch die Schulleitung','p6support'],['Erste konkrete Umsetzungsschritte','p6steps']]}}
      ]},
      { id:'thanks', title:'Danke', elements:[{id:'s5_thanks', type:'thanks', html:'Vielen Dank fürs Zuhören!'}] }
    ];
  }

  function elementKey(id){ return id + '__text'; }
  function getElementText(elDef){
    if (draft.text && draft.text[elementKey(elDef.id)] !== undefined) return draft.text[elementKey(elDef.id)];
    if (elDef.field) return draft.values[elDef.field] || elDef.html || '';
    return elDef.html || '';
  }
  function renderTable(def, values, editable){
    const headers = def.headers.map(h => `<th>${esc(h)}</th>`).join('');
    const rows = def.rows.map(row => `<tr>${row.map((cell, i) => {
      if(i === 0) return `<td>${esc(cell)}</td>`;
      const txt = valueText(values[cell]);
      return `<td data-v6-field="${esc(cell)}" contenteditable="${editable ? 'true':'false'}">${esc(txt)}</td>`;
    }).join('')}</tr>`).join('');
    return `<table class="v6-table"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
  }
  function getLayout(id, type){
    const l = draft.layout[id] || defaultLayout(type, slideIndex);
    return Object.assign({}, defaultLayout(type, slideIndex), l);
  }
  function setLayout(id, type, changes){ draft.layout[id] = Object.assign({}, getLayout(id,type), changes || {}); }
  function styleFor(layout){
    const fs = layout.fontSize ? `font-size:${Number(layout.fontSize)}px;` : '';
    const col = layout.color ? `color:${layout.color};` : '';
    return `left:${layout.x}%;top:${layout.y}%;width:${layout.w}%;height:${layout.h}%;transform:rotate(${layout.rot||0}deg);z-index:${layout.z||20};${fs}${col}`;
  }
  function renderElement(elDef, editable){
    const id = elDef.id, type = elDef.type;
    const layout = getLayout(id,type);
    const selected = selectedId === id ? ' is-selected' : '';
    let content = '';
    if(type === 'table') content = renderTable(elDef.table, draft.values, editable);
    else content = `<div class="v6-editable-text" contenteditable="${editable ? 'true':'false'}" data-v6-text="${esc(id)}">${esc(getElementText(elDef))}</div>`;
    return `<div class="v6-el v6-base v6-type-${esc(type)}${selected}" data-v6-id="${esc(id)}" data-v6-type="${esc(type)}" data-v6-deletable="false" style="${styleFor(layout)}">${content}${editable ? handlesHtml(false) : ''}</div>`;
  }
  function handlesHtml(deletable){
    return `<button type="button" class="v6-handle v6-move" title="Verschieben">•</button><button type="button" class="v6-handle v6-rotate" title="Drehen">↻</button><button type="button" class="v6-handle v6-resize" title="Größe ändern">◢</button>`;
  }
  function renderTextBox(tb, editable){
    const selected = selectedId === tb.id ? ' is-selected' : '';
    const l = Object.assign({}, defaultLayout('textbox'), tb);
    return `<div class="v6-el v6-textbox${selected}" data-v6-id="${esc(tb.id)}" data-v6-type="textbox" data-v6-deletable="true" style="${styleFor(l)}"><div class="v6-editable-text" contenteditable="${editable ? 'true':'false'}" data-v6-textbox="${esc(tb.id)}">${esc(tb.text || '')}</div>${editable ? handlesHtml(true) : ''}</div>`;
  }
  function renderSticker(st, editable){
    const selected = selectedId === st.id ? ' is-selected' : '';
    const l = Object.assign({}, defaultLayout('sticker'), st);
    return `<div class="v6-el v6-sticker${selected}" data-v6-id="${esc(st.id)}" data-v6-type="sticker" data-v6-deletable="true" style="${styleFor(l)}"><img draggable="false" src="${esc(st.src)}" alt="Sticker">${editable ? handlesHtml(true) : ''}</div>`;
  }
  function renderSlide(){
    const slide = modal.querySelector('#v6Slide');
    if(!slide || !draft) return;
    const defs = slideDefs(draft.values);
    const def = defs[slideIndex];
    let html = def.elements.map(e => renderElement(e, editMode)).join('');
    html += (draft.textboxes || []).filter(x => x.slide === slideIndex).map(x => renderTextBox(x, editMode)).join('');
    html += (draft.stickers || []).filter(x => x.slide === slideIndex).map(x => renderSticker(x, editMode)).join('');
    slide.innerHTML = html;
    applyTheme();
    bindSlideInteractions();
    updateToolbar();
  }
  function renderAll(){ renderSlide(); updateToolbar(); }

  function patternCss(pattern, color){
    color = color || 'rgba(30,58,95,.14)';
    if(!pattern || pattern === 'none') return '';
    if(pattern === 'dots') return `radial-gradient(${color} 1.5px, transparent 1.8px)`;
    if(pattern === 'grid') return `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`;
    if(pattern === 'diagonal') return `repeating-linear-gradient(135deg, ${color} 0 1px, transparent 1px 16px)`;
    if(pattern === 'waves') return `radial-gradient(ellipse at 50% 120%, transparent 0 22px, ${color} 23px, transparent 24px)`;
    return '';
  }
  function patternSize(pattern){ if(pattern==='dots') return '18px 18px'; if(pattern==='grid') return '22px 22px, 22px 22px'; if(pattern==='waves') return '46px 24px'; return 'auto'; }
  function applyTheme(){
    const stage = modal && modal.querySelector('#v6Stage');
    const slide = modal && modal.querySelector('#v6Slide');
    if(!stage || !slide || !draft) return;
    const s = Object.assign({}, THEME_DEFAULT, draft.settings || {});
    stage.style.backgroundColor = s.background;
    stage.style.backgroundImage = [s.backgroundImage ? `url("${s.backgroundImage}")` : '', patternCss(s.backgroundPattern, s.backgroundPatternColor)].filter(Boolean).join(', ');
    stage.style.backgroundSize = [s.backgroundImage ? 'cover' : '', patternSize(s.backgroundPattern)].filter(Boolean).join(', ');
    stage.style.backgroundPosition = 'center';
    slide.style.backgroundColor = s.slide;
    slide.style.backgroundImage = patternCss(s.slidePattern, s.slidePatternColor);
    slide.style.backgroundSize = patternSize(s.slidePattern);
    slide.style.color = s.text;
    slide.style.setProperty('--v6-heading-color', s.heading);
    slide.style.setProperty('--v6-text-color', s.text);
  }

  function ensureModal(){
    if(modal) return modal;
    modal = document.createElement('div');
    modal.id = 'presentationPrepModalV6';
    modal.className = 'v6-modal';
    modal.hidden = true;
    modal.innerHTML = `
      <div class="v6-shell">
        <div class="v6-toolbar v6-mainbar" data-editor-toolbar>
          <button type="button" id="v6Edit" class="secondary">Bearbeitungsmodus</button>
          <button type="button" id="v6Undo" class="secondary" disabled>Rückgängig</button>
          <button type="button" id="v6AddMenu" class="secondary" disabled>Hinzufügen</button>
          <button type="button" id="v6DesignMenu" class="secondary" disabled>Design</button>
          <button type="button" id="v6DeleteTop" class="danger" disabled>Löschen</button>
          <button type="button" id="v6Reset" class="warning-btn" disabled>Zurücksetzen</button>
          <span class="v6-spacer"></span>
          <button type="button" id="v6Save" class="success-btn">Speichern</button>
          <button type="button" id="v6Close" class="secondary">Schließen</button>
        </div>
        <div class="v6-toolbar v6-dock" id="v6AddDock" data-editor-toolbar hidden>
          <button type="button" id="v6AddText" class="secondary">Text</button>
          <button type="button" id="v6AddSticker" class="secondary">Sticker</button>
          <input id="v6BgInput" type="file" accept="image/*" hidden>
          <button type="button" id="v6BgBtn" class="secondary">Hintergrundbild</button>
          <button type="button" id="v6BgRemove" class="secondary">Bild entfernen</button>
        </div>
        <div class="v6-toolbar v6-dock" id="v6DesignDock" data-editor-toolbar hidden>
          <label>Farbe <select id="v6DesignTarget"><option value="slide">Folie</option><option value="background">Hintergrund</option></select></label>
          <input id="v6DesignColor" type="color" value="#ffffff" aria-label="Farbe wählen">
          <span class="v6-sep-neon" aria-hidden="true"></span>
          <label>Musterziel <select id="v6PatternTarget"><option value="slide">Folie</option><option value="background">Hintergrund</option></select></label>
          <label>Muster <select id="v6PatternType"><option value="none">Kein Muster</option><option value="dots">Punkte</option><option value="grid">Raster</option><option value="diagonal">Diagonal</option><option value="waves">Wellen</option></select></label>
          <label>Musterfarbe <input id="v6PatternColor" type="color" value="#dbe4ef"></label>
        </div>
        <div class="v6-toolbar v6-contextbar" id="v6Context" data-editor-toolbar hidden>
          <label>Schriftgröße <input id="v6FontSize" type="number" min="8" max="140" value="22"> px</label>
          <label>Textfarbe <input id="v6TextColor" type="color" value="#0f172a"></label>
          <span class="v6-sep-neon" aria-hidden="true"></span>
          <span class="v6-layer-control" aria-label="Ebenensteuerung">
            <button type="button" id="v6AllBack" class="secondary" title="Ganz nach hinten">&lt;&lt;</button>
            <button type="button" id="v6Back" class="secondary" title="Eine Ebene nach hinten">&lt;</button>
            <span class="v6-layer-indicator">Ebene: <strong id="v6LayerLevel">—</strong></span>
            <button type="button" id="v6Front" class="secondary" title="Eine Ebene nach vorne">&gt;</button>
            <button type="button" id="v6AllFront" class="secondary" title="Ganz nach vorne">&gt;&gt;</button>
          </span>
          <span class="v6-sep-neon" aria-hidden="true"></span>
          <button type="button" id="v6Delete" class="danger" disabled>Auswahl löschen</button>
        </div>
        <div id="v6Stage" class="v6-stage"><section id="v6Slide" class="v6-slide"></section></div>
        <div class="v6-slide-nav" data-editor-toolbar>
          <button type="button" id="v6Prev" class="secondary">←</button>
          <span id="v6Counter" class="v6-bottom-counter">1 / 6</span>
          <button type="button" id="v6Next" class="secondary">→</button>
        </div>
        <div id="v6Toast" class="v6-toast" hidden></div>
      </div>`;
    document.body.appendChild(modal);
    bindModal();
    return modal;
  }
  function bindModal(){
    const $ = (s) => modal.querySelector(s);
    modal.addEventListener('pointerdown', (e) => { if(e.target.closest('[data-editor-toolbar], .v6-el, .v6-picker')) return; if(editMode) select(null); });
    $('#v6Save').addEventListener('click', commit);
    $('#v6Close').addEventListener('click', close);
    $('#v6Prev').addEventListener('click', () => { slideIndex = clamp(slideIndex-1,0,SLIDE_COUNT-1); select(null); renderSlide(); });
    $('#v6Next').addEventListener('click', () => { slideIndex = clamp(slideIndex+1,0,SLIDE_COUNT-1); select(null); renderSlide(); });
    $('#v6Edit').addEventListener('click', () => { editMode = !editMode; if(!editMode){ activePanel=null; select(null); } updateToolbar(); renderSlide(); });
    $('#v6Undo').addEventListener('click', undo);
    $('#v6AddMenu').addEventListener('click', () => { if(!editMode) return; selectedId=null; if(modal) modal.querySelectorAll('.v6-el').forEach(el=>el.classList.remove('is-selected')); activePanel = activePanel === 'add' ? null : 'add'; updateToolbar(); });
    $('#v6DesignMenu').addEventListener('click', () => { if(!editMode) return; selectedId=null; if(modal) modal.querySelectorAll('.v6-el').forEach(el=>el.classList.remove('is-selected')); activePanel = activePanel === 'design' ? null : 'design'; syncDesignInputs(); syncPatternInputs(); updateToolbar(); });
    $('#v6AddText').addEventListener('click', addTextBox);
    $('#v6AddSticker').addEventListener('click', openStickerPicker);
    $('#v6Reset').addEventListener('click', async () => { if(!editMode) return; const ok = window.supervisionConfirm ? await window.supervisionConfirm('Präsentationslayout auf den ursprünglichen Stand zurücksetzen?', 'Präsentation zurücksetzen', true) : confirm('Präsentationslayout auf den ursprünglichen Stand zurücksetzen?'); if(ok) resetToBaseline(); });
    $('#v6DesignTarget').addEventListener('change', syncDesignInputs);
    $('#v6DesignColor').addEventListener('input', () => { if(!editMode) return; pushUndoOnce('design_'+$('#v6DesignTarget').value); const t=$('#v6DesignTarget').value; if(t !== 'slide' && t !== 'background') return; draft.settings[t] = $('#v6DesignColor').value; dirty=true; applyTheme(); });
    $('#v6PatternTarget').addEventListener('change', syncPatternInputs);
    $('#v6PatternType').addEventListener('change', () => { if(!editMode) return; pushUndoOnce('pattern_'+$('#v6PatternTarget').value); setPatternFromControls(); });
    $('#v6PatternColor').addEventListener('input', () => { if(!editMode) return; pushUndoOnce('patternColor_'+$('#v6PatternTarget').value); setPatternFromControls(); });
    $('#v6BgBtn').addEventListener('click', () => { if(!editMode) return; $('#v6BgInput').click(); });
    $('#v6BgRemove').addEventListener('click', () => { if(!editMode) return; pushUndo(); draft.settings.backgroundImage=''; dirty=true; applyTheme(); updateToolbar(); });
    $('#v6BgInput').addEventListener('change', (e) => { const f=e.target.files && e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ pushUndo(); draft.settings.backgroundImage=String(r.result||''); dirty=true; applyTheme(); updateToolbar(); }; r.readAsDataURL(f); e.target.value=''; });
    $('#v6FontSize').addEventListener('input', () => { if(!selectedId || !editMode) return; pushUndoOnce('fontsize_'+selectedId); setSelectedStyle({fontSize: clamp(num($('#v6FontSize').value,22),8,140)}); });
    $('#v6TextColor').addEventListener('input', () => { if(!selectedId || !editMode) return; pushUndoOnce('color_'+selectedId); setSelectedStyle({color: $('#v6TextColor').value}); });
    $('#v6Front').addEventListener('click', () => { if(!selectedId || !editMode) return; pushUndo(); moveLayer(1); });
    $('#v6Back').addEventListener('click', () => { if(!selectedId || !editMode) return; pushUndo(); moveLayer(-1); });
    $('#v6AllFront').addEventListener('click', () => { if(!selectedId || !editMode) return; pushUndo(); moveLayer('front'); });
    $('#v6AllBack').addEventListener('click', () => { if(!selectedId || !editMode) return; pushUndo(); moveLayer('back'); });
    $('#v6Delete').addEventListener('click', deleteSelected);
    $('#v6DeleteTop').addEventListener('click', deleteSelected);
  }
  function syncDesignInputs(){
    const t=modal.querySelector('#v6DesignTarget').value;
    const val = (t === 'background') ? (draft.settings.background || THEME_DEFAULT.background) : (draft.settings.slide || THEME_DEFAULT.slide);
    modal.querySelector('#v6DesignColor').value = val || '#ffffff';
  }
  function syncPatternInputs(){
    const t=modal.querySelector('#v6PatternTarget').value;
    const typeEl = modal.querySelector('#v6PatternType');
    const colorEl = modal.querySelector('#v6PatternColor');
    if(t==='background') {
      typeEl.value = draft.settings.backgroundPattern || 'none';
      colorEl.value = draft.settings.backgroundPatternColor || '#12372d';
    } else {
      typeEl.value = draft.settings.slidePattern || 'none';
      colorEl.value = draft.settings.slidePatternColor || '#dbe4ef';
    }
  }
  function setPatternFromControls(){
    const target = modal.querySelector('#v6PatternTarget').value;
    const pattern = modal.querySelector('#v6PatternType').value || 'none';
    const color = modal.querySelector('#v6PatternColor').value || '#dbe4ef';
    if(target === 'background') {
      draft.settings.backgroundPattern = pattern;
      draft.settings.backgroundPatternColor = color;
    } else {
      draft.settings.slidePattern = pattern;
      draft.settings.slidePatternColor = color;
    }
    dirty = true;
    applyTheme();
  }
  function open(){
    ensureModal();
    draft = clone(getSaved());
    savedAtOpen = clone(draft);
    dirty = false; editMode = false; slideIndex = 0; selectedId = null; undoStack = []; activePanel = null;
    modal.hidden = false;
    document.documentElement.classList.add('v6-modal-open');
    renderAll();
  }
  async function close(){
    if(dirty){
      let save = false;
      if (window.supervisionNiceDialog) {
        save = await new Promise(resolve => {
          const wrap = document.createElement('div');
          wrap.className = 'nice-modal';
          wrap.innerHTML = `<div class="nice-modal-backdrop"></div><div class="nice-modal-card" role="dialog" aria-modal="true"><h2>Ungespeicherte Änderungen</h2><p>Möchtest du die Änderungen speichern, bevor die Präsentationsbearbeitung geschlossen wird?</p><div class="nice-modal-actions"><button type="button" class="secondary" data-act="cancel">Abbrechen</button><button type="button" class="secondary" data-act="discard">Ohne Speichern schließen</button><button type="button" data-act="save">Speichern und schließen</button></div></div>`;
          document.body.appendChild(wrap);
          wrap.addEventListener('click', e => {
            const b = e.target.closest('[data-act]');
            if(!b) return;
            const act = b.dataset.act;
            wrap.remove();
            if(act === 'cancel') resolve(null);
            else if(act === 'save') resolve(true);
            else resolve(false);
          });
        });
        if(save === null) return;
      } else {
        save = confirm('Änderungen speichern? OK = speichern, Abbrechen = ohne Speichern schließen.');
      }
      if(save) commit(); else { draft = clone(savedAtOpen); dirty = false; }
    }
    if(modal) modal.hidden = true;
    document.documentElement.classList.remove('v6-modal-open');
  }
  function commit(){
    persistDomEdits();
    setLS(storageKey(STATE_KEY_BASE), draft);
    Object.entries(FIELD_MAP).forEach(([vKey, saveKey]) => { if(draft.values[vKey] !== undefined) saveTextSafe(saveKey, draft.values[vKey]); });
    dirty = false; undoStack = []; savedAtOpen = clone(draft); updateToolbar(); toast('Gespeichert');
    try{ if(typeof renderSummary === 'function') renderSummary(getData()); }catch(e){}
  }
  function toast(msg){ const t=modal.querySelector('#v6Toast'); t.textContent=msg; t.hidden=false; clearTimeout(t._to); t._to=setTimeout(()=>t.hidden=true,1200); }
  function pushUndo(){ if(!draft) return; undoStack.push(clone(draft)); if(undoStack.length>10) undoStack.shift(); updateToolbar(); }
  const undoTimers = {};
  function pushUndoOnce(token){ if(undoTimers[token]) return; pushUndo(); undoTimers[token] = setTimeout(()=>{ delete undoTimers[token]; }, 500); }
  function undo(){ if(!undoStack.length) return; draft = undoStack.pop(); dirty=true; selectedId=null; renderAll(); }
  function markDirty(){ dirty = true; updateToolbar(); }
  function persistDomEdits(){
    if(!modal || !draft) return;
    modal.querySelectorAll('[data-v6-field]').forEach(td => { draft.values[td.dataset.v6Field] = td.innerText.trim(); });
    modal.querySelectorAll('[data-v6-text]').forEach(el => { draft.text[elementKey(el.dataset.v6Text)] = el.innerText.trim(); });
    modal.querySelectorAll('[data-v6-textbox]').forEach(el => { const tb=(draft.textboxes||[]).find(x=>x.id===el.dataset.v6Textbox); if(tb) tb.text=el.innerText; });
  }
  function elementKey(id){ return id + '__text'; }

  function bindSlideInteractions(){
    const slide = modal.querySelector('#v6Slide');
    slide.querySelectorAll('[data-v6-id]').forEach(el => {
      el.addEventListener('pointerdown', (e) => { if(!editMode) return; if(e.target.closest('.v6-handle')) return; select(el.dataset.v6Id); });
      el.querySelectorAll('[contenteditable="true"]').forEach(ed => {
        ed.addEventListener('input', () => { pushUndoOnce('input_'+(el.dataset.v6Id||'')); persistDomEdits(); markDirty(); });
        ed.addEventListener('focus', () => select(el.dataset.v6Id));
      });
      const move = el.querySelector('.v6-move'); if(move) move.addEventListener('pointerdown', e => startTransform(e, el, 'move'));
      const resize = el.querySelector('.v6-resize'); if(resize) resize.addEventListener('pointerdown', e => startTransform(e, el, 'resize'));
      const rotate = el.querySelector('.v6-rotate'); if(rotate) rotate.addEventListener('pointerdown', e => startTransform(e, el, 'rotate'));
    });
  }
  function select(id){
    selectedId = id;
    if(id) activePanel = 'context';
    else if(activePanel === 'context') activePanel = null;
    if(modal) {
      modal.querySelectorAll('.v6-el').forEach(el => el.classList.toggle('is-selected', el.dataset.v6Id === id));
    }
    updateToolbar();
  }
  function getElement(id){ return modal ? modal.querySelector(`[data-v6-id="${cssEscape(id)}"]`) : null; }
  function getElType(el){ return el.dataset.v6Type || 'main'; }
  function getElLayout(el){
    const id = el.dataset.v6Id, type = getElType(el);
    if(id.startsWith('tb_')) return Object.assign({}, defaultLayout('textbox'), draft.textboxes.find(x=>x.id===id) || {});
    if(id.startsWith('st_')) return Object.assign({}, defaultLayout('sticker'), draft.stickers.find(x=>x.id===id) || {});
    return getLayout(id,type);
  }
  function setElLayout(el, changes){
    const id = el.dataset.v6Id, type = getElType(el);
    if(id.startsWith('tb_')) { const obj=draft.textboxes.find(x=>x.id===id); if(obj) Object.assign(obj, changes); }
    else if(id.startsWith('st_')) { const obj=draft.stickers.find(x=>x.id===id); if(obj) Object.assign(obj, changes); }
    else setLayout(id,type,changes);
    const l=getElLayout(el); el.setAttribute('style', styleFor(l)); el.classList.add('is-selected');
  }
  function startTransform(e, el, mode){
    e.preventDefault(); e.stopPropagation();
    if(!editMode) return;
    select(el.dataset.v6Id); pushUndo();
    const slide = modal.querySelector('#v6Slide'); const sr = slide.getBoundingClientRect(); const er = el.getBoundingClientRect(); const l = getElLayout(el);
    const center = {x: er.left + er.width/2, y: er.top + er.height/2};
    drag = { mode, el, sr, startX:e.clientX, startY:e.clientY, x:num(l.x,0), y:num(l.y,0), w:num(l.w,20), h:num(l.h,10), rot:num(l.rot,0), center, startAngle: Math.atan2(e.clientY-center.y, e.clientX-center.x)*180/Math.PI };
    try{ e.target.setPointerCapture && e.target.setPointerCapture(e.pointerId); }catch(_e){}
    window.addEventListener('pointermove', onTransformMove);
    window.addEventListener('pointerup', endTransform, {once:true});
  }
  function onTransformMove(e){
    if(!drag) return;
    const dx = (e.clientX - drag.startX) / drag.sr.width * 100;
    const dy = (e.clientY - drag.startY) / drag.sr.height * 100;
    let changes = {};
    if(drag.mode === 'move') changes = {x: clamp(drag.x + dx, -30, 130), y: clamp(drag.y + dy, -30, 130)};
    if(drag.mode === 'resize') changes = {w: clamp(drag.w + dx, 4, 160), h: clamp(drag.h + dy, 3, 120)};
    if(drag.mode === 'rotate') { const a = Math.atan2(e.clientY-drag.center.y, e.clientX-drag.center.x)*180/Math.PI; changes = {rot: drag.rot + (a - drag.startAngle)}; }
    setElLayout(drag.el, changes); dirty = true;
  }
  function endTransform(){ window.removeEventListener('pointermove', onTransformMove); drag = null; updateToolbar(); }
  function setSelectedStyle(changes){ const el = selectedId ? getElement(selectedId) : null; if(!el) return; setElLayout(el, changes); markDirty(); }
  function orderedElements(){
    const slide = modal && modal.querySelector('#v6Slide');
    if(!slide) return [];
    return Array.from(slide.querySelectorAll('.v6-el')).map((node, i) => ({node, z:num(getElLayout(node).z,20), i})).sort((a,b)=>(a.z-b.z)||(a.i-b.i));
  }
  function normalizeLayers(items){
    items.forEach((item, i) => setElLayout(item.node, {z: 10 + (i+1)*10}));
  }
  function moveLayer(direction){
    const el = selectedId ? getElement(selectedId) : null;
    if(!el) return;
    const items = orderedElements();
    const idx = items.findIndex(item => item.node === el);
    if(idx < 0) return;
    const [current] = items.splice(idx, 1);
    let target = idx;
    if(direction === 'front') target = items.length;
    else if(direction === 'back') target = 0;
    else target = clamp(idx + Number(direction || 0), 0, items.length);
    items.splice(target, 0, current);
    normalizeLayers(items);
    markDirty(); updateToolbar();
  }
  function deleteSelected(){
    const el = selectedId ? getElement(selectedId) : null; if(!el || el.dataset.v6Deletable !== 'true') return;
    pushUndo();
    draft.textboxes = (draft.textboxes||[]).filter(x => x.id !== selectedId);
    draft.stickers = (draft.stickers||[]).filter(x => x.id !== selectedId);
    selectedId = null; markDirty(); renderSlide();
  }
  function addTextBox(){ if(!editMode) return; pushUndo(); const id=uid('tb'); draft.textboxes.push({id, slide:slideIndex, text:'Neuer Text', x:12, y:74, w:28, h:10, rot:0, z:100, fontSize:18, color:draft.settings.text}); dirty=true; renderSlide(); select(id); }
  function stickerCategoryNames(){ return Object.keys(STICKER_CATEGORIES); }
  function preloadStickerImages(){
    const files = STICKERS.slice();
    let done = 0;
    const total = files.length || 1;
    const status = picker && picker.querySelector('[data-sticker-loading-status]');
    return Promise.all(files.map(file => new Promise(resolve => {
      const img = new Image();
      img.onload = img.onerror = () => { done++; if(status) status.textContent = `Sticker werden geladen … ${done} / ${total}`; resolve(); };
      img.src = STICKER_PATH + file;
    })));
  }
  function renderStickerPickerCategory(category){
    if(!picker) return;
    const names = stickerCategoryNames();
    const active = names.includes(category) ? category : names[0];
    picker.dataset.category = active;
    const grid = picker.querySelector('[data-sticker-grid]');
    const title = picker.querySelector('[data-sticker-category-title]');
    if(title) title.textContent = active;
    if(!grid) return;
    const files = STICKER_CATEGORIES[active] || [];
    grid.innerHTML = files.map((f, i) => `
      <button type="button" class="v6-sticker-card" data-sticker="${esc(f)}" aria-label="${esc(active)} Sticker ${i+1}">
        <span class="v6-sticker-number">${i+1}</span>
        <img src="${STICKER_PATH+esc(f)}" alt="${esc(active)} ${i+1}">
      </button>`).join('');
  }
  function changeStickerCategory(dir){
    if(!picker) return;
    const names = stickerCategoryNames();
    const current = picker.dataset.category || names[0];
    const index = Math.max(0, names.indexOf(current));
    const next = names[(index + dir + names.length) % names.length];
    renderStickerPickerCategory(next);
  }
  function addStickerFromFile(file){
    if(!editMode || !file) return;
    pushUndo();
    const id=uid('st');
    const isDecor = /^Dekor/i.test(file);
    draft.stickers.push({id, slide:slideIndex, src:STICKER_PATH+file, x:isDecor?62:54, y:isDecor?24:42, w:isDecor?18:30, h:isDecor?18:26, rot:0, z:110});
    if(picker) picker.hidden=true;
    dirty=true;
    renderSlide();
    select(id);
  }
  function openStickerPicker(){
    if(!editMode) return;
    if(!picker){
      picker = document.createElement('div');
      picker.className='v6-picker v6-sticker-picker-advanced';
      picker.hidden=true;
      picker.innerHTML = `
        <div class="v6-picker-box v6-sticker-picker-box">
          <div class="v6-picker-head">
            <div>
              <h2>Sticker hinzufügen</h2>
              <p class="v6-picker-subline" data-sticker-loading-status>Sticker werden geladen …</p>
            </div>
            <button type="button" class="secondary" data-close-picker>Schließen</button>
          </div>
          <div class="v6-sticker-category-row" aria-label="Sticker-Kategorie">
            <button type="button" class="secondary v6-category-arrow" data-category-prev aria-label="Vorherige Kategorie">←</button>
            <h3 data-sticker-category-title>Teamwork</h3>
            <button type="button" class="secondary v6-category-arrow" data-category-next aria-label="Nächste Kategorie">→</button>
          </div>
          <div class="v6-picker-grid v6-sticker-grid" data-sticker-grid></div>
        </div>`;
      document.body.appendChild(picker);
      picker.addEventListener('click', e => {
        if(e.target === picker || e.target.closest('[data-close-picker]')) { picker.hidden=true; return; }
        if(e.target.closest('[data-category-prev]')) { changeStickerCategory(-1); return; }
        if(e.target.closest('[data-category-next]')) { changeStickerCategory(1); return; }
        const btn=e.target.closest('[data-sticker]');
        if(btn) addStickerFromFile(btn.dataset.sticker);
      });
    }
    picker.hidden=false;
    const status = picker.querySelector('[data-sticker-loading-status]');
    if(status) status.textContent = 'Sticker werden geladen …';
    const grid = picker.querySelector('[data-sticker-grid]');
    if(grid) grid.innerHTML = '<div class="v6-sticker-loading-card">Sticker werden vorbereitet …</div>';
    preloadStickerImages().then(() => {
      if(!picker || picker.hidden) return;
      const status2 = picker.querySelector('[data-sticker-loading-status]');
      if(status2) status2.textContent = 'Wähle einen Sticker aus. Mit den Pfeilen wechselst du die Kategorie.';
      renderStickerPickerCategory(picker.dataset.category || 'Teamwork');
    });
  }

  function updateToolbar(){
    if(!modal || !draft) return;
    const counter = modal.querySelector('#v6Counter');
    if(counter) counter.textContent = `${slideIndex+1} / ${SLIDE_COUNT}${dirty ? ' · ungespeichert' : ''}`;
    const editBtn = modal.querySelector('#v6Edit');
    editBtn.textContent = editMode ? 'Bearbeitung aktiv' : 'Bearbeitungsmodus';
    editBtn.classList.toggle('success-btn', editMode);

    const addMenu = modal.querySelector('#v6AddMenu');
    const designMenu = modal.querySelector('#v6DesignMenu');
    const resetBtn = modal.querySelector('#v6Reset');
    const undoBtn = modal.querySelector('#v6Undo');
    const deleteTop = modal.querySelector('#v6DeleteTop');
    const el = selectedId ? getElement(selectedId) : null;
    const canDelete = !!(editMode && el && el.dataset.v6Deletable === 'true');

    if(addMenu) addMenu.disabled = !editMode;
    if(designMenu) designMenu.disabled = !editMode;
    if(resetBtn) resetBtn.disabled = !editMode;
    if(undoBtn) undoBtn.disabled = !editMode || undoStack.length === 0;
    if(deleteTop) deleteTop.disabled = !canDelete;

    if(!editMode) activePanel = null;
    const addDock = modal.querySelector('#v6AddDock');
    const designDock = modal.querySelector('#v6DesignDock');
    if(addDock) addDock.hidden = !(editMode && activePanel === 'add');
    if(designDock) designDock.hidden = !(editMode && activePanel === 'design');

    const ctx = modal.querySelector('#v6Context');
    const showCtx = editMode && !!el && activePanel === 'context';
    ctx.hidden = !showCtx;
    if(!showCtx){
      const levelEl = modal.querySelector('#v6LayerLevel');
      if(levelEl) levelEl.textContent = '—';
    }
    if(showCtx){
      const l = getElLayout(el);
      modal.querySelector('#v6FontSize').value = Math.round(num(l.fontSize, parseFloat(getComputedStyle(el).fontSize) || 22));
      modal.querySelector('#v6TextColor').value = toHex(l.color || getComputedStyle(el).color || '#0f172a');
      const levelEl = modal.querySelector('#v6LayerLevel');
      if(levelEl) levelEl.textContent = getLayerLevel(el);
      const d = modal.querySelector('#v6Delete');
      if(d) d.disabled = !canDelete;
    }
    if(addMenu) addMenu.classList.toggle('success-btn', editMode && activePanel === 'add');
    if(designMenu) designMenu.classList.toggle('success-btn', editMode && activePanel === 'design');
  }
  function toHex(c){ if(!c) return '#0f172a'; if(String(c).startsWith('#')) return c; const m=String(c).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/); if(!m) return '#0f172a'; return '#'+[m[1],m[2],m[3]].map(v=>(+v).toString(16).padStart(2,'0')).join(''); }

  function getLayerLevel(el){
    if(!el) return '—';
    const slide = modal && modal.querySelector('#v6Slide');
    if(!slide) return '—';
    const elements = orderedElements();
    const idx = elements.findIndex(item => item.node === el);
    return idx >= 0 ? String(idx + 1) : '—';
  }

  function finalRenderState(state, host){
    state = mergeState(state || makeState(initialValues()));
    const values = state.values || {};
    const defs = slideDefs(values);
    const slide = defs[slideIndex] || defs[0];
    const settings = Object.assign({}, THEME_DEFAULT, state.settings || {});
    host.style.backgroundColor = settings.background;
    host.style.backgroundImage = [settings.backgroundImage ? `url("${settings.backgroundImage}")` : '', patternCss(settings.backgroundPattern, settings.backgroundPatternColor)].filter(Boolean).join(', ');
    host.style.backgroundSize = [settings.backgroundImage ? 'cover' : '', patternSize(settings.backgroundPattern)].filter(Boolean).join(', ');
    host.style.backgroundPosition = 'center';
    const slideHtml = slide.elements.map(e => {
      const l = Object.assign({}, defaultLayout(e.type, slideIndex), (state.layout||{})[e.id] || {});
      const text = state.text && state.text[elementKey(e.id)] !== undefined ? state.text[elementKey(e.id)] : (e.field ? (values[e.field] || e.html || '') : (e.html || ''));
      let content = '';
      if(e.type === 'table') content = renderReadOnlyTable(e.table, values);
      else content = `<div class="v6-editable-text">${esc(text)}</div>`;
      return `<div class="v6-el v6-base v6-type-${esc(e.type)}" style="${styleFor(l)}">${content}</div>`;
    }).join('') + (state.textboxes||[]).filter(x=>x.slide===slideIndex).map(x=>`<div class="v6-el v6-textbox" style="${styleFor(Object.assign({}, defaultLayout('textbox'), x))}"><div class="v6-editable-text">${esc(x.text||'')}</div></div>`).join('') + (state.stickers||[]).filter(x=>x.slide===slideIndex).map(x=>`<div class="v6-el v6-sticker" style="${styleFor(Object.assign({}, defaultLayout('sticker'), x))}"><img src="${esc(x.src)}" alt=""></div>`).join('');
    return `<section class="v6-slide v6-final-slide" style="background-color:${settings.slide};background-image:${patternCss(settings.slidePattern, settings.slidePatternColor)};background-size:${patternSize(settings.slidePattern)};color:${settings.text};--v6-heading-color:${settings.heading};--v6-text-color:${settings.text};">${slideHtml}</section>`;
  }
  function renderReadOnlyTable(def, values){
    const headers = def.headers.map(h => `<th>${esc(h)}</th>`).join('');
    const rows = def.rows.map(row => `<tr>${row.map((cell,i)=>`<td>${esc(i===0 ? cell : valueText(values[cell]))}</td>`).join('')}</tr>`).join('');
    return `<table class="v6-table"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
  }

  const oldBuildPayload = (typeof buildPayload === 'function') ? buildPayload : (window.buildPayload || null);
  if(oldBuildPayload){
    buildPayload = function(){
      const payload = oldBuildPayload();
      const state = getLS(storageKey(STATE_KEY_BASE), null);
      if(state){
        payload.presentationV6 = state;
        payload.presentationSettings = state.settings;
        payload.presentationLayout = state.layout;
        payload.presentationExtras = state.textboxes;
        payload.presentationStickers = state.stickers;
        payload.presentationTextOverrides = state.text;
        payload.presentationValues = state.values;
        payload.groupName = state.values?.groupName || payload.groupName;
      }
      return payload;
    };
  }
  window.openPresentationPrepModalFinal = open;
  window.ensurePresentationPrepModalFinal = ensureModal;
  window.closePresentationPrepModalFinal = close;

  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('openPresentationPrepBtnSafe') || document.getElementById('openPresentationPrepBtn') || document.getElementById('openPresentationPrepBtnV4');
    if(btn){ const clean = btn.cloneNode(true); btn.replaceWith(clean); clean.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); open(); }); }
    if(document.body.dataset.mode === 'presentation') initFinalPresentationV6();
  });

  async function initFinalPresentationV6(){
    const status = document.getElementById('presentationStatus');
    const slideHost = document.getElementById('presentationSlide');
    const counter = document.getElementById('presentationCounter');
    if(!slideHost) return;
    try{
      const rows = await fetchResultsWithFallback(getAppsScriptUrl());
      const param = new URLSearchParams(location.search).get('row');
      let row = rows.find(r => String(r.rowNumber || r.id) === String(param)) || rows[Number(param)-1] || rows[0];
      let st = row?.data?.presentationV6 || row?.data?.raw?.presentationV6 || row?.data?.presentationV5 || null;
      if(!st){
        const data = row?.data || {};
        st = makeState(Object.assign(initialValues(), data.presentationValues || {}, {groupName:data.groupName || row?.groupName || 'Gruppe', timestamp:data.timestamp || row?.timestamp || new Date().toISOString()}));
      }
      function draw(){ slideHost.innerHTML = finalRenderState(st, slideHost); if(counter) counter.textContent = `${slideIndex+1} / ${SLIDE_COUNT}`; }
      slideIndex=0; draw();
      document.getElementById('presentationPrevBtn')?.addEventListener('click', e=>{ e.stopImmediatePropagation(); slideIndex=clamp(slideIndex-1,0,SLIDE_COUNT-1); draw(); }, true);
      document.getElementById('presentationNextBtn')?.addEventListener('click', e=>{ e.stopImmediatePropagation(); slideIndex=clamp(slideIndex+1,0,SLIDE_COUNT-1); draw(); }, true);
      document.addEventListener('keydown', e=>{ if(e.key==='ArrowRight'||e.key===' '){ slideIndex=clamp(slideIndex+1,0,SLIDE_COUNT-1); draw(); } if(e.key==='ArrowLeft'){ slideIndex=clamp(slideIndex-1,0,SLIDE_COUNT-1); draw(); } }, true);
      if(status) status.textContent='';
    }catch(e){ if(status) status.textContent='Präsentation konnte nicht geladen werden: '+e.message; }
  }
})();
