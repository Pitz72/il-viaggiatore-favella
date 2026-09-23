---
data: 2026-09-23
ora: "13:38"
titolo: "Il motore passa alla 1.2.0"
tipo: sessione
versione: 1.1.0
---

# Il motore passa alla 1.2.0

## In breve
Il gioco adotta FAVELLA 1.2.0, la prima versione del motore rilasciata dopo la
1.0.1: dentro ci sono il posto iniziale nato qui, SALVA/CARICA, il collaudo
dinamico e i sinonimi dei verbi d'autore, tutti portati dal gioco al motore.

## Contesto
Il gioco girava su una copia del motore 1.1.0 dichiarata «in anteprima»: nel
repository di FAVELLA la 1.1.0 non era mai stata rilasciata. Nel frattempo il
motore ha ripreso quattro cose imparate qui (i salvataggi di `ponte.py`, i
collaudi `finali.py` ed `esploratore.py`, i sinonimi per `getta`, l'avviso sulle
scorte) ed è uscito come 1.2.0, con release GitHub e installer.

## Lavoro fatto
- Ricopiati in `motore/` gli otto file del motore 1.2.0: ai sette di prima si
  aggiunge `esploratore.py`, che `favella.py` ora importa.
- `app/src/lib/ponte.py`: «salva» e «carica» digitati non arrivano più al
  motore. Rispondono con un rimando a F5 / F9 e al taccuino.
- `motore/LEGGIMI.md` senza più la nota «in anteprima».

## Decisioni
- **Un solo sistema di salvataggi nel gioco** — perché: dalla 1.2.0 il motore
  ha i suoi comandi SALVA/CARICA con un archivio proprio (`localStorage` sotto
  Pyodide). Lasciarli passare avrebbe dato al giocatore due salvataggi paralleli
  e avrebbe messo «salva» nella sequenza registrata dal ponte, che al
  caricamento l'avrebbe rigiocato. Il ponte li intercetta prima del motore:
  infrastruttura del gioco, il motore non cambia.
- **Versione 1.1.0 del gioco** — perché: `VERSIONI.md` §2, un motore *minor*
  nuovo è un MINOR del gioco. I salvataggi della 1.0.0 cambiano impronta
  d'avventura (c'è dentro la versione del motore): si rigiocano e il gioco
  avvisa che la partita è stata ricostruita. `formatoSalvataggi` resta 1.

## Verifiche
- `collaudo/finali.py`: 9/9 finali dichiarati raggiunti, uscita 0.
- `collaudo/mirate.py`: 8 situazioni, tutte OK.
- `collaudo/salvataggi.py`: 40 partite, 57 salvataggi ricaricati con impronta
  identica e fino a 684 risposte confrontate dopo il caricamento; 54 s.
- `favella.py compila` e `collaudo` dal motore nuovo: nessun avviso, «VINCIBILE».
- `npm run build` in `app/`: pulito.

## Questioni aperte
- Un salvataggio della 1.0.0 in cui il giocatore aveva digitato «salva» (allora
  «Non capisco questo verbo.», con un turno consumato) ora si rigioca senza quel
  turno: il gioco lo segnala come partita ricostruita. Caso raro, accettato.
