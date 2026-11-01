# IL VIAGGIATORE — La sequenza finale e i titoli di coda

> Pre-produzione · **v0.3 del 21/10/2026: fatto** (1.33.0); **la canzone c'è** (1.34.0, §3: «La mano sa ancora la forma»).
> Che cosa: una chiusura di almeno un minuto e venti dopo i sei finali della storia, con una canzone, i titoli di coda
> e i loghi di Runtime Multimedia e di FAVELLA 1; poi il menu d'avvio.
> Che cosa non tocca: la storia e i testi detti (nessuna parola nuova per il doppiaggio), le morti (restano asciutte),
> il trailer.

---

## 1. Gli ordini di Simone (21/10/2026)

Dopo la valutazione («la storia non chiede altro; manca la cornice»), Simone ha deciso:

1. una sequenza finale **come l'ho descritta**, ma lunga **almeno 1:20**;
2. un **prompt per una canzone, col testo intero**, da dare a Lyria 3.5;
3. **via i crediti dall'inizio**: diventano i **titoli di coda**, alla fine della sequenza;
4. nei titoli anche **i loghi di FAVELLA 1 e di Runtime Multimedia**;
5. **a gioco finito si va al menu d'avvio**, e il gioco non riparte.

---

## 2. La sequenza, inquadratura per inquadratura

Durata D = la canzone (almeno 90 s). I tempi in secondi dall'inizio; quelli da `D − …` contano dalla fine, così i
titoli si allungano o si accorciano con la canzone e i loghi cadono sempre sulla sua coda strumentale.

| Tempo | Immagine | Suono |
|---|---|---|
| prima | Nel gioco il narratore legge l'ultima scena e il finale; resta il riquadro «finale» con la frase, **senza pulsanti**, e sotto «Invio · continua». Si prosegue da soli quando la voce tace (o dopo il tempo di lettura, senza voce). | la musica della zona 7 sfuma, come oggi |
| 0 – 1,5 | nero | parte l'introduzione strumentale della canzone |
| 1,5 – 4 | **Acquamorta al tramonto**, dalla riva del guado, senza figure (né Cosimo né il viandante: la chiusura non racconta, e vale per tutti e sei i finali). Le bande nere **si richiudono**: è il gesto opposto all'apertura del trailer. Un avvicinamento lentissimo. | |
| 6 – 20 | **la frase del finale**, grande al centro, in corsivo; niente «FINALE —» | ancora strumentale: la voce della canzone entra dopo la frase |
| 18 – 30 | **scende la notte** sulla stessa riva: il cielo si spegne, escono le stelle | |
| 26 – D−15 | **i titoli di coda**: prima «IL VIAGGIATORE» fermo al centro, poi la colonna dei crediti sale piano | le strofe e il ritornello |
| D−14,5 – D−1 | nero; **i due loghi si ricompongono** come all'avvio, Runtime Multimedia poi FAVELLA 1, **in silenzio** sotto la coda della canzone | la coda strumentale |
| D | si torna al **menu d'avvio**, sull'alba del trailer: la notte dei titoli, poi di nuovo l'alba | il tema del menu |

**Esc** salta la sequenza e va al menu (come per i loghi e il trailer). **Le morti** non hanno sequenza: finita la
lettura, il menu d'avvio. Dal menu, **Extra → Titoli di coda** fa vedere solo la notte, i titoli e i loghi: i crediti
e l'attribuzione delle voci ElevenLabs («elevenlabs.io») devono restare raggiungibili anche da chi non arriva in fondo.

---

## 3. La canzone

**Titolo:** «La mano ci torna da sola» · **The Runtimers** · per i titoli di coda.

Il titolo e il ritornello vengono dalla soglia di casa, l'unico luogo che tutti e sei i finali attraversano: «La
maniglia la conosci ancora, la mano ci torna da sola.» Il testo non dice come finisce: le strofe ripercorrono la
strada (le lettere, il biglietto in stampatello, il capolinea, il catrame, la diga, il paese, le colline), il ritornello
fa due domande che valgono per chi resta e per chi se ne va, il ponte risponde al biglietto del fratello.

Il prompt è **in inglese**, come quelli delle zone: Lyria lo capisce meglio. **Il testo della canzone è in italiano.**
Le etichette fra parentesi quadre ([Intro], [Verse]…) servono al generatore per la struttura e non si cantano.

### Prompt descrittivo

