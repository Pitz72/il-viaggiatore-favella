// ====================================================================
//  E · LA MAPPA · SETTE TAPPE  (32.8 → 49.0s)
// --------------------------------------------------------------------
//  È la mappa del gioco, non un'altra: la «Carta fisica della provincia» che
//  si apre in partita (gioco/Mappa.tsx), con la stessa stampa (gioco/stampa.ts:
//  il mare a est, la Serra Alta, il Torrente Morto, il lago dell'invaso), le
//  stesse otto tappe nei loro posti (gioco/foglio.ts) e gli stessi segni della
//  mano: l'anello tratteggiato della tappa da raggiungere e pieno di quella
//  raggiunta, il disco rosso a mirino di «sei qui», le strade a penna ciascuna
//  col tratto della sua classe, il sale tratteggiato sul lago quando si arriva
//  all'invaso. Il viaggio va come nel gioco: da Acquaviva, a est, verso ovest,
//  e poi su fino ad Acquamorta; la penna lo percorre per le strade vere, una
//  tappa a ogni rintocco (TAPPE_T0, TAPPE_PASSO).
//  La carta (luoghi e strade) in partita la dà il motore; qui il motore non è
//  ancora avviato e se ne legge una copia (../carta.json: la riscrive
//  strumenti/carta-trailer.py, e collaudo/mappa.py pretende che sia uguale).
//  Fino alla 1.43.0 qui c'era una pergamena inventata, con le tappe in fila su
//  una diagonale e il viaggio verso est.
// ====================================================================
import { W, H, BANDA, TAPPE_T0, TAPPE_PASSO } from "../scaletta";
import { clamp, easeInOut, easeOut, inviluppo, lerp, seg, smoothstep } from "../tempo";
import { FONT } from "../font";
import { grana, inquadra, oscillaCamera, vignetta } from "../pittura";
import { inglese, tr } from "../../lib/lingua";
import type { Carta } from "../../lib/favellaRuntime";
import { ROOM_ZONE, ZONE_THEME, type ZoneKey } from "../../data/viaggiatore";
import { CARTIGLIO, CORPO_TAPPA, FOGLIO, RAGGIO_TAPPA, ROSA, TAPPE, ancoreTerreno, anello, disposizione, postoNome, type Classe, type Lato } from "../../gioco/foglio";
import { preparaStampa } from "../../gioco/stampa";
import type { Cache } from "../cache";
import cartaGioco from "../carta.json";

/** Indice 1..7 della tappa mostrata al tempo `t` (usato dal contatore in Trailer.tsx). */
export function tappaCorrente(t: number): number {
  return clamp(Math.floor((t - TAPPE_T0) / TAPPE_PASSO) + 1, 1, 7);
}

// i colori della mappa di partita (gioco/mappa.css)
const CARTA = "#dccfae", INCHIOSTRO = "#2d2216", TENUE = "#5a4a35", ROSSO = "#9a2418";
const ANIMA: Partial<Record<Classe, string>> = { statale: "#f0cf6e", provinciale: "#f3ead2" };
const BORDO: Partial<Record<Classe, number>> = { statale: 4.6, provinciale: 3.6 };
const SPESSORE: Record<Classe, number> = { statale: 2.2, provinciale: 1.6, strada: 2.2, sterrata: 1.6, traccia: 1.6, mulattiera: 1.6, sentiero: 1.2 };

/** Quanti pixel del quadro vale un'unità del foglio a campo intero: il foglio (1092 × 481) sta tutto dentro le fasce. */
const U = 1.6;
const OX = (W - FOGLIO.larghezza * U) / 2, OY = (H - FOGLIO.altezza * U) / 2;
/** Quanti pixel per unità ha la tela del foglio e la stampa (la macchina si avvicina fino a una volta e mezza). */
const FITTA = 2;

interface Pt { x: number; y: number }
/** Un tratto di strada nel verso del cammino, con le lunghezze cumulate. */
interface Tratto { pts: Pt[]; cum: number[]; classe: Classe }
/** Da una tappa alla successiva: i tratti, la lunghezza, i luoghi per cui si passa. */
interface Gamba { tratti: Tratto[]; lunga: number; luoghi: Pt[] }
interface TappaTrailer { zona: string; nome: string; x: number; y: number; anello: Path2D; lato: Lato; scosta: number }
interface StatoMappa {
  gambe: Gamba[]; tappe: TappaTrailer[];
  foglio: HTMLCanvasElement; stampa: HTMLImageElement | null; sale: HTMLImageElement | null; conStampa: boolean;
}

