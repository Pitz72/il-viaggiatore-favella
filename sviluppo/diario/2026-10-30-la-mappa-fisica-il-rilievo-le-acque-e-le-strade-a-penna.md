---
data: 2026-10-30
ora: "07:40"
titolo: "La mappa fisica: il rilievo, le acque e le strade a penna"
tipo: sessione
versione: 1.38.0
---

# La mappa fisica: il rilievo, le acque e le strade a penna

## In breve
Simone ha chiesto di provare a rendere la mappa meno rigida e più vera, «pur rispettando lo schema delle direzioni, per
non disorientare il giocatore», con piccoli tracciati come strade e i colori di una carta fisica. La mappa ora è una carta
fisica della provincia stampata prima della secca, con la mano del viaggio sopra: i luoghi fuori dalla griglia ma ogni
strada nel suo verso, le strade come tracciati per classe, il lago dell'invaso ancora pieno e il sale a penna quando ci si
arriva.

## Contesto
La mappa della 1.37.0 era uno schema: luoghi su una griglia, strade a righello, macchie di colore per zona. Un tester aveva
già trovato che un elemento che sembra una mappa e non dice il vero disorienta (le barrette del cammino, tolte nella
1.37.1): la regola di fondo è stata quindi che la carta non può mai dire una direzione diversa da quella dei pulsanti.

## Lavoro fatto
- **Il progetto, con una squadra di agenti** (una procedura a più agenti, fuori dal repository): tre proposte indipendenti
  (un cartografo, un game designer che custodisce le decisioni già prese, un ingegnere), una sintesi, due critici
  avversari. I critici hanno trovato problemi veri e la realizzazione li ha seguiti: il ritiro che collassava sulla griglia
  (ora si ritirano solo i colpevoli, con i loro id veri), i nomi che saltavano da un'apertura all'altra (ora hanno un lato
  fisso, scelto sul foglio pieno), le uscite delle strade misurate dentro il segno (ora appena fuori), i tornanti
  illeggibili (via), l'ombra troppo scura per l'inchiostro (mai sotto 0,74), il torrente troppo vistoso (sottile, il greto
  solo al guado), la statale arancio che faceva concorrenza al rosso del «sei qui» (anima gialla), il «sei qui»
  indistinguibile per un daltonico (rosso più scuro e quattro tacche a mirino), il sale che arrivava troppo tardi.
- **`foglio.ts`** (resta puro): `disposizione()` piega la griglia del ponte (colonne secondo la zona, due onde, uno scarto
  per luogo), proietta ogni strada entro 11,5° dal suo verso cardinale e i vicini ad almeno una frazione del passo; i
  tracciati si curvano perpendicolarmente al loro asse, così avanzano sempre, e si ritirano da soli se piegano all'uscita,
  si scostano troppo, passano vicino a un altro luogo o ne incrociano un altro; poi i nomi, a sedici posti possibili.
  Chi resta storto dimezza il suo scarto e si ricomincia. Sulla carta vera: due ritiri, 37 luoghi liberi su 39, nessuna
  stortura, circa 110 ms una volta per carta. Le classi delle strade vengono dai testi dei `.fav` («Un tratto di strada
  provinciale», «La statale ridiscende», «La mulattiera si fa ripida»).
- **`terreno.ts`** (nuovo, puro): il modello del cartografo, ancorato soltanto alle tappe, ai punti di mezzo fra due tappe,
  al fondo dell'invaso, alla diga e alla stazione: la provincia che sale da est a ovest, la dorsale delle colline con la
  sua sella, il pianoro, il colle del paese, il torrente (lo stesso Torrente Morto del trailer) che passa sotto la strada
  del guado, il lago dietro la diga, l'emissario, la costa, la ferrovia; le tinte a fasce già fuse con la carta, l'ombra
  da nord-ovest, le curve di livello ogni 100 m.
- **`stampa.ts`** (nuovo): dipinge la stampa una volta per sessione, a fette di pochi millisecondi (il terreno in circa
  70 ms, i pixel in 60–95 ms, in tutto), in un momento libero appena la mappa è in bisaccia, e la tiene in memoria come
  immagine; a parte, il sale. Con il contrasto alto non si fa niente.
- **`Mappa.tsx`, `mappa.css`**: la stampa sotto la mano, il cartiglio, la rosa sul mare, le strade in quattro passate
  (accennate, bordi, anime, strade semplici), gli anelli delle tappe tracciati a mano, il mirino; via le macchie di zona e i
  filtri di spostamento della penna (si rifacevano tre volte durante l'apertura). Per il lettore di schermo le tappe
  dicono da che parte stanno, e una riga dice com'è la carta.

## Decisioni
- **Le nove scelte aperte del progetto, ai valori di base** (dichiarate a Simone): il mare a nord-est; il lago stampato
  pieno e il sale a penna con l'invaso raggiunto (confermato da Simone: «una vecchia cartina di quando non c'è ancora
  stata la secca»); pochi nomi stampati, quelli del trailer (Torrente Morto, Serra Alta) e «MARE»; la ferrovia; via le
  macchie di zona; la statale con l'anima gialla; irregolarità media; nessuna tappa in risalto; il cartiglio senza nome di
  provincia, anno né scala (la griglia non è isotropa: una scala direbbe il falso).
- **La diga sta all'asciutto** (mia, dopo il collaudo): nel prototipo il luogo «La diga» cadeva nell'acqua. Il muro ora
  passa appena a sud del luogo, che è il coronamento.
- **I nomi delle tappe non scansano le strade**: se lo facessero, il primo giorno disegnerebbero il reticolo che non si è
  ancora percorso (critica del primo revisore). Quelli dei luoghi sì.
- **Nessuna strada stampata.** Le strade restano della mano: «i percorsi si fanno giocando» (Simone, 1.37.0).

## Verifiche
- `collaudo/mappa.py`: 12.275 controlli, tutti verdi; le regole della disposizione e del terreno rifatte in Python per
  conto loro, e provate a fallire.
- Nel browser, dalla pagina di prova e da una partita vera (stazione, piazza, casa, si prende la mappa, M): la stampa è già
  pronta quando la si apre; il contrasto alto senza stampa; il foglio a inizio partita e a viaggio finito.
- La batteria del CI e la build: vedi il commit.

## Questioni aperte
- **Da vedere su un PC modesto**: la stampa si prepara a fette, ma la disposizione (circa 110 ms) è un pezzo solo.
- **Da sentire dal tester** se la carta, ora che sembra una carta vera, orienta meglio.
