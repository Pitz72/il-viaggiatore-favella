---
data: 2026-10-01
ora: "08:37"
titolo: "Le voci, il bluff e Peppe"
tipo: sessione
versione: 1.10.0
---

# Le voci, il bluff e Peppe

## In breve
Tre fili di storia che si appoggiano l'uno all'altro, e una pulizia: a lato dello schermo compare «si dice di te»; Vito umiliato dal bluff lo racconta, e la voce arriva a Ciro, a Tore, a Cosimo; Peppe, se arrivi col sangue, ti chiede se è vero. In più le dichiarazioni doppie di «getta cibo» diventano una.

## Contesto
Dai prossimi passi: i fili possibili di `06-ramificazione.md` §8 (Vito e il bluff, Peppe e il sangue, che cosa mostrare a lato dello schermo) e la pulizia di `z2-piana.fav`. Avevo proposto A (le voci) e B (Peppe), con C (il bluff) «per dopo». L'autore ha risposto: «decidi tu, ma senza pigrizia o tagliando cose». Si sono scritti tutti e tre: si reggono a vicenda, perché le voci passano per gli stessi personaggi (Ciro, Rosaria, Tore) e Peppe è il terzo che le sente. Una D (un'eco di Imma alla soglia) è rimasta fuori: Imma vive in paese, e un'eco ad Acquamorta sarebbe forzata.

## Lavoro fatto
- **«Si dice di te»** (`il-viaggiatore.fav`, `ponte.py`, `testo.ts`, `ViaggiatorePlayer.tsx`). Tre stati («stato della voce del sangue / della generosità / del bluff», «ignota» → «udita») che i personaggi accendono quando te la dicono in faccia: Rosaria nell'accoglienza col sangue, Ciro con Vito a terra e col bluff, Imma in osteria. `fav_stato` espone solo le udite; l'interfaccia ha la riga di ciascuna («che alzi le mani», «che lasci qualcosa a chi resta», «che al casello hai puntato una pistola scarica»). Non sono un contatore e non compaiono mai prima.
- **Vito e il bluff** (`z4`, `z5`, `z6`, `z7`). `stato del bluff` ricorda la pistola scarica. Vito, se torni: «Lo racconto bene». Ciro, la prima volta: «Quello della pistola», con ciò che Vito ha capito («da come la tenevi»). Tore lo sa. Cosimo lo dice nella prima battuta («Hai fatto la faccia giusta») e a «minaccia Cosimo» con la pistola («Quella del casello»), senza cambiare l'effetto sulla veglia. Il bluff non è sangue e non toglie fiducia: costa la derisione.
- **Peppe e il sangue** (`z5`, `z6`, `z7`). Con le mani sporche Peppe chiede una volta sola; tre risposte («È vero. Non l'ho voluto.», «Non è così.», «Non devo dirti niente.») e poi come sempre. `stato del sapere di Peppe` (nuovo / vero / bugia) cambia la sua battuta sul valico, al guado e allo sparo, con tre versioni ciascuno. Nessun finale cambia.
- **Pulizia di `z2-piana.fav`**: «getta cibo» dichiarato una volta, con «getta», «getta il cibo», «lancia cibo», «lancia il cibo» come sinonimi (motore 1.4.0). Undici righe in meno, stesso comportamento (verificato prima e dopo: «getta mappa», «getta» fuori dalla serra). Dall'`NOTE` di `azioni.ts` sono sparite quattro voci.
- **Collaudo**: due percorsi (`K_peppe_vero`, `L_peppe_bugia`, in `finali.py` e `pulsanti.py`: ora 12); `fili.py` +44 prove (104); `testo.py` verifica che ogni voce dichiarata abbia la sua riga; `interfaccia.py` le espone; `mirate.py` aggiornato alla nuova battuta di Vito. La mappa narrativa legge le voci come «lette dall'interfaccia» (non più stato fantasma).
- Documenti: `06-ramificazione.md` §3.6–3.8, la mappa, `05-personaggi.md` (Vito, Peppe, Ciro), `collaudo/LEGGIMI.md`, `PROSSIMI-PASSI.md`.

## Decisioni
- **Le voci si dicono, non si contano** — perché «si dice di te» con un numero sarebbe un meter: il giocatore lo guarderebbe per ottimizzarlo. Le righe compaiono solo quando qualcuno le ha dette, e con le parole di chi le racconta.
- **Le voci nell'interfaccia, il testo nel gioco** — perché lo stato sta nei `.fav` (dove la storia decide quando una voce è udita) e la riga sta in `testo.ts`, ma un collaudo (`testo.py`) li tiene allineati, come con i personaggi.
- **Il bluff costa la derisione, non la fiducia** — perché l'autore ha deciso che il bluff non è sangue; resta l'unico modo di passare senza che nessuno si faccia male. Per questo non toglie niente a nessuno: Vito ride, Ciro ride, Cosimo quasi apprezza.
- **Peppe non rifiuta mai** — perché la sua presenza è un pilastro (tre finali la usano). La domanda dà peso alla scelta senza chiuderla: il guadagno della verità è meno di una ricompensa e più di un silenzio; la bugia è punita da chi ti conosce, non da una regola.
- **«Non è così», non «Non è vero»** — perché «è vero» è dentro la prima risposta («È vero. Non l'ho voluto.»): digitando «è vero» il motore trovava due opzioni e non ne sceglieva nessuna. Trovato dal collaudo.
- **Una dichiarazione sola per «getta cibo»** — perché dal motore 1.4.0 `"x" è come <comando d'autore>` funziona; il chip «Getta il cibo» e le regole non cambiano, e `pulsanti.py` lo conferma.

## Verifiche
Compilazione riuscita con un avviso (quello voluto di «colpisci»). `finali.py` 15/15 (12 percorsi + 3 morti), copertura 9/9; `mirate.py` 8/8; `fili.py` 104 prove; `giocate.py` 34; `interfaccia.py`; `scorte.py`; `testo.py` 11 prove; `conferme.py` 95 scelte; `pulsanti.py` 12/12; `salvataggi.py` 16 partite, 20 ricaricamenti identici; `tsc` pulito. Nel browser: giocata fino all'osteria col sangue e con Imma sfamata, a lato dello schermo compare «si dice di te» con le due righe giuste.

## Questioni aperte
- Le tre voci sono le uniche: non c'è una voce di Pasquale (l'hai curato, e nessuno lo dice), né una di Peppe (hai portato un ragazzo). Se «si dice di te» crescesse, bisognerebbe decidere un tetto, per non far somigliare il lato dello schermo a una pagella.
- L'eco di Imma alla soglia (scartata): se si vuole, in `z7-guado.fav`, la strada di Acquamorta potrebbe citare chi hai sfamato.
- Il bluff non ha ancora un prezzo meccanico: solo parole. Se serve una conseguenza vera (Ciro che paga meno, Vito che chiude la grata da quella parte), è una scelta di bilancio dell'autore.
