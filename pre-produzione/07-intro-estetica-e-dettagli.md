# IL VIAGGIATORE — La cinematica d'apertura: estetica e dettagli

> Pre-produzione · Strato 7 · **v0.1, piano del 20/10/2026: non eseguito, da eseguire solo su ordine di Simone**
> Riguarda l'**aspetto** del trailer di 88,5 secondi che precede il gioco, non il suo comportamento.
> Il materiale su cui poggia (fotogrammi, ritagli a 4K, misure, gli strumenti di cattura) sta in
> `collaudo/esiti/piano-intro/` (cartella locale, non versionata: si rigenera con gli strumenti di §6).
> Ogni voce cita il file e la funzione da toccare, e il fotogramma che la prova.

---

## 0. In testa: perimetro, vincoli, obiettivo

**Perimetro (precisazione di Simone, 20/10/2026).** Si parla solo della *cinematica prima del
gioco*: il trailer di 88,5 s, con le sue dieci inquadrature e il titolo che lo chiude. **Non** dei loghi
d'apertura (Runtime Multimedia, FAVELLA 1) e **non** dell'avviso dell'autore: restano com'erano. La
schermata d'avvio che compare sopra l'ultima inquadratura vive nello stesso componente
(`components/Trailer.tsx`): ne tocco solo due finezze di leggibilità, in una fascia a parte (§4) che
Simone deve confermare.

**I vincoli, che il piano rispetta:**

- Si cura l'*aspetto* e i *dettagli*: resa grafica, tipografia, colore, luce, grana, movimento, sincronia
  fra suono e immagine, nitidezza a 1080p, 1440p e 4K, finezze del suono. **Non il comportamento**:
  niente clic per saltare, niente invito «salta», niente messaggi né memoria di «già visto», niente
  pulsanti nuovi, nessun cambio all'ordine loghi → avviso → trailer → menu. Il giocatore salta con Esc,
  come oggi.
- **Durata (88,5 s), ordine e tagli nominali delle inquadrature, parole dei testi, musica** (`intro.mp3`
  non si ricompone): invariati. Ciò che li toccherebbe sta nel §3, marcato «tocca il flusso · da
  chiedere a Simone» e tenuto separato.
- Solo desktop a schermo intero, alla massima risoluzione: nessun pensiero per telefono, touch, web.
- Il motore (`motore/`) non si tocca mai. Il rilascio pubblico solo su ordine di Simone (versione,
  commit, push e build a ogni evoluzione, come per ogni altro lavoro).

**Obiettivo.** Portare il trailer da «buono» a «curato fino al fotogramma»: togliere i difetti piccoli ma
visibili (fase 1), dare alla luce e alla pellicola la nobiltà che hanno le inquadrature migliori
(fase 2), rifinire il suono (fase 3), rifare la materia dove è debole (fase 4) e rendere nitido il
tutto anche a 4K (fase 5). Chi gioca non deve accorgersi d'altro che di «sembra fatto meglio».

---

## 1. Com'è oggi

### 1.1 La cinematica in una tabella

Tempi nominali dal foglio dei tempi (`video/il-viaggiatore-intro-tempi.md`, `trailer/scaletta.ts`). Nel
codice le dissolvenze si sovrappongono di qualche decimo di secondo (`SCENE`: per esempio l'invaso parte
a 24,8). Costo: mediana di un fotogramma in millisecondi, a 1920×1080 e a 2560×1440 (§6.3).

| # | Scena | Tempi | Durata | File | Com'è fatta | ms 1080p / 1440p |
|---|---|---|---|---|---|---|
| A | Le lettere | 0,0–9,6 | 9,6 s | `scene/lettere.ts`, `scritta.ts` | tavolo di noce, quattro lettere, busta, penna, biglietto; carta e inchiostro dipinti una volta; macchina che avanza 1,0→1,1; luce che si stringe sul biglietto | 3,9–4,3 / 5,9–9,0 |
| B | Il cammino (alba) | 9,6–17,6 | 8,0 s | `scene/alba.ts` | cielo, nuvole, quattro catene di monti, masserie, pali e fili, strada; viandante a 150 px con l'ombra lunga; raggi e pulviscolo | 4,9 / 8,7 |
| C | La Secca | 17,6–25,2 | 7,6 s | `scene/terra.ts` | suolo «cotto» in prospettiva, stivali e tanica in primo piano, polvere dei passi | 6,5–6,7 / 9,4–10,3 |
| D | L'invaso | 25,2–33,4 | 8,2 s | `scene/invaso.ts` | piana di sale, diga, torre, barca; dal giorno alla notte con Via Lattea e luna | 2,1–2,3 / 3,1–3,4 |
| E | La mappa | 33,4–49,0 | 15,6 s | `scene/mappa.ts` | carta con rilievo e curve di livello; la rotta si disegna in sette tappe, la macchina segue la penna | 1,7–2,3 / 2,4–3,1 |
| F | Cinque modi | 49,0–59,6 | 10,6 s | `scene/regole.ts` (fondale), `Trailer.tsx` (`CINQUE`) | cinque colonne con icona a tratto, nome, verbo, luogo | 1,6 / 2,4 |
| G | Il guado | 59,6–67,8 | 8,2 s | `scene/guado.ts` | controluce cremisi, la riva di Acquamorta, due sagome; macchina in avanti 1,0→1,12 | 5,0–5,3 / 8,6–9,3 |
| H | Le regole | 67,8–77,0 | 9,2 s | `scene/regole.ts` | cinque segni (spina, moneta, porta, vita, albero), uno ogni 1,84 s | 1,3–6,4 / 1,7–3,6 |
| I | I numeri | 77,0–81,8 | 4,8 s | `regole.ts → disegnaNumeri`, `Trailer.tsx` | sette · trentanove · quattordici · sei, sulla mappa quasi spenta | 1,4 / 2,2 |
| J | Il titolo | 81,4–88,5 | 7,1 s | `alba.ts` (variante `titolo`), `Trailer.tsx` | l'alba di nuovo; «IL VIAGGIATORE», sottotitolo, autore; il letterbox si apre | 5,8 / 8,8 |
| — | Pellicola | sempre | — | `Trailer.tsx` | grana (7,5 %), vignetta, letterbox 2,39:1; testi nel DOM, nitidi a ogni risoluzione | — |
| — | Suono | sempre | — | `trailer/audio.ts`, `assets/intro.mp3` | il brano è anche l'orologio del trailer; sopra, rumori sintetici (passi, carta, tasti, timbro, soffi) | — |

### 1.2 Come l'ho guardata

- Fotogrammi PNG a 1080p di 30 istanti canonici (due o tre per inquadratura), più 10 istanti di
  dissolvenza, e a 4K vero (3840×2160) di 7 istanti, con ritagli a 1:1. Per i colori e il banding:
  misure dei pixel e livelli stirati.
