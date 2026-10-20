<p align="center">
  <img src="grafica/banner.jpg" width="100%" alt="Il Viaggiatore">
</p>

<p align="center">
  Un'avventura testuale di sopravvivenza e cammino, scritta in <a href="https://github.com/Pitz72/FAVELLA1">FAVELLA 1</a>:<br>
  si scrive in italiano come nelle avventure classiche, o si gioca a clic, con le uscite, le cose e le risposte a portata di mano.<br>
  Un uomo torna a piedi a casa attraverso un sud rimasto senz'acqua.
</p>

<p align="center">
  <a href="https://pitz72.github.io/il-viaggiatore-favella/"><b>▶ GIOCA ORA NEL BROWSER</b></a>
  &nbsp;·&nbsp;
  <a href="https://github.com/Pitz72/il-viaggiatore-favella/releases/latest">scarica per Windows e Linux</a>
</p>

<p align="center">
  <b>QUESTO PROGETTO È CONCLUSO.</b><br>
  Il sorgente è aperto: si può studiare, e chi ama FAVELLA 1 è libero di estenderlo o di farne una propria versione.
</p>

---

Le lettere di tua moglie hanno smesso di arrivare. L'ultimo biglietto, in stampatello e
senza firma, dice soltanto: «Non è il caso di tornare.» Torni lo stesso.

