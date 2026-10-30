// ====================================================================
//  La stampa della mappa, dipinta una volta sola.
// --------------------------------------------------------------------
//  terreno.ts dice quanto è alta la terra e dove sta l'acqua; qui lo si dipinge
//  su una tela (tinte, ombra, curve di livello, il lago, il torrente, il mare,
//  la diga, la ferrovia, pochi nomi stampati) e la tela diventa un'immagine
//  che la mappa mette sotto la mano. Si fa in un momento libero, appena la
//  mappa è in bisaccia, e si ricorda per tutta la sessione (una per carta e per
//  scala): aprire la mappa non costa niente. Con il contrasto alto non si fa.
//  In più, a parte, il SALE: il tratteggio a penna che copre il lago quando
//  l'invaso è raggiunto (la mano che corregge la stampa).
// ====================================================================
import { useEffect, useState } from "react";
import type { Carta } from "../lib/favellaRuntime";
import { ancoreTerreno, disposizione, type AncoreTerreno } from "./foglio";
import { SERRA_ALTA, VERSIONE_TERRENO, cantiere, isolinee, nelLago, pixel, rivaX, type Terreno } from "./terreno";

const W = 1092, H = 481;
export interface Stampa { url: string; sale: string | null }

const memoria = new Map<string, Promise<Stampa>>();
/** Le stampe già pronte, da leggere subito: una mappa che si apre con la stampa in memoria la mostra dal primo istante. */
const pronte = new Map<string, Stampa>();
const chiaveDi = (a: AncoreTerreno, scala: number) => `${a.firma}#${VERSIONE_TERRENO}#${scala}`;
const quandoLibero = (f: () => void) => {
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
  if (w.requestIdleCallback) w.requestIdleCallback(f, { timeout: 1500 });
  else window.setTimeout(f, 200);
};
const comeUrl = (tela: HTMLCanvasElement) => new Promise<string>((ok) => {
  tela.toBlob((b) => ok(b ? URL.createObjectURL(b) : tela.toDataURL()), "image/webp", 0.92);
});

/** Disegna una spezzata di segmenti [x0, y0, x1, y1, …]. */
function segmenti(g: CanvasRenderingContext2D, s: number[], colore: string, spessore: number) {
  g.beginPath();
  for (let i = 0; i < s.length; i += 4) { g.moveTo(s[i], s[i + 1]); g.lineTo(s[i + 2], s[i + 3]); }
  g.strokeStyle = colore; g.lineWidth = spessore; g.stroke();
}
function linea(g: CanvasRenderingContext2D, pts: { x: number; y: number }[]) {
  g.beginPath();
  pts.forEach((q, i) => (i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y)));
}

/** Cede il passo al gioco fra una fetta di lavoro e l'altra. */
const respiro = () => new Promise<void>((ok) => window.setTimeout(ok, 0));

