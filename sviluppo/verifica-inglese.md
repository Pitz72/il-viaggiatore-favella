# Verifica dell'inglese: calchi dall'italiano e schemi da LLM

> 31 ottobre 2026, versione 1.40.0. Rapporto di una lettura integrale della traduzione inglese
> (`app/src/lingue/en/`): 494 voci, circa 11.700 parole. **Si verifica solo l'inglese** (ordine di Simone): l'italiano è servito
> unicamente come riferimento per riconoscere un calco; non è stato valutato e non se ne propone nessuna modifica.
> **Applicate il 31 ottobre 2026** (ordine di Simone: «correggi tutto quello che hai trovato secondo il piano»): 52 voci nei
> cataloghi, solo nel campo `en`. D1 e D5 sono state applicate; D2, D3, D4 e D6 sono state chiuse lasciando il testo com'è.

## Esito in breve

- La traduzione è di buona qualità e non porta i segni tipici di un testo scritto da un modello: nessun trattino lungo nella
  prosa, nessun contrasto «non X, ma Y», nessuna chiusa a effetto aggiunta, nessun lessico gonfiato o pubblicitario, nessun
  elenco in tre inventato (le tre liste vere sono già nell'originale), nessun residuo di chat.
- I difetti che restano sono **italianismi di costruzione**, non di vocabolario: ordine delle parole, ellissi tradotte alla
  lettera, dislocazioni («Pensaci, a cosa torni»), qualche falso amico.
- **48 voci su 494** (meno del 10%) hanno una proposta: **1** errore di grammatica, **15** calchi che un lettore inglese nota,
  **32** ritocchi di finezza. Più **6 decisioni** che spettano a Simone.
- Le proposte sono di Claude, non di un madrelingua: la rilettura da parte di un madrelingua resta aperta in
  [`PROSSIMI-PASSI.md`](PROSSIMI-PASSI.md) e questo rapporto non la sostituisce.

## Come è stato fatto

1. Letto l'inglese voce per voce, con l'italiano a fianco solo come riferimento di significato. Zone: storia, sistemi, z1–z7.
2. Criteri: le skill `humanizer` e `stop-slop` (usate come elenco di sintomi, non per riscrivere), e la rubrica del
   [`LEGGIMI` della traduzione](../app/src/lingue/en/LEGGIMI.md): inglese britannico, seconda persona al presente, asciutto,
   niente americanismi né dialetto finto, glossario.
3. Scansione meccanica dell'intero testo inglese: trattini, parole tipiche dei modelli, contrasti, americanismi, caratteri
   Unicode, ripetizioni.
4. Ogni proposta mantiene i segnaposto fra parentesi quadre, gli a capo, le virgolette curve e le parole in maiuscolo: sono le
   regole che `python strumenti/traduzione.py controlla` fa rispettare.

## Che cosa è a posto (controllato)

| Controllo | Esito |
|---|---|
| Trattini lunghi nella prosa | 0. Solo i 6 «FINALE — …», etichetta uguale a quella dell'originale |
| «Non X ma Y», «not just», «isn't about» | 0 |
| Parole da elenco dei modelli (*delve, testament, tapestry, pivotal, crucial, vibrant, landscape*…) | 0. Unica eccezione di rilievo: *quietly*, 6 volte (vedi D5) |
| Americanismi (*color, gray, sidewalk, gas, gotten*…) | 0. Ortografia e lessico britannici coerenti: *colour, grey, tyres, tarmac, boot, petrol, spanner, ten-storey, recognise* |
| Elenchi in tre | Nessuno inventato. Le uniche tre voci vere (z1.13, z5.82, z7.28) sono già nell'italiano |
| Chiusure a effetto, frasi che spiegano l'esempio | Nessuna aggiunta. Quelle che ci sono (i finali) vengono dall'originale |
| Glossario del `LEGGIMI` | Rispettato: *jerrycan, demijohn, farmstead, lay-by, main road, dual carriageway, dirt track, mule track, tollbooth, the Drought*… |
| Seconda persona al presente, frasi brevi | Rispettate in tutto il testo |
| Caratteri invisibili o strani (spazi senza interruzione, larghezza zero) | 0. Fuori dall'ASCII ci sono solo virgolette curve, puntini di sospensione, il trattino dei finali e il punto in mezzo della riga di stato |
| «strada» → *street* in `nomi.json` | Corretto: è il luogo «La strada di Acquamorta» (z7.4); altrove il testo dice *road* |
| Ripetizioni *just once* (3), *just enough* (5), *the way you…* (14) | Lasciate: vengono dai motivi ripetuti dell'originale («una volta sola», «quanto basta», «come si dice…») |

## Priorità 1: errore di grammatica (1 voce)

| Voce | Dove | Attuale | Proposta | Perché |
|---|---|---|---|---|
| sistemi.8 | `sistemi.fav:74` | You keep the food for when you'll need it. | You keep the food for when you need it. | Dopo *when* l'inglese vuole il presente, non il futuro. |

## Priorità 2: calchi che si notano (15 voci)

| Voce | Dove | Attuale | Proposta | Perché |
|---|---|---|---|---|
| storia.1 | `il-viaggiatore.fav:57` | Your life, practically. | Your life, in effect. | *Practically* vuol dire «quasi»: falso amico di «in pratica». |
| storia.8 | `il-viaggiatore.fav:93` | You have nothing that shoots. | You have nothing to shoot with. | Calco della relativa. |
| sistemi.5 | `sistemi.fav:40` | …there aren't two sips. There's one left. | …there isn't enough for two sips. There's one left. | «Due sorsi non ci sono» reso alla lettera. |
| sistemi.6 | `sistemi.fav:43` | You drink long, eyes closed, until the jerrycan changes its sound. | You drink for a long while, eyes closed, until the jerrycan sounds different. | *Drink long* non si dice; il catalogo traduce «bevi a lungo» con *drink for a long while* in z3.46 e z3.47. |
| z1.29 | `z1-acquaviva.fav:83` | your back is in pieces | your back is wrecked | *In pieces* non è un modo inglese di dire la schiena a pezzi. |
| z2.7 | `z2-piana.fav:40` | beside the ones it was defending | beside the crates it was defending | *The ones* si legge come «le conserve». |
| z2.23 | `z2-piana.fav:79` | While the jerrycan lasts, it isn't worth waiting for the bottom. | While the jerrycan still has water, it isn't worth waiting for the bottom to clear. | Due ellissi tradotte alla lettera; z2.22 dice già *wait for the bottom to clear*. |
| z2.32 | `z2-piana.fav:101` | There's nothing to throw, or nobody it would interest. | There's nothing to throw, and no one to care. | «Nessuno a cui interessi» calcato. |
| z2.38 | `z2-piana.fav:119` | the plain is crossed | you have crossed the plain | Passivo calcato. |
| z3.15 | `z3-invaso.fav:69` | that has been waiting years for good water | that has been waiting for good water for years | Manca *for*. |
| z3.38 | `z3-invaso.fav:123` | But nobody I don't know comes into my house. | But I don't let anyone I don't know into my house. | Doppia negazione calcata da «non entra chi non conosco». |
| z3.54 | `z3-invaso.fav:153` | There's salt. That there is. That never runs out. | There's salt. That, yes. That never runs out. | *That there is* suona dialettale e ambiguo (*that there*). |
| z5.54 | `z5-paese.fav:176` | his pride burns too much, even now | his pride stings too much, even now | *Burns* non regge; *stings* tiene l'immagine. |
| z6.21 | `z6-colline.fav:84` | You leave me alone too. | Leave me alone too. | È un imperativo: in inglese «You leave me alone too» è una constatazione. |
| z7.28 | `z7-guado.fav:81` | The shot goes off and covers the sound of the riverbed. | The shot goes off and drowns out the sound of the riverbed. | *Covers* calca «copre». |

## Priorità 3: ritocchi di finezza (32 voci)

| Voce | Dove | Attuale | Proposta | Perché |
|---|---|---|---|---|
| storia.7 | `il-viaggiatore.fav:92` | it's there to be believed | its only job is to be believed | Calco di «serve a farsi credere». |
| sistemi.10 | `sistemi.fav:76` | nothing to get your teeth into | nothing to sink your teeth into | In inglese britannico *get your teeth into* è «buttarsi su un compito». |
| sistemi.13 | `sistemi.fav:82` | without hurry and without taste | without hurrying, without tasting it | Più naturale. |
| sistemi.14 | `sistemi.fav:83` | You haven't enough food for three portions. | There isn't enough food for three portions. | *Haven't enough* è desueto; coerenza con sistemi.7. |
| z1.6 | `z1-acquaviva.fav:21` | The road leaves to the WEST | The road heads out WEST | Calco di «esce a OVEST». |
| z1.16 | `z1-acquaviva.fav:57` | it isn't a thing to carry on the road | it isn't something to carry on the road | «Roba» reso con *a thing*. |
| z1.19 | `z1-acquaviva.fav:68` | if you've something to trade | if you've got something to trade | *You've something* è troppo letterario per Nunzio. |
| z1.33 | `z1-acquaviva.fav:93` | Without a map, out there you'll only get lost. | Out there without a map, you'll only get lost. | Ordine delle parole dell'italiano. |
| z2.6 | `z2-piana.fav:39` | Of the dog, only its prints in the dust. | Of the dog, only pawprints in the dust. | *Its prints* è goffo. |
| z2.19 | `z2-piana.fav:72` | He points his chin at the rope. | He jerks his chin at the rope. | Gesto reso alla lettera (*points his chin*). |
| z2.31 | `z2-piana.fav:100` | You have nothing to throw it. | You have nothing to throw to it. | Regge, ma stona. |
| z3.14 | `z3-invaso.fav:64` | They make water that has been filtered safe to drink. | They make filtered water safe to drink. | Giro ingombrante. |
| z3.21 | `z3-invaso.fav:87` | On the burst seat | On the caved-in seat | «Sedile sfondato» non è *burst*. |
| z3.26 | `z3-invaso.fav:100` | On the road salt is money | On the road, salt is money | Manca la virgola. |
| z3.60 | `z3-invaso.fav:166` | drink from the pool out of cupped hands | drink from the pool with cupped hands | Due complementi di fila. |
| z4.29 | `z4-statale.fav:127` | the way you do to a child | the way you do with a child | Preposizione. |
| z4.52 | `z4-statale.fav:162` | A blow catches you full on | A blow catches you square on | *Full on* resta in sospeso. |
| z4.77 | `z4-statale.fav:210` | It's a mouthful, and she knows it. | It's only a mouthful, and she knows it. | *A mouthful* in inglese è anche «una parola lunga»: *only* chiarisce che parla del cibo. |
| z5.20, z5.21 | `z5-paese.fav:109`, `:110` | Trust, no: that has to be earned. | Trust is another matter: that has to be earned. | «La fiducia no» calcato. |
| z5.24 | `z5-paese.fav:114` | for the hospitality | for your hospitality | Più naturale. |
| z5.30 | `z5-paese.fav:123` | Think about it, what you're going back to. | Think about what you're going back to. | Dislocazione italiana. |
| z5.37 | `z5-paese.fav:135` | When you get there, up there they'll already know who you are. | When you get there, they'll already know who you are. | *There / up there* ripetuto. |
| z5.42 | `z5-paese.fav:146` | she says it loud | she says it loudly | *Loud* come avverbio è colloquiale. |
| z5.43 | `z5-paese.fav:147` | gives you a nod of the chin … She adds nothing else. | jerks her chin at you … She adds nothing. | Gesto alla lettera; *nothing else* è ridondante. |
| z5.50 | `z5-paese.fav:163` | the when of it escapes me | when it happened escapes me | «Il quando» calcato, troppo ricercato per la vecchia Concetta. |
| z5.52 | `z5-paese.fav:167` | Go there, and look at it yourself, the house. | Go there and see the house for yourself. | Dislocazione italiana. |
| z5.81 | `z5-paese.fav:233` | time's merchandise too | time's a commodity too | *Merchandise* è merce da negozio. |
| z6.40, z6.41, z6.42, z6.43 | `z6-colline.fav:119` … `:122` | He studies the way you've come. | He studies the direction you've come from. | *The way you've come* si legge come «il modo in cui sei venuto». |

## Decisioni

Frasi cardine o scelte di gusto. Simone ha detto di procedere «secondo il piano» (31 ottobre 2026): D1 e D5 applicate come
proposte; D2, D3, D4 e D6 chiuse lasciando il testo com'è.

1. **D1. Il biglietto (storia.2, z1.1; ritorna in z6.24 e z7.21).** *“There's no point coming back.”* dice che tornare è inutile;
   «Non è il caso di tornare» dice che non conviene, non che non serve. Proposta: *“There's no need to come back.”* (alternativa:
   *“Better not to come back.”*). È la frase da cui parte tutto il gioco. **Applicata** (storia.2 e z1.1).
