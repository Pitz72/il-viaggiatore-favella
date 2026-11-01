---
data: 2026-11-01
ora: "11:50"
titolo: "Le voci italiane dei personaggi rifatte con ElevenLabs"
tipo: sessione
versione: 1.40.1
---

# Le voci italiane dei personaggi rifatte con ElevenLabs

## In breve
Dopo la stima dei crediti, Simone ha detto «sì, solo i personaggi»: le voci italiane di Gemini di nove personaggi sono rifatte con ElevenLabs, con la stessa voce che ognuno ha in inglese.
Concetta, dopo, con «Tosca old&deep» (la voce inglese «Tosca - Mature, Whispery and Seductive» non si trova con il connettore): **tutti e quattordici i personaggi sono ora ElevenLabs, in italiano e in inglese**.

## Contesto
Stima fatta il 1° novembre 2026: rifare tutto il doppiaggio con ElevenLabs costa circa 101.500 crediti (un credito per carattere, qualunque modello); le dieci voci italiane dei personaggi di Gemini 9.883. Simone, a metà
giornata: «ora come ora ho 17.877 crediti». Il narratore Enzo e Kira hanno già la stessa voce in italiano e in inglese e non si toccano.

## Lavoro fatto
- **Voci**: le stesse dell'inglese: Nunzio «Ermenegildo Meliconi», Saverio «Ignazio Rossi», Iole Elettra, Rocco «Ciro Esposito» (è la voce di Rocco), Peppe Vittorio boy next door, Ciro Pierpaolo, Pasquale
  «Carmine Lo Russo», Onofrio Nonno Ben, Cosimo Corrado Noventa. Gli identificativi di Elettra, Nonno Ben e delle voci disegnate li ho trovati elencando le voci dello spazio di lavoro.
- **Archivio**: l'audio Gemini non è cancellato: `doppiaggio/generati/archivio/<nome>-gemini.txt` e `doppiaggio/master/clip/<nome>-gemini/` (come per Tore e Vito il 20 ottobre); le clip originali sono anche nel backup di M02.
- **Generazione** (`creative_generate_speech`, `eleven_v4`, una ripresa a testa): i testi sono quelli di `python strumenti/doppiaggio.py da-fare --elevenlabs` (tono in tag; per Pasquale ho aggiunto lo stato
  `recovered from the fever…` alle ultime due battute), salvati poi in `doppiaggio/generati/<nome>.txt`. Costo **9.112 crediti** (Nunzio 564, Saverio 384, Iole 1.005, Rocco 336, Peppe 1.163, Ciro 819, Pasquale 330,
  Onofrio 1.868, Cosimo 2.643): a Simone dovrebbero restarne circa 8.700.
- **Taglio e controllo** (`doppiaggio-taglia.py <nome> … --controlla`, il taglio italiano): 7, 8, 12, 5, 17, 11, 4, 21 e 31 parti, tutte trovate e tutte sopra l'85% e senza parole in più (116 parti); nessun tag letto.
- **Banco e gioco**: `A_PARTE` di `strumenti/doppiaggio-banco.py` ha 13 blocchi (i quattro di ElevenLabs di prima e questi nove): 116 Opus nuovi in `app/public/voce/elevenlabs/` (185 parti), i 116 Gemini tolti da `app/public/voce/`.
  La licenza dell'indice italiano dice «in parte sul piano gratuito e in parte con un abbonamento». Crediti nel gioco, README, licenza e changelog aggiornati («in italiano tutti tranne Concetta»).

## Decisioni
- **Peppe con Vittorio anche in italiano** — la voce è la stessa dell'inglese, ma ha un accento milanese: un ragazzo del sud con accento milanese. Da ascoltare; se stona si cambia voce (1.163 crediti).
- **Concetta con «Tosca old&deep»** — la voce inglese di Concetta («Tosca - Mature, Whispery and Seductive», che Simone aveva usato a mano nell'app: velocità 0,81, Stability 34, Similarity 40) il connettore non la trova. Simone ha detto «vai di Tosca anche in italiano» e ho usato l'unica Tosca che trovo, «Tosca old&deep» (donna italiana anziana, profonda, calma): **non è la stessa voce dell'inglese**. 826 crediti, 8 parti su 8. Se all'ascolto non va, si rifà con la voce giusta (aggiunta a My Voices) o la genera Simone nell'app.
- **Una ripresa a testa** — come per l'inglese.

## Verifiche
- `python collaudo/doppiaggio.py`: TUTTO OK (878 parti italiane di cui 185 in `elevenlabs/`; la voce intera, con l'inglese, 28,4 MB su 40). `npx tsc --noEmit` pulito; autoverifica del gioco desktop SUPERATA.
- Non verificato: l'ascolto (non posso); la CI dell'ultimo commit.

## Questioni aperte
- Ascoltare Concetta in italiano (voce diversa da quella inglese) e, se non va, rifarla con la voce giusta.
- **Una CI è fallita sul commit a10a727**: il collaudo della sequenza finale (`app/scripts/finale-node.mjs`) si aspettava l'etichetta dei crediti «Imma, Rosaria, Tore e Vito»; ora si aspetta «I personaggi» (corretto nel commit successivo). Lo avevo scritto «il collaudo non controlla i crediti» e non lo avevo rilanciato: ora la CI è il controllo.
- Simone ascolta tutto sul gioco desktop (`node prepara.mjs`, poi `npm run avvia` in `desktop/`), in italiano e in inglese.
- La licenza delle voci a pagamento e il rilascio (1.41.0), solo quando lo dice Simone.