/** Il terreno e la tela della stampa, a `scala` pixel per unità, a fette di qualche millisecondo. */
async function dipingi(a: AncoreTerreno, scala: number): Promise<{ t: Terreno; tela: HTMLCanvasElement }> {
  const c = cantiere(a), t = c.t;
  for (let j = 0; j < t.ny; j += 10) { c.righe(j, Math.min(t.ny, j + 10)); await respiro(); }
  c.finisci();
  await respiro();
  const tela = document.createElement("canvas");
  tela.width = Math.round(W * scala); tela.height = Math.round(H * scala);
  const g = tela.getContext("2d")!;
  const img = g.createImageData(tela.width, tela.height);
  const fetta = Math.max(16, Math.round(40 / scala));
  for (let y = 0; y < tela.height; y += fetta) { pixel(t, scala, img.data, y, Math.min(tela.height, y + fetta)); await respiro(); }
  g.putImageData(img, 0, 0);
  g.scale(scala, scala);
  g.lineCap = "round"; g.lineJoin = "round";
  // la riva, una volta per riga della griglia (isolinee la chiede al centro di ogni cella, e dipende solo da y)
  const rive = Float64Array.from({ length: t.ny }, (_, j) => rivaX(j * t.passo + t.passo / 2));
  const riva = (y: number) => rive[Math.min(t.ny - 1, Math.max(0, Math.floor(y / t.passo)))];
  const terra = (x: number, y: number) => x < riva(y) - 1 && !nelLago(t, x, y);
  // le curve di livello: ogni 100 m, più marcate a 500 e a 1000; mai sull'acqua
  for (let q = 100; q <= 1100; q += 100) {
    const maestra = q % 500 === 0;
    segmenti(g, isolinee(t, t.quote, q, terra), maestra ? "rgba(122,80,45,.6)" : "rgba(122,80,45,.4)", maestra ? 0.95 : 0.6);
    if (q % 300 === 0) await respiro();
  }
  await respiro();
  // il mare: linee parallele alla riva, sempre più rade; la riva
  for (const [q, a] of [[-3, 0.55], [-8, 0.42], [-15, 0.3], [-26, 0.2], [-42, 0.1]] as const) segmenti(g, isolinee(t, t.quote, q, (x, y) => x > riva(y) - 2), `rgba(47,95,134,${a})`, 0.5);
  await respiro();
  g.beginPath();
  for (let y = -2; y <= 264; y += 1.5) { const x = rivaX(y); if (y === -2) g.moveTo(x, y); else g.lineTo(x, y); }
  g.strokeStyle = "rgba(40,86,130,.85)"; g.lineWidth = 0.8; g.stroke();
  // il lago: la riva e due linee d'acqua dentro
  if (t.diga) {
    const sud = (_: number, y: number) => y > t.diga!.y + 1;
    segmenti(g, isolinee(t, t.lago, 0, sud), "rgba(40,86,130,.85)", 0.7);
    segmenti(g, isolinee(t, t.lago, 0.1, sud), "rgba(52,96,140,.35)", 0.5);
    segmenti(g, isolinee(t, t.lago, 0.22, sud), "rgba(52,96,140,.2)", 0.5);
  }
  await respiro();
  // il torrente: il greto chiaro soltanto vicino al guado, poi il filo d'acqua, sottile, che si allarga verso valle
  const G = t.guado ?? { x: 0, y: 0 };
  for (let i = 0; i < t.fiume.length - 1; i++) {
    const q = t.fiume[i], r = t.fiume[i + 1], vicino = 1 - Math.min(1, Math.max(0, (Math.hypot(q.x - G.x, q.y - G.y) - 100) / 40));
    if (vicino <= 0) continue;
    g.strokeStyle = `rgba(232,224,200,${0.3 * vicino})`; g.lineWidth = 2.6; g.beginPath(); g.moveTo(q.x, q.y); g.lineTo(r.x, r.y); g.stroke();
  }
  const xF = t.fiume[t.fiume.length - 1].x;
  for (let i = 0; i < t.fiume.length - 1; i++) {
    const q = t.fiume[i], r = t.fiume[i + 1], k = Math.min(1, Math.max(0, (q.x - G.x) / (xF - G.x)));
    g.strokeStyle = `rgba(52,104,152,${q.x > 500 ? 0.75 : 1})`; g.lineWidth = k < 0.33 ? 0.85 : k < 0.66 ? 1 : 1.2;
    g.beginPath(); g.moveTo(q.x, q.y); g.lineTo(r.x, r.y); g.stroke();
  }
  for (let i = 0; i < t.emissario.length - 1; i++) {
    const q = t.emissario[i], r = t.emissario[i + 1];
    g.strokeStyle = "rgba(61,116,163,.75)"; g.lineWidth = 0.6 + (0.4 * i) / t.emissario.length;
    g.beginPath(); g.moveTo(q.x, q.y); g.lineTo(r.x, r.y); g.stroke();
  }
  // la diga: il muro, appena arcuato verso il lago, e i denti a valle
  if (t.diga) {
    const d = t.diga, cx = (d.x0 + d.x1) / 2, mezza = (d.x1 - d.x0) / 2;
    g.strokeStyle = "rgba(59,44,32,.9)"; g.lineWidth = 2.2;
    g.beginPath(); g.moveTo(d.x0, d.y + 2); g.quadraticCurveTo(cx, d.y - 3, d.x1, d.y + 1); g.stroke();
    g.lineWidth = 0.7;
    for (let x = d.x0 + 2; x < d.x1 - 1; x += 3.2) { const yy = d.y - 1 + Math.pow((x - cx) / mezza, 2) * 2.5; g.beginPath(); g.moveTo(x, yy - 1.5); g.lineTo(x, yy - 4); g.stroke(); }
  }
  // la ferrovia: il binario da cui il viaggiatore è arrivato, a traversine, che sbiadisce lontano dalla stazione
  if (t.ferrovia) {
    const f = t.ferrovia, p0 = f[0];
    linea(g, f); g.strokeStyle = "rgba(77,56,40,.85)"; g.lineWidth = 1.1; g.stroke();
    let s = 0;
    for (let i = 1; i < f.length; i++) {
      const a = f[i - 1], b = f[i], l = Math.hypot(b.x - a.x, b.y - a.y), nx = -(b.y - a.y) / l, ny = (b.x - a.x) / l;
      for (let u = Math.ceil(s / 5) * 5 - s; u < l; u += 5) {
        const x = a.x + ((b.x - a.x) * u) / l, y = a.y + ((b.y - a.y) * u) / l, lontano = Math.hypot(x - p0.x, y - p0.y);
        g.strokeStyle = `rgba(77,56,40,${lontano > 60 ? 0.5 : 0.85})`; g.lineWidth = 0.8;
        g.beginPath(); g.moveTo(x - nx * 1.3, y - ny * 1.3); g.lineTo(x + nx * 1.3, y + ny * 1.3); g.stroke();
      }
      s += l;
    }
    g.strokeStyle = "rgba(77,56,40,.9)"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(p0.x, p0.y - 3.5); g.lineTo(p0.x, p0.y + 3.5); g.stroke();
  }
  // i nomi stampati, pochi: quelli del trailer e il mare
  g.textAlign = "center"; g.textBaseline = "middle";
  const scrivi = (testo: string, x: number, y: number, font: string, colore: string, spaziatura: number, angolo = 0) => {
    g.save(); g.translate(x, y); g.rotate(angolo); g.font = font; g.fillStyle = colore;
    const lettere = [...testo], larghezze = lettere.map((c) => g.measureText(c).width + spaziatura);
    let cx = -larghezze.reduce((a, b) => a + b, 0) / 2 + spaziatura / 2;
    lettere.forEach((c, i) => { g.fillText(c, cx + larghezze[i] / 2 - spaziatura / 2, 0); cx += larghezze[i]; });
    g.restore();
  };
  scrivi("MARE", 1052, 66, "12px Lora, Georgia, serif", "rgba(47,95,134,.7)", 6.6);
  const tratto = t.fiume.filter((q) => q.x > 380 && q.x < 470);
  if (tratto.length > 2) {
    const a = tratto[0], b = tratto[tratto.length - 1], ang = Math.atan2(b.y - a.y, b.x - a.x);
    scrivi("Torrente Morto", (a.x + b.x) / 2 - Math.sin(ang) * 7, (a.y + b.y) / 2 - 7 * Math.cos(ang), "italic 9.5px Lora, Georgia, serif", "rgba(36,82,122,.85)", 0.6, ang);
  }
  scrivi("SERRA ALTA", SERRA_ALTA.x, SERRA_ALTA.y + 7, "9px Lora, Georgia, serif", "rgba(110,74,44,.75)", 2.7);
  return { t, tela };
}

