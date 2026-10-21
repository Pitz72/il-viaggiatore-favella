---
data: 2026-10-21
ora: "03:59"
titolo: "I tre modi dei comandi (piano 09, fase 5)"
tipo: sessione
versione: 1.29.0
---

# I tre modi dei comandi (piano 09, fase 5)

## In breve
Nelle opzioni si sceglie come dare i comandi: pulsanti e parole (com'è sempre stato), solo pulsanti, solo parole. La guida «Come si gioca» parla del modo scelto, e «opzioni», «pausa», «salva» e «carica» scritti nella riga aprono i pannelli. Prima, con Simone, la revisione dei trenta trofei della fase 7.

## Contesto
Ripresa dopo la chiusura della notte (1.28.0, fasi 1, 2, 3, 4 e 6 fatte). Simone ha voluto per prima cosa i nomi dei trofei, col questionario: accenni «dove guardare», finali, fini, sfide e collezione come nella prima stesura; per gesti e modi di arrivare la via di mezzo, con sette nomi presi dalle battute della scena; nessuna aggiunta, restano 30 (§7.3 del piano, commit `4b977c6`). Una mia proposta, «Era del piccolo», valeva solo per il cavallo di legno, mentre il gesto con Onofrio si fa anche col santino: è diventata «Qualcosa di quella casa», la sua richiesta. Poi la fase 5, come da piano (§3.3).

## Lavoro fatto
- `lib/opzioni.ts`: `comandi` («entrambi», «pulsanti», «parole»; di base «entrambi»), con la pulizia dei valori guasti. `opzioni-node.mjs` ha una prova in più (9).
- `gioco/Opzioni.tsx`: la scheda Generale c'è sempre, anche nel browser. A sinistra «Il gioco», con la riga Comandi e una spiegazione per ogni modo; a destra, solo sul desktop, «All'avvio» con gli aggiornamenti. La colonna sinistra è la più larga, perché i tre valori stiano su una riga.
- `components/ViaggiatorePlayer.tsx`:
  - **solo pulsanti**: niente riga; ↶ annulla accanto a guarda, inventario, stato, aspetta. Il fuoco va al primo pulsante utile (`rimettiFuoco`, segnato con `data-fuoco`: la prima risposta, il «no» della domanda del motore, la prima uscita); il menu di una cosa che si apre prende il fuoco, e chiuso senza un turno lo rende al gioco. Messo dal codice su una risposta di dialogo, il fuoco non la fa leggere al narratore, che sta dicendo la battuta (`fuocoDaCodice`).
  - **solo parole**: niente file di pulsanti, menu delle cose, dosi, ↶ annulla, sì/no della domanda del motore; le parole in maiuscolo non si toccano; le risposte sono testo numerato; scorte e bisaccia sono elementi da leggere (non pulsanti spenti, che il lettore di schermo direbbe «non disponibili»). Il segnaposto della riga dice di scrivere il numero della risposta.
  - `scritto()`: «opzioni», «pausa», «salva», «carica» scritti aprono i pannelli, prima del ponte (il motore non usa le prime due; le altre due il ponte le fermava con un avviso). Il resto va a `manda` come prima.
  - Ctrl+Z vale anche fuori dalla riga; Tab non zittisce più la voce; cambiando modo i menu aperti si chiudono.
- `gioco/ComeSiGioca.tsx`: le schede sono una funzione del modo (la prima diventa «Tocca» o «Scrivi»; il corpo, il parlare, la bisaccia e il leggere il mondo dicono di toccare o di scrivere; in «solo pulsanti» niente comandi d'esempio). Le classi `csg-*` e le loro regole in `accessibilita.css` chiudono la questione aperta della fase 6: col contrasto alto le schede sono piene e i testi chiari. Lo `zIndex` della guida da 60 a 70: aperta dalla pausa (65) le finiva sotto, dalla fase 2.
- `gioco.css`: risposte scritte (senza riquadro), scorte e oggetti da leggere, chip spento.
- README (il paragrafo «I comandi»; «⚙ opzioni in alto nella partita» non c'era più dalla fase 2), CHANGELOG, il piano (§10, §11).

## Decisioni
- **In «solo parole» via anche ↶ annulla** — perché: è un pulsante che manda un comando; restano ANNULLA scritto e Ctrl+Z. La guida lo dice.
- **«salva» e «carica» scritti aprono il taccuino** — perché: è ciò che chi scrive si aspetta, e il ponte già li fermava (con un avviso che rimandava a F5 e al taccuino). Fuori dal piano, ma nella sua linea.
- **Tab non zittisce la voce** — perché: in «solo pulsanti» Tab è il modo di muoversi, e ogni passo avrebbe tagliato il racconto. Vale in tutti i modi: spostare il fuoco non è parlare sopra.
- **Il fuoco programmato senza lettura** — perché: la risposta 1, presa dal fuoco a ogni turno di dialogo, avrebbe coperto la battuta appena detta.
- **Versione 1.29.0** — un'opzione nuova: MINOR.

## Verifiche
- Collaudi: `finali.py` (tutti i percorsi), `mirate.py`, `salvataggi.py` (40 partite, 53 salvataggi ricaricati), `interfaccia.py`, `pulsanti.py` (i sei finali coi soli pulsanti: la prova di «solo pulsanti»), `testo.py`, `doppiaggio.py` tutti ok; `opzioni-node.mjs` 9, `posti-node.mjs` 6, `desktop/prove.cjs` 14; `tsc` pulito; build ok.
- Nel browser integrato, sul gioco vero: la scheda Generale c'è nel browser (Generale | Video | Audio) e i tre valori stanno su una riga. **Solo pulsanti**: nessuna riga; ↶ annulla fra i servizi; dopo il caricamento il fuoco è su «sud»; Invio porta alla piazza e il fuoco va alla nuova prima uscita; il menu di Nunzio prende il fuoco su «parla con», Invio apre il dialogo e il fuoco va alla risposta 1; Ctrl+Z riporta dalla piazza al bar («› annulla»). **Solo parole**, scelto dalla pausa a dialogo aperto: il fuoco torna alla riga, segnaposto «scrivi il numero della risposta (1, 2…)», risposte come testo, nessuna parola che si tocca, scorte `div` e bisaccia `span`, nessuna fila di pulsanti; «3» chiude il dialogo; «pausa», «opzioni», «salva» aprono pausa, opzioni e taccuino senza un turno nel diario e il fuoco torna alla riga. La guida dice «Scrivi»/«Tocca» e il resto secondo il modo; col contrasto alto il testo delle schede è (236, 230, 219) su nero. Tornati a pulsanti e parole, tutto com'era. Console senza errori.

## Questioni aperte
- Da provare con Simone nel desktop: una partita in «solo pulsanti» con la sola tastiera e una in «solo parole» (fase 8, partite intere nei tre modi).
- Fase 7: «trofei» scritto aprirà la pagina; per le sfide «Tutto a parole» e «Tutto a pulsanti» la fonte di ogni comando si distingue fra `scritto` (la riga) e `manda` (i pulsanti).
