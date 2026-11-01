// ====================================================================
//  I titoli di coda: chi ha fatto il gioco, con che cosa, sotto quali licenze.
// --------------------------------------------------------------------
//  Fino alla 1.32 stavano in un cartello all'avvio, dopo i loghi (voluto da
//  Simone il 20/10/2026); dalla 1.33 scorrono alla fine della sequenza finale
//  (components/SequenzaFinale.tsx), e da Extra → Titoli di coda. Le righe sono
//  quelle del cartello, identiche: c'è l'attribuzione «elevenlabs.io» che le
//  voci ElevenLabs chiedono. I testi delle licenze per intero stanno nel
//  repository (LICENSE, LICENSE-CONTENUTI.md, README).
//  In inglese: ogni testo ha accanto la sua traduzione (…_EN), riga per riga
//  nello stesso ordine; la lingua la sceglie chi li mostra
//  (components/SequenzaFinale.tsx). Nomi, titoli, licenze e indirizzi restano.
//  Niente React né import: lo prova app/scripts/finale-node.mjs.
// ====================================================================

/** [che cosa, chi o che licenza]. collaudo/testo.py non le controlla: sono dell'app. */
export const CREDITI: [string, string][] = [
  ["Il Viaggiatore", "un gioco di Simone Pizzi (Pitz72), 2026"],
  ["Storia, testi, musica dell'intro, grafica", "CC BY-SA 4.0"],
  ["Musiche delle zone", "The Runtimers · generate con Lyria 3.5 (Google) · fuori dalla licenza libera"],
  ["Voci", "doppiaggio con sintesi vocale Google Gemini TTS (CC BY-SA 4.0)"],
  ["I personaggi (in italiano tutti tranne Concetta)", "voci ElevenLabs · elevenlabs.io · solo uso non commerciale, fuori dalla licenza libera"],
  ["Ritratti e oggetti", "illustrazioni generate con Nano Banana Pro 2.1 (Google) in Google Flow (CC BY-SA 4.0)"],
  ["Codice", "MIT"],
  ["Motore", "FAVELLA 1 · MIT"],
  ["Componenti", "Pyodide (MPL-2.0) · Lark, React, Electron (MIT) · caratteri Inter, Lora, Sora, Source Code Pro, Covered By Your Grace, Atkinson Hyperlegible Next (SIL OFL 1.1)"],
  ["Marchi", "i loghi di Runtime Multimedia e di FAVELLA 1 sono dei rispettivi titolari"],
];

/** Le stesse righe in inglese, nello stesso ordine. */
export const CREDITI_EN: [string, string][] = [
  ["Il Viaggiatore", "a game by Simone Pizzi (Pitz72), 2026"],
  ["Story, text, intro music, graphics", "CC BY-SA 4.0"],
  ["Zone music", "The Runtimers · generated with Lyria 3.5 (Google) · outside the free licence"],
  ["Voices", "voice acting with Google Gemini TTS speech synthesis (CC BY-SA 4.0)"],
  ["The characters (in Italian all except Concetta)", "ElevenLabs voices · elevenlabs.io · non-commercial use only, outside the free licence"],
  ["Portraits and objects", "illustrations generated with Nano Banana Pro 2.1 (Google) in Google Flow (CC BY-SA 4.0)"],
  ["Code", "MIT"],
  ["Engine", "FAVELLA 1 · MIT"],
  ["Components", "Pyodide (MPL-2.0) · Lark, React, Electron (MIT) · typefaces Inter, Lora, Sora, Source Code Pro, Covered By Your Grace, Atkinson Hyperlegible Next (SIL OFL 1.1)"],
  ["Trademarks", "the Runtime Multimedia and FAVELLA 1 logos belong to their respective owners"],
];

/** La canzone dei titoli di coda: compare fra i crediti solo quando il file c'è (public/musica/finale.opus).
 *  Il titolo è quello dell'album (strumenti/colonna-sonora.py, CANZONE): collaudo/musica.py li confronta. */
export const CANZONE: [string, string] = [
  "La canzone dei titoli di coda",
  "«La mano sa ancora la forma» · The Runtimers · musica e testo generati con Lyria 3.5 (Google) · fuori dalla licenza libera",
];

export const CANZONE_EN: [string, string] = [
  "The closing credits song",
  "“La mano sa ancora la forma” · The Runtimers · music and lyrics generated with Lyria 3.5 (Google) · outside the free licence",
];

export const LICENZE = "I testi delle licenze: github.com/Pitz72/il-viaggiatore-favella";
export const GRAZIE = "Grazie per aver giocato.";
export const LICENZE_EN = "The licence texts: github.com/Pitz72/il-viaggiatore-favella";
export const GRAZIE_EN = "Thank you for playing.";

/** Le righe dei titoli, nell'ordine in cui scorrono (in inglese, con `inglese`). */
export const righeDeiTitoli = (conCanzone: boolean, inglese = false): [string, string][] => {
  const righe = inglese ? CREDITI_EN : CREDITI, canzone = inglese ? CANZONE_EN : CANZONE;
  return conCanzone ? [...righe.slice(0, 3), canzone, ...righe.slice(3)] : [...righe];
};
