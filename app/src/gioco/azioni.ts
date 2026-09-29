// ====================================================================
//  Azioni e conferme: la logica che sta fra i pulsanti e il motore.
// --------------------------------------------------------------------
//  Nessun React qui: funzioni pure, così si leggono in un colpo solo e si
//  provano da sole. Tre cose:
//   · quali comandi vale la pena di ANTICIPARE (chiedere al motore che cosa
//     farebbero, senza farli) e quali no;
//   · quando un comando è una SCELTA che costa e va confermata;
//   · come i verbi d'autore (attingi, curati, attacca…) diventano pulsanti.
//  Le parole sono quelle del parser: un pulsante manda sempre un comando che
//  si potrebbe anche scrivere, e nel diario compare lo stesso.
// ====================================================================
import type { Anteprima, AzioniContesto, StatoMondo } from "../lib/favellaRuntime";

// --------------------------------------------------------------------
//  Che cosa si anticipa
// --------------------------------------------------------------------
/** Primi vocaboli di comandi che non costano mai: sguardi, servizio, movimento,
 *  prendere, posare. Bere e mangiare hanno il loro pannello: lì la scelta si fa
 *  toccando la quantità. */
const SICURI = new Set([
  "guarda", "esamina", "osserva", "x", "l", "inventario", "i", "zaino", "stato", "aiuto",
  "aspetta", "attendi", "z", "annulla", "disfa", "ancora", "ripeti", "g", "salva", "carica",
  "sì", "si", "no", "parla", "prendi", "raccogli", "lascia", "posa",
  "bevi", "bere", "mangia", "mangiare",
  "nord", "sud", "est", "ovest", "n", "s", "e", "o", "su", "giù", "giu", "entra", "esci", "sali", "scendi", "vai",
]);

export function serveAnteprima(cmd: string, mondo: StatoMondo): boolean {
  const c = cmd.trim().toLowerCase();
  if (!c) return false;
  if (mondo.dialog) return true;                                  // ogni risposta di dialogo può costare
  if ((mondo.exits ?? []).some((u) => u.dir === c)) return false;
  return !SICURI.has(c.split(/\s+/)[0]);
}

// --------------------------------------------------------------------
//  Le scelte che costano
// --------------------------------------------------------------------
export type TipoConferma = "scambio" | "perdita" | "danno" | "violenza" | "svolta" | "fine";

export interface Conferma {
  tipo: TipoConferma;
  segno: string;              // la piccola intestazione, in maiuscoletto
  domanda: string;
  perdi: string[];
  ottieni: string[];
  pesa: string[];             // ciò che non si perde ma costa: più sete, più fame
  dopo: string;               // le scorte come resterebbero
}

/** Stati che il motore cambia con una scelta e che spostano la storia: chi viene
 *  con te, chi ti dà che cosa. Si riconoscono dal nome, non dal testo. */
const STATI_DI_SVOLTA = new Set(["stato di peppe", "stato del lascito"]);
const VERBI_DI_VIOLENZA = new Set(["attacca", "minaccia", "colpisci"]);

const R = {
  acqua: (n: number) => `${n} d'acqua`,
  cibo: (n: number) => `${n} di cibo`,
  vita: (n: number) => `${n} di vita`,
} as const;
const RISORSE = ["acqua", "cibo", "vita"] as const;

export const conArticolo = (nome: string) =>
  nome.replace(/^(Il|Lo|La|L'|I|Gli|Le|Un|Uno|Una)(?=\b|')/, (a) => a.toLowerCase());

