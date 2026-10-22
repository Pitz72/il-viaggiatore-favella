# Relazione generale sull'integrazione di FAVELLA in interfacce per videogiochi narrativi professionali

> **Stato:** lezioni apprese dal caso di studio *Il Viaggiatore* 1.37.0 (motore FAVELLA 1.5.0), 22 ottobre 2026.
> **Scritta da:** Claude (assistente di sviluppo del progetto), su richiesta di Simone Pizzi, dopo la release pubblica.
> **A chi serve:** a chi, in futuro (Simone compreso), dovrà portare un'altra storia scritta in FAVELLA dentro una
> confezione da prodotto, o decidere che cosa spostare dal gioco al motore perché il prossimo costi meno.
> **Come si legge:** il §1 è il riassunto; i §3–§12 descrivono com'è fatto e perché; il §13 è il catalogo degli
> attriti; il §14 sono le raccomandazioni per FAVELLA, in ordine di valore; il §15 è una guida pratica; il §16 dice
> che cosa questa relazione **non** dimostra.

---

## 1. In breve

**L'esperimento.** Portare una demo scritta in FAVELLA in una confezione professionale, virtualmente distribuibile, per
vedere se il sistema può funzionare. **Esito: riuscito.** Una storia di circa 1.440 righe di `.fav` è diventata un
prodotto con interfaccia a pulsanti e a parole, salvataggi, annulla, trofei, mappa, voce recitata, colonna sonora,
accessibilità, installer Windows e Linux con aggiornamento automatico, e una release pubblica su GitHub, tutto
collaudato in modo automatico.

**Che cosa ha reso possibile il risultato.** Tre proprietà del motore:

1. **È un linguaggio d'autore vero**: le regole si leggono come frasi, e una persona che non programma può scrivere
   e mantenere una storia di 39 luoghi, 14 personaggi e 6 finali.
2. **È deterministico**, quindi i salvataggi si fanno rigiocando i comandi e si verificano con un'impronta dello stato.
3. **È incorporabile**: gira in Pyodide dentro il browser e dentro Electron, senza server e senza rete.

**Che cosa ha richiesto lavoro fuori dal motore.** Quasi tutto il resto. Il rapporto è eloquente:

| Strato | Righe (circa) |
|---|---|
| La storia in FAVELLA (`prototipo/*.fav`) | 1.440 |
| Il motore (`motore/*.py`) | 12.500 |
| **Il ponte fra motore e interfaccia** (`app/src/lib/ponte.py`) | **600** |
| L'interfaccia, il suo CSS e la logica di gioco in TypeScript (`app/src`) | 15.400 |
| I collaudi (Python e Node) | 5.100 |

La confezione professionale è, per volume, **dieci volte la storia**. Il ponte da 600 righe è la parte più
interessante: contiene funzioni che qualunque interfaccia seria vorrebbe e che oggi vivono dentro un gioco invece che
nel motore (§5, §14).

**La raccomandazione principale** (§14): promuovere il ponte a **API ufficiale del motore**, dare un **identificatore
stabile a ogni riga di testo**, documentare il **formato del salvataggio** e scrivere la **semantica delle regole**.
Con questi quattro punti il prossimo gioco costa una frazione.

---

## 2. Il caso di studio in cifre

- **Il gioco:** avventura testuale di sopravvivenza e ritorno, in italiano. 7 zone, 39 luoghi, 14 personaggi, 6 finali,
  3 morti, 30 trofei. Almeno 96 turni per un percorso diretto fino a un finale; circa un'ora o poco più di gioco.
- **Il periodo:** dal 23 settembre al 22 ottobre 2026, 235 commit. Gran parte del tempo è andata nella confezione, non
  nella storia.
- **Il peso:** installer Windows circa 175 MB. Voce recitata 18 MB (813 file Opus), musica delle zone 15 MB,
  colonna sonora 23 MB (copia da scaricare), Pyodide 14 MB, app web costruita circa 70 MB.
- **L'ambiente:** Pyodide 0.27.8 con Lark 1.3.1 pinnato, React 19, Vite, Electron 44.
- **La qualità automatica:** una batteria di collaudi (§12) che a ogni push gioca tutti i finali, centinaia di partite a caso,
  i salvataggi, i pulsanti, i trofei, la mappa, il doppiaggio, la musica, e fa girare l'autoverifica dentro il pacchetto.

---

## 3. L'architettura: sei strati, un confine che conta

