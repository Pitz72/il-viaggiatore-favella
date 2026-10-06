# Mappa narrativa — la memoria della storia

> Generata da `strumenti/mappa-narrativa.py` leggendo `prototipo/*.fav`. Non modificare
> a mano: si rigenera. Il commento e il progetto stanno in
> `pre-produzione/06-ramificazione.md`.

## 1. Le zone

| Zona | | Luoghi | Chi parla (nodi di dialogo) | Opzioni | con effetti | condizionate |
|---|---|---:|---|---:|---:|---:|
| storia | l'avventura (file principale) | 0 | — | 0 | 0 | 0 |
| sistemi | il corpo e le scorte | 0 | — | 0 | 0 | 0 |
| Z1 | Acquaviva | 5 | Nunzio 6 | 13 | 12 | 3 |
| Z2 | la piana | 5 | Saverio 4 | 5 | 1 | 1 |
| Z3 | l'invaso | 7 | Iole 7, Rocco 3 | 15 | 2 | 2 |
| Z4 | la statale | 6 | Vito 9, Imma 12 | 22 | 10 | 10 |
| Z5 | il paese | 7 | Rosaria 11, Concetta 4, Pasquale 2, Peppe 9, Ciro 5 | 51 | 33 | 22 |
| Z6 | le colline | 6 | Onofrio 12, Tore 8 | 23 | 14 | 7 |
| Z7 | il guado | 3 | Cosimo 9 | 5 | 3 | 2 |

## 2. Le variabili: dove si scrivono, dove si leggono

Una variabile che si legge solo nella zona in cui si scrive è **memoria locale**: la
scelta si spegne lì. Una che si legge più avanti è una **conseguenza a distanza**.

