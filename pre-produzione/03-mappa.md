# IL VIAGGIATORE — Mappa del viaggio

> Pre-produzione · Strato 3 di 6 · **v1.0, allineato al gioco (23/09/2026)**
> Sette zone in fila lungo la via del ritorno, **39 luoghi**. Ogni zona ha un file
> (`prototipo/z1-acquaviva.fav` … `z7-guado.fav`), un piccolo grappolo di luoghi con
> un centro, qualche vicolo cieco con una ricompensa, e **un passaggio** verso la
> zona dopo.

---

## 1. Forma generale

Il viaggio è **lineare con respiro locale**. Tutti i collegamenti vanno nei due sensi, quindi si può sempre tornare indietro; i passaggi bloccano solo in avanti, finché non si ha ciò che serve. Tra una zona e l'altra c'è un luogo-soglia (il tratto, la condotta, la rampa, la porta, il sentiero, il valico) dove il gioco dice una frase una volta sola, per far sentire il cambio di paesaggio.

```
Z1 Acquaviva ─▶ Z2 La piana ─▶ Z3 L'invaso ─▶ Z4 La statale ─▶ Z5 Il paese ─▶ Z6 Le colline ─▶ Z7 Il guado ─▶ la soglia ★
   5 luoghi       5 luoghi       7 luoghi        6 luoghi         7 luoghi        6 luoghi          3 luoghi
```

Ogni passaggio chiede **una risorsa, un oggetto, un favore o uno scontro**, e quasi sempre più di una via.

## 2. Le zone in cifre

| Zona | Luoghi | Personaggi | Il passaggio in avanti |
|---|---|---|---|
| Z1 Acquaviva | 5 | Nunzio | la mappa **e** almeno 3 d'acqua |
| Z2 La piana | 5 | Saverio (+ il cane) | almeno 4 d'acqua |
| Z3 L'invaso | 7 | Iole, Rocco | la pompa in funzione **e** almeno 6 d'acqua |
| Z4 La statale | 6 | Vito | il casello aperto, **oppure** la grata forzata |
| Z5 Il paese | 7 | Peppe, Rosaria, Ciro, Pasquale, Concetta | il permesso di Rosaria |
| Z6 Le colline | 6 | Tore, Onofrio | la lettera **oppure** il fucile |
| Z7 Il guado | 3 | Cosimo | Cosimo riconosciuto **oppure** abbattuto |
| **Totale** | **39** | **13** | |

## 3. Le sette zone

### Z1 · ACQUAVIVA — *dove la strada finiva*
`stazione` ─ `piazza` (centro) ─ `bar` · `casa` · `margine`
- **Cos'è:** il capolinea. I binari finiscono nella gramigna; una piazza intorno a un pozzo asciutto, un bar che tiene una luce accesa, una casa lasciata in fretta.
- **Funzione:** tutorial implicito. Si impara a bere, mangiare, leggere lo `stato`, fare il primo baratto. Pericolo nullo.
- **Nunzio**, al bar: acqua in cambio dell'orologio, cibo in cambio d'acqua, un sorso in cambio di fatica; indica la strada.
- **Nella casa:** la mappa, l'orologio, il coltello.
- **Passaggio (margine → ovest):** senza mappa «là fuori è solo perdersi»; con meno di 3 d'acqua non si parte.

