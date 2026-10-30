// ====================================================================
//  La mappa (pulsante «mappa» o tasto M, solo con la mappa in bisaccia).
// --------------------------------------------------------------------
//  Un foglio di carta con le strade segnate a penna, come dice la descrizione
//  nel gioco: la mappa della provincia. Ci sono fin dall'inizio le tappe del
//  viaggio (le sette zone e Acquamorta), ciascuna col suo nome; le strade, no:
//  si fanno camminando. Camminando si riempie: i luoghi in cui sei stato,
//  uniti dal tragitto, ogni strada col tratto della sua classe (la statale a
//  doppio filo con l'anima gialla, la provinciale bianca, le sterrate, i
//  sentieri); il luogo dove sei, in rosso e a mirino; quelli che da lì si
//  vedono, solo accennati col loro nome.
//  Si apre come una carta piegata in tre che si spiega (con un fruscio di carta,
//  suonaCarta.ts) e si richiude in un attimo; con il movimento ridotto compare
//  e basta. Non si tocca niente: la mappa orienta, non porta da nessuna parte e
//  non spende un turno. Esc o M la chiudono. Che cosa va sul foglio e dove vanno
//  i nomi lo decide foglio.ts, che i collaudi provano.
// ====================================================================
import { useEffect, useMemo, useRef, useState } from "react";
import type { Carta } from "../lib/favellaRuntime";
import { ROOM_ZONE, ZONE_THEME, type ZoneKey } from "../data/viaggiatore";
import { movimentoRidotto, scalaTesto } from "../lib/accessibilita";
import { useOpzioni } from "../lib/useOpzioni";
import { CARTIGLIO, CORPO_NOME, CORPO_TAPPA, RAGGIO_TAPPA, ROSA, ancoreTerreno, descrizione, disposizione, foglio, postoNome, type Classe } from "./foglio";
import { scalaStampa, useStampa } from "./stampa";
import { DURATA_APRE, DURATA_CHIUDE, suonaCarta } from "./suonoCarta";
import { useDialogo } from "./useDialogo";
import "./mappa.css";

const SERIF = "'Lora', Georgia, serif";
const MONO = "'Source Code Pro', ui-monospace, monospace";
/** Le classi di strada a doppio filo: un bordo d'inchiostro e un'anima chiara. */
const DOPPIE: ReadonlySet<Classe> = new Set(["statale", "provinciale"]);
/** Le quattro tacche del mirino attorno al luogo dove sei, da r 7 a r 9,5. */
const MIRINO: readonly [number, number, number, number][] = [[0, -7, 0, -9.5], [7, 0, 9.5, 0], [0, 7, 0, 9.5], [-7, 0, -9.5, 0]];
/** «L'invaso morto · il sale» → «L'invaso morto» */
const nomeBreve = (z: ZoneKey) => ZONE_THEME[z].nome.split(" · ")[0];

interface Props {
  base: number;
  accento?: string;
  carta: Carta;
  visitate: readonly string[];
  /** il luogo dove sei (l'id del motore) */
  qui: string | null;
  onChiudi: () => void;
}

