# IL VIAGGIATORE — Il doppiaggio

> Pre-produzione · Strato 8 · **bozza del 20/10/2026**, scritta a produzione audio quasi finita.
> Dice che cosa è stato deciso e prodotto, e **che cosa resta da fare nel software** (l'app).
> Le decisioni aperte sono in fondo: si chiudono con Simone prima di scrivere codice.
> Il lavoro di produzione (testi, blocchi, voci, tagli) sta in `doppiaggio/` e in `strumenti/doppiaggio*.py`.

---

## 1. Che cosa si è deciso

- **Scopo:** accessibilità, e un audiogioco recitato («audiolibro interattivo», versione talkie).
- **Che cosa ha una voce:** la narrazione, le battute dei 14 personaggi, i suggerimenti tra parentesi, i numeri delle scorte, le **scelte di dialogo del giocatore** (le legge il narratore: il giocatore non ha una voce sua) e il **trailer** d'apertura (Enzo, in modo narrativo ed enfatico).
- **Come si produce:** audio generato in anticipo e distribuito **nel pacchetto**, ascoltato senza internet. Una voce per volta, col minor numero di generazioni (ogni generazione cambia un poco la voce).
- **Due modalità, non due voci insieme:** *voce recitata* oppure *lettore di schermo*. Con la voce recitata il diario (`role="log"`) non deve più annunciare, per non avere il doppio audio.
- **Interruzione:** la voce si ferma al primo tasto premuto, come in un talkie; il testo resta sullo schermo.
- Il gioco è desktop a schermo intero: niente telefono né touch come obiettivo.

## 2. Che cosa esiste (20/10/2026)

| Voce | Motore | Voce scelta | Audio |
|---|---|---|---|
| Narratore + scelte del giocatore | Gemini 3.8 Flash TTS | Enzo | 11 blocchi, 531 parti |
| Servizio (suggerimenti, numeri) | Gemini 3.8 Flash TTS | Kira | 1 blocco, 120 parti usate (201 generate) |
| Nunzio, Saverio, Iole, Rocco, Peppe, Pasquale, Concetta, Onofrio, Cosimo | Gemini | voci di libreria non registrate | 1 blocco ciascuno |
| Imma, Rosaria, Tore, Vito | ElevenLabs Eleven v4 | Victoria, Valeria, Criss, Luigi | 1 blocco ciascuno, interi |
| Ciro | Gemini (da rifare con ElevenLabs) | — | una parola spezzata all'inizio della prima battuta |
| Trailer | Gemini, Enzo | Enzo, narrativo ed enfatico | da generare (33 parti, `doppiaggio/trailer.json`) |

Il registro di chi ha detto che cosa è `doppiaggio/voci-scelte.md`. I WAV grezzi e le parti tagliate stanno in `doppiaggio/master/` (fuori da git); i blocchi com'erano quando sono stati letti in `doppiaggio/generati/`.

**Come è fatto l'audio:** ogni *parte* è ciò che una voce dice senza interruzioni (una descrizione, una battuta, un suggerimento, una scelta). L'**id** di una parte è l'impronta (SHA-1, 8 caratteri) di voce + testo: se un testo del gioco cambia, cambia l'id e l'audio vecchio si riconosce come scaduto. Il manifest (`doppiaggio/manifest.json`) dice per ogni testo del gioco da quali parti si compone, e per i testi con numeri i pezzi per valore.

## 3. Che cosa resta da fare nel software

### 3.1 Il banco dell'audio
1. Scegliere le parti definitive: per ogni blocco generato, le clip di `master/clip/<blocco>/`; **non** usare le clip archiviate (`tore-gemini`, `vito-gemini`, e `ciro-gemini` quando Ciro sarà rifatto) né le 81 scelte di riserva dell'audio di Kira (voce di servizio).
2. **Pareggiare il volume** voce per voce (Gemini ed ElevenLabs escono a livelli diversi) e togliere i silenzi in testa e in coda con precisione.
3. **Codificare in Opus** (ffmpeg, mono, circa 24–32 kbit/s): stimati 15–25 MB per circa 90 minuti. Un file per parte (circa 1.100) o un solo archivio con indice: da decidere col costo di caricamento.
4. Un indice `id → file, durata` (o si ricava dal manifest) caricato dall'app.

### 3.2 La riproduzione
1. **Da testo a parti.** Il motore FAVELLA (`motore/`, una copia che non si tocca) consegna al gioco il testo già composto, non la riga del `.fav`. Quindi l'app deve ritrovare le parti **dal testo stampato**: stesso spezzamento di `strumenti/doppiaggio.py` (parentesi → servizio; «caporali» → personaggio che parla, o narratore; a capo) e stessa normalizzazione (le MAIUSCOLE si abbassano), poi l'impronta. I testi statici si trovano con il manifest; per quelli dinamici servono regole (sotto).
2. **Chi parla.** Le battute tra «» in un dialogo sono del personaggio (la tabella `doppiaggio/attribuzioni.json` risolve i messaggi fuori dai dialoghi). Le scelte del giocatore (`l'opzione`) le legge il narratore.
3. **Coda e interruzione.** Le parti di un testo suonano in sequenza, con una pausa naturale fra l'una e l'altra; al primo tasto la coda si svuota. Un comando per **riascoltare** l'ultimo testo.
4. **Le scelte di un dialogo.** Quando compare il menu: prima la battuta (personaggio), poi le scelte lette dal narratore; serve un segnale breve prima delle scelte perché non si confondano con la narrazione.
5. **Le impostazioni:** modalità (voce recitata / lettore di schermo / nessuna), volume, silenzio, e «riduci movimento» per le animazioni che accompagnano la voce; salvate con le altre impostazioni.
6. **Il diario `role="log"`:** in voce recitata non deve annunciare.

### 3.3 I testi con numeri e quelli che si compongono
- **Scorte:** «Hai [acqua] d'acqua e [cibo] di cibo.» → i pezzi «Hai N d'acqua,» / «e M di cibo.» / «Ora hai N d'acqua.» / «Ora hai N di cibo.» (N da 0 a 20 per l'acqua, 0 a 12 per il cibo: sono stime, da verificare con le partite). Già registrati da Kira.
- **`[i fili del viaggio]`** (finali): dieci frasi indipendenti, ciascuna con la sua condizione; il motore le concatena. L'app deve riconoscerle dentro il paragrafo e suonarle in ordine.
- **La riga di `STATO`** («Vita [vita]/10 · Sete … · Cibo …»): **non registrata**. Decidere se registrarla (Kira, una generazione a parte) o lasciarla muta.
- **Testi dell'interfaccia** (guida, avviso, conferme, menu): fuori da questo lavoro; in voce recitata li legge il lettore di schermo o restano muti.

