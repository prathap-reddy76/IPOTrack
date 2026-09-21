// scripts/clean-turbopack-cache.mjs
// Post-build cleanup: removes Turbopack persistent cache files that
// contain process.env snapshots (including secrets). This prevents
// Netlify Secrets Scanning from detecting server-side environment
// variable values inside .next/cache/turbopack/*.sst files.

import { existsSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const dirs = [
  join(root, '.next', 'cache', 'turbopack'),
  join(root, '.netlify', '.next', 'cache', 'turbopack'),
];

for (const dir of dirs) {
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
    console.log(`✓ Cleaned turbopack cache: ${dir}`);
  }
}
