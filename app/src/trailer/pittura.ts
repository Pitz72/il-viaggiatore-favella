// ====================================================================
//  Pittura condivisa dalle scene: cielo, luce, nuvole, crinali, particelle.
//  Le parti pesanti (nuvole, catene di monti) si dipingono una volta sola
//  in tele precalcolate; a ogni fotogramma restano solo copie e qualche
//  bagliore.
// ====================================================================
import { W, H } from "./scaletta";
import { clamp, lerp, rng, rgba } from "./tempo";
import {
  creaTela, ctxDi, fbm, fbmPeriodico, hexRgb, mescola, perlin, riempi, rgbCss, sfoca, smooth,
  type RGB, type Tela,
} from "./texture";

export type C2D = CanvasRenderingContext2D;

/** Riempie con un gradiente verticale a più fermate. */
export function cielo(ctx: C2D, stops: [number, string][], y0 = 0, y1 = H) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  stops.forEach(([p, c]) => g.addColorStop(p, c));
  ctx.fillStyle = g;
  ctx.fillRect(-200, y0, W + 400, y1 - y0);
}

/** Un alone di luce (da usare con 'lighter'). */
export function alone(ctx: C2D, x: number, y: number, r: number, colore: string, a: number, schiacciato = 1) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(1, schiacciato);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
  g.addColorStop(0, rgba(colore, a));
  g.addColorStop(0.3, rgba(colore, a * 0.42));
  g.addColorStop(0.65, rgba(colore, a * 0.1));
  g.addColorStop(1, rgba(colore, 0));
  ctx.fillStyle = g;
  ctx.fillRect(-r, -r, r * 2, r * 2);
  ctx.restore();
}

// --------------------------------------------------------------------
//  Raggi di luce dai bordi morbidi: uno spicchio dall'apice, dissolto verso la fine e sfocato ai lati, dipinto
//  UNA volta (a mezza risoluzione: è morbido) e copiato a ogni fotogramma con l'opacità che «respira». Uno spicchio
//  tracciato a ogni fotogramma con un gradiente radiale ha i lati netti, come ritagliati, accanto a nuvole morbide.
// --------------------------------------------------------------------
export interface RaggioMorbido { tela: Tela; pad: number; hh: number; scala: number }

export function raggioMorbido(lung: number, w2: number, partenza: number, fine: number, colore: string, scala = 0.5, sfumatura = 2.5): RaggioMorbido {
  const pad = 26;
  const semi = lung * Math.sin(w2) * scala;
  const hh = Math.ceil(semi) + pad, L = Math.ceil(lung * Math.cos(w2) * scala);
  const t = creaTela(L + pad * 2, hh * 2), g = ctxDi(t);
  const gr = g.createLinearGradient(pad + partenza * scala, 0, pad + fine * scala, 0);
  gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(pad, hh); g.lineTo(pad + L, hh - semi); g.lineTo(pad + L, hh + semi); g.closePath(); g.fill();
  g.globalCompositeOperation = "source-in";
  g.fillStyle = colore; g.fillRect(0, 0, t.width, t.height);
  return { tela: sfoca(t, sfumatura), pad, hh, scala };
}

/** Copia un raggio dal punto (0, 0) già traslato, nella direzione `ang`, con l'opacità `alfa`. */
export function disegnaRaggio(ctx: C2D, r: RaggioMorbido, ang: number, alfa: number) {
  ctx.save();
  ctx.rotate(ang); ctx.globalAlpha = alfa;
  ctx.drawImage(r.tela, -r.pad / r.scala, -r.hh / r.scala, r.tela.width / r.scala, r.tela.height / r.scala);
  ctx.restore();
}

export function camera(ctx: C2D, scala: number, cx = W / 2, cy = H / 2, dx = 0, dy = 0) {
  ctx.translate(cx + dx, cy + dy);
  ctx.scale(scala, scala);
  ctx.translate(-cx, -cy);
}

