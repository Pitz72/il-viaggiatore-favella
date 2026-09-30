# IL VIAGGIATORE — La ramificazione

> Pre-produzione · Strato 6 · **v1.0, realizzato nel gioco 1.5.0 (30/09/2026)**
> Fonte dei numeri: `sviluppo/mappa-narrativa.md`, generata da
> `strumenti/mappa-narrativa.py` leggendo `prototipo/*.fav`. Si rigenera dopo ogni
> modifica alla storia. Collaudo dedicato: `collaudo/fili.py`.

---

## 1. Com'era la storia (1.4.0)

Il viaggio era **ricco di incontri e lineare nelle conseguenze**:

- **26 variabili** di stato; tolte le cinque scorte del corpo, **19 su 21 si leggevano solo
  nella zona in cui nascevano**. Le due che viaggiavano erano entrambe di Peppe.
- Le **cinque fiducie** non uscivano mai dalla loro zona, mentre l'interfaccia le tiene a
  lato dello schermo per tutto il viaggio.
- I **sei finali** dipendevano da quattro cose, tutte decise nelle ultime due zone: lo stato
  di Cosimo, Peppe, il giocattolo, l'anello.
- **Il guado** aveva 5 opzioni di dialogo e nessuna con un effetto: il confronto col
  fratello si decideva solo con un oggetto. Chi sceglieva il fucile da Onofrio poteva solo
  sparare.

| Anti-pattern | Dove | Com'è stato risolto |
|---|---|---|
| **Scena amnesia** | Z5, Z6, Z7 | Rosaria, Ciro, Tore, Onofrio e Cosimo ricordano come sei passato (§3) |
| **Meter che promettono memoria** | le fiducie | la generosità verso chi è rimasto conta al guado (§3.2) |
| **Bivio che chiude troppo presto** | Z6, il lascito | col fucile c'è una terza via: posarlo (§3.3) |
| **Il tema non si accumula** | tutto | la strada di Acquamorta dice che cosa si è saputo di te (§3.4) |

Protetto e intatto: Peppe, la verità sulla famiglia da fonti diverse, i sei finali, la
violenza sempre possibile e sempre la più cara.

## 2. La regola del mondo: la voce corre

La giustificazione era già scritta nel gioco: «Qui le cose si sanno prima di sera»
(Pasquale), «Rosaria ha mandato a dire…» (Tore), «dicono giù al paese» (Tore su Cosimo).
Ora ha una rete precisa, che Cosimo racconta sulla strada: **Rosaria manda un ragazzo su
dai pastori, e i pastori scendono al greto per le bestie**. Ciò che fai per strada arriva
al guado prima di te.

## 3. I due fili

### 3.1 Il sangue (come sei passato)

