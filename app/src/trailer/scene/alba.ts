// ====================================================================
//  B · LA PARTENZA ALL'ALBA  (9.6 → 17.6s)  e  J · IL TITOLO / MENU  (81.4s → ∞)
//  Tavola dipinta a gouache e china della provinciale deserta all'alba +
//  bagliore vivo del sole all'orizzonte, nubi in deriva, pali del telegrafo
//  in parallasse, stormo lontano e il Viandante col passo agganciato ai
//  battiti dei passi di CAMMINATE. Sul titolo/menu (finale = true) la luce
//  d'oro sale morbida e accoglie il titolo e la colonna del menu d'avvio.
// ====================================================================
import { W, H, DURATA, CAMMINATE, faseDiPasso } from "../scaletta";
import { clamp, lerp, rng, smoothstep } from "../tempo";
import { foschia, grana, inquadra, nubi, oscillaCamera, polvere, raggi, tela, vignetta } from "../pittura";
import { disegnaOmbra, disegnaViandante } from "../viandante";
import type { Cache } from "../cache";
import { disegnaTavola, tavoleTrailer } from "../tavole";

export function preparaAlba(c: Cache) {
  if (c.alba) return;
  const cieloRipiego = tela(W, 660, (g) => {
    const cg = g.createLinearGradient(0, 0, 0, 660);
    cg.addColorStop(0, "#242c3c");
    cg.addColorStop(0.45, "#685866");
    cg.addColorStop(0.76, "#c98b66");
    cg.addColorStop(1, "#f2bf86");
    g.fillStyle = cg; g.fillRect(0, 0, W, 660);
    nubi(g, 31, 420, "rgba(255,204,158,0.22)", 1.1);
  });
  const suoloRipiego = tela(W, H, (g) => {
    const sg = g.createLinearGradient(0, 480, 0, H);
    sg.addColorStop(0, "#b88a58");
    sg.addColorStop(0.4, "#7d5c3c");
    sg.addColorStop(1, "#2a1f18");
    g.fillStyle = sg; g.fillRect(0, 480, W, H - 480);
    grana(g, 0, 500, W, H - 500, 1400, "rgba(20,14,10,0.2)", 39);
  });
  const stratoNubi = tela(W + 400, 420, (g) => {
    nubi(g, 47, 360, "rgba(255,212,168,0.13)", 1.05);
    nubi(g, 53, 250, "rgba(64,58,78,0.12)", 0.85);
  });
  c.alba = { cieloRipiego, suoloRipiego, stratoNubi };
}

function disegnaPaliProspettici(ctx: CanvasRenderingContext2D, tRel: number) {
  const fugaX = W * 0.273, fugaY = H * 0.448;
  const avanzamento = ((tRel * 0.22) % 1 + 1) % 1;
  ctx.save();
  ctx.lineCap = "round"; ctx.lineJoin = "round";

  const puntiCavoSx: Array<[number, number]> = [];
  const puntiCavoDx: Array<[number, number]> = [];

  for (let i = 5; i >= 0; i--) {
    const u = (i + avanzamento) / 5.4;
    const k = Math.pow(u, 2.15);
    if (k < 0.035 || k > 1.25) continue;

    const baseX = lerp(fugaX + 18, W * 1.04, k);
    const baseY = lerp(fugaY + 4, H * 0.88, k);
    const hPalo = 360 * k;
    const cimaY = baseY - hPalo;
    const braccio = 22 * k;
    const alfa = clamp((1.22 - k) * 3.2) * clamp(k * 9);
    const ty = cimaY + 14 * k;

    ctx.save();
    ctx.globalAlpha = alfa * 0.88;
    ctx.strokeStyle = "rgba(24,18,18,0.26)";
    ctx.lineWidth = Math.max(1.2, 5.5 * k);
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.lineTo(baseX - hPalo * 1.25, baseY + hPalo * 0.14);
    ctx.stroke();

    ctx.strokeStyle = "#1e1716";
    ctx.lineWidth = Math.max(1.2, 6.2 * k);
    ctx.beginPath(); ctx.moveTo(baseX, baseY); ctx.lineTo(baseX, cimaY); ctx.stroke();

    ctx.strokeStyle = "rgba(244,186,126,0.45)";
    ctx.lineWidth = Math.max(0.8, 1.8 * k);
    ctx.beginPath(); ctx.moveTo(baseX - 1.8 * k, baseY); ctx.lineTo(baseX - 1.8 * k, cimaY); ctx.stroke();

    ctx.strokeStyle = "#1e1716";
    ctx.lineWidth = Math.max(1, 3.6 * k);
    ctx.beginPath(); ctx.moveTo(baseX - braccio, ty); ctx.lineTo(baseX + braccio, ty); ctx.stroke();
    ctx.fillStyle = "#2b2220";
    ctx.fillRect(baseX - braccio - 1.5 * k, ty - 4.5 * k, 3 * k, 4.5 * k);
    ctx.fillRect(baseX + braccio - 1.5 * k, ty - 4.5 * k, 3 * k, 4.5 * k);
    ctx.restore();

    puntiCavoSx.push([baseX - braccio, ty - 3 * k]);
    puntiCavoDx.push([baseX + braccio, ty - 3 * k]);
  }

  ctx.strokeStyle = "rgba(28,22,22,0.52)";
  ctx.lineWidth = 1.15;
  for (const serie of [puntiCavoSx, puntiCavoDx]) {
    for (let j = 0; j < serie.length - 1; j++) {
      const [x0, y0] = serie[j], [x1, y1] = serie[j + 1];
      const mx = (x0 + x1) * 0.5, my = (y0 + y1) * 0.5 + Math.hypot(x1 - x0, y1 - y0) * 0.045;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(mx, my, x1, y1); ctx.stroke();
    }
  }
  ctx.restore();
}

