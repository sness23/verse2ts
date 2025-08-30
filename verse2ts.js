
#!/usr/bin/env node
// Minimal Verse→TS transpiler + optional runner for a tiny subset.
// See README for the supported features.

import fs from "fs";
import { execSync } from "child_process";

if (process.argv.length < 3) {
  console.error("Usage: node verse2ts.js <file.verse> [--run]");
  process.exit(1);
}

const srcPath = process.argv[2];
const shouldRun = process.argv.includes("--run");
const src = fs.readFileSync(srcPath, "utf8");

function tsType(t) {
  const m = (t || "").trim().toLowerCase();
  if (m === "int" || m === "float" || m === "number") return "number";
  if (m === "string") return "string";
  if (m === "bool" || m === "boolean") return "boolean";
  return "any";
}

// crude interpolation: "hi {x} and {y}" -> `hi ${x} and ${y}`
function interpolateStrings(s) {
  return s.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, (m, inside) => {
    if (!inside.includes("{")) return m; // leave normal strings alone
    const templ = inside.replace(/\{([A-Za-z_]\w*)\}/g, "${$1}");
    // escape backticks if present
    return "`" + templ.replace(/`/g, "\\`") + "`";
  });
}

const lines = src.split(/\r?\n/);
let out = `// Auto-generated from ${srcPath}
`;

for (let raw of lines) {
  let line = raw.trim();
  if (!line || line.startsWith("//")) continue;

  // let x: int = expr
  let m = line.match(/^let\s+([A-Za-z_]\w*)\s*:\s*([A-Za-z_]\w*)\s*=\s*(.+)$/);
  if (m) {
    const [, name, typ, exprRaw] = m;
    const expr = interpolateStrings(exprRaw.trim());
    out += `let ${name}: ${tsType(typ)} = ${expr};\n`;
    continue;
  }

  // one-line function:  Name(a:int, b:string): int = expression
  m = line.match(/^([A-Za-z_]\w*)\s*\(([^)]*)\)\s*:\s*([A-Za-z_]\w*)\s*=\s*(.+)$/);
  if (m) {
    const [, fname, paramsRaw, retT, exprRaw] = m;
    const params = paramsRaw.trim()
      ? paramsRaw
          .split(",")
          .map((p) => {
            const pm = p.trim().match(/^([A-Za-z_]\w*)\s*:\s*([A-Za-z_]\w*)$/);
            if (!pm) throw new Error(`Bad param: '${p}'`);
            return `${pm[1]}: ${tsType(pm[2])}`;
          })
          .join(", ")
      : "";
    const expr = interpolateStrings(exprRaw.trim());
    out += `function ${fname}(${params}): ${tsType(retT)} { return ${expr}; }\n`;
    continue;
  }

  // print(expr)
  m = line.match(/^print\s*\((.+)\)\s*$/);
  if (m) {
    const expr = interpolateStrings(m[1].trim());
    out += `console.log(${expr});\n`;
    continue;
  }

  // bare expression/call → emit as a statement
  out += interpolateStrings(line) + `;\n`;
}

// write TS and (optionally) run it
const outTs = srcPath.replace(/\.verse$/i, "") + ".ts";
fs.writeFileSync(outTs, out, "utf8");
console.log(`Wrote ${outTs}`);

if (shouldRun) {
  // Ensure ts-node is available
  let hasTsNode = true;
  try {
    execSync("npx --yes ts-node -v", { stdio: "ignore" });
  } catch {
    hasTsNode = false;
  }
  if (!hasTsNode) {
    console.error("Installing dev deps: typescript and ts-node...");
    execSync("npm init -y", { stdio: "inherit" });
    execSync("npm i -D typescript ts-node @types/node", { stdio: "inherit" });
  }
  console.log("Running with ts-node...");
  execSync(`npx ts-node "${outTs}"`, { stdio: "inherit" });
}