/** Pulviscolo che galleggia nella luce: puntini morbidi, ognuno col suo ritmo. */
export function pulviscolo(ctx: C2D, t: number, seme: number, n: number, zona: { x: number; y: number; w: number; h: number }, colore: string, forza: number, dimMax = 2.6) {
  const r = rng(seme);
  for (let i = 0; i < n; i++) {
    const bx = r(), by = r(), vel = 5 + r() * 15, fase = r() * 10, dim = 0.7 + r() * dimMax;
    const x = zona.x + ((bx * zona.w + t * vel) % zona.w);
    const y = zona.y + by * zona.h + Math.sin(t * 0.6 + fase) * 12;
    const a = forza * (0.2 + 0.8 * (0.5 + 0.5 * Math.sin(t * 1.3 + fase * 3)));
    const g = ctx.createRadialGradient(x, y, 0, x, y, dim * 2.4);
    g.addColorStop(0, rgba(colore, a * 0.75)); g.addColorStop(1, rgba(colore, 0));
    ctx.fillStyle = g;
    ctx.fillRect(x - dim * 2.4, y - dim * 2.4, dim * 4.8, dim * 4.8);
  }
}

// --------------------------------------------------------------------
//  Nuvole: densità da rumore stirato, luce dal lato del sole.
// --------------------------------------------------------------------
export interface OpzioniNuvole {
  seme: number;
  w: number; h: number;          // dimensione della tela (poi si stira)
  scalaX: number; scalaY: number; // quanto il rumore è allungato
  copertura: number;             // 0..1: quanto cielo coprono
  morbidezza: number;            // larghezza della soglia
  sole: [number, number];        // direzione da cui arriva la luce (dx, dy)
  chiaro: string; scuro: string; // colore illuminato e in ombra
  alto?: number;                 // 0..1: dissolvenza verso l'alto della tela
  basso?: number;                // dissolvenza verso il basso
}

/** Tela RGBA di nuvole che si ripete in orizzontale. `scalaX` = di quanto le forme sono più larghe che alte. */
export async function nuvole(o: OpzioniNuvole): Promise<Tela> {
  const per = Math.max(2, Math.round(o.w / 240));                 // forme lungo la larghezza (intero: la tela si salda)
  const n = fbmPeriodico(o.seme, per, 5);
  const chiaro = hexRgb(o.chiaro), scuro = hexRgb(o.scuro);
  const [sx, sy] = o.sole;
  const passo = 9;
  // La torsione legge il rumore a u·0,7, che non ha il periodo della tela: a destra e a sinistra valeva due
  // cose diverse e la tessera, ripetendosi, si saldava con un gradino (la densità saltava di un fattore 10).
  // Nell'ultimo 30 % della larghezza la si porta, con una curva dolce, al valore che ha all'inizio: la tessera
  // si salda, il resto del cielo resta com'era.
  const torsioneBase = (u: number, v: number) => n(u * 0.7, v * 0.7 + 3.1) * 0.35;
  const fascia = per * 0.3;
  const torsione = (u: number, v: number) => {
    const a = torsioneBase(u, v);
    if (u <= per - fascia) return a;
    return a + (torsioneBase(u - per, v) - a) * smooth(per - fascia, per, u);
  };
  const dens = (x: number, y: number) => {
    const u = (x / o.w) * per;
    const v = (y * per * o.scalaX) / o.w * o.scalaY;
    // un poco di torsione: le nuvole vere non sono righe parallele
    const t = torsione(u, v);
    return smooth(1 - o.copertura - o.morbidezza, 1 - o.copertura + o.morbidezza, n(u + t * 0.3, v + t) * 0.5 + 0.5);
  };
  return await riempi(o.w, o.h, (x, y, px) => {
    const vv = y / o.h;
    let taglio = 1;
    if (o.alto !== undefined) taglio *= smooth(0, o.alto, vv);
    if (o.basso !== undefined) taglio *= 1 - smooth(1 - o.basso, 1, vv);
    if (taglio <= 0.002) { px[3] = 0; return; }
    const d0 = dens(x, y);
    if (d0 <= 0.002) { px[3] = 0; return; }
    const d1 = dens(x + sx * passo, y + sy * passo);
    const d2 = dens(x + sx * passo * 3, y + sy * passo * 3);
    // luce: dove verso il sole la densità cala, la nuvola è illuminata
    const lit = clamp(0.30 + (d0 - d1) * 3.2 + (d0 - d2) * 1.4 + (1 - d0) * 0.45);
    const col = mescola(scuro, chiaro, lit);
    px[0] = col[0]; px[1] = col[1]; px[2] = col[2];
    px[3] = d0 * taglio * 255;
  });
}

