# IL VIAGGIATORE — La ramificazione

> Pre-produzione · Strato 6 · **v0.1, proposta (30/09/2026)** — da discutere prima di
> scrivere una riga di `.fav`.
> Fonte dei numeri: `sviluppo/mappa-narrativa.md`, generata da
> `strumenti/mappa-narrativa.py` leggendo `prototipo/*.fav`. Si rigenera dopo ogni
> modifica alla storia.

---

## 1. Com'è fatta oggi la storia

Il viaggio è **ricco di incontri e lineare nelle conseguenze**. La mappa lo dice coi numeri:

- **26 variabili** di stato; tolte le cinque scorte del corpo, **19 su 21 si leggono solo
  nella zona in cui nascono**. Le due che viaggiano sono entrambe di Peppe
  (`stato di Peppe`, `stato della tappa di Peppe`).
- Le **cinque fiducie** (Saverio, Iole, Vito, Rosaria, Onofrio) non escono mai dalla loro
  zona. Eppure l'interfaccia le tiene a lato dello schermo per tutto il viaggio, come se
  contassero ancora.
- **15 cose** contano lontano da dove nascono, ma quasi tutte sono merce per Ciro. Le
  cose che portano *significato* da una zona all'altra sono cinque: le medicine (Z4 → Z5),
  il giocattolo e l'anello (Z5 → Z7), la lettera e il fucile (Z6 → Z7).
- I **sei finali** dipendono da quattro cose, tutte decise nelle ultime due zone: lo stato
  di Cosimo, Peppe, il giocattolo, l'anello.
- **Il guado** ha 5 opzioni di dialogo e **nessuna** ha un effetto: il confronto col
  fratello si decide solo con un oggetto.

Il grafo, a livello di zone, è un **collo di bottiglia**: ogni zona si apre e si chiude su
sé stessa, e a Z5–Z6 si raccolgono i quattro interruttori dei finali.

```
Z1 ─► Z2 ─► Z3 ─► Z4 ─► Z5 ──────────► Z6 ─────────► Z7 ─► ★ A B C D E F
                         │ Peppe ───────────────────► │
                         │ giocattolo, anello ───────►│
                         │ medicine (da Z4)           │
                                        lettera/fucile►│
```

## 2. Audit

| Anti-pattern | Dove | Perché pesa qui |
|---|---|---|
| **Scena amnesia** | Z5, Z6, Z7 | Come sei passato dalla serra (il cane) e dal casello (Vito) non lo ricorda nessuno. Il paese accoglie allo stesso modo chi ha bastonato Vito e chi l'ha pagato. |
| **Meter invisibili che promettono memoria** | le cinque fiducie | Lo schermo le mostra fino alla fine; la storia le dimentica appena si cambia zona. |
| **Scelta cosmetica nel climax** | Z7, «Non sapevo» / «Fammi passare» | Le due risposte a Cosimo portano allo stesso punto. Decide solo l'oggetto in tasca. |
| **Bivio che chiude troppo presto** | Z6, il lascito | Chi sceglie il fucile non ha più una via umana al guado, qualunque cosa abbia fatto nei sei giorni prima. |
| **Il tema non si accumula** | tutto | La domanda del gioco è «cosa resterà di te quando arrivi». Oggi resta ciò che hai in tasca, non ciò che hai fatto. |

