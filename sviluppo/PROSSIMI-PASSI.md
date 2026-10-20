# Prossimi passi

> **Archivio.** Il Viaggiatore è concluso con la 1.14.0 (15 ottobre 2026) e rifinito fino alla 1.18.2 (20 ottobre):
> la storia è definitiva dalla 1.12.0, e da allora si sono aggiunti solo i loghi d'apertura, il motore 1.5.0 e rifiniture. Non c'è un
> elenco da cui ripartire. Questo file tiene il conto di
> che cosa si è chiuso e di che cosa, di proposito, non si fa. (Com'era prima, fermo alla 1.7.0:
> nella storia di git.)

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

## Pianificato

- **Il doppiaggio totale con sintesi vocale** (discusso il 20 ottobre 2026; nessun piano scritto, nessun codice):
  un audiogioco recitato e accessibile, narrazione e dialoghi con le voci dei personaggi; Simone passa i testi a un
  servizio TTS (Gemini) e produce file WAV che entrano nel pacchetto, ascoltati senza internet; due modalità a scelta
  (voce recitata o lettore di schermo, per non avere il doppio audio con il diario che oggi è una regione viva); la
  voce si ferma al primo tasto. Da definire: l'elenco dei testi da doppiare (circa 11.400 parole nei `.fav`, 76 minuti
  se si registrasse tutto), come si trattano i testi con variabili e condizioni, i termini d'uso del servizio rispetto
  alla CC BY-SA. Parte solo su ordine di Simone, con un piano in `pre-produzione/08-doppiaggio-tts.md`.

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

Si parte da `README.md`, da `sviluppo/VERSIONI.md` (le regole dei numeri), da
`collaudo/LEGGIMI.md` (gli undici collaudi: ogni modifica ai `.fav` li deve lasciare verdi) e da
`pre-produzione/06-ramificazione.md` (il perché di ogni filo). Ogni modifica ai `.fav` cambia
l'impronta dei salvataggi: è una versione minor, o major se si ristruttura una zona.