let stampaInArrivo: Promise<void> | null = null;
/** La stampa della carta si dipinge a fette in momenti liberi (gioco/stampa.ts): la preparazione del trailer la aspetta,
 *  ma non oltre qualche secondo; senza, la mappa mostra il foglio bianco con le tappe e la rotta. */
export function stampaMappaPronta(): Promise<void> {
  return Promise.race([stampaInArrivo ?? Promise.resolve(), new Promise<void>((ok) => setTimeout(ok, 6000))]);
}

function immagine(url: string): Promise<HTMLImageElement | null> {
  return new Promise((ok) => {
    const img = new Image();
    img.onload = () => ok(img);
    img.onerror = () => ok(null);
    img.src = url;
  });
}

/** Il foglio fermo: la carta, la stampa, le pieghe, il bordo scurito, il riquadro del cartiglio, la rosa dei venti. */
function componiFoglio(stampa: HTMLImageElement | null): HTMLCanvasElement {
  const tela = document.createElement("canvas");
  tela.width = FOGLIO.larghezza * FITTA; tela.height = FOGLIO.altezza * FITTA;
  const g = tela.getContext("2d");
  if (!g) return tela;
  const L = FOGLIO.larghezza, A = FOGLIO.altezza;
  g.scale(FITTA, FITTA);
  g.fillStyle = CARTA; g.fillRect(0, 0, L, A);
  if (stampa) g.drawImage(stampa, 0, 0, L, A);
  grana(g, 0, 0, L, A, 5200, "rgba(89,66,41,0.10)", 151);
  // le pieghe: in tre per il lungo, in due per il largo
  g.strokeStyle = "rgba(70,48,20,.22)"; g.lineWidth = 1.2;
  g.beginPath();
  for (const i of [1, 2]) { g.moveTo((L * i) / 3, 0); g.lineTo((L * i) / 3, A); }
  g.moveTo(0, A / 2); g.lineTo(L, A / 2);
  g.stroke();
  const bordo = g.createRadialGradient(L / 2, A / 2, L * 0.75 * 0.62, L / 2, A / 2, L * 0.75);
  bordo.addColorStop(0, "rgba(122,90,42,0)"); bordo.addColorStop(1, "rgba(122,90,42,.32)");
  g.fillStyle = bordo; g.fillRect(0, 0, L, A);
  if (stampa) {
    g.fillStyle = "rgba(230,220,192,.92)"; g.strokeStyle = "rgba(90,70,50,.8)"; g.lineWidth = 0.7;
    g.fillRect(CARTIGLIO.x0, CARTIGLIO.y0, CARTIGLIO.x1 - CARTIGLIO.x0, CARTIGLIO.y1 - CARTIGLIO.y0);
    g.strokeRect(CARTIGLIO.x0, CARTIGLIO.y0, CARTIGLIO.x1 - CARTIGLIO.x0, CARTIGLIO.y1 - CARTIGLIO.y0);
    g.lineWidth = 0.4; g.strokeRect(CARTIGLIO.x0 + 3, CARTIGLIO.y0 + 3, CARTIGLIO.x1 - CARTIGLIO.x0 - 6, CARTIGLIO.y1 - CARTIGLIO.y0 - 6);
  }
  // la rosa dei venti, sul mare
  g.save();
  g.translate(ROSA.cx, ROSA.cy); g.scale(ROSA.r / 34, ROSA.r / 34);
  g.globalAlpha = 0.75; g.strokeStyle = TENUE; g.fillStyle = TENUE; g.lineWidth = 1;
  g.beginPath(); g.arc(0, 0, 34, 0, Math.PI * 2); g.stroke();
  g.save(); g.lineWidth = 0.6; g.setLineDash([1.5, 3]); g.beginPath(); g.arc(0, 0, 27, 0, Math.PI * 2); g.stroke(); g.restore();
  g.beginPath(); g.moveTo(0, -44); g.lineTo(7, 0); g.lineTo(0, 44); g.lineTo(-7, 0); g.closePath(); g.stroke();
  g.beginPath(); g.moveTo(-44, 0); g.lineTo(0, -7); g.lineTo(44, 0); g.lineTo(0, 7); g.closePath(); g.stroke();
  g.beginPath(); g.moveTo(0, -44); g.lineTo(7, 0); g.lineTo(0, 0); g.closePath(); g.fill();
  g.font = `italic 15px ${FONT.serif}`; g.textAlign = "center"; g.fillText("N", 0, -52);
  g.restore();
  return tela;
}

