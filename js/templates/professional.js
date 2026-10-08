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

/* Gallery order: Harbor (reference), then the coastal collection. Each one pairs a different header, title and entry
   style; signature touches (all variable-driven, knob-qualified) live in css/templates/professional.css. */
registerTemplates([
  /* Reference template — split header (contacts in a right column), accent-edged sidebar, top stripe */
  { id: 'professional-harbor', name: 'Harbor', category: 'professional', desc: 'Split header, accent edge', tags: ['sans', 'one-page'],
    layout: 'right', header: 'top', accent: '#1e3a8a', fontHead: 'Source Sans 3', fontBody: 'Source Sans 3', skillStyle: 'dots', sideW: 31,
    v: { header: 'split', side: 'bordered', title: 'underline-full', entry: 'classic', contacts: 'stacked', photo: 'rounded', decor: 'top-stripe', nameWeight: 700, nameScale: 1.05 } },

  /* Anchor — one column under a centered navy band: ringed photo, uppercase name, hairline titles */
  { id: 'professional-anchor', name: 'Anchor', category: 'professional', desc: 'Centered navy band', tags: ['sans', 'one-page'],
    layout: 'single', header: 'top', accent: '#1f3a5f', fontHead: 'Montserrat', fontBody: 'Source Sans 3', skillStyle: 'text',
    v: { header: 'band-centered', title: 'line-after', entry: 'classic', contacts: 'inline', photo: 'ring', density: 'compact', bullets: 'disc',
         nameCase: 'upper', role: 'caps', nameWeight: 600, nameScale: 0.92, photoSize: 24 } },

  /* Lighthouse — teal identity block at the top of a light sidebar, bar titles, dates under the job title */
  { id: 'professional-lighthouse', name: 'Lighthouse', category: 'professional', desc: 'Teal side block', tags: ['sans'],
    layout: 'left', header: 'side', accent: '#0f5e6e', fontHead: 'Raleway', fontBody: 'Lato', skillStyle: 'dots', sideW: 34,
    v: { header: 'band', side: 'tint', title: 'bar-left', entry: 'inline-date', contacts: 'badges', photo: 'circle', bullets: 'disc',
         role: 'accent', nameWeight: 700, photoSize: 30 } },

  /* Pier — editorial serif: thick rule under the header, burgundy caps titles, hairlines between entries */
  { id: 'professional-pier', name: 'Pier', category: 'professional', desc: 'Serif, burgundy rules', tags: ['serif'],
    layout: 'right', header: 'top', accent: '#7a2335', fontHead: 'Lora', fontBody: 'Open Sans', skillStyle: 'bar', sideW: 32,
    v: { header: 'underline', side: 'plain', title: 'caps-accent', entry: 'ruled', contacts: 'icons', photo: 'square', bullets: 'dash',
         role: 'italic', nameWeight: 600, nameScale: 1.08, photoSize: 26 } },

  /* Marina — tinted header flowing into a tinted sidebar (an L-shaped frame), boxed titles, contact pills */
  { id: 'professional-marina', name: 'Marina', category: 'professional', desc: 'Tinted header and sidebar', tags: ['sans'],
    layout: 'left', header: 'top', accent: '#2c5282', fontHead: 'Poppins', fontBody: 'Open Sans', skillStyle: 'bar', sideW: 32,
    v: { header: 'tinted', side: 'tint', title: 'boxed', entry: 'classic', contacts: 'pills', photo: 'rounded', bullets: 'circle',
         role: 'accent', nameWeight: 600, photoSize: 27 } },

  /* Quay — efficient consulting one-pager: one-line header, numbered titles, title | company entries, no photo by default */
  { id: 'professional-quay', name: 'Quay', category: 'professional', desc: 'Numbered, one-line entries', tags: ['sans', 'compact', 'one-page'],
    layout: 'single', header: 'top', accent: '#334e68', fontHead: 'Roboto', fontBody: 'Roboto', skillStyle: 'tags',
    v: { header: 'compact', title: 'numbered', entry: 'compact', contacts: 'text-labels', photo: 'none-default', density: 'normal', bullets: 'square',
         decor: 'top-stripe', chips: 'square', role: 'muted', nameWeight: 700 } },

  /* Beacon — formal serif: letterhead-style framed header, hairline rules above the titles, inline contacts */
  { id: 'professional-beacon', name: 'Beacon', category: 'professional', desc: 'Framed header, serif', tags: ['serif', 'one-page'],
    layout: 'single', header: 'top', accent: '#1e3a8a', fontHead: 'Merriweather', fontBody: 'Lato', skillStyle: 'text',
    v: { header: 'boxed', title: 'overline', entry: 'classic', contacts: 'inline', photo: 'square', density: 'compact', bullets: 'disc',
         role: 'caps', nameScale: 0.86, nameWeight: 700, photoSize: 22 } },

  /* Cove — profile in a light sidebar with an accent edge, centered ringed photo, dotted titles */
  { id: 'professional-cove', name: 'Cove', category: 'professional', desc: 'Side profile, accent edge', tags: ['sans'],
    layout: 'left', header: 'side', accent: '#0f766e', fontHead: 'Nunito', fontBody: 'Nunito', skillStyle: 'tags', sideW: 33,
    v: { header: 'centered', side: 'bordered', title: 'dotted', entry: 'classic', contacts: 'icons', photo: 'ring', bullets: 'arrow',
         chips: 'outline', role: 'accent', nameWeight: 800, photoSize: 30 } },

  /* Coast — photo on the right, career timeline, sentence-case titles, slim accent stripe down the left edge */
  { id: 'professional-coast', name: 'Coast', category: 'professional', desc: 'Photo right, timeline', tags: ['sans', 'timeline', 'one-page'],
    layout: 'single', header: 'top', accent: '#0e6e8c', fontHead: 'Inter', fontBody: 'Inter', skillStyle: 'tags',
    v: { header: 'photo-right', title: 'plain-bold', entry: 'timeline', contacts: 'stacked', photo: 'offset', density: 'compact', bullets: 'dash',
         decor: 'left-stripe', chips: 'soft', role: 'accent', nameWeight: 700, photoSize: 30 } },

  /* Wharf — operations look: condensed uppercase name beside an accent bar, open sidebar, tinted entry cards */
  { id: 'professional-wharf', name: 'Wharf', category: 'professional', desc: 'Accent bar, entry cards', tags: ['sans'],
    layout: 'right', header: 'top', accent: '#1d5c4d', fontHead: 'Oswald', fontBody: 'Source Sans 3', skillStyle: 'bar', sideW: 31,
    v: { header: 'leftbar', side: 'none', title: 'underline-full', entry: 'card', contacts: 'text-labels', photo: 'rounded', bullets: 'square',
         decor: 'bottom-stripe', nameCase: 'upper', chips: 'square', role: 'muted', nameWeight: 500, nameScale: 1.05, photoSize: 26 } },

  /* Bay — navy-to-teal gradient band with a serif name, titles ruled on both sides, dates in pills */
  { id: 'professional-bay', name: 'Bay', category: 'professional', desc: 'Gradient band, date pills', tags: ['serif', 'gradient'],
    layout: 'left', header: 'top', accent: '#1d4e89', accent2: '#0b6461', fontHead: 'DM Serif Display', fontBody: 'Inter', skillStyle: 'dots', sideW: 34,
    v: { header: 'gradient', side: 'plain', title: 'ruled-both', entry: 'date-pill', contacts: 'pills', photo: 'circle', bullets: 'disc',
         role: 'caps', nameWeight: 400, nameScale: 1.12, photoSize: 26 } },

  /* Tide — split header whose contact column sits above a deep navy right sidebar, dates in their own column */
  { id: 'professional-tide', name: 'Tide', category: 'professional', desc: 'Navy sidebar, dates left', tags: ['sans', 'dark-sidebar'],
    layout: 'right', header: 'top', accent: '#2b6cb0', fontHead: 'Work Sans', fontBody: 'Lato', skillStyle: 'bar', sideW: 32,
    v: { header: 'split', side: 'dark', title: 'underline-short', entry: 'date-left', contacts: 'badges', photo: 'square', bullets: 'circle',
         role: 'caps', nameWeight: 700, photoSize: 25 },
    vars: { '--date-w': '19mm' } },

  /* Jetty — monochrome charcoal: full-width title bands, dates in a left column, serif name */
  { id: 'professional-jetty', name: 'Jetty', category: 'professional', desc: 'Charcoal title bands', tags: ['serif', 'one-page'],
    layout: 'single', header: 'top', accent: '#2f3a48', fontHead: 'Playfair Display', fontBody: 'Source Sans 3', skillStyle: 'text',
    v: { header: 'plain-left', title: 'pill', entry: 'date-left', contacts: 'icons', photo: 'circle', density: 'compact', bullets: 'dash',
         role: 'italic', nameWeight: 700, nameScale: 1.1, photoSize: 26 },
    vars: { '--date-w': '19mm' } },
]);
