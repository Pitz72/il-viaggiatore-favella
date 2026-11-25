// ====================================================================
//  Le immagini promozionali del gioco (solo in sviluppo: locandine.html).
// --------------------------------------------------------------------
//  ?formato=16x9 | 21x9 | 4x3 | 1x1 | locandina | github  dipinge quel
//  formato su una tela delle sue misure esatte: la tavola pittorica al
//  guado di Acquamorta (scena.ts), la grana di carta, il titolo, la firma
//  «un gioco in FAVELLA1 di Simone Pizzi», la frase del biglietto del
//  fratello (Covered By Your Grace) e i marchi (marchi.ts).
//  Chi fotografa (strumenti/locandine.cjs) passa il marchio di Runtime e
//  gli indirizzi delle tavole e riceve il PNG:
//    await window.__locandina.rendi({ runtime: "<svg…>", tavole })
// ====================================================================
import { FONT } from "../trailer/font";
import { rng } from "../trailer/tempo";
import { caricaImmagine, dipingiTavola, urlTavola } from "./scena";
import { FORMATI, type Formato, type Tavola } from "./formati";
import { marchioFavella, marchioRuntime } from "./marchi";

const TITOLO = "IL VIAGGIATORE";
const AUTORE_PRIMA = "un gioco in ";
const AUTORE_FAVELLA = "FAVELLA1";
const AUTORE_DOPO = " di Simone Pizzi";
const FRASE = "Non è il caso di tornare.";
const MARCHI = "#efe5d6";

/** Testo centrato con la spaziatura data (in em), senza lo spazio in coda all'ultima lettera. */
function centrato(g: CanvasRenderingContext2D, testo: string, x: number, y: number, spazio: number, corpo: number) {
  g.letterSpacing = `${(spazio * corpo).toFixed(2)}px`;
  const w = g.measureText(testo).width - spazio * corpo;
  g.textAlign = "left";
  g.fillText(testo, x - w / 2, y);
  g.letterSpacing = "0px";
  return w;
}

/** Disegna «un gioco in FAVELLA1 di Simone Pizzi» centrato attorno a `x`, armonizzando Lora corsivo e Sora 700. */
function disegnaAutore(g: CanvasRenderingContext2D, x: number, y: number, corpo: number) {
  const fontCorsivo = `italic 500 ${corpo}px ${FONT.serif}`;
  const corpoFav = Math.round(corpo * 0.78);
  const fontFav = `700 ${corpoFav}px ${FONT.display}`;
  const spazioFav = corpoFav * 0.06;

  g.textAlign = "left";
  g.letterSpacing = "0px";
  g.font = fontCorsivo;
  const wPrima = g.measureText(AUTORE_PRIMA).width;
  const wDopo = g.measureText(AUTORE_DOPO).width;

  g.font = fontFav;
  g.letterSpacing = `${spazioFav.toFixed(2)}px`;
  const wFav = g.measureText(AUTORE_FAVELLA).width - spazioFav;
  g.letterSpacing = "0px";

  const stacco = corpo * 0.06;
  const tot = wPrima + stacco + wFav + stacco + wDopo;
  let cursore = x - tot / 2;

  g.font = fontCorsivo;
  g.fillStyle = "rgba(246,238,226,.95)";
  g.fillText(AUTORE_PRIMA, cursore, y);
  cursore += wPrima + stacco;

  g.font = fontFav;
  g.letterSpacing = `${spazioFav.toFixed(2)}px`;
  g.fillStyle = "#ffe3c0";
  g.fillText(AUTORE_FAVELLA, cursore, y - corpo * 0.02);
  g.letterSpacing = "0px";
  cursore += wFav + stacco;

  g.font = fontCorsivo;
  g.fillStyle = "rgba(246,238,226,.95)";
  g.fillText(AUTORE_DOPO, cursore, y);
}

function grana(g: CanvasRenderingContext2D, w: number, h: number, forza: number) {
  const t = document.createElement("canvas");
  t.width = t.height = 256;
  const c = t.getContext("2d")!, img = c.createImageData(256, 256), r = rng(7);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 128 + (r() - 0.5) * 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  c.putImageData(img, 0, 0);
  g.save();
  g.globalCompositeOperation = "overlay";
  g.globalAlpha = forza;
  g.fillStyle = g.createPattern(t, "repeat")!;
  g.fillRect(0, 0, w, h);
  g.restore();
}

