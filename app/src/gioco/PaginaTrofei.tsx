// ====================================================================
//  La pagina dei trofei (pre-produzione/09-opzioni-menu-pausa.md, §7.2).
// --------------------------------------------------------------------
//  Dal menu d'avvio, dalla pausa e dalla schermata finale. Come il taccuino:
//  un pannello largo e di misura fissa, in due colonne, senza scorrere. A
//  sinistra le famiglie, ognuna coi suoi medaglioni (il segno della famiglia
//  disegnato a linee, nell'accento); a destra il trofeo scelto: vinto, il
//  nome, la frase e la data; non ancora, il nome coperto e l'accenno.
//  In testa il conto («12 di 30») e una barra sottile.
//  Tastiera: le frecce da un medaglione all'altro (su e giù fra le
//  famiglie), Inizio e Fine; Esc chiude. Un medaglione solo ha il fuoco
//  (tabindex mobile), e il fuoco non disegna il riquadro del browser.
// ====================================================================
import { useEffect, useMemo, useRef, useState } from "react";
import { scalaTesto } from "../lib/accessibilita";
import { useOpzioni } from "../lib/useOpzioni";
import { ascoltaTrofei, deposito, depositoOra, type Deposito } from "../lib/trofei";
import { dataLeggibile } from "../lib/salvataggi";
import { FAMIGLIE, TROFEI, type Famiglia, type Trofeo } from "./trofei";
import { useDialogo } from "./useDialogo";
import "./trofei.css";

const SERIF = "'Lora', Georgia, serif";
const MONO = "'Source Code Pro', ui-monospace, monospace";

/** Il segno di ogni famiglia, a linee come le icone di «Come si gioca». */
export const SEGNI: Record<Famiglia, string> = {
  finali: "M4.5 11 L12 4.5 L19.5 11 V19.5 H4.5 Z M10 19.5 V14.5 H14 V19.5",
  fini: "M3.5 17.5 H20.5 M7 17.5 A5 5 0 0 1 17 17.5 M12 9 V7 M7 11.5 L5.6 10.1 M17 11.5 L18.4 10.1",
  gesti: "M4.5 12.5 C4.5 8.5 8 6.5 12 6.5 C16 6.5 19.5 8.5 19.5 12.5 V16.5 H4.5 Z M8.5 9.5 L9.2 12 M12 8.8 V12 M15.5 9.5 L14.8 12",
  modi: "M5 19.5 C9 15.5 15 18 17.5 13 C19.5 9 16.5 5.5 12.5 6 M12.5 6 L14.5 4.5 M12.5 6 L14.3 7.8",
  sfide: "M7 20 V4.5 M7 5 H17.5 L15 8.6 L17.5 12.2 H7",
  collezione: "M12 4 L14.3 9 L19.7 9.5 L15.6 13.1 L16.9 18.5 L12 15.6 L7.1 18.5 L8.4 13.1 L4.3 9.5 L9.7 9 Z",
};

// le righe dei medaglioni: una per famiglia, le sfide e la collezione insieme (così tutto sta in vista)
const RIGHE: Famiglia[][] = [["finali"], ["fini"], ["gesti"], ["modi"], ["sfide", "collezione"]];
const DELLA = (f: Famiglia) => TROFEI.filter((t) => t.famiglia === f);
const GRIGLIA: Trofeo[][] = RIGHE.map((r) => r.flatMap(DELLA));
const TITOLO = Object.fromEntries(FAMIGLIE.map((f) => [f.id, f.titolo])) as Record<Famiglia, string>;

export function Medaglione({ famiglia, vinto, accento, grande = false }: { famiglia: Famiglia; vinto: boolean; accento: string; grande?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width={grande ? "6.4em" : "1.75em"} height={grande ? "6.4em" : "1.75em"} fill="none" aria-hidden="true"
      stroke={vinto ? accento : "rgba(226,220,208,.32)"} strokeWidth={grande ? 0.9 : 1.4} strokeLinecap="round" strokeLinejoin="round">
      {grande && <circle cx="12" cy="12" r="11.2" strokeDasharray={vinto ? undefined : "1.4 1.6"} />}
      <path d={SEGNI[famiglia]} transform={grande ? "translate(5.4 5.4) scale(.55)" : undefined} />
    </svg>
  );
}

