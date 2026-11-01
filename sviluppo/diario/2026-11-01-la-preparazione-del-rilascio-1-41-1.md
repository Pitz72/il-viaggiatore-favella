---
data: 2026-11-01
ora: "15:36"
titolo: "La preparazione del rilascio 1.41.1"
tipo: sessione
versione: 1.41.1
---

# La preparazione del rilascio 1.41.1

## In breve
La 1.41.1 è pronta da rilasciare: versione, pacchetti e CHANGELOG portati alla 1.41.1 con lo strumento, collaudi verdi. Il workflow «Rilascio» non è stato lanciato: si lancia solo su ordine di Simone.

## Contesto
Dopo [i rimedi della revisione del codice](2026-11-01-i-rimedi-della-revisione-del-codice.md), alla domanda «Preparo il rilascio 1.41.1?» Simone ha risposto «Sì, preparalo». È una patch (`fix` → PATCH, `sviluppo/VERSIONI.md`): niente cambia nei `.fav`, nelle impronte né nel formato dei salvataggi.

## Lavoro fatto
- `node strumenti/versione.mjs prepara patch`: 1.41.0 → 1.41.1 in `versione.json`, `app/package.json`, `desktop/package.json` e nei due lockfile; nel CHANGELOG la sezione «Non rilasciato» è diventata «[1.41.1] - 2026-11-01» (le note della release), con una «Non rilasciato» nuova e vuota sopra.

## Decisioni
- **Preparare senza lanciare** — perché «preparalo» è il primo passo e il rilascio resta una scelta manuale di Simone (Actions → Rilascio → Run workflow), un passo per volta.

## Verifiche
- `node strumenti/versione.mjs verifica --rilascio`: versioni coerenti (gioco 1.41.1, motore 1.5.0, formato 1) e CHANGELOG pronto; il tag `v1.41.1` non esiste (dopo `git fetch --tags`).
- `finali.py` TUTTO OK, `mirate.py` TUTTE OK, `salvataggi.py -n 40` (40 partite, 54 caricamenti, le domande e RICOMINCIA), `collaudo/doppiaggio.py` TUTTO OK (28,4 MB), `desktop/prove.cjs` 21 prove, ESLint e `tsc` puliti. Il resto del collaudo, la build e l'autoverifica sono quelli di un'ora fa, sul codice che da allora ha cambiato solo il numero di versione; il workflow «Rilascio» li rifà tutti.

## Questioni aperte
- **Lanciare il workflow «Rilascio»** (Actions → Rilascio → Run workflow, su `main`): lo decide Simone. È il primo con il nuovo `rilascio.yml` (permessi stretti, collaudo condiviso con 40 partite).
