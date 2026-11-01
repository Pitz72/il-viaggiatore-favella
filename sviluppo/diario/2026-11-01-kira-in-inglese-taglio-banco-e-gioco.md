---
data: 2026-11-01
ora: "05:00"
titolo: "Kira in inglese: taglio, banco e gioco"
tipo: sessione
versione: 1.40.1
---

# Kira in inglese: taglio, banco e gioco

## In breve
Simone ha generato in AI Studio i tre blocchi inglesi di Kira, la voce di servizio, e li ha ascoltati mentre uscivano: «sono perfetti». Riconosciuti, tagliati e controllati parte per parte (120 su 120), passati al banco e agganciati al gioco: col modo di voce «inglese» ora parlano in inglese anche i 31 suggerimenti tra parentesi e le righe con le scorte («You have six water, and two food.»). Restano in italiano soltanto i quattordici personaggi.

## Contesto
Il diario precedente («I blocchi di Kira in inglese e il backup dei WAV») ha lasciato i testi pronti: tre blocchi, 120 parti, tutte legate una a una alle 120 parti italiane di Kira, in una chiave `servizio` a parte del manifest inglese, perché il taglio, il banco e il collaudo allora conoscevano solo Enzo. Simone ha mandato i tre WAV (`Generated Audio November 01, 2026 - 4_38AM / 4_40AM / 4_43AM`, 13,7 MB, 4,8 minuti) con il via libera a proseguire.

## Lavoro fatto
- **I tre WAV sono arrivati in ordine di blocco** (`strumenti/doppiaggio-riconosci.py --lingua en`, esteso ai blocchi `kira-*`): 4_38 è `kira-suggerimenti` (inizio e fine al 98%, parole 100%), 4_40 è `kira-numeri-a` (100%), 4_43 è `kira-numeri-b` (90% all'inizio e alla fine, parole 99%); un WAV per blocco, nessuno mancante, nessun doppione.
- **Il taglio** (`strumenti/doppiaggio-taglia.py en-kira-suggerimenti | en-kira-numeri-a | en-kira-numeri-b`, con `--controlla`): 31 + 55 + 34 = **120 parti su 120 trovate**, nessuna da riascoltare per somiglianza, **«long pause» mai letto ad alta voce** (a differenza di quattro blocchi di Enzo), pausa fra una parte e l'altra da 0,53 a 1,29 s. Il controllo di ogni parte da sola: 116 su 120 con somiglianza almeno 85%; le altre quattro sono limiti di whisper e non della voce: «Talk to Nunzio to barter.» sentito «Talk to Nunzio Tabata.», «Talk to Iole.» sentito «Talk to you later.», «Talk to Onofrio.» sentito «Talk to an off-reel.» (nomi italiani), «and eight food.» sentito «and eat food.» (omofonia: riletta con la frase vicina come suggerimento, whisper sente «eight»; le parti vicine, da «six» a «eleven», tornano tutte).
- **Il banco** (`strumenti/doppiaggio-banco.py --lingua en`) ora legge anche i blocchi di `servizio` e ne mette le corrispondenze nell'indice inglese insieme a quelle del narratore: **652 parti** (532 di Enzo, 120 di Kira), 46,7 minuti, 10,9 MB. Le registrazioni grezze di Kira stavano a −17 LUFS: portate a −23 come Enzo (−6,2 / −6,1 / −5,9 dB), poi misurate sui file veri a −23,1 / −22,9 / −22,9 LUFS, picchi veri sotto −3 dBTP. Una sola parte ricodificata un po' più piano (0,7 dB), come previsto dal banco.
- **Il gioco non ha richiesto codice nuovo**: `voce.ts` e `parti.ts` non sono cambiati. Il gioco ritrova la parte dal testo italiano (suggerimento o pezzo coi numeri, ricomposto) e la traduce in inglese con la tabella delle corrispondenze, che adesso ha 652 voci. Cambiati solo i commenti e i testi che dicevano «per ora il solo narratore» (`lib/opzioni.ts`, `gioco/voce.ts`, `gioco/Opzioni.tsx`, `components/SceltaLingua.tsx`, `autoverifica.ts`).
- **Il collaudo** (`collaudo/doppiaggio.py`, sezione 9): ogni parte dei cataloghi di oggi ha la sua voce (532 di Enzo, 120 di Kira), ogni parte italiana di Kira (120) ha la sua registrazione e le corrispondenze sono quelle di oggi, i file sono Ogg Opus veri, le durate e i volumi di ogni blocco di Kira.
- **La prova nel gioco vero** (anteprima in browser, modo «inglese»): per gli id italiani «Bevi.», «Hai sei d'acqua,» e «e due di cibo.» il gioco dà `en/899e6af8`, `en/70258c3a` e `en/f9110193`; la fila «Hai sei d'acqua,» + «e due di cibo.» suona per 2,8 secondi (1,38 + 0,3 di pausa + 1,07) e si ferma da sola; col modo «recitata» tornano gli id italiani. Il server è stato chiuso.
- **Il backup**: i tre WAV copiati in `F:\Backup\Il Viaggiatore - 2026-10-22\doppiaggio\master\en-grezzi\` (15 WAV più `SHA256.txt`), SHA-256 uguale nei tre posti, poi tolti da `Downloads`.
- **I documenti**: `doppiaggio/en/LEGGIMI.md`, il piano 08, README e CHANGELOG ora dicono che in inglese parlano il narratore e la voce di servizio.

## Decisioni
- **Testi d'interfaccia, non detti**: la finestra della prima scelta, le opzioni e il README dicevano «parla il solo narratore»; ora dicono «il narratore e la voce di servizio» e che i personaggi restano italiani. Non è testo della storia né di nessuna voce (nessun doppiaggio da rifare). Il nome «voce di servizio» (in inglese «service voice») è quello che le opzioni usavano già.
- **Il tetto del peso resta a 40 MB**: la voce intera pesa ora 25,6 MB (italiana 14,7, inglese 10,9); i personaggi inglesi, se saranno tutti registrati, ne aggiungeranno circa 8.
- **Nessuna rigenerazione**: Simone ha detto «perfetti», e il rapporto non ha parti mancanti.

## Verifiche
- `python collaudo/doppiaggio.py`: TUTTO OK (878 parti italiane, 652 inglesi: 532 di Enzo e 120 di Kira; peso 25,6 MB).
- `python strumenti/doppiaggio-inglese.py stato`: tutte le verifiche OK.
- `npx tsc --noEmit` in `app/`: pulito.
- Nel gioco, in anteprima: id italiano → file inglese di Kira, file decodificato (0,51 s «Drink.», 1,38 s, 1,07 s), fila di due parti suonata e conclusa.

## Questioni aperte
- **I quattordici personaggi in inglese**: voci, prompt, blocchi. Finché non sono registrati, col modo «inglese» suonano in italiano.
- **Simone non ha ascoltato Kira nel gioco**, solo mentre generava: da riascoltare con `node prepara.mjs` e `npm run avvia` in `desktop/` quando lo vorrà.
- Confermare le scelte fatte mentre non c'era: Kira britannica neutra, il modo «inglese» con i personaggi ancora italiani, la voce che segue il testo nella prima finestra, il tetto del peso a 40 MB.
- **Il rilascio** (la 1.41.0 proposta: la voce inglese del narratore e di Kira) solo quando Simone lo dice.
- I 39 «Generated Audio» vecchi in `Downloads` (circa 400 MB): ancora da chiedere a Simone che cosa sono.
- Una routine di backup fuori dal computer resta solo proposta.
