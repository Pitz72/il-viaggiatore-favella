// ====================================================================
//  B · LA PARTENZA ALL'ALBA  (9.6 → 17.6s)  e  J · IL TITOLO / MENU  (81.4s → ∞)
//  Tavola dipinta a gouache e china della provinciale deserta all'alba +
//  bagliore vivo del sole all'orizzonte, nubi in deriva, stormo lontano e il
//  Viandante di spalle che si allontana lungo la strada. La tavola è ferma e
//  in prospettiva: dove sta e quanto è alto lo dice la macchina da presa
//  (prospettiva.ts), dai metri che fa a ogni passo. Sul titolo è già lontano;
//  sul menu (finale = true) si ferma, e la luce d'oro accoglie il titolo.
// ====================================================================
import { W, H, DURATA, CAMMINATE, faseDiPasso } from "../scaletta";
import { clamp, lerp, rng, smoothstep } from "../tempo";
import { foschia, grana, inquadra, nubi, oscillaCamera, polvere, raggi, tela, vignetta } from "../pittura";
import { disegnaFigura, disegnaOmbraFigura, FALCATA, type LuceFigura, type OpzioniFigura } from "../figura";
import { aTerra, integra, STATURA, type Macchina } from "../prospettiva";
import type { Cache } from "../cache";
import { disegnaTavola, tavoleTrailer } from "../tavole";

/** La macchina da presa della tavola: il punto di fuga della strada, l'orizzonte, 2,65 m da terra (la carreggiata, larga
 *  sei metri e mezzo, vale 158 px al metro dove comincia la scena), e una focale lunga (il tratteggio della mezzeria). */
const MACCHINA: Macchina = { fugaX: W * 0.273, orizzonte: H * 0.448, alta: 2.65, focale: 3000 };
/** Dove cammina: a metà della carreggiata (metri a destra dell'asse della macchina), e a quanti metri dalla macchina
 *  comincia la scena della partenza e quella del titolo. */
const CORSIA = 3.4, PARTENZA = 18.2, TITOLO = 52;
/** Il sole è davanti, a sinistra: la figura è in controluce, con un filo di luce calda sul bordo. */
const LUCE: LuceFigura = { ambiente: "#b09a94", chiave: "#ffcc94", forza: 0.8, buio: "#1e1519", fondo: 0.66, lato: -1, alto: 0.5, china: "#130c0f" };

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

  // Il Viandante di spalle. Fa STATURA × FALCATA metri a ogni ciclo di passo (due passi), alla cadenza di CAMMINATE: da
  // quei metri la macchina da presa dice dove sta e quanto è alto. Sul menu (t >= DURATA) rallenta e si ferma.
  const camm = CAMMINATE[finale ? 4 : 0];
  const tt = Math.min(t, DURATA);
  const fermoMenu = finale ? smoothstep(DURATA - 1.4, DURATA, t) : 0;
  const metriAlSecondo = STATURA * FALCATA * camm.cad;
  const strada = finale
    ? metriAlSecondo * integra((x) => 1 - smoothstep(DURATA - 1.4, DURATA, x), 81.4, Math.max(81.4, tt))
    : metriAlSecondo * tr0;
  const posto = aTerra(MACCHINA, CORSIA, (finale ? TITOLO : PARTENZA) + strada);
  const fase = faseDiPasso(tt, camm) - 0.25;                   // il tallone tocca terra sul suono del passo (fasi ,25 e ,75)
  const figura: OpzioniFigura = { vista: "spalle", luce: LUCE, fermo: fermoMenu, tanica: true, coperta: true, cappello: true, scorcio: posto.scorcio, respiro: t };
  disegnaOmbraFigura(ctx, posto.x, posto.y, posto.alto, fase, figura, -0.5, -0.4, "#1a1214", 0.4);
  disegnaFigura(ctx, posto.x, posto.y, posto.alto, fase, figura);

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
