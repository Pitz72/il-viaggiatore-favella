---
data: 2026-11-01
ora: "09:58"
titolo: "Concetta, Iole e Onofrio in inglese: taglio, banco e gioco"
tipo: sessione
versione: 1.40.1
---

# Concetta, Iole e Onofrio in inglese: taglio, banco e gioco

## In breve
I tre esperimenti di Simone con i crediti avanzati di ElevenLabs (una donna anziana, l'altra, un uomo anziano) sono diventati voci del gioco: Concetta,
Iole e Onofrio parlano ora inglese in modo «inglese», con Imma, Rosaria, Tore e Vito. Sono sette personaggi, 110 parti. Simone ha anche comprato un
abbonamento a ElevenLabs e vuole fare in inglese con ElevenLabs tutte le voci rimaste, e poi, se avanzano crediti, rifare quelle italiane.

## Contesto
Dopo i quattro personaggi (diario «I quattro personaggi di ElevenLabs in inglese: taglio, banco e gioco») Simone ha chiesto «c'è un personaggio femminile
anziano?» (Concetta, 85 anni), «vai con l'altra anziana» (Iole, 60) e «un uomo anziano ce lo abbiamo?» (Onofrio, 80); ho preparato per ciascuno il blocco
inglese e quello italiano (comando nuovo `personaggio`). Poi Simone ha mandato tre MP3: «ho comprato il piano da sei dollari al mese, cifra indicativa.
Facciamo tutte le voci eng restanti in 11labs poi se avanzano crediti rifacciamo quelle ita. Intanto analizza queste e integrale. Non ci sono errori
evidenti per me.»

## Lavoro fatto
- **Riconoscimento**: Tosca → Concetta (100%), Elettra → Iole (99%), Nonno Ben → Onofrio (98%) contro i blocchi inglesi; contro quelli italiani solo 22–24%:
  sono tutti e tre inglesi. Non sapevo quale file fosse quale personaggio (i nomi dei file sono voci di libreria): lo ha detto il riconoscitore.
- **Strumenti**: `PERSONAGGI` in `strumenti/doppiaggio-inglese.py` comprende ora anche Concetta, Iole e Onofrio; l'accento è per personaggio (`ACCENTI`:
  `strong Italian accent` per Concetta e Onofrio, come i blocchi mandati a Simone; `Italian accent` per gli altri); i blocchi stanno in
  `doppiaggio/en/blocchi/` (non più in `prove/`: i tre `prove/<nome>.txt` sono tolti). Nel manifest ogni blocco di `personaggi` ha il suo `accento`. Il banco
  inglese prende i personaggi dal manifest inglese (non più da un elenco scritto dentro) e dà alla cartella a parte una licenza che non dice più solo «piano
  gratuito».
- **Taglio e controllo** (`doppiaggio-taglia.py en-concetta` … `--controlla`): 8 su 8, 12 su 12, 21 su 21, ognuna sopra l'85% e senza parole in più; nessun tag
  letto; pause fra le battute da 0,14 a 0,71 s.
- **Banco**: 110 parti di sette personaggi in `app/public/voce/en/elevenlabs/` (762 parti inglesi in tutto, 54,4 minuti, 12,7 MB; la voce intera, con
  l'italiano, pesa 27,5 MB su 40). Concetta esce a −24,3 LUFS, un po' sotto gli altri, dentro la tolleranza di ±2.
- **Testi d'interfaccia** (opzioni, prima finestra, README): «il narratore, la voce di servizio e **sette** personaggi parlano in inglese; gli altri sette
  restano italiani». `LICENSE-CONTENUTI.md` dice ora che le voci inglesi di Concetta, Iole e Onofrio sono nella stessa cartella e con la stessa esclusione, e
  che dal 1° novembre 2026 l'autore ha un abbonamento a pagamento.
- **I blocchi dei sette rimasti** (Nunzio, Saverio, Rocco, Pasquale, Peppe, Ciro, Cosimo), su richiesta di Simone («indicare nello script se è giovane, malato,
  guarito»): `doppiaggio/en/prove/<nome>.txt`, 83 parti, con in ogni tag l'età (`young man`, `teenage boy`…) e per Pasquale lo stato (malato nelle prime due battute,
  guarito nelle altre due), da `doppiaggio/en/stati.json`. Le schede per cercare le voci sono in `doppiaggio/en/voci-eleven.md`: non ho accesso alla Voice Library,
  quindi non indico voci vere ma filtri e parole di ricerca. Simone ha poi fatto notare che ElevenLabs ha un connettore per Claude (vedi sotto).
