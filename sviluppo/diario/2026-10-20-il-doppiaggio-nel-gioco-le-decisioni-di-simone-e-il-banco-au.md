---
data: 2026-10-20
ora: "17:36"
titolo: "Il doppiaggio nel gioco: le decisioni di Simone e il banco audio"
tipo: sessione
versione: 1.19.0
---

# Il doppiaggio nel gioco: le decisioni di Simone e il banco audio

## In breve
Comincia l'integrazione del doppiaggio nell'app (piano `pre-produzione/08-doppiaggio-tts.md`): Simone ha chiuso le sei decisioni aperte del piano, una alla volta, prima di scrivere codice. La più pesante: l'audio di ElevenLabs è del piano gratuito, quindi i quattro personaggi fatti con ElevenLabs vanno rifatti prima del rilascio.

## Contesto
La produzione audio è finita (28 blocchi su 28, circa 90 minuti, voce di diario «Il doppiaggio: lo strumento dei blocchi e il pilota su Z1»). Il piano 08 elencava sei decisioni da prendere con Simone prima del software. Simone è stanco: una cosa per volta, risposte brevi, e ogni fase si mostra prima di passare alla successiva.

## Lavoro fatto
- Le sei decisioni, presentate una per volta con la mia raccomandazione, registrate nella sezione 4 del piano 08; le sezioni 3.1, 3.2, 3.3, 3.5 e 3.6 allineate alle risposte.
- Verificate sulla pagina ufficiale di ElevenLabs («Can I publish the content I generate on the platform?», 20/10/2026) le condizioni d'uso: il piano gratuito non ha licenza commerciale e chiede «elevenlabs.io» nel titolo; tutti i piani a pagamento hanno la licenza commerciale (salvo i servizi in beta), valida per sempre su ciò che si è generato mentre si pagava; ciò che si genera fuori da un piano a pagamento, prima o dopo, non si può usare commercialmente.
- Il piano di fasi (banco → voce nel gioco → testi composti → trailer → verifiche → documenti), approvato da Simone, è nella sezione 5 del piano 08.
- **Fase 1, il banco della voce.** `strumenti/doppiaggio-banco.py` prende, per ogni blocco del manifest, solo le sue parti tagliate (`master/clip/<blocco>/`: mai `tore-gemini`, `vito-gemini` né la vecchia `servizio-kira`, e mai le 81 parti `fuori_uso` di Kira), toglie il silenzio in testa e in coda (soglia −45 dBFS su 10 ms; il fondo delle clip sta fra −70 e −82), pareggia il volume di ogni blocco con un guadagno solo, codifica in Opus mono 32 kbit/s e scrive `app/public/voce/<id>.opus`, `indice.json` (id → durata in ms; le parti mute per motivo) e il resoconto `doppiaggio/banco.json`. Le voci ElevenLabs vanno in `app/public/voce/locale/`, ignorata da git. Codifica deterministica (`-fflags +bitexact`): rifatto due volte, stessi byte.
- `collaudo/doppiaggio.py` (nuovo, anche in CI): ricava dai `.fav` di oggi le parti da dire (con lo stesso `strumenti/doppiaggio.py`) e pretende per ognuna un file o un motivo per tacere; niente audio scaduto; cartella uguale all'indice; Ogg Opus veri con la durata dell'indice (letta dalle pagine Ogg, senza decodificare); durate sensate per il testo; volume dal resoconto e, con ffmpeg, rimisurato sui file; peso.

## Decisioni
- **Voci miste (10 Gemini, 4 ElevenLabs)** — perché il giudizio vero si dà a orecchio in gioco: chi stona si rifà, da solo.
- **La riga di `STATO` resta muta** — scelta di Simone: nessuna generazione in più; in voce recitata il comando si legge a schermo. (Io avevo raccomandato di registrarla con Kira.)
- **La versione web ha la voce** — è la stessa build del desktop e ogni parte si scarica solo quando suona: non costa lavoro.
- **Un file Opus per parte**, caricato quando serve — più semplice di un archivio con indice e uguale su desktop e web.
- **Le scelte del giocatore si leggono al passaggio del mouse** — risposta di Simone, al posto del «segnale prima delle scelte»: niente lettura automatica dopo la battuta, niente suono; il narratore legge la scelta su cui passa il mouse, e io aggiungo lo stesso per la scelta che prende il fuoco da tastiera, perché il gioco si usa anche senza mouse. Ciò che suonava si ferma.
- **Il volume a −23 LUFS (EBU R128), non a −18** — perché le voci hanno i picchi alti rispetto alla loudness (il narratore sta a −23 con i picchi a −1 dBFS): a −18 le parti che avrebbero toccato il tetto dei picchi erano 594 su 878, a −21 238, a −23 30 (quasi tutte di meno di 1 dB; Onofrio fino a 2,8). Si alza di meno la parte intera, non si comprime: un sussurro resta un sussurro. Se in gioco la voce sembrerà piana, si alza col volume dell'app.
- **Opus a 32 kbit/s in modalità parlato** — il 90% delle parti esce dalla codifica entro ±0,8 dB di loudness; perdono di più le voci soffiate (la battuta «febbrile» di Pasquale −2,7 LU: Opus a 32 e 48 kbit/s rende più piano il soffio fra 6 e 8 kHz; a 64 kbit/s no, ma il peso raddoppia). Lo giudica Simone all'ascolto.
- **La fase 1 è già la 1.19.0** — il pacchetto si porta dietro un contenuto nuovo (61 minuti di voce, 13,7 MB) anche se il gioco non lo suona ancora; fra PATCH e MINOR, `VERSIONI.md` dice di scegliere il più alto. La voce che si sente in gioco (fase 2) sarà la 1.20.0.
- **ElevenLabs: Imma, Rosaria, Tore e Vito si rifanno prima del rilascio** — Simone li ha generati sul piano gratuito, che non concede l'uso commerciale, mentre il gioco è CC BY-SA (che lo permette a chiunque). Con che cosa rifarli (Gemini, o ElevenLabs su un piano a pagamento) si decide più avanti. **Nel frattempo il loro audio resta solo in locale**: suona sul PC di Simone, ma non va su GitHub né nei pacchetti, dove quelle battute restano mute.

## Verifiche
- **Fase 1:** `collaudo/doppiaggio.py` TUTTO OK (878 parti da dire, 809 con il file, 69 mute col motivo; nessuna scaduta; durate e volumi a posto, rimisurati con ffmpeg); provato anche che fallisce (un file tolto, una durata falsata, un id inventato: tre KO). Gli altri dieci collaudi (finali, mirate, salvataggi, scorte, interfaccia, fili, giocate, testo, conferme, pulsanti) TUTTO OK; `npx tsc --noEmit` pulito; `npm run build`: `dist` 32,1 MB, di cui 13,7 MB di voce (più 1,1 MB in `locale/`, solo su questo PC).
- Loudness dei blocchi dopo la codifica: da −22,0 a −24,8 LUFS (bersaglio −23); picco vero massimo −0,3 dBTP (due parti del narratore, che decodificate superavano 0 dBFS, sono state ricodificate 1,1 dB più piano).

## Questioni aperte
- Rifare Imma, Rosaria, Tore e Vito (Gemini o ElevenLabs a pagamento) prima del rilascio.
- «Bevi.» di Kira (`doppiaggio/master/da-ascoltare/servizio-parte-1-bevi.wav`) da ascoltare.