```
 ┌──────────────────────────────────────────────────────────────────────┐
 │  6. Il guscio: Electron (desktop) o pagina web                        │
 │     finestra, salvataggi su disco, aggiornamenti, uscita              │
 ├──────────────────────────────────────────────────────────────────────┤
 │  5. L'interfaccia (React/TypeScript)                                  │
 │     diario, plancia, tendina, mappa, trofei, voce, musica, opzioni    │
 ├──────────────────────────────────────────────────────────────────────┤
 │  4. Il runtime (favellaRuntime.ts)                                    │
 │     carica Pyodide, scrive i file del motore e dell'avventura         │
 ├──────────────────────────────────────────────────────────────────────┤
 │  3. IL PONTE (ponte.py, dentro Pyodide)   ◄── il confine che conta    │
 │     fav_boot · fav_step · fav_stato · fav_azioni · fav_anteprima      │
 │     fav_salva · fav_carica · fav_mappa · impronte                     │
 ├──────────────────────────────────────────────────────────────────────┤
 │  2. Il motore FAVELLA (compilatore, strutture, gioco, libreria)       │
 ├──────────────────────────────────────────────────────────────────────┤
 │  1. La storia (.fav: zone, sistemi, file radice)                      │
 └──────────────────────────────────────────────────────────────────────┘
```

**Il flusso di un turno.** L'interfaccia manda una stringa (un comando scritto o quello di un pulsante) a `fav_step`.
Il ponte la completa se serve, la passa a `elabora_comando`, cattura ciò che il motore stampa e aggiorna il registro dei
comandi. L'interfaccia chiede poi `fav_stato` (uscite, presenti, inventario, contatori, dialogo, gesti, luoghi visitati)
e `fav_azioni` (che cosa si può fare adesso), e ridisegna. Il testo catturato passa per `testo.ts`, che lo trasforma in
blocchi (titolo del luogo, prosa, battuta, sensazione del corpo, risposta di sistema, finale).

**Il principio che ha funzionato.** Il motore resta intatto e fermo: la fonte è il repository FAVELLA1, la copia in
`motore/` non si modifica a mano. Tutto ciò che serve a una confezione sta nel ponte, che *legge* le strutture del
motore senza cambiarle. Questo ha tenuto separate le responsabilità e permesso di aggiornare il motore (1.4.x → 1.5.0)
senza toccare l'interfaccia, ma ha un prezzo: il ponte conosce dettagli interni del motore (§13).

---

## 4. Il contratto con il motore: che cosa si usa davvero

L'interfaccia non parla mai direttamente col motore. Il ponte usa solo:

- `compila_mondo(entry)` per compilare l'avventura a partire dal file radice;
- `mondo.carica_azioni(LIBRERIA_AZIONI)` e `mondo.imposta_posizione_iniziale()`: due inizializzazioni che fa il `main`
  del motore e **non** `compila_mondo`, e che chi incorpora il motore deve ricordarsi di fare;
- `mostra_stanza(mondo)` per stampare la stanza di partenza;
- `elabora_comando(mondo, cmd)` per un turno, con l'output catturato via `redirect_stdout`;
- un uso **privato**, `_esegui_comando`, per l'anteprima (§5);
- la lettura diretta delle strutture: `mondo.stanze`, `.oggetti`, `.inventario`, `.variabili`, `.regole`, `.demoni`,
  `.verbi_personalizzati`, `.dialogo_nodi`, `.stanze_visitate`, `.posizione_giocatore`, `.stato_partita`, `.rng`,
  `._storia_stati` (le istantanee di ANNULLA).

Questa lista è, di fatto, **l'API che il motore non ha mai dichiarato**. Se un giorno il motore cambia uno di questi nomi,
il ponte si rompe: è la ragione principale per cui conviene renderla ufficiale (§14).

**Il modo di far girare il motore nel browser.** Pyodide e Lark sono dentro il progetto (nessuna CDN, il gioco funziona
offline). I moduli Python del motore si servono come file `.fav` e il runtime li riscrive col nome vero (`.py`) nel
filesystem di Pyodide: certi hosting rispondono 403 ai `.py`, e con `.py` in mezzo al nome Apache prova a eseguirli. Il file
`scripts/sincronizza.mjs` copia motore e avventura nella cartella pubblica prima di ogni build.

---

## 5. Il ponte, funzione per funzione

| Funzione | Che cosa fa | Perché una confezione ne ha bisogno |
|---|---|---|
| `fav_boot(entry)` | compila, piazza il giocatore, stampa la stanza | l'avvio |
| `fav_step(cmd)` | un turno; completa «mangia» e «bere» soli; intercetta «salva» e «carica»; tiene il registro dei comandi | il turno, e la sequenza effettiva per i salvataggi |
| `fav_stato()` | JSON: inventario, contatori, uscite (direzione e meta), presenti (con id, persona, prendibile), dialogo attivo con le sue opzioni, capienza, turno, quante mosse ANNULLA può disfare, domanda sì/no in attesa, voci udite, gesti compiuti, stati della storia, luoghi visitati | **tutto ciò che un'interfaccia mostra**: senza questo si deve leggere il testo |
| `fav_azioni()` | quali verbi d'autore hanno un effetto *qui e adesso* (attingi, curati, attacca il cane…) | i pulsanti d'azione, senza offrire quelli che direbbero soltanto «no» |
| `fav_anteprima(cmd)` | esegue il comando su una **copia** del mondo e dice che cosa cambierebbe: contatori, stati, cose date e ricevute, tetti di fine turno, esito | le conferme «dai X, ricevi Y» *prima* di un baratto, un dono, una violenza |
| `fav_salva()` / `fav_carica()` | sequenza effettiva dei comandi + impronta; caricare = rigiocare e verificare | salvataggi senza serializzare oggetti Python |
| `fav_impronta_stato()` / `fav_impronta_avventura()` | un hash dello stato, e uno dei sorgenti + versione del motore | dire se un salvataggio è stato fatto su *questa* storia |
| `fav_mappa()` | la carta dei luoghi con le coordinate ricavate dalle uscite cardinali | la mappa |
| `fav_info()` | versione del motore | diagnostica |

