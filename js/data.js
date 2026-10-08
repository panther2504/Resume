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

/* ---------- Templates ---------- */
const TEMPLATES = [
  { id: 'aurora', name: 'Aurora', desc: 'Modern dark sidebar', layout: 'left', header: 'side', sideDark: true, accent: '#2b4c7e', fontHead: 'Montserrat', fontBody: 'Open Sans', skillStyle: 'bar', sideW: 34 },
  { id: 'executive', name: 'Executive', desc: 'Bold header band', layout: 'right', header: 'top', accent: '#1d4ed8', fontHead: 'Montserrat', fontBody: 'Lato', skillStyle: 'dots', sideW: 32 },
  { id: 'classic', name: 'Classic', desc: 'Timeless serif', layout: 'single', header: 'top', accent: '#1e3a5f', fontHead: 'EB Garamond', fontBody: 'Lora', skillStyle: 'text' },
  { id: 'minimal', name: 'Minimal', desc: 'Clean & airy', layout: 'single', header: 'top', accent: '#0f766e', fontHead: 'Inter', fontBody: 'Inter', skillStyle: 'tags' },
  { id: 'timeline', name: 'Timeline', desc: 'Career timeline', layout: 'left', header: 'top', accent: '#7c3aed', fontHead: 'Poppins', fontBody: 'Nunito', skillStyle: 'bar', sideW: 31 },
  { id: 'tech', name: 'Tech', desc: 'Developer focused', layout: 'right', header: 'top', sideDark: true, accent: '#10b981', fontHead: 'Roboto Mono', fontBody: 'Source Sans 3', skillStyle: 'bar', titlePrefix: '// ', sideW: 32 },
  { id: 'elegant', name: 'Elegant', desc: 'Refined & centered', layout: 'single', header: 'top', accent: '#a67c52', fontHead: 'Playfair Display', fontBody: 'Lato', skillStyle: 'text' },
  { id: 'bold', name: 'Bold', desc: 'High-impact header', layout: 'left', header: 'top', accent: '#f97316', fontHead: 'Oswald', fontBody: 'Roboto', skillStyle: 'dots', sideW: 32 },
];
const tplById = (id) => TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];

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
const DEFAULT_DESIGN = { template: 'aurora', accent: null, fontHead: null, fontBody: null, fontScale: 1, lineHeight: 1.45, margin: 12, gap: 16, sideWidth: null, showPhoto: true, skillStyle: 'auto' };

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
