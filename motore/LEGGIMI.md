# Motore FAVELLA 1 — copia del progetto

Versione **1.1.0** (23/09/2026), copiata dal repository del motore,
[Pitz72/FAVELLA1](https://github.com/Pitz72/FAVELLA1) (licenza MIT, vedi `LICENSE`
in questa cartella). Quella resta la fonte: qui non si modifica niente a mano.

> La 1.1.0 (il *posto iniziale* degli oggetti, `Il posto della X è "…".`) è nata per
> questo gioco ed è qui in anteprima: nel repository del motore arriverà col suo
> prossimo rilascio. Se il motore va cambiato, lo si cambia là (con i suoi test) e
si ricopia.

| File | Ruolo |
|---|---|
| `compilatore.py` | grammatica LALR (Lark) e compilazione dei `.fav` |
| `strutture.py` | il mondo: stanze, oggetti, regole, contatori (`VERSIONE_MOTORE`) |
| `gioco.py` | l'interprete: `mostra_stanza`, `elabora_comando` |
| `libreria_azioni.py` | i verbi di base (prendi, lascia, esamina, vai…) |
| `favella_utils.py` | utilità di testo e di nomi |
| `collaudo.py` | il collaudatore statico (`favella.py collaudo`) |
| `favella.py` | la riga di comando: `compila`, `gioca`, `collaudo` |

Dipendenza esterna: `lark` (`pip install lark`). I comandi `libreria` e `galleria`
di `favella.py` non funzionano da qui, perché cercano il pacchetto `favella1` del
repository: al gioco non servono.

## Ricopiare dopo un aggiornamento del motore

```bash
M=../FAVELLA1   # dove hai clonato https://github.com/Pitz72/FAVELLA1
for f in compilatore gioco strutture libreria_azioni favella_utils collaudo favella; do
  cp "$M/$f.py" motore/
done
```

Poi, dalla radice del progetto: `python collaudo/finali.py` e `python collaudo/mirate.py`,
e `npm run build` in `app/` (che ricopia il motore nella public dell'app).
