// ====================================================================
//  La stampa della mappa: la carta fisica della provincia, com'era prima della secca.
// --------------------------------------------------------------------
//  Funzioni pure, come foglio.ts: niente DOM, solo tipi importati. Il disegno
//  (la tela, l'immagine) lo fa stampa.ts; il collaudo (collaudo/mappa.py) prova
//  questa logica dentro Node.
//
//  Il rilievo è un modello, non un disegno a mano: una provincia che sale da est
//  (la piana, il mare) verso ovest (il paese, le colline), una dorsale di colline
//  con la sua sella, un torrente che la costeggia e passa al guado, il lago
//  dell'invaso dietro la sua diga, ancora pieno (la carta è stampata prima della
//  secca: la conca, il fondale, il relitto e la torre di presa stanno sotto
//  l'acqua). Si ancora soltanto alle tappe del viaggio, ai punti di mezzo fra due
//  tappe, al fondo dell'invaso e alla stazione (`AncoreTerreno`, da foglio.ts):
//  se l'avventura cambia, la carta la segue. Nessuna strada è stampata: le
//  strade sono della mano.
//
//  Il modello e i suoi numeri vengono dal prototipo del progetto della mappa
//  (sviluppo/diario, 30/10/2026), con le correzioni dei due critici: rumore che
//  non si allinea alla griglia, riva del lago senza cresta, crinale obliquo,
//  ombra mai sotto 0,74, torrente sottile.
// ====================================================================
import type { AncoreTerreno, Punto } from "./foglio";

/** Cambia quando cambia il disegno della stampa: la memoria della stampa (stampa.ts) la usa nella sua chiave. */
export const VERSIONE_TERRENO = 1;
const W = 1092, H = 481;
/** Il passo della griglia delle quote, in unità del foglio. */
export const PASSO = 4;
/** Il livello del lago, in metri. */
export const LIVELLO = 150;

type P = { x: number; y: number };
const clamp = (x: number, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const smooth = (a: number, b: number, x: number) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };

// ── il rumore: value noise su un reticolo, ottave ruotate (niente bozzi allineati alla griglia) ──
function lat(ix: number, iy: number, seme: number): number {
  let h = (Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + Math.imul(seme, 1274126177)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return ((h >>> 0) / 4294967296) * 2 - 1;
}
function vn(x: number, y: number, seme: number): number {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const a = lat(ix, iy, seme), b = lat(ix + 1, iy, seme), c = lat(ix, iy + 1, seme), d = lat(ix + 1, iy + 1, seme);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
const COS = Array.from({ length: 8 }, (_, i) => Math.cos(0.5 * i)), SIN = Array.from({ length: 8 }, (_, i) => Math.sin(0.5 * i));
export function fbm(x: number, y: number, seme: number, ottave = 4): number {
  let s = 0, a = 1, n = 0, f = 1;
  for (let i = 0; i < ottave; i++) {
    const c = COS[i], sn = SIN[i];
    s += a * vn((x * c - y * sn) * f, (x * sn + y * c) * f, seme + i * 7);
    n += a; a *= 0.5; f *= 2.07;
  }
  return s / n;
}

// ── le linee: Catmull-Rom, il meandro, la distanza ───────────────────────────
function catmull(pts: P[], passi: number): P[] {
  const out: P[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let s = i ? 1 : 0; s <= passi; s++) {
      const u = s / passi, u2 = u * u, u3 = u2 * u;
      const cr = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
      out.push({ x: cr(p0.x, p1.x, p2.x, p3.x), y: cr(p0.y, p1.y, p2.y, p3.y) });
    }
  }
  return out;
}
/** Un'ondulazione lungo il corso, nulla vicino al punto `quieto` (il guado: lì il torrente passa pulito sotto la strada). */
function meandra(pts: P[], amp: number, seme: number, quieto: P | null): P[] {
  let s = 0;
  return pts.map((q, i) => {
    if (i) s += Math.hypot(q.x - pts[i - 1].x, q.y - pts[i - 1].y);
    const a = pts[Math.min(i + 1, pts.length - 1)], b = pts[Math.max(i - 1, 0)];
    const tx = a.x - b.x, ty = a.y - b.y, tl = Math.hypot(tx, ty) || 1;
    const calma = quieto ? smooth(8, 40, Math.hypot(q.x - quieto.x, q.y - quieto.y)) : 1;
    const o = amp * fbm(s / 38, 0.5, seme, 3) * calma;
    return { x: q.x - (ty / tl) * o, y: q.y + (tx / tl) * o };
  });
}
/** La distanza da una spezzata e la x del punto più vicino (serve al profilo del letto). */
function distanza(pts: P[], x: number, y: number): { d: number; x: number } {
  let best = 1e18, bx = pts[0].x;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], vx = b.x - a.x, vy = b.y - a.y, l2 = vx * vx + vy * vy || 1;
    const t = clamp(((x - a.x) * vx + (y - a.y) * vy) / l2), qx = a.x + vx * t - x, qy = a.y + vy * t - y, d = qx * qx + qy * qy;
    if (d < best) { best = d; bx = a.x + vx * t; }
  }
  return { d: Math.sqrt(best), x: bx };
}
const scatola = (pts: P[], m: number) => ({
  x0: Math.min(...pts.map((q) => q.x)) - m, x1: Math.max(...pts.map((q) => q.x)) + m,
  y0: Math.min(...pts.map((q) => q.y)) - m, y1: Math.max(...pts.map((q) => q.y)) + m,
});

