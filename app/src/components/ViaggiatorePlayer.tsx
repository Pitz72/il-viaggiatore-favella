// ====================================================================
//  «Il Viaggiatore» — interfaccia di gioco (seconda versione).
// --------------------------------------------------------------------
//  Superficie 1280×720 (dentro la shell 16:9). In alto il PANORAMA vivo
//  della zona (stesso linguaggio del trailer): il viandante cammina quando
//  cambi luogo. Sotto, a sinistra, il DIARIO: la prosa del motore composta
//  come un libro (serif, parole-chiave evidenziate, suggerimenti in margine,
//  battute con chi parla, sensazioni del corpo a parte); in fondo il comando,
//  le risposte di dialogo come pulsanti, le uscite e le cose del luogo.
//  A destra, il CORPO (vita, sete, fame con le soglie), le SCORTE (acqua e
//  cibo si toccano: «Vuoi bere?» «Vuoi mangiare?», con la quantità), la
//  BISACCIA a sette posti, la FIDUCIA di chi hai incontrato, il CAMMINO.
//  Pulsanti e parser dicono le stesse parole: un pulsante manda un comando che
//  si potrebbe anche scrivere. Le scelte che costano (un baratto, un dono, una
//  violenza) chiedono conferma PRIMA di partire, con un'anteprima del motore.
//  La logica è il motore FAVELLA reale (Pyodide), via favellaRuntime.
//  Il TACCUINO salva e carica (salvataggi con nome, dalla testata o dalla
//  pausa); F5 salva al volo nel posto rapido e F9 lo ricarica; i tre posti
//  automatici si scrivono a rotazione a ogni cambio di luogo e quando si lascia
//  la partita. Ogni salvataggio porta la miniatura del paesaggio e il tempo di
//  gioco (piano 09, §6).
//  I comandi si danno in due modi (opzioni, Generale; piano 09, §3.3): pulsanti
//  (niente riga da scrivere, il fuoco va al primo pulsante utile) e parole
//  (l'avventura testuale pura: niente file di pulsanti, menu delle cose e dosi;
//  risposte, scorte e bisaccia si leggono soltanto). «opzioni», «pausa», «salva»,
//  «carica», «trofei» e, con la mappa in bisaccia, «mappa» scritti nella riga
//  aprono i pannelli dell'app: non arrivano al motore.
//  La MAPPA (gioco/Mappa.tsx): con la mappa in bisaccia compare il pulsante «mappa»
//  (o il tasto M, o la parola scritta) e apre un foglio che si riempie camminando.
//  I TROFEI (piano 09, §7): dopo ogni turno le regole (gioco/trofei.ts) guardano
//  il testo e lo stato del mondo; un trofeo nuovo si scrive nel deposito
//  (lib/trofei.ts) e compare in alto col suono flautato, mai sopra il finale:
//  quelli dell'ultimo turno si annunciano sul menu d'avvio. Le sfide della
//  partita (scritto, toccato, tornato indietro) viaggiano nei salvataggi.
//  La MUSICA delle zone (gioco/musica.ts) segue il luogo: un brano per zona, che
//  negli interni si sente da dentro; alla fine del viaggio si spegne.
//  LA FINE (piano 11): il riquadro del finale tiene la frase, senza pulsanti;
//  quando il narratore ha finito di leggere (o, senza voce, dopo il tempo di
//  leggere) la partita passa la mano a chi l'ha aperta (onFine): la sequenza
//  finale dopo un finale della storia, il menu d'avvio dopo una morte. Il gioco
//  non riparte da solo.
// ====================================================================
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { avviaGioco } from "../lib/favellaRuntime";
import type { AzioniContesto, Carta, SessioneGioco, StatoMondo, TurnoEsito } from "../lib/favellaRuntime";
import { VIAGGIATORE_GAME, ZONE_THEME, type ZoneKey, zoneOf } from "../data/viaggiatore";
import Panorama, { tipoInterno, type Clima } from "../gioco/Panorama";
import { musica } from "../gioco/musica";
import ComeSiGioca from "../gioco/ComeSiGioca";
import Taccuino from "../gioco/Taccuino";
import Conferma from "../gioco/Conferma";
import PannelloScorta from "../gioco/PannelloScorta";
import Plancia from "../gioco/Plancia";
import Tendina from "../gioco/Tendina";
import { bersagliDelUso, conArticolo, conSu, senzaArticolo, serveAnteprima, valutaConferma, vociDelMenu, type Conferma as DatiConferma, type Cosa } from "../gioco/azioni";
import { componi, dataLeggibile, genere, leggi, nomeVisibile, postoAutomatico, RAPIDO, scrivi, type Posto, type Riassunto, type Salvataggio } from "../lib/salvataggi";
import Cartiglio, { type DatiCartiglio } from "../gioco/Cartiglio";
import Domanda from "../gioco/Domanda";
import { annota, inDesktop, esciDalGioco } from "../lib/desktop";
import { analizza, spezza, VOCI, GESTI, type Blocco } from "../gioco/testo";
import { partiDelBlocco, partiDellaScelta, type Tabella } from "../gioco/parti";
import { voce, PAUSA_FRASE, PAUSA_RIGA, type Parte } from "../gioco/voce";
import PannelloOpzioni from "../gioco/Opzioni";
import Pausa from "../gioco/Pausa";
import { useOpzioni } from "../lib/useOpzioni";
import { movimentoRidotto } from "../lib/accessibilita";
import PaginaTrofei from "../gioco/PaginaTrofei";
import Mappa from "../gioco/Mappa";
import { PER_ID, sfideCaricate, sfideNuove, trofeiDelTurno, type Sfide } from "../gioco/trofei";
import { ascoltaTrofei, deposito, nuovoViaggio, piuLontano, segnaLontano, vinci } from "../lib/trofei";
import { suonaTrofeo } from "../gioco/suonoTrofeo";
import { DURATA_TROFEO } from "../gioco/Cartiglio";
import "../gioco/gioco.css";

const VUOTO: StatoMondo = { inventory: [], counters: {}, room: null, roomId: null };
const ZORDER: ZoneKey[] = ["z1", "z2", "z3", "z4", "z5", "z6", "z7"];
const MAGGIORI = ["Saverio", "Iole", "Vito", "Rosaria", "Onofrio"];

interface Voce { id: number; cmd?: string; blocchi: Blocco[] }
type Menu = Cosa | null;
/** `annullabile`: dopo la mossa il pulsante ↶ annulla potrà disfarla (non se il dialogo continua o la partita finisce);
 *  `daRiga`: il comando è stato scritto, non toccato (per le sfide dei trofei) */
type Richiesta = { cmd: string; etichetta: string; conferma: DatiConferma; annullabile: boolean; daRiga: boolean } | null;
const SENZA_AZIONI: AzioniContesto = { soli: [], bersagli: [] };
/** Dopo la voce del finale, un respiro prima di andare avanti (ms). */
const DOPO_LA_VOCE = 2500;

/** Com'è finita la partita: `frase` è quella del finale (senza «FINALE —»), `trofei` quelli vinti nell'ultimo turno. */
export interface FinePartita { esito: string; frase: string | null; trofei: string[] }