- Costo di un fotogramma con `__trailer.prova`, a tre densità, nei 17 istanti della memoria del progetto.
- Il brano: livello, accenti, effetto del compressore e latenza d'uscita, misurati su `intro.mp3` (§2,
  fase 3).
- **Non ho potuto guardare la riproduzione in tempo reale**: il pannello del browser integrato è
  «nascosto», l'orologio non gira. I giudizi su movimento e sincronia sono perciò da confermare in
  movimento e all'ascolto; le voci che dipendono da questo lo dicono.

### 1.3 Ciò che è già eccellente (da NON toccare)

- **La mappa**: la carta, la rotta a colori per zona, la penna che guida la macchina, le tappe.
- **Le cinque icone** a tratto con il loro alone, e il **colore per zona** che lega mappa, «cinque modi»
  e regole.
- **Il viandante** (`viandante.ts`): il passo vero, i piedi che non scivolano (`velocitaSuolo`), la luce
  di contorno.
- **Il suolo «cotto» della terra**: nessuno sfarfallio, costo basso.
- **La composizione** dell'alba e del guado: silhouette, bordo di luce, specchio d'acqua, il passaggio dal
  giorno alla notte dell'invaso.
- **La tipografia** (Lora, Sora, Source Code Pro) e le entrate «a maschera» dei testi.
- **La grana come *dithering***: provato con i livelli stirati sulla notte dell'invaso, sulle regole e
  sulle lettere, non c'è nessun banding nei gradienti scuri, perché la grana lo copre. Chi la cambia
  (voce 11) deve conservare questa proprietà.
- La **risoluzione adattiva** (1 → 0,75 → 0,5) e l'apertura del **letterbox** sul titolo.

### 1.4 Ciò che è debole (e dove lo tratta il piano)

| Difetto | Prova | Voce |
|---|---|---|
| Cucitura verticale nel cielo, che scorre con le nuvole | `ritagli/k4-alba-cielo.png` | 2 |
| Il tavolo resta fermo mentre la macchina avanza | `trailer-lettere-3_4` / `-8_3` | 3 |
| Nomi della mappa tagliati dai disegni | `trailer-mappa-47_8` | 4 |
| «rinunciare» tocca il filetto | `trailer-cinque-54_8` | 5 |
| Le parole chiave sono le meno leggibili | `trailer-alba-16_5`, `-guado-64_5` | 6 |
| Apostrofi dritti, «lt» che si toccano, numeri sbilanciati | `ritagli/tipo-scelte.png`, `trailer-numeri-81_2` | 7 |
| Il titolo arriva dopo il colpo | `trailer-titolo-82_8` | 8 |
| Aloni che virano al giallo limone | `ritagli/k4-titolo-sole.png` | 9 |
| Raggi con il bordo netto | `trailer-guado-61_5` | 10 |
| Grana da «televisore», diversa a ogni schermo | `ritagli/banding-*.png` | 11 |
| Notte dell'invaso piatta | `trailer-invaso-31` | 12 |
| Il compressore appiattisce il brano | misura offline | 13 |
| L'immagine anticipa il suono di ≈50 ms | misura `AudioContext` | 14 |
| Passi e rumori sempre uguali | `audio.ts → suona()` | 15 |
| Il sale sembra selciato | `ritagli/k4-invaso-suolo.png` | 16 |
| Le crepe sembrano un mosaico | `ritagli/k4-terra-stivale.png` | 17 |
| La scrittura è una dentatura; il biglietto è un carattere a macchina | `ritagli/k4-lettere-busta.png` | 18 |
| A 4K l'immagine è morbida accanto al testo tagliente | `ritagli/k4-*.png` | 19 |
| Dissolvenza terra → invaso: doppia esposizione fangosa | `trans-25.png` | T1 (§3) |

---

## 2. Le migliorie, già nell'ordine di lavoro

Costo: **S** poche ore, **M** una o due sessioni, **L** più sessioni. Tutte le voci di questo
paragrafo sono **estetica pura**: non toccano durata, ordine, tagli, testi né musica. (Dove una voce ha
una parte che li toccherebbe, quella parte sta nel §3.) Dopo ogni modifica a un `prepara*()` o allo stato
di una scena **si ricarica la pagina**: l'HMR non ricostruisce la cache delle tele.

### Fase 0 — Il banco (niente di visibile)

**1. Il banco di confronto e di misura.**
- *Che cosa e perché.* Senza un banco che dica «questo fotogramma è uguale a prima, salvo qui» ogni
  ritocco alla luce rischia di spostare qualcosa che era giusto. Gli strumenti usati per questo piano
  (`collaudo/esiti/piano-intro/strumenti/`: `cattura-tempi.cjs`, `cattura-tempi-det.cjs`,
  `determinista-preload.js`, `misura-trailer.cjs`) diventano strumenti del progetto. Il preload rende
  deterministici `Math.random`, la grana e le animazioni CSS: provato il 20/10 su 5,5 · 16,5 · 64,5 s,
  due catture dello stesso istante sono **identiche al bit** (PSNR infinito).
- *Dove.* Nuovi file in `strumenti/` e una riga ciascuno in `strumenti/LEGGIMI.md`. Nessuna modifica
  all'app.
- *Effetto.* Ogni voce si prova «prima/dopo» con una differenza numerica: ciò che non doveva cambiare
  resta identico.
- *Costo · rischio.* S · nullo.
- *Verifica.* PSNR infinito fra due catture; il primo atto è catturare l'insieme «prima» (§6.2) sul
  commit di partenza.

### Fase 1 — I difetti puntuali (piccoli, sicuri, visibili)

**2. La cucitura nelle nuvole.**
- *Che cosa e perché.* Nel cielo dell'alba e del titolo corre un gradino di luminosità verticale, alto
  quasi tutto il cielo, che scorre con le nuvole (a 16,5 s sta a x≈90: è il bordo della tessera di
  1920 px). Si vede soprattutto a 4K (`ritagli/k4-alba-cielo.png`), ma anche in `trailer-alba-16_5.png`,
  a sinistra.
- *Dove.* `trailer/pittura.ts → nuvole()`, nella funzione `dens`: la «torsione» legge `n(u·0,7, …)`, che
  non si ripete alla stessa distanza del resto, perciò ai bordi della tessera le due metà non combaciano
  (causa probabile, da confermare con la prova delle colonne). La stessa funzione dipinge i cirri e le
  nubi di notte dell'invaso e le nubi del guado: controllarle.
- *Effetto.* Cielo continuo, nessuna linea che attraversa l'inquadratura.
- *Costo · rischio.* S · basso.
- *Verifica.* Per ogni colonna del cielo, la differenza media con la colonna accanto: oggi c'è un picco
  alla cucitura, dopo non deve esserci. Fotogrammi 16,5 e 84,5 s a 4K.