/** Disegna una tela di nuvole che scorre in orizzontale. */
export function nuvoleScorrono(ctx: C2D, tela: Tela, x: number, y: number, larghezza: number, altezza: number, scorri: number, alpha = 1) {
  const off = ((scorri % larghezza) + larghezza) % larghezza;
  ctx.save();
  ctx.globalAlpha = alpha;
  for (let px = off - larghezza; px < W + 200; px += larghezza) ctx.drawImage(tela, px + x, y, larghezza, altezza);
  ctx.restore();
}

// --------------------------------------------------------------------
//  Catene di monti: un crinale da rumore, illuminato per pendenza,
//  con la grana della roccia e la nebbia in basso. Si ripete in x.
// --------------------------------------------------------------------
export interface OpzioniCrinale {
  seme: number;
  larghezza: number;          // px della tela (multiplo del periodo)
  altezza: number;
  base: number;               // y media del crinale nella tela
  ampiezza: number;
  frequenza: number;          // creste per 1000 px
  aspro: number;              // 0 (dolce) … 1 (a lame)
  luce: number;               // +1 il sole a destra, -1 a sinistra
  chiaro: string; scuro: string; nebbia: string;
  nebbiaForza: number;        // 0..1 quanta nebbia in basso
  grana?: number;             // 0..1 grana della roccia
}

