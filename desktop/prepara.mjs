// ====================================================================
//  Prepara il pacchetto desktop: costruisce l'app web (app/), la copia in
//  desktop/web e mette le icone in desktop/build. Uso: node prepara.mjs
//  (con --senza-build salta la build dell'app, se è già fatta).
// ====================================================================
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const qui = fs.realpathSync.native(path.dirname(fileURLToPath(import.meta.url)));
const radice = path.resolve(qui, "..");
const app = path.join(radice, "app");

if (!process.argv.includes("--senza-build")) {
  execSync("npm run build", { cwd: app, stdio: "inherit" });
}
const dist = path.join(app, "dist");
if (!fs.existsSync(path.join(dist, "index.html"))) throw new Error("Manca app/dist: costruisci prima l'app.");

const web = path.join(qui, "web");
fs.rmSync(web, { recursive: true, force: true });
fs.cpSync(dist, web, { recursive: true });

const build = path.join(qui, "build");
fs.mkdirSync(build, { recursive: true });
fs.copyFileSync(path.join(radice, "grafica", "png", "icona-512.png"), path.join(build, "icon.png"));
fs.copyFileSync(path.join(radice, "grafica", "icona.ico"), path.join(build, "icon.ico"));

const peso = (d) => fs.readdirSync(d, { recursive: true, withFileTypes: true })
  .filter((e) => e.isFile()).reduce((s, e) => s + fs.statSync(path.join(e.parentPath ?? e.path, e.name)).size, 0);
console.log(`[prepara] app web in desktop/web (${(peso(web) / 1048576).toFixed(1)} MB), icone in desktop/build`);
