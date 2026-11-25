// ====================================================================
//  Il viandante (e l'uomo fermo sulla riva opposta).
// --------------------------------------------------------------------
//  Figura di profilo alta 1 (piedi a y=0, y negativa in su), con ciclo di
//  camminata completo (curve Catmull-Rom di anca, ginocchio e piede +
//  risolutore d'appoggio del bacino), stivali stringati, spolverino con
//  bavero rialzato che segue il passo, fagotto a tracolla, cappello da
//  strada e tanica metallica da dieci litri con nervatura a X.
// ====================================================================

export interface OpzioniFigura {
  colore: string;        // cappotto e forma generale
  lontano?: string;      // arti sul lato lontano (più scuri)
  bordo?: string;        // luce di contorno (undefined = nessuna)
  latoLuce?: number;     // -1 luce da sinistra, +1 da destra
  verso?: number;        // -1 guarda a sinistra (ovest), +1 a destra
  fermo?: number;        // 0 cammina … 1 in piedi fermo
  tanica?: boolean;
  fagotto?: boolean;
  cappello?: boolean;
  respiro?: number;      // tempo, per il respiro da fermo
  ampiezza?: number;     // 0..1: lunghezza del passo (1 = normale)
  dettaglio?: 0 | 1 | 2;
  braccia?: number;      // apertura delle braccia in avanti (rad), per chi sbarra il passo
  pantaloni?: string;    // colore dei pantaloni (dettaglio 2)
  stivali?: string;      // colore degli stivali (dettaglio 2)
  polvere?: string;      // colore della polvere sugli orli (dettaglio 2)
  senzaTesta?: boolean;  // inquadratura dal ginocchio in giù
  risvolto?: boolean;    // sagoma con risvolto e suola spessa per il controluce del dettaglio 2
}

const TAU = Math.PI * 2;

type Chiavi = [number, number][];
function curva(chiavi: Chiavi) {
  const n = chiavi.length;
  return (fase: number) => {
    const f = ((fase % 1) + 1) % 1;
    let i = 0;
    while (i < n - 1 && chiavi[i + 1][0] <= f) i++;
    const a = chiavi[i], b = chiavi[(i + 1) % n];
    const bx = i + 1 < n ? b[0] : b[0] + 1;
    const t = (f - a[0]) / (bx - a[0] || 1);
    const p0 = chiavi[(i - 1 + n) % n][1], p1 = a[1], p2 = b[1], p3 = chiavi[(i + 2) % n][1];
    return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);
  };
}
const ANCA = curva([[0, 0.40], [0.12, 0.30], [0.30, 0.02], [0.48, -0.26], [0.60, -0.36], [0.70, -0.10], [0.82, 0.24], [0.92, 0.39]]);
const GINOCCHIO = curva([[0, 0.05], [0.10, 0.22], [0.24, 0.10], [0.40, 0.14], [0.52, 0.48], [0.62, 0.95], [0.72, 1.08], [0.84, 0.66], [0.94, 0.16]]);
const PIEDE = curva([[0, 0.34], [0.07, 0.02], [0.24, 0], [0.42, 0], [0.50, -0.22], [0.60, -0.62], [0.72, -0.44], [0.84, -0.18], [0.94, 0.14]]);

const L = { coscia: 0.246, stinco: 0.24, suola: 0.034, piede: 0.16 };
const BUSTO = 0.315;

export const PASSO_CICLO = (() => {
  const x = (f: number) => L.coscia * Math.sin(ANCA(f)) + L.stinco * Math.sin(ANCA(f) - GINOCCHIO(f));
  return 2 * (x(0.02) - x(0.58));
})();

export const velocitaSuolo = (alto: number, cadenza: number, ampiezza = 1) => PASSO_CICLO * ampiezza * alto * cadenza;

interface Punto { x: number; y: number }
const P = (x: number, y: number): Punto => ({ x, y });
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ruota = (p: Punto, a: number): Punto => ({ x: p.x * Math.cos(a) - p.y * Math.sin(a), y: p.x * Math.sin(a) + p.y * Math.cos(a) });
const somma = (a: Punto, b: Punto): Punto => P(a.x + b.x, a.y + b.y);

interface Gamba { anca: Punto; ginocchio: Punto; caviglia: Punto; angPiede: number; angStinco: number; angCoscia: number; }