2. **D2. z4.26 (`z4-statale.fav:122`).** *“affable as only a man holding the knife by the handle can be”* rende alla lettera un
   modo di dire italiano («avere il coltello dalla parte del manico», avere il sopravvento). L'immagine regge anche in inglese:
   tenerla, oppure *“…as only a man with the upper hand can be”*. **Tenuta.**
3. **D3. «Three water» (z4.36 `z4-statale.fav:135`, z5.97 `z5-paese.fav:251`).** *“I'll leave you three water.”* applica la regola
   del `LEGGIMI` sulle scorte («3 d'acqua» → *3 water*), ma come battuta detta suona strano. Tenerla per coerenza con l'originale,
   o scegliere una forma parlata. **Tenuta** (coerenza con la regola sulle scorte).
4. **D4. «Viandante» e «viaggiatore» (z5.56 e z5.65, `z5-paese.fav:180`, `:199`).** Peppe e Pasquale dicono *traveller*, la stessa
   parola del titolo. Se la distinzione conta, *wayfarer* per «viandante». **Chiusa, nessuna modifica**: era già deciso
   nella 1.40.0. Il titolo e il marchio restano «Il Viaggiatore» in entrambe le lingue (`TITOLO` in `app/src/lib/lingua.ts`), e
   *traveller* è la traduzione della parola «viandante» nel racconto (diario «Parola per parola…»). Simone l'ha ribadito: il
   titolo è una cosa, il termine un'altra. La regola ora sta anche in `CLAUDE.md` e nel `LEGGIMI` della traduzione.
5. **D5. *Quietly* ×6 (z5.42, z5.106, z6.36, z6.37, z6.54, z7.21).** È l'unica parola da elenco dei modelli che torna. Proposta di
   variare tre: z5.42 *more quietly* → *more softly*; z5.106 *the stalls laugh quietly* → *the stalls laugh under their breath*;
   z6.54 *He says it quietly* → *He says it softly*. Restano z6.36, z6.37 e z7.21. **Applicata.**
6. **D6. «Disgrazia» → *tragedy* (z5.50 e z5.51, `z5-paese.fav:163`, `:164`).** Per una vecchia di campagna *tragedy* è più colto di
   «disgrazia»; si può tenere (è chiaro) o scegliere *misfortune* / *calamity*. **Tenuta.**

## Come applicarle

Si cambiano i cataloghi `app/src/lingue/en/*.json` (campo `en`, mai `it`), poi:

```bash
python strumenti/traduzione.py controlla
python collaudo/traduzione.py
```

Le voci sono identificate dal numero d'ordine nel catalogo (per esempio `z3.38` = 38ª voce di `z3.json`) e dal punto del `.fav`
dove nasce il testo italiano.
