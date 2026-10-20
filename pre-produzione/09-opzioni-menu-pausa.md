# IL VIAGGIATORE — Opzioni, menu d'avvio, pausa, salvataggi, trofei

> Pre-produzione · Strato 9 · **v0.2, 20/10/2026: le domande hanno avuto risposta (§1). Fase 1 eseguita
> (1.24.0); le altre da fare.** Si esegue una fase alla volta (§10) con il via libera di Simone alla fine di ciascuna.
> Obiettivo: confezionare il gioco come un prodotto commerciale per desktop, sul modello di **Il Relitto**
> per l'impostazione (non per la tecnologia: lì Tauri, qui Electron). Ogni voce cita i file da toccare.

---

## 0. Perimetro e vincoli

**Che cosa si fa.** Un pannello **Opzioni** a schede (Generale, Video, Audio); il **menu d'avvio
riorganizzato**; un **menu di pausa** con Esc; un **taccuino da app desktop** (salvataggi liberi con nome,
rapidi, automatici a rotazione, miniatura e tempo di gioco); una collezione di **Trofei**.

**Che cosa non si tocca:**

- il motore (`motore/`), la storia e i testi (`prototipo/*.fav`), il doppiaggio già prodotto;
- l'impronta dei salvataggi e la partita salvata come sequenza di comandi (`app/src/lib/ponte.py`); i
  campi nuovi del file sono facoltativi, quindi `formatoSalvataggi` resta 1 e i file di oggi si aprono;
- loghi, cartello dei crediti, avviso dell'autore e trailer: ordine, durate, testi, musica, Esc come
  unico modo di saltare. **Il menu d'avvio non fa parte dell'intro** (Simone, 20/10/2026: «si aggancia
  all'ultimo frame dell'intro ma non ne fa parte»): si riorganizza (§4).

**Il contesto.** Gioco desktop a schermo intero alla massima risoluzione; telefono e touch non si
considerano. La versione web eredita ciò che può (niente finestra, niente aggiornamenti, salvataggi nel
browser) senza guidare le scelte.

## 1. Le decisioni di Simone (20/10/2026)

| # | Domanda | Risposta |
|---|---|---|
| — | Comandi | **tre modi**: pulsanti e parole (predefinito), solo pulsanti, solo parole |
| — | Pausa | **Esc a riga vuota**, come nel Relitto |
| — | Menu d'avvio | non fa parte dell'intro: **da riorganizzare** |
| D1 | Schermo all'avvio | **predefinito schermo intero; la finestra scelta si ricorda** (dimensione e posizione) |
| D2 | Movimento ridotto | **loghi e trailer restano sempre**: il movimento ridotto ferma solo ciò che si muove in partita e nei menu. Oggi l'impostazione di Windows li salta: questo cambia, per scelta di Simone |
| D3 | Testata della partita | **salva · carica · ☰ pausa** |
| D4 | «Nuovo viaggio» con un viaggio da continuare | **una conferma** |
| D5 | Frase del menu | **solo «Si parte a piedi.»**; il resto va nella guida |
| D6 | Tastino dello schermo intero sul palco | **si toglie** (restano F11 e le opzioni) |
| D7 | Opzione per nascondere i suggerimenti ◇ | **no**: restano sempre |
| D8 | «Crediti» nel menu | **no**: al suo posto **Trofei**, una pagina con la collezione (§7) |
| S1 | Salvataggi | **liberi, con nome**, nessun limite |
| S2 | F5 / F9 | **rapidi**: F5 salva subito, F9 ricarica il rapido |
| S3 | Che cosa mostra un salvataggio | **miniatura del paesaggio, tempo di gioco, luogo · tappa · turno · data, corpo e scorte** |
| S4 | Automatici | **tre a rotazione**, più uno all'uscita |
| S5 | Windows | **esporta e importa, apri la cartella** (come oggi); niente doppio clic né trascinamento |
| T1 | Famiglie di trofei | **tutte**: finali e fini, gesti verso le persone, modi di arrivare, sfide e collezione |
| T2 | Trofei non vinti | **nascosti, con un accenno** che non svela |
| T3 | Avviso | **discreto, mai sopra il finale**, con **un lievissimo suono flautato** |

