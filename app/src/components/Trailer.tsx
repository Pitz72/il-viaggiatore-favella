// ====================================================================
//  «Il Viaggiatore» — TRAILER d'apertura (seconda versione).
// --------------------------------------------------------------------
//  Un cortometraggio di ~88 s in dieci inquadrature (vedi trailer/scaletta.ts
//  per il découpage). Architettura:
//   · UN orologio (rAF) → tempo t. Tutto è funzione di t: canvas, testi,
//     suono. Nessun comando a schermo durante il trailer: Esc lo salta.
//   · Canvas 16:9 in coordinate di progetto 1920×1080 per le immagini
//     (paesaggi procedurali, viandante articolato, mappa, polvere).
//   · Livello DOM, stessa superficie 1920×1080 scalata, per la tipografia
//     (nitida a ogni risoluzione) e il menu d'avvio finale.
//     I testi si animano scrivendo gli stili via ref: niente re-render React
//     a 60 fps.
//   · Colonna sonora: il brano src/assets/intro.mp3 (fa anche da orologio)
//     più il rumorismo sintetizzato; senza brano, tutta sintetizzata. Sul
//     desktop parte da sola; nel browser col primo tasto o clic. Con la voce
//     recitata (le impostazioni della voce del gioco) Enzo legge i testi sullo
//     stesso orologio, e la musica gli scende sotto (trailer/audio.ts).
//   · In inglese (lib/lingua.ts) cambiano soltanto le parole: i testi DOM hanno
//     accanto la loro traduzione e si ridisegnano al cambio di lingua; quelli
//     dipinti sul canvas (il biglietto, le date, i nomi della mappa) leggono la
//     lingua a ogni fotogramma. Tempi e voce restano quelli italiani: Enzo legge
//     in italiano anche sotto le scritte inglesi.
// ====================================================================
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { W, H, BANDA, SCENE, DURATA, presenza, TAPPE_T0, TAPPE_PASSO, CINQUE_T0, CINQUE_PASSO, REGOLA_DUR } from "../trailer/scaletta";
import { disegnaScena, avviaPreparazione, seguiPreparazione, tappaCorrente, REGOLE, FONT, cacheTrailer } from "../trailer/paesaggi";
import { clamp, seg, easeOut, easeIn, expoOut, inviluppo, rng } from "../trailer/tempo";
import { ColonnaSonora } from "../trailer/audio";
import branoIntro from "../assets/intro.mp3";
import { inDesktop, esciDalGioco } from "../lib/desktop";
import Taccuino from "../gioco/Taccuino";
import { durataLeggibile, nomeVisibile, piuRecente, type Salvataggio } from "../lib/salvataggi";
import { etichettaVersione } from "../lib/versione";
import ComeSiGioca from "../gioco/ComeSiGioca";
import PannelloOpzioni from "../gioco/Opzioni";
import PaginaTrofei from "../gioco/PaginaTrofei";
import { scaricaColonnaSonora } from "../lib/colonnaSonora";
import { ascoltaOpzioni, opzioni, type Qualita } from "../lib/opzioni";
import { useOpzioni } from "../lib/useOpzioni";
import { tr, type Lingua } from "../lib/lingua";
import { scalaTesto } from "../lib/accessibilita";
import VociMenu, { type VoceMenu } from "../gioco/VociMenu";
import Domanda from "../gioco/Domanda";
import Cartiglio, { DURATA_TROFEO, type DatiCartiglio } from "../gioco/Cartiglio";
import { PER_ID } from "../gioco/trofei";
import { suonaTrofeo } from "../gioco/suonoTrofeo";

// --------------------------------------------------------------------
//  Testi (cue): tempi, posizione, tipo d'animazione
// --------------------------------------------------------------------
type Tipo = "maschera" | "dissolvi" | "timbro";
/** Un testo del trailer nelle due lingue (le scritte non si traducono al volo: sono composte, a volte con un segno dentro). */
type Doppio = Record<Lingua, React.ReactNode>;
interface Riga { testo: Doppio; stile?: React.CSSProperties }
interface Cue {
  id: string; da: number; a: number; entra?: number; esce?: number; tipo: Tipo;
  box: React.CSSProperties; righe: Riga[]; sfalsa?: number;
}

/** Un velo scuro e morbido dietro più righe: sta sotto TUTTI i testi (un velo per riga coprirebbe la riga vicina) e fuori
 *  dalla maschera che taglia le righe (un'ombra larga verrebbe tagliata con un bordo duro). `cy` è il centro, in px di progetto. */
interface Velo { id: string; da: number; a: number; entra: number; esce: number; cy: number; w: number; h: number; colore: string; alfa: number }

/** Sul menu d'avvio il titolo sale da 262 (l'inquadratura J del trailer) a qui, e la colonna del menu parte da MENU_TOP:
 *  misurato a 1920×1080, così l'ultima voce («Esci», con «Continua» e il suo dettaglio in cima) resta a ~90 px dal bordo
 *  anche col testo grande (accessibilita.css stringe gli spazi fra le voci, non il testo). */
const TITOLO_SU_MENU = 136;
const MENU_TOP = 452;

const serif =(px: number, extra: React.CSSProperties = {}): React.CSSProperties =>
  ({ fontFamily: FONT.serif, fontWeight: 500, fontSize: px, lineHeight: 1.16, letterSpacing: "-0.005em", ...extra });
const display = (px: number, extra: React.CSSProperties = {}): React.CSSProperties =>
  ({ fontFamily: FONT.display, fontWeight: 600, fontSize: px, lineHeight: 1.08, letterSpacing: "-0.01em", ...extra });
const mono = (px: number, extra: React.CSSProperties = {}): React.CSSProperties =>
  ({ fontFamily: FONT.mono, fontWeight: 500, fontSize: px, letterSpacing: "0.32em", textTransform: "uppercase", ...extra });

const centro = (y: number): React.CSSProperties => ({ left: 0, right: 0, top: y, textAlign: "center" });

// Dietro le parole che devono leggersi sul cielo acceso dell'alba (viola) e sulle nuvole color pesca del guado (rosso
// cupo): un'ombra stretta, che sta dentro la maschera della riga, e un velo morbido del colore della scena, che sta
// fuori (la maschera taglierebbe un'ombra larga con un bordo duro). Il colore della parola non cambia.
const OMBRA_ALBA = "0 0 8px rgba(30,12,38,.8), 0 2px 3px rgba(22,8,28,.7)";
const OMBRA_GUADO = "0 2px 8px rgba(20,4,10,.8), 0 0 2px rgba(20,4,10,.6)";
const VELI: Velo[] = [
  { id: "veloAlba", da: 10.6, a: 16.9, entra: 0.9, esce: 0.5, cy: 360, w: 1300, h: 470, colore: "30,12,38", alfa: 0.68 },
  { id: "veloGuado", da: 61.8, a: 67.5, entra: 0.9, esce: 0.5, cy: 312, w: 1340, h: 440, colore: "34,6,14", alfa: 0.66 },
];

const regolaScura = { width: 120, height: 2, background: "#3b2415", display: "inline-block" } as const;
const secca = (parola: string) => <span style={{ display: "inline-flex", alignItems: "center", gap: 30 }}>{parola}<i style={regolaScura} /></span>;

