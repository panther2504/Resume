/* Resume Studio — static data: helpers, icons, fonts, templates, presets and sample content */

const uid = () => Math.random().toString(36).slice(2, 10);
const clone = (o) => JSON.parse(JSON.stringify(o));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/** Tiny DOM builder: h('div', {class:'x', onclick:fn}, child, 'text') */
function h(tag, props, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
    else if (k === 'value' || k === 'checked' || k === 'selected' || k === 'disabled') e[k] = v;
    else e.setAttribute(k, v === true ? '' : v);
  }
  kids.flat(Infinity).forEach((c) => {
    if (c == null || c === false) return;
    e.append(c.nodeType ? c : document.createTextNode(c));
  });
  return e;
}

/* ---------- Icons (24px stroke icons) ---------- */
const ICONS = {
  mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
  info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
  undo: '<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>',
  redo: '<path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>',
  grip: '<circle cx="9" cy="5" r="1.4"/><circle cx="15" cy="5" r="1.4"/><circle cx="9" cy="12" r="1.4"/><circle cx="15" cy="12" r="1.4"/><circle cx="9" cy="19" r="1.4"/><circle cx="15" cy="19" r="1.4"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  chevron: '<polyline points="6 9 12 15 18 9"/>',
  up: '<polyline points="18 15 12 9 6 15"/>',
  down: '<polyline points="6 9 12 15 18 9"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  type: '<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>',
  heading: '<path d="M6 4v16M18 4v16M6 12h12"/>',
  subtitle: '<line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="14" y2="15"/>',
  section: '<path d="M4 7h10"/><line x1="4" y1="12" x2="20" y2="12" stroke-width="3"/><path d="M4 17h16"/>',
  paragraph: '<line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="10" x2="20" y2="10"/><line x1="4" y1="14" x2="20" y2="14"/><line x1="4" y1="18" x2="14" y2="18"/>',
  list: '<line x1="9" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="9" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
  olist: '<line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>',
  briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  contact: '<rect x="2" y="4" width="20" height="16" rx="2"/><circle cx="8" cy="11" r="2.5"/><path d="M4.5 17c.6-1.8 2-2.7 3.5-2.7s2.9.9 3.5 2.7"/><line x1="14" y1="9" x2="19" y2="9"/><line x1="14" y1="13" x2="18" y2="13"/>',
  bar: '<rect x="2" y="10" width="20" height="4" rx="2"/><rect x="2" y="10" width="12" height="4" rx="2" fill="currentColor"/>',
  chips: '<rect x="2" y="7" width="9" height="6" rx="3"/><rect x="13" y="7" width="9" height="6" rx="3"/><rect x="2" y="15" width="12" height="6" rx="3"/>',
  square: '<rect x="3" y="3" width="18" height="18" rx="2"/>',
  circle: '<circle cx="12" cy="12" r="9"/>',
  line: '<line x1="3" y1="12" x2="21" y2="12"/>',
  front: '<rect x="8" y="8" width="13" height="13" rx="2" fill="currentColor" fill-opacity=".25"/><path d="M4 16V5a1 1 0 0 1 1-1h11"/>',
  back: '<rect x="3" y="3" width="13" height="13" rx="2"/><path d="M20 8v11a1 1 0 0 1-1 1H8"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  unlock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
  layout: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>',
  palette: '<circle cx="13.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="10.5" r="1.5"/><circle cx="8.5" cy="7.5" r="1.5"/><circle cx="6.5" cy="12.5" r="1.5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.7-.8 1.7-1.7 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.9.8-1.7 1.7-1.7H17c3 0 5.6-2.5 5.6-5.6C22 6 17.5 2 12 2z"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  sparkles: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  wand: '<path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8l1.4 1.4M17.8 6.2l1.4-1.4M12.2 6.2l-1.4-1.4"/><path d="M3 21l9-9"/>',
  alignLeft: '<line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/>',
  alignCenter: '<line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="18" y1="18" x2="6" y2="18"/>',
  alignRight: '<line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/>',
  alignJustify: '<line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/>',
  eraser: '<path d="M20 20H7L3 16a1.4 1.4 0 0 1 0-2L13 4a1.4 1.4 0 0 1 2 0l5 5a1.4 1.4 0 0 1 0 2l-9 9"/><line x1="6" y1="11" x2="13" y2="18"/>',
  grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
  pages: '<rect x="8" y="2" width="13" height="17" rx="2"/><path d="M16 22H5a2 2 0 0 1-2-2V7"/>',
  search: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  dice: '<rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.3" fill="currentColor"/>',
  expand: '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>',
  close: '<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>',
};
function icon(name, cls = 'ico') {
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ''}</svg>`;
}
const iconEl = (name, cls) => { const t = document.createElement('template'); t.innerHTML = icon(name, cls); return t.content.firstChild; };

/* ---------- Fonts ---------- */
const FONTS = [
  ['Inter', 'sans-serif'], ['Roboto', 'sans-serif'], ['Open Sans', 'sans-serif'], ['Lato', 'sans-serif'],
  ['Montserrat', 'sans-serif'], ['Poppins', 'sans-serif'], ['Raleway', 'sans-serif'], ['Nunito', 'sans-serif'],
  ['Source Sans 3', 'sans-serif'], ['Work Sans', 'sans-serif'], ['Oswald', 'sans-serif'], ['Playfair Display', 'serif'],
  ['Merriweather', 'serif'], ['Lora', 'serif'], ['EB Garamond', 'serif'], ['DM Serif Display', 'serif'],
  ['Roboto Mono', 'monospace'], ['Great Vibes', 'cursive'], ['Georgia', 'serif'], ['Arial', 'sans-serif'],
  ['Times New Roman', 'serif'],
];
const fontStack = (f) => {
  if (!f) return 'sans-serif';
  if (f.includes(',')) return f;
  const e = FONTS.find((x) => x[0] === f);
  return `'${f}', ${e ? e[1] : 'sans-serif'}`;
};
const fontName = (stack) => String(stack || '').split(',')[0].replace(/["']/g, '').trim();

/* =====================================================================================================
   TEMPLATES — registry, schema and variant knobs
   =====================================================================================================

   Templates are plain configuration objects. They are registered with registerTemplates([...]) from
   js/templates/<category>.js (one file per category, loaded after this file and before render.js).
   Optional template-specific CSS lives in css/templates/<category>.css (loaded after
   css/template-variants.css, so equal-specificity rules there win).

   ---------------------------------------------------------------------------------------------------
   TEMPLATE SCHEMA
   ---------------------------------------------------------------------------------------------------
   {
     id:        'harbor-pro',          // REQUIRED, unique, [a-z0-9-]. Becomes the page class .tpl-<id>
     name:      'Harbor Pro',          // REQUIRED, shown in the gallery
     category:  'professional',        // REQUIRED, one of TEMPLATE_CATEGORIES ids (see below)
     desc:      'Navy band, timeline', // REQUIRED, max 4 words (gallery subtitle)
     tags:      ['two-column', 'photo'], // optional free tags used by search; known tags:
                                         //   'two-column' 'one-column' 'photo' 'one-page' 'ats' 'dark-sidebar'
                                         //   'serif' 'sans' 'monospace' 'colorful' 'gradient' 'timeline' 'compact'
                                         //   ('two-column'/'one-column', 'photo' and 'ats' are added automatically)
     layout:    'single' | 'left' | 'right', // one column, or sidebar on the left / right
     header:    'top' | 'side',        // 'side' puts name/photo/contacts at the top of the sidebar (two-column only)
     accent:    '#1d4ed8',             // REQUIRED main color (#rrggbb). The user can change it.
     accent2:   '#0f172a',             // optional secondary color → CSS var --accent-2 (gradients, corners).
                                       //   Default: a darker shade of the accent.
     fontHead:  'Montserrat',          // heading font, a FONTS entry (js/data.js)
     fontBody:  'Open Sans',           // body font, a FONTS entry
     skillStyle:'bar' | 'dots' | 'tags' | 'text', // how rated skills render
     sideW:     32,                    // optional sidebar width in % (22–45), two-column only (default 33)
     titlePrefix: '// ',               // optional text put in front of every section title
     v: { ...variant knobs, see TEMPLATE_KNOBS below },  // the LOOK. Missing knobs use their default.
     vars: { '--side-bg': '#0f172a' }, // optional CSS custom properties set on the page (keys must start with --)
   }
   Legacy flag sideDark:true is still accepted and means v.side = 'dark'.

   ---------------------------------------------------------------------------------------------------
   VARIANT KNOBS (template.v)  — each becomes a class on the page: <prefix>-<value>
   ---------------------------------------------------------------------------------------------------
   The user can override header/title/entry/side/contacts/photo/bullets/density/decor/nameCase/chips/role
   in the Design panel (design.overrides). Values, with the class prefix in brackets:

   header [hv-]  name / photo / contacts block. With header:'side' it styles the block at the top of the sidebar.
     plain-left    photo, name and role left aligned, contacts in a row below (default)
     centered      everything centered in a column
     band          full-width accent band, white text (side: accent block at the top of the sidebar)
     band-centered accent band with centered content
     band-dark     full-width near-black band, white name, accent role
     gradient      accent → accent-2 diagonal gradient band, white text
     tinted        light accent tint background with a hairline below
     split         name left, contacts stacked in a right column with a divider (side: like plain-left)
     boxed         header framed by an accent border box
     underline     thick accent rule under the header
     leftbar       thick accent bar to the left of the name
     photo-right   photo on the right, name and contacts on the left (side: like centered)
     compact       small one-line name + role, small photo, tight spacing

   title [ts-]   section titles
     underline-short caps accent title with a short accent bar below (default)
     caps-accent   caps accent title, no rule
     underline-full caps title with a full-width rule below
     line-after    title followed by a hairline filling the rest of the line
     ruled-both    centered title with rules on both sides
     centered      centered caps title with a short centered bar
     bar-left      thick vertical accent bar left of the title
     pill          title in a filled accent pill
     boxed         title in a full-width tinted box with border
     highlight     marker-pen highlight behind the title text
     dotted        caps title over a dotted rule
     plain-bold    bold title in sentence case, ink color, no rule
     numbered      01, 02 … numbers in accent before each title (numbers continue across pages, per column)
     overline      thick rule above the title

   entry [ev-]   experience / education entries
     classic       title + subtitle left, date right (default)
     timeline      vertical line with dots on the left (main column)
     date-left     date in a narrow left column (main column; sidebar entries stay classic)
     card          entry in a light tinted card with rounded corners
     compact       title | subtitle on one line, date right, tight
     inline-date   date under the title in accent color
     date-pill     date in a small accent pill on the right
     ruled         hairline separators between entries

   side [sv-]    sidebar surface (two-column layouts only)
     tint          light accent tint (default)
     plain         no background, hairline divider between the columns
     none          no background, no divider
     bordered      very light background with an accent edge next to the main column
     dark          deep accent-tinted navy, light text (dark surface)
     dark-accent-titles  neutral dark with titles in accent (dark surface)
     accent        solid (slightly deepened) accent color, white text (dark surface)
     gradient      vertical accent → accent-2 gradient, white text (dark surface)

   contacts [cv-]
     icons         icon + text, wrapping row (default)
     inline        text separated by • , no icons
     pills         each contact in a rounded chip
     stacked       one per line with icons
     text-labels   "Email: …" labels, no icons
     badges        icons inside small filled accent circles

   photo [ph-]
     circle (default) | rounded | square | hexagon | ring (accent ring) | offset (accent offset shadow)
     none-default  photo hidden unless the user forces a shape in the Design panel (use for ATS templates)

   density [dn-]   compact | normal (default) | airy  — scales page margins, spacing and line height
   bullets [bl-]   disc (default) | dash | arrow | check | square | circle | none
   decor   [pd-]   page decoration drawn on every page, inside the margins only:
     none (default) | top-stripe | bottom-stripe | left-stripe | corner (top-right triangle)
     corners (top-right + bottom-left triangles, the second in accent-2) | frame (thin inset frame)
   nameCase [nc-]  normal (default) | upper
   chips   [cs-]   skill / tag chips: soft (default) | outline | solid | square
   role    [rs-]   job title under the name: accent (default) | muted | caps | italic

   Numeric knobs (CSS variables, no class):
     nameScale   0.6–1.6  multiplies the name size        → --name-scale
     nameWeight  300–900  name font weight                → --name-weight
     titleScale  0.8–1.4  multiplies section title size   → --title-scale
     photoSize   16–40    photo size in mm                → --photo-size

   ---------------------------------------------------------------------------------------------------
   CSS VARIABLES (set them in vars:{} or in css/templates/<category>.css on .tpl-<id>)
   ---------------------------------------------------------------------------------------------------
   Colors used by every element (redefined automatically on dark surfaces — never hard-code text colors):
     --c-name  name           --c-role   job title      --c-title section titles   --c-line  title rules
     --c-ink   entry titles   --c-text   body text      --c-sub   subtitles/contacts --c-date dates
     --c-acc   accent on the current surface (icons, bars, dots)   --c-on-acc text on --c-acc fills
     --c-rule  neutral hairlines   --c-card card / box backgrounds   --c-mark highlight marker
     --c-line-soft hairline rules (line-after, numbered, compact separators)   --c-tint light tint surface
     --c-photo-bg / --c-photo-fg / --c-photo-line  photo background, initials and border colors; --photo-bw border width
     --c-chip-bg / --c-chip-fg / --c-chip-line chips    --c-track / --c-dot-off  empty part of bars / dots
   Surfaces (each header style has its own background variable too):
     --head-bg (band, band-centered)  --head-dark (band-dark)  --head-tint (tinted); gradient = --accent → --accent-2
     --head-name, --head-role, --head-fill   name, role and icon colors on band/gradient headers
     Each sidebar style has its OWN background variable, so a color set for one style never leaks into another:
     --side-tint (tint)  --side-soft (bordered)  --side-bg (dark, dark-accent-titles)  --side-solid (accent)
     --side-grad / --side-grad-2 (gradient top / bottom)
     --side-fill  accent used on dark sidebars (bars, dots, icons, role)   --side-on-fill text on --side-fill fills
     --side-title section title color on dark sidebars --side-edge  accent edge of the bordered sidebar
     --side-rule  divider color of the plain sidebar
     --decor-c   page decoration color                  --accent-2  secondary color
     --col-pt    column top padding (when the header is in the sidebar)   --date-w  date column width (date-left)

   ---------------------------------------------------------------------------------------------------
   RULES FOR TEMPLATE CSS (css/templates/<category>.css)
   ---------------------------------------------------------------------------------------------------
   1. Scope every rule to .tpl-<id>. Set colors through the variables above on .tpl-<id> — never
      `color:`/`background:` on inner elements unless qualified by the knob class (rule 2), otherwise a
      dark sidebar or band chosen by the user will get dark-on-dark text.
   2. A tweak to something a knob controls must be qualified with the knob class, e.g.
      .tpl-x.hv-band .name {…}, .tpl-x.ts-pill .sec-title h2 {…}, .tpl-x.sv-dark .col-side {…}
      so it switches off when the user overrides that knob in the Design panel.
   3. No visible content in ::before/::after (canvas conversion and PDF export cannot capture it).
   4. Never change .page / .pg-cols / .col sizes, overflow or positioning, and do not add absolutely
      positioned or negative-margin decorations inside columns: pagination measures the columns.
   5. Fonts must come from FONTS (index.html loads them). Keep text contrast ≥ 4.5:1 on colored surfaces.
   6. Check with /tmp/rs-tools/contact-sheet.js (also --long and --photo) and variant-sheet.js.
   ===================================================================================================== */

const TEMPLATE_CATEGORIES = [
  { id: 'modern', name: 'Modern', desc: 'Fresh layouts with confident color' },
  { id: 'professional', name: 'Professional', desc: 'Polished, corporate-ready designs' },
  { id: 'creative', name: 'Creative', desc: 'Expressive shapes and color' },
  { id: 'minimal', name: 'Minimal', desc: 'Whitespace-first and understated' },
  { id: 'executive', name: 'Executive', desc: 'Senior leadership presence' },
  { id: 'tech', name: 'Tech', desc: 'For engineers and data roles' },
  { id: 'academic', name: 'Academic', desc: 'CVs for research and teaching' },
  { id: 'ats', name: 'ATS-friendly', desc: 'Parser-friendly single column' },
  { id: 'elegant', name: 'Elegant', desc: 'Refined serif typography' },
];

/** Variant knobs: key in template.v / design.overrides → class prefix, label, default and allowed values. */
const TEMPLATE_KNOBS = {
  header: { cls: 'hv', label: 'Header style', def: 'plain-left', values: [
    ['plain-left', 'Plain, left aligned'], ['centered', 'Centered'], ['band', 'Accent band'], ['band-centered', 'Accent band, centered'],
    ['band-dark', 'Dark band'], ['gradient', 'Gradient band'], ['tinted', 'Tinted background'], ['split', 'Split (contacts right)'],
    ['boxed', 'Boxed'], ['underline', 'Underlined'], ['leftbar', 'Accent bar left'], ['photo-right', 'Photo on the right'], ['compact', 'Compact'],
  ] },
  title: { cls: 'ts', label: 'Section titles', def: 'underline-short', values: [
    ['underline-short', 'Short underline'], ['caps-accent', 'Caps, accent'], ['underline-full', 'Full underline'], ['line-after', 'Line after title'],
    ['ruled-both', 'Ruled both sides'], ['centered', 'Centered'], ['bar-left', 'Bar on the left'], ['pill', 'Pill'], ['boxed', 'Boxed'],
    ['highlight', 'Highlighter'], ['dotted', 'Dotted rule'], ['plain-bold', 'Plain bold'], ['numbered', 'Numbered'], ['overline', 'Thick rule above'],
  ] },
  entry: { cls: 'ev', label: 'Entry layout', def: 'classic', values: [
    ['classic', 'Classic (date right)'], ['timeline', 'Timeline'], ['date-left', 'Date column left'], ['card', 'Cards'],
    ['compact', 'Compact one-line'], ['inline-date', 'Date under title'], ['date-pill', 'Date pill'], ['ruled', 'Separated by rules'],
  ] },
  side: { cls: 'sv', label: 'Sidebar style', def: 'tint', twoColOnly: true, values: [
    ['tint', 'Light tint'], ['plain', 'Plain with divider'], ['none', 'No background'], ['bordered', 'Accent edge'],
    ['dark', 'Dark'], ['dark-accent-titles', 'Dark, accent titles'], ['accent', 'Solid accent'], ['gradient', 'Gradient'],
  ] },
  contacts: { cls: 'cv', label: 'Contacts', def: 'icons', values: [
    ['icons', 'Icons'], ['inline', 'Inline, separated'], ['pills', 'Pills'], ['stacked', 'Stacked'], ['text-labels', 'Text labels'], ['badges', 'Icon badges'],
  ] },
  photo: { cls: 'ph', label: 'Photo shape', def: 'circle', values: [
    ['circle', 'Circle'], ['rounded', 'Rounded square'], ['square', 'Square'], ['hexagon', 'Hexagon'], ['ring', 'Circle with ring'],
    ['offset', 'Offset shadow'], ['none-default', 'Hidden'],
  ] },
  bullets: { cls: 'bl', label: 'Bullets', def: 'disc', values: [
    ['disc', 'Dots'], ['dash', 'Dashes'], ['arrow', 'Arrows'], ['check', 'Checks'], ['square', 'Squares'], ['circle', 'Circles'], ['none', 'None'],
  ] },
  density: { cls: 'dn', label: 'Density', def: 'normal', values: [['compact', 'Compact'], ['normal', 'Normal'], ['airy', 'Airy']] },
  decor: { cls: 'pd', label: 'Page decoration', def: 'none', values: [
    ['none', 'None'], ['top-stripe', 'Top stripe'], ['bottom-stripe', 'Bottom stripe'], ['left-stripe', 'Left stripe'],
    ['corner', 'Corner'], ['corners', 'Two corners'], ['frame', 'Frame'],
  ] },
  nameCase: { cls: 'nc', label: 'Name case', def: 'normal', values: [['normal', 'As typed'], ['upper', 'Uppercase']] },
  chips: { cls: 'cs', label: 'Chips', def: 'soft', values: [['soft', 'Soft'], ['outline', 'Outline'], ['solid', 'Solid'], ['square', 'Square']] },
  role: { cls: 'rs', label: 'Job title', def: 'accent', values: [['accent', 'Accent'], ['muted', 'Muted'], ['caps', 'Spaced caps'], ['italic', 'Italic']] },
};
/** Numeric knobs → CSS variable, allowed range. */
const TEMPLATE_NUM_KNOBS = {
  nameScale: { css: '--name-scale', min: 0.6, max: 1.6 },
  nameWeight: { css: '--name-weight', min: 300, max: 900 },
  titleScale: { css: '--title-scale', min: 0.8, max: 1.4 },
  photoSize: { css: '--photo-size', min: 16, max: 40, unit: 'mm' },
};
/** Knobs the user can override in the Design panel (design.overrides keys). */
const OVERRIDE_KEYS = ['header', 'title', 'entry', 'side', 'contacts', 'photo', 'bullets', 'density', 'decor', 'nameCase', 'chips', 'role'];
const knobValid = (k, v) => !!(TEMPLATE_KNOBS[k] && TEMPLATE_KNOBS[k].values.some((x) => x[0] === v));
const knobLabel = (k, v) => ((TEMPLATE_KNOBS[k] && TEMPLATE_KNOBS[k].values.find((x) => x[0] === v)) || [v, v])[1];
/** Dark sidebar surfaces (light text on a dark background). */
const DARK_SIDES = ['dark', 'dark-accent-titles', 'accent', 'gradient'];

const TEMPLATES = [];
const tplById = (id) => TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];

/** Validate, normalize and append templates. Invalid fields are fixed or dropped with a console.warn. */
function registerTemplates(list) {
  const catIds = TEMPLATE_CATEGORIES.map((c) => c.id);
  const fontNames = FONTS.map((f) => f[0]);
  let added = 0;
  (Array.isArray(list) ? list : [list]).forEach((raw) => {
    if (!raw || typeof raw !== 'object') return;
    const t = { ...raw };
    const where = `registerTemplates: template "${t.id}"`;
    if (typeof t.id !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(t.id)) { console.warn(`${where}: invalid id (use a-z, 0-9 and -), skipped`); return; }
    if (TEMPLATES.some((x) => x.id === t.id)) { console.warn(`${where}: duplicate id, skipped`); return; }
    if (!t.name) { console.warn(`${where}: missing name`); t.name = t.id; }
    if (!catIds.includes(t.category)) { console.warn(`${where}: unknown category "${t.category}", using "modern"`); t.category = 'modern'; }
    if (!t.desc) t.desc = '';
    else if (String(t.desc).trim().split(/\s+/).length > 4) console.warn(`${where}: desc should be at most 4 words`);
    if (!['single', 'left', 'right'].includes(t.layout)) { if (t.layout) console.warn(`${where}: invalid layout "${t.layout}"`); t.layout = 'single'; }
    if (t.header !== 'side' || t.layout === 'single') { if (t.header === 'side') console.warn(`${where}: header 'side' needs a two-column layout`); t.header = 'top'; }
    if (!/^#[0-9a-f]{6}$/i.test(t.accent || '')) { console.warn(`${where}: accent must be #rrggbb`); t.accent = '#2b4c7e'; }
    if (t.accent2 != null && !/^#[0-9a-f]{6}$/i.test(t.accent2)) { console.warn(`${where}: accent2 must be #rrggbb`); delete t.accent2; }
    ['fontHead', 'fontBody'].forEach((k) => {
      if (!t[k]) t[k] = 'Inter';
      else if (!fontNames.includes(t[k]) && !String(t[k]).includes(',')) console.warn(`${where}: ${k} "${t[k]}" is not in FONTS (it will not be loaded)`);
    });
    if (!['bar', 'dots', 'tags', 'text'].includes(t.skillStyle)) { if (t.skillStyle) console.warn(`${where}: invalid skillStyle`); t.skillStyle = 'bar'; }
    if (t.sideW != null && !(t.sideW >= 22 && t.sideW <= 45)) { console.warn(`${where}: sideW must be 22–45`); delete t.sideW; }
    const v = {};
    if (t.sideDark) v.side = 'dark';
    Object.entries(t.v || {}).forEach(([k, val]) => {
      if (TEMPLATE_KNOBS[k]) {
        if (knobValid(k, val)) v[k] = val; else console.warn(`${where}: invalid v.${k} "${val}"`);
      } else if (TEMPLATE_NUM_KNOBS[k]) {
        const n = TEMPLATE_NUM_KNOBS[k];
        if (typeof val === 'number' && val >= n.min && val <= n.max) v[k] = val; else console.warn(`${where}: v.${k} must be a number ${n.min}–${n.max}`);
      } else console.warn(`${where}: unknown knob v.${k}`);
    });
    t.v = v;
    const vars = {};
    Object.entries(t.vars || {}).forEach(([k, val]) => {
      if (/^--[\w-]+$/.test(k) && val != null && !/[;{}<>]/.test(String(val))) vars[k] = String(val); else console.warn(`${where}: invalid var "${k}"`);
    });
    t.vars = vars;
    const tags = new Set((Array.isArray(t.tags) ? t.tags : []).map((x) => String(x).toLowerCase()));
    tags.delete('one-column'); tags.delete('two-column');
    tags.add(t.layout === 'single' ? 'one-column' : 'two-column');
    if ((v.photo || TEMPLATE_KNOBS.photo.def) === 'none-default') tags.delete('photo'); else tags.add('photo');
    if (t.category === 'ats') tags.add('ats');
    t.tags = [...tags];
    TEMPLATES.push(t);
    added++;
  });
  return added;
}

