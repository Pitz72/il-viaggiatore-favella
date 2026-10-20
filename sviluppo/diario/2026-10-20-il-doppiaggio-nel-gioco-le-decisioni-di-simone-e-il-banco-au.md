---
data: 2026-10-20
ora: "17:36"
titolo: "Il doppiaggio nel gioco: le decisioni di Simone e il banco audio"
tipo: sessione
versione: 1.18.2
---

# Il doppiaggio nel gioco: le decisioni di Simone e il banco audio

## In breve
Comincia l'integrazione del doppiaggio nell'app (piano `pre-produzione/08-doppiaggio-tts.md`): Simone ha chiuso le sei decisioni aperte del piano, una alla volta, prima di scrivere codice. La più pesante: l'audio di ElevenLabs è del piano gratuito, quindi i quattro personaggi fatti con ElevenLabs vanno rifatti prima del rilascio.

## Contesto
La produzione audio è finita (28 blocchi su 28, circa 90 minuti, voce di diario «Il doppiaggio: lo strumento dei blocchi e il pilota su Z1»). Il piano 08 elencava sei decisioni da prendere con Simone prima del software. Simone è stanco: una cosa per volta, risposte brevi, e ogni fase si mostra prima di passare alla successiva.

## Lavoro fatto
- Le sei decisioni, presentate una per volta con la mia raccomandazione, registrate nella sezione 4 del piano 08; le sezioni 3.1, 3.2, 3.3, 3.5 e 3.6 allineate alle risposte.
- Verificate sulla pagina ufficiale di ElevenLabs («Can I publish the content I generate on the platform?», 20/10/2026) le condizioni d'uso: il piano gratuito non ha licenza commerciale e chiede «elevenlabs.io» nel titolo; tutti i piani a pagamento hanno la licenza commerciale (salvo i servizi in beta), valida per sempre su ciò che si è generato mentre si pagava; ciò che si genera fuori da un piano a pagamento, prima o dopo, non si può usare commercialmente.

## Decisioni
- **Voci miste (10 Gemini, 4 ElevenLabs)** — perché il giudizio vero si dà a orecchio in gioco: chi stona si rifà, da solo.
- **La riga di `STATO` resta muta** — scelta di Simone: nessuna generazione in più; in voce recitata il comando si legge a schermo. (Io avevo raccomandato di registrarla con Kira.)
- **La versione web ha la voce** — è la stessa build del desktop e ogni parte si scarica solo quando suona: non costa lavoro.
- **Un file Opus per parte**, caricato quando serve — più semplice di un archivio con indice e uguale su desktop e web.
- **Le scelte del giocatore si leggono al passaggio del mouse** — risposta di Simone, al posto del «segnale prima delle scelte»: niente lettura automatica dopo la battuta, niente suono; il narratore legge la scelta su cui passa il mouse, e io aggiungo lo stesso per la scelta che prende il fuoco da tastiera, perché il gioco si usa anche senza mouse. Ciò che suonava si ferma.
- **ElevenLabs: Imma, Rosaria, Tore e Vito si rifanno prima del rilascio** — Simone li ha generati sul piano gratuito, che non concede l'uso commerciale, mentre il gioco è CC BY-SA (che lo permette a chiunque). Con che cosa rifarli (Gemini, o ElevenLabs su un piano a pagamento) si decide più avanti. **Nel frattempo il loro audio resta solo in locale**: suona sul PC di Simone, ma non va su GitHub né nei pacchetti, dove quelle battute restano mute.

## Verifiche
(Si aggiungono a fine di ogni fase.)

## Questioni aperte
- Rifare Imma, Rosaria, Tore e Vito (Gemini o ElevenLabs a pagamento) prima del rilascio.
- «Bevi.» di Kira (`doppiaggio/master/da-ascoltare/servizio-parte-1-bevi.wav`) da ascoltare.
