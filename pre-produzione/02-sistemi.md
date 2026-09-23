# IL VIAGGIATORE — Sistemi di gioco (su misura del motore)

> Pre-produzione · Strato 2 di 6 · **v1.0, allineato al gioco (23/09/2026)**
> Tutto è espresso in costrutti **FAVELLA 1 reali** (motore 1.1.0), con i numeri
> tarati sul gioco giocato. Fonte di verità: `prototipo/sistemi.fav` e i file di zona.
> Principio guida: **GDR leggero**. Il minimo stato necessario: ogni contatore in più
> è complessità moltiplicata in ogni scena.

---

## 1. Lo stato del giocatore

Cinque contatori, più due stati di servizio per gli avvisi.

```favella
La vita è un contatore.     La vita parte da 10.
La sete è un contatore.     # parte da 0
La fame è un contatore.     # parte da 0
L'acqua è un contatore.     L'acqua parte da 3.
Il cibo è un contatore.     Il cibo parte da 2.
```

**Distinzione di fondo (è il cuore del design):**
- `sete` e `fame` = **stato del corpo**. Partono da 0, **salgono** col tempo, scendono solo bevendo e mangiando. Alti = danno, poi morte.
- `acqua` e `cibo` = **scorte che porti**. Sono sopravvivenza e insieme moneta. Calano consumando o barattando.

