/* Resume Studio — Modern templates (category id: 'modern')
   Fresh layouts with confident color: sidebars, bands, gradients, sans-serif type.

   HOW TO ADD A TEMPLATE (pure configuration — the full schema and every knob value are documented at the top of js/data.js):
     registerTemplates([
       { id: 'modern-example', name: 'Example', category: 'modern', desc: 'Up to four words',
         tags: ['serif'], layout: 'single' | 'left' | 'right', header: 'top' | 'side',
         accent: '#1d4ed8', accent2: '#0f172a', fontHead: 'Montserrat', fontBody: 'Lato', skillStyle: 'bar' | 'dots' | 'tags' | 'text',
         sideW: 32, titlePrefix: '',
         v: { header: 'band', title: 'line-after', entry: 'timeline', side: 'tint', contacts: 'icons', photo: 'circle',
              density: 'normal', bullets: 'disc', decor: 'none', nameCase: 'normal', chips: 'soft', role: 'accent',
              nameScale: 1, nameWeight: 700, titleScale: 1, photoSize: 28 },
         vars: { '--side-bg': '#0f172a' } },
     ]);
   Rules: unique ids (prefix them with the category), fonts from FONTS, colors as #rrggbb, desc max 4 words.
   Optional CSS goes in css/templates/modern.css, scoped to .tpl-<id>. Check your work with
   /tmp/rs-tools/contact-sheet.js <repo> out.png modern [--long] (see /tmp/rs-tools/README.md). */

registerTemplates([
  /* Reference template — side header on a gradient sidebar, timeline entries, icon badges, ringed photo */
  { id: 'modern-nova', name: 'Nova', category: 'modern', desc: 'Gradient sidebar, timeline', tags: ['gradient', 'timeline', 'sans', 'colorful'],
    layout: 'left', header: 'side', accent: '#4338ca', accent2: '#6d28d9', fontHead: 'Poppins', fontBody: 'Inter', skillStyle: 'tags', sideW: 33,
    v: { header: 'centered', side: 'gradient', title: 'line-after', entry: 'timeline', contacts: 'badges', photo: 'ring', chips: 'outline', photoSize: 28 } },
]);
