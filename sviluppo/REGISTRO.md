# Registro dei materiali e dei movimenti

> **Dove sta ogni cosa**, che copie e backup ha, che cosa è stato spostato, copiato, rinominato, cancellato, ritrovato o perso.
> È una **regola assoluta** di Simone (31 ottobre 2026, vedi [`CLAUDE.md`](../CLAUDE.md)): si aggiorna **nella stessa sessione in
> cui qualcosa cambia, prima di chiuderla**. Il diario ([`DIARIO.md`](DIARIO.md)) dice *che cosa* si è fatto e *perché*;
> [`PROSSIMI-PASSI.md`](PROSSIMI-PASSI.md) dice che cosa resta da fare; questo registro dice *dove*.
>
> Il repository è pubblico: **niente segreti**, e per le credenziali dei siti nessun percorso.

## Come si tiene

- Ogni materiale ha un **ID** (`M01`, `M02`…) che non cambia mai e non si riusa; se un materiale sparisce, la sua riga resta con
  lo stato «perso». Un materiale nuovo prende il numero successivo.
- Lo **stato** è uno di: *nel repository*, *fuori da git*, *solo backup*, *perso*.
- Ogni volta che un file o una cartella del progetto viene **creato, copiato, spostato, rinominato, cancellato, ritrovato o perso**,
  o che un **backup** viene fatto, rifatto o scade: una riga nel «Registro dei movimenti» (dal più recente) e, se cambia dove sta
  una cosa o quante copie ha, la riga del materiale. Si scrive **come si è verificato** (SHA-256, conteggio, a occhio) e la voce di
  diario che racconta il resto.
- Ciò che qui non è scritto, per la prossima sessione non c'è.
- **La CI controlla che il file sia in ordine** (`node strumenti/diario.mjs registro`): ID dei materiali unici e senza buchi, stati
  fra quelli ammessi, date vere e dal più recente (quando il giorno non si sa: `AAAA-MM-GG → AAAA-MM-GG`), ID citati che
  esistono, link che portano a un file, niente segreti. Non controlla che il contenuto sia vero: quello resta a chi lo scrive.

## Dove sta cosa

