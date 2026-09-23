---
data: 2026-09-23
ora: "11:53"
titolo: "Primo rilascio: 1.0.0"
tipo: sessione
versione: 1.0.0
---

# Primo rilascio: 1.0.0

## In breve
Pubblicata la 1.0.0: installer e portatile per Windows, AppImage e .deb per Linux.

## Contesto
Prima release pubblica, lanciata a mano col workflow «Rilascio», come prevedono le regole delle versioni.

## Lavoro fatto
- `node strumenti/versione.mjs prepara 1.0.0`: la sezione «Non rilasciato» del CHANGELOG è diventata `[1.0.0] - 2026-09-23`;
- commit `chore(versioni): 1.0.0`, push, workflow «Rilascio» avviato a mano;
- release v1.0.0 con sette file: i due eseguibili Windows, AppImage, .deb, blockmap, `latest.yml`, `latest-linux.yml`.

## Decisioni
- **La prima versione è la 1.0.0 e non una beta** — perché: il gioco è completo, vincibile in tutti i finali e collaudato; le versioni di prova servono per i cambiamenti successivi.

## Verifiche
Il workflow ha rifatto versioni, CHANGELOG, collaudo completo (40 partite di salvataggi) e l'autoverifica dei pacchetti su Windows e Linux. `latest.yml` e `latest-linux.yml` sono raggiungibili agli indirizzi pubblici che usa l'aggiornamento automatico.

## Questioni aperte
- l'aggiornamento automatico si potrà vedere all'opera solo con la prossima versione;
- gli eseguibili non sono firmati: SmartScreen chiede conferma al primo avvio.
