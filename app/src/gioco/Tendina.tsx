// ====================================================================
//  La tendina: il riquadro che si apre ACCANTO a ciò che si è toccato (una
//  cosa o una persona del luogo, un oggetto della bisaccia, una parola del
//  diario, «Bevi», una scorta). Dentro c'è ciò che si può fare: il menu
//  della cosa, la seconda cosa di «usa … su», le dosi del bere e del
//  mangiare. Il gioco non cambia forma sotto: la plancia resta com'è.
// --------------------------------------------------------------------
//  Sta sopra l'àncora se l'àncora è nella plancia o nel diario, alla sua
//  sinistra se è nella colonna di destra; non esce mai dalla superficie di
//  gioco (1280×720, scalata sullo schermo: le misure si riportano alla
//  scala). Un clic fuori la chiude (non sull'àncora, che la apre e la chiude
//  da sé); Esc la chiude dal gioco. Le frecce ↑ ↓ passano da una voce
//  all'altra; con `fuoco` (coi pulsanti) la prima voce prende il fuoco a
//  ogni contenuto nuovo (`chiave`).
// ====================================================================
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

const MARGINE = 8;

interface Props {
  ancora: HTMLElement | null;
  /** cambia quando cambia il contenuto (il menu, poi «usa su…»): la tendina si rimisura e, con `fuoco`, lo prende */
  chiave: string;
  etichetta: string;
  fuoco: boolean;
  onChiudi: () => void;
  children: ReactNode;
}

export default function Tendina({ ancora, chiave, etichetta, fuoco, onChiudi, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const chiudi = useRef(onChiudi);
  chiudi.current = onChiudi;

  useLayoutEffect(() => {
    const el = ref.current;
    const radice = el?.offsetParent as HTMLElement | null;
    if (!el || !radice || !ancora?.isConnected) { setPos(null); return; }
    const r = radice.getBoundingClientRect();
    const scala = r.width / radice.offsetWidth || 1;
    const a = ancora.getBoundingClientRect();
    const ax = (a.left - r.left) / scala, ay = (a.top - r.top) / scala, ah = a.height / scala;
    const w = el.offsetWidth, h = el.offsetHeight, H = radice.offsetHeight;
    let W = radice.offsetWidth;
    let left: number, top: number;
    if (ancora.closest(".vg-lato")) {
      left = ax - w - MARGINE * 1.5;
      top = ay;
    } else {
      // dalla plancia o dal diario la tendina resta nella colonna del diario, senza coprire quella di destra
      const colonna = ancora.closest<HTMLElement>(".vg-diario-col");
      if (colonna) W = (colonna.getBoundingClientRect().right - r.left) / scala;
      left = ax;
      top = ay - h - MARGINE;
      if (top < MARGINE) top = ay + ah + MARGINE;
    }
    left = Math.round(Math.max(MARGINE, Math.min(W - w - MARGINE, left)));
    top = Math.round(Math.max(MARGINE, Math.min(H - h - MARGINE, top)));
    setPos((p) => (p && p.left === left && p.top === top ? p : { left, top }));
  }, [ancora, chiave]);

  // il fuoco quando la tendina è al suo posto (nascosta, mentre si misura, non lo prenderebbe): sulla prima voce
  // o dose che si può scegliere, non su ‹ o ✕
  const alPosto = pos !== null;
  useEffect(() => {
    if (!fuoco || !alPosto) return;
    const r = ref.current;
    (r?.querySelector<HTMLElement>(".vg-tendina-voci button:not(:disabled), .vg-dosi button:not(:disabled)")
      ?? r?.querySelector<HTMLElement>("button:not(:disabled)"))?.focus();
  }, [chiave, fuoco, alPosto]);

  // un clic fuori la chiude; sull'àncora no, che la apre e la chiude da sé
  useEffect(() => {
    const giu = (e: PointerEvent) => {
      const t = e.target as Node;
      if (ref.current?.contains(t) || ancora?.contains(t)) return;
      chiudi.current();
    };
    document.addEventListener("pointerdown", giu, true);
    return () => document.removeEventListener("pointerdown", giu, true);
  }, [ancora]);

  const frecce = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const voci = Array.from(ref.current?.querySelectorAll<HTMLElement>("button:not(:disabled)") ?? []);
    if (!voci.length) return;
    e.preventDefault();
    const i = voci.indexOf(document.activeElement as HTMLElement);
    const j = e.key === "ArrowDown" ? (i + 1) % voci.length : (i <= 0 ? voci.length - 1 : i - 1);
    voci[j].focus();
  };

  return (
    <div ref={ref} className="vg-tendina" role="group" aria-label={etichetta} onKeyDown={frecce}
      style={pos ? { left: pos.left, top: pos.top } : { left: 0, top: 0, visibility: "hidden" }}>
      {children}
    </div>
  );
}
