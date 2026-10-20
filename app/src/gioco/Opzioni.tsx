// ====================================================================
//  Le opzioni (pre-produzione/09-opzioni-menu-pausa.md, §3): un pannello a
//  schede, lo stesso dal menu d'avvio e dalla partita. Ogni cambio vale
//  subito (lib/opzioni.ts, il bus sonoro in lib/suono.ts): niente «applica».
//  Le schede seguono le regole ARIA dei tab (← → da una all'altra, Tab
//  dentro); Esc chiude, il fuoco entra e torna (useDialogo). In fondo,
//  «ripristina le opzioni di base», con una conferma (S / N).
//  Misure in em (prop `base`), come la guida e il taccuino: 19 sulla
//  superficie 1920 del menu, 13 su quella 1280 della partita.
//  Le schede compaiono quando hanno qualcosa: Generale arriva con i comandi.
// ====================================================================
import { useEffect, useRef, useState } from "react";
import { useDialogo } from "./useDialogo";
import { useOpzioni } from "../lib/useOpzioni";
import { ripristinaOpzioni, type Opzioni } from "../lib/opzioni";
import { commutaSchermoIntero, statoSchermoIntero } from "../lib/desktop";
import "./opzioni.css";

const SERIF = "'Lora', Georgia, serif";
const DISPLAY = "'Sora', 'Inter', sans-serif";
const MONO = "'Source Code Pro', ui-monospace, monospace";

type Scheda = "video" | "audio";
const SCHEDE: readonly [Scheda, string][] = [["video", "Video"], ["audio", "Audio"]];
// la scheda scelta resta finché il gioco è aperto: riaprendo le opzioni si ritrova
let ultimaScheda: Scheda = "video";

type Volume = "volume" | "volumeMusica" | "volumeVoce" | "volumeEffetti";

interface Props {
  base: number;
  accento?: string;
  /** in partita: ridice l'ultimo testo della voce (nel menu non c'è) */
  onRiascolta?: () => void;
  onChiudi: () => void;
}

