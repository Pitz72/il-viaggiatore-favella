---
data: 2026-09-23
ora: "03:00"
titolo: "Il posto iniziale degli oggetti entra nel motore"
tipo: decisione
versione: 1.0.0
---

# Il posto iniziale degli oggetti entra nel motore

## In breve
FAVELLA 1.1.0 aggiunge `Il posto della X è "…".`: la frase sparisce quando l'oggetto viene preso.

## Contesto
Gli oggetti scritti dentro la descrizione della stanza («Su un mobile, una MAPPA…») restavano descritti dopo la presa. Il motore aveva solo prosa statica e l'elenco «Puoi vedere qui».

## Lavoro fatto
- nuova frase del linguaggio (grammatica, strutture, interprete, test, spec §18, manuale);
- 23 oggetti tolti dalla prosa delle stanze e dati del loro posto.

## Decisioni
- **Nel motore, non nel gioco** — perché: è un bisogno di ogni autore (l'*initial appearance* di Inform), non un'esigenza di questa interfaccia.
- **Il posto sparisce alla prima rimozione, per sempre** — perché: una frase d'autore che descrive un oggetto spostato mentirebbe.
- **I posti di una stanza in un solo capoverso** — perché: più capoversi brevi spezzano la pagina; ogni frase va scritta autonoma.

## Verifiche
Suite del motore 694/694 (+13), pytest 319; sei percorsi e otto prove mirate invariati.

## Questioni aperte
- il motore 1.1.0 non è ancora rilasciato nel suo repository.
