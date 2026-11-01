---
data: 2026-11-01
ora: "00:20"
titolo: "La voce inglese del narratore: taglio, banco e integrazione nel gioco"
tipo: sessione
versione: 1.40.1
---

# La voce inglese del narratore: taglio, banco e integrazione nel gioco

## In breve
Simone ha generato in AI Studio gli otto blocchi del narratore inglese (sei di narrazione, le scelte, il trailer: 11 WAV, uno doppio) e, andando a dormire, ha chiesto di caricarli, convertirli, sistemarli, tagliarli e integrarli nel gioco, come per l'italiano, per il solo narratore. Fatto tutto: ogni parte è stata tagliata e controllata una per una, il banco ha prodotto i file Opus, il gioco ha un modo di voce nuovo («inglese») e un trailer inglese. Il modello, in quattro blocchi, ha letto ad alta voce «long pause»: il taglio lo ha tolto.

## Contesto
Dopo la preparazione dei testi (diario del 31 ottobre, «Il doppiaggio inglese: il narratore in sei blocchi») restava tutto il lavoro sull'audio. «Carica, converti in ogg» l'ho inteso come per l'italiano: i WAV restano nei master, fuori da git (sono 53 minuti, circa 160 MB), e su GitHub vanno i file Opus del banco, pochi MB. Simone ha avvisato che «qualche volta per errore del modello vengono lette le pause»; la voce di servizio si farà dopo.

## Lavoro fatto
- **I WAV**, copiati (non spostati) da `Downloads` a `doppiaggio/master/en-grezzi/` (12 file, 11 diversi: `11_33PM` e `11_34PM` sono identici byte per byte). Riconosciuti per contenuto con `doppiaggio-riconosci.py --lingua en`: un WAV per blocco, da a ad f; le scelte; il trailer in quattro WAV, uno per tono. Il primo blocco è venuto di 8,7 minuti contro i 9,5 stimati: l'inglese parla più svelto della stima.
- **`strumenti/doppiaggio-taglia.py`**, adattato all'inglese (`en-narratore-a`, `en-scelte`, `en-trailer`): riconoscimento e numeri in inglese e, soprattutto, **il «long pause» letto ad alta voce**: le due parole si tolgono dal riconoscimento (altrimenti rubano un «long» al testo) e il taglio le lascia fuori da entrambe le parti vicine; il controllo di ogni parte da sola segnala se un tag è rimasto dentro.
- **`doppiaggio-riconosci.py`, `doppiaggio-banco.py`, `doppiaggio-trailer.py`**: tutti con `--lingua en`. Il banco inglese scrive `app/public/voce/en/` e `doppiaggio/en/banco.json` senza toccare la cartella a parte dell'italiano (ElevenLabs): una cancellazione dei file «non più di nessuna parte» in quella cartella era possibile, e c'è un controllo apposta.
- **`strumenti/doppiaggio-inglese.py`**: il manifest ha ora le **corrispondenze** (id della parte italiana del narratore → id della registrazione inglese): 532 su 532, una a una.
- **Il gioco.** Il diario resta in italiano e le parti si ritrovano dal testo italiano (`parti.ts` non cambia), quindi la voce inglese si aggancia agli id italiani: `voce.ts` carica `voce/en/indice.json`, e col modo «inglese» una parte con registrazione inglese suona quella, le altre (voce di servizio, personaggi) restano in italiano. Il modo «inglese» è nuovo in `lib/opzioni.ts` (con `conVoce`: una voce del gioco, italiana o inglese, tace il diario), nelle opzioni e nella prima finestra, dove la voce segue il testo finché non la si sceglie. Il trailer sceglie la traccia inglese (`voce/en/trailer.opus`) col modo «inglese».
- **Il collaudo** `collaudo/doppiaggio.py` ha una sezione nuova (9) per la voce inglese, e l'autoverifica del desktop prova l'indice inglese, una parte decodificata e il trailer inglese.
- **Documenti**: README, `LICENSE-CONTENUTI.md`, il piano 08 (§6), `doppiaggio/en/LEGGIMI.md`, `strumenti/LEGGIMI.md`, CHANGELOG («Non rilasciato»).

