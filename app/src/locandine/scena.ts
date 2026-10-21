// ====================================================================
//  La key art: il guado al tramonto, di fronte.
// --------------------------------------------------------------------
//  La scena G del trailer (trailer/scene/guado.ts) ricomposta per le
//  immagini promozionali: il sole basso dietro il campanile di Acquamorta,
//  al centro; i due fratelli sul greto, uno per parte, di controluce, che
//  si guardano; le ombre lunghe che vengono verso di noi. Stessi colori,
//  stessa città (lo stesso seme), stesse figure del trailer, ma con le
//  misure date dal formato: la scena si allarga, si alza, si allunga in
//  basso quanto serve, e le tele si dipingono alla risoluzione dell'uscita.
//  Coordinate di progetto come nel trailer (la riva dell'acqua a y = 692);
//  in x lo zero è l'asse del sole e del campanile.
// ====================================================================
import { rng } from "../trailer/tempo";
import { alone, crinale, disegnaRaggio, nuvole, pulviscolo, raggioMorbido, type C2D, type RaggioMorbido } from "../trailer/pittura";
import { creaTela, ctxDi, fbmPeriodico, riempi, type Tela } from "../trailer/texture";
import { disegnaViandante, type OpzioniFigura } from "../trailer/viandante";

/** La riva dell'acqua, la base della città, il sole. */
export const ACQUA = 692;
const BASE_CITTA = 666;
const SOLE = { x: 0, y: 552, r: 66 };
const CITTA_W = 1300, CITTA_H = 300, CAMPANILE = 660;     // il campanile, nella tela della città
const LUCE = "rgba(255,130,96,.75)";
const BORDO = "#ff9d7a";

/** Che cosa si vede: x da sinistra a destra, y dall'alto in basso (unità di progetto). */
export interface Vista { x0: number; x1: number; y0: number; y1: number }

/** Una tela di `w × h` unità dipinta a `R` pixel per unità. */
function telaR(w: number, h: number, R: number) {
  const tela = creaTela(w * R, h * R);
  const g = ctxDi(tela);
  g.scale(R, R);
  return { tela, g };
}

// --------------------------------------------------------------------
//  Acquamorta: la stessa città del trailer (stesso seme), con la luce sul
//  lato delle case che guarda il sole, qualunque sia.
// --------------------------------------------------------------------
function citta(R: number, soleLocale: number): Tela {
  const { tela: t, g } = telaR(CITTA_W, CITTA_H, R), r = rng(61);
  const base = 250;
  g.fillStyle = "#12050b";
  let x = 30;
  const case_: { x: number; w: number; h: number }[] = [];
  while (x < CITTA_W - 60) {
    const cw = 44 + r() * 70, ch = 34 + r() * 70;
    case_.push({ x, w: cw, h: ch });
    x += cw + r() * 16;
  }
  for (const c of case_) {
    const y = base - c.h;
    g.beginPath(); g.rect(c.x, y, c.w, c.h + 40); g.fill();
    const forma = r();
    g.beginPath();
    if (forma < 0.5) { g.moveTo(c.x - 4, y); g.lineTo(c.x + c.w / 2, y - 16 - r() * 12); g.lineTo(c.x + c.w + 4, y); }
    else if (forma < 0.75) { g.moveTo(c.x - 4, y); g.lineTo(c.x + c.w * 0.3, y - 22); g.lineTo(c.x + c.w * 0.55, y - 6); g.lineTo(c.x + c.w * 0.7, y - 14); g.lineTo(c.x + c.w + 4, y); }
    else { g.rect(c.x - 3, y - 6, c.w + 6, 6); }
    g.closePath(); g.fill();
    if (r() < 0.55) { g.fillRect(c.x + c.w * (0.2 + r() * 0.6), y - 30, 7, 30); }
    // la luce di taglio sul lato rivolto al sole
    const lx = c.x + c.w / 2 < soleLocale ? c.x + c.w - 0.8 : c.x + 0.8;
    g.strokeStyle = LUCE; g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(lx, y); g.lineTo(lx, base); g.stroke();
    if (r() < 0.16) {
      g.fillStyle = "rgba(255,180,90,.9)"; g.fillRect(c.x + 8 + r() * (c.w - 24), y + 10 + r() * (c.h - 24), 5, 8); g.fillStyle = "#12050b";
    }
  }
  // il campanile, con la cella aperta sul cielo e la croce
  g.fillStyle = "#12050b";
  g.fillRect(640, base - 220, 40, 230);
  g.beginPath(); g.moveTo(634, base - 220); g.lineTo(660, base - 268); g.lineTo(686, base - 220); g.closePath(); g.fill();
  g.fillRect(658, base - 296, 3, 30); g.fillRect(651, base - 288, 17, 3);
  g.globalCompositeOperation = "destination-out"; g.beginPath(); g.moveTo(649, base - 196); g.lineTo(649, base - 172); g.arc(660, base - 172, 11, Math.PI, 0, true); g.lineTo(671, base - 196); g.closePath(); g.fill();
  g.globalCompositeOperation = "source-over";
  // la torre dell'acqua sulle sue gambe
  g.beginPath(); g.ellipse(248, base - 132, 30, 24, 0, 0, Math.PI * 2); g.fill(); g.fillRect(218, base - 132, 60, 32);
  g.beginPath(); g.moveTo(226, base - 100); g.lineTo(220, base + 10); g.moveTo(270, base - 100); g.lineTo(276, base + 10); g.moveTo(248, base - 100); g.lineTo(248, base + 10);
  g.strokeStyle = "#12050b"; g.lineWidth = 4; g.stroke();
  g.strokeStyle = LUCE; g.lineWidth = 1.6; g.beginPath(); g.moveTo(277, base - 132); g.lineTo(277, base - 102); g.stroke();
  return t;
}

