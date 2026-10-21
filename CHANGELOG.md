# Registro delle modifiche

Tutte le modifiche rilevanti al gioco, versione per versione. Formato
[Keep a Changelog](https://keepachangelog.com/it/1.1.0/); numeri di versione
[SemVer 2.0.0](https://semver.org/lang/it/) secondo le regole di
[`sviluppo/VERSIONI.md`](sviluppo/VERSIONI.md). Il *come* e il *perché* di ogni
passo stanno nel [diario di sviluppo](sviluppo/DIARIO.md).

## [Non rilasciato]

## [1.30.0] - 2026-10-21

### Aggiunto
- **I trofei: trenta**, in sei famiglie: i sei finali della storia, le tre fini lungo la strada, i dieci gesti (gli
  stessi «che cosa hai fatto a chi» della barra laterale), sei modi di arrivare, tre sfide e la collezione. Nomi e accenni
  scelti con Simone, presi dalle parole della storia.
  - **Nascosti con un accenno**: finché non lo vinci, il nome è coperto e l'accenno dice dove guardare, non che cosa fare
    («Un finale: qualcosa da posare», «Qualcuno al casello»).
  - **L'avviso**: in alto, «Trofeo · Il cavallo di legno», per quattro secondi, con un lievissimo suono flautato
    (sintetizzato, sul volume degli effetti). Più trofei insieme arrivano uno dopo l'altro. **Mai sopra il finale**:
    quelli vinti con l'ultimo turno, e tutti quelli del viaggio, li elenca la schermata finale.
  - **La pagina dei trofei**, dal menu d'avvio, dalla pausa e dalla schermata finale: il conto («12 di 30»), le famiglie
    coi loro medaglioni, e accanto il trofeo scelto, col nome, una frase e la data in cui l'hai vinto. Si percorre con le
    frecce.
  - **Le sfide** (arrivare a un finale senza mai tornare indietro; scrivendo ogni comando; coi soli pulsanti) viaggiano
    nei salvataggi: continuare un viaggio non le rompe; un ANNULLA o il caricamento di un punto prima del più lontano
    raggiunto rompono «Senza voltarti». I salvataggi di prima della 1.30 le hanno già rotte: di quelle partite non si sa
    com'è andata.
  - Un trofeo si vince una volta sola e resta, anche ricominciando o caricando; contano da questa versione in poi.
  - **Dove stanno**: sul desktop in *Documenti/Il Viaggiatore/trofei.json*, accanto ai salvataggi, con la stessa
    scrittura sicura e la copia di riserva; nella versione web, nella memoria del browser.
  - **Azzerarli**: nelle opzioni, scheda Generale, «azzera i trofei», con una conferma. I salvataggi non si toccano.
  - «trofei» scritto nella riga apre la pagina.
- `collaudo/trofei.py`: gioca col ponte vero i dodici percorsi, le tre morti e due partite al casello, e fa decidere i
  trofei alle regole vere del gioco; pretende per ogni partita esattamente i trofei previsti, ciascuno al suo momento, e
  che tutti e trenta si possano vincere. `app/scripts/trofei-prove.mjs` prova i casi che le partite non toccano.

### Cambiato
- Il ponte dell'interfaccia espone anche gli stati della storia («stato di Cosimo», «stato del riconoscimento»…): li
  leggono i trofei.
- L'autoverifica del pacchetto prova anche le regole dei trofei sullo stato vero (senza scrivere niente).

### Corretto
- Nel registro tecnico non compare più l'avviso «Oscillator.frequency … outside nominal range»: le campane più acute dei
  loghi chiedevano una parziale a 26 kHz, che non si sente e il browser tagliava. Il suono dei loghi non cambia.

## [1.29.0] - 2026-10-21

### Aggiunto
- **I tre modi dei comandi** (opzioni, scheda Generale, ora anche nella versione web):
  - **Pulsanti e parole**, com'è sempre stato e com'è all'inizio.
  - **Solo pulsanti**: la riga per scrivere sparisce; ↶ annulla passa accanto a guarda, inventario, stato e aspetta;
    dopo ogni mossa il fuoco va al primo pulsante utile (la prima risposta di un dialogo, il «no» di una domanda, la
    prima uscita), e il menu di una cosa che si apre prende il fuoco: si gioca anche solo con Tab e Invio.
  - **Solo parole**: l'avventura testuale pura. Spariscono le file di pulsanti (uscite, cose, azioni), i menu delle cose
    e il pannello delle dosi; le parole in maiuscolo restano evidenziate ma non si toccano; le risposte di un dialogo
    restano scritte e numerate, e si sceglie scrivendo il numero; scorte e bisaccia si leggono soltanto.
  - In tutti e tre restano la conferma delle scelte che costano, Ctrl+Z e i tasti del gioco (Esc, F2, F5, F9).
- **Le parole dell'app nella riga:** «opzioni», «pausa», «salva» e «carica» scritte aprono le opzioni, la pausa e il
  taccuino. Non arrivano al motore e non sono un turno.

### Cambiato
- **La guida «Come si gioca» parla del modo scelto**: con «solo pulsanti» non dice di scrivere e non mostra comandi da
  scrivere; con «solo parole» non dice di toccare. Col contrasto alto le sue schede sono piene e i testi chiari (prima
  prendeva solo il fondo).
- **Ctrl+Z vale anche fuori dalla riga** (nella riga, come prima, solo quando è vuota).
- **Tab non zittisce più la voce:** passare da un pulsante all'altro non è parlarle sopra. Gli altri tasti la fermano
  come sempre.
- Il segnaposto della riga dice che cosa fare in «solo parole» («scrivi il numero della risposta»).

### Corretto
- La guida «Come si gioca» aperta dalla pausa finiva sotto la pausa invece di coprirla.

## [1.28.0] - 2026-10-21

### Aggiunto
- **L'alta accessibilità** (opzioni, scheda Video): un interruttore che accende insieme cinque righe, regolabili poi una
  per una (se se ne cambia una, l'interruttore dice «personalizzata»):
  - **Contrasto alto**: testi pieni su fondi pieni, niente velature né sfocature dietro i pannelli, bordi netti; i testi
    del diario e della barra laterale stanno oltre 16:1 sul fondo (il livello AAA chiede 7:1).
  - **Testo grande**: il diario, i comandi e la barra laterale più grandi (la prosa da 17 a 20,5 px); i pannelli e la
    colonna dei menu crescono del 15%, e restano in vista senza scorrere.
  - **Carattere Atkinson Hyperlegible** (Atkinson Hyperlegible Next, SIL OFL 1.1), al posto di Lora, Sora e Source Code
    Pro, ovunque si legge: nella partita, nei pannelli, nei menu.
  - **Movimento**: come il sistema, ridotto, pieno. Ridotto ferma ciò che si muove nella partita e nei menu: il viandante
    non cammina, il paesaggio sta fermo, niente transizioni né pulsazioni.
  - **Fuoco marcato**: un contorno spesso, giallo e staccato su ciò che ha il fuoco della tastiera.

### Cambiato
- **Loghi e trailer si vedono anche col movimento ridotto** (scelta di Simone): prima, con il movimento ridotto di
  Windows, i loghi non comparivano e il trailer saltava al menu. Esc li salta come sempre.
- Il movimento ridotto non è più soltanto quello di Windows: lo decide l'opzione, che lo segue se la si lascia «come il
  sistema».
- Il cartello delle licenze e dei crediti nomina anche Atkinson Hyperlegible Next.

## [1.27.0] - 2026-10-21

### Aggiunto
- **Schermo intero o finestra, ricordati.** Il gioco parte a schermo intero la prima volta; chi sceglie la finestra (dalle
  opzioni o con F11) la ritrova al lancio dopo, con la sua dimensione, la sua posizione e l'ingrandimento. Se lo schermo
  dov'era la finestra non c'è più, si apre al centro di quello principale.
- **La dimensione della finestra** nelle opzioni (scheda Video): 1280 × 720, 1600 × 900, 1920 × 1080, 2560 × 1440,
  3840 × 2160, in pixel veri dello schermo, solo quelle che ci entrano. Sceglierne una esce dallo schermo intero e
  centra la finestra; una presa a mano col bordo si riconosce.
- **La qualità della grafica** (scheda Video): automatica (com'è sempre stato: il trailer scende da solo se il computer
  arranca), alta (i paesaggi della partita alla risoluzione piena dello schermo e il trailer fino al 4K), media, bassa.
  Vale subito, anche sul trailer del menu.
- **Gli aggiornamenti si possono spegnere** (scheda Generale, sul desktop): «cercali all'avvio» o «no». Con «no» il
  gioco non si collega a GitHub; vale dall'avvio dopo. Le versioni che non si aggiornano da sole (la portatile) lo dicono.

### Cambiato
- «Ripristina le opzioni di base» rimette anche lo schermo intero e gli aggiornamenti all'avvio.

## [1.26.0] - 2026-10-21

### Aggiunto
- **Il taccuino nuovo, da gioco per computer.** Salvataggi quanti se ne vuole, ciascuno col suo nome (il gioco propone
  il luogo; si scrive sopra). A sinistra l'elenco, dal più recente, con una miniatura del paesaggio; a destra il
  salvataggio scelto: la miniatura grande, il nome, il luogo con la zona, la tappa e il turno, la data, **il tempo di
  gioco**, vita, sete, fame, acqua e cibo. Azioni: carica o sovrascrivi, rinomina, esporta, elimina; le conferme sono
  domande a parte (S / N). Tastiera: ↑ ↓ Inizio Fine PagSu PagGiù, Invio, Canc; due clic caricano. Restano «apri un
  file…» e «apri la cartella».
- **F5 salva al volo** in un posto rapido (un cartiglio dice «Salvato · rapido»); **F9 lo ricarica**, con una domanda se
  c'è strada non salvata.
- **Tre salvataggi automatici a turno**: a ogni cambio di luogo e quando si lascia la partita si riscrive il più vecchio
  dei tre; se uno si guasta, ci sono gli altri.
- Il tempo di gioco: corre a partita in corso, con la pausa chiusa e la finestra in primo piano, e si somma da un
  caricamento all'altro.

### Cambiato
- «Continua il viaggio» dice il nome del salvataggio, il luogo e il tempo di gioco.
- I salvataggi delle versioni di prima si aprono come gli altri («Posto 1»…, «Salvataggio automatico»); i file nuovi
  hanno tre campi in più, facoltativi (nome, miniatura, tempo), e il formato resta lo stesso.

### Corretto
- Dopo un caricamento il diario diceva «Ripreso dal automatico»: ora «Ripreso da «Salvataggio automatico», salvato
  il …», col nome del salvataggio.

## [1.25.0] - 2026-10-20

### Aggiunto
- **La pausa.** In partita Esc, a riga vuota, mette il gioco in pausa: Riprendi, Salva, Carica, Opzioni, Come si gioca,
  Torna al menu d'avvio, Esci dal gioco (sul desktop). Si sceglie con ↑ ↓ e Invio o col mouse; Esc riprende. Le opzioni,
  il taccuino e la guida aperti dalla pausa le stanno sopra, e chiudendoli si torna lì. Mentre è aperta il paesaggio si
  ferma. Esc, prima, chiude il menu di una cosa o un pannello aperto; se la voce sta parlando, la zittisce soltanto.
- **«Nuovo viaggio» chiede conferma** quando c'è un viaggio da continuare (S sì, N o Esc no).

### Cambiato
- **Il menu d'avvio è una colonna di voci**, sotto il titolo e «Si parte a piedi.»: Continua il viaggio (con dove
  riprende), Nuovo viaggio (o Inizia il viaggio), Carica un viaggio, Opzioni, Come si gioca, Rivedi il trailer, Esci.
  ↑ ↓ (e Inizio, Fine) da una voce all'altra, Invio sceglie, il mouse come sempre; la voce scelta ha un filo d'ambra ai
  due lati. Il resto della vecchia frase d'invito sta nella guida.
- **La testata della partita** ha tre tasti: salva, carica, ☰ pausa. Opzioni, guida, ritorno al menu e uscita stanno
  nella pausa.
- Il tasto dello schermo intero sul palco della partita non c'è più: restano F11 e le opzioni.

## [1.24.0] - 2026-10-20

### Aggiunto
- **Le opzioni**: un pannello solo, largo e di misura fissa, che si apre dal menu d'avvio («⚙ opzioni», al posto di
  «♪ audio») e dalla partita («⚙ opzioni», al posto di «♪ voce»). Scheda *Video*: schermo intero o finestra. Scheda
  *Audio*, in due colonne: i **volumi** (generale, musica, voce, effetti) e l'**ascolto** (la voce del gioco, recitata o
  lettore di schermo, con «↻ riascolta»; stereo o **mono**, per chi sente da un orecchio solo; **in secondo piano**
  continua o silenzia, quando il gioco è ridotto a icona o un'altra finestra gli sta davanti). Ogni cambio vale subito
  e resta; «ripristina le opzioni di base» chiede conferma (S / N). Le schede si scorrono con ← →, i volumi con le
  frecce, Esc chiude; il fuoco della tastiera si riconosce senza il riquadro del browser.
- **Volumi veri.** Tutto ciò che suona passa da un bus sonoro con tre canali: la musica (il brano del trailer e del
  menu), la voce (il doppiaggio ed Enzo nel trailer), gli effetti (i loghi sonori, i rumori del trailer); sopra, il
  volume generale. I cursori cambiano il suono dal vivo, senza scatti. Al 100% tutto suona come prima.

### Cambiato
- Il pannello «La voce» non c'è più: le sue scelte stanno nelle opzioni, e chi aveva scelto il lettore di schermo o un
  altro volume li ritrova.
- La voce di Enzo nel trailer segue la scelta dal vivo: cambiarla nelle opzioni del menu vale già per «rivedi il
  trailer».
- L'autoverifica dei pacchetti prova anche il bus sonoro (i canali nascono ai volumi delle opzioni, senza cambiarle).

## [1.23.0] - 2026-10-20

### Aggiunto
- **Il cartello delle licenze e dei crediti**, subito dopo i loghi e prima dell'avviso (voluto da Simone): chi ha fatto il
  gioco, con che cosa e sotto quali licenze (storia, testi, musica e grafica CC BY-SA; le voci Google Gemini TTS; le voci
  ElevenLabs di quattro personaggi; il codice e il motore MIT; i componenti; i marchi). Si comporta come l'avviso: va
  avanti da solo dopo 15 secondi, oppure subito con Invio, Spazio, Esc o un clic.
- **Le voci di Imma, Rosaria, Tore e Vito nei pacchetti e nel web**: prima suonavano solo sul PC dell'autore. Sono
  fatte con ElevenLabs sul piano gratuito e stanno in `app/public/voce/elevenlabs/`, **escluse dalla licenza libera e solo
  per uso non commerciale** (`LICENSE-CONTENUTI.md`); un'opera derivata o un uso commerciale deve toglierle o sostituirle.
  Adesso tutte le battute del gioco hanno la loro voce.

### Cambiato
- Il README è rivisto: l'apertura (loghi, licenze e crediti, avviso, trailer), la voce, le licenze delle voci, il
  doppiaggio fra gli strumenti, l'autoverifica che prova la voce.

### Corretto
- Rifare il banco della voce non cancella più la traccia del trailer (`trailer.opus`): toglie solo i file col nome di una
  parte.

## [1.22.1] - 2026-10-20

### Cambiato
- L'autoverifica (quella che la CI esegue sui pacchetti appena costruiti) prova anche la voce del doppiaggio: carica
  l'indice, decodifica una parte per ogni voce del pacchetto e la traccia del trailer, e ritrova dal testo d'avvio le sue
  parti. Il pacchetto Windows pesa 128,5 MB (114 nella 1.18.2): 14,5 MB in più, la voce.

## [1.22.0] - 2026-10-20

### Aggiunto
- **Il trailer con la voce di Enzo** (doppiaggio, fase 4 del piano 08): con la voce recitata il narratore legge i testi
  del trailer, in modo narrativo ed enfatico, e la musica gli scende sotto (−8 dB) mentre parla. Il trailer è quello di
  prima: 88,5 s, stessi testi, stessa musica, stesso ordine, Esc per saltarlo; «tuo FRATELLO.» cade sul colpo grave a
  64,0 s e «Il Viaggiatore.» sul titolo a 82,3 s. Nel finale Enzo legge le cinque regole (un poco più svelte); i numeri e
  «Un'avventura testuale…» restano solo scritti. La voce è una traccia sola (`public/voce/trailer.opus`, 400 KB) scritta da
  `strumenti/doppiaggio-trailer.py`, che segue l'orologio della musica; il tasto «audio» la spegne con il resto, e col
  lettore di schermo non c'è.
- I video del trailer (`strumenti/esporta-trailer.cjs`) hanno ora la colonna vera, resa offline: musica, rumori e voce
  (`strumenti/trailer-mix.cjs`, che usa anche `trailer-rumori.cjs`).

## [1.21.0] - 2026-10-20

### Aggiunto
- **La voce dei numeri e dei fili** (doppiaggio, fase 3 del piano 08): le scorte dette nelle battute si sentono
  («Hai 6 d'acqua e 2 di cibo.» diventa «Hai sei d'acqua,» + «e due di cibo.», i pezzi che la voce di servizio ha
  registrato a lettere: acqua da 0 a 20, cibo da 0 a 12; un valore più alto, raro, va al lettore di schermo). Il
  paragrafo dei fili del viaggio, nei finali, si ritrova frase per frase. Il collaudo della voce prova ogni combinazione
  dei numeri e i fili uno per uno e tutti insieme: ogni parte del gioco si ritrova da un testo stampato.

### Corretto
- La voce si ferma anche a ogni comando dato col mouse (una risposta, un'uscita, un pulsante): prima, scegliendo uno
  scambio, la battuta di prima continuava sopra la finestra di conferma e i suoi numeri («hai tre d'acqua») si
  confondevano con quelli dello scambio («dai 1 d'acqua»).

## [1.20.0] - 2026-10-20

### Aggiunto
- **La voce nel gioco** (doppiaggio, fase 2 del piano 08): il racconto si sente. Il narratore, i personaggi e i
  suggerimenti suonano parte per parte, in fila, con una pausa breve fra le frasi e una più lunga fra le righe; la voce
  si ferma al primo tasto (il testo resta) e **F2** ridice l'ultimo testo. Le risposte di un dialogo le legge il
  narratore quando ci si passa sopra col mouse o le si raggiunge con la tastiera. Il pannello **«voce»**, in alto, sceglie
  fra *voce recitata* e *lettore di schermo* e regola il volume (si ricorda). In voce recitata il diario non si annuncia,
  per non sentire due voci; ciò che la voce non dice (le risposte del motore, i titoli dei luoghi, le battute ancora
  senza audio) va comunque al lettore di schermo. L'app ritrova le parti dal testo che il motore stampa
  (`app/src/gioco/parti.ts`, lo stesso spezzamento di `strumenti/doppiaggio.py`); i numeri delle scorte dentro le
  battute non si sentono ancora (fase 3). La guida lo dice in una riga.
- Il collaudo della voce gioca i dodici percorsi e le tre morti e pretende che ogni riga stampata trovi le sue parti, e
  così ogni testo dei `.fav` e ogni risposta di dialogo.

## [1.19.0] - 2026-10-20

### Aggiunto
- **Il banco della voce** (doppiaggio, fase 1 del piano 08): le 878 parti doppiate diventano un file Opus ciascuna
  (mono, 32 kbit/s) in `app/public/voce/`, con un indice delle durate. Ogni blocco generato è portato allo stesso volume
  (−23 LUFS, EBU R128, senza compressione), con i silenzi in testa e in coda tolti. Nel repository e nei pacchetti ne
  vanno 809 (61 minuti, 13,7 MB); le 69 di Imma, Rosaria, Tore e Vito, fatte con ElevenLabs sul piano gratuito, restano
  sul PC dell'autore e si rifaranno prima del rilascio. Il gioco non le suona ancora. Strumento
  `strumenti/doppiaggio-banco.py`, collaudo `collaudo/doppiaggio.py` (anche in CI).

## [1.18.2] - 2026-10-20

### Corretto
- **Il trailer, le ultime rifiniture** (durata 88,5 s, ordine, testi e musica sono quelli di prima; cambiano pochi decimi
  di secondo, per volere di Simone):
  - la dissolvenza fra la terra e l'invaso è un incrocio vero, centrato sul taglio nominale a 25,2 s: la terra resta piena
    finché l'invaso, che le entra sopra da 24,8 a 25,6 s, non è tutto opaco. Prima le due scene si dissolvevano insieme sul
    nero e a 25 s il quadro perdeva più di metà della luce (luminosità media 75 su 175); ora non scende mai sotto la minore
    delle due scene;
  - «tuo fratello.» entra a 64,0 s e non a 63,7, sul colpo grave del brano (63,99 s); il viandante finisce di fermarsi
    nello stesso istante (prima a 64,2) e anche il colpo sintetico che lo accompagna passa a 64,0 (un colpo solo, non due
    a trecento millesimi di distanza);
  - il biglietto «NON È IL CASO DI TORNARE.» si scrive un po' più in fretta (0,034 s a carattere invece di 0,042: finisce
    a 8,2 s e non a 8,5) e resta leggibile intero più a lungo prima che la scena sfumi; i tasti battuti seguono lo stesso
    passo;
  - la schermata d'avvio si legge meglio (i pulsanti sono quelli di prima, tutti, e il testo non cambia): il paragrafo
    «Da qui in poi comandi tu…» sta su due righe invece di tre, più chiaro e su un velo più alto e largo (non si perde più
    fra i fili del telegrafo); «? come si gioca», «carica», «rivedi il trailer» e «audio» hanno il carattere a 18 px
    (prima 15) e un fondo scuro, con il bordo più netto.

## [1.18.1] - 2026-10-20

### Cambiato
- **Il trailer, la nitidezza a 4K** (durata, ordine, tempi, testi e musica sono quelli di prima):
  - le tele statiche si dipingono a due pixel per unità di progetto (prima uno, o meno): il tavolo di noce (da 960×540 a
    1920×1080), i fogli, la busta, il biglietto, la macchia del bicchiere, l'erba, le sagome e la piana dell'alba, la piana
    di sale dell'invaso, la città e il greto del guado; il costo per fotogramma non cambia (si copiano come prima) e la
    preparazione passa da 5,2 a 6,3 s, dentro i 12,4 s dei loghi;
  - su uno schermo 4K la tela del trailer non si ferma più a 2560 px: all'avvio il trailer prova 3840 e poi 3200 px sulle
    cinque inquadrature più pesanti (le lettere, l'alba, la terra, il guado, il titolo) e tiene la prima larghezza che costa
    meno di 14 ms a fotogramma (misura a freddo; in pratica 3200 su una RTX 2070); se nessuna regge resta a 2560 e la
    risoluzione adattiva (1 → 0,75 → 0,5) scatta come sempre; sotto i 2560 px di larghezza non cambia niente;
  - la luce di contorno del viandante in primo piano segue il risvolto dei pantaloni e la suola (prima faceva i gradini
    intorno al risvolto).
- **Per chi sviluppa:** `strumenti/trailer-calibra.cjs` prova la scelta della tela come la farebbe il giocatore;
  `trailer-cattura.cjs` e `trailer-misura.cjs` hanno `--tetto 3840` per provare il 4K pieno; la piana di sale e la
  carta usano `campoLento()` per i campi a variazione lenta.

## [1.18.0] - 2026-10-20

### Cambiato
- **Il trailer, la materia** (durata, ordine, tempi, testi e musica sono quelli di prima):
  - la piana di sale dell'invaso non è più un selciato: lastre irregolari e più larghe, con la cresta di pressione
    rialzata sul bordo (chiara dal lato della luce, in ombra dall'altro), fessure sottili a tratti, chiazze di umidità e
    granulo di cristalli; lontano la tessera si media e l'orizzonte è pulito, senza i puntini che sfarfallavano;
  - la terra della Secca ha crepe vere: fessure da un filo a una spaccatura di una dozzina di pixel, con la polvere
    chiara depositata ai bordi, piastre che si incurvano ognuna a modo suo, zone più pallide e piastre scure e umide,
    crepe sottili dentro una piastra su due; spariscono i contorni a «mappa» e i sassolini rosa; la preparazione della
    terra passa da 0,93 a 0,60 s;
  - la mano che scrive: il corsivo delle lettere e della busta è tracciato con un pennino (più grosso nelle discese,
    più sottile nelle salite), con la pressione che cambia da lettera a lettera, la riga che ondeggia piano e
    l'inchiostro che ristagna a fine parola; la riga che si sta scrivendo ha il bordo bagnato che sfuma;
  - il biglietto «NON È IL CASO DI TORNARE.» è scritto a mano in stampatello a pennarello, col carattere
    **Covered By Your Grace** (Kimberly Geswein, licenza OFL 1.1, sottoinsieme latino di 16 kB in `app/public/fonts/`,
    scelto fra quattro candidati): ogni lettera si svela dietro la punta, da sinistra a destra, invece di comparire di colpo.
- **Per chi sviluppa:** `strumenti/trailer-preparazione.cjs` dice quanto ci mette a prepararsi ogni scena; `campoLento()`
  in `trailer/texture.ts` dà campi lenti (toni a zone, umidità) calcolati a griglia e interpolati.

## [1.17.1] - 2026-10-20

### Cambiato
- **Il trailer, il suono** (la musica, i tempi e i testi sono quelli di prima; la lista dei 222 eventi sonori ha gli stessi
  tempi, tipi e livelli):
  - l'immagine e i rumori seguono ciò che si sente, non ciò che il file ha già decodificato: il trailer sottrae la
    latenza d'uscita del contesto audio (circa 40 ms con una scheda normale, di più con le cuffie senza fili; non più
    di 250 ms) al tempo del brano, e i rumori partono con la stessa latenza d'anticipo, così cadono insieme alla musica e
    al fotogramma (circa tre fotogrammi di anticipo dell'immagine sul suono, prima);
  - i passi hanno la materia del terreno: asfalto secco sulla provinciale, crosta di fango che scricchiola nella secca,
    sale che si schiaccia sull'invaso, sassi che rotolano al guado; ogni passo è un po' diverso dall'altro (altezza,
    livello ±2 dB), ma lo stesso trailer suona sempre uguale; sinistro e destro sono appena separati nello stereo e i
    rumori passano da una «stanza» brevissima; carta e tasti hanno le loro variazioni.
- **Per chi sviluppa:** `strumenti/trailer-rumori.cjs` rende offline i rumori con la musica sotto, in un WAV, per
  ascoltare un «prima» e un «dopo» del suono; i `.wav` di `video/` non sono versionati.

## [1.17.0] - 2026-10-20

### Cambiato
- **Il trailer, luce e pellicola** (solo l'aspetto: durata, ordine, tempi, testi e musica sono quelli di prima):
  - il sole dell'alba e del titolo è dorato, non giallo limone: i grandi aloni si compongono in «screen» e non in
    somma (che portava rosso e verde al massimo insieme e il blu no); la tinta vicino al sole scende da 55° a 42° al
    titolo e da 48° a 39° all'alba, e il sole resta vivo;
  - i raggi di luce dell'alba e del guado hanno i bordi morbidi, come luce nella polvere, e si dipingono una volta sola
    (prima ogni fotogramma tracciava nove e otto spicchi dai lati netti);
  - **la grana è di pellicola**: grano fine di 1–1,4 pixel veri (prima era un fruscio che cambiava con lo schermo: 2×2
    pixel a 4K), con un filo di colore, più viva nei mezzitoni; cambia a 24 fotogrammi al secondo e dal tempo, non dal
    caso, quindi anche i video esportati escono uguali; la stessa intensità a 1080p, 1440p e 4K (σ 4,0 contro 5,7·4,0·3,8);
    i neri sono più profondi (la vecchia grana li velava di grigio) e il banding dei gradienti scuri resta coperto;
  - la notte dell'invaso ha materia: la diga conserva il 15–20 % del suo cemento (le arcate) sotto un velo freddo, con
    il bordo della luna sul ciglio e sulla torre, e sul sale un velo di riflessi di stelle.
- **Per chi sviluppa:** `strumenti/trailer-clip.cjs` esporta un breve video del trailer con la sua musica (per i
  confronti prima/dopo in movimento); i video esportati con la grana nuova pesano un terzo di prima.

## [1.16.2] - 2026-10-20

### Corretto
- **Il trailer, rifinito nei dettagli** (solo l'aspetto: durata, ordine, tempi, testi e musica sono quelli di prima):
  - nel cielo dell'alba, del guado e dell'invaso non corre più una cucitura verticale che scorreva con le nuvole
    (la tessera si ripeteva con un gradino di luminosità);
  - nelle lettere il tavolo segue la macchina che avanza: le assi scivolano quanto la busta e i fogli;
  - nella mappa i nomi delle tappe stanno fuori dai disegni dei luoghi e non li attraversano più;
  - nei «cinque modi» «rinunciare» ha il suo respiro (colonne di 330 px, verbi a 56 px);
  - le due parole su cui il trailer batte, «A piedi.» e «tuo fratello.», si leggono sul cielo (da 1,9:1 a 4,7:1 e da
    2,1:1 a 4,2:1 sul fondo vicino) grazie a un velo scuro e morbido che entra ed esce con loro;
  - tipografia: gli apostrofi dei testi grandi sono quelli tipografici (l’acqua, L’invaso morto), le regole a 76 px non
    hanno più la «l» e la «t» di «scelte» a contatto, e le quattro cifre dei numeri hanno la stessa distanza dal filetto;
  - il titolo entra sul colpo grave del brano e poi si assesta (era al 56 % a 82,8 s).

## [1.16.1] - 2026-10-20

### Corretto
- **Un errore della pagina finisce una sola volta nel registro tecnico del desktop.** Un errore non preso, una
  promessa rifiutata o un errore di disegno comparivano due volte: dalla console e dal canale del registro. Ora
  il confine d'errori li scrive lui, con la sua limitazione (uno ogni 5 s, 200 righe), e il browser non li ripete
  in console. Provato in un Electron vero: un errore, una riga; un `console.error` diretto resta nel registro.
- **La data della build è il giorno di chi costruisce**, non quello UTC (`app/vite.config.ts`), come già nelle
  versioni.

### Cambiato
- **Per chi sviluppa:** l'esploratore è riproducibile (lo stesso seme dà le stesse partite: scorreva la bisaccia,
  un insieme, in un ordine che cambiava a ogni avvio di Python) e, per ogni stallo, prova con le uscite dove si
  può ancora andare e lo scrive nel rapporto, con lo stato in cui la partita è rimasta.
- **Per chi sviluppa:** il banco di confronto del trailer (`strumenti/trailer-cattura.cjs`, `trailer-confronta.mjs`,
  `trailer-misura.cjs`): catture deterministiche a istanti scelti, confronto «prima e dopo» con il PSNR e costo di
  un fotogramma, in un Electron fuori schermo. Prima di ogni ritocco all'aspetto del trailer.
- Il foglio dei tempi del trailer dice 14 personaggi, come il trailer, il README e le schede (il 13 era di prima
  di Imma).

## [1.16.0] - 2026-10-20

### Aggiunto
- **Il panorama sa dov'è il viandante.** Nel bar, in casa, all'osteria, nel casotto, nella serra, nella grotta,
  nella torre di presa, nella condotta e nel sottopasso lo sfondo non è più lo skyline all'aperto: sono scene
  d'interno con la tavolozza della zona più scura, senza sole né colline, e la luce che c'è lì (la lampada e le
  bottiglie del bar, la finestra e la foto storta di casa, il camino dell'osteria, la branda e gli attrezzi del
  casotto, i vetri opachi della serra, la porta di tavole della grotta, le feritoie della torre, l'uscita in fondo
  alla galleria). Il viandante resta, cammina al cambio di luogo e il pavimento scorre sotto i piedi; entrando e
  uscendo la scena si dissolve come fra una zona e l'altra. A fine partita il panorama torna all'aperto.
- **Per chi sviluppa:** `window.__panorama.imposta(clima, luogo)` e `.prova(n)` (solo in sviluppo) per guardare e
  misurare ogni scena; `desktop/prove.cjs` prova senza Electron il registro e il controllo dei canali IPC;
  `strumenti/prova-data.mjs` la data delle versioni; `collaudo/salvataggi.py` prova che un caricamento rotto a
  metà lasci il ponte com'era; la CI esegue anche un giro corto dell'esploratore (non blocca).

### Cambiato
- **«Come si gioca» e il taccuino si leggono meglio.** Nessun testo sotto gli 11 px (prima fino a 7,8 px nella
  partita); la guida è più larga e ci sta a 1280×720 senza scorrere, a 960×540 e nel menu del trailer. Nel
  taccuino esporta ed elimina salgono sulla riga del nome del luogo.
- **I contrasti arrivano a 4,5:1 ovunque.** Controllati in inizio, dialogo, conferma, pannelli, taccuino, guida e
  partita persa, con gli otto accenti di zona: il segnaposto del comando, le voci passate del diario (si attenua il
  colore del testo, non più l'intera voce), il prompt del comando, «bevi»/«mangia» sotto le scorte, la conferma e
  i testi piccoli sul panorama (testata e nome del luogo, anche sul cielo bianco del sale).
- **Storia:** il paragrafo di chiusura dei finali («Dietro di te, la strada. …») si scrive una volta sola, come
  testo con un nome. Il testo che il giocatore legge non cambia di un carattere (provato su tutte le 512
  combinazioni dei suoi fatti e sulle trascrizioni dei dodici percorsi); cambia l'impronta dell'avventura, quindi i
  salvataggi vecchi si ricostruiscono e il gioco lo dice.
- **Pyodide 0.27.8** (era 0.27.2); gli avvisi npm sistemati senza forzare niente (restano 8 moderati negli
  strumenti di build di electron-builder).

### Corretto
- **Un caricamento fallito a metà non lascia il motore con un mondo parziale** mentre lo schermo mostra ancora
  quello di prima: il ponte ripristina mondo, sequenza e posizioni di ANNULLA.
- **Gli errori non presi** (gestori di eventi, timer, promesse rifiutate) finiscono nel registro tecnico, senza
  nessuno schermo d'errore; un `play()` rifiutato dell'audio è solo un avviso.
- **Le schede del taccuino non hanno più pulsanti dentro un pulsante**: la scheda è un contenitore, con un
  pulsante per tutta l'area (preso dai suoi testi) ed esporta ed elimina come pulsanti a parte. Meglio per chi
  usa un lettore di schermo; il fuoco da tastiera ora si vede.
- **Il registro tecnico del desktop ruota anche durante la sessione** oltre 1 MB, non solo all'apertura.
- **`versione.mjs prepara` data il CHANGELOG col giorno locale**, non quello UTC: fra mezzanotte e le 2 in Italia
  dava il giorno prima (è successo alla 1.15.0, che qui sotto ora porta la data giusta).

### Sicurezza
- **I canali fra la pagina e il processo principale controllano chi li chiama**: devono arrivare dal frame
  `app://gioco` (con l'utente e la porta nell'indirizzo non passa più). Un solo punto, `desktop/ipc.cjs`.
- **Le fuse di Electron sono chiuse** nel pacchetto: niente `ELECTRON_RUN_AS_NODE`, `NODE_OPTIONS` né `--inspect`,
  si carica solo l'asar (con la sua integrità), niente privilegi speciali per `file://`, cookie cifrati.
- **L'azione che crea la release è fissata per SHA di commit**, non per un tag che si può spostare.
- **README: sezione «Sicurezza»**: gli eseguibili non sono firmati e l'aggiornamento automatico si fida del solo
  account GitHub; che cosa protegge, che cosa no, come si verifica un pacchetto con gli hash di `latest.yml`.

## [1.15.0] - 2026-10-20

### Aggiunto
- **Il diario si lascia leggere dagli schermi parlanti.** È una regione viva (`role="log"`,
  `aria-live="polite"`): il testo nuovo viene letto da sé.
- **Se una schermata non si disegna, niente più schermo nero.** Un messaggio e il pulsante «← torna
  all'intro»; l'errore finisce nel registro tecnico.
- **Bere e mangiare anche all'infinito.** «bere un sorso», «bere due sorsi», «bere 3», «mangiare qualcosa»,
  «mangiare una porzione», «mangiare 2 porzioni» (con la cifra o con la parola) valgono come «bevi due sorsi»
  e «mangia una porzione». Prima il gioco rispondeva «Non vedo 'una porzione' qui».
- **Per chi sviluppa:** `strumenti/esporta-loghi.cjs` esporta i due loghi d'apertura in video 4K a 60 fps, con
  il loro suono (la stessa partitura del gioco, resa offline), dalle animazioni vere. `collaudo/scorte.py`
  prova anche le forme all'infinito; `collaudo/mirate.py` ha due prove per Saverio; `collaudo/esploratore.py`
  segnala i verbi sinonimi che portano a stati diversi (come `favella.py esplora`), senza far fallire il collaudo.

### Cambiato
- **Esc chiude «Come si gioca»** anche in partita. La guida e il taccuino portano il fuoco dentro, tengono
  Tab fra i propri controlli e alla chiusura lo restituiscono.
- **Il testo piccolo si legge meglio.** Etichette, suggerimenti, voci passate del diario e note hanno un
  contrasto di almeno 4,5:1 (ora oltre 6:1), e nessuna etichetta scende sotto gli 11 px; nelle scorte la
  scritta «bevi» / «mangia» passa sotto il numero.
- **Saverio, a fiducia 2 o più,** alla richiesta d'acqua non dice più «Portami un motivo per fidarmi»: accenna
  alla corda e lascia calare la tanica.
- **Salvataggi:** cambia l'impronta dell'avventura (i `.fav`); chi ricarica una partita vecchia la trova
  ricostruita, e il gioco lo dice. Un salvataggio con il diario guasto (voci, blocchi, incontrati, storia) si
  carica lo stesso, con un valore di ripiego per i pezzi mancanti.

### Corretto
- **La nota «Dopo, se ti pesa, puoi tornare indietro con ↶ annulla»** compariva sempre nella conferma, anche
  dentro un dialogo che continua o per una scelta che chiude il viaggio, dove il pulsante non c'è. Ora
  compare solo quando annulla potrà davvero disfare la scelta.
- **Desktop:** l'indirizzo e il percorso dei file dell'app si controllano per intero (host `app://gioco`,
  cartella `web/`), non più per prefisso. Ogni scrittura di un salvataggio ha il suo file temporaneo e più
  scritture dello stesso posto si mettono in fila; se il file di un posto è illeggibile si rilegge la copia di
  riserva (`.bak`).

## [1.14.0] - 2026-10-15

### Aggiunto
- **I loghi d'apertura si creano davanti a chi guarda.** Il marchio nuovo di **Runtime Multimedia**, a
  colori: nel buio si accende uno schermo come un vecchio televisore, una testina di lettura scrive
  RUNTIME e MULTIMEDIA lettera per lettera, arriva in fondo e diventa il lato del triangolo «play», che
  si chiude, si riempie e lancia i suoi pixel; poi lo schermo si spegne come un tubo catodico. Il logo di
  **FAVELLA 1**: una scintilla accende la gemma, il libro si apre, le pagine si aprono a ventaglio, le
  graffe del codice si disegnano attorno, poi la scritta lettera per lettera e il motto battuto a
  macchina. Tutto vettoriale, nitido a ogni risoluzione; Esc li salta e con «riduci movimento» non si
  mostrano, come prima.
- **Il suono dei loghi.** Ogni gesto ha il suo: il tonfo e il ronzio del televisore che si accende, i bip
  delle lettere, la zip e il colpo del triangolo «play» con il suo accordo, le scintille dei pixel, lo
  spegnimento; la scintilla della gemma, il libro che si apre, le pagine che frusciano su un arpeggio
  d'arpa, il motto a tasti, sopra un accordo caldo che sfuma col logo. È sintetizzato dal vivo (Web
  Audio, nessun file in più) e scritto sugli stessi istanti delle animazioni. Sul desktop si sente da
  sé; nel browser, come la musica del trailer, solo se la pagina ha già avuto un clic o un tasto.
- **Il nome dell'autore nel gioco.** Sotto il titolo del trailer, e quindi nel menu d'avvio, c'è «un
  gioco di Simone Pizzi». La storia dichiara titolo e autore (`Il titolo è "Il Viaggiatore".`,
  `L'autore è "Simone Pizzi".`): il motore li stampa quando la si gioca nel terminale, nella galleria
  del sito di FAVELLA e in Favella Studio.

### Cambiato
- **Il motore FAVELLA dentro il gioco passa dalla 1.4.4 alla 1.5.0** («le lezioni del Relitto»). Le
  storie scritte per la 1.4 restano identiche: il motore è stato provato su undici storie ufficiali, Il
  Viaggiatore compreso, con impronta e testo uguali a ogni comando. Per chi gioca, nei comandi la
  tipografia non conta più: un apostrofo curvo scritto dal telefono («l’orologio») vale come quello
  dritto. Le undici suite di `collaudo/` sono verdi (100 partite a caso, nessuna anomalia).
- **Salvataggi:** cambiano il motore e l'impronta dell'avventura; chi ricarica una partita vecchia la
  trova ricostruita, e il gioco lo dice.
- **Per chi sviluppa:** i tre stati delle voci («si dice di te») sono dichiarati `(voluto)`, perché li
  legge solo l'interfaccia: dalla 1.5.0 il compilatore avvisa degli stati che si scrivono e non si
  leggono. `collaudo/testo.py` e `strumenti/mappa-narrativa.py` riconoscono la nuova forma. I loghi
  raster (`app/src/assets/loghi/`) lasciano il posto alle forme vettoriali e alle animazioni in
  `app/src/loghi/`.

## [1.13.2] - 2026-10-07

### Aggiunto
- **Anteprima social della versione web.** Il link a GitHub Pages mostra ora il banner (immagine e descrizione
  Open Graph) quando lo si condivide; la descrizione dice 14 personaggi, come il README.

## [1.13.1] - 2026-10-07

### Corretto
- **Nel browser la musica del trailer non partiva.** Il clic che chiude l'avviso arrivava prima che il
  trailer esistesse, e il trailer aspettava un gesto che non sarebbe più venuto. Ora, se la pagina ha
  già avuto un gesto, la musica parte da sola (sul desktop partiva già).

## [1.13.0] - 2026-10-07

### Aggiunto
- **Il tasto «✕ esci» in partita.** Nella barra in alto, accanto a «salva», «carica» e «← intro», e
  nella schermata finale accanto a «← intro»; chiude il gioco (solo nella versione desktop, come
  nel menu iniziale). Se c'è strada non salvata, scrive prima il posto automatico, come «← intro».

### Cambiato
- **Per chi sviluppa:** i due video del trailer in `video/` (non versionati) sono rigirati con la
  grafica attuale; `strumenti/esporta-trailer.cjs` li rifà dal trailer vero.
- **Il README** ha il banner del titolo (`grafica/banner.jpg`, un fotogramma del trailer), dice che si gioca
  anche a clic e che il progetto è concluso, aperto allo studio e a chi vuole estenderlo.

## [1.12.0] - 2026-10-07

**La versione definitiva.** Il gioco è concluso: la storia, l'app e i collaudi restano come sono.

### Aggiunto
- **Le chiusure raccolgono il viaggio.** Alla soglia, dopo la scena, un capoverso dice che cosa hai
  lasciato per strada: Saverio e il cibo, il cane della serra, la pompa della diga col tuo filtro,
  Vito (al casello, il bluff o a terra), Imma sfamata, l'acqua a Rosaria, Pasquale in piedi, la fede
  venduta a Ciro. Una riga per ciò che hai fatto davvero, nell'ordine della strada; se non hai fatto
  niente, la chiusura è quella di sempre, parola per parola. Vale per tutte e sei.
- **«Chi hai incontrato».** A lato dello schermo la fiducia ha, sotto ogni nome, che cosa gli hai
  fatto: gli hai lasciato da mangiare, le hai legato il filtro alla pompa, gli hai pagato il passaggio,
  l'hai lasciato a terra… Anche Imma e Pasquale, che non hanno barrette, quando c'è un gesto da dire.
  Sono gesti, non conti: non dicono quanto manca, né quale soglia conta.

### Cambiato
- **Salvataggi:** l'impronta dell'avventura cambia; chi ricarica una partita vecchia la trova
  ricostruita, e il gioco lo dice.
- **Per chi sviluppa:** `fili.py`, `interfaccia.py` e `testo.py` provano le due novità; la mappa
  narrativa (`sviluppo/mappa-narrativa.md`) legge anche le condizioni scritte dentro i testi, e le
  conseguenze a distanza passano da 9 a 13. La ramificazione è conclusa
  (`pre-produzione/06-ramificazione.md`, §8).

## [1.11.1] - 2026-10-07

### Cambiato
- **Il motore FAVELLA dentro il gioco passa dalla 1.4.1 alla 1.4.4.** La 1.11.0 conteneva
  ancora la 1.4.1; ora gli installer hanno quello nuovo. Cosa cambia giocando:
  «usa X su Y» si può dire in più modi (1.4.2); una regola «Prima di vai» verso un'uscita che
  non c'è fa passare un turno vero (1.4.3); «usa la tanica su nord» risponde «Non vedi nulla del
  genere qui.» invece di un errore interno (1.4.3); «Con cosa vuoi usarla?» non consuma un
  turno (1.4.3); un salvataggio fatto con un altro motore lo dice al caricamento (1.4.3).
  Per chi scrive: la riga giusta per gli errori trovati dopo la lettura della frase (1.4.4).
  Le undici suite di `collaudo/` sono verdi (100 partite a caso, nessuna anomalia).

## [1.11.0] - 2026-10-01

**La versione definitiva.** Un avviso all'apertura, e il riepilogo di tutto ciò che è cambiato
dall'ultima release (1.7.0): le versioni 1.8.0–1.10.2 non erano mai uscite.

### Aggiunto
- **Un avviso all'apertura**, subito dopo il logo di FAVELLA e prima del trailer: dice che
  questo gioco è nato come demo del linguaggio e motore di narrativa interattiva Favella1, che
  è stato generato con un importante ausilio dei modelli LLM della famiglia Claude, e che lo
  scopo è mostrare come uno script narrativo possa diventare un gioco distribuibile. Si chiude
  con Invio, Spazio, Esc o un clic, oppure da solo dopo venti secondi. Compare a ogni avvio,
  non quando dal gioco si torna all'intro.

### Dalle versioni 1.8.0–1.10.2 (mai rilasciate prima)
- **Voci, bluff, Peppe.** «Si dice di te», a lato dello schermo, riporta ciò che qualcuno ti
  ha detto in faccia (che alzi le mani, che lasci qualcosa a chi resta, che al casello hai
  puntato una pistola scarica). Vito umiliato dal bluff lo racconta, e la voce arriva a Ciro,
  a Tore, a Cosimo. Peppe, se arrivi col sangue addosso, te lo chiede una volta sola.
- **Usare una cosa su un'altra.** Non si offre più la coppia giusta come pulsante: si
  compone («usa su…», poi la seconda cosa), e il gioco non dice quali funzionano.
- **Interfaccia.** I messaggi del motore («Il tempo passa.», «Cosa vuoi esaminare?») stanno
  nello stile di sistema; i pulsanti «inventario» e «stato»; la conferma di un dono dice che
  cosa si dà. Le battute di Imma non finiscono più nella prosa.
- **Il motore FAVELLA 1.4.1**: una mossa verso un'uscita che non c'è non fa passare il tempo;
  posare non ristampa la stanza; «accendi su» non dà più un errore interno. La storia compila
  senza avvisi.
- **I testi**: quindici ritocchi con gli antipattern di prosa; le due righe del corpo più
  frequenti (la sete e la fame) sono nuove.
- **Gli strumenti di sviluppo**: il banco di gioco (`strumenti/gioca.py`) e undici collaudi
  automatici (finali, salvataggi, pulsanti, testo e altri).

### Cambiato
- **Salvataggi:** l'impronta dell'avventura cambia; chi ricarica una partita vecchia la trova
  ricostruita, e il gioco lo dice.
- Il README dice che cos'è questo progetto. La scheda del motore (`motore/LEGGIMI.md`) rimanda al
  repository del motore come fonte, senza annunciare una release che non c'è ancora.

### Collaudo
- `testo.py` custodisce il testo dell'avviso, parola per parola, e la sua posizione fra i
  loghi e il trailer.

## [1.10.2] - 2026-10-01

Una passata sui testi, con gli antipattern di prosa e la tipografia: i testi erano già
puliti, quindi poche righe e mirate.

### Corretto
- **Quindici ritocchi**, ciascuno con la sua ragione: un'immagine da locanda («asciuga un
  bicchiere che è già asciutto») sostituita da una cosa vista (bottiglie vuote, le etichette
  in avanti); la fontana, la diga e l'invaso non sono più tutte «mute»; Iole non è «china
  come su un malato» due volte; via «come specchi», «come bocche», «come un re senza regno»;
  «affonda i denti a fondo» e «completamente scarica» non ci sono più; il cortile della
  masseria non è «silenzioso» ma ha un trattore senza gomme; Nunzio non dice «le colline» due
  volte nella stessa frase.
- **Le due righe del corpo che tornano più spesso** sono nuove: «La testa martella, le mani
  tremano» (sete) è ora «Le mani tremano, la vista si stringe ai bordi»; «Lo stomaco è un nodo
  stretto» (fame) è ora «Lo stomaco ti si è chiuso». E il vento delle colline non «taglia».
- Nessuna meccanica cambia: condizioni, conseguenze, nomi e numeri sono identici a prima
  (lo verifica lo script della passata, riga per riga). L'impronta dell'avventura cambia,
  come per ogni testo: i salvataggi si ricostruiscono, e il gioco lo dice.

### Collaudo
- `testo.py`: ogni messaggio dei demoni «Ogni turno» (la sete, la fame, il cane, il sole, il
  vento: 19) deve restare di corpo, cioè in margine. Se si riscrive una riga nei `.fav` e non
  in `testo.ts`, il collaudo se ne accorge.

## [1.10.1] - 2026-10-01

Il motore passa alla 1.4.1: i quattro difetti che il gioco aveva trovato.

### Corretto
- **Una mossa verso un'uscita che non c'è non fa più passare il tempo.** «ovest» dove non
  c'è niente a ovest costava un turno, e con lui sete e fame: dire «Non puoi andare in quella
  direzione.» è ora gratis, come un comando non capito.
- **Posare una cosa non riscrive più la stanza.** Dopo «Lasciato: il coltello.» compariva di
  nuovo la descrizione intera, con uscite e presenze; ora la frase basta.
- **«Accendi su», «apri nord», «chiudi giù», «mangia est»** davano «[ERRORE CRITICO]
  … 'NoneType' …»: ora dicono «Non vedi nulla del genere qui.».
- La compilazione non dà più avvisi: «colpisci» come «attacca» è voluto, e la storia lo dice
  con `(voluto)`.

### Cambiato
- **Il motore in `motore/` è la 1.4.1** di FAVELLA1 (la correzione dei quattro difetti), copiata
  com'è. Nel repository del motore è in preparazione, non ancora rilasciata.
- **Salvataggi:** le partite con una mossa senza uscita nella sequenza si ricostruiscono con un
  turno in meno; l'impronta dichiara il nuovo motore, e il gioco lo dice al caricamento.

### Collaudo
- `giocate.py`: 6 prove nuove, una per difetto (una mossa senza uscita non costa il tempo;
  posare non ristampa la stanza; i verbi con una direzione non sollevano errori; la storia
  compila senza avvisi, e ne darebbe uno senza `(voluto)`).

## [1.10.0] - 2026-10-01

Quello che si dice di te, il bluff che Vito racconta, Peppe che chiede del sangue.

### Aggiunto
- **«Si dice di te»**, a lato dello schermo, sotto la fiducia: una riga per ogni voce che
  qualcuno ti ha riferito in faccia. Tre voci: «che alzi le mani» (Rosaria, Ciro), «che lasci
  qualcosa a chi resta» (Imma), «che al casello hai puntato una pistola scarica» (Ciro). Non
  compaiono mai prima di essere state sentite.
- **Vito umiliato dal bluff**: se gli hai puntato la pistola scarica, se ne accorge dopo e lo
  racconta. Lo dice lui stesso, se torni al casello («Lo racconto bene»); lo sa Ciro («Quello
  della pistola»), lo sa Tore, lo sa Cosimo («Hai fatto la faccia giusta»; alla minaccia con
  la pistola: «Quella del casello»). Il bluff non è sangue, e non toglie fiducia a nessuno.
- **Peppe e il sangue**: se arrivi in piazzetta con le mani sporche, Peppe te lo chiede una
  volta sola. Puoi dirgli la verità, negare, o non rispondere. Viene o resta come prima, e i
  finali non cambiano; cambia come ti guarda sul valico, al guado e allo sparo.

### Cambiato
- **«Getta cibo» e le sue parole** («getta il cibo», «lancia cibo», «lancia il cibo», «getta»)
  sono dichiarate una volta sola, con i sinonimi del motore: stesso comportamento, la storia
  più corta di undici righe.
- La risposta di Peppe è «Non è così», non «Non è vero»: scrivendo «è vero» il motore ne trovava due.
- **Salvataggi:** l'impronta dell'avventura cambia; chi ricarica una partita vecchia la
  trova ricostruita, e il gioco lo dice.

### Collaudo
- Due percorsi nuovi (`K_peppe_vero`, `L_peppe_bugia`): ora 12. `fili.py`: 104 prove (44 nuove).
  `testo.py` verifica le voci; `interfaccia.py` le espone; la mappa narrativa le sa leggere.

## [1.9.0] - 2026-10-01

Usare una cosa su un'altra, senza che il gioco dica quali coppie funzionano.

### Cambiato
- **«Usa X su Y» non si offre più, si compone.** Fino alla 1.8.0 il pulsante compariva
  appena avevi la cosa giusta nel posto giusto: era la soluzione, scritta sul pulsante. Ora
  tocchi una cosa della bisaccia e scegli «usa su…»: l'elenco ha tutte le cose del luogo e
  le altre della bisaccia, nessuna segnata. Per una cosa del luogo c'è «usa su questo…», con
  la bisaccia. Il motore risponde com'è giusto, anche «non ha alcun effetto particolare»;
  la conferma dei baratti e dei costi funziona come prima. Scrivere il comando è lo stesso.
- «Come si gioca» non cita più una coppia che funziona («usa le pastiglie sulla pompa»).

### Collaudo
- `pulsanti.py` gioca i finali componendo ogni coppia; `interfaccia.py` prova che il ponte
  non elenca più combinazioni, che le coppie composte sono capite e che una sbagliata
  riceve la risposta del motore.

## [1.8.0] - 2026-10-01

L'interfaccia, ripulita da ciò che le partite e il collaudo del testo hanno mostrato.

### Aggiunto
- **I pulsanti «inventario» e «stato»**, accanto a «guarda» e «aspetta»: chi gioca solo
  con i pulsanti ha ora il riepilogo a parole di ciò che porta e di come sta.

### Corretto
- **Le battute di Imma** comparivano nella prosa, come se le dicesse il narratore: nella
  1.7.0 l'interfaccia non la conosceva fra i personaggi.
- **Le risposte del motore stanno nello stile di sistema**, non in quello della prosa:
  «Il tempo passa.», «Non senti nulla di particolare.», «Cosa vuoi esaminare?», «Attacca
  che cosa?», «Con cosa vuoi usarla?», «Non si apre.», «Ce l'hai già.», «Vuoi davvero
  chiudere la partita? (sì/no)», il riepilogo di `stato`, i servizi (annulla, ancora, carica).
- **La conferma di un dono di sole scorte** dice che cosa si dà: «Vuoi davvero dare 2 di
  cibo?», non «Vuoi davvero rinunciarci?».

### Collaudo
- `collaudo/testo.py` (nuovo): prova ogni verbo del motore con ogni genere di bersaglio e
  chiede che ogni risposta sia di sistema; che nessuna delle 526 frasi della storia lo
  sembri; che ogni personaggio dichiarato sia noto all'interfaccia. `pulsanti.py` ora
  pretende anche «inventario» e «stato».

## [1.7.0] - 2026-10-01

Dalle misure del banco di gioco: chi beve e mangia agli avvisi non perde mai vita, e
fra la statale e il mercato non sceglie niente. Ora sceglie. E il gioco non lascia più
sprecare, senza dirlo, l'acqua oltre la tanica.

### Aggiunto
- **Imma, sulla discesa**, l'ultimo tratto prima del paese: una donna del vicolo dietro
  la piazzetta, tornata dal casello dopo aver lasciato a Vito l'ultimo pane. Chiede da
  mangiare. Darle da mangiare costa due porzioni (o l'ultima che hai) proprio dove le
  scorte stringono; chi lo fa arriva al mercato con la bisaccia vuota, ma ha dato. Si può
  rifiutare, e ripensarci. Parla di sé, di Vito («mi ha chiamata sorella») e del paese.
- **La voce corre anche per il bene.** Chi ha sfamato Imma la trova in osteria, già al
  suo tavolo. Senza sangue Rosaria lo sa, e la fiducia sale di uno; col sangue, Imma
  parla per te davanti ai due uomini scesi dalla statale: Rosaria non ti toglie la
  fiducia e alla fine si siede. Il dono conta per la generosità (quattro doni, soglia tre).
- **L'anteprima dice quanta acqua entra davvero.** Quando un baratto dà più acqua di
  quanta la tanica ne tenga, la conferma lo scrive: «4 d'acqua (ne entra 1)», «La tanica
  tiene 10: 3 d'acqua andrebbero persi», «La tanica è già piena».
- **Ciro non spreca la tanica.** Con la tanica senza posto (acqua dall'8 in su, e senza
  la damigiana) non paga più in acqua l'orologio, la batteria, la stecca e le cartucce:
  le stesse merci valgono cibo («La tanica non ha posto: ti do l'orologio per del cibo»).

### Cambiato
- **La generosità sono quattro doni, soglia tre** (Saverio, Rosaria, Pasquale, Imma): chi
  tiene le medicine per sé può arrivarci con Imma, e viceversa. Nessuno dei quattro è gratis.
- **Salvataggi:** l'impronta dell'avventura cambia; chi ricarica una partita vecchia la
  trova ricostruita, e il gioco lo dice.
- I personaggi sono 14 (il trailer e la presentazione lo dicono).

### Collaudo
- Due percorsi nuovi (`I_imma`, `J_imma_sangue`) per `finali.py` e `pulsanti.py`: ora 10.
- `fili.py`: 60 prove (25 nuove: Imma, e Ciro con la tanica). `interfaccia.py` e
  `conferme.py`: l'anteprima e la conferma col tetto della tanica.

## [1.6.1] - 2026-10-01

### Aggiunto
- **Il banco di gioco** (`strumenti/gioca.py`, strumento di sviluppo: non cambia
  il gioco). Si gioca a mano da un file di comandi, leggendo gli ultimi turni con le
  scorte sotto ogni risposta, e un pilota a soglie misura l'equilibrio su più semi.
  Istruzioni in `strumenti/LEGGIMI.md`.

## [1.6.0] - 2026-10-01

Tre partite intere giocate a mano, leggendo il testo come un giocatore: una
attenta, una violenta, una di chi beve e mangia solo quando il corpo fa male.
Quello che hanno trovato è corretto qui.

### Corretto
- **Dal paese la porta non si ritrovava.** La piazzetta diceva «a SUD si torna
  alla porta», ma a sud non c'era niente, e a est c'era il mercato. Ora il
  mercato è a **sud** della piazzetta e la porta a **est**, come dice il testo.
  Chi ha salvato dopo essere stato al mercato ricarica una partita ricostruita.
- **Al guado si capiscono le parole che si scrivono davvero**: «spara a Cosimo»,
  «uccidi Cosimo», «colpisci Cosimo», «usa il fucile su Cosimo» fanno quello che
  fa «attacca Cosimo». «Minaccia Cosimo» non risponde più «Nessuno qui ti ha
  fatto niente»: col fucile in mano Cosimo dice «O spari, o lo posi»; con la
  pistola scarica se ne accorge, e la veglia si rompe. «Uccidi», «picchia»,
  «ammazza» valgono anche per il cane e per Vito.
- **Peppe non beve più dalla tua tanica in mezzo alla scena del guado**, né sulla
  strada di casa.
- **Chi torna a parlare non si sente ripetere il benvenuto.** Cosimo non ripete
  l'accusa subito dopo averti detto la verità («Hai altro da dirmi, o hai
  finito?»); Onofrio non ti riconosce due volte; Tore ricomincia a contare le
  pecore; Rosaria, Ciro e Nunzio tagliano corto.
- Rosaria, col sangue addosso, nel dialogo è fredda come all'accoglienza; e non
  asciuga più «un bicchiere già asciutto», che è il gesto di Nunzio.
- Alla pompa «bevi a lungo» disseta davvero.
- Gettato il cibo al cane, il testo dice che prendi le conserve; «CONSERVE» non è
  più scritto in maiuscolo come una cosa da toccare.
- «Parla con l'uomo», al pozzo, è Saverio; «parla con il fratello», al guado, è
  Cosimo.
- La foto storta della casa di Acquaviva («Ti viene da raddrizzarla») si può
  esaminare e raddrizzare.
- Dopo l'accoglienza di Rosaria non compaiono più, per un turno, sete −1 e vita 11.
- Pulsanti: non compaiono più i gesti che direbbero soltanto di no («Minaccia
  Vito» a sbarra alzata, «Attingi» al pozzo prima della fiducia di Saverio,
  «Curati» quando stai bene); due gesti che fanno la stessa cosa alla stessa
  persona sono un pulsante solo. La conferma della violenza riconosce anche
  «spara», «uccidi», «picchia».

### Cambiato
- **Le ferite guariscono camminando.** La vita risale di 1, una volta ogni tanto,
  quando sete e fame stanno sotto i loro avvisi (prima servivano sete e fame al
  massimo 3, cioè mangiare prima della fame: non succedeva quasi mai, e ogni morso
  e ogni crisi restavano per sempre). Chi beve e mangia agli avvisi non è mai in
  pericolo; il percorso violento costa ancora, ma si riprende; chi beve solo
  quando la testa martella arriva a casa con due o tre tacche di vita, invece di
  morire con la tanica piena.
- **Il cane della serra, la prima volta, ringhia e non morde**: c'è un turno per
  gettargli il cibo, attaccarlo o andarsene.
- Quando la sete o la fame fanno male, la riga lo dice: «(BEVI.)», «(MANGIA.)».
- **Ciro cambia l'acqua in cibo** (tre d'acqua per due di cibo): dopo la pompa
  l'acqua abbonda e il cibo stringe.
- **La generosità conta tre doni, e servono tutti**: a Saverio, a Rosaria (la
  brocca), a Pasquale (le medicine). Il dono a Iole non conta più: senza, la pompa
  non va, e lo pagano tutti; un prezzo non è un dono. Con quattro doni contati,
  «3 su 4» arrivava quasi da sola, anche a chi aveva ucciso il cane e picchiato
  Vito.
- Collaudo nuovo `collaudo/giocate.py` (32 prove): l'equilibrio di sete, fame e
  vita su dodici semi per tre modi di giocare, e tutto quello che le partite
  hanno trovato.

## [1.5.0] - 2026-09-30

### Aggiunto
- **La voce corre lungo la strada.** Come passi e cosa lasci a chi è rimasto arriva
  prima di te. Chi uccide il cane della serra o alza le mani su Vito trova Rosaria
  più fredda (l'acqua e i legumi sì, la fiducia no: il permesso costa di più), Ciro
  che sa del casello, Tore che «ha saputo anche il resto», e un fratello che al guado
  guarda le tue mani prima della tua faccia. Chi lascia acqua o cibo ad almeno tre
  fra Saverio, Iole, Rosaria e Pasquale (le medicine), se lo sente dire da Cosimo;
  Onofrio sa di Pasquale, e della febbre. Il bluff con la pistola scarica non conta: non muore
  nessuno.
- **Al guado, col fucile, c'è una terza via: posarlo** (`lascia il fucile`). Se per
  strada non c'è stato sangue e hai lasciato qualcosa ad almeno tre di quelli che sono
  rimasti, Cosimo riconosce il gesto e si sposta. Altrimenti bisogna restare disarmati
  davanti a lui (la veglia: tre turni, cinque e più sete se c'è stato sangue).
  Riprendere il fucile, o alzare le mani su di lui, la rompe. Nessuno è più costretto
  a sparare.
- **La strada di Acquamorta ricorda**: una riga, prima della soglia, su quello che si
  è saputo di te.
- Collaudo nuovo `collaudo/fili.py` (35 prove); due percorsi nuovi nel collaudo dei
  finali e in quello dei pulsanti (il fucile posato; la veglia dopo aver ucciso il cane).

### Cambiato
- I sei finali non cambiano, ma vi si arriva per più strade. Chi ha salvato con la
  1.4.0 ricarica la partita: il gioco la ricostruisce su questa versione e lo dice.
- `strumenti/mappa-narrativa.py` legge anche gli effetti scritti dopo i due punti
  («Quando …: aumenta la generosità di 1.»).

## [1.4.0] - 2026-09-29

### Cambiato
- **Usare una cosa su un'altra, con i pulsanti, è preciso.** Prima «Usa…»
  proponeva ogni cosa della bisaccia su ogni cosa del luogo, e quasi sempre la
  risposta era «non ha alcun effetto particolare». Ora il motore dice quali
  combinazioni la storia prevede qui e adesso (le pastiglie sulla pompa, la chiave
  inglese sulla grata, le medicine a Pasquale, la lettera e il biglietto a Cosimo),
  e solo quelle diventano pulsanti: fra le azioni del luogo («Usa le pastiglie
  sulla pompa») e nel menu delle due cose («usa sulla pompa», «usa le pastiglie»).
  Compaiono quando hai con te la cosa giusta nel posto giusto, spariscono quando
  non servono più. Scrivendo si può ancora provare qualsiasi combinazione.
- Il menu di una persona o di un animale offre anche i gesti che la storia
  prevede per lei (attacca il cane, minaccia Vito).
- Collaudo nuovo: i sei finali della storia giocati **solo con i pulsanti**
  (`collaudo/pulsanti.py`, in CI e nel rilascio).

## [1.3.0] - 2026-09-29

### Aggiunto
- **«Vuoi bere?» «Vuoi mangiare?»**: l'acqua e il cibo fra le scorte (e la tanica
  nella bisaccia) ora si toccano, e aprono un pannello con le dosi: un sorso, due,
  tre; una porzione, due, tre. Ogni dose dice cosa farebbe (sete 8 → 0, acqua 3 → 1)
  ed è un comando del gioco, un turno solo: `bevi due sorsi`, `mangia tre porzioni`.
  Si smette di offrire dosi alla prima che toglie tutto il bisogno: niente acqua
  sprecata.
- **Scelte che costano chiedono conferma**, con il conto di ciò che si dà e di ciò
  che si riceve, come resterebbero le scorte, e «No» come pulsante di partenza:
  baratti (Nunzio, Ciro, Tore), doni (Saverio, Iole, Rosaria), pagamenti (Vito),
  le cose che si consumano (`curati`, le pastiglie sulla pompa, le medicine a
  Pasquale), l'acqua salmastra, la violenza (`attacca`, `minaccia`) e le svolte
  della storia (Peppe che viene o resta, il lascito di Onofrio). Parlare, chiedere,
  esaminare, muoversi: mai. Il motore mostra in anteprima ciò che succederebbe su
  una copia del mondo, senza farlo: il conto è quello vero.
- **Pulsanti e parser dicono le stesse parole.** Le azioni che il luogo suggerisce
  a parole (ATTINGI al pozzo e alla sorgente, GETTA CIBO alla serra, CURATI con le
  medicine, ATTACCA il cane, MINACCIA Vito) sono anche pulsanti, e compaiono solo
  dove servono. «Usa…» compone `usa X su Y` scegliendo le due cose (da una cosa
  della bisaccia, da una del luogo, o dal pulsante generale). Le parole in
  maiuscolo del testo si toccano: un'uscita ci porta là, una cosa apre il suo menu.
  Accanto agli sguardi: `guarda`, `aspetta`.
- **↶ annulla** accanto al campo dei comandi (Ctrl+Z col campo vuoto). Le domande
  di conferma del motore («Vuoi davvero chiudere la partita?») hanno i loro sì e no.

### Cambiato
- **`mangia` e `bere` soli funzionano**, e così `mangia cibo`, `mangia una
  porzione`, `bevi acqua`, `bere acqua`, `bevi un sorso`, `bevi 2`, `mangia 3`… La
  forma vecchia `mangia qualcosa` resta valida (è dentro i salvataggi già fatti). I
  suggerimenti del testo dicono MANGIA.
- La bisaccia ha sempre lo stesso ordine (quello della storia); prima cambiava a
  ogni partita.
- «esci» e «sì» digitati riportano all'intro, invece di mostrare la schermata di
  fine viaggio.
- **Il trailer è ridipinto da cima a fondo, con gli stessi tempi, gli stessi testi
  e la stessa musica.** Niente più forme piatte: ogni inquadratura ha la sua
  materia. Il tavolo di noce con le lettere in corsivo, le pieghe, la busta col
  francobollo e la penna; l'alba con nuvole, raggi, quattro piani di monti, masserie,
  cipressi e pali del telegrafo coi loro fili; il fango screpolato visto da vicino,
  con stivali, pantaloni e la tanica di lamiera; l'invaso di sale con la diga, la
  torre e la barca arenata, che di notte ha la Via Lattea, la luna e il faro; la
  mappa a curve di livello con le tappe; il guado a controluce, con Acquamorta che
  si specchia nell'acqua. Il viandante è una figura articolata con un passo vero
  (il piede che poggia sta fermo a terra, il cappotto arriva in ritardo, la tanica
  dondola). Nuovi anche i cinque segni di chi è rimasto (il pozzo, la pompa, la
  sbarra, il bicchiere, il cavallo di legno) e le cinque regole (la spina dorsale
  che si riempie di sete, la moneta, la porta, le tacche di vita, l'albero delle
  scelte).
- **Il trailer parte senza attese e non va a scatti.** Le tele si dipingono a pezzi
  mentre girano i loghi; se il computer è lento compare «Preparo il viaggio» con
  una barra, e se i fotogrammi restano lenti a lungo la risoluzione scende da sola.
- La schermata d'avvio dice che si può scrivere in italiano **o** scegliere con i
  pulsanti.

## [1.2.0] - 2026-09-29

### Cambiato
- **Motore FAVELLA 1.4.0** al posto della 1.2.1: è la stessa versione che fa
  girare *Il Viaggiatore* sul sito di FAVELLA. La storia non cambia.
- **I comandi non capiti non fanno passare il tempo.** Un refuso, un verbo
  sconosciuto o un oggetto che non c'è non consumano più un turno, e quindi
  nemmeno un sorso d'acqua o un boccone.
- **Più verbi e più direzioni**: `aspetta` (`z`), `x`, `l`, `su`, `giù`, `entra`,
  `sali`, `scendi`, `tocca`, `spingi`, `tira`, `annusa`, `ascolta`, `dai`,
  `mostra`, `indossa`, e altri. `prendi tutto`, `prendi la mappa e il coltello`.
- **Messaggi in italiano più corretto** («Preso: la mappa.»). `esci` e
  `ricomincia` chiedono conferma prima di chiudere la partita o azzerarla.
- Le regole scritte per un verbo valgono anche per i suoi sinonimi
  (`posa la tanica` rispetta la regola della tanica come `lascia la tanica`).
- I salvataggi delle versioni precedenti si caricano: vengono rigiocati sul
  motore nuovo e, se contenevano comandi non capiti, la partita ricostruita ha
  meno turni di prima. Il gioco lo dice già al caricamento.

## [1.1.1] - 2026-09-23

### Corretto
- **Motore FAVELLA 1.2.1**: ANNULLA riporta indietro anche la memoria di
  ANCORA. Dopo «prendi la mappa» e «annulla», il comando «ancora» non rifà la
  presa appena disfatta ma il comando che la precedeva.

## [1.1.0] - 2026-09-23

### Cambiato
- **Motore FAVELLA 1.2.0** al posto dell'anteprima 1.1.0: è la versione
  rilasciata del motore e contiene il posto iniziale degli oggetti nato per
  questo gioco. I salvataggi della 1.0.0 si caricano ancora: vengono rigiocati
  sul motore nuovo e il gioco avvisa che la partita è stata ricostruita.
- Scrivere «salva» o «carica» nella riga dei comandi ora rimanda a F5, F9 e al
  taccuino, invece di rispondere «Non capisco questo verbo.».

## [1.0.0] - 2026-09-23

Prima versione pubblica.

### Aggiunto
- **L'avventura completa**: 7 zone, 39 luoghi, 13 personaggi, 6 finali di storia
  e 3 morti (sete, fame, ferite), scritta in FAVELLA 1 (motore 1.1.0 incluso).
- **Versione desktop per Windows e Linux** (Electron) a schermo intero, senza
  rete: installer e versione portatile per Windows, AppImage e pacchetto .deb
  per Linux.
- **Loghi d'apertura** (Runtime, FAVELLA) e **trailer** di 88 secondi con la
  colonna sonora originale; Esc salta i loghi e il trailer.
- **Salvataggi**: il taccuino con sei posti e un posto automatico (a ogni
  cambio di luogo), F5 per salvare e F9 per caricare, «Continua il viaggio»
  nel menu, esportazione e importazione di file `.viaggiatore`. Un salvataggio
  ricaricato riproduce la partita identica, ANNULLA compreso.
- **Aggiornamento automatico** dell'installer Windows e dell'AppImage Linux
  dalle release di GitHub, con avviso e «riavvia ora».
- **Registro tecnico** della versione desktop, da allegare alle segnalazioni.
- Guida «come si gioca», interfaccia con panorama per zona, diario impaginato,
  dialoghi e oggetti come pulsanti, corpo e scorte con le soglie.
- Versione e commit della build nel menu e in ogni salvataggio.

### Cambiato
- Le stanze non descrivono più nella loro prosa gli oggetti che si possono
  prendere: ogni oggetto ha il suo *posto iniziale*, che sparisce quando lo si
  prende.

### Corretto
- Le morti per sete e per fame mostrano la loro frase: prima si moriva sempre
  con quella generica, perché la vita finiva prima della soglia estrema.