## 2. Che cosa c'è oggi (verificato nel codice)

| Che cosa | Dove | Com'è |
|---|---|---|
| Schermo intero | `desktop/main.cjs` (`fullscreen: true`, F11), `GameShell.tsx` (tastino sul palco) | parte a schermo intero; non si ricorda nulla; uscendo, la finestra è sempre 1600×900 |
| Audio del menu | `Trailer.tsx` → `commutaAudio` | un interruttore «♪ audio sì/no», nessun volume |
| Voce | `gioco/ImpostazioniVoce.tsx`, `gioco/voce.ts` (`localStorage` «viaggiatore.voce») | modo (recitata / lettore di schermo) e un volume; vale anche per Enzo nel trailer |
| Musica, effetti | `trailer/audio.ts`, `loghi/suono.ts` | nessun volume proprio. In partita suona solo la voce: la musica c'è nel trailer e nel menu, gli effetti nei loghi e nei rumori del trailer |
| Movimento ridotto | `index.css`, `Loghi.tsx`, `Trailer.tsx`, `Avviso.tsx`, `Crediti.tsx` | solo dall'impostazione di Windows, e salta loghi e trailer |
| Qualità grafica | `Trailer.tsx` (`qualita`, `tetto`), `Panorama.tsx` (`dpr` fino a 2) | il trailer scende da solo (1 → 0,75 → 0,5) se il computer non regge; il panorama no |
| Comandi | `ViaggiatorePlayer.tsx` | riga di comando e pulsanti sempre insieme |
| Aggiornamenti | `desktop/aggiornamenti.cjs` | sempre attivi (installatore Windows, AppImage) |
| Pausa | — | non c'è: Esc chiude i pannelli |
| Salvataggi, disco | `desktop/salvataggi.cjs` | già da desktop: un file per posto in `Documenti/Il Viaggiatore/Salvataggi`, scrittura atomica (`.tmp` → rinomina), copia di riserva `.bak`, coda per file |
| Salvataggi, taccuino | `gioco/Taccuino.tsx`, `lib/salvataggi.ts` | sei posti fissi e senza nome più un automatico; F5 e F9 aprono il pannello; esporta, elimina, «apri un file…», «apri la cartella»; solo mouse e Tab |
| Trofei | — | non ci sono |

Due fatti utili: `collaudo/pulsanti.py` gioca già i sei finali della storia **solo con i pulsanti**, e
`finali.py` li gioca tutti scrivendo. Le due modalità nuove poggiano su prove che esistono.

## 3. Le opzioni

### 3.1 Il deposito — `app/src/lib/opzioni.ts` (nuovo)

Come `stile/opzioni.ts` del Relitto: un'interfaccia `Opzioni`, `OPZIONI_DI_BASE`, una chiave sola
(`localStorage` «viaggiatore.opzioni»), un `useOpzioni()` con gli ascoltatori, così menu, gioco, trailer
e loghi vedono le stesse opzioni e un cambio vale subito, senza riavviare.

- **Migrazione:** la prima volta si leggono modo e volume da «viaggiatore.voce», poi la vecchia chiave
  si cancella. Chi ha già scelto «lettore di schermo» lo ritrova.
- **Valori fuori misura** → si torna al valore di base, voce per voce; mai un'opzione rotta che blocca il
  gioco.
- **Il desktop tiene una copia** delle opzioni che servono *prima* della pagina (schermo intero,
  dimensione e posizione della finestra, aggiornamenti) in `impostazioni.json` nella cartella dei dati
  dell'utente: la finestra nasce già giusta, senza un lampo a schermo intero (§8).

### 3.2 Il pannello — `app/src/gioco/Opzioni.tsx` (nuovo)

- **Tre schede** con le regole ARIA dei tab: frecce ← → fra le schede, Tab dentro, Esc chiude. Ogni riga
  ha nome, valori come pulsanti premuti/non premuti e una spiegazione breve. I volumi sono cursori da 0 a
  100 a passi di 5, che si muovono anche con le frecce.
- **Effetto immediato**, niente «applica».
- In fondo: **«ripristina le opzioni di base»** (con una conferma) e **«chiudi · Esc»**.
- Stesso aspetto dei pannelli che ci sono (`ComeSiGioca`, `Taccuino`): misure in `em` con la base che
  arriva da fuori (19 sulla superficie 1920 del menu, 13 su quella 1280 del gioco), accento della zona.
