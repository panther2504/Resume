/* Resume Studio — dependency-free exports: PDF file (rendered pages + searchable text layer), PNG images, Excel (.xlsx) and plain text */

const Exporter = (() => {
  const enc = new TextEncoder();
  const fileBase = () => (App.state.data.personal.name || 'Resume').trim().replace(/[^\w-]+/g, '_') || 'Resume';

  function saveBlob(blob, name) {
    const a = h('a', { href: URL.createObjectURL(blob), download: name });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }

  /* ================= ZIP (store only) — used for .xlsx and multi-page PNG ================= */
  const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
    return t;
  })();
  function crc32(bytes) {
    let c = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }
  function zip(files) {
    const parts = [], central = [];
    let offset = 0;
    const u16 = (v) => [v & 0xff, (v >>> 8) & 0xff];
    const u32 = (v) => [v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff];
    files.forEach(({ name, data }) => {
      const nameB = enc.encode(name);
      const body = typeof data === 'string' ? enc.encode(data) : data;
      const crc = crc32(body);
      const common = [...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(crc), ...u32(body.length), ...u32(body.length), ...u16(nameB.length), ...u16(0)];
      const local = new Uint8Array([...u32(0x04034b50), ...common]);
      parts.push(local, nameB, body);
      central.push(new Uint8Array([...u32(0x02014b50), ...u16(20), ...common, ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(offset)]), nameB);
      offset += local.length + nameB.length + body.length;
    });
    const cdSize = central.reduce((s, p) => s + p.length, 0);
    const end = new Uint8Array([...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(files.length), ...u16(files.length), ...u32(cdSize), ...u32(offset), ...u16(0)]);
    return new Blob([...parts, ...central, end], { type: 'application/zip' });
  }

  /* ================= Excel (.xlsx) ================= */
  const xmlEsc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '');
  const plain = (s) => String(s || '').split('\n').map((l) => l.trim().replace(/^[-*•]\s+/, '• ').replace(/\*\*(.+?)\*\*/g, '$1').replace(/(^|[^*])\*([^*]+?)\*/g, '$1$2')).filter(Boolean).join('\n');
  const colName = (i) => { let s = ''; i++; while (i) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };
  // style ids (see stylesXml): 0 normal, 1 title, 2 subtitle, 3 header, 4 wrap, 5 label, 6 section heading, 7 stars, 8 centered
  function stylesXml(accent) {
    const argb = 'FF' + accent.replace('#', '').toUpperCase();
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="7">
<font><sz val="11"/><color rgb="FF1F2937"/><name val="Calibri"/><family val="2"/></font>
<font><b/><sz val="20"/><color rgb="${argb}"/><name val="Calibri"/><family val="2"/></font>
<font><sz val="13"/><color rgb="FF4B5563"/><name val="Calibri"/><family val="2"/></font>
<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/><family val="2"/></font>
<font><b/><sz val="11"/><color rgb="FF374151"/><name val="Calibri"/><family val="2"/></font>
<font><b/><sz val="13"/><color rgb="${argb}"/><name val="Calibri"/><family val="2"/></font>
<font><sz val="12"/><color rgb="${argb}"/><name val="Calibri"/><family val="2"/></font>
</fonts>
<fills count="4"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>
<fill><patternFill patternType="solid"><fgColor rgb="${argb}"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFF3F4F6"/><bgColor indexed="64"/></patternFill></fill></fills>
<borders count="3"><border><left/><right/><top/><bottom/><diagonal/></border>
<border><left/><right/><top/><bottom style="thin"><color rgb="FFE5E7EB"/></bottom><diagonal/></border>
<border><left/><right/><top/><bottom style="medium"><color rgb="${argb}"/></bottom><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="9">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top"/></xf>
<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>
<xf numFmtId="0" fontId="3" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center"/></xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
<xf numFmtId="0" fontId="4" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top"/></xf>
<xf numFmtId="0" fontId="5" fillId="0" borderId="2" xfId="0" applyFont="1" applyBorder="1"/>
<xf numFmtId="0" fontId="6" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment vertical="top"/></xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="top"/></xf>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;
  }

  /** rows: array of arrays of {v, s} | string | number | null */
  function sheetXml({ rows, widths, freeze, merges = [], landscape = false }) {
    const rowXml = rows.map((r, ri) => {
      if (!r) return '';
      const cells = r.map((c, ci) => {
        if (c == null || c === '') return '';
        const cell = typeof c === 'object' ? c : { v: c };
        const ref = colName(ci) + (ri + 1);
        const s = cell.s ? ` s="${cell.s}"` : '';
        if (typeof cell.v === 'number') return `<c r="${ref}"${s}><v>${cell.v}</v></c>`;
        if (cell.v === '' || cell.v == null) return `<c r="${ref}"${s}/>`;
        return `<c r="${ref}"${s} t="inlineStr"><is><t xml:space="preserve">${xmlEsc(cell.v)}</t></is></c>`;
      }).join('');
      // Excel does not auto-fit wrapped text on open, so estimate the row height from the text length
      let rh = r.ht;
      if (!rh && widths) {
        const lines = Math.max(1, ...r.map((c, ci) => {
          if (!c || typeof c !== 'object' || c.s !== 4 || typeof c.v !== 'string') return 1;
          const per = Math.max(8, (widths[ci] || 10) * 1.15);
          return c.v.split('\n').reduce((n, l) => n + Math.max(1, Math.ceil(l.length / per)), 0);
        }));
        if (lines > 1) rh = Math.round(lines * 15 + 3);
      }
      const ht = rh ? ` ht="${rh}" customHeight="1"` : '';
      return `<row r="${ri + 1}"${ht}>${cells}</row>`;
    }).join('');
    const pane = freeze ? `<sheetViews><sheetView workbookViewId="0"><pane ySplit="${freeze}" topLeftCell="A${freeze + 1}" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>`
      : '<sheetViews><sheetView workbookViewId="0" showGridLines="0"/></sheetViews>';
    const cols = widths ? `<cols>${widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols>` : '';
    const mg = merges.length ? `<mergeCells count="${merges.length}">${merges.map((m) => `<mergeCell ref="${m}"/>`).join('')}</mergeCells>` : '';
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>${pane}<sheetFormatPr defaultRowHeight="15"/>${cols}<sheetData>${rowXml}</sheetData>${mg}<pageMargins left="0.5" right="0.5" top="0.6" bottom="0.6" header="0.3" footer="0.3"/><pageSetup paperSize="9" orientation="${landscape ? 'landscape' : 'portrait'}" fitToWidth="1" fitToHeight="0"/></worksheet>`;
  }

  const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);
  const visibleItems = (s) => (s.items || []).filter((i) => (i.name ?? i.title ?? '').trim() || (i.description || '').trim() || (i.subtitle || '').trim());

  function buildSheets() {
    const { data } = App.state;
    const p = data.personal;
    const sections = data.sections.filter((s) => s.visible !== false);
    const sheets = [];

    // --- Overview sheet: the whole resume, readable top to bottom ---
    const rows = [];
    const merges = [];
    const full = (v, s, ht) => { const r = [{ v, s }]; if (ht) r.ht = ht; rows.push(r); merges.push(`A${rows.length}:B${rows.length}`); };
    full(p.name || 'Resume', 1, 30);
    if (p.title) full(p.title, 2, 20);
    rows.push(null);
    full('Contact', 6, 20);
    [['Email', p.email], ['Phone', p.phone], ['Location', p.location], ['Website', p.website], ['LinkedIn', p.linkedin],
      ...(p.extra || []).map((f) => [f.label || 'Other', f.value])].forEach(([k, v]) => { if (v && String(v).trim()) rows.push([{ v: k, s: 5 }, { v, s: 4 }]); });
    sections.forEach((s) => {
      const items = visibleItems(s);
      if (s.type === 'text' ? !(s.content || '').trim() : !items.length) return;
      rows.push(null);
      full(s.title, 6, 20);
      if (s.type === 'text') { rows.push(['', { v: plain(s.content), s: 4 }]); return; }
      if (s.type === 'skills') { items.forEach((i) => rows.push([{ v: i.name, s: 5 }, { v: `${stars(+i.level || 0)}  (${+i.level || 0}/5)`, s: 7 }])); return; }
      if (s.type === 'tags') { rows.push(['', { v: items.map((i) => i.name).join(' • '), s: 4 }]); return; }
      items.forEach((i) => {
        const head = [i.title, [i.subtitle, i.location].filter(Boolean).join(', ')].filter(Boolean).join(' — ');
        const extra = (i.fields || []).filter((f) => f.value).map((f) => `${f.label ? f.label + ': ' : ''}${f.value}`);
        rows.push([{ v: i.date || '', s: 5 }, { v: [head, plain(i.description), ...extra].filter(Boolean).join('\n'), s: 4 }]);
      });
    });
    sheets.push({ name: 'Resume', rows, merges, widths: [20, 80] });

    // --- One table sheet per section ---
    sections.forEach((s) => {
      const items = visibleItems(s);
      if (s.type === 'text' || !items.length) return;
      let header, body, widths;
      if (s.type === 'entries') {
        const L = s.labels || { title: 'Title', subtitle: 'Subtitle' };
        const extraLabels = [...new Set(items.flatMap((i) => (i.fields || []).filter((f) => f.value).map((f) => f.label || 'Other')))];
        header = [L.title, L.subtitle, 'Location', 'Date / period', 'Description', ...extraLabels];
        body = items.map((i) => [i.title, i.subtitle, i.location, i.date, plain(i.description),
          ...extraLabels.map((l) => (i.fields || []).filter((f) => (f.label || 'Other') === l).map((f) => f.value).join(', '))]);
        widths = [30, 28, 20, 20, 70, ...extraLabels.map(() => 22)];
      } else if (s.type === 'skills') {
        header = ['Name', 'Level (0-5)', 'Rating'];
        body = items.map((i) => [i.name, { v: +i.level || 0, s: 8 }, { v: stars(+i.level || 0), s: 7 }]);
        widths = [34, 14, 16];
      } else {
        header = ['Item'];
        body = items.map((i) => [i.name]);
        widths = [40];
      }
      const rowsT = [Object.assign(header.map((v) => ({ v, s: 3 })), { ht: 22 }),
        ...body.map((r) => r.map((c) => (c && typeof c === 'object' ? c : { v: c ?? '', s: 4 })))];
      sheets.push({ name: s.title, rows: rowsT, widths, freeze: 1, landscape: widths.length > 3 });
    });

    // Excel sheet names: max 31 chars, no []:*?/\ and unique
    const used = new Set();
    sheets.forEach((sh) => {
      let base = (sh.name || 'Sheet').replace(/[[\]:*?/\\]/g, ' ').trim().slice(0, 31) || 'Sheet';
      let name = base, n = 2;
      while (used.has(name.toLowerCase())) { const suf = ` (${n++})`; name = base.slice(0, 31 - suf.length) + suf; }
      used.add(name.toLowerCase());
      sh.name = name;
    });
    return sheets;
  }

  function excel() {
    App.flush();
    const sheets = buildSheets();
    const accent = Render.effective(App.state.design).accent;
    const files = [
      { name: '[Content_Types].xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>` },
      { name: '_rels/.rels', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>` },
      { name: 'docProps/core.xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${xmlEsc((App.state.data.personal.name || 'Resume') + ' — Resume')}</dc:title><dc:creator>Resume Studio</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString().replace(/\.\d+Z$/, 'Z')}</dcterms:created></cp:coreProperties>` },
      { name: 'xl/workbook.xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets.map((s, i) => `<sheet name="${xmlEsc(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets></workbook>` },
      { name: 'xl/_rels/workbook.xml.rels', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>` },
      { name: 'xl/styles.xml', data: stylesXml(/^#[0-9a-f]{6}$/i.test(accent) ? accent : '#2b4c7e') },
      ...sheets.map((s, i) => ({ name: `xl/worksheets/sheet${i + 1}.xml`, data: sheetXml(s) })),
    ];
    const blob = new Blob([zip(files)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveBlob(blob, `${fileBase()}_Resume.xlsx`);
    toast(`Excel workbook downloaded (${sheets.length} sheet${sheets.length > 1 ? 's' : ''})`);
    return blob;
  }

  /* ================= PDF ================= */
  const SKIP_PROP = /^(--|transition|animation|will-change|cursor|pointer-events|user-select|-webkit-user-select|caret-color|outline|view-transition|-webkit-user-drag)/;

  /** Clone a node with every computed style inlined, so it renders identically inside an SVG image. */
  function inlineClone(src) {
    if (src.nodeType === 3) return document.createTextNode(src.textContent);
    if (src.nodeType !== 1) return null;
    if (src.matches('.guides, .hdl, .empty-hint')) return null;
    const cs = getComputedStyle(src);
    if (cs.display === 'none') return null;
    const isSvg = src instanceof SVGElement;
    const c = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', src.tagName) : document.createElement(src.tagName);
    [...src.attributes].forEach((a) => { if (a.name !== 'style' && a.name !== 'class' && a.name !== 'contenteditable') c.setAttribute(a.name, a.value); });
    let css = '';
    for (let i = 0; i < cs.length; i++) {
      const prop = cs[i];
      if (SKIP_PROP.test(prop)) continue;
      css += `${prop}:${cs.getPropertyValue(prop)};`;
    }
    c.setAttribute('style', css);
    src.childNodes.forEach((n) => { const k = inlineClone(n); if (k) c.appendChild(k); });
    return c;
  }

  /* --- embed the Google web fonts actually used, so the SVG renders with the right typefaces --- */
  const fontCache = new Map();
  const toDataURL = (blob) => new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(blob); });
  let googleCss = null;
  async function fontFaceCss(families) {
    const link = document.querySelector('link[href*="fonts.googleapis.com/css"]');
    if (!link || !families.size) return '';
    try {
      if (googleCss == null) googleCss = await (await fetch(link.href)).text();
    } catch { googleCss = ''; return ''; }
    const blocks = googleCss.match(/@font-face\s*{[^}]*}/g) || [];
    const out = [];
    await Promise.all(blocks.map(async (b) => {
      const fam = (b.match(/font-family:\s*['"]?([^;'"]+)/) || [])[1];
      if (!fam || !families.has(fam.toLowerCase())) return;
      const range = (b.match(/unicode-range:\s*([^;]+)/) || [])[1] || '';
      if (range && !/U\+0000-00FF/i.test(range)) return; // latin subset is enough for resumes
      const url = (b.match(/url\(([^)]+)\)/) || [])[1];
      if (!url) return;
      try {
        if (!fontCache.has(url)) fontCache.set(url, toDataURL(await (await fetch(url.replace(/['"]/g, ''))).blob()));
        out.push(b.replace(/url\([^)]+\)/, `url(${await fontCache.get(url)})`));
      } catch { /* font unavailable: the browser falls back to a similar font */ }
    }));
    return out.join('\n');
  }

  function loadImage(src) {
    return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('render failed')); i.src = src; });
  }

  /** Draw one laid-out page into a white canvas (scale = device px per CSS px). */
  async function rasterize(page, scale) {
    const W = Math.round(PAGE_W), H = Math.round(PAGE_H);
    const node = inlineClone(page);
    node.style.transform = 'none';
    node.style.margin = '0';
    const families = new Set();
    [node, ...node.querySelectorAll('*')].forEach((n) => { const f = n.style && fontName(n.style.fontFamily); if (f) families.add(f.toLowerCase()); });
    const fonts = await fontFaceCss(families);
    const xhtml = new XMLSerializer().serializeToString(node);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><style>${fonts}</style><foreignObject x="0" y="0" width="100%" height="100%">${xhtml}</foreignObject></svg>`;
    const img = await loadImage('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg));
    await new Promise((r) => setTimeout(r, 30)); // let embedded fonts settle
    const cv = document.createElement('canvas');
    cv.width = Math.round(W * scale); cv.height = Math.round(H * scale);
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.drawImage(img, 0, 0, cv.width, cv.height);
    return cv;
  }
  function jpegBytes(cv) {
    const jpeg = cv.toDataURL('image/jpeg', 0.92);
    const bin = atob(jpeg.split(',')[1]);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return { bytes, w: cv.width, h: cv.height };
  }

  /* --- invisible text layer (word positions) so the PDF stays selectable & searchable for ATS --- */
  const WIN = { '€': 128, '‚': 130, 'ƒ': 131, '„': 132, '…': 133, '†': 134, '‡': 135, 'ˆ': 136, '‰': 137, 'Š': 138, '‹': 139, 'Œ': 140, 'Ž': 142, '‘': 145, '’': 146, '“': 147, '”': 148, '•': 149, '–': 150, '—': 151, '˜': 152, '™': 153, 'š': 154, '›': 155, 'œ': 156, 'ž': 158, 'Ÿ': 159 };
  function pdfStr(s) {
    let out = '';
    for (const ch of s) {
      let code = ch.charCodeAt(0);
      if (WIN[ch]) code = WIN[ch];
      else if (ch.length > 1 || code > 255 || (code > 126 && code < 160)) code = 63; // '?'
      if (code === 40 || code === 41 || code === 92) out += '\\' + ch;
      else if (code < 32 || code > 126) out += '\\' + code.toString(8).padStart(3, '0');
      else out += ch;
    }
    return out;
  }
  function textLayer(page) {
    const pr = page.getBoundingClientRect();
    const k = 595.28 / pr.width; // css px -> pt
    const ops = [];
    const walker = document.createTreeWalker(page, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    for (let t = walker.nextNode(); t; t = walker.nextNode()) {
      const el = t.parentElement;
      if (!el || el.closest('.guides, .hdl, .empty-hint')) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      const upper = cs.textTransform === 'uppercase';
      for (const m of t.textContent.matchAll(/\S+/g)) {
        range.setStart(t, m.index); range.setEnd(t, m.index + m[0].length);
        const r = range.getClientRects()[0];
        if (!r || r.width < 0.5) continue;
        const x = (r.left - pr.left) * k, w = r.width * k, hgt = r.height * k;
        if (x < 0 || x > 596 || r.top < pr.top || r.bottom > pr.bottom + 2) continue;
        const word = upper ? m[0].toUpperCase() : m[0];
        const fs = Math.max(1, hgt * 0.78);
        const tz = Math.max(10, Math.min(400, (100 * w) / (word.length * fs * 0.5)));
        const y = 841.89 - (r.top - pr.top) * k - hgt * 0.8;
        ops.push(`/F1 ${fs.toFixed(2)} Tf ${tz.toFixed(1)} Tz 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm (${pdfStr(word + ' ')}) Tj`);
      }
    }
    return ops.length ? `BT 3 Tr\n${ops.join('\n')}\nET` : '';
  }

  /** Minimal PDF writer: one JPEG per A4 page + invisible Helvetica text layer. */
  function buildPdf(pages, title) {
    const chunks = [];
    let len = 0;
    const offsets = [];
    const push = (x) => { const b = typeof x === 'string' ? enc.encode(x) : x; chunks.push(b); len += b.length; };
    const obj = (n, body, stream) => {
      offsets[n] = len;
      push(`${n} 0 obj\n${body}\n`);
      if (stream) { push('stream\n'); push(stream); push('\nendstream\n'); }
      push('endobj\n');
    };
    push('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
    const N = pages.length;
    const pageIds = pages.map((_, i) => 5 + i * 3);
    obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
    obj(2, `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${N} >>`);
    obj(3, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
    obj(4, `<< /Title (${pdfStr(title)}) /Producer (Resume Studio) /Creator (Resume Studio) >>`);
    pages.forEach((p, i) => {
      const id = pageIds[i];
      const content = enc.encode(`q 595.28 0 0 841.89 0 0 cm /Im${i} Do Q\n${p.text}`);
      obj(id, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im${i} ${id + 2} 0 R >> /Font << /F1 3 0 R >> >> /Contents ${id + 1} 0 R >>`);
      obj(id + 1, `<< /Length ${content.length} >>`, content);
      obj(id + 2, `<< /Type /XObject /Subtype /Image /Width ${p.img.w} /Height ${p.img.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.img.bytes.length} >>`, p.img.bytes);
    });
    const total = 5 + N * 3;
    const xref = len;
    let x = `xref\n0 ${total}\n0000000000 65535 f \n`;
    for (let n = 1; n < total; n++) x += `${String(offsets[n] || 0).padStart(10, '0')} 00000 n \n`;
    push(`${x}trailer\n<< /Size ${total} /Root 1 0 R /Info 4 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
    return new Blob(chunks, { type: 'application/pdf' });
  }

  /* ================= page rendering (shared by PDF and PNG) ================= */
  let busy = false;

  /** Lay out the active mode's pages at 100% in the off-screen host; returns the .page elements. */
  function preparePages() {
    const host = $('#exportHost');
    host.innerHTML = '';
    if (App.state.mode === 'canvas') {
      Canvas.deselect();
      $$('#cvPages .page').forEach((pg) => {
        const c = pg.cloneNode(true);
        c.classList.remove('show-grid', 'drop-target', 'dragging');
        $$('.selected, .editing', c).forEach((n) => n.classList.remove('selected', 'editing'));
        host.appendChild(h('div', { class: 'page-wrap' }, c));
      });
    } else {
      Render.render(host, App.state.data, App.state.design);
    }
    return $$('.page', host);
  }

  /**
   * Rasterize every page of the open resume exactly as shown (template or canvas mode).
   *   scale      device px per CSS px: 2 → 1588 × 2246 px per A4 page
   *   onPage(pageEl, index, count, canvas)  optional; runs while the page is still laid out,
   *                                          its (awaited) return value is kept as `extra`
   *   progress(index, count)                optional; called before each page is drawn
   * Resolves to [{ canvas, width, height, extra }].
   */
  async function renderPages(scale = 2, { onPage, progress } = {}) {
    App.flush();
    const pages = preparePages();
    try {
      if (document.fonts) await document.fonts.ready;
      const out = [];
      for (const [i, pg] of pages.entries()) {
        if (progress) progress(i, pages.length);
        const canvas = await rasterize(pg, scale);
        const item = { canvas, width: canvas.width, height: canvas.height };
        if (onPage) item.extra = await onPage(pg, i, pages.length, canvas);
        out.push(item);
      }
      return out;
    } finally {
      $('#exportHost').innerHTML = '';
    }
  }

  /** Disable the button and ignore new requests while an export runs. */
  async function guarded(btn, fn) {
    if (busy) { toast('Please wait — an export is already running'); return null; }
    busy = true;
    if (btn) btn.disabled = true;
    try { return await fn(); } finally { busy = false; if (btn) btn.disabled = false; }
  }

  /* ================= PDF ================= */
  function pdf(btn) {
    return guarded(btn, async () => {
      try {
        const out = await renderPages(2.5, {
          progress: (i, n) => toast(`Creating PDF… page ${i + 1} of ${n}`),
          onPage: (pg, i, n, cv) => { const img = jpegBytes(cv); cv.width = cv.height = 0; return { img, text: textLayer(pg) }; },
        });
        const name = (App.state.data.personal.name || 'Resume').trim();
        const blob = buildPdf(out.map((p) => p.extra), `${name} - Resume`);
        saveBlob(blob, `${fileBase()}_Resume.pdf`);
        toast(`PDF downloaded (${out.length} A4 page${out.length > 1 ? 's' : ''})`);
        return blob;
      } catch (e) {
        console.error(e);
        toast('Could not create the PDF file here — opening the print dialog instead.');
        App.print();
        return null;
      }
    });
  }

  /* ================= PNG (one page → .png, several → .zip of page-N.png) ================= */
  const pngBlob = (cv) => new Promise((res, rej) => cv.toBlob((b) => (b ? res(b) : rej(new Error('PNG encoding failed'))), 'image/png'));
  function png(btn) {
    return guarded(btn, async () => {
      try {
        const out = await renderPages(2, {
          progress: (i, n) => toast(`Creating PNG… page ${i + 1} of ${n}`),
          onPage: async (pg, i, n, cv) => { const b = await pngBlob(cv); cv.width = cv.height = 0; return b; },
        });
        const blobs = out.map((p) => p.extra);
        if (blobs.length === 1) {
          saveBlob(blobs[0], `${fileBase()}_Resume.png`);
          toast(`PNG image downloaded (${out[0].width} × ${out[0].height} px)`);
          return blobs[0];
        }
        const files = await Promise.all(blobs.map(async (b, i) => ({ name: `page-${i + 1}.png`, data: new Uint8Array(await b.arrayBuffer()) })));
        const blob = zip(files);
        saveBlob(blob, `${fileBase()}_Resume_PNG.zip`);
        toast(`${blobs.length} PNG pages downloaded as a .zip`);
        return blob;
      } catch (e) {
        console.error(e);
        toast('Could not create the PNG image in this browser.');
        return null;
      }
    });
  }

  /* ================= plain text (ATS-friendly) ================= */
  const LEVEL_WORDS = ['', 'Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'];
  const flat = (s) => String(s ?? '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/(^|[^*])\*([^*]+?)\*/g, '$1$2').replace(/\s+/g, ' ').trim();
  const textLines = (s) => String(s || '').split('\n').map((l) => l.trim()).filter(Boolean)
    .map((l) => { const m = l.match(/^[-*•]\s+(.*)/); return m ? `- ${flat(m[1])}` : flat(l); });

  /** The resume as plain text: name, title, contact line, then every visible section. */
  function plainText(data = App.state.data, design = App.state.design) {
    const p = data.personal || {};
    const out = [];
    if (flat(p.name)) out.push(flat(p.name));
    if (flat(p.title)) out.push(flat(p.title));
    const contact = [p.email, p.phone, p.location, p.website, p.linkedin, ...(p.extra || []).map((f) => (flat(f.value) ? (f.label ? `${flat(f.label)}: ${flat(f.value)}` : f.value) : ''))]
      .map(flat).filter(Boolean);
    if (contact.length) out.push(contact.join(' | '));
    const listStyle = ['text', 'tags'].includes(Render.effective(design).skillStyle);
    (data.sections || []).filter((s) => s.visible !== false).forEach((s) => {
      const items = visibleItems(s);
      const body = [];
      if (s.type === 'text') body.push(...textLines(s.content));
      else if (s.type === 'tags') { if (items.length) body.push(items.map((i) => flat(i.name)).filter(Boolean).join(', ')); }
      else if (s.type === 'skills') {
        if (listStyle) body.push(items.map((i) => flat(i.name)).filter(Boolean).join(', '));
        else items.forEach((i) => { const lvl = Math.max(0, Math.min(5, +i.level || 0)); if (flat(i.name)) body.push(`- ${flat(i.name)}${lvl ? ` (${LEVEL_WORDS[lvl]})` : ''}`); });
      } else {
        items.forEach((i, n) => {
          if (n) body.push('');
          if (flat(i.title)) body.push(flat(i.title));
          const meta = [i.subtitle, i.location, i.date].map(flat).filter(Boolean);
          if (meta.length) body.push(meta.join(' | '));
          (i.fields || []).forEach((f) => { if (flat(f.value)) body.push(f.label ? `${flat(f.label)}: ${flat(f.value)}` : flat(f.value)); });
          body.push(...textLines(i.description));
        });
      }
      if (!body.some(Boolean)) return;
      out.push('', flat(s.title).toUpperCase() || 'SECTION', ...body);
    });
    return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
  }
  function txt() {
    App.flush();
    const blob = new Blob([plainText()], { type: 'text/plain;charset=utf-8' });
    saveBlob(blob, `${fileBase()}_Resume.txt`);
    toast('Plain-text resume downloaded (.txt)');
    return blob;
  }

  return { excel, pdf, png, txt, plainText, renderPages, zip, buildSheets };
})();
