# Prossimi passi

> **Lo stato vivo del progetto.** *Il Viaggiatore* è concluso come storia (definitiva dalla 1.12.0) e il lavoro riprende solo
> su richiesta di Simone. Ultima versione: **1.40.0**, 31 ottobre 2026. Questo file tiene il conto di che cosa è aperto, di
> che cosa si è chiuso e di che cosa, di proposito, non si fa; **si aggiorna a ogni sessione** (vedi [`CLAUDE.md`](../CLAUDE.md)).
> (Com'era prima, fermo alla 1.7.0: nella storia di git.)

## Aperto

Quasi tutto aspetta Simone, perché le credenziali dei siti stanno sul suo computer e non nel repository.

- **favella.eu**: `npm run deploy` in `landingpage/` del repository FAVELLA1 (sito 2.14.0, commit `6e53f2c`). Finché non è
  caricato, il README (che dice che la versione nel browser non c'è più nemmeno su favella.eu) descrive il sito del repository,
  non quello in linea.
- **Ecosystem**: `python _SEGRETI/deploy.py upload`, poi `audit` e `rm` dei tre file tolti (sito 0.32.0, commit `3d8c034`,
  ramo `master`).
- **L'articolo su simonepizzi.runtimeradio.it**: `esegui.py` con `scripts/server-tools/aggiorna_articolo_viaggiatore_inglese.php`
  (SimonePizziWebSite, commit `65d9260`), prima in anteprima e poi con `--applica`.
- **Ecosystem-Runtime ha un ramo `main` di troppo** (il principale è `master`), allo stesso commit: da cancellare a mano.
- **La voce recitata in inglese** (la prima finestra dice che arriverà) e **la rilettura della traduzione da parte di un
  madrelingua**.
- **La copia su GitHub Pages** è ferma alla 1.23.0, solo in italiano: non si offre più da nessuna parte ma resta in linea per
  non rompere i link. Il workflow «Pagine» (manuale) la rifarebbe: se lanciato oggi pubblicherebbe di nuovo il gioco nel
  browser, contro la scelta della 1.40.0.
- **Ripristinare il progetto in locale** (`C:\Users\Utente\Documents\GitHub\IlViaggiatore`) con un Claude Code locale, e
  cercare nei backup (`F:\Backup` e altrove) la memoria di lavoro di prima del passaggio su GitHub (appunti di sessione,
  `.claude/`, `RIPRENDI-QUI*.md`, `PROMPT-*.md`) e i materiali fuori da git (master del doppiaggio, originali di immagini e
  brani, video). Ciò che serve si porta in file tracciati (una voce di diario basta). Se non si trova, si ricostruisce dal
  repository e si chiude lo sviluppo con quello che c'è.

## Chiuso

- **Il progetto di ramificazione** (`pre-produzione/06-ramificazione.md`, §8): la mappa delle
  ramificazioni, le conseguenze a distanza (da 2 a 13), le varianti di testo per stato, le
  chiusure che raccolgono il viaggio e «chi hai incontrato» (1.12.0).
- **L'interfaccia:** i messaggi del motore e i pulsanti «inventario» e «stato» (1.8.0); «usa X su
  Y» che si compone invece di offrire la coppia giusta (1.9.0).
- **Il motore:** `motore/` è la 1.5.0 di FAVELLA 1 (dalla 1.14.0; prima la 1.4.4): il motore è fermo.
  Se mai servisse cambiarlo, si cambia nel repository di FAVELLA 1 (con i suoi test) e si ricopia.
- **La storia:** Imma sulla discesa (1.7.0); le dichiarazioni doppie di `z2-piana.fav` ridotte a
  una con i sinonimi (1.10.0).
- **I due MP4 in `video/`** (non versionati) rigirati con la grafica nuova, fotogramma per
  fotogramma dal trailer vero (`strumenti/esporta-trailer.cjs`, 7 ottobre 2026).
- **Il tasto «esci»** nella barra di gioco e nella schermata finale, oltre che nel menu (1.13.0).
- **I loghi d'apertura** animati e sonori, di Runtime Multimedia e di FAVELLA 1, e il nome dell'autore
  nel menu d'avvio (1.14.0).
- **Le rifiniture dell'analisi del 20 ottobre 2026** (1.15.0): il diario è una regione viva per i lettori di schermo; Esc chiude «Come si gioca» e i dialoghi
  portano il fuoco dentro e lo restituiscono; un confine d'errore al posto dello schermo nero; contrasto
  e dimensioni del testo piccolo; il caricamento dei salvataggi diffida del diario guasto; il desktop
  controlla l'origine e il percorso nel modo giusto, mette in fila le scritture dei salvataggi e rilegge
  la copia di riserva; nella storia «bere due sorsi» e «mangiare una porzione» (e simili) valgono come
  le forme all'imperativo, e Saverio, a fiducia alta, non chiede più «un motivo per fidarmi».
- **I dodici residui e l'analisi di chiusura del 20 ottobre 2026** (1.16.0 – 1.16.1): il panorama d'interni,
  i contrasti a 4,5:1, il taccuino, i canali IPC, le fuse di Electron, Pyodide 0.27.8, il finale scritto una volta sola.
- **L'estetica della cinematica d'apertura** (piano `pre-produzione/07-intro-estetica-e-dettagli.md`, eseguito
  dalla 1.16.2 alla 1.18.2 e rilasciato come **v1.18.2**, 20 ottobre 2026): le rifiniture, la luce e la pellicola,
  il suono, la materia (sale, crepe, scrittura, biglietto a mano con Covered By Your Grace), la nitidezza a 4K, le
  ultime rifiniture ai tempi e alla schermata d'avvio. Il comportamento non è cambiato (solo Esc).
- **Il doppiaggio totale con sintesi vocale** (piano `pre-produzione/08-doppiaggio-tts.md`, 1.19.0 – 1.23.0): ogni testo del
  gioco, il trailer compreso, ha la sua voce (circa un'ora di parlato), a scelta fra voce recitata e lettore di schermo. Le voci
  di Imma, Rosaria, Tore e Vito (ElevenLabs, piano gratuito) sono escluse dalla licenza libera, per decisione di Simone.
  Rilasciato come v1.23.0.
- **Il gioco confezionato come un prodotto** (piano `pre-produzione/09-opzioni-menu-pausa.md`, 1.24.0 – 1.30.1): opzioni e
  volumi veri, menu d'avvio in colonna e pausa, taccuino dei salvataggi, schermo, finestra e qualità della grafica, alta
  accessibilità, i modi dei comandi, trenta trofei, le verifiche finali.
- **La musica e la chiusura** (1.31.0 – 1.34.0): un brano per zona e l'album da scaricare (menu Extra), la sequenza finale
  coi titoli di coda e la canzone, le immagini promozionali.
- **La plancia e la mappa** (1.35.0 – 1.38.0): la plancia dei pulsanti, i due soli modi dei comandi (pulsanti e avventura
  testuale), la mappa come carta fisica che si riempie camminando.
- **I volti e le tavole** (1.38.0 – 1.39.0): i ritratti dei personaggi, le tavole degli otto oggetti della memoria, il
  viandante accanto alle risposte.
- **L'inglese** (1.40.0): il gioco intero in inglese (494 testi e 85 nomi in `app/src/lingue/en/`, controllati da
  `collaudo/traduzione.py`), la prima finestra della lingua, il trofeo «Parola per parola»; e il gioco solo da scaricare.

## Non si fa

- **Un'eco di Imma alla soglia.** Vive in paese: un'eco ad Acquamorta sarebbe forzata
  (decisione 11 di `06-ramificazione.md`).
- **Il suolo della terra e la mappa a 2× (4K).** Il suolo «cotto» ha una riga di tessera per ogni riga dello schermo
  (a 2× il costo per fotogramma salirebbe proprio dove la scena è già più pesante) e la carta della mappa a 2× sarebbe
  una tela da 66 MB: restano a 1× (diario «Il trailer, fase 5»). La scelta della tela più grande su uno schermo 4K è provata
  solo fuori schermo: non c'è uno schermo 4K vero su questo computer.
- **Il trailer su un computer davvero modesto.** Senza scheda grafica un fotogramma a 2560×1440
  costa 30–115 ms; la risoluzione adattiva lo compensa, ma non è stato provato su una macchina
  lenta. Preparare le tele in un Worker con `OffscreenCanvas` libererebbe il thread principale
  durante i loghi: idea non fatta.
- **Il tratto statale–mercato** resta silenzioso per chi non incontra Imma.
- **Nuove zone, nuovi personaggi, nuovi finali:** fuori dal perimetro di un gioco concluso.

## Se qualcuno riprende il lavoro

Si parte da `CLAUDE.md`, da `README.md`, da `sviluppo/VERSIONI.md` (le regole dei numeri), da
`collaudo/LEGGIMI.md` (i sedici collaudi: ogni modifica ai `.fav` li deve lasciare verdi) e da
`pre-produzione/06-ramificazione.md` (il perché di ogni filo). Ogni modifica ai `.fav` cambia
l'impronta dei salvataggi: è una versione minor, o major se si ristruttura una zona.
