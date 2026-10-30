// ====================================================================
//  Il taccuino (piano 09, §6): salvare e caricare come in un gioco per
//  computer. Due schede, Salva e Carica. A sinistra l'elenco dei salvataggi,
//  dal più recente (in Salva, in cima, «+ Nuovo salvataggio»: solo quelli con
//  nome si possono riscrivere; in Carica anche il rapido e gli automatici).
//  A destra il salvataggio scelto: la miniatura del paesaggio, il nome, dove,
//  quando, quanto si è giocato, il corpo e le scorte, e le azioni: carica o
//  sovrascrivi, rinomina, esporta, elimina. Le conferme sono domande a parte
//  (S / N). In fondo, «apri un file…» e «apri la cartella».
//  Tastiera: ↑ ↓ Inizio Fine PagSu PagGiù nell'elenco, Invio fa l'azione
//  principale, Canc elimina, ← → fra le schede; Esc chiude (o, se si sta
//  scrivendo un nome, torna all'elenco). Il mouse: un clic sceglie, due
//  caricano. Misure in em (prop `base`): 13 nella partita, 19 nel menu.
//  I testi nella lingua di adesso; in inglese anche il luogo (gioco/traduci.ts,
//  nome) e la zona del riassunto, che nel file restano in italiano.
// ====================================================================
import { scalaTesto } from "../lib/accessibilita";
import { useOpzioni } from "../lib/useOpzioni";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type Posto, type Riassunto, type Salvataggio, type VoceTaccuino,
  archivioSuDisco, apriCartella, cartella, dataLeggibile, durataLeggibile, elenco, elimina, esporta, genere, importa,
  LUNGHEZZA_NOME, nomeDi, nuovoPosto, rinomina,
} from "../lib/salvataggi";
import { ZONE_THEME, type ZoneKey } from "../data/viaggiatore";
import { VERSIONE } from "../lib/versione";
import { in_, inglese, tr, TITOLO, type Bilingue } from "../lib/lingua";
import { nome as nomeInglese } from "./traduci";
import { useDialogo } from "./useDialogo";
import Domanda from "./Domanda";
import "./opzioni.css";
import "./taccuino.css";

const SERIF = "'Lora', Georgia, serif";
const MONO = "'Source Code Pro', ui-monospace, monospace";

type Modo = "salva" | "carica";
type Scelto = Posto | "nuovo";
type Richiesta = { tipo: "sovrascrivi" | "carica" | "elimina" | "file"; voce?: VoceTaccuino; dati?: Salvataggio } | null;
export interface Istantanea { riassunto: Riassunto; miniatura?: string; tempoMs: number }

interface Props {
  base: number;
  modo: Modo;
  accento?: string;
  /** false nel menu del trailer: lì non c'è una partita da salvare */
  puoSalvare: boolean;
  /** true se caricando si perderebbe qualcosa: chiede conferma */
  avvisaPerdita?: boolean;
  /** la partita di adesso, per «nuovo salvataggio» (si legge all'apertura) */
  istantanea?: () => Istantanea;
  onSalva?: (posto: Posto, nome?: string) => Promise<void>;
  onCarica: (s: Salvataggio) => void;
  onChiudi: () => void;
}

const TAG: Record<string, Bilingue> = { rapido: { it: "rapido", en: "quick" }, automatico: { it: "automatico", en: "auto" } };
const tag = (g: string) => (TAG[g] ? in_(TAG[g]) : "");

/** Il luogo e la zona di un riassunto, nella lingua di adesso. */
const luogoDi = (r: Riassunto) => (inglese() ? nomeInglese(r.luogo) : r.luogo);
// nel riassunto del file c'è il nome italiano della zona; in inglese, quello di ZONE_THEME (data/viaggiatore.ts)
const zonaDi = (r: Riassunto) => (inglese() ? ZONE_THEME[r.zona as ZoneKey]?.nomeEn ?? r.nomeZona : r.nomeZona);
/** Il nome che vede chi gioca, col luogo nella lingua di adesso (per i salvataggi senza nome). */
const nomeVoce = (v: VoceTaccuino) => nomeDi(v.posto, v.dati?.nome, v.dati ? luogoDi(v.dati.riassunto) : undefined);
/** Un nome fra virgolette, all'italiana o all'inglese. */
const virgolette = (x: string) => tr(`«${x}»`, `“${x}”`);

