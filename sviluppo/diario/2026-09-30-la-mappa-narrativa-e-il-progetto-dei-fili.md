---
data: 2026-09-30
ora: "21:49"
titolo: "La mappa narrativa e il progetto dei fili"
tipo: decisione
versione: 1.4.0
---

# La mappa narrativa e il progetto dei fili

## In breve
Uno strumento nuovo misura la memoria della storia: 19 variabili su 21 si spengono nella zona in cui nascono, solo Peppe viaggia. Il progetto per ramificare davvero è in `pre-produzione/06-ramificazione.md`, in attesa di decisioni.

## Contesto
Dopo la 1.4.0 si voleva passare da un viaggio ricco di incontri a una storia interattiva in cui ciò che fai per strada torni più avanti. Prima di scrivere si è voluto vedere com'è fatta oggi la storia, con i numeri e non a impressione. Il lavoro segue il metodo della skill di progettazione narrativa (hyper-fable): mappa, audit, proposta a strati.

## Lavoro fatto
- `strumenti/mappa-narrativa.py`: rilegge i `.fav` zona per zona e scrive `sviluppo/mappa-narrativa.md`: per ogni variabile dove si scrive e dove si legge, per ogni cosa dove nasce e dove conta, i finali con le loro condizioni, le opzioni di dialogo per zona.
- `pre-produzione/06-ramificazione.md`: com'è fatta la storia, l'audit (scena amnesia a Z5–Z7, fiducie che lo schermo mostra ma la storia dimentica, scelta cosmetica nel climax del guado, lascito che chiude la via umana troppo presto) e la proposta: due fili (il sangue, i doni), un bivio nuovo al guado (il fucile posato), i finali che raccolgono il viaggio.
- README e `sviluppo/PROSSIMI-PASSI.md` aggiornati.

## Decisioni
- **La mappa si ricava dal testo dei `.fav`, non dal mondo compilato** — perché serve sapere in quale zona (in quale file) una cosa è scritta, e il mondo compilato non lo ricorda.
- **Stato minimo**: due contatori nuovi e una lettura nuova di una variabile che esiste (Pasquale). Nessun personaggio, zona o finale nuovo — perché sei finali sono già al limite di ciò che si scrive bene, e il problema non è il numero dei finali ma il fatto che il viaggio non li nutre.
- **La giustificazione nel mondo è quella già scritta**: la voce che corre lungo la strada («qui le cose si sanno prima di sera»).
- **Niente `.fav` finché non si decidono i punti del §6** del documento: il fucile posato è l'unico cambiamento che tocca l'esito.
- **Nessun cambio di versione**: il gioco è identico, cambiano solo documenti e strumenti.

## Verifiche
La mappa ritrova le cose note: i quattro interruttori dei sei finali, Peppe come unico filo, 15 cose che viaggiano (quasi tutte merce per Ciro), 0 variabili mai lette. I numeri del documento vengono dalla mappa generata.

## Questioni aperte
- Le decisioni del §6 di `06-ramificazione.md`.
- Lo strumento legge la prosa di FAVELLA con espressioni regolari: una frase scritta in un modo nuovo può sfuggirgli. Se la storia cresce, conviene un controllo nel collaudo che confronti le sue variabili con quelle del mondo compilato.
