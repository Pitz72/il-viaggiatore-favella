// ====================================================================
//  C · LA TERRA SENZA ACQUA  (17.6 → 25.6s)
//  Tavola dipinta a gouache e china dei calanchi e delle zolle d'argilla
//  incurvate dal sole + riverbero termico vivo all'orizzonte, sole a picco,
//  il Viandante di profilo che attraversa la spianata sulla sua riga (avanza
//  della lunghezza dei suoi passi: prospettiva.ts) e la polvere che si alza
//  dove ha posato il piede, in sincrono con CAMMINATE[1].
//  La fascia centro-sinistra resta luminosa per ospitare il timbro scuro
//  «la secca / dieci anni senza pioggia» (#3b2415).
// ====================================================================
import { W, H, CAMMINATE, faseDiPasso } from "../scaletta";
import { clamp, lerp, smoothstep } from "../tempo";
import { foschia, inquadra, oscillaCamera, polvere, tela, vignetta } from "../pittura";
import { disegnaFigura, disegnaOmbraFigura, FALCATA, type LuceFigura, type OpzioniFigura } from "../figura";
import { aTerra, distanzaDi, STATURA, type Macchina } from "../prospettiva";
import type { Cache } from "../cache";
import { disegnaTavola, tavoleTrailer } from "../tavole";

/** La macchina da presa della tavola: l'orizzonte al piede dei calanchi, poco sopra l'altezza d'uomo. */
const MACCHINA: Macchina = { fugaX: W / 2, orizzonte: H * 0.40, alta: 1.9, focale: 2400 };
/** La riga dove posa i piedi, da dove parte (px) e quanto è lungo il suo passo sull'argilla (1 = FALCATA). */
const RIGA = H * 0.64, PARTE_DA = 440, AMPIEZZA = 0.9;
/** Sole alto a sinistra: piena luce, ombre corte e nette. */
const LUCE: LuceFigura = { ambiente: "#f0dcb6", chiave: "#fff5d6", forza: 0.55, buio: "#3d2614", fondo: 0.26, lato: -1, alto: 0.8, china: "#24150b" };

export function preparaTerra(c: Cache) {
  if (c.terra) return;
  const ripiego = tela(W, H, (g) => {
    const cg = g.createLinearGradient(0, 0, 0, H);
    cg.addColorStop(0, "#f4dfa8");
    cg.addColorStop(0.36, "#e0ae66");
    cg.addColorStop(0.42, "#b87a3d");
    cg.addColorStop(1, "#4e2c14");
    g.fillStyle = cg; g.fillRect(0, 0, W, H);
  });
  c.terra = { ripiego };
}

export function disegnaTerra(ctx: CanvasRenderingContext2D, t: number, c: Cache) {
  preparaTerra(c);
  const tr0 = Math.max(0, t - 17.6);
  const u = clamp(tr0 / 8.0);
  const img = tavoleTrailer.terra;

  ctx.save();
  inquadra(ctx, lerp(1.08, 1.02, u), lerp(42, -38, u), lerp(-8, 10, u));
  oscillaCamera(ctx, t, 2.4);

  if (img) {
    disegnaTavola(ctx, img, W, H);

    // Riverbero termico vivo lungo il piede dei calanchi
    for (let b = 0; b < 5; b++) {
      const sy = Math.round(img.height * (0.33 + b * 0.024));
      const sh = Math.max(4, Math.round(img.height * 0.022));
      const dy = H * (0.33 + b * 0.024);
      const dh = H * 0.024;
      const scarto = Math.sin(t * 4.6 + b * 1.5) * (3.2 - b * 0.4);
      ctx.save();
      ctx.globalAlpha = 0.36;
      ctx.drawImage(img, 0, sy, img.width, sh, scarto, dy, W, dh);
      ctx.restore();
    }
  } else {
    ctx.drawImage(c.terra.ripiego, 0, 0);
  }

  // Vampa accecante del sole e calura chiara dietro il timbro «la secca» (22.6–25.1 s)
  const vampaTimbro = smoothstep(22.2, 23.0, t);
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const sg = ctx.createRadialGradient(W * 0.24, H * 0.28, 16, W * 0.28, H * 0.36, 920);
  sg.addColorStop(0, `rgba(255,248,220,${0.46 + 0.18 * vampaTimbro})`);
  sg.addColorStop(0.38, `rgba(255,214,142,${0.22 + 0.14 * vampaTimbro})`);
  sg.addColorStop(0.75, "rgba(224,148,68,0.06)");
  sg.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = sg;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  foschia(ctx, H * 0.41, 88, `rgba(252,226,174,${0.26 + 0.18 * vampaTimbro})`);

  // Il Viandante attraversa la spianata da sinistra a destra, sulla sua riga: STATURA × FALCATA metri a ogni ciclo di passo
  const camm = CAMMINATE[1];
  const distanza = distanzaDi(MACCHINA, RIGA);
  const metriAlSecondo = STATURA * FALCATA * AMPIEZZA * camm.cad;
  const parte = aTerra(MACCHINA, 0, distanza);
  const posto = aTerra(MACCHINA, (PARTE_DA - MACCHINA.fugaX) / parte.scala + metriAlSecondo * tr0, distanza);
  const fase = faseDiPasso(t, camm) - 0.25;                    // il tallone tocca terra sul suono del passo (fasi ,25 e ,75)

  // La polvere si alza dove il tallone ha toccato, e lì resta mentre lui va avanti
  const tallone = (FALCATA * AMPIEZZA * 0.25) * posto.alto;    // quanto sta avanti all'anca il tallone che tocca
  for (let k = Math.floor((fase + 1) * 2) - 1, n = 0; n < 4; k--, n++) {
    const tk = camm.da + (0.25 + k * 0.5) / camm.cad, eta = t - tk;
    if (tk < camm.da || eta < 0 || eta > 1.1) continue;
    const px = PARTE_DA + metriAlSecondo * (tk - 17.6) * posto.scala + tallone - eta * 14;
    const py = posto.y - 4 - eta * 22, rad = 10 + eta * 46;
    const alfa = (1 - eta / 1.1) * 0.34 * smoothstep(0, 0.08, eta);
    const gp = ctx.createRadialGradient(px, py, 1, px, py, rad);
    gp.addColorStop(0, `rgba(236,196,132,${alfa})`);
    gp.addColorStop(1, "rgba(236,196,132,0)");
    ctx.fillStyle = gp;
    ctx.beginPath(); ctx.arc(px, py, rad, 0, Math.PI * 2); ctx.fill();
  }

  const figura: OpzioniFigura = { vista: "profilo", verso: 1, luce: LUCE, ampiezza: AMPIEZZA, tanica: true, coperta: true, cappello: true };
  disegnaOmbraFigura(ctx, posto.x, posto.y, posto.alto, fase, figura, -0.42, -0.17, "#2a1808", 0.46);
  disegnaFigura(ctx, posto.x, posto.y, posto.alto, fase, figura);

  ctx.restore();

  polvere(ctx, t, 58, "rgba(255,224,162,0.28)", 14, -20);
  vignetta(ctx, 0.38);
}