export function preparaMappa(c: Cache) {
  if (c.mappa) return;
  const carta = cartaGioco as unknown as Carta;
  const zonaDi = (id: string) => ROOM_ZONE[id];
  const disp = disposizione(carta, zonaDi);
  // da una tappa alla successiva per le strade vere: il cammino più corto (per numero di luoghi)
  const vicini = new Map<string, string[]>();
  for (const [a, b] of carta.strade) {
    (vicini.get(a) ?? vicini.set(a, []).get(a)!).push(b);
    (vicini.get(b) ?? vicini.set(b, []).get(b)!).push(a);
  }
  const cammino = (da: string, a: string): string[] => {
    const prima = new Map<string, string | null>([[da, null]]), coda = [da];
    while (coda.length) {
      const id = coda.shift()!;
      if (id === a) break;
      for (const v of vicini.get(id) ?? []) if (!prima.has(v) && disp.posti.has(v)) { prima.set(v, id); coda.push(v); }
    }
    const out: string[] = [];
    for (let id: string | null = prima.has(a) ? a : null; id; id = prima.get(id) ?? null) out.unshift(id);
    return out.length ? out : [da, a];
  };
  const pt = (id: string): Pt => { const p = disp.posti.get(id); return p ? { x: p.cx, y: p.cy } : { x: 0, y: 0 }; };
  const tappeConPosto = TAPPE.filter((t) => disp.posti.has(t.luogo));
  const gambe: Gamba[] = tappeConPosto.slice(0, -1).map((t, i) => {
    const ids = cammino(t.luogo, tappeConPosto[i + 1].luogo);
    const tratti: Tratto[] = ids.slice(1).map((id, k) => {
      const da = ids[k], [p, q] = da < id ? [da, id] : [id, da];
      const tracciato = disp.tracciati.get(`${p}|${q}`);
      const pts: Pt[] = tracciato ? tracciato.campioni.map((s) => ({ x: s.cx, y: s.cy })) : [pt(p), pt(q)];
      if (da !== p) pts.reverse();
      const cum = [0];
      for (let j = 1; j < pts.length; j++) cum.push(cum[j - 1] + Math.hypot(pts[j].x - pts[j - 1].x, pts[j].y - pts[j - 1].y));
      return { pts, cum, classe: tracciato?.classe ?? "sterrata" };
    });
    return { tratti, lunga: tratti.reduce((s, x) => s + x.cum[x.cum.length - 1], 0), luoghi: ids.slice(1, -1).map(pt) };
  });
  const tappe: TappaTrailer[] = tappeConPosto.map((t) => {
    const p = pt(t.luogo), posto = disp.lati.tappe.get(t.luogo);
    return { zona: t.zona, nome: t.nome, x: p.x, y: p.y, anello: new Path2D(anello(p.x, p.y, RAGGIO_TAPPA, t.luogo)), lato: posto?.lato ?? "sopra", scosta: posto?.scosta ?? 0 };
  });
  const stato: StatoMappa = { gambe, tappe, foglio: componiFoglio(null), stampa: null, sale: null, conStampa: false };
  c.mappa = stato;
  const ancore = ancoreTerreno(disp);
  if (ancore) {
    stampaInArrivo = preparaStampa(ancore, FITTA)
      .then(async (s) => { stato.stampa = await immagine(s.url); stato.sale = s.sale ? await immagine(s.sale) : null; })
      .catch(() => undefined);
  }
}

