---
data: 2026-10-22
ora: "09:15"
titolo: "La mappa, le tappe e le due sole modalità dei comandi"
tipo: sessione
versione: 1.37.0
---

# La mappa, le tappe e le due sole modalità dei comandi

## In breve
Simone, giocando la 1.36.0, ha chiesto due cose: togliere «pulsanti e parole» e fare della mappa una meccanica, con
un pulsante che compare quando la si prende e che mostra dove si è. Fatte nella 1.37.0. Poi, a lavoro avviato, ha
corretto la rotta alla mappa: le tappe del viaggio ci devono essere già, altrimenti trovarla non serve a niente; i percorsi
e i luoghi vicini nascono giocando.

## Contesto
La mappa del gioco era solo la chiave del margine di Acquaviva («Senza una mappa, là fuori è solo perdersi») e la sua
descrizione parla di «strade segnate a penna»: l'idea stava già nel racconto. Prima di fare qualcosa Simone ha voluto un
parere; il questionario (22/10) ha fissato tre cose: la mappa si riempie viaggiando; «mappa» scritta o il tasto M valgono
anche nell'avventura testuale; chi aveva «pulsanti e parole» (quasi tutti: era il valore di base) passa a «pulsanti».

## Lavoro fatto
- **Il collaudo che regge la scelta dei due modi** (prima di toccare le opzioni, perché senza «pulsanti e parole» ciò
  che non ha un pulsante non si può più scrivere): `collaudo/pulsanti.py` giocava già i sei finali coi soli pulsanti;
  ora gioca anche le tre morti e le due partite al casello di `trofei.py` (il bluff, Vito a terra), ciascuna con
  la stessa fine, la stessa bisaccia e gli stessi contatori della partita a comandi scritti, e con `--esplora` un
  giocatore a caso che ha solo i pulsanti (30 partite: 37/39 luoghi, 26/27 oggetti, 44/63 dialoghi, contro 36/39,
  23/27, 37/63 dell'esploratore a comandi scritti con lo stesso numero di partite). Un solo caso era diverso: dopo che
  Vito è a terra il pulsante «Attacca Vito» sparisce (direbbe soltanto «Vito è a terra»), e il collaudo scritto lo
  ripeteva quattro volte; non è un buco. Ogni verbo con cui la storia ha regole (attacca, attingi, bevi, curati,
  getta cibo, lascia, mangia, minaccia, prendi, raddrizza, spara, stato, usa, vai) ha il suo pulsante o è sinonimo
  di uno che ce l'ha.
- **Il ponte** (`ponte.py`): `fav_mappa()` dà la carta di tutti i luoghi, col posto di ciascuno su una griglia (nord in
  alto) ricavato dalle uscite cardinali del motore a partire dal primo luogo: 39 luoghi, 39 strade, 14 × 12, nessuna
  sovrapposizione né contraddizione, quindi niente mappa disegnata a mano; e `visitate` nello stato (il motore tiene
  `stanze_visitate` da sempre, ANNULLA la disfa con il resto e un caricamento, che rigioca i comandi, la ritrova: nessun nuovo
  formato di salvataggio, nessun testo dei `.fav` cambiato, niente da rifare nel doppiaggio).
- **`gioco/foglio.ts`** (nuovo, funzioni pure come `azioni.ts`): che cosa va sul foglio e dove vanno i nomi. Il foglio è sempre
  tutta la carta, in unità che a misura piena sono pixel; i nomi si piazzano da soli, il primo lato (sopra, sotto, destra,
  sinistra) dove non toccano altri nomi né altri segni. `conflitti()` ripete il controllo per i collaudi.
- **`gioco/Mappa.tsx`**, `mappa.css`: il pannello. Un foglio di carta (grana, bordo scuro, pieghe in tre e in due, rosa dei venti),
  inchiostro, strade con un'increspatura a penna (`feDisplacementMap`), macchie di colore per zona (quelle dei paesaggi), il
  luogo dove sei in rosso con un alone che respira (fermo col movimento ridotto), i luoghi che da lì si vedono in
  tenue col nome. Con «contrasto alto» carta bianca e inchiostro nero, senza macchie né grana. Una lista per il lettore di
  schermo (dove sei, le tappe, dove sei stato, che cosa si vede).
- **Il pulsante «mappa M»** nella riga di servizio della plancia (`Plancia.tsx`), solo con la mappa in bisaccia; il tasto M;
  «mappa» scritta nella riga (come «opzioni» e «pausa»: non diventa un turno e non conta fra i comandi scritti delle sfide). Un
  cartiglio dice che c'è, una volta, quando la si prende; non quando si riprende una partita che già la porta.
- **Le due modalità**: `ModoComandi` è `"pulsanti" | "parole"`; il valore di base è «pulsanti»; ogni altro valore salvato, «entrambi» compreso,
  si legge come «pulsanti» (`pulisci` ci arriva già dal suo controllo sui valori ammessi). Etichette «pulsanti» e «avventura testuale».
  La guida «Come si gioca» ha una scheda «Tocca» e una «Scrivi», ciascuna con l'invito a provare l'altro modo nelle opzioni, e dice
  della mappa. Spariscono i rami di `ViaggiatorePlayer.tsx` che servivano al caso misto (i segnaposto della riga, soprattutto).
- **Dopo la correzione di Simone: le tappe.** Il foglio ha fin dal primo giorno otto tappe, ciascuna nel luogo centrale della sua zona
  (piazza, masseria, conca, casello, piazzetta, pianoro, guado: «un grappolo di luoghi con un centro», `03-mappa.md`) e Acquamorta sulla
  soglia, con il nome della zona in maiuscoletto e un anello; non ci sono le strade fra loro. Una tappa è «raggiunta» appena si
  entra nella sua zona (non solo nel suo luogo centrale: ci si entra da un luogo d'ingresso). Non serve più l'inquadratura
  che si stringeva sui luoghi scoperti (c'era per la mappa vuota dell'inizio): ora il foglio è sempre tutto, e le macchie delle tappe
  lontane sono appena accennate. Dove il luogo centrale ha lo stesso nome della sua tappa («Il guado») il nome si scrive una volta.
- **L'apertura**: la carta si spiega come una piegata in tre (tre strisce dello stesso disegno, quelle ai lati incernierate sul
  bordo di quella di mezzo, prospettiva, ombra che si schiarisce) in tre quarti di secondo, e si richiude in un attimo; con il
  movimento ridotto compare e basta. Il suono (`gioco/suonoCarta.ts`) è sintetizzato, come quello dei trofei: un soffio d'aria,
  due timbri di scricchiolii (rumore filtrato in scatti brevi e irregolari, più fitti quando le pieghe cedono) e un colpetto sordo
  a foglio disteso; in chiusura una versione breve. Sta sul canale degli effetti del bus sonoro.

## Decisioni
- **Il pulsante c'è finché la mappa è in bisaccia** (mia, dichiarata a Simone prima di cominciare): se la lasci, il pulsante se ne va con lei e torna
  se la riprendi; ciò che hai visitato resta in ogni caso (viene dallo stato del mondo, non dalla mappa). (I percorsi di collaudo
  la lasciano alla conca per far posto in bisaccia: chi gioca per arrivare presto resta senza pulsante, e non è un difetto.)
- **Le tappe sono una per zona, nel luogo centrale** (mia): il documento di pre-produzione lo prevede già; Acquamorta sulla soglia
  perché la soglia è l'ultimo luogo e lì si apre il finale. Le tappe vivono in `foglio.ts` (`TAPPE`), con i nomi uguali a quelli di `ZONE_THEME`: il
  collaudo controlla che non si discostino e che ogni luogo centrale stia nella zona giusta secondo i `.fav`.
- **Niente strade fra le tappe** (Simone): i percorsi si fanno giocando; la mappa dice dove si va, non come.
- **Il suono è sintetizzato, non registrato** — perché: nessun file nuovo, nessuna licenza da dichiarare, e si adatta al volume degli effetti
  e al mono già esistenti. Misurato in un contesto offline: picco circa −20 dBFS (il suono dei trofei sta a −24).

## Verifiche
- `collaudo/mappa.py` (nuovo): 11.868 controlli lungo tre viaggi interi, passo per passo (il percorso A, quello di Peppe che chiede del
  sangue, una morte per sete) e sul foglio con tutti i 39 luoghi visitati; provato che sa fallire (con i passi della carta
  stretti, 252 controlli cadono). `collaudo/interfaccia.py`: 13 controlli nuovi sulla carta e sui luoghi visitati (anche
  ANNULLA e il caricamento). `collaudo/pulsanti.py`: 17 partite coi soli pulsanti. `app/scripts/opzioni-node.mjs`: «entrambi» e i
  valori guasti tornano a «pulsanti».
- Tutta la batteria del CI (21 passi) passa; due passi, `fili.py` e `conferme.py`, falliscono in locale soltanto con l'uscita
  reindirizzata su Windows (la console cp1252 non scrive «→»), e passano con `PYTHONIOENCODING=utf-8`; in CI (Linux) non succede.
- Nel browser integrato, dal vivo: il pulsante compare con la mappa e non prima; M apre e richiude (una prima versione la
  riapriva subito, perché il gioco, che ascolta M più su, vedeva lo stesso evento: ora l'evento si ferma nel pannello); Esc
  chiude la mappa e non apre la pausa; «mappa» scritta nella riga apre il foglio e non diventa un turno; «Continua il viaggio» ritrova
  i luoghi visitati; il contrasto alto; l'apertura a metà (pieghe, ombre) e a fine corsa.

## Questioni aperte
- **Il suono è da sentire.** Non posso ascoltarlo da qui: l'ho misurato (livello, durata, quanti scatti) ma se «sa di carta» lo dice solo l'orecchio
  di Simone, nel desktop vero. Se è troppo debole o troppo secco si regola in `suonoCarta.ts` (`PICCO`, i due timbri).
- **L'animazione è da vedere a velocità vera**: nel pannello del browser (che scatta quando è nascosto) l'ho guardata ferma a
  metà e a fine corsa, non in corsa.
- Una partita già cominciata con «pulsanti e parole» riparte in «pulsanti»: la riga da scrivere non c'è più, e chi la voleva
  la trova nelle opzioni come «avventura testuale».
