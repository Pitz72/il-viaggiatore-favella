---
data: 2026-09-23
ora: "07:00"
titolo: "I salvataggi sono sequenze di comandi verificate"
tipo: decisione
versione: 1.0.0
---

# I salvataggi sono sequenze di comandi verificate

## In breve
Salvare la sequenza effettiva dei comandi e un'impronta dello stato, e rigiocarla al caricamento.

## Contesto
Servivano salvataggi reali e precisi. Lo stato del mondo è fatto di oggetti Python del motore.

## Lavoro fatto
- `app/src/lib/ponte.py` tiene la sequenza effettiva: ANNULLA toglie i comandi del turno disfatto, ANCORA si registra col comando che ripete;
- al caricamento la testa della sequenza si rigioca senza istantanee, gli ultimi 40 comandi con le istantanee: ANNULLA funziona anche dopo;
- impronta SHA-256 dello stato (luogo, turno, variabili, oggetti, demoni, generatore casuale), confrontata al caricamento;
- file `.viaggiatore` in JSON leggibile; sei posti più l'automatico; scrittura atomica con copia di riserva.

## Decisioni
- **Niente pickle** — perché: fragile tra versioni e pericoloso con un file ricevuto da altri.
- **Rigiocare, non fotografare** — perché: il motore è deterministico, quindi la sequenza *è* lo stato; e un salvataggio sopravvive agli aggiornamenti del gioco.
- **«Ultimo comando» salvato a parte** — perché: è stato di sessione del motore, e dopo un ANNULLA può essere proprio il comando annullato.

## Verifiche
`collaudo/salvataggi.py`: 40 partite (metà lunghe, su percorsi veri), 56 salvataggi ricaricati identici, 672 risposte confrontate dopo il caricamento; sequenza più lunga 166 comandi, caricamento più lento 0,6 s. Tre difetti trovati e corretti durante la scrittura del collaudo (cura fuori sequenza nel test, ANCORA, ANNULLA dopo il caricamento).

## Questioni aperte
- nessuna.