export function disegnaAlba(ctx: CanvasRenderingContext2D, t: number, c: Cache, finale = false) {
  preparaAlba(c);
  const tr0 = finale ? Math.max(0, Math.min(t, DURATA) - 81.4) : Math.max(0, t - 9.6);
  const u = clamp(tr0 / (finale ? 7.1 : 8.0));
  const img = tavoleTrailer.alba;

  const soleX = img ? W * 0.295 : 1420;
  const soleY = img ? lerp(H * 0.455, H * 0.415, u) : 498 - tr0 * 3.5;

  ctx.save();
  if (finale) {
    // Sul titolo e sul menu l'inquadratura si assesta solenne e respira appena
    inquadra(ctx, lerp(1.06, 1.02, u), lerp(18, 0, u), lerp(-6, 0, u));
    if (t < DURATA) oscillaCamera(ctx, t, 1.2);
  } else {
    inquadra(ctx, lerp(1.02, 1.075, u), lerp(14, -26, u), lerp(4, -8, u));
    oscillaCamera(ctx, t, 2.0);
  }

  if (img) {
    disegnaTavola(ctx, img, W, H);
  } else {
    ctx.drawImage(c.alba.cieloRipiego, 0, 0);
    ctx.drawImage(c.alba.suoloRipiego, 0, 0);
  }

  ctx.save();
  ctx.globalAlpha = 0.62;
  ctx.drawImage(c.alba.stratoNubi, -(((tr0 * 12) % 380 + 380) % 380), 0);
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const sg = ctx.createRadialGradient(soleX, soleY, 8, soleX, soleY, 620);
  const crescitaAlba = lerp(0.75, finale ? 1.18 : 1.08, smoothstep(0, 6.5, tr0));
  sg.addColorStop(0, `rgba(255,236,196,${0.42 * crescitaAlba})`);
  sg.addColorStop(0.26, `rgba(255,186,122,${0.22 * crescitaAlba})`);
  sg.addColorStop(0.64, `rgba(232,134,88,${0.08 * crescitaAlba})`);
  sg.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = sg;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  raggi(ctx, soleX, soleY, 9, 980, 0.35, 1.05, "rgba(255,212,156,0.055)", 17);
  foschia(ctx, H * 0.455, 92, "rgba(255,204,158,0.16)");

  if (!finale) {
    const ru = rng(73);
    ctx.strokeStyle = "rgba(42,32,36,0.58)"; ctx.lineWidth = 1.6;
    for (let i = 0; i < 6; i++) {
      const bx = 680 + i * 34 + tr0 * (24 + ru() * 7);
      const by = 248 + Math.sin(i * 1.7) * 18 - tr0 * 3.8;
      const ala = Math.sin(t * 6.5 + i * 1.3) * 4.5;
      ctx.beginPath();
      ctx.moveTo(bx - 6, by + ala); ctx.quadraticCurveTo(bx - 2, by - 2, bx, by);
      ctx.quadraticCurveTo(bx + 2, by - 2, bx + 6, by + ala);
      ctx.stroke();
    }
  }

  // Sul menu fermo (t >= DURATA) la figura e i pali si fermano morbidi nella luce dell'alba
  const camm = CAMMINATE[finale ? 4 : 0];
  const fermoMenu = finale ? smoothstep(DURATA - 1.4, DURATA, t) : 0;
  disegnaPaliProspettici(ctx, finale ? lerp(tr0, 5.7, fermoMenu) : tr0);

  const vx = finale ? lerp(W * 0.62, W * 0.56, u) : lerp(W * 0.56, W * 0.43, u);
  const vy = finale ? lerp(H * 0.81, H * 0.77, u) : lerp(H * 0.835, H * 0.745, u);
  const vh = finale ? lerp(152, 134, u) : lerp(176, 138, u);
  const fase = faseDiPasso(Math.min(t, DURATA), camm);
  const opzV = {
    colore: "#191314",
    lontano: "#100c0d",
    bordo: "#ffbe7e",
    latoLuce: -1,
    verso: -1,
    fermo: fermoMenu,
    tanica: true,
    fagotto: true,
    cappello: true,
    dettaglio: 2 as const,
  };
  disegnaOmbra(ctx, vx, vy, vh, fase, opzV, 1.35, -0.22, "rgba(18,12,12,0.38)");
  disegnaViandante(ctx, vx, vy, vh, fase, opzV);

  ctx.restore();

  polvere(ctx, Math.min(t, DURATA), 42, "rgba(255,214,168,0.26)", 16, -6);

  // Velo scuro caldo più intenso sul finale/menu così «IL VIAGGIATORE» e le voci del menu spiccano con contrasto pieno
  if (finale) {
    const gMenu = ctx.createLinearGradient(0, 0, W * 0.68, 0);
    gMenu.addColorStop(0, "rgba(8,7,10,0.72)");
    gMenu.addColorStop(0.58, "rgba(10,8,12,0.42)");
    gMenu.addColorStop(1, "rgba(10,8,12,0.18)");
    ctx.fillStyle = gMenu;
    ctx.fillRect(0, 0, W, H);
  } else {
    const gTesto = ctx.createLinearGradient(0, 0, W * 0.52, 0);
    gTesto.addColorStop(0, "rgba(10,8,12,0.44)");
    gTesto.addColorStop(1, "rgba(10,8,12,0)");
    ctx.fillStyle = gTesto;
    ctx.fillRect(0, 0, W * 0.52, H);
  }
  vignetta(ctx, finale ? 0.56 : 0.44);
}
