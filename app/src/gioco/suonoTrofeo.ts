// ====================================================================
//  Il suono di un trofeo (piano 09, §7.1): «un lievissimo suono flautato».
// --------------------------------------------------------------------
//  Una nota sola, morbida, col fiato, sintetizzata come i suoni dei loghi:
//  un seno con due armoniche appena accennate (il flauto è quasi un seno),
//  un vibrato lento che entra dopo l'attacco, un soffio di rumore filtrato
//  attorno alla nota. Piano (−24 dB circa al picco) e sul canale degli
//  effetti del bus sonoro (lib/suono.ts): il volume degli effetti, quello
//  generale e il mono valgono anche qui. Un contesto solo, creato al primo
//  trofeo; se l'audio non può partire, il trofeo arriva in silenzio.
// ====================================================================
import { canale } from "../lib/suono";

const NOTA = 659.25;      // mi, nel registro medio del flauto
const DURATA = 1.9;
const PICCO = 0.065;

let ac: AudioContext | null = null;
let uscita: AudioNode | null = null;
let fiato: AudioBuffer | null = null;

export function suonaTrofeo() {
  try {
    ac ??= new AudioContext({ latencyHint: "interactive" });
    if (ac.state !== "running") ac.resume().catch(() => {});
    uscita ??= canale(ac, "effetti");
    if (!fiato) {
      fiato = ac.createBuffer(1, Math.ceil(ac.sampleRate * DURATA), ac.sampleRate);
      const d = fiato.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const t = ac.currentTime + 0.03;

    // un passabasso morbido su tutto: niente spigoli
    const morbido = ac.createBiquadFilter();
    morbido.type = "lowpass"; morbido.frequency.value = 2600; morbido.Q.value = 0.4;
    morbido.connect(uscita);

    // la nota: attacco lento come un soffio che prende, una tenuta breve, una coda che si spegne
    const nota = ac.createGain();
    nota.gain.setValueAtTime(0.0001, t);
    nota.gain.exponentialRampToValueAtTime(PICCO, t + 0.16);
    nota.gain.setTargetAtTime(PICCO * 0.72, t + 0.16, 0.3);
    nota.gain.setTargetAtTime(0.0001, t + 0.85, 0.3);
    nota.connect(morbido);
    // il vibrato: ±7 centesimi a 5 Hz, che entra dopo l'attacco
    const vib = ac.createOscillator();
    vib.frequency.value = 5;
    const quanto = ac.createGain();
    quanto.gain.setValueAtTime(0, t);
    quanto.gain.linearRampToValueAtTime(7, t + 0.55);
    vib.connect(quanto);
    for (const [armonica, livello] of [[1, 1], [2, 0.16], [3, 0.05]] as const) {
      const o = ac.createOscillator();
      o.type = "sine";
      o.frequency.value = NOTA * armonica;
      quanto.connect(o.detune);
      const g = ac.createGain();
      g.gain.value = livello;
      o.connect(g).connect(nota);
      o.start(t); o.stop(t + DURATA);
    }
    vib.start(t); vib.stop(t + DURATA);

    // il fiato: rumore stretto attorno alla nota, più presente all'attacco, poi un filo
    const s = ac.createBufferSource();
    s.buffer = fiato;
    const banda = ac.createBiquadFilter();
    banda.type = "bandpass"; banda.frequency.value = NOTA * 2; banda.Q.value = 1.4;
    const soffio = ac.createGain();
    soffio.gain.setValueAtTime(0.0001, t);
    soffio.gain.exponentialRampToValueAtTime(PICCO * 0.4, t + 0.05);
    soffio.gain.setTargetAtTime(PICCO * 0.08, t + 0.07, 0.08);
    soffio.gain.setTargetAtTime(0.0001, t + 0.8, 0.3);
    s.connect(banda).connect(soffio).connect(morbido);
    s.start(t); s.stop(t + DURATA);
  } catch {
    /* niente audio: il trofeo arriva lo stesso, in silenzio */
  }
}
