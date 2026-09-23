---
data: 2026-09-23
ora: "14:11"
titolo: "ANNULLA riporta indietro anche ANCORA"
tipo: sessione
versione: 1.1.1
---

# ANNULLA riporta indietro anche ANCORA

## In breve
Il motore passa alla 1.2.1: ANNULLA ora disfa anche la memoria di ANCORA. Era
una delle questioni lasciate aperte dal lavoro su questo gioco.

## Contesto
Fino alla 1.2.0 `ultimo_comando` stava fuori dalle istantanee di ANNULLA. Dopo
«prendi la mappa», «annulla», un «ancora» rifaceva proprio la presa appena
disfatta: il contrario di quello che il giocatore voleva. Il ponte lo sapeva e
salvava `ultimo` a parte proprio per questo.

## Lavoro fatto
- Ricopiati in `motore/` gli otto file del motore 1.2.1.
- `motore/LEGGIMI.md` aggiornato alla 1.2.1.

## Decisioni
- **PATCH del gioco, 1.1.1** — perché: `VERSIONI.md` §2, un motore *patch* è una
  correzione. I salvataggi della 1.1.0 restano validi: la sequenza salvata non
  contiene mai ANNULLA né ANCORA (sono già risolti), quindi si rigioca identica;
  cambia solo l'impronta d'avventura, e il gioco avvisa che la partita è stata
  ricostruita. Il campo `ultimo` del salvataggio resta utile e corretto.

## Verifiche
- `collaudo/finali.py`: uscita 0.
- `collaudo/mirate.py`: uscita 0.
- `collaudo/salvataggi.py`: 40 partite, 56 salvataggi ricaricati identici, fino
  a 672 risposte confrontate dopo il caricamento.

## Questioni aperte
- Nessuna.
