---
data: 2026-11-01
ora: "14:50"
titolo: "I rimedi della revisione del codice"
tipo: sessione
versione: 1.41.0
---

# I rimedi della revisione del codice

## In breve
Applicati tutti i rimedi della [revisione totale del codice](2026-11-01-la-revisione-totale-del-codice.md): la domanda del motore che risorgeva dopo salva e carica, il trofeo che si poteva perdere, Electron 44.10.1, il workflow «Rilascio» con i permessi stretti e lo stesso collaudo della CI, ESLint per i hook React e le rifiniture minori. Niente rilascio: le modifiche stanno in «Non rilasciato» del CHANGELOG e il rilascio lo decide Simone.

## Contesto
Alla domanda «Applico i rimedi, partendo dal ponte dei salvataggi?» Simone ha risposto «Sì, tutti». Nessun testo della storia né del doppiaggio è stato toccato: i testi cambiati sono **d'interfaccia** (quattro messaggi d'errore del desktop, ora anche in inglese).

## Lavoro fatto
- **La domanda che risorgeva** (`app/src/lib/ponte.py`). Un comando che il motore ha soltanto lasciato in sospeso con una domanda (e che quindi non ha messo nel suo registro `_registro_comandi`: non ha cambiato niente) vale ora insieme al comando che lo segue: ANNULLA li disfa tutti e due, e un ANNULLA che non disfa niente toglie dalla sequenza il comando della domanda (`_inizio_domanda`, `_domanda_in_sospeso`). Il criterio «non è nel registro del motore» è quello su cui il motore stesso regge il suo salvataggio.
- **RICOMINCIA confermato** (ponte e `ViaggiatorePlayer.tsx`): il ponte riconosce la ripartenza dal registro del motore, che diventa una lista nuova (`_ricominciata`), e fa ripartire la sequenza da zero (verificato prima: un mondo ricominciato ha la stessa impronta di uno appena compilato, e il seguito si gioca uguale). `fav_step` lo dice («ricominciata») e l'interfaccia apre un viaggio nuovo: sfide intatte, tempo da zero, nessuno incontrato. Le sequenze fino alla 1.41.0 con un «ricomincia» dentro si ricaricano uguali, anche nella testa che si rigioca senza istantanee.
- **Il runtime** (`favellaRuntime.ts`): le variabili che JavaScript passa a Python hanno il prefisso `_js_` e non toccano più quelle del ponte (`_entry`).
- **Il deposito dei trofei** (`lib/trofei.ts`): `vinci`, `azzeraTrofei` e `segnaLontano` partono da `attuale` dopo l'attesa.
- **Il taccuino** (`Taccuino.tsx`): un'azione alla volta (`inCorso`). **I salvataggi della pagina** (`lib/salvataggi.ts`): `dalDesktop` toglie il prefisso «Error invoking remote method…» dagli errori del processo principale.
- **Il desktop**: `desktop/servi.cjs` (nuovo) contiene il protocollo `app://` tolto da `main.cjs`, con gli intervalli giusti («bytes=-N» sono gli ultimi N byte) e un indirizzo guasto che dà 400 invece di far saltare il gestore; `salvataggi.cjs` riprova la rinomina su EPERM, EBUSY ed EACCES (quattro pause, 40–320 ms) e dice i suoi errori nella lingua di chi gioca; `main.cjs` anche il suo.
- **Il bus sonoro** (`lib/suono.ts`): dimentica i contesti audio chiusi a ogni contesto nuovo, non solo quando cambia un'opzione.
- **Le dipendenze**, con `npm update` (non `npm audit fix`): electron 44.4.4 → 44.10.1, vite 8.0.16 → 8.3.5, fast-uri 3.1.9, undici 6.29.1 e 7.30.1. Resta minimatch negli strumenti di electron-builder e di ESLint (avviso moderato, solo durante la costruzione; il rimedio proposto da npm sarebbe tornare a versioni vecchissime).
- **I workflow**: `.github/workflows/collaudo.yml` (nuovo, `workflow_call`) è l'unico elenco dei collaudi, con un passo in più per i tipi e ESLint; `ci.yml` lo richiama con 16 partite di salvataggi, `rilascio.yml` con 40. Permessi `contents: read` ovunque, `write` solo nel job della release; `persist-credentials: false` in ogni checkout.
- **ESLint** (`app/eslint.config.js`, nuovo; `npm run controlla`): `react-hooks/rules-of-hooks`, `react-hooks/exhaustive-deps`, `@typescript-eslint/no-explicit-any`, e i commenti di eccezione inutili sono un errore. Al primo giro 8 segnalazioni: 4 commenti che non servivano più (Avviso, Loghi, SequenzaFinale), l'avvio del motore che si fa una volta sola (eccezione dichiarata), la stampa della mappa in anticipo che non seguiva la lingua, e in `PaginaTrofei.tsx` un effetto e un `useMemo` inutile.
- **Le prove**: `collaudo/salvataggi.py` ha `domande()` (quattro casi di domande annullate, RICOMINCIA, una sequenza vecchia con RICOMINCIA nella testa), le domande nelle partite a caso e il confronto della domanda in sospeso dopo ogni caricamento; `app/scripts/trofei-prove.mjs` la gara fra tre cambi del deposito; `desktop/prove.cjs` la rinomina che riprova e il protocollo (21 prove).
- **I documenti**: CHANGELOG («Non rilasciato»), README e `CLAUDE.md` (il collaudo condiviso), `collaudo/LEGGIMI.md`.

