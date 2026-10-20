# Strumenti

| File | Cosa fa |
|---|---|
| `versione.mjs` | le versioni del gioco (regole in `sviluppo/VERSIONI.md`): `mostra`, `verifica`, `prepara`, `note` |
| `diario.mjs` | il diario di sviluppo: `nuovo "Titolo"`, `indice`, `verifica` |
| `mappa-narrativa.py` | la memoria della storia ricavata dai `.fav` → `sviluppo/mappa-narrativa.md` |
| `doppiaggio.py` | i testi da doppiare, ricavati dai `.fav`: `stato` (parti, parole e minuti per voce), `blocchi [--voce servizio]` (scrive `doppiaggio/blocchi/` e `doppiaggio/manifest.json`: un blocco per voce su tutto il gioco), `da-fare` (ciò che manca, pronto da generare); vedi `doppiaggio/LEGGIMI.md` |
| `doppiaggio-riconosci.py` | dice a quale blocco corrisponde ogni WAV scaricato da AI Studio o da ElevenLabs |
| `doppiaggio-taglia.py` | taglia il WAV di un blocco nelle sue parti (faster-whisper, allineamento, silenzi) e le controlla una per una: `python strumenti/doppiaggio-taglia.py narratore-a 104.wav --controlla` |
| `doppiaggio-banco.py` | **il banco della voce**: dalle parti tagliate ai file del gioco (`app/public/voce/<id>.opus` e `indice.json`): silenzi ai bordi tolti, ogni blocco a −23 LUFS, Opus mono 32 kbit/s, deterministico; le voci da non distribuire in `voce/locale/` (ignorata da git); `--misura` per la sola loudness |
| `doppiaggio-trailer.py` | **la voce del trailer**: mette le frasi di Enzo nelle loro finestre (pause interne accorciate, al massimo +10% di velocità, «tuo FRATELLO.» a 64,0 s e il titolo a 82,3) e scrive una traccia sola, `app/public/voce/trailer.opus` con `trailer.json`; `--prova` per la sola scaletta |
| `esporta-trailer.cjs` | esporta il trailer in `video/*.mp4` (1080p e 720p) dal trailer vero, con Electron e ffmpeg, col suono vero (musica, rumori e voce, da `trailer-mix.cjs`; `--senza-voce` per toglierla): `desktop/node_modules/.bin/electron strumenti/esporta-trailer.cjs` (server di sviluppo su 5200) |
| `trailer-mix.cjs` | il suono del trailer reso offline come nell'app (intro.mp3, i rumori, la voce con la musica che le scende sotto): lo usano `esporta-trailer.cjs` e `trailer-rumori.cjs` |
| `esporta-loghi.cjs` | esporta i due loghi d'apertura in video 4K a 60 fps col loro suono (la stessa partitura del gioco, resa offline): `desktop/node_modules/.bin/electron strumenti/esporta-loghi.cjs [cartella]` (server di sviluppo su 5200; `--prova` per mezzo secondo) |
| `trailer-cattura.cjs` | **il banco del trailer, 1/3**: cattura PNG del trailer a istanti scelti (l'insieme canonico di 40 a 1080p, i 7 ★ a 4K) in un Electron fuori schermo e **deterministico** (due catture dello stesso istante sono uguali al bit): `desktop/node_modules/.bin/electron strumenti/trailer-cattura.cjs --uscita collaudo/esiti/prima` (server di sviluppo su 5200; `--densita 2` per 4K, `--tetto 3840` per la tela del 4K pieno, `--tempi 16.5,64.5`, `--libero` per giudicare la grana) |
| `trailer-preload-determinista.js` | il preload del banco: `Math.random` con seme fisso, grana nascosta, animazioni CSS ferme (non fa parte dell'app) |
| `trailer-confronta.mjs` | **il banco del trailer, 2/3**: confronta due cartelle di catture con il PSNR (`inf` = identico) e, con `--tavola`, scrive tavole «prima \| dopo \| differenza»: `node strumenti/trailer-confronta.mjs collaudo/esiti/prima collaudo/esiti/dopo` |
| `trailer-misura.cjs` | **il banco del trailer, 3/3**: il costo di un fotogramma (mediana e p95, in ms) a 17 istanti, via `__trailer.prova` e sincronia WebGL: `desktop/node_modules/.bin/electron strumenti/trailer-misura.cjs --densita 1` |
| `trailer-clip.cjs` | un breve video del trailer con la sua musica, per i confronti prima/dopo in movimento: `desktop/node_modules/.bin/electron strumenti/trailer-clip.cjs --da 26 --a 36 --uscita video/clip.mp4` (server di sviluppo su 5200) |
| `trailer-rumori.cjs` | i rumori del trailer (passi, carta, tasti, soffi, timbro) con la musica sotto e la voce di Enzo, resi offline in un WAV per ascoltare un «prima» e un «dopo»: `desktop/node_modules/.bin/electron strumenti/trailer-rumori.cjs --da 17.6 --a 25.2 --uscita video/rumori.wav` (`--senza-voce` per toglierla) |
| `trailer-preparazione.cjs` | quanto ci mette a prepararsi ogni scena del trailer (le tele dipinte una volta sola, «a freddo», con i loghi sopra): `desktop/node_modules/.bin/electron strumenti/trailer-preparazione.cjs --giri 3` (server di sviluppo su 5200; stampa le mediane per scena) |
| `trailer-calibra.cjs` | prova la scelta della larghezza della tela come la farebbe il giocatore (su uno schermo 4K il trailer prova 3840 e 3200 px sulle inquadrature più pesanti e tiene la prima che costa meno di 14 ms): `desktop/node_modules/.bin/electron strumenti/trailer-calibra.cjs --densita 2 --giri 3` (server di sviluppo su 5200) |
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
