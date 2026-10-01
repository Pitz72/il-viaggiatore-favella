# Collaudo del Viaggiatore

Undici collaudi, tutti sul motore del progetto (`../motore`) e sull'avventura
in `../prototipo`. Ognuno esce con codice 1 se trova un problema. Le trascrizioni
finiscono in `esiti/` (si possono cancellare: si rigenerano).

| File | Cosa fa | Durata |
|---|---|---|
| `finali.py` | gioca una partita per **ogni finale dichiarato** nei .fav, per ogni via al guado (la lettera, il fucile che spara, il fucile posato, la veglia): i 6 finali di storia per dodici percorsi (con e senza il cibo dato a Imma, con Peppe che chiede del sangue) e le 3 morti (sete, fame, ferite). Fallisce se un finale non è raggiunto, se una partita ne produce due, se il motore solleva un'eccezione. | ~10 s |
| `mirate.py` | 8 situazioni precise: guardie di bevi/mangia/tanica, il cane (mani nude, cibo), Vito (coltello, bluff, pedaggio), Rosaria agli ingressi ripetuti, Onofrio senza ricordi. Una prova può dare al pilota soglie sue (nella rissa con Vito non ci si ferma a mangiare). | ~5 s |
| `salvataggi.py` | partite casuali (metà lunghe, su percorsi veri) che salvano, ricaricano in un'istanza nuova e **pretendono lo stesso stato**: impronta identica, poi le due istanze proseguono con gli stessi comandi e ogni risposta deve coincidere. Mette alla prova ANNULLA, ANCORA e i dialoghi prima e dopo il caricamento. | ~1 min |
| `esploratore.py` | 100 partite a caso con cinque caratteri (turista, curioso, maldestro, sconsiderato, chiacchierone) che esplorano tutto, sbagliano a scrivere, chiedono cose che non ci sono, attaccano, annullano. Segnala eccezioni, testi rotti, scorte negative, uscite o oggetti incoerenti, conversazioni senza risposte, e misura la copertura. | ~2–3 min |
| `scorte.py` | bere e mangiare, con tutti i loro sinonimi e le dosi («bevi due sorsi», «mangia tre porzioni»): cosa cambia, i rifiuti («Non hai sete», «per una porzione sola»), un turno solo, ANNULLA che disfa la dose intera. Le forme vecchie («mangia qualcosa») restano valide perché stanno nei salvataggi. | ~1 s |
| `interfaccia.py` | il **ponte** dell'app (`app/src/lib/ponte.py`): «mangia» e «bere» soli, l'anteprima di un comando (non tocca il mondo, dice ciò che davvero succederebbe), le azioni di contesto (ATTINGI al pozzo, GETTA CIBO alla serra, ATTACCA il cane… e non dove non servono o direbbero solo di no; un pulsante solo per due gesti che fanno la stessa cosa), le combinazioni «usa X su Y» (che il ponte non elenca: sarebbe la soluzione; composte a pezzi, il motore le capisce e risponde anche «non ha alcun effetto particolare»), lo stato per i pulsanti; l'anteprima che applica i tetti di fine turno (la tanica tiene dieci litri). | ~5 s |
| `fili.py` | i due fili del viaggio e la terza via al guado: che cosa è sangue (il cane, Vito) e che cosa no (il bluff), la generosità contata una volta per persona, chi se ne ricorda (Rosaria, Ciro, Tore, Onofrio, Cosimo, la strada di Acquamorta), il fucile posato, la veglia e che cosa la rompe; Imma sulla discesa (due porzioni, o l'ultima; il dono che conta una volta; Rosaria che lo sa, col sangue e senza); Ciro che non spreca la tanica; il bluff che Vito racconta (a Ciro, a Tore, a Cosimo); Peppe che chiede del sangue e le tre risposte lungo la strada; le voci «si dice di te»; «getta cibo» e i suoi sinonimi. Ogni prova parte da un mondo nuovo con il giocatore già al suo posto. | ~3 s |
| `giocate.py` | ciò che hanno trovato le **partite giocate a mano** (1.6.0): l'equilibrio di sete, fame e vita (dodici semi per tre modi di giocare: agli avvisi, un poco dopo, col sangue del cane), la porta del paese che si ritrova, il cane che avverte prima di mordere, la pompa che disseta, le parole della violenza al guado («spara», «uccidi», «colpisci», «usa il fucile su Cosimo», «minaccia Cosimo»), Peppe che non divide le scorte in mezzo alla scena del guado, i personaggi che al ritorno non ripetono il benvenuto, i tetti di fine turno; il banco di gioco; i quattro difetti del motore 1.4.1 (la mossa senza uscita, la posa, «accendi su», l'avviso di «colpisci»). | ~20 s |
| `testo.py` | il **testo del motore e della storia** come l'interfaccia lo distingue (`app/src/gioco/testo.ts`, eseguita con Node): ogni verbo per ogni genere di bersaglio, e ogni risposta del motore («Il tempo passa.», «Cosa vuoi esaminare?», «Non si apre.»…) deve stare nello stile di sistema; nessuna delle frasi dei `.fav` deve somigliarvi; ogni personaggio dichiarato dev'essere noto all'interfaccia (se no le sue battute finiscono nella prosa); ogni «voce» dichiarata nei `.fav` ha la sua riga a lato dello schermo; ogni messaggio dei demoni «Ogni turno» (le sensazioni del corpo) resta in margine. Serve `npm ci --prefix app`. | ~10 s |
| `conferme.py` | quali scelte chiedono conferma: passa in rassegna **ogni** risposta di dialogo del gioco e i comandi che consumano o feriscono, chiede l'anteprima al ponte e fa decidere la logica vera dell'interfaccia (`app/src/gioco/azioni.ts`, eseguita con Node). Baratti, doni, pagamenti, svolte, violenza: sì; parlare e chiedere: mai. Serve `npm ci --prefix app` (usa TypeScript). | ~5 s |
| `pulsanti.py` | i sei finali della storia giocati **senza tastiera**: a ogni turno chiede alla logica vera dell'interfaccia (`azioni.ts` → `comandiOfferti`, con Node) che cosa offrono i pulsanti e manda quello che corrisponde al comando del percorso. Fallisce se un passo non ha un pulsante (le combinazioni «usa X su Y» si compongono: ogni coppia della bisaccia con ogni cosa a portata), o se la combinazione che il percorso compie dà la risposta generica del motore. Serve `npm ci --prefix app`. | ~5 s |

