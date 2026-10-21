// ====================================================================
//  Shell 16:9 «da emulatore a tutto schermo».
// --------------------------------------------------------------------
//  Container full-viewport NERO; al centro un palco 16:9 grande quanto
//  possibile mantenendo l'aspetto (letterbox: bande sopra/sotto o ai lati).
//  DENTRO il palco si renderizza una superficie a RISOLUZIONE FISSA
//  (1280×720) scalata per riempirlo: così la UI di gioco è un layout
//  desktop PIXEL-PERFECT a qualunque dimensione, come un emulatore — niente
//  reflow, niente stack mobile. Lo schermo intero si sceglie nelle opzioni
//  o con F11 (il tasto che stava sul palco non c'è più: piano 09, D6).
// ====================================================================
import { useLayoutEffect, useRef, useState } from "react";
import ViaggiatorePlayer, { type FinePartita } from "./ViaggiatorePlayer";
import type { Salvataggio } from "../lib/salvataggi";

const DESIGN_W = 1280;
const DESIGN_H = 720;

const GameShell = ({ onExit, onFine, carica = null }: { onExit: () => void; onFine: (f: FinePartita) => void; carica?: Salvataggio | null }) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Scala la superficie di design alla larghezza del palco 16:9.
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / DESIGN_W));
    ro.observe(el);
    setScale(el.clientWidth / DESIGN_W);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="relative flex h-full w-full items-center justify-center bg-black">
      {/* Palco 16:9: il box più grande che entra nel viewport mantenendo 16/9. */}
      <div
        ref={stageRef}
        className="relative overflow-hidden"
        style={{
          width: "min(100vw, calc(100dvh * 16 / 9))",
          height: "min(100dvh, calc(100vw * 9 / 16))",
        }}
      >
        {/* Superficie di design 1280×720, scalata per riempire il palco. */}
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{ width: DESIGN_W, height: DESIGN_H, transform: `scale(${scale})` }}
        >
          <ViaggiatorePlayer onExit={onExit} onFine={onFine} carica={carica} />
        </div>
      </div>
    </div>
  );
};

export default GameShell;
