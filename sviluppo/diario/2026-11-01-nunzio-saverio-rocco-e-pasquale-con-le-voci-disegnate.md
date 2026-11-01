---
data: 2026-11-01
ora: "11:05"
titolo: "Nunzio, Saverio, Rocco e Pasquale con le voci disegnate"
tipo: sessione
versione: 1.40.1
---

# Nunzio, Saverio, Rocco e Pasquale con le voci disegnate

## In breve
Con le voci disegnate e scelte da Simone, Nunzio, Saverio, Rocco e Pasquale parlano inglese nel gioco: **tutti e quattordici i personaggi sono in inglese**
(193 parti). In modo «inglese» non resta più niente che suoni in italiano, e il collaudo lo pretende.

## Contesto
Per i quattro non c'erano voci italiane adatte in libreria. Simone ha detto «sì, disegnale»: ho usato il Voice Design di ElevenLabs (`creative_design_voice`,
modello `eleven_ttv_v3`, lingua inglese) con la descrizione di ciascuno in `doppiaggio/voci.md` e, come battuta di prova, le loro stesse battute; tre anteprime a testa,
dodici in tutto. Simone le ha ascoltate e ha salvato la sua scelta per tutti e quattro: «ho salvato le voci scelte per tutti e quattro».

## Lavoro fatto
- **Quali voci**: il connettore pubblica come contesto solo l'ultima voce salvata (Pasquale: «Carmine Lo Russo»); le altre tre le ho trovate elencando le voci dello spazio di lavoro
  (`creative_list_voices` senza filtri: sono le «generated») e abbinandole per descrizione: Nunzio → «Ermenegildo Meliconi», Saverio → «Ignazio Rossi», Rocco → «Ciro Esposito» (**è la voce di
  Rocco, il nome è un altro: non va scambiata con Ciro**), Pasquale → «Carmine Lo Russo». In tutti e quattro i casi Simone ha tenuto la prima anteprima.
- **Generazione** (`creative_generate_speech`, `eleven_v4`, una ripresa a testa, impostazioni predefinite): il testo è quello dei blocchi di `doppiaggio/en/blocchi/` (con età e stato nel tag:
  `elderly man…`, `thin man in his forties…`, e per Pasquale `sick with fever` nelle prime due battute e `recovered from the fever` nelle altre due). Costo 1.059 + 792 + 694 + 507 = **3.052 crediti**.
- **Download e taglio**: quattro MP3 dai link firmati, convertiti in WAV, tagliati e controllati: 7 su 7, 8 su 8, 5 su 5, 4 su 4, ognuna sopra l'85% e senza parole in più; nessun tag letto.
  I MP3 sono anche su `F:` (14 in tutto, `SHA256.txt` rifatto).
- **Strumenti**: `PERSONAGGI` di `strumenti/doppiaggio-inglese.py` ha ora tutti e quattordici; **`collaudo/doppiaggio.py` controlla che i personaggi dell'italiano siano tutti e soli quelli registrati in
  inglese** (se un giorno ne nasce uno nuovo, il collaudo lo dice).
- **Banco e gioco**: 24 Opus nuovi in `app/public/voce/en/elevenlabs/` (193 parti, 845 parti inglesi, 59,5 minuti, 14,0 MB; la voce intera, con l'italiano, 28,7 MB su 40). I testi d'interfaccia dicono ora
  «il narratore, la voce di servizio e **tutti** i personaggi parlano in inglese»; non c'è più la riga «gli altri restano italiani», e la riga della prima finestra dice che in inglese parla tutto il racconto.

## Decisioni
- **Una ripresa a testa, e la prima anteprima di ognuno** — le ha scelte Simone; io non posso giudicare un timbro. Le altre otto anteprime restano nello spazio ElevenLabs di Simone.
- **Impostazioni predefinite** — il connettore non fa impostare Stability e Similarity: i sette personaggi generati da Simone hanno le sue impostazioni, gli altri sette quelle predefinite (Stability 0,5).
- **Il nome «Ciro Esposito» resta com'è** — è un nome che il Voice Design ha dato alla voce di Rocco; si può rinominare dall'app ElevenLabs. L'ho scritto in `doppiaggio/voci-scelte.md` per non scambiarla con Ciro.

## Verifiche
- `doppiaggio/master/clip/en-nunzio|saverio|rocco|pasquale/rapporto.txt`: 7/7, 8/8, 5/5, 4/4, «0 da riascoltare».
- `python collaudo/doppiaggio.py`: TUTTO OK (532 di Enzo, 120 di Kira, 193 dei personaggi; 845 file; «i personaggi dell'italiano (14) sono tutti e soli quelli registrati in inglese»; 28,7 MB con l'italiano).
- `npx tsc --noEmit` pulito; autoverifica del gioco desktop SUPERATA: «voce inglese: 845 parti (2 cartelle) per 845 parti italiane del narratore, di Kira e dei personaggi».
- Non verificato: l'ascolto nel gioco desktop vero (non posso), e se le voci scelte da me per Ciro, Peppe e Cosimo convincono Simone.

## Questioni aperte
- Simone ascolta tutto in modo «inglese» sul gioco desktop (`node prepara.mjs`, poi `npm run avvia` in `desktop/`) e dice che cosa rifare (e con quale voce).
- Se avanzano crediti: le voci italiane di Gemini rifatte con ElevenLabs, con la stessa voce di ogni personaggio nelle due lingue.
- La licenza delle voci a pagamento (vedi diari precedenti) e il rilascio (1.41.0), solo quando lo dice Simone.