### 3.4 Il trailer
- Il trailer (88,5 s) ha una scaletta fissa (`app/src/trailer/scaletta.ts`). La voce di Enzo si aggiunge **senza cambiare niente di ciò che c'è**: durate, testi, musica, ordine, impronta dei salvataggi e `intro.mp3` non si toccano; nessun clic per saltare, si salta con Esc.
- `doppiaggio/trailer.json` ha le 33 parti con la **finestra** in cui ciascuna deve cadere. «tuo FRATELLO.» deve cadere sul colpo grave a 64,0 s; il titolo a 82,3 s.
- Servono: il suono della voce programmato sull'orologio del trailer (`audio.ts`), un abbassamento della musica sotto la voce, e **l'esportatore** (`strumenti/esporta-trailer.cjs`, `trailer-rumori.cjs`) aggiornato perché i video di confronto abbiano la voce.
- Le frasi più lunghe della loro finestra (le cinque regole sono da 1,84 s l'una) si accorciano con un leggero aumento di velocità (poche percentuali) o si fanno cominciare un poco prima.

### 3.5 La verifica
- Collaudo: ogni testo che deve avere voce ha un audio (o è dichiarato muto); nessun id scaduto; ogni file ha durata e volume sensati.
- L'autoverifica dell'app carica l'indice e una parte per voce.
- Il peso del pacchetto e la CI (`desktop/`, `app/public`): i 15–25 MB in più; la versione web di GitHub Pages potrebbe restare senza voce.
- Collaudo a orecchio con Simone: le partite intere con la voce, i toni, l'ordine delle parti.

### 3.6 Versione, documenti, licenze
- Una funzione nuova: **MINOR** (1.19.0 o successiva), CHANGELOG, voce di diario, README («Voci: Google Gemini TTS, ElevenLabs»).
- **Diritti** (da chiudere prima di rilasciare): Google «non rivendica la proprietà» dell'output, che non è esclusivo, e ogni clip ha SynthID (inaudibile); per ElevenLabs contano le condizioni del **piano** usato (attribuzione? uso commerciale?) e le regole delle voci della libreria (Valeria, Criss e Luigi sono cloni professionali di altri). Il gioco è CC BY-SA e libero: va verificata la compatibilità e scritta l'attribuzione.

## 4. Decisioni ancora aperte
1. **Gemini per alcuni personaggi e ElevenLabs per altri, o ElevenLabs per tutti?** Oggi 9 sono Gemini e 4 ElevenLabs (più Ciro, in arrivo): da risentire in gioco.
2. **La riga di `STATO`:** registrarla o no.
3. **La versione web:** con o senza voce.
4. **Un file per parte o un archivio:** secondo i tempi di caricamento.
5. **Il segnale prima delle scelte** del giocatore (che suono, o se bastano la pausa e la voce).
6. **Licenza dell'audio di ElevenLabs** sul piano di Simone.

## 5. Ordine di lavoro
1. Chiudere la produzione: Ciro (ElevenLabs), «L'ho letta.» e il trailer (Gemini, Enzo).
2. Il banco dell'audio (3.1) e un collaudo che lo verifica.
3. La riproduzione dei testi statici nel gioco e le impostazioni (3.2), con la voce che si ferma al tasto.
4. I testi che si compongono (3.3).
5. Il trailer con la voce (3.4), con la misura del costo come per le altre fasi del trailer.
6. Rilascio.
