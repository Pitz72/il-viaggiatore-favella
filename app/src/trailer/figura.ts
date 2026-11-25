// ====================================================================
//  Il Viandante dipinto: gouache e china, di profilo e di spalle.
// --------------------------------------------------------------------
//  La figura del trailer sulle tavole dipinte (quella di viandante.ts resta
//  al panorama di gioco, che è una sagoma in controluce). Tre cose la tengono
//  insieme:
//   · l'ANDATURA. Il corpo avanza di FALCATA a ogni ciclo, a passo costante, e
//     il piede d'appoggio resta dov'è: tocca di tallone, si stende, si stacca
//     girando sulla punta, vola e torna avanti. Le ginocchia le trova la
//     cinematica inversa. Chi muove la figura la sposta di FALCATA × statura a
//     ogni ciclo (prospettiva.ts) e i piedi non scivolano: prima il tragitto era
//     disegnato a mano e la figura pattinava;
//   · lo SCHELETRO ha tre dimensioni (di lato, in alto, in avanti), così la
//     stessa camminata si guarda di profilo e di spalle: di spalle il piede che
//     va avanti sale un poco sullo schermo, quello che resta indietro scende e
//     mostra la suola;
//   · la PITTURA. Ogni parte ha il contorno a china e tre toni piatti (luce,
//     mezzo tono, ombra) presi dal colore del materiale e dalla luce della
//     scena: una fascia chiara dal lato del sole, il resto in ombra.
//  Misure in altezze del corpo: 1 = dai piedi alla sommità del capo (il
//  cappello sporge di poco). Origine ai piedi, y verso il basso sullo schermo.
// ====================================================================
import { clamp, lerp, mix } from "./tempo";

const TAU = Math.PI * 2;
const morbido = (k: number) => { const u = clamp(k); return u * u * (3 - 2 * u); };

// ── le misure del corpo ──────────────────────────────────────────────
const COSCIA = 0.245, STINCO = 0.238, CAVIGLIA = 0.052;       // la caviglia sta 0,052 sopra la suola
const TALLONE = 0.040, AVAMPIEDE = 0.092, PUNTA = 0.106;      // dietro e davanti alla caviglia, lungo la suola
const GAMBA = (COSCIA + STINCO) * 0.994;                      // la gamba non si stende mai del tutto
const ANCA_FERMA = CAVIGLIA + COSCIA + STINCO - 0.004;
const BUSTO = 0.300, BRACCIO = 0.165, AVAMBRACCIO = 0.150;
const MEZZE_ANCHE = 0.054, MEZZE_SPALLE = 0.126, MEZZI_PIEDI = 0.050;
/** L'orlo dello spolverino, da terra: appena sotto il ginocchio, così stinchi e scarponi si vedono camminare. */
const ORLO = 0.235;

// ── l'andatura ───────────────────────────────────────────────────────
/** Quanto avanza il corpo in un ciclo (due passi), in altezze: 0,74 × 1,78 m = 1,32 m, due passi da 66 cm. */
export const FALCATA = 0.74;
/** Le frazioni del ciclo: fine del rullo del tallone, il tallone si stacca, la punta si stacca. Il resto è volo. */
const T1 = 0.07, T2 = 0.37, T3 = 0.60;
const PUNTA_SU = 0.30, TALLONE_SU = 0.85;

interface Piede { z: number; y: number; becc: number }

/** La caviglia di un piede rispetto all'anca (z in avanti, y da terra) e il beccheggio del piede (+ la punta in su).
 *  A fase 0 il tallone tocca terra; il corpo avanza di `s` per ciclo e il punto d'appoggio resta fermo nel mondo. */
function piedeInCammino(fase: number, s: number, amp: number): Piede {
  const f = fase - Math.floor(fase);
  const su = PUNTA_SU * (0.4 + 0.6 * amp), giu = TALLONE_SU * (0.45 + 0.55 * amp);
  const h0 = s * 0.25 - TALLONE;                               // dove tocca il tallone, davanti all'anca
  if (f < T1) {                                                // il rullo: il tallone a terra, la punta scende
    const b = su * (1 - morbido(f / T1)), c = Math.cos(b), sn = Math.sin(b);
    return { z: h0 - s * f + TALLONE * c - CAVIGLIA * sn, y: TALLONE * sn + CAVIGLIA * c, becc: b };
  }
  if (f < T2) return { z: h0 - s * f + TALLONE, y: CAVIGLIA, becc: 0 };   // il piede tutto a terra
  const stacco = (ff: number): Piede => {                      // il tallone si alza, il piede gira sulla punta ferma
    const k = (ff - T2) / (T3 - T2), b = -giu * k * k * (3 - 2 * k) * (0.35 + 0.65 * k);
    const c = Math.cos(b), sn = Math.sin(b);
    return { z: h0 - s * ff + TALLONE + AVAMPIEDE - AVAMPIEDE * c - CAVIGLIA * sn, y: -AVAMPIEDE * sn + CAVIGLIA * c, becc: b };
  };
  if (f < T3) return stacco(f);
  // il volo: dalla posa dello stacco a quella dell'appoggio, con il piede che si alza dietro e torna avanti
  const p0 = stacco(T3);
  const c1 = Math.cos(su), s1 = Math.sin(su);
  const z1 = h0 + TALLONE * c1 - CAVIGLIA * s1, y1 = TALLONE * s1 + CAVIGLIA * c1;
  const u = (f - T3) / (1 - T3), u2 = u * u, u3 = u2 * u;
  const m0 = -s * (1 - T3) * 0.30, m1 = -s * (1 - T3) * 0.40;
  const z = (2 * u3 - 3 * u2 + 1) * p0.z + (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) * z1 + (u3 - u2) * m1;
  const y = lerp(p0.y, y1, u) + 0.070 * (0.45 + 0.55 * amp) * Math.sin(Math.PI * Math.pow(u, 0.8));
  return { z, y, becc: lerp(p0.becc, su, morbido(Math.pow(u, 0.9))) };
}

/** Il minimo morbido di tre numeri: l'anca segue il vincolo più stretto senza spigoli. */
function minimoMorbido(a: number, b: number, c: number, k = 0.006) {
  const m = Math.min(a, b, c);
  return m - k * Math.log(Math.exp(-(a - m) / k) + Math.exp(-(b - m) / k) + Math.exp(-(c - m) / k));
}

interface P3 { x: number; y: number; z: number }
interface P2 { x: number; y: number }
const p3 = (x: number, y: number, z: number): P3 => ({ x, y, z });

/** Lo scheletro in una posa: [0] il lato destro (quello verso chi guarda, di profilo), [1] il sinistro. */
interface Posa {
  bacino: P3;
  anche: [P3, P3]; ginocchia: [P3, P3]; caviglie: [P3, P3]; becc: [number, number];
  centroSpalle: P3; spalle: [P3, P3]; gomiti: [P3, P3]; polsi: [P3, P3];
  collo: P3; testa: P3;
  busto: number;        // quanto pende in avanti (rad)
  dondolo: number;      // −1…1: il ciclo, per le stoffe che seguono in ritardo
  cammina: number;      // 1 cammina … 0 fermo
}

interface Pose { tanica: boolean; fucile: boolean }

