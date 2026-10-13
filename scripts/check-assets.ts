import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dist = join(import.meta.dirname, '..', 'dist');
const limits = { '.js': 180_000, '.css': 120_000, '.html': 400_000 };
const warnings: string[] = [];

function walk(dir: string) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const info = statSync(path);
    if (info.isDirectory()) {
      walk(path);
      continue;
    }
    const extension = entry.slice(entry.lastIndexOf('.'));
    const limit = limits[extension as keyof typeof limits];
    if (limit && info.size > limit) {
      warnings.push(`${path.replace(dist, '')} is ${info.size} bytes, over the ${limit} byte review limit`);
    }
  }
}

walk(dist);
if (warnings.length > 0) {
  console.log(warnings.join('\n'));
  process.exit(1);
}
console.log('Built asset sizes are within the review limits.');
