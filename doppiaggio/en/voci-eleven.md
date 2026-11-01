# Le voci da scegliere in ElevenLabs

> **Stato al 1° novembre 2026:** Ciro (Pierpaolo), Peppe (Vittorio boy next door) e Cosimo (Corrado Noventa) sono fatti, generati da Claude con il connettore.
> Anche **Nunzio, Saverio, Rocco e Pasquale** sono fatti: in libreria non c'erano voci italiane adatte e Simone ha scelto fra le anteprime del Voice Design («Ermenegildo Meliconi», «Ignazio Rossi»,
> «Ciro Esposito» (è Rocco) e «Carmine Lo Russo»). I quattordici personaggi sono in inglese; le schede qui sotto restano come documentazione.

> Preparato il 1° novembre 2026. Non ho accesso alla Voice Library né al tuo account: qui ci sono le **schede di ricerca** (che voce cercare, con
> quali filtri e parole) e ciò che ogni blocco dice a Eleven v4 su età e stato. La scelta si fa a orecchio sul sito. Se mi incolli il nome e la
> descrizione di una voce che ti piace, ti dico se somiglia alla scheda.

## Come cercare

- **Filtri della libreria**: lingua *Italian*, genere, età (*young*, *middle aged*, *old*); le voci italiane sono per lo più cloni di community
  («Mature actress», «Radio Podcast», «Passionate grandfather»: le descrizioni sono in inglese, quindi le parole di ricerca sono inglesi).
- **Una voce per personaggio, la stessa nelle due lingue**: salvala in *My Voices* come «Viaggiatore – <Personaggio>» e usala anche quando si rifarà l'italiano.
- **Che si distinguano a orecchio** nella stessa scena. A Z5 (il paese) parlano Rosaria, Imma, Concetta, Peppe, Ciro e Pasquale: Peppe il più alto e giovane,
  Pasquale un uomo adulto debole, Ciro svelto e di mezzo, e nessuno somigli a Tore, Vito, Cosimo (tutti uomini maturi: tenere i timbri lontani).
- **Già usate** (non riusarle): Victoria, Valeria, Criss, Luigi, Tosca, Elettra, Nonno Ben.
- **Impostazioni di partenza**: Stability 50, Similarity 75, velocità 1; sono indicazioni mie, da correggere all'ascolto (più bassa la Stability = più
  espressiva e più variabile fra le riprese).

## Che cosa c'è nei blocchi (età e stato)

Ogni battuta comincia con `[Italian accent][<età>, <stato>, <tono>] testo`: per esempio `[Italian accent][young man, sick with fever, weak and feverish, trying
to sound fine] I'm not ill.` Il profilo e gli stati stanno in `stati.json` (si cambiano lì, poi `python strumenti/doppiaggio-inglese.py personaggio --voce
<Nome>`). Se una voce suona forzata («teenage boy» che pigola), si toglie il profilo con Trova e Sostituisci nell'editor. L'accento è `Italian accent` per
tutti (le loro schede dicono «southern», non «thick»).

## Le schede

### Nunzio — il bar, zona 1 — uomo, 65 anni · 7 battute, 544 caratteri
Magro, asciutto, stanco e ostinato; titolare di un bar in un paese che si è svuotato. Poche parole, un po' formale, mai lamentoso, con un umorismo secco
sotto la stanchezza. Voce medio-bassa, un po' incrinata. Tag: `elderly man, thin, slightly cracked voice`.
**Cerca**: uomo, età *old* o *middle aged* alto; parole *dry*, *tired*, *raspy*, *old man*; Stability 50. Non troppo cupo: è l'unico a sorridere nelle battute («Oro per acqua.
Ai miei tempi avrei riso»).

### Saverio — il pozzo, zona 2 — uomo, 70 anni · 8 battute, 274 caratteri
Custodisce un vecchio pozzo in una piana secca; poche parole, come sentenze; diffidente di tutto ciò che cammina. Roco, piatto, grave, lento. Nessun calore.
Tag: `elderly man, hoarse, flat voice`. **Cerca**: uomo, *old*; *gravelly*, *gruff*, *monotone*, *stern*; Stability 65-75 (le sentenze sono piatte, non devono variare). Non Onofrio né Nonno Ben:
due vecchi nei dintorni, che il giocatore sente a poche ore di distanza.

