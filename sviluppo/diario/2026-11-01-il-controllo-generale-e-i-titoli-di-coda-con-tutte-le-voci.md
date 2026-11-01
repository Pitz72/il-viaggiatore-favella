---
data: 2026-11-01
ora: "12:20"
titolo: "Il controllo generale e i titoli di coda con tutte le voci"
tipo: sessione
versione: 1.40.1
---

# Il controllo generale e i titoli di coda con tutte le voci

## In breve
Chiuso il doppiaggio (Simone: «per questo lavoro del doppiaggio abbiamo finito»): controllo generale di tutto il repository e titoli di coda, in italiano e in inglese, che dicono tutte le voci, quella di ogni personaggio compresa.

## Contesto
Simone ha chiesto prima un controllo generale e poi «i credits finali sia in italiano che in inglese con tutte le voci, tutte le cose che vanno riportate». I titoli stanno in `app/src/finale/crediti.ts` e scorrono alla fine della sequenza finale e da Extra → Titoli di coda (`components/SequenzaFinale.tsx`); fino a oggi dicevano «Voci: Gemini TTS» e «I personaggi: voci ElevenLabs», senza nomi.

## Lavoro fatto
- **Il controllo generale**: tutti i passi del job «collaudo» della CI rifatti in locale (versioni, diario, registro, prove del processo principale e della data, compilazione, i nove finali, prove mirate, salvataggi, scorte, ponte dell'interfaccia, fili, partite a mano, conferme, testo del motore, opzioni, posti, trofei, sequenza finale, pulsanti, mappa, trofei, musica, doppiaggio, traduzione): **25 su 25 OK**; `npx tsc --noEmit` pulito; autoverifica del gioco desktop superata; i due commit precedenti con la CI verde. Non rifatti: l'esploratore (cinque minuti, «non blocca»: la storia e il motore non sono stati toccati) e i pacchetti (build di Windows e Linux, solo in CI).
- **Documenti rimessi in pari** (dicevano ancora che i personaggi erano di Gemini o «sul piano gratuito»): `pre-produzione/08-doppiaggio-tts.md` (stato al 1° novembre e decisione 6), `doppiaggio/LEGGIMI.md`, `doppiaggio/en/LEGGIMI.md`, `README.md` (la riga dei dieci personaggi su Gemini era sbagliata: tolta; la licenza «in parte gratuito e in parte abbonamento»), `LICENSE-CONTENUTI.md` (le voci disegnate sono cinque, Tosca non c'è più), `sviluppo/PROSSIMI-PASSI.md`.
- **I titoli di coda** (`crediti.ts`, in italiano e in inglese, riga per riga):
  - «Il narratore e la voce di servizio» / «The narrator and the service voice»: Enzo e Kira, Google Gemini 3.8 Flash TTS, in italiano e in inglese (CC BY-SA 4.0);
  - «I personaggi» / «The characters»: voci ElevenLabs (Eleven v4), **elevenlabs.io**, nove della Voice Library, dei loro autori, e cinque disegnate con il Voice Design, solo uso non commerciale, fuori dalla licenza libera;
  - «Le voci dei personaggi» / «The characters' voices»: una riga per personaggio, nell'ordine del doppiaggio: Imma · Victoria, Rosaria · Valeria, Tore · Criss, Vito · Luigi, Concetta · voce disegnata (America Marchetti), Iole · Elettra, Onofrio · Nonno Ben, Ciro · Pierpaolo, Peppe · Vittorio, Cosimo · Corrado Noventa, Nunzio · voce disegnata (Ermenegildo Meliconi), Saverio · voce disegnata (Ignazio Rossi), Rocco · voce disegnata (Ciro Esposito), Pasquale · voce disegnata (Carmine Lo Russo).
  Le altre righe (storia, musiche, canzone, ritratti, codice, motore, componenti, marchi) non cambiano. `SequenzaFinale.tsx`: il testo di una riga può andare a capo (`white-space: pre-line`).
- **La prova**: `app/scripts/finale-node.mjs` (15 prove, 4 nuove): l'ordine delle righe, l'attribuzione «elevenlabs.io» in italiano e in inglese, l'inglese con le stesse righe e nessun testo vuoto, e **tutti e quattordici i personaggi di `doppiaggio/en/manifest.json` nelle due liste, nessuno di più**, con le cinque voci disegnate dichiarate come tali.
- **Visto con gli occhi** (anteprima del gioco, Extra → Titoli di coda, in italiano e in inglese, a 1280×720): la colonna sale per 2.935 px in 106 s (circa 28 px/s al 1920×1080 di progetto, lenta e leggibile); l'elenco delle voci (564 px, 14 righe) sta intero in una schermata; nessun errore in console.

## Decisioni
- **Le voci disegnate si dicono tali, col nome fra parentesi** — i nomi che il Voice Design dà alle voci («America Marchetti», «Ciro Esposito»…) sembrano nomi di persona: scrivere «Rocco · Ciro Esposito» farebbe credere a una persona vera, o a Ciro. Così il nome resta (è ciò che c'è nello spazio ElevenLabs) e non inganna. Scelta di formato mia, da confermare.
- **Un elenco, non quattordici righe** — una riga per personaggio nel formato «etichetta / valore» dei titoli sarebbe stata troppo lunga e spaziata; un solo blocco con `\n` si legge meglio e il test lo tiene d'occhio.
- **Niente SynthID, Whisper, ffmpeg nei titoli** — la filigrana è già in README e licenza; gli strumenti di produzione non sono nel pacchetto.
- **Non toccato**: nessuna scritta sull'uso dei modelli Claude: c'è già l'avviso d'apertura («generato con un importante ausilio dei modelli LLM della famiglia Claude»).

## Verifiche
- `node app/scripts/finale-node.mjs`: TUTTO OK (15 prove). `npx tsc --noEmit` pulito.
- Il controllo generale rifatto **dopo** le modifiche ai titoli: 25 passi su 25 OK; autoverifica del gioco desktop SUPERATA («voce inglese: 845 parti»); copie su `F:`: 15 MP3 italiani e 15 inglesi di ElevenLabs, SHA-256 verificato e uguale al clone; CI di `b44ebc7` (Concetta) verde.
- Non verificato: l'ascolto del gioco, il rilascio e le licenze delle voci a pagamento.

## Questioni aperte
- Simone dice «che cosa altro serve»: oltre al doppiaggio, che per lui è chiuso, restano l'ascolto di tutto nel gioco desktop e il rilascio 1.41.0 (solo su suo ordine).
- La licenza delle voci a pagamento (non verificata: decide Simone).
- Il formato dell'elenco delle voci nei titoli (nomi delle voci disegnate fra parentesi): confermare.
