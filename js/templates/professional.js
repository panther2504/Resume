/* Resume Studio — Professional templates (category id: 'professional')
   Polished, corporate-ready designs: restrained color, clear hierarchy, safe fonts.

   HOW TO ADD A TEMPLATE (pure configuration — the full schema and every knob value are documented at the top of js/data.js):
     registerTemplates([
       { id: 'professional-example', name: 'Example', category: 'professional', desc: 'Up to four words',
         tags: ['serif'], layout: 'single' | 'left' | 'right', header: 'top' | 'side',
         accent: '#1d4ed8', accent2: '#0f172a', fontHead: 'Montserrat', fontBody: 'Lato', skillStyle: 'bar' | 'dots' | 'tags' | 'text',
         sideW: 32, titlePrefix: '',
         v: { header: 'band', title: 'line-after', entry: 'timeline', side: 'tint', contacts: 'icons', photo: 'circle',
              density: 'normal', bullets: 'disc', decor: 'none', nameCase: 'normal', chips: 'soft', role: 'accent',
              nameScale: 1, nameWeight: 700, titleScale: 1, photoSize: 28 },
         vars: { '--side-bg': '#0f172a' } },
     ]);
   Rules: unique ids (prefix them with the category), fonts from FONTS, colors as #rrggbb, desc max 4 words.
   Optional CSS goes in css/templates/professional.css, scoped to .tpl-<id>. Check your work with
   /tmp/rs-tools/contact-sheet.js <repo> out.png professional [--long] (see /tmp/rs-tools/README.md). */

registerTemplates([
  /* Reference template — split header (contacts in a right column), accent-edged sidebar, top stripe */
  { id: 'professional-harbor', name: 'Harbor', category: 'professional', desc: 'Split header, accent edge', tags: ['sans', 'one-page'],
    layout: 'right', header: 'top', accent: '#1e3a8a', fontHead: 'Source Sans 3', fontBody: 'Source Sans 3', skillStyle: 'dots', sideW: 31,
    v: { header: 'split', side: 'bordered', title: 'underline-full', entry: 'classic', contacts: 'stacked', photo: 'rounded', decor: 'top-stripe', nameWeight: 700, nameScale: 1.05 } },
]);
