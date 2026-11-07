# Il bilanciamento: il metodo del Relitto, portato nel Viaggiatore

> 7 novembre 2026. Richiesta di Simone: «Su Il Relitto tra ieri e oggi abbiamo trovato un metodo quanto più
> equilibrato e accurato possibile, sulla base che non abbiamo dei veri betatester, per bilanciare la difficoltà
> degli elementi che si consumano ed impediscono di completare il gioco. Il gioco deve restare una sfida ma non può
> essere implacabile ingiustamente. […] Michela ha detto che lei all'inizio, essendo inesperta, si perde un pochino e
> alla fine muore che non è arrivata nemmeno al lago.»
>
> Gli strumenti: [`collaudo/cammino.py`](../collaudo/cammino.py), [`collaudo/verosimili.py`](../collaudo/verosimili.py) e le
> tre partite da principiante `collaudo/principiante-*.txt`. Il diario: «Il metodo del Relitto per il bilanciamento».

## 1. Il metodo del Relitto

*Il Relitto Silente* (documento 33, §12, «La taratura dell'aria», 5 novembre 2026; il repository di quel gioco si è
soltanto letto) aveva lo stesso problema: una risorsa che si consuma, l'aria, tarata su percorsi giocati da chi sa la
soluzione, e nessun giocatore vero che la provasse («le persone vere promettono la prova e poi non la fanno»). Il metodo
trovato lì ha quattro pezzi.

1. **Partite da principiante scritte a mano.** Tre (il curioso, il frettoloso, lo sperduto): dicono che cosa *vuole fare*
   chi gioca per la prima volta, con gli errori di chi arriva nuovo, ma non come gestisce la risorsa.
