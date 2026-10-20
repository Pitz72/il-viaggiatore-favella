---
data: 2026-10-20
ora: "08:04"
titolo: "I residui di chiusura: registro, data, stalli, firma e build"
tipo: sessione
versione: 1.16.1
---

# I residui di chiusura: registro, data, stalli, firma e build

## In breve
I sette residui lasciati dalla 1.16.0, uno per uno: il registro del desktop non scrive più due volte lo stesso errore; la data della build è il giorno locale; gli otto avvisi npm si lasciano (la correzione forzata peggiora); le firme e il numero dei personaggi li ha decisi Simone; il finale vinto e gli altri finali non hanno testi sotto 4,5:1; i due «stalli» non sono vicoli ciechi. L'esploratore, per strada, è diventato riproducibile e sa dire se uno stallo ha una strada. Esce la 1.16.1.

## Contesto
Dopo la 1.16.0 (pushata, non rilasciata) restavano sette punti. Ognuno si rilegge sul codice di oggi prima di toccarlo.

## Lavoro fatto
- **a) Eseguibili non firmati.** Opzioni presentate a Simone, con le condizioni di oggi: SignPath Foundation (gratis per progetti open source; licenza OSI per tutti i componenti, progetto già rilasciato e mantenuto, build in CI, MFA, pagina «Code signing policy», approvazione manuale a ogni firma; l'editore è SignPath Foundation); Azure Artifact Signing di Microsoft (circa 9,99 $/mese; per le organizzazioni in USA, Canada, UE e Regno Unito, per i privati solo USA e Canada); un certificato OV (150–300 $/anno, chiave su token o HSM dal 2023) e, dal 2024, anche l'EV costruisce la reputazione di SmartScreen col tempo; oppure lasciare com'è o disattivare l'aggiornamento automatico. **Simone: «lascia com'è».** Non si cambia niente (il README «Sicurezza» già lo dice, con il comando per verificare lo sha256).
- **b) Gli otto avvisi npm di `desktop/`.** Provati in una copia: `npm audit fix --force` scende a electron-builder 26.5.0 e porta a **9 avvisi, 8 alti e 1 critico** (la catena di `tar` in `@electron/rebuild`): peggio di prima. La 26.15.3 (la latest) e la 26.17.0 dipendono ancora da `@electron/get` 3 → `global-agent` → `roarr` → `sprintf-js` (nessuna versione di `sprintf-js` è corretta). Solo electron-builder `27.0.0-alpha.11` (usa `@electron/get` 5) dà 0 avvisi: costruisce l'installatore Windows e passa l'autoverifica (15 prove ok, sha512 di `latest.yml` uguale al file), ma scarica un altro NSIS (3.12 al posto del 3.0.4.1) e scrive un `latest.yml` più magro: una pre-release per un pacchetto che arriva a tutte le installazioni con l'aggiornamento automatico. **Simone: «No, lascia gli 8 avvisi».** Colpiscono solo gli strumenti di costruzione, non finiscono nel gioco; si ripresenta quando la 27 esce stabile.
- **c) La data della build** (`app/vite.config.ts`) usava `toISOString()`: ora `dataLocale()`, la stessa di `versione.mjs`. Nel bundle `data:\`2026-10-20\``.
- **d) Il registro doppio.** Dal desktop un errore finiva due volte nel registro: dal gestore `console-message` di `main.cjs` (la console) e dal canale `registro` (`annota` di `ConfineErrori`). Misurato in un Electron vero, con il preload vero e la pagina in sviluppo: errore in un timer, promessa rifiutata, promessa innocua (`NotAllowedError`) ed errore di disegno preso dal confine erano tutti **una volta in console e una nel canale**. Ora `ConfineErrori` chiama `preventDefault` su `error` e `unhandledrejection` (il browser non ripete «Uncaught…») e `createRoot(…, { onCaughtError: () => {} })` (React non ripete l'errore preso dal confine). Dopo: **0 in console, 1 nel canale** in tutti e quattro i casi; un `console.error` diretto resta nel registro una volta. Il gestore `console-message` resta (prende il resto: caricamenti falliti, avvisi di librerie, errori prima che il confine esista). Nel browser `annota` scrive una volta in console.
- **e) 13 o 14 personaggi.** Detto «vedilo dal codice»: i `.fav` dichiarano 14 personaggi (Nunzio, Saverio, Iole, Rocco, Vito, Imma, Rosaria, Concetta, Pasquale, Peppe, Ciro, Onofrio, Tore, Cosimo); il cane della serra è «una cosa». Vale 14: allineato il foglio dei tempi (il 13 era di prima di Imma, 1.7.0), e corretta una frase del piano 07 che diceva «14 = 13 più il cane».
- **f) Contrasti nei finali.** Scansione (colore del testo contro lo sfondo effettivo, con le opacità, i gradienti e il disegno del panorama campionato) in partita finita: il finale vinto («Sei tornato…», B_cavallo), la fine con le mani vuote (D_vuoto) e la morte per sete, a 1280×720; il vinto anche a 1024×768 e a 1920×1080. **Nessun testo sotto 4,5:1** (grandi sotto 3:1: nessuno); i minimi sono 4,77:1 («bevi» e «mangia» disabilitati a fine partita) e 5,01:1 (etichette delle scorte). La scansione ignora l'ombra del testo, come la precedente.
- **g) Gli «stalli».** L'esploratore, al giro completo (100 partite), segnala 5 stalli, tutti del carattere «turista» (protetto: non muore) con acqua 0, cibo 0 e la bisaccia quasi vuota, a z1 (casa e margine), z3, z5, z6. Giocati a mano con `Partita` dal punto di partenza di z1 (acqua 0, cibo 0, senza mappa): si riprende la mappa, si **lavora al bar** («Posso lavorare, per un po' d'acqua?»: +1 acqua e +2 fame, finché l'acqua è al massimo 2), si compra da mangiare («Hai qualcosa da mangiare?»: costa 1 acqua, dà 2 cibo), si mangia, si lavora ancora fino a 3 d'acqua e si esce a ovest: arriva a «il tratto» vivo (vita 10 con sete 4 e fame 5; vita 6 con sete 6 e fame 8). **Non sono vicoli ciechi**: sono giocatori a caso che non scoprono il lavoro al bar, che il margine suggerisce a chi tenta di uscire senza acqua.
- **L'esploratore.** Per giudicare gli stalli è diventato (1) **riproducibile**: lo stesso seme non dava le stesse partite perché la bisaccia è un insieme e il suo ordine cambia a ogni avvio di Python (con `PYTHONHASHSEED=0` sì); ora si scorre in ordine di nome; (2) **diagnostico**: per ogni stallo prova con le uscite, su una copia della partita (con sete, fame, vita rimesse a posto, acqua e cibo almeno 5 e 3, e raccogliendo ciò che si può prendere), dove si può ancora andare, e il rapporto lo scrive con lo stato in cui la partita è rimasta. Ai cinque stalli dà «la strada c'è» (da 15 a 37 luoghi raggiungibili; a z1 stima per difetto: ogni luogo si visita una volta sola).
- **Il banco del trailer** (fase 0 del piano 07): `strumenti/trailer-cattura.cjs`, `trailer-confronta.mjs`, `trailer-misura.cjs` e il preload deterministico. Vedi la voce del piano.