### 5.1 ANNULLA e i salvataggi

Il motore tiene una pila di istantanee (`_storia_stati`) a ogni turno, ed è questo che permette ANNULLA. Il ponte tiene in
parallelo la **sequenza effettiva** dei comandi: un turno annullato ne viene tolto, «ancora» è già risolto nel comando che
ripete, una conversazione intera conta come **un** passo annullabile. Il salvataggio contiene quella sequenza, non lo
stato: caricare significa ricompilare e rigiocare. Dopo un caricamento solo gli ultimi 40 comandi (`CODA_ANNULLA`) girano
con le istantanee, così ANNULLA funziona anche subito dopo ma il caricamento di una partita lunga resta rapido.

Il caricamento è **atomico**: se un comando solleva a metà, il ponte torna com'era (mondo, sequenza, posizioni di ANNULLA,
dialogo). Un collaudo (`salvataggi.py`) lo prova.

### 5.2 L'anteprima

È la funzione più «interessante» dal punto di vista del design: una copia profonda del mondo (senza la pila di istantanee,
per non copiarla), il comando eseguito lì, e un confronto prima/dopo. Due dettagli che hanno richiesto lavoro:

- **I tetti di fine turno.** Il motore applica dopo il comando dei «demoni» (`Ogni turno se … : adesso X diventa N`), per
  esempio la tanica che tiene dieci litri. Senza applicarli nell'anteprima, un baratto d'acqua con la tanica quasi piena
  sembrava gratuito e invece sprecava acqua. Il ponte li riconosce **dalla forma** (tutte le conseguenze fissano un
  contatore) e li applica alla copia.
- **Il caso.** Valutare una condizione non deve consumare numeri casuali: `_vera` salva e ripristina lo stato del generatore.

### 5.3 Le azioni «qui e adesso»

`fav_azioni` scorre le regole del motore (`mondo.regole`, con `verbo`, `fase`, `condizione`, `id_oggetto_bersaglio`,
`conseguenze`) e offre un pulsante solo se la regola che *scatterebbe* cambia davvero il mondo. Così al pozzo vuoto non
compare «attingi», a sbarra alzata sparisce «minaccia Vito» e a Vito a terra sparisce «attacca Vito». Due gesti che
farebbero la stessa cosa alla stessa persona sono un pulsante solo. **Le combinazioni «usa X su Y» non si offrono mai**:
offrirle sarebbe dare la soluzione; l'interfaccia le fa comporre (una cosa, poi l'altra) e il motore risponde com'è giusto.

Questa è anche la parte **più accoppiata alle strutture interne** del motore (§13).

---

## 6. Dal testo all'interfaccia

Il motore stampa **testo semplice**. L'interfaccia deve tuttavia mostrare titoli di luogo, prosa, battute con chi parla,
sensazioni del corpo in margine, risposte di sistema, finali. `testo.ts` riconosce ogni riga **dalla sua forma**:

- le righe «Uscite:» e «Puoi vedere qui:» non finiscono nella prosa, perché i pulsanti le mostrano già;
- le battute si riconoscono perché cominciano con un nome di personaggio noto (la lista è in `testo.ts`: un personaggio
  nuovo dichiarato nei `.fav` e non nella lista finirebbe nella prosa);
- i messaggi dei demoni «Ogni turno» (la lingua incollata, la fame) vanno in margine come sensazioni;
- le risposte che il motore dà da sé («Il tempo passa.», «Cosa vuoi esaminare?», «Non si apre.») hanno un loro stile;
- le «voci» che corrono su di te (stati che l'autore dichiara `(voluto)`: li scrive la storia e li legge solo l'interfaccia)
  hanno una riga a lato.

**Perché è fragile e come lo si è reso solido.** Riconoscere dalla forma è un contratto implicito fra l'autore e
l'interfaccia. `collaudo/testo.py` lo rende esplicito: prova ogni verbo per ogni genere di bersaglio, ogni risposta del
motore, che nessuna frase della storia somigli a una risposta di sistema, che ogni personaggio dichiarato sia noto
all'interfaccia e che ogni «voce» e ogni «gesto» abbia la sua riga. È la contromisura giusta, ma la soluzione vera è un
output **tipizzato** dal motore (§14, punto 5).

