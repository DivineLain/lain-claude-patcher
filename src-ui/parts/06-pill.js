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