function posa(fase: number, amp: number, fermo: number, respiro: number, o: Pose): Posa {
  const cam = 1 - fermo, s = FALCATA * amp;
  const f = fase - Math.floor(fase);
  const co = Math.cos(TAU * f), si = Math.sin(TAU * f);
  const fermi: [Piede, Piede] = [{ z: 0.016, y: CAVIGLIA, becc: 0 }, { z: -0.024, y: CAVIGLIA, becc: 0 }];
  const piedi = [0, 1].map((i) => {
    const w = piedeInCammino(f + i * 0.5, s, amp), q = fermi[i];
    return { z: lerp(w.z, q.z, fermo), y: lerp(w.y, q.y, fermo), becc: lerp(w.becc, q.becc, fermo) };
  });
  // il bacino: gira (l'anca della gamba avanti va avanti), dondola verso la gamba d'appoggio, pende dal lato della gamba in volo
  const giro = 0.016 * co * cam * amp, lato = 0.018 * si * cam, pende = 0.007 * si * cam;
  const zAnca = [giro, -giro];
  const arriva = (i: number) => piedi[i].y + Math.sqrt(Math.max(1e-6, GAMBA * GAMBA - (piedi[i].z - zAnca[i]) ** 2));
  const yAnca = minimoMorbido(ANCA_FERMA, arriva(0), arriva(1));
  const bacino = p3(lato, yAnca, 0);
  const anche: [P3, P3] = [p3(lato + MEZZE_ANCHE, yAnca + pende, zAnca[0]), p3(lato - MEZZE_ANCHE, yAnca - pende, zAnca[1])];
  const caviglie = piedi.map((q, i) => p3((i ? -1 : 1) * MEZZI_PIEDI, q.y, q.z)) as [P3, P3];
  const ginocchia = [0, 1].map((i) => {
    const a = anche[i], c = caviglie[i];
    const dz = c.z - a.z, dy = c.y - a.y, d = Math.min(Math.hypot(dz, dy), COSCIA + STINCO - 1e-4);
    const apre = Math.acos(clamp((COSCIA * COSCIA + d * d - STINCO * STINCO) / (2 * COSCIA * d), -1, 1));
    const ang = Math.atan2(dy, dz) + apre;                     // il ginocchio piega in avanti
    return p3(lerp(a.x, c.x, 0.5), a.y + COSCIA * Math.sin(ang), a.z + COSCIA * Math.cos(ang));
  }) as [P3, P3];

  // il busto: pende appena in avanti; le spalle girano al contrario del bacino
  const busto = lerp(0.075 + 0.012 * Math.cos(2 * TAU * f) * amp, 0.02, fermo);
  const fiato = fermo * 0.004 * Math.sin(respiro * 1.9);
  const cs = p3(lato * 0.55, yAnca + BUSTO * Math.cos(busto) + fiato, BUSTO * Math.sin(busto));
  const giroSp = 0.030 * co * cam * amp, pendeSp = 0.005 * si * cam;
  const spalle: [P3, P3] = [p3(cs.x + MEZZE_SPALLE, cs.y - pendeSp, cs.z - giroSp), p3(cs.x - MEZZE_SPALLE, cs.y + pendeSp, cs.z + giroSp)];
  // le braccia: opposte alla gamba dello stesso lato; quella che porta la tanica dondola poco e resta più dritta
  let aD = lerp(-(o.tanica ? 0.11 : 0.34) * co * amp + (o.tanica ? 0.03 : 0), 0.03, fermo);
  let aS = lerp(0.36 * Math.cos(TAU * f - 0.25) * amp, 0.02, fermo);
  let pD = lerp(o.tanica ? 0.07 : 0.24, o.tanica ? 0.05 : 0.14, fermo);
  let pS = lerp(0.24 + 0.22 * Math.max(0, Math.cos(TAU * f - 0.25)), 0.14, fermo);
  if (o.fucile) { aD = -0.20; pD = 1.15; aS = 0.42; pS = 0.18; }   // il fucile tenuto basso davanti al busto, la canna verso terra
  const braccio = (sp: P3, a: number, piega: number, segno: number): [P3, P3] => {
    const g = p3(sp.x + segno * 0.014, sp.y - BRACCIO * Math.cos(a), sp.z + BRACCIO * Math.sin(a));
    const b = a + piega;
    return [g, p3(g.x + segno * (o.fucile ? -0.03 : 0.010), g.y - AVAMBRACCIO * Math.cos(b), g.z + AVAMBRACCIO * Math.sin(b))];
  };
  const [gD, wD] = braccio(spalle[0], aD, pD, 1), [gS, wS] = braccio(spalle[1], aS, pS, -1);
  const collo = p3(lato * 0.4, cs.y + 0.050, cs.z + 0.010 + 0.03 * Math.sin(busto));
  const testa = p3(lato * 0.3, collo.y + 0.068, collo.z + 0.016);
  return { bacino, anche, ginocchia, caviglie, becc: [piedi[0].becc, piedi[1].becc], centroSpalle: cs, spalle, gomiti: [gD, gS], polsi: [wD, wS], collo, testa,
    busto, dondolo: Math.sin(TAU * (f - 0.12)) * cam * amp, cammina: cam };
}

// ── la luce e i colori ───────────────────────────────────────────────
/** La luce di una scena sulla figura. I colori dei materiali sono fissi (lo spolverino è sempre quello): la scena li tinge. */
export interface LuceFigura {
  /** la luce diffusa: moltiplica i colori dei materiali (un grigio chiaro li lascia quasi com'erano) */
  ambiente: string;
  /** la luce diretta (il sole, la luna): verso questo colore va la fascia illuminata, di `forza` (0…1) */
  chiave: string;
  forza: number;
  /** il colore verso cui scendono le ombre, e quanto è in ombra la figura intera (0 in piena luce … 1 in controluce) */
  buio: string;
  fondo: number;
  /** da che parte arriva la luce sullo schermo (−1 da sinistra, +1 da destra) e quanto dall'alto (0…1) */
  lato: -1 | 1;
  alto?: number;
  /** il colore del tratto */
  china: string;
}

type Materiale = "cappotto" | "mantella" | "pantaloni" | "cuoio" | "suola" | "cappello" | "nastro" | "pelle" | "capelli" | "barba"
  | "coperta" | "riga" | "cinghia" | "tanica" | "ruggine" | "ferro" | "legno";
/** I colori veri delle cose, come sulla locandina dipinta: spolverino ocra spento, tanica grigioverde con la ruggine. */
const COLORI: Record<Materiale, string> = {
  cappotto: "#8a7350", mantella: "#96805c", pantaloni: "#5a4b40", cuoio: "#6e4a2e", suola: "#3a2a1e", cappello: "#5e4a36", nastro: "#33261c",
  pelle: "#c99872", capelli: "#3a2b20", barba: "#6b513c", coperta: "#9a8c78", riga: "#8e4a34", cinghia: "#7a5230", tanica: "#8c8a72",
  ruggine: "#96552f", ferro: "#4a4a50", legno: "#7a5234",
};
/** Il fratello al guado: cappotto scuro, a capo scoperto. */
const COLORI_FRATELLO: Partial<Record<Materiale, string>> = { cappotto: "#4c4142", mantella: "#564a4a", pantaloni: "#3a3233", capelli: "#2c211b", barba: "#4a382c" };

interface Toni { luce: string; mezzo: string; ombra: string }
const canale = (c: string, i: number) => parseInt(c.slice(1 + i * 2, 3 + i * 2), 16);
const moltiplica = (a: string, b: string) =>
  "#" + [0, 1, 2].map((i) => Math.round((canale(a, i) * canale(b, i)) / 255).toString(16).padStart(2, "0")).join("");

