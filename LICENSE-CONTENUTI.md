# Licenza dei contenuti — CC BY-SA 4.0

**Il Viaggiatore** © 2026 Simone Pizzi (Pitz72).

I contenuti creativi di questo repository sono distribuiti con licenza
**Creative Commons Attribuzione – Condividi allo stesso modo 4.0 Internazionale**
(CC BY-SA 4.0): <https://creativecommons.org/licenses/by-sa/4.0/deed.it>
Testo legale completo: <https://creativecommons.org/licenses/by-sa/4.0/legalcode.it>

## Cosa copre

| Opera | Dove |
|---|---|
| La storia, i luoghi, i personaggi e tutta la prosa dell'avventura | `prototipo/*.fav` |
| I documenti di progetto | `pre-produzione/`, `video/il-viaggiatore-intro-tempi.md` |
| La colonna sonora originale dell'intro («Il Viaggiatore — Intro») | `app/src/assets/intro.mp3` |
| Le voci del doppiaggio (la lettura dei testi qui sopra, generata con Google Gemini TTS; comprese le voci inglesi del narratore e di Kira, in `app/public/voce/en/`) | `app/public/voce/`, tranne `app/public/voce/elevenlabs/` |
| L'icona, la copertina e la grafica | `grafica/` (immagini) |
| I ritratti dei personaggi e le illustrazioni degli oggetti (generati con Nano Banana Pro 2.1 di Google, in Google Flow) | `app/public/immagini/` |
| I testi a schermo del trailer e della guida | `app/src/trailer/`, `app/src/gioco/ComeSiGioca.tsx` (solo i testi) |

Il codice che fa funzionare tutto questo è invece sotto licenza MIT (`LICENSE`).

Per le voci di Gemini TTS e per le immagini di Nano Banana Pro vale lo stesso: Google non rivendica la proprietà di ciò
che si genera, che però non è esclusivo; i file generati portano la filigrana invisibile SynthID.

## Cosa NON copre: i marchi

Le forme dei loghi d'apertura, in `app/src/loghi/forme.ts`, sono marchi dei
rispettivi titolari e **non** sono coperte né da questa licenza né dalla licenza MIT:

- il marchio di **Runtime Multimedia** (i tracciati del logo ufficiale a colori);
- il simbolo e la scritta di **FAVELLA 1** (il simbolo è il marchio ufficiale
  ridisegnato in vettoriale).

Lo stesso vale per i due marchi nelle immagini promozionali di `grafica/branding/` e per il file ufficiale
`grafica/branding/marchi/RuntimeMultimedia_Bianco.svg`: le immagini sono sotto questa licenza, i marchi no.

Tutti i diritti riservati. Si possono ridistribuire solo come parte di questo
gioco, senza modifiche; un'opera derivata deve toglierli o sostituirli. Il codice
che li anima (`app/src/loghi/LogoRuntime.tsx`, `LogoFavella.tsx`) è sotto licenza
MIT come il resto.

## Cosa NON copre: le musiche delle zone e la canzone dei titoli di coda

Le sette musiche delle zone, la canzone dei titoli di coda («La mano sa ancora la forma», musica e testo) e
l'album **«Il Viaggiatore Official Soundtrack»** (`app/public/musica/`, `app/public/colonna-sonora/`) sono
di **The Runtimers**, generate con **Lyria 3.5** di Google. **Non**
sono coperte da questa licenza: per il loro uso valgono i termini di Google per i contenuti generati con
Lyria. Si ridistribuiscono come parte di questo gioco; un'opera derivata che non ne abbia i diritti deve
toglierle (il gioco funziona anche senza: le zone restano in silenzio, e sotto la sequenza finale suona
il tema dell'intro). La copertina dell'album è il logo del gioco, sotto questa licenza.

## Cosa NON copre: le voci di ElevenLabs

Le voci dei **quattordici personaggi**, in italiano e in inglese
(`app/public/voce/elevenlabs/` e `app/public/voce/en/elevenlabs/`), sono state generate con
ElevenLabs (elevenlabs.io) sul piano gratuito, che non concede l'uso commerciale. **Non** sono
coperte da questa licenza: si possono ridistribuire solo come parte di questo gioco e **solo per
uso non commerciale**, citando elevenlabs.io. Un'opera derivata o un uso commerciale deve toglierle
o sostituirle (il gioco funziona anche senza: quelle battute restano scritte). Le voci della
libreria di ElevenLabs (Victoria, Valeria, Criss, Luigi, Elettra, Nonno Ben, Pierpaolo, Vittorio, Corrado Noventa; Nunzio, Saverio, Rocco, Pasquale e Concetta sono voci disegnate dall'autore con il Voice Design di ElevenLabs) sono dei loro titolari.

Dal 1° novembre 2026 l'autore ha un abbonamento a pagamento a ElevenLabs: le voci inglesi generate dopo l'acquisto potrebbero
avere diritti più ampi di quelle del piano gratuito. Finché non si verifica nei termini di ElevenLabs, restano tutte nella
stessa cartella e con la stessa esclusione (scelta prudente: non è una consulenza legale).

## In breve

Puoi copiare, distribuire, modificare e riusare questi contenuti, anche a fini
commerciali, a due condizioni:

- **Attribuzione:** cita l'autore («Il Viaggiatore di Simone Pizzi»), indica la
  licenza con un link e segnala se hai apportato modifiche.
- **Condividi allo stesso modo:** se remixi o trasformi i contenuti, distribuisci il
  risultato con la stessa licenza.

Questo riassunto non sostituisce il testo legale.
