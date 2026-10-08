/* Resume Studio — Minimal templates (category id: 'minimal')
   Whitespace-first and understated: light rules, few colors, airy density.

   HOW TO ADD A TEMPLATE (pure configuration — the full schema and every knob value are documented at the top of js/data.js):
     registerTemplates([
       { id: 'minimal-example', name: 'Example', category: 'minimal', desc: 'Up to four words',
         tags: ['serif'], layout: 'single' | 'left' | 'right', header: 'top' | 'side',
         accent: '#1d4ed8', accent2: '#0f172a', fontHead: 'Montserrat', fontBody: 'Lato', skillStyle: 'bar' | 'dots' | 'tags' | 'text',
         sideW: 32, titlePrefix: '',
         v: { header: 'band', title: 'line-after', entry: 'timeline', side: 'tint', contacts: 'icons', photo: 'circle',
              density: 'normal', bullets: 'disc', decor: 'none', nameCase: 'normal', chips: 'soft', role: 'accent',
              nameScale: 1, nameWeight: 700, titleScale: 1, photoSize: 28 },
         vars: { '--side-bg': '#0f172a' } },
     ]);
   Rules: unique ids (prefix them with the category), fonts from FONTS, colors as #rrggbb, desc max 4 words.
   Optional CSS goes in css/templates/minimal.css, scoped to .tpl-<id>. Check your work with
   /tmp/rs-tools/contact-sheet.js <repo> out.png minimal [--long] (see /tmp/rs-tools/README.md). */

registerTemplates([
  /* Reference template — no photo, light name, dates in a left column, airy spacing, dash bullets */
  { id: 'minimal-paper', name: 'Paper', category: 'minimal', desc: 'Airy, dates left', tags: ['sans'],
    layout: 'single', header: 'top', accent: '#475569', fontHead: 'Work Sans', fontBody: 'Work Sans', skillStyle: 'text',
    v: { header: 'plain-left', title: 'caps-accent', entry: 'date-left', contacts: 'inline', photo: 'none-default', density: 'airy', bullets: 'dash', role: 'muted', nameWeight: 300, nameScale: 1.2 } },
]);
