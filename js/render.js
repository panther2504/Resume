/* Resume Studio — template renderer with automatic A4 pagination and variant knobs
   (see TEMPLATE_KNOBS in js/data.js and css/template-variants.css). */

const Render = (() => {
  /* **bold**, *italic*, and "- " bullet lines */
  const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/(^|[^*])\*([^*\s][^*]*?)\*/g, '$1<i>$2</i>');
  function rich(text) {
    let out = '', list = false;
    for (const raw of String(text || '').split('\n')) {
      const l = raw.trim();
      const m = l.match(/^[-•*]\s+(.*)/);
      if (m) {
        if (!list) { out += '<ul>'; list = true; }
        out += `<li>${inline(m[1])}</li>`;
      } else {
        if (list) { out += '</ul>'; list = false; }
        if (l) out += `<p>${inline(l)}</p>`;
      }
    }
    return list ? out + '</ul>' : out;
  }

  /** Effective look of `design`: template + user choices + variant knobs (template.v merged with design.overrides). */
  function effective(design) {
    const t = tplById(design.template);
    const twoCol = t.layout !== 'single';
    const ov = (design.overrides && typeof design.overrides === 'object') ? design.overrides : {};
    const v = {}, tv = {};
    Object.entries(TEMPLATE_KNOBS).forEach(([k, knob]) => {
      tv[k] = knobValid(k, t.v && t.v[k]) ? t.v[k] : knob.def;
      v[k] = knobValid(k, ov[k]) ? ov[k] : tv[k];
    });
    Object.keys(TEMPLATE_NUM_KNOBS).forEach((k) => { if (t.v && typeof t.v[k] === 'number') v[k] = t.v[k]; });
    return {
      t,
      twoCol,
      v,
      tv,
      accent: design.accent || t.accent,
      accent2: design.accent2 || t.accent2 || null,
      fontHead: design.fontHead || t.fontHead,
      fontBody: design.fontBody || t.fontBody,
      skillStyle: !design.skillStyle || design.skillStyle === 'auto' ? t.skillStyle : design.skillStyle,
      sideW: design.sideWidth || t.sideW || 33,
      sideDark: twoCol && DARK_SIDES.includes(v.side),
    };
  }

  const CONTACT_LABELS = { mail: 'Email', phone: 'Phone', pin: 'Location', globe: 'Website', linkedin: 'LinkedIn' };
  function contacts(p) {
    const list = [];
    const add = (ic, v) => { if (v && String(v).trim()) list.push({ ic, text: v, label: CONTACT_LABELS[ic] }); };
    add('mail', p.email); add('phone', p.phone); add('pin', p.location); add('globe', p.website); add('linkedin', p.linkedin);
    (p.extra || []).forEach((f) => { if (f.value && f.value.trim()) list.push({ ic: 'info', text: f.label ? `${f.label}: ${f.value}` : f.value, label: '' }); });
    return list;
  }

  function photoHTML(p, design, eff) {
    if (!design.showPhoto || eff.v.photo === 'none-default') return '';
    if (p.photo) return `<div class="photo"><img src="${p.photo}" alt=""></div>`;
    const ini = String(p.name || '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
    return `<div class="photo photo-ini"><span>${esc(ini)}</span></div>`;
  }

  /* contacts: hidden .ci-sep separators (cv-inline) and .ci-lbl labels (cv-text-labels) are real elements, never pseudo content */
  function headerHTML(p, design, eff, side) {
    const c = contacts(p);
    const contactsHTML = c.length ? `<div class="contacts">${c.map((i, k) => `${k ? '<span class="ci-sep" aria-hidden="true">•</span>' : ''}<div class="ci">${icon(i.ic, 'ci-ico')}${i.label ? `<b class="ci-lbl">${i.label}:</b>` : ''}<span>${esc(i.text)}</span></div>`).join('')}</div>` : '';
    return `<div class="${side ? 'blk hdr hdr-side' : 'hdr hdr-top'}" data-sec="personal">${photoHTML(p, design, eff)}<div class="hdr-text"><h1 class="name">${esc(p.name)}</h1>${p.title ? `<div class="role">${esc(p.title)}</div>` : ''}</div>${contactsHTML}</div>`;
  }

  function entryHTML(it, sid) {
    const sub = [it.subtitle, it.location].filter((x) => x && x.trim()).map(esc).join('<span class="dot-sep">•</span>');
    const fields = (it.fields || []).filter((f) => f.value && f.value.trim());
    return `<div class="blk entry" data-sec="${sid}"><span class="tl-dot"></span>`
      + `<div class="entry-head"><div class="entry-main">${it.title ? `<div class="entry-title">${esc(it.title)}</div>` : ''}${sub ? `<div class="entry-sub">${sub}</div>` : ''}</div>${it.date ? `<div class="entry-date">${esc(it.date)}</div>` : ''}</div>`
      + `${it.description ? `<div class="entry-desc">${rich(it.description)}</div>` : ''}`
      + `${fields.length ? `<div class="entry-fields">${fields.map((f) => `<span>${f.label ? `<b>${esc(f.label)}:</b> ` : ''}${esc(f.value)}</span>`).join('')}</div>` : ''}</div>`;
  }

  /* section title markup: [rule-l][number] <h2> [sec-line]. .sec-rule-l and .sec-num are display:none unless a title
     variant (ts-ruled-both / ts-numbered) shows them. */
  function titleHTML(sec, eff, num) {
    const n = String(num).padStart(2, '0');
    return `<div class="blk sec-title" data-sec="${sec.id}"><span class="sec-rule sec-rule-l"></span><span class="sec-num">${n}</span><h2>${esc((eff.t.titlePrefix || '') + sec.title)}</h2><div class="sec-line"></div></div>`;
  }

  function sectionBlocks(sec, eff, num) {
    const sid = sec.id;
    const out = [titleHTML(sec, eff, num)];
    const items = (sec.items || []).filter((i) => (i.name ?? i.title ?? '').trim() || (i.description || '').trim() || (i.subtitle || '').trim());
    if (sec.type === 'text') {
      if ((sec.content || '').trim()) out.push(`<div class="blk txt" data-sec="${sid}">${rich(sec.content)}</div>`);
    } else if (sec.type === 'entries') {
      items.forEach((it) => out.push(entryHTML(it, sid)));
    } else if (sec.type === 'skills') {
      const st = eff.skillStyle;
      if (st === 'tags') out.push(`<div class="blk chips" data-sec="${sid}">${items.map((i) => `<span class="chip">${esc(i.name)}</span>`).join('')}</div>`);
      else if (st === 'text') out.push(`<div class="blk skill-text" data-sec="${sid}">${items.map((i) => esc(i.name)).join('<span class="dot-sep">•</span>')}</div>`);
      else items.forEach((i) => {
        const lvl = Math.max(0, Math.min(5, +i.level || 0));
        out.push(st === 'dots'
          ? `<div class="blk skill skill-dots" data-sec="${sid}"><span class="skill-name">${esc(i.name)}</span><span class="dots">${[1, 2, 3, 4, 5].map((n) => `<i class="${n <= lvl ? 'on' : ''}"></i>`).join('')}</span></div>`
          : `<div class="blk skill skill-bar" data-sec="${sid}"><div class="skill-name">${esc(i.name)}</div><div class="bar"><div class="bar-fill" style="width:${lvl * 20}%"></div></div></div>`);
      });
    } else if (sec.type === 'tags') {
      if (eff.skillStyle === 'text') out.push(`<div class="blk skill-text" data-sec="${sid}">${items.map((i) => esc(i.name)).join('<span class="dot-sep">•</span>')}</div>`);
      else out.push(`<div class="blk chips" data-sec="${sid}">${items.map((i) => `<span class="chip">${esc(i.name)}</span>`).join('')}</div>`);
    }
    return out.length > 1 ? out : [];
  }

  /** Classes + inline CSS variables shared by every page of a rendering. */
  function pageLook(eff, design) {
    const { t, v } = eff;
    const cls = [`rpage tpl-${t.id} layout-${t.layout} hd-${eff.twoCol && t.header === 'side' ? 'side' : 'top'}`];
    Object.entries(TEMPLATE_KNOBS).forEach(([k, knob]) => {
      if (knob.twoColOnly && !eff.twoCol) return;
      cls.push(`${knob.cls}-${v[k]}`);
    });
    if (eff.sideDark) cls.push('side-dark');
    const num = (x, d) => (Number.isFinite(+x) ? +x : d);
    let vars = `--accent:${eff.accent};--font-head:${fontStack(eff.fontHead)};--font-body:${fontStack(eff.fontBody)};`
      + `--fs:${(13 * num(design.fontScale, 1)).toFixed(2)}px;--lh-base:${num(design.lineHeight, 1.45)};--pad-base:${num(design.margin, 12)}mm;--gap-base:${num(design.gap, 16)}px;--side-w:${eff.sideW}%;`;
    if (eff.accent2) vars += `--accent-2:${eff.accent2};`;
    Object.entries(TEMPLATE_NUM_KNOBS).forEach(([k, n]) => { if (v[k] != null) vars += `${n.css}:${v[k]}${n.unit || ''};`; });
    Object.entries(t.vars || {}).forEach(([k, val]) => { vars += `${k}:${val};`; });
    return { cls: cls.join(' '), vars, decor: v.decor !== 'none' };
  }

  const overflows = (col) => col.scrollHeight > col.clientHeight + 1;

  /**
   * Render the resume into `container` as A4 pages. Blocks flow column by column;
   * when a block overflows its column it moves to the same column on the next page.
   * A section title never stays orphaned at the bottom of a page.
   */
  function render(container, data, design, opts = {}) {
    const eff = effective(design);
    const t = eff.t;
    const p = data.personal;
    container.innerHTML = '';
    const look = pageLook(eff, design);
    const twoCol = eff.twoCol;
    const blocks = { main: [], side: [] };
    if (twoCol && t.header === 'side') blocks.side.push(headerHTML(p, design, eff, true));
    const counters = { main: 0, side: 0 };
    data.sections.filter((s) => s.visible !== false).forEach((s) => {
      const col = twoCol && s.column === 'side' ? 'side' : 'main';
      const b = sectionBlocks(s, eff, counters[col] + 1);
      if (b.length) { counters[col]++; blocks[col].push(...b); }
    });

    const pages = [];
    const makePage = () => {
      const i = pages.length;
      const wrap = h('div', { class: 'page-wrap' });
      const pg = h('div', { class: `page ${look.cls}${i ? ' cont' : ''}` });
      pg.setAttribute('style', look.vars);
      if (i === 0 && (t.header === 'top' || !twoCol)) pg.appendChild(h('div', { class: 'pg-header', html: headerHTML(p, design, eff, false) }));
      const colsEl = h('div', { class: 'pg-cols' });
      const cols = {};
      // DOM order = visual order (sidebar first for 'left', last for 'right') so canvas, PDF text and screen readers follow it
      (twoCol ? (t.layout === 'right' ? ['main', 'side'] : ['side', 'main']) : ['main']).forEach((c) => { cols[c] = colsEl.appendChild(h('div', { class: `col col-${c}` })); });
      pg.appendChild(colsEl);
      // page decoration: real elements (not pseudo content) positioned inside the margins, outside the column flow
      if (look.decor) pg.appendChild(h('div', { class: 'pg-decor', 'aria-hidden': 'true', html: '<i class="pd-a"></i><i class="pd-b"></i>' }));
      wrap.appendChild(pg);
      container.appendChild(wrap);
      pages.push({ pg, cols });
    };
    const getPage = (i) => { while (pages.length <= i) makePage(); return pages[i]; };
    getPage(0);

    const tmp = document.createElement('template');
    for (const c of twoCol ? ['side', 'main'] : ['main']) {
      let pi = 0;
      for (const html of blocks[c]) {
        tmp.innerHTML = html;
        const node = tmp.content.firstElementChild;
        if (!node) continue;
        let col = getPage(pi).cols[c];
        col.appendChild(node);
        if (overflows(col) && col.childElementCount > 1) {
          node.remove();
          const carry = [];
          const last = col.lastElementChild;
          if (last && last.classList.contains('sec-title') && col.childElementCount > 1) { last.remove(); carry.push(last); }
          pi++;
          if (opts.maxPages && pi >= opts.maxPages) break;
          col = getPage(pi).cols[c];
          carry.forEach((n) => col.appendChild(n));
          col.appendChild(node);
        }
      }
    }
    return pages.length;
  }

  return { render, rich, effective };
})();
