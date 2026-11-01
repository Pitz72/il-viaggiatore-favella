# Il doppiaggio inglese

Il narratore del gioco in inglese (Enzo) e la voce di servizio (Kira), con Gemini 3.8 Flash TTS da Google AI Studio, a mano, come
in italiano (`../LEGGIMI.md`). **Tutti e quattordici i personaggi sono fatti anche in inglese**, con ElevenLabs (`eleven-v4.md`): i primi
quattro, quelli che in italiano erano di ElevenLabs (Eleven v4), con le loro voci italiane; gli altri dieci con voci di libreria o voci disegnate
da Simone (Voice Design). Le voci italiane di Gemini dei dieci personaggi sono state rifatte con ElevenLabs lo stesso 1° novembre 2026 (stessa voce nelle due lingue; dopo l'acquisto
di un abbonamento): Concetta, ultima, con una voce disegnata.

| File | Contenuto |
|---|---|
| `blocchi/narratore-a.txt` … `-f.txt` | **la narrazione** in sei blocchi di circa 9,5 minuti stimati: descrizioni, posti, messaggi, finali, biglietto e targhe, «I've read it.»; una parte per riga, `<long pause>` in mezzo, da incollare in AI Studio |
| `blocchi/scelte.txt` | le **scelte di dialogo del giocatore** (81 frasi in prima persona), le legge Enzo; un blocco a parte |
| `blocchi/kira-suggerimenti.txt`, `kira-numeri-a.txt`, `kira-numeri-b.txt` | **Kira**, la voce di servizio: i 31 suggerimenti tra parentesi e i 89 pezzi con i numeri delle scorte; tre blocchi (vedi sotto) |
| `blocchi/trailer.txt` | il **trailer**, in gruppi di tono (`### tono — style: …`: un blocco di parlato per gruppo; le righe con `###` non si incollano) |
| `blocchi/imma.txt`, `rosaria.txt`, `tore.txt`, `vito.txt`, `concetta.txt`, `iole.txt`, `onofrio.txt`, `ciro.txt`, `peppe.txt`, `cosimo.txt`, `nunzio.txt`, `saverio.txt`, `rocco.txt`, `pasquale.txt` | i **personaggi di ElevenLabs** (Eleven v4): una battuta per paragrafo, in testa `[accento][tono]`; si incolla tutto il file (193 parti in tutto: 22, 15, 13, 19, 8, 12, 21, 11, 17, 31, 7, 8, 5 e 4) |
| `prove/accento-A-nessuno.txt` … `-D-strong.txt` | la **prova di accento**: sei battute di Vito, un accento diverso per file (vedi `eleven-v4.md`) |
| `stati.json` | età e stato di Nunzio, Saverio, Rocco, Pasquale, Peppe, Ciro e Cosimo, per i tag di Eleven (`profili`; `stati`: Pasquale malato e guarito); lo legge `doppiaggio-inglese.py`, a mano si modifica |
| `voci-eleven.md` | le **schede di ricerca** delle voci (filtri e parole della Voice Library, le candidate trovate con il connettore, quanto costano) |
| `eleven-v4.md` | la documentazione di Eleven v4 letta il 1° novembre 2026: tag, accenti, punteggiatura, impostazioni; che cosa decide il progetto |
| `trailer.json` | i testi del trailer inglese, scritti a mano dai testi sullo schermo (`app/src/components/Trailer.tsx`, `app/src/trailer/zone.ts`, `scaletta.ts`); stessi id, toni, finestre e ancore di `../trailer.json` |
| `manifest.json` | per ogni parte: id, blocco, testo inglese, testo italiano da cui viene, da quale riga di quale `.fav`; per ogni testo del gioco, la voce di ogni suo pezzo; **Kira sta a parte, nella chiave `servizio`** (blocchi, parti, corrispondenze italiano → inglese) |
| `controllo.md` | le verifiche, i conti, **ciò che non è di Enzo** (suggerimenti e personaggi) e la **tabella italiano ↔ inglese di ogni parte di Enzo** |
| `voci.md` | il prompt della voce (campo accanto alla voce, identico in ogni generazione) |
| `gemini-tts.md` | la documentazione di Gemini 3.8 Flash TTS letta il 31 ottobre 2026 |
| `banco.json` | il resoconto del banco della voce inglese (`python strumenti/doppiaggio-banco.py --lingua en`): per ogni blocco la loudness prima e dopo, il guadagno, il picco, il peso |
| `../master/en-grezzi/` | i WAV scaricati da AI Studio (non si versionano), con le loro trascrizioni in `trascrizioni/`; `../master/clip/en-<blocco>/` le parti tagliate |
| `../master/en-grezzi/elevenlabs/` | i quattordici MP3 di ElevenLabs del 1° novembre 2026 (`ElevenLabs_…_Luigi|Criss|Victoria|Valeria|Tosca|Elettra|Nonno Ben_…mp3` scaricati da Simone; `ElevenLabs_2026-11-01_Pierpaolo|Vittorio|CorradoNoventa_…_v4.mp3` generati e scaricati da Claude con il connettore; `ElevenLabs_2026-11-01_ErmenegildoMeliconi|IgnazioRossi|CiroEsposito|CarmineLoRusso_…_v4.mp3` generati da Claude con le voci disegnate da Simone: nello spazio ElevenLabs la voce di Rocco si chiama «Ciro Esposito», non è Ciro; `ElevenLabs_2026-11-01_AmericaMarchetti_concetta_v4.mp3` è la nuova Concetta, voce disegnata da Simone e generata da Claude: sostituisce Tosca, il cui MP3 resta; `concetta.wav` è ora la nuova ripresa, `concetta-tosca.wav` quello di Tosca e `concetta-separata.wav` la nuova con silenzi fra le battute, da cui si taglia) e i WAV che ne ricava `ffmpeg` per il taglio (`vito.wav`, `tore.wav`, `imma.wav`, `rosaria.wav`, `concetta.wav`, `iole.wav`, `onofrio.wav`, `ciro.wav`, `peppe.wav`, `cosimo.wav`, `nunzio.wav`, `saverio.wav`, `rocco.wav`, `pasquale.wav`); non si versionano |
| `../../app/public/voce/en/` | ciò che il gioco suona in inglese: un file Opus per parte, `indice.json` (id della parte → durata; **corrispondenze**: id della parte italiana del narratore e di Kira → registrazione inglese), `trailer.opus` e `trailer.json`; `elevenlabs/`, con l'indice e la licenza loro, ha le 69 parti di Imma, Rosaria, Tore e Vito |

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

