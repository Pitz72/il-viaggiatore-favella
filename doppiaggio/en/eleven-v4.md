# Eleven v4 (ElevenLabs): come si dirige la recitazione

> Letto il 1° novembre 2026 sulle pagine ufficiali di ElevenLabs (le fonti sono in fondo). Serve ai personaggi che in italiano sono
> stati fatti con Eleven v4 (Imma, Rosaria, Tore, Vito) e che ora passano in inglese, con le loro voci italiane. Il metodo del
> narratore e di Kira (Gemini) sta in `gemini-tts.md`; qui c'è solo ElevenLabs. Ciò che il servizio non dice, qui non è inventato:
> è segnato come **da provare**.

## I due modelli

`eleven_v4` è il modello di qualità, per audiolibri e voci di personaggio; `eleven_v4_turbo` è lo stesso con meno ritardo, per
l'ascolto in tempo reale. Per il gioco serve il primo. Uscito il 28 settembre 2026, più di 90 lingue, italiano e inglese compresi.
v4 accetta anche i cloni professionali (le voci di Valeria, Criss e Luigi lo sono) e tiene l'identità della voce più stabile
fra una generazione e l'altra.

## I tag

- Un tag è un **testo libero fra parentesi quadre**, messo **subito prima** delle parole che deve cambiare: `[hesitant] The night was quiet.`
  Le parentesi tonde o graffe possono far leggere il tag ad alta voce: si usano solo le quadre.
