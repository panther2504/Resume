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

  /* Orbit — name and photo on a solid emerald sidebar, full-width title rules, dates under the job titles */
  { id: 'modern-orbit', name: 'Orbit', category: 'modern', desc: 'Solid emerald sidebar', tags: ['colorful', 'dark-sidebar', 'sans'],
    layout: 'left', header: 'side', accent: '#047857', fontHead: 'Inter', fontBody: 'Inter', skillStyle: 'dots', sideW: 34,
    v: { header: 'plain-left', side: 'accent', title: 'underline-full', entry: 'inline-date', contacts: 'stacked', photo: 'circle', bullets: 'disc', chips: 'outline', role: 'caps', nameWeight: 800, nameScale: 0.98, photoSize: 30 } },

  /* Zenith — indigo → cyan gradient band, titles followed by a hairline, dates in their own left column */
  { id: 'modern-zenith', name: 'Zenith', category: 'modern', desc: 'Gradient band, date column', tags: ['gradient', 'colorful', 'sans'],
    layout: 'single', header: 'top', accent: '#4338ca', accent2: '#0e7490', fontHead: 'Montserrat', fontBody: 'Source Sans 3', skillStyle: 'tags',
    v: { header: 'gradient', title: 'line-after', entry: 'date-left', contacts: 'inline', photo: 'circle', bullets: 'dash', chips: 'outline', role: 'caps', nameScale: 1.08, nameWeight: 700, photoSize: 23 } },

  /* Halo — centered teal band with a ringed photo, deep teal sidebar on the right, thick rules above titles */
  { id: 'modern-halo', name: 'Halo', category: 'modern', desc: 'Centered band, dark sidebar', tags: ['colorful', 'dark-sidebar', 'sans'],
    layout: 'right', header: 'top', accent: '#0f766e', fontHead: 'Raleway', fontBody: 'Lato', skillStyle: 'dots', sideW: 33,
    v: { header: 'band-centered', side: 'dark', title: 'overline', entry: 'classic', contacts: 'pills', photo: 'ring', bullets: 'disc', nameCase: 'upper', chips: 'solid', role: 'caps', nameWeight: 800, nameScale: 0.95, photoSize: 24 } },

  /* Comet — white split header (contacts in a ruled right column), coral pill titles, timeline entries */
  { id: 'modern-comet', name: 'Comet', category: 'modern', desc: 'Coral pills, timeline', tags: ['timeline', 'colorful', 'sans'],
    layout: 'single', header: 'top', accent: '#c8462b', fontHead: 'Poppins', fontBody: 'Nunito', skillStyle: 'text',
    v: { header: 'split', title: 'pill', entry: 'timeline', contacts: 'stacked', photo: 'rounded', bullets: 'arrow', decor: 'top-stripe', role: 'accent', nameWeight: 600, nameScale: 0.96, photoSize: 24 } },

  /* Polaris — charcoal sidebar topped by a coral identity block, condensed caps, icon badges */
  { id: 'modern-polaris', name: 'Polaris', category: 'modern', desc: 'Charcoal sidebar, coral block', tags: ['dark-sidebar', 'colorful', 'sans'],
    layout: 'left', header: 'side', accent: '#c8462b', fontHead: 'Oswald', fontBody: 'Source Sans 3', skillStyle: 'bar', sideW: 35,
    v: { header: 'band', side: 'dark-accent-titles', title: 'caps-accent', entry: 'classic', contacts: 'badges', photo: 'circle', bullets: 'disc', nameCase: 'upper', chips: 'soft', role: 'caps', nameWeight: 600, titleScale: 1.12, photoSize: 24 } },

  /* Quasar — white header over a thick cyan rule, cyan → navy gradient sidebar on the right, numbered titles */
  { id: 'modern-quasar', name: 'Quasar', category: 'modern', desc: 'Gradient right sidebar', tags: ['gradient', 'colorful', 'sans'],
    layout: 'right', header: 'top', accent: '#0e7490', accent2: '#1e3a8a', fontHead: 'Poppins', fontBody: 'Lato', skillStyle: 'bar', sideW: 32,
    v: { header: 'underline', side: 'gradient', title: 'numbered', entry: 'date-pill', contacts: 'icons', photo: 'ring', bullets: 'disc', chips: 'outline', role: 'accent', nameWeight: 600, nameScale: 1.1, photoSize: 24 } },

  /* Lyra — soft lavender L: tinted header flowing into a tinted sidebar, highlighter titles, card entries */
  { id: 'modern-lyra', name: 'Lyra', category: 'modern', desc: 'Soft tint, card entries', tags: ['sans'],
    layout: 'left', header: 'top', accent: '#4f46e5', fontHead: 'Nunito', fontBody: 'Open Sans', skillStyle: 'dots', sideW: 34,
    v: { header: 'tinted', side: 'tint', title: 'highlight', entry: 'card', contacts: 'pills', photo: 'circle', bullets: 'check', chips: 'soft', role: 'italic', nameWeight: 700, nameScale: 1.06, photoSize: 26 } },

  /* Vega — photo on the right, emerald page-edge stripe, bar titles and ruled entries */
  { id: 'modern-vega', name: 'Vega', category: 'modern', desc: 'Emerald stripe, photo right', tags: ['sans'],
    layout: 'single', header: 'top', accent: '#047857', fontHead: 'Work Sans', fontBody: 'Open Sans', skillStyle: 'tags',
    v: { header: 'photo-right', title: 'bar-left', entry: 'ruled', contacts: 'icons', photo: 'square', bullets: 'square', decor: 'left-stripe', chips: 'square', role: 'muted', nameScale: 1.18, nameWeight: 600, photoSize: 25 } },

  /* Eclipse — cobalt band with an offset-framed photo, open right sidebar, sentence-case titles, timeline */
  { id: 'modern-eclipse', name: 'Eclipse', category: 'modern', desc: 'Cobalt band, timeline', tags: ['timeline', 'colorful', 'sans'],
    layout: 'right', header: 'top', accent: '#1e40af', fontHead: 'Montserrat', fontBody: 'Roboto', skillStyle: 'bar', sideW: 31,
    v: { header: 'band', side: 'none', title: 'plain-bold', entry: 'timeline', contacts: 'icons', photo: 'offset', bullets: 'disc', decor: 'bottom-stripe', chips: 'soft', role: 'accent', nameWeight: 800, nameScale: 1.15, photoSize: 26 } },

  /* Meridian — thick indigo bar beside the name, dotted title rules, date column, plain right sidebar */
  { id: 'modern-meridian', name: 'Meridian', category: 'modern', desc: 'Accent bar, dotted rules', tags: ['sans'],
    layout: 'right', header: 'top', accent: '#3730a3', fontHead: 'Lato', fontBody: 'Lato', skillStyle: 'bar', sideW: 30,
    v: { header: 'leftbar', side: 'plain', title: 'dotted', entry: 'date-left', contacts: 'inline', photo: 'square', bullets: 'dash', decor: 'corner', chips: 'outline', role: 'muted', nameWeight: 900, nameScale: 1.12, photoSize: 24 } },

  /* Corona — framed identity card on a pale sidebar with a blue edge, short-bar titles */
  { id: 'modern-corona', name: 'Corona', category: 'modern', desc: 'Framed card, accent edge', tags: ['sans'],
    layout: 'left', header: 'side', accent: '#1d4ed8', fontHead: 'Raleway', fontBody: 'Open Sans', skillStyle: 'dots', sideW: 36,
    v: { header: 'boxed', side: 'bordered', title: 'underline-short', entry: 'classic', contacts: 'stacked', photo: 'ring', bullets: 'disc', chips: 'soft', role: 'caps', nameWeight: 700, nameScale: 0.92, photoSize: 24 } },

  /* Sirius — compact one-line header, tinted boxed titles, title | company entries on one line */
  { id: 'modern-sirius', name: 'Sirius', category: 'modern', desc: 'Compact header, boxed titles', tags: ['one-page', 'sans'],
    layout: 'single', header: 'top', accent: '#0369a1', fontHead: 'Roboto', fontBody: 'Roboto', skillStyle: 'tags',
    v: { header: 'compact', title: 'boxed', entry: 'compact', contacts: 'text-labels', photo: 'rounded', bullets: 'circle', chips: 'soft', role: 'accent', nameWeight: 700 } },
]);
