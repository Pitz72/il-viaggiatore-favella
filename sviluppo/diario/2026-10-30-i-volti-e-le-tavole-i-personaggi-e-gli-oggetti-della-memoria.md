---
data: 2026-10-30
ora: "08:43"
titolo: "I volti e le tavole: i personaggi e gli oggetti della memoria"
tipo: sessione
versione: 1.38.0
---

# I volti e le tavole: i personaggi e gli oggetti della memoria

## In breve
Fino a qui l'unico oggetto che si vedeva era la mappa. Simone ha proposto di far generare i ritratti di tutti i
personaggi e qualche oggetto essenziale con Nano Banana Pro 2.1, in Google Flow, «lievemente vettoriali, con quell'impronta
cromatica»; poi di trovar loro il posto nell'interfaccia, «nel modo più elegante possibile». Ora chi parla ha un volto e
otto oggetti della memoria hanno la loro tavola, che compare quando li esamini.

## Contesto
Il gioco è testo, panorami dipinti in silhouette e una plancia di comandi. Un'immagine in più doveva stare in quel mondo
(il nero-inchiostro, l'accento della zona, la luce calda) e non trasformarlo in un'altra cosa: niente gallerie, niente
schede, niente immagini che coprono il testo.

## Lavoro fatto
- **Le immagini, con Simone.** Un prompt unico per gli oggetti e uno per i ritratti (stessa luce, stesso sfondo, stessa
  inquadratura per tutti), poi le correzioni una per una: la lettera di Cosimo senza il saluto inventato, il diario e il
  cavalluccio rifatti, il biglietto con la sua scritta («Non è il caso di tornare»), Vito, Iole e Peppe rigenerati.
  Pasquale guarito l'ha rifatto Simone in Flow partendo dal ritratto con la febbre («uno può guarire ma non è che debba
  essere un miracolo»): stesso uomo, senza il sudore e le occhiaie, il colore appena tornato. Imma dopo aver mangiato è la stessa immagine con la
  pelle appena più calda.
- **`strumenti/immagini.py`** (nuovo): dagli originali (fuori da git, come i master della voce) alle immagini del gioco. I
  ritratti si ritagliano sul volto con una tabella misurata su un foglio a griglia, perché la testa riempia il tondo allo
  stesso modo in tutti (384×384); gli oggetti attorno al loro ingombro, con un margine (512×512). Lo sfondo scuro di ogni
  immagine, viola o caldo che fosse, torna al nero del gioco (#0b0a0e); al biglietto si aggiunge il punto finale che il
  generatore aveva dimenticato. Ventiquattro WebP, 326 KB in tutto.
- **`gioco/immagini.ts`** (nuovo): chi ha un volto, e la variante di adesso (Imma digiuna o sfamata, Pasquale malato o
  guarito); le tavole, riconosciute dall'inizio della descrizione che il motore stampa. Così funzionano anche
  nell'avventura testuale, con qualunque parola si esamini, e non serve toccare il motore né il ponte.
- **Nell'interfaccia** (`ViaggiatorePlayer.tsx`, `gioco.css`):
  - il **volto** accanto alla battuta, un cammeo tondo con un filo dell'accento della zona e un anello di buio che lo
    stacca dal fondo; più grande accanto alle risposte di un dialogo; piccolo in «chi hai incontrato»;
  - la **tavola** a destra del testo, che le gira attorno (`shape-outside` a cerchio) come in un libro illustrato, sfumata
    nel fondo con una maschera radiale; sul telefono si centra sopra il testo;
  - la **foto storta**: alla parete è inclinata di 7 gradi, e quando la raddrizzi la tavola si raddrizza davvero, in un
    secondo e mezzo;
  - **il diario resta fedele**: ogni voce ricorda gli stati del momento, così tornando indietro Imma è ancora digiuna e la
    foto ancora storta (solo in memoria: i salvataggi non cambiano);
  - col movimento ridotto niente entrate e niente gesto: la foto è storta o dritta e basta. Le immagini sono decorative
    (`aria-hidden`): il lettore di schermo legge il testo, che dice già tutto.
- **La mappa, coi revisori** (lo stesso giro): la stampa ora c'è dal primo istante se era pronta (prima rifaceva la
  dissolvenza a ogni apertura), le fette della pittura sono più corte (la riva si calcola una volta per riga), il sale sta
  esattamente dentro il lago della stampa, il nome della Serra Alta sta sulla Serra Alta, il cartiglio e la descrizione a
  voce seguono la stampa (senza stampa non dicono «carta fisica»), un errore della stampa non resta in memoria per tutta
  la sessione. Per l'accessibilità: l'anello di una tappa è tratteggiato finché non la raggiungi (col contrasto alto le due
  sfumature erano indistinguibili), la legenda usa gli stessi segni del foglio, il luogo che si vede ha il filo più scuro
  (3:1 anche sulle fasce scure della montagna), il lettore di schermo sente quali tappe hai raggiunto e i nomi del Torrente
  Morto e della Serra Alta.

## Decisioni
- **Il protagonista non ha volto, né la sua famiglia** — perché: il viaggiatore è chi gioca, e moglie e figlio esistono
  solo nella sua memoria; un volto li fisserebbe.
- **Le tavole solo per gli oggetti della memoria** (otto, più il gesto della foto) — perché: sono le cose che il testo
  chiede di guardare; un'immagine per ogni oggetto avrebbe fatto inventario.
- **Le tavole si riconoscono dal testo**, non da un nuovo campo del motore — perché: la storia è definitiva e il collaudo
  `testo.py` controlla ogni inizio parola per parola; un campo nuovo avrebbe toccato il motore per una scelta di
  interfaccia.
- **La licenza: CC BY-SA 4.0, come le voci di Gemini TTS** (mia, sul precedente già scritto in `LICENSE-CONTENUTI.md`) —
  perché: Google non rivendica la proprietà di ciò che si genera con i suoi modelli, come per la voce; le musiche di Lyria
  restano l'unica eccezione Google, perché sono di The Runtimers. Se Simone preferisce tenerle fuori dalla licenza libera,
  si cambia una riga in tre file.

## Verifiche
- `collaudo/testo.py`, quattro prove nuove: i 14 volti sono di persone dichiarate nei `.fav`; i 24 file ci sono; le 9 tavole
  cominciano come un testo dei `.fav`; le varianti leggono stati che esistono. Tutte verdi.
- `collaudo/mappa.py` dopo le correzioni dei revisori: 12.275 controlli, tutti verdi; la prova «non è la griglia» ora
  misura lo scarto dalla griglia piegata (6,9 unità in media), non da quella uniforme, che passava anche senza scarti.
- `app/scripts/finale-node.mjs`: la riga dei crediti «Ritratti e oggetti», al suo posto.
- In una partita vera, a 1600×900 e a 430×900: il biglietto alla stazione, Nunzio al bar (il volto nella battuta e
  accanto alle risposte), la foto storta e poi raddrizzata, la tanica. Nessun errore in console.

## Questioni aperte
- **Da sentire dal tester** se le tavole aiutano o distraggono, e se i volti in piccolo si riconoscono.
- Simone ha annunciato la **versione inglese** (solo pulsanti, con il doppiaggio rifatto): le tavole riconosciute
  dall'inizio del testo andranno riconosciute anche dal testo tradotto.
