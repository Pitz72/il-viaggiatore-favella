// ====================================================================
//  «Come si gioca»: la guida, un solo componente per il menu d'avvio del
//  trailer e per il gioco. Misure in em: la dimensione base arriva da fuori
//  (`base`), così si adatta alla superficie 1920 del trailer, alla 1280 del
//  gioco e a una finestra piccola; nessun testo scende sotto .85em (11 px a base 13). Esc la chiude;
//  il fuoco entra e torna (useDialogo).
//  Le schede parlano del modo dei comandi scelto nelle opzioni (piano 09, §3.3): con «solo
//  pulsanti» non dicono di scrivere e non mostrano comandi da scrivere, con «solo parole» non
//  dicono di toccare. I colori sono nel componente: col contrasto alto li supera accessibilita.css
//  (le classi csg-*).
// ====================================================================
import { useDialogo } from "./useDialogo";
import { useOpzioni } from "../lib/useOpzioni";
import { scalaTesto } from "../lib/accessibilita";
import type { ModoComandi } from "../lib/opzioni";

const SERIF = "'Lora', Georgia, serif";
const DISPLAY = "'Sora', 'Inter', sans-serif";
const MONO = "'Source Code Pro', ui-monospace, monospace";

interface Scheda { titolo: string; segno: string; testo: string; esempi?: string[] }

/** Le schede della guida, dette per il modo dei comandi. */
function schede(modo: ModoComandi): Scheda[] {
  const tocca = modo !== "parole", scrive = modo !== "pulsanti";
  // in «solo pulsanti» niente comandi da scrivere sotto le schede
  const es = (esempi: string[]) => (scrive ? esempi : undefined);
  return [
    modo === "entrambi"
      ? { titolo: "Scrivi o tocca", segno: "M4 18 L16 6 M13 5 L17 9 M4 18 L3 21 L6 20",
          testo: "Si gioca a parole, in italiano: scrivi un comando e premi Invio. Ma ogni cosa che puoi fare è anche un pulsante (uscite, cose, persone, azioni) e manda lo stesso comando. Le parole in maiuscolo del testo si toccano. Nelle opzioni puoi giocare solo coi pulsanti, o solo a parole.",
          esempi: ["guarda", "nord", "esamina la mappa", "prendi il coltello", "parla con Nunzio"] }
      : modo === "pulsanti"
      ? { titolo: "Tocca", segno: "M9 11 V5 A1.5 1.5 0 0 1 12 5 V11 M12 10 A1.5 1.5 0 0 1 15 10 V12 M15 11 A1.5 1.5 0 0 1 18 11 V15 C18 18 16 21 12 21 C9 21 7 19 6 16 L4.5 12.5 A1.5 1.5 0 0 1 7 11 L9 14",
          testo: "Si gioca coi pulsanti: le uscite, le cose e le persone del luogo, le azioni. Ogni pulsante manda un comando del gioco, come se lo scrivessi. Le parole in maiuscolo del testo si toccano. Con la tastiera, Tab passa da un pulsante all'altro e Invio sceglie." }
      : { titolo: "Scrivi", segno: "M4 18 L16 6 M13 5 L17 9 M4 18 L3 21 L6 20",
          testo: "Si gioca a parole, in italiano, come nelle avventure testuali: scrivi un comando e premi Invio. Le uscite, le cose e le persone sono nel testo. Le frecce ↑ e ↓ ripescano i comandi già dati.",
          esempi: ["guarda", "nord", "esamina la mappa", "prendi il coltello", "parla con Nunzio"] },
    { titolo: "Il corpo", segno: "M12 3 C8 9 6 12 6 15 A6 6 0 0 0 18 15 C18 12 16 9 12 3 Z",
      testo: "La sete sale col tempo e sotto il sole; la fame più piano. Oltre certe soglie la vita cala, e torna poco. " + (tocca
        ? "Tocca l'acqua o il cibo fra le scorte (o la tanica): «Vuoi bere?», «Vuoi mangiare?», e scegli quanti sorsi, quante porzioni."
        : "Scrivi quanto bere e quanto mangiare; STATO ti dice come stai."),
      esempi: es(["bevi", "bevi due sorsi", "mangia", "mangia tre porzioni", "stato"]) },
    { titolo: "Acqua, cibo, baratto", segno: "M5 9 H19 L17 20 H7 Z M9 9 V6 A3 3 0 0 1 15 6 V9",
      testo: "Acqua e cibo sono scorte che si contano. Si barattano parlando con le persone, si trovano attingendo dove l'acqua c'è ancora. Prima di una scelta che costa (un baratto, un dono, una violenza) il gioco chiede conferma e ti mostra cosa dai e cosa ricevi.",
      esempi: es(["attingi", "parla con Ciro"]) },
    { titolo: "Parlare", segno: "M4 5 H20 V15 H10 L6 19 V15 H4 Z",
      testo: (modo === "entrambi" ? "Nei dialoghi scegli una risposta col numero o toccandola."
        : modo === "pulsanti" ? "Nei dialoghi tocca la risposta che vuoi dare."
        : "Nei dialoghi scrivi il numero della risposta.") + " I doni fanno crescere la fiducia, e la fiducia apre porte, pozzi, sentieri.",
      esempi: es(["1", "2"]) },
    { titolo: "La bisaccia", segno: "M6 8 H18 L19 20 H5 Z M9 8 A3 3 0 0 1 15 8",
      testo: "Porti sette cose: la tanica e il biglietto di casa, più cinque a scelta. Quando è piena, lascia ciò che non serve. " + (tocca
        ? "Alcune cose si usano su altre: tocca una cosa e scegli «usa su…», poi su che cosa. Il gioco non dice quali coppie funzionano: tocca a te provare." + (scrive ? " Scrivendo è lo stesso." : "")
        : "Alcune cose si usano su altre: USA una cosa SU un'altra. Il gioco non dice quali coppie funzionano: tocca a te provare."),
      esempi: es(["inventario", "lascia la batteria", "usa il coltello sulla mappa"]) },
    { titolo: "Leggere il mondo", segno: "M3 12 C6 6 18 6 21 12 C18 18 6 18 3 12 Z M12 9 A3 3 0 1 0 12 15 A3 3 0 1 0 12 9",
      testo: "Le parole in MAIUSCOLO sono cose con cui fare qualcosa; tra parentesi ci sono i suggerimenti. "
        + (tocca ? "Se sbagli una mossa, ↶ annulla (o Ctrl+Z) ti riporta indietro. " : "Se sbagli una mossa, ANNULLA (o Ctrl+Z) ti riporta indietro. ")
        + "Il racconto ha una voce: un tasto la ferma, F2 la ridice, le opzioni la regolano. "
        + (scrive ? "Esc (o PAUSA) mette in pausa: da lì le opzioni, questa guida, il menu d'avvio. " : "Esc mette in pausa: da lì le opzioni, questa guida, il menu d'avvio. ")
        + "Sei finali: come arrivi decide quale.",
      esempi: es(["annulla"]) },
  ];
}

