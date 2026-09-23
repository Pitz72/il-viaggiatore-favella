import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

// ====================================================================
//  «Il Viaggiatore» — progetto autonomo.
// --------------------------------------------------------------------
//  Trailer + gioco a tutto schermo, col motore FAVELLA dentro il progetto
//  (../motore, copiato in public/favella-engine da scripts/sincronizza.mjs
//  prima di ogni dev/build). Nessuna dipendenza dal sito favella.eu.
//
//  base './'  → percorsi relativi: la cartella dist/ funziona da qualunque
//  indirizzo (radice di un dominio, sottocartella, server locale).
// ====================================================================
// Radice sul percorso CANONICO: la cartella del progetto contiene spazi e può
// essere aperta col nome breve di Windows (ILVIAG~1); senza realpath Vite
// confronta le due forme e rifiuta di servire i file (403 «outside allow list»).
const radice = fs.realpathSync.native(fileURLToPath(new URL('.', import.meta.url)))

// Identità della build (vedi sviluppo/VERSIONI.md): la versione del gioco da
// ../versione.json, quella del motore da ../motore/strutture.py, il commit e la
// data. Entrano nell'app come costante __VERSIONE__.
const progetto = path.resolve(radice, '..')
const versioni = JSON.parse(fs.readFileSync(path.join(progetto, 'versione.json'), 'utf8'))
const motore = /VERSIONE_MOTORE\s*=\s*"([^"]+)"/.exec(
  fs.readFileSync(path.join(progetto, 'motore', 'strutture.py'), 'utf8'))?.[1] ?? '?'
const commit = (() => {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 7)
  try { return execSync('git rev-parse --short HEAD', { cwd: progetto, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() }
  catch { return 'locale' }
})()
const VERSIONE = {
  gioco: versioni.gioco as string,
  motore,
  formatoSalvataggi: versioni.formatoSalvataggi as number,
  commit,
  data: new Date().toISOString().slice(0, 10),
}

export default defineConfig({
  root: radice,
  define: { __VERSIONE__: JSON.stringify(VERSIONE) },
  base: './',
  plugins: [react()],
  server: { port: 5200 },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
