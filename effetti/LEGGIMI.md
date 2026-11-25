# Gli effetti sonori generati con ElevenLabs

Gli effetti sonori del censimento ([`pre-produzione/12-suoni.md`](../pre-produzione/12-suoni.md)) generati il 25 novembre 2026
con ElevenLabs Sound Effects v3, dal connettore, su richiesta di Simone. **Sono nel gioco dalla stessa sera**: 27 effetti, 81 file
Opus in [`app/public/effetti/`](../app/public/effetti/) (306 KB), suonati dai loghi, dal trailer e dalla mappa al posto dei rumori
sintetici (`app/src/lib/effetti.ts`). Le parti intonate (bip, campane, arpa, accordi), i suoni che il trailer fa solo senza il brano
e il trofeo restano sintetici. Se gli effetti mancano, il gioco suona i sintetici di prima.

- **I master** (`effetti/master/`, 87 MP3 a 44,1 kHz stereo, 4,3 MB) stanno **fuori da git**, come quelli del doppiaggio: dove sono e
  che copie hanno lo dice [`sviluppo/REGISTRO.md`](../sviluppo/REGISTRO.md) (M18). Nella stessa cartella c'è `ascolta.html`, una
  pagina per ascoltarli tutti, divisi per suono.
- **Come si rifanno**: `python strumenti/effetti.py` (dai master scelti agli Opus e all'indice: taglio, colpi singoli dalle
  sequenze, livello) e, col server di sviluppo acceso, `desktop\node_modules\.bin\electron strumenti\effetti-livelli.cjs` (i
  livelli nel gioco: ogni effetto con la stessa energia del sintetico che sostituisce, misurata offline). Li controlla
  `collaudo/effetti.py`, nella CI.
- **Sul conto ElevenLabs** stanno nel flusso «Il Viaggiatore — effetti sonori» (`sOtfNDpviUp3irKuSxHr`).
- **La licenza** non è ancora decisa: finché non si legge nei termini di ElevenLabs che cosa permette il piano di Simone, valgono come
  le voci ElevenLabs, escluse dalla licenza libera (`LICENSE-CONTENUTI.md`).
- **Il costo**: 87 generazioni, **circa 555 crediti** (3,33 crediti per secondo generato: da 1,7 per mezzo secondo a 20 per sei
  secondi), sommati dai costi che il connettore dà per ogni generazione. Il preventivo del connettore ne diceva 2.354: era molto
  più alto del vero.

## Le prese scelte

Simone ha lasciato la scelta a Claude («scegli tu, alcuni sono proprio impercettibili e altri molto simili»). Ogni presa è stata
misurata (picco, energia della parte attiva, durata del suono vero, colpi, timbro, somiglianza con le altre prese dello stesso suono):
fra prese simili vince la più piena; dove servono varianti, le più diverse; dalle sequenze, i colpi più puliti, portati tutti alla
stessa energia. Poi ogni effetto è stato livellato al picco di −1,5 dBFS: niente resta impercettibile, e il livello nel gioco lo dà il
codice.