async function rendi(f: Formato, runtimeSvg: string, tavole?: Partial<Record<Tavola, string>>): Promise<HTMLCanvasElement> {
  const famiglie = [
    `800 100px ${FONT.display}`,
    `700 100px ${FONT.display}`,
    `italic 500 100px ${FONT.serif}`,
    `400 100px ${FONT.mano}`,
  ];
  await Promise.all(famiglie.map((x) => document.fonts.load(x)));
  const im = await caricaImmagine(urlTavola(f.scena.tavola, tavole));

  const { w, h } = f;
  const tela = document.createElement("canvas");
  tela.width = w;
  tela.height = h;
  const g = tela.getContext("2d")!;

  // ── la tavola pittorica e le luci
  dipingiTavola(g, f, im);
  grana(g, w, h, 0.045);

  // ── i testi
  const ombra = (blur: number, colore: string, dy = 0) => {
    g.shadowBlur = blur;
    g.shadowColor = colore;
    g.shadowOffsetX = 0;
    g.shadowOffsetY = dy;
  };
  g.textBaseline = "alphabetic";

  // Il titolo: Sora 800 spaziata come sul titolo del gioco, con alone ambrato leggero e stacco scuro netto
  {
    const c = f.titolo.corpo;
    g.font = `800 ${c}px ${FONT.display}`;
    const grad = g.createLinearGradient(0, f.titolo.y - c * 0.78, 0, f.titolo.y);
    grad.addColorStop(0, "#fff9f0");
    grad.addColorStop(1, "#efd8bf");
    g.fillStyle = grad;
    ombra(c * 0.42, "rgba(12,5,4,.88)", Math.max(2, c * 0.02));
    centrato(g, TITOLO, w / 2, f.titolo.y, 0.14, c);
    ombra(c * 0.45, "rgba(255,152,92,.22)", 0);
    centrato(g, TITOLO, w / 2, f.titolo.y, 0.14, c);
  }

  // La firma d'autore: «un gioco in FAVELLA1 di Simone Pizzi»
  ombra(f.autore.corpo * 0.55, "rgba(8,3,4,.92)", Math.max(1, f.autore.corpo * 0.03));
  disegnaAutore(g, w / 2, f.autore.y, f.autore.corpo);

  // La frase del biglietto del fratello, a mano, appena inclinata
  g.save();
  g.translate(w / 2, f.frase.y);
  g.rotate(-0.018);
  g.font = `400 ${f.frase.corpo}px ${FONT.mano}`;
  g.fillStyle = "rgba(252,242,228,.96)";
  ombra(f.frase.corpo * 0.48, "rgba(8,3,4,.94)", Math.max(1, f.frase.corpo * 0.025));
  centrato(g, FRASE, 0, 0, 0.02, f.frase.corpo);
  g.restore();
  g.shadowBlur = 0;
  g.shadowColor = "transparent";
  g.shadowOffsetY = 0;

  // ── i marchi: Runtime Multimedia e FAVELLA 1, separati da un filo verticale
  const a = f.marchi.alto;
  const rt = await marchioRuntime(runtimeSvg, a * 1.06, MARCHI);
  const fv = marchioFavella(a * 0.84, MARCHI, "#f2a33a");
  const stacco = a * 1.1;
  const tot = rt.width + stacco + fv.width;
  const x0 = w / 2 - tot / 2;
  g.save();
  ombra(a * 0.35, "rgba(6,2,3,.85)", 0);
  g.globalAlpha = 0.94;
  g.drawImage(rt, x0, f.marchi.y - rt.height / 2);
  g.fillStyle = "rgba(239,229,214,.38)";
  g.fillRect(x0 + rt.width + stacco / 2 - Math.max(1, a * 0.012), f.marchi.y - a * 0.42, Math.max(2, a * 0.024), a * 0.84);
  g.drawImage(fv, x0 + rt.width + stacco, f.marchi.y - fv.height / 2);
  g.restore();

  return tela;
}

const q = new URLSearchParams(location.search);
const formato = FORMATI.find((x) => x.id === (q.get("formato") ?? "16x9")) ?? FORMATI[0];
(window as unknown as { __locandina: object }).__locandina = {
  formato,
  formati: FORMATI.map((x) => x.id),
  rendi: async (o: { runtime: string; tavole?: Partial<Record<Tavola, string>>; vedi?: boolean }) => {
    const t0 = performance.now();
    const tela = await rendi(formato, o.runtime, o.tavole);
    console.info(`[locandine] ${formato.id} ${formato.w}×${formato.h} in ${Math.round(performance.now() - t0)} ms`);
    if (o.vedi) {
      tela.style.cssText = "max-width:100vw;max-height:100vh;display:block;margin:auto";
      document.body.replaceChildren(tela);
    }
    return tela.toDataURL("image/png");
  },
};
document.title = `Locandina ${formato.nome}`;