2. **Una reazione da principiante, scritta nello strumento.** La cella e la ricarica le usa da sé `aria.py`, come farebbe
   chi gioca la prima volta (la cella appena scatta la protezione vitale, la ricarica all'avviso). Così le partite restano
   vere anche quando i numeri cambiano.
3. **Tante partite verosimili, non tre.** Simone: «non dobbiamo trovare la combinazione per far vincere i giocatori ma la
   combinazione che rende più verosimile il fatto che ce la possano fare. Si tratta di bilanciamento». `verosimili.py`
   ricava da ogni partita centinaia di partite diverse per carattere: ogni cosa facoltativa si fa oppure no, con le
   probabilità del carattere, scritte nel file. Si guardano distribuzioni (quanti tornano vivi, con quanta aria, i più
   sfortunati), e si propone la combinazione con margini larghi, non quella che centra una soglia.
4. **Una regola, e la sfida che resta.** Il registro del Relitto fissava una regola misurabile («il curioso arriva alla
   Grande Porta con le tre chiavi sopra il 30%»). Quando le prime misure davano una fuga perfetta, Simone: «ma se così
   vincono sempre tutti, dove sta la sfida?»: gli errori nella fuga si misurano a due livelli. Si distinguono le **morti
   ingiuste** (morire a un passo dal boccaporto senza un avviso) da quelle giuste (si è rimasti troppo, come L.V.); le
   ingiuste si correggono, e lì si sono corrette con **due avvisi**, non toccando i costi. Le alternative provate e
   scartate si scrivono, con le loro misure.

## 2. Che cosa cambia nel Viaggiatore

Nel Relitto la risorsa è una (l'aria) e si spende in modo noto. Qui le risorse sono cinque, legate fra loro: il **corpo**
(vita, sete, fame) e le **scorte** (acqua, cibo), che sono anche moneta. E ci sono i **passaggi** che chiedono una scorta
minima (il margine di Acquaviva 3 d'acqua, la masseria 4, la diga la pompa e 6, il casello un pedaggio), le persone che
danno acqua o cibo solo a certe condizioni (Saverio vuole un dono di cibo, Iole un dono, Nunzio baratta e fa faticare), e
il tempo: ogni comando è un turno (non i dialoghi, non le uscite che non ci sono), la sete sale di 1 ogni 3 turni, la fame
di 1 ogni 4, e nel tratto al sole la sete sale di 2 a ogni turno passato lì.

Così la giocatrice principiante di `cammino.py` fa più cose della reazione di `aria.py`:

- **beve e mangia alla sua soglia**, che il carattere sceglie partita per partita (agli avvisi, a 6 di sete e 7 di fame;
  più tardi, quando il corpo fa già male; o, all'inizio, troppo presto); sopra le righe del danno («(BEVI.)», «(MANGIA.)»)
  bevono e mangiano tutte;
- **davanti a un passaggio chiuso fa quello che il gioco le ha detto**, se lo trova: torna a prendere la mappa, va al bar a
  barattare o a faticare, al pozzo, alla pompa, paga Vito, aiuta il paese finché Rosaria la fa salire, porta a Onofrio un
  ricordo; dopo il primo «Con quest'acqua non arrivi» tiene da parte l'acqua del passaggio, e dopo che Saverio l'ha
  mandata via una porzione di cibo per lui;
- **a volte si perde**: prima di trovare il rimedio gira qualche passo a caso (quanto spesso lo dice l'«ingegno» del
  carattere), e ogni tanto, lungo il percorso, entra dove non serve e torna (la «deviazione»);
- **con la sete o la fame che fanno male e niente da bere o mangiare** cerca la fonte che conosce più vicina (il pozzo, la
  pompa, la sorgente, Nunzio, Ciro, Tore, le conserve della serra), ma solo a pochi passi (sei): più lontano va avanti per
  la sua strada, verso il paese di cui le hanno parlato, invece di tornare indietro per mezza mappa; davanti a un passaggio
  chiuso, se non trova nessun rimedio, gira a vuoto: è un **vicolo cieco**, e il conto lo segna;
- nella serra senza cibo, se ha ingegno, fa quello che il testo dice («Oppure ATTACCA il cane»), ma a mani nude solo se ha
  ancora forze; con le mani piene posa quel che le serve meno.

Quanto si perde si misura a **due livelli**, come la fuga del Relitto (`--smarrimento 1` e `--smarrimento 0.5`): a metà, lo
spreco, le deviazioni e le volte in cui gira a vuoto prima di un rimedio si dimezzano. «Si perde un pochino», nelle parole di
Michela, sta più vicino al livello 0,5; gli errori della sua partita scritta (la mappa dimenticata, l'orologio lasciato,
Saverio a mani vuote, il ritorno da Nunzio) restano a ogni livello.

Il **lago** di Michela è l'invaso (zona 3): sulla carta è il lago, e la stampa fisica della mappa lo disegna così. «Arrivare
al lago» vuol dire entrare nella conca.

## 3. Gli strumenti

| File | Che cosa fa |
|---|---|
| `collaudo/principiante-curiosa.txt` | la curiosa: esamina e prende quasi tutto, parla con tutti, beve alla pozza salmastra di Rocco |
| `collaudo/principiante-frettolosa.txt` | la frettolosa: va dritta, prende la mappa e poco altro, arriva ai passaggi prima di sapere che cosa serve |
| `collaudo/principiante-sperduta.txt` | **la partita di Michela**: va verso la strada senza mappa, torna, non prende l'orologio, si guarda intorno nel tratto al sole, entra nella serra prima del pozzo, chiede l'acqua a Saverio a mani vuote e torna da Nunzio a cambiare acqua con cibo; poi impara |
| `collaudo/cammino.py` | una partita, passo per passo: la giocatrice, i suoi rimedi, il rapporto (dove si spende, al lago con che cosa, come finisce) |
| `collaudo/verosimili.py` | centinaia di partite per carattere, la tabella, dove si muore, le varianti, il controllo rapido |

```bash
python collaudo/cammino.py collaudo/principiante-sperduta.txt --passi       # la partita di Michela, comando per comando
python collaudo/cammino.py collaudo/principiante-sperduta.txt --seme 4      # un'altra delle sue partite
python collaudo/verosimili.py -n 300                                        # il gioco di oggi
python collaudo/verosimili.py -n 300 --carattere inesperta --dettaglio      # solo Michela, con i luoghi delle morti
python collaudo/verosimili.py -n 300 --variante acqua-4                     # «e se…?», su una copia dei .fav
python collaudo/verosimili.py -n 300 --smarrimento 0.5                     # chi si perde la metà
python collaudo/verosimili.py -n 150 --confronta                            # oggi e ogni variante, una dopo l'altra
python collaudo/verosimili.py --controlla                                   # il controllo rapido (gira in CI)
python collaudo/verosimili.py --regola                                      # la regola decisa da Simone (§9)
```

Le partite sono riproducibili: lo stesso seme dà le stesse partite. Le varianti usano gli stessi semi del gioco di oggi,
così le differenze vengono dalla variante e non dal caso. Una variante si prova su una copia di `prototipo/` in una
cartella temporanea: i `.fav` del gioco non si toccano.

## 4. I caratteri

Le probabilità sono una scelta a tavolino, come nel Relitto: scritte in `CARATTERI` (in testa a `verosimili.py`), si
cambiano lì.

| Carattere | Parte da | Beve a sete | Mangia a fame | Presto | Ingegno | Curiosità | Raccolta | Errori | Spreco | Deviazione |
|---|---|---|---|---|---|---|---|---|---|---|
| attenta | il percorso B del collaudo | 6 | 7 | — | sempre | — | — | — | — | — |
| violenta | la curiosa, col cane e Vito a colpi | 6–7 | 7–8 | — | 0,9 | 0,6 | 0,8 | 0,3 | 0,05 | 0,05 |
| distratta | la curiosa | 8–9 | 10–11 | — | 0,8 | 0,7 | 0,7 | 0,4 | 0,1 | 0,1 |
| **inesperta** (Michela) | la sperduta | 5–9 | 7–11 | 1 su 4 | 0,6 | 0,8 | 0,6 | 0,6 | 0,15 | 0,12 |
| curiosa | la curiosa | 6–7 | 7–9 | 1 su 10 | 0,8 | 0,9 | 0,9 | 0,4 | 0,1 | 0,1 |
| frettolosa | la frettolosa | 6–8 | 7–10 | 1 su 10 | 0,7 | 0,3 | 0,4 | 0,3 | 0,03 | 0,05 |

«Presto»: finché non arriva al lago beve a 4 di sete e mangia a 5 di fame, prima degli avvisi (chi non sa ancora quanto
dura il viaggio). «Ingegno»: la probabilità di trovare subito il rimedio a un passaggio chiuso, senza girare a vuoto.
«Spreco»: un «guarda» in più prima di un passo. «Deviazione»: qualche passo a caso prima di un passo del percorso.

## 5. Il gioco di oggi (1.41.1), in numeri

Trecento partite per carattere, seme 1, 7 novembre 2026 (`python collaudo/verosimili.py -n 300 --dettaglio`, e lo stesso
con `--smarrimento 0.5`). Prima cifra: chi si perde quanto dice il carattere; seconda: chi si perde la metà.

| Carattere | Al lago | A un finale | Muore senza arrivare al lago | Morte sul colpo | Vita minima (mediana) | Esce da Acquaviva | Al lago al turno | Al lago, il 10% più povero |
|---|---|---|---|---|---|---|---|---|
| attenta | 100% · 100% | **100% · 100%** | 0% · 0% | 0% · 0% | 10 · 10 | turno 11 | 21 | acqua 9, cibo 5 |
| violenta | 98% · 100% | 57% · 69% | 2% · 0% | 0% · 0% | 1 · 2 | turno 18 · 17 | 36 · 34 | acqua 5, cibo 2 |
| distratta | 88% · 97% | 32% · 56% | 12% · 3% | 2% · 1% | 0 · 2 | turno 22 · 19 | 38 · 34 | acqua 5, cibo 3–4 |
| **inesperta** (Michela) | **0% · 3%** | **0% · 0%** | **100% · 97%** | **36% · 40%** | 0 · 0 | turno 32 · 24 | 79 · 70 | acqua 3–4, cibo 0 |
| curiosa | 94% · 99% | 36% · 82% | 6% · 1% | 3% · 1% | 0 · 7 | turno 24 · 20 | 41 · 36 | acqua 4–5, cibo 2–3 |
| frettolosa | 98% · 99% | 84% · 97% | 2% · 1% | 2% · 0% | 10 · 10 | turno 7 · 6 | 14 · 13 | acqua 6, cibo 1 |

**Morte sul colpo**: la partita finisce per una soglia estrema (fame 15, sete 13) con la vita ancora sopra zero, senza un turno
di danno che la annunci. **Dove si muore**: la inesperta ad Acquaviva (58%: di fame 36%, di sete 22%) e nella piana (43%); i
luoghi: il **bar** 111 volte su 300 (141 a metà smarrimento), la masseria 55, la serra 40, il margine 32. La curiosa muore
soprattutto **dopo** il lago: nel paese e sulla statale, di fame (18% e 8%); la distratta all'invaso (sete 24%, fame 12%); la
violenta sulla statale (fame 17%, le ferite di Vito 8%); la frettolosa poche volte, sulle colline.

Come si legge. I numeri assoluti dipendono dal modello (le probabilità dei caratteri, e una giocatrice che non pianifica
lontano: rimedia a un passaggio per volta); le **forme** sono robuste e si ripetono con ogni seme:

- chi sa la strada non è **mai** in pericolo (vita minima 10, al lago con 9 d'acqua e 5 di cibo): per l'attenta il gioco non
  è una sfida di sopravvivenza (lo diceva già il diario del 1° ottobre 2026);
- chi va dritta arriva quasi sempre; chi esplora, beve tardi o picchia arriva una volta su due o tre, e **si perde molto
  di più quando si perde**: la curiosa passa dal 36% all'82% dimezzando gli smarrimenti. È una sfida vera, e non ingiusta:
  chi muore ha speso, tardato, girato a vuoto;
- la partita di Michela, invece, **non arriva mai al lago**, e una volta su tre finisce con una morte sul colpo: lì il gioco
  è implacabile, e per ragioni che lei non poteva vedere (sotto).

## 6. Perché si muore prima del lago

Lette una per una, le partite che muoiono prima del lago passano quasi tutte per gli stessi meccanismi (le partite da leggere:
`python collaudo/cammino.py collaudo/principiante-sperduta.txt --passi` e `--seme N`):

1. **Il margine chiede tutta l'acqua di partenza, e la chiede ogni volta.** Si parte con 3 d'acqua e il margine ne vuole 3.
   L'avviso della sete arriva verso il turno 18: chi esplora Acquaviva e beve quando il gioco lo dice ha 2 d'acqua e non passa.
   Senza l'orologio (che la curiosa a volte, la sperduta sempre, non prende) resta il lavoro da Nunzio. E il margine chiede le
   3 d'acqua **anche a chi torna** dalla piana a chiedere aiuto: chi rientra ad Acquaviva a tanica vuota ci resta chiuso.
2. **Il lavoro da Nunzio costa 2 di fame per 1 d'acqua, e non fa passare il tempo.** Tre lavori di fila sono 6 di fame in un
   colpo solo: con la fame già a 9 si arriva a 15, e **la soglia estrema uccide sul colpo**, con la vita ancora alta. È la morte
   più frequente della inesperta (il bar, 111 volte su 300) ed è una **morte ingiusta** nel senso del Relitto: niente la
   annuncia: nessun testo dice che a 15 di fame si cade.
3. **Il tratto al sole costa 2 di sete a ogni turno passato lì**, anche il turno speso a bere (un sorso toglie 4, il turno ne
   rimette 2+): chi si guarda intorno nel tratto, o ci passa avanti e indietro tra il paese e la masseria, ci lascia l'acqua.
4. **Saverio vuole cibo, e il cibo si mangia per strada.** L'avviso della fame arriva verso il turno 28: chi mangia quando il
   gioco lo dice arriva al pozzo senza niente da dargli, e il pozzo non dà una goccia. Il rimedio (le conserve della serra, a
   colpi di coltello, o il cibo di Nunzio) lo trova solo chi ha capito, e intanto il cane morde.

Più avanti contano il **fondale senza occhiali** (1 di sete a turno) e la **pozza salmastra** di Rocco (sete +3, vita −2: con la
sete già alta porta a 13, sul colpo), e per la distratta l'invaso prima della pompa: arriva alla diga a secco e il dono a Iole
le costa l'ultima scorta.

**La partita di Michela giocata «diritta»** (senza sbagli né smarrimenti oltre i suoi, bevendo e mangiando agli avvisi)
muore anche così, al turno 66: torna ad Acquaviva a tanica vuota (punti 1–2), ne esce con la fame a 13 e la vita a 4, e non
regge la piana (punto 4). Fra le varianti provate una sola la salva da sola: il lavoro da Nunzio a 1 di fame (arriva a un
finale al turno 111).

Dopo il lago, chi è lenta muore **di fame**: fra l'invaso e il paese non c'è cibo da prendere (Iole e Imma ne chiedono, la
serra è indietro), e la fame sale di 1 ogni 4 turni per chi ci mette il triplo dell'esperta. È la morte della curiosa e
della inesperta salvata ad Acquaviva: una sfida più che un'ingiustizia (il gioco avvisa a 7 e fa male da 11).

## 7. Le varianti provate

Misurate sulla 1.41.1, prima delle decisioni del §9. Ogni variante cambia **numeri o condizioni**, mai un testo detto (niente doppiaggio da rifare), su una copia dei `.fav`
(`VARIANTI` in `verosimili.py`). Centoventi partite per carattere, gli stessi semi del gioco di oggi; la percentuale è quella
delle partite che arrivano a un finale (per la inesperta anche al lago, e le morti sul colpo). L'attenta arriva sempre, con
ogni variante.

| Variante | Che cosa cambia |
|---|---|
| `acqua-4`, `cibo-3` | si parte con 4 d'acqua (oggi 3), con 3 di cibo (oggi 2) |
| `sole-1` | il tratto al sole costa 1 di sete a turno (oggi 2) |
| `margine-2`, `masseria-3` | il margine chiede 2 d'acqua (oggi 3), la masseria 3 (oggi 4) |
| `margine-una-volta` | il margine chiede le 3 d'acqua solo la prima volta, non a chi torna dalla piana (uno stato nuovo, senza testo) |
| `lavoro-fame-1` | il lavoro da Nunzio costa 1 di fame (oggi 2) |
| `lavoro-senza-fame` | Nunzio fa lavorare solo se la fame è al massimo 8 |
| `estreme-16-18` | le soglie estreme a 16 di sete e 18 di fame (oggi 13 e 15): si muore a vita zero, dopo i turni di danno |
| `sete-ogni-4`, `fame-ogni-5` | la sete sale ogni 4 turni (oggi 3), la fame ogni 5 (oggi 4): tutto il gioco |
| `ripresa-1-su-6` | la vita risale una volta su 6 (oggi 8) |
| `pacchetto-a` | lavoro a 1 + soglie 16/18 + sole a 1 + margine una volta |
| `pacchetto-b` | il pacchetto a + 3 di cibo alla partenza |
| `pacchetto-c` | lavoro a 1 + soglie 16/18 + fame ogni 5 turni |
| `pacchetto-d` | il pacchetto a + fame ogni 5 turni |

**Chi si perde quanto dice il carattere** (`-n 120 --confronta`):

| Variante | violenta | distratta | curiosa | frettolosa | inesperta: al lago | inesperta: finale | inesperta: sul colpo |
|---|---|---|---|---|---|---|---|
| oggi | 52% | 30% | 37% | 80% | 0% | 0% | 36% |
| acqua-4 | 58% | 36% | 43% | 84% | 0% | 0% | 38% |
| cibo-3 | 59% | 34% | 54% | 90% | 2% | 0% | 32% |
| sole-1 | 52% | 30% | 45% | 86% | 1% | 0% | 35% |
| margine-2 | 53% | 32% | 37% | 82% | 0% | 0% | 32% |
| masseria-3 | 53% | 30% | 38% | 81% | 0% | 0% | 36% |
| lavoro-fame-1 | 55% | 29% | 38% | 83% | 8% | 0% | 18% |
| margine-una-volta | 52% | 30% | 37% | 87% | 0% | 0% | 32% |
| estreme-16-18 | 52% | 30% | 37% | 80% | 0% | 0% | 7% |
| lavoro-senza-fame | 52% | 29% | 37% | 79% | 0% | 0% | 8% |
| lavoro-1+estreme | 55% | 29% | 38% | 83% | 8% | 0% | 0% |
| lavoro-1+estreme+sole-1 | 53% | 31% | 49% | 88% | 24% | 0% | 0% |
| pacchetto-a | 53% | 32% | 48% | 88% | 14% | 0% | 0% |
| pacchetto-b | 62% | 41% | 71% | 94% | 30% | 0% | 0% |
| pacchetto-c | 66% | 42% | 70% | 92% | 16% | 0% | 2% |
| pacchetto-d | 72% | 51% | 79% | 98% | 28% | 0% | 0% |
| sete-ogni-4 | 64% | 34% | 49% | 88% | 4% | 0% | 41% |
| fame-ogni-5 | 66% | 41% | 69% | 90% | 1% | 0% | 37% |
| ripresa-1-su-6 | 56% | 30% | 33% | 80% | 0% | 0% | 36% |

**Chi si perde la metà** (`-n 120 --confronta --smarrimento 0.5`):

| Variante | violenta | distratta | curiosa | frettolosa | inesperta: al lago | inesperta: finale | inesperta: sul colpo |
|---|---|---|---|---|---|---|---|
| oggi | 65% | 52% | 78% | 94% | 2% | 0% | 36% |
| estreme-16-18 | 65% | 52% | 78% | 94% | 2% | 0% | 3% |
| lavoro-fame-1 | 68% | 53% | 81% | 95% | **42%** | 0% | 8% |
| lavoro-1+estreme | 68% | 53% | 81% | 95% | **42%** | 0% | **0%** |
| cibo-3 | 70% | 57% | 88% | 98% | 12% | 0% | 28% |
| fame-ogni-5 | 72% | 68% | 92% | 98% | 12% | 0% | 28% |
| pacchetto-a | 68% | 53% | 86% | 96% | 51% | 1% | 0% |
| pacchetto-b | 71% | 58% | 93% | 99% | 64% | 2% | 0% |
| pacchetto-c | 75% | 72% | 92% | 98% | 52% | 11% | 0% |
| pacchetto-d | 76% | 71% | 96% | 100% | 62% | 4% | 0% |

Che cosa dicono:

- **Le soglie estreme a 16 e 18 tolgono le morti sul colpo** (36% → 3–7%) senza cambiare chi arriva: la morte non sparisce,
  arriva dopo i turni di danno, con «(BEVI.)» e «(MANGIA.)». È la correzione delle morti ingiuste, come gli avvisi del Relitto.
- **Il lavoro da Nunzio a 1 di fame è la sola leva che apre la trappola di Michela**: da solo la porta al lago in 42 partite su
  100 a metà smarrimento (oggi 2), salva la sua partita giocata diritta, e agli altri caratteri cambia uno o tre punti.
- **Più acqua o meno sete non servono a Michela** (acqua 4, margine a 2, masseria a 3, sete ogni 4: 0–4%): non muore per
  l'acqua che ha, muore per il ritorno ad Acquaviva e per la fame che il lavoro le dà.
- **Il cibo è la leva di tutti gli altri**: 3 di cibo alla partenza portano la curiosa dal 37% al 54% (dal 78% all'88% a metà
  smarrimento); la fame ogni 5 turni fino al 69% (92%), e cambia il ritmo di tutto il viaggio.
- **Finire il viaggio, per Michela, resta difficile con ogni variante** (0–11%): ci mette il triplo dei turni dell'esperta, e
  dopo il lago muore di fame. Arrivare al lago e oltre è possibile; finire chiede di aver imparato (una seconda partita), come
  nel Relitto «la sua sfida non è sopravvivere, è capire».

## 8. Le proposte

Fino alle decisioni nessun `.fav` è stato toccato: le proposte sono andate a Simone a questionario, come vuole il metodo. Tutte cambiano numeri o
condizioni, **nessun testo detto** (niente doppiaggio da rifare); ognuna è una versione minor (cambia l'impronta dei
salvataggi) e chiede i collaudi verdi, con `collaudo/giocate.py` da riscrivere dove fissa l'equilibrio di oggi.

1. **Le morti sul colpo** (ingiuste): soglie estreme a 16 di sete e 18 di fame.
2. **La trappola di Acquaviva** (Michela): il lavoro da Nunzio a 1 di fame; più forte, il pacchetto a (anche il sole del tratto
   a 1 e il margine una volta sola).
3. **Il cibo** (la sfida di chi esplora): lasciarlo com'è, oppure 3 di cibo alla partenza, oppure la fame ogni 5 turni.
4. **La regola**, da scrivere qui e da rimisurare a ogni ritocco (come «il curioso alla Grande Porta sopra il 30%» del Relitto).

## 9. Le decisioni (7 novembre 2026) e la 1.42.0

Simone, a questionario:

1. **Le morti sul colpo**: «Sì, 16 e 18». Le soglie estreme passano a 16 di sete e 18 di fame.
2. **La trappola di Acquaviva**: «Lavoro a 1 di fame». Il lavoro da Nunzio costa 1 di fame.
3. **Il cibo**: «Fame ogni 5 turni» (la proposta era lasciarlo com'è). La fame sale ogni 5 turni.
4. **La regola**: «Michela al lago 2 su 5». A metà smarrimento: **la inesperta arriva al lago in almeno 2 partite su 5, l'attenta
   arriva sempre a un finale, la curiosa in almeno 3 su 4, e nessuna morte sul colpo** (tolleranza: una partita su cento). Sta
   in `REGOLA` di `verosimili.py`; si misura con `python collaudo/verosimili.py --regola` a ogni ritocco della difficoltà.

Applicate nella **1.42.0** (`prototipo/sistemi.fav`, `prototipo/z1-acquaviva.fav`; i misuratori di sete e fame in
`app/src/components/ViaggiatorePlayer.tsx` arrivano a 16 e 18, perché il fondo scala è la soglia estrema). Nessun testo detto è
cambiato. Le varianti applicate sono uscite da `VARIANTI`; `come-la-1-41` rimette i numeri di prima, per rimisurarli.

**La regola sulla 1.42.0** (`--regola`, 300 partite per carattere, smarrimento 0,5): **regge**. Michela al lago 52%, l'attenta
100%, la curiosa 93%, nessuna morte sul colpo.

| Carattere (1.42.0) | Al lago | A un finale | Morte sul colpo | Vita minima (mediana) |
|---|---|---|---|---|
| attenta | 100% · 100% | 100% · 100% | 0% · 0% | 10 · 10 |
| violenta | 99% · 100% | 70% · 76% | 0% · 0% | 3 · 3 |
| distratta | 95% · 99% | 47% · 76% | 0% · 0% | 0 · 4 |
| **inesperta** (Michela) | **12% · 52%** | 0% · 7% | 0% · 0% | 0 · 0 |
| curiosa | 97% · 100% | 68% · 93% | 0% · 0% | 7 · 8 |
| frettolosa | 99% · 100% | 93% · 99% | 0% · 0% | 10 · 10 |

(Prima cifra: chi si perde quanto dice il carattere; seconda: chi si perde la metà.) Rispetto alla 1.41.1 la sfida resta dove
deve stare: chi sa la strada non se ne accorge (il pilota del banco, `strumenti/gioca.py --pilota`, arriva sempre, come prima;
la violenta che beve e mangia tardi scende ancora a vita 1–3), chi si perde molto muore ancora spesso (la distratta una volta su
due), e la partita di Michela giocata diritta **arriva al finale** (al turno 107; prima moriva al turno 66). Il controllo rapido
della CI ora lo pretende.

## 10. I limiti del modello

- **Le probabilità sono a tavolino.** Le cifre dei caratteri (§4) sono scelte, non misure su persone: i numeri assoluti si
  spostano se si cambiano. Per questo si guardano le forme (chi muore dove e perché, che cosa sposta una variante a parità di
  semi) e le si misura a due livelli di smarrimento.
- **La giocatrice non pianifica lontano.** Rimedia a un passaggio per volta, non conosce i giri che un esperto userebbe (da
  Nunzio, lavorare e cambiare l'acqua col cibo all'infinito senza far passare un turno); cerca le fonti che ha visto, a pochi
  passi. È più ingenua di chi ha giocato già una volta, e forse meno di chi non ha mai giocato un'avventura testuale.
- **Una variante vale se la giocatrice la sa usare.** Le regole dei rimedi stanno in `cammino.py`: una variante che apre una
  fonte d'acqua o di cibo che lei non conosce (per esempio il fondo del pozzo senza la fiducia di Saverio) verrebbe
  sottostimata. Due varianti così sono state tolte prima di misurare.
- **Le partite «ferme» (1–2%)** non sono vicoli del gioco: il percorso e la giocatrice si perdono di vista (un passo del
  percorso fatto nel posto sbagliato, dopo un rimedio) e la partita resta viva con acqua e cibo. Il controllo rapido pretende
  che i percorsi giocati diritti arrivino a un finale.
- **Le persone vere restano la prova migliore.** Se Michela, o chiunque, rigioca la 1.42.0, il suo racconto vale più di mille
  partite simulate: dove si è persa, quando ha bevuto, che cosa ha capito tardi. Il metodo serve a non aspettarle.
