
import { execSync } from "child_process";
import fs from "fs";

function run(cmd) {
  return execSync(cmd, { stdio: "pipe" }).toString();
}

console.log("Transpiling example...");
run("node verse2ts.js examples/example.verse");

const ts = fs.readFileSync("examples/example.ts", "utf8");
if (!ts.includes("function Square") || !ts.includes("console.log")) {
  console.error("Generated TS seems incomplete.");
  process.exit(1);
}

console.log("Running example via ts-node...");
const out = run("npx --yes tsx examples/example.ts");
if (!out.includes("Hello Molecule, n is 5") || !out.includes("32")) {
  console.error("Unexpected program output:\n" + out);
  process.exit(1);
}

console.log("OK");
