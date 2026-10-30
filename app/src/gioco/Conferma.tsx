// ====================================================================
//  La conferma di una scelta che costa.
// --------------------------------------------------------------------
//  Si apre PRIMA che il comando parta: dice cosa si dà e cosa si riceve,
//  come resterebbero le scorte, e lascia la mano libera di ripensarci. Il
//  «No» è il pulsante che ha il fuoco: un Invio distratto non baratta niente.
//  Tasti: S conferma, N o Esc rinunciano (in inglese anche Y conferma).
//  In inglese le parole della conferma (composte in italiano da azioni.ts) si
//  traducono qui, quando si mostrano (traduci.ts).
// ====================================================================
import { useEffect, useRef } from "react";
import type { Conferma as DatiConferma } from "./azioni";
import { comandoInglese, confermaInglese } from "./traduci";
import { inglese, tr } from "../lib/lingua";

interface Props {
  conferma: DatiConferma;
  /** ciò che il giocatore ha toccato o scritto («Ti do l'orologio per dell'acqua.») */
  etichetta: string;
  puoAnnullare: boolean;
  onSi: () => void;
  onNo: () => void;
}

const Elenco = ({ titolo, voci, tono }: { titolo: string; voci: string[]; tono: "meno" | "piu" | "pesa" }) => (
  <div className={`vg-conf-col vg-conf-${tono}`}>
    <span className="vg-conf-titolo">{titolo}</span>
    <ul>{voci.map((v) => <li key={v}>{v}</li>)}</ul>
  </div>
);

export default function Conferma({ conferma, etichetta, puoAnnullare, onSi, onNo }: Props) {
  const en = inglese();
  const c = en ? confermaInglese(conferma) : conferma;
  const no = useRef<HTMLButtonElement>(null);
  useEffect(() => { no.current?.focus(); }, []);
  useEffect(() => {
    const tasto = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "escape" || k === "n") { e.preventDefault(); e.stopPropagation(); onNo(); }
      else if (k === "s" || k === "y") { e.preventDefault(); e.stopPropagation(); onSi(); }
    };
    window.addEventListener("keydown", tasto, true);
    return () => window.removeEventListener("keydown", tasto, true);
  }, [onSi, onNo]);

  return (
    <div className="vg-conf-velo" role="alertdialog" aria-modal="true" aria-labelledby="vg-conf-domanda" onClick={onNo}>
      <div className={`vg-conf vg-conf-tipo-${c.tipo}`} onClick={(e) => e.stopPropagation()}>
        <p className="vg-sopratitolo">{c.segno}</p>
        <p className="vg-conf-quota">{en ? comandoInglese(etichetta) : etichetta}</p>
        <h2 id="vg-conf-domanda">{c.domanda}</h2>
        {(c.perdi.length > 0 || c.ottieni.length > 0) && (
          <div className="vg-conf-conti">
            {c.perdi.length > 0 && <Elenco titolo={c.tipo === "danno" ? tr("ti costa", "it costs you") : tr("dai", "you give")} voci={c.perdi} tono="meno" />}
            {c.perdi.length > 0 && c.ottieni.length > 0 && <span className="vg-conf-freccia" aria-hidden="true">→</span>}
            {c.ottieni.length > 0 && <Elenco titolo={tr("ricevi", "you get")} voci={c.ottieni} tono="piu" />}
          </div>
        )}
        {c.pesa.length > 0 && <p className="vg-conf-pesa">{tr("Ti pesa", "It weighs on you")}: {c.pesa.join(", ")}.</p>}
        {c.spreco && <p className="vg-conf-pesa vg-conf-spreco" role="note">{c.spreco}</p>}
        {(c.perdi.length > 0 || c.ottieni.length > 0) && <p className="vg-conf-dopo">{tr("Ti resterebbero", "You would have left")}: {c.dopo}</p>}
        <div className="vg-conf-azioni">
          <button ref={no} className="vg-bottone" onClick={onNo}>{tr("No, ci ripenso", "No, let me think")} <kbd>N</kbd></button>
          <button className="vg-bottone vg-pieno" onClick={onSi}>{tr("Sì, procedo", "Yes, go ahead")} <kbd>{tr("S", "Y")}</kbd></button>
        </div>
        {puoAnnullare && <p className="vg-conf-nota">{tr("Dopo, se ti pesa, puoi tornare indietro con ↶ annulla.", "Afterwards, if it weighs on you, you can go back with ↶ undo.")}</p>}
      </div>
    </div>
  );
}
