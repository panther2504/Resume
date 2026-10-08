/* Resume Studio — app core: state, history, persistence, mode switching, zoom, export */

let toastTimer = null;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

const App = {
  KEY: 'resume-studio:v1',
  state: null,
  hist: [],
  hi: -1,
  saveTimer: null,
  previewTimer: null,
  storageWarned: false,

  fresh() {
    return {
      mode: 'template', tab: 'content', zoom: 0.8,
      data: sampleData(),
      design: { ...DEFAULT_DESIGN },
      canvas: { pages: [{ id: uid(), bg: '#ffffff', elements: [] }] },
    };
  },
  load() {
    try {
      const s = JSON.parse(localStorage.getItem(this.KEY));
      if (!s || !s.data || !s.design || !s.canvas) return null;
      s.design = { ...DEFAULT_DESIGN, ...s.design };
      return s;
    } catch { return null; }
  },
  save() {
    try { localStorage.setItem(this.KEY, JSON.stringify(this.state)); }
    catch {
      if (!this.storageWarned) { toast('Browser storage is full — export your resume as JSON to keep it safe.'); this.storageWarned = true; }
    }
  },

  /* ----- history (undo / redo) ----- */
  snap() { const { data, design, canvas } = this.state; return JSON.stringify({ data, design, canvas }); },
  snapshot() {
    const s = this.snap();
    if (this.hist[this.hi] === s) return;
    this.hist = this.hist.slice(0, this.hi + 1);
    this.hist.push(s);
    if (this.hist.length > 80) this.hist.shift();
    this.hi = this.hist.length - 1;
    this.updateUndo();
  },
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

  /* ----- change notifications ----- */
  changed(kind) {
    if (kind !== 'canvas') { this.schedulePreview(); Gallery.markDirty(); }
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => { this.saveTimer = null; this.snapshot(); this.save(); }, 350);
  },
  structural() { Editor.build(); this.changed('data'); },
  refreshAll() {
    Editor.build(); Design.build(); Gallery.build(); Canvas.reset();
    this.renderPreview();
  },

  schedulePreview() {
    clearTimeout(this.previewTimer);
    this.previewTimer = setTimeout(() => this.renderPreview(), 90);
  },
  renderPreview() {
    if (this.state.mode !== 'template') return;
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
    this.save();
  },
  setTab(tab) {
    this.state.tab = tab;
    $$('#tplTabs button').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
    $$('[data-tab-body]').forEach((b) => b.classList.toggle('active', b.dataset.tabBody === tab));
    if (tab === 'templates') Gallery.refresh(true);
  },
  setZoom(z) {
    z = Math.max(0.3, Math.min(2, Math.round(z * 100) / 100));
    this.state.zoom = z;
    ['#tplPages', '#cvPages'].forEach((s) => $(s).style.setProperty('--zoom', z));
    $('#zoomVal').textContent = `${Math.round(z * 100)}%`;
  },
  fitZoom() {
    const stage = this.state.mode === 'canvas' ? $('#cvStage') : $('#tplStage');
    const avail = stage.clientWidth - 56;
    if (avail > 100) this.setZoom(Math.min(1, avail / PAGE_W));
  },

  /* ----- file operations ----- */
  exportJSON() {
    this.flush();
    const { data, design, canvas } = this.state;
    const blob = new Blob([JSON.stringify({ app: 'resume-studio', version: 1, data, design, canvas }, null, 2)], { type: 'application/json' });
    const a = h('a', { href: URL.createObjectURL(blob), download: `${(data.personal.name || 'resume').replace(/[^\w-]+/g, '_')}.resume.json` });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast('Resume exported as JSON');
  },
  importJSON(file) {
    const fr = new FileReader();
    fr.onload = () => {
      try {
        const o = JSON.parse(fr.result);
        if (!o.data || !o.data.personal || !Array.isArray(o.data.sections)) throw new Error('bad');
        this.state.data = o.data;
        this.state.design = { ...DEFAULT_DESIGN, ...(o.design || {}) };
        if (o.canvas && Array.isArray(o.canvas.pages)) this.state.canvas = o.canvas;
        this.refreshAll(); this.snapshot(); this.save();
        toast('Resume imported');
      } catch { toast('That file is not a valid Resume Studio JSON'); }
    };
    fr.readAsText(file);
  },
  newResume(sample) {
    if (!confirm(sample ? 'Load the sample resume? Your current content will be replaced (you can undo).' : 'Start a new blank resume? Your current content will be replaced (you can undo).')) return;
    this.state.data = sample ? sampleData() : blankData();
    this.refreshAll(); this.snapshot(); this.save();
    toast(sample ? 'Sample resume loaded' : 'New blank resume');
  },
  print() {
    this.flush();
    if (this.state.mode === 'canvas') Canvas.deselect(); else this.renderPreview();
    const old = document.title;
    document.title = (this.state.data.personal.name || 'Resume').trim() + ' - Resume';
    toast('In the print dialog choose “Save as PDF”, paper A4, margins None.');
    setTimeout(() => { window.print(); document.title = old; }, 300);
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
    const dlMenu = $('#downloadMenu');
    $('#downloadBtn').addEventListener('click', (e) => { e.stopPropagation(); $('#fileMenu').classList.remove('open'); dlMenu.classList.toggle('open'); });
    document.addEventListener('click', () => dlMenu.classList.remove('open'));
    dlMenu.addEventListener('click', (e) => {
      const a = e.target.closest('[data-dl]')?.dataset.dl;
      if (!a) return;
      dlMenu.classList.remove('open');
      ({
        pdf: () => Exporter.pdf($('#downloadBtn')),
        excel: () => Exporter.excel(),
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
        blank: () => this.newResume(false),
        sample: () => this.newResume(true),
        import: () => fileInput.click(),
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
      if (mod && k === 'z' && !typing) { e.preventDefault(); e.shiftKey ? this.redo() : this.undo(); return; }
      if (mod && k === 'y' && !typing) { e.preventDefault(); this.redo(); return; }
      if (mod && k === 'p') { e.preventDefault(); this.print(); return; }
      if (mod && k === 's') { e.preventDefault(); this.flush(); this.save(); toast('Saved in this browser'); return; }
      if (this.state.mode === 'canvas') Canvas.onKey(e, typing);
    });

    window.addEventListener('beforeprint', () => { if (this.state.mode === 'canvas') Canvas.deselect(); });
    window.addEventListener('resize', () => { clearTimeout(this._rz); this._rz = setTimeout(() => Gallery.refresh(), 200); });

    // re-paginate once web fonts finish loading (metrics change)
    if (document.fonts) {
      document.fonts.ready.then(() => { this.renderPreview(); Gallery.refresh(true); });
      document.fonts.addEventListener('loadingdone', () => { this.schedulePreview(); Gallery.refresh(true); });
    }
  },

  init() {
    this.state = this.load() || this.fresh();
    this.initTheme();
    this.bindUI();
    Canvas.init();
    Editor.build();
    Design.build();
    Gallery.build();
    this.setTab(this.state.tab || 'content');
    this.setMode(this.state.mode || 'template');
    this.setZoom(this.state.zoom || 0.8);
    requestAnimationFrame(() => this.fitZoom());
    this.snapshot();
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());
