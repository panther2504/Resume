/* Resume Studio — freeform Canvas Designer (drag & drop, resize, styles, multi-page) */

const PAGE_W = 793.7; // 210mm @ 96dpi
const PAGE_H = 1122.5; // 297mm @ 96dpi

/* ---------- Element factories ---------- */
const ELEMENT_TYPES = [
  { key: 'heading', label: 'Heading', icon: 'heading' },
  { key: 'subheading', label: 'Subtitle', icon: 'subtitle' },
  { key: 'section', label: 'Section title', icon: 'section' },
  { key: 'paragraph', label: 'Paragraph', icon: 'paragraph' },
  { key: 'list', label: 'Bullet list', icon: 'list' },
  { key: 'entry', label: 'Job / entry', icon: 'briefcase' },
  { key: 'contact', label: 'Contact info', icon: 'contact' },
  { key: 'bar', label: 'Skill bar', icon: 'bar' },
  { key: 'chips', label: 'Chips', icon: 'chips' },
  { key: 'photo', label: 'Photo', icon: 'user' },
  { key: 'image', label: 'Image', icon: 'image' },
  { key: 'rect', label: 'Rectangle', icon: 'square' },
  { key: 'circle', label: 'Circle', icon: 'circle' },
  { key: 'line', label: 'Line', icon: 'line' },
];

function makeEl(key, accent = '#2563eb') {
  const base = (type, w, hgt, style, extra) => ({ id: uid(), type, x: 0, y: 0, w, h: hgt, z: 1, rot: 0, style: { opacity: 1, ...style }, ...extra });
  const body = { fontFamily: 'Inter', fontSize: 12, color: '#334155', lineHeight: 1.5 };
  const ci = (ic, t) => `<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">${icon(ic, 'ci-ico').replace('<svg', `<svg style="width:14px;height:14px;flex:none;color:${accent}"`)}<span>${t}</span></div>`;
  switch (key) {
    case 'heading': return base('text', 420, 46, { fontFamily: 'Montserrat', fontSize: 32, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }, { html: 'Your Name' });
    case 'subheading': return base('text', 360, 24, { fontFamily: 'Montserrat', fontSize: 15, fontWeight: 500, color: accent, letterSpacing: 1.5, textTransform: 'uppercase', lineHeight: 1.3 }, { html: 'Professional Title' });
    case 'section': return base('text', 340, 28, { fontFamily: 'Montserrat', fontSize: 14, fontWeight: 700, color: '#0f172a', letterSpacing: 1.5, textTransform: 'uppercase', borderWidth: 2, borderColor: accent, borderSide: 'bottom', padding: 4, lineHeight: 1.3 }, { html: 'Section Title' });
    case 'paragraph': return base('text', 340, 60, body, { html: 'Write a short paragraph about yourself, your strengths and what you are looking for. Double-click to edit this text.' });
    case 'list': return base('text', 340, 70, body, { html: '<ul><li>Increased conversion by 25% in six months</li><li>Led a cross-functional team of 8 people</li><li>Launched 3 products used by 1M+ users</li></ul>' });
    case 'entry': return base('text', 360, 96, body, { html: `<div style="display:flex;justify-content:space-between;gap:8px;align-items:baseline"><b style="color:#0f172a;font-size:14px">Job Title</b><span style="color:#64748b;font-size:11px">2021 – Present</span></div><div style="color:${accent};font-weight:600">Company Name · City</div><ul style="margin-top:4px"><li>Key achievement or responsibility</li><li>Another measurable result</li></ul>` });
    case 'contact': return base('text', 240, 96, { ...body, fontSize: 11.5 }, { html: ci('mail', 'you@email.com') + ci('phone', '+1 555 0100') + ci('pin', 'City, Country') + ci('globe', 'yourwebsite.com') });
    case 'bar': return base('bar', 220, 34, { fontFamily: 'Inter', fontSize: 11.5, fontWeight: 600, color: '#334155' }, { label: 'Skill name', level: 80, color: accent, track: '#e2e8f0', barH: 6, showPct: false });
    case 'chips': return base('text', 260, 56, { fontFamily: 'Inter', fontSize: 11, color: '#1e293b', lineHeight: 1.3 },
      { html: ['Leadership', 'Strategy', 'Figma', 'Research', 'Agile'].map((t) => `<span style="display:inline-block;padding:3px 10px;margin:0 5px 6px 0;border-radius:99px;background:${accent}22;color:${accent};font-weight:500">${t}</span>`).join('') });
    case 'photo': return base('image', 130, 130, { radius: 999, borderWidth: 3, borderColor: '#ffffff', shadow: true }, { src: '', fit: 'cover' });
    case 'image': return base('image', 180, 130, { radius: 8 }, { src: '', fit: 'cover' });
    case 'rect': return base('shape', 200, 120, { background: '#e0e7ff', radius: 8 }, { shape: 'rect' });
    case 'circle': return base('shape', 110, 110, { background: '#c7d2fe' }, { shape: 'circle' });
    case 'line': return base('line', 300, 2, { background: '#cbd5e1' });
    default: return base('text', 300, 40, body, { html: 'Text' });
  }
}

