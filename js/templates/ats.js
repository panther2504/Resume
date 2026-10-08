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

  /* Standard — the traditional "registrar" resume: Times, centered uppercase name, ink rules, one-line entries */
  { id: 'ats-standard', name: 'Standard', category: 'ats', desc: 'Traditional serif, centered', tags: ['serif', 'one-page'],
    layout: 'single', header: 'top', accent: '#1f2937', fontHead: 'Times New Roman', fontBody: 'Times New Roman', skillStyle: 'text',
    v: { header: 'centered', title: 'underline-full', entry: 'compact', contacts: 'inline', photo: 'none-default', density: 'normal', bullets: 'disc',
         nameCase: 'upper', role: 'italic', nameScale: 0.92, nameWeight: 700, titleScale: 1.02 } },

  /* Direct — Arial, large name over a thick accent rule, caps accent titles without rules, square bullets */
  { id: 'ats-direct', name: 'Direct', category: 'ats', desc: 'Thick header rule', tags: ['sans', 'one-page'],
    layout: 'single', header: 'top', accent: '#b91c1c', fontHead: 'Arial', fontBody: 'Arial', skillStyle: 'text',
    v: { header: 'underline', title: 'caps-accent', entry: 'classic', contacts: 'inline', photo: 'none-default', density: 'normal', bullets: 'square',
         role: 'caps', nameScale: 1.14, nameWeight: 700, titleScale: 1.06 } },

  /* Focus — Inter, heavy oversized name, accent bars before titles, dates under the job title */
  { id: 'ats-focus', name: 'Focus', category: 'ats', desc: 'Heavy name, accent bars', tags: ['sans', 'one-page'],
    layout: 'single', header: 'top', accent: '#0f766e', fontHead: 'Inter', fontBody: 'Inter', skillStyle: 'tags',
    v: { header: 'plain-left', title: 'bar-left', entry: 'inline-date', contacts: 'inline', photo: 'none-default', density: 'compact', bullets: 'dash',
         chips: 'outline', role: 'accent', nameScale: 1.28, nameWeight: 800, titleScale: 0.98 } },

  /* Plain — Roboto, one-line compact header, hairline titles and one-line entries in quiet slate */
  { id: 'ats-plain', name: 'Plain', category: 'ats', desc: 'One-line header, hairlines', tags: ['sans', 'one-page', 'compact'],
    layout: 'single', header: 'top', accent: '#334155', fontHead: 'Roboto', fontBody: 'Roboto', skillStyle: 'text',
    v: { header: 'compact', title: 'line-after', entry: 'compact', contacts: 'inline', photo: 'none-default', density: 'normal', bullets: 'disc',
         role: 'muted', nameWeight: 700, titleScale: 0.94 } },

  /* Core — Source Sans 3, uppercase name, thick overline titles, dates in a narrow left column */
  { id: 'ats-core', name: 'Core', category: 'ats', desc: 'Overlines, date column', tags: ['sans', 'one-page'],
    layout: 'single', header: 'top', accent: '#9a3412', fontHead: 'Source Sans 3', fontBody: 'Source Sans 3', skillStyle: 'tags',
    v: { header: 'plain-left', title: 'overline', entry: 'date-left', contacts: 'text-labels', photo: 'none-default', density: 'compact', bullets: 'circle',
         chips: 'square', nameCase: 'upper', role: 'caps', nameScale: 0.95, nameWeight: 700 } },

  /* Lucid — Lato, light centered name, dotted rules and ruled entries with generous spacing (intentionally airy: 2 pages) */
  { id: 'ats-lucid', name: 'Lucid', category: 'ats', desc: 'Airy, light, dotted', tags: ['sans'],
    layout: 'single', header: 'top', accent: '#4338ca', fontHead: 'Lato', fontBody: 'Lato', skillStyle: 'text',
    v: { header: 'centered', title: 'dotted', entry: 'ruled', contacts: 'inline', photo: 'none-default', density: 'airy', bullets: 'disc',
         role: 'caps', nameScale: 1.3, nameWeight: 300, titleScale: 0.96 } },

  /* Exact — Georgia name and sentence-case section titles over an Arial body, compact header, labelled contacts */
  { id: 'ats-exact', name: 'Exact', category: 'ats', desc: 'Serif headings, sentence titles', tags: ['serif', 'sans', 'one-page'],
    layout: 'single', header: 'top', accent: '#166534', fontHead: 'Georgia', fontBody: 'Arial', skillStyle: 'text',
    v: { header: 'compact', title: 'plain-bold', entry: 'classic', contacts: 'text-labels', photo: 'none-default', density: 'normal', bullets: 'dash',
         role: 'accent', nameScale: 1.05, nameWeight: 700, titleScale: 1.02 } },

  /* Crisp — Open Sans, accent-colored name over a hairline, short accent bars, entries separated by rules */
  { id: 'ats-crisp', name: 'Crisp', category: 'ats', desc: 'Accent name, ruled entries', tags: ['sans', 'one-page'],
    layout: 'single', header: 'top', accent: '#0369a1', fontHead: 'Open Sans', fontBody: 'Open Sans', skillStyle: 'tags',
    v: { header: 'underline', title: 'underline-short', entry: 'ruled', contacts: 'inline', photo: 'none-default', density: 'compact', bullets: 'disc',
         chips: 'soft', role: 'muted', nameScale: 1.1, nameWeight: 700, titleScale: 1 } },

  /* Candid — centered Georgia name, highlighter-marked titles, dates under the job title */
  { id: 'ats-candid', name: 'Candid', category: 'ats', desc: 'Centered, highlighted titles', tags: ['serif', 'one-page'],
    layout: 'single', header: 'top', accent: '#a16207', fontHead: 'Georgia', fontBody: 'Lato', skillStyle: 'text',
    v: { header: 'centered', title: 'highlight', entry: 'inline-date', contacts: 'text-labels', photo: 'none-default', density: 'compact', bullets: 'circle',
         role: 'italic', nameScale: 1.12, nameWeight: 400, titleScale: 1.05 } },

  /* Concise — Lato, small uppercase one-line header, spaced caps titles, dates in a left column; very dense */
  { id: 'ats-concise', name: 'Concise', category: 'ats', desc: 'Dense, dates left', tags: ['sans', 'one-page', 'compact'],
    layout: 'single', header: 'top', accent: '#5b21b6', fontHead: 'Lato', fontBody: 'Lato', skillStyle: 'text',
    v: { header: 'compact', title: 'caps-accent', entry: 'date-left', contacts: 'inline', photo: 'none-default', density: 'compact', bullets: 'arrow',
         nameCase: 'upper', role: 'caps', nameScale: 0.85, nameWeight: 900, titleScale: 0.92 } },

  /* Steady — Times New Roman headings over Arial, titles centered between hairlines, square bullets */
  { id: 'ats-steady', name: 'Steady', category: 'ats', desc: 'Ruled, centered titles', tags: ['serif', 'sans', 'one-page'],
    layout: 'single', header: 'top', accent: '#701a75', fontHead: 'Times New Roman', fontBody: 'Arial', skillStyle: 'text',
    v: { header: 'plain-left', title: 'ruled-both', entry: 'classic', contacts: 'inline', photo: 'none-default', density: 'normal', bullets: 'square',
         role: 'muted', nameScale: 1.15, nameWeight: 700, titleScale: 1.06 } },

  /* Linear — Source Sans 3, ink rule under the header, hairline titles, dates in small accent tabs */
  { id: 'ats-linear', name: 'Linear', category: 'ats', desc: 'Hairlines, date tabs', tags: ['sans', 'one-page'],
    layout: 'single', header: 'top', accent: '#1e3a8a', fontHead: 'Source Sans 3', fontBody: 'Source Sans 3', skillStyle: 'tags',
    v: { header: 'underline', title: 'line-after', entry: 'date-pill', contacts: 'text-labels', photo: 'none-default', density: 'normal', bullets: 'dash',
         chips: 'outline', role: 'accent', nameScale: 1.12, nameWeight: 600, titleScale: 1.04 } },
]);
