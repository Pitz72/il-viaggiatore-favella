---
data: 2026-10-21
ora: "11:56"
titolo: "La sequenza finale, i titoli di coda e la canzone"
tipo: sessione
versione: 1.32.0
---

# La sequenza finale, i titoli di coda e la canzone

## In breve
Dopo i sei finali della storia il gioco ha una chiusura di un minuto e mezzo (tramonto su Acquamorta, la frase, la
notte, i titoli di coda, i due loghi), poi torna al menu d'avvio; i crediti lasciano l'avvio e diventano i titoli; la
canzone per Lyria 3.5 è scritta e aspetta di essere generata.

## Contesto
Simone, provata la 1.32.0, considera il gioco finito salvo micro rifiniture, e ha chiesto una valutazione oggettiva:
serve una sequenza finale? La mia risposta: la storia non chiede altro (ogni finale ha la scena detta, i «fili del
viaggio» e la frase), ma la fine è l'unico punto dove la confezione non arriva: l'inizio è cinema, la fine era un
riquadro con cinque pulsanti; la musica si spegneva appena compariva il finale; i crediti stavano all'avvio. Consigliata
una chiusura breve che faccia da cornice senza raccontare, solo per i finali della storia.

Simone ha deciso cinque cose: la sequenza come l'ho descritta ma di almeno 1:20; un prompt con il testo intero per una
canzone di Lyria 3.5; via i crediti dall'inizio, come titoli di coda; i loghi di FAVELLA 1 e di Runtime Multimedia; a
gioco finito il menu d'avvio, senza che il gioco riparta. Piano: `pre-produzione/11-sequenza-finale.md`.

## Lavoro fatto
- `app/src/components/SequenzaFinale.tsx`: tela a 16:9 (fino a 2560 px) con la scena del guado del trailer, superficie
  di testo 1920×1080 scalata, i due loghi dell'avvio guidati da qui (muti), la canzone sul canale «musica» del bus.
  `window.__finale.vai(t)` in sviluppo; `?sequenza` e `?titoli` la aprono direttamente.
- `app/src/finale/scaletta.ts` (i tempi: durata = canzone + 1,5 s, mai sotto 90 s; la fine conta a ritroso, così i
  titoli si allungano con la canzone) e `app/src/finale/crediti.ts` (le righe del vecchio cartello, identiche; la
  canzone fra i crediti solo quando il file c'è). Prova `app/scripts/finale-node.mjs` (13 prove), in CI.
- `trailer/scene/guado.ts`: `disegnaGuado(…, figure = false)` disegna Acquamorta e il greto senza Cosimo, senza il
  viandante e senza la camera del trailer; il trailer non cambia (le figure sono passate in una funzione loro, nello
  stesso punto del disegno).
- `ViaggiatorePlayer.tsx`: il riquadro del finale senza pulsanti né elenco dei trofei, con «Invio · continua»; finita la
  voce (`voce.ascolta`), un respiro di 2,5 s e si passa la mano (`onFine`); senza voce, il tempo di leggere l'ultimo turno
  (fra 6 e 40 s); con un pannello aperto si aspetta. Via `ricomincia` (era solo del pulsante «riparti»). I trofei
  dell'ultimo turno vanno ad `App`, che li fa annunciare al menu (`Trailer.tsx`, cartiglio del gioco ingrandito 1,5×).
- `App.tsx`: fasi loghi → avviso → trailer → gioco → finale; `Crediti.tsx` tolto; `collaudo/testo.py` controlla il
  nuovo ordine d'apertura. Extra ha «Titoli di coda».
- README, CHANGELOG, il piano 11.

## Decisioni
- **Una scena senza figure** — perché: i sei finali sono diversi (tre luminosi, tre cupi; Cosimo vivo o morto); la
  stessa immagine deve valere per tutti, quindi niente persone. Tramonto → notte nella sequenza, alba sul menu.
- **La frase in silenzio di parole** — perché: il narratore l'ha appena letta nel gioco; nella sequenza torna scritta e
  grande sull'introduzione strumentale della canzone, che il prompt chiede di 15–20 secondi.
- **Le morti senza sequenza** — perché: «Sei morto, stop» (scelta di Simone del 21/10, fase 8): finita la lettura, il menu.
- **Extra → Titoli di coda** — perché: l'attribuzione delle voci ElevenLabs («elevenlabs.io») stava all'avvio, dove la
  vedeva chiunque; in fondo la vede solo chi finisce: da Extra resta raggiungibile da tutti.
- **I loghi muti, sulla coda della canzone** — perché: i loro suoni coprirebbero la canzone; la ricomposizione da sola
  basta a fare da specchio all'avvio.
- **La canzone**: voce femminile, contralto (alternativa maschile scritta nel prompt); titolo e testo miei, sulle parole
  del gioco: il ritornello viene dalla soglia di casa («la mano ci torna da sola»), l'unico luogo che tutti i finali
  attraversano; il ponte risponde al biglietto del fratello. Il prompt è in inglese come quelli delle zone; il testo in
  italiano. Come accreditare il testo lo decide Simone.

## Verifiche
- Foto a 1920×1080 (Electron fuori schermo sul server di sviluppo): tramonto e frase (prima sovrapposta al campanile:
  alzata nel cielo), notte, titolo fermo (le righe dei crediti spostate più in basso perché non gli stiano sotto), titoli,
  «Grazie per aver giocato.», i due loghi; la modalità dei soli titoli senza la frase.
- Due partite vere giocate nel gioco dalle trascrizioni dei collaudi: «ferite» (35 comandi): riquadro «FINE», menu dopo
  12,3 s, trofeo «Il viaggio finisce qui» annunciato sul menu; «A_peppe» (150 comandi, 13 conferme): riquadro «FINALE»,
  la sequenza parte da sola 62 s dopo la fine (la lettura dell'ultima scena), Esc porta al menu, trofeo «Qualcuno lo
  porti via» annunciato. Nessun errore nella pagina. Il cartello dei crediti all'avvio non c'è più.
- `tsc` pulito; `collaudo/testo.py`, `doppiaggio.py`, `musica.py` TUTTO OK; `finale-node.mjs` 13 prove; build ok.

## Questioni aperte
- La canzone: Simone la genera con Lyria 3.5; poi va preparata in `app/public/musica/finale.opus` (e forse aggiunta
  all'album della colonna sonora: da chiedere).
- Da guardare e sentire nel desktop vero con Simone: tempi, volume della canzone, leggibilità dei titoli.
