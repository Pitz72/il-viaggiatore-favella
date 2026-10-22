// ====================================================================
//  La mappa: che cosa si vede sul foglio e dove vanno i nomi.
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
//  Il foglio è sempre tutta la carta, in unità che a misura piena sono pixel:
//  i nomi non cambiano misura strada facendo.
// ====================================================================
import type { Carta } from "../lib/favellaRuntime";

export type StatoLuogo = "qui" | "visto" | "noto";
export type Lato = "sopra" | "sotto" | "destra" | "sinistra";

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

export interface LuogoSulFoglio {
  id: string;
  nome: string;
  /** il posto in unità del foglio (il centro del segno) */
  cx: number;
  cy: number;
  stato: StatoLuogo;
  /** da che parte del segno sta il nome */
  lato: Lato;
  /** il raggio del segno: più grande dove c'è una tappa */
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
}
export interface StradaSulFoglio { da: string; a: string; /** fra due luoghi visitati */ battuta: boolean }
export interface Foglio {
  larghezza: number;
  altezza: number;
  tappe: TappaSulFoglio[];
  luoghi: LuogoSulFoglio[];
  strade: StradaSulFoglio[];
}

/** La cornice del foglio a misura piena, e il passo fra due luoghi vicini. */
export const FOGLIO = { larghezza: 1092, altezza: 481, passoX: 76, passoY: 37.5, margineX: 52, margineY: 34 } as const;
/** Il raggio del segno di un luogo e quello della tappa; la misura dei nomi (Lora 11, le tappe in maiuscoletto 10): la larghezza
 *  di una lettera è una stima, per tenere i nomi lontani fra loro. */
export const RAGGIO = 6;
export const RAGGIO_TAPPA = 11;
export const CORPO_NOME = 11;
export const CORPO_TAPPA = 10;
const LARGHEZZA_LETTERA = 5.7;
const LARGHEZZA_LETTERA_TAPPA = 7.6;
const ALTEZZA_NOME = 13;

/** La larghezza che occupa un nome (stima), e quella del nome di una tappa. */
export const larghezzaNome = (nome: string) => Math.ceil(nome.length * LARGHEZZA_LETTERA);
export const larghezzaTappa = (nome: string) => Math.ceil(nome.length * LARGHEZZA_LETTERA_TAPPA);

interface Scatola { x0: number; y0: number; x1: number; y1: number }
/** Il riquadro di un nome attorno a un segno di raggio `r`, dal lato dato. */
const scatolaNome = (cx: number, cy: number, w: number, r: number, lato: Lato): Scatola => {
  const h = ALTEZZA_NOME, m = r + 3;
  if (lato === "sopra") return { x0: cx - w / 2, x1: cx + w / 2, y1: cy - m, y0: cy - m - h };
  if (lato === "sotto") return { x0: cx - w / 2, x1: cx + w / 2, y0: cy + m, y1: cy + m + h };
  if (lato === "destra") return { x0: cx + m, x1: cx + m + w, y0: cy - h / 2, y1: cy + h / 2 };
  return { x0: cx - m - w, x1: cx - m, y0: cy - h / 2, y1: cy + h / 2 };
};
const siToccano = (a: Scatola, b: Scatola, aria = 2) =>
  a.x0 < b.x1 + aria && b.x0 < a.x1 + aria && a.y0 < b.y1 + aria && b.y0 < a.y1 + aria;
const scatolaSegno = (cx: number, cy: number, r: number): Scatola => ({ x0: cx - r, x1: cx + r, y0: cy - r, y1: cy + r });
const nelFoglio = (s: Scatola) => s.x0 >= 0 && s.y0 >= 0 && s.x1 <= FOGLIO.larghezza && s.y1 <= FOGLIO.altezza;
const LATI: readonly Lato[] = ["sopra", "sotto", "destra", "sinistra"];

