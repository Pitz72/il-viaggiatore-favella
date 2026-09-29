---
data: 2026-09-30
ora: "00:10"
titolo: "Usare una cosa su un'altra, con i pulsanti"
tipo: sessione
versione: 1.3.0
---

# Usare una cosa su un'altra, con i pulsanti

## In breve
I pulsanti non propongono più ogni combinazione di cose: il motore dice quali «usa X su Y» la storia prevede qui e adesso, e solo quelle diventano pulsanti. Un collaudo nuovo gioca i sei finali senza tastiera.

## Contesto
«Usa…» proponeva ogni cosa della bisaccia su ogni cosa del luogo. Nei `.fav` le regole a due oggetti sono diciotto, in cinque combinazioni (pastiglie e pompa, chiave inglese e grata, medicine e Pasquale, lettera e Cosimo, biglietto e Cosimo): tutto il resto dava la risposta generica del motore, «non ha alcun effetto particolare». Si provava a caso, come nei vecchi punta-e-clicca.

## Lavoro fatto
- `ponte.py`: `fav_azioni` restituisce anche le `coppie`, lette dalle regole compilate: la prima cosa nella bisaccia, la seconda a portata, e la regola che scatterebbe adesso scelta come la sceglie il motore. Il comando è scritto come lo scriverebbe il giocatore («usa le pastiglie sulla pompa»).
- `azioni.ts`: le coppie tra le azioni del luogo; `vociDelMenu` (il menu di una cosa: niente più «usa su…» generico, solo le combinazioni previste, e per una persona o un animale anche i gesti d'autore come «attacca»); `comandiOfferti`, l'elenco di tutto ciò che si può fare con un tocco.
- `ViaggiatorePlayer.tsx`: tolto il selettore «Usa…» a due passi; i menu vengono da `vociDelMenu`.
- Collaudi: `interfaccia.py` (dieci prove sulle coppie: compaiono, si capiscono, spariscono); `pulsanti.py` nuovo, in CI e nel rilascio. Lo script Node che carica `azioni.ts` è diventato un modulo comune (`app/scripts/azioni-node.mjs`).
- Guida «come si gioca» e CHANGELOG.

## Decisioni
- **Si offrono le coppie che dicono qualcosa di adesso, non tutte quelle che hanno una regola** — perché la regola di ripiego («La grata è già aperta.», «È già detto tutto, qui.») vale sempre e non dice niente del momento. Conta una regola con condizione vera (anche un tentativo che non riesce, se l'autore l'ha scritto per quella situazione: il biglietto a Cosimo) o una senza condizione che cambia il mondo. Conseguenza voluta: alla pompa con le sole pastiglie il pulsante non c'è; compare quando si ha anche il filtro.
- **La prima cosa deve stare nella bisaccia** — perché «usa» vuol dire usare ciò che si porta; la regola «raccoglila, prima» resta per chi scrive.
- **Il collaudo usa la logica vera dell'interfaccia** (`azioni.ts` in Node, un processo per tutta la partita) — perché una copia in Python dei menu si sarebbe allontanata dall'originale senza che nessuno se ne accorgesse. I pochi pulsanti fissi dello schermo (uscite, guarda, aspetta) sono ripetuti in `comandiOfferti`, accanto ai menu che invece sono condivisi.
- **Nessuna modifica ai `.fav`** — l'impronta dei salvataggi non cambia.
- **Versione minor** — perché cambia il comportamento dell'interfaccia; in dubbio fra patch e minor, `VERSIONI.md` dice il più alto.

## Verifiche
`pulsanti.py`: i sei finali della storia raggiunti solo coi pulsanti, nessun passo senza pulsante, nessuna combinazione offerta con la risposta generica. Prova di mutazione: togliendo le coppie, il collaudo fallisce sui quattro «usa» dei percorsi. `interfaccia.py`, `finali.py` 9/9, `mirate.py` 8/8, `salvataggi.py` (16 partite, 21 ricaricamenti identici), `scorte.py`, `conferme.py` (44 scelte): tutti verdi. Nel browser: alla diga compaiono «Usa le pastiglie sulla pompa» fra le azioni, «usa sulla pompa» nel menu delle pastiglie, «usa le pastiglie» in quello della pompa; la conferma mostra lo scambio; dopo, la combinazione sparisce e compare «Attingi». Autoverifica superata, build pulita.

## Questioni aperte
- La combinazione giusta, quando compare, rivela la soluzione dell'enigma. È il compromesso scelto; se pesa, si può offrirla solo dopo che il testo l'ha suggerita (una parola in maiuscolo esaminata, per esempio).
- `inventario` e `stato` non hanno pulsante: le informazioni stanno a lato dello schermo, ma chi gioca solo coi pulsanti non ha il riepilogo a parole.
