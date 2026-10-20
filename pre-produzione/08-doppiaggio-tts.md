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
| Narratore + scelte del giocatore | Gemini 3.8 Flash TTS | Enzo | 12 blocchi, 532 parti |
| Servizio (suggerimenti, numeri) | Gemini 3.8 Flash TTS | Kira | 1 blocco, 120 parti usate (201 generate) |
| Nunzio, Saverio, Iole, Rocco, Peppe, Pasquale, Concetta, Onofrio, Cosimo | Gemini | voci di libreria non registrate | 1 blocco ciascuno |
| Imma, Rosaria, Tore, Vito | ElevenLabs Eleven v4 | Victoria, Valeria, Criss, Luigi | 1 blocco ciascuno, interi |
| Ciro | Gemini | voce di libreria non registrata | 1 blocco; la prima battuta sembrava spezzata: era un errore di TAGLIO (corretto), non dell'audio |
| Trailer | Gemini | Enzo, narrativo ed enfatico | 33 parti, 85 s (`doppiaggio/trailer.json`), generato e verificato il 20/10 |

Il registro di chi ha detto che cosa è `doppiaggio/voci-scelte.md`. I WAV grezzi e le parti tagliate stanno in `doppiaggio/master/` (fuori da git); i blocchi com'erano quando sono stati letti in `doppiaggio/generati/`.

**Come è fatto l'audio:** ogni *parte* è ciò che una voce dice senza interruzioni (una descrizione, una battuta, un suggerimento, una scelta). L'**id** di una parte è l'impronta (SHA-1, 8 caratteri) di voce + testo: se un testo del gioco cambia, cambia l'id e l'audio vecchio si riconosce come scaduto. Il manifest (`doppiaggio/manifest.json`) dice per ogni testo del gioco da quali parti si compone, e per i testi con numeri i pezzi per valore.

## 3. Che cosa resta da fare nel software

### 3.1 Il banco dell'audio
1. Scegliere le parti definitive: per ogni blocco generato, le clip di `master/clip/<blocco>/`; **non** usare le clip archiviate (`tore-gemini`, `vito-gemini`, e `ciro-gemini` se mai Ciro verrà rifatto) né le 81 scelte di riserva dell'audio di Kira (voce di servizio).
2. **Pareggiare il volume** voce per voce (Gemini ed ElevenLabs escono a livelli diversi) e togliere i silenzi in testa e in coda con precisione.
3. **Codificare in Opus** (ffmpeg, mono, circa 24–32 kbit/s): stimati 15–25 MB per circa 90 minuti, **un file per parte** (decisione 4).
4. Un indice `id → file, durata` (o si ricava dal manifest) caricato dall'app.

### 3.2 La riproduzione
1. **Da testo a parti.** Il motore FAVELLA (`motore/`, una copia che non si tocca) consegna al gioco il testo già composto, non la riga del `.fav`. Quindi l'app deve ritrovare le parti **dal testo stampato**: stesso spezzamento di `strumenti/doppiaggio.py` (parentesi → servizio; «caporali» → personaggio che parla, o narratore; a capo) e stessa normalizzazione (le MAIUSCOLE si abbassano), poi l'impronta. I testi statici si trovano con il manifest; per quelli dinamici servono regole (sotto).
2. **Chi parla.** Le battute tra «» in un dialogo sono del personaggio (la tabella `doppiaggio/attribuzioni.json` risolve i messaggi fuori dai dialoghi). Le scelte del giocatore (`l'opzione`) le legge il narratore.
3. **Coda e interruzione.** Le parti di un testo suonano in sequenza, con una pausa naturale fra l'una e l'altra; al primo tasto la coda si svuota. Un comando per **riascoltare** l'ultimo testo.
4. **Le scelte di un dialogo.** Quando compare il menu suona la battuta (personaggio); una scelta la legge il narratore **quando il mouse le passa sopra** o quando prende il fuoco da tastiera (decisione 5), interrompendo ciò che suonava.
5. **Le impostazioni:** modalità (voce recitata / lettore di schermo: le due scelte da Simone), volume (a zero è il silenzio); salvate nel browser. «Riduci movimento» non serve finché la voce non ha animazioni.
6. **Il diario `role="log"`:** in voce recitata non deve annunciare.

