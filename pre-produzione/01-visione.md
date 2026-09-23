# IL VIAGGIATORE — Documento di visione

> Pre-produzione · Strato 1 di 6 · **v1.0, allineato al gioco (23/09/2026)**
> Avventura testuale parser-based per il motore FAVELLA 1 (v1.1.0).
> Direzione meccanica: **GDR leggero e narrativo**, pochi numeri, scelte che pesano.
>
> La v0.1 era la bozza di partenza. Questa versione descrive il gioco com'è nei file
> di `prototipo/`, che restano la fonte di verità; le scelte cambiate strada facendo
> sono raccolte in fondo, al §11.

---

## 1. Logline

Un uomo torna a casa a piedi attraverso un sud che si è svuotato, perché l'acqua se n'è andata prima delle persone. Le lettere di sua moglie hanno smesso di arrivare; l'ultimo biglietto, in stampatello e senza firma, dice soltanto: «Non è il caso di tornare.» Lui torna lo stesso, e il cammino, tappa dopo tappa, gli chiede se «casa» esista ancora.

## 2. Genere e forma

- **Genere:** avventura testuale di sopravvivenza e cammino. Realismo dolente, niente fantasy, niente fantascienza spettacolare.
- **Registro:** dramma intimo su sfondo di crollo lento. Malinconia, dignità, rari momenti di calore. Niente eroismo, niente «ultima speranza dell'umanità».
- **Voce:** seconda persona singolare, tempo presente. («Un greto di pietre bianche, un filo d'acqua morta in mezzo.»)
- **Punto di vista morale:** ambiguo per scelta. Il gioco non dice mai chi ha ragione. Le scelte costano e non si bilanciano.

## 3. Il mondo — *la Secca*

Non c'è stata una bomba, né un virus, né un giorno in cui tutto è finito. C'è stata **la Secca**: un decennio in cui l'acqua ha smesso di tornare. Le falde si sono salate, gli invasi si sono insabbiati, i pozzi hanno tirato su fango e poi niente. Lo Stato non è crollato di colpo: si è **ritirato per moduli**, comune dopo comune. Prima i treni locali, poi l'autobus, poi il servizio idrico. Acquamorta non ha più nemmeno un comune: i suoi morti li segna il registro del paese vicino. La gente non è morta in massa. Se n'è andata, un trasloco alla volta, finché restare è diventata una scelta e non una condizione.

Quello che il giocatore attraversa non è una rovina fumante. È **un sud abitabile che nessuno abita più**. Serre di vetro opache di salsedine. Una statale intatta e inutile. Un invaso crepato in lastre di sale. E, sparse, le persone rimaste: non eroi, non predoni, ma testardi, malati, vecchi, gente con un motivo per non muoversi.

**Texture concrete (banca-immagini per la scrittura):**
- L'acqua è la valuta vera. Si misura, si custodisce, si baratta.
- Il sale è ovunque: incrosta i muri, i fondali, le labbra.
- Il silenzio degli uccelli. Il rumore del proprio respiro.
- Oggetti banali diventati preziosi: una pompa a stantuffo, una tanica integra, un tubetto di pastiglie di cloro, una mappa di carta.
- Il caldo come antagonista costante e impersonale.

> **Anti-cliché (vincolo di progetto).** Vietati: «il Mondo di Prima», bande di razziatori con creste, il bunker del cattivo, il prescelto, il cannibalismo gratuito, la radio che gracchia un messaggio di salvezza. Il crollo qui è **burocratico, ecologico e lento**. La minaccia è la sete e la distanza, non l'orda.

## 4. Tema

La domanda non è «sopravviverai?» ma **«a che cosa stai tornando, e cosa resterà di te quando ci arrivi?»**. È la stessa frase che il trailer pone a metà del cammino.

Sotto-temi:
- Restare contro andarsene: ogni persona incontrata è una risposta diversa alla stessa domanda (vedi `05-personaggi.md`).
- Cosa si porta e cosa si lascia indietro, letteralmente (la bisaccia ha sette posti) e moralmente (la fede di tua moglie si può vendere per acqua).
- L'ospitalità come unica economia rimasta tra chi resta.

Il tema non si risolve in una morale pulita: i sei finali atterrano in posti emotivi diversi e legittimi.

## 5. Protagonista

- Un uomo sulla cinquantina, partito anni fa a lavorare lontano (volutamente vago). **Definito ma non sovra-caratterizzato**: il giocatore lo abita. Resta senza nome: nel gioco è *il viaggiatore*.
- Torna perché **le lettere di casa hanno smesso di arrivare**. Le scriveva la moglie, fitte, con le notizie del bambino in fondo. Poi un biglietto in stampatello, senza firma: «Non è il caso di tornare.» Il biglietto è in tasca dall'inizio e si può rileggere (`esamina il biglietto`); l'ha scritto il fratello, Cosimo, e lo si scopre solo al guado.
- Non è un combattente. Sa camminare, sa contrattare, sa quando tacere. In combattimento è fragile: ogni scontro è un rischio, non una soluzione.

## 6. Il conflitto centrale e l'obiettivo del giocatore

- **Obiettivo dichiarato:** raggiungere a piedi **Acquamorta**, il paese d'origine, all'altro capo della regione dismessa.
- **Conflitto:** il cammino. Distanza, sete, fame, calore, persone che presidiano l'unica via, scelte su chi aiutare quando aiutare costa acqua.
- **Conflitto profondo:** avanzando, «tornare a casa» si complica. Il registro del paese, i ricordi di Concetta e le lettere custodite da Onofrio dicono quello che il biglietto taceva: a casa ci sono due croci, e a tenere il guado c'è tuo fratello.
- **Esito:** arrivare, ma *come* arrivi (cosa porti, chi hai aiutato, come hai sciolto il nodo di Cosimo, se Peppe cammina con te) decide **quale** dei sei finali si apre sulla soglia di casa.

## 7. Il ciclo di gioco (core loop)

In ogni zona il giocatore ripete, con variazioni:

1. **Arrivare** stanco e con scorte calanti.
2. **Esplorare** la zona: luoghi, oggetti, indizi sul cammino e sul mondo.
3. **Intrecciare un rapporto** con chi è rimasto: parlare, capire cosa vuole, decidere quanto fidarsi.
4. **Procurarsi risorse**: trovare acqua e cibo, oppure **barattare** (l'acqua è merce e moneta).
5. **Sciogliere un nodo**: un passaggio che richiede un oggetto, un favore, un baratto o, se non c'è altro modo, uno **scontro**.
6. **Gestire fame e sete**, che salgono col tempo e scendono solo bevendo e mangiando.
7. **Aprire la via** verso la zona successiva.

> Gli scontri sono **l'ultima carta**, non la prima. Ogni nodo ha più soluzioni; la violenza è sempre una di queste, mai l'unica, e sempre la più costosa.

## 8. Aderenza al motore (perché questa visione sta dentro FAVELLA 1)

- **Sopravvivenza** → contatori `sete`, `fame`, `vita` + eventi a tempo (`Ogni 3 turni`) + demoni di soglia (`Ogni turno se …`, `Quando …: perdi`).
- **Acqua-valuta** → i contatori `acqua` e `cibo` come moneta; ogni baratto è un'opzione di dialogo condizionata.
- **GDR leggero** → la `vita` del giocatore e quella dei pochi avversari, colpi scritti a mano, critici con `càpita (1 su 4)`.
- **Relazioni** → un contatore di fiducia per i cinque personaggi maggiori, dialoghi ramificati con battute e opzioni condizionali.
- **Progressione a zone** → stanze collegate, passaggi bloccati da regole `Invece di vai …` finché non si possiede un oggetto o uno stato.
- **Stanze che restano vere** → dal motore 1.1 ogni oggetto ha il suo *posto iniziale* (`Il posto della mappa è "…".`): la frase che lo presenta sparisce appena lo si prende.
- **Limiti accettati a monte:** niente nemici istanziati (ogni avversario è scritto a mano: pochi e memorabili), niente formule (matematica a passi atomici), prezzi cablati (economia statica, giustificata dalla scarsità).

## 9. Dimensioni e ritmo (a consuntivo)

| | Progetto (v0.1) | Gioco |
|---|---|---|
| Zone | ~7 | **7** |
| Luoghi | 50 | **39** |
| Personaggi | 15 | **13** (più il cane della serra) |
| Oggetti | 65 | **44** entità, di cui **27** si possono prendere |
| Finali | 3–4 | **6** di storia + **3** morti (sete, fame, ferite) |

- **Durata:** un percorso attento arriva alla soglia in circa 100 turni; vedere i sei finali richiede più partite, perché si decidono nelle zone 5 e 6.
- Le cifre sono scese dove il progetto rischiava il riempitivo (oggetti senza funzione, personaggi doppi); i finali sono saliti perché le scelte di Peppe, dei ricordi di famiglia e del lascito di Onofrio si incrociano davvero.

## 10. Pilastri da non tradire (bussola per ogni decisione futura)

1. **La sete prima di tutto.** L'acqua è il cuore di ogni meccanica e di ogni scena.
2. **Le persone, non i mostri.** Il dramma sta in chi è rimasto.
3. **La violenza costa.** Sempre possibile, mai gratuita, mai la via comoda.
4. **Niente cliché, niente nomi da LLM.** Specificità mediterranea, concreta, verificata.
5. **Scelte che fanno male.** Se un bivio non costa nulla, non è un bivio.
6. **Stare dentro il motore.** Eleganza nei limiti di FAVELLA, non lotta contro di essi.

## 11. Cosa è cambiato rispetto alla bozza

- **Il paese:** Selvamorta è diventato **Acquamorta**.
- **Il fratello:** Cosimo è confermato come nodo finale, ed è lui l'autore del biglietto «Non è il caso di tornare». La lettera che non spedì mai è la chiave della via umana al guado.
- **La famiglia:** la moglie e il figlio del viaggiatore sono morti durante la Secca; lo si ricostruisce da fonti diverse (registro, Concetta, il santino, Onofrio), mai da una sola.
- **Il cast:** l'eremita Elia è diventato **Onofrio**; il barattaro Aldo è **Ciro**; il malato Sandro è **Pasquale**. Mimmo (Z2) e Maruzza (Z7) non sono entrati: la piana è già piena col cane, e la «voce del ritorno» è la casa stessa, descritta sulla soglia.
- **I finali** sono sei, più tre morti con la loro causa (vedi `02-sistemi.md` §2).

---

### Stato
Visione realizzata nel gioco completo e vincibile (`prototipo/`, 7 zone). Il gioco ha un'app autonoma con trailer e interfaccia dedicata (`app/`) e un collaudo automatico che gioca tutti i finali (`collaudo/`).