function gamba(f: number, ampiezza: number, fermo: number, hy: number, deriva: number): Gamba {
  const a = lerp(ANCA(f) * ampiezza, deriva, fermo);
  const k = lerp(GINOCCHIO(f) * (0.55 + 0.45 * ampiezza), 0.04, fermo);
  const fp = lerp(PIEDE(f) * (0.6 + 0.4 * ampiezza), 0, fermo);
  const anca = P(0, hy);
  const ginocchio = P(L.coscia * Math.sin(a), hy + L.coscia * Math.cos(a));
  const angS = a - k;
  const caviglia = P(ginocchio.x + L.stinco * Math.sin(angS), ginocchio.y + L.stinco * Math.cos(angS));
  return { anca, ginocchio, caviglia, angPiede: fp, angStinco: angS, angCoscia: a };
}

function fondoPiede(g: Gamba) {
  const c = Math.cos(-g.angPiede), s = Math.sin(-g.angPiede);
  const pts = [P(-0.045, L.suola), P(L.piede - 0.05, L.suola)];
  return Math.max(...pts.map((p) => g.caviglia.y + p.x * s + p.y * c));
}

type Ctx = CanvasRenderingContext2D;

function arto(ctx: Ctx, a: Punto, ra: number, b: Punto, rb: number) {
  const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1;
  const nx = -dy / d, ny = dx / d;
  const ang = Math.atan2(dy, dx);
  ctx.beginPath();
  ctx.moveTo(a.x + nx * ra, a.y + ny * ra);
  ctx.lineTo(b.x + nx * rb, b.y + ny * rb);
  ctx.arc(b.x, b.y, rb, ang + Math.PI / 2, ang - Math.PI / 2, true);
  ctx.lineTo(a.x - nx * ra, a.y - ny * ra);
  ctx.arc(a.x, a.y, ra, ang - Math.PI / 2, ang + Math.PI / 2, true);
  ctx.closePath();
}

function rettTondo(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  const q = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + q, y);
  ctx.arcTo(x + w, y, x + w, y + h, q); ctx.arcTo(x + w, y + h, x, y + h, q);
  ctx.arcTo(x, y + h, x, y, q); ctx.arcTo(x, y, x + w, y, q);
  ctx.closePath();
}

interface Colori { cappotto: string; lontano: string; pantaloni: string; stivali: string; tanica: string; cuoio: string; polvere: string; }

function coloriDa(o: OpzioniFigura): Colori {
  const c = o.colore;
  const pieno = o.dettaglio === 2;
  const medio = (o.dettaglio ?? 0) >= 1;
  return {
    cappotto: c,
    lontano: o.lontano ?? c,
    pantaloni: pieno ? (o.pantaloni ?? "#26201e") : c,
    stivali: pieno ? (o.stivali ?? "#2b1b12") : c,
    tanica: pieno ? "#626038" : medio ? "#49482e" : c,
    cuoio: pieno ? "#4a2f1d" : c,
    polvere: o.polvere ?? "#b99a74",
  };
}

