---
data: 2026-10-07
ora: "01:08"
titolo: "Le chiusure raccolgono il viaggio, e chi hai incontrato"
tipo: sessione
versione: 1.12.0
---

# Le chiusure raccolgono il viaggio, e chi hai incontrato

## In breve
Le due rifiniture che restavano alla ramificazione, e la chiusura del gioco: le sei chiusure alla soglia raccolgono il viaggio con un capoverso di righe di cose, e a lato dello schermo la fiducia diventa «chi hai incontrato», con ciò che hai fatto a ciascuno. Il gioco è concluso con la 1.12.0.

## Contesto
La verifica del gioco ha trovato il progetto di ramificazione già in gran parte realizzato (dalla 1.5.0 alla 1.10.0) e due rifiniture ancora aperte in `06-ramificazione.md` §8: citare il viaggio nelle chiusure, e mostrare «che cosa hai fatto a chi» accanto alle fiducie. L'autore ha chiesto di farle, di ricostruire e di dichiarare il gioco concluso. Un'eco di Imma alla soglia era già stata scartata, e resta fuori.

## Lavoro fatto
- **Le chiusure** (`z7-guado.fav`): in ciascuna delle sei, dopo la scena, un capoverso di testo condizionale (`[se …]…[fine]`): nove fatti nell'ordine della strada (Saverio e il cibo, il cane della serra, la pompa col tuo filtro, il bluff a Vito, Vito a terra, Imma sfamata, l'acqua a Rosaria, Pasquale curato, la fede venduta a Ciro), preceduti da «Dietro di te, la strada.» solo se ce n'è almeno uno. Nessuna variabile nuova; i messaggi «FINALE —» e le condizioni che scelgono la chiusura non cambiano.
- **«Chi hai incontrato»** (`ponte.py`, `testo.ts`, `ViaggiatorePlayer.tsx`, `gioco.css`): il ponte espone `gesti` (dieci, dalla tabella `_GESTI`), l'interfaccia ha la riga di ciascuno (`GESTI`) e li disegna sotto il nome e le barrette; Imma e Pasquale, che non hanno barrette, compaiono quando hanno un gesto. La sezione «fiducia» si chiama ora «chi hai incontrato».
- **La mappa narrativa** (`mappa-narrativa.py`): ora legge anche le condizioni scritte dentro i testi, e le conseguenze a distanza passano da 9 a 13.
- **I documenti**: `06-ramificazione.md` (§3.9, §3.10, le decisioni 9–11, l'impatto della 1.12.0, §8 chiuso); `PROSSIMI-PASSI.md` diventa archivio; il README ha il banner «concluso»; `collaudo/LEGGIMI.md`.
- **La versione**: 1.12.0 (minor: l'impronta dei salvataggi cambia).

## Decisioni
- **Un capoverso solo, uguale nelle sei chiusure, dopo la scena** — perché le immagini finali restano intatte e i fatti non dipendono dalla via per cui si arriva alla soglia: il sangue e il dono stanno uno accanto all'altro, e non si cancellano.
- **Righe di cose, riprese da frasi già scritte** — perché le conseguenze si mostrano e non si spiegano: ogni riga riecheggia la scena che l'aveva prodotta (la febbre rotta e l'orgoglio di Pasquale, il filtro legato alla pompa, la faccia che Vito si fissa per ricordarsela).
- **Gesti, non conti** — perché la soglia della generosità resta nascosta (§3.2): un gesto dice che cosa hai fatto, non quanto manca.
- **Nessuna riga per il cane sviato, per Vito pagato, per Onofrio e per Peppe** — perché non lasciano un fatto solo e chiaro, o le chiusure ne parlano già.
- **L'eco di Imma alla soglia non si fa** — perché Imma vive in paese: un'eco ad Acquamorta sarebbe forzata.

## Verifiche
Gli undici collaudi, tutti con codice 0: `finali.py`, `mirate.py`, `salvataggi.py`, `esploratore.py` (100 partite a caso, 15916 comandi, nessuna anomalia), `scorte.py`, `interfaccia.py` (12 prove nuove: i gesti), `fili.py` (20 prove nuove: le chiusure), `giocate.py`, `testo.py` (3 prove nuove), `conferme.py` (95 scelte), `pulsanti.py`. `tsc` pulito e build dell'app riuscita. Nel browser col motore dentro Pyodide: il pannello «chi hai incontrato» mostra Saverio e Iole con la loro riga in corsivo sotto le barrette.

## Questioni aperte
- Nessuna. Il gioco è concluso.