// ── la costa: il mare nell'angolo in alto a destra ───────────────────────────
const COSTA: readonly [number, number][] = [[-10, 930], [20, 937], [60, 955], [96, 972], [118, 978], [150, 990], [190, 1016], [232, 1052], [262, 1104]];
/** La x della riva a una data altezza (oltre la punta sud non c'è mare). */
export function rivaX(y: number): number {
  if (y >= 262) return 1e9;
  let i = 0;
  while (i < COSTA.length - 2 && y > COSTA[i + 1][0]) i++;
  const [y0, x0] = COSTA[i], [y1, x1] = COSTA[i + 1];
  return lerp(x0, x1, (y - y0) / (y1 - y0)) + 13 * fbm(y / 30, 3.3, 91, 4) + 18 * Math.exp(-(((y - 190) / 22) ** 2));
}

export interface Terreno {
  passo: number;
  nx: number;
  ny: number;
  /** le quote sui nodi della griglia, in metri (sotto il mare negative) */
  quote: Float32Array;
  /** il campo del lago sui nodi: > 0 è acqua */
  lago: Float32Array;
  /** il torrente, da ovest alla foce; l'emissario, dalla diga al mare; la diga; la ferrovia (dalla stazione verso est) */
  fiume: P[];
  emissario: P[];
  diga: { x0: number; x1: number; y: number } | null;
  ferrovia: P[] | null;
  /** il guado: dove il torrente passa sotto la strada */
  guado: P | null;
  /** l'ombra e la macchiatura sui nodi (le calcola `finisci`) */
  ombra: Float32Array;
  macchia: Float32Array;
  ms: number;
}

const ora = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

/** Il modello del terreno, ancorato alle tappe, da riempire a fette: `righe(j0, j1)` calcola le righe della griglia da j0 a
 *  j1 (escluso), `finisci()` l'ombra e la macchiatura. Così chi dipinge può cedere il passo fra una fetta e l'altra. */
