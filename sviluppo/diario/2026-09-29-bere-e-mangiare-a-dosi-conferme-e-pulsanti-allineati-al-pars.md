---
data: 2026-09-29
ora: "19:52"
titolo: "Bere e mangiare a dosi, conferme e pulsanti allineati al parser"
tipo: sessione
versione: 1.2.0
---

# Bere e mangiare a dosi, conferme e pulsanti allineati al parser

## In breve
Bere e mangiare si scelgono da un pannello con le dosi; le scelte che costano chiedono conferma con il conto vero di ciò che si dà e si riceve; i pulsanti dicono le stesse parole del parser.

## Contesto
Chi ha provato il gioco ha fatto notare tre cose. «Bevi qualcosa» e «mangia qualcosa» sono poco intuitivi. Con i pulsanti accanto al campo dei comandi, alcune azioni e alcune cose andavano allineate a ciò che il parser capisce. E le scelte importanti (barattare acqua o cibo, dare via le medicine) non chiedevano conferma: una scelta sbagliata era brutale.

## Lavoro fatto
- `sistemi.fav`: bere e mangiare a dosi (`bevi un sorso`, `due sorsi`, `tre sorsi`; `mangia una porzione`, `due`, `tre`), con i sinonimi (`bere acqua`, `bevi 2`, `mangia cibo`…) e i verbi di più parole dichiarati. `mangia` e `bere` soli sono risolti dal ponte, non dal `.fav`.
- `ponte.py`: `fav_anteprima` (esegue il comando su una copia del mondo e dice cosa cambierebbe), `fav_azioni` (le parole d'autore che il luogo suggerisce), `fav_stato` con l'annulla e la domanda di conferma del motore in attesa; la bisaccia ha l'ordine della storia.
- Interfaccia (`app/src/gioco/`): `azioni.ts` (la politica delle conferme, le dosi con le previsioni, le azioni di contesto), `Conferma.tsx`, `PannelloScorta.tsx`; in `ViaggiatorePlayer.tsx` il pannello di bere e mangiare, «Usa…» a due passi, le parole in maiuscolo del testo che si toccano, ↶ annulla, i sì e no del motore.
- Collaudi nuovi: `scorte.py`, `interfaccia.py`, `conferme.py` (con `app/scripts/valuta-conferme.mjs`, che fa girare in Node la stessa politica del browser), aggiunti alla CI.

## Decisioni
- **L'anteprima esegue il comando su una copia del mondo** — perché il conto mostrato («sete 8 → 0, acqua 3 → 1») è per costruzione quello vero: le regole `Invece di`, i sinonimi e i demoni fanno parte dell'esecuzione; un modello parallelo delle regole prima o poi avrebbe mentito. Si esegue solo il comando, senza gli eventi di fine turno (che dipendono dal caso).
- **Conferma per costo, non per verbo** — perché parlare, chiedere, esaminare, muoversi non devono mai interrompere. Chiede conferma ciò che, secondo l'anteprima, toglie un oggetto, acqua, cibo o vita, o chiude la partita; in più i verbi violenti (`attacca`, `minaccia`) e una lista di svolte della storia. «No» è il pulsante di partenza.
- **`mangia` e `bere` soli stanno nel ponte** — perché il sinonimo `"mangia" è come "mangia qualcosa"` faceva consumare il cibo anche a `mangia <oggetto>`. La forma vecchia `mangia qualcosa` resta valida: è dentro i salvataggi già fatti.
- **Nessun altro sorgente d'avventura toccato** — perché anche un commento cambia l'impronta dell'avventura nei salvataggi.
- **I pulsanti compongono il comando come lo scriverebbe il giocatore** — perché nel diario compare lo stesso testo, e chi legge impara il parser mentre usa i pulsanti.

## Verifiche
`finali.py` 9/9; `mirate.py` 8/8; `salvataggi.py -n 16`: 16 partite, 20 salvataggi ricaricati e identici; `scorte.py` 6/6; `interfaccia.py` 30/30; `conferme.py`: 44 scelte passate in rassegna, tutte come previsto (le scelte che costano chiedono, le altre no). Autoverifica nel browser (Pyodide) superata, con l'anteprima che non tocca il mondo e le dosi.

## Questioni aperte
- I messaggi nuovi del motore (la conferma di `esci`, «Il tempo passa.») compaiono ancora nello stile della prosa invece che in quello di sistema (`testo.ts`).
- Le dichiarazioni doppie di `z2-piana.fav` («getta il cibo», «lancia cibo»…) si potrebbero semplificare con i sinonimi: è una modifica ai `.fav`, quindi cambierebbe l'impronta.
