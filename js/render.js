/* Resume Studio — template renderer with automatic A4 pagination */

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

  function effective(design) {
    const t = tplById(design.template);
    return {
      t,
      accent: design.accent || t.accent,
      fontHead: design.fontHead || t.fontHead,
      fontBody: design.fontBody || t.fontBody,
      skillStyle: !design.skillStyle || design.skillStyle === 'auto' ? t.skillStyle : design.skillStyle,
      sideW: design.sideWidth || t.sideW || 33,
    };
  }

  function contacts(p) {
    const list = [];
    const add = (ic, v) => { if (v && String(v).trim()) list.push({ ic, text: v }); };
    add('mail', p.email); add('phone', p.phone); add('pin', p.location); add('globe', p.website); add('linkedin', p.linkedin);
    (p.extra || []).forEach((f) => { if (f.value && f.value.trim()) list.push({ ic: 'info', text: f.label ? `${f.label}: ${f.value}` : f.value }); });
    return list;
  }

  function photoHTML(p, design) {
    if (!design.showPhoto) return '';
    if (p.photo) return `<div class="photo"><img src="${p.photo}" alt=""></div>`;
    const ini = String(p.name || '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
    return `<div class="photo photo-ini"><span>${esc(ini)}</span></div>`;
  }

  function headerHTML(p, design, side) {
    const c = contacts(p);
    const contactsHTML = c.length ? `<div class="contacts">${c.map((i) => `<div class="ci">${icon(i.ic, 'ci-ico')}<span>${esc(i.text)}</span></div>`).join('')}</div>` : '';
    return `<div class="${side ? 'blk hdr hdr-side' : 'hdr hdr-top'}" data-sec="personal">${photoHTML(p, design)}<div class="hdr-text"><h1 class="name">${esc(p.name)}</h1>${p.title ? `<div class="role">${esc(p.title)}</div>` : ''}</div>${contactsHTML}</div>`;
  }

  function entryHTML(it, sid) {
    const sub = [it.subtitle, it.location].filter((x) => x && x.trim()).map(esc).join('<span class="dot-sep">•</span>');
    const fields = (it.fields || []).filter((f) => f.value && f.value.trim());
    return `<div class="blk entry" data-sec="${sid}"><span class="tl-dot"></span>`
      + `<div class="entry-head"><div class="entry-main">${it.title ? `<div class="entry-title">${esc(it.title)}</div>` : ''}${sub ? `<div class="entry-sub">${sub}</div>` : ''}</div>${it.date ? `<div class="entry-date">${esc(it.date)}</div>` : ''}</div>`
      + `${it.description ? `<div class="entry-desc">${rich(it.description)}</div>` : ''}`
      + `${fields.length ? `<div class="entry-fields">${fields.map((f) => `<span>${f.label ? `<b>${esc(f.label)}:</b> ` : ''}${esc(f.value)}</span>`).join('')}</div>` : ''}</div>`;
  }

  function sectionBlocks(sec, eff) {
    const sid = sec.id;
    const out = [`<div class="blk sec-title" data-sec="${sid}"><h2>${esc((eff.t.titlePrefix || '') + sec.title)}</h2><div class="sec-line"></div></div>`];
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
    const vars = `--accent:${eff.accent};--font-head:${fontStack(eff.fontHead)};--font-body:${fontStack(eff.fontBody)};`
      + `--fs:${(13 * (design.fontScale || 1)).toFixed(2)}px;--lh:${design.lineHeight || 1.45};--pad:${design.margin ?? 12}mm;--gap:${design.gap ?? 16}px;--side-w:${eff.sideW}%`;
    const twoCol = t.layout !== 'single';
    const blocks = { main: [], side: [] };
    if (twoCol && t.header === 'side') blocks.side.push(headerHTML(p, design, true));
    data.sections.filter((s) => s.visible !== false).forEach((s) => {
      blocks[twoCol && s.column === 'side' ? 'side' : 'main'].push(...sectionBlocks(s, eff));
    });

    const pages = [];
    const makePage = () => {
      const i = pages.length;
      const wrap = h('div', { class: 'page-wrap' });
      const pg = h('div', { class: `page rpage tpl-${t.id} layout-${t.layout}${t.sideDark ? ' side-dark' : ''}${i ? ' cont' : ''}` });
      pg.setAttribute('style', vars);
      if (i === 0 && (t.header === 'top' || !twoCol)) pg.appendChild(h('div', { class: 'pg-header', html: headerHTML(p, design, false) }));
      const colsEl = h('div', { class: 'pg-cols' });
      const cols = {};
      (twoCol ? ['side', 'main'] : ['main']).forEach((c) => { cols[c] = colsEl.appendChild(h('div', { class: `col col-${c}` })); });
      pg.appendChild(colsEl);
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
