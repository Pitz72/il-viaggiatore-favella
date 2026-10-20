// ====================================================================
//  Il suono del trailer reso OFFLINE: musica, rumori e voce, come nell'app.
// --------------------------------------------------------------------
//  Lo usano strumenti/trailer-rumori.cjs (un tratto, per ascoltare un prima e
//  un dopo) e strumenti/esporta-trailer.cjs (tutto il trailer, per i video).
//  In una finestra Electron già aperta sul server di sviluppo carica la colonna
//  sonora vera (app/src/trailer/audio.ts) su un OfflineAudioContext, ci mette
//  intro.mp3 dal punto `da`, fa suonare i rumori di scaletta.ts del tratto col
//  livello che hanno col brano (0,55) e, con `voce`, la voce di Enzo
//  (public/voce/trailer.opus) con la musica che le scende sotto. Passa dal master
//  e dal compressore come nell'app. Non c'è la latenza d'uscita: quella si sente
//  solo sulla macchina vera.
// ====================================================================
const fs = require("node:fs");
const path = require("node:path");

const MP3_BASE64 = fs.readFileSync(path.join(__dirname, "..", "app", "src", "assets", "intro.mp3")).toString("base64");

/** {sr, canali: [Int16Array sinistro, destro], eventi, frasi} del tratto [da, a] del trailer. */
async function mixOffline(win, da, a, { voce = true } = {}) {
  const js = (s) => win.webContents.executeJavaScript(s);
  const r = await js(`(async () => { try {
    const A = await import('/src/trailer/audio.ts');
    const S = await import('/src/trailer/scaletta.ts');
    const sr = 44100, durata = ${a - da};
    const off = new OfflineAudioContext(2, Math.ceil(sr * durata), sr);
    let cursore = 0;
    Object.defineProperty(off, 'currentTime', { get: () => cursore });      // il «ora» di suona() lo decidiamo noi
    const Originale = window.AudioContext;
    window.AudioContext = function () { return off; };
    const c = new A.ColonnaSonora(undefined, ${voce ? "{ traccia: 'voce/trailer.opus', scaletta: 'voce/trailer.json', volume: 1 }" : "undefined"});
    c.costruisci();
    window.AudioContext = Originale;
    await c.voceCaricata;
    c.master.gain.value = 0.9; c.vento.gain.value = 0; c.bordone.gain.value = 0; c.gTerza.gain.value = 0;
    const musica = off.createBufferSource();
    const bytes = Uint8Array.from(atob(${JSON.stringify(MP3_BASE64)}), (c) => c.charCodeAt(0)).buffer;     // il brano si legge da disco
    musica.buffer = await off.decodeAudioData(bytes);
    musica.connect(c.gBrano); musica.start(0, ${da}, durata);
    const frasi = c.programmaVoceOffline(${da}, ${a});
    let n = 0;
    for (const e of S.EVENTI) {
      if (e.t < ${da} || e.t >= ${a} || e.tipo === 'rintocco' || e.tipo === 'tonfo') continue;
      cursore = e.t - ${da}; c.suona(e.tipo, (e.vol ?? 1) * 0.55, e); n++;
    }
    cursore = 0;
    const reso = await off.startRendering();
    // PCM a 16 bit, i due canali alternati, in base64: passare milioni di numeri uno per uno sarebbe lentissimo
    const L = reso.getChannelData(0), R = reso.getChannelData(1), pcm = new Int16Array(L.length * 2);
    for (let i = 0; i < L.length; i++) {
      pcm[2 * i] = Math.max(-32768, Math.min(32767, Math.round(L[i] * 32767)));
      pcm[2 * i + 1] = Math.max(-32768, Math.min(32767, Math.round(R[i] * 32767)));
    }
    const u8 = new Uint8Array(pcm.buffer);
    let bin = '';
    for (let i = 0; i < u8.length; i += 0x8000) bin += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
    return { sr, eventi: n, frasi, pcm: btoa(bin) };
  } catch (e) { return { errore: String((e && e.message) || e) + ' | ' + String((e && e.stack) || '').slice(0, 400) }; } })()`);
  if (r.errore) throw new Error(r.errore);
  return { sr: r.sr, eventi: r.eventi, frasi: r.frasi, pcm: Buffer.from(r.pcm, "base64") };
}

/** Un WAV stereo a 16 bit dal PCM alternato. */
function wav(pcm, sr) {
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + pcm.length, 4); h.write("WAVEfmt ", 8); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20);
  h.writeUInt16LE(2, 22); h.writeUInt32LE(sr, 24); h.writeUInt32LE(sr * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(16, 34);
  h.write("data", 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

module.exports = { mixOffline, wav };
