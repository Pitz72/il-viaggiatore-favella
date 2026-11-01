---
data: 2026-11-01
ora: "03:09"
titolo: "I blocchi di Kira in inglese e il backup dei WAV"
tipo: sessione
versione: 1.40.1
---

# I blocchi di Kira in inglese e il backup dei WAV

## In breve
Simone ha ascoltato le scelte e il trailer inglesi (vanno bene) e ha chiesto i blocchi della voce di servizio, **Kira**, «sempre attenzione a non metterci niente dentro», per generarli in AI Studio; e di mettere nel backup su F: i WAV originali rimasti in `Downloads`. Fatti entrambi: tre blocchi di Kira (120 parti, tutte verificate una per una contro l'italiano) e i dodici WAV inglesi copiati su F: con SHA-256 uguale e tolti da `Downloads`.

## Contesto
Il narratore inglese era già nel gioco (diario «La voce inglese del narratore: taglio, banco e integrazione nel gioco»). Restavano le altre voci: Kira (servizio) e i quattordici personaggi. Il rischio, per Simone, è sempre lo stesso: mettere nella lista di una voce ciò che deve dire un'altra, senza accorgersene perché è inglese.

## Lavoro fatto
- **`strumenti/doppiaggio-inglese.py`** ora costruisce anche Kira (`r["kira"]`, `raccogli_kira`): per ogni testo del gioco prende le parti della voce di servizio **dall'italiano** (le stesse che il manifest italiano dà a `servizio`), cerca la loro traduzione nei cataloghi, e le lega una a una. Le parti con numeri si scompongono come in italiano («You have [acqua] water and [cibo] food.» → «You have # water,» e «and # food.», con `and` al posto di `e`) e si riempiono con i numeri in lettere (zero … twenty). Le parti di Enzo, i loro blocchi e gli id **non cambiano** (controllato: nessun file dei blocchi del narratore è diverso; il manifest guadagna soltanto la chiave `servizio`).
- **Nove verifiche nuove sulle parti di Kira**: risalgono, una per una, alle 120 parti italiane di Kira (né una in più né una in meno); suggerimenti 31 e 31, pezzi con un numero 89 e 89; ogni parte italiana ha una traduzione sola e due parti italiane non diventano la stessa; nessuna contiene parentesi, segnaposto, tag o virgolette; nessuna parola in maiuscolo; in ogni pezzo con un numero il valore inglese è lo stesso dell'italiano; **nessuna sua parte coincide con un testo di Enzo o di un personaggio**; le parentesi sono le stesse dell'italiano (45 e 45).
- **Tre blocchi** in `doppiaggio/en/blocchi/`: `kira-suggerimenti` (31 parti, 212 parole, circa 1,4 minuti), `kira-numeri-a` (55 parti, 1,9 minuti) e `kira-numeri-b` (34 parti, 1,1 minuti). I pezzi con numeri vengono a «famiglie» che si somigliano; due famiglie che differiscono solo per il punto o la virgola finale («Now you have # water.» / «…water,») stanno in blocchi diversi. Nei suggerimenti, la coppia che l'italiano ha già («Al guado: usa la lettera su Cosimo…», in due forme, una prefisso dell'altra) è stata allontanata (la breve in fondo): due righe vicine che si somigliano le salta, Gemini.
- **`doppiaggio/en/manifest.json`**: nuova chiave `servizio` con voce, blocchi, parti e **corrispondenze** italiano → inglese (120). **`doppiaggio/en/controllo.md`**: sezione di Kira con le verifiche e la tabella italiano ↔ inglese di ogni parte. **`doppiaggio/en/voci.md`**: il prompt di Kira (due frasi) e la versione lunga di riserva.
- **Il backup dei WAV**. I 12 WAV inglesi del 31 ottobre (`Generated Audio October 31, 2026 - …`, 166,3 MB) erano in `Downloads`, nella copia dei master (`doppiaggio/master/en-grezzi/`) e basta. **Copiati** in `F:\Backup\Il Viaggiatore - 2026-10-22\doppiaggio\master\en-grezzi\` (con `SHA256.txt`), controllato lo SHA-256 di ciascuno nei tre posti (Downloads, master, F:), poi **tolti da `Downloads`**. Ora i master inglesi hanno due copie: nel clone e su F: (stesso computer, altro disco).

## Decisioni
- **Kira in inglese britannico neutro**, come Enzo — perché il registro dei cataloghi è britannico e due accenti diversi per «il mondo» e «il gioco» confonderebbero più di quanto aiutino; per distinguerle a orecchio bastano voce femminile, leggera e piatta (già nella descrizione). Scelta mia, da confermare: se Simone vuole un altro accento si cambia una riga del prompt, il testo non cambia.
- **Tre blocchi e non uno** (l'italiano ne ha uno solo da circa 4 minuti) — perché i pezzi con i numeri sono quasi uguali l'uno all'altro e Gemini salta ciò che prende per una ripetizione; blocchi piccoli, rigenerabili in un minuto.
- **Ho spostato i dodici WAV di questa sessione e basta.** In `Downloads` ci sono altri 39 «Generated Audio» (da maggio al 30 ottobre, circa 400 MB) che **non sono** nei master né nel backup (nessuno ha uno SHA-256 uguale a un file lì): non sono miei e non so che cosa siano, quindi non li ho toccati. Da chiedere a Simone.

## Verifiche
- `python strumenti/doppiaggio-inglese.py stato`: tutte le verifiche OK (le 15 del narratore e le 9 di Kira); blocchi del narratore invariati (80/69/83/74/81/64 parti, scelte 81, trailer 33).
- SHA-256 dei 12 WAV: uguali in `Downloads`, nei master e su F: prima di cancellare; `SHA256.txt` scritto su F:; in `Downloads` non resta nessun file «October 31».
- Letti i tre blocchi di Kira a occhio, per intero: solo istruzioni e numeri, niente narrazione né battute.

## Questioni aperte
- Simone genera i tre blocchi di Kira in AI Studio; poi: taglio (`doppiaggio-taglia.py` va esteso a `en-kira-*`), banco e gioco (il modo «inglese» deve far parlare Kira inglese: `voce.ts` e `parti.ts` per i pezzi con i numeri), collaudo, e le guide.
- Confermare Kira britannica neutra e i tre blocchi.
- Gli altri 39 WAV di `Downloads`: che cosa sono, se vanno nel backup.
- I quattordici personaggi in inglese.