function stivale(ctx: Ctx, g: Gamba, col: Colori, dettaglio: number, lontano: boolean, risvolto = false) {
  const base = lontano ? col.lontano : col.stivali;

  if (dettaglio < 2) {
    ctx.save();
    ctx.translate(g.caviglia.x, g.caviglia.y); ctx.rotate(-g.angStinco);
    ctx.fillStyle = base;
    ctx.beginPath(); ctx.moveTo(-0.033, -0.10); ctx.lineTo(0.031, -0.10); ctx.lineTo(0.034, -0.012); ctx.lineTo(-0.036, -0.012); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.translate(g.caviglia.x, g.caviglia.y); ctx.rotate(-g.angPiede);
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.moveTo(-0.046, -0.004); ctx.quadraticCurveTo(-0.058, 0.016, -0.05, L.suola); ctx.lineTo(0.112, L.suola);
    ctx.quadraticCurveTo(0.140, L.suola - 0.002, 0.138, 0.012); ctx.quadraticCurveTo(0.128, -0.012, 0.075, -0.024);
    ctx.lineTo(0.036, -0.030); ctx.lineTo(0.036, -0.012); ctx.closePath(); ctx.fill();
    if (risvolto) {
      ctx.beginPath();
      ctx.moveTo(-0.058, 0.010); ctx.lineTo(0.151, 0.010); ctx.quadraticCurveTo(0.157, 0.026, 0.147, 0.030);
      ctx.lineTo(0.120, L.suola); ctx.lineTo(-0.046, L.suola); ctx.quadraticCurveTo(-0.060, 0.030, -0.058, 0.017); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    if (risvolto) {
      ctx.save();
      ctx.translate(g.caviglia.x, g.caviglia.y); ctx.rotate(-g.angStinco);
      ctx.fillStyle = base;
      ctx.beginPath();
      ctx.moveTo(-0.050, -0.150); ctx.lineTo(0.046, -0.150);
      ctx.quadraticCurveTo(0.054, -0.118, 0.047, -0.092); ctx.quadraticCurveTo(0.0, -0.084, -0.051, -0.092);
      ctx.quadraticCurveTo(-0.057, -0.120, -0.050, -0.150); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    return;
  }

  const CUOIO = lontano ? "#20140d" : base;
  const ALTA = lontano ? "#3a2618" : "#8a5c38";
  const BASSA = "#140b06";

  ctx.save();
  ctx.translate(g.caviglia.x, g.caviglia.y); ctx.rotate(-g.angStinco);
  const cil = ctx.createLinearGradient(-0.046, 0, 0.042, 0);
  cil.addColorStop(0, BASSA); cil.addColorStop(0.32, lontano ? "#2c1b11" : "#5a3a24"); cil.addColorStop(0.55, ALTA); cil.addColorStop(1, BASSA);
  ctx.fillStyle = cil;
  ctx.beginPath();
  ctx.moveTo(-0.044, -0.128); ctx.quadraticCurveTo(0.0, -0.132, 0.041, -0.128);
  ctx.lineTo(0.036, -0.012); ctx.lineTo(-0.041, -0.012); ctx.closePath(); ctx.fill();
  if (!lontano) {
    ctx.lineCap = "round";
    for (let k = 0; k < 5; k++) {
      const y = -0.030 - k * 0.017;
      ctx.strokeStyle = "rgba(10,5,2,.55)"; ctx.lineWidth = 0.0032;
      ctx.beginPath(); ctx.moveTo(-0.040, y); ctx.quadraticCurveTo(0.0, y + 0.010, 0.036, y - 0.002); ctx.stroke();
      ctx.strokeStyle = "rgba(255,224,180,.22)"; ctx.lineWidth = 0.0018;
      ctx.beginPath(); ctx.moveTo(-0.038, y - 0.004); ctx.quadraticCurveTo(0.0, y + 0.006, 0.034, y - 0.006); ctx.stroke();
    }
    ctx.strokeStyle = "rgba(230,190,140,.5)"; ctx.lineWidth = 0.0016; ctx.setLineDash([0.006, 0.005]);
    ctx.beginPath(); ctx.moveTo(-0.028, -0.010); ctx.lineTo(-0.030, -0.120); ctx.stroke(); ctx.setLineDash([]);
  }
  ctx.fillStyle = col.pantaloni;
  ctx.beginPath();
  ctx.moveTo(-0.050, -0.150); ctx.lineTo(0.046, -0.150);
  ctx.quadraticCurveTo(0.054, -0.118, 0.047, -0.092); ctx.quadraticCurveTo(0.0, -0.084, -0.051, -0.092);
  ctx.quadraticCurveTo(-0.057, -0.120, -0.050, -0.150); ctx.closePath(); ctx.fill();
  const pol = ctx.createLinearGradient(0, -0.115, 0, -0.084);
  pol.addColorStop(0, "rgba(0,0,0,0)"); pol.addColorStop(1, col.polvere + "88");
  ctx.fillStyle = pol; ctx.fillRect(-0.056, -0.115, 0.108, 0.031);
  ctx.strokeStyle = "rgba(0,0,0,.35)"; ctx.lineWidth = 0.002;
  ctx.beginPath(); ctx.moveTo(-0.020, -0.146); ctx.lineTo(-0.022, -0.090); ctx.moveTo(0.018, -0.146); ctx.lineTo(0.022, -0.090); ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.translate(g.caviglia.x, g.caviglia.y); ctx.rotate(-g.angPiede);
  const UPPER = new Path2D();
  UPPER.moveTo(-0.046, -0.030); UPPER.quadraticCurveTo(-0.061, -0.004, -0.057, 0.013);
  UPPER.lineTo(0.124, 0.013); UPPER.quadraticCurveTo(0.152, 0.011, 0.147, -0.006);
  UPPER.quadraticCurveTo(0.139, -0.021, 0.102, -0.031); UPPER.quadraticCurveTo(0.072, -0.040, 0.042, -0.043);
  UPPER.lineTo(0.036, -0.062); UPPER.lineTo(-0.040, -0.062); UPPER.closePath();
  const cu = ctx.createLinearGradient(0, -0.045, 0, 0.014);
  cu.addColorStop(0, lontano ? "#3a2618" : "#7d5232"); cu.addColorStop(0.45, CUOIO); cu.addColorStop(1, BASSA);
  ctx.fillStyle = cu; ctx.fill(UPPER);
  if (!lontano) {
    ctx.save(); ctx.clip(UPPER);
    const sp = ctx.createLinearGradient(0.02, -0.04, 0.15, -0.006);
    sp.addColorStop(0, "rgba(255,226,186,0)"); sp.addColorStop(0.5, "rgba(255,226,186,.34)"); sp.addColorStop(1, "rgba(255,226,186,0)");
    ctx.fillStyle = sp; ctx.fillRect(0.02, -0.045, 0.14, 0.05);
    ctx.strokeStyle = "rgba(8,4,2,.7)"; ctx.lineWidth = 0.0032;
    ctx.beginPath(); ctx.moveTo(0.084, -0.034); ctx.quadraticCurveTo(0.112, -0.012, 0.100, 0.014); ctx.stroke();
    ctx.strokeStyle = "rgba(240,200,150,.55)"; ctx.lineWidth = 0.0014; ctx.setLineDash([0.005, 0.004]);
    ctx.beginPath(); ctx.moveTo(0.087, -0.034); ctx.quadraticCurveTo(0.116, -0.012, 0.104, 0.014); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "rgba(0,0,0,.30)";
    ctx.beginPath(); ctx.moveTo(-0.062, -0.030); ctx.lineTo(-0.024, -0.030); ctx.quadraticCurveTo(-0.014, -0.010, -0.020, 0.014); ctx.lineTo(-0.062, 0.014); ctx.closePath(); ctx.fill();
    for (let k = 0; k < 5; k++) {
      const x = 0.038 + k * 0.0135, y = -0.040 + k * 0.0022;
      ctx.fillStyle = "rgba(20,10,4,.85)"; ctx.beginPath(); ctx.arc(x, y, 0.0036, 0, TAU); ctx.fill();
      ctx.fillStyle = "rgba(210,180,120,.85)"; ctx.beginPath(); ctx.arc(x, y - 0.0006, 0.0021, 0, TAU); ctx.fill();
      if (k < 4) {
        ctx.strokeStyle = "rgba(14,8,4,.9)"; ctx.lineWidth = 0.0034; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 0.0135, y + 0.0122); ctx.moveTo(x + 0.0135, y + 0.0022); ctx.lineTo(x, y + 0.010); ctx.stroke();
      }
    }
    ctx.strokeStyle = "rgba(8,4,2,.5)"; ctx.lineWidth = 0.0028; ctx.lineCap = "round";
    for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(0.052 + k * 0.006, -0.036 + k * 0.004); ctx.quadraticCurveTo(0.064 + k * 0.006, -0.02, 0.054 + k * 0.006, 0.008); ctx.stroke(); }
    ctx.restore();
  }
  ctx.fillStyle = lontano ? "#4a3822" : "#b18a58";
  ctx.beginPath(); ctx.moveTo(-0.058, 0.010); ctx.lineTo(0.150, 0.010); ctx.lineTo(0.150, 0.018); ctx.lineTo(-0.058, 0.018); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#120a06";
  ctx.beginPath();
  ctx.moveTo(-0.058, 0.017); ctx.lineTo(0.151, 0.017); ctx.quadraticCurveTo(0.157, 0.026, 0.147, 0.030);
  ctx.lineTo(0.120, L.suola); ctx.lineTo(-0.046, L.suola); ctx.quadraticCurveTo(-0.060, 0.030, -0.058, 0.017); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#050302";
  for (let x = -0.044; x < 0.13; x += 0.019) ctx.fillRect(x, 0.030, 0.011, 0.005);
  const gp = ctx.createLinearGradient(0, -0.01, 0, L.suola);
  gp.addColorStop(0, "rgba(0,0,0,0)"); gp.addColorStop(1, col.polvere + "cc");
  ctx.fillStyle = gp; ctx.fillRect(-0.06, -0.01, 0.216, L.suola + 0.01);
  ctx.restore();
}

