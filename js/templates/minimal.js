/* Resume Studio — Minimal templates (category id: 'minimal')
   Whitespace-first and understated: light rules, few colors, airy density.

   HOW TO ADD A TEMPLATE (pure configuration — the full schema and every knob value are documented at the top of js/data.js):
     registerTemplates([
       { id: 'minimal-example', name: 'Example', category: 'minimal', desc: 'Up to four words',
         tags: ['serif'], layout: 'single' | 'left' | 'right', header: 'top' | 'side',
         accent: '#1d4ed8', accent2: '#0f172a', fontHead: 'Montserrat', fontBody: 'Lato', skillStyle: 'bar' | 'dots' | 'tags' | 'text',
         sideW: 32, titlePrefix: '',
         v: { header: 'band', title: 'line-after', entry: 'timeline', side: 'tint', contacts: 'icons', photo: 'circle',
              density: 'normal', bullets: 'disc', decor: 'none', nameCase: 'normal', chips: 'soft', role: 'accent',
              nameScale: 1, nameWeight: 700, titleScale: 1, photoSize: 28 },
         vars: { '--side-bg': '#0f172a' } },
     ]);
   Rules: unique ids (prefix them with the category), fonts from FONTS, colors as #rrggbb, desc max 4 words.
   Optional CSS goes in css/templates/minimal.css, scoped to .tpl-<id>. Check your work with
   /tmp/rs-tools/contact-sheet.js <repo> out.png minimal [--long] (see /tmp/rs-tools/README.md). */

