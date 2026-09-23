# Versioni del Viaggiatore

Regole con cui il gioco cambia numero. Lo strumento che le applica è
`strumenti/versione.mjs`; la CI le verifica a ogni push.

## 1. Tre numeri, tre cose diverse

| Cosa | Dove | Forma | Chi la decide |
|---|---|---|---|
| **Il gioco** | `versione.json` → `gioco` | SemVer 2.0.0: `MAJOR.MINOR.PATCH[-pre]` | questo documento |
| **Il motore FAVELLA** | `motore/strutture.py` → `VERSIONE_MOTORE` | SemVer, del motore | il repository del motore |
| **Il formato dei salvataggi** | `versione.json` → `formatoSalvataggi` | intero, 1, 2, 3… | cresce solo se i file cambiano in modo incompatibile |

`versione.json` è l'**unica fonte di verità**: `app/package.json`,
`desktop/package.json` e i loro lockfile devono dire la stessa versione, e il tag
di una release è `v` + quella versione. La build aggiunge l'**identità**: commit
e data (`app/vite.config.ts` → costante `__VERSIONE__`), che il gioco mostra in
basso a destra nel menu (`v1.2.0 · a1b2c3d`) e scrive in ogni salvataggio.

## 2. Che cosa è «incompatibile» per un gioco

SemVer parla di API pubblica. Per il Viaggiatore l'API pubblica è ciò su cui il
giocatore fa affidamento fra una versione e l'altra: **i suoi salvataggi** e
**la storia che ha cominciato**.

### MAJOR (2.0.0) — si rompe un patto col giocatore
- un salvataggio di prima **non si può più caricare** (nuovo `formatoSalvataggi`
  senza migrazione);
- la storia viene **ristrutturata**: zone tolte o riordinate, finali riscritti
  nel senso, meccaniche centrali cambiate (per esempio via la sete);
- la versione minima del sistema operativo o il modo di installare cambiano.

### MINOR (1.1.0) — si aggiunge, senza rompere
- contenuti nuovi: luoghi, personaggi, dialoghi, un finale in più;
- funzioni nuove dell'app (un pannello, un'opzione, una lingua);
- un nuovo motore FAVELLA *minor* (nuove frasi del linguaggio);
- ribilanciamenti che cambiano **l'esito** di sequenze già giocate: i salvataggi
  si rigiocano (vedi §3), quindi un salvataggio vecchio si carica ma può
  arrivare in uno stato diverso. Il gioco lo dice al caricamento.

### PATCH (1.0.1) — si corregge
- errori di gioco, di testo, di impaginazione, refusi;
- correzioni che non cambiano l'esito di nessuna sequenza di comandi sensata;
- sicurezza, prestazioni, pacchetti.

In dubbio fra due livelli, si sceglie il più alto.

## 3. I salvataggi come contratto

Un salvataggio contiene la **sequenza effettiva dei comandi** e l'**impronta**
dello stato (SHA-256 di luogo, turno, variabili, oggetti, demoni, stato del
generatore casuale). Caricare vuol dire rigiocare e confrontare l'impronta
(`app/src/lib/ponte.py`, collaudato da `collaudo/salvataggi.py`).

- **Stessa avventura e stesso motore** (impronta dell'avventura uguale): il
  caricamento deve dare un'impronta **identica**. Se no è un difetto, non una
  scelta di versione.
- **Avventura cambiata**: il salvataggio si rigioca sulla nuova versione e il
  gioco avvisa che la partita è stata ricostruita. È il caso MINOR del §2.
- **`formatoSalvataggi`** cresce quando cambia la *struttura del file*. Chi
  legge un formato più vecchio lo migra in `valida()`
  (`app/src/lib/salvataggi.ts`); un formato più nuovo viene rifiutato con un
  messaggio che chiede di aggiornare il gioco. Un formato che non si migra è MAJOR.

## 4. Pre-release

Le versioni di prova hanno un'etichetta e un numero:

| Etichetta | Vuol dire |
|---|---|
| `alpha.N` | incompleta, può cambiare tutto |
| `beta.N` | completa nelle funzioni, in collaudo |
| `rc.N` | candidata: se non emergono problemi diventa la versione |

L'ordine è quello di SemVer §11:
`1.1.0-alpha.1 < 1.1.0-beta.1 < 1.1.0-beta.2 < 1.1.0-rc.1 < 1.1.0`.
Una pre-release esce su GitHub come *pre-release*, e l'aggiornamento automatico
la propone solo a chi ne usa già una.

## 5. Commit

Messaggi nel formato **Conventional Commits**, in italiano:

```
tipo(ambito): cosa cambia, al presente

Perché, se non è ovvio.
```

- **tipi**: `feat` (funzione nuova), `fix` (correzione), `docs`, `test`,
  `refactor`, `perf`, `build`, `ci`, `chore` (manutenzione, versioni)
- **ambiti**: `gioco` (i .fav), `motore`, `app`, `desktop`, `salvataggi`,
  `collaudo`, `versioni`, `grafica`, `pre-produzione`
- un cambiamento incompatibile porta `!` dopo l'ambito e una riga
  `INCOMPATIBILE: …` nel corpo

Il tipo suggerisce il livello: `feat` → MINOR, `fix` → PATCH, `!` → MAJOR.
Decide comunque il §2.

## 6. CHANGELOG

`CHANGELOG.md` segue *Keep a Changelog*. In cima c'è sempre
`## [Non rilasciato]`, dove si annota ogni modifica mentre la si fa, con le
sezioni **Aggiunto**, **Cambiato**, **Corretto**, **Rimosso**, **Sicurezza**.
Al rilascio lo strumento chiude la sezione con numero e data; le sue righe
diventano le note della release.

## 7. Come si rilascia

```bash
node strumenti/versione.mjs prepara minor            # o major, patch
node strumenti/versione.mjs prepara minor --pre beta # 1.1.0-beta.1
node strumenti/versione.mjs prepara pre              # beta.1 → beta.2
cd collaudo && python finali.py && python mirate.py && python salvataggi.py
git commit -am "chore(versioni): 1.1.0" && git push
```

Poi, su GitHub: **Actions → Rilascio → Run workflow**. Il rilascio è sempre una
scelta manuale: i push non pubblicano mai niente. Il workflow rifiuta di partire
se le versioni non sono coerenti, se manca la sezione del CHANGELOG o se il tag
esiste già; rifà il collaudo, costruisce e autoverifica i pacchetti, crea tag e
release. Da quel momento l'installer Windows e l'AppImage Linux già installati
si aggiornano da soli.

Altri comandi: `node strumenti/versione.mjs mostra` (le tre versioni),
`verifica` (coerenza), `note X.Y.Z` (le note di una versione).
