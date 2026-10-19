---
data: 2026-10-20
ora: "01:24"
titolo: "Le rifiniture dell'analisi di ottobre"
tipo: sessione
versione: 1.15.0
---

# Le rifiniture dell'analisi di ottobre

## In breve
Il pacchetto di correzioni a basso rischio dell'analisi del 20 ottobre: il diario si lascia leggere dagli schermi parlanti, niente più schermo nero se una schermata si rompe, testo piccolo più leggibile, desktop più robusto e, nella storia, «bere due sorsi» e «mangiare una porzione» che funzionano come le forme all'imperativo.

## Contesto
L'analisi completa del 20 ottobre sulla 1.14.0 (collaudi verdi, nessuna criticità gravissima) aveva lasciato un elenco di difetti; questa sessione ha corretto solo i punti di quel pacchetto, senza toccare `motore/`. Nel corso del lavoro Simone ha precisato che Il Viaggiatore è **un gioco desktop a schermo intero, alla massima risoluzione**: telefono e social non vanno considerati. Il difetto «web e telefono inutilizzabili» dell'analisi resta quindi fuori ambito.

## Lavoro fatto
- **Loghi, avviso e trailer: nessuna modifica.** Un primo giro aveva aggiunto il clic per saltarli con un invito «salta», e un istante di guardia sui doppi clic; Simone l'ha escluso (vedi «Decisioni») e il tutto è stato tolto. Di `Trailer.tsx` resta soltanto che la guida, quando è aperta, gestisce Esc da sé.
- **Interfaccia:** il diario è `role="log"` con `aria-live="polite"`; nuovo `useDialogo` (fuoco dentro, Tab che resta nel dialogo, fuoco restituito, Esc opzionale) usato da «Come si gioca» (ora Esc la chiude anche in partita) e dal taccuino; `ConfineErrori` avvolge le fasi di `App.tsx` e scrive l'errore nel registro; contrasti e minimo di 11 px in `gioco.css`; `valida()` in `salvataggi.ts` rimette a posto diario, blocchi, incontrati e storia.
- **Desktop:** `main.cjs` controlla l'indirizzo (protocollo e host) e il percorso (`WEB + path.sep`); `salvataggi.cjs` scrive con un `.tmp` per scrittura, mette in fila le scritture dello stesso posto e, se il file di un posto è illeggibile, rilegge il `.bak`.
- **Storia:** in `sistemi.fav` le forme all'infinito con dose (bere un sorso, due, tre, con la cifra; mangiare qualcosa, una porzione, due, tre, con la cifra); in `z2-piana.fav` la richiesta d'acqua di Saverio ha una variante per fiducia 2 o più.
- **Collaudi:** `scorte.py` prova le forme all'infinito (75 comandi, prima 37) e «bere» e «mangiare» soli; `mirate.py` ha due prove per Saverio (10 in tutto); `esploratore.py` segnala i sinonimi che portano a stati diversi.
- **Documenti:** `PROSSIMI-PASSI.md` (motore 1.5.0, concluso con la 1.14.0), README e `collaudo/LEGGIMI.md` (undici collaudi, la CI ne esegue dieci), CHANGELOG.

## Decisioni
- **Protocollo e host, non `URL.origin`** — perché per uno schema proprio come `app://` l'origine di Node è la stringa «null»: confrontarla con `app://gioco` avrebbe bloccato ogni navigazione. Si accetta solo `app:` con host esattamente `gioco` (niente `gioco.altro.it`, niente utente o porta).
- **`puoAnnullare` non diventa `> 0`** — perché una sonda sulle dodici partite dei percorsi (1.689 comandi) ha mostrato che, prima della mossa, `undo` vale 0 solo alla primissima mossa, dopo la quale annulla funziona; mentre in un dialogo che continua (366 casi su 512 risposte di dialogo) dopo la mossa annulla non c'è. La nota della conferma parla di «dopo»: ora la decide l'anteprima (`!dialogo` e partita ancora in corso), non lo stato di prima.
- **Loghi, avviso e trailer restano come sono** — perché Simone non vuole modifiche al modo in cui si vedono né inviti a saltarli: al giocatore basta premere Esc (o «esci»). Niente clic per saltare, niente invito «salta», niente promemoria di ciò che si è già visto.
- **«bere» e «mangiare» soli restano com'erano** — perché li completa il ponte dell'app; si dichiarano solo le forme con la dose.
- **Saverio a fiducia alta** — «Cala piano, la corda è vecchia. Quel che viene su è tuo.»: vale sia col pozzo pieno sia col pozzo ridotto a fango, e non promette una tanica che potrebbe non esserci.
- **1.15.0, minor** — i `.fav` cambiano l'impronta dell'avventura e ci sono funzioni nuove nell'app (`sviluppo/VERSIONI.md`, §2); il formato dei salvataggi resta 1.

## Verifiche
- `tsc --noEmit` pulito; `npm run build` ok (JS 467 kB, 157 kB gzip).
- Collaudi in `collaudo/`: finali 9/9, mirate 10/10, salvataggi (16 partite, 19 ricaricati con impronta identica), scorte (75 comandi), interfaccia, fili, giocate, testo, conferme, pulsanti: tutti exit 0. `fili.py` e `conferme.py` vanno lanciati con `PYTHONUTF8=1` se l'output passa da una pipe di Windows: stampano una freccia che il codec predefinito (cp1252) non conosce; è un fatto dell'ambiente, non delle modifiche.
- Esploratore, giro corto (30 partite, 4.129 comandi): nessuna anomalia; il controllo dei sinonimi ha confrontato 61 coppie senza trovare differenze, e la via della segnalazione è provata a parte.
- Desktop: `salvataggi.cjs` provato con un Electron finto (venti scritture insieme: vale l'ultima, nessun `.tmp` resta, la riserva è la penultima; file troncato → riserva; posto eliminato non resuscitato dalla riserva). `electron . --autoverifica` sul pacchetto appena costruito: superata.
- Browser (server su 5200, prima e dopo): loghi, avviso e trailer identici a prima (nessun invito, il clic non salta, Esc sì); guida con fuoco dentro, Tab che resta dentro, Esc che chiude e fuoco restituito (anche in partita); taccuino idem; `role="log"` sul diario; «bere due sorsi» in partita; schermata del confine d'errore provocata a mano e tolta, con «torna all'intro» che riporta al menu.

## Questioni aperte
- Restano sotto i 4,5:1 il segnaposto del campo di comando (2,6:1), «chip em» e l'etichetta secondaria di «bisaccia» (4,2:1): non erano nell'elenco.
- Le misure in `em` di «Come si gioca» e del taccuino scendono a 9–10 px di base nella partita (la superficie è poi ingrandita a schermo intero): non toccate.
- Fuori dal pacchetto, dall'analisi: la chiusura di 1,4 kB copiata sei volte in `z7-guado.fav`; `Panorama` che ignora `luogo`; l'aggiornamento automatico di eseguibili non firmati; i fuse di Electron.
- Il confine d'errore prende gli errori di disegno, non quelli dei gestori di eventi né dei timer.