export default function ComeSiGioca({ base, accento = "#f0b77e", onChiudi, compatto = false }:
  { base: number; accento?: string; onChiudi: () => void; compatto?: boolean }) {
  const dialogo = useDialogo<HTMLDivElement>(onChiudi);   // Esc chiude, anche in partita
  const [opz] = useOpzioni();
  const SCHEDE = schede(opz.comandi);
  return (
    <div ref={dialogo} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Come si gioca"
      style={{ outline: "none", fontSize: base * scalaTesto(opz), position: "absolute", inset: 0, zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(4,4,8,.72)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", animation: "kf-launch .35s ease both", pointerEvents: "auto" }}
      onClick={onChiudi}>
      <div onClick={(e) => e.stopPropagation()} className="gv-scroll"
        style={{ width: compatto ? "100%" : "min(88em, 96%)", maxHeight: compatto ? "100%" : "94%", overflowY: "auto", boxSizing: "border-box",
          padding: compatto ? "1.6em 1.2em 2em" : "1.9em 2.4em 1.7em", borderRadius: compatto ? 0 : "1.2em",
          background: "linear-gradient(180deg, rgba(20,18,24,.96), rgba(10,10,14,.97))", border: compatto ? "none" : "1px solid rgba(255,255,255,.08)",
          boxShadow: "0 2em 6em rgba(0,0,0,.6)" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "1em" }}>
          <div>
            <p style={{ margin: 0, fontFamily: MONO, fontSize: ".85em", letterSpacing: ".26em", textTransform: "uppercase", color: accento }}>prima di partire</p>
            <h2 style={{ margin: ".2em 0 0", fontFamily: SERIF, fontWeight: 500, fontSize: "2em", color: "#f4ece0", letterSpacing: "-.01em" }}>Come si gioca</h2>
          </div>
          <button onClick={onChiudi} aria-label="Chiudi la guida" className="csg-chiudi"
            style={{ cursor: "pointer", flexShrink: 0, border: "1px solid rgba(255,255,255,.16)", background: "transparent", color: "#c9d2de", borderRadius: 999,
              fontFamily: MONO, fontSize: ".85em", letterSpacing: ".14em", textTransform: "uppercase", padding: ".6em 1.1em" }}>chiudi ✕</button>
        </div>
        <div className="csg-griglia" style={{ marginTop: "1.4em", display: "grid", gridTemplateColumns: compatto ? "1fr" : "1fr 1fr 1fr", gap: "1em" }}>
          {SCHEDE.map((s) => (
            <section key={s.titolo} className="csg-scheda" style={{ padding: "1em 1.1em 1.1em", borderRadius: ".8em", background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.06)" }}>
              <svg viewBox="0 0 24 24" width="1.7em" height="1.7em" fill="none" stroke={accento} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={s.segno} />
              </svg>
              <h3 style={{ margin: ".55em 0 0", fontFamily: DISPLAY, fontWeight: 600, fontSize: "1.05em", color: "#f1f3f7" }}>{s.titolo}</h3>
              <p className="csg-testo" style={{ margin: ".5em 0 0", fontFamily: SERIF, fontSize: ".92em", lineHeight: 1.45, color: "rgba(226,220,208,.78)" }}>{s.testo}</p>
              {s.esempi && (
                <div className="csg-esempi" style={{ marginTop: ".7em", display: "flex", flexWrap: "wrap", gap: ".4em" }}>
                  {s.esempi.map((e) => (
                    <code key={e} className="csg-esempio" style={{ fontFamily: MONO, fontSize: ".85em", color: accento, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: ".45em", padding: ".3em .6em" }}>{e}</code>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
        <p className="csg-piede" style={{ margin: "1.2em 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: ".95em", color: "rgba(226,220,208,.6)", textAlign: "center" }}>
          Non c'è fretta. Il tempo passa solo quando fai qualcosa.
        </p>
      </div>
    </div>
  );
}