function toni(base: string, l: LuceFigura): Toni {
  const diffuso = moltiplica(base, l.ambiente);
  const mezzo = mix(diffuso, l.buio, l.fondo * 0.5);
  return { luce: mix(diffuso, l.chiave, l.forza), mezzo, ombra: mix(mezzo, l.buio, 0.42 + l.fondo * 0.2) };
}
/** Lo stesso materiale dal lato lontano del corpo: un tono più giù. */
const lontano = (t: Toni, l: LuceFigura): Toni => ({ luce: t.mezzo, mezzo: t.ombra, ombra: mix(t.ombra, l.buio, 0.35) });

type Ctx = CanvasRenderingContext2D;
interface Stile {
  /** un colore solo, senza china: la sagoma dell'ombra a terra */
  sagoma: string | null;
  china: string;
  tratto: number;
  /** verso dove si sposta l'ombra dentro ogni parte (lontano dalla luce), nel sistema della figura */
  ox: number; oy: number;
  /** quanto è larga la fascia del mezzo tono prima dell'ombra: larga in piena luce, stretta in controluce */
  mezzo: number;
  l: LuceFigura;
  t: Record<Materiale, Toni>;
  far: Record<Materiale, Toni>;
}

// ── i tracciati ──────────────────────────────────────────────────────
/** Un arto: due cerchi uniti dalle tangenti. */
function capsula(a: P2, ra: number, b: P2, rb: number): Path2D {
  const p = new Path2D();
  const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
  if (d < 1e-5) { p.arc(a.x, a.y, Math.max(ra, rb), 0, TAU); return p; }
  const ang = Math.atan2(dy, dx), nx = -dy / d, ny = dx / d;
  p.moveTo(a.x + nx * ra, a.y + ny * ra);
  p.lineTo(b.x + nx * rb, b.y + ny * rb);
  p.arc(b.x, b.y, rb, ang + Math.PI / 2, ang - Math.PI / 2, true);
  p.lineTo(a.x - nx * ra, a.y - ny * ra);
  p.arc(a.x, a.y, ra, ang - Math.PI / 2, ang + Math.PI / 2, true);
  p.closePath();
  return p;
}
const insieme = (...parti: Path2D[]) => { const p = new Path2D(); for (const q of parti) p.addPath(q); return p; };
type V = [number, number] | [number, number, 1];

/** Una forma chiusa: passa per i punti medi dei lati e si appoggia ai vertici; il terzo numero (1) segna uno spigolo vivo. */
function forma(pts: V[], ox = 0, oy = 0, rot = 0): Path2D {
  const c = Math.cos(rot), s = Math.sin(rot);
  const q = pts.map(([x, y, v]) => ({ x: ox + x * c - y * s, y: oy + x * s + y * c, v: !!v }));
  // tutte le forme girano nello stesso verso delle capsule: unite in un tracciato solo (`insieme`) si sommano; in versi
  // opposti, dove si sovrappongono si cancellerebbero e resterebbe un buco
  let area = 0;
  for (let i = 0; i < q.length; i++) { const a = q[i], b = q[(i + 1) % q.length]; area += a.x * b.y - b.x * a.y; }
  if (area > 0) q.reverse();
  const p = new Path2D(), n = q.length;
  const m0 = { x: (q[n - 1].x + q[0].x) / 2, y: (q[n - 1].y + q[0].y) / 2 };
  p.moveTo(m0.x, m0.y);
  for (let i = 0; i < n; i++) {
    const a = q[i], b = q[(i + 1) % n], mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    if (a.v) { p.lineTo(a.x, a.y); p.lineTo(mx, my); } else p.quadraticCurveTo(a.x, a.y, mx, my);
  }
  p.closePath();
  return p;
}
const ellisse = (x: number, y: number, rx: number, ry: number, rot = 0) => { const p = new Path2D(); p.ellipse(x, y, rx, ry, rot, 0, TAU, true); return p; };

/** Dipinge una parte: il contorno a china, poi i tre toni in fasce (la luce dal lato del sole, l'ombra dall'altro). */
function dipingi(g: Ctx, p: Path2D, t: Toni, st: Stile, banda = 1, china = true) {
  if (st.sagoma) { g.fillStyle = st.sagoma; g.fill(p); return; }
  if (china) { g.strokeStyle = st.china; g.lineWidth = st.tratto * 2; g.lineJoin = "round"; g.lineCap = "round"; g.stroke(p); }
  g.save();
  g.clip(p);
  g.fillStyle = t.luce; g.fill(p);
  g.translate(st.ox * 0.014 * banda, st.oy * 0.014 * banda); g.fillStyle = t.mezzo; g.fill(p);
  g.translate(st.ox * st.mezzo * banda, st.oy * st.mezzo * banda); g.fillStyle = t.ombra; g.fill(p);
  g.restore();
}
/** Una tinta piatta dentro una parte già dipinta (una riga della coperta, la polvere sull'orlo). */
function tinta(g: Ctx, dentro: Path2D, p: Path2D, colore: string, st: Stile, alfa = 1) {
  if (st.sagoma) return;
  g.save(); g.clip(dentro); g.globalAlpha *= alfa; g.fillStyle = colore; g.fill(p); g.restore();
}
/** Un segno a china dentro la figura: una piega, una cucitura. */
function segno(g: Ctx, st: Stile, pts: [number, number][], spessore = 0.55, alfa = 0.8) {
  if (st.sagoma || pts.length < 2) return;
  g.save();
  g.globalAlpha *= alfa; g.strokeStyle = st.china; g.lineWidth = st.tratto * spessore; g.lineCap = "round"; g.lineJoin = "round";
  g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length - 1; i++) g.quadraticCurveTo(pts[i][0], pts[i][1], (pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2);
  const u = pts[pts.length - 1]; g.lineTo(u[0], u[1]);
  g.stroke();
  g.restore();
}

// ── le opzioni ───────────────────────────────────────────────────────
export interface OpzioniFigura {
  vista: "profilo" | "spalle";
  luce: LuceFigura;
  /** di profilo: +1 guarda a destra, −1 a sinistra */
  verso?: 1 | -1;
  /** 0 cammina … 1 fermo in piedi */
  fermo?: number;
  /** 0…1: quanto è lungo il passo (1 = FALCATA) */
  ampiezza?: number;
  /** il tempo, per il respiro di chi sta fermo */
  respiro?: number;
  tanica?: boolean;
  coperta?: boolean;
  cappello?: boolean;
  /** il fratello: cappotto scuro, il fucile di traverso */
  fratello?: boolean;
  /** di spalle: quanto un metro in profondità sale sullo schermo (prospettiva.ts: Posto.scorcio) */
  scorcio?: number;
  /** un colore solo, senza china: per l'ombra a terra */
  sagoma?: string;
}

function stileDi(o: OpzioniFigura, alto: number): Stile {
  const l = o.luce, v = o.vista === "profilo" ? (o.verso ?? 1) : 1;
  const colori = o.fratello ? { ...COLORI, ...COLORI_FRATELLO } : COLORI;
  const t = {} as Record<Materiale, Toni>, far = {} as Record<Materiale, Toni>;
  // (anche per la sagoma dell'ombra, che non li usa: chi dipinge legge i toni prima di sapere che non servono)
  for (const k of Object.keys(colori) as Materiale[]) { t[k] = toni(colori[k], l); far[k] = lontano(t[k], l); }
  const su = l.alto ?? 0.5, n = Math.hypot(1, su);
  // il tratto: 2,6 px su una figura di 240, mai sotto 1,1 px e mai sopra 3,4
  return { sagoma: o.sagoma ?? null, china: l.china, tratto: clamp(2.6 / 240, 1.1 / alto, 3.4 / alto), ox: (-l.lato * v) / n, oy: su / n, mezzo: lerp(0.075, 0.022, l.fondo), l, t, far };
}

