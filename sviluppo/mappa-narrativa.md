# Mappa narrativa — la memoria della storia

> Generata da `strumenti/mappa-narrativa.py` leggendo `prototipo/*.fav`. Non modificare
> a mano: si rigenera. Il commento e il progetto stanno in
> `pre-produzione/06-ramificazione.md`.

## 1. Le zone

| Zona | | Luoghi | Chi parla (nodi di dialogo) | Opzioni | con effetti | condizionate |
|---|---|---:|---|---:|---:|---:|
| storia | l'avventura (file principale) | 0 | — | 0 | 0 | 0 |
| sistemi | il corpo e le scorte | 0 | — | 0 | 0 | 0 |
| Z1 | Acquaviva | 5 | Nunzio 5 | 13 | 3 | 3 |
| Z2 | la piana | 5 | Saverio 4 | 5 | 1 | 1 |
| Z3 | l'invaso | 7 | Iole 7, Rocco 3 | 15 | 2 | 2 |
| Z4 | la statale | 6 | Vito 8 | 7 | 3 | 4 |
| Z5 | il paese | 7 | Rosaria 8, Concetta 4, Pasquale 2, Peppe 5, Ciro 4 | 40 | 14 | 14 |
| Z6 | le colline | 6 | Onofrio 10, Tore 4 | 23 | 5 | 7 |
| Z7 | il guado | 3 | Cosimo 5 | 5 | 0 | 2 |

## 2. Le variabili: dove si scrivono, dove si leggono

Una variabile che si legge solo nella zona in cui si scrive è **memoria locale**: la
scelta si spegne lì. Una che si legge più avanti è una **conseguenza a distanza**.

| Variabile | Nasce | Si scrive in | Si legge in | Portata |
|---|---|---|---|---|
| acqua | storia | sistemi (5), Z1 (3), Z2 (2), Z3 (4), Z4 (1), Z5 (8), Z6 (2) | sistemi (7), Z1 (3), Z2 (2), Z3 (3), Z4 (1), Z5 (2), Z6 (1) | scorta (ovunque) |
| cibo | storia | sistemi (3), Z1 (1), Z2 (12), Z3 (1), Z5 (7), Z6 (1) | sistemi (5), Z1 (1), Z2 (6), Z3 (1), Z5 (2) | scorta (ovunque) |
| fame | storia | sistemi (3), Z1 (1), Z2 (1), Z5 (2), Z6 (1) | sistemi (13) | scorta (ovunque) |
| sete | storia | sistemi (3), Z2 (1), Z3 (4), Z5 (1), Z6 (1) | sistemi (14) | scorta (ovunque) |
| vita | storia | sistemi (3), Z2 (2), Z3 (1), Z4 (3), Z5 (1) | sistemi (5), Z4 (1) | scorta (ovunque) |
| stato della gola | sistemi | sistemi (1) | sistemi (3) | locale |
| stato della pancia | sistemi | sistemi (1) | sistemi (3) | locale |
| fiducia di saverio | Z2 | Z2 (1) | Z2 (3) | locale |
| stato del cane | Z2 | Z2 (6) | Z2 (17) | locale |
| stato del crinale | Z2 | Z2 (1) | Z2 (1) | locale |
| stato del pozzo | Z2 | Z2 (1) | Z2 (4) | locale |
| vita del cane | Z2 | Z2 (2) | Z2 (1) | locale |
| fiducia di iole | Z3 | Z3 (2) | Z3 (3) | locale |
| stato della condotta | Z3 | Z3 (1) | Z3 (1) | locale |
| stato della pompa | Z3 | Z3 (2) | Z3 (6) | locale |
| fiducia di vito | Z4 | Z4 (4) | Z4 (4) | locale |
| stato del casello | Z4 | Z4 (5) | Z4 (9) | locale |
| stato della discesa | Z4 | Z4 (1) | Z4 (1) | locale |
| stato della grata | Z4 | Z4 (1) | Z4 (2) | locale |
| stato di vito | Z4 | Z4 (7) | Z4 (3) | locale |
| vita di vito | Z4 | Z4 (3) | Z4 (10) | locale |
| fiducia di rosaria | Z5 | Z5 (2) | Z5 (5) | locale |
| stato del permesso | Z5 | Z5 (1) | Z5 (2) | locale |
| stato dell'accoglienza | Z5 | Z5 (1) | Z5 (1) | locale |
| stato della salita | Z5 | Z5 (1) | Z5 (1) | locale |
| stato della tappa di peppe | Z5 | Z5 (1), Z6 (1), Z7 (1) | Z6 (1), Z7 (1) | **a distanza** |
| stato di pasquale | Z5 | Z5 (1) | Z5 (6) | locale |
| stato di peppe | Z5 | Z5 (3), Z7 (1) | Z5 (11), Z6 (1), Z7 (4) | **a distanza** |
| fiducia di onofrio | Z6 | Z6 (2) | Z6 (6) | locale |
| stato del lascito | Z6 | Z6 (2) | Z6 (6) | locale |
| stato di cosimo | Z7 | Z7 (2) | Z7 (21) | locale |

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
| damigiana | Z3 (casotto) | sistemi, Z3 | — |  |
| filtro | Z3 (relitto) | Z3 | Z3 |  |
| occhiali | Z3 (relitto) | Z3 | — |  |
| pastiglie | Z3 (casotto) | Z3 | Z3 |  |
| benzina | Z4 (area di servizio) | Z4, Z5 | Z4, Z5 | **a distanza** |
| cartucce | Z4 (piazzola) | Z5 | Z5 | **a distanza** |
| chiave inglese | Z4 (area di servizio) | Z4 | — |  |
| giubbotto | Z4 (piazzola) | Z5, Z6 | Z5 | **a distanza** |
| lasciapassare | Z4 (—) | Z5 | Z5 | **a distanza** |
| medicine | Z4 (area di servizio) | Z4, Z5 | Z4, Z5 | **a distanza** |
| pistola | Z4 (piazzola) | Z4 | — |  |
| stecca | Z4 (piazzola) | Z4, Z5 | Z4, Z5 | **a distanza** |
| anello | Z5 (cortile) | Z5, Z7 | Z5 | **a distanza** |
| giocattolo | Z5 (cortile) | Z6, Z7 | — | **a distanza** |
| coperta | Z6 (cappella) | Z6 | — |  |
| fucile | Z6 (—) | Z6, Z7 | — | **a distanza** |
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

- Variabili dichiarate: 31 (di cui 5 scorte del corpo).
- **Conseguenze a distanza** (variabili lette in una zona successiva): 2.
  - `stato della tappa di peppe`: nasce in Z5, torna in Z6, Z7.
  - `stato di peppe`: nasce in Z5, torna in Z6, Z7.
- **Cose che contano lontano da dove nascono**: 15 — coltello, orologio, batteria, borsa, cristalli, benzina, cartucce, giubbotto, lasciapassare, medicine, stecca, anello, giocattolo, fucile, lettera.
- **Variabili mai lette** (stato fantasma): 0 — —.
