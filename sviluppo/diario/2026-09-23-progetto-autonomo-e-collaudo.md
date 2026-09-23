---
data: 2026-09-23
ora: "05:00"
titolo: "Progetto autonomo e collaudo esplorativo"
tipo: sessione
versione: 1.0.0
---

# Progetto autonomo e collaudo esplorativo

## In breve
Il Viaggiatore diventa un progetto a sé col motore dentro; tre collaudi dinamici.

## Contesto
Il gioco viveva appoggiato al sito di FAVELLA. Si è deciso di trattarlo come un progetto indipendente.

## Lavoro fatto
- struttura: `prototipo/`, `motore/`, `app/`, `collaudo/`, `pre-produzione/`;
- `finali.py` (nove finali), `mirate.py` (otto situazioni), `esploratore.py` (cinque caratteri che sbagliano, esplorano e cercano i punti di rottura);
- pre-produzione riscritta in versione 1.0, allineata al gioco;
- musica originale `intro.mp3` nel trailer, usata anche come orologio.

## Decisioni
- **Il ponte dati dell'interfaccia resta nell'app** — perché: FAVELLA è il linguaggio per scrivere; l'infrastruttura che rende visibile un gioco non entra nel motore.
- **Il brano fa da orologio del trailer** — perché: immagini e musica non si separano nemmeno se il computer rallenta.

## Verifiche
Esploratore: 100 partite, 15.416 comandi, nessuna anomalia; 39/39 luoghi, 27/27 oggetti, 50/52 nodi di dialogo.

## Questioni aperte
- nessuna.