export function cantiere(a: AncoreTerreno): { t: Terreno; righe: (j0: number, j1: number) => void; finisci: () => void } {
  let ms = 0;
  const p = (q: Punto | null): P | null => (q ? { x: q.cx, y: q.cy } : null);
  const S = p(a.sella)!, PIA = p(a.pianoro)!, PZ = p(a.piazzetta)!, M = p(a.crinale)!, G = p(a.guado)!;
  const DG = p(a.diga), ST = p(a.stazione);
  // il torrente: dall'orlo ovest, mezzo passo a nord del guado, poi verso est fino alla foce
  const F0 = { x: G.x, y: G.y - 18.75 };
  const foce = { x: rivaX(112) + 2, y: 112 };
  const fiume = meandra(catmull([{ x: -20, y: F0.y - 3 }, { x: 40, y: F0.y - 4 }, F0, { x: F0.x + 90, y: F0.y + 10 }, { x: F0.x + 230, y: F0.y + 30 },
    { x: F0.x + 400, y: F0.y + 48 }, { x: F0.x + 560, y: F0.y + 50 }, { x: F0.x + 700, y: F0.y + 38 }, { x: foce.x - 60, y: foce.y + 8 }, foce], 16), 9, 41, F0);
  const xG = F0.x, xF = foce.x;
  const lettoFiume = (x: number) => (x <= xG ? 350 + (xG - x) * 0.6 : 350 * Math.pow(clamp((xF - x) / (xF - xG)), 2));
  const fiumeY = (() => {
    const m = new Float32Array(W + 1);
    for (let x = 0; x <= W; x++) { let best = 1e9, by = 0; for (const q of fiume) { const d = Math.abs(q.x - x); if (d < best) { best = d; by = q.y; } } m[x] = by; }
    return (x: number) => m[Math.round(clamp(x, 0, W))];
  })();
  // la diga e il lago: il muro appena a sud del suo luogo (la diga è il coronamento, all'asciutto), il lago a sud del muro,
  // gocce sul fondo dell'invaso
  const diga = DG ? { x0: DG.x - 16, x1: DG.x + 18, y: DG.y + 6 } : null;
  const fondi = a.fondo.map((q) => ({ x: q.cx, y: q.cy, r: 34 }));
  if (DG && fondi.length) {
    fondi.push({ x: DG.x + 4, y: DG.y + 17, r: 15 });
    const sud = a.fondo.reduce((m, q) => (q.cy > m.cy ? q : m)), ovest = a.fondo.reduce((m, q) => (q.cx < m.cx ? q : m));
    fondi.push({ x: sud.cx + 18, y: H + 30, r: 46 });                 // il braccio che esce dal foglio, verso sud
    fondi.push({ x: ovest.cx - 34, y: ovest.cy + 30, r: 22 });        // un braccio a sud-ovest
  }
  const campoLago = (x: number, y: number) => {
    if (!diga || !fondi.length) return -1;
    if (y < diga.y) return -1 - (diga.y - y) * 0.01;
    let f = 0;
    for (const c of fondi) f += Math.exp(-((x - c.x) ** 2 + (y - c.y) ** 2) / (c.r * c.r));
    return f - 0.55 + 0.12 * fbm(x / 22, y / 22, 77, 3);
  };
  // l'emissario: dallo sfioratore della diga verso nord-est, al mare
  const sfioro = diga ? { x: diga.x1 - 3, y: diga.y - 2 } : null;
  const emissario = sfioro ? meandra(catmull([sfioro, { x: sfioro.x + 34, y: sfioro.y - 40 }, { x: sfioro.x + 120, y: sfioro.y - 78 }, { x: sfioro.x + 250, y: sfioro.y - 92 },
    { x: sfioro.x + 380, y: sfioro.y - 96 }, { x: rivaX(232) + 2, y: 232 }], 16), 7, 57, sfioro) : [];
  const xS = sfioro?.x ?? 0, xE = rivaX(232);
  const lettoEmissario = (x: number) => 112 * Math.pow(clamp((xE - x) / (xE - xS)), 1.3);
  const bF = scatola(fiume, 135), bE = emissario.length ? scatola(emissario, 50) : null;

  const quota = (x: number, y: number): number => {
    // 1. la pendenza della provincia: alta a ovest, bassa a est
    let e = 30 + 290 * Math.pow(clamp((1010 - x) / 1010), 1.35);
    // 2. le colline: una dorsale est-ovest per la sella, con due cime
    const cresta = 765 + 290 * Math.exp(-(((x - (S.x - 92)) / 48) ** 2)) + 130 * Math.exp(-(((x - (S.x + 108)) / 52) ** 2));
    const lungo = x < S.x + 150 ? 1 : Math.exp(-(((x - S.x - 150) / 150) ** 2));
    const dy = y - S.y, sig = dy < 0 ? 44 : 78;
    e = lerp(e, cresta, lungo * Math.exp(-((dy / sig) ** 2)));
    // 3. il pianoro: un ripiano
    const dp = Math.hypot(x - PIA.x, (y - PIA.y) * 1.3);
    e = lerp(e, 640, Math.exp(-((dp / 26) ** 2)) * 0.85);
    // 4. il colle del paese (centrato appena a nord della piazzetta)
    e += 55 * Math.exp(-(((x - PZ.x) ** 2 + (y - PZ.y + 10) ** 2) / 2600));
    // 5. oltre il torrente, a nord: le alture di Acquamorta, che calano verso est
    const fy = fiumeY(x);
    if (y < fy) e += (190 - 0.17 * x) * smooth(0, 70, fy - y) * clamp(1 - x / 900);
    // 6. i rilievi delle zone vuote: la Serra Alta, il Colle Nudo, le alture a nord
    e += 230 * Math.exp(-(((x - 500) / 130) ** 2 + ((y - 215) / 44) ** 2));
    e += 120 * Math.exp(-(((x - 770) / 90) ** 2 + ((y - 205) / 36) ** 2));
    e += 90 * Math.exp(-(((x - 640) / 160) ** 2 + ((y - 40) / 40) ** 2));
    // 7. il crinale fra la piana e l'invaso, obliquo (da nord-est a sud-ovest)
    { const u = (x - M.x) * 0.866 + (y - M.y) * 0.5, v = -(x - M.x) * 0.5 + (y - M.y) * 0.866; e += 60 * Math.exp(-((u / 30) ** 2) - ((v / 38) ** 2)); }
    // 8. l'asprezza: il colle è aspro, la piana liscia
    const asprezza = 0.2 + 0.8 * smooth(120, 650, e);
    e += asprezza * (85 * fbm(x / 90, y / 90, 11, 5) + 30 * (0.3 - Math.abs(fbm(x / 64, y / 64, 23, 4))));
    // 9. il torrente scava la sua valle (le rive non scendono sotto il letto)
    if (x > bF.x0 && x < bF.x1 && y > bF.y0 && y < bF.y1) {
      const df = distanza(fiume, x, y), largo = 20 + 24 * clamp((x - xG) / (xF - xG));
      const letto = lettoFiume(df.x), kf = 1 - Math.exp(-((df.d / largo) ** 2));
      e = lerp(letto + Math.max(0, e - letto) * kf + 14 * kf, e, smooth(2 * largo, 3 * largo, df.d));
    }
    // 9b. l'emissario scava la sua
    if (bE && x > bE.x0 && x < bE.x1 && y > bE.y0 && y < bE.y1) {
      const de = distanza(emissario, x, y), le = lettoEmissario(de.x), ke = 1 - Math.exp(-((de.d / 16) ** 2));
      e = lerp(le + Math.max(0, e - le) * ke + 8 * ke, e, smooth(32, 48, de.d));
    }
    // 10. la conca dell'invaso: dentro il lago il fondo scende; attorno la riva risale, senza cresta; a valle della diga il terreno cala
    const g = campoLago(x, y);
    if (g > 0) e = LIVELLO - 8 - 70 * Math.min(g, 0.6);
    else if (diga && y >= diga.y) e = Math.max(e, lerp(LIVELLO + 2, e, smooth(0, 0.35, -g)));
    else if (diga) {
      const w = smooth(diga.x0 - 80, diga.x0 - 30, x) * (1 - smooth(diga.x1 + 40, diga.x1 + 100, x));
      e = lerp(e, Math.min(e, lerp(118, e, smooth(0, 60, diga.y - y))), w);
    }
    // 11. la costa: la terra scende al mare
    const dc = rivaX(y) - x;
    return dc > 0 ? e * smooth(0, 130, dc) + 1.5 : dc * 0.9 - 2;
  };

  const nx = Math.ceil(W / PASSO) + 1, ny = Math.ceil(H / PASSO) + 1;
  const quote = new Float32Array(nx * ny), lago = new Float32Array(nx * ny);
  const ferrovia = ST ? catmull([{ x: ST.x + 9, y: ST.y + 1 }, { x: ST.x + 46, y: ST.y + 6 }, { x: ST.x + 92, y: ST.y + 22 }, { x: W + 10, y: ST.y + 36 }], 18) : null;
  const t: Terreno = { passo: PASSO, nx, ny, quote, lago, fiume, emissario, diga, ferrovia, guado: F0,
    ombra: new Float32Array(nx * ny), macchia: new Float32Array(nx * ny), ms: 0 };
  return {
    t,
    righe(j0, j1) {
      const t0 = ora();
      for (let j = j0; j < j1; j++) for (let i = 0; i < nx; i++) {
        quote[j * nx + i] = quota(i * PASSO, j * PASSO);
        lago[j * nx + i] = campoLago(i * PASSO, j * PASSO);
      }
      ms += ora() - t0;
    },
    finisci() {
      const t0 = ora();
      ombre(t);
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) t.macchia[j * nx + i] = 1 + 0.05 * fbm((i * PASSO) / 60, (j * PASSO) / 60, 3, 2);
      t.ms = ms + ora() - t0;
    },
  };
}

