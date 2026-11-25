---
data: 2026-11-25
ora: "18:29"
titolo: "Cinque rifiniture al trailer: il lampo iniziale, la lettera scritta, la mappa ferma, la fine del brano, la firma"
tipo: sessione
versione: 1.43.1
---

# Cinque rifiniture al trailer: il lampo iniziale, la lettera scritta, la mappa ferma, la fine del brano, la firma

## In breve
Simone ha guardato con calma il trailer della 1.43.1 («Nell'insieme va benissimo come è») e ha segnalato cinque imperfezioni:
corrette tutte e cinque. Due erano difetti veri del codice: l'orologio che all'attacco tornava indietro e la coda del brano che
ripartiva sul menu. Le altre tre erano ritocchi chiesti da lui. Niente è stato rilasciato.

## Contesto
Le parole di Simone, punto per punto:
1. «nella prima dissolvenza sulla scena delle lettere appare per una frazione la schermata, poi torna buio e fadein»;
2. «la lettera bianca sulla quale si posa il biglietto […] è un foglio bianco. Mettiamoci delle finte scritte, riempiamola»;
3. «La mappa ha delle variazioni di zoom che mostrano i bordi vuoti […] impostare un zoom fisso e seguire il percorso sempre con
   lo stesso livello calcolando di non andare mai oltre il bordo […] Pure quando il percorso finisce, non cambiare zoom»;
4. «quando finisce l'animazione, il brano chiude e quando appare il menu si sente l'ultimo tratto di brano, come se si fosse
   desincronizzato» (il più fastidioso);
5. «Il sottotitolo deve essere come nei cartelloni».

## Lavoro fatto
- **1. Il lampo all'attacco** (`components/Trailer.tsx`). Nel browser di sviluppo non si vedeva; nella versione di produzione
  (`vite preview` sulla 5210) sì. Ho misurato la luce media di ogni fotogramma: `0 0 0 2 4 6 8 10 0 0 0 1 4 …`. La dissolvenza
  partiva, poi tornava al nero e ricominciava. Il trailer prende il tempo dal brano (`orologio()` = posizione del brano meno la
  latenza dell'uscita audio), ma all'attacco la latenza (`baseLatency + outputLatency`) vale zero e si conosce solo qualche
  fotogramma dopo: il tempo scendeva di colpo di quel tanto. Sul desktop, con una latenza più grande, il salto indietro era più
  lungo e l'immagine compariva. Ora il tempo non torna mai indietro: se il brano è un poco indietro, l'immagine rallenta a metà
  passo finché non la raggiunge. Anche il primo giro di `requestAnimationFrame`, che può avere un orario precedente, non dà più
  passi negativi. Dopo la correzione la luce sale senza mai calare: `0 0 6 8 10 11 13 14 16 … 93`.
- **2. La lettera scritta** (`trailer/scene/lettere.ts`). Sul foglio bianco dipinto nella tavola c'è ora una lettera in corsivo
  che non si legge: in alto a destra luogo e data, poi il saluto, i capoversi con il rientro, la chiusa e la firma. Si scrive una
  volta sola, sul foglio disteso (700 × 960 unità, al doppio dei px), con parole fatte di archi, occhielli, aste e code, i puntini
  e le stanghette, inclinate in avanti; poi si posa a strisce sul quadrilatero del foglio dipinto (angoli misurati sulla tavola),
  così le righe seguono la prospettiva. L'inchiostro si fonde nella carta (moltiplica). Il biglietto ci si posa sopra come prima.
- **3. La mappa ferma** (`trailer/scene/mappa.ts`). La macchina sta sempre a 1,55: è la distanza che teneva per quasi tutta la
  scena. Segue la penna e si ferma 6 px dentro il bordo del foglio, su ogni lato. Alla fine resta su Acquamorta, senza allargarsi.
  Prima la distanza passava da 1,3 a 1,55 e poi a 1, e la penna poteva portare la macchina fino a 70 px oltre il bordo: si vedeva
  il tavolo. Con la macchina ferma sul bordo, l'ultimo tratto del viaggio sale lungo il lato sinistro del quadro e passava sotto
  il contatore delle tappe: **contatore e targhetta sono passati in basso a destra** (`TARGA`), dove la carta resta sgombra per
  tutta la scena.
- **4. Il brano sul menu** (`trailer/audio.ts`). È una regressione della 1.43.0. Quando il tempo passa la fine del brano, la coda
  del titolo deve partire solo se ci si è arrivati con un salto (Esc, il ritorno dalla partita, l'audio acceso dal menu). La
  condizione «il fotogramma prima era già oltre la fine» valeva anche per il secondo fotogramma dopo la fine naturale: il brano
  ripartiva da 81,4 s proprio mentre compariva il menu. Ora, se ci si arriva camminando, il menu resta in silenzio. In più, un
  brano finito non si rilancia da sé (`play()` lo farebbe ripartire dall'inizio), se non dopo un salto voluto («Rivedi il
  trailer»).
- **5. La firma** (`components/FirmaAutore.tsx`, nuovo). Sotto il titolo, al posto delle due righe «un esperimento in favella 1»
  e «un gioco di Simone Pizzi», c'è ora la firma delle immagini promozionali: «un gioco in **FAVELLA1** di Simone Pizzi», Lora
  corsivo con FAVELLA1 in Sora 700, più piccolo, appena spaziato e più caldo, come in `locandine/main.ts`. Compare a 84,3 s e
  resta sul menu d'avvio. **La stessa firma è nella sequenza finale** (`SequenzaFinale.tsx`), dove il titolo aveva le stesse due
  righe.
- Per le prove: una voce in più in `.claude/launch.json` (locale, fuori da git), `viaggiatore-produzione`, che serve la
  costruzione di produzione sulla porta 5210 con `vite preview`.

## Decisioni
- **La distanza fissa della mappa è 1,55** — perché: è quella che la scena teneva dal 36° al 46° secondo, cioè l'aspetto che Simone
  ha visto per quasi tutta la mappa. Scelta mia, da confermare.
- **Il contatore delle tappe in basso a destra** — perché: con la macchina ferma, a sinistra copriva il viaggio fra Il Paese e
  Le Colline. Scelta mia, da confermare.
- **La firma anche nei titoli di coda** — perché: è lo stesso sottotitolo sotto lo stesso titolo; lasciarlo diverso avrebbe
  fatto due firme. Scelta mia, da confermare.
- **In inglese: «a FAVELLA1 game by Simone Pizzi»** — perché: «a game in FAVELLA1» suona tradotto. Le locandine sono solo in
  italiano, quindi non c'era un modello da seguire. Da confermare.
- **Il sottotitolo non è detto**: Enzo legge soltanto «Il Viaggiatore.» (`doppiaggio/trailer.json`, frase `titolo`). È testo
  d'interfaccia: il doppiaggio non cambia.

## Verifiche
- Le prove nel browser integrato, sulla versione di produzione e su quella di sviluppo. La luce dei primi fotogrammi (sopra). Il
  brano lasciato finire da solo: `t` del brano fermo a 87,19 dalla fine in poi, nessuna ripartenza. Esc a metà trailer: la coda
  parte (brano a 82,89 dopo un secondo e mezzo). «Rivedi il trailer» dopo una fine naturale: il brano riparte da 0 e il tempo
  non torna mai indietro. Le schermate a 5,6 s e 8,8 s (la lettera, poi col biglietto), a 34,4, 36,2, 37,5, 41,5, 45,2 e 48 s
  (la mappa: nessun bordo vuoto), a 87,5 s e sul menu (la firma).
- `tsc --noEmit` ed ESLint puliti.
- L'autoverifica del pacchetto (`node prepara.mjs`, `npm run autoverifica` in `desktop/`): **superata**, «trailer: 10919
  fotogrammi disegnati, nessuno fallito, le dieci tavole al loro posto».
- I collaudi della CI in locale, tutti verdi: versioni, `desktop/prove.cjs` (21 prove), compilazione, `finali.py`, `mirate.py`,
  `salvataggi.py -n 16`, `scorte.py`, `interfaccia.py`, `fili.py`, `giocate.py`, `verosimili.py --controlla`, `conferme.py`,
  `testo.py`, le quattro prove Node (opzioni, posti, trofei, finale: 15 prove), `pulsanti.py`, `mappa.py` (12.315 controlli, 0
  falliti), `trofei.py`, `musica.py`, **`doppiaggio.py` TUTTO OK** (878 parti; la voce del trailer: 28 frasi al loro posto) e
  `traduzione.py`.

## Questioni aperte
- Simone deve guardare il trailer corretto nel gioco desktop e dire se le quattro scelte mie (sopra) vanno bene.
- Niente è rilasciato: le correzioni stanno in «Non rilasciato» del CHANGELOG. Rilasciare lo decide Simone.
