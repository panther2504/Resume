/* Resume Studio — Tech templates (category id: 'tech')
   For engineers and data roles: monospace accents, dark sidebars, compact density.

   HOW TO ADD A TEMPLATE (pure configuration — the full schema and every knob value are documented at the top of js/data.js):
     registerTemplates([
       { id: 'tech-example', name: 'Example', category: 'tech', desc: 'Up to four words',
         tags: ['serif'], layout: 'single' | 'left' | 'right', header: 'top' | 'side',
         accent: '#1d4ed8', accent2: '#0f172a', fontHead: 'Montserrat', fontBody: 'Lato', skillStyle: 'bar' | 'dots' | 'tags' | 'text',
         sideW: 32, titlePrefix: '',
         v: { header: 'band', title: 'line-after', entry: 'timeline', side: 'tint', contacts: 'icons', photo: 'circle',
              density: 'normal', bullets: 'disc', decor: 'none', nameCase: 'normal', chips: 'soft', role: 'accent',
              nameScale: 1, nameWeight: 700, titleScale: 1, photoSize: 28 },
         vars: { '--side-bg': '#0f172a' } },
     ]);
   Rules: unique ids (prefix them with the category), fonts from FONTS, colors as #rrggbb, desc max 4 words.
   Optional CSS goes in css/templates/tech.css, scoped to .tpl-<id>. Check your work with
   /tmp/rs-tools/contact-sheet.js <repo> out.png tech [--long] (see /tmp/rs-tools/README.md). */

registerTemplates([
  /* Reference template — accent bar header, dark sidebar with accent titles, numbered titles, compact entries */
  { id: 'tech-terminal', name: 'Terminal', category: 'tech', desc: 'Numbered, dark sidebar', tags: ['monospace', 'dark-sidebar', 'compact'],
    layout: 'left', header: 'top', accent: '#0891b2', fontHead: 'Roboto Mono', fontBody: 'Roboto', skillStyle: 'tags', sideW: 31,
    v: { header: 'leftbar', side: 'dark-accent-titles', title: 'numbered', entry: 'compact', contacts: 'text-labels', photo: 'rounded', density: 'compact', bullets: 'arrow', chips: 'outline', titleScale: 0.95 } },
]);