## Decisioni
- **Il modo di voce «inglese» è esplicito e le voci non ancora registrate restano italiane** — perché togliere la voce a personaggi e suggerimenti avrebbe lasciato buchi nei dialoghi, e Simone vuole fare la voce di servizio dopo; fino ad allora le altre voci non ci sono in inglese. Scelta mia, fuori da quanto chiesto: da confermare.
- **La voce segue il testo nella prima finestra** (testo inglese → voce inglese, finché non la si sceglie) — perché è ciò che chi sceglie l'inglese si aspetta. Scelta mia, da confermare. Le opzioni di chi ha già scelto non cambiano.
- **Tetto del peso della voce da 25 a 40 MB** — perché la voce inglese del narratore pesa circa quanto l'italiana e insieme superano i 25 MB; non è un limite del pacchetto, era il tetto che il collaudo si era dato.
- **Il trailer inglese ha le stesse frasi solo scritte dell'italiano** (i numeri e «An Italian text adventure…» non si dicono) — per non cambiare il passo del finale del trailer. Registrate comunque (sono nei WAV), non usate.
- **I WAV restano nei master, fuori da git**; l'originale in `Downloads` non si tocca.
- **Nessuna versione nuova**: resta «Non rilasciato» nel CHANGELOG; il rilascio è di Simone.