const CUES: Cue[] = [
  { id: "alba1", da: 10.6, a: 16.9, tipo: "maschera", box: centro(250), righe: [{ testo: { it: "Un uomo torna a casa.", en: "A man returns home." }, stile: serif(88, { color: "#f4ece0", textShadow: OMBRA_ALBA }) }] },
  { id: "alba2", da: 12.3, a: 16.9, tipo: "maschera", box: centro(360), righe: [{ testo: { it: "A piedi.", en: "On foot." }, stile: serif(88, { color: "#f6b77c", fontStyle: "italic", textShadow: OMBRA_ALBA }) }] },
  { id: "terra", da: 18.3, a: 22.4, tipo: "maschera", sfalsa: 0.16, box: { left: 170, top: 196 },
    righe: [{ testo: { it: "Attraverso una terra", en: "Across a land" }, stile: serif(70, { color: "#2c1a0e" }) }, { testo: { it: "che l’acqua ha svuotato.", en: "the water has emptied." }, stile: serif(70, { color: "#2c1a0e" }) }] },
  { id: "secca", da: 22.6, a: 25.1, entra: 0.3, tipo: "timbro", box: { left: 170, top: 400 },
    righe: [
      { testo: { it: secca("la secca"), en: secca("the drought") }, stile: mono(34, { color: "#3b2415", letterSpacing: "0.62em", fontWeight: 600 }) },
      { testo: { it: "dieci anni senza pioggia", en: "ten years without rain" }, stile: serif(34, { color: "#4a3020", fontStyle: "italic", marginTop: 18 }) },
    ] },
  { id: "dom1", da: 27.2, a: 32.9, tipo: "maschera", box: centro(260), righe: [{ testo: { it: "A cosa stai tornando —", en: "What are you going back to —" }, stile: serif(72, { color: "#eef2f8", fontStyle: "italic" }) }] },
  { id: "dom2", da: 28.7, a: 32.9, tipo: "maschera", box: centro(356), righe: [{ testo: { it: "e cosa resterà di te quando ci arrivi?", en: "and what will be left of you when you get there?" }, stile: serif(72, { color: "#eef2f8", fontStyle: "italic" }) }] },
  { id: "mappa", da: 33.6, a: 36.1, tipo: "dissolvi", box: centro(190), righe: [{ testo: { it: "Sette tappe fino a casa.", en: "Seven stages home." }, stile: serif(64, { color: "#e8eef6" }) }] },
  { id: "cinque", da: 49.3, a: 52.4, tipo: "maschera", sfalsa: 0.18, box: centro(420),
    righe: [{ testo: { it: "Cinque modi di stare", en: "Five ways to live" }, stile: serif(78, { color: "#eef2f8" }) }, { testo: { it: "in un mondo che muore.", en: "in a dying world." }, stile: serif(78, { color: "#eef2f8", fontStyle: "italic" }) }] },
  { id: "guado1", da: 61.8, a: 67.5, tipo: "maschera", box: centro(214), righe: [{ testo: { it: "E al guado, ad aspettarti,", en: "And at the ford, waiting for you," }, stile: serif(76, { color: "#f6e6e2", textShadow: OMBRA_GUADO }) }] },
  { id: "guado2", da: 64.0, a: 67.5, tipo: "maschera", box: centro(318), righe: [{ testo: { it: "tuo fratello.", en: "your brother." }, stile: serif(76, { color: "#ffa0a0", fontStyle: "italic", textShadow: OMBRA_GUADO }) }] },
  ...REGOLE.map((r, i): Cue => ({
    id: "regola" + i, da: 67.8 + i * REGOLA_DUR + 0.06, a: 67.8 + (i + 1) * REGOLA_DUR - 0.04, entra: 0.35, esce: 0.12, tipo: "maschera",
    box: { left: 150, top: 390, width: 980 },
    righe: [
      { testo: { it: `0${i + 1} — 05`, en: `0${i + 1} — 05` }, stile: mono(20, { color: r.a, marginBottom: 26 }) },
      { testo: { it: r.testo, en: r.en }, stile: display(76, { color: "#f2f4f8", whiteSpace: "pre-line" }) },
    ],
  })),
  { id: "numeritag", da: 78.9, a: 81.7, tipo: "dissolvi", box: centro(760),
    righe: [{ testo: { it: "Un’avventura testuale in italiano, scritta e giocata col motore vero.", en: "An Italian text adventure, written and played on the real engine." }, stile: serif(34, { color: "#b9c4d4", fontStyle: "italic" }) }] },
];

const STATS: { n: number; l: Doppio }[] = [
  { n: 7, l: { it: "tappe", en: "stages" } }, { n: 39, l: { it: "luoghi", en: "places" } },
  { n: 14, l: { it: "personaggi", en: "characters" } }, { n: 6, l: { it: "finali", en: "endings" } },
];

const CINQUE = [
  // Saverio custodisce il pozzo: tetto a due falde, carrucola, secchio, muro di pietre
  { nome: "Saverio", luogo: { it: "il pozzo", en: "the well" }, verbo: { it: "custodire", en: "guarding" }, a: "#e6a85a",
    d: ["M30 76 Q60 90 90 76", "M30 76 Q60 64 90 76", "M30 76 V102 Q60 112 90 102 V76", "M31 88 Q60 98 89 88",
        "M46 82 V93", "M62 84 V96", "M77 82 V92", "M40 94 V104", "M55 97 V108",
        "M38 74 V34", "M82 74 V34", "M24 34 H96", "M22 34 L60 12 L98 34", "M34 27 H86", "M45 20 H75",
        "M54 44 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0", "M60 50 V64", "M52 64 H68 L65.5 78 H54.5 Z", "M53 70 H67", "M82 44 H100 L104 52"],
    riempi: ["M22 34 L60 12 L98 34 Z", "M52 64 H68 L65.5 78 H54.5 Z"] },
  // Iole aspetta alla pompa: corpo, manico alzato, beccuccio, la goccia che tarda a cadere
  { nome: "Iole", luogo: { it: "la diga", en: "the dam" }, verbo: { it: "aspettare", en: "waiting" }, a: "#a9dbe4",
    d: ["M38 106 H82", "M44 106 V94 H76 V106", "M52 94 V40 Q52 32 60 32 Q68 32 68 40 V94", "M52 78 H68", "M52 58 H68",
        "M68 62 H90 Q98 62 98 70 V74", "M60 32 V14", "M52 14 H68", "M60 24 L26 14", "M22 12 L30 18",
        "M98 82 Q94 90 98 94 Q102 90 98 82 Z", "M84 108 Q98 112 112 108"],
    riempi: ["M52 94 V40 Q52 32 60 32 Q68 32 68 40 V94 Z", "M98 82 Q94 90 98 94 Q102 90 98 82 Z"] },
  // Vito tiene il casello: garitta, sbarra alzata a strisce, contrappeso, lampada
  { nome: "Vito", luogo: { it: "il casello", en: "the tollbooth" }, verbo: { it: "predare", en: "preying" }, a: "#f2ad45",
    d: ["M14 106 H52", "M20 106 V58 H44 V106", "M17 58 L32 46 L47 58", "M26 70 H38 V84 H26 Z",
        "M44 66 L104 36", "M56 60 L54 53", "M68 54 L66 47", "M80 48 L78 41", "M92 42 L90 35",
        "M100 36 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0", "M44 66 L36 76", "M27 78 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0"],
    riempi: ["M20 106 V58 H44 V106 Z", "M26 70 H38 V84 H26 Z"] },
  // Rosaria resta: un bicchiere d'acqua sul tavolo, con il suo menisco
  { nome: "Rosaria", luogo: { it: "l’osteria", en: "the tavern" }, verbo: { it: "restare", en: "staying" }, a: "#ec7d54",
    d: ["M38 34 L44 102 H76 L82 34", "M38 34 Q60 42 82 34 Q60 26 38 34", "M41 58 Q60 66 79 58", "M46 44 L50 92",
        "M30 106 H90", "M96 84 Q92 92 96 96 Q100 92 96 84 Z"],
    riempi: ["M41 58 Q60 66 79 58 L76 102 H44 Z"] },
  // Onofrio rinuncia: il cavallo di legno, intagliato, con le venature
  { nome: "Onofrio", luogo: { it: "la grotta", en: "the cave" }, verbo: { it: "rinunciare", en: "giving up" }, a: "#9aa6e0",
    d: [// le due gambe lontane, dietro il corpo
        "M62 74 L62 98 L66 103", "M58 76 L59 99 L63 103",
        // il corpo del cavallo, di profilo: groppa, dorso, criniera, testa lunga, petto, zampe
        "M30 52 C38 44 52 44 62 45 C66 45 68 44 69 41 C71 34 73 26 80 18 L88 22 C93 27 97 34 100 41 C101 44 100 47 97 47 L93 45 C90 43 88 40 85 38 C86 45 88 52 88 58 C88 63 86 66 84 68 L85 84 L84 99 L88 104 L77 104 L78 99 L77 86 L74 72 C66 76 58 76 52 72 C52 80 50 86 50 92 L50 100 L54 104 L42 104 L43 99 L41 90 C36 84 33 74 32 66 C28 62 27 56 30 52 Z",
        // l'orecchio, la criniera, la coda, l'occhio, la narice
        "M81 19 L82 11 L86 18", "M70.5 37 L64 38", "M73 30 L66 30", "M76 24 L69 23",
        "M30 55 C20 57 14 67 16 80 C17 86 14 90 12 93", "M13 78 C10 84 12 90 10 94",
        "M89.6 28 a1.4 1.4 0 1 0 2.8 0 a1.4 1.4 0 1 0 -2.8 0", "M97 43 a0.9 0.9 0 1 0 1.8 0 a0.9 0.9 0 1 0 -1.8 0",
        // l'intaglio: la rosetta sul fianco e le fascette alle giunture delle zampe
        "M41 58 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0", "M44 58 a2 2 0 1 0 4 0 a2 2 0 1 0 -4 0", "M77 90 H85", "M42 93 H50",
        "M18 106 H102"],
    riempi: ["M30 52 C38 44 52 44 62 45 C66 45 68 44 69 41 C71 34 73 26 80 18 L88 22 C93 27 97 34 100 41 C101 44 100 47 97 47 L93 45 C90 43 88 40 85 38 C86 45 88 52 88 58 C88 63 86 66 84 68 L85 84 L84 99 L88 104 L77 104 L78 99 L77 86 L74 72 C66 76 58 76 52 72 C52 80 50 86 50 92 L50 100 L54 104 L42 104 L43 99 L41 90 C36 84 33 74 32 66 C28 62 27 56 30 52 Z"] },
];

