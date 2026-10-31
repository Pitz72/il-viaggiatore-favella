---
data: 2026-10-31
ora: "14:48"
titolo: "La memoria del progetto sta nel repository"
tipo: decisione
versione: 1.40.0
---

# La memoria del progetto sta nel repository

## In breve
La memoria di lavoro di prima (appunti di sessione, `.claude/`, `RIPRENDI-QUI*.md`, `PROMPT-*.md`) stava in cartelle che
`.gitignore` esclude, e non è mai passata da git: è sparita con la cartella locale, cancellata dopo il passaggio del progetto su
GitHub. Da oggi la memoria sta nel repository: `CLAUDE.md` all'ingresso, `sviluppo/PROSSIMI-PASSI.md` come stato vivo, il
diario per ogni sessione.

## Contesto
Nella sessione in cui tutto è andato su GitHub, Simone aveva avvertito che la cartella locale sarebbe stata cancellata. In una
sessione nuova, «carica memoria e dammi lo stato» non ha trovato né un `CLAUDE.md` né una cartella di memoria: lo stato si è
ricostruito da README, CHANGELOG, diario e `PROSSIMI-PASSI.md`, che era fermo alla 1.18.2. Simone ha chiesto tre cose: se la
traduzione inglese c'è, se documenti e README sono allineati, se le memorie stanno in `F:\Backup`.

## Lavoro fatto
- **La traduzione inglese c'è e è completa.** `app/src/lingue/en/`: 494 testi dei `.fav` (storia 8, sistemi 31, z1 34, z2 38,
  z3 65, z4 84, z5 107, z6 56, z7 71), tutti tradotti, più 85 nomi di luoghi, cose e persone. Le sole voci uguali all'italiano
  sono i puntini di sospensione. La logica che la applica è `app/src/gioco/traduci.ts`.
- **La causa della perdita**: `.gitignore` esclude `.claude/`, `RIPRENDI-QUI*.md`, `PROMPT-*.md`, `_backup/`, `_pubblicazione/`.
  Nei 50 commit del clone (dal 21 ottobre) nessun file di memoria è mai passato da git.
- **`CLAUDE.md`** nuovo, tracciato: che cosa vuol dire «carica memoria» (cosa leggere e in che ordine), le regole che valgono
  sempre, i limiti di una sessione cloud.
- **`sviluppo/PROSSIMI-PASSI.md` riscritto sullo stato vero.** Era fermo alla 1.18.2: dava il doppiaggio per «pianificato» (è
  fatto dalla 1.23.0) e non conosceva niente dalla 1.24.0 alla 1.40.0. Ora ha una sezione «Aperto» e il «Chiuso» fino all'inglese.
- **Documenti allineati**: il README e `collaudo/LEGGIMI.md` dicevano «quattordici collaudi», sono sedici (mancavano `mappa.py` e
  `traduzione.py`); la tabella delle cartelle dava a `pre-produzione/` sei documenti su undici; la descrizione di `pulsanti.py`
  era quella della 1.36; il paragrafo «è concluso» si fermava alla 1.23.0; `strumenti/LEGGIMI.md` non elencava `traduzione.py`,
  `data-locale.mjs`, `prova-data.mjs`.

## Decisioni
- **La memoria è un file del repository, non un'abitudine né una cartella locale** — perché: ciò che sta solo su disco si perde
  con la sessione o con la cartella, e il repository è l'unica cosa che resta.
- **Un solo stato vivo, `PROSSIMI-PASSI.md`; `CLAUDE.md` tiene le regole e l'ordine di lettura, non l'elenco delle cose** —
  perché: due elenchi si disallineano, ed è già successo.
- **`main` è sempre l'ultimissimo stato di lavoro, e lo sviluppo torna in locale** — perché: Simone, a fine sessione: la
  repository deve essere «all'ultimissimo stato di lavoro», e continuare lo sviluppo su cloud è stato un errore (la memoria
  locale è andata persa, e i materiali fuori da git e le credenziali dei siti stanno sul suo computer). `main` è stato portato
  avanti a questa sessione (fast-forward, senza forzare); il prompt per ripristinare il progetto in locale è stato scritto a parte.
- **`.gitignore` non toccato** — perché: escludere gli appunti locali era una scelta di Simone. Quello che serve alla prossima
  sessione va in `PROSSIMI-PASSI.md` o nel diario, che sono tracciati.

## Verifiche
- `python strumenti/traduzione.py controlla`: 0 errori, 0 avvisi. `stato`: tutte le zone tradotte per intero.
- `collaudo/traduzione.py` non si è rilanciato in questa sessione (serve `lark` e `npm ci --prefix app`); lo esegue la CI, ed è
  verde sull'ultimo commit di `main` (`557f903`, run 116).
- `node strumenti/diario.mjs verifica`: 77 voci, in regola. `node strumenti/versione.mjs verifica`: gioco 1.40.0, motore 1.5.0,
  formato salvataggi 1, coerenti. Sono i due controlli di documentazione della CI.

## Questioni aperte
- **`F:\Backup` non è stato letto**: una sessione cloud non vede il disco di Simone (il suo computer «PC» è Windows e non offre
  cartelle alle sessioni cloud). Se lì stanno gli appunti perduti, Simone ne porta il contenuto in un file tracciato e lo si
  riassume qui.
- **La frase del README su favella.eu** («dalla 1.40.0 non c'è più nemmeno su favella.eu») è vera nel repository del sito, non
  ancora in linea finché Simone non carica il sito (`PROSSIMI-PASSI.md`, «Aperto»). Da qui il sito non si raggiunge.
- **Il clone di una sessione cloud è parziale** (50 commit): la storia più vecchia si ha con `git fetch --unshallow`.
