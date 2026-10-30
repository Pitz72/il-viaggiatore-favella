// ====================================================================
//  La mappa: che cosa si vede sul foglio, dove sta ogni luogo e dove vanno i nomi.
// --------------------------------------------------------------------
//  Funzioni pure, come azioni.ts e trofei.ts: niente React, niente disco,
//  nessun import di runtime (solo tipi). Il collaudo (collaudo/mappa.py,
//  attraverso app/scripts/foglio-node.mjs) prova questa logica, non una sua copia.
//
//  La carta intera la dà il ponte (Carta: il posto di ciascun luogo su una
//  griglia, nord in alto, est a destra, e le strade). Sul foglio ci sono:
//   · le TAPPE del viaggio, fin dal primo giorno: le sette zone e Acquamorta,
//     ciascuna col suo nome nel suo posto. È una mappa della provincia: dice
//     dove si va, non come ci si arriva (le strade fra una tappa e l'altra non
//     ci sono: si fanno camminando);
//   · i luoghi in cui sei stato (e quello dove sei adesso);
//   · i luoghi che da lì si vedono, col loro nome, perché la plancia li nomina
//     già (la mappa non deve saperne meno dei pulsanti), ma non ci sei stato;
//  e le strade fra questi ultimi: battute se vanno fra due luoghi visitati, solo
//  accennate verso un luogo ancora da scoprire. Il resto resta bianco.
//
//  LA DISPOSIZIONE. I luoghi non stanno più sulla griglia: la griglia si piega
//  appena (colonne larghe nella piana e strette nei paesi, un'onda lenta, uno
//  scarto per luogo), ma ogni strada resta nel suo verso, entro 12 gradi dal
//  punto cardinale della sua uscita, e l'ordine da ovest a est e da nord a sud
//  non cambia mai. Le strade sono tracciati a mano, ciascuno nella sua classe
//  (la statale, la provinciale, le strade, le sterrate, le tracce sul fondo
//  dell'invaso, la mulattiera e i sentieri delle colline), e avanzano sempre
//  lungo il loro asse. I nomi hanno un lato fisso, scelto una volta sul foglio
//  pieno: da un'apertura all'altra non saltano. Tutto dipende solo dalla carta.
//
//  Il foglio è sempre tutta la carta, in unità che a misura piena sono pixel:
//  i nomi non cambiano misura strada facendo.
// ====================================================================
import type { Carta } from "../lib/favellaRuntime";

export type StatoLuogo = "qui" | "visto" | "noto";
export type Lato = "sopra" | "sotto" | "sopra-destra" | "sotto-destra" | "sopra-sinistra" | "sotto-sinistra" | "destra" | "sinistra";
/** Dove sta un nome rispetto al suo segno: il lato e quanto se ne scosta in più. */
export interface Posto { lato: Lato; scosta: number }
export type Classe = "statale" | "provinciale" | "strada" | "sterrata" | "traccia" | "mulattiera" | "sentiero";

/** Le tappe del viaggio che la mappa segna fin dall'inizio: una per zona, nel suo luogo centrale (pre-produzione/03-mappa.md,
 *  «un grappolo di luoghi con un centro»), e Acquamorta, dove il viaggio va a finire, sulla soglia. I nomi sono quelli
 *  delle zone (ZONE_THEME in data/viaggiatore.ts, prima del «·»); il collaudo controlla che non si discostino. */
export interface Tappa { zona: string; luogo: string; nome: string }
/** La «zona» di Acquamorta: non è una zona del gioco, è dove il viaggio va a finire. */
export const ACQUAMORTA = "acquamorta";
export const TAPPE: readonly Tappa[] = [
  { zona: "z1", luogo: "piazza", nome: "Acquaviva" },
  { zona: "z2", luogo: "masseria", nome: "La piana" },
  { zona: "z3", luogo: "conca", nome: "L'invaso morto" },
  { zona: "z4", luogo: "casello", nome: "La statale" },
  { zona: "z5", luogo: "piazzetta", nome: "Il paese" },
  { zona: "z6", luogo: "pianoro", nome: "Le colline" },
  { zona: "z7", luogo: "guado", nome: "Il guado" },
  { zona: ACQUAMORTA, luogo: "soglia", nome: "Acquamorta" },
];
/** I nomi delle tappe nella lingua dei testi: in inglese li dà Mappa.tsx (per zona), e la disposizione e il foglio li
 *  misurano e li scrivono così; null, quelli italiani qui sopra. */
let nomiTappe: Readonly<Record<string, string>> | null = null;
export function nomiDelleTappe(n: Readonly<Record<string, string>> | null) { nomiTappe = n; }
const nomeTappa = (t: Tappa) => nomiTappe?.[t.zona] ?? t.nome;

export interface LuogoSulFoglio {
  id: string;
  nome: string;
  /** il posto in unità del foglio (il centro del segno) */
  cx: number;
  cy: number;
  stato: StatoLuogo;
  /** da che parte del segno sta il nome, e quanto se ne scosta */
  lato: Lato;
  scosta: number;
  /** il raggio del segno: più grande dove c'è una tappa, e dove sei */
  raggio: number;
  /** il luogo ha lo stesso nome della sua tappa («Il guado»): il nome si scrive una volta, sulla tappa */
  nomeNascosto: boolean;
}
export interface TappaSulFoglio {
  /** il luogo centrale della tappa (l'id del motore) */
  id: string;
  zona: string;
  nome: string;
  cx: number;
  cy: number;
  /** sei già nella zona (o, per Acquamorta, sulla soglia): la tappa è raggiunta */
  raggiunta: boolean;
  lato: Lato;
  scosta: number;
  /** l'anello tracciato a mano attorno al luogo centrale (un `d` di SVG) */
  anello: string;
  /** da che parte sta rispetto a dove sei, a parole («a ovest»); nulla se ci sei o se non sei da nessuna parte */
  verso: string | null;
}
export interface StradaSulFoglio {
  da: string;
  a: string;
  /** fra due luoghi visitati */
  battuta: boolean;
  /** accennata, e parte da dove sei: è una delle uscite di adesso */
  daQui: boolean;
  classe: Classe;
  /** il tracciato (un `d` di SVG), dal luogo col nome che viene prima in ordine alfabetico all'altro */
  d: string;
}
export interface Foglio {
  larghezza: number;
  altezza: number;
  tappe: TappaSulFoglio[];
  luoghi: LuogoSulFoglio[];
  strade: StradaSulFoglio[];
}

/** La cornice del foglio a misura piena, e il passo fra due luoghi vicini sulla griglia. `cornice` è la fascia del bordo
 *  dove non va niente. */
export const FOGLIO = { larghezza: 1092, altezza: 481, passoX: 76, passoY: 37.5, margineX: 52, margineY: 34, cornice: 7 } as const;
/** I raggi dei segni (un luogo, il luogo dove sei con le sue tacche, una tappa); la misura dei nomi (Lora 11, le tappe in
 *  maiuscoletto 10). La larghezza di una lettera è una stima, misurata sui caratteri del gioco e presa per eccesso (il
 *  corsivo e il grassetto di Lora sono i più larghi), per tenere i nomi lontani fra loro. */
