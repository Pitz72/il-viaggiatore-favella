# Il Viaggiatore — la memoria del progetto

Questo file è l'ingresso per Claude e per chiunque riprenda il lavoro. **La memoria del progetto sta nel repository, e
solo qui.** Ciò che vive soltanto sul disco di una sessione o di un computer (cartelle locali, `.claude/`,
`RIPRENDI-QUI*.md`, `PROMPT-*.md`, `_backup/`: tutti in `.gitignore`) si perde quando la sessione o la cartella finiscono.
Se non è nel repository, per la prossima sessione non c'è.

## «Carica memoria» vuol dire

Leggere, in quest'ordine, e poi dare a Simone lo stato del progetto:

1. [`sviluppo/PROSSIMI-PASSI.md`](sviluppo/PROSSIMI-PASSI.md) — **lo stato vivo**: che cosa è aperto, che cosa è chiuso, che cosa di proposito non si fa.
2. [`sviluppo/DIARIO.md`](sviluppo/DIARIO.md) — l'indice del diario; la voce in cima dice come è finita l'ultima sessione.
3. [`CHANGELOG.md`](CHANGELOG.md) (la testa) e `versione.json` — a che versione siamo.
4. [`README.md`](README.md) — com'è fatto il gioco e il repository.
5. Solo se serve: [`sviluppo/VERSIONI.md`](sviluppo/VERSIONI.md) (le regole dei numeri), [`collaudo/LEGGIMI.md`](collaudo/LEGGIMI.md)
   (i collaudi), `pre-produzione/` (il perché di storia, sistemi, interfaccia, doppiaggio, musiche), `motore/LEGGIMI.md`,
   `app/src/lingue/en/LEGGIMI.md` (la traduzione inglese).

Poi si controlla che il repository dica lo stesso: `git status`, `git log`, la CI su `main`, le release.

## Che cos'è

*Il Viaggiatore*: avventura testuale di sopravvivenza e cammino scritta in FAVELLA 1 (motore Python in `motore/`, storia in
`prototipo/`), con l'app React in `app/` e il guscio Electron in `desktop/`. In italiano e, dalla 1.40.0, in inglese.
7 zone, 39 luoghi, 14 personaggi, 6 finali. La storia è definitiva dalla 1.12.0; il progetto è dichiarato concluso e il
lavoro riprende solo su richiesta di Simone.

## Regole che valgono sempre

- **Si lavora su GitHub.** Si sviluppa sul ramo che la sessione indica; `main` si porta avanti solo col sì di Simone
  (la 1.40.0 è stata un fast-forward del ramo su `main`). Il rilascio è sempre manuale: Actions → Rilascio → Run workflow.
- **Chiudere una sessione** vuol dire: una voce di diario (`node strumenti/diario.mjs nuovo "Titolo" --tipo sessione`),
  `sviluppo/PROSSIMI-PASSI.md` aggiornato se qualcosa si è aperto o chiuso, `CHANGELOG.md` se il gioco è cambiato, commit e push.
- **Un solo stato vivo.** Le cose da fare e quelle chiuse stanno in `PROSSIMI-PASSI.md`; qui non si ricopiano, perché due
  elenchi si disallineano.
- **Il motore non si tocca qui.** `motore/` è FAVELLA 1.5.0: se serve cambiarlo, si cambia nel repository di FAVELLA 1
  (`Pitz72/FAVELLA1`, con i suoi test) e si ricopia.
- **Ogni modifica ai `.fav` cambia l'impronta dei salvataggi**: versione minor, major se si ristruttura una zona. I collaudi
  (`collaudo/`, tutti nella CI) devono restare verdi.
- **Il testo italiano ha la sua traduzione.** Motore e `.fav` restano in italiano; l'inglese sta nei cataloghi
  `app/src/lingue/en/`. Se un testo italiano cambia: `python strumenti/traduzione.py`, tradurre ciò che manca,
  `python strumenti/traduzione.py controlla`; il collaudo `collaudo/traduzione.py` lo pretende.
- **Italiano per documenti, diario e commit** (`tipo(ambito): frase`, come nella storia di git).
- **Fuori da git per scelta**, perché pesanti o non rigenerabili: i master del doppiaggio (`doppiaggio/master/`), gli originali
  di immagini (Google Flow) e brani (Lyria), i video. Stanno sul computer di Simone; una sessione cloud non li vede e non li salva.
- **Gli altri repository sono di Simone** e si toccano solo su sua richiesta: `Pitz72/FAVELLA1` (il motore e il sito
  favella.eu in `landingpage/`), `Ecosystem-Runtime` (ramo principale `master`), `SimonePizziWebSite`. I caricamenti sui siti
  hanno credenziali che stanno sul suo computer.

## Su una sessione cloud

- Il clone è **parziale** (50 commit): per la storia intera, `git fetch --unshallow`.
- Mancano `lark` e `node_modules`: i collaudi che li chiedono (`pip install lark==1.3.1`, `npm ci --prefix app`) non girano
  finché non si installano; la CI su GitHub li esegue comunque tutti.
- Il disco di Simone (compreso `F:\Backup`) e i siti favella.eu e simonepizzi.runtimeradio.it non sono raggiungibili da qui.