/** Il posto di un luogo sul foglio, dalla sua casella della griglia. */
export const postoSulFoglio = (x: number, y: number) => ({
  cx: FOGLIO.margineX + x * FOGLIO.passoX,
  cy: FOGLIO.margineY + y * FOGLIO.passoY,
});

/** Che cosa c'è sul foglio, dati i luoghi visitati e quello dove sei. I luoghi senza posto sulla carta non si disegnano.
 *  `zonaDi` dice di che zona è un luogo (ROOM_ZONE): una tappa è raggiunta appena si entra nella sua zona, non solo nel suo
 *  luogo centrale (si entra in una zona da un luogo d'ingresso: dalla stazione, dal tratto…); senza, vale il luogo centrale. */
export function foglio(carta: Carta, visitate: readonly string[], qui: string | null, zonaDi?: (luogo: string) => string | undefined): Foglio {
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

  // le tappe: tutte, dove la carta ha il loro luogo centrale
  const tappe = TAPPE.filter((t) => conPosto.has(t.luogo));
  const tappaDi = new Map(tappe.map((t) => [t.luogo, t]));

  const mostrati = [...conPosto.values()].filter((l) => visti.has(l.id) || noti.has(l.id))
    .sort((a, b) => a.y! - b.y! || a.x! - b.x!);                      // dall'alto, da sinistra: l'ordine in cui si leggono
  // tutti i segni del foglio: i luoghi mostrati e le tappe (anche se il loro luogo non si vede ancora)
  const segni = new Map<string, { cx: number; cy: number; r: number }>();
  for (const l of mostrati) segni.set(l.id, { ...postoSulFoglio(l.x!, l.y!), r: tappaDi.has(l.id) ? RAGGIO_TAPPA : RAGGIO });
  for (const t of tappe) {
    const l = conPosto.get(t.luogo)!;
    segni.set(t.luogo, { ...postoSulFoglio(l.x!, l.y!), r: RAGGIO_TAPPA });
  }
  const scatoleSegni = (tranne: string) => [...segni].filter(([id]) => id !== tranne).map(([, s]) => scatolaSegno(s.cx, s.cy, s.r));

  const piazzati: Scatola[] = [];
  /** Il primo lato dove il nome non tocca altri nomi né altri segni e sta nel foglio; se nessuno va bene, il primo che sta nel foglio. */
  const piazza = (id: string, w: number): Lato => {
    const { cx, cy, r } = segni.get(id)!;
    const altri = scatoleSegni(id);
    const lato = LATI.find((l) => {
      const s = scatolaNome(cx, cy, w, r, l);
      return nelFoglio(s) && !piazzati.some((p) => siToccano(p, s)) && !altri.some((p) => siToccano(p, s, 0));
    }) ?? LATI.find((l) => nelFoglio(scatolaNome(cx, cy, w, r, l))) ?? "sopra";
    piazzati.push(scatolaNome(cx, cy, w, r, lato));
    return lato;
  };

  // prima i nomi delle tappe (sono i più importanti), poi quelli dei luoghi
  const tappeSulFoglio: TappaSulFoglio[] = tappe.map((t) => {
    const { cx, cy } = segni.get(t.luogo)!;
    const raggiunta = visti.has(t.luogo) || (!!zonaDi && t.zona !== ACQUAMORTA && [...visti].some((id) => zonaDi(id) === t.zona));
    return { id: t.luogo, zona: t.zona, nome: t.nome, cx, cy, raggiunta, lato: piazza(t.luogo, larghezzaTappa(t.nome)) };
  });
  const luoghi: LuogoSulFoglio[] = mostrati.map((l) => {
    const { cx, cy, r } = segni.get(l.id)!;
    const nomeNascosto = tappaDi.get(l.id)?.nome.toLowerCase() === l.nome.toLowerCase();
    return { id: l.id, nome: l.nome, cx, cy, raggio: r, nomeNascosto,
      stato: l.id === qui ? "qui" : visti.has(l.id) ? "visto" : "noto",
      lato: nomeNascosto ? "sopra" : piazza(l.id, larghezzaNome(l.nome)) };
  });

  const strade: StradaSulFoglio[] = [];
  const mostratiId = new Set(mostrati.map((l) => l.id));
  for (const [a, b] of carta.strade) {
    if (!mostratiId.has(a) || !mostratiId.has(b)) continue;
    const va = visti.has(a), vb = visti.has(b);
    if (va || vb) strade.push({ da: a, a: b, battuta: va && vb });     // fra due luoghi ancora da scoprire non c'è niente da segnare
  }
  return { larghezza: FOGLIO.larghezza, altezza: FOGLIO.altezza, tappe: tappeSulFoglio, luoghi, strade };
}

