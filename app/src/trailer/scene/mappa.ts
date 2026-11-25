// ====================================================================
//  E · LA MAPPA · SETTE ZONE  (31.0 → 49.0s)
//  Carta Fisica d'autore su pergamena calda (in continuità visiva con la
//  mappa pieghevole di partita): curve di livello a inchiostro seppia, alvei
//  secchi, pieghe del foglio, bussola cartografica, tracciato a china che
//  avanza di tappa in tappa e simboli incisi a mano (ordine dei veli corretto:
//  la tappa attiva brilla nitida sopra il velo di lettura).
// ====================================================================
import { W, H, BANDA, TAPPE_T0, TAPPE_PASSO } from "../scaletta";
import { ZONE } from "../zone";
import { clamp, easeInOut, easeOut, lerp, rng, seg, smoothstep } from "../tempo";
import { FONT } from "../font";
import { grana, inquadra, nubi, oscillaCamera, tela, vignetta } from "../pittura";
import { tr } from "../../lib/lingua";
import type { Cache } from "../cache";

/** Indice 1..7 della tappa mostrata al tempo `t` (usato dal contatore in Trailer.tsx). */
export function tappaCorrente(t: number): number {
  return clamp(Math.floor((t - TAPPE_T0) / TAPPE_PASSO) + 1, 1, 7);
}

const PUNTI: [number, number][] = [
  [270, 742], [536, 668], [790, 594], [1052, 540], [1296, 456], [1508, 362], [1686, 276],
];

// Tinte d'inchiostro calde per le tappe sulla pergamena (leggibili e coerenti con la Carta Fisica)
const INCHIOSTRI_ZONA = [
  "#2a5c55", "#9c5618", "#355d6e", "#9e5a14", "#9e351e", "#464d7c", "#9a2228",
];

function puntoSu(pts: [number, number][], u: number): [number, number] {
  const n = pts.length - 1, f = clamp(u) * n, i = Math.min(n - 1, Math.floor(f)), k = f - i;
  const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n, i + 2)];
  const catmull = (a: number, b: number, c: number, d: number) =>
    0.5 * ((2 * b) + (-a + c) * k + (2 * a - 5 * b + 4 * c - d) * k * k + (-a + 3 * b - 3 * c + d) * k * k * k);
  return [catmull(p0[0], p1[0], p2[0], p3[0]), catmull(p0[1], p1[1], p2[1], p3[1])];
}