/** Il sale: un tratteggio d'inchiostro a 30° esattamente dentro il lago della stampa (la stessa prova dei suoi pixel),
 *  trasparente fuori. */
function sale(t: Terreno, scala: number): HTMLCanvasElement | null {
  if (!t.diga) return null;
  const tela = document.createElement("canvas");
  tela.width = Math.round(W * scala); tela.height = Math.round(H * scala);
  const g = tela.getContext("2d")!;
  g.save(); g.scale(scala, scala);
  g.strokeStyle = "rgba(45,34,22,.32)"; g.lineWidth = 0.8;
  const k = Math.tan(Math.PI / 6);
  g.beginPath();
  for (let c = -H / k; c < W; c += 7) { g.moveTo(c, H); g.lineTo(c + H / k, 0); }
  g.stroke(); g.restore();
  // la maschera: opaca dove la stampa dipinge il lago, pixel per pixel; il tratteggio resta solo lì
  const maschera = g.createImageData(tela.width, tela.height), m = maschera.data;
  for (let py = 0; py < tela.height; py++) {
    const y = (py + 0.5) / scala;
    if (y <= t.diga.y + 1) continue;
    for (let px = 0; px < tela.width; px++) if (nelLago(t, (px + 0.5) / scala, y)) m[(py * tela.width + px) * 4 + 3] = 255;
  }
  const forma = document.createElement("canvas");
  forma.width = tela.width; forma.height = tela.height;
  forma.getContext("2d")!.putImageData(maschera, 0, 0);
  g.globalCompositeOperation = "destination-in";
  g.drawImage(forma, 0, 0);
  return tela;
}

