---
data: 2026-11-01
ora: "14:25"
titolo: "La revisione totale del codice"
tipo: sessione
versione: 1.41.0
---

# La revisione totale del codice

## In breve
Revisione di tutto il codice (non della storia né dei documenti) e verifica della sua solidità: i collaudi, la build e l'autoverifica dentro Electron sono verdi; trovati e riprodotti due difetti veri (una domanda del motore che risorge dopo salva e carica, un trofeo che si può perdere), un Electron da aggiornare e il workflow «Rilascio» da stringere. **Nessun file di codice cambiato**: i rimedi aspettano il via di Simone.

## Contesto
Simone, 1° novembre 2026: «Fai una revisione accuratissima e totale del SOLO codice e verificane la solidità». Si partiva dalla 1.41.0 appena rilasciata, albero pulito.

## Lavoro fatto
- **Letti per intero**: il ponte Python (`app/src/lib/ponte.py`), il runtime (`favellaRuntime.ts`), il giocatore (`ViaggiatorePlayer.tsx`), i salvataggi (`salvataggi.ts`, `posti.ts`), le opzioni, i trofei (regole e deposito), le azioni e le conferme, il testo, la voce, la musica, il bus sonoro, il taccuino, il confine d'errore, l'autoverifica; tutto il processo principale desktop (`main.cjs`, `ipc.cjs`, `preload.cjs`, `salvataggi.cjs`, `aggiornamenti.cjs`, `impostazioni.cjs`, `registro.cjs`, `colonna-sonora.cjs`, `prepara.mjs`); i due workflow; `sincronizza.mjs`.
- **Del motore** (FAVELLA 1.5.0, che qui non si tocca) letti i punti che il ponte usa: `elabora_comando`, le conferme, le domande in sospeso, ANNULLA, il registro dei comandi; cercate chiamate rischiose (niente `eval`, `pickle`, comandi di sistema). Non rivisto riga per riga.
- **Trailer, loghi, locandine, panorama**: guardati per le risorse (animazioni e timer fermati allo smontaggio), non riga per riga.
- **Strumenti e collaudi**: i 32 file Python fuori dal motore analizzati (nessun `except` nudo, default mutabile, `shell=True`, `eval`); gli strumenti Node passano gli argomenti in elenco.
- **Prove scritte per riprodurre i difetti** (solo nella cartella temporanea della sessione, non nel repository): la domanda che risorge, il registro del motore al posto di quello del ponte (76 caricamenti), la gara fra due scritture del deposito dei trofei.

## Decisioni
- **Non correggere niente senza il via** — perché la richiesta era una revisione, e due rimedi toccano i salvataggi (il cuore della partita): Simone sceglie.
- **Il rimedio consigliato per la domanda che risorge sta nel ponte, non nel motore** — perché il motore non si tocca qui, e il suo registro (`_registro_comandi`) ha già il comportamento giusto ma usarlo cambierebbe il conto dei comandi dopo un «ricomincia» (le sfide dei trofei lo leggono).

## Verifiche
- I 26 passi del job «collaudo» della CI, in locale: tutti verdi (versioni, diario, registro, 18 prove del processo principale, data, compilazione, nove finali, mirate, 16 partite di salvataggi con 21 caricamenti, scorte, interfaccia, fili, giocate, 95 conferme, testo, opzioni, posti, trofei, sequenza finale, pulsanti, 12.275 controlli della mappa, musica, doppiaggio, traduzione) e `tsc --noEmit` pulito.
- `node prepara.mjs` (build di produzione, 84,4 MB in `desktop/web`) riuscita; `electron . --autoverifica` con cartelle di prova: **AUTOVERIFICA SUPERATA** (motore in 1,8 s, 878 parti di voce italiane e 845 inglesi, musica, salvataggio ricaricato identico, ANNULLA dopo il caricamento).
- L'esploratore completo (`python esploratore.py`, 100 partite a caso): **0 anomalie**; 5 stalli, tutti con «la strada c'è» (giocatori che girano a vuoto); 37 luoghi su 39 e 27 oggetti su 27 toccati per caso, i sei finali coperti da `finali.py`.
- Un inciampo mio: lo script che ripeteva i collaudi ha scritto i suoi 26 registri (`log-*.txt`) nella radice del clone e in `collaudo/` invece che nella cartella temporanea; spostati lì prima del commit, mai entrati in git. La build ha rifatto le cartelle ignorate da git (`app/dist`, `app/public/pyodide`, `app/public/favella-engine`, `desktop/web`, `desktop/build`).
- `npm audit`: le dipendenze dell'app che si distribuiscono, 0 avvisi; **electron 44.4.4 ha due avvisi «high»** (GHSA-x562-297c-g43g, GHSA-jr5w-w6x2-84p9) e `--omit=dev` non li mostra perché electron è fra le devDependencies, ma è il runtime del pacchetto; vite 8.0.16 ha avvisi solo per il server di sviluppo; fast-uri e minimatch stanno negli strumenti di electron-builder.

