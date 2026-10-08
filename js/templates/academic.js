/* Resume Studio — Academic templates (category id: 'academic')
   CVs for research and teaching: serif type, numbered or ruled titles, mostly one column.

   HOW TO ADD A TEMPLATE (pure configuration — the full schema and every knob value are documented at the top of js/data.js):
     registerTemplates([
       { id: 'academic-example', name: 'Example', category: 'academic', desc: 'Up to four words',
         tags: ['serif'], layout: 'single' | 'left' | 'right', header: 'top' | 'side',
         accent: '#1d4ed8', accent2: '#0f172a', fontHead: 'Montserrat', fontBody: 'Lato', skillStyle: 'bar' | 'dots' | 'tags' | 'text',
         sideW: 32, titlePrefix: '',
         v: { header: 'band', title: 'line-after', entry: 'timeline', side: 'tint', contacts: 'icons', photo: 'circle',
              density: 'normal', bullets: 'disc', decor: 'none', nameCase: 'normal', chips: 'soft', role: 'accent',
              nameScale: 1, nameWeight: 700, titleScale: 1, photoSize: 28 },
         vars: { '--side-bg': '#0f172a' } },
     ]);
   Rules: unique ids (prefix them with the category), fonts from FONTS, colors as #rrggbb, desc max 4 words.
   Optional CSS goes in css/templates/academic.css, scoped to .tpl-<id>. Check your work with
   /tmp/rs-tools/contact-sheet.js <repo> out.png academic [--long] (see /tmp/rs-tools/README.md). */

registerTemplates([
  /* Reference template — centered serif CV, ruled titles, dates in a left column, no photo */
  { id: 'academic-scholar', name: 'Scholar', category: 'academic', desc: 'Classic serif CV', tags: ['serif'],
    layout: 'single', header: 'top', accent: '#7f1d1d', fontHead: 'EB Garamond', fontBody: 'EB Garamond', skillStyle: 'text',
    v: { header: 'centered', title: 'ruled-both', entry: 'date-left', contacts: 'inline', photo: 'none-default', role: 'italic', nameCase: 'upper', nameWeight: 500, titleScale: 1.12 } },
]);
