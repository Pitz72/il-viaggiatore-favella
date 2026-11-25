// ====================================================================
//  D · L'INVASO MORTO · GIORNO → NOTTE  (21.0 → 31.8s)
//  Tavola dipinta a gouache e china del fondale salino, la barca inclinata,
//  gli alberi secchi e la diga con la torre di presa + trascolorare vero dal
//  crepuscolo alla notte stellata con Via Lattea, spia rossa sulla torre e
//  il Viandante che attraversa la crosta di sale.
// ====================================================================
import { W, H, CAMMINATE, faseDiPasso } from "../scaletta";
import { clamp, lerp, mix, rng, smoothstep } from "../tempo";
import { foschia, inquadra, oscillaCamera, polvere, tela, vignetta } from "../pittura";
import { disegnaFigura, disegnaOmbraFigura, FALCATA, type LuceFigura, type OpzioniFigura } from "../figura";
import { aTerra, distanzaDi, STATURA, type Macchina } from "../prospettiva";
import type { Cache } from "../cache";
import { disegnaTavola, tavoleTrailer } from "../tavole";

/** La macchina da presa della tavola: ad altezza d'uomo, l'orizzonte sulla riva lontana del bacino. */
const MACCHINA: Macchina = { fugaX: W / 2, orizzonte: H * 0.59, alta: 1.75, focale: 2400 };
/** La riga dove posa i piedi (davanti alla barca), da dove parte (px) e quanto è lungo il suo passo sul sale. */
const RIGA = H * 0.804, PARTE_DA = 300, AMPIEZZA = 0.92;
/** L'ultimo chiaro è dietro la diga, a destra: al crepuscolo e a notte fonda. */
const CREPUSCOLO: LuceFigura = { ambiente: "#aeb4be", chiave: "#eef2f6", forza: 0.42, buio: "#151b27", fondo: 0.44, lato: 1, alto: 0.6, china: "#0e121a" };
const NOTTE: LuceFigura = { ambiente: "#5a688c", chiave: "#b6ccf2", forza: 0.5, buio: "#070b15", fondo: 0.68, lato: 1, alto: 0.6, china: "#04060c" };

interface Stella { x: number; y: number; r: number; a: number; f: number; c: string }

export function preparaInvaso(c: Cache) {
  if (c.invaso) return;
  const ripiego = tela(W, H, (g) => {
    const cg = g.createLinearGradient(0, 0, 0, H);
    cg.addColorStop(0, "#2f3d52");
    cg.addColorStop(0.5, "#6b7888");
    cg.addColorStop(0.52, "#bfc8ce");
    cg.addColorStop(1, "#7b858d");
    g.fillStyle = cg; g.fillRect(0, 0, W, H);
  });

  // Via Lattea obliqua sfumata nel cielo notturno sopra i monti e la diga (senza ellissi nette)
  const viaLattea = tela(W, 560, (g) => {
    g.save();
    g.translate(W * 0.44, 210); g.rotate(-0.24);
    const lg = g.createRadialGradient(0, 0, 12, 0, 0, 740);
    lg.addColorStop(0, "rgba(196,214,250,0.16)");
    lg.addColorStop(0.38, "rgba(148,172,226,0.08)");
    lg.addColorStop(0.75, "rgba(110,136,192,0.025)");
    lg.addColorStop(1, "rgba(0,0,0,0)");
    g.scale(1.75, 0.32);
    g.fillStyle = lg; g.fillRect(-760, -640, 1520, 1280);
    g.restore();
  });

  // Stelle confinate nella fascia alta del cielo (sopra il profilo della diga e della torre)
  const r = rng(108);
  const colori = ["#ffffff", "#dce8ff", "#ffe9cc", "#c6d8ff"];
  const stelle: Stella[] = [];
  for (let i = 0; i < 210; i++) {
    const x = r() * W;
    // A destra la diga sale fino a ~0.34 H, a sinistra i monti sono intorno a ~0.46 H
    const limiteY = x > W * 0.52 ? H * 0.25 : H * 0.38;
    const y = Math.pow(r(), 1.3) * limiteY;
    stelle.push({ x, y, r: 0.6 + Math.pow(r(), 3) * 1.8, a: 0.35 + r() * 0.65, f: r() * 6.28, c: colori[i % 4] });
  }

  c.invaso = { ripiego, viaLattea, stelle };
}

