---
data: 2026-10-30
ora: "21:14"
titolo: "La lingua inglese: la prima finestra, il racconto tradotto, il nome che resta"
tipo: sessione
versione: 1.39.0
---

# La lingua inglese: la prima finestra, il racconto tradotto, il nome che resta

## In breve
Il gioco si può giocare in inglese: una finestra prima dei loghi chiede la lingua del testo e la voce, e in inglese il
racconto intero, i nomi e l'interfaccia sono tradotti. Il motore e i `.fav` non cambiano: si traduce il testo che il motore
stampa, quando lo si mostra.

## Contesto
Simone ha annunciato la versione inglese con la 1.38.0 («solo pulsanti, con il doppiaggio rifatto»). Oggi ha precisato: non
si traduce il `.fav` né il linguaggio, ma la narrativa, le descrizioni e tutto il testo di gioco. All'avvio una finestra con
la lingua del testo (italiano, inglese) e del parlato (italiano, nessuna voce, lettore di schermo), con l'avviso che la voce
inglese arriverà presto; poi i loghi e il resto. Le scelte si cambiano in qualunque momento dalle opzioni; in inglese il
parser non si può attivare. E una domanda: tradotto il gioco, conviene cambiare il nome dell'applicazione?

## Lavoro fatto
- **Le opzioni** (`lib/opzioni.ts`): `lingua` (it, en), `linguaScelta` (la finestra ha avuto una risposta), la voce in tre modi
  (`recitata`, `nessuna`, `lettore`), `comandiEffettivi()` (in inglese sempre «pulsanti»: la scelta «parole» resta nel deposito
  e torna valida in italiano). «Ripristina» non tocca lingua e voce. Prove in `app/scripts/opzioni-node.mjs` (10, verdi).
- **La prima finestra** (`components/SceltaLingua.tsx`, fase «lingua» in `App.tsx`): due gruppi di pulsanti radio (frecce
  dentro un gruppo, Tab fra i gruppi, Invio continua da dove si è), i nomi dei gruppi nelle due lingue, il resto nella lingua
  scelta; il testo parte dalla lingua del sistema. Il primo gesto sblocca anche l'audio del browser per i loghi.
- **La lingua dell'interfaccia** (`lib/lingua.ts`): `tr(it, en)` accanto al codice, `Bilingue` per le tabelle, `lang` della
  pagina (il lettore di schermo pronuncia l'inglese in inglese), e sul desktop un canale «lingua» verso il processo
  principale (`desktop/lingua.cjs`) per i dialoghi di sistema.
- **Il racconto** (`gioco/traduci.ts`): il diario resta italiano (lo leggono la voce, i trofei, le tavole, i salvataggi) e
  ogni blocco si traduce quando si mostra. Si riconosce dal testo, come il doppiaggio: un testo intero; un testo coi segnaposto
  (il valore si riprende: un numero, un nome, una fila di frasi); una riga fatta di più testi (la fila più corta di testi noti,
  ai confini di frase: i posti delle cose, i fili del viaggio); le risposte del motore (una tabella di forme). Le parole in
  maiuscolo del testo inglese tornano al nome italiano quando si toccano; i comandi ripetuti nel diario, le etichette della
  plancia, le conferme e le dosi si traducono anch'esse.
- **I cataloghi** (`app/src/lingue/en/`, `strumenti/traduzione.py`): un file per zona, `{tipo, chi, dove, it, en}`, con le
  stesse stringhe della voce; `nomi.json` per luoghi, cose e persone; `LEGGIMI.md` con le regole, il registro e il glossario.
  494 testi e 85 nomi, circa 10.600 parole, tradotti in cinque lotti paralleli con la stessa guida, poi armonizzati.
- **L'interfaccia**: opzioni, pausa, taccuino, trofei (nomi, accenni, frasi), guida (in inglese parla solo dei pulsanti),
  mappa (i nomi inglesi entrano nella disposizione, così non si toccano), avvisi, trailer (le scritte sul quadro, il biglietto,
  le regole), avviso d'apertura, sequenza finale e titoli di coda.
- **Il collaudo** `collaudo/traduzione.py`, anche in CI.

## Decisioni
- **Tradurre all'uscita, non i `.fav`** — perché: è la richiesta di Simone, e così il gioco è uno solo; le partite, i
  salvataggi, la voce italiana e i trofei non sanno che lingua si legge, e la lingua cambia anche a partita aperta.
- **La finestra si apre finché nessuno risponde**, non a ogni avvio — perché: le scelte restano e si cambiano dalle opzioni;
  chi giocava prima la trova una volta, e scopre l'inglese.
- **Inglese britannico, seconda persona, presente** — perché: segue la prosa italiana; il glossario fissa le parole che
  tornano (satchel, jerrycan, the Drought, the main road).
- **La carta stampata della provincia resta italiana** («MARE», «SERRA ALTA»): è una carta stampata in Italia.
- **Il nome**: per adesso «Il Viaggiatore» in tutte e due le lingue (`TITOLO` in `lib/lingua.ts`). L'identità tecnica
  dell'applicazione (appId, productName, cartelle dei salvataggi, repository, pagina web) non cambia: cambiarla romperebbe
  aggiornamenti e salvataggi di chi ha già il gioco. La scelta del titolo inglese resta a Simone.

## Verifiche
- `collaudo/traduzione.py`: i cataloghi coincidono coi `.fav`, ogni testo tradotto, regole rispettate; lungo i percorsi 3.196
  righe stampate e 403 testi dei `.fav` si traducono interi, così 134 risposte di dialogo; un giocatore a caso coi soli
  pulsanti da ogni zona (1.651 righe) non incontra righe italiane. Ha trovato due risposte del motore che i percorsi non
  toccavano («Usare X con Y…», «Hai annullato l'ultimo turno»), aggiunte.
- Nel browser (Chromium, server di sviluppo): la finestra della lingua (scelte da tastiera, salvate, `lang` della pagina);
  una partita in inglese dalla stazione alla casa, il dialogo con Nunzio, la conferma del baratto (tasto Y), le opzioni con
  «avventura testuale» spenta; la stessa partita in italiano, identica a prima. La prova ha trovato due difetti della
  finestra (Invio su una scelta non andava avanti; Invio salvava le scelte iniziali), corretti.
- Gli altri collaudi toccati (mappa, pulsanti, testo, conferme, trofei, finale, musica, doppiaggio, desktop) verdi.

## Questioni aperte
- **Il titolo inglese** (vedi la consulenza a Simone): «Il Viaggiatore» resta finché non decide.
- **La voce inglese**: il doppiaggio è legato al testo italiano (le parti si ritrovano dall'italiano); una voce inglese vorrà
  le sue parti, dai cataloghi inglesi, con lo stesso giro di `strumenti/doppiaggio.py`.
- **La sfida «scrivendo ogni comando»** non si vince in inglese (niente parser): per la collezione intera serve l'italiano.
- **Da far leggere a un madrelingua**: la traduzione è coerente e controllata dalle macchine, non ancora da un orecchio inglese.