/** Il terreno intero, tutto d'un fiato (per i collaudi, e per chi non ha fretta). */
export function terreno(a: AncoreTerreno): Terreno {
  const c = cantiere(a);
  c.righe(0, c.t.ny);
  c.finisci();
  return c.t;
}

/** Un valore della griglia in un punto qualunque (bilineare). */
export function campione(t: Terreno, campo: Float32Array, x: number, y: number): number {
  const gx = clamp(x / t.passo, 0, t.nx - 1.001), gy = clamp(y / t.passo, 0, t.ny - 1.001);
  const i = Math.floor(gx), j = Math.floor(gy), fx = gx - i, fy = gy - j;
  const n = t.nx;
  return lerp(lerp(campo[j * n + i], campo[j * n + i + 1], fx), lerp(campo[(j + 1) * n + i], campo[(j + 1) * n + i + 1], fx), fy);
}
export const quotaIn = (t: Terreno, x: number, y: number) => campione(t, t.quote, x, y);
export const nelLago = (t: Terreno, x: number, y: number) => campione(t, t.lago, x, y) > 0 && (!t.diga || y > t.diga.y + 1);
export const nelMare = (x: number, y: number) => x > rivaX(y);

// ── le tinte ─────────────────────────────────────────────────────────────────
/** Le fasce altimetriche, già fuse con la carta: verde in pianura, ocra e bruno in collina. */
export const FASCE: readonly [number, string][] = [
  [0, "#a2af76"], [50, "#b1b67b"], [100, "#c0bd82"], [200, "#cdbf85"], [300, "#d2bb7d"], [500, "#cfae6f"], [700, "#c69e63"], [900, "#c49a66"],
];
export const ACQUA = { lago: "#a8c2c2", mare: ["#adc6c3", "#a1bcbb", "#93b1b3"] } as const;
const rgb = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const FASCE_RGB = FASCE.map(([q, c]) => [q, rgb(c)] as const);
const LAGO_RGB = rgb(ACQUA.lago), MARE_RGB = ACQUA.mare.map(rgb), BISTRO = [92, 70, 62], LUCE = [246, 239, 220];