L'ordine: narratore-a … -f, poi `scelte`, poi `trailer`, poi Kira (`kira-suggerimenti`, `kira-numeri-a`, `kira-numeri-b`: campo di stile vuoto,
voce di libreria Kira, il prompt di Kira in `voci.md`).

## Che cosa è fatto, che cosa resta

Fatto il 31 ottobre – 1° novembre 2026: i blocchi sono stati generati da Simone (11 WAV, uno doppio), riconosciuti
(`doppiaggio-riconosci.py --lingua en`), tagliati e controllati parte per parte (`doppiaggio-taglia.py en-narratore-a` … `en-scelte`,
`en-trailer`: 532 parti di Enzo e 33 del trailer, tutte trovate, tutte controllate da sole), passati al banco
(`doppiaggio-banco.py --lingua en`: 532 parti, 43,3 minuti, 10,1 MB; con Kira, vedi sotto, 652 parti, 46,7 minuti, 10,9 MB; con i quattro personaggi, 721 parti, 51,2 minuti, 12,0 MB; con i sette, 762 parti, 54,4 minuti, 12,7 MB; con i dieci, 821 parti, 58,1 minuti, 13,6 MB; con tutti e quattordici, 845 parti, 59,5 minuti, 14,0 MB) e al trailer
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
- **Kira (voce di servizio) in inglese**: registrata da Simone il 1° novembre 2026 in tre blocchi (`blocchi/kira-suggerimenti.txt`, `kira-numeri-a.txt`,
  `kira-numeri-b.txt`; 120 parti: 31 suggerimenti e 89 pezzi con i numeri delle scorte), con il prompt in `voci.md` e il controllo in `controllo.md`
  (sezione di Kira). Tre blocchi e non uno perché i pezzi coi numeri si somigliano e Gemini salta ciò che prende per una ripetizione; due pezzi che
  differiscono solo per la virgola o il punto finale («…water,» e «…water.») non stanno nello stesso blocco. Il manifest li tiene a parte, nella
  chiave `servizio`; il taglio li conosce come `en-kira-suggerimenti`, `en-kira-numeri-a`, `en-kira-numeri-b`, il riconoscitore (`--lingua en`) e il
  banco (`--lingua en`) anche; il gioco li suona col modo «inglese» senza altro (le corrispondenze di Kira stanno nell'indice inglese insieme a
  quelle del narratore: i numeri si ricompongono dai pezzi italiani, come in italiano). Tagliati e controllati parte per parte: 120 su 120 trovate,
  «long pause» mai letto ad alta voce, quattro sole righe sotto l'85% nel controllo di ognuna da sola, tutte di whisper e non della voce («Nunzio to barter» sentito «Nunzio Tabata», «Iole» sentito «you later», «Onofrio» sentito
  «an off-reel», «and eight food.» sentito «and eat food.», che con la frase vicina come suggerimento torna «eight»). Nel banco ogni blocco di
  Kira sta a −23 LUFS come Enzo (le registrazioni grezze stavano a −17: sei decibel in meno).
