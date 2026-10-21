# IL VIAGGIATORE — La sequenza finale e i titoli di coda

> Pre-produzione · **v0.2 del 21/10/2026: fatto** (1.33.0), **manca la canzone** (§3: la genera Simone).
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

---

## 7. Verifiche

- `app/scripts/finale-node.mjs`: la scaletta (durata minima, fasi in ordine, titoli e loghi dentro la canzone), i
  crediti (tutte le righe del vecchio cartello, «elevenlabs.io» compreso).
- Le foto della sequenza a 1920×1080 (tramonto, frase, notte, titoli, loghi), in Electron fuori schermo.
- Un finale e una morte giocati nel gioco vero: dal finale alla sequenza al menu; dalla morte al menu.
- `collaudo/doppiaggio.py`: nessun testo detto cambia.