/** Il punto a `d` unità dall'inizio di una gamba. */
function puntoSu(g: Gamba, d: number): Pt {
  let resto = clamp(d, 0, g.lunga);
  for (const tr0 of g.tratti) {
    const l = tr0.cum[tr0.cum.length - 1];
    if (resto <= l || tr0 === g.tratti[g.tratti.length - 1]) {
      let j = 1;
      while (j < tr0.cum.length - 1 && tr0.cum[j] < resto) j++;
      const k = clamp((resto - tr0.cum[j - 1]) / (tr0.cum[j] - tr0.cum[j - 1] || 1));
      return { x: lerp(tr0.pts[j - 1].x, tr0.pts[j].x, k), y: lerp(tr0.pts[j - 1].y, tr0.pts[j].y, k) };
    }
    resto -= l;
  }
  return g.tratti[0]?.pts[0] ?? { x: 0, y: 0 };
}

/** Il tracciato di un tratto fino a `d` unità (tutto, se `d` manca). */
function finoA(tr0: Tratto, d = Infinity): Path2D {
  const p = new Path2D();
  p.moveTo(tr0.pts[0].x, tr0.pts[0].y);
  for (let j = 1; j < tr0.pts.length; j++) {
    if (tr0.cum[j] <= d) { p.lineTo(tr0.pts[j].x, tr0.pts[j].y); continue; }
    const k = clamp((d - tr0.cum[j - 1]) / (tr0.cum[j] - tr0.cum[j - 1] || 1));
    p.lineTo(lerp(tr0.pts[j - 1].x, tr0.pts[j].x, k), lerp(tr0.pts[j - 1].y, tr0.pts[j].y, k));
    break;
  }
  return p;
}

const nomeDiTappa = (t: TappaTrailer) =>
  (inglese() && t.zona in ZONE_THEME ? ZONE_THEME[t.zona as ZoneKey].nomeEn.split(" · ")[0] : t.nome).toUpperCase();