// --------------------------------------------------------------------
//  Grana di pellicola. Una tessera di rumore gaussiano appena sfumato (il grano è di 1–1,4 pixel VERI, qualunque sia
//  lo schermo: la tessera si genera alla risoluzione dello schermo e non si ingrandisce), con un filo di colore. Due
//  strati dalla stessa tessera, «soft-light» e «overlay», la rendono più viva nei mezzitoni che nelle ombre e nelle luci.
//  Cambia a 24 fotogrammi al secondo, in modo deterministico dal tempo (niente Math.random: anche i video esportati
//  escono uguali). Fa anche da dithering: copre il banding dei gradienti scuri.
// --------------------------------------------------------------------
const LATO_GRANA = 256;
const AMPIEZZA_GRANA = 44, COLORE_GRANA = 0.3;
const OPACITA_GRANA = { dolce: 0.3, forte: 0.035 };
const FOTOGRAMMI_GRANA = 24;
/** La tela non supera questa larghezza (px) se la misura non dice che si può: sopra, un quadro costa quanto i pixel in più. */
const TETTO_TELA = 2560;
/** Le larghezze oltre il tetto che si provano su uno schermo più grande (dalla più larga): la tela tiene la prima che la misura permette. */
const TELE_GRANDI = [3840, 3200];
/** La qualità della grafica: quanto della risoluzione piena (automatica parte da tutta e scende da sola) e il tetto della tela. */
const fattoreDi = (q: Qualita) => (q === "media" ? 0.75 : q === "bassa" ? 0.5 : 1);
const tettoDi = (q: Qualita) => (q === "alta" ? TELE_GRANDI[0] : q === "bassa" ? 1920 : TETTO_TELA);
/** Le inquadrature più pesanti (le lettere, l'alba, la terra, il guado, il titolo) e quanto può costare, al massimo, la peggiore (mediana, ms). */
const ISTANTI_PESANTI = [8, 13, 24, 66, 86];
const SOGLIA_MS = 14;                         // misurato a freddo, appena dopo la preparazione: a regime un fotogramma costa 2–3 ms in meno

/**
 * Un misuratore del costo dei fotogrammi: dà `n` fotogrammi consecutivi da `t` e restituisce i millisecondi (mediana, p95, massimo).
 * La sincronia passa da WebGL: leggere i pixel dal canvas 2D farebbe passare Chrome al disegno su CPU e falserebbe la misura.
 * Null se WebGL non c'è.
 */
function creaMisuratore(tela: HTMLCanvasElement) {
  const gl = document.createElement("canvas").getContext("webgl");
  if (!gl) return null;
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  const px = new Uint8Array(4);
  return (disegnaF: (t: number) => void, t: number, n: number) => {
    const ms: number[] = [];
    for (let i = 0; i < n; i++) {
      const a = performance.now();
      disegnaF(t + i / 60);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tela);
      gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
      ms.push(performance.now() - a);
    }
    ms.sort((x, y) => x - y);
    return { mediana: ms[Math.floor(n / 2)], p95: ms[Math.floor(n * 0.95)], max: ms[n - 1] };
  };
}

