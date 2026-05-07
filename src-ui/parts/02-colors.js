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
