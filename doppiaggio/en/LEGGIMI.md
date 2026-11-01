# Il doppiaggio inglese

Il narratore del gioco in inglese, con Gemini 3.8 Flash TTS da Google AI Studio, a mano, come in italiano (`../LEGGIMI.md`). Qui
c'è soltanto Enzo: la voce di servizio (Kira) e i quattordici personaggi in inglese non sono stati decisi.

| File | Contenuto |
|---|---|
| `blocchi/narratore-a.txt` … `-f.txt` | **la narrazione** in sei blocchi di circa 9,5 minuti stimati: descrizioni, posti, messaggi, finali, biglietto e targhe, «I've read it.»; una parte per riga, `<long pause>` in mezzo, da incollare in AI Studio |
| `blocchi/scelte.txt` | le **scelte di dialogo del giocatore** (81 frasi in prima persona), le legge Enzo; un blocco a parte |
| `blocchi/trailer.txt` | il **trailer**, in gruppi di tono (`### tono — style: …`: un blocco di parlato per gruppo; le righe con `###` non si incollano) |
| `trailer.json` | i testi del trailer inglese, scritti a mano dai testi sullo schermo (`app/src/components/Trailer.tsx`, `app/src/trailer/zone.ts`, `scaletta.ts`); stessi id, toni, finestre e ancore di `../trailer.json` |
| `manifest.json` | per ogni parte: id, blocco, testo inglese, testo italiano da cui viene, da quale riga di quale `.fav`; per ogni testo del gioco, la voce di ogni suo pezzo |
| `controllo.md` | le verifiche, i conti, **ciò che non è di Enzo** (suggerimenti e personaggi) e la **tabella italiano ↔ inglese di ogni parte di Enzo** |
| `voci.md` | il prompt della voce (campo accanto alla voce, identico in ogni generazione) |
| `gemini-tts.md` | la documentazione di Gemini 3.8 Flash TTS letta il 31 ottobre 2026 |
| `banco.json` | il resoconto del banco della voce inglese (`python strumenti/doppiaggio-banco.py --lingua en`): per ogni blocco la loudness prima e dopo, il guadagno, il picco, il peso |
| `../master/en-grezzi/` | i WAV scaricati da AI Studio (non si versionano), con le loro trascrizioni in `trascrizioni/`; `../master/clip/en-<blocco>/` le parti tagliate |
| `../../app/public/voce/en/` | ciò che il gioco suona in inglese: un file Opus per parte, `indice.json` (id della parte → durata; **corrispondenze**: id della parte italiana del narratore → registrazione inglese), `trailer.opus` e `trailer.json` |

Tutto, tranne `trailer.json`, `voci.md` e `gemini-tts.md`, lo scrive `python strumenti/doppiaggio-inglese.py blocchi`: non si ritocca
a mano. `python strumenti/doppiaggio-inglese.py stato` fa le verifiche senza scrivere. Se un catalogo inglese
(`app/src/lingue/en/`) cambia, si rilancia e si vede che cosa è cambiato (l'id di una parte è l'impronta del suo testo).

## Come si distingue chi parla

In inglese le virgolette “così” servono sia alle battute dei personaggi sia al biglietto e alle targhe che legge il narratore: la
punteggiatura da sola non basta. Chi dice che cosa lo decide **l'italiano**: ogni testo inglese si spezza con la stessa funzione
dell'italiano (`strumenti/doppiaggio.py`, le stesse attribuzioni di `../attribuzioni.json`), e la sequenza delle voci dev'essere
identica testo per testo. Il comando non scrive niente se una di queste non torna:

1. ogni testo del gioco (544) ha la sua traduzione, le sue parti rifanno il testo, la sequenza delle voci è quella dell'italiano;
2. gli spezzoni fra virgolette (218) e i suggerimenti fra parentesi (45) sono tanti quanti nell'italiano;
3. nessuna parte di Enzo contiene parentesi, segnaposto, tag, virgolette o parole in maiuscolo;
4. ogni parte di Enzo ha come originale una parte italiana del narratore (manifest italiano), e sono tante quante in italiano
   (451 di narrazione, 81 scelte);
5. il trailer ha le stesse 33 parti, toni, finestre e ancore dell'italiano.

