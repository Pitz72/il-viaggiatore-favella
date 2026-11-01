// ====================================================================
//  Il protocollo app:// — i file dell'app web, senza server e senza rete.
// --------------------------------------------------------------------
//  Serve i file di desktop/web (copiati da app/dist). Niente fuori da quella
//  cartella (anche «web-altro» è fuori). Supporta le richieste a intervalli
//  (Range): senza, l'elemento <audio> non può saltare dentro il brano, e il
//  trailer usa proprio il salto per restare sincronizzato con la musica.
//  Separato da main.cjs perché si prova senza Electron (desktop/prove.cjs):
//  Response è quella di Node.
// ====================================================================
const fs = require("node:fs");
const path = require("node:path");

const TIPI = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".wasm": "application/wasm",
  ".zip": "application/zip",
  ".whl": "application/zip",
  ".fav": "text/plain; charset=utf-8",
  ".mp3": "audio/mpeg",
  ".opus": "audio/ogg",
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
};

/** Il tratto [inizio, fine] (compresi) che chiede un'intestazione Range, su un file di `dimensione` byte: null se la richiesta
 *  non è a intervalli (o è di una forma che non si serve: allora va il file intero), «fuori» se il tratto non c'è nel file.
 *  «bytes=N-» è da N alla fine, «bytes=N-M» da N a M, «bytes=-N» gli ultimi N byte. */
function intervallo(range, dimensione) {
  const m = /^bytes=(\d*)-(\d*)$/.exec(range ?? "");
  if (!m || (!m[1] && !m[2])) return null;
  const coda = !m[1];
  const inizio = coda ? Math.max(0, dimensione - Number(m[2])) : Number(m[1]);
  const fine = coda || !m[2] ? dimensione - 1 : Math.min(Number(m[2]), dimensione - 1);
  if (inizio > fine || inizio >= dimensione) return "fuori";
  return { inizio, fine };
}

/** Il gestore del protocollo per la cartella `web`. */
function servitore(web) {
  return async function servi(richiesta) {
    const url = new URL(richiesta.url);
    let rel;
    try { rel = decodeURIComponent(url.pathname); } catch { return new Response("indirizzo non valido", { status: 400 }); }
    if (rel === "/" || rel === "") rel = "/index.html";
    const file = path.normalize(path.join(web, rel));
    if (!file.startsWith(web + path.sep)) return new Response("vietato", { status: 403 });   // anche «web-altro» è fuori
    let stat;
    try { stat = await fs.promises.stat(file); } catch { return new Response("non trovato", { status: 404 }); }
    if (!stat.isFile()) return new Response("non trovato", { status: 404 });
    const tipo = TIPI[path.extname(file).toLowerCase()] ?? "application/octet-stream";
    const tratto = intervallo(richiesta.headers.get("range"), stat.size);
    if (tratto === "fuori") {
      return new Response(null, { status: 416, headers: { "content-range": `bytes */${stat.size}` } });
    }
    if (tratto) {
      const { inizio, fine } = tratto;
      const fd = await fs.promises.open(file, "r");
      const buf = Buffer.alloc(fine - inizio + 1);
      try { await fd.read(buf, 0, buf.length, inizio); } finally { await fd.close(); }
      return new Response(buf, {
        status: 206,
        headers: {
          "content-type": tipo, "accept-ranges": "bytes",
          "content-range": `bytes ${inizio}-${fine}/${stat.size}`, "content-length": String(buf.length),
        },
      });
    }
    const dati = await fs.promises.readFile(file);
    return new Response(dati, { headers: { "content-type": tipo, "accept-ranges": "bytes", "content-length": String(dati.length) } });
  };
}

module.exports = { servitore, intervallo, TIPI };
