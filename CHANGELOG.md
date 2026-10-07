# Registro delle modifiche

Tutte le modifiche rilevanti al gioco, versione per versione. Formato
[Keep a Changelog](https://keepachangelog.com/it/1.1.0/); numeri di versione
[SemVer 2.0.0](https://semver.org/lang/it/) secondo le regole di
[`sviluppo/VERSIONI.md`](sviluppo/VERSIONI.md). Il *come* e il *perché* di ogni
passo stanno nel [diario di sviluppo](sviluppo/DIARIO.md).

## [Non rilasciato]

## [1.13.0] - 2026-10-07

### Aggiunto
- **Il tasto «✕ esci» in partita.** Nella barra in alto, accanto a «salva», «carica» e «← intro», e
  nella schermata finale accanto a «← intro»; chiude il gioco (solo nella versione desktop, come
  nel menu iniziale). Se c'è strada non salvata, scrive prima il posto automatico, come «← intro».

### Cambiato
- **Per chi sviluppa:** i due video del trailer in `video/` (non versionati) sono rigirati con la
  grafica attuale; `strumenti/esporta-trailer.cjs` li rifà dal trailer vero.

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