/* The original templates (kept ids & looks; their bespoke CSS lives in css/templates.css).
   Executive and Tech used to say layout:'right' but always rendered the sidebar on the left; 'right' now really puts
   the sidebar on the right, so they are declared 'left' to keep their look. */
registerTemplates([
  { id: 'aurora', name: 'Aurora', category: 'modern', desc: 'Modern dark sidebar', tags: ['dark-sidebar', 'sans'], layout: 'left', header: 'side', accent: '#2b4c7e', fontHead: 'Montserrat', fontBody: 'Open Sans', skillStyle: 'bar', sideW: 34,
    v: { header: 'centered', side: 'dark', title: 'line-after', photoSize: 34 } },
  { id: 'executive', name: 'Executive', category: 'executive', desc: 'Bold header band', tags: ['colorful', 'sans'], layout: 'left', header: 'top', accent: '#1d4ed8', fontHead: 'Montserrat', fontBody: 'Lato', skillStyle: 'dots', sideW: 32,
    v: { header: 'band', title: 'underline-full', side: 'tint', nameCase: 'upper' } },
  { id: 'classic', name: 'Classic', category: 'professional', desc: 'Timeless serif', tags: ['serif'], layout: 'single', header: 'top', accent: '#1e3a5f', fontHead: 'EB Garamond', fontBody: 'Lora', skillStyle: 'text',
    v: { header: 'centered', title: 'underline-full', role: 'italic' } },
  { id: 'minimal', name: 'Minimal', category: 'minimal', desc: 'Clean & airy', tags: ['sans'], layout: 'single', header: 'top', accent: '#0f766e', fontHead: 'Inter', fontBody: 'Inter', skillStyle: 'tags',
    v: { header: 'plain-left', title: 'underline-short', role: 'caps' } },
  { id: 'timeline', name: 'Timeline', category: 'creative', desc: 'Career timeline', tags: ['timeline', 'sans'], layout: 'left', header: 'top', accent: '#7c3aed', fontHead: 'Poppins', fontBody: 'Nunito', skillStyle: 'bar', sideW: 31,
    v: { header: 'plain-left', entry: 'timeline', side: 'tint', role: 'muted' } },
  { id: 'tech', name: 'Tech', category: 'tech', desc: 'Developer focused', tags: ['dark-sidebar', 'monospace'], layout: 'left', header: 'top', accent: '#10b981', fontHead: 'Roboto Mono', fontBody: 'Source Sans 3', skillStyle: 'bar', titlePrefix: '// ', sideW: 32,
    v: { header: 'band-dark', title: 'underline-full', side: 'dark-accent-titles', chips: 'square', photo: 'rounded' } },
  { id: 'elegant', name: 'Elegant', category: 'elegant', desc: 'Refined & centered', tags: ['serif'], layout: 'single', header: 'top', accent: '#a67c52', fontHead: 'Playfair Display', fontBody: 'Lato', skillStyle: 'text',
    v: { header: 'centered', title: 'centered', role: 'caps' } },
  { id: 'bold', name: 'Bold', category: 'modern', desc: 'High-impact header', tags: ['colorful', 'sans'], layout: 'left', header: 'top', accent: '#f97316', fontHead: 'Oswald', fontBody: 'Roboto', skillStyle: 'dots', sideW: 32,
    v: { header: 'band-dark', side: 'tint', entry: 'date-pill', nameCase: 'upper', photo: 'rounded', role: 'caps' } },
]);