function tanica(ctx: Ctx, mano: Punto, oscilla: number, col: string, dettaglio: number) {
  ctx.save();
  ctx.translate(mano.x, mano.y);
  ctx.rotate(oscilla);
  const w = 0.132, h = 0.176, top = 0.03;
  ctx.strokeStyle = col; ctx.lineWidth = 0.012; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(-0.028, top + 0.006); ctx.quadraticCurveTo(-0.028, -0.016, 0, -0.016); ctx.quadraticCurveTo(0.028, -0.016, 0.028, top + 0.006); ctx.stroke();
  ctx.fillStyle = col;
  rettTondo(ctx, -w / 2, top, w, h, 0.014); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-w / 2 + 0.01, top + 0.002); ctx.lineTo(w / 2 - 0.02, top + 0.002); ctx.lineTo(w / 2 - 0.036, top - 0.012); ctx.lineTo(-w / 2 + 0.03, top - 0.012); ctx.closePath(); ctx.fill();
  ctx.fillRect(w / 2 - 0.060, top - 0.038, 0.030, 0.03);
  ctx.fillRect(w / 2 - 0.064, top - 0.042, 0.038, 0.010);
  if (dettaglio >= 1) {
    // Anche a misura media (Panorama) la tanica mostra la nervatura a X e il tappo ruggine come in oggetti/tanica.webp
    const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
    g.addColorStop(0, "rgba(255,240,196,.20)"); g.addColorStop(0.4, "rgba(255,240,196,0)"); g.addColorStop(1, "rgba(0,0,0,.32)");
    ctx.fillStyle = g; rettTondo(ctx, -w / 2, top, w, h, 0.014); ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,.42)"; ctx.lineWidth = 0.004;
    rettTondo(ctx, -w / 2, top, w, h, 0.014); ctx.stroke();
    ctx.strokeStyle = "rgba(0,0,0,.36)"; ctx.lineWidth = 0.0035;
    ctx.beginPath(); ctx.moveTo(-w / 2 + 0.016, top + 0.028); ctx.lineTo(w / 2 - 0.016, top + h - 0.022); ctx.moveTo(w / 2 - 0.016, top + 0.028); ctx.lineTo(-w / 2 + 0.016, top + h - 0.022); ctx.stroke();
    ctx.strokeStyle = "rgba(245,222,176,.22)"; ctx.lineWidth = 0.002;
    rettTondo(ctx, -w / 2 + 0.011, top + 0.014, w - 0.022, h - 0.03, 0.008); ctx.stroke();
    ctx.fillStyle = "#8a2f1c"; ctx.fillRect(w / 2 - 0.058, top - 0.034, 0.024, 0.010);
  }
  ctx.restore();
}