**I testi composti.** Dal motore 1.5.0 un testo con nome (`Il testo "i fili del viaggio" è "[se …]"`) si richiama con
`[i fili del viaggio]` e si compone in base allo stato: è così che le sei chiusure raccolgono il viaggio fatto. È una
funzione eccellente per i finali; ha un solo costo: un segnaposto non sostituito stampa le parentesi quadre, e
l'esploratore lo cerca (`SEGNAPOSTO`).

---

## 7. Salvataggio, determinismo e identità della storia

**Il formato** (`salvataggi.ts`): un file JSON leggibile, estensione `.viaggiatore`, con chi l'ha scritto (versione del gioco,
del motore, del formato, commit), il riassunto per il taccuino, la partita (sequenza + impronta), il diario per ritrovare
la pagina com'era, e campi facoltativi aggiunti col tempo (nome, miniatura, tempo di gioco, sfide) senza cambiare il numero
di formato: un file di prima si apre, una versione di prima ignora i campi nuovi.

**Il desktop** scrive file veri in *Documenti/Il Viaggiatore/Salvataggi*, con scrittura atomica (file temporaneo e
rinomina), copia di riserva `.bak`, più scritture sullo stesso file messe in fila. Il browser usa `localStorage` con
esportazione e importazione.

**Il vincolo da tenere sempre presente.** Poiché il salvataggio è una sequenza di comandi, **cambiare un `.fav` cambia
l'impronta dell'avventura**, e un salvataggio vecchio, rigiocato su una storia modificata, può dare uno stato diverso.
L'interfaccia lo dice a chi gioca («ricostruita su questa versione»). Nel progetto questa regola ha deciso scelte concrete:
i nomi dei luoghi d'ingresso scritti in minuscolo sono stati corretti **nel ponte** e non nei `.fav`, e i nomi dei luoghi
non hanno voce, proprio per non invalidare nulla. È anche il motivo per cui SemVer, per questo gioco, considera i
salvataggi *il contratto* (`sviluppo/VERSIONI.md`).

---

## 8. L'interfaccia di comando: pulsanti e parole dicono la stessa cosa

La decisione di progetto più fruttuosa è che **un pulsante manda sempre un comando che si potrebbe anche scrivere**, con
le stesse parole del parser. Conseguenze:

- non esistono due sistemi: ciò che i pulsanti fanno è ciò che il motore sa fare;
- tutto è collaudabile *attraverso* l'interfaccia: `comandiOfferti` (in `azioni.ts`) dice che cosa offrono i pulsanti in
  ogni momento, e `collaudo/pulsanti.py` gioca i dodici percorsi, le tre morti e le partite del casello **solo** con quello
  che i pulsanti offrono. Nell'ottobre 2026 lo ha usato come garanzia per togliere la modalità «pulsanti e parole»: se
  qualcosa non avesse avuto un pulsante, non si sarebbe più potuto fare;
- le due modalità (pulsanti, avventura testuale) sono due *viste* sullo stesso ponte, non due giochi.

**Le conferme** nascono dall'anteprima: `valutaConferma` decide, sul risultato del motore, se una scelta costa (baratto,
dono, pagamento, svolta, violenza) e quindi chiede conferma *prima*, con il quadro di ciò che si dà, si riceve e si spreca.
Parlare e chiedere non chiedono mai conferma.

**La plancia** (uscite a rosa dei venti, persone e cose del luogo, gesti, riga di servizio) ha altezza fissa in ogni
luogo perché il diario sopra non salti. Le misure che l'hanno guidata vengono dal motore (uscite da 1 a 4 e sempre
cardinali, cose al massimo 5, gesti al massimo 2, risposte da 1 a 6): **misurare la storia prima di disegnare l'interfaccia**
è una pratica da ripetere.

---

## 9. Che cosa sta fuori dal motore (e forse dovrebbe stare dentro)

Alcuni sistemi del gioco sono scritti nell'interfaccia perché il motore non li prevede:

- **I trofei.** 30, in sei famiglie. Le regole (`trofei.ts`) leggono, a ogni turno, il testo stampato, l'esito della partita e
  lo stato esposto dal ponte (contatori, voci, gesti, stati della storia), più le «sfide» della partita (se si è mai scritto un
  comando, toccato un pulsante, tornati indietro). Funzionano, ma accoppiano il catalogo dei trofei a frasi del testo
  (`c.startsWith("usa le pastiglie")`, `chi === "vito" && c === "tre d'acqua"`).
- **La mappa.** Le coordinate si ricavano dalle uscite cardinali (a partire dal primo luogo); 39 luoghi, 14 × 12, nessuna
  sovrapposizione (verificato). Che un'avventura si disponga su una griglia è una proprietà della *storia*, non del motore:
  il motore può solo dire se le uscite sono coerenti, ed è utile che lo dica.
- **Il corpo e le scorte** (vita, sete, fame, acqua, cibo) sono contatori della storia, mostrati a lato con soglie scritte
  nell'interfaccia. Le soglie sono duplicate (nei `.fav` e nel TypeScript).
- **Le tappe di una mappa**, la zona di ogni luogo e i colori per zona sono dati dell'app (`data/viaggiatore.ts`), non della
  storia. Il collaudo `mappa.py` verifica che non si discostino dai `.fav`.