const ACCENTS = ['#2b4c7e', '#1d4ed8', '#0891b2', '#0f766e', '#10b981', '#7c3aed', '#db2777', '#be123c', '#f97316', '#a67c52', '#334155', '#111827'];

/* ---------- Section presets ---------- */
const SECTION_PRESETS = {
  profile: { title: 'Profile', type: 'text', column: 'main', label: 'Profile / Summary' },
  experience: { title: 'Experience', type: 'entries', column: 'main', labels: { title: 'Job title', subtitle: 'Company' }, label: 'Work Experience' },
  education: { title: 'Education', type: 'entries', column: 'main', labels: { title: 'Degree', subtitle: 'School / University' }, label: 'Education' },
  projects: { title: 'Projects', type: 'entries', column: 'main', labels: { title: 'Project', subtitle: 'Role / Technologies' }, label: 'Projects' },
  skills: { title: 'Skills', type: 'skills', column: 'side', label: 'Skills (with level)' },
  languages: { title: 'Languages', type: 'skills', column: 'side', label: 'Languages' },
  certifications: { title: 'Certifications', type: 'entries', column: 'side', labels: { title: 'Certificate', subtitle: 'Issuer' }, label: 'Certifications' },
  awards: { title: 'Awards', type: 'entries', column: 'main', labels: { title: 'Award', subtitle: 'Organization' }, label: 'Awards & Honors' },
  volunteering: { title: 'Volunteering', type: 'entries', column: 'main', labels: { title: 'Role', subtitle: 'Organization' }, label: 'Volunteering' },
  publications: { title: 'Publications', type: 'entries', column: 'main', labels: { title: 'Title', subtitle: 'Publisher' }, label: 'Publications' },
  references: { title: 'References', type: 'entries', column: 'main', labels: { title: 'Name', subtitle: 'Position / Company' }, label: 'References' },
  interests: { title: 'Interests', type: 'tags', column: 'side', label: 'Interests / Hobbies' },
  tools: { title: 'Tools', type: 'tags', column: 'side', label: 'Tools / Keywords list' },
  customText: { title: 'Custom Section', type: 'text', column: 'main', label: 'Custom text section' },
  customEntries: { title: 'Custom Section', type: 'entries', column: 'main', labels: { title: 'Title', subtitle: 'Subtitle' }, label: 'Custom entries section' },
};

