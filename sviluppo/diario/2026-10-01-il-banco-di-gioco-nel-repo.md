---
data: 2026-10-01
ora: "04:27"
titolo: "Il banco di gioco nel repo"
tipo: sessione
versione: 1.6.1
---

# Il banco di gioco nel repo

## In breve
Il banco con cui si sono giocate le tre partite a mano stava nella cartella temporanea di una sessione ed è andato perso. Ora è `strumenti/gioca.py`: si gioca a mano da un file di comandi e si misura l'equilibrio su più semi.

## Contesto
Le tre partite del 1° ottobre hanno trovato più cose di tutti i collaudi messi insieme, ma lo strumento che le rendeva possibili non era nel repo. Senza, la prossima volta che si cambia la storia («giocare davvero le partite», regola del progetto) bisognerebbe riscriverlo.

## Lavoro fatto
- `strumenti/gioca.py`, sul modello di `collaudo/partita.py` e di `app/src/lib/ponte.py`. A differenza di `partita.py` pilota il **ponte vero** (`fav_boot`, `fav_step`, `fav_stato`, `fav_azioni`), quindi vede ciò che vede l'app: «mangia» e «bere» soli completati, le azioni offerte ai pulsanti.
- **Giocare a mano**: un file di comandi (uno per riga, `#` per i commenti, `@B_cavallo` per includere un percorso, `:scena` per guardare la scena a quel punto). Mostra gli ultimi N turni come li vede il giocatore, con sotto ogni risposta `[turno · luogo · vita sete fame · acqua cibo · sangue generosità]`; in fondo uscite, presenze, bisaccia con la capienza, azioni offerte, riepilogo. Il diario di tutta la partita va in `collaudo/esiti/gioca-diario.md` (non versionata).
- **Misurare l'equilibrio**: `--pilota`, a soglie, su più semi (`-s SETE,FAME` ripetibile, `-p` un percorso o un file). Per ogni modo di giocare: quante partite arrivano, vita minima (media e peggiore), vita finale, cibo minimo, turni a cibo 0, turni da feriti, generosità, sangue. `--dettaglio` dà le scorte luogo per luogo: dove si ha paura.
- `strumenti/LEGGIMI.md` (nuovo) e una nota in `collaudo/LEGGIMI.md`.
- `collaudo/giocate.py`: due prove di coerenza (il banco, sullo stesso percorso e col seme 1, dà la stessa vita minima del pilota di `finali.py`; la scena ha uscite, presenze, bisaccia, azioni). Sono in CI con il resto di `giocate.py`.

## Decisioni
- **Il caso lo sceglie il banco, il ponte no** — perché il ponte ha il seme fisso della compilazione, e per misurare l'equilibrio servono più semi. Si sostituisce `ponte._mondo.rng` dopo l'avvio, come fa `Partita(seme=…)`.
- **Il pilota compila una volta sola** — perché compilare costa un secondo e le partite sono decine: il ponte riceve una copia profonda del mondo compilato (`compila_mondo` sostituito nel modulo del ponte, solo nel pilota).
- **Il banco non beve né mangia da solo quando si gioca a mano** — perché è lo scopo: se chi scrive il file non lo fa, la partita lo sconta. Lo fa solo il pilota, alle soglie dichiarate.
- **Nessuna versione nuova** — perché non cambia né il gioco né l'app né i salvataggi: è uno strumento di sviluppo. La versione si muove con la prossima modifica alla storia.

## Verifiche
`giocate.py` 34 prove (le 32 di prima più 2), tutte verdi. Il pilota dà, su B_cavallo e 6 semi, lo stesso risultato del pilota di `collaudo/finali.py`: vita minima 10,0 agli avvisi (6, 7) e 5,0 per chi beve solo quando fa male (9, 11). Dodici semi, quattro modi: 12/12 ovunque, come nella tabella del diario precedente.

## Questioni aperte
- Il pilota gioca i sei percorsi scritti a mano (`percorsi.py`), non una partita libera: misura l'equilibrio lungo quelle strade, non in un'esplorazione. Per le variazioni (un'altra via al guado, un'altra scelta di Peppe) basta un file di comandi.