export async function crinale(o: OpzioniCrinale): Promise<Tela> {
  const tela = creaTela(o.larghezza, o.altezza);
  const g = ctxDi(tela);
  const per = Math.max(2, Math.round((o.larghezza / 1000) * o.frequenza));
  const n1 = fbmPeriodico(o.seme, per, 5);
  const n2 = fbmPeriodico(o.seme + 9, per * 3, 3);
  const y = new Float32Array(o.larghezza);
  for (let x = 0; x < o.larghezza; x++) {
    const u = (x / o.larghezza) * per;
    let h = n1(u, 0.5) * 0.9 + n2(u * 3, 1.5) * 0.25;
    // creste a lama: 1-|n| dà picchi acuti
    const lama = 1 - Math.abs(n1(u * 1.7, 4.2));
    h = lerp(h, lama * 0.9 - 0.25, o.aspro * 0.55);
    y[x] = o.base - h * o.ampiezza;
  }
  const chiaro = hexRgb(o.chiaro), scuro = hexRgb(o.scuro), nebbia = hexRgb(o.nebbia);
  const grana = perlin(o.seme + 3);
  // il corpo del monte: un solo poligono con un gradiente dal colore medio alla nebbia
  let minY = o.altezza;
  for (let x = 0; x < o.larghezza; x++) minY = Math.min(minY, y[x]);
  const corpo = new Path2D();
  corpo.moveTo(0, o.altezza);
  for (let x = 0; x < o.larghezza; x++) corpo.lineTo(x, Math.max(0, y[x]));
  corpo.lineTo(o.larghezza, o.altezza); corpo.closePath();
  const medio = mescola(scuro, chiaro, 0.45);
  const gc = g.createLinearGradient(0, Math.max(0, minY), 0, o.altezza);
  gc.addColorStop(0, rgbCss(medio)); gc.addColorStop(0.45, rgbCss(mescola(medio, scuro, 0.5)));
  gc.addColorStop(1, rgbCss(mescola(scuro, nebbia, o.nebbiaForza)));
  g.fillStyle = gc; g.fill(corpo);
  // la luce radente: il pendio rivolto al sole si schiarisce, l'altro si scurisce, in una fascia sotto la cresta
  const FASCIA = 84;
  const sprite = (col: RGB) => {
    const s = creaTela(1, FASCIA), sg = ctxDi(s);
    const gg = sg.createLinearGradient(0, 0, 0, FASCIA);
    gg.addColorStop(0, rgbCss(col, 0.9)); gg.addColorStop(0.35, rgbCss(col, 0.35)); gg.addColorStop(1, rgbCss(col, 0));
    sg.fillStyle = gg; sg.fillRect(0, 0, 1, FASCIA);
    return s;
  };
  const luceSp = sprite(chiaro), ombraSp = sprite(scuro);
  for (let x = 0; x < o.larghezza; x++) {
    const xm = (x - 2 + o.larghezza) % o.larghezza, xp = (x + 2) % o.larghezza;
    const pend = (y[xp] - y[xm]) / 4;                    // >0: scende verso destra
    const lit = clamp(0.5 + pend * 0.55 * o.luce);
    const top = Math.max(0, Math.floor(y[x]));
    g.globalAlpha = Math.abs(lit - 0.5) * 2;
    g.drawImage(lit > 0.5 ? luceSp : ombraSp, x, top);
    g.globalAlpha = 1;
    // luce di taglio sulla cresta
    if (lit > 0.55) { g.fillStyle = rgbCss(chiaro, (lit - 0.55) * 1.6); g.fillRect(x, top, 1, 2); }
  }
  // grana: chiazze di roccia e strati, in moltiplicazione leggera (a mezza risoluzione, poi stirata)
  if ((o.grana ?? 0) > 0) {
    const mw = Math.round(o.larghezza / 2), mh = Math.round(o.altezza / 2);
    const gr = await riempi(mw, mh, (px, py, c) => {
      const yy = y[Math.min(o.larghezza - 1, px * 2)] / 2;
      if (py < yy) { c[3] = 0; return; }
      const v = fbm(grana, px / 23, py / 7, 3) * 0.5 + fbm(grana, px / 4.5, py / 2.5, 2) * 0.25;
      const a = clamp(Math.abs(v) * (o.grana ?? 0) * 2.2, 0, 0.5);
      c[0] = v > 0 ? chiaro[0] : 0; c[1] = v > 0 ? chiaro[1] : 0; c[2] = v > 0 ? chiaro[2] : 0; c[3] = a * 255;
    });
    g.drawImage(gr, 0, 0, o.larghezza, o.altezza);
  }
  return tela;
}

/** Disegna una catena di monti che scorre in orizzontale (tela larga il doppio dello schermo). */
export function catenaScorre(ctx: C2D, tela: Tela, yBase: number, scorri: number, alpha = 1) {
  const w = tela.width;
  const off = ((scorri % w) + w) % w;
  ctx.save();
  ctx.globalAlpha = alpha;
  for (let x = -off; x < W + 40; x += w) ctx.drawImage(tela, x, yBase);
  ctx.restore();
}

export { rgba, lerp, clamp };
export type { RGB };

// --------------------------------------------------------------------
//  Aiuti sincroni leggeri per la composizione delle tavole dipinte
// --------------------------------------------------------------------

/** Crea una tela HTML fuori schermo dipinta subito da `disegna`. */
export function tela(w: number, h: number, disegna: (g: C2D) => void): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const g = c.getContext("2d");
  if (g) disegna(g);
  return c;
}