Il testo per la voce è derivato e non cambia il gioco: le parole in maiuscolo (NORTH, EXAMINE…) si abbassano, i nomi dei personaggi
tornano con l'iniziale maiuscola, gli a capo diventano spazi. I testi con segnaposto che il gioco compone da sé (la riga di
`STATO`, `[i fili del viaggio]`) restano fuori, come in italiano.

## Come si genera

1. In AI Studio: *Create new dialog*, **Speaker 1** = Enzo, nel campo accanto il prompt di `voci.md`; campo di stile vuoto.
2. Un blocco di parlato: incolla tutto il file (non le righe `###`), *Run*. Guarda la durata: la stima è sotto ogni blocco di
   `controllo.md`, con le costanti dell'italiano (170 parole al minuto, 1,4 s a parte); **l'inglese va ritarato sul primo blocco
   vero**. Vicino a 10:50 il finale è tagliato.
3. Scarica il WAV e salvalo in `../master/` (non si versiona) con il nome del blocco.

L'ordine: narratore-a … -f, poi `scelte`, poi `trailer`.

## Che cosa è fatto, che cosa resta

Fatto il 31 ottobre – 1° novembre 2026: i blocchi sono stati generati da Simone (11 WAV, uno doppio), riconosciuti
(`doppiaggio-riconosci.py --lingua en`), tagliati e controllati parte per parte (`doppiaggio-taglia.py en-narratore-a` … `en-scelte`,
`en-trailer`: 532 parti di Enzo e 33 del trailer, tutte trovate, tutte controllate da sole), passati al banco
(`doppiaggio-banco.py --lingua en`: 532 parti, 43,3 minuti, 10,1 MB) e al trailer
(`doppiaggio-trailer.py --lingua en`), e il gioco le suona col modo di voce «inglese» (`app/src/gioco/voce.ts`). Il collaudo è la sezione 9 di
`collaudo/doppiaggio.py`.

- **Se un testo inglese cambia** (un catalogo di `app/src/lingue/en/`): cambia l'id della sua parte e il collaudo lo dice. Si rigenera quel
  testo (`doppiaggio-inglese.py blocchi` e `da-fare` per Gemini), si taglia, si rifà il banco.
- **Le scelte del giocatore sono lette in fretta, e vanno bene così**: mediana 4,8 parole al secondo contro 3,3 della narrazione e delle scelte
  italiane; 35 su 81 sopra le 5. Simone le ha ascoltate il 1° novembre 2026: «si capisce tutto», quindi **non si rigenerano**. Il collaudo ne dice
  il numero con una riga e le accetta (limite 7,5).
- **Il «long pause» letto ad alta voce**: in quattro blocchi su sei (b, d, e, f) il modello ha pronunciato il tag fra una parte e l'altra, fino a 30 volte
  in un blocco. Il taglio lo lascia fuori da tutte le parti e il controllo di ogni parte non lo trova dentro; in generazioni nuove conviene
  guardare il rapporto (`master/clip/en-<blocco>/rapporto.txt`).
- **Kira e i personaggi in inglese**: non registrati. Finché non lo sono, col modo «inglese» suonano in italiano.

## Da sapere (trovato preparando i blocchi)

- **Parti che si somigliano** nello stesso blocco (una comincia come l'altra): sono le stesse coppie dell'italiano, varianti di
  testo per stato. Gemini salta ciò che prende per una ripetizione: dopo la voce, il controllo di ogni parte dirà se ne ha
  saltata una. L'elenco lo stampa `stato`.
- **Il biglietto del trailer** dice «THERE'S NO POINT COMING BACK.» (`scaletta.ts`); la nota di Z1 dice «There's no need to come
  back.». In italiano è una frase sola. Il trailer inglese legge ciò che si vede nel trailer.
- Una scelta del giocatore suona «I'll leave you three water.» (il glossario dice «3 water»): detta a voce è dura. Il catalogo non è
  stato toccato.
- Nel trailer inglese «Il Viaggiatore.» (il titolo non si traduce) lo legge una voce britannica: da sentire alla prima prova.
- Nel trailer inglese «Choices follow you to the very end.» (8 parole) e «And at the ford, waiting for you,» sono più fitti
  dell'italiano nella loro finestra: da vedere dopo la voce.
