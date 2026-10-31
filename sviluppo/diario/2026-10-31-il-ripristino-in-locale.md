---
data: 2026-10-31
ora: "17:09"
titolo: "Il ripristino in locale"
tipo: sessione
versione: 1.40.0
---

# Il ripristino in locale

## In breve
Il progetto è tornato in `C:\Users\Utente\Documents\GitHub\IlViaggiatore`, identico a `main` (`c77e55a`, v1.40.0), con i collaudi
verdi. I materiali fuori da git sono stati ritrovati (backup del 22 ottobre e cartella Download) e rimessi al loro posto; la
memoria della vecchia sessione locale era sopravvissuta in `~\.claude` e ora ne esiste una copia. Non si è perso niente che serva
per costruire e rilasciare il gioco.

## Contesto
La cartella locale era stata cancellata dopo il passaggio su GitHub e lo sviluppo era proseguito in sessioni cloud, che non vedono
il disco di Simone (vedi «La memoria del progetto sta nel repository»). Simone ha deciso che questa sessione **ripristina e
stabilizza**; la chiusura delle cose aperte (`sviluppo/PROSSIMI-PASSI.md`) spetta alle sessioni successive.

## Lavoro fatto
- **Clone e controlli**: `main` a `c77e55a`, tag `v1.40.0`, 259 commit, albero pulito, CI di GitHub verde su quel commit.
- **Dove stava che cosa.** Backup del 22 ottobre in `F:\Backup\Il Viaggiatore - 2026-10-22` (1.382 file, 859 MB: `doppiaggio/master/`,
  `video/`, due `.md` di passaggio del 20 ottobre, `launch.json`). Gli originali di Lyria (8 MP3) e di Flow (16 ritratti, 8
  oggetti) erano in `Downloads` con i nomi grezzi dei generatori. La memoria automatica (27 note) e il transcript fino al 21
  ottobre erano in `~\.claude\projects\…SVILUPPO-VIDEOGIOCHI-Il-Viaggiatore\`. Il Cestino non conteneva nulla del progetto.
- **Ripristino dal backup, per copia (mai spostando)**: `doppiaggio/master/` (1.351 file), `video/` (25 file), `.claude/launch.json`,
  `RIPRENDI-QUI-chiusura.md`, `PROMPT-chiusura-e-doppiaggio.md`. I 1.379 file hanno lo stesso SHA-256 dell'origine e
  `git status` è rimasto pulito (sono tutti ignorati). Lasciata fuori `video/ecosystem-schermate-1.23.0.jpg`: è una schermata del
  sito Ecosystem, non del gioco, e non è ignorata da git.
- **Originali fuori dal repository**, in `C:\Users\Utente\Documents\SVILUPPO\VIDEOGIOCHI\IlViaggiatore-originali\`: `flow-ritratti/`
  e `flow-oggetti/` (rinominati `ritratto-<nome>.jpg` e `oggetto-<nome>.jpg`, come li vuole `strumenti/immagini.py`), `lyria/`
  (coi nomi di Lyria, come li vuole `strumenti/colonna-sonora.py album`), `LEGGIMI.txt` e `CORRISPONDENZA.txt` (etichetta, nome di
  Flow, SHA-256), e `memoria-claude-2026-10-23/` (le note e il transcript della vecchia sessione locale; sono appunti privati e
  il repository è pubblico: non vanno qui). Copie verificate con SHA-256 (32 su 32).
- **L'abbinamento dei 24 originali di Flow** si è fatto ripetendo in memoria le operazioni di `immagini.py` e confrontando i
  ritagli con i WebP già nel repository: ogni nome ha il suo originale (scarti di 1,2–3,9 su 255; i candidati sbagliati stanno fra
  15 e 40).
- **Le regole di lavoro con Simone** che il repository non registrava sono passate in `CLAUDE.md` (lingua, questionario, via
  libera, testi detti e testi d'interfaccia, partite giocate, trappole di Windows) insieme ai percorsi dei materiali fuori da git.
- `sviluppo/PROSSIMI-PASSI.md` allineato a ciò che si è trovato (vedi sotto).
- **Il registro `sviluppo/REGISTRO.md`**, nuovo, su richiesta di Simone: dove sta ogni materiale (con ID `M01`…), che copie e
  backup ha, che cosa è stato spostato, copiato o perso, e il registro dei movimenti. Ci sono già dentro tutti i movimenti di
  questa sessione. In `CLAUDE.md` è diventato **regola assoluta**, insieme a memoria e diario.
- **Il controllo del registro nella CI**, su richiesta di Simone: `node strumenti/diario.mjs registro [file]` (nuovo passo
  «Registro dei materiali in ordine» in `.github/workflows/ci.yml`). Controlla ID unici e senza buchi, stati ammessi, date vere e
  dal più recente, ID citati che esistono, link che portano a un file, niente segreti né percorsi di credenziali. Non può
  controllare che il contenuto sia vero.

## Decisioni
- **I WebP di `app/public/immagini/` non si rigenerano dagli originali ritrovati** — perché: rifatti con `immagini.py` risultano
  quasi uguali (scarto medio 1,5–3,8 su 255; `peppe` è identico byte per byte, e questo prova che strumento, encoder e
  abbinamento sono quelli giusti) ma non identici: i file in `Downloads` non sono bit per bit quelli che la sessione cloud aveva
  lavorato (gli oggetti sono 2048×2048 e non 2000×2000; `giocattolo` è 1024×1024). Valgono i WebP già nel repository.
- **Gli originali di Lyria non servono a ricostruire il gioco** — perché: `colonna-sonora.py` etichetta i brani copiando l'audio
  (`-c copy`), e l'audio degli MP3 in `app/public/colonna-sonora/` è identico a quello degli originali (MD5 del solo flusso audio,
  8 su 8). Si conservano comunque, perché `album` li accetta come sorgente.
- **Le note di memoria vecchie restano fuori dal repository** — perché: contengono appunti privati (per esempio su altri
  repository) e il repository è pubblico. Ciò che serve alla prossima sessione sta in `CLAUDE.md`, in `PROSSIMI-PASSI.md` e nel
  diario.
- **Il diario di sessione e il registro dei materiali sono due file distinti** — perché: il diario racconta *che cosa* si è fatto e
  *perché* (una voce per sessione); il registro dice *dove* sta ogni cosa e se ha copie. Uniti, il diario si riempirebbe di
  tabelle di percorsi e il registro non si leggerebbe più a colpo d'occhio. I percorsi dei materiali stanno nel registro e
  `CLAUDE.md` rimanda lì, perché due elenchi si disallineano.
- **I caricamenti sui siti non sono più da fare** — perché: Simone sapeva già che favella.eu ed Ecosystem erano aggiornati (la
  verifica online, fatta su sua richiesta, lo ha confermato) e l'articolo su simonepizzi.runtimeradio.it lo cura lui. Tolto da
  «Aperto» in `PROSSIMI-PASSI.md`, messo in «Non si fa».
- **Di tutto il resto non si fa niente qui** (il workflow «Pagine», i rami vecchi, la voce inglese) —
  perché: Simone ha limitato la sessione al ripristino; ogni deploy e ogni release resta una sua decisione esplicita.

## Verifiche
- I passi del job «collaudo» di `.github/workflows/ci.yml`, riprodotti in locale su Windows 11 (Node 22.22.3, Python 3.12.10,
  lark 1.3.1): versioni coerenti (gioco 1.40.0, motore 1.5.0, formato salvataggi 1), diario ben formato, `desktop/prove.cjs`
  (18 prove), prova della data, compilazione (39 stanze, 46 oggetti), i sedici collaudi, `strumenti/traduzione.py controlla`
  (0 errori, 0 avvisi), **tutti verdi**. L'esploratore completo: 100 partite, 16.138 comandi, 331 s, 0 anomalie.
- `npm ci` in `app/` e `desktop/`, `node desktop/prepara.mjs` e `npm run autoverifica` in `desktop/`: «AUTOVERIFICA SUPERATA».
  Il gioco parte anche dal server di sviluppo (prima finestra «Lingua · Language»), senza errori in console.
- Backup del 22 ottobre: tutte le 1.380 voci del suo elenco presenti (0 mancanti, 0 file vuoti).
- **I tre siti guardati online** col browser integrato, su richiesta di Simone: favella.eu ed Ecosystem **sono già aggiornati**
  (Galleria e novità alla 1.40; scheda con il capitolo sull'inglese e i download alla v1.40.0; tre file tolti che danno 404). Per
  l'articolo su simonepizzi.runtimeradio.it non si può dire: quelli pubblici non hanno la sezione sull'inglese, ma lo script
  tocca un articolo programmato che da fuori non si vede. `PROSSIMI-PASSI.md` corretto di conseguenza.
- Controllo del registro: sul registro vero passa (12 materiali, 12 movimenti); un banco di prova, fuori dal repository, lo
  lancia su 2 registri giusti e su 12 sbagliati (ID ripetuto, buco negli ID, stato non ammesso, data impossibile, data fuori
  ordine, ID inesistente, link rotto, una colonna in meno, intervallo al contrario, cella vuota, segreto, file mancante): 14
  esiti su 14 come previsto. Al primo lancio ha trovato davvero una riga sbagliata (una data scritta a parole), poi corretta.

## Questioni aperte
- **Che cosa non si è ritrovato**: `grafica/anteprima.png` (nessun file del repository lo usa), `_backup/`, `_pubblicazione/`,
  `RIPRENDI-QUI*.md` e `PROMPT-*.md` successivi al 20 ottobre, i transcript dopo il 21 ottobre, `doppiaggio/DA-FARE/`, la memoria
  locale del 24–31 ottobre (fatta in cloud: sta nel diario, nel CHANGELOG e in `CLAUDE.md`). Per costruire e rilasciare il gioco:
  nessuna conseguenza. Per rifare il doppiaggio servono i master, che ci sono (stato del 22 ottobre).
- **Che cosa oggi ha una sola copia**: i master del doppiaggio e i video (su `F:`, nello stesso computer); gli originali di Flow, la
  memoria vecchia e il suo transcript (sul disco `C:`, in `IlViaggiatore-originali` e, gli originali, anche in `Downloads`).
  Una routine di backup per ciò che sta fuori da git è proposta a Simone, non attuata.