export function disegnaInvaso(ctx: CanvasRenderingContext2D, t: number, c: Cache) {
  preparaInvaso(c);
  const tr0 = Math.max(0, t - 24.8);
  const u = clamp(tr0 / 8.6);
  const notte = smoothstep(25.6, 29.2, t);
  const img = tavoleTrailer.invaso;

  ctx.save();
  inquadra(ctx, lerp(1.015, 1.07, u), lerp(-18, 22, u), lerp(4, -6, u));
  oscillaCamera(ctx, t, 1.8);

  if (img) {
    disegnaTavola(ctx, img, W, H);
  } else {
    ctx.drawImage(c.invaso.ripiego, 0, 0);
  }

  // Trascolorare progressivo dal crepuscolo cinereo alla notte blu-indaco profonda
  if (notte > 0.002) {
    // 1. Scurimento lunare selettivo su tutta la tavola (multiply preserva ogni tratto di china e crepa del sale)
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    const gm = ctx.createLinearGradient(0, 0, 0, H);
    gm.addColorStop(0, `rgba(${Math.round(lerp(255, 28, notte))},${Math.round(lerp(255, 40, notte))},${Math.round(lerp(255, 76, notte))},1)`);
    gm.addColorStop(0.48, `rgba(${Math.round(lerp(255, 44, notte))},${Math.round(lerp(255, 58, notte))},${Math.round(lerp(255, 96, notte))},1)`);
    gm.addColorStop(1, `rgba(${Math.round(lerp(255, 74, notte))},${Math.round(lerp(255, 92, notte))},${Math.round(lerp(255, 128, notte))},1)`);
    ctx.fillStyle = gm;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    // 2. Cielo stellato profondo sfumato sopra il crinale + Via Lattea
    const gCielo = ctx.createLinearGradient(0, 0, 0, H * 0.46);
    gCielo.addColorStop(0, `rgba(5,9,20,${0.78 * notte})`);
    gCielo.addColorStop(0.58, `rgba(8,14,30,${0.46 * notte})`);
    gCielo.addColorStop(1, "rgba(8,14,30,0)");
    ctx.fillStyle = gCielo;
    ctx.fillRect(0, 0, W, H * 0.46);

    const kStelle = smoothstep(0.28, 0.96, notte);
    if (kStelle > 0.01) {
      ctx.save();
      ctx.globalAlpha = kStelle;
      ctx.drawImage(c.invaso.viaLattea, 0, 0);
      for (const s of c.invaso.stelle) {
        const tw = 0.72 + 0.28 * Math.sin(t * 2.3 + s.f);
        ctx.globalAlpha = kStelle * s.a * tw;
        ctx.fillStyle = s.c;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
  }

  // Vapori freddi di sale che alitano rasoterra sul bacino secco
  foschia(ctx, H * 0.59, 68, notte > 0.5 ? "rgba(130,156,196,0.10)" : "rgba(216,226,234,0.14)");

  // Spia rossa intermittente in cima alla ringhiera della torre di presa dipinta (0.758 W, 0.162 H)
  const spiaX = img ? W * 0.758 : 1384;
  const spiaY = img ? H * 0.159 : 318;
  const impulso = Math.pow(0.5 + 0.5 * Math.sin(t * 2.6), 4);
  const intensitaSpia = (0.28 + 0.72 * notte) * (0.28 + 0.72 * impulso);
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const gf = ctx.createRadialGradient(spiaX, spiaY, 1, spiaX, spiaY, 64);
  gf.addColorStop(0, `rgba(255,92,72,${intensitaSpia})`);
  gf.addColorStop(0.25, `rgba(235,52,42,${intensitaSpia * 0.45})`);
  gf.addColorStop(1, "rgba(235,52,42,0)");
  ctx.fillStyle = gf;
  ctx.beginPath(); ctx.arc(spiaX, spiaY, 64, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = `rgba(255,180,164,${intensitaSpia})`;
  ctx.beginPath(); ctx.arc(spiaX, spiaY, 2.8, 0, Math.PI * 2); ctx.fill();
  // Debolissimo riflesso rosso sul sale ai piedi della torre nella notte
  if (notte > 0.35) {
    const gr = ctx.createRadialGradient(spiaX, H * 0.63, 2, spiaX, H * 0.63, 95);
    gr.addColorStop(0, `rgba(220,58,48,${intensitaSpia * 0.12})`);
    gr.addColorStop(1, "rgba(220,58,48,0)");
    ctx.fillStyle = gr;
    ctx.fillRect(spiaX - 100, H * 0.58, 200, 110);
  }
  ctx.restore();

  // Il Viandante attraversa il sale da sinistra a destra, davanti alla barca, sulla sua riga: STATURA × FALCATA metri a
  // ogni ciclo di passo. La sua luce trascolora con la tavola, dal crepuscolo alla notte
  const camm = CAMMINATE[2];
  const distanza = distanzaDi(MACCHINA, RIGA);
  const parte = aTerra(MACCHINA, 0, distanza);
  const posto = aTerra(MACCHINA, (PARTE_DA - MACCHINA.fugaX) / parte.scala + STATURA * FALCATA * AMPIEZZA * camm.cad * tr0, distanza);
  const fase = faseDiPasso(t, camm) - 0.25;                    // il tallone tocca terra sul suono del passo (fasi ,25 e ,75)
  const luce: LuceFigura = {
    ambiente: mix(CREPUSCOLO.ambiente, NOTTE.ambiente, notte), chiave: mix(CREPUSCOLO.chiave, NOTTE.chiave, notte), forza: lerp(CREPUSCOLO.forza, NOTTE.forza, notte),
    buio: mix(CREPUSCOLO.buio, NOTTE.buio, notte), fondo: lerp(CREPUSCOLO.fondo, NOTTE.fondo, notte), lato: 1, alto: 0.6, china: mix(CREPUSCOLO.china, NOTTE.china, notte),
  };
  const figura: OpzioniFigura = { vista: "profilo", verso: 1, luce, ampiezza: AMPIEZZA, tanica: true, coperta: true, cappello: true };
  disegnaOmbraFigura(ctx, posto.x, posto.y, posto.alto, fase, figura, 0.5, -0.2, "#0c121c", lerp(0.34, 0.16, notte));
  disegnaFigura(ctx, posto.x, posto.y, posto.alto, fase, figura);

  ctx.restore();

  polvere(ctx, t, 38, notte > 0.5 ? "rgba(176,198,238,0.22)" : "rgba(226,234,242,0.24)", 10, -4);
  vignetta(ctx, lerp(0.46, 0.62, notte));
}
