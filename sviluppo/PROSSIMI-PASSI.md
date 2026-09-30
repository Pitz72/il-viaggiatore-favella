# Prossimi passi

Che cosa resta da fare e che cosa si vuole fare, dopo la 1.4.0 (30 settembre
2026). Il *perché* di ogni punto sta nelle voci del [diario](DIARIO.md) che lo
hanno segnalato; qui c'è l'elenco da cui ripartire.

## 1. Cose rimaste aperte

### Interfaccia
- **I messaggi nuovi del motore** («Il tempo passa.», «Non senti nulla di
  particolare.», «Cosa vuoi esaminare?», la conferma di `esci`) compaiono nello
  stile della prosa invece che in quello di sistema: vanno aggiunti a
  `app/src/gioco/testo.ts`, o si passa agli eventi tipizzati del motore 1.4.0.
- **La combinazione giusta rivela la soluzione.** Un pulsante «usa X su Y»
  compare appena si ha la cosa giusta nel posto giusto. Se pesa, si può offrirlo
  solo dopo che il testo l'ha suggerito (per esempio dopo aver esaminato la cosa
  scritta in maiuscolo).
- **`inventario` e `stato` non hanno pulsante**: le informazioni stanno a lato
  dello schermo, ma chi gioca solo coi pulsanti non ha il riepilogo a parole.

### Trailer
- **Senza GPU** un fotogramma a 2560×1440 costa 30–115 ms: la risoluzione
  adattiva lo compensa, ma non è stato provato su un computer davvero modesto.
- Le tele si potrebbero preparare in un **Worker con `OffscreenCanvas`**, per
  liberare del tutto il thread principale durante i loghi.
- I due **MP4 in `video/`** (non versionati) hanno ancora la grafica vecchia.

### Storia
- Le dichiarazioni doppie di `z2-piana.fav` («getta il cibo», «lancia cibo»…) si
  possono ridurre a una con i sinonimi del motore. Cambia l'impronta dei
  salvataggi: da fare insieme al lavoro sulla storia (sezione 2).

### Collaudo
- Oltre a `collaudo/pulsanti.py` (i finali raggiungibili solo coi pulsanti)
  manca una **mappa delle ramificazioni** generata dai `.fav`: è il primo passo
  della sezione 2.

## 2. Il progetto di ramificazione

### Da dove si parte (verificato nei sorgenti)
- Tredici personaggi in sette zone: Nunzio, Saverio, Iole, Vito, Rosaria,
  Pasquale, Concetta, Ciro, Peppe, Tore, Onofrio, Rocco, Cosimo.
- Cinque **fiducie** (Saverio, Iole, Vito, Rosaria, Onofrio), ma ognuna conta
  **solo nella sua zona**: nessuna scelta fatta con uno di loro torna più avanti.
- I **sei finali** dipendono da poche cose, tutte decise alla fine: lo stato di
  Cosimo (riconosciuto o abbattuto), se Peppe viaggia con te, se porti il
  giocattolo o l'anello. Il resto del viaggio pesa sull'acqua, sul cibo e sulla
  vita, non sull'esito.

In breve: il viaggio è ricco di incontri ma **lineare nelle conseguenze**. Il
lavoro è far sì che ciò che fai per strada ritorni.

### Il metodo, in quattro passi
1. **Mappa delle ramificazioni** — uno strumento (`strumenti/` o `collaudo/`)
   che legge il mondo compilato e disegna stati, variabili e finali, e da quali
   scelte dipende ciascuno. Dirà con i numeri quali personaggi non cambiano
   nulla. Si decide *dopo* averla vista, non prima.
2. **Conseguenze a distanza** — due o tre fili che attraversano le zone, scritti
   con stati e condizioni che FAVELLA già ha. Esempi da discutere:
   - ciò che hai fatto a Iole o a Saverio arriva al paese prima di te, e Rosaria
     ti accoglie di conseguenza;
   - Vito ricorda se l'hai ingannato, e al ritorno della voce lungo la statale
     qualcuno non ti fa più entrare;
   - Onofrio sa di Pasquale: le medicine date o tenute cambiano il suo lascito;
   - Cosimo al guado sa come hai viaggiato (Peppe, la violenza, i doni), e le
     sue prime parole cambiano.
3. **Varianti di testo per stato** — la stessa stanza, descritta in un altro
   modo se hai sete, se hai tradito qualcuno, se viaggi con Peppe. Costa poco e
   dà la sensazione di un mondo che risponde, senza moltiplicare i rami.
4. **Finali che raccolgono il viaggio** — non finali nuovi per forza: le sei
   chiusure possono citare ciò che il giocatore ha fatto lungo la strada (una
   riga per il pozzo di Saverio, una per la diga di Iole…).

### Vincoli
- **Ogni modifica ai `.fav` cambia l'impronta dei salvataggi**: si ricaricano
  rigiocando i comandi, ma possono arrivare in uno stato diverso, e il gioco lo
  dice. Per `sviluppo/VERSIONI.md` è una versione minor; se si ristruttura una
  zona o si riscrive il senso di un finale, è una major.
- Ogni ramo nuovo entra nei collaudi: un percorso in `collaudo/percorsi.py` per
  ogni finale, e `pulsanti.py` deve poterlo giocare anche senza tastiera.
- Tono e prosa restano quelli di `pre-produzione/`: niente epica, niente
  spiegazioni, le conseguenze si mostrano.

### A che punto è (30/09/2026)
- Il punto 1 è fatto: `strumenti/mappa-narrativa.py` scrive
  `sviluppo/mappa-narrativa.md`. Esito: 19 variabili su 21 restano nella zona in
  cui nascono; solo Peppe viaggia.
- I fili sono nel gioco dalla 1.5.0 ([`pre-produzione/06-ramificazione.md`](../pre-produzione/06-ramificazione.md)):
  il sangue e la generosità, la terza via al guado (il fucile posato, la veglia),
  la strada di Acquamorta che ricorda. Le conseguenze a distanza sono passate da 2 a 6.
- Prossimi fili possibili (§8 del documento): Vito umiliato dal bluff che lo
  racconta; Peppe che sa del sangue quando si unisce a te; che cosa mostrare a lato
  dello schermo, ora che le fiducie non sono più le sole a contare.