| Effetto nel gioco | File | Dalle prese |
|---|---|---|
| `tv-acceso`, `ronzio` | 1, 1 | L01_3; L02_1 (più ronzio che fruscio) |
| `schermo`, `testina`, `zip`, `colpo` | 1 ciascuno | L03_2; L05_3 (l'unica lunga quanto la corsa); L08_1; L09_1 (il più grave) |
| `riflesso` | 2 | L13_3 per Runtime, L13_2 per FAVELLA |
| `spegne`, `punto`, `scintilla`, `libro`, `penna` | 1 ciascuno | L14_1; L15_1; L16_3; L18_2; L21_3 |
| `pagina`, `soffio-lettera` | 3, 2 | L19_2, L19_3, L19_1; L23_2, L23_1 |
| `tic`, `tasto-motto` | 6, 8 | colpi singoli da L07_1 e L07_2; da L25_1, L25_3, L25_2 |
| `busta`, `biglietto`, `timbro`, `soffio` | 3, 1, 1, 2 | T01a_1–3; T01b_3; T03_3; T04_3 e T04_1 |
| `tasto` | 8 | colpi singoli da T02_2, T02_3, T02_1 |
| `passo-asfalto`, `passo-crosta`, `passo-sale`, `passo-sassi` | 8 ciascuno | colpi singoli dalle tre prese di T05a, T05b, T05c, T05d |
| `carta-apre`, `carta-chiude` | 1, 1 | M01_3; M02_2 |

Il trofeo (G01) **non** è entrato: è una nota precisa (un Mi), e le tre prese sono soffi «da flauto» senza un'altezza sicura.

## I master

Il nome è il numero del censimento e la presa: `T05a_2.mp3` è la seconda presa di T05a. Durata in secondi.

| Suono | Prese | Durata | Prompt |
|---|---|---|---|
| L01 · il televisore che si accende | 3 | 1,2 | Old CRT television switching on, low thump, static discharge, faint high-pitched tube whine |
| L02 · il ronzio del tubo (in giro) | 4 | 5,0 | CRT television hum, steady 50 Hz mains buzz, faint high hiss, close-mic |
| L03 · lo schermo che si apre | 4 | 0,6 | Short airy whoosh rising in pitch, soft electronic swell |
| L05 · la corsa della testina | 3 | 1,0 | Tape head scanning across, soft rising mechanical whir, electronic hiss |
| L07 · i ticchettii di MULTIMEDIA (da tagliare) | 3 | 2,0 | Rapid tiny digital ticks, dry data clicks, close-mic, evenly spaced |
| L08 · il triangolo che si chiude | 4 | 0,5 | Fast zipper-like rising swipe, bright synthetic zip |
| L09 · il colpo | 3 | 0,7 | Deep punchy kick drum hit with short click, tight, dry |
| L13 · il riflesso (anche L27) | 3 | 0,8 | Soft shimmering airy sweep, glassy high sparkle, gentle |
| L14 · lo spegnimento | 3 | 0,6 | Old television switching off, quick descending electronic zap collapsing to silence |
| L15 · il punto che si spegne | 3 | 0,5 | Small soft low thump with a tiny high click |
| L16 · la scintilla della gemma | 3 | 1,0 | Tiny magical sparkle, bright crystalline glint, soft airy shimmer |
| L18 · il libro che si apre | 3 | 0,8 | Heavy old book opening on a wooden desk, soft thud, papery breath |
| L19 · la pagina | 3 | 0,5 | Single page turning, quick dry paper flick, close-mic |
| L21 · le graffe che si scrivono | 3 | 0,9 | Quick pen stroke on paper, light scratchy swoosh |
| L23 · il soffio per lettera | 3 | 0,5 | Short soft breathy whoosh, low and gentle |
| L25 · i tasti del motto (da tagliare) | 3 | 4,0 | Soft vintage keyboard typing, individual key presses with a few spacebar presses, close-mic |
| T01a · la busta che cade | 3 | 0,5 | Envelope dropping onto a wooden table, soft paper slap |
| T01b · il biglietto che si posa | 3 | 0,5 | Stiff card placed on paper, light papery tap |
| T02 · i tasti del biglietto (da tagliare) | 3 | 3,0 | Soft muted typewriter key strikes, steady quick rhythm, close-mic |
| T03 · il timbro | 3 | 0,6 | Rubber stamp pressed hard on paper on a wooden desk, dull thump |
| T04 · il soffio di passaggio | 3 | 0,8 | Soft whoosh transition, airy, rising |
| T05a · i passi sull'asfalto (da tagliare) | 3 | 6,0 | Slow footsteps of one man walking on dry cracked asphalt, leather boots, steady pace, close |
| T05b · i passi sulla crosta (da tagliare) | 3 | 6,0 | Slow footsteps of one man walking on dry cracked mud crust, crunchy snaps, steady pace, close |
| T05c · i passi sul sale (da tagliare) | 3 | 6,0 | Slow footsteps of one man crunching across a dry salt flat, soft granular crush, steady pace, close |
| T05d · i passi sui sassi (da tagliare) | 3 | 6,0 | Slow footsteps of one man walking on loose dry river pebbles, stones clicking, steady pace, close |
| M01 · la carta che si spiega | 3 | 1,0 | Unfolding a large old paper map, crisp crackling folds, soft settle on a table |
| M02 · la carta che si ripiega | 3 | 0,5 | Quickly folding a paper map, short crisp rustle |
| G01 · il trofeo (prova) | 3 | 2,0 | Single soft breathy flute note, gentle, warm, short |

Tutti con `prompt_influence` 0,5; L02 col giro continuo (`loop`). Le parti intonate del censimento (bip, campane, arpa, accordi) e i
suoni che il trailer fa solo senza il brano (rintocchi, tonfi, vento, bordone) non sono stati generati, di proposito.

## Le misure all'arrivo

I picchi vanno da −1,3 dB (T03_3) a −44 dB (L01_2): i suoni vanno livellati prima di entrare nel gioco. Molto bassi: L01 (−36 ÷ −44),
L02 (−33 ÷ −40), L15_2, L21_1, L23_1 e L23_3 (sotto i −28). Le misure si rifanno con `ffmpeg -af volumedetect`.