/** L'ombra sui nodi: luce da nord-ovest, alta 45°, rilievo esagerato cinque volte. Fra 0,74 (in ombra) e 1,08 (in luce). */
function ombre(t: Terreno) {
  const { nx, ny, quote } = t, out = t.ombra;
  const l = [-0.5, -0.5, 0.7071];
  const k = 5 / (40 * 2 * t.passo);                                    // 1 unità = 40 m, differenze centrali su due passi
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const q = (a: number, b: number) => quote[clamp(b, 0, ny - 1) * nx + clamp(a, 0, nx - 1)];
    const dzx = (q(i + 1, j) - q(i - 1, j)) * k, dzy = (q(i, j + 1) - q(i, j - 1)) * k;
    const n = Math.hypot(dzx, dzy, 1), s = (-dzx * l[0] - dzy * l[1] + l[2]) / n;
    out[j * nx + i] = clamp(1 + (0.4 * (s - 0.7071)) / 0.7071, 0.74, 1.08);
  }
}

/** I pixel della stampa (RGBA), a `scala` pixel per unità: tinte, ombra, acque, macchiatura. Riempie le righe da y0 a y1
 *  (escluso) di `out`, largo W·scala; senza `out` le fa tutte. */
export function pixel(t: Terreno, scala: number, out?: Uint8ClampedArray, y0 = 0, y1?: number): Uint8ClampedArray {
  const w = Math.round(W * scala), h = Math.round(H * scala);
  out ??= new Uint8ClampedArray(w * h * 4);
  y1 ??= h;
  const { nx, ny, passo, quote, lago, ombra, macchia } = t;
  // per colonna: la cella e il peso orizzontale
  const ci = new Int32Array(w), cf = new Float32Array(w);
  for (let px = 0; px < w; px++) { const g = clamp((px + 0.5) / scala / passo, 0, nx - 1.001); ci[px] = Math.floor(g); cf[px] = g - ci[px]; }
  const lagoY = t.diga ? t.diga.y + 1 : Infinity;
  for (let py = y0; py < y1; py++) {
    const y = (py + 0.5) / scala, riva = rivaX(y);
    const gy = clamp(y / passo, 0, ny - 1.001), j = Math.floor(gy), fy = gy - j;
    for (let px = 0; px < w; px++) {
      const x = (px + 0.5) / scala, o = (py * w + px) * 4, fx = cf[px], k0 = j * nx + ci[px], k1 = k0 + nx;
      const w00 = (1 - fx) * (1 - fy), w10 = fx * (1 - fy), w01 = (1 - fx) * fy, w11 = fx * fy;
      const bil = (c: Float32Array) => c[k0] * w00 + c[k0 + 1] * w10 + c[k1] * w01 + c[k1 + 1] * w11;
      const e = bil(quote), m = bil(macchia);
      let c: readonly number[], f = 1;
      if (x > riva) c = e > -20 ? MARE_RGB[0] : e > -50 ? MARE_RGB[1] : MARE_RGB[2];
      else if (y > lagoY && bil(lago) > 0) c = LAGO_RGB;
      else {
        let b = 0;
        while (b < FASCE_RGB.length - 1 && e >= FASCE_RGB[b + 1][0]) b++;
        c = FASCE_RGB[b][1];
        f = bil(ombra);
      }
      for (let i = 0; i < 3; i++) {
        const v = f < 1 ? c[i] * f + BISTRO[i] * (1 - f) : c[i] + (LUCE[i] - c[i]) * 3 * (f - 1);
        out[o + i] = v * m;
      }
      out[o + 3] = 255;
    }
  }
  return out;
}

