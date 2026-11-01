# Il Viaggiatore — la memoria del progetto

Questo file è l'ingresso per Claude e per chiunque riprenda il lavoro. **La memoria del progetto sta nel repository, e
solo qui.** Ciò che vive soltanto sul disco di una sessione o di un computer (cartelle locali, `.claude/`,
`RIPRENDI-QUI*.md`, `PROMPT-*.md`, `_backup/`: tutti in `.gitignore`) si perde quando la sessione o la cartella finiscono.
Se non è nel repository, per la prossima sessione non c'è.

## «Carica memoria» vuol dire

Leggere, in quest'ordine, e poi dare a Simone lo stato del progetto:

1. [`sviluppo/PROSSIMI-PASSI.md`](sviluppo/PROSSIMI-PASSI.md) — **lo stato vivo**: che cosa è aperto, che cosa è chiuso, che cosa di proposito non si fa.
2. [`sviluppo/DIARIO.md`](sviluppo/DIARIO.md) — l'indice del diario; la voce in cima dice come è finita l'ultima sessione.
3. [`sviluppo/REGISTRO.md`](sviluppo/REGISTRO.md) — **dove sta ogni cosa**: materiali, copie e backup, che cosa è stato spostato o perso.
4. [`CHANGELOG.md`](CHANGELOG.md) (la testa) e `versione.json` — a che versione siamo.
5. [`README.md`](README.md) — com'è fatto il gioco e il repository.
6. Solo se serve: [`sviluppo/VERSIONI.md`](sviluppo/VERSIONI.md) (le regole dei numeri), [`collaudo/LEGGIMI.md`](collaudo/LEGGIMI.md)
   (i collaudi), `pre-produzione/` (il perché di storia, sistemi, interfaccia, doppiaggio, musiche), `motore/LEGGIMI.md`,
   `app/src/lingue/en/LEGGIMI.md` (la traduzione inglese).

Poi si controlla che il repository dica lo stesso: `git status`, `git log`, la CI su `main`, le release.

## Che cos'è

*Il Viaggiatore*: avventura testuale di sopravvivenza e cammino scritta in FAVELLA 1 (motore Python in `motore/`, storia in
`prototipo/`), con l'app React in `app/` e il guscio Electron in `desktop/`. In italiano e, dalla 1.40.0, in inglese.
7 zone, 39 luoghi, 14 personaggi, 6 finali. La storia è definitiva dalla 1.12.0; il progetto è dichiarato concluso e il
lavoro riprende solo su richiesta di Simone.

## Regole che valgono sempre

- **REGOLA ASSOLUTA: niente si fa senza lasciarne traccia** (Simone, 31 ottobre 2026). Tre cose si tengono sempre aggiornate,
  **nella stessa sessione in cui il lavoro si fa e prima di chiuderla**: (1) la memoria: questo file, `sviluppo/PROSSIMI-PASSI.md`
  e la memoria automatica di Claude, quando c'è; (2) il **diario** indicizzato, `sviluppo/DIARIO.md` con le voci in
  `sviluppo/diario/`: che cosa si è fatto e perché; (3) il **registro**, `sviluppo/REGISTRO.md`: dove sta ogni cosa e dove si
  trova, se è stata spostata, copiata, rinominata, cancellata o ritrovata, che backup ne esistono, dove stanno e quando si sono
  verificati. Ogni file o cartella creato, copiato, spostato, rinominato, cancellato o perso, e ogni backup fatto o scaduto,
  vuol dire **una riga nel registro**. Se non è scritto lì, per la prossima sessione non c'è. Nel registro niente segreti e
  nessun percorso di credenziali: il repository è pubblico. La CI controlla che il registro sia in ordine
  (`node strumenti/diario.mjs registro`); prima del commit lo si lancia anche a mano.
- **`main` è sempre l'ultimissimo stato di lavoro** (decisione di Simone, 31 ottobre 2026). A fine sessione ciò che è fatto e
  verificato si porta su `main` (fast-forward, mai forzando), con la memoria aggiornata; un clone fresco di `main` deve bastare
  a riprendere. Il rilascio resta sempre manuale: Actions → Rilascio → Run workflow.
- **Dove si sviluppa.** Dal 31 ottobre 2026 lo sviluppo torna **in locale**, in `C:\Users\Utente\Documents\GitHub\IlViaggiatore`:
  le sessioni cloud non vedono i materiali fuori da git né le credenziali dei siti, e continuare lì è stato un errore (la
  memoria locale è andata persa). GitHub è il backup: si spinge spesso.
- **Chiudere una sessione** vuol dire: una voce di diario (`node strumenti/diario.mjs nuovo "Titolo" --tipo sessione`),
  `sviluppo/REGISTRO.md` aggiornato (ogni materiale e ogni movimento della sessione), `sviluppo/PROSSIMI-PASSI.md` aggiornato se
  qualcosa si è aperto o chiuso, `CHANGELOG.md` se il gioco è cambiato, commit e push.
- **Un solo stato vivo.** Le cose da fare e quelle chiuse stanno in `PROSSIMI-PASSI.md`; qui non si ricopiano, perché due
  elenchi si disallineano.
- **Il motore non si tocca qui.** `motore/` è FAVELLA 1.5.0: se serve cambiarlo, si cambia nel repository di FAVELLA 1
  (`Pitz72/FAVELLA1`, con i suoi test) e si ricopia.
