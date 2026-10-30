// ====================================================================
//  La pausa (pre-produzione/09-opzioni-menu-pausa.md, §5): Esc a riga vuota,
//  o «☰ pausa» in testata. Sopra la partita velata, la stessa colonna di voci
//  del menu d'avvio: riprendi, salva, carica, trofei, opzioni, come si gioca,
//  torna al menu, esci. Esc riprende. Ciò che si apre da qui (le opzioni, il
//  taccuino, la guida) le sta sopra; chiudendolo si torna alla pausa.
// ====================================================================
import { scalaTesto } from "../lib/accessibilita";
import { useOpzioni } from "../lib/useOpzioni";
import { tr } from "../lib/lingua";
import { useRef } from "react";
import { useDialogo } from "./useDialogo";
import VociMenu, { type VoceMenu } from "./VociMenu";

const SERIF = "'Lora', Georgia, serif";
const MONO = "'Source Code Pro', ui-monospace, monospace";

interface Props {
  accento: string;
  /** un pannello aperto dalla pausa le sta sopra: Esc e Tab sono suoi */
  coperta: boolean;
  /** a partita finita non si salva */
  puoSalvare: boolean;
  onRiprendi: () => void;
  onSalva: () => void;
  onCarica: () => void;
  onTrofei: () => void;
  onOpzioni: () => void;
  onGuida: () => void;
  onMenu: () => void;
  /** solo desktop */
  onEsci?: () => void;
}

export default function Pausa({ accento, coperta, puoSalvare, onRiprendi, onSalva, onCarica, onTrofei, onOpzioni, onGuida, onMenu, onEsci }: Props) {
  const [opz] = useOpzioni();
  const copertaRef = useRef(coperta);
  copertaRef.current = coperta;
  const dialogo = useDialogo<HTMLDivElement>(onRiprendi, () => copertaRef.current);

  const voci: VoceMenu[] = [
    { id: "riprendi", etichetta: tr("Riprendi", "Resume"), tasto: "Esc", principale: true, azione: onRiprendi },
    { id: "salva", etichetta: tr("Salva", "Save"), disabilitata: !puoSalvare, azione: onSalva },
    { id: "carica", etichetta: tr("Carica", "Load"), azione: onCarica },
    { id: "trofei", etichetta: tr("Trofei", "Trophies"), azione: onTrofei },
    { id: "opzioni", etichetta: tr("Opzioni", "Options"), azione: onOpzioni },
    { id: "guida", etichetta: tr("Come si gioca", "How to play"), azione: onGuida },
    { id: "menu", etichetta: tr("Torna al menu d'avvio", "Back to the main menu"), azione: onMenu },
    ...(onEsci ? [{ id: "esci", etichetta: tr("Esci dal gioco", "Quit the game"), azione: onEsci }] : []),
  ];

  return (
    <div ref={dialogo} tabIndex={-1} role="dialog" aria-modal="true" aria-label={tr("In pausa", "Paused")}
      style={{ outline: "none", fontSize: 15 * scalaTesto(opz), position: "absolute", inset: 0, zIndex: 65, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        background: "radial-gradient(60% 70% at 50% 50%, rgba(6,5,10,.9) 0%, rgba(6,5,10,.82) 60%, rgba(6,5,10,.7) 100%)",
        backdropFilter: "blur(5px)", WebkitBackdropFilter: "blur(5px)", animation: "kf-launch .25s ease both", pointerEvents: "auto" }}>
      <p style={{ margin: 0, fontFamily: MONO, fontSize: ".75em", letterSpacing: ".34em", textTransform: "uppercase", color: accento }}>{tr("il viaggio si ferma", "the journey stops")}</p>
      <h2 style={{ margin: ".25em 0 .9em", fontFamily: SERIF, fontWeight: 500, fontSize: "2.4em", color: "#f4ece0", letterSpacing: "-.01em" }}>{tr("In pausa", "Paused")}</h2>
      <VociMenu voci={voci} etichetta={tr("La pausa", "Pause")} accento={accento} coperto={coperta} />
      <p className="mv-nota" style={{ margin: "1.8em 0 0", fontFamily: MONO, fontSize: ".72em", letterSpacing: ".14em", color: "rgba(214,224,238,.42)" }}>{tr("↑↓ scegli · Invio conferma · Esc riprende", "↑↓ choose · Enter confirms · Esc resumes")}</p>
    </div>
  );
}
