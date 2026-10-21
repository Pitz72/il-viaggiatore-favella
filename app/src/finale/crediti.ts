// ====================================================================
//  I titoli di coda: chi ha fatto il gioco, con che cosa, sotto quali licenze.
// --------------------------------------------------------------------
//  Fino alla 1.32 stavano in un cartello all'avvio, dopo i loghi (voluto da
//  Simone il 20/10/2026); dalla 1.33 scorrono alla fine della sequenza finale
//  (components/SequenzaFinale.tsx), e da Extra → Titoli di coda. Le righe sono
//  quelle del cartello, identiche: c'è l'attribuzione «elevenlabs.io» che le
//  voci ElevenLabs chiedono. I testi delle licenze per intero stanno nel
//  repository (LICENSE, LICENSE-CONTENUTI.md, README).
//  Niente React né import: lo prova app/scripts/finale-node.mjs.
// ====================================================================

/** [che cosa, chi o che licenza]. collaudo/testo.py non le controlla: sono dell'app. */
export const CREDITI: [string, string][] = [
  ["Il Viaggiatore", "un gioco di Simone Pizzi (Pitz72), 2026"],
  ["Storia, testi, musica dell'intro, grafica", "CC BY-SA 4.0"],
  ["Musiche delle zone", "The Runtimers · generate con Lyria 3.5 (Google) · fuori dalla licenza libera"],
  ["Voci", "doppiaggio con sintesi vocale Google Gemini TTS (CC BY-SA 4.0)"],
  ["Imma, Rosaria, Tore e Vito", "voci ElevenLabs · elevenlabs.io · solo uso non commerciale, fuori dalla licenza libera"],
  ["Codice", "MIT"],
  ["Motore", "FAVELLA 1 · MIT"],
  ["Componenti", "Pyodide (MPL-2.0) · Lark, React, Electron (MIT) · caratteri Inter, Lora, Sora, Source Code Pro, Covered By Your Grace, Atkinson Hyperlegible Next (SIL OFL 1.1)"],
  ["Marchi", "i loghi di Runtime Multimedia e di FAVELLA 1 sono dei rispettivi titolari"],
];

/** La canzone dei titoli di coda: compare fra i crediti solo quando il file c'è (public/musica/finale.opus).
 *  Il titolo è quello dell'album (strumenti/colonna-sonora.py, CANZONE): collaudo/musica.py li confronta. */
export const CANZONE: [string, string] = [
  "La canzone dei titoli di coda",
  "«La mano sa ancora la forma» · The Runtimers · musica e testo generati con Lyria 3.5 (Google) · fuori dalla licenza libera",
];

export const LICENZE = "I testi delle licenze: github.com/Pitz72/il-viaggiatore-favella";
export const GRAZIE = "Grazie per aver giocato.";

/** Le righe dei titoli, nell'ordine in cui scorrono. */
export const righeDeiTitoli = (conCanzone: boolean): [string, string][] =>
  conCanzone ? [...CREDITI.slice(0, 3), CANZONE, ...CREDITI.slice(3)] : [...CREDITI];