/** Le isolinee di un campo della griglia (marching squares), come segmenti [x0, y0, x1, y1, …] in unità del foglio.
 *  `dove` esclude le celle (per esempio l'acqua, per le curve di livello). */
export function isolinee(t: Terreno, campo: Float32Array, livello: number, dove?: (x: number, y: number) => boolean): number[] {
  const out: number[] = [];
  const { nx, ny, passo } = t;
  for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
    const x = i * passo, y = j * passo;
    if (dove && !dove(x + passo / 2, y + passo / 2)) continue;
    const a = campo[j * nx + i], b = campo[j * nx + i + 1], c = campo[(j + 1) * nx + i + 1], d = campo[(j + 1) * nx + i];
    const k = (a > livello ? 8 : 0) | (b > livello ? 4 : 0) | (c > livello ? 2 : 0) | (d > livello ? 1 : 0);
    if (k === 0 || k === 15) continue;
    const u = (p: number, q: number) => (livello - p) / (q - p || 1e-6);
    const N = [x + u(a, b) * passo, y], E = [x + passo, y + u(b, c) * passo], S = [x + u(d, c) * passo, y + passo], O = [x, y + u(a, d) * passo];
    const s = (p: number[], q: number[]) => out.push(p[0], p[1], q[0], q[1]);
    switch (k) {
      case 1: case 14: s(O, S); break;
      case 2: case 13: s(S, E); break;
      case 3: case 12: s(O, E); break;
      case 4: case 11: s(N, E); break;
      case 5: s(O, N); s(S, E); break;
      case 6: case 9: s(N, S); break;
      case 7: case 8: s(O, N); break;
      case 10: s(O, S); s(N, E); break;
    }
  }
  return out;
}

/** Il punto più vicino di un tracciato a un'altra linea: serve al collaudo (il torrente taglia soltanto la strada del guado). */
export function taglia(linea: P[], tracciato: Punto[]): boolean {
  const o = (a: P, b: P, c: P) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  for (let i = 0; i < linea.length - 1; i++) for (let j = 0; j < tracciato.length - 1; j++) {
    const p = linea[i], q = linea[i + 1], r = { x: tracciato[j].cx, y: tracciato[j].cy }, s = { x: tracciato[j + 1].cx, y: tracciato[j + 1].cy };
    if (o(r, s, p) * o(r, s, q) < 0 && o(p, q, r) * o(p, q, s) < 0) return true;
  }
  return false;
}
