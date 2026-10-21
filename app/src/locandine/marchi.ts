// ====================================================================
//  I due marchi per le immagini promozionali, in un solo colore chiaro.
// --------------------------------------------------------------------
//  Come nei titoli di un film, nel blocco in basso i marchi stanno in un
//  colore solo. RUNTIME MULTIMEDIA: il file ufficiale «Bianco» (lo passa
//  chi fotografa, da grafica/branding/marchi/), ricolorato. FAVELLA 1: il
//  simbolo vettoriale che il gioco ha già per i loghi d'apertura
//  (loghi/forme.ts: graffe, sei foglie, libro, gemma), pieno, con le
//  forme separate da un filo scavato, come nel marchio le separano i
//  contorni scuri; la gemma resta d'ambra. Accanto, la scritta FAVELLA1
//  in Sora 700 con le proporzioni del banner ufficiale.
// ====================================================================
import { ASSE, EMBLEMA_POSA, FOGLIE, GEMMA, GRAFFA, LIBRO } from "../loghi/forme";

const SCRITTA = "FAVELLA1";
/** Il banner ufficiale (2172×724): la scritta a x 892, base 415, corpo 216, lunga 1057. */
const BANNER = { scrittaX: 892, base: 415, corpo: 216, lunga: 1057 };

/** Un'immagine da un testo SVG. */
export function immagineSvg(svg: string): Promise<HTMLImageElement> {
  return new Promise((ok, ko) => {
    const im = new Image();
    im.onload = () => ok(im);
    im.onerror = () => ko(new Error("SVG non valido"));
    im.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  });
}

/** Il riquadro dei pixel non trasparenti di una tela. */
function riquadro(c: HTMLCanvasElement) {
  const d = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
  let x0 = c.width, y0 = c.height, x1 = 0, y1 = 0;
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
    if (d[(y * c.width + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  return { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

/** Il simbolo di FAVELLA 1 in un colore, alto `alto` px, ritagliato stretto; `locale` è il suo riquadro nelle
 *  coordinate del ritaglio 995×510 (quelle di loghi/forme.ts). */
export function emblemaFavella(alto: number, colore: string, gemma: string | null): { tela: HTMLCanvasElement; locale: { x: number; y: number; w: number; h: number } } {
  // si disegna largo, nelle coordinate del ritaglio 995×510, poi si ritaglia
  const S = (alto / 400) * 1.25;
  const tela = document.createElement("canvas");
  tela.width = Math.ceil(1000 * S); tela.height = Math.ceil(520 * S);
  const g = tela.getContext("2d")!;
  g.scale(S, S);
  const specchio = (f: () => void) => { g.save(); g.translate(2 * ASSE, 0); g.scale(-1, 1); f(); g.restore(); };
  const pieno = (d: string, scava: number) => {
    const p = new Path2D(d);
    if (scava > 0) {
      g.globalCompositeOperation = "destination-out";
      g.lineWidth = scava; g.lineJoin = "round"; g.stroke(p);
    }
    g.globalCompositeOperation = "source-over";
    g.fillStyle = colore; g.fill(p);
  };
  pieno(GRAFFA, 0); specchio(() => pieno(GRAFFA, 0));
  // le foglie dalla più esterna alla più interna, una per lato alla volta: ognuna si stacca da quella sotto
  for (let i = 0; i < FOGLIE.length; i++) { pieno(FOGLIE[i], 7); specchio(() => pieno(FOGLIE[i], 7)); }
  pieno(LIBRO, 12);
  const gm = new Path2D(`M${GEMMA.alto} L${GEMMA.sx} L${GEMMA.basso} L${GEMMA.dx} Z`);
  g.globalCompositeOperation = "destination-out"; g.lineWidth = 10; g.lineJoin = "round"; g.stroke(gm); g.fill(gm);
  g.globalCompositeOperation = "source-over";
  if (gemma) { g.fillStyle = gemma; g.fill(gm); }
  const r = riquadro(tela);
  const out = document.createElement("canvas");
  out.width = Math.round(r.w * (alto / r.h)); out.height = Math.round(alto);
  out.getContext("2d")!.drawImage(tela, r.x, r.y, r.w, r.h, 0, 0, out.width, out.height);
  return { tela: out, locale: { x: r.x / S, y: r.y / S, w: r.w / S, h: r.h / S } };
}

/** FAVELLA 1: il simbolo e la scritta, alti `alto` px (l'altezza è quella del simbolo). */
export function marchioFavella(alto: number, colore: string, gemma: string | null): HTMLCanvasElement {
  const { tela: emblema, locale } = emblemaFavella(alto, colore, gemma);
  // k: pixel per unità del banner; il simbolo vi sta con la posa EMBLEMA_POSA
  const P = EMBLEMA_POSA;
  const k = alto / (locale.h * P.scala);
  const corpo = BANNER.corpo * k;
  const misura = document.createElement("canvas").getContext("2d")!;
  misura.font = `700 ${corpo}px Sora`;
  const naturale = misura.measureText(SCRITTA).width;
  const spazio = (BANNER.lunga * k - naturale) / (SCRITTA.length - 1);
  const scrittaX = (BANNER.scrittaX - (P.x + locale.x * P.scala)) * k;
  const lungaScritta = BANNER.lunga * k;
  const out = document.createElement("canvas");
  out.width = Math.ceil(scrittaX + lungaScritta + 4); out.height = Math.ceil(alto);
  const g = out.getContext("2d")!;
  g.drawImage(emblema, 0, 0);
  g.font = `700 ${corpo}px Sora`;
  g.fillStyle = colore;
  g.textBaseline = "alphabetic";
  // la scritta sta alla sua altezza del banner rispetto al simbolo
  const base = (BANNER.base - (P.y + locale.y * P.scala)) * k;
  let x = scrittaX;
  for (const c of SCRITTA) { g.fillText(c, x, base); x += misura.measureText(c).width + spazio; }
  return out;
}

/** RUNTIME MULTIMEDIA dal file ufficiale «Bianco», ricolorato, alto `alto` px. */
export async function marchioRuntime(svgBianco: string, alto: number, colore: string): Promise<HTMLCanvasElement> {
  const im = await immagineSvg(svgBianco.replace(/#FFFFFF/gi, colore));
  const w = Math.round((alto * 839) / 245);
  const out = document.createElement("canvas");
  out.width = w; out.height = Math.round(alto);
  out.getContext("2d")!.drawImage(im, 0, 0, w, out.height);
  return out;
}