export const RAGGIO = 4.5;
export const RAGGIO_QUI = 9.5;
export const RAGGIO_TAPPA = 11;
export const CORPO_NOME = 11;
export const CORPO_TAPPA = 10;
const LARGHEZZA_LETTERA = 6.1;
const LARGHEZZA_LETTERA_TAPPA = 8.4;
const ALTEZZA_NOME = 13;

/** La larghezza che occupa un nome (stima), e quella del nome di una tappa. */
export const larghezzaNome = (nome: string) => Math.ceil(nome.length * LARGHEZZA_LETTERA);
export const larghezzaTappa = (nome: string) => Math.ceil(nome.length * LARGHEZZA_LETTERA_TAPPA);

/** Il cartiglio («Carta fisica della provincia») e la rosa dei venti, sul mare: gli angoli del foglio dove non va niente
 *  della mano. */
export const CARTIGLIO = { x0: 686, y0: 18, x1: 886, y1: 80 } as const;
export const ROSA = { cx: 1030, cy: 136, r: 24 } as const;
export const RISERVATI: readonly Scatola[] = [
  { x0: CARTIGLIO.x0, y0: CARTIGLIO.y0, x1: CARTIGLIO.x1, y1: CARTIGLIO.y1 },
  { x0: ROSA.cx - 36, y0: ROSA.cy - 48, x1: ROSA.cx + 36, y1: ROSA.cy + 36 },
];

