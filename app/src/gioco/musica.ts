// ====================================================================
//  La musica delle zone (pre-produzione/10-musiche.md).
// --------------------------------------------------------------------
//  Un brano per zona (public/musica/, scritto da strumenti/colonna-sonora.py
//  dai sette brani di The Runtimers). La prima volta suona dall'inizio, poi
//  ripete in tondo il tratto [inizio, fine] dell'indice: la giuntura è già
//  incisa nel file, e il salto è al campione esatto (loopStart / loopEnd).
//
//  · Cambiando zona i due brani si danno il cambio in dissolvenza; tornando in
//    una zona il suo brano riprende dove era rimasto.
//  · Negli interni (gli stessi del panorama: Panorama.tsx, tipoInterno) la
//    musica si sente da dentro: più bassa e senza gli acuti.
//  · Quando il narratore parla la musica scende (−6 dB) e risale con calma
//    quando tace: la voce resta davanti.
//  · Sul canale «musica» del bus sonoro (lib/suono.ts): il volume della musica
//    nelle opzioni, il generale, il mono, il silenzio in secondo piano.
//  · Un brano decodificato pesa (tre minuti stereo sono decine di MB): in
//    memoria ci sono solo quello che suona e quello che sta sfumando.
// ====================================================================
import { canale } from "../lib/suono";
import { voce } from "./voce";

const BASE = `${import.meta.env.BASE_URL}musica/`;
/** il livello della musica in partita, sotto la voce (entrambe sono a −23 LUFS nei file): −8 dB */
const LIVELLO = 0.4;
/** quanto scende mentre il narratore parla, e quanto aspetta a risalire dopo */
const SOTTO_LA_VOCE = 0.5;
const SCENDE = 0.15, SALE = 0.9, ASPETTA_A_SALIRE = 0.8;
/** la dissolvenza fra due zone, e quella che spegne la musica (fine del viaggio, uscita) */
const DISSOLVENZA = 3.5;
const SPEGNI = 2.5;
/** gli interni: il taglio degli acuti e quanto scende, per tipo di luogo */
const DENTRO: Record<string, { taglio: number; livello: number }> = {
  stanza: { taglio: 1100, livello: 0.65 },
  grotta: { taglio: 900, livello: 0.6 },
  galleria: { taglio: 1000, livello: 0.6 },
  serra: { taglio: 3200, livello: 0.85 },
  torre: { taglio: 2400, livello: 0.8 },
};
const APERTO = { taglio: 20000, livello: 1 };

interface Brano { file: string; titolo: string; inizio: number; fine: number; durata: number }
interface Indice { formato: number; zone: Record<string, Brano> }
interface Suona { zona: string; src: AudioBufferSourceNode; gain: GainNode; partito: number; da: number; v: Brano }

class Musica {
  private ctx: AudioContext | null = null;
  private filtro: BiquadFilterNode | null = null;
  private dentro: GainNode | null = null;
  private sotto: GainNode | null = null;
  private indice: Promise<Indice | null> | null = null;
  private suona: Suona | null = null;
  private posti = new Map<string, number>();           // zona → dove era rimasto il suo brano (s)
  private giro = 0;                                     // cresce a ogni cambio: un caricamento vecchio non suona
  private risali: ReturnType<typeof setTimeout> | null = null;

  private leggiIndice(): Promise<Indice | null> {
    this.indice ??= fetch(`${BASE}indice.json`)
      .then((r) => (r.ok ? r.text() : null))
      .then((t) => (t && t.trimStart().startsWith("{") ? (JSON.parse(t) as Indice) : null))
      .catch(() => null);
    return this.indice;
  }

  private contesto(): AudioContext {
    if (!this.ctx) {
      const ctx = new AudioContext();
      this.filtro = ctx.createBiquadFilter();
      this.filtro.type = "lowpass";
      this.filtro.frequency.value = APERTO.taglio;
      this.filtro.Q.value = 0.5;
      this.dentro = ctx.createGain();
      this.sotto = ctx.createGain();
      const livello = ctx.createGain();
      livello.gain.value = LIVELLO;
      this.filtro.connect(this.dentro).connect(this.sotto).connect(livello).connect(canale(ctx, "musica"));
      this.ctx = ctx;
      // sotto la voce: scende subito, risale dopo un respiro (due frasi vicine restano sotto insieme)
      voce.ascolta((parla) => {
        if (!this.ctx || !this.sotto) return;
        if (this.risali) { clearTimeout(this.risali); this.risali = null; }
        const g = this.sotto.gain;
        if (parla) g.setTargetAtTime(SOTTO_LA_VOCE, this.ctx.currentTime, SCENDE);
        else this.risali = setTimeout(() => { if (this.ctx) g.setTargetAtTime(1, this.ctx.currentTime, SALE); }, ASPETTA_A_SALIRE * 1000);
      });
    }
    if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
    return this.ctx;
  }

