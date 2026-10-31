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

- **`main` è sempre l'ultimissimo stato di lavoro** (decisione di Simone, 31 ottobre 2026). A fine sessione ciò che è fatto e
  verificato si porta su `main` (fast-forward, mai forzando), con la memoria aggiornata; un clone fresco di `main` deve bastare
  a riprendere. Il rilascio resta sempre manuale: Actions → Rilascio → Run workflow.
- **Dove si sviluppa.** Dal 31 ottobre 2026 lo sviluppo torna **in locale**, in `C:\Users\Utente\Documents\GitHub\IlViaggiatore`:
  le sessioni cloud non vedono i materiali fuori da git né le credenziali dei siti, e continuare lì è stato un errore (la
  memoria locale è andata persa). GitHub è il backup: si spinge spesso.
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
  Dove sono (ripristino del 31 ottobre 2026, diario «Il ripristino in locale»):
  - `doppiaggio/master/`, `video/` (senza la schermata di Ecosystem, che non è del gioco), `.claude/launch.json`,
    `RIPRENDI-QUI-chiusura.md`, `PROMPT-chiusura-e-doppiaggio.md`: nel clone, tutti ignorati da git; copiati dal backup
    `F:\Backup\Il Viaggiatore - 2026-10-22` (stato del 22 ottobre), che resta com'è.
  - Gli originali: `C:\Users\Utente\Documents\SVILUPPO\VIDEOGIOCHI\IlViaggiatore-originali\`, con `flow-ritratti/` e
    `flow-oggetti/` (già chiamati `ritratto-<nome>.jpg` e `oggetto-<nome>.jpg`, per `strumenti/immagini.py`), `lyria/` (per
    `strumenti/colonna-sonora.py album`), `LEGGIMI.txt` e `CORRISPONDENZA.txt`; i file di Flow e di Lyria stanno anche in
    `Downloads`.
  - **Non rigenerare `app/public/immagini/` da quegli originali**: i WebP rifatti sono quasi uguali ma non identici (i file ritrovati
    non sono bit per bit quelli lavorati nel 2026-10-30). Valgono i WebP del repository. I brani in `app/public/colonna-sonora/`
    hanno già l'audio identico a quello di Lyria.
  - `memoria-claude-2026-10-23/`, nella stessa cartella: le note di memoria della vecchia sessione locale e il suo transcript.
    Sono appunti privati e il repository è pubblico: **non vanno nel repository**.
- **Niente segreti nel repository**: né password, chiavi o token, né le cartelle `_SEGRETI` dei siti. Deploy, release e modifiche
  agli altri repository solo se Simone lo dice, un passo per volta; mai `git push --force`.
- **Gli altri repository sono di Simone** e si toccano solo su sua richiesta: `Pitz72/FAVELLA1` (il motore e il sito
  favella.eu in `landingpage/`), `Ecosystem-Runtime` (ramo principale `master`), `SimonePizziWebSite`. I caricamenti sui siti
  hanno credenziali che stanno sul suo computer.

## Come si lavora con Simone

Regole venute da ciò che Simone ha chiesto e corretto; la memoria locale che le conteneva era andata persa.

- **Sempre in italiano**, ogni messaggio: anche quelli intermedi di una riga, la `description` dei comandi che lui vede scorrere e
  il riepilogo finale (più a rischio nei turni lunghi). Si scrive «riquadro» e non «box», «interfaccia» e non «UI»; restano in
  inglese solo nomi propri e comandi. È stato corretto più volte, una con rabbia.
- **Le decisioni di progetto si chiedono a questionario** (`AskUserQuestion`, quattro domande per volta, la consigliata per
  prima), non come elenco nel testo. Le sue risposte libere («Other») sono ordini da integrare.
- **Dopo un via libera si procede**: niente riconferme e niente materiale già approvato rimandato. Una richiesta che arriva a metà
  lavoro si tratta subito.
- **Niente scelte arbitrarie.** Le scelte fuori piano si dichiarano a fine fase; quelle di gusto si chiedono prima. Prima di
  cambiare un testo si dice se è **detto** (storia nei `prototipo/*.fav`, battute, risposte di dialogo, trailer: toccarlo vuol dire
  rifare il doppiaggio) o d'interfaccia; i testi della storia non si toccano senza il suo via. Dopo ogni fase `collaudo/doppiaggio.py`
  tra i collaudi, e lo si cita.
- **Giocare davvero le partite**, oltre ai collaudi: dopo un'evoluzione della storia, almeno una partita intera per profilo
  (attento, violento, distratto) col banco `strumenti/gioca.py` (istruzioni in `strumenti/LEGGIMI.md`), leggendo le risposte come un
  giocatore; poi si fissa ciò che si è scoperto in `collaudo/giocate.py`.
- **Per fargli ascoltare o giudicare** audio e grafica: gli si avvia il gioco desktop vero (`node prepara.mjs`, poi
  `npm run avvia`, in `desktop/`), non il riquadro del browser; il browser integrato non ha il ponte desktop.

## Su questo computer (sessione locale)

- Servono Node 22, Python 3.10 o più (qui `python`, 3.12; il comando `py` non c'è), `lark==1.3.1`, e ffmpeg (solo per doppiaggio e
  colonna sonora). Dopo un clone: `pip install lark==1.3.1`, `npm ci --prefix app`, `npm ci --prefix desktop`.
- I collaudi in locale sono i passi del job «collaudo» di `.github/workflows/ci.yml`; l'esploratore completo
  (`python esploratore.py`, in `collaudo/`) dura circa cinque minuti.
- **La porta 5200 può essere già occupata** da un `vite` di un'altra sessione: `npm run dev` allora sale su un'altra porta, e
  guardare la 5200 vuol dire guardare un altro checkout. Si guarda la porta che `vite` stampa, dopo aver controllato chi ascolta.
- `npm ci --ignore-scripts` in `desktop/` cancella `node_modules/electron/dist`: lo rimette `node node_modules/electron/install.js`.
  `npm audit fix` può spostare electron-builder: meglio `npm update <pacchetto>`.
- `python -I` non vede Pillow: gli strumenti che lo usano (`strumenti/immagini.py`, `grafica/componi-ico.py`) si lanciano senza `-I`.
- Se un `git push` con molto audio scade (HTTP 408 su una linea lenta): un commit per volta, in ordine,
  `git -c http.version=HTTP/1.1 -c http.postBuffer=524288000 push origin <sha>:refs/heads/main`.

## Su una sessione cloud

- Il clone è **parziale** (50 commit): per la storia intera, `git fetch --unshallow`.
- Mancano `lark` e `node_modules`: i collaudi che li chiedono (`pip install lark==1.3.1`, `npm ci --prefix app`) non girano
  finché non si installano; la CI su GitHub li esegue comunque tutti.
- Il disco di Simone (compreso `F:\Backup`) e i siti favella.eu e simonepizzi.runtimeradio.it non sono raggiungibili da qui.
