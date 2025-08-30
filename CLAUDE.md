# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is `toy-verse2ts`, an educational Verse→TypeScript transpiler. It transpiles a minimal subset of Verse language syntax to TypeScript using regex-based parsing.

## Key Commands

- **Transpile Verse to TypeScript**: `node verse2ts.js examples/example.verse`
- **Transpile and run**: `node verse2ts.js examples/example.verse --run` 
- **Run tests**: `npm test` (uses `tests/run-tests.js`)
- **Type check**: `npm run build` (runs TypeScript compiler with `--noEmit`)

## Architecture

### Core Components

- **`verse2ts.js`**: Main transpiler script that converts Verse syntax to TypeScript
  - Parses three main constructs: variable declarations (`let x: int = 42`), one-line functions (`Add(a:int): int = a + b`), and print statements (`print(expr)`)
  - Handles string interpolation: `"Hello {name}"` → `` `Hello ${name}` ``
  - Maps Verse types to TypeScript: `int|float` → `number`, `string` → `string`, `bool` → `boolean`
  - Uses regex-based line-by-line parsing approach

### Transpilation Flow

1. Read `.verse` file
2. Parse each line for supported constructs (variables, functions, print statements)
3. Transform to equivalent TypeScript syntax
4. Write output as `.ts` file
5. Optionally execute with `ts-node`

### Supported Verse Syntax

- Variable declarations: `let name: type = value`
- One-line functions: `FuncName(param:type): returnType = expression`
- Print statements: `print(expression)`
- String interpolation with `{variable}` syntax
- Basic arithmetic and function calls

### Test Structure

- `tests/run-tests.js`: Integration test that transpiles example and verifies output
- Tests both transpilation correctness and runtime execution
- Validates generated TypeScript contains expected functions and produces correct output

## File Structure

- `verse2ts.js`: Main transpiler implementation
- `examples/example.verse`: Sample Verse code for testing
- `tests/run-tests.js`: Test runner
- `tsconfig.json`: TypeScript configuration for ES2020 modules