  /** Dove si trova adesso il brano che suona (s, dentro il file). */
  private posizione(s: Suona): number {
    const t = s.da + (this.ctx!.currentTime - s.partito);
    const giro = s.v.fine - s.v.inizio;
    return t < s.v.fine ? t : s.v.inizio + ((t - s.v.inizio) % giro);
  }

  /** Spegne in dissolvenza il brano che suona, e si ricorda dov'era. */
  private lascia(secondi: number) {
    const s = this.suona;
    if (!s || !this.ctx) return;
    this.posti.set(s.zona, this.posizione(s));
    const ora = this.ctx.currentTime;
    s.gain.gain.cancelScheduledValues(ora);
    s.gain.gain.setValueAtTime(s.gain.gain.value, ora);
    s.gain.gain.linearRampToValueAtTime(0, ora + secondi);
    s.src.stop(ora + secondi + 0.05);
    s.src.onended = () => { s.src.disconnect(); s.gain.disconnect(); };
    this.suona = null;
  }

  /** La musica della zona di adesso; `interno` è il tipo di luogo chiuso (Panorama.tsx), o niente se si è all'aperto. */
  async vai(zona: string | null, interno?: string) {
    const ctx = this.contesto();
    // dentro o fuori: il filtro e il livello si muovono piano, come una porta che si chiude
    const d = (interno && DENTRO[interno]) || APERTO;
    this.filtro!.frequency.setTargetAtTime(d.taglio, ctx.currentTime, 0.35);
    this.dentro!.gain.setTargetAtTime(d.livello, ctx.currentTime, 0.35);
    if (zona === (this.suona?.zona ?? null)) return;
    const giro = ++this.giro;
    this.lascia(DISSOLVENZA);
    if (!zona) return;
    const indice = await this.leggiIndice();
    const v = indice?.zone[zona];
    if (!v || giro !== this.giro) return;
    let buf: AudioBuffer;
    try {
      const r = await fetch(`${BASE}${v.file}`);
      if (!r.ok) return;
      buf = await ctx.decodeAudioData(await r.arrayBuffer());
    } catch {
      return;   // niente musica per questa zona: il gioco va avanti in silenzio
    }
    if (giro !== this.giro) return;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    src.loopStart = v.inizio;
    src.loopEnd = Math.min(v.fine, buf.duration);
    const gain = ctx.createGain();
    src.connect(gain).connect(this.filtro!);
    const ora = ctx.currentTime;
    gain.gain.setValueAtTime(0, ora);
    gain.gain.linearRampToValueAtTime(1, ora + DISSOLVENZA);
    const da = Math.min(this.posti.get(zona) ?? 0, src.loopEnd - 0.05);
    src.start(ora, da);
    this.suona = { zona, src, gain, partito: ora, da, v };
  }

  /** Spegne la musica in dissolvenza (fine del viaggio, uscita dalla partita). */
  ferma(secondi = SPEGNI) {
    this.giro++;
    this.lascia(secondi);
  }

  /** Lascia la partita: la musica si spegne e le zone ricominceranno dall'inizio. */
  chiudi() {
    this.ferma(0.6);
    this.posti.clear();
  }

  /** Solo per il collaudo in sviluppo: che cosa suona e dove. */
  diagnosi() {
    const s = this.suona;
    return s && this.ctx
      ? { zona: s.zona, titolo: s.v.titolo, posizione: +this.posizione(s).toFixed(2), giro: [s.v.inizio, s.v.fine], stato: this.ctx.state,
          filtro: Math.round(this.filtro!.frequency.value), dentro: +this.dentro!.gain.value.toFixed(2), sotto: +this.sotto!.gain.value.toFixed(2) }
      : null;
  }
}

export const musica = new Musica();
