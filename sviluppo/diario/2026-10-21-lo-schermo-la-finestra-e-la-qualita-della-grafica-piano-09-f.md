---
data: 2026-10-21
ora: "00:22"
titolo: "Lo schermo, la finestra e la qualità della grafica (piano 09, fase 4)"
tipo: sessione
versione: 1.27.0
---

# Lo schermo, la finestra e la qualità della grafica (piano 09, fase 4)

## In breve
Il gioco ricorda se lo si vuole a schermo intero o in finestra, e come e dove era la finestra; la dimensione della finestra si sceglie nelle opzioni, così come la qualità della grafica, e sul desktop si può spegnere il controllo degli aggiornamenti. È la quarta fase del piano 09, l'ultima di questa sessione.

## Contesto
Simone dopo la fase 3: «impressioni super positive. Passa alla prossima fase, l'ultima per questa sessione». Le decisioni erano già nel piano: predefinito schermo intero, la finestra si ricorda (D1); la «risoluzione» in Electron diventa dimensione della finestra e qualità della grafica (lo schermo intero è sempre alla risoluzione nativa). Prima: la finestra era sempre 1600 × 900 uscendo dallo schermo intero, niente si ricordava, il trailer sceglieva da solo la sua risoluzione e il paesaggio della partita era sempre a 1280 di larghezza per la densità dello schermo.

## Lavoro fatto
- `desktop/impostazioni.cjs` (nuovo): `impostazioni.json` nella cartella dei dati dell'app (schermo intero, bordi normali della finestra, ingrandita, aggiornamenti), scritto in modo atomico e con le scritture ravvicinate riunite (si trascina la finestra); ogni valore guasto torna a quello di base; `posizioneValida` scarta una posizione che non cade su nessuno schermo (almeno la barra del titolo deve restare afferrabile).
- `desktop/main.cjs`: la finestra nasce da lì (rimpicciolita, in proporzione, se non entra nello schermo principale; al centro se la posizione non va); F11, il trascinamento, l'ingrandimento e la chiusura la ricordano coi bordi «normali» (`getNormalBounds`, quelli a cui torna uscendo dallo schermo intero). Canali nuovi: `finestra:stato`, `finestra:schermo-intero`, `finestra:dimensione` (in pixel veri dello schermo: si divide per la scala di Windows; si esce dallo schermo intero, si toglie l'ingrandimento, si centra), `impostazioni:aggiornamenti`; un evento `finestra` avvisa la pagina dei cambi. L'autoverifica parte da quelle di base e non scrive niente.
- `desktop/aggiornamenti.cjs`: `avvia(finestra, attivo)`, con «spento nelle opzioni» fra i motivi; `supportato` esportato, perché la pagina dica quando una versione (la portatile) non si aggiorna da sola.
- `lib/desktop.ts`: `statoFinestra`, `impostaSchermoIntero`, `dimensioneFinestra`, `cercaAggiornamenti`, `seguiFinestra`. `lib/opzioni.ts`: `qualita` (automatica, alta, media, bassa).
- `gioco/Opzioni.tsx`: la scheda Generale (sul desktop, per ora: gli aggiornamenti); Video in due colonne, lo schermo e la dimensione della finestra (solo le misure 16:9 che entrano nello schermo, quella di adesso evidenziata, una presa a mano detta a parole) e la qualità con la sua spiegazione. Il ripristino rimette anche lo schermo intero e gli aggiornamenti.
- `Panorama.tsx`: la tela secondo la qualità. Automatica com'era; alta alla risoluzione vera sullo schermo, ingrandimento della superficie compreso, fino a 3840, mai meno di automatica; media e bassa a tre quarti e metà. Si rimisura anche al cambio della finestra e delle opzioni.
- `Trailer.tsx`: automatica com'era (calibrazione e discesa da sola); alta a piena risoluzione e tetto 3840; media 0,75; bassa 0,5 e tetto 1920; le scelte fisse non si calibrano né scendono. Un cambio nelle opzioni del menu vale subito.
- Prove: tre nuove in `desktop/prove.cjs` (14), una in `opzioni-node.mjs`. README e CHANGELOG.

## Decisioni
- **Le dimensioni in pixel veri dello schermo** — perché: chi sceglie «1920 × 1080» intende quella; il processo principale divide per la scala di Windows. A 150% su uno schermo 4K, «3840 × 2160» non c'è perché non entra.
- **I bordi «normali» della finestra, non la dimensione del contenuto** — perché: `getNormalBounds` vale anche a schermo intero o ingrandita, e dice dove tornare; la dimensione scelta nelle opzioni si applica al contenuto (`setContentSize`), così il 16:9 è esatto.
- **«Alta» mai sotto «automatica»** — trovato provando: col quadro più piccolo di 1280 la risoluzione vera dava meno pixel della regola di sempre.
- **Rimpicciolire in proporzione** — trovato guardando il file scritto al primo avvio (1600 × 855): una finestra che non entra si riduce tutta, non solo in altezza.
- **La scheda Generale solo sul desktop, per ora** — perché: nel browser sarebbe vuota; i tre modi dei comandi la porteranno anche lì.
- **Versione 1.27.0** — opzioni nuove: MINOR.

## Verifiche
- I collaudi: `finali.py`, `mirate.py`, `salvataggi.py -n 16`, `scorte.py`, `interfaccia.py`, `fili.py`, `giocate.py`, `conferme.py` (95), `testo.py`, `pulsanti.py`, `doppiaggio.py` tutti ok; `desktop/prove.cjs` 14, `opzioni-node.mjs` 7, `posti-node.mjs` 6; `tsc` pulito; build ok.
- Autoverifica del desktop (Electron vero, senza finestra): superata, codice 0, col bus sonoro.
- Desktop vero avviato: `impostazioni.json` scritto in `%APPDATA%/Il Viaggiatore/` (schermo intero, bordi normali 1600 × 855 — da qui la correzione delle proporzioni).
- Nel browser integrato: la scheda Generale non c'è, Video ha schermo e qualità; il paesaggio a 1280 × 200 in automatica, 640 × 100 in bassa, di nuovo 1280 × 200 in automatica; dopo la correzione, alta dà 1280 × 200 col quadro più piccolo; console pulita.

## Questioni aperte
- Da provare con Simone nel desktop: le dimensioni della finestra, F11 e il riavvio che la ricorda, l'ingrandimento, gli aggiornamenti spenti, «alta» su uno schermo grande.
- Nel registro tecnico, già da prima di questa sessione (20/10, 16:45): «Oscillator.frequency.setValueAtTime value 26432.8 outside nominal range» (un suono sintetico chiede una frequenza sopra il limite e il browser la taglia). Innocuo, ma da guardare.
