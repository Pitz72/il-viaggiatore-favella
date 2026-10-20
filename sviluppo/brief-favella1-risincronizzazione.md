# Brief per la sessione su FAVELLA1: risincronizzare il sito con Il Viaggiatore VERSIONE_RILASCIATA

> Da avviare in una sessione **separata**, con il preset «FAVELLA1» (repository
> `C:\Users\Utente\Documents\GitHub\FAVELLA1`), **solo dopo** che la release VERSIONE_RILASCIATA del Viaggiatore è
> pubblica (il sito rimanda a `releases/latest`) e **solo se Simone lo dice**. Scritto il 20/10/2026 dalla verifica
> in sola lettura della sessione di chiusura (diario `2026-10-20-favella-1-il-motore-non-cambia-il-sito-va-risincronizzato.md`).

## Punto di partenza (verificato)

- Il **motore non cambia**: `motore/` del Viaggiatore è identico, byte per byte, a FAVELLA1 al tag `v1.5.0`; la
  storia di oggi compila e supera i dieci collaudi con il motore di FAVELLA1 (nessuna modifica al motore, nessuna
  1.5.x necessaria).
- Il **sito** (`landingpage/`, commit `5c0eca4`, sito 2.9.3) è fermo al Viaggiatore **1.14.0**: `galleria/il-viaggiatore/*.fav`
  = la storia di 1.14.0; `esperimento/src` = `app/src` di 1.14.0 con tre adattamenti.
- Pyodide: il sito carica `v0.27.2` dalla CDN, il Viaggiatore usa 0.27.8; **stesso Python 3.12.7, stesse impronte**
  (12 percorsi completi uguali). Si può portare il sito a `v0.27.8` (la CDN lo ha) per coerenza con il commento di
  `favellaRuntime.ts` («la stessa del pacchetto npm del gioco»); non è necessario.

## Regole di Simone

- Il Viaggiatore (repository `Pitz72/il-viaggiatore-favella`) **non si tocca** da questa sessione: si legge e si copia.
- Segui `landingpage/public/favella-engine/SYNC.md` (nomi `.fav`, i tre adattamenti di `favellaRuntime.ts`: Pyodide dalla
  CDN, motore in `/favella-engine/`, Lark da PyPI con micropip).
- Versioni SemVer del sito (`SITE_VERSION`, `package.json`), commit in italiano, uno per argomento, in stage solo i file
  propri per nome; non pubblicare niente (deploy) senza che Simone lo dica.

## Da fare

1. **La storia.** Copiare da `prototipo/` del Viaggiatore (release VERSIONE_RILASCIATA) in
   `landingpage/public/favella-engine/galleria/il-viaggiatore/` i file cambiati dalla 1.14.0: `sistemi.fav`,
   `z2-piana.fav`, `z7-guado.fav` (gli altri sei sono uguali; controllare comunque con un confronto di hash, e se la
   release ha toccato altri `.fav`, copiare anche quelli). Serve il motore 1.5.0 (testo con un nome): c'è.
2. **L'app web (`landingpage/esperimento/`).** Ricopiare `app/src` della release, poi rifare i tre adattamenti
   (`src/lib/favellaRuntime.ts`; `index.html` e `vite.config.ts` non cambiano dal 1.14.0 e restano quelli del sito).
   Tutto ciò che è cambiato in `app/src` dalla 1.14.0 vale anche per il web (lo `ricade` dove serve il desktop):
   `App.tsx`, `main.tsx`, `components/{Trailer,ViaggiatorePlayer,ConfineErrori}.tsx`, `gioco/{ComeSiGioca,Panorama,Taccuino}.tsx`,
   `gioco/gioco.css`, `gioco/useDialogo.ts`, `lib/{ponte.py,salvataggi.ts}` e quanto altro la release ha toccato
   (per l'elenco esatto: `git diff 496bb8e..vVERSIONE_RILASCIATA -- app/src` nel Viaggiatore). Aggiornare
   `esperimento/versione.json` (`gioco`: VERSIONE_RILASCIATA) e, se si vuole, `PYODIDE_VERSION` a `v0.27.8`.
   **Non** copiare: `desktop/`, le fuse, l'IPC, gli aggiornamenti, `strumenti/`, `collaudo/`, `.github/`.
3. **Versioni, testi e notizie.** `landingpage/src/constants.tsx`: `SITE_VERSION` 2.9.3 → 2.9.4 (e la riga di storico), il
   commento sulla release («oggi la 1.14.0 … la storia è quella della 1.12.0»), la notizia «Il Viaggiatore 1.14.0…»
   (nuova notizia o aggiornamento: la release porta le correzioni di accessibilità e contrasti, il panorama d'interni,
   i salvataggi validati, la difesa dell'aggiornatore, le fuse, e l'aspetto nuovo del trailer — il testo lo prende dal
   CHANGELOG del Viaggiatore); `src/components/ViaggiatoreBanner.tsx` («concluso (1.14)»); `package.json` del sito;
   `public/favella-engine/SYNC.md` (la riga «STATO AL …»). La data e i testi li decide Simone se in dubbio.
4. **Verifiche.** Il test `test_copie_del_motore_nel_sito_allineate` e `test_elenchi_dei_moduli_del_motore_allineati`
   (la suite di FAVELLA1), `landingpage/scripts/valida_checkpoint.py` (53/53), build del sito e prerender; giocare la
   prova web nel browser (trailer, una partita fino a un finale con la storia nuova, un salvataggio e un
   ricaricamento); controllare in console che non ci siano errori.
5. **Consegna.** Commit per argomento, push; il **deploy** (`scripts/deploy.mjs`) solo dopo l'ok di Simone.

## Non fare

- Nessuna modifica a `compilatore.py`, `gioco.py`, `strutture.py`, `libreria_azioni.py`, `favella_utils.py` né a
  `PyPI`/release del motore: il motore non cambia.
- Nessun intervento sul Viaggiatore. Se qualcosa non torna, riferirlo a Simone: si corregge là.
