const fs = require('fs');
const path = require('path');

const pyodideDir = path.join(__dirname, '../node_modules/pyodide');
const targetDir = path.join(__dirname, '../public/pyodide');

// Required base files
let filesToCopy = new Set([
  'pyodide.mjs',
  'pyodide.asm.wasm',
  'python_stdlib.zip',
  'pyodide-lock.json'
]);

if (fs.existsSync(path.join(pyodideDir, 'pyodide.asm.mjs'))) {
  filesToCopy.add('pyodide.asm.mjs');
} else if (fs.existsSync(path.join(pyodideDir, 'pyodide.asm.js'))) {
  filesToCopy.add('pyodide.asm.js');
} else {
  console.error('Error: Neither pyodide.asm.mjs nor pyodide.asm.js found in node_modules/pyodide');
  process.exit(1);
}

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
} else {
  // If public/pyodide exists, add any existing files to the copy list
  const existingFiles = fs.readdirSync(targetDir);
  for (const file of existingFiles) {
    if (fs.statSync(path.join(targetDir, file)).isFile()) {
      filesToCopy.add(file);
    }
  }
}

for (const file of filesToCopy) {
  const src = path.join(pyodideDir, file);
  const dest = path.join(targetDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${file} to public/pyodide/`);
  } else {
    console.error(`Error: File ${file} not found in node_modules/pyodide/`);
    process.exit(1);
  }
}