/** La stampa per questi ancoraggi e questa scala: dalla memoria, o preparata in un momento libero. */
export function preparaStampa(a: AncoreTerreno, scala: number): Promise<Stampa> {
  const chiave = chiaveDi(a, scala);
  let p = memoria.get(chiave);
  if (!p) {
    p = new Promise<Stampa>((ok, ko) => quandoLibero(() => {
      dipingi(a, scala).then(async ({ t, tela }) => {
        await respiro();
        const s = sale(t, scala);
        const [url, sl] = await Promise.all([comeUrl(tela), s ? comeUrl(s) : Promise.resolve(null)]);
        pronte.set(chiave, { url, sale: sl });
        ok({ url, sale: sl });
      }).catch(ko);
    }));
    // un errore (la memoria, una tela che non si apre) non resta per tutta la sessione: la prossima volta si riprova
    p.catch(() => memoria.delete(chiave));
    memoria.set(chiave, p);
  }
  return p;
}

/** La stampa (null finché non è pronta, o se non serve: contrasto alto, carta senza tappe) e se è arrivata a mappa già
 *  aperta: solo allora entra con una dissolvenza, una volta. Pronta da prima, c'è dal primo istante. */
export function useStampa(a: AncoreTerreno | null, scala: number): { stampa: Stampa | null; tardiva: boolean } {
  const [stampa, setStampa] = useState<Stampa | null>(() => (a ? pronte.get(chiaveDi(a, scala)) ?? null : null));
  const [tardiva, setTardiva] = useState(false);
  useEffect(() => {
    if (!a) { setStampa(null); return; }
    const gia = pronte.get(chiaveDi(a, scala));
    if (gia) { setStampa(gia); return; }
    let vivo = true, t = 0;
    preparaStampa(a, scala).then((s) => {
      if (!vivo) return;
      setStampa(s); setTardiva(true);
      t = window.setTimeout(() => setTardiva(false), 400);
    }, (e) => console.warn("La stampa della mappa non si è potuta preparare:", e));
    return () => { vivo = false; window.clearTimeout(t); };
  }, [a, scala]);
  return { stampa, tardiva };
}

/** I pixel per unità della stampa: due con la grafica «alta», o «automatica» su uno schermo fitto; se no uno. */
export const scalaStampa = (qualita: string) =>
  (qualita === "alta" || (qualita === "automatica" && typeof window !== "undefined" && window.devicePixelRatio >= 1.5) ? 2 : 1);

/** Con la mappa in bisaccia, si prepara tutto in anticipo, in momenti liberi (la disposizione, e la stampa se serve):
 *  aprirla, poi, non costa niente. */
export function preparaInAnticipo(carta: Carta, zonaDi: (id: string) => string | undefined, qualita: string, alto: boolean) {
  quandoLibero(() => {
    const a = ancoreTerreno(disposizione(carta, zonaDi));
    if (a && !alto) preparaStampa(a, scalaStampa(qualita)).catch(() => {});
  });
}
