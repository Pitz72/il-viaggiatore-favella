// Il gancio React del deposito delle opzioni (lib/opzioni.ts): chi lo usa si ridisegna a ogni cambio.
import { useEffect, useState } from "react";
import { ascoltaOpzioni, cambiaOpzioni, opzioni, type Lingua, type Opzioni } from "./opzioni";

export function useOpzioni(): [Opzioni, (cambio: Partial<Opzioni>) => void] {
  const [o, setO] = useState<Opzioni>(opzioni);
  useEffect(() => {
    setO(opzioni());   // un cambio arrivato fra il primo disegno e l'ascolto
    return ascoltaOpzioni(setO);
  }, []);
  return [o, cambiaOpzioni];
}

/** Soltanto la lingua: chi la usa si ridisegna quando cambia lei, non a ogni volume spostato. */
export function useLingua(): Lingua {
  const [l, setL] = useState<Lingua>(() => opzioni().lingua);
  useEffect(() => {
    setL(opzioni().lingua);
    return ascoltaOpzioni((o) => setL(o.lingua));
  }, []);
  return l;
}
