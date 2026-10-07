# Strumenti

| File | Cosa fa |
|---|---|
| `versione.mjs` | le versioni del gioco (regole in `sviluppo/VERSIONI.md`): `mostra`, `verifica`, `prepara`, `note` |
| `diario.mjs` | il diario di sviluppo: `nuovo "Titolo"`, `indice`, `verifica` |
| `mappa-narrativa.py` | la memoria della storia ricavata dai `.fav` → `sviluppo/mappa-narrativa.md` |
| `esporta-trailer.cjs` | esporta il trailer in `video/*.mp4` (1080p e 720p) dal trailer vero, con Electron e ffmpeg: `desktop/node_modules/.bin/electron strumenti/esporta-trailer.cjs` (server di sviluppo su 5200) |
| `gioca.py` | **il banco di gioco**: giocare a mano, e misurare l'equilibrio (qui sotto) |

## Il banco di gioco (`gioca.py`)

I collaudi dicono se qualcosa si rompe; non dicono se il gioco *funziona* per chi lo
gioca. Il banco serve a leggere le risposte come un giocatore e a misurare quanto
costa la strada. Pilota il **ponte vero dell'app** (`app/src/lib/ponte.py`): gli
stessi «mangia» e «bere» soli, le stesse azioni offerte ai pulsanti. Non scrive
niente nel gioco; il diario va in `collaudo/esiti/` (non versionata).

### Giocare a mano

Un file di comandi, uno per riga, rigiocato ogni volta da capo (è veloce: meno di un
secondo). Si aggiungono righe in fondo man mano che si capisce dove si è.

```text
# partita.txt — le righe vuote e quelle con # si saltano
@B_cavallo          # i comandi di un percorso di collaudo/percorsi.py
:scena              # a questo punto: uscite, presenze, bisaccia, azioni offerte
esamina il cane
attacca il cane
```

```bash
python strumenti/gioca.py partita.txt            # ultimi 6 turni, poi la scena
python strumenti/gioca.py partita.txt -n 15      # gli ultimi 15
python strumenti/gioca.py partita.txt --tutto    # tutta la partita
python strumenti/gioca.py partita.txt --seme 3   # un altro caso, riproducibile
python strumenti/gioca.py partita.txt --diario d.md
```

Sotto ogni risposta c'è la riga
`[turno · luogo · vita sete fame · acqua cibo · sangue generosità]`. In fondo:
`Uscite`, `Presenze`, `Bisaccia` (con la capienza), `Azioni` (ciò che `fav_azioni`
farebbe comparire come pulsante: i gesti d'autore e i bersagli; le combinazioni «usa X
su Y» non si offrono, si compongono), e il riepilogo (comandi, turno, esito, vita minima, il finale se c'è).
Le risposte di un dialogo si scrivono per intero, per un pezzo del testo, o col numero.
Il banco non beve né mangia da solo: se non lo scrivi, la partita lo sconta, com'è giusto.

Il diario (`collaudo/esiti/gioca-diario.md`, o dove dice `--diario`) ha tutta la
partita, non solo gli ultimi turni.

### Misurare l'equilibrio

Un pilota rigioca un percorso su più semi, **bevendo e mangiando solo alle soglie
date** (mai nel mezzo di un dialogo), e riassume come arrivano i giocatori che
ascoltano il corpo in modi diversi.

```bash
python strumenti/gioca.py --pilota                       # B_cavallo, i 4 modi del 1° ottobre, 12 semi
python strumenti/gioca.py --pilota -p H_veglia -s 6,7 -s 9,11 --semi 20
python strumenti/gioca.py --pilota -p partita.txt        # anche un file di comandi
python strumenti/gioca.py --pilota -s 6,7 --dettaglio    # scorte luogo per luogo
```

`-s SETE,FAME` è un modo di giocare (ripetibile): beve quando la sete è almeno quella,
mangia quando la fame è almeno quella. Per ogni modo: quante partite arrivano a un
finale di storia, la vita minima (media, e la peggiore), la vita alla fine, il cibo
minimo, i turni a cibo 0 e i turni da feriti, la generosità e il sangue alla fine.
`--dettaglio` aggiunge, per ogni luogo nell'ordine in cui lo si incontra, le scorte più
basse e i bisogni più alti: **dove si ha paura** (cibo basso con fame alta), e dove no.

Lo stesso percorso, con gli stessi semi, dà gli stessi numeri del pilota di
`collaudo/finali.py` (lo verifica `collaudo/giocate.py`).
