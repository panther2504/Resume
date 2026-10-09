/* Resume Studio — Executive templates (category id: 'executive')
   Senior leadership presence: strong headers, serif or condensed type, dark accents.

   HOW TO ADD A TEMPLATE (pure configuration — the full schema and every knob value are documented at the top of js/data.js):
     registerTemplates([
       { id: 'executive-example', name: 'Example', category: 'executive', desc: 'Up to four words',
         tags: ['serif'], layout: 'single' | 'left' | 'right', header: 'top' | 'side',
         accent: '#1d4ed8', accent2: '#0f172a', fontHead: 'Montserrat', fontBody: 'Lato', skillStyle: 'bar' | 'dots' | 'tags' | 'text',
         sideW: 32, titlePrefix: '',
         v: { header: 'band', title: 'line-after', entry: 'timeline', side: 'tint', contacts: 'icons', photo: 'circle',
              density: 'normal', bullets: 'disc', decor: 'none', nameCase: 'normal', chips: 'soft', role: 'accent',
              nameScale: 1, nameWeight: 700, titleScale: 1, photoSize: 28 },
         vars: { '--side-bg': '#0f172a' } },
     ]);
   Rules: unique ids (prefix them with the category), fonts from FONTS, colors as #rrggbb, desc max 4 words.
   Optional CSS goes in css/templates/executive.css, scoped to .tpl-<id>. Check your work with
   /tmp/rs-tools/contact-sheet.js <repo> out.png executive [--long] (see /tmp/rs-tools/README.md). */