// ── lo scarpone ──────────────────────────────────────────────────────
/** Di profilo: gambale, tomaia, suola col tacco, lacci; la polvere sul bordo. */
function scarponeProfilo(g: Ctx, c: P2, stinco: number, becc: number, st: Stile, t: Record<Materiale, Toni>) {
  // il gambale segue lo stinco, il piede il suo beccheggio
  const gambale = forma([[-0.031, -0.098, 1], [0.031, -0.098, 1], [0.034, -0.030], [0.031, 0.008], [-0.035, 0.008], [-0.036, -0.040]], c.x, c.y, stinco);
  const piede = forma([[-TALLONE - 0.002, -0.022], [-TALLONE - 0.008, 0.016], [-TALLONE - 0.004, 0.040, 1], [PUNTA + 0.002, 0.040, 1], [PUNTA + 0.012, 0.024], [PUNTA - 0.002, 0.002], [0.062, -0.014], [0.036, -0.032], [0.0, -0.038]], c.x, c.y, -becc);
  const tomaia = insieme(gambale, piede);
  dipingi(g, tomaia, t.cuoio, st, 0.6);
  const suola = forma([[-TALLONE - 0.008, 0.034, 1], [PUNTA + 0.010, 0.034, 1], [PUNTA + 0.010, 0.050], [0.020, CAVIGLIA, 1], [0.016, 0.046, 1], [-0.010, 0.046, 1], [-0.014, CAVIGLIA, 1], [-TALLONE - 0.008, CAVIGLIA, 1]], c.x, c.y, -becc);
  dipingi(g, suola, t.suola, st, 0.3);
  if (st.sagoma) return;
  const cb = Math.cos(-becc), sb = Math.sin(-becc);
  const pt = (x: number, y: number): [number, number] => [c.x + x * cb - y * sb, c.y + x * sb + y * cb];
  for (let k = 0; k < 4; k++) segno(g, st, [pt(0.030 + k * 0.010, -0.028 + k * 0.006), pt(0.040 + k * 0.010, -0.014 + k * 0.006)], 0.45, 0.75);   // i lacci
  segno(g, st, [pt(0.072, -0.008), pt(0.082, 0.012), pt(0.078, 0.032)], 0.45, 0.6);                                                                   // la punta rinforzata
  const cs = Math.cos(stinco), ss = Math.sin(stinco);
  const ps = (x: number, y: number): [number, number] => [c.x + x * cs - y * ss, c.y + x * ss + y * cs];
  segno(g, st, [ps(-0.030, -0.066), ps(0.0, -0.058), ps(0.031, -0.068)], 0.45, 0.6);                                                                  // una piega del gambale
}

/** Di spalle: il gambale e il tallone; quando il tallone si alza, la suola che guarda indietro. */
function scarponeSpalle(g: Ctx, c: P2, becc: number, scorcio: number, st: Stile, t: Record<Materiale, Toni>) {
  // tallone e punta della suola sullo schermo: la punta va avanti (lo scorcio la alza di poco), il tallone sale col beccheggio
  const cb = Math.cos(becc), sb = Math.sin(becc);
  const yTall = c.y + (TALLONE * sb + CAVIGLIA * cb) + (TALLONE * cb - CAVIGLIA * sb) * scorcio;
  const yPunta = c.y + (-PUNTA * sb + CAVIGLIA * cb) - (PUNTA * cb + CAVIGLIA * sb) * scorcio;
  const h = yPunta - yTall;                                    // quanta suola si vede: niente col piede a terra
  const gambale = forma([[-0.031, -0.098, 1], [0.031, -0.098, 1], [0.034, -0.020], [0.033, yTall - c.y, 1], [-0.033, yTall - c.y, 1], [-0.034, -0.020]], c.x, c.y);
  if (h > 0.014) {
    const suola = forma([[-0.028, 0, 1], [0.028, 0, 1], [0.033, h * 0.55], [0.028, h], [-0.028, h], [-0.033, h * 0.55]], c.x, yTall);
    dipingi(g, insieme(gambale, suola), t.cuoio, st, 0.6);
    dipingi(g, suola, t.suola, st, 0.5);
    for (let k = 1; k <= 3; k++) segno(g, st, [[c.x - 0.022, yTall + (h * (k + 0.6)) / 4.4], [c.x + 0.022, yTall + (h * (k + 0.6)) / 4.4]], 0.45, 0.55);
    segno(g, st, [[c.x - 0.028, yTall + h * 0.26], [c.x + 0.028, yTall + h * 0.26]], 0.6, 0.8);            // il bordo del tacco
  } else {
    dipingi(g, gambale, t.cuoio, st, 0.6);
    dipingi(g, forma([[-0.035, -0.016, 1], [0.035, -0.016, 1], [0.034, 0.0, 1], [-0.034, 0.0, 1]], c.x, yTall), t.suola, st, 0.3);   // il tacco
  }
  segno(g, st, [[c.x, c.y - 0.092], [c.x + 0.002, c.y - 0.03], [c.x, yTall - 0.020]], 0.45, 0.6);           // la cucitura dietro
}

// ── la tanica ────────────────────────────────────────────────────────
function tanicaProfilo(g: Ctx, mano: P2, oscilla: number, st: Stile) {
  g.save(); g.translate(mano.x, mano.y); g.rotate(oscilla);
  const w = 0.132, h = 0.178, y0 = 0.034;
  // le tre maniglie in una: un ponte sopra il corpo
  dipingi(g, forma([[-0.036, y0 + 0.004, 1], [-0.036, -0.012], [0.0, -0.022], [0.036, -0.012], [0.036, y0 + 0.004, 1], [0.022, y0 + 0.004, 1], [0.022, -0.002], [0.0, -0.008], [-0.022, -0.002], [-0.022, y0 + 0.004, 1]]), st.t.tanica, st, 0.4);
  const corpo = forma([[-w / 2, y0 + 0.010], [-w / 2 + 0.012, y0, 1], [w / 2 - 0.040, y0, 1], [w / 2 - 0.028, y0 - 0.012, 1], [w / 2 - 0.004, y0 + 0.006], [w / 2, y0 + 0.030], [w / 2, y0 + h - 0.010], [w / 2 - 0.010, y0 + h, 1],
    [-w / 2 + 0.010, y0 + h, 1], [-w / 2, y0 + h - 0.010]]);
  dipingi(g, corpo, st.t.tanica, st, 0.9);
  dipingi(g, forma([[w / 2 - 0.046, y0 - 0.028, 1], [w / 2 - 0.018, y0 - 0.036, 1], [w / 2 - 0.010, y0 - 0.014, 1], [w / 2 - 0.038, y0 - 0.006, 1]]), st.t.ruggine, st, 0.3);   // il tappo
  // la nervatura a X stampata nel fianco, e la ruggine sugli spigoli
  const xa = -w / 2 + 0.020, xb = w / 2 - 0.020, ya = y0 + 0.030, yb = y0 + h - 0.024;
  segno(g, st, [[xa, ya], [-0.014, (ya + yb) / 2 - 0.022], [0.014, (ya + yb) / 2 - 0.022], [xb, ya]], 0.5, 0.7);
  segno(g, st, [[xa, yb], [-0.014, (ya + yb) / 2 + 0.022], [0.014, (ya + yb) / 2 + 0.022], [xb, yb]], 0.5, 0.7);
  segno(g, st, [[-0.016, (ya + yb) / 2 - 0.022], [-0.016, (ya + yb) / 2 + 0.022]], 0.5, 0.7);
  segno(g, st, [[0.016, (ya + yb) / 2 - 0.022], [0.016, (ya + yb) / 2 + 0.022]], 0.5, 0.7);
  tinta(g, corpo, forma([[-w / 2 - 0.01, y0 + h - 0.030], [-w / 2 + 0.03, y0 + h - 0.018], [-0.01, y0 + h - 0.008], [0.03, y0 + h + 0.01], [-w / 2 - 0.01, y0 + h + 0.01]]), st.t.ruggine.mezzo, st, 0.7);
  tinta(g, corpo, forma([[w / 2 - 0.022, y0 + 0.020], [w / 2 + 0.01, y0 + 0.030], [w / 2 + 0.01, y0 + 0.090], [w / 2 - 0.012, y0 + 0.070]]), st.t.ruggine.mezzo, st, 0.6);
  g.restore();
}