## Verifiche
- **Il taglio**: 565 parti attese (451 di narrazione, 81 scelte, 33 del trailer), 565 trovate. Il controllo di ognuna, riconosciuta da sola, dà in tutti i blocchi «somiglianza almeno 85% e nessuna parola in più». Una sola segnalazione dell'allineamento sul trailer, «The plain.» sentito «plane» (omofoni): la parte da sola passa. Nessun blocco ha parti «mancanti» o «da riascoltare».
- **Il «long pause» letto dal modello**: 73 volte, in quattro blocchi (b 14, d 11, e 30, f 18); in a, c, nelle scelte e nel trailer mai. In e e f il modello l'ha letto per tratti interi, uno dopo l'altro. Nessuna parte tagliata lo contiene (il controllo avrebbe «parole in più»).
- **Il banco** (`doppiaggio-banco.py --lingua en`): 532 parti, 43,3 minuti di parlato, 10,1 MB; ogni blocco a −23,3 … −23,5 LUFS, picchi veri da −2,7 a −1,1 dBTP; una parte ricodificata più piano di 0,7 dB. Traccia del trailer inglese: 28 frasi, 371 KB; nessuna sovrapposizione; `cinque` finisce 0,13 s oltre la sua finestra, `regola4` 0,48 s, `regola5` 0,89 s (nessuna frase dopo di loro fino al titolo, a 82,3 s).
- **I minuti**: i sei blocchi di narrazione sono durati 8,2–9,3 minuti ciascuno (stime 9,2–9,7): totale 52 minuti con le pause, contro i 57 stimati. L'inglese parla più svelto della stima (mediana 3,3 parole al secondo; l'italiano 2,9).
- **`python collaudo/doppiaggio.py`: TUTTO OK**, con la sezione nuova per la voce inglese (532 parti con la loro voce, nessuna scaduta, 532 corrispondenze, 532 file Opus veri, volume, trailer, peso: voce italiana 14,7 MB + inglese 10,1 = 24,8, tetto 40).
- **L'autoverifica del desktop** (`npm run autoverifica`, in `desktop/`): superata, con «ok voce inglese: 532 parti per 532 parti italiane del narratore, trailer di 28 frasi».
- **Nel gioco** (anteprima nel browser): la prima finestra, scegliendo il testo inglese, porta la voce su «English»; il trailer carica `voce/en/trailer.opus`; la prima schermata della partita chiede le clip inglesi del narratore («Acquaviva station…», «North, the square.») e quelle italiane dei due suggerimenti. L'ascolto vero non l'ho fatto (non posso sentire): lo giudica Simone. Il 1° novembre ha sentito le scelte e il trailer (vedi «Dopo l'ascolto»).

## Dopo l'ascolto (1° novembre 2026, mattina)
Simone, tornato al computer, ha chiesto di sentire le scelte e il trailer. Ho montato **le 81 scelte in un solo mp3** (3 minuti, 1 s di pausa fra l'una e l'altra, nell'ordine in cui le legge il gioco) e **la voce del trailer inglese** in mp3, ciascuno con un elenco di testi e tempi (le scelte sopra le 5 parole al secondo col «!»): file di ascolto temporanei, fuori dal repository. Esito, nelle sue parole: le scelte vanno «benissimo»; sono più veloci del solito, ma «si capisce tutto», e lo dice lui che è meno addestrato all'inglese; il trailer va bene, e «The plain.» è detto bene; «Il Viaggiatore» andava bene (accento inglese, pronuncia corretta). **Quindi le scelte non si rigenerano**: l'avevo proposto per la velocità misurata, ma la misura non era l'orecchio. Il collaudo ora lo dice come cosa accettata.

Ha poi ordinato di **chiudere tutti i server di sviluppo**, anche quelli che non erano di questa sessione, «e quando ti serve lo riapri». Erano due `vite` accesi il 30 ottobre da un'altra sessione (cartella dell'Ecosystem; porte 5199 e 5200), più l'anteprima di questa: chiusi, con le loro catene `npx`/`npm`/`cmd`; non è rimasto alcun processo di sviluppo né porta in ascolto. La regola, d'ora in poi, sta in `CLAUDE.md`: i server si chiudono quando non servono e si riaprono al bisogno.
- `tsc` pulito; `node app/scripts/opzioni-node.mjs` (10 prove), `posti-node`, `trofei-prove`, `finale-node`, e i collaudi `conferme`, `testo`, `pulsanti`, `mappa`, `musica`, `traduzione`: verdi.

## Questioni aperte
- **Le scelte inglesi: chiusa, restano come sono.** Il modello le ha lette in fretta (mediana 4,8 parole al secondo contro 3,3 delle scelte italiane e della narrazione inglese; 35 su 81 sopra le 5 al secondo, fino a 7, «What will you give me?» in 0,71 s) e io, che non so sentirle, le avevo date da rigenerare. **Simone le ha ascoltate (1° novembre 2026)**: più veloci del solito, ma «si capisce tutto», e lo dice lui, che è meno addestrato all'inglese. **Non si rigenerano.** Il collaudo continua a dire con una riga quante sono sopra le 5 parole al secondo, ma come cosa accettata.
- **Ascoltato da Simone (1° novembre 2026)**: «Il Viaggiatore» (accento inglese, pronuncia corretta); il trailer inglese (va bene) e «The plain.», detto bene. Restano da ascoltare, se vorrà, la parte 28 di `narratore-c` («, or save someone worse off than you.», comincia con una virgola, come in italiano) e le tre frasi del trailer che escono dalla finestra (`cinque`, `regola4`, `regola5`), che nel trailer intero a lui sono andate bene. Il resto della narrazione non l'ha ancora ascoltato qui: i tagli sono sicuri sul testo, non sul suono.
- **Scelte mie da confermare**: il modo «inglese» con le altre voci ancora italiane; la voce che segue il testo nella prima finestra; il tetto del peso a 40 MB.
- **Kira e i personaggi in inglese**, poi i testi di interfaccia che li accompagnano (la riga di `STATO` e i numeri restano muti come in italiano).
- **Il rilascio**: non fatto; la versione resta 1.40.1 e il CHANGELOG ha la voce in «Non rilasciato». È una funzione nuova: minor (1.41.0) quando Simone lo dice.
- In `doppiaggio/master/` ora ci sono altri 159 MB di WAV inglesi più le clip, in una sola copia sul computer (e gli originali in `Downloads`): una routine di backup fuori dal computer resta proposta e non attuata.
