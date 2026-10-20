---
data: 2026-10-20
ora: "23:29"
titolo: "Le opzioni e i volumi veri (piano 09, fase 1)"
tipo: sessione
versione: 1.24.0
---

# Le opzioni e i volumi veri (piano 09, fase 1)

## In breve
Il gioco ha un pannello delle opzioni, uguale dal menu e dalla partita, e i volumi sono veri: musica, voce ed effetti hanno ciascuno il proprio, sotto un volume generale, e cambiano dal vivo. È la prima delle otto fasi del piano 09, che vuole il gioco confezionato come un prodotto commerciale.

## Contesto
Simone ha chiesto di confezionare il gioco «al top», sul modello di Il Relitto per l'impostazione: le opzioni a schede, lo schermo, l'accessibilità, i volumi, i modi dei comandi; poi il menu d'avvio riorganizzato, la pausa, un taccuino da app desktop e i trofei. Il piano è `pre-produzione/09-opzioni-menu-pausa.md` (v0.2, con le sue risposte al questionario); questa è la fase 1, col suo via libera. Prima c'erano un interruttore «♪ audio sì/no» nel menu, un pannello «La voce» in partita (modo e un volume, che valeva anche per Enzo nel trailer) e nessun volume per musica ed effetti.

## Lavoro fatto
- `app/src/lib/opzioni.ts` (nuovo): il deposito delle opzioni come `stile/opzioni.ts` del Relitto, senza React (il gancio è in `useOpzioni.ts`): una chiave sola nel `localStorage`, ogni voce guasta torna al suo valore di base senza toccare le altre, i livelli a passi di 0,05. La prima volta raccoglie la voce di prima («viaggiatore.voce»: il modo, e il volume di allora diviso per 0,9) e toglie la vecchia chiave solo se la nuova si è scritta.
- `app/src/lib/suono.ts` (nuovo): il bus sonoro. Tre canali (musica, voce, effetti) con la loro taratura (la voce al 100% vale 0,9, il livello di sempre), un'uscita per contesto con il volume generale e il **fusore** (un nodo a un canale solo per il mono: lo stereo si somma, e verso gli altoparlanti il suono unico va identico a destra e a sinistra), il silenzio quando la finestra non è in primo piano. I cambi passano con `setTargetAtTime` (0,04 s): niente scatti. I contesti offline non passano dal bus.
- `trailer/audio.ts`: il brano e il bordone sul canale musica, i rumori e il vento sugli effetti, Enzo sulla voce, tutti dentro il master (che resta l'interruttore del trailer) e il compressore, poi l'uscita del bus. La voce di Enzo si carica sempre e parla solo con la voce recitata, letta dal vivo. `gioco/voce.ts`: le impostazioni proprie sono sparite, l'uscita è il canale voce. `loghi/suono.ts`: dal vivo sul canale effetti (l'esportazione dei loghi resta sul suo contesto offline).
- `app/src/gioco/Opzioni.tsx` (nuovo) e `opzioni.css`: il pannello. Due schede (Video, Audio: Generale arriva con i comandi, nella fase 5), con le regole ARIA dei tab; Esc chiude, il fuoco entra e torna. Largo 74 em e alto 38 em, fisso (Simone: «allarga orizzontalmente… dalle una dimensione fissa»), in due colonne: Audio ha i volumi a sinistra e l'ascolto a destra, e sta tutto in vista sia sulla superficie del menu (73 × 67% del quadro) sia su quella della partita (75 × 69%). «Ripristina le opzioni di base» con la domanda S / N.
- Il fuoco della tastiera senza il riquadro del browser (Simone: «non con il riquadro che è brutto da vedere»): la scheda scelta ha la sua sottolineatura e col fuoco il nome si accende con un alone; un cursore o un valore accende il nome della sua riga; i pulsanti hanno un anello che segue la pillola.
- `ViaggiatorePlayer.tsx`: «⚙ opzioni» al posto di «♪ voce»; `ImpostazioniVoce.tsx` tolto. `Trailer.tsx`: «⚙ opzioni» al posto di «♪ audio sì/no» nella fila dei pulsanti (il menu intero si riorganizza nella fase 2). La guida dice «le opzioni la regolano».
- `app/scripts/opzioni-node.mjs` (nuovo, in CI): sette prove sul deposito. `autoverifica.ts`: il bus sonoro, senza cambiare le opzioni di chi gioca. README e CHANGELOG.

## Decisioni
- **Al 100% tutto suona come prima** — perché: le tarature tengono i livelli di sempre (la voce a 0,9), così la prima apertura dopo l'aggiornamento non cambia niente a chi non tocca i cursori.
- **Gli strumenti offline non passano dal bus** — perché: l'esportatore del trailer e i suoni dei loghi devono restare uguali al bit; dove il codice è condiviso, sui contesti offline i canali sono nodi a guadagno 1.
- **Le schede compaiono quando hanno qualcosa** — perché: una scheda Generale vuota sarebbe un segnaposto; arriva coi tre modi dei comandi.
- **«In secondo piano» parte da «continua»** — perché: chi passa a un'altra finestra non si aspetta che il gioco taccia, se non l'ha chiesto.
- **Versione 1.24.0** — un pannello nuovo e i volumi: MINOR.

## Verifiche
- `finali.py`, `mirate.py`, `salvataggi.py -n 16`, `scorte.py`, `interfaccia.py`, `fili.py`, `giocate.py`, `conferme.py` (95 scelte), `testo.py`, `pulsanti.py`, `doppiaggio.py`: tutto ok. `desktop/prove.cjs`: 7 prove. `opzioni-node.mjs`: 7 prove. `tsc` pulito.
- Nel browser integrato, sul gioco vero: il bus col trailer ha i tre canali (effetti 1, musica 1, voce 0,9) e l'uscita (generale 1, fusore a 2); la musica portata al 40% con le frecce dà 0,4 dal vivo; «mono» porta il fusore a 1 canale; con la finestra senza fuoco (simulata) il generale va a 0 e torna a 1; «ripristina» con S rimette tutto; in partita c'è il canale voce a 0,9; col lettore di schermo il diario torna «polite» e «riascolta» sparisce, con la voce recitata torna «off»; Esc chiude e il fuoco torna dov'era. Console senza errori.

## Questioni aperte
- L'ascolto a orecchio nel desktop vero (i volumi, il mono, il silenzio in secondo piano): con Simone.
- Il «sì» della domanda del ripristino ha `autoFocus`: si conferma anche con Invio. Va bene così, ma se ne parla nella fase 2, quando le conferme diventano tutte domande a parte.