function faiGrana(): string {
  const n = LATO_GRANA, r = rng(20261020);
  const gauss = () => { const u = Math.max(r(), 1e-9), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  // lo sfumo: tre punti [0,12 0,76 0,12] in x e poi in y, con il giro (la tessera si ripete)
  const sfuma = (a: Float32Array) => {
    const b = new Float32Array(n * n), c = new Float32Array(n * n);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) b[y * n + x] = 0.12 * a[y * n + (x + n - 1) % n] + 0.76 * a[y * n + x] + 0.12 * a[y * n + (x + 1) % n];
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) c[y * n + x] = 0.12 * b[((y + n - 1) % n) * n + x] + 0.76 * b[y * n + x] + 0.12 * b[((y + 1) % n) * n + x];
    return c;
  };
  const campo = () => sfuma(Float32Array.from({ length: n * n }, gauss));
  const L = campo(), R = campo(), G = campo(), B = campo();
  const cv = document.createElement("canvas");
  cv.width = cv.height = n;
  const g = cv.getContext("2d")!;
  const img = g.createImageData(n, n);
  for (let i = 0, p = 0; i < n * n; i++, p += 4) {
    img.data[p] = 128 + AMPIEZZA_GRANA * (L[i] + COLORE_GRANA * R[i]);
    img.data[p + 1] = 128 + AMPIEZZA_GRANA * (L[i] + COLORE_GRANA * G[i]);
    img.data[p + 2] = 128 + AMPIEZZA_GRANA * (L[i] + COLORE_GRANA * B[i]);
    img.data[p + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return cv.toDataURL("image/png");
}

/** Lo scostamento della tessera a un dato fotogramma: pseudocasuale ma fisso (un hash del numero), in pixel veri. */
function scostamentoGrana(q: number): [number, number] {
  let h = Math.imul(q + 1, 0x9e3779b1);
  h ^= h >>> 15; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
  const a = h >>> 0;
  return [a % LATO_GRANA, Math.floor(a / LATO_GRANA) % LATO_GRANA];
}

// ====================================================================
interface Props {
  startAtEnd?: boolean;
  onLaunch: (carica?: Salvataggio | null) => void;
  /** Extra → Titoli di coda: la sequenza finale senza la frase (components/SequenzaFinale.tsx) */
  onTitoli?: () => void;
  /** i trofei vinti nell'ultimo turno di una partita (la fine non li mostra): si annunciano sul menu, uno alla volta */
  annuncia?: string[];
  onAnnunciati?: () => void;
}

const Trailer = ({ startAtEnd = false, onLaunch, onTitoli, annuncia = [], onAnnunciati }: Props) => {
  const palcoRef = useRef<HTMLDivElement>(null);
  const telaRef = useRef<HTMLCanvasElement>(null);
  const granaDolceRef = useRef<HTMLDivElement>(null);
  const granaForteRef = useRef<HTMLDivElement>(null);
  const granaQuadro = useRef(-1);
  const pixelVeri = useRef(1);                    // pixel veri per pixel CSS: la tessera si dimensiona su questo
  const cueRef = useRef<Record<string, HTMLDivElement | null>>({});
  const extraRef = useRef<Record<string, HTMLElement | null>>({});
  const tRef = useRef(startAtEnd ? DURATA : 0);
  const pausaRef = useRef(false);
  const suono = useRef<ColonnaSonora | null>(null);
  const buffer = useRef<HTMLCanvasElement | null>(null);
  // la risoluzione del canvas cala (1 → .75 → .5) se il computer non regge i 30 fotogrammi: meglio meno nitido che a scatti
  // (solo con la qualità «automatica»; le altre la fissano: lib/opzioni.ts)
  const grafica = useRef<Qualita>(opzioni().qualita);
  const qualita = useRef(fattoreDi(grafica.current));
  // il tetto della larghezza della tela (px): 2560 di partenza; in automatica sale (3840) solo se la misura dice che il
  // computer regge; in alta è 3840 subito, in bassa 1920
  const tetto = useRef(tettoDi(grafica.current));
  const adattaRef = useRef<() => void>(() => {});

  const [scala, setScala] = useState(1);
  const [pronto, setPronto] = useState(false);
  const [carica, setCarica] = useState(0);            // avanzamento della preparazione delle tele (0…1)
  const [finito, setFinito] = useState(startAtEnd);
  const [audio, setAudio] = useState(false);
  const [taccuino, setTaccuino] = useState(false);
  const [ultimo, setUltimo] = useState<Salvataggio | null>(null);
  const [guida, setGuida] = useState(false);
  const [opzioniAperte, setOpzioniAperte] = useState(false);
  const [trofeiAperti, setTrofeiAperti] = useState(false);
  // il menu Extra: una seconda colonna al posto della prima; sotto, com'è andato lo scaricamento (o quale sito si è aperto)
  const [extra, setExtra] = useState(false);
  const [notaExtra, setNotaExtra] = useState<string | null>(null);
  const [domandaNuovo, setDomandaNuovo] = useState(false);
  const [opz] = useOpzioni();   // il testo grande fa crescere la colonna del menu e i pannelli; la lingua cambia le scritte
  const lingua = opz.lingua;
  // il fotogramma scrive da sé alcune scritte (la didascalia a macchina, il contatore): leggono la lingua da qui
  const inglese = useRef(lingua === "en");
  inglese.current = lingua === "en";
  const grana = useMemo(faiGrana, []);
  pixelVeri.current = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

  // palco 16:9 → scala della superficie di progetto + risoluzione del canvas
  useLayoutEffect(() => {
    const el = palcoRef.current, tela = telaRef.current;
    if (!el || !tela) return;
    const adatta = () => {
      const s = el.clientWidth / W;
      setScala(s);
      const dpr = Math.min(window.devicePixelRatio || 1, 2) * qualita.current;
      const bw = Math.max(320, Math.min(Math.round(el.clientWidth * dpr), tetto.current));
      const bh = Math.round(bw * H / W);
      if (tela.width !== bw) { tela.width = bw; tela.height = bh; }
      if (!buffer.current) buffer.current = document.createElement("canvas");
      if (buffer.current.width !== bw) { buffer.current.width = bw; buffer.current.height = bh; }
    };
    adattaRef.current = adatta;
    const ro = new ResizeObserver(adatta);
    ro.observe(el);
    adatta();
    return () => ro.disconnect();
  }, []);

  // la qualità cambiata dalle opzioni (nel menu, mentre il trailer è sul suo ultimo fotogramma) vale subito
  useEffect(() => ascoltaOpzioni((o) => {
    if (o.qualita === grafica.current) return;
    grafica.current = o.qualita;
    qualita.current = fattoreDi(o.qualita);
    tetto.current = tettoDi(o.qualita);
    adattaRef.current();
  }), []);

  // font (servono al canvas) + tele precalcolate, poi si parte. La preparazione è già cominciata
  // durante i loghi (vedi App.tsx): qui si aspetta soltanto che finisca.
  useEffect(() => {
    let vivo = true;
    avviaPreparazione().then(() => { if (vivo) setPronto(true); });
    const smetti = seguiPreparazione((k) => { if (vivo) setCarica(k); });
    return () => { vivo = false; smetti(); };
  }, []);

  // la colonna si crea subito, così il brano si precarica prima del tasto audio. La voce di Enzo si carica sempre:
  // legge il trailer sopra la musica solo con la voce recitata (lib/opzioni.ts), e il modo si guarda dal vivo,
  // così cambiarlo nelle opzioni del menu vale già per «rivedi il trailer»; i volumi li applica il bus sonoro
  useEffect(() => {
    const base = `${import.meta.env.BASE_URL}voce/`;
    suono.current = new ColonnaSonora(branoIntro, { traccia: `${base}trailer.opus`, scaletta: `${base}trailer.json` });
    // Sul desktop l'audio parte da solo (Electron permette l'autoplay): il
    // trailer è il primo schermo del gioco, non una pagina web.
    // Nel browser il gesto che ha chiuso l'avviso (clic o Invio) è passato PRIMA che il trailer
    // esistesse: se la pagina ha già avuto un gesto, il browser lascia partire la musica anche ora.
    const giaSbloccato = !!(navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation?.hasBeenActive;
    if (inDesktop() || giaSbloccato) { suono.current.attiva(); setAudio(true); }
    return () => { suono.current?.chiudi(); suono.current = null; };
  }, []);

  // ── il fotogramma ──────────────────────────────────────────────────
  const disegna = useCallback((t: number) => {
    const tela = telaRef.current, buf = buffer.current;
    if (!tela || !buf) return;
    const ctx = tela.getContext("2d")!;
    const k = tela.width / W;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, tela.width, tela.height);
    const bctx = buf.getContext("2d")!;
    for (const s of SCENE) {
      const p = presenza(s, t);
      if (p <= 0) continue;
      if (p >= 1) {
        ctx.save(); ctx.setTransform(k, 0, 0, k, 0, 0);
        disegnaScena(ctx, s.id, t, cacheTrailer);
        ctx.restore();
      } else {
        // dissolvenza: la scena si compone a parte e si posa con la sua opacità
        bctx.setTransform(1, 0, 0, 1, 0, 0);
        bctx.clearRect(0, 0, buf.width, buf.height);
        bctx.save(); bctx.setTransform(k, 0, 0, k, 0, 0);
        disegnaScena(bctx, s.id, t, cacheTrailer);
        bctx.restore();
        ctx.save(); ctx.globalAlpha = p; ctx.drawImage(buf, 0, 0); ctx.restore();
      }
    }

    // i veli dietro le parole chiave
    for (const v of VELI) {
      const el = extraRef.current[v.id];
      if (el) el.style.opacity = String(inviluppo(t, v.da, v.a, v.entra, v.esce) * v.alfa);
    }

    // testi
    for (const c of CUES) {
      const el = cueRef.current[c.id];
      if (!el) continue;
      const v = inviluppo(t, c.da, c.a, c.entra ?? 0.7, c.esce ?? 0.5);
      if (v <= 0) { if (el.style.visibility !== "hidden") el.style.visibility = "hidden"; continue; }
      el.style.visibility = "visible";
      const uscita = easeIn(seg(t, c.a - (c.esce ?? 0.5), c.a));
      el.style.opacity = String(c.tipo === "maschera" ? 1 - uscita : v);
      el.style.filter = uscita > 0 ? `blur(${uscita * 6}px)` : "none";
      el.style.transform = uscita > 0 ? `translateY(${-uscita * 14}px)` : "none";
      el.querySelectorAll<HTMLElement>("[data-riga]").forEach((r, i) => {
        const t0 = c.da + i * (c.sfalsa ?? 0.12);
        const e = expoOut(seg(t, t0, t0 + (c.entra ?? 0.9)));
        if (c.tipo === "maschera") r.style.transform = `translateY(${(1 - e) * 105}%)`;
        else if (c.tipo === "timbro") { r.style.transform = `scale(${1 + (1 - e) * 0.18})`; r.style.opacity = String(e); }
        else { r.style.transform = `translateY(${(1 - e) * 18}px)`; r.style.filter = e < 1 ? `blur(${(1 - e) * 8}px)` : "none"; }
      });
    }

    // A · la didascalia battuta a macchina
    const dida = extraRef.current.dida, testo = extraRef.current.didaTesto;
    if (dida && testo) {
      const frase = inglese.current ? "The letters have stopped coming." : "Le lettere hanno smesso di arrivare.";
      dida.style.opacity = String(inviluppo(t, 4.9, 9.2, 0.2, 0.6));
      const n = Math.floor(clamp(seg(t, 5.0, 6.6)) * frase.length);
      if (testo.textContent !== frase.slice(0, n)) testo.textContent = frase.slice(0, n);
    }

    // E · il contatore delle tappe
    const cont = extraRef.current.tappe;
    if (cont) {
      cont.style.opacity = String(inviluppo(t, TAPPE_T0 - 0.2, 48.7, 0.5, 0.5));
      const n = tappaCorrente(t);
      const txt = t > TAPPE_T0 + 7 * TAPPE_PASSO ? (inglese.current ? "home" : "casa") : `${inglese.current ? "stage" : "tappa"} 0${Math.max(1, n)} · 07`;
      if (cont.textContent !== txt) cont.textContent = txt;
    }

    // F · le cinque colonne: salgono, poi i segni si disegnano
    CINQUE.forEach((_, i) => {
      const col = extraRef.current["col" + i];
      if (!col) return;
      const t0 = CINQUE_T0 + i * CINQUE_PASSO;
      const e = expoOut(seg(t, t0, t0 + 0.9));
      col.style.opacity = String(e * (1 - easeIn(seg(t, 58.9, 59.5))));
      col.style.transform = `translateY(${(1 - e) * 60}px)`;
      const tratto = easeOut(seg(t, t0 + 0.1, t0 + 1.3));
      col.querySelectorAll<SVGPathElement>("path").forEach((p) => {
        if (p.dataset.riempi) p.style.opacity = String(clamp((tratto - 0.4) * 1.6) * 0.32);
        else p.style.strokeDashoffset = String(1 - tratto);
      });
    });

    // I · i numeri che contano
    const num = extraRef.current.numeri;
    if (num) {
      num.style.opacity = String(inviluppo(t, 77.2, 81.7, 0.5, 0.6));
      const e = easeOut(seg(t, 77.5, 79.0));
      STATS.forEach((s, i) => {
        const el = extraRef.current["n" + i];
        const txt = String(Math.round(s.n * e));
        if (el && el.textContent !== txt) el.textContent = txt;
      });
    }

    // J · il titolo: il tracking si stringe, la luce ci passa sopra
    const tit = extraRef.current.titolo, sub = extraRef.current.sottotitolo, velo = extraRef.current.velo;
    if (velo) velo.style.opacity = String(clamp(seg(t, 82.2, 84.0)));
    if (tit && sub) {
      const e = expoOut(seg(t, 82.3, 84.6));
      tit.style.opacity = String(clamp(seg(t, 82.3, 82.65)));   // sul colpo grave del brano (82,21 · 82,61); poi spaziatura e sfocatura si assestano
      tit.style.letterSpacing = `${0.5 - e * 0.36}em`;
      tit.style.filter = e < 1 ? `blur(${(1 - e) * 14}px)` : "none";
      tit.style.backgroundPosition = `${100 - seg(t, 83.4, 85.8) * 100}% 0`;
      sub.style.opacity = String(clamp(seg(t, 84.3, 85.4)));
    }
    // il nome dell'autore, ultimo: resta sul menu d'avvio
    const aut = extraRef.current.autore;
    if (aut) aut.style.opacity = String(clamp(seg(t, 85.1, 86.3)));

    // letterbox: si apre sul titolo
    const apre = easeOut(seg(t, 81.8, 84.2));
    const bs = extraRef.current.bandaSu, bg = extraRef.current.bandaGiu;
    if (bs && bg) {
      const h = BANDA * (1 - apre) * clamp(seg(t, 0, 0.9) + (startAtEnd ? 1 : 0));
      bs.style.height = h + "px"; bg.style.height = h + "px";
    }
    const ctr = extraRef.current.controlli;
    if (ctr) ctr.style.opacity = String(1 - apre);
    const barra = extraRef.current.barra;
    if (barra) barra.style.transform = `scaleX(${clamp(t / DURATA)})`;

    // la grana cambia a 24 fotogrammi al secondo, dal tempo del trailer (sul menu, fermo, dal tempo vero)
    const quadro = Math.floor((t >= DURATA ? performance.now() / 1000 : t) * FOTOGRAMMI_GRANA);
    if (quadro !== granaQuadro.current) {
      granaQuadro.current = quadro;
      const [ox, oy] = scostamentoGrana(quadro), dpr = pixelVeri.current;
      for (const el of [granaDolceRef.current, granaForteRef.current]) if (el) el.style.backgroundPosition = `${-ox / dpr}px ${-oy / dpr}px`;
    }
  }, [startAtEnd]);

  // solo in sviluppo: posizionare il tempo per controllare le inquadrature, e misurare quanto costa un fotogramma
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const w = window as unknown as { __trailer?: object };
    w.__trailer = {
      vai: (t: number) => { tRef.current = t; pausaRef.current = true; setFinito(t >= DURATA); },
      riprendi: () => { pausaRef.current = false; },
      tetto: (n: number) => { tetto.current = n; adattaRef.current(); return telaRef.current?.width ?? 0; },
      t: () => tRef.current,
      brano: () => suono.current?.diagnosi(),
      // disegna n fotogrammi consecutivi da t e restituisce i millisecondi (la lettura di un pixel costringe la GPU a finire)
      // (la sincronia passa da WebGL: leggere i pixel dal canvas 2D farebbe passare Chrome al disegno su CPU e falserebbe la misura)
      prova: (t: number, n = 30) => {
        const tela = telaRef.current;
        if (!tela) return null;
        const r = creaMisuratore(tela)?.(disegna, t, n);
        return r && { mediana: +r.mediana.toFixed(1), p95: +r.p95.toFixed(1), max: +r.max.toFixed(1) };
      },
    };
    return () => { delete w.__trailer; };
  }, [disegna]);

  // ── la tela più grande, se il computer la regge ────────────────────────
  // Fino a 2560 px di larghezza non c'è niente da scegliere. Uno schermo più grande (4K) ne vorrebbe di più: si prova la
  // larghezza maggiore sulle inquadrature più pesanti e la si tiene solo se la peggiore costa meno di SOGLIA_MS; se no si
  // scende al gradino dopo, fino al tetto di sempre. Dura una frazione di secondo e avviene prima che il tempo cominci a scorrere.
  useEffect(() => {
    if (!pronto || grafica.current !== "automatica") return;   // le altre qualità non si misurano: le ha scelte chi gioca
    if (import.meta.env.DEV && !location.search.includes("calibra")) return;   // in sviluppo catture e misure scelgono da sé (__trailer.tetto)
    const el = palcoRef.current, tela = telaRef.current;
    if (!el || !tela) return;
    const voluta = Math.round(el.clientWidth * Math.min(window.devicePixelRatio || 1, 2));
    const candidate = [...new Set([Math.min(voluta, TELE_GRANDI[0]), ...TELE_GRANDI])].filter((l) => l > TETTO_TELA && l <= voluta);
    if (!candidate.length) return;
    const misura = creaMisuratore(tela);
    let scelta = TETTO_TELA;
    const provati: string[] = [];
    if (misura) {
      for (const larg of candidate) {
        tetto.current = larg; adattaRef.current();
        misura(disegna, ISTANTI_PESANTI[0], 4);                         // il primo fotogramma di una tela nuova paga l'allocazione
        let peggiore = 0;
        for (const t of ISTANTI_PESANTI) {
          misura(disegna, t, 2);
          peggiore = Math.max(peggiore, misura(disegna, t, 5).mediana);
          if (peggiore > SOGLIA_MS) break;
        }
        provati.push(`${larg}: ${peggiore.toFixed(1)} ms`);
        if (peggiore <= SOGLIA_MS) { scelta = larg; break; }
      }
    }
    tetto.current = scelta; adattaRef.current();
    if (import.meta.env.DEV) console.info(`[trailer] tela di ${tela.width} px (voluta ${voluta}; provate: ${provati.join(", ") || "nessuna"}; soglia ${SOGLIA_MS} ms)`);
  }, [pronto, disegna]);

  // ── l'orologio ────────────────────────────────────────────────────
  useEffect(() => {
    if (!pronto) return;
    let raf = 0, prec = performance.now(), finePrec = startAtEnd, giri = 0, lento = 0;
    const passo = (ora: number) => {
      const grezzo = ora - prec;
      const dt = Math.min(0.1, grezzo / 1000);
      prec = ora;
      const fermo = pausaRef.current || document.hidden;
      if (!fermo) {
        // con il brano in riproduzione è lui l'orologio: la pellicola lo insegue.
        // Uno scarto grande vuol dire un salto appena comandato (rivedi, salta):
        // allora vale il tempo della pellicola e aggiorna() riposiziona il brano.
        const tm = suono.current?.orologio();
        tRef.current = tm != null && Math.abs(tm - tRef.current) < 0.5 ? tm : tRef.current + dt;
        // passati i primi due secondi, se i fotogrammi restano lenti a lungo si scende di risoluzione
        if (++giri > 120) {
          lento = grezzo > 36 ? lento + 1 : Math.max(0, lento - 1);
          if (lento > 50 && qualita.current > 0.5 && grafica.current === "automatica") { qualita.current -= 0.25; lento = 0; adattaRef.current(); }
        }
      }
      const t = tRef.current;
      disegna(t);
      suono.current?.aggiorna(t, fermo);
      if (!finePrec && t >= DURATA) { finePrec = true; setFinito(true); }
      if (finePrec && t < DURATA) finePrec = false;
      raf = requestAnimationFrame(passo);
    };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
  }, [pronto, disegna, startAtEnd]);

  // ── comandi ───────────────────────────────────────────────────────
  const salta = useCallback(() => {
    tRef.current = Math.max(tRef.current, DURATA);
    pausaRef.current = false;
    setFinito(true);
  }, []);
  const rivedi = () => { tRef.current = 0; pausaRef.current = false; setFinito(false); };
  const commutaAudio = useCallback(() => {
    if (!suono.current) suono.current = new ColonnaSonora();
    if (suono.current.attivo) { suono.current.spegni(); setAudio(false); }
    else { suono.current.attiva(); setAudio(true); }
  }, []);

  // Durante il trailer un solo tasto: Esc lo salta. Nel browser, il primo gesto
  // (tasto o clic) accende anche la musica: i browser non la lasciano partire da sola.
  useEffect(() => {
    const tasto = (e: KeyboardEvent) => {
      if (taccuino || guida || opzioniAperte || trofeiAperti || domandaNuovo) return;   // i pannelli gestiscono Esc da sé
      if (e.key === "Escape" && finito && extra) { e.preventDefault(); setExtra(false); return; }   // da Extra si torna al menu
      if (e.key === "Escape" && !finito) { e.preventDefault(); salta(); }
    };
    window.addEventListener("keydown", tasto);
    return () => window.removeEventListener("keydown", tasto);
  }, [finito, salta, guida, taccuino, opzioniAperte, trofeiAperti, domandaNuovo, extra]);

  useEffect(() => {
    if (inDesktop()) return;
    const accendi = () => {
      if (suono.current && !suono.current.attivo) { suono.current.attiva(); setAudio(true); }
      window.removeEventListener("keydown", accendi); window.removeEventListener("pointerdown", accendi);
    };
    window.addEventListener("keydown", accendi); window.addEventListener("pointerdown", accendi);
    return () => { window.removeEventListener("keydown", accendi); window.removeEventListener("pointerdown", accendi); };
  }, []);

  // il salvataggio più recente, per «continua»
  useEffect(() => { if (finito) piuRecente().then(setUltimo).catch(() => setUltimo(null)); }, [finito, taccuino]);

  const reg = (id: string) => (el: HTMLElement | null) => { extraRef.current[id] = el; };
  // palco molto piccolo (telefono in verticale): i comandi escono dal palco, a misura d'uomo
  const compatto = scala < 0.5;
  const bottoneCompatto: React.CSSProperties = {
    cursor: "pointer", border: "1px solid rgba(255,255,255,.2)", background: "rgba(255,255,255,.04)",
    color: "#c9d2de", fontFamily: FONT.mono, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", padding: "10px 16px", borderRadius: 999,
  };
  // dove riprende «Continua»: il nome (se non è quello del luogo), il luogo, il tempo di gioco (o il turno, per i salvataggi di prima)
  const dettaglioContinua = (u: Salvataggio) => {
    const nome = nomeVisibile({ posto: u.posto, dati: u });
    return [nome !== u.riassunto.luogo ? nome : null, u.riassunto.luogo, u.tempoMs !== undefined ? durataLeggibile(u.tempoMs) : tr(`turno ${u.riassunto.turno}`, `turn ${u.riassunto.turno}`)]
      .filter(Boolean).join(" · ");
  };
  // le voci del menu d'avvio: «Continua» solo se c'è un viaggio salvato; «Nuovo viaggio» allora chiede conferma (D4)
  const vociMenu: VoceMenu[] = [
    ...(ultimo ? [{ id: "continua", etichetta: tr("Continua il viaggio", "Continue the journey"), dettaglio: dettaglioContinua(ultimo), principale: true, azione: () => onLaunch(ultimo) }] : []),
    { id: "nuovo", etichetta: ultimo ? tr("Nuovo viaggio", "New journey") : tr("Inizia il viaggio", "Start the journey"), principale: !ultimo, azione: () => (ultimo ? setDomandaNuovo(true) : onLaunch(null)) },
    { id: "carica", etichetta: tr("Carica un viaggio", "Load a journey"), azione: () => setTaccuino(true) },
    { id: "trofei", etichetta: tr("Trofei", "Trophies"), azione: () => setTrofeiAperti(true) },
    { id: "opzioni", etichetta: tr("Opzioni", "Options"), azione: () => setOpzioniAperte(true) },
    { id: "guida", etichetta: tr("Come si gioca", "How to play"), azione: () => setGuida(true) },
    { id: "extra", etichetta: tr("Extra", "Extras"), azione: () => { setNotaExtra(null); setExtra(true); } },
    ...(inDesktop() ? [{ id: "esci", etichetta: tr("Esci", "Quit"), azione: esciDalGioco }] : []),
  ];
  // Extra, le cose di contorno (il menu d'avvio resta corto): la colonna sonora ufficiale (sul desktop si sceglie la
  // cartella, nel browser si scarica uno ZIP), il trailer da rivedere, i due siti
  const scaricaColonna = () => {
    setNotaExtra(tr("Un momento…", "One moment…"));
    scaricaColonnaSonora()
      .then((e) => setNotaExtra(e.tipo === "cartella" ? tr(`Salvata in ${e.dove}`, `Saved in ${e.dove}`) : e.tipo === "zip" ? tr(`Scaricata: ${e.nome}`, `Downloaded: ${e.nome}`) : null))
      .catch((err) => setNotaExtra(tr("Non è stato possibile: ", "It could not be done: ") + (err instanceof Error ? err.message : String(err))));
  };
  // sul desktop il link esce dalla finestra e va nel browser di sistema (desktop/main.cjs, setWindowOpenHandler)
  const apriSito = (indirizzo: string, nome: string) => {
    window.open(indirizzo, "_blank", "noopener,noreferrer");
    setNotaExtra(tr(`Aperto nel browser: ${nome}`, `Opened in the browser: ${nome}`));
  };
  // i trofei vinti nell'ultimo turno di una partita: sul menu, uno alla volta, col suono flautato (come in partita)
  const [cartiglio, setCartiglio] = useState<DatiCartiglio | null>(null);
  const daAnnunciare = useRef(annuncia);
  daAnnunciare.current = annuncia;
  const annunciati = useRef(onAnnunciati);
  annunciati.current = onAnnunciati;
  useEffect(() => {
    const fila = daAnnunciare.current;
    if (!finito || !fila.length) return;
    const timer: number[] = [];
    const uno = (i: number) => {
      const id = fila[i];
      setCartiglio({ n: i + 1, testo: PER_ID.get(id)?.nome ?? id, trofeo: true });
      suonaTrofeo();
      if (i + 1 < fila.length) timer.push(window.setTimeout(() => uno(i + 1), DURATA_TROFEO + 300));
      else timer.push(window.setTimeout(() => annunciati.current?.(), DURATA_TROFEO));
    };
    timer.push(window.setTimeout(() => uno(0), 1400));   // quando il menu è comparso
    return () => timer.forEach((t) => window.clearTimeout(t));
  }, [finito]);

  const vociExtra: VoceMenu[] = [
    { id: "colonna", etichetta: tr("Scarica la colonna sonora ufficiale", "Download the official soundtrack"),
      dettaglio: tr("Il Viaggiatore Official Soundtrack · The Runtimers · otto brani", "Il Viaggiatore Official Soundtrack · The Runtimers · eight tracks"), principale: true, azione: scaricaColonna },
    // finito il trailer si torna al menu d'avvio, non a Extra
    { id: "rivedi", etichetta: tr("Rivedi il trailer", "Watch the trailer again"), azione: () => { setExtra(false); setNotaExtra(null); rivedi(); } },
    // i crediti (e l'attribuzione delle voci ElevenLabs) restano raggiungibili anche da chi non arriva in fondo
    ...(onTitoli ? [{ id: "titoli", etichetta: tr("Titoli di coda", "Credits"), azione: onTitoli }] : []),
    { id: "favella", etichetta: "favella.eu", azione: () => apriSito("https://favella.eu/", "favella.eu") },
    { id: "ecosystem", etichetta: "ecosystem.runtimeradio.com", azione: () => apriSito("https://ecosystem.runtimeradio.com/", "ecosystem.runtimeradio.com") },
    { id: "indietro", etichetta: tr("Indietro", "Back"), tasto: "Esc", azione: () => setExtra(false) },
  ];

  return (
    <div style={{ position: "relative", height: "100%", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#000", overflow: "hidden" }}>
      <div ref={palcoRef} style={{ position: "relative", overflow: "hidden", width: "min(100vw, calc(100dvh * 16 / 9))", height: "min(100dvh, calc(100vw * 9 / 16))", background: "#000" }}>
        <canvas ref={telaRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />

        {/* la pellicola: vignetta e grana, sopra il disegno e sotto testi e comandi. Stanno fuori dalla superficie scalata, che
            isolerebbe il fondersi (mix-blend-mode) dal disegno; la tessera ha un pixel vero per grano, a ogni schermo */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 95% at 50% 48%, transparent 55%, rgba(0,0,0,.55) 100%)", pointerEvents: "none" }} />
        {(["dolce", "forte"] as const).map((strato) => (
          <div key={strato} ref={strato === "dolce" ? granaDolceRef : granaForteRef} data-grana="1" aria-hidden="true" style={{
            position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: `url(${grana})`,
            backgroundSize: `${LATO_GRANA / pixelVeri.current}px ${LATO_GRANA / pixelVeri.current}px`,
            opacity: OPACITA_GRANA[strato], mixBlendMode: strato === "dolce" ? "soft-light" : "overlay",
          }} />
        ))}

        {/* superficie di progetto 1920×1080 per testi e controlli */}
        <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transform: `scale(${scala})`, transformOrigin: "0 0", pointerEvents: "none" }}>

          {/* le tele si dipingono a pezzi mentre girano i loghi; su un computer lento possono servire ancora un momento */}
          {!pronto && (
            <div style={{ position: "absolute", left: 0, right: 0, top: 500, textAlign: "center", opacity: 0, animation: "kf-on .8s ease .7s forwards" }}>
              <div style={mono(20, { color: "rgba(214,224,238,.62)", letterSpacing: "0.42em" })}>{tr("PREPARO IL VIAGGIO", "PREPARING THE JOURNEY")}</div>
              <div style={{ width: 340, height: 2, margin: "24px auto 0", background: "rgba(255,255,255,.12)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.max(6, Math.round(carica * 100))}%`, background: "#f0b77e", transition: "width .6s ease" }} />
              </div>
            </div>
          )}

          {/* i veli dietro le parole chiave */}
          {VELI.map((v) => (
            <div key={v.id} ref={reg(v.id)} aria-hidden="true" style={{
              position: "absolute", left: "50%", top: v.cy, width: v.w, height: v.h, transform: "translate(-50%, -50%)", pointerEvents: "none", opacity: 0,
              background: `radial-gradient(closest-side, rgba(${v.colore},1) 0%, rgba(${v.colore},.62) 45%, rgba(${v.colore},0) 100%)`,
            }} />
          ))}

          {/* testi */}
          {CUES.map((c) => (
            <div key={c.id} ref={(el) => { cueRef.current[c.id] = el; }} style={{ position: "absolute", visibility: "hidden", ...c.box }}>
              {c.righe.map((r, i) => (
                <div key={i} style={{ overflow: c.tipo === "maschera" ? "hidden" : "visible", paddingBottom: c.tipo === "maschera" ? "0.14em" : 0 }}>
                  <div data-riga style={{ ...r.stile, willChange: "transform" }}>{r.testo[lingua]}</div>
                </div>
              ))}
            </div>
          ))}

          {/* A · didascalia a macchina */}
          <div ref={reg("dida")} style={{ position: "absolute", left: 0, right: 0, top: 860, textAlign: "center", opacity: 0, ...mono(26, { letterSpacing: "0.04em", textTransform: "none", color: "#d7c6ae" }) }}>
            <span style={{ color: "#f0a867", marginRight: 16 }}>&gt;</span>
            <span ref={reg("didaTesto")} />
            <span style={{ display: "inline-block", width: 14, height: 30, marginLeft: 6, verticalAlign: -5, background: "#f0a867", animation: "kf-caret 1s step-end infinite" }} />
          </div>

          {/* E · contatore delle tappe */}
          <div ref={reg("tappe")} style={{ position: "absolute", left: 150, top: BANDA + 44, opacity: 0, ...mono(18, { color: "rgba(214,224,238,.6)" }) }} />

          {/* F · cinque colonne */}
          <div style={{ position: "absolute", left: 0, right: 0, top: 318, display: "flex", justifyContent: "center", gap: 12 }}>
            {CINQUE.map((c, i) => (
              <div key={c.nome} ref={reg("col" + i)} style={{ width: 330, textAlign: "center", opacity: 0, borderLeft: i ? "1px solid rgba(255,255,255,.07)" : "none" }}>
                <svg viewBox="0 0 120 120" width={196} height={196} style={{ display: "block", margin: "-14px auto -18px", overflow: "visible", filter: `drop-shadow(0 0 14px ${c.a}66)` }}>
                  {c.riempi.map((d, j) => <path key={"f" + j} d={d} fill={c.a} stroke="none" data-riempi="1" style={{ opacity: 0 }} />)}
                  {c.d.map((d, j) => <path key={j} d={d} pathLength={1} fill="none" stroke={c.a} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 1, strokeDashoffset: 1 }} />)}
                </svg>
                <div style={mono(17, { color: c.a, marginTop: 34 })}>{c.nome}</div>
                <div style={serif(56, { color: "#f1f3f7", fontStyle: "italic", marginTop: 20 })}>{c.verbo[lingua]}</div>
                <div style={serif(26, { color: "rgba(214,224,238,.55)", marginTop: 14 })}>{c.luogo[lingua]}</div>
              </div>
            ))}
          </div>

          {/* I · i numeri */}
          <div ref={reg("numeri")} style={{ position: "absolute", left: 0, right: 0, top: 360, display: "flex", justifyContent: "center", opacity: 0 }}>
            {STATS.map((s, i) => (
              // a misura del contenuto: le cifre (tabulari: ognuna è 1ch) hanno la larghezza del numero finale, così lo
              // spazio fra una cifra e il filetto è lo stesso in tutte le colonne e non si muove mentre si conta
              <div key={s.n} style={{ padding: "0 78px", textAlign: "center", borderLeft: i ? "1px solid rgba(255,255,255,.1)" : "none" }}>
                <div ref={reg("n" + i)} style={display(170, { fontWeight: 700, color: "#f4f1ea", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.04em", minWidth: `${String(s.n).length}ch` })}>0</div>
                <div style={mono(20, { color: "rgba(214,224,238,.6)", marginTop: 18 })}>{s.l[lingua]}</div>
              </div>
            ))}
          </div>

          {/* J · il titolo, su un velo scuro e morbido: sul cielo acceso dell'alba la scritta resta leggibile */}
          <div ref={reg("velo")} style={{
            position: "absolute", left: 0, right: 0, top: (finito ? TITOLO_SU_MENU : 262) - 62, height: 400, opacity: 0, pointerEvents: "none",
            background: "radial-gradient(48% 50% at 50% 50%, rgba(10,7,24,.6) 0%, rgba(10,7,24,.34) 52%, rgba(10,7,24,0) 100%)",
            transition: "top 1.1s cubic-bezier(.2,.7,.2,1)",
          }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: finito ? TITOLO_SU_MENU : 262, textAlign: "center", transition: "top 1.1s cubic-bezier(.2,.7,.2,1)" }}>
            <h1 ref={reg("titolo")} style={{
              // nowrap: all'inizio la spaziatura (0.5em) supera la larghezza del quadro;
              // senza, il titolo andrebbe a capo e tornerebbe su una riga (il «glitch»)
              margin: 0, ...display(156, { fontWeight: 800, letterSpacing: "0.14em" }), opacity: 0, whiteSpace: "nowrap",
              backgroundImage: "linear-gradient(100deg, #f4ece0 0%, #f4ece0 42%, #fffaf0 50%, #f4ece0 58%, #f4ece0 100%)",
              backgroundSize: "300% 100%", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
              textShadow: "0 0 60px rgba(255,190,130,.18)", paddingLeft: "0.14em",
            }}>IL VIAGGIATORE</h1>
            <div ref={reg("sottotitolo")} style={mono(22, { color: "#ffe0bd", fontWeight: 500, letterSpacing: "0.5em", marginTop: 26, opacity: 0, textShadow: "0 1px 3px rgba(20,8,10,.85), 0 1px 22px rgba(0,0,0,.85)" })}>{tr("un esperimento in favella 1", "an experiment in favella 1")}</div>
            <div ref={reg("autore")} style={serif(28, { color: "rgba(244,236,224,.86)", fontStyle: "italic", marginTop: 18, opacity: 0, textShadow: "0 1px 3px rgba(20,8,10,.85), 0 1px 22px rgba(0,0,0,.85)" })}>{tr("un gioco di Simone Pizzi", "a game by Simone Pizzi")}</div>
          </div>

          {/* letterbox */}
          <div ref={reg("bandaSu")} style={{ position: "absolute", left: 0, right: 0, top: 0, height: BANDA, background: "#000" }} />
          <div ref={reg("bandaGiu")} style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: BANDA, background: "#000" }} />
          {/* il menu d'avvio (piano 09, §4): sull'ultimo fotogramma, sotto il titolo, una colonna di voci */}
          {finito && !compatto && (
            <section style={{ position: "absolute", left: 0, right: 0, top: MENU_TOP, textAlign: "center", pointerEvents: "auto", animation: "kf-launch 1.2s ease .3s both" }}>
              <div style={{ position: "absolute", left: "50%", top: -190, width: 1760, height: 860, transform: "translateX(-50%)", background: "radial-gradient(50% 50% at 50% 50%, rgba(6,5,10,.86) 0%, rgba(6,5,10,.62) 52%, rgba(6,5,10,0) 100%)", pointerEvents: "none", zIndex: -1 }} />
              <p style={{ margin: 0, ...serif(36, { color: "rgba(244,236,224,.94)", fontStyle: "italic", textShadow: "0 1px 3px rgba(10,6,14,.85), 0 0 16px rgba(10,6,14,.7)" }) }}>{tr("Si parte a piedi.", "You set out on foot.")}</p>
              <div className="mv-avvio" style={{ marginTop: 30, fontSize: 19 * scalaTesto(opz) }}>
                {extra && <p style={{ margin: "0 0 .9em", ...mono(15, { color: "#f0b77e", letterSpacing: "0.34em", textShadow: "0 1px 3px rgba(10,6,14,.85)" }) }}>{tr("extra", "extras")}</p>}
                <VociMenu key={extra ? "extra" : "menu"} voci={extra ? vociExtra : vociMenu} etichetta={extra ? tr("Extra", "Extras") : tr("Menu d'avvio", "Start menu")} accento="#f0b77e"
                  coperto={guida || taccuino || opzioniAperte || trofeiAperti || domandaNuovo} />
                {extra && notaExtra && (
                  <p className="mv-nota" role="status" style={{ margin: "1.1em auto 0", maxWidth: "46em", ...serif(17, { color: "rgba(244,236,224,.8)", fontStyle: "italic", textShadow: "0 1px 3px rgba(10,6,14,.85)" }) }}>{notaExtra}</p>
                )}
              </div>
            </section>
          )}
          {finito && !compatto && (
            <div className="mv-nota" style={{ position: "absolute", left: 60, bottom: 46, ...mono(14, { color: "rgba(214,224,238,.34)", letterSpacing: "0.14em", textTransform: "none" }) }}>
              {tr("↑↓ scegli · Invio conferma", "↑↓ choose · Enter confirm")}
            </div>
          )}
          {finito && !compatto && (
            <div style={{ position: "absolute", right: 60, bottom: 46, ...mono(14, { color: "rgba(214,224,238,.34)", letterSpacing: "0.14em", textTransform: "none" }) }}>
              v{etichettaVersione(true)}
            </div>
          )}
          {/* i trofei dell'ultimo turno: il cartiglio del gioco, disegnato per 1280×720, qui ingrandito a 1920×1080 */}
          <div style={{ position: "absolute", left: 0, top: 0, width: 1280, height: 720, transform: "scale(1.5)", transformOrigin: "0 0", pointerEvents: "none" }}>
            <Cartiglio dati={cartiglio} accento="#f0b77e" />
          </div>
          {guida && !compatto && <ComeSiGioca base={19} onChiudi={() => setGuida(false)} />}
          {opzioniAperte && !compatto && <PannelloOpzioni base={19} onChiudi={() => setOpzioniAperte(false)} />}
          {trofeiAperti && !compatto && <PaginaTrofei base={19} onChiudi={() => setTrofeiAperti(false)} />}
          {domandaNuovo && !compatto && (
            <Domanda base={19} domanda={tr("Cominciare un viaggio nuovo?", "Start a new journey?")}
              sotto={tr("I salvataggi del taccuino restano. Il posto automatico si riscriverà al primo cambio di luogo.",
                "The saves in your notebook stay. The autosave slot will be overwritten at the first change of place.")}
              si={tr("sì, un viaggio nuovo", "yes, a new journey")} no="no"
              onSi={() => { setDomandaNuovo(false); onLaunch(null); }} onNo={() => setDomandaNuovo(false)} />
          )}
          {taccuino && !compatto && (
            <Taccuino base={19} modo="carica" puoSalvare={false} onCarica={(d) => { setTaccuino(false); onLaunch(d); }} onChiudi={() => setTaccuino(false)} />
          )}
        </div>
      </div>
      {guida && compatto && <ComeSiGioca base={14} compatto onChiudi={() => setGuida(false)} />}

      {/* telefono in verticale: comandi e avvio fuori dal palco, a dimensione normale */}
      {compatto && pronto && (
        <div style={{ position: "absolute", left: 16, right: 16, bottom: "max(24px, env(safe-area-inset-bottom))", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }}>
          {finito ? (
            <>
              <p style={{ margin: 0, fontFamily: FONT.serif, fontSize: 17, lineHeight: 1.45, color: "rgba(230,222,208,.8)", maxWidth: 340 }}>
                {tr("Si parte a piedi. Da qui in poi comandi tu: scrivi in italiano o scegli con i pulsanti. Il gioco rende meglio in orizzontale.",
                  "You set out on foot. From here on, you are in charge: you play with the buttons. The game looks better in landscape.")}
              </p>
              <button onClick={() => onLaunch(ultimo)} style={{ cursor: "pointer", border: "none", borderRadius: 999, padding: "14px 30px", fontFamily: FONT.display, fontWeight: 700, fontSize: 17, color: "#140c06", background: "#f0b77e", ["--gl" as string]: "rgba(240,183,126,.55)", animation: "kf-pulse 1.9s ease-in-out infinite" } as React.CSSProperties}>{ultimo ? tr("Continua il viaggio →", "Continue the journey →") : tr("Inizia il viaggio →", "Start the journey →")}</button>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setGuida(true)} style={{ ...bottoneCompatto, color: "#f0b77e" }}>{tr("? come si gioca", "? how to play")}</button>
                <button onClick={rivedi} style={bottoneCompatto}>{tr("↺ rivedi", "↺ watch again")}</button>
                <button onClick={commutaAudio} style={bottoneCompatto} aria-pressed={audio}>{audio ? tr("♪ sì", "♪ on") : tr("♪ no", "♪ off")}</button>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default Trailer;
