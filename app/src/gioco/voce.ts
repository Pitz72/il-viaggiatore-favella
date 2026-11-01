// ====================================================================
//  La voce del gioco: il doppiaggio, parte per parte.
// --------------------------------------------------------------------
//  Un file Opus per parte (public/voce/<id>.opus, scritto da
//  strumenti/doppiaggio-banco.py) e un indice con la durata e il testo di
//  ciascuna. Le parti di un turno suonano in fila, con una pausa breve fra le
//  frasi della stessa riga e una più lunga fra una riga e l'altra; al primo
//  tasto la fila si svuota (come in un talkie: il testo resta sullo schermo).
//  Le cartelle che l'indice nomina («cartelle»: public/voce/elevenlabs/, le voci
//  escluse dalla licenza libera) hanno un indice loro e si aggiungono.
//
//  La voce inglese (public/voce/en/, strumenti/doppiaggio-banco.py --lingua en) è
//  il narratore, la voce di servizio (Kira: suggerimenti e numeri delle
//  scorte) e tutti i quattordici personaggi (public/voce/en/elevenlabs/,
//  con l'indice e la licenza loro). Il diario resta in italiano e le parti si ritrovano
//  dal testo italiano (parti.ts): l'indice inglese dice, per ogni parte italiana di
//  queste voci, la sua registrazione inglese. Col modo «inglese» una parte che ha la
//  registrazione inglese suona quella; una parte senza
//  registrazione inglese (nessuna, oggi) suona in italiano.
//
//  Le risposte di dialogo si leggono in ANTEPRIMA (quando ci si ferma sopra):
//  un'anteprima non interrompe mai il turno che parla (il personaggio che
//  risponde, il narratore), ne prende il posto solo un'altra anteprima, e F2
//  ridice il turno, non l'anteprima.
//
//  Due modi, mai insieme: «recitata» (la voce del doppiaggio; il diario non
//  annuncia) o «lettore» (nessuna voce: il lettore di schermo legge il diario).
//  Il modo e il volume sono opzioni (lib/opzioni.ts); il volume lo applica il
//  bus sonoro (lib/suono.ts, canale «voce»).
// ====================================================================
import { tabella, type Tabella, type Testi } from "./parti";
import { canale } from "../lib/suono";
import { opzioni } from "../lib/opzioni";

const BASE = `${import.meta.env.BASE_URL}voce/`;
/** secondi di silenzio fra due frasi della stessa riga, e fra due righe */
export const PAUSA_FRASE = 0.3;
export const PAUSA_RIGA = 0.55;
const MEMORIA = 120;   // parti decodificate tenute in memoria

interface Indice {
  estensione: string; parti: Record<string, number>; testi?: Testi; cartelle?: string[];
  /** solo nell'indice inglese: id della parte italiana (narratore, Kira, i quattordici personaggi) → id della sua registrazione inglese */
  corrispondenze?: Record<string, string>;
}

/** Una parte da dire, con la pausa che la precede. */
export interface Parte { id: string; pausa: number }

class Voce {
  private ctx: AudioContext | null = null;
  private uscita: GainNode | null = null;
  private dove = new Map<string, string>();          // id → URL del file
  private inglese = new Map<string, string>();       // id della parte italiana (narratore, Kira, i quattordici personaggi) → URL della registrazione inglese
  private testi: Testi = {};
  private buffer = new Map<string, Promise<AudioBuffer | null>>();
  private suonano: AudioBufferSourceNode[] = [];
  private giro = 0;                                    // cresce a ogni fila nuova: le vecchie si fermano
  private ultima: Parte[] = [];
  private pronta: Promise<Tabella | null> | null = null;
  private quandoParla = new Set<(parla: boolean) => void>();
  private inAnteprima = false;                         // ciò che suona è un'anteprima, non un turno
  parla = false;

  /** Carica gli indici (una volta sola); null se la voce non c'è. */
  prepara(): Promise<Tabella | null> {
    if (!this.pronta) {
      this.pronta = (async () => {
        try {
          const principale = await this.leggiIndice(`${BASE}indice.json`);
          if (!principale) return null;
          for (const id of Object.keys(principale.parti)) this.dove.set(id, `${BASE}${id}${principale.estensione}`);
          for (const c of principale.cartelle ?? []) {
            const altro = await this.leggiIndice(`${BASE}${c}/indice.json`);
            for (const id of Object.keys(altro?.parti ?? {})) this.dove.set(id, `${BASE}${c}/${id}${altro!.estensione}`);
          }
          // la voce inglese, se il pacchetto la contiene (senza, il modo «inglese» suona le voci italiane)
          // (e, come l'italiano, le cartelle a parte che il suo indice nomina: en/elevenlabs/, le voci escluse dalla licenza libera)
          const en = await this.leggiIndice(`${BASE}en/indice.json`);
          const doveEn = new Map<string, string>();   // id inglese → URL del file
          for (const id of Object.keys(en?.parti ?? {})) doveEn.set(id, `${BASE}en/${id}${en!.estensione}`);
          for (const c of en?.cartelle ?? []) {
            const altro = await this.leggiIndice(`${BASE}en/${c}/indice.json`);
            for (const id of Object.keys(altro?.parti ?? {})) doveEn.set(id, `${BASE}en/${c}/${id}${altro!.estensione}`);
          }
          for (const [it, e] of Object.entries(en?.corrispondenze ?? {})) {
            const url = doveEn.get(e);
            if (url) this.inglese.set(it, url);
          }
          this.testi = principale.testi ?? {};
          return tabella(this.testi);
        } catch {
          return null;
        }
      })();
    }
    return this.pronta;
  }

