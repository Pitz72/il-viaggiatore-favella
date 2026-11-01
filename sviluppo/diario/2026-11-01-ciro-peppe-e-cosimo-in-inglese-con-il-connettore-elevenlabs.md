---
data: 2026-11-01
ora: "10:40"
titolo: "Ciro, Peppe e Cosimo in inglese con il connettore ElevenLabs"
tipo: sessione
versione: 1.40.1
---

# Ciro, Peppe e Cosimo in inglese con il connettore ElevenLabs

## In breve
Simone ha collegato il connettore ElevenLabs a Claude, ha approvato le voci candidate e ha detto «procedi»: per la prima volta **ho generato io l'audio**.
Ciro, Peppe e Cosimo parlano ora inglese nel gioco, con le voci di libreria Pierpaolo, Vittorio boy next door e Corrado Noventa. Sono dieci i personaggi in
inglese (169 parti); restano in italiano Nunzio, Saverio, Rocco e Pasquale, per i quali non c'è ancora una voce.

## Contesto
Dopo i sette personaggi (diario «Concetta, Iole e Onofrio in inglese: taglio, banco e gioco») Simone ha chiesto se potevo individuare le voci e indicare nello script
l'età e lo stato dei personaggi; ho preparato i blocchi dei sette rimasti con età e stato (`stati.json`) e le schede di ricerca. Poi ha fatto notare i connettori di
ElevenLabs per Claude e li ha collegati: con `creative_list_voices` ho cercato le voci e ne ho proposte per Cosimo, Ciro e Peppe (`doppiaggio/en/voci-eleven.md`).
Simone: «le voci indicate vanno bene. Procedi». Per Cosimo le candidate erano quattro: ho scelto la prima, Corrado Noventa.

## Lavoro fatto
- **Generazione** (`creative_generate_speech`, `eleven_v4`, `generations_count` 1, impostazioni predefinite): il testo è quello dei blocchi di `doppiaggio/en/blocchi/`, identico
  al carattere (verificato con `diff` dopo la riscrittura dei blocchi). Costo: Ciro 1.230 crediti, Peppe 1.802, Cosimo 4.226; in tutto **7.258 crediti** di Simone, un credito per carattere.
  Il connettore non permette di impostare Stability e Similarity nella chiamata (restano i valori predefiniti: Stability 0,5).
- **Download** dai link firmati (valgono due ore) dello spazio di Simone: tre MP3 a 44,1 kHz mono 128 kbit/s, come quelli che scarica lui; in `doppiaggio/master/en-grezzi/elevenlabs/`,
  convertiti in WAV, copiati su `F:` con SHA-256 uguale. L'audio resta anche nei flussi di ElevenLabs di Simone.
- **Strumenti**: `PERSONAGGI` di `strumenti/doppiaggio-inglese.py` comprende anche Ciro, Peppe e Cosimo (dieci); i blocchi sono passati da `prove/` a `blocchi/`.
- **Taglio e controllo** (`doppiaggio-taglia.py en-ciro` … `--controlla`): 11 su 11, 17 su 17, 31 su 31, ognuna sopra l'85% e senza parole in più; nessun tag letto. Il ritmo è alto
  (Peppe 256 parole al minuto, Cosimo 226): è quello che il modello ha deciso.
- **Banco e gioco**: 59 Opus nuovi in `app/public/voce/en/elevenlabs/` (169 parti di dieci personaggi, 821 parti inglesi, 58,1 minuti, 13,6 MB; la voce intera, con l'italiano, 28,3 MB su 40).
  Testi d'interfaccia: «il narratore, la voce di servizio e **dieci** personaggi parlano in inglese; gli altri quattro restano italiani».

## Decisioni
- **Corrado Noventa per Cosimo** — scelta mia fra Corrado Noventa, Giuseppe Barbasso, Dade M e Luca Brasi Profondo: voce italiana, mezza età, profonda e bassa, drammatica. Cosimo è il confronto
  finale e il blocco più lungo (31 battute, 2.227 caratteri); se all'ascolto non regge, si rifà con un'altra voce (4.226 crediti).
- **Una ripresa a testa** — `generations_count` 1 (il predefinito è 2): costa la metà, e il controllo parte per parte dice se una frase è stata saltata o storpiata.
- **Stesso accento per tutti e tre** — `Italian accent`, come i primi; Peppe ha un accento milanese di suo (Vittorio), Ciro uno del sud (Pierpaolo): un'altra cosa da sentire.
- **Le voci per Nunzio, Saverio, Rocco e Pasquale** — non trovate fra le italiane. Il Voice Design (`creative_design_voice`) le creerebbe, ma chiede una battuta di prova (100–1.000 caratteri) e la lingua
  **dette da Simone**, e spende crediti: non l'ho usato.

- **Voice Design per gli ultimi quattro** (su richiesta di Simone, «sì, disegnale»): `creative_design_voice` (modello `eleven_ttv_v3`, lingua inglese, descrizione = quella di `doppiaggio/voci.md` di ciascuno,
  battuta di prova = le loro stesse battute inglesi): tre anteprime per Nunzio, Saverio, Rocco e Pasquale, dodici in tutto, nello spazio ElevenLabs di Simone. Non salvate: aspettano che Simone ascolti e scelga
  (`creative_save_designed_voice`). Il costo dei quattro giri non me lo dice il connettore: da guardare nel saldo.

## Verifiche
- `doppiaggio/master/clip/en-ciro|peppe|cosimo/rapporto.txt`: 11/11, 17/17, 31/31, «0 da riascoltare», somiglianza almeno 85% e senza parole in più.
- `python collaudo/doppiaggio.py`: TUTTO OK (532 di Enzo, 120 di Kira, 169 dei personaggi; 821 file; 28,3 MB con l'italiano).
- `npx tsc --noEmit` pulito; autoverifica del gioco desktop SUPERATA: «voce inglese: 821 parti (2 cartelle) per 821 parti italiane del narratore, di Kira e dei personaggi».
- Non verificato: l'ascolto (non posso), e se le voci scelte da me convincono Simone.

## Questioni aperte
- Simone ascolta Ciro, Peppe e Cosimo e dice se rifare qualcuno con un'altra voce.
- Nunzio, Saverio, Rocco, Pasquale: voci da scegliere a mano o da disegnare; poi blocco, generazione (circa 1.500 caratteri di testo più i tag), taglio, banco.
- Poi, se avanzano crediti, le voci italiane di Gemini rifatte con ElevenLabs.
- La licenza delle voci a pagamento (vedi diario precedente) e il rilascio (1.41.0) solo quando lo dice Simone.