const ViaggiatorePlayer = ({ onExit, onFine, carica = null }: { onExit: () => void; onFine: (f: FinePartita) => void; carica?: Salvataggio | null }) => {
  const [fase, setFase] = useState<"carica" | "gioca" | "errore">("carica");
  const [messaggio, setMessaggio] = useState("Si carica il motore…");
  const [voci, setVoci] = useState<Voce[]>([]);
  const [bozza, setBozza] = useState("");
  const [finita, setFinita] = useState(false);
  const [esito, setEsito] = useState("in_corso");
  const [finale, setFinale] = useState("");
  const [mondo, setMondo] = useState<StatoMondo>(VUOTO);
  const [guida, setGuida] = useState(false);
  const [menu, setMenu] = useState<Menu>(null);
  // «usa X su…»: la cosa di cui si sta scegliendo la compagna
  const [usaDa, setUsaDa] = useState<Cosa | null>(null);
  // ciò che si è toccato per aprire la tendina (il menu di una cosa, «usa su…», le dosi): la tendina gli sta accanto
  const [ancora, setAncora] = useState<HTMLElement | null>(null);
  const [incontrati, setIncontrati] = useState<string[]>([]);
  const [camminaDa, setCamminaDa] = useState(-1e9);
  const [taccuino, setTaccuino] = useState<null | "salva" | "carica">(null);
  // comandi dati dopo l'ultimo salvataggio o caricamento: se > 0, caricare fa perdere qualcosa
  const [nonSalvati, setNonSalvati] = useState(0);
  // «Vuoi bere?» / «Vuoi mangiare?»; la scelta in attesa di conferma
  const [pannello, setPannello] = useState<null | "bere" | "mangiare">(null);
  const [richiesta, setRichiesta] = useState<Richiesta>(null);
  const [azioniCtx, setAzioniCtx] = useState<AzioniContesto>(SENZA_AZIONI);

  const sessione = useRef<SessioneGioco | null>(null);
  const diarioRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const storia = useRef<string[]>([]);
  const iStoria = useRef(-1);
  const contatore = useRef(0);

  // ── la voce (il doppiaggio) ────────────────────────────────────────
  // In voce recitata il diario non si annuncia: ciò che la voce non dice (le risposte del
  // motore, i titoli dei luoghi, le parti senza audio) va al lettore di schermo da un'area a parte.
  const [opz] = useOpzioni();
  // i comandi: o la riga da scrivere (avventura testuale), o i pulsanti
  const conRiga = opz.comandi === "parole";
  const conPulsanti = opz.comandi === "pulsanti";
  const [pannelloOpzioni, setPannelloOpzioni] = useState(false);
  const [pausa, setPausa] = useState(false);
  // Esc mentre la voce parla la zittisce soltanto: non apre anche la pausa
  const zittita = useRef(false);
  // il cartiglio in alto («Salvato · rapido»); il salvataggio rapido in attesa di conferma (F9 con strada non salvata)
  const [cartiglio, setCartiglio] = useState<DatiCartiglio | null>(null);
  const avvisa = (testo: string, grave = false) => setCartiglio((c) => ({ n: (c?.n ?? 0) + 1, testo, grave }));
  const [rapidoDaCaricare, setRapidoDaCaricare] = useState<Salvataggio | null>(null);
  // i trofei: quelli già vinti (dal deposito), le sfide di questa partita, quelli vinti in questo viaggio
  // (per la schermata finale), la fila degli avvisi, la pagina
  const vinti = useRef<Set<string>>(new Set());
  useEffect(() => {
    deposito().then((d) => { vinti.current = new Set(Object.keys(d.vinti)); });
    return ascoltaTrofei((d) => { vinti.current = new Set(Object.keys(d.vinti)); });
  }, []);
  const sfide = useRef<Sfide>(sfideNuove(nuovoViaggio()));
  const [trofeiViaggio, setTrofeiViaggio] = useState<string[]>([]);
  const [codaTrofei, setCodaTrofei] = useState<string[]>([]);
  const [paginaTrofei, setPaginaTrofei] = useState(false);
  // la mappa: la carta di tutti i luoghi (la dà il ponte una volta), e il foglio aperto
  const [carta, setCarta] = useState<Carta | null>(null);
  const [paginaMappa, setPaginaMappa] = useState(false);
  // il tempo di gioco: corre solo con la partita in corso, la pausa chiusa e la finestra in primo piano
  const tempo = useRef(0);
  const conta = useRef(false);
  conta.current = fase === "gioca" && !finita && !pausa;
  useEffect(() => {
    const t = setInterval(() => { if (conta.current && !document.hidden && document.hasFocus()) tempo.current += 1000; }, 1000);
    return () => clearInterval(t);
  }, []);
  // la miniatura del salvataggio: dal paesaggio di adesso, un ritaglio 2,4:1 attorno al viandante (Panorama, VX = 610 su 1280)
  const panoramaRef = useRef<HTMLElement>(null);
  const miniatura = (): string | undefined => {
    const tela = panoramaRef.current?.querySelector("canvas");
    if (!tela || !tela.width || !tela.height) return undefined;
    try {
      const largo = Math.min(tela.width, Math.round(tela.height * 2.4));
      const x = Math.max(0, Math.min(tela.width - largo, Math.round((610 / 1280) * tela.width - largo / 2)));
      const c = document.createElement("canvas");
      c.width = 432; c.height = 180;
      c.getContext("2d")!.drawImage(tela, x, 0, largo, tela.height, 0, 0, c.width, c.height);
      return c.toDataURL("image/jpeg", 0.78);
    } catch {
      return undefined;
    }
  };
  const [annuncio, setAnnuncio] = useState({ n: 0, testo: "" });
  const tabVoce = useRef<Tabella | null>(null);
  const daDire = useRef<Blocco[] | null>(null);   // il primo testo, se arriva prima dell'indice della voce
  const recitata = opz.voce === "recitata";
  const recitataRef = useRef(recitata);
  recitataRef.current = recitata;

  const daiVoce = (blocchi: Blocco[]) => {
    if (!recitataRef.current) return;
    const tab = tabVoce.current;
    if (!tab) { daDire.current = blocchi; return; }
    const parti: Parte[] = [];
    const muti: string[] = [];
    let rigaPrima = -1;
    blocchi.forEach((b, riga) => {
      if (b.tipo === "stanza") { muti.push(b.titolo); return; }
      if (b.tipo === "sistema" || b.tipo === "comando") { muti.push(b.testo); return; }
      const r = partiDelBlocco(b, tab);
      const suonano = r.ids.filter((id) => voce.ha(id));
      if (!suonano.length) { muti.push(b.tipo === "battuta" ? `${b.chi}: ${b.testo}` : b.testo); return; }
      muti.push(...r.ids.filter((id) => !voce.ha(id)).map((id) => voce.testoDi(id)), ...r.mancano.map((m) => m.testo));
      for (const id of suonano) { parti.push({ id, pausa: riga === rigaPrima ? PAUSA_FRASE : PAUSA_RIGA }); rigaPrima = riga; }
    });
    voce.dici(parti);
    const testo = muti.filter(Boolean).join(" ");
    if (testo) setAnnuncio((a) => ({ n: a.n + 1, testo }));
  };
  const daiVoceRef = useRef(daiVoce);
  daiVoceRef.current = daiVoce;

  /** Una risposta di dialogo: la legge il narratore quando ci si ferma sopra o la si raggiunge da tastiera,
   *  ma mai sopra il turno che parla (prima il personaggio: voce.anteprima). */
  const diciScelta = (opzione: string): boolean => {
    if (!recitata || !tabVoce.current) return false;
    return voce.anteprima(partiDellaScelta(opzione, tabVoce.current).ids.map((id) => ({ id, pausa: 0 })));
  };
  // Col mouse la risposta si legge dopo una sosta (un terzo di secondo: scorrendo veloce non partono pezzi di frasi)
  // e solo se il mouse si è mosso davvero dopo l'ultimo turno: quando la lista cambia sotto un mouse fermo, il
  // browser dice «ci sei entrato», ma nessuno ha chiesto niente. Detta una volta, la stessa risposta non si ridice
  // finché il mouse non esce (se il personaggio parlava e non è stata detta, una mossa sopra la fa dire).
  const SOSTA = 330;
  const sosta = useRef(0);
  const turnoDa = useRef(0);
  const mossoDa = useRef(0);
  const detta = useRef<string | null>(null);
  useEffect(() => {
    let x = -1, y = -1;
    const muovi = (e: MouseEvent) => {
      if (e.clientX === x && e.clientY === y) return;
      x = e.clientX; y = e.clientY;
      mossoDa.current = performance.now();
    };
    window.addEventListener("mousemove", muovi, true);
    return () => { window.removeEventListener("mousemove", muovi, true); window.clearTimeout(sosta.current); };
  }, []);
  const sopraScelta = (opzione: string) => {
    window.clearTimeout(sosta.current);
    if (detta.current === opzione) return;
    sosta.current = window.setTimeout(() => {
      if (mossoDa.current > turnoDa.current && diciScelta(opzione)) detta.current = opzione;
    }, SOSTA);
  };
  const viaDallaScelta = () => { window.clearTimeout(sosta.current); detta.current = null; };
  /** Un turno nuovo (o una partita ripresa): le risposte sotto il mouse sono altre. */
  const nuovoTurno = () => { turnoDa.current = performance.now(); viaDallaScelta(); };

  useEffect(() => {
    let vivo = true;
    voce.prepara().then((tab) => {
      if (!vivo) return;
      tabVoce.current = tab;
      const primo = daDire.current;
      daDire.current = null;
      if (primo) daiVoceRef.current(primo);
    });
    // la voce si ferma al primo tasto (non ai soli tasti di modifica); F2 ridice l'ultimo testo
    const tasto = (e: KeyboardEvent) => {
      if (e.key === "F2") { e.preventDefault(); if (recitataRef.current) voce.riascolta(); return; }
      // né ai tasti di modifica né a Tab: passare da un pulsante all'altro non è parlarle sopra
      if (["Shift", "Control", "Alt", "AltGraph", "Meta", "CapsLock", "Tab"].includes(e.key)) return;
      zittita.current = e.key === "Escape" && voce.parla;
      voce.ferma();
    };
    window.addEventListener("keydown", tasto, true);
    return () => { vivo = false; window.removeEventListener("keydown", tasto, true); voce.ferma(); };
  }, []);
  // il volume lo segue il bus sonoro (lib/suono.ts); passando al lettore di schermo la voce tace subito
  useEffect(() => { if (!recitata) voce.ferma(); }, [recitata]);

  // ── la musica delle zone ───────────────────────────────────────────
  // segue il luogo (zona e interno); a viaggio finito si spegne (mai sopra il finale); lasciando la partita si chiude
  useEffect(() => {
    if (fase !== "gioca") return;
    if (finita) { musica.ferma(); return; }
    const z = zoneOf(mondo.roomId);
    musica.vai(z === "z0" ? null : z, tipoInterno(mondo.roomId));
  }, [fase, finita, mondo.roomId]);
  useEffect(() => () => musica.chiudi(), []);

  // ── avvio del motore ────────────────────────────────────────────────
  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const s = await avviaGioco(VIAGGIATORE_GAME, (m) => vivo && setMessaggio(m));
        if (!vivo) return;
        sessione.current = s;
        const e = s.boot();
        const primi = analizza(e.text);
        setVoci([{ id: contatore.current++, blocchi: primi }]);
        setMondo(s.stato());
        setCarta(s.mappa());
        setCamminaDa(performance.now());
        if (carica) riprendi(carica);
        else daiVoce(primi);
        setFase("gioca");
      } catch (err) {
        if (vivo) { setMessaggio(err instanceof Error ? err.message : String(err)); setFase("errore"); }
      }
    })();
    return () => { vivo = false; };
  }, []);

  // Il fuoco dove si gioca: la riga; coi pulsanti il primo pulsante utile (la prima risposta, il «no» di una
  // domanda, la prima uscita). Messo dal codice su una risposta, non la fa leggere: la voce sta dicendo la battuta.
  const comandiRef = useRef<HTMLDivElement>(null);
  const fuocoDaCodice = useRef(false);
  const rimettiFuoco = () => {
    if (conRiga) { inputRef.current?.focus(); return; }
    const box = comandiRef.current;
    const el = box?.querySelector<HTMLElement>("[data-fuoco]") ?? box?.querySelector<HTMLElement>("button:not(:disabled)");
    if (!el) return;
    fuocoDaCodice.current = true;
    el.focus();
    fuocoDaCodice.current = false;
  };
  useEffect(() => { if (fase === "gioca" && !finita && !guida && !taccuino && !richiesta && !pannelloOpzioni && !pausa && !rapidoDaCaricare && !paginaTrofei && !paginaMappa) rimettiFuoco(); }, [fase, finita, guida, taccuino, voci, richiesta, pannelloOpzioni, pausa, rapidoDaCaricare, paginaTrofei, paginaMappa, opz.comandi]); // eslint-disable-line react-hooks/exhaustive-deps
  // i verbi che qui e adesso hanno un effetto (attingi, curati, attacca…) cambiano a ogni turno
  useEffect(() => {
    if (fase === "gioca" && sessione.current && !finita) setAzioniCtx(sessione.current.azioni());
  }, [mondo, fase, finita]);
  useEffect(() => {
    const el = diarioRef.current;
    if (el) requestAnimationFrame(() => el.scrollTo({ top: el.scrollHeight, behavior: movimentoRidotto() ? "auto" : "smooth" }));
  }, [voci, finita, trofeiViaggio.length, opz.testo]);   // anche col testo che cambia: il fondo resta in vista

  // ── un turno ───────────────────────────────────────────────────────
  const applica = (etichetta: string, e: TurnoEsito) => {
    nuovoTurno();
    const blocchi = analizza(e.text);
    setVoci((v) => [...v, { id: contatore.current++, cmd: etichetta, blocchi }]);
    daiVoce(blocchi);
    const nuovi = blocchi.flatMap((b) => (b.tipo === "battuta" ? [b.chi] : []));
    if (nuovi.length) setIncontrati((p) => Array.from(new Set([...p, ...nuovi])));
    const fin = blocchi.find((b) => b.tipo === "finale");
    if (fin && fin.tipo === "finale") setFinale(fin.testo);
    const fine = !e.continua || e.stato !== "in_corso";
    if (sessione.current) {
      const dopo = sessione.current.stato();
      if (dopo.roomId !== mondo.roomId) setCamminaDa(performance.now());
      setMondo(dopo);
      controllaTrofei(e, dopo, fine);
    }
    if (!e.continua && e.stato === "in_corso") { esci(); return; }   // «esci», «sì»: si torna all'intro
    if (fine) { setFinita(true); setEsito(e.stato); }
  };

  /** Le regole dei trofei dopo un turno. I nuovi si scrivono nel deposito; l'avviso compare solo se la partita
   *  continua (mai sopra il finale), e la schermata finale li elenca tutti. */
  const controllaTrofei = (e: TurnoEsito, dopo: StatoMondo, fine: boolean) => {
    const nuovi = trofeiDelTurno({ testo: e.text, esito: e.stato, counters: dopo.counters, voci: dopo.voci, gesti: dopo.gesti,
      stati: dopo.stati, sfide: sfide.current }, vinti.current);
    if (!nuovi.length) return;
    for (const id of nuovi) vinti.current.add(id);
    vinci(nuovi).then((davvero) => {
      if (!davvero.length) return;
      annota("info", `trofei: ${davvero.join(", ")}`);
      setTrofeiViaggio((v) => [...v, ...davvero]);
      if (!fine) setCodaTrofei((c) => [...c, ...davvero]);
      else trofeiDellaFine.current.push(...davvero);   // si annunciano sul menu d'avvio
    }).catch((err) => annota("warn", `trofei non scritti: ${err?.message ?? err}`));
  };

  // gli avvisi dei trofei, uno alla volta, ciascuno col suo suono; a viaggio finito la fila si svuota
  useEffect(() => {
    const id = codaTrofei[0];
    if (!id) return;
    if (finita) { setCodaTrofei([]); return; }
    setCartiglio((c) => ({ n: (c?.n ?? 0) + 1, testo: PER_ID.get(id)?.nome ?? id, trofeo: true }));
    suonaTrofeo();
    const t = setTimeout(() => setCodaTrofei((c) => c.slice(1)), DURATA_TROFEO + 300);
    return () => clearTimeout(t);
  }, [codaTrofei[0], finita]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── un comando: dalla tastiera o da un pulsante, è lo stesso ─────────
  const chiudiPannelli = () => { setMenu(null); setPannello(null); setUsaDa(null); setAncora(null); };
  /** Chiude la tendina senza un turno: coi pulsanti il fuoco torna a ciò che l'aveva aperta. */
  const chiudiTendina = () => {
    const a = ancora;
    chiudiPannelli();
    if (!conRiga) { if (a?.isConnected) a.focus(); else rimettiFuoco(); }
  };
  /** «usa la tanica su…» (una cosa della bisaccia), «usa sulla mappa…» (una cosa del luogo) */
  const titoloUsa = (c: Cosa) => (c.tipo === "zaino" ? `usa ${conArticolo(c.nome)} su…` : `usa ${conSu(conArticolo(c.nome))}…`);
  /** Tocca una cosa (del luogo, della bisaccia, una parola del diario): accanto si apre il suo menu; toccata di nuovo, si chiude. */
  const apriCosa = (cosa: Cosa, el: HTMLElement) => {
    const giaAperta = [menu, usaDa].some((c) => c?.tipo === cosa.tipo && c.id === cosa.id);
    chiudiPannelli();
    if (!giaAperta) { setMenu(cosa); setAncora(el); }
  };

  /** in dialogo un numero mostra il testo della risposta scelta */
  const etichettaDi = (cmd: string, etichetta?: string) => {
    if (etichetta) return etichetta;
    if (mondo.dialog && /^\d+$/.test(cmd)) return mondo.dialog.opzioni[Number(cmd) - 1] ?? cmd;
    return cmd;
  };

  const esegui = (cmd: string, etichetta?: string, daRiga = false) => {
    if (finita || !sessione.current) return;
    // le sfide: ANNULLA (che disfa davvero qualcosa) è tornare indietro; ogni altro comando è scritto o toccato
    const annullo = !mondo.dialog && /^(annulla|disfa)$/i.test(cmd) && (mondo.undo ?? 0) > 0;
    sfide.current = annullo ? { ...sfide.current, indietro: true }
      : daRiga ? { ...sfide.current, scritto: true } : { ...sfide.current, toccato: true };
    setBozza(""); chiudiPannelli();
    setNonSalvati((n) => n + 1);
    storia.current = [...storia.current.filter((x) => x !== cmd), cmd].slice(-60);
    iStoria.current = -1;
    applica(etichettaDi(cmd, etichetta), sessione.current.step(cmd));
  };

  /** Prima di una scelta che costa il motore dice cosa farebbe (senza farlo): se si
   *  perde qualcosa, si chiede conferma. Tutto il resto parte subito. */
  const manda = (grezzo: string, etichetta?: string, daRiga = false) => {
    const cmd = grezzo.trim();
    if (!cmd || finita || !sessione.current || richiesta) return;
    voce.ferma();   // anche un comando dato col mouse zittisce la voce: non parli sopra una scelta nuova
    if (serveAnteprima(cmd, mondo)) {
      const antep = sessione.current.anteprima(cmd);
      const c = valutaConferma(cmd, antep, mondo);
      if (c) {
        setBozza(""); chiudiPannelli();
        // ANNULLA disfa un turno intero: dentro un dialogo che continua, o a partita chiusa, il pulsante non c'è
        setRichiesta({ cmd, etichetta: etichettaDi(cmd, etichetta), conferma: c, annullabile: !antep.dialogo && antep.esito === "in_corso", daRiga });
        return;
      }
    }
    esegui(cmd, etichetta, daRiga);
  };
  const confermaSi = () => { const r = richiesta; setRichiesta(null); if (r) esegui(r.cmd, r.etichetta, r.daRiga); };
  const confermaNo = () => { setRichiesta(null); rimettiFuoco(); };

  // la mappa c'è finché la mappa è in bisaccia: se la lasci, il suo pulsante se ne va con lei
  const haMappa = mondo.inventory.some((o) => senzaArticolo(o) === "mappa");
  const apriMappa = () => {
    if (!haMappa || finita || !carta || fase !== "gioca" || richiesta) return;
    voce.ferma();
    chiudiPannelli();
    setPaginaMappa(true);
  };

  /** Ciò che si scrive nella riga. Sei parole sono dell'app, non del motore (che non le usa): aprono i
   *  pannelli e non diventano un turno («mappa» solo se la mappa è in bisaccia: se no la risponde il motore).
   *  Il resto è un comando, scritto (per le sfide dei trofei). */
  const scritto = (grezzo: string) => {
    const parola = grezzo.trim().toLowerCase();
    const apri = parola === "opzioni" ? () => setPannelloOpzioni(true)
      : parola === "pausa" ? () => setPausa(true)
      : parola === "salva" ? () => setTaccuino("salva")
      : parola === "carica" ? () => setTaccuino("carica")
      : parola === "trofei" ? () => setPaginaTrofei(true)
      : parola === "mappa" && haMappa && carta && !finita ? apriMappa
      : null;
    if (!apri) { manda(grezzo, undefined, true); return; }
    voce.ferma();
    setBozza(""); chiudiPannelli();
    iStoria.current = -1;
    apri();
  };

  useEffect(() => { chiudiPannelli(); }, [opz.comandi]);

  const anteprima = useCallback((cmd: string) => sessione.current!.anteprima(cmd), []);
  /** «Vuoi bere?» «Vuoi mangiare?» accanto a ciò che l'ha aperto (Bevi, una scorta, la tanica); toccato di nuovo, si chiude. */
  const apriPannello = (tipo: "bere" | "mangiare", el: HTMLElement) => {
    const chiudere = pannello === tipo && ancora === el;
    chiudiPannelli();
    if (!chiudere) { setPannello(tipo); setAncora(el); }
  };

  // ── la fine del viaggio ────────────────────────────────────────────
  // Il riquadro del finale tiene la frase; quando il narratore ha finito di leggere (o, senza voce, dopo il tempo di
  // leggere l'ultimo turno) si passa la mano: la sequenza finale o, dopo una morte, il menu d'avvio. Invio, Spazio o Esc
  // vanno avanti subito. Il gioco non riparte da solo (Simone, 21/10/2026).
  const trofeiDellaFine = useRef<string[]>([]);
  const passata = useRef(false);
  const continua = () => {
    if (passata.current) return;
    passata.current = true;
    voce.ferma();
    onFine({ esito, frase: finale || null, trofei: [...trofeiDellaFine.current] });
  };
  const continuaRef = useRef(continua);
  continuaRef.current = continua;
  const ingombro = useRef(false);
  ingombro.current = pausa || guida || !!taccuino || pannelloOpzioni || paginaTrofei || paginaMappa || !!rapidoDaCaricare;
  useEffect(() => {
    if (!finita || fase !== "gioca") return;
    passata.current = false;
    const ultimo = voci[voci.length - 1];
    const caratteri = ultimo ? ultimo.blocchi.reduce((n, b) => n + ("testo" in b ? b.testo.length : 0), 0) : 0;
    const lettura = Math.min(40, Math.max(6, 4 + caratteri / 18)) * 1000;
    let timer = 0;
    // con un pannello aperto (pausa, opzioni, guida, taccuino, trofei) non si va avanti: si riprova dopo un respiro
    const fra = (ms: number) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => (ingombro.current ? fra(DOPO_LA_VOCE) : continuaRef.current()), ms);
    };
    // il tempo di leggere vale finché la voce non comincia; da lì si aspetta che taccia, poi un respiro
    fra(voce.parla ? 600_000 : lettura);
    const smetti = voce.ascolta((parla) => fra(parla ? 600_000 : DOPO_LA_VOCE));
    const tasto = (e: KeyboardEvent) => {
      if (e.defaultPrevented || ingombro.current || !["Enter", " ", "Escape"].includes(e.key)) return;
      e.preventDefault();
      continuaRef.current();
    };
    window.addEventListener("keydown", tasto);
    return () => { window.clearTimeout(timer); smetti(); window.removeEventListener("keydown", tasto); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finita, fase]);

  // ── salvare e caricare ─────────────────────────────────────────────
  const riassunto = (m: StatoMondo): Riassunto => {
    const z = zoneOf(m.roomId);
    const n = (k: string) => (typeof m.counters[k] === "number" ? m.counters[k] : 0);
    return {
      luogo: m.room ?? "—", zona: z, nomeZona: ZONE_THEME[z].nome, tappa: Math.max(1, ZORDER.indexOf(z) + 1), turno: m.turn ?? 0,
      vita: n("vita"), sete: n("sete"), fame: n("fame"), acqua: n("acqua"), cibo: n("cibo"),
    };
  };

  /** Scrive la partita in un posto; `nome` per i salvataggi con nome (un automatico o il rapido non ne hanno). */
  const salvaIn = async (posto: Posto, nome?: string) => {
    const s = sessione.current;
    if (!s) throw new Error("La partita non è ancora pronta.");
    const partita = s.salva();
    const dati = componi(posto, partita, riassunto(s.stato()), {
      voci: voci.map(({ cmd, blocchi }) => ({ cmd, blocchi })), incontrati, storia: storia.current,
    }, { nome, miniatura: miniatura(), tempoMs: tempo.current, sfide: sfide.current });
    await scrivi(posto, dati);
    segnaLontano(sfide.current.id, partita.comandi.length).catch(() => {});
    if (genere(posto) !== "automatico") setNonSalvati(0);
  };
  const salvaAutomatico = () => postoAutomatico().then((p) => salvaIn(p));

  // il posto automatico: a ogni cambio di luogo, fuori dai dialoghi
  const autoLuogo = useRef<string | null>(null);
  useEffect(() => {
    if (fase !== "gioca" || finita || mondo.dialog || !mondo.roomId) return;
    if (autoLuogo.current === null) { autoLuogo.current = mondo.roomId; return; }
    if (autoLuogo.current === mondo.roomId) return;
    autoLuogo.current = mondo.roomId;
    salvaAutomatico().catch((e) => annota("warn", `salvataggio automatico non riuscito: ${e?.message ?? e}`));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mondo.roomId, mondo.dialog, fase, finita]);

  // lasciare la partita (verso l'intro o fuori dal gioco): se c'è strada non salvata, prima il posto automatico
  const lascia = (dove: () => void) => {
    if (fase === "gioca" && !finita && !mondo.dialog && nonSalvati > 0) {
      salvaAutomatico().catch(() => {}).finally(dove);
    } else dove();
  };
  const esci = () => lascia(onExit);
  const chiudiGioco = () => lascia(esciDalGioco);

  /** Riprende una partita salvata: il motore rigioca la sequenza e verifica l'impronta. */
  function riprendi(dati: Salvataggio) {
    const s = sessione.current;
    if (!s) return;
    const t0 = performance.now();
    // dov'era arrivato il viaggio di adesso, prima di lasciarlo: se si ricarica un suo punto più indietro, è tornare indietro
    const qui = s.salva().comandi.length;
    const viaggioDiPrima = sfide.current.id;
    if (qui > 0) segnaLontano(viaggioDiPrima, qui).catch(() => {});
    const esito = s.carica(dati.partita);
    if (!esito.ok) {
      annota("error", `caricamento fallito (${dati.posto}): ${esito.errore}`);
      setVoci((v) => [...v, { id: contatore.current++, blocchi: [{ tipo: "sistema", testo: `Il salvataggio non si è potuto caricare: ${esito.errore}` }] }]);
      return;
    }
    const nuovoMondo = s.stato();
    const stessaAvventura = s.salva().avventura === dati.partita.avventura;
    const note: Blocco[] = [{ tipo: "sistema", testo: `— Ripreso da «${nomeVisibile({ posto: dati.posto, dati })}», salvato il ${dataLeggibile(dati.creato)} —` }];
    if (!esito.identica) {
      note.push({ tipo: "sistema", testo: stessaAvventura
        ? "Attenzione: la partita ricostruita non coincide del tutto con quella salvata."
        : `Salvato con la versione ${dati.gioco}: la partita è stata ricostruita su questa versione del gioco.` });
      annota("warn", `caricamento con impronta diversa (salvato ${dati.gioco}, stessa avventura: ${stessaAvventura})`);
    }
    annota("info", `partita caricata: ${dati.posto}, ${esito.comandi} comandi in ${Math.round(performance.now() - t0)} ms`);
    nuovoTurno();
    const ripresa = [...note, ...analizza(esito.text)];
    setVoci([
      ...dati.diario.voci.map((v) => ({ id: contatore.current++, cmd: v.cmd, blocchi: v.blocchi })),
      { id: contatore.current++, blocchi: ripresa },
    ]);
    daiVoce(ripresa);
    eraMappa.current = nuovoMondo.inventory.some((o) => senzaArticolo(o) === "mappa");
    setMondo(nuovoMondo);
    autoLuogo.current = nuovoMondo.roomId;
    setIncontrati(dati.diario.incontrati ?? []);
    storia.current = dati.diario.storia ?? [];
    iStoria.current = -1;
    setMenu(null); setUsaDa(null); setBozza(""); setPannello(null); setRichiesta(null);
    const fine = esito.stato !== "in_corso";
    setFinita(fine); setEsito(esito.stato); setFinale("");
    setCamminaDa(performance.now());
    setNonSalvati(0);
    tempo.current = dati.tempoMs ?? 0;
    sfide.current = sfideCaricate(dati.sfide, dati.partita.comandi.length,
      (v) => Math.max(piuLontano(v), v === viaggioDiPrima ? qui : 0), nuovoViaggio());
    setTrofeiViaggio([]); setCodaTrofei([]);
    trofeiDellaFine.current = [];
    setPausa(false);
  }

  // F5 salva al volo nel posto rapido, F9 lo ricarica (con una domanda, se c'è strada non salvata)
  const salvaRapido = () => {
    if (finita) { avvisa("A viaggio finito non si salva"); return; }
    salvaIn(RAPIDO).then(() => avvisa("Salvato · rapido")).catch((e) => avvisa(`Non salvato: ${e?.message ?? e}`, true));
  };
  const caricaRapido = () => {
    leggi(RAPIDO).then((v) => {
      if (!v?.dati) { avvisa(v ? "Il salvataggio rapido non si legge" : "Nessun salvataggio rapido", !!v); return; }
      if (nonSalvati > 0 && !finita) setRapidoDaCaricare(v.dati);
      else riprendi(v.dati);
    }).catch((e) => avvisa(`Non caricato: ${e?.message ?? e}`, true));
  };
  useEffect(() => {
    const tasto = (e: KeyboardEvent) => {
      if (fase !== "gioca" || guida || taccuino || pannelloOpzioni || richiesta || rapidoDaCaricare || paginaTrofei || paginaMappa) return;
      if (e.key === "F5") { e.preventDefault(); salvaRapido(); }
      else if (e.key === "F9") { e.preventDefault(); caricaRapido(); }
      // Ctrl+Z fuori da un campo di testo (nella riga lo prende la riga stessa, solo se è vuota)
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !(document.activeElement instanceof HTMLInputElement)) { e.preventDefault(); annulla(); }
      // M apre la mappa, fuori da un campo di testo (nella riga si scrive «mappa») e non sopra la pausa
      else if (e.key.toLowerCase() === "m" && !e.defaultPrevented && !e.ctrlKey && !e.altKey && !e.metaKey && !pausa && !(document.activeElement instanceof HTMLInputElement)) { e.preventDefault(); apriMappa(); }
    };
    window.addEventListener("keydown", tasto);
    return () => window.removeEventListener("keydown", tasto);
  });

  // la mappa appena presa: un cartiglio dice che c'è, una volta. Una partita ripresa con la mappa in bisaccia non lo fa.
  const eraMappa = useRef<boolean | null>(null);
  useEffect(() => {
    if (fase !== "gioca") return;
    if (eraMappa.current === false && haMappa) avvisa(conRiga ? "Hai la mappa · scrivi «mappa»" : "Hai la mappa · pulsante «mappa», o il tasto M");
    eraMappa.current = haMappa;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [haMappa, fase]);

  // Esc, nell'ordine: chiude il menu o il pannello aperto; se la voce parlava, la zittisce soltanto (lo fa il tasto qui
  // sopra); con la riga vuota apre la pausa (piano 09, §5). I dialoghi aperti gestiscono Esc da sé, prima di qui.
  useEffect(() => {
    const tasto = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented || finita) return;   // a viaggio finito Esc va avanti (la fine, qui sopra)
      if (fase !== "gioca" || pausa || guida || taccuino || richiesta || pannelloOpzioni || rapidoDaCaricare || paginaTrofei || paginaMappa) return;
      if (menu || pannello || usaDa) { chiudiTendina(); return; }
      if (zittita.current) { zittita.current = false; return; }
      if (bozza.trim() && document.activeElement === inputRef.current) return;
      e.preventDefault();
      setPausa(true);
    };
    window.addEventListener("keydown", tasto);
    return () => window.removeEventListener("keydown", tasto);
  });

  // solo in sviluppo: pilotare la partita dalla console per collaudare l'interfaccia
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const w = window as unknown as { __gioco?: object };
    w.__gioco = { manda, sessione: () => sessione.current, mondo: () => mondo, richiesta: () => richiesta, musica: () => musica.diagnosi() };
    return () => { delete w.__gioco; };
  });

  const puoAnnullare = (mondo.undo ?? 0) > 0 && !mondo.dialog && !finita;
  const annulla = () => { if (puoAnnullare) manda("annulla", "annulla"); };

  const tasto = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") scritto(bozza);
    else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !bozza) { e.preventDefault(); annulla(); }
    else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      const s = storia.current;
      if (!s.length) return;
      e.preventDefault();
      let i = iStoria.current < 0 ? s.length : iStoria.current;
      i = e.key === "ArrowUp" ? Math.max(0, i - 1) : i + 1;
      if (i >= s.length) { iStoria.current = -1; setBozza(""); } else { iStoria.current = i; setBozza(s[i]); }
    }
  };

  // ── dati derivati ──────────────────────────────────────────────────
  const zona = zoneOf(mondo.roomId);
  const tema = ZONE_THEME[zona];
  const accento = finita ? (esito === "vinta" ? "#f5c563" : "#9aa3b2") : tema.accent;
  const clima: Clima = finita ? (esito === "vinta" ? "vinta" : "persa") : zona;
  const c = mondo.counters;
  const num = (k: string) => (typeof c[k] === "number" ? c[k] : 0);
  const zi = ZORDER.indexOf(zona);
  const capienzaAcqua = mondo.inventory.some((o) => /damigiana/i.test(o)) ? 20 : 10;
  const capienza = mondo.capacity ?? 7;
  // Chi hai incontrato: la fiducia dei cinque maggiori e, sotto, che cosa hai fatto a chi. Chi non
  // ha la fiducia (Imma, Pasquale) compare solo se c'è un gesto da mostrare.
  const gesti = mondo.gesti ?? {};
  const righeGesti = (n: string) => (gesti[n] ?? []).map((g) => GESTI[`${n}:${g}`]).filter(Boolean);
  const fiducie: { n: string; v: number | null }[] = [
    ...MAGGIORI.filter((n) => incontrati.includes(n) || righeGesti(n).length > 0)
      .map((n) => ({ n, v: num("fiducia di " + n.toLowerCase()) })),
    ...Object.keys(gesti).filter((n) => !MAGGIORI.includes(n) && righeGesti(n).length > 0).map((n) => ({ n, v: null })),
  ];
  const ultima = voci.length - 1;
  const stile = useMemo(() => ({ ["--acc" as string]: accento }) as React.CSSProperties, [accento]);

  // ── resa dei blocchi del diario ───────────────────────────────────
  // Le parole in maiuscolo del testo sono le stesse dei pulsanti: se indicano una
  // uscita o una cosa che c'è adesso, si toccano (un'uscita ci porta là, una cosa
  // apre il suo menu). Nelle voci passate, ciò che non c'è più resta solo evidenziato.
  const chiaveViva = (k: string): ((el: HTMLElement) => void) | null => {
    const uscita = (mondo.exits ?? []).find((u) => u.dir === k || senzaArticolo(u.verso) === k);
    if (uscita) return () => manda(uscita.dir);
    const qui = (mondo.present ?? []).find((p) => p.id === k || senzaArticolo(p.nome) === k);
    if (qui) return (el) => apriCosa({ tipo: "qui", id: qui.id, nome: qui.nome, persona: qui.persona, prendibile: qui.prendibile }, el);
    const con = mondo.inventory.find((n) => senzaArticolo(n) === k);
    if (con) return (el) => apriCosa({ tipo: "zaino", id: k, nome: con }, el);
    return null;
  };
  const chiave = (grezza: string, i: number, attiva: boolean) => {
    const k = grezza.toLowerCase();
    const vai = finita || !attiva || !conPulsanti ? null : chiaveViva(k);
    if (!vai) return <span key={i} className="vg-chiave">{k}</span>;
    return <button key={i} type="button" className="vg-chiave vg-chiave-tasto" onClick={(e) => vai(e.currentTarget)}>{k}</button>;
  };

  const prosa = (testo: string, chiaveBlocco: string, attiva: boolean) => {
    const pezzi = spezza(testo);
    const aiuti = pezzi.filter((p) => p.k === "aiuto");
    return (
      <div key={chiaveBlocco}>
        <p className="vg-prosa">
          {pezzi.filter((p) => p.k !== "aiuto").map((p, i) =>
            p.k === "chiave" ? chiave(p.s, i, attiva) : <span key={i}>{p.s}</span>)}
        </p>
        {aiuti.map((a, i) => (
          <p key={i} className="vg-aiuto"><span aria-hidden="true">◇</span> {a.s.replace(/\s+/g, " ")}</p>
        ))}
      </div>
    );
  };

  const blocco = (b: Blocco, k: string, attiva: boolean) => {
    switch (b.tipo) {
      case "stanza": return <h3 key={k} className="vg-stanza"><span>{b.titolo}</span></h3>;
      case "prosa": return prosa(b.testo, k, attiva);
      case "battuta": return (
        <div key={k} className="vg-battuta">
          <span className="vg-chi">{b.chi}</span>
          <p className="vg-prosa">{b.testo}</p>
        </div>
      );
      case "corpo": return <p key={k} className="vg-sensazione"><span aria-hidden="true">●</span> {b.testo}</p>;
      case "sistema": return <p key={k} className="vg-sistema">{b.testo}</p>;
      default: return null;
    }
  };

  // ── pezzi della barra laterale ─────────────────────────────────────
  const metro = (nome: string, val: number, max: number, soglie: number[], stato: string, rovescio = false) => {
    const k = Math.max(0, Math.min(1, val / max));
    const pericolo = rovescio ? val <= 3 : val >= soglie[1];
    const attento = rovescio ? val <= 6 : val >= soglie[0];
    const col = pericolo ? "#ef6b7e" : attento ? "#f2ad45" : "var(--acc)";
    return (
      <div className="vg-metro" key={nome}>
        <div className="vg-metro-riga">
          <span className="vg-metro-nome">{nome}</span>
          <span className="vg-metro-stato" style={pericolo || attento ? { color: col } : undefined}>{stato}</span>
          <span className="vg-metro-val" style={{ color: col }}>{val}</span>
        </div>
        <div className="vg-metro-barra">
          <div style={{ width: `${k * 100}%`, background: col, boxShadow: `0 0 12px ${col}` }} />
          {soglie.map((s) => <i key={s} style={{ left: `${(s / max) * 100}%` }} />)}
        </div>
      </div>
    );
  };
  /** Una scorta: coi pulsanti si tocca e apre «Vuoi bere?» / «Vuoi mangiare?»; nell'avventura testuale si legge e basta. */
  const scorta = (tipo: "bere" | "mangiare", detto: string, azione: string, segno: React.ReactNode, valore: number, sotto: string) => {
    const dentro = (<>
      <svg viewBox="0 0 24 24" aria-hidden="true">{segno}</svg>
      <div><b>{valore}</b><span>{sotto}</span></div>
    </>);
    if (!conPulsanti) return <div className="vg-scorta vg-informa" role="group" aria-label={`${detto}.`}>{dentro}</div>;
    return (
      <button className={"vg-scorta" + (pannello === tipo ? " vg-scorta-attiva" : "")} disabled={finita} aria-expanded={pannello === tipo}
        onClick={(e) => apriPannello(tipo, e.currentTarget)} aria-label={`${detto}. ${azione[0].toUpperCase()}${azione.slice(1)}.`}>
        {dentro}
        <i className="vg-scorta-azione" aria-hidden="true">{azione}</i>
      </button>
    );
  };
  const statoSete = (v: number) => (v >= 9 ? "disidratato" : v >= 6 ? "assetato" : "a posto");
  const statoFame = (v: number) => (v >= 11 ? "sfinito" : v >= 7 ? "affamato" : "a posto");
  const statoVita = (v: number) => (v <= 3 ? "allo stremo" : v <= 6 ? "provato" : "in forze");

  // ── schermate di carico / errore ───────────────────────────────────
  if (fase !== "gioca") {
    return (
      <div className="vg" style={stile}>
        <div style={{ position: "absolute", inset: 0 }}><Panorama clima="z0" luogo={null} camminaDa={-1e9} /></div>
        <div className="vg-velo" />
        <div className="vg-carica">
          {fase === "carica" ? (
            <>
              <p className="vg-sopratitolo">{inDesktop() ? "il motore favella 1" : "il motore favella gira nel browser"}</p>
              <h2>Si prepara il viaggio…</h2>
              <p className="vg-carica-msg">{messaggio}</p>
              <div className="vg-carica-barra"><div /></div>
              <p className="vg-carica-nota">{carica ? `Si riprende il viaggio da «${nomeVisibile({ posto: carica.posto, dati: carica })}»…` : "Qualche secondo: si avvia l'interprete Python."}</p>
            </>
          ) : (
            <>
              <h2 style={{ color: "#fb923c" }}>Il motore non è partito</h2>
              <p className="vg-carica-msg">{messaggio}</p>
              <p className="vg-carica-nota">Se si ripete, il registro tecnico dice perché.</p>
              <button className="vg-bottone" onClick={onExit}>← torna all'intro</button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── la partita ─────────────────────────────────────────────────────
  return (
    <div className="vg" style={stile}>
      {/* PANORAMA */}
      <header className="vg-panorama" ref={panoramaRef}>
        <Panorama clima={clima} luogo={mondo.roomId} camminaDa={camminaDa} fermo={pausa} />
        <div className="vg-panorama-sfuma" />
        <div className="vg-testata">
          <span className="vg-marchio"><b>Il Viaggiatore</b> · {finita ? "fine del viaggio" : `tappa ${Math.max(1, zi + 1)} di 7`}</span>
          <div style={{ display: "flex", gap: 8 }}>
            {/* il tasto scritto accanto: F5 salva al volo (posto rapido), F9 lo ricarica */}
            <button className="vg-bottone vg-piccolo" onClick={() => setTaccuino("salva")} disabled={finita}
              aria-label="Salva la partita nel taccuino (F5: salvataggio rapido)">salva <span className="vg-tasto" aria-hidden="true">F5</span></button>
            <button className="vg-bottone vg-piccolo" onClick={() => setTaccuino("carica")}
              aria-label="Carica una partita dal taccuino (F9: il salvataggio rapido)">carica <span className="vg-tasto" aria-hidden="true">F9</span></button>
            <button className="vg-bottone vg-piccolo" onClick={() => setPausa(true)}
              aria-label="Pausa: le opzioni, la guida, il menu d'avvio, l'uscita (Esc)">☰ pausa <span className="vg-tasto" aria-hidden="true">Esc</span></button>
          </div>
        </div>
        <div className="vg-luogo">
          <p className="vg-sopratitolo">{finita ? (esito === "vinta" ? "a casa" : "il viaggio finisce qui") : tema.nome}</p>
          <h1>{finita ? "Acquamorta" : mondo.room ?? "—"}</h1>
        </div>
      </header>

      <div className="vg-pagina">
        {/* DIARIO */}
        <main className="vg-diario-col">
          <div ref={diarioRef} className="vg-diario gv-scroll" role="log" aria-live={recitata ? "off" : "polite"} aria-relevant="additions" aria-label="Diario del viaggio">
            <div className="vg-colonna">
              {voci.map((v, i) => (
                <section key={v.id} className={"vg-voce" + (i < ultima ? " vg-passata" : "")}>
                  {v.cmd && <p className="vg-comando"><span>›</span> {v.cmd}</p>}
                  {v.blocchi.map((b, j) => blocco(b, `${v.id}-${j}`, i === ultima))}
                </section>
              ))}
              {finita && (
                <section className="vg-finale">
                  <p className="vg-sopratitolo">{esito === "vinta" ? "finale" : "fine"}</p>
                  <p className="vg-finale-testo">{finale || (esito === "vinta" ? "Sei arrivato." : "Il viaggio finisce qui.")}</p>
                  {/* niente pulsanti: finita la lettura si va avanti da soli (la sequenza finale, o il menu d'avvio) */}
                  <button className="vg-finale-avanti" onClick={continua}>Invio · continua</button>
                </section>
              )}
            </div>
          </div>

          {!finita && (
            <div className="vg-comandi" ref={comandiRef}>
              {mondo.dialog && mondo.dialog.opzioni.length > 0 && (
                <div className={"vg-risposte" + (conPulsanti ? " vg-risposte-plancia" : "")}>
                  <p className="vg-sopratitolo">rispondi a {mondo.dialog.chi}</p>
                  <div className="vg-risposte-lista">
                    {mondo.dialog.opzioni.map((o, i) => conPulsanti ? (
                      // il narratore la legge quando ci si ferma sopra o la si raggiunge da tastiera, mai sopra chi sta parlando
                      <button key={i} className="vg-risposta" data-fuoco={i === 0 ? "" : undefined} onClick={() => manda(String(i + 1), o)}
                        onMouseEnter={() => sopraScelta(o)} onMouseMove={() => sopraScelta(o)} onMouseLeave={viaDallaScelta}
                        onFocus={() => { if (!fuocoDaCodice.current) diciScelta(o); }}>
                        <span className="vg-num">{i + 1}</span><span>{o}</span>
                      </button>
                    ) : (
                      // nell'avventura testuale la risposta si sceglie scrivendo il suo numero
                      <p key={i} className="vg-risposta vg-risposta-scritta"><span className="vg-num">{i + 1}</span><span>{o}</span></p>
                    ))}
                  </div>
                </div>
              )}

              {conPulsanti && mondo.conferma && (
                <div className="vg-azioni">
                  <span className="vg-etichetta">{mondo.conferma === "esci" ? "chiudere la partita?" : "ricominciare da capo?"}</span>
                  <button className="vg-chip vg-pieno" onClick={() => manda("sì", "sì")}>sì</button>
                  <button className="vg-chip" data-fuoco="" onClick={() => manda("no", "no")}>no</button>
                </div>
              )}

              {conRiga && (
                <div className="vg-input">
                  <span className="vg-prompt">›</span>
                  <input ref={inputRef} value={bozza} onChange={(e) => setBozza(e.target.value)} onKeyDown={tasto}
                    spellCheck={false} autoCapitalize="off" autoCorrect="off" autoComplete="off"
                    aria-label="Scrivi un comando"
                    placeholder={mondo.dialog ? "scrivi il numero della risposta (1, 2…)" : "Cosa fai? Scrivi un comando e premi Invio…"} />
                  <button className="vg-invia" onClick={() => scritto(bozza)} disabled={!bozza.trim()} aria-label="Invia">invio ↵</button>
                </div>
              )}

              {/* la plancia: andare (rosa dei venti), qui, fare, e la riga di servizio; nei dialoghi la sostituiscono le risposte */}
              {conPulsanti && !mondo.dialog && (
                <Plancia mondo={mondo} azioni={azioniCtx} aperta={menu?.tipo === "qui" ? menu.id : usaDa?.tipo === "qui" ? usaDa.id : null}
                  pannello={pannello} puoAnnullare={puoAnnullare} conMappa={haMappa && !!carta} onManda={(cmd) => manda(cmd)} onCosa={apriCosa}
                  onPannello={apriPannello} onAnnulla={annulla} onMappa={apriMappa} />
              )}
            </div>
          )}
        </main>

        {/* IL CORPO, LE SCORTE, LA BISACCIA */}
        <aside className="vg-lato gv-scroll">
          <p className="vg-sezione">il corpo</p>
          {metro("Vita", num("vita"), 10, [6, 3], statoVita(num("vita")), true)}
          {metro("Sete", num("sete"), 13, [6, 9], statoSete(num("sete")))}
          {metro("Fame", num("fame"), 15, [7, 11], statoFame(num("fame")))}

          <p className="vg-sezione">scorte</p>
          <div className="vg-scorte">
            {scorta("bere", `Acqua: ${num("acqua")} su ${capienzaAcqua}`, "bevi",
              <path d="M12 3 C8 9 6 12 6 15 A6 6 0 0 0 18 15 C18 12 16 9 12 3 Z" />, num("acqua"), `acqua /${capienzaAcqua}`)}
            {scorta("mangiare", `Cibo: ${num("cibo")}`, "mangia",
              <path d="M4 13 C4 8 8 6 12 6 C16 6 20 8 20 13 V17 H4 Z M8 9 L9 12 M12 8 V12 M16 9 L15 12" />, num("cibo"), "cibo")}
          </div>

          <p className="vg-sezione">bisaccia <span>{mondo.inventory.length}/{capienza}</span></p>
          <ul className="vg-zaino">
            {Array.from({ length: Math.max(capienza, mondo.inventory.length) }, (_, i) => {
              const o = mondo.inventory[i];
              if (!o) return <li key={i} className="vg-vuoto" aria-hidden="true" />;
              const id = senzaArticolo(o);
              const attivo = (menu?.tipo === "zaino" && menu.id === id) || (usaDa?.tipo === "zaino" && usaDa.id === id);
              return (
                <li key={i}>
                  {conPulsanti ? (
                    <button className={"vg-oggetto" + (attivo ? " vg-attivo" : "")} disabled={finita} aria-expanded={attivo}
                      onClick={(e) => apriCosa({ tipo: "zaino", id, nome: o }, e.currentTarget)}>{o}</button>
                  ) : <span className="vg-oggetto vg-informa">{o}</span>}
                </li>
              );
            })}
          </ul>

          {fiducie.length > 0 && (<>
            <p className="vg-sezione">chi hai incontrato</p>
            <ul className="vg-fiducie">
              {fiducie.map((f) => (
                <li key={f.n}>
                  <span>{f.n}</span>
                  {f.v !== null && <span className="vg-pip" role="img" aria-label={`fiducia ${f.v} su 5`}>{[1, 2, 3, 4, 5].map((i) => <i key={i} className={i <= f.v! ? "on" : ""} />)}</span>}
                  {righeGesti(f.n).length > 0 && <small className="vg-gesti">{righeGesti(f.n).join(" · ")}</small>}
                </li>
              ))}
            </ul>
          </>)}

          {(mondo.voci ?? []).length > 0 && (<>
            <p className="vg-sezione">si dice di te</p>
            <ul className="vg-voci">
              {Object.keys(VOCI).filter((k) => (mondo.voci ?? []).includes(k)).map((k) => <li key={k}>{VOCI[k]}</li>)}
            </ul>
          </>)}

          <p className="vg-sezione">il cammino</p>
          <div className="vg-cammino">
            {ZORDER.map((zk, i) => (
              <span key={zk} className={i < zi ? "fatto" : i === zi ? "ora" : ""} style={{ ["--z" as string]: ZONE_THEME[zk].accent } as React.CSSProperties} />
            ))}
          </div>
          <p className="vg-cammino-nome">{zi >= 0 ? ZONE_THEME[zona].nome : "—"}</p>
        </aside>
      </div>

      {/* LA TENDINA: accanto a ciò che si è toccato, il suo menu, «usa su…» o le dosi */}
      {conPulsanti && !finita && (menu || usaDa || pannello) && (
        <Tendina ancora={ancora} fuoco={!conRiga} onChiudi={chiudiTendina}
          chiave={pannello ? `p:${pannello}` : usaDa ? `u:${usaDa.tipo}:${usaDa.id}` : `m:${menu!.tipo}:${menu!.id}`}
          etichetta={pannello ? (pannello === "bere" ? "Vuoi bere?" : "Vuoi mangiare?") : usaDa ? titoloUsa(usaDa) : menu!.nome}>
          {pannello ? (
            <PannelloScorta tipo={pannello} mondo={mondo} anteprima={anteprima} onScegli={(cmd) => manda(cmd)} onChiudi={chiudiTendina} />
          ) : usaDa ? (<>
            <div className="vg-tendina-testa">
              <button className="vg-tendina-tasto" onClick={() => { const da = usaDa; setUsaDa(null); setMenu(da); }} aria-label="Indietro">‹</button>
              <span>{titoloUsa(usaDa)}</span>
              <button className="vg-tendina-tasto" onClick={chiudiTendina} aria-label="Chiudi">✕</button>
            </div>
            <div className="vg-tendina-voci">
              {bersagliDelUso(usaDa, mondo).map((b) => (
                <button key={b.cmd} className="vg-tendina-voce" onClick={() => manda(b.cmd)}>{b.etichetta}</button>
              ))}
            </div>
          </>) : menu ? (<>
            <div className="vg-tendina-testa">
              <span>{menu.nome}</span>
              <button className="vg-tendina-tasto" onClick={chiudiTendina} aria-label="Chiudi">✕</button>
            </div>
            <div className="vg-tendina-voci">
              {vociDelMenu(menu, mondo, azioniCtx).map((v) => (
                <button key={v.etichetta} className={"vg-tendina-voce" + (v.pieno ? " vg-tendina-prima" : "")}
                  onClick={() => {
                    if (v.pannello === "usa") { setUsaDa(menu); setMenu(null); }
                    else if (v.pannello) { setMenu(null); setPannello(v.pannello); }   // la tanica: le dosi, accanto alla tanica
                    else if (v.cmd) manda(v.cmd);
                  }}>
                  {v.etichetta}
                </button>
              ))}
            </div>
          </>) : null}
        </Tendina>
      )}

      {recitata && (
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          <p key={annuncio.n}>{annuncio.testo}</p>
        </div>
      )}
      {pausa && (
        <Pausa accento={accento} coperta={pannelloOpzioni || guida || !!taccuino || paginaTrofei || paginaMappa} puoSalvare={!finita}
          onTrofei={() => setPaginaTrofei(true)}
          onRiprendi={() => setPausa(false)}
          onSalva={() => setTaccuino("salva")}
          onCarica={() => setTaccuino("carica")}
          onOpzioni={() => setPannelloOpzioni(true)}
          onGuida={() => setGuida(true)}
          onMenu={esci}
          onEsci={inDesktop() ? chiudiGioco : undefined} />
      )}
      {/* aperti dalla pausa le stanno sopra; chiudendoli il fuoco torna dove era (alla pausa, o alla riga) */}
      {pannelloOpzioni && (
        <PannelloOpzioni base={13} accento={accento}
          onRiascolta={() => { setPannelloOpzioni(false); setPausa(false); voce.riascolta(); }}
          onChiudi={() => { setPannelloOpzioni(false); if (!pausa) rimettiFuoco(); }} />
      )}
      {guida && <ComeSiGioca base={13} accento={accento} onChiudi={() => { setGuida(false); if (!pausa) rimettiFuoco(); }} />}
      {taccuino && (
        <Taccuino base={13} modo={taccuino} accento={accento} puoSalvare={!finita} avvisaPerdita={nonSalvati > 0 && !finita}
          istantanea={() => ({ riassunto: riassunto(mondo), miniatura: miniatura(), tempoMs: tempo.current })}
          onSalva={salvaIn}
          onCarica={(d) => { setTaccuino(null); setPausa(false); riprendi(d); }}
          onChiudi={() => { setTaccuino(null); if (!pausa) rimettiFuoco(); }} />
      )}
      {rapidoDaCaricare && (
        <Domanda base={13} accento={accento} domanda="Caricare il salvataggio rapido?"
          sotto={`${rapidoDaCaricare.riassunto.luogo}, salvato il ${dataLeggibile(rapidoDaCaricare.creato)}. Quello che hai fatto dopo l'ultimo salvataggio andrà perso.`}
          si="sì, carica" no="no"
          onSi={() => { const d = rapidoDaCaricare; setRapidoDaCaricare(null); riprendi(d); }}
          onNo={() => setRapidoDaCaricare(null)} />
      )}
      {paginaTrofei && <PaginaTrofei base={13} accento={accento} onChiudi={() => { setPaginaTrofei(false); if (!pausa && !finita) rimettiFuoco(); }} />}
      {paginaMappa && carta && (
        <Mappa base={13} accento={accento} carta={carta} visitate={mondo.visitate ?? []} qui={mondo.roomId}
          onChiudi={() => { setPaginaMappa(false); if (!pausa && !finita) rimettiFuoco(); }} />
      )}
      {/* a viaggio finito un trofeo non sta sopra il finale */}
      <Cartiglio dati={finita && cartiglio?.trofeo ? null : cartiglio} accento={accento} />
      {richiesta && (
        <Conferma conferma={richiesta.conferma} etichetta={richiesta.etichetta} puoAnnullare={richiesta.annullabile}
          onSi={confermaSi} onNo={confermaNo} />
      )}
    </div>
  );
};

export default ViaggiatorePlayer;