export default function PannelloOpzioni({ base, accento = "#f0b77e", onRiascolta, onChiudi }: Props) {
  const [o, cambia] = useOpzioni();
  const [scheda, setScheda] = useState<Scheda>(ultimaScheda);
  const [ripristino, setRipristino] = useState(false);
  const ripristinoRef = useRef(false);
  ripristinoRef.current = ripristino;
  // Esc: prima chiude la domanda del ripristino, poi il pannello
  const dialogo = useDialogo<HTMLDivElement>(() => { if (ripristinoRef.current) setRipristino(false); else onChiudi(); });
  const schedeRef = useRef<HTMLDivElement>(null);
  const [intero, setIntero] = useState<boolean | null>(null);

  useEffect(() => { ultimaScheda = scheda; }, [scheda]);

  // lo schermo: si legge dalla finestra (F11 lo cambia da fuori)
  useEffect(() => {
    const leggi = () => { statoSchermoIntero().then(setIntero).catch(() => setIntero(null)); };
    leggi();
    window.addEventListener("resize", leggi);
    document.addEventListener("fullscreenchange", leggi);
    return () => { window.removeEventListener("resize", leggi); document.removeEventListener("fullscreenchange", leggi); };
  }, []);
  const schermo = (voluto: boolean) => {
    if (intero === voluto) return;
    commutaSchermoIntero(document.documentElement).then(setIntero).catch(() => {});
  };

  // la domanda del ripristino: S sì, N no
  useEffect(() => {
    if (!ripristino) return;
    const tasto = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "s") { e.preventDefault(); e.stopPropagation(); ripristinaOpzioni(); setRipristino(false); }
      else if (k === "n") { e.preventDefault(); e.stopPropagation(); setRipristino(false); }
    };
    window.addEventListener("keydown", tasto, true);
    return () => window.removeEventListener("keydown", tasto, true);
  }, [ripristino]);

  const frecce = (e: React.KeyboardEvent) => {
    const i = SCHEDE.findIndex(([id]) => id === scheda), n = SCHEDE.length;
    const j = e.key === "ArrowRight" ? (i + 1) % n : e.key === "ArrowLeft" ? (i - 1 + n) % n : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : -1;
    if (j < 0) return;
    e.preventDefault();
    setScheda(SCHEDE[j][0]);
    requestAnimationFrame(() => schedeRef.current?.querySelector<HTMLElement>(`[data-scheda="${SCHEDE[j][0]}"]`)?.focus());
  };

  const pulsante = (premuto: boolean): React.CSSProperties => ({
    cursor: "pointer", border: `1px solid ${premuto ? accento : "rgba(255,255,255,.18)"}`, borderRadius: 999,
    background: premuto ? accento : "transparent", color: premuto ? "#140c06" : "#d6dde6",
    fontFamily: DISPLAY, fontWeight: premuto ? 600 : 500, fontSize: ".92em", padding: ".36em 1em",
  });

  /** Una riga a scelta: il nome, i valori come pulsanti premuti o no (e, dopo, un comando in più), una spiegazione. */
  const riga = <K extends keyof Opzioni>(nome: string, chiave: K, valori: [Opzioni[K], string][], spiega?: string, inPiu?: React.ReactNode) => (
    <div key={chiave} role="group" aria-label={nome} className="opz-riga" style={stileRiga}>
      <span className="opz-nome" style={stileNome}>{nome}</span>
      <span style={{ display: "flex", flexWrap: "wrap", gap: ".5em" }}>
        {valori.map(([v, etichetta]) => (
          <button key={String(v)} type="button" className="opz-valore" aria-pressed={o[chiave] === v} onClick={() => cambia({ [chiave]: v } as Partial<Opzioni>)} style={pulsante(o[chiave] === v)}>
            {etichetta}
          </button>
        ))}
        {inPiu}
      </span>
      {spiega && <span style={stileSpiega}>{spiega}</span>}
    </div>
  );

  /** Un volume: un cursore da 0 a 100, a passi di 5, che si muove anche con le frecce. */
  const cursore = (nome: string, chiave: Volume, spiega: string) => {
    const valore = Math.round(o[chiave] * 100);
    const detto = valore === 0 ? "spento" : `${valore}%`;
    return (
      <div key={chiave} role="group" aria-label={nome} className="opz-riga" style={stileRiga}>
        <label htmlFor={`opz-${chiave}`} className="opz-nome" style={stileNome}>{nome}</label>
        <span style={{ display: "flex", alignItems: "center", gap: "1em" }}>
          <input id={`opz-${chiave}`} type="range" className="opz-cursore" min={0} max={100} step={5} value={valore} aria-valuetext={detto}
            onChange={(e) => cambia({ [chiave]: Number(e.target.value) / 100 } as Partial<Opzioni>)}
            style={{ flex: 1, minWidth: 0, accentColor: accento, height: "1.2em", margin: 0, cursor: "pointer" }} />
          <output htmlFor={`opz-${chiave}`} style={{ fontFamily: MONO, fontSize: ".9em", color: "#ece5da", minWidth: "4.2em", textAlign: "right" }}>{detto}</output>
        </span>
        <span style={stileSpiega}>{spiega}</span>
      </div>
    );
  };

  return (
    <div ref={dialogo} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Opzioni"
      style={{ ["--opz-acc" as string]: accento, outline: "none", fontSize: base, position: "absolute", inset: 0, zIndex: 75, display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(4,4,8,.74)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", animation: "kf-launch .3s ease both", pointerEvents: "auto" }}
      onClick={onChiudi}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ width: "74em", maxWidth: "94%", height: "38em", maxHeight: "92%", display: "flex", flexDirection: "column", boxSizing: "border-box", padding: "1.7em 2.4em 1.3em", borderRadius: "1.2em",
          background: "linear-gradient(180deg, rgba(20,18,24,.97), rgba(10,10,14,.98))", border: "1px solid rgba(255,255,255,.08)", boxShadow: "0 2em 6em rgba(0,0,0,.6)" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "1em" }}>
          <div>
            <p style={{ margin: 0, fontFamily: MONO, fontSize: ".85em", letterSpacing: ".3em", textTransform: "uppercase", color: accento }}>il gioco come lo vuoi</p>
            <h2 style={{ margin: ".2em 0 0", fontFamily: SERIF, fontWeight: 500, fontSize: "2em", color: "#f4ece0", letterSpacing: "-.01em" }}>Opzioni</h2>
          </div>
          <div role="tablist" aria-label="Pagine delle opzioni" ref={schedeRef} onKeyDown={frecce} style={{ display: "flex", gap: "1.3em" }}>
            {SCHEDE.map(([id, titolo]) => (
              <button key={id} type="button" role="tab" className="opz-scheda" id={`opz-scheda-${id}`} data-scheda={id} aria-selected={id === scheda} aria-controls="opz-foglio"
                tabIndex={id === scheda ? 0 : -1} onClick={() => setScheda(id)}
                style={{ cursor: "pointer", background: "none", border: "none", padding: "0 0 .2em", fontFamily: DISPLAY, fontWeight: 600, fontSize: "1.1em",
                  color: id === scheda ? "#f4ece0" : "rgba(226,220,208,.6)", borderBottom: `2px solid ${id === scheda ? accento : "transparent"}` }}>
                {titolo}
              </button>
            ))}
          </div>
        </div>

        <div id="opz-foglio" role="tabpanel" aria-labelledby={`opz-scheda-${scheda}`} className="gv-scroll"
          style={{ marginTop: "1em", flex: 1, minHeight: 0, overflowY: "auto", borderTop: "1px solid rgba(255,255,255,.07)" }}>
          {scheda === "video" && (
            <div style={stileColonne}>
              <section aria-label="Schermo">
                <h3 style={stileSezione}>Schermo</h3>
                <div role="group" aria-label="Schermo" className="opz-riga" style={stileRiga}>
                  <span className="opz-nome" style={stileNome}>Schermo</span>
                  <span style={{ display: "flex", flexWrap: "wrap", gap: ".5em" }}>
                    <button type="button" className="opz-valore" aria-pressed={intero === true} onClick={() => schermo(true)} style={pulsante(intero === true)}>schermo intero</button>
                    <button type="button" className="opz-valore" aria-pressed={intero === false} onClick={() => schermo(false)} style={pulsante(intero === false)}>finestra</button>
                  </span>
                  <span style={stileSpiega}>Si cambia anche con F11.</span>
                </div>
              </section>
            </div>
          )}
          {scheda === "audio" && (
            <div style={stileColonne}>
              <section aria-label="Volumi">
              <h3 style={stileSezione}>Volumi</h3>
              {cursore("Volume generale", "volume", "Alza o abbassa tutto insieme.")}
              {cursore("Musica", "volumeMusica", "Il brano del trailer e del menu d'avvio.")}
              {cursore("Voce", "volumeVoce", "Il racconto doppiato e la voce del trailer.")}
              {cursore("Effetti", "volumeEffetti", "I suoni dei loghi e i rumori del trailer.")}
              </section>
              <section aria-label="Ascolto">
              <h3 style={stileSezione}>Ascolto</h3>
              {riga("Voce del gioco", "voce", [["recitata", "recitata"], ["lettore", "lettore di schermo"]],
                o.voce === "recitata"
                  ? "Il gioco ti legge il racconto con le voci del doppiaggio. La voce si ferma al primo tasto; F2 ridice l'ultimo testo; le risposte di un dialogo si sentono passandoci sopra."
                  : "Nessuna voce del gioco: se usi un lettore di schermo, è lui a leggerti il diario, riga per riga.",
                onRiascolta && o.voce === "recitata" && (
                  <button type="button" className="opz-bottone" onClick={onRiascolta} style={{ ...stileBottone, marginLeft: ".6em", padding: ".45em .9em" }}>↻ riascolta</button>
                ))}
              {riga("Suono", "mono", [[false, "stereo"], [true, "mono"]], "Mono: i due canali insieme, per chi sente da un orecchio solo.")}
              {riga("In secondo piano", "secondoPiano", [["continua", "continua"], ["silenzia", "silenzia"]], "Silenzia: il gioco tace quando lo riduci a icona o passi a un'altra finestra.")}
              </section>
            </div>
          )}
        </div>

        <div style={{ marginTop: "1em", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1em", minHeight: "2.6em", flexShrink: 0 }}>
          {ripristino ? (
            <span style={{ display: "flex", alignItems: "center", gap: ".8em", flexWrap: "wrap" }}>
              <span style={{ fontFamily: SERIF, fontSize: ".98em", color: "#f4ece0" }}>Tutte le opzioni tornano come al primo avvio?</span>
              <button type="button" className="opz-bottone" autoFocus style={{ ...stileBottone, background: accento, color: "#140c06", borderColor: accento }} onClick={() => { ripristinaOpzioni(); setRipristino(false); }}>sì <b>S</b></button>
              <button type="button" className="opz-bottone" style={stileBottone} onClick={() => setRipristino(false)}>no <b>N</b></button>
            </span>
          ) : (
            <button type="button" className="opz-bottone" style={stileBottone} onClick={() => setRipristino(true)}>ripristina le opzioni di base</button>
          )}
          <button type="button" className="opz-bottone" style={stileBottone} onClick={onChiudi}>chiudi <b>Esc</b></button>
        </div>
      </div>
    </div>
  );
}

// due colonne affiancate: con il pannello largo, le righe di una scheda stanno tutte in vista senza scorrere
const stileColonne: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1.18fr", columnGap: "3em", alignItems: "start" };
const stileSezione: React.CSSProperties = {
  margin: "1.1em 0 .1em", fontFamily: MONO, fontWeight: 500, fontSize: ".8em", letterSpacing: ".26em", textTransform: "uppercase", color: "rgba(226,220,208,.55)",
};
const stileRiga: React.CSSProperties = {
  display: "grid", gridTemplateColumns: "9.5em 1fr", columnGap: "1.2em", rowGap: ".2em", alignItems: "center",
  padding: ".62em 0", borderBottom: "1px solid rgba(255,255,255,.06)",
};
const stileNome: React.CSSProperties = { fontFamily: DISPLAY, fontWeight: 600, fontSize: "1em", color: "#f1f3f7" };
const stileSpiega: React.CSSProperties = {
  gridColumn: "2", fontFamily: SERIF, fontStyle: "italic", fontSize: ".88em", lineHeight: 1.4, color: "rgba(226,220,208,.72)",
};
const stileBottone: React.CSSProperties = {
  cursor: "pointer", flexShrink: 0, border: "1px solid rgba(255,255,255,.18)", background: "transparent", color: "#c9d2de", borderRadius: 999,
  fontFamily: MONO, fontSize: ".85em", letterSpacing: ".12em", textTransform: "uppercase", padding: ".6em 1.1em",
};
