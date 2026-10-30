---
data: 2026-10-30
ora: "06:20"
titolo: "Il cammino in basso a destra se ne va"
tipo: decisione
versione: 1.37.1
---

# Il cammino in basso a destra se ne va

## In breve
Un tester ha detto a Simone che le sette barrette in fondo alla colonna di destra («il cammino») disorientano: sembrano una
mini mappa e non aiutano a orientarsi. Valutate le tre strade (tenerle ridisegnate, ridurle a testo, toglierle), Simone ha
dato l'ok a toglierle. Fatto nella 1.37.1.

## Contesto
«Il cammino» era una fila di sette trattini, uno per zona, nel colore della zona: grigio se non ancora raggiunta, tenue se
attraversata, più spesso e con un alone dove sei; sotto, il nome della zona. È nato prima della mappa, quando era l'unico
segno del viaggio sullo schermo. Dalla 1.37.0 c'è la mappa vera, con le tappe e il punto rosso.

## Lavoro fatto
- Tolti il blocco «il cammino» da `ViaggiatorePlayer.tsx`, le regole `.vg-cammino` da `gioco.css` e i due riferimenti a
  `.vg-cammino-nome` in `accessibilita.css` (testo grande, contrasto alto). La colonna di destra finisce con la bisaccia, o con
  «chi hai incontrato» e «si dice di te» quando ci sono.

## Decisioni
- **Toglierle, non ridisegnarle** — perché:
  1. **Puntano dalla parte sbagliata.** Sulla carta di `fav_mappa` (nord in alto) i luoghi centrali delle tappe stanno, in
     colonne: piazza 12, masseria 9, conca 7, casello 4, piazzetta 1; poi, sulla colonna 1, si sale per righe: piazzetta 8,
     pianoro 4, guado 2, soglia 0. Il viaggio va verso ovest e poi gira a nord. Le barrette andavano da sinistra a destra: lette come
     una mappa, ed è così che le ha lette il tester, dicevano la direzione opposta e nessuna svolta.
  2. **Si vestivano da mappa:** gli stessi colori di zona delle macchie del foglio della mappa.
  3. **Non dicevano niente di nuovo:** «tappa N di 7» è in testata e il nome della zona sul panorama; la riga sotto le
     barrette lo ripeteva per la terza volta.
- **Non un percorso orientato a L, come la carta.** Sarebbe una mini mappa sempre visibile: regalerebbe ciò che la mappa fa
  guadagnare (va presa nella casa di Acquaviva, e se la lasci il suo pulsante se ne va) e svuoterebbe la meccanica della 1.37.0.
- **Non una riga di testo** («tappa 3 di 7 · L'invaso morto»): ripeterebbe la testata.
- **È una patch** (`VERSIONI.md` §2, «errori di impaginazione»): nessuna sequenza di comandi cambia esito, i salvataggi non
  c'entrano.

## Verifiche
- `npm run build` (tsc e vite): pulito. Nessun collaudo nominava il cammino.
- `collaudo/interfaccia.py`, `testo.py`, `conferme.py`: tutto OK. `node strumenti/versione.mjs verifica` e `diario.mjs verifica`: OK.
- Nel browser (Chromium senza finestra, 1600 × 900): una partita nuova arriva alla stazione, la colonna di destra finisce con
  la bisaccia, nessun elemento `.vg-cammino` nella pagina; la testata dice «tappa 1 di 7» e il panorama «Acquaviva · il capolinea».

## Questioni aperte
- Da sentire dal tester se, senza le barrette, il senso di avanzamento basta così (testata e mappa).