## Decisioni
- **La correzione sta nel ponte, non nel motore** — perché il motore non si tocca qui; il registro del motore resta solo il criterio per riconoscere un comando che non ha cambiato niente.
- **Un «ricomincia» confermato è un viaggio nuovo anche per i trofei e per il tempo di gioco** — perché la sequenza riparte da zero e il punto più lontano del viaggio vecchio farebbe sembrare «tornare indietro» il caricamento di un salvataggio del nuovo. È una scelta fuori dal piano scritto nella revisione: si dichiara qui. Il diario a schermo invece resta com'era.
- **Nessun numero di versione nuovo** — perché la versione si prepara al rilascio (`sviluppo/VERSIONI.md`, §7), e il rilascio lo decide Simone; nei commenti del codice c'è «fino alla 1.41.0», non un numero futuro.
- **ESLint solo con le regole che il codice già nominava** — perché i commenti `eslint-disable` dicevano quali regole l'autore seguiva; lo stile non si impone.

## Verifiche
- **I 27 passi di `collaudo.yml`, in locale**: tutti verdi, compresi `tsc` ed ESLint (`npm run controlla`, 0 segnalazioni), `desktop/prove.cjs` (21 prove), `trofei-prove.mjs` (12), `salvataggi.py` (domande, RICOMINCIA, sequenza vecchia; 16 partite e 22 caricamenti nel giro della CI, 40 partite e 56 caricamenti a mano), `collaudo/doppiaggio.py` (TUTTO OK, 28,4 MB) e `traduzione.py`; esploratore corto 0 anomalie.
- **Le prove tornano indietro**: i casi fissi di `domande()` sul ponte della 1.41.0 falliscono («dopo il caricamento il motore aspetta 'ricomincia'»); la gara dei trofei sul `trofei.ts` della 1.41.0 fallisce («i due trofei ci sono, sul disco»).
- **Build e desktop**: `node prepara.mjs` riuscita; `electron . --autoverifica` con Electron 44.10.1 e cartelle di prova: **AUTOVERIFICA SUPERATA**.
- **Nel browser integrato** (server di sviluppo, poi chiuso), con l'interfaccia vera: «nord, aspetta, ricomincia, aspetta, annulla» → sequenza `["nord", "aspetta"]`; F5 e F9 → «Ripreso da…», nessuna domanda attiva (la frase resta solo come riga passata del diario). «ricomincia» e il pulsante «sì» → stazione, turno 0, sequenza vuota; un F5 dopo ha un viaggio nuovo (identificativo diverso, «indietro» da vero a falso, tempo da zero). Nessun errore in console.
- **`npm audit`**: app, 0 avvisi fra ciò che si distribuisce e minimatch (moderato) negli strumenti di ESLint; desktop, solo minimatch negli strumenti di electron-builder.
- Non verificato: il workflow «Rilascio» nuovo (si prova alla prima release); la CI del commit, guardata dopo la spinta.

## Questioni aperte
- **Il rilascio** di queste correzioni (sarebbe una patch, 1.41.1): lo decide Simone. Il nuovo `rilascio.yml` si prova davvero solo alla prima release; `collaudo.yml` lo prova la CI a ogni push.
- Le partite a caso di `salvataggi.py` non arrivano da sole alla sequenza esatta del difetto (domanda, turno, ANNULLA, salvataggio): la coprono i casi fissi di `domande()`, che sul ponte vecchio falliscono.
