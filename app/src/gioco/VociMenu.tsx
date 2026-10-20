// ====================================================================
//  Una colonna di voci, come nel menu del Relitto: la usano il menu d'avvio
//  (sull'ultimo fotogramma del trailer) e la pausa. Una voce sola è quella
//  di adesso: il fuoco della tastiera, che il mouse sposta passandoci sopra;
//  ha un filo d'accento ai due lati e il testo pieno. ↑ ↓ (e Inizio, Fine)
//  da una voce all'altra, Invio sceglie, il mouse come sempre. Il fuoco parte
//  sulla prima voce, all'arrivo e quando si chiude ciò che la copriva.
//  Le misure sono in em: la base la dà chi la usa.
// ====================================================================
import { useEffect, useRef, type KeyboardEvent } from "react";
import "./menu.css";

export interface VoceMenu {
  id: string;
  etichetta: string;
  /** una riga piccola sotto: dove riprende «Continua» */
  dettaglio?: string;
  /** il tasto che fa la stessa cosa, piccolo a destra */
  tasto?: string;
  /** la voce che conta di più: più grande, nell'accento */
  principale?: boolean;
  disabilitata?: boolean;
  azione: () => void;
}

interface Props {
  voci: readonly VoceMenu[];
  /** il nome della colonna per il lettore di schermo */
  etichetta: string;
  accento: string;
  /** un pannello sta sopra: la colonna non prende il fuoco */
  coperto?: boolean;
}

export default function VociMenu({ voci, etichetta, accento, coperto = false }: Props) {
  const ref = useRef<HTMLElement>(null);
  const prima = voci.find((v) => !v.disabilitata)?.id;

  // la prima voce col fuoco: dopo i dialoghi che lo prendono all'apertura (il loro effetto viene dopo quello dei figli).
  // Se in cima arriva una voce nuova («Continua», quando i salvataggi sono letti) il fuoco la segue, a meno che chi gioca
  // non l'abbia già spostato; chiuso ciò che copriva la colonna, il fuoco resta dov'era tornato.
  const automatica = useRef<string | null>(null);
  useEffect(() => {
    if (coperto) return;
    const r = requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      const att = document.activeElement as HTMLElement | null;
      if (el.contains(att) && att?.dataset.voce !== automatica.current) return;
      el.querySelector<HTMLButtonElement>(`[data-voce="${prima}"]`)?.focus({ preventScroll: true });
      automatica.current = prima ?? null;
    });
    return () => cancelAnimationFrame(r);
  }, [coperto, prima]);

  const frecce = (e: KeyboardEvent) => {
    const tutti = [...(ref.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") ?? [])];
    if (!tutti.length) return;
    const i = tutti.indexOf(document.activeElement as HTMLButtonElement);
    const j = e.key === "ArrowDown" ? (i + 1) % tutti.length
      : e.key === "ArrowUp" ? (i <= 0 ? tutti.length - 1 : i - 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? tutti.length - 1
      : -1;
    if (j < 0) return;
    e.preventDefault();
    tutti[j].focus({ preventScroll: true });
  };

  return (
    <nav ref={ref} className="mv-voci" aria-label={etichetta} onKeyDown={frecce} style={{ ["--mv-acc" as string]: accento }}>
      {voci.map((v) => (
        <button key={v.id} type="button" data-voce={v.id} disabled={v.disabilitata}
          className={"mv-voce" + (v.principale ? " mv-principale" : "")}
          onMouseEnter={(e) => { if (!coperto && !v.disabilitata) e.currentTarget.focus({ preventScroll: true }); }}
          onClick={v.azione}>
          <span className="mv-etichetta">{v.etichetta}{v.tasto && <span className="mv-tasto">{v.tasto}</span>}</span>
          {v.dettaglio && <span className="mv-dettaglio">{v.dettaglio}</span>}
        </button>
      ))}
    </nav>
  );
}