/** Di spalle se ne vede il fianco stretto, con una fetta della faccia larga. */
function tanicaSpalle(g: Ctx, mano: P2, oscilla: number, st: Stile) {
  g.save(); g.translate(mano.x, mano.y); g.rotate(oscilla);
  const w = 0.060, h = 0.178, y0 = 0.034;
  dipingi(g, forma([[-0.012, y0 + 0.004, 1], [-0.012, -0.018], [0.012, -0.018], [0.012, y0 + 0.004, 1]]), st.t.tanica, st, 0.3);
  const faccia = forma([[w / 2 - 0.004, y0 + 0.004, 1], [w / 2 + 0.030, y0 + 0.012], [w / 2 + 0.032, y0 + h - 0.016], [w / 2 - 0.004, y0 + h - 0.002, 1]]);
  dipingi(g, faccia, st.far.tanica, st, 0.5);
  const corpo = forma([[-w / 2, y0 + 0.010], [-w / 2 + 0.010, y0, 1], [w / 2 - 0.010, y0, 1], [w / 2, y0 + 0.010], [w / 2, y0 + h - 0.010], [w / 2 - 0.010, y0 + h, 1], [-w / 2 + 0.010, y0 + h, 1], [-w / 2, y0 + h - 0.010]]);
  dipingi(g, corpo, st.t.tanica, st, 0.5);
  segno(g, st, [[0, y0 + 0.014], [0.001, y0 + h * 0.5], [0, y0 + h - 0.012]], 0.5, 0.7);                 // la saldatura in mezzo al fianco
  tinta(g, corpo, forma([[-w / 2 - 0.01, y0 + h - 0.026], [0, y0 + h - 0.012], [w / 2 + 0.01, y0 + h - 0.022], [w / 2 + 0.01, y0 + h + 0.01], [-w / 2 - 0.01, y0 + h + 0.01]]), st.t.ruggine.mezzo, st, 0.7);
  g.restore();
}

