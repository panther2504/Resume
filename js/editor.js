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

  function build() {
    const d = App.state.design;
    const eff = Render.effective(d);
    const root = $('#designForms');
    root.innerHTML = '';
    const swatches = h('div', { class: 'swatches' },
      ACCENTS.map((c) => h('button', { type: 'button', class: `sw${eff.accent.toLowerCase() === c ? ' active' : ''}`, style: { background: c }, title: c, onclick: () => { d.accent = c; App.changed('design'); build(); } })),
      h('label', { class: 'sw custom', title: 'Custom color', html: icon('palette') },
        h('input', { type: 'color', value: eff.accent, oninput: (e) => { d.accent = e.target.value; App.changed('design'); }, onchange: () => build() })));
    root.append(
      h('div', { class: 'card open static' }, h('div', { class: 'card-body' },
        h('div', { class: 'cur-tpl' }, h('div', {}, h('small', {}, 'Current template'), h('b', {}, eff.t.name)),
          h('button', { class: 'btn sm', type: 'button', onclick: () => App.setTab('templates') }, 'Change')),
        h('div', { class: 'sub-label' }, 'Accent color', d.accent && h('button', { class: 'link', type: 'button', onclick: () => { d.accent = null; App.changed('design'); build(); } }, 'Reset')),
        swatches,
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
        h('button', { class: 'btn sm ghost block', type: 'button', onclick: () => {
          Object.assign(d, { ...DEFAULT_DESIGN, template: d.template, showPhoto: d.showPhoto }); App.changed('design'); build();
        } }, 'Reset design to template defaults'),
      )),
    );
  }
  return { build };
})();

/* ---------- Template gallery with live thumbnails ---------- */
const Gallery = (() => {
  let dirty = true;
  let timer = null;
  function build() {
    const grid = $('#tplGrid');
    grid.innerHTML = '';
    TEMPLATES.forEach((t) => {
      const thumb = h('div', { class: 'tpl-thumb pages' });
      const c = h('button', { type: 'button', class: `tpl-card${App.state.design.template === t.id ? ' active' : ''}`, 'data-tpl': t.id, onclick: () => select(t.id) },
        thumb,
        h('div', { class: 'tpl-meta' }, h('b', {}, t.name), h('small', {}, t.desc)),
        h('span', { class: 'tpl-check', html: '✓' }));
      grid.appendChild(c);
    });
    dirty = true;
    refresh();
  }
  function select(id) {
    const d = App.state.design;
    d.template = id; d.accent = null; d.fontHead = null; d.fontBody = null; d.sideWidth = null; d.skillStyle = 'auto';
    $$('.tpl-card').forEach((c) => c.classList.toggle('active', c.dataset.tpl === id));
    App.changed('design');
    Design.build();
    Editor.build();
    toast(`Template "${tplById(id).name}" applied`);
  }
  function refresh(force) {
    if (force) dirty = true;
    clearTimeout(timer);
    timer = setTimeout(() => {
      const grid = $('#tplGrid');
      if (!dirty || !grid || !grid.offsetParent) return;
      dirty = false;
      $$('.tpl-card', grid).forEach((c) => {
        const d = { ...App.state.design, template: c.dataset.tpl, accent: null, fontHead: null, fontBody: null, sideWidth: null, skillStyle: 'auto' };
        Render.render($('.tpl-thumb', c), App.state.data, d, { maxPages: 1 });
      });
    }, 250);
  }
  const markDirty = () => { dirty = true; refresh(); };
  return { build, refresh, markDirty };
})();
