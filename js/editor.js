/* Resume Studio — content forms, design controls and template gallery (template mode) */

/* ---------- small form helpers ---------- */
function fld(label, control, cls = '') {
  return h('label', { class: `fld ${cls}` }, h('span', { class: 'fld-label' }, label), control);
}
function textInput(obj, key, o = {}) {
  const tag = o.textarea ? 'textarea' : 'input';
  const props = {
    class: 'inp', value: obj[key] ?? '', placeholder: o.ph || '',
    oninput: (e) => { obj[key] = e.target.value; o.after && o.after(e.target.value); App.changed('data'); },
  };
  if (o.textarea) props.rows = o.rows || 4; else props.type = o.type || 'text';
  return h(tag, props);
}
function iconBtn(name, title, onclick, cls = '') {
  return h('button', { class: `icon-btn sm ${cls}`, type: 'button', title, 'aria-label': title, onclick, html: icon(name) });
}
function readImage(file, max = 900) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) return reject(new Error('Not an image'));
    const fr = new FileReader();
    fr.onload = () => {
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        resolve(file.type === 'image/png' ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.88));
      };
      img.onerror = reject;
      img.src = fr.result;
    };
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}
function pickFile(accept, cb) {
  const i = h('input', { type: 'file', accept });
  i.addEventListener('change', () => i.files[0] && cb(i.files[0]));
  i.click();
}

/* ---------- drag & drop reordering for form cards ---------- */
const Reorder = (() => {
  let drag = null;
  document.addEventListener('mouseup', () => $$('[draggable="true"].card, [draggable="true"].row-item').forEach((n) => { if (!drag) n.draggable = false; }));
  function attach(node, grip, kind, group, id, getList) {
    grip.addEventListener('mousedown', () => { node.draggable = true; });
    node.addEventListener('dragstart', (e) => {
      if (!node.draggable) return;
      e.stopPropagation();
      drag = { kind, group, id };
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', id);
      requestAnimationFrame(() => node.classList.add('dragging'));
    });
    node.addEventListener('dragend', () => {
      node.draggable = false; node.classList.remove('dragging'); drag = null;
      $$('.drop-before, .drop-after').forEach((n) => n.classList.remove('drop-before', 'drop-after'));
    });
    node.addEventListener('dragover', (e) => {
      if (!drag || drag.kind !== kind || drag.group !== group || drag.id === id) return;
      e.preventDefault(); e.stopPropagation();
      const r = node.getBoundingClientRect();
      const after = e.clientY > r.top + r.height / 2;
      node.classList.toggle('drop-after', after);
      node.classList.toggle('drop-before', !after);
    });
    node.addEventListener('dragleave', () => node.classList.remove('drop-before', 'drop-after'));
    node.addEventListener('drop', (e) => {
      if (!drag || drag.kind !== kind || drag.group !== group) return;
      e.preventDefault(); e.stopPropagation();
      const after = node.classList.contains('drop-after');
      node.classList.remove('drop-before', 'drop-after');
      const list = getList();
      const from = list.findIndex((x) => x.id === drag.id);
      if (from < 0 || drag.id === id) return;
      const [m] = list.splice(from, 1);
      let to = list.findIndex((x) => x.id === id);
      if (after) to++;
      list.splice(to, 0, m);
      App.structural();
    });
  }
  return { attach };
})();