### Z2 · LA PIANA — *il sole non perdona*
`tratto` ─ `masseria` (centro) ─ `pozzo` · `serra` · `sterrata`
- **Cos'è:** campi abbandonati, serre di vetro opaco, una masseria isolata.
- **Saverio**, al pozzo: diffidente. Un dono di cibo gli alza la fiducia e apre `attingi` (+5 d'acqua, poi solo fango).
- **La serra:** casse di conserve difese dal **cane**. Lo si distrae gettandogli cibo, lo si affronta col coltello o a mani nude, o lo si lascia stare.
- **Soglia:** sulla sterrata, dal crinale, si vede l'invaso bianco fino all'orizzonte.
- **Passaggio (masseria → ovest):** con meno di 4 d'acqua «è suicidio».

### Z3 · L'INVASO — *acqua ovunque, niente da bere*
`conca` (centro) ─ `diga` ─ `casotto` · `condotta` / `fondale` ─ `torre di presa` / `relitto`
- **Cos'è:** il bacino prosciugato, crepato in lastre di sale; una diga con la sua pompa a stantuffo; pozze salmastre che ingannano la sete.
- **Il puzzle dell'acqua:** il filtro (dal relitto) e le pastiglie (dal casotto di Iole) sulla pompa danno acqua vera: +12 con la damigiana, +8 senza. Poi si può tornare ad attingere.
- **Iole**, alla diga: non ti lascia entrare nel casotto finché non le hai dato qualcosa.
- **Rocco**, al fondale: raccoglie sale e beve salmastro, monito vivente. Il riverbero del fondale fa salire la sete, a meno di avere gli occhiali.
- **Vicoli ciechi:** il relitto (filtro, occhiali, batteria, diario) e la torre di presa (la borsa).
- **Passaggio (diga → ovest, per la condotta):** la pompa dev'essere attiva e la tanica ad almeno 6.

### Z4 · LA STATALE — *chi tiene la strada*
`rampa` ─ `casello` (centro) ─ `piazzola` · `area di servizio` ─ `sottopasso` ─ `discesa`
- **Cos'è:** un tratto di statale intatto e inutile, tranne come collo di bottiglia.
- **Vito**, al casello: la prova generale del guado. Quattro vie per passare:
  1. **pagare**: la stecca, la benzina o 3 d'acqua;
  2. **bluffare**: `minaccia Vito` con la pistola scarica;
  3. **picchiare**: chiave inglese, coltello o mani nude, contro il suo tubo di ferro;
  4. **aggirare**: la chiave inglese sulla grata dell'area di servizio apre il sottopasso.
- **Vicoli ciechi:** la piazzola (stecca, pistola, cartucce, giubbotto) e l'area di servizio (benzina, chiave inglese, medicine).
- **Soglia:** la discesa, dove la mano va da sola alla tasca del biglietto.

### Z5 · IL PAESE — *il posto dove si potrebbe restare*
`porta` ─ `piazzetta` (centro) ─ `osteria` ─ `cortile` · `salita` / `mercato` / `vicolo`
- **Cos'è:** l'unico paese ancora abitato. La zona più grande e più viva, il cuore sociale e morale del gioco.
- **Rosaria**, all'osteria: accoglie con acqua e legumi la prima volta, dà **la notizia** su Acquamorta («Tranne uno»), e scrive il permesso per le colline a chi si è guadagnato la sua fiducia.
- **Pasquale**, nel vicolo: la febbre. Le medicine si possono usare su di lui (e Rosaria lo saprà) o tenere per sé.
- **Ciro**, al mercato: compra la merce raccolta nelle zone precedenti, e l'anello.
- **Concetta**, nel cortile: ricorda i due fratelli da bambini. Sul davanzale, il giocattolo; tra i gerani, l'anello.
- **Peppe**, in piazzetta: vuole venire via. Portarlo o lasciarlo cambia le zone 6 e 7 e due finali.
- **Il registro** dell'osteria: nella colonna dei morti, il tuo cognome.
- **Passaggio (osteria → nord, la salita):** senza la parola di Rosaria non si sale.

### Z6 · LE COLLINE — *l'ultima salita*
`sentiero` ─ `pianoro` (centro) ─ `grotta` · `sorgente` · `valico` / `cappella`
- **Cos'è:** pietra e ginestra, il vento che taglia. Casa è vicina e sempre più temuta.
- **Tore**, al pianoro: formaggio in cambio d'acqua; parla del guado e di Onofrio.
- **La sorgente:** la prima acqua buona che non devi a nessuno (+6).
- **La cappella:** il santino, con un nome da bambino e il tuo cognome; la coperta.
- **Onofrio**, nella grotta: non dà niente «a chi non so chi è». Il giocattolo o il santino gli aprono la bocca: la verità sulla famiglia, e il **lascito**, la lettera che Cosimo non spedì oppure il fucile.
- **Passaggio (valico → nord):** «a Cosimo, a mani vuote, non ci si arriva».

### Z7 · IL GUADO — *cosa sei tornato a trovare*
`guado` ─ `strada` ─ `soglia` ★
- **Cosimo**, tuo fratello, tiene il greto. Con la lettera lo si riconosce, col fucile lo si abbatte; a mani nude non si ottiene niente, e il biglietto gli fa solo guardare altrove.
- **La soglia:** entrando si apre uno dei sei finali, secondo come hai sciolto il guado, se Peppe è con te, e se porti il giocattolo o l'anello (vedi `05-personaggi.md` §4).

## 4. Regole di coerenza (verificate)

- **Ogni oggetto serve nella sua zona o in quelle vicine.** Le eccezioni sono volute: il giocattolo e il santino (Z5–Z6) contano a Z6 e alla soglia; l'orologio, la batteria, la stecca si possono spendere più avanti, da Ciro.
- **L'acqua è il filo rosso:** ogni zona ha la sua questione d'acqua (barattarla, attingerla col permesso, renderla potabile, pagarla, regalarla, trovarla libera).
- **Gli scontri sono tre** (cane, Vito, Cosimo), nessuno obbligato.
- **Nessun vicolo cieco senza uscita:** l'esploratore del collaudo (`collaudo/esploratore.py`) ha visitato tutti i 39 luoghi e preso tutti i 27 oggetti senza trovare punti di blocco.
