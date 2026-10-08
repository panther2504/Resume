/* Resume Studio — documents: multiple resumes ("My resumes" manager) and IndexedDB storage

   ----- Store (window.Store): persistent storage for resume documents -----
   Documents live in IndexedDB, database 'resume-studio':
     object store 'docs'  keyPath 'id'   → document records (below)
     object store 'meta'  keyPath 'key'  → { key: 'currentId', value: <doc id> }
   When IndexedDB is unavailable or broken (some private modes) it falls back to localStorage
   ('resume-studio:doc:<id>' keys), and when that fails too, to memory (nothing survives a reload).

   Document record:
     { id, name, named, createdAt, updatedAt, state: { data, design, canvas } }
     named      true once the user chose a name; otherwise the app derives it from the personal name
     createdAt / updatedAt   ms timestamps (Date.now())

   Store.init()          → Promise<void>  open the database; never rejects (falls back instead)
   Store.list()          → Promise<[{ id, name, createdAt, updatedAt, template }]>  last edited first
   Store.all()           → Promise<[doc]> full records, last edited first
   Store.get(id)         → Promise<doc | null>  a fresh copy
   Store.put(doc)        → Promise<doc>   insert or replace. The record is copied synchronously, so
                                          editing the object afterwards does not change what is saved.
                                          Rejects on failure (err.name 'QuotaExceededError' when full).
   Store.remove(id)      → Promise<void>
   Store.currentId       id of the document open in this tab (falls back to the last opened one), or null
   Store.setCurrent(id)  → Promise<void>  remember the open document (per tab + shared default)
   Store.persist()       → Promise<boolean>  ask the browser to keep the data (navigator.storage.persist)
   Store.backend         'indexeddb' | 'localstorage' | 'memory'

   ----- DocManager (window.DocManager): the "My resumes" dialog -----
   DocManager.open() / close() / isOpen()
   DocManager.notify(text, [{ label, primary, run }])  small actionable notice (e.g. "edited in another tab")
*/

