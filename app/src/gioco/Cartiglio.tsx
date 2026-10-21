// ====================================================================
//  Il cartiglio: una riga breve in alto, al centro, che compare e svanisce
//  da sola («Salvato · rapido»). Non prende il fuoco e non si tocca; il
//  lettore di schermo lo sente (role status, o alert se è un problema).
//  Ogni cartiglio nuovo prende il posto del precedente (`n` cambia).
//  Un trofeo vinto (piano 09, §7.1) ha il suo: «Trofeo · Il cavallo di
//  legno», col medaglione, per quattro secondi.
// ====================================================================
import { useEffect, useState } from "react";

export interface DatiCartiglio { n: number; testo: string; grave?: boolean; trofeo?: boolean }

const MONO = "'Source Code Pro', ui-monospace, monospace";
const SERIF = "'Lora', Georgia, serif";
const DURATA = 2600;
export const DURATA_TROFEO = 4000;

export default function Cartiglio({ dati, accento }: { dati: DatiCartiglio | null; accento: string }) {
  const [visibile, setVisibile] = useState<DatiCartiglio | null>(null);
  const durata = (d: DatiCartiglio) => (d.trofeo ? DURATA_TROFEO : d.grave ? DURATA * 2 : DURATA);
  useEffect(() => {
    // senza dati il cartiglio sparisce subito (la schermata finale: un trofeo non le sta sopra)
    if (!dati) { setVisibile(null); return; }
    setVisibile(dati);
    const t = setTimeout(() => setVisibile((v) => (v?.n === dati.n ? null : v)), durata(dati));
    return () => clearTimeout(t);
  }, [dati]);
  if (!visibile) return null;
  return (
    <div key={visibile.n} role={visibile.grave ? "alert" : "status"} className="vg-cartiglio"
      style={{ position: "absolute", left: "50%", top: 54, transform: "translateX(-50%)", zIndex: 90, pointerEvents: "none",
        display: "flex", alignItems: "center", gap: 10,
        padding: visibile.trofeo ? "7px 18px 7px 8px" : "8px 18px", borderRadius: 999, background: "rgba(10,10,14,.92)", border: `1px solid ${visibile.grave ? "#f28b6b" : accento}`,
        boxShadow: "0 8px 30px rgba(0,0,0,.5)", fontFamily: MONO, fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase",
        color: visibile.grave ? "#f6b19b" : "#f4ece0", whiteSpace: "nowrap", animation: `vg-cartiglio ${durata(visibile)}ms ease both` }}>
      {visibile.trofeo ? (
        <>
          <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke={accento} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6.5 L13.6 10.1 L17.5 10.4 L14.5 13 L15.4 16.8 L12 14.8 L8.6 16.8 L9.5 13 L6.5 10.4 L10.4 10.1 Z" />
          </svg>
          <span style={{ color: accento }}>Trofeo</span>
          <span aria-hidden="true" style={{ opacity: 0.5 }}>·</span>
          <span style={{ fontFamily: SERIF, fontSize: 15, letterSpacing: 0, textTransform: "none", color: "#f4ece0" }}>{visibile.testo}</span>
        </>
      ) : visibile.testo}
    </div>
  );
}
