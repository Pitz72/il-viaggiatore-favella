// ====================================================================
//  G · ACQUAMORTA E IL GUADO  (59.0 → 65.8s, e la sequenza finale senza figure)
//  Tavola dipinta a gouache e china del greto sassoso, del filo d'acqua color
//  rame e delle rovine di Acquamorta col campanile spezzato + riflessi vivi
//  sull'acqua, canne mosse dal vento, foschia del tramonto e i due fratelli
//  sulle sponde opposte (assenti nella sequenza finale).
// ====================================================================
import { W, H, CAMMINATE, faseDiPasso } from "../scaletta";
import { clamp, lerp, rng, smoothstep } from "../tempo";
import { foschia, inquadra, oscillaCamera, polvere, tela, vignetta } from "../pittura";
import { disegnaFermo, disegnaOmbra, disegnaViandante } from "../viandante";
import type { Cache } from "../cache";
import { caricaTavoleTrailer, disegnaTavola, tavoleTrailer } from "../tavole";

export function preparaGuado(c: Cache) {
  if (c.guado) return;
  void caricaTavoleTrailer();
  const ripiego = tela(W, H, (g) => {
    const cg = g.createLinearGradient(0, 0, 0, H);
    cg.addColorStop(0, "#241c2c");
    cg.addColorStop(0.36, "#9e5c3b");
    cg.addColorStop(0.48, "#e29a58");
    cg.addColorStop(0.62, "#2f2622");
    cg.addColorStop(1, "#181414");
    g.fillStyle = cg; g.fillRect(0, 0, W, H);
  });

  // Ciuffi di canne secche sul greto in primo piano
  const r = rng(195);
  const canne: [number, number, number][] = [];
  for (let i = 0; i < 42; i++) {
    const spondaDx = i >= 24;
    const cx = spondaDx ? 1420 + r() * 470 : 30 + r() * 420;
    const cy = spondaDx ? H * 0.84 + r() * 90 : H * 0.80 + r() * 110;
    canne.push([cx, cy, 34 + r() * 52]);
  }
  c.guado = { ripiego, canne };
}

/** `conFigure = false` lascia il paesaggio solo (per la sequenza finale: i sei finali non hanno le stesse figure sulla riva). */
export function disegnaGuado(ctx: CanvasRenderingContext2D, t: number, c: Cache, conFigure = true) {
  preparaGuado(c);
  const tr0 = Math.max(0, t - 59.6);
  const u = clamp(tr0 / 8.2);
  const img = tavoleTrailer.guado;

  ctx.save();
  if (conFigure) {
    inquadra(ctx, lerp(1.015, 1.075, u), lerp(-12, 18, u), lerp(6, -10, u));
    oscillaCamera(ctx, t, 1.6);
  }

  if (img) {
    disegnaTavola(ctx, img, W, H);
  } else {
    ctx.drawImage(c.guado.ripiego, 0, 0);
  }

  // Respiro ambrato del tramonto dietro la sella dei monti a sinistra del campanile spezzato
  const respiroSole = 0.9 + 0.1 * Math.sin(t * 0.85);
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const gs = ctx.createRadialGradient(W * 0.25, H * 0.30, 12, W * 0.25, H * 0.30, 560);
  gs.addColorStop(0, `rgba(255,196,120,${0.26 * respiroSole})`);
  gs.addColorStop(0.45, `rgba(224,126,72,${0.11 * respiroSole})`);
  gs.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gs;
  ctx.fillRect(0, 0, W, H * 0.65);

  // Tremolio vivo di riflessi ramati lungo la vena d'acqua diagonale del guado (0.58..0.77 H)
  const rAcqua = rng(223);
  for (let i = 0; i < 36; i++) {
    const k = i / 35;
    const ax = lerp(W * 0.12, W * 0.88, k) + (rAcqua() - 0.5) * 90;
    const ay = lerp(H * 0.615, H * 0.745, k) + (rAcqua() - 0.5) * 26;
    const onda = Math.sin(t * 2.4 + i * 0.9) * 9;
    const lw = 22 + rAcqua() * 54;
    const alfa = (0.10 + 0.10 * Math.sin(t * 3.1 + i * 1.4)) * (1 - Math.abs(k - 0.38));
    if (alfa <= 0.01) continue;
    ctx.strokeStyle = `rgba(255,184,112,${alfa})`;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(ax + onda, ay);
    ctx.lineTo(ax + onda + lw, ay + 1.2);
    ctx.stroke();
  }
  ctx.restore();

  foschia(ctx, H * 0.57, 64, "rgba(232,158,104,0.12)");

  if (conFigure) {
    // Cosimo immobile sulla sponda opposta, ai piedi della rupe di Acquamorta, col fucile di traverso
    disegnaFermo(ctx, W * 0.585, H * 0.662, 92, "#120d10", "#f4a468");

    // Il Viandante sulla riva vicina tra i ciottoli, che avanza piano e rallenta davanti al fratello
    // Cammina da 59.6 e si arresta sul colpo grave del brano a 64.0 s («tuo fratello.»)
    const fermoGuado = smoothstep(63.4, 64.1, t);
    const progCammino = clamp((t - 59.6) / 4.4);
    const vx = lerp(W * 0.22, W * 0.355, progCammino);
    const vy = lerp(H * 0.83, H * 0.795, progCammino);
    const faseG = faseDiPasso(Math.min(t, 64.0), CAMMINATE[3]);
    const opzGuado = {
      colore: "#140e11",
      lontano: "#0b0709",
      bordo: "#f6ad72",
      latoLuce: 1,
      verso: 1,
      fermo: fermoGuado,
      ampiezza: 0.84,
      tanica: true,
      fagotto: true,
      cappello: true,
      dettaglio: 2 as const,
    };
    disegnaOmbra(ctx, vx, vy, 134, faseG, opzGuado, -0.75, -0.17, "rgba(12,8,10,0.38)");
    disegnaViandante(ctx, vx, vy, 134, faseG, opzGuado);
  }

  // Canne scure sul greto mosse dalla brezza serale
  ctx.strokeStyle = "#120e10"; ctx.lineWidth = 2.0; ctx.lineCap = "round";
  for (const [cx, cy, ch] of c.guado.canne as [number, number, number][]) {
    const piega = Math.sin(t * 1.7 + cx * 0.02) * 6.5 + 3.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.quadraticCurveTo(cx + piega * 0.5, cy - ch * 0.5, cx + piega, cy - ch);
    ctx.stroke();
  }

  ctx.restore();

  polvere(ctx, t, 32, "rgba(255,192,134,0.22)", 8, -5);
  vignetta(ctx, 0.52);
}
