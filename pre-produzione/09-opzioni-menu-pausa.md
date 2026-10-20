# IL VIAGGIATORE — Le opzioni, il menu d'avvio e la pausa

> Pre-produzione · Strato 9 · **v0.1, 20/10/2026: piano scritto, non eseguito.** Si esegue una fase alla
> volta (§8) con il via libera di Simone alla fine di ciascuna.
> Obiettivo: confezionare il gioco come un prodotto commerciale, sul modello di **Il Relitto** per
> l'impostazione (non per la tecnologia: lì Tauri, qui Electron). Ogni voce cita i file da toccare.

---

## 0. Perimetro e vincoli

**Che cosa si fa.** Un pannello **Opzioni** unico, a schede (Generale, Video, Audio), raggiungibile dal
menu d'avvio e dalla partita; il **menu d'avvio riorganizzato**; un **menu di pausa** con Esc.

**Che cosa non si tocca:**

- il motore (`motore/`), la storia (`prototipo/*.fav`), i testi, il doppiaggio già prodotto;
- il formato dei salvataggi e la loro impronta (`versione.json` → `formatoSalvataggi` resta 1);
- loghi, cartello dei crediti, avviso dell'autore e trailer: ordine, durate, testi, musica, Esc come
  unico modo di saltare. **Il menu d'avvio invece non fa parte dell'intro** (Simone, 20/10/2026: «si
  aggancia all'ultimo frame dell'intro ma non ne fa parte»): si riorganizza (§4).

**Il contesto.** Gioco desktop a schermo intero alla massima risoluzione; telefono e touch non si
considerano. La versione web eredita ciò che può (niente finestra, niente dimensione, niente
aggiornamenti) senza guidare le scelte.

## 1. Le decisioni di Simone (20/10/2026)

1. **Comandi: tre modi.** Pulsanti e parole insieme (come oggi, predefinito), solo pulsanti, solo parole.
2. **Schermo: il predefinito è lo schermo intero.** Lo leggo così: al primo avvio (e dopo «ripristina»)
   il gioco parte a schermo intero; chi sceglie la finestra la ritrova uguale, dimensione compresa, ai
   lanci successivi. Se invece deve ripartire *sempre* a schermo intero, cambia una riga (domanda D1).
3. **Il menu d'avvio va riorganizzato** (§4).
4. **Pausa con Esc** a riga vuota, come nel Relitto (§5).

## 2. Che cosa c'è oggi (verificato nel codice)

| Che cosa | Dove | Com'è |
|---|---|---|
| Schermo intero | `desktop/main.cjs` (`fullscreen: true`, F11), `GameShell.tsx` (tasto sul palco) | parte a schermo intero; non si ricorda nulla; uscendo, la finestra è sempre 1600×900 |
| Audio del menu | `Trailer.tsx` → `commutaAudio` | un interruttore «♪ audio sì/no», nessun volume |
| Voce | `gioco/ImpostazioniVoce.tsx`, `gioco/voce.ts` (`localStorage` «viaggiatore.voce») | modo (recitata / lettore di schermo) e un volume; vale anche per Enzo nel trailer |
| Musica, effetti | `trailer/audio.ts`, `loghi/suono.ts` | nessun volume proprio. In partita suona solo la voce: la musica c'è nel trailer e nel menu, gli effetti nei loghi e nei rumori del trailer |
| Movimento ridotto | `index.css`, `Loghi.tsx`, `Trailer.tsx`, `Avviso.tsx`, `Crediti.tsx` | solo dall'impostazione di Windows. Con il movimento ridotto **i loghi non si mostrano e il trailer salta al menu** |
| Qualità grafica | `Trailer.tsx` (`qualita`, `tetto`), `Panorama.tsx` (`dpr` fino a 2) | il trailer scende da solo (1 → 0,75 → 0,5) se il computer non regge; il panorama no |
| Comandi | `ViaggiatorePlayer.tsx` | riga di comando e pulsanti sempre insieme |
| Aggiornamenti | `desktop/aggiornamenti.cjs` | sempre attivi (installatore Windows, AppImage); nessuna scelta |
| Pausa | — | non c'è: Esc chiude i pannelli |

