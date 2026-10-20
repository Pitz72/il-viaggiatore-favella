---
data: 2026-10-20
ora: "09:32"
titolo: "Il trailer, fase 4: la materia"
tipo: sessione
versione: 1.18.0
---

# Il trailer, fase 4: la materia

## In breve
Quarta fase del piano 07 (voci 16–18): il sale dell'invaso a lastre vere, le crepe della terra con polvere e variazioni, la mano che scrive con pennino e pressione, e il biglietto in stampatello a pennarello con un carattere a mano libera (Covered By Your Grace, OFL), scelto da Simone fra quattro candidati dopo che ha notato che il biglietto «sembrava una scritta tipografica». Durata, ordine, tempi, testi e musica sono quelli di prima; Simone ha dato il via libera su sale, crepe e scrittura dopo le coppie prima/dopo.

## Contesto
Dopo la luce e la pellicola (1.17.0) e il suono (1.17.1) restavano le tre materie deboli del piano: il sale che sembrava un selciato con i puntini all'orizzonte, il fango che sembrava un mosaico, la scrittura «a dentatura» e il biglietto «a macchina». La terra e il sale erano voci «di gusto»: prove A/B, sceglie Simone.

## Lavoro fatto
- **16. Il sale** (`scene/invaso.ts → pianaTela`). Lastre di Voronoi più larghe e irregolari (lato 86, spostamento 0,9; prima 56 e 0,30), con la cresta di pressione rialzata sul bordo (chiara dal lato della luce, in ombra dall'altro: la luce è quella del resto della scena), una fessura sottile a tratti (continua, con intensità che varia: la prima prova a tratti sembrava cucita), chiazze di umidità a macchie larghe, granulo di cristalli con un luccichio rado, e crepe sottili dentro la lastra. La prospettiva non campiona più un punto per riga: ogni riga si legge con più campioni (quanti ne copre sulla tessera, fino a 8×16) accumulati con alpha 1/k, quindi lontano la tessera si fa media e non puntinatura. È il difetto che sfarfallava.
- **17. Le crepe** (`scene/terra.ts → fangoTela`). Fessure di larghezza variabile (da 1,8 a 13 px sulla tessera: la larghezza è un campo lento, non l'identità della cella, altrimenti i due lati della fessura sarebbero diversi), polvere chiara nelle fessure verso il labbro, piastre che si incurvano ognuna con la sua forza e di più dove la fessura si apre, zone di polvere d'argilla pallida e piastre scure e umide, crepe sottili dentro una piastra su due (un secondo Voronoi, a tratti spezzate). Via i contorni «a mappa» (curve di livello nere dentro le piastre) e i sassolini rosa (da 340 a 150, polverosi). Il suolo resta «cotto»: nessun costo per fotogramma e `velocitaSuolo` non cambia. `campoLento()` in `texture.ts` calcola i campi lenti a griglia e li interpola (periodico, la tessera si salda): la preparazione della terra scende da 0,93 a 0,60 s.
- **18. La mano che scrive** (`trailer/scritta.ts`, `scene/lettere.ts`). `scriviRiga` traccia a pezzi di sei pixel con la larghezza che segue l'angolo di un pennino tagliato a 0,5 rad (le discese grosse, le salite sottili), la pressione che cambia da lettera a lettera, la riga che ondeggia (due onde lente), l'inclinazione e lo scostamento di ogni parola, e l'inchiostro che ristagna a fine parola. La riga si scrive piena su una tela a parte e si posa con la sua trasparenza (`opacita`): dove due tratti si incrociano l'inchiostro non si scurisce. La riga che si scrive nelle lettere ha il bordo bagnato che sfuma (una maschera di 16 px) invece del taglio netto.
- **Il biglietto** (`scene/lettere.ts`, `trailer/font.ts`, `app/public/fonts/`). Simone, leggendo «NON È IL CASO DI TORNARE.», ha detto che era scritto in stampatello grande ma «sembra una scritta tipografica», e ha chiesto un carattere maiuscolo con parvenza di scritto a mano, con licenza libera, importato nel gioco. Quattro candidati OFL (file woff2 del solo sottoinsieme latino, che contiene la «È»; verificati con fontTools: nessun glifo mancante): Covered By Your Grace (16 kB), Architects Daughter (13 kB), Patrick Hand (24 kB), Gochi Hand (20 kB). Prova A/B a corpo normalizzato; Simone sceglie **Covered By Your Grace**. Ora il corpo si ricava dalla larghezza della prima riga (300 px), così anche col carattere di ripiego il biglietto resta della stessa mole; il tratto è un filo più grosso del carattere (pennarello); ogni lettera si svela da sinistra a destra in 0,14 s, la penna che passa; spariscono la rotazione per lettera e il «pop» di scala. I tempi (`BIGLIETTO`) e la lista `EVENTI` non cambiano. Licenza: riga in `OFL.txt`, riga nella tabella dei componenti del README.

## Decisioni
- **Il carattere a mano è solo per il biglietto** — perché il biglietto è «l'oggetto più importante dell'inizio» e Simone ha chiesto proprio quello; il corsivo delle lettere resta procedurale (decisione del 20/10 sulla calligrafia) e «Caro mio,» e le date restano in Lora corsivo. Offerto a Simone un secondo carattere (corsivo, per esempio Caveat) per «Caro mio,» e le date: ha detto che va bene così.
- **I campi lenti a griglia, non rumore per pixel** — perché la larghezza delle fessure, le zone di tono e la polvere variano piano: calcolarli ogni 8–16 pixel e interpolare costa una frazione e libera il tempo per il secondo Voronoi.
- **La larghezza della fessura è un campo, non una proprietà della cella** — perché ogni pixel di una fessura appartiene a una delle due celle che la fiancheggiano: se la larghezza dipendesse dall'identità della cella, i due lati sarebbero diversi e la fessura non sarebbe simmetrica.
- **Il sale si campiona più volte per riga, non con una piramide di mip** — perché ogni riga ha già il suo scorrimento e il suo passo verticale; accumulare N campioni con alpha 1/k è esatto (media) e non richiede livelli precalcolati.
- **1.18.0, minor** — perché è una ridipintura di materia come la fase 2 (`sviluppo/VERSIONI.md`, §2): nel dubbio il livello più alto.

## Verifiche
- `tsc` pulito, `npm run build` ok (JS 485,9 kB, 163,7 kB gzip; il font entra in `dist/fonts/`), `collaudo/testo.py` ok (l'avviso è intatto), autoverifica del desktop superata con la cartella dei salvataggi temporanea; `intro.mp3` e `scaletta.ts` non toccati; `git diff` solo in `app/src/trailer/**`, `app/public/fonts/`, `strumenti/`, `pre-produzione/`, documenti.
- Prima/dopo (catture deterministiche, grana nascosta) su 40 istanti a 1080p: **26 identici e 14 diversi**, tutti nelle zone attese: le lettere (3,4 · 5,5 · 8,3 · 9,3 s: il tavolo e la scrittura, il 1,5–5 % dei pixel), il suolo della terra (17,8 · 19 · 21,5 · 24 s: il 12–13 %, dall'orizzonte in giù), la dissolvenza terra → invaso (24,9 · 25 · 25,1 s: il 3–5 %), il suolo dell'invaso (28,5 s: l'11 %; 31 s: 0,07 %, la notte copre tutto; 33 s: 0,00 %).
- Costo di un fotogramma, prima e dopo nella stessa seduta (RTX 2070, Electron fuori schermo): a 1920 da −1,8 a +1,6 ms, a 2560 da −0,5 a +1,2 ms; le scene toccate (8 s: +0,1 e +0,8; 20, 24, 29, 31 s: da −0,9 a +0,2) non salgono oltre il rumore. Nessuna tele-composizione per fotogramma è aggiunta: sale e terra sono cotti una volta.
- Preparazione delle tele a freddo (mediana di 3 aperture, prima → dopo): lettere 1253 → 1263 ms, terra 930 → 602, invaso 1473 → 1616 (limite del piano 2,2 s), alba, mappa e guado invariati.

## Questioni aperte
- Le coppie prima/dopo sono in `collaudo/esiti/confronto-fase4/` (locale).
- Prossima: fase 5 (4K: tele statiche raddoppiate, poi la tela oltre 2560 solo dove la misura lo permette).
