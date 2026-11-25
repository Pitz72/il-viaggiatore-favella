---
data: 2026-11-25
ora: "16:47"
titolo: "Il trailer rimesso in piedi: il buio a 69 secondi, l'omino che pattinava, la carta vera del gioco"
tipo: sessione
versione: 1.43.0
---

# Il trailer rimesso in piedi: il buio a 69 secondi, l'omino che pattinava, la carta vera del gioco

## In breve
Corretti i tre difetti del trailer della 1.43.0 che Simone ha visto nel gioco installato: a 69,65 secondi lo schermo restava nero con musica e voce, l'omino saliva in diagonale e pattinava, la mappa non era quella del gioco. A fine sessione, su ordine di Simone («Sì, su main»), le correzioni sono su `main`; **niente è stato rilasciato**.

## Contesto
La veste pittorica della 1.43.0 (25 novembre 2026, mattina) l'aveva fatta un altro assistente, su incarico di Simone. Simone, nel pomeriggio: la presentazione non è male, ma «l'omino poteva essere dettagliato meglio e in alcune scene va in diagonale verso l'alto e sembra pattinare anziché camminare», e «verso la fine diventa tutto scuro e si sente solo la musica con il parlato». A lavoro in corso ha chiesto anche di verificare se la mappa del trailer fosse quella del gioco.

