/* Resume Studio — Elegant templates (category id: 'elegant')
   Refined serif typography: centered headers, ruled titles, muted accents.

   HOW TO ADD A TEMPLATE (pure configuration — the full schema and every knob value are documented at the top of js/data.js):
     registerTemplates([
       { id: 'elegant-example', name: 'Example', category: 'elegant', desc: 'Up to four words',
         tags: ['serif'], layout: 'single' | 'left' | 'right', header: 'top' | 'side',
         accent: '#1d4ed8', accent2: '#0f172a', fontHead: 'Montserrat', fontBody: 'Lato', skillStyle: 'bar' | 'dots' | 'tags' | 'text',
         sideW: 32, titlePrefix: '',
         v: { header: 'band', title: 'line-after', entry: 'timeline', side: 'tint', contacts: 'icons', photo: 'circle',
              density: 'normal', bullets: 'disc', decor: 'none', nameCase: 'normal', chips: 'soft', role: 'accent',
              nameScale: 1, nameWeight: 700, titleScale: 1, photoSize: 28 },
         vars: { '--side-bg': '#0f172a' } },
     ]);
   Rules: unique ids (prefix them with the category), fonts from FONTS, colors as #rrggbb, desc max 4 words.
   Optional CSS goes in css/templates/elegant.css, scoped to .tpl-<id>. Check your work with
   /tmp/rs-tools/contact-sheet.js <repo> out.png elegant [--long] (see /tmp/rs-tools/README.md). */

registerTemplates([
  /* Reference template — centered serif header, inline dates, ringed photo, thin frame */
  { id: 'elegant-verona', name: 'Verona', category: 'elegant', desc: 'Serif, framed page', tags: ['serif'],
    layout: 'left', header: 'top', accent: '#8a5a3c', fontHead: 'Lora', fontBody: 'Lato', skillStyle: 'dots', sideW: 32,
    v: { header: 'centered', side: 'plain', title: 'centered', entry: 'inline-date', contacts: 'inline', photo: 'ring', bullets: 'circle', decor: 'frame', role: 'caps', nameWeight: 500 } },
]);
