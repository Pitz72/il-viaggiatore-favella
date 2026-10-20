---
data: 2026-10-20
ora: "18:51"
titolo: "Il trailer con la voce di Enzo"
tipo: sessione
versione: 1.22.0
---

# Il trailer con la voce di Enzo

## In breve
Fase 4 del piano 08: nel trailer d'apertura Enzo legge i testi, in modo narrativo ed enfatico, sopra la musica che gli scende sotto. Il trailer è quello di prima: 88,5 s, stessi testi, stessa musica, stesso ordine, Esc per saltarlo; «tuo FRATELLO.» cade sul colpo grave a 64,0 s e «Il Viaggiatore.» sul titolo a 82,3 s. Simone l'ha ascoltato nel gioco desktop: «top… capolavoro».

## Contesto
Le 33 frasi del trailer erano già registrate e tagliate (`doppiaggio/trailer.json`, blocco `narratore-trailer`), ognuna con la finestra in cui il suo testo sta sullo schermo. La voce in tutto dura 62 s, e molte frasi sono più lunghe della loro finestra: nel finale, fra 67,9 e 82,3 s, le cinque regole, i quattro numeri e «Un'avventura testuale…» fanno 21 s di voce in 14 s.

## Lavoro fatto
- **La misura, prima della scelta:** accorciando le pause dentro le frasi (Enzo ne fa di lunghe dopo il punto: fino a 0,85 s) quasi tutto ci sta; restano in ritardo le sette tappe e i cinque «modi» (che però restano scritti tutti insieme mentre Enzo li legge) e il finale, che non ci sta comunque. **Simone ha scelto: Enzo legge le cinque regole, un poco più svelte (+10%); i numeri e «Un'avventura testuale…» restano solo scritti.**
- `strumenti/doppiaggio-trailer.py` (nuovo): prende le parti tagliate, toglie il silenzio ai bordi, accorcia le pause interne oltre 0,25 s, rende più svelta (ffmpeg `atempo`, l'altezza non cambia) la frase che non sta nella finestra, al massimo del 10% (le cinque regole tutte al 10%, per non cambiare passo dall'una all'altra), le mette in fila (ognuna quando compare il suo testo o 0,15 s dopo la precedente; «tuo FRATELLO.» e il titolo esattamente al loro aggancio, e «E al guado, ad aspettarti,» si fa più svelta per finire prima di 64,0), porta la voce a −18 LUFS con un limitatore sui picchi e scrive una traccia sola lunga quanto il trailer, `app/public/voce/trailer.opus` (Opus 48 kbit/s, 400 KB), con `trailer.json` (dove parla ogni frase, l'id della parte, le frasi escluse).
- `app/src/trailer/audio.ts`: la colonna sonora carica la traccia quando nasce il contesto audio e la fa suonare sullo stesso orologio del brano (con la stessa latenza d'uscita), riposizionandola se si scosta di più di 60 ms (salti, «rivedi», pause); mentre Enzo parla la musica scende a 0,4 (−8 dB), 0,15 s prima della frase, e risale 0,35 s dopo (due frasi vicine la tengono sotto insieme). La voce passa dal master: il tasto «audio» del trailer la spegne con tutto il resto. `programmaVoceOffline` fa lo stesso su un contesto offline, per gli strumenti.
- `Trailer.tsx`: la voce c'è se il giocatore ha scelto la voce recitata (le impostazioni del gioco), al volume scelto; col lettore di schermo il trailer è quello di prima.
- `strumenti/trailer-mix.cjs` (nuovo): il suono del trailer reso offline (musica, rumori, voce con la musica sotto), come nell'app. Lo usano `trailer-rumori.cjs` (ora con la voce, `--senza-voce` per toglierla) e `esporta-trailer.cjs`, che ora mette nei video la colonna vera invece di una traccia muta.
- `collaudo/doppiaggio.py`, punto 8: le frasi non si sovrappongono, cominciano vicino al loro testo, gli agganci sono esatti, ogni frase è detta o dichiarata solo scritta, nessuna è scaduta (l'id della parte), la traccia dura 88,5 s.

## Decisioni
- **Una traccia sola per tutto il trailer, non le 33 parti** — perché così la voce si sincronizza come la musica (un punto solo da seguire), e lo stesso file serve all'app e all'esportatore; le scelte di tempo (pause accorciate, velocità, agganci) si fanno una volta, offline, e si collaudano.
- **Al massimo +10% di velocità, senza cambiare l'altezza** — oltre, la voce enfatica di Enzo diventerebbe frettolosa; le regole tutte allo stesso passo.
- **Musica a −8 dB sotto la voce, voce a −18 LUFS** — la musica è a −14 LUFS: così la voce sta sopra di qualche dB senza spegnere il brano. Simone l'ha giudicato all'ascolto.
- **Nel finale le cinque regole, non i numeri né la frase finale** — scelta di Simone.
- **Versione 1.22.0** — una funzione nuova (MINOR).

## Verifiche
- La traccia resa offline (musica, rumori, voce) e riascoltata da whisper: si capiscono tutte le 28 frasi sopra la musica, nell'ordine; «tuo fratello» comincia a 64,0 s e «Il Viaggiatore» a 82,3 (whisper le segna circa 0,2 s dopo).
- Dal vivo, in Electron (una finestra mostrata fuori schermo), dal guado alle regole: la posizione della voce resta entro un centesimo dal tempo del trailer. In quelle finestre di prova la musica non parte (il brano servito dal server di sviluppo dà un errore del demultiplexer nell'Electron di sviluppo, anche senza la voce): l'abbassamento sotto la voce l'ha giudicato Simone nel gioco desktop vero.
- Il costo: la traccia si scarica in 7 ms e si decodifica in 144 ms fuori dal filo principale, 16 MB in memoria; il disegno dei fotogrammi non cambia (la voce non lo tocca).
- L'esportatore: una prova di 8 s ha video e suono (con «Non è il caso di tornare.»); l'esportazione intera rifà `video/il-viaggiatore-intro.mp4` e la versione a 720p (non versionate).
- `collaudo/doppiaggio.py` TUTTO OK, compreso il punto 8; gli altri dieci collaudi TUTTO OK; `npx tsc --noEmit` pulito; `npm run build` riuscito; `node desktop/prove.cjs`: 7 prove superate. L'esportazione intera: 2.652 fotogrammi in 171 s, poi 101 rumori e 28 frasi di voce nel suono.
- **Simone, al gioco desktop costruito da questi file: «top… capolavoro».**

## Questioni aperte
- Fasi 5 e 6 del piano 08: le verifiche finali e i documenti (README con le voci e i diritti).
- Rifare Imma, Rosaria, Tore e Vito prima del rilascio (piano 08, decisione 6).