// ── di profilo ───────────────────────────────────────────────────────
function profilo(g: Ctx, P: Posa, o: OpzioniFigura, st: Stile) {
  const pr = (p: P3): P2 => ({ x: p.z, y: -p.y });
  const A = pr(P.bacino), S = pr(P.centroSpalle), N = pr(P.collo), T = pr(P.testa);
  const an = P.anche.map(pr), gi = P.ginocchia.map(pr), ca = P.caviglie.map(pr), sp = P.spalle.map(pr), go = P.gomiti.map(pr), po = P.polsi.map(pr);
  const t = st.t, far = st.far, b = P.busto;
  const cb = Math.cos(b), sb = Math.sin(b);
  /** un punto del busto: `x` in avanti e `y` in giù rispetto al centro delle spalle, piegato col busto */
  const bp = (x: number, y: number): [number, number] => [S.x + x * cb + y * sb, S.y - x * sb + y * cb];
  const bu = (x: number, y: number, vivo?: 1): V => (vivo ? [...bp(x, y), 1] : bp(x, y));
  const stinco = (i: number) => Math.atan2(ca[i].x - gi[i].x, ca[i].y - gi[i].y) * -1;

  // il braccio lontano
  if (!o.fratello) {
    dipingi(g, insieme(capsula(sp[1], 0.034, go[1], 0.028), capsula(go[1], 0.028, po[1], 0.022)), far.cappotto, st, 0.6);
    dipingi(g, ellisse(po[1].x + 0.004, po[1].y + 0.020, 0.020, 0.024), far.pelle, st, 0.4);
  }
  // le gambe: prima la lontana
  for (const i of [1, 0]) {
    const tt = i ? far : t;
    dipingi(g, insieme(capsula(an[i], 0.056, gi[i], 0.044), capsula(gi[i], 0.044, { x: ca[i].x, y: ca[i].y - 0.05 }, 0.036)), tt.pantaloni, st, 0.7);
    scarponeProfilo(g, ca[i], stinco(i), P.becc[i], st, tt);
    if (!i) segno(g, st, [[gi[0].x - 0.030, gi[0].y - 0.006], [gi[0].x, gi[0].y + 0.012], [gi[0].x + 0.030, gi[0].y - 0.004]], 0.45, 0.55);
  }

  // lo spolverino: il busto e la falda, che si apre sul passo e segue in ritardo
  const yOrlo = -ORLO;
  const xDavanti = Math.max(A.x + 0.085, ...[0, 1].map((i) => lerp(gi[i].x, ca[i].x, 0.25) + 0.058)) + 0.008 * P.dondolo;
  const xDietro = Math.min(A.x - 0.105, ...[0, 1].map((i) => lerp(gi[i].x, ca[i].x, 0.25) - 0.062)) + 0.022 * P.dondolo;
  const corpo = forma([
    bu(-0.060, -0.030), bu(-0.094, 0.060), bu(-0.090, 0.180), [A.x - 0.098, A.y - 0.020], [lerp(A.x - 0.10, xDietro, 0.6), lerp(A.y, yOrlo, 0.55)],
    [xDietro, yOrlo - 0.004, 1], [lerp(xDietro, xDavanti, 0.5), yOrlo + 0.012 + 0.006 * P.dondolo], [xDavanti, yOrlo + 0.002, 1],
    [lerp(A.x + 0.086, xDavanti, 0.55), lerp(A.y, yOrlo, 0.5)], [A.x + 0.084, A.y - 0.030], bu(0.088, 0.170), bu(0.092, 0.070), bu(0.056, -0.030),
  ]);
  dipingi(g, corpo, t.cappotto, st, 1.5);
  // la polvere sull'orlo, la falda aperta davanti, le pieghe
  tinta(g, corpo, forma([[xDietro - 0.02, yOrlo - 0.040], [A.x, yOrlo - 0.028], [xDavanti + 0.02, yOrlo - 0.040], [xDavanti + 0.02, yOrlo + 0.03], [xDietro - 0.02, yOrlo + 0.03]]), t.cappotto.luce, st, 0.28);
  segno(g, st, [[A.x + 0.060, A.y - 0.090], [lerp(A.x + 0.060, xDavanti - 0.030, 0.5), lerp(A.y, yOrlo, 0.45)], [xDavanti - 0.030, yOrlo]], 0.6, 0.75);
  segno(g, st, [[A.x - 0.050, A.y - 0.060], [lerp(A.x - 0.06, xDietro + 0.04, 0.5) - 0.01 * P.dondolo, lerp(A.y, yOrlo, 0.5)], [xDietro + 0.040, yOrlo - 0.006]], 0.5, 0.6);
  segno(g, st, [[A.x + 0.010, A.y + 0.020], [lerp(A.x, (xDietro + xDavanti) / 2, 0.6), lerp(A.y, yOrlo, 0.6)], [(xDietro + xDavanti) / 2, yOrlo + 0.004]], 0.45, 0.5);
  // la cintura
  const cinta = forma([[A.x - 0.098, A.y - 0.100, 1], [A.x + 0.090, A.y - 0.112, 1], [A.x + 0.090, A.y - 0.088, 1], [A.x - 0.098, A.y - 0.076, 1]]);
  if (!st.sagoma) {
    tinta(g, corpo, cinta, t.cinghia.mezzo, st);
    g.save(); g.clip(corpo);
    segno(g, st, [[A.x - 0.098, A.y - 0.100], [A.x + 0.090, A.y - 0.112]], 0.45, 0.7); segno(g, st, [[A.x - 0.098, A.y - 0.076], [A.x + 0.090, A.y - 0.088]], 0.45, 0.7);
    g.restore();
  }

  // la coperta arrotolata, di testa dietro la spalla, e la sua cinghia sul petto
  if (o.coperta) {
    const [cx, cy] = bu(-0.100, 0.100);
    if (!st.sagoma) { const [x0, y0] = bu(-0.070, 0.010), [x1, y1] = bu(0.060, 0.200); g.save(); g.clip(corpo); g.strokeStyle = t.cinghia.mezzo; g.lineWidth = 0.020; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.restore(); segno(g, st, [[x0 + 0.010, y0 - 0.004], [x1 + 0.010, y1 - 0.006]], 0.4, 0.6); }
    const rotolo = ellisse(cx, cy, 0.044, 0.048, b);
    dipingi(g, rotolo, t.coperta, st, 0.7);
    tinta(g, rotolo, ellisse(cx, cy, 0.031, 0.034, b), t.riga.mezzo, st, 0.55);
    tinta(g, rotolo, ellisse(cx, cy, 0.022, 0.025, b), t.coperta.mezzo, st);
    segno(g, st, [[cx - 0.022, cy], [cx - 0.008, cy - 0.018], [cx + 0.013, cy - 0.010], [cx + 0.013, cy + 0.010], [cx - 0.002, cy + 0.013], [cx - 0.005, cy]], 0.45, 0.7);   // la spirale
  }

  // il braccio vicino, con la tanica (o il fucile)
  const fratello = !!o.fratello;
  if (fratello) {
    // il fucile di traverso: dal calcio sotto il gomito alla canna oltre la mano avanti
    const m0 = po[0], m1 = po[1], dx = m1.x - m0.x, dy = m1.y - m0.y, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
    const a = { x: m0.x - ux * 0.14, y: m0.y - uy * 0.14 }, c = { x: m1.x + ux * 0.30, y: m1.y + uy * 0.30 };
    dipingi(g, capsula(m0, 0.010, c, 0.007), t.ferro, st, 0.2);
    dipingi(g, capsula(a, 0.022, { x: m0.x + ux * 0.05, y: m0.y + uy * 0.05 }, 0.014), t.legno, st, 0.3);
    dipingi(g, insieme(capsula(sp[1], 0.034, go[1], 0.028), capsula(go[1], 0.028, po[1], 0.022)), far.cappotto, st, 0.6);
    dipingi(g, ellisse(po[1].x, po[1].y, 0.022, 0.022), far.pelle, st, 0.4);
  }
  if (o.tanica && !fratello) tanicaProfilo(g, { x: po[0].x, y: po[0].y + 0.014 }, 0.05 * Math.sin(P.dondolo * 1.2) - b * 0.5, st);
  dipingi(g, insieme(capsula(sp[0], 0.038, go[0], 0.031), capsula(go[0], 0.031, po[0], 0.024)), t.cappotto, st, 0.7);
  segno(g, st, [[go[0].x - 0.022, go[0].y - 0.010], [go[0].x + 0.002, go[0].y + 0.006], [go[0].x + 0.024, go[0].y - 0.006]], 0.45, 0.6);
  dipingi(g, ellisse(po[0].x + 0.004, po[0].y + 0.018, 0.023, 0.025), t.pelle, st, 0.4);

  // la mantellina sulle spalle (lo spolverino da pastore della locandina), poi il bavero alzato
  if (!fratello) {
    const mant = forma([bu(-0.050, -0.040), bu(-0.108, 0.030), bu(-0.118, 0.120 + 0.006 * P.dondolo, 1), bu(-0.020, 0.150), bu(0.070, 0.132), bu(0.112, 0.112 - 0.004 * P.dondolo, 1), bu(0.098, 0.020), bu(0.050, -0.036)]);
    dipingi(g, mant, t.mantella, st, 1.2);
    segno(g, st, [bp(-0.030, -0.020), bp(-0.046, 0.060), bp(-0.040, 0.138)], 0.45, 0.5);
    segno(g, st, [bp(0.040, -0.010), bp(0.058, 0.060), bp(0.056, 0.126)], 0.45, 0.5);
  }
  // il collo e la testa
  dipingi(g, capsula({ x: N.x - 0.004, y: N.y + 0.020 }, 0.034, { x: T.x - 0.006, y: T.y + 0.030 }, 0.030), t.pelle, st, 0.5);
  const viso = forma([[-0.056, -0.004], [-0.046, -0.052], [0.0, -0.066], [0.038, -0.052], [0.054, -0.022], [0.050, -0.008, 1], [0.074, 0.014, 1], [0.054, 0.022, 1], [0.057, 0.034], [0.052, 0.054], [0.028, 0.068], [-0.006, 0.058], [-0.040, 0.040]], T.x, T.y, -b * 0.4);
  dipingi(g, viso, t.pelle, st, 0.7);
  tinta(g, viso, forma([[0.060, 0.024], [0.054, 0.058], [0.028, 0.072], [-0.004, 0.060], [0.000, 0.028], [0.030, 0.034]], T.x, T.y, -b * 0.4), t.barba.mezzo, st, 0.85);
  tinta(g, viso, forma([[-0.060, -0.006], [-0.048, -0.056], [0.0, -0.070], [0.036, -0.058], [0.030, -0.030], [0.004, -0.026], [-0.006, 0.006], [-0.030, 0.038], [-0.054, 0.032]], T.x, T.y, -b * 0.4), t.capelli.mezzo, st);
  segno(g, st, [[T.x + 0.034, T.y - 0.014], [T.x + 0.046, T.y - 0.012]], 0.7, 0.9);                          // l'occhio
  segno(g, st, [[T.x - 0.006, T.y - 0.002], [T.x - 0.012, T.y + 0.012], [T.x - 0.004, T.y + 0.020]], 0.5, 0.7);   // l'orecchio
  const bavero = forma([bu(-0.064, 0.010), bu(-0.062, -0.060), bu(-0.040, -0.074, 1), bu(-0.006, -0.040), bu(0.044, -0.022, 1), bu(0.060, 0.010), bu(0.030, 0.030), bu(-0.040, 0.030)]);
  dipingi(g, bavero, fratello ? t.cappotto : t.mantella, st, 0.6);
  segno(g, st, [bp(-0.044, -0.056), bp(-0.014, -0.022), bp(0.020, 0.012)], 0.45, 0.55);
  if (o.cappello) {
    const hx = T.x + 0.006, hy = T.y - 0.038, rot = -0.05 - b * 0.4;
    dipingi(g, forma([[-0.060, -0.004, 1], [-0.058, -0.070], [-0.022, -0.090], [0.004, -0.076], [0.030, -0.090], [0.058, -0.066], [0.064, -0.004, 1]], hx, hy, rot), t.cappello, st, 0.8);
    const tesa = forma([[-0.130, 0.006], [-0.070, -0.014], [0.060, -0.014], [0.140, 0.008], [0.060, 0.018], [-0.070, 0.016]], hx, hy, rot);
    dipingi(g, tesa, t.cappello, st, 0.5);
    if (!st.sagoma) { g.save(); g.translate(hx, hy); g.rotate(rot); g.fillStyle = t.nastro.mezzo; g.fillRect(-0.059, -0.030, 0.122, 0.016); g.restore(); segno(g, st, [[hx - 0.058, hy - 0.030], [hx + 0.062, hy - 0.034]], 0.4, 0.6); }
  }
}

