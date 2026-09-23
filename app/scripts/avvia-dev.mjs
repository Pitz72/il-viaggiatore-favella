// ====================================================================
//  Avvio del server di sviluppo dal percorso CANONICO della cartella.
// --------------------------------------------------------------------
//  La cartella del progetto ha uno spazio nel nome («Il Viaggiatore»). Alcuni
//  lanciatori (l'anteprima dell'editor) la passano col nome breve di Windows
//  (ILVIAG~1): Vite allora mescola le due forme del percorso e non serve i
//  file. Qui si torna al percorso vero, si sincronizza motore e avventura,
//  e si avvia Vite. Uso: node scripts/avvia-dev.mjs [porta]
// ====================================================================
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const app = fs.realpathSync.native(path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."));
process.chdir(app);

await import(pathToFileURL(path.join(app, "scripts", "sincronizza.mjs")).href);
const { createServer } = await import(pathToFileURL(path.join(app, "node_modules", "vite", "dist", "node", "index.js")).href);

const porta = Number(process.argv[2] ?? 5200);
const server = await createServer({ root: app, server: { port: porta, strictPort: true } });
await server.listen();
server.printUrls();