Il filo comune: **metadati sui luoghi, sui personaggi e sulle regole che oggi vivono in tre posti** (la storia, l'interfaccia, i
collaudi) e che il motore potrebbe tenere in uno solo (§14, punto 6).

---

## 10. Voce e doppiaggio: legare un'audio a un testo che non è una riga

Il gioco è doppiato per intero (813 file). Il vincolo di fondo: **il motore consegna il testo già composto, non la riga del
`.fav`**. Dunque le parti registrate si ritrovano *dal testo*, spezzato e normalizzato come in `strumenti/doppiaggio.py`: le
parentesi sono della voce di servizio, le «caporali» di chi parla, il resto del narratore; le parole in maiuscolo si
abbassano; una frase non trovata intera si cerca come fila di parti note ai confini di frase (il motore a volte mette due testi
sulla stessa riga, e i fili del viaggio sono dieci frasi registrate una per una che il motore incolla insieme); i numeri
delle scorte si ricompongono dai pezzi detti a lettere.

**L'identificatore di un'audio è derivato dal testo**: se il testo cambia, l'id cambia, e il collaudo `doppiaggio.py`
segnala l'audio scaduto («un testo cambiato ha un id nuovo»). Funziona, ed è onesto, ma:

- ogni ritocco di una frase invalida la sua registrazione;
- il collaudo deve rigiocare i percorsi per sapere *quali* testi vengono stampati davvero (è lì che passa la prova
  «ogni riga stampata trova le sue parti»);
- una traduzione, o una seconda voce, richiederebbe gli stessi giri.

**Le licenze della voce** vanno decise prima: il progetto ha tenuto fuori dalla licenza libera (CC BY-SA) le quattro voci
generate con un servizio a licenza ristretta, in una cartella a parte con un proprio indice (`voce/elevenlabs/`).

---

## 11. Impacchettamento, qualità di consegna e rilascio

- **Desktop (Electron).** Il gioco è una finestra a schermo intero che carica la pagina costruita da un protocollo interno
  (`app://`), senza server né rete. Il processo principale offre pochi canali IPC (salvare, uscire, registro, aggiornamenti,
  finestra) e **controlla chi chiede**: ogni canale verifica che il frame sia quello dell'app (protocollo e host, non
  `URL.origin`, che per uno schema proprio vale `null`). I «fuses» di Electron chiudono `runAsNode`, le variabili d'ambiente
  di Node e le ispezioni.
- **`--autoverifica`.** Il pacchetto, avviato con questa opzione, parte senza mostrarsi, gioca qualche comando, salva e
  ricarica in memoria, prova la voce e termina con codice 0 o 1. È la prova che *il pacchetto costruito*, non solo il
  codice, funziona. Gira su ogni pacchetto in CI e lo si lancia a mano prima di ogni rilascio, con una cartella dei
  salvataggi temporanea (`VIAGGIATORE_SALVATAGGI`) per non toccare quelli veri.
- **Il rilascio** è un workflow manuale («Rilascio»): verifica le versioni (`strumenti/versione.mjs`) e che il CHANGELOG
  abbia la sezione datata, rifà il collaudo, costruisce Windows (installer e portatile) e Linux (AppImage e deb), li
  autoverifica, crea la bozza con le note del CHANGELOG e i file per l'aggiornamento automatico. Prima di pubblicare si
  confrontano le impronte SHA-512 e le dimensioni degli allegati con `latest.yml` e `latest-linux.yml`, e si lancia
  l'autoverifica del portatile.
- **Non firmati.** Gli eseguibili non sono firmati (Windows SmartScreen chiede una conferma). È la differenza più visibile
  fra questo pacchetto e un prodotto commerciale.
- **La versione web** è rimasta alla 1.23.0 per scelta: il desktop è la piattaforma, il web un fratello non allineato.

---

## 12. Il metodo di qualità: che cosa ha catturato che a occhio non si vedeva

| Collaudo | Che cosa prova | Difetti che ha mostrato (esempi) |
|---|---|---|
| `finali.py` | un percorso per ogni finale, ogni via al guado, le tre morti | morti per sete e fame che davano la frase generica |
| `mirate.py`, `fili.py`, `giocate.py` | situazioni precise, fili del viaggio, equilibrio di sete/fame/vita | il cane che morde senza avvertire, Peppe che divide le scorte in scena |
| `salvataggi.py` | salva → ricarica in un'istanza nuova → **stesso stato**, poi stessi comandi, stessa risposta; caricamento rotto a metà | (garanzia: un caricamento rotto a metà lascia il ponte com'era) |
| `esploratore.py` | centinaia di partite a caso con cinque «caratteri»; anomalie, stalli, copertura | quattro difetti del motore 1.4.0 (mossa senza uscita, posa, «accendi su», avviso di «colpisci») |
| `interfaccia.py`, `scorte.py`, `conferme.py`, `testo.py` | il ponte, le dosi, quali scelte chiedono conferma, il testo del motore come lo distingue l'interfaccia | nomi di luoghi in minuscolo, «usa su questo…» senza dire su che cosa |
| `pulsanti.py` | tutto il gioco coi soli pulsanti, e un giocatore a caso che ha solo quelli | (garanzia, non difetti) |
| `trofei.py`, `doppiaggio.py`, `musica.py`, `mappa.py` | rispettivamente trofei, voce, colonna sonora, mappa | audio scaduti, file mancanti, nomi che si toccano sulla mappa |

