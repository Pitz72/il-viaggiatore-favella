// ====================================================================
//  Monta il sito di GitHub Pages: la presentazione alla radice, il gioco in gioca/.
// --------------------------------------------------------------------
//  La presentazione è pagine/ (modello, stile, script, schermate) di QUESTO checkout; il gioco viene da
//  --gioco, la cartella di un checkout della release (nel workflow «Pagine», il tag dell'ultima release),
//  con app/dist già costruita. Dalla release (API di GitHub) vengono la versione, la data e i quattro
//  download; dai sorgenti del gioco l'avviso dell'autore (components/Avviso.tsx) e i titoli di coda
//  (finale/crediti.ts), così la pagina dice le stesse parole del gioco. Il gioco costruito deve essere
//  quella versione: se no ci si ferma.
//
//  Uso:
//    node strumenti/pagine.mjs --uscita <cartella> [--gioco <checkout>] [--tag v1.41.1]
//      --uscita  dove scrivere il sito: vuota, nuova, o un sito montato prima da qui (la si svuota)
//      --gioco   il checkout da cui prendere il gioco (di base questo; app/dist dev'essere costruita)
//      --tag     la release (di base l'ultima); GITHUB_TOKEN o GH_TOKEN, se ci sono, evitano i limiti dell'API
//  Nel workflow .github/workflows/pagine.yml, che il workflow «Rilascio» richiama dopo ogni release.
// ====================================================================
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const REPO = "Pitz72/il-viaggiatore-favella";
const INDIRIZZO = "https://pitz72.github.io/il-viaggiatore-favella/";
const radice = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const opz = (nome, ripiego) => { const i = args.indexOf(nome); return i >= 0 ? args[i + 1] : ripiego; };
const SEGNO = ".sito-del-viaggiatore";   // c'è in un sito montato da qui: solo quella cartella si può svuotare

/** I quattro file di una release, nell'ordine della pagina. `primo`: quello che si propone a chi usa quel sistema.
 *  `bIt`/`bEn`: la riga corta sotto il pulsante d'apertura. */
const FILE = [
  { re: /-win-x64\.exe$/, sistema: "windows", primo: true, it: "Windows", en: "Windows",
    dIt: "con installazione · si aggiorna da solo", dEn: "installer · updates itself", bIt: "con installazione", bEn: "installer" },
  { re: /-portable\.exe$/, sistema: "windows", it: "Windows, portatile", en: "Windows, portable",
    dIt: "senza installazione: si apre e si gioca", dEn: "nothing to install: open it and play", bIt: "portatile", bEn: "portable" },
  { re: /-linux-x86_64\.AppImage$/, sistema: "linux", primo: true, it: "Linux · AppImage", en: "Linux · AppImage",
    dIt: "qualunque distribuzione · si aggiorna da solo", dEn: "any distribution · updates itself", bIt: "AppImage", bEn: "AppImage" },
  { re: /-linux-amd64\.deb$/, sistema: "linux", it: "Linux · .deb", en: "Linux · .deb",
    dIt: "Debian, Ubuntu, Mint", dEn: "Debian, Ubuntu, Mint", bIt: ".deb · Debian, Ubuntu", bEn: ".deb · Debian, Ubuntu" },
];

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const coppia = (it, en, tag = "span") => `<${tag} lang="it">${it}</${tag}><${tag} lang="en">${en}</${tag}>`;
const fallisci = (msg) => { console.error(`[pagine] ${msg}`); process.exit(1); };

async function release(tag) {
  const intestazioni = { Accept: "application/vnd.github+json", "User-Agent": "il-viaggiatore-pagine" };
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (token) intestazioni.Authorization = `Bearer ${token}`;
  const r = await fetch(`https://api.github.com/repos/${REPO}/releases/${tag ? `tags/${tag}` : "latest"}`, { headers: intestazioni });
  if (!r.ok) fallisci(`la release ${tag ?? "più recente"} non si legge (HTTP ${r.status})`);
  return r.json();
}

