---
data: 2026-10-07
ora: "08:08"
titolo: "Il tasto esci in partita e il trailer rigirato"
tipo: sessione
versione: 1.13.0
---

# Il tasto esci in partita e il trailer rigirato

## In breve
Con il gioco dichiarato concluso, due ultime cose: in partita c'è il tasto «✕ esci», e i due video del trailer in `video/` sono rigirati con la grafica nuova.

## Contesto
Il menu iniziale aveva già «✕ esci» (solo desktop); la barra di gioco no: per chiudere si tornava all'intro e da lì si usciva. I due MP4 erano stati esportati prima che il trailer fosse ridipinto (29 settembre) e restavano indietro, segnati come «non fatto» in `PROSSIMI-PASSI.md`. Lo stato del repo su GitHub è stato riallineato: v1.12.0 è l'ultima release («Latest», 6 ottobre), la CI e il workflow «Rilascio» sono verdi.

## Lavoro fatto
- **Il tasto esci** (`ViaggiatorePlayer.tsx`): «✕ esci» nella barra accanto a «← intro», e nella schermata finale. Stesso comportamento di «← intro»: se c'è strada non salvata scrive prima il posto automatico (`lascia()` serve i due casi). Come nel menu, compare solo nel desktop (`inDesktop()`): un browser non può chiudere la propria scheda.
- **I video** (`strumenti/esporta-trailer.cjs`, nuovo): una finestra Electron fuori schermo 1920×1080 sul server di sviluppo, `__trailer.vai(t)` a ogni fotogramma, i pixel a ffmpeg. 2652 fotogrammi a 30 fps, 88,4 s come prima; 1080p (125 MB) e 720p (14 MB), traccia audio muta come nei file di prima.

## Decisioni
- **Esportare dal trailer vero invece di ricostruire la grafica a parte** — perché i testi sono nel livello DOM e il canvas è procedurale: l'unica fonte fedele è la pagina stessa, e lo strumento resta nel repo per rifarli.
- **CRF 20 con tetto a 12 Mbit/s** — perché la grana sul fotogramma fa esplodere il bitrate (9 MB/s a CRF 17); il tetto dà file della taglia di prima.
- **Minor (1.13.0)** — perché è una funzione nuova dell'app (`VERSIONI.md`, §2).

## Verifiche
- `tsc --noEmit` pulito.
- Nel browser, con un ponte desktop finto: «✕ esci» compare nel menu e nella barra di gioco; il clic ha scritto il posto automatico e chiamato `esci` una volta.
- Video: 2652 fotogrammi, 88,4 s, h264; fotogrammi a 20, 38, 63,7 e 82,5 s con la grafica nuova (terra crepata, mappa, guado, titolo).

## Questioni aperte
- Il tasto non c'è nella versione web (di proposito). I video non sono versionati (`video/*.mp4`).
