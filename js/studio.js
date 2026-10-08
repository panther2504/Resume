/* Resume Studio — Image Studio: photo/image crop, rotate, flip, filters & adjustments (ImageStudio)

  A dependency-free modal editor plus headless geometry / bake helpers. Uses h() and ICONS from data.js.

  ── Modal ────────────────────────────────────────────────────────────────────────────────────────
  ImageStudio.open(opts) → Promise<result | null>          (null when cancelled)
    opts = {
      src:          string             ORIGINAL image (data URL). Missing/empty → a file picker opens first
                                       (resolves null when the picker is cancelled).
      edit?:        EditState | null   previous state to restore
      title?:       string             default 'Edit image'
      mode?:        'photo' | 'image'  default 'image'. 'photo' = 1:1 frame with Circle / Rounded / Square shapes.
      aspect?:      number | null      initial frame aspect (w / h). photo default 1, image default = natural aspect.
      lockAspect?:  boolean            hide the aspect chooser (image mode)
      shape?:       'circle' | 'rounded' | 'square' | 'rect'   initial frame shape (display mask only)
      maxOutput?:   number             longest side of the baked output in px, default 1000
      allowReplace?: boolean           default true (file picker + drop an image file on the stage)
    }
    result = { dataURL, original, edit, aspect, shape, width, height }
      dataURL  baked crop: JPEG q 0.9, or PNG when the result has transparency (transparent background / PNG alpha)
      original the original source (a new one if the user replaced it) — keep it to re-edit losslessly
      edit     JSON-serialisable EditState; aspect = frame w / h; shape = chosen mask (apply it with CSS:
               ImageStudio.shapeRadius(shape) gives the matching border-radius); width/height = output px.
  ImageStudio.isOpen() → boolean;  ImageStudio.close() cancels an open editor (its promise resolves null).
  ImageStudio.session → the open editor ({ state, apply(), cancel() }) or null — for inspection / tests.
  Keys: Esc cancel · Enter apply · arrows nudge (Shift ×10) · + / − zoom · 0 reset view · hold \ compare ·
        Ctrl+Z / Ctrl+Shift+Z undo / redo inside the editor (app shortcuts are blocked while it is open).

  ── Headless helpers ─────────────────────────────────────────────────────────────────────────────
  ImageStudio.bake(original, edit, { aspect, maxOutput }) → Promise<{ dataURL, width, height, type }>
      Same pixels as Apply. aspect defaults to the natural aspect of the (quarter-turn rotated) image.
  ImageStudio.defaultEdit() → EditState
  ImageStudio.presets → [{ id, name, adjust }]
  ImageStudio.applyPreset(edit, presetId, amount = 100) → new EditState (adjust = preset × amount %)
  ImageStudio.readFile(file, maxSide = 2000) → Promise<dataURL>   downsizes to maxSide, keeps PNG transparency
  ImageStudio.loadImage(src) → Promise<HTMLImageElement>
  ImageStudio.place(edit, natW, natH, frameW, frameH) → CSS for an <img> (natural aspect) inside an
      overflow:hidden, position:relative frame of frameW × frameH px so it looks like the baked result:
      { width, height, left, top, transform, filter, position, transformOrigin, maxWidth, maxHeight, objectFit }
      (all strings — Object.assign(img.style, place(...)) works). Vignette is not included: put a child
      overlay over the frame with background = ImageStudio.vignetteCSS(edit). With blur > 0 in cover mode
      bake() blurs over the sharp image so the edges stay opaque; to mirror that exactly, put a second <img>
      placed with the same edit but adjust.blur = 0 underneath.
  ImageStudio.pan(edit, dxPx, dyPx, natW, natH, frameW, frameH) → new EditState (clamped)
  ImageStudio.zoom(edit, factor, anchorX, anchorY, natW, natH, frameW, frameH) → new EditState (clamped);
      anchor in frame px from the frame's top-left (omit → frame centre).
  ImageStudio.clamp(edit, natW, natH, frameW, frameH) → new EditState
  ImageStudio.cssFilter(edit, frameLongSide = 400) → CSS filter string ('none' when nothing to do).
      Warmth is an SVG feColorMatrix referenced as url(#ims-warm-…), injected into the document on demand,
      so the string only works inside this document (use the baked dataURL for export/printing).
  ImageStudio.vignetteCSS(edit) → CSS background ('' when none);  ImageStudio.shapeRadius(shape) → CSS radius
  ImageStudio.outputSize(edit, natW, natH, aspect, maxOutput) → { width, height }

  ── EditState (v 1) ──────────────────────────────────────────────────────────────────────────────
  { v: 1, zoom, panX, panY, rot, flipH, flipV, fit, bg, preset, amount, adjust }
    fit    'cover' — the image always covers the frame (zoom 1 = smallest scale that fills the frame at the
           current rotation, so straightening never shows empty corners); 'contain' — zoom 1 = the whole
           (rotated) image fits inside the frame, the rest is filled with bg.
    zoom   multiplier of that base scale: cover 1…10, contain 0.25…10.
    panX/Y the source point shown at the frame centre, relative to the image centre, as fractions of the
           image's natural width / height (unrotated, unflipped). 0,0 = centred; panX 0.25 = the crop is
           centred 75 % across the source. Independent of frame size and aspect, so a state stays valid
           when the frame is resized or its aspect changes (it is re-clamped).
    rot    clockwise rotation in degrees (quarter turns + straighten), normalised to (-180, 180].
    flipH/flipV  mirror the source image (applied before rotation). The UI flips what you see by toggling
           the flag and negating rot, so either way the state is self-consistent.
    bg     null (transparent) or a CSS colour painted behind the image (visible in contain mode / PNG alpha).
    preset id of the applied filter preset ('original' = none); amount = its intensity 0…100
           (informational: adjust already holds the resulting values; the sliders fine-tune on top).
    adjust { brightness -100…100, contrast -100…100, saturate -100…100, warmth -100…100, hue -180…180,
             sepia 0…100, grayscale 0…100, blur 0…100, vignette 0…100 } (all 0 = untouched).
           blur 100 = a Gaussian radius of 2 % of the frame's longest side.
  Pixel mapping (frame px, origin at frame centre): q = scale · R(rot) · F(flip) · (p − focus) where p is a
  source pixel relative to the image centre and scale = base · zoom.
*/