// ── il caso, deterministico ──────────────────────────────────────────────────
/** Un numero stabile in [0, 1) da una parola (FNV-1a con un rimescolo finale): niente Math.random, la carta è sempre quella. */
export function caso(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const segno = (s: string) => caso(s) * 2 - 1;
/** Rumore a una dimensione, liscio, in [-1, 1]: la mano che trema lungo una strada. */
const rumore = (t: number, seme: string) => {
  const i = Math.floor(t), f = t - i, u = f * f * (3 - 2 * f);
  return segno(`${seme}·${i}`) * (1 - u) + segno(`${seme}·${i + 1}`) * u;
};
const r1 = (v: number) => Math.round(v * 10) / 10;

// ── la disposizione ──────────────────────────────────────────────────────────
export interface Punto { cx: number; cy: number }
interface Nodo { id: string; x: number; y: number }

/** Quanto si piega la griglia. `ritmo`: la larghezza delle colonne secondo la zona delle strade che le attraversano (la piana
 *  è larga, i paesi stretti); due onde lente (una fa ondeggiare la fascia est-ovest, l'altra la colonna nord-sud); uno
 *  scarto per luogo. Le proiezioni tengono ogni strada entro `angoloMeta` dal suo verso (il collaudo pretende
 *  `angoloMax`) e i vicini della stessa riga o colonna ad almeno una frazione del passo. */
export const IRREGOLARE = {
  ritmo: { z1: 0.9, z2: 1.12, z3: 1.04, z4: 1.0, z5: 0.92, z6: 0.97, z7: 0.92 } as Readonly<Record<string, number>>,
  ondaY: { ampiezza: 10, periodo: 540, fase: 0.9 },
  ondaX: { ampiezza: 4, periodo: 280, fase: 2.0 },
  scossa: { x: 9, y: 5 },
  angoloMeta: 11.5, angoloMax: 12,
  lungoMinX: 0.8, lungoMinY: 1.0,
  giri: 60, ritiri: 6,
} as const;

/** Il verso cardinale di una strada sulla griglia, da a verso b: (1, 0) è est, (0, -1) è nord. */
const versoDi = (a: Nodo, b: Nodo): [number, number] => [Math.sign(b.x - a.x), Math.sign(b.y - a.y)];

/** Dove sta ogni luogo, con `k` (fra 0 e 1, per luogo) che dice quanto lo si lascia scostare dalla griglia piegata. */
function disponi(nodi: Nodo[], strade: [string, string][], zonaDi: ((id: string) => string | undefined) | undefined, k: Map<string, number>): Map<string, Punto> {
  const P = IRREGOLARE;
  const g = new Map(nodi.map((n) => [n.id, n]));
  const maxX = Math.max(0, ...nodi.map((n) => n.x)), maxY = Math.max(0, ...nodi.map((n) => n.y));
  // le colonne: lo spazio fra la colonna i e la i+1 secondo il ritmo delle zone che le strade est-ovest attraversano
  const somme = new Array<number>(maxX).fill(0), conte = new Array<number>(maxX).fill(0);
  for (const [a, b] of strade) {
    const A = g.get(a), B = g.get(b);
    if (!A || !B || A.y !== B.y) continue;
    const r = ((P.ritmo[zonaDi?.(a) ?? ""] ?? 1) + (P.ritmo[zonaDi?.(b) ?? ""] ?? 1)) / 2;
    for (let i = Math.min(A.x, B.x); i < Math.max(A.x, B.x); i++) { somme[i] += r; conte[i]++; }
  }
  const pesi = somme.map((s, i) => (conte[i] ? s / conte[i] : 1));
  const totale = pesi.reduce((s, p) => s + p, 0) || 1;
  const X: number[] = [FOGLIO.margineX];
  for (let i = 0; i < maxX; i++) X.push(X[i] + (pesi[i] * maxX / totale) * FOGLIO.passoX);
  const p = new Map<string, Punto>();
  for (const n of nodi) {
    const kn = k.get(n.id) ?? 1;
    const bx = X[n.x], by = FOGLIO.margineY + n.y * FOGLIO.passoY;
    p.set(n.id, {
      cx: bx + kn * (P.ondaX.ampiezza * Math.sin((2 * Math.PI * by) / P.ondaX.periodo + P.ondaX.fase) + P.scossa.x * segno(n.id + "·x")),
      cy: by + kn * (P.ondaY.ampiezza * Math.sin((2 * Math.PI * bx) / P.ondaY.periodo + P.ondaY.fase) + P.scossa.y * segno(n.id + "·y")),
    });
  }
  // le proiezioni: ogni strada nel suo verso, i vicini lontani abbastanza, tutto dentro la cornice della griglia
  const ss = strade.filter(([a, b]) => g.has(a) && g.has(b)).map(([a, b]) => (a < b ? [a, b] : [b, a]) as [string, string])
    .sort((s, t) => (s[0] + "|" + s[1]).localeCompare(t[0] + "|" + t[1]));
  const tanMeta = Math.tan((P.angoloMeta * Math.PI) / 180);
  const righe = new Map<number, Nodo[]>(), colonne = new Map<number, Nodo[]>();
  for (const n of nodi) { (righe.get(n.y) ?? righe.set(n.y, []).get(n.y)!).push(n); (colonne.get(n.x) ?? colonne.set(n.x, []).get(n.x)!).push(n); }
  const accanto: [string, string, 0 | 1, number][] = [];
  for (const r of righe.values()) { r.sort((a, b) => a.x - b.x); for (let i = 1; i < r.length; i++) accanto.push([r[i - 1].id, r[i].id, 0, (r[i].x - r[i - 1].x) * FOGLIO.passoX * P.lungoMinX]); }
  for (const c of colonne.values()) { c.sort((a, b) => a.y - b.y); for (let i = 1; i < c.length; i++) accanto.push([c[i - 1].id, c[i].id, 1, (c[i].y - c[i - 1].y) * FOGLIO.passoY * P.lungoMinY]); }
  const x0 = FOGLIO.margineX, x1 = X[maxX], y0 = FOGLIO.margineY, y1 = FOGLIO.margineY + maxY * FOGLIO.passoY;
  for (let giro = 0; giro < P.giri; giro++) {
    for (const [a, b] of ss) {
      const [ux, uy] = versoDi(g.get(a)!, g.get(b)!), nx = -uy, ny = ux;
      const A = p.get(a)!, B = p.get(b)!;
      const dx = B.cx - A.cx, dy = B.cy - A.cy;
      const lungo = dx * ux + dy * uy, largo = dx * nx + dy * ny;
      const lim = tanMeta * Math.max(lungo, 0);
      if (Math.abs(largo) > lim) {
        const c = ((Math.abs(largo) - lim) / 2) * Math.sign(largo);
        A.cx += c * nx; A.cy += c * ny; B.cx -= c * nx; B.cy -= c * ny;
      }
    }
    for (const [a, b, asse, min] of accanto) {
      const A = p.get(a)!, B = p.get(b)!;
      const d = asse === 0 ? B.cx - A.cx : B.cy - A.cy;
      if (d < min) { const c = (min - d) / 2; if (asse === 0) { A.cx -= c; B.cx += c; } else { A.cy -= c; B.cy += c; } }
    }
    for (const q of p.values()) { q.cx = Math.min(x1, Math.max(x0, q.cx)); q.cy = Math.min(y1, Math.max(y0, q.cy)); }
  }
  for (const q of p.values()) { q.cx = r1(q.cx); q.cy = r1(q.cy); }
  return p;
}

/** Un difetto della disposizione, con gli id veri dei luoghi coinvolti (non si cercano nel testo: «piazza» sta in «piazzetta»).
 *  Lieve: un nome che, per non toccare altri nomi, sta sopra una strada; si prova a evitarlo, ma da solo non riporta la carta
 *  alla griglia. */
export interface Stortura { testo: string; ids: string[]; lieve?: boolean }

/** Le verifiche della disposizione: vuota se ogni strada va dove dice, se i vicini restano lontani e se l'ordine regge. */
function stortureDi(nodi: Nodo[], strade: [string, string][], p: Map<string, Punto>): Stortura[] {
  const out: Stortura[] = [];
  const g = new Map(nodi.map((n) => [n.id, n]));
  for (const [a, b] of strade) {
    if (!g.has(a) || !g.has(b)) continue;
    const [ux, uy] = versoDi(g.get(a)!, g.get(b)!);
    const A = p.get(a)!, B = p.get(b)!;
    const dx = B.cx - A.cx, dy = B.cy - A.cy;
    const lungo = dx * ux + dy * uy, largo = -dx * uy + dy * ux;
    const ang = (Math.atan2(Math.abs(largo), lungo) * 180) / Math.PI;
    const passo = (ux ? FOGLIO.passoX * IRREGOLARE.lungoMinX : FOGLIO.passoY * IRREGOLARE.lungoMinY) * (Math.abs(g.get(b)!.x - g.get(a)!.x) + Math.abs(g.get(b)!.y - g.get(a)!.y));
    if (ang > IRREGOLARE.angoloMax) out.push({ testo: `la strada ${a}–${b} piega di ${ang.toFixed(1)}°`, ids: [a, b] });
    if (lungo < passo - 1) out.push({ testo: `la strada ${a}–${b} è corta (${lungo.toFixed(1)})`, ids: [a, b] });
  }
  for (const s of nodi) for (const t of nodi) {
    if (s.x < t.x && !(p.get(s.id)!.cx < p.get(t.id)!.cx)) out.push({ testo: `${s.id} non sta più a ovest di ${t.id}`, ids: [s.id, t.id] });
    if (s.y < t.y && !(p.get(s.id)!.cy < p.get(t.id)!.cy)) out.push({ testo: `${s.id} non sta più a nord di ${t.id}`, ids: [s.id, t.id] });
  }
  return out;
}

// ── i tracciati ──────────────────────────────────────────────────────────────
/** La classe di ogni strada, dai testi dei .fav («Un tratto di strada provinciale», «La statale ridiscende», «La mulattiera
 *  si fa ripida»…); le altre prendono quella della loro zona, e quelle fra due zone sono sterrate. Chiavi «a|b» in ordine
 *  alfabetico. Un id che sparisce non rompe niente: ogni strada ha comunque una classe. */
export const CLASSE_ZONA: Readonly<Record<string, Classe>> = { z1: "strada", z2: "sterrata", z3: "traccia", z4: "statale", z5: "strada", z6: "mulattiera", z7: "strada" };
export const CLASSE_STRADA: Readonly<Record<string, Classe>> = {
  "margine|tratto": "provinciale", "masseria|tratto": "provinciale",
  "casello|piazzola": "strada", "area di servizio|casello": "strada", "area di servizio|sottopasso": "strada", "discesa|sottopasso": "strada",
  "discesa|porta": "statale",
  "casotto|diga": "sterrata", "condotta|diga": "sterrata", "condotta|rampa": "sterrata", "conca|sterrata": "sterrata",
  "osteria|salita": "mulattiera", "salita|sentiero": "mulattiera",
  "grotta|pianoro": "sentiero", "pianoro|sorgente": "sentiero", "cappella|sentiero": "sentiero", "guado|valico": "sentiero", "guado|strada": "sentiero",
};
const chiaveDi = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);
export function classeStrada(a: string, b: string, zonaDi?: (id: string) => string | undefined): Classe {
  const fissa = CLASSE_STRADA[chiaveDi(a, b)];
  if (fissa) return fissa;
  const za = zonaDi?.(a), zb = zonaDi?.(b);
  return (za && za === zb && CLASSE_ZONA[za]) || "sterrata";
}

/** La forma di ogni classe: due ondulazioni a pendenza nulla ai capi (`m1`, `m2`, frazioni della lunghezza) e il tremito
 *  della mano (unità del foglio, lento). La statale è quasi dritta, i sentieri vanno dove possono. */
const FORMA: Readonly<Record<Classe, { m1: number; m2: number; tremito: number }>> = {
  statale: { m1: 0.015, m2: 0, tremito: 0 },
  provinciale: { m1: 0.03, m2: 0.008, tremito: 0 },
  strada: { m1: 0.04, m2: 0.012, tremito: 0 },
  sterrata: { m1: 0.05, m2: 0.016, tremito: 0.6 },
  traccia: { m1: 0.05, m2: 0.02, tremito: 0.7 },
  mulattiera: { m1: 0.045, m2: 0.018, tremito: 0.7 },
  sentiero: { m1: 0.055, m2: 0.02, tremito: 0.8 },
};

/** I campioni di un tracciato da A a B: lo scarto è perpendicolare all'asse cardinale della strada, non alla corda, così
 *  lungo l'asse la strada avanza sempre. `scala` (fra 0 e 1) è quanto le si lascia di curva: a 0 è la corda. */
