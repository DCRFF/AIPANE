import { build } from 'esbuild';
import { build as viteBuild } from 'vite';
import { cpSync } from 'fs';
async function buildMain() {
  await build({
    entryPoints: ['src/main/index.ts'],
    outfile: 'dist/main/index.js',
    bundle: true,
    platform: 'node',
    target: 'node22',
    external: ['electron'],
    format: 'esm',
    minify: true,
  });
  console.log('[build] main done');
}

async function buildPreload() {
  await build({
    entryPoints: ['src/preload/index.ts'],
    outfile: 'dist/preload/index.js',
    bundle: true,
    platform: 'node',
    target: 'node22',
    external: ['electron'],
    format: 'cjs',
    minify: true,
  });
  console.log('[build] preload done');
}

async function buildRenderer() {
  await viteBuild({
    configFile: 'vite.config.ts',
    root: 'src/renderer',
  });
  console.log('[build] renderer done');
}

async function main() {
  await Promise.all([buildMain(), buildPreload()]);
  cpSync('src/settings', 'dist/settings', { recursive: true });
  console.log('[build] settings copied');
  await buildRenderer();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
