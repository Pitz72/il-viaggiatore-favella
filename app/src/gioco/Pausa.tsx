// ====================================================================
//  La pausa (pre-produzione/09-opzioni-menu-pausa.md, §5): Esc a riga vuota,
//  o «☰ pausa» in testata. Sopra la partita velata, la stessa colonna di voci
//  del menu d'avvio: riprendi, salva, carica, opzioni, come si gioca, torna
//  al menu, esci. Esc riprende. Ciò che si apre da qui (le opzioni, il
//  taccuino, la guida) le sta sopra; chiudendolo si torna alla pausa.
// ====================================================================
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
  onOpzioni: () => void;
  onGuida: () => void;
  onMenu: () => void;
  /** solo desktop */
  onEsci?: () => void;
}

export default function Pausa({ accento, coperta, puoSalvare, onRiprendi, onSalva, onCarica, onOpzioni, onGuida, onMenu, onEsci }: Props) {
  const copertaRef = useRef(coperta);
  copertaRef.current = coperta;
  const dialogo = useDialogo<HTMLDivElement>(onRiprendi, () => copertaRef.current);

  const voci: VoceMenu[] = [
    { id: "riprendi", etichetta: "Riprendi", tasto: "Esc", principale: true, azione: onRiprendi },
    { id: "salva", etichetta: "Salva", disabilitata: !puoSalvare, azione: onSalva },
    { id: "carica", etichetta: "Carica", azione: onCarica },
    { id: "opzioni", etichetta: "Opzioni", azione: onOpzioni },
    { id: "guida", etichetta: "Come si gioca", azione: onGuida },
    { id: "menu", etichetta: "Torna al menu d'avvio", azione: onMenu },
    ...(onEsci ? [{ id: "esci", etichetta: "Esci dal gioco", azione: onEsci }] : []),
  ];

  return (
    <div ref={dialogo} tabIndex={-1} role="dialog" aria-modal="true" aria-label="In pausa"
      style={{ outline: "none", fontSize: 15, position: "absolute", inset: 0, zIndex: 65, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        background: "radial-gradient(60% 70% at 50% 50%, rgba(6,5,10,.9) 0%, rgba(6,5,10,.82) 60%, rgba(6,5,10,.7) 100%)",
        backdropFilter: "blur(5px)", WebkitBackdropFilter: "blur(5px)", animation: "kf-launch .25s ease both", pointerEvents: "auto" }}>
      <p style={{ margin: 0, fontFamily: MONO, fontSize: ".75em", letterSpacing: ".34em", textTransform: "uppercase", color: accento }}>il viaggio si ferma</p>
      <h2 style={{ margin: ".25em 0 .9em", fontFamily: SERIF, fontWeight: 500, fontSize: "2.4em", color: "#f4ece0", letterSpacing: "-.01em" }}>In pausa</h2>
      <VociMenu voci={voci} etichetta="La pausa" accento={accento} coperto={coperta} />
      <p style={{ margin: "1.8em 0 0", fontFamily: MONO, fontSize: ".72em", letterSpacing: ".14em", color: "rgba(214,224,238,.42)" }}>↑↓ scegli · Invio conferma · Esc riprende</p>
    </div>
  );
}
