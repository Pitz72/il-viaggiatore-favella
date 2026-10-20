---
data: 2026-10-20
ora: "08:04"
titolo: "FAVELLA 1: il motore non cambia, il sito va risincronizzato"
tipo: decisione
versione: 1.16.1
---

# FAVELLA 1: il motore non cambia, il sito va risincronizzato

## In breve
Le modifiche del Viaggiatore dalla 1.14.0 a oggi non chiedono niente al motore: `motore/` è identico a FAVELLA 1 v1.5.0 e la storia di oggi gira uguale con il motore del repository di FAVELLA 1. Il sito (`landingpage/` di FAVELLA1, al commit `5c0eca4`) è invece fermo al Viaggiatore 1.14.0 e va risincronizzato, dopo il rilascio. Nel repository di FAVELLA1 non è stato toccato niente: la verifica è in sola lettura.

## Contesto
Il Viaggiatore tiene una copia del motore e il sito di FAVELLA 1 tiene una copia del Viaggiatore (la storia nella galleria, l'app web in `esperimento/`). Dopo la 1.15.0 e la 1.16.0, pushate e non rilasciate, serviva sapere se il motore doveva cambiare e che cosa del sito andava aggiornato. Una sessione separata su FAVELLA1 parte solo dopo il rilascio (il sito rimanda a `releases/latest`) e solo se Simone lo dice.

## Lavoro fatto
- **Il motore.** I file di `motore/` (compilatore, gioco, strutture, libreria_azioni, favella_utils, collaudo, esploratore, favella) sono uguali, byte per byte, a quelli di FAVELLA1 al tag `v1.5.0`; dopo il tag nessuno è stato toccato (`git diff v1.5.0..HEAD` vuoto per gli otto). Nella cartella di lavoro di FAVELLA1 quattro file hanno i fine riga CRLF (`core.autocrlf=true`): senza CR sono uguali al tag. `git diff 496bb8e..HEAD -- motore/` nel Viaggiatore è vuoto. L'unica funzione del motore che la storia usa e che prima non usava, il testo con un nome (`Il testo "i fili del viaggio" è "…".` e `[i fili del viaggio]` in `z7-guado.fav`), c'è dalla 1.5.0 (il CHANGELOG di FAVELLA1 la elenca sotto 1.5.0).
- **La storia con il motore di FAVELLA1.** In una copia di lavoro del Viaggiatore con `motore/` sostituito dai file del repository di FAVELLA1: `favella.py compila` dà «Compilazione riuscita (39 stanze, 46 oggetti)» e i dieci collaudi (finali 9/9, mirate, salvataggi con 40 partite, scorte, interfaccia, fili, giocate, testo, conferme, pulsanti) escono tutti con 0.
- **Pyodide.** Il sito carica Pyodide `v0.27.2` dalla CDN (`landingpage/esperimento/src/lib/favellaRuntime.ts`, Lark da PyPI con micropip); il gioco è a 0.27.8. Le due versioni hanno lo stesso Python (3.12.7). Prova: i 12 percorsi completi di `collaudo/percorsi.py`, con un pilota che beve e mangia, giocati nel ponte vero dentro Pyodide 0.27.2 (dal pacchetto npm) e dentro 0.27.8, in Node: trascrizioni e impronte (stato e avventura) **identiche in tutti i 12** (impronta dell'avventura `1fcce969cd06a11a`). La CDN ha anche `v0.27.8`.
- **Gli spunti facoltativi per il motore** (da riferire, non da implementare): (1) sulla storia 1.14.0 `favella.py esplora` segnalava «SINONIMO ×22: «mangia due porzioni» e «mangiare due porzioni» portano a stati diversi» (le forme all'infinito dei comandi multiparola dichiarati); nella storia sono risolte con i sinonimi di `sistemi.fav`, e sulla storia di oggi le anomalie sono 0. (2) `favella.py collaudo` sulla storia scrive un rapporto di 2.139.104 byte e dichiara «OSTRUZIONE POSSIBILE: ogni via verso la vittoria contiene un requisito che non risulta producibile», con righe «OSTRUZIONE SOSPETTA su: CondizioneProbabilita» ripetute: è un falso allarme delle regole «càpita (1 su N)» (i finali si raggiungono: `finali.py` 9/9, `giocate.py`). Annotazione: `favella.py esplora` a caso copre solo 5 luoghi su 39 (muore di sete), l'esploratore del progetto con il pilota è più utile.
- **Che cosa del sito va risincronizzato.** Il confronto (`git diff 496bb8e..HEAD`) separa tre gruppi, dopo aver verificato che la galleria è la storia di 1.14.0 (hash uguali) e che `esperimento/src` è l'`app/src` di 1.14.0 salvo tre adattamenti (`favellaRuntime.ts`, `index.html`, `vite.config.ts`).
  - Le storie da copiare in `landingpage/public/favella-engine/galleria/il-viaggiatore/`: `sistemi.fav`, `z2-piana.fav`, `z7-guado.fav` (gli altri sei sono uguali).
  - Il codice dell'app che vale anche per l'esperimento web (tutto: ricade sul comportamento web dove serve il desktop): `App.tsx`, `components/Trailer.tsx`, `components/ViaggiatorePlayer.tsx`, `components/ConfineErrori.tsx` (nuovo), `gioco/ComeSiGioca.tsx`, `gioco/Panorama.tsx`, `gioco/Taccuino.tsx`, `gioco/gioco.css`, `gioco/useDialogo.ts` (nuovo), `lib/ponte.py`, `lib/salvataggi.ts`, più i ritocchi di questa versione (`main.tsx`). `favellaRuntime.ts`, `index.html` e `vite.config.ts` non cambiano; si può portare `PYODIDE_VERSION` a `v0.27.8`. **Non** vanno nel sito: `desktop/`, le fuse, l'IPC, gli aggiornamenti, `strumenti/`, `collaudo/`, `.github/`.
  - Versioni, testi e news: `esperimento/versione.json` (la versione rilasciata), `src/constants.tsx` (`SITE_VERSION` 2.9.3 → 2.9.4 e la riga di storico; il commento sulla release «oggi la 1.14.0…, la storia è quella della 1.12.0»; la notizia «Il Viaggiatore 1.14.0…»), `ViaggiatoreBanner.tsx` («concluso (1.14)»), `package.json` del sito, `public/favella-engine/SYNC.md` (la riga di stato). Poi la procedura di `SYNC.md`: test del sito, `scripts/valida_checkpoint.py`, build e deploy.

## Decisioni
- **La sessione su FAVELLA1 non parte ora** — perché il sito rimanda a `releases/latest`: va aggiornato solo quando la nuova versione è davvero pubblica, e solo se Simone lo dice. Il brief è in `sviluppo/brief-favella1-risincronizzazione.md`.
- **Gli spunti per il motore restano spunti** — perché il motore è fermo e si cambia solo nel suo repository, con i suoi test.

## Verifiche
- Confronto dei file: `sha256` dei file di `motore/` contro `git show v1.5.0:<file>` (8 su 8 uguali; i 4 con CRLF uguali dopo aver tolto i CR).
- Collaudi sulla copia con il motore di FAVELLA1: finali, mirate, salvataggi, scorte, interfaccia, fili, giocate, testo, conferme, pulsanti: exit 0 tutti.
- Pyodide 0.27.2 contro 0.27.8: 12 percorsi, trascrizioni e impronte uguali (`TOTALE 06173163bb7ecce0` in entrambe); entrambe Python 3.12.7.

## Questioni aperte
- La sessione di risincronizzazione del sito (brief pronto), dopo il rilascio e su ordine.
- Gli spunti (1) e (2) per il motore, se Simone li vuole nella 1.5.x.
