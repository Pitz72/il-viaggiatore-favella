---
data: 2026-11-01
ora: "16:47"
titolo: "La pagina del gioco su GitHub Pages"
tipo: sessione
versione: 1.41.1
---

# La pagina del gioco su GitHub Pages

## In breve
GitHub Pages ha ora una pagina di presentazione del gioco, in italiano e in inglese, con i quattro download dell'ultima release e il gioco nel browser in `gioca/`, costruito da quella stessa release; il workflow «Rilascio» la rifà a ogni versione. Prima a quell'indirizzo c'era soltanto il gioco, fermo alla 1.23.0.

## Contesto
Durante il rilascio della 1.41.1 Simone ha chiesto che cosa c'era su Pages: direttamente il gioco, alla 1.23.0, solo in italiano ([Il rilascio 1.41.1](2026-11-01-il-rilascio-1-41-1.md)). La scelta della 1.40.0 (il gioco solo da scaricare) era legata al gioco finito; Simone: «Il gioco doveva essere finito per questo quella decisione. Ora puoi costruire pagina di presentazione su Pages con pulsanti di tutti i download e il gioco nel browser da portarle ad ultima versione». Al questionario ha scelto le quattro consigliate: la presentazione alla radice e il gioco in `/gioca/`; italiano e inglese con un interruttore; l'aggiornamento da solo a ogni rilascio; e tutti i contenuti proposti (schermate, numeri e caratteristiche, crediti, link a favella.eu ed Ecosystem).

## Lavoro fatto
- **La pagina** (`pagine/index.html`, `stile.css`, `pagina.js`): il banner, l'incipit e la descrizione, i pulsanti «Scarica» e «Gioca nel browser», la storia (il biglietto, le sette tappe), quattro schermate con la lente, i numeri (7 tappe, 39 luoghi, 14 personaggi, 6 finali) e sei caratteristiche, i quattro download con peso e nome del file, il gioco nel browser, il progetto (l'avviso dell'autore), i crediti, i link. Ogni testo c'è nelle due lingue; la pagina parte da quella del browser e la ricorda. Su Windows e Linux il pulsante in apertura scarica direttamente il file del proprio sistema (l'installer, l'AppImage), che nell'elenco è evidenziato; su un telefono resta l'elenco. Caratteri, favicon e immagini si prendono dal gioco (`gioca/fonts/`) e da `grafica/` (il banner, l'anteprima social): niente copie in più nel repository.
- **Lo strumento che monta il sito** (`strumenti/pagine.mjs`): la versione, la data e i quattro download vengono dall'API delle release; l'avviso (`TESTO_AVVISO`, letto col parser di TypeScript senza eseguire il componente) e i titoli di coda (`finale/crediti.ts`, con la canzone solo se c'è il suo file, come nel gioco) dai sorgenti della release; si ferma se il gioco costruito non è la versione della release, se manca un file, o se resta un segnaposto. Svuota la cartella d'uscita solo se l'ha montata lui.
- **Le schermate** (`strumenti/schermate.cjs`, `pagine/schermate/`, otto JPEG 1600 × 900, da 54 a 139 kB): una finestra Electron fuori schermo sul server di sviluppo gioca le parole del collaudo e fotografa la casa con la mappa appena presa, Nunzio al bar, la mappa al pozzo e la conferma del cibo a Saverio, in italiano e in inglese.
- **Il workflow «Pagine»** (`.github/workflows/pagine.yml`, riscritto): legge l'ultima release, fa il checkout del suo tag in `gioco/`, costruisce il gioco, monta il sito con la presentazione di `main`, tiene lo zip per itch.io e pubblica. Si lancia a mano o lo richiama `rilascio.yml` (job «Pagine», dopo la release, non per una bozza).
- **Nel gioco**: in inglese le virgolette della conferma e di «si dice di te» erano caporali italiani (lo si è visto nella schermata): ora sono quelle inglesi, scelte dal CSS con `:lang(en)` (`gioco/gioco.css`). È un testo d'interfaccia, non detto.
- **La verifica dell'inglese** della pagina, con la skill `verifica-traduzione`: la scansione non trova tic (0 trattini lunghi, 0 americanismi, 0 falsi amici); la lettura voce per voce sì: un errore di senso («when you raise your hands», che in inglese è arrendersi: ora «when you raise a hand to someone», come «raise your hands to people» nel gioco) e otto calchi o ritocchi corretti nella bozza («a south» → «a southern land», «every choice weighs» → «carries weight», «a few tens of MB» → «a few dozen MB», «Save like in any game» → «Save as in any game», «a quick save on F5 and F9» → «quick save and load on F5 and F9», e altri). Le frasi del gioco riprese nella pagina (trailer, biglietto, avviso) non sono state toccate.
- **I documenti**: README (torna «Gioca nel browser», con la pagina), CHANGELOG («Non rilasciato»), `CLAUDE.md`, `PROSSIMI-PASSI.md`.

## Decisioni
- **Il gioco nel browser dal tag della release, la presentazione da `main`** — perché nel browser si gioca la stessa versione che si scarica, mentre un ritocco alla pagina non deve aspettare una release.
- **L'aspetto del gioco** (fondo scuro, Lora, Sora, Source Code Pro, gli accenti del tramonto della key art) — scelta mia, non chiesta: è il linguaggio del gioco e della key art. Si dichiara qui.
- **I testi nuovi della pagina** (descrizioni delle caratteristiche, didascalie, note sui download) li ho scritti io dal README, dal gioco e dal trailer; quelli che il gioco ha già (il trailer, il biglietto, l'avviso, i crediti) vengono da lì, parola per parola.

## Verifiche
- Il sito montato in locale dalla release v1.41.1 (85,9 MB, quattro download) e guardato nel browser integrato su un server di prova: le due lingue (l'interruttore, la memoria, nessun testo dell'altra lingua visibile), la lente sulle schermate (Esc la chiude), il pulsante del proprio sistema («Scarica per Windows · 181 MB»), su telefono (375 px) niente scorrimento orizzontale, nessun errore in console. Trovati e corretti lì: il pulsante «EN» nascosto dal CSS delle lingue, il banner non a tutta larghezza, l'incipit sopra il fondo del banner, le sezioni di lettura non allineate a sinistra.
- Il gioco nella sottocartella, con Electron fuori schermo (il riquadro del browser nascosto ferma le animazioni dell'intro): in inglese, motore pronto in 6 s, «The station», voce inglese servita, nessun errore.
- I workflow letti come YAML (job, dipendenze, permessi).
- **La pubblicazione**: commit `7bab2e9`, workflow «Pagine» lanciato a mano (run 41323181424): «Presentazione e gioco» 59 s, «Pubblica» 12 s, verde. Online: la pagina (200, «Versione 1.41.1 · 1 novembre 2026»), i quattro download della v1.41.1 (200 tutti e quattro), `gioca/` con il gioco della 1.41.1 (letto nel codice pubblicato), i caratteri, le schermate, la voce inglese e il motore (200). Una partita vera nel gioco pubblicato, con Electron fuori schermo: in inglese, «The station» in 12 s, nessun errore. La pagina pubblicata guardata nel browser integrato.

## Questioni aperte
- **favella.eu ed Ecosystem** dicono ancora che il gioco è solo da scaricare: potrebbero rimandare alla pagina nuova. Sono altri repository: solo se Simone lo chiede.
- **Nel gioco**, la domanda della conferma di una violenza senza bersaglio dice in inglese «Do you really want to raise your hands?» (`gioco/traduci.ts`), che si può leggere come arrendersi; da decidere con Simone se cambiarla (per esempio «Do you really want to raise a hand to someone?»).