**3. Il tavolo non segue la macchina.**
- *Che cosa e perché.* Nelle lettere la macchina avanza (zoom 1,0 → 1,1 in 9,6 s) ma il tavolo no:
  lettere, busta e penna ingrandiscono e scivolano sul legno fermo. Fra 3,4 s e 8,3 s le giunture delle
  assi restano a y = 272 · 542 · 812, mentre l'angolo della busta va da x = 153 a x = 90
  (`trailer-lettere-3_4.png`, `trailer-lettere-8_3.png`).
- *Dove.* `scene/lettere.ts → disegnaLettere`: `drawImage(a.tavolo…)` sta *prima* di `camera(…)`.
  Disegnare il tavolo dentro lo stesso movimento, ingrandito all'inizio di circa 1,12× perché i bordi
  restino coperti. La luce della lampada resta ferma (è fuori campo).
- *Effetto.* Lo sguardo «entra» nel tavolo invece di far scivolare gli oggetti.
- *Costo · rischio.* S · basso.
- *Verifica.* Le giunture si muovono quanto la busta (3,4 / 8,3 s); `prova` a 3 e 8 s entro ±0,3 ms.

**4. I nomi della mappa sotto i disegni.**
- *Che cosa e perché.* A fine rotta alcuni nomi si scontrano col disegno del luogo: le punte delle colline
  tagliano «Le colline» e il «06»; la casa e il cerchio tratteggiato attraversano «ACQUAMORTA» e «casa»;
  la sbarra tocca «La statale» (`trailer-mappa-47_8.png`, `trailer-mappa-41_5.png`).
- *Dove.* `scene/mappa.ts → disegnaMappa`: le etichette stanno a `n.y+64` (sotto) o `n.y−118` (sopra),
  mentre il segno acceso si disegna *dopo*, ancorato a `n.y+40`, e ci si sovrappone. Disegnare prima i
  segni e poi le etichette col loro velo; per ogni segno (`segno()`) un ingombro, alto e basso, da cui
  partono le etichette.
- *Effetto.* Ogni nome si legge senza linee dentro.
- *Costo · rischio.* S · basso.
- *Verifica.* Fotogrammi a 36,9 · 38,6 · 40,4 · 42,1 · 43,8 · 45,5 · 47,8 s: nessuna linea del segno
  dentro il rettangolo del testo (controllo a vista sui ritagli).

**5. «rinunciare» contro il filetto.**
- *Che cosa e perché.* Nei «cinque modi» il verbo più lungo, in corsivo a 62 px, è largo quanto la
  colonna e tocca il filetto a sinistra (x≈1462; `trailer-cinque-54_8.png`, `ritagli/tipo-rinunciare.png`).
- *Dove.* `components/Trailer.tsx`, colonne `CINQUE` (larghezza 300, spazio 26, verbi `serif(62)`):
  colonne da 330 con spazio 12, oppure verbi a 56 px.
- *Effetto.* Lo stesso respiro in tutte e cinque le colonne.
- *Costo · rischio.* S · basso.
- *Verifica.* Misura dei rettangoli dei cinque verbi: almeno 24 px liberi per lato, a 49,3–59 s.

