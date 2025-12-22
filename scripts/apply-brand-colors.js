// Simple codemod to replace `blue-*` classes with `brand-*` across source files.
const fs = require("fs");
const path = require("path");

const exts = new Set([".js", ".jsx", ".ts", ".tsx", ".mdx", ".css"]);
const roots = ["app", "components", "pages", "context", "hooks", "utils"];

const BLUE_CLASS = /\bblue-(50|100|200|300|400|500|600|700|800|900)\b/g;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (exts.has(path.extname(entry.name))) replaceFile(full);
  }
}

function replaceFile(filePath) {
  const before = fs.readFileSync(filePath, "utf8");
  const after = before.replace(BLUE_CLASS, (_, shade) => `brand-${shade}`);
  if (after !== before) {
    fs.writeFileSync(filePath, after, "utf8");
    console.log("Updated:", filePath);
  }
}

function main() {
  const root = path.resolve(__dirname, "..");
  for (const r of roots) {
    const p = path.join(root, r);
    if (fs.existsSync(p)) walk(p);
  }
  console.log("Brand color codemod complete.");
}

main();