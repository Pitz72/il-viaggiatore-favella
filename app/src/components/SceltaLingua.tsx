// ====================================================================
//  La prima finestra: la lingua del testo e la voce, prima dei loghi.
// --------------------------------------------------------------------
//  Si apre finché nessuno ha risposto (opzioni.linguaScelta): al primo
//  avvio, e una volta a chi giocava prima della 1.40. Due gruppi di scelte,
//  il testo (italiano, inglese) e la voce (il doppiaggio italiano, quello
//  inglese, nessuna voce, il lettore di schermo), e una riga che dice che in
//  inglese per ora parla il solo narratore. La voce segue il testo finché non
//  la si sceglie. «Continua» scrive le scelte e passa ai loghi; tutte si cambiano
//  poi dalle opzioni. Le parole della finestra seguono il testo scelto, i
//  nomi dei gruppi stanno in tutte e due le lingue (chi arriva non sa ancora
//  quale legge). Il testo parte dalla lingua del sistema.
//  Tastiera: Tab da un gruppo all'altro e a «Continua», le frecce dentro un
//  gruppo (come i gruppi di pulsanti radio), Invio continua da dove si è. Il primo gesto
//  sblocca anche l'audio del browser: i loghi hanno già il loro suono.
// ====================================================================
import { useEffect, useRef, useState } from "react";
import { cambiaOpzioni, opzioni, type Lingua, type ModoVoce } from "../lib/opzioni";
import { scalaTesto } from "../lib/accessibilita";
import { useOpzioni } from "../lib/useOpzioni";
import "../gioco/opzioni.css";

const SERIF = "'Lora', Georgia, serif";
const DISPLAY = "'Sora', 'Inter', sans-serif";
const MONO = "'Source Code Pro', ui-monospace, monospace";
const ACCENTO = "#f0b77e";

type Coppia = { it: string; en: string };
const TESTI: readonly [Lingua, string][] = [["it", "Italiano"], ["en", "English"]];
const VOCI: readonly [ModoVoce, Coppia, Coppia][] = [
  ["recitata", { it: "Italiano", en: "Italian" },
    { it: "Il racconto letto con le voci del doppiaggio: il narratore e i personaggi.", en: "The story read aloud by the Italian voice cast: the narrator and the characters." }],
  ["inglese", { it: "Inglese", en: "English" },
    { it: "Il narratore legge il racconto in inglese; le altre voci, per ora, restano quelle italiane.", en: "The narrator reads the story in English; the other voices are still the Italian ones, for now." }],
  ["nessuna", { it: "Nessuna voce", en: "No voice" },
    { it: "Si legge soltanto, in silenzio.", en: "Text only, in silence." }],
  ["lettore", { it: "Lettore di schermo", en: "Screen reader" },
    { it: "Nessuna voce del gioco: il tuo lettore di schermo legge il diario, riga per riga.", en: "No game voice: your screen reader reads the journal, line by line." }],
];
const PRESTO: Coppia = { it: "In inglese parla per ora il solo narratore: presto anche le altre voci.", en: "In English only the narrator speaks for now: the other voices are coming soon." };
const CONTINUA: Coppia = { it: "continua", en: "continue" };
const CAMBIA: Coppia = { it: "Si cambia quando vuoi, nelle opzioni.", en: "You can change this any time in the options." };

/** La lingua del sistema, se è l'italiano; se no l'inglese. */
const delSistema = (): Lingua => {
  const l = (typeof navigator !== "undefined" && (navigator.languages?.[0] || navigator.language)) || "it";
  return l.toLowerCase().startsWith("it") ? "it" : "en";
};

