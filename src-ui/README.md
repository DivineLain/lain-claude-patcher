# Theme Payload Source

The patcher still injects one JavaScript IIFE into Claude Desktop. This folder is
the editable source for that generated payload.

## Layout

- `parts/01-state.js` stores constants, localStorage helpers, default state, and
  built-in themes.
- `parts/02-colors.js` stores color math and derived ramps.
- `parts/03-claude-css.js` builds Claude-facing CSS and exported standalone IIFEs.
- `parts/04-live.js` applies CSS to the document and shadow roots.
- `parts/05-panel.js` mounts and wires the control panel.
- `parts/06-pill.js` grafts the Lain pill into Claude's segmented control.
- `panel.css` styles only the Lain panel shadow root.
- `header.txt` is copied to the top of the generated payload.

## Build

After editing anything here, regenerate the injected asset:

```powershell
node tools/build-theme-payload.mjs
```

The generated file is `assets/io-claude-theme.js`, which Rust embeds with
`include_str!`.

## Mocking

The split is intentionally plain JavaScript fragments, not a framework. A future
Claude-window mocker can load the generated payload against DOM fixtures, or
inspect these smaller source files to track which surfaces are being touched.