- Si apre dal menu d'avvio (§4) e dalla pausa (§5). Il pannello «La voce» si toglie: le sue righe
  passano nella scheda Audio.

### 3.3 Generale

| Opzione | Valori | Note |
|---|---|---|
| **Comandi** | pulsanti e parole · solo pulsanti · solo parole | predefinito: pulsanti e parole |
| **Aggiornamenti** | cercali all'avvio · no | solo desktop. Si chiede a GitHub e non si manda niente; la portatile e il .deb non si aggiornano da soli, e lo si scrive |
| **Trofei** | azzera i trofei | con una conferma; i salvataggi non si toccano |

**Solo pulsanti.** La riga di comando sparisce (con «invio ↵»); resta tutto il resto: uscite, cose,
azioni, menu delle cose, «usa su…», risposte di dialogo, scorte e bisaccia che si toccano, parole in
maiuscolo che si toccano, ↶ annulla e Ctrl+Z, F2, F5, F9. Il fuoco va al primo pulsante invece che al campo.

**Solo parole.** L'avventura testuale pura: spariscono le file di pulsanti (uscite, qui, azioni), i menu
delle cose, il pannello delle dosi; le parole in maiuscolo restano evidenziate ma non si toccano; le
risposte di dialogo restano scritte e numerate, e si sceglie scrivendo il numero; scorte, bisaccia e
fiducia a lato restano come informazione, non si toccano. Restano i tasti dell'app (F2, F5, F9, Esc).
La **conferma delle scelte che costano** resta: è una rete di sicurezza, e si risponde con S e N come oggi.
«opzioni», «pausa» e «trofei» scritti aprono i pannelli (si fermano prima del motore: da verificare che il
motore non li usi già).

**I testi che parlano dei comandi** si adattano al modo: la guida «Come si gioca» (la scheda «Scrivi o
tocca») e il segnaposto della riga.

### 3.4 Video

| Opzione | Valori | Note |
|---|---|---|
| **Schermo** | schermo intero · finestra | anche F11, che aggiorna l'opzione. Predefinito: schermo intero; la scelta si ricorda (D1) |
| **Dimensione della finestra** | 1280×720 · 1600×900 · 1920×1080 · 2560×1440 · 3840×2160 | solo le misure che entrano nello schermo; vale in finestra; se si trascina il bordo, «personalizzata» |
| **Qualità della grafica** | automatica · alta · media · bassa | per i paesaggi della partita e per il trailer |
| **Alta accessibilità** | sì · no | un interruttore che accende un insieme (sotto) |