  private async leggiIndice(url: string): Promise<Indice | null> {
    try {
      const r = await fetch(url);
      if (!r.ok) return null;
      const testo = await r.text();
      return testo.trimStart().startsWith("{") ? (JSON.parse(testo) as Indice) : null;   // un fallback HTML non è un indice
    } catch {
      return null;
    }
  }

  /** Il file da suonare per una parte (l'id è quello della parte italiana): la registrazione inglese se il modo è «inglese» e
   *  c'è, se no quella italiana. */
  private url(id: string): string | undefined {
    return (opzioni().voce === "inglese" ? this.inglese.get(id) : undefined) ?? this.dove.get(id);
  }

  /** C'è il file di questa parte? (Le parti mute, o solo locali e assenti, non ce l'hanno.) */
  ha(id: string) { return this.url(id) !== undefined; }

  /** Il testo di una parte, per chi la legge invece della voce. */
  testoDi(id: string) { return this.testi[id]?.[1] ?? ""; }

  ascolta(f: (parla: boolean) => void) { this.quandoParla.add(f); return () => { this.quandoParla.delete(f); }; }

  private segna(parla: boolean) {
    if (!parla) this.inAnteprima = false;
    if (this.parla === parla) return;
    this.parla = parla;
    for (const f of this.quandoParla) f(parla);
  }

  private contesto(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.uscita = canale(this.ctx, "voce");
    }
    if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
    return this.ctx;
  }

  private carica(id: string): Promise<AudioBuffer | null> {
    const url = this.url(id);
    const chiave = url ?? id;   // si ricorda per file, non per parte: cambiando voce a partita in corso non si suona quella di prima
    let p = this.buffer.get(chiave);
    if (!p) {
      const ctx = this.contesto();
      p = url
        ? fetch(url).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
          .then((dati) => ctx.decodeAudioData(dati)).catch(() => null)
        : Promise.resolve(null);
      this.buffer.set(chiave, p);
      if (this.buffer.size > MEMORIA) this.buffer.delete(this.buffer.keys().next().value!);
    }
    return p;
  }

  /** Dice le parti di un turno in fila, dopo aver zittito ciò che suonava. */
  dici(parti: Parte[]) { this.suona(parti, false); }

  /** Una risposta di dialogo letta prima di sceglierla: se un turno sta parlando non si dice (false). */
  anteprima(parti: Parte[]): boolean {
    if (this.parla && !this.inAnteprima) return false;
    this.suona(parti, true);
    return true;
  }

  private suona(parti: Parte[], anteprima: boolean) {
    this.ferma();
    const fila = parti.filter((p) => this.ha(p.id));
    if (!fila.length) return;
    if (!anteprima) this.ultima = fila;
    this.inAnteprima = anteprima;
    const giro = ++this.giro;
    const ctx = this.contesto();
    for (const p of fila) this.carica(p.id);   // tutte insieme: sono piccole
    this.segna(true);
    (async () => {
      let fine = ctx.currentTime;
      for (const [k, p] of fila.entries()) {
        const buf = await this.carica(p.id);
        if (giro !== this.giro) return;
        if (!buf) continue;
        const inizio = Math.max(ctx.currentTime + 0.02, k === 0 ? fine : fine + p.pausa);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(this.uscita!);
        src.start(inizio);
        this.suonano.push(src);
        fine = inizio + buf.duration;
      }
      const ultima = this.suonano[this.suonano.length - 1];
      if (!ultima) { if (giro === this.giro) this.segna(false); return; }
      ultima.onended = () => { if (giro === this.giro) { this.suonano = []; this.segna(false); } };
    })();
  }

  /** Zittisce subito e svuota la fila. */
  ferma() {
    this.giro++;
    for (const s of this.suonano) { s.onended = null; try { s.stop(); } catch { /* non ancora partita */ } }
    this.suonano = [];
    this.segna(false);
  }

  /** Ridice l'ultima fila. */
  riascolta() { if (this.ultima.length) this.dici(this.ultima); }
}

/** Una sola voce per tutto il gioco. */
export const voce = new Voce();
