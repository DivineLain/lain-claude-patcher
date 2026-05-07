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
  const PANEL_CSS = __LAIN_PANEL_CSS__;

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
