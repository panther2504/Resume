/* Resume Studio — Creative templates (category id: 'creative')
   Expressive shapes and color: gradients, decorations, pills, bold type pairings.

   HOW TO ADD A TEMPLATE (pure configuration — the full schema and every knob value are documented at the top of js/data.js):
     registerTemplates([
       { id: 'creative-example', name: 'Example', category: 'creative', desc: 'Up to four words',
         tags: ['serif'], layout: 'single' | 'left' | 'right', header: 'top' | 'side',
         accent: '#1d4ed8', accent2: '#0f172a', fontHead: 'Montserrat', fontBody: 'Lato', skillStyle: 'bar' | 'dots' | 'tags' | 'text',
         sideW: 32, titlePrefix: '',
         v: { header: 'band', title: 'line-after', entry: 'timeline', side: 'tint', contacts: 'icons', photo: 'circle',
              density: 'normal', bullets: 'disc', decor: 'none', nameCase: 'normal', chips: 'soft', role: 'accent',
              nameScale: 1, nameWeight: 700, titleScale: 1, photoSize: 28 },
         vars: { '--side-bg': '#0f172a' } },
     ]);
   Rules: unique ids (prefix them with the category), fonts from FONTS, colors as #rrggbb, desc max 4 words.
   Optional CSS goes in css/templates/creative.css, scoped to .tpl-<id>. Check your work with
   /tmp/rs-tools/contact-sheet.js <repo> out.png creative [--long] (see /tmp/rs-tools/README.md). */

registerTemplates([
  /* Reference template — gradient band, pill titles, card entries, hexagon photo, corner decorations */
  { id: 'creative-prism', name: 'Prism', category: 'creative', desc: 'Gradient band, cards', tags: ['gradient', 'colorful', 'sans'],
    layout: 'right', header: 'top', accent: '#be185d', accent2: '#6d28d9', fontHead: 'Montserrat', fontBody: 'Nunito', skillStyle: 'tags', sideW: 32,
    v: { header: 'gradient', title: 'pill', entry: 'card', side: 'tint', contacts: 'pills', photo: 'hexagon', decor: 'corners', chips: 'solid', role: 'caps', bullets: 'arrow' } },
]);
