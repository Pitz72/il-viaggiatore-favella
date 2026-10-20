# Il doppiaggio

Il gioco si doppia con Gemini 3.8 Flash TTS (`gemini-3.8-flash-tts`) da Google AI Studio,
a mano. I testi si ricavano dai `.fav` con `strumenti/doppiaggio.py`, non si scrivono a
mano: se un testo cambia, si rigenera il blocco.

| Cartella | Contenuto | Nel repository |
|---|---|---|
| `blocchi/` | il testo da incollare in AI Studio: **un file per voce** su tutto il gioco (le voci lunghe, in più file) | sì |
| `manifest.json` | per ogni parte: id, voce, testo, da quale riga di quale `.fav` viene; per ogni testo del gioco, le parti che lo compongono; per ogni blocco, l'ordine delle parti | sì |
| `master/` | i WAV scaricati da AI Studio, come escono (circa 48 KB al secondo) | **no** (`.gitignore`) |
| `voci.md` | le descrizioni delle voci da incollare in AI Studio | sì |

## Una voce per volta

Ogni generazione cambia un poco la voce, anche con la stessa descrizione. Per questo il
lavoro si fa **una voce per volta e col minor numero di generazioni**: tutto Kira in un
blocco solo, ogni personaggio in un blocco solo, il narratore nei pochi blocchi che il
tetto del servizio permette (circa 11 minuti di audio a richiesta; lo strumento si ferma a
9, la voce di servizio a 10) e tagliati dove cambia la zona.

L'ordine: **Kira** (servizio), poi i personaggi, per ultimo il narratore, che è il più lungo.

## Come si legge un file di `blocchi/`

Una **parte** per riga. Una parte è ciò che una voce dice senza interruzioni: una
descrizione, una battuta, un suggerimento, una scelta del giocatore. Fra una parte e l'altra
c'è `<long pause>`, un tag del servizio che mette una pausa: serve a tagliare l'audio, dopo,
nei punti giusti. Gli id **non** sono nel testo (verrebbero letti): stanno nel manifest, nello
stesso ordine.

Il testo per la voce è il testo del gioco con le sole differenze che servono: le parole in
MAIUSCOLO (NORD, PARLA CON…) sono abbassate, perché il servizio le leggerebbe come enfasi.

## Come si genera un blocco

1. In AI Studio: *Create new dialog*, **Speaker 1** = la voce di libreria scelta (tabella in
   `voci.md`), con nel campo accanto la **descrizione** di `voci.md`, identica ogni volta.
2. Un solo blocco di parlato (se l'editor ha un limite di lunghezza, più blocchi dello
   stesso speaker nella stessa generazione): incolla **tutto** il file, campo stile vuoto.
3. *Run*. A fine generazione guarda la durata: deve somigliare alla stima (`python
   strumenti/doppiaggio.py stato`). Se è vicina a 10:50 e il finale è tagliato, il testo
   era troppo lungo: dillo, si rigenera la coda.
4. Scarica con l'icona di download e salva in `master/` con il nome del blocco e la voce
   (per esempio `master/servizio-kira.wav`).

## Dopo

Si taglia l'audio in parti (con whisper e ffmpeg, che sul PC ci sono già), si controlla ogni
parte contro il testo e si accorciano le pause troppo lunghe. Le parti da rifare si
raccolgono in un solo blocco di ritocchi, per una generazione sola.

## Comandi

```
python strumenti/doppiaggio.py stato                      # parti, parole e minuti per voce, blocchi
python strumenti/doppiaggio.py blocchi --voce servizio    # scrive blocchi/servizio.txt e manifest.json
python strumenti/doppiaggio.py blocchi                    # scrive tutti i blocchi (cancella i vecchi)
```

Restano da fare prima dei personaggi: le 40 frasi tra «» fuori dai dialoghi di cui non si sa
chi parla (`attribuzioni.json`), e i testi con numeri che il gioco ricompone (`[i fili del
viaggio]`, la riga di `STATO`).
