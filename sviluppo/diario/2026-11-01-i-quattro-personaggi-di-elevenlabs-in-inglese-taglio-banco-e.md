---
data: 2026-11-01
ora: "08:36"
titolo: "I quattro personaggi di ElevenLabs in inglese: taglio, banco e gioco"
tipo: sessione
versione: 1.40.1
---

# I quattro personaggi di ElevenLabs in inglese: taglio, banco e gioco

## In breve
Simone ha saltato la prova di accento e ha generato direttamente i quattro blocchi (Imma, Rosaria, Tore, Vito) con le loro voci italiane di
ElevenLabs. Le 69 parti sono tagliate, controllate una per una, nel banco e nel gioco: in modo «inglese» parlano anche loro. Restano in
italiano gli altri dieci personaggi.

## Contesto
Dopo la preparazione dei blocchi (diario «I personaggi di ElevenLabs in inglese: i blocchi e la prova di accento») Simone ha scritto: «vado
direttamente con la generazione», e poi ha mandato i quattro MP3: «Che le voci sono italiane si sente soprattutto nella pronuncia dei nomi. Ho
sentito tutto e se trovi delle anomalie fonetiche non ci sono. Se ci sono delle anomalie nella generazione delle frasi non lo so.» L'ultima cosa è
quella che il taglio controlla: ogni parte riconosciuta da sola e confrontata col testo.

## Lavoro fatto
- **Gli audio**: 4 MP3 (44,1 kHz mono, 128 kbit/s; Luigi 62,1 s, Criss 69,4 s, Victoria 82,5 s, Valeria 75,3 s) copiati in
  `doppiaggio/master/en-grezzi/elevenlabs/` e convertiti in WAV con `ffmpeg` (il taglio legge solo WAV); riconosciuti con
  `doppiaggio-riconosci.py --lingua en` (ogni WAV al suo blocco, 99–100%).
- **Taglio e controllo** (`doppiaggio-taglia.py en-imma` … `--controlla`; il taglio conosce ora la chiave `personaggi` del manifest inglese e il
  riconoscitore anche): 69 parti su 69 trovate, nessuna da riascoltare; controllo di ognuna da sola sopra l'85% e senza parole in più in tutte e
  quattro; nessun tag letto ad alta voce. Pause fra le battute da 0,11 a 0,72 s.
- **Banco** (`doppiaggio-banco.py --lingua en`): i quattro blocchi vanno in `app/public/voce/en/elevenlabs/`, con indice e licenza loro (come in
  italiano), ognuno a −23 LUFS. Vito era il più piano (−26,2 LUFS, +3,2 dB); Kira era a −17, Imma a −18,8, Tore a −18,4, Rosaria a −20,9. Il banco ora tratta
  la cartella a parte anche in inglese. I 652 Opus di prima non cambiano.
- **Gioco**: `app/src/gioco/voce.ts` legge anche le cartelle a parte dell'indice inglese; `app/src/autoverifica.ts` controlla una parte per cartella e le
  corrispondenze con le due cartelle. I testi d'interfaccia (opzioni, prima finestra, `opzioni.ts`, README) dicono ora «il narratore, la voce di servizio e
  quattro personaggi (Imma, Rosaria, Tore e Vito) parlano in inglese; gli altri dieci restano italiani» (non sono testi della storia: nessun doppiaggio da
  rifare).
- **Collaudo** (`collaudo/doppiaggio.py`, sezione 9): ora controlla anche i quattro personaggi inglesi e la cartella a parte (licenza, indice, file, durate,
  volume, corrispondenze, peso).
