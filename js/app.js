/* Resume Studio — app core: state, documents, history, persistence, mode switching, zoom, export */

let toastTimer = null;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

const App = {
  KEY: 'resume-studio:v1',        // single resume saved by older versions (migrated into the Store once)
  UI_KEY: 'resume-studio:ui',     // UI preferences: mode, tab, zoom
  HIST_MAX: 80,                   // undo steps
  HIST_CHARS: 40e6,               // total size of undo snapshots (images make them big)
  state: null,                    // { mode, tab, zoom, data, design, canvas } — null until loaded
  doc: null,                      // open document: { id, name, named, createdAt, updatedAt }
  hist: [],
  hi: -1,
  histSize: 0,
  saveTimer: null,
  previewTimer: null,
  saveSeq: 0,
  storageWarned: false,

  /* ----- documents ----- */
  newState(kind) {
    return {
      data: kind === 'blank' ? blankData() : sampleData(),
      design: { ...DEFAULT_DESIGN },
      canvas: { pages: [{ id: uid(), bg: '#ffffff', elements: [] }] },
    };
  },
  autoName(data) {
    const n = String((data && data.personal && data.personal.name) || '').trim();
    return n && n !== 'Your Name' ? `${n} — Resume` : 'Untitled resume';
  },
  makeDoc(state, name) {
    const now = Date.now();
    return { id: `d${now.toString(36)}${uid()}`, name: name || this.autoName(state.data), named: !!name, createdAt: now, updatedAt: now, state };
  },
  /** resume content of a stored document, repaired where needed */
  docState(doc) {
    const s = doc.state || {};
    const data = s.data && s.data.personal && Array.isArray(s.data.sections) ? s.data : blankData();
    if (!Array.isArray(data.personal.extra)) data.personal.extra = [];
    return {
      data,
      design: { ...DEFAULT_DESIGN, ...(s.design || {}) },
      canvas: s.canvas && Array.isArray(s.canvas.pages) && s.canvas.pages.length ? s.canvas : this.newState('blank').canvas,
    };
  },
  loadLegacy() {
    try {
      const s = JSON.parse(localStorage.getItem(this.KEY));
      return s && s.data && s.data.personal && Array.isArray(s.data.sections) ? s : null;
    } catch { return null; }
  },
  /** the document to open on startup: the last one opened, else migrate the old single resume, else the sample */
  async initialDoc(prefs) {
    try {
      const list = await Store.list();
      if (list.length) {
        const id = list.some((d) => d.id === Store.currentId) ? Store.currentId : list[0].id;
        const doc = await Store.get(id);
        if (doc) return doc;
      }
    } catch (e) { console.error(e); }
    const legacy = this.loadLegacy();
    if (legacy) ['mode', 'tab', 'zoom'].forEach((k) => { if (legacy[k] != null && prefs[k] == null) prefs[k] = legacy[k]; });
    const doc = this.makeDoc(legacy ? this.docState({ state: legacy }) : this.newState('sample'));
    try {
      await Store.put(doc);
      if (legacy) { try { localStorage.removeItem(this.KEY); } catch { /* harmless if it stays */ } }
    } catch (e) { this.saveFailed(e); }
    return doc;
  },
  setDoc(doc) {
    this.doc = { id: doc.id, name: doc.name || this.autoName(doc.state && doc.state.data), named: !!doc.named, createdAt: doc.createdAt || Date.now(), updatedAt: doc.updatedAt || 0 };
    Store.setCurrent(doc.id);
    this.updateDocName();
  },
  updateDocName() {
    if (!this.doc) return;
    $('#docName').textContent = this.doc.name;
    $('#docBtn').title = `${this.doc.name} — My resumes (Ctrl+O)`;
    document.title = `${this.doc.name} · Resume Studio`;
  },
  /** replace the open resume with a stored document (fresh undo history) */
  loadDoc(doc) {
    if (this.state.mode === 'canvas') Canvas.deselect();
    this.flush();
    Object.assign(this.state, this.docState(doc));
    this.setDoc(doc);
    this.resetHistory();
    this.refreshAll();
    this.setSaveState('saved');
    requestAnimationFrame(() => this.fitZoom());
  },
  async openDoc(id) {
    if (this.doc && id === this.doc.id) return true;
    if (this.state.mode === 'canvas') Canvas.deselect();
    this.flush();
    const doc = await Store.get(id);
    if (!doc) { toast('That resume could not be found'); return false; }
    this.loadDoc(doc);
    toast(`Opened “${this.doc.name}”`);
    return true;
  },
  /** store a new document and switch to it; never overwrites the open one */
  async createDoc(state, name, msg) {
    if (this.state.mode === 'canvas') Canvas.deselect();
    this.flush();
    const doc = this.makeDoc(state, name);
    try { await Store.put(doc); } catch (e) { this.saveFailed(e); return null; }
    this.loadDoc(doc);
    if (msg) toast(msg);
    return doc;
  },
  newDoc(kind) {
    return this.createDoc(this.newState(kind), null, kind === 'blank' ? 'New blank resume created' : 'New resume created from the sample');
  },
  async duplicateDoc(id = this.doc.id) {
    let src;
    if (id === this.doc.id) {
      this.flush();
      const { data, design, canvas } = this.state;
      src = { name: this.doc.name, state: clone({ data, design, canvas }) };
    } else src = await Store.get(id);
    if (!src) { toast('That resume could not be found'); return null; }
    return this.createDoc(src.state, `${src.name} (copy)`, `Duplicated as “${src.name} (copy)”`);
  },
  async renameDoc(id, name) {
    name = String(name || '').trim().slice(0, 120);
    if (id === this.doc.id) {
      this.doc.named = !!name;
      this.doc.name = name || this.autoName(this.state.data);
      this.updateDocName();
      this.flush();
      await this.save();
      return this.doc.name;
    }
    const d = await Store.get(id);
    if (!d) return null;
    d.named = !!name;
    d.name = name || this.autoName(d.state && d.state.data);
    d.updatedAt = Date.now();
    await Store.put(d);
    return d.name;
  },
  /** delete a document; deleting the open one switches to the most recent other one (or a new blank) */
  async deleteDoc(id) {
    const isCur = id === this.doc.id;
    if (isCur) {
      if (this.state.mode === 'canvas') Canvas.deselect();
      clearTimeout(this.saveTimer); this.saveTimer = null; // a pending save must not bring it back
    }
    await Store.remove(id);
    if (!isCur) return true;
    const rest = (await Store.list()).filter((d) => d.id !== id);
    const next = rest.length ? await Store.get(rest[0].id) : null;
    if (next) this.loadDoc(next);
    else await this.createDoc(this.newState('blank'));
    return true;
  },

  /* ----- persistence ----- */
  loadPrefs() {
    try { const p = JSON.parse(localStorage.getItem(this.UI_KEY)); return p && typeof p === 'object' ? p : {}; } catch { return {}; }
  },
  savePrefs() {
    if (!this.state) return;
    const { mode, tab, zoom } = this.state;
    try { localStorage.setItem(this.UI_KEY, JSON.stringify({ mode, tab, zoom })); } catch { /* storage unavailable */ }
  },
  /** write the open document to the Store; resolves true when saved */
  save() {
    if (!this.state || !this.doc) return Promise.resolve(false);
    this.savePrefs();
    const d = this.doc;
    const { data, design, canvas } = this.state;
    d.updatedAt = Math.max(Date.now(), (d.updatedAt || 0) + 1);
    if (!d.named) { d.name = this.autoName(data); this.updateDocName(); }
    const seq = ++this.saveSeq;
    this.setSaveState('saving');
    return Store.put({ ...d, state: { data, design, canvas } }).then(() => {
      if (seq === this.saveSeq && !this.saveTimer) this.setSaveState('saved');
      this.storageWarned = false;
      Store.persist();
      return true;
    }, (e) => { if (seq === this.saveSeq) this.saveFailed(e); return false; });
  },
  saveFailed(e) {
    console.error('Resume Studio: save failed', e);
    const full = e && (e.name === 'QuotaExceededError' || /quota/i.test(e.message || ''));
    this.setSaveState('error', full ? 'Browser storage is full — changes are not saved. Export JSON to keep them.' : 'Changes could not be saved in this browser. Export JSON to keep them.');
    if (!this.storageWarned) {
      toast(full ? 'Browser storage is full — export your resume as JSON to keep it safe.' : 'Could not save in this browser — export your resume as JSON to keep it safe.');
      this.storageWarned = true;
    }
  },
  setSaveState(s, title) {
    const el = $('#saveState');
    if (!el) return;
    if (s === 'saved' && Store.backend === 'memory') { s = 'error'; title = 'Browser storage is blocked — changes are lost when you close this page. Export JSON to keep them.'; }
    el.dataset.state = s;
    document.body.dataset.save = s;
    $('.save-txt', el).textContent = { saved: 'Saved', saving: 'Saving…', error: 'Not saved' }[s];
    el.title = title || { saved: 'All changes are saved in this browser', saving: 'Saving your changes…', error: 'Changes are not saved' }[s];
  },

  /* ----- history (undo / redo), one per document ----- */
  snap() { const { data, design, canvas } = this.state; return JSON.stringify({ data, design, canvas }); },
  snapshot() {
    const s = this.snap();
    if (this.hist[this.hi] === s) return;
    this.hist.splice(this.hi + 1).forEach((x) => { this.histSize -= x.length; });
    this.hist.push(s);
    this.histSize += s.length;
    while (this.hist.length > 1 && (this.hist.length > this.HIST_MAX || this.histSize > this.HIST_CHARS)) this.histSize -= this.hist.shift().length;
    this.hi = this.hist.length - 1;
    this.updateUndo();
  },
  resetHistory() { this.hist = []; this.hi = -1; this.histSize = 0; this.snapshot(); },
  flush() {
    if (!this.saveTimer) return;
    clearTimeout(this.saveTimer);
    this.saveTimer = null;
    this.snapshot();
    this.save();
  },
  undo() { this.flush(); if (this.hi <= 0) return; this.hi--; this.restore(this.hist[this.hi]); },
  redo() { this.flush(); if (this.hi >= this.hist.length - 1) return; this.hi++; this.restore(this.hist[this.hi]); },
  restore(s) {
    Object.assign(this.state, JSON.parse(s));
    this.refreshAll();
    this.save();
    this.updateUndo();
  },
  updateUndo() {
    $('#undoBtn').disabled = this.hi <= 0;
    $('#redoBtn').disabled = this.hi >= this.hist.length - 1;
  },

  /* ----- change notifications -----
     Other modules can listen for these DOM events on `document`:
       resume:ready           — first document loaded and UI built (App.state is set from here on;
                                App.ready is the same moment as a Promise)
       resume:changed {kind}  — any edit ('data' | 'design' | 'canvas')
       resume:refresh         — whole state replaced (undo/redo, import, switching / new resume)
       resume:tab {tab}       — template-mode panel tab switched
       resume:mode {mode}     — editor mode switched ('template' | 'canvas') */
  emit(name, detail) { document.dispatchEvent(new CustomEvent(name, { detail })); },
  changed(kind) {
    this.emit('resume:changed', { kind });
    if (kind !== 'canvas') { this.schedulePreview(); Gallery.markDirty(); }
    this.setSaveState('saving');
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => { this.saveTimer = null; this.snapshot(); this.save(); }, 350);
  },
  structural() { Editor.build(); this.changed('data'); },
  refreshAll() {
    Editor.build(); Design.build(); Gallery.build(); Canvas.reset();
    this.renderPreview();
    this.emit('resume:refresh');
  },

  schedulePreview() {
    clearTimeout(this.previewTimer);
    this.previewTimer = setTimeout(() => this.renderPreview(), 90);
  },
  renderPreview() {
    if (!this.state || this.state.mode !== 'template') return;
    const n = Render.render($('#tplPages'), this.state.data, this.state.design);
    $('#pageInfo').textContent = `A4 · ${n} page${n > 1 ? 's' : ''}`;
  },

  /* ----- light / dark theme (a UI preference, kept outside resume data and undo history) ----- */
  THEME_KEY: 'resume-studio:theme',
  setTheme(theme, persist = true) {
    document.documentElement.dataset.theme = theme;
    const sw = $('#themeSwitch');
    sw.setAttribute('aria-checked', String(theme === 'light'));
    sw.title = theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
    if (persist) { try { localStorage.setItem(this.THEME_KEY, theme); } catch { /* storage unavailable */ } }
  },
  initTheme() {
    let saved = null;
    try { saved = localStorage.getItem(this.THEME_KEY); } catch { /* storage unavailable */ }
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    this.setTheme(saved || (mq.matches ? 'light' : 'dark'), false);
    // follow the OS setting until the user picks a theme explicitly
    mq.addEventListener('change', (e) => {
      let picked = null;
      try { picked = localStorage.getItem(this.THEME_KEY); } catch { /* storage unavailable */ }
      if (!picked) this.setTheme(e.matches ? 'light' : 'dark', false);
    });
    $('#themeSwitch').addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
      this.setTheme(next);
      toast(next === 'light' ? 'Light mode' : 'Dark mode');
    });
  },

  /* ----- modes, tabs, zoom ----- */
  setMode(mode) {
    if (this.state.mode === 'canvas' && mode !== 'canvas') Canvas.deselect();
    this.state.mode = mode;
    $$('#modeSwitch button').forEach((b) => b.classList.toggle('active', b.dataset.mode === mode));
    $('#modeSwitch').dataset.active = mode;
    $('#modeTemplate').classList.toggle('active', mode === 'template');
    $('#modeCanvas').classList.toggle('active', mode === 'canvas');
    document.body.dataset.mode = mode;
    if (mode === 'template') { this.renderPreview(); Gallery.refresh(); } else Canvas.render();
    this.savePrefs();
    this.emit('resume:mode', { mode });
  },
  setTab(tab) {
    this.state.tab = tab;
    $$('#tplTabs button').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
    $$('[data-tab-body]').forEach((b) => b.classList.toggle('active', b.dataset.tabBody === tab));
    if (tab === 'templates') Gallery.refresh(true);
    this.savePrefs();
    this.emit('resume:tab', { tab });
  },
  setZoom(z) {
    z = Math.max(0.3, Math.min(2, Math.round(z * 100) / 100));
    this.state.zoom = z;
    ['#tplPages', '#cvPages'].forEach((s) => $(s).style.setProperty('--zoom', z));
    $('#zoomVal').textContent = `${Math.round(z * 100)}%`;
    clearTimeout(this._zt);
    this._zt = setTimeout(() => this.savePrefs(), 300);
  },
  fitZoom() {
    const stage = this.state.mode === 'canvas' ? $('#cvStage') : $('#tplStage');
    const avail = stage.clientWidth - 56;
    if (avail > 100) this.setZoom(Math.min(1, avail / PAGE_W));
  },

  /* ----- file operations ----- */
  fileName(data) { return `${(data.personal.name || 'resume').replace(/[^\w-]+/g, '_')}.resume.json`; },
  /** download a document as JSON (the open one by default) */
  async exportJSON(id) {
    let name, state;
    if (!id || id === this.doc.id) {
      this.flush();
      const { data, design, canvas } = this.state;
      name = this.doc.name; state = { data, design, canvas };
    } else {
      const d = await Store.get(id);
      if (!d) { toast('That resume could not be found'); return false; }
      name = d.name; state = d.state;
    }
    const blob = new Blob([JSON.stringify({ app: 'resume-studio', version: 1, name, ...state }, null, 2)], { type: 'application/json' });
    const a = h('a', { href: URL.createObjectURL(blob), download: this.fileName(state.data) });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast(`“${name}” exported as JSON`);
    return true;
  },
  pickImport() { $('#importInput').click(); },
  /** import a JSON backup as a NEW document and switch to it */
  importJSON(file) {
    const fr = new FileReader();
    fr.onload = async () => {
      let o;
      try {
        o = JSON.parse(fr.result);
        if (!o.data || !o.data.personal || !Array.isArray(o.data.sections)) throw new Error('bad');
      } catch { toast('That file is not a valid Resume Studio JSON'); return; }
      const state = this.docState({ state: { data: o.data, design: o.design, canvas: o.canvas } });
      const name = typeof o.name === 'string' && o.name.trim() ? o.name.trim().slice(0, 120) : null;
      const doc = await this.createDoc(state, name);
      if (doc) toast(`Imported “${doc.name}” as a new resume`);
    };
    fr.readAsText(file);
  },
  print() {
    this.flush();
    if (this.state.mode === 'canvas') Canvas.deselect(); else this.renderPreview();
    const old = document.title;
    document.title = (this.state.data.personal.name || 'Resume').trim() + ' - Resume';
    toast('In the print dialog choose “Save as PDF”, paper A4, margins None.');
    setTimeout(() => { window.print(); document.title = old; }, 300);
  },

  /** another tab may have saved this document since we loaded it: offer to reload */
  async checkExternal() {
    if (!this.doc || this._extBusy || this._extNotice) return;
    this._extBusy = true;
    try {
      const d = await Store.get(this.doc.id);
      if (!d || !(d.updatedAt > this.doc.updatedAt)) return;
      this._extNotice = DocManager.notify('This resume was changed in another tab or window.', [
        { label: 'Keep mine', run: () => { this._extNotice = null; if (this.doc && this.doc.id === d.id) { this.doc.updatedAt = Math.max(this.doc.updatedAt, d.updatedAt); this.save(); } } },
        { label: 'Load latest', primary: true, run: async () => {
          this._extNotice = null;
          const latest = await Store.get(d.id);
          if (latest && this.doc && this.doc.id === latest.id) { clearTimeout(this.saveTimer); this.saveTimer = null; this.loadDoc(latest); toast('Loaded the latest version'); }
        } },
      ]);
    } catch { /* not critical */ } finally { this._extBusy = false; }
  },

  /* ----- wiring ----- */
  bindUI() {
    $$('#modeSwitch button').forEach((b) => b.addEventListener('click', () => this.setMode(b.dataset.mode)));
    $$('#tplTabs button').forEach((b) => b.addEventListener('click', () => this.setTab(b.dataset.tab)));
    $('#undoBtn').addEventListener('click', () => this.undo());
    $('#redoBtn').addEventListener('click', () => this.redo());
    $('#zoomIn').addEventListener('click', () => this.setZoom(this.state.zoom + 0.1));
    $('#zoomOut').addEventListener('click', () => this.setZoom(this.state.zoom - 0.1));
    $('#zoomFit').addEventListener('click', () => this.fitZoom());
    $('#docBtn').addEventListener('click', () => DocManager.open());
    const logo = $('.topbar .logo');
    logo.addEventListener('click', () => DocManager.open());
    logo.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); DocManager.open(); } });
    const dlMenu = $('#downloadMenu');
    $('#downloadBtn').addEventListener('click', (e) => { e.stopPropagation(); $('#fileMenu').classList.remove('open'); dlMenu.classList.toggle('open'); });
    document.addEventListener('click', () => dlMenu.classList.remove('open'));
    dlMenu.addEventListener('click', (e) => {
      const a = e.target.closest('[data-dl]')?.dataset.dl;
      if (!a) return;
      dlMenu.classList.remove('open');
      ({
        pdf: () => Exporter.pdf($('#downloadBtn')),
        png: () => Exporter.png($('#downloadBtn')),
        excel: () => Exporter.excel(),
        txt: () => Exporter.txt(),
        print: () => this.print(),
        json: () => this.exportJSON(),
      })[a]?.();
    });

    ['#tplStage', '#cvStage'].forEach((s) => $(s).addEventListener('wheel', (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      this.setZoom(this.state.zoom * (e.deltaY < 0 ? 1.08 : 0.92));
    }, { passive: false }));

    const menu = $('#fileMenu');
    $('#fileMenuBtn').addEventListener('click', (e) => { e.stopPropagation(); $('#downloadMenu').classList.remove('open'); menu.classList.toggle('open'); });
    document.addEventListener('click', () => menu.classList.remove('open'));
    const fileInput = $('#importInput');
    fileInput.addEventListener('change', () => { if (fileInput.files[0]) this.importJSON(fileInput.files[0]); fileInput.value = ''; });
    menu.addEventListener('click', (e) => {
      const a = e.target.closest('[data-act]')?.dataset.act;
      if (!a) return;
      menu.classList.remove('open');
      ({
        docs: () => DocManager.open(),
        blank: () => this.newDoc('blank'),
        sample: () => this.newDoc('sample'),
        duplicate: () => this.duplicateDoc(),
        import: () => this.pickImport(),
        export: () => this.exportJSON(),
      })[a]?.();
    });

    // click in the template preview jumps to that section's form
    $('#tplPages').addEventListener('click', (e) => {
      const b = e.target.closest('[data-sec]');
      if (!b) return;
      this.setTab('content');
      Editor.focusSection(b.dataset.sec);
    });

    $('#cvBlank').addEventListener('click', () => Canvas.blank());
    $('#cvStarter').addEventListener('click', () => Canvas.starter());
    $('#cvFromTpl').addEventListener('click', () => Canvas.fromTemplate());
    $('#cvAddPage').addEventListener('click', () => Canvas.addPage(App.state.canvas.pages.length - 1));
    $('#toCanvasBtn').addEventListener('click', () => { this.setMode('canvas'); Canvas.fromTemplate(); });

    document.addEventListener('keydown', (e) => {
      const t = e.target;
      const typing = t.matches('input, textarea, select, [contenteditable="true"]');
      const mod = e.ctrlKey || e.metaKey;
      const k = e.key.toLowerCase();
      if (mod && k === 'o' && !e.shiftKey && !e.altKey) { e.preventDefault(); DocManager.open(); return; }
      if (mod && k === 's') { e.preventDefault(); this.flush(); this.save().then((ok) => toast(ok ? 'Saved in this browser' : 'Could not save — export JSON to keep your changes')); return; }
      if (DocManager.isOpen()) { if (mod && k === 'p') e.preventDefault(); return; }
      if (mod && k === 'z' && !typing) { e.preventDefault(); e.shiftKey ? this.redo() : this.undo(); return; }
      if (mod && k === 'y' && !typing) { e.preventDefault(); this.redo(); return; }
      if (mod && k === 'p') { e.preventDefault(); this.print(); return; }
      if (this.state.mode === 'canvas') Canvas.onKey(e, typing);
    });

    window.addEventListener('beforeprint', () => { if (this.state.mode === 'canvas') Canvas.deselect(); });
    window.addEventListener('resize', () => { clearTimeout(this._rz); this._rz = setTimeout(() => Gallery.refresh(), 200); });

    // save before the page goes away; look for edits made in other tabs when it comes back
    window.addEventListener('pagehide', () => this.flush());
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.flush(); else this.checkExternal(); });
    window.addEventListener('focus', () => this.checkExternal());

    // re-paginate once web fonts finish loading (metrics change)
    if (document.fonts) {
      document.fonts.ready.then(() => { this.renderPreview(); Gallery.refresh(true); });
      document.fonts.addEventListener('loadingdone', () => { this.schedulePreview(); Gallery.refresh(true); });
    }
  },

  async init() {
    this.initTheme();
    await Store.init();
    const prefs = this.loadPrefs();
    const doc = await this.initialDoc(prefs);
    this.state = { mode: prefs.mode === 'canvas' ? 'canvas' : 'template', tab: prefs.tab || 'content', zoom: +prefs.zoom || 0.8, ...this.docState(doc) };
    this.setDoc(doc);
    this.bindUI();
    Canvas.init();
    Editor.build();
    Design.build();
    Gallery.build();
    this.setTab(this.state.tab);
    this.setMode(this.state.mode);
    this.setZoom(this.state.zoom);
    requestAnimationFrame(() => this.fitZoom());
    this.snapshot();
    if ($('#saveState').dataset.state !== 'error') this.setSaveState('saved');
    if (Store.backend === 'memory') toast('Browser storage is blocked here — export your resume as JSON before closing this page.');
    this._ready();
    this.emit('resume:ready');
  },
};
/** resolves once the first document is loaded and the UI is built (App.state is set) */
App.ready = new Promise((res) => { App._ready = res; });

document.addEventListener('DOMContentLoaded', () => App.init().catch((e) => { console.error(e); toast('Resume Studio could not start — please reload the page.'); }));