registerTemplates([
  /* Reference template — no photo, light name, dates in a left column, airy spacing, dash bullets */
  { id: 'minimal-paper', name: 'Paper', category: 'minimal', desc: 'Airy, dates left', tags: ['sans'],
    layout: 'single', header: 'top', accent: '#475569', fontHead: 'Work Sans', fontBody: 'Work Sans', skillStyle: 'text',
    v: { header: 'plain-left', title: 'caps-accent', entry: 'date-left', contacts: 'inline', photo: 'none-default', density: 'airy', bullets: 'dash', role: 'muted', nameWeight: 300, nameScale: 1.2 } },

  /* Vellum — light Inter name with contacts split off on a hairline, tracked caps titles trailed by hairlines */
  { id: 'minimal-vellum', name: 'Vellum', category: 'minimal', desc: 'Split header, hairlines', tags: ['sans', 'one-page'],
    layout: 'single', header: 'top', accent: '#3b4f6b', fontHead: 'Inter', fontBody: 'Inter', skillStyle: 'text',
    v: { header: 'split', title: 'line-after', entry: 'classic', contacts: 'inline', photo: 'circle', bullets: 'disc', role: 'caps',
         nameWeight: 300, nameScale: 1.2, titleScale: 0.88, photoSize: 22 } },

  /* Quill — all-serif, italic name, sentence-case accent titles, italic dates, no photo */
  { id: 'minimal-quill', name: 'Quill', category: 'minimal', desc: 'Italic serif, quiet', tags: ['serif', 'one-page'],
    layout: 'single', header: 'top', accent: '#7a2e3a', fontHead: 'Lora', fontBody: 'Lora', skillStyle: 'text',
    v: { header: 'plain-left', title: 'plain-bold', entry: 'classic', contacts: 'inline', photo: 'none-default', bullets: 'circle', role: 'italic',
         nameWeight: 400, nameScale: 1.3, titleScale: 0.92 } },

  /* Folio — header at the top of a white sidebar split off by a hairline, small dots, airy caps titles */
  { id: 'minimal-folio', name: 'Folio', category: 'minimal', desc: 'Side header, hairline divider', tags: ['sans', 'one-page'],
    layout: 'left', header: 'side', accent: '#4a6b57', fontHead: 'Raleway', fontBody: 'Lato', skillStyle: 'dots', sideW: 31,
    v: { header: 'plain-left', side: 'plain', title: 'caps-accent', entry: 'classic', contacts: 'stacked', photo: 'rounded', bullets: 'disc', role: 'muted',
         nameWeight: 500, nameScale: 0.84, titleScale: 0.86, photoSize: 26 } },

  /* Margin — photo right of a light name, numbered titles, ruled entries, an open (borderless) sidebar on the right */
  { id: 'minimal-margin', name: 'Margin', category: 'minimal', desc: 'Numbered, open sidebar', tags: ['sans', 'one-page'],
    layout: 'right', header: 'top', accent: '#3f4a8a', fontHead: 'Poppins', fontBody: 'Inter', skillStyle: 'bar', sideW: 32,
    v: { header: 'photo-right', side: 'none', title: 'numbered', entry: 'ruled', contacts: 'icons', photo: 'circle', bullets: 'dash', role: 'muted',
         nameWeight: 300, nameScale: 1.15, titleScale: 0.9, photoSize: 24 } },

  /* Graphite — near-monochrome, one-line header and one-line entries, outlined square chips, thin top rule */
  { id: 'minimal-graphite', name: 'Graphite', category: 'minimal', desc: 'Monochrome, one-line entries', tags: ['sans', 'one-page', 'compact'],
    layout: 'single', header: 'top', accent: '#3f3f46', fontHead: 'Source Sans 3', fontBody: 'Source Sans 3', skillStyle: 'tags',
    v: { header: 'compact', title: 'underline-full', entry: 'compact', contacts: 'inline', photo: 'square', bullets: 'square', chips: 'outline', role: 'muted',
         decor: 'top-stripe', nameCase: 'upper', nameWeight: 600, nameScale: 1.05, titleScale: 0.9 } },

  /* Deckle — centered, wide-tracked light caps name, hairline overline titles, thin inset frame (photo hidden by default) */
  { id: 'minimal-deckle', name: 'Deckle', category: 'minimal', desc: 'Centered, framed, tracked', tags: ['sans', 'one-page'],
    layout: 'single', header: 'top', accent: '#7a6652', fontHead: 'Montserrat', fontBody: 'Lato', skillStyle: 'text',
    v: { header: 'centered', title: 'overline', entry: 'classic', contacts: 'inline', photo: 'none-default', bullets: 'dash', role: 'caps', decor: 'frame',
         nameCase: 'upper', nameWeight: 300, nameScale: 0.95, titleScale: 0.85, photoSize: 22 } },

  /* Nib — fine vertical strokes: a hairline bar beside the name and titles, hairline timeline entries */
  { id: 'minimal-nib', name: 'Nib', category: 'minimal', desc: 'Fine strokes, timeline', tags: ['sans', 'timeline', 'one-page'],
    layout: 'single', header: 'top', accent: '#1d6b6b', fontHead: 'Nunito', fontBody: 'Nunito', skillStyle: 'tags',
    v: { header: 'leftbar', title: 'bar-left', entry: 'timeline', contacts: 'icons', photo: 'circle', bullets: 'disc', chips: 'soft', role: 'accent',
         nameWeight: 700, nameScale: 0.95, titleScale: 0.9, photoSize: 21 } },

  /* Quire — Garamond name centered on a barely-there sidebar (right), hairline-ruled titles, dates under titles */
  { id: 'minimal-quire', name: 'Quire', category: 'minimal', desc: 'Garamond, soft sidebar', tags: ['serif', 'one-page'],
    layout: 'right', header: 'side', accent: '#6b4c7a', fontHead: 'EB Garamond', fontBody: 'Source Sans 3', skillStyle: 'dots', sideW: 34,
    v: { header: 'centered', side: 'bordered', title: 'ruled-both', entry: 'inline-date', contacts: 'stacked', photo: 'circle', bullets: 'circle', role: 'italic',
         nameWeight: 500, nameScale: 0.95, titleScale: 1.05, photoSize: 30 } },

  /* Kraft — warm paper-tinted header, perforation-dotted titles, square label chips, Merriweather light name */
  { id: 'minimal-kraft', name: 'Kraft', category: 'minimal', desc: 'Warm tint, dotted rules', tags: ['serif', 'one-page'],
    layout: 'single', header: 'top', accent: '#8a5a2b', fontHead: 'Merriweather', fontBody: 'Open Sans', skillStyle: 'tags',
    v: { header: 'tinted', title: 'dotted', entry: 'classic', contacts: 'icons', photo: 'rounded', bullets: 'arrow', chips: 'square', role: 'accent',
         nameWeight: 300, nameScale: 1, titleScale: 0.88, photoSize: 18 } },

  /* Carbon — typewritten manuscript: monospace name, titles and dates, serif body, ribbon-red accent, dates in a left column */
  { id: 'minimal-carbon', name: 'Carbon', category: 'minimal', desc: 'Typewriter, dates left', tags: ['monospace', 'serif', 'one-page'],
    layout: 'single', header: 'top', accent: '#a3302a', fontHead: 'Roboto Mono', fontBody: 'Lora', skillStyle: 'text',
    v: { header: 'underline', title: 'underline-short', entry: 'date-left', contacts: 'text-labels', photo: 'square', bullets: 'dash', role: 'muted',
         nameWeight: 500, nameScale: 0.9, titleScale: 0.9, photoSize: 18 } },

  /* Bristol — hairline-boxed header, entries on faint cards, centered titles, open sidebar on the left */
  { id: 'minimal-bristol', name: 'Bristol', category: 'minimal', desc: 'Boxed header, soft cards', tags: ['sans', 'one-page'],
    layout: 'left', header: 'top', accent: '#2e5a78', fontHead: 'Work Sans', fontBody: 'Work Sans', skillStyle: 'bar', sideW: 30,
    v: { header: 'boxed', side: 'none', title: 'centered', entry: 'card', contacts: 'icons', photo: 'circle', bullets: 'disc', role: 'caps',
         nameWeight: 500, nameScale: 1, titleScale: 0.88, photoSize: 22 } },

  /* Linen — centered serif name, linen-tinted sidebar on the right, soft title strips, outlined date tags */
  { id: 'minimal-linen', name: 'Linen', category: 'minimal', desc: 'Linen sidebar, title strips', tags: ['serif', 'one-page'],
    layout: 'right', header: 'top', accent: '#5f6b2e', fontHead: 'DM Serif Display', fontBody: 'Open Sans', skillStyle: 'tags', sideW: 31,
    v: { header: 'centered', side: 'tint', title: 'boxed', entry: 'date-pill', contacts: 'inline', photo: 'circle', bullets: 'disc', chips: 'soft', role: 'muted',
         nameWeight: 400, nameScale: 1.1, titleScale: 0.88, photoSize: 22 } },
]);
