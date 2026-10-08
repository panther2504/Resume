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
]);
