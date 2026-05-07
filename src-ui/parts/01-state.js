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