/** Il punto dove sta il nome di un luogo o di una tappa, e come si allinea. */
export function postoNome(l: { cx: number; cy: number; lato: Lato; raggio?: number }, corpo: number = CORPO_NOME): { x: number; y: number; ancora: "middle" | "start" | "end" } {
  const m = (l.raggio ?? RAGGIO_TAPPA) + 4;
  if (l.lato === "sopra") return { x: l.cx, y: l.cy - m, ancora: "middle" };
  if (l.lato === "sotto") return { x: l.cx, y: l.cy + m + corpo - 2, ancora: "middle" };
  if (l.lato === "destra") return { x: l.cx + m, y: l.cy + corpo / 2 - 1, ancora: "start" };
  return { x: l.cx - m, y: l.cy + corpo / 2 - 1, ancora: "end" };
}

/** Per chi non vede il foglio: dove sei, le tappe, dove sei stato, che cosa si vede da lì. */
export function descrizione(f: Foglio): { qui: string | null; tappe: string[]; visti: string[]; noti: string[] } {
  return {
    qui: f.luoghi.find((l) => l.stato === "qui")?.nome ?? null,
    tappe: f.tappe.map((t) => t.nome),
    visti: f.luoghi.filter((l) => l.stato === "visto").map((l) => l.nome),
    noti: f.luoghi.filter((l) => l.stato === "noto").map((l) => l.nome),
  };
}

/** Per i collaudi: dove sul foglio due cose si toccano o escono dalla cornice. Vuota se tutto sta al suo posto.
 *  Controlla i nomi fra loro, i nomi contro i segni degli altri luoghi, e che segni e nomi stiano nel foglio. */
export function conflitti(f: Foglio): string[] {
  const out: string[] = [];
  const nomi = [
    ...f.tappe.map((t) => ({ nome: `«${t.nome}» (tappa)`, id: t.id, s: scatolaNome(t.cx, t.cy, larghezzaTappa(t.nome), RAGGIO_TAPPA, t.lato) })),
    ...f.luoghi.filter((l) => !l.nomeNascosto).map((l) => ({ nome: `«${l.nome}»`, id: l.id, s: scatolaNome(l.cx, l.cy, larghezzaNome(l.nome), l.raggio, l.lato) })),
  ];
  const segni = new Map<string, { nome: string; s: Scatola }>();
  for (const l of f.luoghi) segni.set(l.id, { nome: `«${l.nome}»`, s: scatolaSegno(l.cx, l.cy, l.raggio) });
  for (const t of f.tappe) segni.set(t.id, { nome: `«${t.nome}» (tappa)`, s: scatolaSegno(t.cx, t.cy, RAGGIO_TAPPA) });
  nomi.forEach((a, i) => {
    for (const b of nomi.slice(i + 1)) if (siToccano(a.s, b.s)) out.push(`il nome ${a.nome} tocca il nome ${b.nome}`);
    for (const [id, g] of segni) if (id !== a.id && siToccano(a.s, g.s, 0)) out.push(`il nome ${a.nome} copre il segno di ${g.nome}`);
  });
  for (const { nome, s } of [...nomi, ...Array.from(segni.values())]) {
    if (!nelFoglio(s)) out.push(`${nome} sporge dal foglio`);
  }
  return Array.from(new Set(out));
}
