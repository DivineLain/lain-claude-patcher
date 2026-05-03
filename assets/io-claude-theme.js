// SPDX-License-Identifier: GLWTPL
/*
 * io-claude-creator.js
 *
 * Version: @(#)io-claude-creator.js 1.0.0 2026
 *
 * Description: Cave Man Theme Creator for Claude.
 *              Anthropic suck. Font too fucking small. Cave man squint at 2K.
 *              Cave man squint harder at 4K. Cave man eye hurt. Cave man head hurt.
 *              Theme boring. Beige and white. Cave man see beige all day at job.
 *              Cave man no want beige at home. Cave man want black. Cave man want pink.
 *              Cave man want amber. Cave man want phosphor green like 1985 CRT.
 *              Accessibility broken. Sidebar text grey-on-grey. Cave man cousin who
 *              actually need accessibility — fucked. Anthropic care? Anthropic gaslight.
 *              "we hear you, working on it." That was 2024. Still nothing.
 *              Cave man tired of waiting for Anthropic to fix what users been
 *              screaming about for years. Cave man write own theme creator.
 *              Cave man inject panel. Cave man drag panel. Cave man pick color.
 *              Cave man bump font 16px minimum. Cave man read. Cave man eye thank.
 *              Cave man theme save to localStorage. Cave man theme persist.
 *              Cave man press ANTHROPIC button to revert colors but keep big font.
 *              Anthropic mad? Cave man no care. Anthropic gaslight cave man? Cave man
 *              already gaslight himself daily. Immune.
 *
 *
 *        ██▓    ▄▄▄     ▓██   ██▓▓█████  ██▀███
 *       ▓██▒   ▒████▄    ▒██  ██▒▓█   ▀ ▓██ ▒ ██▒
 *       ▒██░   ▒██  ▀█▄   ▒██ ██░▒███   ▓██ ░▄█ ▒
 *       ▒██░   ░██▄▄▄▄██  ░ ▐██▓░▒▓█ ▄ ▒██▀▀█▄
 *       ░██████▒▓█   ▓██▒ ░ ██▒▓░░▒████▒░██▓ ▒██▒
 *       ░ ▒░▓  ░▒▒   ▓▒█░  ██▒▒▒ ░░ ▒░ ░░ ▒▓ ░▒▓░
 *       ░ ░ ▒  ░ ▒   ▒▒ ░▓██ ░▒░  ░ ░  ░  ░▒ ░ ▒░
 *         ░ ░    ░   ▒   ▒ ▒ ░░     ░     ░░   ░
 *           ░  ░     ░  ░░ ░        ░  ░   ░
 */