function campioni(A: Punto, B: Punto, u: [number, number], chiave: string, classe: Classe, scala: number): Punto[] {
  const [ux, uy] = u, nx = -uy, ny = ux;
  const L = Math.hypot(B.cx - A.cx, B.cy - A.cy);
  const f = FORMA[classe];
  const h1 = segno(chiave + "·1"), h2 = segno(chiave + "·2");
  const n = Math.max(12, Math.ceil(L / 2.5));
  const out: Punto[] = [];
  for (let i = 0; i <= n; i++) {
    const s = i / n, sp = Math.sin(Math.PI * s);
    const o = scala * (L * (f.m1 * h1 * sp * sp + f.m2 * h2 * sp * Math.sin(2 * Math.PI * s)) + f.tremito * rumore((s * L) / 9, chiave) * sp);
    out.push({ cx: A.cx + s * (B.cx - A.cx) + o * nx, cy: A.cy + s * (B.cy - A.cy) + o * ny });
  }
  return out;
}

/** Una curva liscia (Catmull-Rom in Bézier) per i campioni dati, come `d` di SVG. */
export function pathDa(p: Punto[], chiusa = false): string {
  let d = `M${r1(p[0].cx)} ${r1(p[0].cy)}`;
  const n = p.length, a = (i: number) => p[chiusa ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
  for (let i = 0; i < (chiusa ? n : n - 1); i++) {
    const p0 = a(i - 1), p1 = a(i), p2 = a(i + 1), p3 = a(i + 2);
    d += `C${r1(p1.cx + (p2.cx - p0.cx) / 6)} ${r1(p1.cy + (p2.cy - p0.cy) / 6)} ${r1(p2.cx - (p3.cx - p1.cx) / 6)} ${r1(p2.cy - (p3.cy - p1.cy) / 6)} ${r1(p2.cx)} ${r1(p2.cy)}`;
  }
  return d;
}

/** L'anello di una tappa, tracciato a mano: un giro e un decimo, il raggio che respira appena, l'inizio dove capita. */
export function anello(cx: number, cy: number, R: number, seme: string): string {
  const fi = caso(seme + "·φ") * 6.283, psi = caso(seme + "·ψ") * 6.283, t0 = caso(seme + "·θ") * 6.283;
  const pts: Punto[] = [];
  for (let i = 0; i <= 44; i++) {
    const t = t0 + (i / 44) * 1.1 * 2 * Math.PI;
    const r = R * (1 + 0.035 * Math.sin(2 * t + fi) + 0.02 * Math.sin(3 * t + psi));
    pts.push({ cx: cx + r * Math.cos(t), cy: cy + r * Math.sin(t) });
  }
  return pathDa(pts);
}

export interface Tracciato { a: string; b: string; classe: Classe; campioni: Punto[]; d: string; scala: number }

/** I difetti di un tracciato da solo: l'uscita da un capo o l'arrivo all'altro che piega troppo (misurati appena fuori dal
 *  segno, dove l'occhio li legge), lo scarto dalla corda, un luogo che non è suo capo troppo vicino. */
function difettiDi(t: Tracciato, u: [number, number], raggioDi: (id: string) => number, posti: Map<string, Punto>): string[] {
  const out: string[] = [];
  const c = t.campioni, A = c[0], B = c[c.length - 1];
  const fascia = (capo: Punto, r: number, verso: [number, number]) => {
    const dentro = c.filter((q) => { const d = Math.hypot(q.cx - capo.cx, q.cy - capo.cy); return d >= r && d <= r + 12; });
    if (dentro.length < 2) return 0;
    const lontano = dentro.reduce((m, q) => (Math.hypot(q.cx - capo.cx, q.cy - capo.cy) > Math.hypot(m.cx - capo.cx, m.cy - capo.cy) ? q : m));
    const vicino = dentro.reduce((m, q) => (Math.hypot(q.cx - capo.cx, q.cy - capo.cy) < Math.hypot(m.cx - capo.cx, m.cy - capo.cy) ? q : m));
    const dx = lontano.cx - vicino.cx, dy = lontano.cy - vicino.cy;
    return (Math.atan2(Math.abs(dx * -verso[1] + dy * verso[0]), dx * verso[0] + dy * verso[1]) * 180) / Math.PI;
  };
  const uscita = fascia(A, raggioDi(t.a), u), arrivo = fascia(B, raggioDi(t.b), [-u[0], -u[1]]);
  if (uscita > 20 || arrivo > 20) out.push(`piega di ${Math.max(uscita, arrivo).toFixed(1)}° all'uscita`);
  const L = Math.hypot(B.cx - A.cx, B.cy - A.cy), lx = (B.cx - A.cx) / L, ly = (B.cy - A.cy) / L;
  const scarto = Math.max(...c.map((q) => Math.abs((q.cx - A.cx) * -ly + (q.cy - A.cy) * lx)));
  if (scarto > Math.min(0.12 * L, 10)) out.push(`si scosta di ${scarto.toFixed(1)} dalla corda`);
  for (const [id, q] of posti) {
    if (id === t.a || id === t.b) continue;
    if (c.some((s) => Math.hypot(s.cx - q.cx, s.cy - q.cy) < 10)) out.push(`passa a meno di 10 da ${id}`);
  }
  return out;
}

const scatolaDi = (c: Punto[]) => ({ x0: Math.min(...c.map((q) => q.cx)), x1: Math.max(...c.map((q) => q.cx)), y0: Math.min(...c.map((q) => q.cy)), y1: Math.max(...c.map((q) => q.cy)) });
const siTaglianoSegmenti = (p: Punto, q: Punto, r: Punto, s: Punto) => {
  const o = (a: Punto, b: Punto, c: Punto) => (b.cx - a.cx) * (c.cy - a.cy) - (b.cy - a.cy) * (c.cx - a.cx);
  const d1 = o(r, s, p), d2 = o(r, s, q), d3 = o(p, q, r), d4 = o(p, q, s);
  return d1 * d2 < 0 && d3 * d4 < 0;
};
/** Due tracciati si incrociano (lontano dal capo che hanno in comune, se ne hanno uno). */
function siIncrociano(t: Tracciato, v: Tracciato): boolean {
  const bt = scatolaDi(t.campioni), bv = scatolaDi(v.campioni);
  if (bt.x0 > bv.x1 || bv.x0 > bt.x1 || bt.y0 > bv.y1 || bv.y0 > bt.y1) return false;
  const comune = [t.a, t.b].find((id) => id === v.a || id === v.b);
  const capo = comune ? (comune === t.a ? t.campioni[0] : t.campioni[t.campioni.length - 1]) : null;
  const lontano = (q: Punto) => !capo || Math.hypot(q.cx - capo.cx, q.cy - capo.cy) > 14;
  for (let i = 0; i < t.campioni.length - 1; i++) {
    const p = t.campioni[i], q = t.campioni[i + 1];
    if (!lontano(p) || !lontano(q)) continue;
    for (let j = 0; j < v.campioni.length - 1; j++) {
      const r = v.campioni[j], s = v.campioni[j + 1];
      if (lontano(r) && lontano(s) && siTaglianoSegmenti(p, q, r, s)) return true;
    }
  }
  return false;
}

/** I tracciati di tutte le strade, ciascuno col suo ritiro: se un tracciato ha un difetto, o ne incrocia un altro, la sua
 *  curva si dimezza (tre volte al massimo) e poi resta la corda. Ciò che non si aggiusta così diventa una stortura. */
function tracciatiDi(nodi: Nodo[], strade: [string, string][], posti: Map<string, Punto>, zonaDi: ((id: string) => string | undefined) | undefined,
  raggioDi: (id: string) => number): { tracciati: Map<string, Tracciato>; storture: Stortura[] } {
  const g = new Map(nodi.map((n) => [n.id, n]));
  const ss = strade.filter(([a, b]) => g.has(a) && g.has(b)).map(([a, b]) => (a < b ? [a, b] : [b, a]) as [string, string])
    .sort((s, t) => (s[0] + "|" + s[1]).localeCompare(t[0] + "|" + t[1]));
  const fai = (a: string, b: string, scala: number): Tracciato => {
    const classe = classeStrada(a, b, zonaDi), chiave = `${a}|${b}`;
    const c = campioni(posti.get(a)!, posti.get(b)!, versoDi(g.get(a)!, g.get(b)!), chiave, classe, scala);
    return { a, b, classe, campioni: c, d: pathDa(c), scala };
  };
  const tracciati = new Map<string, Tracciato>();
  const storture: Stortura[] = [];
  for (const [a, b] of ss) {
    let t = fai(a, b, 1);
    for (let i = 0; i < 4 && difettiDi(t, versoDi(g.get(a)!, g.get(b)!), raggioDi, posti).length; i++) t = fai(a, b, i === 3 ? 0 : t.scala / 2);
    tracciati.set(`${a}|${b}`, t);
  }
  for (let giro = 0; giro < 4; giro++) {
    let cambiato = false;
    const tutti = [...tracciati.values()];
    for (let i = 0; i < tutti.length; i++) for (let j = i + 1; j < tutti.length; j++) {
      const t = tracciati.get(`${tutti[i].a}|${tutti[i].b}`)!, v = tracciati.get(`${tutti[j].a}|${tutti[j].b}`)!;
      if ((t.scala || v.scala) && siIncrociano(t, v)) {
        for (const w of [t, v]) if (w.scala) { tracciati.set(`${w.a}|${w.b}`, fai(w.a, w.b, giro === 3 ? 0 : w.scala / 2)); cambiato = true; }
      }
    }
    if (!cambiato) break;
  }
  const tutti = [...tracciati.values()];
  for (const t of tutti) {
    for (const d of difettiDi(t, versoDi(g.get(t.a)!, g.get(t.b)!), raggioDi, posti)) storture.push({ testo: `la strada ${t.a}–${t.b} ${d}`, ids: [t.a, t.b] });
  }
  for (let i = 0; i < tutti.length; i++) for (let j = i + 1; j < tutti.length; j++) {
    if (siIncrociano(tutti[i], tutti[j])) storture.push({ testo: `la strada ${tutti[i].a}–${tutti[i].b} incrocia ${tutti[j].a}–${tutti[j].b}`, ids: [tutti[i].a, tutti[i].b, tutti[j].a, tutti[j].b] });
  }
  return { tracciati, storture };
}

// ── i nomi ───────────────────────────────────────────────────────────────────
interface Scatola { x0: number; y0: number; x1: number; y1: number }
const LATI: readonly Lato[] = ["sopra", "sotto", "sopra-destra", "sotto-destra", "sopra-sinistra", "sotto-sinistra", "destra", "sinistra"];
/** I sedici posti possibili di un nome: gli otto lati, vicini al segno e poi un poco più in là. */
export const CANDIDATI: readonly Posto[] = [...LATI.map((lato) => ({ lato, scosta: 0 })), ...LATI.map((lato) => ({ lato, scosta: 5 }))];

/** Il riquadro di un nome attorno a un segno di raggio `r`, nel posto dato. */
const scatolaNome = (cx: number, cy: number, w: number, r: number, { lato, scosta }: Posto): Scatola => {
  const h = ALTEZZA_NOME, m = r + 3 + scosta, q = 0.72 * r + 2 + scosta;
  switch (lato) {
    case "sopra": return { x0: cx - w / 2, x1: cx + w / 2, y1: cy - m, y0: cy - m - h };
    case "sotto": return { x0: cx - w / 2, x1: cx + w / 2, y0: cy + m, y1: cy + m + h };
    case "destra": return { x0: cx + m, x1: cx + m + w, y0: cy - h / 2, y1: cy + h / 2 };
    case "sinistra": return { x0: cx - m - w, x1: cx - m, y0: cy - h / 2, y1: cy + h / 2 };
    case "sopra-destra": return { x0: cx + q, x1: cx + q + w, y1: cy - q, y0: cy - q - h };
    case "sopra-sinistra": return { x0: cx - q - w, x1: cx - q, y1: cy - q, y0: cy - q - h };
    case "sotto-destra": return { x0: cx + q, x1: cx + q + w, y0: cy + q, y1: cy + q + h };
    case "sotto-sinistra": return { x0: cx - q - w, x1: cx - q, y0: cy + q, y1: cy + q + h };
  }
};
const siToccano = (a: Scatola, b: Scatola, aria = 2) =>
  a.x0 < b.x1 + aria && b.x0 < a.x1 + aria && a.y0 < b.y1 + aria && b.y0 < a.y1 + aria;
const scatolaSegno = (cx: number, cy: number, r: number): Scatola => ({ x0: cx - r, x1: cx + r, y0: cy - r, y1: cy + r });
const nelFoglio = (s: Scatola) => s.x0 >= FOGLIO.cornice && s.y0 >= FOGLIO.cornice && s.x1 <= FOGLIO.larghezza - FOGLIO.cornice && s.y1 <= FOGLIO.altezza - FOGLIO.cornice;
const tocca = (s: Scatola, punti: Punto[], aria: number) => punti.some((q) => q.cx > s.x0 - aria && q.cx < s.x1 + aria && q.cy > s.y0 - aria && q.cy < s.y1 + aria);

/** I campioni di tutte le strade, in secchi di una griglia di 24 unità: ogni scatola guarda solo i punti vicini. */
class Secchi {
  private m = new Map<string, Punto[]>();
  constructor(punti: Punto[]) { for (const q of punti) { const k = `${Math.floor(q.cx / 24)},${Math.floor(q.cy / 24)}`; (this.m.get(k) ?? this.m.set(k, []).get(k)!).push(q); } }
  vicini(s: Scatola): Punto[] {
    const out: Punto[] = [];
    for (let i = Math.floor((s.x0 - 2) / 24); i <= Math.floor((s.x1 + 2) / 24); i++)
      for (let j = Math.floor((s.y0 - 2) / 24); j <= Math.floor((s.y1 + 2) / 24); j++) out.push(...(this.m.get(`${i},${j}`) ?? []));
    return out;
  }
}
/** I punti di un tracciato ogni 3 unità al più (i nomi non devono cadere fra un campione e l'altro). */
const fitti = (c: Punto[]) => {
  const out: Punto[] = [];
  for (let i = 0; i < c.length - 1; i++) {
    const n = Math.max(1, Math.ceil(Math.hypot(c[i + 1].cx - c[i].cx, c[i + 1].cy - c[i].cy) / 3));
    for (let k = 0; k < n; k++) out.push({ cx: c[i].cx + ((c[i + 1].cx - c[i].cx) * k) / n, cy: c[i].cy + ((c[i + 1].cy - c[i].cy) * k) / n });
  }
  out.push(c[c.length - 1]);
  return out;
};

interface Lati { tappe: Map<string, Posto>; luoghi: Map<string, Posto>; qui: Map<string, Posto>; storture: Stortura[] }

/** I lati dei nomi, scelti una volta sul foglio pieno (tutti i luoghi, tutte le tappe), con i segni più grandi possibili (ogni
 *  luogo potrebbe essere quello dove sei) e le larghezze per eccesso: ogni foglio di una partita è una parte di questo, e
 *  nessun nome tocca niente in nessuno stato. I nomi delle tappe non guardano le strade (scansandole disegnerebbero il
 *  reticolo che non si è ancora percorso); quelli dei luoghi sì, tutte. Il nome del luogo dove sei ha un lato suo, scelto
 *  contro tutti gli altri nomi già fermi. */
function latiDi(nodi: Nodo[], nomi: Map<string, string>, posti: Map<string, Punto>, tracciati: Map<string, Tracciato>): Lati {
  const tappaDi = new Map(TAPPE.filter((t) => posti.has(t.luogo)).map((t) => [t.luogo, t]));
  const nascosto = (id: string) => { const t = tappaDi.get(id); return !!t && nomeTappa(t).toLowerCase() === (nomi.get(id) ?? "").toLowerCase(); };
  const raggio = (id: string) => (tappaDi.has(id) ? RAGGIO_TAPPA : RAGGIO_QUI);
  const segni = nodi.map((n) => ({ id: n.id, s: scatolaSegno(posti.get(n.id)!.cx, posti.get(n.id)!.cy, raggio(n.id)) }));
  const strade = new Secchi([...tracciati.values()].flatMap((t) => fitti(t.campioni)));
  // i nomi fermi hanno una chiave loro: il nome di una tappa e quello del suo luogo centrale si guardano a vicenda
  const fermi: { chiave: string; id: string; s: Scatola }[] = [];
  const storture: Stortura[] = [];
  const libero = (id: string, chiave: string, s: Scatola, conStrade: boolean, conNomi: boolean) =>
    nelFoglio(s) && !RISERVATI.some((r) => siToccano(r, s)) && !segni.some((g) => g.id !== id && siToccano(g.s, s, 0))
    && (!conStrade || !tocca(s, strade.vicini(s), 1)) && (!conNomi || !fermi.some((f) => f.chiave !== chiave && siToccano(f.s, s)));
  type Voce = { id: string; chiave: string; w: number; r: number; tappa: boolean };
  const piazza = (voci: Voce[], conStrade: boolean, dove: Map<string, Posto>, fissa: boolean) => {
    // prima chi ha meno posti liberi (contro i soli ostacoli fissi), poi nell'ordine di lettura
    const liberi = (v: Voce) => CANDIDATI.filter((c) => { const { cx, cy } = posti.get(v.id)!; return libero(v.id, v.chiave, scatolaNome(cx, cy, v.w, v.r, c), conStrade, false); }).length;
    const ordine = voci.map((v) => ({ v, n: liberi(v), p: posti.get(v.id)! })).sort((a, b) => a.n - b.n || a.p.cy - b.p.cy || a.p.cx - b.p.cx);
    for (const { v } of ordine) {
      const { cx, cy } = posti.get(v.id)!;
      const s = (c: Posto) => scatolaNome(cx, cy, v.w, v.r, c);
      let scelto = CANDIDATI.find((c) => libero(v.id, v.chiave, s(c), conStrade, true));
      if (!scelto && conStrade) scelto = CANDIDATI.find((c) => libero(v.id, v.chiave, s(c), false, true));
      if (!scelto) {
        scelto = CANDIDATI.find((c) => nelFoglio(s(c))) ?? CANDIDATI[0];
        const colpa = [v.id, ...fermi.filter((f) => siToccano(f.s, s(scelto!))).map((f) => f.id), ...segni.filter((g) => g.id !== v.id && siToccano(g.s, s(scelto!), 0)).map((g) => g.id)];
        storture.push({ testo: `il nome di ${v.id}${v.tappa ? " (tappa)" : ""} non trova posto`, ids: colpa });
      } else if (conStrade && tocca(s(scelto), strade.vicini(s(scelto)), 1)) {
        storture.push({ testo: `il nome di ${v.id} sta sopra una strada`, ids: [v.id], lieve: true });
      }
      dove.set(v.id, scelto);
      if (fissa) fermi.push({ chiave: v.chiave, id: v.id, s: s(scelto) });
    }
  };
  const tappe = new Map<string, Posto>(), luoghi = new Map<string, Posto>(), qui = new Map<string, Posto>();
  piazza([...tappaDi.values()].map((t) => ({ id: t.luogo, chiave: `tappa:${t.luogo}`, w: larghezzaTappa(nomeTappa(t)), r: RAGGIO_TAPPA, tappa: true })), false, tappe, true);
  const voci = nodi.filter((n) => !nascosto(n.id)).map((n) => ({ id: n.id, chiave: n.id, w: larghezzaNome(nomi.get(n.id) ?? n.id), r: tappaDi.has(n.id) ? RAGGIO_TAPPA : RAGGIO, tappa: false }));
  piazza(voci, true, luoghi, true);
  // il nome del luogo dove sei: col segno grande, contro tutti i nomi fermi tranne il suo
  for (const v of voci) {
    const { cx, cy } = posti.get(v.id)!;
    const r = tappaDi.has(v.id) ? RAGGIO_TAPPA : RAGGIO_QUI;
    const s = (c: Posto) => scatolaNome(cx, cy, v.w, r, c);
    let scelto = CANDIDATI.find((c) => libero(v.id, v.chiave, s(c), true, true));
    if (!scelto) {
      scelto = CANDIDATI.find((c) => libero(v.id, v.chiave, s(c), false, true));
      storture.push(scelto ? { testo: `il nome di ${v.id}, quando ci sei, sta sopra una strada`, ids: [v.id], lieve: true }
        : { testo: `il nome di ${v.id}, quando ci sei, non trova posto`, ids: [v.id] });
    }
    qui.set(v.id, scelto ?? luoghi.get(v.id)!);
  }
  return { tappe, luoghi, qui, storture };
}

// ── la disposizione intera, con il ritiro ────────────────────────────────────
export interface Disposizione {
  firma: string;
  posti: Map<string, Punto>;
  /** quanto ciascun luogo si scosta dalla griglia piegata (1 pieno, 0 sulla griglia piegata) */
  k: Map<string, number>;
  /** quante volte si è dovuto ritirare, e se alla fine si è tornati alla griglia */
  ritiri: number;
  griglia: boolean;
  tracciati: Map<string, Tracciato>;
  lati: Lati;
  /** ciò che resta storto (vuota se tutto regge): la usa il collaudo */
  storture: Stortura[];
}

let ultima: Disposizione | null = null;

/** Dove sta ogni luogo, il tracciato di ogni strada e il lato di ogni nome. Si comincia con tutti i luoghi liberi di
 *  scostarsi (k = 1); chi è coinvolto in una stortura (una strada che piega, un incrocio, un nome senza posto) dimezza il
 *  suo k e si ricomincia, sei volte al più; poi i colpevoli che restano tornano sulla griglia piegata (k = 0) e, se
 *  nemmeno così regge, ci torna tutto. Dipende solo dalla carta (e dalle zone): si calcola una volta e si ricorda. */
export function disposizione(carta: Carta, zonaDi?: (luogo: string) => string | undefined): Disposizione {
  const luoghi = carta.luoghi.filter((l) => l.x !== null && l.y !== null);
  const nodi: Nodo[] = luoghi.map((l) => ({ id: l.id, x: l.x!, y: l.y! }));
  const nomi = new Map(luoghi.map((l) => [l.id, l.nome]));
  const firma = luoghi.map((l) => `${l.id}:${l.x},${l.y}:${zonaDi?.(l.id) ?? ""}:${l.nome}`).join("|") + "#" + carta.strade.map((s) => s.join("-")).join("|")
    + "#" + JSON.stringify(nomiTappe);
  if (ultima && ultima.firma === firma) return ultima;
  const tappaDi = new Set(TAPPE.map((t) => t.luogo));
  const raggioDi = (id: string) => (tappaDi.has(id) ? RAGGIO_TAPPA : RAGGIO_QUI);
  const prova = (k: Map<string, number>) => {
    const posti = disponi(nodi, carta.strade, zonaDi, k);
    const { tracciati, storture: st } = tracciatiDi(nodi, carta.strade, posti, zonaDi, raggioDi);
    const lati = latiDi(nodi, nomi, posti, tracciati);
    return { posti, tracciati, lati, storture: [...stortureDi(nodi, carta.strade, posti), ...st, ...lati.storture] };
  };
  const k = new Map(nodi.map((n) => [n.id, 1]));
  let r = prova(k), ritiri = 0;
  for (; r.storture.length && ritiri < IRREGOLARE.ritiri; ritiri++) {
    for (const s of r.storture) for (const id of s.ids) if (k.has(id)) k.set(id, k.get(id)! / 2);
    r = prova(k);
  }
  const gravi = () => r.storture.filter((s) => !s.lieve);
  let griglia = false;
  if (gravi().length) {
    for (const s of gravi()) for (const id of s.ids) if (k.has(id)) k.set(id, 0);
    r = prova(k);
    if (gravi().length) { for (const id of k.keys()) k.set(id, 0); r = prova(k); griglia = true; }
  }
  ultima = { firma, posti: r.posti, k, ritiri, griglia, tracciati: r.tracciati, lati: r.lati, storture: r.storture };
  return ultima;
}

/** La griglia piegata da sola (tutti i luoghi a k = 0): il collaudo misura da lì quanto la carta se ne scosta. */
export function grigliaPiegata(carta: Carta, zonaDi?: (luogo: string) => string | undefined): Map<string, Punto> {
  const nodi: Nodo[] = carta.luoghi.filter((l) => l.x !== null && l.y !== null).map((l) => ({ id: l.id, x: l.x!, y: l.y! }));
  return disponi(nodi, carta.strade, zonaDi, new Map(nodi.map((n) => [n.id, 0])));
}

// ── gli ancoraggi della stampa ───────────────────────────────────────────────
/** I punti a cui si ancora il terreno della stampa (terreno.ts): soltanto le tappe e i punti di mezzo fra due tappe (la
 *  sella delle colline fra il pianoro e il guado, il crinale fra la piana e l'invaso), più ciò che il racconto mette
 *  nell'acqua o sui binari: il fondo dell'invaso, la diga, la stazione. Nulla se la carta non ha le tappe. */
export interface AncoreTerreno {
  firma: string;
  sella: Punto; pianoro: Punto; piazzetta: Punto; crinale: Punto; guado: Punto;
  diga: Punto | null; stazione: Punto | null; fondo: Punto[];
}
export const FONDO_INVASO = ["conca", "fondale", "torre di presa", "relitto"] as const;
export function ancoreTerreno(disp: Disposizione): AncoreTerreno | null {
  const t = (zona: string) => { const l = TAPPE.find((x) => x.zona === zona)?.luogo; return l ? disp.posti.get(l) ?? null : null; };
  const z2 = t("z2"), z3 = t("z3"), z5 = t("z5"), z6 = t("z6"), z7 = t("z7");
  if (!z2 || !z3 || !z5 || !z6 || !z7) return null;
  const mezzo = (a: Punto, b: Punto) => ({ cx: (a.cx + b.cx) / 2, cy: (a.cy + b.cy) / 2 });
  return {
    firma: disp.firma, sella: mezzo(z6, z7), pianoro: z6, piazzetta: z5, crinale: mezzo(z2, z3), guado: z7,
    diga: disp.posti.get("diga") ?? null, stazione: disp.posti.get("stazione") ?? null,
    fondo: FONDO_INVASO.map((id) => disp.posti.get(id)).filter((q): q is Punto => !!q),
  };
}

// ── il foglio di una partita ─────────────────────────────────────────────────
/** Da che parte sta un punto rispetto a un altro, a parole, sul foglio (nord in alto). */
export function versoA(da: Punto, a: Punto): string {
  const ang = (Math.atan2(-(a.cy - da.cy), a.cx - da.cx) * 180) / Math.PI;
  const nomi = ["a est", "a nord-est", "a nord", "a nord-ovest", "a ovest", "a sud-ovest", "a sud", "a sud-est"];
  return nomi[((Math.round(ang / 45) % 8) + 8) % 8];
}

/** Che cosa c'è sul foglio, dati i luoghi visitati e quello dove sei. I luoghi senza posto sulla carta non si disegnano.
 *  `zonaDi` dice di che zona è un luogo (ROOM_ZONE): una tappa è raggiunta appena si entra nella sua zona, non solo nel suo
 *  luogo centrale (si entra in una zona da un luogo d'ingresso: dalla stazione, dal tratto…); senza, vale il luogo centrale. */
export function foglio(carta: Carta, visitate: readonly string[], qui: string | null, zonaDi?: (luogo: string) => string | undefined): Foglio {
  const disp = disposizione(carta, zonaDi);
  const visti = new Set(visitate);
  if (qui) visti.add(qui);
  const conPosto = new Map(carta.luoghi.filter((l) => l.x !== null && l.y !== null).map((l) => [l.id, l]));
  const vicini = new Map<string, Set<string>>();
  for (const [a, b] of carta.strade) {
    if (!conPosto.has(a) || !conPosto.has(b)) continue;
    (vicini.get(a) ?? vicini.set(a, new Set()).get(a)!).add(b);
    (vicini.get(b) ?? vicini.set(b, new Set()).get(b)!).add(a);
  }
  const noti = new Set<string>();
  for (const id of visti) for (const v of vicini.get(id) ?? []) if (!visti.has(v)) noti.add(v);

  const tappe = TAPPE.filter((t) => conPosto.has(t.luogo));
  const tappaDi = new Map(tappe.map((t) => [t.luogo, t]));
  const quiP = qui ? disp.posti.get(qui) ?? null : null;

  const tappeSulFoglio: TappaSulFoglio[] = tappe.map((t) => {
    const { cx, cy } = disp.posti.get(t.luogo)!;
    const raggiunta = visti.has(t.luogo) || (!!zonaDi && t.zona !== ACQUAMORTA && [...visti].some((id) => zonaDi(id) === t.zona));
    const posto = disp.lati.tappe.get(t.luogo) ?? CANDIDATI[0];
    return { id: t.luogo, zona: t.zona, nome: nomeTappa(t), cx, cy, raggiunta, lato: posto.lato, scosta: posto.scosta,
      anello: anello(cx, cy, RAGGIO_TAPPA, t.luogo), verso: quiP && t.luogo !== qui ? versoA(quiP, { cx, cy }) : null };
  });
  const mostrati = [...conPosto.values()].filter((l) => visti.has(l.id) || noti.has(l.id))
    .map((l) => ({ l, p: disp.posti.get(l.id)! }))
    .sort((a, b) => a.p.cy - b.p.cy || a.p.cx - b.p.cx);                // dall'alto, da sinistra: l'ordine in cui si leggono
  const luoghi: LuogoSulFoglio[] = mostrati.map(({ l, p }) => {
    const stato: StatoLuogo = l.id === qui ? "qui" : visti.has(l.id) ? "visto" : "noto";
    const tappa = tappaDi.get(l.id);
    const nomeNascosto = !!tappa && nomeTappa(tappa).toLowerCase() === l.nome.toLowerCase();
    const posto = (stato === "qui" ? disp.lati.qui.get(l.id) : disp.lati.luoghi.get(l.id)) ?? CANDIDATI[0];
    const raggio = tappaDi.has(l.id) ? RAGGIO_TAPPA : stato === "qui" ? RAGGIO_QUI : RAGGIO;
    return { id: l.id, nome: l.nome, cx: p.cx, cy: p.cy, stato, raggio, nomeNascosto, lato: posto.lato, scosta: posto.scosta };
  });

  const strade: StradaSulFoglio[] = [];
  const mostratiId = new Set(luoghi.map((l) => l.id));
  for (const [a0, b0] of carta.strade) {
    if (!mostratiId.has(a0) || !mostratiId.has(b0)) continue;
    const [a, b] = a0 < b0 ? [a0, b0] : [b0, a0];
    const va = visti.has(a), vb = visti.has(b);
    if (!va && !vb) continue;                                          // fra due luoghi ancora da scoprire non c'è niente da segnare
    const t = disp.tracciati.get(`${a}|${b}`);
    if (!t) continue;
    const battuta = va && vb;
    strade.push({ da: a, a: b, battuta, daQui: !battuta && (a === qui || b === qui), classe: t.classe, d: t.d });
  }
  return { larghezza: FOGLIO.larghezza, altezza: FOGLIO.altezza, tappe: tappeSulFoglio, luoghi, strade };
}

/** Il punto dove sta il nome di un luogo o di una tappa, e come si allinea. */
export function postoNome(l: { cx: number; cy: number; lato: Lato; scosta?: number; raggio?: number }, corpo: number = CORPO_NOME): { x: number; y: number; ancora: "middle" | "start" | "end" } {
  const s = scatolaNome(l.cx, l.cy, 0, l.raggio ?? RAGGIO_TAPPA, { lato: l.lato, scosta: l.scosta ?? 0 });
  const ancora = l.lato === "sopra" || l.lato === "sotto" ? "middle" : l.lato.endsWith("destra") ? "start" : "end";
  const x = ancora === "middle" ? l.cx : ancora === "start" ? s.x0 : s.x1;
  const y = l.lato === "destra" || l.lato === "sinistra" ? l.cy + corpo / 2 - 1 : l.lato.startsWith("sopra") ? s.y1 - 1 : s.y0 + corpo - 1;
  return { x, y, ancora };
}

/** Per chi non vede il foglio: dove sei, le tappe (con la loro direzione da lì), dove sei stato, che cosa si vede da lì. */
export function descrizione(f: Foglio): { qui: string | null; tappe: string[]; visti: string[]; noti: string[] } {
  return {
    qui: f.luoghi.find((l) => l.stato === "qui")?.nome ?? null,
    tappe: f.tappe.map((t) => `${t.nome}${t.raggiunta ? ", raggiunta" : ""}${t.verso ? `, ${t.verso}` : ""}`),
    visti: f.luoghi.filter((l) => l.stato === "visto").map((l) => l.nome),
    noti: f.luoghi.filter((l) => l.stato === "noto").map((l) => l.nome),
  };
}

/** Per i collaudi: dove sul foglio due cose si toccano o escono dalla cornice, con gli id coinvolti. Vuota se tutto sta al
 *  suo posto. Controlla i nomi fra loro, i nomi contro i segni degli altri luoghi e contro gli angoli riservati, e che segni
 *  e nomi stiano dentro la cornice. */
export function conflittiDi(f: Foglio): Stortura[] {
  const out: Stortura[] = [];
  const nomi = [
    ...f.tappe.map((t) => ({ nome: `«${t.nome}» (tappa)`, id: t.id, s: scatolaNome(t.cx, t.cy, larghezzaTappa(t.nome), RAGGIO_TAPPA, t) })),
    ...f.luoghi.filter((l) => !l.nomeNascosto).map((l) => ({ nome: `«${l.nome}»`, id: l.id, s: scatolaNome(l.cx, l.cy, larghezzaNome(l.nome), l.raggio, l) })),
  ];
  const segni = new Map<string, { nome: string; s: Scatola }>();
  for (const l of f.luoghi) segni.set(l.id, { nome: `«${l.nome}»`, s: scatolaSegno(l.cx, l.cy, l.raggio) });
  for (const t of f.tappe) segni.set(t.id, { nome: `«${t.nome}» (tappa)`, s: scatolaSegno(t.cx, t.cy, RAGGIO_TAPPA) });
  nomi.forEach((a, i) => {
    for (const b of nomi.slice(i + 1)) if (siToccano(a.s, b.s)) out.push({ testo: `il nome ${a.nome} tocca il nome ${b.nome}`, ids: [a.id, b.id] });
    for (const [id, g] of segni) if (id !== a.id && siToccano(a.s, g.s, 0)) out.push({ testo: `il nome ${a.nome} copre il segno di ${g.nome}`, ids: [a.id, id] });
    if (RISERVATI.some((r) => siToccano(r, a.s))) out.push({ testo: `il nome ${a.nome} entra nell'angolo della rosa`, ids: [a.id] });
  });
  for (const { nome, s, id } of [...nomi, ...Array.from(segni, ([id, g]) => ({ ...g, id }))]) {
    if (!nelFoglio(s)) out.push({ testo: `${nome} sporge dal foglio`, ids: [id] });
  }
  return out;
}
export function conflitti(f: Foglio): string[] { return Array.from(new Set(conflittiDi(f).map((c) => c.testo))); }
