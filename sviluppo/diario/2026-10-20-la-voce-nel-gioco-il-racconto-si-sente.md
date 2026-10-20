---
data: 2026-10-20
ora: "18:15"
titolo: "La voce nel gioco: il racconto si sente"
tipo: sessione
versione: 1.20.0
---

# La voce nel gioco: il racconto si sente

## In breve
Fase 2 del piano 08: il gioco suona il doppiaggio. Ogni riga che il motore stampa ritrova le sue parti registrate, che suonano in fila e si fermano al primo tasto; le risposte dei dialoghi le legge il narratore al passaggio del mouse; un pannello «voce» sceglie fra voce recitata e lettore di schermo.

## Contesto
Dopo la fase 1 (il banco: un file Opus per parte in `app/public/voce/`, voce di diario «Il doppiaggio nel gioco: le decisioni di Simone e il banco audio») Simone ha dato il via alla fase 2. Il vincolo di fondo: il motore (`motore/`, copia di FAVELLA1) non si tocca e consegna il testo già composto, quindi le parti vanno ritrovate dal testo stampato.

## Lavoro fatto
- **Prima di scrivere codice, una misura:** ho giocato i dodici percorsi e le tre morti di `collaudo/finali.py` raccogliendo ogni testo stampato (1.979 comandi) e ho provato in Python a ritrovarne le parti con lo spezzamento di `strumenti/doppiaggio.py`: 93% delle righe intere al primo colpo. Quello che mancava: i numeri delle scorte nelle battute («Hai 6 d'acqua e 2 di cibo.», fase 3), un messaggio del motore («La partita è finita…», che non è nei `.fav`) e i finali, perché il narratore ha letto anche «Finale —».
- `app/src/gioco/parti.ts` (nuovo, senza import di runtime): `perLaVoce` (la stessa normalizzazione di `per_la_voce`, con i confini di parola Unicode che in JavaScript vanno scritti a mano: «PERCHÉ», «GIÙ»), la tabella testo → voce → id, e `partiDelBlocco` per le righe del diario: le battute con le «» del personaggio; la prosa provata prima con le «» lette dal narratore d'un fiato (una descrizione, il biglietto) e poi con le «» di chi parla (un messaggio), tenendo la prova che lascia meno pezzi senza parte; i finali con «FINALE —» davanti; una frase che non si trova intera si cerca come la fila più corta di parti note ai confini di frase (il motore mette a volte due testi sulla stessa riga: così si ritrovano anche le frasi dei fili del viaggio). `partiDellaScelta` per le risposte di dialogo; la risposta muta «…» non ha niente da dire.
- `app/src/gioco/voce.ts` (nuovo): carica `voce/indice.json` e, se c'è, `voce/locale/indice.json`; decodifica le parti con Web Audio (fino a 120 in memoria), le mette in fila con 0,3 s fra due frasi della stessa riga e 0,55 s fra due righe, le ferma tutte insieme; F2 ridice l'ultima fila; volume con un guadagno. Le impostazioni (modo e volume) stanno in `localStorage`.
- `app/src/gioco/ImpostazioniVoce.tsx` (nuovo): il pannello «voce», con lo stesso aspetto della guida (Esc chiude, il fuoco entra e torna): voce recitata o lettore di schermo, il volume, «↻ riascolta».
- `ViaggiatorePlayer.tsx`: la voce dice il testo di avvio, di ogni turno, di «ricomincia» e del caricamento; al primo tasto (non i soli tasti di modifica) si ferma; F2 riascolta; le risposte di dialogo si leggono a `mouseenter` e a `focus`; il bottone «♪ voce» nella testata. In voce recitata il diario ha `aria-live="off"` e un'area nascosta (`sr-only`, `aria-live="polite"`) annuncia al lettore di schermo solo ciò che la voce non dice: i titoli dei luoghi, le risposte del motore, i pezzi senza parte (oggi i numeri delle scorte; nei pacchetti, le battute di Imma, Rosaria, Tore e Vito).
- `desktop/main.cjs`: `.opus` fra i tipi serviti (`audio/ogg`). La guida «Come si gioca» dice in una riga che il racconto ha una voce, che un tasto la ferma, che F2 la ridice e che «voce» la regola.
- `strumenti/doppiaggio-banco.py`: l'indice porta anche il testo e la voce di ogni parte (`testi`), 94 KB.
- `collaudo/doppiaggio.py`, punto 7: con la logica vera dell'app (`app/scripts/parti-node.mjs`, che trascrive `parti.ts` e `testo.ts` in Node) pretende che ogni riga stampata lungo i percorsi, ogni testo dei `.fav` stampato come lo stampa il motore e ogni risposta di dialogo trovino le loro parti. In CI gira dopo `npm ci --prefix app`.

## Decisioni
- **Due modi, non tre** — Simone aveva scelto «voce recitata oppure lettore di schermo»; il terzo, «nessuna», che avevo messo io nel piano, per chi non usa un lettore di schermo è identico al secondo (il diario annuncia, ma nessuno ascolta). Il silenzio è il volume a zero.
- **In voce recitata il lettore di schermo sente ciò che la voce non dice** — perché nei pacchetti le battute dei quattro personaggi ElevenLabs sono mute, e chi gioca col lettore di schermo in voce recitata le perderebbe; così non c'è mai doppio audio e non si perde niente.
- **La voce parte da sola, in voce recitata, alla prima partita** — è il modo predefinito: il gioco ora è anche un audiogioco; chi non lo vuole cambia nel pannello, e la scelta resta.
- **Le pause fra le parti le mette il gioco** (0,3 s fra frasi, 0,55 s fra righe) — il banco ha tolto i silenzi dei WAV; i valori stanno in `voce.ts` e si cambiano se all'ascolto sono troppo brevi o lunghi.
- **F2 per riascoltare** — è libero (F5 salva, F9 carica, Esc chiude); nel browser non apre niente.
- **Nessun «riduci movimento»** — la voce non ha animazioni.
- **Versione 1.20.0** — una funzione nuova dell'app (MINOR).

## Verifiche
- Nel browser integrato (server di sviluppo sulla 5200): all'avvio della partita il gioco carica le quattro parti della stazione (la descrizione, «Esamina il biglietto per rileggerlo.», «A nord la piazza.», «Quando il corpo lo chiede…»); il contesto audio è «running» e le quattro sorgenti sono in fila. Un tasto nel campo comando: la voce si ferma (nessuna sorgente). F2: la fila ricomincia. «nord», «est», «parla con Nunzio»: una parte, tre parti (con le pause giuste), la battuta di Nunzio; il resto «(Hai 3 d'acqua e 2 di cibo.)» va all'area del lettore di schermo. Il mouse su «Da che parte è Acquamorta?»: il narratore la dice. Il pannello «voce»: passando a «lettore di schermo» la voce tace, il diario torna `aria-live="polite"`, l'area nascosta sparisce, il volume si spegne, il bottone dice «voce no», la scelta si salva; tornando indietro, tutto come prima. Le 69 parti solo locali si trovano tutte.
- `collaudo/doppiaggio.py`: TUTTO OK; lungo i percorsi 1.987 righe e 392 testi dei `.fav`: ogni pezzo ha la sua parte; 104 pezzi con i numeri delle scorte rimandati alla fase 3; parti ritrovate 411 lungo i percorsi e 750 con i testi dei `.fav`, su 878 (le altre sono numeri, fili e trailer); 57 risposte incontrate e 134 nei `.fav`, tutte col narratore.
- Gli altri dieci collaudi (finali, mirate, salvataggi, scorte, interfaccia, fili, giocate, testo, conferme, pulsanti): TUTTO OK; `node desktop/prove.cjs` passa; `npx tsc --noEmit` pulito; `npm run build` riuscito.
- Il suono vero (le pause, il volume, chi stona) lo giudica Simone all'ascolto: il pannello del browser integrato è nascosto e non lo si può sentire da qui.

## Questioni aperte
- Fase 3: i numeri delle scorte nelle battute («Hai 6 d'acqua e 2 di cibo.», «Ora hai 4 di cibo.») e i fili del viaggio.
- La lunghezza delle pause fra le parti, da sentire.
- Rifare Imma, Rosaria, Tore e Vito prima del rilascio (piano 08, decisione 6).
