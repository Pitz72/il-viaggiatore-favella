# Il doppiaggio

Il gioco si doppia con Gemini 3.8 Flash TTS (`gemini-3.8-flash-tts`) da Google AI Studio,
a mano. I testi si ricavano dai `.fav` con `strumenti/doppiaggio.py`, non si scrivono a
mano: se un testo cambia, si rigenera il blocco.

| Cartella | Contenuto | Nel repository |
|---|---|---|
| `blocchi/` | il testo da incollare in AI Studio: **un file per voce** su tutto il gioco (le voci lunghe, in più file) | sì |
| `manifest.json` | per ogni parte: id, voce, testo, da quale riga di quale `.fav` viene; per ogni testo del gioco, le parti che lo compongono; per ogni blocco, l'ordine delle parti | sì |
| `generati/` | i blocchi **com'erano quando sono stati incollati** in AI Studio: servono a tagliare l'audio anche se poi il piano cambia (`servizio.txt`: 201 parti, comprese 81 scelte del giocatore che poi sono passate al narratore) | sì |
| `master/` | i WAV scaricati da AI Studio, come escono (circa 48 KB al secondo), e le parti tagliate | **no** (`.gitignore`) |
| `voci.md` | le descrizioni delle voci da incollare in AI Studio | sì |
| `banco.json` | il resoconto del banco della voce: per ogni blocco la loudness prima e dopo, il guadagno, il picco, il peso | sì |
| `en/` | **il doppiaggio inglese** del narratore (blocchi, manifest, controllo, prompt della voce, documentazione di Gemini 3.8 Flash TTS): vedi `en/LEGGIMI.md` | sì |
| `../app/public/voce/` | ciò che il gioco suona: un file Opus per parte (`<id>.opus`) e `indice.json` (id → durata in ms, il testo di ogni parte, le cartelle a parte); `elevenlabs/`, col suo indice, ha le voci di Imma, Rosaria, Tore e Vito, escluse dalla licenza libera; `trailer.opus` e `trailer.json` la voce del trailer | sì |

## Una voce per volta

Ogni generazione cambia un poco la voce, anche con la stessa descrizione. Per questo il
lavoro si fa **una voce per volta e col minor numero di generazioni**: tutto Kira in un
blocco solo, ogni personaggio in un blocco solo, il narratore nei pochi blocchi che il
tetto del servizio permette (circa 11 minuti di audio a richiesta; lo strumento si ferma a
9, la voce di servizio a 10) e tagliati dove cambia la zona.

L'ordine: **Kira** (servizio), poi i personaggi, per ultimo il narratore, che è il più lungo.

Chi dice che cosa:
- **Narratore** (Enzo): la narrazione, il biglietto e le targhe, e le **scelte di dialogo del
  giocatore** (81 frasi in prima persona, un blocco a parte: `narratore-scelte`). Deciso da
  Simone il 20/10: il giocatore non ha una voce sua e il narratore è la stessa persona.
- **Servizio** (Kira): i suggerimenti tra parentesi (31 parti) e i pezzi con numeri (89).
- **Personaggi**: le battute tra «caporali» dei loro dialoghi, un blocco per personaggio.

Ogni parte nel manifest ha una `categoria` (`testo`, `scelta`, `suggerimento`, `numeri`).

**I personaggi hanno un tono per ogni battuta** (`toni.json`, da rileggere in `toni-personaggi.md`).
Il file di un personaggio (`blocchi/<nome>.txt`) è a gruppi di tono, ognuno con la sua
intestazione `### tono — style: …` (che non si incolla): in AI Studio un gruppo è un blocco di
parlato, con nel campo accanto alla voce la descrizione di `voci.md` più «Delivery: <style>».
Il tono non può stare nel testo: AI Studio legge tutto ciò che c'è.