> An end-credits song for a narrative video game set in a drought-stricken south of Italy: a man walks home across a
> dead land and reaches the door of his house. Sung in Italian by a low, unadorned female alto voice, close and
> intimate, almost spoken, no vibrato, no belting, no vocal runs. The same instruments as the game's score: sparse felt
> piano, fingerpicked nylon-string guitar with harmonics, a soft harmonium drone, a low cello that enters in the second
> verse, faint tape hiss. D minor, about 66 BPM, steady and gentle, no drums. Structure: about 20 seconds of
> instrumental intro with piano and harmonium only and no voice; first verse; chorus; second verse; a short bridge,
> almost whispered; final chorus; then about 15 seconds of instrumental outro that resolves softly on a D major chord
> and fades out. Bittersweet and restrained: a homecoming, not a celebration. No choir, no flute, no mandolin, no
> tarantella, no epic build-up, no strings that swell. About 2 minutes long.

**Stile breve:** `italian cantautore folk ballad, end credits song, low intimate female alto vocal in Italian, felt piano, fingerpicked nylon guitar, harmonium drone, low cello, tape hiss, bittersweet, restrained, D minor, 66 bpm, no drums`

**Escludi:** `choir, flute, mandolin, tarantella, drums, epic, orchestral swell, autotune, belting, vibrato, english lyrics`

Se si preferisce una voce maschile: al posto di «a low, unadorned female alto voice» scrivere «a low, unadorned male
baritone voice»; il resto non cambia.

### Il testo

```
[Intro]
(instrumental, piano and harmonium, about 20 seconds)

[Verse 1]
Lettere in corsivo sul tavolo,
poi più niente,
poi un foglio in stampatello.
Dove finiscono i binari
la gramigna arriva al ginocchio
e al bar resta accesa una luce.
Da lì si va a piedi.

[Chorus]
La maniglia la conosci ancora,
la mano ci torna da sola.
Cosa sei tornato a trovare,
cosa hai portato fin qui.

[Verse 2]
L'acqua divisa a sorsi
sul catrame che ondeggia nel caldo.
Nella diga morta solo sale:
acqua ovunque e niente da bere.
Qualcuno, in paese, ti ha tenuto
un bicchiere da parte.
Sulle colline il vento non smette.

[Bridge]
C'era scritto in stampatello
che non era il caso di tornare.
Sei tornato lo stesso.

[Chorus]
La maniglia la conosci ancora,
la mano ci torna da sola.
Cosa sei tornato a trovare,
cosa hai portato fin qui.

[Outro]
La mano ci torna da sola.
(instrumental, about 15 seconds, resolving on D major)
```

### Come generare

Durata **circa 2:00** (va bene fra 1:40 e 2:30: la sequenza si adatta). Due o tre varianti, poi si sceglie a orecchio;
se c'è la scelta, file non compressi (WAV), 44,1 o 48 kHz. Da controllare all'ascolto: che la voce **non entri prima di
15–20 secondi** (sopra la frase del finale ci vuole silenzio di parole) e che le parole si capiscano. Il file finisce in
`app/public/musica/finale.opus` (lo prepara `strumenti/colonna-sonora.py`). **Finché la canzone non c'è**, sotto la
sequenza suona il tema dell'intro (`intro.mp3`) e la durata è la sua.

### La canzone arrivata (21/10/2026, 1.34.0)