Cosa funziona e va protetto: Peppe (l'unico filo vero, e si sente), la verità sulla
famiglia composta da fonti diverse, i finali che atterrano in posti emotivi diversi, la
violenza sempre possibile e sempre la più cara.

## 3. La proposta: due fili che attraversano il viaggio

La regola d'oro della skill vale doppio in FAVELLA: **stato minimo**. Due contatori nuovi,
più una lettura nuova di variabili che già esistono. Nessuna zona nuova, nessun
personaggio nuovo, **nessun finale nuovo**: una via nuova verso quelli che ci sono.

La giustificazione nel mondo c'è già, scritta dall'autore: «Qui le cose si sanno prima di
sera» (Pasquale), «Rosaria ha mandato a dire che sei uno a posto» (Tore), «dicono giù al
paese» (Tore su Cosimo). **La voce corre lungo la strada, e arriva prima di te.**

### Filo 1 — Il sangue (come sei passato)

`SANGUE` — contatore, parte da 0.

| Dove | Quando | Effetto |
|---|---|---|
| Z2 serra | il cane muore per mano tua | SANGUE += 1 |
| Z4 casello | colpisci Vito (la prima volta) | SANGUE += 1 |
| Z4 casello | Vito a terra | SANGUE += 1 |

Il bluff con la pistola scarica **non** conta: è paura, non sangue. (Da decidere, §6.)

Chi lo legge, più avanti:

```
[Z5_OSTERIA_PRIMA] L'accoglienza di Rosaria
Richiede: SANGUE >= 1, prima volta all'osteria
Testo: "La voce della statale è arrivata prima di te. Rosaria ti mette davanti l'acqua
        lo stesso, perché qui si fa così, ma non si siede."
Effetti: FIDUCIA_ROSARIA -= 1   → per il permesso servono un dono e Pasquale, non uno solo
Note: il costo è concreto (più tempo in paese = più sete) e non chiude nessuna via.

[Z5_CIRO] Ciro, creditore di Vito
Richiede: SANGUE >= 2 e VITO abbattuto
Testo: una battuta sola, al primo incontro: il debito di Vito non lo riscuoterà più.
Effetti: nessuno (livello immediato: il mondo ha sentito).

[Z7_COSIMO_INIZIO] La prima battuta di Cosimo cambia
Richiede: SANGUE >= 2
Testo: Cosimo sa del casello. "Sei tornato come torna la gente adesso: a spintoni."
Effetti: nessuno sul confronto, ma chiude la via del §3.3 (vedi sotto).
```

### Filo 2 — Chi è rimasto (quello che hai lasciato per strada)

`DONI` — contatore, parte da 0. Conta **una volta per persona**: non si compra.

| Dove | Scelta | Effetto |
|---|---|---|
| Z2 pozzo | il cibo a Saverio | DONI += 1 |
| Z3 diga | l'acqua o il cibo a Iole (la prima volta) | DONI += 1 |
| Z5 osteria | l'acqua per l'ospitalità di Rosaria (la prima volta) | DONI += 1 |
| Z5 vicolo | le medicine a Pasquale | DONI += 1 |

Ognuna di queste scelte **costa già** qualcosa che serve a sopravvivere. Il filo non le
rende più convenienti: le fa ricordare.

```
[Z6_ONOFRIO_VERITA] La febbre
Richiede: PASQUALE = curato
Testo: Onofrio racconta dell'estate della febbre, come oggi; poi, a parte: "Giù al paese
       hai rimesso in piedi uno con la febbre, mi hanno detto. Qui, quell'estate, le
       medicine non le aveva nessuno." Riprende a intagliare.
Effetti: nessuno. È memoria, non meccanica: fa male, ed è il punto.
```

### 3.3 Il bivio nuovo al guado: il fucile posato

Oggi chi arriva col fucile ha una sola azione possibile. Con i due fili, **il viaggio
decide se il fucile si può posare**.

```
[Z7_GUADO] [!] Cosimo, col fucile in mano
Richiede: FUCILE in bisaccia, COSIMO = fermo
Scelte:
  A) attacca Cosimo                → COSIMO = abbattuto            (com'è oggi) ★ E / F
  B) lascia il fucile              ⇒ [Z7_FUCILE_POSATO]            (nuovo)
  C) parla con Cosimo              → [Z7_COSIMO_INIZIO]

[Z7_FUCILE_POSATO] Il fucile tra i sassi
Testo: posi il fucile sul greto, la canna verso l'acqua.
Scelte (una sola scatta, in ordine):
  ⇒ se SANGUE >= 1:
       Cosimo guarda il fucile, poi te. "Al casello l'hai posato anche lì?" Non si
       sposta. Il fucile resta dov'è: puoi riprenderlo.          → [Z7_GUADO]
  ⇒ se DONI >= 3:
       Cosimo ha sentito dire di uno che per strada lasciava l'acqua a chi era rimasto.
       Non ti riconosce subito: riconosce il gesto.             → COSIMO = riconosciuto
       Effetti: FUCILE = nel greto (non si riprende) | COSIMO_COME = fucile_posato
  ⇒ altrimenti:
       Cosimo non si muove. "Posarlo non basta. Che ne so io di chi sei diventato?"
                                                                  → [Z7_GUADO]
Note: la via umana resta da GUADAGNARE, come chiedeva 05-personaggi.md. Con la lettera
      si guadagna in Z6; col fucile si guadagna in tutto il viaggio, e il sangue la chiude.
```

Da qui si arriva ai finali di sempre (A, B, C, D): Cosimo è *riconosciuto*. Cambia il modo,
e con lui qualche riga: nella descrizione di Cosimo non tiene la lettera ma guarda il
fucile tra i sassi; sulla soglia il finale sa che non gli hai portato niente di scritto.

### 3.4 I finali raccolgono il viaggio

Nessun finale nuovo: **una riga in più**, scelta dallo stato, nel testo della soglia.

| Finale | Se | Riga (bozza di tono, da rifinire con `prosa-italiana`) |
|---|---|---|
| E, F (abbattuto) | SANGUE >= 2 | il cane della serra, Vito, il fratello: la strada fino a casa segnata dalle stesse mani |
| A, B, C | DONI >= 3 | la brocca di Rosaria, il pozzo di Saverio: qualcuno, lungo la strada, apparecchia ancora per te |
| D (mani vuote) | DONI >= 3 | «di loro non hai niente», ma per strada hai lasciato acqua a chi è rimasto: il vuoto è meno vuoto |

## 4. I futuri possibili al guado (il funnel)

Con i due fili, chi arriva al valico sta in uno di questi futuri. Tra parentesi, dove si
è deciso.

| Futuro | Si arriva con | Al guado può |
|---|---|---|
| **La lettera** | Onofrio convinto, lettera (Z5–Z6) | riconoscere, come oggi |
| **Il fucile, mani pulite, mani aperte** | fucile, SANGUE 0, DONI ≥ 3 (Z2–Z5) | posare il fucile e farsi riconoscere, oppure sparare |
| **Il fucile, mani pulite, mani chiuse** | fucile, SANGUE 0, DONI < 3 | solo sparare (posarlo non basta) |
| **Il fucile, mani sporche** | fucile, SANGUE ≥ 1 | solo sparare; Cosimo sa perché |

Il primo punto di biforcazione che conta per il finale si sposta **da Z6 a Z2**: la serra
e il pozzo, le prime due scelte vere del gioco.

## 5. Specifiche di stato

| Variabile | Tipo | Iniziale | Si scrive | Si legge |
|---|---|---|---|---|
| `SANGUE` | contatore | 0 | Z2 (cane), Z4 (Vito ×2) | Z5 (Rosaria, Ciro), Z7 (Cosimo, fucile posato, finali E/F) |
| `DONI` | contatore | 0 | Z2 (Saverio), Z3 (Iole), Z5 (Rosaria, Pasquale) | Z7 (fucile posato, finali A–D) |
| `COSIMO_COME` | stato | — | Z7 | Z7 (descrizione di Cosimo, righe dei finali) |
| `stato di Pasquale` | già esiste | malato | Z5 | **anche** Z6 (Onofrio) |

Per il «una volta per persona» dei doni servono guardie: per Pasquale basta lo stato che
esiste; Saverio, Iole e Rosaria oggi accettano lo stesso dono più volte (l'opzione chiede
solo di avere acqua o cibo), quindi l'incremento va condizionato alla fiducia di partenza.

## 6. Decisioni da prendere prima di scrivere

1. **Il fucile posato è la via giusta?** È l'unico cambiamento che tocca l'esito; tutto il
   resto è memoria e costo. Alternativa più prudente: solo memoria (§3.1, 3.2, 3.4), senza
   bivio nuovo.
2. **Soglia dei doni: 3 su 4?** Con 3 serve generosità vera; con 2 diventa quasi automatico.
3. **Il bluff con la pistola è sangue?** Proposta: no. Ma Vito, umiliato, lo racconta.
4. **Rosaria che parte più fredda** allunga il paese di qualche turno: accettabile in
   sopravvivenza? (Il collaudo lo misura.)
5. **Nomi FAVELLA** dei contatori: proposta «Il sangue» e «La generosità» (o «Il ricordo»).

## 7. Impatto sul progetto

- **Salvataggi:** cambia l'impronta dell'avventura; i salvataggi si ricaricano rigiocando i
  comandi e il gioco lo dice. È una **minor** (`sviluppo/VERSIONI.md` §2).
- **Collaudi:** un percorso nuovo in `collaudo/percorsi.py` per il fucile posato; prove
  mirate per ogni lettura dei fili (Rosaria fredda, Onofrio e la febbre, Cosimo che sa del
  casello, il fucile posato che non basta). `pulsanti.py` deve giocare anche il percorso
  nuovo senza tastiera: «lascia il fucile» è già un pulsante del menu della bisaccia.
- **Interfaccia:** niente di nuovo da costruire. Si può valutare di non mostrare più le
  fiducie di chi è rimasto indietro, o di mostrarle proprio perché ora contano.
- **Mappa:** dopo la scrittura, `strumenti/mappa-narrativa.py` deve mostrare `sangue` e
  `generosità` come conseguenze a distanza. È il criterio di riuscita misurabile.

## 8. Ordine di lavoro (a strati)

1. Decisioni del §6.
2. Filo 2 e Filo 1 solo come memoria (§3.1, 3.2): nessun esito cambia, si collauda subito.
3. Il fucile posato (§3.3) con il suo percorso di collaudo.
4. Le righe dei finali (§3.4), scritte e riviste con la skill `prosa-italiana`.
5. Mappa rigenerata, audit di nuovo, poi versione.
