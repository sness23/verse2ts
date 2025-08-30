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

// Check if input file exists and is readable
if (!fs.existsSync(srcPath)) {
  console.error(`Error: File '${srcPath}' not found`);
  process.exit(1);
}

const src = fs.readFileSync(srcPath, "utf8");

// Validate input size to prevent memory issues
if (src.length > 1000000) { // 1MB limit
  console.error("Error: Input file too large (>1MB)");
  process.exit(1);
}

function tsType(t) {
  const m = (t || "").trim().toLowerCase();
  if (m === "int" || m === "float" || m === "number") return "number";
  if (m === "string") return "string";
  if (m === "bool" || m === "boolean") return "boolean";
  return "any";
}

// Safe interpolation: "hi {x} and {y}" -> `hi ${x} and ${y}`
function interpolateStrings(s) {
  // Safer regex that avoids catastrophic backtracking
  return s.replace(/"([^"]*)"/g, (match, inside) => {
    if (!inside.includes("{")) return match; // leave normal strings alone
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
try {
  fs.writeFileSync(outTs, out, "utf8");
  console.log(`Wrote ${outTs}`);
} catch (error) {
  console.error(`Error writing output file: ${error.message}`);
  process.exit(1);
}

if (shouldRun) {
  try {
    // Ensure tsx is available
    let hasTsx = true;
    try {
      execSync("npx --yes tsx --version", { stdio: "ignore", timeout: 10000 });
    } catch {
      hasTsx = false;
    }
    if (!hasTsx) {
      console.log("Installing dev deps: typescript and tsx...");
      execSync("npm init -y", { stdio: "inherit", timeout: 30000 });
      execSync("npm i -D typescript tsx @types/node", { stdio: "inherit", timeout: 60000 });
    }
    console.log("Running with tsx...");
    execSync(`npx tsx "${outTs}"`, { stdio: "inherit", timeout: 30000 });
  } catch (error) {
    console.error(`Error running TypeScript: ${error.message}`);
    process.exit(1);
  }
}