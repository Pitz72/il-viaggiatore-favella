---
data: 2026-10-21
ora: "00:35"
titolo: "L'alta accessibilità (piano 09, fase 6)"
tipo: sessione
versione: 1.28.0
---

# L'alta accessibilità (piano 09, fase 6)

## In breve
Le opzioni hanno l'alta accessibilità: un interruttore che accende insieme contrasto alto, testo grande, il carattere Atkinson Hyperlegible, il movimento ridotto e il fuoco marcato, regolabili poi una per una. Loghi e trailer adesso si vedono sempre, anche col movimento ridotto.

## Contesto
Dopo la fase 4 Simone ha notato che nella scheda Video mancavano le scelte di accessibilità stabilite (piano 09, §3.4: fase 6) e ha chiesto «un'ultimissima fase» per la sessione: l'accessibilità, prima della fase 5 dei comandi (le due non dipendono l'una dall'altra). Le sue decisioni erano già prese: D2, loghi e trailer restano anche col movimento ridotto. Prima il movimento ridotto era solo una media query globale (`index.css`) che fermava tutto, e con l'impostazione di Windows i loghi non comparivano e il trailer saltava al menu; il gioco non aveva altre opzioni di leggibilità.

## Lavoro fatto
- Il carattere: Atkinson Hyperlegible Next 5.3.0 (SIL OFL 1.1) **copiato** da `@fontsource-variable/atkinson-hyperlegible-next` già installato nel Relitto (i due file latini, normale e corsivo, variabili nel peso: 71 kB), in `app/public/fonts/` con la sua `@font-face` in `fonts.css`; la riga di copyright in `fonts/OFL.txt`; il nome nel cartello dei crediti. Nessuno scaricamento.
- `lib/opzioni.ts`: `contrasto`, `testo`, `carattere`, `movimento`, `fuoco`; `ACCESSIBILE` e `NON_ACCESSIBILE` (che cosa accende e spegne l'interruttore) e `altaAccessibilita` («si», «no», «personalizzata»).
- `lib/accessibilita.ts` (nuovo): mette gli attributi `data-*` sulla radice e li aggiorna a ogni cambio, anche quando Windows cambia la sua preferenza; `movimentoRidotto()` (l'opzione, o Windows con «come il sistema») e `scalaTesto()`.
- `app/src/accessibilita.css` (nuovo): ogni regola solo con la sua riga accesa. Movimento ridotto limitato a partita, pannelli e menu; carattere sugli stessi; fuoco marcato (contorno giallo 3 px staccato); testo grande sul diario, i comandi e la barra laterale; contrasto alto su partita, pannelli e menu (i colori scritti nei componenti superati con `!important`, solo con la riga accesa). `index.css` perde la media query globale.
- `Loghi.tsx` e `Trailer.tsx`: niente più salto col movimento ridotto (D2). `Avviso.tsx` e `Crediti.tsx`: compaiono subito col movimento ridotto dell'opzione. `Panorama.tsx`: col movimento ridotto un fotogramma fermo, il viandante in piedi, e si ridisegna solo quando cambiano il luogo o la tela. `ViaggiatorePlayer.tsx`: il diario scorre senza animazione.
- I pannelli (opzioni, taccuino, guida, domanda, pausa) e la colonna del menu crescono del 15% col testo grande (`scalaTesto`); classi `opz-spiega`, `opz-sezione`, `dm-sotto`, `mv-nota` per il contrasto.
- `gioco/Opzioni.tsx`: la scheda Video in due colonne uguali, a sinistra Schermo (e Finestra sul desktop) e Grafica, a destra Accessibilità con l'interruttore e le cinque righe; il pannello da 38 a 41 em perché tutto stia in vista.
- `opzioni-node.mjs`: una prova in più (8), sull'interruttore e sui valori guasti. README e CHANGELOG.

## Decisioni
- **Attributi sulla radice e un foglio a parte, non variabili da riscrivere in tutto il gioco** — perché: i colori e le misure stanno in `gioco.css` e nei componenti; un foglio che li supera solo quando serve lascia il gioco «normale» identico, bit per bit.
- **Il carattere copiato dal Relitto e non scaricato** — perché: è lo stesso pacchetto npm, con la stessa licenza, già sul disco di Simone.
- **Il movimento ridotto tocca partita, pannelli e menu, non loghi e trailer** — D2 di Simone.
- **La fase 6 prima della 5** — chiesto da Simone; la versione è 1.28.0, e i comandi saranno la 1.29.0.
- **Versione 1.28.0** — opzioni nuove: MINOR.

## Verifiche
- I collaudi: `finali.py`, `mirate.py`, `salvataggi.py -n 16`, `scorte.py`, `interfaccia.py`, `fili.py`, `giocate.py`, `conferme.py` (95), `testo.py`, `pulsanti.py`, `doppiaggio.py` tutti ok; `desktop/prove.cjs` 14, `opzioni-node.mjs` 8, `posti-node.mjs` 6; `tsc` pulito; build ok.
- Nel browser integrato, sul gioco vero: con tutto a «normale» gli attributi sono normale/normale/lora/pieno/normale; la scheda Video, dopo l'allungamento, sta in vista (370 px su 370) al 74% dell'altezza; accesa l'alta accessibilità, gli attributi diventano alto/grande/atkinson/ridotto/marcato, il carattere calcolato è Atkinson Hyperlegible Next ed è caricato, il pannello cresce all'86 × 85% del quadro e non scorre (427 su 427); nella partita la prosa è a 20,5 px e il contrasto sul fondo, misurato coi colori calcolati, è 17,3:1 per la prosa, 17,0 per i suggerimenti, 16,8 per le righe di sistema, 16,4 per etichette, stato del corpo e cammino; il fuoco sulla riga ha l'anello giallo. Il paesaggio col movimento ridotto è fermo (la tela identica dopo 1,2 s) e con «pieno» si muove. Ricaricato col movimento ridotto salvato, i loghi si vedono e il trailer parte da 1,4 s invece di saltare al menu. Console senza errori.

## Questioni aperte
- Da guardare con Simone nel desktop: il contrasto alto e il testo grande a tutto schermo, a 1080p e 4K.
- Il contrasto alto copre partita, pannelli e menu; la guida «Come si gioca» ha i colori nel componente e prende solo il fondo pieno: se serve, le sue classi in una fase dopo.