### Rocco — il fondale, zona 3 — uomo, 45 anni · 5 battute, 270 caratteri
Magro, raccoglie sale a mano, le labbra spaccate dalla sete. Gola secca, roco, più alto e più graffiato degli altri; un umorismo nervoso che diventa subito
risata; parla in fretta quando mente. Tag: `thin man in his forties, hoarse, parched throat`. **Cerca**: uomo, *middle aged*; *raspy*, *nervous*, *hoarse*, *scratchy*; Stability 35-45.
Le sue 5 battute sono quelle di chi sta mentendo (l'acqua del fondale è salata): una voce che sa «sorridere» mentre dice il falso.

### Pasquale — il vicolo, zona 5 — uomo, 35 anni · 4 battute, 160 caratteri
Un giovane invecchiato dalla febbre, troppo orgoglioso per chiedere aiuto. **Malato** nelle prime due («I'm not ill.» con la voce che trema), **guarito**
nelle ultime due («I'm better. I owe it to you.»: ancora pallido, sollevato). Tag: `young man` + `sick with fever` / `recovered from the fever, still pale…`.
**Cerca**: uomo, *young adult* o *middle aged* basso; *weak*, *hoarse*, *soft*, *vulnerable*; Stability 40-50. Serve una voce che regga **due stati** nello stesso blocco (debole e tremante, poi
più stabile): una troppo robusta non farà sentire la febbre. Più basso e più adulto di Peppe.

### Peppe — la piazzetta, zona 5 — ragazzo, 17 anni · 17 battute, 992 caratteri
Con le scarpe sbagliate per camminare. Ansioso e irrequieto: una voce giovane che si spezza fra spavalderia e paura, accelera quando si entusiasma e si fa piccola quando
è ferito. Tag: `teenage boy` (e lo stato dal tono: `eager, anxious`, `happy, bright`, `sad, subdued`, `bitter, resigned`, `tightly controlled anger`). **Cerca**: *young*, maschile, *teen*,
*boy*, *young adult* alto; *eager*, *youthful*, *energetic*; Stability 35-45 (deve poter cambiare da una battuta all'altra: 17 battute con sei toni). La voce italiana di un ragazzo vero, non un adulto che
fa il ragazzo.

### Ciro — il mercato, zona 5 — uomo, 40 anni · 11 battute, 607 caratteri
Svelto d'occhi e di mani; commerciante che conta sempre, divertito da tutto ciò che si può prezzare. Svelto, untuoso, con una cantilena da venditore; timbro medio. Tag:
`middle-aged man`. **Cerca**: uomo, *middle aged*; *fast*, *salesman*, *charming*, *playful*, *friendly*; Stability 45-50. Il tono più frequente è *affable, friendly on the surface*, poi *teasing, mocking* e *wry, ironic*: una voce che sorride
mentre prezza.

### Cosimo — il guado, zona 7 — uomo, 50 anni · 31 battute, 2.227 caratteri (il blocco più lungo)
Il fratello rimasto, che ha sepolto tutti. Indurito e in lutto; non alza mai la voce, parla con lunghe pause; la rabbia resta sotto la superficie. Tono basso, della
stessa età e della stessa terra del narratore. È il confronto finale: toni *tightly controlled anger* (5 battute), *bitter, resigned*, *sad, subdued*, *firm, resolute*, *moved, voice catching*. Tag: `man in his fifties, low voice`.
**Cerca**: uomo, *middle aged*; *deep*, *gravelly*, *somber*, *restrained*, *serious*; Stability 50-60. La voce che deve reggere la scena più difficile del gioco: una voce capace di trattenersi (rabbia contenuta) e di incrinarsi
in pochissime battute. Ascolta una versione di prova prima di generare tutto.

## Voci trovate con il connettore ElevenLabs (1° novembre 2026)

Simone ha collegato il connettore «ElevenLabs» di Claude (strumento `creative_list_voices`: cerca nella Voice Library con filtri di lingua, genere, età,
accento e parole di carattere). Non ho potuto ascoltare nulla: sono candidate **da ascoltare** (ogni voce ha un'anteprima sul sito; si cercano per nome nella libreria, e se serve gli identificativi li ritrovo con il connettore). I filtri di lingua
e di accento non sono rigidi (con alcune combinazioni sono tornate voci inglesi, tedesche, hindi), e per «vecchio» e per «giovane» con parole italiane non è
tornato niente: la libreria italiana di voci anziane e di ragazzi sembra povera.

| Personaggio | Candidate | Perché |
|---|---|---|
| Cosimo | **Corrado Noventa** | italiano, mezza età, profondo e basso, drammatico e sentimentale |
| | **Giuseppe Barbasso stage actor** | uomo maturo, basso, narrativo ed emozionale, recitativo |
| | **Dade M – Mysterious Suspense Narrator** | profondo, deliberato, inquietante con la sola trattenuta: tiene le pause (la rabbia sotto la superficie) |
| | Luca Brasi Profondo | peso e un tocco di oscurità |
| Ciro | **Pierpaolo** | matura ed espressiva, influenza salernitana (accento del sud) |
| | Marco Ferrario | mezza età, conversazionale, «perfetta per vendere» |
| | Ambrogio Mereghetti | 40 anni, conversazionale (accento milanese: meno adatto) |
| Peppe | **Vittorio boy next door** | l'unico ragazzo italiano trovato: giovane, amichevole e sorridente (accento milanese) |
| Nunzio, Saverio, Rocco, Pasquale | nessuna voce italiana adatta trovata | cercare a mano sul sito: per Nunzio e Saverio un vecchio roco, per Rocco un uomo magro e graffiato, per Pasquale un adulto debole |

Fra le voci non italiane che il filtro ha dato, per un vecchio roco: *Frederick – Old Gnarly Narrator*, *Jessie – Vintage Narrator*; per Rocco *Q. Patrick – Raspy*. Sono inglesi o americane: con `[Italian accent]` potrebbero reggere in
inglese, ma poi non servirebbero per l'italiano.

## Quanto costano

**Un credito per carattere, tag compresi** (stima fatta con il connettore: 395 crediti per un testo di circa 390 caratteri con i tag, 7,9 centesimi di dollaro
a prezzo d'API). I conti qui sotto sono in crediti.

| Personaggio | Parti | Caratteri di testo | Tag (circa) |
|---|---:|---:|---:|
| Nunzio | 7 | 544 | 400 |
| Saverio | 8 | 274 | 400 |
| Rocco | 5 | 270 | 330 |
| Pasquale | 4 | 160 | 350 |
| Peppe | 17 | 992 | 900 |
| Ciro | 11 | 607 | 500 |
| Cosimo | 31 | 2.227 | 1.800 |
| **In tutto** | **83** | **5.074** | **circa 4.700** |

Circa 9.800 crediti per tutti e sette in inglese, tag compresi (i tag sono più lunghi di prima perché portano anche età e stato). Rifare le dieci voci italiane di Gemini
costa circa altri 9.500 crediti (7.500 di testo e circa 2.000 di tag, senza profili): in tutto circa 19.300.
