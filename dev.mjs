import { build } from 'esbuild';
import path from 'path';
import { spawn } from 'child_process';
import { createServer } from 'vite';
import { cpSync } from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VITE_PORT = 5173;

async function buildMain() {
  await build({
    entryPoints: ['src/main/index.ts'],
    outfile: 'dist/main/index.js',
    bundle: true,
    platform: 'node',
    target: 'node22',
    external: ['electron'],
    format: 'esm',
    sourcemap: true,
  });
  console.log('[dev] main compiled');
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
    sourcemap: true,
  });
  console.log('[dev] preload compiled');
}


async function startVite() {
  const server = await createServer({
    configFile: 'vite.config.ts',
    root: 'src/renderer',
  });
  await server.listen();
  server.printUrls();
  return server;
}

function startElectron() {
  const electronPath = path.join(__dirname, 'node_modules', '.bin', 'electron');
  const electron = spawn(electronPath, ['.'], {
    env: {
      ...process.env,
      VITE_DEV_SERVER_URL: `http://localhost:${VITE_PORT}`,
    },
    stdio: 'inherit',
  });

  electron.on('close', () => {
    process.exit(0);
  });
}

async function main() {
  await Promise.all([buildMain(), buildPreload()]);
  cpSync('src/settings', 'dist/settings', { recursive: true });
  console.log('[dev] settings copied');
  await startVite();
  startElectron();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