export function preparaMappa(c: Cache) {
  if (c.mappa) return;
  const PADX = 360, PADY = 220;
  const CW = W + PADX * 2, CH = H + PADY * 2;
  const carta = tela(CW, CH, (g) => {
    g.translate(PADX, PADY);
    // 1. Fondo di pergamena fisica calda esteso oltre i bordi così le carrellate ravvicinate non scoprono mai il nero
    const rg = g.createRadialGradient(W * 0.54, H * 0.48, 90, W * 0.52, H * 0.5, 1480);
    rg.addColorStop(0, "#dfd1b0");
    rg.addColorStop(0.52, "#cbb892");
    rg.addColorStop(0.82, "#a68e67");
    rg.addColorStop(1, "#5c472e");
    g.fillStyle = rg; g.fillRect(-PADX, -PADY, CW, CH);

    // Macchie d'acqua antica e rilievo orografico caldo verso l'Appennino (destra/alto)
    nubi(g, 131, H, "rgba(112,82,46,0.12)", 1.25);
    const ombraRilievo = g.createLinearGradient(W * 0.35, H * 0.85, W * 0.92, H * 0.12);
    ombraRilievo.addColorStop(0, "rgba(90,66,38,0)");
    ombraRilievo.addColorStop(0.65, "rgba(86,60,34,0.12)");
    ombraRilievo.addColorStop(1, "rgba(68,46,26,0.26)");
    g.fillStyle = ombraRilievo; g.fillRect(-PADX, -PADY, CW, CH);

    // 2. Reticolo cartografico fine (graticola geografica a matita seppia su tutta la pergamena)
    g.strokeStyle = "rgba(74,52,30,0.11)"; g.lineWidth = 1;
    for (let x = -320; x < W + PADX; x += 160) { g.beginPath(); g.moveTo(x, -PADY); g.lineTo(x, H + PADY); g.stroke(); }
    for (let y = -140; y < H + PADY; y += 140) { g.beginPath(); g.moveTo(-PADX, y); g.lineTo(W + PADX, y); g.stroke(); }

    // 3. Curve di livello orografiche in inchiostro bruno (più fitte salendo verso il paese, le colline e il guado)
    const r = rng(144);
    const cime = [
      { cx: 520, cy: 360, rx: 280, ry: 170, anelli: 6 },
      { cx: 980, cy: 760, rx: 320, ry: 180, anelli: 6 },
      { cx: 1290, cy: 450, rx: 290, ry: 210, anelli: 8 },
      { cx: 1520, cy: 350, rx: 340, ry: 230, anelli: 10 },
      { cx: 1710, cy: 265, rx: 290, ry: 210, anelli: 9 },
      { cx: 810, cy: 260, rx: 240, ry: 150, anelli: 5 },
    ];
    for (const m of cime) {
      const f1 = r() * 6, f2 = r() * 6;
      for (let k = 1; k <= m.anelli; k++) {
        const s = k / m.anelli;
        const direttrice = k % 4 === 0;
        g.strokeStyle = direttrice ? "rgba(68,46,26,0.28)" : "rgba(78,54,32,0.15)";
        g.lineWidth = direttrice ? 1.45 : 0.95;
        g.beginPath();
        for (let a = 0; a <= 72; a++) {
          const ang = (a / 72) * Math.PI * 2;
          const d = 1 + 0.16 * Math.sin(ang * 3 + f1) + 0.09 * Math.cos(ang * 5 + f2);
          const px = m.cx + Math.cos(ang) * m.rx * s * d;
          const py = m.cy + Math.sin(ang) * m.ry * s * d;
          if (a === 0) g.moveTo(px, py); else g.lineTo(px, py);
        }
        g.stroke();
      }
    }

    // 4. Alvei secchi dei torrenti e dell'invaso (tratteggio cartografico bruno-ardesia)
    g.save();
    g.strokeStyle = "rgba(64,58,52,0.34)";
    g.lineWidth = 1.6;
    g.setLineDash([7, 5]);
    g.beginPath();
    g.moveTo(710, 470); g.bezierCurveTo(760, 550, 815, 620, 770, 720);
    g.moveTo(1640, 140); g.bezierCurveTo(1665, 235, 1705, 315, 1785, 420);
    g.stroke();
    g.restore();

    // 5. Le due pieghe verticali del foglio tascabile (come in Mappa.tsx)
    for (const fx of [W / 3, (W * 2) / 3]) {
      g.strokeStyle = "rgba(58,38,18,0.18)"; g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(fx, 0); g.lineTo(fx, H); g.stroke();
      g.strokeStyle = "rgba(255,246,224,0.22)"; g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(fx + 2, 0); g.lineTo(fx + 2, H); g.stroke();
    }

    // 6. Rosa dei venti incisa a penna in basso a destra
    const rx = W - 178, ry = H - BANDA - 112, rr = 44;
    g.save();
    g.translate(rx, ry);
    g.strokeStyle = "rgba(54,36,20,0.58)"; g.fillStyle = "rgba(54,36,20,0.68)"; g.lineWidth = 1.3;
    g.beginPath(); g.arc(0, 0, rr, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.arc(0, 0, rr - 6, 0, Math.PI * 2); g.stroke();
    for (let k = 0; k < 4; k++) {
      g.save(); g.rotate((k * Math.PI) / 2);
      g.beginPath(); g.moveTo(0, -rr - 8); g.lineTo(6, -8); g.lineTo(0, 0); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(0, -rr - 8); g.lineTo(-6, -8); g.lineTo(0, 0); g.closePath(); g.stroke();
      g.restore();
    }
    g.font = `italic 600 16px ${FONT.serif}`;
    g.textAlign = "center"; g.fillText("N", 0, -rr - 16);
    g.restore();

    // 7. Cornice graduata interna + grana di fibra + ombra calda ai margini per garantire contrasto netto alle scritte del trailer
    g.strokeStyle = "rgba(58,38,20,0.42)"; g.lineWidth = 2;
    g.strokeRect(54, BANDA + 20, W - 108, H - BANDA * 2 - 40);
    g.strokeStyle = "rgba(58,38,20,0.22)"; g.lineWidth = 1;
    g.strokeRect(62, BANDA + 28, W - 124, H - BANDA * 2 - 56);
    grana(g, 0, 0, W, H, 2600, "rgba(52,34,16,0.08)", 151);

    // Vignettatura bruno-carbone morbida estesa anche al margine di sbordo
    const vSx = g.createRadialGradient(W * 0.54, H * 0.46, 360, W * 0.5, H * 0.5, 1460);
    vSx.addColorStop(0, "rgba(24,16,10,0)");
    vSx.addColorStop(0.68, "rgba(24,16,10,0.26)");
    vSx.addColorStop(1, "rgba(14,10,8,0.82)");
    g.fillStyle = vSx; g.fillRect(-PADX, -PADY, CW, CH);
  });

  const traccia: [number, number][] = [];
  for (let i = 0; i <= 240; i++) traccia.push(puntoSu(PUNTI, i / 240));
  c.mappa = { carta, traccia, padX: PADX, padY: PADY };
}

function simbolo(ctx: CanvasRenderingContext2D, i: number, r: number) {
  ctx.beginPath();
  switch (i) {
    case 0: // stazione: binario con traversine
      ctx.moveTo(-r, -r * 0.42); ctx.lineTo(r, -r * 0.42);
      ctx.moveTo(-r, r * 0.42); ctx.lineTo(r, r * 0.42);
      for (let x = -r * 0.7; x <= r * 0.75; x += r * 0.46) { ctx.moveTo(x, -r * 0.7); ctx.lineTo(x, r * 0.7); }
      break;
    case 1: // piana: spiga secca
      ctx.moveTo(0, r); ctx.lineTo(0, -r);
      for (let y = -r * 0.55; y <= r * 0.35; y += r * 0.42) {
        ctx.moveTo(0, y); ctx.lineTo(-r * 0.55, y - r * 0.32);
        ctx.moveTo(0, y); ctx.lineTo(r * 0.55, y - r * 0.32);
      }
      break;
    case 2: // invaso: muro di diga ad arco
      ctx.arc(0, -r * 0.25, r * 0.9, 0.25, Math.PI - 0.25);
      ctx.moveTo(-r * 0.5, r * 0.55); ctx.lineTo(-r * 0.5, r * 0.95);
      ctx.moveTo(r * 0.5, r * 0.55); ctx.lineTo(r * 0.5, r * 0.95);
      break;
    case 3: // statale: piloni del viadotto
      ctx.moveTo(-r, -r * 0.35); ctx.lineTo(r, -r * 0.35);
      ctx.moveTo(-r * 0.55, -r * 0.35); ctx.lineTo(-r * 0.55, r * 0.85);
      ctx.moveTo(r * 0.55, -r * 0.35); ctx.lineTo(r * 0.55, r * 0.85);
      break;
    case 4: // paese: campanile e tetto
      ctx.moveTo(-r * 0.65, r * 0.8); ctx.lineTo(-r * 0.65, -r * 0.15);
      ctx.lineTo(0, -r * 0.9); ctx.lineTo(r * 0.65, -r * 0.15); ctx.lineTo(r * 0.65, r * 0.8);
      ctx.moveTo(-r * 0.85, r * 0.8); ctx.lineTo(r * 0.85, r * 0.8);
      break;
    case 5: // colline: doppia cresta e vento
      ctx.moveTo(-r, r * 0.55); ctx.lineTo(-r * 0.3, -r * 0.5); ctx.lineTo(r * 0.2, r * 0.15);
      ctx.lineTo(r * 0.68, -r * 0.35); ctx.lineTo(r, r * 0.55);
      break;
    case 6: // guado: due sponde e acqua in mezzo
      ctx.moveTo(-r, -r * 0.42); ctx.quadraticCurveTo(0, -r * 0.8, r, -r * 0.42);
      ctx.moveTo(-r, r * 0.42); ctx.quadraticCurveTo(0, r * 0.8, r, r * 0.42);
      ctx.moveTo(-r * 0.45, 0); ctx.lineTo(r * 0.45, 0);
      break;
  }
  ctx.stroke();
}

export function disegnaMappa(ctx: CanvasRenderingContext2D, t: number, c: Cache) {
  preparaMappa(c);
  const prog = clamp((t - TAPPE_T0) / (7 * TAPPE_PASSO));
  const [fx, fy] = puntoSu(PUNTI, prog);
  const allarga = smoothstep(46.2, 48.6, t);
  const zoom = lerp(1.38, 1.0, allarga);
  const cx = lerp(fx, W / 2, allarga), cy = lerp(fy, H / 2, allarga);

  // Tappa attualmente illuminata
  let attiva = -1;
  for (let i = 0; i < 7; i++) {
    if (t >= TAPPE_T0 + i * TAPPE_PASSO - 0.15) attiva = i;
  }

  ctx.save();
  inquadra(ctx, zoom, (W / 2 - cx) * zoom, (H / 2 - cy) * zoom);
  oscillaCamera(ctx, t, 1.2);

  ctx.drawImage(c.mappa.carta, -c.mappa.padX, -c.mappa.padY);

  const traccia: [number, number][] = c.mappa.traccia;
  // Strada ancora non percorsa: tratteggio fine a matita bruna (come .mp-accennata in partita)
  ctx.save();
  ctx.strokeStyle = "rgba(63,46,30,0.42)";
  ctx.lineWidth = 2.0 / zoom;
  ctx.setLineDash([5 / zoom, 6 / zoom]);
  ctx.beginPath();
  traccia.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();
  ctx.restore();

  // Tratto percorso: strada a doppio filetto d'inchiostro con anima ocra chiara (come .mp-statale)
  const n = Math.max(1, Math.floor(easeInOut(prog) * (traccia.length - 1)));
  if (n > 1) {
    ctx.save();
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.strokeStyle = "#2b1e14";
    ctx.lineWidth = 6.2 / zoom;
    ctx.beginPath();
    for (let k = 0; k <= n; k++) { const [x, y] = traccia[k]; if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
    ctx.stroke();

    ctx.strokeStyle = "#f0d27a";
    ctx.lineWidth = 2.6 / zoom;
    ctx.beginPath();
    for (let k = 0; k <= n; k++) { const [x, y] = traccia[k]; if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
    ctx.stroke();
    ctx.restore();
  }

  // Segno vivo in punta di penna sul punto corrente del cammino
  if (prog > 0 && prog < 1) {
    const g = ctx.createRadialGradient(fx, fy, 1, fx, fy, 28 / zoom);
    g.addColorStop(0, "rgba(186,48,32,0.52)");
    g.addColorStop(1, "rgba(186,48,32,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(fx, fy, 28 / zoom, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#9a2418";
    ctx.strokeStyle = "#efe3c6";
    ctx.lineWidth = 2 / zoom;
    ctx.beginPath(); ctx.arc(fx, fy, 4.8 / zoom, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }

  // Le sette tappe (prima quelle non attive, poi il velo scuro di lettura in basso, infine la tappa attiva nitida: B21)
  const disegnaTappa = (i: number, inPrimoPiano: boolean) => {
    const z = ZONE[i], [px, py] = PUNTI[i];
    const ti = TAPPE_T0 + i * TAPPE_PASSO;
    const acceso = easeOut(seg(t, ti - 0.15, ti + 0.55));
    const qui = clamp(1 - Math.abs(t - (ti + TAPPE_PASSO * 0.45)) / (TAPPE_PASSO * 0.7));
    const colInchiostro = INCHIOSTRI_ZONA[i];

    ctx.save();
    ctx.translate(px, py);

    if (acceso > 0 && (inPrimoPiano || qui > 0.05)) {
      const aR = (30 + qui * 24) / zoom;
      const g = ctx.createRadialGradient(0, 0, 2, 0, 0, aR);
      g.addColorStop(0, `${z.a}55`);
      g.addColorStop(0.55, `${colInchiostro}28`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(0, 0, aR, 0, Math.PI * 2); ctx.fill();
    }

    const r = (13 + acceso * 5 + qui * 3.5) / zoom;
    ctx.fillStyle = acceso > 0 ? "#efe4c8" : "#d8caa8";
    ctx.strokeStyle = qui > 0.35 ? "#9a2418" : acceso > 0 ? "#2b1e14" : "rgba(68,48,28,0.55)";
    ctx.lineWidth = (acceso > 0 ? 2.4 : 1.4) / zoom;
    if (acceso <= 0) ctx.setLineDash([3 / zoom, 2.5 / zoom]);
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.setLineDash([]);

    // Anello doppio sulle tappe raggiunte
    if (acceso > 0) {
      ctx.strokeStyle = qui > 0.35 ? "rgba(154,36,24,0.45)" : "rgba(43,30,20,0.32)";
      ctx.lineWidth = 1.1 / zoom;
      ctx.beginPath(); ctx.arc(0, 0, r + 4 / zoom, 0, Math.PI * 2); ctx.stroke();
    }

    ctx.strokeStyle = qui > 0.35 ? "#9a2418" : acceso > 0 ? colInchiostro : "rgba(72,52,32,0.55)";
    ctx.lineWidth = (acceso > 0 ? 1.85 : 1.25) / zoom;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    simbolo(ctx, i, r * 0.56);

    if (acceso > 0) {
      const sopra = i % 2 === 0 ? -1 : 1;
      const ey = sopra * (r + 22 / zoom);
      ctx.globalAlpha = acceso;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = `700 ${16 / zoom}px ${FONT.serif}`;
      const nomeTappa = tr(z.n, z.en.n);
      // Bordino chiaro di riserva tipografica come sulle carte stampate (.mp-nome-tappa)
      ctx.strokeStyle = "rgba(236,224,196,0.92)";
      ctx.lineWidth = 4.2 / zoom;
      ctx.lineJoin = "round";
      ctx.strokeText(nomeTappa, 0, ey);
      ctx.fillStyle = qui > 0.35 ? "#7e1810" : "#261a10";
      ctx.fillText(nomeTappa, 0, ey);

      ctx.font = `600 ${10.5 / zoom}px ${FONT.mono}`;
      ctx.fillStyle = "rgba(74,50,28,0.82)";
      ctx.fillText(`0${i + 1}`, 0, ey + sopra * (15 / zoom));
    }
    ctx.restore();
  };

  for (let i = 0; i < 7; i++) {
    if (i !== attiva) disegnaTappa(i, false);
  }
  ctx.restore();

  // Velo caldo bruno-scuro in basso a sinistra e in alto a sinistra per leggere nitidamente i testi di Trailer.tsx,
  // steso PRIMA del richiamo luminoso della tappa attiva (risolve B21)
  const gBasso = ctx.createLinearGradient(0, H - BANDA - 250, 0, H - BANDA);
  gBasso.addColorStop(0, "rgba(14,10,8,0)");
  gBasso.addColorStop(0.55, "rgba(14,10,8,0.58)");
  gBasso.addColorStop(1, "rgba(10,8,6,0.84)");
  ctx.fillStyle = gBasso;
  ctx.fillRect(0, H - BANDA - 250, W, 250 + BANDA);

  const gAlto = ctx.createLinearGradient(0, BANDA, 0, BANDA + 190);
  gAlto.addColorStop(0, "rgba(12,9,7,0.74)");
  gAlto.addColorStop(0.55, "rgba(12,9,7,0.34)");
  gAlto.addColorStop(1, "rgba(12,9,7,0)");
  ctx.fillStyle = gAlto;
  ctx.fillRect(0, 0, W, BANDA + 190);

  // La tappa attiva in primo piano sopra ogni velo, così non risulta mai spenta
  if (attiva >= 0) {
    ctx.save();
    inquadra(ctx, zoom, (W / 2 - cx) * zoom, (H / 2 - cy) * zoom);
    oscillaCamera(ctx, t, 1.2);
    disegnaTappa(attiva, true);
    ctx.restore();
  }

  vignetta(ctx, 0.42);
}
