# Code Sandbox Feature Integration
**Date:** October 6, 2026
**Time:** 05:15 AM (+08:00)

## Overview
We successfully integrated a robust, multi-language Code Sandbox into the NETStart application. It supports interactive execution environments for **Python**, **JavaScript (Console)**, and **Web (HTML/CSS/JS)**.

## Key Technical Implementations

### 1. Cross-Origin Isolation & SharedArrayBuffer
- Configured `next.config.ts` to attach `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: credentialless` to the `/code-sandbox` and `/pyodide/(.*)` routes.
- This cross-origin isolation enabled `SharedArrayBuffer`, which was necessary to pause the Python Web Worker (via `Atomics.wait`) and accept interactive terminal `input()` from the student without hanging the main thread.

### 2. Pyodide Postinstall Script
- Since Pyodide assets are too large to track via git and `.wasm` needs to be statically served, we built a native Node.js `copy-pyodide.js` script.
- Configured a `postinstall` hook in `package.json` that reliably provisions `pyodide.mjs`, `pyodide.asm.wasm`, `python_stdlib.zip`, and other requirements into the `public/pyodide` directory during initial setup and deployments.

### 3. Execution Lifecycle & Hang Prevention
- Implemented robust `runId` tracking across Python and JavaScript runners.
- The `runId` system ensures that when a student clicks "Run" rapidly or clicks "Stop" while an execution is blocking (such as an unresolved `input()` prompt), the previous Web Worker is gracefully terminated. This prevents memory leaks and stale terminal inputs overlapping.

### 4. UI/UX Refinements & Protections
- **Stop Button:** Added a dedicated execution "Stop" button that tears down running Web Workers or reloads the Web Mode iframe to a blank state to rescue students from infinite loops.
- **Safe Reset:** Overhauled the editor reset mechanism. It now requires confirmation via a "Restore starter code" modal, heavily reducing the chance of accidental code deletion.
- **Web Mode Dialogs:** Updated the Web Mode `<iframe>` sandbox permissions with `allow-modals` so `alert()`, `confirm()`, and `prompt()` function normally without relying on `allow-same-origin`.

### 5. Production Checks
- Verified that production builds (`npm run build`) and the static file server cleanly deliver Pyodide WebAssembly with the correct `application/wasm` MIME type and necessary isolation headers.