const Store = (() => {
  const DB_NAME = 'resume-studio';
  const LS_PREFIX = 'resume-studio:doc:';
  const CUR_KEY = 'resume-studio:current';
  let db = null;
  let backend = 'memory';
  let current = null;
  const mem = new Map();

  const reqP = (rq) => new Promise((res, rej) => { rq.onsuccess = () => res(rq.result); rq.onerror = () => rej(rq.error); });
  const txDone = (tx) => new Promise((res, rej) => {
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
    tx.onabort = () => rej(tx.error || new DOMException('Transaction aborted', 'AbortError'));
  });
  const summary = (d) => ({ id: d.id, name: d.name, createdAt: d.createdAt, updatedAt: d.updatedAt, template: d.state?.design?.template || 'aurora' });
  const newestFirst = (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0);

  function openDb() {
    return new Promise((res, rej) => {
      if (!window.indexedDB) return rej(new Error('IndexedDB unavailable'));
      let rq;
      try { rq = indexedDB.open(DB_NAME, 1); } catch (e) { return rej(e); }
      const timer = setTimeout(() => rej(new Error('IndexedDB open timed out')), 4000);
      rq.onupgradeneeded = () => {
        const d = rq.result;
        if (!d.objectStoreNames.contains('docs')) d.createObjectStore('docs', { keyPath: 'id' });
        if (!d.objectStoreNames.contains('meta')) d.createObjectStore('meta', { keyPath: 'key' });
      };
      rq.onsuccess = () => {
        clearTimeout(timer);
        const d = rq.result;
        d.onversionchange = () => { d.close(); db = null; };
        d.onclose = () => { db = null; };
        res(d);
      };
      rq.onerror = () => { clearTimeout(timer); rej(rq.error); };
      rq.onblocked = () => { clearTimeout(timer); rej(new Error('IndexedDB blocked')); };
    });
  }

  /* run fn(objectStore) in a transaction; reopens the connection once if the browser dropped it */
  async function tx(name, mode, fn) {
    for (let attempt = 0; ; attempt++) {
      try {
        if (!db) db = await openDb();
        const t = db.transaction(name, mode);
        const result = fn(t.objectStore(name));
        await txDone(t);
        return result instanceof IDBRequest ? result.result : result;
      } catch (e) {
        if (attempt || !e || e.name !== 'InvalidStateError') throw e;
        db = null;
      }
    }
  }

  function lsOk() {
    try { const k = 'resume-studio:probe'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return true; } catch { return false; }
  }
  const lsKeys = () => { const out = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith(LS_PREFIX)) out.push(k); } return out; };
  const lsRead = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };

  async function init() {
    try { current = sessionStorage.getItem(CUR_KEY); } catch { /* storage unavailable */ }
    try {
      db = await openDb();
      const row = await tx('meta', 'readonly', (s) => s.get('currentId'));
      if (!current && row) current = row.value;
      backend = 'indexeddb';
    } catch (e) {
      db = null;
      backend = lsOk() ? 'localstorage' : 'memory';
      console.warn(`Resume Studio: IndexedDB unavailable (${e && e.message}), using ${backend} storage.`);
    }
    if (!current) { try { current = localStorage.getItem(CUR_KEY); } catch { /* storage unavailable */ } }
  }

  async function all() {
    let docs;
    if (backend === 'indexeddb') docs = await tx('docs', 'readonly', (s) => s.getAll());
    else if (backend === 'localstorage') docs = lsKeys().map(lsRead).filter(Boolean);
    else docs = [...mem.values()].map((s) => JSON.parse(s));
    return docs.filter((d) => d && d.id && d.state).sort(newestFirst);
  }
  const list = async () => (await all()).map(summary);

  async function get(id) {
    if (!id) return null;
    if (backend === 'indexeddb') return (await tx('docs', 'readonly', (s) => s.get(id))) || null;
    if (backend === 'localstorage') return lsRead(LS_PREFIX + id);
    return mem.has(id) ? JSON.parse(mem.get(id)) : null;
  }

  function put(doc) {
    try {
      if (!doc || !doc.id) throw new Error('Document needs an id');
      if (backend === 'indexeddb') {
        // structured clone happens inside put(), i.e. synchronously when the db is open
        if (db) {
          const t = db.transaction('docs', 'readwrite');
          t.objectStore('docs').put(doc);
          return txDone(t).then(() => doc);
        }
        const copy = JSON.parse(JSON.stringify(doc));
        return tx('docs', 'readwrite', (s) => s.put(copy)).then(() => doc);
      }
      const json = JSON.stringify(doc);
      if (backend === 'localstorage') localStorage.setItem(LS_PREFIX + doc.id, json);
      else mem.set(doc.id, json);
      return Promise.resolve(doc);
    } catch (e) {
      if (backend === 'indexeddb' && e && e.name === 'InvalidStateError') {
        // the connection was closed under us: copy now, write after reconnecting
        db = null;
        try { const copy = JSON.parse(JSON.stringify(doc)); return tx('docs', 'readwrite', (s) => s.put(copy)).then(() => doc); } catch (e2) { return Promise.reject(e2); }
      }
      return Promise.reject(e);
    }
  }

  async function remove(id) {
    if (backend === 'indexeddb') await tx('docs', 'readwrite', (s) => s.delete(id));
    else if (backend === 'localstorage') localStorage.removeItem(LS_PREFIX + id);
    else mem.delete(id);
  }

  async function setCurrent(id) {
    current = id;
    try { sessionStorage.setItem(CUR_KEY, id); } catch { /* storage unavailable */ }
    try { localStorage.setItem(CUR_KEY, id); } catch { /* storage unavailable */ }
    if (backend === 'indexeddb') { try { await tx('meta', 'readwrite', (s) => s.put({ key: 'currentId', value: id })); } catch { /* not critical */ } }
  }

  let persistAsked = null;
  function persist() {
    if (!persistAsked) {
      const st = navigator.storage;
      persistAsked = !st || !st.persist ? Promise.resolve(false)
        : (st.persisted ? st.persisted() : Promise.resolve(false)).then((p) => p || st.persist()).catch(() => false);
    }
    return persistAsked;
  }

  return {
    init, list, all, get, put, remove, setCurrent, persist,
    get currentId() { return current; },
    get backend() { return backend; },
  };
})();