**7 zone · 39 luoghi · 14 personaggi · 6 finali.** Si gioca scrivendo in italiano
(`bevi`, `parla con Rosaria`, `usa la lettera su Cosimo`), o toccando le uscite, le
cose e le risposte. La sete è la spina dorsale, l'acqua è la moneta, le scelte pesano.
Il gioco si apre con i loghi animati (e sonori) di Runtime Multimedia e di FAVELLA 1, il cartello delle licenze e dei crediti, un avviso e un trailer di 88 secondi con la sua colonna sonora originale.
**Il racconto ha una voce:** è doppiato per intero con la sintesi vocale (il narratore, i personaggi, i suggerimenti e il
trailer, circa un'ora di parlato); si ascolta con la *voce recitata*, oppure si lascia leggere al proprio lettore di schermo.

> **Che cos'è questo progetto.** Questo gioco, nato come demo del linguaggio di
> programmazione e motore di narrativa interattiva Favella1, è stato generato con un
> importante ausilio dei modelli LLM della famiglia Claude. Lo scopo è mostrare in che
> modo, tramite design e programmazione, uno script narrativo Favella1 possa diventare un
> gioco distribuibile.

> **Il Viaggiatore è concluso.** La storia è definitiva dalla 1.12.0 e il motore è FAVELLA 1.5.0 dalla 1.14.0; dalla
> 1.19.0 alla 1.23.0 il gioco ha avuto il **doppiaggio** (la storia e le regole non cambiano). Il repository resta aperto,
> con le sue licenze (MIT per il codice, CC BY-SA 4.0 per storia, testi, musica, voci e grafica, con le eccezioni dette in
> [Licenze](#licenze)): per **studiare** come una storia lunga diventa
> un gioco in FAVELLA 1 e, per chi ama FAVELLA 1, per **estenderlo**: nuove zone, nuovi personaggi,
> nuovi finali, o un'altra storia sullo stesso impianto. Le partite salvate e l'aggiornamento
> automatico continuano a funzionare finché le release restano su GitHub.

## Scaricare e giocare

**Subito, senza scaricare niente:** [gioca nel browser](https://pitz72.github.io/il-viaggiatore-favella/)
(Chrome, Edge, Firefox; le partite salvate restano nel tuo browser). Oppure scarica la versione desktop.

Dalla pagina [Releases](https://github.com/Pitz72/il-viaggiatore-favella/releases):

| Sistema | File |
|---|---|
| Windows, con installazione | `Il-Viaggiatore-<versione>-win-x64.exe` |
| Windows, senza installazione | `Il-Viaggiatore-<versione>-portable.exe` |
| Linux, qualunque distribuzione | `Il-Viaggiatore-<versione>-linux-x86_64.AppImage` |
| Linux, Debian/Ubuntu/Mint | `Il-Viaggiatore-<versione>-linux-amd64.deb` |

Il gioco parte a schermo intero e funziona senza connessione. **Esc** salta i
loghi e il trailer (e chiude il cartello dei crediti e l'avviso, come Invio). Il **menu d'avvio** è una colonna di voci
(continua, nuovo viaggio, carica, opzioni, come si gioca, rivedi il trailer, esci) che si sceglie con le frecce e Invio o
col mouse. In partita **Esc** apre la **pausa** (riprendi, salva, carica, opzioni, come si gioca, menu d'avvio, esci),
**F11** commuta lo schermo intero, **F5** salva al volo e **F9** ricarica quel salvataggio rapido; Alt+F4 chiude. Gli eseguibili non sono firmati:
Windows SmartScreen può chiedere una conferma.

**La voce.** Con la *voce recitata* (com'è all'inizio) il gioco legge ogni testo con le voci del doppiaggio: un tasto
qualunque la ferma (il testo resta), **F2** ridice l'ultimo testo, e le risposte di un dialogo le legge il narratore
quando ci passi sopra col mouse o le raggiungi con la tastiera. Nelle **opzioni** («⚙ opzioni», nel menu d'avvio e in
alto nella partita) si sceglie fra voce recitata e *lettore di schermo* (nessuna voce del gioco: il diario si annuncia al
tuo lettore). Con la voce recitata anche il trailer ha la voce del narratore, e la musica gli scende sotto.

**Le opzioni.** Schermo intero o finestra; i volumi (generale, musica, voce, effetti), che cambiano dal vivo; stereo o
mono; il silenzio quando il gioco non è in primo piano. Valgono subito e restano; «ripristina le opzioni di base» torna
alle scelte del primo avvio.

**Salvataggi.** Il taccuino (dalla testata, dalla pausa o dal menu) tiene quanti salvataggi si vuole, ciascuno col suo
nome, una miniatura del paesaggio, il luogo, il tempo di gioco, il corpo e le scorte; si caricano, si riscrivono, si
rinominano, si esportano, si eliminano, anche solo da tastiera. **F5** salva al volo in un posto rapido, **F9** lo
ricarica; tre salvataggi automatici si scrivono a turno a ogni cambio di luogo e quando si lascia la partita. Dal menu,
«Continua il viaggio» riprende il più recente. Sono file `.viaggiatore` in *Documenti/Il Viaggiatore/Salvataggi*, JSON
leggibile: si esportano, si importano, si copiano su un altro computer; quelli delle versioni di prima si aprono. Un salvataggio non
fotografa il mondo: registra la sequenza effettiva dei comandi e un'impronta
SHA-256 dello stato, e al caricamento il motore la rigioca e verifica che lo
stato sia **identico**. Così anche ANNULLA funziona dopo un caricamento, e un
salvataggio sopravvive agli aggiornamenti del gioco.

**Aggiornamenti.** L'installer Windows e l'AppImage Linux si aggiornano da soli
dalle release di GitHub: la nuova versione si scarica in silenzio e si installa
alla chiusura (o subito, con «riavvia ora»). La versione portatile e il .deb si
aggiornano scaricando la nuova release.

**Se qualcosa non va**, il registro tecnico è in
`%APPDATA%\Il Viaggiatore\logs\viaggiatore.log` (Windows) o
`~/.config/Il Viaggiatore/logs/viaggiatore.log` (Linux): allegalo alla
segnalazione, insieme alla versione che trovi in basso a destra nel menu.

## Sicurezza

**Gli eseguibili non sono firmati**, e l'aggiornamento automatico (installer Windows e AppImage) scarica e
installa la versione nuova dalle release di GitHub: la fiducia sta tutta nell'account GitHub che le pubblica.
Chi lo controllasse potrebbe far girare codice suo su ogni copia installata. Sta scritto qui perché è giusto saperlo.

**Che cosa protegge.** Il download passa da HTTPS e l'aggiornatore confronta lo SHA-512 del file con quello
di `latest.yml` (un file rovinato o troncato non si installa); una release nasce solo dal workflow «Rilascio», a mano,
dopo collaudo e autoverifica. Il gioco in sé è chiuso: finestra isolata e senza Node, nessuna navigazione fuori
dall'app, ogni canale con il processo principale controlla chi lo chiama, le fuse di Electron sono spente (niente
`ELECTRON_RUN_AS_NODE`, `NODE_OPTIONS`, `--inspect`), e un salvataggio non contiene codice (sono comandi che il
motore rigioca). **Che cosa non protegge.** Lo SHA-512 sta nella stessa release del file: dimostra che il file è
quello dichiarato, non che sia fidato; non c'è un'identità dell'editore (Windows SmartScreen lo segnala); e gli
strumenti di build hanno ancora qualche avviso `npm audit` che si chiude solo cambiando electron-builder.

**Come si verifica un pacchetto** scaricato: lo SHA-512 in base 64 dev'essere quello di `latest.yml` (o
`latest-linux.yml`), allegato alla stessa release. Meglio ancora, confrontalo con una copia di `latest.yml` presa
altrove o in un altro momento.

```powershell
# Windows
[Convert]::ToBase64String([Security.Cryptography.SHA512]::Create().ComputeHash([IO.File]::ReadAllBytes("Il-Viaggiatore-<versione>-win-x64.exe")))
```
```bash
# Linux
openssl dgst -sha512 -binary Il-Viaggiatore-<versione>-linux-x86_64.AppImage | base64 -w0
```

**Che cosa si può fare** (non è stato fatto): la **firma del codice** (un certificato Authenticode per Windows: l'aggiornatore
verificherebbe anche l'editore) oppure **spegnere l'aggiornamento automatico** e lasciare solo il download manuale, con
gli hash nelle note della release; in più l'autenticazione a due fattori sull'account e le attestazioni di provenienza
di GitHub per i pacchetti.

## Com'è fatto

| Cartella | Cosa contiene |
|---|---|
| `prototipo/` | **l'avventura**: `il-viaggiatore.fav` (radice) + `sistemi.fav` + le sette zone `z1…z7` |
| `motore/` | il motore FAVELLA 1.5.0 (Python), vedi `motore/LEGGIMI.md` |
| `app/` | l'app React: loghi animati, licenze e crediti, avviso, trailer (canvas procedurale + colonna sonora + voce), gioco, guida «come si gioca»; in `app/public/voce/` la voce del doppiaggio, un file Opus per parte |
| `doppiaggio/` | il doppiaggio: i testi per le voci ricavati dai `.fav`, il manifest delle parti, le voci scelte, il resoconto del banco; vedi `doppiaggio/LEGGIMI.md` |
| `desktop/` | il guscio Electron per Windows e Linux |
| `collaudo/` | i dodici collaudi automatici: i nove finali, le prove mirate, i salvataggi, le scorte, il ponte dell'interfaccia, i fili del viaggio, le giocate, il testo, le conferme, i pulsanti, la voce del doppiaggio, l'esploratore |
| `pre-produzione/` | i documenti di progetto: visione, sistemi, mappa, oggetti, personaggi, ramificazione |
| `grafica/` | l'icona (SVG), il banner del README e gli script che rasterizzano l'icona |
| `sviluppo/` | le regole delle versioni e il diario di sviluppo |
| `strumenti/` | gli strumenti delle versioni, del diario, della mappa narrativa, del trailer e del doppiaggio ([elenco](strumenti/LEGGIMI.md)) |

Il motore è quello vero, in Python: nell'app gira dentro il browser con
[Pyodide](https://pyodide.org) (WebAssembly), incluso nel progetto insieme a
[Lark](https://github.com/lark-parser/lark). Niente server e niente rete.

**Motore e infrastruttura.** FAVELLA è il linguaggio per *scrivere* avventure; l'app è
ciò che le rende *visibili*. Nel motore entra solo ciò che serve a qualunque autore
(per esempio il *posto iniziale* degli oggetti, `Il posto della mappa è "…".`, nato da
questo gioco nella 1.1.0). Il resto, compreso il ponte che dà all'interfaccia uscite,
presenze e dialoghi (`fav_stato` in `app/src/lib/favellaRuntime.ts`), resta nell'app.

## Sviluppo

Servono Node.js 22 e Python 3.10+ con `lark`.

```bash
# giocare nel terminale
pip install lark==1.3.1
python motore/favella.py gioca prototipo/il-viaggiatore.fav

# l'app nel browser (http://localhost:5200)
npm ci --prefix app
npm run dev --prefix app

# la versione desktop
npm ci --prefix desktop
cd desktop
node prepara.mjs          # costruisce l'app e la copia in desktop/web
npm run avvia             # apre il gioco in Electron
npm run autoverifica      # avvia il gioco vero, gioca qualche comando, prova la voce, esce con 0 o 1
npm run pacchetto:win     # oppure pacchetto:linux

# il doppiaggio (serve ffmpeg; i WAV generati stanno in doppiaggio/master/, fuori da git)
python strumenti/doppiaggio.py stato          # le parti da doppiare, per voce
python strumenti/doppiaggio-banco.py          # dalle parti tagliate ai file Opus del gioco
python strumenti/doppiaggio-trailer.py        # la traccia della voce del trailer
```

`npm run dev` e `npm run build` copiano motore, avventura e Pyodide dentro
`app/public/` (`app/scripts/sincronizza.mjs`): quelle copie non si modificano a mano.

## Collaudo

```bash
cd collaudo
python finali.py        # una partita per ognuno dei 9 finali (6 di storia + 3 morti)
python mirate.py        # 10 situazioni precise da non rompere
python salvataggi.py    # salva, ricarica, pretende lo stesso stato e le stesse risposte
python scorte.py        # bere e mangiare, con tutti i loro sinonimi e le dosi
python interfaccia.py   # il ponte dell'app: anteprime, azioni, stato per i pulsanti
python fili.py          # i fili del viaggio (sangue, generosità) e chi se ne ricorda
python giocate.py       # ciò che hanno trovato le partite giocate a mano
python testo.py         # il testo del motore e della storia come lo distingue l'interfaccia
python conferme.py      # quali scelte chiedono conferma
python pulsanti.py      # i sei finali giocati senza tastiera, coi soli pulsanti
python doppiaggio.py    # ogni testo che il gioco dice ha la sua voce, e il trailer la sua traccia
python esploratore.py   # 100 partite a caso che cercano i punti in cui il gioco si rompe
```

Sono dodici ([che cosa fa ciascuno](collaudo/LEGGIMI.md)); `testo.py`, `conferme.py`, `pulsanti.py` e
`doppiaggio.py` servono `npm ci --prefix app`. La CI li esegue tutti: l'esploratore in un giro corto (`-n 5 -t 150`) che non
blocca, il giro intero (qualche minuto) si lancia a mano. Del processo principale desktop e della data delle
versioni, che non hanno bisogno di Electron, si occupano `node desktop/prove.cjs` e `node strumenti/prova-data.mjs`.

La CI ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) a ogni push verifica
le versioni e il diario, esegue il collaudo, costruisce i pacchetti Windows e Linux e
li **autoverifica**: avvia il gioco dentro il pacchetto appena costruito, gioca,
salva e ricarica, e prova la voce (una parte per ogni voce, la traccia del trailer). Non pubblica niente.

## Versioni, diario, rilascio

- **Versioni**: SemVer 2.0.0 da un'unica fonte, `versione.json`; che cosa è
  major, minor o patch per questo gioco (i salvataggi sono il contratto) è scritto
  in [`sviluppo/VERSIONI.md`](sviluppo/VERSIONI.md). Strumento:
  `node strumenti/versione.mjs mostra | verifica | prepara | note`.
- **Registro delle modifiche**: [`CHANGELOG.md`](CHANGELOG.md), in formato Keep a Changelog.
- **Diario di sviluppo**: [`sviluppo/DIARIO.md`](sviluppo/DIARIO.md), una voce per
  sessione, decisione o problema, col perché delle scelte.
  `node strumenti/diario.mjs nuovo "Titolo" --tipo decisione`.
- **Mappa narrativa**: `python strumenti/mappa-narrativa.py` rilegge i `.fav` e scrive
  [`sviluppo/mappa-narrativa.md`](sviluppo/mappa-narrativa.md): quali variabili e quali cose
  portano una scelta da una zona all'altra, e da che cosa dipende ogni finale.
- **Rilascio**: sempre una scelta manuale. Si prepara la versione
  (`node strumenti/versione.mjs prepara minor`), si fa commit e push, poi su GitHub
  **Actions → Rilascio → Run workflow**: verifica, collaudo, pacchetti
  autoverificati, tag e release con i file per l'aggiornamento automatico.

## Licenze

- **Codice** (app, desktop, collaudo, script): [MIT](LICENSE).
- **Motore FAVELLA 1** (`motore/`): MIT, © Simone (Pitz72), [motore/LICENSE](motore/LICENSE).
- **Storia, testi, colonna sonora, voci del doppiaggio, icona e grafica**: [CC BY-SA 4.0](LICENSE-CONTENUTI.md), tranne
  le voci di Imma, Rosaria, Tore e Vito (qui sotto).
- **Le voci di Imma, Rosaria, Tore e Vito** (`app/public/voce/elevenlabs/`): fatte con [ElevenLabs](https://elevenlabs.io)
  sul piano gratuito, **escluse dalla licenza libera** e **solo per uso non commerciale**; chi fa un'opera derivata o un
  uso commerciale del gioco deve toglierle o sostituirle.

### Le voci

Il doppiaggio è fatto con la sintesi vocale, a partire dai testi del gioco:

| Chi | Servizio | Voce |
|---|---|---|
| il narratore (anche le scelte del giocatore e il trailer) | Google Gemini 3.8 Flash TTS | Enzo |
| la voce di servizio (suggerimenti, numeri delle scorte) | Google Gemini 3.8 Flash TTS | Kira |
| Nunzio, Saverio, Iole, Rocco, Peppe, Ciro, Pasquale, Concetta, Onofrio, Cosimo | Google Gemini 3.8 Flash TTS | voci della libreria di AI Studio |
| Imma, Rosaria, Tore, Vito | ElevenLabs Eleven v4 · elevenlabs.io | Victoria, Valeria, Criss, Luigi: generate sul piano gratuito, distribuite **fuori dalla licenza libera, solo per uso non commerciale** (scelta dell'autore, che ne accetta il rischio) |

Google non rivendica la proprietà dell'audio generato, che però non è esclusivo; ogni clip porta la filigrana SynthID,
che non si sente. Le stesse indicazioni sono nel gioco, nel cartello delle licenze e dei crediti che segue i loghi.
Chi è stato generato come, e quando, sta in `doppiaggio/voci-scelte.md`; il progetto del doppiaggio in
[`pre-produzione/08-doppiaggio-tts.md`](pre-produzione/08-doppiaggio-tts.md).

### Componenti di terze parti

| Componente | Licenza | Dove |
|---|---|---|
| [Pyodide](https://github.com/pyodide/pyodide) 0.27.8 | MPL-2.0 | copiato da npm in `app/public/pyodide/` durante la build |
| [Lark](https://github.com/lark-parser/lark) 1.3.1 | MIT | `app/vendor/` |
| [React](https://react.dev) | MIT | dipendenza npm |
| [Electron](https://www.electronjs.org) | MIT | dipendenza npm della versione desktop |
| [electron-updater](https://github.com/electron-userland/electron-builder) | MIT | dipendenza npm della versione desktop |
| Font Inter, Lora, Sora, Source Code Pro, Covered By Your Grace | SIL Open Font License 1.1 | `app/public/fonts/` (`OFL.txt`) |

I loghi di **Runtime Multimedia** e di **FAVELLA 1** mostrati all'avvio sono marchi dei
rispettivi titolari, esclusi da entrambe le licenze (vedi `LICENSE-CONTENUTI.md`); il codice
che li anima è MIT come il resto.

## Autore

Simone Pizzi ([@Pitz72](https://github.com/Pitz72)). Il Viaggiatore è un esperimento
in FAVELLA 1: un gioco completo scritto nel linguaggio, per metterlo alla prova.
