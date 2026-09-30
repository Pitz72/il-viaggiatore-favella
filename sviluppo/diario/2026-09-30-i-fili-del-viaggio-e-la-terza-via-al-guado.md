---
data: 2026-09-30
ora: "22:19"
titolo: "I fili del viaggio e la terza via al guado"
tipo: sessione
versione: 1.4.0
---

# I fili del viaggio e la terza via al guado

## In breve
Due fili attraversano il viaggio, il sangue e la generosità, e al guado chi ha il fucile può posarlo: allora decide com'è stato il viaggio. Le conseguenze a distanza passano da 2 a 6, i sei finali restano, ma ci si arriva per più strade.

## Contesto
La mappa narrativa aveva mostrato una storia lineare nelle conseguenze (voce precedente). L'autore ha deciso i punti aperti del progetto: il bluff non è sangue perché non muore nessuno; Rosaria più fredda va bene; i nomi sono «il sangue» e «la generosità»; sul fucile e sulla soglia dei doni ha chiesto di scegliere ciò che estende di più quel pezzo di storia.

## Lavoro fatto
- `il-viaggiatore.fav`: i due contatori.
- Z2, Z4: il cane ucciso e Vito (colpito, a terra) sono sangue.
- Z2, Z3, Z5: il primo dono a Saverio, a Iole, a Rosaria (la brocca a parte), Pasquale curato sono generosità, una volta per persona.
- Z5: Rosaria accoglie chi ha sangue addosso ma non si siede (fiducia − 1); Ciro, creditore di Vito, sa del casello.
- Z6: Tore «ha saputo anche il resto»; Onofrio sa di Pasquale, e della febbre; il fucile e il valico suggeriscono la terza via.
- Z7: la prima battuta di Cosimo cambia col sangue e con la generosità; il fucile posato; la veglia (tre turni senza sangue, cinque con, e la sete); riprendere il fucile o alzare le mani la rompe; la descrizione di Cosimo sa come si è spostato; la strada di Acquamorta ricorda, una volta sola.
- Collaudi: `fili.py` (35 prove), percorsi `G_posato` e `H_veglia` in `finali.py` e `pulsanti.py`, CI e rilascio aggiornati. `strumenti/mappa-narrativa.py` legge anche gli effetti dopo i due punti.
- `pre-produzione/06-ramificazione.md` riscritto come stato realizzato; schede di Cosimo e Rosaria aggiornate.

## Decisioni
- **La veglia, non una porta chiusa** — perché il pilastro «la violenza è sempre possibile, mai l'unica via» deve valere anche per chi ha scelto il fucile. Il prezzo del sangue è il tempo e la sete, non l'impossibilità.
- **Soglia della generosità: 3 su 4** — perché con 2 sarebbe quasi automatica (Iole è di fatto obbligata per la pompa).
- **La lettera funziona anche col sangue** — perché è la via guadagnata in Z6, con Onofrio; il sangue cambia le parole di Cosimo, non l'esito.
- **I finali non cambiano testo**: la memoria del viaggio sta sulla strada, un passo prima della soglia. Così i sei finali restano quelli che l'autore ha scritto, e il loro collaudo non cambia.
- **I contatori restano invisibili**: si vedono solo nelle conseguenze. Mostrarli come punteggi morali trasformerebbe la generosità in un calcolo.
- **Sulla strada Cosimo raggiunge il viandante alla fontana**, non gli cammina dietro: al guado ha appena detto «Va' avanti tu, io arrivo».

## Verifiche
Compilazione senza avvisi; collaudo statico senza avvisi. `finali.py` 11/11 partite (otto percorsi di storia, tre morti), copertura 9/9; `fili.py` 35/35; `mirate.py` 8/8; `salvataggi.py` 16 partite, 21 ricaricamenti identici; `scorte.py`, `interfaccia.py`, `conferme.py` (44 scelte); `pulsanti.py` 8/8 percorsi giocati solo coi pulsanti; esploratore 100 partite, 15.797 comandi, nessuna anomalia. Nell'app, al guado col fucile e il sangue del cane: menu del fucile con «lascia», testo col suggerimento a margine, quattro «aspetta» dai pulsanti, Cosimo che si sposta; dopo, «Attacca Cosimo» e «Usa il biglietto» spariscono da soli. Mappa: conseguenze a distanza da 2 a 6.

## Questioni aperte
- Le fiducie restano mostrate a lato: ora contano i doni, non il numero di ciascuno.
- Fili possibili: Vito umiliato dal bluff che lo racconta; Peppe che sa del sangue.
- I testi nuovi sono stati scritti con la skill di prosa; una lettura dell'autore ad alta voce resta la prova migliore.