// --------------------------------------------------------------------
//  Il greto: i sassi bianchi del trailer, accesi dal lato del sole e con
//  l'ombra che cade lontano da lui; la tela è larga e alta quanto la vista.
// --------------------------------------------------------------------
async function sassi(w: number, h: number, R: number, soleX: number): Promise<Tela> {
  const { tela: t, g } = telaR(w, h, R), r = rng(91);
  const fondo = g.createLinearGradient(0, 0, 0, h);
  fondo.addColorStop(0, "#28101a"); fondo.addColorStop(0.5, "#1c0b12"); fondo.addColorStop(1, "#12070c");
  g.fillStyle = fondo; g.fillRect(0, 0, w, h);
  const n = fbmPeriodico(2, 10, 3, 0);
  const grana = await riempi(w, h, (x, y, px) => { const v = n(x / w * 10 * (w / 2320), y / 40) * 30; px[0] = v > 0 ? 255 : 0; px[1] = v > 0 ? 190 : 0; px[2] = v > 0 ? 160 : 0; px[3] = Math.abs(v) * 1.4; });
  g.drawImage(grana, 0, 0, w, h);
  const quanti = Math.round(620 * (w * h) / (2320 * 400));
  const lista: { x: number; y: number; rx: number; ry: number; a: number }[] = [];
  for (let i = 0; i < quanti; i++) {
    const y = Math.pow(r(), 1.7) * h, prof = Math.min(1, y / 400);
    lista.push({ x: r() * w, y, rx: 4 + prof * 46 * (0.5 + r()), ry: 0, a: (r() - 0.5) * 0.5 });
  }
  lista.sort((a, b) => a.y - b.y);
  for (const s of lista) {
    s.ry = s.rx * (0.34 + r() * 0.2);
    const prof = Math.min(1, s.y / 400);
    // da che parte sta il sole: -1 a sinistra del sasso, +1 a destra
    const d = Math.max(-1, Math.min(1, (soleX - s.x) / 520));
    g.fillStyle = `rgba(10,3,6,${0.32 + prof * 0.3})`;
    g.beginPath(); g.ellipse(s.x - d * s.rx * 0.5, s.y + s.ry * 1.0, s.rx * 1.05, s.ry * 0.7, s.a, 0, Math.PI * 2); g.fill();
    const gr = g.createLinearGradient(s.x + d * s.rx, s.y - s.ry, s.x - d * s.rx * 0.7, s.y + s.ry);
    gr.addColorStop(0, `rgb(${236 + r() * 14},${196 + r() * 14},${172 + r() * 14})`); gr.addColorStop(0.45, "#a77a76"); gr.addColorStop(1, "#4b2230");
    g.fillStyle = gr;
    g.beginPath(); g.ellipse(s.x, s.y, s.rx, s.ry, s.a, 0, Math.PI * 2); g.fill();
    // il filo di luce sul bordo che guarda il sole
    const centro = Math.atan2(-1, d * 0.9);
    g.strokeStyle = `rgba(255,214,184,${0.5 + 0.4 * r()})`; g.lineWidth = 1 + prof * 1.6;
    g.beginPath(); g.ellipse(s.x, s.y, s.rx, s.ry, s.a, centro - Math.PI * 0.4, centro + Math.PI * 0.4); g.stroke();
  }
  return t;
}

