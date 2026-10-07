# Prossimi passi

> **Archivio.** Il Viaggiatore è concluso con la 1.12.0 (7 ottobre 2026): la storia, l'app e i
> collaudi restano come sono, e non c'è un elenco da cui ripartire. Questo file tiene il conto di
> che cosa si è chiuso e di che cosa, di proposito, non si fa. (Com'era prima, fermo alla 1.7.0:
> nella storia di git.)

## Chiuso

- **Il progetto di ramificazione** (`pre-produzione/06-ramificazione.md`, §8): la mappa delle
  ramificazioni, le conseguenze a distanza (da 2 a 13), le varianti di testo per stato, le
  chiusure che raccolgono il viaggio e «chi hai incontrato» (1.12.0).
- **L'interfaccia:** i messaggi del motore e i pulsanti «inventario» e «stato» (1.8.0); «usa X su
  Y» che si compone invece di offrire la coppia giusta (1.9.0).
- **Il motore:** `motore/` è la 1.4.4 di FAVELLA 1, la versione definitiva: il motore è fermo. Se
  mai servisse cambiarlo, si cambia nel repository di FAVELLA 1 (con i suoi test) e si ricopia.
- **La storia:** Imma sulla discesa (1.7.0); le dichiarazioni doppie di `z2-piana.fav` ridotte a
  una con i sinonimi (1.10.0).

- **I due MP4 in `video/`** (non versionati) rigirati con la grafica nuova, fotogramma per
  fotogramma dal trailer vero (`strumenti/esporta-trailer.cjs`, 7 ottobre 2026).
- **Il tasto «esci»** nella barra di gioco e nella schermata finale, oltre che nel menu (1.13.0).

## Non si fa

- **Un'eco di Imma alla soglia.** Vive in paese: un'eco ad Acquamorta sarebbe forzata
  (decisione 11 di `06-ramificazione.md`).
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
