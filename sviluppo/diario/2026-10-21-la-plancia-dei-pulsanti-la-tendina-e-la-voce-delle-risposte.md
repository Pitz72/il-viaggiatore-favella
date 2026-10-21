---
data: 2026-10-21
ora: "21:15"
titolo: "La plancia dei pulsanti, la tendina e la voce delle risposte"
tipo: sessione
versione: 1.35.0
---

# La plancia dei pulsanti, la tendina e la voce delle risposte

## In breve
Tre imperfezioni trovate da Simone giocando (la voce delle risposte che zittiva il personaggio, un fumetto che non se ne
andava, i pulsanti in disordine) e altre trovate giocando qui: i pulsanti ora stanno in una plancia fissa con le uscite
a rosa dei venti, ciò che si fa con una cosa si apre accanto alla cosa, e la risposta del personaggio non si interrompe.

## Contesto
Simone, giocando la 1.35.0: (1) il narratore legge una risposta di dialogo quando ci si passa sopra col mouse, ma dopo
il clic il mouse è già sulla risposta dopo, e la risposta del personaggio non si sente; (2) a un certo punto è comparso
un fumetto, non si sa di che cosa, che non se ne andava più; (3) in «solo pulsanti» i pulsanti funzionano ma danno un
senso di caos; (4) cercare altre imperfezioni e sistemarle.

## Lavoro fatto
- **Le cause.** (1) `diciScelta` all'ingresso del mouse chiamava `voce.dici`, che zittisce tutto: bastava che il mouse
  entrasse in un'altra risposta (perché si muove, o perché la lista cambia sotto un mouse fermo e il browser lo dice) e
  il personaggio taceva; lo stesso col Tab, e F2 ridiceva poi la risposta invece del turno. (2) I `title` dei pulsanti
  (diciassette): in Electron, su Windows, un fumetto aperto su un pulsante che sparisce col turno può restare sullo
  schermo. (3) Un'unica fila che andava a capo dove capitava: le uscite nell'ordine del motore, guarda e inventario in
  mezzo alle uscite, il menu di un oggetto della bisaccia (a destra) aperto in fondo a sinistra, l'altezza che cambiava
  a ogni luogo e faceva saltare il diario.
- **Misure prima di disegnare** (le sei partite della storia, coi pulsanti che offrirebbe la plancia): le uscite sono
  da una a quattro e sempre nord, sud, est, ovest; le cose del luogo al massimo cinque; i gesti del luogo al massimo due;
  le risposte di un dialogo da una a sei.
- `gioco/voce.ts`: `anteprima()` accanto a `dici()`: un'anteprima non interrompe mai un turno che parla (restituisce
  false), ne prende il posto solo un'altra anteprima, e non diventa «l'ultima» per F2. `ViaggiatorePlayer.tsx`: col
  mouse la risposta si dice dopo una sosta di 330 ms e solo se il mouse si è mosso davvero dopo l'ultimo turno (un
  ascoltatore di `mousemove` che guarda le coordinate); detta una volta, la stessa non si ridice finché il mouse non
  esce; col Tab subito, con la stessa regola del turno.
- `gioco/Plancia.tsx` (nuovo): andare (la rosa: griglia 3 × 3 con le aree n, o, c, e, s e gli angoli per le uscite
  fuori dalla rosa, che oggi non ci sono; due assi appena accennati dietro), qui, fare, e la riga di servizio. Altezza
  fissa (tre righe da 26 px); le risposte di un dialogo, al suo posto, sono alte almeno quanto lei.
- `gioco/Tendina.tsx` (nuovo): il riquadro accanto all'àncora (sopra se è nella plancia o nel diario, restando nella
  colonna del diario; a sinistra se è nella colonna di destra), misurato in coordinate della superficie 1280 × 720 anche
  quando è scalata; clic fuori, Esc, frecce, fuoco alla prima voce. Dentro: il menu della cosa, «usa … su», le dosi
  (`PannelloScorta` in colonna).
- Tolti tutti i `title`; F5 e F9 scritti accanto a salva e carica, Ctrl+Z su ↶ annulla (che sta nella riga di servizio
  in entrambi i modi coi pulsanti); i nomi completi negli `aria-label`.
- Giocando la prima, la seconda e l'inizio della terza zona solo coi pulsanti (clic veri sulla plancia, la bisaccia, la
  tendina, le conferme): il titolo «usa su la mappa…» (ora «usa sulla mappa…», con `conSu` in `azioni.ts`, che non
  scambia la I di «Iole» per un articolo), «usa su questo…» che non diceva su che cosa, cinque luoghi col nome in
  minuscolo (`_maiuscola` nel ponte), la schermata di carico del desktop che diceva «gira nel browser».

## Decisioni
- **Prima il personaggio** (questionario di Simone): la risposta del personaggio non si interrompe; le risposte si
  leggono a sosta, non in coda a fine battuta, e non c'è il talkie classico.
- **Niente fumetti** (questionario): i tasti rapidi scritti sui pulsanti.
- **La rosa dei venti**, con la riga di servizio sotto, **in tutti e due i modi coi pulsanti** (questionario).
- **Il nome dei luoghi corretto nel ponte, non nei `.fav`** — perché: cambiare un `.fav` cambia l'impronta dei
  salvataggi; il nome è solo una questione di schermo, e i titoli dei luoghi non hanno voce.
- **La riga per scrivere un poco più bassa** (7 px sopra e sotto invece di 10) — perché: con la plancia sotto, in
  «pulsanti e parole» il diario perdeva troppo.

## Verifiche
- I venti passi della CI in locale, tutti verdi: prove del desktop, data, compilazione, finali, mirate, salvataggi (16),
  scorte, interfaccia, fili, giocate, conferme, testo, opzioni, posti, trofei (prove), sequenza finale, pulsanti,
  trofei, musica, doppiaggio. `tsc` pulito.
- La voce, nel gioco vero: scelta una risposta di Nunzio, il mouse fermo su un'altra mentre lui parla non lo interrompe
  (il turno resta, nessuna anteprima); finito (15 s), la sosta sulla risposta la fa leggere; F2 resta sul turno.
- La plancia alla stazione, al bar, alla piazza (quattro uscite), alla casa (quattro cose e un gesto), al relitto,
  alla diga; col testo grande e il contrasto alto nessun pulsante troncato; la guida col testo grande entra senza
  scorrere. Il diario: 362 px in «solo pulsanti», 309 in «pulsanti e parole».
- `conSu` provata su tutti i 37 nomi di cose e persone del gioco.

## Questioni aperte
- Da sentire con Simone nel desktop vero: la sosta di 330 ms sulle risposte, e se la rosa con una sola uscita gli
  sembra troppo vuota.
- In «pulsanti e parole» il diario è un poco più basso di prima nei luoghi semplici (la plancia ha sempre tre righe).
