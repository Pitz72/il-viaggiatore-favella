// ====================================================================
//  Le opzioni (pre-produzione/09-opzioni-menu-pausa.md, §3): un pannello a
//  schede, lo stesso dal menu d'avvio e dalla partita. Ogni cambio vale
//  subito (lib/opzioni.ts, il bus sonoro in lib/suono.ts): niente «applica».
//  Le schede seguono le regole ARIA dei tab (← → da una all'altra, Tab
//  dentro); Esc chiude, il fuoco entra e torna (useDialogo). In fondo,
//  «ripristina le opzioni di base», con una conferma (S / N); con la stessa
//  conferma, nella scheda Generale, «azzera i trofei» (i salvataggi restano).
//  Misure in em (prop `base`), come la guida e il taccuino: 19 sulla
//  superficie 1920 del menu, 13 su quella 1280 della partita.
//  Generale: la lingua del testo, il modo dei comandi (piano 09, fase 5; in
//  inglese soltanto i pulsanti) e, solo sul desktop, gli aggiornamenti. Video: lo schermo, la dimensione della
//  finestra e la qualità della grafica (piano 09, fase 4); la finestra e gli
//  aggiornamenti li tiene il processo principale (desktop/impostazioni.cjs).
// ====================================================================
import { scalaTesto } from "../lib/accessibilita";
import { useEffect, useRef, useState } from "react";
import { useDialogo } from "./useDialogo";
import { useOpzioni } from "../lib/useOpzioni";
import { ascoltaTrofei, azzeraTrofei, deposito } from "../lib/trofei";
import { trofeiDellaLingua } from "./trofei";
import { ACCESSIBILE, altaAccessibilita, comandiEffettivi, conVoce, NON_ACCESSIBILE, opzioni, ripristinaOpzioni, type ModoComandi, type ModoVoce, type Opzioni, type Qualita } from "../lib/opzioni";
import { in_, tr, type Bilingue } from "../lib/lingua";
import { cercaAggiornamenti, dimensioneFinestra, impostaSchermoIntero, seguiFinestra, statoFinestra, statoSchermoIntero, type StatoFinestra } from "../lib/desktop";
import "./opzioni.css";

const SERIF = "'Lora', Georgia, serif";
const DISPLAY = "'Sora', 'Inter', sans-serif";
const MONO = "'Source Code Pro', ui-monospace, monospace";

type Scheda = "generale" | "video" | "audio";
const SCHEDE: readonly [Scheda, Bilingue][] = [["generale", { it: "Generale", en: "General" }], ["video", { it: "Video", en: "Video" }], ["audio", { it: "Audio", en: "Audio" }]];
// la scheda scelta resta finché il gioco è aperto: riaprendo le opzioni si ritrova
let ultimaScheda: Scheda = SCHEDE[0][0];

/** Le dimensioni della finestra, in pixel veri dello schermo: tutte 16:9, come il gioco. */
const DIMENSIONI: readonly [number, number][] = [[1280, 720], [1600, 900], [1920, 1080], [2560, 1440], [3840, 2160]];
const SPIEGA_QUALITA: Record<Qualita, Bilingue> = {
  automatica: { it: "Come ha sempre fatto il gioco: i paesaggi alla densità dello schermo, e il trailer scende da solo se il computer arranca.",
    en: "As the game has always done: landscapes at the screen's density, and the trailer scales down by itself if the computer struggles." },
  alta: { it: "I paesaggi della partita alla risoluzione piena dello schermo e il trailer fino al 4K: più nitidi, più lavoro per il computer.",
    en: "In-game landscapes at the screen's full resolution and the trailer up to 4K: sharper, more work for the computer." },
  media: { it: "Tre quarti della risoluzione: per un computer che fatica.", en: "Three quarters of the resolution: for a computer that struggles." },
  bassa: { it: "Metà della risoluzione: per i computer lenti. Meno nitido, più fluido.", en: "Half the resolution: for slow computers. Less sharp, smoother." },
};