interface Props {
  base: number;
  accento?: string;
  onChiudi: () => void;
}

export default function PaginaTrofei({ base, accento = "#f0b77e", onChiudi }: Props) {
  const [opz] = useOpzioni();
  const dialogo = useDialogo<HTMLDivElement>(onChiudi);
  const [dep, setDep] = useState<Deposito | null>(depositoOra());
  useEffect(() => {
    let vivo = true;
    deposito().then((d) => { if (vivo) setDep(d); });
    const smetti = ascoltaTrofei((d) => setDep(d));
    return () => { vivo = false; smetti(); };
  }, []);
  const vinti = dep?.vinti ?? {};
  const quanti = TROFEI.filter((t) => vinti[t.id]).length;

  // il trofeo scelto: all'apertura il primo vinto più di recente, se no il primo
  const [scelto, setScelto] = useState<[number, number]>([0, 0]);
  const iniziato = useRef(false);
  useEffect(() => {
    if (iniziato.current || !dep) return;
    iniziato.current = true;
    const ultimo = Object.entries(dep.vinti).sort((a, b) => b[1].localeCompare(a[1]))[0]?.[0];
    if (!ultimo) return;
    GRIGLIA.forEach((riga, r) => riga.forEach((t, c) => { if (t.id === ultimo) setScelto([r, c]); }));
  }, [dep]);
  const t = GRIGLIA[scelto[0]][scelto[1]];
  const quando = vinti[t.id];

  const griglia = useRef<HTMLDivElement>(null);
  const vai = (r: number, c: number) => {
    const riga = Math.max(0, Math.min(GRIGLIA.length - 1, r));
    const col = Math.max(0, Math.min(GRIGLIA[riga].length - 1, c));
    setScelto([riga, col]);
    requestAnimationFrame(() => griglia.current?.querySelector<HTMLElement>(`[data-pos="${riga}-${col}"]`)?.focus());
  };
  const tasti = (e: React.KeyboardEvent) => {
    const [r, c] = scelto;
    const n = GRIGLIA[r].length;
    const mosse: Record<string, () => void> = {
      ArrowRight: () => vai(r, (c + 1) % n),
      ArrowLeft: () => vai(r, (c - 1 + n) % n),
      ArrowDown: () => vai(r + 1, Math.round((c / Math.max(1, n - 1)) * (GRIGLIA[Math.min(r + 1, GRIGLIA.length - 1)].length - 1))),
      ArrowUp: () => vai(r - 1, Math.round((c / Math.max(1, n - 1)) * (GRIGLIA[Math.max(r - 1, 0)].length - 1))),
      Home: () => vai(0, 0),
      End: () => vai(GRIGLIA.length - 1, GRIGLIA[GRIGLIA.length - 1].length - 1),
    };
    if (!mosse[e.key]) return;
    e.preventDefault();
    mosse[e.key]();
  };

  const conto = useMemo(() => (dep ? `${quanti} di ${TROFEI.length}` : "…"), [dep, quanti]);

  return (
    // le frecce valgono in tutto il pannello: appena aperto, il fuoco è sul pannello e non ancora su un medaglione
    <div ref={dialogo} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Trofei" onKeyDown={tasti}
      style={{ ["--tr-acc" as string]: accento, outline: "none", fontSize: base * scalaTesto(opz), position: "absolute", inset: 0, zIndex: 70,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(4,4,8,.74)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", animation: "kf-launch .3s ease both", pointerEvents: "auto" }}
      onClick={onChiudi}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ width: "74em", maxWidth: "94%", height: "40em", maxHeight: "92%", display: "flex", flexDirection: "column", boxSizing: "border-box",
          padding: "1.7em 2.4em 1.3em", borderRadius: "1.2em",
          background: "linear-gradient(180deg, rgba(20,18,24,.97), rgba(10,10,14,.98))", border: "1px solid rgba(255,255,255,.08)", boxShadow: "0 2em 6em rgba(0,0,0,.6)" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "1.5em" }}>
          <div>
            <p style={{ margin: 0, fontFamily: MONO, fontSize: ".85em", letterSpacing: ".3em", textTransform: "uppercase", color: accento }}>la collezione</p>
            <h2 style={{ margin: ".2em 0 0", fontFamily: SERIF, fontWeight: 500, fontSize: "2em", color: "#f4ece0", letterSpacing: "-.01em" }}>Trofei</h2>
          </div>
          <div style={{ flex: 1, maxWidth: "22em", marginBottom: ".45em" }}>
            <p className="tr-conto" style={{ margin: 0, fontFamily: MONO, fontSize: ".85em", letterSpacing: ".12em", color: "#ece5da", textAlign: "right" }}>{conto}</p>
            <div className="tr-barra" role="progressbar" aria-label="Trofei vinti" aria-valuemin={0} aria-valuemax={TROFEI.length} aria-valuenow={quanti}>
              <div style={{ width: `${(quanti / TROFEI.length) * 100}%` }} />
            </div>
          </div>
          <button type="button" className="opz-bottone tr-chiudi" onClick={onChiudi} aria-label="Chiudi i trofei">chiudi <b>Esc</b></button>
        </div>

        <div style={{ marginTop: "1.2em", flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "1fr 22em", columnGap: "2.6em" }}>
          <div ref={griglia} className="tr-griglia" role="grid" aria-label="I trofei, per famiglia">
            {GRIGLIA.map((riga, r) => (
              <div key={r} role="row" className="tr-riga">
                {RIGHE[r].map((f) => (
                  <div key={f} className="tr-famiglia" style={{ flex: DELLA(f).length }}>
                    <p className="tr-titolo">{TITOLO[f]}</p>
                    <div className="tr-medaglie">
                      {DELLA(f).map((x) => {
                        const c = riga.indexOf(x);
                        const v = !!vinti[x.id];
                        const su = scelto[0] === r && scelto[1] === c;
                        return (
                          <button key={x.id} type="button" role="gridcell" data-pos={`${r}-${c}`} tabIndex={su ? 0 : -1}
                            className={"tr-medaglia" + (v ? " tr-vinto" : "")} aria-current={su ? "true" : undefined}
                            aria-label={v ? `${x.nome}, vinto` : `Trofeo nascosto: ${x.accenno}`}
                            onClick={() => vai(r, c)} onMouseEnter={() => setScelto([r, c])}>
                            <Medaglione famiglia={x.famiglia} vinto={v} accento={accento} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="tr-dettaglio" aria-live="polite">
            <Medaglione famiglia={t.famiglia} vinto={!!quando} accento={accento} grande />
            <p className="tr-famiglia-nome">{TITOLO[t.famiglia]}</p>
            {quando ? (
              <>
                <h3 className="tr-nome">{t.nome}</h3>
                <p className="tr-frase">{t.frase}</p>
                <p className="tr-quando">vinto il {dataLeggibile(quando)}</p>
              </>
            ) : (
              <>
                <h3 className="tr-nome tr-coperto">Trofeo nascosto</h3>
                <p className="tr-frase tr-accenno">{t.accenno}</p>
              </>
            )}
          </div>
        </div>

        <div style={{ marginTop: "1em", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1em", flexShrink: 0 }}>
          <span className="tr-nota">Un trofeo si vince una volta sola, e resta anche ricominciando.</span>
          <span className="tr-nota" style={{ textAlign: "right" }}>← → ↑ ↓ scegli · Esc chiude</span>
        </div>
      </div>
    </div>
  );
}