Tre abitudini che hanno pagato:

1. **Collaudare attraverso la stessa logica che usa l'interfaccia**, in Node, e non una sua copia (`azioni.ts`, `trofei.ts`,
   `foglio.ts` non hanno React né import di runtime proprio per questo).
2. **Provare che il collaudo sa fallire**: ogni tanto si rompe di proposito qualcosa (per la mappa, stringendo i passi della
   carta) e si controlla che le prove cadano.
3. **Giocare per davvero**, oltre ai collaudi: partite intere lette come le leggerebbe chi gioca. Hanno trovato squilibri e
   incoerenze che nessun controllo automatico poteva vedere.

---

## 13. Il catalogo degli attriti

Ogni voce: che cosa, che cosa si è fatto, se meriterebbe una soluzione nel motore.

1. **I verbi sull'oggetto, i verbi su un contatore.** «mangia» e «bere» soli: il motore chiede «cosa vuoi mangiare?», ma qui il
   cibo è un contatore, non un oggetto. *Fatto:* il ponte completa «mangia»/«bere» nel comando che la storia conosce
   (`mangia qualcosa`, `bevi`), e nella sequenza salvata entra quello. Dichiarare `"mangia" è come …` nella storia farebbe
   mangiare la scorta anche a «mangia la mappa». *Nel motore:* un modo di dichiarare un verbo che agisce su un contatore.
2. **I nomi dei luoghi d'ingresso in minuscolo.** Un luogo nominato la prima volta dentro un collegamento di un'altra zona
   («Il margine collega ovest a il tratto.») tiene quel nome minuscolo. *Fatto:* `_maiuscola` nel ponte. *Nel motore:* un
   nome visualizzato deciso dall'autore, distinto dall'identificatore.
3. **Il salvataggio non contiene lo stato.** Conseguenza del determinismo scelto: ricompilare e rigiocare. Ottimo per la
   robustezza, ma ogni modifica della storia rompe i salvataggi (§7). *Nel motore:* almeno una versione dichiarata della
   storia, e un messaggio per i salvataggi incompatibili.
4. **I luoghi visitati si salvano solo con un'opzione** (`uscite_solo_visitate`, non usata qui). Il ponte li ricostruisce
   perché i salvataggi rigiocano i comandi; con salvataggi di stato non basterebbe. *Nel motore:* tenerli sempre nello stato
   esportabile.
5. **Accoppiamento del ponte alle strutture interne.** `fav_azioni` legge `regole`, `fase`, `condizione`,
   `id_oggetto_bersaglio`, `conseguenze`; `fav_anteprima` usa `_esegui_comando`; ANNULLA si regge su `_storia_stati`. Una
   rifattorizzazione del motore le romperebbe. *Nel motore:* un'API stabile che incapsuli «che cosa farebbe questo comando» e
   «quali verbi hanno effetto qui».
6. **L'output è testo.** L'interfaccia deve riconoscere i tipi di riga dalla forma (§6). *Nel motore:* un'uscita strutturata
   (descrizione, battuta con chi parla, sistema, finale) oltre al testo.
7. **Le condizioni non valutabili da fuori.** Per sapere se un pulsante serve bisogna valutare condizioni «a secco» senza
   consumare il caso (`_vera` salva e ripristina lo stato del generatore). *Nel motore:* una valutazione senza effetti
   collaterali, esposta.
8. **Le soglie duplicate.** Le soglie del corpo stanno nei `.fav` e nel TypeScript. Un autore che le cambia in un posto
   dimentica l'altro. *Nel motore:* metadati dichiarabili dalla storia (un contatore con soglie e nome visibile).
9. **Gli stati scritti e mai letti.** Dal 1.5.0 il compilatore li segnala; i tre stati delle voci, che legge solo l'interfaccia,
   sono dichiarati `(voluto)`. È un buon meccanismo di *dialogo fra storia e interfaccia*, da estendere.
10. **La velocità.** Il motore salva un'istantanea (copia profonda del mondo) a ogni turno: circa 75 comandi al secondo.
    Sufficiente per giocare, pesante per i collaudi lunghi (di qui la coda di 40 istantanee dopo il caricamento).
    Non è stato misurato il tempo di avvio di Pyodide su macchine lente.
11. **Due sistemi di salvataggio possibili.** Dal 1.2.0 «salva» e «carica» scritti sono comandi di servizio del motore, con un
    loro archivio. Nel gioco i salvataggi sono quelli dell'interfaccia: il ponte intercetta le due parole prima del motore
    (e avvisa: «per salvare premi F5»). *Nel motore:* poterli disattivare per chi incorpora.
