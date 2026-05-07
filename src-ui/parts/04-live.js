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
