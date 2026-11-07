---
data: 2026-11-07
ora: "18:47"
titolo: "Il metodo del Relitto per il bilanciamento"
tipo: sessione
versione: 1.42.0
---

# Il metodo del Relitto per il bilanciamento

## In breve
Il metodo di bilanciamento di *Il Relitto Silente* (partite da principiante verosimili, non tre percorsi da esperto) è ora anche
qui, con gli strumenti e una regola misurabile; ha mostrato perché Michela moriva prima del lago, e Simone ha deciso tre
ritocchi di numeri, applicati nella 1.42.0 (non rilasciata).

## Contesto
Simone: «Su Il Relitto tra ieri e oggi abbiamo trovato un metodo quanto più equilibrato e accurato possibile, sulla base che non
abbiamo dei veri betatester, per bilanciare la difficoltà degli elementi che si consumano ed impediscono di completare il gioco.
Il gioco deve restare una sfida ma non può essere implacabile ingiustamente. […] Michela ha detto che lei all'inizio, essendo
inesperta, si perde un pochino e alla fine muore che non è arrivata nemmeno al lago.» Il lavoro è arrivato come sessione laterale
di un'altra sessione. Il repository del Relitto (`Documents\SVILUPPO\VIDEOGIOCHI\Il Relitto`) si è soltanto letto.

## Lavoro fatto
- **Studiato il metodo del Relitto** (documento 33, §12, «La taratura dell'aria», 5 novembre 2026; `collaudo/aria.py`,
  `collaudo/verosimili.py`, le tre partite `principiante-*.txt`, la memoria «bilanciamento verosimile»): partite d'intenzione
  scritte a mano, una reazione da principiante nello strumento, centinaia di partite per carattere con probabilità a tavolino,
  una regola misurabile, le morti ingiuste corrette con avvisi e i costi lasciati, le alternative scartate scritte con le misure.
- **Portato qui**, in `collaudo/`: `principiante-curiosa.txt`, `principiante-frettolosa.txt`, `principiante-sperduta.txt` (la
  partita di Michela); `cammino.py` (la giocatrice: beve e mangia alla sua soglia, rimedia ai passaggi chiusi come il gioco le
  dice, a volte si perde; una partita passo per passo); `verosimili.py` (sei caratteri: attenta, violenta, distratta, inesperta,
  curiosa, frettolosa; due livelli di smarrimento; le varianti «e se…?» su una copia dei `.fav`; `--regola`; `--controlla` per
  la CI). Il metodo, i numeri, le varianti, le decisioni e i limiti in `sviluppo/bilanciamento.md`.
- **Il gioco di oggi misurato** (1.41.1, 300 partite per carattere): l'attenta sempre al finale e mai in pericolo; la frettolosa
  84%; la violenta 57%; la curiosa 36% (82% se si perde la metà); la distratta 32%; **la inesperta mai al lago**, e una partita su
  tre finita «sul colpo», per lo più **nel bar di Nunzio** (111 morti su 300).
- **Perché**: il margine chiede tutte e 3 le acque di partenza, e le chiede anche a chi torna dalla piana; il lavoro da Nunzio
  costa 2 di fame per 1 d'acqua senza far passare il tempo (tre lavori con la fame a 9 portano a 15, la soglia estrema, che
  uccide con la vita ancora alta); il tratto al sole costa 2 di sete a ogni turno, anche quello speso a bere; Saverio vuole cibo
  e il cibo si mangia per strada. La partita di Michela giocata diritta moriva al turno 66.
- **Provate diciannove varianti e combinazioni** (solo numeri e condizioni, nessun testo detto), ai due livelli di smarrimento.
- **Le decisioni di Simone** (questionario), applicate: la fame ogni 5 turni, il lavoro da Nunzio a 1 di fame, le soglie
  estreme a 16 e 18 (`prototipo/sistemi.fav`, `prototipo/z1-acquaviva.fav`); i misuratori di sete e fame a 16 e 18
  (`ViaggiatorePlayer.tsx`); la regola in `REGOLA`. Versione **1.42.0** (`versione.mjs prepara minor`), CHANGELOG, documento dei
  sistemi, mappa narrativa rigenerata.