## Questioni aperte
Tutte in [`PROSSIMI-PASSI.md`](../PROSSIMI-PASSI.md), «Aperto», in attesa del via di Simone:
- **Medio — la domanda del motore che risorge** (`ponte.py`, `_annota` e `fav_step`). ANNULLA, riuscito o no, toglie dal mondo la domanda in sospeso (sì/no di «ricomincia» ed «esci», «Con cosa vuoi usarla?», «Quale intendi?»), ma il comando che l'aveva posta resta in fondo alla sequenza salvata. Riprodotto: `nord, aspetta, ricomincia, aspetta, annulla`, poi salva e carica → la partita ricaricata chiede «ricominciare da capo?» e un «s» (sud) la fa ripartire da zero (turno 0, senza ANNULLA), mentre quella viva va a sud (turno 3). L'impronta non se ne accorge (`identica` vero). Raggiungibile anche coi pulsanti e col salvataggio automatico al cambio di luogo; `collaudo/salvataggi.py` non lo copre (le sue partite non fanno domande). Rimedio: nel ponte, i comandi che hanno solo posto una domanda escono dalla sequenza con ANNULLA, e il turno che segue una domanda si annulla insieme a lei; un caso nuovo nel collaudo.
- **Medio — Electron 44.4.4** nel pacchetto 1.41.0: `npm update electron` in `desktop/` (44.10.1, stessa major), autoverifica, prossima release.
- **Medio — il workflow «Rilascio»**: `contents: write` vale per tutti i job (anche quello che fa `npm ci` ed electron-builder, e `actions/checkout` lascia il token in `.git/config`): `contents: read` in testa, `write` solo nel job della release, `persist-credentials: false`. Il suo «collaudo completo» non ha mappa, doppiaggio, traduzione, le prove Node di opzioni, posti e sequenza finale, `desktop/prove.cjs`, la data, diario e registro, e non chiede che la CI sia verde su quel commit: meglio richiamare `ci.yml` (`workflow_call`).
- **Basso — il deposito dei trofei** (`lib/trofei.ts`): `vinci`, `azzeraTrofei` e `segnaLontano` rifanno il deposito dal valore letto prima dell'`await`; riprodotto: `vinci` e `segnaLontano` nello stesso giro → il trofeo non c'è né in memoria né sul file. Nel gioco le due chiamate sono distanziate da una scrittura, quindi è raro. Rimedio di tre righe.
- **Basso**: Invio nel nome di un salvataggio nuovo non guarda se un salvataggio è già in corso (due Invio, due salvataggi uguali, `Taccuino.tsx`); la richiesta «bytes=-N» servita dall'inizio del file (`main.cjs`); messaggi del processo principale solo in italiano che arrivano allo schermo in inglese; su Windows nessun nuovo tentativo se il file è bloccato da un antivirus al momento della rinomina; dopo «ricomincia» in partita la sequenza tiene anche la partita di prima e le sfide proseguono; le variabili temporanee che JavaScript mette nel namespace del ponte (`_entry`); i contesti audio chiusi trattenuti dal bus sonoro; nessun linter (i commenti `eslint-disable` non hanno un ESLint dietro).
