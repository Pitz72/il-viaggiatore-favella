# Le voci scelte

> Chi ha detto che cosa, per non doverlo ricordare. Una riga per personaggio: il motore, la voce
> e le impostazioni con cui è stato generato l'audio che c'è oggi. Si aggiorna a ogni
> generazione. Le descrizioni delle voci stanno in `voci.md`.

## Gemini 3.8 Flash TTS (Google AI Studio)

Voce di libreria + descrizione di `voci.md` incollata nel campo accanto alla voce; stile vuoto per
Kira ed Enzo, «Delivery: …» per i personaggi.

| Voce | Voce di libreria | Generato | Nota |
|---|---|---|---|
| Narratore (e le scelte del giocatore) | **Enzo** | 20/10, 13:04–13:44 | 11 blocchi; «L'ho letta.» fatta il 20/10 alle 17:11 |
| Trailer (narrativo ed enfatico) | **Enzo** | 20/10, 17:10, 85 s | 33 parti su 33, tutte verificate; quattro blocchi di parlato per tono (solemn, emphatic, hushed, crisp) |
| Servizio (suggerimenti e numeri) | **Kira** | 20/10, 12:42–12:45 | l'audio contiene anche 81 scelte di riserva |
| Nunzio | Riko (dalle prove di mezzogiorno) | 20/10, 14:42 | da confermare |
| Saverio, Iole, Rocco, Peppe, Ciro, Pasquale, Concetta, Onofrio | non registrata | 20/10, 14:44–15:10 | Simone non ricorda quale voce di libreria |
| Cosimo | non registrata | 20/10, 15:12 | idem |
| Vito | non registrata | 20/10, 14:51 | **sostituito intero da ElevenLabs (Luigi)** |
| Tore | non registrata | 20/10, 15:08 | **sostituito intero da ElevenLabs (Criss)** |

## ElevenLabs (Eleven v4, `eleven_v4`)

Impostazioni di partenza di Simone: Stability 50, Similarity 75, velocità 100 (le impostazioni di ogni generazione sono nel nome del file scaricato: «s» = Stability, «sb» = Similarity, «sp» = velocità); lingua italiana; tono a inizio
riga come tag fra parentesi quadre.

| Personaggio | Voce | Generato | Nota |
|---|---|---|---|
| Imma | **Victoria** | 20/10 (16:12), 83,7 s | 22 parti su 22, tutte verificate; il nome del file dice «Roger», ma la voce è Victoria (l'ha riconosciuta Simone a orecchio; la mia misura dell'altezza dice voce femminile, circa 185 Hz) |
| Rosaria | **Valeria** («Warm, Expressive, Authentic», clone professionale) | 20/10 (16:31), 74,6 s | 15 parti su 15, tutte verificate; impostazioni diverse da Imma: Stability 75, velocità 0,96, Similarity 75 |
| Tore | **Criss** («Radio Podcast», clone professionale) | 20/10 (16:36), 70,8 s | 13 righe su 13, tutte verificate; sostituisce per intero l'audio Gemini (archiviato in `generati/archivio/tore-gemini.txt`, clip in `master/clip/tore-gemini/`); voce maschile, circa 120 Hz; nel nome del file: velocità 70, Stability 0, Similarity 0 (la velocità non ha effetto in v4: il ritmo è identico alle altre, circa 180 parole al minuto) |
| Vito | **Luigi** («Mature, Hoarse and Balanced», clone professionale) | 20/10 (16:40), 61,1 s | 19 righe su 19, tutte verificate; sostituisce per intero l'audio Gemini (archiviato in `generati/archivio/vito-gemini.txt`, clip in `master/clip/vito-gemini/`); voce maschile, circa 130 Hz (Tore 120: non stanno mai nella stessa scena); Stability 50, Similarity 75; la parte 2 («Tu.») ha il taglio incerto: da ascoltare |

### In inglese (1/11/2026)

Gli stessi quattro personaggi, con le stesse voci, in inglese: blocchi `doppiaggio/en/blocchi/imma.txt` … `vito.txt`, tag `[Italian accent][tono]` davanti a
ogni battuta (documentazione: `doppiaggio/en/eleven-v4.md`). Generati da Simone il 1° novembre 2026, scaricati in MP3 (44,1 kHz, mono, 128 kbit/s); le impostazioni
sono nel nome del file.

| Personaggio | Voce | Generato | Nota |
|---|---|---|---|
| Vito | **Luigi** | 1/11, 07:18, 62,1 s | 19 parti su 19; velocità 0,86, Stability 50, Similarity 75 |
| Tore | **Criss** | 1/11, 07:21, 69,4 s | 13 parti su 13; velocità 0,7, Stability 0, Similarity 0 (come in italiano) |
| Imma | **Victoria** («Elegant & Dark Aristocrat», clone professionale) | 1/11, 07:29, 82,5 s | 22 parti su 22; velocità 1, Stability 50, Similarity 75 |
| Rosaria | **Valeria** | 1/11, 07:32, 75,3 s | 15 parti su 15; velocità 0,96, Stability 75, Similarity 75 |

Le voci italiane in inglese si riconoscono «soprattutto nella pronuncia dei nomi» (Simone, 1/11/2026): l'accento chiesto è `Italian accent`, la prova delle
alternative (`doppiaggio/en/prove/`) non è stata fatta.
