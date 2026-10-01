---
data: 2026-10-01
ora: "10:51"
titolo: "La versione definitiva e l'avviso d'apertura"
tipo: sessione
versione: 1.11.0
---

# La versione definitiva e l'avviso d'apertura

## In breve
Un avviso all'apertura (dopo i loghi, prima del trailer) dice che cos'è questo progetto; poi la 1.11.0, che l'autore ha dichiarato la versione definitiva del gioco e che raccoglie tutto ciò che mancava dalla v1.7.0.

## Contesto
Decisioni finali dell'autore: (1) un avviso che dica che il gioco è nato come demo di Favella1 ed è stato generato con l'ausilio dei modelli Claude; (2) commit, push e rilascio, come versione definitiva; (3) tutto ciò che riguarda FAVELLA1 (commit, rilascio, sito, sincronizzazione de *Il Viaggiatore* nel sito) resta a una sessione sua, a parte. Ultima release pubblicata prima di questa: v1.7.0.

## Lavoro fatto
- **L'avviso** (`app/src/components/Avviso.tsx`, `App.tsx`): una quarta fase, «avviso», fra «loghi» e «trailer». Il testo è quello dell'autore, con un solo ritocco (il refuso «desgin» → «design»); «Buon divertimento.» sta a sé, in corsivo. Compare a ogni avvio, anche con «riduci movimento»; non quando dal gioco si torna all'intro. Si chiude con Invio, Spazio, Esc, un clic o il pulsante «continua»; da solo dopo venti secondi (il testo, a voce normale, ne richiede circa venti: dodici avrebbero tolto il tempo di leggerlo). Visto nel browser: la schermata, e Invio che porta al trailer, senza errori in console.
- **`collaudo/testo.py`**: il testo dell'avviso è custodito parola per parola, e la fase è fra i loghi e il trailer.
- **README**: la frase «Che cos'è questo progetto» e il percorso di avvio (loghi, avviso, trailer).
- **`motore/LEGGIMI.md`**: tolta la nota «non ancora rilasciata» sulla 1.4.1: rimanda al repository del motore come fonte, senza dire cosa non è ancora successo. Quella sessione, quando rilascerà FAVELLA1, non dovrà correggerla.
- **CHANGELOG 1.11.0**: l'avviso, e un riepilogo delle versioni 1.8.0–1.10.2, che non erano mai uscite: la pagina della release racconta tutto, non solo l'ultimo ritocco.

## Decisioni
- **1.11.0, non 2.0.0** — perché una schermata nuova è una funzione nuova e «definitiva» non è «incompatibile»: i salvataggi dei giocatori restano validi. L'autore ha confermato (scrivendo «1.11.10», letto come 1.11.0, la versione proposta).
- **Venti secondi, non dodici** — vedi sopra: è la durata di lettura. Il pulsante e i tasti non obbligano ad aspettarli.
- **Una release unica** — perché le versioni intermedie non sono mai state pubblicate: l'utente che aggiorna dalla v1.7.0 trova un solo salto, con il riepilogo.
- **Niente tocco a FAVELLA1 e al sito** — su decisione dell'autore. Il gioco porta con sé il motore 1.4.1 in `motore/`, già verificato con i test del motore.

## Verifiche
Compilazione senza avvisi; tutti i collaudi verdi; exe costruito e autoverificato; vedi il rilascio per l'esito del workflow.

## Questioni aperte
- **Sessione FAVELLA1**: commit già fatto in locale (`12614b5`), restano push, tag v1.4.1, eventuale PyPI, sito, sincronizzazione de *Il Viaggiatore* nella galleria del sito (richiede almeno il motore 1.1.0: oggi 1.4.1).
- **Il playtest esterno** resta il passo che nessun collaudo automatico sostituisce.