### 3.3 I testi con numeri e quelli che si compongono
- **Scorte:** «Hai [acqua] d'acqua e [cibo] di cibo.» → i pezzi «Hai N d'acqua,» / «e M di cibo.» / «Ora hai N d'acqua.» / «Ora hai N di cibo.» (N da 0 a 20 per l'acqua, 0 a 12 per il cibo). Già registrati da Kira; l'app li ricompone dalle cifre stampate (fase 3).
- **`[i fili del viaggio]`** (finali): dieci frasi indipendenti, ciascuna con la sua condizione; il motore le concatena. L'app deve riconoscerle dentro il paragrafo e suonarle in ordine.
- **La riga di `STATO`** («Vita [vita]/10 · Sete … · Cibo …»): **non registrata e resta muta** (decisione 2).
- **Testi dell'interfaccia** (guida, avviso, conferme, menu): fuori da questo lavoro; in voce recitata li legge il lettore di schermo o restano muti.

### 3.4 Il trailer
- Il trailer (88,5 s) ha una scaletta fissa (`app/src/trailer/scaletta.ts`). La voce di Enzo si aggiunge **senza cambiare niente di ciò che c'è**: durate, testi, musica, ordine, impronta dei salvataggi e `intro.mp3` non si toccano; nessun clic per saltare, si salta con Esc.
- `doppiaggio/trailer.json` ha le 33 parti con la **finestra** in cui ciascuna deve cadere. «tuo FRATELLO.» deve cadere sul colpo grave a 64,0 s; il titolo a 82,3 s.
- Servono: il suono della voce programmato sull'orologio del trailer (`audio.ts`), un abbassamento della musica sotto la voce, e **l'esportatore** (`strumenti/esporta-trailer.cjs`, `trailer-rumori.cjs`) aggiornato perché i video di confronto abbiano la voce.
- Le frasi più lunghe della loro finestra (le cinque regole sono da 1,84 s l'una) si accorciano con un leggero aumento di velocità (poche percentuali) o si fanno cominciare un poco prima.

### 3.5 La verifica
- Collaudo: ogni testo che deve avere voce ha un audio (o è dichiarato muto); nessun id scaduto; ogni file ha durata e volume sensati.
- L'autoverifica dell'app carica l'indice e una parte per voce.
- Il peso del pacchetto e la CI (`desktop/`, `app/public`): i 15–25 MB in più; la versione web di GitHub Pages ha la voce anche lei (decisione 3).
- Collaudo a orecchio con Simone: le partite intere con la voce, i toni, l'ordine delle parti.

### 3.6 Versione, documenti, licenze
- Una funzione nuova: **MINOR** (1.19.0 o successiva), CHANGELOG, voce di diario, README («Voci: Google Gemini TTS, ElevenLabs»).
- **Diritti** (da chiudere prima di rilasciare): Google «non rivendica la proprietà» dell'output, che non è esclusivo, e ogni clip ha SynthID (inaudibile); per ElevenLabs contano le condizioni del **piano** usato (attribuzione? uso commerciale?) e le regole delle voci della libreria (Valeria, Criss e Luigi sono cloni professionali di altri). Il gioco è CC BY-SA e libero: va verificata la compatibilità e scritta l'attribuzione. **Esito per ElevenLabs:** i quattro personaggi sono del piano gratuito, non compatibile: si rifanno prima del rilascio (decisione 6).

## 4. Le decisioni (chiuse da Simone il 20/10/2026, sera)
1. **Voci miste:** si parte con l'audio che c'è (10 personaggi Gemini, 4 ElevenLabs) e Simone lo giudica a orecchio in gioco; chi stona si rifà, da solo.
2. **La riga di `STATO`:** **resta muta.** Nessuna generazione in più; in voce recitata il comando STATO si legge solo a schermo.
3. **La versione web:** **con la voce.** È la stessa build del desktop; ogni parte si scarica solo quando suona.
4. **Un file Opus per parte**, caricato quando serve (niente archivio).
5. **Le scelte del giocatore:** niente lettura automatica dopo la battuta e niente segnale. **Il narratore legge una scelta quando il mouse le passa sopra** (e, per chi usa la tastiera, quando la scelta prende il fuoco); la voce che stava parlando si ferma.
6. **ElevenLabs:** Imma, Rosaria, Tore e Vito sono stati generati sul **piano gratuito**, che non concede l'uso commerciale e chiede l'attribuzione «elevenlabs.io»; ciò che si genera fuori da un piano a pagamento non diventa commerciale nemmeno pagando dopo (pagina ufficiale «Can I publish the content I generate on the platform?», letta il 20/10/2026). Il gioco è CC BY-SA, che permette usi commerciali: **quei quattro vanno rifatti prima del rilascio** (con Gemini, o con ElevenLabs su un piano a pagamento: si decide più avanti). **Nel frattempo il loro audio sta solo in locale**: sul PC di Simone suona in gioco (per giudicarlo), ma non va su GitHub né nei pacchetti, dove quelle battute restano mute.

## 5. Ordine di lavoro (le fasi approvate da Simone il 20/10/2026)
Si fa una fase per volta; a fine fase si mostra il risultato e si aspetta il via libera.

0. ~~Chiudere la produzione~~ **fatto il 20/10/2026** (28 blocchi su 28 generati, tagliati e verificati; resta da ascoltare «Bevi.» di Kira).
1. ~~**Il banco dell'audio** (3.1) e un collaudo che lo verifica~~ **fatto il 20/10/2026:** `strumenti/doppiaggio-banco.py` → `app/public/voce/` (un `<id>.opus` per parte e `indice.json`), resoconto `doppiaggio/banco.json`, collaudo `collaudo/doppiaggio.py` (anche in CI). Ogni blocco a −23 LUFS (EBU R128: a −18 quasi tutte le parti del narratore avrebbero toccato il tetto dei picchi), silenzi tolti (0,04 s prima, 0,08 s dopo), Opus mono 32 kbit/s, picchi decodificati sotto −0,3 dBTP. **809 parti nel repository (61,2 minuti, 13,7 MB)**, 69 solo in locale (i quattro ElevenLabs, 4,5 minuti). I minuti veri sono meno dei 90 stimati: i silenzi fra le parti non ci sono più (le pause le metterà il gioco).
2. ~~**La voce nel gioco** (3.2)~~ **fatto il 20/10/2026 (1.20.0):** `app/src/gioco/parti.ts` (dal testo stampato alle parti: stesso spezzamento e stesse maiuscole di `doppiaggio.py`; una riga che non si trova intera si cerca come fila di parti note ai confini di frase; nelle righe di prosa le «» si provano prima come del narratore, poi di chi parla), `voce.ts` (fila Web Audio, pausa 0,3 s fra frasi e 0,55 s fra righe, arresto al primo tasto che non sia un tasto di modifica, F2 riascolta, volume), `ImpostazioniVoce.tsx` (pannello «voce»: **due modi**, voce recitata o lettore di schermo — il terzo, «nessuna», era uguale al lettore per chi non ne usa uno: tolto). In voce recitata il diario ha `aria-live="off"` e un'area nascosta annuncia al lettore di schermo ciò che la voce non dice. Il «riduci movimento» non serve: la voce non ha animazioni. Collaudo: lungo i percorsi 1.987 righe e 392 testi dei `.fav`, ogni pezzo ha la sua parte (tranne i numeri delle scorte nelle battute: fase 3).
3. ~~**I testi che si compongono** (3.3)~~ **fatto il 20/10/2026 (1.21.0):** in `parti.ts` un testo di servizio con cifre si porta a lettere e si cerca intero o nei due pezzi «…,» + «e …» (come `scomponi_dinamico`); i fili del viaggio li ritrova già la fila di parti ai confini di frase. Il collaudo prova 1.976 combinazioni di numeri e i 10 fili (uno per uno e tutti insieme): le 845 parti del gioco si ritrovano tutte da un testo stampato. Limite: oltre i valori registrati (cibo oltre 12, possibile solo barattando molto al mercato) il pezzo non ha voce e va al lettore di schermo.
4. ~~**Il trailer con la voce di Enzo** (3.4)~~ **fatto il 20/10/2026 (1.22.0), approvato da Simone all'ascolto («capolavoro»):** una traccia sola di 88,5 s (`strumenti/doppiaggio-trailer.py` → `app/public/voce/trailer.opus` e `trailer.json`): pause interne accorciate a 0,25 s, al massimo +10% di velocità senza cambiare l'altezza (le cinque regole tutte al 10%), «tuo FRATELLO.» a 64,0 e il titolo a 82,3 esatti, voce a −18 LUFS; nel trailer (`audio.ts`) la traccia segue l'orologio della musica e la musica scende a −8 dB mentre Enzo parla. **Decisione di Simone:** nel finale Enzo legge le cinque regole; i quattro numeri e «Un'avventura testuale…» restano solo scritti (non c'era tempo per tutto: 21 s di voce in 14). Costo: decodifica 144 ms fuori dal filo principale, 16 MB; il disegno non cambia. L'esportatore dei video ha la colonna vera (`strumenti/trailer-mix.cjs`).
5. **Le verifiche** (3.5): tutti i collaudi, una partita intera con la voce, il peso, la CI.
6. **I documenti** (3.6): CHANGELOG, README (voci e diritti), diario. Il rilascio solo su ordine di Simone, e non prima di aver rifatto i quattro personaggi ElevenLabs.
