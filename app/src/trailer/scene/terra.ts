// ====================================================================
//  C · LA TERRA SENZA ACQUA  (17.6 → 25.6s)
//  Tavola dipinta a gouache e china dei calanchi e delle zolle d'argilla
//  incurvate dal sole + riverbero termico vivo all'orizzonte, sole a picco,
//  polvere secca alzata a ogni passo in sincrono con CAMMINATE[1].
//  La fascia centro-sinistra resta luminosa per ospitare il timbro scuro
//  «la secca / dieci anni senza pioggia» (#3b2415).
// ====================================================================
import { W, H, CAMMINATE, faseDiPasso } from "../scaletta";
import { clamp, lerp, rng, smoothstep } from "../tempo";
import { foschia, inquadra, oscillaCamera, polvere, tela, vignetta } from "../pittura";
import { disegnaOmbra, disegnaViandante } from "../viandante";
import type { Cache } from "../cache";
import { disegnaTavola, tavoleTrailer } from "../tavole";

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

  // Il Viandante che attraversa la spianata d'argilla sulla destra coi passi agganciati a CAMMINATE[1]
  const vx = lerp(W * 0.44, W * 0.78, u);
  const vy = H * 0.625 + Math.sin(u * Math.PI) * 6;
  const fase = faseDiPasso(t, CAMMINATE[1]);

  const rPolv = rng(211);
  for (let k = 0; k < 5; k++) {
    const eta = (((fase * 2 + k * 0.37) % 1) + 1) % 1;
    const px = vx - 18 - eta * 64 - rPolv() * 14;
    const py = vy - 2 - eta * 18;
    const rad = 8 + eta * 26;
    const alfa = (1 - eta) * 0.24 * smoothstep(0.05, 0.2, eta);
    const gp = ctx.createRadialGradient(px, py, 1, px, py, rad);
    gp.addColorStop(0, `rgba(232,184,116,${alfa})`);
    gp.addColorStop(1, "rgba(232,184,116,0)");
    ctx.fillStyle = gp;
    ctx.beginPath(); ctx.arc(px, py, rad, 0, Math.PI * 2); ctx.fill();
  }

  const opzTerra = {
    colore: "#24160d",
    lontano: "#160d07",
    bordo: "#ffe3a2",
    latoLuce: -1,
    verso: 1,
    ampiezza: 0.88,
    tanica: true,
    fagotto: true,
    cappello: true,
    polvere: "#d8a868",
    dettaglio: 2 as const,
  };
  disegnaOmbra(ctx, vx, vy, 132, fase, opzTerra, 0.65, -0.18, "rgba(28,16,8,0.42)");
  disegnaViandante(ctx, vx, vy, 132, fase, opzTerra);

  ctx.restore();

  polvere(ctx, t, 58, "rgba(255,224,162,0.28)", 14, -20);
  vignetta(ctx, 0.38);
}