/* ================= "My resumes" manager dialog ================= */
const DocManager = (() => {
  const SORT_KEY = 'resume-studio:dm-sort';
  const SORTS = {
    updated: (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0),
    name: (a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true }),
    created: (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
  };
  let root = null, dlg, grid, scroller, search, sortSel, countEl, emptyEl, splitMenu;
  let docs = [];
  const cards = new Map();   // doc id → card element, kept while the list is unchanged (search / sort reuse them)
  let lastFocus = null, io = null, ro = null, busy = false, flashId = null;

  const svg = (paths, cls = 'ico') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
  const ICO_SEARCH = svg('<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>');
  const ICO_X = svg('<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>');
  const ICO_FOLDER = svg('<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>');

  function ago(t) {
    const s = Math.max(0, (Date.now() - (t || 0)) / 1000);
    if (s < 45) return 'just now';
    if (s < 3600) return `${Math.max(1, Math.round(s / 60))} min ago`;
    if (s < 86400) return `${Math.round(s / 3600)} h ago`;
    const d = Math.round(s / 86400);
    if (d === 1) return 'yesterday';
    if (d < 7) return `${d} days ago`;
    const dt = new Date(t);
    return 'on ' + dt.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: dt.getFullYear() === new Date().getFullYear() ? undefined : 'numeric' });
  }

  function build() {
    if (root) return;
    search = h('input', { class: 'inp', type: 'search', placeholder: 'Search resumes…', 'aria-label': 'Search resumes', oninput: paint });
    let sort = 'updated';
    try { sort = localStorage.getItem(SORT_KEY) || 'updated'; } catch { /* storage unavailable */ }
    sortSel = h('select', { class: 'inp dm-sort', 'aria-label': 'Sort resumes', onchange: () => { try { localStorage.setItem(SORT_KEY, sortSel.value); } catch { /* storage unavailable */ } paint(); } },
      [['updated', 'Last edited'], ['name', 'Name'], ['created', 'Created']].map(([v, l]) => h('option', { value: v, selected: v === sort }, l)));
    if (!SORTS[sortSel.value]) sortSel.value = 'updated';

    const item = (ico, label, sub, run) => h('button', { type: 'button', role: 'menuitem', onclick: () => { toggleSplit(false); run(); } },
      h('span', { class: 'dm-mi-ico', html: ico }), h('span', {}, h('b', {}, label), h('small', {}, sub)));
    splitMenu = h('div', { class: 'menu glass dm-split-menu', role: 'menu' },
      item(icon('file'), 'Blank resume', 'Start from an empty outline', () => act(() => App.newDoc('blank'), true)),
      item(icon('sparkles'), 'From sample', 'A filled-in example to adapt', () => act(() => App.newDoc('sample'), true)),
      item(icon('copy'), 'Duplicate current', 'Copy the resume you are editing', () => act(() => App.duplicateDoc(), true)),
      h('hr'),
      item(icon('upload'), 'Import JSON…', 'From a Resume Studio backup', () => { close(); App.pickImport(); }));
    const caret = h('button', { type: 'button', class: 'btn primary sm dm-split-caret', 'aria-label': 'More ways to create a resume', 'aria-haspopup': 'menu', 'aria-expanded': 'false', html: icon('chevron', 'ico sm'),
      onclick: (e) => { e.stopPropagation(); toggleSplit(); } });
    const split = h('div', { class: 'dm-split' },
      h('button', { type: 'button', class: 'btn primary sm dm-split-main', title: 'Create a new blank resume', html: `${icon('plus')}<span>New resume</span>`, onclick: () => act(() => App.newDoc('blank'), true) }),
      caret, splitMenu);

    countEl = h('small', { class: 'dm-count' });
    grid = h('div', { class: 'dm-grid', role: 'list' });
    emptyEl = h('div', { class: 'dm-empty', hidden: true });
    scroller = h('div', { class: 'dm-body' }, grid, emptyEl);
    dlg = h('div', { class: 'dm glass', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'dmTitle', tabindex: '-1' },
      h('header', { class: 'dm-head' },
        h('div', { class: 'dm-title' }, h('span', { class: 'dm-title-ico', html: ICO_FOLDER }),
          h('div', {}, h('h2', { id: 'dmTitle' }, 'My resumes'), countEl)),
        h('div', { class: 'dm-tools' },
          h('label', { class: 'dm-search' }, h('span', { class: 'dm-search-ico', html: ICO_SEARCH }), search),
          sortSel, split),
        h('button', { type: 'button', class: 'icon-btn dm-close', title: 'Close (Esc)', 'aria-label': 'Close', html: ICO_X, onclick: close })),
      scroller,
      h('footer', { class: 'dm-foot' },
        h('span', { class: 'dm-foot-txt' }, 'Resumes are saved privately in this browser. Export JSON to back up or move them to another device.'),
        h('span', { class: 'dm-keys' }, h('kbd', {}, 'Ctrl'), h('kbd', {}, 'O'), ' open this list')));
    root = h('div', { class: 'dm-overlay', hidden: true, onmousedown: (e) => { if (e.target === root) close(); } }, dlg);
    root.addEventListener('keydown', onKey);
    // focus trap: keys pressed while focus is outside (e.g. after a card was removed) still reach the dialog
    document.addEventListener('keydown', (e) => { if (isOpen() && !root.contains(e.target)) onKey(e); });
    document.addEventListener('focusin', (e) => { if (isOpen() && !root.contains(e.target)) dlg.focus({ preventScroll: true }); });
    document.addEventListener('click', (e) => { if (!e.target.closest('.dm-split')) toggleSplit(false); });
    document.body.appendChild(root);

    io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      renderThumb(en.target);
    }), { root: scroller, rootMargin: '300px 0px' });
    ro = new ResizeObserver(() => $$('.dm-page', grid).forEach(fitThumb));
    ro.observe(grid);
  }

  function toggleSplit(force) {
    if (!splitMenu) return;
    const open = force ?? !splitMenu.classList.contains('open');
    splitMenu.classList.toggle('open', open);
    $('.dm-split-caret', root).setAttribute('aria-expanded', String(open));
  }

  async function act(fn, closeAfter) {
    if (busy) return;
    busy = true;
    try {
      const r = await fn();
      if (closeAfter && r) close();
      else if (isOpen()) await reload();
      return r;
    } catch (e) {
      console.error(e);
      toast('Something went wrong with that resume — please try again.');
    } finally { busy = false; }
  }

  /* ----- cards ----- */
  function card(d) {
    const cur = App.doc && d.id === App.doc.id;
    const tpl = tplById(d.state.design.template);
    const accent = Render.effective({ ...DEFAULT_DESIGN, ...d.state.design }).accent;
    const page = h('div', { class: 'dm-page', 'data-id': d.id });
    const name = h('b', { class: 'dm-name', title: d.name }, d.name);
    const c = h('article', { class: `dm-card${cur ? ' current' : ''}`, role: 'listitem', 'data-id': d.id },
      h('button', { type: 'button', class: 'dm-thumb', 'aria-label': cur ? `Continue editing “${d.name}”` : `Open “${d.name}”`, onclick: () => openDoc(d.id) },
        page, cur ? h('span', { class: 'dm-badge' }, 'Current') : null),
      h('div', { class: 'dm-info' },
        name,
        h('div', { class: 'dm-sub' },
          h('span', { class: 'dm-tpl', style: `--dot:${/^#[0-9a-f]{3,8}$/i.test(accent) ? accent : tpl.accent}` }, tpl.name),
          h('span', { title: `Edited ${new Date(d.updatedAt).toLocaleString()}\nCreated ${new Date(d.createdAt).toLocaleString()}` }, `Edited ${ago(d.updatedAt)}`))),
      h('div', { class: 'dm-actions' },
        h('button', { type: 'button', class: 'btn xs dm-open', onclick: () => openDoc(d.id) }, cur ? 'Continue' : 'Open'),
        h('span', { class: 'dm-spacer' }),
        iconBtn('edit', 'Rename', () => startRename(c, d)),
        iconBtn('copy', 'Duplicate', () => act(async () => { const n = await App.duplicateDoc(d.id); if (n) flashId = n.id; return n; })),
        iconBtn('download', 'Export JSON', () => act(() => App.exportJSON(d.id))),
        iconBtn('trash', 'Delete', () => remove(d), 'danger')));
    return c;
  }

  function fitThumb(page) { page.style.setProperty('--zoom', (page.clientWidth / PAGE_W).toFixed(4)); }
  function renderThumb(page) {
    const d = docs.find((x) => x.id === page.dataset.id);
    if (!d || !page.isConnected) return;
    fitThumb(page);
    try {
      Render.render(page, d.state.data, { ...DEFAULT_DESIGN, ...d.state.design }, { maxPages: 1 });
    } catch (e) {
      console.warn('Resume Studio: could not render a thumbnail', e);
      page.innerHTML = '';
    }
  }

  function paint() {
    if (!root) return;
    const q = search.value.trim().toLowerCase();
    const shown = docs.filter((d) => !q || [d.name, d.state.data?.personal?.name, d.state.data?.personal?.title, tplById(d.state.design?.template).name]
      .some((s) => String(s || '').toLowerCase().includes(q)));
    shown.sort(SORTS[sortSel.value] || SORTS.updated);
    grid.replaceChildren(...shown.map((d) => {
      let c = cards.get(d.id);
      if (!c) { c = card(d); cards.set(d.id, c); io.observe($('.dm-page', c)); }
      return c;
    }));
    countEl.textContent = `${docs.length} resume${docs.length === 1 ? '' : 's'}${Store.backend === 'indexeddb' ? ' · saved in this browser' : Store.backend === 'localstorage' ? ' · limited browser storage' : ' · not saved (storage blocked)'}`;
    emptyEl.hidden = shown.length > 0;
    if (!shown.length) {
      emptyEl.innerHTML = '';
      emptyEl.append(h('span', { class: 'dm-empty-ico', html: ICO_SEARCH }),
        h('b', {}, `No resumes match “${search.value.trim()}”`),
        h('span', {}, 'Try another name, job title or template.'),
        h('button', { type: 'button', class: 'btn sm', onclick: () => { search.value = ''; paint(); search.focus(); } }, 'Clear search'));
    }
    if (!dlg.contains(document.activeElement)) dlg.focus({ preventScroll: true });
    if (flashId) {
      const f = grid.querySelector(`.dm-card[data-id="${CSS.escape(flashId)}"]`);
      flashId = null;
      if (f) { f.classList.add('flash'); f.scrollIntoView({ block: 'nearest' }); setTimeout(() => f.classList.remove('flash'), 1400); }
    }
  }

  async function reload() {
    let list = [];
    try { list = await Store.all(); } catch (e) { console.error(e); toast('Could not read your saved resumes'); }
    if (!isOpen()) return;
    // the open resume may have unsaved edits: show the live version
    if (App.doc && App.state) {
      const { data, design, canvas } = App.state;
      const live = { ...App.doc, state: { data, design, canvas } };
      const i = list.findIndex((d) => d.id === live.id);
      if (i >= 0) list[i] = live; else list.unshift(live);
    }
    docs = list.map((d) => ({ ...d, name: d.name || 'Untitled resume', state: { ...d.state, data: d.state.data || { personal: {}, sections: [] }, design: d.state.design || {} } }));
    io.disconnect();
    cards.clear();
    paint();
  }

  /* ----- actions ----- */
  async function openDoc(id) {
    if (App.doc && id === App.doc.id) { close(); return; }
    await act(() => App.openDoc(id), true);
  }

  function startRename(c, d) {
    const nameEl = $('.dm-name', c);
    if (!nameEl) return;
    const inp = h('input', { class: 'inp dm-rename', value: d.name, 'aria-label': 'Resume name', maxlength: 120 });
    let done = false;
    const finish = async (save) => {
      if (done) return;
      done = true;
      const v = inp.value.trim();
      if (save && v !== d.name) {
        const name = await act(() => App.renameDoc(d.id, v));
        if (name) toast(`Renamed to “${name}”`);
      } else { inp.replaceWith(nameEl); }
      const nc = grid.querySelector(`.dm-card[data-id="${CSS.escape(d.id)}"] .dm-thumb`);
      if (nc && (!root.contains(document.activeElement) || document.activeElement === dlg)) nc.focus();
    };
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); finish(true); }
      else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); finish(false); }
    });
    inp.addEventListener('blur', () => finish(true));
    nameEl.replaceWith(inp);
    inp.focus();
    inp.select();
  }

  async function remove(d) {
    const last = docs.length <= 1;
    const msg = `Delete “${d.name}”?\n\nThis removes it from this browser and cannot be undone.${last ? ' A new blank resume will be created so you always have one.' : ''}`;
    if (!confirm(msg)) return;
    const ok = await act(() => App.deleteDoc(d.id));
    if (ok) toast(`Deleted “${d.name}”`);
  }

  /* ----- open / close / keyboard ----- */
  const isOpen = () => !!root && !root.hidden;
  async function open() {
    if (!App.state || !App.doc) return;
    build();
    if (isOpen()) { search.focus(); return; }
    App.flush();
    lastFocus = document.activeElement;
    $$('.menu.open').forEach((m) => m.classList.remove('open'));
    search.value = '';
    root.hidden = false;
    document.body.classList.add('dm-open');
    grid.innerHTML = '';
    search.focus();
    await reload();
  }
  function close() {
    if (!isOpen()) return;
    root.hidden = true;
    document.body.classList.remove('dm-open');
    toggleSplit(false);
    io.disconnect();
    cards.clear();
    grid.innerHTML = '';
    docs = [];
    if (lastFocus && lastFocus.isConnected && typeof lastFocus.focus === 'function') lastFocus.focus();
    lastFocus = null;
  }
  function onKey(e) {
    if (e.key === 'Escape') {
      e.preventDefault(); e.stopPropagation();
      if (splitMenu.classList.contains('open')) { toggleSplit(false); $('.dm-split-caret', root).focus(); } else close();
      return;
    }
    if (e.key === 'Tab') {
      // keep focus inside the dialog
      const f = $$('button, input, select, [tabindex]:not([tabindex="-1"])', dlg).filter((n) => !n.disabled && n.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      const at = document.activeElement;
      if (!dlg.contains(at) || at === dlg) { e.preventDefault(); (e.shiftKey ? last : first).focus(); }
      else if (e.shiftKey && at === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && at === last) { e.preventDefault(); first.focus(); }
    }
    // plain keys must not reach the canvas / editor shortcuts behind the dialog;
    // Ctrl/Cmd combos go on to App, which only handles Ctrl+O / Ctrl+S while the dialog is open
    if (!(e.ctrlKey || e.metaKey)) e.stopPropagation();
  }

  /* ----- small actionable notice (bottom of the screen) ----- */
  let noticeEl = null;
  function notify(text, actions = []) {
    if (noticeEl) noticeEl.remove();
    const done = () => { if (noticeEl === el) noticeEl = null; el.classList.remove('show'); setTimeout(() => el.remove(), 250); };
    const el = h('div', { class: 'doc-notice glass', role: 'alertdialog', 'aria-live': 'assertive', 'aria-label': text },
      h('span', { class: 'doc-notice-ico', html: icon('info') }),
      h('span', { class: 'doc-notice-txt' }, text),
      h('div', { class: 'doc-notice-acts' }, actions.map((a) => h('button', { type: 'button', class: `btn sm${a.primary ? ' primary' : ' ghost'}`, onclick: () => { done(); a.run && a.run(); } }, a.label))));
    noticeEl = el;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    return { close: done };
  }

  return { open, close, isOpen, notify, reload };
})();

window.Store = Store;
window.DocManager = DocManager;
