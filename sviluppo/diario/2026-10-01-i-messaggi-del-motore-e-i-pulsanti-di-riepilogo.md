---
data: 2026-10-01
ora: "07:49"
titolo: "I messaggi del motore e i pulsanti di riepilogo"
tipo: sessione
versione: 1.8.0
---

# I messaggi del motore e i pulsanti di riepilogo

## In breve
Dopo la 1.7.0 si è passati ai punti 8 e 4 dell'elenco. Il collaudo che doveva provare i messaggi del motore ha trovato anche un difetto della 1.7.0 appena rilasciata: l'interfaccia non conosceva Imma, e le sue battute finivano nella prosa. Corretto, con un collaudo nuovo che lo vede da solo.

## Contesto
Dai prossimi passi: alcuni messaggi del motore («Il tempo passa.», «Non senti nulla di particolare.», «Cosa vuoi esaminare?», la conferma di `esci`) comparivano nello stile della prosa invece che in quello di sistema; `inventario` e `stato` non avevano un pulsante. Prima, il punto 8: una nota per FAVELLA.

## Lavoro fatto
- **Nota a FAVELLA** (`landingpage/public/favella-engine/SYNC.md` di FAVELLA1, senza commit né pubblicazione). Quattro voci, ciascuna verificata sul motore: una mossa verso un'uscita che non c'è fa passare un turno (+1 contro +0 di un comando non capito); posare una cosa ristampa la stanza intera; rimappare un verbo del motore dà un avviso anche quando è voluto e dice «fa come 'colpisci'», cioè il verbo stesso, perché stampa il primo nome dell'azione di libreria; e, trovata durante il lavoro, `accendi su`, `apri su`, `chiudi su`, `mangia su` danno «[ERRORE CRITICO] … 'NoneType' object has no attribute 'proprieta'».
- **I messaggi del motore** (`app/src/gioco/testo.ts`): le domande («Cosa vuoi esaminare?», «Attacca che cosa?», «Con cosa vuoi usarla?»), il tempo e i sensi («Il tempo passa.», «Non senti nulla di particolare.», «Non succede nulla»), i rifiuti («Non si apre.», «Ce l'hai già.», «Nella mappa non ci puoi mettere niente.»), l'aiuto, il riepilogo di `stato`, i servizi (annulla, ancora, carica, «A presto!») e la conferma di `esci` stanno ora nello stile di sistema.
- **Imma** non era fra i `PERSONAGGI` dell'interfaccia: dalla 1.7.0 le sue battute comparivano come prosa del narratore. Aggiunta.
- **I pulsanti «inventario» e «stato»** accanto a «guarda» e «aspetta» (`ViaggiatorePlayer.tsx`, `comandiOfferti`). Visti nel browser: i due riepiloghi escono nello stile di sistema, «Il tempo passa.» pure.
- **La conferma di un dono di sole scorte** dice che cosa si dà: «Vuoi davvero dare 2 di cibo?» (prima «rinunciarci»). Con un oggetto che si perde, resta «rinunciarci».
- **`collaudo/testo.py`** (nuovo, in CI e nel rilascio). Prova ogni verbo del motore con sette generi di bersaglio (682 comandi): ogni risposta che non viene dalla storia deve stare nello stile di sistema. Poi nessuna delle 526 frasi dei `.fav` deve somigliare a un messaggio del motore. Infine ogni personaggio dichiarato dev'essere noto all'interfaccia. `pulsanti.py` non esenta più «inventario» e «stato».
- Documenti: CHANGELOG, `collaudo/LEGGIMI.md`, `PROSSIMI-PASSI.md`.

## Decisioni
- **Riconoscere dalla forma, non dagli eventi tipizzati** — perché nel motore 1.4.0 l'evento «testo» comprende insieme le descrizioni dell'autore e i messaggi della libreria: il tipo non li separa. Gli eventi aiuterebbero solo per «domanda» e «sistema», già coperti dalla forma. Il collaudo, che prova tutto il catalogo, rende l'elenco di forme meno fragile di quanto sembri.
- **Un collaudo che prova la storia contro l'elenco** — perché un'espressione troppo larga («Non si …», «Usare … effetto») potrebbe un giorno inghiottire una battuta d'autore. La prova 2 lo impedirebbe a ogni compilazione.
- **Versione minor (1.8.0)** — perché i due pulsanti sono una funzione nuova dell'app (`VERSIONI.md` §2); le correzioni vi viaggiano insieme.
- **Il pulsante «usa X su Y» non si tocca** — perché rivela la soluzione e la decisione è dell'autore. Resta da chiedere.

## Verifiche
`testo.py`: 10 prove (70 messaggi del motore riconosciuti, 682 comandi); sulla versione precedente di `testo.ts` fallisce 8 prove su 10 (e nomina Imma). `pulsanti.py` 10/10 con «inventario» e «stato»; `conferme.py` 92 scelte, con le due domande; `tsc` pulito. Visto nel browser: i due pulsanti, «Il tempo passa.», `stato` e `inventario` in stile di sistema.

## Questioni aperte
- **«Usa X su Y» rivela la soluzione**: il pulsante compare appena si ha la cosa giusta nel posto giusto. Si può offrirlo solo dopo che il testo l'ha suggerito (per esempio dopo `esamina` sulla cosa scritta in maiuscolo). Decisione dell'autore.
- Il motore stampa `[ERRORE CRITICO]` per `accendi su` e simili: l'interfaccia lo mostra in stile di sistema, ma il messaggio è quello del motore. Va corretto in FAVELLA, non qui.
