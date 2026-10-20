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
Il gioco si apre con i loghi animati (e sonori) di Runtime Multimedia e di FAVELLA 1, un avviso e un trailer di 88 secondi con la sua colonna sonora originale.

> **Che cos'è questo progetto.** Questo gioco, nato come demo del linguaggio di
> programmazione e motore di narrativa interattiva Favella1, è stato generato con un
> importante ausilio dei modelli LLM della famiglia Claude. Lo scopo è mostrare in che
> modo, tramite design e programmazione, uno script narrativo Favella1 possa diventare un
> gioco distribuibile.

> **Il Viaggiatore è concluso.** La storia è definitiva dalla 1.12.0; la versione **1.14.0** porta
> dentro il motore FAVELLA 1.5.0 e i nuovi loghi d'apertura, e l'app e i collaudi restano come sono. Il repository resta aperto, con le sue licenze (MIT per il codice,
> CC BY-SA 4.0 per storia, testi, musica e grafica): per **studiare** come una storia lunga diventa
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
loghi e il trailer (e chiude l'avviso, come Invio), **F11** commuta lo schermo intero, **F5** salva, **F9**
carica, **«esci»** nel menu (o Alt+F4) chiude. Gli eseguibili non sono firmati:
Windows SmartScreen può chiedere una conferma.

**Salvataggi.** Sei posti più uno automatico, che si scrive a ogni cambio di
luogo; dal menu, «Continua il viaggio» riprende il più recente. Sono file
`.viaggiatore` in *Documenti/Il Viaggiatore/Salvataggi*, JSON leggibile: si
esportano, si importano, si copiano su un altro computer. Un salvataggio non
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
| `app/` | l'app React: loghi animati, trailer (canvas procedurale + colonna sonora), gioco, guida «come si gioca» |
| `desktop/` | il guscio Electron per Windows e Linux |
| `collaudo/` | gli undici collaudi automatici: i nove finali, le prove mirate, i salvataggi, le scorte, il ponte dell'interfaccia, i fili del viaggio, le giocate, il testo, le conferme, i pulsanti, l'esploratore |
| `pre-produzione/` | i documenti di progetto: visione, sistemi, mappa, oggetti, personaggi, ramificazione |
| `grafica/` | l'icona (SVG), il banner del README e gli script che rasterizzano l'icona |
| `sviluppo/` | le regole delle versioni e il diario di sviluppo |
| `strumenti/` | gli strumenti delle versioni, del diario e della mappa narrativa |

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
npm run autoverifica      # avvia il gioco vero, gioca qualche comando, esce con 0 o 1
npm run pacchetto:win     # oppure pacchetto:linux
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
python esploratore.py   # 100 partite a caso che cercano i punti in cui il gioco si rompe
```

Sono undici ([che cosa fa ciascuno](collaudo/LEGGIMI.md)); `testo.py`, `conferme.py` e `pulsanti.py`
servono `npm ci --prefix app`. La CI li esegue tutti: l'esploratore in un giro corto (`-n 5 -t 150`) che non
blocca, il giro intero (qualche minuto) si lancia a mano. Del processo principale desktop e della data delle
versioni, che non hanno bisogno di Electron, si occupano `node desktop/prove.cjs` e `node strumenti/prova-data.mjs`.

La CI ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) a ogni push verifica
le versioni e il diario, esegue il collaudo, costruisce i pacchetti Windows e Linux e
li **autoverifica**: avvia il gioco dentro il pacchetto appena costruito, gioca,
salva e ricarica. Non pubblica niente.

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
- **Storia, testi, colonna sonora, icona e grafica**: [CC BY-SA 4.0](LICENSE-CONTENUTI.md).

### Componenti di terze parti

| Componente | Licenza | Dove |
|---|---|---|
| [Pyodide](https://github.com/pyodide/pyodide) 0.27.8 | MPL-2.0 | copiato da npm in `app/public/pyodide/` durante la build |
| [Lark](https://github.com/lark-parser/lark) 1.3.1 | MIT | `app/vendor/` |
| [React](https://react.dev) | MIT | dipendenza npm |
| [Electron](https://www.electronjs.org) | MIT | dipendenza npm della versione desktop |
| [electron-updater](https://github.com/electron-userland/electron-builder) | MIT | dipendenza npm della versione desktop |
| Font Inter, Lora, Sora, Source Code Pro | SIL Open Font License 1.1 | `app/public/fonts/` (`OFL.txt`) |

I loghi di **Runtime Multimedia** e di **FAVELLA 1** mostrati all'avvio sono marchi dei
rispettivi titolari, esclusi da entrambe le licenze (vedi `LICENSE-CONTENUTI.md`); il codice
che li anima è MIT come il resto.

## Autore

Simone Pizzi ([@Pitz72](https://github.com/Pitz72)). Il Viaggiatore è un esperimento
in FAVELLA 1: un gioco completo scritto nel linguaggio, per metterlo alla prova.
