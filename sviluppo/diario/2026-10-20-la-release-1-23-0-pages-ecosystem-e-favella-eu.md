---
data: 2026-10-20
ora: "20:51"
titolo: "La release 1.23.0, Pages, Ecosystem e Favella.eu"
tipo: sessione
versione: 1.23.0
---

# La release 1.23.0, Pages, Ecosystem e Favella.eu

## In breve
Su ordine di Simone il Viaggiatore doppiato è uscito ovunque: la release pubblica v1.23.0 («Latest»), la versione web su GitHub Pages, la scheda sul sito Ecosystem e la prova sul sito di FAVELLA (favella.eu), tutte con il doppiaggio in evidenza e le licenze delle voci.

## Contesto
Simone ha ascoltato la 1.23.0 nel gioco desktop («funzionava tutto») e ha chiesto: aggiornare la pagina del Viaggiatore su Ecosystem con le novità e le licenze, evidenziando il doppiaggio; pubblicare su GitHub Pages; sostituire su favella.eu la versione del gioco con questa, con licenze, doppiaggio e una notizia; commit, push, verifica di locale e git su tutti i progetti, deploy dei siti e release.

## Lavoro fatto
- **Release.** Workflow «Rilascio» come bozza (run 39472794194): verifica della versione, collaudo, pacchetti Windows e Linux costruiti e autoverificati, release creata. Verificati in locale: lo SHA-512 di `latest.yml` e `latest-linux.yml` uguale a quello dei file scaricati; il portatile scaricato con `--autoverifica` (salvataggi in una cartella temporanea) esce con 0. Le note raccolgono 1.19.0 – 1.23.0 con un «In breve» sul doppiaggio e sulle licenze; titolo «Il Viaggiatore 1.23.0 — il racconto ha una voce»; pubblicata come «Latest». Descrizione del repository aggiornata (doppiata per intero, dalla 1.23.0).
- **GitHub Pages.** Workflow «Pagine» (run 39475343596) riuscito; `voce/indice.json` e `voce/elevenlabs/indice.json` rispondono 200.
- **Ecosystem** (`Pitz72/Ecosystem-Runtime`, sito 0.24.7, commit `4d9082e`): la scheda era ferma alla 1.14.0. Ora 1.23.0, sottotitolo «…e doppiata per intero», capitoli nuovi «La voce» e «Licenze e crediti», l'apertura col cartello, F2, il progetto concluso con la storia delle versioni, `doppiaggio/` e i dodici collaudi, caratteristiche e specifiche col doppiaggio, i download della 1.23.0; italiano e inglese. Build, audit, caricamento (138 file), tolte le 10 schermate orfane di Titan della 0.24.6 (regola del server pulito), audit a zero, push; pagine IT ed EN verificate dal vivo.
- **Favella.eu** (repository FAVELLA1, `landingpage/`, sito 2.10.0, commit `d7807eb` e `f56627a`): `/esperimento` è l'app della 1.23.0 (tranne `favellaRuntime.ts`, coi tre adattamenti del sito, invariato nel gioco dalla 1.14.0); la voce in `esperimento/pubblico/voce/`, servita sotto `/esperimento/voce/` (la build dell'esperimento ora ha una sua cartella pubblica; in sviluppo un middleware); la storia della galleria alla 1.23.0; il carattere del biglietto in `public/fonts/`; la notizia «Il Viaggiatore 1.23: il racconto ha una voce» in evidenza; il banner della Galleria con «doppiato per intero», la riga sulla voce e le licenze; la privacy con le preferenze della voce. Test del sito di FAVELLA1 (copie del motore, elenchi dei moduli), 53 checkpoint, la storia compila col motore di FAVELLA1; provata nel browser l'anteprima della build: il cartello, il trailer con la sua voce, la partita con la voce (indice, `elevenlabs/`, le quattro parti della stazione), nessun errore. Il push di 15 MB è caduto due volte per la rete; riuscito sull'hotspot di Simone (`git -c http.version=HTTP/1.1 -c http.postBuffer=524288000 push`). **Il deploy FTPS si è interrotto a metà** (`ECONNRESET`: sull'hotspot la connessione cade ogni cento file circa) e `scripts/deploy.mjs` ricarica tutto da capo senza riprovare: l'ho completato con uno script a riprese fuori dal repository (stesse credenziali e stessa libreria; l'audio solo se manca o ha un'altra dimensione, il resto sempre, le pagine HTML per ultime, ricollegamento automatico): 605 file audio caricati e 277 già presenti, 118 altri file, 14 pagine; sei ricollegamenti.

## Decisioni
- **Le note della release raccolgono 1.19.0 – 1.23.0** — come la 1.18.2 aveva raccolto le versioni senza release.
- **Su favella.eu la voce sta dentro l'esperimento, non presa da GitHub Pages** — il sito resta autosufficiente e la CSP non cambia; costa 15 MB in più nel repository e a ogni caricamento.
- **La notizia del doppiaggio è in evidenza** sul sito di FAVELLA (la prima con enfasi primaria) — Simone ha chiesto di evidenziarlo.

## Verifiche
- Release: 7 file, SHA-512 corrispondenti, portatile autoverificato (codice 0), «Latest».
- Pages: le due cartelle della voce rispondono.
- Ecosystem dal vivo: `/it/` e `/en/multimedia/il-viaggiatore-favella/` 200, con 1.23.0, «La voce»/«The voice», elevenlabs.io.
- Favella.eu dal vivo: `/esperimento/` è «1.23.0 · motore 1.5.0 · f56627a»; `voce/indice.json`, `voce/elevenlabs/indice.json`, `trailer.opus`, una parte e il carattere del biglietto rispondono 200; la Galleria dice «doppiato per intero» ed elevenlabs.io; gli aggiornamenti hanno «il racconto ha una voce». Nel browser, sul sito vero (con la CSP di Aruba): cartello, avviso, trailer con la sua voce, partita con la voce (indice, cartella ElevenLabs, le quattro parti della stazione), nessun errore in console.

## Questioni aperte
- Per FAVELLA1: rendere `landingpage/scripts/deploy.mjs` capace di riprendere (oggi ricarica tutto e si ferma al primo errore di rete): lo script di ripresa usato stasera è un buon punto di partenza.
- Le schermate della scheda su Ecosystem sono ancora quelle della 1.14 (senza «♪ voce»): nuove immagini solo con l'ok di Simone.
