---
data: 2026-10-20
ora: "11:45"
titolo: "Il trailer, fase 5: la nitidezza a 4K"
tipo: sessione
versione: 1.18.1
---

# Il trailer, fase 5: la nitidezza a 4K

## In breve
Quinta fase del piano 07 (voce 19): le tele statiche raddoppiate (19a) e la tela del trailer che su uno schermo 4K sale oltre i 2560 px solo dove la misura lo permette (19b). Su questo computer, con uno schermo 1080p, a occhio cambia poco (le tele a 2× si riducono); a 4K l'immagine smette di essere morbida accanto ai testi. Durata, ordine, tempi, testi e musica sono quelli di prima; Simone ha dato il via libera sui ritagli a 4K prima/dopo.

## Contesto
Il piano misurava una tela al massimo di 2560×1440, che su uno schermo 4K il browser ingrandisce di 1,5×, e molte tele precalcolate a 1× o meno (il tavolo 960×540 mostrato a 1920×1080; la piana di sale, l'asfalto, il campo e le sagome a 1920). L'immagine era morbida accanto a una scrittura (i testi sono nel DOM) tagliente. Decisione di Simone: prima (a) le tele statiche raddoppiate, poi (b) la tela più grande solo dove la misura lo permette.

## Lavoro fatto
- **19a. Le tele statiche** (`trailer/texture.ts → RES_TELE, creaTelaR`; `scene/alba.ts`, `lettere.ts`, `guado.ts`, `invaso.ts`, `trailer/scritta.ts`). Una tela statica di `w × h` unità di progetto si dipinge a `RES_TELE` = 2 pixel per unità, con il pennello già scalato: si disegna in unità di progetto come sempre e chi la copia dà le dimensioni (`drawImage(t, x, y, w, h)`). A 2×: l'erba lontana e vicina, l'asfalto, il campo e le sagome dell'alba (vettoriali: costo quasi nullo; la grana per pixel resta a 1× e si stira); i fogli delle lettere, la busta, il biglietto e la macchia del bicchiere (la riga di scrittura si dipinge alla risoluzione della tela su cui si posa); la città e il greto del guado. Il tavolo, che era 960×540 mostrato a 1920×1080, ora è 1920×1080 (il campo di rumore è lo stesso, campionato due volte più fitto: il disegno non cambia): una tela a 2× sarebbe stata 3840×2160 per pixel. La piana di sale ha la tessera a 2048×512 e la piana a 3840×800 (i campi lenti di umidità e crepe sono a griglia: `campoLento()` anche non periodico, anche per la carta e il legno).
- **19b. La tela oltre 2560** (`components/Trailer.tsx`). `TETTO_TELA` (2560) è ora una variabile; all'avvio, se lo schermo ne vorrebbe di più (4K), il trailer prova 3840 e poi 3200 px sulle cinque inquadrature più pesanti (8, 13, 24, 66, 86 s: lettere, alba, terra, guado, titolo; dopo quattro fotogrammi di riscaldamento, mediana di cinque) con la sincronia WebGL di `prova`, e tiene la prima larghezza la cui peggiore mediana costa meno di 14 ms. Misura a freddo, appena dopo la preparazione: a regime un fotogramma costa 2–3 ms in meno. Se WebGL non c'è o nessuna regge, resta 2560; sotto i 2560 px di larghezza non c'è niente da scegliere e la calibrazione non parte. La risoluzione adattiva (1 → 0,75 → 0,5) resta la rete di sicurezza. In sviluppo la calibrazione parte solo con «?calibra» nell'indirizzo (le catture e le misure usano `__trailer.tetto(n)`).
- **Il bordo a gradini** (`trailer/viandante.ts`). In primo piano la luce di contorno si disegnava con la sagoma a dettaglio 0, senza il risvolto dei pantaloni (più largo della gamba) e senza la suola spessa del dettaglio 2: il risvolto sporgeva dalla luce e ci faceva i gradini intorno (il «bordo a gradini» del piano). Ora la sagoma di luce ha anche il risvolto e la suola (`risvolto`, solo per il primo piano).
- **Per chi sviluppa:** `strumenti/trailer-calibra.cjs` (la scelta della tela come la farebbe il giocatore), `--tetto` in `trailer-cattura.cjs` e `trailer-misura.cjs`.

## Decisioni
- **La soglia è 14 ms, misurata a freddo, non 11 o 12** — perché la prima prova (11) rifiutava anche 3200 a causa del rumore di partenza (la stessa tela che a regime costa 9–10 ms misurava 12–15 ms nei primi fotogrammi dopo la preparazione); con 14 le cinque prove ripetute scelgono 3200 ogni volta e 3840 (15–32 ms a freddo) mai.
- **Il suolo della terra e la mappa restano a 1×** — perché il suolo «cotto» ha una riga di tessera per ogni riga dello schermo (396 copie per fotogramma: a 2× sarebbero 792, e il costo di quella scena, già fra i più pesanti, crescerebbe di diversi millisecondi: stima, non misurata), e la carta della mappa a 2× sarebbe una tela di 7680×2160 (66 MB). Sono i due limiti che la fase lascia: a 3200–3840 px il suolo della terra e la carta della mappa sono un poco più morbidi del resto. Se Simone li vuole, si ripensa il «cotto» in orizzontale solo.
- **La tela non sale mai da sé, durante il trailer** — perché una scelta al volo farebbe ricomporre il canvas e il buffer a metà scena, con un salto visibile; la scelta sta prima dell'avvio e la discesa (1 → 0,75 → 0,5) è l'unico cambiamento in corsa, come prima.
- **1.18.1, patch** — perché sono nitidezza e prestazioni, nessuna funzione nuova e nessuna scelta per il giocatore (`sviluppo/VERSIONI.md`, §2: prestazioni).

## Verifiche
- `tsc` pulito, `npm run build` ok (JS 488,1 kB, 164,5 kB gzip), `collaudo/testo.py` ok, autoverifica del desktop superata (con la cartella dei salvataggi temporanea); `intro.mp3` e `scaletta.ts` non toccati.
- Catture a 1080p (40 istanti, prima/dopo): **13 identici e 27 diversi**, tutti nelle zone attese: le lettere (tavolo, fogli, busta), l'alba e il titolo (sagome, campo, erba, asfalto sotto l'orizzonte), la piana dell'invaso, la città e il greto del guado, e la luce di contorno del viandante a 17,8–24 s (lo 0,03–0,07 % dei pixel); mappa, cinque modi, regole e numeri identici. Differenze di 34–50 dB di PSNR (la stessa immagine a un'altra risoluzione).
- Costo di un fotogramma, due giri alternati prima/dopo con 80 fotogrammi per istante: a 1920 e 2560 le differenze vanno da −1,1 a +0,7 ms (rumore). A 4K con la tela a 3200 (la scelta della calibrazione) la mediana è tra 2,2 e 10,2 ms sulle 17 inquadrature; a 3840 le più pesanti arrivano a 12–14 ms.
- Preparazione delle tele, mediana di 3 aperture a freddo: lettere 1788 ms (1263 prima), alba 1017, terra 668, invaso 1882, mappa 264, guado 648: in tutto 6,3 s (5,2 prima; limite 8 s).
- **Scheda grafica spenta** (`app.disableHardwareAcceleration()`): a 1080p la tela scende da 1920 a 1440 px dopo circa 8 s di fotogrammi lenti; a 4K la calibrazione rifiuta 3840 (175 ms) e 3200 (123 ms), parte da 2560 e la risoluzione adattiva la porta a 1920 dopo circa 25 s: la rete di sicurezza scatta ancora.
- La calibrazione, a 4K fuori schermo (5 aperture): sceglie 3200 ogni volta. **Non provato** su uno schermo 4K vero (questo computer ha uno schermo 1080p): la scelta, il costo reale del compositore con la grana a fusione a 3200 e a 3840, e l'aspetto a occhio. Il «prima» è lo stato di fine fase 4.

## Questioni aperte
- Le coppie prima/dopo a 4K sono in `collaudo/esiti/confronto-fase5/` (locale).
- Il suolo della terra e la mappa a 1×: vedi sopra.
- Prossima: fase 6 (T1 incrocio terra → invaso, T2 «tuo fratello» a 64,0, T3 biglietto più veloce, C1/C2 la schermata d'avvio), poi i due MP4.