`il sangue` — contatore, parte da 0. Il bluff con la pistola scarica **non** conta: non muore
nessuno (decisione dell'autore).

| Dove | Quando | Effetto |
|---|---|---|
| Z2 serra | il cane muore per mano tua | +1 |
| Z4 casello | colpisci Vito (quando diventa ostile) | +1 |
| Z4 casello | Vito a terra | +1 |

Chi lo ricorda:

- **Rosaria** (Z5), alla prima volta all'osteria: l'ospitalità non si nega (acqua e legumi
  come sempre), ma non si siede; due uomini scesi dalla statale smettono di parlare; lei ti
  guarda le mani. **Fiducia − 1**: per il permesso servono un dono e Pasquale.
- **Ciro** (Z5), se Vito è a terra, entrando al mercato, una volta: «Quello del casello.»
  Vito gli doveva una tanica.
- **Tore** (Z6): «Rosaria ha mandato a dire di lasciarti passare. Ha mandato a dire anche il
  resto.»
- **Cosimo** (Z7), la prima battuta: ti guarda le mani prima della faccia, «so anche come
  sei passato».
- **Il guado**: col sangue, il fucile posato non basta mai subito (§3.3).
- **La strada di Acquamorta**, se Cosimo ti lascia passare: «Di come sei passato, si è
  saputo anche qui.»

### 3.2 La generosità (quello che hai lasciato a chi è rimasto)

`la generosità` — contatore, parte da 0. **Una volta per persona**: ridare non conta di nuovo.

| Dove | Scelta | Come si conta una volta sola |
|---|---|---|
| Z2 pozzo | il cibo a Saverio | la fiducia di Saverio arriva a 3 (non cala mai) |
| Z3 diga | l'acqua o il cibo a Iole | la fiducia di Iole arriva a 3 (non cala mai) |
| Z5 osteria | l'acqua a Rosaria | la brocca a parte (`stato della brocca`) si riempie |
| Z5 vicolo | le medicine a Pasquale | Pasquale curato |

Ognuna costa già qualcosa che serve a sopravvivere: il filo non le rende convenienti, le fa
ricordare. Soglia che conta al guado: **3 su 4**.

Chi la ricorda: **Cosimo**, la prima battuta («Dicono che per strada lasci l'acqua a chi è
rimasto. A me non l'ha lasciata nessuno.»); **il guado** (§3.3); **la strada** («Lo so da
tre giorni, che arrivavi. So anche dove hai lasciato l'acqua.»).

In più, una memoria senza meccanica: **Onofrio** sa di Pasquale. «Giù al paese hai rimesso
in piedi uno con la febbre, mi hanno detto. Quell'estate, qui, le medicine non le aveva
nessuno.» È la febbre che ha portato via il piccolo.

### 3.3 La terza via al guado: il fucile posato e la veglia

```
[Z7_GUADO] [!] Cosimo, col fucile in mano
All'arrivo: Cosimo guarda il fucile prima di guardare te.
Scelte:
  A) attacca Cosimo        → COSIMO = abbattuto                    ★ E / F
  B) lascia il fucile      ⇒ il viaggio decide:
       · sangue 0 e generosità ≥ 3  → riconosciuto subito        ★ A B C D
         «Quello che lasciava l'acqua per strada.» Apre il fucile, si mette le cartucce
         in tasca, si sposta di un passo.
       · sangue 0, generosità < 3   → «Posarlo non basta. Che ne so io di chi sei
         diventato, per strada?»      ⇒ [Z7_VEGLIA] 3 turni
       · sangue ≥ 1                 → «E per strada? L'hai posato anche lì?»
                                      ⇒ [Z7_VEGLIA] 5 turni
  C) parla con Cosimo      → [Z7_COSIMO_INIZIO]

[Z7_VEGLIA] Il fucile tra i sassi, e tu che resti
Ogni turno al guado conta (ASPETTA). Cosimo non se ne va:
  2 · guarda il fucile, poi l'acqua
  3 · senza sangue: si siede su una pietra, i pomeriggi da ragazzi a tirare sassi;
      apre il fucile e si sposta                            → riconosciuto ★ A B C D
  3 · col sangue: «Chi alza le mani per strada non le posa per sempre al guado.»
  4 · col sangue: il sole sul greto, la gola di sabbia       (sete + 1)
  5 · col sangue: «Sei ancora capace di stare fermo. Almeno questo.» → riconosciuto
Rompe la veglia, e si ricomincia da capo:
  · riprendere il fucile («Annuisce appena, come chi aveva scommesso proprio su questo.»);
  · alzare le mani su Cosimo.
```

Perché così: il pilastro «la violenza è sempre possibile, mai l'unica via» ora vale anche
per chi ha scelto il fucile. Il prezzo del sangue non è una porta chiusa ma **il tempo e la
sete**: più hai fatto male per strada, più a lungo devi restare disarmato davanti a tuo
fratello. La lettera resta la via piena: funziona subito, anche col sangue.

Da qui si arriva ai finali di sempre (A, B, C, D): Cosimo è *riconosciuto*. Cambia il modo
(`stato del riconoscimento`: lettera, fucile, veglia) e con lui la descrizione di Cosimo:
non tiene la lettera ma il fucile aperto sul braccio, scarico.

### 3.4 La strada di Acquamorta ricorda

Una riga sola, la prima volta che si percorre la strada verso casa, prima della soglia:

| Se | Riga |
|---|---|
| Cosimo riconosciuto, col sangue | alla fontana secca Cosimo ti raggiunge: «Di come sei passato, si è saputo anche qui.» |
| Cosimo riconosciuto, generosità ≥ 3 | Cosimo ti raggiunge e ti dice della rete della voce: «Lo so da tre giorni, che arrivavi.» |
| altrimenti (anche Cosimo abbattuto) | sul muro della prima casa, a carbone, le partenze: l'ultimo nome è il tuo, di tre giorni fa |

I sei finali sono rimasti com'erano: la memoria del viaggio arriva un passo prima della
soglia, e lascia al finale il suo spazio.

## 4. I futuri possibili al guado

| Futuro | Si arriva con | Al guado |
|---|---|---|
| **La lettera** | Onofrio convinto, lettera (Z5–Z6) | riconoscere subito |
| **Il fucile, mani pulite e aperte** | fucile, sangue 0, generosità ≥ 3 (Z2–Z5) | posarlo e farsi riconoscere subito, oppure sparare |
| **Il fucile, mani pulite** | fucile, sangue 0, generosità < 3 | la veglia breve, oppure sparare |
| **Il fucile, mani sporche** | fucile, sangue ≥ 1 | la veglia lunga e assetata, oppure sparare |

Il primo bivio che pesa sul modo di arrivare a casa è **la serra**, la seconda zona.

## 5. Specifiche di stato (aggiunte)

| Variabile | Tipo | Iniziale | Si scrive | Si legge |
|---|---|---|---|---|
| `il sangue` | contatore | 0 | Z2 (cane), Z4 (Vito ×2) | Z5 (Rosaria), Z6 (Tore), Z7 (Cosimo, fucile posato, veglia, strada) |
| `la generosità` | contatore | 0 | Z2, Z3, Z5 (×2) | Z7 (Cosimo, fucile posato, strada) |
| `stato della brocca` | stato | vuota | Z5 (dono a Rosaria) | Z5 (la generosità una volta sola) |
| `stato del mercato` | stato | nuovo | Z5 | Z5 (Ciro, una volta sola) |
| `stato del riconoscimento` | stato | nessuno | Z7 | Z7 (descrizione di Cosimo) |
| `la veglia` | contatore | 0 | Z7 | Z7 |
| `stato della veglia` | stato | spenta | Z7 | Z7 |
| `stato dell'arrivo`, `stato della strada` | stati | nuovo, nuova | Z7 | Z7 (una volta sola) |
| `stato di Pasquale` | già esisteva | malato | Z5 | **anche** Z6 (Onofrio) |

Nota tecnica: i «Quando» che contano la generosità scattano a fine turno. Un dono fatto in
un dialogo si registra al primo turno che passa dopo (i dialoghi non fanno passare il tempo).

## 6. Decisioni

1. **Il fucile posato**: l'autore ha chiesto di estendere quel pezzo di storia il più
   possibile. Oltre al gesto che basta, è nata la **veglia**, così che nessuno sia costretto
   a sparare e il sangue abbia un prezzo in tempo e sete.
2. **La generosità**: 3 doni su 4, una volta per persona.
3. **Il bluff con la pistola**: non è sangue, perché non muore nessuno.
4. **Rosaria più fredda** col sangue: accettato.
5. **I nomi**: «il sangue» e «la generosità».

## 7. Impatto

- **Salvataggi**: l'impronta dell'avventura è cambiata; i salvataggi si ricaricano
  rigiocando i comandi e il gioco lo dice. Versione **minor**: 1.5.0.
- **Collaudi**: due percorsi nuovi (`G_posato`, `H_veglia`: il cane ucciso, il fucile
  posato, la veglia lunga) in `finali.py` e `pulsanti.py`; `fili.py` con 35 prove.
- **Mappa**: le conseguenze a distanza passano da **2 a 6** (sangue, generosità, vita di
  Vito, Pasquale, e i due di Peppe).

## 8. Cosa resta aperto

- Le fiducie restano mostrate a lato dello schermo; ora la generosità verso di loro conta,
  ma il numero di ciascuno no. Si può valutare di mostrare i fili invece delle fiducie, o
  di lasciare il sangue e la generosità invisibili (scelta attuale: invisibili, si vedono
  solo nelle conseguenze).
- Altri fili possibili, se servirà: Vito umiliato dal bluff che lo racconta; Peppe che sa
  del sangue quando si unisce a te.
