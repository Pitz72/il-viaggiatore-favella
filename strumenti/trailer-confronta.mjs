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

// quanto e dove cambia: i pixel che differiscono per più di SOGLIA (su 255) in almeno un canale, la loro
// quota sull'immagine e il rettangolo che li contiene. Il PSNR da solo inganna: un testo cambiato di poco
// basta ad abbassarlo a 30 dB, mentre una sfumatura diffusa lo lascia alto.
const SOGLIA = 8;
function dove(fa, fb) {
  // la differenza come pixel grezzi (rgb24): si conta in Node i pixel con un canale sopra la soglia
  const r = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-i", fa, "-i", fb, "-lavfi", "[0:v][1:v]blend=all_mode=difference,format=rgb24", "-f", "rawvideo", "-"],
    { maxBuffer: 1 << 28 });
  const d = r.stdout;
  if (!d || !d.length) return { quota: null, bbox: "—" };
  const larghezza = Number(/(\d+)x(\d+)/.exec(spawnSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=s=x:p=0", fa], { encoding: "utf8" }).stdout)?.[1] ?? 1920);
  let n = 0, x1 = 1e9, y1 = 1e9, x2 = -1, y2 = -1;
  for (let p = 0, i = 0; p < d.length; p += 3, i++) {
    if (d[p] > SOGLIA || d[p + 1] > SOGLIA || d[p + 2] > SOGLIA) {
      n++; const x = i % larghezza, y = (i / larghezza) | 0;
      if (x < x1) x1 = x; if (x > x2) x2 = x; if (y < y1) y1 = y; if (y > y2) y2 = y;
    }
  }
  return { quota: (n / (d.length / 3)) * 100, bbox: n ? `${x1},${y1}–${x2},${y2}` : "—" };
}

console.log("file".padEnd(22), "PSNR (dB)".padStart(10), "  pixel >" + SOGLIA, "  dove (x,y–x,y)");
let uguali = 0;
for (const f of file) {
  const r = ff("-i", path.join(prima, f), "-i", path.join(dopo, f), "-lavfi", "psnr", "-f", "null", "-");
  const m = /average:(inf|[\d.]+)/.exec(r.stderr);
  const psnr = m ? m[1] : "?";
  const uguale = psnr === "inf";
  if (uguale) uguali++;
  const d = uguale ? null : dove(path.join(prima, f), path.join(dopo, f));
  console.log(f.padEnd(22), String(psnr === "inf" ? "inf" : Number(psnr).toFixed(1)).padStart(10), "  ",
    uguale ? "identico".padEnd(10) : (d.quota === null ? "?" : d.quota.toFixed(2) + " %").padEnd(10), uguale ? "" : d.bbox);
  if (tavola && !uguale) {
    // prima | dopo | differenza ×8 (solo la luminosità, in grigio)
    ff("-y", "-i", path.join(prima, f), "-i", path.join(dopo, f), "-filter_complex",
      "[0:v][1:v]blend=all_mode=difference,format=gray,lut=y='clip(val*8,0,255)',format=rgb24[d];[0:v]format=rgb24[a];[1:v]format=rgb24[b];[a][b][d]hstack=inputs=3,scale=iw/2:-1",
      "-frames:v", "1", path.join(tavola, f));
  }
}
console.log(`
${uguali} identici su ${file.length}; ${file.length - uguali} diversi.`);