function figura(ctx: Ctx, f: number, o: OpzioniFigura, col: Colori, luce: boolean) {
  const amp = o.ampiezza ?? 1;
  const fermo = o.fermo ?? 0;
  const det = o.dettaglio ?? 0;
  const respiro = fermo * 0.004 * Math.sin((o.respiro ?? 0) * 1.9);

  const vicina = gamba(f, amp, fermo, 0, 0.05);
  const lontana = gamba(f + 0.5, amp, fermo, 0, -0.07);
  const hy = -Math.max(fondoPiede(vicina), fondoPiede(lontana));
  for (const g of [vicina, lontana]) {
    g.anca.y += hy; g.ginocchio.y += hy; g.caviglia.y += hy;
  }
  const anca = P(0, hy - 0.004 * Math.cos(f * TAU * 2) * (1 - fermo));

  const busto = lerp(0.115 + 0.018 * Math.cos((f + 0.05) * TAU * 2) * amp, 0.05, fermo);
  const spalla = somma(anca, ruota(P(0, -BUSTO - respiro * 4), busto));
  const testaOffset = ruota(P(0.008, -0.090), busto * 0.6 + 0.02);
  const collo = somma(spalla, ruota(P(0.010, -0.038), busto * 0.7));

  const aper = o.braccia ?? 0;
  const angBL = lerp(-vicina.angCoscia * 0.85 - 0.02, aper * 0.9, fermo) + 0.04;
  const angBV = lerp(-lontana.angCoscia * 0.22 + 0.03, aper, fermo);
  const braccio = (ang: number, gom: number) => {
    const a1 = ang + busto * 0.35;
    const gomito = P(spalla.x + 0.168 * Math.sin(a1), spalla.y + 0.168 * Math.cos(a1));
    const a2 = a1 + gom;
    const polso = P(gomito.x + 0.150 * Math.sin(a2), gomito.y + 0.150 * Math.cos(a2));
    return { gomito, polso, a2 };
  };
  const bl = braccio(angBL, lerp(0.30 + 0.20 * Math.max(0, angBL), 0.16, fermo));
  const bv = braccio(angBV, lerp(0.10, 0.12, fermo));

  ctx.lineCap = "round"; ctx.lineJoin = "round";

  ctx.fillStyle = col.lontano;
  arto(ctx, spalla, 0.030, bl.gomito, 0.024); ctx.fill();
  arto(ctx, bl.gomito, 0.024, bl.polso, 0.019); ctx.fill();
  ctx.beginPath(); ctx.arc(bl.polso.x + 0.006 * Math.sin(bl.a2), bl.polso.y + 0.022, 0.022, 0, TAU); ctx.fill();
  ctx.fillStyle = det >= 2 ? col.pantaloni : col.lontano;
  arto(ctx, lontana.anca, 0.052, lontana.ginocchio, 0.040); ctx.fill();
  arto(ctx, lontana.ginocchio, 0.040, lontana.caviglia, 0.030); ctx.fill();
  stivale(ctx, lontana, col, det, true, !!o.risvolto);

  if (o.fagotto) {
    ctx.save();
    ctx.translate(spalla.x - 0.055, spalla.y + 0.045);
    ctx.rotate(busto - 0.55);
    ctx.fillStyle = det >= 1 ? "#4c3e2d" : col.cappotto;
    rettTondo(ctx, -0.115, -0.038, 0.23, 0.076, 0.036); ctx.fill();
    if (det >= 1) {
      ctx.strokeStyle = "rgba(0,0,0,.36)"; ctx.lineWidth = 0.0035;
      for (const x of [-0.07, 0.0, 0.07]) { ctx.beginPath(); ctx.moveTo(x, -0.036); ctx.lineTo(x, 0.036); ctx.stroke(); }
    }
    ctx.restore();
    ctx.strokeStyle = det >= 1 ? "#3a2619" : col.cappotto; ctx.lineWidth = 0.014;
    ctx.beginPath(); ctx.moveTo(spalla.x - 0.06, spalla.y + 0.02); ctx.lineTo(spalla.x + 0.04, spalla.y + 0.16); ctx.stroke();
  }

  // Cappotto con bavero rialzato (coerente col cammeo dipinto del Viandante)
  const orloY = anca.y + 0.19;
  const ritardo = Math.sin((f - 0.16) * TAU) * (1 - fermo) * amp;
  const orloAv = P(anca.x + 0.105 + 0.045 * Math.max(0, vicina.angCoscia) * amp + 0.01 * ritardo, orloY + 0.004);
  const orloIn = P(anca.x - 0.128 + 0.062 * ritardo - 0.03 * Math.max(0, lontana.angCoscia) * amp, orloY - 0.004 * ritardo);
  ctx.fillStyle = col.cappotto;
  ctx.beginPath();
  const cb = somma(spalla, ruota(P(-0.064, -0.022), busto));         // bavero alto, dietro
  const cf = somma(spalla, ruota(P(0.058, -0.014), busto));          // bavero, davanti
  const pet = somma(spalla, ruota(P(0.086, 0.115), busto));
  const vit = somma(anca, ruota(P(0.078, -0.040), busto * 0.6));
  const sch = somma(spalla, ruota(P(-0.098, 0.115), busto));
  const vitD = somma(anca, ruota(P(-0.098, -0.040), busto * 0.6));
  ctx.moveTo(cb.x, cb.y);
  ctx.quadraticCurveTo(spalla.x + 0.002, spalla.y - 0.038, cf.x, cf.y);
  ctx.quadraticCurveTo(pet.x + 0.004, pet.y - 0.05, pet.x, pet.y);
  ctx.quadraticCurveTo(vit.x + 0.012, (pet.y + vit.y) / 2, vit.x, vit.y);
  ctx.quadraticCurveTo(orloAv.x - 0.012, (vit.y + orloAv.y) / 2, orloAv.x, orloAv.y);
  ctx.quadraticCurveTo((orloAv.x + orloIn.x) / 2, orloAv.y + 0.014 + 0.006 * ritardo, orloIn.x, orloIn.y);
  ctx.quadraticCurveTo(vitD.x - 0.024 + 0.02 * ritardo, (vitD.y + orloIn.y) / 2, vitD.x, vitD.y);
  ctx.quadraticCurveTo(sch.x - 0.012, (sch.y + vitD.y) / 2, sch.x, sch.y);
  ctx.quadraticCurveTo(cb.x - 0.020, (cb.y + sch.y) / 2, cb.x, cb.y);
  ctx.closePath(); ctx.fill();
  if (det >= 1 && luce) {
    ctx.strokeStyle = "rgba(0,0,0,.34)"; ctx.lineWidth = 0.0036;
    ctx.beginPath(); ctx.moveTo(vitD.x + 0.01, vitD.y); ctx.quadraticCurveTo(orloIn.x + 0.03, (vitD.y + orloIn.y) / 2 + 0.02, orloIn.x + 0.045, orloIn.y - 0.004); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(vit.x - 0.02, vit.y + 0.01); ctx.quadraticCurveTo(vit.x - 0.03, (vit.y + orloAv.y) / 2, orloAv.x - 0.045, orloAv.y - 0.008); ctx.stroke();
  }

  ctx.fillStyle = det >= 2 ? col.pantaloni : col.cappotto;
  arto(ctx, vicina.anca, 0.054, vicina.ginocchio, 0.042); ctx.fill();
  arto(ctx, vicina.ginocchio, 0.042, vicina.caviglia, 0.031); ctx.fill();
  if (det >= 2) {
    ctx.strokeStyle = "rgba(0,0,0,.28)"; ctx.lineWidth = 0.0022;
    for (const d of [-0.012, 0, 0.012]) {
      ctx.beginPath(); ctx.moveTo(vicina.ginocchio.x - 0.036, vicina.ginocchio.y + d - 0.01); ctx.quadraticCurveTo(vicina.ginocchio.x, vicina.ginocchio.y + d + 0.014, vicina.ginocchio.x + 0.036, vicina.ginocchio.y + d - 0.008); ctx.stroke();
    }
    ctx.fillStyle = "rgba(255,240,220,.06)";
    arto(ctx, vicina.anca, 0.024, vicina.ginocchio, 0.018); ctx.fill();
  }
  stivale(ctx, vicina, col, det, false, !!o.risvolto);

  ctx.fillStyle = col.cappotto;
  arto(ctx, spalla, 0.034, bv.gomito, 0.027); ctx.fill();
  arto(ctx, bv.gomito, 0.027, bv.polso, 0.021); ctx.fill();
  if (o.tanica) {
    ctx.beginPath(); ctx.arc(bv.polso.x, bv.polso.y + 0.014, 0.024, 0, TAU); ctx.fill();
    const dondolo = 0.05 * Math.sin((f * 2 + 0.3) * TAU) * (1 - fermo) * amp - busto * 0.6 + 0.03;
    tanica(ctx, P(bv.polso.x, bv.polso.y + 0.012), dondolo, col.tanica, det);
  } else {
    ctx.beginPath(); ctx.arc(bv.polso.x + 0.004 * Math.sin(bv.a2), bv.polso.y + 0.022, 0.023, 0, TAU); ctx.fill();
  }

  if (!o.senzaTesta) {
    ctx.fillStyle = col.cappotto;
    const testa = somma(collo, testaOffset);
    arto(ctx, spalla, 0.034, somma(testa, P(0.004, 0.034)), 0.027); ctx.fill();
    ctx.beginPath(); ctx.ellipse(testa.x, testa.y + 0.006, 0.045, 0.054, 0.05, 0, TAU); ctx.fill();
    if (det >= 1) {
      ctx.beginPath(); ctx.moveTo(testa.x + 0.036, testa.y - 0.010); ctx.lineTo(testa.x + 0.062, testa.y + 0.014); ctx.lineTo(testa.x + 0.036, testa.y + 0.022); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.ellipse(testa.x + 0.020, testa.y + 0.040, 0.030, 0.026, 0.1, 0, TAU); ctx.fill();
    }
    if (o.cappello) {
      ctx.beginPath();
      ctx.ellipse(testa.x + 0.010, testa.y - 0.032, 0.114, 0.016, -0.05, 0, TAU); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(testa.x - 0.050, testa.y - 0.034);
      ctx.quadraticCurveTo(testa.x - 0.048, testa.y - 0.112, testa.x - 0.006, testa.y - 0.098);
      ctx.quadraticCurveTo(testa.x + 0.032, testa.y - 0.112, testa.x + 0.056, testa.y - 0.034);
      ctx.closePath(); ctx.fill();
      if (det >= 1) {
        ctx.fillStyle = "rgba(0,0,0,.38)"; ctx.fillRect(testa.x - 0.050, testa.y - 0.048, 0.106, 0.013);
        ctx.fillStyle = col.cappotto;
      }
    }
  }
}

