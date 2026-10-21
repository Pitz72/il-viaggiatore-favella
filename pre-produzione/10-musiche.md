# IL VIAGGIATORE — Le musiche di sottofondo, zona per zona

> Pre-produzione · **v0.1, bozza del 21/10/2026**, da rivedere con Simone.
> Che cosa: una musica di sottofondo per ogni ambiente del gioco, e i prompt per generarla.
> Che cosa non tocca: la storia, i testi, il doppiaggio (la musica gli sta **sotto**), `intro.mp3` del trailer e del
> menu (la colonna originale di Simone resta com'è).

---

## 1. L'elenco: sette ambienti, uno per zona

Il gioco ha 39 luoghi in 7 zone, e le zone sono già gli «ambienti»: ciascuna ha un nome, un colore e un paesaggio suo.
Un brano per zona, che continua mentre ci si sposta dentro la zona e passa al successivo, in dissolvenza, quando si
cambia zona.

| Zona | Luoghi | Che cosa deve dire la musica |
|---|---|---|
| **1 · Acquaviva, il capolinea** | stazione, piazza, bar, casa, margine | la partenza; un paese svuotato con una luce accesa; l'ultima volta che l'acqua è facile |
| **2 · La piana, il sole** | tratto, masseria, pozzo, serra, sterrata | il caldo come nemico; la strada dritta e nuda; un'inquietudine (il cane, il pozzo sorvegliato) |
| **3 · L'invaso morto, il sale** | conca, diga, casotto, fondale, relitto, torre di presa, condotta | il bianco che acceca; il sale; l'acqua ovunque e niente da bere; la diga enorme |
| **4 · La statale, il casello** | rampa, casello, piazzola, area di servizio, sottopasso, discesa | il silenzio delle cose costruite; ruggine; una minaccia che tratta; nella discesa, le prime voci |
| **5 · Il paese, i vivi** | porta, piazzetta, osteria, mercato, vicolo, cortile, salita | l'unico posto vivo; il calore umano; le scelte che fanno male; il registro dei morti |
| **6 · Le colline, la pietra** | sentiero, pianoro, grotta, sorgente, cappella, valico | la pietra, il vento, il freddo della notte; il pastore, l'eremita, la cappella senza tetto |
| **7 · Il guado, il fratello** | guado, strada, soglia | il fratello che aspetta col fucile; la resa dei conti; casa |

**Fuori dall'elenco, di proposito:**
- **gli interni** (bar, casa, casotto, osteria, grotta, cappella): nessun brano nuovo; la musica della zona, più bassa e
  filtrata, come sentita da dentro (si fa nel gioco, §4);
- **il menu e il trailer**: hanno già `intro.mp3`;
- **la fine e il finale**: il finale avrà la sua **sequenza finale** (prossima sessione); una morte resta asciutta.

---

## 2. Il filo comune

Sette brani che devono suonare come **una colonna sola**, non come sette generi. Per questo ogni prompt ripete gli
stessi elementi:

- **Gli strumenti di casa:** pianoforte con la sordina (felt piano), archi gravi suonati lunghi (violoncello, viola,
  contrabbasso), armonium o organo a mance (le chiese di paese, il fiato del sud), chitarra classica in armonici, un
  fruscio di nastro. Ogni zona ne sposta il peso e aggiunge **un solo** colore suo (il vetro per il sale, il metallo
  per la statale, le campane delle pecore per le colline).
- **Una tonalità di casa, re** (minore, dorico, con colori diversi per zona): passare da una zona all'altra in
  dissolvenza non stona.
- **Lento:** fra 48 e 66 battiti al minuto, o senza battito.
- **Sotto la voce:** il racconto è doppiato. La musica non ha una melodia in primo piano, tiene libera la zona di
  frequenze della voce parlata, ha una dinamica morbida. Niente voci, niente cori.
- **Niente flauti:** il suono dei trofei è una nota flautata; se la musica ha un flauto, il trofeo si perde.
- **Da ripetere in tondo:** nessuna introduzione, nessun finale, nessuna crescita o caduta. Il brano comincia e finisce
  alla stessa intensità, così il gioco lo ripete senza che si senta la cucitura.
- **Anti-cliché**, come per la scrittura (`01-visione.md`, §3): niente tarantella, niente mandolino da cartolina, niente
  epica da film, niente archi che «salgono».

---

## 3. I prompt

I prompt sono **in inglese**: i generatori musicali li capiscono meglio. Per ogni zona ce ne sono due:

- **Prompt descrittivo**, per i generatori che vogliono una descrizione (ElevenLabs Music, Udio, Stable Audio e simili);
- **Stile breve** + **Escludi**, per i generatori a campi (Suno: «Style of music» col brano strumentale, e gli stili da
  escludere se il piano li offre).

**Come generare.** Durata 2:30 – 3:00. Due o tre varianti per zona, poi si sceglie a orecchio, con la voce del gioco
sopra. Se il generatore aggiunge un finale o una dissolvenza, non importa: il punto di ripetizione lo taglio io. Se c'è
la scelta, file non compressi (WAV), 44,1 o 48 kHz.

### Zona 1 · Acquaviva, il capolinea

*La partenza. Un paese svuotato dalla Secca, la ferrovia mangiata dalla gramigna, solo il bar con una luce accesa. È il
brano più «di casa» dei sette: malinconia quieta, un filo di tenerezza.*

**Prompt descrittivo**
> Quiet, melancholic ambient score for an emptied small town in the south of Italy, at the end of a dead railway line, in
> the early morning. Sparse felt piano notes with long silences between them, a soft harmonium chord sustaining
> underneath, a faint low electrical hum like a failing power line, gentle tape hiss. Intimate and still, a feeling of
> departure and of a place that emptied slowly, one family at a time, with one warm light left on. D minor, around 60
> BPM but rubato, no audible beat. Instrumental only, no vocals. This is a background bed under spoken narration: keep
> the midrange clear, no lead melody, soft dynamics. No intro, no outro, no build-ups: the same calm intensity from the
> first to the last second, so that it loops seamlessly. About 2 minutes 30 seconds.

**Stile breve:** `ambient neoclassical, sparse felt piano, harmonium drone, faint electrical hum, tape hiss, melancholic, intimate, D minor, 60 bpm rubato, instrumental, background score, seamless loop`
**Escludi:** `vocals, choir, drums, flute, mandolin, epic, cinematic build-up, electronic beat`

### Zona 2 · La piana, il sole

*Il primo cammino esposto: catrame che ondeggia di calore, una masseria scrostata, un pozzo sorvegliato, un cane
selvatico tra le serre. La luce è violenta, il suono no: un'afa che non dà tregua, un'inquietudine bassa.*

**Prompt descrittivo**
> Hot, exposed and endless: an abandoned farmland plain under a merciless sun, a straight empty provincial road
> shimmering with heat. A high, slowly shimmering drone of bowed strings like heat haze, a very soft low pulse like tired
> footsteps at 56 BPM, occasional detuned nylon-string guitar harmonics, dry and airless, with a faint undercurrent of
> unease (a stray dog guarding what is left, a well watched by a wary man). Harsh light, quiet sound. D dorian.
> Instrumental only, no vocals. Background bed under spoken narration: keep the midrange clear, no lead melody, soft
> dynamics. No intro, no outro, no build-ups: constant intensity for a seamless loop. About 2 minutes 30 seconds.

**Stile breve:** `dark ambient, shimmering high string drone, heat haze, soft low footstep pulse, sparse detuned nylon guitar harmonics, arid, uneasy, D dorian, 56 bpm, instrumental, background score, seamless loop`
**Escludi:** `vocals, choir, drums, flute, mandolin, western twang, epic, cinematic build-up`

### Zona 3 · L'invaso morto, il sale

*Un bacino prosciugato, crepato in lastre di sale; una diga alta come un palazzo di dieci piani; pozze salmastre che
ingannano la sete. Il paradosso del gioco: l'acqua è dappertutto ed è veleno. Il brano più immobile e più strano.*

**Prompt descrittivo**
> A dried-up reservoir cracked into plates of salt under a blinding white sky, a gigantic concrete dam streaked with
> limescale, still brackish pools that look like water and are poison. Glassy, crystalline textures (bowed glass, glass
> harmonica-like tones), the deep metallic resonance of a huge concrete wall, a sub-bass drone felt more than heard,
> occasional brittle crackles like salt under boots. Eerie stillness, mineral, beautiful and wrong. Very slow, no pulse.
> D, suspended and unresolved. Instrumental only, no vocals. Background bed under spoken narration: keep the midrange
> clear, no lead melody, soft dynamics. No intro, no outro, no build-ups: constant intensity for a seamless loop. About
> 2 minutes 30 seconds.

**Stile breve:** `minimal ambient, glass harmonica tones, bowed glass, deep metallic resonance, sub bass drone, salt crackle textures, eerie stillness, suspended D, no pulse, instrumental, background score, seamless loop`
**Escludi:** `vocals, choir, drums, flute, ocean waves, new age, epic, cinematic build-up`

### Zona 4 · La statale, il casello

*Una superstrada intatta e inutile, guardrail mangiati dalla ruggine, auto sventrate in una piazzola, un casello
presidiato da un uomo affabile col tubo di ferro a portata di mano. Il silenzio delle cose costruite; una minaccia che
non esplode, che tratta.*

**Prompt descrittivo**
> A rusted, silent four-lane highway in the middle of nowhere, a manned tollbooth, wrecked cars at a rest area. The
> silence of things built by people and then abandoned; a latent threat that smiles and negotiates. Low sustained cello
> and double bass, a quiet uneasy pulse like a slow muffled clock at 64 BPM, faint scraping metal and wind on
> guardrails, minor-second tension that never explodes. D minor with a phrygian colour. Instrumental only, no vocals.
> Background bed under spoken narration: keep the midrange clear, no lead melody, soft dynamics. No intro, no outro, no
> build-ups or drops: constant intensity for a seamless loop. About 2 minutes 30 seconds.

**Stile breve:** `tense minimal ambient, low cello and double bass drones, muffled slow clock pulse, rusty metal scrapes, wind on guardrails, latent threat, D phrygian, 64 bpm, instrumental, background score, seamless loop`
**Escludi:** `vocals, choir, drum kit, flute, synthwave, action, trailer hits, epic, cinematic build-up`

### Zona 5 · Il paese, i vivi

*L'unico centro ancora vivo: panni stesi, voci dalle finestre, un'osteria che sa di vino e di legna, il mercato del
baratto, una vecchia che ricorda, un uomo con la febbre in un vicolo. Il brano più caldo e più umano; tenerezza, e sotto
il dolore delle scelte.*

**Prompt descrittivo**
> The only village still alive in an emptied land: laundry hung between windows, voices in the distance, a low tavern
> that smells of wine and wood smoke, a small barter market, an old woman who remembers everyone who left. Warm, human,
> bittersweet: fingerpicked nylon-string guitar, a soft accordion or harmonium, a warm cello line low in the mix, a
> gentle hint of southern Italian modal folk, never a dance. Tender, with grief underneath. D dorian moving to D
> mixolydian, 66 BPM, light touch, no drums. Instrumental only, no vocals. Background bed under spoken narration: keep
> the midrange clear, no lead melody, soft dynamics. No intro, no outro, no build-ups: constant intensity for a seamless
> loop. About 2 minutes 30 seconds.

**Stile breve:** `warm acoustic folk ambient, fingerpicked nylon guitar, soft accordion, harmonium, low warm cello, southern Italian modal hint, bittersweet, tender, D dorian, 66 bpm, no drums, instrumental, background score, seamless loop`
**Escludi:** `vocals, choir, drums, flute, mandolin, tarantella, tambourine, upbeat, epic`

### Zona 6 · Le colline, la pietra

*La mulattiera tra muretti a secco crollati, un pianoro di ginestra dove il vento non smette, un pastore con poche
pecore, un eremita in una grotta, una cappella senza tetto, una sorgente dimenticata. Austero, solitario, antico; la
pietra che di notte diventa fredda.*

**Prompt descrittivo**
> High stony hills above the south of Italy: dry-stone walls, broom bushes and a wind that never stops, cold coming with
> the night, a shepherd with a few sheep, a hermit in a cave, a roofless chapel. Austere and solitary: open fifths on
> bowed double bass, cello harmonics, airy breath-like noise textures like wind through stones, very distant and sparse
> sheep bells, a reed organ chord like an abandoned chapel. Cold, wide, ancient. D minor, very slow, rubato. Instrumental
> only, no vocals. Background bed under spoken narration: keep the midrange clear, no lead melody, soft dynamics. No
> intro, no outro, no build-ups: constant intensity for a seamless loop. About 2 minutes 30 seconds.

**Stile breve:** `austere ambient, open fifths bowed double bass, cello harmonics, wind through stones texture, distant sparse sheep bells, reed organ, cold, solitary, ancient, D minor, rubato, instrumental, background score, seamless loop`
**Escludi:** `vocals, choir, drums, flute, pan flute, bagpipe, new age, epic, cinematic build-up`

### Zona 7 · Il guado, il fratello

*L'ultimo passaggio: un greto di pietre bianche, un filo d'acqua morta, il fratello che tiene il guado col fucile. Poi
la strada verso casa e la soglia. Non è una battaglia: è una resa dei conti, e un lutto. Il brano più grave e più
trattenuto.*

**Prompt descrittivo**
> The last crossing before home: a riverbed of white stones, a thread of dead water, a brother waiting with a shotgun.
> Then the road to the house, and its threshold. Grave, intimate, suspended: low piano notes like a slow heartbeat at 48
> BPM, a sustained cello and viola dissonance that breathes slowly in and out, deep silence between phrases, grief
> rather than action. Restraint above all: a reckoning, not a battle. D minor. Instrumental only, no vocals. Background
> bed under spoken narration: keep the midrange clear, no lead melody, soft dynamics. No intro, no outro, no climax: the
> same held intensity from first to last second, for a seamless loop. About 2 minutes 30 seconds.

**Stile breve:** `grave minimal neoclassical, low piano heartbeat, sustained cello and viola dissonance, long silences, grief, restraint, intimate, D minor, 48 bpm, instrumental, background score, seamless loop`
**Escludi:** `vocals, choir, drums, flute, action, battle, epic, cinematic build-up, trailer hits`

---

## 4. Come entreranno nel gioco (da fare dopo, quando i brani ci sono)

Il gioco ha già il canale della musica (`lib/suono.ts`) e il suo cursore nelle opzioni; oggi in partita lo usa solo il
menu. Con i brani:

- **un brano per zona**, ripetuto in tondo col punto di cucitura tagliato a mano; al cambio di zona una dissolvenza
  incrociata di qualche secondo;
- **sotto la voce:** quando il narratore parla, la musica scende di qualche decibel e risale dopo (come Enzo e il brano
  nel trailer, `VOCE_SOTTO`); livello di base ben sotto la voce (il doppiaggio sta attorno a −23 LUFS);
- **negli interni** la stessa musica, più bassa e filtrata;
- **mai sopra il finale** e niente musica dopo una morte (la sequenza finale avrà la sua);
- **la riga «Musica» delle opzioni** varrà anche in partita, e la sua spiegazione lo dirà;
- formato come le voci (Opus), peso da tenere d'occhio per la versione web.

**La licenza.** La storia, i testi e la musica del gioco sono CC BY-SA 4.0. Una musica generata può avere termini
diversi a seconda del servizio e del piano: va controllato prima di metterla nel gioco. Se non è compatibile, la si
distribuisce a parte, come le voci ElevenLabs.
