---
data: 2026-09-29
ora: "15:52"
titolo: "Allineamento al motore 1.4.0"
tipo: sessione
versione: 1.1.1
---

# Allineamento al motore 1.4.0

## In breve
Il gioco passa dal motore FAVELLA 1.2.1 alla 1.4.0, la stessa versione che fa girare *Il Viaggiatore* sul sito di FAVELLA; la storia non cambia.

## Contesto
Tra il 23 e il 26 settembre il repository del motore ha rilasciato la 1.2.2, la 1.3.0 e la 1.4.0. Il gioco era rimasto sulla 1.2.1, mentre le storie nella galleria del sito, identiche alle nostre, giravano già sul motore nuovo: le due versioni si comportavano in modo diverso.

## Lavoro fatto
- copiati gli otto file del motore (procedura di `motore/LEGGIMI.md`, aggiornato); i moduli del browser sono gli stessi cinque, quindi `sincronizza.mjs` e `ENGINE_FILES` non cambiano; `strumenti_ide.py` ed `esportazione.py` non servono al gioco e non sono copiati;
- nessuna modifica ai sorgenti `.fav` né al codice dell'app;
- CHANGELOG «Non rilasciato» con i cambiamenti visibili al giocatore.

## Decisioni
- **Nessuna modifica ai `.fav`** — perché: anche un commento cambierebbe l'impronta dell'avventura nei salvataggi. Il commento su `mangia` in `sistemi.fav` (riga 14) è vecchio dopo la divisione delle azioni della 1.2.2, ma è innocuo.
- **`testo.ts` resta com'è** — perché: passare agli eventi tipizzati della 1.4.0 è un lavoro a sé.
- **Versione del gioco: minor** — perché: motore minor nuovo, verbi nuovi, ribilanciamento involontario dei refusi (`sviluppo/VERSIONI.md` §2).

## Verifiche
Compilazione senza avvisi (39 stanze, 44 oggetti). `finali.py` 9/9, `mirate.py` 8/8, `salvataggi.py` 16 partite e 20 ricaricamenti identici. Esploratore: 100 partite, 16.263 comandi, nessuna anomalia, 39/39 luoghi e 27/27 oggetti. Collaudo statico senza avvisi. Salvataggi creati con la 1.2.1 e ricaricati sulla 1.4.0: 46 su 46 senza errori, i 6 su percorsi puliti con impronta identica. `npm run build` riuscito; autoverifica nel browser (Pyodide con il motore 1.4.0) superata.

## Questioni aperte
- I messaggi nuovi del motore («Il tempo passa.», «Non senti nulla di particolare.», «Cosa vuoi esaminare?», la conferma di `esci`) non sono nell'elenco di `app/src/gioco/testo.ts`: compaiono nello stile della prosa invece che in quello di sistema.
- L'ordine degli oggetti nella scheda dell'inventario cambia da una partita all'altra (l'inventario del motore è un insieme): difetto preesistente.
- Le dichiarazioni doppie di `z2-piana.fav` («getta il cibo», «lancia cibo»…) si potrebbero semplificare con i sinonimi.