export function disegnaViandante(
  ctx: CanvasRenderingContext2D, x: number, y: number, alto: number, fase: number, o: OpzioniFigura,
) {
  const v = o.verso ?? -1;
  const f = ((fase % 1) + 1) % 1;
  const det = o.dettaglio ?? (alto >= 95 ? 2 : alto >= 42 ? 1 : 0);
  const opz = { ...o, dettaglio: det };
  const col = coloriDa(opz);
  const passate: { dx: number; dy: number; rim: boolean }[] = [];
  const sb = Math.min(0.011, 3.8 / Math.max(24, alto));
  if (o.bordo) passate.push({ dx: (o.latoLuce ?? 1) * sb, dy: -sb * 0.45, rim: true });
  passate.push({ dx: 0, dy: 0, rim: false });

  for (const ps of passate) {
    ctx.save();
    ctx.translate(x + ps.dx * alto, y + ps.dy * alto);
    ctx.scale(alto * v, alto);
    if (ps.rim) {
      const c = { ...col, cappotto: o.bordo!, lontano: o.bordo!, pantaloni: o.bordo!, stivali: o.bordo!, tanica: o.bordo!, cuoio: o.bordo! };
      figura(ctx, f, { ...opz, dettaglio: 0, risvolto: det === 2 }, c, false);
    } else {
      figura(ctx, f, opz, col, true);
    }
    ctx.restore();
  }
}