export interface Tele {
  citta: Tela; sassi: Tela; nubi: Tela; nubiAlte: Tela; colline: Tela; raggi: RaggioMorbido[];
  /** dove sta la tela del greto e quanto è grande (unità) */
  sassiX: number; sassiDa: number; sassiW: number; sassiH: number;
}

/** Le tele della scena per una vista, dipinte a R pixel per unità. */
export async function preparaTele(v: Vista, R: number): Promise<Tele> {
  const sassiDa = ACQUA + 96;
  const sassiX = v.x0 - 200, sassiW = v.x1 - v.x0 + 400, sassiH = Math.max(400, v.y1 - sassiDa + 20);
  const raggi: RaggioMorbido[] = [];
  const sprite = new Map<number, RaggioMorbido>();
  for (let i = 0; i < 10; i++) {
    const w2 = 0.05 + ((i * 41) % 7) * 0.01;
    if (!sprite.has(w2)) sprite.set(w2, raggioMorbido(1700, w2, 40, 1500, "#ff9a6a", 0.75));
    raggi.push(sprite.get(w2) as RaggioMorbido);
  }
  return {
    citta: citta(R, CAMPANILE),
    sassi: await sassi(sassiW, sassiH, R, SOLE.x - sassiX),
    nubi: await nuvole({ seme: 71, w: 1440, h: 420, scalaX: 2.6, scalaY: 1, copertura: 0.5, morbidezza: 0.2, sole: [0, 1],
      chiaro: "#ff9a6a", scuro: "#4a1226", alto: 0.25, basso: 0.55 }),
    nubiAlte: await nuvole({ seme: 133, w: 1440, h: 420, scalaX: 3.2, scalaY: 1, copertura: 0.42, morbidezza: 0.3, sole: [0, 1],
      chiaro: "#7a2338", scuro: "#16060e", alto: 0.35, basso: 0.4 }),
    colline: await crinale({ seme: 808, larghezza: 1920, altezza: 200, base: 120, ampiezza: 60, frequenza: 3, aspro: 0.4, luce: -1,
      chiaro: "#9a3a3c", scuro: "#2c0d1c", nebbia: "#7a2a36", nebbiaForza: 0.5, grana: 0.1 }),
    raggi, sassiX, sassiDa, sassiW, sassiH,
  };
}

/** Una tela che si ripete in orizzontale su tutta la vista. */
function ripeti(ctx: C2D, tela: Tela, v: Vista, y: number, larga: number, alta: number, scosta = 0, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const da = Math.floor((v.x0 - 200 - scosta) / larga) * larga + scosta;
  for (let x = da; x < v.x1 + 200; x += larga) ctx.drawImage(tela, x, y, larga, alta);
  ctx.restore();
}

/** L'ombra lunga verso di noi: la figura rovesciata e stirata sul greto. */
function ombra(ctx: C2D, x: number, y: number, alto: number, o: OpzioniFigura, inclina: number, lung: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.transform(1, 0, inclina, -lung, 0, 0);
  disegnaViandante(ctx, 0, 0, alto, 0, { ...o, colore: "rgba(6,1,4,.6)", lontano: "rgba(6,1,4,.6)", bordo: undefined, dettaglio: 0 });
  ctx.restore();
}

export interface Regia {
  /** metà della distanza fra i due fratelli */
  distanza: number;
  /** quanto sono alti (unità) */
  alto: number;
  /** dove stanno i piedi */
  piedi: number;
  /** da dove salgono le canne ai lati (y), e quanto sono alte */
  canne: number; canneAlte: number;
}

