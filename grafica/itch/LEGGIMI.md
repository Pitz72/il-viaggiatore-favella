# Il Viaggiatore — la pagina su itch.io

La scheda della pagina del gioco su itch.io: che cosa va in ogni campo e da dove viene. La pagina la crea e la pubblica
Simone dal suo account; questa cartella tiene i materiali e le scelte, perché la prossima volta non si riparta da zero.

**Decisioni di Simone (1° novembre 2026):** su itch.io i **pacchetti da scaricare** e, nella descrizione, il **collegamento
al gioco nel browser su GitHub Pages**; **nessun pagamento**; pagina in **italiano e inglese**; lasciata in **bozza**, la
pubblica lui.

**Perché il gioco nel browser non sta su itch.io:** itch.io accetta giochi HTML5 con al massimo **1.000 file** nello zip
(500 MB estratti, 200 MB per file; <https://itch.io/docs/creators/html5>), e il nostro ne ha circa **1.840** (1.731 sono le
parti doppiate di `app/public/voce/`). Lo zip `Il-Viaggiatore-web.zip` del workflow «Pagine» quindi non passa. Le strade,
se un giorno lo si vuole anche lì: chiedere a itch.io di alzare il limite (dal loro supporto), o riunire le voci in pochi
archivi (lavoro sul gioco, nuova versione).

**Perché nessun pagamento:** le voci dei personaggi (ElevenLabs) sono «solo uso non commerciale»; donazioni o prezzo
potrebbero contare come uso commerciale (non è una consulenza legale; vedi `sviluppo/PROSSIMI-PASSI.md`).

## I file di questa cartella

| File | Misura | Dove va su itch.io |
|---|---|---|
| `copertina-630x500.jpg` | 630 × 500 | *Cover image* (la misura consigliata da itch.io), dal 4:3 della key art |
| `banner-960x411.jpg` | 960 × 411 | *Edit theme* → *Banner*, dal 21:9 della key art |
| `descrizione.html` | — | si apre nel browser, Ctrl+A, Ctrl+C, e si incolla in *Description* |

Le immagini vengono da `grafica/branding/` (CC BY-SA 4.0, con i marchi dei rispettivi titolari), ritagliate al centro e
ridotte con Pillow. Le schermate sono quelle di `pagine/schermate/` (1600 × 900, italiano `-it` e inglese `-en`).

## I campi

| Campo | Valore |
|---|---|
| *Title* | Il Viaggiatore (il titolo non si traduce) |
| *Project URL* | `il-viaggiatore` (l'indirizzo diventa `<account>.itch.io/il-viaggiatore`) |
| *Short description or tagline* | Un uomo torna a casa. A piedi. · A man returns home. On foot. |
| *Classification* | Games |
| *Kind of project* | Downloadable |
| *Release status* | Released |
| *Pricing* | No payments |
| *Uploads* | i quattro pacchetti dell'ultima release (sotto) |
| *Description* | `descrizione.html` |
| *Genre* | Interactive Fiction |
| *Tags* | interactive-fiction, text-adventure, text-based, parser, survival, narrative, story-rich, multiple-endings, voice-acting, italian |
| *AI generation disclosure* | sì: il gioco dichiara nei crediti che testi, codice, immagini, musiche e voci sono fatti con modelli generativi |
| *Community* | Comments |
| *Visibility & access* | Draft (la pubblica Simone) |
| *Cover image* | `copertina-630x500.jpg` |
| *Gameplay video or trailer* | nessuno per ora: itch.io accetta solo YouTube o Vimeo, e il trailer non è pubblicato lì |
| *Screenshots* | da `pagine/schermate/` |

**I pacchetti** (release `v1.41.1`), ognuno col suo sistema:

| File | Sistema | Nome da mostrare |
|---|---|---|
| `Il-Viaggiatore-1.41.1-win-x64.exe` | Windows | Windows (installer) |
| `Il-Viaggiatore-1.41.1-portable.exe` | Windows | Windows (portatile · portable) |
| `Il-Viaggiatore-1.41.1-linux-x86_64.AppImage` | Linux | Linux (AppImage) |
| `Il-Viaggiatore-1.41.1-linux-amd64.deb` | Linux | Linux (.deb) |

Non vanno caricati il `.blockmap` né i `latest*.yml`, che servono solo all'aggiornamento automatico da GitHub. L'installer
e l'AppImage scaricati da itch.io si aggiornano comunque da GitHub, come quelli della release. A ogni nuova versione i
pacchetti su itch.io vanno sostituiti a mano.

**Metadati** (in fondo alla pagina di modifica): piattaforme Windows e Linux; lingue italiano e inglese; ingressi tastiera
e mouse; accessibilità: alto contrasto e sottotitoli (il testo accompagna sempre la voce); collegamenti: la pagina su GitHub
Pages, il codice su GitHub, favella.eu.

**Tema** (*Edit theme*), coi colori della pagina su GitHub Pages (`pagine/stile.css`): fondo `#0c0a0e`, fondo dei
riquadri `#15111a`, testo `#ece5d8`, collegamenti e pulsanti `#f2b46d`.