12. **Un limite non del motore, utile da sapere.** Su Windows i nomi di file non distinguono maiuscole e minuscole: due file
    `Mappa.tsx` e `mappa.ts` collidono. Una convenzione di nomi dell'interfaccia lo evita.

---

## 14. Raccomandazioni per FAVELLA, in ordine di valore

Per ogni punto: che cosa, perché, dove sta oggi nel Viaggiatore (il punto di partenza per estrarlo).

1. **Un'API ufficiale di stato e di azione** (`stato()`, `azioni_disponibili()`, `anteprima(cmd)`, `luoghi_visitati()`,
   `carta()`). *Perché:* è il confine che ogni confezione riscrive. *Dove:* `app/src/lib/ponte.py`, funzioni `fav_*`. È il
   punto a più alto valore: sposta circa 600 righe dall'applicazione al motore e toglie l'accoppiamento del §13.5.
2. **Identificatori stabili per ogni riga di testo.** *Perché:* voce, traduzioni e trofei oggi dipendono dal testo stampato.
   *Dove:* `strumenti/doppiaggio.py` (id derivato dal testo), `app/src/gioco/parti.ts`. Con id stabili, correggere un refuso non
   invalida più la registrazione e si può tradurre.
3. **Formato di salvataggio documentato e versionato**, con la sequenza dei comandi come base ma con una dichiarazione
   di compatibilità (versione della storia) e un percorso per «salvataggio di una storia modificata». *Dove:* `salvataggi.ts`,
   `fav_salva`/`fav_carica`, `fav_impronta_*`.
4. **La semantica delle regole, scritta**: precedenza delle regole «Invece di», che cosa succede quando un testo si ripete, come
   funzionano i sinonimi, la capienza, la prima menzione di un luogo. Nel progetto sono state verificate a runtime e
   registrate nella memoria di lavoro; mancano nella documentazione del linguaggio.
5. **Output tipizzato.** Un flusso di eventi (`descrizione`, `battuta(chi, testo)`, `sistema`, `finale`, `corpo`) accanto al
   testo, per togliere il riconoscimento dalla forma. *Dove:* `app/src/gioco/testo.ts`, `collaudo/testo.py`.
6. **Metadati dichiarabili dalla storia**: nome visualizzato dei luoghi e dei personaggi, zona o capitolo di ogni luogo,
   contatori «visibili» con soglie e nome, coordinate o direzioni verificabili. *Dove:* `app/src/data/viaggiatore.ts`
   (`ROOM_ZONE`, `ZONE_THEME`), le soglie in `ViaggiatorePlayer.tsx`, `foglio.ts` (`TAPPE`).
7. **Eventi e ganci**: un punto in cui un'interfaccia può ascoltare «un gesto è stato compiuto», «un finale è stato raggiunto»,
   «un luogo è stato visitato». Oggi i trofei li ricostruiscono dal testo. *Dove:* `app/src/gioco/trofei.ts`.
8. **I collaudi del Viaggiatore come banco di prova generale**: `esploratore.py` e `salvataggi.py` sono già generici; quelli che
   dipendono dall'interfaccia (`pulsanti.py`, `mappa.py`) mostrano come collaudare *attraverso* l'interfaccia. Farne un
   kit.
9. **Un pacchetto di riferimento** (Electron + Pyodide + autoverifica + rilascio) come modello clonabile: oggi è sepolto in
   `desktop/`, `.github/workflows/` e `strumenti/`.

---

## 15. Guida pratica: come portare una nuova storia FAVELLA in una confezione

Ordine consigliato, dalle decisioni che costano meno a quelle che costano di più cambiare.

1. **Misura la storia** prima di disegnare: quante uscite per luogo, quante cose, quanti gesti, quante risposte per dialogo,
   quanti personaggi. Fai un piccolo script sul mondo compilato. Le misure del Viaggiatore (uscite da 1 a 4, cose ≤ 5,
   gesti ≤ 2, risposte da 1 a 6) hanno deciso la plancia.
2. **Decidi il contratto dei salvataggi** (§7) prima di scrivere molto testo: sequenza di comandi, versione della storia,
   che cosa succede a un salvataggio vecchio.
3. **Copia il ponte** e adattalo: `fav_boot`, `fav_step`, `fav_stato`, `fav_salva`, `fav_carica`, le impronte; poi
   `fav_anteprima` e `fav_azioni` se vuoi conferme e pulsanti. Tienilo in un file Python vero, che gira identico dentro
   Pyodide e nei collaudi in CPython.
4. **Scrivi i collaudi prima dell'interfaccia**: un percorso per ogni finale, i salvataggi, un esploratore a caso. Il motore
   ha già `esploratore.py`.
5. **Costruisci il runtime** (Pyodide + Lark pinnato, moduli serviti senza `.py`, tutto dentro il progetto) e prova l'avvio
   a freddo su una macchina modesta (§16).