**Dove stanno i blocchi:** `generati/` = già letti da AI Studio (Enzo, Kira): sono fermi e il
taglio li usa; `blocchi/` = ancora da generare (i personaggi, e `narratore-k`: una frase
sola, «L'ho letta.», da unire ai ritocchi di Enzo).

## Come si legge un file di `blocchi/`

Una **parte** per riga. Una parte è ciò che una voce dice senza interruzioni: una
descrizione, una battuta, un suggerimento, una scelta del giocatore. Fra una parte e l'altra
c'è `<long pause>`, un tag del servizio che mette una pausa: serve a tagliare l'audio, dopo,
nei punti giusti. Gli id **non** sono nel testo (verrebbero letti): stanno nel manifest, nello
stesso ordine.

Il testo per la voce è il testo del gioco con le sole differenze che servono: le parole in
MAIUSCOLO (NORD, PARLA CON…) sono abbassate, perché il servizio le leggerebbe come enfasi.

## Come si genera un blocco

1. In AI Studio: *Create new dialog*, **Speaker 1** = la voce di libreria scelta (tabella in
   `voci.md`), con nel campo accanto la **descrizione** di `voci.md`, identica ogni volta.
2. Un solo blocco di parlato (se l'editor ha un limite di lunghezza, più blocchi dello
   stesso speaker nella stessa generazione): incolla **tutto** il file, campo stile vuoto.
3. *Run*. A fine generazione guarda la durata: deve somigliare alla stima (`python
   strumenti/doppiaggio.py stato`). Se è vicina a 10:50 e il finale è tagliato, il testo
   era troppo lungo: dillo, si rigenera la coda.
4. Scarica con l'icona di download e salva in `master/` con il nome del blocco e la voce
   (per esempio `master/servizio-kira.wav`: il nome del file WAV è libero, conta il blocco a cui lo dai al taglio).

## Con ElevenLabs (Eleven v4)

Un personaggio si può rifare con Eleven v4 (`eleven_v4`, uscito il 28/09/2026; italiano compreso, fino
a 10.000 caratteri a richiesta, 5.000 sul sito). Il formato è diverso da quello di Gemini: il **tono
sta a inizio riga**, in un tag fra parentesi quadre («[dry, curt] Che altro?»), le battute si
separano con una riga vuota e non c'è `<long pause>` (v4 non ha SSML) né intestazioni. Il tono
«calmo» è il tono di base e non ha tag. Si fa col comando `python strumenti/doppiaggio.py da-fare
--elevenlabs Imma Tore …`, che scrive in `DA-FARE/` i personaggi **interi** (mai mezzi: la voce
cambierebbe a metà) più un `DA-FARE-0-LEGGIMI-PRIMA.txt` con le impostazioni (Stability 50,
Similarity 75), come scegliere e salvare la voce e che voce cercare. Il taglio legge anche questi
blocchi: toglie i tag di tono prima di confrontare.

Provato su Imma (20/10, voce Victoria, 22 righe, 83,7 s): i tag di tono **non** vengono pronunciati;
tutte le parti ci sono e il controllo di ognuna dà 22 su 22; le pause fra le battute sono brevi
(0,36 s di mediana, da 0 a 0,65: con Gemini erano 1–3 s), ma bastano per tagliare; il nome del file
scaricato può riportare la voce selezionata all'apertura della pagina e non quella usata. Alcune voci
della Voice Library sono riservate ai piani a pagamento (il proprietario le ha limitate, o hanno un
moltiplicatore di crediti): sul piano gratuito compare «not available for free users».
**Chi ha detto che cosa** si annota in `voci-scelte.md`.

## Dopo la generazione: il taglio

`strumenti/doppiaggio-taglia.py` prende i WAV di un blocco, li trascrive con faster-whisper
(sul processore, modello medium già in cache, con il filtro delle pause: senza, i tempi di
whisper sono sfasati anche di un secondo), allinea le parole sentite con quelle attese, taglia
ogni parte nel silenzio fra lei e la vicina e scrive un WAV per parte in `master/clip/<blocco>/`,
con un `rapporto.txt` che elenca le parti da riascoltare. Con `--controlla` riconosce anche
ogni parte tagliata da sola e la confronta col testo: è il controllo che dice se dentro c'è
proprio quella frase e niente delle vicine. Se una generazione è stata divisa in più WAV, si
danno nell'ordine. Le parti da rifare si raccolgono in un solo blocco di ritocchi, per una
generazione sola. (Si lancia con `python`, non `python -I`; non scarica niente.)

## Comandi

```
python strumenti/doppiaggio.py stato                      # parti, parole e minuti per voce; che cosa è già generato
python strumenti/doppiaggio.py blocchi                    # scrive blocchi/ (da generare), manifest.json e toni-personaggi.md
python strumenti/doppiaggio.py blocchi --voce cosimo      # solo i blocchi di una voce
python strumenti/doppiaggio-riconosci.py a.wav b.wav …    # quale blocco è ogni WAV (hanno il nome dell'ora)
python strumenti/doppiaggio-taglia.py narratore-a 104.wav --controlla   # taglia e controlla (usa generati/narratore-a.txt)
python strumenti/doppiaggio-banco.py                # dalle parti tagliate ai file Opus del gioco (app/public/voce/)
python strumenti/doppiaggio-banco.py --misura       # solo la loudness di ogni blocco
python strumenti/doppiaggio-trailer.py              # la traccia della voce del trailer (--prova: solo la scaletta)
```

## Dal taglio al gioco: il banco della voce

`strumenti/doppiaggio-banco.py` prende le parti tagliate di ogni blocco del manifest (`master/clip/<blocco>/`,
mai le cartelle archiviate né le parti `fuori_uso` di Kira), toglie il silenzio in testa e in coda (ne lascia
0,04 s prima e 0,08 s dopo), porta ogni blocco a **−23 LUFS** (EBU R128) con un guadagno solo, così dentro un
blocco un sussurro resta più piano di un grido (una parte il cui picco supererebbe −1,5 dBFS si alza di meno;
niente compressione), codifica in **Opus mono a 32 kbit/s** e scrive `app/public/voce/` e `banco.json`. Una
parte che dopo la codifica supera −0,5 dBFS si ricodifica un poco più piano. Lo stesso ingresso dà gli stessi
byte: rifarlo non sporca git. I blocchi fatti sul piano gratuito di ElevenLabs (Imma, Rosaria, Tore, Vito)
vanno in `voce/elevenlabs/`, con un indice loro che dice la licenza: sono distribuiti col gioco ma esclusi
dalla licenza CC BY-SA, solo per uso non commerciale (scelta di Simone, che ne accetta il rischio:
`LICENSE-CONTENUTI.md`, piano 08, decisione 6). Se un giorno si rifanno su un piano a pagamento o con Gemini,
basta toglierli da `A_PARTE` in `strumenti/doppiaggio-banco.py` e rifare il banco.
Il collaudo è `collaudo/doppiaggio.py`.

## Nel gioco

L'app suona le parti da sola, senza toccare il motore: il motore stampa il testo già composto e
`app/src/gioco/parti.ts` ne ritrova le parti con lo stesso spezzamento e le stesse maiuscole di
`doppiaggio.py` (i numeri delle scorte si ricompongono dai pezzi di Kira; i fili del viaggio frase per
frase), poi `app/src/gioco/voce.ts` le mette in fila e le ferma al primo tasto. Il trailer non usa le
parti una per una: `strumenti/doppiaggio-trailer.py` ne fa una traccia sola sul tempo del trailer
(`app/public/voce/trailer.opus`), che `app/src/trailer/audio.ts` suona sull'orologio della musica. Il
progetto e le decisioni di Simone stanno in `pre-produzione/08-doppiaggio-tts.md`.

**Se un testo del gioco cambia**, cambia l'id della sua parte: `collaudo/doppiaggio.py` lo dice (una
parte senza audio, una scaduta). Si rigenera quel testo, si taglia, e si rifanno il banco (e la traccia
del trailer, se il testo è del trailer).

Quando un blocco è generato: si copia da `blocchi/` in `generati/` (com'è stato incollato, con le
intestazioni dei toni) e si taglia. Restano da fare: i testi con numeri che il gioco ricompone
(`[i fili del viaggio]`, la riga di `STATO`) e l'integrazione nel gioco.
