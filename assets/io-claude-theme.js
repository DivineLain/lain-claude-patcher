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

// GENERATED FILE. Edit src-ui/* and run:
//   node tools/build-theme-payload.mjs

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
        rootSize: STATE.rootSize,
        sizes: STATE.sizes,
        leading: STATE.leading,
        layout: STATE.layout,
        wallpaper: STATE.wallpaper,
        sidebarWallpaper: STATE.sidebarWallpaper,
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
      if (typeof last.rootSize === "number" && isFinite(last.rootSize)) STATE.rootSize = last.rootSize;
      if (last.sizes)      STATE.sizes = { ...DEFAULT_SIZES, ...last.sizes };
      if (last.leading)    STATE.leading = { ...DEFAULT_LEADING, ...last.leading };
      if (last.layout)     STATE.layout = { ...DEFAULT_LAYOUT, ...last.layout };
      if (last.wallpaper)  STATE.wallpaper = { ...DEFAULT_WALLPAPER, ...last.wallpaper };
      if (last.sidebarWallpaper) STATE.sidebarWallpaper = { ...DEFAULT_SIDEBAR_WALLPAPER, ...last.sidebarWallpaper };
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
  // Root font-size for :root. Our overridden tokens are emitted in rem against
  // a fixed 16px denominator (web standard), so bumping this scales every
  // token we override (text, leading, sidebar row font, etc.) together —
  // closer to "Anthropic-style" proportional scaling than per-tier px tweaks
  // alone. Default 16 = no change vs. previous behavior. Range exposed in
  // the SIZES tab as the "root" row.
  const DEFAULT_ROOT_SIZE = 16;
  // Per-tier line-height multipliers. Code/body default to generous values
  // because Anthropic's stock leading is too tight on multi-line responses.
  // Sliders let the user dial 1.0–2.5. Computed leading = round(size × ratio)px.
  const DEFAULT_LEADING = { caption: 1.20, footnote: 1.17, code: 1.60, body: 1.50, heading: 1.29, prompt: 1.31, title: 1.20 };
  const DEFAULT_LAYOUT = { mainWidth: 100, mainMarginLeft: 0, chatWidth: 100 };
  const DEFAULT_WALLPAPER = { enabled: false, image: "", opacity: 18, blend: "normal" };
  const DEFAULT_SIDEBAR_WALLPAPER = { enabled: false, image: "", opacity: 18 };

  const STATE = {
    name: "lain-claude",
    accent: "#ff4da6",
    bg: "#0a0a14",
    text: "#e6e6ff",
    // Font family is OPT-IN. Empty string = no override; Claude's stock stack
    // wins. User types a family + APPLY FONT to override. Once applied it
    // persists via persistLast and survives reloads.
    font: "",
    fontPending: "",
    rootSize: DEFAULT_ROOT_SIZE,
    sizes: { ...DEFAULT_SIZES },
    leading: { ...DEFAULT_LEADING },
    layout: { ...DEFAULT_LAYOUT },
    wallpaper: { ...DEFAULT_WALLPAPER },
    sidebarWallpaper: { ...DEFAULT_SIDEBAR_WALLPAPER },
    codePreset: "LAIN",
    mode: "DARK",
    live: true,
    tab: "CREATOR"
  };

  // ============================================================
  // ============================================================
  // THEMES (built-in)
  //
  // 47 themes. Top group is ported from kernelstyle/themes, excluding NEW/.
  // Bottom group is house themes. First 8 surface as quick-pick chips in the
  // CREATOR tab. Full grid in THEMES tab.
  // No Dracula. No Nord. Cave man write own.
  // ============================================================
  const THEMES = [
    // ported from A:/SysPulse/UIFRONTEND/html/kernelstyle/themes
    { name: "acid-bath",         accent: "#ccff00", bg: "#050a00", text: "#f5ffe0", code: "MATCH"    },
    { name: "beige",             accent: "#a8323f", bg: "#f5f1e8", text: "#3a3530", code: "MUTED"    },
    { name: "coral-burn",        accent: "#ff5577", bg: "#0f0508", text: "#ffffff", code: "MATCH"    },
    { name: "crimson-surge",     accent: "#ff0066", bg: "#140008", text: "#ffffff", code: "MATCH"    },
    { name: "dark-sakura",       accent: "#ffb7d5", bg: "#1a0f14", text: "#ffffff", code: "LAIN"     },
    { name: "deep-cyan",         accent: "#00ffff", bg: "#001a1a", text: "#e0ffff", code: "MATCH"    },
    { name: "default",           accent: "#dc1f2d", bg: "#0d0607", text: "#ffffff", code: "MATCH"    },
    { name: "dijon-dusk",        accent: "#c9a227", bg: "#110d05", text: "#f0e6c8", code: "MATCH"    },
    { name: "ember-steel",       accent: "#ff8844", bg: "#0f0804", text: "#ffffff", code: "MATCH"    },
    { name: "forest-night",      accent: "#e6ffe6", bg: "#0a1a0a", text: "#e6ffe6", code: "MATCH"    },
    { name: "gold",              accent: "#ffd700", bg: "#0a0a0a", text: "#ffffff", code: "MATCH"    },
    { name: "gunmetal-tactical", accent: "#9caf3e", bg: "#0d0f0c", text: "#e8e6dd", code: "MUTED"    },
    { name: "hc-white",          accent: "#7e00ff", bg: "#ffffff", text: "#000000", code: "MUTED"    },
    { name: "lain",              accent: "#ff4da6", bg: "#0a0a14", text: "#e6e6ff", code: "LAIN"     },
    { name: "leather-bourbon",   accent: "#C87833", bg: "#000000", text: "#f5ead8", code: "MATCH"    },
    { name: "light-sakura",      accent: "#c72c48", bg: "#fff5f7", text: "#2a1a1d", code: "MATCH"    },
    { name: "light-teal",        accent: "#008b8b", bg: "#f0fafa", text: "#0a1a1a", code: "MATCH"    },
    { name: "matrix",            accent: "#00ff41", bg: "#0a0a0a", text: "#ffffff", code: "TERMINAL" },
    { name: "mauve-dust",        accent: "#b080ab", bg: "#0f0a0e", text: "#ebd9e6", code: "MATCH"    },
    { name: "midnight-cobalt",   accent: "#2962ff", bg: "#050816", text: "#ffffff", code: "MATCH"    },
    { name: "neon-void",         accent: "#ff0060", bg: "#0f0306", text: "#ffffff", code: "MATCH"    },
    { name: "noir",              accent: "#f0f0f0", bg: "#000000", text: "#ffffff", code: "LAIN"     },
    { name: "periwinkle-mist",   accent: "#8a9dff", bg: "#08090f", text: "#e8eaf5", code: "MATCH"    },
    { name: "phosphor-amber",    accent: "#ffb000", bg: "#0a0700", text: "#ffb000", code: "LAIN"     },
    { name: "phosphor-blue",     accent: "#4d8aff", bg: "#00040a", text: "#4d8aff", code: "MATCH"    },
    { name: "phosphor-cyan",     accent: "#4dffff", bg: "#000a0a", text: "#4dffff", code: "MATCH"    },
    { name: "phosphor-green",    accent: "#33ff66", bg: "#000a02", text: "#33ff66", code: "LAIN"     },
    { name: "phosphor-purple",   accent: "#c266ff", bg: "#07000a", text: "#c266ff", code: "LAIN"     },
    { name: "phosphor-red",      accent: "#ff4d4d", bg: "#0a0202", text: "#ff4d4d", code: "LAIN"     },
    { name: "salmon-tide",       accent: "#fa8072", bg: "#14080a", text: "#ffe6e0", code: "MATCH"    },
    { name: "slate-monochrome",  accent: "#778899", bg: "#0e0e0f", text: "#f0f4f8", code: "MUTED"    },
    { name: "teal",              accent: "#00ffcc", bg: "#0a0a0a", text: "#ffffff", code: "MATCH"    },
    { name: "terracotta-earth",  accent: "#c46a4d", bg: "#110a06", text: "#f0d8c4", code: "MATCH"    },
    { name: "tritanopia",        accent: "#0000ff", bg: "#1a1a00", text: "#9999ff", code: "MATCH"    },
    { name: "ultraviolet",       accent: "#9d00ff", bg: "#0a0012", text: "#ffffff", code: "MATCH"    },
    { name: "vaporwave",         accent: "#ff00ff", bg: "#1a0033", text: "#00ffff", code: "MATCH"    },
    { name: "violet",            accent: "#ff0080", bg: "#0a0612", text: "#ffffff", code: "MATCH"    },
    { name: "void-transmission", accent: "#bb00ff", bg: "#08000f", text: "#f0f0ff", code: "MATCH"    },
    { name: "void-wine",         accent: "#aa2255", bg: "#0d0306", text: "#ffffff", code: "MATCH"    },

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

  function deriveText(hex, accentHex, bgHex) {
    const {h,s,l} = hexToHsl(hex);

    // ACHROMATIC: 100/72/42/23/23 — matches noir source curve.
    // When bg has hue (dark-sakura wine, void-wine, crimson-surge, etc.) pure
    // grayscale text reads as harsh grey against the tinted bg — Anthropic's
    // --cds-gray-810..890 ramp carries h=60, s≈1.7% for exactly this reason
    // (their greys harmonize with brand orange instead of clashing). Inherit
    // bg's hue at low saturation (≤10) when bg has color. Noir keeps pure
    // grayscale because its bg is also s=0 so the inheritance doesn't fire.
    if (s < 5) {
      const bg = bgHex ? hexToHsl(bgHex) : null;
      const tintH = bg && bg.s > 5 ? bg.h : 0;
      const tintS = bg && bg.s > 5 ? Math.min(bg.s * 0.15, 10) : 0;
      const ramp = [l, l, l*0.72, l*0.42, l*0.23, Math.min(l*0.23, 23)];
      return ramp.map(L => ({h:tintH, s:tintS, l:Math.max(0,Math.min(100,L))}));
    }

    // MONOCHROME: phosphor curve. Floors on tier 4 (40) and tier 5 (28) keep
    // sidebar metadata legible — Anthropic uses `text-text-400/80` for labels
    // ("Pinned", "Drag to pin", section headers) and the unfloored curve dropped
    // those to L≈18 × 0.8α onto bg L≈2, contrast ratio ~1.4:1. With floor 40 the
    // alpha-mixed effective L is ~32 → ~3:1 vs near-black, clears WCAG large-text
    // and stays readable. Tier 0–3 (the loud parts) still ride the source L,
    // so the phosphor signature reads at the same intensity on body text.
    if (accentHex && isMonochromeTheme(hex, accentHex)) {
      const ramp = [l, l, l*0.80, l*0.48, Math.max(l*0.28, 40), Math.max(l*0.16, 28)];
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

  function deriveBorders(textHex, bgHex) {
    const {h, s} = hexToHsl(textHex);
    if (s < 5) {
      // Same hue-inheritance trick as deriveText — borders look more dialed-in
      // when they share a sliver of bg's hue rather than being pure grey on
      // tinted bg. Slightly more saturation than text (15 cap vs 10) since
      // borders are large surfaces where subtle warmth reads as cohesion.
      const bg = bgHex ? hexToHsl(bgHex) : null;
      const tintH = bg && bg.s > 5 ? bg.h : 0;
      const tintS = bg && bg.s > 5 ? Math.min(bg.s * 0.25, 15) : 0;
      return [{h:tintH,s:tintS,l:45},{h:tintH,s:tintS,l:36},{h:tintH,s:tintS,l:28},{h:tintH,s:tintS,l:22}];
    }
    return [{h,s:33,l:45},{h,s:33,l:36},{h,s:33,l:28},{h,s:33,l:22}];
  }

  function derivePro(textHex) {
    const {h, s} = hexToHsl(textHex);
    if (s < 5) return [{h:0,s:0,l:85},{h:0,s:0,l:76},{h:0,s:0,l:64},{h:0,s:0,l:18}];
    return [{h,s:100,l:85},{h,s:100,l:76},{h,s:60,l:64},{h,s:38,l:18}];
  }

  function deriveZRamp(bgHex, textHex, accentHex) {
    const bg = deriveBg(bgHex);
    const tx = deriveText(textHex, accentHex, bgHex);
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
    // Font family is opt-in. If user hasn't picked one, emit zero font-family
    // overrides so Claude's stock stack wins. Sizes/leading still apply.
    const hasFont = !!(t.font && t.font.trim());
    const f = hasFont ? JSON.stringify(t.font) : "";
    const fontFamilyVars = hasFont ? `
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
  --font-dyslexia: ${f} !important;` : "";
    const familyVars = hasFont ? `
  --family-ui: ${f} !important;
  --family-monospace: ${f} !important;` : "";
    const fontFamilyVarsCds = hasFont ? `
  --cds-font-sans: ${f} !important;
  --cds-font-mono: ${f} !important;
  --cds-font-voice: ${f} !important;` : "";
    const hljsFontLine = hasFont ? `font-family: ${f} !important;` : "";
    // Tokens are emitted in rem against a fixed 16px denominator (web
    // standard). The :root font-size we set drives the actual rendered px:
    // body=13 → 0.8125rem; at root=16 renders 13px, at root=20 renders
    // 16.25px. Bumping the root scales every token we own — text + leading
    // + chat-column font + df-row-font — together. Per-tier sliders still
    // pick relative ratios; the root slider is the master scale.
    const REM_DEN = 16;
    const rootSize = (typeof t.rootSize === "number" && isFinite(t.rootSize) && t.rootSize > 0) ? t.rootSize : 16;
    const remFmt = (px) => {
      const n = px / REM_DEN;
      return n.toFixed(4).replace(/0+$/, "").replace(/\.$/, "") + "rem";
    };
    const sz = (k) => remFmt(t.sizes[k]);
    // Per-tier leading multipliers from lain originals so defaults reproduce
    // exactly. Code/body get most breathing (1.38-1.42); titles stay tight (1.20).
    // Leading driven by STATE.leading (user-adjustable per tier via sliders).
    const lr = (k) => (t.leading[k] || DEFAULT_LEADING[k]).toFixed(10).replace(/0+$/, "").replace(/\.$/, "");
    const lh = (k) => remFmt(Math.round(t.sizes[k] * (t.leading[k] || DEFAULT_LEADING[k])));

    const accentBright = lighten(t.accent, 8);
    const accentDim    = darken(t.accent, 10);

    const bgRamp = deriveBg(t.bg);
    const txRamp = deriveText(t.text, t.accent, t.bg);
    const bdRamp = deriveBorders(t.text, t.bg);
    const proRamp = derivePro(t.text);
    const zHex = deriveZRamp(t.bg, t.text, t.accent);

    const bg0 = hslHex(bgRamp[0].h, bgRamp[0].s, bgRamp[0].l);
    const bg1 = hslHex(bgRamp[1].h, bgRamp[1].s, bgRamp[1].l);
    const bg2 = hslHex(bgRamp[2].h, bgRamp[2].s, bgRamp[2].l);
    const bg3 = hslHex(bgRamp[3].h, bgRamp[3].s, bgRamp[3].l);
    const tx0 = hslHex(txRamp[0].h, txRamp[0].s, txRamp[0].l);
    const tx2 = hslHex(txRamp[2].h, txRamp[2].s, txRamp[2].l);
    const tx3 = hslHex(txRamp[3].h, txRamp[3].s, txRamp[3].l);

    // On-accent foreground for ::selection and any "text on filled accent" use.
    // Pick whichever of {tx0, bg0} has greater luminance distance from accent —
    // works for both dark themes (tx0 light, bg0 dark) and light themes (tx0
    // dark, bg0 light) without a hardcoded l<50 threshold that flips wrong on
    // inverted palettes.
    const accentL = hexToHsl(t.accent).l;
    const _tx0L = hexToHsl(tx0).l;
    const _bg0L = hexToHsl(bg0).l;
    const onAccent = Math.abs(_tx0L - accentL) > Math.abs(_bg0L - accentL) ? tx0 : bg0;

    const trgb = hexToRgb(t.text);
    const tov = (a) => `rgba(${trgb.r}, ${trgb.g}, ${trgb.b}, ${a})`;

    const code = getCodePalette();
    const semSuccess = code.string;
    const semWarning = code.builtin;
    const semError   = code.name;
    const semInfo    = code.type;
    const diffMix = (base, color, pct) => `color-mix(in srgb, ${base} ${pct}%, ${color})`;

    const triple = (c) => hslTripleRaw(c.h, c.s, c.l);

    const borderMidHex = hslHex(bdRamp[0].h, bdRamp[0].s, bdRamp[0].l);
    const borderMidRgb = hexToRgb(borderMidHex);
    const borderRgba = (a) => `rgba(${borderMidRgb.r}, ${borderMidRgb.g}, ${borderMidRgb.b}, ${a})`;
    const mainWidth = Math.max(30, Math.min(100, Number(t.layout?.mainWidth ?? DEFAULT_LAYOUT.mainWidth)));
    const mainMarginLeft = Math.max(0, Math.min(70, Number(t.layout?.mainMarginLeft ?? DEFAULT_LAYOUT.mainMarginLeft)));
    const chatWidth = Math.max(30, Math.min(100, Number(t.layout?.chatWidth ?? DEFAULT_LAYOUT.chatWidth)));
    const wallpaper = { ...DEFAULT_WALLPAPER, ...(t.wallpaper || {}) };
    const wallpaperOpacity = Math.max(0, Math.min(100, Number(wallpaper.opacity))) / 100;
    const sidebarWallpaper = { ...DEFAULT_SIDEBAR_WALLPAPER, ...(t.sidebarWallpaper || {}) };
    const sidebarWallpaperOpacity = Math.max(0, Math.min(100, Number(sidebarWallpaper.opacity))) / 100;
    const wallpaperCss = wallpaper.enabled && wallpaper.image ? `
.epitaxy-root .dframe-content-inner,
[data-mode="dark"] .epitaxy-root .dframe-content-inner,
.dframe-pane-host {
  position: relative !important;
  isolation: isolate !important;
}
.epitaxy-root .dframe-content-inner::before,
[data-mode="dark"] .epitaxy-root .dframe-content-inner::before,
.dframe-pane-host::before {
  content: "" !important;
  position: absolute !important;
  inset: 0 !important;
  pointer-events: none !important;
  z-index: 0 !important;
  background: ${accentDim} !important;
  -webkit-mask: url(${JSON.stringify(wallpaper.image)}) center / auto repeat !important;
  mask: url(${JSON.stringify(wallpaper.image)}) center / auto repeat !important;
  opacity: ${wallpaperOpacity} !important;
  mix-blend-mode: ${wallpaper.blend || "normal"} !important;
}
.epitaxy-root .dframe-content-inner > *,
[data-mode="dark"] .epitaxy-root .dframe-content-inner > *,
.dframe-pane-host > * {
  position: relative;
  z-index: 1;
}` : "";
    const sidebarWallpaperCss = sidebarWallpaper.enabled && sidebarWallpaper.image ? `
#frame-peek-popover {
  position: relative !important;
  isolation: isolate !important;
}
#frame-peek-popover::before {
  content: "" !important;
  position: absolute !important;
  inset: 0 !important;
  pointer-events: none !important;
  z-index: 0 !important;
  background: ${accentDim} !important;
  -webkit-mask: url(${JSON.stringify(sidebarWallpaper.image)}) center / auto repeat !important;
  mask: url(${JSON.stringify(sidebarWallpaper.image)}) center / auto repeat !important;
  opacity: ${sidebarWallpaperOpacity} !important;
}
#frame-peek-popover > * {
  position: relative;
  z-index: 1;
}` : "";

    return `:root {
  font-size: ${rootSize}px !important;
}
html, body {
  background: ${bg0} !important;
  background-color: ${bg0} !important;
}

/* Selection — Chrome's default blue is jarring against custom palettes.
 * Bg = accent, fg = whichever of {tx0, bg0} is farther in luminance from
 * accent (handles dark + light themes without a hardcoded threshold).
 * text-shadow:none kills any inherited shadow so selection stays clean. */
::selection {
  background: ${t.accent} !important;
  color: ${onAccent} !important;
  text-shadow: none !important;
}
::-moz-selection {
  background: ${t.accent} !important;
  color: ${onAccent} !important;
  text-shadow: none !important;
}
${hasFont ? `
/* Letter-spacing reset — gated on hasFont. Anthropic's body styles tune
 * letter-spacing for Anthropic Sans's tighter natural advance. Custom mono
 * fonts (Space Mono, JetBrains Mono, Iosevka) carry their own tracking
 * baked into the font, so the inherited letter-spacing stacks on top and
 * makes glyphs feel "wider than they should be." Reset only when a custom
 * font is active, so stock Anthropic typography keeps its intended rhythm.
 * font-feature-settings/font-variation-settings are LEFT ALONE — preserves
 * programming-font ligatures (calt) the user likely wants. */
.epitaxy-root,
.epitaxy-root .epitaxy-chat-column,
.epitaxy-markdown,
.font-claude-response-body,
.hljs, code.hljs, pre code.hljs,
.cds-root,
.dframe-root {
  letter-spacing: 0 !important;
}` : ""}

/* Surface backstop — Anthropic paints sidebar/content via
 * color-mix(--cds-page-bg, --cds-clay, X%) which inherits our accent and
 * tints the surface (e.g. leather-bourbon → brown sidebar, acid-bath →
 * olive sidebar) even when bg=#000000. Force bg0 here so "bg means bg".
 * Wallpaper ::before stacks on top of this; children sit at z-index 1. */
.dframe-sidebar-body,
#frame-peek-popover,
.epitaxy-root .dframe-content-inner,
[data-mode="dark"] .epitaxy-root .dframe-content-inner,
.dframe-pane-host {
  background: ${bg0} !important;
  background-color: ${bg0} !important;
}
${wallpaperCss}
${sidebarWallpaperCss}

.epitaxy-root .flex-1.min-h-0.relative.isolate[class*="--epitaxy-scrim-inset-end:16px"],
[data-mode="dark"] .epitaxy-root .flex-1.min-h-0.relative.isolate[class*="--epitaxy-scrim-inset-end:16px"] {
  width: ${mainWidth}% !important;
  margin-left: ${mainMarginLeft}% !important;
}

:root,
[data-theme="claude"],
[data-theme="claude"][data-mode="dark"],
[data-color-version="v2"][data-theme="claude"],
[data-color-version="v2"][data-theme="claude"][data-mode="dark"],
[data-theme="console"],
[data-theme="console"][data-mode="dark"],
[data-color-version="v2"][data-theme="console"],
[data-color-version="v2"][data-theme="console"][data-mode="dark"] {${fontFamilyVars}

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

  --code-theme-light-bg: ${bg2} !important;
  --code-theme-dark-bg: ${bg2} !important;
}

.cds-root,
[data-mode="dark"] .cds-root,
.cds-root[data-mode="dark"] {${fontFamilyVarsCds}

  --cds-surface-0: ${bg0} !important;
  --cds-surface-1: ${bg1} !important;
  --cds-surface-2: ${bg2} !important;
  --cds-surface-3: ${bg3} !important;
  --cds-page-bg: ${bg0} !important;
  --cds-surface-panel: ${bg1} !important;
  --cds-surface-popover: ${bg3} !important;

  --cds-text-primary: ${tx0} !important;
  --cds-text-secondary: ${tx2} !important;
  --cds-text-muted: ${tx3} !important;
  --cds-text-disabled: ${rgba(t.text, 0.35)} !important;

  --cds-clay: ${t.accent} !important;
  --cds-clay-emphasized: ${accentBright} !important;

  --cds-fill-primary: ${t.accent} !important;
  --cds-fill-primary-hover: ${accentBright} !important;
  --cds-fill-accent: ${t.accent} !important;
  --cds-fill-accent-hover: ${accentBright} !important;
  --cds-fill-brand: ${t.accent} !important;
  --cds-fill-brand-hover: ${accentBright} !important;

  --cds-fill-danger: ${semError} !important;
  --cds-fill-danger-hover: ${lighten(semError, 8)} !important;
  --cds-fill-success: ${semSuccess} !important;
  --cds-fill-success-hover: ${lighten(semSuccess, 8)} !important;
  --cds-fill-warning: ${semWarning} !important;
  --cds-fill-warning-hover: ${lighten(semWarning, 8)} !important;

  --cds-text-accent: ${t.accent} !important;
  --cds-text-danger: ${semError} !important;
  --cds-text-success: ${semSuccess} !important;
  --cds-text-warning: ${semWarning} !important;
  --cds-text-pro: ${tx3} !important;
  --cds-text-pink: ${accentBright} !important;

  --cds-bg-accent: ${rgba(t.accent, 0.10)} !important;
  --cds-bg-accent-chip: ${rgba(t.accent, 0.18)} !important;
  --cds-bg-danger: ${rgba(semError, 0.10)} !important;
  --cds-bg-danger-chip: ${rgba(semError, 0.18)} !important;
  --cds-bg-success: ${rgba(semSuccess, 0.10)} !important;
  --cds-bg-success-chip: ${rgba(semSuccess, 0.18)} !important;
  --cds-bg-warning: ${rgba(semWarning, 0.10)} !important;
  --cds-bg-warning-chip: ${rgba(semWarning, 0.18)} !important;
  --cds-bg-pro: ${rgba(t.accent, 0.10)} !important;
  --cds-bg-pro-chip: ${rgba(t.accent, 0.18)} !important;
  --cds-bg-pink: ${rgba(t.accent, 0.10)} !important;
  --cds-bg-pink-chip: ${rgba(t.accent, 0.18)} !important;

  --cds-border-accent: ${rgba(t.accent, 0.40)} !important;
  --cds-border-danger: ${rgba(semError, 0.40)} !important;
  --cds-border-success: ${rgba(semSuccess, 0.40)} !important;
  --cds-border-warning: ${rgba(semWarning, 0.40)} !important;
  --cds-border-pro: ${rgba(t.accent, 0.40)} !important;

  --cds-border: ${rgba(t.text, 0.10)} !important;
  --cds-border-strong: ${rgba(t.text, 0.20)} !important;
  --cds-border-stronger: ${rgba(t.text, 0.40)} !important;

  --cds-on-primary: ${tx0} !important;
  --cds-on-accent: ${tx0} !important;
  --cds-on-brand: ${tx0} !important;
  --cds-on-danger: #ffffff !important;
  --cds-on-success: ${bg0} !important;
  --cds-on-warning: ${bg0} !important;
  --cds-on-pro: ${tx0} !important;

  --cds-text-caption: ${sz('caption')} !important;
  --cds-text-footnote: ${sz('footnote')} !important;
  --cds-text-code: ${sz('code')} !important;
  --cds-text-body: ${sz('body')} !important;
  --cds-text-heading: ${sz('heading')} !important;
  --cds-text-title: ${sz('title')} !important;

  --cds-leading-caption: ${lh('caption')} !important;
  --cds-leading-footnote: ${lh('footnote')} !important;
  --cds-leading-code: ${lh('code')} !important;
  --cds-leading-body: ${lh('body')} !important;
  --cds-leading-heading: ${lh('heading')} !important;
  --cds-leading-title: ${lh('title')} !important;
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
[data-mode="dark"] .epitaxy-root {${familyVars}

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

.epitaxy-root .epitaxy-chat-column,
[data-mode="dark"] .epitaxy-root .epitaxy-chat-column,
.epitaxy-markdown {
  --text-body: ${sz('body')} !important;
  --leading-body: ${lr('body')} !important;
  --chat-turn-gap: calc(var(--text-body) * var(--leading-body) * .75) !important;
  --chat-item-gap: calc(var(--text-body) * var(--leading-body) * .5) !important;
  width: ${chatWidth}% !important;
  margin-inline: auto !important;
  font-size: ${sz('body')} !important;
  line-height: var(--leading-body) !important;
}

[data-diffs-header],
[data-diff],
[data-file],
[data-error-wrapper],
[data-virtualizer-buffer] {
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
  --diffs-bg: ${bg2} !important;
  --diffs-bg-buffer-override: ${bg1} !important;
  --diffs-bg-hover-override: ${bg3} !important;
  --diffs-bg-context-override: ${bg1} !important;
  --diffs-bg-context-number-override: ${bg0} !important;
  --diffs-bg-separator-override: ${hslHex(bdRamp[3].h, bdRamp[3].s, bdRamp[3].l)} !important;
  --diffs-fg: ${tx0} !important;
  --diffs-fg-number-override: ${tx3} !important;
  --diffs-deletion-color-override: ${semError} !important;
  --diffs-addition-color-override: ${semSuccess} !important;
  --diffs-modified-color-override: ${semInfo} !important;
  --diffs-bg-deletion-override: ${diffMix(bg2, semError, 78)} !important;
  --diffs-bg-deletion-number-override: ${diffMix(bg2, semError, 86)} !important;
  --diffs-bg-deletion-hover-override: ${diffMix(bg2, semError, 70)} !important;
  --diffs-bg-deletion-emphasis-override: ${rgba(semError, 0.22)} !important;
  --diffs-bg-addition-override: ${diffMix(bg2, semSuccess, 78)} !important;
  --diffs-bg-addition-number-override: ${diffMix(bg2, semSuccess, 86)} !important;
  --diffs-bg-addition-hover-override: ${diffMix(bg2, semSuccess, 70)} !important;
  --diffs-bg-addition-emphasis-override: ${rgba(semSuccess, 0.22)} !important;
  --diffs-bg-selection-override: ${diffMix(bg2, semInfo, 74)} !important;
  --diffs-bg-selection-number-override: ${diffMix(bg2, semInfo, 66)} !important;
  --diffs-bg-conflict-marker-override: ${diffMix(bg2, semWarning, 76)} !important;
  --diffs-bg-conflict-current-override: ${diffMix(bg2, semSuccess, 76)} !important;
  --diffs-bg-conflict-base-override: ${diffMix(bg2, semInfo, 78)} !important;
  --diffs-bg-conflict-incoming-override: ${diffMix(bg2, semInfo, 72)} !important;
  --diffs-bg-conflict-marker-number-override: ${diffMix(bg2, semWarning, 66)} !important;
  --diffs-bg-conflict-current-number-override: ${diffMix(bg2, semSuccess, 66)} !important;
  --diffs-bg-conflict-base-number-override: ${diffMix(bg2, semInfo, 68)} !important;
  --diffs-bg-conflict-incoming-number-override: ${diffMix(bg2, semInfo, 62)} !important;
  --conflict-bg-current-override: ${diffMix(bg2, semSuccess, 78)} !important;
  --conflict-bg-incoming-override: ${diffMix(bg2, semInfo, 78)} !important;
  --conflict-bg-current-number-override: ${diffMix(bg2, semSuccess, 86)} !important;
  --conflict-bg-incoming-number-override: ${diffMix(bg2, semInfo, 84)} !important;
  --conflict-bg-current-header-override: ${diffMix(bg2, semSuccess, 64)} !important;
  --conflict-bg-incoming-header-override: ${diffMix(bg2, semInfo, 64)} !important;
  --conflict-bg-current-header-number-override: ${diffMix(bg2, semSuccess, 58)} !important;
  --conflict-bg-incoming-header-number-override: ${diffMix(bg2, semInfo, 58)} !important;
  background-color: var(--diffs-bg) !important;
  color: var(--diffs-fg) !important;
}

.epitaxy-markdown pre,
.epitaxy-markdown pre:has(code),
pre:has(> code.hljs) {
  background: ${bg2} !important;
  color: ${tx0} !important;
  border-color: ${hslHex(bdRamp[3].h, bdRamp[3].s, bdRamp[3].l)} !important;
}

.hljs, pre code.hljs, code.hljs {
  background: ${bg2} !important;
  color: ${tx0} !important;
  ${hljsFontLine}
}
.hljs-comment, .hljs-quote { color: ${code.comment} !important; font-style: italic !important; }
.hljs-keyword, .hljs-doctag, .hljs-formula { color: ${code.keyword} !important; }
.hljs-string, .hljs-regexp, .hljs-addition, .hljs-attribute, .hljs-meta .hljs-string { color: ${code.string} !important; }
.hljs-number, .hljs-literal, .hljs-type, .hljs-variable, .hljs-template-variable { color: ${code.type} !important; }
.hljs-title, .hljs-symbol, .hljs-bullet, .hljs-link, .hljs-meta, .hljs-selector-id { color: ${tx3} !important; }
.hljs-name, .hljs-section, .hljs-selector-tag, .hljs-deletion, .hljs-subst { color: ${code.name} !important; }
.hljs-built_in, .hljs-class .hljs-title, .hljs-title.class_ { color: ${code.builtin} !important; }

.font-claude-response-body {
  font-size: ${sz('body')} !important;
  line-height: ${lh('body')} !important;
}`;
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
    const hasFont = !!(t.font && t.font.trim());
    const f = hasFont ? JSON.stringify(t.font) : "";
    const fontFamilyVars = hasFont ? `
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
  --font-dyslexia: ${f} !important;` : "";
    const familyVars = hasFont ? `
  --family-ui: ${f} !important;
  --family-monospace: ${f} !important;` : "";
    const fontFamilyVarsCds = hasFont ? `
  --cds-font-sans: ${f} !important;
  --cds-font-mono: ${f} !important;
  --cds-font-voice: ${f} !important;` : "";
    const hljsFontLine = hasFont ? `font-family: ${f} !important;` : "";
    // Tokens in rem against fixed 16 denominator — same scheme as buildCss().
    // :root font-size below drives the actual rendered px.
    const REM_DEN = 16;
    const rootSize = (typeof t.rootSize === "number" && isFinite(t.rootSize) && t.rootSize > 0) ? t.rootSize : 16;
    const remFmt = (px) => {
      const n = px / REM_DEN;
      return n.toFixed(4).replace(/0+$/, "").replace(/\.$/, "") + "rem";
    };
    const sz = (k) => remFmt(t.sizes[k]);
    // Leading driven by STATE.leading (user-adjustable per tier via sliders).
    const lr = (k) => (t.leading[k] || DEFAULT_LEADING[k]).toFixed(10).replace(/0+$/, "").replace(/\.$/, "");
    const lh = (k) => remFmt(Math.round(t.sizes[k] * (t.leading[k] || DEFAULT_LEADING[k])));
    const mainWidth = Math.max(30, Math.min(100, Number(t.layout?.mainWidth ?? DEFAULT_LAYOUT.mainWidth)));
    const mainMarginLeft = Math.max(0, Math.min(70, Number(t.layout?.mainMarginLeft ?? DEFAULT_LAYOUT.mainMarginLeft)));
    const chatWidth = Math.max(30, Math.min(100, Number(t.layout?.chatWidth ?? DEFAULT_LAYOUT.chatWidth)));

    return `:root {
  font-size: ${rootSize}px !important;
}

:root,
[data-theme="claude"],
[data-theme="claude"][data-mode="dark"],
[data-color-version="v2"][data-theme="claude"],
[data-color-version="v2"][data-theme="claude"][data-mode="dark"],
[data-theme="console"],
[data-theme="console"][data-mode="dark"],
[data-color-version="v2"][data-theme="console"],
[data-color-version="v2"][data-theme="console"][data-mode="dark"] {${fontFamilyVars}
}

.cds-root,
[data-mode="dark"] .cds-root,
.cds-root[data-mode="dark"] {${fontFamilyVarsCds}

  --cds-text-caption: ${sz('caption')} !important;
  --cds-text-footnote: ${sz('footnote')} !important;
  --cds-text-code: ${sz('code')} !important;
  --cds-text-body: ${sz('body')} !important;
  --cds-text-heading: ${sz('heading')} !important;
  --cds-text-title: ${sz('title')} !important;

  --cds-leading-caption: ${lh('caption')} !important;
  --cds-leading-footnote: ${lh('footnote')} !important;
  --cds-leading-code: ${lh('code')} !important;
  --cds-leading-body: ${lh('body')} !important;
  --cds-leading-heading: ${lh('heading')} !important;
  --cds-leading-title: ${lh('title')} !important;
}

.dframe-root,
[data-mode="dark"] .dframe-root {
  --df-row-font: ${sz('body')} !important;
}

.epitaxy-root .flex-1.min-h-0.relative.isolate[class*="--epitaxy-scrim-inset-end:16px"],
[data-mode="dark"] .epitaxy-root .flex-1.min-h-0.relative.isolate[class*="--epitaxy-scrim-inset-end:16px"] {
  width: ${mainWidth}% !important;
  margin-left: ${mainMarginLeft}% !important;
}

.epitaxy-root,
[data-mode="dark"] .epitaxy-root {${familyVars}

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

.epitaxy-root .epitaxy-chat-column,
[data-mode="dark"] .epitaxy-root .epitaxy-chat-column,
.epitaxy-markdown {
  --text-body: ${sz('body')} !important;
  --leading-body: ${lr('body')} !important;
  --chat-turn-gap: calc(var(--text-body) * var(--leading-body) * .75) !important;
  --chat-item-gap: calc(var(--text-body) * var(--leading-body) * .5) !important;
  width: ${chatWidth}% !important;
  margin-inline: auto !important;
  font-size: ${sz('body')} !important;
  line-height: var(--leading-body) !important;
}

.hljs, pre code.hljs, code.hljs {
  ${hljsFontLine}
}

.font-claude-response-body {
  font-size: ${sz('body')} !important;
  line-height: ${lh('body')} !important;
}
${hasFont ? `
/* Letter-spacing reset — gated on hasFont. Same logic as buildCss(): when
 * a custom font is active, neutralize Anthropic's tuning so user fonts
 * render at their designer-intended advance width. font-only mode IS
 * exactly the case where this matters most (custom font + stock colors). */
.epitaxy-root,
.epitaxy-root .epitaxy-chat-column,
.epitaxy-markdown,
.font-claude-response-body,
.hljs, code.hljs, pre code.hljs,
.cds-root,
.dframe-root {
  letter-spacing: 0 !important;
}` : ""}`;
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

/* Styled file input — hides the native <input type=file> and renders a
 * button + truncating filename inside a label. Clicking the label triggers
 * the input via the standard <label><input/></label> nesting. We don't
 * display:none the input because Firefox loses focusability that way; we
 * pin it to 1×1 with opacity 0 instead. */
.file-input { flex: 1; display: flex; align-items: stretch; min-width: 0; border: 1px solid var(--io-border); background: var(--io-surface-sunken); cursor: pointer; overflow: hidden; }
.file-input:hover { border-color: var(--io-accent-dim); }
.file-input input[type=file] { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
.file-input .file-btn { background: var(--io-accent-subtle); color: var(--io-accent); padding: 6px 10px; border-right: 1px solid var(--io-border); letter-spacing: 0.1em; text-transform: uppercase; font-size: 12px; flex-shrink: 0; display: inline-flex; align-items: center; }
.file-input:hover .file-btn { background: var(--io-accent); color: var(--io-on-accent); }
.file-input .file-name { flex: 1; min-width: 0; padding: 6px 10px; color: var(--io-text-tertiary); font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: inline-flex; align-items: center; }
.file-input.has-file .file-name { color: var(--io-text-primary); }

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
    <button class="tab" data-tab="CANVAS">Canvas</button>
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
          <input type="text" class="font-input" id="fontInput" placeholder="font name (any installed)" value="">
          <button class="btn primary" id="applyFontBtn">APPLY FONT</button>
        </div>
        <div class="applied-tag" id="appliedTag">applied: (claude default)</div>
      </div>
    </div>
    <div class="section">
      <div class="section-h">Sizes<span class="right"><b>7</b> tiers</span></div>
      <div class="section-body" id="sizeRows"></div>
    </div>
    <div class="section">
      <div class="section-h">Line Height<span class="right"><b>7</b> tiers</span></div>
      <div class="section-body" id="leadingRows"></div>
    </div>
  </div>

  <div class="tab-pane" data-pane="CANVAS">
    <div class="section">
      <div class="section-h">Layout<span class="right"><b>3</b> sliders</span></div>
      <div class="section-body" id="layoutRows"></div>
    </div>
    <div class="section">
      <div class="section-h">Content Texture<span class="right"><b>webp</b> local</span></div>
      <div class="section-body">
        <div class="font-row">
          <label class="file-input">
            <input type="file" id="wallpaperInput" accept="image/webp,image/png,image/jpeg,image/gif">
            <span class="file-btn">CHOOSE IMAGE</span>
            <span class="file-name" id="wallpaperName">no file</span>
          </label>
          <button class="btn" id="clearWallpaperBtn">CLEAR</button>
        </div>
        <label class="live-toggle" id="wallpaperToggle"><input type="checkbox" id="wallpaperCheck"> ENABLE</label>
        <div class="size-row" id="wallpaperOpacityRow">
          <span class="lbl">opacity</span>
          <input type="range" class="slider" id="wallpaperOpacity" min="0" max="80" step="1" value="18">
          <span class="val" id="wallpaperOpacityVal">18%</span>
        </div>
        <div class="font-row">
          <select class="font-input" id="wallpaperBlend">
            <option value="normal">normal</option>
            <option value="multiply">multiply</option>
            <option value="screen">screen</option>
            <option value="overlay">overlay</option>
            <option value="soft-light">soft-light</option>
            <option value="hard-light">hard-light</option>
            <option value="luminosity">luminosity</option>
          </select>
        </div>
        <div class="applied-tag" id="wallpaperTag">texture: none</div>
      </div>
    </div>
    <div class="section">
      <div class="section-h">Sidebar Texture<span class="right"><b>peek</b> mask</span></div>
      <div class="section-body">
        <div class="font-row">
          <label class="file-input">
            <input type="file" id="sidebarWallpaperInput" accept="image/webp,image/png,image/jpeg,image/gif">
            <span class="file-btn">CHOOSE IMAGE</span>
            <span class="file-name" id="sidebarWallpaperName">no file</span>
          </label>
          <button class="btn" id="clearSidebarWallpaperBtn">CLEAR</button>
        </div>
        <label class="live-toggle" id="sidebarWallpaperToggle"><input type="checkbox" id="sidebarWallpaperCheck"> ENABLE</label>
        <div class="size-row">
          <span class="lbl">opacity</span>
          <input type="range" class="slider" id="sidebarWallpaperOpacity" min="0" max="80" step="1" value="18">
          <span class="val" id="sidebarWallpaperOpacityVal">18%</span>
        </div>
        <div class="applied-tag" id="sidebarWallpaperTag">sidebar: none</div>
      </div>
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
  // Close hides instead of destroying. The segmented-pill (LAIN button) is the
  // only way back in, so killing the host would orphan the user. Live theme
  // stays applied; the panel just goes invisible.
  $("closeBtn").addEventListener("click", () => { host.style.display = "none"; });

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
    // Master scale row first. Drives :root font-size; our overridden tokens
    // are emitted in rem so this scales them all together. Range 12-24 covers
    // ~75% to 150% of standard 16. Per-tier rows below stay relative.
    const rootRow = `<div class="size-row" data-size="root">
      <span class="lbl">root</span>
      <input type="range" class="slider" min="12" max="24" step="1" value="${STATE.rootSize}">
      <span class="val">${STATE.rootSize}px</span>
    </div>`;
    $("sizeRows").innerHTML = rootRow + order.map(k => {
      const [min, max] = ranges[k];
      return `<div class="size-row" data-size="${k}">
        <span class="lbl">${k}</span>
        <input type="range" class="slider" min="${min}" max="${max}" step="1" value="${STATE.sizes[k]}">
        <span class="val">${STATE.sizes[k]}px</span>
      </div>`;
    }).join("");
    $("sizeRows").querySelectorAll(".size-row").forEach(row => {
      const k = row.dataset.size;
      const slider = row.querySelector("input");
      const val = row.querySelector(".val");
      slider.addEventListener("input", () => {
        const v = parseInt(slider.value, 10);
        if (k === "root") {
          STATE.rootSize = v;
        } else {
          STATE.sizes[k] = v;
        }
        val.textContent = v + "px";
        renderStats();
        persistLast();
        if (STATE.live) applyLive();
      });
    });
  }
  // Line-height sliders. Same 7 tiers as sizes; range 1.00–2.50 step 0.05.
  // Computed leading (px) = round(size × ratio). Cheap mutation pattern:
  // skip render() to avoid full repaint, push through applyLive() if LIVE on.
  function renderLeadingRows() {
    const order = ["caption", "footnote", "code", "body", "heading", "prompt", "title"];
    $("leadingRows").innerHTML = order.map(k => {
      const v = STATE.leading[k].toFixed(2);
      return `<div class="size-row" data-leading="${k}">
        <span class="lbl">${k}</span>
        <input type="range" class="slider" min="1.00" max="2.50" step="0.05" value="${v}">
        <span class="val">${v}×</span>
      </div>`;
    }).join("");
    root.querySelectorAll("[data-leading]").forEach(row => {
      const k = row.dataset.leading;
      const slider = row.querySelector("input");
      const val = row.querySelector(".val");
      slider.addEventListener("input", () => {
        STATE.leading[k] = parseFloat(slider.value);
        val.textContent = STATE.leading[k].toFixed(2) + "×";
        persistLast();
        if (STATE.live) applyLive();
      });
    });
  }
  function renderLayoutRows() {
    const rows = [
      { key: "mainWidth", label: "main width", min: 30, max: 100 },
      { key: "mainMarginLeft", label: "main margin", min: 0, max: 70 },
      { key: "chatWidth", label: "message/input width", min: 30, max: 100 }
    ];
    $("layoutRows").innerHTML = rows.map(row => {
      const v = STATE.layout[row.key];
      return `<div class="size-row" data-layout="${row.key}">
        <span class="lbl">${row.label}</span>
        <input type="range" class="slider" min="${row.min}" max="${row.max}" step="1" value="${v}">
        <span class="val">${v}%</span>
      </div>`;
    }).join("");
    root.querySelectorAll("[data-layout]").forEach(row => {
      const key = row.dataset.layout;
      const slider = row.querySelector("input");
      const val = row.querySelector(".val");
      slider.addEventListener("input", () => {
        STATE.layout[key] = parseInt(slider.value, 10);
        val.textContent = STATE.layout[key] + "%";
        renderStats();
        persistLast();
        if (STATE.live) applyLive();
      });
    });
  }
  function renderWallpaperControls() {
    $("wallpaperCheck").checked = !!STATE.wallpaper.enabled;
    $("wallpaperToggle").classList.toggle("on", !!STATE.wallpaper.enabled);
    $("wallpaperOpacity").value = STATE.wallpaper.opacity;
    $("wallpaperOpacityVal").textContent = STATE.wallpaper.opacity + "%";
    $("wallpaperBlend").value = STATE.wallpaper.blend || "normal";
    $("wallpaperTag").textContent = STATE.wallpaper.image ? "texture: loaded" : "texture: none";
    // File-input label sync. Browsers don't restore the picker filename across
    // mounts; if there's a persisted image we just say "(saved texture)" so the
    // styled button doesn't claim "no file" while a wallpaper is clearly active.
    const wpName = $("wallpaperName");
    if (wpName) {
      if (!wpName.textContent || wpName.textContent === "no file") {
        wpName.textContent = STATE.wallpaper.image ? "(saved texture)" : "no file";
      }
      wpName.parentElement.classList.toggle("has-file", !!STATE.wallpaper.image);
    }
    $("sidebarWallpaperCheck").checked = !!STATE.sidebarWallpaper.enabled;
    $("sidebarWallpaperToggle").classList.toggle("on", !!STATE.sidebarWallpaper.enabled);
    $("sidebarWallpaperOpacity").value = STATE.sidebarWallpaper.opacity;
    $("sidebarWallpaperOpacityVal").textContent = STATE.sidebarWallpaper.opacity + "%";
    $("sidebarWallpaperTag").textContent = STATE.sidebarWallpaper.image ? "sidebar: loaded" : "sidebar: none";
    const swName = $("sidebarWallpaperName");
    if (swName) {
      if (!swName.textContent || swName.textContent === "no file") {
        swName.textContent = STATE.sidebarWallpaper.image ? "(saved texture)" : "no file";
      }
      swName.parentElement.classList.toggle("has-file", !!STATE.sidebarWallpaper.image);
    }
  }
  // Repaint the creator panel itself from current STATE so it matches
  // whatever theme is active. Sets --io-* vars directly on .panel.
  function renderPanelTheme() {
    const p = $("panel");
    const bgRamp = deriveBg(STATE.bg);
    const txRamp = deriveText(STATE.text, STATE.accent, STATE.bg);
    const bdRamp = deriveBorders(STATE.text, STATE.bg);
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
    $("appliedTag").textContent = "applied: " + (STATE.font && STATE.font.trim() ? STATE.font : "(claude default)");
  }
  function render() {
    renderSwatches();
    renderRamps();
    renderCodeChips();
    renderQuickPicks();
    renderThemes();
    renderLayoutRows();
    renderWallpaperControls();
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
    if (typeof t.rootSize === "number" && isFinite(t.rootSize) && t.rootSize > 0) STATE.rootSize = t.rootSize;
    if (t.sizes) {
      STATE.sizes = { ...DEFAULT_SIZES, ...t.sizes };
    }
    if (t.sizes || typeof t.rootSize === "number") renderSizeRows();
    if (t.leading) {
      STATE.leading = { ...DEFAULT_LEADING, ...t.leading };
      renderLeadingRows();
    }
    if (t.layout) {
      STATE.layout = { ...DEFAULT_LAYOUT, ...t.layout };
      renderLayoutRows();
    }
    if (t.wallpaper) {
      STATE.wallpaper = { ...DEFAULT_WALLPAPER, ...t.wallpaper };
      renderWallpaperControls();
    }
    if (t.sidebarWallpaper) {
      STATE.sidebarWallpaper = { ...DEFAULT_SIDEBAR_WALLPAPER, ...t.sidebarWallpaper };
      renderWallpaperControls();
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

  $("wallpaperCheck").addEventListener("change", (e) => {
    STATE.wallpaper.enabled = e.target.checked;
    $("wallpaperToggle").classList.toggle("on", STATE.wallpaper.enabled);
    persistLast();
    if (STATE.live) applyLive();
  });
  $("wallpaperOpacity").addEventListener("input", (e) => {
    STATE.wallpaper.opacity = parseInt(e.target.value, 10);
    $("wallpaperOpacityVal").textContent = STATE.wallpaper.opacity + "%";
    renderStats();
    persistLast();
    if (STATE.live) applyLive();
  });
  $("wallpaperBlend").addEventListener("change", (e) => {
    STATE.wallpaper.blend = e.target.value;
    renderStats();
    persistLast();
    if (STATE.live) applyLive();
  });
  $("wallpaperInput").addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      STATE.wallpaper.image = String(reader.result || "");
      STATE.wallpaper.enabled = true;
      const nm = $("wallpaperName");
      if (nm) { nm.textContent = file.name; nm.parentElement.classList.add("has-file"); }
      renderWallpaperControls();
      renderStats();
      persistLast();
      if (STATE.live) applyLive();
      toast("texture loaded");
    };
    reader.onerror = () => toast("background load failed");
    reader.readAsDataURL(file);
  });
  $("clearWallpaperBtn").addEventListener("click", () => {
    STATE.wallpaper = { ...DEFAULT_WALLPAPER };
    $("wallpaperInput").value = "";
    const nm = $("wallpaperName");
    if (nm) { nm.textContent = "no file"; nm.parentElement.classList.remove("has-file"); }
    renderWallpaperControls();
    renderStats();
    persistLast();
    if (STATE.live) applyLive();
    toast("texture cleared");
  });
  $("sidebarWallpaperCheck").addEventListener("change", (e) => {
    STATE.sidebarWallpaper.enabled = e.target.checked;
    $("sidebarWallpaperToggle").classList.toggle("on", STATE.sidebarWallpaper.enabled);
    persistLast();
    if (STATE.live) applyLive();
  });
  $("sidebarWallpaperOpacity").addEventListener("input", (e) => {
    STATE.sidebarWallpaper.opacity = parseInt(e.target.value, 10);
    $("sidebarWallpaperOpacityVal").textContent = STATE.sidebarWallpaper.opacity + "%";
    renderStats();
    persistLast();
    if (STATE.live) applyLive();
  });
  $("sidebarWallpaperInput").addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      STATE.sidebarWallpaper.image = String(reader.result || "");
      STATE.sidebarWallpaper.enabled = true;
      const nm = $("sidebarWallpaperName");
      if (nm) { nm.textContent = file.name; nm.parentElement.classList.add("has-file"); }
      renderWallpaperControls();
      renderStats();
      persistLast();
      if (STATE.live) applyLive();
      toast("sidebar texture loaded");
    };
    reader.onerror = () => toast("sidebar texture failed");
    reader.readAsDataURL(file);
  });
  $("clearSidebarWallpaperBtn").addEventListener("click", () => {
    STATE.sidebarWallpaper = { ...DEFAULT_SIDEBAR_WALLPAPER };
    $("sidebarWallpaperInput").value = "";
    const nm = $("sidebarWallpaperName");
    if (nm) { nm.textContent = "no file"; nm.parentElement.classList.remove("has-file"); }
    renderWallpaperControls();
    renderStats();
    persistLast();
    if (STATE.live) applyLive();
    toast("sidebar texture cleared");
  });

  $("resetSizesBtn").addEventListener("click", () => {
    STATE.rootSize = DEFAULT_ROOT_SIZE;
    STATE.sizes = { ...DEFAULT_SIZES };
    STATE.leading = { ...DEFAULT_LEADING };
    renderSizeRows();
    renderLeadingRows();
    renderStats();
    persistLast();
    if (STATE.live) applyLive();
    toast("sizes + leading reset");
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
      rootSize: STATE.rootSize,
      sizes: { ...STATE.sizes },
      leading: { ...STATE.leading },
      layout: { ...STATE.layout },
      wallpaper: { ...STATE.wallpaper },
      sidebarWallpaper: { ...STATE.sidebarWallpaper }
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
    STATE.rootSize = DEFAULT_ROOT_SIZE;
    STATE.sizes = { ...DEFAULT_SIZES };
    STATE.leading = { ...DEFAULT_LEADING };
    STATE.layout = { ...DEFAULT_LAYOUT };
    STATE.wallpaper = { ...DEFAULT_WALLPAPER };
    STATE.sidebarWallpaper = { ...DEFAULT_SIDEBAR_WALLPAPER };
    STATE.font = "";
    STATE.fontPending = "";
    $("nameInput").value = lain.name;
    $("fontInput").value = "";
    $("wallpaperInput").value = "";
    $("sidebarWallpaperInput").value = "";
    renderSizeRows();
    renderLeadingRows();
    renderLayoutRows();
    renderWallpaperControls();
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
  renderLeadingRows();
  renderLayoutRows();
  renderWallpaperControls();
  render();
  if (restored) toast("restored last session");

  console.log("io-claude-creator panel injected. tabs: creator/themes/font/canvas. drag header.");

  // ============================================================
  // SEGMENTED-PILL INJECTION (panel re-opener)
  //
  // Anthropic ships a Chat / Cowork / Code segmented control at .df-pills.
  // We graft a 4th pill ("LAIN") onto it. Click toggles host visibility, so
  // a closed panel can be revived without re-running the IIFE.
  //
  // Two-stage discovery: short polling burst (10 tries, 400ms apart) covers
  // the case where the segmented group hasn't mounted yet at IIFE time. Then
  // a permanent MutationObserver watches for React re-mounts (route change
  // wipes the children), and re-grafts the pill whenever it disappears.
  //
  // After grafting we fire a window 'resize' event so any layout listeners
  // (the indicator's translateX is React-state-driven, but a resize nudge
  // is cheap insurance) recompute against the new child count.
  // ============================================================
  const PILL_MARK = "data-lain-pill";

  // Toggle. Pill click flips visibility. Host element is preserved (state,
  // drag position, scroll, current tab all stick) — only display flips.
  // If something has nuked host from DOM, re-attach first.
  function isPanelVisible() {
    return document.body.contains(host) && host.style.display !== "none";
  }
  function togglePanel() {
    if (!document.body.contains(host)) document.body.appendChild(host);
    host.style.display = (host.style.display === "none") ? "" : "none";
    syncPillState();
  }

  // Sync the LAIN pill's active styling to whether the panel is showing.
  // Mirrors the markup Anthropic uses for the active route pill.
  function syncPillState() {
    const pill = document.querySelector(`[${PILL_MARK}]`);
    if (!pill) return;
    const active = isPanelVisible();
    if (active) {
      pill.setAttribute("data-active", "true");
      pill.setAttribute("aria-current", "page");
      pill.setAttribute("data-state", "open");
      const g = pill.querySelector("span[aria-hidden='true']");
      if (g) g.style.fontWeight = "700";
    } else {
      pill.removeAttribute("data-active");
      pill.removeAttribute("aria-current");
      pill.setAttribute("data-state", "closed");
      const g = pill.querySelector("span[aria-hidden='true']");
      if (g) g.style.fontWeight = "600";
    }
  }

  // Recompute the sliding indicator from the currently-active pill geometry.
  // React owns this transform; adding our pill shifts flex layout so the
  // stale value mis-aligns. We just read the active pill's offsetLeft +
  // offsetWidth and write directly. Cheap, deterministic, no route change.
  function reflowIndicator(pills) {
    if (!pills) return;
    const indicator = pills.querySelector(".df-pill-indicator");
    const active = pills.querySelector(`.df-pill[data-active="true"]:not([${PILL_MARK}])`);
    if (!indicator || !active) return;
    indicator.style.transform = `translateX(${active.offsetLeft}px)`;
    indicator.style.width = active.offsetWidth + "px";
    indicator.style.visibility = "visible";
  }

  function injectPill(pills) {
    if (!pills || pills.querySelector(`[${PILL_MARK}]`)) return false;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "df-pill hide-focus-ring";
    btn.setAttribute("aria-label", "Lain");
    btn.setAttribute("data-state", "closed");
    btn.setAttribute(PILL_MARK, "1");
    btn.title = "Lain theme panel";

    const glyph = document.createElement("span");
    glyph.setAttribute("aria-hidden", "true");
    glyph.style.cssText = "line-height:1;width:1em;height:1em;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;user-select:none;font-size:16px;font-weight:600;";
    glyph.textContent = "◆"; // ◆

    const lbl = document.createElement("span");
    lbl.className = "df-pill-label";
    lbl.textContent = "Lain";

    btn.append(glyph, lbl);
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      togglePanel();
    });

    pills.appendChild(btn);
    syncPillState();
    // Two-frame reflow — first frame for layout to settle after appendChild,
    // second to read post-layout geometry and rewrite indicator transform.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        reflowIndicator(pills);
        try { window.dispatchEvent(new Event("resize")); } catch (e) {}
      });
    });
    return true;
  }

  function findAndInject() {
    const pills = document.querySelector('.df-pills[role="group"]');
    if (!pills) return false;
    const grafted = injectPill(pills);
    // Even if pill already present, keep indicator honest after re-mounts /
    // route swaps — the active pill might have changed.
    reflowIndicator(pills);
    return grafted;
  }

  // Initial polling burst — 10 tries @ 400ms = 4s window.
  let pillTries = 0;
  const pillPoll = setInterval(() => {
    if (findAndInject() || ++pillTries >= 10) clearInterval(pillPoll);
  }, 400);

  // Permanent re-graft on React re-mount. Cheap query selector per mutation.
  const pillObs = new MutationObserver(() => { findAndInject(); });
  pillObs.observe(document.body, { childList: true, subtree: true });
})();