const ImageStudio = (() => {
  const RAD = Math.PI / 180;
  const MAX_ZOOM = 10;
  const MIN_CONTAIN = 0.25;
  const NS = 'http://www.w3.org/2000/svg';

  /* ---------- small utils ---------- */
  const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
  const lim = (v, a, b) => Math.min(b, Math.max(a, v));
  const r4 = (v) => Math.round(v * 10000) / 10000;
  const px = (v) => `${Math.round(v * 100) / 100}px`;
  const normRot = (r) => { r = ((r % 360) + 360) % 360; r = r > 180 ? r - 360 : r; return Math.abs(r) < 1e-9 ? 0 : r4(r); };
  const makeCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; };
  const notify = (msg) => { if (typeof toast === 'function') toast(msg); };

  /* ---------- edit state ---------- */
  const ADJUST = [
    { key: 'brightness', label: 'Brightness', min: -100, max: 100, group: 'Light' },
    { key: 'contrast', label: 'Contrast', min: -100, max: 100, group: 'Light' },
    { key: 'saturate', label: 'Saturation', min: -100, max: 100, group: 'Color' },
    { key: 'warmth', label: 'Warmth', min: -100, max: 100, group: 'Color' },
    { key: 'hue', label: 'Hue shift', min: -180, max: 180, group: 'Color', unit: '°' },
    { key: 'sepia', label: 'Sepia', min: 0, max: 100, group: 'Color' },
    { key: 'grayscale', label: 'Grayscale', min: 0, max: 100, group: 'Color' },
    { key: 'blur', label: 'Blur', min: 0, max: 100, group: 'Effects' },
    { key: 'vignette', label: 'Vignette', min: 0, max: 100, group: 'Effects' },
  ];
  const zeroAdjust = () => Object.fromEntries(ADJUST.map((a) => [a.key, 0]));

  function defaultEdit() {
    return { v: 1, zoom: 1, panX: 0, panY: 0, rot: 0, flipH: false, flipV: false, fit: 'cover', bg: null, preset: 'original', amount: 100, adjust: zeroAdjust() };
  }

  /** Returns a fresh, fully-populated and range-checked copy of any (partial) edit state. */
  function norm(edit) {
    const e = defaultEdit();
    if (!edit || typeof edit !== 'object') return e;
    e.fit = edit.fit === 'contain' ? 'contain' : 'cover';
    e.zoom = lim(num(edit.zoom, 1), e.fit === 'contain' ? MIN_CONTAIN : 1, MAX_ZOOM);
    e.panX = lim(num(edit.panX, 0), -100, 100); // sanity bound only; clamp() applies the real limits
    e.panY = lim(num(edit.panY, 0), -100, 100);
    e.rot = normRot(num(edit.rot, 0));
    e.flipH = !!edit.flipH;
    e.flipV = !!edit.flipV;
    e.bg = typeof edit.bg === 'string' && edit.bg && edit.bg !== 'transparent' ? edit.bg : null;
    e.preset = typeof edit.preset === 'string' && edit.preset ? edit.preset : 'original';
    e.amount = Math.round(lim(num(edit.amount, 100), 0, 100));
    const a = edit.adjust || {};
    for (const d of ADJUST) e.adjust[d.key] = Math.round(lim(num(a[d.key], 0), d.min, d.max));
    return e;
  }

  /* ---------- presets ---------- */
  const P = (id, name, adj) => ({ id, name, adjust: { ...zeroAdjust(), ...adj } });
  const presets = [
    P('original', 'Original', {}),
    P('portrait', 'Portrait', { brightness: 5, contrast: 8, saturate: 6, warmth: 12 }),
    P('bw', 'B&W', { grayscale: 100, contrast: 12 }),
    P('warm', 'Warm', { warmth: 55, saturate: 10, brightness: 3 }),
    P('cool', 'Cool', { warmth: -55, saturate: 4, brightness: 2 }),
    P('vivid', 'Vivid', { saturate: 55, contrast: 18, brightness: 2 }),
    P('vintage', 'Vintage', { sepia: 35, warmth: 25, contrast: -12, saturate: -20, brightness: 4, vignette: 45 }),
    P('fade', 'Fade', { contrast: -32, brightness: 10, saturate: -28 }),
    P('noir', 'Noir', { grayscale: 100, contrast: 45, brightness: -8, vignette: 55 }),
    P('soft', 'Soft', { contrast: -16, brightness: 8, saturate: -10, warmth: 8, blur: 6 }),
    P('dramatic', 'Dramatic', { contrast: 38, saturate: -18, brightness: -4, vignette: 40 }),
    P('sepia', 'Sepia', { sepia: 85, contrast: 5 }),
  ];

  function applyPreset(edit, id, amount = 100) {
    const p = presets.find((x) => x.id === id) || presets[0];
    const e = norm(edit);
    const k = lim(num(amount, 100), 0, 100) / 100;
    for (const d of ADJUST) e.adjust[d.key] = Math.round(p.adjust[d.key] * k);
    e.preset = p.id;
    e.amount = Math.round(k * 100);
    return e;
  }

  /* ---------- geometry ---------- */
  function geometry(edit, natW, natH, W, H) {
    const e = norm(edit);
    const th = e.rot * RAD, cos = Math.cos(th), sin = Math.sin(th), c = Math.abs(cos), s = Math.abs(sin);
    const cover = Math.max((W * c + H * s) / natW, (W * s + H * c) / natH);
    const contain = Math.min(W / (natW * c + natH * s), H / (natW * s + natH * c));
    const base = e.fit === 'contain' ? contain : cover;
    const scale = base * e.zoom;
    const fx = e.flipH ? -1 : 1, fy = e.flipV ? -1 : 1;
    const ux = fx * e.panX * natW, uy = fy * e.panY * natH;
    const tx = -scale * (cos * ux - sin * uy), ty = -scale * (sin * ux + cos * uy);
    return { e, natW, natH, W, H, th, cos, sin, cover, contain, base, scale, fx, fy, tx, ty, cx: W / 2 + tx, cy: H / 2 + ty };
  }

  // edit whose image centre sits at offset (tx, ty) from the frame centre at the given scale
  function withOffset(g, zoomV, tx, ty, scale) {
    const e = norm(g.e);
    e.zoom = zoomV;
    e.panX = (-g.fx * (g.cos * tx + g.sin * ty) / scale) / g.natW;
    e.panY = (-g.fy * (-g.sin * tx + g.cos * ty) / scale) / g.natH;
    return e;
  }

  function clamp(edit, natW, natH, W, H) {
    const e = norm(edit);
    const g = geometry(e, natW, natH, W, H);
    const c = Math.abs(g.cos), s = Math.abs(g.sin);
    if (e.fit === 'cover') {
      // the frame (seen in source space) must stay inside the image
      const ex = (W / 2 * c + H / 2 * s) / g.scale, ey = (W / 2 * s + H / 2 * c) / g.scale;
      const lx = Math.max(0, 0.5 - ex / natW), ly = Math.max(0, 0.5 - ey / natH);
      e.panX = lim(e.panX, -lx, lx);
      e.panY = lim(e.panY, -ly, ly);
      return e;
    }
    // contain: per axis keep the rotated image inside the frame when smaller, covering it when larger
    const bx = (natW * c + natH * s) * g.scale / 2, by = (natW * s + natH * c) * g.scale / 2;
    const lx = Math.abs(W / 2 - bx), ly = Math.abs(H / 2 - by);
    const tx = lim(g.tx, -lx, lx), ty = lim(g.ty, -ly, ly);
    if (Math.abs(tx - g.tx) < 1e-9 && Math.abs(ty - g.ty) < 1e-9) return e;
    return withOffset(g, e.zoom, tx, ty, g.scale);
  }

  function pan(edit, dx, dy, natW, natH, W, H) {
    const g = geometry(edit, natW, natH, W, H);
    return clamp(withOffset(g, g.e.zoom, g.tx + (dx || 0), g.ty + (dy || 0), g.scale), natW, natH, W, H);
  }

  function zoom(edit, factor, ax, ay, natW, natH, W, H) {
    const g = geometry(edit, natW, natH, W, H);
    const z = lim(g.e.zoom * (factor > 0 ? factor : 1), g.e.fit === 'contain' ? MIN_CONTAIN : 1, MAX_ZOOM);
    const k = z / g.e.zoom;
    const qx = (ax == null ? W / 2 : ax) - W / 2, qy = (ay == null ? H / 2 : ay) - H / 2;
    // keep the source point under the anchor where it is
    return clamp(withOffset(g, z, qx - k * (qx - g.tx), qy - k * (qy - g.ty), g.scale * k), natW, natH, W, H);
  }

  // true when the (rotated) image fully covers the frame
  function covers(edit, natW, natH, W, H) {
    const g = geometry(edit, natW, natH, W, H);
    if (g.scale < g.cover * (1 - 1e-6)) return false;
    const c = Math.abs(g.cos), s = Math.abs(g.sin);
    const ex = (W / 2 * c + H / 2 * s) / g.scale, ey = (W / 2 * s + H / 2 * c) / g.scale;
    return Math.abs(g.e.panX) <= 0.5 - ex / natW + 1e-6 && Math.abs(g.e.panY) <= 0.5 - ey / natH + 1e-6;
  }

  const naturalAspect = (edit, natW, natH) => (Math.round(norm(edit).rot / 90) % 2 ? natH / natW : natW / natH);

  function outputSize(edit, natW, natH, aspect, maxOutput = 1000) {
    const A = aspect > 0 ? aspect : naturalAspect(edit, natW, natH);
    const M = Math.max(16, num(maxOutput, 1000) || 1000);
    let W = A >= 1 ? M : M * A, H = A >= 1 ? M / A : M;
    const g = geometry(edit, natW, natH, W, H);
    if (g.scale > 2) { W *= 2 / g.scale; H *= 2 / g.scale; } // never upscale more than 2× the source
    return { width: Math.max(1, Math.round(W)), height: Math.max(1, Math.round(H)) };
  }

  /* ---------- colour pipeline (CSS filter ⇄ manual matrices, identical maths) ---------- */
  function colorSteps(a) {
    const s = [];
    if (a.warmth) s.push(['warm', Math.round(a.warmth)]);
    if (a.brightness) s.push(['brightness', r4(1 + a.brightness * 0.006)]);
    if (a.contrast) s.push(['contrast', r4(1 + a.contrast * 0.007)]);
    if (a.saturate) s.push(['saturate', r4(1 + a.saturate / 100)]);
    if (a.sepia) s.push(['sepia', r4(a.sepia / 100)]);
    if (a.hue) s.push(['hue-rotate', Math.round(a.hue)]);
    if (a.grayscale) s.push(['grayscale', r4(a.grayscale / 100)]);
    return s;
  }
  const warmMatrix = (v) => { const w = v / 100; return [1 + 0.12 * w, 0, 0, 0.03 * w, 0, 1 + 0.03 * w, 0, 0, 0, 0, 1 - 0.12 * w, -0.03 * w]; };

  // 3×4 matrix (rows r, g, b: [kr, kg, kb, offset 0…1]) for one step — CSS Filter Effects definitions
  function stepMatrix([t, v]) {
    switch (t) {
      case 'warm': return warmMatrix(v);
      case 'brightness': return [v, 0, 0, 0, 0, v, 0, 0, 0, 0, v, 0];
      case 'contrast': { const o = 0.5 - 0.5 * v; return [v, 0, 0, o, 0, v, 0, o, 0, 0, v, o]; }
      case 'saturate': return [0.213 + 0.787 * v, 0.715 - 0.715 * v, 0.072 - 0.072 * v, 0, 0.213 - 0.213 * v, 0.715 + 0.285 * v, 0.072 - 0.072 * v, 0, 0.213 - 0.213 * v, 0.715 - 0.715 * v, 0.072 + 0.928 * v, 0];
      case 'sepia': { const k = 1 - v; return [0.393 + 0.607 * k, 0.769 - 0.769 * k, 0.189 - 0.189 * k, 0, 0.349 - 0.349 * k, 0.686 + 0.314 * k, 0.168 - 0.168 * k, 0, 0.272 - 0.272 * k, 0.534 - 0.534 * k, 0.131 + 0.869 * k, 0]; }
      case 'grayscale': { const k = 1 - v; return [0.2126 + 0.7874 * k, 0.7152 - 0.7152 * k, 0.0722 - 0.0722 * k, 0, 0.2126 - 0.2126 * k, 0.7152 + 0.2848 * k, 0.0722 - 0.0722 * k, 0, 0.2126 - 0.2126 * k, 0.7152 - 0.7152 * k, 0.0722 + 0.9278 * k, 0]; }
      case 'hue-rotate': {
        const c = Math.cos(v * RAD), s = Math.sin(v * RAD);
        return [0.213 + c * 0.787 - s * 0.213, 0.715 - c * 0.715 - s * 0.715, 0.072 - c * 0.072 + s * 0.928, 0,
          0.213 - c * 0.213 + s * 0.143, 0.715 + c * 0.285 + s * 0.14, 0.072 - c * 0.072 - s * 0.283, 0,
          0.213 - c * 0.213 - s * 0.787, 0.715 - c * 0.715 + s * 0.715, 0.072 + c * 0.928 + s * 0.072, 0];
      }
      default: return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0];
    }
  }

  let defsEl = null;
  function defs() {
    if (defsEl && defsEl.isConnected) return defsEl;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.setAttribute('class', 'ims-defs');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
    defsEl = document.createElementNS(NS, 'defs');
    svg.append(defsEl);
    document.body.append(svg);
    return defsEl;
  }
  function warmFilterId(v) {
    const id = `ims-warm-${v < 0 ? 'n' : 'p'}${Math.abs(v)}`;
    if (!document.getElementById(id)) {
      const m = warmMatrix(v);
      const vals = [m[0], m[1], m[2], 0, m[3], m[4], m[5], m[6], 0, m[7], m[8], m[9], m[10], 0, m[11], 0, 0, 0, 1, 0].map((n) => +n.toFixed(6)).join(' ');
      const f = document.createElementNS(NS, 'filter');
      f.setAttribute('id', id);
      f.setAttribute('color-interpolation-filters', 'sRGB');
      const cm = document.createElementNS(NS, 'feColorMatrix');
      cm.setAttribute('type', 'matrix');
      cm.setAttribute('values', vals);
      f.append(cm);
      defs().append(f);
    }
    return id;
  }
  const stepCSS = ([t, v]) => (t === 'warm' ? `url(#${warmFilterId(v)})` : t === 'hue-rotate' ? `hue-rotate(${v}deg)` : `${t}(${v})`);
  const blurPx = (a, L) => (a.blur ? Math.round(a.blur / 100 * 0.02 * L * 100) / 100 : 0);

  function cssFilter(edit, L = 400) {
    const a = norm(edit).adjust;
    const f = colorSteps(a).map(stepCSS);
    const b = blurPx(a, L);
    if (b) f.push(`blur(${b}px)`);
    return f.join(' ') || 'none';
  }

  const VIG = [[0, 0], [0.4, 0], [0.7, 0.4], [1, 1]];
  const vigAlpha = (v) => v / 100 * 0.85;
  function vignetteCSS(edit) {
    const v = norm(edit).adjust.vignette;
    if (!v) return '';
    const a = vigAlpha(v);
    return `radial-gradient(ellipse farthest-corner at 50% 50%, ${VIG.map(([p, k]) => `rgba(0, 0, 0, ${r4(a * k)}) ${p * 100}%`).join(', ')})`;
  }
  function paintVignette(ctx, W, H, v) {
    const a = vigAlpha(v);
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop'; // darken painted pixels only, keep transparency
    ctx.translate(W / 2, H / 2);
    ctx.scale(1, H / W);
    const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, W / 2 * Math.SQRT2);
    VIG.forEach(([p, k]) => gr.addColorStop(p, `rgba(0, 0, 0, ${r4(a * k)})`));
    ctx.fillStyle = gr;
    ctx.fillRect(-W / 2, -W / 2, W, W);
    ctx.restore();
  }

  const shapeRadius = (shape) => ({ circle: '50%', rounded: '18%' })[shape] || '0';

  /* ---------- capability detection (ctx.filter is missing in older Safari) ---------- */
  let CAPS = null, forcedCaps = null;
  function caps() {
    if (forcedCaps) return forcedCaps;
    if (CAPS) return CAPS;
    CAPS = { filter: false, url: false };
    try {
      const test = (filter, color) => {
        const c = makeCanvas(4, 4), x = c.getContext('2d', { willReadFrequently: true });
        if (!('filter' in x)) return null;
        x.filter = filter;
        x.fillStyle = color;
        x.fillRect(0, 0, 4, 4);
        return x.getImageData(1, 1, 1, 1).data;
      };
      const d = test('grayscale(1)', '#ff0000');
      CAPS.filter = !!d && Math.abs(d[0] - d[1]) < 10 && d[0] < 200;
      if (CAPS.filter) {
        const w = test(`url(#${warmFilterId(100)})`, '#808080');
        CAPS.url = !!w && w[0] - w[2] > 20;
      }
    } catch (err) { /* keep the manual pipeline */ }
    return CAPS;
  }

  /* ---------- manual pixel fallbacks ---------- */
  function applySteps(data, steps) {
    const ms = steps.map((s) => { const m = stepMatrix(s); return [m[0], m[1], m[2], m[3] * 255, m[4], m[5], m[6], m[7] * 255, m[8], m[9], m[10], m[11] * 255]; });
    const n = ms.length;
    for (let i = 0; i < data.length; i += 4) {
      if (!data[i + 3]) continue;
      let r = data[i], g = data[i + 1], b = data[i + 2];
      for (let k = 0; k < n; k++) {
        const m = ms[k];
        const nr = m[0] * r + m[1] * g + m[2] * b + m[3];
        const ng = m[4] * r + m[5] * g + m[6] * b + m[7];
        const nb = m[8] * r + m[9] * g + m[10] * b + m[11];
        r = nr < 0 ? 0 : nr > 255 ? 255 : nr;
        g = ng < 0 ? 0 : ng > 255 ? 255 : ng;
        b = nb < 0 ? 0 : nb > 255 ? 255 : nb;
      }
      data[i] = r; data[i + 1] = g; data[i + 2] = b;
    }
  }

  function boxesForGauss(sigma, n) {
    const wIdeal = Math.sqrt((12 * sigma * sigma) / n + 1);
    let wl = Math.floor(wIdeal);
    if (wl % 2 === 0) wl--;
    const m = Math.round((12 * sigma * sigma - n * wl * wl - 4 * n * wl - 3 * n) / (-4 * wl - 4));
    return Array.from({ length: n }, (_, i) => (i < m ? wl : wl + 2));
  }
  function boxPass(src, dst, w, h, r, horizontal) {
    const len = horizontal ? w : h, lines = horizontal ? h : w, step = horizontal ? 1 : w, iarr = 1 / (r + r + 1);
    for (let l = 0; l < lines; l++) {
      const o = horizontal ? l * w : l;
      let acc = src[o] * r;
      for (let i = 0; i < r; i++) acc += src[o + Math.min(i, len - 1) * step];
      for (let i = 0; i < len; i++) {
        acc += src[o + Math.min(i + r, len - 1) * step];
        dst[o + i * step] = acc * iarr;
        acc -= src[o + Math.max(i - r, 0) * step];
      }
    }
  }
  // approximate Gaussian blur (3 box passes) on premultiplied colour
  function boxBlur(id, sigma) {
    const { width: w, height: h, data } = id, n = w * h;
    const ch = [0, 1, 2, 3].map(() => new Float32Array(n)), tmp = new Float32Array(n);
    for (let i = 0, j = 0; i < n; i++, j += 4) {
      const a = data[j + 3] / 255;
      ch[0][i] = data[j] * a; ch[1][i] = data[j + 1] * a; ch[2][i] = data[j + 2] * a; ch[3][i] = data[j + 3];
    }
    const sizes = boxesForGauss(sigma, 3);
    for (const c of ch) for (const s of sizes) { const r = (s - 1) / 2; boxPass(c, tmp, w, h, r, true); boxPass(tmp, c, w, h, r, false); }
    for (let i = 0, j = 0; i < n; i++, j += 4) {
      const a = ch[3][i], k = a > 0 ? 255 / a : 0;
      data[j] = ch[0][i] * k; data[j + 1] = ch[1][i] * k; data[j + 2] = ch[2][i] * k; data[j + 3] = a;
    }
  }

  /* ---------- bake ---------- */
  function drawLayer(ctx, img, e, natW, natH, W, H) {
    const g = geometry(e, natW, natH, W, H);
    const blur = blurPx(e.adjust, Math.max(W, H));
    const steps = colorSteps(e.adjust);
    const cap = caps();
    const native = cap.filter && (cap.url || !e.adjust.warmth);
    const pad = blur ? Math.ceil(blur * 3) + 2 : 0; // blur samples beyond the frame like the CSS preview
    // 1) sharp, colour-adjusted layer
    const lc = makeCanvas(W + 2 * pad, H + 2 * pad);
    const lx = lc.getContext('2d', { willReadFrequently: !native || (blur > 0 && !cap.filter) });
    lx.imageSmoothingEnabled = true;
    lx.imageSmoothingQuality = 'high';
    if (native && steps.length) lx.filter = steps.map(stepCSS).join(' ');
    const draw = (k) => {
      lx.setTransform(1, 0, 0, 1, pad + g.cx, pad + g.cy);
      lx.rotate(g.th);
      lx.scale(g.scale * k * g.fx, g.scale * k * g.fy);
      lx.drawImage(img, -natW / 2, -natH / 2, natW, natH);
    };
    // straightened cover crops touch the image edge exactly at the frame corners: a slightly larger
    // underlay fills those antialiased corner pixels so the result stays fully opaque
    if (e.fit === 'cover' && Math.abs(g.sin * g.cos) > 1e-6) draw(1 + 3 / Math.min(W, H));
    draw(1);
    lx.setTransform(1, 0, 0, 1, 0, 0);
    lx.filter = 'none';
    if (!native && steps.length) {
      const id = lx.getImageData(0, 0, lc.width, lc.height);
      applySteps(id.data, steps);
      lx.putImageData(id, 0, 0);
    }
    if (!blur) { ctx.drawImage(lc, 0, 0, W, H, 0, 0, W, H); return; }
    // 2) blur pass; in cover mode it sits on the sharp layer so the frame edges stay opaque
    let bc = lc;
    if (cap.filter) {
      bc = makeCanvas(lc.width, lc.height);
      const bx = bc.getContext('2d');
      bx.filter = `blur(${blur}px)`;
      bx.drawImage(lc, 0, 0);
    } else {
      bc = makeCanvas(lc.width, lc.height);
      const bx = bc.getContext('2d', { willReadFrequently: true });
      const id = lx.getImageData(0, 0, lc.width, lc.height);
      boxBlur(id, blur);
      bx.putImageData(id, 0, 0);
    }
    if (e.fit === 'cover') ctx.drawImage(lc, pad, pad, W, H, 0, 0, W, H);
    ctx.drawImage(bc, pad, pad, W, H, 0, 0, W, H);
  }

  function isOpaque(ctx, W, H) {
    const d = ctx.getImageData(0, 0, W, H).data;
    for (let i = 3; i < d.length; i += 4) if (d[i] < 255) return false;
    return true;
  }

  function bakeImage(img, edit, opts = {}) {
    const natW = img.naturalWidth || img.width, natH = img.naturalHeight || img.height;
    if (!natW || !natH) throw new Error('Image has no size');
    const e = norm(edit);
    const { width: W, height: H } = outputSize(e, natW, natH, opts.aspect, opts.maxOutput);
    const out = makeCanvas(W, H);
    const ctx = out.getContext('2d', { willReadFrequently: true });
    if (e.bg) { ctx.fillStyle = e.bg; ctx.fillRect(0, 0, W, H); }
    drawLayer(ctx, img, e, natW, natH, W, H);
    if (e.adjust.vignette) paintVignette(ctx, W, H, e.adjust.vignette);
    const opaque = isOpaque(ctx, W, H);
    const type = opaque ? 'image/jpeg' : 'image/png';
    return { dataURL: opaque ? out.toDataURL(type, opts.quality || 0.9) : out.toDataURL(type), width: W, height: H, type };
  }

  async function bake(original, edit, opts = {}) {
    const img = typeof original === 'string' ? await loadImage(original) : original;
    return bakeImage(img, edit, opts || {});
  }

  /* ---------- loading ---------- */
  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const im = new Image();
      if (/^https?:/i.test(src)) im.crossOrigin = 'anonymous';
      im.onload = () => resolve(im);
      im.onerror = () => reject(new Error('Could not load image'));
      im.decoding = 'async';
      im.src = src;
    });
  }

  function readFile(file, maxSide = 2000) {
    return new Promise((resolve, reject) => {
      if (!file || !/^image\//.test(file.type || '')) return reject(new Error('Not an image'));
      const fr = new FileReader();
      fr.onload = async () => {
        try {
          const url = fr.result;
          const img = await loadImage(url);
          const svg = file.type === 'image/svg+xml';
          let w = img.naturalWidth || 0, h = img.naturalHeight || 0;
          if (!w || !h) { w = 1000; h = 1000; }
          const long = Math.max(w, h);
          const k = svg ? Math.min(maxSide, Math.max(1200, long)) / long : Math.min(1, maxSide / long);
          if (k === 1 && /^image\/(jpeg|png|webp)$/.test(file.type)) return resolve(url);
          const c = makeCanvas(w * k, h * k), x = c.getContext('2d');
          x.imageSmoothingQuality = 'high';
          x.drawImage(img, 0, 0, c.width, c.height);
          resolve(file.type === 'image/jpeg' ? c.toDataURL('image/jpeg', 0.92) : c.toDataURL('image/png'));
        } catch (err) { reject(err); }
      };
      fr.onerror = () => reject(fr.error || new Error('Could not read file'));
      fr.readAsDataURL(file);
    });
  }

  function pickImageFile() {
    return new Promise((resolve) => {
      const inp = document.createElement('input');
      inp.type = 'file';
      inp.accept = 'image/*';
      inp.style.cssText = 'position:fixed;left:-9999px;opacity:0';
      let done = false;
      const finish = (f) => {
        if (done) return;
        done = true;
        window.removeEventListener('focus', onFocus);
        inp.remove();
        resolve(f || null);
      };
      const onFocus = () => setTimeout(() => finish(inp.files && inp.files[0]), 800);
      inp.addEventListener('change', () => finish(inp.files && inp.files[0]));
      inp.addEventListener('cancel', () => finish(null));
      document.body.append(inp);
      setTimeout(() => window.addEventListener('focus', onFocus), 0);
      inp.click();
    });
  }

  function hasAlpha(img, src) {
    if (/^data:image\/jpe?g/i.test(src || '')) return false;
    try {
      const natW = img.naturalWidth, natH = img.naturalHeight, k = Math.min(1, 160 / Math.max(natW, natH));
      const c = makeCanvas(natW * k, natH * k), x = c.getContext('2d', { willReadFrequently: true });
      x.drawImage(img, 0, 0, c.width, c.height);
      const d = x.getImageData(0, 0, c.width, c.height).data;
      for (let i = 3; i < d.length; i += 4) if (d[i] < 250) return true;
    } catch (err) { return true; }
    return false;
  }

  async function previewSource(img, src, alpha) {
    const natW = img.naturalWidth, natH = img.naturalHeight, long = Math.max(natW, natH), MAXP = 2400;
    if (long <= MAXP) return { url: src, revoke: false };
    const k = MAXP / long, c = makeCanvas(natW * k, natH * k), x = c.getContext('2d');
    x.imageSmoothingQuality = 'high';
    x.drawImage(img, 0, 0, c.width, c.height);
    const type = alpha ? 'image/png' : 'image/jpeg';
    const blob = await new Promise((r) => { try { c.toBlob(r, type, 0.92); } catch (err) { r(null); } });
    return blob ? { url: URL.createObjectURL(blob), revoke: true } : { url: c.toDataURL(type, 0.92), revoke: false };
  }

  function thumbSource(img, alpha) {
    const n = 120, c = makeCanvas(n, n), x = c.getContext('2d');
    const natW = img.naturalWidth, natH = img.naturalHeight, k = Math.max(n / natW, n / natH);
    x.imageSmoothingQuality = 'high';
    x.drawImage(img, (n - natW * k) / 2, (n - natH * k) / 2, natW * k, natH * k);
    return alpha ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.85);
  }

  /* ---------- icons used by the modal ---------- */
  const SI = {
    crop: '<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/>',
    rotL: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    rotR: '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
    flipH: '<path d="M8 7 3 12l5 5V7z"/><path d="M16 7l5 5-5 5V7z"/><path d="M12 3v2M12 9v2M12 15v2M12 21v-2"/>',
    flipV: '<path d="M7 8 12 3l5 5H7z"/><path d="M7 16l5 5 5-5H7z"/><path d="M3 12h2M9 12h2M15 12h2M21 12h-2"/>',
    zoomIn: '<circle cx="11" cy="11" r="7.5"/><path d="M20.5 20.5 16.3 16.3"/><path d="M11 8v6M8 11h6"/>',
    zoomOut: '<circle cx="11" cy="11" r="7.5"/><path d="M20.5 20.5 16.3 16.3"/><path d="M8 11h6"/>',
    sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
    filters: '<circle cx="9" cy="9" r="6"/><circle cx="15" cy="9" r="6"/><circle cx="12" cy="15" r="6"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    reset: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    thirds: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>',
    compare: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 3v18"/><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7z" fill="currentColor" fill-opacity=".3" stroke="none"/>',
    fill: '<path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/>',
    fit: '<rect x="3" y="3" width="18" height="18" rx="2"/><rect x="7" y="8" width="10" height="8" rx="1"/>',
    circle: '<circle cx="12" cy="12" r="9"/>',
    rounded: '<rect x="3" y="3" width="18" height="18" rx="6"/>',
    square: '<rect x="3.5" y="3.5" width="17" height="17" rx="1"/>',
    level: '<path d="M2 12h20"/><path d="M6 8l-4 4 4 4M18 8l4 4-4 4"/>',
  };
  const si = (name, cls = 'ico') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${SI[name] || (typeof ICONS !== 'undefined' && ICONS[name]) || ''}</svg>`;

  const ASPECTS = [
    { key: 'original', label: 'Original' }, { key: 'free', label: 'Free' },
    { key: '1:1', label: '1:1', r: 1 }, { key: '4:5', label: '4:5', r: 4 / 5 }, { key: '3:4', label: '3:4', r: 3 / 4 },
    { key: '4:3', label: '4:3', r: 4 / 3 }, { key: '3:2', label: '3:2', r: 3 / 2 }, { key: '16:9', label: '16:9', r: 16 / 9 },
  ];
  const SHAPES = [{ key: 'circle', label: 'Circle' }, { key: 'rounded', label: 'Rounded' }, { key: 'square', label: 'Square' }];
  const BGS = [[null, 'Transparent'], ['#ffffff', 'White'], ['#f1f5f9', 'Light gray'], ['#cbd5e1', 'Silver'], ['#334155', 'Slate'], ['#000000', 'Black']];

  /* ---------- modal session ---------- */
  let S = null, openSeq = 0;

  function open(opts = {}) {
    opts = opts || {};
    if (S) S.close(null);
    const seq = ++openSeq;
    return new Promise((resolve) => {
      (async () => {
        let src = opts.src;
        if (!src) {
          const file = await pickImageFile();
          if (!file) return resolve(null);
          try { src = await readFile(file); } catch (err) { notify('Could not read that image'); return resolve(null); }
        }
        let img;
        try { img = await loadImage(src); } catch (err) { notify('Could not load that image'); return resolve(null); }
        if (!(img.naturalWidth || img.width) || !(img.naturalHeight || img.height)) { notify('This image has no size'); return resolve(null); }
        if (seq !== openSeq) return resolve(null); // a newer open() superseded this one
        if (S) S.close(null);
        S = await session(opts, src, img, resolve);
      })().catch(() => resolve(null));
    });
  }

  async function session(opts, src0, img0, resolve) {
    const photo = opts.mode === 'photo';
    const st = {
      title: opts.title || 'Edit image',
      maxOutput: opts.maxOutput > 0 ? opts.maxOutput : 1000,
      allowReplace: opts.allowReplace !== false,
      lockAspect: !!opts.lockAspect || photo,
      original: src0, img: img0, natW: 1, natH: 1, alpha: false, preview: null, thumb: '',
      edit: norm(opts.edit), quarter: 0, straighten: 0,
      shape: photo ? (SHAPES.some((s) => s.key === opts.shape) ? opts.shape : 'circle') : (opts.shape || 'rect'),
      aspectKey: 'original', aspect: 1, customAspect: null,
      frame: { x: 0, y: 0, w: 100, h: 100 }, override: null, anim: 0, sw: 0, sh: 0,
      hist: [], hi: -1, busy: false, closed: false, tab: 'crop', raf: 0,
    };
    const prevFocus = document.activeElement;

    async function setImage(src, img) {
      st.original = src;
      st.img = img;
      st.natW = img.naturalWidth || img.width || 1;
      st.natH = img.naturalHeight || img.height || 1;
      st.alpha = hasAlpha(img, src);
      if (st.preview && st.preview.revoke) URL.revokeObjectURL(st.preview.url);
      st.preview = await previewSource(img, src, st.alpha);
      st.thumb = thumbSource(img, st.alpha);
    }
    await setImage(src0, img0);

    const natAspect = () => (Math.abs(st.quarter) % 2 ? st.natH / st.natW : st.natW / st.natH);
    function deriveRot() {
      st.quarter = Math.round(st.edit.rot / 90);
      st.straighten = r4(st.edit.rot - st.quarter * 90);
    }
    deriveRot();
    function matchAspect(a) {
      if (Math.abs(a / natAspect() - 1) < 0.005) return 'original';
      const m = ASPECTS.find((x) => x.r && Math.abs(a / x.r - 1) < 0.005);
      return m ? m.key : 'current';
    }
    if (photo) st.aspect = opts.aspect > 0 ? opts.aspect : 1;
    else if (opts.aspect > 0) {
      st.aspect = opts.aspect;
      st.aspectKey = st.lockAspect ? 'current' : matchAspect(opts.aspect);
      if (st.aspectKey === 'current') st.customAspect = opts.aspect;
    } else st.aspect = natAspect();
    const initialKey = st.aspectKey, initialAspect = st.aspect;

    /* ----- DOM ----- */
    const titleId = `ims-title-${Math.random().toString(36).slice(2, 8)}`;
    const ib = (name, label, onclick, cls = '') => h('button', { type: 'button', class: `icon-btn ${cls}`, title: label, 'aria-label': label, onclick, html: si(name) });
    const arSize = (r) => ({ width: `${r >= 1 ? 20 : 20 * r}px`, height: `${r >= 1 ? 20 / r : 20}px` });

    const undoB = ib('undo', 'Undo (Ctrl+Z)', () => undo(), 'sm');
    const redoB = ib('redo', 'Redo (Ctrl+Shift+Z)', () => redo(), 'sm');
    const outInfo = h('span', { class: 'ims-out', title: 'Size of the image that will be saved' });
    const srcInfo = h('small', { class: 'ims-src' });
    const head = h('div', { class: 'ims-head' },
      h('div', { class: 'ims-head-ico', html: si('crop') }),
      h('div', { class: 'ims-head-txt' }, h('h2', { id: titleId }, st.title), srcInfo),
      h('div', { class: 'ims-head-acts' }, undoB, redoB, h('span', { class: 'ims-vsep' }), outInfo,
        ib('x', 'Close without saving (Esc)', () => cancel(), 'sm ims-close')));

    // stage
    const imgEl = h('img', { class: 'ims-img', alt: '', draggable: 'false' });
    const underEl = h('img', { class: 'ims-img ims-under', alt: '', draggable: 'false' });
    const bgEl = h('div', { class: 'ims-bg' });
    const vigEl = h('div', { class: 'ims-vig' });
    const maskEl = h('div', { class: 'ims-mask' });
    const gridEl = h('div', { class: 'ims-grid' }, h('i'), h('i'), h('i'), h('i'));
    const handles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map((d) => h('span', { class: `ims-hdl ims-hdl-${d}`, 'data-dir': d, onpointerdown: (e) => startResize(e, d) }));
    const frameEl = h('div', { class: 'ims-frame' }, h('span', { class: 'ims-corners' }), h('span', { class: 'ims-sq' }), handles);
    const box = h('div', { class: 'ims-box' }, bgEl, underEl, imgEl, vigEl, maskEl, gridEl, frameEl);
    const zoomLbl = h('span', { class: 'ims-zl', 'aria-live': 'polite' }, '100%');
    const gridBtn = ib('thirds', 'Show grid', () => { stage.classList.toggle('grid-on'); gridBtn.setAttribute('aria-pressed', stage.classList.contains('grid-on')); }, 'sm');
    gridBtn.setAttribute('aria-pressed', 'false');
    const cmpBtn = ib('compare', 'Compare with original (hold \\)', () => setCompare(!root.classList.contains('comparing')), 'sm');
    cmpBtn.setAttribute('aria-pressed', 'false');
    const tools = h('div', { class: 'ims-tools' },
      ib('zoomOut', 'Zoom out (−)', () => zoomBy(1 / 1.2, true), 'sm'), zoomLbl, ib('zoomIn', 'Zoom in (+)', () => zoomBy(1.2, true), 'sm'),
      h('span', { class: 'ims-vsep' }), gridBtn, cmpBtn);
    const hint = h('div', { class: 'ims-hint' }, 'Drag to reposition · Scroll or pinch to zoom · Double-click to reset');
    const cmpBadge = h('div', { class: 'ims-badge' }, 'Original');
    const drop = h('div', { class: 'ims-drop' }, h('div', { class: 'ims-drop-card' }, h('span', { html: si('upload') }), h('b', {}, 'Drop to replace image')));
    const stage = h('div', {
      class: 'ims-stage', tabindex: '0',
      'aria-label': 'Crop area. Drag or use the arrow keys to move the image, scroll or press plus and minus to zoom, double-click to reset.',
    }, box, hint, cmpBadge, tools, drop);

    // side panel
    const tabDefs = [['crop', 'Crop', 'crop'], ['filters', 'Filters', 'filters'], ['adjust', 'Adjust', 'sliders']];
    const tabBtns = {}, panes = {};
    const tabs = h('div', { class: 'tabs ims-tabs', role: 'tablist', 'aria-label': 'Editor sections' }, tabDefs.map(([k, label, ic]) => {
      tabBtns[k] = h('button', { type: 'button', role: 'tab', 'data-ims-tab': k, onclick: () => setTab(k), html: `${si(ic, 'ico sm')}<span>${label}</span>` });
      return tabBtns[k];
    }));
    tabDefs.forEach(([k]) => { panes[k] = h('div', { class: 'ims-pane', role: 'tabpanel', 'data-ims-pane': k }); });
    const sideScroll = h('div', { class: 'ims-side-scroll' }, Object.values(panes));
    const side = h('div', { class: 'ims-side' }, tabs, sideScroll);
    const sec = (title, ...kids) => h('section', { class: 'ims-sec' }, h('div', { class: 'ims-sec-title' }, title), kids);

    // crop pane: frame
    const chips = {};
    if (photo) {
      panes.crop.append(sec('Shape', h('div', { class: 'ims-chips c3' }, SHAPES.map((s) => {
        chips[s.key] = h('button', { type: 'button', class: 'ims-chip', 'aria-pressed': 'false', title: `${s.label} photo`, onclick: () => setShape(s.key), html: `${si(s.key)}<span>${s.label}</span>` });
        return chips[s.key];
      }))));
    } else if (!st.lockAspect) {
      const list = st.customAspect ? [{ key: 'current', label: 'Current', r: st.customAspect }, ...ASPECTS] : ASPECTS;
      panes.crop.append(sec('Aspect ratio', h('div', { class: `ims-chips ${list.length > 8 ? 'c5' : 'c4'}` }, list.map((a) => {
        const glyph = a.key === 'free'
          ? h('span', { class: 'ims-ar free', style: { width: '20px', height: '15px' } })
          : h('span', { class: 'ims-ar', style: arSize(a.key === 'original' ? natAspect() : a.r || 1) });
        chips[a.key] = h('button', { type: 'button', class: 'ims-chip', 'aria-pressed': 'false', title: a.key === 'free' ? 'Free: drag the frame edges' : `Aspect ${a.label}`, onclick: () => setAspectKey(a.key) },
          h('span', { class: 'ims-ar-box' }, glyph), h('span', {}, a.label));
        return chips[a.key];
      }))));
    }

    // crop pane: zoom & fit
    const zoomRange = h('input', { type: 'range', class: 'range', min: '0', max: '1000', step: '1', 'aria-label': 'Zoom',
      oninput: (e) => setZoomAbs(sliderToZoom(+e.target.value)), onchange: () => commit() });
    const zoomVal = h('span', { class: 'range-val' });
    const fitBtns = {
      cover: h('button', { type: 'button', title: 'Fill the frame (crop)', onclick: () => setFit('cover'), html: `${si('fill', 'ico sm')}<span>Fill</span>` }),
      contain: h('button', { type: 'button', title: 'Fit the whole image (adds background)', onclick: () => setFit('contain'), html: `${si('fit', 'ico sm')}<span>Fit</span>` }),
    };
    panes.crop.append(sec(h('span', {}, 'Zoom'),
      h('div', { class: 'ims-zoomrow' }, ib('zoomOut', 'Zoom out', () => zoomBy(1 / 1.2, true), 'sm'), zoomRange, ib('zoomIn', 'Zoom in', () => zoomBy(1.2, true), 'sm'), zoomVal),
      h('div', { class: 'seg ims-fitseg', role: 'group', 'aria-label': 'Fit mode' }, fitBtns.cover, fitBtns.contain)));

    // crop pane: rotate & flip
    const strRange = h('input', { type: 'range', class: 'range', min: '-45', max: '45', step: '0.5', 'aria-label': 'Straighten',
      oninput: (e) => setStraighten(+e.target.value), onchange: () => { stage.classList.remove('straightening'); commit(); },
      onpointerdown: () => stage.classList.add('straightening'), onpointerup: () => stage.classList.remove('straightening'),
      onpointercancel: () => stage.classList.remove('straightening'), ondblclick: () => { setStraighten(0); commit(); } });
    const strVal = h('span', { class: 'range-val' });
    const strReset = ib('reset', 'Reset straighten', () => { setStraighten(0); commit(); }, 'sm ims-mini');
    const tb = (ic, label, short, onclick) => h('button', { type: 'button', class: 'ims-tbtn', title: label, 'aria-label': label, onclick, html: `${si(ic)}<span>${short}</span>` });
    panes.crop.append(sec('Rotate & flip',
      h('div', { class: 'ims-tgrid' },
        tb('rotL', 'Rotate left 90°', '−90°', () => rotate(-1)), tb('rotR', 'Rotate right 90°', '+90°', () => rotate(1)),
        tb('flipH', 'Flip horizontal', 'Flip H', () => flip('h')), tb('flipV', 'Flip vertical', 'Flip V', () => flip('v'))),
      h('div', { class: 'ims-slider' }, h('div', { class: 'fld-label' }, h('span', { html: `${si('level', 'ico sm')}Straighten` }), h('span', { class: 'ims-val' }, strReset, strVal)), strRange)));

    // crop pane: background
    const bgBtns = [];
    const bgColor = h('input', { type: 'color', value: '#ffffff', 'aria-label': 'Custom background colour', oninput: (e) => setBg(e.target.value), onchange: () => commit() });
    const bgCustom = h('label', { class: 'ims-sw custom', title: 'Custom colour' }, bgColor);
    const bgSec = sec(h('span', {}, 'Background', h('small', {}, 'shown where the image does not cover')),
      h('div', { class: 'ims-sws' }, BGS.map(([c, label]) => {
        const b = h('button', { type: 'button', class: `ims-sw${c ? '' : ' none'}`, title: label, 'aria-label': `${label} background`, 'aria-pressed': 'false', style: c ? { background: c } : null, onclick: () => { setBg(c); commit(); } });
        b.dataset.c = c || '';
        bgBtns.push(b);
        return b;
      }), bgCustom));
    panes.crop.append(bgSec);

    // filters pane
    const presetBtns = {};
    const amountRange = h('input', { type: 'range', class: 'range', min: '0', max: '100', step: '1', 'aria-label': 'Filter intensity',
      oninput: (e) => { st.edit = applyPreset(st.edit, st.edit.preset, +e.target.value); requestRender(); syncAdjust(); }, onchange: () => commit() });
    const amountVal = h('span', { class: 'range-val' });
    const amountRow = h('div', { class: 'ims-slider ims-amount' }, h('div', { class: 'fld-label' }, h('span', {}, 'Intensity'), amountVal), amountRange);
    const presetGrid = h('div', { class: 'ims-presets' });
    function buildPresets() {
      presetGrid.textContent = '';
      presets.forEach((p) => {
        const pe = { adjust: p.adjust };
        const thumbImg = h('img', { src: st.thumb, alt: '', draggable: 'false', style: { filter: cssFilter(pe, 96) } });
        const v = vignetteCSS(pe);
        presetBtns[p.id] = h('button', { type: 'button', class: 'ims-preset', 'aria-pressed': 'false', title: p.name, onclick: () => { st.edit = applyPreset(st.edit, p.id, 100); requestRender(); sync(); commit(); } },
          h('span', { class: 'ims-pthumb' }, thumbImg, v && h('span', { class: 'ims-pvig', style: { background: v } })),
          h('span', { class: 'ims-pname' }, p.name));
        presetGrid.append(presetBtns[p.id]);
      });
    }
    buildPresets();
    panes.filters.append(sec('Presets', presetGrid, amountRow));

    // adjust pane
    const adj = {};
    let group = null;
    ADJUST.forEach((d) => {
      if (!group || group.dataset.g !== d.group) {
        group = sec(d.group);
        group.dataset.g = d.group;
        panes.adjust.append(group);
      }
      const val = h('span', { class: 'range-val' });
      const reset = ib('reset', `Reset ${d.label.toLowerCase()}`, () => { setAdjust(d.key, 0); commit(); }, 'sm ims-mini');
      const range = h('input', { type: 'range', class: `range${d.min < 0 ? ' bipolar' : ''}`, min: String(d.min), max: String(d.max), step: '1', 'aria-label': d.label,
        oninput: (e) => setAdjust(d.key, +e.target.value), onchange: () => commit(), ondblclick: () => { setAdjust(d.key, 0); commit(); } });
      adj[d.key] = { range, val, reset, d };
      group.append(h('div', { class: 'ims-slider' }, h('div', { class: 'fld-label' }, h('span', {}, d.label), h('span', { class: 'ims-val' }, reset, val)), range));
    });
    panes.adjust.append(h('div', { class: 'ims-sec ims-sec-actions' },
      h('button', { type: 'button', class: 'btn sm ghost block', onclick: () => { st.edit = applyPreset(st.edit, 'original'); requestRender(); sync(); commit(); }, html: `${si('reset', 'ico sm')}<span>Reset adjustments</span>` })));

    // footer
    const applyBtn = h('button', { type: 'button', class: 'btn primary ims-apply', title: 'Apply (Enter)', onclick: () => apply(), html: `${si('check')}<span>Apply</span>` });
    const replaceBtn = st.allowReplace && h('button', { type: 'button', class: 'btn sm ghost', title: 'Replace image (or drop a file on the preview)', onclick: () => replace(), html: `${si('upload', 'ico sm')}<span>Replace image</span>` });
    const foot = h('div', { class: 'ims-foot' },
      h('div', { class: 'ims-foot-l' },
        h('button', { type: 'button', class: 'btn sm ghost', title: 'Reset all changes', onclick: () => resetAll(), html: `${si('reset', 'ico sm')}<span>Reset all</span>` }),
        replaceBtn),
      h('div', { class: 'ims-foot-r' },
        h('span', { class: 'ims-keys', html: '<kbd>Esc</kbd> cancel <span>·</span> <kbd>Enter</kbd> apply' }),
        h('button', { type: 'button', class: 'btn ghost', onclick: () => cancel() }, 'Cancel'),
        applyBtn));

    const dialog = h('div', { class: 'ims-dialog glass', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': titleId, tabindex: '-1' },
      head, h('div', { class: 'ims-body' }, stage, side), foot);
    const root = h('div', { class: `ims-overlay ims-mode-${photo ? 'photo' : 'image'}` }, dialog);
    root.addEventListener('dragover', (e) => { e.preventDefault(); if (e.dataTransfer) e.dataTransfer.dropEffect = 'none'; });
    root.addEventListener('drop', (e) => e.preventDefault());

    /* ----- layout & render ----- */
    function fitted() {
      const sw = st.sw, sh = st.sh;
      const padX = Math.max(22, sw * 0.07), padT = Math.max(40, sh * 0.07), padB = Math.max(64, sh * 0.07 + 30);
      const aw = Math.max(40, sw - 2 * padX), ah = Math.max(40, sh - padT - padB);
      const A = st.aspect;
      const w = aw / ah > A ? ah * A : aw, hh = aw / ah > A ? ah : aw / A;
      return { x: (sw - w) / 2, y: padT + (ah - hh) / 2, w, h: hh };
    }
    function layout() {
      st.sw = stage.clientWidth; // layout size: unaffected by the opening scale animation
      st.sh = stage.clientHeight;
      if (!st.override && !st.anim) st.frame = fitted();
    }
    function render() {
      const { x, y, w, h: fh } = st.frame;
      Object.assign(box.style, { left: px(x), top: px(y), width: px(w), height: px(fh) });
      const p = place(st.edit, st.natW, st.natH, w, fh);
      // the stage moves the image with a transform only (no layout) for smooth dragging
      const css = { width: p.width, height: p.height, filter: p.filter, transform: `translate(${p.left}, ${p.top}) ${p.transform}` };
      Object.assign(imgEl.style, css);
      // blur in cover mode: bake keeps the edges opaque by blurring over the sharp image — mirror that
      const under = st.edit.adjust.blur > 0 && st.edit.fit === 'cover';
      underEl.hidden = !under;
      if (under) Object.assign(underEl.style, css, { filter: cssFilter({ ...st.edit, adjust: { ...st.edit.adjust, blur: 0 } }) });
      vigEl.style.background = vignetteCSS(st.edit) || 'none';
      bgEl.style.background = st.edit.bg || 'transparent';
      const rad = shapeRadius(st.shape);
      maskEl.style.borderRadius = rad;
      frameEl.style.borderRadius = rad;
      gridEl.style.borderRadius = rad;
      frameEl.classList.toggle('shaped', st.shape === 'circle' || st.shape === 'rounded');
      const zl = `${Math.round(st.edit.zoom * 100)}%`;
      if (zoomLbl.textContent !== zl) zoomLbl.textContent = zl;
    }
    function requestRender() {
      if (st.raf) return;
      st.raf = requestAnimationFrame(() => { st.raf = 0; render(); });
    }

    /* ----- controls sync ----- */
    const zmin = () => (st.edit.fit === 'contain' ? MIN_CONTAIN : 1);
    const sliderToZoom = (v) => zmin() * Math.pow(MAX_ZOOM / zmin(), v / 1000);
    const zoomToSlider = (z) => Math.round(1000 * Math.log(z / zmin()) / Math.log(MAX_ZOOM / zmin()));
    function outSize() { return outputSize(st.edit, st.natW, st.natH, st.aspect, st.maxOutput); }
    function syncInfo() {
      const o = outSize();
      const png = !st.edit.bg && (st.alpha || !covers(st.edit, st.natW, st.natH, st.aspect * 1000, 1000));
      outInfo.innerHTML = `<b>${o.width} × ${o.height}</b> px · ${png ? 'PNG' : 'JPG'}`;
      srcInfo.textContent = `Source ${st.natW} × ${st.natH} px${st.alpha ? ' · transparency' : ''}`;
    }
    function syncAdjust() {
      for (const k in adj) {
        const { range, val, reset, d } = adj[k];
        const v = st.edit.adjust[k];
        range.value = v;
        val.textContent = `${v > 0 && d.min < 0 ? '+' : ''}${v}${d.unit || ''}`;
        reset.classList.toggle('show', v !== 0);
        range.closest('.ims-slider').classList.toggle('changed', v !== 0);
      }
      amountRange.value = st.edit.amount;
      amountVal.textContent = `${st.edit.amount}%`;
      amountRow.hidden = st.edit.preset === 'original';
      syncInfo();
    }
    function sync() {
      const e = st.edit;
      for (const k in chips) {
        const on = photo ? k === st.shape : k === st.aspectKey;
        chips[k].classList.toggle('active', on);
        chips[k].setAttribute('aria-pressed', on);
      }
      stage.classList.toggle('free', !photo && !st.lockAspect && st.aspectKey === 'free');
      if (chips.original) Object.assign(chips.original.querySelector('.ims-ar').style, arSize(natAspect()));
      zoomRange.value = zoomToSlider(e.zoom);
      zoomVal.textContent = `${Math.round(e.zoom * 100)}%`;
      for (const k in fitBtns) fitBtns[k].classList.toggle('active', e.fit === k);
      strRange.value = st.straighten;
      strVal.textContent = `${st.straighten > 0 ? '+' : ''}${st.straighten}°`;
      strReset.classList.toggle('show', st.straighten !== 0);
      bgSec.hidden = !(e.fit === 'contain' || st.alpha);
      let matched = false;
      bgBtns.forEach((b) => { const on = (b.dataset.c || null) === e.bg; matched = matched || on; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on); });
      bgCustom.classList.toggle('active', !matched && !!e.bg);
      if (!matched && e.bg && /^#[0-9a-f]{6}$/i.test(e.bg)) bgColor.value = e.bg;
      for (const k in presetBtns) { const on = k === e.preset; presetBtns[k].classList.toggle('active', on); presetBtns[k].setAttribute('aria-pressed', on); }
      undoB.disabled = st.hi <= 0;
      redoB.disabled = st.hi >= st.hist.length - 1;
      syncAdjust();
    }

    /* ----- history ----- */
    const snap = () => JSON.stringify({ edit: st.edit, aspectKey: st.aspectKey, aspect: st.aspect, shape: st.shape, quarter: st.quarter, straighten: st.straighten });
    function commit() {
      clearTimeout(st.commitT);
      const s = snap();
      if (st.hist[st.hi] === s) return;
      st.hist = st.hist.slice(0, st.hi + 1);
      st.hist.push(s);
      if (st.hist.length > 100) st.hist.shift();
      st.hi = st.hist.length - 1;
      undoB.disabled = st.hi <= 0;
      redoB.disabled = true;
    }
    const commitSoon = () => { clearTimeout(st.commitT); st.commitT = setTimeout(commit, 400); };
    function restore(s) {
      const o = JSON.parse(s);
      Object.assign(st, { edit: norm(o.edit), aspectKey: o.aspectKey, aspect: o.aspect, shape: o.shape, quarter: o.quarter, straighten: o.straighten });
      st.override = null;
      layout(); render(); sync();
    }
    function undo() { commit(); if (st.hi > 0) restore(st.hist[--st.hi]); }
    function redo() { if (st.hi < st.hist.length - 1) restore(st.hist[++st.hi]); }

    /* ----- actions ----- */
    const fw = () => st.frame.w, fh = () => st.frame.h;
    const reclamp = () => { st.edit = clamp(st.edit, st.natW, st.natH, fw(), fh()); };
    function setTab(k) {
      st.tab = k;
      for (const t in tabBtns) { tabBtns[t].classList.toggle('active', t === k); tabBtns[t].setAttribute('aria-selected', t === k); }
      for (const t in panes) panes[t].hidden = t !== k;
      sideScroll.scrollTop = 0;
    }
    function setShape(k) { st.shape = k; render(); sync(); commit(); }
    function setAspectKey(k) {
      if (k === 'original') st.aspect = natAspect();
      else if (k === 'current') st.aspect = st.customAspect || st.aspect;
      else if (k !== 'free') st.aspect = ASPECTS.find((a) => a.key === k).r;
      st.aspectKey = k;
      st.override = null;
      layout(); reclamp(); render(); sync(); commit();
    }
    function setZoomAbs(z) {
      st.edit = zoom(st.edit, z / st.edit.zoom, null, null, st.natW, st.natH, fw(), fh());
      requestRender(); sync();
    }
    function zoomBy(f, now) {
      st.edit = zoom(st.edit, f, null, null, st.natW, st.natH, fw(), fh());
      requestRender(); sync();
      if (now) commit(); else commitSoon();
    }
    function setFit(fit) {
      const e = norm(st.edit);
      e.fit = fit; e.zoom = 1; e.panX = 0; e.panY = 0;
      st.edit = clamp(e, st.natW, st.natH, fw(), fh());
      render(); sync(); commit();
    }
    function applyRot() {
      const e = norm(st.edit);
      e.rot = normRot(st.quarter * 90 + st.straighten);
      st.edit = clamp(e, st.natW, st.natH, fw(), fh());
    }
    function setStraighten(v) {
      st.straighten = lim(Math.round(v * 2) / 2, -45, 45);
      applyRot(); requestRender(); sync();
    }
    function rotate(dir) {
      st.quarter = ((st.quarter + dir) % 4 + 4) % 4;
      if (st.quarter > 2) st.quarter -= 4;
      // the whole crop turns: swap the frame for 'original' and 'free'
      if (!st.lockAspect && st.aspectKey === 'original') st.aspect = natAspect();
      else if (!st.lockAspect && st.aspectKey === 'free') st.aspect = 1 / st.aspect;
      layout(); applyRot(); render(); sync(); commit();
    }
    function flip(axis) {
      // mirror what is on screen: toggle the source flip and reverse the rotation
      const e = norm(st.edit);
      if (axis === 'h') e.flipH = !e.flipH; else e.flipV = !e.flipV;
      st.quarter = -st.quarter;
      st.straighten = -st.straighten;
      e.rot = normRot(st.quarter * 90 + st.straighten);
      st.edit = clamp(e, st.natW, st.natH, fw(), fh());
      render(); sync(); commit();
    }
    function setBg(c) { const e = norm(st.edit); e.bg = c; st.edit = norm(e); render(); sync(); }
    function setAdjust(k, v) { const e = norm(st.edit); e.adjust[k] = v; st.edit = norm(e); requestRender(); syncAdjust(); }
    function setCompare(on) {
      root.classList.toggle('comparing', on);
      cmpBtn.setAttribute('aria-pressed', on);
      cmpBtn.classList.toggle('active', on);
    }
    function resetView() {
      const e = norm(st.edit);
      e.zoom = 1; e.panX = 0; e.panY = 0;
      st.edit = clamp(e, st.natW, st.natH, fw(), fh());
      render(); sync(); commit();
    }
    function resetAll() {
      st.edit = defaultEdit();
      st.quarter = 0; st.straighten = 0;
      st.aspectKey = initialKey;
      st.aspect = initialKey === 'original' ? natAspect() : initialAspect;
      if (photo) st.shape = SHAPES.some((s) => s.key === opts.shape) ? opts.shape : 'circle';
      st.override = null;
      layout(); render(); sync(); commit();
    }
    async function useFile(file) {
      if (!file) return;
      try {
        const src = await readFile(file);
        const img = await loadImage(src);
        if (st.closed) return;
        await setImage(src, img);
        const e = norm(st.edit);
        e.zoom = 1; e.panX = 0; e.panY = 0; e.rot = 0; e.flipH = false; e.flipV = false;
        st.edit = e; st.quarter = 0; st.straighten = 0;
        if (st.aspectKey === 'original') st.aspect = natAspect();
        imgEl.src = underEl.src = st.preview.url;
        buildPresets();
        st.hist = []; st.hi = -1;
        layout(); reclamp(); render(); sync(); commit();
        notify('Image replaced');
      } catch (err) { notify('Could not read that image'); }
    }
    async function replace() { useFile(await pickImageFile()); }

    async function apply() {
      if (st.busy || st.closed) return;
      st.busy = true;
      applyBtn.disabled = true;
      applyBtn.classList.add('busy');
      await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));
      try {
        const out = bakeImage(st.img, st.edit, { aspect: st.aspect, maxOutput: st.maxOutput });
        close({ dataURL: out.dataURL, original: st.original, edit: norm(st.edit), aspect: st.aspect, shape: st.shape, width: out.width, height: out.height });
      } catch (err) {
        st.busy = false;
        applyBtn.disabled = false;
        applyBtn.classList.remove('busy');
        notify('Could not process this image');
      }
    }
    function cancel() { close(null); }
    function close(result) {
      if (st.closed) return;
      st.closed = true;
      clearTimeout(st.commitT);
      clearTimeout(st.hintT);
      cancelAnimationFrame(st.raf);
      cancelAnimationFrame(st.anim);
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('keyup', onKeyUp, true);
      ro.disconnect();
      root.classList.add('closing');
      document.body.classList.remove('ims-open');
      const preview = st.preview;
      setTimeout(() => { root.remove(); if (preview && preview.revoke) URL.revokeObjectURL(preview.url); }, 170);
      if (prevFocus && prevFocus.focus && prevFocus.isConnected) { try { prevFocus.focus({ preventScroll: true }); } catch (err) { /* ignore */ } }
      if (S === api) S = null;
      resolve(result);
    }

    /* ----- pointer: pan, pinch, wheel ----- */
    const pts = new Map();
    let gesture = null;
    const hideHint = () => hint.classList.add('gone');
    const framePoint = (x, y) => {
      const r = stage.getBoundingClientRect(), k = r.width / (stage.offsetWidth || r.width) || 1;
      return { x: (x - r.left) / k - stage.clientLeft - st.frame.x, y: (y - r.top) / k - stage.clientTop - st.frame.y };
    };
    stage.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.ims-tools, .ims-hdl') || (e.pointerType === 'mouse' && e.button !== 0)) return;
      e.preventDefault();
      stage.focus({ preventScroll: true });
      hideHint();
      try { stage.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      gesture = null;
      stage.classList.add('dragging');
    });
    stage.addEventListener('pointermove', (e) => {
      if (!pts.has(e.pointerId)) return;
      const prev = pts.get(e.pointerId);
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 1) {
        st.edit = pan(st.edit, e.clientX - prev.x, e.clientY - prev.y, st.natW, st.natH, fw(), fh());
      } else {
        const [a, b] = [...pts.values()];
        const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (gesture && gesture.dist > 0) {
          const q = framePoint(mid.x, mid.y);
          st.edit = zoom(st.edit, dist / gesture.dist, q.x, q.y, st.natW, st.natH, fw(), fh());
          st.edit = pan(st.edit, mid.x - gesture.mid.x, mid.y - gesture.mid.y, st.natW, st.natH, fw(), fh());
        }
        gesture = { mid, dist };
      }
      requestRender();
    });
    const endPointer = (e) => {
      if (!pts.delete(e.pointerId)) return;
      gesture = null;
      if (!pts.size) { stage.classList.remove('dragging'); sync(); commit(); }
    };
    stage.addEventListener('pointerup', endPointer);
    stage.addEventListener('pointercancel', endPointer);
    stage.addEventListener('lostpointercapture', endPointer);
    stage.addEventListener('wheel', (e) => {
      if (e.target.closest('.ims-tools')) return;
      e.preventDefault();
      hideHint();
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1;
      const dy = e.deltaY * unit;
      const f = Math.exp(-dy * (e.ctrlKey ? 0.01 : 0.0015));
      const q = framePoint(e.clientX, e.clientY);
      st.edit = zoom(st.edit, f, q.x, q.y, st.natW, st.natH, fw(), fh());
      requestRender(); sync(); commitSoon();
    }, { passive: false });
    stage.addEventListener('dblclick', (e) => { if (!e.target.closest('.ims-tools, .ims-hdl')) resetView(); });

    /* ----- free-form frame resizing ----- */
    function startResize(e, dir) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      hideHint();
      const hdl = e.currentTarget;
      try { hdl.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      cancelAnimationFrame(st.anim);
      st.anim = 0;
      const f0 = { ...st.frame };
      const g0 = geometry(st.edit, st.natW, st.natH, f0.w, f0.h);
      const C = { x: f0.x + g0.cx, y: f0.y + g0.cy }, sc = g0.scale, sx = e.clientX, sy = e.clientY;
      const MIN = 48, M = 6;
      stage.classList.add('resizing');
      const move = (ev) => {
        const dx = ev.clientX - sx, dy = ev.clientY - sy;
        let l = f0.x, t = f0.y, r = f0.x + f0.w, b = f0.y + f0.h;
        if (dir.includes('w')) l = lim(l + dx, M, r - MIN);
        if (dir.includes('e')) r = lim(r + dx, l + MIN, st.sw - M);
        if (dir.includes('n')) t = lim(t + dy, M, b - MIN);
        if (dir.includes('s')) b = lim(b + dy, t + MIN, st.sh - M);
        const nf = { x: l, y: t, w: r - l, h: b - t };
        st.override = nf;
        st.frame = nf;
        st.aspect = nf.w / nf.h;
        // keep the image still on screen while the frame changes
        const g1 = geometry({ ...st.edit, zoom: 1 }, st.natW, st.natH, nf.w, nf.h);
        st.edit = clamp(withOffset(g1, sc / g1.base, C.x - (nf.x + nf.w / 2), C.y - (nf.y + nf.h / 2), sc), st.natW, st.natH, nf.w, nf.h);
        requestRender();
      };
      const up = () => {
        hdl.removeEventListener('pointermove', move);
        hdl.removeEventListener('pointerup', up);
        hdl.removeEventListener('pointercancel', up);
        stage.classList.remove('resizing');
        const from = { ...st.frame };
        st.override = null;
        layout();
        const to = fitted();
        const t0 = performance.now();
        const step = (now) => {
          const k = Math.min(1, (now - t0) / 220), q = 1 - Math.pow(1 - k, 3);
          st.frame = { x: from.x + (to.x - from.x) * q, y: from.y + (to.y - from.y) * q, w: from.w + (to.w - from.w) * q, h: from.h + (to.h - from.h) * q };
          render();
          st.anim = k < 1 ? requestAnimationFrame(step) : 0;
          if (!st.anim) { layout(); render(); }
        };
        st.anim = requestAnimationFrame(step);
        sync(); commit();
      };
      hdl.addEventListener('pointermove', move);
      hdl.addEventListener('pointerup', up);
      hdl.addEventListener('pointercancel', up);
    }

    /* ----- drop an image file to replace ----- */
    if (st.allowReplace) {
      let depth = 0;
      const isFile = (e) => e.dataTransfer && [...e.dataTransfer.types].includes('Files');
      stage.addEventListener('dragenter', (e) => { if (!isFile(e)) return; e.preventDefault(); depth++; stage.classList.add('drop-on'); });
      stage.addEventListener('dragover', (e) => { if (!isFile(e)) return; e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = 'copy'; stage.classList.add('drop-on'); });
      stage.addEventListener('dragleave', () => { depth = Math.max(0, depth - 1); if (!depth) stage.classList.remove('drop-on'); });
      stage.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        depth = 0;
        stage.classList.remove('drop-on');
        const f = [...(e.dataTransfer ? e.dataTransfer.files : [])].find((x) => /^image\//.test(x.type));
        if (f) useFile(f); else notify('Drop an image file (JPG, PNG, WebP…)');
      });
    }

    /* ----- keyboard ----- */
    function focusables() {
      return [...dialog.querySelectorAll('button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter((n) => n.offsetParent !== null && !n.closest('[hidden]'));
    }
    function onKey(e) {
      if (st.closed) return;
      e.stopPropagation(); // keep app / canvas shortcuts away while the editor is open
      const t = e.target, k = e.key, mod = e.ctrlKey || e.metaKey;
      const inInput = t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || t instanceof HTMLSelectElement;
      const isRange = inInput && t.type === 'range';
      if (k === 'Escape') { e.preventDefault(); cancel(); return; }
      if (k === 'Tab') {
        const f = focusables();
        if (!f.length) return;
        const i = f.indexOf(document.activeElement);
        if (i < 0 || !dialog.contains(document.activeElement)) { e.preventDefault(); f[0].focus(); }
        else if (e.shiftKey && i === 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
        return;
      }
      if (mod) {
        const l = k.toLowerCase();
        if (l === 'z') { e.preventDefault(); if (e.shiftKey) redo(); else undo(); }
        else if (l === 'y') { e.preventDefault(); redo(); }
        else if (l === 'p' || l === 's') e.preventDefault();
        return;
      }
      if (k === 'Enter') {
        if (t.closest && t.closest('button, a, select, textarea, input[type="color"], input[type="text"], input[type="file"]')) return;
        e.preventDefault();
        apply();
        return;
      }
      if (inInput && !isRange) return;
      if (k.startsWith('Arrow')) {
        if (isRange) return;
        e.preventDefault();
        hideHint();
        const s = e.shiftKey ? 20 : 2;
        const dx = k === 'ArrowLeft' ? -s : k === 'ArrowRight' ? s : 0, dy = k === 'ArrowUp' ? -s : k === 'ArrowDown' ? s : 0;
        st.edit = pan(st.edit, dx, dy, st.natW, st.natH, fw(), fh());
        requestRender(); commitSoon();
      } else if (k === '+' || k === '=') { e.preventDefault(); zoomBy(1.1); }
      else if (k === '-' || k === '_') { e.preventDefault(); zoomBy(1 / 1.1); }
      else if (k === '0') { e.preventDefault(); resetView(); }
      else if (k === '\\' && !e.repeat) { e.preventDefault(); setCompare(true); }
    }
    function onKeyUp(e) {
      if (st.closed) return;
      e.stopPropagation();
      if (e.key === '\\') setCompare(false);
    }

    /* ----- mount ----- */
    document.body.append(root);
    document.body.classList.add('ims-open');
    imgEl.src = underEl.src = st.preview.url;
    setTab('crop');
    const ro = new ResizeObserver(() => { if (st.closed) return; layout(); reclamp(); render(); });
    ro.observe(stage);
    layout();
    reclamp();
    render();
    sync();
    commit();
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('keyup', onKeyUp, true);
    dialog.focus({ preventScroll: true });
    st.hintT = setTimeout(hideHint, 7000);

    const api = {
      close: (r) => close(r == null ? null : r),
      get state() { return { edit: norm(st.edit), aspect: st.aspect, aspectKey: st.aspectKey, shape: st.shape, frame: { ...st.frame }, natW: st.natW, natH: st.natH }; },
      root, apply, cancel,
    };
    return api;
  }

  function place(edit, natW, natH, W, H) {
    const g = geometry(edit, natW, natH, W, H);
    const w = natW * g.scale, hh = natH * g.scale;
    return {
      position: 'absolute', maxWidth: 'none', maxHeight: 'none', objectFit: 'fill', transformOrigin: '50% 50%',
      width: px(w), height: px(hh), left: px(g.cx - w / 2), top: px(g.cy - hh / 2),
      transform: `rotate(${r4(g.e.rot)}deg) scale(${g.fx}, ${g.fy})`,
      filter: cssFilter(g.e, Math.max(W, H)),
    };
  }

  return {
    open,
    isOpen: () => !!S,
    close: () => { if (S) S.close(null); },
    get session() { return S; },
    bake, defaultEdit, presets, applyPreset, readFile, loadImage,
    place, pan, zoom, clamp, cssFilter, vignetteCSS, shapeRadius, outputSize, geometry,
    normalize: norm,
    capabilities: () => ({ ...caps() }),
    _forceCaps: (c) => { forcedCaps = c ? { filter: !!c.filter, url: !!c.url } : null; },
  };
})();