export function disegnaMappa(ctx: CanvasRenderingContext2D, t: number, c: Cache) {
  preparaMappa(c);
  const m = c.mappa as StatoMappa;
  if (m.stampa && !m.conStampa) { m.foglio = componiFoglio(m.stampa); m.conStampa = true; }

  // dove sta la penna: un tratto per tappa; il cammino occupa i primi quattro quinti del passo, poi la penna sosta sulla tappa
  const k = (t - TAPPE_T0) / TAPPE_PASSO, n = m.gambe.length;
  const gi = clamp(Math.floor(k), 0, n - 1), fatta = k >= n ? 1 : easeInOut(clamp((k - gi) / 0.8));
  const percorsa = k <= 0 ? 0 : fatta * m.gambe[gi].lunga;
  const penna = k <= 0 ? { x: m.tappe[0].x, y: m.tappe[0].y } : puntoSu(m.gambe[gi], percorsa);
  const raggiunte = k < 0 ? 0 : Math.min(m.tappe.length, gi + 1 + (fatta >= 0.995 ? 1 : 0));

  // la macchina: segue la penna da vicino, poi si allarga su tutto il foglio
  const allarga = smoothstep(46.0, 48.4, t);
  const zoom = lerp(lerp(1.3, 1.55, smoothstep(32.8, 36.0, t)), 1, allarga);
  const mezzaL = W / 2 / zoom, mezzaA = (H / 2 - BANDA) / zoom;
  const stringi = (v: number, lo: number, hi: number) => (lo > hi ? (lo + hi) / 2 : clamp(v, lo, hi));
  const fx = lerp(stringi(OX + penna.x * U, OX + mezzaL - 70, OX + FOGLIO.larghezza * U - mezzaL + 70), W / 2, allarga);
  const fy = lerp(stringi(OY + penna.y * U, OY + mezzaA - 24, OY + FOGLIO.altezza * U - mezzaA + 24), H / 2, allarga);

  // il tavolo scuro sotto il foglio
  const tavolo = ctx.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 1200);
  tavolo.addColorStop(0, "#1a1410"); tavolo.addColorStop(1, "#080605");
  ctx.fillStyle = tavolo; ctx.fillRect(0, 0, W, H);

  ctx.save();
  inquadra(ctx, zoom, (W / 2 - fx) * zoom, (H / 2 - fy) * zoom);
  oscillaCamera(ctx, t, 1.0);
  // l'ombra del foglio sul tavolo, poi il foglio
  for (const [d, a] of [[26, 0.10], [16, 0.14], [8, 0.20], [3, 0.26]] as const) {
    ctx.fillStyle = `rgba(0,0,0,${a})`;
    ctx.fillRect(OX - d + 6, OY - d + 10, FOGLIO.larghezza * U + d * 2, FOGLIO.altezza * U + d * 2);
  }
  ctx.translate(OX, OY);
  ctx.scale(U, U);
  ctx.drawImage(m.foglio, 0, 0, FOGLIO.larghezza, FOGLIO.altezza);

  // il sale: con l'invaso raggiunto, la mano tratteggia il lago che la stampa dà ancora pieno
  const invaso = m.tappe.findIndex((x) => x.zona === "z3");
  if (m.sale && invaso >= 0) {
    const a = seg(t, TAPPE_T0 + invaso * TAPPE_PASSO, TAPPE_T0 + invaso * TAPPE_PASSO + 0.9);
    if (a > 0) { ctx.save(); ctx.globalAlpha = a; ctx.drawImage(m.sale, 0, 0, FOGLIO.larghezza, FOGLIO.altezza); ctx.restore(); }
  }

  // il cartiglio
  if (m.conStampa) {
    const cx = (CARTIGLIO.x0 + CARTIGLIO.x1) / 2;
    ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    ctx.font = `600 13px ${FONT.serif}`; ctx.letterSpacing = "3.9px"; ctx.fillStyle = "#3b2c20";
    ctx.fillText(tr("CARTA FISICA", "PHYSICAL MAP"), cx + 1.9, CARTIGLIO.y0 + 30);
    ctx.font = `italic 11px ${FONT.serif}`; ctx.letterSpacing = "0px"; ctx.fillStyle = "#5a4632";
    ctx.fillText(tr("della provincia", "of the province"), cx, CARTIGLIO.y0 + 47);
  }

  // le strade percorse, a penna: prima i bordi della statale e della provinciale, poi le anime, poi le strade semplici
  const fatti: { p: Path2D; classe: Classe }[] = [];
  if (k > 0) {
    for (let i = 0; i <= gi; i++) {
      let resto = i < gi ? Infinity : percorsa;
      for (const tr0 of m.gambe[i].tratti) {
        if (resto <= 0) break;
        fatti.push({ p: finoA(tr0, resto), classe: tr0.classe });
        resto -= tr0.cum[tr0.cum.length - 1];
      }
    }
  }
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.strokeStyle = INCHIOSTRO;
  for (const f of fatti) if (BORDO[f.classe]) { ctx.lineWidth = BORDO[f.classe]!; ctx.stroke(f.p); }
  for (const f of fatti) if (ANIMA[f.classe]) { ctx.strokeStyle = ANIMA[f.classe]!; ctx.lineWidth = SPESSORE[f.classe]; ctx.stroke(f.p); }
  ctx.strokeStyle = INCHIOSTRO;
  for (const f of fatti) if (!BORDO[f.classe]) { ctx.lineWidth = SPESSORE[f.classe]; ctx.stroke(f.p); }
  // i luoghi per cui si è passati
  ctx.fillStyle = INCHIOSTRO;
  if (k > 0) {
    for (let i = 0; i <= gi; i++) {
      const g = m.gambe[i];
      let fin = 0;
      g.tratti.forEach((tr0, j) => {
        fin += tr0.cum[tr0.cum.length - 1];
        if (j < g.luoghi.length && (i < gi || percorsa >= fin)) { ctx.beginPath(); ctx.arc(g.luoghi[j].x, g.luoghi[j].y, 3.4, 0, Math.PI * 2); ctx.fill(); }
      });
    }
  }

  // le tappe: l'anello tracciato a mano (tratteggiato finché non ci si arriva) e il nome in maiuscoletto
  m.tappe.forEach((tp, i) => {
    const raggiunta = i < raggiunte;
    const quando = TAPPE_T0 + i * TAPPE_PASSO - (i ? TAPPE_PASSO * 0.2 : 0);
    const colpo = raggiunta ? 1 - easeOut(seg(t, quando, quando + 0.5)) : 0;       // l'anello si allarga un attimo quando ci si arriva
    ctx.save();
    ctx.translate(tp.x, tp.y); ctx.scale(1 + colpo * 0.35, 1 + colpo * 0.35); ctx.translate(-tp.x, -tp.y);
    ctx.strokeStyle = raggiunta ? INCHIOSTRO : TENUE; ctx.lineWidth = raggiunta ? 1.8 : 1.2;
    ctx.setLineDash(raggiunta ? [] : [3, 2.5]);
    ctx.stroke(tp.anello);
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(tp.x, tp.y, raggiunta ? 4 : 3, 0, Math.PI * 2);
    if (raggiunta) { ctx.fillStyle = INCHIOSTRO; ctx.fill(); } else { ctx.lineWidth = 1; ctx.stroke(); }
    ctx.restore();
    const p = postoNome({ cx: tp.x, cy: tp.y, lato: tp.lato, scosta: tp.scosta, raggio: RAGGIO_TAPPA }, CORPO_TAPPA);
    ctx.font = `600 ${CORPO_TAPPA}px ${FONT.serif}`; ctx.letterSpacing = "1.2px";
    ctx.textAlign = p.ancora === "middle" ? "center" : p.ancora === "start" ? "left" : "right"; ctx.textBaseline = "alphabetic";
    ctx.strokeStyle = CARTA; ctx.lineWidth = 3.2; ctx.lineJoin = "round";
    const nome = nomeDiTappa(tp);
    ctx.strokeText(nome, p.x, p.y);
    ctx.fillStyle = raggiunta ? INCHIOSTRO : TENUE;
    ctx.fillText(nome, p.x, p.y);
  });
  ctx.letterSpacing = "0px";

  // «sei qui»: il disco rosso con le quattro tacche a mirino e l'alone che respira, sulla punta della penna
  if (t >= TAPPE_T0 - 0.6) {
    const entra = seg(t, TAPPE_T0 - 0.6, TAPPE_T0 - 0.1);
    const giro = (((t / 2.4) % 1) + 1) % 1, a = giro < 0.8 ? 0.85 * (1 - giro / 0.8) : 0;
    ctx.save();
    ctx.globalAlpha = entra;
    ctx.strokeStyle = ROSSO; ctx.lineWidth = 1.6; ctx.globalAlpha = entra * a;
    ctx.beginPath(); ctx.arc(penna.x, penna.y, 8 * lerp(0.7, 2.1, Math.min(1, giro / 0.8)), 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = entra;
    ctx.strokeStyle = INCHIOSTRO; ctx.lineWidth = 1.4; ctx.lineCap = "butt";
    ctx.beginPath();
    for (const [x0, y0, x1, y1] of [[0, -7, 0, -9.5], [7, 0, 9.5, 0], [0, 7, 0, 9.5], [-7, 0, -9.5, 0]]) { ctx.moveTo(penna.x + x0, penna.y + y0); ctx.lineTo(penna.x + x1, penna.y + y1); }
    ctx.stroke();
    ctx.fillStyle = ROSSO; ctx.strokeStyle = CARTA; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.arc(penna.x, penna.y, 5.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  // un velo scuro in alto, solo mentre c'è la scritta chiara «Sette tappe fino a casa.» (33,6 → 36,1), e una targhetta scura
  // sotto il contatore delle tappe, in basso a sinistra (Trailer.tsx)
  const velo = inviluppo(t, 33.0, 36.5, 0.8, 0.6);
  if (velo > 0) {
    const gAlto = ctx.createLinearGradient(0, BANDA, 0, BANDA + 260);
    gAlto.addColorStop(0, `rgba(12,9,7,${0.86 * velo})`);
    gAlto.addColorStop(0.5, `rgba(12,9,7,${0.6 * velo})`);
    gAlto.addColorStop(1, "rgba(12,9,7,0)");
    ctx.fillStyle = gAlto;
    ctx.fillRect(0, 0, W, BANDA + 260);
  }
  const targa = inviluppo(t, TAPPE_T0 - 0.2, 48.7, 0.5, 0.5);
  if (targa > 0) {
    ctx.fillStyle = `rgba(14,10,8,${0.7 * targa})`;
    ctx.beginPath(); ctx.roundRect(126, H - BANDA - 92, 300, 50, 8); ctx.fill();
  }
  vignetta(ctx, 0.4);
}