- **I personaggi in inglese**: finora **Imma, Rosaria, Tore e Vito** (quelli che in italiano sono stati fatti con ElevenLabs, Eleven v4), con le loro voci
  italiane (Victoria, Valeria, Criss, Luigi). Blocchi pronti il 1° novembre 2026 (`blocchi/imma.txt` … `vito.txt`: 69 parti derivate dall'italiano parte per
  parte, stesso ordine e stessi toni, `[Italian accent][tono]` davanti a ogni battuta, nove verifiche in `doppiaggio-inglese.py`; manifest, chiave `personaggi`,
  con le corrispondenze italiano → inglese come Kira). **Registrati da Simone lo stesso giorno, direttamente, saltando la prova di accento** (`prove/`, mai
  generata): quattro MP3 di ElevenLabs (`../master/en-grezzi/elevenlabs/`, convertiti in WAV per il taglio), Eleven v4, Stability 50 / Similarity 75 tranne
  Rosaria (75 / 75, velocità 0,96), Vito (velocità 0,86) e Tore (velocità 0,7, Stability 0, Similarity 0, come in italiano). Simone li ha ascoltati tutti:
  «le voci sono italiane, si sente soprattutto nella pronuncia dei nomi»; nessuna anomalia fonetica. Tagliati e controllati parte per parte
  (`doppiaggio-taglia.py en-imma` … `--controlla`): 69 parti su 69 trovate, controllo di ognuna da sola sopra l'85% e senza parole in più per tutte (nessun
  tag letto ad alta voce, «long pause» non c'è in questo formato), pause fra le battute da 0,11 a 0,72 s. Nel banco (`doppiaggio-banco.py --lingua en`) vanno
  in `app/public/voce/en/elevenlabs/`, con l'indice e la licenza loro (come in italiano), ognuno a −23 LUFS: Vito era a −26,2, la più piano, e s'è alzato
  di 3,2 dB. Il gioco le suona col modo «inglese»: `voce.ts` legge anche le cartelle a parte dell'indice inglese.
  **Concetta, Iole e Onofrio** (1° novembre 2026, con i crediti avanzati, dopo averli chiesti Simone come esperimento: «un personaggio femminile anziano», «l'altra
  anziana», «un uomo anziano»): i blocchi prima in `prove/<nome>.txt` (comando `personaggio`), poi tenuti e portati fra i `PERSONAGGI`; accento per personaggio
  (`ACCENTI` in `doppiaggio-inglese.py`: `strong Italian accent` per Concetta e Onofrio, le cui schede in `voci.md` lo vogliono più marcato, `Italian accent` per
  gli altri). Voci: Tosca (Concetta, velocità 0,81, Stability 34, Similarity 40; sostituita il 1° novembre da una voce disegnata, «America Marchetti»), Elettra (Iole, 0,84 / 71 / 24), Nonno Ben (Onofrio, 0,7 / 81 / 100). Riconosciuti
  in inglese (98–100%, in italiano 22–24%), tagliati e controllati: 8 su 8, 12 su 12, 21 su 21, ognuna sopra l'85% e senza parole in più. In tutto 110 parti di sette
  personaggi nel banco (762 con Enzo e Kira). **Ciro, Peppe e Cosimo** (1° novembre 2026, «le voci indicate vanno bene. Procedi»): per la prima volta **generati da Claude** con il connettore ElevenLabs
  (`creative_generate_speech`, `eleven_v4`, una ripresa a testa, impostazioni predefinite: Stability 0,5), con le voci di libreria trovate con `creative_list_voices`:
  **Pierpaolo** per Ciro (italiano, matura, influenza salernitana), **Vittorio boy next door** per Peppe (giovane, accento milanese: l'unico ragazzo italiano trovato) e
  **Corrado Noventa** per Cosimo (profondo, drammatico; fra le quattro candidate l'ho scelto io, la prima). Stesso testo dei blocchi (`[Italian accent][età, tono]`), costo 1.230,
  1.802 e 4.226 crediti (un credito per carattere, tag compresi). Scaricati dal link firmato dello spazio di Simone, convertiti in WAV, tagliati e controllati: 11 su 11, 17 su 17,
  31 su 31, ognuna sopra l'85% e senza parole in più, nessun tag letto. Nel banco: 169 parti di dieci personaggi, 821 parti inglesi, la voce intera (con l'italiano) 28,3 MB.
  **Nunzio, Saverio, Rocco e Pasquale** (1° novembre 2026): in libreria non c'erano voci italiane adatte e Simone ha detto «sì, disegnale». Voice Design
  (`creative_design_voice`, `eleven_ttv_v3`, inglese; descrizione = quella di `voci.md`; battuta di prova = le loro stesse battute): tre anteprime a testa. **Simone ha ascoltato
  e salvato una voce per ognuno**: nello spazio ElevenLabs si chiamano «Ermenegildo Meliconi» (Nunzio), «Ignazio Rossi» (Saverio), «Ciro Esposito» (Rocco: **non è Ciro**) e «Carmine Lo Russo»
  (Pasquale), tutte e quattro la prima anteprima. Generati da Claude (1.059, 792, 694 e 507 crediti, una ripresa a testa), tagliati e controllati: 7 su 7, 8 su 8, 5 su 5, 4 su 4, ognuna
  sopra l'85% e senza parole in più. Nel banco: 193 parti di **tutti e quattordici i personaggi**, 845 parti inglesi, la voce intera (con l'italiano) 28,7 MB. `collaudo/doppiaggio.py`
  pretende che i personaggi dell'italiano siano tutti e soli quelli registrati in inglese.

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