**6. Le parole chiave si leggono appena.**
- *Che cosa e perché.* Le due parole su cui il trailer batte sono le meno leggibili: «A piedi.» (#f6b77c)
  sul cielo ambrato e «tuo fratello.» (#ffa0a0) sulle nuvole color pesca. Misura approssimata (colore
  del testo contro la media del fondo accanto alle lettere, prima dell'ombra): da 1,1:1 a 1,7:1 la
  prima, da 1,3:1 a 2:1 la seconda; il bianco della riga sopra è meglio ma non brillante (≈1,8:1 su un
  campione). Reggono grazie all'ombra, di poco (`trailer-alba-16_5.png`, `trailer-guado-64_5.png`).
- *Dove.* `Trailer.tsx → CUES` (`alba2`, `guado2`, e per coerenza `alba1`, `guado1`): un'ombra scura,
  tinta e più larga, e un tono appena più profondo del colore, senza cambiarne l'identità. Se non basta,
  un velo morbido locale nel canvas (`disegnaAlba`, `disegnaGuado`), come quello già usato dietro il
  titolo.
- *Effetto.* Le due parole chiave si leggono a colpo d'occhio anche su un monitor luminoso.
- *Costo · rischio.* S · basso.
- *Verifica.* La stessa misura prima/dopo sugli stessi fotogrammi; obiettivo ≥ 3:1 vicino ai caratteri
  (il minimo per un testo grande).

**7. Tipografia fine.**
- *Che cosa e perché.* Tre dettagli.
  **(a)** Nei testi a grande corpo l'apostrofo è dritto ('): «l'acqua ha svuotato», «L'invaso morto»,
  «l'ultima salita», «L'acqua è la moneta.», «Un'avventura testuale…», «l'osteria».
  **(b)** Sora a −0,02 em: a 76 px la «l» e la «t» di «scelte» si toccano (`ritagli/tipo-scelte.png`).
  **(c)** I numeri: le quattro colonne sono larghe uguali ma i numeri no, perciò gli spazi fra le cifre
  sono 175 · 127 · 171 px e «39 | 14» stanno quasi addosso al filetto (`trailer-numeri-81_2.png`).
- *Dove.* (a) `Trailer.tsx` (`CUES`, `CINQUE`) e `trailer/zone.ts` (`ZONE`, `REGOLE`, usate anche dal
  canvas della mappa): si passa a ’ tipografico. Cambia il segno, non le parole. (`collaudo/testo.py`
  custodisce solo il testo dell'avviso: questi testi non hanno un collaudo, e la verifica qui sotto fa le
  sue veci.) (b) `display()` in `Trailer.tsx`: −0,01 em, e un'occhiata alle
  legature. (c) `STATS` e `numeri`: larghezze a misura del contenuto, o cifra e nome centrati sul filetto.
- *Effetto.* Un trailer tipograficamente pulito.
- *Costo · rischio.* S · basso.
- *Verifica.* Le stringhe estratte dal DOM prima e dopo sono uguali, apostrofi a parte; fotogrammi a
  49,3–52,4 s e 77–81,6 s.

**8. Il titolo entra più secco, sul colpo.**
- *Che cosa e perché.* Nel brano i colpi gravi del titolo sono a 82,21 · 82,61 · 82,81 s (da +16 a
  +21 dB, misurati sull'inviluppo), ma a 82,8 s «IL VIAGGIATORE» è opaco solo al 56 % e sfocato
  (`trailer-titolo-82_8.png`): la scritta sembra arrivare dopo il colpo.
- *Dove.* `Trailer.tsx`, blocco «J · il titolo»: l'opacità sale in 0,9 s (82,3 → 83,2). Farla salire in
  circa 0,35 s (82,25 → 82,6) e lasciare a spaziatura e sfocatura i loro 2,3 s di assestamento. L'istante
  d'inizio (82,3) e la fine della scena non cambiano.
- *Effetto.* Il nome compare sul colpo, poi si assesta.
- *Costo · rischio.* S · basso.
- *Verifica.* Fotogrammi a 82,3 · 82,5 · 82,8 · 83,5 s; ascolto del colpo.

### Fase 2 — La luce e la pellicola (il vantaggio grande)

**9. Gli aloni che virano al giallo limone.**
- *Che cosa e perché.* Attorno al sole la tinta scivola dall'arancio del cielo (32–35°) al giallo limone
  (50–58°): quando si sommano molti aloni il rosso e il verde si saturano insieme e il blu non c'è.
  Misurato su `trailer-titolo-87.png` (≈ rgb 243·241·190, tinta 58°) e `trailer-alba-16_5.png` (50°); si
  vede nel ritaglio `ritagli/k4-titolo-sole.png`. Nella dissolvenza numeri → titolo, quando tutto è
  scuro, il bagliore a destra diventa verdastro (`trans-81_6.png`).
- *Dove.* `trailer/pittura.ts → alone()` è sempre usata con `globalCompositeOperation = "lighter"`
  (somma). L'alba ne impila sei più i raggi più il disco (`scene/alba.ts`, blocco «il sole»); la stessa
  abitudine è in terra, invaso, mappa, regole. Per i grandi aloni usare `screen` (o sommarli in un
  livello a parte e comporre poi con `screen`); la somma resta per le scintille piccole.
- *Effetto.* Un sole dorato, non limone; più profondità nelle zone chiare.
- *Costo · rischio.* M (una scena alla volta: prima alba e titolo) · medio, perché cambia l'aspetto di
  molte inquadrature e nessuna deve perdere la luce voluta.
- *Verifica.* Tinta media sugli stessi riquadri ≤ 42°; tavola affiancata dei 30 istanti; `prova` entro
  +0,5 ms.

**10. I raggi con il bordo netto.**
- *Che cosa e perché.* I raggi di luce dell'alba e del guado sono spicchi dal lato netto, come
  ritagliati (`trailer-guado-61_5.png`, a sinistra; `ritagli/k4-titolo-sole.png`), in contrasto con le
  nuvole morbide.
- *Dove.* `scene/alba.ts` (nove spicchi, un gradiente radiale ciascuno, a ogni fotogramma) e
  `scene/guado.ts` (otto). Dipingere una volta, nella cache, un livello di raggi dal bordo sfumato (più
  spicchi sovrapposti, oppure una sfocatura) e a ogni fotogramma copiarlo con l'opacità che «respira».
- *Effetto.* Raggi che sembrano luce nella polvere; e un costo minore (17 gradienti in meno a
  fotogramma: guadagno atteso 0,3–0,8 ms, da misurare).
- *Costo · rischio.* S/M · basso.
- *Verifica.* Ritagli a 4K prima/dopo; `prova` a 13 · 16 s e 61 · 66 s non deve salire.

**11. La grana da pellicola.**
- *Che cosa e perché.* Oggi è rumore bianco uniforme (tessera di 256 px, opacità 7,5 %, `overlay`) che
  cambia posizione a ogni fotogramma del monitor (60 volte al secondo o più) e ingrandisce con lo schermo:
  a 4K ogni grano è 2×2 pixel, a 1440p 1,33. È un fruscio da televisore che cambia aspetto con lo
  schermo, non una grana da pellicola.
- *Dove.* `Trailer.tsx → faiGrana()`, il div `graneRef` e la riga `backgroundPosition = …
  Math.random()` in `disegna()`. Tessera generata alla densità dello schermo (grano di 1–1,4 pixel veri
  a qualunque risoluzione), appena sfocata, con un filo di colore e più viva nei mezzitoni che nelle
  ombre e nelle luci (due livelli: `soft-light` e `overlay`); cambia a 24 fotogrammi al secondo,
  deterministicamente da `t` (niente `Math.random`: anche i video esportati escono uguali).
- *Effetto.* Una grana che sembra la stessa su ogni schermo e si muove con la cadenza del cinema.
- *Costo · rischio.* S/M · medio: è su ogni fotogramma, e oggi fa anche da *dithering* (§1.3).
- *Verifica.* Ritagli 1:1 a 1080p, 1440p e 4K: grano di grandezza uguale; test del banding con i livelli
  stirati su notte dell'invaso e regole (nessun gradino); `prova` entro ±0,3 ms; vederla in movimento.

**12. La notte dell'invaso.**
- *Che cosa e perché.* Quando cala la notte la diga diventa un poligono nero
  (`rgba(6,10,24, 0,05+0,93·notte)` sopra la texture), il sale una tinta unita, barca e alberi sagome
  piatte; resta un filo di luce sul ciglio (`trailer-invaso-31.png`). Il giorno ha cemento, colature,
  arcate: la notte non ha niente.
- *Dove.* `scene/invaso.ts → disegnaInvaso` (blocchi «la notte scurisce il sale», «la diga», «luce sul
  ciglio»). La luce della luna (la falce c'è già) come bordo freddo su ciglio, arcate e cima della
  torre; un velo di riflesso della luna e delle stelle sul sale, che sfuma con la distanza; lasciare il
  15–20 % della texture alla diga.
- *Effetto.* La notte ha forma e materia come il giorno, e resta notte.
- *Costo · rischio.* M · basso (oggi 2–3 ms a fotogramma: c'è margine).
- *Verifica.* 29 · 31 · 33 s; luminosità media della notte quasi invariata; `prova` a 29 e 31 s ≤ +1 ms.

### Fase 3 — Il suono (finezze; `intro.mp3` non si tocca)

**13. Il brano fuori dal compressore.**
- *Che cosa e perché.* Tutto il suono, brano compreso, passa per un compressore a impostazioni di
  fabbrica (soglia −24 dB, rapporto 12:1: nel codice non è configurato). Reso offline lo stesso brano con
  e senza compressore (20/10): i passaggi piano salgono di +2,3…+3,8 dB (secondi 0–1: +3,6; 9–10: +3,4…+3,6; 73–76: +2,3…+2,7; la coda 83–86: +3,1…+3,8) e i forti di +0,1…+1,2 (21 s: +0,1; 62–63 s, il
  guado: +0,8). La dinamica del brano (−14,1 LUFS, escursione 5,5 LU, picco −0,4 dBTP) si appiattisce di
  circa 3 dB e il «quasi silenzio» iniziale si alza.
- *Dove.* `trailer/audio.ts → costruisci()`: `master.connect(comp).connect(destination)`. Il brano va su un
  ramo suo, con solo un limitatore di sicurezza sui picchi; il compressore, con impostazioni scelte
  (circa −18 dB, 3:1), resta ai rumori sintetici. Il tasto audio e il livello generale (`master`) restano.
- *Effetto.* La musica suona com'è stata composta: più piano nel piano, più netta nei colpi.
- *Costo · rischio.* S · basso, ma **si approva all'ascolto**: cambia il livello percepito fino a 3 dB nei
  passaggi sommessi. `intro.mp3` non si tocca; cambia come lo si suona.
- *Verifica.* Resa offline prima/dopo con `ebur128` (§6.4); ascolto dei cinque passaggi (0–2 · 22–23 ·
  61–64 · 70–74 · 84–88 s); picco < −1 dBTP; sha256 di `intro.mp3` invariato.

**14. La latenza d'uscita.**
- *Che cosa e perché.* L'immagine legge il tempo dal brano (`brano.currentTime`), cioè dal punto in cui
  il file è *decodificato*, non da quello che *si sente*: qui la scheda audio aggiunge 10 ms (base) più
  40 ms (uscita), misurati il 20/10 (`baseLatency` 0,010 · `outputLatency` 0,040). L'immagine anticipa
  il suono di circa tre fotogrammi, su tutti i colpi.
- *Dove.* `trailer/audio.ts → orologio()`: sottrarre `ac.baseLatency + ac.outputLatency` (zero se non
  disponibili) al tempo che restituisce. Il resto della logica (salti oltre 0,5 s, «rivedi», Esc) resta.
- *Effetto.* Taglio a 17,6 s, colpi del guado, titolo a 82,2 s: immagine e suono insieme.
- *Costo · rischio.* S · basso (dove l'uscita è zero non cambia niente).
- *Verifica.* Registrare `orologio()` e `outputLatency` all'avvio; ascolto sul taglio a 17,6 s e sul
  titolo; nessuna regressione in «rivedi» e col salto con Esc.

**15. Passi e rumori con una materia.**
- *Che cosa e perché.* I rumori sintetici che stanno sopra il brano (passi, carta, tasti, timbro,
  soffi) sono sempre lo stesso identico suono a ogni ripetizione, tutti asciutti. I passi sono gli
  stessi su asfalto (alba, titolo), fango screpolato (terra, a volume pieno), sale (invaso), greto di
  sassi (guado).
- *Dove.* `trailer/audio.ts → suona()` (casi `passo`, `carta`, `tasto`, …) e `trailer/scaletta.ts →
  CAMMINATE`, dove si aggiunge un campo `terreno` (è solo un dato: nessun tempo cambia). Piccole
  variazioni per ogni passo, casuali ma ripetibili (altezza, filtro, volume ±2 dB, alternanza fra
  sinistra e destra); un timbro per terreno (asfalto secco, crosta che scricchiola, sale che si
  schiaccia, sassi che rotolano); una «stanza» brevissima per i rumori.
- *Effetto.* Il cammino ha materia, la ripetizione meccanica sparisce.
- *Costo · rischio.* M · basso.
- *Verifica.* La lista `EVENTI` (tempi e tipi) identica prima e dopo (confronto in Node); ascolto a
  10–17 · 18–25 · 26–32 · 60–64 · 84–88 s; il brano resta in primo piano.

### Fase 4 — La materia (ridipinture mirate; qui c'è anche gusto, si decide con prove A/B)

**16. La piana di sale.**
- *Che cosa e perché.* Il sale dell'invaso sembra un selciato: placche quasi rettangolari in file
  regolari (spostamento dei punti 0,30), grigie, senza creste né variazioni; verso l'orizzonte i pixel
  diventano puntini che sfarfallano (`ritagli/k4-invaso-suolo.png`, `trailer-invaso-28_5.png`). La
  crosta di una salina secca è poligonale e irregolare, con bordi rialzati e chiazze più chiare e più
  scure.
- *Dove.* `scene/invaso.ts → pianaTela()`: `voronoiTessera(9, 56, …, 0.30)`. Spostamento a 0,85–0,9,
  come nel fango; placche più larghe; creste di pressione sottili e luminose; macchie di umidità; le
  righe lontane filtrate come fa `cuociSuolo` nella terra, per togliere il frastaglio.
- *Effetto.* «Lastre di sale» riconoscibili, orizzonte pulito.
- *Costo · rischio.* M · medio (gusto): prova A/B su tre fotogrammi.
- *Verifica.* 28,5 e 31 s a 1080p e 4K; `prova` a 29 e 31 s ≤ +1 ms; preparazione `invaso` (1,3–1,6 s
  oggi) ≤ 2,2 s.

**17. Le crepe della terra.**
- *Che cosa e perché.* Il fango è un mosaico di piastre simili: fessure di larghezza quasi costante,
  stesso rilievo su ogni bordo, colori affini; da lontano si legge «lastricato», non «terra cotta dal
  sole» (`trailer-terra-19.png`, `ritagli/k4-terra-stivale.png`).
- *Dove.* `scene/terra.ts → fangoTela()` (`voronoiTessera(3, 118, …, 0.92)`): fessure di larghezza
  variabile (più larghe e scure dove le piastre si sollevano), qualche piastra incurvata, polvere chiara
  nelle fessure, crepe secondarie sottili dentro le piastre, variazione di tono per zone. Il suolo resta
  «cotto» (si cuoce una volta): nessun costo per fotogramma.
- *Effetto.* Una terra più arida e materica.
- *Costo · rischio.* M · medio (gusto): prova A/B.
- *Verifica.* 19 · 21,5 · 24 s; `prova` a 20 e 24 s entro ±0,3 ms; preparazione `terra` (1,0–1,1 s) ≤
  1,6 s; i piedi non scivolano (la velocità del suolo, `velocitaSuolo`, non cambia).

**18. La mano che scrive.**
- *Che cosa e perché.* La scrittura delle lettere è fatta di cinque gesti ripetuti (gobba, pancia, asta,
  coda, trattino): da vicino, a 4K, diventa una dentatura regolare, senza pressione né deriva della riga.
  Il punto più grande è l'indirizzo sulla busta (`ritagli/k4-lettere-busta.png`). «Caro mio,» e le date
  sono in Lora a stampa, accanto allo scarabocchio. Il biglietto, l'oggetto più importante
  dell'inizio, «NON È IL CASO DI TORNARE.», è in Sora 800 con un po' di rotazione per lettera: stampatello
  *a macchina*, non a mano (`trailer-lettere-8_3.png`).
- *Dove.* `trailer/scritta.ts → scriviRiga()`, `scriviLettera()`; `scene/lettere.ts` (busta;
  `disegnaLettere`, dove le righe compaiono con un taglio netto; il blocco del biglietto, che usa
  `fillText`).
- *Come.* (A, senza file nuovi) lettere formate da tratti con pressione e inclinazione variabili,
  deriva della riga, inchiostro che ristagna a fine tratto; lo stampatello del biglietto disegnato a
  tratti (le lettere distinte sono dodici: N O E I L C A S D T R più il punto) con tremolio e pressione di
  matita o pennarello; la scrittura che si rivela con una punta e un bordo bagnato invece del taglio
  netto. (B, da chiedere: un carattere corsivo a mano libera con licenza OFL, 30–60 kB, da scaricare e
  aggiungere a `public/fonts`, come gli altri.)
- *Effetto.* Oggetti che sembrano scritti da una persona; il biglietto soprattutto.
- *Costo · rischio.* L (A) · medio: la preparazione `lettere` (1,4–1,6 s oggi) ≤ 2,5 s; i tempi di
  comparsa del biglietto e delle sue lettere (`BIGLIETTO`: 6,7 · 7,25 · 0,042 s a carattere) non cambiano.
- *Verifica.* Ritagli 4K di busta, lettera e biglietto prima/dopo; `prova` a 3 e 8 s entro ±0,5 ms;
  `EVENTI` dei tasti identica.

### Fase 5 — La nitidezza a 4K (l'incerta: costa)

**19. Tele più nitide e risoluzione che sale.**
- *Che cosa e perché.* La tela del trailer è al massimo 2560×1440: su uno schermo 4K il browser la
  ingrandisce di 1,5×, mentre i testi (DOM) restano nitidissimi. L'immagine è morbida accanto a una
  scrittura tagliente (`ritagli/k4-terra-stivale.png`, `ritagli/k4-guado-figura.png`); nel primo piano
  della terra i pantaloni mostrano anche un bordo a gradini che a 1080p non si vede. Molte tele
  precalcolate sono a 1× o meno: il tavolo è 960×540 mostrato a 1920×1080 (2×); le nuvole 960 px su
  1920; piana, asfalto, campo e sagome 1920 px.
- *Dove.* `Trailer.tsx → adatta()` (`bw = min(…, 2560)`, `qualita`); `scene/lettere.ts → tavoloTela`
  (w = 960, h = 540); `scene/alba.ts` (asfalto, campo, sagome); `scene/invaso.ts → pianaTela`;
  `trailer/viandante.ts` (il bordo a gradini: da cercare).
- *Come, in due passi indipendenti.* **(a)** Raddoppiare la risoluzione delle tele statiche dove costa
  poco (tavolo, piana, campo, asfalto, sagome): più memoria e più preparazione, nessun costo per
  fotogramma. **(b)** *Solo dopo* (a) e dopo i risparmi della fase 2: far salire la tela oltre 2560
  (3200 o 3840) quando i fotogrammi avanzano tempo; oggi la risoluzione scende, ma non risale.
- *Costi noti.* Le scene più pesanti (terra, guado, titolo, tavolo) stanno oggi a 8,6–10,3 ms di
  mediana a 2560. A 3840 i pixel sono 2,25 volte: stima ≈20 ms, non accettabile come impostazione
  predefinita su questa scheda. Perciò (b) viene dopo la misura e può restare «solo dove c'è margine».
  La preparazione delle tele è oggi di 5,4–6,2 s; con le tele raddoppiate ≤ 8 s (finisce comunque entro
  i 12,4 s dei loghi).
- *Costo · rischio.* L · medio-alto (prestazioni e memoria). È l'ultima fase tecnica e si può fermare
  dopo (a).
- *Verifica.* Ritagli 4K prima/dopo; `prova` a 2560 e a 3840 sui 17 istanti; una prova con la scheda
  grafica spenta (§6.3) per vedere che la risoluzione adattiva scatta ancora; tempo di preparazione.

---

## 3. Le voci che toccano il flusso — da chiedere a Simone (separate dal resto)

Nessuna di queste si fa senza una risposta. Toccano le finestre o i tempi di `scaletta.ts` e dei
testi, non la durata complessiva né i tagli nominali.

**T1. La dissolvenza fra la terra e l'invaso.**
- *Che cosa.* Non è un incrocio, è una doppia esposizione che passa per il buio: a 24,0 s la luminosità
  media è 161, a 25,0 s è 85, a 28,5 s è 148 (un buco di circa il 45 %), e il fotogramma è un grigio fangoso con
  una gamba enorme sopra la barca (`trans-25.png`). Perché: `Trailer.tsx → disegna()` compone ogni scena
  con la propria opacità sopra il nero, e le finestre di `SCENE` si sovrappongono per 0,4 s mentre le
  dissolvenze durano 0,9: nessuna delle due è mai opaca. Lo stesso meccanismo agisce, quasi senza
  vedersi, a 33,0 s (invaso → mappa, entrambe scure), 48,9 s e 81,6 s.
- *Come.* Un incrocio vero, centrato sul taglio nominale: la scena che esce resta piena finché l'altra non
  ha finito di entrare. Per terra → invaso: terra piena fino a 25,6 s e invaso da 24,8 a 25,6 s (0,8 s, il
  taglio nominale a 25,2 è al centro). Alternativa B: un velo di polvere o di luce calda che unisce le due.
- *Perché è «da chiedere».* Tocca le finestre `da/a/entra/esce` di `scaletta.ts`.
- *Costo · rischio.* S/M · basso-medio.
- *Verifica.* Luminosità media lungo la dissolvenza senza buco (almeno l'80 % della minore delle due);
  fotogrammi a 24,8–25,6 s ogni 0,1 s.

**T2. «tuo fratello» e il colpo grave.**
- *Che cosa.* Nel brano i colpi gravi del guado sono a 62,0 · 62,3 · 62,6 s (la salita) e a 63,99 s
  (+18 dB). La parola «tuo fratello.» entra a 63,7 s e il viandante finisce di fermarsi a 64,2 s (rallenta
  da 63,4). Il foglio dei tempi dice «a 63,7 un colpo grave»: la mia misura, solo d'inviluppo, dà 63,99.
  **Prima si conferma all'ascolto**, poi si tocca.
- *Come, se confermato.* Spostare di 0,3 s `CUES.guado2` (`da` 63,7 → 64,0) e far finire l'arresto a 64,0
  (`scene/guado.ts`, `ferma`: `seg(l, 3.6, 4.4)`), con `CAMMINATE[3].a` da 64,2 a 64,0 (i passi sonori).
- *Perché è «da chiedere».* Sposta di 0,3 s un testo e la fine del cammino.

**T3. Il biglietto resta intero per 0,4 secondi.**
- *Che cosa.* La scrittura di «NON È IL CASO DI TORNARE.» finisce a ≈8,5 s (7,25 + 27·0,042 + 0,12) e la
  scena comincia a sfumare a 8,9 s: la frase più importante dell'inizio si legge intera per 0,4 s.
- *Come.* (a) La scena delle lettere sfuma in 0,45 s invece di 0,7 (0,65 s di lettura); oppure (b) si
  scrive un po' più in fretta (0,034 s a carattere: finisce a 8,25 s).
- *Perché è «da chiedere».* Tocca `SCENE[lettere].esce` o `BIGLIETTO.perCarattere` (e con esso i tempi
  dei tasti in `EVENTI`).

**T4. Gli stacchi delle cinque regole e il basso del brano.**
- *Che cosa.* Gli stacchi sono ogni 1,84 s (67,8 · 69,64 · 71,48 · 73,32 · 75,16). Fra i colpi
  gravi più forti del brano (misura d'inviluppo, sotto i 120 Hz): 67,82 (a posto), 69,79 (0,15 s dopo),
  nessuno vicino a 71,48, 73,35 (a posto), nessuno vicino a 75,16; più il grande colpo a 76,97 s (a
  posto: i numeri partono a 77,0).
- *Come.* Se all'ascolto il difetto si sente, stacchi non regolari (tocca `REGOLA_DUR`: la struttura);
  altrimenti si lascia com'è. Probabile che il brano sia composto a fasi e non a colpi: priorità bassa.

---

## 4. Fascia di confine: la schermata d'avvio (da confermare se rientra)

Compare dopo 88,5 s sopra l'ultima inquadratura (`Trailer.tsx`, sezione `finito`). È interfaccia, non
cinematica: se Simone la vuole fuori, queste due voci cadono. Nessuna cambia il comportamento né il
numero dei pulsanti.

**C1. Il paragrafo «Da qui in poi comandi tu…».** A 27 px e opacità 0,72 passa sopra pali e fili del fondo:
le righe incrociano le linee (`menu-avvio.png`). Velo più alto e più largo, testo a 0,86, ombra tinta.
S · basso.

**C2. I pulsanti secondari.** «? come si gioca», «carica», «rivedi il trailer», «audio»: 15 px mono, bordo
a 0,18, sul buio del prato; per uno schermo intero a 4K sono piccoli e tenui. Più corpo (17–18 px) e più
contrasto. S · basso.

---

## 5. Ordine di lavoro e approvazioni

| Fase | Voci | Che cosa si mostra a Simone per approvare | Chiusura |
|---|---|---|---|
| 0 | 1 | Niente di visibile: la prova che due catture sono identiche e la tabella delle misure di partenza | commit degli strumenti |
| 1 | 2–8 | Sette coppie «prima e dopo» affiancate, ognuna con la sua cifra (colonne, giunture, contrasto…) | versione + commit + push + build |
| 2 | 9–12 | Sei inquadrature affiancate (alba 16,5 · titolo 87 · guado 61,5 · invaso 31 e due con grana) a 1080p, un ritaglio a 4K, 10 secondi di video per la grana in movimento | idem |
| 3 | 13–15 | Ascolto: file A/B (resa offline) dei cinque passaggi, poi ascolto nell'app desktop | idem |
| 4 | 16–18 | Per ogni voce la prova A/B su tre fotogrammi; per la scrittura, ritagli a 4K | idem |
| 5 | 19 | Ritagli a 4K prima/dopo, tabella dei costi, esito della prova a scheda spenta | idem |
| 6 | T1–T4, C1–C2 | Solo se Simone ha risposto alle domande del §7; fotogrammi e ascolto | idem |

- **Una fase, un commit** (con i soli file toccati, per nome), una voce di diario, e il numero di versione
  secondo `sviluppo/VERSIONI.md` §2: una fase che corregge sarà *patch*, una che ridipinge come il
  «trailer ridipinto» del 1.2.0 sarà *minor*; in dubbio il più alto.
- Alla fine, rigirare i due MP4 in `video/` con `strumenti/esporta-trailer.cjs` (non versionati) e
  aggiornare il foglio dei tempi solo se cambiasse un tempo (non deve).
- **Se una fase non passa le soglie del §6, si ferma lì**: le fasi successive non dipendono dalle
  precedenti, tranne la 5(b), che dipende da 5(a) e dai risparmi della 2.

---

## 6. Protocollo di verifica comune

### 6.1 Il banco
- Server di sviluppo: `node app/scripts/avvia-dev.mjs 5200`. Catture e misure si fanno con **Electron
  fuori schermo** (`desktop/node_modules/.bin/electron …`), non col pannello del browser integrato: da
  nascosto l'orologio non gira, e le misure si schiacciano sul ritmo dello schermo (16,7 / 33,3 ms:
  verificato il 20/10).
- Il preload deterministico (voce 1) fissa `Math.random`, nasconde la grana e ferma le animazioni CSS: due
  catture dello stesso istante sono uguali al bit. La grana si giudica a parte, a occhio (voce 11).

### 6.2 Prima e dopo
- **Insieme canonico** (a 1080p, e a 4K per i 7 contrassegnati ★): lettere 3,4 · 5,5★ · 8,3; alba 11,0 ·
  13,5 · 16,5★; terra 19,0 · 21,5★ · 24,0; invaso 28,5★ · 31,0 · 33,0; mappa 34,5 · 41,5 · 47,8; cinque
  51,0 · 54,8 · 57,5; guado 61,5 · 64,5★ · 66,8; regole 68,8 · 72,0 · 75,8; numeri 79,6 · 81,2; titolo
  82,8 · 84,5 · 87,0★; menu (88,5★); più le dissolvenze 9,3 · 17,5 · 17,8 · 24,9 · 25,0 · 25,1 · 48,9 ·
  59,4 · 81,6 · 81,7.
- Le catture «prima» si fanno sul commit di partenza, in `collaudo/esiti/prima/`; quelle «dopo» in
  `…/dopo-fase-N/`. Confronto: tavola affiancata (ffmpeg) e `psnr`: **ciò che cambia fuori dalle zone
  attese è un difetto**.

### 6.3 Costi
Misura di partenza (20/10/2026): mediana in ms di un fotogramma con `window.__trailer.prova(t, 40)`,
RTX 2070, finestra Electron fuori schermo. «4K» = finestra 3840×2160, tela a 2560 (il tetto di oggi).
Mai `getImageData` (Chrome passa al disegno su CPU e i numeri esplodono).

| t (s) | 1920×1080 | 2560×1440 | 4K (tela 2560) |
|---|---|---|---|
| 3 | 3,9 | 5,9 | 5,2 |
| 8 | 4,3 | 9,0 | 7,4 |
| 13 | 4,9 | 8,7 | 8,5 |
| 20 | 6,7 | 10,3 | 8,8 |
| 24 | 6,5 | 9,4 | 8,7 |
| 29 | 2,3 | 3,4 | 3,7 |
| 31 | 2,1 | 3,1 | 3,2 |
| 38 | 1,7 | 2,4 | 2,7 |
| 47 | 2,3 | 3,1 | 3,7 |
| 55 | 1,6 | 2,4 | 2,5 |
| 61 | 5,0 | 9,3 | 9,0 |
| 66 | 5,3 | 8,6 | 8,6 |
| 71 | 6,4 | 3,6 | 3,3 |
| 73 | 2,1 | 3,4 | 3,1 |
| 75 | 1,3 | 1,7 | 1,7 |
| 77 | 1,4 | 2,2 | 2,0 |
| 86 | 5,8 | 8,8 | 8,8 |

Le cifre variano di qualche decimo da una prova all'altra (a 71 s: 6,4 e 3,6). A 4K il p95 di guado e
titolo è già oltre i 16,7 ms in finestra fuori schermo (31–45 ms): **va rimisurato nell'app desktop vera**
prima della fase 5.

**Soglie.** Per ogni scena: mediana ≤ la misura di partenza + 1,5 ms; a 2560 ≤ 12 ms su questa
macchina; nessun p95 che passi da sotto a sopra i 16,7 ms; preparazione delle tele (oggi 5,4–6,2 s in
sviluppo: lettere 1,4–1,6 · alba 1,0 · terra 1,0–1,1 · invaso 1,3–1,6 · mappa 0,2–0,3 · guado 0,5–0,6)
≤ 8 s. Una prova con la scheda grafica spenta (`--disable-gpu`) deve mostrare che la risoluzione
adattiva scatta ancora; il trailer non è mai stato provato su un computer davvero lento (resta tale: lo
dice `sviluppo/PROSSIMI-PASSI.md`).

### 6.4 Suono
Resa offline (`OfflineAudioContext`) del brano e del rumorismo con la catena prima/dopo; livello e
picchi con `ffmpeg … ebur128=peak=true`; ascolto A/B nell'app desktop (la catena vera). Il brano di
partenza: −14,1 LUFS, escursione 5,5 LU, picco −0,4 dBTP.

### 6.5 Ciò che non deve cambiare mai
- `DURATA` (88,5) e i tagli nominali (9,6 · 17,6 · 25,2 · 33,4 · 49,0 · 59,6 · 67,8 · 77,0 · 81,4); le
  parole dei `CUES` e i loro tempi (fuori dal §3); la lista `EVENTI` (tempi e tipi); `intro.mp3`:
  sha256 `6081499c921a35f0339c120245526b8c9fb4d01d8010a0c679fb40ffa8e552a3`.
- L'ordine loghi → avviso → trailer → menu; il testo dell'avviso (`python collaudo/testo.py` verde); Esc
  come unico modo di saltare il trailer; i pulsanti della schermata d'avvio: quelli di oggi, non uno di
  più («Inizia il viaggio», o «Continua il viaggio» più «Nuovo viaggio»; «? come si gioca»; «carica»;
  «rivedi il trailer»; «audio»; «esci» nel desktop).
- `git diff --stat` tocca solo `app/src/trailer/**`, `app/src/components/Trailer.tsx` (e `index.css`, se
  serve), `strumenti/`, `sviluppo/`, `pre-produzione/`. **Mai** `motore/`, `prototipo/`, `app/src/loghi/`,
  `Loghi.tsx`, `Avviso.tsx`.
- Formato e impronta dei salvataggi: invariati (a fine fase `python collaudo/salvataggi.py` e
  `finali.py`: non c'entrano col trailer, ma costano un minuto).

### 6.6 A fine di ogni fase
`npm run build` in `app/` (compila con `tsc`); `python collaudo/testo.py`; l'autoverifica
(`/?autoverifica` nel browser, o `Il Viaggiatore.exe --autoverifica` sull'exe); alla fine dell'ultima
fase, gli undici collaudi. «Riduci movimento»: emulare la preferenza (DevTools
`Emulation.setEmulatedMedia`, da provare) e controllare che il fotogramma finale sia quello di
`menu-avvio.png`, senza stati a metà. Dopo aver cambiato un `prepara*()`: ricaricare la pagina.

---

## 7. Domande aperte per Simone

1. **Perimetro.** La schermata d'avvio (il testo «Si parte a piedi…» e i pulsanti) rientra o resta
   com'è? (C1, C2)
2. **Dissolvenze** (T1). Posso ritoccare le finestre di sovrapposizione in `scaletta.ts` lasciando fermi i
   tagli nominali? A: incrocio vero; B: un velo di polvere o di luce fra terra e invaso.
3. **«tuo fratello»** (T2). Se l'ascolto conferma il colpo a 63,99 s, allineo testo e arresto (0,3 s)?
4. **Il biglietto** (T3). Più tempo per leggerlo: A, la scena sfuma prima (0,45 s); B, si scrive più in
   fretta; o lasciare com'è?
5. **La calligrafia** (18). A: procedurale, nessun file nuovo; B: un carattere corsivo a mano libera con
   licenza OFL (si scarica un file da 30–60 kB).
6. **Gusto su sale e crepe** (16, 17). Ridipingo o lascio? Decido con le prove A/B.
7. **4K** (19). Mi fermo alle tele più nitide (a), o anche alla tela più grande dove c'è margine (b)?
   Che cosa pesa di più: la nitidezza o il margine per i computer lenti?
8. **La grana** (11). Da «televisore» a pellicola: grano fine, 24 fotogrammi al secondo?
9. **Il suono** (13). Tolgo il compressore al brano (più dinamica; fino a 3 dB più piano nei passaggi
   sommessi)?
10. **Versioni e video.** Una versione per fase (patch o minor), e rigirare alla fine i due MP4 in
    `video/`?

---

## 8. Cosa NON si farà

- **Nessun comportamento nuovo**: niente clic per saltare, niente invito «salta», niente «già visto»,
  niente pulsanti nuovi, nessun cambio all'ordine delle fasi d'apertura. Esc resta l'unico modo.
- **Nessuna musica nuova o ricomposta**, né voci o doppiaggio. `intro.mp3` resta com'è.
- **Nessun cambio di durata** (88,5 s), di ordine o di tagli nominali; testi uguali parola per parola
  (cambiano solo i segni tipografici, voce 7). Loghi e avviso non si toccano, né le forme dei marchi.
- **Niente immagini incorporate né video**: il trailer resta tutto procedurale (l'unica eccezione, se
  Simone la approva, è un file di carattere a mano libera, voce 18-B).
- **Niente riscrittura del disegno in WebGL**: risolverebbe il 4K, ma è un altro progetto. Valutato e
  scartato.
- **Non si tocca il meglio**: il viandante (passo e appoggi), la mappa, le icone dei cinque modi, il
  colore per zona, il suolo cotto.
- Niente telefono, touch, web. Niente rilascio. Niente `motore/`, `prototipo/`, salvataggi.
- **Segnalato, non pianificato**: il foglio dei tempi (`video/il-viaggiatore-intro-tempi.md`) dice «13
  personaggi» e il trailer «14» (`STATS`): 14 = 13 più il cane della serra; è un testo, lo decide
  l'autore. I loghi e l'avviso non sono stati esaminati per questo piano.

---

### Stato
Piano scritto il 20/10/2026 a partire da un esame delle scene a 1080p e a 4K, di misure di costo e di
un'analisi del brano. **Nulla è stato eseguito**; ogni fase parte solo su ordine di Simone, con la sua
approvazione alla fine di ciascuna.