export function disegnaOmbra(
  ctx: CanvasRenderingContext2D, x: number, y: number, alto: number, fase: number,
  o: OpzioniFigura, inclinazione: number, schiacciamento: number, colore: string,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.transform(1, 0, inclinazione, schiacciamento, 0, 0);
  disegnaViandante(ctx, 0, 0, alto, fase, { ...o, colore, lontano: colore, bordo: undefined, dettaglio: 0 });
  ctx.restore();
}

/** Cosimo fermo sulla sponda opposta del guado, a capo scoperto e col fucile di traverso. */
export function disegnaFermo(ctx: CanvasRenderingContext2D, x: number, y: number, alto: number, colore: string, bordo?: string) {
  disegnaViandante(ctx, x, y, alto, 0, {
    colore,
    bordo,
    latoLuce: -1,
    verso: -1,
    fermo: 1,
    cappello: false,
    fagotto: false,
    tanica: false,
    braccia: 0.32,
    dettaglio: 1,
  });
  // Canna sottile del fucile tenuto di traverso davanti al busto
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = colore;
  ctx.lineWidth = Math.max(1.8, alto * 0.024);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-alto * 0.22, -alto * 0.49);
  ctx.lineTo(alto * 0.16, -alto * 0.56);
  ctx.stroke();
  ctx.restore();
}
