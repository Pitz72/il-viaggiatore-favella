// ====================================================================
//  Confronta due cartelle di catture del trailer (strumenti/trailer-cattura.cjs): il «prima» e il «dopo».
// --------------------------------------------------------------------
//  Per ogni PNG con lo stesso nome nelle due cartelle calcola il PSNR con ffmpeg: «inf» = identico al
//  bit. Con due catture deterministiche, ciò che cambia fuori dalle zone attese è un difetto (pre-produzione/07, §6.2).
//
//  Uso:  node strumenti/trailer-confronta.mjs <prima> <dopo> [--tavola <cartella>] [--solo 16_5,64_5]
//    --tavola <cartella>   scrive per ogni coppia una tavola affiancata «prima | dopo | differenza ×8»
//                          (<istante>.png): da guardare con gli occhi
//    --solo a,b            solo gli istanti con questo pezzo nel nome del file
//  Esce con 0; stampa una tabella «file  PSNR  pixel diversi (stima dal PSNR)».
//  Richiede ffmpeg nel PATH.
// ====================================================================
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const pos = args.filter((a, i) => !a.startsWith("--") && !(args[i - 1] ?? "").startsWith("--"));
const opz = (nome) => { const i = args.indexOf(nome); return i >= 0 ? args[i + 1] : null; };
const [prima, dopo] = pos;
if (!prima || !dopo) { console.error("Uso: node strumenti/trailer-confronta.mjs <prima> <dopo> [--tavola <cartella>] [--solo 16_5,64_5]"); process.exit(2); }
const tavola = opz("--tavola") ? path.resolve(opz("--tavola")) : null;
const solo = opz("--solo")?.split(",") ?? null;
if (tavola) fs.mkdirSync(tavola, { recursive: true });

const ff = (...a) => spawnSync("ffmpeg", ["-hide_banner", "-nostats", ...a], { encoding: "utf8" });
const file = fs.readdirSync(prima).filter((f) => f.endsWith(".png") && fs.existsSync(path.join(dopo, f)) && (!solo || solo.some((s) => f.includes(s)))).sort();
const mancano = fs.readdirSync(prima).filter((f) => f.endsWith(".png") && !fs.existsSync(path.join(dopo, f)));
if (mancano.length) console.log(`(nel «dopo» mancano ${mancano.length} file: ${mancano.slice(0, 5).join(", ")}…)`);

console.log("file".padEnd(30), "PSNR (dB)".padStart(10), "  esito");
let uguali = 0;
for (const f of file) {
  const r = ff("-i", path.join(prima, f), "-i", path.join(dopo, f), "-lavfi", "psnr", "-f", "null", "-");
  const m = /average:(inf|[\d.]+)/.exec(r.stderr);
  const psnr = m ? m[1] : "?";
  const uguale = psnr === "inf";
  if (uguale) uguali++;
  console.log(f.padEnd(30), String(psnr).padStart(10), "  ", uguale ? "identico" : "diverso");
  if (tavola && !uguale) {
    ff("-y", "-i", path.join(prima, f), "-i", path.join(dopo, f), "-filter_complex",
      "[0:v][1:v]blend=all_mode=difference,eq=brightness=0:contrast=8[d];[0:v][1:v][d]hstack=inputs=3,scale=iw/2:-1",
      "-frames:v", "1", path.join(tavola, f));
  }
}
console.log(`\n${uguali} identici su ${file.length}; ${file.length - uguali} diversi.`);
