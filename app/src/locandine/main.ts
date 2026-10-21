// ====================================================================
//  Le immagini promozionali del gioco (solo in sviluppo: locandine.html).
// --------------------------------------------------------------------
//  ?formato=16x9 | 21x9 | 4x3 | 1x1 | locandina | github  dipinge quel
//  formato su una tela delle sue misure esatte: la scena (scena.ts), la
//  grana e la luce, i testi, i marchi (marchi.ts). Chi fotografa
//  (strumenti/locandine.cjs) passa il marchio di Runtime e riceve il PNG:
//    await window.__locandina.rendi({ runtime: "<svg…>" })  →  "data:image/png;base64,…"
//  Testi: il titolo, il sottotitolo e l'autore come sul titolo del gioco;
//  la frase del biglietto del fratello, scritta a mano (Covered By Your
//  Grace, il carattere del biglietto nel trailer).
// ====================================================================
import { FONT } from "../trailer/font";
import { rng } from "../trailer/tempo";
import { ACQUA, dipingi, preparaTele, type Vista } from "./scena";
import { FORMATI, type Formato } from "./formati";
import { marchioFavella, marchioRuntime } from "./marchi";

const TITOLO = "IL VIAGGIATORE";
const SOTTO = "UN ESPERIMENTO IN FAVELLA 1";
const AUTORE = "un gioco di Simone Pizzi";
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