/* ---------- Capture a rendered template block as inline-styled HTML ---------- */
const Snap = (() => {
  const INH = ['color', 'font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 'letter-spacing', 'text-transform', 'text-align', 'white-space', 'list-style-type', 'word-break'];
  const NON = {
    'flex-direction': 'row', 'flex-wrap': 'nowrap', 'justify-content': 'normal', 'align-items': 'normal', 'row-gap': 'normal', 'column-gap': 'normal',
    'flex-grow': '0', 'flex-shrink': '1', 'flex-basis': 'auto', 'background-color': 'rgba(0, 0, 0, 0)', 'background-image': 'none',
    'border-top-left-radius': '0px', 'border-top-right-radius': '0px', 'border-bottom-left-radius': '0px', 'border-bottom-right-radius': '0px',
    'padding-top': '0px', 'padding-right': '0px', 'padding-bottom': '0px', 'padding-left': '0px',
    'margin-top': '0px', 'margin-right': '0px', 'margin-bottom': '0px', 'margin-left': '0px',
    'text-decoration-line': 'none', opacity: '1', position: 'static', 'vertical-align': 'baseline', 'box-shadow': 'none', 'object-fit': 'fill', order: '0',
  };
  const POS = ['top', 'left', 'right', 'bottom'];
  const SIDES = ['top', 'right', 'bottom', 'left'];

  function styleFor(src, cs, pcs, isRoot) {
    const out = [];
    const tag = src.tagName;
    const empty = !src.textContent.trim();
    if (!isRoot) {
      INH.forEach((p) => { const v = cs.getPropertyValue(p); if (!pcs || v !== pcs.getPropertyValue(p)) out.push(`${p}:${v}`); });
    }
    out.push(`display:${cs.display}`);
    Object.entries(NON).forEach(([p, def]) => {
      if (isRoot && p.startsWith('margin')) return;
      const v = cs.getPropertyValue(p);
      if (v && v !== def) out.push(`${p}:${v}`);
    });
    SIDES.forEach((s) => {
      if (cs.getPropertyValue(`border-${s}-style`) !== 'none' && parseFloat(cs.getPropertyValue(`border-${s}-width`)) > 0) {
        out.push(`border-${s}:${cs.getPropertyValue(`border-${s}-width`)} ${cs.getPropertyValue(`border-${s}-style`)} ${cs.getPropertyValue(`border-${s}-color`)}`);
      }
    });
    if (cs.position === 'absolute' || cs.position === 'relative') POS.forEach((p) => { const v = cs.getPropertyValue(p); if (v !== 'auto') out.push(`${p}:${v}`); });
    const media = tag === 'IMG' || tag === 'svg';
    const flexNone = src.parentElement && getComputedStyle(src.parentElement).display.includes('flex') && cs.flexShrink === '0';
    if (!isRoot && (empty || media || flexNone)) out.push(`width:${cs.width}`);
    if (!isRoot && (empty || media || src.classList.contains('photo'))) out.push(`height:${cs.height}`);
    if (isRoot) out.push('width:100%');
    if (tag === 'svg') out.push(`stroke:${cs.stroke}`, `fill:${cs.fill}`, `stroke-width:${cs.strokeWidth}`);
    return out.join(';');
  }

  function walk(src, pcs, isRoot) {
    if (src.nodeType === 3) return document.createTextNode(src.textContent);
    if (src.nodeType !== 1) return null;
    const cs = getComputedStyle(src);
    if (cs.display === 'none') return null;
    let c;
    if (src.tagName === 'svg') {
      c = src.cloneNode(true);
      c.removeAttribute('class');
    } else {
      c = document.createElement(src.tagName);
      [...src.attributes].forEach((a) => { if (a.name !== 'class' && a.name !== 'style' && !a.name.startsWith('data-')) c.setAttribute(a.name, a.value); });
      src.childNodes.forEach((n) => { const k = walk(n, cs, false); if (k) c.appendChild(k); });
    }
    c.setAttribute('style', styleFor(src, cs, pcs, isRoot) + (src.getAttribute('style') && src.tagName !== 'svg' ? ';' + src.getAttribute('style') : ''));
    return c;
  }

  function lh(cs) {
    const v = parseFloat(cs.lineHeight);
    return Number.isFinite(v) ? +(v / parseFloat(cs.fontSize)).toFixed(2) : 1.4;
  }

  function capture(block) {
    const cs = getComputedStyle(block);
    const node = walk(block, null, true);
    return {
      html: node.outerHTML,
      style: {
        fontFamily: fontName(cs.fontFamily), fontSize: +parseFloat(cs.fontSize).toFixed(2), fontWeight: cs.fontWeight, fontStyle: cs.fontStyle,
        color: toHex(cs.color), lineHeight: lh(cs), letterSpacing: parseFloat(cs.letterSpacing) || 0, textAlign: cs.textAlign === 'start' ? 'left' : cs.textAlign,
        textTransform: cs.textTransform, opacity: 1,
      },
    };
  }
  return { capture };
})();

function toHex(c) {
  const m = String(c).match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.]+))?/);
  if (!m) return c;
  if (m[4] !== undefined && +m[4] < 1) return c;
  return '#' + [m[1], m[2], m[3]].map((v) => Math.round(+v).toString(16).padStart(2, '0')).join('');
}
const isHex = (c) => /^#[0-9a-f]{6}$/i.test(c || '');