registerTemplates([
  /* Reference template — dark band with gold accents, overline titles, square photo, bottom stripe */
  { id: 'executive-sterling', name: 'Sterling', category: 'executive', desc: 'Dark band, gold accents', tags: ['serif', 'one-page'],
    layout: 'right', header: 'top', accent: '#a16207', fontHead: 'Playfair Display', fontBody: 'Lato', skillStyle: 'bar', sideW: 30,
    v: { header: 'band-dark', side: 'plain', title: 'overline', entry: 'classic', contacts: 'inline', photo: 'square', bullets: 'square', decor: 'bottom-stripe', nameCase: 'upper', role: 'caps' },
    vars: { '--head-dark': '#1c1917' } },

  /* Sovereign — full-width navy band with centered serif name, gold rule under the band, gold-ruled centered titles */
  { id: 'executive-sovereign', name: 'Sovereign', category: 'executive', desc: 'Navy band, gold rules', tags: ['serif', 'one-page'],
    layout: 'single', header: 'top', accent: '#1b2f4e', accent2: '#b08d3c', fontHead: 'Playfair Display', fontBody: 'Source Sans 3', skillStyle: 'text',
    v: { header: 'band-centered', title: 'ruled-both', entry: 'classic', contacts: 'inline', photo: 'ring', density: 'compact', bullets: 'disc',
         nameCase: 'upper', role: 'caps', nameWeight: 600, nameScale: 1.05, photoSize: 24 } },

  /* Ledger — split header, boxed section bars and a date column that reads like a ledger; brass top stripe */
  { id: 'executive-ledger', name: 'Ledger', category: 'executive', desc: 'Split header, date column', tags: ['serif', 'one-page', 'compact'],
    layout: 'single', header: 'top', accent: '#1f4d3a', accent2: '#a07c2c', fontHead: 'Merriweather', fontBody: 'Lato', skillStyle: 'tags',
    v: { header: 'split', title: 'boxed', entry: 'date-left', contacts: 'icons', photo: 'square', density: 'compact', bullets: 'dash', decor: 'top-stripe',
         chips: 'square', role: 'muted', nameWeight: 700, nameScale: 0.9, titleScale: 0.95, photoSize: 22 } },

  /* Regent — full-height oxblood sidebar carrying the name, gold fills, bar titles and ruled entries */
  { id: 'executive-regent', name: 'Regent', category: 'executive', desc: 'Oxblood sidebar, gold accents', tags: ['serif', 'dark-sidebar', 'one-page'],
    layout: 'left', header: 'side', accent: '#6b1d28', accent2: '#c9a54e', fontHead: 'DM Serif Display', fontBody: 'Open Sans', skillStyle: 'dots', sideW: 36,
    v: { header: 'plain-left', side: 'accent', title: 'bar-left', entry: 'ruled', contacts: 'stacked', photo: 'rounded', bullets: 'square',
         role: 'italic', nameWeight: 400, nameScale: 1.05, photoSize: 26 } },

  /* Bullion — charcoal band, Oswald caps name, gold date bars and hairline titles */
  { id: 'executive-bullion', name: 'Bullion', category: 'executive', desc: 'Charcoal band, gold dates', tags: ['sans', 'one-page'],
    layout: 'single', header: 'top', accent: '#2d3138', accent2: '#b8892d', fontHead: 'Oswald', fontBody: 'Lato', skillStyle: 'tags',
    v: { header: 'band-dark', title: 'line-after', entry: 'date-pill', contacts: 'icons', photo: 'ring', density: 'compact', bullets: 'square',
         chips: 'outline', nameCase: 'upper', role: 'caps', nameWeight: 500, nameScale: 1.15, titleScale: 1.12, photoSize: 26 },
    vars: { '--head-dark': '#1d2025' } },

  /* Treasury — petrol band, light sidebar on the right with a bronze edge, numbered titles and a timeline */
  { id: 'executive-treasury', name: 'Treasury', category: 'executive', desc: 'Petrol band, timeline', tags: ['serif', 'timeline', 'one-page'],
    layout: 'right', header: 'top', accent: '#154a5a', accent2: '#a8793a', fontHead: 'Lora', fontBody: 'Inter', skillStyle: 'bar', sideW: 33,
    v: { header: 'band', side: 'bordered', title: 'numbered', entry: 'timeline', contacts: 'badges', photo: 'circle', bullets: 'disc',
         role: 'accent', nameWeight: 600, nameScale: 1.08, titleScale: 0.95, photoSize: 26 } },

  /* Magnate — deep navy gradient band, open sidebar without background, entries on soft cards */
  { id: 'executive-magnate', name: 'Magnate', category: 'executive', desc: 'Gradient band, cards', tags: ['sans', 'gradient', 'one-page'],
    layout: 'left', header: 'top', accent: '#26415f', accent2: '#0f1a2c', fontHead: 'Raleway', fontBody: 'Source Sans 3', skillStyle: 'bar', sideW: 31,
    v: { header: 'gradient', side: 'none', title: 'underline-short', entry: 'card', contacts: 'pills', photo: 'offset', bullets: 'arrow',
         role: 'caps', nameWeight: 800, nameScale: 1.22, titleScale: 1, photoSize: 25 } },

  /* Argent — silver-tinted header, slate type, quiet divider sidebar on the right, hairline-ruled entries */
  { id: 'executive-argent', name: 'Argent', category: 'executive', desc: 'Silver tint, ruled entries', tags: ['serif', 'one-page'],
    layout: 'right', header: 'top', accent: '#3e4c5e', accent2: '#8d99a6', fontHead: 'EB Garamond', fontBody: 'Work Sans', skillStyle: 'dots', sideW: 34,
    v: { header: 'tinted', side: 'plain', title: 'caps-accent', entry: 'ruled', contacts: 'text-labels', photo: 'circle', bullets: 'dash',
         role: 'muted', nameWeight: 500, nameScale: 1.25, titleScale: 1.08, photoSize: 26 } },

  /* Gilt — gold-boxed header inside a hairline gold page frame, centered titles, one-line entries, espresso ink */
  { id: 'executive-gilt', name: 'Gilt', category: 'executive', desc: 'Gold frame, boxed header', tags: ['serif', 'one-page'],
    layout: 'single', header: 'top', accent: '#4a3622', accent2: '#b8943f', fontHead: 'Playfair Display', fontBody: 'Lato', skillStyle: 'text',
    v: { header: 'boxed', title: 'centered', entry: 'compact', contacts: 'icons', photo: 'circle', density: 'compact', bullets: 'circle', decor: 'frame',
         role: 'italic', nameWeight: 700, nameScale: 1.05, photoSize: 24 } },

  /* Chancellor — aubergine rule under the header, sentence-case serif titles, dates under titles, warm tinted sidebar */
  { id: 'executive-chancellor', name: 'Chancellor', category: 'executive', desc: 'Underlined header, serif titles', tags: ['serif', 'one-page'],
    layout: 'left', header: 'top', accent: '#4b2342', accent2: '#a8873a', fontHead: 'Merriweather', fontBody: 'Roboto', skillStyle: 'tags', sideW: 32,
    v: { header: 'underline', side: 'tint', title: 'plain-bold', entry: 'inline-date', contacts: 'icons', photo: 'rounded', bullets: 'disc',
         chips: 'solid', role: 'caps', nameWeight: 700, nameScale: 1.05, titleScale: 0.95, photoSize: 24 } },

  /* Crest — white header with a gold bar beside the name, midnight sidebar on the right with gold bars, gold edge stripe */
  { id: 'executive-crest', name: 'Crest', category: 'executive', desc: 'Midnight sidebar, gold bar', tags: ['serif', 'dark-sidebar', 'one-page'],
    layout: 'right', header: 'top', accent: '#22406a', accent2: '#c19a48', fontHead: 'Lora', fontBody: 'Lato', skillStyle: 'bar', sideW: 32,
    v: { header: 'leftbar', side: 'dark', title: 'underline-full', entry: 'classic', contacts: 'icons', photo: 'square', bullets: 'disc', decor: 'left-stripe',
         role: 'accent', nameWeight: 700, nameScale: 1.12, photoSize: 25 } },

  /* Bourse — photo on the right of a white header, deep green gradient sidebar, heavy overline titles, dates in a column */
  { id: 'executive-bourse', name: 'Bourse', category: 'executive', desc: 'Green gradient, date column', tags: ['sans', 'gradient', 'dark-sidebar', 'one-page'],
    layout: 'left', header: 'top', accent: '#1e4636', accent2: '#0e2219', fontHead: 'Montserrat', fontBody: 'Open Sans', skillStyle: 'dots', sideW: 34,
    v: { header: 'photo-right', side: 'gradient', title: 'overline', entry: 'date-left', contacts: 'icons', photo: 'circle', bullets: 'disc',
         role: 'caps', nameWeight: 700, nameScale: 1.1, titleScale: 0.95, photoSize: 26 } },

  /* Ingot — charcoal sidebar on the right holding a bronze name block, gold sidebar titles, dotted main titles */
  { id: 'executive-ingot', name: 'Ingot', category: 'executive', desc: 'Bronze block, charcoal column', tags: ['serif', 'dark-sidebar', 'one-page'],
    layout: 'right', header: 'side', accent: '#33393f', accent2: '#ad7d28', fontHead: 'DM Serif Display', fontBody: 'Inter', skillStyle: 'tags', sideW: 34,
    v: { header: 'band', side: 'dark-accent-titles', title: 'dotted', entry: 'inline-date', contacts: 'stacked', photo: 'circle', bullets: 'dash',
         chips: 'outline', role: 'muted', nameWeight: 400, nameScale: 1, photoSize: 26 },
    vars: { '--side-bg': '#25282d' } },
]);