function grana(g: CanvasRenderingContext2D, w: number, h: number, forza: number) {
  const t = document.createElement("canvas");
  t.width = t.height = 256;
  const c = t.getContext("2d")!, img = c.createImageData(256, 256), r = rng(7);
  for (let i = 0; i < img.data.length; i += 4) { const v = 128 + (r() - 0.5) * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
  c.putImageData(img, 0, 0);
  g.save();
  g.globalCompositeOperation = "overlay";
  g.globalAlpha = forza;
  g.fillStyle = g.createPattern(t, "repeat")!;
  g.fillRect(0, 0, w, h);
  g.restore();
}

async function rendi(f: Formato, runtimeSvg: string): Promise<HTMLCanvasElement> {
  const famiglie = [`800 100px ${FONT.display}`, `700 100px ${FONT.display}`, `italic 500 100px ${FONT.serif}`, `500 100px ${FONT.mono}`, `400 100px ${FONT.mano}`];
  await Promise.all(famiglie.map((x) => document.fonts.load(x)));
  const { w, h } = f;
  const k = w / f.larghezza;
  const v: Vista = { x0: -f.larghezza / 2, x1: f.larghezza / 2, y0: f.alto, y1: f.alto + h / k };
  const R = Math.min(3, Math.max(1, Math.ceil(k * 1.15)));
  const tele = await preparaTele(v, R);

  const tela = document.createElement("canvas");
  tela.width = w; tela.height = h;
  const g = tela.getContext("2d")!;
  g.imageSmoothingQuality = "high";
  g.fillStyle = "#000"; g.fillRect(0, 0, w, h);

  // ── la scena
  const alto = 340;
  g.save();
  g.setTransform(k, 0, 0, k, -v.x0 * k, -v.y0 * k);
  dipingi(g, v, tele, {
    distanza: f.distanza, alto, piedi: ACQUA + 204,
    canne: f.impagina === "locandina" ? ACQUA + 250 : v.y1, canneAlte: f.impagina === "locandina" ? 280 : 260,
  });
  g.restore();

  // ── la luce: l'angolo che si chiude, il basso che si spegne sotto i testi, la grana
  const vign = g.createRadialGradient(w / 2, h * 0.55, Math.min(w, h) * 0.35, w / 2, h * 0.55, Math.hypot(w, h) * 0.62);
  vign.addColorStop(0, "rgba(0,0,0,0)"); vign.addColorStop(1, "rgba(4,0,3,.55)");
  g.fillStyle = vign; g.fillRect(0, 0, w, h);
  const buio = g.createLinearGradient(0, h * f.buio.da, 0, h);
  buio.addColorStop(0, "rgba(5,1,4,0)"); buio.addColorStop(0.4, `rgba(5,1,4,${f.buio.forza * 0.75})`); buio.addColorStop(1, `rgba(5,1,4,${f.buio.forza})`);
  g.fillStyle = buio; g.fillRect(0, h * f.buio.da, w, h * (1 - f.buio.da));
  if (f.impagina === "locandina") {
    const su = g.createLinearGradient(0, 0, 0, h * 0.18);
    su.addColorStop(0, "rgba(2,0,4,.55)"); su.addColorStop(1, "rgba(2,0,4,0)");
    g.fillStyle = su; g.fillRect(0, 0, w, h * 0.18);
  }
  grana(g, w, h, 0.07);

  // ── i testi
  const ombra = (blur: number, colore: string) => { g.shadowBlur = blur; g.shadowColor = colore; g.shadowOffsetX = 0; g.shadowOffsetY = 0; };
  g.textBaseline = "alphabetic";
  // il titolo: Sora 800 spaziata come sul titolo del gioco, con un alone caldo appena
  {
    const c = f.titolo.corpo;
    g.font = `800 ${c}px ${FONT.display}`;
    const grad = g.createLinearGradient(0, f.titolo.y - c * 0.75, 0, f.titolo.y);
    grad.addColorStop(0, "#fff8ee"); grad.addColorStop(1, "#f2dcc6");
    ombra(c * 0.5, "rgba(255,150,100,.28)"); g.fillStyle = grad;
    centrato(g, TITOLO, w / 2, f.titolo.y, 0.14, c);
    ombra(c * 0.12, "rgba(10,2,8,.55)");
    centrato(g, TITOLO, w / 2, f.titolo.y, 0.14, c);
  }
  ombra(f.sotto.corpo * 0.6, "rgba(10,2,8,.8)");
  g.font = `500 ${f.sotto.corpo}px ${FONT.mono}`; g.fillStyle = "#ffe0bd";
  centrato(g, SOTTO, w / 2, f.sotto.y, 0.5, f.sotto.corpo);
  g.font = `italic 500 ${f.autore.corpo}px ${FONT.serif}`; g.fillStyle = "rgba(246,238,226,.94)";
  ombra(f.autore.corpo * 0.5, "rgba(10,2,8,.85)");
  centrato(g, AUTORE, w / 2, f.autore.y, 0.01, f.autore.corpo);
  // la frase del biglietto, a mano, appena storta
  g.save();
  g.translate(w / 2, f.frase.y);
  g.rotate(-0.018);
  g.font = `400 ${f.frase.corpo}px ${FONT.mano}`; g.fillStyle = "rgba(250,240,226,.95)";
  ombra(f.frase.corpo * 0.45, "rgba(10,2,8,.9)");
  centrato(g, FRASE, 0, 0, 0.02, f.frase.corpo);
  g.restore();
  g.shadowBlur = 0; g.shadowColor = "transparent";

  // ── i marchi: Runtime Multimedia e FAVELLA 1, separati da un filo
  const a = f.marchi.alto;
  const rt = await marchioRuntime(runtimeSvg, a * 1.06, MARCHI);
  const fv = marchioFavella(a * 0.84, MARCHI, "#f2a33a");
  const stacco = a * 1.1;
  const tot = rt.width + stacco + fv.width;
  const x0 = w / 2 - tot / 2;
  g.globalAlpha = 0.92;
  g.drawImage(rt, x0, f.marchi.y - rt.height / 2);
  g.fillStyle = "rgba(239,229,214,.35)";
  g.fillRect(x0 + rt.width + stacco / 2 - Math.max(1, a * 0.012), f.marchi.y - a * 0.42, Math.max(2, a * 0.024), a * 0.84);
  g.drawImage(fv, x0 + rt.width + stacco, f.marchi.y - fv.height / 2);
  g.globalAlpha = 1;
  return tela;
}

const q = new URLSearchParams(location.search);
const formato = FORMATI.find((x) => x.id === (q.get("formato") ?? "16x9")) ?? FORMATI[0];
(window as unknown as { __locandina: object }).__locandina = {
  formato,
  formati: FORMATI.map((x) => x.id),
  rendi: async (o: { runtime: string; vedi?: boolean }) => {
    const t0 = performance.now();
    const tela = await rendi(formato, o.runtime);
    console.info(`[locandine] ${formato.id} ${formato.w}×${formato.h} in ${Math.round(performance.now() - t0)} ms`);
    if (o.vedi) {
      tela.style.cssText = "max-width:100vw;max-height:100vh;display:block;margin:auto";
      document.body.replaceChildren(tela);
    }
    return tela.toDataURL("image/png");
  },
};
document.title = `Locandina ${formato.nome}`;