export default function Mappa({ base, accento = "#f0b77e", carta, visitate, qui, onChiudi }: Props) {
  const [opz] = useOpzioni();
  const ridotto = movimentoRidotto(opz);
  // si apre spiegandosi (tre pieghe), poi resta un foglio solo; si chiude con un attimo di carta che si ripiega
  const [fase, setFase] = useState<"apre" | "aperta" | "chiude">(ridotto ? "aperta" : "apre");
  const chiudendo = useRef(false);
  const suonata = useRef(false);
  const chiudi = () => {
    if (chiudendo.current) return;
    chiudendo.current = true;
    suonaCarta("chiude");
    if (ridotto) { onChiudi(); return; }
    setFase("chiude");
    window.setTimeout(onChiudi, DURATA_CHIUDE);
  };
  useEffect(() => {
    if (!suonata.current) { suonata.current = true; suonaCarta("apre"); }
    if (fase !== "apre") return;
    const t = window.setTimeout(() => setFase((f) => (f === "apre" ? "aperta" : f)), DURATA_APRE);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const dialogo = useDialogo<HTMLDivElement>(chiudi);

  const f = useMemo(() => foglio(carta, visitate, qui, (id) => ROOM_ZONE[id]), [carta, visitate, qui]);
  // la stampa fisica (stampa.ts): pronta da prima, di solito; se no arriva con una dissolvenza. Con il contrasto alto non c'è.
  // Il cartiglio e quello che la carta dice a voce seguono la stampa: senza, è la mappa e basta.
  const alto = opz.contrasto === "alto";
  const ancore = useMemo(() => (alto ? null : ancoreTerreno(disposizione(carta, (id) => ROOM_ZONE[id]))), [carta, alto]);
  const { stampa, tardiva } = useStampa(ancore, scalaStampa(opz.qualita));
  const faseArrivo = useRef<string | null>(null);
  if (!tardiva) faseArrivo.current = null;
  else faseArrivo.current ??= fase;
  const dissolvi = tardiva && faseArrivo.current === fase;
  const conSale = !!stampa?.sale && f.tappe.some((t) => t.zona === "z3" && t.raggiunta);
  const d = useMemo(() => descrizione(f), [f]);
  const zonaQui = qui ? ROOM_ZONE[qui] : undefined;
  const posto = useMemo(() => new Map(f.luoghi.map((l) => [l.id, l])), [f]);

  /** Il disegno del foglio. Durante l'apertura se ne vedono tre copie, ciascuna con la sua piega (le definizioni dei filtri stanno fuori, una volta sola). */
  const disegno = (
    <svg viewBox={`0 0 ${f.larghezza} ${f.altezza}`} width="100%" role={fase === "apre" ? undefined : "img"} aria-hidden={fase === "apre" ? true : undefined}
      aria-label={`${stampa ? "La carta fisica della provincia" : "La mappa"}. Sei a ${d.qui ?? "un luogo sconosciuto"}. Luoghi in cui sei stato: ${d.visti.length + (d.qui ? 1 : 0)}.`}>
      <rect className="mp-carta-fondo" width={f.larghezza} height={f.altezza} />
      {stampa && <image className={"mp-stampa" + (dissolvi ? " mp-tardiva" : "")} href={stampa.url} width={f.larghezza} height={f.altezza} preserveAspectRatio="none" />}
      <rect className="mp-carta-grana" width={f.larghezza} height={f.altezza} filter="url(#mp-grana)" />
      {/* le pieghe della carta: in tre per il lungo, in due per il largo */}
      <g className="mp-pieghe" aria-hidden="true">
        {[1, 2].map((i) => <line key={i} x1={(f.larghezza * i) / 3} y1="0" x2={(f.larghezza * i) / 3} y2={f.altezza} />)}
        <line x1="0" y1={f.altezza / 2} x2={f.larghezza} y2={f.altezza / 2} />
      </g>
      <rect className="mp-carta-bordo" width={f.larghezza} height={f.altezza} fill="url(#mp-bordo)" />

      {/* il cartiglio della carta stampata */}
      {stampa && (
        <g className="mp-cartiglio" aria-hidden="true">
          <rect x={CARTIGLIO.x0} y={CARTIGLIO.y0} width={CARTIGLIO.x1 - CARTIGLIO.x0} height={CARTIGLIO.y1 - CARTIGLIO.y0} />
          <rect className="mp-cartiglio-filo" x={CARTIGLIO.x0 + 3} y={CARTIGLIO.y0 + 3} width={CARTIGLIO.x1 - CARTIGLIO.x0 - 6} height={CARTIGLIO.y1 - CARTIGLIO.y0 - 6} />
          <text className="mp-cartiglio-titolo" x={(CARTIGLIO.x0 + CARTIGLIO.x1) / 2} y={CARTIGLIO.y0 + 30} textAnchor="middle">CARTA FISICA</text>
          <text className="mp-cartiglio-sotto" x={(CARTIGLIO.x0 + CARTIGLIO.x1) / 2} y={CARTIGLIO.y0 + 47} textAnchor="middle">della provincia</text>
        </g>
      )}

      {/* la rosa dei venti, sul mare */}
      <g className="mp-rosa" transform={`translate(${ROSA.cx} ${ROSA.cy}) scale(${ROSA.r / 34})`} aria-hidden="true">
        <circle r="34" fill="none" strokeWidth="1" />
        <circle r="27" fill="none" strokeWidth=".6" strokeDasharray="1.5 3" />
        <path d="M0 -44 L7 0 L0 44 L-7 0 Z" fill="none" strokeWidth="1" />
        <path d="M-44 0 L0 -7 L44 0 L0 7 Z" fill="none" strokeWidth="1" />
        <path d="M0 -44 L7 0 L0 0 Z" className="mp-nord" />
        <text y="-52" textAnchor="middle" className="mp-lettera">N</text>
      </g>

      {/* le strade, a penna, in passate separate: le accennate, poi i bordi della statale e della provinciale, poi le loro
          anime (così i tratti si saldano senza giunture), poi le strade semplici. La classe si scopre percorrendola. */}
      {/* il sale: con l'invaso raggiunto, la mano tratteggia il lago che la stampa dà ancora pieno */}
      {conSale && <image className="mp-sale" href={stampa!.sale!} width={f.larghezza} height={f.altezza} preserveAspectRatio="none" />}
      <g className="mp-strade" aria-hidden="true">
        {f.strade.filter((s) => !s.battuta).map((s) => (
          <path key={s.da + s.a} d={s.d} className={"mp-accennata" + (s.daQui ? " mp-da-qui" : "")} />
        ))}
        {f.strade.filter((s) => s.battuta && DOPPIE.has(s.classe)).map((s) => <path key={s.da + s.a} d={s.d} className={`mp-bordo mp-${s.classe}`} />)}
        {f.strade.filter((s) => s.battuta && DOPPIE.has(s.classe)).map((s) => <path key={s.da + s.a} d={s.d} className={`mp-anima mp-${s.classe}`} />)}
        {f.strade.filter((s) => s.battuta && !DOPPIE.has(s.classe)).map((s) => <path key={s.da + s.a} d={s.d} className={`mp-battuta mp-${s.classe}`} />)}
      </g>

      {/* le tappe: un anello tracciato a mano attorno al luogo centrale, e il nome della tappa */}
      <g className="mp-tappe">
        {f.tappe.map((t) => {
          const p = postoNome({ cx: t.cx, cy: t.cy, lato: t.lato, scosta: t.scosta, raggio: RAGGIO_TAPPA }, CORPO_TAPPA);
          const visto = posto.has(t.id);
          return (
            <g key={t.id} className={"mp-tappa" + (t.raggiunta ? " mp-raggiunta" : "")}>
              <path className="mp-anello" d={t.anello} />
              {!visto && <circle className="mp-cuore" cx={t.cx} cy={t.cy} r={3} />}
              <text className="mp-nome-tappa" x={p.x} y={p.y} textAnchor={p.ancora} fontSize={CORPO_TAPPA}>{t.nome.toUpperCase()}</text>
            </g>
          );
        })}
      </g>

      {/* i luoghi e i loro nomi. Dove sei: il disco rosso e quattro tacche a mirino, che lo dicono anche senza il colore */}
      <g>
        {f.luoghi.map((l) => {
          const p = postoNome(l);
          return (
            <g key={l.id} className={`mp-luogo mp-${l.stato}`}>
              {l.stato === "qui" && <>
                <circle className="mp-alone" cx={l.cx} cy={l.cy} r={8} />
                <path className="mp-mirino" d={MIRINO.map(([x0, y0, x1, y1]) => `M${l.cx + x0} ${l.cy + y0}L${l.cx + x1} ${l.cy + y1}`).join("")} />
              </>}
              <circle className="mp-segno" cx={l.cx} cy={l.cy} r={l.stato === "qui" ? 5.5 : l.stato === "visto" ? 4 : 3.6} />
              {!l.nomeNascosto && <text className="mp-nome" x={p.x} y={p.y} textAnchor={p.ancora} fontSize={CORPO_NOME}>{l.nome}</text>}
            </g>
          );
        })}
      </g>
    </svg>
  );

  return (
    <div ref={dialogo} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Mappa"
      // M chiude come Esc; l'evento si ferma qui, se no il gioco, che ascolta M più su, la riaprirebbe subito
      onKeyDown={(e) => { if (e.key.toLowerCase() === "m" && !e.ctrlKey && !e.altKey && !e.metaKey) { e.preventDefault(); e.stopPropagation(); chiudi(); } }}
      className={"mp-velo mp-" + fase}
      style={{ ["--mp-acc" as string]: accento, outline: "none", fontSize: base * scalaTesto(opz), position: "absolute", inset: 0, zIndex: 70,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(4,4,8,.74)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", pointerEvents: "auto" }}
      onClick={chiudi}>
      {/* i filtri del foglio, una volta sola: le tre pieghe e il foglio intero li usano tutti */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
        <defs>
          <filter id="mp-grana" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" />
            <feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.26  0 0 0 0 0.16  0 0 0 0.55 -0.12" />
          </filter>
          <radialGradient id="mp-bordo" cx="50%" cy="50%" r="75%">
            <stop offset="62%" stopColor="#7a5a2a" stopOpacity="0" />
            <stop offset="100%" stopColor="#7a5a2a" stopOpacity=".32" />
          </radialGradient>
        </defs>
      </svg>
      <div onClick={(e) => e.stopPropagation()} className="mp-pannello"
        style={{ width: "90em", maxWidth: "94%", maxHeight: "94%", display: "flex", flexDirection: "column", boxSizing: "border-box",
          padding: "1.4em 2.2em 1.1em", borderRadius: "1.2em",
          background: "linear-gradient(180deg, rgba(20,18,24,.97), rgba(10,10,14,.98))", border: "1px solid rgba(255,255,255,.08)", boxShadow: "0 2em 6em rgba(0,0,0,.6)" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "1.5em" }}>
          <div>
            <p style={{ margin: 0, fontFamily: MONO, fontSize: ".85em", letterSpacing: ".3em", textTransform: "uppercase", color: accento }}>il viaggio</p>
            <h2 style={{ margin: ".2em 0 0", fontFamily: SERIF, fontWeight: 500, fontSize: "2em", color: "#f4ece0", letterSpacing: "-.01em" }}>Mappa</h2>
          </div>
          <p className="mp-dove" style={{ flex: 1, margin: "0 0 .35em", textAlign: "right" }}>
            {d.qui && <>sei qui · <b>{d.qui}</b></>}
            {zonaQui && nomeBreve(zonaQui).toLowerCase() !== d.qui?.toLowerCase() && <span> · {nomeBreve(zonaQui)}</span>}
          </p>
          <button type="button" className="opz-bottone mp-chiudi" onClick={chiudi} aria-label="Chiudi la mappa">chiudi <b>Esc</b></button>
        </div>

        {fase === "apre" ? (
          // la carta piegata in tre che si spiega: tre copie dello stesso foglio, ciascuna una striscia, ognuna con la sua cerniera
          <div className="mp-carta mp-spiega" style={{ marginTop: "1em" }} aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`mp-faccia mp-faccia-${i}`}>
                <div className="mp-faccia-dentro" style={{ width: "300%", marginLeft: `${-i * 100}%` }}>{disegno}</div>
                <div className="mp-ombra" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mp-carta" style={{ marginTop: "1em" }}>{disegno}</div>
        )}

        {/* chi non vede il foglio: dove sei, le tappe, dov'è passato, che cosa si vede */}
        <ul className="sr-only">
          {d.qui && <li>Sei a {d.qui}.</li>}
          {d.tappe.length > 0 && <li>Le tappe del viaggio: {d.tappe.join("; ")}.</li>}
          {d.visti.length > 0 && <li>Ci sei già stato: {d.visti.join(", ")}.</li>}
          {d.noti.length > 0 && <li>Da lì si vedono, ma non ci sei stato: {d.noti.join(", ")}.</li>}
          {stampa && <li>La carta è fisica, stampata prima della secca: colline a ovest, con la Serra Alta, pianura a est, il lago dove ora c'è
            l'invaso, il Torrente Morto che passa al guado, il mare a nord-est.{conSale ? " Sul lago hai segnato a penna il sale." : ""}</li>}
        </ul>

        <div style={{ marginTop: ".9em", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1.4em", flexShrink: 0 }}>
          {/* la legenda, con gli stessi segni del foglio: l'anello della tappa pieno o tratteggiato, il mirino di «sei qui», il
              tondo vuoto del luogo che si vede, il tratteggio della strada */}
          <div className="mp-legenda" aria-hidden="true">
            <span><svg viewBox="-10 -10 20 20"><circle className="mp-l-filo" r="7.5" strokeWidth="1.8" /><circle className="mp-l-pieno" r="3" /></svg>tappa raggiunta</span>
            <span><svg viewBox="-10 -10 20 20"><circle className="mp-l-filo" r="7.5" strokeWidth="1.2" strokeDasharray="3 2.5" /><circle className="mp-l-filo" r="3.2" strokeWidth="1" /></svg>tappa da raggiungere</span>
            <span><svg viewBox="-10 -10 20 20"><path className="mp-l-filo" strokeWidth="1.4" d={MIRINO.map(([x0, y0, x1, y1]) => `M${x0} ${y0}L${x1} ${y1}`).join("")} /><circle className="mp-l-rosso" r="5" /></svg>sei qui</span>
            <span><svg viewBox="-10 -10 20 20"><circle className="mp-l-pieno" r="4" /></svg>ci sei stato</span>
            <span><svg viewBox="-10 -10 20 20"><circle className="mp-l-filo" r="3.6" strokeWidth="1.3" /></svg>si vede, non ci sei stato</span>
            <span><svg viewBox="-10 -10 20 20"><path className="mp-l-filo" strokeWidth="1.5" strokeDasharray="2.4 4" strokeLinecap="round" d="M-9 0H9" /></svg>strada non ancora percorsa</span>
          </div>
          <span className="mp-nota" style={{ textAlign: "right" }}>M o Esc chiudono</span>
        </div>
      </div>
    </div>
  );
}