Simone l'ha generata con Lyria 3.5: un MP3 di 2:38 (44,1 kHz, 192 kbit/s) che Lyria aveva chiamato «Il ferro freddo».
**Lyria ha riscritto il testo**: tiene la strada del prompt (le lettere, il foglio a matita, i binari, il catrame,
l'invaso col sale, il bicchiere tenuto da parte, le colline, il foglio piegato) ma il ritornello è un altro, e «La mano
ci torna da sola» non si canta più. Il titolo nuovo viene dal verso che chiude la canzone: **«La mano sa ancora la
forma»**. Ottavo brano dell'album, dopo le sette zone.

Il testo come lo sente whisper (large-v3; trascrizione automatica, qualche parola può essere storta):

```
[22 s]  Lettere storte sul legno del tavolo / Poi più nessuna notizia di noi /
        Solo due righe tracciate a matita / Dove i binari finiscono al sole /
        L'erba bruciata ti sfiora i ginocchi / L'ultima insegna che trema nel vento /
        Finisce la strada, si torna a piedi
[50 s]  Ma il ferro freddo lo senti nel palmo / La mano sa ancora la forma che ha /
        Cosa sei sceso a cercare nel bianco / Cosa ti resta da chiudere qua
[65 s]  L'acqua contata nel fondo dei vetri / Sopra il catrame che fuma e che cede /
        Dentro l'invaso è rimasto il silenzio / Ossa di barche, una crosta di sale /
        Qualcuno all'ombra di calce persiane / Ti ho custodito un bicchiere da bere /
        Sulle colline non cade più niente
[94 s]  C'era già scritto sul foglio piegato / Che non serviva tornare qua giù /
        Ma i passi conoscono solo una via
[109 s] Ma il ferro freddo lo senti nel palmo / La mano sa ancora la forma che ha /
        Cosa sei sceso a cercare nel bianco / Cosa ti resta da chiudere qua
[124 s] La mano sa ancora la forma che ha
        (strumentale da 127,5 s alla fine)
```

I tempi tornano con la sequenza: la voce entra a **22 s**, dopo la frase del finale (6–20 s); l'ultima parola è a
127,5 s, e la coda strumentale (fino a 156,3 s) porta il nero e i due loghi (143–157 s).

**Il trattamento** (`strumenti/colonna-sonora.py`): nell'album l'audio si copia com'è, con titolo, numero 8/8, album,
autore e copertina; gli altri sette brani passano a 1/8 … 7/8 (l'audio resta identico, provato con l'impronta MD5 del
flusso). Per il gioco (`finale`): via il silenzio in testa (0,46 s) e in coda (2,12 s), **−14 LUFS** come il tema
dell'intro (il file di Lyria era a −11,4 LUFS con il picco a +0,4 dBTP), Opus 96 kbit/s, 2,0 MB. La sequenza dura ora
**157,8 s**; i titoli salgono per 106 s, a circa 20 px/s sulla superficie di 1080 (con il tema dell'intro erano 39 s,
a circa 55 px/s).

---

## 4. I titoli di coda

In ordine: «IL VIAGGIATORE» e «un gioco di Simone Pizzi»; poi le righe del vecchio cartello delle licenze e dei
crediti, identiche (la storia, le musiche, le voci, ElevenLabs con «elevenlabs.io», il codice, il motore, i componenti,
i marchi); la canzone, quando c'è; dove stanno le licenze; «Grazie per aver giocato.». Poi i due loghi.

Il cartello all'avvio sparisce: l'ordine diventa loghi → avviso → trailer.

---

## 5. Dopo la fine

- I sei finali della storia: la sequenza, poi il menu d'avvio.
- Le tre morti: niente sequenza; finita la lettura, il menu d'avvio.
- In nessun caso il gioco riparte da solo; il riquadro finale non ha più «riparti dalla stazione», «carica», «trofei»,
  «← intro», «esci».
- I trofei vinti nell'ultimo turno (prima comparivano nel riquadro finale) si annunciano sul menu d'avvio, con il loro
  cartiglio e il suono flautato.

---

## 6. Scelte mie, fuori dagli ordini (da dichiarare)

- La scena: Acquamorta al tramonto **senza figure**, poi la notte; si torna sull'alba del menu.
- La voce della canzone: **femminile, contralto** (alternativa maschile già scritta nel prompt).
- Il titolo e il testo della canzone, scritti da me sulle parole del gioco.
- «Invio · continua» sotto il finale; «Grazie per aver giocato.» in coda ai titoli.
- **Extra → Titoli di coda**, perché l'attribuzione delle voci resti raggiungibile.
- I trofei dell'ultimo turno annunciati sul menu.
- (1.34.0) Il titolo «La mano sa ancora la forma», dal verso che chiude la canzone; nei titoli di coda «musica e testo
  generati con Lyria 3.5», perché il testo cantato è quello di Lyria e non più il mio.
- (1.34.0) La canzone a −14 LUFS come il tema dell'intro, non a −23 come le zone; i silenzi alle estremità tolti.

---

## 7. Verifiche

- `app/scripts/finale-node.mjs`: la scaletta (durata minima, fasi in ordine, titoli e loghi dentro la canzone), i
  crediti (tutte le righe del vecchio cartello, «elevenlabs.io» compreso).
- Le foto della sequenza a 1920×1080 (tramonto, frase, notte, titoli, loghi), in Electron fuori schermo.
- Un finale e una morte giocati nel gioco vero: dal finale alla sequenza al menu; dalla morte al menu.
- `collaudo/doppiaggio.py`: nessun testo detto cambia.
- (1° novembre 2026, dopo il doppiaggio completo) i crediti nominano le voci: Enzo e Kira (Gemini) e, una riga per personaggio, la voce ElevenLabs dei quattordici personaggi (`finale/crediti.ts`; la riga va a capo, `white-space: pre-line`); `app/scripts/finale-node.mjs` prova che ci siano tutti, in italiano e in inglese.
- (1.34.0) `collaudo/musica.py`: l'album a otto brani, la canzone nell'indice col titolo dell'album e nei crediti con
  lo stesso titolo, −14 LUFS, niente silenzi lunghi alle estremità; l'autoverifica dei pacchetti decodifica la canzone.
