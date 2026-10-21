// ====================================================================
//  La plancia: i pulsanti del gioco, ciascuno sempre al suo posto.
// --------------------------------------------------------------------
//  Tre zone fisse e una riga di servizio (scelta di Simone, 21/10/2026):
//   · ANDARE: le uscite a rosa dei venti (nord in alto, sud in basso, est a
//     destra, ovest a sinistra), ciascuna con la sua meta, e «guarda» al
//     centro. Una direzione che non c'è lascia vuoto il suo posto: le altre
//     non si spostano. Le uscite fuori dalla rosa (su, giù…), se ce ne
//     fossero, prendono gli angoli.
//   · QUI: le persone e le cose del luogo. Toccandone una, accanto si apre
//     ciò che puoi farci (la tendina, Tendina.tsx).
//   · FARE: Bevi, Mangia e i gesti che il luogo permette adesso (attingi,
//     curati, attacca il cane…).
//   · sotto: inventario, stato, aspetta e ↶ annulla.
//  L'altezza è la stessa in ogni luogo: il diario sopra non salta. Le parole
//  dei pulsanti sono quelle del parser (azioni.ts): un pulsante manda un
//  comando che si potrebbe anche scrivere.
// ====================================================================
import type { AzioniContesto, StatoMondo } from "../lib/favellaRuntime";
import { chipDiContesto, type Cosa } from "./azioni";

/** Il posto di ciascuna direzione nella rosa (le aree della griglia in gioco.css) e la sua freccia. */
const ROSA: Record<string, { area: string; freccia: string }> = {
  nord: { area: "n", freccia: "↑" }, ovest: { area: "o", freccia: "←" }, est: { area: "e", freccia: "→" }, sud: { area: "s", freccia: "↓" },
};
const ANGOLI = ["ne", "se", "so", "no"];
const FRECCE_ALTRE: Record<string, string> = { su: "⤒", giu: "⤓", "giù": "⤓" };
/** L'ordine in cui la tastiera incontra le uscite: quello della lettura, dall'alto. */
const ORDINE = ["nord", "ovest", "est", "sud"];

interface Props {
  mondo: StatoMondo;
  azioni: AzioniContesto;
  /** la cosa del luogo che ha la tendina aperta, e il pannello del bere o del mangiare aperto */
  aperta: string | null;
  pannello: "bere" | "mangiare" | null;
  puoAnnullare: boolean;
  onManda: (cmd: string) => void;
  onCosa: (cosa: Cosa, ancora: HTMLElement) => void;
  onPannello: (tipo: "bere" | "mangiare", ancora: HTMLElement) => void;
  onAnnulla: () => void;
}

export default function Plancia({ mondo, azioni, aperta, pannello, puoAnnullare, onManda, onCosa, onPannello, onAnnulla }: Props) {
  const uscite = mondo.exits ?? [];
  const nellaRosa = ORDINE.flatMap((d) => uscite.filter((u) => u.dir === d));
  const fuori = uscite.filter((u) => !ROSA[u.dir]);
  const prima = nellaRosa[0]?.dir ?? fuori[0]?.dir;
  const presenti = mondo.present ?? [];
  const gesti = chipDiContesto(azioni);

  const uscita = (dir: string, verso: string, area: string, freccia: string) => (
    <button key={dir} className={`vg-chip vg-uscita vg-verso-${area}`} style={{ gridArea: area }} data-fuoco={dir === prima ? "" : undefined}
      onClick={() => onManda(dir)} aria-label={`${dir}: ${verso}`}>
      <span className="vg-freccia" aria-hidden="true">{freccia}</span><em aria-hidden="true">{verso}</em>
    </button>
  );

  return (
    <>
      <div className="vg-plancia">
        <section className="vg-zona vg-zona-andare" aria-label="Andare">
          <span className="vg-etichetta" aria-hidden="true">andare</span>
          <div className="vg-rosa">
            {nellaRosa.map((u) => uscita(u.dir, u.verso, ROSA[u.dir].area, ROSA[u.dir].freccia))}
            {fuori.slice(0, ANGOLI.length).map((u, i) => uscita(u.dir, u.verso, ANGOLI[i], FRECCE_ALTRE[u.dir] ?? "·"))}
            <button className="vg-chip vg-guarda" style={{ gridArea: "c" }} onClick={() => onManda("guarda")} aria-label="guarda: guardati intorno">guarda</button>
          </div>
        </section>

        <section className="vg-zona vg-zona-qui" aria-label="Qui">
          <span className="vg-etichetta" aria-hidden="true">qui</span>
          <div className="vg-zona-corpo">
            {presenti.length === 0 && <span className="vg-nessuno" aria-hidden="true">—</span>}
            {presenti.map((p) => (
              <button key={p.id} className={"vg-chip" + (p.persona ? " vg-persona" : "") + (aperta === p.id ? " vg-attivo" : "")} aria-expanded={aperta === p.id}
                onClick={(e) => onCosa({ tipo: "qui", id: p.id, nome: p.nome, persona: p.persona, prendibile: p.prendibile }, e.currentTarget)}>
                {p.persona && <span className="vg-freccia" aria-hidden="true">◉</span>}<span className="vg-chip-testo">{p.nome}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="vg-zona vg-zona-fare" aria-label="Fare">
          <span className="vg-etichetta" aria-hidden="true">fare</span>
          <div className="vg-zona-corpo">
            <button className={"vg-chip vg-verbo" + (pannello === "bere" ? " vg-attivo" : "")} aria-expanded={pannello === "bere"}
              onClick={(e) => onPannello("bere", e.currentTarget)}><span className="vg-freccia" aria-hidden="true">▸</span>Bevi</button>
            <button className={"vg-chip vg-verbo" + (pannello === "mangiare" ? " vg-attivo" : "")} aria-expanded={pannello === "mangiare"}
              onClick={(e) => onPannello("mangiare", e.currentTarget)}><span className="vg-freccia" aria-hidden="true">▸</span>Mangia</button>
            {gesti.map((g) => (
              <button key={g.chiave} className="vg-chip vg-verbo" onClick={() => onManda(g.cmd)}>
                <span className="vg-freccia" aria-hidden="true">▸</span><span className="vg-chip-testo">{g.etichetta}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="vg-servizio">
        <button className="vg-chip vg-tenue" onClick={() => onManda("inventario")} aria-label="inventario: che cosa porti, a parole">inventario</button>
        <button className="vg-chip vg-tenue" onClick={() => onManda("stato")} aria-label="stato: come stai, a parole">stato</button>
        <button className="vg-chip vg-tenue" onClick={() => onManda("aspetta")} aria-label="aspetta: lascia passare un po' di tempo">aspetta</button>
        <button className="vg-chip vg-tenue vg-annulla-chip" onClick={onAnnulla} disabled={!puoAnnullare} aria-label="Annulla l'ultima mossa (Ctrl+Z)">
          ↶ annulla <span className="vg-tasto" aria-hidden="true">Ctrl+Z</span>
        </button>
      </div>
    </>
  );
}