/* ---------- Canvas controller ---------- */
const Canvas = (() => {
  let sel = null;
  let curPage = 0;
  let editing = null;
  let clipboard = null;
  let savedRange = null;
  const opts = { grid: false, snap: true, guides: true };

  const root = () => $('#cvPages');
  const st = () => App.state.canvas;
  const zoom = () => App.state.zoom;
  const nodeOf = (id) => root().querySelector(`.cel[data-id="${id}"]`);

  function find(id) {
    for (let pi = 0; pi < st().pages.length; pi++) {
      const p = st().pages[pi];
      const el = p.elements.find((e) => e.id === id);
      if (el) return { el, page: p, pi };
    }
    return null;
  }

  /* ----- rendering ----- */
  function render() {
    const r = root();
    if (curPage >= st().pages.length) curPage = st().pages.length - 1;
    r.innerHTML = '';
    st().pages.forEach((p, i) => r.appendChild(pageNode(p, i)));
    if (sel && !find(sel)) sel = null;
    Props.render();
  }

  function pageNode(p, i) {
    const n = st().pages.length;
    const pg = h('div', { class: `page cpage${opts.grid ? ' show-grid' : ''}`, 'data-page': i, style: { background: p.bg || '#ffffff' } });
    p.elements.forEach((e) => pg.appendChild(elNode(e)));
    if (!p.elements.length) {
      pg.appendChild(h('div', { class: 'empty-hint', html: `${icon('sparkles')}<b>Drag elements here</b><span>or click an element in the left panel. You can also drop image files.</span>` }));
    }
    pg.appendChild(h('div', { class: 'guides' }));
    const label = h('div', { class: 'cpage-label' },
      h('span', {}, `Page ${i + 1} of ${n}`),
      h('div', { class: 'cpage-actions' },
        iconBtn('up', 'Move page up', () => movePage(i, -1), i === 0 ? 'disabled' : ''),
        iconBtn('down', 'Move page down', () => movePage(i, 1), i === n - 1 ? 'disabled' : ''),
        iconBtn('copy', 'Duplicate page', () => dupPage(i)),
        iconBtn('plus', 'Add page after', () => addPage(i)),
        iconBtn('trash', 'Delete page', () => delPage(i), 'danger')));
    const block = h('div', { class: `cpage-block${i === curPage ? ' current' : ''}`, 'data-page': i }, label, h('div', { class: 'page-wrap cwrap' }, pg));
    bindDrop(pg, i);
    return block;
  }

  function elNode(e) {
    const n = h('div', { class: `cel cel-${e.type}${e.id === sel ? ' selected' : ''}${e.locked ? ' locked' : ''}`, 'data-id': e.id });
    n.appendChild(h('div', { class: 'cel-inner' }));
    fill(e, n);
    ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].forEach((d) => n.appendChild(h('div', { class: `hdl hdl-${d}`, 'data-dir': d })));
    return n;
  }

  function place(e, n) {
    Object.assign(n.style, {
      left: `${e.x}px`, top: `${e.y}px`, width: `${e.w}px`, zIndex: e.z || 1,
      opacity: e.style.opacity ?? 1, transform: e.rot ? `rotate(${e.rot}deg)` : '',
    });
    if (e.type === 'text') { n.style.height = ''; n.style.minHeight = `${e.h}px`; } else { n.style.height = `${e.h}px`; n.style.minHeight = ''; }
  }

  function applyStyle(inner, e) {
    const s = e.style || {};
    const c = inner.style;
    inner.removeAttribute('style');
    if (s.fontFamily) c.fontFamily = fontStack(s.fontFamily);
    if (s.fontSize) c.fontSize = `${s.fontSize}px`;
    if (s.fontWeight) c.fontWeight = s.fontWeight;
    if (s.fontStyle) c.fontStyle = s.fontStyle;
    if (s.textDecoration) c.textDecoration = s.textDecoration;
    if (s.textTransform) c.textTransform = s.textTransform;
    if (s.color) c.color = s.color;
    if (s.textAlign) c.textAlign = s.textAlign;
    if (s.lineHeight) c.lineHeight = s.lineHeight;
    if (typeof s.letterSpacing === 'number') c.letterSpacing = `${s.letterSpacing}px`;
    if (s.background) c.background = s.background;
    if (s.padding) c.padding = `${s.padding}px`;
    if (s.radius) c.borderRadius = `${s.radius}px`;
    if (e.type === 'shape' && e.shape === 'circle') c.borderRadius = '50%';
    if (s.borderWidth > 0) {
      const b = `${s.borderWidth}px ${s.borderStyle || 'solid'} ${s.borderColor || '#000000'}`;
      const side = s.borderSide || 'all';
      if (side === 'all') c.border = b; else c[`border${side[0].toUpperCase()}${side.slice(1)}`] = b;
    }
    if (s.shadow) c.boxShadow = '0 10px 28px rgba(15,23,42,.22)';
    if (e.type === 'line' && !s.background) c.background = '#1e293b';
  }

  function fill(e, n) {
    const inner = n.querySelector('.cel-inner');
    place(e, n);
    applyStyle(inner, e);
    if (e.type === 'text') { if (editing !== e.id) inner.innerHTML = e.html || ''; }
    else if (e.type === 'image') {
      inner.innerHTML = e.src
        ? `<img src="${e.src}" alt="" draggable="false" style="object-fit:${e.fit || 'cover'}">`
        : `<div class="img-ph">${icon(e.style.radius >= 999 ? 'user' : 'image')}<span>Double-click to upload</span></div>`;
    } else if (e.type === 'bar') {
      const bh = e.barH || 6;
      inner.innerHTML = `<div class="bar-label"><span>${esc(e.label)}</span>${e.showPct ? `<span>${e.level}%</span>` : ''}</div>`
        + `<div class="bar-track" style="background:${e.track};height:${bh}px;border-radius:${bh}px"><div style="width:${e.level}%;background:${e.color};height:100%;border-radius:${bh}px"></div></div>`;
    } else inner.innerHTML = '';
  }

  function refresh(e) {
    const n = nodeOf(e.id);
    if (n) { fill(e, n); n.classList.toggle('locked', !!e.locked); }
  }

  /* ----- selection ----- */
  function select(id) {
    if (editing && editing !== id) endEdit();
    sel = id;
    $$('.cel.selected', root()).forEach((n) => n.classList.remove('selected'));
    if (id) nodeOf(id)?.classList.add('selected');
    Props.render();
  }
  function setCurPage(i) {
    if (i === curPage) return;
    curPage = i;
    $$('.cpage-block', root()).forEach((b) => b.classList.toggle('current', +b.dataset.page === i));
    if (!sel) Props.render();
  }

  /* ----- text editing ----- */
  function beginEdit(id) {
    const f = find(id);
    if (!f || f.el.type !== 'text' || f.el.locked) return;
    editing = id;
    const n = nodeOf(id);
    const inner = n.querySelector('.cel-inner');
    n.classList.add('editing');
    inner.contentEditable = 'true';
    inner.focus();
    const s = getSelection();
    if (!s.rangeCount || !inner.contains(s.anchorNode)) {
      const r = document.createRange(); r.selectNodeContents(inner); r.collapse(false);
      s.removeAllRanges(); s.addRange(r);
    }
    inner.oninput = () => { f.el.html = inner.innerHTML; App.changed('canvas'); };
    Props.render();
  }
  function endEdit() {
    if (!editing) return;
    const f = find(editing);
    const n = nodeOf(editing);
    editing = null;
    savedRange = null;
    if (n) {
      const inner = n.querySelector('.cel-inner');
      inner.contentEditable = 'false';
      inner.oninput = null;
      n.classList.remove('editing');
      if (f) { f.el.html = inner.innerHTML; App.changed('canvas'); }
    }
    getSelection().removeAllRanges();
    Props.render();
  }
  document.addEventListener('selectionchange', () => {
    if (!editing) return;
    const s = getSelection();
    const inner = nodeOf(editing)?.querySelector('.cel-inner');
    if (inner && s.rangeCount && inner.contains(s.getRangeAt(0).commonAncestorContainer)) savedRange = s.getRangeAt(0).cloneRange();
  });
  const hasTextSel = () => editing && savedRange && !savedRange.collapsed;
  function exec(cmd, val) {
    const inner = nodeOf(editing)?.querySelector('.cel-inner');
    if (!inner) return;
    inner.focus();
    if (savedRange) { const s = getSelection(); s.removeAllRanges(); s.addRange(savedRange); }
    document.execCommand('styleWithCSS', false, true);
    document.execCommand(cmd, false, val);
    const f = find(editing);
    if (f) { f.el.html = inner.innerHTML; App.changed('canvas'); }
  }
  function execFontSize(px) {
    exec('fontSize', 7);
    const inner = nodeOf(editing)?.querySelector('.cel-inner');
    if (!inner) return;
    $$('font[size="7"]', inner).forEach((f) => { const s = h('span', { style: { fontSize: `${px}px` } }); s.innerHTML = f.innerHTML; f.replaceWith(s); });
    $$('span', inner).forEach((s) => { if (/xxx-large/.test(s.style.fontSize)) s.style.fontSize = `${px}px`; });
    const f = find(editing);
    if (f) { f.el.html = inner.innerHTML; App.changed('canvas'); }
  }

  /* ----- pointer interactions ----- */
  function onPointerDown(ev) {
    if (ev.button !== 0) return;
    const pg = ev.target.closest('.cpage');
    if (!pg) return;
    setCurPage(+pg.dataset.page);
    const cn = ev.target.closest('.cel');
    const hdl = ev.target.closest('.hdl');
    if (!cn) { endEdit(); select(null); return; }
    const id = cn.dataset.id;
    if (editing === id && !hdl) return; // allow caret placement / text selection
    if (editing && editing !== id) endEdit();
    if (sel !== id) select(id);
    const f = find(id);
    if (!f || f.el.locked) return;
    ev.preventDefault();
    startDrag(ev, f, cn, hdl ? hdl.dataset.dir : null, pg);
  }

  function startDrag(ev, f, node, dir, pg) {
    const z = zoom();
    const sx = ev.clientX, sy = ev.clientY;
    const e = f.el;
    const o = { x: e.x, y: e.y, w: e.w, h: e.type === 'text' ? node.offsetHeight : e.h };
    let moved = false;
    const others = f.page.elements.filter((x) => x.id !== e.id).map((x) => {
      const n = nodeOf(x.id);
      return { x: x.x, y: x.y, w: x.w, h: n ? n.offsetHeight : x.h };
    });
    document.body.classList.add('cv-dragging');
    pg.classList.add('dragging');

    const move = (m) => {
      const dx = (m.clientX - sx) / z, dy = (m.clientY - sy) / z;
      if (!moved && Math.abs(dx) + Math.abs(dy) < 2) return;
      moved = true;
      if (!dir) {
        const r = snapMove(o.x + dx, o.y + dy, o.w, o.h, others, pg, m.altKey);
        e.x = Math.round(r.x); e.y = Math.round(r.y);
      } else {
        let { x, y, w, h: hh } = o;
        if (dir.includes('e')) w = o.w + dx;
        if (dir.includes('s')) hh = o.h + dy;
        if (dir.includes('w')) { w = o.w - dx; x = o.x + dx; }
        if (dir.includes('n')) { hh = o.h - dy; y = o.y + dy; }
        const keep = (m.shiftKey || e.type === 'image' || (e.type === 'shape' && e.shape === 'circle')) && dir.length === 2;
        if (keep) { const ratio = o.w / o.h; hh = w / ratio; if (dir.includes('n')) y = o.y + o.h - hh; }
        if (opts.snap && !m.altKey) { w = Math.round(w / 5) * 5; if (!keep) hh = Math.round(hh / 5) * 5; }
        const minW = 12, minH = e.type === 'line' ? 1 : 8;
        if (w < minW) { if (dir.includes('w')) x -= minW - w; w = minW; }
        if (hh < minH) { if (dir.includes('n')) y -= minH - hh; hh = minH; }
        Object.assign(e, { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(hh) });
      }
      place(e, node);
      Props.syncGeom(e);
    };
    const up = (u) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      document.body.classList.remove('cv-dragging');
      pg.classList.remove('dragging');
      clearGuides(pg);
      if (!moved) return;
      if (!dir) {
        const target = document.elementsFromPoint(u.clientX, u.clientY).find((t) => t.classList && t.classList.contains('cpage'));
        if (target && target !== pg) {
          const tr = target.getBoundingClientRect(), nr = node.getBoundingClientRect();
          e.x = Math.round((nr.left - tr.left) / z); e.y = Math.round((nr.top - tr.top) / z);
          f.page.elements.splice(f.page.elements.indexOf(e), 1);
          const tp = st().pages[+target.dataset.page];
          e.z = maxZ(tp) + 1;
          tp.elements.push(e);
          curPage = +target.dataset.page;
          render();
        }
      }
      App.changed('canvas');
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  function snapMove(x, y, w, hh, others, pg, free) {
    clearGuides(pg);
    if (free) return { x, y };
    if (!opts.guides) return opts.snap ? { x: Math.round(x / 5) * 5, y: Math.round(y / 5) * 5 } : { x, y };
    const T = 6;
    const xs = [0, PAGE_W / 2, PAGE_W], ys = [0, PAGE_H / 2, PAGE_H];
    others.forEach((o) => { xs.push(o.x, o.x + o.w / 2, o.x + o.w); ys.push(o.y, o.y + o.h / 2, o.y + o.h); });
    const best = (pos, size, lines) => {
      let b = null;
      [0, size / 2, size].forEach((off) => lines.forEach((l) => {
        const d = l - (pos + off);
        if (Math.abs(d) <= T && (!b || Math.abs(d) < Math.abs(b.d))) b = { d, l };
      }));
      return b;
    };
    const bx = best(x, w, xs), by = best(y, hh, ys);
    if (bx) { x += bx.d; guide(pg, 'v', bx.l); } else if (opts.snap) x = Math.round(x / 5) * 5;
    if (by) { y += by.d; guide(pg, 'h', by.l); } else if (opts.snap) y = Math.round(y / 5) * 5;
    return { x, y };
  }
  function guide(pg, dir, pos) {
    const g = $('.guides', pg);
    g.appendChild(h('div', { class: `guide guide-${dir}`, style: dir === 'v' ? { left: `${pos}px` } : { top: `${pos}px` } }));
  }
  const clearGuides = (pg) => { const g = $('.guides', pg); if (g) g.innerHTML = ''; };

  function onDblClick(ev) {
    const cn = ev.target.closest('.cel');
    if (!cn) return;
    const f = find(cn.dataset.id);
    if (!f || f.el.locked) return;
    if (f.el.type === 'text') beginEdit(f.el.id);
    else if (f.el.type === 'image') replaceImage(f.el);
  }

  function replaceImage(e) {
    pickFile('image/*', async (file) => {
      try { e.src = await readImage(file, 1200); refresh(e); Props.render(); App.changed('canvas'); } catch { toast('Could not read that image'); }
    });
  }

  /* ----- drag & drop from palette / desktop ----- */
  function bindDrop(pg, i) {
    pg.addEventListener('dragover', (ev) => {
      const t = ev.dataTransfer.types;
      if (t.includes('text/x-cel') || t.includes('Files')) { ev.preventDefault(); pg.classList.add('drop-target'); }
    });
    pg.addEventListener('dragleave', (ev) => { if (!pg.contains(ev.relatedTarget)) pg.classList.remove('drop-target'); });
    pg.addEventListener('drop', async (ev) => {
      ev.preventDefault();
      pg.classList.remove('drop-target');
      const r = pg.getBoundingClientRect();
      const x = (ev.clientX - r.left) / zoom(), y = (ev.clientY - r.top) / zoom();
      const key = ev.dataTransfer.getData('text/x-cel');
      if (key) { add(key, i, x, y); return; }
      const files = [...ev.dataTransfer.files].filter((f) => f.type.startsWith('image/'));
      for (const [k, file] of files.entries()) {
        try {
          const src = await readImage(file, 1200);
          const e = makeEl('image');
          const img = await new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.src = src; });
          e.w = 220; e.h = Math.round(220 * img.height / img.width);
          e.src = src;
          add(e, i, x + k * 20, y + k * 20);
        } catch { toast('Could not read that image'); }
      }
    });
  }

  function maxZ(p) { return p.elements.reduce((m, e) => Math.max(m, e.z || 1), 0); }

  function add(keyOrEl, pi = curPage, x, y) {
    const accent = Render.effective(App.state.design).accent;
    const e = typeof keyOrEl === 'string' ? makeEl(keyOrEl, accent) : keyOrEl;
    const p = st().pages[pi];
    if (x == null) {
      const n = p.elements.length % 8;
      x = PAGE_W / 2; y = 120 + n * 30 + e.h / 2;
    }
    e.x = Math.round(Math.max(0, Math.min(PAGE_W - e.w, x - e.w / 2)));
    e.y = Math.round(Math.max(0, Math.min(PAGE_H - e.h, y - e.h / 2)));
    e.z = maxZ(p) + 1;
    p.elements.push(e);
    curPage = pi;
    sel = e.id;
    render();
    nodeOf(e.id)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    App.changed('canvas');
    return e;
  }

  /* ----- element operations ----- */
  function remove(id = sel) {
    const f = find(id); if (!f) return;
    if (editing === id) endEdit();
    f.page.elements.splice(f.page.elements.indexOf(f.el), 1);
    sel = null;
    render(); App.changed('canvas');
  }
  function duplicate(id = sel) {
    const f = find(id); if (!f) return;
    const c = clone(f.el); c.id = uid(); c.x += 16; c.y += 16; c.z = maxZ(f.page) + 1;
    f.page.elements.push(c); sel = c.id; render(); App.changed('canvas');
  }
  function layer(op) {
    const f = find(sel); if (!f) return;
    const arr = f.page.elements.slice().sort((a, b) => (a.z || 0) - (b.z || 0));
    const i = arr.indexOf(f.el);
    arr.splice(i, 1);
    const to = { front: arr.length, back: 0, forward: Math.min(arr.length, i + 1), backward: Math.max(0, i - 1) }[op];
    arr.splice(to, 0, f.el);
    arr.forEach((e, k) => { e.z = k + 1; refresh(e); });
    App.changed('canvas');
  }
  function update(e, fn) { fn(e); refresh(e); App.changed('canvas'); }

  /* ----- pages ----- */
  function addPage(after = curPage) {
    st().pages.splice(after + 1, 0, { id: uid(), bg: '#ffffff', elements: [] });
    curPage = after + 1; sel = null; render(); App.changed('canvas');
    $(`.cpage-block[data-page="${curPage}"]`, root())?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function dupPage(i) {
    const c = clone(st().pages[i]); c.id = uid(); c.elements.forEach((e) => { e.id = uid(); });
    st().pages.splice(i + 1, 0, c); curPage = i + 1; render(); App.changed('canvas');
  }
  function delPage(i) {
    if (st().pages.length === 1) { st().pages[0].elements = []; render(); App.changed('canvas'); toast('Page cleared'); return; }
    if (st().pages[i].elements.length && !confirm(`Delete page ${i + 1} and everything on it?`)) return;
    st().pages.splice(i, 1); curPage = Math.max(0, i - 1); sel = null; render(); App.changed('canvas');
  }
  function movePage(i, d) {
    const j = i + d; const p = st().pages;
    if (j < 0 || j >= p.length) return;
    [p[i], p[j]] = [p[j], p[i]]; curPage = j; render(); App.changed('canvas');
  }

  /* ----- starting points ----- */
  function hasContent() { return st().pages.some((p) => p.elements.length); }
  function replaceAll(pages, msg) {
    if (hasContent() && !confirm('Replace the current canvas design?')) return;
    st().pages = pages; sel = null; editing = null; curPage = 0;
    render(); App.changed('canvas'); App.fitZoom(); toast(msg);
  }
  function blank() { replaceAll([{ id: uid(), bg: '#ffffff', elements: [] }], 'Blank canvas ready'); }

  /** Convert the current template rendering into freely editable canvas elements. */
  function fromTemplate() {
    const host = $('#measureHost');
    host.innerHTML = '';
    Render.render(host, App.state.data, App.state.design);
    const pages = [];
    $$('.rpage', host).forEach((pg) => {
      const pr = pg.getBoundingClientRect();
      const page = { id: uid(), bg: '#ffffff', elements: [] };
      let z = 1;
      const rel = (n) => { const r = n.getBoundingClientRect(); return { x: Math.round(r.left - pr.left), y: Math.round(r.top - pr.top), w: Math.round(r.width), h: Math.round(r.height) }; };
      const rect = (g, color) => page.elements.push({ id: uid(), type: 'shape', shape: 'rect', ...g, z: z++, rot: 0, locked: false, style: { background: color, opacity: 1 } });
      $$('.pg-header, .col', pg).forEach((r) => {
        const cs = getComputedStyle(r); const g = rel(r);
        if (cs.backgroundColor !== 'rgba(0, 0, 0, 0)') rect(g, cs.backgroundColor);
        const bb = parseFloat(cs.borderBottomWidth); if (bb > 0 && cs.borderBottomStyle !== 'none') rect({ x: g.x, y: g.y + g.h - bb, w: g.w, h: Math.round(bb) }, cs.borderBottomColor);
        const bl = parseFloat(cs.borderLeftWidth); if (bl > 0 && cs.borderLeftStyle !== 'none') rect({ x: g.x, y: g.y, w: Math.round(bl), h: g.h }, cs.borderLeftColor);
      });
      const blocks = [...$$('.pg-header .hdr > *', pg), ...$$('.col > .blk', pg).flatMap((b) => (b.classList.contains('hdr') ? [...b.children] : [b]))];
      blocks.forEach((b) => {
        const g = rel(b);
        if (g.w < 1 || g.h < 1) return;
        const img = b.classList.contains('photo') && b.querySelector('img');
        if (img) {
          const cs = getComputedStyle(b);
          const rad = cs.borderTopLeftRadius.includes('%') ? 999 : parseFloat(cs.borderTopLeftRadius) || 0;
          page.elements.push({ id: uid(), type: 'image', ...g, z: z++, rot: 0, src: img.src, fit: 'cover',
            style: { radius: rad, borderWidth: parseFloat(cs.borderTopWidth) || 0, borderColor: toHex(cs.borderTopColor), opacity: 1 } });
          return;
        }
        const cap = Snap.capture(b);
        page.elements.push({ id: uid(), type: 'text', ...g, w: g.w + 2, z: z++, rot: 0, html: cap.html, style: cap.style });
      });
      pages.push(page);
    });
    host.innerHTML = '';
    replaceAll(pages, 'Template converted — drag, resize & restyle anything');
  }

  /** A hand-built starter layout populated from the resume data. */
  function starter() {
    const d = App.state.data, p = d.personal;
    const accent = '#3b82f6', dark = '#0f172a';
    const els = [];
    const put = (key, x, y, w, patch = {}) => { const e = makeEl(key, accent); Object.assign(e, { x, y, w: w ?? e.w }, patch); if (patch.style) e.style = { ...makeEl(key, accent).style, ...patch.style }; e.z = els.length + 1; els.push(e); return e; };
    put('rect', 0, 0, 265, { h: Math.round(PAGE_H), style: { background: dark, radius: 0 } });
    put('photo', 62, 50, 140, { h: 140, src: p.photo || '', style: { borderColor: '#334155' } });
    put('section', 32, 230, 200, { html: 'Contact', style: { color: '#ffffff', borderColor: accent } });
    const ci = (ic, t) => `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">${icon(ic, 'ci-ico').replace('<svg', `<svg style="width:14px;height:14px;flex:none;color:${accent}"`)}<span>${esc(t)}</span></div>`;
    put('contact', 32, 275, 205, { html: [['mail', p.email], ['phone', p.phone], ['pin', p.location], ['globe', p.website]].filter((x) => x[1]).map((x) => ci(...x)).join(''), style: { color: '#cbd5e1', fontSize: 11 } });
    const skills = d.sections.find((s) => s.type === 'skills');
    let y = 420;
    if (skills) {
      put('section', 32, y, 200, { html: esc(skills.title), style: { color: '#ffffff', borderColor: accent } });
      y += 45;
      skills.items.slice(0, 7).forEach((s) => { put('bar', 32, y, 200, { label: s.name, level: (s.level || 0) * 20, color: accent, track: '#334155', style: { color: '#e2e8f0' } }); y += 40; });
    }
    // main column: stacked top-to-bottom; real heights are measured after rendering
    const flow = [];
    const stack = (gap, e) => { flow.push({ gap, e }); return e; };
    stack(0, put('heading', 300, 56, 460, { html: esc(p.name), style: { fontSize: 36 } }));
    stack(6, put('subheading', 300, 0, 460, { html: esc(p.title) }));
    const prof = d.sections.find((s) => s.type === 'text');
    if (prof && prof.content) stack(18, put('paragraph', 300, 0, 460, { html: Render.rich(prof.content) }));
    d.sections.filter((s) => s.type === 'entries' && s.column !== 'side').slice(0, 2).forEach((s) => {
      stack(26, put('section', 300, 0, 460, { html: esc(s.title) }));
      s.items.slice(0, 3).forEach((it, k) => {
        const html = `<div style="display:flex;justify-content:space-between;gap:8px;align-items:baseline"><b style="color:#0f172a;font-size:14px">${esc(it.title)}</b><span style="color:#64748b;font-size:11px">${esc(it.date)}</span></div>`
          + `<div style="color:${accent};font-weight:600">${esc([it.subtitle, it.location].filter(Boolean).join(' · '))}</div>${it.description ? `<div style="margin-top:4px">${Render.rich(it.description)}</div>` : ''}`;
        const e = put('entry', 300, 0, 460, { html });
        e.h = 20;
        stack(k ? 14 : 12, e);
      });
    });
    if (hasContent() && !confirm('Replace the current canvas design?')) return;
    st().pages = [{ id: uid(), bg: '#ffffff', elements: els }]; sel = null; editing = null; curPage = 0;
    render();
    let cursor = 56;
    flow.forEach(({ gap, e }, k) => {
      if (k) e.y = Math.round(cursor + gap);
      refresh(e);
      cursor = e.y + (nodeOf(e.id)?.offsetHeight || e.h);
    });
    App.changed('canvas'); App.fitZoom(); toast('Starter layout created');
  }

  /* ----- keyboard ----- */
  function onKey(ev, typing) {
    const mod = ev.ctrlKey || ev.metaKey;
    if (ev.key === 'Escape') { if (editing) endEdit(); else select(null); return; }
    if (typing) return;
    const f = sel && find(sel);
    const k = ev.key.toLowerCase();
    if (mod && k === 'v' && clipboard) {
      ev.preventDefault();
      const c = clone(clipboard); c.id = uid(); c.x += 20; c.y += 20; clipboard = clone(c);
      add(c, curPage, c.x + c.w / 2, c.y + c.h / 2);
      return;
    }
    if (!f) return;
    if (ev.key === 'Delete' || ev.key === 'Backspace') { ev.preventDefault(); remove(); }
    else if (ev.key === 'Enter' && f.el.type === 'text') { ev.preventDefault(); beginEdit(f.el.id); }
    else if (ev.key.startsWith('Arrow')) {
      ev.preventDefault();
      const s = ev.shiftKey ? 10 : 1;
      if (ev.key === 'ArrowLeft') f.el.x -= s; if (ev.key === 'ArrowRight') f.el.x += s;
      if (ev.key === 'ArrowUp') f.el.y -= s; if (ev.key === 'ArrowDown') f.el.y += s;
      refresh(f.el); Props.syncGeom(f.el); App.changed('canvas');
    } else if (mod && k === 'd') { ev.preventDefault(); duplicate(); }
    else if (mod && k === 'c') { clipboard = clone(f.el); toast('Copied'); }
    else if (mod && k === 'x') { clipboard = clone(f.el); remove(); }
    else if (mod && ev.key === ']') { ev.preventDefault(); layer(ev.shiftKey ? 'front' : 'forward'); }
    else if (mod && ev.key === '[') { ev.preventDefault(); layer(ev.shiftKey ? 'back' : 'backward'); }
  }

  function init() {
    const r = root();
    r.addEventListener('pointerdown', onPointerDown);
    r.addEventListener('dblclick', onDblClick);
    $('#cvStage').addEventListener('pointerdown', (ev) => { if (!ev.target.closest('.cpage, .cpage-label')) { endEdit(); select(null); } });
    const pal = $('#palette');
    ELEMENT_TYPES.forEach((t) => {
      const tile = h('button', { class: 'pal-item', type: 'button', draggable: 'true', title: `Drag onto the page or click to add`, onclick: () => add(t.key) },
        h('span', { class: 'pal-ico', html: icon(t.icon) }), h('span', {}, t.label));
      tile.addEventListener('dragstart', (ev) => { ev.dataTransfer.setData('text/x-cel', t.key); ev.dataTransfer.effectAllowed = 'copy'; });
      pal.appendChild(tile);
    });
  }

  function reset() { sel = null; editing = null; savedRange = null; render(); }
  function deselect() { endEdit(); select(null); }

  return {
    init, render, reset, deselect, onKey, add, remove, duplicate, layer, update, refresh, find, beginEdit, endEdit, exec, execFontSize, hasTextSel,
    replaceImage, addPage, dupPage, delPage, blank, fromTemplate, starter, opts,
    get sel() { return sel; }, get editing() { return editing; }, get curPage() { return curPage; },
  };
})();

