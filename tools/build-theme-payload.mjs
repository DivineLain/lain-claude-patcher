import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(root, "src-ui");
const partsDir = path.join(srcDir, "parts");
const outFile = path.join(root, "assets", "io-claude-theme.js");

const partFiles = [
  "01-state.js",
  "02-colors.js",
  "03-claude-css.js",
  "04-live.js",
  "05-panel.js",
  "06-pill.js",
];

function read(file) {
  return fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
}

const header = read(path.join(srcDir, "header.txt")).trimEnd();
const panelCss = read(path.join(srcDir, "panel.css")).trimEnd();
const panelCssLiteral = `\`\n${panelCss.replace(/`/g, "\\`").replace(/\$\{/g, "\\${")}\n\``;
const parts = partFiles.map((file) => {
  const text = read(path.join(partsDir, file));
  if (file === "05-panel.js") {
    return text.replace("__LAIN_PANEL_CSS__", panelCssLiteral);
  }
  return text;
});
const body = parts.join("\n").trimEnd();

const payload = `${header}

// GENERATED FILE. Edit src-ui/* and run:
//   node tools/build-theme-payload.mjs

(() => {
  "use strict";

${body}
})();
`;

fs.writeFileSync(outFile, payload, "utf8");
console.log(`wrote ${path.relative(root, outFile)} (${Buffer.byteLength(payload, "utf8")} bytes)`);
