---
data: 2026-11-25
ora: "18:44"
titolo: "Il censimento dei suoni"
tipo: sessione
versione: 1.43.1
---

# Il censimento dei suoni

## In breve
Su richiesta di Simone («parti con il censimento dei suoni») ho elencato, dal codice, ogni suono del gioco che non è musica né voce,
per poterli rifare con gli effetti sonori di ElevenLabs: [`pre-produzione/12-suoni.md`](../../pre-produzione/12-suoni.md). Non ho
generato niente.

## Contesto
Simone aveva chiesto se si potesse fare «un elenco accuratissimo di tutti i suoni censiti nel gioco per poterli elaborare con
ElevenLabs tramite il connettore attivo». Il connettore ha davvero un nodo per gli effetti sonori (Sound Effects v3: da 0,5 a 30
secondi, anche in giro continuo); l'ho visto nell'elenco dei nodi che il conto può usare. Simone ha precisato di avere il piano da
22 dollari al mese.

## Lavoro fatto
- Letti tutti i punti che suonano: `loghi/suono.ts` (con le regie di `LogoRuntime.tsx` e `LogoFavella.tsx`), `trailer/audio.ts` e
  `trailer/scaletta.ts`, `gioco/suonoCarta.ts`, `gioco/suonoTrofeo.ts`, l'audio di `SequenzaFinale.tsx`, `gioco/musica.ts` e
  `gioco/voce.ts`, e dove si chiamano (`Mappa.tsx`, `ViaggiatorePlayer.tsx`, `Trailer.tsx`).
- Scritto il censimento: 27 suoni dei loghi (L01–L27), 13 del trailer (T01–T09, i passi in cinque terreni), 2 della mappa, 1 del
  trofeo. Per ciascuno: quando, quanto dura, com'è fatto oggi, se è un rumore o una parte intonata, quante prese servirebbero e una
  proposta di prompt in inglese, scritta seguendo la guida del modello letta dal connettore.
- Il connettore non legge l'uso del conto: «This connector requires additional permissions». È collegato e genera (Simone ci ha
  lavorato il giorno prima su un altro progetto): gli manca solo quel permesso. Simone ha detto di avere **116.031 crediti**.

## Decisioni
- **Proposta: rifare con ElevenLabs solo i rumori, tenere sintetizzate le parti intonate** — perché: il modello non garantisce l'altezza
  delle note, e i loghi sono scritti su una tonalità e sui fotogrammi (i bip delle lettere sulla scala, le campanelle dei pixel,
  l'arpa). Da decidere con Simone.
- **Il documento sta in `pre-produzione/`, come dodicesimo**, accanto al doppiaggio (08) e alle musiche (10) — perché: è il progetto di
  un lavoro da fare, non lo stato di uno fatto.

## Verifiche
- Ogni tempo e ogni numero del censimento viene dal codice (le regie dei loghi, `EVENTI` e `CAMMINATE` della scaletta, le costanti dei
  suoni); i passi contati con la formula di `appoggi()`.
- `node strumenti/diario.mjs verifica` e `registro` in ordine.

## Questioni aperte
- **Due cose trovate** (scritte in fondo al censimento): i passi sul titolo che continuano per quasi un minuto sul menu, con l'immagine
  ferma; e la sequenza finale, che prende il tempo dalla musica allo stesso modo in cui il trailer, prima della correzione di oggi,
  tornava indietro all'attacco. Nessuna delle due è stata toccata.
- Da decidere con Simone: quali suoni rifare e la licenza degli effetti col suo piano. Il costo vero di una generazione di effetti si
  misura sulla prima.