| Variabile | Nasce | Si scrive in | Si legge in | Portata |
|---|---|---|---|---|
| acqua | storia | sistemi (5), Z1 (3), Z2 (2), Z3 (4), Z4 (1), Z5 (9), Z6 (2) | sistemi (7), Z1 (3), Z2 (2), Z3 (3), Z4 (1), Z5 (11), Z6 (1) | scorta (ovunque) |
| cibo | storia | sistemi (3), Z1 (1), Z2 (4), Z3 (1), Z4 (2), Z5 (12), Z6 (1) | sistemi (5), Z1 (1), Z2 (2), Z3 (1), Z4 (3), Z5 (2) | scorta (ovunque) |
| fame | storia | storia (1), sistemi (4), Z1 (1), Z2 (1), Z5 (5), Z6 (1) | storia (1), sistemi (11), Z4 (1) | scorta (ovunque) |
| generosità | storia | Z2 (1), Z4 (1), Z5 (2) | Z6 (1), Z7 (3) | **a distanza** |
| sangue | storia | Z2 (1), Z4 (2) | Z5 (10), Z6 (1), Z7 (8) | **a distanza** |
| sete | storia | storia (1), sistemi (4), Z2 (1), Z3 (6), Z5 (4), Z6 (1), Z7 (1) | storia (1), sistemi (12) | scorta (ovunque) |
| stato della voce del bluff | storia | Z5 (1) | — | letta dall'interfaccia |
| stato della voce del sangue | storia | Z5 (3) | — | letta dall'interfaccia |
| stato della voce della generosità | storia | Z5 (3) | — | letta dall'interfaccia |
| vita | storia | storia (1), sistemi (3), Z2 (2), Z3 (1), Z4 (3), Z5 (4) | storia (1), sistemi (4), Z4 (1) | scorta (ovunque) |
| stato della gola | sistemi | sistemi (2) | sistemi (2) | locale |
| stato della pancia | sistemi | sistemi (2) | sistemi (2) | locale |
| stato del discorso di nunzio | Z1 | Z1 (9) | Z1 (1) | locale |
| stato della foto | Z1 | Z1 (1) | Z1 (2) | locale |
| fiducia di saverio | Z2 | Z2 (1) | Z2 (4), Z7 (12) | **a distanza** |
| stato del cane | Z2 | Z2 (2) | Z2 (10), Z7 (12) | **a distanza** |
| stato del crinale | Z2 | Z2 (1) | Z2 (1) | locale |
| stato del pozzo | Z2 | Z2 (1) | Z2 (4) | locale |
| stato del ringhio | Z2 | Z2 (1) | Z2 (3) | locale |
| vita del cane | Z2 | Z2 (2) | Z2 (1) | locale |
| fiducia di iole | Z3 | Z3 (2) | Z3 (3) | locale |
| stato della condotta | Z3 | Z3 (1) | Z3 (1) | locale |
| stato della pompa | Z3 | Z3 (2) | Z3 (6), Z7 (12) | **a distanza** |
| fiducia di vito | Z4 | Z4 (4) | Z4 (5) | locale |
| stato del bluff | Z4 | Z4 (1) | Z4 (1), Z5 (1), Z6 (1), Z7 (14) | **a distanza** |
| stato del casello | Z4 | Z4 (5) | Z4 (9) | locale |
| stato del discorso di imma | Z4 | Z4 (5) | Z4 (1) | locale |
| stato della discesa | Z4 | Z4 (1) | Z4 (1) | locale |
| stato della grata | Z4 | Z4 (1) | Z4 (2) | locale |
| stato di imma | Z4 | Z4 (2), Z5 (3) | Z4 (10), Z5 (7), Z7 (12) | **a distanza** |
| stato di vito | Z4 | Z4 (7) | Z4 (4) | locale |
| vita di vito | Z4 | Z4 (3) | Z4 (10), Z5 (2), Z7 (12) | **a distanza** |
| fiducia di rosaria | Z5 | Z5 (5) | Z5 (4) | locale |
| stato del discorso di ciro | Z5 | Z5 (6) | Z5 (1) | locale |
| stato del discorso di rosaria | Z5 | Z5 (5) | Z5 (1) | locale |
| stato del mercato | Z5 | Z5 (2) | Z5 (2) | locale |
| stato del permesso | Z5 | Z5 (1) | Z5 (2) | locale |
| stato del sapere di peppe | Z5 | Z5 (2) | Z6 (3), Z7 (6) | **a distanza** |
| stato dell'accoglienza | Z5 | Z5 (4) | Z5 (5) | locale |
| stato della brocca | Z5 | Z5 (1) | Z5 (1), Z7 (12) | **a distanza** |
| stato della domanda di peppe | Z5 | Z5 (3) | Z5 (4) | locale |
| stato della salita | Z5 | Z5 (1) | Z5 (1) | locale |
| stato della tappa di peppe | Z5 | Z5 (1), Z6 (3), Z7 (3) | Z6 (3), Z7 (3) | **a distanza** |
| stato di pasquale | Z5 | Z5 (1) | Z4 (1), Z5 (7), Z6 (1), Z7 (12) | **a distanza** |
| stato di peppe | Z5 | Z5 (3), Z7 (3) | Z5 (15), Z6 (3), Z7 (8) | **a distanza** |
| fiducia di onofrio | Z6 | Z6 (2) | Z6 (6) | locale |
| stato del discorso di onofrio | Z6 | Z6 (5) | Z6 (1) | locale |
| stato del discorso di tore | Z6 | Z6 (4) | Z6 (1) | locale |
| stato del lascito | Z6 | Z6 (2) | Z6 (6) | locale |
| stato del discorso di cosimo | Z7 | Z7 (3) | Z7 (1) | locale |
| stato del riconoscimento | Z7 | Z7 (4) | Z7 (2) | locale |
| stato dell'arrivo | Z7 | Z7 (1) | Z7 (1) | locale |
| stato della strada | Z7 | Z7 (3) | Z7 (3) | locale |
| stato della veglia | Z7 | Z7 (9) | Z7 (7) | locale |
| stato di cosimo | Z7 | Z7 (7) | Z7 (45) | locale |
| veglia | Z7 | Z7 (8) | Z7 (5) | locale |

## 3. Le cose che si portano da una zona all'altra

Le cose sono l'altra memoria del viaggio: si prendono in una zona e contano in un'altra.

| Cosa | Nasce | Conta in (possesso) | Sparisce in | |
|---|---|---|---|---|
| coltello | Z1 (casa) | Z2, Z4 | — | **a distanza** |
| mappa | Z1 (casa) | Z1 | — |  |
| orologio | Z1 (casa) | Z1, Z5 | Z1, Z5 | **a distanza** |
| cane | Z2 (serra) | — | Z2 |  |
| batteria | Z3 (relitto) | Z5 | Z5 | **a distanza** |
| borsa | Z3 (torre di presa) | Z5 | Z5 | **a distanza** |
| cristalli | Z3 (fondale) | Z5 | Z5 | **a distanza** |
| damigiana | Z3 (casotto) | sistemi, Z3, Z5 | — | **a distanza** |
| filtro | Z3 (relitto) | Z3 | Z3 |  |
| occhiali | Z3 (relitto) | Z3 | — |  |
| pastiglie | Z3 (casotto) | Z3 | Z3 |  |
| benzina | Z4 (area di servizio) | Z4, Z5 | Z4, Z5 | **a distanza** |
| cartucce | Z4 (piazzola) | Z5 | Z5 | **a distanza** |
| chiave inglese | Z4 (area di servizio) | Z4 | — |  |
| giubbotto | Z4 (piazzola) | Z5, Z6 | Z5 | **a distanza** |
| lasciapassare | Z4 (—) | Z5 | Z5 | **a distanza** |
| medicine | Z4 (area di servizio) | Z4, Z5 | Z4, Z5 | **a distanza** |
| pistola | Z4 (piazzola) | storia, Z4, Z7 | — | **a distanza** |
| stecca | Z4 (piazzola) | Z4, Z5 | Z4, Z5 | **a distanza** |
| anello | Z5 (cortile) | Z5, Z7 | Z5 | **a distanza** |
| giocattolo | Z5 (cortile) | Z6, Z7 | — | **a distanza** |
| coperta | Z6 (cappella) | Z6 | — |  |
| fucile | Z6 (—) | storia, Z6, Z7 | Z7 | **a distanza** |
| lettera | Z6 (—) | Z6, Z7 | — | **a distanza** |
| santino | Z6 (cappella) | Z6 | — |  |