- **Backup e pulizia**: i 4 MP3 su `F:` con `SHA256.txt`, poi tolti da `Downloads`.
- **Dopo, un esperimento di Simone** (10.000 crediti di ElevenLabs rimasti): il blocco di Concetta, l'unica donna anziana (85 anni), in inglese
  (`doppiaggio/en/prove/concetta.txt`, `[strong Italian accent]` perché la sua scheda dice «un forte sapore regionale del sud») e in italiano
  (`doppiaggio/DA-FARE/`, fuori da git). Nuovo comando `python strumenti/doppiaggio-inglese.py personaggio --voce Concetta`; non entra nel manifest, quindi il
  collaudo non lo pretende. Se l'esperimento piace, Concetta si aggiunge a `PERSONAGGI` e si taglia come gli altri quattro.
  Subito dopo, su richiesta di Simone, lo stesso per Iole (la sola altra donna matura: 60 anni, la diga): `doppiaggio/en/prove/iole.txt`, 12 parti,
  `[Italian accent]` perché la sua scheda dice «un lieve accento del sud», come Imma e Rosaria.
- Documenti: `CHANGELOG.md`, `LICENSE-CONTENUTI.md`, `README.md`, `pre-produzione/08-doppiaggio-tts.md`, `doppiaggio/en/LEGGIMI.md`,
  `doppiaggio/voci-scelte.md`, `strumenti/LEGGIMI.md`, `sviluppo/PROSSIMI-PASSI.md`, `sviluppo/REGISTRO.md`.

## Decisioni
- **Le parole del tag d'accento restano `Italian accent`** — è quello che Simone ha generato (il predefinito, scelto da me); le alternative della prova
  (`light`, `strong`, nessuno) non sono state provate. Simone sente le voci italiane soprattutto nei nomi, quindi l'accento è lieve; se lo vorrà più marcato,
  si rifanno i blocchi con `--accento "strong Italian accent"`.
- **Stessa licenza delle voci italiane** — le voci inglesi di Imma, Rosaria, Tore e Vito stanno in una cartella a parte, fuori dalla licenza libera, solo uso
  non commerciale. La nota di licenza nell'indice dice «sul piano gratuito»: non so se Simone ha usato lo stesso piano; da confermare.
- **Il modo «inglese» suona ora quattro personaggi in inglese e dieci in italiano** — i dieci non sono decisi (voci di libreria Gemini, prompt).

## Verifiche
- `doppiaggio/master/clip/en-*/rapporto.txt`: 19/19, 13/13, 22/22, 15/15 con somiglianza almeno 85% e senza parole in più; «long pause» non c'è in questo formato.
- `python collaudo/doppiaggio.py`: TUTTO OK (532 parti di Enzo, 120 di Kira, 69 dei personaggi; 721 file; la voce, italiana e inglese insieme, pesa 26,7 MB, tetto 40).
- `npx tsc --noEmit` pulito; l'autoverifica del gioco desktop (`node prepara.mjs` e `npm run autoverifica`): SUPERATA, «voce inglese: 721 parti (2 cartelle)
  per 721 parti italiane del narratore, di Kira e dei personaggi».
- Nel browser integrato: tutti i 69 id italiani dei personaggi ritrovano il file inglese in `voce/en/elevenlabs/` e ogni file è un Ogg; tre battute di Imma in
  modo «inglese» durano 8,46 s contro 8,35 attesi; in modo «recitata» gli stessi id danno i file italiani. Server chiuso a fine prova.
- `collaudo/interfaccia.py` e `pulsanti.py`: TUTTO OK; `node strumenti/diario.mjs registro` e `verifica`: in ordine.
- Non verificato: l'ascolto di tutto nel gioco desktop vero (non posso); se le anomalie nelle frasi che il controllo non vede (un'intonazione, un'esitazione) ci siano.

## Questioni aperte
- Simone ascolta i quattro personaggi nel gioco desktop (`node prepara.mjs`, poi `npm run avvia` in `desktop/`) e dice se qualcosa va rifatto.
- Confermare la licenza (piano gratuito) e se `Italian accent` basta.
- Gli altri dieci personaggi (Gemini): voci di libreria e prompt; poi blocchi, taglio, banco.
- Il rilascio (1.41.0) solo quando lo dice Simone.