function newItem(type) {
  if (type === 'skills') return { id: uid(), name: '', level: 4 };
  if (type === 'tags') return { id: uid(), name: '' };
  return { id: uid(), title: '', subtitle: '', location: '', date: '', description: '', fields: [] };
}
function newSection(key) {
  const p = SECTION_PRESETS[key] || SECTION_PRESETS.customEntries;
  const s = { id: uid(), title: p.title, type: p.type, column: p.column, visible: true, items: [], content: '' };
  if (p.labels) s.labels = { ...p.labels };
  if (p.type !== 'text') s.items.push(newItem(p.type));
  return s;
}

/* ---------- Default design + sample content ---------- */
/* overrides: per-knob look overrides chosen in the Design panel ({header, title, entry, side, contacts, photo, bullets,
   density, decor, nameCase, chips, role}); missing keys use the template default. Treat it as immutable: always assign a new
   object (design.overrides = {...design.overrides, k: v}) because older saved states share this default object. */
const DEFAULT_DESIGN = { template: 'aurora', accent: null, accent2: null, fontHead: null, fontBody: null, fontScale: 1, lineHeight: 1.45, margin: 12, gap: 16, sideWidth: null, showPhoto: true, skillStyle: 'auto', overrides: {} };

function sampleData() {
  const e = (title, subtitle, location, date, description) => ({ id: uid(), title, subtitle, location, date, description, fields: [] });
  const sk = (name, level) => ({ id: uid(), name, level });
  const tg = (name) => ({ id: uid(), name });
  return {
    personal: {
      name: 'Alexandra Morgan', title: 'Senior Product Designer', email: 'alex.morgan@email.com', phone: '+1 (415) 555-0142',
      location: 'San Francisco, CA', website: 'alexmorgan.design', linkedin: 'linkedin.com/in/alexmorgan', photo: '', extra: [],
    },
    sections: [
      { id: uid(), title: 'Profile', type: 'text', column: 'main', visible: true, items: [],
        content: 'Product designer with 8+ years of experience crafting intuitive digital products for SaaS and fintech companies. I combine user research, systems thinking and visual craft to ship experiences that move business metrics — and that people genuinely enjoy using.' },
      { id: uid(), title: 'Experience', type: 'entries', column: 'main', visible: true, labels: { title: 'Job title', subtitle: 'Company' }, items: [
        e('Senior Product Designer', 'Lumen Financial', 'San Francisco, CA', 'Mar 2021 – Present',
          '- Led the end-to-end redesign of the mobile banking app, lifting the **App Store rating from 3.9 to 4.7**\n- Built and scaled a design system of 120+ components adopted by 6 product teams\n- Mentored 4 designers and introduced a weekly design critique practice'),
        e('Product Designer', 'Brightloop', 'Remote', 'Jun 2018 – Feb 2021',
          '- Designed onboarding flows that increased trial-to-paid conversion by **22%**\n- Partnered with engineering to ship 30+ features across web and iOS\n- Ran 50+ usability sessions and turned insights into roadmap priorities'),
        e('UX Designer', 'Northwind Studio', 'Austin, TX', 'Aug 2016 – May 2018',
          '- Delivered UX for 15 client projects in retail, health and education\n- Prototyped interactive concepts in Figma and Framer for stakeholder reviews'),
      ] },
      { id: uid(), title: 'Education', type: 'entries', column: 'main', visible: true, labels: { title: 'Degree', subtitle: 'School / University' }, items: [
        e('B.F.A. Interaction Design', 'California College of the Arts', 'San Francisco', '2012 – 2016', 'Graduated with honors. Thesis on accessible interfaces for older adults.'),
      ] },
      { id: uid(), title: 'Skills', type: 'skills', column: 'side', visible: true, items: [
        sk('Product Strategy', 5), sk('UI & Visual Design', 5), sk('Design Systems', 5), sk('User Research', 4), sk('Prototyping', 4), sk('HTML / CSS', 3),
      ] },
      { id: uid(), title: 'Languages', type: 'skills', column: 'side', visible: true, items: [sk('English', 5), sk('Spanish', 4), sk('French', 2)] },
      { id: uid(), title: 'Certifications', type: 'entries', column: 'side', visible: true, labels: { title: 'Certificate', subtitle: 'Issuer' }, items: [
        e('Google UX Design Certificate', 'Coursera', '', '2022', ''),
        e('Certified Usability Analyst', 'Human Factors International', '', '2020', ''),
      ] },
      { id: uid(), title: 'Interests', type: 'tags', column: 'side', visible: true, items: [tg('Photography'), tg('Ceramics'), tg('Trail running'), tg('Typography')] },
    ],
  };
}

function blankData() {
  return {
    personal: { name: 'Your Name', title: 'Your Professional Title', email: '', phone: '', location: '', website: '', linkedin: '', photo: '', extra: [] },
    sections: ['profile', 'experience', 'education', 'skills'].map(newSection),
  };
}