- **Ogni modifica ai `.fav` cambia l'impronta dei salvataggi**: versione minor, major se si ristruttura una zona. I collaudi
  (`collaudo/`, tutti nella CI) devono restare verdi.
- **Il testo italiano ha la sua traduzione.** Motore e `.fav` restano in italiano; l'inglese sta nei cataloghi
  `app/src/lingue/en/`. Se un testo italiano cambia: `python strumenti/traduzione.py`, tradurre ciò che manca,
  `python strumenti/traduzione.py controlla`; il collaudo `collaudo/traduzione.py` lo pretende.
- **Il titolo non si traduce** (Simone, 30–31 ottobre 2026): il gioco si chiama «Il Viaggiatore» in italiano e in inglese, come
  titolo e come marchio, senza sottotitoli (`TITOLO` in `app/src/lib/lingua.ts`). Una cosa è il titolo, un'altra la parola
  comune: nel racconto «viandante» si traduce *traveller*. Quando si rivede l'inglese, non lo si «corregge» in *The Traveller*.
- **Italiano per documenti, diario e commit** (`tipo(ambito): frase`, come nella storia di git).
- **Fuori da git per scelta**, perché pesanti o non rigenerabili: i master del doppiaggio (`doppiaggio/master/`), gli originali
  di immagini (Google Flow) e brani (Lyria), i video. Stanno sul computer di Simone; una sessione cloud non li vede e non li salva.
  **Dove stanno, che copie e backup hanno: [`sviluppo/REGISTRO.md`](sviluppo/REGISTRO.md)** (M02–M08; ripristino del 31 ottobre
  2026). Due avvertimenti che non vanno perduti:
  - **Non rigenerare `app/public/immagini/` dagli originali di Flow ritrovati**: i WebP rifatti sono quasi uguali ma non
    identici (quei file non sono bit per bit quelli lavorati il 30 ottobre 2026). Valgono i WebP del repository.
  - Le note di memoria della vecchia sessione locale sono appunti privati e il repository è pubblico: **non vanno nel
    repository**.
- **Niente segreti nel repository**: né password, chiavi o token, né le cartelle `_SEGRETI` dei siti. Deploy, release e modifiche
  agli altri repository solo se Simone lo dice, un passo per volta; mai `git push --force`.
- **Gli altri repository sono di Simone** e si toccano solo su sua richiesta: `Pitz72/FAVELLA1` (il motore e il sito
  favella.eu in `landingpage/`), `Ecosystem-Runtime` (ramo principale `master`), `SimonePizziWebSite`. **I caricamenti sui siti
  non sono più da fare** (Simone, 31 ottobre 2026): favella.eu ed Ecosystem sono già aggiornati; l'articolo su
  simonepizzi.runtimeradio.it lo cura lui. Le credenziali dei siti stanno comunque sul suo computer.

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
- I collaudi in locale sono i passi di `.github/workflows/collaudo.yml` (lo richiamano la CI e il rilascio; dentro c'è anche
  `npm run controlla`, ESLint, in `app/`); l'esploratore completo
  (`python esploratore.py`, in `collaudo/`) dura circa cinque minuti.
- **I server di sviluppo si chiudono quando non servono** e si riaprono al bisogno (Simone, 1° novembre 2026, che ha autorizzato a
  chiuderli tutti, anche quelli di altre sessioni): a fine lavoro non ne resta nessuno acceso (`vite`, anteprima del browser).
- **La porta 5200 può essere già occupata** da un `vite` di un'altra sessione: `npm run dev` allora sale su un'altra porta, e
  guardare la 5200 vuol dire guardare un altro checkout. Si guarda la porta che `vite` stampa, dopo aver controllato chi ascolta.
- `npm ci --ignore-scripts` in `desktop/` cancella `node_modules/electron/dist`: lo rimette `node node_modules/electron/install.js`.
  `npm audit fix` può spostare electron-builder: meglio `npm update <pacchetto>`.
- `python -I` non vede Pillow: gli strumenti che lo usano (`strumenti/immagini.py`, `grafica/componi-ico.py`) si lanciano senza `-I`.
- Riscrivendo un file del repository da Python, `Path.write_text` mette i fine riga CRLF: si usa `write_bytes` (o `newline="\n"`).
  Git li riporterebbe a LF (`.gitattributes`), ma la copia di lavoro resta sporca e i diff lo segnalano.
- Gli script di prova scrivono i loro registri nella cartella temporanea della sessione, con percorsi assoluti: il 1° novembre
  2026 26 registri con percorsi relativi sono finiti nel clone (spostati prima del commit).
- Se un `git push` con molto audio scade (HTTP 408 su una linea lenta): un commit per volta, in ordine,
  `git -c http.version=HTTP/1.1 -c http.postBuffer=524288000 push origin <sha>:refs/heads/main`.

## Su una sessione cloud

- Il clone è **parziale** (50 commit): per la storia intera, `git fetch --unshallow`.
- Mancano `lark` e `node_modules`: i collaudi che li chiedono (`pip install lark==1.3.1`, `npm ci --prefix app`) non girano
  finché non si installano; la CI su GitHub li esegue comunque tutti.
- Il disco di Simone (compreso `F:\Backup`) e i siti favella.eu e simonepizzi.runtimeradio.it non sono raggiungibili da qui.
