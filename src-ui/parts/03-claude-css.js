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
