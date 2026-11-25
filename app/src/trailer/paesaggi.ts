// ====================================================================
//  Il punto d'ingresso dei paesaggi: raccoglie le scene, le prepara tutte e
//  smista il disegno del fotogramma a quella giusta.
// ====================================================================
import type { IdScena } from "./scaletta";
import { cacheTrailer, type Cache } from "./cache";
import { FONT } from "./font";
import { ZONE, REGOLE } from "./zone";
import { preparaLettere, disegnaLettere } from "./scene/lettere";
import { preparaAlba, disegnaAlba } from "./scene/alba";
import { preparaTerra, disegnaTerra } from "./scene/terra";
import { preparaInvaso, disegnaInvaso } from "./scene/invaso";
import { preparaMappa, disegnaMappa, stampaMappaPronta, tappaCorrente } from "./scene/mappa";
import { preparaGuado, disegnaGuado } from "./scene/guado";
import { disegnaCinque, disegnaRegola, disegnaRespiro } from "./scene/regole";
import { caricaTavoleTrailer } from "./tavole";

export { cacheTrailer, FONT, ZONE, REGOLE, tappaCorrente };
export type { Cache };

const passi: Array<(c: Cache) => void> = [
  preparaLettere,
  preparaAlba,
  preparaTerra,
  preparaInvaso,
  preparaMappa,
  preparaGuado,
];

let avanzamento = 0;
let pronto = false;
let inCorso: Promise<void> | null = null;
const ascoltatori = new Set<(k: number) => void>();

function notifica() { for (const f of ascoltatori) f(avanzamento); }

export function seguiPreparazione(f: (k: number) => void): () => void {
  ascoltatori.add(f);
  f(avanzamento);
  return () => { ascoltatori.delete(f); };
}

export function avviaPreparazione(c: Cache = cacheTrailer, avanza?: (k: number) => void): Promise<void> {
  if (pronto) return Promise.resolve();
  if (inCorso) return inCorso;
  const tavoleP = caricaTavoleTrailer();
  inCorso = (async () => {
    const famiglie = [
      `500 24px ${FONT.serif}`, `italic 500 24px ${FONT.serif}`, `700 24px ${FONT.display}`,
      `800 24px ${FONT.display}`, `600 24px ${FONT.display}`, `500 24px ${FONT.mono}`,
      `400 24px ${FONT.mano}`, `600 24px ${FONT.mono}`, `700 24px ${FONT.mono}`,
    ];
    const attesa = Promise.all(famiglie.map((f) => document.fonts?.load(f).catch(() => null)));
    await Promise.race([attesa, new Promise((r) => setTimeout(r, 2500))]);
    for (let i = 0; i < passi.length; i++) {
      await new Promise<void>((r) => setTimeout(r, 0));
      passi[i](c);
      avanzamento = (i + 1) / (passi.length + 1);
      avanza?.(avanzamento);
      notifica();
    }
    await tavoleP;
    await stampaMappaPronta();          // la stampa della carta del gioco, dipinta a fette nei momenti liberi
    avanzamento = 1;
    avanza?.(1);
    notifica();
    pronto = true;
  })();
  return inCorso;
}

export function preparaTutto(c: Cache) {
  if (pronto) return;
  void caricaTavoleTrailer();
  for (const p of passi) p(c);
  avanzamento = 1; pronto = true; notifica();
}

export function disegnaScena(ctx: CanvasRenderingContext2D, id: IdScena, t: number, c: Cache) {
  switch (id) {
    case "lettere": return disegnaLettere(ctx, t, c);
    case "alba":    return disegnaAlba(ctx, t, c, false);
    case "terra":   return disegnaTerra(ctx, t, c);
    case "invaso":  return disegnaInvaso(ctx, t, c);
    case "mappa":   return disegnaMappa(ctx, t, c);
    case "cinque":  return disegnaCinque(ctx, t);
    case "guado":   return disegnaGuado(ctx, t, c);
    case "regole":  return disegnaRegola(ctx, t);
    case "numeri":  return disegnaRespiro(ctx, t, "#7fc8bd", false);
    case "titolo":  return disegnaAlba(ctx, t, c, true);
  }
}