Un fatto utile: `collaudo/pulsanti.py` gioca già i sei finali della storia **solo con i pulsanti** (a ogni
turno chiede all'interfaccia vera che cosa offre). La modalità «solo pulsanti» poggia su una prova che
esiste; `finali.py` fa lo stesso per la modalità «solo parole».

## 3. Le opzioni

### 3.1 Il deposito — `app/src/lib/opzioni.ts` (nuovo)

Come `stile/opzioni.ts` del Relitto: un'interfaccia `Opzioni`, `OPZIONI_DI_BASE`, una chiave sola
(`localStorage` «viaggiatore.opzioni»), un `useOpzioni()` con gli ascoltatori, così menu, gioco, trailer
e loghi vedono le stesse opzioni e un cambio vale subito, senza riavviare.

- **Migrazione:** la prima volta si leggono modo e volume da «viaggiatore.voce», poi la vecchia chiave
  si cancella. Chi ha già scelto «lettore di schermo» lo ritrova.
- **Valori fuori misura** (un file scritto a mano, una versione futura) → si torna al valore di base,
  voce per voce; mai un'opzione rotta che blocca il gioco.
- **Il desktop tiene una copia** delle opzioni che servono *prima* della pagina (schermo intero,
  dimensione e posizione della finestra, aggiornamenti) in `impostazioni.json` nella cartella dei dati
  dell'utente: la finestra nasce già giusta, senza un lampo a schermo intero (§6).

### 3.2 Il pannello — `app/src/gioco/Opzioni.tsx` (nuovo)

- **Tre schede** con le regole ARIA dei tab: frecce ← → fra le schede, Tab dentro, Esc chiude. Ogni riga
  ha nome, valori come pulsanti premuti/non premuti e una spiegazione breve (come nel Relitto).
  I volumi sono cursori da 0 a 100 a passi di 5, che si muovono anche con le frecce.
- **Effetto immediato**, niente «applica».
- In fondo: **«ripristina le opzioni di base»** (con una conferma) e **«chiudi · Esc»**.
- Stesso aspetto dei pannelli che ci sono (`ComeSiGioca`, `Taccuino`): misure in `em` con la base che
  arriva da fuori (19 sulla superficie 1920 del menu, 13 su quella 1280 del gioco), accento della zona.
- Si apre dal menu d'avvio (§4), dalla pausa (§5) e dal tasto in testata. Il pannello «La voce» si toglie:
  le sue righe passano nella scheda Audio.

### 3.3 Generale

| Opzione | Valori | Note |
|---|---|---|
| **Comandi** | pulsanti e parole · solo pulsanti · solo parole | predefinito: pulsanti e parole |
| **Aggiornamenti** | cercali all'avvio · no | solo desktop. La spiegazione dice che si chiede a GitHub e che non si manda niente; la portatile e il .deb non si aggiornano da soli, e lo si scrive |

**Solo pulsanti.** La riga di comando sparisce (con «invio ↵»); resta tutto il resto: uscite, cose,
azioni, menu delle cose, «usa su…», risposte di dialogo, scorte e bisaccia che si toccano, parole in
maiuscolo che si toccano, ↶ annulla e Ctrl+Z, F2, F5, F9. Il fuoco va al primo pulsante invece che al campo.

**Solo parole.** L'avventura testuale pura: spariscono le file di pulsanti (uscite, qui, azioni), i menu
delle cose, il pannello delle dosi; le parole in maiuscolo restano evidenziate ma non si toccano; le
risposte di dialogo restano scritte e numerate, e si sceglie scrivendo il numero; scorte, bisaccia e
fiducia a lato restano come informazione, non si toccano. Restano i tasti dell'app (F2, F5, F9, Esc).
La **conferma delle scelte che costano** resta: è una rete di sicurezza, e si risponde con S e N come oggi.
«opzioni» e «pausa» scritti aprono i pannelli (si fermano prima del motore: da verificare che il motore
non li usi già).

**I testi che parlano dei comandi** si adattano al modo: la guida «Come si gioca» (la scheda «Scrivi o
tocca»), il segnaposto della riga, la frase del menu d'avvio (domanda D5).

### 3.4 Video

| Opzione | Valori | Note |
|---|---|---|
| **Schermo** | schermo intero · finestra | anche F11, che aggiorna l'opzione |
| **Dimensione della finestra** | 1280×720 · 1600×900 · 1920×1080 · 2560×1440 · 3840×2160 | solo le misure che entrano nello schermo; vale in finestra; se si trascina il bordo, «personalizzata» |
| **Qualità della grafica** | automatica · alta · media · bassa | per i paesaggi della partita e per il trailer |
| **Alta accessibilità** | sì · no | un interruttore che accende un insieme (sotto) |

**Sulla «risoluzione».** Electron non cambia la modalità del monitor: lo schermo intero è sempre alla
risoluzione nativa (non c'è lo «schermo intero esclusivo» a 1280×720 dei giochi DirectX), e il gioco lì è
già nitido, perché l'interfaccia è vettoriale e scalata. La risoluzione diventa quindi due cose:

- la **dimensione della finestra**: la finestra si apre centrata sullo schermo dell'ultima volta; se
  quello schermo non c'è più, su quello principale;
- la **qualità della grafica**, che è la «scala di rendering» dei giochi d'oggi. *Automatica* è il
  comportamento di oggi (il trailer scende da solo se il computer arranca); *alta* = densità fino a 2,
  tetto 2560 (3840 se la misura lo permette, come ora); *media* = 0,75; *bassa* = 0,5 e il panorama a
  densità 1. Serve ai PC lenti, dove il trailer non è mai stato provato.

**Alta accessibilità.** Un interruttore che accende cinque cose insieme; sotto, le cinque righe per
regolarle una per una (se se ne cambia una, l'interruttore dice «personalizzata»):

| Riga | Valori | Che cosa fa |
|---|---|---|
| Contrasto | normale · alto | testi pieni su fondi pieni, niente velature né sfocature dietro i pannelli, bordi netti; obiettivo WCAG AAA (7:1) sul testo del diario e dei pannelli |
| Testo | normale · grande | il diario e i pannelli più grandi (la prosa da 17 a circa 21 px sulla superficie 1280). La superficie resta 1280×720: il testo grande vale per il diario e i pannelli, la barra laterale si riordina ma non cresce quanto loro |
| Carattere | Lora · Atkinson Hyperlegible | come nel Relitto. Licenza OFL, il pacchetto npm `@fontsource-variable/atkinson-hyperlegible-next` (da scaricare: lo chiedo prima) |
| Movimento | come il sistema · ridotto · pieno | ridotto: il viandante non cammina, il panorama sta fermo, niente pulsazioni né transizioni. **Oggi il movimento ridotto salta anche i loghi e il trailer** (domanda D2) |
| Fuoco | normale · marcato | un contorno spesso e ben staccato su ciò che ha il fuoco della tastiera |

### 3.5 Audio

| Opzione | Valori | Che cosa tocca |
|---|---|---|
| **Volume generale** | 0–100 | tutto |
| **Musica** | 0–100 | il brano del trailer e del menu (`intro.mp3`) |
| **Voce** | 0–100 | il doppiaggio in partita ed Enzo nel trailer |
| **Effetti** | 0–100 | i loghi sonori, i rumori del trailer |
| **Voce del gioco** | recitata · lettore di schermo | dal pannello «La voce», con «↻ riascolta» e la nota su F2 |
| **Suono** | stereo · mono | per chi sente da un orecchio solo |
| **Quando il gioco non è in primo piano** | continua · silenzia | silenzia se la finestra è ridotta a icona o perde il fuoco |

- **Un bus sonoro solo** (`app/src/lib/suono.ts`, nuovo): tiene i guadagni correnti, li dà a chi crea un
  `AudioContext` (`trailer/audio.ts`, `gioco/voce.ts`, `loghi/suono.ts`) e li aggiorna dal vivo con
  `setTargetAtTime` (niente scatti). L'abbassamento della musica sotto la voce di Enzo (`VOCE_SOTTO`)
  resta relativo: si moltiplica per il volume della musica.
- I loghi suonano prima di ogni menu: leggono i volumi salvati, quindi se li si abbassa si sentono più
  piano anche all'avvio dopo. Il comportamento non cambia.
- **Mono:** l'uscita di ogni contesto si fonde in un canale (`destination.channelCount = 1`, modo
  esplicito).
- Il tasto «♪ audio sì/no» del menu sparisce: lo sostituiscono il volume generale e il menu riorganizzato.
  Nel browser la musica parte comunque solo dopo un gesto: è la regola del browser e resta.

## 4. Il menu d'avvio, riorganizzato

**Oggi** (`Trailer.tsx`, «schermata d'avvio»): sotto il titolo, la frase «Si parte a piedi. Da qui in poi
comandi tu…», una fila con Continua / Nuovo viaggio e una seconda fila di cinque pulsantini (come si
gioca, carica, rivedi il trailer, audio, esci). Si usa col mouse o con Tab.

**Proposta, sul modello del Relitto** (`menu/Menu.tsx` di là):

- Una **colonna di voci** al centro, sotto il titolo (che resta dov'è, sull'ultimo fotogramma vivo del
  trailer, col suo velo):
  1. **Continua il viaggio** (sotto, piccolo: luogo · turno) — solo se c'è un salvataggio
  2. **Nuovo viaggio** (oppure **Inizia il viaggio**, se non c'è niente da continuare)
  3. **Carica un viaggio**
  4. **Opzioni**
  5. **Come si gioca**
  6. **Rivedi il trailer**
  7. **Crediti** — riapre il cartello delle licenze e dei crediti, da leggere con calma (non prosegue da
     solo dopo 15 s; Esc o Invio chiude) (domanda D8)
  8. **Esci** — solo desktop
- **Tastiera:** ↑ ↓ (e Inizio, Fine) da una voce all'altra, Invio sceglie; il fuoco parte sulla prima voce,
  senza contorno finché non si usa la tastiera. Il mouse come sempre.
- **Aspetto:** le voci in Sora, la prima più grande e color ambra (`#f0b77e`); la voce sotto il mouse o col
  fuoco ha un filo ambra a sinistra e il testo pieno, le altre a 70%. Stesso fondo scuro radiale di oggi
  sotto la colonna, perché si leggano anche a 4K sul prato e sulla strada.
- **Piede:** la versione in basso a destra (come oggi); a sinistra, piccolo, «↑↓ scegli · Invio conferma».
- La frase «Si parte a piedi…» (domanda D5).
- La parte per il telefono in verticale (`compatto`) resta com'è: non la si considera.

## 5. La pausa

- **Esc in partita**, nell'ordine: chiude il pannello o il menu aperto (come oggi); se la voce sta parlando,
  la zittisce soltanto; se la riga è vuota e non c'è niente di aperto, apre la **pausa**. Con la riga piena,
  Esc continua a non fare nulla di distruttivo (in «solo pulsanti» la riga non c'è: Esc va alla pausa).
- **Voci della pausa:** Riprendi (Esc) · Salva (F5) · Carica (F9) · Opzioni · Come si gioca · Torna al menu
  d'avvio · Esci dal gioco (solo desktop). Stesse frecce e stesso Invio del menu d'avvio.
- «Torna al menu» ed «Esci» fanno quello che fanno oggi «← intro» e «✕ esci»: prima il posto automatico.
- Mentre la pausa è aperta il panorama si ferma (in partita non corre nient'altro: è a turni).
- **La testata** si snellisce: «salva · carica · ☰ pausa (Esc)» al posto dei sei pulsanti di oggi
  (domanda D3).

## 6. Il desktop

- **`desktop/impostazioni.cjs`** (nuovo): legge e scrive `impostazioni.json` nella cartella dei dati
  (`app.getPath("userData")`): `schermoIntero`, `larghezza`, `altezza`, `x`, `y`, `schermo`,
  `cercaAggiornamenti`. Valori sbagliati o finestra fuori da ogni schermo → quelli di base.
- **`main.cjs`**: la finestra nasce da lì (`fullscreen`, `width`, `height`, centrata); F11, il
  trascinamento e la chiusura aggiornano il file; `aggiornamenti.avvia` solo se `cercaAggiornamenti`.
- **Canali nuovi** in `preload.cjs` e `ipc.cjs` (`impostazioni:leggi`, `impostazioni:scrivi`,
  `finestra:dimensione`, `finestra:schermi`), con il controllo del mittente che c'è già.
- L'**autoverifica** non legge il file (parte con i valori di base, come ora) e in più prova che il
  pannello delle opzioni si apre e che i volumi arrivano ai guadagni.

## 7. Come si verifica

- **`desktop/prove.cjs`**: lettura e scrittura di `impostazioni.json`, valori rotti, una finestra più
  grande dello schermo, uno schermo staccato.
- **`app/scripts/opzioni-node.mjs`** (nuovo, nel collaudo): i valori di base, la migrazione da
  «viaggiatore.voce», i valori fuori misura, l'interruttore dell'alta accessibilità che accende e spegne le
  cinque righe e dice «personalizzata».
- **`collaudo/pulsanti.py`** resta la prova di «solo pulsanti»; in più controlla che nessun passo dei
  percorsi abbia bisogno della riga di comando. `finali.py` copre «solo parole».
- **Nel browser integrato**, per ogni modo dei comandi e con l'alta accessibilità: catture, contrasto
  misurato sui colori calcolati, un giro solo da tastiera (menu → opzioni → partita → pausa → menu).
- **Nel desktop vero, con Simone all'ascolto:** i volumi a orecchio, mono, il silenzio in secondo piano;
  finestra e schermo intero attraverso i riavvii; la dimensione su due monitor se ci sono.
- **Partite intere** in ciascuno dei tre modi dei comandi, lette come un giocatore.
- Ogni fase: `finali.py`, `mirate.py`, `salvataggi.py`, `interfaccia.py`, `pulsanti.py`, `testo.py`,
  `doppiaggio.py`, `npm run build`, `prove.cjs`.

## 8. Le fasi

Una per volta, con il via libera di Simone alla fine; ognuna con versione MINOR, CHANGELOG, diario,
commit e push. Il rilascio pubblico, solo su ordine.

| Fase | Che cosa | Versione |
|---|---|---|
| 1 | Deposito delle opzioni, pannello con le tre schede, **Audio** completo (volumi veri, mono, secondo piano, la voce dentro); «♪ voce» e «♪ audio» aprono le Opzioni | 1.24.0 |
| 2 | **Menu d'avvio** riorganizzato, **pausa** con Esc, testata snellita, Crediti dal menu | 1.25.0 |
| 3 | **Video**: schermo e finestra ricordati, dimensione, qualità grafica; `impostazioni.cjs`; aggiornamenti sì/no | 1.26.0 |
| 4 | **Comandi**: i tre modi; guida e testi adattati | 1.27.0 |
| 5 | **Alta accessibilità**: contrasto, testo, carattere (scaricamento da confermare), movimento, fuoco | 1.28.0 |
| 6 | Verifiche finali, partite intere nei tre modi, README, guide, pacchetti | 1.28.x |

## 9. Domande per Simone

- **D1.** Schermo: «predefinito schermo intero, e la finestra scelta si ricorda ai lanci successivi».
  Giusto, o deve ripartire sempre a schermo intero?
- **D2.** Oggi, con il movimento ridotto di Windows, i loghi non si mostrano e il trailer salta al menu.
  Con l'opzione «ridotto» deve succedere lo stesso, oppure loghi e trailer restano e si ferma solo il
  movimento della partita?
- **D3.** Testata della partita: «salva · carica · ☰ pausa» (proposta) o tutti i tasti di oggi più
  «⚙ opzioni»?
- **D4.** «Nuovo viaggio» quando c'è un viaggio da continuare: chiedere conferma («Il viaggio salvato
  resta nel taccuino; il posto automatico verrà riscritto»)?
- **D5.** La frase del menu «Si parte a piedi. Da qui in poi comandi tu: scrivi in italiano o scegli con
  i pulsanti…»: tenerla intera (adattata al modo dei comandi), tenere solo «Si parte a piedi.», o toglierla?
- **D6.** Il tasto dello schermo intero in alto a destra sul palco della partita: toglierlo (restano F11 e
  le opzioni)?
- **D7.** I suggerimenti in margine (◇): serve un'opzione per nasconderli? Il mio consiglio è no: fanno
  parte del disegno, e la voce li legge.
- **D8.** La voce «Crediti» nel menu d'avvio: la aggiungo?
