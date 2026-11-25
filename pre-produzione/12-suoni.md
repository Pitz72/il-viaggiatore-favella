# 12 · Il censimento dei suoni

> Ogni suono che il gioco fa, a parte le musiche e le voci: dove suona, quando, quanto dura, com'è fatto oggi e che cosa
> servirebbe per rifarlo con gli effetti sonori di ElevenLabs (Sound Effects v3, dal connettore). Scritto il 25 novembre 2026,
> su richiesta di Simone, leggendo il codice: è un elenco, **non è ancora stato generato niente**. Il diario della sessione
> racconta il resto: «Il censimento dei suoni».

## In breve

- **Nessun suono del gioco è un file.** A parte le musiche e le voci, ogni suono è sintetizzato nel codice (Web Audio):
  oscillatori e rumore filtrato, scritti su tempi precisi. I punti sono cinque: i loghi d'apertura, il trailer, la mappa, i trofei
  e, per esclusione, la sequenza finale, che di suoni suoi non ne ha.
- **In partita non c'è un suono d'ambiente**: si sentono la musica della zona, la voce, la mappa che si apre e si chiude, il trofeo.
  Passi, porte, acqua, vento, fuoco non suonano.
- In tutto sono **circa 45 suoni diversi** (contando una volta sola quelli che si ripetono), per **più di 300 colpi** in una visione
  completa di loghi e trailer.
- **Che cosa non è in questo elenco**, perché non è da rifare: i sette brani delle zone e la canzone finale (`app/public/musica/`,
  generati da Simone con Lyria), il tema del trailer (`app/src/assets/intro.mp3`), tutte le voci del doppiaggio
  (`app/public/voce/`).

## Come si legge

