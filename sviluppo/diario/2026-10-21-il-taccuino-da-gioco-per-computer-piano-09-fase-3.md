---
data: 2026-10-21
ora: "00:06"
titolo: "Il taccuino da gioco per computer (piano 09, fase 3)"
tipo: sessione
versione: 1.26.0
---

# Il taccuino da gioco per computer (piano 09, fase 3)

## In breve
Salvare e caricare adesso funziona come in un gioco per computer: salvataggi quanti se ne vuole e con un nome, una miniatura del paesaggio e il tempo di gioco, F5 e F9 rapidi, tre automatici a turno. È la terza fase del piano 09.

## Contesto
Simone (questionario S1–S5): «il sistema di save e load deve essere professionale, da app desktop non da web app sul browser». Il disco era già da desktop (`desktop/salvataggi.cjs`: scrittura atomica, copia di riserva, coda per file); era l'esperienza sopra a sapere di pagina web: sei caselle fisse e senza nome, F5 e F9 che aprivano un pannello, un solo automatico. Dopo la fase 2 Simone ha scritto: «menu e pausa ottimi, ho controllato anche i caricamenti. Molto belli. Andiamo prossima fase».

## Lavoro fatto
- `app/src/lib/posti.ts` (nuovo, senza import, provato in Node): i posti. `s-AAAAMMGG-HHMMSS-xxxx` per i salvataggi con nome, `rapido`, `automatico-1/2/3`, e quelli di prima (`automatico`, `posto-1…6` sul desktop, `auto`, `1…6` nel browser); il genere, il nome che vede chi gioca, la rotazione (dopo l'ultimo scritto viene il più vecchio), il tempo a parole brevi.
- `desktop/salvataggi.cjs`: l'elenco legge tutti i `.viaggiatore` della cartella che hanno il nome di un posto (niente `.bak`, `.tmp` o altro), con un'espressione che è la stessa della pagina (la prova la confronta); un canale nuovo, `salvataggi:leggi`, per F9.
- `app/src/lib/salvataggi.ts`: tre campi facoltativi (`nome`, `miniatura` in JPEG, `tempoMs`), ripuliti alla lettura (un valore guasto si toglie, il salvataggio resta buono); `elenco` dal più recente; `leggi`, `rinomina` (riscrive il file e lascia la data), `postoAutomatico` (l'indice dell'ultimo nel browser dell'app; se manca, dal più recente dei tre file). Il formato resta 1.
- `ViaggiatorePlayer.tsx`: il tempo di gioco (un secondo alla volta, solo a partita in corso, pausa chiusa, finestra in primo piano; si somma a quello del salvataggio da cui si riprende); la miniatura, un ritaglio 2,4:1 del paesaggio attorno al viandante a 432×180; F5 nel rapido con il cartiglio, F9 dal rapido con una domanda se c'è strada non salvata; gli automatici a turno; «— Ripreso da «…», salvato il … —» al posto di «Ripreso dal automatico».
- `app/src/gioco/Cartiglio.tsx` (nuovo): una riga breve in alto che compare e svanisce; servirà anche ai trofei.
- `app/src/gioco/Taccuino.tsx` riscritto e `taccuino.css`: largo e fisso come le opzioni (74 × 40 em), due colonne. A sinistra l'elenco con le miniature (in Salva «+ Nuovo salvataggio» e i salvataggi con nome; in Carica tutto), a destra il salvataggio scelto con la miniatura grande e le azioni. Tastiera: ↑ ↓ Inizio Fine PagSu PagGiù, Invio, Canc; due clic caricano; Esc mentre si scrive un nome torna all'elenco. Le conferme sono `Domanda`. I salvataggi di prima senza miniatura hanno un riquadro col colore e il nome della zona.
- `Trailer.tsx`: «Continua» dice nome, luogo e tempo di gioco (o il turno, per i salvataggi di prima).
- Prove: `app/scripts/posti-node.mjs` (6, in CI), quattro prove nuove in `desktop/prove.cjs` (11 in tutto) sui salvataggi su disco con un Electron finto e una cartella di prova. README e CHANGELOG.

## Decisioni
- **L'elenco è tutto per data, non «rapido e automatici prima»** come diceva il piano — perché: chi carica cerca quasi sempre l'ultimo; le etichette «rapido» e «automatico» bastano a distinguerli.
- **In Salva solo i salvataggi con nome** — perché: il rapido si scrive con F5 e gli automatici da soli; riscriverli a mano confonderebbe la rotazione.
- **Il nome sta dentro il file, il nome del file è l'istante** — perché: rinominare non sposta file, e due nomi uguali non si pestano.
- **La miniatura dentro il file** — perché: un salvataggio resta un file solo da copiare; a 432×180 pesa una decina di kB.
- **Nessuna conferma per «salva» su un posto nuovo; conferma per sovrascrivere, eliminare, caricare perdendo strada** — perché: si chiede solo quando si perde qualcosa.
- **Versione 1.26.0** — un taccuino nuovo e due tasti con un significato nuovo: MINOR.

## Verifiche
- I collaudi: `finali.py`, `mirate.py`, `salvataggi.py -n 16`, `scorte.py`, `interfaccia.py`, `fili.py`, `giocate.py`, `conferme.py` (95), `testo.py`, `pulsanti.py`, `doppiaggio.py` tutti ok; `desktop/prove.cjs` 11, `opzioni-node.mjs` 7, `posti-node.mjs` 6; `tsc` pulito; build ok.
- Nel browser integrato, sul gioco vero, col salvataggio automatico della 1.25 nel browser: il menu lo legge («Salvataggio automatico · Il bar · turno 3»); due cambi di luogo scrivono `automatico-1` e `automatico-2`, con la miniatura (8 kB) e il tempo; F5 mostra «Salvato · rapido» e scrive il rapido; il taccuino si apre su «Nuovo salvataggio» col nome proposto selezionato: scritto «Prima del pozzo» e Invio, il salvataggio compare scelto e col fuoco; in Carica i cinque salvataggi, dal più recente, con le etichette; rinomina con Esc che annulla senza chiudere, poi con Invio («La casa di nessuno», data invariata); Fine e Canc sul vecchio automatico, la domanda col fuoco su «sì», S, e la scelta passa al successivo; Invio carica l'automatico e il diario dice «— Ripreso da «Salvataggio automatico», salvato il 21 ott 2026, 00:01 —»; dopo una mossa F9 chiede conferma e S riprende dal rapido; il menu dice «La casa di nessuno · La casa · 1 min»; il taccuino del menu ha Salva spenta. Nessuna colonna trabocca (la foto del dettaglio ridotta a 22 em dopo la prima prova, che tagliava i pulsanti). Console senza errori.

## Questioni aperte
- La prova nel desktop vero, coi file in Documenti: con Simone.
- Un salvataggio fatto durante un dialogo funziona (si rigioca la sequenza), ma la miniatura è quella del luogo: va bene così.
