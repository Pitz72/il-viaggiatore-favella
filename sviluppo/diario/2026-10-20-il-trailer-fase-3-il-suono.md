---
data: 2026-10-20
ora: "11:20"
titolo: "Il trailer, fase 3: il suono"
tipo: sessione
versione: 1.17.1
---

# Il trailer, fase 3: il suono

## In breve
Terza fase del piano 07: l'immagine e i rumori seguono ciò che si sente (la latenza d'uscita, voce 14) e i passi hanno la materia del terreno (voce 15). Il compressore del brano (voce 13) resta com'è, come ha deciso Simone; `intro.mp3` non si tocca. Simone ha dato il via libera dopo l'ascolto degli A/B.

## Contesto
Il piano misurava (20/10) un'uscita audio che aggiunge circa 50 ms (10 di base e 40 d'uscita): l'immagine, che legge il tempo da `brano.currentTime`, cioè dal punto dove il file è decodificato, anticipa ciò che si sente di circa tre fotogrammi. E i rumori sintetici (passi, carta, tasti) erano sempre lo stesso suono, asciutto, su asfalto, fango, sale e sassi.

## Lavoro fatto
- **14. La latenza d'uscita** (`trailer/audio.ts`). `latenza()` somma `baseLatency` e `outputLatency` del contesto (zero dove il browser non le dice; tetto 250 ms) e `orologio()` restituisce `currentTime − latenza`. Tre conseguenze tenute coerenti: (a) il brano non viene riposizionato per l'offset (la soglia dei salti di 0,3 s guarda ora `currentTime − (t + latenza)`); (b) i rumori sintetici, che passano dalla stessa uscita e arrivano alla stessa distanza, partono con la latenza d'anticipo (gli eventi si confrontano con `t + latenza`), così cadono insieme alla musica e al fotogramma invece che dopo; (c) senza brano (colonna sintetica) l'anticipo è zero. Dove l'uscita dice zero non cambia niente.
- **15. Passi e rumori** (`trailer/scaletta.ts`, `trailer/audio.ts`). `CAMMINATE` ha un campo `terreno` (asfalto, crosta, sale, sassi: è un dato, nessun tempo dipende da lui) e gli eventi dei passi portano `terreno` e `piede` (0 sinistro, 1 destro). `suona()` riceve l'evento: da lui un seme (`rng` dal tempo dell'evento, quindi ripetibile: lo stesso trailer suona sempre uguale), la variazione di ogni passo (altezza ±7 %, il sinistro appena più grave, livello ±2 dB, filtro), il lato nello stereo (±0,16) e la materia: asfalto = colpo sordo e un filo di granello; crosta = tre schiocchi e un tonfo; sale = un fruscio morbido e lungo; sassi = tre–cinque clic piccoli su un tonfo sordo. Carta e tasti hanno le loro variazioni. I rumori passano da una «stanza» brevissima (risposta di 0,22 s che decade, mandata a 0,16) prima del master e del compressore, che non cambiano. Il `Math.random()` dell'offset nel buffer del rumore bianco è diventato il generatore con seme.
- **Per chi sviluppa:** `strumenti/trailer-rumori.cjs` rende offline (un `OfflineAudioContext` con l'orologio forzato) la colonna sonora vera, i rumori degli eventi di un tratto con la musica sotto, in un WAV: serve ad ascoltare un «prima» e un «dopo» senza aprire il trailer. (Il brano si legge da disco: il server di sviluppo, a una richiesta fatta dalla pagina di Electron, rispondeva con il modulo JavaScript di 349 byte al posto del file.)

## Decisioni
- **I rumori partono in anticipo, non l'immagine in ritardo** — perché la musica è già sull'orecchio: portando l'immagine al punto in cui si sente, i rumori sintetici (che hanno la stessa latenza) devono essere avviati in anticipo della stessa quantità per cadere insieme.
- **Il terreno è un campo di `CAMMINATE`, non una tabella a parte** — perché la camminata è già il posto che dice dove e a che cadenza si cammina; gli eventi lo ereditano.
- **Il compressore del brano non si tocca** — decisione di Simone (voce 13 caduta).
- **1.17.1, patch** — perché sono correzioni di sincronia e variazioni di rumori sintetici (`sviluppo/VERSIONI.md`, §2).

## Verifiche
- `tsc` pulito, `npm run build` ok, `collaudo/testo.py` ok, `intro.mp3` sha256 `6081499c…` invariato.
- **La lista `EVENTI` è identica** (222 eventi: tempi, tipi e livelli), come le `CAMMINATE` (da, a, cadenza, livello), `DURATA` e `SCENE`: confronto in Node fra `scaletta.ts` di prima e di dopo (transpilati). I passi sono 137 su asfalto, 14 sulla crosta, 15 sul sale, 8 sui sassi.
- Prova in un contesto audio vero (browser): 9,5–33 s a passi di 1/60 s senza errori; 46 passi previsti, 119 sorgenti di rumore e 34 oscillatori creati, 150 panner; `latenza()` = 0,05 s con `outputLatency` 0,04; ogni terreno suona (asfalto 3 nodi, crosta 4, sale 2, sassi 4).
- A/B offline di quattro tratti (alba 9,6–17,6, secca 17,6–25,2, invaso 25,2–32,6, guado 59,6–66): i livelli sono uguali a meno di 0,1 LU (−14,7 · −14,2 · −12,7 · −12,4 LUFS, picco ≥ 2,4 dB sotto lo zero): cambia il timbro, non il volume; il brano resta in primo piano.
- Non provato: la latenza su un'uscita con cuffie senza fili (il valore lo dà il sistema); si ascolta nell'app.

## Questioni aperte
- Prossima: fase 4 (la materia: sale, crepe, calligrafia, voci 16–18, con prove A/B scelte da Simone).