export function dipingi(ctx: C2D, v: Vista, a: Tele, regia: Regia) {
  const L = v.x0 - 200, Rr = v.x1 + 200, larga = Rr - L;

  // ── il cielo: dal blu-nero della sera alto al cremisi, all'arancio sull'orizzonte
  const cg = ctx.createLinearGradient(0, -900, 0, ACQUA);
  const stop = (y: number, c: string) => cg.addColorStop((y + 900) / (ACQUA + 900), c);
  stop(-900, "#030108"); stop(-480, "#08030c"); stop(-250, "#12050d"); stop(35, "#3b0f22"); stop(244, "#8b2b3a");
  stop(339, "#d4633f"); stop(377, "#f39a64"); stop(ACQUA, "#f6a26c");
  ctx.fillStyle = cg; ctx.fillRect(L, v.y0 - 10, larga, ACQUA - v.y0 + 10);
  // le prime stelle, solo dove il cielo è già notte
  const rs = rng(4);
  for (let i = 0; i < 260; i++) {
    const x = L + rs() * larga, y = -900 + rs() * 1000, l = rs() < 0.1 ? 2.2 : 1.3;
    const k = Math.max(0, Math.min(1, (-60 - y) / 500));
    if (k <= 0 || y < v.y0) continue;
    ctx.fillStyle = `rgba(232,226,255,${(0.25 + 0.6 * rs()) * k})`;
    ctx.fillRect(x, y, l, l);
  }
  // le nuvole alte, scure, appena accese dal basso
  ripeti(ctx, a.nubiAlte, v, -560, 2400, 700, 300, 0.75);
  ctx.globalCompositeOperation = "lighter";
  alone(ctx, SOLE.x, SOLE.y + 30, 1150, "#ff6d44", 0.5, 0.8);
  alone(ctx, SOLE.x, SOLE.y + 10, 320, "#ffc38a", 0.7);
  ctx.globalCompositeOperation = "source-over";
  ripeti(ctx, a.nubi, v, 150, 2400, 700, -520, 0.8);
  // il sole, quasi sul crinale, e i raggi che salgono a ventaglio
  ctx.fillStyle = "#ffd9a6"; ctx.beginPath(); ctx.arc(SOLE.x, SOLE.y, SOLE.r, 0, Math.PI * 2); ctx.fill();
  ctx.globalCompositeOperation = "lighter";
  alone(ctx, SOLE.x, SOLE.y, 190, "#fff2d8", 0.9);
  ctx.save(); ctx.translate(SOLE.x, SOLE.y);
  for (let i = 0; i < a.raggi.length; i++) {
    const ang = -Math.PI * (0.06 + i * (0.88 / (a.raggi.length - 1)));
    disegnaRaggio(ctx, a.raggi[i], ang, 1.25 * (0.10 + 0.045 * Math.sin(i * 2.3 + 0.7)));
  }
  ctx.restore();
  // una lama di luce lunga e orizzontale attraverso il sole, come la dà un obiettivo da cinema: dietro la città
  alone(ctx, SOLE.x, SOLE.y, 1700, "#ffb07a", 0.2, 0.012);
  alone(ctx, SOLE.x, SOLE.y, 800, "#ffe2c4", 0.24, 0.008);
  ctx.globalCompositeOperation = "source-over";

  // ── le colline, poi Acquamorta sull'altra riva, col campanile sul sole
  ripeti(ctx, a.colline, v, 470, 1920, 200, 400);
  ctx.drawImage(a.citta, SOLE.x - CAMPANILE, BASE_CITTA - 250 + 4, CITTA_W, CITTA_H);
  const nebbia = ctx.createLinearGradient(0, 610, 0, 700);
  nebbia.addColorStop(0, "rgba(255,150,100,0)"); nebbia.addColorStop(1, "rgba(255,150,100,.30)");
  ctx.fillStyle = nebbia; ctx.fillRect(L, 610, larga, 90);

  // ── l'acqua morta, specchio del cielo
  const gw = ctx.createLinearGradient(0, ACQUA, 0, ACQUA + 110);
  gw.addColorStop(0, "#e07a52"); gw.addColorStop(0.35, "#a63f44"); gw.addColorStop(1, "#3b1220");
  ctx.fillStyle = gw; ctx.fillRect(L, ACQUA, larga, 110);
  ctx.save(); ctx.globalAlpha = 0.34; ctx.translate(SOLE.x - CAMPANILE, ACQUA); ctx.scale(1, -0.55); ctx.drawImage(a.citta, 0, -250, CITTA_W, CITTA_H); ctx.restore();
  ctx.globalCompositeOperation = "lighter";
  const rr = rng(12);
  alone(ctx, SOLE.x, ACQUA + 34, 260, "#ffb987", 0.3, 0.4);
  for (let i = 0; i < 110; i++) {
    const yy = ACQUA + 6 + rr() * 100, spr = 40 + (yy - ACQUA) * 1.1;
    const xx = SOLE.x + (rr() - 0.5) * spr * 2;
    const al = 0.6 * (0.18 + 0.5 * rr()) * (0.5 + 0.5 * Math.sin(i * 1.7)) * (1 - (yy - ACQUA) / 125) * (1 - Math.abs(xx - SOLE.x) / (spr * 1.2));
    ctx.fillStyle = `rgba(255,214,160,${Math.max(0, al)})`; ctx.fillRect(xx - 8 - rr() * 18, yy, 16 + rr() * 34, 1.3);
  }
  for (let i = 0; i < 22; i++) {
    const yy = ACQUA + 6 + i * 4.6;
    ctx.strokeStyle = `rgba(255,170,120,${0.05 + 0.06 * Math.sin(i * 2)})`; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(L, yy);
    for (let x = L; x <= Rr; x += 40) ctx.lineTo(x, yy + Math.sin(x * 0.02 + i) * 1.4);
    ctx.stroke();
  }
  // un lampo lungo e orizzontale attraverso il sole, come lo dà un obiettivo da cinema
  ctx.globalCompositeOperation = "source-over";

  // la calura che sale dall'acqua velando appena la città
  const velo = ctx.createLinearGradient(0, ACQUA - 140, 0, ACQUA + 20);
  velo.addColorStop(0, "rgba(255,140,100,0)"); velo.addColorStop(0.7, "rgba(255,140,100,.10)"); velo.addColorStop(1, "rgba(255,140,100,0)");
  ctx.fillStyle = velo; ctx.fillRect(L, ACQUA - 140, larga, 160);

  // ── la sponda di qua, poi il greto
  ctx.fillStyle = "#170811";
  ctx.beginPath(); ctx.moveTo(L, ACQUA + 100); ctx.quadraticCurveTo(SOLE.x, ACQUA + 86, Rr, ACQUA + 104); ctx.lineTo(Rr, v.y1 + 20); ctx.lineTo(L, v.y1 + 20); ctx.closePath(); ctx.fill();
  ctx.drawImage(a.sassi, a.sassiX, a.sassiDa, a.sassiW, a.sassiH);
  ctx.globalCompositeOperation = "lighter";
  alone(ctx, SOLE.x, ACQUA + 120, 1000, "#ff7a50", 0.22, 0.16);
  ctx.globalCompositeOperation = "source-over";

  // ── i due fratelli: Cosimo a sinistra, il viandante a destra; si guardano, il sole fra loro
  const { distanza: D, alto, piedi } = regia;
  const cosimo: OpzioniFigura = { colore: "#0a0207", fermo: 1, braccia: 0.34, ampiezza: 0.4, cappello: false };
  const viandante: OpzioniFigura = { colore: "#08030a", tanica: true, fagotto: true, cappello: true, ampiezza: 0.4, fermo: 1, braccia: 0.27 };
  ombra(ctx, SOLE.x - D - 16, piedi + 4, alto, { ...cosimo, verso: 1 }, -0.5, 0.34);
  ombra(ctx, SOLE.x + D + 16, piedi + 4, alto, { ...viandante, verso: -1 }, 0.5, 0.34);
  disegnaViandante(ctx, SOLE.x - D, piedi, alto, 0, { ...cosimo, lontano: "#060104", bordo: BORDO, latoLuce: 1, verso: 1, respiro: 0, dettaglio: 1 });
  disegnaViandante(ctx, SOLE.x + D, piedi, alto, 0, { ...viandante, lontano: "#040106", bordo: BORDO, latoLuce: -1, verso: -1, respiro: 0, dettaglio: 1 });

  // ── cenere nella luce, e le canne secche ai due lati
  ctx.globalCompositeOperation = "lighter";
  pulviscolo(ctx, 3.7, 63, Math.round(70 * larga / 1920), { x: L, y: 240, w: larga, h: piedi - 200 }, "#ffb49a", 0.55, 2.6);
  ctx.globalCompositeOperation = "source-over";
  const rc = rng(33);
  ctx.strokeStyle = "#0b0308"; ctx.lineCap = "round";
  for (const lato of [0, 1]) {
    for (let i = 0; i < 20; i++) {
      const bx = lato ? v.x1 - 20 - rc() * 280 : v.x0 - 20 + rc() * 260, alt = (0.45 + rc() * 0.65) * regia.canneAlte, curva = (lato ? -1 : 1) * (10 + rc() * 40);
      ctx.lineWidth = 1.6 + rc() * 2;
      ctx.beginPath(); ctx.moveTo(bx, regia.canne + 30); ctx.quadraticCurveTo(bx + curva * 0.3, regia.canne - alt * 0.6, bx + curva, regia.canne - alt); ctx.stroke();
      ctx.strokeStyle = "rgba(255,130,96,.45)"; ctx.lineWidth = 0.9;
      ctx.beginPath(); ctx.moveTo(bx + curva * 0.5, regia.canne - alt * 0.55); ctx.lineTo(bx + curva, regia.canne - alt); ctx.stroke(); ctx.strokeStyle = "#0b0308";
    }
  }
}
