# Gemini 3.8 Flash TTS: la documentazione, verificata il 31 ottobre 2026

> Ricerca fatta per la voce recitata inglese. Le pagine sono quelle ufficiali di Google (versioni `.md.txt` di `ai.google.dev`:
> la pagina normale non si lascia aprire dallo strumento di lettura). Sono documenti **dell'API**, non dell'interfaccia di AI
> Studio: come funziona l'editor lo sappiamo dagli schermi di Simone del 20 ottobre (diario «Il doppiaggio: lo strumento dei
> blocchi e il pilota su Z1»). La vecchia nota di memoria con i dettagli del 20 ottobre è andata persa col computer di prima:
> questo file la sostituisce.

## Il modello

- **`gemini-3.8-flash-tts`**, la voce «creativa» di punta; accanto c'è `gemini-3.8-flash-lite-tts` (più veloce ed economico, 100 e più
  lingue). Il registro delle novità dice **22 settembre 2026, «GA»** per entrambi (il diario del 20 ottobre scriveva il 23: un
  giorno di differenza, vale la fonte). La pagina del modello non dice lo stato.
- **Limiti**: ingresso **8.192 token**, uscita **16.384 token** («limite di servizio dell'API»). Le pagine **non dicono una durata
  massima**: i circa **11 minuti** per richiesta vengono dal conto di prima (16.384 token a 25 al secondo, 10,9 minuti), che qui
  non si è ritrovato scritto; l'esperienza dell'italiano lo conferma. Un blocco inglese da 9,5 minuti ha circa 1.300 parole, cioè
  poche migliaia di token di ingresso: lontano dagli 8.192.
- **Lingue**: più di 130, riconosce da sé la lingua del testo; accenti regionali e dialetti minori. «Tiene identità, timbro e
  volume della voce nei dialoghi lunghi e nelle narrazioni di più minuti.»
- Uscita **WAV** con intestazione (le versioni prima davano PCM senza intestazione).

## Come si scrive

- Il **testo è una trascrizione letterale**: tutto ciò che c'è viene letto. Le istruzioni di recitazione non vanno nel testo
  («Say cheerfully:» sarebbe letto ad alta voce) ma nello **stile** (`speech_metadata.style` nell'API; il campo di stile
  dell'editor).
- **Tag dentro il testo, fra parentesi angolari e in inglese anche per un testo non inglese**: `<short pause>`, `<long pause>`,
  `<laugh>`, `<sigh>`, `<cough>`, `<breath>`, `<gasp>`, `<whispers>`, `<throat-clearing>`, `<yawn>`. Niente tag fra parentesi quadre.
  Da evitare gli effetti sonori (applausi). Puntini e trattini lunghi danno esitazione naturale.
- **MAIUSCOLO = enfasi** sulla parola.
- **Al massimo due voci** per richiesta con le voci di libreria; per unire voci personalizzate si fa una richiesta per turno e si
  incollano gli audio.
- Le **battute di rimando** si mettono fra barre verticali: `|oh really?|`.

## La voce e lo stile: le raccomandazioni che contano

- Lo **stile** è per l'emozione del momento («whispered urgently», «speaking slowly»), **corto e sempre lo stesso**. Età, sesso,
  nomi e accento permanente **non** vanno nello stile.
- **I lunghi «Audio Profile» e «Director's Notes» sono, per Google, «la causa più comune» della voce che cambia** da una
  generazione all'altra. Niente meta-istruzioni del tipo «tieni il timbro costante»: più prompt, più deriva.
- **Voice design**: una voce personalizzata e persistente si crea da una descrizione di **una o due frasi** («A warm, thoughtful
  astronomer in his late 60s with a gentle British accent, speaking with quiet wonder»), con i tratti permanenti (età, sesso, timbro,
  grana, accento) nella voce e lo stile solo per la situazione. Dà un identificativo `voice_…` da riusare in ogni richiesta (200
  voci per progetto, un anno dall'ultimo uso) e un campione per l'ascolto; si prova anche nello studio di AI Studio
  (`aistudio.google.com/generate-speech`). Un esempio della pagina abbina l'accento britannico a `en-GB`.
- **Voci di libreria**: la libreria estesa ha più di 150 voci (preimpostate e personalizzate), filtrabili per lingua e accento
  (anche «British»). Le pagine non dicono se a una voce di libreria (Enzo, Kira…) si possa aggiungere una descrizione: nell'editor
  di AI Studio il campo accanto alla voce l'abbiamo usato così il 20 ottobre, ed è lì che Enzo e Kira sono rimasti coerenti.
- Le pagine **non parlano di testo troncato né di righe saltate**. La nostra esperienza (20 ottobre): Gemini salta ciò che prende per
  una ripetizione (due righe di Tore; una descrizione doppia di Enzo letta due volte).

## Che cosa cambia per il narratore inglese

1. **Il prompt della voce** è più corto di quello italiano (che ha sette frasi, il tipo che Google sconsiglia): due frasi, tratti
   permanenti dentro, nessun comando. Vedi `voci.md`.
2. `<long pause>` resta un tag valido: serve a tagliare l'audio dopo, come in italiano.
3. Il tetto per blocco resta circa 11 minuti: sei blocchi da circa 9,5 minuti (stimati) lasciano il 15% di margine; il ritmo
   dell'inglese è da misurare sul primo blocco vero.
4. **Se la voce cambia troppo fra i sei blocchi**, la strada che Google indica è Voice design: una voce `voice_…` creata una volta
   sola dalla stessa descrizione. Non la usiamo per partire (Simone ha scelto Enzo con la descrizione).

## Fonti

- <https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash-tts> (scheda del modello)
- <https://ai.google.dev/gemini-api/docs/speech-generation> (guida alla generazione del parlato)
- <https://ai.google.dev/gemini-api/docs/voice-design> (Voice design)
- <https://ai.google.dev/gemini-api/docs/changelog> (registro delle novità)
