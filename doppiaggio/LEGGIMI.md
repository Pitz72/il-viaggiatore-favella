# Il doppiaggio

Il gioco si doppia con Gemini 3.8 Flash TTS (`gemini-3.8-flash-tts`) da Google AI Studio,
a mano, a blocchi. I testi si ricavano dai `.fav` con `strumenti/doppiaggio.py`, non si
scrivono a mano: se un testo cambia, si rigenera il blocco.

| Cartella | Contenuto | Nel repository |
|---|---|---|
| `blocchi/` | il testo da incollare in AI Studio, un file per voce e per zona | sì |
| `manifest/` | per ogni parte: id, voce, testo, da quale riga di quale `.fav` viene; per ogni testo del gioco, le parti che lo compongono | sì |
| `master/` | i WAV scaricati da AI Studio, come escono (circa 48 KB al secondo) | **no** (`.gitignore`) |
| `voci.md` | le descrizioni delle voci da creare in AI Studio | sì |

## Come si legge un file di `blocchi/`

Una **parte** per riga. Una parte è ciò che una voce dice senza interruzioni: una
descrizione, una battuta, un suggerimento. Fra una parte e l'altra c'è `<long pause>`, un
tag del servizio che mette una pausa: serve a tagliare l'audio, dopo, nei punti giusti.
Gli id **non** sono nel testo (verrebbero letti): stanno nel manifest, nello stesso ordine.

Il testo per la voce è il testo del gioco con le sole differenze che servono: le parole in
MAIUSCOLO (NORD, PARLA CON…) sono abbassate, perché il servizio le leggerebbe come enfasi.

## Il pilota: Z1 (la stazione e Nunzio)

1. **Le voci.** In AI Studio, Playground → *Create new voice*, tre volte, con i testi di
   `voci.md`. Ascolta la frase di prova di ciascuna e ritocca la descrizione finché ti
   convince; poi salva con il nome indicato. Se in libreria trovi una voce italiana che ti
   piace di più, va bene anche quella: dimmi quale.
2. **Il narratore** (`blocchi/z1-narratore.txt`, circa 3 minuti). *Create new dialog* →
   Speaker 1 = Narratore → un solo blocco di parlato, incolla **tutto** il file → *Run*.
   Lascia vuoto il campo dello stile: Google consiglia di provare prima senza. Scarica con
   l'icona di download e salva come `master/z1-narratore.wav`.
3. **Nunzio** (`blocchi/z1-nunzio.txt`) → `master/z1-nunzio.wav`.
4. **La voce di servizio** (`blocchi/z1-servizio.txt`) → `master/z1-servizio.wav`.
5. **I numeri** (`blocchi/z1-servizio-numeri.txt`, 68 pezzi di una frase, circa 2 minuti):
   la prova più importante per i testi con numeri («Hai sette d'acqua, e tre di cibo.»).
   → `master/z1-servizio-numeri.wav`.

Se un'impostazione dell'editor non è chiara o un risultato non torna (la voce che legge
«long pause», pezzi saltati, voce diversa da una generazione all'altra), non rifare tutto:
scrivimelo, o mandami lo schermo.

Dopo il pilota si taglia l'audio in parti (con whisper e ffmpeg, che sul PC ci sono già),
si controlla ogni parte contro il testo e si decide se il metodo regge per le altre zone.