export default function Taccuino({ base, modo: modoIniziale, accento = "#f0b77e", puoSalvare, avvisaPerdita = false, istantanea, onSalva, onCarica, onChiudi }: Props) {
  const [opz] = useOpzioni();
  const [modo, setModo] = useState<Modo>(puoSalvare ? modoIniziale : "carica");
  const [voci, setVoci] = useState<VoceTaccuino[] | null>(null);
  const [scelto, setScelto] = useState<Scelto | null>(null);
  const foto = useMemo(() => istantanea?.() ?? null, []);   // eslint-disable-line react-hooks/exhaustive-deps
  const [nomeNuovo, setNomeNuovo] = useState(() => (foto ? luogoDi(foto.riassunto) : ""));
  const [nomeInCorso, setNomeInCorso] = useState<string | null>(null);   // la rinomina del salvataggio scelto
  const [richiesta, setRichiesta] = useState<Richiesta>(null);
  const [nota, setNota] = useState<{ testo: string; errore?: boolean } | null>(null);
  const [occupato, setOccupato] = useState(false);
  const [dove, setDove] = useState<string | null>(null);
  const elencoRef = useRef<HTMLDivElement>(null);
  const nuovoRef = useRef<HTMLInputElement>(null);
  const schedeRef = useRef<HTMLDivElement>(null);
  // mentre c'è una domanda, o si scrive un nome, Esc e Tab sono loro
  const stato = useRef({ richiesta, nomeInCorso });
  stato.current = { richiesta, nomeInCorso };
  const dialogo = useDialogo<HTMLDivElement>(onChiudi,
    () => !!stato.current.richiesta || stato.current.nomeInCorso !== null || document.activeElement instanceof HTMLInputElement);

  const ricarica = useCallback(async (seleziona?: Scelto) => {
    try {
      const v = await elenco();
      setVoci(v);
      if (seleziona) setScelto(seleziona);
    } catch (e) {
      setVoci([]);
      setNota({ testo: String(e instanceof Error ? e.message : e), errore: true });
    }
  }, []);
  useEffect(() => { ricarica(); cartella().then(setDove).catch(() => {}); }, [ricarica]);

  // che cosa c'è nell'elenco: in Salva solo i salvataggi con nome (gli altri non si riscrivono a mano)
  const righe: Scelto[] = useMemo(() => {
    const v = (voci ?? []).filter((x) => modo === "carica" || genere(x.posto) === "manuale");
    return [...(modo === "salva" ? ["nuovo" as const] : []), ...v.map((x) => x.posto)];
  }, [voci, modo]);
  const voceDi = (p: Scelto | null) => (p && p !== "nuovo" ? voci?.find((x) => x.posto === p) ?? null : null);

  // la scelta di partenza: in Salva il nuovo, in Carica il più recente che si legge
  useEffect(() => {
    if (!voci) return;
    setScelto((s) => (s && righe.includes(s) ? s : modo === "salva" ? "nuovo" : righe.find((p) => voceDi(p)?.dati) ?? righe[0] ?? null));
  }, [voci, modo, righe]); // eslint-disable-line react-hooks/exhaustive-deps

  // il fuoco segue la scelta (dopo il dialogo, che lo prende all'apertura)
  const metti = useCallback((p: Scelto | null) => {
    requestAnimationFrame(() => elencoRef.current?.querySelector<HTMLElement>(`[data-posto="${p}"]`)?.focus({ preventScroll: false }));
  }, []);
  const primaVolta = useRef(true);
  useEffect(() => {
    if (!voci || !scelto || !primaVolta.current) return;
    primaVolta.current = false;
    metti(scelto);
  }, [voci, scelto, metti]);

  const esegui = async (azione: () => Promise<void>) => {
    setOccupato(true);
    try { await azione(); } catch (e) { setNota({ testo: e instanceof Error ? e.message : String(e), errore: true }); }
    finally { setOccupato(false); }
  };

  // ── le azioni ─────────────────────────────────────────────────────
  const salvaNuovo = () => esegui(async () => {
    const nome = nomeNuovo.trim() || (foto ? luogoDi(foto.riassunto) : "") || tr("Salvataggio", "Save");
    const posto = nuovoPosto();
    await onSalva?.(posto, nome);
    setNota({ testo: tr(`Salvato: ${virgolette(nome)}.`, `Saved: ${virgolette(nome)}.`) });
    await ricarica(posto);
    metti(posto);
  });
  const sovrascrivi = (v: VoceTaccuino) => esegui(async () => {
    await onSalva?.(v.posto, v.dati?.nome);
    setNota({ testo: tr(`Salvato sopra ${virgolette(nomeVoce(v))}.`, `Saved over ${virgolette(nomeVoce(v))}.`) });
    await ricarica(v.posto);
    metti(v.posto);
  });
  const carica = (d: Salvataggio) => { setRichiesta(null); onCarica(d); };
  const chiediCarica = (v: VoceTaccuino) => {
    if (!v.dati) return;
    if (avvisaPerdita) setRichiesta({ tipo: "carica", voce: v, dati: v.dati });
    else carica(v.dati);
  };
  const confermaRinomina = (v: VoceTaccuino) => {
    const nome = (nomeInCorso ?? "").trim();
    setNomeInCorso(null);
    if (!v.dati || !nome || nome === v.dati.nome) { metti(v.posto); return; }
    esegui(async () => {
      await rinomina(v.posto, v.dati!, nome);
      setNota({ testo: tr(`Rinominato: ${virgolette(nome)}.`, `Renamed: ${virgolette(nome)}.`) });
      await ricarica(v.posto);
      metti(v.posto);
    });
  };
  const eliminaDavvero = (v: VoceTaccuino) => esegui(async () => {
    const i = righe.indexOf(v.posto);
    await elimina(v.posto);
    setNota({ testo: tr(`Eliminato: ${virgolette(nomeVoce(v))}.`, `Deleted: ${virgolette(nomeVoce(v))}.`) });
    const resto = righe.filter((p) => p !== v.posto);
    const dopo = resto[Math.min(i, resto.length - 1)] ?? null;
    await ricarica(dopo ?? undefined);
    if (dopo) metti(dopo);
  });
  const daFile = async () => {
    try {
      const s = await importa();
      if (!s) return;
      if (avvisaPerdita) setRichiesta({ tipo: "file", dati: s });
      else carica(s);
    } catch (e) { setNota({ testo: e instanceof Error ? e.message : String(e), errore: true }); }
  };

  /** L'azione principale della riga scelta: Invio, o due clic. */
  const principale = (p: Scelto | null) => {
    if (occupato || !p) return;
    if (p === "nuovo") { nuovoRef.current?.focus(); nuovoRef.current?.select(); return; }
    const v = voceDi(p);
    if (!v?.dati) return;
    if (modo === "salva") setRichiesta({ tipo: "sovrascrivi", voce: v });
    else chiediCarica(v);
  };
  const puoiEliminare = (v: VoceTaccuino | null) => !!v;
  const puoiRinominare = (v: VoceTaccuino | null) => !!v?.dati && genere(v.posto) === "manuale";

  // ── la tastiera nell'elenco ───────────────────────────────────────
  const tastiElenco = (e: React.KeyboardEvent) => {
    if (!righe.length) return;
    const i = Math.max(0, righe.indexOf(scelto ?? righe[0]));
    const j = e.key === "ArrowDown" ? Math.min(righe.length - 1, i + 1) : e.key === "ArrowUp" ? Math.max(0, i - 1)
      : e.key === "Home" ? 0 : e.key === "End" ? righe.length - 1
      : e.key === "PageDown" ? Math.min(righe.length - 1, i + 5) : e.key === "PageUp" ? Math.max(0, i - 5) : -1;
    if (j >= 0) { e.preventDefault(); setScelto(righe[j]); metti(righe[j]); return; }
    if (e.key === "Enter") { e.preventDefault(); principale(scelto); return; }
    if (e.key === "Delete") { const v = voceDi(scelto); if (puoiEliminare(v)) { e.preventDefault(); setRichiesta({ tipo: "elimina", voce: v! }); } }
  };
  const frecceSchede = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    if (!puoSalvare) return;
    e.preventDefault();
    const altro: Modo = modo === "salva" ? "carica" : "salva";
    cambiaModo(altro);
    requestAnimationFrame(() => schedeRef.current?.querySelector<HTMLElement>(`[data-scheda="${altro}"]`)?.focus());
  };
  const cambiaModo = (m: Modo) => { setModo(m); setNota(null); setNomeInCorso(null); setScelto(null); };

  // ── la resa ───────────────────────────────────────────────────────
  const tema = (r?: Riassunto) => (r ? ZONE_THEME[r.zona as ZoneKey] : undefined);
  const miniatura = (src: string | undefined, r: Riassunto | undefined, classe: string) => {
    const t = tema(r);
    return src
      ? <img className={classe} src={src} alt="" draggable={false} />
      : <span className={classe + " tc-senza"} style={{ background: `linear-gradient(180deg, ${(t?.accent ?? "#888") + "40"}, rgba(10,10,14,.9))` }}>{r ? zonaDi(r) : ""}</span>;
  };

  const riga = (p: Scelto) => {
    const scelta = p === scelto;
    if (p === "nuovo") {
      return (
        <button key="nuovo" type="button" className="tc-riga" data-posto="nuovo" aria-current={scelta || undefined}
          onClick={() => setScelto("nuovo")} onDoubleClick={() => principale("nuovo")}>
          <span className="tc-mini tc-piu" aria-hidden="true">+</span>
          <span className="tc-testi"><span className="tc-nome">{tr("Nuovo salvataggio", "New save")}</span><span className="tc-sotto">{foto ? luogoDi(foto.riassunto) : ""} · {tr("adesso", "now")}</span></span>
        </button>
      );
    }
    const v = voceDi(p)!;
    const g = genere(p);
    return (
      <button key={p} type="button" className="tc-riga" data-posto={p} aria-current={scelta || undefined}
        onClick={() => setScelto(p)} onDoubleClick={() => principale(p)}>
        {miniatura(v.dati?.miniatura, v.dati?.riassunto, "tc-mini")}
        <span className="tc-testi">
          <span className="tc-nome">{nomeVoce(v)}{TAG[g] && <span className="tc-tag">{tag(g)}</span>}</span>
          <span className="tc-sotto">{v.dati ? `${luogoDi(v.dati.riassunto)} · ${dataLeggibile(v.dati.creato)}` : tr("non si legge", "unreadable")}</span>
        </span>
      </button>
    );
  };

  const bottone = (primario = false): React.CSSProperties => ({
    cursor: "pointer", flexShrink: 0, border: `1px solid ${primario ? accento : "rgba(255,255,255,.18)"}`, borderRadius: 999,
    background: primario ? accento : "transparent", color: primario ? "#140c06" : "#c9d2de",
    fontFamily: MONO, fontSize: ".82em", letterSpacing: ".12em", textTransform: "uppercase", padding: ".6em 1.05em",
  });

  const dettaglio = () => {
    if (!scelto) return <p className="tc-vuoto">{voci === null ? tr("Si legge il taccuino…", "Reading the notebook…")
      : modo === "carica" ? tr("Il taccuino è vuoto: nessun salvataggio da caricare.", "The notebook is empty: no saves to load.") : ""}</p>;
    const nuovo = scelto === "nuovo";
    const v = voceDi(scelto);
    const d = nuovo ? null : v?.dati ?? null;
    if (!nuovo && !d) {
      return (
        <div className="tc-dettaglio">
          <p className="tc-errore">{tr("Questo salvataggio non si legge:", "This save cannot be read:")} {v?.errore ?? tr("file guasto", "damaged file")}.</p>
          <div className="tc-azioni"><button type="button" className="opz-bottone" style={bottone()} onClick={() => v && setRichiesta({ tipo: "elimina", voce: v })}>{tr("elimina", "delete")} <b>{tr("Canc", "Del")}</b></button></div>
        </div>
      );
    }
    const r = nuovo ? foto?.riassunto : d!.riassunto;
    const tempo = nuovo ? foto?.tempoMs : d!.tempoMs;
    const g = nuovo ? "manuale" : genere(scelto);
    return (
      <div className="tc-dettaglio">
        {miniatura(nuovo ? foto?.miniatura : d!.miniatura, r, "tc-foto")}
        <p className="tc-quando">{TAG[g] ? `${tag(g)} · ` : ""}{nuovo ? tr("la partita di adesso", "the current game") : dataLeggibile(d!.creato)}</p>
        {nuovo ? (
          <label className="tc-campo">
            <span className="tc-etichetta">{tr("nome", "name")}</span>
            <input ref={nuovoRef} value={nomeNuovo} maxLength={LUNGHEZZA_NOME} spellCheck={false}
              onChange={(e) => setNomeNuovo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); salvaNuovo(); }
                else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); metti("nuovo"); }
              }} />
          </label>
        ) : nomeInCorso !== null ? (
          <label className="tc-campo">
            <span className="tc-etichetta">{tr("nuovo nome", "new name")}</span>
            <input autoFocus value={nomeInCorso} maxLength={LUNGHEZZA_NOME} spellCheck={false}
              onFocus={(e) => e.currentTarget.select()}
              onChange={(e) => setNomeInCorso(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); confermaRinomina(v!); }
                else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); setNomeInCorso(null); metti(scelto); }
              }} />
          </label>
        ) : (
          <h3 className="tc-titolo">{nomeVoce(v!)}</h3>
        )}
        {r && <p className="tc-luogo">{luogoDi(r)} · {zonaDi(r)} · {tr(`tappa ${r.tappa} di 7 · turno ${r.turno}`, `stage ${r.tappa} of 7 · turn ${r.turno}`)}</p>}
        <p className="tc-dati">{tr("tempo di gioco", "playing time")} <b>{durataLeggibile(tempo)}</b></p>
        {r && <p className="tc-dati">{tr("vita", "life")} <b>{r.vita}</b> · {tr("sete", "thirst")} <b>{r.sete}</b> · {tr("fame", "hunger")} <b>{r.fame}</b> · {tr("acqua", "water")} <b>{r.acqua}</b> · {tr("cibo", "food")} <b>{r.cibo}</b></p>}
        {d && d.gioco !== VERSIONE.gioco && <p className="tc-dati" style={{ color: accento }}>{tr(`salvato con la ${d.gioco}`, `saved with version ${d.gioco}`)}</p>}
        <div className="tc-azioni">
          {nuovo && <button type="button" className="opz-bottone" style={bottone(true)} disabled={occupato} onClick={salvaNuovo}>{tr("salva", "save")} <b>↵</b></button>}
          {!nuovo && modo === "salva" && <button type="button" className="opz-bottone" style={bottone(true)} disabled={occupato} onClick={() => setRichiesta({ tipo: "sovrascrivi", voce: v! })}>{tr("sovrascrivi", "overwrite")} <b>↵</b></button>}
          {!nuovo && modo === "carica" && <button type="button" className="opz-bottone" style={bottone(true)} disabled={occupato} onClick={() => chiediCarica(v!)}>{tr("carica", "load")} <b>↵</b></button>}
          {!nuovo && nomeInCorso === null && puoiRinominare(v) && <button type="button" className="opz-bottone" style={bottone()} disabled={occupato} onClick={() => setNomeInCorso(d!.nome ?? nomeVoce(v!))}>{tr("rinomina", "rename")}</button>}
          {!nuovo && <button type="button" className="opz-bottone" style={bottone()} disabled={occupato} onClick={() => esegui(async () => { if (await esporta(v!.posto, d!)) setNota({ testo: tr("Esportato in un file.", "Exported to a file.") }); })}>{tr("esporta…", "export…")}</button>}
          {!nuovo && puoiEliminare(v) && <button type="button" className="opz-bottone" style={bottone()} disabled={occupato} onClick={() => setRichiesta({ tipo: "elimina", voce: v! })}>{tr("elimina", "delete")} <b>{tr("Canc", "Del")}</b></button>}
        </div>
      </div>
    );
  };

  const vr = richiesta?.voce;
  // il nome di ciò che si carica: un salvataggio del taccuino, o un file aperto
  const daCaricare = richiesta?.dati ? virgolette(vr ? nomeVoce(vr) : richiesta.dati.nome || luogoDi(richiesta.dati.riassunto)) : "";
  return (
    <div ref={dialogo} tabIndex={-1} role="dialog" aria-modal="true" aria-label={tr("Il taccuino: salva e carica", "The notebook: save and load")}
      style={{ ["--opz-acc" as string]: accento, ["--tc-acc" as string]: accento, outline: "none", fontSize: base * scalaTesto(opz), position: "absolute", inset: 0, zIndex: 70,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(4,4,8,.74)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", animation: "kf-launch .3s ease both", pointerEvents: "auto" }}
      onClick={onChiudi}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ width: "74em", maxWidth: "94%", height: "40em", maxHeight: "92%", display: "flex", flexDirection: "column", boxSizing: "border-box",
          padding: "1.7em 2.4em 1.3em", borderRadius: "1.2em",
          background: "linear-gradient(180deg, rgba(20,18,24,.97), rgba(10,10,14,.98))", border: "1px solid rgba(255,255,255,.08)", boxShadow: "0 2em 6em rgba(0,0,0,.6)" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "1em" }}>
          <div>
            <p style={{ margin: 0, fontFamily: MONO, fontSize: ".85em", letterSpacing: ".3em", textTransform: "uppercase", color: accento }}>{tr("il taccuino", "the notebook")}</p>
            <div role="tablist" aria-label={tr("Salva o carica", "Save or load")} ref={schedeRef} onKeyDown={frecceSchede} style={{ display: "flex", gap: "1.2em", marginTop: ".3em" }}>
              {(["salva", "carica"] as Modo[]).map((m) => (
                <button key={m} type="button" role="tab" className="opz-scheda" data-scheda={m} aria-selected={modo === m} tabIndex={modo === m ? 0 : -1}
                  disabled={m === "salva" && !puoSalvare} onClick={() => cambiaModo(m)}
                  style={{ cursor: m === "salva" && !puoSalvare ? "default" : "pointer", background: "none", border: "none", padding: "0 0 .15em",
                    fontFamily: SERIF, fontWeight: 500, fontSize: "2em", letterSpacing: "-.01em",
                    color: modo === m ? "#f4ece0" : m === "salva" && !puoSalvare ? "rgba(226,220,208,.28)" : "rgba(226,220,208,.6)",
                    borderBottom: `2px solid ${modo === m ? accento : "transparent"}` }}>
                  {m === "salva" ? tr("Salva", "Save") : tr("Carica", "Load")}
                </button>
              ))}
            </div>
          </div>
          <button type="button" className="opz-bottone" onClick={onChiudi} aria-label={tr("Chiudi il taccuino", "Close the notebook")} style={bottone()}>{tr("chiudi", "close")} <b>Esc</b></button>
        </div>

        <p role="status" style={{ margin: ".8em 0 0", minHeight: "1.4em", fontFamily: SERIF, fontStyle: "italic", fontSize: ".92em",
          color: nota?.errore ? "#f28b6b" : nota ? accento : "rgba(226,220,208,.6)" }}>
          {nota?.testo ?? (modo === "salva" ? tr("Scegli un nome per un salvataggio nuovo, o un salvataggio da riscrivere.", "Choose a name for a new save, or a save to overwrite.")
            : tr("Scegli da dove riprendere il viaggio.", "Choose where to pick up the journey."))}
        </p>

        <div style={{ marginTop: ".8em", flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "27em 1fr", columnGap: "2.2em" }}>
          <div ref={elencoRef} className="tc-elenco gv-scroll" role="list" aria-label={modo === "salva" ? tr("Dove salvare", "Where to save") : tr("Che cosa caricare", "What to load")} onKeyDown={tastiElenco}>
            {righe.map(riga)}
            {voci !== null && !righe.length && <p className="tc-vuoto">{tr("Nessun salvataggio.", "No saves.")}</p>}
          </div>
          <div style={{ minWidth: 0, minHeight: 0, overflow: "hidden" }}>{dettaglio()}</div>
        </div>

        <div style={{ marginTop: "1em", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1em", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: ".5em" }}>
            {modo === "carica" && <button type="button" className="opz-bottone" style={bottone()} onClick={daFile}>{tr("apri un file…", "open a file…")}</button>}
            {archivioSuDisco() && <button type="button" className="opz-bottone" style={bottone()} onClick={() => apriCartella()}>{tr("apri la cartella", "open the folder")}</button>}
          </div>
          <span style={{ fontFamily: MONO, fontSize: ".78em", letterSpacing: ".06em", color: "rgba(230,222,208,.5)", textAlign: "right" }}>
            {modo === "salva" ? tr("↑↓ scegli · Invio salva · Canc elimina", "↑↓ choose · Enter saves · Del deletes")
              : tr("↑↓ scegli · Invio carica · Canc elimina", "↑↓ choose · Enter loads · Del deletes")}<br />
            {dove ? `${dove} · ` : tr("nel browser · ", "in the browser · ")}{in_(TITOLO)} {VERSIONE.gioco}
          </span>
        </div>
      </div>

      {richiesta?.tipo === "sovrascrivi" && vr && (
        <Domanda base={base} accento={accento} domanda={tr(`Sovrascrivere ${virgolette(nomeVoce(vr))}?`, `Overwrite ${virgolette(nomeVoce(vr))}?`)}
          sotto={tr("Il salvataggio di prima si perde: al suo posto, la partita di adesso.", "The previous save is lost: the current game takes its place.")}
          si={tr("sì, sovrascrivi", "yes, overwrite")} no="no" onSi={() => { setRichiesta(null); sovrascrivi(vr); }} onNo={() => { setRichiesta(null); metti(vr.posto); }} />
      )}
      {richiesta?.tipo === "elimina" && vr && (
        <Domanda base={base} accento={accento} domanda={tr(`Eliminare ${virgolette(nomeVoce(vr))}?`, `Delete ${virgolette(nomeVoce(vr))}?`)}
          sotto={archivioSuDisco() ? tr("Il file si cancella dalla cartella dei salvataggi.", "The file is deleted from the saves folder.")
            : tr("Il salvataggio si cancella dal browser.", "The save is deleted from the browser.")}
          si={tr("sì, elimina", "yes, delete")} no="no" onSi={() => { setRichiesta(null); eliminaDavvero(vr); }} onNo={() => { setRichiesta(null); metti(vr.posto); }} />
      )}
      {(richiesta?.tipo === "carica" || richiesta?.tipo === "file") && richiesta.dati && (
        <Domanda base={base} accento={accento}
          domanda={tr(`Caricare ${daCaricare}?`, `Load ${daCaricare}?`)}
          sotto={tr("Quello che hai fatto dopo l'ultimo salvataggio andrà perso.", "Anything you did after the last save will be lost.")}
          si={tr("sì, carica", "yes, load")} no="no" onSi={() => carica(richiesta.dati!)} onNo={() => { const p = richiesta.voce?.posto; setRichiesta(null); if (p) metti(p); }} />
      )}
    </div>
  );
}
