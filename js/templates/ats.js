/* Resume Studio — ATS-friendly templates (category id: 'ats')
   Parser-friendly: single column, no photo (photo: 'none-default'), plain titles, inline or text-label contacts, no decor.

   HOW TO ADD A TEMPLATE (pure configuration — the full schema and every knob value are documented at the top of js/data.js):
     registerTemplates([
       { id: 'ats-example', name: 'Example', category: 'ats', desc: 'Up to four words',
         tags: ['serif'], layout: 'single' | 'left' | 'right', header: 'top' | 'side',
         accent: '#1d4ed8', accent2: '#0f172a', fontHead: 'Montserrat', fontBody: 'Lato', skillStyle: 'bar' | 'dots' | 'tags' | 'text',
         sideW: 32, titlePrefix: '',
         v: { header: 'band', title: 'line-after', entry: 'timeline', side: 'tint', contacts: 'icons', photo: 'circle',
              density: 'normal', bullets: 'disc', decor: 'none', nameCase: 'normal', chips: 'soft', role: 'accent',
              nameScale: 1, nameWeight: 700, titleScale: 1, photoSize: 28 },
         vars: { '--side-bg': '#0f172a' } },
     ]);
   Rules: unique ids (prefix them with the category), fonts from FONTS, colors as #rrggbb, desc max 4 words.
   Optional CSS goes in css/templates/ats.css, scoped to .tpl-<id>. Check your work with
   /tmp/rs-tools/contact-sheet.js <repo> out.png ats [--long] (see /tmp/rs-tools/README.md). */

registerTemplates([
  /* Reference template — parser-friendly: one column, no photo, plain titles, text-labelled contacts, no decoration */
  { id: 'ats-clarity', name: 'Clarity', category: 'ats', desc: 'Plain, parser friendly', tags: ['sans', 'one-page'],
    layout: 'single', header: 'top', accent: '#1f4e79', fontHead: 'Open Sans', fontBody: 'Open Sans', skillStyle: 'text',
    v: { header: 'plain-left', title: 'underline-full', entry: 'classic', contacts: 'text-labels', photo: 'none-default', role: 'muted', bullets: 'disc', density: 'compact', nameScale: 0.9 } },
]);
