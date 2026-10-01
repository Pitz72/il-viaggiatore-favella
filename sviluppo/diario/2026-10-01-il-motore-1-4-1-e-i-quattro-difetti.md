---
data: 2026-10-01
ora: "09:28"
titolo: "Il motore 1.4.1 e i quattro difetti"
tipo: sessione
versione: 1.10.1
---

# Il motore 1.4.1 e i quattro difetti

## In breve
I quattro difetti che il gioco aveva trovato nel motore sono corretti in FAVELLA1 (1.4.1, working tree, non committata) e la copia in `motore/` è aggiornata. La storia ora compila senza avvisi.

## Contesto
Dai prossimi passi (punto 8): una mossa verso un'uscita che non c'è fa passare un turno; posare ristampa la stanza; l'avviso su «colpisci» dice il verbo sbagliato e non si può togliere; `accendi su` solleva un errore interno. Prima si erano annotati in `SYNC.md` di FAVELLA1, adesso si correggono là, con i test, e si ricopia. FAVELLA1 non si committa né si pubblica senza un ordine: le modifiche restano nel working tree.

## Lavoro fatto
In FAVELLA1:
- **La mossa senza uscita** (`libreria_azioni.py`, `gioco.py`): «Non puoi andare in quella direzione.» segna il turno come libero (`_turno_libero`), come un comando non capito dalla 1.3.0. Vale anche per i movimenti impliciti (`sali`, `entra`). Non entra nella sequenza salvabile né in ANNULLA. Le regole d'autore `Invece di vai …` non cambiano.
- **La posa** (`gioco.py`): `lasciare` entra in `_SENZA_RISTAMPA`. Era l'unica azione che ristampava la stanza.
- **La direzione come cosa** (`libreria_azioni.py`): il parser riconosce «su», «nord»… e li passa come «oggetto»; `trova_oggetto` restituisce `None` e `_ha` sollevava. Ora `apri`, `chiudi`, `accendi`, `spegni`, `mangia`, `bevi` controllano e dicono «Non vedi nulla del genere qui.», come `esamina`.
- **L'avviso e `(voluto)`** (`compilatore.py`): l'avviso dice che cosa faceva la parola («è l'azione 'colpire'» se il suo primo nome è lei stessa, «fa come 'prendi'» altrimenti) e come dichiarare che è voluto. Nuova forma facoltativa **`"colpisci" è come attacca (voluto).`**: vale come prima, senza avviso, anche se il comando d'autore è dichiarato dopo. «voluto» è una parola solo dopo la parentesi: nessun nome di storia cambia.
- **Versione 1.4.1**, `CHANGELOG`, la spec (`grammatica-1.4.0.md` §24 e l'EBNF), 4 test nuovi (18 controlli), le copie del sito risincronizzate. La nota in `SYNC.md` ora dice «risolte».

Nel gioco:
- `motore/` ricopiato byte per byte (CRLF compreso), con `LEGGIMI.md` aggiornato: dichiara 1.4.1 e che è in preparazione.
- `"colpisci" è come attacca (voluto).` in `il-viaggiatore.fav`: nessun avviso.
- `giocate.py`: 6 prove nuove, una per ogni difetto, più una che la storia compila senza avvisi (e che ne darebbe uno senza il marcatore).

## Decisioni
- **Libero, non punito** — perché una mossa sbagliata è un errore di digitazione o di orientamento, non un'azione nel mondo: costare sete in un gioco di sopravvivenza era una trappola. Un comando che non riesce *dopo* aver capito (aprire ciò che non si apre) resta un turno: lì il personaggio ci prova.
- **«Lascia» senza ristampa** — invece di ristampare solo se serve: la sola frase basta, e «guarda» mostra la cosa posata. Al buio nessuna differenza che non fosse già presente.
- **La direzione dopo un verbo: «Non vedi nulla del genere qui.»** e non «Non vedo 'su' qui.» (gratuito) — perché è il messaggio che `esamina` e `prendi` danno già per la stessa parola: uniformare i verbi che sollevavano agli altri, senza cambiare gli altri.
- **`(voluto)` come marcatore, non un'opzione di compilazione** — perché dice l'intenzione dove l'autore la prende, nella frase; un'opzione globale spegnerebbe anche gli avvisi che servono.
- **Nessun commit né rilascio in FAVELLA1** — perché è regola del progetto: serve un ordine esplicito. Il gioco, che ha copiato la 1.4.1, non deve uscire in una release prima che la 1.4.1 sia pubblicata là.

## Verifiche
FAVELLA1: `test_linguaggio.py` 1115 passati, 0 falliti (prima 1097 e 0); `pytest` 417; `valida_checkpoint.py` 53/53. Gioco: compilazione senza avvisi (era uno); tutti i collaudi verdi con il motore nuovo; `giocate.py` 40 prove.

## Questioni aperte
- **Prima di rilasciare il gioco**: committare e rilasciare FAVELLA1 1.4.1 (CHANGELOG, tag, PyPI se si vuole), poi eventualmente aggiornare il sito. La copia nel gioco la dichiara già.
- «Non vedi nulla del genere qui.» costa ancora un turno quando la parola è una direzione (come `esamina nord`): è la stessa incoerenza della mossa senza uscita, in un angolo più raro. Si può rendere libero nella stessa passata, se si vuole.
- La documentazione PDF del manuale in FAVELLA1 non è rigenerata (`documentazione/` ha i `.md` aggiornati).