## 4. I finali

| Zona | Esito | Condizione | Frase |
|---|---|---|---|
| sistemi | perdi | quando la sete è almeno 13 | La sete ti ha avuto prima di casa. |
| sistemi | perdi | quando la fame è almeno 15 | La fame ti ha fermato lungo la strada. |
| sistemi | perdi | quando la vita è al massimo 0 e la sete è almeno 9 | La sete ti ha avuto prima di casa. |
| sistemi | perdi | quando la vita è al massimo 0 e la sete è meno di 9 e la fame è almeno 11 | La fame ti ha fermato lungo la strada. |
| sistemi | perdi | quando la vita è al massimo 0 e la sete è meno di 9 e la fame è meno di 11 | Il viaggio finisce qui. |
| Z7 | termina | quando il giocatore è in la soglia e lo stato di cosimo è abbattuto e lo stato di peppe è fuggito | FINALE — La casa è tua. Il ragazzo che ti seguiva ha visto cosa sei disposto a fare per av |
| Z7 | termina | quando il giocatore è in la soglia e lo stato di cosimo è abbattuto | FINALE — Sei entrato ad Acquamorta sopra il corpo di tuo fratello. La casa è tua, e non c' |
| Z7 | vinci | quando il giocatore è in la soglia e lo stato di cosimo è riconosciuto e lo stato di peppe è compagno | FINALE — Hai trovato la casa, e hai scelto di non restarci. Qualcuno, almeno, lo porti via |
| Z7 | vinci | quando il giocatore è in la soglia e lo stato di cosimo è riconosciuto e il giocatore ha il giocattolo | FINALE — Sei tornato, e hai riportato a casa l'ultima cosa che restava da riportare. |
| Z7 | vinci | quando il giocatore è in la soglia e lo stato di cosimo è riconosciuto e il giocatore ha l'anello | FINALE — Sei tornato, e le hai riportato quello che era suo. |
| Z7 | termina | quando il giocatore è in la soglia e lo stato di cosimo è riconosciuto | FINALE — Sei arrivato a casa con le mani vuote, e la casa se n'è accorta. |

## 5. In sintesi

- Variabili dichiarate: 56 (di cui 5 scorte del corpo).
- **Conseguenze a distanza** (variabili lette in una zona successiva): 13.
  - `generosità`: si scrive in Z2, Z4, Z5, torna in Z6, Z7.
  - `sangue`: si scrive in Z2, Z4, torna in Z5, Z6, Z7.
  - `fiducia di saverio`: si scrive in Z2, torna in Z7.
  - `stato del cane`: si scrive in Z2, torna in Z7.
  - `stato della pompa`: si scrive in Z3, torna in Z7.
  - `stato del bluff`: si scrive in Z4, torna in Z5, Z6, Z7.
  - `stato di imma`: si scrive in Z4, Z5, torna in Z5, Z7.
  - `vita di vito`: si scrive in Z4, torna in Z5, Z7.
  - `stato del sapere di peppe`: si scrive in Z5, torna in Z6, Z7.
  - `stato della brocca`: si scrive in Z5, torna in Z7.
  - `stato della tappa di peppe`: si scrive in Z5, Z6, Z7, torna in Z6, Z7.
  - `stato di pasquale`: si scrive in Z5, torna in Z6, Z7.
  - `stato di peppe`: si scrive in Z5, Z7, torna in Z6, Z7.
- **Cose che contano lontano da dove nascono**: 17 — coltello, orologio, batteria, borsa, cristalli, damigiana, benzina, cartucce, giubbotto, lasciapassare, medicine, pistola, stecca, anello, giocattolo, fucile, lettera.
- **Variabili mai lette** (stato fantasma): 0 — —.
