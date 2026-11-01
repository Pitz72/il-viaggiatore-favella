# IL VIAGGIATORE — Il doppiaggio

> Pre-produzione · Strato 8 · scritto il 20/10/2026 a produzione audio quasi finita, **eseguito la sera
> stesso** (versioni 1.19.0 – 1.23.0), una fase per volta con il via libera di Simone.
> Dice che cosa è stato deciso e prodotto e che cosa si è fatto nel software (l'app); le decisioni di
> Simone sono nella sezione 4, le fasi nella 5. Il doppiaggio è tutto nel gioco, anche Imma, Rosaria,
> Tore e Vito (fuori dalla licenza libera: decisione 6). Il rilascio, solo su ordine di Simone.
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
   **Aggiornamento (20/10/2026, più tardi): Simone sceglie di distribuirli lo stesso, accettando il rischio** («è un gioco sperimentale»). Le tre strade erano: rifarli con Gemini, rifarli con ElevenLabs a pagamento (un mese basta: ciò che si genera mentre si paga resta commerciale per sempre), o distribuire quelli di oggi **esclusi dalla licenza libera**, come i loghi. Scelta la terza: stanno in `app/public/voce/elevenlabs/` (nel repository, nei pacchetti e nel web), con un indice che dice la licenza; `LICENSE-CONTENUTI.md` li esclude dalla CC BY-SA («solo uso non commerciale, elevenlabs.io; un'opera derivata o un uso commerciale li toglie o li sostituisce»); il gioco lo dice nel cartello delle licenze e dei crediti. Il rischio: i termini di ElevenLabs chiedono «elevenlabs.io» nel titolo e vietano l'uso commerciale del piano gratuito; un gioco gratuito non è commerciale, ma la licenza CC BY-SA del resto permette ad altri di venderlo (per questo l'esclusione). Non è una consulenza legale.

## 5. Ordine di lavoro (le fasi approvate da Simone il 20/10/2026)
Si fa una fase per volta; a fine fase si mostra il risultato e si aspetta il via libera.

0. ~~Chiudere la produzione~~ **fatto il 20/10/2026** (28 blocchi su 28 generati, tagliati e verificati; resta da ascoltare «Bevi.» di Kira).
1. ~~**Il banco dell'audio** (3.1) e un collaudo che lo verifica~~ **fatto il 20/10/2026:** `strumenti/doppiaggio-banco.py` → `app/public/voce/` (un `<id>.opus` per parte e `indice.json`), resoconto `doppiaggio/banco.json`, collaudo `collaudo/doppiaggio.py` (anche in CI). Ogni blocco a −23 LUFS (EBU R128: a −18 quasi tutte le parti del narratore avrebbero toccato il tetto dei picchi), silenzi tolti (0,04 s prima, 0,08 s dopo), Opus mono 32 kbit/s, picchi decodificati sotto −0,3 dBTP. **809 parti nel repository (61,2 minuti, 13,7 MB)**, 69 solo in locale (i quattro ElevenLabs, 4,5 minuti). I minuti veri sono meno dei 90 stimati: i silenzi fra le parti non ci sono più (le pause le metterà il gioco).
2. ~~**La voce nel gioco** (3.2)~~ **fatto il 20/10/2026 (1.20.0):** `app/src/gioco/parti.ts` (dal testo stampato alle parti: stesso spezzamento e stesse maiuscole di `doppiaggio.py`; una riga che non si trova intera si cerca come fila di parti note ai confini di frase; nelle righe di prosa le «» si provano prima come del narratore, poi di chi parla), `voce.ts` (fila Web Audio, pausa 0,3 s fra frasi e 0,55 s fra righe, arresto al primo tasto che non sia un tasto di modifica, F2 riascolta, volume), `ImpostazioniVoce.tsx` (pannello «voce»: **due modi**, voce recitata o lettore di schermo — il terzo, «nessuna», era uguale al lettore per chi non ne usa uno: tolto). In voce recitata il diario ha `aria-live="off"` e un'area nascosta annuncia al lettore di schermo ciò che la voce non dice. Il «riduci movimento» non serve: la voce non ha animazioni. Collaudo: lungo i percorsi 1.987 righe e 392 testi dei `.fav`, ogni pezzo ha la sua parte (tranne i numeri delle scorte nelle battute: fase 3).
3. ~~**I testi che si compongono** (3.3)~~ **fatto il 20/10/2026 (1.21.0):** in `parti.ts` un testo di servizio con cifre si porta a lettere e si cerca intero o nei due pezzi «…,» + «e …» (come `scomponi_dinamico`); i fili del viaggio li ritrova già la fila di parti ai confini di frase. Il collaudo prova 1.976 combinazioni di numeri e i 10 fili (uno per uno e tutti insieme): le 845 parti del gioco si ritrovano tutte da un testo stampato. Limite: oltre i valori registrati (cibo oltre 12, possibile solo barattando molto al mercato) il pezzo non ha voce e va al lettore di schermo.
4. ~~**Il trailer con la voce di Enzo** (3.4)~~ **fatto il 20/10/2026 (1.22.0), approvato da Simone all'ascolto («capolavoro»):** una traccia sola di 88,5 s (`strumenti/doppiaggio-trailer.py` → `app/public/voce/trailer.opus` e `trailer.json`): pause interne accorciate a 0,25 s, al massimo +10% di velocità senza cambiare l'altezza (le cinque regole tutte al 10%), «tuo FRATELLO.» a 64,0 e il titolo a 82,3 esatti, voce a −18 LUFS; nel trailer (`audio.ts`) la traccia segue l'orologio della musica e la musica scende a −8 dB mentre Enzo parla. **Decisione di Simone:** nel finale Enzo legge le cinque regole; i quattro numeri e «Un'avventura testuale…» restano solo scritti (non c'era tempo per tutto: 21 s di voce in 14). Costo: decodifica 144 ms fuori dal filo principale, 16 MB; il disegno non cambia. L'esportatore dei video ha la colonna vera (`strumenti/trailer-mix.cjs`).
5. ~~**Le verifiche** (3.5)~~ **fatto il 20/10/2026 (1.22.1):** l'autoverifica del pacchetto prova la voce (indice, una parte per ognuna delle 12 voci del pacchetto, il testo d'avvio, la traccia del trailer) e passa; tutti i collaudi e la CI verdi a ogni fase; installatore Windows 128,5 MB (114 nella 1.18.2: +14,5 MB); una partita intera (percorso A, 151 turni) ha circa 30 minuti di voce, 11,7 s a turno in mediana, il più lungo 61 s (l'arrivo, con i fili del viaggio). L'ascolto l'ha fatto Simone nel gioco desktop.
6. ~~**I documenti** (3.6)~~ **fatto il 20/10/2026:** README (la voce, i tasti, le voci e i loro diritti, i dodici collaudi), `LICENSE-CONTENUTI.md` (le voci del doppiaggio sono contenuti CC BY-SA come i testi che leggono), le guide di `doppiaggio/`, `strumenti/` e `collaudo/`, il foglio dei tempi del trailer, il CHANGELOG e il diario a ogni fase.
7. ~~**I quattro di ElevenLabs nel gioco**~~ **fatto il 20/10/2026 (1.23.0):** distribuiti fuori dalla licenza libera (decisione 6, aggiornamento); in più, su richiesta di Simone, il **cartello delle licenze e dei crediti** dopo i loghi e prima dell'avviso (`app/src/components/Crediti.tsx`), e il README rivisto.
8. **Il rilascio:** solo su ordine di Simone. Se un giorno si vuole togliere il rischio: rifare i quattro con Gemini o con ElevenLabs a pagamento, tagliarli (`doppiaggio-taglia.py --controlla`), toglierli da `A_PARTE` in `strumenti/doppiaggio-banco.py`, rifare il banco e aggiornare licenze e cartello.

## 6. La voce inglese del narratore (31 ottobre – 1 novembre 2026)

Dopo la 1.40.0 (il gioco in inglese) la voce recitata in inglese si fa per gradi: **prima il narratore** (Enzo, inglese britannico),
**poi la voce di servizio** (Kira, il 1° novembre 2026), poi i personaggi (il 1° novembre 2026 tutti e quattordici, con ElevenLabs). Il metodo, i testi e le decisioni stanno in `doppiaggio/en/LEGGIMI.md` e nel diario del 31 ottobre
e del 1° novembre; qui ciò che riguarda il gioco:

- **Il diario resta in italiano e le parti si ritrovano dal testo italiano** (`parti.ts` non cambia): la voce inglese si aggancia agli id
  italiani. `app/public/voce/en/indice.json` dice, per ogni parte italiana del narratore (narrazione e scelte, 532), di Kira (120) e dei quattordici personaggi di ElevenLabs (193), la sua registrazione inglese
  (`corrispondenze`); le parti inglesi sono `app/public/voce/en/<id>.opus` (quelle dei personaggi in `app/public/voce/en/elevenlabs/`, con l'indice e la licenza loro, come in italiano), con lo stesso banco dell'italiano (−23 LUFS per blocco, Opus mono 32 kbit/s).
- **Un modo di voce nuovo, «inglese»** (`ModoVoce`, `lib/opzioni.ts`): quando è scelto, una parte con la registrazione inglese suona quella; tutte le altre
  (nessuna, oggi) suonano in italiano. Il modo «italiana» non cambia. Nella prima finestra la voce
  segue il testo (testo inglese → voce inglese) finché chi gioca non la sceglie.
- **Kira in inglese** (1° novembre 2026): 120 parti (31 suggerimenti e 89 pezzi coi numeri delle scorte) in tre blocchi, `doppiaggio/en/blocchi/kira-*.txt`;
  nel banco e nell'indice inglese insieme al narratore, quindi `voce.ts` non è cambiato: i numeri si ricompongono dai pezzi italiani (`parti.ts`) e
  ciascun pezzo italiano ha il suo inglese («Hai sei d'acqua,» → «You have five water,»; «e due di cibo.» → «and three food.»).
- **I quattordici personaggi in inglese** (1° novembre 2026): 193 parti (69 dei primi quattro, 41 dei tre successivi, 59 di Ciro, Peppe e Cosimo e 24 di Nunzio, Saverio, Rocco e Pasquale: gli ultimi sette generati da Claude con il connettore ElevenLabs, gli ultimi quattro con voci disegnate da Simone), le voci italiane di ElevenLabs (Victoria, Valeria, Criss, Luigi) che parlano
  inglese; blocchi in `doppiaggio/en/blocchi/imma.txt` … `vito.txt` (Eleven v4: `[Italian accent][tono]` davanti a ogni battuta, stessi toni dell'italiano;
  la documentazione è in `doppiaggio/en/eleven-v4.md`). Nel banco e nell'indice inglese vanno in `voce/en/elevenlabs/`; `voce.ts` legge le cartelle a parte
  anche dell'indice inglese. Stessa licenza delle italiane: fuori dalla licenza libera, solo uso non commerciale.
- **Il trailer ha la sua traccia inglese** (`voce/en/trailer.opus` e `trailer.json`, `strumenti/doppiaggio-trailer.py --lingua en`), con le stesse finestre e le
  stesse ancore dell'italiano; la sceglie il modo della voce al momento di mostrare il trailer.
- **Il collaudo** (`collaudo/doppiaggio.py`, sezione 9) controlla la voce inglese come l'italiana: ogni parte ha il suo audio e nessuno è scaduto, ogni parte
  italiana del narratore, di Kira e dei quattordici personaggi ha la sua registrazione, i file sono Ogg Opus veri, il volume, il trailer; il tetto del peso della voce, italiana e inglese insieme, è 40 MB (era 25 con la sola italiana).