| ID | Cosa | Dove sta | Copie e backup | Stato | Ultima verifica |
|---|---|---|---|---|---|
| M01 | Il repository: codice, storia (`prototipo/`), motore, app, desktop, la voce del doppiaggio (`app/public/voce/`), le musiche, le immagini, i documenti | `C:\Users\Utente\Documents\GitHub\IlViaggiatore` (clone di lavoro) e GitHub `Pitz72/il-viaggiatore-favella`, ramo `main` | GitHub è la copia fuori dal computer; il gioco si ricostruisce interamente da lì | nel repository | 2026-10-31: clone uguale a `origin/main`; collaudi e autoverifica del desktop verdi |
| M02 | Master del doppiaggio, `doppiaggio/master/` (1.351 file, 480 MB, comprese le voci ElevenLabs a licenza ristretta) | nel clone, `doppiaggio/master/` (ignorato da git) | `F:\Backup\Il Viaggiatore - 2026-10-22\doppiaggio\master\` (altro disco, **stesso computer**) | fuori da git | 2026-10-31: SHA-256 uguale alla copia, 1.351 su 1.351 |
| M03 | Video del trailer, `video/*.mp4` e `video/*.wav` (25 file, 379 MB); si rifanno con `strumenti/esporta-trailer.cjs` | nel clone, `video/` (ignorato da git) | `F:\Backup\Il Viaggiatore - 2026-10-22\video\` (stesso computer) | fuori da git | 2026-10-31: SHA-256 uguale, 25 su 25 |
| M04 | `video/ecosystem-schermate-1.23.0.jpg`: schermata del sito Ecosystem, **non del gioco** | solo `F:\Backup\Il Viaggiatore - 2026-10-22\video\` | nessuna | solo backup | 2026-10-31: non copiata nel clone di proposito (non è ignorata da git e lo sporcherebbe) |
| M05 | Appunti di passaggio del 20 ottobre (`RIPRENDI-QUI-chiusura.md`, `PROMPT-chiusura-e-doppiaggio.md`) e `.claude/launch.json` (avvio del server di sviluppo) | nel clone, radice e `.claude/` (ignorati da git) | `F:\Backup\Il Viaggiatore - 2026-10-22\` | fuori da git | 2026-10-31: SHA-256 uguale, 3 su 3; gli appunti sono vecchi (20/10) |
| M06 | Originali di Google Flow (Nano Banana Pro 2.1): 16 ritratti e 8 oggetti, rinominati `ritratto-<nome>.jpg` e `oggetto-<nome>.jpg` per `strumenti/immagini.py` | `C:\Users\Utente\Documents\SVILUPPO\VIDEOGIOCHI\IlViaggiatore-originali\flow-ritratti\` e `flow-oggetti\` | I file coi nomi grezzi di Flow stanno ancora in `C:\Users\Utente\Downloads\IMMAGINI\` e in `Downloads\` (stesso disco `C:`). Corrispondenza nome ↔ originale: `CORRISPONDENZA.txt` nella cartella | fuori da git | 2026-10-31: SHA-256 24 su 24. **Non rigenerare `app/public/immagini/` da questi originali** (risultato quasi uguale, non identico); valgono i WebP del repository |
| M07 | Originali di Lyria 3.5 (The Runtimers): 8 MP3 (7 brani delle zone e la canzone dei titoli di coda) | `…\IlViaggiatore-originali\lyria\` | `C:\Users\Utente\Downloads\*.mp3` (stesso disco). L'audio è già in `app/public/colonna-sonora/` (M01), identico agli originali | fuori da git | 2026-10-31: SHA-256 8 su 8; MD5 del flusso audio uguale a quello nel repository, 8 su 8 |
| M08 | Memoria della vecchia sessione locale: 27 note (`MEMORY.md` più 26) e il suo transcript, fino al 21 ottobre. **Appunti privati: mai nel repository** | `…\IlViaggiatore-originali\memoria-claude-2026-10-23\` | L'originale sta in `C:\Users\Utente\.claude\projects\C--Users-Utente-Documents-SVILUPPO-VIDEOGIOCHI-Il-Viaggiatore\` (stesso disco) | fuori da git | 2026-10-31: 28 file, 22,2 MB copiati |
| M09 | Il gioco installato (1.38.0) e il suo installatore: solo riferimento, non sono sorgenti | `C:\Users\Utente\AppData\Local\Programs\Il Viaggiatore\` e `C:\Users\Utente\AppData\Local\il-viaggiatore-updater\pending\` | nessuna | fuori da git | 2026-10-31: visti, non toccati |
| M10 | Credenziali di deploy dei siti | fuori dal repository, sul computer di Simone | non descritte qui (repository pubblico) | fuori da git | — |
| M11 | La cartella locale di sviluppo di prima (in origine `Documents\SVILUPPO\VIDEOGIOCHI\Il-Viaggiatore`) | cancellata in modo definitivo, non nel Cestino; ciò che conteneva è nelle righe M01–M08 | — | perso | 2026-10-31: Cestino controllato (54 voci, nessuna del progetto) |
| M12 | **Mai ritrovati**: `grafica/anteprima.png` (nessun file del repository lo usa), `_backup/`, `_pubblicazione/` (lo zip web e l'anteprima social del repository, che Simone aveva già caricato su GitHub), `RIPRENDI-QUI*.md` e `PROMPT-*.md` successivi al 20 ottobre, i transcript dopo il 21 ottobre, `doppiaggio/DA-FARE/`, la memoria locale del 24–31 ottobre (fatta in cloud: sta nel diario, nel CHANGELOG e in `CLAUDE.md`) | — | — | perso | 2026-10-31: cercati in `F:`, `G:`, `H:`, `J:`, `C:\Users\Utente`, Cestino, OneDrive e Proton Drive |

**Oggi hanno una sola copia, o due sullo stesso computer:** M02 e M03 (`F:` è un altro disco ma nello stesso PC), M06, M07 e M08
(entrambe le copie sul disco `C:`). Nessuna ha una copia fuori dal computer. Una routine di backup è proposta, non attuata
(`PROSSIMI-PASSI.md`).

## Registro dei movimenti (dal più recente)

| Data | ID | Che cosa è successo | Da → a | Verifica | Diario |
|---|---|---|---|---|---|
| 2026-10-31 | M01 | Pubblicati su `main` i commit `d053516` (le 52 correzioni) e `2794bb4` (rapporto, diario, regola sul titolo) | clone → GitHub | fast-forward da `e43a671`, senza forzare; `main` locale = `origin/main` | [La verifica dell'inglese](diario/2026-10-31-la-verifica-dell-inglese-calchi-dall-italiano-e-schemi-da-ll.md) |
| 2026-10-31 | M01 | **Modificati** i nove cataloghi `app/src/lingue/en/*.json` (storia, sistemi, z1–z7): 52 voci, solo il campo `en`; aggiornati anche `CLAUDE.md` e `app/src/lingue/en/LEGGIMI.md` (regola: il titolo non si traduce), `CHANGELOG.md`, `sviluppo/PROSSIMI-PASSI.md` e `sviluppo/verifica-inglese.md` | — | prima di scrivere, lo script ha controllato che ogni stringa vecchia comparisse una volta sola nella sua voce e che la riscrittura dei cataloghi fosse identica all'originale; `traduzione.py controlla` 0 errori; `collaudo/traduzione.py` e `collaudo/doppiaggio.py` verdi | [La verifica dell'inglese](diario/2026-10-31-la-verifica-dell-inglese-calchi-dall-italiano-e-schemi-da-ll.md) |
| 2026-10-31 | — | **Creata** la nota di memoria automatica «il titolo non si traduce» (fuori dal repository; la stessa regola sta in `CLAUDE.md`) | — | — | [La verifica dell'inglese](diario/2026-10-31-la-verifica-dell-inglese-calchi-dall-italiano-e-schemi-da-ll.md) |
| 2026-10-31 | — | **Creato** `sviluppo/verifica-inglese.md`, il rapporto sulla traduzione inglese (nessun catalogo toccato); creata la voce di diario che lo racconta | — → `sviluppo/verifica-inglese.md` | letti 494 testi su 494; scansione meccanica di trattini, parole, contrasti, americanismi e caratteri Unicode | [La verifica dell'inglese](diario/2026-10-31-la-verifica-dell-inglese-calchi-dall-italiano-e-schemi-da-ll.md) |
| 2026-10-31 | M01 | Pubblicati su `main` i commit del ripristino e di questo registro | clone → GitHub | fast-forward; `main` locale = `origin/main` | [Il ripristino in locale](diario/2026-10-31-il-ripristino-in-locale.md) |
| 2026-10-31 | — | Aggiunto il controllo del registro alla CI: `node strumenti/diario.mjs registro` (richiesta di Simone) | — | provato su un registro giusto e su dodici sbagliati (ID doppi o con buchi, stato, data, ordine, ID inesistente, link rotto, colonne, intervallo, cella vuota, segreto, file mancante) | [Il ripristino in locale](diario/2026-10-31-il-ripristino-in-locale.md) |
| 2026-10-31 | — | Creato questo registro e la regola assoluta in `CLAUDE.md` (richiesta di Simone) | — | — | [Il ripristino in locale](diario/2026-10-31-il-ripristino-in-locale.md) |
| 2026-10-31 | M08 | **Copiati** (non spostati) i 27 file di memoria e il transcript | `~\.claude\projects\…SVILUPPO-VIDEOGIOCHI-Il-Viaggiatore\` → `…\IlViaggiatore-originali\memoria-claude-2026-10-23\` | 28 file, 22,2 MB | [Il ripristino in locale](diario/2026-10-31-il-ripristino-in-locale.md) |
| 2026-10-31 | M06, M07 | **Copiati** (non spostati) gli originali di Flow, **rinominati** per `immagini.py`, e quelli di Lyria | `C:\Users\Utente\Downloads\` → `…\IlViaggiatore-originali\` | SHA-256 32 su 32; `immagini.py` rifà i 24 WebP (1 identico byte per byte, gli altri quasi uguali) | [Il ripristino in locale](diario/2026-10-31-il-ripristino-in-locale.md) |
| 2026-10-31 | M02–M05 | **Copiati** dal backup nel clone `doppiaggio/master/`, `video/` (senza M04), i due appunti e `.claude/launch.json`; robocopy senza sovrascrivere né spostare | `F:\Backup\Il Viaggiatore - 2026-10-22\` → clone | SHA-256 1.379 su 1.379; `git status` pulito | [Il ripristino in locale](diario/2026-10-31-il-ripristino-in-locale.md) |
| 2026-10-31 | M01 | **Clonato** il repository nella cartella locale, che era vuota | GitHub → `C:\Users\Utente\Documents\GitHub\IlViaggiatore` | `main` a `c77e55a`, tag `v1.40.0`, 259 commit, albero pulito | [Il ripristino in locale](diario/2026-10-31-il-ripristino-in-locale.md) |
| 2026-10-31 | M11, M12 | **Cercati** i materiali persi (nomi su tutti i dischi, `~\.claude`, Cestino, cloud sincronizzati): trovati M02–M08, non trovato M12; la cartella originale non è nel Cestino | — | indici dei nomi di `F:`, `G:`, `H:`, `J:` e `C:\Users\Utente`; Cestino letto voce per voce | [Il ripristino in locale](diario/2026-10-31-il-ripristino-in-locale.md) |
| 2026-10-30 | M06 | **Scaricati** da Flow gli originali dei ritratti e degli oggetti | Flow → `Downloads\IMMAGINI\` e `Downloads\` | date dei file (07:54–08:58) | [I volti e le tavole](diario/2026-10-30-i-volti-e-le-tavole-i-personaggi-e-gli-oggetti-della-memoria.md) |
| 2026-10-23 → 2026-10-31 | M11 | **Cancellata** la cartella locale di sviluppo, dopo che tutto era su GitHub; il lavoro è proseguito in sessioni cloud (data esatta non nota) | — | riferito da Simone; non era nel Cestino | [La memoria del progetto sta nel repository](diario/2026-10-31-la-memoria-del-progetto-sta-nel-repository.md) |
| 2026-10-22 | M02–M05 | **Spostati** fuori dalla cartella locale i materiali non pubblicabili o pesanti: copia con SHA-256, poi cancellati dalla cartella locale (fonte: le note di memoria vecchie, M08) | cartella locale → `F:\Backup\Il Viaggiatore - 2026-10-22\` | 1.380 file; esistenti tutti, controllato il 2026-10-31 | — |
| 2026-10-21 | M07 | **Scaricati** da Lyria gli 8 MP3 (08:30–14:41) | Lyria → `Downloads\` | date dei file | [La colonna sonora](diario/2026-10-21-la-colonna-sonora-la-musica-delle-zone-e-il-menu-extra.md), [La canzone dei titoli di coda](diario/2026-10-21-la-canzone-dei-titoli-di-coda.md) |