/** Il comando è una scelta da confermare? Dice di sì con una Conferma già scritta. */
export function valutaConferma(cmd: string, a: Anteprima, mondo: StatoMondo): Conferma | null {
  if (!a.ok || !a.capito) return null;
  const parole = cmd.trim().toLowerCase().split(/\s+/);
  const verbo = parole[0];
  const perdi: string[] = a.perde.map((o) => o.nome);
  const ottieni: string[] = a.ottiene.map((o) => o.nome);
  let persoRisorse = false, presoRisorse = false;
  for (const k of RISORSE) {
    const d = a.delta[k] ?? 0;
    if (d < 0) { perdi.push(R[k](-d)); persoRisorse = true; }
    if (d > 0) { ottieni.push(R[k](d)); presoRisorse = true; }
  }
  const pesa: string[] = [];
  for (const [k, nome] of [["sete", "sete"], ["fame", "fame"]] as const) {
    const d = a.delta[k] ?? 0;
    if (d > 0) pesa.push(`${nome} +${d}`);
  }
  const haPerso = a.perde.length > 0 || persoRisorse;
  const haPreso = a.ottiene.length > 0 || presoRisorse;
  const dopo = RISORSE.slice(0, 2).map((k) => `${k} ${a.dopo[k] ?? mondo.counters[k] ?? 0}`).join(" · ");
  const base = { perdi, ottieni, pesa, dopo };
  const bersaglio = parole.slice(1).join(" ").replace(/^(il|lo|la|l'|i|gli|le)\s+/, "");
  const chi = bersaglio ? (mondo.present ?? []).find((p) => p.id === bersaglio)?.nome ?? bersaglio : "";
  const persona = chi ? conArticolo(chi) : "";

  if (a.esito !== "in_corso") {
    return { tipo: "fine", segno: "la fine", domanda: "Questa scelta chiude il viaggio. Vuoi procedere?", ...base };
  }
  if (a.stati.some((s) => STATI_DI_SVOLTA.has(s.nome))) {
    return { tipo: "svolta", segno: "una svolta", domanda: "Questa scelta pesa sul resto del viaggio. Vuoi confermarla?", ...base };
  }
  const cambiaQualcosa = a.stati.length > 0 || Object.keys(a.delta).length > 0 || haPerso || haPreso;
  if (VERBI_DI_VIOLENZA.has(verbo) && cambiaQualcosa) {
    const gesto = verbo === "minaccia" ? "minacciare" : verbo === "colpisci" ? "colpire" : "attaccare";
    return { tipo: "violenza", segno: "la violenza costa",
      domanda: persona ? `Vuoi davvero ${gesto} ${persona}?` : "Vuoi davvero alzare le mani?", ...base };
  }
  // ciò che costa solo vita (l'acqua salmastra): non è un dono né un baratto, è un danno
  if ((a.delta.vita ?? 0) < 0 && a.perde.length === 0 && !(a.delta.acqua < 0) && !(a.delta.cibo < 0)) {
    return { tipo: "danno", segno: "ti fa male", domanda: "Ti costa vita. Vuoi farlo lo stesso?", ...base };
  }
  if (haPerso && haPreso) return { tipo: "scambio", segno: "uno scambio", domanda: "Vuoi fare questo scambio?", ...base };
  if (haPerso) return { tipo: "perdita", segno: "si perde qualcosa", domanda: "Vuoi davvero rinunciarci?", ...base };
  return null;
}

// --------------------------------------------------------------------
//  Bere e mangiare
// --------------------------------------------------------------------
export interface Dose { cmd: string; etichetta: string }
export interface Pasto {
  titolo: string;             // «Vuoi bere?»
  risorsa: "acqua" | "cibo";
  bisogno: "sete" | "fame";
  doni: Dose[];
}
export const PASTI: Record<"bere" | "mangiare", Pasto> = {
  bere: {
    titolo: "Vuoi bere?", risorsa: "acqua", bisogno: "sete",
    doni: [
      { cmd: "bevi", etichetta: "Un sorso" },
      { cmd: "bevi due sorsi", etichetta: "Due sorsi" },
      { cmd: "bevi tre sorsi", etichetta: "Tre sorsi" },
    ],
  },
  mangiare: {
    titolo: "Vuoi mangiare?", risorsa: "cibo", bisogno: "fame",
    doni: [
      { cmd: "mangia qualcosa", etichetta: "Una porzione" },
      { cmd: "mangia due porzioni", etichetta: "Due porzioni" },
      { cmd: "mangia tre porzioni", etichetta: "Tre porzioni" },
    ],
  },
};

export interface Previsione {
  dose: Dose;
  buona: boolean;             // il comando consuma davvero la scorta
  quanto: string;             // «sete 8 → 0 · acqua 3 → 1»
  motivo: string;             // se no, la frase del gioco
}

/** Le dosi che vale la pena di offrire, con ciò che ciascuna farebbe. Si ferma alla
 *  prima che toglie tutto il bisogno: una dose in più sarebbe acqua sprecata. */
export function previsioni(p: Pasto, mondo: StatoMondo, anteprima: (cmd: string) => Anteprima): { dosi: Previsione[]; motivo: string } {
  const c = mondo.counters;
  const dosi: Previsione[] = [];
  let motivo = "";
  for (const dose of p.doni) {
    const a = anteprima(dose.cmd);
    const consumo = a.ok && a.capito && (a.delta[p.risorsa] ?? 0) < 0;
    const frase = (a.testo || "").split("\n").map((r) => r.trim()).find(Boolean) ?? "";
    if (!consumo) {
      if (!dosi.length) { motivo = frase; break; }              // nemmeno la prima: niente da offrire
      dosi.push({ dose, buona: false, quanto: "", motivo: frase });
      break;
    }
    // il gioco porta a zero la sete o la fame a fine turno («Ogni turno se la sete è meno di 0…»)
    const resta = Math.max(0, a.dopo[p.bisogno] ?? 0);
    dosi.push({
      dose, buona: true, motivo: "",
      quanto: `${p.bisogno} ${c[p.bisogno] ?? 0} → ${resta} · ${p.risorsa} ${c[p.risorsa] ?? 0} → ${a.dopo[p.risorsa] ?? 0}`,
    });
    if (resta <= 0) break;
  }
  return { dosi, motivo };
}

// --------------------------------------------------------------------
//  I verbi d'autore come pulsanti
// --------------------------------------------------------------------
export interface Chip { chiave: string; cmd: string; etichetta: string }

/** Verbo scritto dall'autore → il comando che il pulsante manda e come si legge.
 *  Le varianti dello stesso gesto («getta cibo», «lancia il cibo»…) sono un pulsante solo.
 *  I verbi che non compaiono qui (bevi, mangia…, stato) hanno già un altro posto. */
const NOTE: Record<string, Chip> = {
  "attingi": { chiave: "attingi", cmd: "attingi", etichetta: "Attingi" },
  "curati": { chiave: "curati", cmd: "curati", etichetta: "Curati" },
  "getta": { chiave: "getta cibo", cmd: "getta cibo", etichetta: "Getta il cibo" },
  "getta cibo": { chiave: "getta cibo", cmd: "getta cibo", etichetta: "Getta il cibo" },
  "getta il cibo": { chiave: "getta cibo", cmd: "getta cibo", etichetta: "Getta il cibo" },
  "lancia cibo": { chiave: "getta cibo", cmd: "getta cibo", etichetta: "Getta il cibo" },
  "lancia il cibo": { chiave: "getta cibo", cmd: "getta cibo", etichetta: "Getta il cibo" },
  "bevi salmastra": { chiave: "bevi salmastra", cmd: "bevi salmastra", etichetta: "Bevi l'acqua salmastra" },
};
const VERBI_CON_BERSAGLIO: Record<string, string> = { attacca: "Attacca", minaccia: "Minaccia" };

export function chipDiContesto(az: AzioniContesto): Chip[] {
  const out: Chip[] = [];
  const visti = new Set<string>();
  const metti = (c: Chip) => { if (!visti.has(c.chiave)) { visti.add(c.chiave); out.push(c); } };
  for (const v of az.soli) { const n = NOTE[v]; if (n) metti(n); }
  for (const b of az.bersagli) {
    const gesto = VERBI_CON_BERSAGLIO[b.verbo];
    if (gesto) metti({ chiave: `${b.verbo} ${b.id}`, cmd: `${b.verbo} ${b.id}`, etichetta: `${gesto} ${conArticolo(b.nome)}` });
  }
  return out;
}

// --------------------------------------------------------------------
//  Nomi e parole del testo
// --------------------------------------------------------------------
/** «Il cane» → «cane», «L'orologio» → «orologio»: come l'id che il motore dà agli oggetti. */
export const senzaArticolo = (s: string) =>
  s.replace(/^(il|lo|la|i|gli|le|un|uno|una)\s+/i, "").replace(/^(l'|un')/i, "").toLowerCase();
