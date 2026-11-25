// ====================================================================
//  A · LE LETTERE  (0 → 9.6s)
//  Tavola dipinta a gouache e china dello scrittoio in noce scuro illuminato
//  dalla finestra, buste che arrivano ai tempi esatti di scaletta.ts (LETTERE)
//  e il biglietto battuto/scritto carattere per carattere su BIGLIETTO.scrive.
// ====================================================================
import { W, H, LETTERE, BIGLIETTO } from "../scaletta";
import { clamp, expoOut, lerp, rng, seg, smoothstep } from "../tempo";
import { FONT } from "../font";
import { inquadra, oscillaCamera, polvere, tela, vignetta } from "../pittura";
import { lingua } from "../../lib/lingua";
import type { Cache } from "../cache";
import { disegnaTavola, tavoleTrailer } from "../tavole";

export function preparaLettere(c: Cache) {
  if (c.lettere) return;
  const legno = tela(W, H, (g) => {
    g.fillStyle = "#160e09"; g.fillRect(0, 0, W, H);
    const r = rng(101);
    let y = 0;
    while (y < H) {
      const sp = 130 + r() * 90;
      const t = (r() - 0.5) * 10;
      const lg = g.createLinearGradient(0, y, 0, y + sp);
      lg.addColorStop(0, `rgb(${26 + t},${17 + t * 0.7},${11 + t * 0.4})`);
      lg.addColorStop(0.5, `rgb(${33 + t},${21 + t * 0.7},${14 + t * 0.4})`);
      lg.addColorStop(1, `rgb(${22 + t},${14 + t * 0.7},${9 + t * 0.4})`);
      g.fillStyle = lg; g.fillRect(0, y, W, sp);
      g.fillStyle = "rgba(5,3,1,0.55)"; g.fillRect(0, y + sp - 2, W, 2.5);
      y += sp;
    }
    vignetta(g, 0.72);
  });

  // Quattro buste che planano sul tavolo agli istanti di LETTERE (0.7, 1.8, 2.9, 4.0)
  const buste = [0, 1, 2, 3].map((k) => tela(420, 270, (g) => {
    const r = rng(310 + k * 23);
    g.translate(20, 20);
    const bw = 380, bh = 230;
    const cg = g.createLinearGradient(0, 0, bw, bh);
    cg.addColorStop(0, k % 2 === 0 ? "#ebd8b2" : "#e3cda4");
    cg.addColorStop(0.55, k % 2 === 0 ? "#cfaf7c" : "#c5a26f");
    cg.addColorStop(1, k % 2 === 0 ? "#a48252" : "#997748");
    g.fillStyle = cg;
    g.strokeStyle = "#19110a";
    g.lineWidth = 3.0;
    g.beginPath(); g.rect(0, 0, bw, bh); g.fill(); g.stroke();
    // Velatura gouache d'ombra lungo i bordi della busta
    g.strokeStyle = "rgba(92,58,28,0.22)";
    g.lineWidth = 6;
    g.strokeRect(3, 3, bw - 6, bh - 6);
    g.strokeStyle = "rgba(28,19,12,0.55)";
    g.lineWidth = 1.7;
    g.beginPath(); g.moveTo(4, 4); g.lineTo(bw / 2, bh * 0.46); g.lineTo(bw - 4, 4); g.stroke();
    const fx = bw - 68, fy = 18;
    g.fillStyle = "#efe4cc"; g.fillRect(fx - 4, fy - 4, 52, 60);
    g.strokeStyle = "#241911"; g.lineWidth = 1.6; g.strokeRect(fx - 4, fy - 4, 52, 60);
    g.fillStyle = k % 2 === 0 ? "#9a5d36" : "#5e6a3e";
    g.fillRect(fx + 2, fy + 2, 40, 48);
    g.strokeStyle = "rgba(42,30,22,0.48)"; g.lineWidth = 1.5;
    g.beginPath(); g.arc(fx - 26, fy + 28, 20, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = "rgba(38,26,18,0.52)"; g.lineWidth = 1.8;
    for (let riga = 0; riga < 3; riga++) {
      const yy = 132 + riga * 24, lung = 150 - riga * 24 + r() * 20;
      g.beginPath(); g.moveTo(86, yy);
      for (let x = 86; x < 86 + lung; x += 8) g.lineTo(x, yy + (r() - 0.5) * 3.8);
      g.stroke();
    }
  }));

  // Il cartoncino rigido avorio caldo che arriva a BIGLIETTO.arriva (6.7 s)
  const cartoncino = tela(540, 320, (g) => {
    g.translate(20, 20);
    const cw = 500, ch = 280;
    const cg = g.createLinearGradient(0, 0, cw, ch);
    cg.addColorStop(0, "#f5e7c6");
    cg.addColorStop(0.6, "#e6d2aa");
    cg.addColorStop(1, "#cfb588");
    g.fillStyle = cg;
    g.strokeStyle = "#1a110a";
    g.lineWidth = 3.2;
    g.fillRect(0, 0, cw, ch);
    g.strokeRect(0, 0, cw, ch);
    g.strokeStyle = "rgba(110,74,38,0.2)";
    g.lineWidth = 5;
    g.strokeRect(3, 3, cw - 6, ch - 6);
  });

  c.lettere = { legno, buste, cartoncino, scritta: scriviLettera() };
}

// --------------------------------------------------------------------
//  La lettera sotto il biglietto. Nella tavola il foglio è dipinto bianco; qui gli si scrive sopra, a mano e in corsivo,
//  una lettera che non si legge (Simone, 25 novembre 2026: «Mettiamoci delle finte scritte, riempiamola»): la data, il
//  saluto, i capoversi, la chiusa e la firma. Si scrive una volta sul foglio disteso e poi lo si posa, a strisce, sul
//  quadrilatero del foglio dipinto, così le righe seguono la prospettiva della tavola.
// --------------------------------------------------------------------
type Punto = readonly [number, number];
/** Gli angoli del foglio, in px di progetto con la tavola a tutto quadro (misurati sull'immagine da 1280 × 720, per 1,5). */
const FOGLIO: Record<"tl" | "tr" | "br" | "bl", Punto> = { tl: [842, 295], tr: [1345, 165], br: [1605, 805], bl: [1085, 965] };
/** Il foglio disteso, nelle unità in cui si scrive (le proporzioni dei lati del foglio dipinto). */
const CARTA_L = 700, CARTA_A = 960;
/** La scrittura si prepara al doppio dei px di progetto: resta nitida sulle tele più larghe del quadro. */
const FITTA = 2;
const BOX = {
  x: Math.min(FOGLIO.tl[0], FOGLIO.bl[0]), y: Math.min(FOGLIO.tl[1], FOGLIO.tr[1]),
  w: Math.max(FOGLIO.tr[0], FOGLIO.br[0]) - Math.min(FOGLIO.tl[0], FOGLIO.bl[0]),
  h: Math.max(FOGLIO.bl[1], FOGLIO.br[1]) - Math.min(FOGLIO.tl[1], FOGLIO.tr[1]),
};

/** Una parola in corsivo che non si legge: archi, occhielli, aste, code, a penna, inclinata in avanti. */
function parola(g: CanvasRenderingContext2D, x: number, y: number, lettere: number, r: () => number) {
  const h = 8.5, w = 10.5;
  g.save();
  g.translate(x, y);
  g.transform(1, 0, -0.24, 1, 0, 0);
  g.beginPath();
  g.moveTo(-3, 1);
  let px = 0;
  for (let i = 0; i < lettere; i++) {
    const tipo = r(), dy = (r() - 0.5) * 1.6;
    if (tipo < 0.34) g.quadraticCurveTo(px + w / 2, -2 * h + dy, px + w, dy);                                   // arco (n, m)
    else if (tipo < 0.58) g.bezierCurveTo(px + w * 1.1, -h * 1.3, px - w * 0.1, -h * 1.3, px + w * 0.75, dy);   // occhiello (e)
    else if (tipo < 0.76) g.bezierCurveTo(px + w * 1.3, -h * 3.2, px - w * 0.3, -h * 3.2, px + w * 0.8, dy);   // asta (l, h, b)
    else if (tipo < 0.88) { g.quadraticCurveTo(px + w * 0.3, h * 0.7, px + w * 0.6, -h * 0.9 + dy); g.lineTo(px + w * 0.55, dy); }   // onda (u, a)
    else { g.bezierCurveTo(px + w * 1.1, h * 2.7, px - w * 0.2, h * 2.7, px + w, -h * 0.4 + dy); }            // coda (g, q)
    px += w * (0.8 + r() * 0.3);
  }
  g.quadraticCurveTo(px + 4, -2, px + 7, -4);
  g.stroke();
  // i puntini delle i e le stanghette delle t, ogni tanto
  if (r() < 0.45) { g.beginPath(); g.arc(px * r(), -h * 1.9, 0.9, 0, Math.PI * 2); g.fill(); }
  if (r() < 0.3) { const tx = px * r(); g.beginPath(); g.moveTo(tx - 6, -h * 1.6); g.lineTo(tx + 7, -h * 1.75); g.stroke(); }
  g.restore();
  return px + 7;
}

/** Una riga di parole da `x0` a non oltre `x1`; restituisce dove è finita. */
function riga(g: CanvasRenderingContext2D, x0: number, x1: number, y: number, r: () => number) {
  let x = x0;
  for (;;) {
    const n = 2 + Math.floor(r() * 7);
    if (x + n * 11 + 7 > x1) break;
    x += parola(g, x, y + (r() - 0.5) * 1.2, n, r) + 9 + r() * 9;
  }
  return x;
}

function scriviLettera(): HTMLCanvasElement | null {
  if (typeof document === "undefined") return null;
  // il foglio disteso
  const bozza = tela(CARTA_L * FITTA, CARTA_A * FITTA, (g) => {
    const r = rng(7331);
    g.scale(FITTA, FITTA);
    g.strokeStyle = "rgba(36,22,14,0.86)"; g.fillStyle = "rgba(36,22,14,0.86)";
    g.lineWidth = 1.5; g.lineCap = "round"; g.lineJoin = "round";
    riga(g, 440, 640, 84, r);                                    // il luogo e la data, in alto a destra
    riga(g, 72, 250, 152, r);                                    // il saluto
    let y = 206, capo = true;
    while (y < 770) {
      const fine: boolean = !capo && r() < 0.16;                          // l'ultima riga del capoverso finisce prima
      riga(g, capo ? 118 : 72, fine ? 220 + r() * 300 : 640, y, r);
      capo = fine;
      y += fine ? 46 : 33;
    }
    riga(g, 360, 590, 812, r);                                   // la chiusa
    g.lineWidth = 2.1;
    riga(g, 420, 620, 872, r);                                   // la firma
  });
  // posata sul foglio dipinto, a strisce: ogni striscia ha la sua trasformazione (il foglio è un quadrilatero, non un rettangolo)
  return tela(BOX.w * FITTA, BOX.h * FITTA, (g) => {
    const mix = (a: Punto, b: Punto, k: number): Punto => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
    const STRISCIA = 6;
    for (let s = 0; s < CARTA_A; s += STRISCIA) {
      const v0 = s / CARTA_A, v1 = (s + STRISCIA) / CARTA_A;
      const l0 = mix(FOGLIO.tl, FOGLIO.bl, v0), r0 = mix(FOGLIO.tr, FOGLIO.br, v0);
      const l1 = mix(FOGLIO.tl, FOGLIO.bl, v1), r1 = mix(FOGLIO.tr, FOGLIO.br, v1);
      const ex = [(r0[0] - l0[0]) / CARTA_L, (r0[1] - l0[1]) / CARTA_L];
      const ey = [((l1[0] + r1[0]) - (l0[0] + r0[0])) / 2 / STRISCIA, ((l1[1] + r1[1]) - (l0[1] + r0[1])) / 2 / STRISCIA];
      g.setTransform(FITTA * ex[0], FITTA * ex[1], FITTA * ey[0], FITTA * ey[1], FITTA * (l0[0] - BOX.x), FITTA * (l0[1] - BOX.y));
      // un filo più alta del passo: niente righe vuote fra una striscia e l'altra
      g.drawImage(bozza, 0, s * FITTA, CARTA_L * FITTA, (STRISCIA + 1) * FITTA, 0, 0, CARTA_L, STRISCIA + 1);
    }
  });
}

export function disegnaLettere(ctx: CanvasRenderingContext2D, t: number, c: Cache) {
  preparaLettere(c);
  const img = tavoleTrailer.lettere;
  const u = clamp(t / 9.6);

  ctx.save();
  const spinta = smoothstep(4.2, 9.4, t);
  inquadra(ctx, lerp(1.01, 1.08, u), lerp(0, -48, spinta), lerp(0, -10, spinta), 0);
  oscillaCamera(ctx, t, 2.0);

  if (img) {
    disegnaTavola(ctx, img, W, H);
    // l'inchiostro della lettera entra nella carta dipinta (moltiplica: dove la carta è in ombra, anche lo scritto lo è)
    if (c.lettere.scritta) {
      ctx.save();
      ctx.globalCompositeOperation = "multiply";
      ctx.drawImage(c.lettere.scritta, BOX.x, BOX.y, BOX.w, BOX.h);
      ctx.restore();
    }
  } else {
    ctx.drawImage(c.lettere.legno, 0, 0);
  }

  // Le quattro buste che arrivano in sincrono coi fruscii di carta (LETTERE = [0.7, 1.8, 2.9, 4.0])
  const poseBuste = [
    { x: 392, y: 424, rot: -0.26 },
    { x: 438, y: 506, rot: -0.17 },
    { x: 468, y: 598, rot: -0.22 },
    { x: 498, y: 666, rot: -0.11 },
  ];
  LETTERE.forEach((t0, k) => {
    const p = expoOut(seg(t, t0, t0 + 0.72));
    if (p <= 0) return;
    const b = poseBuste[k];
    const scivola = (1 - p) * 130;
    ctx.save();
    ctx.globalAlpha = clamp(p * 1.4);
    ctx.translate(b.x - scivola * 0.65, b.y - scivola);
    ctx.rotate(b.rot + (1 - p) * 0.16);
    ctx.scale(0.82 + (1 - p) * 0.08, 0.82 + (1 - p) * 0.08);
    ctx.shadowColor = "rgba(8,4,2,0.58)";
    ctx.shadowBlur = 14 + (1 - p) * 22;
    ctx.shadowOffsetX = 6 + (1 - p) * 14;
    ctx.shadowOffsetY = 9 + (1 - p) * 18;
    ctx.drawImage(c.lettere.buste[k], -210, -135);
    ctx.restore();
  });

  // Lama viva di sole caldo dalla finestra in alto a sinistra
  const respiroLuce = 0.88 + 0.12 * Math.sin(t * 0.9);
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const gl = ctx.createLinearGradient(160, 0, 1460, H);
  gl.addColorStop(0, `rgba(255,198,122,${0.17 * respiroLuce})`);
  gl.addColorStop(0.52, `rgba(244,174,96,${0.08 * respiroLuce})`);
  gl.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gl;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  // Il biglietto (BIGLIETTO.arriva = 6.7 s) e la frase battuta/scritta lettera per lettera (BIGLIETTO.scrive = 7.25 s)
  const pb = expoOut(seg(t, BIGLIETTO.arriva, BIGLIETTO.arriva + 0.65));
  if (pb > 0) {
    const en = lingua() === "en";
    const righe = en ? BIGLIETTO.testoEn : BIGLIETTO.testo;
    // Durata totale dei colpi di tasto calcolata sul testo italiano (scaletta.ts:123)
    const totPassiIt = BIGLIETTO.testo[0].length + 4 + BIGLIETTO.testo[1].length;
    const durataScrive = totPassiIt * BIGLIETTO.perCarattere;
    const totPassi = righe[0].length + 4 + righe[1].length;
    const avanzCaratteri = clamp((t - BIGLIETTO.scrive) / durataScrive) * totPassi;

    ctx.save();
    const fx = img ? W * 0.628 : W * 0.52;
    const fy = img ? H * 0.505 : H * 0.48;
    const ang = img ? -0.276 : -0.045;
    const cala = (1 - pb) * 95;
    ctx.translate(fx + cala * 0.25, fy - cala);
    ctx.rotate(ang + (1 - pb) * 0.08);

    // Cartoncino che si posa sul foglio con suono di carta a t = 7.2 s
    ctx.save();
    ctx.globalAlpha = pb;
    ctx.shadowColor = "rgba(8,4,2,0.55)";
    ctx.shadowBlur = 18 + (1 - pb) * 24;
    ctx.shadowOffsetX = 6;
    ctx.shadowOffsetY = 10 + (1 - pb) * 16;
    ctx.drawImage(c.lettere.cartoncino, -270, -160);
    ctx.restore();

    if (t >= BIGLIETTO.scrive) {
      const n1 = clamp(Math.floor(avanzCaratteri), 0, righe[0].length);
      const n2 = clamp(Math.floor(avanzCaratteri - righe[0].length - 4), 0, righe[1].length);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `400 ${en ? 44 : 52}px ${FONT.mano}`;
      ctx.fillStyle = "rgba(31,19,13,0.94)";
      if (n1 > 0) ctx.fillText(righe[0].slice(0, n1), 0, -34);
      if (n2 > 0) ctx.fillText(righe[1].slice(0, n2), 0, 34);
    }
    ctx.restore();
  }

  ctx.restore();

  polvere(ctx, t, 56, "rgba(255,218,162,0.32)", 9, 13);
  const gBasso = ctx.createLinearGradient(0, H * 0.72, 0, H);
  gBasso.addColorStop(0, "rgba(0,0,0,0)");
  gBasso.addColorStop(1, "rgba(6,4,3,0.74)");
  ctx.fillStyle = gBasso;
  ctx.fillRect(0, H * 0.72, W, H * 0.28);
  vignetta(ctx, 0.48);
}