// ── di spalle ────────────────────────────────────────────────────────
function spalle(g: Ctx, P: Posa, o: OpzioniFigura, st: Stile) {
  const sc = o.scorcio ?? 0.12;
  const pr = (p: P3): P2 => ({ x: p.x, y: -(p.y + p.z * sc) });
  const A = pr(P.bacino), S = pr(P.centroSpalle), N = pr(P.collo), T = pr(P.testa);
  const an = P.anche.map(pr), gi = P.ginocchia.map(pr), ca = P.caviglie.map(pr), sp = P.spalle.map(pr), go = P.gomiti.map(pr), po = P.polsi.map(pr);
  const t = st.t, far = st.far, d = P.dondolo;

  const manica = (i: number, tt: Record<Materiale, Toni>) => {
    if (o.tanica && i === 0) tanicaSpalle(g, { x: po[0].x + 0.004, y: po[0].y + 0.014 }, 0.03 * d, st);
    dipingi(g, insieme(capsula(sp[i], 0.040, go[i], 0.032), capsula(go[i], 0.032, po[i], 0.025)), tt.cappotto, st, 0.7);
    dipingi(g, ellisse(po[i].x, po[i].y + 0.018, 0.021, 0.024), tt.pelle, st, 0.4);
  };
  // le gambe: prima quella più avanti (più lontana da chi guarda)
  const ordine = P.caviglie[0].z > P.caviglie[1].z ? [0, 1] : [1, 0];
  for (const i of ordine) {
    const tt = i === ordine[0] ? far : t;
    dipingi(g, insieme(capsula(an[i], 0.058, gi[i], 0.046), capsula(gi[i], 0.046, { x: ca[i].x, y: ca[i].y - 0.05 }, 0.037)), tt.pantaloni, st, 0.7);
    scarponeSpalle(g, ca[i], P.becc[i], sc, st, tt);
  }
  // le braccia che vanno avanti stanno dietro il busto
  for (const i of [1, 0]) if (P.polsi[i].z > P.centroSpalle.z + 0.01) manica(i, far);

  // lo spolverino da dietro: spalle, vita, falda con lo spacco che si apre sul passo
  const yOrlo = -(ORLO + P.bacino.z * sc), apre = 0.012 + 0.020 * Math.abs(P.caviglie[0].z - P.caviglie[1].z) / 0.3;
  const xs = A.x - 0.150 + 0.012 * d, xd = A.x + 0.150 + 0.012 * d;
  const corpo = forma([
    [S.x - 0.052, S.y - 0.050], [sp[1].x - 0.020, sp[1].y - 0.030], [sp[1].x - 0.034, sp[1].y + 0.060], [A.x - 0.104, A.y - 0.110], [A.x - 0.118, A.y - 0.010],
    [xs, yOrlo + 0.004, 1], [lerp(xs, A.x, 0.55), yOrlo + 0.016 + 0.006 * d], [A.x - apre, yOrlo + 0.008, 1], [A.x + 0.002 * d, yOrlo - 0.130, 1], [A.x + apre, yOrlo + 0.008, 1],
    [lerp(xd, A.x, 0.55), yOrlo + 0.016 - 0.006 * d], [xd, yOrlo + 0.004, 1],
    [A.x + 0.118, A.y - 0.010], [A.x + 0.104, A.y - 0.110], [sp[0].x + 0.034, sp[0].y + 0.060], [sp[0].x + 0.020, sp[0].y - 0.030], [S.x + 0.052, S.y - 0.050],
  ]);
  dipingi(g, corpo, t.cappotto, st, 1.6);
  tinta(g, corpo, forma([[xs - 0.02, yOrlo - 0.036], [A.x, yOrlo - 0.024], [xd + 0.02, yOrlo - 0.036], [xd + 0.02, yOrlo + 0.04], [xs - 0.02, yOrlo + 0.04]]), t.cappotto.luce, st, 0.26);
  segno(g, st, [[A.x, A.y - 0.085], [A.x + 0.003 * d, lerp(A.y, yOrlo, 0.5)], [A.x + 0.002 * d, yOrlo - 0.130]], 0.6, 0.8);                  // la cucitura in mezzo
  segno(g, st, [[A.x - 0.070, A.y - 0.060], [lerp(A.x - 0.08, xs + 0.05, 0.5) + 0.008 * d, lerp(A.y, yOrlo, 0.5)], [xs + 0.050, yOrlo]], 0.45, 0.55);
  segno(g, st, [[A.x + 0.070, A.y - 0.060], [lerp(A.x + 0.08, xd - 0.05, 0.5) + 0.008 * d, lerp(A.y, yOrlo, 0.5)], [xd - 0.050, yOrlo]], 0.45, 0.55);
  // la martingala coi due bottoni
  const cinta = forma([[A.x - 0.070, A.y - 0.118, 1], [A.x + 0.070, A.y - 0.118, 1], [A.x + 0.070, A.y - 0.094, 1], [A.x - 0.070, A.y - 0.094, 1]]);
  dipingi(g, cinta, t.cappotto, st, 0.3);
  if (!st.sagoma) for (const s of [-1, 1]) { g.fillStyle = st.china; g.beginPath(); g.arc(A.x + s * 0.052, A.y - 0.106, 0.006, 0, TAU); g.fill(); }

  // le braccia che restano indietro stanno davanti al busto (verso chi guarda)
  for (const i of [1, 0]) if (P.polsi[i].z <= P.centroSpalle.z + 0.01) manica(i, t);

  // la mantellina
  const yM = S.y + 0.150;
  const mant = forma([
    [S.x - 0.050, S.y - 0.052], [sp[1].x - 0.036, sp[1].y - 0.028], [sp[1].x - 0.052, sp[1].y + 0.100 + 0.004 * d, 1], [lerp(sp[1].x, S.x, 0.5), yM + 0.004], [S.x + 0.004 * d, yM + 0.014],
    [lerp(sp[0].x, S.x, 0.5), yM + 0.004], [sp[0].x + 0.052, sp[0].y + 0.100 - 0.004 * d, 1], [sp[0].x + 0.036, sp[0].y - 0.028], [S.x + 0.050, S.y - 0.052],
  ]);
  dipingi(g, mant, t.mantella, st, 1.4);
  segno(g, st, [[S.x - 0.070, S.y - 0.010], [S.x - 0.084, S.y + 0.060], [S.x - 0.076, yM - 0.006]], 0.45, 0.5);
  segno(g, st, [[S.x + 0.070, S.y - 0.010], [S.x + 0.084, S.y + 0.060], [S.x + 0.076, yM - 0.006]], 0.45, 0.5);

  // la coperta arrotolata di traverso sulla schiena, con la cinghia che la tiene
  if (o.coperta) {
    if (!st.sagoma) { g.save(); g.clip(insieme(corpo, mant)); g.strokeStyle = t.cinghia.mezzo; g.lineWidth = 0.022; g.lineCap = "round"; g.beginPath(); g.moveTo(sp[0].x - 0.030, sp[0].y - 0.040); g.lineTo(A.x - 0.100, A.y - 0.070); g.stroke(); g.restore();
      segno(g, st, [[sp[0].x - 0.020, sp[0].y - 0.040], [A.x - 0.090, A.y - 0.074]], 0.4, 0.55); }
    const cx = S.x + 0.004, cy = S.y + 0.105, rot = -0.30;
    const rotolo = forma([[-0.150, -0.040], [-0.172, 0.000], [-0.150, 0.040], [0.150, 0.040], [0.172, 0.000], [0.150, -0.040]], cx, cy, rot);
    dipingi(g, rotolo, t.coperta, st, 0.9);
    for (const k of [-0.085, 0.085]) tinta(g, rotolo, forma([[k - 0.012, -0.05, 1], [k + 0.012, -0.05, 1], [k + 0.012, 0.05, 1], [k - 0.012, 0.05, 1]], cx, cy, rot), t.cinghia.mezzo, st);
    tinta(g, rotolo, forma([[-0.030, -0.05, 1], [0.030, -0.05, 1], [0.030, 0.05, 1], [-0.030, 0.05, 1]], cx, cy, rot), t.riga.mezzo, st, 0.6);
    const cr = Math.cos(rot), sr = Math.sin(rot), q = (x: number, y: number): [number, number] => [cx + x * cr - y * sr, cy + x * sr + y * cr];
    segno(g, st, [q(-0.150, -0.014), q(0.0, -0.020), q(0.150, -0.014)], 0.4, 0.5);
    segno(g, st, [q(-0.150, 0.014), q(0.0, 0.008), q(0.150, 0.014)], 0.4, 0.4);
  }

  // il collo, la nuca, il bavero alzato, il cappello
  dipingi(g, capsula({ x: N.x, y: N.y + 0.020 }, 0.036, { x: T.x, y: T.y + 0.030 }, 0.032), t.pelle, st, 0.5);
  for (const s of [-1, 1]) dipingi(g, ellisse(T.x + s * 0.056, T.y + 0.006, 0.010, 0.018), t.pelle, st, 0.2);
  dipingi(g, ellisse(T.x, T.y, 0.056, 0.064), t.capelli, st, 0.7);
  const bavero = forma([[N.x - 0.070, N.y + 0.040], [N.x - 0.060, N.y - 0.024, 1], [N.x, N.y - 0.006], [N.x + 0.060, N.y - 0.024, 1], [N.x + 0.070, N.y + 0.040], [N.x, N.y + 0.058]]);
  dipingi(g, bavero, o.fratello ? t.cappotto : t.mantella, st, 0.6);
  segno(g, st, [[N.x, N.y - 0.004], [N.x + 0.001, N.y + 0.050]], 0.45, 0.6);
  if (o.cappello) {
    const hy = T.y - 0.036, ry = 0.020 + sc * 0.07;
    dipingi(g, ellisse(T.x, hy, 0.128, ry), t.cappello, st, 0.5);
    dipingi(g, forma([[-0.060, 0.004, 1], [-0.058, -0.064], [-0.024, -0.086], [0.0, -0.074], [0.024, -0.086], [0.058, -0.064], [0.060, 0.004, 1], [0.0, 0.012]], T.x, hy), t.cappello, st, 0.8);
    if (!st.sagoma) { g.save(); g.clip(forma([[-0.060, 0.004, 1], [-0.058, -0.064], [-0.024, -0.086], [0.0, -0.074], [0.024, -0.086], [0.058, -0.064], [0.060, 0.004, 1], [0.0, 0.012]], T.x, hy)); g.fillStyle = t.nastro.mezzo; g.fillRect(T.x - 0.07, hy - 0.022, 0.14, 0.016); g.restore(); }
    segno(g, st, [[T.x - 0.002, hy - 0.076], [T.x, hy - 0.040]], 0.45, 0.5);                                   // la piega della cupola
  }
}