/** Il valore di una costante fatta di stringhe unite con «+», letta senza eseguire il file (che importa React). */
function costante(ts, file, nome) {
  const sorgente = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
  let trovata = null;
  const valuta = (n) => {
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) return n.text;
    if (ts.isParenthesizedExpression(n)) return valuta(n.expression);
    if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.PlusToken) return valuta(n.left) + valuta(n.right);
    throw new Error(`${nome} in ${file}: non è fatta solo di stringhe`);
  };
  const visita = (n) => {
    if (ts.isVariableDeclaration(n) && n.name.getText() === nome && n.initializer) trovata = valuta(n.initializer);
    ts.forEachChild(n, visita);
  };
  visita(sorgente);
  if (trovata === null) fallisci(`${nome} non c'è in ${file}`);
  return trovata;
}

async function main() {
  const uscita = opz("--uscita") ? path.resolve(opz("--uscita")) : fallisci("manca --uscita <cartella>");
  const gioco = path.resolve(opz("--gioco", radice));
  if (radice.startsWith(uscita + path.sep) || uscita === radice || gioco.startsWith(uscita + path.sep) || uscita === gioco) {
    fallisci(`--uscita ${uscita} contiene il progetto: si sceglie un'altra cartella`);
  }
  if (fs.existsSync(uscita) && fs.readdirSync(uscita).length && !fs.existsSync(path.join(uscita, SEGNO))) {
    fallisci(`${uscita} non è vuota e non è un sito montato da qui: non la svuoto`);
  }

  // la release e il gioco devono essere la stessa versione
  const rel = await release(opz("--tag"));
  const versione = JSON.parse(fs.readFileSync(path.join(gioco, "versione.json"), "utf8")).gioco;
  if (rel.tag_name !== `v${versione}`) fallisci(`la release è ${rel.tag_name}, il gioco in ${gioco} è la ${versione}`);
  const dist = path.join(gioco, "app", "dist");
  if (!fs.existsSync(path.join(dist, "index.html"))) fallisci(`manca ${dist}: si costruisce prima il gioco (npm run build in app/)`);
  const bundle = fs.readdirSync(path.join(dist, "assets")).filter((f) => f.endsWith(".js"))
    .some((f) => fs.readFileSync(path.join(dist, "assets", f), "utf8").includes(`gioco:\`${versione}\``));
  if (!bundle) fallisci(`${dist} non è costruita dalla ${versione} (va rifatta: npm run build in app/)`);

  // i quattro download: le schede della sezione «Scarica» e i pulsanti dell'apertura
  const file = FILE.map((f) => {
    const a = rel.assets.find((x) => f.re.test(x.name));
    if (!a) fallisci(`nella release ${rel.tag_name} manca il file ${f.re}`);
    return { ...f, a, peso: `${Math.round(a.size / 1048576)} MB`, url: `https://github.com/${REPO}/releases/download/${rel.tag_name}/${encodeURIComponent(a.name)}` };
  });
  const apertura = file.map(({ sistema, primo, url, peso, bIt, bEn }) =>
    `          <a class="bottone" href="${esc(url)}" data-sistema="${sistema}"${primo ? " data-primo" : ""}>${sistema === "windows" ? "Windows" : "Linux"} <small>${coppia(esc(bIt), esc(bEn))} · ${peso}</small></a>`).join("\n");
  const download = file.map((f) => {
    const { a, peso, url } = f;
    return `        <a class="file" href="${esc(url)}" data-sistema="${f.sistema}"${f.primo ? " data-primo" : ""} data-peso="${peso}">
          <span class="file-sistema">${coppia(esc(f.it), esc(f.en))}</span>
          <span class="file-dettaglio">${coppia(esc(f.dIt), esc(f.dEn))} · ${peso}</span>
          <span class="file-nome">${esc(a.name)}</span>
          <span class="file-scarica">${coppia("Scarica", "Download")}</span>
        </a>`;
  }).join("\n");

  // le parole del gioco: l'avviso dell'autore e i titoli di coda (TypeScript del checkout del gioco)
  const richiedi = createRequire(path.join(gioco, "app", "package.json"));
  const ts = richiedi("typescript");
  const avviso = path.join(gioco, "app", "src", "components", "Avviso.tsx");
  const avvisoIt = costante(ts, avviso, "TESTO_AVVISO"), avvisoEn = costante(ts, avviso, "TESTO_AVVISO_EN");
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "pagine-"));
  const crediti = path.join(tmp, "crediti.mjs");
  fs.writeFileSync(crediti, ts.transpileModule(fs.readFileSync(path.join(gioco, "app", "src", "finale", "crediti.ts"), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText);
  const C = await import(pathToFileURL(crediti).href);
  fs.rmSync(tmp, { recursive: true, force: true });
  // la canzone dei titoli c'è solo se c'è il suo file, come nel gioco
  const conCanzone = fs.existsSync(path.join(gioco, "app", "public", "musica", "finale.opus"));
  const elenco = (inglese) => C.righeDeiTitoli(conCanzone, inglese).map(([che, chi], i) =>
    `        <dt>${esc(che)}</dt><dd${i === 0 ? ' class="titolo"' : ""}>${esc(chi).replace(/\n/g, "<br />")}</dd>`).join("\n");
  const conLink = (s) => esc(s).replace("github.com/Pitz72/il-viaggiatore-favella", `<a href="https://github.com/${REPO}">github.com/Pitz72/il-viaggiatore-favella</a>`);
  const titoli = `      <dl lang="it">\n${elenco(false)}\n      </dl>\n      <dl lang="en">\n${elenco(true)}\n      </dl>
      <p class="licenze">${coppia(conLink(C.LICENZE), conLink(C.LICENZE_EN))}</p>`;

  const quando = new Date(rel.published_at);
  const data = (l) => quando.toLocaleDateString(l, { timeZone: "Europe/Rome", day: "numeric", month: "long", year: "numeric" });
  const valori = {
    INDIRIZZO, VERSIONE: esc(versione), DATA_IT: data("it-IT"), DATA_EN: data("en-GB"), DOWNLOAD: download, DOWNLOAD_APERTURA: apertura, CREDITI: titoli,
    AVVISO_IT: esc(avvisoIt), AVVISO_EN: esc(avvisoEn), TUTTE: `https://github.com/${REPO}/releases`,
  };
  const pagine = path.join(radice, "pagine");
  let html = fs.readFileSync(path.join(pagine, "index.html"), "utf8").replace(/\{\{([A-Z_]+)\}\}/g, (m, k) => (k in valori ? valori[k] : m));
  const resti = html.match(/\{\{[A-Z_]+\}\}/g);
  if (resti) fallisci(`segnaposto senza valore: ${[...new Set(resti)].join(", ")}`);

  // il sito
  fs.rmSync(uscita, { recursive: true, force: true });
  fs.mkdirSync(uscita, { recursive: true });
  fs.writeFileSync(path.join(uscita, "index.html"), html);
  for (const f of ["stile.css", "pagina.js"]) fs.copyFileSync(path.join(pagine, f), path.join(uscita, f));
  fs.cpSync(path.join(pagine, "schermate"), path.join(uscita, "schermate"), { recursive: true });
  fs.copyFileSync(path.join(radice, "grafica", "banner.jpg"), path.join(uscita, "banner.jpg"));
  fs.copyFileSync(path.join(radice, "grafica", "branding", "il-viaggiatore-github-1280x640.jpg"), path.join(uscita, "anteprima.jpg"));
  fs.cpSync(dist, path.join(uscita, "gioca"), { recursive: true });
  fs.writeFileSync(path.join(uscita, ".nojekyll"), "");
  fs.writeFileSync(path.join(uscita, SEGNO), `${rel.tag_name}\n`);
  const peso = (d) => fs.readdirSync(d, { recursive: true, withFileTypes: true }).filter((e) => e.isFile())
    .reduce((s, e) => s + fs.statSync(path.join(e.parentPath ?? e.path, e.name)).size, 0);
  console.log(`[pagine] ${uscita}: presentazione della ${versione} (${rel.tag_name}, ${data("it-IT")}), quattro download, gioco in gioca/; ${(peso(uscita) / 1048576).toFixed(1)} MB`);
}

main().catch((e) => fallisci(e.stack ?? e));