- **Due collaudi corretti** (non il gioco): `pulsanti.py` (il quarto colpo a Vito già a terra, dopo che il pilota ha mangiato,
  non è un pulsante mancante) e `trofei.py` (la veglia al guado avanza anche nel turno in cui il pilota beve). Il controllo
  rapido entra in `.github/workflows/collaudo.yml`; `collaudo/LEGGIMI.md` e il README contano diciassette collaudi.

## Decisioni
- **Si misura una distribuzione, non un percorso** — perché tre partite sono tre esempi (Simone, sul Relitto: «la combinazione
  che rende più verosimile il fatto che ce la possano fare»).
- **La giocatrice rimedia come una principiante, non come un'esperta** — perché la difficoltà da misurare è quella di chi non sa:
  tiene l'acqua del passaggio dopo il primo rifiuto, una porzione per Saverio dopo che l'ha mandata via, cerca fonti a pochi
  passi; non conosce i giri di Nunzio. Lo strumento è stato corretto più volte leggendo le partite una per una, finché le morti
  erano del gioco e non del modello (dialoghi chiusi per errore, strade ricalcolate, ritorni per mezza mappa).
- **Due livelli di smarrimento** — perché «si perde un pochino» non è un numero: come la fuga del Relitto a metà e piena.
- **Le soglie estreme a 16 e 18** (Simone: «Sì») — perché la morte sul colpo è la morte ingiusta di questo gioco: nessun testo la
  annuncia. Ora si muore a vita zero, dopo i turni di danno con «(BEVI.)» e «(MANGIA.)».
- **Il lavoro a 1 di fame** (Simone: «Lavoro a 1 di fame») — perché è la sola leva che apre la trappola di Acquaviva: più acqua o
  meno sete non servono a Michela.
- **La fame ogni 5 turni** (Simone; la proposta era lasciare il cibo com'è) — la leva più forte per chi esplora.
- **La regola** (Simone: «Michela al lago 2 su 5») — a metà smarrimento: la inesperta al lago in almeno 2 partite su 5, l'attenta
  sempre al finale, la curiosa in almeno 3 su 4, nessuna morte sul colpo (tolleranza una su cento: l'unica trovata arriva a vita
  1 dopo otto turni di danno).
- **I misuratori a 16 e 18** (scelta mia, conseguenza delle soglie) — perché il fondo scala della barra è la soglia estrema.

## Verifiche
- La regola sulla 1.42.0 (`verosimili.py --regola`, 300 partite, smarrimento 0,5): **regge**: Michela al lago 52%, l'attenta
  100%, la curiosa 93%, nessuna morte sul colpo. A smarrimento pieno: Michela al lago 12% (prima 0%), la curiosa al finale 68%
  (prima 36%), la distratta 47% (32%), la violenta 70% (57%), la frettolosa 93% (84%).
- `verosimili.py --controlla`: TUTTO OK (i tre percorsi diritti arrivano al finale, la sperduta al turno 107).
- Collaudi della CI in locale, sulla 1.42.0: compilazione, `finali.py` 9/9, `mirate.py`, `salvataggi.py` (16 partite, 22
  ricaricamenti identici), `scorte.py`, `interfaccia.py`, `fili.py` (124), `giocate.py`, `conferme.py` (95 scelte), `testo.py`,
  le prove dell'app, `tsc` ed ESLint, `pulsanti.py`, `mappa.py`, `trofei.py`, `musica.py`, `doppiaggio.py` (nessun testo
  cambiato), `traduzione.py`, l'esploratore corto: tutti verdi (dopo le due correzioni dei collaudi). Versioni, diario e
  registro in ordine.
- Il banco (`strumenti/gioca.py --pilota`): B_cavallo nei quattro modi 12/12; H_veglia agli avvisi 12/12 (vita minima 7,6) e
  a soglie tarde 12/12 (vita minima 2,8, la peggiore 1).

## Questioni aperte
- **Il rilascio della 1.42.0** è da fare, quando Simone lo dice (Actions → Rilascio).
- **Far rigiocare Michela** la 1.42.0, se capita: il suo racconto vale più delle partite simulate (§10 del documento).
- I numeri del modello dipendono dalle probabilità dei caratteri; se Simone vuole, si ritoccano in `CARATTERI` e si rimisura.
- Il Relitto, per le morti ingiuste, aveva scelto **più avvisi**; qui un avviso nuovo sarebbe un testo detto (doppiaggio in due
  lingue): non proposto, si può riprendere.
