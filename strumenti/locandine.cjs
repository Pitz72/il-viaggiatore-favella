// ====================================================================
//  Le immagini promozionali: dipinge ogni formato senza server esterni.
// --------------------------------------------------------------------
//  Compila al volo in memoria `app/src/locandine/main.ts` con esbuild e
//  serve pagina, caratteri (`app/public/fonts/`) e tavole pittoriche
//  (`grafica/branding/tavole/`) su un protocollo interno `locandina://`
//  in una finestra Electron fuori schermo. Il PNG torna qui e ffmpeg lo
//  scrive in JPEG di qualità alta senza sottocampionare il colore (4:4:4).
//
//  Uso (dalla cartella del progetto, nessun server richiesto):
//    desktop\node_modules\.bin\electron strumenti\locandine.cjs [opzioni]
//  Opzioni
//    --formati 16x9,1x1    solo questi (default: tutti)
//    --uscita <cartella>   default grafica/branding
//    --png                 tiene anche il PNG accanto al JPEG
//  Dal 21:9 escono anche `grafica/banner.jpg` (2520×1080) e `grafica/itch/banner-960x411.jpg`;
//  dal 4:3 esce anche `grafica/itch/copertina-630x500.jpg`.
// ====================================================================
const { app, BrowserWindow, protocol } = require("electron");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createRequire } = require("node:module");
const { execFileSync } = require("node:child_process");

const RADICE = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const opz = (nome, ripiego) => { const i = args.indexOf(nome); return i >= 0 ? args[i + 1] : ripiego; };
const USCITA = path.resolve(opz("--uscita", path.join(RADICE, "grafica", "branding")));
const TAVOLE = path.join(RADICE, "grafica", "branding", "tavole");
const FONTS = path.join(RADICE, "app", "public", "fonts");
const RUNTIME = fs.readFileSync(path.join(RADICE, "grafica", "branding", "marchi", "RuntimeMultimedia_Bianco.svg"), "utf8");
const pausa = (ms) => new Promise((r) => setTimeout(r, ms));

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".woff2": "font/woff2",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

protocol.registerSchemesAsPrivileged([
  { scheme: "locandina", privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true } },
]);

// tele grandi (fino a 5040×2160 e 2700×4000) una dopo l'altra: il disegno su CPU evita cadute del processo grafico
app.disableHardwareAcceleration();
app.on("window-all-closed", () => {});

