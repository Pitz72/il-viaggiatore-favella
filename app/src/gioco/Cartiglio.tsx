// ====================================================================
//  Il cartiglio: una riga breve in alto, al centro, che compare e svanisce
//  da sola («Salvato · rapido»). Non prende il fuoco e non si tocca; il
//  lettore di schermo lo sente (role status, o alert se è un problema).
//  Ogni cartiglio nuovo prende il posto del precedente (`n` cambia).
// ====================================================================
import { useEffect, useState } from "react";

export interface DatiCartiglio { n: number; testo: string; grave?: boolean }

const MONO = "'Source Code Pro', ui-monospace, monospace";
const DURATA = 2600;

export default function Cartiglio({ dati, accento }: { dati: DatiCartiglio | null; accento: string }) {
  const [visibile, setVisibile] = useState<DatiCartiglio | null>(null);
  useEffect(() => {
    if (!dati) return;
    setVisibile(dati);
    const t = setTimeout(() => setVisibile((v) => (v?.n === dati.n ? null : v)), dati.grave ? DURATA * 2 : DURATA);
    return () => clearTimeout(t);
  }, [dati]);
  if (!visibile) return null;
  return (
    <div key={visibile.n} role={visibile.grave ? "alert" : "status"}
      style={{ position: "absolute", left: "50%", top: 54, transform: "translateX(-50%)", zIndex: 90, pointerEvents: "none",
        padding: "8px 18px", borderRadius: 999, background: "rgba(10,10,14,.9)", border: `1px solid ${visibile.grave ? "#f28b6b" : accento}`,
        boxShadow: "0 8px 30px rgba(0,0,0,.5)", fontFamily: MONO, fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase",
        color: visibile.grave ? "#f6b19b" : "#f4ece0", whiteSpace: "nowrap", animation: `vg-cartiglio ${visibile.grave ? DURATA * 2 : DURATA}ms ease both` }}>
      {visibile.testo}
    </div>
  );
}
