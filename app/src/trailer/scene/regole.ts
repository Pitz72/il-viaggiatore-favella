// ====================================================================
//  F · CINQUE MODI   (48.3 → 59.5s)
//  H · LE CINQUE REGOLE (65.4 → 77.6s)
//  I/J · RESPIRO DEI NUMERI E DEL TITOLO (77.0 → fine)
// --------------------------------------------------------------------
//   Tavole simboliche riallineate allo stile gouache e china: chiaroscuro
//  caldo dietro i cinque medaglioni dipinti e tessere scolpite d'osso e
//  pietra incisa al posto delle pillole rosa in «La violenza costa».
// ====================================================================
import { W, H, REGOLA_DUR, CINQUE_T0, CINQUE_PASSO } from "../scaletta";
import { REGOLE } from "../zone";
import { clamp, easeOut, expoOut, inviluppo, lerp, rng, seg, smoothstep } from "../tempo";
import { oscillaCamera, polvere, vignetta } from "../pittura";

const REGOLA_T0 = 67.8;

export function disegnaCinque(ctx: CanvasRenderingContext2D, t: number) {
  // Fondale materico carbone-seppia con luci calde dietro i cinque medaglioni dipinti
  const bg = ctx.createRadialGradient(W / 2, H * 0.44, 60, W / 2, H * 0.5, 1040);
  bg.addColorStop(0, "#191518");
  bg.addColorStop(0.6, "#100e12");
  bg.addColorStop(1, "#070609");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  // Coni morbidi di luce d'accento che si accendono dietro ciascuna colonna quando entra
  const accenti = ["#7fc8bd", "#a9dbe4", "#f2ad45", "#ec7d54", "#9aa6e0"];
  const passoCol = 342;
  const x0 = W / 2 - 2 * passoCol;
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  for (let i = 0; i < 5; i++) {
    const e = easeOut(seg(t, CINQUE_T0 + i * CINQUE_PASSO, CINQUE_T0 + i * CINQUE_PASSO + 1.0));
    if (e <= 0) continue;
    const cx = x0 + i * passoCol, cy = 402;
    const g = ctx.createRadialGradient(cx, cy, 8, cx, cy, 220);
    g.addColorStop(0, `${accenti[i]}26`);
    g.addColorStop(0.55, `${accenti[i]}0c`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = e * (1 - smoothstep(58.8, 59.5, t));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx, cy, 220, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  polvere(ctx, t, 38, "rgba(232,206,168,0.22)", 7, -9);
  vignetta(ctx, 0.68);
}

export function disegnaRespiro(ctx: CanvasRenderingContext2D, t: number, colore: string, caldo: boolean) {
  ctx.fillStyle = caldo ? "#090708" : "#07090d";
  ctx.fillRect(0, 0, W, H);
  const respiro = 0.85 + 0.15 * Math.sin(t * 1.1);
  const g = ctx.createRadialGradient(W / 2, H * 0.5, 10, W / 2, H * 0.5, 760 * respiro);
  g.addColorStop(0, colore + (caldo ? "2b" : "1e"));
  g.addColorStop(0.5, colore + "0b");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  polvere(ctx, t, caldo ? 45 : 30, caldo ? "rgba(255,205,150,0.28)" : "rgba(200,225,240,0.2)", 6, -8);
  vignetta(ctx, 0.72);
}

export function disegnaRegola(ctx: CanvasRenderingContext2D, t: number) {
  const idx = clamp(Math.floor((t - REGOLA_T0) / REGOLA_DUR), 0, 4);
  const t0 = REGOLA_T0 + idx * REGOLA_DUR;
  const u = clamp((t - t0) / REGOLA_DUR);
  const v = inviluppo(t, t0, t0 + REGOLA_DUR, 0.25, 0.28);
  const acc = REGOLE[idx].a;

  // Fondo carta-carbone calda da romanzo grafico
  const bg = ctx.createRadialGradient(W * 0.66, H * 0.5, 40, W * 0.55, H * 0.5, 1020);
  bg.addColorStop(0, "#171418");
  bg.addColorStop(0.65, "#0d0b0f");
  bg.addColorStop(1, "#060508");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  ctx.save();
  oscillaCamera(ctx, t, 1.4);
  const g = ctx.createRadialGradient(W * 0.68, H * 0.5, 20, W * 0.68, H * 0.5, 580);
  g.addColorStop(0, acc + "28");
  g.addColorStop(0.55, acc + "0a");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.globalAlpha = v;
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  ctx.translate(W * 0.68, H * 0.5);
  ctx.globalAlpha = v;
  switch (idx) {
    case 0: spina(ctx, u, acc); break;
    case 1: moneta(ctx, u, acc, t); break;
    case 2: porta(ctx, u, acc); break;
    case 3: vita(ctx, u); break;
    case 4: albero(ctx, u, acc); break;
  }
  ctx.restore();

  polvere(ctx, t, 28, "rgba(232,212,182,0.18)", 6, -6);
  vignetta(ctx, 0.68);
}

// 1 · La sete è la spina dorsale — anfora/colonna vertebrale incisa a china che si prosciuga
function spina(ctx: CanvasRenderingContext2D, u: number, acc: string) {
  const liv = lerp(0.86, 0.14, easeOut(clamp(u * 1.15)));
  const h = 380, w = 86;

  // Ombra profonda e corpo d'osso/terracotta scolpito
  ctx.save();
  ctx.fillStyle = "#1d1816";
  ctx.strokeStyle = "#120e0d";
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.roundRect(-w / 2 - 8, -h / 2 - 8, w + 16, h + 16, 22); ctx.fill(); ctx.stroke();

  // Cornice in bronzo antico
  ctx.strokeStyle = "rgba(218,176,112,0.52)";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 16); ctx.stroke();

  // Colonna d'acqua ambrata interna che cala lasciando incrostazioni di sale
  const ah = (h - 16) * liv;
  const g = ctx.createLinearGradient(0, h / 2 - 8 - ah, 0, h / 2 - 8);
  g.addColorStop(0, "#ffd89a");
  g.addColorStop(0.35, acc);
  g.addColorStop(1, "#6e4219");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(-w / 2 + 8, h / 2 - 8 - ah, w - 16, ah, 10);
  ctx.fill();

  // Tacche vertebrali incise a china lungo l'asse
  for (let k = 1; k < 10; k++) {
    const yy = -h / 2 + (h / 10) * k;
    const bagnata = yy > h / 2 - 8 - ah;
    ctx.strokeStyle = bagnata ? "rgba(24,15,10,0.55)" : "rgba(218,188,144,0.28)";
    ctx.lineWidth = k === 5 ? 2.6 : 1.5;
    const sporg = k % 2 === 0 ? 22 : 14;
    ctx.beginPath();
    ctx.moveTo(-w / 2 - sporg, yy); ctx.lineTo(-w / 2 + 18, yy);
    ctx.moveTo(w / 2 - 18, yy); ctx.lineTo(w / 2 + sporg, yy);
    ctx.stroke();
  }
  ctx.restore();
}

// 2 · L'acqua è la moneta — antica moneta battuta in bronzo e ardesia con goccia a rilievo
function moneta(ctx: CanvasRenderingContext2D, u: number, acc: string, t: number) {
  const p = expoOut(clamp(u * 1.6));
  const rMoneta = 118 * p;

  ctx.save();
  // Disco coniato irregolare in bronzo scuro e acquamarina
  if (rMoneta > 4) {
    const gm = ctx.createRadialGradient(-28, -32, 8, 0, 0, rMoneta);
    gm.addColorStop(0, "#32444c");
    gm.addColorStop(0.7, "#1a2329");
    gm.addColorStop(1, "#0f1418");
    ctx.fillStyle = gm;
    ctx.strokeStyle = "#110e0d";
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(0, 0, rMoneta, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    // I due filetti interni compaiono solo quando il disco è abbastanza largo da contenerli: nei primi tre centesimi
    // di secondo la moneta nasce da zero, e un cerchio di raggio negativo (rMoneta − 10, rMoneta − 20) faceva fallire
    // `arc`, fermando l'orologio del trailer su un quadro quasi nero (69,65 s: restavano solo musica e voce).
    if (rMoneta > 24) {
      ctx.strokeStyle = `${acc}88`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, rMoneta - 10, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = "rgba(218,188,144,0.38)";
      ctx.beginPath(); ctx.arc(0, 0, rMoneta - 20, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // Goccia scolpita al centro a gouache luminosa e china
  const s = 1.05 * p;
  ctx.save(); ctx.scale(s, s);
  const gg = ctx.createLinearGradient(-22, -55, 24, 52);
  gg.addColorStop(0, "#e8fbff");
  gg.addColorStop(0.45, acc);
  gg.addColorStop(1, "#2f5f6b");
  ctx.fillStyle = gg;
  ctx.strokeStyle = "#10161b";
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(0, -64);
  ctx.bezierCurveTo(44, -8, 48, 44, 0, 56);
  ctx.bezierCurveTo(-48, 44, -44, -8, 0, -64);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  // Riflesso bianco a mezzaluna sulla goccia
  ctx.strokeStyle = "rgba(255,255,255,0.68)";
  ctx.lineWidth = 2.6;
  ctx.lineCap = "round";
  ctx.beginPath(); ctx.arc(-12, 16, 20, Math.PI * 0.72, Math.PI * 1.28); ctx.stroke();
  ctx.restore();

  // Onde concentriche d'acqua viva fuori dal conio
  for (let i = 0; i < 3; i++) {
    const k = ((u * 1.35 + i * 0.33) % 1);
    const rr = 124 + k * 145;
    ctx.strokeStyle = acc;
    ctx.globalAlpha *= (1 - k) * 0.52;
    ctx.lineWidth = 2.0;
    ctx.beginPath(); ctx.arc(0, Math.sin(t + i) * 1.5, rr, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}

// 3 · La fiducia apre le porte — arco in pietra a secco e battente di legno che si schiude sulla luce calda
function porta(ctx: CanvasRenderingContext2D, u: number, acc: string) {
  const ap = easeOut(seg(u, 0.12, 0.86));
  const w = 188, h = 308;

  ctx.save();
  // Luce interna d'osteria/casa che dilaga sul pavimento quando l'anta si apre
  const lg = ctx.createRadialGradient(-w * 0.1, 0, 8, 0, 30, 310);
  lg.addColorStop(0, `rgba(255,222,158,${0.86 * ap})`);
  lg.addColorStop(0.42, `${acc}${Math.round(ap * 115).toString(16).padStart(2, "0")}`);
  lg.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = lg;
  ctx.beginPath();
  ctx.moveTo(-w / 2, -h / 2); ctx.lineTo(w / 2, -h / 2);
  ctx.lineTo(w * 1.45, h / 2 + 95); ctx.lineTo(-w * 1.05, h / 2 + 95);
  ctx.closePath(); ctx.fill();

  // Stipite in conci di pietra scolpita a gouache e china
  ctx.fillStyle = "#2b2522";
  ctx.strokeStyle = "#120f0d";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(-w / 2 - 22, -h / 2 - 22, w + 44, h + 22, [28, 28, 4, 4]);
  ctx.fill(); ctx.stroke();

  // Vano luminoso interno
  const vg = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  vg.addColorStop(0, `rgba(255,228,176,${0.25 + 0.68 * ap})`);
  vg.addColorStop(1, `rgba(218,154,92,${0.18 + 0.58 * ap})`);
  ctx.fillStyle = vg;
  ctx.fillRect(-w / 2, -h / 2, w, h);

  // Conci incisi sullo stipite
  ctx.strokeStyle = "rgba(218,192,152,0.22)";
  ctx.lineWidth = 1.6;
  for (let yy = -h / 2 + 38; yy < h / 2; yy += 46) {
    ctx.beginPath();
    ctx.moveTo(-w / 2 - 22, yy); ctx.lineTo(-w / 2, yy);
    ctx.moveTo(w / 2, yy + 18); ctx.lineTo(w / 2 + 22, yy + 18);
    ctx.stroke();
  }

  // Battente di tavole inchiodate incernierato a sinistra che ruota in scorcio
  const scorcio = lerp(w, w * 0.24, ap);
  const incl = ap * 24;
  ctx.fillStyle = "#3a271b";
  ctx.strokeStyle = "#120d0a";
  ctx.lineWidth = 3.8;
  ctx.beginPath();
  ctx.moveTo(-w / 2, -h / 2);
  ctx.lineTo(-w / 2 + scorcio, -h / 2 + incl);
  ctx.lineTo(-w / 2 + scorcio, h / 2 - incl);
  ctx.lineTo(-w / 2, h / 2);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  // Doghe verticali e anello di ferro battuto
  ctx.strokeStyle = "rgba(18,12,9,0.65)";
  ctx.lineWidth = 1.8;
  for (const f of [0.33, 0.66]) {
    const xx = -w / 2 + scorcio * f;
    ctx.beginPath();
    ctx.moveTo(xx, -h / 2 + incl * f);
    ctx.lineTo(xx, h / 2 - incl * f);
    ctx.stroke();
  }
  ctx.strokeStyle = "#caa26a";
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.arc(-w / 2 + scorcio * 0.8, 8, Math.max(3, 8 * (1 - ap * 0.55)), 0, Math.PI * 2);
  ctx.stroke();

  // Soglia di pietra
  ctx.strokeStyle = "rgba(232,204,162,0.45)";
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-w / 2 - 36, h / 2 + 2); ctx.lineTo(w / 2 + 36, h / 2 + 2); ctx.stroke();
  ctx.restore();
}

// 4 · La violenza costa. Ed è evitabile — 10 tessere scolpite d'osso/travertino inciso (le ultime 4 si spaccano)
function vita(ctx: CanvasRenderingContext2D, u: number) {
  const colpo = smoothstep(0.30, 0.43, u);
  const caduta = easeOut(seg(u, 0.34, 0.88));
  const n = 10, larg = 38, alt = 88, passo = 50;
  const x0 = -((n - 1) * passo) / 2;
  const rSchegge = rng(409);

  ctx.save();
  // Filo di ferro/cuoio orizzontale su cui sono infilate le dieci tessere della vita
  ctx.strokeStyle = "rgba(168,142,108,0.34)";
  ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.moveTo(x0 - 44, 0); ctx.lineTo(-x0 + 44, 0); ctx.stroke();

  for (let i = 0; i < n; i++) {
    const persa = i >= 6;
    const k = persa ? colpo : 0;
    const x = x0 + i * passo;
    const scossa = persa && colpo > 0 && colpo < 1 ? Math.sin(u * 95 + i * 2) * 5 * (1 - colpo) : 0;
    const giu = persa ? k * (14 + (i - 6) * 5) : 0;
    const rot = persa ? k * ((i % 2 ? 1 : -1) * 0.14) : 0;

    ctx.save();
    ctx.translate(x + scossa, giu);
    ctx.rotate(rot);

    // Ombra portata
    ctx.fillStyle = "rgba(0,0,0,0.52)";
    ctx.beginPath();
    ctx.roundRect(-larg / 2 + 3, -alt / 2 + 5, larg, alt, 5);
    ctx.fill();

    // Corpo della tessera: avorio/travertino caldo per le intatte, pietra spenta cinerea per le spezzate
    const gt = ctx.createLinearGradient(-larg / 2, -alt / 2, larg / 2, alt / 2);
    if (k < 0.5) {
      gt.addColorStop(0, "#e5d7bc");
      gt.addColorStop(0.55, "#c5b18e");
      gt.addColorStop(1, "#8f7b5c");
    } else {
      gt.addColorStop(0, "#463d3f");
      gt.addColorStop(0.6, "#2c2528");
      gt.addColorStop(1, "#1b1619");
    }
    ctx.fillStyle = gt;
    ctx.strokeStyle = "#120d0c";
    ctx.lineWidth = 3.2;

    // Sagoma smussata a piastrina d'osso scolpita
    ctx.beginPath();
    ctx.moveTo(-larg / 2 + 6, -alt / 2);
    ctx.lineTo(larg / 2 - 6, -alt / 2);
    ctx.lineTo(larg / 2, -alt / 2 + 7);
    ctx.lineTo(larg / 2, alt / 2 - 7);
    ctx.lineTo(larg / 2 - 6, alt / 2);
    ctx.lineTo(-larg / 2 + 6, alt / 2);
    ctx.lineTo(-larg / 2, alt / 2 - 7);
    ctx.lineTo(-larg / 2, -alt / 2 + 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Smusso chiaro sul bordo sinistro/superiore + brace vitale calda nelle tessere integre
    ctx.strokeStyle = k < 0.5 ? "rgba(255,248,230,0.45)" : "rgba(180,90,96,0.22)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-larg / 2 + 3, alt / 2 - 8);
    ctx.lineTo(-larg / 2 + 3, -alt / 2 + 8);
    ctx.lineTo(larg / 2 - 7, -alt / 2 + 3);
    ctx.stroke();

    // Tacca incisa al centro di ogni tessera (goccia/intaglio rituale)
    ctx.fillStyle = k < 0.5 ? "#8b2d2b" : "#161113";
    ctx.beginPath();
    ctx.moveTo(0, -13);
    ctx.lineTo(6.5, 2);
    ctx.lineTo(0, 13);
    ctx.lineTo(-6.5, 2);
    ctx.closePath();
    ctx.fill();

    // Frattura frastagliata color cremisi scuro sulle ultime 4 tessere colpite
    if (persa && k > 0.08) {
      ctx.strokeStyle = `rgba(196,48,62,${0.88 * k})`;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(-larg / 2 + 2, -18 + (i - 6) * 4);
      ctx.lineTo(-4, -3);
      ctx.lineTo(5, 7);
      ctx.lineTo(larg / 2 - 2, 22 - (i - 6) * 3);
      ctx.stroke();

      ctx.strokeStyle = "#0d090a";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-4, -3); ctx.lineTo(-9, 19);
      ctx.stroke();
    }
    ctx.restore();

    // Schegge di pietra che cadono nel buio dopo il colpo
    if (persa && caduta > 0.02) {
      for (let s = 0; s < 3; s++) {
        const vxS = (rSchegge() - 0.45) * 42;
        const vyS = 32 + rSchegge() * 96;
        const sx = x + vxS * caduta;
        const sy = 18 + vyS * caduta * caduta;
        ctx.save();
        ctx.globalAlpha *= (1 - caduta) * 0.85;
        ctx.translate(sx, sy);
        ctx.rotate(caduta * (3 + s));
        ctx.fillStyle = s === 0 ? "#b84352" : "#9c8b74";
        ctx.beginPath();
        ctx.moveTo(-4, -3); ctx.lineTo(5, -1); ctx.lineTo(1, 5); ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }
  }

  // Fendente d'inchiostro cremisi che squarcia le ultime quattro tessere al momento dell'impatto
  const taglio = inviluppo(u, 0.28, 0.56, 0.06, 0.20);
  if (taglio > 0.01) {
    const xInizio = x0 + 5.4 * passo;
    const xFine = x0 + 9.6 * passo;
    ctx.save();
    ctx.strokeStyle = `rgba(224,72,92,${taglio * 0.92})`;
    ctx.lineWidth = 4.2;
    ctx.lineCap = "round";
    ctx.shadowColor = "rgba(224,72,92,0.65)";
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.moveTo(xInizio, -46);
    ctx.lineTo(lerp(xInizio, xFine, easeOut(seg(u, 0.28, 0.40))), 44);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

// 5 · Le scelte arrivano fino in fondo — albero/delta a china con la via scelta illuminata fino alla meta
interface Ramo { x1: number; y1: number; x2: number; y2: number; liv: number; scelto: boolean }
const RAMI: Ramo[] = (() => {
  const out: Ramo[] = [];
  // Percorso scelto coerente dal tronco fino a una foglia finale
  const viaScelta = [0, 1, 2, 5];
  const gen = (x: number, y: number, l: number, a: number, liv: number, idx: number, suVia: boolean) => {
    const x2 = x + Math.cos(a) * l, y2 = y + Math.sin(a) * l;
    out.push({ x1: x, y1: y, x2, y2, liv, scelto: suVia });
    if (liv >= 4) return;
    const figlioSx = idx * 2, figlioDx = idx * 2 + 1;
    const apre = 0.42 - liv * 0.04;
    gen(x2, y2, l * 0.76, a - apre, liv + 1, figlioSx, suVia && viaScelta[liv] === figlioSx);
    gen(x2, y2, l * 0.76, a + apre, liv + 1, figlioDx, suVia && viaScelta[liv] === figlioDx);
  };
  gen(-215, 0, 114, 0, 0, 0, true);
  return out;
})();

function albero(ctx: CanvasRenderingContext2D, u: number, acc: string) {
  ctx.lineCap = "round";
  for (const r of RAMI) {
    const k = easeOut(seg(u, r.liv * 0.14, r.liv * 0.14 + 0.28));
    if (k <= 0) continue;
    const x = lerp(r.x1, r.x2, k), y = lerp(r.y1, r.y2, k);
    const mx = (r.x1 + x) * 0.5, my = (r.y1 + y) * 0.5 + (r.liv % 2 ? -5 : 5) * k;

    // Tratto d'inchiostro sottostante + filo luminoso d'ambra/lavanda sulla via scelta
    ctx.strokeStyle = r.scelto ? "#f0c27b" : acc;
    ctx.globalAlpha = r.scelto ? 0.96 : 0.34 - r.liv * 0.03;
    ctx.lineWidth = Math.max(1.4, (r.scelto ? 6.2 : 4.4) - r.liv * 0.85);
    ctx.beginPath(); ctx.moveTo(r.x1, r.y1); ctx.quadraticCurveTo(mx, my, x, y); ctx.stroke();

    if (k >= 1 && r.liv === 4) {
      ctx.fillStyle = r.scelto ? "#ffe2a8" : acc;
      ctx.globalAlpha = r.scelto ? 1 : 0.62;
      ctx.beginPath(); ctx.arc(r.x2, r.y2, r.scelto ? 6.8 : 4.0, 0, Math.PI * 2); ctx.fill();
      if (r.scelto) {
        const g = ctx.createRadialGradient(r.x2, r.y2, 2, r.x2, r.y2, 28);
        g.addColorStop(0, "rgba(255,214,142,0.55)");
        g.addColorStop(1, "rgba(255,214,142,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(r.x2, r.y2, 28, 0, Math.PI * 2); ctx.fill();
      }
    }
  }
}
