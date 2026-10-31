---
data: 2026-10-31
ora: "21:41"
titolo: "Il doppiaggio inglese: il narratore in sei blocchi"
tipo: sessione
versione: 1.40.1
---

# Il doppiaggio inglese: il narratore in sei blocchi

## In breve
Simone ha chiesto i testi del narratore inglese pronti per Gemini 3.8 Flash TTS in AI Studio, come per l'italiano. Letta la documentazione, scritto `strumenti/doppiaggio-inglese.py` e preparati in `doppiaggio/en/` sei blocchi di narrazione (circa 9,5 minuti stimati l'uno), le scelte del giocatore e il trailer, con una tabella italiano ↔ inglese per controllare che in Enzo non finisca ciò che dicono Kira o i personaggi. Nessun audio ancora da parte mia: gli otto blocchi (sei di narrazione, le scelte, il trailer) sono stati consegnati a Simone uno per messaggio, in chat, e lui li genera in AI Studio.

## Contesto
La prima finestra del gioco (1.40.0) promette la voce recitata in inglese. In italiano il doppiaggio è fatto (diario del 20 ottobre); per l'inglese servono i testi del narratore, e Simone non può controllare a orecchio, in inglese, che le parti di Enzo siano solo sue: in italiano le 81 scelte del giocatore erano finite nel blocco di Kira e se ne accorse lui ascoltando. Chiesto anche: aggiornarsi sulla documentazione del servizio, e un codeblock per messaggio.

## Lavoro fatto
- **La documentazione**, letta sulle pagine ufficiali di Google: `doppiaggio/en/gemini-tts.md`. Ingresso 8.192 token, uscita 16.384; tag fra parentesi angolari e in inglese; stile corto; i profili lunghi sono, per Google, la causa più comune della voce che cambia; Voice design per voci persistenti. Nessuna contraddizione con ciò che si sapeva il 20 ottobre; il registro delle novità dà il 22 settembre per l'uscita (non il 23).
- **`strumenti/doppiaggio-inglese.py`**: per ogni testo del gioco prende la traduzione dal catalogo (per testo italiano: i cataloghi hanno 494 testi per 544 occorrenze), trasforma le virgolette inglesi in caporali e usa la stessa funzione dell'italiano (`parti_di_una_stringa`) con le stesse attribuzioni. La classe di ogni parte si eredita dall'italiano, perché le virgolette inglesi servono sia ai personaggi sia al biglietto che legge il narratore.
- **Sei blocchi di narrazione** (`narratore-a` … `-f`, 9,2–9,7 minuti stimati, 1.273–1.363 parole), tagliati solo fra un testo del gioco e il successivo (le zone sono troppo grosse per stare a coppie sotto i 10 minuti, quindi si taglia anche dentro le zone); `scelte` (81 parti, 4,5 minuti) e `trailer` (33 parti, 4 gruppi di tono).
- **`doppiaggio/en/trailer.json`**, scritto a mano dai testi sullo schermo (`Trailer.tsx`, `zone.ts`, `scaletta.ts`): stessi id, toni, finestre e ancore di `doppiaggio/trailer.json`.
- **`doppiaggio/en/controllo.md`**: i conti, le verifiche, tutto ciò che NON è di Enzo (45 suggerimenti per Kira, le battute dei personaggi, ciascuno col suo italiano) e la tabella italiano ↔ inglese di ogni parte di Enzo.
- **`doppiaggio/en/voci.md`**: il prompt della voce (Enzo, britannico neutro), in due frasi, con la versione lunga di riserva.

- **La consegna in chat**, un codeblock per messaggio come chiesto da Simone: il prompt della voce con `narratore-a`, poi `-b` … `-f`, `scelte` e `trailer`. Il trailer ha quattro gruppi di tono, ognuno un blocco di parlato col suo « Delivery: <stile>.» in coda al prompt, come in italiano. Simone ha chiesto ogni blocco dopo l'altro senza obiezioni; la durata del primo blocco non l'ha detta, quindi il ritmo dell'inglese resta da misurare.
- **Trovato consegnando**: dove un suggerimento tra parentesi sta in mezzo a una frase, il gioco spezza la frase e la voce di servizio dice il suggerimento fra le due metà; in `narratore-c` ci sono due frammenti così («Fill it at the pump» / «Before you go down.»; «…on your feet» / «, or save someone worse off than you.»), identici nella struttura a quelli italiani («, prima di scendere.», «, o salvare qualcuno…»). Il secondo comincia con una virgola: se la voce lo legge male, è la prima parte da rifare.

## Decisioni
- **Narratore = narrazione + scelte del giocatore + trailer + «L'ho letta.»** — perché è ciò che si fece in italiano (diario del 20 ottobre, `doppiaggio/LEGGIMI.md`); Simone lo ha ribadito.
- **Sei blocchi sotto i 10 minuti, non cinque** (Simone) — perché 57 minuti di narrazione in cinque blocchi sono 11,4 l'uno, oltre il tetto di circa 11 minuti a richiesta.
- **Enzo, britannico neutro** (Simone) — perché il registro dei cataloghi è inglese britannico e la voce è la stessa dell'italiano.
- **Un prompt di due frasi, non di sette** — perché Google sconsiglia i profili lunghi; la versione lunga resta di riserva in `voci.md`.
- **La classe di ogni parte viene dall'italiano** — perché “…” in inglese non distingue il biglietto dalle battute; si verifica che la sequenza delle voci sia identica testo per testo.
- **Segnaposto fuori dai blocchi** (la riga di `STATO`, `[i fili del viaggio]`) — come in italiano: li compone il gioco.
- **Nessun testo del gioco è stato toccato.**

## Verifiche
- `python strumenti/doppiaggio-inglese.py stato`: 15 verifiche su 15. 544 testi con traduzione e sequenza delle voci identica all'italiano; 218 caporali contro 218 virgolette, 45 parentesi contro 45; nessuna parentesi, tag, virgolette o maiuscola nelle parti di Enzo; 451 parti di narrazione e 81 scelte, come in italiano; trailer: 33 parti, toni, finestre e ancore uguali.
- La prima esecuzione ha trovato due cose vere: la riga di `STATO` e `[i fili del viaggio]` entravano come parti (corretto) e i blocchi per zona erano nove invece di sei (bilanciati per peso).
- `python collaudo/doppiaggio.py`: TUTTO OK (dopo le modifiche). `node strumenti/diario.mjs registro`: in ordine.
- I minuti sono una stima con le costanti dell'italiano (170 parole al minuto, 1,4 s a parte): il ritmo dell'inglese si misura sul primo blocco vero.

## Questioni aperte
- **Le generazioni**: Simone genera i blocchi, uno per volta; poi taglio e controllo parte per parte (`doppiaggio-taglia.py` è fatto per l'italiano e va adattato).
- **Parti che si somigliano** (una comincia come l'altra) nei blocchi c, d, f, g e nelle scelte: sono le varianti per stato dell'italiano; Gemini può saltarle. Si vedrà col controllo.
- **Il trailer**: il biglietto dice «no point» (`scaletta.ts`) e la nota di Z1 «no need»; «Choices follow you to the very end.» e «And at the ford, waiting for you,» sono più fitti dell'italiano nella loro finestra; il titolo «Il Viaggiatore.» letto da una voce britannica.
- Una scelta suona «I'll leave you three water.» (glossario: «3 water»): dura a voce. Catalogo non toccato.
- Kira e i personaggi in inglese, il banco e l'integrazione nell'app: non decisi.