// ── l'ingresso ───────────────────────────────────────────────────────
/** Disegna la figura coi piedi in (x, y), alta `alto` pixel, alla fase del passo `fase` (a fase 0 tocca terra il tallone destro). */
export function disegnaFigura(ctx: CanvasRenderingContext2D, x: number, y: number, alto: number, fase: number, o: OpzioniFigura) {
  const v = o.vista === "profilo" ? (o.verso ?? 1) : 1;
  const P = posa(fase, clamp(o.ampiezza ?? 1, 0.2, 1.2), clamp(o.fermo ?? 0), o.respiro ?? 0, { tanica: !!o.tanica && !o.fratello, fucile: !!o.fratello });
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(alto * v, alto);
  const st = stileDi(o, alto);
  if (o.vista === "profilo") profilo(ctx, P, o, st); else spalle(ctx, P, o, st);
  ctx.restore();
}

let telaOmbra: HTMLCanvasElement | null = null;
/**
 * L'ombra a terra: la sagoma della figura, coricata (`inclinazione`: di quanto pende di lato; `schiacciamento`: quanto è lunga,
 * negativa se cade verso chi guarda). Si dipinge piena su una tela a parte e si posa con la sua trasparenza: dipinta a pezzi
 * trasparenti, dove due parti si coprono l'ombra verrebbe più scura.
 */
export function disegnaOmbraFigura(ctx: CanvasRenderingContext2D, x: number, y: number, alto: number, fase: number, o: OpzioniFigura,
  inclinazione: number, schiacciamento: number, colore: string, alfa: number) {
  if (typeof document === "undefined" || alfa <= 0.003) return;
  const q = Math.min(1, 320 / alto);                       // l'ombra è morbida: basta una tela più piccola della figura
  const w = Math.ceil(alto * q * 1.5), h = Math.ceil(alto * q * 1.3);
  telaOmbra ??= document.createElement("canvas");
  if (telaOmbra.width < w || telaOmbra.height < h) { telaOmbra.width = Math.max(telaOmbra.width, w); telaOmbra.height = Math.max(telaOmbra.height, h); }
  const g = telaOmbra.getContext("2d");
  if (!g) return;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, telaOmbra.width, telaOmbra.height);
  disegnaFigura(g, w / 2, h - alto * q * 0.09, alto * q, fase, { ...o, sagoma: colore });
  ctx.save();
  ctx.translate(x, y);
  ctx.transform(1, 0, inclinazione, schiacciamento, 0, 0);
  ctx.globalAlpha *= alfa;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(telaOmbra, 0, 0, w, h, -w / 2 / q, -(h - alto * q * 0.09) / q, w / q, h / q);
  ctx.restore();
}