**Sulla «risoluzione».** Electron non cambia la modalità del monitor: lo schermo intero è sempre alla
risoluzione nativa (non c'è lo «schermo intero esclusivo» a 1280×720 dei giochi DirectX), e il gioco lì è
già nitido, perché l'interfaccia è vettoriale e scalata. La risoluzione diventa quindi due cose:

- la **dimensione della finestra**: la finestra si apre dove la si era lasciata; se quello schermo non c'è
  più, centrata su quello principale;
- la **qualità della grafica**, che è la «scala di rendering» dei giochi d'oggi. *Automatica* è il
  comportamento di oggi (il trailer scende da solo se il computer arranca); *alta* = densità fino a 2,
  tetto 2560 (3840 se la misura lo permette, come ora); *media* = 0,75; *bassa* = 0,5 e il panorama a
  densità 1. Serve ai PC lenti, dove il trailer non è mai stato provato.

Il **tastino dello schermo intero** sul palco della partita (`GameShell.tsx`) si toglie (D6).

**Alta accessibilità.** Un interruttore che accende cinque cose insieme; sotto, le cinque righe per
regolarle una per una (se se ne cambia una, l'interruttore dice «personalizzata»):

| Riga | Valori | Che cosa fa |
|---|---|---|
| Contrasto | normale · alto | testi pieni su fondi pieni, niente velature né sfocature dietro i pannelli, bordi netti; obiettivo WCAG AAA (7:1) sul testo del diario e dei pannelli |
| Testo | normale · grande | il diario e i pannelli più grandi (la prosa da 17 a circa 21 px sulla superficie 1280). La superficie resta 1280×720: la barra laterale si riordina ma non cresce quanto il diario |
| Carattere | Lora · Atkinson Hyperlegible | come nel Relitto. Licenza OFL, il pacchetto npm `@fontsource-variable/atkinson-hyperlegible-next` (da scaricare: lo chiedo prima) |
| Movimento | come il sistema · ridotto · pieno | ridotto: il viandante non cammina, il panorama sta fermo, niente pulsazioni né transizioni. **Loghi e trailer restano sempre** (D2): `Loghi.tsx` e `Trailer.tsx` smettono di guardare `prefers-reduced-motion` |
| Fuoco | normale · marcato | un contorno spesso e ben staccato su ciò che ha il fuoco della tastiera |

### 3.5 Audio

| Opzione | Valori | Che cosa tocca |
|---|---|---|
| **Volume generale** | 0–100 | tutto |
| **Musica** | 0–100 | il brano del trailer e del menu (`intro.mp3`) |
| **Voce** | 0–100 | il doppiaggio in partita ed Enzo nel trailer |
| **Effetti** | 0–100 | i loghi sonori, i rumori del trailer, il suono dei trofei |
| **Voce del gioco** | recitata · lettore di schermo | dal pannello «La voce», con «↻ riascolta» e la nota su F2 |
| **Suono** | stereo · mono | per chi sente da un orecchio solo |
| **Quando il gioco non è in primo piano** | continua · silenzia | silenzia se la finestra è ridotta a icona o perde il fuoco |

- **Un bus sonoro solo** (`app/src/lib/suono.ts`, nuovo): tiene i guadagni correnti, li dà a chi crea un
  `AudioContext` (`trailer/audio.ts`, `gioco/voce.ts`, `loghi/suono.ts`, i trofei) e li aggiorna dal vivo
  con `setTargetAtTime` (niente scatti). L'abbassamento della musica sotto la voce di Enzo (`VOCE_SOTTO`)
  resta relativo: si moltiplica per il volume della musica.
- I loghi suonano prima di ogni menu: leggono i volumi salvati. Il comportamento non cambia.
- **Mono:** l'uscita di ogni contesto si fonde in un canale (`destination.channelCount = 1`, modo esplicito).
- Il tasto «♪ audio sì/no» del menu sparisce: lo sostituiscono il volume generale e il menu riorganizzato.
  Nel browser la musica parte comunque solo dopo un gesto: è la regola del browser e resta.

## 4. Il menu d'avvio, riorganizzato

**Oggi** (`Trailer.tsx`, «schermata d'avvio»): sotto il titolo, la frase «Si parte a piedi. Da qui in poi
comandi tu…», una fila con Continua / Nuovo viaggio e una seconda fila di cinque pulsantini (come si
gioca, carica, rivedi il trailer, audio, esci). Si usa col mouse o con Tab.

**Il menu nuovo, sul modello del Relitto** (`menu/Menu.tsx` di là), in un componente suo
(`components/MenuAvvio.tsx`) che il trailer mostra sopra l'ultimo fotogramma:

- **«Si parte a piedi.»** come epigrafe sotto il titolo (D5); il resto della frase va nella guida.
- Una **colonna di voci** al centro:
  1. **Continua il viaggio** (sotto, piccolo: nome del salvataggio · luogo · tempo di gioco) — solo se
     c'è un salvataggio
  2. **Nuovo viaggio** (oppure **Inizia il viaggio**, se non c'è niente da continuare). Con un viaggio da
     continuare chiede conferma (D4): «Cominciare un viaggio nuovo? I tuoi salvataggi restano nel
     taccuino.» Sì (S) / No (N)
  3. **Carica un viaggio** — il taccuino (§6)
  4. **Trofei** — la collezione (§7)
  5. **Opzioni**
  6. **Come si gioca**
  7. **Rivedi il trailer**
  8. **Esci** — solo desktop
- **Tastiera:** ↑ ↓ (e Inizio, Fine) da una voce all'altra, Invio sceglie; il fuoco parte sulla prima voce,
  senza contorno finché non si usa la tastiera. Il mouse come sempre.
- **Aspetto:** le voci in Sora, la prima più grande e color ambra (`#f0b77e`); la voce sotto il mouse o col
  fuoco ha un filo ambra a sinistra e il testo pieno, le altre più tenui. Stesso fondo scuro radiale di
  oggi sotto la colonna, perché si leggano anche a 4K sul prato e sulla strada.
- **Piede:** la versione in basso a destra (come oggi); a sinistra, piccolo, «↑↓ scegli · Invio conferma».
- La parte per il telefono in verticale (`compatto`) resta com'è: non la si considera.

## 5. La pausa e la testata

- **Esc in partita**, nell'ordine: chiude il pannello o il menu aperto (come oggi); se la voce sta parlando,
  la zittisce soltanto; se la riga è vuota e non c'è niente di aperto, apre la **pausa** (in «solo
  pulsanti» la riga non c'è: Esc va alla pausa).
- **Voci della pausa:** Riprendi (Esc) · Salva · Carica · Trofei · Opzioni · Come si gioca · Torna al menu
  d'avvio · Esci dal gioco (solo desktop). Stesse frecce e stesso Invio del menu d'avvio.
- «Torna al menu» ed «Esci» fanno quello che fanno oggi «← intro» e «✕ esci»: prima l'automatico.
- Mentre la pausa è aperta il panorama si ferma e **il tempo di gioco non corre**.
- **La testata** diventa **«salva · carica · ☰ pausa (Esc)»** (D3): «salva» e «carica» aprono il taccuino;
  F5 e F9 restano i rapidi (§6).

## 6. Il taccuino, da app desktop

**Il disco resta quello di oggi**, che è già da desktop (`desktop/salvataggi.cjs`: scrittura atomica,
copia di riserva, coda per file). Cambia che cosa c'è sopra.

### 6.1 Che cosa si salva

- **Salvataggi liberi, con nome** (S1): nessun limite. Ognuno è un file
  `Documenti/Il Viaggiatore/Salvataggi/<id>.viaggiatore`, dove `id` nasce dall'istante (non dal nome:
  rinominare non sposta file). Il nome sta dentro il file.
- **Il rapido** (S2): `rapido.viaggiatore`. **F5** lo scrive subito e compare un breve cartiglio
  «Salvato · rapido»; **F9** lo ricarica, con la conferma se c'è strada non salvata; senza rapido, «Nessun
  salvataggio rapido».
- **Tre automatici a rotazione** (S4): `automatico-1/2/3.viaggiatore`; a ogni cambio di luogo (fuori dai
  dialoghi) si riscrive il più vecchio; all'uscita dal gioco e al ritorno al menu, uno in più nella stessa
  rotazione. Se uno si guasta, ci sono gli altri due (e le copie `.bak`).
- **Migrazione:** i file di oggi (`posto-1…6.viaggiatore`, `automatico.viaggiatore`) si leggono come
  salvataggi normali, col nome «Posto 1»… e «Automatico»; non si rinominano né si cancellano. Nel
  browser lo stesso, con le chiavi di `localStorage` (con un tetto, perché lo spazio del browser è poco).
- **Campi nuovi, tutti facoltativi** (un file vecchio si apre, e una versione vecchia del gioco apre un file
  nuovo ignorandoli): `nome`; `miniatura` (JPEG del panorama, circa 320×110, 10–20 KB, in base64);
  `tempoMs` (il tempo di gioco); `sfide` (§7.3). `formatoSalvataggi` resta 1.

### 6.2 Che cosa si vede

Un pannello a due colonne, sulla superficie della partita e su quella del menu:

- **a sinistra l'elenco**, dal più recente: in cima, solo in «Salva», **«+ Nuovo salvataggio»**; poi il
  rapido e gli automatici (segnati come tali), poi i salvataggi con nome. Ogni riga: miniatura piccola,
  nome, luogo, data. Si scorre con ↑ ↓, Inizio, Fine, PagSu, PagGiù;
- **a destra il dettaglio** del salvataggio scelto (S3): la **miniatura grande** (i salvataggi vecchi hanno
  un riquadro col colore della zona), il **nome**, **luogo · tappa N di 7 · turno**, la **data**, il **tempo
  di gioco**, **vita · sete · fame · acqua · cibo**, la versione del gioco se diversa;
- **le azioni** del salvataggio scelto: **Carica** (Invio) o **Sovrascrivi** (Invio, con conferma),
  **Rinomina**, **Esporta…**, **Elimina** (Canc, con conferma); gli automatici e il rapido non si
  rinominano;
- **«+ Nuovo salvataggio»** propone un nome dal luogo («Il pozzo di Saverio») che si cambia scrivendo;
  Invio salva;
- **in basso:** «apri un file…» (importa), «apri la cartella», e dove stanno i salvataggi (S5, come oggi);
- le **conferme** (sovrascrivi, elimina, carica perdendo strada) sono domande a parte con S e N, come quella
  delle scelte che costano, non righe che coprono la scheda.

### 6.3 Il tempo di gioco

Si conta in partita solo quando la finestra è in primo piano e la pausa è chiusa (`ViaggiatorePlayer`),
si somma a quello del salvataggio da cui si è ripreso, e si scrive in ogni salvataggio. I salvataggi di oggi
non lo hanno: mostrano «—».

## 7. I trofei

### 7.1 Come funzionano

- **Un deposito** (`app/src/lib/trofei.ts`): quali trofei hai, e quando li hai vinti. Sul desktop un file
  `Documenti/Il Viaggiatore/trofei.json` accanto ai salvataggi (stessa scrittura atomica e copia di
  riserva: un trofeo non si perde); nel browser `localStorage`.
- **Le regole** (`app/src/gioco/trofei.ts`, funzioni pure come `azioni.ts`): leggono lo stato che il ponte
  già espone (contatori, gesti, voci, il testo del finale) più gli **stati** della storia (`stato di
  Cosimo`, `stato del riconoscimento`, `stato di Peppe`, `stato del sapere di Peppe`…), che il ponte
  (`fav_stato` in `ponte.py`, codice dell'app, non del motore) esporrà in un campo `stati`. Si controllano
  dopo ogni turno.
- **Si vincono una volta sola** e restano, anche ricominciando o caricando. Contano da questa versione in
  poi: le partite di prima non hanno lasciato traccia.
- **L'avviso** (T3): in partita un piccolo cartiglio in alto («Trofeo · Il cavallo di legno»), che compare e
  svanisce in quattro secondi, con **un lievissimo suono flautato** (sintetizzato come i suoni dei loghi:
  una nota sola, morbida, col fiato; sul volume degli effetti). **Mai sopra il finale:** i trofei vinti con
  l'ultimo turno li mostra la schermata finale, sotto il testo, in un riquadro «i trofei di questo
  viaggio». Il lettore di schermo li sente dall'area che annuncia ciò che la voce non dice.

### 7.2 La pagina dei Trofei

Si apre dal menu d'avvio, dalla pausa e dalla schermata finale. In testa il conto («12 di 30») e una barra
sottile; sotto, le famiglie in gruppi, ognuna con i suoi medaglioni (un segno disegnato a linee, come le
icone di «Come si gioca», nell'accento della zona). Un trofeo vinto mostra nome, frase e data; uno non vinto
è più spento, col nome coperto e il suo **accenno** (T2). Si percorre con le frecce; Esc chiude.

### 7.3 La collezione — prima stesura, da rivedere con Simone

Nomi presi dalle parole della storia. L'accenno è ciò che si legge prima di vincerlo.

**I finali** (sei; si riconoscono dalla riga «FINALE —» del motore)

| Trofeo | Quando | Accenno |
|---|---|---|
| Qualcuno lo porti via | il finale con Peppe al cancello | Un finale: non da solo |
| Il cavallo di legno | il finale del giocattolo sulla croce piccola | Un finale: qualcosa da posare |
| Quello che era suo | il finale della fede di lei | Un finale: qualcosa da restituire |
| Le mani vuote | il finale senza niente di loro | Un finale: senza niente in mano |
| Sopra il corpo | il finale con Cosimo abbattuto | Un finale, al guado |
| Nessuno da chiamare | il finale con Cosimo abbattuto e Peppe fuggito | Un finale, al guado, dopo uno sparo |

**Le fini lungo la strada** (tre)

| Trofeo | Quando | Accenno |
|---|---|---|
| I sassi che scottano | la sete ti ferma | Lungo la strada |
| Senza la forza | la fame ti ferma | Lungo la strada |
| Il viaggio finisce qui | le ferite ti fermano | Lungo la strada |

**I gesti** (dieci; gli stessi «che cosa hai fatto a chi» della barra laterale)

| Trofeo | Quando | Accenno |
|---|---|---|
| Senza un grazie | Saverio ha avuto da mangiare | Qualcuno al pozzo |
| Qualcosa del tuo | hai lasciato qualcosa a Iole | Qualcuno alla diga |
| L'acqua della diga | il filtro legato alla pompa | Qualcosa alla diga |
| Il pedaggio | hai pagato il passaggio a Vito | Qualcuno al casello |
| La pistola scarica | il bluff a Vito | Qualcuno al casello |
| Contro la sbarra | Vito lasciato a terra | Qualcuno al casello |
| La brocca piena | l'acqua lasciata a Rosaria | Qualcuno in osteria |
| Un ricordo | hai mostrato a Onofrio qualcosa di tuo | Qualcuno sulle colline |
| Sulla discesa | Imma ha avuto da mangiare | Qualcuno sulla discesa |
| La febbre rotta | Pasquale curato con le tue medicine | Qualcuno nel vicolo |

**I modi di arrivare** (sei)

| Trofeo | Quando | Accenno |
|---|---|---|
| Mani pulite | un finale della storia senza sangue (nessuna voce del sangue) | Arrivare in un certo modo |
| La lettera | Cosimo riconosciuto con la lettera | Al guado, una via |
| Il fucile posato | Cosimo riconosciuto dopo aver posato il fucile | Al guado, un'altra via |
| La veglia | Cosimo riconosciuto con la veglia | Al guado, la via più lunga |
| La voce che ti precede | la voce della generosità ti ha preceduto | Quello che si dice di te |
| Detto il vero | a Peppe che chiede del sangue, la verità | Una domanda di Peppe |

**Le sfide** (tre; ciascuna su un finale della storia)

| Trofeo | Quando | Accenno |
|---|---|---|
| Senza voltarti | dall'inizio alla fine senza mai tornare indietro: né ANNULLA né un caricamento che riporta a un punto già passato | Una sfida |
| Tutto a parole | ogni comando della partita scritto | Una sfida |
| Tutto a pulsanti | ogni comando della partita dato coi pulsanti | Una sfida |

Le sfide si portano nei salvataggi (campo `sfide`: da dove vengono i comandi, se si è annullato, il punto più
lontano raggiunto da quella partita), così continuare un viaggio non le rompe e tornare indietro sì.

**La collezione** (due)

| Trofeo | Quando | Accenno |
|---|---|---|
| Tutte le strade | i sei finali della storia | Tutti i finali |
| Il viaggiatore | tutti gli altri trofei | Tutto |

Totale: **30**.

## 8. Il desktop

- **`desktop/impostazioni.cjs`** (nuovo): legge e scrive `impostazioni.json` nella cartella dei dati
  (`app.getPath("userData")`): `schermoIntero`, `larghezza`, `altezza`, `x`, `y`, `schermo`,
  `cercaAggiornamenti`. Valori sbagliati o finestra fuori da ogni schermo → quelli di base.
- **`main.cjs`**: la finestra nasce da lì (`fullscreen`, `width`, `height`, posizione); F11, il
  trascinamento e la chiusura aggiornano il file; `aggiornamenti.avvia` solo se `cercaAggiornamenti`.
- **`salvataggi.cjs`**: l'elenco legge tutti i `*.viaggiatore` della cartella (non sei nomi fissi); i nomi
  dei file nuovi si controllano (solo `id` generati dal gioco, `rapido`, `automatico-1/2/3`, e i vecchi);
  i trofei passano dallo stesso modulo (`trofei.json`).
- **Canali nuovi** in `preload.cjs` e `ipc.cjs` (`impostazioni:*`, `finestra:*`, `salvataggi:rinomina`,
  `trofei:*`), con il controllo del mittente che c'è già.
- L'**autoverifica** parte con i valori di base (non legge i file), salva e ricarica come oggi, e in più
  prova un salvataggio con nome, il rapido, la miniatura e un trofeo.

## 9. Come si verifica

- **`desktop/prove.cjs`**: `impostazioni.json` (valori rotti, finestra più grande dello schermo, schermo
  staccato); l'elenco libero dei salvataggi, la rotazione dei tre automatici, la rinomina, i nomi di file
  rifiutati, i file vecchi letti come salvataggi; `trofei.json` con la sua riserva.
- **`app/scripts/opzioni-node.mjs`** (nuovo, nel collaudo): i valori di base, la migrazione da
  «viaggiatore.voce», i valori fuori misura, l'interruttore dell'alta accessibilità.
- **`collaudo/trofei.py`** (nuovo): gioca i dodici percorsi e le tre morti col pilota di `finali.py`, fa
  decidere la logica vera dei trofei (`trofei.ts` in Node, come `azioni.ts`) e pretende per ogni partita i
  trofei previsti; ogni riga «FINALE —» dei `.fav` ha il suo trofeo; ogni gesto del ponte ha il suo; ogni
  trofeo (sfide comprese) è vinto da almeno una partita del collaudo; nessun trofeo vinto prima del suo
  momento.
- **`collaudo/salvataggi.py`**: anche i salvataggi coi campi nuovi si ricaricano con la stessa impronta;
  un file vecchio si apre; le sfide sopravvivono a «continua» e cadono tornando indietro.
- **`collaudo/pulsanti.py`** resta la prova di «solo pulsanti» (e vince «Tutto a pulsanti»); `finali.py`
  copre «solo parole».
- **Nel browser integrato**, per ogni modo dei comandi e con l'alta accessibilità: catture, contrasto
  misurato sui colori calcolati, un giro solo da tastiera (menu → opzioni → partita → pausa → taccuino →
  trofei → menu).
- **Nel desktop vero, con Simone all'ascolto:** i volumi a orecchio, mono, il silenzio in secondo piano,
  il suono dei trofei; finestra e schermo intero attraverso i riavvii; i salvataggi in Esplora risorse.
- **Partite intere** in ciascuno dei tre modi dei comandi, lette come un giocatore.
- Ogni fase: `finali.py`, `mirate.py`, `salvataggi.py`, `interfaccia.py`, `pulsanti.py`, `testo.py`,
  `doppiaggio.py`, `npm run build`, `prove.cjs`.

## 10. Le fasi

Una per volta, con il via libera di Simone alla fine; ognuna con versione MINOR, CHANGELOG, diario,
commit e push. Il rilascio pubblico, solo su ordine.

| Fase | Che cosa | Versione |
|---|---|---|
| 1 | Deposito delle opzioni, pannello con le schede, **Audio** completo (volumi veri, mono, secondo piano, la voce dentro) — ✅ eseguita; pannello largo e fisso a due colonne, fuoco senza riquadro (richieste di Simone a metà fase) | 1.24.0 |
| 2 | **Menu d'avvio** riorganizzato, **pausa** con Esc, testata «salva · carica · ☰ pausa», via il tastino dello schermo | 1.25.0 |
| 3 | **Taccuino da desktop**: salvataggi liberi con nome, rapidi F5/F9, tre automatici, miniatura, tempo di gioco | 1.26.0 |
| 4 | **Video**: schermo e finestra ricordati, dimensione, qualità grafica; `impostazioni.cjs`; aggiornamenti sì/no | 1.27.0 |
| 5 | **Comandi**: i tre modi; guida e testi adattati | 1.28.0 |
| 6 | **Alta accessibilità**: contrasto, testo, carattere (scaricamento da confermare), movimento (loghi e trailer restano), fuoco | 1.29.0 |
| 7 | **Trofei**: deposito, regole, cartiglio col suono, pagina, schermata finale, sfide nei salvataggi | 1.30.0 |
| 8 | Verifiche finali, partite intere nei tre modi, README, guide, pacchetti | 1.30.x |

## 11. Che cosa resta da decidere

- **I nomi e gli accenni dei trenta trofei** (§7.3): sono una prima stesura; si rivedono con Simone prima
  della fase 7.
- **Lo scaricamento** di Atkinson Hyperlegible (fase 6): lo chiedo con file, fonte e peso.