- **Più qualità in un tag solo**, separate da virgole: `[whispering, fearful]`. Oppure **tag impilati**: `[British accent][exasperated]`
  (è l'esempio che ElevenLabs stessa fa per mettere insieme accento e tono).
- **Un'emozione per frase**: contrastare due emozioni sulle stesse parole sfuma la recitazione. Un tono cambia a metà frase mettendo
  un tag nuovo prima del pezzo che cambia.
- **Un tono dura finché non ne arriva un altro.** Per questo, in un blocco di battute diverse, ogni battuta ripete il suo tono.
- Un tag che non si capisce può essere **letto come un suono** o ignorato. Descrivere la voce è più sicuro di una parola sola:
  `[low, gravelly voice]` meglio di `[gravelly]`. Un tag troppo lontano dalle sue parole, o una consegna che quella voce non sa fare,
  hanno lo stesso effetto. Rimedio ufficiale: due o tre riprese, tenere la migliore; o scambiare il tag con uno vicino.
- I tag sono "non ancora perfetti": ElevenLabs lo scrive, e il lavoro sui tag continua. **Si prova sempre con la propria voce.**
- Non esiste un elenco chiuso. Gli esempi ufficiali: emozioni (`excited`, `bitter`, `tired`, `anxious`, `peaceful`), consegna e volume
  (`whispers`, `softly`, `low, threatening`, `hushed`), ritmo (`slowly`, `rushed`, `pause`, `drawn out`), reazioni (`sighs`,
  `laughs`, `clears throat`), accenti, suoni (`footsteps`, `door creaking`). Non servono: il gioco ha già i suoi suoni.

## Punteggiatura, pause, testo

- **Niente SSML**, quindi niente `<break>` e niente `<long pause>`: le pause si fanno con la punteggiatura e con la struttura.
  I puntini di sospensione (`...`, `…`) rallentano e danno peso; il trattino interrompe la battuta; il punto esclamativo aggiunge
  intensità; una parola in MAIUSCOLO prende l'enfasi (per questo nei nostri testi non ce ne sono: `verifiche_personaggi`).
- Non ci sono i cursori **Style** e **Speed** (nel progetto la velocità non ha mai avuto effetto). Restano **Stability** (più bassa =
  più espressiva e più varia fra una ripresa e l'altra) e **Similarity** (più alta = più vicina alla voce di partenza, "a spese
  della naturalezza"); per i cloni professionali c'è anche **Clone Strength** (da 0%: più bassa lascia più libertà alla recitazione,
  più alta tiene i tratti particolari della voce, **accento compreso**).
- Il modello ricava l'emozione dal contesto: un testo ben scritto recita da solo anche senza tag. I tag servono dove si vuole una
  consegna precisa. Meglio scene intere che frasi isolate: la guida di v4 dice che l'app accetta fino a **10.000 caratteri** a
  generazione (in italiano il progetto ne aveva annotati 5.000 sul sito); i nostri blocchi stanno sotto i 1.400.
- I numeri, le sigle e le abbreviazioni vanno scritti come si dicono: nei blocchi dei personaggi non ce ne sono.

## L'accento (la questione di questo lavoro)

- Se la voce e il testo sono nella **stessa lingua**, l'accento della voce resta.
- Se la lingua del testo è **diversa** da quella della voce, v4 punta a un parlato fluido e naturale **nella lingua del testo**, senza
  portarsi dietro l'accento di partenza: una voce coreana che dice una frase inglese esce inglese. Quindi le nostre voci italiane,
  davanti a un testo inglese, **tendono a parlare un inglese senza accento italiano**. ElevenLabs stessa dice che è un
  comportamento che pensa di poter spegnere con un interruttore, ma senza data.
- Per chiedere un accento ci sono i tag: `[Italian accent]` è nell'elenco ufficiale degli accenti (scritto per v3), e la guida di
  v4 mostra `[strong X accent]` per un accento marcato, e lo etichetta **sperimentale**. Si possono impilare col tono:
  `[Italian accent][dry, curt]`. Per tutti gli accenti vale che i risultati variano da voce a voce e che la voce di partenza conta
  per la qualità dell'accento.
- v4 dichiara che la voce "non torna più verso il suo accento d'origine nel corso di una generazione": non dice se un accento
  chiesto con un tag **si tiene** per tutta la generazione. **Da provare** (vedi sotto): per sicurezza il tag d'accento si ripete
  davanti a ogni battuta, subito prima del tono.
- Nessuna fonte pubblica ha provato `[Italian accent]` su una voce italiana che parla inglese. Per questo c'è la prova.

## Che cosa fa il progetto

1. **Gli stessi toni dell'italiano**: ogni battuta inglese ha lo stile della sua battuta italiana (`doppiaggio/toni.json`), con le
   stesse parole inglesi che erano già i tag delle registrazioni italiane (`dry, curt`, `grave, slow, weighing each word`…): in
   italiano non sono mai stati pronunciati. Il tono «calmo» è la base e non ha tag.
2. **L'accento è un tag impilato** davanti al tono, su ogni battuta: `[Italian accent][dry, curt] Well?`. Le parole del tag si
   scelgono con la prova qui sotto e si cambiano con `python strumenti/doppiaggio-inglese.py blocchi --accento "…"`
   (o `--accento nessuno`); la scelta fatta sta in `manifest.json`, chiave `personaggi`, campo `accento`.
3. **Un blocco per personaggio, intero** (come in italiano: la voce cambierebbe a metà). Imma 1.321 caratteri, Rosaria 1.180,
   Tore 1.113, Vito 971.
4. **Stessa voce e stesse impostazioni dell'italiano** (`../voci-scelte.md`): Victoria per Imma, Valeria per Rosaria, Criss per Tore,
   Luigi per Vito; Stability 50 e Similarity 75, tranne Rosaria (Stability 75).
5. Il taglio (`doppiaggio-taglia.py`) toglie i tag in testa alla riga prima di confrontare, anche impilati.

## La prova di accento

`prove/accento-A-nessuno.txt` … `-D-strong.txt`: **le stesse sei battute di Vito** (stanco, minaccioso, affabile ×2, asciutto,
spaventato), una sola cosa diversa — il tag d'accento davanti a ognuna: A nessuno, B `[light Italian accent]`, C `[Italian accent]`,
D `[strong Italian accent]`. Quattro generazioni con la voce di Vito (Luigi) e le stesse impostazioni, circa 2.100 caratteri in tutto.
Si ascolta:
- se **il tag viene pronunciato** («Italian accent» detto ad alta voce): allora quel tag non va;
- se **c'è l'accento** e se è **lo stesso dalla prima all'ultima battuta** (la sesta è la più lontana dal tag, ma ogni battuta
  ha il suo);
- se l'accento è quello giusto per Vito (del sud, "caldo", non da caricatura) e se **la recitazione dei toni regge** (A è il
  riferimento: i toni sono gli stessi);
- che A e le altre non differiscano solo per la ripresa: ogni generazione varia, quindi se due prove si somigliano se ne rifà una.

## Fonti

- [Eleven v4 (documentazione)](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/eleven-v4): modelli, tag, accenti, cursori.
- [Best practices](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices): tag di v4 e v3, ritmo, punteggiatura, normalizzazione.
- [Eleven v4: il modello](https://elevenlabs.io/blog/eleven-v4) e [Emotional text to speech: Directing AI voices with Eleven v4](https://elevenlabs.io/blog/emotional-text-to-speech-with-eleven-v4).
- [L'elenco dei tag](https://elevenlabs.io/blog/elevenlabs-audio-tags-list) e [gli accenti con i tag](https://elevenlabs.io/blog/eleven-v3-audio-tags-emulating-accents-with-precision) (scritto per v3).
- Una guida di terzi, [Eleven v4 prompt guide](https://morphic.com/resources/how-to/eleven-v4-guide): sintassi, accento nativo di default,
  rimedi quando un tag viene letto (usata solo dove conferma le pagine ufficiali).