- **Backup**: i 3 MP3 su `F:` (ora 7 MP3 di ElevenLabs più `SHA256.txt`), SHA-256 uguale nei tre posti, poi tolti da `Downloads`.

## Decisioni
- **Stessa cartella e stessa esclusione dalla licenza libera per tutte le voci inglesi di ElevenLabs** — Simone non ha detto quando ha comprato il piano
  rispetto ai tre audio (08:23, 08:26 e 08:52); i diritti del suo abbonamento vanno letti nei termini di ElevenLabs. Finché non si sa, la scelta prudente è
  la più restrittiva, e la nota di licenza dell'indice lo dice («in parte sul piano gratuito e in parte con un abbonamento»). Se i diritti lo permettono, si
  potranno separare. Non è una consulenza legale.
- **Gli accenti dei tre** — quelli dei blocchi che avevo scelto io e che Simone ha generato; la sua scheda in `voci.md` li motiva (Concetta «strong southern
  Italian regional flavour», Onofrio «thick southern Italian accent», Iole «light»).
- **Il piano di Simone** — gli altri sette personaggi in inglese, tutti con ElevenLabs, poi le voci italiane di Gemini rifatte se avanzano crediti. L'ho trovato
  sensato (stessa voce per ogni personaggio nelle due lingue, un solo servizio, licenza forse più chiara) e ho dato i caratteri da generare: 5.074 di testo per gli
  altri sette in inglese, 7.515 per rifare le dieci voci italiane di Gemini (più i tag: circa 1.500 e 2.000 in più).

## Verifiche
- `doppiaggio/master/clip/en-concetta|iole|onofrio/rapporto.txt`: 8/8, 12/12, 21/21, «0 da riascoltare», somiglianza almeno 85% e senza parole in più.
- `python collaudo/doppiaggio.py`: TUTTO OK (532 di Enzo, 120 di Kira, 110 dei personaggi; 762 file; 27,5 MB con l'italiano, tetto 40).
- `npx tsc --noEmit` pulito; l'autoverifica del gioco desktop SUPERATA: «voce inglese: 762 parti (2 cartelle) per 762 parti italiane del narratore, di Kira e
  dei personaggi».
- Non verificato: l'ascolto nel gioco desktop vero (non posso); intonazioni e esitazioni che il controllo non vede.

## Questioni aperte
- Le sette voci rimaste in inglese: Simone sceglie le voci di libreria; si prepara un blocco per volta (`personaggio --voce Nunzio`), si genera, si porta fra i
  `PERSONAGGI`, si taglia.
- La licenza delle voci ElevenLabs a pagamento (vedi sopra).
- **Il connettore ElevenLabs per Claude**: nell'elenco dei connettori c'è «ElevenLabs» (`api.elevenlabs.io/v1/mcp-claude-marketplace`, accesso con OAuth, 79 strumenti, descritto come
  gestione degli agenti vocali: gli strumenti che si vedono cominciano con `agents_`). Non so se espone la ricerca nella Voice Library né la generazione del parlato.
  L'ho proposto a Simone con il pulsante «Connect»; **Simone l'ha collegato**. Fra i 150 strumenti ci sono `creative_list_voices` (cerca nella Voice Library),
  `creative_generate_speech` (genera il parlato con `eleven_v4`, anche in sola stima dei crediti) e `creative_design_voice`. Con `list_voices` ho cercato voci per i sette
  personaggi rimasti (risultati in `doppiaggio/en/voci-eleven.md`: Cosimo, Ciro e Peppe hanno candidate italiane, per Nunzio, Saverio, Rocco e Pasquale non ho trovato niente di adatto;
  i filtri di lingua e accento non sono rigidi). La stima dice **un credito per carattere, tag compresi**. Non ho generato niente.
- Poi, se avanzano crediti: le voci italiane di Gemini rifatte con ElevenLabs, con la stessa voce di libreria di ogni personaggio in inglese.
- Il rilascio (1.41.0) solo quando lo dice Simone.