/* ---------- Properties panel (right side) ---------- */
const Props = (() => {
  const P = () => $('#propsPanel');
  const keep = (e) => e.preventDefault(); // keep text selection when clicking toolbar buttons

  function group(title, ...kids) { return h('div', { class: 'pgroup' }, h('div', { class: 'pgroup-title' }, title), kids); }
  function num(label, value, set, o = {}) {
    return h('label', { class: 'nfld' }, h('span', {}, label),
      h('input', { class: 'inp', type: 'number', value: value ?? '', step: o.step || 1, min: o.min, max: o.max, 'data-geom': o.geom,
        oninput: (e) => { if (e.target.value !== '') set(+e.target.value); } }));
  }
  function color(label, value, set, allowNone) {
    const hex = isHex(value) ? value : (isHex(toHex(value)) ? toHex(value) : '#ffffff');
    const none = !value || value === 'transparent';
    return h('div', { class: 'cfld' }, h('span', {}, label),
      h('div', { class: 'cfld-row' },
        h('label', { class: `cswatch${none ? ' none' : ''}`, style: { background: none ? '' : value } },
          h('input', { type: 'color', value: hex, oninput: (e) => set(e.target.value), onchange: () => render() })),
        h('input', { class: 'inp mono', value: none ? 'none' : value, onchange: (e) => { set(e.target.value === 'none' ? '' : e.target.value); render(); } }),
        allowNone && h('button', { class: 'icon-btn sm', type: 'button', title: 'No color', onclick: () => { set(''); render(); }, html: '∅' })));
  }
  function sel(label, value, options, set) {
    return h('label', { class: 'nfld wide' }, h('span', {}, label),
      h('select', { class: 'inp', onchange: (e) => set(e.target.value) }, options.map(([v, l, st]) => h('option', { value: v, selected: String(value) === String(v), style: st }, l))));
  }
  function toggles(items) {
    return h('div', { class: 'tbar' }, items.map((it) => h('button', {
      type: 'button', class: `tbtn${it.active ? ' active' : ''}`, title: it.title, html: it.html, onmousedown: keep, onclick: it.onclick,
    })));
  }
  const slider = (label, value, min, max, step, set, fmt = (v) => v) => {
    const out = h('span', { class: 'range-val' }, fmt(value));
    return h('div', { class: 'fld full' }, h('span', { class: 'fld-label' }, label, out),
      h('input', { type: 'range', class: 'range', min, max, step, value, oninput: (e) => { set(+e.target.value); out.textContent = fmt(+e.target.value); } }));
  };

  function pagePanel() {
    const i = Canvas.curPage;
    const p = App.state.canvas.pages[i];
    if (!p) return h('div');
    const o = Canvas.opts;
    const tog = (key, label) => h('label', { class: 'switch-row' },
      h('input', { type: 'checkbox', checked: o[key], onchange: (e) => { o[key] = e.target.checked; if (key === 'grid') Canvas.render(); } }), h('span', { class: 'switch' }), label);
    return h('div', {},
      h('div', { class: 'props-head' }, h('div', { class: 'card-ico', html: icon('file') }), h('div', { class: 'card-title' }, h('b', {}, `Page ${i + 1}`), h('small', {}, 'A4 · 210 × 297 mm'))),
      group('Page', color('Background', p.bg, (v) => { p.bg = v || '#ffffff'; $(`.cpage[data-page="${i}"]`).style.background = p.bg; App.changed('canvas'); }),
        h('div', { class: 'btn-row' },
          h('button', { class: 'btn sm', type: 'button', onclick: () => Canvas.addPage(i), html: `${icon('plus')}<span>Add page</span>` }),
          h('button', { class: 'btn sm', type: 'button', onclick: () => Canvas.dupPage(i), html: `${icon('copy')}<span>Duplicate</span>` }),
          h('button', { class: 'btn sm danger', type: 'button', onclick: () => Canvas.delPage(i), html: `${icon('trash')}` }))),
      group('Canvas', tog('snap', 'Snap to 5px grid'), tog('guides', 'Smart alignment guides'), tog('grid', 'Show grid')),
      group('Shortcuts', h('div', { class: 'kbd-list', html: [
        ['Double-click', 'Edit text / replace image'], ['Del', 'Delete element'], ['Arrows', 'Nudge (Shift ×10)'], ['Ctrl D', 'Duplicate'],
        ['Ctrl C / V', 'Copy / paste'], ['Ctrl ] / [', 'Forward / backward'], ['Shift + drag', 'Keep aspect ratio'], ['Alt + drag', 'Move freely'], ['Ctrl Z / Y', 'Undo / redo'],
      ].map(([k, v]) => `<div><kbd>${k}</kbd><span>${v}</span></div>`).join('') })),
      h('p', { class: 'hint' }, 'Select an element to style it. Drag an element onto another page to move it there.'));
  }

  function elementPanel(f) {
    const e = f.el;
    const s = e.style;
    const up = (fn) => Canvas.update(e, fn);
    const setS = (k) => (v) => up(() => { s[k] = v; });
    const typeName = { text: 'Text', image: 'Image', shape: e.shape === 'circle' ? 'Circle' : 'Rectangle', line: 'Line', bar: 'Skill bar' }[e.type];
    const editingThis = Canvas.editing === e.id;
    const out = [];

    out.push(h('div', { class: 'props-head' },
      h('div', { class: 'card-ico', html: icon({ text: 'type', image: 'image', shape: 'square', line: 'line', bar: 'bar' }[e.type]) }),
      h('div', { class: 'card-title' }, h('b', {}, typeName), h('small', {}, editingThis ? 'Editing text — select words to style them' : e.type === 'text' ? 'Double-click to edit text' : `Page ${f.pi + 1}`))),
    toggles([
      { html: icon('copy'), title: 'Duplicate (Ctrl+D)', onclick: () => Canvas.duplicate() },
      { html: icon('front'), title: 'Bring to front', onclick: () => Canvas.layer('front') },
      { html: icon('back'), title: 'Send to back', onclick: () => Canvas.layer('back') },
      { html: icon(e.locked ? 'lock' : 'unlock'), title: e.locked ? 'Unlock' : 'Lock position', active: e.locked, onclick: () => { up(() => { e.locked = !e.locked; }); render(); } },
      { html: icon('trash'), title: 'Delete (Del)', onclick: () => Canvas.remove() },
    ]));

    out.push(group('Position & size', h('div', { class: 'grid4' },
      num('X', e.x, (v) => up(() => { e.x = v; }), { geom: 'x' }),
      num('Y', e.y, (v) => up(() => { e.y = v; }), { geom: 'y' }),
      num('W', e.w, (v) => up(() => { e.w = Math.max(5, v); }), { geom: 'w', min: 5 }),
      num('H', e.h, (v) => up(() => { e.h = Math.max(1, v); }), { geom: 'h', min: 1 })),
    h('div', { class: 'grid2' },
      num('Rotate°', e.rot || 0, (v) => up(() => { e.rot = v; }), { min: -180, max: 180 }),
      num('Opacity %', Math.round((s.opacity ?? 1) * 100), (v) => up(() => { s.opacity = Math.max(0, Math.min(100, v)) / 100; }), { min: 0, max: 100, step: 5 }))));

    if (e.type === 'text' || e.type === 'bar') {
      const sz = s.fontSize || 12;
      const curFont = fontName(s.fontFamily) || 'Inter';
      const fonts = FONTS.map(([fn]) => [fn, fn, { fontFamily: fontStack(fn) }]);
      if (!FONTS.some(([fn]) => fn === curFont)) fonts.unshift([curFont, curFont]);
      const inline = (cmd, val, whole) => () => (Canvas.hasTextSel() ? Canvas.exec(cmd, val) : whole());
      out.push(group('Text',
        sel('Font', curFont, fonts, (v) => (Canvas.hasTextSel() ? Canvas.exec('fontName', fontStack(v)) : up(() => { s.fontFamily = v; }))),
        h('div', { class: 'grid2' },
          num('Size px', sz, (v) => (Canvas.hasTextSel() ? Canvas.execFontSize(v) : up(() => { s.fontSize = Math.max(4, v); })), { min: 4, step: 0.5 }),
          sel('Weight', s.fontWeight || 400, [[300, 'Light'], [400, 'Regular'], [500, 'Medium'], [600, 'Semibold'], [700, 'Bold'], [800, 'Extra bold'], [900, 'Black']], (v) => up(() => { s.fontWeight = v; }))),
        toggles([
          { html: '<b>B</b>', title: 'Bold', active: +s.fontWeight >= 600, onclick: inline('bold', null, () => { up(() => { s.fontWeight = +s.fontWeight >= 600 ? 400 : 700; }); render(); }) },
          { html: '<i>I</i>', title: 'Italic', active: s.fontStyle === 'italic', onclick: inline('italic', null, () => { up(() => { s.fontStyle = s.fontStyle === 'italic' ? 'normal' : 'italic'; }); render(); }) },
          { html: '<u>U</u>', title: 'Underline', active: s.textDecoration === 'underline', onclick: inline('underline', null, () => { up(() => { s.textDecoration = s.textDecoration === 'underline' ? '' : 'underline'; }); render(); }) },
          { html: '<s>S</s>', title: 'Strikethrough', active: s.textDecoration === 'line-through', onclick: inline('strikeThrough', null, () => { up(() => { s.textDecoration = s.textDecoration === 'line-through' ? '' : 'line-through'; }); render(); }) },
          { html: 'Aa', title: 'Uppercase', active: s.textTransform === 'uppercase', onclick: () => { up(() => { s.textTransform = s.textTransform === 'uppercase' ? 'none' : 'uppercase'; }); render(); } },
        ]),
        e.type === 'text' && toggles([
          ['left', 'alignLeft'], ['center', 'alignCenter'], ['right', 'alignRight'], ['justify', 'alignJustify'],
        ].map(([a, ic]) => ({ html: icon(ic), title: `Align ${a}`, active: (s.textAlign || 'left') === a, onclick: () => { up(() => { s.textAlign = a; }); render(); } }))
          .concat([
            { html: icon('list'), title: 'Bullet list (while editing)', onclick: () => (Canvas.editing ? Canvas.exec('insertUnorderedList') : toast('Double-click the text to edit first')) },
            { html: icon('olist'), title: 'Numbered list (while editing)', onclick: () => (Canvas.editing ? Canvas.exec('insertOrderedList') : toast('Double-click the text to edit first')) },
            { html: icon('eraser'), title: 'Clear formatting of selection', onclick: () => (Canvas.hasTextSel() ? Canvas.exec('removeFormat') : toast('Select some text while editing')) },
          ])),
        color('Text color', s.color || '#000000', (v) => (Canvas.hasTextSel() ? Canvas.exec('foreColor', v) : up(() => { s.color = v; }))),
        Canvas.editing === e.id && color('Highlight selection', '#fff59d', (v) => Canvas.hasTextSel() && Canvas.exec('hiliteColor', v)),
        h('div', { class: 'grid2' },
          num('Line height', typeof s.lineHeight === 'number' ? s.lineHeight : 1.4, (v) => up(() => { s.lineHeight = v; }), { step: 0.05, min: 0.6 }),
          num('Spacing px', s.letterSpacing || 0, (v) => up(() => { s.letterSpacing = v; }), { step: 0.1 }))));
    }

    if (e.type === 'bar') {
      out.push(group('Skill bar',
        h('label', { class: 'nfld wide' }, h('span', {}, 'Label'), h('input', { class: 'inp', value: e.label, oninput: (ev) => up(() => { e.label = ev.target.value; }) })),
        slider('Level', e.level, 0, 100, 5, (v) => up(() => { e.level = v; }), (v) => `${v}%`),
        color('Bar color', e.color, (v) => up(() => { e.color = v; })),
        color('Track color', e.track, (v) => up(() => { e.track = v; })),
        h('div', { class: 'grid2' }, num('Bar height', e.barH || 6, (v) => up(() => { e.barH = v; }), { min: 1 }),
          h('label', { class: 'switch-row' }, h('input', { type: 'checkbox', checked: e.showPct, onchange: (ev) => up(() => { e.showPct = ev.target.checked; }) }), h('span', { class: 'switch' }), 'Show %'))));
    }

    if (e.type === 'image') {
      out.push(group('Image',
        h('div', { class: 'btn-row' },
          h('button', { class: 'btn sm', type: 'button', onclick: () => Canvas.replaceImage(e), html: `${icon('upload')}<span>${e.src ? 'Replace' : 'Upload'} image</span>` }),
          e.src && h('button', { class: 'btn sm ghost', type: 'button', onclick: () => { up(() => { e.src = ''; }); render(); } }, 'Remove')),
        sel('Fit', e.fit || 'cover', [['cover', 'Fill (crop)'], ['contain', 'Fit inside'], ['fill', 'Stretch']], (v) => up(() => { e.fit = v; })),
        toggles([
          { html: 'Square', title: 'Square corners', onclick: () => { up(() => { s.radius = 0; }); render(); } },
          { html: 'Rounded', title: 'Rounded corners', onclick: () => { up(() => { s.radius = 14; }); render(); } },
          { html: 'Circle', title: 'Circle', onclick: () => { up(() => { s.radius = 999; e.h = e.w; }); render(); } },
        ])));
    }

    if (e.type === 'shape') {
      out.push(group('Shape', sel('Type', e.shape, [['rect', 'Rectangle'], ['circle', 'Circle / ellipse']], (v) => { up(() => { e.shape = v; }); render(); })));
    }

    const fillTitle = e.type === 'line' ? 'Line' : 'Fill & border';
    out.push(group(fillTitle,
      color(e.type === 'line' ? 'Color' : 'Background', s.background || '', setS('background'), e.type !== 'line'),
      e.type !== 'line' && h('div', { class: 'grid2' },
        num('Border px', s.borderWidth || 0, (v) => { const was = s.borderWidth > 0; up(() => { s.borderWidth = Math.max(0, v); }); if (was !== s.borderWidth > 0) render(); }, { min: 0 }),
        sel('Sides', s.borderSide || 'all', [['all', 'All'], ['bottom', 'Bottom'], ['top', 'Top'], ['left', 'Left'], ['right', 'Right']], setS('borderSide'))),
      e.type !== 'line' && (s.borderWidth > 0) && h('div', {},
        color('Border color', s.borderColor || '#000000', setS('borderColor')),
        sel('Border style', s.borderStyle || 'solid', [['solid', 'Solid'], ['dashed', 'Dashed'], ['dotted', 'Dotted'], ['double', 'Double']], setS('borderStyle'))),
      h('div', { class: 'grid2' },
        !(e.type === 'shape' && e.shape === 'circle') && num('Radius px', s.radius || 0, (v) => up(() => { s.radius = Math.max(0, v); }), { min: 0 }),
        e.type === 'text' && num('Padding px', s.padding || 0, (v) => up(() => { s.padding = Math.max(0, v); }), { min: 0 })),
      h('label', { class: 'switch-row' }, h('input', { type: 'checkbox', checked: !!s.shadow, onchange: (ev) => up(() => { s.shadow = ev.target.checked; }) }), h('span', { class: 'switch' }), 'Drop shadow')));

    return h('div', {}, out);
  }

  function render() {
    const panel = P();
    if (!panel) return;
    const top = panel.scrollTop;
    panel.innerHTML = '';
    const f = Canvas.sel && Canvas.find(Canvas.sel);
    panel.appendChild(f ? elementPanel(f) : pagePanel());
    panel.scrollTop = top;
  }
  function syncGeom(e) {
    ['x', 'y', 'w', 'h'].forEach((k) => {
      const i = P().querySelector(`[data-geom="${k}"]`);
      if (i && document.activeElement !== i) i.value = e[k];
    });
  }
  return { render, syncGeom };
})();
