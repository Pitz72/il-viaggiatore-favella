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

## Che cosa resta

- **Le generazioni** (Simone) e poi il **taglio e il controllo parte per parte**: `strumenti/doppiaggio-taglia.py` è fatto per
  l'italiano (riconoscimento in italiano, numeri in italiano, legge `../generati/` e `../manifest.json`) e va adattato all'inglese.
- Il **banco** (`strumenti/doppiaggio-banco.py`) e l'**app** (`app/src/gioco/parti.ts` ritrova le parti dal testo italiano stampato):
  oggi non conoscono una voce inglese. È il lavoro che segue, quando i WAV ci sono.
- Kira e i personaggi in inglese: non decisi.

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
