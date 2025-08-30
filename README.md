
# toy-verse2ts

A tiny, educational Verse→TypeScript transpiler you can run locally. **Not** a real Verse compiler—just a playful subset to explore syntax and transpilation.

## Features (subset)
- `let x: int = 42`
- One-line functions: `Add(a:int, b:int): int = a + b`
- `print(expr)` → `console.log(...)`
- Basic arithmetic `+ - * /` and function calls
- Naive string interpolation: `"Hello {name}"` → ``Hello ${name}``

## Quick start
```bash
# 1) Unzip and enter the folder
cd toy-verse2ts

# 2) Optional: install dev deps (first run with --run will also do this automatically)
npm i -D typescript ts-node @types/node

# 3) Transpile (produces examples/example.ts)
node verse2ts.js examples/example.verse

# 4) Transpile + run via ts-node
node verse2ts.js examples/example.verse --run
```

## Example
`examples/example.verse`:
```txt
// toy Verse dialect
let n: int = 5
let who: string = "Molecule"

Square(x:int): int = x * x
Greet(name:string): string = "Hello {name}, n is {n}"

print(Greet(who))
print(Square(n) + 7)
```

Run:
```bash
node verse2ts.js examples/example.verse --run
```

Output:
```
Hello Molecule, n is 5
12
```

## CLI
```
Usage: node verse2ts.js <file.verse> [--run]
```

- `--run`: Executes the generated TypeScript using `ts-node` (installs dev deps on first run if missing).

## Design notes
- Regex-based line parser + a couple of helpers.
- Types are mapped to TS (`int|float -> number`, `string`, `bool -> boolean`, fallback `any`).
- Interpolation turns `"{x}"` into ``${x}`` using template literals.
- Lines that don’t match `let`/function/`print(...)` are emitted as plain TS statements.

## Limitations
- Only one-line function bodies
- No classes/devices/modules/imports
- No real Verse type checking/semantics
- Minimal error handling

## Roadmap (PRs welcome)
- Block functions with bodies
- Conditionals and comparisons
- Arrays/maps + a tiny stdlib
- A proper grammar (nearley/chevrotain/peggy)

## License
MIT
