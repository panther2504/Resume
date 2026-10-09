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

/* ---------------------------------------------------------------------------------------------------
   Academic collection — twelve CV designs. Mostly one column, serif type, restrained accents (navy,
   maroon, forest, teal, aubergine, ink); compact options for long publication lists; photo optional.
   Signature touches live in css/templates/academic.css (each qualified with its knob class).
   --------------------------------------------------------------------------------------------------- */
registerTemplates([
  /* Thesis — name left, contacts in a ruled right column; titles trailed by a hairline; right-aligned dates in a left column */
  { id: 'academic-thesis', name: 'Thesis', category: 'academic', desc: 'Split header, dates left', tags: ['serif', 'one-page', 'research', 'cv'],
    layout: 'single', header: 'top', accent: '#1e3a8a', fontHead: 'Lora', fontBody: 'Source Sans 3', skillStyle: 'text',
    v: { header: 'split', title: 'line-after', entry: 'date-left', contacts: 'icons', photo: 'none-default', density: 'normal', bullets: 'dash', decor: 'top-stripe',
         role: 'italic', nameScale: 1.12, nameWeight: 600, titleScale: 1.02 } },

  /* Lyceum — navy band with centered capitals; titles over a double rule; classic entries */
  { id: 'academic-lyceum', name: 'Lyceum', category: 'academic', desc: 'Navy band, double rules', tags: ['serif', 'colorful', 'one-page', 'faculty'],
    layout: 'single', header: 'top', accent: '#1b365d', fontHead: 'Playfair Display', fontBody: 'EB Garamond', skillStyle: 'text',
    v: { header: 'band-centered', title: 'underline-full', entry: 'classic', contacts: 'inline', photo: 'circle', density: 'compact', bullets: 'disc',
         nameCase: 'upper', role: 'caps', nameScale: 0.98, nameWeight: 500, titleScale: 1.04, photoSize: 22 },
    vars: { '--photo-bw': '2px' } },

  /* Seminar — one-line header, bar titles, one-line entries: built for long publication and grant lists */
  { id: 'academic-seminar', name: 'Seminar', category: 'academic', desc: 'Compact, publication lists', tags: ['serif', 'compact', 'one-page', 'publications', 'medical'],
    layout: 'single', header: 'top', accent: '#166534', fontHead: 'Merriweather', fontBody: 'Source Sans 3', skillStyle: 'text',
    v: { header: 'compact', title: 'bar-left', entry: 'compact', contacts: 'inline', photo: 'none-default', density: 'compact', bullets: 'square',
         nameCase: 'upper', role: 'muted', nameScale: 0.84, nameWeight: 700, titleScale: 0.92 } },

  /* Provost — large display-serif name with a square portrait on the right; thick overline titles; dates under titles */
  { id: 'academic-provost', name: 'Provost', category: 'academic', desc: 'Portrait right, overlines', tags: ['serif', 'one-page', 'faculty', 'cv'],
    layout: 'single', header: 'top', accent: '#7b1e3a', fontHead: 'DM Serif Display', fontBody: 'Lato', skillStyle: 'tags',
    v: { header: 'photo-right', title: 'overline', entry: 'inline-date', contacts: 'icons', photo: 'square', density: 'compact', bullets: 'circle',
         chips: 'outline', role: 'caps', nameScale: 1.22, nameWeight: 400, titleScale: 1.2, photoSize: 27 } },

  /* Docent — teaching CV: tinted header with portrait and icon badges, tinted boxed titles, soft tag chips, bottom stripe */
  { id: 'academic-docent', name: 'Docent', category: 'academic', desc: 'Tinted header, boxed titles', tags: ['serif', 'one-page', 'teaching', 'cv'],
    layout: 'single', header: 'top', accent: '#0f5257', fontHead: 'Merriweather', fontBody: 'Open Sans', skillStyle: 'tags',
    v: { header: 'tinted', title: 'boxed', entry: 'classic', contacts: 'badges', photo: 'circle', density: 'compact', bullets: 'disc', decor: 'bottom-stripe',
         chips: 'soft', role: 'accent', nameScale: 0.9, nameWeight: 700, titleScale: 0.94, photoSize: 24 } },

  /* Emeritus — monochrome, typeset look: heavy rule under the header, sentence-case bold titles, dates left, labelled contacts
     (Times New Roman is a system font; systems without it fall back to their default serif) */
  { id: 'academic-emeritus', name: 'Emeritus', category: 'academic', desc: 'Monochrome, typeset classic', tags: ['serif', 'one-page', 'traditional'],
    layout: 'single', header: 'top', accent: '#262626', fontHead: 'Times New Roman', fontBody: 'Times New Roman', skillStyle: 'text',
    v: { header: 'underline', title: 'plain-bold', entry: 'date-left', contacts: 'text-labels', photo: 'none-default', density: 'normal', bullets: 'disc',
         role: 'muted', nameScale: 1.0, nameWeight: 700, titleScale: 1.0 } },

  /* Dean — diploma-like double frame around a centered header (photo optional); centered titles; entries separated by hairlines */
  { id: 'academic-dean', name: 'Dean', category: 'academic', desc: 'Framed header, centered titles', tags: ['serif', 'one-page', 'faculty'],
    layout: 'single', header: 'top', accent: '#5b2160', fontHead: 'EB Garamond', fontBody: 'Lato', skillStyle: 'text',
    v: { header: 'boxed', title: 'centered', entry: 'ruled', contacts: 'inline', photo: 'none-default', density: 'compact', bullets: 'disc',
         role: 'caps', nameScale: 1.12, nameWeight: 600, titleScale: 1.08, photoSize: 19 } },

  /* Colloquium — accent bar beside the name, numbered sections, dates in a left column, ringed portrait */
  { id: 'academic-colloquium', name: 'Colloquium', category: 'academic', desc: 'Numbered sections, dates left', tags: ['serif', 'one-page', 'research'],
    layout: 'single', header: 'top', accent: '#1f4e79', fontHead: 'Lora', fontBody: 'Lora', skillStyle: 'text',
    v: { header: 'leftbar', title: 'numbered', entry: 'date-left', contacts: 'icons', photo: 'ring', density: 'compact', bullets: 'arrow',
         role: 'accent', nameScale: 1.05, nameWeight: 600, titleScale: 1.0, photoSize: 22 } },

  /* Fellow — forest sidebar on the right with rated skills, full-width header, dates in a left column */
  { id: 'academic-fellow', name: 'Fellow', category: 'academic', desc: 'Forest sidebar, dates left', tags: ['serif', 'one-page', 'research'],
    layout: 'right', header: 'top', accent: '#1f5132', fontHead: 'EB Garamond', fontBody: 'Source Sans 3', skillStyle: 'dots', sideW: 32,
    v: { header: 'plain-left', title: 'underline-full', entry: 'date-left', side: 'tint', contacts: 'icons', photo: 'circle', density: 'normal', bullets: 'square', chips: 'square',
         role: 'italic', nameScale: 1.18, nameWeight: 600, titleScale: 1.1, photoSize: 25 } },

  /* Atheneum — oxblood name block crowning a light left sidebar; caps titles; classic entries */
  { id: 'academic-atheneum', name: 'Atheneum', category: 'academic', desc: 'Oxblood crest, sidebar', tags: ['serif', 'colorful', 'one-page'],
    layout: 'left', header: 'side', accent: '#6e1f2a', fontHead: 'Playfair Display', fontBody: 'Source Sans 3', skillStyle: 'bar', sideW: 33,
    v: { header: 'band', title: 'caps-accent', entry: 'classic', side: 'tint', contacts: 'stacked', photo: 'circle', density: 'normal', bullets: 'dash',
         role: 'italic', nameScale: 0.86, nameWeight: 600, titleScale: 1.06, photoSize: 24 },
    vars: { '--photo-bw': '2px' } },

  /* Tenure — accent rule under the header, hairline-divided slim sidebar with rated skills, dotted titles, dates under titles */
  { id: 'academic-tenure', name: 'Tenure', category: 'academic', desc: 'Slim sidebar, dotted titles', tags: ['serif', 'one-page', 'medical'],
    layout: 'left', header: 'top', accent: '#334e68', fontHead: 'Lora', fontBody: 'Lato', skillStyle: 'dots', sideW: 31,
    v: { header: 'underline', title: 'dotted', entry: 'inline-date', side: 'plain', contacts: 'inline', photo: 'none-default', density: 'normal', bullets: 'dash', chips: 'outline',
         role: 'caps', nameScale: 1.1, nameWeight: 700, titleScale: 0.95 } },

  /* Monograph — deep navy sidebar (derived from the accent) on the right holding the name; sans headings over a serif text column */
  { id: 'academic-monograph', name: 'Monograph', category: 'academic', desc: 'Navy sidebar, sans heads', tags: ['serif', 'sans', 'dark-sidebar', 'one-page'],
    layout: 'right', header: 'side', accent: '#1e3a5f', fontHead: 'Montserrat', fontBody: 'Merriweather', skillStyle: 'bar', sideW: 34,
    v: { header: 'plain-left', title: 'underline-short', entry: 'classic', side: 'dark', contacts: 'stacked', photo: 'rounded', density: 'normal', bullets: 'disc',
         role: 'caps', nameScale: 0.9, nameWeight: 700, titleScale: 0.92, photoSize: 22 },
    vars: { '--side-bg': 'color-mix(in srgb, var(--accent) 55%, #0b1220)' } },
]);
