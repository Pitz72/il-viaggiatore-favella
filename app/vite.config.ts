import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
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

export default defineConfig({
  root: radice,
  base: './',
  plugins: [react()],
  server: { port: 5200 },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