Per ogni suono: un numero (che resta suo), il nome, **quando** suona (in secondi dall'inizio della sua scena), **quanto dura**,
**com'è fatto oggi** (in breve, dal codice), le **prese** che servirebbero (un suono che si ripete identico si riconosce: i passi,
i tasti, la carta ne vogliono più d'una) e una proposta di **prompt** per ElevenLabs. I prompt sono in inglese perché il modello
lavora meglio così; seguono la guida del modello: frasi brevi, una cosa sola per generazione, la materia, il carattere, lo spazio,
niente parole da cinema.

Una colonna dice **R** (rumore: carta, passi, legno, metallo, aria, buoni candidati per ElevenLabs) o **I** (intonato: note,
accordi, campane, arpa, su una tonalità e sui fotogrammi; vedi «Le parti intonate», sotto).

## 1. I loghi d'apertura

Codice: `app/src/loghi/suono.ts` (la partitura), con i tempi di regia in `app/src/loghi/LogoRuntime.tsx` (`REGIA_RUNTIME`) e
`app/src/loghi/LogoFavella.tsx` (`REGIA_FAVELLA`). Tutto si programma all'avvio sull'orologio dell'audio; tutto passa da un
riverbero sintetico (una stanza ampia e morbida, 2,6 s di coda), un compressore e un limitatore. Sul canale «effetti» del bus
sonoro (`app/src/lib/suono.ts`). La stessa partitura esporta anche i video dei loghi (`app/src/loghi/esporta.ts`).

### Runtime Multimedia (0 → 5,6 s)

| N. | Suono | Quando | Durata | Com'è fatto oggi | R/I | Prese | Prompt proposto |
|---|---|---|---|---|---|---|---|
| L01 | Il televisore che si accende | 0,60 | 0,36 s | tonfo grave che scende (95 → 38 Hz), scarica di rumore che sale (1,8 → 7 kHz), un fischio acutissimo del tubo (7,8 → 9,4 kHz) | R | 2 | Old CRT television switching on, low thump, static discharge, faint high-pitched tube whine |
| L02 | Il ronzio del tubo | 0,65 → 4,94 | 4,3 s, in giro | rete a 50 Hz con le armoniche (100, 150, 250) e un fruscio sopra i 6,5 kHz | R | 1, in giro | CRT television hum, steady 50 Hz mains buzz, faint high hiss, close-mic (loop) |
| L03 | Lo schermo che si apre | 0,91 | 0,42 s | soffio di rumore che sale (380 → 3600 Hz) | R | 2 | Short airy whoosh rising in pitch, soft electronic swell |
| L04 | La testina che compare | 1,22 | 0,09 s | bip che sale (880 → 1320 Hz), a sinistra | I | — | (resta sintetizzato) |
| L05 | La corsa della testina | 1,38 → 2,28 | 0,9 s | nota che sale (196 → 587 Hz) e un fruscio stretto (2 → 6 kHz) | R+I | 2 | Tape head scanning across, soft rising mechanical whir, electronic hiss |
| L06 | Le lettere di RUNTIME | durante la corsa | 7 × 0,12 s | un bip per lettera sulla scala di Re maggiore pentatonica (587 → 1318 Hz), ognuno dalla parte della sua lettera | I | — | (resta sintetizzato) |
| L07 | Le lettere di MULTIMEDIA | durante la corsa | 10 × 24 ms | ticchettii secchi sopra i 4,2 kHz, come dati che si scrivono | R | 1 sequenza, da tagliare | Rapid tiny digital ticks, dry data clicks, close-mic |
| L08 | Il triangolo che si chiude | 2,38 → 2,74 | 0,36 s | una «zip» che sale (sega 170 → 760 Hz, rumore 0,9 → 5,2 kHz), a destra | R | 2 | Fast zipper-like rising swipe, bright synthetic zip |
| L09 | Il colpo | 2,72 | 0,55 s | cassa (130 → 40 Hz) con un clic in testa | R | 2 | Deep punchy kick drum hit with short click, tight |
| L10 | L'accordo del colpo | 2,72 → 4,78 | 2,1 s | accordo di Re (sei note, seghe appena stonate) staccato, che resta sotto filtrato | I | — | (resta sintetizzato) |
| L11 | La campana del colpo, il «pop» del triangolo interno | 2,73 e 2,78 | 1,6 e 0,12 s | campana a parziali inarmoniche su 1318 Hz; un pop che sale (523 → 880 Hz) | I | — | (resta sintetizzato) |
| L12 | I pixel come scintille | 2,89 → 3,24 | 8 × 0,7 s | otto campanelle che salgono (1175 → 2960 Hz), una ogni 0,05 s, verso destra | I | — | (resta sintetizzato) |
| L13 | Il riflesso | 3,50 → 4,10 | 0,6 s | velo di rumore luminoso che sale (2,6 → 9,5 kHz) e una nota altissima appena accennata | R | 2 | Soft shimmering airy sweep, glassy high sparkle, gentle |
| L14 | Lo spegnimento | 4,72 | 0,3 s | nota che crolla (1400 → 70 Hz) e rumore che si chiude (4,2 kHz → 220 Hz) | R | 2 | Old television switching off, quick descending electronic zap collapsing to silence |
| L15 | Il punto che si spegne | 4,94 | 0,24 s | tonfo leggero (80 → 36 Hz) e un tic che scende (5,2 → 2,4 kHz) | R | 2 | Small soft low thump with a tiny high click |

### FAVELLA 1 (da 5,6 s, per 6,6 s)

| N. | Suono | Quando | Durata | Com'è fatto oggi | R/I | Prese | Prompt proposto |
|---|---|---|---|---|---|---|---|
| L16 | La scintilla della gemma | 0,26 → 0,66 | 1,5 s | due campane acute (2349 e 3520 Hz) su un fruscio alto, a sinistra | I+R | 2 (solo il fruscio) | Tiny magical sparkle, bright crystalline glint, soft airy shimmer |
| L17 | L'accordo caldo | 0,42 → 6,75 | 6,3 s | accordo di La (sei note, triangoli) che si apre con la luce, un bordone a 73,4 Hz, una nota a 293,7 Hz | I | — | (resta sintetizzato) |
| L18 | Il libro che si apre | 0,70 | 0,5 s | tonfo morbido (110 → 48 Hz) e soffio di carta che si chiude | R | 3 | Heavy old book opening on a wooden desk, soft thud, papery breath |
| L19 | Le pagine | 1,02 → 1,20 | 3 coppie × 0,12 s | tre fruscii di pagina a sinistra e tre a destra | R | 4 | Single page turning, quick dry paper flick, close-mic |
| L20 | L'arpeggio d'arpa | 1,02 → 1,47 | 7 note, 1,7 s ciascuna | arpa sintetica (triangolo che si chiude) su Re maggiore, 293,7 → 1108,7 Hz, alternate sinistra e destra | I | — | (resta sintetizzato) |
| L21 | Le graffe che si scrivono | 1,45 → 2,25 | 0,8 s | due toni che salgono (1180 → 1760 Hz) e un fruscio di penna (5,2 → 8,2 kHz), ai due lati | R+I | 2 | Quick pen stroke on paper, light scratchy swoosh |
| L22 | Le graffe piene | 2,10 | 1,5 s | due campane (587 e 880 Hz), sinistra e destra | I | — | (resta sintetizzato) |
| L23 | La scritta FAVELLA1 | 2,30 → 2,83 | 8 × 0,16 s | un soffio per lettera (1,5 kHz → 650 Hz), che si sposta verso destra | R | 3 | Short soft breathy whoosh, low and gentle |
| L24 | Il pieno sotto la scritta | 2,98 | 1,6 s | nota grave a 73,4 Hz e una campana a 1175 Hz | I | — | (resta sintetizzato) |
| L25 | Il motto battuto a tasti | 3,15 → 4,35 | 62 colpi | 56 tasti (clic di plastica e un «toc» di legno) e 6 barre spaziatrici più sorde, sugli istanti dei caratteri a schermo (`BATTUTE`) | R | 8 tasti e 2 barre, tagliati da una sequenza | Soft vintage keyboard typing, individual key presses, close-mic; Keyboard spacebar press, soft dull thock |
| L26 | Il rintocco finale | 4,40 | 1,6 s | due campane (1318 e 1760 Hz) | I | — | (resta sintetizzato) |
| L27 | Il riflesso sulla scritta | 3,75 → 4,40 | 0,65 s | velo di rumore luminoso (3 → 9 kHz) | R | (come L13) | (come L13) |

## 2. Il trailer

Codice: `app/src/trailer/audio.ts` (i suoni), con gli istanti in `app/src/trailer/scaletta.ts` (`EVENTI`, `CAMMINATE`). I rumori
passano da una stanza brevissima (0,22 s di coda) e, quando c'è il brano, suonano al 55% (`LIV_RUMORI_CON_BRANO`). Sul canale
«effetti». **I suoni intonati del trailer (rintocchi, tonfi) e il vento con il bordone suonano solo se il brano manca**: col brano
li fa già la musica. Nel gioco il brano c'è sempre, quindi oggi si sentono soltanto T01–T05.

| N. | Suono | Quando | Durata | Com'è fatto oggi | R/I | Prese | Prompt proposto |
|---|---|---|---|---|---|---|---|
| T01 | Le buste che cadono sul tavolo, il biglietto che si posa | 1,25 · 2,35 · 3,45 · 4,55 (le buste) · 7,20 (il biglietto, più forte) | 0,35 s | fruscio di carta che si chiude (2,4 kHz → 900 Hz), ogni volta un po' diverso | R | 5 (4 buste, 1 biglietto) | Envelope dropping onto a wooden table, soft paper slap; Stiff card placed on paper, light papery tap |
| T02 | Il biglietto che si scrive | 7,25 → 8,0 | 20 colpi | un tasto per carattere di «NON È IL CASO / DI TORNARE.», 34 ms l'uno dall'altro | R | 8, tagliati da una sequenza | Soft typewriter key strikes, muted, close-mic |
| T03 | Il timbro «la secca» | 22,6 | 0,35 s | colpo grave (120 → 45 Hz) e un rumore sordo | R | 2 | Rubber stamp pressed hard on paper on a wooden desk, dull thump |
| T04 | I soffi | 17,6 (lo stacco sulla terra) · 67,8 · 69,64 · 71,48 · 73,32 · 75,16 (le cinque regole) · 77,0 (i numeri) | 0,6 s | rumore che si apre (300 → 3000 Hz) | R | 3 | Soft whoosh transition, airy, rising |
| T05a | I passi sull'asfalto, all'alba | 9,6 → 17,6 | 17 passi | colpo sordo e un filo di granello; il destro e il sinistro appena diversi (altezza, ±2 dB, a destra e a sinistra) | R | 6–8 | Single footstep, leather boot on dry cracked asphalt, close |
| T05b | I passi sulla crosta della secca | 17,6 → 25,2 | 14 passi | tre schiocchi e un tonfo: fango secco che scricchiola | R | 6–8 | Single footstep on dry cracked mud crust, crunchy snap |
| T05c | I passi sul sale | 25,2 → 32,6 | 15 passi | fruscio morbido e lungo: sale che si schiaccia | R | 6–8 | Single footstep crunching on a dry salt flat, soft granular crush |
| T05d | I passi sui sassi del guado | 59,6 → 64,0 | 8 passi | tanti clic di sassi sopra un tonfo sordo | R | 6–8 | Single footstep on loose river pebbles, stones clicking |
| T05e | I passi sull'asfalto, sul titolo | dall'81,4 | fino a 60 s (vedi sotto, «Due cose trovate») | come T05a, più piano | R | (come T05a) | (come T05a) |
| T06 | I rintocchi (solo senza brano) | 35,2 + 1,72 × n (le sette tappe); 52,3 + 0,42 × n (i cinque segni) | 1,6 s | due toni (880 e 1320 Hz, triangolo e seno) | I | — | (resta sintetizzato) |
| T07 | I tonfi (solo senza brano) | 47,24 (casa) · 64,0 («tuo fratello») · 82,3 (il titolo) | 1,4 s | nota grave che scende (70 → 28 Hz) e un rumore sordo | R | 2 | Deep cinematic low boom, soft and distant |
| T08 | Il vento (solo senza brano) | per tutto il trailer | continuo | rumore in banda che ondeggia lento (attorno ai 500 Hz); cala al guado, torna al titolo | R | 1, in giro | Dry wind over an empty plain, steady, gentle gusts (loop) |
| T09 | Il bordone (solo senza brano) | per tutto il trailer | continuo | La grave e la quinta (55, 82,4, 110 Hz); la terza minore entra al guado | I | — | (resta sintetizzato) |

## 3. La mappa

Codice: `app/src/gioco/suonoCarta.ts`, suonato da `app/src/gioco/Mappa.tsx`. Piano (circa −20 dB al picco), sul canale «effetti».

| N. | Suono | Quando | Durata | Com'è fatto oggi | R/I | Prese | Prompt proposto |
|---|---|---|---|---|---|---|---|
| M01 | La carta che si spiega | all'apertura della mappa | 0,9 s | un soffio d'aria sotto il foglio, 72 scricchiolii di carta in due timbri (più fitti all'inizio e a metà, mentre le pieghe cedono), un colpetto sordo sul tavolo a 0,79 s | R | 3 | Unfolding a large old paper map, crisp crackling folds, soft settle on a table |
| M02 | La carta che si ripiega | alla chiusura | 0,3 s | un soffio breve e 14 scricchiolii | R | 3 | Quickly folding a paper map, short crisp rustle |

## 4. I trofei

Codice: `app/src/gioco/suonoTrofeo.ts`, suonato in partita (`ViaggiatorePlayer.tsx`) e sul menu d'avvio (`Trailer.tsx`). Piano (circa
−24 dB al picco), sul canale «effetti».

| N. | Suono | Quando | Durata | Com'è fatto oggi | R/I | Prese | Prompt proposto |
|---|---|---|---|---|---|---|---|
| G01 | Il trofeo | a ogni trofeo vinto | 1,9 s | una nota flautata, Mi a 659,25 Hz: un seno con due armoniche appena accennate, un vibrato lento (±7 centesimi a 5 Hz) che entra dopo l'attacco, un soffio di fiato attorno | I | 2–3 | Single soft breathy flute note, gentle, warm, short (va provato: è una nota sola, ma intonata) |

## 5. La sequenza finale e la partita

- **La sequenza finale** (`app/src/components/SequenzaFinale.tsx`) suona soltanto la canzone (o, se manca, il tema del trailer):
  nessun effetto.
- **La partita** (`ViaggiatorePlayer.tsx`, `gioco/musica.ts`, `gioco/voce.ts`): la musica della zona, la voce, la mappa (M01–M02)
  e i trofei (G01). Nient'altro.

## Le parti intonate

ElevenLabs genera rumori molto bene; **non garantisce l'altezza di una nota né un accordo preciso**. Le parti segnate **I** sono
scritte su una tonalità (Re maggiore nei loghi, La nel bordone) e sui fotogrammi: un bip per lettera sulla scala, le campanelle che
salgono coi pixel, l'arpa che sale con le pagine. Rifatte da un modello, perderebbero la scala e l'aggancio.

La proposta è tenerle sintetizzate e rifare con ElevenLabs soltanto i rumori (**R**). Il risultato è misto: materia vera (carta, legno,
passi, tubo catodico) sotto una musica che resta precisa. Il trofeo (G01) è a metà: è una nota sola, e si può provare.

## Che cosa costerebbe rifarli

- **Da generare**: circa 30 suoni diversi segnati R. Con le prese, circa **90–110 generazioni**, quasi tutte brevi (da mezzo secondo a
  quattro secondi; il ronzio del tubo e il vento in giro continuo).
- **I suoni sotto il mezzo secondo** (tasti, ticchettii, i singoli passi) ElevenLabs non li fa: il minimo è 0,5 s. Si genera una
  sequenza di qualche secondo e si tagliano i colpi uno per uno con ffmpeg, come per le parti del doppiaggio.
- **I crediti**: il 25 novembre 2026 Simone ne aveva **116.031**, col piano da 22 dollari al mese. Il connettore è collegato e genera;
  gli manca soltanto il permesso di leggere il conto («This connector requires additional permissions»), quindi i crediti si leggono
  sul sito di ElevenLabs. Quanto costa davvero una generazione di effetti non è scritto qui perché non l'ho verificato: si misura
  sulla prima, guardando i crediti prima e dopo.
- **La licenza**: le voci ElevenLabs stanno in una cartella a parte, escluse dalla licenza libera e «solo uso non commerciale»
  finché i diritti dell'abbonamento non sono verificati (`LICENSE-CONTENUTI.md`). Gli effetti generati andrebbero trattati allo
  stesso modo, finché nei termini di ElevenLabs non si legge che cosa permette il piano di Simone (non è una consulenza legale).
  Se il piano permette l'uso commerciale, la stessa lettura vale anche per le voci rifatte a pagamento.

## Che cosa cambierebbe nel codice

- Oggi ogni suono nasce nel momento in cui serve; con i file, ogni suono va **caricato e decodificato prima** (come la voce del
  trailer), e i loghi, che partono subito, devono averli pronti all'avvio.
- **Le prese si alternano** con un seme fisso, come oggi le variazioni dei passi: lo stesso trailer suona sempre uguale, ma due passi
  di fila non sono mai lo stesso file.
- **Gli strumenti che esportano i video** (`app/src/loghi/esporta.ts`, `strumenti/esporta-trailer.cjs`) rendono il suono su un contesto
  offline: i file vanno caricati anche lì.
- **I livelli**: ogni file va misurato e portato allo stesso picco del suono che sostituisce (il collaudo della voce lo fa già per il
  doppiaggio: `collaudo/doppiaggio.py`).
- **Il peso**: un centinaio di file Opus brevi pesa poco (qualche centinaio di KB). Il tetto della voce nel pacchetto è 40 MB.

## Due cose trovate durante il censimento

Non sono suoni da rifare, ma vanno guardate (e ascoltate) prima di toccare l'audio:

1. **I passi sul titolo continuano sul menu.** La camminata del titolo (`CAMMINATE`, da 81,4 s) dà passi per 60 secondi, fino a
   141,4 s. Sul menu l'orologio del trailer va avanti e i passi suonano, ma l'immagine resta ferma sull'ultimo fotogramma (88,5 s):
   per quasi un minuto si sentono passi sull'asfalto, piano (volume 0,25 per 0,55, cioè circa un settimo di un passo pieno),
   mentre l'uomo non si muove. Da verificare all'ascolto.
2. **La sequenza finale prende il tempo dalla musica allo stesso modo del trailer**: posizione meno la latenza dell'uscita audio
   (`orologioAudio` in `SequenzaFinale.tsx`). Nel trailer questo faceva tornare indietro il tempo all'attacco (il lampo sulle
   lettere, corretto il 25 novembre 2026). Va guardata nella versione di produzione, misurando la luce dei fotogrammi, insieme al
   controllo che la sequenza finale aspetta dopo il lavoro della 1.43.0.
