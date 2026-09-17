#!/usr/bin/env node
// Sync backend OpenAPI spec and regenerate TypeScript types.
//
// Usage:
//   npm run generate:api [-- --url http://localhost:8000/openapi.json]
//   npm run generate:api -- --file ../node_nexus_api/build/openapi.json
//   npm run sync:check   # CI: fail if committed v2.d.ts drifts from snapshot
//
// openapi-typescript is intentionally NOT a devDependency: its TS ^5 peer
// conflicts with the repo's TS 7, and its output is plain .d.ts (typechecked
// afterwards). The generator version is pinned below for reproducibility.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const GENERATOR_VERSION = '7.13.0';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SNAPSHOT = join(ROOT, 'src/api/__generated/openapi.json');
const TYPES = join(ROOT, 'src/api/__generated/v2.d.ts');
const DEFAULT_URL = 'http://localhost:8000/openapi.json';

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? undefined : process.argv[i + 1];
}

function loadSpec() {
  const file = arg('file') ?? process.env.OPENAPI_FILE;
  if (file) return readFileSync(resolve(file), 'utf8');
  const url = arg('url') ?? process.env.OPENAPI_URL ?? DEFAULT_URL;
  const out = execFileSync(
    'python3',
    ['-c', `import sys,urllib.request; sys.stdout.write(urllib.request.urlopen(${JSON.stringify(url)}, timeout=30).read().decode())`],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
  );
  return out;
}

function generate(specPath, outPath) {
  execFileSync(
    'npx',
    ['-y', `openapi-typescript@${GENERATOR_VERSION}`, specPath, '-o', outPath],
    { cwd: ROOT, stdio: 'inherit' },
  );
}

function specVersion(specText) {
  try {
    return JSON.parse(specText).info?.version ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

if (process.argv.includes('--check')) {
  if (!existsSync(SNAPSHOT)) {
    console.error(`sync:check: snapshot missing: ${SNAPSHOT}`);
    process.exit(1);
  }
  const tmp = mkdtempSync(join(tmpdir(), 'openapi-check-'));
  const tmpOut = join(tmp, 'v2.d.ts');
  generate(SNAPSHOT, tmpOut);
  const a = readFileSync(TYPES, 'utf8');
  const b = readFileSync(tmpOut, 'utf8');
  if (a !== b) {
    console.error('sync:check: src/api/__generated/v2.d.ts drifts from openapi.json snapshot.');
    console.error('Run: npm run generate:api');
    process.exit(1);
  }
  console.log(`sync:check: OK (spec ${specVersion(readFileSync(SNAPSHOT, 'utf8'))})`);
} else {
  const spec = loadSpec();
  console.log(`Fetched OpenAPI spec version ${specVersion(spec)}`);
  writeFileSync(SNAPSHOT, spec.endsWith('\n') ? spec : spec + '\n');
  generate(SNAPSHOT, TYPES);
  console.log(`Wrote ${SNAPSHOT} and ${TYPES}`);
}
