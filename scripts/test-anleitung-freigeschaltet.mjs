/**
 * Prüft den freigeschalteten Zustand der KI-Anleitung (PROJ-14).
 *
 * Die fertige Anleitung liegt im Code, wird aber nicht ausgeliefert. Damit sie
 * während der Ankündigungsphase nicht unbemerkt verrottet, legt dieses Skript
 * den Schalter um, baut, testet und stellt den Ursprungszustand wieder her —
 * auch wenn die Tests fehlschlagen oder das Skript abgebrochen wird.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const NAV = 'src/lib/app-nav.ts';
const AUS = 'export const ANLEITUNG_VERFUEGBAR = false;';
const AN = 'export const ANLEITUNG_VERFUEGBAR = true;';
const PORT = 3131;

const original = readFileSync(NAV, 'utf8');
if (!original.includes(AUS)) {
  console.error(`Schalter steht nicht auf "false" — Abbruch, um nichts zu überschreiben.`);
  process.exit(1);
}

let server;
const restore = () => {
  writeFileSync(NAV, original);
  if (server && !server.killed) server.kill();
};
process.on('SIGINT', () => { restore(); process.exit(130); });
process.on('SIGTERM', () => { restore(); process.exit(143); });

let code = 1;
try {
  console.log('→ Schalter auf true, Build …');
  writeFileSync(NAV, original.replace(AUS, AN));
  const build = spawnSync('npm', ['run', 'build'], { stdio: 'inherit' });
  if (build.status !== 0) throw new Error('Build fehlgeschlagen');

  console.log(`→ Server auf :${PORT} …`);
  const { spawn } = await import('node:child_process');
  server = spawn('npx', ['next', 'start', '-p', String(PORT)], { stdio: 'ignore', detached: false });

  // auf Bereitschaft warten statt blind zu schlafen
  const deadline = Date.now() + 30_000;
  for (;;) {
    try {
      const r = await fetch(`http://localhost:${PORT}/anleitung`);
      if (r.ok) break;
    } catch { /* noch nicht da */ }
    if (Date.now() > deadline) throw new Error('Server kam nicht hoch');
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log('→ Tests …');
  const res = spawnSync(
    'npx',
    ['playwright', 'test', 'tests/proj-14-anleitung-freigeschaltet.spec.ts',
     '--config=playwright.prod.config.ts'],
    { stdio: 'inherit', env: { ...process.env, ANLEITUNG_FREIGESCHALTET: '1', BASE_URL: `http://localhost:${PORT}` } }
  );
  code = res.status ?? 1;
} catch (err) {
  console.error(String(err.message ?? err));
} finally {
  restore();
  console.log('→ Schalter zurückgesetzt.');
}
process.exit(code);