## Decisioni
- **Il registro si deduplica alla sorgente, non nel processo principale** — perché filtrare nel `console-message` avrebbe perso gli errori che il confine non vede (caricamenti falliti, errori prima del montaggio); sopprimere la segnalazione del browser dove la pagina ha già scritto la sua, con la sua limitazione (uno ogni 5 s, 200 righe), lascia una sola strada per ogni errore e conserva la rete di sicurezza.
- **Gli avvisi npm si lasciano** — perché l'unica correzione stabile (`--force`) è un passo indietro con avvisi peggiori, e l'unica senza avvisi è una pre-release del tool che costruisce l'aggiornamento di tutte le installazioni.
- **Il numero dei personaggi lo dice il codice** — perché Simone l'ha chiesto così, e il codice dice 14.
- **1.16.1, patch** — perché sono correzioni e strumenti, nessun contenuto nuovo (`sviluppo/VERSIONI.md`, §2).

## Verifiche
- `tsc --noEmit` pulito; `npm run build` ok (JS 477 kB, 160 kB gzip); `node desktop/prove.cjs` 7 prove; `node strumenti/prova-data.mjs` ok; autoverifica in Electron di sviluppo superata (15 prove).
- I dieci collaudi di `collaudo/` dopo le modifiche: finali 9/9, mirate, salvataggi, scorte, interfaccia, fili, giocate, testo, conferme, pulsanti: exit 0 tutti.
- Registro: in un Electron vero (preload e pagina veri) 4 casi su 4 da 2 righe a 1.
- Contrasti dei finali: 0 sotto 4,5:1 in 3 finali e 3 risoluzioni.
- Esploratore: lo stesso seme dà lo stesso numero di comandi in tre avvii di fila (1434 su `-n 3 -t 120`); prima 1357, 1374, 1372.

## Questioni aperte
- La verifica di FAVELLA 1 è nella sua voce; la risincronizzazione del sito aspetta il rilascio.
- Il taccuino non ascoltato con un lettore di schermo vero.
