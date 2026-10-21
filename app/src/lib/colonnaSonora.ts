// ====================================================================
//  «Scarica la colonna sonora ufficiale» (menu d'avvio → Extra).
// --------------------------------------------------------------------
//  I sette brani di The Runtimers viaggiano col gioco (public/colonna-sonora,
//  l'elenco in album.json: gli MP3, la copertina, il LEGGIMI). Sul desktop il
//  processo principale chiede la cartella e ci copia l'album
//  (desktop/colonna-sonora.cjs); nel browser i file si impacchettano qui in uno
//  ZIP e si scaricano. Lo ZIP è «memorizzato», senza compressione: gli MP3 lo
//  sono già, e così bastano poche righe e nessuna libreria (lib/zip.ts).
// ====================================================================
import { componiZip } from "./zip";

const BASE = `${import.meta.env.BASE_URL}colonna-sonora/`;
const NOME_ZIP = "Il Viaggiatore - Official Soundtrack.zip";
const CARTELLA = "Il Viaggiatore - Official Soundtrack";

interface Album { titolo: string; autore: string; file: string[] }

const desktop = (): { salva: () => Promise<string | null> } | undefined =>
  (window as unknown as { viaggiatoreDesktop?: { colonnaSonora?: { salva: () => Promise<string | null> } } }).viaggiatoreDesktop?.colonnaSonora;

/** Che cosa è successo: salvata in una cartella, scaricata come ZIP, oppure annullata. */
export type Esito = { tipo: "cartella"; dove: string } | { tipo: "zip"; nome: string } | { tipo: "annullato" };

export async function scaricaColonnaSonora(): Promise<Esito> {
  const d = desktop();
  if (d) {
    const dove = await d.salva();
    return dove ? { tipo: "cartella", dove } : { tipo: "annullato" };
  }
  const r = await fetch(`${BASE}album.json`);
  if (!r.ok) throw new Error("La colonna sonora non c'è.");
  const album = (await r.json()) as Album;
  const file: { nome: string; dati: Uint8Array }[] = [];
  for (const nome of album.file) {
    // encodeURI e non encodeURIComponent: la virgola di «Acqua ovunque, niente da bere» resta com'è (codificata,
    // un server può non riconoscerla e rispondere con la pagina del gioco); e una pagina al posto di un file è un errore
    const f = await fetch(BASE + encodeURI(nome));
    if (!f.ok || (f.headers.get("content-type") ?? "").includes("text/html")) throw new Error(`Manca ${nome}.`);
    file.push({ nome: `${CARTELLA}/${nome}`, dati: new Uint8Array(await f.arrayBuffer()) });
  }
  const zip = componiZip(file);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([zip as BlobPart], { type: "application/zip" }));
  a.download = NOME_ZIP;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
  return { tipo: "zip", nome: NOME_ZIP };
}