/* ---------- Content editor ---------- */
const Editor = (() => {
  const open = new Set(['personal']);
  let addMenuOpen = false;

  function card(id, headKids, bodyKids, cls = '') {
    const c = h('div', { class: `card ${cls}${open.has(id) ? ' open' : ''}`, 'data-id': id });
    const head = h('div', { class: 'card-head' }, headKids,
      h('button', { class: 'icon-btn sm chev', type: 'button', title: 'Expand / collapse', html: icon('chevron') }));
    head.addEventListener('click', (e) => {
      if (e.target.closest('input, select, textarea, button:not(.chev), .grip')) return;
      c.classList.toggle('open');
      c.classList.contains('open') ? open.add(id) : open.delete(id);
    });
    c.append(head, h('div', { class: 'card-body' }, bodyKids));
    return c;
  }

  function personalCard() {
    const p = App.state.data.personal;
    p.extra = p.extra || [];
    const photo = h('div', { class: 'photo-edit' },
      h('div', { class: 'avatar', html: p.photo ? `<img src="${p.photo}" alt="">` : icon('user') }),
      h('div', { class: 'photo-btns' },
        h('button', { class: 'btn sm', type: 'button', onclick: () => pickFile('image/*', async (f) => {
          try { p.photo = await readImage(f, 500); App.structural(); } catch { toast('Could not read that image'); }
        }), html: `${icon('upload')}<span>Upload photo</span>` }),
        p.photo && h('button', { class: 'btn sm ghost', type: 'button', onclick: () => { p.photo = ''; App.structural(); } }, 'Remove'),
        h('label', { class: 'switch-row' },
          h('input', { type: 'checkbox', checked: App.state.design.showPhoto, onchange: (e) => { App.state.design.showPhoto = e.target.checked; App.changed('design'); Design.build(); } }),
          h('span', { class: 'switch' }), 'Show photo')));
    const grid = h('div', { class: 'grid2' },
      fld('Full name', textInput(p, 'name', { ph: 'Jane Doe' }), 'full'),
      fld('Job title', textInput(p, 'title', { ph: 'Software Engineer' }), 'full'),
      fld('Email', textInput(p, 'email', { type: 'email', ph: 'jane@mail.com' })),
      fld('Phone', textInput(p, 'phone', { ph: '+1 555 0100' })),
      fld('Location', textInput(p, 'location', { ph: 'City, Country' })),
      fld('Website', textInput(p, 'website', { ph: 'yoursite.com' })),
      fld('LinkedIn', textInput(p, 'linkedin', { ph: 'linkedin.com/in/you' }), 'full'));
    const extra = h('div', { class: 'extra-list' }, p.extra.map((f) => customFieldRow(p.extra, f)));
    return card('personal',
      [h('div', { class: 'card-ico', html: icon('user') }), h('div', { class: 'card-title' }, h('b', {}, 'Personal details'), h('small', {}, 'Name, photo & contact'))],
      [photo, grid,
        h('div', { class: 'sub-label' }, 'Custom fields', h('small', {}, 'e.g. GitHub, Nationality, Date of birth')),
        extra,
        h('button', { class: 'btn sm dashed', type: 'button', onclick: () => { p.extra.push({ id: uid(), label: '', value: '' }); App.structural(); }, html: `${icon('plus')}<span>Add custom field</span>` })],
      'personal');
  }

  function customFieldRow(list, f) {
    return h('div', { class: 'kv-row' },
      h('input', { class: 'inp', placeholder: 'Label', value: f.label, oninput: (e) => { f.label = e.target.value; App.changed('data'); } }),
      h('input', { class: 'inp', placeholder: 'Value', value: f.value, oninput: (e) => { f.value = e.target.value; App.changed('data'); } }),
      iconBtn('trash', 'Remove field', () => { list.splice(list.indexOf(f), 1); App.structural(); }, 'danger'));
  }

  function sectionCard(sec) {
    const secs = App.state.data.sections;
    const grip = h('span', { class: 'grip', title: 'Drag to reorder', html: icon('grip') });
    const count = sec.type === 'text' ? '' : `${sec.items.length}`;
    const head = [
      grip,
      h('input', { class: 'inp title-inp', value: sec.title, title: 'Rename section', oninput: (e) => { sec.title = e.target.value; App.changed('data'); } }),
      count && h('span', { class: 'badge' }, count),
      iconBtn(sec.visible === false ? 'eyeOff' : 'eye', sec.visible === false ? 'Show section' : 'Hide section', () => { sec.visible = sec.visible === false; App.structural(); }, sec.visible === false ? 'muted' : ''),
      iconBtn('trash', 'Delete section', () => {
        if (!confirm(`Delete the "${sec.title}" section?`)) return;
        secs.splice(secs.indexOf(sec), 1); App.structural();
      }, 'danger'),
    ];
    const t = tplById(App.state.design.template);
    const colSeg = h('div', { class: 'seg' }, ['main', 'side'].map((c) => h('button', {
      type: 'button', class: sec.column === c ? 'active' : '',
      onclick: () => { sec.column = c; App.structural(); },
    }, c === 'main' ? 'Main column' : 'Sidebar')));
    const body = [
      h('div', { class: 'sec-opts' }, h('span', { class: 'muted-txt' }, 'Placement'), colSeg,
        t.layout === 'single' && h('span', { class: 'hint-chip', title: 'The current template has one column' }, 'single-column template')),
    ];
    if (sec.type === 'text') {
      body.push(fld('Content', textInput(sec, 'content', { textarea: true, rows: 6, ph: 'Write a short summary…' }), 'full'),
        h('p', { class: 'hint' }, 'Tip: start lines with "- " for bullets, wrap text in **double stars** for bold.'));
    } else {
      const list = h('div', { class: `items items-${sec.type}` }, sec.items.map((it) => itemNode(sec, it)));
      body.push(list);
      if (sec.type === 'tags') {
        body.push(h('input', { class: 'inp', placeholder: 'Type and press Enter to add…', onkeydown: (e) => {
          if (e.key !== 'Enter' || !e.target.value.trim()) return;
          e.target.value.split(',').map((s) => s.trim()).filter(Boolean).forEach((name) => sec.items.push({ id: uid(), name }));
          App.structural();
          requestAnimationFrame(() => $(`.card[data-id="${sec.id}"] .items-tags + .inp`)?.focus());
        } }));
      }
      body.push(h('button', { class: 'btn sm dashed', type: 'button', onclick: () => {
        const it = newItem(sec.type); sec.items.push(it); open.add(it.id); App.structural();
      }, html: `${icon('plus')}<span>Add ${sec.type === 'entries' ? 'entry' : 'item'}</span>` }));
    }
    const c = card(sec.id, head, body, `sec${sec.visible === false ? ' hidden-sec' : ''}`);
    Reorder.attach(c, grip, 'section', 'sections', sec.id, () => App.state.data.sections);
    return c;
  }

  function itemNode(sec, it) {
    const list = sec.items;
    const grip = h('span', { class: 'grip', title: 'Drag to reorder', html: icon('grip') });
    const del = iconBtn('trash', 'Delete', () => { list.splice(list.indexOf(it), 1); App.structural(); }, 'danger');
    let node;
    if (sec.type === 'skills') {
      const val = h('span', { class: 'lvl' }, `${it.level}/5`);
      node = h('div', { class: 'row-item skill-row' }, grip,
        h('input', { class: 'inp', value: it.name, placeholder: 'Skill', oninput: (e) => { it.name = e.target.value; App.changed('data'); } }),
        h('input', { type: 'range', class: 'range', min: 0, max: 5, step: 1, value: it.level, oninput: (e) => { it.level = +e.target.value; val.textContent = `${it.level}/5`; App.changed('data'); } }),
        val, del);
    } else if (sec.type === 'tags') {
      node = h('div', { class: 'row-item tag-row' }, grip,
        h('input', { class: 'inp', value: it.name, placeholder: 'Item', oninput: (e) => { it.name = e.target.value; App.changed('data'); } }), del);
    } else {
      const L = sec.labels || { title: 'Title', subtitle: 'Subtitle' };
      it.fields = it.fields || [];
      const sum = h('div', { class: 'card-title' }, h('b', {}, it.title || `(New ${L.title.toLowerCase()})`), h('small', {}, [it.subtitle, it.date].filter(Boolean).join(' · ')));
      const updSum = () => {
        sum.firstChild.textContent = it.title || `(New ${L.title.toLowerCase()})`;
        sum.lastChild.textContent = [it.subtitle, it.date].filter(Boolean).join(' · ');
      };
      const body = [
        h('div', { class: 'grid2' },
          fld(L.title, textInput(it, 'title', { after: updSum }), 'full'),
          fld(L.subtitle, textInput(it, 'subtitle', { after: updSum })),
          fld('Location', textInput(it, 'location')),
          fld('Date / period', textInput(it, 'date', { ph: 'Jan 2020 – Present', after: updSum }), 'full'),
          fld('Description', textInput(it, 'description', { textarea: true, rows: 5, ph: '- Achievement with measurable impact\n- Another responsibility' }), 'full')),
        h('div', { class: 'extra-list' }, it.fields.map((f) => customFieldRow(it.fields, f))),
        h('div', { class: 'row-actions' },
          h('button', { class: 'btn xs dashed', type: 'button', onclick: () => { it.fields.push({ id: uid(), label: '', value: '' }); App.structural(); }, html: `${icon('plus')}<span>Custom field</span>` }),
          h('button', { class: 'btn xs ghost', type: 'button', onclick: () => { const c = clone(it); c.id = uid(); list.splice(list.indexOf(it) + 1, 0, c); open.add(c.id); App.structural(); }, html: `${icon('copy')}<span>Duplicate</span>` })),
      ];
      node = card(it.id, [grip, sum, del], body, 'item row-item');
    }
    Reorder.attach(node, grip, 'item', sec.id, it.id, () => list);
    return node;
  }

  function addSectionBar() {
    const wrap = h('div', { class: `add-section${addMenuOpen ? ' open' : ''}` });
    const btn = h('button', { class: 'btn primary block', type: 'button', onclick: () => { addMenuOpen = !addMenuOpen; wrap.classList.toggle('open', addMenuOpen); }, html: `${icon('plus')}<span>Add section</span>` });
    const menu = h('div', { class: 'add-menu' }, Object.entries(SECTION_PRESETS).map(([k, p]) => h('button', {
      type: 'button', class: 'add-opt',
      onclick: () => {
        const s = newSection(k);
        App.state.data.sections.push(s); open.add(s.id); if (s.items[0]) open.add(s.items[0].id); addMenuOpen = false; App.structural();
        requestAnimationFrame(() => $(`.card[data-id="${s.id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
      },
    }, h('b', {}, p.label), h('small', {}, { text: 'Text block', entries: 'Entries with dates', skills: 'Rated list', tags: 'Chips list' }[p.type]))));
    wrap.append(btn, menu);
    return wrap;
  }

  function build() {
    const root = $('#contentForms');
    const scroller = root.closest('.panel-scroll');
    const top = scroller ? scroller.scrollTop : 0;
    root.innerHTML = '';
    root.append(personalCard(), ...App.state.data.sections.map(sectionCard), addSectionBar());
    if (scroller) scroller.scrollTop = top;
  }

  function focusSection(id) {
    open.add(id);
    build();
    requestAnimationFrame(() => {
      const c = $(`#contentForms .card[data-id="${id}"]`);
      if (!c) return;
      c.scrollIntoView({ behavior: 'smooth', block: 'start' });
      c.classList.add('flash');
      setTimeout(() => c.classList.remove('flash'), 1200);
    });
  }

  return { build, focusSection };
})();

/* ---------- Design controls ---------- */
const Design = (() => {
  function range(label, value, min, max, step, fmt, set) {
    const out = h('span', { class: 'range-val' }, fmt(value));
    return h('div', { class: 'fld full' },
      h('span', { class: 'fld-label' }, label, out),
      h('input', { type: 'range', class: 'range', min, max, step, value, oninput: (e) => { set(+e.target.value); out.textContent = fmt(+e.target.value); App.changed('design'); } }));
  }
  function fontSelect(cur, def, set) {
    return h('select', { class: 'inp', onchange: (e) => { set(e.target.value || null); App.changed('design'); } },
      h('option', { value: '', selected: !cur }, `Template default (${def})`),
      FONTS.map(([f]) => h('option', { value: f, selected: cur === f, style: { fontFamily: fontStack(f) } }, f)));
  }
  /* approximate the CSS default of --accent-2 (accent mixed 55% with #0b1220) for the color input */
  function mixHex(a, b, k) {
    const p = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
    if (!/^#[0-9a-f]{6}$/i.test(a) || !/^#[0-9a-f]{6}$/i.test(b)) return '#334155';
    const A = p(a), B = p(b);
    return '#' + A.map((v, i) => Math.round(v * k + B[i] * (1 - k)).toString(16).padStart(2, '0')).join('');
  }
  /* style overrides: design.overrides is replaced, never mutated (older saved states share DEFAULT_DESIGN.overrides) */
  const ovObj = (d) => (d.overrides && typeof d.overrides === 'object' && !Array.isArray(d.overrides) ? d.overrides : {});
  function setOverride(d, key, value) {
    const o = { ...ovObj(d) };
    if (value) o[key] = value; else delete o[key];
    d.overrides = o;
    App.changed('design');
  }
  function knobSelect(d, eff, key) {
    const knob = TEMPLATE_KNOBS[key];
    const cur = knobValid(key, ovObj(d)[key]) ? ovObj(d)[key] : '';
    return h('label', { class: `knob-row${cur ? ' set' : ''}` }, h('span', { class: 'fld-label' }, knob.label),
      h('select', { class: 'inp', 'data-knob': key, onchange: (e) => { setOverride(d, key, e.target.value); e.target.parentNode.classList.toggle('set', !!e.target.value); } },
        h('option', { value: '', selected: !cur }, `Template default (${knobLabel(key, eff.tv[key])})`),
        knob.values.map(([v, l]) => h('option', { value: v, selected: cur === v }, l))));
  }

  function build() {
    const d = App.state.design;
    const eff = Render.effective(d);
    const root = $('#designForms');
    root.innerHTML = '';
    const swatches = h('div', { class: 'swatches' },
      ACCENTS.map((c) => h('button', { type: 'button', class: `sw${eff.accent.toLowerCase() === c ? ' active' : ''}`, style: { background: c }, title: c, onclick: () => { d.accent = c; App.changed('design'); build(); } })),
      h('label', { class: 'sw custom', title: 'Custom color', html: icon('palette') },
        h('input', { type: 'color', value: eff.accent, oninput: (e) => { d.accent = e.target.value; App.changed('design'); }, onchange: () => build() })));
    const acc2 = eff.accent2 || mixHex(eff.accent, '#0b1220', 0.55);
    const secondary = h('div', { class: 'acc2-row' },
      h('label', { class: 'sw acc2-sw', title: 'Secondary color', style: { background: acc2 } },
        h('input', { type: 'color', value: acc2, oninput: (e) => { d.accent2 = e.target.value; e.target.parentNode.style.background = e.target.value; App.changed('design'); }, onchange: () => build() })),
      h('span', { class: 'muted-txt' }, d.accent2 ? 'Custom secondary color' : (eff.t.accent2 ? 'Template secondary color' : 'Auto (darker accent)'),
        h('small', {}, ' · used by gradients and some decorations')));
    const hasOv = OVERRIDE_KEYS.some((k) => knobValid(k, ovObj(d)[k]));
    const styleKeys = OVERRIDE_KEYS.filter((k) => !(TEMPLATE_KNOBS[k].twoColOnly && !eff.twoCol));
    root.append(
      h('div', { class: 'card open static' }, h('div', { class: 'card-body' },
        h('div', { class: 'cur-tpl' }, h('div', {}, h('small', {}, 'Current template'), h('b', {}, eff.t.name)),
          h('button', { class: 'btn sm', type: 'button', onclick: () => App.setTab('templates') }, 'Change')),
        h('div', { class: 'sub-label' }, 'Accent color', d.accent && h('button', { class: 'link', type: 'button', onclick: () => { d.accent = null; App.changed('design'); build(); } }, 'Reset')),
        swatches,
        h('div', { class: 'sub-label' }, 'Secondary color', d.accent2 && h('button', { class: 'link', type: 'button', onclick: () => { d.accent2 = null; App.changed('design'); build(); } }, 'Reset')),
        secondary,
        h('div', { class: 'sub-label' }, 'Style', hasOv
          ? h('button', { class: 'link', type: 'button', onclick: () => { d.overrides = {}; App.changed('design'); build(); } }, 'Reset style')
          : h('small', {}, 'override the template look')),
        h('div', { class: 'style-grid' }, styleKeys.map((k) => knobSelect(d, eff, k))),
        h('div', { class: 'sub-label' }, 'Typography'),
        fld('Headings font', fontSelect(d.fontHead, eff.t.fontHead, (v) => { d.fontHead = v; })),
        fld('Body font', fontSelect(d.fontBody, eff.t.fontBody, (v) => { d.fontBody = v; })),
        range('Font size', d.fontScale, 0.8, 1.25, 0.01, (v) => `${Math.round(v * 100)}%`, (v) => { d.fontScale = v; }),
        range('Line spacing', d.lineHeight, 1.1, 1.9, 0.05, (v) => v.toFixed(2), (v) => { d.lineHeight = v; }),
        h('div', { class: 'sub-label' }, 'Layout'),
        range('Page margins', d.margin, 6, 24, 1, (v) => `${v} mm`, (v) => { d.margin = v; }),
        range('Section spacing', d.gap, 6, 32, 1, (v) => `${v} px`, (v) => { d.gap = v; }),
        eff.t.layout !== 'single' && range('Sidebar width', eff.sideW, 24, 45, 1, (v) => `${v}%`, (v) => { d.sideWidth = v; }),
        fld('Skill display', h('select', { class: 'inp', onchange: (e) => { d.skillStyle = e.target.value; App.changed('design'); } },
          [['auto', `Template default (${eff.t.skillStyle})`], ['bar', 'Progress bars'], ['dots', 'Dots rating'], ['tags', 'Chips'], ['text', 'Plain text']]
            .map(([v, l]) => h('option', { value: v, selected: (d.skillStyle || 'auto') === v }, l)))),
        h('label', { class: 'switch-row' },
          h('input', { type: 'checkbox', checked: d.showPhoto, onchange: (e) => { d.showPhoto = e.target.checked; App.changed('design'); } }),
          h('span', { class: 'switch' }), 'Show photo / initials'),
        eff.v.photo === 'none-default' && d.showPhoto && h('p', { class: 'hint' }, 'This template hides the photo (ATS-friendly). Pick a Photo shape above to show it.'),
        h('button', { class: 'btn sm ghost block', type: 'button', onclick: () => {
          Object.assign(d, { ...DEFAULT_DESIGN, template: d.template, showPhoto: d.showPhoto, overrides: {} }); App.changed('design'); build();
        } }, 'Reset design to template defaults'),
      )),
    );
  }
  return { build };
})();

/* ---------- Template gallery: search, categories, filters, lazy live thumbnails, full-screen browser ---------- */
const Gallery = (() => {
  const filters = { q: '', cat: 'all', photo: '', cols: '', ats: false };
  const views = [];          // one per grid (side panel, full-screen modal)
  let version = 1;           // thumbnails rendered with an older version are stale
  let sig = '';              // signature of what thumbnails depend on
  let queue = [];
  let pumping = false;
  let dirtyTimer = null;
  let modal = null;

  const catName = (id) => (TEMPLATE_CATEGORIES.find((c) => c.id === id) || { name: id }).name;
  const isAts = (t) => t.category === 'ats' || (t.tags || []).includes('ats');
  const hasPhoto = (t) => (t.tags || []).includes('photo');
  const haystack = (t) => `${t.name} ${t.id} ${t.desc} ${t.category} ${catName(t.category)} ${(t.tags || []).join(' ')}`.toLowerCase();
  function matches(t, ignoreCat) {
    if (!ignoreCat && filters.cat !== 'all' && t.category !== filters.cat) return false;
    if (filters.photo === 'yes' && !hasPhoto(t)) return false;
    if (filters.photo === 'no' && hasPhoto(t)) return false;
    if (filters.cols === '1' && t.layout !== 'single') return false;
    if (filters.cols === '2' && t.layout === 'single') return false;
    if (filters.ats && !isAts(t)) return false;
    const words = filters.q.toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length) { const s = haystack(t); if (!words.every((w) => s.includes(w))) return false; }
    return true;
  }
  const anyFilter = () => filters.q || filters.cat !== 'all' || filters.photo || filters.cols || filters.ats;
  /* thumbnails show each template's own defaults with the user's content and spacing */
  const thumbDesign = (id) => ({ ...App.state.design, template: id, accent: null, accent2: null, fontHead: null, fontBody: null, sideWidth: null, skillStyle: 'auto', overrides: {} });
  function thumbSig() {
    const d = App.state.design;
    return JSON.stringify([App.state.data, d.fontScale, d.lineHeight, d.margin, d.gap, d.showPhoto]);
  }

  /* ----- lazy rendering ----- */
  /* true when the template's fonts are loaded (otherwise the thumbnail is re-rendered once they are) */
  function fontsReady(t) {
    if (!document.fonts || !document.fonts.check) return true;
    try { return [t.fontHead, t.fontBody].every((f) => !f || ['400', '700'].every((w) => document.fonts.check(`${w} 12px ${fontStack(f)}`))); } catch { return true; }
  }
  function renderThumb(c) {
    const t = tplById(c.dataset.tpl);
    try { Render.render(c._thumb, App.state.data, thumbDesign(t.id), { maxPages: 1 }); } catch (e) { console.error(e); }
    c._ver = version;
    c._fontsOk = fontsReady(t);
  }
  function enqueue(c) {
    if (c._ver === version || queue.includes(c)) return;
    queue.push(c);
    if (!pumping) { pumping = true; requestAnimationFrame(pump); }
  }
  /* render cards that are actually on screen first, then the ones in the 300px look-ahead margin */
  function onScreen(c) {
    const r = c.getBoundingClientRect();
    return r.bottom > 0 && r.top < innerHeight && r.width > 0;
  }
  function pump() {
    const t0 = performance.now();
    // while the full-screen browser is open, the side panel behind it waits
    queue = queue.filter((c) => c._vis && c._ver !== version && c.isConnected && (!modal || modal.view.cards.get(c.dataset.tpl) === c));
    const first = queue.filter(onScreen);
    queue = first.concat(queue.filter((c) => !first.includes(c)));
    while (queue.length && performance.now() - t0 < 12) renderThumb(queue.shift());
    if (queue.length) requestAnimationFrame(pump); else pumping = false;
  }
  const enqueueVisible = () => views.forEach((v) => v.cards.forEach((c) => { if (c._vis) enqueue(c); }));

  /* ----- building blocks ----- */
  function card(t, view) {
    const thumb = h('div', { class: 'tpl-thumb pages' });
    const badges = [hasPhoto(t) && 'Photo', isAts(t) && 'ATS', t.layout !== 'single' && '2 col'].filter(Boolean);
    const c = h('button', {
      type: 'button', class: `tpl-card${App.state.design.template === t.id ? ' active' : ''}`, 'data-tpl': t.id,
      title: `${t.name} — ${t.desc}`, 'aria-label': `${t.name} template, ${catName(t.category)}: ${t.desc}`,
      onclick: () => { select(t.id); if (view.modal) closeModal(); },
    },
    thumb,
    h('div', { class: 'tpl-meta' }, h('b', {}, t.name), h('small', {}, t.desc),
      badges.length ? h('span', { class: 'tpl-badges' }, badges.map((b) => h('i', {}, b))) : null),
    h('span', { class: 'tpl-check', html: '✓' }));
    c._thumb = thumb;
    c._ver = 0;
    c._vis = false;
    return c;
  }

  function chip(label, count, active, onclick, cls = '') {
    return h('button', { type: 'button', class: `tg-chip ${cls}${active ? ' on' : ''}`, 'aria-pressed': String(!!active), onclick },
      label, count != null && h('span', { class: 'n' }, String(count)));
  }

  function toolbar(view) {
    const search = h('input', {
      class: 'inp tg-search', type: 'search', placeholder: `Search ${TEMPLATES.length} templates…`, value: filters.q, 'aria-label': 'Search templates',
      oninput: (e) => { filters.q = e.target.value; clearTimeout(view._qt); view._qt = setTimeout(() => refilter(view), 120); },
    });
    const top = h('div', { class: 'tg-top' },
      h('div', { class: 'tg-row' },
        h('div', { class: 'tg-search-wrap', html: icon('search', 'ico tg-search-ico') }, search),
        view.modal
          ? h('button', { type: 'button', class: 'icon-btn tg-close', title: 'Close (Esc)', 'aria-label': 'Close', onclick: closeModal, html: icon('close') })
          : h('button', { type: 'button', class: 'icon-btn tg-expand', title: 'Browse all templates full screen', 'aria-label': 'Expand gallery', onclick: openModal, html: icon('expand') })));
    const bar = h('div', { class: 'tg-bar' },
      h('div', { class: 'tg-chips', role: 'group', 'aria-label': 'Categories' }),
      h('div', { class: 'tg-toggles', role: 'group', 'aria-label': 'Filters' }),
      h('div', { class: 'tg-status' }, h('span', { class: 'tg-count', 'aria-live': 'polite' }),
        h('button', { type: 'button', class: 'link tg-clear', onclick: () => { Object.assign(filters, { q: '', cat: 'all', photo: '', cols: '', ats: false }); syncAll(); } }, 'Clear filters'),
        h('button', { type: 'button', class: 'btn xs ghost tg-dice', title: 'Apply a random template (from the current filters)', onclick: () => surprise(view), html: `${icon('dice')}<span>Surprise me</span>` })));
    view.search = search;
    view.bar = bar;
    view.top = top;
    return [top, bar];
  }

  function syncBar(view) {
    const chips = $('.tg-chips', view.bar);
    const base = TEMPLATES.filter((t) => matches(t, true));
    chips.replaceChildren(
      chip('All', base.length, filters.cat === 'all', () => { filters.cat = 'all'; syncAll(); }),
      ...TEMPLATE_CATEGORIES.map((c) => {
        const n = base.filter((t) => t.category === c.id).length;
        const total = TEMPLATES.filter((t) => t.category === c.id).length;
        return total ? chip(c.name, n, filters.cat === c.id, () => { filters.cat = filters.cat === c.id ? 'all' : c.id; syncAll(); }, n ? '' : 'empty') : null;
      }));
    const tog = (label, on, fn) => chip(label, null, on, () => { fn(); syncAll(); }, 'tg-tog');
    $('.tg-toggles', view.bar).replaceChildren(
      tog('Photo', filters.photo === 'yes', () => { filters.photo = filters.photo === 'yes' ? '' : 'yes'; }),
      tog('No photo', filters.photo === 'no', () => { filters.photo = filters.photo === 'no' ? '' : 'no'; }),
      tog('One column', filters.cols === '1', () => { filters.cols = filters.cols === '1' ? '' : '1'; }),
      tog('Two columns', filters.cols === '2', () => { filters.cols = filters.cols === '2' ? '' : '2'; }),
      tog('ATS-friendly', filters.ats, () => { filters.ats = !filters.ats; }));
    if (view.search.value !== filters.q) view.search.value = filters.q;
    const n = TEMPLATES.filter((t) => matches(t)).length;
    $('.tg-count', view.bar).textContent = anyFilter() ? `${n} of ${TEMPLATES.length} templates` : `${TEMPLATES.length} templates`;
    $('.tg-clear', view.bar).hidden = !anyFilter();
  }

  /* lay out the cards of `view` for the current filters, grouped under category headings */
  function layout(view) {
    const list = TEMPLATES.filter((t) => matches(t));
    const kids = [];
    TEMPLATE_CATEGORIES.forEach((c) => {
      const items = list.filter((t) => t.category === c.id);
      if (!items.length) return;
      kids.push(h('div', { class: 'tg-head' }, h('b', {}, c.name), h('small', {}, c.desc), h('span', { class: 'n' }, String(items.length))));
      items.forEach((t) => {
        if (!view.cards.has(t.id)) { const c = card(t, view); view.cards.set(t.id, c); view.io.observe(c); } // registered after build()
        kids.push(view.cards.get(t.id));
      });
    });
    if (!list.length) kids.push(h('div', { class: 'tg-empty' }, h('b', {}, 'No templates match'), h('span', {}, 'Try another search or clear the filters.')));
    view.grid.replaceChildren(...kids);
  }

  function refilter(view) { (view ? [view] : views).forEach((v) => { syncBar(v); layout(v); }); }
  function syncAll() { views.forEach((v) => { syncBar(v); layout(v); }); }

  function makeView(grid, scrollRoot, isModal) {
    const view = { grid, modal: isModal, cards: new Map() };
    view.io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        const c = en.target;
        c._vis = en.isIntersecting;
        if (c._vis) enqueue(c);
      });
    }, { root: scrollRoot, rootMargin: '300px 0px' });
    TEMPLATES.forEach((t) => {
      const c = card(t, view);
      view.cards.set(t.id, c);
      view.io.observe(c);
    });
    return view;
  }
  function dropView(view) {
    view.io.disconnect();
    const i = views.indexOf(view);
    if (i >= 0) views.splice(i, 1);
  }

  /* ----- public: side panel gallery ----- */
  function build() {
    const grid = $('#tplGrid');
    if (!grid) return;
    const old = views.find((v) => !v.modal);
    if (old) dropView(old);
    $$('.tg-top, .tg-bar', grid.parentNode).forEach((n) => n.remove());
    const view = makeView(grid, grid.closest('.panel-scroll'), false);
    toolbar(view).forEach((n) => grid.parentNode.insertBefore(n, grid));
    views.push(view);
    syncBar(view);
    layout(view);
    sig = thumbSig();
    version++;
    if (modal) { modal.view.cards.forEach((c) => c.classList.toggle('active', c.dataset.tpl === App.state.design.template)); }
  }

  function select(id) {
    const d = App.state.design;
    d.template = id; d.accent = null; d.accent2 = null; d.fontHead = null; d.fontBody = null; d.sideWidth = null; d.skillStyle = 'auto'; d.overrides = {};
    views.forEach((v) => v.cards.forEach((c) => c.classList.toggle('active', c.dataset.tpl === id)));
    App.changed('design');
    Design.build();
    Editor.build();
    toast(`Template "${tplById(id).name}" applied`);
  }

  function surprise(view) {
    const cur = App.state.design.template;
    let list = TEMPLATES.filter((t) => matches(t) && t.id !== cur);
    if (!list.length) list = TEMPLATES.filter((t) => t.id !== cur);
    if (!list.length) return;
    const t = list[Math.floor(Math.random() * list.length)];
    select(t.id);
    const c = view.cards.get(t.id);
    if (c && c.isConnected) c.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /** Re-render stale visible thumbnails. Content/spacing changes make every thumbnail stale; `force` (fonts finished
      loading, tab shown) also refreshes thumbnails that were drawn before their fonts were available. */
  let forced = false;
  function refresh(force) {
    forced = forced || !!force;
    clearTimeout(dirtyTimer);
    dirtyTimer = setTimeout(() => {
      const s = thumbSig();
      if (s !== sig) { sig = s; version++; }
      if (forced) views.forEach((v) => v.cards.forEach((card) => { if (card._ver === version && !card._fontsOk && fontsReady(tplById(card.dataset.tpl))) card._ver = 0; }));
      forced = false;
      enqueueVisible();
    }, 220);
  }
  const markDirty = () => refresh(false);

  /* ----- full-screen browser ----- */
  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeModal(); }
    else if (e.key === 'Tab' && modal) {
      // keep focus inside the dialog
      const f = $$('button, input, [tabindex]:not([tabindex="-1"])', modal.el).filter((n) => !n.disabled && n.offsetParent);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  }
  function sizeModal() {
    if (!modal) return;
    const first = $('.tpl-thumb', modal.view.grid);
    const w = first ? first.clientWidth : 0;
    if (w > 0) modal.view.grid.style.setProperty('--tg-zoom', (w / PAGE_W).toFixed(4));
  }
  function openModal() {
    if (modal) return;
    const grid = h('div', { class: 'tpl-grid tg-modal-grid' });
    const scroller = h('div', { class: 'tg-modal-body' }, grid);
    const dialog = h('div', { class: 'tg-dialog glass', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'All templates' });
    const el = h('div', { class: 'tg-modal', onclick: (e) => { if (e.target === el) closeModal(); } }, dialog);
    const view = makeView(grid, scroller, true);
    const head = h('div', { class: 'tg-modal-head' }, h('div', { class: 'tg-title' }, h('b', {}, 'Template gallery'), h('small', {}, 'Your content, every design. Click a template to apply it.')), toolbar(view));
    dialog.append(head, scroller);
    document.body.appendChild(el);
    views.push(view);
    modal = { el, view, ret: document.activeElement, ro: new ResizeObserver(sizeModal) };
    syncBar(view);
    layout(view);
    modal.ro.observe(grid);
    document.addEventListener('keydown', onKey, true);
    document.body.classList.add('tg-open');
    requestAnimationFrame(() => { sizeModal(); el.classList.add('show'); view.search.focus(); const a = view.cards.get(App.state.design.template); if (a && a.isConnected) a.scrollIntoView({ block: 'center' }); });
  }
  function closeModal() {
    if (!modal) return;
    const m = modal;
    modal = null;
    document.removeEventListener('keydown', onKey, true);
    m.ro.disconnect();
    dropView(m.view);
    m.el.remove();
    document.body.classList.remove('tg-open');
    syncAll();
    enqueueVisible();
    if (m.ret && m.ret.isConnected) m.ret.focus();
  }

  return { build, refresh, markDirty, select, openModal, closeModal, filters };
})();
