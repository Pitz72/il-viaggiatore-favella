---
data: 2026-11-25
ora: "09:29"
titolo: "Revisione totale, rimedi del codice e nuova veste pittorica"
tipo: sessione
versione: 1.43.0
---

# Revisione totale, rimedi del codice e nuova veste pittorica

## In breve
Condotta un'analisi completa del codice e dei sorgenti narrativi con correzione di tutte le 21 criticità individuate (più quattro casi limite logici nei `.fav` a zero impatto sul doppiaggio) e portata l'estetica del trailer, dei panorami e dell'interfaccia di partita allo stile pittorico a gouache e china dei ritratti, preparando la versione `1.43.0`.

## Contesto
Simone ha chiesto un'analisi approfondita dell'intero gioco per individuare criticità gravissime, gravi, medie e lievi nel codice, nell'accessibilità e nella giocabilità senza alterare i testi della storia se non strettamente necessario, dando priorità assoluta a un salto di qualità visiva del trailer iniziale e della grafica di partita, con bozzetti preventivi prima di modificare i file. Mostrate quattro tavole comparative «Oggi / Proposta» e il rapporto completo, Simone ha approvato tramite questionario tutte e quattro le direttrici raccomandate: via ibrida d'autore (fondali dipinti a gouache e china + animazione e luci vive su tela), interfaccia editoriale materica con cammeo dipinto del protagonista, riallineamento pittorico delle scene simboliche del trailer (Carta Fisica, cinque medaglioni dipinti, dieci tessere d'osso e pietra) e chiusura integrale dei 21 bug di codice più i quattro casi limite logici dei `.fav` a zero doppiaggio.

## Lavoro fatto
- **Quattro rimedi logici nei `.fav` a zero impatto sul doppiaggio** (`prototipo/z7-guado.fav`, `z6-colline.fav`, `z5-paese.fav`, `z3-invaso.fav`, `doppiaggio/attribuzioni.json` riallineato di una riga, sette nuove verifiche in `collaudo/fili.py`):
  - allontanarsi dal guado mentre la veglia è accesa azzera il contatore dei turni d'attesa;
  - risolto un blocco reale sul valico (`z6-colline.fav:148`) che impediva di risalire a nord verso il guado a chi avesse già lasciato il fucile o la lettera sul greto o avesse già ottenuto il passo da Cosimo e fosse tornato un momento alla sorgente;
  - ristrette con `se <oggetto> è in <luogo>` le risposte che dicevano «è lì tra i sassi» o «è lì per terra» al guado, nel vicolo e alla diga anche quando il giocatore non aveva mai portato quell'oggetto lì;
  - ricompilato il pacchetto avventura, rigenerata `sviluppo/mappa-narrativa.md` e sincronizzato `app/public/favella-engine/`.
- **Rimedi alle 21 criticità di codice, audio, desktop e accessibilità**:
  - distinta in `ViaggiatorePlayer.tsx` e `Panorama.tsx` la sconfitta per morte (`persa`) dai tre finali amari della storia (`terminata`), che ora mostrano «a casa» / «finale», luce ambrata sul guado e portano regolarmente alla sequenza finale; preservata la frase del finale anche caricando un salvataggio già concluso e attesa la scrittura dei trofei prima dell'uscita;
  - aggiunto il colloquio IPC `prima-di-chiudere` → `pronto-a-chiudere` (con scadenza di sicurezza a 800 ms) fra `desktop/main.cjs`, `preload.cjs`, `lib/desktop.ts` e `ViaggiatorePlayer.tsx` (più `pagehide` nel browser) e rimossa la guardia `!mondo.dialog` così la chiusura della finestra salva sempre la partita;
  - in `app/src/lib/ponte.py`, `fav_carica()` rileva una domanda del motore rimasta in sospeso a fine sequenza e ne rimostra il testo dopo `mostra_stanza()` senza mutare `_registro` né l'impronta dei salvataggi;
  - in `trailer/audio.ts`, `Trailer.tsx` e `SequenzaFinale.tsx`: corretto l'avvio del giro musicale del menu anche rientrando a fine trailer o saltando negli ultimi due secondi, applicato subito il cambio di lingua della voce su «Rivedi il trailer», azzerato una sola volta il soffio sintetico spento, limitato il ridisegno del menu fermo (24 fps scoperto, 0 fps coperto da un riquadro), rilasciato il contesto WebGL di misura prima dell'audio, completata la barra compatta e agganciata la sequenza finale all'orologio reale di `AudioContext.currentTime` con spegnimento naturale del tramonto sotto le stelle;
  - in `lib/suono.ts`, `suonoCarta.ts`, `suonoTrofeo.ts`, `musica.ts`: stato iniziale `fuori` letto da `document.hidden`, nodi Web Audio scollegati a fine coda e contesto sospeso dopo lo spegnimento;
  - in `Conferma.tsx`, `Domanda.tsx`, `Opzioni.tsx`, `Taccuino.tsx`, `PaginaTrofei.tsx`, `ComeSiGioca.tsx`, `Mappa.tsx`, `Loghi.tsx`, `favellaRuntime.ts`, `colonnaSonora.ts`, `accessibilita.css`: trappola del fuoco completa, fuoco iniziale sul «No» nelle conferme distruttive, gestione coerente di `Tab` ed `Esc` in rinomina, scorrimento verticale col testo grande, `aria-selected`, testi bilingui allineati e sosta completa di `requestAnimationFrame` in `Panorama.tsx` quando in pausa o a movimento ridotto.
- **Corredo pittorico (`app/public/immagini/scene/`, 26 file WebP, circa 1,25 MB) e riscrittura visiva**:
  - confezionati il cammeo di tre quarti di spalle del Viandante (`viandante.webp`, 384×384 con `fondo_al_nero` su `#0b0a0e`), cinque fondali `16:9` e cinque medaglioni per il trailer (`scene/trailer/`), e quindici strisce panoramiche `1376×240` per le sette zone esterne e gli otto interni (`scene/panorama/`); nessun file di `ritratti/` o `oggetti/` è stato toccato;
  - riscritti `trailer/tavole.ts`, `paesaggi.ts`, `pittura.ts`, `viandante.ts` e tutte le scene in `trailer/scene/*.ts` mantenendo intatti al millesimo gli 88,5 secondi, i tagli di `scaletta.ts`, la musica e il doppiaggio; trasformata la mappa in Carta Fisica su pergamena calda con margine esteso anti-bordo, inseriti i cinque medaglioni dipinti e sostituite le pillole rosa con dieci tessere d'osso e pietra che si spaccano al colpo;
  - rinnovati `Panorama.tsx`, `RitrattoNostro.tsx`, `gioco.css` e `taccuino.css` con estetica editoriale materica, cammeo velato dalla luce della zona e velatura d'angolo per la testata destra.
- **Versione `1.43.0`**: compilato il CHANGELOG e avanzata la versione con `strumenti/versione.mjs prepara minor`.

## Decisioni
- **Via ibrida (tavole dipinte + animazione viva su tela)** — perché dà al trailer e ai panorami la stessa mano pittorica a gouache e china dei quattordici ritratti di `immagini/ritratti/`, conservando però il ciclo di camminata agganciato ai passi sonori, il trascolorare giorno→notte, i riflessi d'acqua e la parallasse.
- **Nuove tavole tutte sotto `app/public/immagini/scene/`** — perché `collaudo/testo.py` verifica che `VOLTI` e `TAVOLE` in `gioco/immagini.ts` contengano solo i 14 personaggi e i 9 oggetti dei `.fav`, e `CLAUDE.md` vieta di rigenerare i 24 WebP storici.
- **Cammeo del Viandante di tre quarti di spalle** — perché nella poetica del gioco il protagonista non ha volto frontale (`immagini.ts:9`), ma meritava la stessa dignità pittorica degli interlocutori accanto alle risposte di dialogo, con una velatura dinamica della luce della zona.
- **Passo di versione `minor` (`1.42.0 → 1.43.0`)** — perché sono stati toccati quattro file `.fav` della storia (seppur nella sola logica delle condizioni, senza cambiare alcuna frase detta).

## Verifiche
- Compilazione FAVELLA (`39 stanze, 46 oggetti`), `tsc --noEmit` (0 errori), `eslint` (0 avvisi), `vite build` e `desktop/prepara.mjs` verdi.
- Collaudi completi: `desktop/prove.cjs` (21/21), `opzioni-node.mjs` (10/10), `posti-node.mjs` (6/6), `trofei-prove.mjs` (12/12), `finale-node.mjs` (15/15), `finali.py` (9/9 finali + 3 morti), `mirate.py`, `fili.py` (inclusi i 7 nuovi controlli su veglia, valico e oggetti assenti), `salvataggi.py -n 16` (21 ricaricamenti identici), `interfaccia.py`, `giocate.py`, `conferme.py` (95 scelte), `mappa.py` (12.313 controlli, 0 falliti), `trofei.py`, `musica.py`, `testo.py`, `doppiaggio.py` (878 parti IT + 845 EN, 28,4 MB, zero audio scaduti), `traduzione.py` (3.179 righe lungo i percorsi) e `verosimili.py --controlla` (bilanciamento 1.42.0 intatto).
- `desktop`: `electron . --autoverifica` **AUTOVERIFICA SUPERATA**; scattate e ispezionate a occhio 12 schermate reali `1920×1080` dal pacchetto `desktop/web` su tutte le scene del trailer, sul menu d'avvio e in partita (stazione, bar, dialogo con Nunzio e cammeo del Viandante), con **0 errori in console**.
- Strumenti di progetto: `versione.mjs verifica --rilascio`, `diario.mjs verifica` e `diario.mjs registro` tutti verdi.

## Questioni aperte
- **Prova dal vivo di Simone** sul gioco desktop (`desktop`: `npm run avvia`) per guardare il nuovo trailer, il menu, i panorami e il cammeo in dialogo, prima di ordinare `git commit`, `git push` ed eventualmente il workflow «Rilascio» della `1.43.0` (che aggiornerà anche GitHub Pages; se desiderato, si potranno poi rifotografare anche le otto schermate promozionali di `pagine/schermate/` con `strumenti/schermate.cjs`).
