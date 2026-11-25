---
data: 2026-11-25
ora: "19:33"
titolo: "I rumori veri nel gioco: scelta delle prese, taglio, livelli"
tipo: sessione
versione: 1.43.1
---

# I rumori veri nel gioco: scelta delle prese, taglio, livelli

## In breve
Simone ha ascoltato le prese generate con ElevenLabs e ha lasciato la scelta a me («scegli tu, alcuni sono proprio impercettibili e
altri molto simili»). Ho scelto misurando, tagliato, livellato e messo nel gioco 27 effetti (81 file, 306 KB): loghi, trailer e mappa
suonano ora rumori veri, con la stessa energia dei sintetici di prima. Corretti anche i passi che continuavano sul menu. Niente è
rilasciato.

## Contesto
Le 87 prese stavano in `effetti/master/` ([diario di poco prima](2026-11-25-gli-effetti-sonori-generati-con-elevenlabs.md)). Il
censimento ([`pre-produzione/12-suoni.md`](../../pre-produzione/12-suoni.md)) diceva dove va ogni suono e che cosa cambia nel codice.

## Lavoro fatto
- **La scelta, misurando**: per ogni presa il picco, l'energia della parte attiva, la durata del suono vero, i colpi, il baricentro
  dello spettro e la distanza di timbro dalle altre prese. Fra prese simili ho tenuto la più piena; dove servono varianti, le più
  diverse; dalle sequenze, i colpi più puliti. Il trofeo è rimasto sintetico: è un Mi preciso, e le prese sono soffi senza altezza.
  La tabella delle scelte sta in [`effetti/LEGGIMI.md`](../../effetti/LEGGIMI.md).
- **Il taglio e il livello** (`strumenti/effetti.py`, nuovo): silenzi ai bordi tolti, colpi singoli ritagliati da passi, tasti e
  ticchettii, tutti al picco di −1,5 dBFS. I colpi di una stessa camminata sono alla stessa energia: la prima versione, livellata al
  picco, lasciava fra un passo e l'altro fino a 10 dB di differenza. Opus mono 64 kbit/s, con l'indice e la licenza.
- **Il codice**: `app/src/lib/effetti.ts` (nuovo) carica e decodifica gli effetti una volta, su un contesto offline (un AudioBuffer
  suona su qualunque contesto), e li suona con variante, posizione, velocità e, per il ronzio, il giro continuo. Agganciati:
  - la colonna del trailer (`trailer/audio.ts`): carta delle buste e del biglietto (`biglietto` è un campo nuovo dell'evento in
    `scaletta.ts`), tasti, timbro, soffi, passi per terreno; ogni colpo ha la sua variante dal seme dell'evento, con ±4% di velocità e
    ±2 dB, come i sintetici;
  - la partitura dei loghi (`loghi/suono.ts`): diciassette punti, ognuno con la stessa posizione nello stereo e la stessa mandata al
    riverbero del sintetico; le note, le campane, l'arpa e gli accordi non sono toccati;
  - la mappa (`gioco/suonoCarta.ts`).
  Dove un effetto manca, resta il sintetico di prima. Gli effetti si caricano all'avvio (`App.tsx`); i loghi li aspettano insieme ai
  caratteri (al massimo 1,5 s), la preparazione del trailer al massimo 3 s.
- **I livelli** (`strumenti/effetti-livelli.cjs`, nuovo): rende offline ogni rumore sintetico e il suo effetto, senza riverbero, e
  scrive nell'indice il moltiplicatore che dà all'effetto la stessa energia. Rimisurando, i livelli tornano entro 1 dB circa (il
  rumore sintetico cambia a ogni resa). I loghi espongono per questo i loro mattoni (`primitivi`), la carta un parametro
  `soloSintetico`.
- **Il collaudo** (`collaudo/effetti.py`, nuovo, nella CI): file, durate, livelli, licenza, chiavi usate dal codice, peso, picchi.
- **I passi sul menu**: la camminata del titolo si ferma alla fine del trailer (`scaletta.ts`).
- **Gli strumenti del trailer**: `trailer-mix.cjs` aspetta gli effetti prima di rendere (anche l'esportazione dei video li usa);
  `trailer-rumori.cjs --senza-effetti` rende i rumori sintetici di prima, per il confronto.
- **L'autoverifica del pacchetto** controlla che gli effetti si carichino e si decodifichino dentro il gioco confezionato.
- **La licenza**: gli effetti sono fuori dalla licenza libera, come le voci ElevenLabs (`LICENSE-CONTENUTI.md`, e la licenza
  nell'indice).

## Decisioni
- **La stessa energia dei sintetici** — perché: il bilanciamento con la musica e con la voce era già stato deciso e ascoltato; i
  rumori veri cambiano la materia, non il volume. Se Simone li vuole più presenti, si alza un numero nell'indice.
- **Il trofeo resta sintetico**, e restano sintetiche tutte le parti intonate — perché: sono note su una tonalità e sui fotogrammi.
- **Fallback sintetico** ovunque — perché: un'opera derivata che toglie gli effetti (la licenza lo chiede) deve continuare a suonare.

## Verifiche
- I rumori del trailer da 0 a 33 s resi offline prima e dopo (`trailer-rumori.cjs`, con e senza `--senza-effetti`): la differenza
  fra le due rese sta 26 dB sotto il segnale (i rumori sono cambiati davvero), e l'energia di ogni tratto (buste, biglietto, passi
  su asfalto, crosta e sale, soffio, timbro) è la stessa entro 0,2 dB.
- Nel browser di sviluppo: gli effetti si caricano tutti (3 buste, 8 passi per terreno, il ronzio, 8 tasti); loghi e trailer girano
  senza errori in console.
- `tsc` ed ESLint puliti; `collaudo/effetti.py` TUTTO OK; l'autoverifica del pacchetto superata («ok effetti: caricati e
  decodificati», 10.919 fotogrammi del trailer senza errori).
- I collaudi della CI in locale, tutti verdi, compresi `doppiaggio.py` e il nuovo `effetti.py` (`mappa.py`: 12.315 controlli, 0 falliti;
  `desktop/prove.cjs`: 21 prove).

## Questioni aperte
- Simone deve **ascoltare** loghi, trailer e mappa nel gioco desktop e dire che cosa cambiare (un livello, una presa).
- I master (M18) hanno una sola copia sul computer, più il conto ElevenLabs.
- La licenza degli effetti col piano di Simone; il controllo della sequenza finale (il suo orologio).