/** Inquadratura con scala, panoramica (dx, dy) ed eventuale rotazione attorno al centro (W/2, H/2). */
export function inquadra(ctx: C2D, scala: number, dx = 0, dy = 0, rot = 0) {
  ctx.translate(W / 2 + dx, H / 2 + dy);
  if (rot) ctx.rotate(rot);
  ctx.scale(scala, scala);
  ctx.translate(-W / 2, -H / 2);
}

/** Lieve respiro di macchina a mano deterministico sul tempo `t`. */
export function oscillaCamera(ctx: C2D, t: number, amp = 2) {
  ctx.translate(
    Math.sin(t * 0.73) * amp + Math.cos(t * 1.41) * amp * 0.35,
    Math.cos(t * 0.59) * amp * 0.7 + Math.sin(t * 1.19) * amp * 0.25,
  );
}

/** Vignettatura radiale morbida ai bordi del fotogramma 1920×1080. */
export function vignetta(ctx: C2D, forza = 0.5) {
  const g = ctx.createRadialGradient(W / 2, H / 2, W * 0.26, W / 2, H / 2, W * 0.66);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, `rgba(0,0,0,${forza})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

/** Fascia morbida di foschia orizzontale attorno a `yCentro`. */
export function foschia(ctx: C2D, yCentro: number, raggioY: number, colore: string) {
  const g = ctx.createLinearGradient(0, yCentro - raggioY, 0, yCentro + raggioY);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(0.5, colore);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, yCentro - raggioY, W, raggioY * 2);
}

/** Pulviscolo caldo/freddo in deriva su tutto il quadro 1920×1080. */
export function polvere(ctx: C2D, t: number, n: number, colore: string, vx = 10, vy = -8) {
  const r = rng(313);
  ctx.save();
  ctx.fillStyle = colore;
  for (let i = 0; i < n; i++) {
    const x = (((r() * W + t * (vx + (r() - 0.5) * 8)) % W) + W) % W;
    const y = (((r() * H + t * (vy + (r() - 0.5) * 6)) % H) + H) % H;
    const dim = 1.0 + r() * 2.0;
    ctx.globalAlpha = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 1.6 + i * 2.1));
    ctx.beginPath(); ctx.arc(x, y, dim, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

/** Chiazze morbide di velatura/nubi per le tele di preparazione. */
export function nubi(ctx: C2D, seme: number, hMax: number, colore: string, scala = 1) {
  const r = rng(seme);
  ctx.save();
  ctx.fillStyle = colore;
  for (let i = 0; i < 28; i++) {
    const cx = r() * W, cy = r() * hMax;
    const rx = (110 + r() * 240) * scala, ry = (24 + r() * 58) * scala;
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, (r() - 0.5) * 0.2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

/** Grana fine sparsa su un rettangolo di una tela precalcolata. */
export function grana(ctx: C2D, x0: number, y0: number, w: number, h: number, punti: number, colore: string, seme: number) {
  const r = rng(seme);
  ctx.fillStyle = colore;
  for (let i = 0; i < punti; i++) {
    ctx.fillRect(x0 + r() * w, y0 + r() * h, 1.4, 1.4);
  }
}

/** Raggi solari obliqui leggeri da (sx, sy). */
export function raggi(ctx: C2D, sx: number, sy: number, quanti: number, lung: number, a0: number, a1: number, colore: string, seme: number) {
  const r = rng(seme);
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  for (let i = 0; i < quanti; i++) {
    const ang = lerp(a0, a1, (i + r() * 0.6) / quanti);
    const ap = 0.035 + r() * 0.045;
    const g = ctx.createRadialGradient(sx, sy, 12, sx, sy, lung);
    g.addColorStop(0, colore);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + Math.cos(ang - ap) * lung, sy + Math.sin(ang - ap) * lung);
    ctx.lineTo(sx + Math.cos(ang + ap) * lung, sy + Math.sin(ang + ap) * lung);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}
