---
data: 2026-10-01
ora: "08:23"
titolo: "Usare una cosa su un'altra senza soluzioni sui pulsanti"
tipo: sessione
versione: 1.9.0
---

# Usare una cosa su un'altra senza soluzioni sui pulsanti

## In breve
L'autore ha risposto alla domanda sul pulsante «usa X su Y»: la combinazione di comandi sì, i suggerimenti espliciti no. Ora le coppie non si offrono più: si compongono, una cosa e poi l'altra, e il gioco non dice quali funzionano.

## Contesto
Dalla 1.3.0 il ponte elencava le coppie «usa X su Y» che la storia prevede qui e adesso (`_coppie`), e l'interfaccia le mostrava come pulsanti. Valeva come aiuto, ma un pulsante «Usa le pastiglie sulla pompa» che compare appena hai le pastiglie e il filtro è la soluzione scritta sul pulsante. La domanda era se lasciarlo, o offrirlo solo dopo che il testo l'avesse suggerito. La risposta: «la combinazione di comandi sì, ma non voglio i suggerimenti espliciti». Ho letto «combinazione» come il comporre le coppie e «suggerimenti» come l'elenco di quelle giuste. Se si intendeva altro (per esempio il pulsante che compare dopo che si è esaminata la cosa), la strada è aperta: il composer resta e si aggiunge il segnale.

## Lavoro fatto
- **Il ponte non elenca più le coppie** (`ponte.py`): via `_coppie` e la chiave `coppie` di `fav_azioni`. Restano i gesti d'autore e i bersagli (attingi, curati, attacca il cane…), che il testo dei luoghi suggerisce già a parole.
- **Il composer** (`azioni.ts`, `ViaggiatorePlayer.tsx`): toccando una cosa della bisaccia compare «usa su…», e un secondo passo elenca le cose del luogo e le altre della bisaccia; per una cosa del luogo, «usa su questo…» elenca la bisaccia. Nessuna è segnata. Il comando che parte è quello che si scriverebbe (`usa mappa su coltello`), con la sua conferma se costa.
- **`comandiOfferti`** include ogni coppia composta, così `pulsanti.py` gioca i dieci percorsi componendole.
- **«Come si gioca»** descrive il composer e non cita più una coppia che funziona (esempio neutro: «usa il coltello sulla mappa», che non fa niente).
- **Test**: `interfaccia.py` (il ponte non elenca coppie; `usa chiave inglese su grata` apre la grata; la pompa dà 8 d'acqua; una coppia sbagliata riceve «non ha alcun effetto particolare»), `pulsanti.py` (senza il controllo sulle coppie offerte), il banco di gioco (`gioca.py`) senza la voce.

## Decisioni
- **Comporre, non rimuovere** — perché togliere il pulsante e basta lascerebbe chi tocca solo i pulsanti senza modo di usare le cose: passaggi essenziali (la pompa, la grata, la lettera a Cosimo) passano da «usa X su Y».
- **Nessuna segnalazione delle coppie giuste, nemmeno dopo aver esaminato** — perché sarebbe un indizio automatico che l'autore non vuole; un segnale discreto resta una strada possibile, ma va deciso.
- **Una coppia sbagliata costa il turno, come scrivendo** — perché il motore la risponde così, e perché un tentativo gratis diventerebbe la ricerca esaustiva della soluzione.

## Verifiche
`interfaccia.py` tutte; `pulsanti.py` 10/10; `conferme.py` 92; `tsc` pulito. Nel browser: «La mappa» → «usa su…» → l'orologio, la foto, la tanica, il biglietto, il coltello (nessuno in evidenza) → «usa la mappa su il coltello»: «non ha alcun effetto particolare», nello stile di sistema.

## Questioni aperte
- Un solo tocco meno: la coppia più comune (la bisaccia contro una cosa del luogo) richiede due tocchi. Si può accorciare, per esempio con un secondo elenco già aperto, se pesa.
- Restano i pulsanti dei gesti d'autore (attacca, attingi, curati, raddrizza): se anche quelli sembrano troppo espliciti, si possono togliere allo stesso modo.
