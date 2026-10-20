// ====================================================================
//  Una domanda sì o no, a parte, al centro: S risponde sì, N (o Esc) no.
//  La usa il menu d'avvio per «Nuovo viaggio» quando c'è un viaggio da
//  continuare. Stesso aspetto dei pannelli; il fuoco entra e torna.
// ====================================================================
import { useEffect, useRef } from "react";
import { useDialogo } from "./useDialogo";
import "./opzioni.css";   // l'anello del fuoco dei pulsanti (opz-bottone)

const SERIF = "'Lora', Georgia, serif";
const MONO = "'Source Code Pro', ui-monospace, monospace";

interface Props {
  base: number;
  accento?: string;
  domanda: string;
  sotto?: string;
  si: string;
  no: string;
  onSi: () => void;
  onNo: () => void;
}

export default function Domanda({ base, accento = "#f0b77e", domanda, sotto, si, no, onSi, onNo }: Props) {
  const dialogo = useDialogo<HTMLDivElement>(onNo);
  // il fuoco su «sì» un attimo dopo l'apertura, non con autoFocus: così il dialogo ricorda chi l'ha aperto e, chiuso,
  // ci riporta il fuoco (con autoFocus avrebbe ricordato il suo stesso pulsante)
  const siRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { const r = requestAnimationFrame(() => siRef.current?.focus()); return () => cancelAnimationFrame(r); }, []);
  useEffect(() => {
    const tasto = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "s") { e.preventDefault(); e.stopPropagation(); onSi(); }
      else if (k === "n") { e.preventDefault(); e.stopPropagation(); onNo(); }
    };
    window.addEventListener("keydown", tasto, true);
    return () => window.removeEventListener("keydown", tasto, true);
  }, [onSi, onNo]);

  const bottone: React.CSSProperties = {
    cursor: "pointer", border: "1px solid rgba(255,255,255,.18)", background: "transparent", color: "#d6dde6", borderRadius: 999,
    fontFamily: MONO, fontSize: ".85em", letterSpacing: ".12em", textTransform: "uppercase", padding: ".65em 1.2em",
  };
  return (
    <div ref={dialogo} tabIndex={-1} role="alertdialog" aria-modal="true" aria-label={domanda}
      style={{ ["--opz-acc" as string]: accento, outline: "none", fontSize: base, position: "absolute", inset: 0, zIndex: 80, display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(4,4,8,.7)", backdropFilter: "blur(5px)", WebkitBackdropFilter: "blur(5px)", animation: "kf-launch .25s ease both", pointerEvents: "auto" }}
      onClick={onNo}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ width: "36em", maxWidth: "92%", boxSizing: "border-box", padding: "1.9em 2.2em 1.6em", borderRadius: "1.1em", textAlign: "center",
          background: "linear-gradient(180deg, rgba(20,18,24,.97), rgba(10,10,14,.98))", border: "1px solid rgba(255,255,255,.08)", boxShadow: "0 2em 6em rgba(0,0,0,.6)" }}>
        <p style={{ margin: 0, fontFamily: SERIF, fontSize: "1.45em", color: "#f4ece0" }}>{domanda}</p>
        {sotto && <p style={{ margin: ".6em 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: ".98em", lineHeight: 1.45, color: "rgba(226,220,208,.74)" }}>{sotto}</p>}
        <div style={{ marginTop: "1.5em", display: "flex", justifyContent: "center", gap: ".8em" }}>
          <button ref={siRef} type="button" className="opz-bottone" onClick={onSi} style={{ ...bottone, background: accento, color: "#140c06", borderColor: accento }}>{si} <b>S</b></button>
          <button type="button" className="opz-bottone" onClick={onNo} style={bottone}>{no} <b>N</b></button>
        </div>
      </div>
    </div>
  );
}