Le scorte di partenza sono volutamente strette (3 d'acqua, 2 di cibo): il primo baratto, al bar di Nunzio, non è facoltativo.

## 2. Il tempo, la sete, la fame, la morte

### Il logorio
Ogni comando è un turno, anche `esamina`. Il logorio è lento, così esplorare non viene punito:

```favella
Ogni 3 turni: aumenta la sete.
Ogni 4 turni: aumenta la fame.
```

Il costo del cammino non è un demone sui tratti di strada (la bozza lo prevedeva): è affidato ai **passaggi**, che chiedono una scorta minima prima di lasciarti partire (vedi `03-mappa.md`). Il giocatore sente il peso della traversata *prima* di farla, quando può ancora rimediare.

### Bere e mangiare

| Comando | Effetto | Rifiuto |
|---|---|---|
| `bevi` | acqua −1, sete −4 | «Non hai sete» se la sete è al massimo 1; tanica vuota se l'acqua è 0 |
| `mangia qualcosa` | cibo −1, fame −3 | «Non hai fame» se la fame è al massimo 1; niente cibo se è 0 |
| `curati` | vita +3, consuma le medicine | solo con la vita al massimo 9 |
| `bevi salmastra` (al fondale) | sete −2 poi +5, vita −2 | la trappola della disperazione: Rocco lo fa |

I rifiuti «non hai sete / non hai fame» proteggono dallo spreco: le scorte sono moneta, berle senza bisogno è un errore che il gioco non lascia fare per distrazione.

### Soglie: avviso, danno, morte

| | Avviso (una volta per crisi, poi radi) | Danno | Soglia estrema |
|---|---|---|---|
| **Sete** | 6: «Hai la lingua impastata. Devi bere.» | da 9: vita −1 a turno | 13 |
| **Fame** | 7: «Lo stomaco è un nodo stretto.» | da 11: vita −1 a turno | 15 |

**La morte dice la causa.** La sete sale di 1 ogni 3 turni: da 9 a 13 ne servono 12, mentre la vita (10) si esaurisce in 10. Quindi, in pratica, si muore sempre a **vita 0** mentre sete o fame fanno il danno. Il collaudo dei finali (`collaudo/finali.py`) ha scoperto che per questo le frasi «La sete ti ha avuto» e «La fame ti ha fermato» non comparivano mai. Ora la morte a vita 0 legge la causa:

```favella
Quando la vita è al massimo 0 e la sete è almeno 9: … perdi "La sete ti ha avuto prima di casa.".
Quando la vita è al massimo 0 e la sete è meno di 9 e la fame è almeno 11: … perdi "La fame ti ha fermato lungo la strada.".
Quando la vita è al massimo 0 e la sete è meno di 9 e la fame è meno di 11: … perdi "Il viaggio finisce qui.".
```

Le tre condizioni si escludono: scatta sempre una sola frase. Le soglie estreme (13 e 15) restano come rete per i salti bruschi (per esempio `bevi salmastra`).

### La vita che risale
La vita ha un tetto di 10 e risale **piano**, solo se il corpo sta bene: con sete e fame al massimo 3, fuori dai luoghi di scontro (serra, casello, guado), una volta ogni tanto (`càpita (1 su 6)`) torna su di 1. Le medicine danno +3 subito. Così una ferita di Vito si recupera camminando bene, ma non durante la rissa.

## 3. L'acqua come moneta

Niente prezzi dinamici nel motore: ogni scambio è **cablato** in un'opzione di dialogo, condizionata e con conseguenza. È coerente con la fiction: in un mondo secco, l'acqua *è* il prezzo.

**Da dove viene l'acqua:**

| Fonte | Zona | Quanto | Condizione |
|---|---|---|---|
| Nunzio, l'orologio | Z1 | +3 | avere l'orologio |
| Nunzio, faticare | Z1 | +1 (fame +2) | acqua al massimo 2 |
| Il pozzo di Saverio | Z2 | +5, poi fango +2 | fiducia di Saverio almeno 2 |
| La pompa della diga | Z3 | +12 (con la damigiana) o +8, poi +3 a volta | filtro + pastiglie, `usa le pastiglie sulla pompa` |
| Ciro, il mercato | Z5 | +2…+4 per oggetto | merce da scambiare (vedi `04-oggetti.md`) |
| La sorgente | Z6 | +6 (fame +1) | nessuna: la prima acqua che non devi a nessuno |

**Quanta se ne può portare:** la tanica tiene 10; con la damigiana, 20. L'eccedenza si perde («il resto lo lasci andare»), così un rifornimento abbondante non diventa una riserva infinita.

**Dove va:** si beve, si regala (Iole, Rosaria: alza la fiducia), si paga (il pedaggio di Vito: 3 d'acqua), si baratta (Tore: 2 d'acqua per 3 di cibo).

**Regola di design:** ogni baratto è una scelta che costa. Dare acqua oggi è sete domani; vendere l'anello è acqua per la strada e un finale in meno.

## 4. Combattimento (GDR leggero, l'ultima carta)

Tre avversari in tutto il gioco, scritti a mano. Il protagonista è fragile, la vita risale piano (vedi sotto) e ogni scontro è evitabile.

| Avversario | Vita | Come si scioglie | Cosa costa |
|---|---|---|---|
| **Il cane** della serra (Z2) | 5 | `getta cibo` (lo distrai: via libera, niente morsi) · `attacca` col coltello (−3 a colpo) o a mani nude (−1, e lui morde) | morsi: vita −1 a turno, e 1 volta su 4 un morso a fondo; abbatterlo dà 3 di cibo (le conserve) |
| **Vito** al casello (Z4) | 7 | pagare (stecca, benzina o 3 d'acqua) · `minaccia Vito` con la pistola scarica (bluff) · `attacca` con chiave inglese o coltello (−3 a colpo) o a mani nude (−1) · aggirarlo dal sottopasso | il suo tubo di ferro: vita −2 a ogni turno di rissa, e 1 volta su 4 un colpo in più |
| **Cosimo** al guado (Z7) | — | la via umana (`usa la lettera su Cosimo`) · la via violenta (`attacca Cosimo` col fucile) | la via violenta chiude i tre finali «di ritorno»; a mani nude non si ottiene niente |

Cosimo non ha un contatore di vita di proposito: non è un nemico da consumare. O lo si riconosce, o gli si spara.

Schema tipico (il cane):

```favella
Invece di attacca il cane se lo stato del cane è minaccioso e il giocatore ha il coltello: … diminuisci la vita del cane di 3.
Invece di attacca il cane se lo stato del cane è minaccioso: … diminuisci la vita del cane di 1.
Ogni turno se il giocatore è in la serra e lo stato del cane è minaccioso: dire "Il cane ti azzanna il polpaccio." e adesso diminuisci la vita di 1.
Quando la vita del cane è al massimo 0: … lo stato del cane è abbattuto e adesso aumenta il cibo di 3.
```

## 5. Relazioni (fiducia)

Un contatore di fiducia per i **cinque personaggi maggiori**, tutti a 1 in partenza. I minori reagiscono a stati e oggetti, non a un contatore (meno stato).

| Personaggio | Come cresce | Soglia | Cosa apre |
|---|---|---|---|
| Saverio | +2 regalandogli del cibo | 2 | `attingi` al pozzo |
| Iole | +2 regalandole acqua o cibo | 2 | il casotto (pastiglie, damigiana) |
| Vito | +1 pagando; −1 minacciandolo | — | il tono delle battute dopo il passaggio |
| Rosaria | +1 regalandole acqua; +2 se curi Pasquale | 3 | il permesso di salire alle colline |
| Onofrio | +2 mostrandogli il giocattolo o il santino | 3 | il lascito: la lettera oppure il fucile |

Le soglie si leggono sempre con `almeno` / `al massimo`, mai con l'uguaglianza esatta: la fiducia può scendere sotto zero senza rompere nulla.

## 6. Inventario

```favella
Il giocatore può portare 7 oggetti.
Il giocatore ha la tanica.
Il giocatore ha il biglietto.
```

- **Sette posti**, due già occupati da tanica e biglietto. La tanica non si lascia («La tanica non la molli»), il biglietto sì.
- `acqua` e `cibo` sono **contatori**, non occupano posti.
- La bisaccia stretta è la scelta tematica: in Z3 e Z4 ci sono più cose di quante se ne possano portare, e gli oggetti-memoria (giocattolo, anello, santino) si contendono il posto con la merce di scambio.
- Attenzione: un oggetto messo in inventario da una regola (`… è in inventario`) ignora la capienza. Per questo il gioco non lo fa mai: il lasciapassare di Vito, la lettera e il fucile di Onofrio vengono posati nella stanza, e il giocatore li prende da sé, a mani contate.

## 7. Quadro d'insieme dello stato

| Variabile | Tipo | Iniziale | Letta da |
|---|---|---|---|
| `vita` | contatore | 10 | morte, `curati` |
| `sete`, `fame` | contatori | 0 | avvisi, danno, morte, rifiuti di `bevi`/`mangia` |
| `acqua`, `cibo` | contatori | 3, 2 | bere, mangiare, baratti, passaggi |
| `fiducia di …` ×5 | contatori | 1 | dialoghi, passaggi |
| `vita del cane`, `vita di Vito` | contatori | 5, 7 | scontri |
| stati dei luoghi | stati | — | pozzo (pieno/vuoto), pompa (secca/attiva), casello (chiuso/aperto), grata, permesso, lascito |
| stati delle persone | stati | — | cane, Vito, Pasquale, Peppe (qui/preso/lasciato/compagno/fuggito), Cosimo (fermo/riconosciuto/abbattuto) |
| soglie di passaggio | stati | nuovo | crinale, condotta, discesa, salita: frasi dette una volta sola |

Nessuna variabile è tracciata se nessuna regola la legge.

## 8. Comando di scheda

```favella
"stato" è un comando senza oggetto.
```

Mostra vita, sete, fame, acqua e cibo a parole. L'interfaccia dell'app legge gli stessi contatori e li disegna come barre con le soglie visibili (6/9 per la sete, 7/11 per la fame).

## 9. Semantica del motore verificata sul gioco

Le trappole che hanno guidato la scrittura, tutte verificate a runtime:

1. **I contatori non hanno limite inferiore.** Ogni consumo di una scorta è protetto da un `se … è almeno N`. Sete e fame hanno un «pavimento» cosmetico (tornano a 0 al turno dopo).
2. **L'interpolazione in `dire` legge il valore prima delle conseguenze** della stessa regola. Il feedback descrive il gesto («affondi la lama»), i numeri si leggono con `stato`.
3. **`Quando` scatta a ogni fronte di salita**, non una volta sola: le frasi d'occasione hanno sempre uno stato di guardia (`… e lo stato della discesa è nuova`).
4. **Una regola con un bersaglio specifico vince su una generica**, indipendentemente dall'ordine nel file.
5. **I sinonimi (`è come`) non valgono per i verbi personalizzati**: per questo `getta cibo`, `getta il cibo`, `lancia cibo`, `lancia il cibo` sono dichiarati uno per uno.
6. **Il parser risponde «Non vedo…» prima di valutare le regole**: una regola su un oggetto lontano non scatta mai.
7. **Le varianti condizionali (descrizioni, battute) seguono «la prima vera vince»**; più regole di finale sulla stessa soglia si chiudono alla prima, perché la partita termina.
8. **Posto iniziale (motore 1.1):** gli oggetti descritti nella stanza hanno la loro frase `Il posto di …`, che sparisce appena l'oggetto viene preso.

## 10. Collaudo

- `collaudo/finali.py` gioca una partita per ciascuno dei 9 finali dichiarati (6 di storia e 3 morti) e fallisce se un finale scritto nei .fav non è raggiunto, o se una partita ne produce due.
- `collaudo/mirate.py` difende otto situazioni precise (guardie di bevi/mangia, cane, Vito nei suoi tre modi, Rosaria, Onofrio).
- `collaudo/esploratore.py` gioca centinaia di partite a caso con caratteri diversi (curioso, maldestro, sconsiderato, chiacchierone, turista) e segnala eccezioni, testi rotti, scorte negative, uscite o oggetti incoerenti, conversazioni senza risposte.