6. **Disegna l'interfaccia partendo dai comandi**: un pulsante manda un comando scritto; metti `comandiOfferti` sotto
   collaudo fin dal primo giorno.
7. **Aggiungi i sistemi di gioco fuori dal motore** (trofei, mappa, corpo) come funzioni pure in TypeScript, senza React,
   così si collaudano in Node con la logica vera.
8. **Fai il guscio** (Electron) con pochi canali IPC controllati e l'opzione `--autoverifica`.
9. **Aggiungi la voce solo quando il testo è fermo**: ogni modifica invalida un'audio (§10).
10. **Tieni il rilascio a mano**, con bozza, confronto delle impronte e autoverifica del portatile prima di pubblicare.

**Cose da non fare** (imparate cambiando idea):

- non modificare la copia del motore nel progetto: se serve un cambiamento, si fa nel repository del motore con i suoi test e
  si ricopia;
- non correggere nel `.fav` ciò che è una questione di schermo (nomi, maiuscole): cambia l'impronta dei salvataggi;
- non dare nel gioco le combinazioni «usa X su Y» che funzionano;
- non fidarsi del solo collaudo automatico per giudicare equilibrio e ritmo.

---

## 16. Che cosa questa relazione non dimostra

Per onestà verso chi la leggerà tra un anno:

- **È un caso solo.** Un autore, una storia, e l'autore è anche l'autore del motore, assistito da una persona (Claude) che ne
  conosce ogni angolo. Dimostra che *si può fare*, non che un altro autore ci riuscirebbe da solo né in quanto tempo.
- **Non sono stati misurati**: il tempo di avvio di Pyodide a freddo su un computer lento, il consumo di memoria nelle
  partite lunghe, il comportamento su portatili con GPU deboli per i panorami proceduralmente disegnati, né l'uso da tastiere
  e schermi non italiani.
- **Non è stato provato con giocatori esterni.** I collaudi dicono che il gioco funziona e non si blocca; non dicono che
  emoziona, né dove una persona che non lo conosce si ferma. La prova che manca, più di ogni altra, è questa.
- **Non è stata misurata la fatica di manutenzione.** Il ponte tocca strutture interne del motore: un cambio di motore
  maggiore potrebbe romperlo, e solo il tempo dirà quanto spesso.
- **La qualità della voce e del suono sintetizzati** (voce recitata, musica, il fruscio della mappa) è stata misurata, non
  ascoltata da chi scrive. Decide l'orecchio di Simone.

---

## Appendice A. Dove sta cosa

| Voglio… | Guarda |
|---|---|
| il ponte | `app/src/lib/ponte.py` |
| come il runtime carica Pyodide e il motore | `app/src/lib/favellaRuntime.ts`, `app/scripts/sincronizza.mjs` |
| dal testo ai blocchi | `app/src/gioco/testo.ts`, `collaudo/testo.py` |
| azioni, conferme, menu delle cose | `app/src/gioco/azioni.ts` |
| la plancia, la tendina | `app/src/gioco/Plancia.tsx`, `Tendina.tsx` |
| la mappa | `app/src/gioco/foglio.ts` (logica), `Mappa.tsx`, `suonoCarta.ts`; `ponte.py` `fav_mappa` |
| i trofei | `app/src/gioco/trofei.ts`, `app/src/lib/trofei.ts` |
| la voce | `app/src/gioco/voce.ts`, `parti.ts`, `strumenti/doppiaggio*.py`, `collaudo/doppiaggio.py` |
| i salvataggi | `app/src/lib/salvataggi.ts`, `posti.ts`, `desktop/salvataggi.cjs` |
| il guscio | `desktop/main.cjs`, `ipc.cjs`, `preload.cjs` |
| i collaudi | `collaudo/` (e `collaudo/LEGGIMI.md`), `app/scripts/*-node.mjs` |
| il rilascio | `.github/workflows/rilascio.yml`, `strumenti/versione.mjs`, `sviluppo/VERSIONI.md` |
| il diario delle decisioni | `sviluppo/DIARIO.md` e `sviluppo/diario/` |

## Appendice B. Glossario

- **Ponte**: il file Python (`ponte.py`) che sta fra l'interfaccia e il motore e traduce il mondo in JSON.
- **Impronta**: un hash dello stato del mondo, o dei sorgenti dell'avventura più la versione del motore.
- **Sequenza effettiva**: i comandi di una partita senza quelli annullati, che sono il contenuto di un salvataggio.
- **Plancia**: i pulsanti di gioco, raggruppati in andare, qui, fare e una riga di servizio.
- **Tappa**: nella mappa, uno dei punti fissi del viaggio (le sette zone e Acquamorta).
- **Demone**: nel linguaggio FAVELLA, una regola «Ogni turno…» che scatta a ogni turno (la sete che sale, i tetti sulle scorte).
- **Gesto**: ciò che hai fatto a una persona (cibo dato, bluff, cura…), mostrato a lato e premiato da un trofeo.