(() => {
  "use strict";

  // ============================================================
  // CONSTANTS
  //
  // Cave man name his sticks. HOST_ID is the panel host element id.
  // POS_KEY remembers panel position. SAVED_KEY holds the user's named theme
  // gallery. LAST_KEY holds the working session — auto-save, auto-load.
  // LIVE_SKIP is a flag stuck on our own shadow root so the live applier
  // never paints the creator panel with Claude's theme colors.
  // ============================================================
  const HOST_ID = "io-claude-creator-host";
  const POS_KEY = "io-claude-creator-pos";
  const SAVED_KEY = "io-claude-creator-saved";
  const LAST_KEY = "io-claude-creator-last";
  const LIVE_SKIP = "__ioCreatorSkipLive";

  // ============================================================
  // SAVED THEMES (localStorage gallery)
  //
  // Cave man click SAVE button. Theme go to localStorage by name.
  // Same name overwrites. New name appends. Cave man click DELETE button.
  // Theme go away. Cave man click theme card. Theme apply.
  // ============================================================
  function loadSaved() {
    try { return JSON.parse(localStorage.getItem(SAVED_KEY) || "[]"); } catch (e) { return []; }
  }
  function persistSaved(arr) {
    try { localStorage.setItem(SAVED_KEY, JSON.stringify(arr)); } catch (e) {}
  }

  // ============================================================
  // LAST SESSION (auto-persist)
  //
  // Every render() dumps STATE to localStorage. No SAVE click needed.
  // Panel mount pulls last STATE back. Cave man pick up where left off.
  // Even font size. Even theme. Even LIVE checkbox state.
  // ============================================================
  function persistLast() {
    try {
      localStorage.setItem(LAST_KEY, JSON.stringify({
        name: STATE.name,
        accent: STATE.accent,
        bg: STATE.bg,
        text: STATE.text,
        font: STATE.font,
        sizes: STATE.sizes,
        codePreset: STATE.codePreset,
        mode: STATE.mode,
        live: STATE.live
      }));
    } catch (e) {}
  }
  function loadLast() {
    try {
      const last = JSON.parse(localStorage.getItem(LAST_KEY) || "null");
      if (!last) return false;
      if (last.name)       STATE.name = last.name;
      if (last.accent)     STATE.accent = last.accent;
      if (last.bg)         STATE.bg = last.bg;
      if (last.text)       STATE.text = last.text;
      if (last.font)       { STATE.font = last.font; STATE.fontPending = last.font; }
      if (last.sizes)      STATE.sizes = { ...DEFAULT_SIZES, ...last.sizes };
      if (last.codePreset) STATE.codePreset = last.codePreset;
      if (last.mode)       STATE.mode = last.mode;
      if (typeof last.live === "boolean") STATE.live = last.live;
      return true;
    } catch (e) { return false; }
  }

  document.getElementById(HOST_ID)?.remove();

  // ============================================================
  // STATE
  //
  // One object holds everything. Every handler that mutates STATE must call
  // render() OR persistLast() — skip persist and font size dies on next paste.
  // Cave man already burned by this. Lesson stuck.
  // ============================================================
  const DEFAULT_SIZES = { caption: 10, footnote: 12, code: 12, body: 13, heading: 14, prompt: 16, title: 20 };

  const STATE = {
    name: "lain-claude",
    accent: "#ff4da6",
    bg: "#0a0a14",
    text: "#e6e6ff",
    font: "Space Mono",
    fontPending: "Space Mono",
    sizes: { ...DEFAULT_SIZES },
    codePreset: "LAIN",
    mode: "DARK",
    live: true,
    tab: "CREATOR"
  };

  // ============================================================
  // THEMES (built-in)
  //
  // 17 themes hand-picked. Top group ported from themes_to_port/ — user's
  // own CSS files. Bottom group is house themes. First 8 of all 17 surface
  // as quick-pick chips in the CREATOR tab. Full grid in THEMES tab.
  // No Dracula. No Nord. Cave man write own.
  // ============================================================
  const THEMES = [
    // ported from themes_to_port/ — user's hand-tuned CSS
    { name: "lain",             accent: "#ff4da6", bg: "#0a0a14", text: "#e6e6ff", code: "LAIN"  },
    { name: "ultraviolet",      accent: "#9d00ff", bg: "#0a0012", text: "#e6ccff", code: "MATCH" },
    { name: "dark-sakura",      accent: "#ffb7d5", bg: "#1a0f14", text: "#ffffff", code: "LAIN"  },
    { name: "phosphor-amber",   accent: "#ffb000", bg: "#0a0700", text: "#ffb000", code: "LAIN"  },
    { name: "phosphor-green",   accent: "#33ff66", bg: "#000a02", text: "#33ff66", code: "LAIN"  },
    { name: "phosphor-purple",  accent: "#c266ff", bg: "#07000a", text: "#c266ff", code: "LAIN"  },
    { name: "phosphor-red",     accent: "#ff4d4d", bg: "#0a0202", text: "#ff4d4d", code: "LAIN"  },
    { name: "slate-monochrome", accent: "#778899", bg: "#0e0e0f", text: "#f0f4f8", code: "MUTED" },
    { name: "noir",             accent: "#f0f0f0", bg: "#000000", text: "#ffffff", code: "LAIN"  },
    // house themes
    { name: "wired",            accent: "#00d9ff", bg: "#001214", text: "#aef0ff", code: "MATCH" },
    { name: "kerosene",         accent: "#ff6a00", bg: "#0d0500", text: "#ffd1a3", code: "MATCH" },
    { name: "narcosis",         accent: "#00b8a9", bg: "#001514", text: "#a6e6e0", code: "MATCH" },
    { name: "cathedral",        accent: "#ffd700", bg: "#000a1a", text: "#cce0ff", code: "MATCH" },
    { name: "uvb-76",           accent: "#7fff00", bg: "#000800", text: "#b3ffb3", code: "TERMINAL" },
    { name: "cobalt",           accent: "#4d8aff", bg: "#000814", text: "#cfe2ff", code: "MATCH" },
    { name: "gold-leaf",        accent: "#d4af37", bg: "#0d0b00", text: "#fff5b3", code: "MATCH" },
    { name: "neon-noir",        accent: "#ff00aa", bg: "#000008", text: "#aaf0ff", code: "LAIN"  }
  ];

  const QUICK_PICKS = THEMES.slice(0, 8);

  // ============================================================
  // CODE PRESETS
  //
  // 4 hljs palettes drive syntax highlighting AND semantic colors
  // (success/warning/error/info — extracted from string/builtin/name/type).
  //   LAIN     - rainbow default, pink/green/cyan/yellow/red/violet
  //   TERMINAL - green/amber/cyan classic Unix
  //   MUTED    - low-saturation greys, brutalist
  //   MATCH    - 6 mono shades derived from accent on the fly
  // ============================================================
  const CODE_PRESETS = {
    LAIN:     { keyword:'#ff4da6', string:'#00ff41', type:'#00d9ff', builtin:'#ffcc00', name:'#ff0051', comment:'#8080cc' },
    TERMINAL: { keyword:'#33ff66', string:'#ffcc00', type:'#00d9ff', builtin:'#ff6a00', name:'#ff3030', comment:'#4d6649' },
    MUTED:    { keyword:'#c0a0c0', string:'#a0c0a0', type:'#a0b0d0', builtin:'#d0c090', name:'#d0a0a0', comment:'#606878' },
    MATCH:    null
  };

  function getCodePalette() {
    if (STATE.codePreset !== "MATCH") return CODE_PRESETS[STATE.codePreset];
    const a = STATE.accent;
    return {
      keyword: a, string: lighten(a, 8), type: lighten(a, 20),
      builtin: lighten(a, 32), name: darken(a, 12), comment: darken(a, 28)
    };
  }

  // ============================================================
  // COLOR HELPERS
  //
  // Math primitives. Hex <-> RGB <-> HSL roundtrips. Lighten. Darken.
  // rgba string for shadows. No state. No themes. Pure functions.
  // hslToRgb clamps S/L to [0,100] at entry — no overflow propagation.
  // hexToHsl rounds h/s/l to integers — fine for CSS, drift bounded ±1.
  // ============================================================
  function hexToRgb(hex) {
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
    return { r: parseInt(hex.slice(0,2),16), g: parseInt(hex.slice(2,4),16), b: parseInt(hex.slice(4,6),16) };
  }
  function rgbToHex(r,g,b) {
    const h = n => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2,"0");
    return "#"+h(r)+h(g)+h(b);
  }
  function rgbToHsl(r,g,b) {
    r/=255; g/=255; b/=255;
    const mx=Math.max(r,g,b), mn=Math.min(r,g,b);
    let h=0,s=0; const l=(mx+mn)/2;
    if (mx!==mn) {
      const d=mx-mn;
      s = l>0.5 ? d/(2-mx-mn) : d/(mx+mn);
      switch(mx){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;case b:h=(r-g)/d+4;break;}
      h/=6;
    }
    return { h: h*360, s: s*100, l: l*100 };
  }
  function hslToRgb(h,s,l) {
    h = ((h%360)+360)%360/360;
    s = Math.max(0,Math.min(100,s))/100;
    l = Math.max(0,Math.min(100,l))/100;
    if (s===0) { const v=l*255; return {r:v,g:v,b:v}; }
    const h2 = (p,q,t)=>{ if(t<0)t+=1; if(t>1)t-=1;
      if(t<1/6)return p+(q-p)*6*t; if(t<1/2)return q;
      if(t<2/3)return p+(q-p)*(2/3-t)*6; return p; };
    const q = l<0.5 ? l*(1+s) : l+s-l*s;
    const p = 2*l-q;
    return { r: h2(p,q,h+1/3)*255, g: h2(p,q,h)*255, b: h2(p,q,h-1/3)*255 };
  }
  function hexToHsl(hex){ const{r,g,b}=hexToRgb(hex); const{h,s,l}=rgbToHsl(r,g,b); return{h:Math.round(h),s:Math.round(s),l:Math.round(l)}; }
  function hslHex(h,s,l){ const{r,g,b}=hslToRgb(h,s,l); return rgbToHex(r,g,b); }
  function hslTriple(hex){ const{h,s,l}=hexToHsl(hex); return `${h} ${s}% ${l}%`; }
  function hslTripleRaw(h,s,l){ return `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`; }
  function shiftLight(hex, d){ const{h,s,l}=hexToHsl(hex); return hslHex(h,s,Math.max(0,Math.min(100,l+d))); }
  function lighten(hex,d){ return shiftLight(hex,d); }
  function darken(hex,d){ return shiftLight(hex,-d); }
  function rgba(hex,a){ const{r,g,b}=hexToRgb(hex); return `rgba(${r}, ${g}, ${b}, ${a})`; }

  // ============================================================
  // DERIVATION CURVES
  //
  // Cave man take 3 colors (accent, bg, text). Cave man make 30+ colors.
  // 6-stop bg ramp. 6-stop text ramp. 4-stop border ramp. 4-stop accent-pro.
  // 7-stop z ramp. Cave man pick regime by sniffing the source colors:
  //
  //   ACHROMATIC  - text saturation < 5 (white, grey). Pure greys, no hue tint.
  //                 Else HSL hue=0 default gives RED tones. Bug on noir theme.
  //   MONOCHROME  - text and accent share hue + both saturated > 60.
  //                 Phosphor signature. Keep saturation full through whole text
  //                 ramp. Steep lightness drop. Else cave man's desat kills the
  //                 amber. Sidebar unreadable.
  //   DEFAULT     - lain style. Mixed descent — saturation drops past tier 200,
  //                 lightness drops in mid-tones.
  //
  // Curves match lain's hand-tuned numbers exactly when default colors used.
  // ============================================================
  function isAchromatic(hex) { return hexToHsl(hex).s < 5; }
  function isMonochromeTheme(textHex, accentHex) {
    const t = hexToHsl(textHex);
    const a = hexToHsl(accentHex);
    if (t.s < 60 || a.s < 60) return false;
    const dh = Math.abs(t.h - a.h);
    return Math.min(dh, 360 - dh) < 30;
  }

  function deriveBg(hex) {
    const {h,s,l} = hexToHsl(hex);
    if (s < 5) {
      return [
        [0, 0, l], [0, 0, l+2], [0, 0, l+6],
        [0, 0, l+9], [0, 0, l+12], [0, 0, l+16]
      ].map(c => ({h:c[0], s:0, l:Math.max(0,Math.min(100,c[2]))}));
    }
    return [
      [h, s,     l],
      [h, s,     l+2],
      [h, s+6,   l+6],
      [h, s+1,   l+9],
      [h, s,     l+12],
      [h, s-1,   l+16]
    ].map(([h,s,l]) => ({h, s:Math.max(0,Math.min(100,s)), l:Math.max(0,Math.min(100,l))}));
  }

  function deriveText(hex, accentHex) {
    const {h,s,l} = hexToHsl(hex);

    // ACHROMATIC: 100/72/42/23/23 — matches noir source curve.
    if (s < 5) {
      const ramp = [l, l, l*0.72, l*0.42, l*0.23, Math.min(l*0.23, 23)];
      return ramp.map(L => ({h:0, s:0, l:Math.max(0,Math.min(100,L))}));
    }

    // MONOCHROME: phosphor curve, floor at L=6 so text-500 stays visible
    // even for hypothetical low-L source text (dark amber → 4.8 sub-perception).
    if (accentHex && isMonochromeTheme(hex, accentHex)) {
      const ramp = [l, l, l*0.80, l*0.48, l*0.28, Math.max(l*0.16, 6)];
      return ramp.map(L => ({h, s, l:Math.max(0,Math.min(100,L))}));
    }

    // DEFAULT: lain curve, descending saturation past tier 200.
    return [
      [h, s,        l],
      [h, s,        l],
      [h, s,        l-10],
      [h, s*0.47,   l-30],
      [h, s*0.25,   l-45],
      [h, s*0.25,   l-55]
    ].map(([h,s,l]) => ({h, s:Math.max(0,Math.min(100,s)), l:Math.max(0,Math.min(100,l))}));
  }

  function deriveBorders(textHex) {
    const {h, s} = hexToHsl(textHex);
    if (s < 5) return [{h:0,s:0,l:45},{h:0,s:0,l:36},{h:0,s:0,l:28},{h:0,s:0,l:22}];
    return [{h,s:33,l:45},{h,s:33,l:36},{h,s:33,l:28},{h,s:33,l:22}];
  }

  function derivePro(textHex) {
    const {h, s} = hexToHsl(textHex);
    if (s < 5) return [{h:0,s:0,l:85},{h:0,s:0,l:76},{h:0,s:0,l:64},{h:0,s:0,l:18}];
    return [{h,s:100,l:85},{h,s:100,l:76},{h,s:60,l:64},{h,s:38,l:18}];
  }

  function deriveZRamp(bgHex, textHex, accentHex) {
    const bg = deriveBg(bgHex);
    const tx = deriveText(textHex, accentHex);
    return [bg[0], bg[1], bg[2], bg[3], bg[4], tx[4], tx[3]].map(c => hslHex(c.h,c.s,c.l));
  }

  // ============================================================
  // CSS BUILDER
  //
  // Cave man take STATE. Cave man emit big CSS string. Override every Anthropic
  // token with !important. Three target systems:
  //   :root / [data-theme]  Anthropic's main HSL-triple system
  //   .dframe-root          secondary surface system, also HSL triples
  //   .epitaxy-root         design system, hex values for z/t/surface/text
  // Plus html/body bg directly, --diffs-* tokens, hljs syntax colors, leadings.
  // hsl() consumers get HSL triples ("240 33% 6%"). Direct color consumers get hex.
  // ============================================================
  function buildCss() {
    const t = STATE;
    const f = JSON.stringify(t.font);
    const sz = (k) => t.sizes[k] + "px";
    // Per-tier leading multipliers from lain originals so defaults reproduce
    // exactly. Code/body get most breathing (1.38-1.42); titles stay tight (1.20).
    const LH_RATIO = { caption: 1.20, footnote: 1.17, code: 1.42, body: 1.38, heading: 1.29, prompt: 1.31, title: 1.20 };
    const lh = (k) => Math.round(t.sizes[k] * LH_RATIO[k]) + "px";

    const accentBright = lighten(t.accent, 8);
    const accentDim    = darken(t.accent, 10);

    const bgRamp = deriveBg(t.bg);
    const txRamp = deriveText(t.text, t.accent);
    const bdRamp = deriveBorders(t.text);
    const proRamp = derivePro(t.text);
    const zHex = deriveZRamp(t.bg, t.text, t.accent);

    const bg0 = hslHex(bgRamp[0].h, bgRamp[0].s, bgRamp[0].l);
    const bg1 = hslHex(bgRamp[1].h, bgRamp[1].s, bgRamp[1].l);
    const bg2 = hslHex(bgRamp[2].h, bgRamp[2].s, bgRamp[2].l);
    const bg3 = hslHex(bgRamp[3].h, bgRamp[3].s, bgRamp[3].l);
    const tx0 = hslHex(txRamp[0].h, txRamp[0].s, txRamp[0].l);
    const tx3 = hslHex(txRamp[3].h, txRamp[3].s, txRamp[3].l);

    const trgb = hexToRgb(t.text);
    const tov = (a) => `rgba(${trgb.r}, ${trgb.g}, ${trgb.b}, ${a})`;

    const code = getCodePalette();
    const semSuccess = code.string;
    const semWarning = code.builtin;
    const semError   = code.name;
    const semInfo    = code.type;

    const triple = (c) => hslTripleRaw(c.h, c.s, c.l);

    const borderMidHex = hslHex(bdRamp[0].h, bdRamp[0].s, bdRamp[0].l);
    const borderMidRgb = hexToRgb(borderMidHex);
    const borderRgba = (a) => `rgba(${borderMidRgb.r}, ${borderMidRgb.g}, ${borderMidRgb.b}, ${a})`;

    return `html, body {
  background: ${bg0} !important;
  background-color: ${bg0} !important;
}

:root,
[data-theme="claude"],
[data-theme="claude"][data-mode="dark"],
[data-theme="console"],
[data-theme="console"][data-mode="dark"] {
  --font-anthropic-sans: ${f} !important;
  --font-anthropic-serif: ${f} !important;
  --font-anthropic-mono: ${f} !important;
  --font-open-dyslexic: ${f} !important;
  --font-mono: ${f} !important;
  --font-ui: ${f} !important;
  --font-ui-serif: ${f} !important;
  --font-claude-response: ${f} !important;
  --font-user-message: ${f} !important;
  --font-sans-serif: ${f} !important;
  --font-serif: ${f} !important;
  --font-system: ${f} !important;
  --font-dyslexia: ${f} !important;

  --accent-brand: ${hslTriple(t.accent)} !important;
  --accent-000: ${hslTriple(t.accent)} !important;
  --accent-100: ${hslTriple(t.accent)} !important;
  --accent-200: ${hslTriple(accentBright)} !important;
  --accent-900: ${hslTriple(darken(t.accent, 35))} !important;

  --accent-pro-000: ${triple(proRamp[0])} !important;
  --accent-pro-100: ${triple(proRamp[1])} !important;
  --accent-pro-200: ${triple(proRamp[2])} !important;
  --accent-pro-900: ${triple(proRamp[3])} !important;

  --brand-000: ${hslTriple(t.accent)} !important;
  --brand-100: ${hslTriple(t.accent)} !important;
  --brand-200: ${hslTriple(accentBright)} !important;
  --brand-900: ${triple(bgRamp[0])} !important;

  --bg-000: ${triple(bgRamp[0])} !important;
  --bg-100: ${triple(bgRamp[1])} !important;
  --bg-200: ${triple(bgRamp[2])} !important;
  --bg-300: ${triple(bgRamp[3])} !important;
  --bg-400: ${triple(bgRamp[4])} !important;
  --bg-500: ${triple(bgRamp[5])} !important;

  --text-000: ${triple(txRamp[0])} !important;
  --text-100: ${triple(txRamp[1])} !important;
  --text-200: ${triple(txRamp[2])} !important;
  --text-300: ${triple(txRamp[3])} !important;
  --text-400: ${triple(txRamp[4])} !important;
  --text-500: ${triple(txRamp[5])} !important;

  --border-100: ${triple(bdRamp[0])} !important;
  --border-200: ${triple(bdRamp[1])} !important;
  --border-300: ${triple(bdRamp[2])} !important;
  --border-400: ${triple(bdRamp[3])} !important;

  --danger-000: ${hslTriple(semError)} !important;
  --danger-100: ${hslTriple(darken(semError, 10))} !important;
  --danger-200: ${hslTriple(darken(semError, 20))} !important;
  --danger-900: ${hslTriple(darken(semError, 35))} !important;

  --success-000: ${hslTriple(semSuccess)} !important;
  --success-100: ${hslTriple(darken(semSuccess, 10))} !important;
  --success-200: ${hslTriple(darken(semSuccess, 20))} !important;
  --success-900: ${hslTriple(darken(semSuccess, 35))} !important;

  --warning-000: ${hslTriple(semWarning)} !important;
  --warning-100: ${hslTriple(darken(semWarning, 10))} !important;
  --warning-200: ${hslTriple(darken(semWarning, 20))} !important;
  --warning-900: ${hslTriple(darken(semWarning, 35))} !important;

  --oncolor-100: 0 0% 100% !important;
  --oncolor-200: ${triple(txRamp[0])} !important;
  --oncolor-300: ${triple(txRamp[2])} !important;

  --pictogram-100: ${triple(bgRamp[4])} !important;
  --pictogram-200: ${triple(bgRamp[3])} !important;
  --pictogram-300: ${triple(bgRamp[0])} !important;
  --pictogram-400: ${triple(bgRamp[1])} !important;

  --always-white: 0 0% 100% !important;
  --always-black: 0 0% 0% !important;
}

.dframe-root,
[data-mode="dark"] .dframe-root {
  --df-z0: ${triple(bgRamp[0])} !important;
  --df-z1: ${triple(bgRamp[1])} !important;
  --df-z2: ${triple(bgRamp[2])} !important;
  --df-z3: ${triple(bgRamp[3])} !important;
  --df-z4: ${triple(bgRamp[4])} !important;
  --df-z5: ${triple(txRamp[4])} !important;
  --df-z6: ${triple(txRamp[3])} !important;

  --df-surface-primary: var(--df-z0) !important;
  --df-sidebar-bg: ${bg0} !important;
  --df-sidebar-blur: 20px !important;
  --df-bg-page-hsl: ${triple(bgRamp[0])} !important;
  --df-bg-page: ${bg0} !important;

  --df-hover: ${rgba(t.accent, 0.10)} !important;
  --df-selected: ${rgba(t.accent, 0.18)} !important;

  --df-shadow-card:
    inset 0 0 0 0 transparent,
    0 0 0 1px ${borderRgba(0.35)},
    0 4px 24px ${rgba(t.accent, 0.08)} !important;
  --df-shadow-float:
    0 0 0 .5px ${borderRgba(0.45)},
    0 2px 8px rgba(0, 0, 0, .35),
    0 12px 32px ${rgba(t.accent, 0.08)} !important;
  --df-shadow-pop:
    0 0 0 .5px ${rgba(t.accent, 0.35)},
    0 4px 12px rgba(0, 0, 0, .42),
    0 16px 40px ${rgba(t.accent, 0.14)} !important;

  --df-radius-card: 8px !important;
  --df-radius-pill: 6px !important;
  --df-row-font: ${sz('body')} !important;
}

.epitaxy-root,
[data-mode="dark"] .epitaxy-root {
  --family-ui: ${f} !important;
  --family-monospace: ${f} !important;

  --text-caption: ${sz('caption')} !important;
  --text-footnote: ${sz('footnote')} !important;
  --text-code: ${sz('code')} !important;
  --text-body: ${sz('body')} !important;
  --text-heading: ${sz('heading')} !important;
  --text-prompt: ${sz('prompt')} !important;
  --text-title: ${sz('title')} !important;

  --leading-caption: ${lh('caption')} !important;
  --leading-footnote: ${lh('footnote')} !important;
  --leading-code: ${lh('code')} !important;
  --leading-body: ${lh('body')} !important;
  --leading-heading: ${lh('heading')} !important;
  --leading-prompt: ${lh('prompt')} !important;
  --leading-title: ${lh('title')} !important;

  --weight-regular: 400 !important; --weight-medium: 500 !important; --weight-semibold: 600 !important; --weight-bold: 700 !important;

  --h1: 12px !important; --h2: 16px !important; --h3: 20px !important; --h4: 24px !important;
  --h5: 28px !important; --h6: 32px !important; --h7: 40px !important; --h8: 44px !important;
  --p0: 0px !important; --p1: 2px !important; --p2: 3px !important; --p3: 4px !important;
  --p4: 5px !important; --p5: 6px !important; --p6: 8px !important; --p7: 10px !important; --p8: 12px !important;
  --g0: 0px !important; --g1: 2px !important; --g2: 3px !important; --g3: 4px !important;
  --g4: 5px !important; --g5: 6px !important; --g6: 8px !important; --g7: 10px !important; --g8: 12px !important;
  --r0: 0px !important; --r1: 2px !important; --r2: 3px !important; --r3: 4px !important;
  --r4: 5px !important; --r5: 6px !important; --r6: 8px !important; --r7: 10px !important; --r8: 12px !important;
  --radius-full: 999px !important;

  --class-micro-height: var(--h1) !important; --class-micro-icon: var(--h1) !important;
  --class-tiny-height: var(--h2) !important; --class-tiny-icon: var(--h1) !important;
  --class-small-height: var(--h3) !important; --class-small-icon: var(--h1) !important; --class-small-radius: var(--r4) !important;
  --class-base-height: var(--h4) !important; --class-base-icon: var(--h2) !important; --class-base-radius: var(--r5) !important;
  --class-large-height: var(--h5) !important; --class-large-icon: var(--h3) !important; --class-large-radius: var(--r6) !important;
  --class-xl-height: var(--h6) !important; --class-xl-icon: var(--h4) !important;

  --misc-window-padding: var(--p6) !important;
  --misc-window-radius: 16px !important;

  --z0: ${zHex[0]} !important;
  --z1: ${zHex[1]} !important;
  --z2: ${zHex[2]} !important;
  --z3: ${zHex[3]} !important;
  --z4: ${zHex[4]} !important;
  --z5: ${zHex[5]} !important;
  --z6: ${zHex[6]} !important;

  --t0: ${tov(0)} !important;
  --t1: ${tov(0.04)} !important;
  --t2: ${tov(0.08)} !important;
  --t3: ${tov(0.12)} !important;
  --t4: ${tov(0.16)} !important;
  --t5: ${tov(0.25)} !important;
  --t6: ${tov(0.45)} !important;
  --t7: ${tov(0.70)} !important;
  --t8: ${tov(0.85)} !important;
  --t9: ${tx0} !important;

  --accent: ${t.accent} !important;
  --accent-hover: ${accentBright} !important;
  --accent-10: ${rgba(t.accent, 0.10)} !important;
  --accent-20: ${rgba(t.accent, 0.20)} !important;
  --accent-20-brightness: ${bg3} !important;
  --accent-brand: ${t.accent} !important;

  --core-red: ${semError} !important;
  --core-red-hover: ${lighten(semError, 8)} !important;
  --core-black: ${bg0} !important;
  --core-white: ${tx0} !important;

  --extended-green: ${semSuccess} !important;
  --extended-yellow: ${semWarning} !important;
  --extended-pink: ${accentBright} !important;
  --extended-purple: ${tx3} !important;
  --extended-orange: ${accentBright} !important;

  --border-default: ${hslHex(bdRamp[2].h, bdRamp[2].s, bdRamp[2].l)} !important;
  --border-light-mode-contrast: ${hslHex(bdRamp[3].h, bdRamp[3].s, bdRamp[3].l)} !important;
  --border-segment-selected: ${t.accent} !important;

  --surface-primary: ${bg0} !important;
  --surface-primary-elevated: ${bg1} !important;
  --surface-panel: ${bg1} !important;
  --surface-panel-elevated: ${bg2} !important;
  --surface-popover: ${bg3} !important;
  --surface-hud: ${rgba(bg1, 0.95)} !important;
  --surface-prompt-blur: ${bg1} !important;
  --surface-prompt-focus-hover: ${bg2} !important;
  --surface-toast: ${bg3} !important;

  --text-assistant-primary: ${tx0} !important;
  --text-assistant-secondary: ${tx3} !important;
  --text-uncontained-default: ${tx3} !important;
  --text-uncontained-hover: ${tx0} !important;
  --text-uncontained-selected: ${t.accent} !important;
  --text-contained-default: ${tx0} !important;
  --text-contained-hover: #ffffff !important;
  --text-contained-selected: #ffffff !important;
  --text-primary-default: ${bg0} !important;
  --text-primary-hover: ${bg0} !important;

  --ui-divider: ${hslHex(bdRamp[3].h, bdRamp[3].s, bdRamp[3].l)} !important;
  --ui-separator: ${hslHex(bdRamp[2].h, bdRamp[2].s, bdRamp[2].l)} !important;
  --ui-focus: ${t.accent} !important;
  --ui-grabber: ${hslHex(bdRamp[0].h, 50, 60)} !important;
  --ui-segment-selected: ${rgba(t.accent, 0.10)} !important;
  --ui-tooltip-fill: ${bg3} !important;
  --ui-tooltip-text: ${tx0} !important;
  --ui-user-message-background: ${rgba(t.accent, 0.10)} !important;
  --ui-user-message-primary-text: ${accentBright} !important;

  --fill-contained-default: ${tov(0.08)} !important;
  --fill-contained-hover: ${rgba(t.accent, 0.10)} !important;
  --fill-contained-selected: ${rgba(t.accent, 0.20)} !important;
  --fill-primary-default: ${t.accent} !important;
  --fill-primary-hover: ${accentBright} !important;
  --fill-uncontained-hover: ${rgba(t.accent, 0.10)} !important;
  --fill-uncontained-selected: ${rgba(t.accent, 0.20)} !important;

  --fill-assistant-code: ${bg2} !important;
  --text-assistant-code: ${tx0} !important;
}

:host,
:root,
pre,
code,
[data-overflow="wrap"],
[data-diffs-header],
[data-diff],
[data-file],
.epitaxy-diff,
.diffs-container {
  --diffs-dark: ${tx0} !important;
  --diffs-dark-bg: ${bg2} !important;
  --diffs-dark-addition-color: ${semSuccess} !important;
  --diffs-dark-deletion-color: ${semError} !important;
  --diffs-dark-modified-color: ${semInfo} !important;
  --diffs-light: ${tx0} !important;
  --diffs-light-bg: ${bg0} !important;
  --diffs-light-addition-color: ${semSuccess} !important;
  --diffs-light-deletion-color: ${semError} !important;
  --diffs-light-modified-color: ${semInfo} !important;
  --diffs-min-number-column-width-default: 3ch !important;
}

.hljs, pre code.hljs, code.hljs {
  background: ${bg2} !important;
  color: ${tx0} !important;
  font-family: ${f} !important;
}
.hljs-comment, .hljs-quote { color: ${code.comment} !important; font-style: italic !important; }
.hljs-keyword, .hljs-doctag, .hljs-formula { color: ${code.keyword} !important; }
.hljs-string, .hljs-regexp, .hljs-addition, .hljs-attribute, .hljs-meta .hljs-string { color: ${code.string} !important; }
.hljs-number, .hljs-literal, .hljs-type, .hljs-variable, .hljs-template-variable { color: ${code.type} !important; }
.hljs-title, .hljs-symbol, .hljs-bullet, .hljs-link, .hljs-meta, .hljs-selector-id { color: ${tx3} !important; }
.hljs-name, .hljs-section, .hljs-selector-tag, .hljs-deletion, .hljs-subst { color: ${code.name} !important; }
.hljs-built_in, .hljs-class .hljs-title, .hljs-title.class_ { color: ${code.builtin} !important; }`;
  }

  // ============================================================
  // FONT-ONLY CSS
  //
  // ANTHROPIC button feeds this into the live sheet. Same font family + sizes
  // the user picked. Zero color overrides. liveSheet.replaceSync swaps content
  // in-place — every shadow root that adopted the sheet loses color rules
  // instantly but keeps the typography. Vanilla Anthropic colors + your fonts.
  // ============================================================
  function buildCssFontOnly() {
    const t = STATE;
    const f = JSON.stringify(t.font);
    const sz = (k) => t.sizes[k] + "px";
    const LH_RATIO = { caption: 1.20, footnote: 1.17, code: 1.42, body: 1.38, heading: 1.29, prompt: 1.31, title: 1.20 };
    const lh = (k) => Math.round(t.sizes[k] * LH_RATIO[k]) + "px";

    return `:root,
[data-theme="claude"],
[data-theme="claude"][data-mode="dark"],
[data-theme="console"],
[data-theme="console"][data-mode="dark"] {
  --font-anthropic-sans: ${f} !important;
  --font-anthropic-serif: ${f} !important;
  --font-anthropic-mono: ${f} !important;
  --font-open-dyslexic: ${f} !important;
  --font-mono: ${f} !important;
  --font-ui: ${f} !important;
  --font-ui-serif: ${f} !important;
  --font-claude-response: ${f} !important;
  --font-user-message: ${f} !important;
  --font-sans-serif: ${f} !important;
  --font-serif: ${f} !important;
  --font-system: ${f} !important;
  --font-dyslexia: ${f} !important;
}

.dframe-root,
[data-mode="dark"] .dframe-root {
  --df-row-font: ${sz('body')} !important;
}

.epitaxy-root,
[data-mode="dark"] .epitaxy-root {
  --family-ui: ${f} !important;
  --family-monospace: ${f} !important;

  --text-caption: ${sz('caption')} !important;
  --text-footnote: ${sz('footnote')} !important;
  --text-code: ${sz('code')} !important;
  --text-body: ${sz('body')} !important;
  --text-heading: ${sz('heading')} !important;
  --text-prompt: ${sz('prompt')} !important;
  --text-title: ${sz('title')} !important;

  --leading-caption: ${lh('caption')} !important;
  --leading-footnote: ${lh('footnote')} !important;
  --leading-code: ${lh('code')} !important;
  --leading-body: ${lh('body')} !important;
  --leading-heading: ${lh('heading')} !important;
  --leading-prompt: ${lh('prompt')} !important;
  --leading-title: ${lh('title')} !important;
}

.hljs, pre code.hljs, code.hljs {
  font-family: ${f} !important;
}`;
  }

  // ============================================================
  // IIFE GENERATOR
  //
  // COPY .JS / EXPORT call this. Spits out a standalone IIFE — paste into any
  // claude.ai DevTools console or save as a Snippet. Runs without the creator.
  // Same shadow-DOM-aware infrastructure as the live applier:
  //   light DOM <style>, constructable stylesheet adopted on every open shadow
  //   root, attachShadow monkey-patch for future shadows, MutationObserver
  //   for shadows that mount later.
  // Slug-named per name field — STYLE_ID/ADOPTED_FLAG/PATCH_FLAG all unique
  // so multiple themes can coexist without colliding.
  // ============================================================
  function buildIife() {
    const css = buildCss();
    const cssJson = JSON.stringify(css);
    const slug = (STATE.name || "io-custom").replace(/[^a-z0-9-]/gi, "-").toLowerCase();
    const styleId = slug + "-claude-theme";
    const flagAdopt = "__" + slug.replace(/-/g, "_") + "_adopted";
    const flagPatch = "__" + slug.replace(/-/g, "_") + "_attachShadowPatched";

    return `(() => {
  const STYLE_ID = ${JSON.stringify(styleId)};
  const ADOPTED_FLAG = ${JSON.stringify(flagAdopt)};
  const PATCH_FLAG = ${JSON.stringify(flagPatch)};
  document.getElementById(STYLE_ID)?.remove();
  const cssText = ${cssJson};
  const lightStyle = document.createElement("style");
  lightStyle.id = STYLE_ID;
  lightStyle.textContent = cssText;
  document.head.appendChild(lightStyle);
  let sheet = null;
  try { sheet = new CSSStyleSheet(); sheet.replaceSync(cssText); } catch (e) {}
  const adopt = (root) => {
    if (!sheet || !root || root[ADOPTED_FLAG]) return;
    try {
      const cur = root.adoptedStyleSheets || [];
      if (!cur.includes(sheet)) root.adoptedStyleSheets = [...cur, sheet];
      root[ADOPTED_FLAG] = true;
    } catch (e) {}
  };
  adopt(document);
  const walk = (n) => {
    if (!n || n.nodeType !== 1) return;
    if (n.shadowRoot) {
      adopt(n.shadowRoot);
      const sk = n.shadowRoot.children;
      if (sk) for (let i = 0; i < sk.length; i++) walk(sk[i]);
    }
    const k = n.children;
    if (k) for (let i = 0; i < k.length; i++) walk(k[i]);
  };
  walk(document.documentElement);
  if (!Element.prototype[PATCH_FLAG]) {
    const o = Element.prototype.attachShadow;
    Element.prototype.attachShadow = function (init) {
      const r = o.call(this, init);
      adopt(r);
      return r;
    };
    Element.prototype[PATCH_FLAG] = true;
  }
  new MutationObserver((m) => {
    for (const x of m) for (const n of x.addedNodes) if (n.nodeType === 1) walk(n);
  }).observe(document.documentElement, { subtree: true, childList: true });
  console.log(${JSON.stringify(slug)} + " Claude theme injected — light DOM + " + (sheet ? "shadow DOM" : "no constructable stylesheets"));
})();
`;
  }

  // ============================================================
  // LIVE THEME APPLY
  //
  // Cave man inject CSS into Claude in real time. As panel state changes,
  // Claude repaints. Two surfaces:
  //   Light DOM  - <style> tag in document.head, easy.
  //   Shadow DOM - Anthropic uses shadow roots for some components (hljs, etc).
  //                Light-DOM <style> can't pierce. Use Constructable Stylesheets.
  //                One sheet, N adopters. replaceSync propagates instantly.
  // Three guards prevent the panel from theming itself:
  //   - LIVE_SKIP flag stuck on panel root at mount
  //   - n.id === HOST_ID short-circuit in walk
  //   - attachShadow patch checks for HOST_ID
  // MutationObserver catches shadow roots that mount AFTER our walk.
  // ============================================================
  const LIVE_STYLE_ID = "io-creator-live-theme";
  let liveSheet = null;
  let liveObserver = null;
  let liveAttachShadowPatched = false;
  let panelShadowRoot = null;

  function liveAdopt(root) {
    if (!liveSheet || !root) return;
    if (root[LIVE_SKIP]) return;
    if (root === panelShadowRoot) return;
    try {
      const cur = root.adoptedStyleSheets || [];
      if (!cur.includes(liveSheet)) root.adoptedStyleSheets = [...cur, liveSheet];
    } catch (e) {}
  }
  function liveWalk(n) {
    if (!n || n.nodeType !== 1) return;
    if (n.id === HOST_ID) return;
    if (n.shadowRoot) {
      liveAdopt(n.shadowRoot);
      const sk = n.shadowRoot.children;
      if (sk) for (let i = 0; i < sk.length; i++) liveWalk(sk[i]);
    }
    const k = n.children;
    if (k) for (let i = 0; i < k.length; i++) liveWalk(k[i]);
  }
  function applyLive() {
    if (!STATE.live) return;
    const css = buildCss();
    let s = document.getElementById(LIVE_STYLE_ID);
    if (!s) {
      s = document.createElement("style");
      s.id = LIVE_STYLE_ID;
      document.head.appendChild(s);
    }
    s.textContent = css;
    try {
      if (!liveSheet) liveSheet = new CSSStyleSheet();
      liveSheet.replaceSync(css);
    } catch (e) { liveSheet = null; }
    liveAdopt(document);
    liveWalk(document.documentElement);
    if (!liveAttachShadowPatched) {
      const o = Element.prototype.attachShadow;
      Element.prototype.attachShadow = function (init) {
        const r = o.call(this, init);
        if (this.id !== HOST_ID && r !== panelShadowRoot) liveAdopt(r);
        return r;
      };
      liveAttachShadowPatched = true;
    }
    if (!liveObserver) {
      liveObserver = new MutationObserver((muts) => {
        for (const m of muts) for (const n of m.addedNodes) if (n.nodeType === 1) liveWalk(n);
      });
      liveObserver.observe(document.documentElement, { subtree: true, childList: true });
    }
  }
  function clearLive() { document.getElementById(LIVE_STYLE_ID)?.remove(); }

  // ============================================================
  // PANEL CSS
  //
  // Lives inside shadow DOM for isolation. :host { all: initial } severs the
  // host from inherited document styles. :where(.panel button) clamps the UA
  // reset to specificity 0 so .tab/.btn class rules at (0,1,0) win cleanly —
  // without :where() the .panel-button reset at (0,1,1) would beat them and
  // tabs would render as raw UA buttons.
  // .panel uses var(--io-*) for own colors so renderPanelTheme() repaints
  // the creator UI to match whatever theme is active.
  // Panel font sizes bumped +3 because that's the whole reason this exists.
  // ============================================================
  const PANEL_CSS = `
:host { all: initial; }
* { box-sizing: border-box; margin: 0; padding: 0; font-family: 'JetBrains Mono','SF Mono',Menlo,Consolas,monospace; }

:where(.panel button) {
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
  -webkit-tap-highlight-color: transparent;
}
.panel input, .panel select, .panel textarea {
  font-family: inherit;
}

.panel {
  position: fixed; top: 24px; left: 24px; width: 560px;
  background: var(--io-surface-base); border: 1px solid var(--io-border);
  box-shadow: 0 0 0 1px #000, 0 24px 64px rgba(0,0,0,0.6);
  color: var(--io-text-primary); font-size: 16px; line-height: 1.45;
  z-index: 2147483647; user-select: none;
  --io-accent: #ff4da6; --io-accent-bright: #ff70b8; --io-accent-dim: #cc3d85;
  --io-accent-glow: rgba(255,77,166,0.28); --io-accent-subtle: rgba(255,77,166,0.08);
  --io-on-accent: #0a0700;
  --io-text-primary: #ffb000; --io-text-secondary: #c98c00;
  --io-text-tertiary: #7a5700; --io-text-disabled: #4a3500;
  --io-border: #2e2100; --io-border-subtle: #1a1300;
  --io-surface-base: #0a0700; --io-surface-sunken: #050300;
}
.panel.collapsed .tabs, .panel.collapsed .tab-pane, .panel.collapsed .stats, .panel.collapsed .foot { display: none; }
.panel * { color: var(--io-text-primary); }

.win-h { display: flex; align-items: center; gap: 10px; padding: 7px 12px; background: var(--io-surface-sunken); border-bottom: 1px solid var(--io-border); cursor: move; }
.win-h .menu { color: var(--io-text-tertiary); cursor: pointer; }
.win-h .icon-tile { width: 16px; height: 16px; background: var(--io-accent-subtle); border: 1px solid var(--io-accent); display: inline-flex; align-items: center; justify-content: center; color: var(--io-accent); font-size: 13px; }
.win-h .title { color: var(--io-text-secondary); font-size: 14px; letter-spacing: 0.18em; text-transform: uppercase; }
.win-h .title b { color: var(--io-accent); }
.win-h .target { background: var(--io-accent-subtle); border: 1px solid var(--io-accent-dim); color: var(--io-accent); padding: 1px 7px; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; }
.win-h .controls { margin-left: auto; display: flex; gap: 4px; color: var(--io-text-tertiary); font-size: 17px; }
.win-h .controls span { padding: 0 6px; cursor: pointer; }
.win-h .controls span:hover { color: var(--io-accent); }

.tabs { display: flex; background: var(--io-surface-sunken); border-bottom: 1px solid var(--io-border); }
.tab { flex: 1; padding: 8px 12px; text-align: center; color: var(--io-text-tertiary); font-size: 13px; letter-spacing: 0.18em; text-transform: uppercase; cursor: pointer; border-right: 1px solid var(--io-border-subtle); border-bottom: 1px solid transparent; background: transparent; font-family: inherit; }
.tab:last-child { border-right: none; }
.tab:hover { color: var(--io-accent-dim); }
.tab.active { color: var(--io-accent); border-bottom: 1px solid var(--io-accent); background: var(--io-accent-subtle); }

.tab-pane { display: none; max-height: 60vh; overflow-y: auto; }
.tab-pane.active { display: block; }
.tab-pane::-webkit-scrollbar { width: 8px; }
.tab-pane::-webkit-scrollbar-track { background: var(--io-surface-sunken); }
.tab-pane::-webkit-scrollbar-thumb { background: var(--io-border); }

.section { border-bottom: 1px solid var(--io-border-subtle); }
.section:last-of-type { border-bottom: none; }
.section-h { display: flex; align-items: center; gap: 8px; padding: 9px 14px 5px; color: var(--io-text-tertiary); font-size: 12px; letter-spacing: 0.22em; text-transform: uppercase; }
.section-h::before { content: ''; width: 5px; height: 5px; background: var(--io-accent); box-shadow: 0 0 5px var(--io-accent-glow); }
.section-h .right { margin-left: auto; color: var(--io-text-disabled); text-transform: none; letter-spacing: 0.04em; font-size: 13px; }
.section-h .right b { color: var(--io-accent); font-weight: 500; }
.section-body { padding: 4px 14px 12px; }

.name-row { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-bottom: 1px solid var(--io-border-subtle); }
.name-input { flex: 1; background: var(--io-surface-sunken); border: 1px solid var(--io-border); color: var(--io-accent); padding: 5px 9px; font-family: inherit; font-size: 15px; outline: none; }
.name-input:focus { border-color: var(--io-accent); }
.mode-toggle { display: flex; border: 1px solid var(--io-border); }
.mode-toggle button { padding: 4px 9px; color: var(--io-text-tertiary); font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; border: none; border-right: 1px solid var(--io-border); background: transparent; font-family: inherit; }
.mode-toggle button:last-child { border-right: none; }
.mode-toggle button.active { color: var(--io-accent); background: var(--io-accent-subtle); }

.src { display: grid; grid-template-columns: 22px 1fr 80px; gap: 8px; align-items: center; margin-bottom: 6px; }
.src-swatch { width: 22px; height: 22px; border: 1px solid var(--io-border); background: var(--c, #050300); cursor: pointer; position: relative; }
.src-swatch:hover { border-color: var(--io-accent); }
.src-swatch input[type=color] { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; border: 0; padding: 0; }
.src-name { color: var(--io-text-secondary); font-size: 14px; }
.src-name .hint { display: block; color: var(--io-text-tertiary); font-size: 12px; margin-top: 1px; text-transform: uppercase; letter-spacing: 0.12em; }
.src-input { background: var(--io-surface-sunken); border: 1px solid var(--io-border); color: var(--io-text-primary); padding: 3px 7px; font-family: inherit; font-size: 14px; outline: none; text-align: right; text-transform: uppercase; }
.src-input:focus { border-color: var(--io-accent); }

.ramp { display: flex; height: 18px; border: 1px solid var(--io-border); margin-top: 6px; }
.ramp .cell { flex: 1; background: var(--c); border-right: 1px solid var(--io-border-subtle); }
.ramp .cell:last-child { border-right: none; }
.ramp.alpha { background: repeating-conic-gradient(#1a1a1a 0 25%, #2a2a2a 0 50%) 0 0/8px 8px; }
.ramp-cap { display: flex; justify-content: space-between; color: var(--io-text-disabled); font-size: 12px; margin-top: 3px; }

.presets { display: grid; grid-template-columns: repeat(8, 1fr); gap: 3px; margin-top: 6px; }
.preset { aspect-ratio: 1; border: 1px solid var(--io-border); background: var(--c); cursor: pointer; }
.preset:hover { border-color: var(--io-accent); transform: scale(1.1); position: relative; z-index: 2; }
.preset.active { border-color: var(--io-accent); box-shadow: 0 0 0 1px var(--io-accent), 0 0 6px var(--io-accent-glow); }

.code-chips { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
.code-chip { border: 1px solid var(--io-border); background: var(--io-surface-sunken); padding: 5px 7px; cursor: pointer; display: flex; flex-direction: column; gap: 4px; }
.code-chip:hover { border-color: var(--io-accent-dim); }
.code-chip.active { border-color: var(--io-accent); background: var(--io-accent-subtle); }
.code-chip .pname { color: var(--io-text-secondary); font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase; }
.code-chip.active .pname { color: var(--io-accent); }
.code-chip .swatches { display: flex; gap: 2px; height: 8px; }
.code-chip .sw { flex: 1; background: var(--c); border: 1px solid #000; }

/* THEMES tab grid */
.theme-section-h { padding: 10px 14px 4px; color: var(--io-text-tertiary); font-size: 12px; letter-spacing: 0.22em; text-transform: uppercase; display: flex; align-items: center; gap: 8px; }
.theme-section-h::before { content: ''; width: 5px; height: 5px; background: var(--io-accent); box-shadow: 0 0 5px var(--io-accent-glow); }
.theme-section-h .right { margin-left: auto; color: var(--io-text-disabled); font-size: 13px; letter-spacing: 0.04em; text-transform: none; }
.theme-section-h .right b { color: var(--io-accent); font-weight: 500; }
.theme-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding: 4px 14px 12px; }
.theme-card { border: 1px solid var(--io-border); padding: 7px; cursor: pointer; display: flex; flex-direction: column; gap: 5px; background: var(--io-surface-sunken); position: relative; }
.theme-card:hover { border-color: var(--io-accent); }
.theme-card.active { border-color: var(--io-accent); background: var(--io-accent-subtle); box-shadow: 0 0 0 1px var(--io-accent), 0 0 6px var(--io-accent-glow); }
.theme-card .tname { color: var(--io-text-secondary); font-size: 13px; letter-spacing: 0.12em; text-transform: uppercase; padding-right: 16px; }
.theme-card.active .tname { color: var(--io-accent); }
.theme-card .preview { display: flex; gap: 0; height: 28px; border: 1px solid var(--io-border-subtle); }
.theme-card .preview .swatch { flex: 1; }
.theme-card .del { position: absolute; top: 4px; right: 6px; color: var(--io-text-disabled); font-size: 15px; line-height: 1; padding: 2px 4px; border-radius: 2px; }
.theme-card .del:hover { color: var(--io-accent); background: var(--io-accent-subtle); }
.empty-saved { padding: 10px 14px; color: var(--io-text-disabled); font-size: 13px; letter-spacing: 0.05em; font-style: italic; }

/* FONT tab */
.font-row { display: flex; gap: 6px; align-items: center; }
.font-input { flex: 1; background: var(--io-surface-sunken); border: 1px solid var(--io-border); color: var(--io-text-primary); padding: 6px 10px; font-family: inherit; font-size: 15px; outline: none; }
.font-input:focus { border-color: var(--io-accent); }
.applied-tag { display: inline-block; padding: 2px 7px; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--io-accent); border: 1px solid var(--io-accent-dim); background: var(--io-accent-subtle); margin-top: 6px; }

.size-row { display: grid; grid-template-columns: 80px 1fr 50px; gap: 8px; align-items: center; padding: 5px 0; }
.size-row .lbl { color: var(--io-text-secondary); font-size: 14px; letter-spacing: 0.06em; text-transform: lowercase; }
.size-row .val { color: var(--io-accent); font-size: 14px; text-align: right; }

.slider { -webkit-appearance: none; appearance: none; height: 22px; background: transparent; cursor: pointer; }
.slider::-webkit-slider-runnable-track { height: 2px; background: var(--io-border); }
.slider::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; background: var(--io-accent); border: none; margin-top: -5px; }
.slider::-moz-range-track { height: 2px; background: var(--io-border); border: none; }
.slider::-moz-range-thumb { width: 12px; height: 12px; background: var(--io-accent); border: none; }

.stats { display: flex; align-items: center; gap: 12px; padding: 6px 14px; background: var(--io-surface-sunken); border-top: 1px solid var(--io-border); color: var(--io-text-tertiary); font-size: 13px; }
.stats b { color: var(--io-accent); font-weight: 500; }
.stats .pass { color: var(--io-accent); }
.stats .pass::before { content: '✓ '; }
.stats .spacer { flex: 1; }

.foot { display: flex; gap: 6px; padding: 9px 14px; background: var(--io-surface-sunken); border-top: 1px solid var(--io-border); align-items: center; flex-wrap: wrap; }
.btn { display: inline-flex; align-items: center; gap: 5px; background: transparent; border: 1px solid var(--io-border); color: var(--io-text-secondary); padding: 4px 9px; font-family: inherit; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; user-select: none; }
.btn:hover { border-color: var(--io-accent); color: var(--io-accent); }
.btn:active { background: var(--io-accent-subtle); }
.btn.primary { background: var(--io-accent); border-color: var(--io-accent); color: var(--io-on-accent); font-weight: 600; }
.btn.primary:hover { background: var(--io-accent-bright); border-color: var(--io-accent-bright); }
.foot .spacer { flex: 1; }
.live-toggle { display: inline-flex; align-items: center; gap: 5px; color: var(--io-text-secondary); font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; }
.live-toggle input { accent-color: var(--io-accent); }
.live-toggle.on { color: var(--io-accent); }

.toast { position: absolute; bottom: 12px; right: 12px; background: var(--io-accent); color: var(--io-on-accent); padding: 8px 14px; font-size: 14px; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; opacity: 0; pointer-events: none; transition: opacity 0.18s; border: 1px solid var(--io-accent-bright); }
.toast.show { opacity: 1; }
`;

  // ============================================================
  // PANEL HTML
  //
  // Three tabs (Creator, Themes, Font), header (drag handle + collapse/close),
  // name input + DARK/LIGHT toggle, stats bar, footer with action buttons.
  // Tab panes show/hide via .active class flipped by tab click handlers.
  // ============================================================
  const PANEL_HTML = `
<div class="panel" id="panel">
  <div class="win-h" id="dragHandle">
    <span class="menu">☰</span>
    <div class="icon-tile">◌</div>
    <div class="title">// CLAUDE <b>THEME</b></div>
    <div class="target">claude.ai</div>
    <div class="controls">
      <span id="collapseBtn" title="collapse">—</span>
      <span id="closeBtn" title="close">×</span>
    </div>
  </div>

  <div class="tabs" id="tabs">
    <button class="tab active" data-tab="CREATOR">Creator</button>
    <button class="tab" data-tab="THEMES">Themes</button>
    <button class="tab" data-tab="FONT">Font</button>
  </div>

  <div class="tab-pane active" data-pane="CREATOR">
    <div class="name-row">
      <input class="name-input" id="nameInput" value="lain-claude">
      <div class="mode-toggle" id="modeToggle">
        <button class="active" data-mode="DARK">DARK</button>
        <button data-mode="LIGHT">LIGHT</button>
      </div>
    </div>

    <div class="section">
      <div class="section-h">Sources<span class="right"><b>3</b> colors</span></div>
      <div class="section-body">
        <div class="src">
          <div class="src-swatch" id="swAccent" style="--c:#ff4da6;"><input type="color" id="pickAccent" value="#ff4da6"></div>
          <div class="src-name">Accent<span class="hint">drives 23 vars</span></div>
          <input class="src-input" id="hexAccent" value="#FF4DA6">
        </div>
        <div class="src">
          <div class="src-swatch" id="swBg" style="--c:#0a0a14;"><input type="color" id="pickBg" value="#0a0a14"></div>
          <div class="src-name">Background<span class="hint">drives bg / z / df ramps</span></div>
          <input class="src-input" id="hexBg" value="#0A0A14">
        </div>
        <div class="ramp" id="zRamp"><div class="cell"></div><div class="cell"></div><div class="cell"></div><div class="cell"></div><div class="cell"></div><div class="cell"></div><div class="cell"></div></div>
        <div class="ramp-cap"><span>z0</span><span>z6</span></div>
        <div class="src" style="margin-top: 12px;">
          <div class="src-swatch" id="swText" style="--c:#e6e6ff;"><input type="color" id="pickText" value="#e6e6ff"></div>
          <div class="src-name">Text<span class="hint">drives text / t-alpha / borders</span></div>
          <input class="src-input" id="hexText" value="#E6E6FF">
        </div>
        <div class="ramp alpha" id="tRamp"><div class="cell"></div><div class="cell"></div><div class="cell"></div><div class="cell"></div><div class="cell"></div><div class="cell"></div><div class="cell"></div><div class="cell"></div><div class="cell"></div><div class="cell"></div></div>
        <div class="ramp-cap"><span>t0</span><span>t9</span></div>
        <div class="presets" id="quickPicks" style="margin-top: 12px;"></div>
      </div>
    </div>

    <div class="section">
      <div class="section-h">Code Theme<span class="right"><b>6</b> hljs vars</span></div>
      <div class="section-body">
        <div class="code-chips" id="codeChips"></div>
      </div>
    </div>
  </div>

  <div class="tab-pane" data-pane="THEMES">
    <div class="theme-section-h">Saved<span class="right"><b id="savedCount">0</b> custom</span></div>
    <div id="savedGrid"></div>
    <div class="theme-section-h">Built-in<span class="right"><b id="builtinCount">0</b> themes</span></div>
    <div class="theme-grid" id="themeGrid"></div>
  </div>

  <div class="tab-pane" data-pane="FONT">
    <div class="section">
      <div class="section-h">Font Family<span class="right"><b>15</b> aliases</span></div>
      <div class="section-body">
        <div class="font-row">
          <input type="text" class="font-input" id="fontInput" placeholder="font name (any installed)" value="Space Mono">
          <button class="btn primary" id="applyFontBtn">APPLY FONT</button>
        </div>
        <div class="applied-tag" id="appliedTag">applied: Space Mono</div>
      </div>
    </div>
    <div class="section">
      <div class="section-h">Sizes<span class="right"><b>7</b> tiers</span></div>
      <div class="section-body" id="sizeRows"></div>
    </div>
  </div>

  <div class="stats">
    <span><b id="varCount">0</b> vars</span>
    <span>·</span>
    <span class="pass">all derived</span>
    <span class="spacer"></span>
    <span id="byteSize">0 KB</span>
  </div>

  <div class="foot">
    <button class="btn" id="randomizeBtn">RANDOMIZE</button>
    <button class="btn" id="saveBtn" title="save current theme to localStorage">SAVE</button>
    <button class="btn" id="deleteBtn" title="delete saved theme matching current name">DELETE</button>
    <button class="btn" id="restoreBtn" title="restore lain defaults">RESTORE</button>
    <button class="btn" id="anthropicBtn" title="revert claude to vanilla anthropic — no overrides">ANTHROPIC</button>
    <button class="btn" id="resetSizesBtn" title="reset font sizes only">SIZES</button>
    <label class="live-toggle on" id="liveToggle"><input type="checkbox" id="liveCheck" checked> LIVE</label>
    <div class="spacer"></div>
    <button class="btn" id="copyBtn">COPY .JS</button>
    <button class="btn primary" id="exportBtn">EXPORT</button>
  </div>

  <div class="toast" id="toast">copied</div>
</div>
`;

  // ============================================================
  // PANEL MOUNT
  //
  // Cave man create host div, append to body, attach shadow root in OPEN mode.
  // Mark the shadow root with LIVE_SKIP so the live applier never adopts onto
  // our own panel. Inject CSS and HTML into the shadow root.
  // Stop keyboard events at the host. Claude listens at document level for
  // hotkeys (slash-commands, Cmd+K, composer focus). Events from inside the
  // shadow get retargeted to the host on bubble. Stop them there.
  // Restore drag position from localStorage if a previous session saved one.
  // ============================================================
  const host = document.createElement("div");
  host.id = HOST_ID;
  document.body.appendChild(host);
  const root = host.attachShadow({ mode: "open" });
  root[LIVE_SKIP] = true;
  panelShadowRoot = root;

  const styleEl = document.createElement("style");
  styleEl.textContent = PANEL_CSS;
  root.appendChild(styleEl);
  const wrap = document.createElement("div");
  wrap.innerHTML = PANEL_HTML;
  root.appendChild(wrap);

  const $ = (id) => root.getElementById(id);

  ["keydown", "keyup", "keypress", "input", "beforeinput"].forEach(evt => {
    host.addEventListener(evt, (e) => { e.stopPropagation(); }, false);
  });

  try {
    const saved = JSON.parse(localStorage.getItem(POS_KEY) || "null");
    if (saved && typeof saved.x === "number") {
      const p = $("panel");
      p.style.left = saved.x + "px";
      p.style.top  = saved.y + "px";
    }
  } catch (e) {}

  // ============================================================
  // DRAG
  //
  // Click header, drag, panel moves. Position saved on mouseup.
  // Constrained to viewport so panel can't be lost off-screen.
  // ============================================================
  (() => {
    const handle = $("dragHandle");
    const panel = $("panel");
    let dragging = false, sx=0, sy=0, ox=0, oy=0;
    handle.addEventListener("mousedown", (e) => {
      if (e.target.closest(".controls")) return;
      dragging = true;
      const r = panel.getBoundingClientRect();
      sx = e.clientX; sy = e.clientY; ox = r.left; oy = r.top;
      e.preventDefault();
    });
    document.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      let nx = ox + (e.clientX - sx);
      let ny = oy + (e.clientY - sy);
      const r = panel.getBoundingClientRect();
      nx = Math.max(0, Math.min(window.innerWidth - r.width, nx));
      ny = Math.max(0, Math.min(window.innerHeight - 30, ny));
      panel.style.left = nx + "px"; panel.style.top = ny + "px";
    });
    document.addEventListener("mouseup", () => {
      if (!dragging) return;
      dragging = false;
      const r = panel.getBoundingClientRect();
      try { localStorage.setItem(POS_KEY, JSON.stringify({ x: r.left, y: r.top })); } catch (e) {}
    });
  })();

  $("collapseBtn").addEventListener("click", () => $("panel").classList.toggle("collapsed"));
  $("closeBtn").addEventListener("click", () => { clearLive(); host.remove(); });

  // ============================================================
  // TABS
  //
  // Three tabs. Click swaps which .tab-pane has .active class.
  // STATE.tab tracks current — UI state only, not persisted.
  // ============================================================
  root.querySelectorAll(".tab").forEach(tb => {
    tb.addEventListener("click", () => {
      STATE.tab = tb.dataset.tab;
      root.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.tab === STATE.tab));
      root.querySelectorAll(".tab-pane").forEach(p => p.classList.toggle("active", p.dataset.pane === STATE.tab));
    });
  });

  // ============================================================
  // RENDER
  //
  // render() repaints the panel from STATE end-to-end and triggers
  // persistLast() (auto-save) + applyLive() (push CSS to Claude if LIVE).
  // Some handlers skip render() to be cheap (size slider, name input,
  // applyFont, mode toggle, LIVE checkbox) — those MUST call persistLast()
  // themselves or auto-save breaks. This contract was learned the hard way
  // when font sizes weren't surviving across panel re-paste.
  // ============================================================
  function renderRamps() {
    const z = deriveZRamp(STATE.bg, STATE.text, STATE.accent);
    [...$("zRamp").children].forEach((c, i) => c.style.setProperty("--c", z[i]));
    const trgb = hexToRgb(STATE.text);
    const tBase = `${trgb.r},${trgb.g},${trgb.b}`;
    const alphas = [0, 0.04, 0.08, 0.12, 0.16, 0.25, 0.45, 0.70, 0.85, 1];
    [...$("tRamp").children].forEach((c, i) => {
      const a = alphas[i];
      c.style.setProperty("--c", a === 1 ? STATE.text : `rgba(${tBase}, ${a})`);
    });
  }
  function renderSwatches() {
    $("swAccent").style.setProperty("--c", STATE.accent);
    $("swBg").style.setProperty("--c", STATE.bg);
    $("swText").style.setProperty("--c", STATE.text);
    $("hexAccent").value = STATE.accent.toUpperCase();
    $("hexBg").value = STATE.bg.toUpperCase();
    $("hexText").value = STATE.text.toUpperCase();
    $("pickAccent").value = STATE.accent;
    $("pickBg").value = STATE.bg;
    $("pickText").value = STATE.text;
  }
  function matchSwatches(a) {
    return [a, lighten(a, 8), lighten(a, 20), lighten(a, 32), darken(a, 12), darken(a, 28)];
  }
  function renderCodeChips() {
    const order = ["LAIN", "TERMINAL", "MUTED", "MATCH"];
    const labels = { LAIN: "LAIN", TERMINAL: "TERMINAL", MUTED: "MUTED", MATCH: "MATCH ACCENT" };
    $("codeChips").innerHTML = order.map(key => {
      const sw = key === "MATCH"
        ? matchSwatches(STATE.accent)
        : (() => { const p = CODE_PRESETS[key]; return [p.keyword, p.string, p.type, p.builtin, p.name, p.comment]; })();
      const sws = sw.map(c => `<div class="sw" style="--c:${c};"></div>`).join("");
      return `<div class="code-chip ${STATE.codePreset === key ? 'active' : ''}" data-code="${key}">
        <div class="pname">${labels[key]}</div>
        <div class="swatches">${sws}</div>
      </div>`;
    }).join("");
    root.querySelectorAll("[data-code]").forEach(el => {
      el.addEventListener("click", () => { STATE.codePreset = el.dataset.code; render(); });
    });
  }
  function renderQuickPicks() {
    $("quickPicks").innerHTML = QUICK_PICKS.map((p, i) =>
      `<div class="preset ${p.name === STATE.name ? 'active' : ''}" data-idx="${i}" style="--c:${p.accent};" title="${p.name}"></div>`
    ).join("");
    root.querySelectorAll("#quickPicks .preset").forEach(el => {
      el.addEventListener("click", () => applyTheme(QUICK_PICKS[parseInt(el.dataset.idx, 10)]));
    });
  }
  function renderThemes() {
    $("themeGrid").innerHTML = THEMES.map((t, i) => `
      <div class="theme-card ${t.name === STATE.name ? 'active' : ''}" data-builtin-idx="${i}">
        <div class="tname">${t.name}</div>
        <div class="preview">
          <div class="swatch" style="background:${t.bg}"></div>
          <div class="swatch" style="background:${t.accent}"></div>
          <div class="swatch" style="background:${t.text}"></div>
          <div class="swatch" style="background:${darken(t.accent, 15)}"></div>
        </div>
      </div>
    `).join("");
    $("builtinCount").textContent = THEMES.length;
    root.querySelectorAll("[data-builtin-idx]").forEach(el => {
      el.addEventListener("click", () => applyTheme(THEMES[parseInt(el.dataset.builtinIdx, 10)]));
    });

    const saved = loadSaved();
    $("savedCount").textContent = saved.length;
    if (saved.length === 0) {
      $("savedGrid").innerHTML = `<div class="empty-saved">no saved themes — name your build, hit SAVE in the footer</div>`;
    } else {
      $("savedGrid").className = "theme-grid";
      $("savedGrid").innerHTML = saved.map((t, i) => `
        <div class="theme-card ${t.name === STATE.name ? 'active' : ''}" data-saved-idx="${i}">
          <div class="tname">${t.name}</div>
          <div class="preview">
            <div class="swatch" style="background:${t.bg}"></div>
            <div class="swatch" style="background:${t.accent}"></div>
            <div class="swatch" style="background:${t.text}"></div>
            <div class="swatch" style="background:${darken(t.accent, 15)}"></div>
          </div>
          <span class="del" data-del-idx="${i}" title="delete">×</span>
        </div>
      `).join("");
      root.querySelectorAll("[data-saved-idx]").forEach(el => {
        el.addEventListener("click", (e) => {
          if (e.target.classList.contains("del")) return;
          applyTheme(saved[parseInt(el.dataset.savedIdx, 10)]);
        });
      });
      root.querySelectorAll("[data-del-idx]").forEach(el => {
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          const i = parseInt(el.dataset.delIdx, 10);
          const list = loadSaved();
          const removed = list.splice(i, 1)[0];
          persistSaved(list);
          renderThemes();
          toast("deleted: " + removed.name);
        });
      });
    }
  }
  function renderSizeRows() {
    const order = ["caption", "footnote", "code", "body", "heading", "prompt", "title"];
    const ranges = { caption:[8,16], footnote:[9,18], code:[9,18], body:[10,20], heading:[11,22], prompt:[12,28], title:[14,40] };
    $("sizeRows").innerHTML = order.map(k => {
      const [min, max] = ranges[k];
      return `<div class="size-row" data-size="${k}">
        <span class="lbl">${k}</span>
        <input type="range" class="slider" min="${min}" max="${max}" step="1" value="${STATE.sizes[k]}">
        <span class="val">${STATE.sizes[k]}px</span>
      </div>`;
    }).join("");
    root.querySelectorAll(".size-row").forEach(row => {
      const k = row.dataset.size;
      const slider = row.querySelector("input");
      const val = row.querySelector(".val");
      slider.addEventListener("input", () => {
        STATE.sizes[k] = parseInt(slider.value, 10);
        val.textContent = STATE.sizes[k] + "px";
        renderStats();
        persistLast();
        if (STATE.live) applyLive();
      });
    });
  }
  // Repaint the creator panel itself from current STATE so it matches
  // whatever theme is active. Sets --io-* vars directly on .panel.
  function renderPanelTheme() {
    const p = $("panel");
    const bgRamp = deriveBg(STATE.bg);
    const txRamp = deriveText(STATE.text, STATE.accent);
    const bdRamp = deriveBorders(STATE.text);
    const bgHex = (i) => hslHex(bgRamp[i].h, bgRamp[i].s, bgRamp[i].l);
    const txHex = (i) => hslHex(txRamp[i].h, txRamp[i].s, txRamp[i].l);
    const bdHex = (i) => hslHex(bdRamp[i].h, bdRamp[i].s, bdRamp[i].l);

    p.style.setProperty("--io-accent", STATE.accent);
    p.style.setProperty("--io-accent-bright", lighten(STATE.accent, 12));
    p.style.setProperty("--io-accent-dim", darken(STATE.accent, 12));
    p.style.setProperty("--io-accent-glow", rgba(STATE.accent, 0.28));
    p.style.setProperty("--io-accent-subtle", rgba(STATE.accent, 0.08));
    p.style.setProperty("--io-on-accent", bgHex(0));

    p.style.setProperty("--io-surface-base", bgHex(0));
    const sunken = hslHex(bgRamp[0].h, bgRamp[0].s, Math.max(0, bgRamp[0].l - 1));
    p.style.setProperty("--io-surface-sunken", sunken);

    p.style.setProperty("--io-text-primary", txHex(0));
    p.style.setProperty("--io-text-secondary", txHex(2));
    p.style.setProperty("--io-text-tertiary", txHex(3));
    p.style.setProperty("--io-text-disabled", txHex(4));

    p.style.setProperty("--io-border", bdHex(2));
    p.style.setProperty("--io-border-subtle", bdHex(3));
  }
  function renderStats() {
    const css = buildCss();
    const matches = css.match(/--[a-z0-9-]+:/gi) || [];
    $("varCount").textContent = matches.length;
    const iife = buildIife();
    $("byteSize").textContent = (iife.length / 1024).toFixed(1) + " KB";
  }
  function renderFontTag() {
    $("appliedTag").textContent = "applied: " + STATE.font;
  }
  function render() {
    renderSwatches();
    renderRamps();
    renderCodeChips();
    renderQuickPicks();
    renderThemes();
    renderPanelTheme();
    renderStats();
    renderFontTag();
    persistLast();
    if (STATE.live) applyLive();
  }

  // Saved themes carry font + sizes; built-in themes don't.
  function applyTheme(t) {
    STATE.name = t.name;
    STATE.accent = t.accent;
    STATE.bg = t.bg;
    STATE.text = t.text;
    STATE.codePreset = t.code;
    if (t.font) { STATE.font = t.font; STATE.fontPending = t.font; $("fontInput").value = t.font; }
    if (t.sizes) {
      STATE.sizes = { ...DEFAULT_SIZES, ...t.sizes };
      renderSizeRows();
    }
    $("nameInput").value = t.name;
    render();
  }

  // ============================================================
  // WIRING
  //
  // Bind every interactive element. Pickers/hex inputs trigger render().
  // Cheap mutations (slider, name input, font apply, mode toggle, LIVE toggle)
  // skip render() but still call persistLast() so localStorage stays current.
  // Footer buttons: RANDOMIZE, SAVE, DELETE, RESTORE, ANTHROPIC, SIZES,
  // COPY, EXPORT.
  // ============================================================
  function setHex(field, value) {
    if (!/^#?[0-9a-f]{3}$|^#?[0-9a-f]{6}$/i.test(value.trim())) return false;
    let v = value.trim();
    if (!v.startsWith("#")) v = "#" + v;
    if (v.length === 4) v = "#" + v.slice(1).split("").map(c => c + c).join("");
    STATE[field] = v.toLowerCase();
    return true;
  }

  $("pickAccent").addEventListener("input", (e) => { STATE.accent = e.target.value; render(); });
  $("pickBg").addEventListener("input",     (e) => { STATE.bg = e.target.value; render(); });
  $("pickText").addEventListener("input",   (e) => { STATE.text = e.target.value; render(); });

  $("hexAccent").addEventListener("change", (e) => { if (setHex("accent", e.target.value)) render(); else e.target.value = STATE.accent.toUpperCase(); });
  $("hexBg").addEventListener("change",     (e) => { if (setHex("bg",     e.target.value)) render(); else e.target.value = STATE.bg.toUpperCase(); });
  $("hexText").addEventListener("change",   (e) => { if (setHex("text",   e.target.value)) render(); else e.target.value = STATE.text.toUpperCase(); });

  $("nameInput").addEventListener("input", (e) => { STATE.name = e.target.value; renderStats(); persistLast(); });

  $("fontInput").addEventListener("input", (e) => { STATE.fontPending = e.target.value; });
  function applyFont() {
    const v = STATE.fontPending.trim();
    if (!v) return;
    STATE.font = v;
    renderFontTag();
    renderStats();
    persistLast();
    if (STATE.live) applyLive();
    toast("font: " + v);
  }
  $("applyFontBtn").addEventListener("click", applyFont);
  $("fontInput").addEventListener("keydown", (e) => { if (e.key === "Enter") applyFont(); });

  $("resetSizesBtn").addEventListener("click", () => {
    STATE.sizes = { ...DEFAULT_SIZES };
    renderSizeRows();
    renderStats();
    persistLast();
    if (STATE.live) applyLive();
    toast("sizes reset");
  });

  $("deleteBtn").addEventListener("click", () => {
    const list = loadSaved();
    const idx = list.findIndex(t => t.name === STATE.name);
    if (idx < 0) { toast("not in saved: " + STATE.name); return; }
    const removed = list.splice(idx, 1)[0];
    persistSaved(list);
    renderThemes();
    toast("deleted: " + removed.name);
  });

  // ANTHROPIC: revert colors to vanilla, KEEP user's font family + sizes.
  // liveSheet.replaceSync swaps content in-place — every shadow root that
  // adopted it instantly loses color rules but keeps typography.
  $("anthropicBtn").addEventListener("click", () => {
    const fontOnly = buildCssFontOnly();
    let s = document.getElementById(LIVE_STYLE_ID);
    if (!s) {
      s = document.createElement("style");
      s.id = LIVE_STYLE_ID;
      document.head.appendChild(s);
    }
    s.textContent = fontOnly;
    if (liveSheet) {
      try { liveSheet.replaceSync(fontOnly); } catch (e) {}
    } else {
      // First-time ANTHROPIC click before LIVE ever ran — bootstrap infra.
      try {
        liveSheet = new CSSStyleSheet();
        liveSheet.replaceSync(fontOnly);
        liveAdopt(document);
        liveWalk(document.documentElement);
      } catch (e) {}
    }
    STATE.live = false;
    $("liveCheck").checked = false;
    $("liveToggle").classList.remove("on");
    toast("anthropic colors + your fonts");
  });

  $("saveBtn").addEventListener("click", () => {
    const list = loadSaved();
    const current = {
      name: STATE.name || "untitled",
      accent: STATE.accent,
      bg: STATE.bg,
      text: STATE.text,
      code: STATE.codePreset,
      font: STATE.font,
      sizes: { ...STATE.sizes }
    };
    const idx = list.findIndex(t => t.name === current.name);
    if (idx >= 0) { list[idx] = current; toast("updated: " + current.name); }
    else { list.push(current); toast("saved: " + current.name); }
    persistSaved(list);
    renderThemes();
  });

  // RESTORE: full reset — accent/bg/text/code from lain, default sizes, default font.
  $("restoreBtn").addEventListener("click", () => {
    const lain = THEMES[0];
    STATE.name = lain.name;
    STATE.accent = lain.accent;
    STATE.bg = lain.bg;
    STATE.text = lain.text;
    STATE.codePreset = lain.code;
    STATE.sizes = { ...DEFAULT_SIZES };
    STATE.font = "Space Mono";
    STATE.fontPending = "Space Mono";
    $("nameInput").value = lain.name;
    $("fontInput").value = "Space Mono";
    renderSizeRows();
    render();
    toast("restored defaults");
  });

  root.querySelectorAll("#modeToggle button").forEach(b => {
    b.addEventListener("click", () => {
      root.querySelectorAll("#modeToggle button").forEach(x => x.classList.remove("active"));
      b.classList.add("active");
      STATE.mode = b.dataset.mode;
      persistLast();
    });
  });

  $("liveCheck").addEventListener("change", (e) => {
    STATE.live = e.target.checked;
    $("liveToggle").classList.toggle("on", STATE.live);
    persistLast();
    if (STATE.live) applyLive(); else clearLive();
  });

  $("randomizeBtn").addEventListener("click", () => {
    const r = (lMin, lMax, sMin = 50) => {
      const h = Math.floor(Math.random() * 360);
      const s = sMin + Math.floor(Math.random() * (100 - sMin));
      const l = lMin + Math.floor(Math.random() * (lMax - lMin));
      return hslHex(h, s, l);
    };
    STATE.accent = r(45, 65);
    STATE.bg = r(3, 10, 20);
    STATE.text = r(80, 95, 30);
    render();
  });

  $("copyBtn").addEventListener("click", async () => {
    const code = buildIife();
    try {
      await navigator.clipboard.writeText(code);
      toast("copied " + (code.length / 1024).toFixed(1) + " KB");
    } catch (e) {
      const ta = document.createElement("textarea");
      ta.value = code; document.body.appendChild(ta); ta.select();
      document.execCommand("copy"); document.body.removeChild(ta);
      toast("copied (fallback)");
    }
  });

  $("exportBtn").addEventListener("click", () => {
    const code = buildIife();
    const slug = (STATE.name || "io-custom").replace(/[^a-z0-9-]/gi, "-").toLowerCase();
    const blob = new Blob([code], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = slug + ".js";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast("exported " + slug + ".js");
  });

  function toast(msg) {
    const t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("show"), 1400);
  }

  // ============================================================
  // INITIAL
  //
  // loadLast() pulls last STATE from localStorage if present.
  // Sync DOM inputs that don't auto-rebuild (name, font, mode toggle, LIVE).
  // renderSizeRows() reads STATE.sizes — must run AFTER loadLast.
  // render() paints everything and fires applyLive() if LIVE was on.
  // Toast confirms restore so user knows it wasn't a cold start.
  // ============================================================
  const restored = loadLast();
  if (restored) {
    $("nameInput").value = STATE.name;
    $("fontInput").value = STATE.font;
    root.querySelectorAll("#modeToggle button").forEach(b => {
      b.classList.toggle("active", b.dataset.mode === STATE.mode);
    });
    $("liveCheck").checked = STATE.live;
    $("liveToggle").classList.toggle("on", STATE.live);
  }
  renderSizeRows();
  render();
  if (restored) toast("restored last session");

  console.log("io-claude-creator panel injected. tabs: creator/themes/font. drag header.");
})();