## Lavoro fatto
- **Il buio verso la fine** (`app/src/trailer/scene/regole.ts`, `app/src/components/Trailer.tsx`). All'attacco della seconda regola («L'acqua è la moneta», 69,64 s) la moneta nasce da raggio zero, e i due filetti interni si disegnavano a `raggio − 10` e `raggio − 20`: fra 69,646 e 69,670 s il raggio era negativo e `arc` falliva. L'errore usciva dal giro di `requestAnimationFrame`, che non si riprenotava più: restava l'ultimo quadro, quasi nero, mentre la musica e la voce proseguivano. Guardando il trailer a salti (`__trailer.vai`) non si vede, perché la finestra dura 24 millesimi; facendolo scorrere sì, sempre. Ora i filetti compaiono solo quando il disco li contiene, e in più l'orologio regge un fotogramma che fallisce (`disegnaProtetto`: azzera lo stato delle due tele e passa al fotogramma dopo).
- **La mappa** (`app/src/trailer/scene/mappa.ts`, riscritta). Quella della 1.43.0 era una pergamena inventata, con le sette tappe su una diagonale da sud-ovest a nord-est: il viaggio andava verso est, al contrario del gioco, e mancavano il mare, la Serra Alta, il Torrente Morto e il lago. Ora il trailer mostra la «Carta fisica della provincia» di partita: la stessa stampa (`gioco/stampa.ts`), le otto tappe nei loro posti (`gioco/foglio.ts`), gli stessi segni (anello tratteggiato e pieno, il disco rosso a mirino di «sei qui», le strade ciascuna col tratto della sua classe, il sale tratteggiato sul lago quando si arriva all'invaso). La penna va da Acquaviva verso ovest e poi su fino ad Acquamorta, per le strade vere, una tappa a ogni rintocco. La carta in partita la dà il motore, che durante il trailer non è avviato: il trailer ne legge una copia (`app/src/trailer/carta.json`), che riscrive `strumenti/carta-trailer.py` e che `collaudo/mappa.py` pretende uguale a quella del motore. Il contatore delle tappe è sceso in basso a sinistra, su una targhetta scura: in alto a sinistra, sulla carta vera, c'è Acquamorta.
- **La prospettiva** (`app/src/trailer/prospettiva.ts`, nuovo). Le tavole sono paesaggi fermi in prospettiva e la figura ci si muoveva su un tragitto disegnato a mano, più lento dei suoi passi: da lì la diagonale e il pattinare. Ogni tavola ha ora la sua macchina da presa (punto di fuga, orizzonte, altezza da terra, focale), misurata sul dipinto: la carreggiata dell'alba, larga sei metri e mezzo, vale 158 px al metro dove comincia la scena. Da lì si ricava dove posa i piedi chi sta a tanti metri di lato e di distanza, e quanto è alto. All'alba l'uomo era alto 176 px dove la strada ne vuole circa 300.
- **L'andatura e la figura** (`app/src/trailer/figura.ts`, nuovo). Il corpo avanza di `FALCATA` (0,74 stature) a ogni ciclo e il piede d'appoggio resta dov'è: tocca di tallone, si stende, si stacca girando sulla punta, vola; le ginocchia le trova la cinematica inversa. Lo scheletro ha tre dimensioni, così la stessa camminata si guarda di profilo e di spalle. La figura è dipinta come le tavole: contorno a china e tre toni piatti per materiale, tinti dalla luce di ogni scena. Cappello, bavero, mantellina, coperta arrotolata con la sua cinghia, martingala, tanica con la nervatura a X e la ruggine, scarponi coi lacci: è il Viaggiatore della locandina. Il fratello al guado è la stessa figura, a capo scoperto, cappotto scuro, il fucile tenuto basso.
- **Le quattro scene** (`scene/alba.ts`, `terra.ts`, `invaso.ts`, `guado.ts`). All'alba l'uomo è di spalle e si allontana lungo la strada, da 300 a 190 px in otto secondi; sul titolo è già lontano, e sul menu si ferma. Sulla terra crepata, sul sale e al guado è di profilo e attraversa il quadro sulla sua riga, alla velocità dei suoi passi; al guado si arresta sul colpo del brano, e i due fratelli hanno la stessa macchina da presa (chi è di là è più piccolo perché è più lontano). Il tallone tocca terra sul suono del passo. La polvere della terra si alza dove il piede ha toccato e lì resta.
- **Una prova che lo avrebbe trovato** (`app/src/autoverifica.ts`): l'autoverifica del pacchetto disegna ora il trailer a passi di 1/120 di secondo, dall'inizio al menu, e pretende che nessun fotogramma fallisca e che le dieci tavole ci siano.
- `strumenti/trailer-cattura.cjs` non arrivava più al trailer: in un profilo nuovo, dalla 1.40.0, c'è prima la finestra della lingua, che Esc non chiude. Ora preme anche «continua».
- Tolto da `trailer/viandante.ts` ciò che il trailer non usa più (`disegnaOmbra`, `disegnaFermo`, `velocitaSuolo`, `PASSO_CICLO`): quella figura resta al panorama e al ritratto di gioco, che non sono cambiati.

## Decisioni
- **Simone, a questionario**: di spalle all'alba e sul titolo, con «un sistema realistico di allontanamento rispetto al punto di vista» (è `prospettiva.ts`); più grande, in prospettiva; dipinto come le tavole; nel trailer la carta vera del gioco.
- **Tolti i pali del telegrafo dell'alba** (scelta mia, fuori piano) — perché: scorrevano verso chi guarda sopra una tavola ferma, come la figura. Se Simone li rivuole, vanno messi fermi, in prospettiva.
- **Sul titolo l'uomo è lontano e a sinistra della colonna del menu** (scelta mia) — perché: a mezza distanza finiva sotto «Continua il viaggio».
- **La rotta della mappa segue le strade vere** (scelta mia) — perché: è la mappa di chi quel viaggio l'ha fatto; i nomi dei 39 luoghi non compaiono, solo le otto tappe che la carta mostra dal primo giorno.
- **Nessun numero di versione nuovo e nessun rilascio** — perché: li decide Simone. È una correzione: sarebbe la 1.43.1.
- **Su `main`, senza le immagini promozionali** — perché: gli ho aperto il gioco desktop col trailer rifatto e ha risposto «Sì, su main» alla domanda sul trailer; le immagini promozionali rifatte in mattinata aspettano ancora la sua conferma e sono rimaste nel clone (`grafica/`, `app/src/locandine/`, `strumenti/locandine.cjs` e la riga di `strumenti/LEGGIMI.md` che le riguarda). I documenti del mattino (il diario del rilascio 1.43.0, il registro, i prossimi passi) sono andati su `main` con questo commit: dicevano ancora «1.43.0 preparata in locale».

## Verifiche
- Il difetto riprodotto prima di toccare il codice: `__trailer.vai(69.655)` → `IndexSizeError … The radius provided (-9.79962) is negative`; passata su 44.751 fotogrammi (1/500 s): un solo tratto guasto, 69,646–69,670 s.
- Dopo: 21.480 fotogrammi (1/240 s) senza errori; in tempo reale da 68,6 a 71,8 s l'orologio prosegue; un fotogramma costa 1,5–4,5 ms (mediana) a 2560 px.
- Autoverifica dentro Electron sul gioco costruito (`node prepara.mjs`, `npm run autoverifica`): **superata**, con «ok trailer: 10919 fotogrammi disegnati, nessuno fallito, le dieci tavole al loro posto (4,4 s)».
- `tsc --noEmit` ed `eslint` in `app/`: puliti. `collaudo/mappa.py`: 12.315 controlli, 0 falliti (coi due nuovi sulla carta del trailer). `collaudo/doppiaggio.py`: TUTTO OK (nessun testo detto è cambiato). `strumenti/versione.mjs verifica`, `desktop/prove.cjs`: verdi.
- Guardate una per una, ferme e ingrandite, le scene dell'alba, della terra, dell'invaso, del guado, della mappa, del titolo e il menu; nove catture a 1920×1080 con `strumenti/trailer-cattura.cjs`, sei mandate a Simone. L'audio non l'ho ascoltato.
- Prima del commit, l'albero da inviare provato da solo in una copia pulita (senza le immagini in attesa): tipi, ESLint, diario, registro, versioni e `collaudo/mappa.py`.

## Questioni aperte
- Il rilascio della correzione (1.43.1), che ordina Simone, ed eventuali ritocchi dopo che l'avrà guardato con calma (misura dell'uomo, colori, la mappa).
- Il difetto del buio sta nella 1.43.0 rilasciata, su Windows, su Linux e nel browser: finché non esce una correzione, chi guarda il trailer fino in fondo lo incontra (Esc porta al menu).
- Il sottotitolo sotto il titolo dice ancora «un esperimento in favella 1», mentre le immagini promozionali rifatte in mattinata dicono «un gioco in FAVELLA1 di Simone Pizzi»: non toccato.
- I video del trailer in `video/` (M03) sono del trailer di prima: si rifanno con `strumenti/esporta-trailer.cjs`, se servono.