Il **banco di gioco** per giocare a mano e misurare l'equilibrio non è un collaudo: sta in
`../strumenti/gioca.py` ([istruzioni](../strumenti/LEGGIMI.md)); `giocate.py` ne verifica la coerenza
col pilota di `finali.py`.

Moduli di supporto: `partita.py` (una partita pilotata da Python, con la stessa vista
della scena che ha l'interfaccia) e `percorsi.py` (i sei percorsi scritti a mano).

## Opzioni dell'esploratore

```bash
python esploratore.py -n 5 -t 150     # giro rapido: 5 partite per carattere, 150 comandi
python esploratore.py --seme 7        # un'altra sequenza casuale, riproducibile
```

Il rapporto va in `esiti/esploratore-rapporto.md`; ogni anomalia ha la trascrizione
della prima partita in cui è comparsa (`esiti/anomalia-NN-tipo.txt`).

Il «turista» ha il corpo protetto (sete, fame e ferite non lo uccidono): non è un
giocatore reale, serve ad arrivare in ogni angolo del gioco. Gli altri quattro
caratteri muoiono davvero, e la proporzione di morti è un indizio per l'equilibrio.

## Primo giro (23/09/2026)

- `finali.py` ha trovato un difetto vero: le morti per sete e per fame mostravano
  sempre la frase generica, perché la vita arrivava a 0 prima della soglia estrema.
  Corretto in `sistemi.fav`: la morte ora dice la causa.
- `esploratore.py`: 100 partite, 15.416 comandi, **nessuna anomalia**; copertura 39/39
  luoghi, 27/27 oggetti, 50/52 nodi di dialogo (mancano solo la vendita dell'anello e
  la partenza di Peppe, due rami che il caso raggiunge di rado). L'80% delle partite
  a caso muore di fame o di sete: normale per chi gioca a caso, da tenere d'occhio
  quando si tarerà l'equilibrio con partite vere.