const SPIEGA_COMANDI: Record<ModoComandi, Bilingue> = {
  pulsanti: { it: "Niente riga da scrivere: si gioca coi pulsanti (uscite, cose, persone, azioni) e con le parole del testo che si toccano. Con la tastiera, Tab passa da un pulsante all'altro.",
    en: "No line to type: you play with the buttons (exits, things, people, actions) and with the words in the text you can touch. With the keyboard, Tab moves from one button to the next." },
  parole: { it: "L'avventura testuale pura: ogni comando si scrive, anche il numero di una risposta. Scorte, bisaccia e fiducia restano a lato, da leggere.",
    en: "The pure text adventure: every command is typed, even the number of a reply. Supplies, satchel and trust stay at the side, to be read." },
};
/** In inglese i comandi sono i pulsanti: il parser capisce soltanto l'italiano. */
const SOLO_PULSANTI = "In English you play with the buttons: the text parser understands only Italian.";

const SPIEGA_VOCE: Record<ModoVoce, Bilingue> = {
  recitata: { it: "Il gioco ti legge il racconto con le voci del doppiaggio. La voce si ferma al primo tasto; F2 ridice l'ultimo testo; le risposte di un dialogo si sentono passandoci sopra.",
    en: "The game reads you the story with the Italian voice cast. The voice stops at the first key; F2 repeats the last text; the replies in a conversation are heard when you hover over them." },
  inglese: { it: "Il narratore, la voce di servizio (suggerimenti e scorte) e dieci personaggi parlano in inglese; gli altri quattro restano per ora quelli italiani, finché non saranno registrati anche in inglese. La voce si ferma al primo tasto; F2 ridice l'ultimo testo; le risposte di un dialogo si sentono passandoci sopra.",
    en: "The narrator, the service voice (hints and supplies) and ten characters speak English; the other four are still the Italian ones for now, until they are recorded in English too. The voice stops at the first key; F2 repeats the last text; the replies in a conversation are heard when you hover over them." },
  nessuna: { it: "Nessuna voce del gioco: si legge soltanto, in silenzio.", en: "No game voice: text only, in silence." },
  lettore: { it: "Nessuna voce del gioco: se usi un lettore di schermo, è lui a leggerti il diario, riga per riga.",
    en: "No game voice: if you use a screen reader, it reads you the journal, line by line." },
};

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
  const acc = altaAccessibilita(o);
  const comandi = comandiEffettivi(o);
  const [scheda, setScheda] = useState<Scheda>(ultimaScheda);
  // la domanda in fondo: ripristinare le opzioni, o azzerare i trofei
  const [domanda, setDomanda] = useState<null | "ripristino" | "trofei">(null);
  const domandaRef = useRef(domanda);
  domandaRef.current = domanda;
  // Esc: prima chiude la domanda, poi il pannello
  const dialogo = useDialogo<HTMLDivElement>(() => { if (domandaRef.current) setDomanda(null); else onChiudi(); });
  // quanti trofei ci sono, per la riga che li azzera
  const [trofeiVinti, setTrofeiVinti] = useState<number | null>(null);
  useEffect(() => {
    let vivo = true;
    const conta = (v: Record<string, string>) => vivo && setTrofeiVinti(trofeiDellaLingua(opzioni().lingua).filter((t) => v[t.id]).length);
    deposito().then((d) => conta(d.vinti)).catch(() => {});
    const smetti = ascoltaTrofei((d) => conta(d.vinti));
    return () => { vivo = false; smetti(); };
  }, []);
  const schedeRef = useRef<HTMLDivElement>(null);
  const [intero, setIntero] = useState<boolean | null>(null);
  // la finestra del desktop (null nel browser): dimensione, scala, area utile, aggiornamenti
  const [finestra, setFinestra] = useState<StatoFinestra | null>(null);
  const [avviso, setAvviso] = useState<string | null>(null);

  useEffect(() => { ultimaScheda = scheda; }, [scheda]);

  // lo schermo e la finestra: si leggono da fuori, e si rileggono a ogni cambio (F11, trascinamento)
  useEffect(() => {
    const leggi = () => {
      statoFinestra().then((f) => {
        setFinestra(f);
        if (f) setIntero(f.schermoIntero);
        else statoSchermoIntero().then(setIntero).catch(() => setIntero(null));
      }).catch(() => setFinestra(null));
    };
    leggi();
    return seguiFinestra(leggi);
  }, []);
  const schermo = (voluto: boolean) => {
    if (intero === voluto) return;
    impostaSchermoIntero(voluto).then(setIntero).catch(() => {});
  };
  const dimensione = (l: number, a: number) => {
    setAvviso(null);
    dimensioneFinestra(l, a).catch((e) => setAvviso(e instanceof Error ? e.message.replace(/^.*Error: /, "") : String(e)));
  };
  // la dimensione di adesso, in pixel veri, e quali delle misure entrano in questo schermo
  const adesso = finestra ? [Math.round(finestra.contenuto[0] * finestra.scala), Math.round(finestra.contenuto[1] * finestra.scala)] : null;
  const entra = ([l, a]: readonly [number, number]) => !!finestra && l / finestra.scala <= finestra.area[0] && a / finestra.scala <= finestra.area[1];
  const inFinestra = !!finestra && !finestra.schermoIntero && !finestra.massimizzata;
  const scelta = inFinestra && adesso ? DIMENSIONI.find(([l, a]) => Math.abs(l - adesso[0]) <= 2 && Math.abs(a - adesso[1]) <= 2) : undefined;
  const ripristina = () => {
    ripristinaOpzioni();
    if (finestra) { impostaSchermoIntero(true).catch(() => {}); cercaAggiornamenti(true).then(() => statoFinestra().then(setFinestra)).catch(() => {}); }
    setDomanda(null);
  };
  const azzera = () => { azzeraTrofei().catch(() => {}); setDomanda(null); };

  // la domanda in fondo: S sì, N no
  useEffect(() => {
    if (!domanda) return;
    const tasto = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "s" || k === "y") { e.preventDefault(); e.stopPropagation(); if (domanda === "ripristino") ripristina(); else azzera(); }
      else if (k === "n") { e.preventDefault(); e.stopPropagation(); setDomanda(null); }
    };
    window.addEventListener("keydown", tasto, true);
    return () => window.removeEventListener("keydown", tasto, true);
  }, [domanda]); // eslint-disable-line react-hooks/exhaustive-deps

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

  /** Una riga a scelta: il nome, i valori come pulsanti premuti o no (e, dopo, un comando in più), una spiegazione.
   *  `attuale` è il valore che vale davvero, se non è quello scritto (i comandi in inglese); `chiusi` i valori che non si
   *  possono scegliere adesso. */
  const riga = <K extends keyof Opzioni>(nome: string, chiave: K, valori: [Opzioni[K], string][], spiega?: string, inPiu?: React.ReactNode,
    attuale: Opzioni[K] = o[chiave], chiusi: Opzioni[K][] = []) => (
    <div key={chiave} role="group" aria-label={nome} className="opz-riga" style={stileRiga}>
      <span className="opz-nome" style={stileNome}>{nome}</span>
      <span style={{ display: "flex", flexWrap: "wrap", gap: ".5em" }}>
        {valori.map(([v, etichetta]) => (
          <button key={String(v)} type="button" className="opz-valore" aria-pressed={attuale === v} disabled={chiusi.includes(v)}
            onClick={() => cambia({ [chiave]: v } as Partial<Opzioni>)}
            style={{ ...pulsante(attuale === v), ...(chiusi.includes(v) ? { opacity: 0.4, cursor: "default" } : null) }}>
            {etichetta}
          </button>
        ))}
        {inPiu}
      </span>
      {spiega && <span className="opz-spiega" style={stileSpiega}>{spiega}</span>}
    </div>
  );

  /** Un volume: un cursore da 0 a 100, a passi di 5, che si muove anche con le frecce. */
  const cursore = (nome: string, chiave: Volume, spiega: string) => {
    const valore = Math.round(o[chiave] * 100);
    const detto = valore === 0 ? tr("spento", "off") : `${valore}%`;
    return (
      <div key={chiave} role="group" aria-label={nome} className="opz-riga" style={stileRiga}>
        <label htmlFor={`opz-${chiave}`} className="opz-nome" style={stileNome}>{nome}</label>
        <span style={{ display: "flex", alignItems: "center", gap: "1em" }}>
          <input id={`opz-${chiave}`} type="range" className="opz-cursore" min={0} max={100} step={5} value={valore} aria-valuetext={detto}
            onChange={(e) => cambia({ [chiave]: Number(e.target.value) / 100 } as Partial<Opzioni>)}
            style={{ flex: 1, minWidth: 0, accentColor: accento, height: "1.2em", margin: 0, cursor: "pointer" }} />
          <output htmlFor={`opz-${chiave}`} style={{ fontFamily: MONO, fontSize: ".9em", color: "#ece5da", minWidth: "4.2em", textAlign: "right" }}>{detto}</output>
        </span>
        <span className="opz-spiega" style={stileSpiega}>{spiega}</span>
      </div>
    );
  };

  return (
    <div ref={dialogo} tabIndex={-1} role="dialog" aria-modal="true" aria-label={tr("Opzioni", "Options")}
      style={{ ["--opz-acc" as string]: accento, outline: "none", fontSize: base * scalaTesto(o), position: "absolute", inset: 0, zIndex: 75, display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(4,4,8,.74)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", animation: "kf-launch .3s ease both", pointerEvents: "auto" }}
      onClick={onChiudi}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ width: "74em", maxWidth: "94%", height: "41em", maxHeight: "92%", display: "flex", flexDirection: "column", boxSizing: "border-box", padding: "1.7em 2.4em 1.3em", borderRadius: "1.2em",
          background: "linear-gradient(180deg, rgba(20,18,24,.97), rgba(10,10,14,.98))", border: "1px solid rgba(255,255,255,.08)", boxShadow: "0 2em 6em rgba(0,0,0,.6)" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "1em" }}>
          <div>
            <p style={{ margin: 0, fontFamily: MONO, fontSize: ".85em", letterSpacing: ".3em", textTransform: "uppercase", color: accento }}>{tr("il gioco come lo vuoi", "the game your way")}</p>
            <h2 style={{ margin: ".2em 0 0", fontFamily: SERIF, fontWeight: 500, fontSize: "2em", color: "#f4ece0", letterSpacing: "-.01em" }}>{tr("Opzioni", "Options")}</h2>
          </div>
          <div role="tablist" aria-label={tr("Pagine delle opzioni", "Option pages")} ref={schedeRef} onKeyDown={frecce} style={{ display: "flex", gap: "1.3em" }}>
            {SCHEDE.map(([id, titolo]) => (
              <button key={id} type="button" role="tab" className="opz-scheda" id={`opz-scheda-${id}`} data-scheda={id} aria-selected={id === scheda} aria-controls="opz-foglio"
                tabIndex={id === scheda ? 0 : -1} onClick={() => setScheda(id)}
                style={{ cursor: "pointer", background: "none", border: "none", padding: "0 0 .2em", fontFamily: DISPLAY, fontWeight: 600, fontSize: "1.1em",
                  color: id === scheda ? "#f4ece0" : "rgba(226,220,208,.6)", borderBottom: `2px solid ${id === scheda ? accento : "transparent"}` }}>
                {in_(titolo)}
              </button>
            ))}
          </div>
        </div>

        <div id="opz-foglio" role="tabpanel" aria-labelledby={`opz-scheda-${scheda}`} className="gv-scroll"
          style={{ marginTop: "1em", flex: 1, minHeight: 0, overflowY: "auto", borderTop: "1px solid rgba(255,255,255,.07)" }}>
          {scheda === "generale" && (
            // la riga dei comandi ha valori lunghi: la colonna sinistra è la larga
            <div style={{ ...stileColonne, gridTemplateColumns: "1.3fr 1fr" }}>
              <section aria-label={tr("Il gioco", "The game")}>
                <h3 className="opz-sezione" style={stileSezione}>{tr("Il gioco", "The game")}</h3>
                {riga(tr("Lingua", "Language"), "lingua", [["it", "italiano"], ["en", "English"]],
                  tr("La lingua del racconto e dell'interfaccia. La voce si sceglie nella scheda Audio.",
                    "The language of the story and of the interface. The voice is chosen in the Audio tab."))}
                {riga(tr("Comandi", "Commands"), "comandi", [["pulsanti", tr("pulsanti", "buttons")], ["parole", tr("avventura testuale", "text adventure")]],
                  o.lingua === "en" ? SOLO_PULSANTI : in_(SPIEGA_COMANDI[comandi]), undefined, comandi, o.lingua === "en" ? ["parole"] : [])}
                <div role="group" aria-label={tr("Trofei", "Trophies")} className="opz-riga" style={stileRiga}>
                  <span className="opz-nome" style={stileNome}>{tr("Trofei", "Trophies")}</span>
                  <span style={{ display: "flex", flexWrap: "wrap", gap: ".5em" }}>
                    <button type="button" className="opz-bottone" disabled={!trofeiVinti} onClick={() => setDomanda("trofei")}
                      style={{ ...stileBottone, padding: ".45em .9em", opacity: trofeiVinti ? 1 : 0.4, cursor: trofeiVinti ? "pointer" : "default" }}>{tr("azzera i trofei", "reset trophies")}</button>
                  </span>
                  <span className="opz-spiega" style={stileSpiega}>
                    {trofeiVinti === null ? "" : trofeiVinti
                      ? tr(`Ne hai vinti ${trofeiVinti} di ${trofeiDellaLingua(o.lingua).length}. Azzerarli li rimette tutti da vincere; i salvataggi restano.`,
                        `You have won ${trofeiVinti} of ${trofeiDellaLingua(o.lingua).length}. Resetting puts them all back up for grabs; your saves stay.`)
                      : tr("Nessun trofeo vinto, per ora.", "No trophies won, for now.")}
                  </span>
                </div>
              </section>
              {finestra && <section aria-label={tr("All'avvio", "At startup")}>
                <h3 className="opz-sezione" style={stileSezione}>{tr("All'avvio", "At startup")}</h3>
                <div role="group" aria-label={tr("Aggiornamenti", "Updates")} className="opz-riga" style={stileRiga}>
                  <span className="opz-nome" style={stileNome}>{tr("Aggiornamenti", "Updates")}</span>
                  <span style={{ display: "flex", flexWrap: "wrap", gap: ".5em" }}>
                    {([[true, tr("cercali all'avvio", "check at startup")], [false, "no"]] as const).map(([v, etichetta]) => (
                      <button key={String(v)} type="button" className="opz-valore" aria-pressed={finestra.aggiornamenti.attivo === v} style={pulsante(finestra.aggiornamenti.attivo === v)}
                        onClick={() => cercaAggiornamenti(v).then(() => statoFinestra().then(setFinestra)).catch(() => {})}>{etichetta}</button>
                    ))}
                  </span>
                  <span className="opz-spiega" style={stileSpiega}>
                    {finestra.aggiornamenti.motivo
                      ? tr(`Questa versione non si aggiorna da sola (${finestra.aggiornamenti.motivo}): le versioni nuove si scaricano da GitHub.`,
                        "This version does not update itself: new versions are downloaded from GitHub.")
                      : tr("All'avvio il gioco chiede a GitHub se c'è una versione nuova e la scarica; non manda niente di tuo. Vale dall'avvio dopo.",
                        "At startup the game asks GitHub whether there is a new version and downloads it; it sends nothing of yours. Takes effect from the next launch.")}
                  </span>
                </div>
              </section>}
            </div>
          )}
          {scheda === "video" && (
            <div style={{ ...stileColonne, gridTemplateColumns: "1fr 1fr" }}>
              <section aria-label={tr("Schermo e grafica", "Screen and graphics")}>
                <h3 className="opz-sezione" style={stileSezione}>{tr("Schermo", "Screen")}</h3>
                <div role="group" aria-label={tr("Schermo", "Screen")} className="opz-riga" style={stileRiga}>
                  <span className="opz-nome" style={stileNome}>{tr("Schermo", "Screen")}</span>
                  <span style={{ display: "flex", flexWrap: "wrap", gap: ".5em" }}>
                    <button type="button" className="opz-valore" aria-pressed={intero === true} onClick={() => schermo(true)} style={pulsante(intero === true)}>{tr("schermo intero", "full screen")}</button>
                    <button type="button" className="opz-valore" aria-pressed={intero === false} onClick={() => schermo(false)} style={pulsante(intero === false)}>{tr("finestra", "window")}</button>
                  </span>
                  <span className="opz-spiega" style={stileSpiega}>{tr("Si cambia anche con F11.", "F11 also switches it.")}{finestra ? tr(" Il gioco riparte com'era.", " The game starts again as it was.") : ""}</span>
                </div>
                {finestra && (
                  <div role="group" aria-label={tr("Dimensione della finestra", "Window size")} className="opz-riga" style={stileRiga}>
                    <span className="opz-nome" style={stileNome}>{tr("Finestra", "Window")}</span>
                    <span style={{ display: "flex", flexWrap: "wrap", gap: ".45em" }}>
                      {DIMENSIONI.filter(entra).map(([l, a]) => (
                        <button key={l} type="button" className="opz-valore" aria-pressed={scelta?.[0] === l} onClick={() => dimensione(l, a)} style={pulsante(scelta?.[0] === l)}>
                          {l} × {a}
                        </button>
                      ))}
                    </span>
                    <span className="opz-spiega" style={stileSpiega}>
                      {avviso ?? (!inFinestra
                        ? tr("La dimensione della finestra, in pixel dello schermo: sceglierne una esce dallo schermo intero.",
                          "The window size, in screen pixels: choosing one leaves full screen.")
                        : scelta ? tr("In pixel dello schermo; ci sono solo le misure che entrano in questo.", "In screen pixels; only the sizes that fit this screen are listed.")
                        : tr(`Adesso è ${adesso![0]} × ${adesso![1]}, presa a mano col bordo.`, `It is now ${adesso![0]} × ${adesso![1]}, set by hand by dragging the edge.`))}
                    </span>
                  </div>
                )}
                <h3 className="opz-sezione" style={stileSezione}>{tr("Grafica", "Graphics")}</h3>
                {riga(tr("Qualità", "Quality"), "qualita", [["automatica", tr("automatica", "automatic")], ["alta", tr("alta", "high")], ["media", tr("media", "medium")], ["bassa", tr("bassa", "low")]], in_(SPIEGA_QUALITA[o.qualita]))}
              </section>
              <section aria-label={tr("Accessibilità", "Accessibility")}>
                <h3 className="opz-sezione" style={stileSezione}>{tr("Accessibilità", "Accessibility")}</h3>
                <div role="group" aria-label={tr("Alta accessibilità", "High accessibility")} className="opz-riga" style={stileRiga}>
                  <span className="opz-nome" style={stileNome}>{tr("Alta accessibilità", "High accessibility")}</span>
                  <span style={{ display: "flex", flexWrap: "wrap", gap: ".5em" }}>
                    {([["si", tr("sì", "yes"), ACCESSIBILE], ["no", "no", NON_ACCESSIBILE]] as const).map(([v, etichetta, valori]) => (
                      <button key={v} type="button" className="opz-valore" aria-pressed={acc === v} onClick={() => cambia(valori)} style={pulsante(acc === v)}>{etichetta}</button>
                    ))}
                  </span>
                  <span className="opz-spiega" style={stileSpiega}>
                    {acc === "personalizzata" ? tr("Personalizzata: righe scelte una per una.", "Custom: rows chosen one by one.") : tr("Accende insieme le cinque righe qui sotto.", "Turns on the five rows below together.")}
                  </span>
                </div>
                {riga(tr("Contrasto", "Contrast"), "contrasto", [["normale", tr("normale", "normal")], ["alto", tr("alto", "high")]])}
                {riga(tr("Testo", "Text"), "testo", [["normale", tr("normale", "normal")], ["grande", tr("grande", "large")]])}
                {riga(tr("Carattere", "Typeface"), "carattere", [["lora", "Lora"], ["atkinson", "Atkinson Hyperlegible"]])}
                {riga(tr("Movimento", "Motion"), "movimento", [["sistema", tr("come il sistema", "as the system")], ["ridotto", tr("ridotto", "reduced")], ["pieno", tr("pieno", "full")]],
                  tr("Ridotto: in partita e nei menu tutto sta fermo. Loghi e trailer restano: Esc li salta.", "Reduced: in the game and the menus everything stays still. Logos and trailer remain: Esc skips them."))}
                {riga(tr("Fuoco", "Focus"), "fuoco", [["normale", tr("normale", "normal")], ["marcato", tr("marcato", "bold")]])}
              </section>
            </div>
          )}
          {scheda === "audio" && (
            <div style={stileColonne}>
              <section aria-label={tr("Volumi", "Volumes")}>
              <h3 className="opz-sezione" style={stileSezione}>{tr("Volumi", "Volumes")}</h3>
              {cursore(tr("Volume generale", "Master volume"), "volume", tr("Alza o abbassa tutto insieme.", "Raises or lowers everything together."))}
              {cursore(tr("Musica", "Music"), "volumeMusica", tr("Il brano del trailer e del menu d'avvio, e in partita la musica di ogni zona.", "The trailer and main menu track, and in the game the music of each zone."))}
              {cursore(tr("Voce", "Voice"), "volumeVoce", tr("Il racconto doppiato e la voce del trailer.", "The voiced story and the trailer's voice."))}
              {cursore(tr("Effetti", "Effects"), "volumeEffetti", tr("I suoni dei loghi e i rumori del trailer.", "The sounds of the logos and the trailer's noises."))}
              </section>
              <section aria-label={tr("Ascolto", "Listening")}>
              <h3 className="opz-sezione" style={stileSezione}>{tr("Ascolto", "Listening")}</h3>
              {riga(tr("Voce del gioco", "Game voice"), "voce", [["recitata", tr("italiana", "Italian")], ["inglese", tr("inglese", "English")], ["nessuna", tr("nessuna", "none")], ["lettore", tr("lettore di schermo", "screen reader")]],
                in_(SPIEGA_VOCE[o.voce]),
                onRiascolta && conVoce(o) && (
                  <button type="button" className="opz-bottone" onClick={onRiascolta} style={{ ...stileBottone, marginLeft: ".6em", padding: ".45em .9em" }}>↻ {tr("riascolta", "replay")}</button>
                ))}
              {riga(tr("Suono", "Sound"), "mono", [[false, "stereo"], [true, "mono"]], tr("Mono: i due canali insieme, per chi sente da un orecchio solo.", "Mono: both channels together, for those who hear with one ear only."))}
              {riga(tr("In secondo piano", "In background"), "secondoPiano", [["continua", tr("continua", "keep playing")], ["silenzia", tr("silenzia", "mute")]], tr("Silenzia: il gioco tace quando lo riduci a icona o passi a un'altra finestra.", "Mute: the game goes quiet when you minimise it or switch to another window."))}
              </section>
            </div>
          )}
        </div>

        <div style={{ marginTop: "1em", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1em", minHeight: "2.6em", flexShrink: 0 }}>
          {domanda ? (
            <span style={{ display: "flex", alignItems: "center", gap: ".8em", flexWrap: "wrap" }}>
              <span style={{ fontFamily: SERIF, fontSize: ".98em", color: "#f4ece0" }}>
                {domanda === "ripristino" ? tr("Tutte le opzioni tornano come al primo avvio? La lingua e la voce restano.", "Put all options back as at first launch? Language and voice stay.")
                  : tr("Tutti i trofei tornano da vincere? I salvataggi restano.", "Put all trophies back up for grabs? Your saves stay.")}
              </span>
              <button type="button" className="opz-bottone" autoFocus style={{ ...stileBottone, background: accento, color: "#140c06", borderColor: accento }}
                onClick={domanda === "ripristino" ? ripristina : azzera}>{tr("sì", "yes")} <b>{tr("S", "Y")}</b></button>
              <button type="button" className="opz-bottone" style={stileBottone} onClick={() => setDomanda(null)}>no <b>N</b></button>
            </span>
          ) : (
            <button type="button" className="opz-bottone" style={stileBottone} onClick={() => setDomanda("ripristino")}>{tr("ripristina le opzioni di base", "restore default options")}</button>
          )}
          <button type="button" className="opz-bottone" style={stileBottone} onClick={onChiudi}>{tr("chiudi", "close")} <b>Esc</b></button>
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