export default function SceltaLingua({ onFine }: { onFine: () => void }) {
  const [o] = useOpzioni();
  const [testo, setTesto] = useState<Lingua>(() => (opzioni().linguaScelta ? opzioni().lingua : delSistema()));
  // La voce segue il testo (inglese col testo inglese, italiana col testo italiano) finché chi gioca non la sceglie lui.
  const [voce, setVoce] = useState<ModoVoce>(() => {
    const v = opzioni().voce;
    return !opzioni().linguaScelta && delSistema() === "en" && v === "recitata" ? "inglese" : v;
  });
  const voceScelta = useRef(false);
  const scegliVoce = (v: ModoVoce) => { voceScelta.current = true; setVoce(v); };
  const scegliTesto = (l: Lingua) => {
    setTesto(l);
    if (voceScelta.current) return;
    setVoce((v) => (l === "en" && v === "recitata" ? "inglese" : l === "it" && v === "inglese" ? "recitata" : v));
  };
  const fatto = useRef(false);
  const primo = useRef<HTMLButtonElement>(null);
  const t = (c: Coppia) => c[testo];

  // Invio arriva da un ascoltatore messo una volta sola: le scelte di adesso stanno qui
  const scelte = useRef({ testo, voce });
  scelte.current = { testo, voce };
  const continua = () => {
    if (fatto.current) return;
    fatto.current = true;
    cambiaOpzioni({ lingua: scelte.current.testo, voce: scelte.current.voce, linguaScelta: true });
    onFine();
  };

  useEffect(() => {
    primo.current?.focus();
    const tasto = (e: KeyboardEvent) => {
      // Invio continua da qualunque punto (anche da una scelta: la scelta la fanno le frecce, lo Spazio, il clic)
      if (e.key === "Enter") { e.preventDefault(); continua(); }
    };
    window.addEventListener("keydown", tasto);
    return () => window.removeEventListener("keydown", tasto);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // le frecce dentro un gruppo: scelgono la voce accanto e le danno il fuoco (il fuoco segue la scelta, come nei radio)
  const frecce = <T,>(valori: readonly T[], attuale: T, scegli: (v: T) => void) => (e: React.KeyboardEvent<HTMLDivElement>) => {
    const i = valori.indexOf(attuale), n = valori.length;
    const j = e.key === "ArrowRight" || e.key === "ArrowDown" ? (i + 1) % n
      : e.key === "ArrowLeft" || e.key === "ArrowUp" ? (i - 1 + n) % n
      : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : -1;
    if (j < 0) return;
    e.preventDefault();
    scegli(valori[j]);
    const gruppo = e.currentTarget;
    requestAnimationFrame(() => gruppo.querySelectorAll<HTMLElement>("[role=radio]")[j]?.focus());
  };

  const pillola = (scelta: boolean): React.CSSProperties => ({
    cursor: "pointer", border: `1px solid ${scelta ? ACCENTO : "rgba(255,255,255,.2)"}`, borderRadius: 999,
    background: scelta ? ACCENTO : "transparent", color: scelta ? "#140c06" : "#e2e7ee",
    fontFamily: DISPLAY, fontWeight: scelta ? 600 : 500, fontSize: "1em", padding: ".5em 1.25em",
  });
  const spiegaVoce = VOCI.find(([v]) => v === voce)![2];

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="lingua-titolo"
      style={{ ["--opz-acc" as string]: ACCENTO, position: "fixed", inset: 0, background: "#000", color: "#e6e0d6",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "6vh 6vw",
        fontSize: `calc(clamp(15px, 1.45vw, 21px) * ${scalaTesto(o)})`, animation: "kf-launch .6s ease both" }}>
      <div style={{ width: "34em", maxWidth: "100%" }}>
        <p style={{ margin: 0, fontFamily: MONO, fontSize: ".72em", letterSpacing: ".34em", textTransform: "uppercase", color: ACCENTO }}>
          Il Viaggiatore
        </p>
        <h1 id="lingua-titolo" style={{ margin: ".25em 0 1.1em", fontFamily: SERIF, fontWeight: 500, fontSize: "2.1em", letterSpacing: "-.01em", color: "#f4ece0" }}>
          Lingua <span aria-hidden="true" style={{ color: "rgba(244,236,224,.45)" }}>·</span> <span lang="en">Language</span>
        </h1>

        <div className="opz-riga" style={riga}>
          <span id="lingua-testo" className="opz-nome" style={nome}>Testo <span aria-hidden="true">·</span> <span lang="en">Text</span></span>
          <div role="radiogroup" aria-labelledby="lingua-testo" onKeyDown={frecce(TESTI.map(([l]) => l), testo, scegliTesto)}
            style={{ display: "flex", flexWrap: "wrap", gap: ".6em" }}>
            {TESTI.map(([l, etichetta]) => (
              <button key={l} ref={l === testo ? primo : undefined} type="button" role="radio" lang={l} className="opz-valore"
                aria-checked={testo === l} tabIndex={testo === l ? 0 : -1} onClick={() => scegliTesto(l)} style={pillola(testo === l)}>
                {etichetta}
              </button>
            ))}
          </div>
        </div>

        <div className="opz-riga" style={riga}>
          <span id="lingua-voce" className="opz-nome" style={nome}>Voce <span aria-hidden="true">·</span> <span lang="en">Voice</span></span>
          <div role="radiogroup" aria-labelledby="lingua-voce" aria-describedby="lingua-voce-spiega" lang={testo}
            onKeyDown={frecce(VOCI.map(([v]) => v), voce, scegliVoce)} style={{ display: "flex", flexWrap: "wrap", gap: ".6em" }}>
            {VOCI.map(([v, etichetta]) => (
              <button key={v} type="button" role="radio" className="opz-valore" aria-checked={voce === v} tabIndex={voce === v ? 0 : -1}
                onClick={() => scegliVoce(v)} style={pillola(voce === v)}>
                {t(etichetta)}
              </button>
            ))}
          </div>
          <span id="lingua-voce-spiega" lang={testo} style={spiega}>{t(spiegaVoce)}</span>
        </div>

        <p lang={testo} style={{ margin: "1.4em 0 0", fontFamily: SERIF, fontSize: "1em", color: "#f4ece0" }}>
          <span aria-hidden="true" style={{ color: ACCENTO }}>◇ </span>{t(PRESTO)}
        </p>
        <p lang={testo} style={{ ...spiega, margin: ".35em 0 0" }}>{t(CAMBIA)}</p>

        <button type="button" lang={testo} className="opz-bottone" onClick={continua}
          style={{ marginTop: "2em", cursor: "pointer", fontFamily: MONO, fontSize: ".8em", letterSpacing: ".24em", textTransform: "uppercase",
            color: "#140c06", background: ACCENTO, border: `1px solid ${ACCENTO}`, borderRadius: 999, padding: ".85em 1.7em" }}>
          {t(CONTINUA)} <b aria-hidden="true" style={{ marginLeft: ".5em" }}>↵</b>
        </button>
      </div>
    </div>
  );
}

const riga: React.CSSProperties = {
  display: "grid", gridTemplateColumns: "8.5em 1fr", columnGap: "1.2em", rowGap: ".45em", alignItems: "center",
  padding: ".9em 0", borderTop: "1px solid rgba(255,255,255,.08)",
};
const nome: React.CSSProperties = { fontFamily: DISPLAY, fontWeight: 600, fontSize: "1em", color: "#f1f3f7" };
const spiega: React.CSSProperties = {
  gridColumn: "2", fontFamily: SERIF, fontStyle: "italic", fontSize: ".9em", lineHeight: 1.45, color: "rgba(226,220,208,.74)",
};