function creaTrasformatoreTs() {
  const reqApp = createRequire(path.join(RADICE, "app", "package.json"));
  const ts = reqApp("typescript");
  const cache = new Map();
  return (fileTs) => {
    if (cache.has(fileTs)) return cache.get(fileTs);
    let sorgente = fs.readFileSync(fileTs, "utf8");
    const out = ts.transpileModule(sorgente, {
      fileName: fileTs,
      compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    cache.set(fileTs, out);
    return out;
  };
}

app.whenReady().then(principale).catch((e) => { console.error("ERRORE:", e?.message ?? e); app.exit(1); });

async function principale() {
  const transpila = creaTrasformatoreTs();
  const srcRoot = path.join(RADICE, "app", "src");
  const paginaHtml = `<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8" />
    <link rel="stylesheet" href="./fonts/fonts.css" /></head>
    <body style="margin:0;background:#111"><script type="module" src="./src/locandine/main.ts"></script></body></html>`;

  protocol.handle("locandina", (req) => {
    const u = new URL(req.url);
    const p = decodeURIComponent(u.pathname);
    if (p === "/locandine.html" || p === "/") {
      return new Response(paginaHtml, { headers: { "Content-Type": MIME[".html"] } });
    }
    if (p.startsWith("/src/")) {
      const rel = p.slice("/src/".length);
      const candidato = path.resolve(srcRoot, rel);
      const fileTs = fs.existsSync(candidato) && fs.statSync(candidato).isFile()
        ? candidato
        : fs.existsSync(`${candidato}.ts`) ? `${candidato}.ts` : null;
      if (fileTs && fileTs.startsWith(srcRoot)) {
        return new Response(transpila(fileTs), { headers: { "Content-Type": MIME[".js"] } });
      }
    }
    let disco = null;
    if (p.startsWith("/fonts/")) disco = path.join(FONTS, path.basename(p));
    else if (p.startsWith("/tavole/")) disco = path.join(TAVOLE, path.basename(p));
    if (disco && fs.existsSync(disco)) {
      const est = path.extname(disco).toLowerCase();
      return new Response(fs.readFileSync(disco), { headers: { "Content-Type": MIME[est] ?? "application/octet-stream" } });
    }
    return new Response("Non trovato", { status: 404 });
  });

  fs.mkdirSync(USCITA, { recursive: true });
  const w = new BrowserWindow({ show: false, width: 800, height: 600, webPreferences: { offscreen: true, backgroundThrottling: false } });
  w.webContents.setAudioMuted(true);
  w.webContents.on("console-message", (e) => { const m = e.message ?? ""; if (m.includes("[locandine]") || e.level === "error") console.log(m); });
  await w.loadURL("locandina://app/locandine.html");
  const tutti = await w.webContents.executeJavaScript("window.__locandina.formati");
  const scelti = opz("--formati", "") ? opz("--formati").split(",") : tutti;
  for (const id of scelti) {
    try { await uno(w, id); } catch (e) { console.log(`${id}: ${e?.message ?? e}; riprovo`); await pausa(800); await uno(w, id); }
  }
  app.quit();
}

async function uno(w, id) {
  await w.loadURL(`locandina://app/locandine.html?formato=${id}`);
  for (let i = 0; i < 100 && !(await w.webContents.executeJavaScript("!!window.__locandina")); i++) await pausa(50);
  const f = await w.webContents.executeJavaScript("window.__locandina.formato");
  const dati = await w.webContents.executeJavaScript(`window.__locandina.rendi({ runtime: ${JSON.stringify(RUNTIME)} })`);
  const png = path.join(args.includes("--png") ? USCITA : os.tmpdir(), `${f.file}.png`);
  fs.writeFileSync(png, Buffer.from(dati.slice(dati.indexOf(",") + 1), "base64"));
  const jpg = path.join(USCITA, `${f.file}.jpg`);
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", png, "-q:v", "2", "-pix_fmt", "yuvj444p", jpg]);

  if (f.id === "21x9") {
    const banner = path.join(RADICE, "grafica", "banner.jpg");
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", png, "-vf", "scale=2520:1080:flags=lanczos", "-q:v", "2", "-pix_fmt", "yuvj444p", banner]);
    console.log(`copertina del README: ${path.relative(RADICE, banner)}`);
    const itchDir = path.join(RADICE, "grafica", "itch");
    if (fs.existsSync(itchDir)) {
      const itchBanner = path.join(itchDir, "banner-960x411.jpg");
      execFileSync("ffmpeg", ["-v", "error", "-y", "-i", png, "-vf", "scale=960:411:flags=lanczos", "-q:v", "2", "-pix_fmt", "yuvj444p", itchBanner]);
      console.log(`banner di itch.io: ${path.relative(RADICE, itchBanner)}`);
    }
  }

  if (f.id === "4x3") {
    const itchDir = path.join(RADICE, "grafica", "itch");
    if (fs.existsSync(itchDir)) {
      const itchCop = path.join(itchDir, "copertina-630x500.jpg");
      // da 2880×2160 (4:3) ritaglia al centro 2722×2160 (630:500) e riduce con Lanczos a 630×500
      execFileSync("ffmpeg", ["-v", "error", "-y", "-i", png, "-vf", "crop=2722:2160:79:0,scale=630:500:flags=lanczos", "-q:v", "2", "-pix_fmt", "yuvj444p", itchCop]);
      console.log(`copertina di itch.io: ${path.relative(RADICE, itchCop)}`);
    }
  }

  if (!args.includes("--png")) fs.rmSync(png);
  console.log(`${f.nome}: ${f.w}×${f.h} → ${path.relative(RADICE, jpg)} (${(fs.statSync(jpg).size / 1e6).toFixed(1)} MB)`);
}
